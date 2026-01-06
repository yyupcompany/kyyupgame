<!--
  📝 Markdown渲染组件

  支持在聊天气泡中渲染Markdown格式的内容
  包含代码高亮、表格、列表等功能
-->

<template>
  <div
    class="markdown-renderer"
    :class="{ 'dark-theme': isDark, 'mobile-optimized': isMobile }"
  >
    <!-- 渲染处理后的内容 -->
    <div v-html="renderedContent"></div>

    <!-- 渲染Mermaid图表 -->
    <mermaid-renderer
      v-for="(mermaidCode, index) in mermaidBlocks"
      :key="`mermaid-${index}`"
      :mermaid-code="mermaidCode"
      :is-dark="isDark"
      :is-mobile="isMobile"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
import MermaidRenderer from './MermaidRenderer.vue'

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

// Mermaid代码块存储
const mermaidBlocks = ref<string[]>([])

// 提取Mermaid代码块
const extractMermaidBlocks = (content: string): { content: string; mermaidBlocks: string[] } => {
  const blocks: string[] = []
  let processedContent = content

  // 兼容不同换行/空行的 Mermaid 代码块（```mermaid 开头，直到下一个 ``` 结束）
  const mermaidRegex = /```mermaid[\t ]*\r?\n([\s\S]*?)\r?\n```/g
  let match

  while ((match = mermaidRegex.exec(content)) !== null) {
    const mermaidCode = match[1].trim()
    if (mermaidCode) {
      blocks.push(mermaidCode)
      // 用占位符替换Mermaid代码块
      processedContent = processedContent.replace(match[0], `\n<!-- MERMAID_PLACEHOLDER_${blocks.length - 1} -->\n`)
    }
  }

  return { content: processedContent, mermaidBlocks: blocks }
}

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
    } : undefined,
    // 仅启用基础自定义渲染（heading/paragraph/list/link/blockquote），其余使用默认
    renderer: createCustomRenderer()
  })
}

