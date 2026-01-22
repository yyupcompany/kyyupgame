<template>
  <MobileCenterLayout title="文档统计" back-path="/mobile/centers">
    <div class="mobile-document-statistics">
      <!-- 页面头部和导出按钮 -->
      <div class="page-header">
        <div class="header-content">
          <h2 class="page-title">📊 文档统计分析</h2>
          <p class="page-subtitle">查看文档使用情况和统计数据</p>
        </div>
        <van-button
          type="primary"
          size="medium"
          icon="browsing-history-o"
          @click="handleExport"
          :loading="exportLoading"
        >
          导出报表
        </van-button>
      </div>

      <!-- 统计概览卡片 -->
      <div class="overview-cards">
        <div class="stat-card">
          <div class="stat-icon total">
            <van-icon name="description" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ overview.totalDocuments }}</div>
            <div class="stat-label">总文档数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon month">
            <van-icon name="add-o" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ overview.thisMonthDocuments }}</div>
            <div class="stat-label">本月新增</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <van-icon name="warning-o" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ overview.upcomingOverdue }}</div>
            <div class="stat-label">即将逾期</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon danger">
            <van-icon name="close" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ overview.overdue }}</div>
            <div class="stat-label">已逾期</div>
          </div>
        </div>
      </div>

      <!-- 时间筛选 -->
      <div class="filter-section">
        <van-field
          v-model="trendPeriod"
          label="时间范围"
          placeholder="选择时间范围"
          readonly
          is-link
          @click="showPeriodPicker = true"
        />
        <van-popup v-model:show="showPeriodPicker" position="bottom">
          <van-picker
            :columns="periodOptions"
            @confirm="onPeriodConfirm"
            @cancel="showPeriodPicker = false"
          />
        </van-popup>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <!-- 使用趋势图 -->
        <van-card title="使用趋势" class="chart-card">
          <template #thumb>
            <div class="chart-placeholder">
              <div v-if="trendLoading" class="chart-loading">
                <van-loading type="spinner" size="20px" />
                <span>加载中...</span>
              </div>
              <div v-else ref="trendChartRef" class="chart-container"></div>
            </div>
          </template>
        </van-card>

        <!-- 状态分布图 -->
        <van-card title="状态分布" class="chart-card">
          <template #thumb>
            <div class="chart-placeholder">
              <div v-if="statusLoading" class="chart-loading">
                <van-loading type="spinner" size="20px" />
                <span>加载中...</span>
              </div>
              <div v-else ref="statusChartRef" class="chart-container"></div>
            </div>
          </template>
        </van-card>

        <!-- 进度分布图 -->
        <van-card title="进度分布" class="chart-card">
          <template #thumb>
            <div class="chart-placeholder">
              <div v-if="progressLoading" class="chart-loading">
                <van-loading type="spinner" size="20px" />
                <span>加载中...</span>
              </div>
              <div v-else ref="progressChartRef" class="chart-container"></div>
            </div>
          </template>
        </van-card>

        <!-- 模板使用排行 -->
        <van-card title="模板使用排行 TOP 10" class="chart-card">
          <template #thumb>
            <div class="chart-placeholder">
              <div v-if="rankingLoading" class="chart-loading">
                <van-loading type="spinner" size="20px" />
                <span>加载中...</span>
              </div>
              <div v-else ref="rankingChartRef" class="chart-container"></div>
            </div>
          </template>
        </van-card>
      </div>

      <!-- 详细数据标签页 -->
      <div class="detail-section">
        <van-tabs v-model:active="activeTab" sticky>
          <!-- 状态统计 -->
          <van-tab title="状态统计" name="status">
            <div class="table-content">
              <div v-if="statusTableData.length === 0" class="empty-state">
                <van-empty description="暂无统计数据" />
              </div>
              <div v-else>
                <div
                  v-for="item in statusTableData"
                  :key="item.status"
                  class="status-item"
                >
                  <div class="status-header">
                    <van-tag :type="getStatusType(item.status)">
                      {{ getStatusLabel(item.status) }}
                    </van-tag>
                    <span class="status-count">{{ item.count }}个</span>
                  </div>
                  <div class="status-progress">
                    <van-progress
                      :percentage="item.percentage"
                      :color="getProgressColor(item.percentage)"
                      :pivot-text="`${item.percentage}%`"
                    />
                  </div>
                </div>
              </div>
            </div>
          </van-tab>

          <!-- 模板排行 -->
          <van-tab title="模板排行" name="ranking">
            <div class="table-content">
              <div v-if="templateRanking.length === 0" class="empty-state">
                <van-empty description="暂无排行数据" />
              </div>
              <div v-else>
                <div
                  v-for="(item, index) in templateRanking"
                  :key="item.templateId"
                  class="ranking-item"
                >
                  <div class="ranking-header">
                    <span class="ranking-number">{{ index + 1 }}</span>
                    <div class="ranking-info">
                      <div class="template-name">{{ item.template?.name || '未知模板' }}</div>
                      <div class="template-meta">
                        <span class="template-code">{{ item.template?.code }}</span>
                        <van-tag size="medium" type="primary">
                          {{ getCategoryName(item.template?.category) }}
                        </van-tag>
                      </div>
                    </div>
                    <div class="ranking-count">
                      <van-tag type="success">{{ item.count }}次</van-tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </van-tab>
        </van-tabs>
      </div>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'
