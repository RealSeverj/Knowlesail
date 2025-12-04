<script setup>
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import { useCurriculumStore } from '@/stores/curriculum'
import CourseCard from './CourseCard.vue'

const curriculumStore = useCurriculumStore()

const weekdays = [
  { label: '一', value: 1 },
  { label: '二', value: 2 },
  { label: '三', value: 3 },
  { label: '四', value: 4 },
  { label: '五', value: 5 },
  { label: '六', value: 6 },
  { label: '日', value: 7 }
]

const currentWeek = computed(() => curriculumStore.currentWeek)
const classTimeMap = curriculumStore.classTimeMap
const maxWeek = computed(() => curriculumStore.maxWeek)
const todayWeek = computed(() => curriculumStore.todayWeek)
const todayWeekday = computed(() => curriculumStore.todayWeekday)

// 判断某天是否是今天（用于高亮）
function isToday(weekday) {
  return currentWeek.value === todayWeek.value && weekday === todayWeekday.value
}

// 获取当前周的日期
const currentWeekDates = computed(() => curriculumStore.getWeekDates(currentWeek.value))

// 周数选择弹窗
const weekPickerVisible = ref(false)

function openWeekPicker() {
  weekPickerVisible.value = true
}

function closeWeekPicker() {
  weekPickerVisible.value = false
}

// 滑动相关状态
const activeIndex = ref(currentWeek.value - 1)
const swipeRef = ref(null)

// 监听 store 变化同步到 swipe
watch(currentWeek, (val) => {
  const targetIndex = val - 1
  if (activeIndex.value !== targetIndex) {
    activeIndex.value = targetIndex
    // 确保 swipe 组件同步跳转
    nextTick(() => {
      swipeRef.value?.to(targetIndex)
    })
  }
})

// 监听 swipe 变化同步到 store
function handleSwipeChange(index) {
  const newWeek = index + 1
  if (newWeek !== currentWeek.value) {
    curriculumStore.setCurrentWeek(newWeek)
  }
}

// 初始化定位
onMounted(() => {
  nextTick(() => {
    // 如果当前周不是第一周，强制跳转一次以确保位置正确
    if (swipeRef.value && activeIndex.value > 0) {
      swipeRef.value.to(activeIndex.value, { animation: false })
    }
  })
})

// 计算某节课的结束时间（开始时间 + 45 分钟）
function getClassEndTime(index) {
  const start = classTimeMap[index]
  if (!start) return ''

  const [hStr, mStr] = start.split(':')
  const h = Number(hStr)
  const m = Number(mStr)
  if (Number.isNaN(h) || Number.isNaN(m)) return ''

  let endMinutes = h * 60 + m + 45
  let endH = Math.floor(endMinutes / 60)
  let endM = endMinutes % 60
  if (endH >= 24) endH -= 24

  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
}

function handleClick(delta) {
  const next = currentWeek.value + delta
  if (next < 1 || next > maxWeek.value) return
  curriculumStore.setCurrentWeek(next)
}

function jumpToWeek(week) {
  if (!week || week < 1 || week > maxWeek.value || week === currentWeek.value) {
    weekPickerVisible.value = false
    return
  }
  curriculumStore.setCurrentWeek(week)
  weekPickerVisible.value = false
}

const weekTitle = computed(() => `第 ${currentWeek.value} 周`)
</script>

