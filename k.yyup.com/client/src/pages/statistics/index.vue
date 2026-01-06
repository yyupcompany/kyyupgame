<template>
  <div class="data-statistics-container statistics-analysis-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">统计分析</h1>
      <div class="page-actions">
        <div class="realtime-indicator">
          <div class="pulse-dot"></div>
          实时数据
        </div>
        <el-button class="header-btn" @click="handleExport">
          <UnifiedIcon name="Download" />
          导出报表
        </el-button>
        <el-button class="header-btn" @click="handleRefresh">
          <UnifiedIcon name="Refresh" />
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 时间筛选区域 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="统计时间">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item label="快捷选择">
          <el-button-group>
            <el-button 
              :type="filterForm.quickSelect === 'today' ? 'primary' : 'default'"
              @click="handleQuickSelect('today')"
            >
              今日
            </el-button>
            <el-button 
              :type="filterForm.quickSelect === 'week' ? 'primary' : 'default'"
              @click="handleQuickSelect('week')"
            >
              本周
            </el-button>
            <el-button 
              :type="filterForm.quickSelect === 'month' ? 'primary' : 'default'"
              @click="handleQuickSelect('month')"
            >
              本月
            </el-button>
            <el-button 
              :type="filterForm.quickSelect === 'quarter' ? 'primary' : 'default'"
              @click="handleQuickSelect('quarter')"
            >
              本季度
            </el-button>
            <el-button 
              :type="filterForm.quickSelect === 'year' ? 'primary' : 'default'"
              @click="handleQuickSelect('year')"
            >
              本年
            </el-button>
          </el-button-group>
        </el-form-item>
      </el-form>
    </div>

    <!-- 核心指标卡片 -->
    <el-row :gutter="24" class="metrics-section">
      <el-col :xs="24" :sm="12" :md="6" v-for="(metric, index) in coreMetrics" :key="index">
        <div class="metric-card" :class="metric.type">
          <div class="metric-content">
            <div class="metric-icon">
              <UnifiedIcon name="default" />
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ metric.value }}</div>
              <div class="metric-label">{{ metric.label }}</div>
              <div class="metric-trend" :class="metric.trend">
                <UnifiedIcon name="ArrowDown" />
                <span>{{ metric.change }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="24" class="charts-section">
      <!-- 招生趋势图 -->
      <el-col :xs="24" :lg="12">
        <div class="chart-card">
          <div class="el-card__header">
            <div class="chart-header">
              <h3>招生趋势</h3>
              <div class="chart-actions">
                <el-radio-group v-model="enrollmentChartType" size="small">
                  <el-radio-button value="day">日</el-radio-button>
                  <el-radio-button value="week">周</el-radio-button>
                  <el-radio-button value="month">月</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </div>
          <div class="el-card__body">
            <div ref="enrollmentChartRef" class="chart-container" v-loading="loading.enrollmentChart" style="min-height: 60px; height: auto; min-min-height: 60px; height: auto;"></div>
          </div>
        </div>
      </el-col>

      <!-- 收入分析图 -->
      <el-col :xs="24" :lg="12">
        <div class="chart-card">
          <div class="el-card__header">
            <div class="chart-header">
              <h3>收入分析</h3>
              <div class="chart-actions">
                <el-radio-group v-model="revenueChartType" size="small">
                  <el-radio-button value="category">分类</el-radio-button>
                  <el-radio-button value="trend">趋势</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </div>
          <div class="el-card__body">
            <div ref="revenueChartRef" class="chart-container" v-loading="loading.revenueChart" style="min-height: 60px; height: auto; min-min-height: 60px; height: auto;"></div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="24" class="charts-section">
      <!-- 班级分布图 -->
      <el-col :xs="24" :lg="12">
        <div class="chart-card">
          <div class="el-card__header">
            <div class="chart-header">
              <h3>班级分布</h3>
              <div class="chart-actions">
                <el-button class="chart-btn" size="small" @click="handleRefresh">
                  <UnifiedIcon name="Refresh" />
                </el-button>
              </div>
            </div>
          </div>
          <div class="el-card__body">
            <div ref="classDistributionChartRef" class="chart-container" v-loading="loading.classChart" style="min-height: 60px; height: auto; min-min-height: 60px; height: auto;"></div>
          </div>
        </div>
      </el-col>

      <!-- 学员来源分析 -->
      <el-col :xs="24" :lg="12">
        <div class="chart-card">
          <div class="el-card__header">
            <div class="chart-header">
              <h3>学员来源分析</h3>
              <div class="chart-actions">
                <el-button class="chart-btn" size="small" @click="handleRefresh">
                  <UnifiedIcon name="Refresh" />
                </el-button>
              </div>
            </div>
          </div>
          <div class="el-card__body">
            <div ref="sourceAnalysisChartRef" class="chart-container" v-loading="loading.sourceChart" style="min-height: 60px; height: auto; min-min-height: 60px; height: auto;"></div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <div class="data-table-section">
      <div class="table-header">
        <div class="table-title">详细数据</div>
        <div class="table-actions">
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <el-tab-pane label="招生数据" name="enrollment"></el-tab-pane>
            <el-tab-pane label="收入数据" name="revenue"></el-tab-pane>
            <el-tab-pane label="班级数据" name="class"></el-tab-pane>
            <el-tab-pane label="教师数据" name="teacher"></el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 招生数据表格 -->
      <div v-show="activeTab === 'enrollment'">
        <!-- 空状态处理 -->
        <EmptyState
          v-if="!loading.enrollmentTable && enrollmentData.length === 0"
          type="no-data"
          title="暂无招生数据"
          description="当前时间段内没有招生统计数据，请选择其他时间范围或等待数据更新"
          size="medium"
          :primary-action="{
            text: '刷新数据',
            type: 'primary',
            handler: handleRefresh
          }"
          :suggestions="[
            '尝试选择不同的时间范围',
            '检查招生活动是否正常进行',
            '联系系统管理员获取帮助'
          ]"
          :show-suggestions="true"
        />
        
        <div v-else class="table-wrapper">
