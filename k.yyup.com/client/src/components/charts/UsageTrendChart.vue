<template>
  <div ref="chartRef" class="usage-trend-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';

interface TrendData {
  date: string;
  count: number;
  cost: number;
}

interface Props {
  data: TrendData[];
  height?: string;
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px'
});

const chartRef = ref<HTMLDivElement>();
let chartInstance: echarts.ECharts | null = null;

const initChart = () => {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);

  const dates = props.data.map(item => item.date);
  const counts = props.data.map(item => item.count);
  const costs = props.data.map(item => item.cost);

  const option: echarts.EChartsOption = {
    title: {
      text: '用量趋势',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['调用次数', '费用'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '调用次数',
        position: 'left',
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '费用(元)',
        position: 'right',
        axisLabel: {
          formatter: '¥{value}'
        }
      }
    ],
    series: [
      {
        name: '调用次数',
        type: 'line',
        smooth: true,
        data: counts,
        itemStyle: {
          color: '#409eff'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409eff40' },
            { offset: 1, color: '#409eff10' }
          ])
        }
      },
      {
        name: '费用',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: costs,
        itemStyle: {
          color: '#67c23a'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#67c23a40' },
            { offset: 1, color: '#67c23a10' }
          ])
        }
      }
    ]
  };

  chartInstance.setOption(option);
};

const resizeChart = () => {
  chartInstance?.resize();
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', resizeChart);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart);
  chartInstance?.dispose();
});

watch(() => props.data, () => {
  initChart();
}, { deep: true });
</script>

<style scoped lang="scss">
.usage-trend-chart {
  width: 100%;
  height: v-bind(height);
}
</style>