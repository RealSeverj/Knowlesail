import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProfileStore = defineStore('profile', () => {
  const user = ref({
    studentId: '20250001',
    phone: '18106916901',
    nickname: 'Severj',
    realName: '苏西',
    academy: '计算机与大数据学院',
    major: '计算机科学与技术',
    grade: '2023级',
    signature: '把每一次学习都当成一次远航。'
  })

  const stats = ref({
    notesCount: 42,
    notesLiked: 128,
    notesCollected: 56,
    todoCompleted: 73
  })

  const preferences = ref({
    theme: 'system',
    personalizedRecommend: true,
    autoCourseReminder: true,
    exportCalendarEnabled: false
  })

  const maskedPhone = computed(() => {
    if (!user.value.phone) return ''
    const p = user.value.phone
    if (p.length < 7) return p
    return `${p.slice(0, 3)}****${p.slice(-4)}`
  })

  const updateUser = (payload) => {
    user.value = { ...user.value, ...payload }
  }

  const updatePreferences = (payload) => {
    preferences.value = { ...preferences.value, ...payload }
  }

  return {
    user,
    stats,
    preferences,
    maskedPhone,
    updateUser,
    updatePreferences
  }
})
