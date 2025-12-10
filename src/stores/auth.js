import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getItem, setItem, removeItem } from '@/utils/storage'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref(getItem('auth_token', null))
  const identifier = ref(getItem('auth_identifier', null))
  const cookie = ref(getItem('auth_cookie', null))
  const user = ref(getItem('user_info', null))

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)

  // 方法
  const login = (userInfo, authCredentials) => {
    // authCredentials 包含 { access_token, identifier, cookie }
    token.value = authCredentials.access_token
    identifier.value = authCredentials.identifier
    cookie.value = authCredentials.cookie
    user.value = userInfo

    setItem('auth_token', authCredentials.access_token)
    setItem('auth_identifier', authCredentials.identifier)
    setItem('auth_cookie', authCredentials.cookie)
    setItem('user_info', userInfo)
  }

  const logout = () => {
    token.value = null
    identifier.value = null
    cookie.value = null
    user.value = null
    removeItem('auth_token')
    removeItem('auth_identifier')
    removeItem('auth_cookie')
    removeItem('auth_password')
    removeItem('user_info')
  }

  const updateUser = (userInfo) => {
    user.value = userInfo
    setItem('user_info', userInfo)
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
