<template>
  <div class="attendance-trends-tab">
    <!-- 趋势图表 -->
    <div class="trends-chart">
      <div class="chart-header">
        <h3>考勤趋势分析</h3>
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
      <div class="chart-container">
        <div ref="chartRef" style="height: 250px"></div>
      </div>
    </div>

    <!-- 趋势分析 -->
    <div class="trends-analysis">
      <h4>趋势分析</h4>
      <div class="analysis-content">
        <div class="analysis-item positive">
          <van-icon name="arrow-up" color="#67C23A" />
          <span>出勤率呈上升趋势</span>
        </div>
        <div class="analysis-item negative">
          <van-icon name="arrow-down" color="#F56C6C" />
          <span>迟到现象有所改善</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue'
import * as echarts from 'echarts'

const periods = [
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '季度', value: 'quarter' }
]

const selectedPeriod = ref('month')
const chartRef = ref<HTMLElement>()

const emit = defineEmits<{
  'period-change': [period: string]
}>()

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

const initChart = () => {
  if (!chartRef.value) return

  const chart = echarts.init(chartRef.value)
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['出勤率', '迟到率'] },
    xAxis: { type: 'category', data: ['第1周', '第2周', '第3周', '第4周'] },
    yAxis: { type: 'value', max: 100 },
    series: [
      {
        name: '出勤率',
        type: 'line',
        data: [92, 94, 95, 96],
        smooth: true
      },
      {
        name: '迟到率',
        type: 'line',
        data: [8, 6, 5, 4],
        smooth: true
      }
    ]
  }
  chart.setOption(option)
}
</script>

<style lang="scss" scoped>
.attendance-trends-tab {
  padding: var(--van-padding-sm);

  .trends-chart {
    background: white;
    border-radius: var(--van-border-radius-lg);
    padding: var(--van-padding-md);
    margin-bottom: var(--van-padding-md);

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--van-padding-md);

      h3 {
        margin: 0;
        font-size: var(--van-font-size-md);
        font-weight: var(--van-font-weight-bold);
      }
    }
  }

  .trends-analysis {
    background: white;
    border-radius: var(--van-border-radius-lg);
    padding: var(--van-padding-md);

    h4 {
      margin: 0 0 var(--van-padding-md) 0;
      font-size: var(--van-font-size-md);
      font-weight: var(--van-font-weight-bold);
    }

    .analysis-content {
      .analysis-item {
        display: flex;
        align-items: center;
        gap: var(--van-padding-xs);
        padding: var(--van-padding-sm);
        margin-bottom: var(--van-padding-xs);
        border-radius: var(--van-border-radius-md);
        font-size: var(--van-font-size-sm);

        &.positive {
          background: rgba(103, 194, 58, 0.1);
          color: #67C23A;
        }

        &.negative {
          background: rgba(245, 108, 108, 0.1);
          color: #F56C6C;
        }
      }
    }
  }
}
</style>