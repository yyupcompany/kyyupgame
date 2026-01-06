<template>
  <MobileMainLayout
    title="AI用量与计费中心"
    :show-back="true"
  >
    <!-- 头部操作区域 -->
    <template #header-extra>
      <van-icon name="replay" size="20" @click="handleRefresh" />
      <van-icon name="down" size="20" @click="handleExportBill" style="margin-left: 12px;" />
    </template>

    <div class="ai-billing-mobile">
      <!-- 周期选择器 -->
      <div class="period-selector">
        <van-tabs v-model:active="periodIndex" @change="onPeriodChange">
          <van-tab v-for="(option, index) in periodOptions" :key="option.value" :title="option.label" />
        </van-tabs>
      </div>

      <!-- 统计卡片区域 -->
      <div class="stats-section" v-loading="loading">
        <van-grid :column-num="2" :border="false" :gutter="12">
          <van-grid-item>
            <div class="stat-card primary" @click="navigateToDetail('cost')">
              <div class="stat-icon">
                <van-icon name="balance-o" size="24" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ formatCurrency(billingStats.totalCost) }}</div>
                <div class="stat-label">总费用</div>
                <div class="stat-trend">本期费用</div>
              </div>
            </div>
          </van-grid-item>

          <van-grid-item>
            <div class="stat-card success" @click="navigateToDetail('calls')">
              <div class="stat-icon">
                <van-icon name="chart-trending-o" size="24" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ formatNumber(billingStats.totalRecords) }}</div>
                <div class="stat-label">总调用次数</div>
                <div class="stat-trend">总请求数</div>
              </div>
            </div>
          </van-grid-item>

          <van-grid-item>
            <div class="stat-card info" @click="navigateToDetail('tokens')">
              <div class="stat-icon">
                <van-icon name="cpu" size="24" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ formatNumber(getTokenUsage()) }}</div>
                <div class="stat-label">Token使用量</div>
                <div class="stat-trend">文本模型Token</div>
              </div>
            </div>
          </van-grid-item>

          <van-grid-item>
            <div class="stat-card warning" @click="navigateToDetail('video')">
              <div class="stat-icon">
                <van-icon name="video-o" size="24" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ formatDuration(getVideoDuration()) }}</div>
                <div class="stat-label">视频总时长</div>
                <div class="stat-trend">视频生成时长</div>
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 趋势图表 -->
      <van-card class="trend-chart-card">
        <template #title>
          <div class="card-title">
            <span>费用趋势</span>
            <van-radio-group v-model="trendPeriod" direction="horizontal" @change="loadTrendData">
              <van-radio name="monthly">月度</van-radio>
              <van-radio name="weekly">周度</van-radio>
              <van-radio name="daily">日度</van-radio>
            </van-radio-group>
          </div>
        </template>
        <div class="trend-chart-container">
          <div ref="trendChartRef" class="trend-chart"></div>
        </div>
      </van-card>

      <!-- 按类型分组统计 -->
      <van-card class="type-breakdown-card">
        <template #title>
          <span>计费类型分布</span>
        </template>
        <div class="type-breakdown-list">
          <div
            v-for="(data, type) in billingStats.byType"
            :key="type"
            class="type-item"
            :class="getTypeClass(type as BillingType)"
          >
            <div class="type-icon">
              <van-icon :name="getTypeIcon(type as BillingType)" size="20" />
            </div>
            <div class="type-content">
              <h4>{{ formatBillingType(type as BillingType) }}</h4>
              <div class="type-stats">
                <div class="stat-row">
                  <span class="label">调用次数:</span>
                  <span class="value">{{ formatNumber(data.count) }}</span>
                </div>
                <div class="stat-row">
                  <span class="label">计量数量:</span>
                  <span class="value">{{ formatNumber(data.quantity) }}</span>
                </div>
                <div class="stat-row">
                  <span class="label">费用:</span>
                  <span class="value primary">{{ formatCurrency(data.cost) }}</span>
                </div>
              </div>
            </div>
            <div class="type-chart">
              <van-circle
                :current-rate="calculatePercentage(data.cost, billingStats.totalCost)"
                :rate="calculatePercentage(data.cost, billingStats.totalCost)"
                :speed="100"
                :size="60"
                :stroke-width="4"
                layer-color="#ebedf0"
                :color="getChartColor(type as BillingType)"
              />
            </div>
          </div>
        </div>
      </van-card>

      <!-- 账单明细表格 -->
      <van-card class="bill-details-card">
        <template #title>
          <div class="card-title">
            <span>账单明细</span>
            <van-icon name="search" size="18" @click="showSearchBar = !showSearchBar" />
          </div>
        </template>

        <!-- 搜索栏 -->
        <van-search
          v-if="showSearchBar"
          v-model="searchKeyword"
          placeholder="搜索模型名称"
          @search="handleSearch"
          @clear="handleSearch"
          style="margin-bottom: 12px;"
        />

        <van-list
          v-model:loading="tableLoading"
          :finished="listFinished"
          finished-text="没有更多了"
          @load="loadMoreRecords"
        >
          <div
            v-for="record in paginatedRecords"
            :key="record.id"
            class="bill-record-item"
            @click="viewDetail(record)"
          >
            <div class="record-header">
              <div class="model-info">
                <van-tag type="primary" size="small">{{ record.modelConfig?.name || '未知' }}</van-tag>
                <van-tag :type="getTypeTagColor(record.billingType)" size="small">
                  {{ formatBillingType(record.billingType) }}
                </van-tag>
              </div>
              <div class="record-time">{{ formatDateTime(record.createdAt) }}</div>
            </div>

            <div class="record-body">
              <div class="record-stats">
                <div class="stat-item">
                  <span class="label">计量:</span>
                  <span class="value">{{ formatNumber(record.quantity) }} {{ record.unit }}</span>
                </div>
                <div class="stat-item cost">
                  <span class="label">费用:</span>
                  <span class="value">{{ formatCurrency(record.totalCost) }}</span>
                </div>
              </div>

              <div class="record-detail">
                <template v-if="record.billingType === 'token'">
                  输入: {{ formatNumber(record.inputTokens) }} | 输出: {{ formatNumber(record.outputTokens) }}
                </template>
                <template v-else-if="record.billingType === 'second'">
                  时长: {{ record.durationSeconds }}秒
                </template>
                <template v-else-if="record.billingType === 'count'">
                  数量: {{ record.imageCount }}
                </template>
                <template v-else-if="record.billingType === 'character'">
                  字符: {{ formatNumber(record.characterCount) }}
                </template>
              </div>
            </div>

            <div class="record-footer">
              <van-tag :type="getBillingStatusColor(record.billingStatus)" size="small">
                {{ formatBillingStatus(record.billingStatus) }}
              </van-tag>
              <van-icon name="arrow" size="16" />
            </div>
          </div>
        </van-list>

        <!-- 分页 -->
        <van-pagination
          v-model="currentPage"
          :page-count="totalPages"
          :total-items="totalRecords"
          :items-per-page="pageSize"
          @change="handlePageChange"
          style="margin-top: 16px;"
        />
      </van-card>

      <!-- 详情弹窗 -->
      <van-popup
        v-model:show="detailDialogVisible"
        position="bottom"
        :style="{ height: '80%' }"
        round
      >
        <div class="detail-popup">
          <div class="popup-header">
            <span>计费详情</span>
            <van-icon name="cross" @click="detailDialogVisible = false" />
          </div>

          <div v-if="selectedRecord" class="detail-content">
            <van-cell-group>
              <van-cell title="记录ID" :value="selectedRecord.id.toString()" />
              <van-cell title="用户ID" :value="selectedRecord.userId.toString()" />
              <van-cell title="模型" :value="selectedRecord.modelConfig?.name || '未知'" />
              <van-cell title="计费类型">
                <template #value>
                  <van-tag :type="getTypeTagColor(selectedRecord.billingType)">
                    {{ formatBillingType(selectedRecord.billingType) }}
                  </van-tag>
                </template>
              </van-cell>
              <van-cell title="计量数量" :value="`${formatNumber(selectedRecord.quantity)} ${selectedRecord.unit}`" />
              <van-cell title="总费用">
                <template #value>
                  <span class="cost-value">{{ formatCurrency(selectedRecord.totalCost) }}</span>
                </template>
              </van-cell>
              <van-cell title="状态">
                <template #value>
                  <van-tag :type="getBillingStatusColor(selectedRecord.billingStatus)">
                    {{ formatBillingStatus(selectedRecord.billingStatus) }}
                  </van-tag>
                </template>
              </van-cell>
              <van-cell title="货币" :value="selectedRecord.currency" />
              <van-cell title="计费周期" :value="selectedRecord.billingCycle" />
              <van-cell title="创建时间" :value="formatDateTime(selectedRecord.createdAt)" />

              <!-- 根据类型显示详细信息 -->
              <template v-if="selectedRecord.billingType === 'token'">
                <van-cell title="输入Token" :value="formatNumber(selectedRecord.inputTokens)" />
                <van-cell title="输出Token" :value="formatNumber(selectedRecord.outputTokens)" />
                <van-cell title="输入单价" :value="selectedRecord.inputPrice.toString()" />
                <van-cell title="输出单价" :value="selectedRecord.outputPrice.toString()" />
              </template>

              <template v-else-if="selectedRecord.billingType === 'second'">
                <van-cell title="时长(秒)" :value="selectedRecord.durationSeconds?.toString()" />
                <van-cell title="单价(每秒)" :value="selectedRecord.unitPrice.toString()" />
              </template>

              <template v-else-if="selectedRecord.billingType === 'count'">
                <van-cell title="图片数量" :value="selectedRecord.imageCount?.toString()" />
                <van-cell title="单价(每张)" :value="selectedRecord.unitPrice.toString()" />
              </template>

              <template v-else-if="selectedRecord.billingType === 'character'">
                <van-cell title="字符数" :value="formatNumber(selectedRecord.characterCount)" />
                <van-cell title="单价(每字符)" :value="selectedRecord.unitPrice.toString()" />
              </template>
            </van-cell-group>
          </div>
        </div>
      </van-popup>

      <!-- 导出账单弹窗 -->
      <van-action-sheet
        v-model:show="exportSheetVisible"
        :actions="exportActions"
        cancel-text="取消"
        close-on-click-action
        @select="handleExportAction"
      />
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'

