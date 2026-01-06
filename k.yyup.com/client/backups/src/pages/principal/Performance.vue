<template>
  <div class="page-container">
    <h1 class="page-title">招生业绩统计</h1>
    
    <!-- 时间筛选和导出工具栏 -->
    <div class="toolbar">
      <div class="date-filter">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="dateShortcuts"
          value-format="YYYY-MM-DD"
        />
        <el-button type="primary" @click="filterData">筛选</el-button>
        <el-button @click="resetFilter">重置</el-button>
      </div>
      
      <div class="export-buttons">
        <el-button type="success" @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
        <el-button type="primary" @click="printReport">
          <el-icon><Printer /></el-icon>
          打印报表
        </el-button>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="(stat, index) in statCards" :key="index">
        <el-card class="stat-card" :class="stat.type">
          <div class="stat-card-content">
            <div class="stat-icon">
              <el-icon>
                <component :is="stat.icon"></component>
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 业绩排名和趋势图表 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>招生业绩排名</span>
              <el-select v-model="rankType" size="small" placeholder="排名类型">
                <el-option label="累计招生数" value="total" />
                <el-option label="本月招生数" value="month" />
                <el-option label="转化率" value="rate" />
              </el-select>
            </div>
          </template>
          <div class="chart-container" v-loading="loading">
            <!-- 空状态处理 -->
            <EmptyState 
              v-if="!loading && rankingList.length === 0"
              type="no-data"
              title="暂无排名数据"
              description="还没有业绩排名信息，请稍后再试"
              size="medium"
              :primary-action="{
                text: '刷新数据',
                handler: loadRankingData
              }"
              :suggestions="[
                '确认是否已有业绩数据',
                '检查时间范围设置',
                '联系管理员查看数据'
              ]"
              :show-suggestions="true"
            />
            <div v-else class="ranking-list">
              <div v-for="(item, index) in rankingList" :key="index" class="ranking-item">
                <div class="ranking-index" :class="{'top-three': index < 3}">{{ index + 1 }}</div>
                <div class="ranking-info">
                  <div class="ranking-name">{{ item.name }}</div>
                  <div class="ranking-value">
                    {{ rankType === 'rate' ? item.value + '%' : item.value }}
                    <span class="ranking-label">{{ getRankTypeLabel() }}</span>
                  </div>
                </div>
                <div class="ranking-progress">
                  <el-progress 
                    :percentage="calculatePercentage(item.value)" 
                    :color="getProgressColor(index)"
                    :show-text="false"
                    :stroke-width="8"
                  />
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>招生趋势分析</span>
              <el-radio-group v-model="trendPeriod" size="small">
                <el-radio-button value="week">周</el-radio-button>
                <el-radio-button value="month">月</el-radio-button>
                <el-radio-button value="quarter">季度</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" v-loading="loading">
            <div class="chart-placeholder" ref="trendChart">招生趋势分析图表</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 业绩明细表格 -->
    <el-card class="detail-card">
      <template #header>
        <div class="detail-header">
          <span>业绩明细</span>
          <div class="header-actions">
            <el-radio-group v-model="detailType" size="small">
              <el-radio-button value="teacher">按老师</el-radio-button>
              <el-radio-button value="source">按来源</el-radio-button>
              <el-radio-button value="class">按班级</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>
      
      <!-- 空状态处理 -->
      <EmptyState 
        v-if="!loading && performanceDetails.length === 0"
        type="no-data"
        title="暂无业绩明细"
        description="当前筛选条件下没有找到业绩数据"
        size="medium"
        :primary-action="{
          text: '重置筛选',
          handler: resetFilter
        }"
        :secondary-action="{
          text: '刷新数据',
          handler: loadDetailData
        }"
        :suggestions="[
          '调整时间范围或筛选条件',
          '确认是否有相关业绩数据',
          '联系管理员核实数据'
        ]"
        :show-suggestions="true"
      />
      
      <el-table
        v-else
        v-loading="loading"
        :data="performanceDetails"
        style="width: 100%"
        border
      >
        <el-table-column v-if="detailType === 'teacher'" prop="name" label="老师姓名" min-width="120" />
        <el-table-column v-if="detailType === 'source'" prop="name" label="招生来源" min-width="120" />
        <el-table-column v-if="detailType === 'class'" prop="name" label="招生班级" min-width="120" />
        
        <el-table-column prop="leads" label="获取客户数" min-width="100" sortable />
        <el-table-column prop="followups" label="跟进次数" min-width="100" sortable />
        <el-table-column prop="visits" label="到访人数" min-width="100" sortable />
        <el-table-column prop="applications" label="申请人数" min-width="100" sortable />
        <el-table-column prop="enrollments" label="注册人数" min-width="100" sortable />
        
        <el-table-column label="转化率" min-width="100" sortable>
          <template #default="scope">
            {{ calculateConversionRate(scope.row.enrollments, scope.row.leads) }}%
          </template>
        </el-table-column>
        
        <el-table-column label="访问转化率" min-width="120" sortable>
          <template #default="scope">
            {{ calculateConversionRate(scope.row.enrollments, scope.row.visits) }}%
          </template>
        </el-table-column>
        
        <el-table-column label="提成金额" min-width="120" sortable>
          <template #default="scope">
            ¥{{ scope.row.commission && typeof scope.row.commission === 'number' ? scope.row.commission.toFixed(2) : '0.00' }}
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 1. Vue 相关导入
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

