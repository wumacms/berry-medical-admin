export default defineNuxtRouteMiddleware(async (to, from) => {
  // 登录页允许所有人访问
  if (to.path === '/login') {
    return
  }

  // 初始化认证状态
  const { isAuthenticated, initialize, user } = useAuth()
  
  await initialize()

  // 检查是否已登录
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }

  // 检查用户是否激活（如果有 is_active 字段）
  if (user.value && 'is_active' in user.value && user.value.is_active === false) {
    const { logout } = useAuth()
    await logout()
    return navigateTo('/login?reason=inactive')
  }
})