<template>
  <div class="w-screen max-w-full h-full flex flex-col">
    <div class="flex items-center justify-between mb-2 px-0">
      <div class="flex items-center gap-2">
        <var-button text round size="small" @click="handleClick(-1)" :disabled="currentWeek <= 1">
          <var-icon name="chevron-left" />
        </var-button>
        <div
          class="font-semibold text-base flex items-center gap-1 active:opacity-70 transition-opacity"
          @click="openWeekPicker"
        >
          {{ weekTitle }}
          <var-icon name="chevron-down" size="14" />
        </div>
        <var-button text round size="small" @click="handleClick(1)" :disabled="currentWeek >= maxWeek">
          <var-icon name="chevron-right" />
        </var-button>
      </div>
    </div>

    <div class="overflow-hidden flex-1 min-h-0 flex flex-col">
      <!-- 表头：节次 + 周几 + 日期 -->
      <div class="w-full grid grid-cols-[2rem_repeat(7,1fr)] text-xs text-center flex-none">
        <div class="py-1 border-r border-border">
          <div>节次</div>
        </div>
        <div 
          v-for="day in weekdays" 
          :key="day.value" 
          class="py-1 border-l border-border transition-colors"
          :class="isToday(day.value) ? 'bg-primary/10 text-primary font-semibold' : ''"
        >
          <div>周{{ day.label }}</div>
          <div 
            class="text-[10px]"
            :class="isToday(day.value) ? 'text-primary' : 'text-secondary'"
          >
            {{ currentWeekDates[day.value] }}
          </div>
        </div>
      </div>

      <!-- 主体：使用 var-swipe 实现滑动 -->
      <var-swipe
        ref="swipeRef"
        class="flex-1 min-h-0"
        :loop="false"
        :indicator="false"
        v-model:active="activeIndex"
        @change="handleSwipeChange"
      >
        <var-swipe-item v-for="week in maxWeek" :key="week" class="h-full">
          <!-- 性能优化：只渲染当前周及其前后的内容 -->
          <div v-if="Math.abs(week - (activeIndex + 1)) <= 1" class="h-full flex relative">
            <!-- 左侧节次栏 -->
            <div
              class="w-8 border-r border-border text-[10px] text-center grid flex-none"
              :style="{ gridTemplateRows: 'repeat(11, minmax(0, 1fr))' }"
            >
              <div
                v-for="i in 11"
                :key="i"
                class="flex flex-col items-center justify-center border-b border-border last:border-b-0 px-1"
              >
                <div class="font-medium text-[11px]">{{ i }}</div>
                <div class="mt-0.5 text-[9px] text-secondary leading-tight">
                  <div>{{ classTimeMap[i] }}</div>
                  <div>{{ getClassEndTime(i) }}</div>
                </div>
              </div>
            </div>
            <!-- 右侧 7 天列 -->
            <div class="flex-1 grid grid-cols-7 relative">
              <div v-for="day in weekdays" :key="day.value" class="relative border-l border-border">
                <CourseCard
                  v-for="item in curriculumStore.getWeekSchedule(week)[day.value]"
                  :key="item.id || item.courseId || item.name || i"
                  :course="item"
                  :start-class="item.startClass"
                  :end-class="item.endClass"
                />
              </div>
            </div>
          </div>
        </var-swipe-item>
      </var-swipe>
    </div>
  </div>

  <!-- 周数选择弹窗 -->
  <var-popup
    v-model:show="weekPickerVisible"
    position="bottom"
    lock-scroll
    elevation
    :overlay="true"
    class="week-picker-popup bg-background"
  >
    <div class="rounded-t-2xl pt-3 pb-4 px-4 max-h-[60vh] flex flex-col">
      <div class="flex items-center justify-between mb-2">
        <div class="text-sm font-medium text-foreground">选择周次</div>
        <var-button text round size="small" @click="closeWeekPicker">
          <var-icon name="close" />
        </var-button>
      </div>
      <div class="text-[11px] text-secondary mb-3">点击周数可快速跳转</div>
      <div class="grid grid-cols-5 gap-2 overflow-y-auto pr-1">
        <button
          v-for="w in maxWeek"
          :key="w"
          type="button"
          class="h-9 rounded-full text-xs border transition-colors flex items-center justify-center"
          :class="
            w === currentWeek
              ? 'text-primary-foreground border-primary bg-primary'
              : 'border-border text-foreground/80'
          "
          @click="jumpToWeek(w)"
        >
          第 {{ w }} 周
        </button>
      </div>
    </div>
  </var-popup>
</template>
