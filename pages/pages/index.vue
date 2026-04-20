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
            <th class="px-6 py-4 font-medium">页面名称</th>
            <th class="px-6 py-4 font-medium">路径</th>
            <th class="px-6 py-4 font-medium">描述</th>
            <th class="px-6 py-4 font-medium">创建时间</th>
            <th class="px-6 py-4 font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="item in pages"
            :key="item.id"
            class="hover:bg-gray-50 transition-colors"
          >
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
                <a
                  :href="`/berry-medical-nuxt${item.path}`"
                  target="_blank"
                  class="text-gray-400 hover:text-gray-600"
                  title="预览"
                >
                  <i class="fas fa-external-link-alt"></i>
                </a>
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const supabase = useSupabaseClient()

// 状态
const pages = ref<any[]>([])
const loading = ref(true)

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
      .order('created_at', { ascending: false })

    if (!error) {
      pages.value = data || []
    }
  } catch (err) {
    console.error('获取页面失败:', err)
  } finally {
    loading.value = false
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
</script>
