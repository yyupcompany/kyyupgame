<template>
  <div class="markdown-message">
    <div v-html="displayedContent"></div>
    <span v-if="isTyping && role === 'assistant'" class="typing-cursor"></span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

const props = withDefaults(defineProps<{
  content: string
  role: 'user' | 'assistant'
  enableTyping?: boolean // 是否启用打字机效果
  typingSpeed?: number // 打字速度（毫秒/字符）
}>(), {
  enableTyping: true,
  typingSpeed: 30
})

// 配置marked
marked.setOptions({
  breaks: true,
  gfm: true
})

// 配置代码高亮渲染器
const renderer = new marked.Renderer()
renderer.code = function({ text, lang }: { text: string; lang?: string; escaped?: boolean }): string {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return `<pre><code class="hljs language-${lang}">${hljs.highlight(text, { language: lang }).value}</code></pre>`
    } catch (err) {
      console.error('Highlight error:', err)
    }
  }
  return `<pre><code class="hljs">${hljs.highlightAuto(text).value}</code></pre>`
}
marked.use({ renderer })

// 打字机效果状态
const displayedContent = ref('')
const isTyping = ref(false)
let typingTimer: number | null = null

// 渲染Markdown为HTML的辅助函数
const renderMarkdown = (markdown: string): string => {
  // 🔧 处理undefined或null值
  if (!markdown || markdown === 'undefined' || markdown === 'null') {
    console.warn('⚠️ [MarkdownMessage] content为空或undefined，使用空字符串')
    return ''
  }

  try {
    const result = marked.parse(markdown)
    // marked.parse 可能返回 Promise，但在同步模式下返回 string
    return typeof result === 'string' ? result : ''
  } catch (error) {
    console.error('Markdown parse error:', error)
    return markdown
  }
}

// 打字机效果函数 - 在Markdown层面实现
const typeWriter = async () => {
  // 🔧 处理undefined content
  const safeContent = props.content || ''

  // 用户消息或禁用打字机效果时直接显示
  if (props.role === 'user' || !props.enableTyping) {
    displayedContent.value = renderMarkdown(safeContent)
    isTyping.value = false
    return
  }

  // AI消息使用打字机效果 - 在Markdown原文层面
  isTyping.value = true
  displayedContent.value = ''

  const fullMarkdown = safeContent  // ✅ 使用安全的Markdown原文
  let currentIndex = 0

  const type = () => {
    if (currentIndex < fullMarkdown.length) {
      // ✅ 获取当前的Markdown片段
      const currentMarkdown = fullMarkdown.substring(0, currentIndex + 1)

      // ✅ 实时将Markdown转换为HTML
      displayedContent.value = renderMarkdown(currentMarkdown)

      currentIndex++

      // 根据字符类型调整速度（基于Markdown原文）
      const char = fullMarkdown[currentIndex - 1]
      let delay = props.typingSpeed

      // 标点符号后稍微停顿
      if (['.', '!', '?', '。', '！', '？'].includes(char)) {
        delay = props.typingSpeed * 3
      } else if ([',', ';', '，', '；'].includes(char)) {
        delay = props.typingSpeed * 2
      } else if (char === '\n') {
        delay = props.typingSpeed * 1.5
      }

      typingTimer = window.setTimeout(type, delay)
    } else {
      isTyping.value = false
    }
  }

  type()
}

// 清理定时器
const clearTyping = () => {
  if (typingTimer) {
    clearTimeout(typingTimer)
    typingTimer = null
  }
}

// 监听内容变化
watch(() => props.content, () => {
  clearTyping()
  nextTick(() => {
    typeWriter()
  })
}, { immediate: false })

// 组件挂载时开始打字
onMounted(() => {
  typeWriter()
})

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
  clearTyping()
})
</script>

<style scoped lang="scss">
// design-tokens 已通过 vite.config 全局注入
.markdown-message {
  font-size: inherit; /* 继承父组件的字体大小，允许动态调整 */
  line-height: 1.6;
  color: var(--color-gray-700);
  word-wrap: break-word;
  position: relative;
  display: inline-block;
  width: 100%;

  // 打字机光标
  .typing-cursor {
    display: inline-block;
    width: auto;
    height: var(--text-xl);
    background: var(--primary-color);
    margin-left: var(--spacing-sm);
    vertical-align: text-bottom;
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }

  // 侧边栏模式：所有文字统一字号，标题只保留加粗效果
  :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
    margin-top: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
    font-weight: 600;
    font-size: inherit; // 侧边栏模式：统一字号
    line-height: 1.4;
  }

  // 侧边栏模式：移除标题的特殊大小，保持统一
  :deep(h1) {
    font-size: inherit;
    border-bottom: none;
    padding-bottom: 0;
  }

  :deep(h2) {
    font-size: inherit;
    border-bottom: none;
    padding-bottom: 0;
  }

  :deep(h3) {
    font-size: inherit;
  }

  :deep(h4) {
    font-size: inherit;
  }

  :deep(p) {
    margin: var(--spacing-sm) 0;
  }

  :deep(ul), :deep(ol) {
    margin: var(--spacing-sm) 0;
    padding-left: var(--text-3xl);
  }

  :deep(li) {
    margin: var(--spacing-xs) 0;
  }

  :deep(code) {
    background: var(--bg-card);
    padding: var(--spacing-sm) 6px;
    border-radius: var(--spacing-xs);
    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
    font-size: inherit; // 侧边栏模式：统一字号
    color: var(--danger-color);
  }

  :deep(pre) {
    background: var(--text-primary);
    padding: var(--spacing-sm);
    border-radius: var(--spacing-sm);
    overflow-x: auto;
    margin: var(--spacing-sm) 0;

    code {
      background: transparent;
      padding: 0;
      color: var(--bg-primary);
      font-size: inherit; // 侧边栏模式：统一字号
      line-height: 1.5;
    }
  }

  :deep(blockquote) {
    border-left: var(--spacing-xs) solid var(--primary-color);
    padding-left: var(--text-lg);
    margin: var(--text-sm) 0;
    color: var(--text-secondary);
    font-style: italic;
  }

  :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: var(--text-sm) 0;
  }

  :deep(th), :deep(td) {
    border: var(--border-width) solid var(--border-color);
    padding: var(--spacing-sm) var(--text-sm);
    text-align: left;
  }

  :deep(th) {
    background: var(--bg-primary);
    font-weight: 600;
  }

  :deep(a) {
    color: var(--primary-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  :deep(img) {
    max-width: 100%;
    border-radius: var(--spacing-sm);
    margin: var(--text-sm) 0;
  }

  :deep(hr) {
    border: none;
    border-top: var(--z-index-dropdown) solid var(--border-color);
    margin: var(--text-lg) 0;
  }

  :deep(strong) {
    font-weight: 600;
    color: var(--color-gray-900);
  }

  :deep(em) {
    font-style: italic;
  }
}

// 暗色主题
.theme-dark .markdown-message {
  color: var(--border-color);

  :deep(h1), :deep(h2) {
    border-bottom-color: var(--color-gray-700);
  }

  :deep(code) {
    background: var(--color-gray-700);
    color: var(--status-error);
  }

  :deep(pre) {
    background: var(--color-gray-900);

    code {
      color: var(--bg-primary);
    }
  }

  :deep(blockquote) {
    color: var(--text-tertiary);
  }

  :deep(th), :deep(td) {
    border-color: var(--color-gray-700);
  }

  :deep(th) {
    background: var(--text-primary);
  }

  :deep(hr) {
    border-top-color: var(--color-gray-700);
  }

  :deep(strong) {
    color: var(--bg-primary);
  }
}
</style>

