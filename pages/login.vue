<script setup lang="ts">
definePageMeta({
  layout: 'blank'
})

const route = useRoute()
const { login, initialize, isAuthenticated } = useAuth()

// 表单数据
const form = reactive({
  email: '',
  password: '',
  remember: true
})

// 状态
const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

// 处理登录
async function handleLogin() {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const result = await login({
      email: form.email,
      password: form.password
    })

    if (result.error) {
      errorMessage.value = result.error.message || '登录失败，请检查邮箱和密码'
      return
    }

    // 登录成功，跳转到仪表盘
    await navigateTo('/')
  } catch (err: any) {
    errorMessage.value = err.message || '登录失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 页面加载时检查是否已登录
onMounted(async () => {
  await initialize()

  // 检查 URL 参数
  if (route.query.reason === 'inactive') {
    errorMessage.value = '账号已被禁用，请联系管理员'
  }

  // 如果已登录，直接跳转
  if (isAuthenticated.value) {
    await navigateTo('/')
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-shield-alt text-3xl text-blue-600"></i>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">管理员登录</h1>
        <p class="text-gray-500 mt-2">贝瑞医疗后台管理系统</p>
      </div>

      <!-- 错误提示 -->
      <div
        v-if="errorMessage"
        class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
      >
        <i class="fas fa-exclamation-circle mr-2"></i>
        {{ errorMessage }}
      </div>

      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- 邮箱 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">邮箱地址</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <i class="fas fa-envelope"></i>
            </span>
            <input
              v-model="form.email"
              type="email"
              placeholder="请输入邮箱"
              required
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              :disabled="isLoading"
            />
          </div>
        </div>

        <!-- 密码 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <i class="fas fa-lock"></i>
            </span>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              required
              class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              :disabled="isLoading"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <!-- 记住我 -->
        <div class="flex items-center">
          <input
            v-model="form.remember"
            type="checkbox"
            id="remember"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label for="remember" class="ml-2 text-sm text-gray-600">记住登录状态</label>
        </div>

        <!-- 登录按钮 -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            登录中...
          </span>
          <span v-else>登录</span>
        </button>
      </form>

      <!-- 返回前台 -->
      <div class="mt-6 text-center">
        <a
          href="/berry-medical-nuxt"
          target="_blank"
          class="text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <i class="fas fa-arrow-left mr-1"></i>
          返回网站首页
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 渐变背景动画 */
.bg-gradient-to-br {
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
