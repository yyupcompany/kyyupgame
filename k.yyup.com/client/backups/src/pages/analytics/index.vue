<template>
  <div class="analytics-dashboard">
    <!-- 页面头部 -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="page-title">数据分析中心</h1>
        <p class="page-description">全面的数据洞察和业务分析，助力科学决策</p>
      </div>
      <div class="header-actions">
        <el-button @click="refreshAllData" :loading="loading.all">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <el-button type="primary" @click="gotoReportBuilder">
          <el-icon><Plus /></el-icon>
          创建报表
        </el-button>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="metrics-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="metric-card enrollment-card">
            <div class="metric-content">
              <div class="metric-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ metrics.enrollment.total }}</div>
                <div class="metric-label">总招生人数</div>
                <div class="metric-trend" :class="metrics.enrollment.trend.type">
                  <el-icon v-if="metrics.enrollment.trend.type === 'up'"><TrendCharts /></el-icon>
                  <el-icon v-else><Bottom /></el-icon>
                  {{ metrics.enrollment.trend.value }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card revenue-card">
            <div class="metric-content">
              <div class="metric-icon">
                <el-icon><Money /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">¥{{ formatNumber(metrics.revenue.total) }}</div>
                <div class="metric-label">总收入</div>
                <div class="metric-trend" :class="metrics.revenue.trend.type">
                  <el-icon v-if="metrics.revenue.trend.type === 'up'"><TrendCharts /></el-icon>
                  <el-icon v-else><Bottom /></el-icon>
                  {{ metrics.revenue.trend.value }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card activities-card">
            <div class="metric-content">
              <div class="metric-icon">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ metrics.activities.total }}</div>
                <div class="metric-label">活动数量</div>
                <div class="metric-trend" :class="metrics.activities.trend.type">
                  <el-icon v-if="metrics.activities.trend.type === 'up'"><TrendCharts /></el-icon>
                  <el-icon v-else><Bottom /></el-icon>
                  {{ metrics.activities.trend.value }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card satisfaction-card">
            <div class="metric-content">
              <div class="metric-icon">
                <el-icon><Star /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ metrics.satisfaction.score }}分</div>
                <div class="metric-label">满意度评分</div>
                <div class="metric-trend" :class="metrics.satisfaction.trend.type">
                  <el-icon v-if="metrics.satisfaction.trend.type === 'up'"><TrendCharts /></el-icon>
                  <el-icon v-else><Bottom /></el-icon>
                  {{ metrics.satisfaction.trend.value }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表仪表板 -->
    <div class="charts-dashboard">
      <el-row :gutter="20">
        <!-- 招生趋势图 -->
        <el-col :span="12">
          <el-card class="chart-card" v-loading="loading.enrollment">
            <template #header>
              <div class="chart-header">
                <h3>招生趋势分析</h3>
                <el-select v-model="enrollmentPeriod" @change="loadEnrollmentData" size="small">
                  <el-option label="最近7天" value="7d" />
                  <el-option label="最近30天" value="30d" />
                  <el-option label="最近3个月" value="3m" />
                  <el-option label="最近1年" value="1y" />
                </el-select>
              </div>
            </template>
            <div ref="enrollmentChart" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 收入分析图 -->
        <el-col :span="12">
          <el-card class="chart-card" v-loading="loading.revenue">
            <template #header>
              <div class="chart-header">
                <h3>收入分析</h3>
                <el-select v-model="revenuePeriod" @change="loadRevenueData" size="small">
                  <el-option label="按月统计" value="month" />
                  <el-option label="按季度统计" value="quarter" />
                  <el-option label="按年统计" value="year" />
                </el-select>
              </div>
            </template>
            <div ref="revenueChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: var(--text-2xl);">
        <!-- 地区分布图 -->
        <el-col :span="8">
          <el-card class="chart-card" v-loading="loading.regions">
            <template #header>
              <h3>地区分布</h3>
            </template>
            <div ref="regionsChart" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 活动类型统计 -->
        <el-col :span="8">
          <el-card class="chart-card" v-loading="loading.activities">
            <template #header>
              <h3>活动类型统计</h3>
            </template>
            <div ref="activitiesChart" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 年龄分布 -->
        <el-col :span="8">
          <el-card class="chart-card" v-loading="loading.ageGroups">
            <template #header>
              <h3>年龄分布</h3>
            </template>
            <div ref="ageGroupsChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格区域 -->
    <div class="data-tables">
      <el-row :gutter="20">
        <!-- 最新招生记录 -->
        <el-col :span="12">
          <el-card class="table-card">
            <template #header>
              <div class="table-header">
                <h3>最新招生记录</h3>
                <el-button type="text" @click="viewMoreEnrollments">
                  查看更多
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
              </div>
            </template>
            <el-table :data="recentEnrollments" style="width: 100%" stripe>
              <el-table-column prop="studentName" label="学生姓名" width="100" />
              <el-table-column prop="grade" label="年级" width="80" />
              <el-table-column prop="enrollmentDate" label="报名日期" width="120">
                <template #default="scope">
                  {{ formatDate(scope.row.enrollmentDate) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="80">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>

        <!-- 热门活动 -->
        <el-col :span="12">
          <el-card class="table-card">
            <template #header>
              <div class="table-header">
                <h3>热门活动</h3>
                <el-button type="text" @click="viewMoreActivities">
                  查看更多
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
              </div>
            </template>
            <el-table :data="popularActivities" style="width: 100%" stripe>
              <el-table-column prop="name" label="活动名称" min-width="120" />
              <el-table-column prop="participants" label="参与人数" width="80" />
              <el-table-column prop="date" label="活动日期" width="120">
                <template #default="scope">
                  {{ formatDate(scope.row.date) }}
                </template>
              </el-table-column>
              <el-table-column prop="rating" label="评分" width="80">
                <template #default="scope">
                  <el-rate v-model="scope.row.rating" disabled size="small" />
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 快速操作区域 -->
    <div class="quick-actions">
      <el-card>
        <template #header>
          <h3>快速操作</h3>
        </template>
        <div class="actions-grid">
          <div class="action-item" @click="gotoReportBuilder">
            <el-icon class="action-icon"><DocumentAdd /></el-icon>
            <div class="action-text">
              <div class="action-title">创建报表</div>
              <div class="action-desc">拖拽式创建自定义报表</div>
            </div>
          </div>
          <div class="action-item" @click="exportData">
            <el-icon class="action-icon"><Download /></el-icon>
            <div class="action-text">
              <div class="action-title">导出数据</div>
              <div class="action-desc">导出Excel或PDF格式</div>
            </div>
          </div>
          <div class="action-item" @click="scheduleReport">
            <el-icon class="action-icon"><Clock /></el-icon>
            <div class="action-text">
              <div class="action-title">定时报表</div>
              <div class="action-desc">设置定时生成报表</div>
            </div>
          </div>
          <div class="action-item" @click="dataInsights">
            <el-icon class="action-icon"><TrendCharts /></el-icon>
            <div class="action-text">
              <div class="action-title">数据洞察</div>
              <div class="action-desc">AI智能分析建议</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Refresh, Plus, User, Money, Calendar, Star, TrendCharts, Bottom,
  ArrowRight, DocumentAdd, Download, Clock
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { get } from '@/utils/request'
import { ErrorHandler } from '@/utils/errorHandler'

const router = useRouter()

// 响应式数据
const loading = ref({
  all: false,
  enrollment: false,
  revenue: false,
  regions: false,
  activities: false,
  ageGroups: false
})

const enrollmentPeriod = ref('30d')
const revenuePeriod = ref('month')

// 核心指标数据
const metrics = ref({
  enrollment: {
    total: 1285,
    trend: { type: 'up', value: 12.5 }
  },
  revenue: {
    total: 2850000,
    trend: { type: 'up', value: 8.3 }
  },
  activities: {
    total: 48,
    trend: { type: 'up', value: 15.2 }
  },
  satisfaction: {
    score: 4.8,
    trend: { type: 'up', value: 3.1 }
  }
})

// 表格数据
const recentEnrollments = ref([
  { studentName: '张小明', grade: '大班', enrollmentDate: '2024-07-15', status: '已确认' },
  { studentName: '李小红', grade: '中班', enrollmentDate: '2024-07-14', status: '待确认' },
  { studentName: '王小华', grade: '小班', enrollmentDate: '2024-07-13', status: '已确认' },
  { studentName: '陈小东', grade: '大班', enrollmentDate: '2024-07-12', status: '已确认' },
  { studentName: '赵小美', grade: '中班', enrollmentDate: '2024-07-11', status: '待确认' }
])

const popularActivities = ref([
  { name: '夏季运动会', participants: 156, date: '2024-07-20', rating: 5 },
  { name: '绘画比赛', participants: 98, date: '2024-07-18', rating: 4 },
  { name: '音乐表演', participants: 132, date: '2024-07-16', rating: 5 },
  { name: '科学实验', participants: 84, date: '2024-07-14', rating: 4 },
  { name: '手工制作', participants: 76, date: '2024-07-12', rating: 4 }
])

// 图表引用
const enrollmentChart = ref<HTMLElement>()
const revenueChart = ref<HTMLElement>()
const regionsChart = ref<HTMLElement>()
const activitiesChart = ref<HTMLElement>()
const ageGroupsChart = ref<HTMLElement>()

let chartInstances: { [key: string]: echarts.ECharts } = {}

// 页面初始化
onMounted(async () => {
  await loadAllData()
  await nextTick()
  initAllCharts()
})

// 数据加载函数
const loadAllData = async () => {
  loading.value.all = true
  try {
    await Promise.all([
      loadMetrics(),
      loadEnrollmentData(),
      loadRevenueData(),
      loadRegionsData(),
      loadActivitiesData(),
      loadAgeGroupsData()
    ])
  } catch (error) {
    ErrorHandler.handle(error, '加载数据失败')
  } finally {
    loading.value.all = false
  }
}

const loadMetrics = async () => {
  try {
    // 模拟API调用
    const res = await get('/analytics/metrics')
    if (res?.success && res.data) {
      metrics.value = res.data
    }
  } catch (error) {
    // 使用模拟数据
    console.log('Using mock metrics data')
  }
}

const loadEnrollmentData = async () => {
  loading.value.enrollment = true
  try {
    const res = await get(`/analytics/enrollment-trend?period=${enrollmentPeriod.value}`)
    if (res?.success && res.data) {
      updateEnrollmentChart(res.data)
    } else {
      updateEnrollmentChart(getMockEnrollmentData())
    }
  } catch (error) {
    updateEnrollmentChart(getMockEnrollmentData())
  } finally {
    loading.value.enrollment = false
  }
}

const loadRevenueData = async () => {
  loading.value.revenue = true
  try {
    const res = await get(`/analytics/revenue?period=${revenuePeriod.value}`)
    if (res?.success && res.data) {
      updateRevenueChart(res.data)
    } else {
      updateRevenueChart(getMockRevenueData())
    }
  } catch (error) {
    updateRevenueChart(getMockRevenueData())
  } finally {
    loading.value.revenue = false
  }
}

const loadRegionsData = async () => {
  loading.value.regions = true
  try {
    const res = await get('/analytics/regions')
    if (res?.success && res.data) {
      updateRegionsChart(res.data)
    } else {
      updateRegionsChart(getMockRegionsData())
    }
  } catch (error) {
    updateRegionsChart(getMockRegionsData())
  } finally {
    loading.value.regions = false
  }
}

const loadActivitiesData = async () => {
  loading.value.activities = true
  try {
    const res = await get('/analytics/activity-types')
    if (res?.success && res.data) {
      updateActivitiesChart(res.data)
    } else {
      updateActivitiesChart(getMockActivitiesData())
    }
  } catch (error) {
    updateActivitiesChart(getMockActivitiesData())
  } finally {
    loading.value.activities = false
  }
}

const loadAgeGroupsData = async () => {
  loading.value.ageGroups = true
  try {
    const res = await get('/analytics/age-groups')
    if (res?.success && res.data) {
      updateAgeGroupsChart(res.data)
    } else {
      updateAgeGroupsChart(getMockAgeGroupsData())
    }
  } catch (error) {
    updateAgeGroupsChart(getMockAgeGroupsData())
  } finally {
    loading.value.ageGroups = false
  }
}

// 图表初始化
const initAllCharts = () => {
  initEnrollmentChart()
  initRevenueChart()
  initRegionsChart()
  initActivitiesChart()
  initAgeGroupsChart()
}

const initEnrollmentChart = () => {
  if (!enrollmentChart.value) return
  chartInstances.enrollment = echarts.init(enrollmentChart.value)
  updateEnrollmentChart(getMockEnrollmentData())
}

const initRevenueChart = () => {
  if (!revenueChart.value) return
  chartInstances.revenue = echarts.init(revenueChart.value)
  updateRevenueChart(getMockRevenueData())
}

const initRegionsChart = () => {
  if (!regionsChart.value) return
  chartInstances.regions = echarts.init(regionsChart.value)
  updateRegionsChart(getMockRegionsData())
}

const initActivitiesChart = () => {
  if (!activitiesChart.value) return
  chartInstances.activities = echarts.init(activitiesChart.value)
  updateActivitiesChart(getMockActivitiesData())
}

const initAgeGroupsChart = () => {
  if (!ageGroupsChart.value) return
  chartInstances.ageGroups = echarts.init(ageGroupsChart.value)
  updateAgeGroupsChart(getMockAgeGroupsData())
}

// 图表更新函数
const updateEnrollmentChart = (data: any) => {
  if (!chartInstances.enrollment) return
  
  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: data.categories
    },
    yAxis: { type: 'value' },
    series: [{
      name: '招生人数',
      type: 'line',
      data: data.values,
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.6)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
        ])
      }
    }]
  }
  chartInstances.enrollment.setOption(option)
}

