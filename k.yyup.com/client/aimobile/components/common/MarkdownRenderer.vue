<!--
  📝 Markdown渲染组件
  
  支持在聊天气泡中渲染Markdown格式的内容
  包含代码高亮、表格、列表等功能
-->

<template>
  <div 
    class="markdown-renderer" 
    :class="{ 'dark-theme': isDark, 'mobile-optimized': isMobile }"
    v-html="renderedContent"
  ></div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'

// 导入代码高亮样式
import 'highlight.js/styles/github.css'

interface Props {
  content: string
  isDark?: boolean
  isMobile?: boolean
  enableCodeHighlight?: boolean
  enableTables?: boolean
  enableBreaks?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDark: false,
  isMobile: true,
  enableCodeHighlight: true,
  enableTables: true,
  enableBreaks: true
})

// 配置marked选项
const configureMarked = () => {
  marked.setOptions({
    // 启用GitHub风格的Markdown
    gfm: true,
    // 启用表格
    tables: props.enableTables,
    // 启用换行符
    breaks: props.enableBreaks,
    // 启用代码高亮
    highlight: props.enableCodeHighlight ? (code: string, lang: string) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value
        } catch (err) {
          console.warn('代码高亮失败:', err)
        }
      }
      return hljs.highlightAuto(code).value
    } : undefined
  })
}

