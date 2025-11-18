<script setup>
import { ref, computed } from 'vue'
import ThemeSwitch from './ThemeSwitch.vue'
import PopMenu from '@/components/Common/PopMenu.vue'
import { useTheme } from '@/composables/useTheme'

const props = defineProps({
	preferences: {
		type: Object,
		required: true
	}
})

const emit = defineEmits(['open-preference', 'open-about', 'open-custom-theme'])

const { theme, initTheme, setTheme } = useTheme()

const themeMenuVisible = ref(false)

const themeDescription = computed(() => {
  const value = theme.value
  if (!value) return '当前：默认'
  return `当前：${value.name || value.id}`
})

const onOpenPreference = () => {
	emit('open-preference')
}

const onOpenAbout = () => {
	emit('open-about')
}

const themeOptions = [
  { label: '默认浅色', value: 'light-default', icon: 'white-balance-sunny' },
  { label: '默认深色', value: 'dark-default', icon: 'weather-night' },
  { label: '海洋蓝', value: 'ocean-blue', icon: 'palette-outline' }
]

const handleThemeSelect = (value) => {
  setTheme(value)
  themeMenuVisible.value = false
}

const openCustomTheme = () => {
  themeMenuVisible.value = false
  emit('open-custom-theme')
}

initTheme()
</script>

<template>
	<div class="space-y-3">
		<!-- 主题与外观 -->
		<section>
			<div class="mb-1 flex items-center justify-between px-1">
				<p class="text-xs font-medium text-slate-500 dark:text-slate-400">主题与外观</p>
			</div>
      <div class="rounded-xl bg-slate-50 dark:bg-slate-700/60">
        <div class="flex items-center justify-between px-3 py-2">
          <div class="flex items-center">
            <var-icon name="palette-outline" />
            <div class="flex flex-col ml-3">
              <p class="text-sm font-medium text-slate-800 dark:text-slate-100">界面主题</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ themeDescription }}</p>
            </div>
          </div>
          <div class="relative">
            <button
              class="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-200 dark:bg-slate-600 dark:text-slate-50 dark:hover:bg-slate-500"
              @click="themeMenuVisible = true"
            >
              <span>切换</span>
              <var-icon name="chevron-down" :size="16" />
            </button>
            <PopMenu v-model="themeMenuVisible" :overlay="true" pop-class="absolute z-20 right-0 top-8" width-class="w-44">
              <div class="space-y-1">
                <button
                  v-for="item in themeOptions"
                  :key="item.value"
                  class="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-[12px] text-slate-700 hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-600"
                  @click="handleThemeSelect(item.value)"
                >
                  <div class="flex items-center gap-2">
                    <var-icon :name="item.icon" :size="16" />
                    <span>{{ item.label }}</span>
                  </div>
                  <var-icon
                    v-if="theme?.id === item.value"
                    name="check"
                    :size="14"
                  />
                </button>
                <div class="my-1 h-px bg-slate-200 dark:bg-slate-500" />
                <button
                  class="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-[12px] text-slate-700 hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-600"
                  @click="openCustomTheme"
              >
                  <div class="flex items-center gap-2">
                    <var-icon name="palette" :size="16" />
                    <span>自定义主题</span>
                  </div>
                  <var-icon name="chevron-right" :size="14" />
                </button>
              </div>
            </PopMenu>
          </div>
        </div>
      </div>
		</section>

		<!-- 账号与同步 -->
		<section>
			<div class="mb-1 flex items-center justify-between px-1">
				<p class="text-xs font-medium text-slate-500 dark:text-slate-400">账号与同步</p>
			</div>
			<div class="overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-700/60">
				<var-cell icon="account-circle-outline" title="账号设置">
          <template #description>
            <span class="text-xs text-slate-500 dark:text-slate-400">绑定、密码和安全</span>
          </template>
        </var-cell>
        
        <var-cell icon="refresh" title="数据同步">
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
			    <var-cell icon="cog-outline" title="偏好设置" @click="onOpenPreference">
            <template #description>
              <span class="text-xs text-slate-500 dark:text-slate-400">
                笔记与学习体验相关设置
              </span>
            </template>
            <template #extra>
              <var-icon name="chevron-right" :size="18" />
            </template>
          </var-cell>
          
          <var-cell icon="calendar-month-outline" title="导出课程表到日历">
            <template #description>
              <span class="text-xs text-slate-500 dark:text-slate-400">
                便于系统日历统一查看
              </span>
            </template>
            <template #extra>
              <var-icon name="chevron-right" :size="18" />
            </template>
          </var-cell>
          
          <var-cell icon="pin-outline" title="个性化推荐">
            <template #description>
              <span class="text-xs text-slate-500 dark:text-slate-400">
                根据使用习惯推荐学习内容
              </span>
            </template>
            <template #extra>
              <var-switch :model-value="preferences.personalizedRecommend" readonly />
            </template>
          </var-cell>
          
          <var-cell icon="bell-outline" title="课前提醒与内容推送">
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
				<var-cell icon="information-outline" title="关于学海智航" @click="onOpenAbout">
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

<style scoped>
::v-deep(.var-cell__icon) {
  margin-right: 12px;
}
</style>