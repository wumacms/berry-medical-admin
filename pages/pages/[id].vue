<template>
  <div>
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center">
        <NuxtLink to="/pages" class="mr-4 text-gray-500 hover:text-gray-700">
          <i class="fas fa-arrow-left"></i>
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-800">编辑页面：{{ page?.name }}</h1>
        <button
          @click="openPreview(pageForm.path)"
          class="ml-4 text-gray-400 hover:text-gray-600"
          title="预览"
        >
          <i class="fas fa-external-link-alt"></i>
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <i class="fas fa-spinner fa-spin text-2xl text-gray-500"></i>
    </div>

    <div v-else class="space-y-6">
      <!-- 区块管理 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <!-- 拖拽提示 -->
        <div class="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          <i class="fas fa-arrows-alt mr-2"></i>拖动区块行可调整页面中区块的显示顺序
        </div>

        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-800">区块管理</h2>
          <button
            @click="showBlockModal = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <i class="fas fa-plus mr-2"></i>添加区块
          </button>
        </div>

        <!-- 区块列表 -->
        <div v-if="blocks.length === 0" class="text-center py-8 text-gray-500">
          <i class="fas fa-puzzle-piece text-4xl mb-4"></i>
          <p>暂无区块</p>
          <button
            @click="showBlockModal = true"
            class="mt-2 text-blue-600 hover:text-blue-700"
          >
            添加第一个区块
          </button>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(block, index) in blocks"
            :key="block.id"
            :class="[
              'border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-move',
              blockDragIndex === index ? 'bg-blue-50 opacity-75' : ''
            ]"
            draggable="true"
            @dragstart="onBlockDragStart($event, index)"
            @dragover="onBlockDragOver($event, index)"
            @dragend="onBlockDragEnd"
            @drop="onBlockDrop($event, index)"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="text-gray-400 cursor-move">
                  <i class="fas fa-arrows-alt handle"></i>
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {{ block.type }}
                    </span>
                  <span class="text-gray-400">|</span>
                  <span class="text-gray-500 text-sm">{{ block.title || '无标题' }}</span>
                </div>
                </div>
              </div>
              <div class="flex items-center gap-2 ml-4">
                <label class="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="block.is_published"
                    @change="toggleBlockStatus(block)"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                </label>
                <button
                  @click="editBlock(block)"
                  class="text-blue-600 hover:text-blue-700"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  @click="deleteBlock(block)"
                  class="text-red-500 hover:text-red-700"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 页面信息 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">页面信息</h2>

        <form @submit.prevent="savePageInfo" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">页面名称</label>
              <input
                v-model="pageForm.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">路径</label>
              <input
                v-model="pageForm.path"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                readonly
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              v-model="pageForm.description"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div class="flex items-center justify-between pt-4 border-t">
            <div class="flex items-center gap-4">
              <button
                type="submit"
                :disabled="savingPage"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {{ savingPage ? '保存中...' : '保存页面信息' }}
              </button>

            </div>
            <button
              type="button"
              @click="deletePage"
              class="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
            >
              删除页面
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 区块编辑模态框 -->
    <div
      v-if="showBlockModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeBlockModal"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
          <h3 class="text-lg font-semibold">
            {{ editingBlock ? '编辑区块' : '添加区块' }}
          </h3>
          <button @click="closeBlockModal" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveBlock" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">区块类型</label>
            <select
              v-model="blockForm.type"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="hero">Hero 横幅</option>
              <option value="about">关于我们</option>
              <option value="services">服务列表</option>
              <option value="service-detail">服务详情</option>
              <option value="advantages">核心优势</option>
              <option value="projects">业绩案例</option>
              <option value="news">新闻动态</option>
              <option value="news-list">新闻列表</option>
              <option value="contact">联系我们</option>
              <option value="cta">行动召唤</option>
              <option value="features">特性展示</option>
              <option value="gallery">图片画廊</option>
              <option value="testimonials">客户评价</option>
              <option value="faq">常见问题</option>
              <option value="custom">自定义内容</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">区块标题</label>
            <input
              v-model="blockForm.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              排序顺序 <span class="text-gray-400">(数字越小越靠前)</span>
            </label>
            <input
              v-model.number="blockForm.sort_order"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">区块配置 (JSON)</label>
            <textarea
              v-model="blockForm.configJson"
              rows="10"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder='{"key": "value"}'
            ></textarea>
            <p class="mt-1 text-sm text-gray-500">
              根据区块类型填写对应的配置信息
            </p>
          </div>

          <div>
            <label class="flex items-center cursor-pointer">
              <input
                v-model="blockForm.is_published"
                type="checkbox"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <span class="ml-2">启用此区块</span>
            </label>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              @click="closeBlockModal"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="savingBlock"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ savingBlock ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 区块排序保存提示 -->
    <Transition name="fade">
      <div
        v-if="blockShowSaveTip"
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

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient<Database>()
const config = useRuntimeConfig()

