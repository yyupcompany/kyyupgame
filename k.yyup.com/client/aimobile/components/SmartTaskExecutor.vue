<template>
  <div class="smart-task-executor">
    <!-- 任务输入区域 -->
    <div v-if="!isExecuting && !executionResult" class="task-input-section">
      <div class="input-header">
        <h2>🧠 智能任务执行器</h2>
        <p>描述您的复杂任务，AI将自动规划和执行</p>
      </div>

      <div class="task-input">
        <textarea
          v-model="taskDescription"
          placeholder="例如：创建2025年9月开学活动策划，30人参会，预算1000元，需要活动主题、海报、流程、预算分析"
          class="task-textarea"
          rows="4"
        ></textarea>

        <!-- 快速示例 -->
        <div class="quick-examples">
          <h4>快速示例</h4>
          <div class="example-chips">
            <span 
              v-for="example in quickExamples" 
              :key="example.id"
              class="example-chip"
              @click="useExample(example)"
            >
              {{ example.name }}
            </span>
          </div>
        </div>

        <!-- 高级选项 -->
        <div class="advanced-options" v-if="showAdvanced">
          <h4>高级选项</h4>
          <div class="options-grid">
            <div class="option-item">
              <label>优先级</label>
              <select v-model="taskPriority">
                <option value="normal">普通</option>
                <option value="high">高</option>
                <option value="urgent">紧急</option>
              </select>
            </div>
            <div class="option-item">
              <label>预算限制</label>
              <input v-model="budgetLimit" type="number" placeholder="元">
            </div>
            <div class="option-item">
              <label>截止时间</label>
              <input v-model="deadline" type="date">
            </div>
          </div>
        </div>

        <div class="input-actions">
          <button 
            :disabled="!canStart"
            class="start-btn"
            @click="startExecution"
          >
            🚀 开始智能执行
          </button>
          <button 
            class="advanced-toggle"
            @click="showAdvanced = !showAdvanced"
          >
            {{ showAdvanced ? '隐藏' : '显示' }}高级选项
          </button>
        </div>
      </div>
    </div>

    <!-- 执行规划显示 -->
    <div v-if="executionPlan && !isExecuting" class="plan-preview">
      <div class="plan-header">
        <h3>📋 执行计划预览</h3>
        <div class="plan-meta">
          <span class="complexity">复杂度: {{ executionPlan.metadata.complexity }}</span>
          <span class="duration">预计时长: {{ executionPlan.metadata.estimatedDuration }}分钟</span>
          <span class="steps">步骤数: {{ executionPlan.steps.length }}</span>
        </div>
      </div>

      <div class="plan-steps">
        <div 
          v-for="(step, index) in executionPlan.steps" 
          :key="step.id"
          class="plan-step"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-content">
            <h4>{{ step.name }}</h4>
            <p>{{ step.description }}</p>
            <div class="step-meta">
              <span class="step-type">{{ getStepTypeText(step.type) }}</span>
              <span v-if="step.dependencies.length > 0" class="dependencies">
                依赖: {{ step.dependencies.join(', ') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="plan-actions">
        <button class="execute-btn" @click="executePlan">
          ▶️ 执行计划
        </button>
        <button class="modify-btn" @click="modifyPlan">
          ✏️ 修改计划
        </button>
        <button class="cancel-btn" @click="cancelPlan">
          ❌ 取消
        </button>
      </div>
    </div>

    <!-- 执行过程显示 -->
    <div v-if="isExecuting" class="execution-process">
      <div class="process-header">
        <h3>⚡ 正在执行任务</h3>
        <div class="overall-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${overallProgress}%` }"
            ></div>
          </div>
          <span class="progress-text">{{ overallProgress }}%</span>
        </div>
      </div>

      <div class="current-step" v-if="currentStep">
        <div class="step-indicator">
          <div class="step-icon">🔄</div>
          <div class="step-info">
            <h4>{{ currentStep.name }}</h4>
            <p>{{ currentStep.description }}</p>
            <div class="step-progress">
              <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span class="step-status">{{ getStepStatusText(currentStep.status) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="execution-timeline">
        <div 
          v-for="(step, index) in executionPlan?.steps || []" 
          :key="step.id"
          :class="['timeline-step', step.status]"
        >
          <div class="timeline-marker">
            <span v-if="step.status === 'completed'">✅</span>
            <span v-else-if="step.status === 'running'">🔄</span>
            <span v-else-if="step.status === 'failed'">❌</span>
            <span v-else>⏳</span>
          </div>
          <div class="timeline-content">
            <h5>{{ step.name }}</h5>
            <div v-if="step.result" class="step-result">
              <div class="result-preview">
                {{ getResultPreview(step.result) }}
              </div>
            </div>
            <div v-if="step.error" class="step-error">
              ❌ {{ step.error }}
            </div>
          </div>
        </div>
      </div>

      <div class="execution-controls">
        <button class="pause-btn" @click="pauseExecution">
          ⏸️ 暂停
        </button>
        <button class="stop-btn" @click="stopExecution">
          ⏹️ 停止
        </button>
      </div>
    </div>

    <!-- 执行结果显示 -->
    <div v-if="executionResult" class="execution-result">
      <div class="result-header">
        <h3>🎉 任务执行完成</h3>
        <div class="result-status" :class="executionResult.status">
          {{ getResultStatusText(executionResult.status) }}
        </div>
      </div>

      <div class="result-summary">
        <div class="summary-text">
          {{ executionResult.summary }}
        </div>
        
        <div class="result-metrics">
          <div class="metric-item">
            <span class="metric-label">成功步骤</span>
            <span class="metric-value">{{ executionResult.metrics.completedSteps }}/{{ executionResult.metrics.totalSteps }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">执行时长</span>
            <span class="metric-value">{{ formatDuration(executionResult.metrics.totalExecutionTime) }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">成功率</span>
            <span class="metric-value">{{ Math.round(executionResult.metrics.successRate * 100) }}%</span>
          </div>
        </div>
      </div>

      <!-- 生成的内容 -->
      <div class="generated-artifacts" v-if="hasArtifacts">
        <h4>📄 生成的内容</h4>
        
        <!-- 文档 -->
        <div v-if="executionResult.artifacts.documents.length > 0" class="artifact-section">
          <h5>📋 文档</h5>
          <div class="document-list">
            <div 
              v-for="doc in executionResult.artifacts.documents" 
              :key="doc"
              class="document-item"
              @click="viewDocument(doc)"
            >
              <span class="doc-icon">📄</span>
              <span class="doc-name">{{ doc }}</span>
              <span class="doc-action">查看</span>
            </div>
          </div>
        </div>

        <!-- 图片 -->
        <div v-if="executionResult.artifacts.images.length > 0" class="artifact-section">
          <h5>🖼️ 图片</h5>
          <div class="image-gallery">
            <div 
              v-for="image in executionResult.artifacts.images" 
              :key="image"
              class="image-item"
              @click="viewImage(image)"
            >
              <img :src="image" :alt="'生成的图片'" class="generated-image">
              <div class="image-overlay">
                <span class="view-btn">查看大图</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据 -->
        <div v-if="executionResult.artifacts.data.length > 0" class="artifact-section">
          <h5>📊 数据分析</h5>
          <div class="data-list">
            <div 
              v-for="(data, index) in executionResult.artifacts.data" 
              :key="index"
              class="data-item"
              @click="viewData(data)"
            >
              <span class="data-icon">📊</span>
              <span class="data-name">数据分析 {{ index + 1 }}</span>
              <span class="data-action">查看</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 建议 -->
      <div v-if="executionResult.recommendations.length > 0" class="recommendations">
        <h4>💡 改进建议</h4>
        <ul class="recommendation-list">
          <li v-for="rec in executionResult.recommendations" :key="rec">
            {{ rec }}
          </li>
        </ul>
      </div>

      <div class="result-actions">
        <button class="download-btn" @click="downloadResults">
          📥 下载结果
        </button>
        <button class="share-btn" @click="shareResults">
          📤 分享结果
        </button>
        <button class="new-task-btn" @click="startNewTask">
          🔄 新建任务
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { aiTaskPlannerService } from '../services/ai-task-planner.service'
import { toolIntegrationService } from '../services/tool-integration.service'
import type { ExecutionPlan, ExecutionResult, TaskStep } from '../services/ai-task-planner.service'

// ==================== 响应式数据 ====================

// 任务输入
const taskDescription = ref('')
const taskPriority = ref('normal')
const budgetLimit = ref<number>()
const deadline = ref('')
const showAdvanced = ref(false)

// 执行状态
const isExecuting = ref(false)
const executionPlan = ref<ExecutionPlan | null>(null)
const executionResult = ref<ExecutionResult | null>(null)
const currentStep = ref<TaskStep | null>(null)
const overallProgress = ref(0)
const error = ref('')

// 快速示例
const quickExamples = ref([
  {
    id: 1,
    name: '开学活动策划',
    description: '创建2025年9月开学活动策划，30人参会，预算1000元，需要活动主题、海报、流程、预算分析'
  },
  {
    id: 2,
    name: '招生营销方案',
    description: '制定春季招生营销方案，目标招收50名学生，包含市场分析、策略设计、宣传材料'
  },
  {
    id: 3,
    name: '课程设计指导',
    description: '为新老师设计3-4岁儿童音乐课程，包含教学目标、活动设计、评估方法'
  },
  {
    id: 4,
    name: '成本优化分析',
    description: '分析幼儿园运营成本，提供优化建议，包含人员、设备、材料等各项成本分析'
  }
])

// ==================== 计算属性 ====================

const canStart = computed(() => {
  return taskDescription.value.trim().length > 10
})

const hasArtifacts = computed(() => {
  if (!executionResult.value) return false
  const artifacts = executionResult.value.artifacts
  return artifacts.documents.length > 0 || 
         artifacts.images.length > 0 || 
         artifacts.data.length > 0
})

// ==================== 方法 ====================

const useExample = (example: any) => {
  taskDescription.value = example.description
}

const startExecution = async () => {
  try {
    error.value = ''
    
    // 生成执行计划
    const userRequirements = {
      priority: taskPriority.value,
      budget: budgetLimit.value,
      deadline: deadline.value
    }
    
    executionPlan.value = await aiTaskPlannerService.generatePlan(
      taskDescription.value, 
      userRequirements
    )
    
    console.log('📋 执行计划已生成')
    
  } catch (err: any) {
    error.value = err.message || '生成执行计划失败'
  }
}

const executePlan = async () => {
  if (!executionPlan.value) return
  
  try {
    isExecuting.value = true
    error.value = ''
    
    // 执行计划
    executionResult.value = await aiTaskPlannerService.executePlan(
      executionPlan.value.id,
      (step, progress) => {
        currentStep.value = step
        overallProgress.value = Math.round(progress)
      }
    )
    
    console.log('🎉 任务执行完成')
    
  } catch (err: any) {
    error.value = err.message || '任务执行失败'
  } finally {
    isExecuting.value = false
    currentStep.value = null
  }
}

const modifyPlan = () => {
  // 修改计划逻辑
  executionPlan.value = null
}

const cancelPlan = () => {
  executionPlan.value = null
}

const pauseExecution = async () => {
  // 暂停执行逻辑
  console.log('⏸️ 暂停执行')
}

const stopExecution = async () => {
  if (executionPlan.value) {
    await aiTaskPlannerService.cancelPlan(executionPlan.value.id)
    isExecuting.value = false
    currentStep.value = null
  }
}

const startNewTask = () => {
  // 重置状态
  taskDescription.value = ''
  executionPlan.value = null
  executionResult.value = null
  currentStep.value = null
  overallProgress.value = 0
  error.value = ''
  isExecuting.value = false
}

const getStepTypeText = (type: string): string => {
  const typeMap = {
    'expert': '专家咨询',
    'tool': '工具调用',
    'analysis': '数据分析',
    'integration': '结果整合'
  }
  return typeMap[type] || type
}

const getStepStatusText = (status: string): string => {
  const statusMap = {
    'pending': '等待中',
    'running': '执行中',
    'completed': '已完成',
    'failed': '失败'
  }
  return statusMap[status] || status
}

const getResultStatusText = (status: string): string => {
  const statusMap = {
    'completed': '完全成功',
    'partial': '部分成功',
    'failed': '执行失败'
  }
  return statusMap[status] || status
}

const getResultPreview = (result: any): string => {
  if (typeof result === 'string') {
    return result.length > 100 ? result.substring(0, 100) + '...' : result
  } else if (result.advice) {
    return result.advice.length > 100 ? result.advice.substring(0, 100) + '...' : result.advice
  } else {
    return '执行完成'
  }
}

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  
  if (minutes > 0) {
    return `${minutes}分${seconds % 60}秒`
  }
  return `${seconds}秒`
}

const viewDocument = (doc: string) => {
  console.log('📄 查看文档:', doc)
  // 实现文档查看逻辑
}

const viewImage = (image: string) => {
  console.log('🖼️ 查看图片:', image)
  // 实现图片查看逻辑
}

const viewData = (data: any) => {
  console.log('📊 查看数据:', data)
  // 实现数据查看逻辑
}

const downloadResults = () => {
  console.log('📥 下载结果')
  // 实现结果下载逻辑
}

const shareResults = () => {
  console.log('📤 分享结果')
  // 实现结果分享逻辑
}

const clearError = () => {
  error.value = ''
}

// ==================== 生命周期 ====================

onMounted(() => {
  console.log('🧠 智能任务执行器已加载')
})
</script>

<style scoped>
.smart-task-executor {
  padding: var(--spacing-md);
  max-width: 100%;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 100vh;
}

.task-input-section {
  background: white;
  border-radius: var(--spacing-md);
  padding: 2var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  box-shadow: 0 var(--spacing-xs) 12px rgba(0,0,0,0.1);
}

.input-header h2 {
  font-size: 2var(--spacing-xs);
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 var(--spacing-sm) 0;
}

.input-header p {
  color: #6c757d;
  margin: 0 0 2var(--spacing-xs) 0;
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
  margin-bottom: 20px;
}

.task-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.quick-examples h4 {
  font-size: var(--spacing-md);
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.example-chips {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.example-chip {
  background: #f8f9fa;
  border: var(--border-width-base) solid #dee2e6;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 20px;
  font-size: 1var(--spacing-xs);
  cursor: pointer;
  transition: all 0.3s ease;
}

.example-chip:hover {
  background: #e9ecef;
  border-color: #667eea;
}

.advanced-options {
  border-top: var(--border-width-base) solid #e9ecef;
  padding-top: 20px;
  margin-bottom: 20px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-top: 12px;
}

.option-item label {
  display: block;
  font-size: 1var(--spacing-xs);
  font-weight: 500;
  color: #495057;
  margin-bottom: var(--spacing-xs);
}

.option-item select,
.option-item input {
  width: 100%;
  padding: var(--spacing-sm) 12px;
  border: var(--border-width-base) solid #dee2e6;
  border-radius: var(--spacing-sm);
  font-size: 1var(--spacing-xs);
}

.input-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.start-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: 12px;
  font-size: var(--spacing-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 var(--spacing-sm) 25px rgba(0,0,0,0.15);
}

.start-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.advanced-toggle {
  background: none;
  border: var(--border-width-base) solid #dee2e6;
  color: #6c757d;
  padding: 12px var(--spacing-md);
  border-radius: var(--spacing-sm);
  font-size: 1var(--spacing-xs);
  cursor: pointer;
}

.plan-preview,
.execution-process,
.execution-result {
  background: white;
  border-radius: var(--spacing-md);
  padding: 2var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  box-shadow: 0 var(--spacing-xs) 12px rgba(0,0,0,0.1);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.plan-meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: 1var(--spacing-xs);
}

.plan-meta span {
  background: #f8f9fa;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 12px;
  color: #495057;
}

.plan-steps {
  margin-bottom: 2var(--spacing-xs);
}

.plan-step {
  display: flex;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: #f8f9fa;
  border-radius: 12px;
}

.step-number {
  width: var(--spacing-xl);
  height: var(--spacing-xl);
  background: #667eea;
  color: white;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: var(--spacing-md);
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 var(--spacing-xs) 0;
  color: #2c3e50;
}

.step-content p {
  margin: 0 0 var(--spacing-sm) 0;
  color: #6c757d;
  font-size: 1var(--spacing-xs);
}

.step-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.step-type {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: var(--spacing-sm);
  color: #495057;
}

.plan-actions {
  display: flex;
  gap: 12px;
}

.execute-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 2var(--spacing-xs);
  border-radius: var(--spacing-sm);
  font-weight: 500;
  cursor: pointer;
}

.modify-btn {
  background: #ffc107;
  color: #212529;
  border: none;
  padding: 12px 2var(--spacing-xs);
  border-radius: var(--spacing-sm);
  font-weight: 500;
  cursor: pointer;
}

.cancel-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 12px 2var(--spacing-xs);
  border-radius: var(--spacing-sm);
  font-weight: 500;
  cursor: pointer;
}

.overall-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
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
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.3s ease;
}

.progress-text {
  font-weight: 600;
  color: #495057;
  min-width: 40px;
}

.current-step {
  background: #f8f9ff;
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
}

.step-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.step-icon {
  font-size: var(--spacing-xl);
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.step-info h4 {
  margin: 0 0 var(--spacing-xs) 0;
  color: #2c3e50;
}

.step-info p {
  margin: 0 0 var(--spacing-sm) 0;
  color: #6c757d;
}

.step-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.loading-dots {
  display: flex;
  gap: var(--spacing-xs);
}

.loading-dots span {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: #667eea;
  animation: loadingDots 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes loadingDots {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.execution-timeline {
  margin: 20px 0;
}

.timeline-step {
  display: flex;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.timeline-marker {
  width: var(--spacing-xl);
  height: var(--spacing-xl);
  border-radius: var(--radius-full);
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-md);
  flex-shrink: 0;
  font-size: var(--spacing-md);
}

.timeline-step.completed .timeline-marker {
  background: #d4edda;
}

.timeline-step.running .timeline-marker {
  background: #fff3cd;
}

.timeline-step.failed .timeline-marker {
  background: #f8d7da;
}

.timeline-content {
  flex: 1;
  padding-top: var(--spacing-xs);
}

.timeline-content h5 {
  margin: 0 0 var(--spacing-sm) 0;
  color: #2c3e50;
}

.result-preview {
  background: #f8f9fa;
  padding: 12px;
  border-radius: var(--spacing-sm);
  font-size: 1var(--spacing-xs);
  color: #495057;
  margin-top: var(--spacing-sm);
}

.step-error {
  color: #dc3545;
  font-size: 1var(--spacing-xs);
  margin-top: var(--spacing-sm);
}

.execution-controls {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.pause-btn,
.stop-btn {
  padding: 12px 2var(--spacing-xs);
  border: none;
  border-radius: var(--spacing-sm);
  font-weight: 500;
  cursor: pointer;
}

.pause-btn {
  background: #ffc107;
  color: #212529;
}

.stop-btn {
  background: #dc3545;
  color: white;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.result-status {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 20px;
  font-weight: 500;
  font-size: 1var(--spacing-xs);
}

.result-status.completed {
  background: #d4edda;
  color: #155724;
}

.result-status.partial {
  background: #fff3cd;
  color: #856404;
}

.result-status.failed {
  background: #f8d7da;
  color: #721c24;
}

.result-summary {
  margin-bottom: 2var(--spacing-xs);
}

.summary-text {
  background: #f8f9fa;
  padding: var(--spacing-md);
  border-radius: 12px;
  margin-bottom: var(--spacing-md);
  line-height: 1.6;
}

.result-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.metric-item {
  text-align: center;
  background: #f8f9fa;
  padding: var(--spacing-md);
  border-radius: 12px;
}

.metric-label {
  display: block;
  font-size: 12px;
  color: #6c757d;
  margin-bottom: var(--spacing-xs);
}

.metric-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

.generated-artifacts {
  margin-bottom: 2var(--spacing-xs);
}

.artifact-section {
  margin-bottom: 20px;
}

.artifact-section h5 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.document-list,
.data-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.document-item,
.data-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: var(--spacing-sm);
  cursor: pointer;
  transition: all 0.3s ease;
}

.document-item:hover,
.data-item:hover {
  background: #e9ecef;
}

.doc-icon,
.data-icon {
  margin-right: 12px;
  font-size: 20px;
}

.doc-name,
.data-name {
  flex: 1;
  font-weight: 500;
}

.doc-action,
.data-action {
  color: #667eea;
  font-size: 1var(--spacing-xs);
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.image-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-item:hover {
  transform: scale(1.02);
}

.generated-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.view-btn {
  color: white;
  font-weight: 500;
}

.recommendations {
  margin-bottom: 2var(--spacing-xs);
}

.recommendations h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.recommendation-list {
  margin: 0;
  padding-left: 20px;
}

.recommendation-list li {
  margin-bottom: var(--spacing-sm);
  line-height: 1.5;
}

.result-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.result-actions button {
  flex: 1;
  min-width: 120px;
  padding: 12px var(--spacing-md);
  border: none;
  border-radius: var(--spacing-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-btn {
  background: #17a2b8;
  color: white;
}

.share-btn {
  background: #28a745;
  color: white;
}

.new-task-btn {
  background: #6f42c1;
  color: white;
}

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

/* 响应式设计 */
@media (max-width: 76var(--spacing-sm)) {
  .smart-task-executor {
    padding: 12px;
  }
  
  .result-metrics {
    grid-template-columns: 1fr;
  }
  
  .result-actions {
    flex-direction: column;
  }
  
  .result-actions button {
    min-width: auto;
  }
  
  .image-gallery {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
