<template>
  <div class="customer-conversion">
    <!-- 转化概览 -->
    <div class="conversion-overview">
      <van-row :gutter="12">
        <van-col span="12">
          <div class="stat-card primary">
            <div class="stat-icon">
              <van-icon name="chart-trending-o" size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ conversionStats.totalRate }}%</div>
              <div class="stat-label">总转化率</div>
              <div class="stat-trend" :class="conversionStats.totalTrend">
                <van-icon :name="getTrendIcon(conversionStats.totalTrend)" size="12" />
                {{ conversionStats.totalChange }}%
              </div>
            </div>
          </div>
        </van-col>
        <van-col span="12">
          <div class="stat-card success">
            <div class="stat-icon">
              <van-icon name="medal-o" size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ conversionStats.convertedCount }}</div>
              <div class="stat-label">已转化客户</div>
              <div class="stat-trend" :class="conversionStats.convertedTrend">
                <van-icon :name="getTrendIcon(conversionStats.convertedTrend)" size="12" />
                {{ conversionStats.convertedChange }}%
              </div>
            </div>
          </div>
        </van-col>
      </van-row>
    </div>

    <!-- 转化漏斗 -->
    <div class="conversion-funnel">
      <h3 class="section-title">转化漏斗</h3>
      <div class="funnel-chart">
        <div
          v-for="(stage, index) in funnelStages"
          :key="stage.name"
          class="funnel-stage"
          :style="{
            width: getStageWidth(stage.value) + '%',
            backgroundColor: getStageColor(index)
          }"
        >
          <div class="stage-info">
            <div class="stage-name">{{ stage.name }}</div>
            <div class="stage-value">{{ stage.value }}</div>
            <div class="stage-rate">{{ getStageRate(index) }}%</div>
          </div>
        </div>
      </div>
      <div class="funnel-legend">
        <div
          v-for="(stage, index) in funnelStages"
          :key="stage.name"
          class="legend-item"
        >
          <div
            class="legend-color"
            :style="{ backgroundColor: getStageColor(index) }"
          ></div>
          <span class="legend-text">{{ stage.name }}</span>
          <span class="legend-value">{{ stage.value }}</span>
        </div>
      </div>
    </div>

    <!-- 转化趋势图表 -->
    <div class="conversion-trend">
      <div class="section-header">
        <h3 class="section-title">转化趋势</h3>
        <van-button-group size="small">
          <van-button
            v-for="period in periods"
            :key="period.value"
            :type="selectedPeriod === period.value ? 'primary' : 'default'"
            @click="$emit('period-change', period.value)"
          >
            {{ period.label }}
          </van-button>
        </van-button-group>
      </div>
      <div class="trend-chart-container">
        <div
          ref="trendChartRef"
          class="trend-chart"
          style="height: 200px"
        ></div>
      </div>
    </div>

    <!-- 转化阶段分析 -->
    <div class="stage-analysis">
      <h3 class="section-title">阶段分析</h3>
      <van-collapse v-model="activeStages">
        <van-collapse-item
          v-for="stage in stageAnalysis"
          :key="stage.name"
          :name="stage.name"
          :title="stage.name"
        >
          <div class="stage-details">
            <div class="detail-row">
              <span class="detail-label">客户数量</span>
              <span class="detail-value">{{ stage.customerCount }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">转化率</span>
              <span class="detail-value">{{ stage.conversionRate }}%</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">平均停留时间</span>
              <span class="detail-value">{{ stage.avgDuration }}天</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">瓶颈因素</span>
              <span class="detail-value">{{ stage.bottleneck || '无' }}</span>
            </div>
          </div>
          <div class="stage-improvements">
            <h4>改进建议</h4>
            <ul>
              <li v-for="suggestion in stage.suggestions" :key="suggestion">
                {{ suggestion }}
              </li>
            </ul>
          </div>
        </van-collapse-item>
      </van-collapse>
    </div>

    <!-- 高转化客户特征 -->
    <div class="high-conversion-features">
      <div class="section-header">
        <h3 class="section-title">高转化客户特征</h3>
        <van-button
          type="primary"
          size="small"
          plain
          @click="$emit('view-all-features')"
        >
          查看详情
        </van-button>
      </div>
      <div class="features-grid">
        <div
          v-for="feature in highConversionFeatures"
          :key="feature.name"
          class="feature-item"
        >
          <div class="feature-icon">
            <van-icon :name="feature.icon" :color="feature.color" size="20" />
          </div>
          <div class="feature-content">
            <div class="feature-name">{{ feature.name }}</div>
            <div class="feature-value">{{ feature.value }}</div>
            <div class="feature-desc">{{ feature.description }}</div>
          </div>
          <div class="feature-score">
            <van-progress
              :percentage="feature.score"
              :color="feature.color"
              :show-pivot="false"
              size="4"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 转化预测 -->
    <div class="conversion-prediction">
      <div class="section-header">
        <h3 class="section-title">转化预测</h3>
        <van-button
          type="primary"
          size="small"
          plain
          @click="$emit('refresh-prediction'"
          :loading="predictionLoading"
        >
          刷新预测
        </van-button>
      </div>
      <div class="prediction-content">
        <div class="prediction-stats">
          <div class="prediction-item">
            <div class="prediction-label">本月预计转化</div>
            <div class="prediction-value">{{ predictionData.expectedConversions }}</div>
          </div>
          <div class="prediction-item">
            <div class="prediction-label">预测准确率</div>
            <div class="prediction-value">{{ predictionData.accuracy }}%</div>
          </div>
        </div>
        <div class="prediction-list">
          <h4>即将转化客户</h4>
          <div
            v-for="customer in predictionData.likelyCustomers"
            :key="customer.id"
            class="prediction-customer"
            @click="$emit('customer-click', customer)"
          >
            <van-image
              :src="customer.avatar"
              width="40"
              height="40"
              round
              fit="cover"
            />
            <div class="customer-info">
              <div class="customer-name">{{ customer.name }}</div>
              <div class="customer-probability">
                转化概率: {{ customer.probability }}%
              </div>
            </div>
            <div class="probability-score">
              <van-progress
                :percentage="customer.probability"
                color="#67C23A"
                size="6"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { showToast } from 'vant'

interface ConversionStats {
  totalRate: number
  totalChange: number
  totalTrend: 'up' | 'down' | 'stable'
  convertedCount: number
  convertedChange: number
  convertedTrend: 'up' | 'down' | 'stable'
}

interface FunnelStage {
  name: string
  value: number
}

interface StageAnalysis {
  name: string
  customerCount: number
  conversionRate: number
  avgDuration: number
  bottleneck?: string
  suggestions: string[]
}

interface Feature {
  name: string
  icon: string
  color: string
  value: string
  description: string
  score: number
}

interface PredictionCustomer {
  id: string | number
  name: string
  avatar: string
  probability: number
}

interface PredictionData {
  expectedConversions: number
  accuracy: number
  likelyCustomers: PredictionCustomer[]
}

interface Props {
  conversionStats?: ConversionStats
  funnelStages?: FunnelStage[]
  stageAnalysis?: StageAnalysis[]
  highConversionFeatures?: Feature[]
  predictionData?: PredictionData
  selectedPeriod?: string
  loading?: boolean
  predictionLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  conversionStats: () => ({
    totalRate: 68.5,
    totalChange: 5.2,
    totalTrend: 'up',
    convertedCount: 127,
    convertedChange: -2.1,
    convertedTrend: 'down'
  }),
  funnelStages: () => [
    { name: '潜在客户', value: 500 },
    { name: '初步接触', value: 350 },
    { name: '深入沟通', value: 200 },
    { name: '方案展示', value: 120 },
    { name: '签约转化', value: 85 }
  ],
  stageAnalysis: () => [],
  highConversionFeatures: () => [],
  predictionData: () => ({
    expectedConversions: 15,
    accuracy: 78,
    likelyCustomers: []
  }),
  selectedPeriod: 'month',
  loading: false,
  predictionLoading: false
})

