<template>
  <div class="activity-analytics">
    <!-- 筛选器 -->
    <div class="filters">
      <el-form :model="filterForm" inline>
        <el-form-item label="活动">
          <el-select v-model="filterForm.activityId" placeholder="选择活动" clearable filterable>
            <el-option
              v-for="activity in activityOptions"
              :key="activity.id"
              :label="activity.title"
              :value="activity.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateRangeChange"
          />
        </el-form-item>
        <el-form-item label="活动类型">
          <el-select v-model="filterForm.type" placeholder="选择类型" clearable>
            <el-option label="体验课" value="trial" />
            <el-option label="亲子活动" value="family" />
            <el-option label="节日庆典" value="festival" />
            <el-option label="教育讲座" value="lecture" />
            <el-option label="户外活动" value="outdoor" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAnalyze">分析</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" :icon="Download" @click="handleExportReport">
            导出报告
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 概览统计 -->
    <div class="overview-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="icon-users"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ analyticsData?.overview.totalParticipants || 0 }}</div>
          <div class="stat-label">总参与人数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="icon-check-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatPercentage(analyticsData?.overview.completionRate) }}</div>
          <div class="stat-label">完成率</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="icon-star"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatScore(analyticsData?.overview.satisfactionScore) }}</div>
          <div class="stat-label">满意度评分</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="icon-dollar-sign"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">¥{{ formatMoney(analyticsData?.overview.revenue) }}</div>
          <div class="stat-label">总收入</div>
        </div>
      </div>
    </div>

    <!-- 图表分析 -->
    <div class="charts-grid">
      <!-- 参与度分析 -->
      <div class="chart-card">
        <div class="chart-header">
          <h4>参与度分析</h4>
          <div class="chart-tabs">
            <el-radio-group v-model="participationTab" @change="handleParticipationTabChange">
              <el-radio-button label="age">年龄分布</el-radio-button>
              <el-radio-button label="gender">性别分布</el-radio-button>
              <el-radio-button label="source">来源分析</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="chart-content">
          <ChartContainer
            :data="participationChartData"
            :type="participationChartType"
            height="300px"
            :loading="chartLoading"
          />
        </div>
      </div>

      <!-- 满意度分析 -->
      <div class="chart-card">
        <div class="chart-header">
          <h4>满意度分析</h4>
          <span class="chart-subtitle">用户评价分布</span>
        </div>
        <div class="chart-content">
          <ChartContainer
            :data="satisfactionChartData"
            type="bar"
            height="300px"
            :loading="chartLoading"
          />
        </div>
      </div>

      <!-- 活动效果趋势 -->
      <div class="chart-card full-width">
        <div class="chart-header">
          <h4>活动效果趋势</h4>
          <span class="chart-subtitle">参与人数和满意度变化</span>
        </div>
        <div class="chart-content">
          <ChartContainer
            :data="trendChartData"
            type="line"
            height="400px"
            :loading="chartLoading"
          />
        </div>
      </div>
    </div>

    <!-- 详细报告 -->
    <div class="detailed-report">
      <div class="report-header">
        <h3>详细分析报告</h3>
        <el-button type="primary" @click="handleGenerateReport">
          生成完整报告
        </el-button>
      </div>

      <div class="report-content">
        <!-- 参与度分析表格 -->
        <div class="report-section">
          <h4>参与度详细数据</h4>
          <el-table :data="participationTableData" stripe>
            <el-table-column prop="category" label="分类" width="120" />
            <el-table-column prop="count" label="人数" width="100" />
            <el-table-column prop="percentage" label="占比" width="100">
              <template #default="{ row }">
                {{ formatPercentage(row.percentage) }}
              </template>
            </el-table-column>
            <el-table-column prop="trend" label="趋势" width="100">
              <template #default="{ row }">
                <el-tag :type="getTrendTagType(row.trend)" size="small">
                  {{ getTrendLabel(row.trend) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" />
          </el-table>
        </div>

        <!-- 用户反馈 -->
        <div class="report-section">
          <h4>用户反馈</h4>
          <div class="feedback-list">
            <div 
              v-for="feedback in feedbackList" 
              :key="feedback.id"
              class="feedback-item"
            >
              <div class="feedback-header">
                <div class="feedback-rating">
                  <el-rate 
                    v-model="feedback.rating" 
                    disabled 
                    show-score 
                    text-color="#ff9900"
                  />
                </div>
                <div class="feedback-date">{{ formatDate(feedback.date) }}</div>
              </div>
              <div class="feedback-content">{{ feedback.comment }}</div>
            </div>
          </div>
        </div>

        <!-- 改进建议 -->
        <div class="report-section">
          <h4>改进建议</h4>
          <div class="suggestions">
            <div 
              v-for="suggestion in suggestions" 
              :key="suggestion.id"
              class="suggestion-item"
            >
              <div class="suggestion-icon">
                <i :class="suggestion.icon"></i>
              </div>
              <div class="suggestion-content">
                <h5>{{ suggestion.title }}</h5>
                <p>{{ suggestion.description }}</p>
              </div>
              <div class="suggestion-priority">
                <el-tag :type="getPriorityTagType(suggestion.priority)" size="small">
                  {{ suggestion.priority }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'

// 组件导入
import ChartContainer from '@/components/centers/ChartContainer.vue'

// API导入
import {
  getActivityAnalytics,
  getParticipationAnalysis,
  getActivities,
  type ActivityAnalytics,
  type Activity
} from '@/api/activity-center'

// 数据状态
const loading = ref(false)
const chartLoading = ref(false)
const analyticsData = ref<ActivityAnalytics | null>(null)
const activityOptions = ref<Activity[]>([])

// 筛选表单
const filterForm = ref({
  activityId: '',
  startDate: '',
  endDate: '',
  type: ''
})

// 日期范围
const dateRange = ref<[string, string] | null>(null)

// 图表状态
const participationTab = ref('age')

// 计算属性
const participationChartData = computed(() => {
  if (!analyticsData.value) return []
  
  const data = analyticsData.value.participation
  switch (participationTab.value) {
    case 'age':
      return data.byAge
    case 'gender':
      return data.byGender
    case 'source':
      return data.bySource
    default:
      return []
  }
})

const participationChartType = computed(() => {
  return participationTab.value === 'age' ? 'bar' : 'pie'
})

const satisfactionChartData = computed(() => {
  if (!analyticsData.value) return []
  return analyticsData.value.feedback.ratings.map(item => ({
    name: `${item.rating}星`,
    value: item.count
  }))
})

const trendChartData = computed(() => {
  // 模拟趋势数据
  return [
    { name: '1月', participants: 120, satisfaction: 4.2 },
    { name: '2月', participants: 150, satisfaction: 4.3 },
    { name: '3月', participants: 180, satisfaction: 4.1 },
    { name: '4月', participants: 200, satisfaction: 4.4 },
    { name: '5月', participants: 220, satisfaction: 4.5 },
    { name: '6月', participants: 250, satisfaction: 4.6 }
  ]
})

const participationTableData = computed(() => {
  if (!analyticsData.value) return []
  
  return analyticsData.value.participation.byAge.map(item => ({
    category: item.age,
    count: item.count,
    percentage: item.count / analyticsData.value!.overview.totalParticipants,
    trend: Math.random() > 0.5 ? 'up' : 'down',
    remark: '正常范围'
  }))
})

const feedbackList = computed(() => {
  if (!analyticsData.value) return []
  return analyticsData.value.feedback.comments.slice(0, 5)
})

const suggestions = ref([
  {
    id: 1,
    icon: 'icon-target',
    title: '提高活动参与度',
    description: '建议增加互动环节，提升用户参与体验',
    priority: '高'
  },
  {
    id: 2,
    icon: 'icon-clock',
    title: '优化活动时间安排',
    description: '根据用户反馈调整活动时长和时间段',
    priority: '中'
  },
  {
    id: 3,
    icon: 'icon-map-pin',
    title: '改善活动场地',
    description: '考虑更换或改进活动场地设施',
    priority: '低'
  }
])

// 加载活动选项
const loadActivityOptions = async () => {
  try {
    const response = await getActivities({ pageSize: 100 })
    if (response.success) {
      activityOptions.value = response.data.items
    }
  } catch (error) {
    console.error('Failed to load activity options:', error)
  }
}

// 加载分析数据
const loadAnalyticsData = async () => {
  chartLoading.value = true
  try {
    const response = await getActivityAnalytics(filterForm.value)
    if (response.success) {
      analyticsData.value = response.data
    }
  } catch (error) {
    console.error('Failed to load analytics data:', error)
    ElMessage.error('加载分析数据失败')
  } finally {
    chartLoading.value = false
  }
}

// 处理日期范围变化
const handleDateRangeChange = (dates: [string, string] | null) => {
  if (dates) {
    filterForm.value.startDate = dates[0]
    filterForm.value.endDate = dates[1]
  } else {
    filterForm.value.startDate = ''
    filterForm.value.endDate = ''
  }
}

// 处理分析
const handleAnalyze = () => {
  loadAnalyticsData()
}

// 处理重置
const handleReset = () => {
  filterForm.value = {
    activityId: '',
    startDate: '',
    endDate: '',
    type: ''
  }
  dateRange.value = null
  loadAnalyticsData()
}

// 处理参与度标签页变化
const handleParticipationTabChange = () => {
  // 标签页变化时重新渲染图表
}

// 处理导出报告
const handleExportReport = () => {
  ElMessage.info('导出报告功能开发中...')
}

// 处理生成报告
const handleGenerateReport = () => {
  ElMessage.info('生成完整报告功能开发中...')
}

// 工具函数
const formatPercentage = (value?: number) => {
  return value ? `${(value * 100).toFixed(1)}%` : '0%'
}

const formatScore = (value?: number) => {
  return value ? value.toFixed(1) : '0.0'
}

const formatMoney = (value?: number) => {
  return value ? value.toLocaleString() : '0'
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString()
}

const getTrendTagType = (trend: string) => {
  return trend === 'up' ? 'success' : trend === 'down' ? 'danger' : 'info'
}

const getTrendLabel = (trend: string) => {
  const trendMap: Record<string, string> = {
    up: '上升',
    down: '下降',
    stable: '稳定'
  }
  return trendMap[trend] || '稳定'
}

const getPriorityTagType = (priority: string) => {
  const priorityMap: Record<string, string> = {
    高: 'danger',
    中: 'warning',
    低: 'info'
  }
  return priorityMap[priority] || 'info'
}

// 初始化
onMounted(() => {
  loadActivityOptions()
  loadAnalyticsData()
})
</script>

<style scoped lang="scss">
@import '@/styles/analytics.scss';

.activity-analytics {
  min-height: 100vh;
  background: var(--bg-hover);
}

.filters {
  display: flex;
  gap: var(--text-lg);
  align-items: center;
  flex-wrap: wrap;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--text-2xl);
  margin-bottom: var(--text-3xl);
}

.stat-card {
  background: var(--bg-white);
  border-radius: var(--spacing-sm);
  padding: var(--text-3xl);
  box-shadow: 0 2px var(--text-sm) var(--shadow-light);
  text-align: center;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--text-2xl);
  margin-bottom: var(--text-3xl);
}

.chart-card {
  background: var(--bg-white);
  border-radius: var(--spacing-sm);
  padding: var(--text-2xl);
  box-shadow: 0 2px var(--text-sm) var(--shadow-light);

  &.full-width {
    grid-column: 1 / -1;
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-lg);
}

.chart-tabs {
  .el-radio-group {
    .el-radio-button {
      margin-left: 0;
    }
  }
}

.detailed-report {
  margin-top: var(--text-3xl);
  
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-lg);
    
    h3 {
      margin: 0;
      font-size: var(--text-xl);
      font-weight: 600;
    }
  }
  
  .report-section {
    margin-bottom: var(--text-3xl);
    
    h4 {
      margin: 0 0 var(--text-sm) 0;
      font-size: var(--text-lg);
      font-weight: 500;
    }
  }
}

