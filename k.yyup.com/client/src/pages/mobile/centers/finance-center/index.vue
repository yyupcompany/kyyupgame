<template>
  <MobileCenterLayout title="财务中心" back-path="/mobile/centers">
    <!-- 快速操作按钮 -->
    <template #header-extra>
      <van-icon name="plus" size="20" @click="handleQuickPayment" />
    </template>

    <div class="mobile-finance-center">
      <!-- 概览标签页 -->
      <van-tabs v-model:active="activeTab" sticky>
        <van-tab title="概览" name="overview">
          <!-- 财务概览统计卡片 -->
          <div class="overview-section">
            <div class="stats-grid">
              <van-card
                v-for="stat in overviewStats"
                :key="stat.key"
                :class="['stat-card', stat.type]"
                @click="handleStatClick(stat.key)"
              >
                <template #title>
                  <div class="stat-title">
                    <van-icon :name="stat.icon" />
                    <span>{{ stat.title }}</span>
                  </div>
                </template>
                <template #desc>
                  <div class="stat-value">¥{{ formatMoney(stat.value) }}</div>
                  <div class="stat-trend" :class="stat.trend">
                    <van-icon :name="stat.trendIcon" />
                    <span>{{ stat.trendText }}</span>
                  </div>
                </template>
              </van-card>
            </div>
          </div>

          <!-- 快速操作 -->
          <div class="quick-actions">
            <van-cell-group title="快速操作">
              <van-cell
                v-for="action in quickActions"
                :key="action.key"
                :title="action.title"
                :label="action.description"
                :icon="action.icon"
                is-link
                @click="handleQuickAction(action)"
              />
            </van-cell-group>
          </div>

          <!-- 待处理事项 -->
          <div class="pending-tasks">
            <van-cell-group title="待处理事项">
              <van-cell
                v-for="task in pendingTasks"
                :key="task.id"
                :title="task.title"
                :label="task.description"
                :value="task.time"
                :class="['task-item', task.priority]"
              >
                <template #right-icon>
                  <van-badge :content="task.priority === 'high' ? '!' : ''" />
                </template>
              </van-cell>
            </van-cell-group>
          </div>
        </van-tab>

        <!-- 收费管理标签页 -->
        <van-tab title="收费管理" name="payments">
          <div class="payments-section">
            <!-- 今日收费记录 -->
            <van-cell-group title="今日收费记录">
              <template v-if="todayPayments.length > 0">
                <van-cell
                  v-for="payment in todayPayments"
                  :key="payment.id"
                  :title="payment.studentName"
                  :label="`${payment.feeType} - ${payment.className}`"
                  :value="`¥${payment.amount}`"
                  value-class="payment-amount"
                />
              </template>
              <van-empty v-else description="暂无今日收费记录" />
            </van-cell-group>

            <!-- 快速操作 -->
            <div class="payment-actions">
              <van-grid :column-num="2" :gutter="12">
                <van-grid-item
                  icon="credit-pay"
                  text="新增收费"
                  @click="handleQuickPayment"
                />
                <van-grid-item
                  icon="records"
                  text="缴费记录"
                  @click="handlePaymentRecords"
                />
                <van-grid-item
                  icon="balance-list-o"
                  text="缴费单管理"
                  @click="handlePaymentBills"
                />
                <van-grid-item
                  icon="bell"
                  text="催缴管理"
                  @click="handleCollectionReminder"
                />
              </van-grid>
            </div>
          </div>
        </van-tab>

        <!-- 报表分析标签页 -->
        <van-tab title="报表分析" name="reports">
          <div class="reports-section">
            <!-- 报表统计卡片 -->
            <div class="report-stats">
              <van-cell-group>
                <van-cell center>
                  <template #title>
                    <span class="report-stat-title">总收入</span>
                  </template>
                  <template #value>
                    <span class="report-stat-value">¥{{ formatMoney(reportStats.totalRevenue) }}</span>
                  </template>
                </van-cell>
                <van-cell center>
                  <template #title>
                    <span class="report-stat-title">收费率</span>
                  </template>
                  <template #value>
                    <span class="report-stat-value">{{ reportStats.collectionRate }}%</span>
                  </template>
                </van-cell>
                <van-cell center>
                  <template #title>
                    <span class="report-stat-title">待收金额</span>
                  </template>
                  <template #value>
                    <span class="report-stat-value">¥{{ formatMoney(reportStats.pendingAmount) }}</span>
                  </template>
                </van-cell>
                <van-cell center>
                  <template #title>
                    <span class="report-stat-title">逾期金额</span>
                  </template>
                  <template #value>
                    <span class="report-stat-value">¥{{ formatMoney(reportStats.overdueAmount) }}</span>
                  </template>
                </van-cell>
              </van-cell-group>
            </div>

            <!-- 图表区域 -->
            <div class="charts-section">
              <van-cell-group title="收入趋势分析">
                <div ref="revenueChart" class="chart-container"></div>
              </van-cell-group>
              <van-cell-group title="收费类型分布">
                <div ref="feeTypeChart" class="chart-container"></div>
              </van-cell-group>
            </div>

            <!-- 报表列表 -->
            <van-cell-group title="报表列表">
              <template v-if="reportsList.length > 0">
                <van-cell
                  v-for="report in reportsList"
                  :key="report.id"
                  :title="report.name"
                  :label="`${getReportTypeName(report.type)} · ${formatTime(report.createdAt)}`"
                  is-link
                  @click="viewReport(report)"
                >
                  <template #right-icon>
                    <div class="report-actions">
                      <van-icon name="eye-o" @click.stop="viewReport(report)" />
                      <van-icon name="down" @click.stop="downloadReport(report)" />
                      <van-icon name="delete-o" @click.stop="deleteReport(report)" />
                    </div>
                  </template>
                </van-cell>
              </template>
              <van-empty v-else description="暂无报表数据" />
            </van-cell-group>
          </div>
        </van-tab>

        <!-- 设置标签页 -->
        <van-tab title="设置" name="settings">
          <div class="settings-section">
            <!-- 收费配置 -->
            <van-cell-group title="收费配置">
              <van-field
                v-model="financeSettings.defaultPaymentDays"
                name="defaultPaymentDays"
                label="默认缴费期限"
                placeholder="请输入天数"
                type="number"
                right-icon="info-o"
                @click-right-icon="showDaysHelp = true"
              />
              <van-cell center title="逾期提醒">
                <template #right-icon>
                  <van-switch v-model="financeSettings.overdueReminder" />
                </template>
              </van-cell>
              <van-field
                v-if="financeSettings.overdueReminder"
                v-model="financeSettings.reminderDays"
                name="reminderDays"
                label="提醒提前天数"
                placeholder="请输入天数"
                type="number"
              />
              <van-cell center title="自动生成缴费单">
                <template #right-icon>
                  <van-switch v-model="financeSettings.autoGenerateBills" />
                </template>
              </van-cell>
              <van-cell center title="允许部分缴费">
                <template #right-icon>
                  <van-switch v-model="financeSettings.allowPartialPayment" />
                </template>
              </van-cell>
            </van-cell-group>

            <!-- 报表配置 -->
            <van-cell-group title="报表配置">
              <van-cell center title="自动生成月报">
                <template #right-icon>
                  <van-switch v-model="financeSettings.autoMonthlyReport" />
                </template>
              </van-cell>
              <van-field
                v-if="financeSettings.autoMonthlyReport"
                v-model="financeSettings.reportEmail"
                name="reportEmail"
                label="报表发送邮箱"
                placeholder="请输入邮箱地址"
                type="email"
              />
              <van-cell
                title="报表保留期限"
                :value="getRetentionDaysText(financeSettings.reportRetentionDays)"
                is-link
                @click="showRetentionPicker = true"
              />
              <van-cell title="导出格式" :value="getExportFormatsText()" is-link @click="showFormatPicker = true" />
            </van-cell-group>

            <!-- 通知配置 -->
            <van-cell-group title="通知配置">
              <van-cell title="缴费成功通知" is-link @click="showPaymentNotificationPicker = true" />
              <van-cell title="逾期提醒通知" is-link @click="showOverdueNotificationPicker = true" />
              <van-cell center title="财务异常通知">
                <template #right-icon>
                  <van-switch v-model="financeSettings.abnormalNotification" />
                </template>
              </van-cell>
            </van-cell-group>

            <!-- 保存按钮 -->
            <div class="settings-actions">
              <van-button
                type="primary"
                block
                :loading="settingsLoading"
                @click="handleSaveSettings"
              >
                保存设置
              </van-button>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 时间范围选择器 -->
    <van-popup v-model:show="showTimeRangePicker" position="bottom">
      <van-picker
        :columns="timeRangeOptions"
        @confirm="handleTimeRangeConfirm"
        @cancel="showTimeRangePicker = false"
      />
    </van-popup>

    <!-- 报表保留期限选择器 -->
    <van-popup v-model:show="showRetentionPicker" position="bottom">
      <van-picker
        :columns="retentionOptions"
        @confirm="handleRetentionConfirm"
        @cancel="showRetentionPicker = false"
      />
    </van-popup>

    <!-- 导出格式选择器 -->
    <van-popup v-model:show="showFormatPicker" position="bottom">
      <van-checkbox-group v-model="financeSettings.exportFormats">
        <van-cell-group>
          <van-cell
            v-for="option in formatOptions"
            :key="option.value"
            :title="option.text"
            clickable
            @click="toggleFormat(option.value)"
          >
            <template #right-icon>
              <van-checkbox :name="option.value" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-checkbox-group>
    </van-popup>

    <!-- 帮助说明弹窗 -->
    <van-dialog v-model:show="showDaysHelp" title="帮助说明">
      <div class="help-content">
        <p>默认缴费期限是指从生成缴费单到缴费截止日期的天数，系统会自动根据此设置计算缴费截止日期。</p>
      </div>
    </van-dialog>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast, showConfirmDialog } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'
