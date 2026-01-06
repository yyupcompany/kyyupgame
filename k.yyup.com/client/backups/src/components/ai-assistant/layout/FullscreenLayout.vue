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

    <!-- 🎯 1️⃣ 全局顶部导航 - 固定在最顶部 -->
    <div class="global-header">
      <div class="header-left">
        <div class="header-logo">
          <!-- 🎨 AI助手品牌视觉标识 -->
          <div class="ai-brand-container">
            <div class="ai-logo-wrapper">
              <el-icon class="logo-icon"><ServiceIcon /></el-icon>
              <!-- <div class="ai-pulse-ring"></div> -->
              <!-- <div class="ai-glow-effect"></div> -->
            </div>
            <div class="ai-brand-info">
              <h2 class="center-title">
                YY-AI助手
                <span class="ai-version-badge">v2.0</span>
              </h2>
              <div class="ai-tagline">智能幼教管理专家</div>
            </div>
          </div>
          <!-- AI连接状态指示器 - 已隐藏 -->
          <!-- <div class="connection-status" :title="connectionStatusText || 'AI服务状态'">
            <el-icon class="connection-icon">
              <Connection />
            </el-icon>
            <div class="connection-text">
              {{ connectionStatusText || '未连接' }}
            </div>
            <div
              class="connection-dot"
              :class="{
                'connected': aiConnected,
                'connecting': connectionStatus === 'connecting',
                'disconnected': !aiConnected && connectionStatus !== 'connecting'
              }"
            ></div>
          </div> -->
        </div>
      </div>
      <div class="header-actions">
        <!-- 🔧 第二阶段优化：Token用量圆圈 -->
        <TokenUsageCircle
          :size="36"
          :stroke-width="3"
          :fontSize="11"
          tooltip-position="bottom"
          :animate-on-change="true"
          :update-interval="30000"
          class="token-usage-indicator-fullscreen"
        />

        <!-- 🧪 测试HTML预览按钮 -->
        <!-- 测试预览按钮已隐藏 -->
        <el-button size="small" @click="showStatistics" title="查看统计" class="action-btn">
          <el-icon><TrendCharts /></el-icon>
        </el-button>
        <el-button size="small" @click="showClearOptions" title="清空对话" class="action-btn">
          <el-icon><Delete /></el-icon>
        </el-button>
        <el-button size="small" @click="toggleTheme" :title="currentTheme === 'theme-dark' ? '切换到明亮主题' : '切换到暗黑主题'" class="action-btn theme-toggle">
          <el-icon v-if="currentTheme === 'theme-dark'"><Sunny /></el-icon>
          <el-icon v-else><Moon /></el-icon>
        </el-button>
        <el-button size="small" @click="toggleFullscreen" title="返回主界面 (ESC)" class="action-btn exit-btn-enhanced">
          <UnifiedIcon name="close" :size="16" />
          <span class="exit-text">返回主界面</span>
        </el-button>
      </div>
    </div>

    <!-- 🆕 ESC键提示（首次进入时显示） -->
    <Transition name="fade">
      <div v-if="showEscHint" class="esc-hint-overlay">
        <div class="esc-hint-card">
          <el-icon class="hint-icon"><InfoFilled /></el-icon>
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
      <!-- 2️⃣ 左侧快捷查询面板 -->
      <QuickQuerySidebar
        :collapsed="leftSidebarCollapsed"
        @toggle="toggleLeftSidebar"
        @select-query="handleSelectQuery"
      />

      <!-- 3️⃣ 中心对话区域 -->
      <div class="center-main">
        <slot name="chat-container" />
      </div>

      <!-- 🎯 右侧面板已移除，所有内容在中间对话框显示 -->
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
// 🎯 右侧面板已移除
import type { FullscreenState, ToolCallState, RenderedComponent } from '../types/aiAssistant'
// 🎯 专家选择已移除

// ==================== Props ====================
interface Props {
  // 布局状态
  fullscreenState: FullscreenState
  isWorkflowTransparent: boolean
  leftSidebarCollapsed: boolean
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
@import '@/styles/design-tokens.scss';
</style>