<el-table class="responsive-table"
          :data="enrollmentData"
          style="width: 100%"
          v-loading="loading.enrollmentTable"
        >
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="newStudents" label="新增学员" width="120" />
          <el-table-column prop="totalStudents" label="累计学员" width="120" />
          <el-table-column prop="conversionRate" label="转化率" width="120">
            <template #default="scope">
              {{ scope.row.conversionRate }}%
            </template>
          </el-table-column>
          <el-table-column prop="revenue" label="收入金额" width="120">
            <template #default="scope">
              ¥{{ scope.row.revenue.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="avgPrice" label="客单价" width="120">
            <template #default="scope">
              ¥{{ scope.row.avgPrice.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="remarks" label="备注" min-width="200" />
        </el-table>
</div>
      </div>

      <!-- 收入数据表格 -->
      <div v-show="activeTab === 'revenue'">
        <el-table class="responsive-table" :data="revenueData" style="width: 100%" v-loading="loading.revenueTable">
          <el-table-column prop="category" label="收入类别" width="120" />
          <el-table-column prop="amount" label="金额" width="120">
            <template #default="scope">
              ¥{{ scope.row.amount.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="percentage" label="占比" width="120">
            <template #default="scope">
              {{ scope.row.percentage }}%
            </template>
          </el-table-column>
          <el-table-column prop="growth" label="增长率" width="120">
            <template #default="scope">
              <span :class="scope.row.growth >= 0 ? 'text-success' : 'text-danger'">
                {{ scope.row.growth >= 0 ? '+' : '' }}{{ scope.row.growth }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="说明" min-width="200" />
        </el-table>
      </div>

      <!-- 班级数据表格 -->
      <div v-show="activeTab === 'class'">
        <el-table class="responsive-table" :data="classData" style="width: 100%" v-loading="loading.classTable">
          <el-table-column prop="className" label="班级名称" width="150" />
          <el-table-column prop="studentCount" label="学员数量" width="120" />
          <el-table-column prop="capacity" label="班级容量" width="120" />
          <el-table-column prop="utilization" label="利用率" width="120">
            <template #default="scope">
              {{ scope.row.utilization }}%
            </template>
          </el-table-column>
          <el-table-column prop="revenue" label="班级收入" width="120">
            <template #default="scope">
              ¥{{ scope.row.revenue.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="teacher" label="授课教师" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getClassStatusType(scope.row.status)">
                {{ getClassStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 教师数据表格 -->
      <div v-show="activeTab === 'teacher'">
        <el-table class="responsive-table" :data="teacherData" style="width: 100%" v-loading="loading.teacherTable">
          <el-table-column prop="teacherName" label="教师姓名" width="120" />
          <el-table-column prop="classCount" label="授课班级" width="120" />
          <el-table-column prop="studentCount" label="学员数量" width="120" />
          <el-table-column prop="workload" label="工作量" width="120">
            <template #default="scope">
              {{ scope.row.workload }}课时
            </template>
          </el-table-column>
          <el-table-column prop="satisfaction" label="满意度" width="120">
            <template #default="scope">
              <el-rate 
                v-model="scope.row.satisfaction" 
                disabled
                show-score 
                :text-color="'var(--warning-color)'"
                score-template="{value}"
              />
            </template>
          </el-table-column>
          <el-table-column prop="performance" label="绩效评分" width="120">
            <template #default="scope">
              <span :class="getPerformanceClass(scope.row.performance)">
                {{ scope.row.performance }}分
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
                  v-model:current-page="pagination.currentPage"
                  v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 数据钻取对话框 -->
    <el-dialog
      v-model="drillDownDialogVisible"
      title="详细数据"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-loading="drillDownLoading" class="drill-down-content">
        <div v-if="drillDownData" class="drill-down-data">
          <div class="data-summary">
            <h4>数据概览</h4>
            <p>时间范围: {{ drillDownData.period }}</p>
            <p>总计: {{ drillDownData.total }}条记录</p>
          </div>
          
          <el-table class="responsive-table" :data="drillDownData.details || []" stripe style="width: 100%">
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="value" label="数值" width="100" />
            <el-table-column prop="description" label="说明" min-width="200" />
          </el-table>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="drillDownDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="exportDrillDownData">导出数据</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导出对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出统计报告"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="{ format: exportFormat }" label-width="100px">
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportFormat">
            <el-radio value="excel">Excel 表格</el-radio>
            <el-radio value="pdf">PDF 文档</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数据范围">
          <p class="export-info">
            时间: {{ filterForm.dateRange[0] }} 至 {{ filterForm.dateRange[1] }}<br/>
            类型: {{ getTabLabel(activeTab) }}
          </p>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="exportDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="exporting" @click="confirmExport">
            {{ exporting ? '导出中...' : '确认导出' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 1. Vue 相关导入
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue'

// 2. Element Plus 导入
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormRules } from 'element-plus'
import { 
  Download, Refresh, User, Document, Trophy, TrendCharts, 
  SuccessFilled, CircleCloseFilled, Bottom, Money, ArrowUp, ArrowDown
} from '@element-plus/icons-vue'

// 3. 图表库导入
import * as echarts from 'echarts'
import {
  getPrimaryColor,
  getSuccessColor,
  getWarningColor,
  getDangerColor,
  primaryRgba
} from '@/utils/color-tokens'

// 4. 组件导入
import EmptyState from '@/components/common/EmptyState.vue'

// 5. 公共工具函数导入
import request from '../../utils/request'
import { formatDateTime } from '../../utils/dateFormat'

// 6. API端点导入
import { ENROLLMENT_STATISTICS_ENDPOINTS } from '@/api/endpoints'

// 解构request实例中的方法
const { get, post, put, del } = request

// 定义统一API响应类型
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

// 核心指标类型
interface CoreMetric {
  type: string;
  icon: string;
  value: string | number;
  label: string;
  trend: 'up' | 'down';
  change: string
}

// 数据表格类型
interface EnrollmentData {
  date: string
  newStudents: number
  totalStudents: number
  conversionRate: number;
  revenue: number
  avgPrice: number;
  remarks: string
}

interface RevenueData {
  category: string;
  amount: number;
  percentage: number;
  growth: number;
  description: string
}

interface ClassData {
  className: string
  studentCount: number;
  capacity: number;
  utilization: number;
  revenue: number;
  teacher: string;
  status: string
}

interface TeacherData {
  teacherName: string
  classCount: number
  studentCount: number;
  workload: number;
  satisfaction: number;
  performance: number
}

// 响应式数据 - 统一使用ref
const loading = ref({
  enrollmentChart: false,
  revenueChart: false,
  classChart: false,
  sourceChart: false,
  enrollmentTable: false,
  revenueTable: false,
  classTable: false,
  teacherTable: false
})

// 筛选表单
const filterForm = ref({
  dateRange: [] as string[],
  quickSelect: 'month'
})

// 图表类型
const enrollmentChartType = ref('day')
const revenueChartType = ref('category')

// 活动标签页
const activeTab = ref('enrollment')

// 分页信息
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 核心指标数据
const coreMetrics = ref<CoreMetric[]>([
  {
    type: 'primary',
  icon: 'User',
  value: 0,
  label: '总学员数',
  trend: 'up',
  change: '+12.5%'
  },
  {
    type: 'success',
    icon: 'Money',
    value: '¥0',
    label: '总收入',
    trend: 'up',
    change: '+8.3%'
  },
  {
    type: 'warning',
  icon: 'Document',
  value: 0,
  label: '活跃班级',
  trend: 'up',
  change: '+5.2%'
  },
  {
    type: 'danger',
  icon: 'star',
  value: '0%',
  label: '满意度',
  trend: 'up',
  change: '+2.1%'
  }
])

// 表格数据
const enrollmentData = ref<EnrollmentData[]>([])
const revenueData = ref<RevenueData[]>([])
const classData = ref<ClassData[]>([])
const teacherData = ref<TeacherData[]>([])

// 图表引用
const enrollmentChartRef = ref<HTMLDivElement>()
const revenueChartRef = ref<HTMLDivElement>()
const classDistributionChartRef = ref<HTMLDivElement>()
const sourceAnalysisChartRef = ref<HTMLDivElement>()

// 图表实例
let enrollmentChart: echarts.ECharts | null = null
let revenueChart: echarts.ECharts | null = null
let classDistributionChart: echarts.ECharts | null = null
let sourceAnalysisChart: echarts.ECharts | null = null

// 图标组件映射
const iconComponents = {
  User,
  Money,
  Document,
  Trophy,
  TrendCharts,
  SuccessFilled,
  CircleCloseFilled,
  ArrowUp,
  ArrowDown
}

// 加载核心指标
const loadCoreMetrics = async () => {
  try {
    // 并行获取多个统计数据
    const [dashboardStats, enrollmentStats, studentStats, revenueStats, activityStats] = await Promise.all([
      get('/statistics/dashboard'),
      get('/statistics/enrollment'), 
      get('/statistics/students'),
      get('/statistics/revenue'),
      get('/statistics/activities')
    ])
    
    // 更新学员数据
    if (studentStats.success && studentStats.data) {
      coreMetrics.value[0].value = studentStats.data.total || 0
      coreMetrics.value[0].change = calculateTrend(studentStats.data.trends || [])
    }
    
    // 更新收入数据
    if (revenueStats.success && revenueStats.data) {
      coreMetrics.value[1].value = `¥${(revenueStats.data.total || 0).toLocaleString()}`
      coreMetrics.value[1].change = calculateTrend(revenueStats.data.trends || [])
    }
    
    // 更新活动数据
    if (activityStats.success && activityStats.data) {
      coreMetrics.value[2].value = activityStats.data.published || 0
      const trend = activityStats.data.participation || []
      coreMetrics.value[2].change = calculateTrend(trend)
    }
    
    // 更新满意度数据
    if (enrollmentStats.success && enrollmentStats.data) {
      const total = enrollmentStats.data.total || 0
      const approved = enrollmentStats.data.approved || 0
      const satisfaction = total > 0 ? Math.round((approved / total) * 100) : 0
      coreMetrics.value[3].value = `${satisfaction}%`
      coreMetrics.value[3].change = calculateTrend(enrollmentStats.data.trends || [])
    }
    
    // 启动实时数据更新
    startRealTimeUpdate()
  } catch (error) {
    console.error('加载核心指标失败:', error)
    ElMessage.error('加载核心指标失败')
  }
}

// 计算趋势百分比
const calculateTrend = (trends: any[]) => {
  if (trends.length < 2) return '+0%'
  const latest = trends[trends.length - 1]?.value || 0
  const previous = trends[trends.length - 2]?.value || 0
  if (previous === 0) return '+0%'
  const change = ((latest - previous) / previous * 100).toFixed(1)
  return `${change >= 0 ? '+' : ''}${change}%`
}

// 实时数据更新
const realTimeInterval = ref<NodeJS.Timeout | null>(null)
const realtimeStats = ref<any>({})

const startRealTimeUpdate = () => {
  if (realTimeInterval.value) {
    clearInterval(realTimeInterval.value)
  }
  realTimeInterval.value = setInterval(async () => {
    await loadRealtimeStats()
  }, 30000) // 每30秒更新一次
}

const loadRealtimeStats = async () => {
  try {
    const response = await get('/statistics/realtime')
    if (response.success && response.data) {
      realtimeStats.value = response.data
      updateRealtimeCharts()
    }
  } catch (error) {
    console.error('Real-time stats update failed:', error)
  }
}

const updateRealtimeCharts = () => {
  // 更新实时数据显示
  if (realtimeStats.value.todayEnrollments !== undefined) {
    // 可以在这里更新实时指标显示
  }
}

// 初始化招生趋势图
const initEnrollmentChart = async () => {
  if (!enrollmentChartRef.value) return
  
  loading.value.enrollmentChart = true
  try {
    // 获取招生统计数据
    const response = await get('/statistics/enrollment', {
      startDate: filterForm.value.dateRange[0],
      endDate: filterForm.value.dateRange[1],
      period: enrollmentChartType.value
    })
    
    if (enrollmentChart) {
      enrollmentChart.dispose()
    }
    
    enrollmentChart = echarts.init(enrollmentChartRef.value)
    
    // 处理趋势数据
    const enrollmentData = response.success && response.data ? response.data : {}
    const trendData = enrollmentData.trends || []
    const dates = trendData.map((item: any) => formatDateLabel(item.date, enrollmentChartType.value))
    const values = trendData.map((item: any) => item.value || 0)
    
    const option = {
      title: {
        text: '招生趋势分析',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params: any) {
          return `${params[0].name}<br/>招生数量: ${params[0].value}人`
        }
      },
      legend: {
        data: ['招生数量'],
        top: 35
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          interval: 0,
          rotate: dates.length > 7 ? 45 : 0
        }
      },
      yAxis: {
        type: 'value',
        name: '人数',
        axisLabel: {
          formatter: '{value}人'
        }
      },
      series: [
        {
          name: '招生数量',
          type: 'line',
          data: values,
          smooth: true,
          areaStyle: {
            opacity: 0.3,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: primaryRgba(0.8) },
              { offset: 1, color: primaryRgba(0.1) }
            ])
          },
          lineStyle: {
            width: 3,
            color: getPrimaryColor()
          },
          itemStyle: {
            color: 'var(--primary-color)',
            borderWidth: 2,
            borderColor: 'var(--bg-white)'
          }
        }
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      }
    }
    
    enrollmentChart.setOption(option)
    
    // 添加点击事件，实现数据钻取
    enrollmentChart.on('click', handleChartDrillDown)
  } catch (error) {
    console.error('初始化招生趋势图失败:', error)
    ElMessage.error('加载招生趋势图失败')
  } finally {
    loading.value.enrollmentChart = false
  }
}

// 格式化日期标签
const formatDateLabel = (date: string, type: string) => {
  const d = new Date(date)
  switch (type) {
    case 'day':
      return `${d.getMonth() + 1}/${d.getDate()}`
    case 'week':
      return `第${Math.ceil(d.getDate() / 7)}周`
    case 'month':
      return `${d.getMonth() + 1}月`
    default:
      return date
  }
}

// 图表数据钻取
const drillDownDialogVisible = ref(false)
const drillDownData = ref<any>(null)
const drillDownLoading = ref(false)

const handleChartDrillDown = async (params: any) => {
  try {
    drillDownLoading.value = true
    const response = await get('/statistics/enrollment/drilldown', {
      date: params.name,
      type: enrollmentChartType.value
    })
    
    if (response.success) {
      drillDownData.value = response.data
      drillDownDialogVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取详细数据失败')
  } finally {
    drillDownLoading.value = false
  }
}

// 初始化收入分析图
const initRevenueChart = async () => {
  if (!revenueChartRef.value) return
  
  loading.value.revenueChart = true
  try {
    // 获取收入统计数据
    const response = await get('/statistics/revenue', {
      startDate: filterForm.value.dateRange[0],
      endDate: filterForm.value.dateRange[1]
    })
    
    if (revenueChart) {
      revenueChart.dispose()
    }
    
    revenueChart = echarts.init(revenueChartRef.value)
    
    const revenueData = response.success && response.data ? response.data : {}
    let option: any = {}
    
    if (revenueChartType.value === 'category') {
      // 收入分类饼图
      const bySource = revenueData.bySource || {}
      const pieData = Object.entries(bySource).map(([source, amount]) => ({
        name: source,
        value: amount
      }))
      
      option = {
        title: {
          text: '收入来源分析',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: ¥{c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'middle'
        },
        series: [
          {
            name: '收入来源',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '50%'],
            data: pieData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'var(--shadow-heavy)'
              }
            },
            label: {
              formatter: '{b}: {d}%'
            }
          }
        ]
      }
    } else {
      // 收入趋势线状图
      const trends = revenueData.trends || []
      const dates = trends.map((item: any) => formatDateLabel(item.date, 'month'))
      const revenues = trends.map((item: any) => item.value || 0)
      
      option = {
        title: {
          text: '收入趋势分析',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params: any) {
            return `${params[0].name}<br/>收入: ¥${params[0].value.toLocaleString()}`
          }
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: {
            interval: 0,
            rotate: dates.length > 6 ? 45 : 0
          }
        },
        yAxis: {
          type: 'value',
          name: '收入金额',
          axisLabel: {
            formatter: function(value: number) {
              return '¥' + (value >= 10000 ? (value / 10000).toFixed(1) + 'W' : value)
            }
          }
        },
        series: [
          {
            name: '收入',
            type: 'line',
            data: revenues,
            smooth: true,
            areaStyle: {
              opacity: 0.3,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(103, 194, 58, 0.8)' },
                { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
              ])
            },
            lineStyle: {
              width: 3,
              color: getSuccessColor()
            },
            itemStyle: {
              color: 'var(--success-color)',
              borderWidth: 2,
              borderColor: 'var(--bg-white)'
            }
          }
        ],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          containLabel: true
        }
      }
    }
    
    revenueChart.setOption(option)
    revenueChart.on('click', handleChartDrillDown)
  } catch (error) {
    console.error('初始化收入分析图失败:', error)
    ElMessage.error('加载收入分析图失败')
  } finally {
    loading.value.revenueChart = false
  }
}

// 初始化班级分布图
const initClassDistributionChart = async () => {
  if (!classDistributionChartRef.value) return
  
  loading.value.classChart = true
  try {
    // 获取地区统计数据作为班级分布
    const response = await get('/statistics/regions')
    
    if (classDistributionChart) {
      classDistributionChart.dispose()
    }
    
    classDistributionChart = echarts.init(classDistributionChartRef.value)
    
    // 处理地区数据为班级分布数据
    const regionData = response.success && response.data?.items ? response.data.items : []
    const pieData = regionData.map((item: any) => ({
      name: item.region,
  value: item.kindergarten_count
    }))
    
    const option = {
      title: {
        text: '地区分布',
  left: 'center'
      },
  tooltip: {
        trigger: 'item',
  formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
  series: [
        {
          name: '地区分布',
  type: 'pie',
  radius: ['40%', '70%'],
  data: pieData
        }
      ]
    }
    
    classDistributionChart.setOption(option)
  } catch (error) {
    console.error('初始化班级分布图失败:', error)
    ElMessage.error('加载班级分布图失败')
  } finally {
    loading.value.classChart = false
  }
}

// 初始化学员来源分析图
const initSourceAnalysisChart = async () => {
  // 等待DOM完全渲染，最多尝试10次
  let attempts = 0
  while (!sourceAnalysisChartRef.value && attempts < 10) {
    console.log(`等待图表容器渲染完成，第${attempts + 1}次尝试...`)
    await new Promise(resolve => setTimeout(resolve, 100))
    attempts++
  }
  
  if (!sourceAnalysisChartRef.value) {
    console.warn('学员来源分析图容器不存在，已尝试10次')
    return
  }
  
  console.log('图表容器已准备就绪，开始初始化学员来源分析图')
  
  loading.value.sourceChart = true
  try {
    // 获取招生渠道统计数据
    const response = await get(ENROLLMENT_STATISTICS_ENDPOINTS.CHANNELS, {
      startDate: filterForm.value.dateRange[0],
      endDate: filterForm.value.dateRange[1]
    })
    
    console.log('获取到的渠道数据响应:', response)
    
    // 安全地销毁现有图表
    if (sourceAnalysisChart) {
      try {
        sourceAnalysisChart.dispose()
      } catch (disposeError) {
        console.warn('销毁图表时出错:', disposeError)
      }
    }
    
    // 安全地初始化图表
    try {
      console.log('开始初始化ECharts实例...')
      sourceAnalysisChart = echarts.init(sourceAnalysisChartRef.value)
      console.log('ECharts实例初始化成功')
    } catch (initError) {
      console.error('初始化图表失败:', initError)
      loading.value.sourceChart = false
      throw new Error('图表初始化失败: ' + initError.message)
    }
    
    // 处理渠道数据 - 增加更安全的数据处理
    let channelData = []
    if (response && response.success) {
      if (Array.isArray(response.data)) {
        channelData = response.data
      } else if (response.data && typeof response.data === 'object') {
        // 如果API返回单个对象，转换为数组
        channelData = [response.data]
      } else {
        console.warn('API响应数据格式不正确:', response.data)
      }
    } else {
      console.warn('API响应格式不正确:', response)
    }
    
    console.log('处理后的渠道数据:', channelData)
    
    // 检查是否有数据
    if (channelData.length === 0) {
      // 没有数据时显示空状态图表
      const option = {
        title: {
          text: '招生渠道分析',
          left: 'center',
          textStyle: {
            fontSize: 16,
            color: 'var(--text-primary)'
          }
        },
        graphic: {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: '暂无招生渠道数据\n请先在系统中添加渠道信息',
            fontSize: 16,
            fill: 'var(--text-tertiary)',
            textAlign: 'center'
          }
        },
        xAxis: {
          type: 'category',
          data: ['暂无数据'],
          axisLabel: {
            color: 'var(--text-secondary)'
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: 'var(--text-secondary)'
          }
        },
        series: [{
          name: '申请数量',
          type: 'bar',
          data: [0],
          itemStyle: {
            color: '#e6e6e6'
          }
        }]
      }
      sourceAnalysisChart.setOption(option)
      return
    }
    
    // 安全地提取数据
    const sources = channelData.map((item: any) => {
      if (item && typeof item === 'object') {
        return item.name || item.channelName || '未知渠道'
      }
      return '未知渠道'
    })
    const counts = channelData.map((item: any) => {
      if (item && typeof item === 'object') {
        // 支持多种字段名：applicationCount, count, clickCount, visitorCount
        return Number(
          item.applicationCount || 
          item.count || 
          item.clickCount || 
          item.visitorCount || 
          0
        )
      }
      return 0
    })
    
    const option = {
      title: {
        text: '招生渠道分析',
        left: 'center',
        textStyle: {
          fontSize: 16,
          color: 'var(--text-primary)'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const param = params[0]
          return `${param.axisValue}<br/>${param.seriesName}: ${param.value}`
        }
      },
      xAxis: {
        type: 'category',
        data: sources,
        axisLabel: {
          color: 'var(--text-secondary)',
          rotate: sources.some(s => s.length > 4) ? 45 : 0
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: 'var(--text-secondary)'
        }
      },
      series: [
        {
          name: '申请数量',
          type: 'bar',
          data: counts,
          itemStyle: {
            color: 'var(--primary-color)'
          }
        }
      ]
    }
    
    // 安全地设置图表选项
    try {
      console.log('开始设置图表选项...')
      sourceAnalysisChart.setOption(option)
      console.log('学员来源分析图初始化成功')
    } catch (setOptionError) {
      console.error('设置图表选项失败:', setOptionError)
      console.error('选项数据:', option)
      loading.value.sourceChart = false
      throw new Error('图表渲染失败: ' + setOptionError.message)
    }
    
  } catch (error) {
    console.error('初始化学员来源分析图失败:', error)
    
    // 在错误情况下也显示一个图表，避免空白区域
    try {
      if (sourceAnalysisChart) {
        sourceAnalysisChart.dispose()
      }
      
      if (sourceAnalysisChartRef.value) {
        sourceAnalysisChart = echarts.init(sourceAnalysisChartRef.value)
        
        const errorOption = {
          title: {
            text: '招生渠道分析',
            left: 'center',
            textStyle: {
              fontSize: 16,
              color: 'var(--text-primary)'
            }
          },
          graphic: {
            type: 'text',
            left: 'center',
            top: 'middle',
            style: {
              text: '数据加载失败\n请刷新页面重试',
              fontSize: 16,
              fill: 'var(--danger-color)',
              textAlign: 'center'
            }
          },
          xAxis: {
            type: 'category',
            data: ['加载失败'],
            axisLabel: {
              color: 'var(--text-secondary)'
            }
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              color: 'var(--text-secondary)'
            }
          },
          series: [{
            name: '申请数量',
            type: 'bar',
            data: [0],
            itemStyle: {
              color: 'var(--danger-color)'
            }
          }]
        }
        sourceAnalysisChart.setOption(errorOption)
      }
    } catch (errorRenderError) {
      console.error('渲染错误状态图表也失败了:', errorRenderError)
    }
    
    ElMessage.error('加载学员来源分析图失败，请刷新页面重试')
  } finally {
    loading.value.sourceChart = false
  }
}

// 加载表格数据
const loadTableData = async (type: string) => {
  const loadingKey = `${type}Table` as keyof typeof loading.value
  loading.value[loadingKey] = true
  
  try {
    let response: any
    
    switch (type) {
      case 'enrollment':
        response = await get(ENROLLMENT_STATISTICS_ENDPOINTS.PLANS, {
          page: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        })
        if (response.success && response.data) {
          // 转换招生计划数据为表格数据
          enrollmentData.value = response.data.map((plan: any) => ({
            date: plan.startDate,
            newStudents: plan.applicationCount || 0,
            totalStudents: plan.targetCount || 0,
            conversionRate: plan.targetCount > 0 ? Math.round((plan.applicationCount / plan.targetCount) * 100) : 0,
  revenue: plan.applicationCount * 5000, // 假设平均学费
            avgPrice: 5000,
  remarks: plan.name
          }))
          pagination.value.total = response.data.length
        }
        break
        
      case 'revenue':
        response = await get('/statistics/financial')
        if (response.success && response.data?.revenueBySource) {
          revenueData.value = response.data.revenueBySource.map((item: any) => ({
            category: item.source,
  amount: item.amount,
  percentage: item.percentage,
  growth: Math.floor(Math.random() * 20) - 5, // 模拟增长率;
  description: `${item.source}收入`
          }))
          pagination.value.total = revenueData.value.length
        }
        break
        
      case 'class':
        response = await get('/statistics/regions')
        if (response.success && response.data?.items) {
          classData.value = response.data.items.map((item: any, index: number) => ({
            className: `${item.region}分园`,
            studentCount: item.kindergarten_count * 25, // 假设每园25人;
  capacity: item.kindergarten_count * 30,
  utilization: Math.round((25 / 30) * 100),
  revenue: item.kindergarten_count * 125000,
  teacher: `${item.region}负责人`,
  status: 'ACTIVE'
          }))
          pagination.value.total = classData.value.length
        }
        break
        
      case 'teacher':
        response = await get(ENROLLMENT_STATISTICS_ENDPOINTS.PERFORMANCE, {
          startDate: filterForm.value.dateRange[0],
          endDate: filterForm.value.dateRange[1]
        })
        if (response.success && response.data) {
          teacherData.value = response.data.map((teacher: any) => ({
            teacherName: teacher.realName || teacher.username,
            classCount: 1,
            studentCount: teacher.applicationCount || 0,
  workload: teacher.applicationCount * 2, // 假设工作量;
  satisfaction: 4.5 + Math.random() * 0.5, // 4.5-5.0;
  performance: 85 + Math.floor(Math.random() * 15) // 85-100
          }))
          pagination.value.total = teacherData.value.length
        }
        break
    }
  } catch (error) {
    console.error(`加载${type}数据失败:`, error)
    ElMessage.error(`加载${type}数据失败`)
  } finally {
    loading.value[loadingKey] = false
  }
}

// 事件处理
const handleDateChange = () => {
  loadAllData()
}

const handleQuickSelect = (type: string) => {
  filterForm.value.quickSelect = type
  const now = new Date()
  let startDate: Date
  let endDate = now
  
  switch (type) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3)
      startDate = new Date(now.getFullYear(), quarter * 3, 1)
      break
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1)
      break;
  default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }
  
  filterForm.value.dateRange = [
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  ]
  
  loadAllData()
}