import financeAPI, { type FinanceOverview, type PaymentRecord } from '@/api/modules/finance'
import * as echarts from 'echarts'

const router = useRouter()
const activeTab = ref('overview')
const loading = ref(false)
const settingsLoading = ref(false)

// 弹窗显示控制
const showTimeRangePicker = ref(false)
const showRetentionPicker = ref(false)
const showFormatPicker = ref(false)
const showDaysHelp = ref(false)

// 图表引用
const revenueChart = ref()
const feeTypeChart = ref()

// 时间范围选项
const timeRangeOptions = [
  { text: '本月', value: 'month' },
  { text: '本季度', value: 'quarter' },
  { text: '本年', value: 'year' },
  { text: '自定义', value: 'custom' }
]

// 保留期限选项
const retentionOptions = [
  { text: '30天', value: 30 },
  { text: '90天', value: 90 },
  { text: '180天', value: 180 },
  { text: '365天', value: 365 },
  { text: '永久保留', value: 0 }
]

// 导出格式选项
const formatOptions = [
  { text: 'Excel', value: 'excel' },
  { text: 'PDF', value: 'pdf' },
  { text: 'CSV', value: 'csv' }
]

// 财务概览数据
const overviewData = reactive<FinanceOverview>({
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

// 概览统计卡片数据
const overviewStats = computed(() => [
  {
    key: 'revenue',
    title: '本月收入',
    value: overviewData.monthlyRevenue,
    trend: 'up',
    trendText: `较上月 +${overviewData.revenueGrowth}%`,
    type: 'primary',
    icon: 'trend-charts',
    trendIcon: 'arrow-up'
  },
  {
    key: 'pending',
    title: '待收费用',
    value: overviewData.pendingAmount,
    trend: 'stable',
    trendText: `${overviewData.pendingCount}位学生`,
    type: 'warning',
    icon: 'clock',
    trendIcon: 'minus'
  },
  {
    key: 'collection',
    title: '收费完成率',
    value: overviewData.collectionRate,
    trend: 'up',
    trendText: `${overviewData.paidCount}/${overviewData.totalCount}位学生`,
    type: 'success',
    icon: 'success-filled',
    trendIcon: 'arrow-up'
  },
  {
    key: 'overdue',
    title: '逾期费用',
    value: overviewData.overdueAmount,
    trend: 'down',
    trendText: `${overviewData.overdueCount}笔`,
    type: 'danger',
    icon: 'warning-filled',
    trendIcon: 'arrow-down'
  }
])

// 快速操作数据
const quickActions = ref([
  {
    key: 'feeConfig',
    title: '收费配置',
    description: '设置收费项目和标准',
    icon: 'setting-o',
    path: '/mobile/finance/fee-config'
  },
  {
    key: 'paymentManagement',
    title: '缴费管理',
    description: '管理学生缴费记录',
    icon: 'credit-pay',
    path: '/mobile/finance/payment-management'
  },
  {
    key: 'refundManagement',
    title: '退费管理',
    description: '学生退费申请处理',
    icon: 'revoke',
    path: '/mobile/finance/refund-management'
  },
  {
    key: 'invoiceManagement',
    title: '发票管理',
    description: '发票开具和管理',
    icon: 'orders-o',
    path: '/mobile/finance/invoice-management'
  }
])

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

// 今日收费记录
const todayPayments = ref<PaymentRecord[]>([])

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
  defaultPaymentDays: 30,
  overdueReminder: true,
  reminderDays: 3,
  autoGenerateBills: true,
  allowPartialPayment: false,
  autoMonthlyReport: true,
  reportEmail: 'finance@kindergarten.com',
  reportRetentionDays: 365,
  exportFormats: ['excel', 'pdf'],
  paymentNotification: ['sms', 'wechat'],
  overdueNotification: ['sms', 'phone'],
  abnormalNotification: true
})