// 创建自定义渲染器
const createCustomRenderer = () => {
  const renderer = new marked.Renderer()
  
  // 自定义标题渲染
  renderer.heading = (text: string, level: number) => {
    const sizes = ['20px', '1var(--spacing-sm)', 'var(--spacing-md)', '15px', '1var(--spacing-xs)', '13px']
    const size = sizes[level - 1] || '1var(--spacing-xs)'
    const safeText = String(text || '')

    return `<h${level} style="
      font-size: ${props.isMobile ? size : (parseInt(size) + 2) + 'px'};
      font-weight: 600;
      margin: ${props.isMobile ? '10px 0 6px 0' : 'var(--spacing-md) 0 12px 0'};
      color: ${props.isDark ? 'var(--bg-color)' : '#1f2937'};
      line-height: 1.3;
    ">${safeText}</h${level}>`
  }
  
  // 自定义段落渲染
  renderer.paragraph = (text: string) => {
    const safeText = String(text || '')
    return `<p style="
      margin: ${props.isMobile ? '6px 0' : '12px 0'};
      line-height: 1.6;
      color: ${props.isDark ? '#e5e7eb' : '#374151'};
      font-size: ${props.isMobile ? '1var(--spacing-xs)' : 'var(--spacing-md)'};
    ">${safeText}</p>`
  }
  
  // 自定义列表渲染
  renderer.list = (body: string, ordered: boolean) => {
    const tag = ordered ? 'ol' : 'ul'
    return `<${tag} style="
      margin: ${props.isMobile ? '6px 0' : '12px 0'};
      padding-left: ${props.isMobile ? '1var(--spacing-sm)' : '2var(--spacing-xs)'};
      color: ${props.isDark ? '#e5e7eb' : '#374151'};
    ">${body}</${tag}>`
  }
  
  renderer.listitem = (text: string) => {
    const safeText = String(text || '')
    return `<li style="
      margin: ${props.isMobile ? '3px 0' : '6px 0'};
      line-height: 1.5;
      font-size: ${props.isMobile ? '1var(--spacing-xs)' : 'var(--spacing-md)'};
    ">${safeText}</li>`
  }
  
  // 自定义代码块渲染
  renderer.code = (code: string, language?: string) => {
    const highlightedCode = props.enableCodeHighlight && language 
      ? hljs.highlight(code, { language }).value 
      : hljs.highlightAuto(code).value
    
    return `<div class="code-block-container">
      <div class="code-block-header">
        <span class="code-language">${language || 'text'}</span>
        <button class="copy-code-btn" onclick="copyCode(this)" data-code="${encodeURIComponent(code)}">
          📋 复制
        </button>
      </div>
      <pre class="code-block"><code class="hljs ${language || ''}">${highlightedCode}</code></pre>
    </div>`
  }
  
  // 自定义行内代码渲染
  renderer.codespan = (code: string) => {
    return `<code style="
      background: ${props.isDark ? '#374151' : 'var(--bg-secondary-light)'};
      color: ${props.isDark ? 'var(--warning-color)' : 'var(--danger-color)'};
      padding: 2px 6px;
      border-radius: var(--spacing-xs);
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: ${props.isMobile ? '13px' : '1var(--spacing-xs)'};
    ">${code}</code>`
  }
  
  // 自定义表格渲染
  renderer.table = (header: string, body: string) => {
    return `<div class="table-container">
      <table class="markdown-table">
        <thead>${header}</thead>
        <tbody>${body}</tbody>
      </table>
    </div>`
  }
  
  // 自定义链接渲染
  renderer.link = (href: string, title: string | null, text: string) => {
    return `<a href="${href}" 
      ${title ? `title="${title}"` : ''} 
      target="_blank" 
      rel="noopener noreferrer"
      style="
        color: ${props.isDark ? 'var(--accent-enrollment)' : 'var(--accent-enrollment-hover)'};
        text-decoration: underline;
        text-decoration-color: ${props.isDark ? 'var(--accent-enrollment)' : 'var(--accent-enrollment-hover)'};
      "
    >${text}</a>`
  }
  
  // 自定义强调渲染
  renderer.strong = (text: string) => {
    const safeText = String(text || '')
    return `<strong style="
      font-weight: 600;
      color: ${props.isDark ? 'var(--bg-color)' : 'var(--text-primary-dark)'};
    ">${safeText}</strong>`
  }

  // 自定义斜体渲染
  renderer.em = (text: string) => {
    const safeText = String(text || '')
    return `<em style="
      font-style: italic;
      color: ${props.isDark ? '#d1d5db' : '#4b5563'};
    ">${safeText}</em>`
  }
  
  // 自定义引用渲染
  renderer.blockquote = (quote: string) => {
    return `<blockquote style="
      border-left: var(--spacing-xs) solid ${props.isDark ? 'var(--accent-enrollment)' : 'var(--accent-enrollment-hover)'};
      margin: ${props.isMobile ? '10px 0' : 'var(--spacing-md) 0'};
      padding: ${props.isMobile ? '6px 10px' : '12px var(--spacing-md)'};
      background: ${props.isDark ? '#1f2937' : 'var(--bg-primary-light)'};
      border-radius: 0 var(--spacing-sm) var(--spacing-sm) 0;
      font-style: italic;
      color: ${props.isDark ? '#d1d5db' : '#4b5563'};
    ">${quote}</blockquote>`
  }
  
  return renderer
}

// 渲染Markdown内容
const renderedContent = computed(() => {
  if (!props.content) return ''

  console.log('🔍 MarkdownRenderer接收到的内容:', props.content, typeof props.content)

  try {
    configureMarked()
    const result = marked(props.content)
    console.log('🔍 Markdown渲染结果:', result.substring(0, 200))
    return result
  } catch (error) {
    console.error('Markdown渲染失败:', error)
    return `<p style="color: #ef4444;">Markdown渲染失败: ${error.message}</p>`
  }
})

// 复制代码功能
const setupCopyCode = () => {
  // 添加全局复制函数
  ;(window as any).copyCode = (button: HTMLButtonElement) => {
    const code = decodeURIComponent(button.dataset.code || '')
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        button.textContent = '✅ 已复制'
        setTimeout(() => {
          button.textContent = '📋 复制'
        }, 2000)
      }).catch(() => {
        fallbackCopyCode(code, button)
      })
    } else {
      fallbackCopyCode(code, button)
    }
  }
}

