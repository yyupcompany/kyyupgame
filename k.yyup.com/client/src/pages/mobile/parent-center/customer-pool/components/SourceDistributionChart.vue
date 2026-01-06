<template>
  <div class="source-distribution-chart">
    <!-- 头部统计 -->
    <div class="chart-header">
      <h3 class="chart-title">客户来源分布</h3>
      <div class="chart-actions">
        <van-button
          v-for="period in periods"
          :key="period.value"
          :type="selectedPeriod === period.value ? 'primary' : 'default'"
          size="small"
          plain
          @click="$emit('period-change', period.value)"
        >
          {{ period.label }}
        </van-button>
      </div>
    </div>

    <!-- 总体统计 -->
    <div class="total-stats">
      <van-row :gutter="12">
        <van-col span="8">
          <div class="stat-item">
            <div class="stat-value">{{ totalCustomers }}</div>
            <div class="stat-label">总客户数</div>
          </div>
        </van-col>
        <van-col span="8">
          <div class="stat-item">
            <div class="stat-value">{{ sourceCount }}</div>
            <div class="stat-label">来源渠道</div>
          </div>
        </van-col>
        <van-col span="8">
          <div class="stat-item">
            <div class="stat-value">{{ topSourceRate }}%</div>
            <div class="stat-label">最高占比</div>
          </div>
        </van-col>
      </van-row>
    </div>

    <!-- 饼图 -->
    <div class="chart-container">
      <div
        ref="pieChartRef"
        class="pie-chart"
        style="height: 300px"
      ></div>
    </div>

    <!-- 来源列表 -->
    <div class="source-list">
      <van-cell-group inset>
        <van-cell
          v-for="(source, index) in sourceData"
          :key="source.name"
          :title="source.name"
          :value="`${source.value} (${source.percentage}%)`"
          :is-link="true"
          @click="$emit('source-click', source)"
        >
          <template #icon>
            <div
              class="source-indicator"
              :style="{ backgroundColor: getSourceColor(index) }"
            ></div>
          </template>

          <template #right-icon>
            <div class="source-trend">
              <van-icon
                :name="getTrendIcon(source.trend)"
                :color="getTrendColor(source.trend)"
                size="14"
              />
              <span class="trend-value">{{ source.change }}%</span>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 趋势对比 -->
    <div class="trend-comparison">
      <h4 class="section-title">来源趋势对比</h4>
      <div class="trend-chart-container">
        <div
          ref="trendChartRef"
          class="trend-chart"
          style="height: 200px"
        ></div>
      </div>
    </div>

    <!-- 转化率分析 -->
    <div class="conversion-analysis">
      <h4 class="section-title">转化率分析</h4>
      <div class="conversion-list">
        <div
          v-for="item in conversionData"
          :key="item.source"
          class="conversion-item"
        >
          <div class="conversion-header">
            <span class="source-name">{{ item.source }}</span>
            <span class="conversion-rate">{{ item.rate }}%</span>
          </div>
          <div class="conversion-bar">
            <van-progress
              :percentage="item.rate"
              :color="getConversionColor(item.rate)"
              :show-pivot="false"
            />
          </div>
          <div class="conversion-details">
            <span class="detail-text">
              {{ item.converted }}/{{ item.total }} 转化
            </span>
            <span class="detail-text">
              周期: {{ item.cycle }}天
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 推荐建议 -->
    <div class="recommendations" v-if="recommendations.length > 0">
      <h4 class="section-title">优化建议</h4>
      <div class="recommendation-list">
        <van-notice-bar
          v-for="(recommendation, index) in recommendations"
          :key="index"
          :text="recommendation"
          :color="getRecommendationColor(index)"
          :background="getRecommendationBgColor(index)"
          mode="closeable"
          @close="$emit('dismiss-recommendation', index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import { showToast } from 'vant'

interface SourceData {
  name: string
  value: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
  change: number
}

interface ConversionData {
  source: string
  rate: number
  converted: number
  total: number
  cycle: number
}