// 格式化金额
const formatMoney = (amount: number): string => {
  if (amount >= 10000) {
    return (amount / 10000).toFixed(1) + '万'
  }
  return amount.toLocaleString()
}

// 格式化时间
const formatTime = (date: Date): string => {
  return date.toLocaleDateString()
}

// 获取报表类型名称
const getReportTypeName = (type: string): string => {
  const names: Record<string, string> = {
    monthly: '月报',
    quarterly: '季报',
    yearly: '年报',
    custom: '自定义'
  }
  return names[type] || type
}

// 获取保留期限文本
const getRetentionDaysText = (days: number): string => {
  if (days === 0) return '永久保留'
  return `${days}天`
}

// 获取导出格式文本
const getExportFormatsText = (): string => {
  const texts: Record<string, string> = {
    excel: 'Excel',
    pdf: 'PDF',
    csv: 'CSV'
  }
  return financeSettings.exportFormats.map(format => texts[format]).join(', ')
}

// 切换导出格式
const toggleFormat = (value: string) => {
  const index = financeSettings.exportFormats.indexOf(value)
  if (index > -1) {
    financeSettings.exportFormats.splice(index, 1)
  } else {
    financeSettings.exportFormats.push(value)
  }
}

// 处理标签页切换
const handleTabChange = (name: string) => {
  activeTab.value = name
  if (name === 'reports') {
    nextTick(() => {
      initCharts()
    })
  }
}

