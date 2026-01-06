<!--
  工具调用组件 - Qoder风格简约版
  单行显示，与思考过程风格统一
-->

<template>
  <div class="event-row" :class="[status]">
    <!-- 单行头部 -->
    <div class="event-header">
      <span v-if="status === 'running'" class="event-spinner"></span>
      <span v-else-if="status === 'completed'" class="event-check">✔</span>
      <span v-else-if="status === 'failed'" class="event-error">✖</span>
      <span v-else class="event-pending">○</span>
      <span class="event-label">{{ displayLabel }}</span>
      <span class="event-time">· {{ elapsedText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface Props {
  toolName: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  intent?: string
  description?: string
  startTimestamp?: number
  duration?: number
}

const props = defineProps<Props>()

const now = ref(Date.now())
let timer: number | null = null

// 显示标签 - 将工具名转换为友好的中文显示
const displayLabel = computed(() => {
  const labelMap: Record<string, string> = {
    // 数据查询工具
    'any_query': '已查询数据',
    'read_data_record': '已读取记录',
    'render_component': '已渲染组件',
    // 工作流工具
    'execute_activity_workflow': '已执行活动',
    // 代码工具
    'search_codebase': '已搜索代码',
    'read_file': '已查看',
    'list_dir': '已浏览目录',
    'grep_code': '已搜索内容',
    // 📋 任务管理工具
    'analyze_task_complexity': '已分析任务复杂度',
    'create_todo_list': '已创建任务清单',
    'get_todo_list': '已获取任务列表',
    'update_todo_task': '已更新任务状态',
    // 文档生成工具
    'generate_pdf_report': '已生成PDF报告',
    'generate_excel_report': '已生成Excel报告',
    'generate_word_document': '已生成Word文档',
    'generate_ppt_presentation': '已生成PPT演示',
    // API发现工具
    'search_api_categories': '已搜索API分类',
    'get_api_endpoints': '已获取API端点',
    'get_api_details': '已获取API详情',
    'http_request': '已执行HTTP请求'
  }

  // 如果有 intent，显示 intent
  if (props.intent) {
    return props.intent
  }

  // 否则使用映射或原名
  return labelMap[props.toolName] || `已执行 ${props.toolName}`
})

const elapsedMs = computed(() => {
  const start = props.startTimestamp || Date.now()
  if (props.status === 'completed' || props.status === 'failed') {
    return props.duration ?? Math.max(0, now.value - start)
  }
  return Math.max(0, now.value - start)
})

const elapsedText = computed(() => {
  const seconds = Math.floor(elapsedMs.value / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m${remainingSeconds.toString().padStart(2, '0')}s`
})

const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const startTimer = () => {
  stopTimer()
  if (props.status === 'running') {
    timer = window.setInterval(() => {
      now.value = Date.now()
    }, 1000)
  } else {
    now.value = Date.now()
  }
}

onMounted(startTimer)
watch(() => props.status, () => startTimer())
onBeforeUnmount(stopTimer)
</script>

<style scoped lang="scss">
// design-tokens 已通过 vite.config 全局注入

// Qoder风格事件行
.event-row {
  padding: var(--spacing-xs) 0;
  transition: background 0.15s ease;
  border-radius: var(--radius-sm);
}

.event-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  padding: 0 var(--spacing-xs);
  height: 24px;
}

.event-spinner {
  width: 12px;
  height: 12px;
  border: 1.5px solid var(--border-color);
  border-top-color: var(--warning-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.event-check {
  color: var(--success-color);
  font-size: 11px;
}

.event-error {
  color: var(--danger-color);
  font-size: 11px;
}

.event-pending {
  color: var(--text-tertiary);
  font-size: 11px;
}

.event-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-time {
  color: var(--text-tertiary);
  font-size: 12px;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
