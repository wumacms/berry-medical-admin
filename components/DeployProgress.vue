<template>
  <Teleport to="body">
    <!-- 发布进度弹窗 -->
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- 背景遮罩 -->
        <div class="absolute inset-0 bg-black/50" @click="!polling && $emit('close')"></div>
        
        <!-- 弹窗内容 -->
        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
          <!-- 标题栏 -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-800">
              <i class="fas fa-rocket mr-2 text-blue-500"></i>
              发布进度
            </h3>
            <button 
              v-if="!polling"
              @click="$emit('close')"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <i class="fas fa-times text-gray-400"></i>
            </button>
          </div>

          <!-- 内容区 -->
          <div class="p-6">
            <!-- 当前发布状态 -->
            <div v-if="currentDeploy" class="mb-6">
              <div class="flex items-center gap-3 mb-3">
                <div 
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    statusBgClass
                  ]"
                >
                  <i :class="['fas', statusIcon, statusColorClass]"></i>
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-800">{{ statusText }}</p>
                  <p class="text-sm text-gray-500">{{ currentDeploy.message || '正在处理...' }}</p>
                </div>
              </div>

              <!-- 进度条 -->
              <div v-if="currentDeploy.status === 'in_progress'" class="mb-3">
                <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-500 rounded-full animate-pulse" style="width: 60%"></div>
                </div>
              </div>

              <!-- GitHub 链接 -->
              <a 
                v-if="currentDeploy.html_url"
                :href="currentDeploy.html_url"
                target="_blank"
                class="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
              >
                在 GitHub 查看 <i class="fas fa-external-link-alt text-xs"></i>
              </a>
            </div>

            <!-- 发布历史 -->
            <div v-if="showHistory">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-700">发布历史</h4>
                <button 
                  @click="refreshHistory"
                  class="text-sm text-blue-500 hover:text-blue-600"
                  :disabled="loading"
                >
                  <i :class="['fas', loading ? 'fa-spinner fa-spin' : 'fa-refresh']"></i>
                  刷新
                </button>
              </div>

              <div v-if="deployHistory.length === 0" class="text-center py-8 text-gray-400">
                <i class="fas fa-inbox text-4xl mb-2"></i>
                <p>暂无发布记录</p>
              </div>

              <div v-else class="space-y-2 max-h-60 overflow-y-auto">
                <div 
                  v-for="log in deployHistory"
                  :key="log.id"
                  class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div :class="['w-8 h-8 rounded-full flex items-center justify-center', getStatusBgClass(log.status)]">
                    <i :class="['fas', getStatusIcon(log.status)]"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span :class="['text-sm font-medium', getStatusColor(log.status)]">
                        {{ getStatusText(log.status) }}
                      </span>
                      <span class="text-xs text-gray-400">
                        {{ formatTime(log.created_at) }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500 truncate">{{ log.message || '' }}</p>
                  </div>
                  <a 
                    v-if="log.run_id"
                    :href="`https://github.com/${log.owner}/${log.repo}/actions/runs/${log.run_id}`"
                    target="_blank"
                    class="text-gray-400 hover:text-blue-500"
                  >
                    <i class="fas fa-external-link-alt"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div class="flex gap-3">
              <button
                v-if="!showHistory"
                @click="showHistory = true; refreshHistory()"
                class="flex-1 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                查看历史
              </button>
              <button
                v-if="showHistory"
                @click="showHistory = false"
                class="flex-1 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                返回
              </button>
              <button
                v-if="!polling"
                @click="$emit('close')"
                class="flex-1 px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
              >
                完成
              </button>
              <button
                v-else
                disabled
                class="flex-1 px-4 py-2 text-sm text-white bg-blue-400 rounded-lg cursor-not-allowed"
              >
                <i class="fas fa-spinner fa-spin mr-1"></i>
                构建中...
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface DeployLog {
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
}

const props = defineProps<{
  show: boolean
  currentDeploy: DeployLog | null
  polling: boolean
  deployHistory: DeployLog[]
}>()

const emit = defineEmits<{
  close: []
  refresh: []
}>()

const showHistory = ref(false)
const loading = ref(false)

const statusText = computed(() => {
  if (!props.currentDeploy) return ''
  const statusMap: Record<string, string> = {
    pending: '排队中',
    in_progress: '构建中',
    success: '构建成功',
    failed: '构建失败',
    cancelled: '已取消',
  }
  return statusMap[props.currentDeploy.status] || props.currentDeploy.status
})

const statusColorClass = computed(() => {
  if (!props.currentDeploy) return 'text-gray-500'
  const colorMap: Record<string, string> = {
    pending: 'text-gray-500',
    in_progress: 'text-blue-500',
    success: 'text-green-500',
    failed: 'text-red-500',
    cancelled: 'text-yellow-500',
  }
  return colorMap[props.currentDeploy.status] || 'text-gray-500'
})

const statusBgClass = computed(() => {
  if (!props.currentDeploy) return 'bg-gray-100'
  const bgMap: Record<string, string> = {
    pending: 'bg-gray-100',
    in_progress: 'bg-blue-100',
    success: 'bg-green-100',
    failed: 'bg-red-100',
    cancelled: 'bg-yellow-100',
  }
  return bgMap[props.currentDeploy.status] || 'bg-gray-100'
})

const statusIcon = computed(() => {
  if (!props.currentDeploy) return 'fa-question-circle'
  const iconMap: Record<string, string> = {
    pending: 'fa-clock',
    in_progress: 'fa-spinner fa-spin',
    success: 'fa-check-circle',
    failed: 'fa-times-circle',
    cancelled: 'fa-ban',
  }
  return iconMap[props.currentDeploy.status] || 'fa-question-circle'
})

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '排队中',
    in_progress: '构建中',
    success: '成功',
    failed: '失败',
    cancelled: '已取消',
  }
  return statusMap[status] || status
}

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

function getStatusBgClass(status: string): string {
  const bgMap: Record<string, string> = {
    pending: 'bg-gray-100',
    in_progress: 'bg-blue-100',
    success: 'bg-green-100',
    failed: 'bg-red-100',
    cancelled: 'bg-yellow-100',
  }
  return bgMap[status] || 'bg-gray-100'
}

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

function formatTime(timeStr: string): string {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  return date.toLocaleDateString('zh-CN')
}

function refreshHistory() {
  loading.value = true
  emit('refresh')
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 监听关闭时重置状态
watch(() => props.show, (newVal) => {
  if (!newVal) {
    showHistory.value = false
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
