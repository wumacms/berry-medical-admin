<template>
  <div>
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center">
        <NuxtLink to="/pages" class="mr-4 text-gray-500 hover:text-gray-700">
          <i class="fas fa-arrow-left"></i>
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-800">创建页面</h1>
      </div>
    </div>

    <!-- 表单 -->
    <div class="bg-white rounded-xl shadow-sm p-6">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- 页面名称 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            页面名称 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="如：关于我们"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- 页面路径 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            页面路径 <span class="text-red-500">*</span>
          </label>
          <div class="flex items-center">
            <span class="px-4 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500">
              /
            </span>
            <input
              v-model="form.path"
              type="text"
              required
              placeholder="如：about"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p class="mt-1 text-sm text-gray-500">路径将作为 URL 的一部分，如：/about</p>
        </div>

        <!-- 描述 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="页面描述（可选，用于 SEO）"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>
        </div>

        <!-- SEO 配置 -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-medium text-gray-800 mb-4">SEO 配置</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">SEO 标题</label>
              <input
                v-model="form.seo.title"
                type="text"
                placeholder="页面标题（可选，留空则使用页面名称）"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">SEO 描述</label>
              <textarea
                v-model="form.seo.description"
                rows="2"
                placeholder="页面描述（可选）"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">关键词</label>
              <input
                v-model="form.seo.keywords"
                type="text"
                placeholder="关键词，用逗号分隔"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="flex items-center justify-end gap-4 pt-6 border-t">
          <NuxtLink
            to="/pages"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </NuxtLink>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {{ isSubmitting ? '创建中...' : '创建页面' }}
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

// 网站 ID
const websiteId = 'main'

// 表单数据
const form = reactive({
  name: '',
  path: '',
  description: '',
  seo: {
    title: '',
    description: '',
    keywords: ''
  }
})

// 状态
const isSubmitting = ref(false)

// 提交表单
async function handleSubmit() {
  if (!form.name || !form.path) {
    alert('请填写页面名称和路径')
    return
  }

  // 格式化路径
  let path = '/' + form.path.replace(/^\/+|\/+$/g, '')

  isSubmitting.value = true

  try {
    // 检查路径是否已存在
    const { data: existing } = await supabase
      .from('pages')
      .select('id')
      .eq('path', path)
      .single()

    if (existing) {
      alert('该路径已存在，请使用其他路径')
      isSubmitting.value = false
      return
    }

    const { error } = await (supabase.from('pages') as any).insert({
      website_id: websiteId,
      name: form.name,
      path: path,
      description: form.description || null,
      seo: {
        title: form.seo.title || null,
        description: form.seo.description || null,
        keywords: form.seo.keywords || null
      }
    })

    if (error) {
      alert('创建失败：' + error.message)
      return
    }

    alert('创建成功！')
    router.push('/pages')
  } catch (err: any) {
    alert('创建失败：' + err.message)
  } finally {
    isSubmitting.value = false
  }
}
</script>
