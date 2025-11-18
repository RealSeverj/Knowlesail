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
    },
    {
      id: 'official-1',
      type: 'official',
      title: '【官方】学习计划模板',
      snippet: '本模板帮助你从周视角规划课程学习与复习节奏……',
      source: '官方知识库',
      highlight: trimmed
    },
    {
      id: 'community-1',
      type: 'community',
      title: '学习社区精选：高效记笔记的方法',
      snippet: '结合番茄钟与间隔重复，将课堂内容拆分为可复习的知识块……',
      source: '学习社区',
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
