<template>
  <div 
    v-if="queue && isVisible" 
    class="workflow-step-queue"
    :class="{ 'collapsed': isCollapsed }"
  >
    <!-- 队列头部 -->
    <div class="queue-header" @click="toggleCollapse">
      <div class="queue-info">
        <div class="queue-title">
          <span class="status-icon">{{ getStatusIcon(queue.status) }}</span>
          {{ queue.title }}
        </div>
        <div class="queue-meta">
          <span class="estimated-time" v-if="estimatedRemainingTime > 0">
            ⏱️ 预计{{ formatDuration(estimatedRemainingTime) }}
          </span>
          <span class="progress-info">
            {{ completedSteps }}/{{ queue.steps.length }} 步骤
          </span>
        </div>
      </div>
      <div class="queue-controls">
        <el-button 
          v-if="queue.status === 'running'" 
          size="small" 
          type="warning" 
          @click.stop="cancelWorkflow"
        >
          取消
        </el-button>
        <el-button 
          size="small" 
          :icon="isCollapsed ? ArrowDown : ArrowUp"
          @click.stop="toggleCollapse"
        />
        <el-button 
          size="small" 
          :icon="Close"
          @click.stop="closeQueue"
        />
      </div>
    </div>

    <!-- 总体进度条 -->
    <div v-if="!isCollapsed" class="overall-progress">
      <el-progress 
        :percentage="overallProgress" 
        :status="getProgressStatus(queue.status)"
        :show-text="false"
        :stroke-width="4"
      />
    </div>

    <!-- 步骤列表 -->
    <div v-if="!isCollapsed" class="steps-container">
      <div 
        v-for="(step, index) in queue.steps" 
        :key="step.id"
        class="step-item"
        :class="{ 
          'current': index === queue.currentStepIndex,
          'completed': step.status === 'completed',
          'failed': step.status === 'failed',
          'running': step.status === 'running'
        }"
      >
        <div class="step-icon">
          <span v-if="step.status === 'completed'">✅</span>
          <span v-else-if="step.status === 'failed'">❌</span>
          <span v-else-if="step.status === 'running'">🔄</span>
          <span v-else-if="step.status === 'skipped'">⏭️</span>
          <span v-else>⏳</span>
        </div>
        
        <div class="step-content">
          <div class="step-title">{{ step.title }}</div>
          <div class="step-description">{{ step.description }}</div>
          
          <!-- 步骤详细信息：支持运行中/已完成/失败时展示 narrtion 文本 -->
          <div v-if="step.details" class="step-details" :class="step.status">
            {{ step.details }}
          </div>

          <!-- 步骤进度条 -->
          <div v-if="step.status === 'running' && step.progress !== undefined" class="step-progress">
            <el-progress 
              :percentage="step.progress" 
              :show-text="false"
              :stroke-width="3"
              size="small"
            />
          </div>
          
          <!-- 错误信息 -->
          <div v-if="step.status === 'failed' && step.error" class="step-error">
            <el-alert 
              :title="step.error" 
              type="error" 
              size="small" 
              :closable="false"
            />
          </div>
          
          <!-- 步骤耗时 -->
          <div v-if="step.actualDuration" class="step-duration">
            耗时: {{ formatDuration(step.actualDuration) }}
            <span v-if="step.estimatedDuration" class="duration-comparison">
              (预计{{ formatDuration(step.estimatedDuration) }})
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 队列完成信息 -->
    <div v-if="!isCollapsed && queue.status === 'completed'" class="completion-info">
      <el-alert 
        title="🎉 工作流已完成！" 
        type="success" 
        :closable="false"
      >
        <template #default>
          总耗时: {{ formatDuration(queue.totalActualDuration || 0) }}
          <span v-if="queue.totalEstimatedDuration">
            (预计{{ formatDuration(queue.totalEstimatedDuration) }})
          </span>
        </template>
      </el-alert>
    </div>

    <!-- 队列失败信息 -->
    <div v-if="!isCollapsed && queue.status === 'failed'" class="failure-info">
      <el-alert 
        title="❌ 工作流执行失败" 
        type="error" 
        :closable="false"
      >
        <template #default>
          <el-button size="small" type="primary" @click="retryWorkflow">
            重试
          </el-button>
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElProgress, ElButton, ElAlert } from 'element-plus'
import { ArrowDown, ArrowUp, Close } from '@element-plus/icons-vue'
import { workflowStepManager, type WorkflowStepQueue } from '@/utils/workflow-steps'

interface Props {
  queueId: string;
  autoHide?: boolean; // 完成后自动隐藏
  autoHideDelay?: number; // 自动隐藏延迟（毫秒）
}

const props = withDefaults(defineProps<Props>(), {
  autoHide: true,
  autoHideDelay: 5000
})

const emit = defineEmits<{
  close: [queueId: string];
  cancel: [queueId: string];
  retry: [queueId: string];
}>()

// 响应式数据
const queue = ref<WorkflowStepQueue | undefined>()
const isVisible = ref(true)
const isCollapsed = ref(false)
const estimatedRemainingTime = ref(0)
const updateTimer = ref<number | null>(null)

// 计算属性
const completedSteps = computed(() => {
  if (!queue.value) return 0
  return queue.value.steps.filter(step => step.status === 'completed').length
})

const overallProgress = computed(() => {
  if (!queue.value || queue.value.steps.length === 0) return 0
  return Math.round((completedSteps.value / queue.value.steps.length) * 100)
})

// 方法
const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'running': return '🔄'
    case 'completed': return '✅'
    case 'failed': return '❌'
    case 'cancelled': return '🚫'
    default: return '⏳'
  }
}

