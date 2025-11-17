<script setup>
import { computed } from 'vue'
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

const weekSchedule = computed(() => curriculumStore.weekSchedule)
const currentWeek = computed(() => curriculumStore.currentWeek)
const classTimeMap = curriculumStore.classTimeMap

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

const weekTitle = computed(() => `第 ${currentWeek.value} 周`)
</script>

<template>
	<div class="w-full h-full flex flex-col">
		<div class="flex items-center justify-between mb-3 px-1">
			<div class="flex items-center gap-2">
				<var-button text round size="small" @click="changeWeek(-1)">
					<var-icon name="chevron-left" />
				</var-button>
				<div class="font-semibold text-base">{{ weekTitle }}</div>
				<var-button text round size="small" @click="changeWeek(1)">
					<var-icon name="chevron-right" />
				</var-button>
			</div>
			<div class="text-xs text-secondary">点击课程查看详情</div>
		</div>

		<div class="border border-border rounded-xl overflow-hidden bg-card flex-1 min-h-0 flex flex-col">
			<!-- 表头：节次 + 周几 -->
			<div class="grid grid-cols-[3rem_repeat(7,1fr)] bg-muted text-xs text-center flex-none">
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

			<!-- 主体：左侧节次，右侧为 7 列天数，每列内用绝对定位放课程卡片 -->
			<div class="relative flex-1 min-h-0">
				<!-- 左侧节次栏 -->
				<div class="absolute inset-y-0 left-0 w-12 border-r border-border text-[10px] text-center grid" :style="{ gridTemplateRows: 'repeat(11, minmax(0, 1fr))' }">
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
				<div class="absolute inset-y-0 left-12 right-0 grid grid-cols-7">
					<div
						v-for="day in weekdays"
						:key="day.value"
						class="relative border-l border-border"
					>
						<CourseCard
							v-for="item in weekSchedule[day.value]"
							:key="`${item.courseId}-${item.ruleIndex}`"
							:course="item"
							:start-class="item.startClass"
							:end-class="item.endClass"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
</style>
