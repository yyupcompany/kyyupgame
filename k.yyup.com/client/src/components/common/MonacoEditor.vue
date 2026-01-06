<template>
  <div 
    ref="editorContainer"
    :style="{ height: height, width: '100%' }"
    class="monaco-editor-container"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

interface Props {
  modelValue: string
  language?: string
  height?: string
  options?: any
  readonly?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'ready', editor: any): void
}

const props = withDefaults(defineProps<Props>(), {
  language: 'javascript',
  height: '300px',
  options: () => ({}),
  readonly: false
})

const emit = defineEmits<Emits>()

const editorContainer = ref<HTMLElement>()
let editor: any = null

// 由于Monaco Editor的npm包较大且复杂，这里提供一个简化的文本编辑器作为替代
// 在生产环境中，可以通过CDN或正确安装Monaco Editor包来实现完整功能

const defaultOptions = {
  automaticLayout: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 14,
  lineNumbers: 'on',
  roundedSelection: false,
  theme: 'vs-light',
  wordWrap: 'on'
}

onMounted(async () => {
  await nextTick()
  initEditor()
})

onUnmounted(() => {
  if (editor) {
    editor.dispose()
    editor = null
  }
})

const initEditor = () => {
  if (!editorContainer.value) return

  // 简化版编辑器实现 - 使用textarea作为fallback
  const textarea = document.createElement('textarea')
  textarea.value = props.modelValue
  textarea.style.width = '100%'
  textarea.style.height = '100%'
  textarea.style.border = 'none'
  textarea.style.outline = 'none'
  textarea.style.resize = 'none'
  textarea.style.fontFamily = 'Monaco, Consolas, "Courier New", monospace'
  textarea.style.fontSize = 'var(--text-base)'
  textarea.style.lineHeight = '1.5'
  textarea.style.padding = '10px'
  textarea.style.backgroundColor = 'var(--bg-color)'
  
  if (props.readonly || props.options?.readOnly) {
    textarea.readOnly = true
    textarea.style.backgroundColor = 'var(--bg-input)'
  }

  // 添加语法高亮样式（基础）
  if (props.language === 'sql') {
    textarea.style.color = '#0066cc'
  } else if (props.language === 'json') {
    textarea.style.color = '#d14'
  }

  // 事件监听
  textarea.addEventListener('input', (e) => {
    const target = e.target as HTMLTextAreaElement
    emit('update:modelValue', target.value)
    emit('change', target.value)
  })

  // 添加行号显示（简化版）
  const lineNumbers = document.createElement('div')
  lineNumbers.style.position = 'absolute'
  lineNumbers.style.left = '0'
  lineNumbers.style.top = '0'
  lineNumbers.style.width = '40px'
  lineNumbers.style.height = '100%'
  lineNumbers.style.backgroundColor = 'var(--bg-input)'
  lineNumbers.style.borderRight = 'var(--border-width-base) solid #e1e4e8'
  lineNumbers.style.fontSize = 'var(--text-sm)'
  lineNumbers.style.lineHeight = '1.5'
  lineNumbers.style.color = 'var(--text-secondary)'
  lineNumbers.style.padding = '10px 0'
  lineNumbers.style.textAlign = 'right'
  lineNumbers.style.paddingRight = 'var(--spacing-sm)'
  lineNumbers.style.fontFamily = 'Monaco, Consolas, "Courier New", monospace'

  // 容器设置
  editorContainer.value.style.position = 'relative'
  editorContainer.value.style.border = 'var(--border-width-base) solid var(--border-color)'
  editorContainer.value.style.borderRadius = 'var(--spacing-xs)'
  editorContainer.value.style.overflow = 'hidden'

  // 调整textarea位置
  textarea.style.position = 'absolute'
  textarea.style.left = '40px'
  textarea.style.top = '0'
  textarea.style.width = 'calc(100% - 40px)'
  textarea.style.paddingLeft = '10px'

  // 更新行号
  const updateLineNumbers = () => {
    const lines = textarea.value.split('\n').length
    const lineNumbersText = Array.from({ length: lines }, (_, i) => i + 1).join('\n')
    lineNumbers.textContent = lineNumbersText
  }

  textarea.addEventListener('input', updateLineNumbers)
  textarea.addEventListener('scroll', () => {
    lineNumbers.scrollTop = textarea.scrollTop
  })

  editorContainer.value.appendChild(lineNumbers)
  editorContainer.value.appendChild(textarea)

  // 初始化行号
  updateLineNumbers()

  // 创建简化的editor对象
  editor = {
    getValue: () => textarea.value,
    setValue: (value: string) => {
      textarea.value = value
      updateLineNumbers()
    },
    dispose: () => {
      if (editorContainer.value) {
        editorContainer.value.innerHTML = ''
      }
    },
    focus: () => textarea.focus(),
    getModel: () => ({ getValue: () => textarea.value }),
    updateOptions: (options: any) => {
      if (options.readOnly !== undefined) {
        textarea.readOnly = options.readOnly
        textarea.style.backgroundColor = options.readOnly ? 'var(--bg-input)' : 'var(--bg-color)'
      }
    }
  }

  emit('ready', editor)
}

// 监听props变化
watch(() => props.modelValue, (newValue) => {
  if (editor && editor.getValue() !== newValue) {
    editor.setValue(newValue)
  }
})

watch(() => props.options, (newOptions) => {
  if (editor && newOptions) {
    editor.updateOptions(newOptions)
  }
}, { deep: true })
</script>

<style scoped>
.monaco-editor-container {
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
}

/* 自定义滚动条样式 */
.monaco-editor-container :deep(textarea) {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 transparent;
}

.monaco-editor-container :deep(textarea::-webkit-scrollbar) {
  width: var(--spacing-sm);
  height: var(--spacing-sm);
}

.monaco-editor-container :deep(textarea::-webkit-scrollbar-track) {
  background: transparent;
}

.monaco-editor-container :deep(textarea::-webkit-scrollbar-thumb) {
  background-color: #c1c1c1;
  border-radius: var(--spacing-xs);
}

.monaco-editor-container :deep(textarea::-webkit-scrollbar-thumb:hover) {
  background-color: #a1a1a1;
}
</style>