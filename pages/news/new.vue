<template>
  <div>
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center">
        <NuxtLink to="/news" class="mr-4 text-gray-500 hover:text-gray-700">
          <i class="fas fa-arrow-left"></i>
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-800">发布新闻</h1>
      </div>
    </div>

    <!-- 表单 -->
    <div class="bg-white rounded-xl shadow-sm p-6">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- 标题 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            标题 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="请输入新闻标题"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- 分类 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">分类</label>
          <select
            v-model="form.category"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <!-- 封面图 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">封面图</label>
          <div class="flex items-start gap-4">
            <div
              v-if="form.image"
              class="relative w-32 h-32"
            >
              <img :src="form.image" class="w-32 h-32 object-cover rounded-lg" />
              <button
                type="button"
                @click="form.image = ''"
                class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                <i class="fas fa-times text-xs"></i>
              </button>
            </div>
            <div
              v-else
              class="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <i class="fas fa-plus text-gray-400 text-xl mb-2"></i>
              <span class="text-sm text-gray-500">上传图片</span>
            </div>
            <div class="text-sm text-gray-500">
              <p>支持 JPG、PNG 格式</p>
              <p>建议尺寸 800x600</p>
              <p class="mt-2">或输入图片 URL：</p>
              <input
                v-model="form.image"
                type="url"
                placeholder="https://..."
                class="w-64 mt-1 px-3 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>

        <!-- 摘要 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">摘要</label>
          <textarea
            v-model="form.excerpt"
            rows="3"
            placeholder="请输入新闻摘要（可选）"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>
        </div>

        <!-- 内容 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            内容 <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="form.content"
            rows="15"
            required
            placeholder="请输入新闻正文内容（支持 HTML）"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          ></textarea>
          <p class="mt-1 text-sm text-gray-500">支持 HTML 格式，可使用 &lt;p&gt;、&lt;strong&gt;、&lt;ul&gt; 等标签</p>
        </div>

        <!-- 日期 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">发布日期</label>
          <input
            v-model="form.date"
            type="date"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- 标签 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">标签</label>
          <input
            v-model="tagsInput"
            type="text"
            placeholder="多个标签用逗号分隔，如：核医学,辐射防护"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- 发布选项 -->
        <div class="flex items-center gap-6">
          <label class="flex items-center cursor-pointer">
            <input
              v-model="form.is_published"
              type="checkbox"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="ml-2 text-gray-700">立即发布</span>
          </label>
        </div>

        <!-- 提交按钮 -->
        <div class="flex items-center justify-end gap-4 pt-6 border-t">
          <NuxtLink
            to="/news"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </NuxtLink>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {{ isSubmitting ? '提交中...' : '发布新闻' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const router = useRouter()
const supabase = useSupabaseClient()

// 分类选项
const categories = ['公司要闻', '行业动态', '技术分享', '政策法规']

// 表单数据
const form = reactive({
  title: '',
  category: '公司要闻',
  excerpt: '',
  content: '',
  image: '',
  date: new Date().toISOString().split('T')[0],
  tags: [] as string[],
  is_published: true
})

// 标签输入
const tagsInput = ref('')

// 状态
const isSubmitting = ref(false)

// 提交表单
async function handleSubmit() {
  if (!form.title || !form.content) {
    alert('请填写标题和内容')
    return
  }

  isSubmitting.value = true

  try {
    // 处理标签
    if (tagsInput.value) {
      form.tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t)
    }

    const { error } = await (supabase.from('news') as any).insert({
      title: form.title,
      category: form.category,
      excerpt: form.excerpt,
      content: form.content,
      image: form.image || null,
      date: form.date,
      tags: form.tags,
      is_published: form.is_published
    })

    if (error) {
      alert('发布失败：' + error.message)
      return
    }

    alert('发布成功！')
    router.push('/news')
  } catch (err: any) {
    alert('发布失败：' + err.message)
  } finally {
    isSubmitting.value = false
  }
}
</script>
