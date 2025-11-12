// 通用型函数

/**
 * 防抖函数：在事件触发后延迟指定时间执行，如果在延迟期间再次触发则重新计时
 * @param {Function} func - 需要防抖的函数
 * @param {Number} delay - 延迟时间（毫秒）
 * @param {Boolean} [immediate=false] - 是否立即执行（首次触发时立即执行，之后等待延迟）
 * @returns {Function} 包装后的防抖函数
 */
export function debounce(func, delay, immediate = false) {
  let timer = null

  return function (...args) {
    const context = this

    // 清除之前的定时器
    if (timer) clearTimeout(timer)

    // 立即执行模式
    if (immediate) {
      const callNow = !timer
      // 设置定时器，delay时间后清空timer，允许下次立即执行
      timer = setTimeout(() => {
        timer = null
      }, delay)
      // 如果是首次触发，立即执行
      if (callNow) func.apply(context, args)
    } else {
      // 非立即执行模式：延迟执行
      timer = setTimeout(() => {
        func.apply(context, args)
        timer = null
      }, delay)
    }
  }
}

/**
 * 节流函数：每隔指定时间最多执行一次函数
 * @param {Function} func - 需要节流的函数
 * @param {Number} interval - 时间间隔（毫秒）
 * @param {String} [type='timer'] - 节流类型：'timer'（时间戳模式）或 'leading'（前缘触发）
 * @returns {Function} 包装后的节流函数
 */
export function throttle(func, interval, type = 'timer') {
  if (type === 'timer') {
    // 时间戳模式：首次触发立即执行，之后每隔interval执行一次
    let lastTime = 0
    return function (...args) {
      const now = Date.now()
      const context = this
      if (now - lastTime >= interval) {
        func.apply(context, args)
        lastTime = now
      }
    }
  } else {
    // 前缘触发模式：触发后等待interval再执行，期间触发不执行
    let timer = null
    return function (...args) {
      const context = this
      if (!timer) {
        timer = setTimeout(() => {
          func.apply(context, args)
          timer = null
        }, interval)
      }
    }
  }
}
