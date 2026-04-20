<script setup lang="ts">
import { getErrorMessage } from '~/utils/i18n'

definePageMeta({
  layout: 'blank'
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

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
    await authStore.signIn(form.email, form.password)

    // 登录成功，跳转到仪表盘
    const redirect = route.query.redirect as string
    await router.push(redirect || '/')
  } catch (err: any) {
    errorMessage.value = getErrorMessage(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
    <div class="max-w-md w-full">
      <!-- Logo 和标题 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">贝瑞医疗</h1>
        <p class="text-gray-500 mt-2">管理后台</p>
      </div>

      <!-- 登录表单卡片 -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">登录</h2>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ errorMessage }}</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- 邮箱 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <i class="fas fa-envelope"></i>
              </span>
              <input
                v-model="form.email"
                type="email"
                required
                placeholder="请输入邮箱"
                class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <!-- 密码 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <i class="fas fa-lock"></i>
              </span>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="请输入密码"
                class="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
              id="remember"
              v-model="form.remember"
              type="checkbox"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="remember" class="ml-2 text-sm text-gray-600">记住我</label>
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <span v-if="isLoading">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              登录中...
            </span>
            <span v-else>登录</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