// 2. Element Plus 导入
import { ElMessage } from 'element-plus'
import { 
  Trophy, Money, Promotion, User, View, Download, Printer, ArrowUp, ArrowDown
} from '@element-plus/icons-vue'

// 3. 公共工具函数导入
import { request } from '@/utils/request'
import { formatDateTime } from '../../utils/dateFormat'
import * as echarts from 'echarts'
import { PRINCIPAL_ENDPOINTS } from '@/api/endpoints'
import type { ApiResponse } from '@/api/endpoints'

// 4. 组件导入
import EmptyState from '@/components/common/EmptyState.vue'

// 4. 页面内部类型定义
// API响应接口
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string
}

// 业绩排名接口
interface ApiPerformanceRanking {
  id: number;
  name: string;
  value: number;
  rank: number
  avatar?: string;
  role: string;
  score: number;
  enrollments: number;
  activities: number;
  trend: 'up' | 'down' | 'stable';
  change: number
}

// 业绩统计接口
interface ApiPerformanceStats {
  totalEnrollments: number
  monthlyEnrollments: number
  avgConversionRate: number
  totalCommission: number
}

// 业绩明细接口
interface ApiPerformanceDetails {
  items: PerformanceDetail[];
  total: number
}

// 定义趋势数据项接口
interface TrendItem {
  period: string;
  value: number
}

// 业绩明细接口
interface PerformanceDetail {
  id?: number;
  name: string;
  leads: number;
  followups: number;
  visits: number;
  applications: number;
  enrollments: number;
  commission: number
}

// 统计卡片接口
interface StatCard {
  label: string;
  value: string;
  icon: string;
  type: string
}

// 响应式数据
const loading = ref(false)
const trendChart = ref<HTMLElement | null>(null)

