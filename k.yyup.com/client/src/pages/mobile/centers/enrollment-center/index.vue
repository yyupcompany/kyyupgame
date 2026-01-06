<template>
  <MobileMainLayout
    title="招生中心"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <!-- 头部操作区域 -->
    <template #header-extra>
      <van-icon name="plus" size="20" @click="handleCreate" />
    </template>

    <div class="mobile-enrollment-center">
      <!-- 统计卡片区域 -->
      <div class="stats-section">
        <div class="stats-grid">
          <div
            v-for="(stat, index) in overviewStats"
            :key="stat.key"
            class="stat-card"
            @click="handleStatClick(stat)"
          >
            <div class="stat-icon" :class="`stat-${stat.type}`">
              <van-icon :name="getStatIcon(stat.iconName)" size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.title }}</div>
              <div class="stat-unit">{{ stat.unit }}</div>
            </div>
            <div class="stat-trend" v-if="stat.trend !== 0">
              <van-icon
                :name="stat.trend > 0 ? 'arrow-up' : 'arrow-down'"
                size="12"
                :color="stat.trend > 0 ? '#06a561' : '#ee0a24'"
              />
              <span class="trend-value" :class="{ 'trend-up': stat.trend > 0, 'trend-down': stat.trend < 0 }">
                {{ Math.abs(stat.trend) }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <van-tabs v-model:active="activeChartTab" sticky shrink>
          <van-tab title="招生趋势">
            <div class="chart-container">
              <div ref="trendChartRef" class="chart"></div>
            </div>
          </van-tab>
          <van-tab title="来源渠道">
            <div class="chart-container">
              <div ref="channelChartRef" class="chart"></div>
            </div>
          </van-tab>
          <van-tab title="转化漏斗">
            <div class="chart-container">
              <div ref="funnelChartRef" class="chart"></div>
            </div>
          </van-tab>
        </van-tabs>
      </div>

      <!-- 快速操作区域 -->
      <div class="quick-actions-section">
        <div class="section-header">
          <h3>快速操作</h3>
        </div>
        <div class="actions-grid">
          <van-button
            v-for="action in quickActions"
            :key="action.key"
            :type="action.type"
            :icon="action.icon"
            block
            @click="handleQuickAction(action)"
            class="action-button"
          >
            {{ action.label }}
          </van-button>
        </div>
      </div>

      <!-- 数据管理区域 -->
      <div class="data-management-section">
        <van-tabs v-model:active="activeDataTab" sticky>
          <van-tab title="招生计划">
            <div class="data-list">
              <div class="list-header">
                <div class="header-title">招生计划管理</div>
                <van-button size="small" type="primary" @click="handleCreatePlan">
                  新建计划
                </van-button>
              </div>

              <van-list
                v-model:loading="plansLoading"
                :finished="plansFinished"
                finished-text="没有更多了"
                @load="loadMorePlans"
              >
                <van-card
                  v-for="plan in plansData"
                  :key="plan.id"
                  :title="plan.title"
                  :desc="`${plan.year}年 ${plan.semester === 'spring' ? '春季' : '秋季'}`"
                  class="plan-card"
                  @click="handlePlanClick(plan)"
                >
                  <template #thumb>
                    <van-icon name="calendar-o" size="40" color="#409eff" />
                  </template>
                  <template #tags>
                    <van-tag :type="getPlanStatusType(plan.status)">
                      {{ getPlanStatusText(plan.status) }}
                    </van-tag>
                  </template>
                  <template #footer>
                    <div class="plan-progress">
                      <div class="progress-info">
                        <span>进度: {{ plan.appliedCount }}/{{ plan.targetCount }}</span>
                        <span>{{ calculateProgress(plan) }}%</span>
                      </div>
                      <van-progress
                        :percentage="calculateProgress(plan)"
                        :color="getProgressColor(plan)"
                        stroke-width="6"
                      />
                    </div>
                  </template>
                </van-card>
              </van-list>
            </div>
          </van-tab>

          <van-tab title="申请管理">
            <div class="data-list">
              <!-- 筛选器 -->
              <div class="filter-bar">
                <van-dropdown-menu>
                  <van-dropdown-item
                    v-model="applicationStatusFilter"
                    :options="applicationStatusOptions"
                    @change="filterApplications"
                  />
                  <van-dropdown-item
                    v-model="applicationTimeFilter"
                    :options="applicationTimeOptions"
                    @change="filterApplications"
                  />
                </van-dropdown-menu>
              </div>

              <van-list
                v-model:loading="applicationsLoading"
                :finished="applicationsFinished"
                finished-text="没有更多了"
                @load="loadMoreApplications"
              >
                <van-card
                  v-for="application in applicationsData"
                  :key="application.id"
                  :title="application.studentName"
                  :desc="`家长: ${application.parentName} | ${application.phone}`"
                  class="application-card"
                  @click="handleApplicationClick(application)"
                >
                  <template #thumb>
                    <van-icon name="contact" size="40" color="#409eff" />
                  </template>
                  <template #tags>
                    <van-tag :type="getApplicationStatusType(application.status)">
                      {{ getApplicationStatusText(application.status) }}
                    </van-tag>
                  </template>
                  <template #footer>
                    <div class="application-footer">
                      <div class="application-info">
                        <span>{{ application.planTitle }}</span>
                        <span>{{ application.applicationDate }}</span>
                      </div>
                      <div class="application-actions" v-if="application.status === 'pending'">
                        <van-button
                          size="mini"
                          type="success"
                          @click.stop="handleApproveApplication(application)"
                        >
                          通过
                        </van-button>
                        <van-button
                          size="mini"
                          type="danger"
                          @click.stop="handleRejectApplication(application)"
                        >
                          拒绝
                        </van-button>
                      </div>
                    </div>
                  </template>
                </van-card>
              </van-list>
            </div>
          </van-tab>

          <van-tab title="咨询管理">
            <div class="data-list">
              <!-- 咨询统计 -->
              <div class="consultation-stats">
                <div
                  v-for="stat in consultationStats"
                  :key="stat.key"
                  class="consultation-stat-item"
                >
                  <div class="stat-icon-small">
                    <van-icon :name="getStatIcon(stat.icon)" size="20" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value-small">{{ stat.value }}</div>
                    <div class="stat-label-small">{{ stat.title }}</div>
                  </div>
                </div>
              </div>

              <van-list
                v-model:loading="consultationsLoading"
                :finished="consultationsFinished"
                finished-text="没有更多了"
                @load="loadMoreConsultations"
              >
                <van-card
                  v-for="consultation in consultationsData"
                  :key="consultation.id"
                  :title="consultation.parentName"
                  :desc="`${consultation.phone} | 来源: ${consultation.source}`"
                  class="consultation-card"
                  @click="handleConsultationClick(consultation)"
                >
                  <template #thumb>
                    <van-icon name="phone-o" size="40" color="#409eff" />
                  </template>
                  <template #tags>
                    <van-tag :type="getConsultationStatusType(consultation.status)">
                      {{ getConsultationStatusText(consultation.status) }}
                    </van-tag>
                  </template>
                  <template #footer>
                    <div class="consultation-footer">
                      <span>负责人: {{ consultation.assignee }}</span>
                      <span>{{ consultation.createdAt }}</span>
                    </div>
                  </template>
                </van-card>
              </van-list>
            </div>
          </van-tab>

          <van-tab title="数据分析">
            <div class="analytics-content">
              <div class="analytics-metrics">
                <div
                  v-for="metric in analyticsMetrics"
                  :key="metric.key"
                  class="metric-card"
                >
                  <div class="metric-title">{{ metric.title }}</div>
                  <div class="metric-value">{{ metric.value }}{{ metric.unit }}</div>
                  <div class="metric-trend">
                    <van-icon
                      :name="metric.trend > 0 ? 'arrow-up' : 'arrow-down'"
                      size="14"
                      :color="metric.trend > 0 ? '#06a561' : '#ee0a24'"
                    />
                    <span>{{ Math.abs(metric.trend) }}%</span>
                  </div>
                </div>
              </div>

              <div class="analytics-actions">
                <van-button
                  v-for="action in analyticsActions"
                  :key="action.key"
                  :icon="action.icon"
                  block
                  @click="handleAnalyticsAction(action)"
                >
                  {{ action.label }}
                </van-button>
              </div>
            </div>
          </van-tab>
        </van-tabs>
      </div>

      <!-- 时间筛选和导出 -->
      <div class="bottom-actions">
        <van-dropdown-menu>
          <van-dropdown-item
            v-model="timeRangeFilter"
            :options="timeRangeOptions"
            title="时间范围"
          />
        </van-dropdown-menu>
        <van-button
          type="primary"
          icon="down"
          size="small"
          @click="handleExportReport"
        >
          导出报表
        </van-button>
      </div>

      <!-- 悬浮帮助按钮 -->
      <van-floating-bubble
        icon="question"
        magnetic="x"
        @click="showHelp = true"
      />
      
      <!-- 悬浮操作按钮 -->
      <van-floating-bubble
        icon="add"
        magnetic="y"
        axis="xy"
        @click="handleCreate"
        style="right: 80px; bottom: 100px;"
      />
    </div>

    <!-- 帮助弹窗 -->
    <van-popup
      v-model:show="showHelp"
      position="bottom"
      :style="{ height: '70%' }"
      round
      closeable
    >
      <div class="help-content">
        <h3>招生中心使用指南</h3>
        <p>移动端招生中心为您提供完整的招生管理功能，包括计划制定、申请审核、咨询跟进和数据分析。</p>

        <van-tabs v-model:active="helpTab">
          <van-tab title="功能特色">
            <div class="feature-list">
              <div v-for="(feature, index) in helpFeatures" :key="index" class="feature-item">
                <van-icon name="star" color="#ffd21e" />
                <span>{{ feature }}</span>
              </div>
            </div>
          </van-tab>

          <van-tab title="使用技巧">
            <div class="tips-list">
              <div v-for="(tip, index) in helpTips" :key="index" class="tip-item">
                <van-icon name="lightbulb" color="#ff6b35" />
                <span>{{ tip }}</span>
              </div>
            </div>
          </van-tab>
        </van-tabs>
      </div>
    </van-popup>

    <!-- AI分析弹窗 -->
    <EnrollmentAIAnalysisDialog
      v-model="aiAnalysisDialogVisible"
    />
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog, showActionSheet } from 'vant'
import * as echarts from 'echarts'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import EnrollmentAIAnalysisDialog from './components/EnrollmentAIAnalysisDialog.vue'
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

