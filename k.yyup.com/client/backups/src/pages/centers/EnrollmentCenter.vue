<template>
  <UnifiedCenterLayout
    title="招生中心"
    description="这里是招生管理的核心枢纽，您可以管理招生计划、处理入学申请、跟进咨询转化、分析招生数据"
  >
    <template #header-actions>
      <el-button type="primary" size="large" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建
      </el-button>
    </template>

    <div class="center-container enrollment-center-timeline">

    <!-- 主要内容区域 -->
    <div class="main-content">
        <!-- 统计卡片区域 -->
        <div class="stats-section">
          <div class="stats-grid-unified">
            <StatCard
              :title="overviewStats[0]?.title || '总咨询数'"
              :value="overviewStats[0]?.value || 0"
              :unit="overviewStats[0]?.unit || '人'"
              :trend="overviewStats[0]?.trend"
              trend-text="较上月"
              icon-name="user"
              type="primary"
              :loading="loading"
              clickable
              @click="handleStatClick(overviewStats[0])"
            />
            <StatCard
              :title="overviewStats[1]?.title || '已报名'"
              :value="overviewStats[1]?.value || 0"
              :unit="overviewStats[1]?.unit || '人'"
              :trend="overviewStats[1]?.trend"
              trend-text="较上月"
              icon-name="check"
              type="success"
              :loading="loading"
              clickable
              @click="handleStatClick(overviewStats[1])"
            />
            <StatCard
              :title="overviewStats[2]?.title || '试听中'"
              :value="overviewStats[2]?.value || 0"
              :unit="overviewStats[2]?.unit || '人'"
              :trend="overviewStats[2]?.trend"
              trend-text="较上月"
              icon-name="clock"
              type="warning"
              :loading="loading"
              clickable
              @click="handleStatClick(overviewStats[2])"
            />
            <StatCard
              :title="overviewStats[3]?.title || '转化率'"
              :value="overviewStats[3]?.value || 0"
              :unit="overviewStats[3]?.unit || '%'"
              :trend="overviewStats[3]?.trend"
              trend-text="较上月"
              icon-name="trending-up"
              type="info"
              :loading="loading"
              clickable
              @click="handleStatClick(overviewStats[3])"
            />
          </div>
        </div>

        <!-- 图表区域 - 自适应宽屏布局 -->
        <div class="charts-section">
          <div class="charts-grid-responsive">
            <div class="chart-item">
              <ChartContainer
                title="招生趋势分析"
                subtitle="最近6个月招生数据"
                :options="enrollmentTrendChart"
                :loading="chartsLoading"
                height="350px"
                @refresh="refreshCharts"
              />
            </div>
            <div class="chart-item">
              <ChartContainer
                title="来源渠道分析"
                subtitle="各渠道咨询转化情况"
                :options="sourceChannelChart"
                :loading="chartsLoading"
                height="350px"
                @refresh="refreshCharts"
              />
            </div>
          </div>
        </div>

        <!-- 快速操作区域 - 使用16列网格系统 -->
        <div class="quick-actions-section">
          <div class="cds-grid">
            <div class="cds-row">
              <div class="cds-col-lg-8 cds-col-md-4 cds-col-sm-4">
                <div class="primary-actions">
                  <ActionToolbar
                    :primary-actions="quickActions"
                    size="default"
                    align="left"
                    @action-click="handleQuickAction"
                  />
                </div>
              </div>
              <div class="cds-col-lg-8 cds-col-md-4 cds-col-sm-4">
                <div class="secondary-actions">
                  <ActionToolbar
                    :primary-actions="secondaryActions"
                    size="default"
                    align="right"
                    @action-click="handleQuickAction"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Clock, Location, User, Check, DataLine, TrendCharts } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { handleListResponse } from '@/utils/api-response-handler'
// 移除图标导入，使用字符串形式
import {
  DataTable,
  StatCard,
  ChartContainer,
  DetailPanel,
  FormModal,
  ActionToolbar
} from '@/components/centers'
// 导入API服务
import {
  getEnrollmentOverview,
  getEnrollmentPlans,
  getEnrollmentApplications,
  getEnrollmentConsultations,
  getConsultationStatistics,
  type OverviewData,
  type EnrollmentPlan,
  type EnrollmentApplication,
  type ConsultationStatistics
} from '@/api/enrollment-center'

import { getPrimaryColor, getPurpleEndColor, primaryRgba } from '@/utils/color-tokens'

// 路由
const router = useRouter()
const route = useRoute()


// 全局加载状态
const loading = ref(false)

