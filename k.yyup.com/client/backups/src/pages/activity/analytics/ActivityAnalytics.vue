<template>
  <div class="page-container" v-loading="loading" element-loading-text="正在加载分析数据...">
    <page-header title="活动分析">
      <template #actions>
        <el-button type="primary" @click="handleExportReport">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
        <el-button type="success" @click="handleRefreshData">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </template>
    </page-header>

    <!-- 数据概览 -->
    <div class="app-card overview-section">
      <div class="app-card-content">
        <h3>数据概览</h3>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <div class="stat-value">{{ overviewData.totalActivities }}</div>
                <div class="stat-label">总活动数</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <div class="stat-value">{{ overviewData.totalParticipants }}</div>
                <div class="stat-label">总参与人数</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-content">
                <div class="stat-value">{{ overviewData.avgAttendanceRate }}%</div>
                <div class="stat-label">平均出席率</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <div class="stat-card">
              <div class="stat-icon">⭐</div>
              <div class="stat-content">
                <div class="stat-value">{{ overviewData.avgSatisfaction }}/5</div>
                <div class="stat-label">平均满意度</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="app-card filter-section">
      <div class="app-card-content">
        <el-form :model="filterForm" label-width="100px" class="filter-form">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
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
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="活动类型">
                <el-select 
                  v-model="filterForm.activityType" 
                  placeholder="全部类型" 
                  clearable
                  @change="handleFilterChange"
                >
                  <el-option 
                    v-for="type in activityTypeOptions" 
                    :key="type.value" 
                    :label="type.label" 
                    :value="type.value" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="活动状态">
                <el-select 
                  v-model="filterForm.status" 
                  placeholder="全部状态" 
                  clearable
                  @change="handleFilterChange"
                >
                  <el-option 
                    v-for="status in activityStatusOptions" 
                    :key="status.value" 
                    :label="status.label" 
                    :value="status.value" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item>
                <el-button type="primary" @click="handleAnalyze">
                  <el-icon><TrendCharts /></el-icon>
                  开始分析
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>

    <!-- 分析图表 -->
    <el-row :gutter="24">
      <!-- 活动类型分布 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <div class="app-card chart-section">
          <div class="app-card-content">
            <h3>活动类型分布</h3>
            <div ref="activityTypeChartRef" class="chart-container"></div>
          </div>
        </div>
      </el-col>

      <!-- 参与度趋势 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <div class="app-card chart-section">
          <div class="app-card-content">
            <h3>参与度趋势</h3>
            <div ref="participationTrendChartRef" class="chart-container"></div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <!-- 满意度分析 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <div class="app-card chart-section">
          <div class="app-card-content">
            <h3>满意度分析</h3>
            <div ref="satisfactionChartRef" class="chart-container"></div>
          </div>
        </div>
      </el-col>

      <!-- 转化率分析 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <div class="app-card chart-section">
          <div class="app-card-content">
            <h3>转化率分析</h3>
            <div ref="conversionChartRef" class="chart-container"></div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 活动排行榜 -->
    <div class="app-card ranking-section">
      <div class="app-card-content">
        <h3>活动排行榜</h3>
        <el-tabs v-model="activeRankingTab" @tab-change="handleRankingTabChange">
          <el-tab-pane label="参与度排行" name="participation">
            <el-table :data="participationRanking" stripe>
              <el-table-column type="index" label="排名" width="80" />
              <el-table-column prop="title" label="活动名称" min-width="200" />
              <el-table-column prop="participantCount" label="参与人数" width="120" />
              <el-table-column prop="attendanceRate" label="出席率" width="120">
                <template #default="{ row }">
                  {{ row.attendanceRate }}%
                </template>
              </el-table-column>
              <el-table-column prop="satisfactionScore" label="满意度" width="120">
                <template #default="{ row }">
                  {{ row.satisfactionScore }}/5
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          
          <el-tab-pane label="满意度排行" name="satisfaction">
            <el-table :data="satisfactionRanking" stripe>
              <el-table-column type="index" label="排名" width="80" />
              <el-table-column prop="title" label="活动名称" min-width="200" />
              <el-table-column prop="satisfactionScore" label="满意度" width="120">
                <template #default="{ row }">
                  {{ row.satisfactionScore }}/5
                </template>
              </el-table-column>
              <el-table-column prop="evaluationCount" label="评价数量" width="120" />
              <el-table-column prop="recommendationRate" label="推荐率" width="120">
                <template #default="{ row }">
                  {{ row.recommendationRate }}%
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          
          <el-tab-pane label="转化率排行" name="conversion">
            <el-table :data="conversionRanking" stripe>
              <el-table-column type="index" label="排名" width="80" />
              <el-table-column prop="title" label="活动名称" min-width="200" />
              <el-table-column prop="registrationCount" label="报名人数" width="120" />
              <el-table-column prop="conversionCount" label="转化人数" width="120" />
              <el-table-column prop="conversionRate" label="转化率" width="120">
                <template #default="{ row }">
                  {{ row.conversionRate }}%
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 分析报告 -->
    <div class="app-card report-section">
      <div class="app-card-content">
        <h3>分析报告</h3>
        <div class="report-content">
          <el-alert
            title="数据洞察"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <div class="insights">
                <p><strong>关键发现：</strong></p>
                <ul>
                  <li>亲子活动类型的参与度最高，平均出席率达到 {{ insights.bestActivityType.attendanceRate }}%</li>
                  <li>周末举办的活动比工作日活动参与度高 {{ insights.weekendVsWeekday }}%</li>
                  <li>活动满意度与活动时长呈现负相关，建议控制在 {{ insights.optimalDuration }} 分钟以内</li>
                  <li>{{ insights.seasonalTrend.season }} 是活动举办的最佳季节，转化率比其他季节高 {{ insights.seasonalTrend.improvement }}%</li>
                </ul>
                
                <p><strong>改进建议：</strong></p>
                <ul>
                  <li>增加亲子互动环节，提升家长参与感</li>
                  <li>优化活动时间安排，避开家长工作繁忙时段</li>
                  <li>加强活动前期宣传，提高报名转化率</li>
                  <li>建立活动反馈机制，持续优化活动质量</li>
                </ul>
              </div>
            </template>
          </el-alert>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Refresh, TrendCharts } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { get, type ApiResponse } from '@/utils/request'