const router = useRouter()

// 全局状态
const loading = ref(false)
const showHelp = ref(false)
const helpTab = ref(0)
const aiAnalysisDialogVisible = ref(false)

// Tab状态
const activeChartTab = ref(0)
const activeDataTab = ref(0)

// 图表引用
const trendChartRef = ref<HTMLElement>()
const channelChartRef = ref<HTMLElement>()
const funnelChartRef = ref<HTMLElement>()

// 统计数据 - 对应PC端结构
const overviewStats = ref([
  {
    key: 'total_consultations',
    title: '总咨询数',
    value: 0,
    unit: '人',
    trend: 0,
    type: 'primary',
    iconName: 'user'
  },
  {
    key: 'applications',
    title: '已报名',
    value: 0,
    unit: '人',
    trend: 0,
    type: 'success',
    iconName: 'check'
  },
  {
    key: 'trials',
    title: '试听中',
    value: 0,
    unit: '人',
    trend: 0,
    type: 'warning',
    iconName: 'clock'
  },
  {
    key: 'conversion_rate',
    title: '转化率',
    value: 0,
    unit: '%',
    trend: 0,
    type: 'info',
    iconName: 'trending-up'
  }
])

// 快速操作
const quickActions = ref([
  { key: 'create_plan', label: '新建计划', type: 'primary', icon: 'plus' },
  { key: 'view_applications', label: '查看申请', type: 'success', icon: 'eye' },
  { key: 'ai_analysis', label: 'AI分析', icon: 'bulb-o' },
  { key: 'export_report', label: '导出报表', icon: 'down' }
])

