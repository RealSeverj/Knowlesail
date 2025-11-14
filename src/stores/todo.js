import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// priority: 1-4 对应四象限
// 1: 紧急且重要
// 2: 不紧急但重要
// 3: 紧急但不重要
// 4: 不紧急不重要

export const useTodoStore = defineStore('todo', () => {
  const todos = ref([
    {
      id: '1',
      title: '完成课程作业',
      note: '今晚前提交系统分析作业',
      category: '学习',
      deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      priority: 1,
      completed: false
    },
    {
      id: '2',
      title: '规划下周学习计划',
      note: '按课程章节划分任务',
      category: '规划',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 2,
      completed: false
    },
    {
      id: '3',
      title: '回复老师信息',
      note: '确认项目需求变更',
      category: '沟通',
      deadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      priority: 3,
      completed: false
    },
    {
      id: '4',
      title: '整理桌面文件',
      note: '周末腾出 30 分钟处理',
      category: '生活',
      deadline: null,
      priority: 4,
      completed: false
    },
    {
      id: '4',
      title: '整理桌面文件',
      note: '周末腾出 30 分钟处理',
      category: '生1',
      deadline: null,
      priority: 4,
      completed: false
    },
    {
      id: '4',
      title: '整理桌面文件',
      note: '周末腾出 30 分钟处理',
      category: '生2',
      deadline: null,
      priority: 4,
      completed: false
    }
  ])

  // 之后可在这里接入后端 API，例如：
  // const loading = ref(false)
  // async function fetchTodos() { ... }
  // async function createTodo(payload) { ... }
  // async function updateTodo(id, patch) { ... }
  // async function deleteTodo(id) { ... }

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

  function addTodo(payload) {
    // 未来可替换为 createTodo API
    const id = Date.now().toString(36)
    todos.value.push({
      id,
      title: payload.title,
      note: payload.note || '',
      category: payload.category || '默认',
      deadline: payload.deadline || null,
      priority: payload.priority || 1,
      completed: false
    })
  }

  function toggleTodo(id) {
    const target = todos.value.find((t) => t.id === id)
    if (!target) return
    target.completed = !target.completed
  }

  function updateTodo(id, patch) {
    const target = todos.value.find((t) => t.id === id)
    if (!target) return
    Object.assign(target, patch)
  }

  function removeTodo(id) {
    const index = todos.value.findIndex((t) => t.id === id)
    if (index !== -1) todos.value.splice(index, 1)
  }

  return {
    // state
    todos,
    quadrantMap,
    quadrantTodos,
    // actions（未来可在内部对接 API）
    addTodo,
    updateTodo,
    removeTodo,
    toggleTodo
  }
})
