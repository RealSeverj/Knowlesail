import { Capacitor } from "@capacitor/core"

/**
 * 本地存储工具函数
 * 提供统一的 localStorage 操作接口，支持：
 * - JSON 序列化/反序列化
 * - 错误处理
 * - 带过期时间的缓存
 * - 防抖保存
 */
// ==================== 存储键名常量 ====================
export const STORAGE_KEYS = {
  // Chat 模块
  CHAT_CONVERSATIONS: 'chat_conversations',

  // Curriculum 模块
  CURRICULUM_COURSES: 'curriculum_courses',
  CURRICULUM_TERM: 'curriculum_term',
  CURRICULUM_LOCAL_COURSES: 'curriculum_local_courses',
  CURRICULUM_TERM_INFO: 'curriculum_term_info',

  // Todo 模块
  TODOS_CACHE: 'todos_cache',
  TODOS_CACHE_TIME: 'todos_cache_time'
}

// 默认缓存过期时间（5分钟）
const DEFAULT_CACHE_EXPIRY_MS = 5 * 60 * 1000

// ==================== 基础存储操作 ====================

/**
 * 从 localStorage 获取数据
 * @param {string} key - 存储键名
 * @param {*} defaultValue - 默认值（获取失败或不存在时返回）
 * @returns {*} 解析后的数据或默认值
 */
export function getItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    if (item === null) {
      return defaultValue
    }
    return JSON.parse(item)
  } catch (error) {
    console.error(`[Storage] 读取 "${key}" 失败:`, error)
    return defaultValue
  }
}

/**
 * 保存数据到 localStorage
 * @param {string} key - 存储键名
 * @param {*} value - 要保存的数据（会自动 JSON 序列化）
 * @returns {boolean} 是否保存成功
 */
export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`[Storage] 保存 "${key}" 失败:`, error)
    return false
  }
}

/**
 * 从 localStorage 移除指定项
 * @param {string} key - 存储键名
 * @returns {boolean} 是否移除成功
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`[Storage] 移除 "${key}" 失败:`, error)
    return false
  }
}

/**
 * 批量移除 localStorage 项
 * @param {string[]} keys - 存储键名数组
 */
export function removeItems(keys) {
  keys.forEach((key) => removeItem(key))
}

/**
 * 清除所有应用相关的存储数据
 */
export function clearAllAppData() {
  Object.values(STORAGE_KEYS).forEach((key) => removeItem(key))
}

// ==================== 带过期时间的缓存操作 ====================

/**
 * 保存带时间戳的缓存数据
 * @param {string} key - 存储键名
 * @param {*} value - 要保存的数据
 * @param {string} [timeKey] - 时间戳键名（默认为 key + '_time'）
 */
export function setCache(key, value, timeKey = null) {
  const actualTimeKey = timeKey || `${key}_time`
  setItem(key, value)
  setItem(actualTimeKey, Date.now())
}

/**
 * 获取缓存数据
 * @param {string} key - 存储键名
 * @param {*} defaultValue - 默认值
 * @returns {*} 缓存数据或默认值
 */
export function getCache(key, defaultValue = null) {
  return getItem(key, defaultValue)
}

/**
 * 检查缓存是否过期
 * @param {string} key - 存储键名
 * @param {number} [expiryMs] - 过期时间（毫秒），默认 5 分钟
 * @param {string} [timeKey] - 时间戳键名（默认为 key + '_time'）
 * @returns {boolean} 是否已过期
 */
export function isCacheExpired(key, expiryMs = DEFAULT_CACHE_EXPIRY_MS, timeKey = null) {
  try {
    const actualTimeKey = timeKey || `${key}_time`
    const cacheTime = localStorage.getItem(actualTimeKey)
    if (!cacheTime) return true
    return Date.now() - parseInt(cacheTime) > expiryMs
  } catch {
    return true
  }
}

/**
 * 清除缓存（包括数据和时间戳）
 * @param {string} key - 存储键名
 * @param {string} [timeKey] - 时间戳键名（默认为 key + '_time'）
 */
export function clearCache(key, timeKey = null) {
  const actualTimeKey = timeKey || `${key}_time`
  removeItem(key)
  removeItem(actualTimeKey)
}

