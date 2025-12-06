<script setup>
import { onMounted, ref, computed } from 'vue'
import { useCurriculumStore } from '@/stores/curriculum'
import WeekView from '@/components/Curriculum/WeekView.vue'
import AddCourse from '@/components/Curriculum/AddCourse.vue'
import PullRefresh from '@/components/Common/PullRefresh.vue'
import PopFrame from '@/components/Common/PopFrame.vue'

const curriculumStore = useCurriculumStore()

const refreshing = ref(false)

// 学期事件弹窗
const termEventsVisible = ref(false)

// 学期事件列表
const termEvents = computed(() => curriculumStore.termEvents)

// 格式化日期显示
function formatEventDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function openTermEvents() {
  termEventsVisible.value = true
}

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
      <div class="flex items-center gap-2">
        <button class="icon-circle-btn" @click="openTermEvents">
          <var-icon name="calendar-month" :size="24" />
        </button>
        <AddCourse @created="() => {}" />
      </div>
    </div>

    <div class="flex-1 px-0 pb-4 overflow-hidden">
      <PullRefresh
        v-model="refreshing"
        loading-text="正在刷新课程表..."
        success-text="课程表已更新"
        @refresh="handleRefresh"
      >
        <div class="h-full">
          <WeekView />
        </div>
      </PullRefresh>
    </div>

    <!-- 学期事件弹窗 -->
    <PopFrame
      v-model:show="termEventsVisible"
      width-class="w-[90vw] max-w-md"
      max-height-class="max-h-[75vh]"
    >
      <template #header>
        <h3 class="text-lg font-semibold text-foreground">学期日历</h3>
      </template>
      <div class="space-y-3">
        <div
          v-for="(event, index) in termEvents"
          :key="index"
          class="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50"
        >
          <div
            class="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <var-icon name="calendar-month" class="text-primary" :size="18" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm text-foreground">{{ event.name }}</div>
            <div class="text-xs text-secondary mt-1">
              <span v-if="event.startDate === event.endDate">
                {{ formatEventDate(event.startDate) }}
              </span>
              <span v-else>
                {{ formatEventDate(event.startDate) }} - {{ formatEventDate(event.endDate) }}
              </span>
            </div>
          </div>
        </div>
        <div v-if="!termEvents.length" class="text-center py-8 text-secondary text-sm">
          暂无学期事件信息
        </div>
      </div>
    </PopFrame>
  </div>
</template>

<style scoped></style>
