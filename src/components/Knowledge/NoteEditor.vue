<script setup>
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from '@tiptap/markdown'

const props = defineProps({
  /** 当前块的唯一 ID，用于 key / 调试 */
  blockId: {
    type: [String, Number],
    required: true
  },
  /** 是否只读（详情页可复用） */
  readonly: {
    type: Boolean,
    default: false
  }
})

/** markdown 内容 */
const markdownContent = defineModel({
  type: String,
  default: ''
})

const emit = defineEmits(['update:modelValue', 'blur'])

// 初始化 Tiptap 编辑器
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3]
      },
      history: false
    }),
    Markdown.configure({
      html: false, // 只关心 markdown，不需要 HTML
      breaks: true
    })
  ],
  content: markdownContent.value,
  editable: !props.readonly,
  editorProps: {
    attributes: {
      class:
        'prose prose-sm max-w-none focus:outline-none text-[15px] leading-relaxed ' +
        'min-h-[120px] text-text-primary'
    }
  },
  onUpdate({ editor }) {
    const md = editor.getMarkdown()
    markdownContent.value = md
  }
})

onBeforeUnmount(() => {
  if (editor.value) editor.value.destroy()
})

// 工具栏操作映射
const toolbarActions = {
  bold: () => editor.value?.chain().focus().toggleBold().run(),
  italic: () => editor.value?.chain().focus().toggleItalic().run(),
  heading1: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run(),
  heading2: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run(),
  heading3: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run(),
  bulletList: () => editor.value?.chain().focus().toggleBulletList().run(),
  orderedList: () => editor.value?.chain().focus().toggleOrderedList().run(),
  undo: () => editor.value?.chain().focus().undo().run(),
  redo: () => editor.value?.chain().focus().redo().run()
}
</script>

<template>
  <div class="note-editor rounded-2xl bg-surface shadow-card-soft overflow-hidden">
    <!-- 工具栏：移动端友好，图标按钮 + 少量文本 -->
    <div
      class="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-surface/80 backdrop-blur text-[12px]"
    >
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar toolbar">
        <var-button
          text
          round
          size="small"
          :disabled="readonly"
          :class="['px-2', 'bold', { 'is-active': editor?.isActive('bold') }]"
          @click="toolbarActions.bold"
        >
          <span class="font-semibold">B</span>
        </var-button>
        <var-button
          text
          round
          size="small"
          :disabled="readonly"
          :class="['px-2', 'italic', { 'is-active': editor?.isActive('italic') }]"
          @click="toolbarActions.italic"
        >
          I
        </var-button>
        <var-button
          text
          round
          size="small"
          :disabled="readonly"
          :class="['px-2', { 'is-active': editor?.isActive('heading', { level: 1 }) }]"
          @click="toolbarActions.heading1"
        >
          H1
        </var-button>
        <var-button
          text
          round
          size="small"
          :disabled="readonly"
          :class="['px-2', { 'is-active': editor?.isActive('heading', { level: 2 }) }]"
          @click="toolbarActions.heading2"
        >
          H2
        </var-button>
        <var-button
          text
          round
          size="small"
          :disabled="readonly"
          :class="['px-2', { 'is-active': editor?.isActive('heading', { level: 3 }) }]"
          @click="toolbarActions.heading3"
        >
          H3
        </var-button>
        <var-button
          text
          round
          size="small"
          :disabled="readonly"
          :class="['px-2', { 'is-active': editor?.isActive('bulletList') }]"
          @click="toolbarActions.bulletList"
        >
          <var-icon name="dots-vertical" :size="16" />
        </var-button>
        <var-button
          text
          round
          size="small"
          :disabled="readonly"
          :class="['px-2', { 'is-active': editor?.isActive('orderedList') }]"
          @click="toolbarActions.orderedList"
        >
          <var-icon name="format-list-checkbox" :size="16" />
        </var-button>
      </div>
      <div class="flex items-center gap-1.5">
        <var-button text round size="small" :disabled="readonly" @click="toolbarActions.undo">
          <var-icon name="refresh" :size="16" style="transform: scaleX(-1)" />
        </var-button>
        <var-button text round size="small" :disabled="readonly" @click="toolbarActions.redo">
          <var-icon name="refresh" :size="16" />
        </var-button>
      </div>
    </div>

    <!-- 编辑区 -->
    <div class="px-3 py-2 max-h-[360px] overflow-y-auto">
      <editor-content v-if="editor" :editor="editor" class="w-full" />
      <div v-else class="text-center text-xs text-text-tertiary py-6">加载编辑器中...</div>
    </div>
  </div>
</template>

<style scoped>
.note-editor {
  -webkit-tap-highlight-color: transparent;
}

.no-scrollbar {
  scrollbar-width: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.toolbar .var-button {
  width: 32px;
  height: 32px;
  transition: background-color 0.2s ease;
}

.toolbar .var-button.is-active {
  background-color: var(--color-primary);
  color: white;
}

.toolbar .var-button.is-active:hover {
  background-color: var(--color-primary);
  opacity: 0.9;
}
</style>

<style>
.tiptap {
  :first-child {
    margin-top: 0;
  }

  /* List styles */
  ul,
  ol {
    padding: 0 1rem;
    margin: 0.5rem 1rem 0.5rem 0.4rem;
    list-style-position: outside;
  }

  ul {
    list-style-type: disc;
  }

  ol {
    list-style-type: decimal;
  }

  ul li,
  ol li {
    display: list-item;
    padding-left: 0.2rem;
  }

  ul li p,
  ol li p {
    margin-top: 0.25em;
    margin-bottom: 0.25em;
  }

  /* Heading styles */
  h1,
  h2,
  h3 {
    line-height: 1.1;
    overflow-wrap: break-word;
  }

  h1 {
    margin: 0.8rem 0;
    font-size: 1.4rem;
  }

  h2 {
    margin: 0.5rem 0;
    font-size: 1.2rem;
  }

  h3 {
    margin: 0.3rem 0;
    font-size: 1.1rem;
  }

  h4,
  h5,
  h6 {
    font-size: 1rem;
  }
}
</style>
