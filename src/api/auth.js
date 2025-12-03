import { http } from './axios-config'

/**
 * 用户登录
 * @param {string} stu_id - 学号
 * @param {string} password - 密码
 * @returns {Promise<{identifier: string, cookie: string, access_token: string}>}
 */
export const loginApi = (stu_id, password) => {
  return http.post('/api/v1/user/login', {
    stu_id,
    password
  })
}
