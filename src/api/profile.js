import { http } from './axios-config'

/**
 * 获取用户信息
 * @returns {Promise<{data: Object}>} 返回用户信息
 */
export function getUserInfo() {
  return http.get('/api/v1/user/info')
}
