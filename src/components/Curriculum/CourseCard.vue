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

// 预设几种与 Varlet 风格协调的边框颜色（使用十六进制，方便编译）
const borderColorClasses = [
	'border-[#3B82F6]', // 蓝色
	'border-[#22C55E]', // 绿色
	'border-[#FACC15]', // 黄色
	'border-[#F97373]', // 红色
	'border-[#7C3AED]', // 紫色
	'border-[#14B8A6]' // 青色
]

// 根据课程 id 稳定生成一个索引，保证同一课程颜色一致
const borderClass = computed(() => {
	const key = String(props.course.courseId || props.course.id || props.course.name || '')
	let hash = 0
	for (let i = 0; i < key.length; i++) {
		hash = (hash * 31 + key.charCodeAt(i)) >>> 0
	}
	const index = hash % borderColorClasses.length
	return borderColorClasses[index]
})

const duration = computed(() => props.endClass - props.startClass + 1)

const topStyle = computed(() => {
	const unit = 100 / 11 // 每节课高度百分比
	const gap = 0.5 // 百分比空隙
	const offset = (props.startClass - 1) * unit + gap
	return `${offset}%`
})

const heightStyle = computed(() => {
	const unit = 100 / 11
	const gap = 0.5
	const total = duration.value * unit - gap * 2
	return `${total}%`
})
</script>

<template>
	<div>
		<div
			class="absolute left-1 right-1 rounded-lg bg-primary/90 text-primary-foreground px-2 py-1 text-[11px] shadow cursor-pointer overflow-hidden flex flex-col justify-between border-2 border-opacity-50"
			:class="borderClass"
			:style="{ top: topStyle, height: heightStyle }"
			@click="showDetail = true"
		>
			<div class="flex-1 min-h-0 flex items-start">
				<div class="font-semibold leading-snug line-clamp-3 break-words">
					{{ course.name }}
				</div>
			</div>
			<div class="mt-0.5 text-[10px] leading-snug opacity-90 break-words">
				{{ course.location }}
			</div>
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
