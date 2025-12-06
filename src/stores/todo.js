import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import * as todoApi from '@/api/todo'
import {
  STORAGE_KEYS,
  getItem,
  setItem,
  isCacheExpired as checkCacheExpired,
  clearCache as clearStorageCache
} from '@/utils/storage'

// priority: 1-4 对应四象限
// 1: 紧急且重要
// 2: 不紧急但重要
// 3: 紧急但不重要
// 4: 不紧急不重要

// 缓存有效期（毫秒），默认 5 分钟
const CACHE_EXPIRY_MS = 5 * 60 * 1000

/**
 * 从 localStorage 加载缓存的 todos
 */
function loadFromCache() {
  return getItem(STORAGE_KEYS.TODOS_CACHE, null)
}

/**
 * 保存 todos 到 localStorage
 */
function saveToCache(data) {
  setItem(STORAGE_KEYS.TODOS_CACHE, data)
  setItem(STORAGE_KEYS.TODOS_CACHE_TIME, Date.now())
}

/**
 * 检查缓存是否过期
 */
function isCacheExpired() {
  return checkCacheExpired(STORAGE_KEYS.TODOS_CACHE, CACHE_EXPIRY_MS, STORAGE_KEYS.TODOS_CACHE_TIME)
}

/**
 * 清除 todos 缓存
 */
function clearCache() {
  clearStorageCache(STORAGE_KEYS.TODOS_CACHE, STORAGE_KEYS.TODOS_CACHE_TIME)
}

