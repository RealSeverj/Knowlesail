<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useKnowledgeStore } from '@/stores/knowledge'
import MarkdownRenderer from '@/components/Home/MarkdownRenderer/MarkdownRenderer.vue'

const route = useRoute()
const router = useRouter()
const knowledgeStore = useKnowledgeStore()
const { notes } = storeToRefs(knowledgeStore)

const noteId = computed(() => route.params.id)

const note = computed(() => notes.value.find((n) => n.id === noteId.value))

const messageBlocks = computed(() => {
  if (!note.value) return []
  return note.value.blocks.map((block) => ({
    id: block.id,
    authorId: block.authorId,
    content: block.content,
    role: 'assistant',
    timestamp: block.createdAt,
    streaming: false,
    toolCalls: []
  }))
})

function handleBack() {
  router.back()
}

async function generateImage(prompt) {
  console.log('generate image from note block:', prompt)
  return null
}
</script>

<template>
  <div class="note-detail-page min-h-screen bg-background flex flex-col">
    <!-- 顶部栏：返回 + 标题 + 作者信息 -->
    <div
      class="flex items-center px-4 py-3 border-b border-border/60 bg-surface/80 backdrop-blur z-10"
    >
      <var-button text round size="small" class="mr-1" @click="handleBack">
        <var-icon name="chevron-left" :size="18" />
      </var-button>
      <div class="flex-1 min-w-0">
        <h2 class="text-base font-semibold text-foreground truncate">
          {{ note?.title || '笔记详情' }}
        </h2>
        <div v-if="note" class="flex items-center gap-2 mt-0.5 text-[11px] text-secondary">
          <div class="flex items-center gap-1">
            <var-icon name="account-circle" :size="14" />
            <span>作者 ID: {{ note.authorId }}</span>
          </div>
          <span class="text-border">•</span>
          <span>
            创建于
            {{
              new Date(note.createdAt).toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })
            }}
          </span>
          <span class="text-border">•</span>
          <span>共 {{ note.blocks.length }} 个内容块</span>
        </div>
      </div>
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
      <!-- 笔记统计信息卡片 -->
      <div
        class="px-4 py-3 rounded-2xl bg-surface shadow-card-soft flex items-center justify-between text-xs text-text-secondary"
      >
        <div class="flex items-center gap-4">
          <span class="inline-flex items-center gap-1">
            <var-icon name="file-document" :size="16" />
            <span>{{ note.blocks.length }} 个内容块</span>
          </span>
          <span class="inline-flex items-center gap-1">
            <var-icon name="message-text-outline" :size="16" />
            <span>
              {{ note.blocks.reduce((sum, b) => sum + (b.comments ? b.comments.length : 0), 0) }}
              条评论
            </span>
          </span>
        </div>
        <var-button text round size="small" type="primary">
          <var-icon name="share-variant" :size="16" class="mr-0.5" />
          分享
        </var-button>
      </div>

      <!-- 内容块列表 -->
      <div
        v-for="msg in messageBlocks"
        :key="msg.id"
        class="rounded-2xl bg-surface shadow-card-soft overflow-hidden"
      >
        <!-- 块头部：作者 + 时间 + 点赞/转发 -->
        <div
          class="px-4 pt-3 pb-2 flex items-center justify-between text-[11px] text-text-tertiary"
        >
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1">
              <var-icon name="account" :size="14" />
              <span>作者 ID: {{ msg.authorId }}</span>
            </div>
            <span class="text-border">•</span>
            <span>
              {{
                new Date(msg.timestamp).toLocaleString('zh-CN', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              }}
            </span>
          </div>
        </div>

        <!-- Markdown 内容 -->
        <div class="px-4 pb-3 pt-1 text-text-primary text-[15px] whitespace-pre-wrap">
          <MarkdownRenderer
            :content="msg.content"
            :message-id="msg.id"
            :streaming="msg.streaming"
            :tool-calls="msg.toolCalls"
            :generate-image="generateImage"
          />
        </div>

        <!-- 评论列表（简单展示） -->
        <div v-if="note" class="px-4 pb-3 pt-2 border-t border-border/60">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] text-text-secondary">评论</span>
            <var-button text round size="small"
              ><var-icon name="message-processing-outline"
            /></var-button>
          </div>
          <div
            v-if="
              note.blocks.find((b) => b.id === msg.id)?.comments &&
              note.blocks.find((b) => b.id === msg.id)?.comments.length
            "
            class="space-y-1.5"
          >
            <div
              v-for="c in note.blocks.find((b) => b.id === msg.id)?.comments || []"
              :key="c.id"
              class="text-[11px] text-text-secondary flex items-start gap-1.5"
            >
              <var-icon name="account-circle" :size="14" class="mt-0.5" />
              <div class="flex-1">
                <div class="flex items-center gap-1">
                  <span class="font-medium text-[11px] text-text-primary">{{ c.authorId }}</span>
                  <span class="text-border">·</span>
                  <span>
                    {{
                      new Date(c.createdAt).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    }}
                  </span>
                </div>
                <p class="text-[11px] leading-relaxed">{{ c.content }}</p>
              </div>
            </div>
          </div>
          <p v-else class="text-[11px] text-text-tertiary">暂无评论</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.note-detail-page {
  background-color: var(--color-background);
  height: 100vh;
  overflow-y: auto;
  padding-bottom: 56px;
}
</style>