const getProgressStatus = (status: string): string => {
  switch (status) {
    case 'completed': return 'success'
    case 'failed': return 'exception'
    default: return ''
  }
}

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${Math.round(ms / 1000)}秒`
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.round((ms % 60000) / 1000)
  return `${minutes}分${seconds}秒`
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const closeQueue = () => {
  isVisible.value = false
  emit('close', props.queueId)
}

const cancelWorkflow = () => {
  workflowStepManager.cancelQueue(props.queueId)
  emit('cancel', props.queueId)
}

const retryWorkflow = () => {
  emit('retry', props.queueId)
}

const updateEstimatedTime = () => {
  if (queue.value?.status === 'running') {
    estimatedRemainingTime.value = workflowStepManager.getEstimatedRemainingTime(props.queueId)
  } else {
    estimatedRemainingTime.value = 0
  }
}

// 监听队列变化
let unsubscribe: (() => void) | null = null

onMounted(() => {
  // 获取初始队列状态
  queue.value = workflowStepManager.getQueue(props.queueId)
  
  // 监听队列变化
  unsubscribe = workflowStepManager.onQueueChange(props.queueId, (updatedQueue) => {
    queue.value = updatedQueue
    updateEstimatedTime()
  })
  
  // 定时更新预计时间
  updateTimer.value = window.setInterval(updateEstimatedTime, 1000)
  updateEstimatedTime()
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
  if (updateTimer.value) {
    clearInterval(updateTimer.value)
  }
})

// 监听队列完成状态，自动隐藏
watch(() => queue.value?.status, (newStatus) => {
  if (props.autoHide && (newStatus === 'completed' || newStatus === 'failed')) {
    setTimeout(() => {
      if (queue.value?.status === newStatus) { // 确保状态没有变化
        closeQueue()
      }
    }, props.autoHideDelay)
  }
})
</script>

<style scoped lang="scss">
.workflow-step-queue {
  position: fixed;
  top: var(--spacing-xl);
  right: var(--spacing-xl);
  width: 100%; max-width: 400px;
  max-width: 90vw;
  background: var(--white-alpha-95);
  backdrop-filter: blur(10px);
  border-radius: var(--text-sm);
  box-shadow: 0 var(--spacing-sm) var(--spacing-3xl) var(--shadow-light);
  border: var(--border-width) solid var(--glass-bg-heavy);
  z-index: var(--z-index-dropdown)2; // 高于AI助手
  animation: slideInFromTop 0.3s ease-out;
  
  &.collapsed {
    .steps-container,
    .overall-progress,
    .completion-info,
    .failure-info {
      display: none;
    }
  }
}

.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-lg);
  border-bottom: var(--z-index-dropdown) solid var(--shadow-light);
  cursor: pointer;
  
  &:hover {
    background: var(--black-alpha-2);
  }
}

.queue-info {
  flex: 1;
}

.queue-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-xs);
  
  .status-icon {
    margin-right: var(--spacing-sm);
    animation: spin 2s linear infinite;
  }
}

.queue-meta {
  font-size: var(--text-sm);
  color: var(--el-text-color-secondary);
  display: flex;
  gap: var(--text-sm);
}

.queue-controls {
  display: flex;
  gap: var(--spacing-sm);
}

.overall-progress {
  padding: 0 var(--text-lg) var(--text-lg);
}

.steps-container {
  max-min-height: 60px; height: auto;
  overflow-y: auto;
  padding: 0 var(--text-lg);
}

.step-item {
  display: flex;
  gap: var(--text-sm);
  padding: var(--text-sm) 0;
  border-bottom: var(--z-index-dropdown) solid var(--shadow-lighter);
  
  &:last-child {
    border-bottom: none;
  }
  
  &.current {
    background: rgba(64, 158, 255, 0.05);
    border-radius: var(--spacing-sm);
    padding: var(--text-sm);
    margin: 0 -var(--text-sm);
  }
  
  &.completed {
    opacity: 0.7;
  }
  
  &.failed {
    background: rgba(245, 108, 108, 0.05);
    border-radius: var(--spacing-sm);
    padding: var(--text-sm);
    margin: 0 -var(--text-sm);
  }
}

.step-icon {
  font-size: var(--text-lg);
  width: var(--spacing-xl);
  text-align: center;
  margin-top: var(--spacing-sm);
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-xs);
}

.step-description {
  font-size: var(--text-sm);
  color: var(--el-text-color-secondary);
  margin-bottom: var(--spacing-sm);
}

.step-details {
  font-size: var(--text-sm);
  color: var(--el-color-primary);
  margin-bottom: var(--spacing-sm);
  font-style: italic;
}

.step-progress {
  margin-bottom: var(--spacing-sm);
}

.step-error {
  margin-bottom: var(--spacing-sm);
}

.step-duration {
  font-size: var(--text-xs);
  color: var(--el-text-color-placeholder);
  
  .duration-comparison {
    opacity: 0.7;
  }
}

.completion-info,
.failure-info {
  padding: var(--text-lg);
}

// 动画
@keyframes slideInFromTop {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 暗色模式
.dark .workflow-step-queue {
  background: rgba(0, 0, 0, 0.95);
  border: var(--border-width) solid var(--glass-bg-light);
}

// 移动端适配
@media (max-width: var(--breakpoint-md)) {
  .workflow-step-queue {
    width: calc(100vw - 40px);
    right: var(--spacing-xl);
    left: var(--spacing-xl);
  }
}
</style>
