<script setup>
import { onMounted, provide, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useBackButtonHandler } from '@/composables/useBackButtonHandler'
import { applyStatusBarTheme } from '@/composables/useStatusBar'
import { useProfileStore } from '@/stores/profile'
import {
  scheduleNextClassReminder,
  scheduleNearestTodoReminder,
  scheduleDailyScheduleReminder,
  cancelAllCourseRelatedNotifications,
} from '@/utils/notification'
import { useCurriculumStore } from '@/stores/curriculum'
import { useTodoStore } from '@/stores/todo'
import { getNextClass } from '@/utils/curriculum'
import { getNearestTodo } from '@/utils/todo'
import AppLayout from '@/components/Layout/AppLayout.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import ConfirmDialogHost from '@/components/ConfirmDialog.vue'

import { SplashScreen } from '@capacitor/splash-screen';

const { theme, initTheme } = useTheme()
const profileStore = useProfileStore()
const curriculumStore = useCurriculumStore()
const todoStore = useTodoStore()

onMounted(async () => {
  await SplashScreen.hide();
  await initTheme()
  await applyStatusBarTheme(theme.value)

  // 初始化课程和待办数据（用于后续通知调度）
  if (!curriculumStore.initialized) await curriculumStore.initCourses()
  if (!todoStore.initialized) await todoStore.initTodos()

  // 根据当前偏好初始化一次通知队列
  const autoCourseReminder = profileStore.preferences?.autoCourseReminder !== false
  if (autoCourseReminder) {
    const nextClass = getNextClass(curriculumStore)
    const nearestTodo = getNearestTodo(todoStore)
    if (nextClass) await scheduleNextClassReminder(nextClass)
    if (nearestTodo) await scheduleNearestTodoReminder(nearestTodo)
    await scheduleDailyScheduleReminder()
  } else {
    await cancelAllCourseRelatedNotifications()
  }
  await applyStatusBarTheme(theme.value)
})

// 监听主题配置变化，动态同步原生状态栏样式
watch(
  theme,
  async (newTheme) => {
    if (!newTheme) return
    await applyStatusBarTheme(newTheme)
  },
  { deep: true }
)

// 监听用户偏好中课前提醒开关，打开时重新安排，关闭时清空相关通知队列
watch(
  () => profileStore.preferences?.autoCourseReminder,
  async (enabled) => {
    if (enabled) {
      // 重新根据当前数据安排通知（内部有 key 防重，不会重复排同一条）
      const nextClass = getNextClass(curriculumStore)
      const nearestTodo = getNearestTodo(todoStore)
      if (nextClass) await scheduleNextClassReminder(nextClass)
      if (nearestTodo) await scheduleNearestTodoReminder(nearestTodo)
      await scheduleDailyScheduleReminder()
    } else {
      // 关闭时清空所有课程/待办/今日日程相关通知
      await cancelAllCourseRelatedNotifications()
    }
  },
  { immediate: false }
)

// 全局注入主题信息
provide('theme', theme)

useBackButtonHandler({
  mainRouteNames: ['Home', 'Todo', 'Curriculum', 'Profile', 'MyNotes']
})
</script>

<template>
  <ToastContainer />
  <ConfirmDialogHost />
  <div id="app" class="min-h-screen app-bg text-foreground transition-colors">
    <AppLayout />
  </div>
</template>