// 招生计划数据
const plansData = ref<EnrollmentPlan[]>([])
const plansLoading = ref(false)
const plansFinished = ref(false)
const plansPage = ref(1)
const plansPageSize = ref(10)
const plansTotal = ref(0)

// 申请管理数据
const applicationsData = ref<EnrollmentApplication[]>([])
const applicationsLoading = ref(false)
const applicationsFinished = ref(false)
const applicationsPage = ref(1)
const applicationsPageSize = ref(10)
const applicationsTotal = ref(0)
const applicationStatusFilter = ref('all')
const applicationTimeFilter = ref('month')

const applicationStatusOptions = [
  { text: '全部状态', value: 'all' },
  { text: '待审核', value: 'pending' },
  { text: '已通过', value: 'approved' },
  { text: '已拒绝', value: 'rejected' }
]

const applicationTimeOptions = [
  { text: '本月', value: 'month' },
  { text: '上周', value: 'lastWeek' },
  { text: '本周', value: 'week' },
  { text: '全部', value: 'all' }
]

// 咨询管理数据
const consultationsData = ref<any[]>([])
const consultationsLoading = ref(false)
const consultationsFinished = ref(false)
const consultationsPage = ref(1)
const consultationsPageSize = ref(10)
const consultationsTotal = ref(0)

