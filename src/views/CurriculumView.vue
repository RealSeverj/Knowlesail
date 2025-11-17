<script setup>
import { onMounted } from 'vue'
import { useCurriculumStore } from '@/stores/curriculum'
import WeekView from '@/components/Curriculum/WeekView.vue'
import AddCourse from '@/components/Curriculum/AddCourse.vue'

const curriculumStore = useCurriculumStore()

onMounted(() => {
  curriculumStore.fetchCourses()
})
</script>

<template>
  <div class="h-full bg-background flex flex-col overflow-hidden">
    <div class="flex items-center justify-between px-4 pb-2 pt-4">
      <div>
        <h1 class="text-xl font-semibold text-[var(--color-text-primary)]">课程表</h1>
        <p class="mt-1 text-xs text-[var(--color-text-secondary)]">管理你的课表与实践课程</p>
      </div>
      <AddCourse @created="() => {}" />
    </div>

    <div class="flex-1 px-0 pb-4 overflow-hidden">
      <div class="h-full">
        <WeekView />
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
