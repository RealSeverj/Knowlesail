// 模拟知识库搜索接口
// 实际接入后可替换为 axios 请求

/**
 * 模拟搜索知识库内容
 * @param {string} keyword 搜索关键字
 * @returns {Promise<{ items: Array }>} 搜索结果
 */
export function searchKnowledge(keyword) {
  const trimmed = keyword.trim()

  const mockResults = [
    {
      id: 'note-1',
      type: 'note',
      title: '线性代数复习笔记',
      snippet: '向量与线性空间、线性组合与线性相关性、基与维数、子空间与直和分解……',
      source: '我的笔记',
      highlight: trimmed
    }
  ]

  const filtered = mockResults.filter((item) =>
    trimmed ? item.title.includes(trimmed) || item.snippet.includes(trimmed) : true
  )

  return Promise.resolve({
    items: filtered
  })
}
