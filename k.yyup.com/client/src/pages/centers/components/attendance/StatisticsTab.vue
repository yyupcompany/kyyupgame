<template>
  <div class="statistics-tab">
    <!-- 时间维度选择 -->
    <el-card class="filter-card" shadow="never">
      <el-radio-group v-model="timeDimension" @change="handleDimensionChange">
        <el-radio-button label="daily">日统计</el-radio-button>
        <el-radio-button label="weekly">周统计</el-radio-button>
        <el-radio-button label="monthly">月统计</el-radio-button>
        <el-radio-button label="quarterly">季度统计</el-radio-button>
        <el-radio-button label="yearly">年度统计</el-radio-button>
      </el-radio-group>

      <div class="date-selector" style="margin-top: var(--text-lg)">
        <!-- 日统计 -->
        <el-date-picker
          v-if="timeDimension === 'daily'"
          v-model="dateParams.date"
          type="date"
          placeholder="选择日期"
          @change="loadStatistics"
        />

        <!-- 周统计 -->
        <el-date-picker
          v-else-if="timeDimension === 'weekly'"
          v-model="dateParams.weekRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="loadStatistics"
        />

        <!-- 月统计 -->
        <div v-else-if="timeDimension === 'monthly'" class="month-selector">
          <el-select v-model="dateParams.year" placeholder="年份" @change="loadStatistics">
            <el-option
              v-for="year in yearOptions"
              :key="year"
              :label="`${year}年`"
              :value="year"
            />
          </el-select>
          <el-select v-model="dateParams.month" placeholder="月份" @change="loadStatistics">
            <el-option
              v-for="month in 12"
              :key="month"
              :label="`${month}月`"
              :value="month"
            />
          </el-select>
        </div>

        <!-- 季度统计 -->
        <div v-else-if="timeDimension === 'quarterly'" class="quarter-selector">
          <el-select v-model="dateParams.year" placeholder="年份" @change="loadStatistics">
            <el-option
              v-for="year in yearOptions"
              :key="year"
              :label="`${year}年`"
              :value="year"
            />
          </el-select>
          <el-select v-model="dateParams.quarter" placeholder="季度" @change="loadStatistics">
            <el-option label="第一季度" :value="1" />
            <el-option label="第二季度" :value="2" />
            <el-option label="第三季度" :value="3" />
            <el-option label="第四季度" :value="4" />
          </el-select>
        </div>

        <!-- 年度统计 -->
        <el-select
          v-else-if="timeDimension === 'yearly'"
          v-model="dateParams.year"
          placeholder="年份"
          @change="loadStatistics"
        >
          <el-option
            v-for="year in yearOptions"
            :key="year"
            :label="`${year}年`"
            :value="year"
          />
        </el-select>
      </div>
    </el-card>

    <!-- 统计图表 -->
    <el-card class="chart-card" shadow="never" v-loading="loading">
      <template #header>
        <span class="card-title">出勤趋势</span>
      </template>

      <div ref="chartRef" class="chart-container"></div>
    </el-card>

    <!-- 统计数据表格 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <span class="card-title">详细数据</span>
      </template>

      <div class="table-wrapper">
<el-table class="responsive-table" :data="tableData" border stripe>
        <el-table-column prop="date" label="日期" width="120" align="center" />
        <el-table-column prop="totalRecords" label="总人数" width="100" align="center" />
        <el-table-column prop="presentCount" label="出勤" width="100" align="center" />
        <el-table-column prop="absentCount" label="缺勤" width="100" align="center" />
        <el-table-column prop="lateCount" label="迟到" width="100" align="center" />
        <el-table-column prop="earlyLeaveCount" label="早退" width="100" align="center" />
        <el-table-column prop="sickLeaveCount" label="病假" width="100" align="center" />
        <el-table-column prop="personalLeaveCount" label="事假" width="100" align="center" />
        <el-table-column label="出勤率" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getAttendanceRateType(row.attendanceRate)">
              {{ row.attendanceRate }}%
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import {
  getDailyStatistics,
  getWeeklyStatistics,
  getMonthlyStatistics,
  getQuarterlyStatistics,
  getYearlyStatistics,
} from '@/api/modules/attendance-center';

// ==================== Props ====================

