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
    <div class="px-4 pt-4 pb-2 flex items-center justify-between">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h1 class="text-xl font-bold text-foreground">课程表</h1>
        </div>
        <p class="text-xs text-secondary">管理你的课表与实践课程</p>
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
