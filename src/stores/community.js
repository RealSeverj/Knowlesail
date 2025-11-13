import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommunityStore = defineStore('community', () => {
  const posts = ref([])

  return {
    posts
  }
})
