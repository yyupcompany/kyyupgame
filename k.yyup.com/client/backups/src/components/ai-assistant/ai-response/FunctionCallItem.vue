<!--
  函数调用项组件
  从 AIAssistant.vue 第130-153行模板提取单个工具调用项
-->

<template>
  <StepBlock
    :description="getStepDescription()"
    :subtitle="getStepSubtitle()"
    :icon="getStepIcon()"
    :icon-class="getIconClass()"
    :default-expanded="functionCall.status === 'completed' || functionCall.status === 'failed'"
    :has-content="hasExpandableContent()"
  >
    <template #content>
      <div class="function-call-details">
        <!-- 工具意图描述 -->
        <div v-if="functionCall.intent" class="function-intent">
          <el-icon><BulbFilled /></el-icon>
          <span>{{ functionCall.intent }}</span>
        </div>

        <!-- 执行步骤 -->
        <div v-if="functionCall.executionSteps && functionCall.executionSteps.length > 0" class="execution-steps">
          <div class="steps-header">
            <el-icon><List /></el-icon>
            <span>执行步骤</span>
          </div>
          <div class="steps-list">
            <div 
              v-for="(step, index) in functionCall.executionSteps" 
              :key="index"
              class="step-item"
              :class="{ active: index === currentStepIndex }"
            >
              <span class="step-number">{{ index + 1 }}</span>
              <span class="step-text">{{ step }}</span>
              <el-icon v-if="index < currentStepIndex" class="step-check"><CircleCheck /></el-icon>
            </div>
          </div>
        </div>

        <!-- 进度条 -->
        <div v-if="functionCall.status === 'running' && showProgress" class="function-progress">
          <el-progress 
            :percentage="progressPercentage" 
            :show-text="false"
            :stroke-width="3"
            :color="progressColor"
          />
        </div>

        <!-- 工具解说 -->
        <div v-if="functionCall.narration && functionCall.status === 'completed'" class="function-narration">
          <div class="narration-header">
            <el-icon><BulbFilled /></el-icon>
            <span>工具解说</span>
          </div>
          <div class="narration-content">
            {{ functionCall.narration }}
          </div>
        </div>

        <!-- 结果预览 -->
        <div v-if="functionCall.result && functionCall.status === 'completed'" class="function-result">
          <div class="result-header">
            <UnifiedIcon name="document" :size="16" />
            <span>执行结果</span>
          </div>
          <div class="result-content">
            <pre v-if="typeof functionCall.result === 'string'">{{ functionCall.result }}</pre>
            <pre v-else>{{ JSON.stringify(functionCall.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="functionCall.status === 'failed'" class="function-error">
          <div class="error-header">
            <el-icon><WarningFilled /></el-icon>
            <span>执行失败</span>
          </div>
          <div class="error-content">
            {{ functionCall.result || '执行过程中发生未知错误' }}
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="function-actions-bar">
          <el-button 
            v-if="functionCall.status === 'completed' || functionCall.status === 'failed'"
            size="small" 
            text
            @click="handleViewDetails"
          >
            <el-icon><View /></el-icon>
            查看详情
          </el-button>
          <el-button 
            v-if="functionCall.status === 'completed' && functionCall.result"
            size="small" 
            text
            @click="handleExportResult"
          >
            <el-icon><Download /></el-icon>
            导出结果
          </el-button>
          <el-button 
            v-if="functionCall.status === 'failed'"
            size="small" 
            text
            @click="handleRetry"
          >
            <el-icon><RefreshRight /></el-icon>
            重新执行
          </el-button>
        </div>

        <!-- 重试指示器 -->
        <div v-if="functionCall.retrying" class="retrying-indicator">
          <el-icon class="retrying-icon"><Loading /></el-icon>
          <span>正在重新执行...</span>
        </div>
      </div>
    </template>
  </StepBlock>

</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Loading,
  CircleCheck,
  CircleClose,
  Clock,
  View,
  Download,
  RefreshRight,
  Sunny as BulbFilled,
  List,
  DocumentCopy,
  WarningFilled,
  Tools,
  Operation
import StepBlock from '../ui/StepBlock.vue'
import type { FunctionCallState } from '../types/aiAssistant'

// ==================== Props ====================
interface Props {
  functionCall: FunctionCallState
  sequence: number
  total: number
  showProgress?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showProgress: true
})

// ==================== Emits ====================
interface Emits {
  'retry': [functionCall: FunctionCallState]
  'view-details': [functionCall: FunctionCallState]
  'export-result': [functionCall: FunctionCallState]
}

const emit = defineEmits<Emits>()

// ==================== 计算属性 ====================
const currentStepIndex = computed(() => {
  if (props.functionCall.status === 'completed') {
    return props.functionCall.executionSteps?.length || 0
  }
  if (props.functionCall.status === 'running') {
    return Math.floor((props.functionCall.executionSteps?.length || 0) * 0.7)
  }
  return 0
})

const progressPercentage = computed(() => {
  if (props.functionCall.status === 'completed') return 100
  if (props.functionCall.status === 'failed') return 0
  if (props.functionCall.status === 'running') {
    const steps = props.functionCall.executionSteps?.length || 4
    return Math.min(90, (currentStepIndex.value / steps) * 100)
  }
  return 0
})

const progressColor = computed(() => {
  if (props.functionCall.status === 'completed') return 'var(--el-color-success)'
  if (props.functionCall.status === 'failed') return 'var(--el-color-danger)'
  return 'var(--el-color-primary)'
})

// ==================== 方法 ====================
const getStatusText = (status: string) => {
  switch (status) {
    case 'running':
      return '执行中'
    case 'completed':
      return '完成'
    case 'failed':
      return '失败'
    default:
      return '等待中'
  }
}

// 🎯 获取步骤描述
const getStepDescription = () => {
  return props.functionCall.description || `工具调用 ${props.sequence}/${props.total}`
}

// 🎯 获取步骤副标题
const getStepSubtitle = () => {
  const statusText = getStatusText(props.functionCall.status)
  return `${statusText} · ${props.functionCall.name || '未知工具'}`
}

// 🎯 获取步骤图标
const getStepIcon = () => {
  if (props.functionCall.status === 'running') return Loading
  if (props.functionCall.status === 'completed') return CircleCheck
  if (props.functionCall.status === 'failed') return CircleClose
  return Tools
}

// 🎯 获取图标样式类（返回字符串，不是对象）
const getIconClass = () => {
  if (props.functionCall.status === 'running') return 'icon-running'
  if (props.functionCall.status === 'completed') return 'icon-success'
  if (props.functionCall.status === 'failed') return 'icon-failed'
  return 'icon-pending'
}

// 🎯 判断是否有可展开的内容
const hasExpandableContent = () => {
  return !!(
    props.functionCall.intent ||
    (props.functionCall.executionSteps && props.functionCall.executionSteps.length > 0) ||
    props.functionCall.narration ||
    props.functionCall.result ||
    props.functionCall.status === 'failed'
  )
}

// ==================== 事件处理 ====================
const handleRetry = () => {
  emit('retry', props.functionCall)
}

const handleViewDetails = () => {
  emit('view-details', props.functionCall)
}

const handleExportResult = () => {
  emit('export-result', props.functionCall)
}
</script>

<style scoped lang="scss">
// 🎯 步骤块内的详情样式
.function-call-details {
  display: flex;
  flex-direction: column;
  gap: var(--text-sm);
}

// 🎯 图标样式类
:deep(.step-icon) {
  &.icon-running {
    color: var(--el-color-primary);
    animation: spin 1s linear infinite;
  }

  &.icon-success {
    color: var(--el-color-success);
  }

  &.icon-failed {
    color: var(--el-color-danger);
  }

  &.icon-pending {
    color: var(--el-text-color-secondary);
  }
}

.function-intent {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--text-sm);
  background: var(--el-color-info-light-9);
  border-radius: var(--spacing-sm);
  font-size: var(--text-sm);
  color: var(--el-color-info);
}

.function-narration {
  padding: var(--text-sm);
  background: var(--el-color-success-light-9);
  border: var(--border-width-base) solid var(--el-color-success-light-7);
  border-radius: var(--spacing-sm);
  border-left: 3px solid var(--el-color-success);
  margin-bottom: var(--text-sm);
  
  .narration-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
    font-weight: 600;
    color: var(--el-color-success);
    font-size: var(--text-base);
  }
  
  .narration-content {
    color: var(--el-text-color-primary);
    line-height: 1.6;
    font-size: var(--text-sm);
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}

.function-actions-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: var(--border-width-base) solid var(--el-border-color-lighter);
}