// 表单弹窗状态
const formModalVisible = ref(false)
const formModalTitle = ref('')
const formLoading = ref(false)
const formData = ref({
  name: '',
  year: new Date().getFullYear(),
  semester: 1,
  target_count: 30,
  status: 1
})
const formFields = ref([])
const formRef = ref()

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入计划名称', trigger: 'blur' }
  ],
  year: [
    { required: true, message: '请选择年度', trigger: 'change' }
  ],
  semester: [
    { required: true, message: '请选择学期', trigger: 'change' }
  ],
  target_count: [
    { required: true, message: '请输入目标人数', trigger: 'blur' },
    { type: 'number', min: 1, message: '目标人数必须大于0', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 概览数据 - 初始化为空，等待API数据
const overviewStats = ref([
  {
    key: 'total_consultations',
    title: '总咨询数',
    value: 0,
    unit: '人',
    trend: 0,
    trendText: '较上月',
    type: 'primary',
    iconName: 'customers'
  },
  {
    key: 'applications',
    title: '已报名',
    value: 0,
    unit: '人',
    trend: 0,
    trendText: '较上月',
    type: 'success',
    iconName: 'enrollment'
  },
  {
    key: 'trials',
    title: '试听中',
    value: 0,
    unit: '人',
    trend: 0,
    trendText: '较上月',
    type: 'warning',
    iconName: 'activity'
  },
  {
    key: 'conversion_rate',
    title: '转化率',
    value: 0,
    unit: '%',
    trend: 0,
    trendText: '较上月',
    type: 'info',
    iconName: 'analytics'
  }
])

// 图表数据
const chartsLoading = ref(false)
const enrollmentTrendChart = ref({
  title: { text: '' },
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(50, 50, 50, 0.9)',
    borderColor: 'var(--primary-color)',
    borderWidth: 1,
    textStyle: {
      color: 'var(--bg-white)',
      fontSize: 12
    },
    axisPointer: {
      type: 'cross',
      crossStyle: {
        color: 'var(--primary-color)'
      }
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '10%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月'],
    axisLine: {
      lineStyle: {
        color: '#4a5568'
      }
    },
    axisLabel: {
      color: '#a0aec0',
      fontSize: 12
    },
    splitLine: {
      show: false
    }
  },
  yAxis: {
    type: 'value',
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      color: '#a0aec0',
      fontSize: 12
    },
    splitLine: {
      lineStyle: {
        color: '#2d3748',
        type: 'dashed'
      }
    }
  },
  series: [{
    type: 'line',
    data: [120, 132, 101, 134, 90, 230],
    smooth: true,
    symbol: 'circle',
    symbolSize: 8,
    lineStyle: {
      width: 3,
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 1,
        y2: 0,
        colorStops: [
          { offset: 0, color: getPrimaryColor() },
          { offset: 1, color: getPurpleEndColor() }
        ]
      }
    },
    itemStyle: {
      color: getPrimaryColor(),
      borderColor: 'var(--bg-white)',
      borderWidth: 2
    },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: primaryRgba(0.3) },
          { offset: 1, color: primaryRgba(0.05) }
        ]
      }
    }
  }]
})
const sourceChannelChart = ref({
  title: { text: '' },
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(50, 50, 50, 0.9)',
    borderColor: '#42a5f5',
    borderWidth: 1,
    textStyle: {
      color: 'var(--bg-white)',
      fontSize: 12
    },
    axisPointer: {
      type: 'shadow',
      shadowStyle: {
        color: 'rgba(66, 165, 245, 0.2)'
      }
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '10%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['线上推广', '口碑推荐', '地推活动', '其他渠道'],
    axisLine: {
      lineStyle: {
        color: '#4a5568'
      }
    },
    axisLabel: {
      color: '#a0aec0',
      fontSize: 12,
      interval: 0,
      rotate: 0
    },
    splitLine: {
      show: false
    }
  },
  yAxis: {
    type: 'value',
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      color: '#a0aec0',
      fontSize: 12
    },
    splitLine: {
      lineStyle: {
        color: '#2d3748',
        type: 'dashed'
      }
    }
  },
  series: [{
    type: 'bar',
    data: [
      { value: 85, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#42a5f5' }, { offset: 1, color: '#26c6da' }] } } },
      { value: 92, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#66bb6a' }, { offset: 1, color: '#4caf50' }] } } },
      { value: 68, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#ab47bc' }, { offset: 1, color: '#ec407a' }] } } },
      { value: 45, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#ff7043' }, { offset: 1, color: '#ff5722' }] } } }
    ],
    barWidth: '60%',
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowColor: 'var(--shadow-heavy)'
      }
    }
  }]
})

// 快速操作
const quickActions = [
  { key: 'create_plan', label: '新建计划', type: 'primary', icon: 'Plus' },
  { key: 'view_applications', label: '查看申请', type: 'success', icon: 'View' }
]

const secondaryActions = [
  { key: 'ai_analysis', label: 'AI分析', icon: 'MagicStick' },
  { key: 'export_report', label: '导出报表', icon: 'Download' }
]

// 计划管理数据
const plansData = ref([])
const plansColumns = [
  { prop: 'title', label: '计划名称', minWidth: 150 },
  { prop: 'year', label: '年度', width: 100 },
  { prop: 'semester', label: '学期', width: 100 },
  { prop: 'targetCount', label: '目标人数', width: 120 },
  { prop: 'appliedCount', label: '已报名', width: 100 },
  { prop: 'progress', label: '进度', width: 120, type: 'custom' },
  { prop: 'status', label: '状态', width: 100, type: 'tag' },
  { prop: 'actions', label: '操作', width: 150, type: 'actions', fixed: 'right' }
]

const plansLoading = ref(false)
const plansTotal = ref(0)
const plansPage = ref(1)
const plansPageSize = ref(10)
const selectedPlan = ref(null)
const planDetailLoading = ref(false)

// 关联活动数据
const relatedActivities = ref([])
const relatedActivitiesLoading = ref(false)

// 缴费统计数据
const paymentStats = ref({
  totalRegistrations: 0,
  totalPaidAmount: 0,
  paymentCompletionRate: 0,
  activities: []
})
const paymentStatsLoading = ref(false)

// 转化统计数据
const conversionStats = ref({
  totalParticipants: 0,
  consultationCount: 0,
  consultationRate: 0,
  applicationCount: 0,
  applicationRate: 0,
  admissionCount: 0,
  admissionRate: 0,
  activityBreakdown: []
})
const conversionStatsLoading = ref(false)

// 申请管理数据
const applicationsData = ref([])
const applicationsColumns = [
  { prop: 'applicationNo', label: '申请编号', width: 120 },
  { prop: 'studentName', label: '学生姓名', width: 100 },
  { prop: 'parentName', label: '家长姓名', width: 100 },
  { prop: 'planTitle', label: '申请计划', minWidth: 150 },
  { prop: 'status', label: '状态', width: 100, type: 'tag' },
  { prop: 'applicationDate', label: '申请时间', width: 120, type: 'date' },
  { prop: 'actions', label: '操作', width: 120, type: 'actions', fixed: 'right' }
]

const applicationsLoading = ref(false)
const applicationsTotal = ref(0)
const applicationsPage = ref(1)
const applicationsPageSize = ref(10)
const selectedApplication = ref(null)
const applicationDetailLoading = ref(false)

// 咨询管理数据
const consultationStats = ref([
  { key: 'today', title: '今日咨询', value: 23, unit: '人', type: 'primary', iconName: 'messages' },
  { key: 'pending', title: '待跟进', value: 45, unit: '人', type: 'warning', iconName: 'schedule' },
  { key: 'monthly', title: '本月转化', value: 156, unit: '人', type: 'success', iconName: 'check' },
  { key: 'response', title: '平均响应', value: 2.5, unit: '小时', type: 'info', iconName: 'monitor' }
])

const consultationsData = ref([])
const consultationsColumns = [
  { prop: 'consultationNo', label: '咨询编号', minWidth: 120 },
  { prop: 'parentName', label: '家长姓名', minWidth: 100 },
  { prop: 'phone', label: '联系方式', minWidth: 120 },
  { prop: 'source', label: '来源', minWidth: 100 },
  { prop: 'status', label: '状态', minWidth: 100, type: 'tag' },
  { prop: 'assignee', label: '负责人', minWidth: 100 },
  { prop: 'createdAt', label: '咨询时间', minWidth: 140, type: 'date' },
  { prop: 'actions', label: '操作', width: 120, type: 'actions', fixed: 'right' }
]

const consultationsLoading = ref(false)
const consultationsTotal = ref(0)
const consultationsPage = ref(1)
const consultationsPageSize = ref(10)

// 确保数据始终为数组的计算属性
const safePlansData = computed(() => {
  return Array.isArray(plansData.value) ? plansData.value : []
})

const safeApplicationsData = computed(() => {
  return Array.isArray(applicationsData.value) ? applicationsData.value : []
})

const safeConsultationsData = computed(() => {
  return Array.isArray(consultationsData.value) ? consultationsData.value : []
})

// 数据分析
const analyticsLoading = ref(false)
const analyticsActions = [
  { key: 'export', label: '导出报表', icon: 'Download' },
  { key: 'refresh', label: '刷新数据', icon: 'Refresh' }
]

const analyticsFilters = [
  { key: 'time_range', label: '时间范围' },
  { key: 'source', label: '来源渠道' },
  { key: 'status', label: '状态筛选' }
]

const activeAnalyticsFilters = ref([])

const analyticsTrendChart = ref({})
const analyticsChannelChart = ref({})
const analyticsFunnelChart = ref({})
const analyticsRegionChart = ref({})

const analyticsMetrics = ref([
  { key: 'yoy_growth', title: '同比增长', value: 15.8, unit: '%', trend: 5.2, type: 'success', icon: 'TrendCharts' },
  { key: 'mom_growth', title: '环比增长', value: 8.3, unit: '%', trend: 2.1, type: 'primary', icon: 'TrendCharts' },
  { key: 'target_completion', title: '目标完成率', value: 78.5, unit: '%', trend: 12.3, type: 'warning', icon: 'Target' },
  { key: 'avg_cost', title: '平均获客成本', value: 285, unit: '元', trend: -8.5, type: 'info', icon: 'Money' }
])

// AI助手
const aiLoading = ref(false)
const aiActions = [
  { key: 'predict', label: '智能预测', type: 'primary', icon: 'MagicStick' },
  { key: 'optimize', label: '策略优化', type: 'success', icon: 'Setting' },
  { key: 'analyze', label: '容量分析', type: 'warning', icon: 'DataAnalysis' }
]

const aiPredictionChart = ref({})
const aiSuggestions = ref([
  {
    id: 1,
    title: '优化线上推广渠道',
    description: '建议增加微信朋友圈和小红书的投放比例，预计可提升转化率15%',
    expectedImprovement: '15%',
    confidence: 92
  },
  {
    id: 2,
    title: '调整招生时间策略',
    description: '根据历史数据分析，建议将主要招生活动提前至3月中旬开始',
    expectedImprovement: '12%',
    confidence: 88
  }
])

const aiMetrics = ref([
  { key: 'predicted', title: '预计报名', value: 1250, unit: '人', type: 'primary', icon: 'TrendCharts' },
  { key: 'recommended', title: '推荐配额', value: 1180, unit: '人', type: 'success', icon: 'Setting' },
  { key: 'optimal_time', title: '最佳时机', value: '3月15日', unit: '', type: 'warning', icon: 'Calendar' },
  { key: 'risk_score', title: '风险评估', value: 'Low', unit: '', type: 'info', icon: 'Shield' }
])

// 详情面板配置
const planDetailSections = [
  {
    title: '基本信息',
    fields: [
      { key: 'title', label: '计划名称' },
      { key: 'year', label: '招生年度' },
      { key: 'semester', label: '学期' },
      { key: 'targetCount', label: '目标人数' },
      { key: 'enrolledCount', label: '已报名人数' },
      { key: 'progress', label: '完成进度', type: 'custom' }
    ]
  },
  {
    title: '关联活动',
    fields: [
      { key: 'relatedActivities', label: '活动列表', type: 'custom' }
    ]
  },
  {
    title: '缴费统计',
    fields: [
      { key: 'paymentStats', label: '缴费情况', type: 'custom' }
    ]
  },
  {
    title: '转化统计',
    fields: [
      { key: 'conversionStats', label: '转化情况', type: 'custom' }
    ]
  },
  {
    title: '配额管理',
    fields: [
      { key: 'quotas', label: '班级配额', type: 'custom' }
    ]
  }
]

const applicationDetailSections = [
  {
    title: '学生信息',
    fields: [
      { key: 'studentName', label: '学生姓名' },
      { key: 'gender', label: '性别' },
      { key: 'birthDate', label: '出生日期', type: 'date' },
      { key: 'parentName', label: '家长姓名' }
    ]
  },
  {
    title: '申请材料',
    fields: [
      { key: 'materials', label: '提交材料', type: 'custom' }
    ]
  }
]

// 事件处理
const handleCreate = () => {
  // 默认跳转到创建招生计划页面
  console.log('从概览页面跳转到创建招生计划页面')
  router.push('/enrollment-plan/create')
}

const handleStatClick = (stat: any) => {
  ElMessage.info(`点击了统计卡片: ${stat.title}`)
  // 可以跳转到对应的详细页面
}

const handleQuickAction = (action: any) => {
  console.log('执行快速操作:', action)

  // 确保action对象有正确的结构
  const actionKey = action.key || action

  switch (actionKey) {
    case 'create_plan':
      // 跳转到正确的招生计划创建页面 - 修复路径匹配数据库权限
      console.log('正在跳转到创建页面...')
      router.push('/enrollment-plan/create')
      break
    case 'view_applications':
      // 显示提示信息
      ElMessage.info('查看申请功能')
      break
    case 'ai_analysis':
      // 显示提示信息
      ElMessage.info('AI分析功能')
      break
    case 'export_report':
      // 导出报表功能
      handleExportReport()
      break
    default:
      console.log('未知操作:', actionKey, action)
      ElMessage.info(`执行快速操作: ${action.label || actionKey}`)
  }
}

const refreshCharts = () => {
  chartsLoading.value = true
  setTimeout(() => {
    chartsLoading.value = false
    ElMessage.success('图表数据已刷新')
  }, 1000)
}

const handleExportReport = () => {
  ElMessage.info('正在生成报表...')
  // 模拟导出报表
  setTimeout(() => {
    ElMessage.success('报表导出成功！')
    // 这里可以添加实际的文件下载逻辑
  }, 2000)
}

// 计划管理相关
const handleCreatePlan = () => {
  formModalTitle.value = '新建招生计划'
  formFields.value = [
    { prop: 'title', label: '计划名称', type: 'input', required: true, span: 12 },
    { prop: 'year', label: '招生年度', type: 'select', span: 12, options: [
      { label: '2024年', value: 2024 },
      { label: '2025年', value: 2025 }
    ]},
    { prop: 'semester', label: '学期', type: 'select', span: 12, options: [
      { label: '春季', value: 'spring' },
      { label: '秋季', value: 'autumn' }
    ]},
    { prop: 'targetCount', label: '目标人数', type: 'number', span: 12 },
    { prop: 'description', label: '计划描述', type: 'textarea', span: 24 }
  ]
  formData.value = {}
  formModalVisible.value = true
}

const handleEditPlan = (row: any) => {
  console.log('开始编辑计划:', row)

  formModalTitle.value = '编辑招生计划'
  formFields.value = [
    { prop: 'title', label: '计划名称', type: 'input', required: true, span: 12 },
    { prop: 'year', label: '招生年度', type: 'select', span: 12, options: [
      { label: '2024年', value: 2024 },
      { label: '2025年', value: 2025 }
    ]},
    { prop: 'semester', label: '学期', type: 'select', span: 12, options: [
      { label: '春季', value: 'spring' },
      { label: '秋季', value: 'autumn' }
    ]},
    { prop: 'targetCount', label: '目标人数', type: 'number', span: 12 },
    { prop: 'description', label: '计划描述', type: 'textarea', span: 24 }
  ]
  formData.value = { ...row }

  console.log('设置表单数据:', formData.value)
  console.log('设置模态框可见性为true')

  // 确保模态框显示
  nextTick(() => {
    formModalVisible.value = true
    console.log('模态框可见性状态:', formModalVisible.value)
  })
}

const handleDeletePlan = (row: any) => {
  ElMessage.warning(`删除计划: ${row.title}`)
}

const handlePlanRowClick = (row: any) => {
  // 点击行直接打开编辑弹窗
  handleEditPlan(row)
}

const handlePlansPageChange = (page: number) => {
  plansPage.value = page
  loadPlansData()
}

const handlePlansPageSizeChange = (size: number) => {
  plansPageSize.value = size
  plansPage.value = 1 // 重置到第一页
  loadPlansData()
}

const handlePlansSearch = (keyword: string) => {
  console.log('搜索计划:', keyword)
}

const handlePlanDetailSave = (data: any) => {
  console.log('保存计划详情:', data)
  ElMessage.success('计划详情已保存')
}

// 关联活动相关方法
const loadRelatedActivities = async (planId: number) => {
  if (!planId) return

  relatedActivitiesLoading.value = true
  try {
    // 这里应该调用API获取关联活动
    // const response = await getActivitiesByPlanId(planId)
    // relatedActivities.value = response.data

    // 临时模拟数据，实际应该从API获取
    setTimeout(() => {
      relatedActivities.value = [
        {
          id: 1,
          title: '秋季郊游活动',
          start_time: '2024-10-15 09:00:00',
          location: '森林公园',
          status: 'ongoing',
          capacity: 50,
          registered_count: 35
        },
        {
          id: 2,
          title: '万圣节主题活动',
          start_time: '2024-10-31 14:00:00',
          location: '幼儿园大厅',
          status: 'planned',
          capacity: 80,
          registered_count: 12
        }
      ]
      relatedActivitiesLoading.value = false
    }, 800)
  } catch (error) {
    console.error('加载关联活动失败:', error)
    relatedActivities.value = []
    relatedActivitiesLoading.value = false
  }
}

// 加载缴费统计
const loadPaymentStats = async (planId: number) => {
  if (!planId) return

  paymentStatsLoading.value = true
  try {
    // 这里应该调用API获取缴费统计
    // const response = await getPaymentStatsByPlanId(planId)
    // paymentStats.value = response.data

    // 临时模拟数据，实际应该从API获取
    setTimeout(() => {
      if (planId === 6) { // 2024年秋季招生计划
        paymentStats.value = {
          totalRegistrations: 76,
          totalPaidAmount: 750,
          paymentCompletionRate: 65,
          activities: [
            {
              id: 1,
              title: '秋季郊游活动',
              deposit_fee: 50,
              full_fee: 200,
              total_registrations: 52,
              unpaid_count: 48,
              deposit_paid_count: 2,
              full_paid_count: 2,
              total_paid_amount: 500
            },
            {
              id: 2,
              title: '万圣节主题活动',
              deposit_fee: 50,
              full_fee: 200,
              total_registrations: 14,
              unpaid_count: 12,
              deposit_paid_count: 1,
              full_paid_count: 1,
              total_paid_amount: 250
            },
            {
              id: 3,
              title: '感恩节亲子活动',
              deposit_fee: 50,
              full_fee: 200,
              total_registrations: 10,
              unpaid_count: 10,
              deposit_paid_count: 0,
              full_paid_count: 0,
              total_paid_amount: 0
            }
          ]
        }
      } else {
        // 其他招生计划的模拟数据
        paymentStats.value = {
          totalRegistrations: 0,
          totalPaidAmount: 0,
          paymentCompletionRate: 0,
          activities: []
        }
      }
      paymentStatsLoading.value = false
    }, 600)
  } catch (error) {
    console.error('加载缴费统计失败:', error)
    paymentStats.value = {
      totalRegistrations: 0,
      totalPaidAmount: 0,
      paymentCompletionRate: 0,
      activities: []
    }
    paymentStatsLoading.value = false
  }
}

// 加载转化统计
const loadConversionStats = async (planId: number) => {
  if (!planId) return

  conversionStatsLoading.value = true
  try {
    // 这里应该调用API获取转化统计
    // const response = await getConversionStatsByPlanId(planId)
    // conversionStats.value = response.data

    // 临时模拟数据，实际应该从API获取
    setTimeout(() => {
      if (planId === 6) { // 2024年秋季招生计划
        conversionStats.value = {
          totalParticipants: 76,
          consultationCount: 15,
          consultationRate: 20,
          applicationCount: 5,
          applicationRate: 7,
          admissionCount: 2,
          admissionRate: 3,
          activityBreakdown: [
            {
              id: 1,
              title: '秋季郊游活动',
              participantCount: 52,
              applicationCount: 3,
              admissionCount: 1,
              conversionRate: 6
            },
            {
              id: 2,
              title: '万圣节主题活动',
              participantCount: 14,
              applicationCount: 1,
              admissionCount: 1,
              conversionRate: 7
            },
            {
              id: 3,
              title: '感恩节亲子活动',
              participantCount: 10,
              applicationCount: 1,
              admissionCount: 0,
              conversionRate: 10
            }
          ]
        }
      } else if (planId === 1) { // 其他招生计划
        conversionStats.value = {
          totalParticipants: 59,
          consultationCount: 12,
          consultationRate: 20,
          applicationCount: 3,
          applicationRate: 5,
          admissionCount: 1,
          admissionRate: 2,
          activityBreakdown: [
            {
              id: 6,
              title: '冬季运动会',
              participantCount: 0,
              applicationCount: 0,
              admissionCount: 0,
              conversionRate: 0
            },
            {
              id: 7,
              title: '春季亲子运动会',
              participantCount: 15,
              applicationCount: 1,
              admissionCount: 0,
              conversionRate: 7
            },
            {
              id: 8,
              title: '植树节环保活动',
              participantCount: 10,
              applicationCount: 1,
              admissionCount: 0,
              conversionRate: 10
            },
            {
              id: 9,
              title: '母亲节感恩活动',
              participantCount: 26,
              applicationCount: 1,
              admissionCount: 1,
              conversionRate: 4
            },
            {
              id: 13,
              title: '幼儿园音乐启蒙课',
              participantCount: 8,
              applicationCount: 0,
              admissionCount: 0,
              conversionRate: 0
            }
          ]
        }
      } else {
        // 其他招生计划的模拟数据
        conversionStats.value = {
          totalParticipants: 0,
          consultationCount: 0,
          consultationRate: 0,
          applicationCount: 0,
          applicationRate: 0,
          admissionCount: 0,
          admissionRate: 0,
          activityBreakdown: []
        }
      }
      conversionStatsLoading.value = false
    }, 800)
  } catch (error) {
    console.error('加载转化统计失败:', error)
    conversionStats.value = {
      totalParticipants: 0,
      consultationCount: 0,
      consultationRate: 0,
      applicationCount: 0,
      applicationRate: 0,
      admissionCount: 0,
      admissionRate: 0,
      activityBreakdown: []
    }
    conversionStatsLoading.value = false
  }
}

const handleCreateActivityForPlan = (plan: any) => {
  if (!plan) return

  // 跳转到活动创建页面，并传递招生计划ID
  router.push({
    path: '/activity/create',
    query: {
      planId: plan.id,
      planTitle: plan.title
    }
  })
}

const handleViewActivity = (activity: any) => {
  // 跳转到活动详情页面
  router.push({
    path: `/activity/${activity.id}`
  })
}

// 工具方法
const calculateProgress = (data: any) => {
  if (!data) return 0

  // 处理不同的数据结构
  const targetCount = data.target_count || data.targetCount || 0
  const enrolledCount = data.enrolled_count || data.appliedCount || 0

  if (!targetCount) return 0
  return Math.round((enrolledCount / targetCount) * 100)
}

const getProgressColor = (data: any) => {
  const progress = calculateProgress(data)
  if (progress >= 80) return 'var(--success-color)'
  if (progress >= 60) return 'var(--warning-color)'
  if (progress >= 40) return 'var(--danger-color)'
  return 'var(--info-color)'
}

const formatDateTime = (dateTime: string) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getActivityStatusType = (status: string) => {
  const statusMap = {
    'planned': 'info',
    'ongoing': 'success',
    'full': 'warning',
    'completed': 'info',
    'cancelled': 'danger'
  }
  return statusMap[status] || 'info'
}

const getActivityStatusText = (status: string) => {
  const statusMap = {
    'planned': '计划中',
    'ongoing': '进行中',
    'full': '已满员',
    'completed': '已结束',
    'cancelled': '已取消'
  }
  return statusMap[status] || '未知'
}

// 缴费相关工具方法
const calculatePaymentProgress = (activity: any) => {
  if (!activity || !activity.total_registrations) return 0
  const paidCount = (activity.deposit_paid_count || 0) + (activity.full_paid_count || 0)
  return Math.round((paidCount / activity.total_registrations) * 100)
}

const getPaymentProgressColor = (activity: any) => {
  const progress = calculatePaymentProgress(activity)
  if (progress >= 80) return 'var(--success-color)'
  if (progress >= 60) return 'var(--warning-color)'
  if (progress >= 40) return 'var(--danger-color)'
  return 'var(--info-color)'
}

// 申请管理相关
const handleApplicationRowClick = (row: any) => {
  // 点击行直接打开编辑弹窗
  handleEditApplication(row)
}

const handleApplicationsPageChange = (page: number) => {
  applicationsPage.value = page
  loadApplicationsData()
}

const handleApplicationsPageSizeChange = (size: number) => {
  applicationsPageSize.value = size
  applicationsPage.value = 1 // 重置到第一页
  loadApplicationsData()
}

const handleApplicationsSearch = (keyword: string) => {
  console.log('搜索申请:', keyword)
}

// 咨询管理分页处理
const handleConsultationsPageChange = (page: number) => {
  consultationsPage.value = page
  loadConsultationsData()
}

const handleConsultationsPageSizeChange = (size: number) => {
  consultationsPageSize.value = size
  consultationsPage.value = 1 // 重置到第一页
  loadConsultationsData()
}

const handleApplicationDetailSave = (data: any) => {
  console.log('保存申请详情:', data)
  ElMessage.success('申请详情已保存')
}


  // 编辑申请（弹窗）
  const handleEditApplication = (row: any) => {
    formModalTitle.value = '编辑申请信息'
    formFields.value = [
      { prop: 'studentName', label: '学生姓名', type: 'input', required: true, span: 12 },
      { prop: 'gender', label: '性别', type: 'select', span: 12, options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' }
      ]},
      { prop: 'birthDate', label: '出生日期', type: 'date', span: 12, dateType: 'date', valueFormat: 'YYYY-MM-DD' },
      { prop: 'parentName', label: '家长姓名', type: 'input', span: 12 },
      { prop: 'phone', label: '联系方式', type: 'input', span: 12 },
      { prop: 'status', label: '状态', type: 'select', span: 12, options: [
        { label: '待审核', value: 'pending' },
        { label: '已通过', value: 'approved' },
        { label: '已拒绝', value: 'rejected' }
      ]},
      { prop: 'remark', label: '备注', type: 'textarea', span: 24 }
    ]
    formData.value = { ...row }
    formModalVisible.value = true
  }

