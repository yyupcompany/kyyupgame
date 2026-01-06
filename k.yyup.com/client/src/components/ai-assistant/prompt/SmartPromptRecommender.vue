<template>
  <div class="smart-prompt-recommender">
    <!-- 推荐标题 -->
    <div class="recommender-header" v-if="showHeader">
      <h3 class="recommender-title">
        <UnifiedIcon name="ai-center" />
        智能提示词推荐
      </h3>
      <div class="header-actions">
        <el-button 
          size="small" 
          @click="refreshRecommendations"
          :loading="loading"
        >
          <UnifiedIcon name="refresh" />
          刷新
        </el-button>
        <el-button 
          size="small" 
          @click="showSettings = true"
        >
          <UnifiedIcon name="ai-center" />
          设置
        </el-button>
      </div>
    </div>

    <!-- 推荐内容 -->
    <div class="recommendations-container" v-loading="loading">
      <!-- 推荐理由 -->
      <div class="recommendation-context" v-if="context">
        <el-alert
          :title="`\`${context}\`的推荐`"
          type="info"
          :closable="false"
          show-icon
        />
      </div>

      <!-- 推荐列表 -->
      <div class="recommendations-list" v-if="recommendations.length > 0">
        <div 
          v-for="(item, index) in recommendations" 
          :key="item.prompt.id"
          class="recommendation-item"
          :class="{ 'top-recommendation': index === 0 }"
        >
          <!-- 推荐分数指示器 -->
          <div class="score-indicator">
            <el-progress
              type="circle"
              :percentage="Math.round(item.score * 100)"
              :width="50"
              :stroke-width="3"
              :color="getScoreColor(item.score)"
            />
            <span class="score-label">匹配度</span>
          </div>

          <!-- 推荐内容 -->
          <div class="recommendation-content">
            <div class="prompt-header">
              <h4 class="prompt-name">{{ item.prompt.prompt_name }}</h4>
              <div class="prompt-meta">
                <el-tag 
                  :type="getCategoryType(item.prompt.category)" 
                  size="small"
                >
                  {{ getCategoryLabel(item.prompt.category) }}
                </el-tag>
                <el-tag 
                  :type="getRoleType(item.prompt.role)" 
                  size="small"
                  class="role-tag"
                >
                  {{ getRoleLabel(item.prompt.role) }}
                </el-tag>
              </div>
            </div>

            <p class="prompt-description">
              {{ truncateText(item.prompt.system_prompt, 150) }}
            </p>

            <!-- 推荐原因 -->
            <div class="recommendation-reasons" v-if="item.reasons.length > 0">
              <div class="reasons-title">
                <UnifiedIcon name="ai-center" />
                推荐理由
              </div>
              <ul class="reasons-list">
                <li v-for="reason in item.reasons" :key="reason">
                  {{ reason }}
                </li>
              </ul>
            </div>

            <!-- 效果预估 -->
            <div class="effectiveness-preview">
              <div class="effectiveness-item">
                <span class="effectiveness-label">预期效果:</span>
                <el-rate
                  :model-value="item.estimatedEffectiveness / 20"
                  disabled
                  show-score
                  :max="5"
                  size="small"
                />
              </div>
            </div>

            <!-- 相似场景 -->
            <div class="similar-contexts" v-if="item.similarContexts.length > 0">
              <div class="contexts-title">
                <UnifiedIcon name="ai-center" />
                适用场景
              </div>
              <div class="contexts-tags">
                <el-tag
                  v-for="context in item.similarContexts"
                  :key="context"
                  size="small"
                  class="context-tag"
                >
                  {{ context }}
                </el-tag>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="recommendation-actions">
            <el-button
              type="primary"
              size="small"
              @click="applyRecommendation(item)"
              :loading="applyingId === item.prompt.id"
            >
              <UnifiedIcon name="Check" />
              使用
            </el-button>
            <el-button
              size="small"
              @click="previewPrompt(item.prompt)"
            >
              <UnifiedIcon name="eye" />
              预览
            </el-button>
            <el-button
              size="small"
              @click="showUsageStats(item.prompt.id)"
            >
              <UnifiedIcon name="ai-center" />
              统计
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-else-if="!loading && !error">
        <el-empty description="暂无推荐提示词">
          <template #default>
            <p class="empty-description">
              系统正在学习您的使用习惯，请稍后再试
            </p>
            <el-button type="primary" @click="refreshRecommendations">
              重新获取
            </el-button>
          </template>
        </el-empty>
      </div>

      <!-- 错误状态 -->
      <div class="error-state" v-if="error">
        <el-alert
          :title="error"
          type="error"
          :closable="false"
          show-icon
        >
          <template #default>
            <el-button type="primary" size="small" @click="refreshRecommendations">
              重试
            </el-button>
          </template>
        </el-alert>
      </div>

      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMore && !loading">
        <el-button 
          text 
          @click="loadMore"
          :loading="loadingMore"
        >
          <UnifiedIcon name="ArrowDown" />
          加载更多
        </el-button>
      </div>
    </div>

    <!-- 设置对话框 -->
    <el-dialog
      v-model="showSettings"
      title="智能推荐设置"
      width="500px"
    >
      <div class="settings-content">
        <el-form :model="settings" label-width="120px">
          <el-form-item label="推荐数量">
            <el-slider
              v-model="settings.recommendationCount"
              :min="3"
              :max="10"
              show-input
              :input-size="'small'"
            />
          </el-form-item>
          <el-form-item label="最低匹配度">
            <el-slider
              v-model="settings.minScore"
              :min="0.1"
              :max="1.0"
              :step="0.1"
              show-input
              :input-size="'small'"
            />
          </el-form-item>
          <el-form-item label="启用AI推荐">
            <el-switch v-model="settings.enableAI" />
          </el-form-item>
          <el-form-item label="学习模式">
            <el-switch v-model="settings.learningMode" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showSettings = false">取消</el-button>
        <el-button type="primary" @click="saveSettings">保存</el-button>
      </template>
    </el-dialog>

    <!-- 提示词预览对话框 -->
    <PromptPreview
      v-model="previewVisible"
      :data="previewData"
      @edit="handleEditPrompt"
    />

    <!-- 使用统计对话框 -->
    <el-dialog
      v-model="statsVisible"
      title="提示词使用统计"
      width="600px"
    >
      <div class="stats-content" v-loading="statsLoading">
        <div v-if="usageStats" class="stats-details">
          <div class="stat-item">
            <span class="stat-label">使用次数:</span>
            <span class="stat-value">{{ usageStats.usageCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">成功率:</span>
            <span class="stat-value">{{ (usageStats.successRate * 100).toFixed(1) }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">平均评分:</span>
            <span class="stat-value">
              <el-rate
                :model-value="usageStats.averageRating"
                disabled
                show-score
                :max="5"
                size="small"
              />
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">最后使用:</span>
            <span class="stat-value">{{ formatDate(usageStats.lastUsedAt) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">正面反馈:</span>
            <span class="stat-value">{{ usageStats.feedbackCount.positive }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">负面反馈:</span>
            <span class="stat-value">{{ usageStats.feedbackCount.negative }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  MagicStick,
  Refresh,
  Setting,
  InfoFilled,
  Connection,
  Check,
  View,
  TrendCharts,
  ArrowDown
} from '@element-plus/icons-vue'
import type { AIShortcut } from '@/api/ai-shortcuts'
import { 
  getCategoryLabel, 
  getRoleLabel,
  CATEGORY_OPTIONS,
  ROLE_OPTIONS 
} from '@/api/ai-shortcuts'
import { promptOptimizationService } from '@/services/prompt-optimization.service'
import type { 
  PromptRecommendation,
  PromptRecommendationRequest 
} from '@/services/prompt-optimization.service'
import PromptPreview from '@/components/ai-assistant/PromptPreview.vue'
import type { PromptUsageStats } from '@/services/prompt-optimization.service'

// Props
interface Props {
  context?: string
  userRole: string
  category?: string
  showHeader?: boolean
  limit?: number
  autoLoad?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  limit: 5,
  autoLoad: true
})

// Emits
interface Emits {
  'recommendation-applied': [prompt: AIShortcut]
  'recommendation-preview': [prompt: AIShortcut]
  'settings-changed': [settings: any]
}

const emit = defineEmits<Emits>()

// 状态
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const recommendations = ref<PromptRecommendation[]>([])
const hasMore = ref(false)
const currentPage = ref(1)
const applyingId = ref<number | null>(null)

// 设置
const showSettings = ref(false)
const settings = reactive({
  recommendationCount: 5,
  minScore: 0.3,
  enableAI: true,
  learningMode: true
})

// 预览
const previewVisible = ref(false)
const previewData = ref<AIShortcut | null>(null)

// 统计
const statsVisible = ref(false)
const statsLoading = ref(false)
const usageStats = ref<PromptUsageStats | null>(null)

// 加载推荐
const loadRecommendations = async (loadMore = false) => {
  if (!props.context) return
  
  try {
    if (loadMore) {
      loadingMore.value = true
    } else {
      loading.value = true
      currentPage.value = 1
    }
    
    error.value = ''
    
    const request: PromptRecommendationRequest = {
      context: props.context,
      userRole: props.userRole,
      category: props.category,
      limit: settings.recommendationCount,
      excludeIds: recommendations.value.map(r => r.prompt.id)
    }
    
    const newRecommendations = await promptOptimizationService.getSmartRecommendations(request)
    
    if (loadMore) {
      recommendations.value.push(...newRecommendations)
    } else {
      recommendations.value = newRecommendations
    }
    
    hasMore.value = newRecommendations.length >= settings.recommendationCount
    currentPage.value++
    
  } catch (err) {
    error.value = '获取推荐失败，请稍后重试'
    console.error('加载推荐失败:', err)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 刷新推荐
const refreshRecommendations = () => {
  loadRecommendations(false)
}

// 加载更多
const loadMore = () => {
  loadRecommendations(true)
}

// 应用推荐
const applyRecommendation = async (recommendation: PromptRecommendation) => {
  applyingId.value = recommendation.prompt.id
  
  try {
    // 记录使用
    await promptOptimizationService.recordPromptUsage(
      recommendation.prompt.id,
      props.context || '',
      { success: true }
    )
    
    ElMessage.success('已应用推荐提示词')
    emit('recommendation-applied', recommendation.prompt)
  } catch (err) {
    console.error('应用推荐失败:', err)
    ElMessage.error('应用推荐失败')
  } finally {
    applyingId.value = null
  }
}

// 预览提示词
const previewPrompt = (prompt: AIShortcut) => {
  previewData.value = prompt
  previewVisible.value = true
  emit('recommendation-preview', prompt)
}

// 显示使用统计
const showUsageStats = async (promptId: number) => {
  statsVisible.value = true
  statsLoading.value = true
  
  try {
    usageStats.value = await promptOptimizationService.getPromptUsageStats(promptId)
  } catch (err) {
    console.error('获取使用统计失败:', err)
    ElMessage.error('获取使用统计失败')
  } finally {
    statsLoading.value = false
  }
}

// 编辑提示词
const handleEditPrompt = (prompt: AIShortcut) => {
  // 可以跳转到编辑页面或打开编辑对话框
  ElMessage.info('编辑功能开发中')
}

// 保存设置
const saveSettings = () => {
  localStorage.setItem('prompt-recommender-settings', JSON.stringify(settings))
  showSettings.value = false
  emit('settings-changed', settings)
  
  // 重新加载推荐
  if (props.context) {
    loadRecommendations(false)
  }
  
  ElMessage.success('设置已保存')
}

// 工具函数
const getScoreColor = (score: number): string => {
  if (score >= 0.8) return 'var(--success-color)'
  if (score >= 0.6) return 'var(--warning-color)'
  if (score >= 0.4) return 'var(--primary-color)'
  return 'var(--info-color)'
}

const getCategoryType = (category: string): string => {
  const typeMap: Record<string, string> = {
    'enrollment_planning': 'primary',
    'activity_planning': 'success',
    'progress_analysis': 'info',
    'follow_up_reminder': 'warning',
    'conversion_monitoring': 'danger',
    'age_reminder': 'primary',
    'task_management': 'success',
    'comprehensive_analysis': 'info'
  }
  return typeMap[category] || 'info'
}

const getRoleType = (role: string): string => {
  const typeMap: Record<string, string> = {
    'principal': 'primary',
    'admin': 'success',
    'teacher': 'info',
    'all': 'warning'
  }
  return typeMap[role] || 'info'
}

const truncateText = (text: string, length: number): string => {
  return text.length > length ? text.substring(0, length) + '...' : text
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 监听context变化
watch(() => props.context, (newContext) => {
  if (newContext && props.autoLoad) {
    loadRecommendations(false)
  }
})

// 生命周期
onMounted(() => {
  // 加载设置
  const savedSettings = localStorage.getItem('prompt-recommender-settings')
  if (savedSettings) {
    Object.assign(settings, JSON.parse(savedSettings))
  }
  
  // 初始加载
  if (props.context && props.autoLoad) {
    loadRecommendations(false)
  }
})
</script>

<style scoped lang="scss">
// design-tokens 已通过 vite.config 全局注入
.smart-prompt-recommender {
  background: var(--el-bg-color);
  border-radius: var(--spacing-sm);
  padding: var(--text-lg);
  border: var(--border-width) solid var(--el-border-color-lighter);
}

.recommender-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-lg);
  padding-bottom: var(--text-sm);
  border-bottom: var(--z-index-dropdown) solid var(--el-border-color-lighter);
}

.recommender-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.recommendation-context {
  margin-bottom: var(--text-lg);
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: var(--text-sm);
}

.recommendation-item {
  display: flex;
  gap: var(--text-sm);
  padding: var(--text-lg);
  background: var(--el-bg-color-page);
  border-radius: var(--spacing-sm);
  border: var(--border-width) solid var(--el-border-color);
  transition: all var(--transition-normal) ease;
  
  &:hover {
    box-shadow: 0 2px var(--text-sm) var(--shadow-light);
    transform: translateY(var(--z-index-below));
  }
  
  &.top-recommendation {
    border-color: var(--el-color-primary);
    background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-bg-color-page) 100%);
  }
}

.score-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  
  .score-label {
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
  }
}

.recommendation-content {
  flex: 1;
  min-width: 0;
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
  
  .prompt-name {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0;
  }
  
  .prompt-meta {
    display: flex;
    gap: var(--spacing-lg);
  }
}

.prompt-description {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  line-height: 1.5;
  margin: 0 0 var(--text-sm) 0;
}

.recommendation-reasons {
  margin-bottom: var(--text-sm);
  
  .reasons-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-secondary);
    margin-bottom: var(--spacing-lg);
  }
  
  .reasons-list {
    margin: 0;
    padding-left: var(--text-lg);
    
    li {
      font-size: var(--text-sm);
      color: var(--el-text-color-regular);
      margin-bottom: var(--spacing-sm);
    }
  }
}

.effectiveness-preview {
  margin-bottom: var(--text-sm);
  
  .effectiveness-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }
  
  .effectiveness-label {
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
    font-weight: 600;
  }
}

