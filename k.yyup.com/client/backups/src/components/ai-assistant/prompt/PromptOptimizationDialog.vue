<template>
  <el-dialog
    v-model="visible"
    :title="`优化提示词 - ${promptData?.prompt_name || ''}`"
    width="800px"
    top="5vh"
    :close-on-click-modal="false"
    class="prompt-optimization-dialog"
  >
    <div class="optimization-content" v-loading="loading">
      <!-- 原始提示词 -->
      <div class="original-prompt-section">
        <div class="section-header">
          <h4>原始提示词</h4>
          <el-tag type="info" size="small">长度: {{ originalLength }} 字符</el-tag>
        </div>
        <div class="prompt-content">
          <el-input
            v-model="originalPrompt"
            type="textarea"
            :rows="6"
            readonly
            placeholder="原始提示词内容"
          />
        </div>
      </div>

      <!-- 优化建议 -->
      <div class="optimization-suggestions-section" v-if="suggestions.length > 0">
        <div class="section-header">
          <h4>AI优化建议</h4>
          <div class="header-actions">
            <el-button size="small" @click="applyAllSuggestions" type="primary">
              <el-icon><Check /></el-icon>
              应用全部
            </el-button>
            <el-button size="small" @click="refreshSuggestions">
              <el-icon><Refresh /></el-icon>
              重新分析
            </el-button>
          </div>
        </div>

        <div class="suggestions-list">
          <div 
            v-for="(suggestion, index) in suggestions" 
            :key="index"
            class="suggestion-item"
            :class="{ 'applied': suggestion.applied }"
          >
            <div class="suggestion-header">
              <div class="suggestion-info">
                <el-tag 
                  :type="getSuggestionTypeColor(suggestion.type)" 
                  size="small"
                  class="type-tag"
                >
                  {{ getSuggestionTypeLabel(suggestion.type) }}
                </el-tag>
                <el-tag 
                  :type="getImpactColor(suggestion.impact)" 
                  size="small"
                  class="impact-tag"
                >
                  {{ getImpactLabel(suggestion.impact) }}
                </el-tag>
                <span class="suggestion-description">{{ suggestion.description }}</span>
              </div>
              <div class="suggestion-actions">
                <el-button
                  size="small"
                  @click="toggleSuggestion(suggestion)"
                  :type="suggestion.applied ? 'success' : 'default'"
                  :icon="suggestion.applied ? Check : Plus"
                >
                  {{ suggestion.applied ? '已应用' : '应用' }}
                </el-button>
              </div>
            </div>

            <div class="suggestion-content">
              <div class="text-comparison">
                <div class="original-text">
                  <div class="text-label">原文:</div>
                  <div class="text-content">{{ suggestion.originalText }}</div>
                </div>
                <div class="arrow-icon">
                  <el-icon><ArrowRight /></el-icon>
                </div>
                <div class="suggested-text">
                  <div class="text-label">建议:</div>
                  <div class="text-content">{{ suggestion.suggestedText }}</div>
                </div>
              </div>
              
              <div class="suggestion-reasoning" v-if="suggestion.reasoning">
                <el-icon><InfoFilled /></el-icon>
                <span>{{ suggestion.reasoning }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 优化后提示词 -->
      <div class="optimized-prompt-section">
        <div class="section-header">
          <h4>优化后提示词</h4>
          <div class="header-stats">
            <el-tag type="success" size="small">
              长度: {{ optimizedLength }} 字符
            </el-tag>
            <el-tag 
              :type="getImprovementColor(improvementScore)" 
              size="small"
              v-if="improvementScore > 0"
            >
              优化度: {{ improvementScore }}%
            </el-tag>
          </div>
        </div>
        
        <div class="prompt-content">
          <el-input
            v-model="optimizedPrompt"
            type="textarea"
            :rows="8"
            placeholder="优化后的提示词内容"
          />
        </div>
        
        <div class="prompt-actions">
          <el-button @click="resetToOriginal">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button @click="copyOptimizedPrompt">
            <el-icon><CopyDocument /></el-icon>
            复制
          </el-button>
          <el-button type="primary" @click="applyOptimization">
            <el-icon><Check /></el-icon>
            应用优化
          </el-button>
        </div>
      </div>

      <!-- 效果预览 -->
      <div class="effect-preview-section" v-if="effectPreview">
        <div class="section-header">
          <h4>效果预览</h4>
          <el-tag type="info" size="small">基于AI分析</el-tag>
        </div>
        
        <div class="effect-preview-content">
          <div class="metrics-grid">
            <div class="metric-item">
              <div class="metric-label">清晰度</div>
              <el-progress
                :percentage="effectPreview.clarity"
                :color="getProgressColor(effectPreview.clarity)"
              />
            </div>
            <div class="metric-item">
              <div class="metric-label">具体性</div>
              <el-progress
                :percentage="effectPreview.specificity"
                :color="getProgressColor(effectPreview.specificity)"
              />
            </div>
            <div class="metric-item">
              <div class="metric-label">完整性</div>
              <el-progress
                :percentage="effectPreview.completeness"
                :color="getProgressColor(effectPreview.completeness)"
              />
            </div>
            <div class="metric-item">
              <div class="metric-label">预期效果</div>
              <el-progress
                :percentage="effectPreview.overall"
                :color="getProgressColor(effectPreview.overall)"
              />
            </div>
          </div>
          
          <div class="effect-description">
            <el-alert
              :title="effectPreview.description"
              :type="getEffectAlertType(effectPreview.overall)"
              :closable="false"
              show-icon
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="saveOptimizedPrompt" :loading="saving">
          保存优化
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Check,
  Refresh,
  CopyDocument,
  ArrowRight,
  InfoFilled,
  Plus
import type { AIShortcut } from '@/api/ai-shortcuts'
import { promptOptimizationService } from '@/services/prompt-optimization.service'
import type { 
  PromptOptimizationSuggestion,
  PromptEffectiveness 
} from '@/services/prompt-optimization.service'

// Props
interface Props {
  modelValue: boolean
  promptData: AIShortcut | null
  context?: string
}

const props = defineProps<Props>()

// Emits
interface Emits {
  'update:modelValue': [value: boolean]
  'prompt-optimized': [data: { prompt: AIShortcut; optimizedContent: string }]
}

const emit = defineEmits<Emits>()

// 状态
const loading = ref(false)
const saving = ref(false)
const suggestions = ref<PromptOptimizationSuggestion[]>([])
const effectPreview = ref<PromptEffectiveness['metrics'] | null>(null)

// 提示词内容
const originalPrompt = ref('')
const optimizedPrompt = ref('')
const appliedSuggestions = ref<Set<number>>(new Set())

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const originalLength = computed(() => originalPrompt.value.length)
const optimizedLength = computed(() => optimizedPrompt.value.length)
const improvementScore = computed(() => {
  const originalWords = originalPrompt.value.split(/\s+/).length
  const optimizedWords = optimizedPrompt.value.split(/\s+/).length
  const lengthDiff = Math.abs(optimizedLength.value - originalLength.value)
  const wordDiff = Math.abs(optimizedWords - originalWords)
  
  return Math.min(95, Math.round((lengthDiff + wordDiff) / 2))
})

// 监听props变化
watch(() => props.promptData, (newData) => {
  if (newData) {
    originalPrompt.value = newData.system_prompt
    optimizedPrompt.value = newData.system_prompt
    loadOptimizationSuggestions()
  }
}, { immediate: true })

// 加载优化建议
const loadOptimizationSuggestions = async () => {
  if (!originalPrompt.value) return
  
  loading.value = true
  try {
    const newSuggestions = await promptOptimizationService.getOptimizationSuggestions(
      originalPrompt.value
    )
    
    suggestions.value = newSuggestions.map((s, index) => ({
      ...s,
      id: index,
      applied: false
    }))
    
    // 生成效果预览
    await generateEffectPreview()
    
  } catch (error) {
    console.error('加载优化建议失败:', error)
    ElMessage.error('加载优化建议失败')
  } finally {
    loading.value = false
  }
}

// 生成效果预览
const generateEffectPreview = async () => {
  if (!props.promptData) return
  
  try {
    const effectiveness = await promptOptimizationService.analyzePromptEffectiveness(
      props.promptData.id
    )
    
    if (effectiveness) {
      effectPreview.value = effectiveness.metrics
    }
  } catch (error) {
    console.error('生成效果预览失败:', error)
    // 使用基础预览
    generateBasicEffectPreview()
  }
}

// 基础效果预览
const generateBasicEffectPreview = () => {
  const clarity = Math.min(100, Math.max(20, originalPrompt.value.length / 10))
  const specificity = originalPrompt.value.includes('具体') || originalPrompt.value.includes('详细') ? 80 : 60
  const completeness = originalPrompt.value.includes('请') && originalPrompt.value.length > 50 ? 75 : 50
  const overall = (clarity + specificity + completeness) / 3
  
  effectPreview.value = {
    clarity: Math.round(clarity),
    specificity: Math.round(specificity),
    completeness: Math.round(completeness),
    overall: Math.round(overall)
  }
}

// 切换建议应用状态
const toggleSuggestion = (suggestion: PromptOptimizationSuggestion & { id: number; applied: boolean }) => {
  suggestion.applied = !suggestion.applied
  
  if (suggestion.applied) {
    // 应用建议
    appliedSuggestions.value.add(suggestion.id)
    optimizedPrompt.value = optimizedPrompt.value.replace(
      suggestion.originalText,
      suggestion.suggestedText
    )
  } else {
    // 撤销建议
    appliedSuggestions.value.delete(suggestion.id)
    // 重新应用所有已选择的建议
    optimizedPrompt.value = originalPrompt.value
    suggestions.value.forEach(s => {
      if (s.applied) {
        optimizedPrompt.value = optimizedPrompt.value.replace(
          s.originalText,
          s.suggestedText
        )
      }
    })
  }
}

// 应用所有建议
const applyAllSuggestions = () => {
  suggestions.value.forEach(suggestion => {
    if (!suggestion.applied) {
      toggleSuggestion(suggestion)
    }
  })
}

// 刷新建议
const refreshSuggestions = () => {
  loadOptimizationSuggestions()
}

// 重置到原始提示词
const resetToOriginal = () => {
  optimizedPrompt.value = originalPrompt.value
  appliedSuggestions.value.clear()
  suggestions.value.forEach(s => {
    s.applied = false
  })
}

// 复制优化后的提示词
const copyOptimizedPrompt = async () => {
  try {
    await navigator.clipboard.writeText(optimizedPrompt.value)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}

// 应用优化
const applyOptimization = () => {
  if (optimizedPrompt.value === originalPrompt.value) {
    ElMessage.warning('提示词没有变化')
    return
  }
  
  ElMessage.success('优化已应用，可以保存')
}

// 保存优化后的提示词
const saveOptimizedPrompt = async () => {
  if (!props.promptData || optimizedPrompt.value === originalPrompt.value) {
    ElMessage.warning('提示词没有变化')
    return
  }
  
  saving.value = true
  try {
    // 记录优化历史
    await promptOptimizationService.recordPromptUsage(
      props.promptData.id,
      props.context || 'optimization',
      {
        success: true,
        type: 'optimization',
        originalLength: originalPrompt.value.length,
        optimizedLength: optimizedPrompt.value.length
      }
    )
    
    emit('prompt-optimized', {
      prompt: props.promptData,
      optimizedContent: optimizedPrompt.value
    })
    
    visible.value = false
    ElMessage.success('提示词优化已保存')
    
  } catch (error) {
    console.error('保存优化失败:', error)
    ElMessage.error('保存优化失败')
  } finally {
    saving.value = false
  }
}

// 工具函数
const getSuggestionTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    'clarity': 'primary',
    'specificity': 'success',
    'structure': 'info',
    'tone': 'warning',
    'length': 'danger'
  }
  return colorMap[type] || 'info'
}