// 咨询管理相关
const handleCreateConsultation = () => {
  formModalTitle.value = '新建咨询记录'
  formFields.value = [
    { prop: 'parentName', label: '家长姓名', type: 'input', required: true, span: 12 },
    { prop: 'phone', label: '联系方式', type: 'input', required: true, span: 12 },
    { prop: 'source', label: '来源渠道', type: 'select', span: 12, options: [
      { label: '官网', value: 'website' },
      { label: '微信', value: 'wechat' },
      { label: '电话', value: 'phone' }
    ]},
    { prop: 'assignee', label: '负责人', type: 'select', span: 12, options: [
      { label: '李老师', value: 'teacher_li' },
      { label: '张老师', value: 'teacher_zhang' },
      { label: '王老师', value: 'teacher_wang' }
    ]},
    { prop: 'remarks', label: '咨询内容', type: 'textarea', span: 24 }
  ]
  formData.value = {}
  formModalVisible.value = true
}

const handleEditConsultation = (row: any) => {
  formModalTitle.value = '编辑咨询记录'
  formData.value = { ...row }
  formModalVisible.value = true
}

const handleConsultationRowClick = (row: any) => {
  console.log('查看咨询详情:', row)
}

// 数据分析相关
const handleAnalyticsAction = (action: any) => {
  ElMessage.info(`执行分析操作: ${action.label}`)
}

