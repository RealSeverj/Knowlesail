import { http } from './axios-config'

/**
 * 获取对话总结（AI 总结）
 * POST /api/v1/conversation/summarize
 * @param {string} conversationId 对话 ID
 * @returns {Promise<Object>} { sum_id, summary, tags, tool_calls_json, notes }
 */
export async function summarizeConversation(conversationId) {
  const res = await http.post('/api/v1/conversation/summarize', {
    conversation_id: conversationId
  })
  return res.data
}

/**
 * 获取总结详情
 * GET /api/v1/summary/detail?id=xxx
 * @param {string} summaryId 总结 ID
 * @returns {Promise<Object>} summary 对象
 */
export async function getSummaryDetail(summaryId) {
  const res = await http.get('/api/v1/summary/detail', {
    params: { id: summaryId }
  })
  return res.data?.summary ?? res.data
}

/**
 * 获取总结列表
 * GET /api/v1/summary/list
 * @returns {Promise<Array>} summaries 数组
 */
export async function listSummaries() {
  const res = await http.get('/api/v1/summary/list')
  // 后端返回 { code, message, data: { summaries: [...] } }
  return res.data?.summaries ?? res.data?.data?.summaries ?? []
}

/**
 * 更新总结
 * PUT /api/v1/summary/update
 * @param {Object} data { id, summary_text, tags, tool_calls_json, notes }
 * @returns {Promise<Object>}
 */
export async function updateSummary(data) {
  const res = await http.put('/api/v1/summary/update', data)
  return res.data
}