const props = defineProps<{
  kindergartenId: number;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

// ==================== 数据定义 ====================

const loading = ref(false);
const timeDimension = ref('daily');
const chartRef = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;

// 日期参数
const dateParams = reactive({
  date: new Date(),
  weekRange: [new Date(), new Date()],
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  quarter: Math.floor(new Date().getMonth() / 3) + 1,
});

// 年份选项
const yearOptions = ref<number[]>([]);

// 表格数据
const tableData = ref<any[]>([]);

// ==================== 方法 ====================

// 初始化年份选项
const initYearOptions = () => {
  const currentYear = new Date().getFullYear();
  yearOptions.value = Array.from({ length: 5 }, (_, i) => currentYear - i);
};

// 维度变更
const handleDimensionChange = () => {
  loadStatistics();
};

// 加载统计数据
const loadStatistics = async () => {
  loading.value = true;
  try {
    let response;

    switch (timeDimension.value) {
      case 'daily':
        response = await getDailyStatistics({
          kindergartenId: props.kindergartenId,
          date: dateParams.date.toISOString().split('T')[0],
        });
        break;

      case 'weekly':
        response = await getWeeklyStatistics({
          kindergartenId: props.kindergartenId,
          startDate: dateParams.weekRange[0].toISOString().split('T')[0],
          endDate: dateParams.weekRange[1].toISOString().split('T')[0],
        });
        break;

      case 'monthly':
        response = await getMonthlyStatistics({
          kindergartenId: props.kindergartenId,
          year: dateParams.year,
          month: dateParams.month,
        });
        break;

      case 'quarterly':
        response = await getQuarterlyStatistics({
          kindergartenId: props.kindergartenId,
          year: dateParams.year,
          quarter: dateParams.quarter,
        });
        break;

      case 'yearly':
        response = await getYearlyStatistics({
          kindergartenId: props.kindergartenId,
          year: dateParams.year,
        });
        break;
    }

    if (response && response.success && response.data) {
      processStatisticsData(response.data);
    }
  } catch (error) {
    console.error('加载统计数据失败:', error);
    ElMessage.error('加载统计数据失败');
  } finally {
    loading.value = false;
  }
};

// 处理统计数据
const processStatisticsData = (data: any) => {
  // 根据不同维度处理数据
  if (timeDimension.value === 'daily') {
    tableData.value = data.classes || [];
  } else if (timeDimension.value === 'weekly' || timeDimension.value === 'monthly') {
    tableData.value = data.dailyData || [];
  } else if (timeDimension.value === 'quarterly') {
    tableData.value = data.monthlyData || [];
  } else if (timeDimension.value === 'yearly') {
    tableData.value = data.monthlyData || [];
  }

  // 更新图表
  updateChart();
};

// 更新图表
const updateChart = () => {
  if (!chartRef.value) return;

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value);
  }

  const dates = tableData.value.map((item) => item.date || item.month || '');
  const attendanceRates = tableData.value.map((item) => item.attendanceRate || 0);
  const presentCounts = tableData.value.map((item) => item.presentCount || 0);
  const absentCounts = tableData.value.map((item) => item.absentCount || 0);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['出勤率', '出勤人数', '缺勤人数'],
    },
    xAxis: {
      type: 'category',
      data: dates,
    },
    yAxis: [
      {
        type: 'value',
        name: '人数',
      },
      {
        type: 'value',
        name: '出勤率(%)',
        max: 100,
      },
    ],
    series: [
      {
        name: '出勤人数',
        type: 'bar',
        data: presentCounts,
      },
      {
        name: '缺勤人数',
        type: 'bar',
        data: absentCounts,
      },
      {
        name: '出勤率',
        type: 'line',
        yAxisIndex: 1,
        data: attendanceRates,
      },
    ],
  };

  chartInstance.setOption(option);
};

// 获取出勤率标签类型
const getAttendanceRateType = (rate: number) => {
  if (rate >= 95) return 'success';
  if (rate >= 85) return 'warning';
  return 'danger';
};

// ==================== 生命周期 ====================

onMounted(() => {
  initYearOptions();
  loadStatistics();

  nextTick(() => {
    window.addEventListener('resize', () => {
      chartInstance?.resize();
    });
  });
});
</script>

<style scoped lang="scss">
.statistics-tab {
  .filter-card {
    margin-bottom: var(--text-2xl);

    .month-selector,
    .quarter-selector {
      display: flex;
      gap: var(--text-sm);
    }
  }

  .chart-card {
    margin-bottom: var(--text-2xl);

    .chart-container {
      width: 100%;
      min-height: 60px; height: auto;
    }
  }

  .table-card {
    .card-title {
      font-size: var(--text-lg);
      font-weight: 600;
    }
  }
}
</style>