// 降级复制方案
const fallbackCopyCode = (code: string, button: HTMLButtonElement) => {
  const textArea = document.createElement('textarea')
  textArea.value = code
  textArea.style.position = 'fixed'
  textArea.style.left = '-999999px'
  textArea.style.top = '-999999px'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  
  try {
    document.execCommand('copy')
    button.textContent = '✅ 已复制'
    setTimeout(() => {
      button.textContent = '📋 复制'
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
    button.textContent = '❌ 复制失败'
    setTimeout(() => {
      button.textContent = '📋 复制'
    }, 2000)
  }
  
  document.body.removeChild(textArea)
}

onMounted(() => {
  setupCopyCode()
})
</script>

<style scoped>
.markdown-renderer {
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.6;
}

/* 代码块样式 */
.markdown-renderer :deep(.code-block-container) {
  margin: var(--spacing-sm) 0;
  border-radius: 6px;
  overflow: hidden;
  background: #f8fafc;
  border: var(--border-width-base) solid var(--border-light-dark);
  font-size: 12px;
}

.markdown-renderer.dark-theme :deep(.code-block-container) {
  background: #1e293b;
  border-color: #334155;
}

.markdown-renderer :deep(.code-block-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: #e2e8f0;
  border-bottom: var(--border-width-base) solid #cbd5e1;
  font-size: 1var(--border-width-base);
}

.markdown-renderer.dark-theme :deep(.code-block-header) {
  background: #334155;
  border-bottom-color: #475569;
}

.markdown-renderer :deep(.code-language) {
  font-weight: 500;
  color: #64748b;
}

.markdown-renderer.dark-theme :deep(.code-language) {
  color: #94a3b8;
}

.markdown-renderer :deep(.copy-code-btn) {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 10px;
  padding: 3px 6px;
  border-radius: 3px;
  transition: all 0.2s;
}

.markdown-renderer :deep(.copy-code-btn:hover) {
  background: #cbd5e1;
  color: #475569;
}

.markdown-renderer.dark-theme :deep(.copy-code-btn) {
  color: #94a3b8;
}

.markdown-renderer.dark-theme :deep(.copy-code-btn:hover) {
  background: #475569;
  color: #e2e8f0;
}

.markdown-renderer :deep(.code-block) {
  margin: 0;
  padding: var(--spacing-sm) 10px;
  background: transparent;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 1var(--border-width-base);
  line-height: 1.4;
}

/* 表格样式 */
.markdown-renderer :deep(.table-container) {
  overflow-x: auto;
  margin: var(--spacing-sm) 0;
  border-radius: 6px;
  border: var(--border-width-base) solid var(--border-light-dark);
}

.markdown-renderer.dark-theme :deep(.table-container) {
  border-color: #334155;
}

.markdown-renderer :deep(.markdown-table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.markdown-renderer :deep(.markdown-table th),
.markdown-renderer :deep(.markdown-table td) {
  padding: 6px var(--spacing-sm);
  text-align: left;
  border-bottom: var(--border-width-base) solid #e2e8f0;
}

.markdown-renderer :deep(.markdown-table th) {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
}

.markdown-renderer.dark-theme :deep(.markdown-table th) {
  background: #1e293b;
  color: #f1f5f9;
  border-bottom-color: #334155;
}

.markdown-renderer.dark-theme :deep(.markdown-table td) {
  border-bottom-color: #334155;
}

/* 移动端优化 */
@media (max-width: 480px) {
  .markdown-renderer :deep(.code-block) {
    font-size: 10px;
    padding: 6px var(--spacing-sm);
  }
  
  .markdown-renderer :deep(.markdown-table) {
    font-size: 1var(--border-width-base);
  }
  
  .markdown-renderer :deep(.markdown-table th),
  .markdown-renderer :deep(.markdown-table td) {
    padding: var(--spacing-xs) 6px;
  }
}
</style>