// 日期范围选择
const dateRange = ref<string[]>([])
const dateShortcuts = [
  {
    text: '最近一周',
  value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近一个月',
  value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '最近三个月',
  value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
]

// 统计卡片数据
const statCards = ref<StatCard[]>([
  {
  label: '累计招生人数',
  value: '0',
  icon: 'User',
  type: 'primary'
  },
  {
  label: '本月招生人数',
  value: '0',
  icon: 'Promotion',
  type: 'success'
  },
  {
  label: '平均转化率',
  value: '0%',
  icon: 'View',
  type: 'warning'
  },
  {
  label: '累计提成金额',
  value: '¥0',
  icon: 'Money',
  type: 'info'
  }
])

// 排名相关
const rankType = ref('total')
const rankingList = ref<ApiPerformanceRanking[]>([])

// 趋势分析
const trendPeriod = ref('month')

// 明细表格相关
const detailType = ref('teacher')
const performanceDetails = ref<PerformanceDetail[]>([])

// 趋势图表数据
const trendData = ref({
  periods: [] as string[],
  values: [] as number[]
})

// 分页数据
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 时间范围选项
const timeRangeOptions = [
  { value: 'this_week', label: '本周' },
  { value: 'this_month', label: '本月' },
  { value: 'last_month', label: '上个月' },
  { value: 'this_year', label: '今年' }
]

// 选中的时间范围
const selectedTimeRange = ref('this_month')

// 数据统计
const stats = ref({
  newEnrollments: 0,
  conversionRate: 0,
  activitiesHeld: 0,
  averageScore: 0
})

// 表格加载状态
const tableLoading = ref(false)

// 排行榜限制
const rankingLimit = ref(10)

// 图表相关
const chartLoading = ref(false)
const chartData = ref({
  labels: [] as string[],
  datasets: [] as any[]
})

// 图表选项
const selectedTeacherId = ref<number | null>(null)

// API 方法
const getPerformanceStats = async (params?: any): Promise<ApiPerformanceStats> => {
  try {
    const res: ApiResponse = await request.get(PRINCIPAL_ENDPOINTS.PERFORMANCE_STATS, { params })
    if (res.success) {
      return res.data
    }
    throw new Error(res.message || '获取统计数据失败')
  } catch (error) {
    console.error('获取统计数据失败:', error)
    throw error
  }
}

const getPerformanceRankings = async (params?: any): Promise<ApiPerformanceRanking[]> => {
  try {
    const res: ApiResponse = await request.get(PRINCIPAL_ENDPOINTS.PERFORMANCE_RANKINGS, { params })
    if (res.success) {
      return res.data
    }
    throw new Error(res.message || '获取排名数据失败')
  } catch (error) {
    console.error('获取排名数据失败:', error)
    throw error
  }
}

const getPerformanceDetails = async (params?: any): Promise<ApiPerformanceDetails> => {
  try {
    const res: ApiResponse = await request.get(PRINCIPAL_ENDPOINTS.PERFORMANCE_DETAILS, {
      params
    })
    if (res.success) {
      return res.data
    }
    throw new Error(res.message || '获取业绩明细失败')
  } catch (error) {
    console.error('获取业绩明细失败:', error)
    throw error
  }
}

const exportPerformanceData = async (params?: any): Promise<Blob> => {
  try {
    const res = await request.get(PRINCIPAL_ENDPOINTS.PERFORMANCE_EXPORT, {
      params,
      responseType: 'blob'
    })
    return res as Blob
  } catch (error) {
    console.error('导出数据失败:', error)
    throw error
  }
}

const getTeacherRankings = async (params: { timeRange: string, limit?: number }): Promise<ApiPerformanceRanking[]> => {
  try {
    const res: ApiResponse = await request.get(PRINCIPAL_ENDPOINTS.PERFORMANCE_RANKINGS, {
      params
    })
    if (res.success) {
      return res.data?.items || []
    }
    throw new Error(res.message || '获取教师排名失败')
  } catch (error) {
    console.error('获取教师排名失败:', error)
    throw error
  }
}

const getRecruitmentStats = async (params: { timeRange: string }): Promise<ApiPerformanceStats> => {
  try {
    const res: ApiResponse = await request.get(PRINCIPAL_ENDPOINTS.PERFORMANCE_STATS, {
      params
    })
    if (res.success) {
      return res.data
    }
    throw new Error(res.message || '获取招生统计失败')
  } catch (error) {
    console.error('获取招生统计失败:', error)
    throw error
  }
}

const getPerformanceHistoryData = async (params: { 
  userId?: number
  timeRange: string
}): Promise<any> => {
  try {
    const res: ApiResponse = await request.get(PRINCIPAL_ENDPOINTS.PERFORMANCE_HISTORY, {
      params
    })
    if (res.success) {
      return res.data
    }
    throw new Error(res.message || '获取历史数据失败')
  } catch (error) {
    console.error('获取历史数据失败:', error)
    throw error
  }
}

// 渲染趋势图表
const renderTrendChart = () => {
  // 确保DOM已经渲染
  setTimeout(() => {
    const chartDom = trendChart.value
    if (!chartDom) return
    
    // 初始化echarts实例
    const myChart = echarts.init(chartDom)
    
    // 图表配置
    const option = {
      title: {
        text: '招生趋势分析',
  left: 'center'
      },
  tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
  data: trendData.value.periods
      },
      yAxis: {
        type: 'value'
      },
  series: [
        {
          data: trendData.value.values,
  type: 'line',
  smooth: true,
          itemStyle: {
            color: 'var(--primary-color)'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
  color: 'rgba(64, 158, 255, 0.5)'
              },
              {
                offset: 1,
  color: 'rgba(64, 158, 255, 0.1)'
              }
            ])
          }
        }
      ],
  grid: {
        left: '3%',
  right: '4%',
  bottom: '3%',
  top: '15%',
        containLabel: true
      }
    }
    
    // 设置图表选项
    option && myChart.setOption(option)
    
    // 窗口大小变化时自动调整图表大小
    window.addEventListener('resize', () => {
      myChart.resize()
    })
  }, 100)
}

