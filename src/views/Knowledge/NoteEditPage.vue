<script setup>
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useKnowledgeStore } from '@/stores/knowledge'
import NoteEditor from '@/components/Knowledge/NoteEditor.vue'

const route = useRoute()
const router = useRouter()
const knowledgeStore = useKnowledgeStore()
const { notes } = storeToRefs(knowledgeStore)

const noteId = computed(() => route.params.id)

const note = computed(() => notes.value.find((n) => n.id === noteId.value))

// 本地编辑状态：浅复制 blocks，后续可在保存时提交到 store / API
const editState = reactive({
  blocks: computed(() => note.value?.blocks || [])
})

function handleBack() {
  router.back()
}

function handleBlockContentChange(blockId, value) {
  const target = note.value?.blocks.find((b) => b.id === blockId)
  if (target) {
    target.content = value
  }
}

function handleSave() {
  // TODO: 接入后端 / store 持久化
  // 当前先简单 Toast 一下，或控制台打印
  console.log('保存笔记：', noteId.value, note.value)
}
</script>

<template>
  <div class="note-edit-page min-h-screen bg-background flex flex-col">
    <!-- 顶部栏 -->
    <div
      class="flex items-center px-4 py-3 border-b border-border/60 bg-surface/80 backdrop-blur z-10"
    >
      <var-button text round size="small" class="mr-1" @click="handleBack">
        <var-icon name="chevron-left" :size="18" />
      </var-button>
      <div class="flex-1 min-w-0">
        <h2 class="text-base font-semibold text-foreground truncate">
          {{ note?.title || '编辑笔记' }}
        </h2>
        <p v-if="note" class="text-[11px] text-secondary mt-0.5">
          共 {{ note.blocks.length }} 个内容块
        </p>
      </div>
      <var-button type="primary" round size="large" @click="handleSave">
        <var-icon name="check" :size="18" />
      </var-button>
    </div>

    <div v-if="!note" class="flex-1 flex items-center justify-center px-4">
      <div class="text-center">
        <var-icon
          name="file-document-outline"
          :size="48"
          color="var(--color-primary)"
          class="mb-3"
        />
        <h3 class="text-base font-medium text-foreground mb-2">未找到笔记</h3>
        <p class="text-secondary text-xs mb-4">可能是链接失效或笔记已被删除</p>
        <var-button type="primary" round size="small" @click="handleBack">返回上一页</var-button>
      </div>
    </div>

    <div v-else class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      <div
        v-for="block in editState.blocks"
        :key="block.id"
        class="space-y-2"
      >
        <!-- 每个内容块的头部信息 -->
        <div class="flex items-center justify-between text-[11px] text-text-tertiary px-1">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1">
              <var-icon name="account" :size="14" />
              <span>作者: {{ block.authorId }}</span>
            </span>
            <span class="text-border">•</span>
            <span>
              {{
                new Date(block.createdAt).toLocaleString('zh-CN', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              }}
            </span>
          </div>
        </div>

        <!-- 编辑器 -->
        <NoteEditor
          :block-id="block.id"
          v-model="block.content"
          class="mt-1"
          @blur="() => handleBlockContentChange(block.id, block.content)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.note-edit-page {
  background-color: var(--color-background);
}
</style>
