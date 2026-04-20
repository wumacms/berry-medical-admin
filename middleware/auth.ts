export default defineNuxtRouteMiddleware(async (to, _from) => {
  const authStore = useAuthStore()

  // 初始化认证状态 - 等待完成以确保状态正确
  if (authStore.loading) {
    await authStore.initAuth()
  }

  const isAuthenticated = authStore.isAuthenticated

  // 检查是否有 auth 中间件，或者路由需要认证
  const requiresAuth = to.meta.requiresAuth || 
    (to.meta.middleware && Array.isArray(to.meta.middleware) && to.meta.middleware.includes('auth'))

  if (requiresAuth && !isAuthenticated) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
  // 仅允许未登录用户访问的路由（登录/注册）
  else if (to.meta.guest && isAuthenticated) {
    return navigateTo('/')
  }
})
