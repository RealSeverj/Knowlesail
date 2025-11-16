<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
	course: {
		type: Object,
		required: true
	},
	// 用于定位在周视图中的高度/跨度
	startClass: {
		type: Number,
		required: true
	},
	endClass: {
		type: Number,
		required: true
	}
})

const showDetail = ref(false)

const duration = computed(() => props.endClass - props.startClass + 1)

const topStyle = computed(() => {
	const baseHeight = 3.5 // 每节高度 rem，对应 tailwind 行高
	const gap = 0.25
	const offset = (props.startClass - 1) * (baseHeight + gap)
	return `${offset}rem`
})

const heightStyle = computed(() => {
	const baseHeight = 3.5
	const gap = 0.25
	return `${duration.value * baseHeight + (duration.value - 1) * gap}rem`
})
</script>

<template>
	<div>
		<div
			class="absolute left-1 right-1 rounded-lg bg-primary/90 text-primary-foreground px-2 py-1 text-xs shadow cursor-pointer overflow-hidden flex flex-col justify-between"
			:style="{ top: topStyle, height: heightStyle }"
			@click="showDetail = true"
		>
			<div class="font-semibold truncate">{{ course.name }}</div>
			<div class="text-[10px] truncate opacity-90">{{ course.location }}</div>
		</div>

		<var-dialog v-model:show="showDetail" title="课程详情" lock-scroll>
			<div class="space-y-2 text-sm">
				<div>
					<div class="text-xs text-secondary mb-1">课程名称</div>
					<div class="font-medium">{{ course.name }}</div>
				</div>
				<div>
					<div class="text-xs text-secondary mb-1">任课教师</div>
					<div>{{ course.teacher || '未填写' }}</div>
				</div>
				<div>
					<div class="text-xs text-secondary mb-1">上课地点</div>
					<div>{{ course.location || '未填写' }}</div>
				</div>
				<div>
					<div class="text-xs text-secondary mb-1">周次范围</div>
					<div>第 {{ course.startWeek }} - {{ course.endWeek }} 周</div>
				</div>
				<div>
					<div class="text-xs text-secondary mb-1">节次</div>
					<div>第 {{ startClass }} - {{ endClass }} 节</div>
				</div>
				<div v-if="course.remark">
					<div class="text-xs text-secondary mb-1">备注</div>
					<div class="whitespace-pre-wrap">{{ course.remark }}</div>
				</div>
				<div class="flex gap-2 mt-2">
					<var-button
						v-if="course.lessonplan"
						type="primary"
						text
						size="mini"
						@click="() => window.open(course.lessonplan, '_blank')"
					>
						教学计划
					</var-button>
					<var-button
						v-if="course.syllabus"
						type="primary"
						text
						size="mini"
						@click="() => window.open(course.syllabus, '_blank')"
					>
						教学大纲
					</var-button>
				</div>
			</div>
		</var-dialog>
	</div>
</template>

<style scoped>
</style>