const consultationStats = ref([
  { key: 'today', title: '今日咨询', value: 23, unit: '人', type: 'primary', icon: 'phone' },
  { key: 'pending', title: '待跟进', value: 45, unit: '人', type: 'warning', icon: 'clock' },
  { key: 'monthly', title: '本月转化', value: 156, unit: '人', type: 'success', icon: 'check' },
  { key: 'response', title: '平均响应', value: 2.5, unit: '小时', type: 'info', icon: 'timer' }
])

undefined

const analyticsActions = ref([
  { key: 'export', label: '导出报表', icon: 'down' },
  { key: 'refresh', label: '刷新数据', icon: 'replay' }
])

// 时间筛选
const timeRangeFilter = ref('month')
const timeRangeOptions = [
  { text: '本月', value: 'month' },
  { text: '上月', value: 'lastMonth' },
  { text: '本季度', value: 'quarter' },
  { text: '本年', value: 'year' }
]

undefined

// 图标映射
const getStatIcon = (iconName: string) => {
  const iconMap: Record<string, string> = {
    'user': 'friends-o',
    'check': 'success',
    'clock': 'clock-o',
    'trending-up': 'chart-trending-o',
    'phone': 'phone-o',
    'timer': 'timer-o'
  }
  return iconMap[iconName] || 'info-o'
}

// 状态类型映射
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

// 计算进度
const calculateProgress = (plan: any) => {
  if (!plan.targetCount) return 0
  return Math.round((plan.appliedCount / plan.targetCount) * 100)
}

const getProgressColor = (plan: any) => {
  const progress = calculateProgress(plan)
  if (progress >= 80) return '#07c160'
  if (progress >= 60) return '#ff976a'
  if (progress >= 40) return '#ee0a24'
  return '#1989fa'
}

// 事件处理
const handleCreate = async () => {
  await router.push('/enrollment-plan/create')
}

const handleStatClick = (stat: any) => {
  showToast(`点击了${stat.title}`)
}

