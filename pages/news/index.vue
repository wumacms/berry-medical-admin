<template>
  <div>
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold text-gray-800">新闻管理</h1>
      <NuxtLink
        to="/news/new"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <i class="fas fa-plus mr-2"></i>发布新闻
      </NuxtLink>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div class="flex flex-wrap gap-4">
        <div class="flex-1 min-w-[200px]">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索新闻标题..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="debouncedSearch"
          />
        </div>
        <select
          v-model="selectedCategory"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @change="fetchNews"
        >
          <option value="">全部分类</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <select
          v-model="selectedStatus"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @change="fetchNews"
        >
          <option value="">全部状态</option>
          <option value="true">已发布</option>
          <option value="false">草稿</option>
        </select>
      </div>
    </div>

    <!-- 新闻列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div v-if="loading" class="text-center py-12 text-gray-500">
        <i class="fas fa-spinner fa-spin text-2xl"></i>
        <p class="mt-2">加载中...</p>
      </div>

      <div v-else-if="newsList.length === 0" class="text-center py-12 text-gray-500">
        <i class="fas fa-newspaper text-4xl mb-4"></i>
        <p>暂无新闻</p>
        <NuxtLink to="/news/new" class="text-blue-600 hover:text-blue-700 mt-2 inline-block">
          发布第一篇新闻
        </NuxtLink>
      </div>

      <table v-else class="w-full">
        <thead class="bg-gray-50">
          <tr class="text-left text-gray-500 text-sm">
            <th class="px-6 py-4 font-medium">标题</th>
            <th class="px-6 py-4 font-medium">分类</th>
            <th class="px-6 py-4 font-medium">状态</th>
            <th class="px-6 py-4 font-medium">浏览量</th>
            <th class="px-6 py-4 font-medium">发布时间</th>
            <th class="px-6 py-4 font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="item in newsList"
            :key="item.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-6 py-4">
              <div class="flex items-center">
                <img
                  v-if="item.image"
                  :src="item.image"
                  class="w-12 h-12 object-cover rounded-lg mr-4"
                />
                <div v-else class="w-12 h-12 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
                  <i class="fas fa-image text-gray-400"></i>
                </div>
                <span class="font-medium text-gray-800">{{ item.title }}</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {{ item.category }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span
                :class="item.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
                class="px-2 py-1 text-xs rounded-full"
              >
                {{ item.is_published ? '已发布' : '草稿' }}
              </span>
            </td>
            <td class="px-6 py-4 text-gray-500">{{ item.views || 0 }}</td>
            <td class="px-6 py-4 text-gray-500 text-sm">{{ formatDate(item.date) }}</td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <NuxtLink
                  :to="`/news/${item.id}/edit`"
                  class="text-blue-600 hover:text-blue-700"
                  title="编辑"
                >
                  <i class="fas fa-edit"></i>
                </NuxtLink>
                <button
                  @click="openPreview(item.id)"
                  class="text-gray-400 hover:text-gray-600"
                  title="预览"
                >
                  <i class="fas fa-external-link-alt"></i>
                </button>
                <button
                  @click="toggleStatus(item)"
                  class="text-gray-400 hover:text-gray-600"
                  :title="item.is_published ? '设为草稿' : '发布'"
                >
                  <i :class="item.is_published ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
                <button
                  @click="deleteNews(item)"
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

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p class="text-sm text-gray-500">
          共 {{ totalCount }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
        </p>
        <div class="flex gap-2">
          <button
            @click="currentPage--; fetchNews()"
            :disabled="currentPage === 1"
            class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            上一页
          </button>
          <button
            @click="currentPage++; fetchNews()"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const supabase = useSupabaseClient()
const config = useRuntimeConfig()

// 状态
const newsList = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const pageSize = 10
const totalCount = ref(0)
const categories = ['公司要闻', '行业动态', '技术分享', '政策法规']

// 计算属性
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

// 格式化日期
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 防抖搜索
let searchTimeout: NodeJS.Timeout
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchNews()
  }, 300)
}

// 获取新闻列表
async function fetchNews() {
  loading.value = true
  try {
    let query = supabase
      .from('news')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((currentPage.value - 1) * pageSize, currentPage.value * pageSize - 1)

    // 搜索
    if (searchQuery.value) {
      query = query.ilike('title', `%${searchQuery.value}%`)
    }

    // 分类筛选
    if (selectedCategory.value) {
      query = query.eq('category', selectedCategory.value)
    }

    // 状态筛选
    if (selectedStatus.value !== '') {
      query = query.eq('is_published', selectedStatus.value === 'true')
    }

    const { data, error, count } = await query

    if (!error) {
      newsList.value = data || []
      totalCount.value = count || 0
    }
  } catch (err) {
    console.error('获取新闻失败:', err)
  } finally {
    loading.value = false
  }
}

// 切换发布状态
async function toggleStatus(item: any) {
  try {
    const { error } = await (supabase
      .from('news') as any)
      .update({ is_published: !item.is_published })
      .eq('id', item.id)

    if (!error) {
      item.is_published = !item.is_published
    }
  } catch (err) {
    console.error('更新状态失败:', err)
  }
}

// 删除新闻
async function deleteNews(item: any) {
  if (!confirm(`确定要删除新闻「${item.title}」吗？此操作不可恢复。`)) {
    return
  }

  try {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', item.id)

    if (!error) {
      newsList.value = newsList.value.filter(n => n.id !== item.id)
      totalCount.value--
    }
  } catch (err) {
    console.error('删除失败:', err)
  }
}

// 页面加载
onMounted(() => {
  fetchNews()
})

// 打开新闻预览
function openPreview(id: number) {
  window.open(config.public.websiteUrl + '/news/' + id, '_blank')
}
</script>
