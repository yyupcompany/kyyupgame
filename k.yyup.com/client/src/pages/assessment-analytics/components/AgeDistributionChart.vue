<template>
  <div ref="chartRef" class="age-chart"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer,
]);

interface Props {
  chartData: Array<{
    age: number;
    count: number;
  }>;
}

const props = defineProps<Props>();

const chartRef = ref<HTMLDivElement>();
let chartInstance: echarts.ECharts | null = null;

const initChart = () => {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);

  const ages = props.chartData.map((item) => `${item.age}岁`);
  const counts = props.chartData.map((item) => item.count);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ages,
      axisLabel: {
        interval: 0,
        rotate: 0,
      },
    },
    yAxis: {
      type: 'value',
      name: '人数',
    },
    series: [
      {
        name: '测评人数',
        type: 'bar',
        data: counts,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#91cc75' },
            { offset: 1, color: '#5daf34' },
          ]),
        },
        barWidth: '60%',
      },
    ],
  };

  chartInstance.setOption(option);
};

const updateChart = () => {
  if (chartInstance) {
    const ages = props.chartData.map((item) => `${item.age}岁`);
    const counts = props.chartData.map((item) => item.count);

    chartInstance.setOption({
      xAxis: {
        data: ages,
      },
      series: [
        {
          data: counts,
        },
      ],
    });
  }
};

watch(
  () => props.chartData,
  () => {
    updateChart();
  },
  { deep: true }
);

onMounted(() => {
  initChart();
  window.addEventListener('resize', () => {
    chartInstance?.resize();
  });
});

onUnmounted(() => {
  chartInstance?.dispose();
  window.removeEventListener('resize', () => {
    chartInstance?.resize();
  });
});
</script>

<style scoped lang="scss">
.age-chart {
  width: 100%;
  height: 300px;
}
</style>
















