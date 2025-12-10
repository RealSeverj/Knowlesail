<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useCurriculumStore } from '@/stores/curriculum'
import { useTodoStore } from '@/stores/todo'
import { getDailySchedule } from '@/api/curriculum'
import { getCurrentDateInfo } from '@/utils/date'
import { getNextClass } from '@/utils/curriculum'
import { getNearestTodo } from '@/utils/todo'
import { simulateStreamOutput } from '@/utils/common'
import PopFrame from '@/components/Common/PopFrame.vue'
import MarkdownRenderer from '@/components/Home/MarkdownRenderer/MarkdownRenderer.vue'
import { useProfileStore } from '@/stores'

const router = useRouter()
const chatStore = useChatStore()
const curriculumStore = useCurriculumStore()
const todoStore = useTodoStore()
const profileStore = useProfileStore()

// 最近的一个对话
const lastConversation = computed(() => chatStore.conversations[0] || null)

// 是否有历史对话
const hasLastConversation = computed(() => !!lastConversation.value)

// 每日日程相关状态
const showScheduleDialog = ref(false)
const scheduleContent = ref('')
const fullScheduleContent = ref('') // 完整内容
const scheduleLoading = ref(false)
const scheduleError = ref(false)
const isStreaming = ref(false) // 是否正在流式输出

// 获取当前日期信息
const dateInfo = computed(() => getCurrentDateInfo())

// 获取今天的下一节课
const nextClass = computed(() => getNextClass(curriculumStore))

// ========== 最近待办计算 ==========
const nearestTodo = computed(() => getNearestTodo(todoStore))

onMounted(async () => {
  if (!curriculumStore.initialized) await curriculumStore.initCourses()
  if (!todoStore.initialized) await todoStore.initTodos()
})

const goToCurriculum = () => router.push({ name: 'Curriculum' })
const goToTodo = () => router.push({ name: 'Todo' })

// 模拟流式输出
const simulateStreamOutputLocal = async (text) => {
  scheduleContent.value = ''
  isStreaming.value = true
  await simulateStreamOutput(text, (currentText) => {
    scheduleContent.value = currentText
  })
  isStreaming.value = false
}

// 获取每日日程
const fetchDailySchedule = async () => {
  showScheduleDialog.value = true
  scheduleLoading.value = true
  scheduleError.value = false
  scheduleContent.value = ''
  fullScheduleContent.value = ''

  try {
    const res = await getDailySchedule()
    if (res.code === '10000' && res.data?.schedule) {
      fullScheduleContent.value = res.data.schedule
      scheduleLoading.value = false
      // 开始流式输出
      await simulateStreamOutputLocal(res.data.schedule)
    } else {
      scheduleError.value = true
      scheduleLoading.value = false
    }
  } catch (error) {
    console.error('获取每日日程失败:', error)
    scheduleError.value = true
    scheduleLoading.value = false
  }
}

// 空的生成图片函数（MarkdownRenderer 需要）
const generateImage = () => {}

// 开启新对话
const startNewChat = () => {
  const conversation = chatStore.createConversation()
  router.push({ name: 'Chat', params: { conversationId: conversation.id } })
}

// 打开上一次会话
const openLastChat = () => {
  if (lastConversation.value) {
    router.push({ name: 'Chat', params: { conversationId: lastConversation.value.id } })
  }
}

const handleNavigateHistory = () => {
  router.push({ name: 'ChatHistory' })
}
</script>