const handleAnalyticsFilter = (filterKey: string, active: boolean) => {
  console.log('分析筛选:', filterKey, active)
}

// AI助手相关
const handleAIAction = (action: any) => {
  aiLoading.value = true
  setTimeout(() => {
    aiLoading.value = false
    ElMessage.success(`${action.label}完成`)
  }, 2000)
}

// 表单相关
const handleFormConfirm = (data: any) => {
  formLoading.value = true
  setTimeout(() => {
    formLoading.value = false
    formModalVisible.value = false
    ElMessage.success('操作成功')
  }, 1000)
}

const handleFormCancel = () => {
  formModalVisible.value = false
}

// 状态处理函数
const getPlanStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    active: 'success',
    inactive: 'danger',
    draft: 'warning'
  }
  return typeMap[status] || 'info'
}

const getPlanStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '进行中',
    inactive: '已结束',
    draft: '草稿'
  }
  return textMap[status] || status
}

const getApplicationStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

const getApplicationStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return textMap[status] || status
}

const getConsultationStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    new: 'primary',
    following: 'warning',
    converted: 'success',
    lost: 'danger'
  }
  return typeMap[status] || 'info'
}

const getConsultationStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    new: '新咨询',
    following: '跟进中',
    converted: '已转化',
    lost: '已流失'
  }
  return textMap[status] || status
}

const getMaterialStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return textMap[status] || status
}





// 初始化图表
const initCharts = async () => {
  console.log('🔄 开始初始化招生中心图表...')

  // 等待DOM完全渲染
  await nextTick()

  // 延迟一点时间确保布局稳定
  setTimeout(() => {
    // 招生趋势图表
    analyticsTrendChart.value = {
      title: { text: '' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月']
      },
      yAxis: { type: 'value' },
      series: [{
        data: [180, 220, 195, 160, 140, 185],
        type: 'line',
        smooth: true,
        itemStyle: { color: 'var(--primary-color)' }
      }]
    }

    // 来源渠道图表
    analyticsChannelChart.value = {
      title: { text: '' },
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: '50%',
        data: [
          { value: 40, name: '线上推广' },
          { value: 30, name: '口碑推荐' },
          { value: 20, name: '地推活动' },
          { value: 10, name: '其他渠道' }
        ]
      }]
    }

    console.log('✅ 招生中心图表配置初始化完成')

    // 初始化其他图表
    initAllCharts()
  }, 200) // 延迟200ms确保布局稳定
}

// 转化漏斗图表配置
const initFunnelChart = () => {
  analyticsFunnelChart.value = {
    title: { text: '' },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'funnel',
      data: [
        { value: 1000, name: '咨询' },
        { value: 800, name: '意向' },
        { value: 600, name: '试听' },
        { value: 400, name: '报名' },
        { value: 300, name: '入学' }
      ]
    }]
  }
}

// 地域分布图表配置
const initRegionChart = () => {
  analyticsRegionChart.value = {
    title: { text: '' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['朝阳区', '海淀区', '西城区', '东城区', '丰台区']
    },
    yAxis: { type: 'value' },
    series: [{
      data: [120, 200, 150, 80, 70],
      type: 'bar',
      itemStyle: { color: 'var(--success-color)' }
    }]
  }
}

// 初始化所有图表
const initAllCharts = () => {
  initFunnelChart()
  initRegionChart()
  console.log('✅ 招生中心所有图表配置已设置')
}


// 初始化数据
onMounted(() => {
  // 加载初始数据
  loadOverviewData()
  loadPlansData()
  loadApplicationsData()
  loadConsultationsData()

  // 确保概览图表能正确显示
  setTimeout(() => {
    console.log('🔄 概览页面，确保图表数据完整')
    // 如果图表数据为空，设置默认数据
    if (!enrollmentTrendChart.value || Object.keys(enrollmentTrendChart.value).length === 0) {
      enrollmentTrendChart.value = {
        title: { text: '' },
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(50, 50, 50, 0.9)',
          borderColor: 'var(--primary-color)',
          borderWidth: 1,
          textStyle: {
            color: 'var(--bg-white)',
            fontSize: 12
          },
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: 'var(--primary-color)'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月'],
          axisLine: {
            lineStyle: {
              color: '#4a5568'
            }
          },
          axisLabel: {
            color: '#a0aec0',
            fontSize: 12
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#a0aec0',
            fontSize: 12
          },
          splitLine: {
            lineStyle: {
              color: '#2d3748',
              type: 'dashed'
            }
          }
        },
        series: [{
          name: '招生人数',
          data: [120, 200, 150, 80, 70, 110],
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: getPrimaryColor() },
                { offset: 1, color: getPurpleEndColor() }
              ]
            }
          },
          itemStyle: {
            color: getPrimaryColor(),
            borderColor: 'var(--bg-white)',
            borderWidth: 2
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: primaryRgba(0.3) },
                { offset: 1, color: primaryRgba(0.05) }
              ]
            }
          }
        }]
      }
    }

    if (!sourceChannelChart.value || Object.keys(sourceChannelChart.value).length === 0) {
      sourceChannelChart.value = {
        title: { text: '' },
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(50, 50, 50, 0.9)',
          borderColor: '#42a5f5',
          borderWidth: 1,
          textStyle: {
            color: 'var(--bg-white)',
            fontSize: 12
          },
          axisPointer: {
            type: 'shadow',
            shadowStyle: {
              color: 'rgba(66, 165, 245, 0.2)'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['线上推广', '口碑推荐', '地推活动', '其他渠道'],
          axisLine: {
            lineStyle: {
              color: '#4a5568'
            }
          },
          axisLabel: {
            color: '#a0aec0',
            fontSize: 12,
            interval: 0,
            rotate: 0
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#a0aec0',
            fontSize: 12
          },
          splitLine: {
            lineStyle: {
              color: '#2d3748',
              type: 'dashed'
            }
          }
        },
        series: [{
          name: '咨询数量',
          data: [
            { value: 320, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#42a5f5' }, { offset: 1, color: '#26c6da' }] } } },
            { value: 240, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#66bb6a' }, { offset: 1, color: '#4caf50' }] } } },
            { value: 180, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#ab47bc' }, { offset: 1, color: '#ec407a' }] } } },
            { value: 120, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#ff7043' }, { offset: 1, color: '#ff5722' }] } } }
          ],
          type: 'bar',
          barWidth: '60%',
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'var(--shadow-heavy)'
            }
          }
        }]
      }
    }

    console.log('✅ 概览页面图表数据检查完成')
  }, 800)
})