// 处理统计卡片点击
const handleStatClick = (statType: string) => {
  switch (statType) {
    case 'revenue':
      activeTab.value = 'reports'
      break
    case 'pending':
    case 'overdue':
      activeTab.value = 'payments'
      break
    case 'collection':
      activeTab.value = 'reports'
      break
  }
}

// 处理快速操作
const handleQuickAction = (action: any) => {
  router.push(action.path)
}

// 快速收费
const handleQuickPayment = () => {
  router.push('/mobile/finance/payment-management')
}

// 处理缴费记录
const handlePaymentRecords = () => {
  router.push('/mobile/finance/payment-records')
}

// 处理缴费单管理
const handlePaymentBills = () => {
  router.push('/mobile/finance/payment-bills')
}

// 处理催缴管理
const handleCollectionReminder = () => {
  router.push('/mobile/finance/collection-reminder')
}

// 查看报表
const viewReport = (report: any) => {
  showSuccessToast(`查看报表：${report.name}`)
}

// 下载报表
const downloadReport = (report: any) => {
  showSuccessToast(`下载报表：${report.name}`)
}

// 删除报表
const deleteReport = async (report: any) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除报表"${report.name}"吗？`,
    })
    showSuccessToast('报表删除成功')
  } catch {
    // 用户取消删除
  }
}

// 处理时间范围确认
const handleTimeRangeConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  showTimeRangePicker.value = false
  console.log('选择的时间范围:', selectedValues[0])
}

// 处理保留期限确认
const handleRetentionConfirm = ({ selectedValues }: { selectedValues: number[] }) => {
  financeSettings.reportRetentionDays = selectedValues[0]
  showRetentionPicker.value = false
}

// 保存设置
const handleSaveSettings = async () => {
  settingsLoading.value = true
  try {
    // TODO: 调用API保存设置
    await new Promise(resolve => setTimeout(resolve, 1000))
    showSuccessToast('设置保存成功')
  } catch (error) {
    showFailToast('设置保存失败')
  } finally {
    settingsLoading.value = false
  }
}

// 初始化图表
const initCharts = () => {
  initRevenueChart()
  initFeeTypeChart()
}

const initRevenueChart = () => {
  if (!revenueChart.value) return

  const chart = echarts.init(revenueChart.value)
  const option = {
    title: {
      text: '收入趋势',
      left: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 12
      }
    },
    series: [{
      data: [120000, 132000, 101000, 134000, 90000, 230000],
      type: 'line',
      smooth: true,
      lineStyle: {
        width: 3
      }
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
      left: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [{
      type: 'pie',
      radius: '60%',
      data: [
        { value: 1048, name: '保教费' },
        { value: 735, name: '餐费' },
        { value: 580, name: '校车费' },
        { value: 484, name: '兴趣班费' },
        { value: 300, name: '其他费用' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  chart.setOption(option)
}

// 加载财务概览数据
const loadOverviewData = async () => {
  try {
    loading.value = true
    console.log('🔄 开始加载财务概览数据...')
    const response = await financeAPI.getOverview()
    console.log('📊 财务概览API响应:', response)
    if (response && typeof response === 'object') {
      console.log('✅ 财务概览数据:', response)
      Object.assign(overviewData, response)
      console.log('📈 更新后的overview对象:', overviewData)
    } else {
      console.warn('⚠️ 财务概览API响应格式异常:', response)
    }
  } catch (error) {
    console.error('❌ 加载财务概览数据失败:', error)
    showFailToast('加载财务概览数据失败')
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
    if (response && typeof response === 'object') {
      console.log('✅ 今日收费数据:', response)
      todayPayments.value = response
      console.log('📈 更新后的todayPayments:', todayPayments.value)
    } else {
      console.warn('⚠️ 今日收费API响应格式异常:', response)
    }
  } catch (error) {
    console.error('❌ 加载今日收费记录失败:', error)
  }
}

onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  console.log('移动端财务中心已加载')
  loadOverviewData()
  loadTodayPayments()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.mobile-finance-center {
  min-height: 100vh;
  background: var(--van-background-color-light);
  padding-bottom: var(--van-tabbar-height);

  .overview-section {
    padding: var(--van-padding-md);

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--van-padding-sm);

      .stat-card {
        border-radius: var(--van-border-radius-lg);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 0;

        &.primary {
          background: linear-gradient(135deg, var(--van-primary-color), var(--van-primary-color-light));
          color: white;
        }

        &.success {
          background: linear-gradient(135deg, var(--van-success-color), var(--van-success-color-light));
          color: white;
        }

        &.warning {
          background: linear-gradient(135deg, var(--van-warning-color), var(--van-warning-color-light));
          color: white;
        }

        &.danger {
          background: linear-gradient(135deg, var(--van-danger-color), var(--van-danger-color-light));
          color: white;
        }

        .stat-title {
          display: flex;
          align-items: center;
          gap: var(--van-padding-xs);
          font-size: var(--van-font-size-md);
          font-weight: var(--van-font-bold);
          margin-bottom: var(--van-padding-xs);
        }

        .stat-value {
          font-size: var(--van-font-size-xl);
          font-weight: var(--van-font-bold);
          margin-bottom: var(--van-padding-xs);
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: var(--van-padding-xs);
          font-size: var(--van-font-size-sm);

          &.up {
            color: var(--van-success-color);
          }

          &.down {
            color: var(--van-danger-color);
          }

          &.stable {
            color: var(--van-text-color-3);
          }
        }
      }
    }
  }

  .quick-actions {
    margin: var(--van-padding-md) 0;
  }

  .pending-tasks {
    margin: var(--van-padding-md) 0;

    .task-item {
      &.high {
        border-left: 4px solid var(--van-danger-color);
      }

      &.medium {
        border-left: 4px solid var(--van-warning-color);
      }
    }
  }

  .payments-section {
    padding: var(--van-padding-md);

    .payment-actions {
      margin-top: var(--van-padding-lg);
    }

    .payment-amount {
      color: var(--van-success-color);
      font-weight: var(--van-font-bold);
    }
  }

  .reports-section {
    padding: var(--van-padding-md);

    .report-stats {
      margin-bottom: var(--van-padding-lg);

      .report-stat-title {
        font-size: var(--van-font-size-md);
        color: var(--van-text-color-2);
      }

      .report-stat-value {
        font-size: var(--van-font-size-lg);
        font-weight: var(--van-font-bold);
        color: var(--van-text-color-1);
      }
    }

    .charts-section {
      margin-bottom: var(--van-padding-lg);

      .chart-container {
        width: 100%;
        height: 200px;
        padding: var(--van-padding-sm);
      }
    }

    .report-actions {
      display: flex;
      gap: var(--van-padding-sm);

      .van-icon {
        font-size: var(--text-lg);
        color: var(--van-text-color-2);
        cursor: pointer;

        &:hover {
          color: var(--van-primary-color);
        }
      }
    }
  }

  .settings-section {
    padding: var(--van-padding-md);

    .settings-actions {
      margin-top: var(--van-padding-lg);
      padding: 0 var(--vanpadding-md);
    }
  }

  .help-content {
    padding: var(--van-padding-md);
    font-size: var(--van-font-size-md);
    line-height: 1.6;
    color: var(--van-text-color-1);
  }
}

// 响应式设计
@media (max-width: 375px) {
  .mobile-finance-center {
    .overview-section {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}

// 深色模式适配
@media (prefers-color-scheme: dark) {
  .mobile-finance-center {
    background: var(--van-background-color-light);
  }
}
</style>