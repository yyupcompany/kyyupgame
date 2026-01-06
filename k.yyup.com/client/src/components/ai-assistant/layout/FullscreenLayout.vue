<!--
  全屏布局组件
  从 AIAssistant.vue 第3-30行模板提取
-->

<template>
  <div
    class="ai-assistant-fullscreen"
    :class="{
      'entering': fullscreenState.entering,
      'exiting': fullscreenState.exiting,
      'workflow-transparent': isWorkflowTransparent
    }"
  >
    <!-- 工作流步骤队列 -->
    <WorkflowStepQueue
      v-for="queueId in activeStepQueues"
      :key="queueId"
      :queue-id="queueId"
      @close="handleStepQueueClose"
      @cancel="handleStepQueueCancel"
      @retry="handleStepQueueRetry"
    />

    <!-- 全局顶部导航 - 简化设计 -->
    <div class="global-header">
      <div class="header-left">
        <!-- 精致的AI助手图标 - 与侧边栏保持一致 -->
        <div class="ai-service-icon-fullscreen">
          <UnifiedIcon name="ai-center" />
        </div>
      </div>
      <div class="header-actions">
        <!-- Token用量圆圈 -->
        <TokenUsageCircle
          :size="36"
          :stroke-width="3"
          :fontSize="11"
          tooltip-position="bottom"
          :animate-on-change="true"
          :update-interval="30000"
          class="token-usage-indicator-fullscreen"
        />

        <!-- 查看统计 -->
        <el-button
          class="action-btn fullscreen-action"
          @click="showStatistics"
          title="查看统计"
        >
          <UnifiedIcon name="statistics" />
        </el-button>

        <!-- 清空对话 -->
        <el-button
          class="action-btn fullscreen-action"
          @click="showClearOptions"
          title="清空对话"
        >
          <UnifiedIcon name="refresh" />
        </el-button>

        <!-- 主题切换 -->
        <el-button
          class="action-btn fullscreen-action theme-toggle"
          @click="toggleTheme"
          :title="currentTheme === 'theme-dark' ? '切换到明亮主题' : '切换到暗黑主题'"
        >
          <UnifiedIcon name="sun" />
          <UnifiedIcon name="moon" />
        </el-button>

        <!-- 返回主界面 -->
        <el-button
          class="action-btn exit-fullscreen"
          @click="toggleFullscreen"
          title="返回主界面 (ESC)"
        >
          <UnifiedIcon name="close" :size="16" />
          <span class="exit-text">返回</span>
        </el-button>
      </div>
    </div>

    <!-- 🆕 ESC键提示（首次进入时显示） -->
    <Transition name="fade">
      <div v-if="showEscHint" class="esc-hint-overlay">
        <div class="esc-hint-card">
          <UnifiedIcon name="info" />
          <div class="hint-content">
            <div class="hint-title">快捷键提示</div>
            <div class="hint-text">按 <kbd>ESC</kbd> 键可快速返回主界面</div>
          </div>
          <el-button size="small" type="primary" @click="closeEscHint">知道了</el-button>
        </div>
      </div>
    </Transition>

    <!-- 🎯 主内容区域 - 包含左侧、中间、右侧 -->
    <div class="main-content-area">
      <!-- 2️⃣ 左侧面板：会话管理 + 快捷查询 -->
      <div class="left-sidebar-container">
        <!-- 会话管理标签页 -->
        <ConversationTabs />

        <!-- 快捷查询面板 -->
        <QuickQuerySidebar
          :collapsed="leftSidebarCollapsed"
          @toggle="toggleLeftSidebar"
          @select-query="handleSelectQuery"
        />
      </div>

      <!-- 3️⃣ 中心对话区域 -->
      <div class="center-main">
        <slot name="chat-container" />
      </div>

      <!-- 🎯 右侧面板已移除，所有内容在中间对话框显示 -->
    </div>

    <!-- 底部快捷键提示 -->
    <div v-if="showShortcuts" class="shortcut-hint">
      <span class="hint-item"><kbd>Enter</kbd> 发送</span>
      <span class="hint-item"><kbd>Shift+Enter</kbd> 换行</span>
      <span class="hint-item"><kbd>Esc</kbd> 关闭全屏</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  Service as ServiceIcon,
  TrendCharts,
  Operation,
  Delete,
  Sunny,
  Moon,
  Close,
  Connection,
  View,
  InfoFilled
} from '@element-plus/icons-vue'
import WorkflowStepQueue from '@/components/workflow/WorkflowStepQueue.vue'
import QuickQuerySidebar from '../quick-query/QuickQuerySidebar.vue'
// 🔧 第二阶段优化：导入Token用量圆圈组件
import TokenUsageCircle from '../components/TokenUsageCircle.vue'
// 会话管理组件
import ConversationTabs from '../components/ConversationTabs.vue'
// 🎯 右侧面板已移除
import type { FullscreenState, ToolCallState, RenderedComponent } from '../types/aiAssistant'
// 🎯 专家选择已移除

