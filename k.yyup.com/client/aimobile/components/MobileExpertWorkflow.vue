<template>
  <div class="mobile-expert-workflow">
    <!-- 工作流头部 -->
    <div class="workflow-header">
      <div class="header-content">
        <h2 class="workflow-title">{{ currentWorkflow?.name || 'AI专家工作流' }}</h2>
        <div class="workflow-status">
          <span :class="['status-badge', statusClass]">
            {{ statusText }}
          </span>
        </div>
      </div>
      
      <!-- 进度条 -->
      <div class="progress-container" v-if="isExecuting">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <span class="progress-text">{{ progress }}%</span>
      </div>
    </div>

    <!-- 专家选择区域 -->
    <div class="expert-selection" v-if="!isExecuting">
      <h3>选择专家团队</h3>
      <div class="expert-grid">
        <div 
          v-for="expert in availableExperts" 
          :key="expert.id"
          :class="['expert-card', { 'selected': selectedExperts.includes(expert.id) }]"
          @click="toggleExpert(expert.id)"
        >
          <div class="expert-icon">{{ getExpertIcon(expert.id) }}</div>
          <div class="expert-info">
            <h4>{{ expert.name }}</h4>
            <p>{{ expert.description }}</p>
          </div>
          <div class="expert-capabilities">
            <span 
              v-for="capability in expert.capabilities.slice(0, 2)" 
              :key="capability"
              class="capability-tag"
            >
              {{ capability }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 任务输入区域 -->
    <div class="task-input" v-if="!isExecuting">
      <h3>描述您的需求</h3>
      <div class="input-container">
        <textarea 
          v-model="taskDescription"
          placeholder="请详细描述您的需求，例如：策划一个30人参加的春游活动，预算1000元..."
          class="task-textarea"
          rows="4"
        ></textarea>
        
        <!-- 语音输入按钮 -->
        <button 
          v-if="voiceInputEnabled"
          :class="['voice-btn', { 'recording': isRecording }]"
          @click="toggleVoiceInput"
        >
          🎤
        </button>
      </div>
      
      <!-- 快速模板 -->
      <div class="quick-templates">
        <h4>快速模板</h4>
        <div class="template-chips">
          <span 
            v-for="template in quickTemplates" 
            :key="template.id"
            class="template-chip"
            @click="applyTemplate(template)"
          >
            {{ template.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- 执行控制区域 -->
    <div class="execution-controls">
      <button 
        v-if="!isExecuting"
        :disabled="!canStart"
        class="start-btn"
        @click="startWorkflow"
      >
        🚀 开始执行
      </button>
      
      <div v-else class="control-buttons">
        <button 
          v-if="!isPaused"
          class="pause-btn"
          @click="pauseWorkflow"
        >
          ⏸️ 暂停
        </button>
        
        <button 
          v-else
          class="resume-btn"
          @click="resumeWorkflow"
        >
          ▶️ 继续
        </button>
        
        <button 
          class="stop-btn"
          @click="stopWorkflow"
        >
          ⏹️ 停止
        </button>
      </div>
    </div>

    <!-- 执行过程显示 -->
    <div class="execution-process" v-if="isExecuting || executionResults.length > 0">
      <h3>执行过程</h3>
      <div class="process-timeline">
        <div 
          v-for="(step, index) in executionSteps" 
          :key="step.id"
          :class="['timeline-item', step.status]"
        >
          <div class="timeline-marker">
            <span v-if="step.status === 'completed'">✅</span>
            <span v-else-if="step.status === 'running'">🔄</span>
            <span v-else-if="step.status === 'failed'">❌</span>
            <span v-else>⏳</span>
          </div>
          
          <div class="timeline-content">
            <h4>{{ step.name }}</h4>
            <p>{{ step.description }}</p>
            
            <!-- 专家建议显示 -->
            <div v-if="step.result && step.result.advice" class="expert-advice">
              <div class="advice-header">
                <span class="expert-name">{{ step.result.expert_name }}</span>
                <span class="confidence">置信度: {{ Math.round((step.result.confidence || 0) * 100) }}%</span>
              </div>
              <div class="advice-content" v-html="formatAdvice(step.result.advice)"></div>
            </div>
            
            <!-- 执行时间 -->
            <div v-if="step.executionTime" class="execution-time">
              执行时间: {{ formatTime(step.executionTime) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最终结果 -->
    <div class="final-results" v-if="workflowCompleted && finalResults">
      <h3>🎉 工作流执行完成</h3>
      
      <div class="results-summary">
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-label">成功步骤</span>
            <span class="stat-value">{{ finalResults.completedSteps }}/{{ finalResults.totalSteps }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总耗时</span>
            <span class="stat-value">{{ formatTime(finalResults.metrics?.totalExecutionTime || 0) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">成功率</span>
            <span class="stat-value">{{ Math.round((finalResults.metrics?.successRate || 0) * 100) }}%</span>
          </div>
        </div>
        
        <!-- 关键发现 -->
        <div v-if="finalResults.summary?.keyFindings?.length" class="key-findings">
          <h4>关键发现</h4>
          <ul>
            <li v-for="finding in finalResults.summary.keyFindings" :key="finding">
              {{ finding }}
            </li>
          </ul>
        </div>
        
        <!-- 下一步行动 -->
        <div v-if="finalResults.summary?.nextActions?.length" class="next-actions">
          <h4>建议行动</h4>
          <ul>
            <li v-for="action in finalResults.summary.nextActions" :key="action">
              {{ action }}
            </li>
          </ul>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="result-actions">
        <button class="export-btn" @click="exportResults">
          📄 导出结果
        </button>
        <button class="share-btn" @click="shareResults">
          📤 分享结果
        </button>
        <button class="new-workflow-btn" @click="startNewWorkflow">
          🔄 新建工作流
        </button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ error }}</span>
        <button class="error-close" @click="clearError">✕</button>
      </div>
    </div>

    <!-- 触觉反馈指示器 -->
    <div v-if="hapticFeedbackEnabled && showHapticIndicator" class="haptic-indicator">
      📳 触觉反馈
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMobileAgentsStore } from '../stores/mobile-agents'
import { useMobileWorkflowStore } from '../stores/mobile-workflow'
import { MobileWorkflowEngine } from '../services/mobile-workflow-engine.service'
import { MOBILE_SMART_EXPERTS } from '../types/mobile-agents'
import type { AgentType, WorkflowDefinition, WorkflowResults } from '../types/mobile-workflow'

// ==================== 响应式数据 ====================

const mobileAgentsStore = useMobileAgentsStore()
const mobileWorkflowStore = useMobileWorkflowStore()
const workflowEngine = new MobileWorkflowEngine()

// 工作流状态
const isExecuting = ref(false)
const isPaused = ref(false)
const progress = ref(0)
const currentWorkflow = ref<WorkflowDefinition | null>(null)
const executionSteps = ref<any[]>([])
const executionResults = ref<any[]>([])
const finalResults = ref<WorkflowResults | null>(null)
const error = ref<string>('')

// 专家选择
const selectedExperts = ref<AgentType[]>(['activity_planner'])
const availableExperts = computed(() => Object.values(MOBILE_SMART_EXPERTS))

// 任务输入
const taskDescription = ref('')
const isRecording = ref(false)
const voiceInputEnabled = ref(true)

// 移动端特性
const hapticFeedbackEnabled = ref(true)
const showHapticIndicator = ref(false)

// 快速模板
const quickTemplates = ref([
  { id: 1, name: '活动策划', template: '策划一个{人数}人参加的{活动类型}，预算{预算}元' },
  { id: 2, name: '招生方案', template: '制定{目标}的招生营销方案，重点关注{重点}' },
  { id: 3, name: '课程设计', template: '为{年龄段}儿童设计{课程类型}课程，时长{时长}' },
  { id: 4, name: '成本分析', template: '分析{项目}的成本构成和优化建议' }
])

// ==================== 计算属性 ====================

const canStart = computed(() => {
  return selectedExperts.value.length > 0 && taskDescription.value.trim().length > 0
})

const statusClass = computed(() => {
  if (isExecuting.value) return isPaused.value ? 'paused' : 'running'
  if (workflowCompleted.value) return 'completed'
  if (error.value) return 'error'
  return 'idle'
})

const statusText = computed(() => {
  if (isExecuting.value) return isPaused.value ? '已暂停' : '执行中'
  if (workflowCompleted.value) return '已完成'
  if (error.value) return '执行失败'
  return '待执行'
})

const workflowCompleted = computed(() => {
  return finalResults.value !== null
})

// ==================== 方法 ====================

const toggleExpert = (expertId: AgentType) => {
  const index = selectedExperts.value.indexOf(expertId)
  if (index > -1) {
    selectedExperts.value.splice(index, 1)
  } else {
    selectedExperts.value.push(expertId)
  }
  
  // 触觉反馈
  if (hapticFeedbackEnabled.value && navigator.vibrate) {
    navigator.vibrate(50)
  }
}

const getExpertIcon = (expertId: AgentType): string => {
  const icons = {
    'activity_planner': '🎯',
    'marketing_expert': '📈',
    'education_expert': '🎓',
    'cost_analyst': '💰',
    'risk_assessor': '🛡️',
    'creative_designer': '🎨',
    'curriculum_expert': '📚'
  }
  return icons[expertId] || '🤖'
}

const applyTemplate = (template: any) => {
  taskDescription.value = template.template
  
  // 触觉反馈
  if (hapticFeedbackEnabled.value && navigator.vibrate) {
    navigator.vibrate(100)
  }
}

const toggleVoiceInput = () => {
  if (isRecording.value) {
    stopVoiceInput()
  } else {
    startVoiceInput()
  }
}

const startVoiceInput = () => {
  // 语音输入实现
  isRecording.value = true
  console.log('🎤 开始语音输入')
  
  // 触觉反馈
  if (hapticFeedbackEnabled.value && navigator.vibrate) {
    navigator.vibrate([100, 50, 100])
  }
}

const stopVoiceInput = () => {
  isRecording.value = false
  console.log('🎤 停止语音输入')
}

const startWorkflow = async () => {
  try {
    error.value = ''
    isExecuting.value = true
    progress.value = 0
    executionSteps.value = []
    executionResults.value = []
    finalResults.value = null
    
    // 创建工作流定义
    currentWorkflow.value = createWorkflowDefinition()
    
    // 触觉反馈
    if (hapticFeedbackEnabled.value && navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
    
    // 执行工作流
    const results = await workflowEngine.executeWorkflow(currentWorkflow.value, {
      enableHapticFeedback: hapticFeedbackEnabled.value,
      maxConcurrentSteps: 2,
      performanceMode: 'normal'
    })
    
    finalResults.value = results
    
    // 完成触觉反馈
    if (hapticFeedbackEnabled.value && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 100])
    }
    
  } catch (err: any) {
    error.value = err.message || '工作流执行失败'
    
    // 错误触觉反馈
    if (hapticFeedbackEnabled.value && navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
  } finally {
    isExecuting.value = false
    progress.value = 100
  }
}

const pauseWorkflow = async () => {
  isPaused.value = true
  await workflowEngine.pauseWorkflow()
}

const resumeWorkflow = async () => {
  isPaused.value = false
  await workflowEngine.resumeWorkflow()
}

const stopWorkflow = async () => {
  isExecuting.value = false
  isPaused.value = false
  await workflowEngine.stopWorkflow()
}

const createWorkflowDefinition = (): WorkflowDefinition => {
  const steps = selectedExperts.value.map((expertId, index) => ({
    id: `step_${index + 1}`,
    name: MOBILE_SMART_EXPERTS[expertId].name,
    description: `调用${MOBILE_SMART_EXPERTS[expertId].name}分析任务`,
    type: 'agent' as const,
    agent: {
      type: expertId,
      task: taskDescription.value,
      context: `移动端工作流执行 - ${new Date().toISOString()}`
    },
    dependencies: index > 0 ? [`step_${index}`] : [],
    timeout: 30000
  }))
  
  return {
    id: `mobile_workflow_${Date.now()}`,
    name: '移动端AI专家工作流',
    description: taskDescription.value,
    steps,
    metadata: {
      platform: 'mobile',
      selectedExperts: selectedExperts.value,
      createdAt: new Date().toISOString()
    }
  }
}

const formatAdvice = (advice: string): string => {
  // 简单的Markdown格式化
  return advice
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  
  if (minutes > 0) {
    return `${minutes}分${seconds % 60}秒`
  }
  return `${seconds}秒`
}

const exportResults = () => {
  // 导出结果实现
  console.log('📄 导出结果')
}

const shareResults = () => {
  // 分享结果实现
  console.log('📤 分享结果')
}

const startNewWorkflow = () => {
  // 重置状态
  currentWorkflow.value = null
  executionSteps.value = []
  executionResults.value = []
  finalResults.value = null
  error.value = ''
  taskDescription.value = ''
  selectedExperts.value = ['activity_planner']
  progress.value = 0
}

const clearError = () => {
  error.value = ''
}

// ==================== 生命周期 ====================

onMounted(() => {
  console.log('📱 移动端专家工作流组件已加载')
})

onUnmounted(() => {
  // 清理资源
  if (isExecuting.value) {
    stopWorkflow()
  }
})
</script>

<style scoped>
.mobile-expert-workflow {
  padding: var(--spacing-md);
  max-width: 100%;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 100vh;
}

.workflow-header {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: var(--spacing-md);
  box-shadow: 0 2px var(--spacing-sm) rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.workflow-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.idle { background: #e9ecef; color: #6c757d; }
.status-badge.running { background: #d4edda; color: #155724; }
.status-badge.paused { background: #fff3cd; color: #856404; }
.status-badge.completed { background: #d1ecf1; color: #0c5460; }
.status-badge.error { background: #f8d7da; color: #721c24; }

.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: var(--spacing-sm);
  background: #e9ecef;
  border-radius: var(--spacing-xs);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 1var(--spacing-xs);
  font-weight: 500;
  color: #495057;
  min-width: 40px;
}

.expert-selection, .task-input, .execution-process, .final-results {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: var(--spacing-md);
  box-shadow: 0 2px var(--spacing-sm) rgba(0,0,0,0.1);
}

.expert-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: var(--spacing-md);
}

.expert-card {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.expert-card:hover {
  border-color: #007bff;
  transform: translateY(-2px);
}

.expert-card.selected {
  border-color: #007bff;
  background: #f8f9ff;
}

.expert-icon {
  font-size: 2var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.expert-info h4 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--spacing-md);
  color: #2c3e50;
}

.expert-info p {
  margin: 0;
  font-size: 1var(--spacing-xs);
  color: #6c757d;
  line-height: 1.4;
}

.expert-capabilities {
  margin-top: 12px;
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.capability-tag {
  background: #e9ecef;
  color: #495057;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 12px;
  font-size: 12px;
}

.input-container {
  position: relative;
  margin-top: var(--spacing-md);
}

.task-textarea {
  width: 100%;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: var(--spacing-md);
  font-size: var(--spacing-md);
  line-height: 1.5;
  resize: vertical;
  min-height: 120px;
}

.task-textarea:focus {
  outline: none;
  border-color: #007bff;
}

.voice-btn {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--radius-full);
  background: #007bff;
  color: white;
  font-size: 1var(--spacing-sm);
  cursor: pointer;
  transition: all 0.3s ease;
}

.voice-btn:hover {
  background: #0056b3;
  transform: scale(1.1);
}

.voice-btn.recording {
  background: #dc3545;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.quick-templates {
  margin-top: 20px;
}

.template-chips {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  margin-top: 12px;
}

.template-chip {
  background: #f8f9fa;
  border: var(--border-width-base) solid #dee2e6;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 20px;
  font-size: 1var(--spacing-xs);
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-chip:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.execution-controls {
  text-align: center;
  margin-bottom: var(--spacing-md);
}

.start-btn, .control-buttons button {
  padding: var(--spacing-md) var(--spacing-xl);
  border: none;
  border-radius: 12px;
  font-size: var(--spacing-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 var(--spacing-sm);
}

.start-btn {
  background: #007bff;
  color: white;
}

.start-btn:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-2px);
}

.start-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.pause-btn { background: #ffc107; color: #212529; }
.resume-btn { background: #28a745; color: white; }
.stop-btn { background: #dc3545; color: white; }

.process-timeline {
  margin-top: 20px;
}

.timeline-item {
  display: flex;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: var(--border-width-base) solid #e9ecef;
}

.timeline-item:last-child {
  border-bottom: none;
}

.timeline-marker {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-md);
  flex-shrink: 0;
  font-size: 1var(--spacing-sm);
}

.timeline-content {
  flex: 1;
}

.timeline-content h4 {
  margin: 0 0 var(--spacing-sm) 0;
  color: #2c3e50;
}

.expert-advice {
  background: #f8f9ff;
  border-left: var(--spacing-xs) solid #007bff;
  padding: var(--spacing-md);
  margin: 12px 0;
  border-radius: 0 var(--spacing-sm) var(--spacing-sm) 0;
}

.advice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.expert-name {
  font-weight: 600;
  color: #007bff;
}

.confidence {
  font-size: 12px;
  color: #6c757d;
}

.advice-content {
  line-height: 1.6;
  color: #495057;
}

.execution-time {
  font-size: 12px;
  color: #6c757d;
  margin-top: var(--spacing-sm);
}

.results-summary {
  margin-top: 20px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  margin-bottom: 2var(--spacing-xs);
}

.stat-item {
  text-align: center;
  padding: var(--spacing-md);
  background: #f8f9fa;
  border-radius: var(--spacing-sm);
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #6c757d;
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.key-findings, .next-actions {
  margin-bottom: 20px;
}

.key-findings h4, .next-actions h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.key-findings ul, .next-actions ul {
  margin: 0;
  padding-left: 20px;
}

.key-findings li, .next-actions li {
  margin-bottom: var(--spacing-sm);
  line-height: 1.5;
}

.result-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 2var(--spacing-xs);
}

.result-actions button {
  flex: 1;
  min-width: 120px;
  padding: 12px var(--spacing-md);
  border: none;
  border-radius: var(--spacing-sm);
  font-size: 1var(--spacing-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.export-btn { background: #17a2b8; color: white; }
.share-btn { background: #28a745; color: white; }
.new-workflow-btn { background: #6f42c1; color: white; }

.error-message {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  z-index: 1000;
}

.error-content {
  background: #f8d7da;
  color: #721c24;
  padding: var(--spacing-md);
  border-radius: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 var(--spacing-xs) 12px rgba(0,0,0,0.15);
}

.error-icon {
  font-size: 20px;
}

.error-text {
  flex: 1;
}

.error-close {
  background: none;
  border: none;
  color: #721c24;
  font-size: 1var(--spacing-sm);
  cursor: pointer;
  padding: var(--spacing-xs);
}

.haptic-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: var(--spacing-sm) 12px;
  border-radius: 20px;
  font-size: 12px;
  z-index: 1000;
  animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

/* 响应式设计 */
@media (max-width: 76var(--spacing-sm)) {
  .mobile-expert-workflow {
    padding: 12px;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
  
  .result-actions {
    flex-direction: column;
  }
  
  .result-actions button {
    min-width: auto;
  }
}
</style>
