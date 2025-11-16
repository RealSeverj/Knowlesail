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
  <div class="min-h-screen bg-background flex flex-col">
    <div class="px-4 pt-4 pb-2 flex items-center justify-between">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h1 class="text-xl font-bold text-foreground">课程表</h1>
        </div>
        <p class="text-xs text-secondary">管理你的课表与实践课程</p>
      </div>
      <div class="w-28">
        <AddCourse @created="() => {}" />
      </div>
    </div>

    <div class="flex-1 px-4 pb-4">
      <WeekView />
    </div>
  </div>
</template>

<style scoped>
</style>