const pageId = route.params.id as string

// 页面类型
interface PageItem {
  id: string
  name: string
  path: string
  description: string | null
  seo: Record<string, string> | null
}

// 状态
const page = ref<any>(null)
const blocks = ref<any[]>([])
const loading = ref(true)
const savingPage = ref(false)
const savingBlock = ref(false)
const showBlockModal = ref(false)
const editingBlock = ref<any>(null)
const blockDragIndex = ref<number | null>(null)
const blockShowSaveTip = ref(false)

// 区块拖拽相关
let blockDragStartIndex = -1

// 页面表单
const pageForm = reactive({
  name: '',
  path: '',
  description: ''
})

// 区块表单
const blockForm = reactive({
  type: 'hero',
  title: '',
  sort_order: 0,
  configJson: '{}',
  is_published: true
})

// 获取页面信息
async function fetchPage() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .single()

    if (error || !data) {
      alert('页面不存在')
      router.push('/pages')
      return
    }

    const pageData = data as PageItem
    page.value = pageData
    pageForm.name = pageData.name
    pageForm.path = pageData.path
    pageForm.description = pageData.description || ''
  } catch (err) {
    console.error('获取页面失败:', err)
  } finally {
    loading.value = false
  }
}

// 预览页面
function openPreview(path: string) {
  window.open(config.public.websiteUrl + path, '_blank')
}

// 获取区块列表
async function fetchBlocks() {
  try {
    const { data } = await supabase
      .from('blocks')
      .select('*')
      .eq('page_id', pageId)
      .order('sort_order', { ascending: true })

    blocks.value = data || []
  } catch (err) {
    console.error('获取区块失败:', err)
  }
}

// 区块拖拽开始
function onBlockDragStart(event: DragEvent, index: number) {
  blockDragStartIndex = index
  blockDragIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

// 区块拖拽经过
function onBlockDragOver(event: DragEvent, index: number) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  blockDragIndex.value = index
}

// 区块放下
function onBlockDrop(event: DragEvent, index: number) {
  event.preventDefault()
  if (blockDragStartIndex === -1 || blockDragStartIndex === index) return

  // 移动数组元素
  const newBlocks = [...blocks.value]
  const [movedItem] = newBlocks.splice(blockDragStartIndex, 1)
  newBlocks.splice(index, 0, movedItem)
  blocks.value = newBlocks

  // 保存新排序
  saveBlockSortOrder()
}

// 区块拖拽结束
function onBlockDragEnd() {
  blockDragIndex.value = null
  blockDragStartIndex = -1
}

