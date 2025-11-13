import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useKnowledgeStore = defineStore('knowledge', () => {
  const notes = ref([])

  return {
    notes
  }
})