// 加载统计数据
const loadStatsData = async () => {
  loading.value = true
  try {
    const params = {
      startDate: dateRange.value?.[0] || undefined,
      endDate: dateRange.value?.[1] || undefined
    }
    
    const data = await getPerformanceStats(params)
    statCards.value[0].value = data.totalEnrollments?.toString() || '0'
    statCards.value[1].value = data.monthlyEnrollments?.toString() || '0'
    statCards.value[2].value = data.avgConversionRate != null ? `${(data.avgConversionRate * 100).toFixed(1)}%` : '0%'
    statCards.value[3].value = data.totalCommission != null ? `¥${data.totalCommission.toLocaleString()}` : '¥0'
    
    // 更新趋势图表数据
    if ((data as any).enrollmentTrend) {
      // 确保数据格式正确
      if (Array.isArray((data as any).enrollmentTrend)) {
        // 如果是数组格式，需要转换为期望的格式
        trendData.value = {
          periods: (data as any).enrollmentTrend.map((item: TrendItem) => item.period),
  values: (data as any).enrollmentTrend.map((item: TrendItem) => item.value)
        }
      } else {
        // 如果已经是正确的格式
        trendData.value = (data as any).enrollmentTrend
      }
      renderTrendChart()
    }
  } catch (error) {
    console.error('加载绩效统计数据失败:', error)
    ElMessage.error('加载绩效统计数据失败')
  } finally {
    loading.value = false
  }
}

// 加载排名数据
const loadRankingData = async () => {
  tableLoading.value = true
  try {
    const params = {
      timeRange: selectedTimeRange.value,
  limit: rankingLimit.value
    }
    const data = await getTeacherRankings(params)
    rankingList.value = data
  } catch (error) {
    console.error('加载排行榜数据失败:', error)
  } finally {
    tableLoading.value = false
  }
}

// 加载明细数据
const loadDetailData = async () => {
  loading.value = true
  try {
    const params = {
      type: detailType.value as 'teacher' | 'source' | 'class',
      startDate: dateRange.value[0] || undefined,
      endDate: dateRange.value[1] || undefined,
  page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize
    }
    
    const data = await getPerformanceDetails(params)
    performanceDetails.value = data.items
    pagination.value.total = data.total
  } catch (error) {
    console.error('加载绩效明细数据失败:', error)
    ElMessage.error('加载绩效明细数据失败')
  } finally {
    loading.value = false
  }
}

