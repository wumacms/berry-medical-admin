import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Session } from '@supabase/supabase-js'

// signUp 返回值类型
interface SignUpData {
  user: User | null
  session: Session | null
  alreadyRegistered?: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const supabase = useSupabaseClient()
  const user = ref<User | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)
  const userEmail = computed(() => user.value?.email || '')

  async function initAuth() {
    loading.value = true
    try {
      const { data } = await supabase.auth.getUser()
      user.value = data.user

      supabase.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user ?? null
      })
    } finally {
      loading.value = false
    }
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    user.value = data.user
    return data
  }

  async function signUp(email: string, password: string): Promise<SignUpData> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error

    // 如果 session 为 null，说明邮箱已注册但未验证
    if (!data.session && data.user && !data.user.email_confirmed_at) {
      return { ...data, alreadyRegistered: true }
    }

    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
  }

  async function updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
    user.value = data.user
    return data
  }

  return {
    user,
    loading,
    isAuthenticated,
    userEmail,
    initAuth,
    signIn,
    signUp,
    signOut,
    updatePassword,
  }
})