import * as echarts from 'echarts'
import {
  getOverview,
  getTrends,
  getTemplateRanking,
  getCompletionRate,
  exportReport,
  type OverviewData,
  type TrendData,
  type TemplateRankingData,
  type CompletionRateData
} from '@/api/endpoints/document-statistics'

// 响应式数据
const activeTab = ref('status')
const trendPeriod = ref('30days')
const showPeriodPicker = ref(false)

const overview = ref<OverviewData>({
  totalDocuments: 0,
  thisMonthDocuments: 0,
  upcomingOverdue: 0,
  overdue: 0,
  avgProgress: 0
})

const statusTableData = ref<any[]>([])
const templateRanking = ref<any[]>([])

// 加载状态
const trendLoading = ref(false)
const statusLoading = ref(false)
const progressLoading = ref(false)
const rankingLoading = ref(false)
const exportLoading = ref(false)

// 时间筛选选项
const periodOptions = [
  { text: '近7天', value: '7days' },
  { text: '近30天', value: '30days' },
  { text: '近90天', value: '90days' },
  { text: '近1年', value: '1year' }
]

// 图表引用
const trendChartRef = ref<HTMLElement>()
const statusChartRef = ref<HTMLElement>()
const progressChartRef = ref<HTMLElement>()
const rankingChartRef = ref<HTMLElement>()

let trendChart: echarts.ECharts | null = null
let statusChart: echarts.ECharts | null = null
let progressChart: echarts.ECharts | null = null
let rankingChart: echarts.ECharts | null = null

// 方法
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    draft: 'default',
    filling: 'warning',
    review: 'primary',
    approved: 'success',
    rejected: 'danger',
    completed: 'success'
  }
  return map[status] || 'default'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    filling: '填写中',
    review: '审核中',
    approved: '已通过',
    rejected: '已拒绝',
    completed: '已完成'
  }
  return map[status] || status
}

const getCategoryName = (code?: string) => {
  if (!code) return '未分类'
  const map: Record<string, string> = {
    annual: '年度检查类',
    special: '专项检查类',
    routine: '常态化督导类',
    staff: '教职工管理类',
    student: '幼儿管理类',
    finance: '财务管理类',
    education: '保教工作类'
  }
  return map[code] || code
}

const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return 'var(--success-color)'
  if (percentage >= 60) return 'var(--warning-color)'
  if (percentage >= 40) return 'var(--danger-color)'
  return 'var(--info-color)'
}

const onPeriodConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  trendPeriod.value = selectedValues[0]
  showPeriodPicker.value = false
  loadTrends()
}