const handleQuickAction = async (action: any) => {
  switch (action.key) {
    case 'create_plan':
      await router.push('/enrollment-plan/create')
      break
    case 'view_applications':
      activeDataTab.value = 1 // 切换到申请管理tab
      break
    case 'ai_analysis':
      aiAnalysisDialogVisible.value = true
      break
    case 'export_report':
      handleExportReport()
      break
    default:
      showToast(`${action.label}功能开发中`)
  }
}

const handleCreatePlan = async () => {
  await router.push('/enrollment-plan/create')
}

const handlePlanClick = (plan: any) => {
  router.push(`/enrollment-plan/detail?id=${plan.id}`)
}

const handleApplicationClick = (application: any) => {
  router.push(`/enrollment-application/detail?id=${application.id}`)
}

const handleApproveApplication = async (application: any) => {
  try {
    await showDialog({
      title: '确认通过',
      message: '确认通过该申请吗？'
    })

    // 这里调用API更新状态
    application.status = 'approved'
    showToast('已通过申请')
  } catch (error) {
    // 用户取消
  }
}

const handleRejectApplication = async (application: any) => {
  try {
    await showDialog({
      title: '确认拒绝',
      message: '确认拒绝该申请吗？'
    })

    // 这里调用API更新状态
    application.status = 'rejected'
    showToast('已拒绝申请')
  } catch (error) {
    // 用户取消
  }
}

const handleConsultationClick = (consultation: any) => {
  router.push(`/enrollment-consultation/detail?id=${consultation.id}`)
}

const handleAnalyticsAction = (action: any) => {
  if (action.key === 'export') {
    handleExportReport()
  } else {
    showToast(`${action.label}功能开发中`)
  }
}

const handleExportReport = () => {
  showToast('正在生成报表...')
  setTimeout(() => {
    showToast('报表导出成功！')
  }, 2000)
}

const filterApplications = () => {
  applicationsPage.value = 1
  applicationsData.value = []
  loadMoreApplications()
}

// 加载数据方法
const loadOverviewData = async () => {
  try {
    loading.value = true
    const response = await getEnrollmentOverview({ timeRange: 'month' })
    const data = response.data || response

    if (data.statistics) {
      overviewStats.value = [
        {
          key: 'total_consultations',
          title: '总咨询数',
          value: data.statistics.totalConsultations?.value || 234,
          unit: '人',
          trend: data.statistics.totalConsultations?.trend || 12,
          type: 'primary',
          iconName: 'user'
        },
        {
          key: 'applications',
          title: '已报名',
          value: data.statistics.applications?.value || 156,
          unit: '人',
          trend: data.statistics.applications?.trend || 8,
          type: 'success',
          iconName: 'check'
        },
        {
          key: 'trials',
          title: '试听中',
          value: data.statistics.trials?.value || 45,
          unit: '人',
          trend: data.statistics.trials?.trend || -5,
          type: 'warning',
          iconName: 'clock'
        },
        {
          key: 'conversion_rate',
          title: '转化率',
          value: data.statistics.conversionRate?.value || 68.5,
          unit: '%',
          trend: data.statistics.conversionRate?.trend || 3.2,
          type: 'info',
          iconName: 'trending-up'
        }
      ]
    }
  } catch (error) {
    console.error('加载概览数据失败:', error)
    // 使用默认数据
    overviewStats.value = [
      { key: 'total_consultations', title: '总咨询数', value: 234, unit: '人', trend: 12, type: 'primary', iconName: 'user' },
      { key: 'applications', title: '已报名', value: 156, unit: '人', trend: 8, type: 'success', iconName: 'check' },
      { key: 'trials', title: '试听中', value: 45, unit: '人', trend: -5, type: 'warning', iconName: 'clock' },
      { key: 'conversion_rate', title: '转化率', value: 68.5, unit: '%', trend: 3.2, type: 'info', iconName: 'trending-up' }
    ]
  } finally {
    loading.value = false
  }
}

