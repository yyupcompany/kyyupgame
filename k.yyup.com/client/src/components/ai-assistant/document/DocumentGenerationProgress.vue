<template>
  <div class="document-generation-progress">
    <!-- 进度标题 -->
    <div class="progress-header">
      <div class="progress-icon">
        <UnifiedIcon name="ai-center" />
      </div>
      <div class="progress-title">
        <h4>{{ documentType }}生成中...</h4>
        <p class="progress-subtitle">{{ currentStep }}</p>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="progress-bar-container">
      <el-progress
        :percentage="progress"
        :color="progressColor"
        :stroke-width="8"
        :show-text="true"
      >
        <template #default="{ percentage }">
          <span class="progress-text">{{ percentage }}%</span>
        </template>
      </el-progress>
    </div>

    <!-- 步骤列表 -->
    <div class="progress-steps">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="progress-step"
        :class="{
          'step-completed': step.status === 'completed',
          'step-active': step.status === 'active',
          'step-pending': step.status === 'pending'
        }"
      >
        <div class="step-icon">
          <UnifiedIcon name="Check" />
          <UnifiedIcon name="ai-center" />
          <UnifiedIcon name="ai-center" />
        </div>
        <div class="step-content">
          <div class="step-name">{{ step.name }}</div>
          <div v-if="step.status === 'active'" class="step-detail">{{ step.detail }}</div>
        </div>
        <div v-if="step.duration" class="step-duration">{{ step.duration }}</div>
      </div>
    </div>

    <!-- 预计剩余时间 -->
    <div v-if="estimatedTime" class="estimated-time">
      <UnifiedIcon name="ai-center" />
      <span>预计剩余时间: {{ estimatedTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface ProgressStep {
  name: string
  status: 'pending' | 'active' | 'completed'
  detail?: string
  duration?: string
  startTime?: number
  endTime?: number
}

interface Props {
  documentType: string
  toolName: string
  startTime?: number
}

const props = withDefaults(defineProps<Props>(), {
  documentType: '文档',
  toolName: 'generate_document'
})

// 进度状态
const progress = ref(0)
const currentStep = ref('准备生成...')
const estimatedTime = ref('')

// 步骤定义
const steps = ref<ProgressStep[]>([
  { name: '分析需求', status: 'pending', detail: '正在分析文档生成需求...' },
  { name: 'AI内容生成', status: 'pending', detail: '正在生成文档内容...' },
  { name: '数据查询', status: 'pending', detail: '正在查询相关数据...' },
  { name: '文档格式化', status: 'pending', detail: '正在格式化文档...' },
  { name: '文件保存', status: 'pending', detail: '正在保存文件...' }
])

// 进度颜色
const progressColor = computed(() => {
  if (progress.value < 30) return 'var(--primary-color)'
  if (progress.value < 70) return 'var(--success-color)'
  return 'var(--warning-color)'
})

// 定时器
let progressTimer: NodeJS.Timeout | null = null
let stepTimer: NodeJS.Timeout | null = null

// 模拟进度更新
const updateProgress = () => {
  // 根据文档类型设置不同的进度速度
  const speeds = {
    'Word': 85,
    'PPT': 90,
    'Excel': 60,
    'PDF': 150
  }
  
  const totalTime = speeds[props.documentType as keyof typeof speeds] || 90
  const stepDuration = totalTime / steps.value.length
  
  let currentStepIndex = 0
  let stepProgress = 0
  
  progressTimer = setInterval(() => {
    // 更新总进度
    if (progress.value < 95) {
      progress.value += 1
      
      // 更新当前步骤
      const newStepIndex = Math.floor(progress.value / (100 / steps.value.length))
      if (newStepIndex !== currentStepIndex && newStepIndex < steps.value.length) {
        // 完成上一步
        if (currentStepIndex < steps.value.length) {
          steps.value[currentStepIndex].status = 'completed'
          steps.value[currentStepIndex].endTime = Date.now()
          if (steps.value[currentStepIndex].startTime) {
            const duration = Math.round((steps.value[currentStepIndex].endTime! - steps.value[currentStepIndex].startTime!) / 1000)
            steps.value[currentStepIndex].duration = `${duration}秒`
          }
        }
        
        // 开始新步骤
        currentStepIndex = newStepIndex
        if (currentStepIndex < steps.value.length) {
          steps.value[currentStepIndex].status = 'active'
          steps.value[currentStepIndex].startTime = Date.now()
          currentStep.value = steps.value[currentStepIndex].detail || steps.value[currentStepIndex].name
        }
      }
      
      // 更新预计剩余时间
      const remainingProgress = 100 - progress.value
      const remainingTime = Math.round((remainingProgress / 100) * totalTime)
      if (remainingTime > 0) {
        estimatedTime.value = remainingTime > 60 
          ? `${Math.floor(remainingTime / 60)}分${remainingTime % 60}秒`
          : `${remainingTime}秒`
      } else {
        estimatedTime.value = ''
      }
    }
  }, totalTime * 10) // 每秒更新一次
}

// 完成进度
const completeProgress = () => {
  progress.value = 100
  steps.value.forEach(step => {
    if (step.status !== 'completed') {
      step.status = 'completed'
    }
  })
  currentStep.value = '生成完成！'
  estimatedTime.value = ''
  
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

// 生命周期
onMounted(() => {
  // 延迟启动进度模拟
  setTimeout(() => {
    steps.value[0].status = 'active'
    steps.value[0].startTime = Date.now()
    currentStep.value = steps.value[0].detail || steps.value[0].name
    updateProgress()
  }, 500)
})

onUnmounted(() => {
  if (progressTimer) {
    clearInterval(progressTimer)
  }
  if (stepTimer) {
    clearInterval(stepTimer)
  }
})

// 暴露方法给父组件
defineExpose({
  completeProgress
})
</script>

<style scoped lang="scss">
// design-tokens 已通过 vite.config 全局注入
.document-generation-progress {
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, var(--bg-container) 0%, #c3cfe2 100%);
  border-radius: var(--text-sm);
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  .progress-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--icon-size); height: var(--icon-size);
    background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
    border-radius: var(--radius-full);
    color: var(--text-on-primary);
  }
  
  .progress-title {
    flex: 1;
    
    h4 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .progress-subtitle {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: var(--text-regular);
    }
  }
}

.progress-bar-container {
  margin-bottom: 1.5rem;
  
  .progress-text {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.progress-steps {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: var(--spacing-sm);
  background: white;
  border-radius: var(--spacing-sm);
  transition: all var(--transition-normal) ease;
  
  &.step-completed {
    opacity: 0.7;
  }
  
  &.step-active {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    box-shadow: 0 2px var(--spacing-sm) rgba(33, 150, 243, 0.2);
  }
  
  &.step-pending {
    opacity: 0.5;
  }
  
  .step-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--spacing-3xl);
    height: var(--spacing-3xl);
    flex-shrink: 0;
  }
  
  .step-content {
    flex: 1;
    
    .step-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .step-detail {
      margin-top: 0.25rem;
      font-size: 0.75rem;
      color: var(--info-color);
    }
  }
  
  .step-duration {
    font-size: 0.75rem;
    color: var(--success-color);
    font-weight: 500;
  }
}

.estimated-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: var(--spacing-sm);
  background: var(--white-alpha-80);
  border-radius: var(--spacing-sm);
  font-size: 0.875rem;
  color: var(--text-regular);
  
  .el-icon {
    color: var(--primary-color);
  }
}

.rotating {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

