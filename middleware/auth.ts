export default defineNuxtRouteMiddleware(async (to, from) => {
  // 登录页允许所有人访问
  if (to.path === '/login') {
    return
  }

  // 只在客户端检查认证状态（避免 SSR/静态生成时的时序问题）
  if (import.meta.client) {
    const { isAuthenticated, user } = useAuth()

    // 等待一会儿让 Supabase 恢复会话
    await new Promise(resolve => setTimeout(resolve, 100))

    // 再次检查
    if (!isAuthenticated.value) {
      return navigateTo('/login')
    }

    // 检查用户是否激活（如果有 is_active 字段）
    if (user.value && 'is_active' in user.value && user.value.is_active === false) {
      const { logout } = useAuth()
      await logout()
      return navigateTo('/login?reason=inactive')
    }
  }
})