const emit = defineEmits<{
  'period-change': [period: string]
  'customer-click': [customer: PredictionCustomer]
  'view-all-features': []
  'refresh-prediction': []
}>()

// 响应式数据
const trendChartRef = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null
const activeStages = ref<string[]>([])

const periods = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本季', value: 'quarter' }
]

// 方法
const getTrendIcon = (trend: string): string => {
  const iconMap = {
    'up': 'arrow-up',
    'down': 'arrow-down',
    'stable': 'minus'
  }
  return iconMap[trend] || 'minus'
}

const getStageWidth = (value: number): number => {
  const maxValue = Math.max(...props.funnelStages.map(stage => stage.value))
  return (value / maxValue) * 90 // 90% 最大宽度
}

const getStageColor = (index: number): string => {
  const colors = [
    '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'
  ]
  return colors[index % colors.length]
}

const getStageRate = (index: number): number => {
  if (index === 0) return 100
  const current = props.funnelStages[index]?.value || 0
  const previous = props.funnelStages[index - 1]?.value || 1
  return Math.round((current / previous) * 100)
}

const initTrendChart = () => {
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)
  updateTrendChart()
}

const updateTrendChart = () => {
  if (!trendChart) return

  // 生成模拟数据
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  })

  const conversionData = dates.map(() => Math.floor(Math.random() * 20) + 5)

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
        color: '#666',
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10,
        color: '#666'
      }
    },
    series: [
      {
        name: '转化数量',
        type: 'line',
        data: conversionData,
        smooth: true,
        lineStyle: {
          color: '#409EFF',
          width: 2
        },
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ]
          }
        }
      }
    ]
  }

  trendChart.setOption(option)
}