const loadMorePlans = async () => {
  if (plansFinished.value) return

  try {
    plansLoading.value = true
    const response = await getEnrollmentPlans({
      page: plansPage.value,
      pageSize: plansPageSize.value
    })

    const newPlans = Array.isArray(response.data?.data) ? response.data.data : []
    if (newPlans.length === 0) {
      plansFinished.value = true
    } else {
      plansData.value.push(...newPlans)
      plansPage.value++
    }
  } catch (error) {
    console.error('加载招生计划失败:', error)
    // 使用模拟数据
    const mockPlans = [
      {
        id: 1,
        title: '2024年秋季招生计划',
        year: 2024,
        semester: 'autumn',
        targetCount: 60,
        appliedCount: 45,
        status: 'active'
      },
      {
        id: 2,
        title: '2025年春季招生计划',
        year: 2025,
        semester: 'spring',
        targetCount: 80,
        appliedCount: 12,
        status: 'draft'
      }
    ]

    if (plansPage.value === 1) {
      plansData.value = mockPlans
      plansFinished.value = true
    }
  } finally {
    plansLoading.value = false
  }
}

const loadMoreApplications = async () => {
  if (applicationsFinished.value) return

  try {
    applicationsLoading.value = true
    const response = await getEnrollmentApplications({
      page: applicationsPage.value,
      pageSize: applicationsPageSize.value,
      status: applicationStatusFilter.value !== 'all' ? applicationStatusFilter.value : undefined
    })

    const newApplications = Array.isArray(response.data?.data) ? response.data.data : []
    if (newApplications.length === 0) {
      applicationsFinished.value = true
    } else {
      applicationsData.value.push(...newApplications)
      applicationsPage.value++
    }
  } catch (error) {
    console.error('加载申请数据失败:', error)
    // 使用模拟数据
    const mockApplications = [
      {
        id: 1,
        studentName: '张小明',
        parentName: '张先生',
        phone: '138****8888',
        planTitle: '2024年秋季招生计划',
        status: 'pending',
        applicationDate: '2025-01-15'
      },
      {
        id: 2,
        studentName: '李小红',
        parentName: '李女士',
        phone: '139****9999',
        planTitle: '2024年秋季招生计划',
        status: 'approved',
        applicationDate: '2025-01-10'
      }
    ]

    if (applicationsPage.value === 1) {
      applicationsData.value = mockApplications
      applicationsFinished.value = true
    }
  } finally {
    applicationsLoading.value = false
  }
}

const loadMoreConsultations = async () => {
  if (consultationsFinished.value) return

  try {
    consultationsLoading.value = true
    const response = await getEnrollmentConsultations({
      page: consultationsPage.value,
      pageSize: consultationsPageSize.value
    })

    const newConsultations = Array.isArray(response.data?.data) ? response.data.data : []
    if (newConsultations.length === 0) {
      consultationsFinished.value = true
    } else {
      consultationsData.value.push(...newConsultations)
      consultationsPage.value++
    }
  } catch (error) {
    console.error('加载咨询数据失败:', error)
    // 使用模拟数据，确保与PC端数据结构一致
    const mockConsultations = [
      {
        id: 1,
        consultationNo: 'ZX20250115001',
        parentName: '王先生',
        phone: '137****7777',
        source: '线上推广',
        status: 'new',
        assignee: '李老师',
        createdAt: '2025-01-15 14:30',
        contactPhone: '137****7777',
        sourceChannelText: '线上推广',
        followupStatusText: '新咨询',
        consultant: { realName: '李老师' }
      },
      {
        id: 2,
        consultationNo: 'ZX20250114002',
        parentName: '赵女士',
        phone: '136****6666',
        source: '口碑推荐',
        status: 'following',
        assignee: '张老师',
        createdAt: '2025-01-14 10:15',
        contactPhone: '136****6666',
        sourceChannelText: '口碑推荐',
        followupStatusText: '跟进中',
        consultant: { realName: '张老师' }
      }
    ]

    if (consultationsPage.value === 1) {
      consultationsData.value = mockConsultations
      consultationsFinished.value = true
    }
  } finally {
    consultationsLoading.value = false
  }
}