// 加载趋势数据
const loadTrendData = async () => {
  loading.value = true
  try {
    const params = {
      period: trendPeriod.value,
      startDate: dateRange.value?.[0] || undefined,
      endDate: dateRange.value?.[1] || undefined
    }
    
    // 调用API获取趋势数据
    const data = await getPerformanceStats(params)
    if ((data as any).enrollmentTrend) {
      // 确保数据格式正确
      if (Array.isArray((data as any).enrollmentTrend)) {
        // 如果是数组格式，需要转换为期望的格式
        trendData.value = {
          periods: (data as any).enrollmentTrend.map((item: TrendItem) => item.period),
  values: (data as any).enrollmentTrend.map((item: TrendItem) => item.value)
        }
      } else {
        // 如果已经是正确的格式
        trendData.value = (data as any).enrollmentTrend
      }
      
      // 更新其他统计数据
      statCards.value[0].value = data.totalEnrollments?.toString() || '0'
      statCards.value[1].value = data.monthlyEnrollments?.toString() || '0'
      statCards.value[2].value = data.avgConversionRate != null ? `${(data.avgConversionRate * 100).toFixed(1)}%` : '0%'
      statCards.value[3].value = data.totalCommission != null ? `¥${data.totalCommission.toLocaleString()}` : '¥0'
      
      // 渲染图表
      renderTrendChart()
    }
  } catch (error) {
    console.error('加载趋势数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载图表数据
const loadChartData = async () => {
  chartLoading.value = true
  try {
    const params = { 
      timeRange: selectedTimeRange.value,
      userId: selectedTeacherId.value || undefined
    }
    
    const data = await getPerformanceHistoryData(params)
    
    // 处理图表数据
    chartData.value = {
      labels: (data as any).labels || [],
  datasets: (data as any).datasets || []
    }
  } catch (error) {
    console.error('加载图表数据失败:', error)
  } finally {
    chartLoading.value = false
  }
}

// 筛选数据
const filterData = () => {
  loadStatsData()
  loadRankingData()
  loadDetailData()
  loadTrendData()
  loadChartData()
}

// 重置筛选
const resetFilter = () => {
  dateRange.value = []
  filterData()
}

// 导出数据
const exportData = async () => {
  try {
    loading.value = true
    const params = {
      type: detailType.value as 'teacher' | 'source' | 'class',
      startDate: dateRange.value[0] || undefined,
      endDate: dateRange.value[1] || undefined
    }
    
    const blob = await exportPerformanceData(params)
    // 处理文件下载
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', `绩效数据_${new Date().getTime()}

.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出数据失败:', error)
    ElMessage.error('导出数据失败')
  } finally {
    loading.value = false
  }
}

// 打印报表
const printReport = () => {
  ElMessage.success('报表打印准备中...')
  setTimeout(() => {
    window.print()
  }, 500)
}

// 获取排名类型标签
const getRankTypeLabel = () => {
  if (rankType.value === 'total') return '累计招生'
  if (rankType.value === 'month') return '本月招生'
  return '转化率'
}

// 计算进度条百分比
const calculatePercentage = (value: number) => {
  // 确保value是有效数字
  if (typeof value !== 'number' || isNaN(value) || value < 0) {
    return 0
  }

  // 确保rankingList有数据
  if (!rankingList.value || rankingList.value.length === 0) {
    return 0
  }

  const max = Math.max(...rankingList.value.map((item: ApiPerformanceRanking) => item.value || 0), 1)
  const percentage = (value / max) * 100

  // 确保返回值在0-100范围内
  return Math.min(Math.max(percentage, 0), 100)
}

// 获取进度条颜色
const getProgressColor = (index: number) => {
  const colors = ['var(--danger-color)', 'var(--warning-color)', 'var(--success-color)', 'var(--primary-color)']
  return index < 3 ? colors[index] : colors[3]
}

// 计算转化率
const calculateConversionRate = (enrollments: number, total: number) => {
  if (!total) return '0.00'
  return ((enrollments / total) * 100).toFixed(2)
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  loadDetailData()
}

const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
  loadDetailData()
}

// 监听排名类型变化
watch(rankType, () => {
  loadRankingData()
})

// 监听明细类型变化
watch(detailType, () => {
  pagination.value.currentPage = 1
  loadDetailData()
})

// 监听趋势周期变化
watch(trendPeriod, () => {
  loadTrendData()
})

// 处理时间范围变化
const handleTimeRangeChange = () => {
  loadRankingData()
  loadStats()
  loadTrendData()
  loadChartData()
}

// 处理教师选择变化
const handleTeacherChange = (teacherId: number | null) => {
  selectedTeacherId.value = teacherId
  loadChartData()
}

// 获取趋势图标
const getTrendIcon = (trend: string) => {
  if (trend === 'up') return 'ArrowUp'
  if (trend === 'down') return 'ArrowDown'
  return ''
}

// 获取趋势颜色
const getTrendColor = (trend: string) => {
  if (trend === 'up') return 'var(--success-color)'
  if (trend === 'down') return 'var(--danger-color)'
  return 'var(--info-color)'
}

// 格式化排名变化
const formatRankChange = (change: number) => {
  if (change > 0) return `+${change}`
  if (change < 0) return `${change}`
  return '0'
}

// 加载统计数据
const loadStats = async () => {
  try {
    const params = { timeRange: selectedTimeRange.value }
    const data = await getRecruitmentStats(params)
    stats.value = {
      newEnrollments: data.totalEnrollments || 0,
      conversionRate: data.avgConversionRate || 0,
      activitiesHeld: 0, // 这个字段在API中没有，设为0
      averageScore: 0 // 这个字段在API中没有，设为0
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 初始化数据
onMounted(() => {
  loadStatsData()
  loadRankingData()
  loadDetailData()
  loadTrendData() // 加载趋势数据
  loadChartData()
})
</script>

<style scoped>
/* 使用全局CSS变量，确保主题切换兼容性，完成三重修复 */
.page-container {
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  background: var(--bg-secondary); /* 白色区域修复：使用主题背景色 */;
  min-height: 100vh;
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */;
  margin-bottom: var(--app-gap-lg); /* 硬编码修复：使用统一间距变量 */;
  text-align: center;
  background: var(--gradient-green); /* 硬编码修复：使用绿色渐变 */;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: var(--spacing-4xl);
  height: var(--spacing-xs);
  background: var(--gradient-green);
  border-radius: var(--radius-sm);
}

/* 按钮排版修复：工具栏优化 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--app-gap-lg); /* 硬编码修复：使用统一间距变量 */;
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */;
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */;
  box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */;
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
}

.export-buttons {
  display: flex;
  gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */;
  align-items: center;
}

.export-buttons .el-button {
  min-width: var(--spacing-5xl);
  height: var(--spacing-2xl);
  font-weight: 500;
}

.export-buttons .el-button .el-icon {
  margin-right: var(--app-gap-xs);
}

.export-buttons .el-button:hover {
  transform: translateY(-var(--border-width-base));
  box-shadow: var(--shadow-sm);
}

.stats-row {
  margin-bottom: var(--app-gap-lg); /* 硬编码修复：使用统一间距变量 */
}

.stat-card {
  height: 120px;
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */;
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */;
  box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */;
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--gradient-green);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: -1;
}

.stat-card:hover {
  transform: translateY(-var(--spacing-xs));
  box-shadow: var(--shadow-xl); /* 硬编码修复：使用统一阴影变量 */;
  border-color: var(--primary-color); /* 白色区域修复：使用主题主色 */
}

.stat-card:hover::before {
  opacity: 0.05;
}

.stat-card.primary .stat-icon {
  background: var(--primary-color); /* 白色区域修复：使用主题主色 */
}

.stat-card.success .stat-icon {
  background: var(--success-color); /* 白色区域修复：使用主题成功色 */
}

.stat-card.warning .stat-icon {
  background: var(--warning-color); /* 白色区域修复：使用主题警告色 */
}

.stat-card.info .stat-icon {
  background: var(--info-color); /* 白色区域修复：使用主题信息色 */
}

.stat-card-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 var(--app-gap); /* 硬编码修复：使用统一间距变量 */
}

.stat-icon {
  width: var(--spacing-3xl);
  height: var(--spacing-3xl);
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */;
}

.stat-icon .el-icon {
  font-size: var(--text-2xl);
  color: var(--bg-card); /* 白色区域修复：使用主题卡片背景色作为图标色 */
}

.stat-info {
  flex: 1;
}

.stat-info .stat-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */;
  margin-bottom: var(--app-gap-xs); /* 硬编码修复：使用统一间距变量 */;
  line-height: 1.2;
}

.stat-info .stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */;
  font-weight: 500;
}