const updateRevenueChart = (data: any) => {
  if (!chartInstances.revenue) return
  
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['收入', '支出'] },
    xAxis: {
      type: 'category',
      data: data.categories
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '收入',
        type: 'bar',
        data: data.income,
        itemStyle: { color: 'var(--success-color)' }
      },
      {
        name: '支出',
        type: 'bar',
        data: data.expense,
        itemStyle: { color: 'var(--danger-color)' }
      }
    ]
  }
  chartInstances.revenue.setOption(option)
}

const updateRegionsChart = (data: any) => {
  if (!chartInstances.regions) return
  
  const option = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: '50%',
      data: data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'var(--shadow-heavy)'
        }
      }
    }]
  }
  chartInstances.regions.setOption(option)
}

const updateActivitiesChart = (data: any) => {
  if (!chartInstances.activities) return
  
  const option = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      data: data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'var(--shadow-heavy)'
        }
      }
    }]
  }
  chartInstances.activities.setOption(option)
}

const updateAgeGroupsChart = (data: any) => {
  if (!chartInstances.ageGroups) return
  
  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: data.categories
    },
    yAxis: { type: 'value' },
    series: [{
      name: '人数',
      type: 'bar',
      data: data.values,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#ffd700' },
          { offset: 1, color: '#ffb347' }
        ])
      }
    }]
  }
  chartInstances.ageGroups.setOption(option)
}

