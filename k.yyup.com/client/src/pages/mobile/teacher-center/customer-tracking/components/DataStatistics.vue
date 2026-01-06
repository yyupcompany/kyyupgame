<template>
  <div class="mobile-data-statistics">
    <van-cell-group inset class="stats-header">
      <template #title>
        <div class="section-title">
          <van-icon name="chart-trending-o" />
          <span>数据统计</span>
        </div>
      </template>
    </van-cell-group>

    <!-- 统计概览卡片 -->
    <div class="stats-overview">
      <van-grid :border="false" :column-num="2">
        <van-grid-item v-for="stat in overviewStats" :key="stat.key">
          <div class="stat-card" :class="stat.type">
            <div class="stat-icon">
              <van-icon :name="stat.icon" size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div v-if="stat.trend" class="stat-trend">
                <van-icon :name="stat.trend.icon" :color="stat.trend.color" size="12" />
                <span :style="{ color: stat.trend.color }">{{ stat.trend.text }}</span>
              </div>
            </div>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- 沟通频率统计 -->
    <van-cell-group inset class="chart-section">
      <template #title>
        <div class="chart-title">
          <van-icon name="phone-o" />
          <span>沟通频率</span>
          <span class="chart-period">最近30天</span>
        </div>
      </template>
      <div class="chart-container">
        <div ref="frequencyChart" class="frequency-chart"></div>
      </div>
    </van-cell-group>

    <!-- 情感分析统计 -->
    <van-cell-group inset class="chart-section">
      <template #title>
        <div class="chart-title">
          <van-icon name="smile-o" />
          <span>情感分析</span>
          <span class="chart-period">最近30天</span>
        </div>
      </template>
      <div class="chart-container">
        <div ref="sentimentChart" class="sentiment-chart"></div>
      </div>
    </van-cell-group>

    <!-- 跟进效果统计 -->
    <van-cell-group inset class="chart-section">
      <template #title>
        <div class="chart-title">
          <van-icon name="bar-chart-o" />
          <span>跟进效果</span>
          <span class="chart-period">最近30天</span>
        </div>
      </template>
      <div class="chart-container">
        <div ref="effectChart" class="effect-chart"></div>
      </div>
    </van-cell-group>

    <!-- 详细数据表格 -->
    <van-cell-group inset class="data-table-section">
      <template #title>
        <div class="table-title">
          <van-icon name="description" />
          <span>详细数据</span>
        </div>
      </template>

      <div class="data-table">
        <van-row class="table-header">
          <van-col span="6">指标</van-col>
          <van-col span="6">数值</van-col>
          <van-col span="6">环比</van-col>
          <van-col span="6">趋势</van-col>
        </van-row>

        <van-row
          v-for="(item, index) in detailData"
          :key="index"
          class="table-row"
          :class="{ 'highlight': item.highlight }"
        >
          <van-col span="6" class="metric-name">{{ item.metric }}</van-col>
          <van-col span="6" class="metric-value">{{ item.value }}</van-col>
          <van-col span="6" class="metric-compare">
            <span :style="{ color: item.compareColor }">{{ item.compare }}</span>
          </van-col>
          <van-col span="6" class="metric-trend">
            <van-icon :name="item.trendIcon" :color="item.trendColor" size="16" />
          </van-col>
        </van-row>
      </div>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

interface Props {
  customerId: string
  period?: string
}

const props = withDefaults(defineProps<Props>(), {
  period: '30d'
})

const frequencyChart = ref<HTMLElement>()
const sentimentChart = ref<HTMLElement>()
const effectChart = ref<HTMLElement>()

// 概览统计数据
const overviewStats = ref([
  {
    key: 'total_contacts',
    label: '总联系次数',
    value: 156,
    icon: 'phone-o',
    type: 'primary',
    trend: {
      icon: 'arrow-up',
      text: '+12.5%',
      color: '#07c160'
    }
  },
  {
    key: 'response_rate',
    label: '响应率',
    value: '78.5%',
    icon: 'chat-o',
    type: 'success',
    trend: {
      icon: 'arrow-up',
      text: '+5.2%',
      color: '#07c160'
    }
  },
  {
    key: 'avg_sentiment',
    label: '平均情感分',
    value: 8.2,
    icon: 'smile-o',
    type: 'warning',
    trend: {
      icon: 'arrow-down',
      text: '-1.8%',
      color: '#ee0a24'
    }
  },
  {
    key: 'conversion_rate',
    label: '转化率',
    value: '23.4%',
    icon: 'medal-o',
    type: 'danger',
    trend: {
      icon: 'arrow-up',
      text: '+3.1%',
      color: '#07c160'
    }
  }
])