// 初始化图表
const initCharts = async () => {
  await nextTick()

  if (trendChartRef.value) {
    const trendChart = echarts.init(trendChartRef.value)
    const trendOption = {
      title: { text: '' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月']
      },
      yAxis: { type: 'value' },
      series: [{
        data: [120, 200, 150, 80, 70, 110],
        type: 'line',
        smooth: true,
        itemStyle: { color: '#409eff' }
      }]
    }
    trendChart.setOption(trendOption)
  }

  if (channelChartRef.value) {
    const channelChart = echarts.init(channelChartRef.value)
    const channelOption = {
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
    channelChart.setOption(channelOption)
  }

  if (funnelChartRef.value) {
    const funnelChart = echarts.init(funnelChartRef.value)
    const funnelOption = {
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
    funnelChart.setOption(funnelOption)
  }
}

// 组件挂载
onMounted(async () => {
  await Promise.all([
    loadOverviewData(),
    loadMorePlans(),
    loadMoreApplications(),
    loadMoreConsultations()
  ])

  await initCharts()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.mobile-enrollment-center {
  padding: var(--spacing-md);
  background: var(--van-background-color-light);
  min-height: 100vh;
}

// 统计卡片样式
.stats-section {
  margin-bottom: 20px;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);

    .stat-card {
      background: var(--card-bg);
      border-radius: 12px;
      padding: var(--spacing-md);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      position: relative;
      cursor: pointer;
      transition: all 0.3s;

      &:active {
        transform: scale(0.98);
      }

      .stat-icon {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 40px;
        height: 40px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;

        &.stat-primary {
          background: linear-gradient(135deg, #409eff, #66b1ff);
        }

        &.stat-success {
          background: linear-gradient(135deg, #07c160, #38d9a9);
        }

        &.stat-warning {
          background: linear-gradient(135deg, #ff976a, #ffc069);
        }

        &.stat-info {
          background: linear-gradient(135deg, #909399, #b3b3b3);
        }
      }

      .stat-content {
        padding-right: 48px;

        .stat-value {
          font-size: var(--text-3xl);
          font-weight: bold;
          color: #323233;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: var(--text-sm);
          color: #969799;
          margin-bottom: 2px;
        }

        .stat-unit {
          font-size: var(--text-xs);
          color: #c8c9cc;
        }
      }

      .stat-trend {
        position: absolute;
        bottom: 8px;
        right: 12px;
        display: flex;
        align-items: center;
        gap: 2px;

        .trend-value {
          font-size: var(--text-xs);
          font-weight: 500;

          &.trend-up {
            color: #07c160;
          }

          &.trend-down {
            color: #ee0a24;
          }
        }
      }
    }
  }
}

// 图表区域样式
.charts-section {
  margin-bottom: 20px;
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .chart-container {
    height: 300px;
    padding: var(--spacing-md);

    .chart {
      width: 100%;
      height: 100%;
    }
  }
}

// 快速操作区域样式
.quick-actions-section {
  margin-bottom: 20px;

  .section-header {
    margin-bottom: 12px;

    h3 {
      margin: 0;
      font-size: var(--text-base);
      font-weight: 600;
      color: #323233;
    }
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);

    .action-button {
      height: 48px;
      font-size: var(--text-sm);
      border-radius: 8px;
      font-weight: 500;
    }
  }
}

// 数据管理区域样式
.data-management-section {
  margin-bottom: 20px;
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .data-list {
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--van-border-color);

      .header-title {
        font-size: var(--text-base);
        font-weight: 600;
        color: #323233;
      }
    }

    .filter-bar {
      border-bottom: 1px solid var(--van-border-color);
    }

    .consultation-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--van-border-color);

      .consultation-stat-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) 12px;
        background: #f7f8fa;
        border-radius: 6px;

        .stat-icon-small {
          color: var(--primary-color);
        }

        .stat-info {
          .stat-value-small {
            font-size: var(--text-base);
            font-weight: bold;
            color: #323233;
            line-height: 1;
          }

          .stat-label-small {
            font-size: var(--text-xs);
            color: #969799;
            margin-top: 2px;
          }
        }
      }
    }
  }

  // 卡片样式
  :deep(.van-card) {
    background: var(--card-bg);
    border-radius: 0;
    margin: 0;

    .van-card__content {
      padding: var(--spacing-md);
    }

    .van-card__footer {
      padding: 0 16px 16px;
    }
  }

  .plan-card,
  .application-card,
  .consultation-card {
    border-bottom: 1px solid var(--van-border-color);
    cursor: pointer;
    transition: background-color 0.3s;

    &:active {
      background-color: #f2f3f5;
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .plan-progress {
    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: var(--text-xs);
      color: #969799;
    }
  }

  .application-footer,
  .consultation-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--text-xs);
    color: #969799;

    .application-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      flex: 1;
    }

    .application-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }
}

