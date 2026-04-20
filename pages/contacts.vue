<template>
  <div>
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold text-gray-800">联系表单</h1>
      <div class="flex items-center gap-4">
        <select
          v-model="filterStatus"
          @change="fetchContacts"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部状态</option>
          <option value="unprocessed">待处理</option>
          <option value="processed">已处理</option>
        </select>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">总提交数</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">{{ stats.total }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-inbox text-xl text-blue-600"></i>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">待处理</p>
            <p class="text-3xl font-bold text-yellow-600 mt-1">{{ stats.pending }}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-clock text-xl text-yellow-600"></i>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">已处理</p>
            <p class="text-3xl font-bold text-green-600 mt-1">{{ stats.processed }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-check-circle text-xl text-green-600"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 联系表单列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div v-if="loading" class="text-center py-12 text-gray-500">
        <i class="fas fa-spinner fa-spin text-2xl"></i>
        <p class="mt-2">加载中...</p>
      </div>

      <div v-else-if="contacts.length === 0" class="text-center py-12 text-gray-500">
        <i class="fas fa-inbox text-4xl mb-4"></i>
        <p>暂无联系表单记录</p>
      </div>

      <table v-else class="w-full">
        <thead class="bg-gray-50">
          <tr class="text-left text-gray-500 text-sm">
            <th class="px-6 py-4 font-medium">姓名</th>
            <th class="px-6 py-4 font-medium">联系方式</th>
            <th class="px-6 py-4 font-medium">公司</th>
            <th class="px-6 py-4 font-medium">状态</th>
            <th class="px-6 py-4 font-medium">提交时间</th>
            <th class="px-6 py-4 font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="item in contacts"
            :key="item.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-6 py-4 font-medium text-gray-800">{{ item.name }}</td>
            <td class="px-6 py-4">
              <div class="text-sm">
                <p class="text-gray-800">{{ item.phone }}</p>
                <p v-if="item.email" class="text-gray-500">{{ item.email }}</p>
              </div>
            </td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ item.company || '-' }}</td>
            <td class="px-6 py-4">
              <span
                :class="item.is_processed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                class="px-2 py-1 text-xs rounded-full"
              >
                {{ item.is_processed ? '已处理' : '待处理' }}
              </span>
            </td>
            <td class="px-6 py-4 text-gray-500 text-sm">{{ formatDate(item.created_at) }}</td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <button
                  @click="viewDetail(item)"
                  class="text-blue-600 hover:text-blue-700"
                  title="查看详情"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button
                  v-if="!item.is_processed"
                  @click="markAsProcessed(item)"
                  class="text-green-600 hover:text-green-700"
                  title="标记已处理"
                >
                  <i class="fas fa-check"></i>
                </button>
                <button
                  @click="deleteContact(item)"
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
            @click="currentPage--; fetchContacts()"
            :disabled="currentPage === 1"
            class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            上一页
          </button>
          <button
            @click="currentPage++; fetchContacts()"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 详情模态框 -->
    <div
      v-if="showDetailModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showDetailModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div class="px-6 py-4 border-b flex items-center justify-between">
          <h3 class="text-lg font-semibold">表单详情</h3>
          <button @click="showDetailModal = false" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="text-sm text-gray-500">姓名</label>
            <p class="font-medium">{{ selectedContact?.name }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">联系电话</label>
            <p class="font-medium">{{ selectedContact?.phone }}</p>
          </div>
          <div v-if="selectedContact?.email">
            <label class="text-sm text-gray-500">电子邮箱</label>
            <p class="font-medium">{{ selectedContact?.email }}</p>
          </div>
          <div v-if="selectedContact?.company">
            <label class="text-sm text-gray-500">公司名称</label>
            <p class="font-medium">{{ selectedContact?.company }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">留言内容</label>
            <p class="mt-1 p-3 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">
              {{ selectedContact?.message || '无' }}
            </p>
          </div>
          <div>
            <label class="text-sm text-gray-500">提交时间</label>
            <p class="font-medium">{{ formatDate(selectedContact?.created_at) }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">状态</label>
            <p>
              <span
                :class="selectedContact?.is_processed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                class="px-2 py-1 text-xs rounded-full"
              >
                {{ selectedContact?.is_processed ? '已处理' : '待处理' }}
              </span>
            </p>
          </div>
        </div>

        <div class="px-6 py-4 border-t flex justify-end gap-3">
          <button
            v-if="!selectedContact?.is_processed"
            @click="markAsProcessed(selectedContact); showDetailModal = false"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            标记已处理
          </button>
          <button
            @click="showDetailModal = false"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            关闭
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

// 状态
const contacts = ref<any[]>([])
const loading = ref(true)
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = 15
const totalCount = ref(0)
const showDetailModal = ref(false)
const selectedContact = ref<any>(null)

// 统计
const stats = reactive({
  total: 0,
  pending: 0,
  processed: 0
})

// 计算属性
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

// 格式化日期
function formatDate(date: string): string {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 获取统计
async function fetchStats() {
  try {
    const { count: total } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })

    const { count: pending } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('is_processed', false)

    const { count: processed } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('is_processed', true)

    stats.total = total || 0
    stats.pending = pending || 0
    stats.processed = processed || 0
  } catch (err) {
    console.error('获取统计失败:', err)
  }
}

// 获取联系表单列表
async function fetchContacts() {
  loading.value = true
  try {
    let query = supabase
      .from('contact_submissions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((currentPage.value - 1) * pageSize, currentPage.value * pageSize - 1)

    if (filterStatus.value === 'processed') {
      query = query.eq('is_processed', true)
    } else if (filterStatus.value === 'unprocessed') {
      query = query.eq('is_processed', false)
    }

    const { data, error, count } = await query

    if (!error) {
      contacts.value = data || []
      totalCount.value = count || 0
    }
  } catch (err) {
    console.error('获取表单失败:', err)
  } finally {
    loading.value = false
  }
}

// 查看详情
function viewDetail(item: any) {
  selectedContact.value = item
  showDetailModal.value = true
}

// 标记已处理
async function markAsProcessed(item: any) {
  try {
    const { error } = await (supabase
      .from('contact_submissions') as any)
      .update({ is_processed: true })
      .eq('id', item.id)

    if (!error) {
      item.is_processed = true
      stats.pending--
      stats.processed++
    }
  } catch (err) {
    console.error('更新失败:', err)
  }
}

// 删除
async function deleteContact(item: any) {
  if (!confirm(`确定要删除这条表单记录吗？`)) {
    return
  }

  try {
    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', item.id)

    if (error) {
      alert('删除失败：' + error.message)
      return
    }

    contacts.value = contacts.value.filter(c => c.id !== item.id)
    totalCount.value--
    if (!item.is_processed) {
      stats.pending--
    } else {
      stats.processed--
    }
    stats.total--
  } catch (err: any) {
    alert('删除失败：' + err.message)
  }
}

// 页面加载
onMounted(() => {
  fetchContacts()
  fetchStats()
})
</script>
