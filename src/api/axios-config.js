import axios from 'axios'
import { useToastBus } from '@/composables/useToast'

export const apiBaseURL = 'http://118.196.24.221'

// 创建 axios 实例，后续如果需要可添加鉴权、重试、全局错误处理等拦截器
export const http = axios.create({
  baseURL: apiBaseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 用于防止多个请求同时触发刷新凭证
let isRefreshing = false
let refreshSubscribers = []

// 订阅刷新完成事件
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback)
}

// 通知所有订阅者刷新完成
const onRefreshed = (success) => {
  refreshSubscribers.forEach((callback) => callback(success))
  refreshSubscribers = []
}

// 执行登录刷新凭证
const refreshCredentials = async () => {
  const stuId = JSON.parse(localStorage.getItem('user_info') || '{}')?.stu_id
  const password = localStorage.getItem('auth_password') // 需要存储密码用于自动重登录

  if (!stuId || !password) {
    return false
  }

  try {
    // 直接使用 axios 调用登录接口，避免循环依赖
    const res = await axios.post(`${apiBaseURL}/api/v1/user/login`, {
      stu_id: stuId,
      password
    })

    const data = res.data?.data || res.data

    if (data?.access_token) {
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('auth_identifier', data.identifier)
      localStorage.setItem('auth_cookie', data.cookie)
      return true
    }
    return false
  } catch (error) {
    console.error('自动刷新凭证失败:', error)
    return false
  }
}

// 执行登出并跳转到登录页
const performLogout = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_identifier')
  localStorage.removeItem('auth_cookie')
  localStorage.removeItem('auth_password')
  localStorage.removeItem('user_info')

  // 使用 toast 提示
  const toastBus = useToastBus()
  toastBus.show('登录已过期，请重新登录', { type: 'error', duration: 3000 })

  // 跳转到登录页
  window.location.href = '/#/login'
}

// 请求拦截（自动注入认证信息：Id、Cookies、Authorization）
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  const identifier = localStorage.getItem('auth_identifier')
  const cookie = localStorage.getItem('auth_cookie')

  if (token) {
    config.headers.Authorization = token
  }
  if (identifier) {
    config.headers.Id = identifier
  }
  if (cookie) {
    config.headers.Cookies = cookie
  }

  return config
})

// 响应拦截：统一返回 data；处理 50001 错误码自动刷新凭证
http.interceptors.response.use(
  async (res) => {
    const data = res.data
    console.log('API Response:', data)
    // 检查是否返回 50001 错误码（凭证过期）
    if (data?.code === '50001' || data?.code === 50001) {
      const originalRequest = res.config

      // 防止重复刷新
      if (!isRefreshing) {
        isRefreshing = true

        const refreshSuccess = await refreshCredentials()

        isRefreshing = false
        onRefreshed(refreshSuccess)

        if (refreshSuccess) {
          // 刷新成功，重新发起原请求
          originalRequest.headers.Authorization = localStorage.getItem('auth_token')
          originalRequest.headers.Id = localStorage.getItem('auth_identifier')
          originalRequest.headers.Cookies = localStorage.getItem('auth_cookie')
          return http(originalRequest)
        } else {
          // 刷新失败，登出
          performLogout()
          return Promise.reject(new Error('凭证刷新失败'))
        }
      } else {
        // 正在刷新中，等待刷新完成
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((success) => {
            if (success) {
              originalRequest.headers.Authorization = localStorage.getItem('auth_token')
              originalRequest.headers.Id = localStorage.getItem('auth_identifier')
              originalRequest.headers.Cookies = localStorage.getItem('auth_cookie')
              resolve(http(originalRequest))
            } else {
              reject(new Error('凭证刷新失败'))
            }
          })
        })
      }
    }

    // 统一处理业务错误码（非 10000 视为业务错误）
    if (data?.code && data.code !== '10000' && data.code !== 10000) {
      const error = new Error(data.message || '请求失败')
      error.code = data.code
      error.data = data
      return Promise.reject(error)
    }

    return data
  },
  (error) => {
    console.error('API 请求错误：', error)
    return Promise.reject(error)
  }
)
