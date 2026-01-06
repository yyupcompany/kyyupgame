<template>
  <div class="page-container">
    <page-header title="活动优化">
      <template #actions>
        <el-button type="primary" @click="handleGenerateOptimization">
          <UnifiedIcon name="default" />
          AI智能优化
        </el-button>
        <el-button type="success" @click="handleExportOptimization">
          <UnifiedIcon name="Download" />
          导出优化方案
        </el-button>
      </template>
    </page-header>

    <!-- 优化目标设置 -->
    <div class="app-card target-section">
      <div class="app-card-content">
        <h3>优化目标设置</h3>
        <el-form :model="optimizationForm" label-width="120px" class="optimization-form">
          <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="目标活动">
                <el-select 
                  v-model="optimizationForm.activityId" 
                  placeholder="选择要优化的活动"
                  @change="handleActivityChange"
                >
                  <el-option 
                    v-for="activity in activityList" 
                    :key="activity.id" 
                    :label="activity.title" 
                    :value="activity.id" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="优化维度">
                <el-select 
                  v-model="optimizationForm.dimension" 
                  placeholder="选择优化维度"
                  multiple
                >
                  <el-option label="参与度" value="participation" />
                  <el-option label="满意度" value="satisfaction" />
                  <el-option label="转化率" value="conversion" />
                  <el-option label="成本效益" value="cost_efficiency" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="优化强度">
                <el-select v-model="optimizationForm.intensity" placeholder="选择优化强度">
                  <el-option label="轻度优化" value="light" />
                  <el-option label="中度优化" value="medium" />
                  <el-option label="深度优化" value="deep" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item>
                <el-button type="primary" @click="handleStartOptimization" :loading="optimizing">
                  开始优化分析
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>

    <!-- 当前活动分析 -->
    <div v-if="currentActivity" class="app-card analysis-section">
      <div class="app-card-content">
        <h3>当前活动分析</h3>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <div class="metric-card">
              <div class="metric-title">参与度评分</div>
              <div class="metric-value" :class="getScoreClass(currentActivity.participationScore)">
                {{ currentActivity.participationScore }}/100
              </div>
              <div class="metric-trend">
                <UnifiedIcon name="default" />
                {{ currentActivity.participationTrend }}%
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <div class="metric-card">
              <div class="metric-title">满意度评分</div>
              <div class="metric-value" :class="getScoreClass(currentActivity.satisfactionScore * 20)">
                {{ currentActivity.satisfactionScore }}/5
              </div>
              <div class="metric-trend">
                <UnifiedIcon name="default" />
                {{ currentActivity.satisfactionTrend }}%
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <div class="metric-card">
              <div class="metric-title">转化率</div>
              <div class="metric-value" :class="getScoreClass(currentActivity.conversionRate)">
                {{ currentActivity.conversionRate }}%
              </div>
              <div class="metric-trend">
                <UnifiedIcon name="default" />
                {{ currentActivity.conversionTrend }}%
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <div class="metric-card">
              <div class="metric-title">成本效益</div>
              <div class="metric-value" :class="getScoreClass(currentActivity.costEfficiency)">
                {{ currentActivity.costEfficiency }}/100
              </div>
              <div class="metric-trend">
                <UnifiedIcon name="default" />
                {{ currentActivity.costTrend }}%
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 优化建议 -->
    <div v-if="optimizationResults.length > 0" class="app-card suggestions-section">
      <div class="app-card-content">
        <h3>AI优化建议</h3>
        <div class="suggestions-list">
          <div 
            v-for="(suggestion, index) in optimizationResults" 
            :key="index" 
            class="suggestion-item"
          >
            <div class="suggestion-header">
              <div class="suggestion-title">
                <el-icon :class="getPriorityIcon(suggestion.priority)"></el-icon>
                {{ suggestion.title }}
              </div>
              <div class="suggestion-priority">
                <el-tag :type="getPriorityType(suggestion.priority)">
                  {{ getPriorityLabel(suggestion.priority) }}
                </el-tag>
              </div>
            </div>
            
            <div class="suggestion-content">
              <div class="suggestion-description">
                {{ suggestion.description }}
              </div>
              
              <div class="suggestion-details">
                <el-row :gutter="16">
                  <el-col :span="8">
                    <div class="detail-item">
                      <span class="detail-label">预期提升：</span>
                      <span class="detail-value improvement">+{{ suggestion.expectedImprovement }}%</span>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="detail-item">
                      <span class="detail-label">实施难度：</span>
                      <span class="detail-value">{{ getDifficultyLabel(suggestion.difficulty) }}</span>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="detail-item">
                      <span class="detail-label">预计成本：</span>
                      <span class="detail-value">{{ suggestion.estimatedCost }}</span>
                    </div>
                  </el-col>
                </el-row>
              </div>
              
              <div class="suggestion-actions">
                <el-button size="small" @click="handleViewDetail(suggestion)">
                  查看详情
                </el-button>
                <el-button type="primary" size="small" @click="handleApplySuggestion(suggestion)">
                  应用建议
                </el-button>
                <el-button type="success" size="small" @click="handleSaveSuggestion(suggestion)">
                  保存方案
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 优化历史 -->
    <div class="app-card history-section">
      <div class="app-card-content">
        <h3>优化历史</h3>
        <div class="table-wrapper">
