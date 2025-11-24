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
	/** markdown 原始内容 */
	modelValue: {
		type: String,
		default: ''
	},
	/** 是否只读（详情页可复用） */
	readonly: {
		type: Boolean,
		default: false
	}
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
    content: props.modelValue || '',
    editable: !props.readonly,
	editorProps: {
		attributes: {
			class:
				'prose prose-sm max-w-none focus:outline-none text-[15px] leading-relaxed ' +
				'min-h-[120px] text-text-primary'
		}
	},
	onUpdate({ editor }) {
        const md = Markdown.getMarkdown(editor.state.doc)
        emit('update:modelValue', md)
    },
	onBlur() {
		emit('blur')
	}
})

// 监听外部值变化（例如重置）
watch(
	() => props.modelValue,
	(val) => {
		if (!editor.value) return
		const current = Markdown.getMarkdown(editor.value.state.doc)
        if (val !== current) {
          editor.value.commands.setContent(val || '', false)
        }
	}
)

onBeforeUnmount(() => {
	if (editor.value) editor.value.destroy()
})

function toggleBold() {
	editor.value?.chain().focus().toggleBold().run()
}

function toggleItalic() {
	editor.value?.chain().focus().toggleItalic().run()
}

function toggleHeading(level) {
	editor.value?.chain().focus().toggleHeading({ level }).run()
}

function toggleBulletList() {
	editor.value?.chain().focus().toggleBulletList().run()
}

function toggleOrderedList() {
	editor.value?.chain().focus().toggleOrderedList().run()
}

function undo() {
	editor.value?.chain().focus().undo().run()
}

function redo() {
	editor.value?.chain().focus().redo().run()
}
</script>

<template>
	<div class="note-editor rounded-2xl bg-surface shadow-card-soft overflow-hidden">
		<!-- 工具栏：移动端友好，图标按钮 + 少量文本 -->
		<div
			class="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-surface/80 backdrop-blur text-[12px]"
		>
			<div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
				<var-button
					text
					round
					size="small"
					:disabled="readonly"
					class="px-2"
					@click="toggleBold"
				>
					<span class="font-semibold">B</span>
				</var-button>
				<var-button
					text
					round
					size="small"
					:disabled="readonly"
					class="px-2 italic"
					@click="toggleItalic"
				>
					I
				</var-button>
				<var-button
					text
					round
					size="small"
					:disabled="readonly"
					class="px-2"
					@click="toggleHeading(1)"
				>
					H1
				</var-button>
				<var-button
					text
					round
					size="small"
					:disabled="readonly"
					class="px-2"
					@click="toggleHeading(2)"
				>
					H2
				</var-button>
				<var-button
					text
					round
					size="small"
					:disabled="readonly"
					class="px-2"
					@click="toggleHeading(3)"
				>
					H3
				</var-button>
				<var-button
					text
					round
					size="small"
					:disabled="readonly"
					class="px-2"
					@click="toggleBulletList"
				>
					<var-icon name="format-list-bulleted" :size="16" />
				</var-button>
				<var-button
					text
					round
					size="small"
					:disabled="readonly"
					class="px-2"
					@click="toggleOrderedList"
				>
					<var-icon name="format-list-numbered" :size="16" />
				</var-button>
			</div>
			<div class="flex items-center gap-1.5">
				<var-button text round size="small" :disabled="readonly" @click="undo">
					<var-icon name="undo" :size="16" />
				</var-button>
				<var-button text round size="small" :disabled="readonly" @click="redo">
					<var-icon name="redo" :size="16" />
				</var-button>
			</div>
		</div>

		<!-- 编辑区 -->
		<div class="px-3 py-2 max-h-[360px] overflow-y-auto">
			<EditorContent v-if="editor" :editor="editor" class="w-full" />
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
</style>
