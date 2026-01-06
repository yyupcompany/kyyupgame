<template>
  <div class="code-editor">
    <div class="editor-tabs">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </div>
    </div>

    <div class="editor-content">
      <textarea
        v-if="activeTab === 'html'"
        v-model="localHtmlCode"
        class="code-textarea"
        placeholder="输入 HTML 代码..."
        @input="emitUpdate"
      ></textarea>
      
      <textarea
        v-else-if="activeTab === 'css'"
        v-model="localCssCode"
        class="code-textarea"
        placeholder="输入 CSS 代码..."
        @input="emitUpdate"
      ></textarea>
      
      <textarea
        v-else-if="activeTab === 'js'"
        v-model="localJsCode"
        class="code-textarea"
        placeholder="输入 JavaScript 代码..."
        @input="emitUpdate"
      ></textarea>
    </div>

    <div class="editor-footer">
      <div class="stats">
        <span>行数: {{ getLineCount() }}</span>
        <span>字符: {{ getCurrentCode().length }}</span>
      </div>
      <div class="actions">
        <el-button size="small" @click="formatCode">
          <el-icon><DocumentCopy /></el-icon>
          格式化
        </el-button>
        <el-button size="small" @click="clearCode">
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DocumentCopy, Delete } from '@element-plus/icons-vue'

interface Props {
  htmlCode: string
  cssCode: string
  jsCode: string
}

interface Emits {
  (e: 'update:htmlCode', value: string): void
  (e: 'update:cssCode', value: string): void
  (e: 'update:jsCode', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  htmlCode: '',
  cssCode: '',
  jsCode: ''
})

const emit = defineEmits<Emits>()

const activeTab = ref<'html' | 'css' | 'js'>('html')
const localHtmlCode = ref(props.htmlCode)
const localCssCode = ref(props.cssCode)
const localJsCode = ref(props.jsCode)

const tabs = [
  { id: 'html', label: 'HTML', icon: '📄' },
  { id: 'css', label: 'CSS', icon: '🎨' },
  { id: 'js', label: 'JavaScript', icon: '⚙️' }
]

function getCurrentCode(): string {
  switch (activeTab.value) {
    case 'html':
      return localHtmlCode.value
    case 'css':
      return localCssCode.value
    case 'js':
      return localJsCode.value
    default:
      return ''
  }
}

function getLineCount(): number {
  return getCurrentCode().split('\n').length
}

function emitUpdate() {
  emit('update:htmlCode', localHtmlCode.value)
  emit('update:cssCode', localCssCode.value)
  emit('update:jsCode', localJsCode.value)
}

function formatCode() {
  try {
    if (activeTab.value === 'html') {
      localHtmlCode.value = formatHTML(localHtmlCode.value)
    } else if (activeTab.value === 'css') {
      localCssCode.value = formatCSS(localCssCode.value)
    } else if (activeTab.value === 'js') {
      localJsCode.value = formatJS(localJsCode.value)
    }
    emitUpdate()
    ElMessage.success('代码已格式化')
  } catch (error) {
    ElMessage.error('格式化失败')
  }
}

function formatHTML(html: string): string {
  let formatted = ''
  let indent = 0
  const lines = html.split('\n')
  
  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed) return
    
    if (trimmed.startsWith('</')) indent--
    formatted += '  '.repeat(Math.max(0, indent)) + trimmed + '\n'
    if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
      indent++
    }
  })
  
  return formatted
}

function formatCSS(css: string): string {
  return css
    .replace(/\s*{\s*/g, ' {\n  ')
    .replace(/\s*;\s*/g, ';\n  ')
    .replace(/\s*}\s*/g, '\n}\n')
    .replace(/\n\s*\n/g, '\n')
}

function formatJS(js: string): string {
  return js
    .replace(/\s*{\s*/g, ' {\n  ')
    .replace(/\s*;\s*/g, ';\n')
    .replace(/\s*}\s*/g, '\n}\n')
    .replace(/\n\s*\n/g, '\n')
}

function clearCode() {
  ElMessageBox.confirm(
    '确定要清空当前代码吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    if (activeTab.value === 'html') {
      localHtmlCode.value = ''
    } else if (activeTab.value === 'css') {
      localCssCode.value = ''
    } else if (activeTab.value === 'js') {
      localJsCode.value = ''
    }
    emitUpdate()
    ElMessage.success('代码已清空')
  }).catch(() => {
    // 取消操作
  })
}
</script>

<style scoped lang="scss">
.code-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: var(--spacing-sm);
  overflow: hidden;
  box-shadow: 0 2px var(--text-sm) var(--shadow-light);

  .editor-tabs {
    display: flex;
    gap: 0;
    border-bottom: 2px solid #eee;
    background: var(--bg-tertiary);
    overflow-x: auto;

    .tab {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--text-sm) var(--text-2xl);
      cursor: pointer;
      border-bottom: 3px solid transparent;
      transition: all 0.3s ease;
      white-space: nowrap;

      &:hover {
        background: var(--bg-gray-light);
      }

      &.active {
        border-bottom-color: var(--primary-color);
        background: white;
        color: var(--primary-color);
      }

      .tab-icon {
        font-size: 1.2em;
      }

      .tab-label {
        font-weight: 500;
      }
    }
  }

  .editor-content {
    flex: 1;
    overflow: hidden;
    background: #1e1e1e;

    .code-textarea {
      width: 100%;
      height: 100%;
      padding: var(--spacing-4xl);
      border: none;
      background: #1e1e1e;
      color: #d4d4d4;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: var(--text-sm);
      line-height: 1.6;
      resize: none;
      outline: none;
      tab-size: 2;

      &::selection {
        background: #264f78;
      }
    }
  }

  .editor-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-2xl) 15px;
    border-top: var(--border-width-base) solid #eee;
    background: var(--bg-tertiary);
    font-size: var(--text-sm);
    color: var(--text-secondary);

    .stats {
      display: flex;
      gap: var(--text-2xl);
    }

    .actions {
      display: flex;
      gap: var(--spacing-2xl);
    }
  }
}
</style>

