// 下拉刷新组合式函数
import { ref } from 'vue'

/**
 * 下拉刷新组合式函数
 * @param {Function} refreshFn - 刷新时执行的异步函数
 * @param {Object} options - 配置选项
 * @param {number} options.minDelay - 最小刷新延迟（毫秒），防止刷新太快
 * @returns {Object} - 返回状态和方法
 */
export function usePullRefresh(refreshFn, options = {}) {
  const { minDelay = 500 } = options
  
  const refreshing = ref(false)
  const error = ref(null)
  const lastRefreshTime = ref(null)

  /**
   * 执行刷新
   */
  async function onRefresh() {
    if (refreshing.value) return

    refreshing.value = true
    error.value = null
    const startTime = Date.now()

    try {
      if (typeof refreshFn === 'function') {
        await refreshFn()
      }
      lastRefreshTime.value = new Date()
    } catch (e) {
      error.value = e
      console.error('刷新失败：', e)
    } finally {
      // 确保至少显示最小延迟时间，提升用户体验
      const elapsed = Date.now() - startTime
      if (elapsed < minDelay) {
        await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed))
      }
      refreshing.value = false
    }
  }

  /**
   * 重置状态
   */
  function reset() {
    refreshing.value = false
    error.value = null
  }

  return {
    refreshing,
    error,
    lastRefreshTime,
    onRefresh,
    reset
  }
}