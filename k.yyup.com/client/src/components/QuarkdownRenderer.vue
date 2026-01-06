<!--
  🪐 Quarkdown 风格渲染器
  
  模拟 Quarkdown 的高级 Markdown 功能
  支持函数调用、变量、条件语句等
-->

<template>
  <div class="quarkdown-renderer" :class="{ 'dark-mode': isDark }">
    <div class="quarkdown-content" v-html="renderedContent"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { marked } from 'marked'

interface Props {
  content: string
  isDark?: boolean
  variables?: Record<string, any>
  functions?: Record<string, Function>
}

const props = withDefaults(defineProps<Props>(), {
  isDark: false,
  variables: () => ({}),
  functions: () => ({})
})

// 内置变量
const builtinVariables = ref({
  author: 'Quarkdown User',
  date: new Date().toLocaleDateString(),
  version: '1.0.0',
  title: 'Quarkdown Document'
})

// 内置函数
const builtinFunctions = ref({
  // 居中函数
  center: (content: string) => `<div class="qd-center">${content}</div>`,
  
  // 行布局函数
  row: (content: string, alignment = 'start') => 
    `<div class="qd-row qd-align-${alignment}">${content}</div>`,
  
  // 列布局函数
  column: (content: string) => `<div class="qd-column">${content}</div>`,
  
  // 高亮函数
  highlight: (text: string, color = 'yellow') => 
    `<span class="qd-highlight qd-highlight-${color}">${text}</span>`,
  
  // 徽章函数
  badge: (text: string, type = 'info') => 
    `<span class="qd-badge qd-badge-${type}">${text}</span>`,
  
  // 警告框函数
  alert: (content: string, type = 'info') => 
    `<div class="qd-alert qd-alert-${type}">
      <div class="qd-alert-icon">
        ${getAlertIcon(type)}
      </div>
      <div class="qd-alert-content">${content}</div>
    </div>`,
  
  // 卡片函数
  card: (content: string, title?: string) => 
    `<div class="qd-card">
      ${title ? `<div class="qd-card-header">${title}</div>` : ''}
      <div class="qd-card-body">${content}</div>
    </div>`,
  
  // 网格函数
  grid: (content: string, columns = 2) => 
    `<div class="qd-grid qd-grid-${columns}">${content}</div>`,
  
  // 时间线函数
  timeline: (items: string[]) => {
    const timelineItems = items.map(item => 
      `<div class="qd-timeline-item">
        <div class="qd-timeline-marker"></div>
        <div class="qd-timeline-content">${item}</div>
      </div>`
    ).join('')
    return `<div class="qd-timeline">${timelineItems}</div>`
  }
})

// 获取警告图标
function getAlertIcon(type: string): string {
  const icons = {
    info: '💡',
    warning: '⚠️',
    error: '❌',
    success: '✅'
  }
  return icons[type] || icons.info
}

// 解析 Quarkdown 函数调用
function parseQuarkdownFunctions(content: string): string {
  // 匹配 .function {arg1} {arg2} 格式
  const functionRegex = /\.(\w+)\s*(?:\{([^}]*)\})?\s*(?:\{([^}]*)\})?\s*(?:\{([^}]*)\})?/g
  
  return content.replace(functionRegex, (match, funcName, arg1, arg2, arg3) => {
    const allFunctions = { ...builtinFunctions.value, ...props.functions }
    
    if (allFunctions[funcName]) {
      const args = [arg1, arg2, arg3].filter(arg => arg !== undefined)
      try {
        return allFunctions[funcName](...args)
      } catch (error) {
        console.warn(`Quarkdown function error: ${funcName}`, error)
        return `<span class="qd-error">Function error: ${funcName}</span>`
      }
    }
    
    return match // 如果函数不存在，保持原样
  })
}

