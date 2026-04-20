export const useAuth = () => {
  const supabaseClient = useSupabaseClient()
  const user = useSupabaseUser()
  
  const isAuthenticated = computed(() => !!user.value)
  const isLoading = ref(false)

  // 初始化认证状态
  async function initialize() {
    // Supabase 客户端会自动处理认证状态
  }

  // 登录
  async function login({ email, password }: { email: string; password: string }) {
    isLoading.value = true
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        return { error }
      }
      
      return { data }
    } catch (err: any) {
      return { error: { message: err.message } }
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  async function logout() {
    isLoading.value = true
    try {
      await supabaseClient.auth.signOut()
      navigateTo('/login')
    } catch (err: any) {
      console.error('登出失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    initialize,
    login,
    logout
  }
}