import { ACTIVITY_ANALYTICS_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'

// TypeScript 接口定义
interface ActivityOverviewData {
  totalActivities: number
  totalParticipants: number
  avgAttendanceRate: number
  avgSatisfaction: number
}

interface ActivityRankingItem {
  title: string
  participantCount: number
  attendanceRate: number
  satisfactionScore: number
  evaluationCount?: number
  recommendationRate?: number
  registrationCount?: number
  conversionCount?: number
  conversionRate?: number
}

interface ActivityInsights {
  bestActivityType: {
    name: string
    attendanceRate: number
  }
  weekendVsWeekday: number
  optimalDuration: number
  seasonalTrend: {
    season: string
    improvement: number
  }
}

interface ActivityAnalyticsParams {
  startDate?: string
  endDate?: string
  activityType?: number
  status?: number
}

// 响应式数据
const loading = ref(false)
const dateRange = ref<[string, string]>(['2024-01-01', '2024-12-31'])
const activeRankingTab = ref('participation')

// 图表引用
const activityTypeChartRef = ref<HTMLDivElement>()
const participationTrendChartRef = ref<HTMLDivElement>()
const satisfactionChartRef = ref<HTMLDivElement>()
const conversionChartRef = ref<HTMLDivElement>()

// 筛选表单
const filterForm = reactive({
  activityType: undefined,
  status: undefined
})

// 概览数据
const overviewData = reactive<ActivityOverviewData>({
  totalActivities: 0,
  totalParticipants: 0,
  avgAttendanceRate: 0,
  avgSatisfaction: 0
})

// 活动类型选项
const activityTypeOptions = [
  { label: '开放日', value: 1 },
  { label: '家长会', value: 2 },
  { label: '亲子活动', value: 3 },
  { label: '招生宣讲', value: 4 },
  { label: '园区参观', value: 5 },
  { label: '其他', value: 6 }
]

// 活动状态选项
const activityStatusOptions = [
  { label: '计划中', value: 0 },
  { label: '报名中', value: 1 },
  { label: '已满员', value: 2 },
  { label: '进行中', value: 3 },
  { label: '已结束', value: 4 },
  { label: '已取消', value: 5 }
]

// 排行榜数据
const participationRanking = ref<ActivityRankingItem[]>([])
const satisfactionRanking = ref<ActivityRankingItem[]>([])
const conversionRanking = ref<ActivityRankingItem[]>([])

// 数据洞察
const insights = reactive<ActivityInsights>({
  bestActivityType: {
    name: '',
    attendanceRate: 0
  },
  weekendVsWeekday: 0,
  optimalDuration: 0,
  seasonalTrend: {
    season: '',
    improvement: 0
  }
})

// 初始化图表
const initCharts = async () => {
  await nextTick()
  
  // TODO: 使用 ECharts 或其他图表库初始化图表
  // 这里只是占位，实际项目中需要引入图表库
  console.log('初始化图表...')
}

// API调用函数
const fetchOverviewData = async (params: ActivityAnalyticsParams): Promise<ApiResponse<ActivityOverviewData>> => {
  return get(ACTIVITY_ANALYTICS_ENDPOINTS.BASE + '/overview', params)
}

const fetchParticipationRanking = async (params: ActivityAnalyticsParams): Promise<ApiResponse<ActivityRankingItem[]>> => {
  return get(ACTIVITY_ANALYTICS_ENDPOINTS.BASE + '/ranking/participation', params)
}

const fetchSatisfactionRanking = async (params: ActivityAnalyticsParams): Promise<ApiResponse<ActivityRankingItem[]>> => {
  return get(ACTIVITY_ANALYTICS_ENDPOINTS.BASE + '/ranking/satisfaction', params)
}

const fetchConversionRanking = async (params: ActivityAnalyticsParams): Promise<ApiResponse<ActivityRankingItem[]>> => {
  return get(ACTIVITY_ANALYTICS_ENDPOINTS.BASE + '/ranking/conversion', params)
}

const fetchInsightsData = async (params: ActivityAnalyticsParams): Promise<ApiResponse<ActivityInsights>> => {
  return get(ACTIVITY_ANALYTICS_ENDPOINTS.BASE + '/insights', params)
}

// 加载分析数据
const loadAnalyticsData = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    const params: ActivityAnalyticsParams = {
      startDate: dateRange.value[0],
      endDate: dateRange.value[1],
      activityType: filterForm.activityType,
      status: filterForm.status
    }

    // 并行请求所有数据
    const [
      overviewResponse,
      participationResponse,
      satisfactionResponse,
      conversionResponse,
      insightsResponse
    ] = await Promise.all([
      fetchOverviewData(params),
      fetchParticipationRanking(params),
      fetchSatisfactionRanking(params),
      fetchConversionRanking(params),
      fetchInsightsData(params)
    ])

    // 更新响应式数据
    if (overviewResponse.success && overviewResponse.data) {
      Object.assign(overviewData, overviewResponse.data)
    }

    if (participationResponse.success && participationResponse.data) {
      participationRanking.value = participationResponse.data
    }

    if (satisfactionResponse.success && satisfactionResponse.data) {
      satisfactionRanking.value = satisfactionResponse.data
    }

    if (conversionResponse.success && conversionResponse.data) {
      conversionRanking.value = conversionResponse.data
    }

    if (insightsResponse.success && insightsResponse.data) {
      Object.assign(insights, insightsResponse.data)
    }

    // 初始化图表
    await initCharts()
    
    ElMessage.success('数据加载完成')
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error)
    console.error('加载分析数据失败:', errorInfo)
  } finally {
    loading.value = false
  }
}