const getSuggestionTypeLabel = (type: string): string => {
  const labelMap: Record<string, string> = {
    'clarity': '清晰度',
    'specificity': '具体性',
    'structure': '结构性',
    'tone': '语调',
    'length': '长度'
  }
  return labelMap[type] || type
}

const getImpactColor = (impact: string): string => {
  const colorMap: Record<string, string> = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'info'
  }
  return colorMap[impact] || 'info'
}

const getImpactLabel = (impact: string): string => {
  const labelMap: Record<string, string> = {
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return labelMap[impact] || impact
}

const getProgressColor = (percentage: number): string => {
  if (percentage >= 80) return 'var(--success-color)'
  if (percentage >= 60) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const getImprovementColor = (score: number): string => {
  if (score >= 70) return 'success'
  if (score >= 40) return 'warning'
  return 'info'
}

const getEffectAlertType = (overall: number): string => {
  if (overall >= 80) return 'success'
  if (overall >= 60) return 'warning'
  return 'info'
}
</script>

<style scoped lang="scss">
.prompt-optimization-dialog {
  .optimization-content {
    max-height: 70vh;
    overflow-y: auto;
    padding-right: var(--spacing-sm);
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-sm);
  
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0;
  }
  
  .header-actions {
    display: flex;
    gap: var(--spacing-sm);
  }
  
  .header-stats {
    display: flex;
    gap: var(--spacing-sm);
  }
}

.prompt-content {
  margin-bottom: var(--text-lg);
}

.prompt-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: var(--text-sm);
  margin-bottom: var(--text-lg);
}