.chart-row {
  margin-bottom: var(--app-gap-lg); /* 硬编码修复：使用统一间距变量 */
}

.chart-card {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  height: 450px;
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */;
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */;
  box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */;
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  background: var(--bg-tertiary); /* 白色区域修复：使用主题三级背景 */;
  border-bottom: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */;
}

.chart-header span {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */;
  background: var(--gradient-green); /* 硬编码修复：使用绿色渐变 */;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.chart-container {
  height: 380px;
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */;
}

.chart-container .chart-placeholder {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */;
  font-size: var(--text-base);
  font-weight: 500;
  background: var(--bg-tertiary); /* 白色区域修复：使用主题三级背景 */;
  border-radius: var(--radius-md); /* 硬编码修复：使用统一圆角变量 */;
  border: 2px dashed var(--border-color); /* 白色区域修复：使用主题边框色 */;
}

.detail-card {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */;
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */;
  box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */;
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */;
  overflow: hidden;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  background: var(--bg-tertiary); /* 白色区域修复：使用主题三级背景 */;
  border-bottom: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */;
}

.detail-header span {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */;
  background: var(--gradient-green); /* 硬编码修复：使用绿色渐变 */;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  background: var(--bg-tertiary); /* 白色区域修复：使用主题三级背景 */;
  border-top: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */;
}

.ranking-list {
  height: 100%;
  overflow-y: auto;
  padding: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */;
}

.ranking-list::-webkit-scrollbar {
  width: var(--spacing-sm);
}

.ranking-list::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.ranking-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--radius-sm);
}