// 处理日期范围变化
const handleDateRangeChange = () => {
  loadAnalyticsData()
}

// 处理筛选条件变化
const handleFilterChange = () => {
  loadAnalyticsData()
}

// 开始分析
const handleAnalyze = () => {
  ElMessage.success('开始重新分析数据...')
  loadAnalyticsData()
}

// 导出报告
const handleExportReport = async () => {
  try {
    ElMessage.info('正在生成报告...')
    
    const params: ActivityAnalyticsParams = {
      startDate: dateRange.value[0],
      endDate: dateRange.value[1],
      activityType: filterForm.activityType,
      status: filterForm.status
    }
    
    // 调用导出API
    const response = await get(ACTIVITY_ANALYTICS_ENDPOINTS.BASE + '/export', params)
    
    if (response.success) {
      ElMessage.success('报告导出成功')
      // 这里可以添加下载逻辑
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error)
    console.error('导出报告失败:', errorInfo)
  }
}

// 刷新数据
const handleRefreshData = () => {
  ElMessage.success('正在刷新数据...')
  loadAnalyticsData()
}

// 排行榜标签页切换
const handleRankingTabChange = (tabName: string) => {
  console.log('切换到排行榜:', tabName)
}

onMounted(() => {
  loadAnalyticsData()
})
</script>

<style scoped>
.overview-section,
.filter-section,
.chart-section,
.ranking-section,
.report-section {
  margin-bottom: var(--text-3xl);
}

.stat-card {
  display: flex;
  align-items: center;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  border-radius: var(--spacing-sm);
  color: white;
  margin-bottom: var(--text-lg);
}

.stat-icon {
  font-size: var(--text-4xl);
  margin-right: var(--text-lg);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: bold;
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--text-sm);
  opacity: 0.9;
}

.chart-container {
  height: 300px;
  background: var(--bg-hover);
  border-radius: var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

.chart-container::before {
  content: '图表加载中...';
}

.filter-form {
  margin-bottom: 0;
}

.insights ul {
  margin: var(--spacing-sm) 0;
  padding-left: var(--text-2xl);
}

.insights li {
  margin-bottom: var(--spacing-sm);
  line-height: 1.6;
}

.report-content {
  margin-top: var(--text-lg);
}
</style>
