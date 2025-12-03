import axios from 'axios'

export const apiBaseURL = 'http://118.196.24.221'

// 创建 axios 实例，后续如果需要可添加鉴权、重试、全局错误处理等拦截器
export const http = axios.create({
  baseURL: apiBaseURL,
  timeout: 15000
})

// 请求拦截（自动注入 token）
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截：统一返回 data；错误抛出由调用方自行捕获
http.interceptors.response.use(
  (res) => res.data,
  (error) => {
    // 可以在这里做全局 toast / 上报
    console.error('API 请求错误：', error)
    return Promise.reject(error)
  }
)

// 轻量 apiClient：仅做最简封装，url 使用相对路径（例如 /mcp/api/v1/xxx）
export const apiClient = {
  get: (url, options) =>
    http.get(url, options?.params ? { params: options.params, ...options } : options),
  post: (url, options) => http.post(url, options?.body, options),
  put: (url, options) => http.put(url, options?.body, options),
  patch: (url, options) => http.patch(url, options?.body, options),
  delete: (url, options) => http.delete(url, options)
}