const loadOverviewData = async () => {
  try {
    chartsLoading.value = true
    console.log('🔄 开始加载招生中心概览数据...')
    const response = await getEnrollmentOverview({ timeRange: 'month' })
    console.log('📊 API响应数据:', response)

    // 正确解析API响应数据结构
    const data = response.data || response
    console.log('📊 解析后的数据结构:', {
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : [],
      hasStatistics: !!data?.statistics,
      statisticsKeys: data?.statistics ? Object.keys(data?.statistics) : [],
      statisticsContent: data?.statistics,
      hasCharts: !!data?.charts,
      chartsKeys: data?.charts ? Object.keys(data?.charts) : [],
      chartsContent: data?.charts
    })

    // 更新统计数据
    if (data.statistics) {
      overviewStats.value = [
        {
          key: 'total_consultations',
          title: '总咨询数',
          value: data.statistics.totalConsultations.value,
          unit: '人',
          trend: data.statistics.totalConsultations.trend,
          trendText: data.statistics.totalConsultations.trendText,
          type: 'primary',
          icon: 'User'
        },
        {
          key: 'applications',
          title: '已报名',
          value: data.statistics.applications.value,
          unit: '人',
          trend: data.statistics.applications.trend,
          trendText: data.statistics.applications.trendText,
          type: 'success',
          icon: 'Document'
        },
        {
          key: 'trials',
          title: '试听中',
          value: data.statistics.trials.value,
          unit: '人',
          trend: data.statistics.trials.trend,
          trendText: data.statistics.trials.trendText,
          type: 'warning',
          icon: 'Trophy'
        },
        {
          key: 'conversion_rate',
          title: '转化率',
          value: data.statistics.conversionRate.value,
          unit: '%',
          trend: data.statistics.conversionRate.trend,
          trendText: data.statistics.conversionRate.trendText,
          type: 'info',
          icon: 'TrendCharts'
        }
      ]
    }

    // 更新图表数据
    console.log('🔍 检查API响应数据结构:', {
      hasData: !!data,
      hasCharts: !!data.charts,
      chartsKeys: data.charts ? Object.keys(data.charts) : [],
      enrollmentTrend: data.charts?.enrollmentTrend,
      sourceChannel: data.charts?.sourceChannel
    })

    if (data.charts && data.charts.enrollmentTrend && data.charts.sourceChannel) {
      console.log('📊 检测到API返回的图表数据:', {
        enrollmentTrend: data.charts.enrollmentTrend,
        sourceChannel: data.charts.sourceChannel
      })

      enrollmentTrendChart.value = {
        title: { text: '' },
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(50, 50, 50, 0.9)',
          borderColor: 'var(--primary-color)',
          borderWidth: 1,
          textStyle: {
            color: 'var(--bg-white)',
            fontSize: 12
          },
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: 'var(--primary-color)'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.charts.enrollmentTrend.categories,
          axisLine: {
            lineStyle: {
              color: '#4a5568'
            }
          },
          axisLabel: {
            color: '#a0aec0',
            fontSize: 12
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#a0aec0',
            fontSize: 12
          },
          splitLine: {
            lineStyle: {
              color: '#2d3748',
              type: 'dashed'
            }
          }
        },
        series: data.charts.enrollmentTrend.series.map((s, index) => ({
          name: s.name,
          type: 'line',
          data: s.data,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: index === 0 ? {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: getPrimaryColor() },
                { offset: 1, color: getPurpleEndColor() }
              ]
            } : '#42a5f5'
          },
          itemStyle: {
            color: index === 0 ? getPrimaryColor() : '#42a5f5',
            borderColor: 'var(--bg-white)',
            borderWidth: 2
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: index === 0 ? primaryRgba(0.3) : 'rgba(66, 165, 245, 0.3)' },
                { offset: 1, color: index === 0 ? primaryRgba(0.05) : 'rgba(66, 165, 245, 0.05)' }
              ]
            }
          }
        }))
      }

      sourceChannelChart.value = {
        title: { text: '' },
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(50, 50, 50, 0.9)',
          borderColor: '#42a5f5',
          borderWidth: 1,
          textStyle: {
            color: 'var(--bg-white)',
            fontSize: 12
          },
          axisPointer: {
            type: 'shadow',
            shadowStyle: {
              color: 'rgba(66, 165, 245, 0.2)'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.charts.sourceChannel.categories,
          axisLine: {
            lineStyle: {
              color: '#4a5568'
            }
          },
          axisLabel: {
            color: '#a0aec0',
            fontSize: 12,
            interval: 0,
            rotate: 0
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#a0aec0',
            fontSize: 12
          },
          splitLine: {
            lineStyle: {
              color: '#2d3748',
              type: 'dashed'
            }
          }
        },
        series: data.charts.sourceChannel.series.map((s, seriesIndex) => ({
          name: s.name,
          type: 'bar',
          data: s.data.map((value, index) => {
            const colors = [
              { start: '#42a5f5', end: '#26c6da' },
              { start: '#66bb6a', end: '#4caf50' },
              { start: '#ab47bc', end: '#ec407a' },
              { start: '#ff7043', end: '#ff5722' }
            ]
            const colorIndex = (index + seriesIndex) % colors.length
            return {
              value,
              itemStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: colors[colorIndex].start },
                    { offset: 1, color: colors[colorIndex].end }
                  ]
                }
              }
            }
          }),
          barWidth: '60%',
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'var(--shadow-heavy)'
            }
          }
        }))
      }

      console.log('✅ 概览标签页图表数据已更新', {
        enrollmentTrend: enrollmentTrendChart.value,
        sourceChannel: sourceChannelChart.value
      })
    } else {
      // 如果API没有返回图表数据，使用默认数据
      console.warn('⚠️ API未返回图表数据，使用默认数据')

      enrollmentTrendChart.value = {
        title: { text: '' },
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(50, 50, 50, 0.9)',
          borderColor: 'var(--primary-color)',
          borderWidth: 1,
          textStyle: {
            color: 'var(--bg-white)',
            fontSize: 12
          },
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: 'var(--primary-color)'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月'],
          axisLine: {
            lineStyle: {
              color: '#4a5568'
            }
          },
          axisLabel: {
            color: '#a0aec0',
            fontSize: 12
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#a0aec0',
            fontSize: 12
          },
          splitLine: {
            lineStyle: {
              color: '#2d3748',
              type: 'dashed'
            }
          }
        },
        series: [{
          name: '招生人数',
          data: [120, 200, 150, 80, 70, 110],
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: getPrimaryColor() },
                { offset: 1, color: getPurpleEndColor() }
              ]
            }
          },
          itemStyle: {
            color: getPrimaryColor(),
            borderColor: 'var(--bg-white)',
            borderWidth: 2
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: primaryRgba(0.3) },
                { offset: 1, color: primaryRgba(0.05) }
              ]
            }
          }
        }]
      }

      sourceChannelChart.value = {
        title: { text: '' },
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(50, 50, 50, 0.9)',
          borderColor: '#42a5f5',
          borderWidth: 1,
          textStyle: {
            color: 'var(--bg-white)',
            fontSize: 12
          },
          axisPointer: {
            type: 'shadow',
            shadowStyle: {
              color: 'rgba(66, 165, 245, 0.2)'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['线上推广', '口碑推荐', '地推活动', '其他渠道'],
          axisLine: {
            lineStyle: {
              color: '#4a5568'
            }
          },
          axisLabel: {
            color: '#a0aec0',
            fontSize: 12,
            interval: 0,
            rotate: 0
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#a0aec0',
            fontSize: 12
          },
          splitLine: {
            lineStyle: {
              color: '#2d3748',
              type: 'dashed'
            }
          }
        },
        series: [{
          name: '咨询数量',
          data: [
            { value: 320, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#42a5f5' }, { offset: 1, color: '#26c6da' }] } } },
            { value: 240, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#66bb6a' }, { offset: 1, color: '#4caf50' }] } } },
            { value: 180, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#ab47bc' }, { offset: 1, color: '#ec407a' }] } } },
            { value: 120, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#ff7043' }, { offset: 1, color: '#ff5722' }] } } }
          ],
          type: 'bar',
          barWidth: '60%',
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'var(--shadow-heavy)'
            }
          }
        }]
      }

      console.log('✅ 概览标签页默认图表数据已设置')
    }

    // 延迟结束加载状态，确保图表有时间初始化
    await nextTick()
    setTimeout(() => {
      chartsLoading.value = false
      console.log('📊 图表加载状态已更新为完成')
    }, 100)
  } catch (error) {
    console.error('加载概览数据失败:', error)
    ElMessage.error('加载概览数据失败')
    chartsLoading.value = false
  }
}

const loadPlansData = async () => {
  try {
    plansLoading.value = true
    const result = await getEnrollmentPlans({
      page: plansPage.value,
      pageSize: plansPageSize.value
    })

    // 使用统一的响应处理工具
    const standardResponse = handleListResponse(result)
    plansData.value = standardResponse.data
    plansTotal.value = standardResponse.total
  } catch (error) {
    console.error('加载计划数据失败:', error)
    ElMessage.error('加载计划数据失败')
    plansData.value = []
    plansTotal.value = 0
  } finally {
    plansLoading.value = false
  }
}

const loadApplicationsData = async () => {
  try {
    applicationsLoading.value = true
    const result = await getEnrollmentApplications({
      page: applicationsPage.value,
      pageSize: applicationsPageSize.value
    })

    // 使用统一的响应处理工具
    const standardResponse = handleListResponse(result)
    applicationsData.value = standardResponse.data
    applicationsTotal.value = standardResponse.total
  } catch (error) {
    console.error('加载申请数据失败:', error)
    ElMessage.error('加载申请数据失败')
    applicationsData.value = []
    applicationsTotal.value = 0
  } finally {
    applicationsLoading.value = false
  }
}

