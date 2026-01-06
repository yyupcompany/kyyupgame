<template>
  <div class="mobile-conversion-funnel">
    <!-- 头部 -->
    <div class="funnel-header">
      <div class="header-title">
        <el-icon><TrendCharts /></el-icon>
        <span>转化漏斗分析</span>
      </div>
      <el-select
        v-model="timeRange"
        @change="handleTimeRangeChange"
        size="small"
        style="width: 100px"
      >
        <el-option label="本周" value="week" />
        <el-option label="本月" value="month" />
        <el-option label="本季度" value="quarter" />
        <el-option label="本年" value="year" />
      </el-select>
    </div>

    <!-- 移动端漏斗可视化 -->
    <div class="mobile-funnel-visualization">
      <div class="funnel-stages">
        <div
          v-for="(stage, index) in conversionData"
          :key="stage.stage"
          class="funnel-stage"
          :style="getStageStyle(index, stage.count)"
        >
          <div class="stage-info">
            <div class="stage-name">{{ stage.stage }}</div>
            <div class="stage-count">{{ stage.count }}人</div>
          </div>
          <div class="stage-percentage">{{ stage.rate }}%</div>
          <div class="conversion-rate">
            {{ getConversionText(stage, index) }}
          </div>
        </div>
      </div>

      <!-- 转化率统计卡片 -->
      <div class="conversion-stats">
        <div class="stat-item">
          <div class="stat-value">{{ overallConversionRate }}%</div>
          <div class="stat-label">总体转化率</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ totalLeads }}</div>
          <div class="stat-label">总潜在客户</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ conversionCount }}</div>
          <div class="stat-label">成功转化</div>
        </div>
      </div>
    </div>

    <!-- 转化详情表格 -->
    <div class="conversion-details">
      <div class="section-title">
        <el-icon><List /></el-icon>
        <span>转化详情</span>
      </div>

      <div class="detail-cards">
        <div
          v-for="(stage, index) in conversionData"
          :key="stage.stage"
          class="detail-card"
        >
          <div class="card-header">
            <div class="stage-icon" :style="{ backgroundColor: getStageColor(index) }">
              {{ index + 1 }}
            </div>
            <div class="stage-info">
              <div class="stage-title">{{ stage.stage }}</div>
              <div class="stage-desc">{{ stage.description }}</div>
            </div>
          </div>
          <div class="card-stats">
            <div class="stat">
              <span class="label">数量</span>
              <span class="value">{{ stage.count }}</span>
            </div>
            <div class="stat">
              <span class="label">转化率</span>
              <span class="value" :class="getRateClass(stage.rate)">
                {{ stage.rate }}%
              </span>
            </div>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{
                width: `${stage.rate}%`,
                backgroundColor: getStageColor(index)
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 转化趋势 -->
    <div class="conversion-trend">
      <div class="section-title">
        <el-icon><DataLine /></el-icon>
        <span>转化趋势</span>
      </div>

      <div class="trend-chart-container">
        <div class="trend-summary">
          <div
            v-for="trend in trendData"
            :key="trend.period"
            class="trend-item"
          >
            <div class="trend-period">{{ trend.period }}</div>
            <div class="trend-value">{{ trend.value }}%</div>
            <div class="trend-change" :class="trend.change > 0 ? 'positive' : 'negative'">
              <el-icon>
                <CaretTop v-if="trend.change > 0" />
                <CaretBottom v-else />
              </el-icon>
              {{ Math.abs(trend.change) }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 改进建议 -->
    <div class="improvement-suggestions" v-if="suggestions.length > 0">
      <div class="section-title">
        <el-icon><Lightbulb /></el-icon>
        <span>改进建议</span>
      </div>

      <div class="suggestions-list">
        <div
          v-for="suggestion in suggestions"
          :key="suggestion.id"
          class="suggestion-card"
          :class="suggestion.type"
        >
          <div class="suggestion-header">
            <el-icon>
              <Warning v-if="suggestion.type === 'warning'" />
              <SuccessFilled v-else-if="suggestion.type === 'success'" />
              <InfoFilled v-else />
            </el-icon>
            <span class="suggestion-title">{{ suggestion.title }}</span>
          </div>
          <div class="suggestion-content">{{ suggestion.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ElIcon,
  ElSelect,
  ElOption
} from 'element-plus'
import {
  TrendCharts,
  List,
  DataLine,
  Lightbulb,
  Warning,
  SuccessFilled,
  InfoFilled,
  CaretTop,
  CaretBottom
} from '@element-plus/icons-vue'

// Props
interface ConversionStage {
  stage: string
  count: number
  rate: number
  description: string
}

interface Suggestion {
  id: string
  title: string
  description: string
  type: 'success' | 'warning' | 'info' | 'error'
}

interface TrendData {
  period: string
  value: number
  change: number
}

interface Props {
  loading?: boolean
  funnelData?: {
    stages: Array<{
      stage: string
      count: number
      percentage: number
      color: string
    }>
    conversionRate: number
    totalLeads: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  funnelData: undefined
})

const emit = defineEmits<{
  'time-range-change': [timeRange: string]
}>()

const timeRange = ref('month')

// 转化数据
const conversionData = computed<ConversionStage[]>(() => {
  if (props.funnelData && props.funnelData.stages.length > 0) {
    return props.funnelData.stages.map((stage, index, array) => ({
      stage: stage.stage,
      count: stage.count,
      rate: stage.percentage,
      description: getStageDescription(stage.stage)
    }))
  }

  // 默认模拟数据
  return [
    { stage: '潜在客户', count: 150, rate: 100, description: '通过各种渠道获得的潜在客户' },
    { stage: '初次接触', count: 120, rate: 80, description: '成功建立初次联系的客户' },
    { stage: '深度沟通', count: 90, rate: 75, description: '进行深度需求沟通的客户' },
    { stage: '意向确认', count: 60, rate: 67, description: '明确表达入园意向的客户' },
    { stage: '试听体验', count: 45, rate: 75, description: '参与试听或体验活动的客户' },
    { stage: '签约成交', count: 30, rate: 67, description: '最终签约入园的客户' }
  ]
})

// 趋势数据
const trendData = computed<TrendData[]>(() => [
  { period: '第1周', value: 18, change: 0 },
  { period: '第2周', value: 22, change: 22 },
  { period: '第3周', value: 25, change: 14 },
  { period: '第4周', value: 20, change: -20 }
])

// 统计数据
const overallConversionRate = computed(() => {
  if (props.funnelData?.conversionRate) {
    return props.funnelData.conversionRate
  }
  const firstStage = conversionData.value[0]
  const lastStage = conversionData.value[conversionData.value.length - 1]
  return firstStage && lastStage ? Math.round((lastStage.count / firstStage.count) * 100) : 0
})

const totalLeads = computed(() => {
  if (props.funnelData?.totalLeads) {
    return props.funnelData.totalLeads
  }
  return conversionData.value[0]?.count || 0
})

const conversionCount = computed(() => {
  const lastStage = conversionData.value[conversionData.value.length - 1]
  return lastStage?.count || 0
})

// 改进建议
const suggestions = ref<Suggestion[]>([
  {
    id: '1',
    title: '提高初次接触转化率',
    description: '当前初次接触转化率为80%，建议优化首次沟通话术，提高客户响应率',
    type: 'warning'
  },
  {
    id: '2',
    title: '加强试听体验环节',
    description: '试听体验转化率较高(75%)，建议增加试听活动频次，提供更多体验机会',
    type: 'success'
  },
  {
    id: '3',
    title: '优化签约流程',
    description: '意向确认到签约的转化率偏低(67%)，建议简化签约流程，提供更多优惠政策',
    type: 'info'
  }
])

// 方法
function handleTimeRangeChange() {
  emit('time-range-change', timeRange.value)
}

function getStageDescription(stage: string) {
  const descriptions = {
    '潜在客户': '通过各种渠道获得的潜在客户',
    '已联系': '成功建立初次联系的客户',
    '有意向': '进行深度需求沟通的客户',
    '跟进中': '明确表达入园意向的客户',
    '已转化': '最终签约入园的客户'
  }
  return descriptions[stage] || '客户转化阶段'
}

function getRateClass(rate: number) {
  if (rate >= 80) return 'rate-high'
  if (rate >= 60) return 'rate-medium'
  return 'rate-low'
}

function getStageStyle(index: number, count: number) {
  const maxCount = conversionData.value[0]?.count || 1
  const percentage = (count / maxCount) * 100
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#B37FEB']

  return {
    width: `${Math.max(percentage, 10)}%`,
    backgroundColor: colors[index % colors.length]
  }
}

function getStageColor(index: number) {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#B37FEB']
  return colors[index % colors.length]
}

function getConversionText(stage: ConversionStage, index: number) {
  if (index === 0) return '起始阶段'

  const prevStage = conversionData.value[index - 1]
  if (prevStage) {
    const conversionRate = Math.round((stage.count / prevStage.count) * 100)
    return `环比转化 ${conversionRate}%`
  }

  return ''
}
</script>

<style scoped lang="scss">
.mobile-conversion-funnel {
  padding: var(--spacing-md);
  background: var(--bg-color-page);

  .funnel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);

    .header-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--font-size-large);
      font-weight: 600;
      color: var(--text-primary);

      .el-icon {
        color: var(--primary-color);
      }
    }
  }

  // 移动端漏斗可视化
  .mobile-funnel-visualization {
    margin-bottom: var(--spacing-xl);

    .funnel-stages {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-xs);
      margin-bottom: var(--spacing-lg);

      .funnel-stage {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-sm) var(--spacing-md);
        color: white;
        font-weight: 500;
        border-radius: var(--border-radius-base);
        min-height: 44px;
        transition: all 0.3s ease;

        .stage-info {
          display: flex;
          flex-direction: column;
          gap: 2px;

          .stage-name {
            font-size: var(--font-size-base);
            font-weight: 600;
          }

          .stage-count {
            font-size: var(--font-size-small);
            opacity: 0.9;
          }
        }

        .stage-percentage {
          font-size: var(--font-size-large);
          font-weight: 700;
        }

        .conversion-rate {
          font-size: var(--font-size-small);
          opacity: 0.9;
        }
      }
    }

    .conversion-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-sm);
      margin-top: var(--spacing-lg);

      .stat-item {
        background: white;
        border: 1px solid var(--border-color-lighter);
        border-radius: var(--border-radius-lg);
        padding: var(--spacing-md);
        text-align: center;

        .stat-value {
          font-size: var(--font-size-large);
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          font-size: var(--font-size-small);
          color: var(--text-secondary);
        }
      }
    }
  }

  // 通用标题样式
  .section-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
    font-size: var(--font-size-large);
    font-weight: 600;
    color: var(--text-primary);

    .el-icon {
      color: var(--primary-color);
    }
  }

  // 转化详情
  .conversion-details {
    margin-bottom: var(--spacing-xl);

    .detail-cards {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);

      .detail-card {
        background: white;
        border: 1px solid var(--border-color-lighter);
        border-radius: var(--border-radius-lg);
        padding: var(--spacing-md);

        .card-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-sm);

          .stage-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: var(--font-size-small);
          }

          .stage-info {
            flex: 1;

            .stage-title {
              font-weight: 600;
              color: var(--text-primary);
              margin-bottom: 2px;
            }

            .stage-desc {
              font-size: var(--font-size-small);
              color: var(--text-secondary);
            }
          }
        }

        .card-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--spacing-sm);

          .stat {
            display: flex;
            flex-direction: column;
            align-items: center;

            .label {
              font-size: var(--font-size-small);
              color: var(--text-secondary);
              margin-bottom: 2px;
            }

            .value {
              font-size: var(--font-size-base);
              font-weight: 600;
              color: var(--text-primary);

              &.rate-high {
                color: var(--success-color);
              }

              &.rate-medium {
                color: var(--warning-color);
              }

              &.rate-low {
                color: var(--danger-color);
              }
            }
          }
        }

        .progress-bar {
          height: 6px;
          background: var(--border-color-lighter);
          border-radius: 3px;
          overflow: hidden;

          .progress-fill {
            height: 100%;
            border-radius: 3px;
            transition: width 0.3s ease;
          }
        }
      }
    }
  }

  // 转化趋势
  .conversion-trend {
    margin-bottom: var(--spacing-xl);

    .trend-chart-container {
      .trend-summary {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--spacing-sm);

        .trend-item {
          background: white;
          border: 1px solid var(--border-color-lighter);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-sm);
          text-align: center;

          .trend-period {
            font-size: var(--font-size-small);
            color: var(--text-secondary);
            margin-bottom: var(--spacing-xs);
          }

          .trend-value {
            font-size: var(--font-size-base);
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--spacing-xs);
          }

          .trend-change {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2px;
            font-size: var(--font-size-small);

            &.positive {
              color: var(--success-color);
            }

            &.negative {
              color: var(--danger-color);
            }
          }
        }
      }
    }
  }

  // 改进建议
  .improvement-suggestions {
    .suggestions-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);

      .suggestion-card {
        background: white;
        border: 1px solid var(--border-color-lighter);
        border-radius: var(--border-radius-lg);
        padding: var(--spacing-md);

        &.warning {
          border-left: 4px solid var(--warning-color);
        }

        &.success {
          border-left: 4px solid var(--success-color);
        }

        &.info {
          border-left: 4px solid var(--info-color);
        }

        .suggestion-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-sm);

          .el-icon {
            &.warning {
              color: var(--warning-color);
            }

            &.success {
              color: var(--success-color);
            }

            &.info {
              color: var(--info-color);
            }
          }

          .suggestion-title {
            font-weight: 600;
            color: var(--text-primary);
          }
        }

        .suggestion-content {
          color: var(--text-regular);
          line-height: 1.5;
          font-size: var(--font-size-small);
        }
      }
    }
  }
}

// 移动端响应式
@media (max-width: var(--breakpoint-md)) {
  .mobile-conversion-funnel {
    padding: var(--spacing-sm);

    .conversion-stats {
      .stat-item {
        padding: var(--spacing-sm) var(--spacing-xs);

        .stat-value {
          font-size: var(--font-size-base);
        }

        .stat-label {
          font-size: var(--text-xs);
        }
      }
    }

    .conversion-details {
      .detail-cards {
        .detail-card {
          padding: var(--spacing-sm);

          .card-header {
            .stage-icon {
              width: 28px;
              height: 28px;
            }
          }
        }
      }
    }

    .conversion-trend {
      .trend-summary {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
}
</style>