// 详细数据表格
const detailData = ref([
  {
    metric: '电话沟通',
    value: 45,
    compare: '+8.2%',
    compareColor: '#07c160',
    trendIcon: 'arrow-up',
    trendColor: '#07c160',
    highlight: false
  },
  {
    metric: '微信沟通',
    value: 89,
    compare: '+15.3%',
    compareColor: '#07c160',
    trendIcon: 'arrow-up',
    trendColor: '#07c160',
    highlight: true
  },
  {
    metric: '上门拜访',
    value: 12,
    compare: '-5.1%',
    compareColor: '#ee0a24',
    trendIcon: 'arrow-down',
    trendColor: '#ee0a24',
    highlight: false
  },
  {
    metric: '试听邀请',
    value: 28,
    compare: '+12.7%',
    compareColor: '#07c160',
    trendIcon: 'arrow-up',
    trendColor: '#07c160',
    highlight: false
  },
  {
    metric: '成功转化',
    value: 23,
    compare: '+3.1%',
    compareColor: '#07c160',
    trendIcon: 'arrow-up',
    trendColor: '#07c160',
    highlight: true
  }
])

// 初始化图表
const initCharts = async () => {
  await nextTick()

  // TODO: 集成图表库（如ECharts或轻量级图表库）
  // 这里使用简单的占位内容代替

  if (frequencyChart.value) {
    frequencyChart.value.innerHTML = `
      <div class="simple-chart">
        <div class="chart-bars">
          <div class="bar" style="height: 60%"></div>
          <div class="bar" style="height: 80%"></div>
          <div class="bar" style="height: 45%"></div>
          <div class="bar" style="height: 90%"></div>
          <div class="bar" style="height: 70%"></div>
          <div class="bar" style="height: 85%"></div>
          <div class="bar" style="height: 55%"></div>
        </div>
        <div class="chart-labels">
          <span>周一</span>
          <span>周二</span>
          <span>周三</span>
          <span>周四</span>
          <span>周五</span>
          <span>周六</span>
          <span>周日</span>
        </div>
      </div>
    `
  }

  if (sentimentChart.value) {
    sentimentChart.value.innerHTML = `
      <div class="sentiment-distribution">
        <div class="sentiment-item positive">
          <div class="sentiment-bar" style="width: 65%"></div>
          <span class="sentiment-label">积极 65%</span>
        </div>
        <div class="sentiment-item neutral">
          <div class="sentiment-bar" style="width: 25%"></div>
          <span class="sentiment-label">中性 25%</span>
        </div>
        <div class="sentiment-item negative">
          <div class="sentiment-bar" style="width: 10%"></div>
          <span class="sentiment-label">消极 10%</span>
        </div>
      </div>
    `
  }

  if (effectChart.value) {
    effectChart.value.innerHTML = `
      <div class="effect-metrics">
        <div class="effect-metric">
          <div class="metric-circle" data-value="78">78%</div>
          <span class="metric-name">跟进效率</span>
        </div>
        <div class="effect-metric">
          <div class="metric-circle" data-value="82">82%</div>
          <span class="metric-name">客户满意度</span>
        </div>
        <div class="effect-metric">
          <div class="metric-circle" data-value="65">65%</div>
          <span class="metric-name">目标达成</span>
        </div>
      </div>
    `
  }
}

onMounted(() => {
  initCharts()
})
</script>