interface Props {
  sourceData?: SourceData[]
  conversionData?: ConversionData[]
  recommendations?: string[]
  selectedPeriod?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sourceData: () => [
    { name: '线上广告', value: 156, percentage: 31.2, trend: 'up', change: 12.5 },
    { name: '线下活动', value: 124, percentage: 24.8, trend: 'stable', change: 2.1 },
    { name: '转介绍', value: 98, percentage: 19.6, trend: 'up', change: 8.3 },
    { name: '自然到访', value: 67, percentage: 13.4, trend: 'down', change: -3.2 },
    { name: '电话咨询', value: 35, percentage: 7.0, trend: 'stable', change: 0.5 },
    { name: '社交媒体', value: 20, percentage: 4.0, trend: 'up', change: 15.7 }
  ],
  conversionData: () => [
    { source: '线上广告', rate: 22.5, converted: 35, total: 156, cycle: 15 },
    { source: '线下活动', rate: 35.8, converted: 44, total: 124, cycle: 8 },
    { source: '转介绍', rate: 68.4, converted: 67, total: 98, cycle: 5 },
    { source: '自然到访', rate: 28.4, converted: 19, total: 67, cycle: 12 },
    { source: '电话咨询', rate: 31.4, converted: 11, total: 35, cycle: 10 }
  ],
  recommendations: () => [
    '建议增加转介绍奖励机制，提高推荐转化率',
    '线上广告投入产出比较高，可适当增加预算',
    '自然到访转化率偏低，需要优化接待流程'
  ],
  selectedPeriod: 'month',
  loading: false
})

const emit = defineEmits<{
  'period-change': [period: string]
  'source-click': [source: SourceData]
  'dismiss-recommendation': [index: number]
}>()

// 响应式数据
const pieChartRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()
let pieChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null

const periods = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本季', value: 'quarter' }
]

// 计算属性
const totalCustomers = computed(() => {
  return props.sourceData.reduce((sum, item) => sum + item.value, 0)
})

const sourceCount = computed(() => props.sourceData.length)

const topSourceRate = computed(() => {
  if (props.sourceData.length === 0) return 0
  return Math.max(...props.sourceData.map(item => item.percentage))
})

// 方法
const getSourceColor = (index: number): string => {
  const colors = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
    '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#5d7092'
  ]
  return colors[index % colors.length]
}

const getTrendIcon = (trend: string): string => {
  const iconMap = {
    'up': 'arrow-up',
    'down': 'arrow-down',
    'stable': 'minus'
  }
  return iconMap[trend] || 'minus'
}

const getTrendColor = (trend: string): string => {
  const colorMap = {
    'up': '#67C23A',
    'down': '#F56C6C',
    'stable': '#E6A23C'
  }
  return colorMap[trend] || '#909399'
}

const getConversionColor = (rate: number): string => {
  if (rate >= 50) return '#67C23A'
  if (rate >= 30) return '#E6A23C'
  return '#F56C6C'
}

const getRecommendationColor = (index: number): string => {
  const colors = ['#1989fa', '#ff6b6b', '#51cf66']
  return colors[index % colors.length]
}

const getRecommendationBgColor = (index: number): string => {
  const colors = ['#ecf9ff', '#fff5f5', '#f0fff4']
  return colors[index % colors.length]
}

const initPieChart = () => {
  if (!pieChartRef.value) return

  pieChart = echarts.init(pieChartRef.value)
  updatePieChart()
}

const updatePieChart = () => {
  if (!pieChart) return

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
      confine: true
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemGap: 8,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    series: [
      {
        name: '客户来源',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: props.sourceData.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: getSourceColor(index)
          }
        }))
      }
    ]
  }

  pieChart.setOption(option, true)
}

const initTrendChart = () => {
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)
  updateTrendChart()
}

const updateTrendChart = () => {
  if (!trendChart) return

  // 生成模拟趋势数据
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  })

  const series = props.sourceData.slice(0, 4).map((source, index) => ({
    name: source.name,
    type: 'line',
    smooth: true,
    data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 5),
    itemStyle: {
      color: getSourceColor(index)
    },
    lineStyle: {
      color: getSourceColor(index)
    },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: getSourceColor(index) + '40' },
          { offset: 1, color: getSourceColor(index) + '10' }
        ]
      }
    }
  }))

  const option = {
    tooltip: {
      trigger: 'axis',
      confine: true
    },
    grid: {
      left: '5%',
      right: '5%',
      top: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        fontSize: 10,
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10,
        color: '#666'
      }
    },
    series
  }

  trendChart.setOption(option, true)
}

const resizeCharts = () => {
  if (pieChart) pieChart.resize()
  if (trendChart) trendChart.resize()
}

const destroyCharts = () => {
  if (pieChart) {
    pieChart.dispose()
    pieChart = null
  }
  if (trendChart) {
    trendChart.dispose()
    trendChart = null
  }
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    initPieChart()
    initTrendChart()
    window.addEventListener('resize', resizeCharts)
  })
})