// 模拟数据生成函数
const getMockEnrollmentData = () => ({
  categories: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
  values: [120, 98, 145, 178, 156, 189, 165]
})

const getMockRevenueData = () => ({
  categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
  income: [450000, 520000, 480000, 610000, 580000, 670000],
  expense: [320000, 350000, 380000, 420000, 410000, 460000]
})

const getMockRegionsData = () => [
  { value: 35, name: '海淀区' },
  { value: 28, name: '朝阳区' },
  { value: 22, name: '丰台区' },
  { value: 15, name: '西城区' }
]

const getMockActivitiesData = () => [
  { value: 30, name: '体育活动' },
  { value: 25, name: '艺术创作' },
  { value: 20, name: '科学探索' },
  { value: 15, name: '音乐舞蹈' },
  { value: 10, name: '其他' }
]

const getMockAgeGroupsData = () => ({
  categories: ['3-4岁', '4-5岁', '5-6岁', '6-7岁'],
  values: [285, 456, 398, 146]
})

// 工具函数
const formatNumber = (num: number): string => {
  return (num / 10000).toFixed(1) + '万'
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const getStatusType = (status: string): string => {
  return status === '已确认' ? 'success' : 'warning'
}

// 事件处理函数
const refreshAllData = () => {
  loadAllData()
}

const gotoReportBuilder = () => {
  router.push('/analytics/report-builder')
}

const viewMoreEnrollments = () => {
  router.push('/enrollment/applications')
}

const viewMoreActivities = () => {
  router.push('/activities')
}

const exportData = () => {
  ElMessage.success('数据导出功能开发中...')
}

const scheduleReport = () => {
  ElMessage.success('定时报表功能开发中...')
}

const dataInsights = () => {
  ElMessage.success('AI数据洞察功能开发中...')
}

// 响应式处理
window.addEventListener('resize', () => {
  Object.values(chartInstances).forEach(chart => {
    chart?.resize()
  })
})
</script>

<style scoped lang="scss">
.analytics-dashboard {
  padding: var(--spacing-lg);
  background: var(--el-bg-color-page);
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  
  .header-content {
    .page-title {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--text-3xl);
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    
    .page-description {
      margin: 0;
      color: var(--el-text-color-regular);
      font-size: var(--text-base);
    }
  }
  
  .header-actions {
    display: flex;
    gap: var(--spacing-md);
  }
}

.metrics-cards {
  margin-bottom: var(--spacing-xl);
  
  .metric-card {
    border: none;
    box-shadow: var(--shadow-md);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    
    .metric-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
    }
    
    .metric-icon {
      width: 60px;
      height: 60px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-2xl);
      color: white;
    }
    
    &.enrollment-card .metric-icon {
      background: var(--gradient-blue);
    }
    
    &.revenue-card .metric-icon {
      background: var(--gradient-green);
    }
    
    &.activities-card .metric-icon {
      background: var(--gradient-purple);
    }
    
    &.satisfaction-card .metric-icon {
      background: var(--gradient-orange);
    }
    
    .metric-info {
      flex: 1;
      
      .metric-value {
        font-size: var(--text-3xl);
        font-weight: 700;
        color: var(--el-text-color-primary);
        line-height: 1;
        margin-bottom: var(--spacing-xs);
      }
      
      .metric-label {
        font-size: var(--text-sm);
        color: var(--el-text-color-regular);
        margin-bottom: var(--spacing-xs);
      }
      
      .metric-trend {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-sm);
        font-weight: 500;
        
        &.up {
          color: var(--el-color-success);
        }
        
        &.down {
          color: var(--el-color-danger);
        }
      }
    }
  }
}