// 创建自定义渲染器
const createCustomRenderer = () => {
  const renderer = new marked.Renderer()

  // 自定义标题渲染（签名兼容：text, level)
  renderer.heading = (text: string, level: number) => {
    const sizes = ['var(--text-3xl)', 'var(--spacing-xl)', 'var(--text-xl)', 'var(--text-lg)', 'var(--text-base)', 'var(--text-sm)']
    const size = sizes[level - 1] || 'var(--text-base)'
    return `<h${level} style="font-size:${props.isMobile ? Math.max(parseInt(size) - 2, 12) + 'px' : size};font-weight:600;margin:${props.isMobile ? 'var(--text-sm) 0 var(--spacing-sm) 0' : 'var(--text-lg) 0 var(--text-sm) 0'};color:${props.isDark ? 'var(--text-primary-dark)' : 'var(--text-primary-light)'};1.3: 3199;">${text}</h${level}>`
  }

  // 自定义段落渲染
  renderer.paragraph = (text: string) => {
    return `<p style="margin:${props.isMobile ? 'var(--spacing-sm) 0' : 'var(--text-sm) 0'};1.6: 3391;color:${props.isDark ? 'var(--text-secondary-dark)' : 'var(--text-regular-light)'};font-size:${props.isMobile ? 'var(--text-base)' : 'var(--text-lg)'};">${text}</p>`
  }

  // 自定义列表渲染
  renderer.list = (body: string, ordered: boolean) => {
    const tag = ordered ? 'ol' : 'ul'
    return `<${tag} style="
      margin: ${props.isMobile ? 'var(--spacing-sm) 0' : 'var(--text-sm) 0'};
      padding-left: ${props.isMobile ? 'var(--spacing-xl)' : 'var(--text-3xl)'};
      color: ${props.isDark ? 'var(--text-secondary-dark)' : 'var(--text-regular-light)'};
    ">${body}</${tag}>`
  }

  renderer.listitem = (text: string) => {
    return `<li style="
      margin: ${props.isMobile ? 'var(--spacing-xs) 0' : '6px 0'};
      1.5: 4129;
      font-size: ${props.isMobile ? 'var(--text-base)' : 'var(--text-lg)'};
    ">${text}</li>`
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
      background: ${props.isDark ? 'var(--text-regular-light)' : 'var(--bg-hover)'};
      color: ${props.isDark ? 'var(--warning-color)' : 'var(--danger-color)'};
  // malformed CSS removed
      border-radius: var(--spacing-xs);
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: ${props.isMobile ? '13px' : 'var(--text-base)'};
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

  // 自定义链接渲染（marked@15 仍兼容 Renderer.link(text, href, title?) 签名）
  // 但当前 marked 的 TS 类型定义是 (href, title, text)，因此我们做双向兜底
  // @ts-ignore 签名兼容处理
  renderer.link = (href: any, title: any, text: any) => {
    // 兼容顺序：如果第一个参数是文本，说明参数顺序是 (text, href, title)
    if (typeof href === 'string' && typeof text === 'string') {
      // 正常顺序 (href, title, text)
      const safeHref = href || '#'
      const safeTitle = title ? String(title) : ''
      const safeText = text
      return `<a href="${safeHref}" ${safeTitle ? `title="${safeTitle}"` : ''} target="_blank" rel="noopener noreferrer"
        style="color:${props.isDark ? 'var(--accent-enrollment)' : 'var(--accent-enrollment-hover)'};text-decoration:underline;text-decoration-color:${props.isDark ? 'var(--accent-enrollment)' : 'var(--accent-enrollment-hover)'};">
        ${safeText}
      </a>`
    }
    // 旧顺序 (text, href, title)
    const txt = href
    const url = title || '#'
    const ttl = text ? String(text) : ''
    return `<a href="${url}" ${ttl ? `title="${ttl}"` : ''} target="_blank" rel="noopener noreferrer"
      style="color:${props.isDark ? 'var(--accent-enrollment)' : 'var(--accent-enrollment-hover)'};text-decoration:underline;text-decoration-color:${props.isDark ? 'var(--accent-enrollment)' : 'var(--accent-enrollment-hover)'};">
      ${txt}
    </a>`
  }

  // 自定义强调渲染
  renderer.strong = (text: string) => {
    return `<strong style="
      font-weight: 600;
      color: ${props.isDark ? 'var(--bg-color)' : 'var(--text-primary-dark)'};
    ">${text}</strong>`
  }

  // 自定义斜体渲染
  renderer.em = (text: string) => {
    return `<em style="
      font-style: italic;
      color: ${props.isDark ? 'var(--border-color)' : 'var(--color-gray-600)'};
    ">${text}</em>`
  }

  // 自定义引用渲染
  renderer.blockquote = (quote: string) => {
    return `<blockquote style="
      border-left: var(--spacing-xs) solid ${props.isDark ? 'var(--accent-enrollment)' : 'var(--accent-enrollment-hover)'};
      margin: ${props.isMobile ? 'var(--text-sm) 0' : 'var(--text-lg) 0'};
      padding: ${props.isMobile ? 'var(--spacing-sm) var(--text-sm)' : 'var(--text-sm) var(--text-lg)'};
      background: ${props.isDark ? 'var(--text-primary-light)' : 'var(--text-primary-light)'};
      border-radius: 0 var(--spacing-sm) var(--spacing-sm) 0;
      font-style: italic;
      color: ${props.isDark ? 'var(--border-color)' : 'var(--color-gray-600)'};
    ">${quote}</blockquote>`
  }

  return renderer
}

// 渲染Markdown内容
const renderedContent = computed(() => {
  if (!props.content) {
    mermaidBlocks.value = []
    return ''
  }

  try {
    // 提取Mermaid代码块
    const { content: processedContent, mermaidBlocks: extractedBlocks } = extractMermaidBlocks(props.content)
    mermaidBlocks.value = extractedBlocks

    // 配置并渲染Markdown
    configureMarked()
    let html = marked(processedContent)

    // 移除Mermaid占位符
    html = html.replace(/<!-- MERMAID_PLACEHOLDER_\d+ -->/g, '')

    // 结构级美化（代码块包裹、表格滚动等）
    html = beautifyHtml(html)
    // 安全清洗，防止潜在 XSS（已保留代码高亮）
    const safeHtml = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
    return safeHtml
  } catch (error) {
    console.error('Markdown渲染失败:', error)
    return `<p style="color: var(--danger-color);">Markdown渲染失败: ${error.message}</p>`
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


// 结构级美化：对默认 HTML 做轻量增强
const beautifyHtml = (html: string): string => {
  try {
    let out = html

    // 1) 给 <pre><code> 包裹一个带语言名和复制按钮的容器（仅默认renderer输出）
    //   将形如 <pre><code class="language-xxx">...</code></pre>
    //   替换为带工具栏的容器结构
    out = out.replace(/<pre><code class="([^"]*)">([\s\S]*?)<\/code><\/pre>/g, (_m, cls, code) => {
      const langMatch = (cls || '').match(/language-([a-zA-Z0-9]+)/)
      const language = langMatch ? langMatch[1] : 'text'
      // 还原实体，避免重复转义（只做最小处理）
      const rawCode = code
      return `
<div class="code-block-container">
  <div class="code-block-header">
    <span class="code-language">${language}</span>
    <button class="copy-code-btn" onclick="copyCode(this)" data-code="${encodeURIComponent(rawCode)}">📋 复制</button>
  </div>
  <pre class="code-block"><code class="hljs ${language}">${rawCode}</code></pre>
</div>`
    })

    // 2) 表格外层包裹一层滚动容器，便于小屏显示
    out = out.replace(/<table>/g, '<div class="table-container"><table>')
             .replace(/<\/table>/g, '</table></div>')

    return out
  } catch (e) {
    console.warn('beautifyHtml 处理失败:', e)
    return html
  }
}


onMounted(() => {
  setupCopyCode()
})

// 当内容变化时，下一帧确保复制按钮事件存在（SSR/DOM更新差异兜底）
watch(() => renderedContent.value, async () => {
  await nextTick()
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
  margin: var(--text-sm) 0;
  border-radius: var(--spacing-sm);
  overflow: hidden;
  background: var(--text-primary-light);
  border: var(--border-width) solid var(--border-light-dark);
}

.markdown-renderer.dark-theme :deep(.code-block-container) {
  background: var(--text-primary-dark);
  border-color: var(--bg-hover-dark);
}

.markdown-renderer :deep(.code-block-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--text-sm);
  background: #e2e8f0;
  border-bottom: 1px solid var(--dark-border);
  font-size: var(--text-sm);
}

.markdown-renderer.dark-theme :deep(.code-block-header) {
  background: var(--bg-hover-dark);
  border-bottom-color: var(--dark-surface-3);
}

.markdown-renderer :deep(.code-language) {
  font-weight: 500;
  color: var(--dark-text-1);
}

.markdown-renderer.dark-theme :deep(.code-language) {
  color: var(--text-muted);
}

.markdown-renderer :deep(.copy-code-btn) {
  background: none;
  border: none;
  color: var(--dark-text-1);
  cursor: pointer;
  font-size: var(--text-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  transition: all var(--transition-fast);
}

.markdown-renderer :deep(.copy-code-btn:hover) {
  background: var(--text-secondary-dark);
  color: var(--dark-surface-3);
}

.markdown-renderer.dark-theme :deep(.copy-code-btn) {
  color: var(--text-muted);
}

.markdown-renderer.dark-theme :deep(.copy-code-btn:hover) {
  background: var(--dark-surface-3);
  color: #e2e8f0;
}

.markdown-renderer :deep(.code-block) {
  margin: 0;
  padding: var(--text-sm);
  background: transparent;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--text-sm);
  line-height: 1.4;
}

.markdown-renderer.mobile-optimized :deep(.code-block) {
  font-size: var(--text-sm);
}

/* 表格样式 */
.markdown-renderer :deep(.table-container) {
  overflow-x: auto;
  margin: var(--text-sm) 0;
  border-radius: var(--spacing-sm);
  border: var(--border-width) solid var(--border-light-dark);
}

.markdown-renderer.dark-theme :deep(.table-container) {
  border-color: var(--bg-hover-dark);
}

.markdown-renderer :deep(.markdown-table) {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-base);
}

