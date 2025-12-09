// 待办事项相关工具函数

/**
 * 获取最近的待办事项
 * @param {Object} todoStore - 待办store
 * @returns {Object|null} 最近待办信息或null
 */
export function getNearestTodo(todoStore) {
  if (!todoStore.initialized) return null

  const incompleteTodos = todoStore.todos.filter(t => !t.completed && t.deadline)
  if (incompleteTodos.length === 0) return null

  const sorted = incompleteTodos.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
  const nearest = sorted[0]
  const deadline = new Date(nearest.deadline)
  const diffMs = deadline.getTime() - Date.now()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  let timeLeftStr = '', isUrgent = false
  if (diffMs < 0) {
    timeLeftStr = '已过期'
    isUrgent = true
  } else if (diffHours < 1) {
    timeLeftStr = '不到1小时'
    isUrgent = true
  } else if (diffHours < 24) {
    timeLeftStr = `${diffHours}小时后`
    isUrgent = true
  } else if (diffDays === 1) {
    timeLeftStr = '明天'
  } else {
    timeLeftStr = `${diffDays}天后`
  }

  const d = deadline
  const deadlineStr = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`

  return {
    ...nearest,
    timeLeftStr,
    isUrgent,
    deadlineStr
  }
}