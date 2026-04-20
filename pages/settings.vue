<template>
  <div>
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold text-gray-800">网站配置</h1>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <i class="fas fa-spinner fa-spin text-2xl text-gray-500"></i>
    </div>

    <div v-else class="space-y-6">
      <!-- 基础信息 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-6">基础信息</h2>
        
        <form @submit.prevent="saveBasicInfo" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">网站名称</label>
              <input
                v-model="form.site_name"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">公司名称</label>
              <input
                v-model="form.company_name"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">标语</label>
            <input
              v-model="form.slogan"
              type="text"
              placeholder="一句话介绍公司"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">公司简介</label>
            <textarea
              v-model="form.description"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="savingBasic"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ savingBasic ? '保存中...' : '保存基础信息' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Logo 和图标 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-6">Logo 和图标</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">网站 Logo</label>
            <div class="flex items-start gap-4">
              <div
                v-if="form.site_logo"
                class="w-32 h-32 border border-gray-200 rounded-lg overflow-hidden"
              >
                <img :src="form.site_logo" class="w-full h-full object-contain" />
              </div>
              <div v-else class="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <i class="fas fa-image text-gray-400 text-2xl"></i>
              </div>
              <div class="text-sm text-gray-500">
                <p>支持 PNG、JPG、SVG</p>
                <p class="mt-1">输入图片 URL：</p>
                <input
                  v-model="form.site_logo"
                  type="url"
                  placeholder="https://..."
                  class="w-full mt-1 px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">网站图标 (Favicon)</label>
            <div class="flex items-start gap-4">
              <div
                v-if="form.site_favicon"
                class="w-16 h-16 border border-gray-200 rounded-lg overflow-hidden p-1"
              >
                <img :src="form.site_favicon" class="w-full h-full object-contain" />
              </div>
              <div v-else class="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <i class="fas fa-image text-gray-400"></i>
              </div>
              <div class="text-sm text-gray-500">
                <p>建议 32x32 或 64x64</p>
                <p class="mt-1">输入图片 URL：</p>
                <input
                  v-model="form.site_favicon"
                  type="url"
                  placeholder="https://..."
                  class="w-full mt-1 px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button
            @click="saveLogo"
            :disabled="savingBasic"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ savingBasic ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>

      <!-- 联系方式 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-6">联系方式</h2>
        
        <form @submit.prevent="saveContact" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
              <input
                v-model="form.contact.phone"
                type="text"
                placeholder="400-xxx-xxxx"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">手机号码</label>
              <input
                v-model="form.contact.mobile"
                type="text"
                placeholder="138xxxxxxx"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">电子邮箱</label>
              <input
                v-model="form.contact.email"
                type="email"
                placeholder="info@example.com"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">传真</label>
              <input
                v-model="form.contact.fax"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">公司地址</label>
            <input
              v-model="form.contact.address"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">详细地址</label>
            <textarea
              v-model="form.contact.address_detail"
              rows="2"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="savingContact"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ savingContact ? '保存中...' : '保存联系方式' }}
            </button>
          </div>
        </form>
      </div>

      <!-- 备案信息 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-6">备案信息</h2>
        
        <form @submit.prevent="saveIcp" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ICP 备案号</label>
            <input
              v-model="form.icp"
              type="text"
              placeholder="如：豫ICP备xxxxxxx号"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">公安备案号</label>
            <input
              v-model="form.public_icp"
              type="text"
              placeholder="如：公网安备 xxxxxxxxx号"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="savingIcp"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ savingIcp ? '保存中...' : '保存备案信息' }}
            </button>
          </div>
        </form>
      </div>

      <!-- 导航栏配置 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-6">导航栏配置</h2>
        
        <div class="space-y-4">
          <div
            v-for="(item, index) in form.nav_items"
            :key="index"
            class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex-1 grid grid-cols-3 gap-4">
              <input
                v-model="item.label"
                type="text"
                placeholder="菜单名称"
                class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                v-model="item.path"
                type="text"
                placeholder="/path"
                class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <select
                v-model="item.target"
                class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">当前窗口</option>
                <option value="_blank">新窗口</option>
              </select>
            </div>
            <button
              @click="removeNavItem(index)"
              class="text-red-500 hover:text-red-700 p-2"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>

          <button
            @click="addNavItem"
            class="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            <i class="fas fa-plus mr-2"></i>添加导航项
          </button>
        </div>

        <div class="mt-6 flex justify-end">
          <button
            @click="saveNav"
            :disabled="savingNav"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ savingNav ? '保存中...' : '保存导航配置' }}
          </button>
        </div>
      </div>

      <!-- 页脚配置 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-6">页脚配置</h2>
        
        <form @submit.prevent="saveFooter" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">版权信息</label>
            <input
              v-model="form.footer_copyright"
              type="text"
              placeholder="© 2024 公司名 版权所有"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">页脚描述</label>
            <textarea
              v-model="form.footer_description"
              rows="2"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="savingFooter"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ savingFooter ? '保存中...' : '保存页脚配置' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const supabase = useSupabaseClient()

// 状态
const loading = ref(true)
const savingBasic = ref(false)
const savingContact = ref(false)
const savingIcp = ref(false)
const savingNav = ref(false)
const savingFooter = ref(false)

