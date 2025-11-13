import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProfileStore = defineStore('profile', () => {
  const preferences = ref({})

  return {
    preferences
  }
})
