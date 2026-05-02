/**
 * 部署 Composable - 封装网站发布相关逻辑
 * 功能: 触发 GitHub Actions 构建部署、状态轮询、历史记录查询
 */

export interface DeployLog {
  id: string
  owner: string
  repo: string
  workflow_id: string
  run_id: number | null
  status: 'pending' | 'in_progress' | 'success' | 'failed' | 'cancelled'
  message: string | null
  commit_sha: string | null
  started_at: string
  finished_at: string | null
  created_at: string
  html_url?: string
  conclusion?: string
}

export interface DeployResult {
  success: boolean
  message: string
  run_id?: number
  run_number?: number
  status?: string
  html_url?: string
}

export const useDeploy = () => {
  const deploying = ref(false)
  const polling = ref(false)
  const currentDeploy = ref<DeployLog | null>(null)
  const deployHistory = ref<DeployLog[]>([])
  const lastResult = ref<DeployResult | null>(null)

  let pollingTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * 获取用户 token
   */
  async function getUserToken(): Promise<string | null> {
    const supabase = useSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  /**
   * 调用 Edge Function
   */
  async function callEdgeFunction(body: any): Promise<any> {
    const token = await getUserToken()
    if (!token) {
      throw new Error('请先登录后再操作')
    }

    const response = await fetch('https://ksfefrrvqvksrglprbyu.supabase.co/functions/v1/trigger-deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || '调用接口失败')
    }
    return data
  }

  /**
   * 触发网站发布
   */
  async function triggerDeploy(options?: {
    owner?: string
    repo?: string
    workflow_id?: string
    ref?: string
  }) {
    deploying.value = true
    lastResult.value = null
    currentDeploy.value = null

    try {
      const config = {
        owner: options?.owner || 'wumacms',
        repo: options?.repo || 'berry-medical-web',
        workflow_id: options?.workflow_id || 'deploy.yml',
        ref: options?.ref || 'main',
      }

      const result = await callEdgeFunction(config)

      if (result.success) {
        lastResult.value = {
          success: true,
          message: result.message,
          run_id: result.run_id,
          run_number: result.run_number,
          status: result.status,
          html_url: result.html_url,
        }

        // 如果有 run_id，开始轮询状态
        if (result.run_id) {
          currentDeploy.value = {
            id: '',
            owner: config.owner,
            repo: config.repo,
            workflow_id: config.workflow_id,
            run_id: result.run_id,
            status: 'pending',
            message: result.message,
            commit_sha: null,
            started_at: new Date().toISOString(),
            finished_at: null,
            created_at: new Date().toISOString(),
            html_url: result.html_url,
          }
          startPolling(result.run_id)
        }

        return lastResult.value
      } else {
        lastResult.value = {
          success: false,
          message: result.message || '发布失败',
        }
        return lastResult.value
      }
    } catch (err: any) {
      lastResult.value = {
        success: false,
        message: err.message || '网络错误，请重试',
      }
      return lastResult.value
    } finally {
      deploying.value = false
    }
  }

  /**
   * 获取发布历史
   */
  async function fetchHistory() {
    try {
      const result = await callEdgeFunction({ action: 'list' })
      if (result.success && result.data) {
        deployHistory.value = result.data
      }
    } catch (err: any) {
      console.error('获取发布历史失败:', err)
    }
  }

  /**
   * 获取单个部署状态
   */
  async function fetchDeployStatus(id: string) {
    try {
      const result = await callEdgeFunction({ action: 'status', id })
      if (result.success && result.data) {
        return result.data as {
          id: string
          run_id: number
          status: string
          message: string
          html_url?: string
          conclusion?: string
        }
      }
      return null
    } catch (err: any) {
      console.error('获取部署状态失败:', err)
      return null
    }
  }

  /**
   * 开始轮询状态
   */
  function startPolling(runId: number) {
    if (pollingTimer) {
      clearTimeout(pollingTimer)
    }
    polling.value = true

    const poll = async () => {
      if (!polling.value || !currentDeploy.value) return

      // 获取最新状态
      const status = await fetchDeployStatus(currentDeploy.value.id || runId.toString())
      
      if (status) {
        currentDeploy.value = {
          ...currentDeploy.value,
          id: status.id || currentDeploy.value.id,
          run_id: status.run_id || runId,
          status: status.status as any,
          message: status.message,
          html_url: status.html_url,
          conclusion: status.conclusion,
        }

        // 如果构建完成，停止轮询
        if (status.status === 'success' || status.status === 'failed' || status.status === 'cancelled') {
          polling.value = false
          // 刷新历史记录
          await fetchHistory()
          return
        }
      }

      // 继续轮询（最多 5 分钟）
      pollingTimer = setTimeout(poll, 5000)
    }

    // 立即开始
    poll()
  }

  /**
   * 停止轮询
   */
  function stopPolling() {
    polling.value = false
    if (pollingTimer) {
      clearTimeout(pollingTimer)
      pollingTimer = null
    }
  }

  /**
   * 状态文本
   */
  function getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      pending: '排队中',
      in_progress: '构建中',
      success: '构建成功',
      failed: '构建失败',
      cancelled: '已取消',
    }
    return statusMap[status] || status
  }

  /**
   * 状态颜色
   */
  function getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      pending: 'text-gray-500',
      in_progress: 'text-blue-500',
      success: 'text-green-500',
      failed: 'text-red-500',
      cancelled: 'text-yellow-500',
    }
    return colorMap[status] || 'text-gray-500'
  }

  /**
   * 状态图标
   */
  function getStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      pending: 'fa-clock',
      in_progress: 'fa-spinner fa-spin',
      success: 'fa-check-circle',
      failed: 'fa-times-circle',
      cancelled: 'fa-ban',
    }
    return iconMap[status] || 'fa-question-circle'
  }

  // 组件卸载时清理
  onUnmounted(() => {
    stopPolling()
  })

  return {
    deploying: readonly(deploying),
    polling: readonly(polling),
    currentDeploy: readonly(currentDeploy),
    deployHistory: readonly(deployHistory),
    lastResult: readonly(lastResult),
    triggerDeploy,
    fetchHistory,
    fetchDeployStatus,
    startPolling,
    stopPolling,
    getStatusText,
    getStatusColor,
    getStatusIcon,
  }
}
