import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Note 数据结构示例：
// {
//   id: string
//   authorId: string
//   createdAt: string | number (timestamp)
//   blocks: Array<{
//     id: string
//     authorId: string
//     createdAt: string | number
//     content: string // markdown 文本
//     comments: Array<{
//       id: string
//       authorId: string
//       content: string
//       createdAt: string | number
//     }>
//     likes: number
//     shares: number
//   }>
// }

export const useKnowledgeStore = defineStore('knowledge', () => {
  const notes = ref([
    {
      id: 'note-1',
      authorId: 'user-1',
      createdAt: Date.now() - 1000 * 60 * 60,
      title: '线性代数复习笔记',
      blocks: [
        {
          id: 'block-1',
          authorId: 'user-1',
          createdAt: Date.now() - 1000 * 60 * 60,
          content:
            '# 向量与线性空间\n\n本节主要回顾向量空间的基本概念，包括：\n\n- 线性组合与线性相关性\n- 基与维数\n- 子空间与直和分解',
          comments: [
            {
              id: 'c-1',
              authorId: 'user-2',
              content: '这部分可以结合几何直观再补充一点例子。',
              createdAt: Date.now() - 1000 * 60 * 30
            }
          ],
          likes: 12,
          shares: 3
        },
        {
          id: 'block-2',
          authorId: 'user-1',
          createdAt: Date.now() - 1000 * 60 * 50,
          content:
            '## 线性无关的判断方法\n\n常见方法：\n\n1. 行列式法\n2. 初等行变换化为阶梯型矩阵\n3. 利用已知基向量进行坐标表示',
          comments: [],
          likes: 5,
          shares: 1
        }
      ]
    }
  ])

  const getNoteById = (id) => computed(() => notes.value.find((n) => n.id === id))

  return {
    notes,
    getNoteById
  }
})
