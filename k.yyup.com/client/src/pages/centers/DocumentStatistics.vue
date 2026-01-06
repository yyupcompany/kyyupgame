<template>
  <UnifiedCenterLayout>
    <div class="center-container document-statistics">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>📊 文档统计分析</h1>
      <p>查看文档使用情况和统计数据</p>
      <el-button type="primary" @click="handleExport">
        <UnifiedIcon name="Download" />
        导出报表
      </el-button>
    </div>

    <!-- 统计概览卡片 -->
    <el-row :gutter="20" class="overview-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <UnifiedIcon name="default" />
            <div class="stat-info">
              <div class="stat-value">{{ overview.totalDocuments }}</div>
              <div class="stat-label">总文档数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <UnifiedIcon name="default" />
            <div class="stat-info">
              <div class="stat-value">{{ overview.thisMonthDocuments }}</div>
              <div class="stat-label">本月新增</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <UnifiedIcon name="default" />
            <div class="stat-info">
              <div class="stat-value">{{ overview.upcomingOverdue }}</div>
              <div class="stat-label">即将逾期</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <UnifiedIcon name="Close" />
            <div class="stat-info">
              <div class="stat-value">{{ overview.overdue }}</div>
              <div class="stat-label">已逾期</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <!-- 使用趋势图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>使用趋势</span>
              <el-select v-model="trendPeriod" @change="loadTrends" class="period-select">
                <el-option label="近7天" value="7days" />
                <el-option label="近30天" value="30days" />
                <el-option label="近90天" value="90days" />
                <el-option label="近1年" value="1year" />
              </el-select>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 状态分布图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>状态分布</span>
          </template>
          <div ref="statusChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <!-- 进度分布图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>进度分布</span>
          </template>
          <div ref="progressChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 模板使用排行 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>模板使用排行 TOP 10</span>
          </template>
          <div ref="rankingChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <template #header>
        <span>详细数据</span>
      </template>
      <el-tabs v-model="activeTab">
        <!-- 状态统计 -->
        <el-tab-pane label="状态统计" name="status">
          <div class="table-wrapper">
<el-table class="responsive-table full-width-table" :data="statusTableData">
            <el-table-column prop="status" label="状态" width="150">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="count" label="数量" width="120" />
            <el-table-column prop="percentage" label="占比" width="120">
              <template #default="{ row }">
                {{ row.percentage }}%
              </template>
            </el-table-column>
            <el-table-column label="进度">
              <template #default="{ row }">
                <el-progress :percentage="row.percentage" :color="getProgressColor(row.percentage)" />
              </template>
            </el-table-column>
          </el-table>
</div>
        </el-tab-pane>

        <!-- 模板排行 -->
        <el-tab-pane label="模板排行" name="ranking">
          <el-table class="responsive-table full-width-table" :data="templateRanking">
            <el-table-column type="index" label="排名" width="80" />
            <el-table-column prop="template.code" label="编号" width="100" />
            <el-table-column prop="template.name" label="模板名称" min-width="200" />
            <el-table-column prop="template.category" label="分类" width="120">
              <template #default="{ row }">
                {{ getCategoryName(row.template?.category) }}
              </template>
            </el-table-column>
            <el-table-column prop="count" label="使用次数" width="120" sortable />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Document, TrendCharts, Warning, CircleClose, Download
} from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import {
  getOverview,
  getTrends,
  getTemplateRanking,
  getCompletionRate,
  exportReport
} from '@/api/endpoints/document-statistics';

// 数据
const activeTab = ref('status');
const trendPeriod = ref('30days');

const overview = ref({
  totalDocuments: 0,
  thisMonthDocuments: 0,
  upcomingOverdue: 0,
  overdue: 0,
  avgProgress: 0
});

const statusTableData = ref<any[]>([]);
const templateRanking = ref<any[]>([]);

// 图表引用
const trendChartRef = ref<HTMLElement>();
const statusChartRef = ref<HTMLElement>();
const progressChartRef = ref<HTMLElement>();
const rankingChartRef = ref<HTMLElement>();

let trendChart: echarts.ECharts | null = null;
let statusChart: echarts.ECharts | null = null;
let progressChart: echarts.ECharts | null = null;
let rankingChart: echarts.ECharts | null = null;

// 方法
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    draft: 'info',
    filling: 'warning',
    review: 'primary',
    approved: 'success',
    rejected: 'danger',
    completed: 'success'
  };
  return map[status] || 'info';
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    filling: '填写中',
    review: '审核中',
    approved: '已通过',
    rejected: '已拒绝',
    completed: '已完成'
  };
  return map[status] || status;
};

