<template>
  <div class="data-statistics">
    <el-row :gutter="16">
      <el-col :span="12">
        <div class="chart-container">
          <h5>沟通频率</h5>
          <div ref="frequencyChart" class="chart"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-container">
          <h5>情感分析</h5>
          <div ref="sentimentChart" class="chart"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Props {
  customerId: number;
}

const props = defineProps<Props>();

const frequencyChart = ref<HTMLElement>();
const sentimentChart = ref<HTMLElement>();

onMounted(() => {
  // TODO: 使用ECharts渲染图表
  console.log('渲染统计图表');
});
</script>

<style scoped lang="scss">
.data-statistics {
  .chart-container {
    h5 {
      font-size: var(--text-base);
      font-weight: 600;
      margin: 0 0 var(--text-lg) 0;
    }
    
    .chart {
      height: 300px;
      background: var(--bg-hover);
      border-radius: var(--spacing-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--info-color);
    }
  }
}
</style>