import {
  getMyBill,
  getBillingStatistics,
  getMyBillingTrend,
  exportBillCSV,
  formatBillingType,
  formatBillingStatus,
  getBillingStatusColor,
  type BillingRecord,
  type BillingStatistics as IBillingStatistics,
  type BillingType,
  type BillingStatus,
  type UserBill,
} from '@/api/endpoints/ai-billing'

// ==================== 响应式数据 ====================
const loading = ref(false)
const tableLoading = ref(false)
const detailDialogVisible = ref(false)
const exportSheetVisible = ref(false)
const showSearchBar = ref(false)
const selectedRecord = ref<BillingRecord | null>(null)
const listFinished = ref(false)

// 周期选择
const selectedPeriod = ref<'monthly' | 'quarterly' | 'yearly'>('monthly')
const periodOptions = [
  { label: '月度', value: 'monthly' },
  { label: '季度', value: 'quarterly' },
  { label: '年度', value: 'yearly' },
]
const periodIndex = ref(periodOptions.findIndex(option => option.value === selectedPeriod.value))

// 趋势图
const trendChartRef = ref<HTMLElement>()
const trendChart = ref<echarts.ECharts>()
const trendPeriod = ref<'daily' | 'weekly' | 'monthly'>('monthly')

// 计费统计
const billingStats = ref<IBillingStatistics>({
  totalRecords: 0,
  totalCost: 0,
  byType: {},
  byStatus: {},
})

