<script setup>
import { computed, h, inject } from 'vue'
import { XMarkdown } from 'vue-element-plus-x'
import { useToast } from '@/composables/useToast'
import 'katex/dist/katex.min.css' // 数学公式样式
// 导入自定义代码块映射的组件
import Htmath from './Visualization/Htmath.vue' // iframe
const Echarts = () => './Visualization/Echarts.vue' // echarts

const theme = inject('theme')
const toast = useToast()

const props = defineProps({
  content: { type: String, required: true },
  generateImage: { type: Function, required: true },
  messageId: { type: String, required: true },
  streaming: { type: Boolean, default: false },
  toolCalls: { type: Array, default: () => [] },
  scale: { type: Number, default: 1 } // 文字缩放比例
})
const emits = defineEmits(['updateHeight'])

const processedContent = computed(() => {
  return props.content.replace(/<htmath>/g, '```htmath\n').replace(/<\/htmath>/g, '\n```')
})

// 自定义内置渲染
const selfCodeXSlot = {
  // 自定义渲染代码块的右侧控制按钮
  codeHeaderControl: (props) => {
    return h(
      'button',
      {
        class: 'code-top-tool',
        onClick: async () => {
          try {
            await navigator.clipboard.writeText(props.raw.content)
            toast.success('复制成功')
          } catch {
            toast.error('复制失败')
          }
        }
      },
      // 嵌入SVG
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 1024 1024',
          width: '14',
          height: '14',
          style: { fill: 'currentColor' }
        },
        [
          h('path', {
            fill: 'currentColor',
            d: 'M768 832a128 128 0 0 1-128 128H192A128 128 0 0 1 64 832V384a128 128 0 0 1 128-128v64a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64z'
          }),
          h('path', {
            fill: 'currentColor',
            d: 'M384 128a64 64 0 0 0-64 64v448a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64V192a64 64 0 0 0-64-64zm0-64h448a128 128 0 0 1 128 128v448a128 128 0 0 1-128 128H384a128 128 0 0 1-128-128V192A128 128 0 0 1 384 64'
          })
        ]
      )
    )
  }
}

// 渲染自定义代码块
const selfCodeXRender = {
  // 劫持块标识: (props) => h(映射组件, { 给组件传递props，代码块中的内容位于 props.raw.content })
  // 可以在映射组件前先对闭合性（流式传输）校验再映射（推荐），也可以先映射，在组件中校验
  // 例如 echarts 为代码块语言, Echarts 是自己封装的映射组件
  echarts: (props) => {
    try {
      const option = JSON.parse(props.raw.content)
      if (!option) return null
      const echartsComponent = Echarts()
      return h(echartsComponent.default, { option })
    } catch (error) {
      return null
    }
  },

  htmath: (props) => {
    const html = props.raw.content
    if (!html || !/<\/html\s*>/i.test(html)) return null
    return h(Htmath, {
      html,
      onUpdateHeight: () => {
        emits('updateHeight')
      }
    })
  }
}
</script>

<template>
  <div class="markdown-container">
    <XMarkdown
      :markdown="processedContent"
      :code-x-render="selfCodeXRender"
      :code-x-slot="selfCodeXSlot"
      :allow-html="true"
      :default-theme-mode="theme"
      class="markdown-prase"
    >
      <template #img="{ ...imgProps }">
        <img
          :key="imgProps.key"
          :src="imgProps.src"
          :alt="imgProps.alt"
          onerror="this.classList.add('error');"
        />
      </template>
    </XMarkdown>
    <!-- MCP 工具调用状态条 -->
    <div v-if="props.toolCalls && props.toolCalls.length" class="tool-call-banner">
      <span class="tool-call-title">正在调用工具：</span>
      <span v-for="name in props.toolCalls" :key="name" class="tool-call-chip">
        <span class="tool-call-spinner" aria-hidden="true"></span>
        <span class="tool-call-name">{{ name }}</span>
      </span>
    </div>
  </div>
