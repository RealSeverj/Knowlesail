<script setup>
import { computed } from 'vue'
import ThemeSwitch from './ThemeSwitch.vue'

const props = defineProps({
	preferences: {
		type: Object,
		required: true
	}
})

const emit = defineEmits(['open-preference', 'open-about'])

const themeDescription = computed(() => {
	const theme = props.preferences.theme
	if (theme === 'light') return '当前：浅色'
	if (theme === 'dark') return '当前：深色'
	return '当前：跟随系统'
})

const onOpenPreference = () => {
	emit('open-preference')
}

const onOpenAbout = () => {
	emit('open-about')
}
</script>

<template>
	<div class="space-y-3">
		<!-- 主题与外观 -->
		<section>
			<div class="mb-1 flex items-center justify-between px-1">
				<p class="text-xs font-medium text-slate-500 dark:text-slate-400">主题与外观</p>
			</div>
			<div class="overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-700/60">
				<ThemeSwitch />
			</div>
		</section>

		<!-- 账号与同步 -->
		<section>
			<div class="mb-1 flex items-center justify-between px-1">
				<p class="text-xs font-medium text-slate-500 dark:text-slate-400">账号与同步</p>
			</div>
			<div class="overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-700/60">
				<var-cell border="false" icon="account-settings" title="账号设置">
                  <template #description>
                    <span class="text-xs text-slate-500 dark:text-slate-400">绑定、密码和安全</span>
                  </template>
                </var-cell>
                
                <var-cell border="false" icon="cloud-sync" title="数据同步">
                  <template #description>
                    <span class="text-xs text-slate-500 dark:text-slate-400">跨设备同步学习数据</span>
                  </template>
                </var-cell>
			</div>
		</section>

		<!-- 偏好与通知 -->
		<section>
			<div class="mb-1 flex items-center justify-between px-1">
				<p class="text-xs font-medium text-slate-500 dark:text-slate-400">偏好与通知</p>
			</div>
			<div class="overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-700/60">
			    <var-cell border="false" icon="tune" title="偏好设置" @click="onOpenPreference">
                  <template #description>
                    <span class="text-xs text-slate-500 dark:text-slate-400">
                      笔记与学习体验相关设置
                    </span>
                  </template>
                  <template #extra>
                    <var-icon name="chevron-right" :size="18" />
                  </template>
                </var-cell>
                
                <var-cell border="false" icon="calendar" title="导出课程表到日历">
                  <template #description>
                    <span class="text-xs text-slate-500 dark:text-slate-400">
                      便于系统日历统一查看
                    </span>
                  </template>
                  <template #extra>
                    <var-icon name="chevron-right" :size="18" />
                  </template>
                </var-cell>
                
                <var-cell border="false" icon="lightbulb-on" title="个性化推荐">
                  <template #description>
                    <span class="text-xs text-slate-500 dark:text-slate-400">
                      根据使用习惯推荐学习内容
                    </span>
                  </template>
                  <template #extra>
                    <var-switch :model-value="preferences.personalizedRecommend" readonly />
                  </template>
                </var-cell>
                
                <var-cell border="false" icon="bell-ring" title="课前提醒与内容推送">
                  <template #description>
                    <span class="text-xs text-slate-500 dark:text-slate-400">
                      上课前自动推送相关提醒与资料
                    </span>
                  </template>
                  <template #extra>
                    <var-switch :model-value="preferences.autoCourseReminder" readonly />
                  </template>
                </var-cell>
			</div>
		</section>

		<!-- 关于 -->
		<section>
			<div class="mb-1 flex items-center justify-between px-1">
				<p class="text-xs font-medium text-slate-500 dark:text-slate-400">关于</p>
			</div>
			<div class="overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-700/60">
				<var-cell border="false" title="关于学海智航" @click="onOpenAbout">
                  <template #description>
                    <span class="text-xs text-slate-500 dark:text-slate-400">
                      版本信息与联系我们
                    </span>
                  </template>
                  <template #extra>
                    <var-icon name="chevron-right" :size="18" />
                  </template>
                </var-cell>
			</div>
		</section>
	</div>
</template>

<style scoped></style>
