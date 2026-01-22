<template>
  <div ref="chartRef" class="dimension-radar"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts/core';
import { RadarChart } from 'echarts/charts';
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
  RadarChart,
  CanvasRenderer,
]);

interface Props {
  dimensionScores: {
    cognitive: number;
    physical: number;
    social: number;
    emotional: number;
    language: number;
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
      trigger: 'item',
    },
    radar: {
      indicator: [
        { name: '认知发展', max: 100 },
        { name: '身体发展', max: 100 },
        { name: '社交发展', max: 100 },
        { name: '情感发展', max: 100 },
        { name: '语言发展', max: 100 },
      ],
      shape: 'polygon',
      splitNumber: 4,
      name: {
        textStyle: {
          color: '#72ACD1',
        },
      },
      splitLine: {
        lineStyle: {
          color: [
            'rgba(114, 172, 209, 0.1)',
            'rgba(114, 172, 209, 0.2)',
            'rgba(114, 172, 209, 0.4)',
            'rgba(114, 172, 209, 0.6)',
            'rgba(114, 172, 209, 0.8)',
          ].reverse(),
        },
      },
      splitArea: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(114, 172, 209, 0.5)',
        },
      },
    },
    series: [
      {
        name: '五大维度评分',
        type: 'radar',
        data: [
          {
            value: [
              props.dimensionScores.cognitive,
              props.dimensionScores.physical,
              props.dimensionScores.social,
              props.dimensionScores.emotional,
              props.dimensionScores.language,
            ],
            name: '平均分',
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.1, 0.6, 1, [
                {
                  color: 'rgba(64, 158, 255, 0)',
                  offset: 0,
                },
                {
                  color: 'rgba(64, 158, 255, 0.6)',
                  offset: 1,
                },
              ]),
            },
            itemStyle: {
              color: '#409EFF',
            },
            lineStyle: {
              color: '#409EFF',
              width: 2,
            },
          },
        ],
      },
    ],
  };

  chartInstance.setOption(option);
};

const updateChart = () => {
  if (chartInstance) {
    chartInstance.setOption({
      series: [
        {
          data: [
            {
              value: [
                props.dimensionScores.cognitive,
                props.dimensionScores.physical,
                props.dimensionScores.social,
                props.dimensionScores.emotional,
                props.dimensionScores.language,
              ],
            },
          ],
        },
      ],
    });
  }
};

watch(
  () => props.dimensionScores,
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
.dimension-radar {
  width: 100%;
  height: 300px;
}
</style>
















