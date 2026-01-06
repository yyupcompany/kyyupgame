<template>
  <UnifiedCenterLayout
    title="财务中心"
    description="清晰展示财务管理的完整流程，方便园长一目了然地掌握财务状况"
  >
    <template #header-actions>
      <el-button type="primary" size="large" @click="handleQuickPayment">
        <el-icon><Plus /></el-icon>
        快速收费
      </el-button>
    </template>

    <div class="center-container finance-center-timeline">

    <!-- 标签页内容 -->
    <el-tabs v-model="activeTab" class="main-content" @tab-change="handleTabChange">
    <!-- 概览标签页 -->
    <el-tab-pane label="概览" name="overview">
      <div class="finance-overview">

        <!-- 财务概览卡片 -->
        <div class="finance-stats">
          <div class="stats-grid-unified">
            <StatCard
              title="本月收入"
              :value="formatMoney(overview.monthlyRevenue)"
              unit="¥"
              trend="up"
              :trend-text="`较上月 +${overview.revenueGrowth}%`"
              type="primary"
              icon-name="TrendCharts"
              clickable
              @click="handleStatClick('revenue')"
            />
            <StatCard
              title="待收费用"
              :value="formatMoney(overview.pendingAmount)"
              unit="¥"
              trend="stable"
              :trend-text="`${overview.pendingCount}位学生`"
              type="warning"
              icon-name="Clock"
              clickable
              @click="handleStatClick('pending')"
            />
            <StatCard
              title="收费完成率"
              :value="overview.collectionRate"
              unit="%"
              trend="up"
              :trend-text="`${overview.paidCount}/${overview.totalCount}位学生`"
              type="success"
              icon-name="SuccessFilled"
              clickable
              @click="handleStatClick('collection')"
            />
            <StatCard
              title="逾期费用"
              :value="formatMoney(overview.overdueAmount)"
              unit="¥"
              trend="down"
              :trend-text="`${overview.overdueCount}笔`"
              type="danger"
              icon-name="WarningFilled"
              clickable
              @click="handleStatClick('overdue')"
            />
          </div>
        </div>

        <!-- 快速操作 -->
        <div class="finance-actions">
          <h3 class="section-title">快速操作</h3>
          <div class="quick-actions-grid">
            <div
              v-for="func in functions"
              :key="func.key"
              class="center-card-wrapper"
            >
              <StatCard
                :title="func.title"
                :value="''"
                :description="func.description || '点击进入'"
                :icon-name="func.iconName"
                :type="func.iconClass"
                clickable
                @click="handleFunctionClick(func)"
              />
            </div>
          </div>
        </div>
      </div>
    </el-tab-pane>

    <!-- 收费管理标签页 -->
    <el-tab-pane label="收费管理" name="payments">
      <div class="payments-content">
        <div class="section-header">
          <h3>收费管理</h3>
          <el-button type="primary" @click="handleQuickPayment">
            <el-icon><Plus /></el-icon>
            新增收费
          </el-button>
        </div>

        <div class="cds-grid">
          <div class="cds-card cds-col-12">
            <div class="cds-card-header">
              <div class="cds-card-title">今日收费记录</div>
            </div>
            <div class="cds-card-content">
              <div v-if="todayPayments.length > 0" class="payment-list">
                <div v-for="payment in todayPayments" :key="payment.id" class="payment-item">
                  <div class="payment-info">
                    <div class="student-name">{{ payment.studentName }}</div>
                    <div class="payment-detail">{{ payment.feeType }} - {{ payment.class }}</div>
                  </div>
                  <div class="payment-amount">¥{{ payment.amount }}</div>
                </div>
              </div>
              <div v-else class="empty-state">
                <el-empty description="暂无今日收费记录" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-tab-pane>

    <!-- 报表分析标签页 -->
    <el-tab-pane label="报表分析" name="reports">
      <div class="reports-content">
        <div class="section-header">
          <h3>财务报表</h3>
          <div class="header-actions">
            <el-select v-model="reportTimeRange" placeholder="选择时间范围" style="width: 150px; margin-right: var(--text-sm);">
              <el-option label="本月" value="month" />
              <el-option label="本季度" value="quarter" />
              <el-option label="本年" value="year" />
              <el-option label="自定义" value="custom" />
            </el-select>
            <el-button @click="handleRefreshReports" :loading="reportsLoading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button @click="handleExportReport">
              <el-icon><Download /></el-icon>
              导出报表
            </el-button>
          </div>
        </div>

        <!-- 报表统计卡片 -->
        <div class="cds-grid">
          <div class="cds-card cds-col-3">
            <div class="stat-card">
              <div class="stat-icon revenue">
                <el-icon><Money /></el-icon>
              </div>
              <div class="stat-info">
                <h3>总收入</h3>
                <div class="stat-value">¥{{ formatMoney(reportStats.totalRevenue) }}</div>
                <div class="stat-change positive">
                  <el-icon><ArrowUp /></el-icon>
                  {{ reportStats.revenueGrowth }}%
                </div>
              </div>
            </div>
          </div>

          <div class="cds-card cds-col-3">
            <div class="stat-card">
              <div class="stat-icon collection">
                <el-icon><SuccessFilled /></el-icon>
              </div>
              <div class="stat-info">
                <h3>收费率</h3>
                <div class="stat-value">{{ reportStats.collectionRate }}%</div>
                <div class="stat-change positive">
                  <el-icon><ArrowUp /></el-icon>
                  {{ reportStats.collectionGrowth }}%
                </div>
              </div>
            </div>
          </div>

          <div class="cds-card cds-col-3">
            <div class="stat-card">
              <div class="stat-icon pending">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <h3>待收金额</h3>
                <div class="stat-value">¥{{ formatMoney(reportStats.pendingAmount) }}</div>
                <div class="stat-desc">{{ reportStats.pendingCount }}笔</div>
              </div>
            </div>
          </div>

          <div class="cds-card cds-col-3">
            <div class="stat-card">
              <div class="stat-icon overdue">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="stat-info">
                <h3>逾期金额</h3>
                <div class="stat-value">¥{{ formatMoney(reportStats.overdueAmount) }}</div>
                <div class="stat-desc">{{ reportStats.overdueCount }}笔</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 收入趋势图表 -->
        <div class="cds-grid">
          <div class="cds-card cds-col-8">
            <div class="cds-card-header">
              <div class="cds-card-title">收入趋势分析</div>
            </div>
            <div class="cds-card-content">
              <div ref="revenueChart" style="height: 450px;"></div>
            </div>
          </div>

          <div class="cds-card cds-col-4">
            <div class="cds-card-header">
              <div class="cds-card-title">收费类型分布</div>
            </div>
            <div class="cds-card-content">
              <div ref="feeTypeChart" style="height: 450px;"></div>
            </div>
          </div>
        </div>

        <!-- 详细报表列表 -->
        <div class="cds-grid">
          <div class="cds-card cds-col-12">
            <div class="cds-card-header">
              <div class="cds-card-title">报表列表</div>
              <el-button type="primary" size="small" @click="showGenerateReportDialog = true">
                <el-icon><Plus /></el-icon>
                生成报表
              </el-button>
            </div>
            <div class="cds-card-content">
              <el-table :data="reportsList" v-loading="reportsLoading">
                <el-table-column prop="name" label="报表名称" />
                <el-table-column prop="type" label="报表类型">
                  <template #default="{ row }">
                    <el-tag :type="getReportTypeColor(row.type)">{{ getReportTypeName(row.type) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="period" label="统计周期" />
                <el-table-column prop="createdAt" label="生成时间">
                  <template #default="{ row }">
                    {{ formatTime(row.createdAt) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="220" align="center">
                  <template #default="{ row }">
                    <div class="table-actions">
                      <el-button-group>
                        <el-button size="small" @click="viewReport(row)">
                          <el-icon><View /></el-icon>
                          查看
                        </el-button>
                        <el-button size="small" @click="downloadReport(row)">
                          <el-icon><Download /></el-icon>
                          下载
                        </el-button>
                        <el-button size="small" type="danger" @click="deleteReport(row)">
                          <el-icon><Delete /></el-icon>
                          删除
                        </el-button>
                      </el-button-group>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>
    </el-tab-pane>

    <!-- 设置标签页 -->
    <el-tab-pane label="设置" name="settings">
      <div class="settings-content">
        <div class="section-header">
          <h3>财务设置</h3>
          <el-button @click="handleSaveSettings" :loading="settingsLoading" type="primary">
            <el-icon><Check /></el-icon>
            保存设置
          </el-button>
        </div>

        <div class="cds-grid">
          <!-- 收费配置 -->
          <div class="cds-card cds-col-6">
            <div class="cds-card-header">
              <div class="cds-card-title">收费配置</div>
            </div>
            <div class="cds-card-content">
              <el-form :model="financeSettings" label-width="120px">
                <el-form-item label="默认缴费期限">
                  <el-input-number
                    v-model="financeSettings.defaultPaymentDays"
                    :min="1"
                    :max="365"
                    controls-position="right"
                  />
                  <span class="form-help">天</span>
                </el-form-item>

                <el-form-item label="逾期提醒">
                  <el-switch v-model="financeSettings.overdueReminder" />
                </el-form-item>

                <el-form-item label="提醒提前天数" v-if="financeSettings.overdueReminder">
                  <el-input-number
                    v-model="financeSettings.reminderDays"
                    :min="1"
                    :max="30"
                    controls-position="right"
                  />
                  <span class="form-help">天</span>
                </el-form-item>

                <el-form-item label="自动生成缴费单">
                  <el-switch v-model="financeSettings.autoGenerateBills" />
                </el-form-item>

                <el-form-item label="允许部分缴费">
                  <el-switch v-model="financeSettings.allowPartialPayment" />
                </el-form-item>
              </el-form>
            </div>
          </div>

          <!-- 报表配置 -->
          <div class="cds-card cds-col-6">
            <div class="cds-card-header">
              <div class="cds-card-title">报表配置</div>
            </div>
            <div class="cds-card-content">
              <el-form :model="financeSettings" label-width="120px">
                <el-form-item label="自动生成月报">
                  <el-switch v-model="financeSettings.autoMonthlyReport" />
                </el-form-item>

                <el-form-item label="报表发送邮箱" v-if="financeSettings.autoMonthlyReport">
                  <el-input v-model="financeSettings.reportEmail" placeholder="请输入邮箱地址" />
                </el-form-item>

                <el-form-item label="报表保留期限">
                  <el-select v-model="financeSettings.reportRetentionDays">
                    <el-option label="30天" :value="30" />
                    <el-option label="90天" :value="90" />
                    <el-option label="180天" :value="180" />
                    <el-option label="365天" :value="365" />
                    <el-option label="永久保留" :value="0" />
                  </el-select>
                </el-form-item>

                <el-form-item label="导出格式">
                  <el-checkbox-group v-model="financeSettings.exportFormats">
                    <el-checkbox label="excel">Excel</el-checkbox>
                    <el-checkbox label="pdf">PDF</el-checkbox>
                    <el-checkbox label="csv">CSV</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-form>
            </div>
          </div>

          <!-- 权限配置 -->
          <div class="cds-card cds-col-6">
            <div class="cds-card-header">
              <div class="cds-card-title">权限配置</div>
            </div>
            <div class="cds-card-content">
              <el-form :model="financeSettings" label-width="120px">
                <el-form-item label="收费权限">
                  <el-select v-model="financeSettings.paymentPermission" multiple>
                    <el-option label="财务人员" value="finance" />
                    <el-option label="班主任" value="teacher" />
                    <el-option label="园长" value="principal" />
                  </el-select>
                </el-form-item>

                <el-form-item label="退费审批">
                  <el-select v-model="financeSettings.refundApproval">
                    <el-option label="财务主管" value="finance_manager" />
                    <el-option label="园长" value="principal" />
                    <el-option label="双重审批" value="dual" />
                  </el-select>
                </el-form-item>

                <el-form-item label="报表查看权限">
                  <el-select v-model="financeSettings.reportViewPermission" multiple>
                    <el-option label="财务人员" value="finance" />
                    <el-option label="园长" value="principal" />
                    <el-option label="投资人" value="investor" />
                  </el-select>
                </el-form-item>
              </el-form>
            </div>
          </div>

          <!-- 通知配置 -->
          <div class="cds-card cds-col-6">
            <div class="cds-card-header">
              <div class="cds-card-title">通知配置</div>
            </div>
            <div class="cds-card-content">
              <el-form :model="financeSettings" label-width="120px">
                <el-form-item label="缴费成功通知">
                  <el-checkbox-group v-model="financeSettings.paymentNotification">
                    <el-checkbox label="sms">短信</el-checkbox>
                    <el-checkbox label="wechat">微信</el-checkbox>
                    <el-checkbox label="email">邮件</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>

                <el-form-item label="逾期提醒通知">
                  <el-checkbox-group v-model="financeSettings.overdueNotification">
                    <el-checkbox label="sms">短信</el-checkbox>
                    <el-checkbox label="wechat">微信</el-checkbox>
                    <el-checkbox label="phone">电话</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>

                <el-form-item label="财务异常通知">
                  <el-switch v-model="financeSettings.abnormalNotification" />
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
      </div>
    </el-tab-pane>
    </el-tabs>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  TrendCharts, Clock, SuccessFilled, WarningFilled,
  Refresh, Plus, ArrowUp, CreditCard, Document,
  Setting, DataAnalysis, Download, Bell, Check, Money, Warning,
  View, Delete, Tickets, Edit
} from '@element-plus/icons-vue'
import StatCard from '@/components/centers/StatCard.vue'
import * as echarts from 'echarts'
import financeAPI from '@/api/modules/finance'

const router = useRouter()
const loading = ref(false)
const activeTab = ref('overview')

// 报表相关数据
const reportsLoading = ref(false)
const reportTimeRange = ref('month')
const revenueChart = ref()
const feeTypeChart = ref()
const showGenerateReportDialog = ref(false)

// 设置相关数据
const settingsLoading = ref(false)
const paymentActiveTab = ref('todayPayments')

// 标签页配置
const tabs = [
  { key: 'overview', label: '概览', icon: 'DataAnalysis' },
  { key: 'payments', label: '收费管理', icon: 'CreditCard' },
  { key: 'reports', label: '报表分析', icon: 'Document' },
  { key: 'settings', label: '设置', icon: 'Setting' }
]

// 财务概览数据
const overview = reactive({
  monthlyRevenue: 0,
  revenueGrowth: 0,
  pendingAmount: 0,
  pendingCount: 0,
  collectionRate: 0,
  paidCount: 0,
  totalCount: 0,
  overdueAmount: 0,
  overdueCount: 0
})

// 功能导航 - 修正路径指向实际存在的页面
const functions = [
  {
    key: 'feeConfig',
    title: '收费配置',
    description: '设置收费项目和标准',
    icon: Setting,
    iconName: 'setting',
    path: '/finance/fee-config',
    iconClass: 'primary'
  },
  {
    key: 'paymentManagement',
    title: '缴费管理',
    description: '管理学生缴费记录',
    icon: CreditCard,
    iconName: 'credit-card',
    path: '/finance/payment-management',
    iconClass: 'success'
  },
  {
    key: 'enrollmentFinanceLinkage',
    title: '招生财务联动',
    description: '招生与财务数据同步',
    icon: Document,
    iconName: 'document',
    path: '/finance/enrollment-finance-linkage',
    iconClass: 'info'
  },
  {
    key: 'refundManagement',
    title: '退费管理',
    description: '学生退费申请处理',
    icon: Edit,
    iconName: 'edit',
    path: '/finance/refund-management',
    iconClass: 'warning'
  },
  {
    key: 'collectionReminder',
    title: '催缴管理',
    description: '逾期费用催缴和提醒',
    icon: Bell,
    iconName: 'bell',
    path: '/finance/collection-reminder',
    iconClass: 'danger'
  },
  {
    key: 'financialReports',
    title: '财务报表',
    description: '生成和管理财务报表',
    icon: Document,
    iconName: 'document',
    path: '/finance/financial-reports',
    iconClass: 'primary'
  },
  {
    key: 'invoiceManagement',
    title: '发票管理',
    description: '发票开具和管理',
    icon: Tickets,
    iconName: 'tickets',
    path: '/finance/invoice-management',
    iconClass: 'success'
  },
  {
    key: 'paymentReminderSettings',
    title: '收费提醒设置',
    description: '配置缴费提醒规则',
    icon: Setting,
    iconName: 'setting',
    path: '/finance/payment-reminder-settings',
    iconClass: 'info'
  }
]

// 今日收费记录
const todayPayments = ref([])

// 报表统计数据
const reportStats = reactive({
  totalRevenue: 1250000,
  revenueGrowth: 15.8,
  collectionRate: 92.5,
  collectionGrowth: 3.2,
  pendingAmount: 85000,
  pendingCount: 23,
  overdueAmount: 12000,
  overdueCount: 5
})

// 报表列表
const reportsList = ref([
  {
    id: 1,
    name: '2024年1月财务月报',
    type: 'monthly',
    period: '2024-01',
    createdAt: new Date('2024-01-31')
  },
  {
    id: 2,
    name: '2024年Q1季度报表',
    type: 'quarterly',
    period: '2024-Q1',
    createdAt: new Date('2024-03-31')
  }
])

// 财务设置
const financeSettings = reactive({
  // 收费配置
  defaultPaymentDays: 30,
  overdueReminder: true,
  reminderDays: 3,
  autoGenerateBills: true,
  allowPartialPayment: false,

  // 报表配置
  autoMonthlyReport: true,
  reportEmail: 'finance@kindergarten.com',
  reportRetentionDays: 365,
  exportFormats: ['excel', 'pdf'],

  // 权限配置
  paymentPermission: ['finance', 'principal'],
  refundApproval: 'dual',
  reportViewPermission: ['finance', 'principal'],

  // 通知配置
  paymentNotification: ['sms', 'wechat'],
  overdueNotification: ['sms', 'phone'],
  abnormalNotification: true
})

// 待处理事项
const pendingTasks = ref([
  {
    id: 1,
    title: '5笔逾期缴费提醒',
    description: '有5位学生的缴费已逾期，需要及时处理',
    time: '2小时前',
    priority: 'high'
  },
  {
    id: 2,
    title: '本月财务报表待生成',
    description: '月度财务报表需要在月底前完成',
    time: '1天前',
    priority: 'medium'
  }
])

// 格式化金额
const formatMoney = (amount: number): string => {
  if (amount >= 10000) {
    return (amount / 10000).toFixed(1) + '万'
  }
  return amount.toLocaleString()
}

// 方法
const handleTabChange = (tab: string) => {
  console.log('切换到标签页:', tab)
}

// 处理统计卡片点击
const handleStatClick = (statType: string) => {
  switch (statType) {
    case 'revenue':
      ElMessage.info('查看收入详情')
      activeTab.value = 'reports'
      break
    case 'pending':
      ElMessage.info('查看待收费用详情')
      activeTab.value = 'payments'
      break
    case 'collection':
      ElMessage.info('查看收费完成率详情')
      activeTab.value = 'reports'
      break
    case 'overdue':
      ElMessage.info('查看逾期费用详情')
      activeTab.value = 'payments'
      break
    default:
      ElMessage.info(`查看${statType}详情`)
  }
}

const handleRefresh = async () => {
  await Promise.all([
    loadOverviewData(),
    loadTodayPayments()
  ])
  ElMessage.success('数据刷新成功')
}

const handleQuickPayment = () => {
  router.push('/finance/payment-management')
}

const handleExportReport = () => {
  ElMessage.info('导出报表功能开发中...')
}

const handleFunctionClick = (func: any) => {
  router.push(func.path)
}

// 报表相关方法
const handleRefreshReports = async () => {
  reportsLoading.value = true
  try {
    // TODO: 调用API刷新报表数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('报表数据刷新成功')
  } finally {
    reportsLoading.value = false
  }
}

const getReportTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    monthly: 'primary',
    quarterly: 'success',
    yearly: 'warning',
    custom: 'info'
  }
  return colors[type] || 'default'
}

const getReportTypeName = (type: string) => {
  const names: Record<string, string> = {
    monthly: '月报',
    quarterly: '季报',
    yearly: '年报',
    custom: '自定义'
  }
  return names[type] || type
}

const viewReport = (report: any) => {
  ElMessage.info(`查看报表：${report.name}`)
}

const downloadReport = (report: any) => {
  ElMessage.info(`下载报表：${report.name}`)
}

const deleteReport = async (report: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除报表"${report.name}"吗？`, '确认删除', {
      type: 'warning'
    })
    ElMessage.success('报表删除成功')
  } catch {
    // 用户取消删除
  }
}

// 设置相关方法
const handleSaveSettings = async () => {
  settingsLoading.value = true
  try {
    // TODO: 调用API保存设置
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('设置保存成功')
  } finally {
    settingsLoading.value = false
  }
}

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    initRevenueChart()
    initFeeTypeChart()
  })
}

const initRevenueChart = () => {
  if (!revenueChart.value) return

  const chart = echarts.init(revenueChart.value)
  const option = {
    title: {
      text: '收入趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [120000, 132000, 101000, 134000, 90000, 230000],
      type: 'line',
      smooth: true
    }]
  }
  chart.setOption(option)
}

const initFeeTypeChart = () => {
  if (!feeTypeChart.value) return

  const chart = echarts.init(feeTypeChart.value)
  const option = {
    title: {
      text: '收费类型分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    series: [{
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: '保教费' },
        { value: 735, name: '餐费' },
        { value: 580, name: '校车费' },
        { value: 484, name: '兴趣班费' },
        { value: 300, name: '其他费用' }
      ]
    }]
  }
  chart.setOption(option)
}

const formatTime = (date: Date) => {
  return date.toLocaleDateString()
}

// 加载财务概览数据
const loadOverviewData = async () => {
  try {
    loading.value = true
    console.log('🔄 开始加载财务概览数据...')
    const response = await financeAPI.getOverview()
    console.log('📊 财务概览API响应:', response)
    // 修复：axios响应拦截器已经解包了，response 直接是数据对象
    if (response && typeof response === 'object') {
      console.log('✅ 财务概览数据:', response)
      Object.assign(overview, response)
      console.log('📈 更新后的overview对象:', overview)
    } else {
      console.warn('⚠️ 财务概览API响应格式异常:', response)
    }
  } catch (error) {
    console.error('❌ 加载财务概览数据失败:', error)
    ElMessage.error('加载财务概览数据失败')
  } finally {
    loading.value = false
  }
}

// 加载今日收费记录
const loadTodayPayments = async () => {
  try {
    console.log('🔄 开始加载今日收费记录...')
    const response = await financeAPI.getTodayPayments()
    console.log('📊 今日收费API响应:', response)
    // 修复：axios响应拦截器已经解包了，response 直接是数据对象
    if (response && typeof response === 'object') {
      console.log('✅ 今日收费数据:', response)
      todayPayments.value = response
      console.log('📈 更新后的todayPayments:', todayPayments.value)
    } else {
      console.warn('⚠️ 今日收费API响应格式异常:', response)
    }
  } catch (error) {
    console.error('❌ 加载今日收费记录失败:', error)
    // 今日收费记录失败不显示错误消息，只在控制台记录
  }
}



onMounted(() => {
  console.log('财务中心已加载 - 使用全局CenterContainer样式')
  // 加载初始数据
  loadOverviewData()
  loadTodayPayments()
  // 当切换到报表标签页时初始化图表
  if (activeTab.value === 'reports') {
    initCharts()
  }
})
</script>

<style scoped lang="scss">
.finance-center-timeline {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--text-3xl);
  background: var(--bg-secondary, var(--bg-container));
}

/* .page-header 样式已移至全局 center-common.scss 中统一管理 */

.main-content {
  flex: 1;
  background: var(--bg-color, var(--bg-white));
  border-radius: var(--text-lg);
  padding: var(--text-3xl);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  overflow: hidden;
}

/* 统计卡片区域 */
.finance-stats {
  margin-bottom: var(--spacing-xl);
  width: 100% !important;
  max-width: none !important;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-lg);
    width: 100% !important;
    max-width: none !important;

    @media (max-width: var(--breakpoint-md)) {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }
  }

  .stat-card {
    background: var(--bg-card);
    border: var(--border-width-base) solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    position: relative;
    overflow: hidden;
    transition: all var(--transition-base);
    cursor: pointer;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: var(--spacing-xs);
      transition: transform var(--transition-base);
      transform: scaleX(0);
      transform-origin: left;
    }

    &:hover {
      transform: translateY(var(--transform-hover-lift));
      box-shadow: var(--shadow-lg);
      border-color: var(--border-focus);

      &::before {
        transform: scaleX(1);
      }
    }

    &.primary::before { background: var(--primary-color); }
    &.success::before { background: var(--success-color); }
    &.warning::before { background: var(--warning-color); }
    &.danger::before { background: var(--danger-color); }

    .stat-header {
      display: flex;
      align-items: center;
      margin-bottom: var(--spacing-md);

      .stat-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: var(--spacing-md);
        font-size: var(--text-2xl);
      }

      .stat-label {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        font-weight: var(--font-medium);
      }
    }

    &.primary .stat-icon {
      background: var(--primary-light);
      color: var(--primary-color);
    }

    &.success .stat-icon {
      background: var(--success-light);
      color: var(--success-color);
    }

    &.warning .stat-icon {
      background: var(--warning-light);
      color: var(--warning-color);
    }

    &.danger .stat-icon {
      background: var(--danger-light);
      color: var(--danger-color);
    }

    .stat-content {
      .stat-value {
        font-size: var(--text-2xl);
        font-weight: var(--font-bold, 700);
        color: var(--text-primary);
        margin-bottom: var(--spacing-xs);
      }

      .stat-trend {
        display: flex;
        align-items: center;
        font-size: var(--text-sm);
        gap: var(--spacing-xs);

        &.positive {
          color: var(--success-color);
        }
      }

      .stat-desc {
        font-size: var(--text-sm);
        color: var(--text-muted);
      }
    }
  }
}

/* 快速操作区域 */
.finance-actions {
  width: 100% !important;
  max-width: none !important;

  .section-title {
    margin: 0 0 var(--spacing-lg) 0;
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-lg);
    width: 100% !important;
    max-width: none !important;

    @media (max-width: var(--breakpoint-md)) {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-md);
    }
  }

  /* 使用统一的快捷操作网格布局 */
  .quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--text-3xl);
    margin-bottom: var(--spacing-3xl);
  }

  .center-card-wrapper {
    min-height: 120px;
    display: flex;
    flex-direction: column;
  }

  @media (max-width: var(--breakpoint-md)) {
    .quick-actions-grid {
      grid-template-columns: 1fr;
      gap: var(--text-lg);
    }

    .center-card-wrapper {
      min-height: 100px;
    }
  }
}

/* 其他标签页样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);

  h3 {
    margin: 0;
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
  }
}

.payment-list {
  .payment-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md) 0;
    border-bottom: var(--z-index-dropdown) solid var(--border-color);

    &:last-child {
      border-bottom: none;
    }

    .payment-info {
      flex: 1;

      .student-name {
        font-weight: var(--font-medium);
        color: var(--text-primary);
        margin-bottom: var(--spacing-xs);
      }

      .payment-detail {
        font-size: var(--text-sm);
        color: var(--text-muted);
      }
    }

    .payment-amount {
      font-weight: var(--font-semibold);
      color: var(--success-color);
      font-size: var(--text-lg);
    }
  }
}

/* 响应式设计 - 完整的断点系统 */
@media (max-width: var(--breakpoint-xl)) {
  .finance-overview {
    padding: var(--spacing-lg);
  }

  .finance-stats {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-lg);
    }
  }

  .finance-actions {
    .actions-grid,
    .quick-actions-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-lg);
    }
  }
}

@media (max-width: 992px) {
  .finance-overview {
    padding: var(--spacing-md);
  }

  .finance-welcome {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
    text-align: left;

    .welcome-actions {
      width: 100%;
      justify-content: flex-start;
    }
  }

  .finance-stats {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-md);
    }
  }

  .finance-actions {
    .actions-grid,
    .quick-actions-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }
  }

  .reports-content {
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);

      .header-actions {
        width: 100%;
        justify-content: flex-start;
      }
    }
  }

  .settings-content {
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .finance-overview {
    padding: var(--spacing-md);
  }

  .finance-welcome {
    flex-direction: column;
    gap: var(--spacing-lg);
    text-align: center;
    padding: var(--spacing-lg);

    .welcome-content {
      text-align: center;

      .welcome-title {
        font-size: var(--text-xl);
      }

      .welcome-desc {
        font-size: var(--text-sm);
      }
    }

    .welcome-actions {
      justify-content: center;
      width: 100%;

      .action-btn {
        flex: 1;
      }
    }
  }

  .finance-stats {
    .stats-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }

    .stat-card {
      padding: var(--spacing-md);

      .stat-header {
        .stat-icon {
          width: var(--icon-size); height: var(--icon-size);
          font-size: var(--text-xl);
        }
      }

      .stat-content {
        .stat-value {
          font-size: var(--text-xl);
        }
      }
    }
  }

  .finance-actions {
    .actions-grid,
    .quick-actions-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }

    .center-card-wrapper {
      min-height: 100px;
    }
  }

  .payment-list {
    .payment-item {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-sm);

      .payment-info {
        width: 100%;
      }

      .payment-amount {
        align-self: flex-end;
      }
    }
  }

  .reports-content {
    .section-header {
      .header-actions {
        flex-direction: column;
        gap: var(--spacing-xs);

        .el-button {
          width: 100%;
        }
      }
    }

    .stat-card {
      flex-direction: column;
      text-align: center;
      gap: var(--spacing-sm);

      .stat-icon {
        align-self: center;
      }

      .stat-info {
        text-align: center;
      }
    }
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .finance-overview {
    padding: var(--spacing-sm);
  }

  .finance-welcome {
    padding: var(--spacing-md);

    .welcome-content {
      .welcome-title {
        font-size: var(--text-lg);
      }

      .welcome-desc {
        font-size: var(--text-xs);
      }
    }

    .welcome-actions {
      flex-direction: column;
      gap: var(--spacing-sm);

      .action-btn {
        width: 100%;
      }
    }
  }

  .finance-stats {
    .stats-grid {
      gap: var(--spacing-sm);
    }

    .stat-card {
      padding: var(--spacing-sm);

      .stat-header {
        margin-bottom: var(--spacing-sm);

        .stat-icon {
          width: var(--spacing-3xl);
          height: var(--spacing-3xl);
          font-size: var(--text-lg);
        }

        .stat-label {
          font-size: var(--text-xs);
        }
      }

      .stat-content {
        .stat-value {
          font-size: var(--text-lg);
        }

        .stat-trend,
        .stat-desc {
          font-size: var(--text-xs);
        }
      }
    }
  }

  .finance-actions {
    .actions-grid,
    .quick-actions-grid {
      gap: var(--spacing-sm);
    }

    .center-card-wrapper {
      min-height: 80px;
    }
  }
}

/* 报表页面样式 */
.reports-content {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);

    .header-actions {
      display: flex;
      gap: var(--spacing-sm);
      align-items: center;
    }
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);

    .stat-icon {
      width: var(--icon-size); height: var(--icon-size);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-3xl);
      color: white;

      &.revenue {
        background: linear-gradient(135deg, var(--success-color), var(--success-light));
      }

      &.collection {
        background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      }

      &.pending {
        background: linear-gradient(135deg, var(--warning-color), #EEBE77);
      }

      &.overdue {
        background: linear-gradient(135deg, var(--danger-color), var(--danger-light));
      }
    }

    .stat-info {
      flex: 1;

      h3 {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: var(--text-base);
        color: var(--text-color-secondary);
      }

      .stat-value {
        font-size: var(--text-3xl);
        font-weight: bold;
        color: var(--text-color-primary);
        margin-bottom: var(--spacing-xs);
      }

      .stat-change {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-sm);

        &.positive {
          color: var(--color-success);
        }

        &.negative {
          color: var(--color-danger);
        }
      }

      .stat-desc {
        font-size: var(--text-sm);
        color: var(--text-color-secondary);
      }
    }
  }
}

/* 设置页面样式 */
.settings-content {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }

  .form-help {
    margin-left: var(--spacing-xs);
    color: var(--text-color-secondary);
    font-size: var(--text-sm);
  }
}
</style>