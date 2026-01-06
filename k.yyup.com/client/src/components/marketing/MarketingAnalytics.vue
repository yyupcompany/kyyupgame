<template>
  <div class="marketing-analytics">
    <!-- 时间范围选择器 -->
    <div class="date-range-selector">
      <el-radio-group v-model="dateRangeType" @change="handleDateRangeChange">
        <el-radio-button label="7d">最近7天</el-radio-button>
        <el-radio-button label="30d">最近30天</el-radio-button>
        <el-radio-button label="90d">最近90天</el-radio-button>
        <el-radio-button label="custom">自定义</el-radio-button>
      </el-radio-group>

      <el-date-picker
        v-if="dateRangeType === 'custom'"
        v-model="customDateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="handleCustomDateChange"
      />
    </div>

    <!-- 核心指标概览 -->
    <div class="overview-cards">
      <div class="overview-card">
        <div class="card-header">
          <h4>总参与人数</h4>
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="card-body">
          <div class="metric-value">{{ analytics.totalParticipants.toLocaleString() }}</div>
          <div class="metric-change" :class="getChangeClass(analytics.participantsChange)">
            <el-icon v-if="analytics.participantsChange > 0"><ArrowUp /></el-icon>
            <el-icon v-else-if="analytics.participantsChange < 0"><ArrowDown /></el-icon>
            {{ Math.abs(analytics.participantsChange) }}%
          </div>
        </div>
      </div>

      <div class="overview-card">
        <div class="card-header">
          <h4>转化率</h4>
          <el-icon><DataLine /></el-icon>
        </div>
        <div class="card-body">
          <div class="metric-value">{{ analytics.conversionRate }}%</div>
          <div class="metric-change" :class="getChangeClass(analytics.conversionChange)">
            <el-icon v-if="analytics.conversionChange > 0"><ArrowUp /></el-icon>
            <el-icon v-else-if="analytics.conversionChange < 0"><ArrowDown /></el-icon>
            {{ Math.abs(analytics.conversionChange) }}%
          </div>
        </div>
      </div>

      <div class="overview-card">
        <div class="card-header">
          <h4>营销收入</h4>
          <el-icon><Coin /></el-icon>
        </div>
        <div class="card-body">
          <div class="metric-value">¥{{ analytics.revenue.toLocaleString() }}</div>
          <div class="metric-change" :class="getChangeClass(analytics.revenueChange)">
            <el-icon v-if="analytics.revenueChange > 0"><ArrowUp /></el-icon>
            <el-icon v-else-if="analytics.revenueChange < 0"><ArrowDown /></el-icon>
            {{ Math.abs(analytics.revenueChange) }}%
          </div>
        </div>
      </div>

      <div class="overview-card">
        <div class="card-header">
          <h4>投资回报率</h4>
          <el-icon><PieChart /></el-icon>
        </div>
        <div class="card-body">
          <div class="metric-value">{{ analytics.roi }}%</div>
          <div class="metric-change" :class="getChangeClass(analytics.roiChange)">
            <el-icon v-if="analytics.roiChange > 0"><ArrowUp /></el-icon>
            <el-icon v-else-if="analytics.roiChange < 0"><ArrowDown /></el-icon>
            {{ Math.abs(analytics.roiChange) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <div class="chart-row">
        <!-- 参与趋势图 -->
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>参与人数趋势</span>
              <el-button-group size="small">
                <el-button
                  :type="trendChartType === 'line' ? 'primary' : 'default'"
                  @click="trendChartType = 'line'"
                >
                  折线图
                </el-button>
                <el-button
                  :type="trendChartType === 'bar' ? 'primary' : 'default'"
                  @click="trendChartType = 'bar'"
                >
                  柱状图
                </el-button>
              </el-button-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>

        <!-- 营销功能分布 -->
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>营销功能分布</span>
            </div>
          </template>
          <div ref="distributionChartRef" class="chart-container"></div>
        </el-card>
      </div>

      <div class="chart-row">
        <!-- 转化漏斗 -->
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>转化漏斗分析</span>
            </div>
          </template>
          <div ref="funnelChartRef" class="chart-container"></div>
        </el-card>

        <!-- ROI分析 -->
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>ROI分析</span>
            </div>
          </template>
          <div ref="roiChartRef" class="chart-container"></div>
        </el-card>
      </div>
    </div>

    <!-- 功能效果分析表格 -->
    <el-card class="performance-table">
      <template #header>
        <div class="table-header">
          <span>营销功能效果分析</span>
          <div class="table-actions">
            <el-button size="small" @click="exportData">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
            <el-button size="small" @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="featurePerformance" stripe>
        <el-table-column prop="feature" label="营销功能" width="120" />
        <el-table-column prop="totalActivities" label="活动总数" width="100" align="center" />
        <el-table-column prop="participants" label="参与人数" width="100" align="center">
          <template #default="{ row }">
            {{ row.participants.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="conversions" label="转化数" width="100" align="center" />
        <el-table-column prop="conversionRate" label="转化率" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getConversionType(row.conversionRate)" size="small">
              {{ row.conversionRate }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="revenue" label="收入(¥)" width="120" align="center">
          <template #default="{ row }">
            {{ row.revenue.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="成本(¥)" width="120" align="center">
          <template #default="{ row }">
            {{ row.cost.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="roi" label="ROI(%)" width="100" align="center">
          <template #default="{ row }">
            <span :class="getROIClass(row.roi)">{{ row.roi }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="trend" label="趋势" width="80" align="center">
          <template #default="{ row }">
            <div class="trend-indicator" :class="row.trend">
              <el-icon><ArrowUp v-if="row.trend === 'up'" /><ArrowDown v-else /></el-icon>
              <span>{{ row.trendChange }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewFeatureDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  TrendCharts, DataLine, Coin, PieChart, ArrowUp, ArrowDown,
  Download, Refresh
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 响应式数据
const dateRangeType = ref('30d')
const customDateRange = ref<any[]>([])
const trendChartType = ref('line')

const chartRefs = {
  trend: ref<HTMLElement>(),
  distribution: ref<HTMLElement>(),
  funnel: ref<HTMLElement>(),
  roi: ref<HTMLElement>()
}

const trendChartRef = ref<HTMLElement>()
const distributionChartRef = ref<HTMLElement>()
const funnelChartRef = ref<HTMLElement>()
const roiChartRef = ref<HTMLElement>()

// 图表实例
let trendChart: echarts.ECharts | null = null
let distributionChart: echarts.ECharts | null = null
let funnelChart: echarts.ECharts | null = null
let roiChart: echarts.ECharts | null = null

// 分析数据
const analytics = reactive({
  totalParticipants: 0,
  participantsChange: 0,
  conversionRate: 0,
  conversionChange: 0,
  revenue: 0,
  revenueChange: 0,
  roi: 0,
  roiChange: 0,
})

const featurePerformance = ref<any[]>([])

// 暴露方法给父组件
defineExpose({
  refreshData,
})

// 方法
const loadAnalytics = async () => {
  try {
    // 模拟数据加载
    Object.assign(analytics, {
      totalParticipants: 15680,
      participantsChange: 12.5,
      conversionRate: 68.5,
      conversionChange: -3.2,
      revenue: 1285000,
      revenueChange: 15.8,
      roi: 256.8,
      roiChange: 8.5,
    })

    featurePerformance.value = [
      {
        feature: '团购活动',
        totalActivities: 45,
        participants: 5680,
        conversions: 3420,
        conversionRate: 60.2,
        revenue: 456000,
        cost: 125000,
        roi: 264.8,
        trend: 'up',
        trendChange: 12.5
      },
      {
        feature: '积攒活动',
        totalActivities: 32,
        participants: 4250,
        conversions: 2980,
        conversionRate: 70.1,
        revenue: 285000,
        cost: 85000,
        roi: 235.3,
        trend: 'up',
        trendChange: 8.2
      },
      {
        feature: '推荐奖励',
        totalActivities: 28,
        participants: 3150,
        conversions: 2480,
        conversionRate: 78.7,
        revenue: 312000,
        cost: 95000,
        roi: 228.4,
        trend: 'down',
        trendChange: -2.1
      },
      {
        feature: '阶梯奖励',
        totalActivities: 24,
        participants: 1820,
        conversions: 1420,
        conversionRate: 78.0,
        revenue: 185000,
        cost: 65000,
        roi: 184.6,
        trend: 'up',
        trendChange: 5.6
      },
      {
        feature: '优惠券',
        totalActivities: 156,
        participants: 780,
        conversions: 520,
        conversionRate: 66.7,
        revenue: 47000,
        cost: 18000,
        roi: 161.1,
        trend: 'down',
        trendChange: -4.3
      }
    ]

    await nextTick()
    initCharts()
  } catch (error) {
    console.error('加载分析数据失败:', error)
    ElMessage.error('加载分析数据失败')
  }
}

const initCharts = () => {
  initTrendChart()
  initDistributionChart()
  initFunnelChart()
  initROIChart()
}

const initTrendChart = () => {
  if (!trendChartRef.value) return

  if (trendChart) {
    trendChart.dispose()
  }

  trendChart = echarts.init(trendChartRef.value)

  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  })

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['参与人数', '转化数']
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '参与人数',
        type: trendChartType.value,
        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 200) + 300),
        smooth: true,
        itemStyle: {
          color: '#409eff'
        }
      },
      {
        name: '转化数',
        type: trendChartType.value,
        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 150) + 200),
        smooth: true,
        itemStyle: {
          color: '#67c23a'
        }
      }
    ]
  }

  trendChart.setOption(option)
}

const initDistributionChart = () => {
  if (!distributionChartRef.value) return

  if (distributionChart) {
    distributionChart.dispose()
  }

  distributionChart = echarts.init(distributionChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '营销功能',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 5680, name: '团购活动' },
          { value: 4250, name: '积攒活动' },
          { value: 3150, name: '推荐奖励' },
          { value: 1820, name: '阶梯奖励' },
          { value: 780, name: '优惠券' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  distributionChart.setOption(option)
}

const initFunnelChart = () => {
  if (!funnelChartRef.value) return

  if (funnelChart) {
    funnelChart.dispose()
  }

  funnelChart = echarts.init(funnelChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}%'
    },
    legend: {
      data: ['浏览', '点击', '参与', '转化', '付费']
    },
    series: [
      {
        name: '转化漏斗',
        type: 'funnel',
        left: '10%',
        width: '80%',
        label: {
          show: true,
          position: 'inside'
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 20
          }
        },
        data: [
          { value: 100, name: '浏览' },
          { value: 75, name: '点击' },
          { value: 45, name: '参与' },
          { value: 30, name: '转化' },
          { value: 18, name: '付费' }
        ]
      }
    ]
  }

  funnelChart.setOption(option)
}

