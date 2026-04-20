<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-8">仪表盘</h1>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">新闻数量</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">{{ stats.newsCount }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-newspaper text-xl text-blue-600"></i>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">页面数量</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">{{ stats.pageCount }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-file-alt text-xl text-green-600"></i>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">待处理表单</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">{{ stats.pendingContacts }}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-envelope text-xl text-yellow-600"></i>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">区块数量</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">{{ stats.blockCount }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-puzzle-piece text-xl text-purple-600"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷操作 & 最新动态 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 快捷操作 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">快捷操作</h2>
        <div class="grid grid-cols-2 gap-4">
          <NuxtLink
            to="/news/new"
            class="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <i class="fas fa-plus-circle text-xl text-blue-600 mr-3"></i>
            <span class="text-gray-700">发布新闻</span>
          </NuxtLink>
          <NuxtLink
            to="/pages/new"
            class="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <i class="fas fa-plus-square text-xl text-green-600 mr-3"></i>
            <span class="text-gray-700">创建页面</span>
          </NuxtLink>
          <NuxtLink
            to="/contacts"
            class="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <i class="fas fa-inbox text-xl text-yellow-600 mr-3"></i>
            <span class="text-gray-700">查看表单</span>
          </NuxtLink>
          <NuxtLink
            to="/settings"
            class="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <i class="fas fa-cog text-xl text-purple-600 mr-3"></i>
            <span class="text-gray-700">网站配置</span>
          </NuxtLink>
        </div>
      </div>

      <!-- 最新新闻 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800">最新新闻</h2>
          <NuxtLink to="/news" class="text-sm text-blue-600 hover:text-blue-700">查看全部</NuxtLink>
        </div>
        <div v-if="loading" class="text-center py-8 text-gray-500">
          <i class="fas fa-spinner fa-spin text-2xl"></i>
        </div>
        <div v-else-if="latestNews.length === 0" class="text-center py-8 text-gray-500">
          暂无新闻
        </div>
        <ul v-else class="space-y-3">
          <li
            v-for="item in latestNews"
            :key="item.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="flex-1 min-w-0">
              <p class="text-gray-800 font-medium truncate">{{ item.title }}</p>
              <p class="text-sm text-gray-500">{{ formatDate(item.created_at) }}</p>
            </div>
            <NuxtLink
              :to="`/news/${item.id}/edit`"
              class="ml-4 text-blue-600 hover:text-blue-700"
            >
              <i class="fas fa-edit"></i>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <!-- 待处理表单 -->
    <div class="mt-6 bg-white rounded-xl shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">待处理联系表单</h2>
        <NuxtLink to="/contacts" class="text-sm text-blue-600 hover:text-blue-700">查看全部</NuxtLink>
      </div>
      <div v-if="loadingContacts" class="text-center py-8 text-gray-500">
        <i class="fas fa-spinner fa-spin text-2xl"></i>
      </div>
      <div v-else-if="pendingContacts.length === 0" class="text-center py-8 text-gray-500">
        暂无待处理表单
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-gray-500 text-sm border-b">
              <th class="pb-3 font-medium">姓名</th>
              <th class="pb-3 font-medium">电话</th>
              <th class="pb-3 font-medium">公司</th>
              <th class="pb-3 font-medium">提交时间</th>
              <th class="pb-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in pendingContacts"
              :key="item.id"
              class="border-b border-gray-50 hover:bg-gray-50"
            >
              <td class="py-3">{{ item.name }}</td>
              <td class="py-3">{{ item.phone }}</td>
              <td class="py-3">{{ item.company || '-' }}</td>
              <td class="py-3 text-gray-500 text-sm">{{ formatDate(item.created_at) }}</td>
              <td class="py-3">
                <button
                  @click="markAsProcessed(item)"
                  class="text-green-600 hover:text-green-700 text-sm"
                >
                  标记已处理
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

// 使用统一的 Supabase 客户端
const supabase = useSupabaseClient()

// 统计数据
const stats = reactive({
  newsCount: 0,
  pageCount: 0,
  pendingContacts: 0,
  blockCount: 0
})

// 最新新闻
const latestNews = ref<any[]>([])
const loading = ref(true)
const loadingContacts = ref(true)
const pendingContacts = ref<any[]>([])

// 格式化日期
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取统计数据
async function fetchStats() {
  try {
    // 获取新闻数量
    const { count: newsCount } = await supabase
      .from('news')
      .select('*', { count: 'exact', head: true })
    
    // 获取页面数量
    const { count: pageCount } = await supabase
      .from('pages')
      .select('*', { count: 'exact', head: true })
    
    // 获取待处理表单数量
    const { count: pendingContactsCount } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('is_processed', false)
    
    // 获取区块数量
    const { count: blockCount } = await supabase
      .from('blocks')
      .select('*', { count: 'exact', head: true })

    stats.newsCount = newsCount || 0
    stats.pageCount = pageCount || 0
    stats.pendingContacts = pendingContactsCount || 0
    stats.blockCount = blockCount || 0
  } catch (err) {
    console.error('获取统计数据失败:', err)
  }
}

// 获取最新新闻
async function fetchLatestNews() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('news')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (!error) {
      latestNews.value = data || []
    }
  } catch (err) {
    console.error('获取新闻失败:', err)
  } finally {
    loading.value = false
  }
}

// 获取待处理表单
async function fetchPendingContacts() {
  loadingContacts.value = true
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .eq('is_processed', false)
      .order('created_at', { ascending: false })
      .limit(5)

    if (!error) {
      pendingContacts.value = data || []
    }
  } catch (err) {
    console.error('获取表单失败:', err)
  } finally {
    loadingContacts.value = false
  }
}

// 标记表单为已处理
async function markAsProcessed(item: any) {
  try {
    const { error } = await (supabase
      .from('contact_submissions') as any)
      .update({ is_processed: true })
      .eq('id', item.id)

    if (!error) {
      pendingContacts.value = pendingContacts.value.filter(c => c.id !== item.id)
      stats.pendingContacts--
    }
  } catch (err) {
    console.error('更新失败:', err)
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchStats()
  fetchLatestNews()
  fetchPendingContacts()
})
</script>