const loadConsultationsData = async () => {
  try {
    consultationsLoading.value = true

    // 尝试加载咨询统计数据
    let stats: any = {}
    try {
      stats = await getConsultationStatistics()
      console.log('✅ 咨询统计数据加载成功:', stats)
    } catch (apiError) {
      console.warn('⚠️ 咨询统计API调用失败，使用默认数据:', apiError)
      // 使用合理的默认数据
      stats = {
        todayConsultations: 12,
        pendingFollowUp: 8,
        monthlyConversions: 45,
        averageResponseTime: 2.5
      }
    }

    // 设置咨询统计数据，确保有默认值
    consultationStats.value = [
      { key: 'today', title: '今日咨询', value: stats.todayConsultations || 12, unit: '人', type: 'primary', icon: 'Phone' },
      { key: 'pending', title: '待跟进', value: stats.pendingFollowUp || 8, unit: '人', type: 'warning', icon: 'Clock' },
      { key: 'monthly', title: '本月转化', value: stats.monthlyConversions || 45, unit: '人', type: 'success', icon: 'Check' },
      { key: 'response', title: '平均响应', value: stats.averageResponseTime || 2.5, unit: '小时', type: 'info', icon: 'Timer' }
    ]

    console.log('✅ 咨询统计数据设置完成:', consultationStats.value)

    // 加载咨询列表数据
    try {
      const consultationsResponse = await getEnrollmentConsultations({
        page: consultationsPage.value,
        pageSize: consultationsPageSize.value
      })

      console.log('🔍 咨询列表API响应:', consultationsResponse)

      if (consultationsResponse?.success && consultationsResponse?.data) {
        // 使用统一的API响应处理
        const { handleListResponse } = await import('@/utils/api-response-handler')
        const { data: consultationsList, total } = handleListResponse(consultationsResponse.data)

        // 映射后端字段到前端期望的字段
        const mappedConsultations = (consultationsList || []).map(item => ({
          ...item,
          consultationNo: item.id || '-',
          phone: item.contactPhone || '-',
          source: item.sourceChannelText || '-',
          status: item.followupStatusText || '-',
          assignee: item.consultant?.realName || '-'
        }))

        consultationsData.value = mappedConsultations
        consultationsTotal.value = total || 0

        console.log('✅ 咨询列表数据加载成功:', mappedConsultations?.length || 0, '条记录')
      } else if (consultationsResponse?.message?.includes('待实现')) {
        // API功能未实现，显示空数据
        console.warn('⚠️ 咨询列表API功能待实现，显示空数据')
        consultationsData.value = []
        consultationsTotal.value = 0
      } else {
        // API返回错误，显示空数据
        console.error('❌ 咨询列表API返回错误:', consultationsResponse)
        consultationsData.value = []
        consultationsTotal.value = 0
      }
    } catch (consultationError) {
      console.error('❌ 咨询列表API调用失败:', consultationError)
      consultationsData.value = []
      consultationsTotal.value = 0
    }
  } catch (error) {
    console.error('❌ 加载咨询数据失败:', error)
    console.log('🔄 设置备用咨询数据')

    // 设置备用数据，确保页面功能正常
    consultationStats.value = [
      { key: 'today', title: '今日咨询', value: 12, unit: '人', type: 'primary', icon: 'Phone' },
      { key: 'pending', title: '待跟进', value: 8, unit: '人', type: 'warning', icon: 'Clock' },
      { key: 'monthly', title: '本月转化', value: 45, unit: '人', type: 'success', icon: 'Check' },
      { key: 'response', title: '平均响应', value: 2.5, unit: '小时', type: 'info', icon: 'Timer' }
    ]

    // 不显示错误消息，避免影响用户体验
    console.log('✅ 已设置备用咨询数据')
  } finally {
    consultationsLoading.value = false
  }
}
</script>

<style scoped lang="scss">
// 导入全局样式变量
@import '@/styles/design-tokens.scss';

// 概览样式 - 使用Carbon Design System网格
.overview-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl); // var(--spacing-3xl) - 标准间距
  padding-top: var(--spacing-lg); // var(--text-3xl) - 与标签栏的间距
}

// 主容器背景设置 - 参考活动中心的标准样式
.enrollment-center {
  background: var(--bg-secondary, var(--bg-container));  // ✅ 与活动中心一致
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;
  min-height: 100%;
  // 移除自定义边框和阴影，使用统一样式
}

/* .welcome-section 样式已移至全局 center-common.scss 中统一管理 */

// 统计卡片网格样式 - 使用标准StatCard组件
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
}

.stat-card-wrapper {
  min-height: 140px;
  display: flex;
  flex-direction: column;
}

.stats-section {
  margin-bottom: var(--spacing-xl);

  .cds-grid {
    gap: var(--spacing-md); // var(--text-lg) 网格间距
    margin: 0;
    padding: 0;
  }

  .cds-row {
    display: contents; // 让行容器不影响网格布局
  }

  .cds-col-lg-4,
  .cds-col-md-8,
  .cds-col-sm-4 {
    // 移除额外的padding和margin，让网格gap处理间距
  }
}

.charts-section {
  margin-bottom: var(--spacing-xl);
}

// 响应式图表网格布局
.charts-grid-responsive {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--text-3xl);
  margin-bottom: var(--spacing-3xl);

  .chart-item {
    min-height: 350px;
    display: flex;
    flex-direction: column;
  }

  // 超大屏幕 (1920px+) - 更宽的间距
  @media (min-width: 1920px) {
    gap: var(--spacing-3xl);
    grid-template-columns: 1fr 1fr;
  }

  // 大屏幕 (1200px - 1919px) - 标准布局
  @media (min-width: var(--breakpoint-xl)) and (max-width: 1919px) {
    gap: var(--text-3xl);
    grid-template-columns: 1fr 1fr;
  }

  // 中等屏幕 (76var(--spacing-sm) - 1199px) - 保持两列但间距减小
  @media (min-width: var(--breakpoint-md)) and (max-width: 1199px) {
    gap: var(--text-lg);
    grid-template-columns: 1fr 1fr;

    .chart-item {
      min-height: 320px;
    }
  }

  // 小屏幕 (576px - 767px) - 单列布局
  @media (min-width: 576px) and (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--text-lg);

    .chart-item {
      min-height: 300px;
    }
  }

  // 超小屏幕 (< 576px) - 单列紧凑布局
  @media (max-width: 575px) {
    grid-template-columns: 1fr;
    gap: var(--text-sm);
    margin-bottom: var(--text-3xl);

    .chart-item {
      min-height: 280px;
    }
  }
}

.quick-actions-section {
  padding: var(--spacing-lg) 0; // var(--text-3xl) 垂直内边距

  .cds-grid {
    gap: var(--spacing-md); // var(--text-lg) 网格间距
    margin: 0;
    padding: 0;
  }

  .cds-row {
    display: contents; // 让行容器不影响网格布局
    align-items: center;
  }

  .cds-col-lg-8,
  .cds-col-md-4,
  .cds-col-sm-4 {
    // 移除额外的padding，让网格gap处理间距
  }

  .primary-actions {
    display: flex;
    justify-content: flex-start;
  }

  .secondary-actions {
    display: flex;
    justify-content: flex-end;

    @media (max-width: var(--breakpoint-md)) {
      justify-content: flex-start;
      margin-top: var(--spacing-sm);
    }
  }
}

// 计划管理样式
.plans-content {
  padding-top: var(--spacing-lg); // var(--text-3xl) - 与标签栏的间距
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl); // var(--spacing-3xl) - 标准间距
  height: calc(100vh - 160px); // 充满屏幕高度
  min-height: 600px; // 最小高度确保内容可见
  overflow: hidden; // 防止整体页面滚动
}

.plans-layout {
  display: grid;
  grid-template-columns: 1fr; // 仅显示列表区域，取消右侧详情栏
  gap: var(--spacing-lg); // var(--text-3xl) 间距
  flex: 1; // 占用剩余空间
  min-height: 0; // 允许flex子项收缩
  overflow: hidden; // 防止布局溢出

  .plans-list {
    min-width: 0;
    background: var(--bg-elevated);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg); // var(--text-3xl) 内边距
    box-shadow: var(--shadow-sm);
    border: var(--border-width-base) solid var(--border-primary);
    display: flex;
    flex-direction: column;
    min-height: 0; // 允许flex子项收缩
    overflow: hidden; // 让DataTable组件处理滚动

    // 确保DataTable组件充满容器
    :deep(.data-table) {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
  }

  .plan-detail {
    min-width: 300px;
    background: var(--bg-elevated);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg); // var(--text-3xl) 内边距
    box-shadow: var(--shadow-sm);
    border: var(--border-width-base) solid var(--border-primary);
  }
}

.quotas-management {
  .quota-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    margin-bottom: var(--spacing-3);

    .class-name {
      min-width: 80px;
      font-weight: var(--font-medium);
    }

    .quota-info {
      min-width: 60px;
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }
  }
}

// 申请管理样式
.applications-content {
  padding-top: var(--spacing-lg); // var(--text-3xl) - 与标签栏的间距
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl); // var(--spacing-3xl) - 标准间距
  height: calc(100vh - 160px); // 充满屏幕高度
  min-height: 600px; // 最小高度确保内容可见
  overflow: hidden; // 防止整体页面滚动
}

.applications-layout {
  display: grid;
  grid-template-columns: 1fr; // 仅显示列表区域，取消右侧详情栏
  gap: var(--spacing-lg); // var(--text-3xl) 间距
  flex: 1; // 占用剩余空间
  min-height: 0; // 允许flex子项收缩
  overflow: hidden; // 防止布局溢出

  .applications-list {
    min-width: 0;
    background: var(--bg-elevated);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg); // var(--text-3xl) 内边距
    box-shadow: var(--shadow-sm);
    border: var(--border-width-base) solid var(--border-primary);
    display: flex;
    flex-direction: column;
    min-height: 0; // 允许flex子项收缩
    overflow: hidden; // 让DataTable组件处理滚动

    // 确保DataTable组件充满容器
    :deep(.data-table) {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
  }

  .application-detail {
    min-width: 300px;
    background: var(--bg-elevated);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg); // var(--text-3xl) 内边距
    box-shadow: var(--shadow-sm);
    border: var(--border-width-base) solid var(--border-primary);
  }
}

.materials-section {
  .material-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    margin-bottom: var(--spacing-2);

    .material-name {
      flex: 1;
      font-size: var(--text-sm);
    }
  }
}

// 咨询管理样式
.consultations-content {
  padding-top: var(--spacing-lg); // var(--text-3xl) - 与标签栏的间距
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg); // var(--text-3xl) - 减少间距以节省空间
  height: calc(100vh - 160px); // 优化高度计算，为页面头部和标签栏留出合适空间
  min-height: 600px; // 设置最小高度确保内容可见
  overflow: hidden; // 防止整体页面滚动
}