// 解析变量
function parseVariables(content: string): string {
  const allVariables = { ...builtinVariables.value, ...props.variables }
  
  // 匹配 .variable 格式
  const variableRegex = /\.(\w+)(?!\s*\{)/g
  
  return content.replace(variableRegex, (match, varName) => {
    if (allVariables[varName] !== undefined) {
      return String(allVariables[varName])
    }
    return match
  })
}

// 解析块级函数（带内容体）
function parseBlockFunctions(content: string): string {
  // 匹配多行函数调用
  const blockRegex = /\.(\w+)(?:\s*\{([^}]*)\})?\s*\n([\s\S]*?)(?=\n\.|$)/g
  
  return content.replace(blockRegex, (match, funcName, args, body) => {
    const allFunctions = { ...builtinFunctions.value, ...props.functions }
    
    if (allFunctions[funcName]) {
      try {
        const processedBody = parseVariables(parseQuarkdownFunctions(body.trim()))
        return allFunctions[funcName](processedBody, args)
      } catch (error) {
        console.warn(`Quarkdown block function error: ${funcName}`, error)
        return `<span class="qd-error">Block function error: ${funcName}</span>`
      }
    }
    
    return match
  })
}

// 主要的内容渲染
const renderedContent = computed(() => {
  if (!props.content) return ''
  
  try {
    // 1. 解析块级函数
    let processed = parseBlockFunctions(props.content)
    
    // 2. 解析内联函数
    processed = parseQuarkdownFunctions(processed)
    
    // 3. 解析变量
    processed = parseVariables(processed)
    
    // 4. 使用 marked 处理标准 Markdown
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: false,
      mangle: false
    })
    
    return marked.parse(processed)
  } catch (error) {
    console.error('Quarkdown rendering error:', error)
    return `<p class="qd-error">Rendering error: ${error.message}</p>`
  }
})
</script>

<style scoped>
.quarkdown-renderer {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-white);
  transition: all var(--transition-normal) ease;
}

.quarkdown-renderer.dark-mode {
  color: #e5e5e5;
  background: #1a1a1a;
}

/* Quarkdown 特殊元素样式 */
:deep(.qd-center) {
  text-align: center;
  margin: 1.5em 0;
}

:deep(.qd-row) {
  display: flex;
  gap: 1rem;
  margin: 1.5em 0;
  flex-wrap: wrap;
}

:deep(.qd-row.qd-align-start) { justify-content: flex-start; }
:deep(.qd-row.qd-align-center) { justify-content: center; }
:deep(.qd-row.qd-align-end) { justify-content: flex-end; }
:deep(.qd-row.qd-align-spacebetween) { justify-content: space-between; }
:deep(.qd-row.qd-align-spacearound) { justify-content: space-around; }

:deep(.qd-column) {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5em 0;
}

:deep(.qd-highlight) {
  padding: var(--spacing-sm) 6px;
  border-radius: var(--spacing-xs);
  font-weight: 500;
}