.feedback-list {
  .feedback-item {
    padding: var(--text-lg);
    border: var(--border-width-base) solid var(--el-border-color-light);
    border-radius: var(--spacing-sm);
    margin-bottom: var(--text-sm);
    
    .feedback-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-sm);
    }
    
    .feedback-date {
      font-size: var(--text-sm);
      color: var(--el-text-color-secondary);
    }
    
    .feedback-content {
      color: var(--el-text-color-regular);
      line-height: 1.5;
    }
  }
}

.suggestions {
  .suggestion-item {
    display: flex;
    align-items: flex-start;
    padding: var(--text-lg);
    border: var(--border-width-base) solid var(--el-border-color-light);
    border-radius: var(--spacing-sm);
    margin-bottom: var(--text-sm);
    
    .suggestion-icon {
      width: var(--icon-size); height: var(--icon-size);
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%);
      border: var(--border-width-base) solid rgba(99, 102, 241, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: var(--text-sm);
      
      i {
        color: var(--el-color-primary);
        font-size: var(--text-xl);
      }
    }
    
    .suggestion-content {
      flex: 1;
      
      h5 {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: var(--text-base);
        font-weight: 500;
      }
      
      p {
        margin: 0;
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);
        line-height: 1.4;
      }
    }
    
    .suggestion-priority {
      margin-left: var(--text-sm);
    }
  }
}
</style>
