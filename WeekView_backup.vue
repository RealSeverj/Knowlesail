<script setup>
import { computed, ref, nextTick } from 'vue'
import { useCurriculumStore } from '@/stores/curriculum'
import CourseCard from './CourseCard.vue'

const curriculumStore = useCurriculumStore()

const weekdays = [
  { label: '涓€', value: 1 },
  { label: '浜?, value: 2 },
  { label: '涓?, value: 3 },
  { label: '鍥?, value: 4 },
  { label: '浜?, value: 5 },
  { label: '鍏?, value: 6 },
  { label: '鏃?, value: 7 }
]

const currentWeek = computed(() => curriculumStore.currentWeek)
const classTimeMap = curriculumStore.classTimeMap

// 浠?store 鑾峰彇鏈€澶у懆鏁?
const maxWeek = computed(() => curriculumStore.maxWeek)

// 浠婂ぉ鎵€鍦ㄧ殑鍛ㄥ拰鏄熸湡鍑?
const todayWeek = computed(() => curriculumStore.todayWeek)
const todayWeekday = computed(() => curriculumStore.todayWeekday)

// 鍒ゆ柇鏌愬ぉ鏄惁鏄粖澶╋紙鐢ㄤ簬楂樹寒锛?
function isToday(weekday) {
  return currentWeek.value === todayWeek.value && weekday === todayWeekday.value
}

// 鑾峰彇褰撳墠鍛ㄧ殑鏃ユ湡
const currentWeekDates = computed(() => curriculumStore.getWeekDates(currentWeek.value))

// 鍛ㄦ暟閫夋嫨寮圭獥
const weekPickerVisible = ref(false)

function openWeekPicker() {
  weekPickerVisible.value = true
}

function closeWeekPicker() {
  weekPickerVisible.value = false
}

// Swipe 鐩稿叧
const swipeRef = ref(null)
const isInternalChange = ref(false)

// 鐢熸垚褰撳墠鍙鐨勪笁鍛ㄦ暟鎹紙铏氭嫙婊戝姩锛氫笂涓€鍛ㄣ€佸綋鍓嶅懆銆佷笅涓€鍛級
const visibleWeeks = computed(() => {
  const curr = currentWeek.value
  return [
    Math.max(1, curr - 1),
    curr,
    Math.min(maxWeek.value, curr + 1)
  ]
})
  const target = currentWeek.value - 1
  if (target < 1) return curriculumStore.getWeekSchedule(1)
  return curriculumStore.getWeekSchedule(target)
})

const currentWeekSchedule = computed(() => curriculumStore.getWeekSchedule(currentWeek.value))

const nextWeekSchedule = computed(() => {
  const target = currentWeek.value + 1
  return curriculumStore.getWeekSchedule(target)
})

// 婊戝姩鐩稿叧鐘舵€?
const containerRef = ref(null)
const pageWidth = ref(0)
const baseX = ref(0)
const translateX = ref(0)
const startX = ref(0)
const dragging = ref(false)
const animating = ref(false)
const enableTransition = ref(true)
onMounted(() => {
  // 浣跨敤澶栧眰瀹瑰櫒瀹藉害浣滀负涓€椤靛搴?
  const container = containerRef.value
  if (container) {
    pageWidth.value = container.clientWidth || window.innerWidth
    baseX.value = -pageWidth.value
    translateX.value = baseX.value
  }
})

// 璁＄畻鏌愯妭璇剧殑缁撴潫鏃堕棿锛堝紑濮嬫椂闂?+ 45 鍒嗛挓锛?
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

function changeWeek(delta) {
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
  // 鐩存帴閲嶇疆涓轰腑闂撮〉浣嶇疆
  baseX.value = -pageWidth.value
  translateX.value = baseX.value
  weekPickerVisible.value = false
}

const weekTitle = computed(() => `绗?${currentWeek.value} 鍛╜)

// 鎵嬪娍浜嬩欢
function onTouchStart(e) {
  if (animating.value) return
  enableTransition.value = false
  dragging.value = true
  startX.value = e.touches[0].clientX
}

function onTouchMove(e) {
  if (!dragging.value) return
  const currentX = e.touches[0].clientX
  const deltaX = currentX - startX.value
  translateX.value = baseX.value + deltaX
}

function onTouchEnd() {
  if (!dragging.value) return
  dragging.value = false

  const delta = translateX.value - baseX.value
  const threshold = pageWidth.value * 0.15
  if (delta <= -threshold) {
    // 鍚戝乏婊戯紝涓嬩竴鍛?
    slideToWeek(1)
  } else if (delta >= threshold) {
    // 鍚戝彸婊戯紝涓?涓€鍛?
    slideToWeek(-1)
  } else {
    // 鍥炲脊
    snapBack()
  }
}

function snapBack() {
  animating.value = true
  enableTransition.value = true
  translateX.value = baseX.value
  setTimeout(() => {
    animating.value = false
  }, 300)
}

function slideToWeek(delta) {
  if (animating.value) return
  
  // 杈圭晫妫€鏌?
  const nextWeek = currentWeek.value + delta
  if (nextWeek < 1 || nextWeek > maxWeek.value) {
    snapBack()
    return
  }
  
  animating.value = true
  enableTransition.value = true
  // 瑙嗚涓婃粦鍒扮洰鏍囬〉闈?
  translateX.value = baseX.value - delta * pageWidth.value
  setTimeout(() => {
    // 绗簩娈碉細鍏抽棴杩囨浮锛岀灛闂撮噸缃埌涓棿椤?
    enableTransition.value = false
    changeWeek(delta)
    // 鏇存柊瀹?currentWeek 鍚庣洿鎺ュ皢鍩哄噯鍜屽亸绉诲悓姝ュ埌鏂扮殑鈥滀腑闂撮〉鈥?
    baseX.value = -pageWidth.value
    translateX.value = baseX.value
    // 浣跨敤鍙岄噸 requestAnimationFrame 纭繚 DOM 鏇存柊骞舵覆鏌撲簡涓€甯р€滄棤杩囨浮鈥濈姸鎬?
    // 杩欐牱娴忚鍣ㄦ墠浼氱湡姝ｂ€滆烦鈥濆埌鏂颁綅缃紝鑰屼笉鏄€滄粦鈥濊繃鍘?
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        enableTransition.value = true
        animating.value = false
      })
    })
  }, 300)
}

function handleClick(delta) {
  slideToWeek(delta)
}
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
      <!-- 琛ㄥご锛氳妭娆?+ 鍛ㄥ嚑 + 鏃ユ湡 -->
      <div class="w-full grid grid-cols-[2rem_repeat(7,1fr)] text-xs text-center flex-none">
        <div class="py-1 border-r border-border">
          <div>鑺傛</div>
        </div>
        <div 
          v-for="day in weekdays" 
          :key="day.value" 
          class="py-1 border-l border-border transition-colors"
          :class="isToday(day.value) ? 'bg-primary/10 text-primary font-semibold' : ''"
        >
          <div>鍛▄{ day.label }}</div>
          <div 
            class="text-[10px]"
            :class="isToday(day.value) ? 'text-primary' : 'text-secondary'"
          >
            {{ currentWeekDates[day.value] }}
          </div>
        </div>
      </div>

      <!-- 涓讳綋锛氬乏渚ц妭娆?+ 鍙充晶 7 澶╁垪锛屽闈㈠婊戝姩瀹瑰櫒 -->
      <div
        ref="containerRef"
        class="relative flex-1 min-h-0 overflow-hidden"
        @touchstart.passive="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend="onTouchEnd"
      >
        <div
          class="absolute inset-0 flex"
          :style="{
            transform: `translateX(${translateX}px)`,
            transition:
              dragging || !enableTransition
                ? 'none'
                : 'transform 0.22s cubic-bezier(0.33, 0.01, 0.3, 1)'
          }"
        >
          <!-- 涓婁竴鍛?-->
          <div class="w-full flex-shrink-0 relative">
            <!-- 宸︿晶鑺傛鏍?-->
            <div
              class="absolute inset-y-0 left-0 w-8 border-r border-border text-[10px] text-center grid"
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
            <!-- 鍙充晶 7 澶╁垪 -->
            <div class="absolute inset-y-0 left-8 right-0 grid grid-cols-7">
              <div v-for="day in weekdays" :key="day.value" class="relative border-l border-border">
                <CourseCard
                  v-for="item in prevWeekSchedule[day.value]"
                  :key="item.id || item.courseId || item.name || i"
                  :course="item"
                  :start-class="item.startClass"
                  :end-class="item.endClass"
                />
              </div>
            </div>
          </div>

          <!-- 褰撳墠鍛?-->
          <div class="w-full flex-shrink-0 relative">
            <div
              class="absolute inset-y-0 left-0 w-8 border-r border-border text-[10px] text-center grid"
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
            <div class="absolute inset-y-0 left-8 right-0 grid grid-cols-7">
              <div v-for="day in weekdays" :key="day.value" class="relative border-l border-border">
                <CourseCard
                  v-for="item in currentWeekSchedule[day.value]"
                  :key="item.id || item.courseId || item.name || i"
                  :course="item"
                  :start-class="item.startClass"
                  :end-class="item.endClass"
                />
              </div>
            </div>
          </div>

          <!-- 涓嬩竴鍛?-->
          <div class="w-full flex-shrink-0 relative">
            <div
              class="absolute inset-y-0 left-0 w-8 border-r border-border text-[10px] text-center grid"
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
            <div class="absolute inset-y-0 left-8 right-0 grid grid-cols-7">
              <div v-for="day in weekdays" :key="day.value" class="relative border-l border-border">
                <CourseCard
                  v-for="item in nextWeekSchedule[day.value]"
                  :key="item.id || item.courseId || item.name || i"
                  :course="item"
                  :start-class="item.startClass"
                  :end-class="item.endClass"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 鍛ㄦ暟閫夋嫨寮圭獥 -->
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
        <div class="text-sm font-medium text-foreground">閫夋嫨鍛ㄦ</div>
        <var-button text round size="small" @click="closeWeekPicker">
          <var-icon name="close" />
        </var-button>
      </div>
      <div class="text-[11px] text-secondary mb-3">鐐瑰嚮鍛ㄦ暟鍙揩閫熻烦杞?/div>
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
          绗?{{ w }} 鍛?
        </button>
      </div>
    </div>
  </var-popup>
</template>