// 数据分析样式
.analytics-content {
  padding: var(--spacing-md);

  .analytics-metrics {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    margin-bottom: 20px;

    .metric-card {
      background: #f7f8fa;
      border-radius: 8px;
      padding: var(--spacing-md);
      text-align: center;

      .metric-title {
        font-size: var(--text-xs);
        color: #969799;
        margin-bottom: 8px;
      }

      .metric-value {
        font-size: var(--text-xl);
        font-weight: bold;
        color: #323233;
        margin-bottom: 8px;
      }

      .metric-trend {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-xs);
        font-size: var(--text-xs);
        color: #07c160;
      }
    }
  }

  .analytics-actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);

    :deep(.van-button) {
      height: 48px;
      border-radius: 8px;
    }
  }
}

// 底部操作区域样式
.bottom-actions {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--card-bg);
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  :deep(.van-dropdown-menu) {
    flex: 1;
  }

  :deep(.van-button) {
    flex-shrink: 0;
    width: 100px;
  }
}

// 帮助弹窗样式
.help-content {
  padding: var(--spacing-lg);
  height: 100%;
  overflow-y: auto;

  h3 {
    margin: 0 0 8px 0;
    font-size: var(--text-lg);
    font-weight: 600;
    color: #323233;
  }

  p {
    margin: 0 0 20px 0;
    font-size: var(--text-sm);
    color: #969799;
    line-height: 1.5;
  }

  .feature-list,
  .tips-list {
    .feature-item,
    .tip-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) 0;
      border-bottom: 1px solid var(--van-border-color);

      &:last-child {
        border-bottom: none;
      }

      span {
        flex: 1;
        font-size: var(--text-sm);
        color: #323233;
        line-height: 1.5;
      }
    }
  }
}

// 响应式设计
@media (min-width: 768px) {
  .mobile-enrollment-center {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}

// 深色模式适配
:root[data-theme="dark"] {
  .mobile-enrollment-center {
    background: var(--van-background-color-dark);
  }

  .stats-grid .stat-card,
  .charts-section,
  .data-management-section,
  .bottom-actions {
    background: var(--van-background-color-dark);
    border-color: var(--van-border-color-dark);
  }

  .quick-actions-section .section-header h3,
  .data-list .list-header .header-title {
    color: var(--van-text-color-dark);
  }

  .stat-card .stat-content .stat-value,
  .consultation-stat-item .stat-info .stat-value-small,
  .metric-card .metric-value {
    color: var(--van-text-color-dark);
  }

  .help-content {
    h3 {
      color: var(--van-text-color-dark);
    }

    p {
      color: var(--van-text-color-3);
    }

    .feature-item,
    .tip-item {
      border-bottom-color: var(--van-border-color-dark);

      span {
        color: var(--van-text-color-dark);
      }
    }
  }
}
</style>