// 表单数据
interface SettingsForm {
  site_name: string
  company_name: string
  slogan: string
  description: string
  site_logo: string
  site_favicon: string
  icp: string
  public_icp: string
  contact: Record<string, string>
  nav_items: { label: string; path: string; target: string }[]
  footer_copyright: string
  footer_description: string
}

const form = reactive<SettingsForm>({
  site_name: '',
  company_name: '',
  slogan: '',
  description: '',
  site_logo: '',
  site_favicon: '',
  icp: '',
  public_icp: '',
  contact: {
    phone: '',
    mobile: '',
    email: '',
    fax: '',
    address: '',
    address_detail: ''
  },
  nav_items: [],
  footer_copyright: '',
  footer_description: ''
})

// 系统设置类型
interface SystemSettings {
  site_name: string | null
  company_name: string | null
  slogan: string | null
  description: string | null
  site_logo: string | null
  site_favicon: string | null
  icp: string | null
  contact: Record<string, string> | null
  nav_config: { label: string; path: string; target: string }[] | null
  footer_config: { copyright: string; description: string } | null
}

// 获取配置
async function fetchSettings() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', 'main')
      .single()

    if (error || !data) {
      // 使用默认值
      loading.value = false
      return
    }

    const settings = data as SystemSettings
    form.site_name = settings.site_name || ''
    form.company_name = settings.company_name || ''
    form.slogan = settings.slogan || ''
    form.description = settings.description || ''
    form.site_logo = settings.site_logo || ''
    form.site_favicon = settings.site_favicon || ''
    form.icp = settings.icp || ''
    form.contact = settings.contact || { phone: '', mobile: '', email: '', fax: '', address: '', address_detail: '' }
    form.nav_items = settings.nav_config || []
    form.footer_copyright = settings.footer_config?.copyright || ''
    form.footer_description = settings.footer_config?.description || ''
  } catch (err) {
    console.error('获取配置失败:', err)
  } finally {
    loading.value = false
  }
}

// 保存基础信息
async function saveBasicInfo() {
  savingBasic.value = true
  try {
    const { error } = await (supabase
      .from('system_settings') as any)
      .update({
        site_name: form.site_name,
        company_name: form.company_name,
        slogan: form.slogan,
        description: form.description
      })
      .eq('id', 'main')

    if (error) {
      alert('保存失败：' + error.message)
      return
    }

    alert('保存成功！')
  } catch (err: any) {
    alert('保存失败：' + err.message)
  } finally {
    savingBasic.value = false
  }
}

// 保存 Logo
async function saveLogo() {
  savingBasic.value = true
  try {
    const { error } = await (supabase
      .from('system_settings') as any)
      .update({
        site_logo: form.site_logo,
        site_favicon: form.site_favicon
      })
      .eq('id', 'main')

    if (error) {
      alert('保存失败：' + error.message)
      return
    }

    alert('保存成功！')
  } catch (err: any) {
    alert('保存失败：' + err.message)
  } finally {
    savingBasic.value = false
  }
}

// 保存联系方式
async function saveContact() {
  savingContact.value = true
  try {
    const { error } = await (supabase
      .from('system_settings') as any)
      .update({
        contact: form.contact
      })
      .eq('id', 'main')

    if (error) {
      alert('保存失败：' + error.message)
      return
    }

    alert('保存成功！')
  } catch (err: any) {
    alert('保存失败：' + err.message)
  } finally {
    savingContact.value = false
  }
}

// 保存备案信息
async function saveIcp() {
  savingIcp.value = true
  try {
    const { error } = await (supabase
      .from('system_settings') as any)
      .update({
        icp: form.icp
      })
      .eq('id', 'main')

    if (error) {
      alert('保存失败：' + error.message)
      return
    }

    alert('保存成功！')
  } catch (err: any) {
    alert('保存失败：' + err.message)
  } finally {
    savingIcp.value = false
  }
}

// 添加导航项
function addNavItem() {
  form.nav_items.push({ label: '', path: '', target: '' })
}

// 移除导航项
function removeNavItem(index: number) {
  form.nav_items.splice(index, 1)
}

// 保存导航配置
async function saveNav() {
  savingNav.value = true
  try {
    const { error } = await (supabase
      .from('system_settings') as any)
      .update({
        nav_config: form.nav_items
      })
      .eq('id', 'main')

    if (error) {
      alert('保存失败：' + error.message)
      return
    }

    alert('保存成功！')
  } catch (err: any) {
    alert('保存失败：' + err.message)
  } finally {
    savingNav.value = false
  }
}

// 保存页脚配置
async function saveFooter() {
  savingFooter.value = true
  try {
    const { error } = await (supabase
      .from('system_settings') as any)
      .update({
        footer_config: {
          copyright: form.footer_copyright,
          description: form.footer_description
        }
      })
      .eq('id', 'main')

    if (error) {
      alert('保存失败：' + error.message)
      return
    }

    alert('保存成功！')
  } catch (err: any) {
    alert('保存失败：' + err.message)
  } finally {
    savingFooter.value = false
  }
}

// 页面加载
onMounted(() => {
  fetchSettings()
})
</script>