<style scoped lang="scss">
.mobile-data-statistics {
  background: var(--van-background-color);
  padding: var(--van-padding-sm);

  .section-title {
    display: flex;
    align-items: center;
    gap: var(--van-padding-xs);
    font-weight: 600;
    font-size: var(--van-font-size-lg);
  }

  .stats-overview {
    margin-bottom: var(--van-padding-sm);

    .stat-card {
      background: white;
      border-radius: var(--van-border-radius-lg);
      padding: var(--van-padding-md);
      box-shadow: 0 2px 8px rgba(100, 101, 102, 0.08);
      display: flex;
      align-items: center;
      gap: var(--van-padding-md);
      transition: transform 0.2s ease;

      &:active {
        transform: scale(0.98);
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--van-primary-color);
        color: white;
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--van-text-color);
          margin-bottom: 2px;
        }

        .stat-label {
          font-size: var(--van-font-size-sm);
          color: var(--van-gray-6);
          margin-bottom: 4px;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: var(--van-font-size-xs);
        }
      }

      &.primary .stat-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.success .stat-icon {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.warning .stat-icon {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      }

      &.danger .stat-icon {
        background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
      }
    }
  }

  .chart-section {
    margin-bottom: var(--van-padding-sm);

    :deep(.van-cell-group__title) {
      margin-bottom: var(--van-padding-xs);
    }

    .chart-title {
      display: flex;
      align-items: center;
      gap: var(--van-padding-xs);
      font-weight: 600;
      font-size: var(--van-font-size-md);

      .chart-period {
        margin-left: auto;
        font-size: var(--van-font-size-xs);
        color: var(--van-gray-6);
        font-weight: 400;
      }
    }

    .chart-container {
      background: white;
      border-radius: var(--van-border-radius-md);
      padding: var(--van-padding-md);
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .data-table-section {
    .table-title {
      display: flex;
      align-items: center;
      gap: var(--van-padding-xs);
      font-weight: 600;
      font-size: var(--van-font-size-md);
    }

    .data-table {
      background: white;
      border-radius: var(--van-border-radius-md);
      overflow: hidden;

      .table-header {
        background: var(--van-gray-1);
        font-weight: 600;
        padding: var(--van-padding-sm) 0;
        border-bottom: 1px solid var(--van-border-color);

        .van-col {
          text-align: center;
          font-size: var(--van-font-size-sm);
          color: var(--van-gray-7);
        }
      }

      .table-row {
        padding: var(--van-padding-md) 0;
        border-bottom: 1px solid var(--van-border-color-light);
        transition: background-color 0.2s ease;

        &:last-child {
          border-bottom: none;
        }

        &.highlight {
          background: rgba(25, 137, 250, 0.05);
        }

        .van-col {
          text-align: center;
          font-size: var(--van-font-size-sm);

          &.metric-name {
            color: var(--van-gray-8);
            font-weight: 500;
          }

          &.metric-value {
            color: var(--van-text-color);
            font-weight: 600;
          }

          &.metric-compare {
            font-weight: 500;
          }
        }
      }
    }
  }
}

// 简单图表样式
.simple-chart {
  width: 100%;
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .chart-bars {
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    height: 120px;

    .bar {
      width: 20px;
      background: linear-gradient(to top, #1989fa, #66b3ff);
      border-radius: 2px 2px 0 0;
    }
  }

  .chart-labels {
    display: flex;
    justify-content: space-around;
    font-size: var(--text-xs);
    color: var(--van-gray-6);
  }
}

.sentiment-distribution {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);

  .sentiment-item {
    position: relative;

    .sentiment-bar {
      height: 8px;
      border-radius: 4px;
      background: var(--van-gray-3);
    }

    &.positive .sentiment-bar {
      background: linear-gradient(to right, #07c160, #95ec9e);
    }

    &.neutral .sentiment-bar {
      background: linear-gradient(to right, #ff976a, #ffcc99);
    }

    &.negative .sentiment-bar {
      background: linear-gradient(to right, #ee0a24, #ff7875);
    }

    .sentiment-label {
      position: absolute;
      right: 0;
      top: -20px;
      font-size: var(--text-xs);
      color: var(--van-gray-6);
    }
  }
}

.effect-metrics {
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;

  .effect-metric {
    text-align: center;

    .metric-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: conic-gradient(#1989fa 0deg 280deg, #e8f4ff 280deg 360deg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-xs);
      font-weight: 600;
      color: #1989fa;
      margin: 0 auto 8px;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        width: 45px;
        height: 45px;
        background: white;
        border-radius: 50%;
      }

      &::after {
        content: attr(data-value);
        position: relative;
        z-index: 1;
      }
    }

    .metric-name {
      font-size: var(--text-xs);
      color: var(--van-gray-6);
    }
  }
}

/* 暗黑模式适配 */
:deep([data-theme="dark"]) {
  .mobile-data-statistics {
    .stat-card {
      background: var(--van-background-color-dark);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .chart-container,
    .data-table .table-header {
      background: var(--van-background-color-dark);
    }

    .data-table .table-row {
      background: var(--van-background-color-dark);
      border-color: var(--van-border-color-dark);

      &.highlight {
        background: rgba(25, 137, 250, 0.1);
      }
    }
  }
}
</style>