.charts-dashboard {
  margin-bottom: var(--spacing-xl);
  
  .chart-card {
    border: none;
    box-shadow: var(--shadow-md);
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        color: var(--el-text-color-primary);
        font-size: var(--text-lg);
        font-weight: 600;
      }
    }
    
    .chart-container {
      width: 100%;
      height: 300px;
    }
  }
}

.data-tables {
  margin-bottom: var(--spacing-xl);
  
  .table-card {
    border: none;
    box-shadow: var(--shadow-md);
    
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        color: var(--el-text-color-primary);
        font-size: var(--text-lg);
        font-weight: 600;
      }
    }
  }
}

.quick-actions {
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-lg);
    
    .action-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
      border-radius: var(--radius-lg);
      background: var(--el-fill-color-lighter);
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: var(--el-color-primary-light-9);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
      
      .action-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-full);
        background: var(--el-color-primary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-xl);
      }
      
      .action-text {
        .action-title {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: var(--spacing-xs);
        }
        
        .action-desc {
          font-size: var(--text-sm);
          color: var(--el-text-color-regular);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-xl)) {
  .actions-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-lg);
    
    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
  
  .metrics-cards {
    :deep(.el-row) {
      margin: 0 !important;
      
      .el-col {
        margin-bottom: var(--spacing-md);
        padding: 0 !important;
      }
    }
  }
  
  .actions-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>