.ranking-list::-webkit-scrollbar-thumb:hover {
  background: var(--border-light);
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: var(--app-gap-sm) var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  border-bottom: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */;
  border-radius: var(--radius-md); /* 硬编码修复：使用统一圆角变量 */;
  margin-bottom: var(--app-gap-xs); /* 硬编码修复：使用统一间距变量 */;
  background: var(--bg-tertiary); /* 白色区域修复：使用主题三级背景 */;
  transition: all 0.3s ease;
}

.ranking-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.ranking-item:hover {
  background: var(--bg-hover); /* 白色区域修复：使用主题悬停背景 */;
  transform: translateX(var(--spacing-xs));
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
}

.ranking-index {
  width: var(--spacing-2xl);
  height: var(--spacing-2xl);
  border-radius: var(--radius-full);
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */;
  color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: var(--text-sm);
  font-weight: 700;
  margin-right: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  border: 2px solid var(--border-color); /* 白色区域修复：使用主题边框色 */;
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */;
}

.ranking-index.top-three {
  color: var(--bg-card); /* 白色区域修复：使用主题卡片背景色作为文字色 */;
  border: none;
}

.ranking-index.top-three:first-child {
  background: var(--danger-color); /* 白色区域修复：使用主题危险色 */
}

.ranking-index.top-three:nth-child(2) {
  background: var(--warning-color); /* 白色区域修复：使用主题警告色 */
}

.ranking-index.top-three:nth-child(3) {
  background: var(--success-color); /* 白色区域修复：使用主题成功色 */
}

.ranking-info {
  flex: 1;
  margin-right: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
}

.ranking-info .ranking-name {
  font-size: var(--text-base);
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */;
  margin-bottom: var(--app-gap-xs); /* 硬编码修复：使用统一间距变量 */;
  font-weight: 600;
}

.ranking-info .ranking-value {
  font-size: var(--text-sm);
  color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */;
  font-weight: 500;
}

.ranking-info .ranking-value .ranking-label {
  font-size: var(--text-xs);
  color: var(--text-muted); /* 白色区域修复：使用主题静音文字色 */;
  margin-left: var(--app-gap-xs); /* 硬编码修复：使用统一间距变量 */
}

.ranking-progress {
  width: 120px;
}

/* 白色区域修复：Element Plus组件主题化 */
:deep(.el-card) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  
  .el-card__header {
    background: var(--bg-tertiary) !important;
    border-bottom-color: var(--border-color) !important;
    color: var(--text-primary) !important;
  }
  
  .el-card__body {
    background: var(--bg-card) !important;
    color: var(--text-primary) !important;
  }
}

:deep(.el-date-editor) {
  .el-input__wrapper {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
    
    &:hover {
      border-color: var(--border-light) !important;
    }
    
    &.is-focus {
      border-color: var(--primary-color) !important;
    }
  }
  
  .el-input__inner {
    background: transparent !important;
    color: var(--text-primary) !important;
    
    &::placeholder {
      color: var(--text-muted) !important;
    }
  }
}

:deep(.el-button) {
  &.el-button--primary {
    background: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    
    &:hover {
      background: var(--primary-light) !important;
      border-color: var(--primary-light) !important;
    }
  }
  
  &.el-button--success {
    background: var(--success-color) !important;
    border-color: var(--success-color) !important;
    
    &:hover {
      background: var(--success-light) !important;
      border-color: var(--success-light) !important;
    }
  }
  
  &.el-button--default {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
    color: var(--text-primary) !important;
    
    &:hover {
      background: var(--bg-hover) !important;
      border-color: var(--border-light) !important;
    }
  }
}

:deep(.el-select) {
  .el-input__wrapper {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
  }
}

:deep(.el-radio-group) {
  .el-radio-button__inner {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
    color: var(--text-primary) !important;
    
    &:hover {
      color: var(--primary-color) !important;
    }
  }
  
  .el-radio-button__original-radio:checked + .el-radio-button__inner {
    background: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    color: var(--bg-card) !important;
  }
}

