import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserInfo } from '@/api/profile'
import { useAuthStore } from './auth'

export const useProfileStore = defineStore('profile', () => {
  const authStore = useAuthStore()
  
  const user = ref({
    studentId: '',
    phone: '',
    nickname: '',
    realName: '',
    academy: '',
    major: '',
    grade: '',
    signature: '把每一次学习都当成一次远航。'
  })

  const loading = ref(false)
  const error = ref(null)

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

  // 从后端获取用户信息
  const fetchUserInfo = async () => {
    loading.value = true
    error.value = null
    
    try {
      const res = await getUserInfo()
      const data = res.data
      
      // 映射后端数据到前端格式
      user.value = {
        studentId: authStore.user?.stu_id || '',
        phone: data?.phont || '',  // 注意后端字段是 phont
        nickname: data?.name || '',
        realName: data?.name || '',
        academy: data?.college || '',
        major: data?.major || '',
        grade: data?.grade ? `${data.grade}级` : '',
        signature: '把每一次学习都当成一次远航。'
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
      error.value = err.message || '获取用户信息失败'
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    stats,
    preferences,
    loading,
    error,
    maskedPhone,
    updateUser,
    updatePreferences,
    fetchUserInfo
  }
})