export const useTodoStore = defineStore('todo', () => {
  // 初始化时先从缓存加载
  const cachedTodos = loadFromCache()
  const todos = ref(cachedTodos || [])
  const loading = ref(false)
  const error = ref(null)
  // 标记是否已初始化（从服务器获取过数据）
  const initialized = ref(false)

  // 监听 todos 变化，自动保存到缓存
  watch(
    todos,
    (newTodos) => {
      if (newTodos && newTodos.length >= 0) {
        saveToCache(newTodos)
      }
    },
    { deep: true }
  )

  const quadrantMap = {
    1: '紧急且重要',
    2: '重要不紧急',
    3: '紧急不重要',
    4: '不重要不紧急'
  }

  const quadrantTodos = computed(() => ({
    1: todos.value.filter((t) => t.priority === 1),
    2: todos.value.filter((t) => t.priority === 2),
    3: todos.value.filter((t) => t.priority === 3),
    4: todos.value.filter((t) => t.priority === 4)
  }))

  /**
   * 将前端 todo 数据转换为后端 API 格式
   */
  function toApiFormat(payload) {
    return {
      title: payload.title || '',
      content: payload.note || payload.content || '',
      start_time: payload.startTime || 0,
      end_time: payload.deadline ? new Date(payload.deadline).getTime() : 0,
      is_all_day: payload.isAllDay ? 1 : 0,
      priority: payload.priority || 1,
      remind_at: payload.remindAt || 0,
      category: payload.category || '默认'
    }
  }

  /**
   * 将后端 API 数据转换为前端 todo 格式
   */
  function fromApiFormat(apiData) {
    return {
      id: apiData.id,
      title: apiData.title || '',
      note: apiData.content || '',
      category: apiData.category || '默认',
      deadline: apiData.end_time ? new Date(apiData.end_time).toISOString() : null,
      startTime: apiData.start_time || 0,
      isAllDay: apiData.is_all_day === 1,
      priority: apiData.priority || 1,
      remindAt: apiData.remind_at || 0,
      completed: apiData.status === 1 // 假设 status=1 表示已完成
    }
  }

  /**
   * 添加待办事项
   */
  async function addTodo(payload) {
    loading.value = true
    error.value = null
    try {
      const apiData = toApiFormat(payload)
      const result = await todoApi.createTodo(apiData)

      // API 返回格式: { code, message, data: { id } }
      const todoId = result.data?.id || result.id

      // 将新创建的 todo 添加到本地列表
      const newTodo = {
        id: todoId,
        title: payload.title,
        note: payload.note || '',
        category: payload.category || '默认',
        deadline: payload.deadline || null,
        priority: payload.priority || 1,
        completed: false
      }
      todos.value.push(newTodo)
      return todoId
    } catch (err) {
      console.error('Store addTodo - error:', err)
      error.value = err.message || '添加待办失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 切换待办完成状态
   */
  async function toggleTodo(id) {
    const target = todos.value.find((t) => t.id === id)
    if (!target) return

    loading.value = true
    error.value = null
    try {
      const newStatus = target.completed ? 0 : 1
      await todoApi.updateTodo({
        id,
        title: target.title,
        content: target.note || '',
        start_time: target.startTime || 0,
        end_time: target.deadline ? new Date(target.deadline).getTime() : 0,
        is_all_day: target.isAllDay ? 1 : 0,
        status: newStatus,
        priority: target.priority || 1,
        remind_at: target.remindAt || 0,
        category: target.category || '默认'
      })
      target.completed = !target.completed
    } catch (err) {
      error.value = err.message || '更新待办状态失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新待办事项
   */
  async function updateTodo(id, patch) {
    const target = todos.value.find((t) => t.id === id)
    if (!target) return

    loading.value = true
    error.value = null
    try {
      const updatedTodo = { ...target, ...patch }
      await todoApi.updateTodo({
        id,
        title: updatedTodo.title,
        content: updatedTodo.note || '',
        start_time: updatedTodo.startTime || 0,
        end_time: updatedTodo.deadline ? new Date(updatedTodo.deadline).getTime() : 0,
        is_all_day: updatedTodo.isAllDay ? 1 : 0,
        status: updatedTodo.completed ? 1 : 0,
        priority: updatedTodo.priority || 1,
        remind_at: updatedTodo.remindAt || 0,
        category: updatedTodo.category || '默认'
      })
      Object.assign(target, patch)
      return id
    } catch (err) {
      error.value = err.message || '更新待办失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除待办事项
   */
  async function removeTodo(id) {
    loading.value = true
    error.value = null
    try {
      await todoApi.deleteTodo(id)
      const index = todos.value.findIndex((t) => t.id === id)
      if (index !== -1) todos.value.splice(index, 1)
      return id
    } catch (err) {
      error.value = err.message || '删除待办失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取待办事项详情
   * @param {string} id - 待办事项ID
   */
  async function fetchTodoDetail(id) {
    loading.value = true
    error.value = null
    try {
      const result = await todoApi.getTodoDetail(id)

      // API 返回格式: { code, message, data: { todo } }
      const todoData = result.data?.todo || result.todo
      const todo = fromApiFormat(todoData)

      // 更新本地列表中的对应项
      const index = todos.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        todos.value[index] = todo
      } else {
        todos.value.push(todo)
      }
      return todo
    } catch (err) {
      error.value = err.message || '获取待办详情失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取待办事项列表
   * @param {Object} params - 查询参数
   * @param {number} [params.status] - 状态筛选
   * @param {number} [params.priority] - 优先级筛选
   * @param {string} [params.category] - 分类筛选
   * @param {boolean} [params.silent] - 静默模式，不显示 loading 状态
   */
  async function fetchTodos(params = {}) {
    const { silent = false, ...queryParams } = params

    // 非静默模式才显示 loading
    if (!silent) {
      loading.value = true
    }
    error.value = null

    try {
      const result = await todoApi.getTodoList(queryParams)

      // API 返回格式: { code, message, data: { todos: [] } }
      const todosData = result.data?.todos || result.todos || []
      const todoList = todosData.map(fromApiFormat)
      todos.value = todoList
      initialized.value = true
      return todoList
    } catch (err) {
      error.value = err.message || '获取待办列表失败'
      throw err
    } finally {
      if (!silent) {
        loading.value = false
      }
    }
  }

  /**
   * 初始化待办列表（带缓存策略）
   * 如果有缓存且未过期，先显示缓存，再静默刷新
   * 如果无缓存或已过期，正常加载显示 loading
   */
  async function initTodos() {
    const hasCachedData = todos.value && todos.value.length > 0
    const cacheExpired = isCacheExpired()

    // 如果有缓存数据且未过期，静默刷新
    if (hasCachedData && !cacheExpired) {
      // 已有缓存数据显示，后台静默刷新
      fetchTodos({ silent: true }).catch((err) => {
        console.warn('静默刷新待办列表失败:', err)
      })
      return todos.value
    }

    // 如果有缓存数据但已过期，先显示缓存，同时刷新（显示 loading）
    if (hasCachedData && cacheExpired) {
      // 缓存已过期，静默刷新但不阻塞
      return fetchTodos({ silent: true })
    }

    // 无缓存数据，正常加载
    return fetchTodos()
  }

  /**
   * 按优先级获取待办列表
   * @param {number} priority - 优先级 (1-4)
   */
  async function fetchTodosByPriority(priority) {
    return fetchTodos({ priority })
  }

  /**
   * 按分类获取待办列表
   * @param {string} category - 分类名称
   */
  async function fetchTodosByCategory(category) {
    return fetchTodos({ category })
  }

  /**
   * 按状态获取待办列表
   * @param {number} status - 状态 (0: 未完成, 1: 已完成)
   */
  async function fetchTodosByStatus(status) {
    return fetchTodos({ status })
  }

  return {
    // state
    todos,
    loading,
    error,
    quadrantMap,
    quadrantTodos,
    initialized,
    // actions
    addTodo,
    updateTodo,
    removeTodo,
    toggleTodo,
    fetchTodos,
    initTodos,
    fetchTodoDetail,
    fetchTodosByPriority,
    fetchTodosByCategory,
    fetchTodosByStatus,
    clearCache,
    // utils
    toApiFormat,
    fromApiFormat
  }
})
