<template>
  <div ref="chartRef" class="trend-chart"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
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
  LineChart,
  CanvasRenderer,
]);

interface Props {
  chartData: {
    labels: string[];
    values: number[];
  };
}

const props = defineProps<Props>();

const chartRef = ref<HTMLDivElement>();
let chartInstance: echarts.ECharts | null = null;

const initChart = () => {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
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
      boundaryGap: false,
      data: props.chartData.labels,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '测评次数',
        type: 'line',
        smooth: true,
        data: props.chartData.values,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(64, 158, 255, 0.3)',
            },
            {
              offset: 1,
              color: 'rgba(64, 158, 255, 0.05)',
            },
          ]),
        },
        itemStyle: {
          color: '#409EFF',
        },
        lineStyle: {
          width: 3,
        },
      },
    ],
  };

  chartInstance.setOption(option);
};

const updateChart = () => {
  if (chartInstance) {
    chartInstance.setOption({
      xAxis: {
        data: props.chartData.labels,
      },
      series: [
        {
          data: props.chartData.values,
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
.trend-chart {
  width: 100%;
  height: 300px;
}
</style>