.markdown-renderer.mobile-optimized :deep(.markdown-table) {
  font-size: var(--text-sm);
}

.markdown-renderer :deep(.markdown-table th),
.markdown-renderer :deep(.markdown-table td) {
  padding: var(--spacing-sm) var(--text-sm);
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.markdown-renderer.mobile-optimized :deep(.markdown-table th),
.markdown-renderer.mobile-optimized :deep(.markdown-table td) {
  padding: var(--spacing-xs) var(--spacing-sm);
}

.markdown-renderer :deep(.markdown-table th) {
  background: var(--text-primary-light);
  font-weight: 600;
  color: var(--text-regular-light);
}

.markdown-renderer.dark-theme :deep(.markdown-table th) {
  background: var(--text-primary-dark);
  color: var(--dark-bg-secondary);
  border-bottom-color: var(--bg-hover-dark);
}

.markdown-renderer.dark-theme :deep(.markdown-table td) {
  border-bottom-color: var(--bg-hover-dark);
}

/* 移动端优化 */
.markdown-renderer.mobile-optimized :deep(h1),
.markdown-renderer.mobile-optimized :deep(h2),
.markdown-renderer.mobile-optimized :deep(h3),
.markdown-renderer.mobile-optimized :deep(h4),
.markdown-renderer.mobile-optimized :deep(h5),
.markdown-renderer.mobile-optimized :deep(h6) {
  margin: var(--spacing-sm) 0;
}

.markdown-renderer.mobile-optimized :deep(p) {
  margin: var(--spacing-xs) 0;
}

.markdown-renderer.mobile-optimized :deep(ul),
.markdown-renderer.mobile-optimized :deep(ol) {
  margin: var(--spacing-xs) 0;
  padding-left: var(--text-xl);
}

.markdown-renderer.mobile-optimized :deep(blockquote) {
  margin: var(--spacing-sm) 0;
  padding: var(--spacing-sm);
}

/* 响应式调整 */
@media (max-width: var(--breakpoint-xs)) {
  .markdown-renderer :deep(.code-block) {
    font-size: var(--text-xs);
    padding: var(--spacing-sm);
  }

  .markdown-renderer :deep(.markdown-table) {
    font-size: var(--text-sm);
  }

  .markdown-renderer :deep(.markdown-table th),
  .markdown-renderer :deep(.markdown-table td) {
    padding: var(--spacing-xs) 6px;
  }
}
/* 默认元素样式（使用默认renderer时生效） */
.markdown-renderer :deep(h1),
.markdown-renderer :deep(h2),
.markdown-renderer :deep(h3),
.markdown-renderer :deep(h4),
.markdown-renderer :deep(h5),
.markdown-renderer :deep(h6) {
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-primary-light);
  margin: var(--text-lg) 0 var(--text-sm) 0;
}
.markdown-renderer.dark-theme :deep(h1),
.markdown-renderer.dark-theme :deep(h2),
.markdown-renderer.dark-theme :deep(h3),
.markdown-renderer.dark-theme :deep(h4),
.markdown-renderer.dark-theme :deep(h5),
.markdown-renderer.dark-theme :deep(h6) {
  color: var(--bg-color);
}
.markdown-renderer :deep(p) {
  margin: var(--text-sm) 0;
  line-height: 1.6;
  color: var(--text-regular-light);
  font-size: var(--text-lg);
}
.markdown-renderer.dark-theme :deep(p) { color: var(--text-secondary-dark); }

