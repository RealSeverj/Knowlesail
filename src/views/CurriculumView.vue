<script setup>
import { onMounted, ref } from 'vue'
import { useCurriculumStore } from '@/stores/curriculum'
import WeekView from '@/components/Curriculum/WeekView.vue'
import AddCourse from '@/components/Curriculum/AddCourse.vue'
import PullRefresh from '@/components/Common/PullRefresh.vue'

const curriculumStore = useCurriculumStore()

const refreshing = ref(false)

onMounted(() => {
  // 使用 initCourses，优先从缓存加载，没有缓存才请求后端
  curriculumStore.initCourses()
})

// 下拉刷新处理
async function handleRefresh() {
  try {
    await curriculumStore.refreshCourses()
  } finally {
    refreshing.value = false
  }
}
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="flex items-center justify-between px-4 pb-2 pt-4">
      <div>
        <h1 class="text-xl font-semibold text-[var(--color-text-primary)]">课程表</h1>
        <p class="mt-1 text-xs text-[var(--color-text-secondary)]">管理你的课表与实践课程</p>
      </div>
      <AddCourse @created="() => {}" />
    </div>

    <div class="flex-1 px-0 pb-4 overflow-hidden">
      <PullRefresh
        v-model="refreshing"
        @refresh="handleRefresh"
        loading-text="正在刷新课程表..."
        success-text="课程表已更新"
      >
        <div class="h-full">
          <WeekView />
        </div>
      </PullRefresh>
    </div>
  </div>
</template>

<style scoped></style>