const initROIChart = () => {
  if (!roiChartRef.value) return

  if (roiChart) {
    roiChart.dispose()
  }

  roiChart = echarts.init(roiChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['收入', '成本', '利润']
    },
    xAxis: {
      type: 'category',
      data: ['团购活动', '积攒活动', '推荐奖励', '阶梯奖励', '优惠券']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '收入',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#67c23a' },
        data: [456000, 285000, 312000, 185000, 47000]
      },
      {
        name: '成本',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#f56c6c' },
        data: [125000, 85000, 95000, 65000, 18000]
      },
      {
        name: '利润',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#409eff' },
        data: [331000, 200000, 217000, 120000, 29000]
      }
    ]
  }

  roiChart.setOption(option)
}

const handleDateRangeChange = () => {
  loadAnalytics()
}

const handleCustomDateChange = () => {
  if (customDateRange.value && customDateRange.value.length === 2) {
    loadAnalytics()
  }
}

const refreshData = () => {
  loadAnalytics()
}

const exportData = () => {
  // TODO: 实现数据导出功能
  ElMessage.info('导出功能开发中...')
}

const viewFeatureDetail = (feature: any) => {
  // TODO: 跳转到功能详情页面
  ElMessage.info(`${feature.feature}详情功能开发中...`)
}