const handleTabChange = (tabName: string) => {
  loadTableData(tabName)
}

// 导出状态
const exporting = ref(false)
const exportDialogVisible = ref(false)
const exportFormat = ref('excel')

const handleExport = () => {
  exportDialogVisible.value = true
}

const confirmExport = async () => {
  try {
    exporting.value = true
    const response = await post('/statistics/reports', {
      type: activeTab.value,
      format: exportFormat.value,
      params: {
        startDate: filterForm.value.dateRange[0],
        endDate: filterForm.value.dateRange[1]
      }
    })
    
    if (response.success && response.data) {
      // 创建下载链接
      const downloadUrl = response.data.downloadUrl
      if (downloadUrl) {
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `统计报告_${new Date().toISOString().split('T')[0]}.${exportFormat.value}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        ElMessage.success('报告导出成功')
      } else {
        // 如果是异步处理，显示任务创建成功
        ElMessage.success('导出任务已创建，请稍后下载')
      }
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
    exportDialogVisible.value = false
  }
}

const handleRefresh = () => {
  loadAllData()
}

// 加载所有数据
const loadAllData = async () => {
  try {
    await loadCoreMetrics()
    await initEnrollmentChart()
    await initRevenueChart()
    await initClassDistributionChart()
    await initSourceAnalysisChart()
    await loadTableData(activeTab.value)
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  }
}

// 监听图表类型变化
watch(enrollmentChartType, () => {
  initEnrollmentChart()
})

watch(revenueChartType, () => {
  initRevenueChart()
})

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  loadTableData(activeTab.value)
}

const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
  loadTableData(activeTab.value)
}

// 获取班级状态类型
const getClassStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'success',
    'INACTIVE': 'warning',
    'PENDING': 'info',
    'CLOSED': 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取班级状态文本
const getClassStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'ACTIVE': '活跃',
    'INACTIVE': '暂停',
    'PENDING': '待开班',
    'CLOSED': '已结束'
  }
  return statusMap[status] || status
}

// 获取绩效评分样式类
const getPerformanceClass = (score: number) => {
  if (score >= 90) return 'text-success'
  if (score >= 80) return 'text-warning'
  if (score >= 70) return 'text-info'
  return 'text-danger'
}

// 获取标签页标签
const getTabLabel = (tab: string) => {
  const tabMap: Record<string, string> = {
    'enrollment': '招生数据',
    'revenue': '收入数据',
    'class': '班级数据',
    'teacher': '教师数据'
  }
  return tabMap[tab] || tab
}

// 导出钻取数据
const exportDrillDownData = async () => {
  try {
    const response = await post('/statistics/export-drilldown', {
      data: drillDownData.value,
      format: 'excel'
    })
    
    if (response.success && response.data?.downloadUrl) {
      const link = document.createElement('a')
      link.href = response.data.downloadUrl
      link.download = `详细数据_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      ElMessage.success('数据导出成功')
    }
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 组件销毁时清理定时器
onUnmounted(() => {
  if (realTimeInterval.value) {
    clearInterval(realTimeInterval.value)
  }
  // 销毁图表实例
  if (enrollmentChart) enrollmentChart.dispose()
  if (revenueChart) revenueChart.dispose()
  if (classDistributionChart) classDistributionChart.dispose()
  if (sourceAnalysisChart) sourceAnalysisChart.dispose()
})

// 页面初始化
onMounted(() => {
  // 设置默认时间范围为本月
  handleQuickSelect('month')
  
  // 等待DOM渲染完成后初始化图表
  nextTick(() => {
    loadAllData()
  })
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;
@use './data-statistics-ux-styles.scss' as *;

/* 数据统计模块UX样式 - 所有样式已在 data-statistics-ux-styles.scss 中统一定义 */
/* 包含图表交互优化、数据展示增强、移动端适配等全面UX改进 */
</style>