.markdown-renderer :deep(ul),
.markdown-renderer :deep(ol) {
  margin: var(--text-sm) 0;
  padding-left: var(--text-3xl);
  color: var(--text-regular-light);
}
.markdown-renderer :deep(li) { 
  margin: 6px 0; 
}

.markdown-renderer :deep(blockquote) {
  border-left: var(--spacing-xs) solid #2563eb;
  margin: var(--text-lg) 0;
  padding: var(--text-sm) var(--text-lg);
  background: var(--text-primary-light);
  border-radius: 0 var(--spacing-sm) var(--spacing-sm) 0;
  font-style: italic;
  color: var(--color-gray-600);
}
.markdown-renderer.dark-theme :deep(blockquote) {
  border-left-color: var(--status-info);
  background: var(--text-primary-light);
  color: var(--border-color);
}

/* 表格（默认renderer输出的原生table） */
.markdown-renderer :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-base);
  margin: var(--text-sm) 0;
}
.markdown-renderer :deep(th),
.markdown-renderer :deep(td) {
  padding: var(--spacing-sm) var(--text-sm);
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}
.markdown-renderer :deep(th) {
  background: var(--text-primary-light);
  font-weight: 600;
  color: var(--text-regular-light);
}
.markdown-renderer.dark-theme :deep(th) {
  background: var(--text-primary-dark);
  color: var(--dark-bg-secondary);
  border-bottom-color: var(--bg-hover-dark);
}
.markdown-renderer.dark-theme :deep(td) {
  border-bottom-color: var(--bg-hover-dark);
}

/* 代码与代码块（默认renderer输出） */
.markdown-renderer :deep(code) {
  background: var(--bg-hover);
  color: var(--danger-color);
  padding: 2px var(--spacing-xs);
  border-radius: var(--spacing-xs);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--text-base);
}
.markdown-renderer.dark-theme :deep(code) {
  background: var(--text-regular-light);
  color: var(--warning-color);
}
.markdown-renderer :deep(pre) {
  margin: var(--text-sm) 0;
  border-radius: var(--spacing-sm);
  overflow: hidden;
  background: var(--text-primary-light);
  border: var(--border-width) solid var(--border-light-dark);
}
.markdown-renderer.dark-theme :deep(pre) {
  background: var(--text-primary-dark);
  border-color: var(--bg-hover-dark);
}
.markdown-renderer :deep(pre code) {
  display: block;
  padding: var(--text-sm);
  background: transparent;
  overflow-x: auto;
  font-size: var(--text-sm);
  line-height: 1.4;
}

/* 移动端微调 */
.markdown-renderer.mobile-optimized :deep(p) { font-size: var(--text-base); margin: var(--spacing-sm) 0; }
.markdown-renderer.mobile-optimized :deep(ul),
.markdown-renderer.mobile-optimized :deep(ol) { margin: var(--spacing-sm) 0; padding-left: var(--spacing-xl); }
</style>
