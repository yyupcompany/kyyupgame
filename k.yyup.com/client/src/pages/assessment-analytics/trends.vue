<template>
  <div class="assessment-trends">
    <el-card shadow="hover">
      <div class="trends-header">
        <h3>数据趋势分析</h3>
        <div class="date-range-selector">
          <el-radio-group v-model="groupBy" @change="loadTrends">
            <el-radio-button label="day">按天</el-radio-button>
            <el-radio-button label="week">按周</el-radio-button>
            <el-radio-button label="month">按月</el-radio-button>
          </el-radio-group>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="margin-left: 20px"
            @change="loadTrends"
          />
        </div>
      </div>

      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="24">
          <div class="chart-container">
            <h4>全园平均分走势</h4>
            <TrendChart :chart-data="trendData" />
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { getAssessmentTrends } from '@/api/modules/assessment-analytics';
import TrendChart from './components/TrendChart.vue';

const groupBy = ref<'day' | 'week' | 'month'>('month');
const dateRange = ref<[string, string]>([
  dayjs().subtract(6, 'month').format('YYYY-MM-DD'),
  dayjs().format('YYYY-MM-DD'),
]);

const trendData = ref({
  labels: [] as string[],
  values: [] as number[],
});

const loadTrends = async () => {
  try {
    const response = await getAssessmentTrends({
      startDate: dateRange.value[0],
      endDate: dateRange.value[1],
      groupBy: groupBy.value,
    });
    
    if (response.success) {
      trendData.value = response.data;
    }
  } catch (error: any) {
    console.error('加载趋势数据失败:', error);
    ElMessage.error('加载趋势数据失败');
  }
};

onMounted(() => {
  loadTrends();
});
</script>

<style scoped lang="scss">
.assessment-trends {
  padding: var(--spacing-lg);

  .trends-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--spacing-lg);

    h3 {
      margin: 0;
    }

    .date-range-selector {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .chart-container {
    background: #fff;
    padding: var(--spacing-lg);
    border-radius: 8px;

    h4 {
      margin: 0 0 20px 0;
      font-size: var(--text-base);
      font-weight: bold;
    }
  }
}
</style>











