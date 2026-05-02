<template>
  <div>
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold text-gray-800">页面管理</h1>
      <NuxtLink
        to="/pages/new"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <i class="fas fa-plus mr-2"></i>创建页面
      </NuxtLink>
    </div>

    <!-- 拖拽提示 -->
    <div class="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
      <i class="fas fa-arrows-alt mr-2"></i>拖动页面行可调整网站导航菜单的显示顺序
    </div>

    <!-- 页面列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div v-if="loading" class="text-center py-12 text-gray-500">
        <i class="fas fa-spinner fa-spin text-2xl"></i>
        <p class="mt-2">加载中...</p>
      </div>

      <div v-else-if="pages.length === 0" class="text-center py-12 text-gray-500">
        <i class="fas fa-file-alt text-4xl mb-4"></i>
        <p>暂无页面</p>
        <NuxtLink to="/pages/new" class="text-blue-600 hover:text-blue-700 mt-2 inline-block">
          创建第一个页面
        </NuxtLink>
      </div>

      <table v-else class="w-full">
        <thead class="bg-gray-50">
          <tr class="text-left text-gray-500 text-sm">
            <th class="px-4 py-4 font-medium w-12"></th>
            <th class="px-6 py-4 font-medium">页面名称</th>
            <th class="px-6 py-4 font-medium">路径</th>
            <th class="px-6 py-4 font-medium">描述</th>
            <th class="px-6 py-4 font-medium">创建时间</th>
            <th class="px-6 py-4 font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="(item, index) in pages"
            :key="item.id"
            :class="[
              'hover:bg-gray-50 transition-colors cursor-move',
              dragIndex === index ? 'bg-blue-50 opacity-75' : ''
            ]"
            draggable="true"
            @dragstart="onDragStart($event, index)"
            @dragover="onDragOver($event, index)"
            @dragend="onDragEnd"
            @drop="onDrop($event, index)"
          >
            <td class="px-4 py-4 text-center text-gray-400">
              <i class="fas fa-arrows-alt handle"></i>
            </td>
            <td class="px-6 py-4">
              <span class="font-medium text-gray-800">{{ item.name }}</span>
            </td>
            <td class="px-6 py-4">
              <code class="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">{{ item.path }}</code>
            </td>
            <td class="px-6 py-4">
              <span class="text-gray-500 text-sm">{{ item.description || '-' }}</span>
            </td>
            <td class="px-6 py-4 text-gray-500 text-sm">{{ formatDate(item.created_at) }}</td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <NuxtLink
                  :to="`/pages/${item.id}`"
                  class="text-blue-600 hover:text-blue-700"
                  title="编辑页面和区块"
                >
                  <i class="fas fa-edit"></i>
                </NuxtLink>
                <button
                  @click="openPreview(item.path)"
                  class="text-gray-400 hover:text-gray-600"
                  title="预览"
                >
                  <i class="fas fa-external-link-alt"></i>
                </button>
                <button
                  @click="deletePage(item)"
                  class="text-red-500 hover:text-red-700"
                  title="删除"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 保存提示 -->
    <Transition name="fade">
      <div
        v-if="showSaveTip"
        class="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3"
      >
        <i class="fas fa-check-circle"></i>
        <span>排序已保存</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Database } from '~/types/supabase-database'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const supabase = useSupabaseClient<Database>()
const config = useRuntimeConfig()

// 状态
const pages = ref<any[]>([])
const loading = ref(true)
const dragIndex = ref<number | null>(null)
const showSaveTip = ref(false)

// 拖拽相关
let dragStartIndex = -1

// 格式化日期
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 获取页面列表
async function fetchPages() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('nav_sort_order', { ascending: true })

    if (!error) {
      pages.value = data || []
    }
  } catch (err) {
    console.error('获取页面失败:', err)
  } finally {
    loading.value = false
  }
}

// 拖拽开始
function onDragStart(event: DragEvent, index: number) {
  dragStartIndex = index
  dragIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

// 拖拽经过
function onDragOver(event: DragEvent, index: number) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  dragIndex.value = index
}

// 放下
function onDrop(event: DragEvent, index: number) {
  event.preventDefault()
  if (dragStartIndex === -1 || dragStartIndex === index) return

  // 移动数组元素
  const newPages = [...pages.value]
  const [movedItem] = newPages.splice(dragStartIndex, 1)
  newPages.splice(index, 0, movedItem)
  pages.value = newPages

  // 保存新排序
  saveSortOrder()
}

// 拖拽结束
function onDragEnd() {
  dragIndex.value = null
  dragStartIndex = -1
}

// 保存排序到数据库
async function saveSortOrder() {
  try {
    // 更新每个页面的 nav_sort_order (导航菜单排序)
    for (let i = 0; i < pages.value.length; i++) {
      const page = pages.value[i]
      const { error } = await supabase
        .from('pages')
        // @ts-expect-error Supabase 类型推断问题
        .update({ nav_sort_order: i })
        .eq('id', page.id)

      if (error) {
        console.error('更新排序失败:', error)
      }
    }

    // 显示保存成功提示
    showSaveTip.value = true
    setTimeout(() => {
      showSaveTip.value = false
    }, 2000)
  } catch (err) {
    console.error('保存排序失败:', err)
    alert('保存排序失败，请重试')
  }
}

// 删除页面
async function deletePage(item: any) {
  if (!confirm(`确定要删除页面「${item.name}」吗？\n此操作将同时删除该页面的所有区块，且不可恢复。`)) {
    return
  }

  try {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', item.id)

    if (error) {
      alert('删除失败：' + error.message)
      return
    }

    pages.value = pages.value.filter(p => p.id !== item.id)
    alert('删除成功！')
  } catch (err: any) {
    alert('删除失败：' + err.message)
  }
}

// 页面加载
onMounted(() => {
  fetchPages()
})

// 打开页面预览
function openPreview(path: string) {
  window.open(config.public.websiteUrl + path, '_blank')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dragging {
  opacity: 0.5;
  background-color: #eff6ff;
}
</style>