<template>
  <div
    class="flex flex-col h-full relative overflow-hidden bg-gradient-to-b from-transparent to-white/30 dark:to-slate-900/30"
  >
    <!-- 主内容区 -->
    <main class="flex-1 px-5 pb-6 overflow-y-auto no-scrollbar flex flex-col z-10">
      <!-- Logo & Slogan -->
      <section class="flex-1 flex flex-col items-center justify-center min-h-[200px] mt-4">
        <div class="relative mb-6">
          <div
            class="absolute inset-0 blur-3xl rounded-full"
            style="background-color: color-mix(in srgb, var(--color-primary), transparent 80%)"
          ></div>
          <img
            src="/icon.png"
            alt="Logo"
            class="relative w-36 h-36 object-contain drop-shadow-xl animate-float"
          />
        </div>
        <h2 class="text-xl font-bold text-[var(--color-text-primary)] mb-2">有什么可以帮你的？</h2>
        <p class="text-[var(--color-text-secondary)] text-sm opacity-80">
          解答问题 · 整理笔记 · 规划学习
        </p>
      </section>

      <!-- 快捷操作卡片 -->
      <section class="grid grid-cols-2 gap-4 mb-6">
        <button
          v-ripple
          class="relative flex flex-col items-center p-4 rounded-2xl transition-all duration-200 backdrop-blur-md shadow-sm hover:shadow-md active:scale-[0.98] border group"
          style="
            background-color: color-mix(in srgb, var(--color-surface), transparent 40%);
            border-color: color-mix(in srgb, var(--color-border), transparent 80%);
          "
          @click="startNewChat"
        >
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors"
            style="
              background-color: color-mix(in srgb, var(--color-primary), transparent 90%);
              color: var(--color-primary);
            "
          >
            <var-icon name="message-processing-outline" :size="24" />
          </div>
          <div class="text-center">
            <span class="block text-base font-bold text-[var(--color-text-primary)]"
              >开启新对话</span
            >
            <span class="block text-xs text-[var(--color-text-secondary)] mt-0.5"
              >探索无限可能</span
            >
          </div>
          <var-icon
            name="arrow-right"
            :size="16"
            class="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-tertiary)]"
          />
        </button>

        <button
          v-if="hasLastConversation"
          v-ripple
          class="relative flex flex-col items-center p-4 rounded-2xl transition-all duration-200 backdrop-blur-md shadow-sm hover:shadow-md active:scale-[0.98] border group"
          style="
            background-color: color-mix(in srgb, var(--color-surface), transparent 30%);
            border-color: color-mix(in srgb, var(--color-border), transparent 80%);
          "
          @click="openLastChat"
        >
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors"
            style="
              background-color: color-mix(in srgb, var(--color-info), transparent 90%);
              color: var(--color-info);
            "
          >
            <var-icon name="history" :size="24" />
          </div>
          <div class="text-center">
            <span class="block text-base font-bold text-[var(--color-text-primary)]">继续对话</span>
            <span class="block text-xs text-[var(--color-text-secondary)] mt-0.5"
              >回到上次话题</span
            >
          </div>
        </button>

        <!-- 占位，保持布局平衡如果只有一个按钮 -->
        <div
          v-else
          class="relative flex flex-col p-4 rounded-2xl transition-all duration-200 bg-transparent shadow-none border-dashed border-2 opacity-50 items-center justify-center"
          style="border-color: var(--color-border)"
        >
          <span class="text-xs text-[var(--color-text-tertiary)]">暂无历史记录</span>
        </div>
      </section>

      <!-- 智能概览面板 -->
      <section
        class="backdrop-blur-xl rounded-2xl p-1 border"
        style="
          background-color: color-mix(in srgb, var(--color-surface), transparent 30%);
          border-color: color-mix(in srgb, var(--color-border), transparent 80%);
        "
      >
        <div class="flex flex-col">
          <!-- 下一节课 -->
          <button
            v-if="nextClass"
            v-ripple
            class="w-full flex items-center p-3 transition-colors rounded-xl hover:bg-white/50 dark:hover:bg-white/5 active:bg-white/80 dark:active:bg-white/10 border-b last:border-b-0"
            style="border-color: color-mix(in srgb, var(--color-border), transparent 50%)"
            @click="goToCurriculum"
          >
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style="
                background-color: color-mix(in srgb, var(--color-warning), transparent 90%);
                color: var(--color-warning);
              "
            >
              <var-icon name="notebook" :size="20" />
            </div>
            <div class="flex-1 min-w-0 text-left ml-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold text-[var(--color-text-primary)] truncate">{{
                  nextClass.name
                }}</span>
                <span
                  class="text-xs font-medium px-1.5 py-0.5 rounded"
                  style="
                    color: var(--color-warning);
                    background-color: color-mix(in srgb, var(--color-warning), transparent 90%);
                  "
                >
                  {{ nextClass.startTimeStr }}
                </span>
              </div>
              <p class="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">
                {{ nextClass.location }} · {{ nextClass.isOngoing ? '正在上课' : '即将开始' }}
              </p>
            </div>
            <var-icon name="chevron-right" :size="18" class="ml-2 text-gray-400" />
          </button>
          <div
            v-else-if="curriculumStore.initialized"
            class="w-full flex items-center p-3 transition-colors rounded-xl opacity-60 border-b last:border-b-0"
            style="border-color: color-mix(in srgb, var(--color-border), transparent 50%)"
          >
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style="
                background-color: color-mix(in srgb, var(--color-text-tertiary), transparent 90%);
                color: var(--color-text-tertiary);
              "
            >
              <var-icon name="bell-outline" :size="20" />
            </div>
            <div class="flex-1 ml-3 text-left">
              <span class="text-sm font-medium text-[var(--color-text-primary)]"
                >今日课程已结束</span
              >
            </div>
          </div>

          <!-- 待办事项 -->
          <button
            v-if="nearestTodo"
            v-ripple
            class="w-full flex items-center p-3 transition-colors rounded-xl hover:bg-white/50 dark:hover:bg-white/5 active:bg-white/80 dark:active:bg-white/10 border-b last:border-b-0"
            style="border-color: color-mix(in srgb, var(--color-border), transparent 50%)"
            @click="goToTodo"
          >
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style="
                background-color: color-mix(in srgb, var(--color-success), transparent 90%);
                color: var(--color-success);
              "
            >
              <var-icon name="checkbox-marked-circle-outline" :size="20" />
            </div>
            <div class="flex-1 min-w-0 text-left ml-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold text-[var(--color-text-primary)] truncate">{{
                  nearestTodo.title
                }}</span>
                <span
                  class="text-xs font-medium px-1.5 py-0.5 rounded"
                  :style="
                    nearestTodo.isUrgent
                      ? 'color: var(--color-error); background-color: color-mix(in srgb, var(--color-error), transparent 90%)'
                      : 'color: var(--color-success); background-color: color-mix(in srgb, var(--color-success), transparent 90%)'
                  "
                >
                  {{ nearestTodo.timeLeftStr }}
                </span>
              </div>
              <p class="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">
                截止 {{ nearestTodo.deadlineStr }}
              </p>
            </div>
            <var-icon name="chevron-right" :size="18" class="ml-2 text-gray-400" />
          </button>

          <!-- 无待办时的占位 -->
          <div
            v-else
            class="w-full flex items-center p-3 rounded-xl border-b last:border-b-0 opacity-60"
            style="border-color: color-mix(in srgb, var(--color-border), transparent 50%)"
          >
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style="
                background-color: color-mix(in srgb, var(--color-text-tertiary), transparent 90%);
                color: var(--color-text-tertiary);
              "
            >
              <var-icon name="checkbox-blank-circle-outline" :size="20" />
            </div>
            <div class="flex-1 min-w-0 text-left ml-3">
              <span class="text-sm font-medium text-[var(--color-text-primary)]">
                当前暂无待办
              </span>
              <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
                可以在待办页面添加新的任务
              </p>
            </div>
          </div>

          <!-- 今日日程 -->
          <button
            v-if="profileStore.preferences.personalizedRecommend"
            v-ripple
            class="w-full flex items-center p-3 transition-colors rounded-xl hover:bg-white/50 dark:hover:bg-white/5 active:bg-white/80 dark:active:bg-white/10 border-b last:border-b-0"
            style="border-color: color-mix(in srgb, var(--color-border), transparent 50%)"
            @click="fetchDailySchedule"
          >
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style="
                background-color: color-mix(in srgb, var(--color-primary), transparent 90%);
                color: var(--color-primary);
              "
            >
              <var-icon name="calendar-month-outline" :size="20" />
            </div>
            <div class="flex-1 min-w-0 text-left ml-3">
              <span class="text-sm font-bold text-[var(--color-text-primary)]">今日日程报告</span>
              <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
                查看完整的学习计划与安排
              </p>
            </div>
            <var-icon name="chevron-right" :size="18" class="ml-2 text-gray-400" />
          </button>
        </div>
      </section>
    </main>

    <!-- 顶部导航按钮 -->
    <button type="button" class="icon-circle-btn fixed-btn" @click="handleNavigateHistory">
      <var-icon name="menu" :size="24" />
      <span class="sr-only">查看聊天历史</span>
    </button>

    <!-- 每日日程弹窗 -->
    <PopFrame
      v-model:show="showScheduleDialog"
      :overlay="true"
      :close-on-click-overlay="!isStreaming"
      width-class="w-[92vw] max-w-md"
      max-height-class="max-h-[80vh]"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <div
            class="flex items-center justify-center w-8 h-8 rounded-lg"
            style="background-color: color-mix(in srgb, var(--color-primary), transparent 90%)"
          >
            <var-icon name="calendar-month" :size="18" color="var(--color-primary)" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-slate-800 dark:text-slate-100">今日日程</h2>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              {{ dateInfo.month }}月{{ dateInfo.day }}日 {{ dateInfo.weekDay }}
              <span v-if="isStreaming" class="ml-1 text-blue-500">· 生成中...</span>
            </p>
          </div>
        </div>
      </template>

      <div class="schedule-content">
        <!-- 加载状态 -->
        <div v-if="scheduleLoading" class="flex flex-col items-center justify-center py-12">
          <var-loading type="wave" color="var(--color-primary)" />
          <p class="mt-4 text-sm text-slate-500 dark:text-slate-400">正在获取今日日程...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="scheduleError" class="flex flex-col items-center justify-center py-12">
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style="background-color: color-mix(in srgb, var(--color-error), transparent 90%)"
          >
            <var-icon name="alert-circle-outline" :size="32" color="var(--color-error)" />
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-4">获取日程失败，请稍后重试</p>
          <var-button type="primary" size="small" @click="fetchDailySchedule">
            重新获取
          </var-button>
        </div>

        <!-- 日程内容 - 使用 MarkdownRenderer -->
        <div v-else class="schedule-markdown">
          <MarkdownRenderer
            :content="scheduleContent"
            :generate-image="generateImage"
            :message-id="'daily-schedule'"
            :streaming="isStreaming"
            :scale="0.9"
            color="var(--color-primary)"
          />
          <!-- 流式输出时的光标 -->
          <span v-if="isStreaming" class="streaming-cursor">|</span>
        </div>
      </div>
    </PopFrame>
  </div>
</template>

<style scoped>
.schedule-content {
  min-height: 200px;
}

.schedule-markdown {
  position: relative;
}

/* 流式输出光标动画 */
.streaming-cursor {
  display: inline-block;
  color: var(--color-primary);
  font-weight: bold;
  animation: blink 0.8s infinite;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.fixed-btn {
  position: fixed;
  top: calc(20px + env(safe-area-inset-top));
  right: 20px;
  z-index: 20;
}
</style>
