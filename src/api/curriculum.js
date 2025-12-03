import { http } from './axios-config'

/**
 * 根据当前时间自动计算学期代码
 * 学期格式：YYYYMM，例如 202501 表示 2024-2025 学年第二学期
 * 规则：
 * - 每年 2-7 月为春季学期（第二学期），学期代码为 上一年年份 + "02"
 * - 每年 8-1 月为秋季学期（第一学期），学期代码为 当前年份 + "01"
 */
export function getCurrentTerm() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 0-indexed

  // 春季学期：2月-7月
  if (month >= 2 && month <= 7) {
    // 春季学期代码：上一年年份 + 02
    // 例如：2025年3月 -> 202402（2024-2025学年第二学期）
    return `${year - 1}02`
  } else {
    // 秋季学期：8月-次年1月
    // 秋季学期代码：当前年份 + 01
    // 例如：2024年9月 -> 202401（2024-2025学年第一学期）
    // 例如：2025年1月 -> 202401（仍属于秋季学期）
    if (month === 1) {
      // 1月仍属于上一年开始的秋季学期
      return `${year - 1}01`
    }
    return `${year}01`
  }
}

/**
 * 获取课程列表
 * @param {Object} options - 请求选项
 * @param {string} options.term - 学期代码，默认自动计算
 * @param {boolean} options.isRefresh - 是否强制刷新，默认 false
 * @returns {Promise<Object>} 课程列表数据
 */
export function getCourseList(options = {}) {
  const { term = getCurrentTerm(), isRefresh = false } = options

  return http.get('/api/v1/course/list', {
    params: {
      term,
      is_refresh: isRefresh
    }
  })
}
