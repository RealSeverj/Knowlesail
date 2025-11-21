<script setup>
import { ref, computed } from 'vue'
import { useTodoStore } from '@/stores/todo'
import TodoCard from '@/components/Todo/TodoCard.vue'
import AddTodo from '@/components/Todo/AddTodo.vue'
import SearchPannel from '@/components/Todo/SearchPannel.vue'

const todoStore = useTodoStore()

// 当前展示的象限，默认 1（紧急且重要）
const activeQuadrant = ref(1)

const quadrants = computed(() => [
  { id: 1, title: '紧急且重要', color: 'from-red-500 to-orange-500' },
  { id: 2, title: '重要不紧急', color: 'from-amber-400 to-yellow-500' },
  { id: 3, title: '紧急不重要', color: 'from-sky-400 to-cyan-500' },
  { id: 4, title: '不重要不紧急', color: 'from-slate-400 to-gray-500' }
])

const rowSizes = computed(() => {
  const top = activeQuadrant.value === 1 || activeQuadrant.value === 2 ? 80 : 20
  return {
    top,
    bottom: 100 - top
  }
})

const colSizes = computed(() => {
  const left = activeQuadrant.value === 1 || activeQuadrant.value === 3 ? 80 : 20
  return {
    left,
    right: 100 - left
  }
})

const gridStyle = computed(() => ({
  gridTemplateRows: `${rowSizes.value.top}% ${rowSizes.value.bottom}%`,
  gridTemplateColumns: `${colSizes.value.left}% ${colSizes.value.right}%`
}))

const showSearch = ref(false)
const showAdd = ref(false)
const editingTodo = ref(null)
const targetQuadrant = ref(null)

const handleSwitchQuadrant = (id) => {
  activeQuadrant.value = id
}

const handleOpenSearch = () => {
  showSearch.value = true
}

const handleOpenAdd = () => {
  editingTodo.value = null
  targetQuadrant.value = null
  showAdd.value = true
}

const handleCloseSearch = () => {
  showSearch.value = false
}

const handleCloseAdd = () => {
  showAdd.value = false
}

const handleEditTodo = (todo) => {
  editingTodo.value = todo
  targetQuadrant.value = todo.priority || null
  showAdd.value = true
}

// 处理象限双击：在对应象限空白区域创建待办
const handleQuadrantDblClick = (quadrantId) => {
  editingTodo.value = null
  targetQuadrant.value = quadrantId
  showAdd.value = true
}

// 滑动切换象限逻辑
const touchStart = ref({ x: 0, y: 0 })
const minSwipeDistance = 50 // 滑动阈值

const handleTouchStart = (e) => {
  touchStart.value = {
    x: e.changedTouches[0].clientX,
    y: e.changedTouches[0].clientY
  }
}

const handleTouchEnd = (e) => {
  const touchEnd = {
    x: e.changedTouches[0].clientX,
    y: e.changedTouches[0].clientY
  }

  const deltaX = touchEnd.x - touchStart.value.x
  const deltaY = touchEnd.y - touchStart.value.y

  // 获取当前坐标 (0/1)
  // 1:(0,0), 2:(1,0), 3:(0,1), 4:(1,1)
  let currentX = (activeQuadrant.value === 2 || activeQuadrant.value === 4) ? 1 : 0
  let currentY = (activeQuadrant.value === 3 || activeQuadrant.value === 4) ? 1 : 0
  
  let nextX = currentX
  let nextY = currentY

  // 判断水平滑动
  if (Math.abs(deltaX) > minSwipeDistance) {
    if (deltaX < 0) {
      // 左滑，想看右边 -> x 变 1
      nextX = 1
    } else {
      // 右滑，想看左边 -> x 变 0
      nextX = 0
    }
  }

  // 判断垂直滑动
  if (Math.abs(deltaY) > minSwipeDistance) {
    if (deltaY < 0) {
      // 上滑，想看下边 -> y 变 1
      nextY = 1
    } else {
      // 下滑，想看上边 -> y 变 0
      nextY = 0
    }
  }

  // 计算新的象限 ID
  let nextQuadrant = 1
  if (nextX === 0 && nextY === 0) nextQuadrant = 1
  if (nextX === 1 && nextY === 0) nextQuadrant = 2
  if (nextX === 0 && nextY === 1) nextQuadrant = 3
  if (nextX === 1 && nextY === 1) nextQuadrant = 4

  if (nextQuadrant !== activeQuadrant.value) {
    activeQuadrant.value = nextQuadrant
  }
}
</script>

<template>
  <div class="todo-view flex min-h-screen flex-col">
    <header class="flex items-center justify-between px-4 pb-2 pt-4">
      <div>
        <h1 class="text-xl font-semibold text-[var(--color-text-primary)]">待办事项</h1>
        <p class="mt-1 text-xs text-[var(--color-text-secondary)]">双击对应象限空白处添加代办</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="icon-circle-btn"
          @click="handleOpenSearch"
        >
          <var-icon name="magnify" :size="24" />
        </button>
        <button
          class="icon-circle-btn"
          @click="handleOpenAdd"
        >
          <var-icon name="plus" :size="24" />
        </button>
      </div>
    </header>

    <main class="flex-1 pl-2 pr-5 pb-20 pt-4 overflow-hidden">
      <div
        class="quadrant-grid"
        :style="gridStyle"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      >
        <div
          v-for="q in quadrants"
          :key="q.id"
          class="quadrant-cell"
          :class="[`quadrant-${q.id}`, activeQuadrant === q.id ? 'is-active' : 'is-inactive']"
          role="button"
          tabindex="0"
          @click="handleSwitchQuadrant(q.id)"
          @dblclick="handleQuadrantDblClick(q.id)"
        >
          <TodoCard
            :quadrant="q"
            :todos="todoStore.quadrantTodos[q.id]"
            :active="activeQuadrant === q.id"
            :compact="activeQuadrant !== q.id"
            class="h-full"
            @edit-todo="handleEditTodo"
          />
        </div>
      </div>
    </main>

    <!-- 搜索面板 -->
    <SearchPannel v-model:show="showSearch" :todos="todoStore.todos" @close="handleCloseSearch" />

    <!-- 添加待办面板 -->
    <AddTodo
      v-model:show="showAdd"
      :editing-todo="editingTodo"
      :default-quadrant="targetQuadrant"
      @close="handleCloseAdd"
    />
  </div>
</template>

<style scoped>
.todo-view {
  overflow: hidden;
  height: 100%;
}

.quadrant-grid {
  display: grid;
  width: 100%;
  height: 100%;
  gap: 12px;
  transition:
    grid-template-columns 0.3s ease,
    grid-template-rows 0.3s ease;
}

.quadrant-cell {
  border-radius: 24px;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  display: flex;
  cursor: pointer;
}

.quadrant-cell.is-inactive {
  opacity: 0.9;
}

.quadrant-cell.is-active {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.quadrant-cell :deep(.todo-card) {
  width: 100%;
}
</style>
