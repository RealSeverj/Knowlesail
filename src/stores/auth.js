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

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    updateUser
  }
})
