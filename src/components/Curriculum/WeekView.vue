<script setup>
import { computed, onMounted, ref } from 'vue'
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

// 周数选择弹窗
const weekPickerVisible = ref(false)
const maxWeek = 20

function openWeekPicker() {
	weekPickerVisible.value = true
}

function closeWeekPicker() {
	weekPickerVisible.value = false
}

// 不同周的课表数据
const prevWeekSchedule = computed(() => {
	const target = currentWeek.value - 1
	if (target < 1) return curriculumStore.getWeekSchedule(1)
	return curriculumStore.getWeekSchedule(target)
})

const currentWeekSchedule = computed(() => curriculumStore.getWeekSchedule(currentWeek.value))

const nextWeekSchedule = computed(() => {
	const target = currentWeek.value + 1
	return curriculumStore.getWeekSchedule(target)
})

// 滑动相关状态
const containerRef = ref(null)
const pageWidth = ref(0)
const baseX = ref(0)
const translateX = ref(0)
const startX = ref(0)
const dragging = ref(false)
const animating = ref(false)
const enableTransition = ref(true)
onMounted(() => {
	// 使用外层容器宽度作为一页宽度
	const container = containerRef.value
	if (container) {
		pageWidth.value = container.clientWidth || window.innerWidth
		baseX.value = -pageWidth.value
		translateX.value = baseX.value
	}
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

function changeWeek(delta) {
	const next = currentWeek.value + delta
	if (next < 1) return
	curriculumStore.setCurrentWeek(next)
}

function jumpToWeek(week) {
	if (!week || week < 1 || week === currentWeek.value) {
		weekPickerVisible.value = false
		return
	}
	curriculumStore.setCurrentWeek(week)
	// 直接重置为中间页位置
	baseX.value = -pageWidth.value
	translateX.value = baseX.value
	weekPickerVisible.value = false
}

const weekTitle = computed(() => `第 ${currentWeek.value} 周`)

// 手势事件
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
		// 向左滑，下一周
		slideToWeek(1)
	} else if (delta >= threshold) {
		// 向右滑，上 一周
		slideToWeek(-1)
	} else {
		// 回弹
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
	animating.value = true
	enableTransition.value = true
	// 视觉上滑到目标页面
	translateX.value = baseX.value - delta * pageWidth.value
	setTimeout(() => {
		// 第二段：关闭过渡，瞬间重置到中间页
		enableTransition.value = false
		changeWeek(delta)
		// 更新完 currentWeek 后直接将基准和偏移同步到新的“中间页”
		baseX.value = -pageWidth.value
		translateX.value = baseX.value
		// 下一帧再打开过渡，供下一次滑动使用
		requestAnimationFrame(() => {
			enableTransition.value = true
			animating.value = false
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
				<var-button text round size="small" @click="handleClick(-1)">
					<var-icon name="chevron-left" />
				</var-button>
				<div
					class="font-semibold text-base flex items-center gap-1 active:opacity-70 transition-opacity"
					@click="openWeekPicker"
				>
					{{ weekTitle }}
					<var-icon name="chevron-down" size="14" />
				</div>
				<var-button text round size="small" @click="handleClick(1)">
					<var-icon name="chevron-right" />
				</var-button>
			</div>
			<div class="text-xs text-secondary pr-4">左右滑动切换不同周</div>
		</div>

		<div class="overflow-hidden bg-card flex-1 min-h-0 flex flex-col">
			<!-- 表头：节次 + 周几 -->
			<div class="w-full grid grid-cols-[2rem_repeat(7,1fr)] bg-muted text-xs text-center flex-none">
				<div class="py-1 border-r border-border">
					<div>节次</div>
				</div>
				<div
					v-for="day in weekdays"
					:key="day.value"
					class="py-1 border-l border-border"
				>
					周{{ day.label }}
				</div>
			</div>

			<!-- 主体：左侧节次 + 右侧 7 天列，外面套滑动容器 -->
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
						transform: `translateX(${translateX}px)` ,
						transition: dragging || !enableTransition ? 'none' : 'transform 0.22s cubic-bezier(0.33, 0.01, 0.3, 1)'
					}"
				>
					<!-- 上一周 -->
					<div class="w-full flex-shrink-0 relative">
						<!-- 左侧节次栏 -->
						<div class="absolute inset-y-0 left-0 w-8 border-r border-border text-[10px] text-center grid" :style="{ gridTemplateRows: 'repeat(11, minmax(0, 1fr))' }">
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
						<div class="absolute inset-y-0 left-8 right-0 grid grid-cols-7">
							<div
								v-for="day in weekdays"
								:key="day.value"
								class="relative border-l border-border"
							>
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

					<!-- 当前周 -->
					<div class="w-full flex-shrink-0 relative">
						<div class="absolute inset-y-0 left-0 w-8 border-r border-border text-[10px] text-center grid" :style="{ gridTemplateRows: 'repeat(11, minmax(0, 1fr))' }">
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
							<div
								v-for="day in weekdays"
								:key="day.value"
								class="relative border-l border-border"
							>
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

					<!-- 下一周 -->
					<div class="w-full flex-shrink-0 relative">
						<div class="absolute inset-y-0 left-0 w-8 border-r border-border text-[10px] text-center grid" :style="{ gridTemplateRows: 'repeat(11, minmax(0, 1fr))' }">
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
							<div
								v-for="day in weekdays"
								:key="day.value"
								class="relative border-l border-border"
							>
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

	<!-- 周数选择弹窗 -->
	<var-popup
		v-model:show="weekPickerVisible"
		position="bottom"
		lock-scroll
		elevation
		:overlay="true"
		class="week-picker-popup"
	>
		<div class="bg-card rounded-t-2xl pt-3 pb-4 px-4 max-h-[60vh] flex flex-col">
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
							? 'bg-primary text-primary-foreground border-primary'
							: 'border-border text-foreground/80 active:bg-muted'
					"
					@click="jumpToWeek(w)"
				>
					第 {{ w }} 周
				</button>
			</div>
		</div>
	</var-popup>
</template>