const handleExport = async () => {
  try {
    exportLoading.value = true
    const response = await exportReport('excel')
    if (response.success) {
      showSuccessToast('导出成功')
    } else {
      showFailToast('导出失败')
    }
  } catch (error) {
    console.error('导出失败:', error)
    showFailToast('导出失败')
  } finally {
    exportLoading.value = false
  }
}

// 加载数据
const loadOverview = async () => {
  try {
    const response = await getOverview()
    if (response.success) {
      overview.value = response.data
    }
  } catch (error) {
    console.error('加载统计概览失败:', error)
    showToast('加载统计概览失败')
  }
}

const loadTrends = async () => {
  try {
    trendLoading.value = true
    const response = await getTrends(trendPeriod.value as any)
    if (response.success) {
      renderTrendChart(response.data.trends)
    }
  } catch (error) {
    console.error('加载使用趋势失败:', error)
    showToast('加载使用趋势失败')
  } finally {
    trendLoading.value = false
  }
}

const loadCompletionRate = async () => {
  try {
    statusLoading.value = true
    progressLoading.value = true
    const response = await getCompletionRate()
    if (response.success) {
      statusTableData.value = response.data.completionRate
      renderStatusChart(response.data.completionRate)
      renderProgressChart(response.data.progressStats)
    }
  } catch (error) {
    console.error('加载完成率统计失败:', error)
    showToast('加载完成率统计失败')
  } finally {
    statusLoading.value = false
    progressLoading.value = false
  }
}

const loadTemplateRanking = async () => {
  try {
    rankingLoading.value = true
    const response = await getTemplateRanking(10)
    if (response.success) {
      templateRanking.value = response.data.ranking
      renderRankingChart(response.data.ranking)
    }
  } catch (error) {
    console.error('加载模板排行失败:', error)
    showToast('加载模板排行失败')
  } finally {
    rankingLoading.value = false
  }
}

// 渲染图表
const renderTrendChart = (data: any[]) => {
  if (!trendChartRef.value) return

  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      confine: true
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date),
      axisLabel: {
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10
      }
    },
    series: [
      {
        name: '文档数量',
        type: 'line',
        data: data.map(item => item.count),
        smooth: true,
        lineStyle: {
          width: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        }
      }
    ]
  }

  trendChart.setOption(option)
}

const renderStatusChart = (data: any[]) => {
  if (!statusChartRef.value) return

  if (!statusChart) {
    statusChart = echarts.init(statusChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'item',
      confine: true
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        fontSize: 10
      }
    },
    series: [
      {
        name: '状态分布',
        type: 'pie',
        radius: '60%',
        center: ['60%', '50%'],
        data: data.map(item => ({
          name: getStatusLabel(item.status),
          value: item.count
        })),
        label: {
          fontSize: 10
        },
        labelLine: {
          length: 5
        }
      }
    ]
  }

  statusChart.setOption(option)
}

const renderProgressChart = (data: any[]) => {
  if (!progressChartRef.value) return

  if (!progressChart) {
    progressChart = echarts.init(progressChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      confine: true
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.label),
      axisLabel: {
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10
      }
    },
    series: [
      {
        name: '文档数量',
        type: 'bar',
        data: data.map(item => item.count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }
    ]
  }

  progressChart.setOption(option)
}

const renderRankingChart = (data: any[]) => {
  if (!rankingChartRef.value) return

  if (!rankingChart) {
    rankingChart = echarts.init(rankingChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      confine: true
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10
      }
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.template?.name || '未知').slice(0, 8).reverse(),
      axisLabel: {
        fontSize: 10
      }
    },
    series: [
      {
        name: '使用次数',
        type: 'bar',
        data: data.map(item => item.count).slice(0, 8).reverse(),
        itemStyle: {
          color: 'var(--success-color)'
        }
      }
    ]
  }

  rankingChart.setOption(option)
}