.suggestion-item {
  border: var(--border-width-base) solid var(--el-border-color);
  border-radius: var(--spacing-sm);
  padding: var(--text-sm);
  background: var(--el-bg-color-page);
  transition: all 0.3s ease;
  
  &.applied {
    border-color: var(--el-color-success);
    background: var(--el-color-success-light-9);
  }
  
  &:hover {
    box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  }
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.suggestion-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.suggestion-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.suggestion-content {
  .text-comparison {
    display: flex;
    align-items: center;
    gap: var(--text-sm);
    margin-bottom: var(--spacing-sm);
    
    .original-text,
    .suggested-text {
      flex: 1;
      
      .text-label {
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);
        font-weight: 600;
        margin-bottom: var(--spacing-xs);
      }
      
      .text-content {
        font-size: var(--text-sm);
        color: var(--el-text-color-primary);
        padding: var(--spacing-sm);
        background: var(--el-bg-color);
        border-radius: var(--spacing-xs);
        border: var(--border-width-base) solid var(--el-border-color-lighter);
      }
    }
    
    .arrow-icon {
      color: var(--el-color-primary);
      font-size: var(--text-lg);
    }
  }
  
  .suggestion-reasoning {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
    padding: var(--spacing-sm);
    background: var(--el-bg-color);
    border-radius: var(--spacing-xs);
    margin-top: var(--spacing-sm);
  }
}

.effect-preview-content {
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--text-lg);
    margin-bottom: var(--text-lg);
  }
  
  .metric-item {
    .metric-label {
      font-size: var(--text-sm);
      color: var(--el-text-color-secondary);
      font-weight: 600;
      margin-bottom: var(--spacing-lg);
    }
  }
  
  .effect-description {
    margin-top: var(--text-lg);
  }
}

.type-tag,
.impact-tag {
  font-size: var(--text-xs);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .text-comparison {
    flex-direction: column;
    align-items: stretch !important;
    
    .arrow-icon {
      transform: rotate(90deg);
      text-align: center;
    }
  }
  
  .suggestion-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .suggestion-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>