:deep(.el-table) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  
  .el-table__header-wrapper {
    .el-table__header {
      background: var(--bg-tertiary) !important;
      
      th {
        background: var(--bg-tertiary) !important;
        color: var(--text-primary) !important;
        border-bottom-color: var(--border-color) !important;
        font-weight: 600;
      }
    }
  }
  
  .el-table__body-wrapper {
    .el-table__body {
      tr {
        background: var(--bg-card) !important;
        
        &:hover {
          background: var(--bg-hover) !important;
        }
        
        td {
          border-bottom-color: var(--border-color) !important;
          color: var(--text-primary) !important;
        }
      }
    }
  }
  
  .el-table__border-left-patch,
  .el-table__border-bottom-patch {
    background: var(--border-color) !important;
  }
  
  .el-table--border {
    border-color: var(--border-color) !important;
    
    &::after {
      background: var(--border-color) !important;
    }
    
    &::before {
      background: var(--border-color) !important;
    }
  }
}

:deep(.el-pagination) {
  .el-pagination__total,
  .el-pagination__jump {
    color: var(--text-primary) !important;
  }
  
  .el-pager li {
    background: var(--bg-tertiary) !important;
    color: var(--text-primary) !important;
    border: var(--border-width-base) solid var(--border-color) !important;
    
    &:hover {
      color: var(--primary-color) !important;
    }
    
    &.is-active {
      background: var(--primary-color) !important;
      color: var(--bg-card) !important;
    }
  }
  
  .btn-prev,
  .btn-next {
    background: var(--bg-tertiary) !important;
    color: var(--text-primary) !important;
    border: var(--border-width-base) solid var(--border-color) !important;
    
    &:hover {
      color: var(--primary-color) !important;
    }
  }
}

:deep(.el-progress) {
  .el-progress-bar__outer {
    background: var(--bg-tertiary) !important;
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .page-container {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .page-title {
    font-size: var(--text-2xl);
    margin-bottom: var(--app-gap); /* 硬编码修复：移动端间距优化 */
  }
  
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */;
  gap: var(--app-gap-sm);
  }
  
  .date-filter,
  .export-buttons {
    width: 100%;
    justify-content: center;
  }
  
  .date-filter {
    flex-wrap: wrap;
    gap: var(--app-gap-xs); /* 硬编码修复：移动端间距优化 */
  }
  
  .export-buttons .el-button {
    flex: 1;
    max-width: 150px;
  }
  
  .stats-row {
    margin-bottom: var(--app-gap); /* 硬编码修复：移动端间距优化 */
  }
  
  .stat-card {
    height: var(--spacing-5xl);
    margin-bottom: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .stat-card-content {
    padding: 0 var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .stat-icon {
    width: var(--spacing-2xl);
    height: var(--spacing-2xl);
    margin-right: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .stat-info .stat-value {
    font-size: var(--text-xl);
  }
  
  .chart-card {
    height: auto;
    margin-bottom: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .chart-container {
    height: 300px;
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .chart-header {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */;
  flex-direction: column;
    align-items: flex-start;
    gap: var(--app-gap-sm);
  }
  
  .detail-header {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */;
  flex-direction: column;
    align-items: flex-start;
    gap: var(--app-gap-sm);
  }
  
  .ranking-item {
    padding: var(--app-gap-xs) var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .ranking-index {
    width: var(--spacing-xl);
    height: var(--spacing-xl);
    margin-right: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .ranking-progress {
    width: var(--spacing-4xl);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .page-container {
    padding: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .page-title {
    font-size: var(--text-xl);
  }
  
  .toolbar {
    padding: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .stat-card {
    height: 90px;
  }
  
  .stat-card-content {
    padding: 0 var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .stat-icon {
    width: var(--spacing-2xl);
    height: var(--spacing-2xl);
    margin-right: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .stat-info .stat-value {
    font-size: var(--text-lg);
  }
  
  .stat-info .stat-label {
    font-size: var(--text-xs);
  }
  
  .chart-container {
    height: 250px;
    padding: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .chart-header,
  .detail-header {
    padding: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .ranking-item {
    padding: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .ranking-index {
    width: var(--spacing-xl);
    height: var(--spacing-xl);
    font-size: var(--text-xs);
  }
  
  .ranking-info .ranking-name {
    font-size: var(--text-sm);
  }
  
  .ranking-info .ranking-value {
    font-size: var(--text-xs);
  }
  
  .ranking-progress {
    width: var(--spacing-3xl);
  }
}
</style> 