const getChangeClass = (change: number) => {
  return change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
}

const getConversionType = (rate: number) => {
  if (rate >= 70) return 'success'
  if (rate >= 50) return 'warning'
  return 'danger'
}

const getROIClass = (roi: number) => {
  if (roi >= 200) return 'roi-high'
  if (roi >= 100) return 'roi-medium'
  return 'roi-low'
}

// 监听窗口大小变化
const handleResize = () => {
  trendChart?.resize()
  distributionChart?.resize()
  funnelChart?.resize()
  roiChart?.resize()
}

// 生命周期
onMounted(() => {
  loadAnalytics()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  trendChart?.dispose()
  distributionChart?.dispose()
  funnelChart?.dispose()
  roiChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.marketing-analytics {
  .date-range-selector {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    margin-bottom: 24px;
    padding: var(--spacing-md);
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .overview-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: 24px;

    .overview-card {
      background: white;
      border-radius: 12px;
      padding: var(--spacing-lg);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h4 {
          margin: 0;
          color: #606266;
          font-size: var(--text-sm);
          font-weight: 500;
        }

        .el-icon {
          font-size: var(--text-xl);
          color: #c0c4cc;
        }
      }

      .card-body {
        .metric-value {
          font-size: var(--text-4xl);
          font-weight: 700;
          color: #303133;
          margin-bottom: 8px;
        }

        .metric-change {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--text-sm);
          font-weight: 600;

          &.positive {
            color: #67c23a;
          }

          &.negative {
            color: #f56c6c;
          }

          &.neutral {
            color: #909399;
          }
        }
      }
    }
  }

  .charts-section {
    margin-bottom: 24px;

    .chart-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-lg);
      margin-bottom: 20px;

      .chart-card {
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chart-container {
          height: 300px;
          width: 100%;
        }
      }
    }
  }

  .performance-table {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .table-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }

    .trend-indicator {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: var(--text-xs);

      &.up {
        color: #67c23a;
      }

      &.down {
        color: #f56c6c;
      }
    }

    .roi-high {
      color: #67c23a;
      font-weight: 600;
    }

    .roi-medium {
      color: #e6a23c;
      font-weight: 600;
    }

    .roi-low {
      color: #f56c6c;
      font-weight: 600;
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .charts-section .chart-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .overview-cards {
    grid-template-columns: 1fr;
  }

  .date-range-selector {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }
}
</style>