.similar-contexts {
  margin-bottom: var(--text-sm);
  
  .contexts-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-secondary);
    margin-bottom: var(--spacing-lg);
  }
  
  .contexts-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }
}

.recommendation-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.empty-state {
  padding: var(--spacing-10xl) 0;
  
  .empty-description {
    font-size: var(--text-base);
    color: var(--el-text-color-secondary);
    margin: var(--text-lg) 0;
  }
}

.error-state {
  padding: var(--spacing-xl) 0;
}

.load-more {
  text-align: center;
  padding-top: var(--text-lg);
  border-top: var(--z-index-dropdown) solid var(--el-border-color-lighter);
}

.settings-content {
  padding: var(--spacing-xl) 0;
}

.stats-content {
  padding: var(--spacing-xl) 0;
}

.stats-details {
  display: flex;
  flex-direction: column;
  gap: var(--text-lg);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-sm);
  background: var(--el-bg-color-page);
  border-radius: var(--radius-md);
  
  .stat-label {
    font-size: var(--text-base);
    color: var(--el-text-color-secondary);
    font-weight: 600;
  }
  
  .stat-value {
    font-size: var(--text-base);
    color: var(--el-text-color-primary);
    font-weight: 600;
  }
}

.role-tag {
  margin-left: var(--spacing-xs);
}

.context-tag {
  font-size: var(--text-xs);
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .recommendation-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .recommendation-actions {
    flex-direction: row;
    width: 100%;
    justify-content: flex-end;
  }
  
  .prompt-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .recommender-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--text-sm);
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>