.execution-steps {
  margin-bottom: var(--text-sm);
}

.steps-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--el-text-color-regular);
  margin-bottom: var(--spacing-sm);
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.step-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) var(--text-sm);
  background: var(--el-fill-color-light);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  transition: all 0.2s ease;
}

.step-item.active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.step-number {
  width: var(--text-xl);
  height: var(--text-xl);
  background: var(--el-fill-color);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-2xs);
  font-weight: 500;
  flex-shrink: 0;
}

.step-item.active .step-number {
  background: var(--el-color-primary);
  color: white;
}

.step-text {
  flex: 1;
}

.step-check {
  color: var(--el-color-success);
  font-size: var(--text-base);
}

.function-progress {
  margin-bottom: var(--text-sm);
}

.function-result,
.function-error {
  margin-top: var(--text-sm);
}

.result-header,
.error-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  font-size: var(--text-sm);
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
}

.result-header {
  color: var(--el-color-success);
}

.error-header {
  color: var(--el-color-danger);
}

.result-content,
.error-content {
  background: var(--el-fill-color-light);
  border-radius: var(--radius-md);
  padding: var(--text-sm);
  font-size: var(--text-sm);
  max-height: 200px;
  overflow-y: auto;
}

.result-content pre,
.error-content {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.retrying-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--text-sm);
  background: var(--el-color-warning-light-9);
  border-radius: var(--spacing-sm);
  margin-top: var(--text-sm);
  font-size: var(--text-sm);
  color: var(--el-color-warning);
}

.retrying-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .function-call-container {
    padding: var(--text-base);
  }
  
  .function-call-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .function-call-info {
    gap: var(--spacing-2xl);
  }
  
  .function-text {
    font-size: var(--text-base);
  }
}
</style>
