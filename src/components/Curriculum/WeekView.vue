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

const maxClass = 11

const weekSchedule = computed(() => curriculumStore.weekSchedule)
const currentWeek = computed(() => curriculumStore.currentWeek)

function changeWeek(delta) {
	const next = currentWeek.value + delta
	if (next < 1) return
	curriculumStore.setCurrentWeek(next)
}

const weekTitle = computed(() => `第 ${currentWeek.value} 周`)
</script>

<template>
	<div class="w-full">
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

		<div class="border border-border rounded-xl overflow-hidden bg-card">
			<!-- 表头：节次 + 周几 -->
			<div class="grid grid-cols-[3rem_repeat(7,1fr)] bg-muted text-xs text-center">
				<div class="py-1 border-r border-border">节次</div>
				<div
					v-for="day in weekdays"
					:key="day.value"
					class="py-1 border-l border-border"
				>
					周{{ day.label }}
				</div>
			</div>

			<!-- 主体：左侧节次，右侧为 7 列天数，每列内用绝对定位放课程卡片 -->
			<div class="relative">
				<!-- 左侧节次栏 -->
				<div class="grid grid-rows-[repeat(11,3.75rem)] w-12 border-r border-border text-[10px] text-center">
					<div
						v-for="i in maxClass"
						:key="i"
						class="flex items-center justify-center border-b border-border last:border-b-0"
					>
						{{ i }}
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