/**
 * 获取缓存并检查是否过期
 * @param {string} key - 存储键名
 * @param {number} [expiryMs] - 过期时间（毫秒）
 * @param {*} defaultValue - 默认值
 * @returns {{ data: *, expired: boolean }} 缓存数据和是否过期
 */
export function getCacheWithExpiry(key, expiryMs = DEFAULT_CACHE_EXPIRY_MS, defaultValue = null) {
  const data = getCache(key, defaultValue)
  const expired = isCacheExpired(key, expiryMs)
  return { data, expired }
}

// ==================== 防抖保存 ====================

// 存储防抖定时器的 Map
const debounceTimers = new Map()

/**
 * 防抖保存数据到 localStorage
 * @param {string} key - 存储键名
 * @param {*} value - 要保存的数据
 * @param {number} [delay=1000] - 防抖延迟时间（毫秒）
 */
export function debouncedSetItem(key, value, delay = 1000) {
  // 清除之前的定时器
  if (debounceTimers.has(key)) {
    clearTimeout(debounceTimers.get(key))
  }

  // 设置新的定时器
  const timer = setTimeout(() => {
    setItem(key, value)
    debounceTimers.delete(key)
  }, delay)

  debounceTimers.set(key, timer)
}

/**
 * 立即执行待处理的防抖保存
 * @param {string} key - 存储键名
 * @param {*} value - 要保存的数据
 */
export function flushDebouncedSetItem(key, value) {
  if (debounceTimers.has(key)) {
    clearTimeout(debounceTimers.get(key))
    debounceTimers.delete(key)
  }
  setItem(key, value)
}

// ==================== 创建模块化存储管理器 ====================

/**
 * 创建模块专用的存储管理器
 * @param {string} prefix - 模块前缀
 * @returns {Object} 存储管理器对象
 */
export function createStorageManager(prefix) {
  const getFullKey = (key) => `${prefix}_${key}`

  return {
    /**
     * 获取数据
     */
    get(key, defaultValue = null) {
      return getItem(getFullKey(key), defaultValue)
    },

    /**
     * 保存数据
     */
    set(key, value) {
      return setItem(getFullKey(key), value)
    },

    /**
     * 移除数据
     */
    remove(key) {
      return removeItem(getFullKey(key))
    },

    /**
     * 防抖保存
     */
    debouncedSet(key, value, delay = 1000) {
      debouncedSetItem(getFullKey(key), value, delay)
    },

    /**
     * 保存带时间戳的缓存
     */
    setCache(key, value) {
      setCache(getFullKey(key), value)
    },

    /**
     * 获取缓存
     */
    getCache(key, defaultValue = null) {
      return getCache(getFullKey(key), defaultValue)
    },

    /**
     * 检查缓存是否过期
     */
    isCacheExpired(key, expiryMs = DEFAULT_CACHE_EXPIRY_MS) {
      return isCacheExpired(getFullKey(key), expiryMs)
    },

    /**
     * 清除缓存
     */
    clearCache(key) {
      clearCache(getFullKey(key))
    },

    /**
     * 获取缓存并检查过期状态
     */
    getCacheWithExpiry(key, expiryMs = DEFAULT_CACHE_EXPIRY_MS, defaultValue = null) {
      return getCacheWithExpiry(getFullKey(key), expiryMs, defaultValue)
    }
  }
}

// ==================== 预定义的模块存储管理器 ====================

export const chatStorage = createStorageManager('chat')
export const curriculumStorage = createStorageManager('curriculum')
export const todoStorage = createStorageManager('todo')

// ==================== 默认导出 ====================

export default {
  // 常量
  STORAGE_KEYS,

  // 基础操作
  getItem,
  setItem,
  removeItem,
  removeItems,
  clearAllAppData,

  // 缓存操作
  setCache,
  getCache,
  isCacheExpired,
  clearCache,
  getCacheWithExpiry,

  // 防抖操作
  debouncedSetItem,
  flushDebouncedSetItem,

  // 工厂函数
  createStorageManager,

  // 预定义管理器
  chatStorage,
  curriculumStorage,
  todoStorage
}