// ==================== Props ====================
interface Props {
  // 布局状态
  fullscreenState: FullscreenState
  isWorkflowTransparent: boolean
  leftSidebarCollapsed: boolean
  showShortcuts?: boolean  // 是否显示快捷键提示
  // 工作流状态
  activeStepQueues: string[]

  // 🎯 专家选择已移除，改为快捷查询

  // 工具状态
  toolCalls: ToolCallState[]
  renderedComponents: RenderedComponent[]

  // 主题状态
  currentTheme: string

  // AI连接状态
  aiConnected?: boolean
  connectionStatus?: string
  connectionStatusText?: string
}

const props = defineProps<Props>()

// ==================== Emits ====================
interface Emits {
  // 布局事件
  'toggle-left-sidebar': []
  'toggle-fullscreen': []
  'toggle-theme': []

  // 统计和清空事件
  'show-statistics': []
  'show-clear-options': []

  // 快捷查询事件
  'select-query': [query: any]

  // 工作流事件
  'step-queue-close': [queueId: string]
  'step-queue-cancel': [queueId: string]
  'step-queue-retry': [queueId: string]

  // 组件事件
  'select-component': [component: any]
}

const emit = defineEmits<Emits>()

// ==================== ESC键提示状态 ====================
const showEscHint = ref(false)

// 检查是否首次进入全屏
onMounted(() => {
  const hasSeenHint = localStorage.getItem('ai-esc-hint-seen')
  if (!hasSeenHint) {
    // 延迟2秒显示提示
    setTimeout(() => {
      showEscHint.value = true
    }, 2000)
  }
})

// 关闭提示
const closeEscHint = () => {
  showEscHint.value = false
  localStorage.setItem('ai-esc-hint-seen', 'true')
}

// ==================== 事件处理 ====================
const toggleLeftSidebar = () => emit('toggle-left-sidebar')
const toggleFullscreen = () => emit('toggle-fullscreen')
const toggleTheme = () => emit('toggle-theme')
const showStatistics = () => emit('show-statistics')
const showClearOptions = () => emit('show-clear-options')

const handleSelectQuery = (query: any) => emit('select-query', query)

const handleStepQueueClose = (queueId: string) => emit('step-queue-close', queueId)
const handleStepQueueCancel = (queueId: string) => emit('step-queue-cancel', queueId)
const handleStepQueueRetry = (queueId: string) => emit('step-queue-retry', queueId)

const handleSelectComponent = (component: any) => emit('select-component', component)
</script>

<style lang="scss">
/* 导入全屏布局样式（非scoped，以便应用到所有子元素） */
// design-tokens 已通过 vite.config 全局注入
@use '../styles/fullscreen-layout.scss';

// 左侧容器样式
.left-sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
}
</style>
