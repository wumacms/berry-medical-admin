<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div class="flex items-center justify-between h-16 px-6">
        <!-- Logo -->
        <div class="flex items-center">
          <NuxtLink to="/" class="text-xl font-bold text-gray-800">
            贝瑞医疗 · 管理后台
          </NuxtLink>
        </div>

        <!-- 用户信息 -->
        <div class="flex items-center gap-4">
          <a
            href="javascript:void(0)"
            @click="openWebsite"
            class="px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i class="fas fa-external-link-alt mr-1"></i>
            访问网站
          </a>
          <span class="text-sm text-gray-600">{{ authStore.user?.email }}</span>
          <button
            @click="handleLogout"
            class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>
    </header>

    <!-- 侧边栏 -->
    <aside class="fixed top-16 left-0 bottom-0 w-64 bg-white shadow-lg overflow-y-auto">
      <nav class="py-4">
        <ul class="space-y-1">
          <li v-for="item in menuItems" :key="item.path">
            <NuxtLink
              :to="item.path"
              class="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
              :class="{ 'bg-blue-50 text-blue-600 border-r-4 border-blue-600': isActive(item.path) }"
            >
              <i :class="item.icon" class="w-5 h-5 mr-3"></i>
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="ml-64 pt-16 min-h-screen">
      <div class="p-8">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const authStore = useAuthStore()

// 菜单配置
const menuItems = [
  { path: '/', label: '仪表盘', icon: 'fas fa-home' },
  { path: '/news', label: '新闻管理', icon: 'fas fa-newspaper' },
  { path: '/pages', label: '页面管理', icon: 'fas fa-file-alt' },
  { path: '/contacts', label: '联系表单', icon: 'fas fa-envelope' },
  { path: '/settings', label: '网站配置', icon: 'fas fa-cog' }
]

// 判断当前路由是否激活
function isActive(path: string): boolean {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

// 退出登录
async function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    try {
      await authStore.signOut()
      alert('已退出登录')
      const basePath = config.public.cdnBaseUrl || ''
      router.push(basePath + '/login')
    } catch (err: any) {
      alert(err.message || '退出登录失败')
    }
  }
}

// 打开前台网站
function openWebsite() {
  window.open(config.public.websiteUrl + '/', '_blank')
}
</script>

<style scoped>
/* 确保侧边栏滚动条样式 */
aside::-webkit-scrollbar {
  width: 6px;
}

aside::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}

aside::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}
</style>
