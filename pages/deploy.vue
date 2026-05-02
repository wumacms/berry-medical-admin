<template>
  <div>
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold text-gray-800">发布记录</h1>
      <button
        @click="refreshHistory"
        :disabled="loading"
        class="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
      >
        <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync'" class="mr-2"></i>
        {{ loading ? '刷新中...' : '刷新' }}
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <i class="fas fa-spinner fa-spin text-2xl text-gray-500"></i>
    </div>

    <!-- 空状态 -->
    <div v-else-if="history.length === 0" class="bg-white rounded-xl shadow-sm p-12 text-center">
      <i class="fas fa-history text-4xl text-gray-300 mb-4"></i>
      <p class="text-gray-500">暂无发布记录</p>
      <p class="text-sm text-gray-400 mt-2">点击顶部「发布网站」按钮开始发布</p>
    </div>

    <!-- 发布记录列表 -->
    <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">构建号</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">状态</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">信息</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">触发时间</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">完成时间</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="item in history" :key="item.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
              <span class="text-sm font-medium text-gray-800">#{{ item.run_id || '-' }}</span>
            </td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                  getStatusBgColor(item.status),
                  getStatusTextColor(item.status)
                ]"
              >
                <i :class="['fas mr-1', getStatusIcon(item.status)]"></i>
                {{ getStatusText(item.status) }}
              </span>
            </td>
            <td class="px-6 py-4">
              <p class="text-sm text-gray-600 max-w-xs truncate">{{ item.message || '-' }}</p>
            </td>
            <td class="px-6 py-4">
              <p class="text-sm text-gray-600">{{ formatDate(item.started_at || item.created_at) }}</p>
            </td>
            <td class="px-6 py-4">
              <p class="text-sm text-gray-600">{{ item.finished_at ? formatDate(item.finished_at) : '-' }}</p>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button
                  v-if="item.run_id"
                  @click="openBuildUrl(item)"
                  class="text-blue-600 hover:text-blue-800 text-sm"
                >
                  <i class="fas fa-external-link-alt"></i>
                </button>
                <button
                  v-if="item.status === 'pending' || item.status === 'in_progress'"
                  @click="refreshStatus(item)"
                  :disabled="refreshingIds.includes(item.id)"
                  class="text-gray-500 hover:text-gray-700 text-sm disabled:opacity-50"
                >
                  <i :class="refreshingIds.includes(item.id) ? 'fas fa-spinner fa-spin' : 'fas fa-sync'"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DeployLog } from '~/composables/useDeploy'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const { fetchHistory, fetchDeployStatus, getStatusText, getStatusColor, getStatusIcon } = useDeploy()

// 状态
const loading = ref(true)
const history = ref<DeployLog[]>([])
const refreshingIds = ref<string[]>([])

// 加载历史记录
async function refreshHistory() {
  loading.value = true
  try {
    const result = await fetchHistory()
    if (result?.success && result.data) {
      history.value = result.data
    }
  } catch (err: any) {
    console.error('获取发布历史失败:', err)
  } finally {
    loading.value = false
  }
}

// 刷新单条记录状态
async function refreshStatus(item: DeployLog) {
  if (!item.id) return
  
  refreshingIds.value.push(item.id)
  try {
    const status = await fetchDeployStatus(item.id)
    if (status) {
      const idx = history.value.findIndex(h => h.id === item.id)
      if (idx !== -1) {
        history.value[idx] = {
          ...history.value[idx],
          status: status.status as any,
          message: status.message,
          conclusion: status.conclusion,
        }
      }
    }
  } finally {
    refreshingIds.value = refreshingIds.value.filter(id => id !== item.id)
  }
}

// 打开构建链接
function openBuildUrl(item: DeployLog) {
  if (item.html_url) {
    window.open(item.html_url, '_blank')
  } else if (item.run_id) {
    window.open(`https://github.com/wumacms/berry-medical-web/actions/runs/${item.run_id}`, '_blank')
  }
}

// 格式化日期
function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 状态背景色
function getStatusBgColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'bg-gray-100',
    in_progress: 'bg-blue-100',
    success: 'bg-green-100',
    failed: 'bg-red-100',
    cancelled: 'bg-yellow-100',
  }
  return colorMap[status] || 'bg-gray-100'
}

// 状态文字颜色
function getStatusTextColor(status: string): string {
  return getStatusColor(status)
}

// 页面加载
onMounted(() => {
  refreshHistory()
})
</script>
