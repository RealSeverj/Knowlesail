import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref(localStorage.getItem('auth_token') || null)
  const identifier = ref(localStorage.getItem('auth_identifier') || null)
  const cookie = ref(localStorage.getItem('auth_cookie') || null)
  const user = ref(JSON.parse(localStorage.getItem('user_info') || 'null'))

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)

  // 方法
  const login = (userInfo, authCredentials) => {
    // authCredentials 包含 { access_token, identifier, cookie }
    token.value = authCredentials.access_token
    identifier.value = authCredentials.identifier
    cookie.value = authCredentials.cookie
    user.value = userInfo

    localStorage.setItem('auth_token', authCredentials.access_token)
    localStorage.setItem('auth_identifier', authCredentials.identifier)
    localStorage.setItem('auth_cookie', authCredentials.cookie)
    localStorage.setItem('user_info', JSON.stringify(userInfo))
  }

  const logout = () => {
    token.value = null
    identifier.value = null
    cookie.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_identifier')
    localStorage.removeItem('auth_cookie')
    localStorage.removeItem('auth_password')
    localStorage.removeItem('user_info')
  }

  const updateUser = (userInfo) => {
    user.value = userInfo
    localStorage.setItem('user_info', JSON.stringify(userInfo))
  }

  return {
    token,
    identifier,
    cookie,
    user,
    isAuthenticated,
    login,
    logout,
    updateUser
  }
})