<el-table class="responsive-table" :data="optimizationHistory" stripe>
          <el-table-column prop="activityTitle" label="活动名称" min-width="200" />
          <el-table-column prop="optimizationType" label="优化类型" width="120">
            <template #default="{ row }">
              <el-tag>{{ row.optimizationType }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="beforeScore" label="优化前评分" width="120" />
          <el-table-column prop="afterScore" label="优化后评分" width="120" />
          <el-table-column prop="improvement" label="提升幅度" width="120">
            <template #default="{ row }">
              <span class="improvement">+{{ row.improvement }}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="optimizedAt" label="优化时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.optimizedAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleViewHistory(row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
</div>
      </div>
    </div>

    <!-- 建议详情对话框 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      title="优化建议详情" 
      width="70%"
    >
      <div v-if="currentSuggestion" class="suggestion-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="建议标题">{{ currentSuggestion.title }}</el-descriptions-item>
          <el-descriptions-item label="优先级">{{ getPriorityLabel(currentSuggestion.priority) }}</el-descriptions-item>
          <el-descriptions-item label="预期提升">{{ currentSuggestion.expectedImprovement }}%</el-descriptions-item>
          <el-descriptions-item label="实施难度">{{ getDifficultyLabel(currentSuggestion.difficulty) }}</el-descriptions-item>
          <el-descriptions-item label="预计成本" :span="2">{{ currentSuggestion.estimatedCost }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">详细描述</el-divider>
        <div class="detail-content">{{ currentSuggestion.description }}</div>

        <el-divider content-position="left">实施步骤</el-divider>
        <div class="implementation-steps">
          <ol>
            <li v-for="(step, index) in currentSuggestion.implementationSteps" :key="index">
              {{ step }}
            </li>
          </ol>
        </div>

        <el-divider content-position="left">风险评估</el-divider>
        <div class="risk-assessment">{{ currentSuggestion.riskAssessment }}</div>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleApplyFromDetail">应用建议</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, TrendCharts } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'

// 响应式数据
const optimizing = ref(false)
const detailDialogVisible = ref(false)
const currentSuggestion = ref<any>(null)

// 优化表单
const optimizationForm = reactive({
  activityId: undefined,
  dimension: [],
  intensity: 'medium'
})

// 活动列表
const activityList = ref([
  { id: 1, title: '春季亲子运动会' },
  { id: 2, title: '幼儿园开放日' },
  { id: 3, title: '家长座谈会' },
  { id: 4, title: '艺术展示活动' }
])

// 当前活动数据
const currentActivity = ref<any>(null)

// 优化结果
const optimizationResults = ref<any[]>([])

// 优化历史
const optimizationHistory = ref([
  {
    activityTitle: '春季亲子运动会',
    optimizationType: '参与度优化',
    beforeScore: 75,
    afterScore: 89,
    improvement: 18.7,
    optimizedAt: '2024-01-15 14:30:00'
  },
  {
    activityTitle: '幼儿园开放日',
    optimizationType: '转化率优化',
    beforeScore: 32,
    afterScore: 45,
    improvement: 40.6,
    optimizedAt: '2024-01-10 10:15:00'
  }
])

// 获取评分等级样式
const getScoreClass = (score: number) => {
  if (score >= 80) return 'score-excellent'
  if (score >= 60) return 'score-good'
  if (score >= 40) return 'score-average'
  return 'score-poor'
}

// 获取优先级图标
const getPriorityIcon = (priority: string) => {
  const iconMap: Record<string, string> = {
    high: 'alert-triangle',
    medium: 'info',
    low: 'el-icon-question'
  }
  return iconMap[priority] || 'info'
}

// 获取优先级类型
const getPriorityType = (priority: string) => {
  const typeMap: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return typeMap[priority] || 'info'
}

// 获取优先级标签
const getPriorityLabel = (priority: string) => {
  const labelMap: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return labelMap[priority] || '未知'
}

// 获取难度标签
const getDifficultyLabel = (difficulty: string) => {
  const labelMap: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return labelMap[difficulty] || '未知'
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

// 活动变化处理
const handleActivityChange = (activityId: number) => {
  // 模拟加载活动数据
  currentActivity.value = {
    id: activityId,
    participationScore: 78,
    participationTrend: 12.5,
    satisfactionScore: 4.2,
    satisfactionTrend: 8.3,
    conversionRate: 35.6,
    conversionTrend: -2.1,
    costEfficiency: 82,
    costTrend: 15.7
  }
}

// 开始优化分析
const handleStartOptimization = async () => {
  if (!optimizationForm.activityId) {
    ElMessage.warning('请先选择要优化的活动')
    return
  }

  optimizing.value = true
  try {
    // 模拟AI分析过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟优化建议
    optimizationResults.value = [
      {
        title: '优化活动时间安排',
        priority: 'high',
        description: '根据历史数据分析，将活动时间调整到周六上午10:00-12:00，可以显著提升家长参与度。',
        expectedImprovement: 25.3,
        difficulty: 'easy',
        estimatedCost: '无额外成本',
        implementationSteps: [
          '分析目标家长群体的时间偏好',
          '调整活动时间到周六上午',
          '更新宣传材料中的时间信息',
          '通知已报名家长时间变更'
        ],
        riskAssessment: '风险较低，主要是部分已报名家长可能因时间冲突取消参与。'
      },
      {
        title: '增加互动环节设计',
        priority: 'medium',
        description: '在活动中增加更多亲子互动环节，如亲子游戏、手工制作等，提升参与体验和满意度。',
        expectedImprovement: 18.7,
        difficulty: 'medium',
        estimatedCost: '500-1000元',
        implementationSteps: [
          '设计3-5个亲子互动游戏',
          '准备相应的道具和材料',
          '培训工作人员游戏规则',
          '在活动流程中安排互动时间'
        ],
        riskAssessment: '需要额外的人力和物料成本，活动时间可能需要延长。'
      }
    ]
    
    ElMessage.success('优化分析完成！')
  } catch (error) {
    console.error('优化分析失败:', error)
    ElMessage.error('优化分析失败')
  } finally {
    optimizing.value = false
  }
}

// AI智能优化
const handleGenerateOptimization = () => {
  ElMessage.info('AI智能优化功能开发中...')
}

// 导出优化方案
const handleExportOptimization = () => {
  ElMessage.info('导出优化方案功能开发中...')
}

// 查看建议详情
const handleViewDetail = (suggestion: any) => {
  currentSuggestion.value = suggestion
  detailDialogVisible.value = true
}

// 应用建议
const handleApplySuggestion = async (suggestion: any) => {
  try {
    await ElMessageBox.confirm(`确定要应用"${suggestion.title}"这个优化建议吗？`, '确认应用', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    ElMessage.success('优化建议应用成功！')
  } catch {
    // 用户取消
  }
}

// 保存建议
const handleSaveSuggestion = (suggestion: any) => {
  ElMessage.success('优化方案保存成功！')
}

// 从详情应用建议
const handleApplyFromDetail = () => {
  if (currentSuggestion.value) {
    handleApplySuggestion(currentSuggestion.value)
    detailDialogVisible.value = false
  }
}

// 查看历史详情
const handleViewHistory = (row: any) => {
  ElMessage.info('查看历史详情功能开发中...')
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.target-section,
.analysis-section,
.suggestions-section,
.history-section {
  margin-bottom: var(--text-3xl);
}

.metric-card {
  text-align: center;
  padding: var(--spacing-lg);
  background: white;
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  margin-bottom: var(--text-lg);
}

.metric-title {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.metric-value {
  font-size: var(--text-2xl);
  font-weight: bold;
  margin-bottom: var(--spacing-sm);
}

.metric-value.score-excellent { color: var(--success-color); }
.metric-value.score-good { color: var(--primary-color); }
.metric-value.score-average { color: var(--warning-color); }
.metric-value.score-poor { color: var(--danger-color); }

.metric-trend {
  font-size: var(--text-xs);
  color: var(--success-color);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.suggestion-item {
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
  margin-bottom: var(--text-lg);
  background: white;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-sm);
}

.suggestion-title {
  font-size: var(--text-base);
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.suggestion-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--text-lg);
}

.suggestion-details {
  margin-bottom: var(--text-lg);
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.detail-label {
  color: var(--text-secondary);
  margin-right: var(--spacing-sm);
}

.detail-value {
  font-weight: bold;
}

.detail-value.improvement {
  color: var(--success-color);
}

.suggestion-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.detail-content,
.risk-assessment {
  padding: var(--text-xs);
  background: var(--bg-hover);
  border-radius: var(--spacing-xs);
  line-height: 1.6;
}

.implementation-steps ol {
  padding-left: var(--text-2xl);
}

.implementation-steps li {
  margin-bottom: var(--spacing-sm);
  line-height: 1.6;
}

.improvement {
  color: var(--success-color);
  font-weight: bold;
}
</style>