</template>

<style>
.markdown-container {
  width: 100%;
  padding: 10px;
  overflow-y: auto;
  --scale-factor: v-bind('props.scale'); /* 默认缩放比例100% */
}

.markdown-prase {
  --main-color: #81abe2;

  /* 基础文字大小使用缩放变量 */
  font-size: calc(16px * var(--scale-factor));
  line-height: calc(1.5 * var(--scale-factor));
  word-wrap: break-word;
  text-align: left;
  color: var(--fg);

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: calc(24px * var(--scale-factor)) 0;
    font-weight: 600;
    font-size: calc(revert * var(--scale-factor));
    line-height: calc(1.25 * var(--scale-factor));
    color: var(--main-color);
  }

  p {
    margin: calc(16px * var(--scale-factor)) 0;
  }

  ul,
  ol {
    margin: calc(16px * var(--scale-factor)) 0;
    padding-left: calc(1em * var(--scale-factor));
  }

  li {
    margin: calc(0.5em * var(--scale-factor)) 0;
  }

  img {
    display: block;
    max-width: 100%;
    height: auto;
    margin: calc(1.5em * var(--scale-factor)) 0;
    border-radius: calc(10px * var(--scale-factor));
    box-shadow: 0 calc(4px * var(--scale-factor)) calc(15px * var(--scale-factor))
      rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }

  blockquote {
    margin: calc(16px * var(--scale-factor)) 0;
    padding: calc(0.5em * var(--scale-factor)) calc(1.2em * var(--scale-factor));
    border-left: calc(0.25em * var(--scale-factor)) solid var(--main-color);
    background-color: rgba(230, 244, 255, 0.2);
    border-radius: 0 calc(6px * var(--scale-factor)) calc(6px * var(--scale-factor)) 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: calc(20px * var(--scale-factor)) 0;
    border-radius: calc(8px * var(--scale-factor));
    overflow: hidden;
    box-shadow: 0 calc(4px * var(--scale-factor)) calc(12px * var(--scale-factor))
      rgba(0, 0, 0, 0.05);

    th,
    td {
      padding: calc(12px * var(--scale-factor)) calc(15px * var(--scale-factor));
      border: 1px solid #dfe2e5;
    }
  }

  .code-top-tool {
    width: calc(24px * var(--scale-factor));
    height: calc(24px * var(--scale-factor));
    margin-right: calc(4px * var(--scale-factor));
    border-radius: calc(4px * var(--scale-factor));
  }

  .code-top-tool svg {
    width: calc(14px * var(--scale-factor));
    height: calc(14px * var(--scale-factor));
  }
}

/* 工具调用状态条缩放 */
.tool-call-banner {
  gap: calc(8px * var(--scale-factor)) calc(10px * var(--scale-factor));
  padding: calc(10px * var(--scale-factor)) calc(12px * var(--scale-factor));
  margin: 0 0 calc(10px * var(--scale-factor)) 0;
  border-radius: calc(10px * var(--scale-factor));
  font-size: calc(14px * var(--scale-factor));
}

.tool-call-chip {
  gap: calc(6px * var(--scale-factor));
  padding: calc(6px * var(--scale-factor)) calc(10px * var(--scale-factor));
  border-radius: calc(999px * var(--scale-factor));
}

.tool-call-spinner {
  width: calc(14px * var(--scale-factor));
  height: calc(14px * var(--scale-factor));
  border-width: calc(2px * var(--scale-factor));
}

.processing-indicator {
  padding: calc(10px * var(--scale-factor)) calc(15px * var(--scale-factor));
  border-radius: calc(20px * var(--scale-factor));
  font-size: calc(14px * var(--scale-factor));
  margin: calc(15px * var(--scale-factor)) 0;
  box-shadow: 0 calc(2px * var(--scale-factor)) calc(8px * var(--scale-factor)) rgba(0, 0, 0, 0.05);
}
</style>
