<template>
  <div ref="chartRef" class="usage-type-pie-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';

interface TypeData {
  type: string;
  count: number;
  cost: number;
}

interface Props {
  data: TypeData[];
  height?: string;
  showCost?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px',
  showCost: false
});

const chartRef = ref<HTMLDivElement>();
let chartInstance: echarts.ECharts | null = null;

const typeNames: Record<string, string> = {
  text: '文本',
  image: '图片',
  audio: '语音',
  video: '视频',
  embedding: '向量'
};

const typeColors: Record<string, string> = {
  text: 'var(--primary-color)',
  image: 'var(--danger-color)',
  audio: 'var(--primary-color)',
  video: 'var(--success-color)',
  embedding: 'var(--warning-color)'
};

const initChart = () => {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);

  const chartData = props.data.map(item => ({
    name: typeNames[item.type] || item.type,
    value: props.showCost ? item.cost : item.count,
    itemStyle: {
      color: typeColors[item.type] || 'var(--text-secondary)'
    }
  }));

  const option: echarts.EChartsOption = {
    title: {
      text: props.showCost ? '费用分布' : '调用次数分布',
      left: 'center',
      textStyle: {
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--text-primary)'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const value = props.showCost 
          ? `¥${params.value.toFixed(6)}`
          : params.value.toLocaleString();
        return `${params.name}: ${value} (${params.percent}%)`;
      }
    },
    legend: {
      orient: 'vertical',
      right: 'var(--spacing-sm)',
      top: 'center',
      data: chartData.map(item => item.name)
    },
    series: [
      {
        name: props.showCost ? '费用' : '调用次数',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#ffffff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
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

watch(() => props.showCost, () => {
  initChart();
});
</script>

<style scoped lang="scss">
.usage-type-pie-chart {
  width: 100%;
  height: v-bind(height);
}
</style>

