<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { loginApi } from '@/api/auth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const stuId = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!stuId.value || !password.value) {
    toast.warning('请输入学号和密码')
    return
  }

  loading.value = true

  try {
    const res = await loginApi(stuId.value, password.value)

    // axios 响应拦截器已返回 res.data，所以 res 就是后端返回的 JSON
    // 后端返回格式: { data: { identifier, cookie, access_token } }
    const data = res.data || res
    const userInfo = {
      id: data.identifier,
      stu_id: stuId.value
    }

    // 登录凭证包含三个字段
    const authCredentials = {
      access_token: data.access_token,
      identifier: data.identifier,
      cookie: data.cookie
    }

    if (!authCredentials.access_token) {
      toast.error('登录失败：服务器未返回有效 token')
      return
    }

    authStore.login(userInfo, authCredentials)
    // 保存密码用于自动刷新凭证（当收到 50001 错误码时）
    localStorage.setItem('auth_password', password.value)
    toast.success('登录成功')

    // 等待状态同步后再跳转
    await new Promise((resolve) => setTimeout(resolve, 100))
    router.replace({ name: 'Home' })
  } catch (error) {
    console.error('登录失败:', error)
    toast.error(error.response?.data?.message || '登录失败，请检查学号和密码')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-screen flex flex-col px-8 pt-20 pb-8"
  >
    <!-- Logo 和标题区域 -->
    <div class="flex flex-col items-center mb-12">
      <div
        class="w-20 h-20 flex items-center justify-center mb-6"
      >
        <img src="/icon.png" alt="Logo" width="80" height="80" />
      </div>
      <h1 class="text-2xl font-bold text-slate-800 dark:text-white mb-2">学海智航</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400">智能学习助手平台</p>
    </div>

    <!-- 表单区域 -->
    <div class="flex flex-col gap-4 w-full max-w-sm mx-auto">
      <div class="relative">
        <var-icon
          name="account-circle-outline"
          :size="20"
          class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10"
        />
        <input
          v-model="stuId"
          type="text"
          placeholder="请输入学号"
          :disabled="loading"
          class="w-full h-12 pl-12 pr-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
        />
      </div>

      <div class="relative">
        <var-icon
          name="lock-outline"
          :size="20"
          class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10"
        />
        <input
          v-model="password"
          type="password"
          placeholder="请输入密码"
          :disabled="loading"
          class="w-full h-12 pl-12 pr-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
          @keyup.enter="handleLogin"
        />
      </div>

      <!-- 登录按钮 -->
      <button
        :disabled="loading"
        class="w-full h-12 mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        @click="handleLogin"
      >
        <span>{{ loading ? '登录中...' : '登录' }}</span>
      </button>
    </div>

    <!-- 底部信息 -->
    <div class="mt-auto pt-8 pb-12 text-center">
      <p class="text-xs text-slate-400 dark:text-slate-500">
        登录即表示同意《用户协议》和《隐私政策》
      </p>
    </div>
  </div>
</template>