const getCategoryName = (code: string) => {
  const map: Record<string, string> = {
    annual: '年度检查类',
    special: '专项检查类',
    routine: '常态化督导类',
    staff: '教职工管理类',
    student: '幼儿管理类',
    finance: '财务管理类',
    education: '保教工作类'
  };
  return map[code] || code;
};

const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return 'var(--success-color)';
  if (percentage >= 60) return 'var(--warning-color)';
  if (percentage >= 40) return 'var(--danger-color)';
  return 'var(--info-color)';
};

const handleExport = async () => {
  try {
    const response = await exportReport('excel');
    if (response.success) {
      ElMessage.success('导出成功');
    }
  } catch (error) {
    ElMessage.error('导出失败');
  }
};

// 加载数据
const loadOverview = async () => {
  try {
    const response = await getOverview();
    if (response.success) {
      overview.value = response.data;
    }
  } catch (error) {
    console.error('加载统计概览失败:', error);
  }
};

const loadTrends = async () => {
  try {
    const response = await getTrends(trendPeriod.value);
    if (response.success) {
      renderTrendChart(response.data.trends);
    }
  } catch (error) {
    console.error('加载使用趋势失败:', error);
  }
};

const loadCompletionRate = async () => {
  try {
    const response = await getCompletionRate();
    if (response.success) {
      statusTableData.value = response.data.completionRate;
      renderStatusChart(response.data.completionRate);
      renderProgressChart(response.data.progressStats);
    }
  } catch (error) {
    console.error('加载完成率统计失败:', error);
  }
};

const loadTemplateRanking = async () => {
  try {
    const response = await getTemplateRanking(10);
    if (response.success) {
      templateRanking.value = response.data.ranking;
      renderRankingChart(response.data.ranking);
    }
  } catch (error) {
    console.error('加载模板排行失败:', error);
  }
};

// 渲染图表
const renderTrendChart = (data: any[]) => {
  if (!trendChartRef.value) return;

  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value);
  }

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '文档数量',
        type: 'line',
        data: data.map(item => item.count),
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        }
      }
    ]
  };

  trendChart.setOption(option);
};

const renderStatusChart = (data: any[]) => {
  if (!statusChartRef.value) return;

  if (!statusChart) {
    statusChart = echarts.init(statusChartRef.value);
  }

  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '状态分布',
        type: 'pie',
        radius: '50%',
        data: data.map(item => ({
          name: getStatusLabel(item.status),
          value: item.count
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'var(--shadow-heavy)'
          }
        }
      }
    ]
  };

  statusChart.setOption(option);
};

const renderProgressChart = (data: any[]) => {
  if (!progressChartRef.value) return;

  if (!progressChart) {
    progressChart = echarts.init(progressChartRef.value);
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.label)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '文档数量',
        type: 'bar',
        data: data.map(item => item.count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }
    ]
  };

  progressChart.setOption(option);
};

const renderRankingChart = (data: any[]) => {
  if (!rankingChartRef.value) return;

  if (!rankingChart) {
    rankingChart = echarts.init(rankingChartRef.value);
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.template?.name || '未知').reverse()
    },
    series: [
      {
        name: '使用次数',
        type: 'bar',
        data: data.map(item => item.count).reverse(),
        itemStyle: {
          color: 'var(--success-color)'
        }
      }
    ]
  };

  rankingChart.setOption(option);
};

// 初始化
onMounted(async () => {
  await loadOverview();
  await loadCompletionRate();
  await loadTemplateRanking();
  
  await nextTick();
  await loadTrends();

  // 窗口大小变化时重新渲染图表
  window.addEventListener('resize', () => {
    trendChart?.resize();
    statusChart?.resize();
    progressChart?.resize();
    rankingChart?.resize();
  });
});
</script>

<style scoped lang="scss">
.document-statistics {
  padding: var(--spacing-2xl);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-2xl);

    h1 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--text-3xl);
    }

    p {
      margin: 0;
      color: var(--text-secondary);
    }
  }

  .overview-row {
    margin-bottom: var(--spacing-2xl);

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);

        .stat-info {
          .stat-value {
            font-size: var(--text-4xl);
            font-weight: var(--font-bold);
            line-height: var(--leading-none);
            margin-bottom: var(--spacing-sm);
          }

          .stat-label {
            font-size: var(--text-base);
            color: var(--text-secondary);
          }
        }
      }
    }
  }

  .charts-row {
    margin-bottom: var(--spacing-2xl);

    .chart-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .period-select {
          width: var(--container-md);
        }
      }

      .chart-container {
        min-height: 60px; height: auto;
      }
    }
  }

  .table-card {
    margin-bottom: var(--spacing-2xl);

    .full-width-table {
      width: 100%;
    }
  }
}
</style>

