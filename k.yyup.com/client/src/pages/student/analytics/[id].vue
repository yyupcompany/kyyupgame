<template>
  <div class="student-analytics-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="goBack">
          <UnifiedIcon name="ArrowLeft" />
          返回
        </el-button>
        <h1 class="page-title">{{ studentName }} - 智能成长分析</h1>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="generateReport">
          <UnifiedIcon name="default" />
          生成报告
        </el-button>
        <el-button @click="refreshAnalysis">
          <UnifiedIcon name="Refresh" />
          刷新分析
        </el-button>
      </div>
    </div>

    <!-- 分析概览 -->
    <div class="overview-section">
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-icon">
            <UnifiedIcon name="default" />
          </div>
          <div class="card-content">
            <h3>综合发展指数</h3>
            <div class="score-display">
              <span class="score">{{ analytics?.overallScore || 0 }}</span>
              <span class="score-max">/100</span>
            </div>
            <p class="score-description">{{ getScoreDescription(analytics?.overallScore) }}</p>
          </div>
        </div>

        <div class="overview-card">
          <div class="card-icon">
            <UnifiedIcon name="default" />
          </div>
          <div class="card-content">
            <h3>成长里程碑</h3>
            <div class="milestone-stats">
              <span class="achieved">{{ achievedMilestones }}/{{ totalMilestones }}</span>
              <span class="milestone-label">已完成</span>
            </div>
            <p class="milestone-description">近期将达成{{ upcomingMilestones.length }}个里程碑</p>
          </div>
        </div>

        <div class="overview-card">
          <div class="card-icon">
            <UnifiedIcon name="default" />
          </div>
          <div class="card-content">
            <h3>AI个性化建议</h3>
            <div class="recommendations-count">
              <span class="count">{{ analytics?.recommendations.length || 0 }}</span>
              <span class="count-label">条建议</span>
            </div>
            <p class="recommendations-description">基于行为模式分析生成</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 认知发展分析 -->
    <div class="cognitive-section">
      <div class="section-header">
        <h2>认知发展分析</h2>
        <el-tag type="info" size="small">AI分析准确率: {{ accuracyRate }}%</el-tag>
      </div>
      
      <div class="cognitive-grid">
        <div class="cognitive-item" v-for="(domain, key) in analytics?.cognitiveGrowth" :key="key">
          <div class="domain-header">
            <h3>{{ getDomainName(key) }}</h3>
            <el-tag :type="getTrendType(domain.trend)" size="small">
              {{ getTrendText(domain.trend) }}
            </el-tag>
          </div>
          
          <div class="progress-section">
            <div class="progress-bar">
              <el-progress 
                :percentage="domain.progress" 
                :color="getProgressColor(domain.progress)"
                :show-text="false"
              />
            </div>
            <div class="progress-info">
              <span class="current-level">当前水平: {{ domain.currentLevel }}%</span>
              <span class="benchmark">同龄基准: {{ domain.benchmark }}%</span>
            </div>
          </div>

          <div class="domain-recommendations">
            <h4>改进建议</h4>
            <ul>
              <li v-for="(rec, index) in domain.recommendations.slice(0, 3)" :key="index">
                {{ rec }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 行为表现分析 -->
    <div class="behavior-section">
      <div class="section-header">
        <h2>行为表现分析</h2>
        <el-button size="small" @click="showBehaviorTrends">查看趋势</el-button>
      </div>
      
      <div class="behavior-radar">
        <div ref="behaviorChartRef" class="chart-container"></div>
      </div>
      
      <div class="behavior-insights">
        <div class="insight-item" v-for="(insight, index) in behaviorInsights" :key="index">
          <div class="insight-icon">
            <UnifiedIcon name="default" />
          </div>
          <div class="insight-content">
            <h4>{{ insight.title }}</h4>
            <p>{{ insight.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 个性化学习计划 -->
    <div class="learning-plan-section">
      <div class="section-header">
        <h2>个性化学习计划</h2>
        <el-button type="primary" @click="generateNewPlan">
          <UnifiedIcon name="Plus" />
          生成新计划
        </el-button>
      </div>
      
      <div class="learning-plan-content" v-if="currentLearningPlan">
        <div class="plan-header">
          <h3>{{ currentLearningPlan.title }}</h3>
          <div class="plan-meta">
            <span class="plan-duration">{{ formatDateRange(currentLearningPlan.startDate, currentLearningPlan.endDate) }}</span>
            <el-tag type="success" size="small">活跃</el-tag>
          </div>
        </div>
        
        <div class="plan-objectives">
          <h4>学习目标</h4>
          <div class="objectives-list">
            <div class="objective-item" v-for="objective in currentLearningPlan.objectives" :key="objective">
              <UnifiedIcon name="Check" />
              <span>{{ objective }}</span>
            </div>
          </div>
        </div>
        
        <div class="plan-activities">
          <h4>推荐活动</h4>
          <div class="activities-grid">
            <div class="activity-card" v-for="activity in currentLearningPlan.activities" :key="activity.id">
              <div class="activity-header">
                <h5>{{ activity.title }}</h5>
                <el-tag :type="getActivityType(activity.type)" size="small">
                  {{ getActivityTypeName(activity.type) }}
                </el-tag>
              </div>
              <p class="activity-description">{{ activity.instructions.join(', ') }}</p>
              <div class="activity-meta">
                <span class="duration">{{ activity.duration }}分钟</span>
                <span class="difficulty">{{ getDifficultyName(activity.difficulty) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成长预测 -->
    <div class="prediction-section">
      <div class="section-header">
        <h2>成长预测</h2>
        <el-tag type="warning" size="small">基于AI模型预测</el-tag>
      </div>
      
      <div class="prediction-timeline">
        <div class="timeline-section">
          <h3>短期预测 ({{ analytics?.growthPrediction.shortTerm.period }})</h3>
          <div class="predictions-list">
            <div class="prediction-item" v-for="pred in analytics?.growthPrediction.shortTerm.predictions" :key="pred.domain">
              <div class="prediction-header">
                <span class="domain-name">{{ getDomainName(pred.domain) }}</span>
                <span class="growth-rate">+{{ pred.expectedGrowth }}%</span>
              </div>
              <div class="confidence-bar">
                <el-progress 
                  :percentage="pred.confidence" 
                  :show-text="false"
                  size="small"
                  color="var(--success-color)"
                />
                <span class="confidence-text">置信度: {{ pred.confidence }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="timeline-section">
          <h3>长期预测 ({{ analytics?.growthPrediction.longTerm.period }})</h3>
          <div class="predictions-list">
            <div class="prediction-item" v-for="pred in analytics?.growthPrediction.longTerm.predictions" :key="pred.domain">
              <div class="prediction-header">
                <span class="domain-name">{{ getDomainName(pred.domain) }}</span>
                <span class="growth-rate">+{{ pred.expectedGrowth }}%</span>
              </div>
              <div class="confidence-bar">
                <el-progress 
                  :percentage="pred.confidence" 
                  :show-text="false"
                  size="small"
                  color="var(--primary-color)"
                />
                <span class="confidence-text">置信度: {{ pred.confidence }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI建议面板 -->
    <div class="recommendations-section">
      <div class="section-header">
        <h2>AI智能建议</h2>
        <el-button size="small" @click="refreshRecommendations">
          <UnifiedIcon name="Refresh" />
          刷新建议
        </el-button>
      </div>
      
      <div class="recommendations-grid">
        <div class="recommendation-card" v-for="rec in analytics?.recommendations" :key="rec.id">
          <div class="rec-header">
            <div class="rec-title">{{ rec.title }}</div>
            <el-tag :type="getPriorityType(rec.priority)" size="small">
              {{ getPriorityText(rec.priority) }}
            </el-tag>
          </div>
          
          <div class="rec-content">
            <p class="rec-description">{{ rec.description }}</p>
            <div class="rec-meta">
              <span class="timeframe">预期时间: {{ rec.timeframe }}</span>
              <span class="outcome">预期效果: {{ rec.expectedOutcome }}</span>
            </div>
          </div>
          
          <div class="rec-actions">
            <el-button size="small" @click="implementRecommendation(rec)">
              采纳建议
            </el-button>
            <el-button size="small" link @click="viewRecommendationDetails(rec)">
              查看详情
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <UnifiedIcon name="default" />
      <p>AI正在分析学生数据...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Document,
  Refresh,
  TrendCharts,
  Star,
  ChatDotRound,
  InfoFilled,
  Check,
  Plus,
  Loading
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useStudentGrowthAnalytics } from '@/composables/useStudentGrowthAnalytics'
import type { StudentGrowthAnalytics, LearningPlan } from '@/types/ai-business-plus'

// 路由
const route = useRoute()
const router = useRouter()

// 学生ID
const studentId = route.params.id as string
const studentName = ref('张小明') // 这里应该从API获取

// 使用智能分析组合式函数
const {
  analytics,
  loading,
  analyzeStudentGrowth,
  generateLearningPlan,
  predictMilestones
} = useStudentGrowthAnalytics(studentId)

// 页面状态
const behaviorChartRef = ref<HTMLDivElement>()
const currentLearningPlan = ref<LearningPlan | null>(null)
const accuracyRate = ref(92)

// 计算属性
const achievedMilestones = computed(() => {
  return analytics.value?.milestones.filter(m => m.isAchieved).length || 0
})

const totalMilestones = computed(() => {
  return analytics.value?.milestones.length || 0
})

const upcomingMilestones = computed(() => {
  return predictMilestones.value || []
})

const behaviorInsights = computed(() => {
  if (!analytics.value) return []
  
  const behavior = analytics.value.behaviorAnalysis
  const insights = []
  
  if (behavior.attention > 80) {
    insights.push({
      title: '注意力表现优秀',
      description: '孩子在课堂上能够保持良好的注意力，建议继续保持现有的学习节奏。'
    })
  }
  
  if (behavior.cooperation < 60) {
    insights.push({
      title: '合作能力需要提升',
      description: '建议增加团队合作类活动，培养孩子的协作精神和团队意识。'
    })
  }
  
  if (behavior.creativity > 75) {
    insights.push({
      title: '创造力表现突出',
      description: '孩子具有很强的创造力，可以多参与艺术类和创意类活动。'
    })
  }
  
  return insights
})

// 页面方法
const goBack = () => {
  router.go(-1)
}

const refreshAnalysis = async () => {
  await analyzeStudentGrowth()
  ElMessage.success('分析数据已刷新')
}

const generateReport = () => {
  ElMessage.info('正在生成分析报告...')
  // 实现报告生成逻辑
}

const generateNewPlan = async () => {
  try {
    const plan = await generateLearningPlan()
    if (plan) {
      currentLearningPlan.value = plan
      ElMessage.success('新的学习计划已生成')
    }
  } catch (error) {
    ElMessage.error('生成学习计划失败')
  }
}

const showBehaviorTrends = () => {
  ElMessage.info('行为趋势功能开发中')
}

const refreshRecommendations = async () => {
  await analyzeStudentGrowth()
  ElMessage.success('建议已刷新')
}

const implementRecommendation = async (recommendation: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要采纳建议"${recommendation.title}"吗？`,
      '确认操作',
      { confirmButtonText: '确定', cancelButtonText: '取消' }
    )
    
    // 实现建议采纳逻辑
    ElMessage.success('建议已采纳，将加入学习计划')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const viewRecommendationDetails = (recommendation: any) => {
  ElMessage.info(`查看建议详情: ${recommendation.title}`)
}

// 初始化行为分析雷达图
const initBehaviorChart = () => {
  if (!behaviorChartRef.value || !analytics.value) return
  
  const chart = echarts.init(behaviorChartRef.value)
  const behavior = analytics.value.behaviorAnalysis
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    radar: {
      indicator: [
        { name: '注意力', max: 100 },
        { name: '合作性', max: 100 },
        { name: '独立性', max: 100 },
        { name: '情感调节', max: 100 },
        { name: '创造力', max: 100 },
        { name: '沟通能力', max: 100 }
      ],
      shape: 'circle',
      splitNumber: 4,
      axisName: {
        color: 'var(--text-secondary)'
      },
      splitLine: {
        lineStyle: {
          color: '#e0e0e0'
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(114, 172, 209, 0.1)', 'rgba(114, 172, 209, 0.05)']
        }
      }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [
              behavior.attention,
              behavior.cooperation,
              behavior.independence,
              behavior.emotional,
              behavior.creativity,
              behavior.communication
            ],
            name: '行为表现',
            itemStyle: {
              color: '#72ACD1'
            },
            areaStyle: {
              color: 'rgba(114, 172, 209, 0.3)'
            }
          }
        ]
      }
    ]
  }
  
  chart.setOption(option)
  
  // 响应式处理
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 工具函数
const getScoreDescription = (score: number) => {
  if (score >= 90) return '发展优秀'
  if (score >= 80) return '发展良好'
  if (score >= 70) return '发展正常'
  if (score >= 60) return '需要关注'
  return '需要重点关注'
}

const getDomainName = (key: string) => {
  const nameMap: Record<string, string> = {
    language: '语言表达',
    mathematics: '数学逻辑',
    science: '科学探索',
    social: '社交能力',
    creative: '创造力'
  }
  return nameMap[key] || key
}

const getTrendType = (trend: string) => {
  const typeMap: Record<string, string> = {
    improving: 'success',
    stable: 'info',
    declining: 'warning'
  }
  return typeMap[trend] || 'info'
}

const getTrendText = (trend: string) => {
  const textMap: Record<string, string> = {
    improving: '持续改善',
    stable: '保持稳定',
    declining: '需要关注'
  }
  return textMap[trend] || trend
}

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'var(--success-color)'
  if (progress >= 60) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const getPriorityType = (priority: string) => {
  const typeMap: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return typeMap[priority] || 'info'
}

const getPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return textMap[priority] || priority
}

const getActivityType = (type: string) => {
  const typeMap: Record<string, string> = {
    individual: 'info',
    group: 'success',
    'hands-on': 'warning',
    digital: 'primary'
  }
  return typeMap[type] || 'info'
}

const getActivityTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    individual: '个人活动',
    group: '团体活动',
    'hands-on': '实践活动',
    digital: '数字化活动'
  }
  return nameMap[type] || type
}

const getDifficultyName = (difficulty: string) => {
  const nameMap: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return nameMap[difficulty] || difficulty
}

const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate).toLocaleDateString('zh-CN')
  const end = new Date(endDate).toLocaleDateString('zh-CN')
  return `${start} - ${end}`
}

// 生命周期
onMounted(async () => {
  await analyzeStudentGrowth()
  await nextTick()
  initBehaviorChart()
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.student-analytics-page {
  padding: var(--spacing-lg);
  background: var(--el-bg-color-page);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-3xl);
  background: var(--el-bg-color);
  padding: var(--spacing-lg) var(--text-3xl);
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--text-base);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--text-xs);
}

.overview-section {
  margin-bottom: var(--text-3xl);
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.overview-card {
  background: var(--el-bg-color);
  padding: var(--text-2xl);
  border-radius: var(--text-xs);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
  display: flex;
  align-items: center;
  gap: var(--text-base);
}

.card-icon {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--spacing-sm);
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--spacing-lg);
}

.card-content {
  flex: 1;
  
  h3 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }
}

.score-display {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
  
  .score {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--el-color-primary);
  }
  
  .score-max {
    font-size: var(--text-base);
    color: var(--el-text-color-secondary);
  }
}

.score-description {
  font-size: var(--text-sm);
  color: var(--el-text-color-secondary);
  margin: 0;
}

.milestone-stats {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
  
  .achieved {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--el-color-success);
  }
  
  .milestone-label {
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
  }
}

.milestone-description {
  font-size: var(--text-sm);
  color: var(--el-text-color-secondary);
  margin: 0;
}

.recommendations-count {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
  
  .count {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--el-color-warning);
  }
  
  .count-label {
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
  }
}

.recommendations-description {
  font-size: var(--text-sm);
  color: var(--el-text-color-secondary);
  margin: 0;
}

.cognitive-section,
.behavior-section,
.learning-plan-section,
.prediction-section,
.recommendations-section {
  background: var(--el-bg-color);
  padding: var(--text-2xl);
  border-radius: var(--text-xs);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
  margin-bottom: var(--text-3xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
  
  h2 {
    font-size: var(--spacing-lg);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0;
  }
}

.cognitive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.cognitive-item {
  background: var(--el-bg-color-page);
  padding: var(--spacing-lg);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color);
}

.domain-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-lg);
  
  h3 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0;
  }
}

.progress-section {
  margin-bottom: var(--text-lg);
}

.progress-bar {
  margin-bottom: var(--spacing-sm);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--el-text-color-secondary);
}

.domain-recommendations {
  h4 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }
  
  ul {
    margin: 0;
    padding-left: var(--text-lg);
    
    li {
      font-size: var(--text-sm);
      color: var(--el-text-color-regular);
      margin-bottom: var(--spacing-xs);
    }
  }
}

.behavior-radar {
  display: flex;
  justify-content: center;
  margin-bottom: var(--text-3xl);
}

.chart-container {
  width: 100%;
  min-height: 60px; height: auto;
  max-width: 100%; max-width: 600px;
}

.behavior-insights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--text-base);
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: var(--text-xs);
  padding: var(--text-base);
  background: var(--el-bg-color-page);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color);
}

.insight-icon {
  width: var(--spacing-3xl);
  height: var(--spacing-3xl);
  border-radius: var(--radius-full);
  background: var(--el-color-info-light-8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-info);
  font-size: var(--text-base);
  flex-shrink: 0;
}

.insight-content {
  flex: 1;
  
  h4 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--spacing-xs) 0;
  }
  
  p {
    font-size: var(--text-sm);
    color: var(--el-text-color-regular);
    margin: 0;
    line-height: 1.4;
  }
}

.learning-plan-content {
  .plan-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);
    
    h3 {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0;
    }
  }
  
  .plan-meta {
    display: flex;
    align-items: center;
    gap: var(--text-xs);
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
  }
}

.plan-objectives,
.plan-activities {
  margin-bottom: var(--text-3xl);
  
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-sm) 0;
  }
}

.objectives-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.objective-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  
  .el-icon {
    color: var(--el-color-success);
  }
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--text-base);
}

.activity-card {
  background: var(--el-bg-color-page);
  padding: var(--text-base);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  
  h5 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0;
  }
}

.activity-description {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.4;
}

.activity-meta {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--el-text-color-secondary);
}

.prediction-timeline {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--text-2xl);
}

.timeline-section {
  h3 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-lg) 0;
  }
}

.predictions-list {
  display: flex;
  flex-direction: column;
  gap: var(--text-xs);
}

.prediction-item {
  background: var(--el-bg-color-page);
  padding: var(--text-base);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color);
}

.prediction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  
  .domain-name {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  
  .growth-rate {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--el-color-success);
  }
}

.confidence-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  .confidence-text {
    font-size: var(--text-xs);
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--text-base);
}

.recommendation-card {
  background: var(--el-bg-color-page);
  padding: var(--spacing-lg);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color);
}

.rec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-sm);
  
  .rec-title {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.rec-content {
  margin-bottom: var(--text-lg);
  
  .rec-description {
    font-size: var(--text-sm);
    color: var(--el-text-color-regular);
    margin: 0 0 var(--spacing-sm) 0;
    line-height: 1.4;
  }
}

.rec-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
  color: var(--el-text-color-secondary);
}

.rec-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--white-alpha-80);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000px;
  
  p {
    margin-top: var(--text-lg);
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .student-analytics-page {
    padding: var(--spacing-md);
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--text-base);
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .cognitive-grid {
    grid-template-columns: 1fr;
  }
  
  .prediction-timeline {
    grid-template-columns: 1fr;
  }
  
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
  
  .activities-grid {
    grid-template-columns: 1fr;
  }
}
</style>