// 账单数据
const currentBill = ref<UserBill | null>(null)
const billRecords = ref<BillingRecord[]>([])

// 表格搜索和分页
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = computed(() => billRecords.value.length)
const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize.value))

// 导出操作
const exportActions = [
  { name: '导出CSV', value: 'csv' },
  { name: '导出Excel', value: 'excel' },
]

// 过滤后的账单记录
const filteredBillRecords = computed(() => {
  let records = billRecords.value

  // 搜索过滤
  if (searchKeyword.value) {
    records = records.filter(record =>
      record.modelConfig?.name?.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  return records
})

// 分页后的记录
const paginatedRecords = computed(() => {
  const records = filteredBillRecords.value
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return records.slice(start, end)
})

// ==================== 格式化函数 ====================
function formatNumber(num: number | undefined): string {
  if (num === undefined) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toLocaleString()
}

function formatCurrency(amount: number | undefined): string {
  if (amount === undefined) return '$0.00'
  return `$${amount.toFixed(4)}`
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}分钟`
  } else {
    return `${(seconds / 3600).toFixed(1)}小时`
  }
}

function formatDateTime(dateStr: string | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// ==================== 类型相关 ====================
function getTypeIcon(type: BillingType): string {
  const icons = {
    token: 'cpu',
    second: 'video',
    count: 'photo',
    character: 'description',
  }
  return icons[type] || 'info'
}

function getTypeClass(type: BillingType): string {
  return `type-${type}`
}

function getTypeTagColor(type: BillingType): string {
  const colors = {
    token: 'primary',
    second: 'warning',
    count: 'success',
    character: 'info',
  }
  return colors[type] || 'info'
}

function getChartColor(type: BillingType): string {
  const colors = {
    token: '#409EFF',
    second: '#E6A23C',
    count: '#67C23A',
    character: '#909399',
  }
  return colors[type] || '#909399'
}

function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// ==================== 数据获取 ====================
function getTokenUsage(): number {
  const tokenData = billingStats.value.byType?.token
  return tokenData ? tokenData.quantity : 0
}

function getVideoDuration(): number {
  const videoData = billingStats.value.byType?.second
  return videoData ? videoData.quantity : 0
}

// 获取当前周期
function getCurrentCycle(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  if (selectedPeriod.value === 'monthly') {
    return `${year}-${String(month).padStart(2, '0')}`
  } else if (selectedPeriod.value === 'quarterly') {
    const quarter = Math.ceil(month / 3)
    return `${year}-Q${quarter}`
  } else {
    return `${year}`
  }
}

// 加载统计数据
async function loadStatistics() {
  try {
    loading.value = true

    const { data } = await getBillingStatistics({
      period: selectedPeriod.value,
    })

    if (data) {
      billingStats.value = data
    }
  } catch (error: any) {
    console.error('加载统计数据失败:', error)
    showToast(error.message || '加载统计数据失败')
  } finally {
    loading.value = false
  }
}

// 加载账单数据
async function loadBillData() {
  try {
    tableLoading.value = true

    const cycle = getCurrentCycle()
    const { data } = await getMyBill(cycle)

    if (data) {
      currentBill.value = data
      billRecords.value = data.records || []
      listFinished.value = true
    }
  } catch (error: any) {
    console.error('加载账单数据失败:', error)
    showToast(error.message || '加载账单数据失败')
  } finally {
    tableLoading.value = false
  }
}

// 加载趋势数据
async function loadTrendData() {
  try {
    const months = trendPeriod.value === 'monthly' ? 12 : trendPeriod.value === 'weekly' ? 12 : 30
    const { data } = await getMyBillingTrend(trendPeriod.value, months)

    if (data) {
      renderTrendChart(data.data)
    }
  } catch (error: any) {
    console.error('加载趋势数据失败:', error)
  }
}

// 渲染趋势图表
function renderTrendChart(trendData: Array<{ date: string; totalCost: number; totalCalls: number }>) {
  if (!trendChartRef.value) return

  if (!trendChart.value) {
    trendChart.value = echarts.init(trendChartRef.value)
  }

  const dates = trendData.map(d => d.date)
  const costs = trendData.map(d => d.totalCost)
  const calls = trendData.map(d => d.totalCalls)

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['费用', '调用次数'],
      textStyle: {
        fontSize: 12,
      },
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '20%',
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        fontSize: 10,
        rotate: 45,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '费用 ($)',
        position: 'left',
        nameTextStyle: {
          fontSize: 12,
        },
        axisLabel: {
          fontSize: 10,
        },
      },
      {
        type: 'value',
        name: '调用次数',
        position: 'right',
        nameTextStyle: {
          fontSize: 12,
        },
        axisLabel: {
          fontSize: 10,
        },
      },
    ],
    series: [
      {
        name: '费用',
        type: 'line',
        data: costs,
        smooth: true,
        yAxisIndex: 0,
        itemStyle: {
          color: '#409EFF',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' },
          ]),
        },
      },
      {
        name: '调用次数',
        type: 'bar',
        data: calls,
        yAxisIndex: 1,
        itemStyle: {
          color: '#67C23A',
        },
      },
    ],
  }

  trendChart.value.setOption(option)

  // 响应式调整
  window.addEventListener('resize', () => {
    trendChart.value?.resize()
  })
}

// ==================== 事件处理 ====================
function handleRefresh() {
  loadStatistics()
  loadBillData()
  loadTrendData()
}

async function handleExportBill() {
  exportSheetVisible.value = true
}

async function handleExportAction(action: any) {
  if (action.value === 'csv') {
    await handleExportCSV()
  } else if (action.value === 'excel') {
    showToast('Excel导出功能开发中')
  }
}

async function handleExportCSV() {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const userId = userInfo.id

    if (!userId) {
      showToast('用户未登录')
      return
    }

    const cycle = getCurrentCycle()
    const blob = await exportBillCSV(userId, cycle)

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bill_${userId}_${cycle}.csv`
    link.click()
    window.URL.revokeObjectURL(url)

    showToast('账单导出成功')
  } catch (error: any) {
    console.error('导出账单失败:', error)
    showToast(error.message || '导出账单失败')
  }
}