// 响应式处理
const handleResize = () => {
  trendChart?.resize()
  statusChart?.resize()
  progressChart?.resize()
  rankingChart?.resize()
}

// 初始化
onMounted(async () => {
  showToast({ message: '加载中...', forbidClick: true, duration: 0 })

  try {
    await Promise.all([
      loadOverview(),
      loadCompletionRate(),
      loadTemplateRanking()
    ])

    await nextTick()
    await loadTrends()

    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize)
  } finally {
    showToast.clear()
  }
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  statusChart?.dispose()
  progressChart?.dispose()
  rankingChart?.dispose()
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;
@import '@/styles/mobile-base.scss';
.mobile-document-statistics {
  padding: var(--spacing-md);
  background: var(--van-background-color-light);
  min-height: calc(100vh - 46px);

  .page-header {
    margin-bottom: 16px;

    .header-content {
      margin-bottom: 12px;

      .page-title {
        font-size: var(--text-xl);
        font-weight: 600;
        margin: 0 0 4px 0;
        color: var(--van-text-color);
      }

      .page-subtitle {
        font-size: var(--text-sm);
        color: var(--van-text-color-2);
        margin: 0;
      }
    }
  }

  .overview-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
    margin-bottom: 16px;

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: var(--spacing-md);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .stat-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;

        .van-icon {
          font-size: var(--text-xl);
          color: white;
        }

        &.total {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.month {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        &.warning {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }

        &.danger {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        }
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: var(--text-2xl);
          font-weight: 600;
          color: var(--van-text-color);
          line-height: 1.2;
        }

        .stat-label {
          font-size: var(--text-xs);
          color: var(--van-text-color-2);
          margin-top: 2px;
        }
      }
    }
  }

  .filter-section {
    margin-bottom: 16px;

    :deep(.van-field) {
      background: white;
      border-radius: 8px;
      margin-bottom: 8px;
    }
  }

  .charts-section {
    margin-bottom: 16px;

    .chart-card {
      margin-bottom: 12px;
      border-radius: 8px;
      overflow: hidden;

      :deep(.van-card__thumb) {
        width: 100%;
        height: 200px;
        margin-right: 0;
        margin-bottom: 12px;
      }

      .chart-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8f9fa;
        border-radius: 4px;

        .chart-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          color: var(--van-text-color-2);
          font-size: var(--text-xs);

          .van-loading {
            margin-bottom: 4px;
          }
        }

        .chart-container {
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  .detail-section {
    :deep(.van-tabs) {
      background: white;
      border-radius: 8px;
      overflow: hidden;

      .van-tabs__nav {
        background: white;
      }

      .van-tab__pane {
        padding: var(--spacing-md);
      }
    }

    .table-content {
      .empty-state {
        padding: 40px 20px;
      }

      .status-item {
        background: #f8f9fa;
        border-radius: 8px;
        padding: var(--spacing-md);
        margin-bottom: 8px;

        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .status-count {
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
          }
        }

        .status-progress {
          :deep(.van-progress) {
            .van-progress__portion {
              border-radius: 4px;
            }
          }
        }
      }

      .ranking-item {
        background: white;
        border: 1px solid #ebedf0;
        border-radius: 8px;
        padding: var(--spacing-md);
        margin-bottom: 8px;

        .ranking-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);

          .ranking-number {
            width: 24px;
            height: 24px;
            background: var(--van-primary-color);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--text-xs);
            font-weight: 600;
            flex-shrink: 0;
          }

          .ranking-info {
            flex: 1;

            .template-name {
              font-size: var(--text-sm);
              font-weight: 500;
              color: var(--van-text-color);
              margin-bottom: 4px;
            }

            .template-meta {
              display: flex;
              align-items: center;
              gap: var(--spacing-sm);

              .template-code {
                font-size: var(--text-xs);
                color: var(--van-text-color-2);
              }
            }
          }

          .ranking-count {
            flex-shrink: 0;
          }
        }
      }
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-document-statistics {
    .overview-cards {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}
</style>