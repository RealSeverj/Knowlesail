import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref(localStorage.getItem('auth_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user_info') || 'null'))

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)

  // 方法
  const login = (userInfo, authToken) => {
    token.value = authToken
    user.value = userInfo
    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('user_info', JSON.stringify(userInfo))
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
  }

  const updateUser = (userInfo) => {
    user.value = userInfo
    localStorage.setItem('user_info', JSON.stringify(userInfo))
  }

  // 开发环境快速跳过登录（最小改动）
  // 设置 .env.development 中 VITE_SKIP_AUTH=true 即可开启
  if (import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH && !token.value) {
    // 仅在首次没有 token 时注入模拟用户
    const devUser = {
      id: 'dev',
      name: '开发模式用户',
      role: 'dev'
    }
    login(devUser, 'dev-skip-token')
    console.info('[auth] 已在开发模式下跳过登录')
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    updateUser
  }
})
