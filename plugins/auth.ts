// Pinia auth plugin - 在应用启动时初始化认证状态
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  if (authStore.loading) {
    await authStore.initAuth()
  }
})