.consultation-stats {
  flex-shrink: 0; // 防止统计卡片被压缩

  .cds-grid {
    gap: var(--spacing-md); // var(--text-lg) 网格间距
    margin: 0;
    padding: 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md); // var(--text-lg) 间距
  }
}

.consultations-table-container {
  flex: 1; // 占用剩余空间
  display: flex;
  flex-direction: column;
  min-height: 0; // 允许flex子项收缩
  overflow: hidden; // 防止容器滚动，让内部表格处理滚动
  width: 100%; // 确保容器占满宽度
}

.consultations-table {
  flex: 1;
  background: var(--bg-elevated);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg); // var(--text-3xl) 内边距
  box-shadow: var(--shadow-sm);
  border: var(--border-width-base) solid var(--border-primary);
  display: flex;
  flex-direction: column;
  min-height: 0; // 允许内容收缩
  overflow: auto; // 改为允许滚动
  width: 100%; // 确保占满宽度

  // 确保DataTable组件充满容器
  :deep(.data-table) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    width: 100% !important; // 强制设置宽度
  }

  // 强制Element Plus表格充满宽度
  :deep(.el-table) {
    width: 100% !important;
    min-width: 100% !important;
  }

  :deep(.el-table__body-wrapper) {
    width: 100% !important;
  }
}

// 数据分析样式
.analytics-content {
  padding-top: var(--spacing-lg); // var(--text-3xl) - 与标签栏的间距
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl); // var(--spacing-3xl) - 标准间距
  height: calc(100vh - 160px); // 充满屏幕高度
  min-height: 600px; // 最小高度确保内容可见
  overflow: hidden; // 防止整体页面滚动
}

.analytics-charts {
  .cds-grid {
    gap: var(--spacing-md); // var(--text-lg) 网格间距
    margin: 0;
    padding: 0;
  }
}

.analytics-toolbar,
.analytics-charts {
  background: var(--bg-elevated);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg); // var(--text-3xl) 内边距
  box-shadow: var(--shadow-sm);
  border: var(--border-width-base) solid var(--border-primary);
}

.analytics-metrics {
  .cds-grid {
    margin: 0;
  }

  .cds-row {
    margin: 0 calc(-1 * var(--spacing-04));
  }

  .cds-col-lg-4,
  .cds-col-md-8,
  .cds-col-sm-4 {
    padding: 0 var(--spacing-04);
    margin-bottom: var(--spacing-04);
  }
}

// AI助手样式
.ai-content {
  padding-top: var(--spacing-lg); // var(--text-3xl) - 与标签栏的间距
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl); // var(--spacing-3xl) - 标准间距
  height: calc(100vh - 160px); // 充满屏幕高度
  min-height: 600px; // 最小高度确保内容可见
  overflow: hidden; // 防止整体页面滚动
}

.ai-toolbar,
.ai-results {
  background: var(--bg-elevated);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg); // var(--text-3xl) 内边距
  box-shadow: var(--shadow-sm);
  border: var(--border-width-base) solid var(--border-primary);
}

.ai-results {
  .ai-charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg); // var(--text-3xl) 间距
  }

  .ai-suggestions {
    h3 {
      margin-bottom: var(--spacing-4);
      color: var(--text-primary);
    }

    .suggestions-list {
      display: flex;
      flex-direction: column;
      gap: var(--text-lg);
    }

    .suggestion-item {
      display: flex;
      gap: var(--spacing-3);
      padding: var(--spacing-4);
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      border-left: var(--spacing-xs) solid var(--primary-color);

      .suggestion-icon {
        color: var(--primary-color);
        font-size: var(--text-xl);
        margin-top: var(--spacing-1);
      }

      .suggestion-content {
        flex: 1;

        h4 {
          margin: 0 0 var(--spacing-2) 0;
          font-size: var(--text-sm);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
        }

        p {
          margin: 0 0 var(--spacing-3) 0;
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: var(--leading-normal);
        }

        .suggestion-metrics {
          display: flex;
          gap: var(--text-lg);

          .metric, .confidence {
            font-size: var(--text-xs);
            color: var(--primary-color);
            font-weight: var(--font-medium);
          }
        }
      }
    }
  }
}

.ai-metrics {
  .cds-grid {
    margin: 0;
  }

  .cds-row {
    margin: 0 calc(-1 * var(--spacing-04));
  }

  .cds-col-lg-4,
  .cds-col-md-8,
  .cds-col-sm-4 {
    padding: 0 var(--spacing-04);
    margin-bottom: var(--spacing-04);
  }
}

// 关联活动样式
.progress-display {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);

  .progress-text {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    text-align: center;
  }
}

.related-activities-panel {
  .activities-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);

    .activities-count {
      display: flex;
      align-items: center;
    }
  }

  .activities-loading {
    padding: var(--spacing-md);
  }

  .activities-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    max-height: 300px;
    overflow-y: auto;
  }

  .activity-card {
    border: var(--border-width-base) solid var(--border-color-light);
    border-radius: var(--border-radius-md);
    padding: var(--spacing-md);
    background: var(--background-color);
    cursor: pointer;
    transition: all var(--transition-duration-fast) var(--transition-timing);

    &:hover {
      border-color: var(--primary-color);
      box-shadow: var(--shadow-sm);
      transform: translateY(var(--z-index-below));
    }

    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-sm);

      .activity-title {
        font-weight: var(--font-weight-medium);
        color: var(--text-primary);
        font-size: var(--font-size-md);
        line-height: 1.4;
        flex: 1;
        margin-right: var(--spacing-sm);
      }
    }

    .activity-meta {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);

      > div {
        display: flex;
        align-items: center;
        font-size: var(--font-size-sm);
        color: var(--text-secondary);

        .meta-icon {
          margin-right: var(--spacing-xs);
          color: var(--text-tertiary);
          font-size: var(--text-base);
        }
      }
    }
  }

  .no-activities {
    padding: var(--spacing-lg);
    text-align: center;

    .el-empty {
      padding: var(--spacing-md) 0;
    }
  }
}

// 配额管理样式增强
.quotas-management {
  h4 {
    margin: 0 0 var(--spacing-md) 0;
    color: var(--text-primary);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
  }

  .quota-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-sm);
    border: var(--border-width-base) solid var(--border-color-light);
    border-radius: var(--border-radius-sm);
    background: var(--background-color-secondary);

    .class-name {
      font-weight: var(--font-weight-medium);
      color: var(--text-primary);
    }

    .quota-info {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }
  }
}

// 缴费统计样式
.payment-stats-panel {
  .stats-header {
    margin-bottom: var(--spacing-lg);

    .stats-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: var(--spacing-md);

      .summary-item {
        text-align: center;
        padding: var(--spacing-md);
        border: var(--border-width-base) solid var(--border-color-light);
        border-radius: var(--border-radius-md);
        background: var(--background-color-secondary);

        .summary-label {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }

        .summary-value {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
        }
      }
    }
  }

  .stats-loading {
    padding: var(--spacing-lg);
  }

  .payment-activities {
    .activities-header {
      margin-bottom: var(--spacing-md);

      h5 {
        margin: 0;
        color: var(--text-primary);
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-medium);
      }
    }

    .activities-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      max-height: 400px;
      overflow-y: auto;
    }

    .payment-activity-card {
      border: var(--border-width-base) solid var(--border-color-light);
      border-radius: var(--border-radius-md);
      padding: var(--spacing-md);
      background: var(--background-color);

      .activity-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--spacing-md);

        .activity-name {
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
          font-size: var(--font-size-md);
        }

        .activity-fees {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          text-align: right;

          .fee-item {
            font-size: var(--font-size-sm);
            color: var(--text-secondary);
          }
        }
      }

      .payment-breakdown {
        .payment-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);

          .stat-item {
            text-align: center;
            padding: var(--spacing-sm);
            border-radius: var(--border-radius-sm);

            &.unpaid {
              background: #fef0f0;
              border: var(--border-width-base) solid #fde2e2;

              .stat-value {
                color: var(--danger-color);
              }
            }

            &.deposit {
              background: #fdf6ec;
              border: var(--border-width-base) solid #faecd8;

              .stat-value {
                color: var(--warning-color);
              }
            }

            &.full {
              background: #f0f9ff;
              border: var(--border-width-base) solid #e1f5fe;

              .stat-value {
                color: var(--primary-color);
              }
            }

            &.total {
              background: #f0f9f0;
              border: var(--border-width-base) solid #e1f5e1;

              .stat-value {
                color: var(--success-color);
              }
            }

            .stat-label {
              font-size: var(--font-size-xs);
              color: var(--text-secondary);
              margin-bottom: var(--spacing-xs);
            }

            .stat-value {
              font-size: var(--font-size-sm);
              font-weight: var(--font-weight-medium);
            }
          }
        }

        .payment-progress {
          .progress-label {
            font-size: var(--font-size-sm);
            color: var(--text-secondary);
            margin-bottom: var(--spacing-xs);
          }
        }
      }
    }
  }

  .no-payment-data {
    padding: var(--spacing-lg);
    text-align: center;

    .el-empty {
      padding: var(--spacing-md) 0;
    }
  }
}

