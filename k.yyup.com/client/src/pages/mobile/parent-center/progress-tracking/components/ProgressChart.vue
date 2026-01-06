<template>
  <div class="progress-chart-container">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
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

    <!-- 图表容器 -->
    <div class="chart-wrapper">
      <div
        ref="chartRef"
        class="progress-chart"
        :style="{ height: chartHeight + 'px' }"
      ></div>
    </div>

    <!-- 统计信息 -->
    <div class="chart-stats">
      <van-grid :column-num="3" :gutter="8">
        <van-grid-item v-for="stat in stats" :key="stat.label">
          <div class="stat-item">
            <div class="stat-value" :style="{ color: stat.color }">
              {{ stat.value }}
            </div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- 详细数据 -->
    <div class="chart-details" v-if="showDetails">
      <van-cell-group inset>
        <van-cell
          v-for="detail in details"
          :key="detail.label"
          :title="detail.label"
          :value="detail.value"
          :icon="detail.trend === 'up' ? 'arrow-up' : detail.trend === 'down' ? 'arrow-down' : 'minus'"
        />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { showToast } from 'vant'

interface ChartData {
  label: string
  value: number
  color?: string
}

interface ChartStat {
  label: string
  value: string | number
  color: string
}

interface ChartDetail {
  label: string
  value: string
  trend?: 'up' | 'down' | 'stable'
}

interface Props {
  title?: string
  data: ChartData[]
  height?: number
  showDetails?: boolean
  selectedPeriod?: string
  periods?: Array<{ label: string; value: string }>
  stats?: ChartStat[]
  details?: ChartDetail[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '成长进度图表',
  height: 300,
  showDetails: true,
  selectedPeriod: 'week',
  periods: () => [
    { label: '本周', value: 'week' },
    { label: '本月', value: 'month' },
    { label: '本学期', value: 'semester' }
  ],
  stats: () => [],
  details: () => [],
  loading: false
})

const emit = defineEmits<{
  'period-change': [period: string]
  'chart-click': [data: any]
}>()

// 响应式数据
const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null
const chartHeight = ref(props.height)

// 方法
const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  updateChart()
}

const updateChart = () => {
  if (!chartInstance || !props.data?.length) return

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      confine: true,
      formatter: (params: any) => {
        const data = params[0]
        return `${data.name}<br/>进度: ${data.value}%`
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      top: '10%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.data.map(item => item.label),
      axisLabel: {
        rotate: 45,
        fontSize: 10,
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%',
        fontSize: 10,
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f5f5f5'
        }
      }
    },
    series: [
      {
        name: '进度',
        type: 'bar',
        data: props.data.map((item, index) => ({
          value: item.value,
          itemStyle: {
            color: item.color || getChartColor(index)
          }
        })),
        barWidth: '60%',
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

  chartInstance.setOption(option, true)

  // 添加点击事件
  chartInstance.on('click', (params: any) => {
    emit('chart-click', params)
  })
}

const getChartColor = (index: number): string => {
  const colors = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
    '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
  ]
  return colors[index % colors.length]
}

const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
}

// 监听数据变化
watch(
  () => props.data,
  () => {
    nextTick(() => {
      updateChart()
    })
  },
  { deep: true }
)

watch(
  () => props.height,
  (newHeight) => {
    chartHeight.value = newHeight
    nextTick(() => {
      resizeChart()
    })
  }
)

// 生命周期
onMounted(() => {
  nextTick(() => {
    initChart()
    window.addEventListener('resize', resizeChart)
  })
})

onUnmounted(() => {
  destroyChart()
  window.removeEventListener('resize', resizeChart)
})

// 监听loading状态
watch(
  () => props.loading,
  (loading) => {
    if (chartRef.value) {
      if (loading) {
        chartRef.value.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100%;"><van-loading type="spinner" size="24px" /></div>'
      } else {
        nextTick(() => {
          initChart()
        })
      }
    }
  }
)
</script>

<style lang="scss" scoped>
.progress-chart-container {
  background: white;
  border-radius: var(--van-border-radius-lg);
  padding: var(--van-padding-md);
  margin-bottom: var(--van-padding-md);

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

  .chart-wrapper {
    margin-bottom: var(--van-padding-md);

    .progress-chart {
      width: 100%;
      min-height: 200px;
    }
  }

  .chart-stats {
    margin-bottom: var(--van-padding-md);

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: var(--van-font-size-lg);
        font-weight: var(--van-font-weight-bold);
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: var(--van-font-size-xs);
        color: var(--van-text-color-2);
      }
    }
  }

  .chart-details {
    .van-cell {
      .van-cell__value {
        color: var(--van-text-color);
        font-weight: var(--van-font-weight-medium);
      }

      .van-icon {
        color: var(--van-success-color);

        &.van-icon-arrow-down {
          color: var(--van-danger-color);
        }

        &.van-icon-minus {
          color: var(--van-warning-color);
        }
      }
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .progress-chart-container {
    background: var(--van-background-color-dark);

    .chart-header {
      .chart-title {
        color: var(--van-text-color);
      }
    }

    .chart-stats {
      .stat-item {
        .stat-label {
          color: var(--van-text-color-2);
        }
      }
    }

    .chart-details {
      .van-cell {
        background: var(--van-background-color);
        border-color: var(--van-border-color);

        .van-cell__value {
          color: var(--van-text-color);
        }

        .van-cell__title {
          color: var(--van-text-color);
        }
      }
    }
  }
}

// 小屏幕适配
@media (max-width: 375px) {
  .progress-chart-container {
    padding: var(--van-padding-sm);
    margin-bottom: var(--van-padding-sm);

    .chart-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--van-padding-sm);

      .chart-title {
        font-size: var(--van-font-size-md);
      }

      .chart-actions {
        width: 100%;
        justify-content: space-between;

        .van-button {
          flex: 1;
        }
      }
    }

    .chart-wrapper {
      .progress-chart {
        min-height: 150px;
      }
    }
  }
}

// 大屏幕适配
@media (min-width: 768px) {
  .progress-chart-container {
    max-width: 800px;
    margin: 0 auto var(--van-padding-md);

    .chart-wrapper {
      .progress-chart {
        min-height: 300px;
      }
    }
  }
}
</style>