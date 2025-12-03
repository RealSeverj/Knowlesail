import axios from 'axios'

export const apiBaseURL = 'http://118.196.24.221'

// 创建 axios 实例，后续如果需要可添加鉴权、重试、全局错误处理等拦截器
export const http = axios.create({
  baseURL: apiBaseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

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

// 响应拦截：统一返回 data；错误抛出由调用方自行捕获
http.interceptors.response.use(
  (res) => res.data,
  (error) => {
    console.error('API 请求错误：', error)
    return Promise.reject(error)
  }
)
