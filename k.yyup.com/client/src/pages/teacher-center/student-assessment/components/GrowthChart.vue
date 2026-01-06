<template>
  <div ref="chartRef" class="growth-chart"></div>
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
import dayjs from 'dayjs';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
]);

interface AssessmentRecord {
  id: number;
  type: string;
  totalScore: number;
  createdAt: string;
}

interface Props {
  history: AssessmentRecord[];
}

const props = defineProps<Props>();

const chartRef = ref<HTMLDivElement>();
let chartInstance: echarts.ECharts | null = null;

const initChart = () => {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);

  // 按时间排序
  const sortedHistory = [...props.history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const dates = sortedHistory.map((item) =>
    dayjs(item.createdAt).format('MM-DD')
  );
  const scores = sortedHistory.map((item) => item.totalScore);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
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
      data: dates,
      name: '测评时间',
    },
    yAxis: {
      type: 'value',
      name: '分数',
      min: 0,
      max: 100,
    },
    series: [
      {
        name: '测评分数',
        type: 'line',
        smooth: true,
        data: scores,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(103, 194, 58, 0.3)',
            },
            {
              offset: 1,
              color: 'rgba(103, 194, 58, 0.05)',
            },
          ]),
        },
        itemStyle: {
          color: '#67C23A',
        },
        lineStyle: {
          width: 3,
        },
        markLine: {
          data: [{ type: 'average', name: '平均值' }],
          label: {
            formatter: '平均分: {c}',
          },
        },
      },
    ],
  };

  chartInstance.setOption(option);
};

watch(
  () => props.history,
  () => {
    initChart();
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
.growth-chart {
  width: 100%;
  height: 300px;
}
</style>