:deep(.qd-highlight-yellow) { background: var(--bg-white)3cd; color: #856404; }
:deep(.qd-highlight-blue) { background: #cce7ff; color: #004085; }
:deep(.qd-highlight-green) { background: #d4edda; color: #155724; }
:deep(.qd-highlight-red) { background: #f8d7da; color: #721c24; }

:deep(.qd-badge) {
  display: inline-block;
  padding: 0.25em 0.6em;
  font-size: 0.75em;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.375rem;
}

:deep(.qd-badge-info) { background: #0dcaf0; color: #000; }
:deep(.qd-badge-success) { background: #198754; color: var(--bg-white); }
:deep(.qd-badge-warning) { background: var(--warning-color); color: #000; }
:deep(.qd-badge-danger) { background: var(--danger-color); color: var(--bg-white); }

:deep(.qd-alert) {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  margin: 1.5em 0;
  border-radius: var(--spacing-sm);
  border-left: var(--spacing-xs) solid;
}

:deep(.qd-alert-info) {
  background: #e7f3ff;
  border-left-color: #0ea5e9;
  color: #0369a1;
}

:deep(.qd-alert-warning) {
  background: var(--bg-white)beb;
  border-left-color: var(--warning-color);
  color: #92400e;
}

:deep(.qd-alert-error) {
  background: #fef2f2;
  border-left-color: var(--danger-color);
  color: #dc2626;
}

:deep(.qd-alert-success) {
  background: #f0fdf4;
  border-left-color: var(--success-color);
  color: #166534;
}

:deep(.qd-alert-icon) {
  margin-right: 0.75rem;
  font-size: 1.25em;
}

:deep(.qd-card) {
  background: var(--bg-white);
  border-radius: var(--text-sm);
  box-shadow: 0 var(--spacing-xs) 6px -var(--border-width-base) var(--shadow-light);
  margin: 1.5em 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

:deep(.qd-card-header) {
  padding: 1rem 1.5rem;
  background: var(--text-primary-light);
  border-bottom: var(--z-index-dropdown) solid #e2e8f0;
  font-weight: 600;
  font-size: 1.1em;
}

:deep(.qd-card-body) {
  padding: 1.5rem;
}

:deep(.qd-grid) {
  display: grid;
  gap: 1.5rem;
  margin: 1.5em 0;
}

:deep(.qd-grid-1) { grid-template-columns: 1fr; }
:deep(.qd-grid-2) { grid-template-columns: repeat(2, 1fr); }
:deep(.qd-grid-3) { grid-template-columns: repeat(3, 1fr); }
:deep(.qd-grid-4) { grid-template-columns: repeat(4, 1fr); }

:deep(.qd-timeline) {
  position: relative;
  padding-left: 2rem;
}

:deep(.qd-timeline::before) {
  content: '';
  position: absolute;
  left: 0.75rem;
  top: 0;
  bottom: 0;
  width: auto;
  background: #e2e8f0;
}

:deep(.qd-timeline-item) {
  position: relative;
  margin-bottom: 2rem;
}

:deep(.qd-timeline-marker) {
  position: absolute;
  left: -1.75rem;
  top: 0.25rem;
  width: var(--text-sm);
  height: var(--text-sm);
  background: var(--primary-color);
  border-radius: var(--radius-full);
  border: 2px solid var(--bg-white);
  box-shadow: 0 0 0 2px var(--border-light-dark);
}

:deep(.qd-timeline-content) {
  background: var(--text-primary-light);
  padding: 1rem;
  border-radius: var(--spacing-sm);
  border-left: 3px solid var(--primary-color);
}

:deep(.qd-error) {
  color: #dc2626;
  background: #fef2f2;
  padding: 0.5rem;
  border-radius: var(--spacing-xs);
  border: var(--border-width) solid #fecaca;
}

/* 深色模式适配 */
.dark-mode :deep(.qd-card) {
  background: var(--color-gray-700);
  color: #e5e5e5;
}

.dark-mode :deep(.qd-card-header) {
  background: var(--color-gray-600);
  border-bottom-color: var(--text-secondary);
}

.dark-mode :deep(.qd-timeline-content) {
  background: var(--color-gray-700);
  color: #e5e5e5;
}

.dark-mode :deep(.qd-alert-info) {
  background: #1e3a8a;
  color: #bfdbfe;
}

.dark-mode :deep(.qd-alert-warning) {
  background: #92400e;
  color: #fde68a;
}

.dark-mode :deep(.qd-alert-error) {
  background: #991b1b;
  color: #fecaca;
}

.dark-mode :deep(.qd-alert-success) {
  background: #166534;
  color: #bbf7d0;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  :deep(.qd-row) {
    flex-direction: column;
  }
  
  :deep(.qd-grid-2),
  :deep(.qd-grid-3),
  :deep(.qd-grid-4) {
    grid-template-columns: 1fr;
  }
}
</style>