onUnmounted(() => {
  destroyCharts()
  window.removeEventListener('resize', resizeCharts)
})

// 监听数据变化
watch(
  () => props.sourceData,
  () => {
    nextTick(() => {
      updatePieChart()
      updateTrendChart()
    })
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.source-distribution-chart {
  padding: var(--van-padding-sm);

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--van-padding-md);

    .chart-title {
      margin: 0;
      font-size: var(--van-font-size-lg);
      font-weight: var(--van-font-weight-bold);
      color: var(--van-text-color);
    }

    .chart-actions {
      display: flex;
      gap: var(--van-padding-xs);

      .van-button {
        height: 28px;
        font-size: var(--van-font-size-xs);
      }
    }
  }

  .total-stats {
    margin-bottom: var(--van-padding-md);

    .stat-item {
      text-align: center;
      padding: var(--van-padding-sm);
      background: white;
      border-radius: var(--van-border-radius-md);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .stat-value {
        font-size: var(--van-font-size-xl);
        font-weight: var(--van-font-weight-bold);
        color: var(--van-primary-color);
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: var(--van-font-size-xs);
        color: var(--van-text-color-2);
      }
    }
  }

  .chart-container {
    background: white;
    border-radius: var(--van-border-radius-lg);
    padding: var(--van-padding-md);
    margin-bottom: var(--van-padding-md);
  }

  .source-list {
    margin-bottom: var(--van-padding-md);

    .source-indicator {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      margin-right: var(--van-padding-sm);
    }

    .source-trend {
      display: flex;
      align-items: center;
      gap: 2px;

      .trend-value {
        font-size: var(--van-font-size-xs);
        font-weight: var(--van-font-weight-bold);
      }
    }
  }

  .trend-comparison {
    background: white;
    border-radius: var(--van-border-radius-lg);
    padding: var(--van-padding-md);
    margin-bottom: var(--van-padding-md);

    .section-title {
      margin: 0 0 var(--van-padding-md) 0;
      font-size: var(--van-font-size-md);
      font-weight: var(--van-font-weight-bold);
      color: var(--van-text-color);
    }

    .trend-chart-container {
      .trend-chart {
        width: 100%;
      }
    }
  }

  .conversion-analysis {
    background: white;
    border-radius: var(--van-border-radius-lg);
    padding: var(--van-padding-md);
    margin-bottom: var(--van-padding-md);

    .section-title {
      margin: 0 0 var(--van-padding-md) 0;
      font-size: var(--van-font-size-md);
      font-weight: var(--van-font-weight-bold);
      color: var(--van-text-color);
    }

    .conversion-list {
      display: grid;
      gap: var(--van-padding-sm);

      .conversion-item {
        padding: var(--van-padding-sm);
        background: var(--van-background-color-light);
        border-radius: var(--van-border-radius-md);

        .conversion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--van-padding-xs);

          .source-name {
            font-size: var(--van-font-size-sm);
            font-weight: var(--van-font-weight-bold);
            color: var(--van-text-color);
          }

          .conversion-rate {
            font-size: var(--van-font-size-md);
            font-weight: var(--van-font-weight-bold);
            color: var(--van-primary-color);
          }
        }

        .conversion-bar {
          margin-bottom: var(--van-padding-xs);
        }

        .conversion-details {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .detail-text {
            font-size: var(--van-font-size-xs);
            color: var(--van-text-color-2);
          }
        }
      }
    }
  }

  .recommendations {
    background: white;
    border-radius: var(--van-border-radius-lg);
    padding: var(--van-padding-md);

    .section-title {
      margin: 0 0 var(--van-padding-md) 0;
      font-size: var(--van-font-size-md);
      font-weight: var(--van-font-weight-bold);
      color: var(--van-text-color);
    }

    .recommendation-list {
      display: flex;
      flex-direction: column;
      gap: var(--van-padding-xs);

      .van-notice-bar {
        border-radius: var(--van-border-radius-md);
      }
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .source-distribution-chart {
    .total-stats .stat-item,
    .chart-container,
    .trend-comparison,
    .conversion-analysis,
    .recommendations {
      background: var(--van-background-color-dark);
    }

    .conversion-analysis .conversion-item {
      background: var(--van-background-color);
    }
  }
}

// 小屏幕适配
@media (max-width: 375px) {
  .source-distribution-chart {
    .chart-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--van-padding-sm);

      .chart-actions {
        width: 100%;
        justify-content: space-between;

        .van-button {
          flex: 1;
        }
      }
    }
  }
}
</style>