const resizeChart = () => {
  if (trendChart) {
    trendChart.resize()
  }
}

const destroyChart = () => {
  if (trendChart) {
    trendChart.dispose()
    trendChart = null
  }
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    initTrendChart()
    window.addEventListener('resize', resizeChart)
  })
})

onUnmounted(() => {
  destroyChart()
  window.removeEventListener('resize', resizeChart)
})
</script>

<style lang="scss" scoped>
.customer-conversion {
  padding: var(--van-padding-sm);

  .conversion-overview {
    margin-bottom: var(--van-padding-md);

    .stat-card {
      background: white;
      border-radius: var(--van-border-radius-lg);
      padding: var(--van-padding-md);
      display: flex;
      align-items: center;
      gap: var(--van-padding-sm);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      &.primary {
        background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
        color: white;
      }

      &.success {
        background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
        color: white;
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: var(--van-font-size-xl);
          font-weight: var(--van-font-weight-bold);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: var(--van-font-size-sm);
          opacity: 0.9;
          margin-bottom: 4px;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: var(--van-font-size-xs);

          &.up {
            color: #67C23A;
          }

          &.down {
            color: #F56C6C;
          }

          &.stable {
            color: #E6A23C;
          }
        }
      }
    }
  }

  .conversion-funnel {
    margin-bottom: var(--van-padding-md);
    background: white;
    border-radius: var(--van-border-radius-lg);
    padding: var(--van-padding-md);

    .funnel-chart {
      margin: var(--van-padding-md) 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;

      .funnel-stage {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--van-padding-sm);
        border-radius: var(--van-border-radius-md);
        color: white;
        font-weight: var(--van-font-weight-medium);
        transition: all 0.3s ease;

        &:active {
          transform: scale(0.98);
        }

        .stage-info {
          text-align: center;

          .stage-name {
            font-size: var(--van-font-size-sm);
            margin-bottom: 2px;
          }

          .stage-value {
            font-size: var(--van-font-size-lg);
            font-weight: var(--van-font-weight-bold);
            margin-bottom: 2px;
          }

          .stage-rate {
            font-size: var(--van-font-size-xs);
            opacity: 0.9;
          }
        }
      }
    }

    .funnel-legend {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--van-padding-sm);

      .legend-item {
        display: flex;
        align-items: center;
        gap: var(--van-padding-xs);

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .legend-text {
          flex: 1;
          font-size: var(--van-font-size-sm);
          color: var(--van-text-color);
        }

        .legend-value {
          font-size: var(--van-font-size-sm);
          font-weight: var(--van-font-weight-bold);
          color: var(--van-text-color);
        }
      }
    }
  }

  .conversion-trend {
    margin-bottom: var(--van-padding-md);
    background: white;
    border-radius: var(--van-border-radius-lg);
    padding: var(--van-padding-md);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--van-padding-md);

      .section-title {
        margin: 0;
        font-size: var(--van-font-size-lg);
        font-weight: var(--van-font-weight-bold);
        color: var(--van-text-color);
      }
    }
  }

  .stage-analysis {
    margin-bottom: var(--van-padding-md);
    background: white;
    border-radius: var(--van-border-radius-lg);
    padding: var(--van-padding-md);

    .section-title {
      margin: 0 0 var(--van-padding-md) 0;
      font-size: var(--van-font-size-lg);
      font-weight: var(--van-font-weight-bold);
      color: var(--van-text-color);
    }

    .stage-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--van-padding-sm);
      margin-bottom: var(--van-padding-md);

      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--van-padding-xs);
        background: var(--van-background-color-light);
        border-radius: var(--van-border-radius-sm);

        .detail-label {
          font-size: var(--van-font-size-sm);
          color: var(--van-text-color-2);
        }

        .detail-value {
          font-size: var(--van-font-size-sm);
          font-weight: var(--van-font-weight-bold);
          color: var(--van-text-color);
        }
      }
    }

    .stage-improvements {
      h4 {
        margin: 0 0 var(--van-padding-sm) 0;
        font-size: var(--van-font-size-md);
        color: var(--van-text-color);
      }

      ul {
        margin: 0;
        padding-left: var(--van-padding-md);

        li {
          font-size: var(--van-font-size-sm);
          color: var(--van-text-color-2);
          margin-bottom: var(--van-padding-xs);
        }
      }
    }
  }

  .high-conversion-features {
    margin-bottom: var(--van-padding-md);
    background: white;
    border-radius: var(--van-border-radius-lg);
    padding: var(--van-padding-md);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--van-padding-md);

      .section-title {
        margin: 0;
        font-size: var(--van-font-size-lg);
        font-weight: var(--van-font-weight-bold);
        color: var(--van-text-color);
      }
    }

    .features-grid {
      display: grid;
      gap: var(--van-padding-sm);

      .feature-item {
        display: flex;
        align-items: center;
        gap: var(--van-padding-sm);
        padding: var(--van-padding-sm);
        background: var(--van-background-color-light);
        border-radius: var(--van-border-radius-md);

        .feature-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: var(--van-border-radius-md);
        }

        .feature-content {
          flex: 1;

          .feature-name {
            font-size: var(--van-font-size-md);
            font-weight: var(--van-font-weight-bold);
            color: var(--van-text-color);
            margin-bottom: 2px;
          }

          .feature-value {
            font-size: var(--van-font-size-sm);
            color: var(--van-primary-color);
            margin-bottom: 2px;
          }

          .feature-desc {
            font-size: var(--van-font-size-xs);
            color: var(--van-text-color-2);
          }
        }

        .feature-score {
          width: 40px;
        }
      }
    }
  }

  .conversion-prediction {
    background: white;
    border-radius: var(--van-border-radius-lg);
    padding: var(--van-padding-md);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--van-padding-md);

      .section-title {
        margin: 0;
        font-size: var(--van-font-size-lg);
        font-weight: var(--van-font-weight-bold);
        color: var(--van-text-color);
      }
    }

    .prediction-content {
      .prediction-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--van-padding-sm);
        margin-bottom: var(--van-padding-md);

        .prediction-item {
          text-align: center;
          padding: var(--van-padding-md);
          background: var(--van-background-color-light);
          border-radius: var(--van-border-radius-md);

          .prediction-label {
            font-size: var(--van-font-size-sm);
            color: var(--van-text-color-2);
            margin-bottom: var(--van-padding-xs);
          }

          .prediction-value {
            font-size: var(--van-font-size-xl);
            font-weight: var(--van-font-weight-bold);
            color: var(--van-primary-color);
          }
        }
      }

      .prediction-list {
        h4 {
          margin: 0 0 var(--van-padding-sm) 0;
          font-size: var(--van-font-size-md);
          color: var(--van-text-color);
        }

        .prediction-customer {
          display: flex;
          align-items: center;
          gap: var(--van-padding-sm);
          padding: var(--van-padding-sm);
          background: var(--van-background-color-light);
          border-radius: var(--van-border-radius-md);
          margin-bottom: var(--van-padding-xs);

          &:last-child {
            margin-bottom: 0;
          }

          &:active {
            background: var(--van-cell-active-color);
          }

          .customer-info {
            flex: 1;

            .customer-name {
              font-size: var(--van-font-size-sm);
              font-weight: var(--van-font-weight-bold);
              color: var(--van-text-color);
              margin-bottom: 2px;
            }

            .customer-probability {
              font-size: var(--van-font-size-xs);
              color: var(--van-text-color-2);
            }
          }

          .probability-score {
            width: 60px;
          }
        }
      }
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .customer-conversion {
    .conversion-funnel,
    .conversion-trend,
    .stage-analysis,
    .high-conversion-features,
    .conversion-prediction {
      background: var(--van-background-color-dark);

      .stage-details .detail-row,
      .feature-item,
      .prediction-item,
      .prediction-customer {
        background: var(--van-background-color);
      }
    }
  }
}
</style>