<script setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useKnowledgeStore } from '@/stores/knowledge'
import NoteCard from '@/components/Knowledge/NoteCard.vue'

const router = useRouter()
const knowledgeStore = useKnowledgeStore()
const { notes } = storeToRefs(knowledgeStore)

function handleNoteClick(note) {
  router.push({ name: 'NoteDetail', params: { id: note.id } })
}
</script>

<template>
  <div class="min-h-screen px-4 py-4">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-xl font-semibold text-foreground mb-1">我的笔记</h2>
        <p class="text-xs text-secondary">当前共 {{ notes.length }} 条笔记</p>
      </div>
      <var-button type="primary" round>
        <var-icon name="plus" :size="16"  />
      </var-button>
    </div>

    <div v-if="notes.length" class="space-y-2">
      <NoteCard v-for="note in notes" :key="note.id" :note="note" @click="handleNoteClick" />
    </div>
    <div v-else class="text-center py-12">
      <var-icon name="notebook" :size="48" color="var(--color-primary)" class="mb-3" />
      <h3 class="text-base font-medium text-foreground mb-2">暂无笔记</h3>
      <p class="text-secondary text-xs mb-4">点击右上角“新建笔记”开始记录你的第一条学习收获</p>
      <var-button type="primary" round size="small">
        <var-icon name="plus" :size="16" class="mr-1" />
        新建笔记
      </var-button>
    </div>
  </div>
</template>

<style scoped>
</style>