// 保存区块排序到数据库
async function saveBlockSortOrder() {
  try {
    for (let i = 0; i < blocks.value.length; i++) {
      const block = blocks.value[i]
      const { error } = await supabase
        .from('blocks')
        // @ts-expect-error Supabase 类型推断问题
        .update({ sort_order: i })
        .eq('id', block.id)

      if (error) {
        console.error('更新区块排序失败:', error)
      }
    }

    // 显示保存成功提示
    blockShowSaveTip.value = true
    setTimeout(() => {
      blockShowSaveTip.value = false
    }, 2000)
  } catch (err) {
    console.error('保存区块排序失败:', err)
  }
}

// 保存页面信息
async function savePageInfo() {
  savingPage.value = true
  try {
    const { error } = await (supabase
      .from('pages') as any)
      .update({
        name: pageForm.name,
        description: pageForm.description || null
      })
      .eq('id', pageId)

    if (error) {
      alert('保存失败：' + error.message)
      return
    }

    page.value.name = pageForm.name
    alert('保存成功！')
  } catch (err: any) {
    alert('保存失败：' + err.message)
  } finally {
    savingPage.value = false
  }
}

// 打开区块编辑
function editBlock(block: any) {
  editingBlock.value = block
  blockForm.type = block.type
  blockForm.title = block.title || ''
  blockForm.sort_order = block.sort_order || 0
  blockForm.configJson = JSON.stringify(block.config || {}, null, 2)
  blockForm.is_published = block.is_published
  showBlockModal.value = true
}

// 关闭模态框
function closeBlockModal() {
  showBlockModal.value = false
  editingBlock.value = null
  blockForm.type = 'hero'
  blockForm.title = ''
  blockForm.sort_order = 0
  blockForm.configJson = '{}'
  blockForm.is_published = true
}

// 保存区块
async function saveBlock() {
  savingBlock.value = true
  try {
    let config = {}
    try {
      config = JSON.parse(blockForm.configJson)
    } catch {
      alert('JSON 格式错误，请检查')
      savingBlock.value = false
      return
    }

    if (editingBlock.value) {
      // 更新
      const { error } = await (supabase
        .from('blocks') as any)
        .update({
          title: blockForm.title,
          sort_order: blockForm.sort_order,
          config: config,
          is_published: blockForm.is_published
        })
        .eq('id', editingBlock.value.id)

      if (error) {
        alert('保存失败：' + error.message)
        return
      }
    } else {
      // 新建
      const { error } = await (supabase.from('blocks') as any).insert({
        page_id: pageId,
        type: blockForm.type,
        title: blockForm.title,
        sort_order: blockForm.sort_order,
        config: config,
        is_published: blockForm.is_published
      })

      if (error) {
        alert('保存失败：' + error.message)
        return
      }
    }

    await fetchBlocks()
    closeBlockModal()
    alert('保存成功！')
  } catch (err: any) {
    alert('保存失败：' + err.message)
  } finally {
    savingBlock.value = false
  }
}

// 切换区块状态
async function toggleBlockStatus(block: any) {
  try {
    await (supabase.from('blocks') as any)
      .update({ is_published: !block.is_published })
      .eq('id', block.id)

    block.is_published = !block.is_published
  } catch (err) {
    console.error('更新失败:', err)
  }
}

// 删除区块
async function deleteBlock(block: any) {
  if (!confirm('确定要删除这个区块吗？')) {
    return
  }

  try {
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('id', block.id)

    if (error) {
      alert('删除失败：' + error.message)
      return
    }

    blocks.value = blocks.value.filter(b => b.id !== block.id)
  } catch (err: any) {
    alert('删除失败：' + err.message)
  }
}

// 删除页面
async function deletePage() {
  if (!confirm('确定要删除这个页面吗？所有区块也将被删除，且不可恢复。')) {
    return
  }

  try {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', pageId)

    if (error) {
      alert('删除失败：' + error.message)
      return
    }

    alert('删除成功！')
    router.push('/pages')
  } catch (err: any) {
    alert('删除失败：' + err.message)
  }
}

// 页面加载
onMounted(() => {
  fetchPage()
  fetchBlocks()
})
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
</style>
