/**
 * 认证 Composable - 封装 authStore 提供更友好的 API
 * 保留此文件以保持向后兼容，实际认证逻辑在 stores/auth.ts 中
 */
export const useAuth = () => {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isLoading = computed(() => authStore.loading)
  const userEmail = computed(() => authStore.userEmail)

  async function initialize() {
    await authStore.initAuth()
  }

  async function login({ email, password }: { email: string; password: string }) {
    try {
      await authStore.signIn(email, password)
      return { data: authStore.user }
    } catch (err: any) {
      return { error: err }
    }
  }

  async function logout() {
    await authStore.signOut()
    const basePath = config.public.cdnBaseUrl || ''
    navigateTo(basePath + '/login')
  }

  async function register({ email, password }: { email: string; password: string }) {
    try {
      const result = await authStore.signUp(email, password)
      return { data: result }
    } catch (err: any) {
      return { error: err }
    }
  }

  async function updatePassword(newPassword: string) {
    try {
      await authStore.updatePassword(newPassword)
      return { data: authStore.user }
    } catch (err: any) {
      return { error: err }
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    userEmail,
    initialize,
    login,
    logout,
    register,
    updatePassword,
  }
}
