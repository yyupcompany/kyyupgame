<template>
  <div class="attendance-statistics-tab">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <van-row :gutter="12">
        <van-col span="12" v-for="stat in statisticsData" :key="stat.type">
          <div class="stat-card" :class="stat.type">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-rate">{{ stat.rate }}%</div>
          </div>
        </van-col>
      </van-row>
    </div>

    <!-- 图表区域 -->
    <div class="chart-section">
      <div class="chart-container">
        <div ref="chartRef" style="height: 250px"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue'
import * as echarts from 'echarts'

interface StatItem {
  type: string
  label: string
  value: number
  rate: number
}

interface Props {
  statisticsData?: StatItem[]
  chartData?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  statisticsData: () => [
    { type: 'attendance', label: '出勤率', value: '95.2%', rate: 95.2 },
    { type: 'absenteeism', label: '缺勤率', value: '4.8%', rate: 4.8 }
  ],
  chartData: () => []
})

const chartRef = ref<HTMLElement>()

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
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五'] },
    yAxis: { type: 'value' },
    series: [{
      data: [95, 92, 96, 94, 97],
      type: 'line',
      smooth: true
    }]
  }
  chart.setOption(option)
}
</script>

<style lang="scss" scoped>
.attendance-statistics-tab {
  padding: var(--van-padding-sm);

  .stats-cards {
    margin-bottom: var(--van-padding-md);

    .stat-card {
      background: white;
      border-radius: var(--van-border-radius-lg);
      padding: var(--van-padding-md);
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .stat-value {
        font-size: var(--van-font-size-xl);
        font-weight: var(--van-font-weight-bold);
        color: var(--van-primary-color);
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: var(--van-font-size-sm);
        color: var(--van-text-color-2);
        margin-bottom: 4px;
      }

      .stat-rate {
        font-size: var(--van-font-size-xs);
        color: var(--van-text-color-3);
      }
    }
  }

  .chart-section {
    background: white;
    border-radius: var(--van-border-radius-lg);
    padding: var(--van-padding-md);
  }
}
</style>