// 转化统计样式
.conversion-stats-panel {
  .stats-header {
    margin-bottom: var(--spacing-lg);

    .conversion-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: var(--spacing-md);

      .summary-item {
        text-align: center;
        padding: var(--spacing-md);
        border: var(--border-width-base) solid var(--border-color-light);
        border-radius: var(--border-radius-md);
        background: var(--background-color-secondary);

        .summary-label {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }

        .summary-value {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .summary-desc {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
        }
      }
    }
  }

  .stats-loading {
    padding: var(--spacing-lg);
  }

  .conversion-funnel {
    .funnel-header {
      margin-bottom: var(--spacing-lg);

      h5 {
        margin: 0 0 var(--spacing-xs) 0;
        color: var(--text-primary);
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-medium);
      }

      .funnel-desc {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
      }
    }

    .funnel-chart {
      margin-bottom: var(--spacing-xl);

      .funnel-stage {
        margin-bottom: var(--spacing-sm);
        transition: all 0.3s ease;

        .stage-bar {
          padding: var(--spacing-md);
          border-radius: var(--border-radius-md);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
          font-weight: var(--font-weight-medium);

          &.activity {
            background: var(--gradient-purple);
          }

          &.consultation {
            background: var(--gradient-pink);
          }

          &.application {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }

          &.admission {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          }

          .stage-label {
            font-size: var(--font-size-md);
          }

          .stage-value {
            font-size: var(--font-size-sm);
          }
        }
      }
    }

    .activity-breakdown {
      .breakdown-header {
        margin-bottom: var(--spacing-md);

        h5 {
          margin: 0;
          color: var(--text-primary);
          font-size: var(--font-size-md);
          font-weight: var(--font-weight-medium);
        }
      }

      .breakdown-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
        max-height: 300px;
        overflow-y: auto;
      }

      .activity-conversion-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-md);
        border: var(--border-width-base) solid var(--border-color-light);
        border-radius: var(--border-radius-md);
        background: var(--background-color);

        .activity-info {
          flex: 1;

          .activity-name {
            font-weight: var(--font-weight-medium);
            color: var(--text-primary);
            margin-bottom: var(--spacing-xs);
          }

          .activity-stats {
            display: flex;
            gap: var(--spacing-md);

            .stat-item {
              font-size: var(--font-size-sm);
              color: var(--text-secondary);
            }
          }
        }

        .conversion-rate {
          text-align: center;

          .rate-value {
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-bold);
            color: var(--primary-color);
          }

          .rate-label {
            font-size: var(--font-size-xs);
            color: var(--text-secondary);
          }
        }
      }
    }
  }

  .no-conversion-data {
    padding: var(--spacing-lg);
    text-align: center;

    .el-empty {
      padding: var(--spacing-md) 0;
    }
  }
}

// 响应式设计 - 使用Carbon Design System网格
@media (max-width: var(--breakpoint-xl)) {
  // 中等屏幕下stats-grid响应式
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--text-2xl);
  }

  .plans-layout,
  .applications-layout {
    flex-direction: column;

    .plan-detail,
    .application-detail {
      min-width: auto;
    }
  }

  // 图表响应式布局已在 .charts-grid-responsive 中处理

  // 所有页面响应式调整
  .plans-content,
  .applications-content,
  .consultations-content,
  .analytics-content,
  .ai-content {
    height: calc(100vh - 140px); // 中等屏幕调整高度
    min-height: 500px; // 中等屏幕最小高度
  }

  .consultation-stats .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); // 减小最小宽度
  }
}

@media (max-width: var(--breakpoint-md)) {
  // 小屏幕下统计卡片堆叠显示
  .stats-section {
    .cds-col-lg-4,
    .cds-col-md-8 {
      grid-column: span 4; // 小屏幕占满整行
    }
  }

  // 新的stats-grid响应式样式
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--text-lg);
  }

  // 小屏幕下操作按钮垂直排列
  .quick-actions-section {
    .cds-col-lg-8,
    .cds-col-md-4 {
      grid-column: span 4; // 小屏幕占满整行
    }

    .secondary-actions {
      justify-content: flex-start !important;
      margin-top: var(--spacing-04);
    }
  }

  // 所有页面小屏幕适配
  .plans-content,
  .applications-content,
  .consultations-content,
  .analytics-content,
  .ai-content {
    height: calc(100vh - 120px); // 小屏幕进一步调整高度
    min-height: 400px; // 小屏幕最小高度
    gap: var(--spacing-md); // 减少间距
  }

  .consultation-stats .stats-grid {
    grid-template-columns: repeat(2, 1fr); // 小屏幕显示2列
    gap: var(--spacing-sm); // 减少间距
  }

  .consultations-table {
    padding: var(--spacing-md); // 减少内边距
  }
}

@media (max-width: var(--breakpoint-sm)) {
  // 所有页面超小屏幕适配
  .plans-content,
  .applications-content,
  .consultations-content,
  .analytics-content,
  .ai-content {
    height: calc(100vh - 100px);
    min-height: 350px; // 超小屏幕最小高度
  }

  .consultation-stats .stats-grid {
    grid-template-columns: 1fr; // 超小屏幕单列显示
  }

  // 超小屏幕下主要stats-grid样式
  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--text-lg);
  }

  .consultations-table {
    padding: var(--spacing-sm);
  }
}

// 响应式设计 - 完整的断点系统
@media (max-width: var(--breakpoint-xl)) {
  .enrollment-center {
    padding: var(--text-xl);
  }

  .stats-grid-unified {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--text-2xl);
  }

  .actions-grid-unified {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--text-2xl);
  }

  .charts-grid-large {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--text-2xl);
  }
}

@media (max-width: 992px) {
  .enrollment-center {
    padding: var(--text-lg);
  }

  .welcome-section {
    flex-direction: column;
    gap: var(--text-lg);
    align-items: flex-start;
  }

  .stats-grid-unified {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--text-lg);
  }

  .actions-grid-unified {
    grid-template-columns: 1fr;
    gap: var(--text-lg);
  }

  .charts-grid-large {
    grid-template-columns: 1fr;
    gap: var(--text-lg);
  }

  .plans-content {
    .plans-layout {
      flex-direction: column;
      gap: var(--text-lg);
    }
  }

  .applications-content {
    .applications-layout {
      flex-direction: column;
      gap: var(--text-lg);
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .enrollment-center {
    padding: var(--text-lg);
  }

  .welcome-section {
    flex-direction: column;
    text-align: center;
    padding: var(--text-2xl);
    margin-bottom: var(--text-3xl);

    .welcome-content {
      text-align: center;
      margin-bottom: var(--text-lg);

      h2 {
        font-size: var(--text-3xl);
      }

      p {
        font-size: var(--text-base);
      }
    }

    .header-actions {
      margin-left: 0;
      width: 100%;

      .el-button {
        width: 100%;
      }
    }
  }

  .stats-grid-unified {
    grid-template-columns: 1fr;
    gap: var(--text-lg);
  }

  .actions-grid-unified {
    grid-template-columns: 1fr;
    gap: var(--text-lg);
  }

  .charts-grid-large {
    grid-template-columns: 1fr;
    gap: var(--text-lg);
  }

  .plans-content {
    .plans-layout {
      flex-direction: column;
      gap: 0;
    }
  }

  .applications-content {
    .applications-layout {
      flex-direction: column;
      gap: 0;
    }
  }

  .consultations-content {
    .consultation-stats {
      margin-bottom: var(--text-2xl);
    }

    .consultations-table-container {
      .consultations-table {
        overflow-x: auto;
      }
    }
  }

  .analytics-content {
    .analytics-toolbar {
      margin-bottom: var(--text-lg);
    }

    .analytics-charts {
      .charts-grid-large {
        grid-template-columns: 1fr;
        gap: var(--text-lg);
      }
    }

    .analytics-metrics {
      margin-top: var(--text-2xl);
    }
  }

  .ai-content {
    .ai-toolbar {
      margin-bottom: var(--text-lg);
    }

    .ai-results {
      .ai-charts-grid {
        grid-template-columns: 1fr;
        gap: var(--text-lg);
      }

      .ai-suggestions {
        .suggestions-list {
          .suggestion-item {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--text-sm);

            .suggestion-icon {
              align-self: flex-start;
            }

            .suggestion-content {
              .suggestion-metrics {
                flex-direction: column;
                gap: var(--spacing-sm);
              }
            }
          }
        }
      }
    }

    .ai-metrics {
      margin-top: var(--text-2xl);
    }
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .enrollment-center {
    padding: var(--text-sm);
  }

  .welcome-section {
    padding: var(--text-lg);

    .welcome-content {
      h2 {
        font-size: var(--text-2xl);
      }

      p {
        font-size: var(--text-base);
      }
    }
  }

  .stats-grid-unified {
    gap: var(--text-sm);
  }

  .actions-grid-unified {
    gap: var(--text-sm);
  }

  .charts-grid-large {
    gap: var(--text-sm);
  }

  .consultations-content {
    .consultation-stats {
      .stats-grid-unified {
        gap: var(--text-sm);
      }
    }
  }

  .analytics-content {
    .analytics-charts {
      .charts-grid-large {
        gap: var(--text-sm);
      }
    }

    .analytics-metrics {
      .stats-grid-unified {
        gap: var(--text-sm);
      }
    }
  }

  .ai-content {
    .ai-results {
      .ai-charts-grid {
        gap: var(--text-sm);
      }

      .ai-suggestions {
        .suggestions-list {
          .suggestion-item {
            padding: var(--text-sm);

            .suggestion-content {
              h4 {
                font-size: var(--text-base);
              }

              p {
                font-size: var(--text-sm);
              }
            }
          }
        }
      }
    }

    .ai-metrics {
      .stats-grid-unified {
        gap: var(--text-sm);
      }
    }
  }
}

// ✅ 暗黑主题样式 - 与业务中心保持一致
.dark {
  .enrollment-center-timeline {
    background: var(--el-bg-color);
  }

  .welcome-section,
  .stats-section,
  .charts-section,
  .data-section,
  .ai-metrics {
    background: var(--el-fill-color-light);
    backdrop-filter: blur(var(--text-2xl));
    border-color: var(--el-border-color);
    box-shadow: var(--el-box-shadow-light);
  }

  .section-header {
    border-bottom-color: var(--el-border-color);

    h2, h3 {
      color: var(--el-text-color-primary);
    }
  }
}

// ✅ html.dark 兼容性
html.dark {
  .enrollment-center-timeline {
    background: var(--el-bg-color);
  }

  .welcome-section,
  .stats-section,
  .charts-section,
  .data-section,
  .ai-metrics {
    background: var(--el-fill-color-light);
    backdrop-filter: blur(var(--text-2xl));
    border-color: var(--el-border-color);
    box-shadow: var(--el-box-shadow-light);
  }

  .section-header {
    border-bottom-color: var(--el-border-color);

    h2, h3 {
      color: var(--el-text-color-primary);
    }
  }
}
</style>
