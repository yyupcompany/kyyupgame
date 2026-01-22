<template>
  <div ref="chartRef" class="dq-chart"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
]);

interface Props {
  chartData: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

const props = defineProps<Props>();

const chartRef = ref<HTMLDivElement>();
let chartInstance: echarts.ECharts | null = null;

const initChart = () => {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);

  const data = props.chartData.map((item) => ({
    name: item.range,
    value: item.count,
  }));

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: props.chartData.map((item) => item.range),
    },
    series: [
      {
        name: '发育商分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data,
        color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'],
      },
    ],
  };

  chartInstance.setOption(option);
};

const updateChart = () => {
  if (chartInstance) {
    const data = props.chartData.map((item) => ({
      name: item.range,
      value: item.count,
    }));

    chartInstance.setOption({
      legend: {
        data: props.chartData.map((item) => item.range),
      },
      series: [
        {
          data,
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
.dq-chart {
  width: 100%;
  height: 300px;
}
</style>
















