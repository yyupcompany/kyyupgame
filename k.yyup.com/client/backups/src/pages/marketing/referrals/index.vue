<template>
  <div class="referrals-page">
    <!-- 页面头部 -->
    <div class="page-header-custom">
      <h2 class="page-title">老带新管理</h2>
      <div class="page-actions">
        <el-button type="primary" :icon="Plus" @click="handleShowPosterDialog">
          生成推广海报
        </el-button>
        <el-button type="success" :icon="DocumentCopy" @click="handleShowQrcodeDialog">
          生成推广二维码
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard
          title="新增推荐"
          :value="stats.newCount"
          icon="UserPlus"
          color="var(--primary-color)"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard
          title="已完成"
          :value="stats.completedCount"
          icon="CheckCircle"
          color="var(--success-color)"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard
          title="转化率"
          :value="`${stats.convRate}%`"
          icon="TrendingUp"
          color="var(--warning-color)"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard
          title="总奖励"
          :value="`¥${stats.totalReward || 0}`"
          icon="Gift"
          color="var(--danger-color)"
        />
      </el-col>
    </el-row>

    <!-- 搜索筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="推荐人">
          <el-input
            v-model="filters.referrerName"
            placeholder="请输入推荐人姓名"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="被推荐人">
          <el-input
            v-model="filters.refereeName"
            placeholder="请输入被推荐人姓名"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="访客手机">
          <el-input
            v-model="filters.visitorPhone"
            placeholder="请输入访客手机号"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="filters.status"
            placeholder="全部状态"
            clearable
            style="width: 140px"
          >
            <el-option label="待跟进" value="pending" />
            <el-option label="已访问" value="visited" />
            <el-option label="已转化" value="converted" />
            <el-option label="已失效" value="expired" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联活动">
          <el-select
            v-model="filters.activityId"
            placeholder="全部活动"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="activity in activities"
              :key="activity.id"
              :label="activity.title"
              :value="activity.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            查询
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          <el-button type="success" :icon="Download" @click="handleExport">
            导出
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">推荐列表</span>
          <div class="card-extra">
            <el-tag type="info" size="small">共 {{ pagination.total }} 条记录</el-tag>
          </div>
        </div>
      </template>

      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="编号" width="80" align="center" />
        <el-table-column
          prop="referrer_name"
          label="推荐人"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="referrer_phone"
          label="推荐人手机"
          width="130"
          align="center"
        />
        <el-table-column
          prop="referee_name"
          label="被推荐人"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="referee_phone"
          label="被推荐人手机"
          width="130"
          align="center"
        />
        <el-table-column
          prop="activity_name"
          label="关联活动"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="reward"
          label="奖励金额"
          width="110"
          align="right"
        >
          <template #default="{ row }">
            <span style="color: var(--danger-color); font-weight: bold">
              ¥{{ row.reward || 0 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="created_at"
          label="推荐时间"
          width="160"
          align="center"
        >
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleViewDetail(row)"
            >
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              link
              @click="handleUpdateStatus(row)"
            >
              更新状态
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
        class="pagination"
      />
    </el-card>

    <!-- TOP推荐人排行 -->
    <el-card class="top-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">TOP推荐人排行</span>
        </div>
      </template>
      <el-table :data="topReferrers" stripe v-if="topReferrers.length > 0">
        <el-table-column type="index" label="排名" width="80" align="center">
          <template #default="{ $index }">
            <el-tag
              :type="$index === 0 ? 'danger' : $index === 1 ? 'warning' : 'success'"
              size="small"
            >
              {{ $index + 1 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="referrerName"
          label="推荐人"
          show-overflow-tooltip
        />
        <el-table-column
          prop="count"
          label="推荐数量"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-tag type="success" size="small">{{ row.count }} 人</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="暂无数据" :image-size="100" />
    </el-card>

    <!-- 推广海报生成对话框 -->
    <el-dialog
      v-model="showPosterDialog"
      title="生成推广海报"
      width="800px"
      :close-on-click-modal="false"
    >
      <PosterGenerator
        @success="handlePosterSuccess"
        @cancel="showPosterDialog = false"
      />
    </el-dialog>

    <!-- 推广二维码生成对话框 -->
    <el-dialog
      v-model="showQrcodeDialog"
      title="生成推广二维码"
      width="600px"
      :close-on-click-modal="false"
    >
      <QrcodeGenerator
        @success="handleQrcodeSuccess"
        @cancel="showQrcodeDialog = false"
      />
    </el-dialog>

    <!-- 推广码管理对话框 -->
    <ReferralCodeDialog
      v-model="showCodeDialog"
      @refresh="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Download, Refresh, Plus, DocumentCopy } from '@element-plus/icons-vue';
import StatCard from '@/components/centers/StatCard.vue';
import ReferralCodeDialog from './components/ReferralCodeDialog.vue';
import PosterGenerator from './components/PosterGenerator.vue';
import QrcodeGenerator from './components/QrcodeGenerator.vue';
import { request } from '@/utils/request';
import dayjs from 'dayjs';

// 响应式数据
const loading = ref(false);
const showCodeDialog = ref(false);
const showPosterDialog = ref(false);
const showQrcodeDialog = ref(false);
const dateRange = ref<[Date, Date] | null>(null);

// 筛选条件
const filters = reactive({
  referrerName: '',
  refereeName: '',
  visitorPhone: '',
  status: '',
  activityId: ''
});

// 统计数据
const stats = reactive({
  newCount: 0,
  completedCount: 0,
  convRate: 0,
  totalReward: 0
});

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
});

// 表格数据
const tableData = ref<any[]>([]);
const topReferrers = ref<any[]>([]);
const activities = ref<any[]>([]);

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters
    };

    if (dateRange.value) {
      params.startDate = dateRange.value[0].toISOString().split('T')[0];
      params.endDate = dateRange.value[1].toISOString().split('T')[0];
    }

    const response = await request.get('/marketing/referrals', { params });

    if (response.data) {
      tableData.value = response.data.items || [];
      pagination.total = response.data.total || 0;
      
      // 更新统计数据
      if (response.data.stats) {
        Object.assign(stats, response.data.stats);
      }
      
      // 更新TOP推荐人
      if (response.data.topReferrers) {
        topReferrers.value = response.data.topReferrers;
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error);
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
  }
};