function onPeriodChange(index: number) {
  periodIndex.value = index
  selectedPeriod.value = periodOptions[index].value as 'monthly' | 'quarterly' | 'yearly'
  handleRefresh()
}

function handleSearch() {
  currentPage.value = 1
}

function handlePageChange(page: number) {
  currentPage.value = page
}

function loadMoreRecords() {
  if (listFinished.value) return
  loadBillData()
}

function viewDetail(record: BillingRecord) {
  selectedRecord.value = record
  detailDialogVisible.value = true
}

function navigateToDetail(type: string) {
  showToast(`查看${type}详情`)
}

// ==================== 监听器 ====================
watch(selectedPeriod, () => {
  handleRefresh()
})

// ==================== 生命周期 ====================
onMounted(() => {
  handleRefresh()
})
</script>

<style lang="scss" scoped>
@use '@/styles/design-tokens.scss' as *;
@import '@/styles/mobile-base.scss';

.ai-billing-mobile {
  min-height: 100vh;
  background: var(--van-background-color-light);
  padding: var(--spacing-md) var(--spacing-md) calc(var(--spacing-md) + 60px) var(--spacing-md);

  .period-selector {
    margin-bottom: var(--spacing-lg);
  }

  // 统计卡片区域
  .stats-section {
    margin-bottom: var(--spacing-2xl);

    .stat-card {
      display: flex;
      align-items: center;
      padding: var(--spacing-lg);
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s;
      cursor: pointer;
      height: 100%;

      &:active {
        transform: scale(0.98);
      }

      &.primary {
        border-left: 4px solid var(--color-primary);
        .stat-icon { color: var(--color-primary); }
      }

      &.success {
        border-left: 4px solid var(--color-success);
        .stat-icon { color: var(--color-success); }
      }

      &.info {
        border-left: 4px solid var(--color-info);
        .stat-icon { color: var(--color-info); }
      }

      &.warning {
        border-left: 4px solid var(--color-warning);
        .stat-icon { color: var(--color-warning); }
      }

      .stat-icon {
        margin-right: var(--spacing-md);
        flex-shrink: 0;
      }

      .stat-content {
        flex: 1;
        text-align: left;

        .stat-value {
          font-size: var(--text-xl);
          font-weight: bold;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-bottom: 2px;
        }

        .stat-trend {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
        }
      }
    }
  }

  // 趋势图表
  .trend-chart-card {
    margin-bottom: var(--spacing-2xl);
    border-radius: var(--border-radius-lg);
    overflow: hidden;

    .card-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: var(--text-lg);
      font-weight: 600;

      .van-radio-group {
        .van-radio {
          margin-right: var(--spacing-sm);

          :deep(.van-radio__label) {
            font-size: var(--text-sm);
          }
        }
      }
    }

    .trend-chart-container {
      padding: var(--spacing-md) 0;

      .trend-chart {
        height: 300px;
        width: 100%;
      }
    }
  }

  // 计费类型分布
  .type-breakdown-card {
    margin-bottom: var(--spacing-2xl);
    border-radius: var(--border-radius-lg);
    overflow: hidden;

    .type-breakdown-list {
      .type-item {
        display: flex;
        align-items: center;
        padding: var(--spacing-lg);
        margin-bottom: var(--spacing-md);
        background: var(--van-background-color);
        border-radius: var(--border-radius-md);
        border-left: 4px solid var(--color-primary);
        transition: all 0.3s;

        &.type-token {
          border-left-color: var(--color-primary);
        }

        &.type-second {
          border-left-color: var(--color-warning);
        }

        &.type-count {
          border-left-color: var(--color-success);
        }

        &.type-character {
          border-left-color: var(--color-info);
        }

        .type-icon {
          margin-right: var(--spacing-md);
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .type-content {
          flex: 1;

          h4 {
            margin: 0 0 var(--spacing-sm);
            font-size: var(--text-base);
            font-weight: 600;
            color: var(--text-primary);
          }

          .type-stats {
            .stat-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;

              .label {
                font-size: var(--text-sm);
                color: var(--text-secondary);
              }

              .value {
                font-size: var(--text-sm);
                font-weight: 500;
                color: var(--text-primary);

                &.primary {
                  color: var(--color-primary);
                  font-weight: 600;
                }
              }
            }
          }
        }

        .type-chart {
          flex-shrink: 0;
        }
      }
    }
  }

  // 账单明细
  .bill-details-card {
    margin-bottom: var(--spacing-2xl);
    border-radius: var(--border-radius-lg);
    overflow: hidden;

    .card-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: var(--text-lg);
      font-weight: 600;

      .van-icon {
        color: var(--text-secondary);
        cursor: pointer;
      }
    }

    .bill-record-item {
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-md);
      background: var(--van-background-color);
      border-radius: var(--border-radius-md);
      cursor: pointer;
      transition: all 0.3s;

      &:active {
        background: var(--van-background-color-dark);
      }

      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-sm);

        .model-info {
          display: flex;
          gap: var(--spacing-sm);

          .van-tag {
            font-size: var(--text-xs);
          }
        }

        .record-time {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
        }
      }

      .record-body {
        margin-bottom: var(--spacing-sm);

        .record-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--spacing-sm);

          .stat-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);

            &.cost {
              .value {
                color: var(--color-primary);
                font-weight: 600;
              }
            }

            .label {
              font-size: var(--text-sm);
              color: var(--text-secondary);
            }

            .value {
              font-size: var(--text-sm);
              color: var(--text-primary);
            }
          }
        }

        .record-detail {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
          line-height: 1.4;
        }
      }

      .record-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .van-icon {
          color: var(--text-tertiary);
        }
      }
    }
  }

  // 详情弹窗
  .detail-popup {
    height: 100%;
    display: flex;
    flex-direction: column;

    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--van-border-color);

      span {
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--text-primary);
      }

      .van-icon {
        color: var(--text-secondary);
        cursor: pointer;
      }
    }

    .detail-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-md);

      .cost-value {
        color: var(--color-primary);
        font-weight: 600;
        font-size: var(--text-base);
      }
    }
  }
}

// 全局样式覆盖
:deep(.van-card) {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 0;
}

:deep(.van-card__header) {
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md);
}

:deep(.van-card__body) {
  padding: 0 var(--spacing-lg) var(--spacing-lg);
}

:deep(.van-grid-item__content) {
  padding: 0;
}

:deep(.van-loading__text) {
  color: var(--text-secondary);
}

:deep(.van-pagination) {
  justify-content: center;
}

:deep(.van-search) {
  padding: var(--spacing-sm) 0;
}

// 响应式适配
@media (min-width: 768px) {
  .ai-billing-mobile {
    max-width: 768px;
    margin: 0 auto;

    .stats-section {
      .stat-card {
        .stat-content {
          .stat-value {
            font-size: var(--text-2xl);
          }
        }
      }
    }
  }
}

// 深色模式支持
@media (prefers-color-scheme: dark) {
  .ai-billing-mobile {
    background: var(--van-background-color-dark);

    .stat-card,
    .type-item,
    .bill-record-item {
      background: var(--van-background-color-light);
    }
  }
}
</style>
