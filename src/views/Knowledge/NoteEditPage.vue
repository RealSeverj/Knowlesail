<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const noteId = computed(() => route.params.id)
</script>

<template>
  <div class="note-edit-page min-h-screen bg-background p-4">
    <div class="text-center py-12">
      <var-icon name="pencil" :size="48" color="var(--color-primary)" class="mb-3" />
      <h2 class="text-xl font-semibold text-foreground mb-2">编辑笔记</h2>
      <p class="text-secondary text-sm">笔记 ID: {{ noteId }}</p>
    </div>
  </div>
</template>

<style scoped>
.note-edit-page {
  background-color: var(--color-background);
}
</style>
