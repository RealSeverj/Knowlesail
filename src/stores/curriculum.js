import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCurriculumStore = defineStore('curriculum', () => {
  const courses = ref([])

  return {
    courses
  }
})