// 加载活动列表
const loadActivities = async () => {
  try {
    const response = await request.get('/activities', {
      params: { page: 1, pageSize: 100, status: 'published' }
    });
    if (response.data && response.data.items) {
      activities.value = response.data.items;
    }
  } catch (error) {
    console.error('加载活动列表失败:', error);
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  loadData();
};

// 重置
const handleReset = () => {
  Object.assign(filters, {
    referrerName: '',
    refereeName: '',
    visitorPhone: '',
    status: '',
    activityId: ''
  });
  dateRange.value = null;
  pagination.page = 1;
  loadData();
};

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中...');
};

// 查看详情
const handleViewDetail = (row: any) => {
  ElMessage.info(`查看详情: ${row.id}`);
};

// 更新状态
const handleUpdateStatus = (row: any) => {
  ElMessage.info(`更新状态: ${row.id}`);
};

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    pending: 'warning',
    visited: 'info',
    converted: 'success',
    expired: 'info'
  };
  return typeMap[status] || 'info';
};

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待跟进',
    visited: '已访问',
    converted: '已转化',
    expired: '已失效'
  };
  return textMap[status] || status;
};

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

// 显示海报对话框
const handleShowPosterDialog = () => {
  console.log('点击生成推广海报按钮');
  showPosterDialog.value = true;
};

// 显示二维码对话框
const handleShowQrcodeDialog = () => {
  console.log('点击生成推广二维码按钮');
  showQrcodeDialog.value = true;
};

// 海报生成成功回调
const handlePosterSuccess = (posterUrl: string) => {
  ElMessage.success('海报生成成功!');
  showPosterDialog.value = false;
  // 可以在这里添加预览或下载逻辑
};

// 二维码生成成功回调
const handleQrcodeSuccess = (qrcodeUrl: string) => {
  ElMessage.success('二维码生成成功!');
  showQrcodeDialog.value = false;
  // 可以在这里添加预览或下载逻辑
};

// 初始化
onMounted(() => {
  loadData();
  loadActivities();
});
</script>

<style scoped lang="scss">
.referrals-page {
  padding: var(--text-2xl);
  background: var(--bg-hover);
  min-height: calc(100vh - 60px);

  .stats-row {
    margin-bottom: var(--text-2xl);
  }

  .filter-card {
    margin-bottom: var(--text-2xl);
    border-radius: var(--spacing-sm);

    .filter-form {
      :deep(.el-form-item) {
        margin-bottom: 0;
        margin-right: var(--text-lg);
      }

      :deep(.el-form-item__label) {
        font-weight: 500;
        color: var(--text-regular);
      }
    }
  }

  .table-card {
    margin-bottom: var(--text-2xl);
    border-radius: var(--spacing-sm);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-weight: 600;
        font-size: var(--text-lg);
        color: var(--text-primary);
      }

      .card-extra {
        display: flex;
        gap: var(--spacing-sm);
      }
    }

    .pagination {
      margin-top: var(--text-2xl);
      display: flex;
      justify-content: flex-end;
    }
  }

  .top-card {
    border-radius: var(--spacing-sm);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-weight: 600;
        font-size: var(--text-lg);
        color: var(--text-primary);
      }
    }
  }

  .page-header-custom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);

    .page-title {
      font-size: var(--text-2xl);
      font-weight: bold;
      color: var(--text-primary);
      margin: 0;
    }

    .page-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }
}
</style>
