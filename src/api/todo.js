import { http } from './axios-config'

export function createTodo(todoData) {
  return http.post('/api/v1/todo/create', todoData)
}

export function deleteTodo(id) {
  return http.delete('/api/v1/todo/delete', {
    params: { id }
  })
}

export function updateTodo(todoData) {
  return http.put('/api/v1/todo/update', todoData)
}

export function getTodoDetail(id) {
  return http.get('/api/v1/todo/detail', {
    params: { id }
  })
}

export function getTodoList(params = {}) {
  return http.get('/api/v1/todo/list', {
    params
  })
}
