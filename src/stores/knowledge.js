import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { updateSummary as updateSummaryApi } from '@/api/knowledge'

// Summary 数据结构（与后端一致）：
// {
//   id: string                    // summary id
//   conversation_id: string       // 关联的对话 id
//   summary_text: string          // AI 总结文本
//   tags: string[]                // 标签数组
//   tool_calls_json: string       // 工具调用 JSON 字符串
//   notes: {                      // 笔记内容块对象
//     title: string               // 笔记标题
//     block1: string              // 内容块1（markdown）
//     block2: string              // 内容块2（markdown）
//     ...                         // 更多内容块
//   }
//   created_at: number            // 创建时间戳
//   updated_at: number            // 更新时间戳
// }

export const useKnowledgeStore = defineStore('knowledge', () => {
  // summaries 列表，本地缓存所有笔记摘要
  const summaries = ref([])

  // 是否已从后端加载过列表
  const loaded = ref(false)

  // loading 状态（可按需暴露给 UI）
  const loading = ref(false)

  const getSummaryById = (id) => computed(() => summaries.value.find((s) => s.id === id))

  // 根据 conversation_id 查找 summary
  function getSummaryByConversationId(conversationId) {
    return summaries.value.find((s) => s.conversation_id === conversationId)
  }

  // 兼容旧的 notes 引用（等价于 summaries）
  const notes = summaries

  // 从 notes 对象中提取内容块数组
  function getBlocksFromNotes(notesObj) {
    if (!notesObj || typeof notesObj !== 'object') return []
    const blocks = []
    // 按 block1, block2, block3... 顺序提取
    let i = 1
    while (notesObj[`block${i}`] !== undefined) {
      blocks.push({
        key: `block${i}`,
        content: notesObj[`block${i}`]
      })
      i++
    }
    return blocks
  }

  // 将内容块数组转换回 notes 对象
  function blocksToNotesObj(title, blocks) {
    const notesObj = { title: title || '' }
    blocks.forEach((block, index) => {
      notesObj[`block${index + 1}`] = block.content
    })
    return notesObj
  }

  // 新增或更新 summary
  function upsertSummary(payload) {
    if (!summaries.value) summaries.value = []
    const idx = summaries.value.findIndex((s) => s.id === payload.id)
    if (idx >= 0) {
      summaries.value[idx] = { ...summaries.value[idx], ...payload, updated_at: Date.now() }
    } else {
      summaries.value.push({
        ...payload,
        created_at: payload.created_at || Date.now(),
        updated_at: Date.now()
      })
    }
  }

  // 删除 summary
  function removeSummary(id) {
    const idx = summaries.value.findIndex((s) => s.id === id)
    if (idx >= 0) {
      summaries.value.splice(idx, 1)
    }
  }

  // 初始化/刷新 summaries 列表（从后端获取）
  async function loadSummaries(apiListFn) {
    if (loading.value) return
    loading.value = true
    try {
      const list = await apiListFn()
      summaries.value = Array.isArray(list) ? list : []
      loaded.value = true
    } catch (err) {
      console.error('加载知识库 summaries 失败:', err)
      // 出错时不改变 loaded，后续可重试
    } finally {
      loading.value = false
    }
  }

  // 调用后端接口并同步本地状态的统一更新方法
  async function updateSummary(payload) {
    await updateSummaryApi(payload)

    upsertSummary({
      ...payload,
      updated_at: Date.now()
    })
  }

  return {
    summaries,
    notes,
    loaded,
    loading,
    getSummaryById,
    getSummaryByConversationId,
    getBlocksFromNotes,
    blocksToNotesObj,
    upsertSummary,
    removeSummary,
    loadSummaries,
    updateSummary
  }
})
