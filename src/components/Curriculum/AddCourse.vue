<script setup>
import { ref } from 'vue'
import { useCurriculumStore } from '@/stores/curriculum'

const emit = defineEmits(['created'])

const curriculumStore = useCurriculumStore()

const show = ref(false)

const form = ref({
	name: '',
	teacher: '',
	location: '',
	weekday: 1,
	startClass: 1,
	endClass: 2,
	startWeek: 1,
	endWeek: 16,
	single: true,
	double: true,
	remark: ''
})

const weekdays = [
	{ label: '周一', value: 1 },
	{ label: '周二', value: 2 },
	{ label: '周三', value: 3 },
	{ label: '周四', value: 4 },
	{ label: '周五', value: 5 },
	{ label: '周六', value: 6 },
	{ label: '周日', value: 7 }
]

const classList = Array.from({ length: 11 }).map((_, i) => ({
	label: `第 ${i + 1} 节`,
	value: i + 1
}))

function resetForm() {
	form.value = {
		name: '',
		teacher: '',
		location: '',
		weekday: 1,
		startClass: 1,
		endClass: 2,
		startWeek: 1,
		endWeek: 16,
		single: true,
		double: true,
		remark: ''
	}
}

async function handleSubmit() {
	if (!form.value.name || !form.value.location) {
		// 未来可接入全局 toast
		return
	}

	const payload = {
		name: form.value.name,
		teacher: form.value.teacher,
		remark: form.value.remark,
		scheduleRules: [
			{
				location: form.value.location,
				startClass: form.value.startClass,
				endClass: form.value.endClass,
				startWeek: form.value.startWeek,
				endWeek: form.value.endWeek,
				weekday: form.value.weekday,
				single: form.value.single,
				double: form.value.double,
				adjust: false
			}
		]
	}

	await curriculumStore.createCourse(payload)
	emit('created')
	show.value = false
	resetForm()
}
</script>

<template>
	<div>
		<var-button type="primary" block @click="show = true">添加课程</var-button>

		<var-popup v-model:show="show" position="bottom" :overlay="true" :lock-scroll="true">
			<div class="bg-background rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto">
				<div class="flex items-center justify-between mb-3">
					<div class="font-semibold text-base">新建课程</div>
					<var-icon name="close" @click="show = false" />
				</div>

				<div class="space-y-3 text-sm">
					<var-input
						v-model="form.name"
						placeholder="请输入课程名称"
						clearable
					>
						<template #label>课程名称</template>
					</var-input>

					<var-input
						v-model="form.teacher"
						placeholder="例如：张三"
						clearable
					>
						<template #label>任课教师</template>
					</var-input>

					<var-input
						v-model="form.location"
						placeholder="例如：西1-203"
						clearable
					>
						<template #label>上课地点</template>
					</var-input>

					<div class="grid grid-cols-2 gap-3">
						<var-select v-model="form.weekday" :options="weekdays" clearable>
							<template #label>星期</template>
						</var-select>

						<var-select v-model="form.startClass" :options="classList">
							<template #label>开始节次</template>
						</var-select>

						<var-select v-model="form.endClass" :options="classList">
							<template #label>结束节次</template>
						</var-select>

						<div class="flex items-center gap-2 mt-4">
							<var-checkbox v-model="form.single">单周</var-checkbox>
							<var-checkbox v-model="form.double">双周</var-checkbox>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<var-input
							v-model.number="form.startWeek"
							type="number"
							placeholder="1"
						>
							<template #label>开始周</template>
						</var-input>
						<var-input
							v-model.number="form.endWeek"
							type="number"
							placeholder="16"
						>
							<template #label>结束周</template>
						</var-input>
					</div>

					<var-input
						v-model="form.remark"
						type="textarea"
						rows="2"
						placeholder="可填写考试说明、平时作业等"
					>
						<template #label>备注</template>
					</var-input>

					<div class="mt-4 flex gap-3">
						<var-button text type="default" class="flex-1" @click="show = false">
							取消
						</var-button>
						<var-button type="primary" class="flex-1" @click="handleSubmit">
							保存
						</var-button>
					</div>
				</div>
			</div>
		</var-popup>
	</div>
</template>

<style scoped>
</style>
