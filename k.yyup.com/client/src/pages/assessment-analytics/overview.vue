<template>
  <div class="assessment-overview">
    <!-- 统计卡片区 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card">
            <div class="stat-icon primary">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalAssessments }}</div>
              <div class="stat-label">总测评次数</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card">
            <div class="stat-icon success">
              <el-icon><Plus /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.monthlyAssessments }}</div>
              <div class="stat-label">本月新增</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card">
            <div class="stat-icon warning">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.completionRate }}%</div>
              <div class="stat-label">完成率</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card">
            <div class="stat-icon info">
              <el-icon><Star /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.averageScore }}</div>
              <div class="stat-label">平均分</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>测评趋势图</span>
              </div>
            </template>
            <TrendChart :chart-data="stats.trendData" />
          </el-card>
        </el-col>
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>年龄分布图</span>
              </div>
            </template>
            <AgeDistributionChart :chart-data="stats.ageDistribution" />
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>五大维度对比</span>
              </div>
            </template>
            <DimensionRadar :dimension-scores="stats.dimensionScores" />
          </el-card>
        </el-col>
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>发育商分布</span>
              </div>
            </template>
            <DQDistributionChart :chart-data="stats.dqDistribution" />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 最近测评列表 -->
    <el-card class="recent-records" shadow="hover" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>最近测评记录</span>
          <el-button type="primary" link @click="goToRecords">查看全部</el-button>
        </div>
      </template>
      <el-table :data="stats.recentRecords" stripe>
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="assessmentType" label="测评类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getAssessmentTypeName(row.assessmentType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalScore" label="总分" width="100">
          <template #default="{ row }">
            <span class="score-value">{{ row.totalScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="测评时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="120">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row.id)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Document, Plus, CircleCheck, Star } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import { getAssessmentOverview, type AssessmentOverviewStats } from '@/api/modules/assessment-analytics';
import TrendChart from './components/TrendChart.vue';
import AgeDistributionChart from './components/AgeDistributionChart.vue';
import DimensionRadar from './components/DimensionRadar.vue';
import DQDistributionChart from './components/DQDistributionChart.vue';

const router = useRouter();

const stats = ref<AssessmentOverviewStats>({
  totalAssessments: 0,
  monthlyAssessments: 0,
  completionRate: 0,
  averageScore: 0,
  trendData: { labels: [], values: [] },
  ageDistribution: [],
  dimensionScores: {
    cognitive: 0,
    physical: 0,
    social: 0,
    emotional: 0,
    language: 0,
  },
  dqDistribution: [],
  recentRecords: [],
});

const loading = ref(false);

/**
 * 加载统计数据
 */
const loadStats = async () => {
  loading.value = true;
  try {
    const response = await getAssessmentOverview();
    if (response.success) {
      stats.value = response.data;
    } else {
      ElMessage.error(response.message || '加载数据失败');
    }
  } catch (error: any) {
    console.error('加载测评统计失败:', error);
    ElMessage.error(error.message || '加载数据失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 获取测评类型名称
 */
const getAssessmentTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    'school-readiness': '入学准备',
    'development': '发展测评',
    'physical': '体能测评',
    'cognitive': '认知测评',
  };
  return typeMap[type] || type;
};

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

/**
 * 获取状态类型
 */
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    completed: 'success',
    in_progress: 'warning',
    pending: 'info',
  };
  return typeMap[status] || '';
};

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    completed: '已完成',
    in_progress: '进行中',
    pending: '待开始',
  };
  return textMap[status] || status;
};

/**
 * 查看详情
 */
const viewDetail = (id: number) => {
  router.push(`/assessment-analytics/records?id=${id}`);
};

/**
 * 跳转到记录页面
 */
const goToRecords = () => {
  router.push('/assessment-analytics/records');
};

onMounted(() => {
  loadStats();
});
</script>

<style scoped lang="scss">
.assessment-overview {
  padding: var(--spacing-lg);

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: 20px;

    .stat-card {
      display: flex;
      align-items: center;
      padding: var(--spacing-lg);
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20px;

        .el-icon {
          font-size: var(--text-3xl);
          color: #fff;
        }

        &.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.success {
          background: linear-gradient(135deg, #67C23A 0%, #5daf34 100%);
        }

        &.warning {
          background: linear-gradient(135deg, #E6A23C 0%, #cf9236 100%);
        }

        &.info {
          background: linear-gradient(135deg, #909399 0%, #82848a 100%);
        }
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: var(--text-3xl);
          font-weight: bold;
          color: #303133;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: var(--text-sm);
          color: #909399;
        }
      }
    }
  }

  .charts-section {
    .chart-card {
      margin-bottom: 20px;

      :deep(.el-card__header) {
        padding: 15px 20px;
        border-bottom: 1px solid #f0f0f0;
      }

      :deep(.el-card__body) {
        padding: var(--spacing-lg);
        min-height: 300px;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        font-size: var(--text-base);
      }
    }
  }

  .recent-records {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
      font-size: var(--text-base);
    }

    .score-value {
      font-weight: bold;
      color: #409EFF;
    }
  }
}

// 响应式布局
@media screen and (max-width: 768px) {
  .assessment-overview {
    padding: 10px;

    .stats-cards {
      .stat-card {
        margin-bottom: 10px;
      }
    }
  }
}
</style>
















