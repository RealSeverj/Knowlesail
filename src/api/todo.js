import { http } from './axios-config'

/**
 * 创建待办事项
 * @param {Object} todoData - 待办事项数据
 * @param {string} todoData.title - 标题
 * @param {string} todoData.content - 内容
 * @param {number} todoData.start_time - 开始时间戳
 * @param {number} todoData.end_time - 结束时间戳
 * @param {number} todoData.is_all_day - 是否全天 (0/1)
 * @param {number} todoData.priority - 优先级
 * @param {number} todoData.remind_at - 提醒时间戳
 * @param {string} todoData.category - 分类
 * @returns {Promise<{id: string}>} 返回创建的待办事项ID
 */
export function createTodo(todoData) {
  return http.post('/api/v1/todo/create', todoData)
}

/**
 * 删除待办事项
 * @param {string} id - 待办事项ID
 * @returns {Promise<{id: string}>} 返回删除的待办事项ID
 */
export function deleteTodo(id) {
  return http.delete('/api/v1/todo/delete', {
    params: { id }
  })
}

/**
 * 更新待办事项
 * @param {Object} todoData - 待办事项数据
 * @param {string} todoData.id - 待办事项ID
 * @param {string} todoData.title - 标题
 * @param {string} todoData.content - 内容
 * @param {number} todoData.start_time - 开始时间戳
 * @param {number} todoData.end_time - 结束时间戳
 * @param {number} todoData.is_all_day - 是否全天 (0/1)
 * @param {number} todoData.status - 状态
 * @param {number} todoData.priority - 优先级
 * @param {number} todoData.remind_at - 提醒时间戳
 * @param {string} todoData.category - 分类
 * @returns {Promise<{id: string}>} 返回更新的待办事项ID
 */
export function updateTodo(todoData) {
  return http.put('/api/v1/todo/update', todoData)
}

/**
 * 获取待办事项详情
 * @param {string} id - 待办事项ID
 * @returns {Promise<{todo: Object}>} 返回待办事项详情
 */
export function getTodoDetail(id) {
  return http.get('/api/v1/todo/detail', {
    params: { id }
  })
}

/**
 * 获取待办事项列表
 * @param {Object} params - 查询参数
 * @param {number} [params.status] - 状态筛选
 * @param {number} [params.priority] - 优先级筛选
 * @param {string} [params.category] - 分类筛选
 * @returns {Promise<{todos: Array}>} 返回待办事项列表
 */
export function getTodoList(params = {}) {
  return http.get('/api/v1/todo/list', {
    params
  })
}
