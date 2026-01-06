<template>
  <UnifiedCenterLayout
    title="用量中心"
    description="查看所有用户的AI使用量和费用统计"
  >
    <template #header-actions>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="handleDateChange"
        style="width: 300px"
      />
      <el-dropdown @command="handleExportCommand">
        <el-button>
          <el-icon><Download /></el-icon>
          导出数据
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="csv">导出CSV</el-dropdown-item>
            <el-dropdown-item command="excel">导出Excel</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button type="primary" @click="refreshData">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </template>

    <div class="center-container usage-center-timeline">

    <!-- 概览统计卡片 -->
    <div class="overview-stats">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon primary">
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">总调用次数</div>
                <div class="stat-value">{{ formatNumber(overview.totalCalls) }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon success">
                <el-icon><Money /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">总费用</div>
                <div class="stat-value">¥{{ formatCost(overview.totalCost) }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon warning">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">活跃用户</div>
                <div class="stat-value">{{ overview.activeUsers }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card" @click="showWarningsDialog = true" style="cursor: pointer">
            <div class="stat-content">
              <div class="stat-icon danger">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-label">预警用户</div>
                <div class="stat-value">{{ warnings.length }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表展示 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>调用次数分布</h3>
            </div>
          </template>
          <UsageTypePieChart :data="overview.usageByType" :show-cost="false" height="350px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>费用分布</h3>
            </div>
          </template>
          <UsageTypePieChart :data="overview.usageByType" :show-cost="true" height="350px" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 按类型统计 -->
    <el-card shadow="never" class="usage-type-card">
      <template #header>
        <div class="card-header">
          <h3>按类型统计</h3>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="6" v-for="typeUsage in overview.usageByType" :key="typeUsage.type">
          <div class="type-stat">
            <div class="type-icon" :class="getTypeClass(typeUsage.type)">
              <el-icon>
                <component :is="getTypeIcon(typeUsage.type)" />
              </el-icon>
            </div>
            <div class="type-info">
              <div class="type-name">{{ getTypeName(typeUsage.type) }}</div>
              <div class="type-count">{{ formatNumber(typeUsage.count) }} 次</div>
              <div class="type-cost">¥{{ formatCost(typeUsage.cost) }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 用户用量列表 -->
    <el-card shadow="never" class="user-usage-card">
      <template #header>
        <div class="card-header">
          <h3>用户用量排行</h3>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索用户名或邮箱"
            style="width: 300px"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </template>

      <div class="table-container">
        <el-table
          :data="userUsageList"
          v-loading="loading"
          stripe
          border
          class="full-width-table"
          :show-overflow-tooltip="true"
        >
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="realName" label="真实姓名" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="totalCalls" label="调用次数" width="120" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.totalCalls) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalTokens" label="总Token数" width="150" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.totalTokens) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalCost" label="总费用" width="120" align="right">
          <template #default="{ row }">
            <span class="cost-value">¥{{ formatCost(row.totalCost) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewUserDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="用户用量详情"
      width="900px"
      destroy-on-close
    >
      <div v-if="currentUserDetail" class="user-detail">
        <h4>按类型统计</h4>
        <el-table :data="currentUserDetail.usageByType" stripe border :show-overflow-tooltip="true">
          <el-table-column prop="type" label="类型" width="150">
            <template #default="{ row }">
              {{ getTypeName(row.type) }}
            </template>
          </el-table-column>
          <el-table-column prop="count" label="调用次数" align="right" />
          <el-table-column prop="tokens" label="Token数" align="right">
            <template #default="{ row }">
              {{ formatNumber(row.tokens) }}
            </template>
          </el-table-column>
          <el-table-column prop="cost" label="费用" align="right">
            <template #default="{ row }">
              ¥{{ formatCost(row.cost) }}
            </template>
          </el-table-column>
        </el-table>

        <h4 style="margin-top: var(--text-3xl)">按模型统计</h4>
        <el-table :data="currentUserDetail.usageByModel" stripe border :show-overflow-tooltip="true">
          <el-table-column prop="modelName" label="模型名称" width="250" />
          <el-table-column prop="provider" label="提供商" width="150" />
          <el-table-column prop="count" label="调用次数" align="right" />
          <el-table-column prop="cost" label="费用" align="right">
            <template #default="{ row }">
              ¥{{ formatCost(row.cost) }}
            </template>
          </el-table-column>
        </el-table>

        <h4 style="margin-top: var(--text-3xl)">最近使用记录</h4>
        <el-table :data="currentUserDetail.recentUsage" stripe border :show-overflow-tooltip="true">
          <el-table-column prop="modelName" label="模型" width="200" />
          <el-table-column prop="usageType" label="类型" width="100">
            <template #default="{ row }">
              {{ getTypeName(row.usageType) }}
            </template>
          </el-table-column>
          <el-table-column prop="totalTokens" label="Token数" align="right" />
          <el-table-column prop="cost" label="费用" align="right">
            <template #default="{ row }">
              ¥{{ formatCost(row.cost) }}
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 预警信息对话框 -->
    <el-dialog
      v-model="showWarningsDialog"
      title="用量预警信息"
      width="900px"
      destroy-on-close
    >
      <div v-if="warningsLoading" class="warnings-loading">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="warnings.length > 0" class="warnings-content">
        <el-alert
          title="以下用户已达到或超过预警阈值，请及时处理"
          type="warning"
          :closable="false"
          style="margin-bottom: var(--text-lg)"
        />

        <el-table :data="warnings" stripe border :show-overflow-tooltip="true">
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="realName" label="真实姓名" width="120" />
          <el-table-column label="调用次数" width="180">
            <template #default="{ row }">
              <div class="quota-progress">
                <el-progress
                  :percentage="Math.min(row.usagePercentage, 100)"
                  :color="getProgressColor(row.usagePercentage)"
                  :stroke-width="12"
                />
                <div class="quota-text">
                  {{ formatNumber(row.currentUsage) }} / {{ formatNumber(row.monthlyQuota) }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="费用" width="180">
            <template #default="{ row }">
              <div class="quota-progress">
                <el-progress
                  :percentage="Math.min(row.costPercentage, 100)"
                  :color="getProgressColor(row.costPercentage)"
                  :stroke-width="12"
                />
                <div class="quota-text">
                  ¥{{ formatCost(row.currentCost) }} / ¥{{ formatCost(row.monthlyCostQuota) }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openQuotaSettings(row)">
                调整配额
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-empty v-else description="暂无预警信息" />
    </el-dialog>

    <!-- 配额设置对话框 -->
    <el-dialog
      v-model="showQuotaDialog"
      title="配额设置"
      width="500px"
      destroy-on-close
    >
      <el-form
        v-if="currentQuotaUser"
        :model="quotaForm"
        label-width="120px"
      >
        <el-form-item label="用户">
          <el-input :value="currentQuotaUser.username" disabled />
        </el-form-item>
        <el-form-item label="每月调用配额">
          <el-input-number
            v-model="quotaForm.monthlyQuota"
            :min="0"
            :step="1000"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="每月费用配额">
          <el-input-number
            v-model="quotaForm.monthlyCostQuota"
            :min="0"
            :step="10"
            :precision="2"
            style="width: 100%"
          />
          <span style="margin-left: var(--spacing-sm)">元</span>
        </el-form-item>
        <el-form-item label="启用预警">
          <el-switch v-model="quotaForm.warningEnabled" />
        </el-form-item>
        <el-form-item label="预警阈值">
          <el-input-number
            v-model="quotaForm.warningThreshold"
            :min="0"
            :max="100"
            :step="5"
            style="width: 100%"
          />
          <span style="margin-left: var(--spacing-sm)">%</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showQuotaDialog = false">取消</el-button>
          <el-button type="primary" @click="saveQuotaSettings">保存</el-button>
        </div>
      </template>
    </el-dialog>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue';
import {
  Refresh, DataAnalysis, Money, User, TrendCharts, Search, Download, Warning, ArrowDown,
  ChatDotRound, Picture, Microphone, VideoCamera, Document
} from '@element-plus/icons-vue';
import {
  getUsageOverview,
  getUserUsageList,
  getUserUsageDetail,
  getWarnings,
  getUserQuota,
  updateUserQuota,
  type UsageOverview,
  type UserUsage,
  type UserUsageDetail,
  type WarningInfo,
  UsageType
} from '@/api/endpoints/usage-center';
import { formatDate } from '@/utils/date';
import { exportUsageToExcel } from '@/utils/excel-export';
import UsageTypePieChart from '@/components/charts/UsageTypePieChart.vue';

// 响应式数据
const loading = ref(false);
const dateRange = ref<[Date, Date]>([
  new Date(new Date().setDate(new Date().getDate() - 30)),
  new Date()
]);
const searchKeyword = ref('');
const detailDialogVisible = ref(false);

// 概览数据
const overview = ref<UsageOverview>({
  totalCalls: 0,
  totalCost: 0,
  activeUsers: 0,
  usageByType: []
});

// 用户用量列表
const userUsageList = ref<UserUsage[]>([]);

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
});

// 当前用户详情
const currentUserDetail = ref<UserUsageDetail | null>(null);

// 预警相关
const warnings = ref<WarningInfo[]>([]);
const warningsLoading = ref(false);
const showWarningsDialog = ref(false);
const showQuotaDialog = ref(false);
const currentQuotaUser = ref<WarningInfo | null>(null);
const quotaForm = reactive({
  monthlyQuota: 10000,
  monthlyCostQuota: 100,
  warningEnabled: true,
  warningThreshold: 80
});

// 计算平均费用
const averageCost = computed(() => {
  if (overview.value.activeUsers === 0) return 0;
  return overview.value.totalCost / overview.value.activeUsers;
});

// 方法
const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

const formatCost = (cost: number): string => {
  return cost.toFixed(6);
};

const getTypeName = (type: UsageType): string => {
  const typeNames = {
    [UsageType.TEXT]: '文本',
    [UsageType.IMAGE]: '图片',
    [UsageType.AUDIO]: '语音',
    [UsageType.VIDEO]: '视频',
    [UsageType.EMBEDDING]: '向量'
  };
  return typeNames[type] || type;
};

const getTypeIcon = (type: UsageType) => {
  const icons = {
    [UsageType.TEXT]: ChatDotRound,
    [UsageType.IMAGE]: Picture,
    [UsageType.AUDIO]: Microphone,
    [UsageType.VIDEO]: VideoCamera,
    [UsageType.EMBEDDING]: Document
  };
  return icons[type] || Document;
};

const getTypeClass = (type: UsageType): string => {
  const classes = {
    [UsageType.TEXT]: 'text',
    [UsageType.IMAGE]: 'image',
    [UsageType.AUDIO]: 'audio',
    [UsageType.VIDEO]: 'video',
    [UsageType.EMBEDDING]: 'embedding'
  };
  return classes[type] || '';
};

// 加载概览数据
const loadOverview = async () => {
  try {
    const params = {
      startDate: dateRange.value[0].toISOString().split('T')[0],
      endDate: dateRange.value[1].toISOString().split('T')[0]
    };
    
    const response = await getUsageOverview(params);
    
    if (response.success && response.data) {
      overview.value = response.data;
    }
  } catch (error: any) {
    console.error('加载概览数据失败:', error);
    ElMessage.error(error.message || '加载概览数据失败');
  }
};

// 加载用户用量列表
const loadUserUsageList = async () => {
  try {
    loading.value = true;
    
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      startDate: dateRange.value[0].toISOString().split('T')[0],
      endDate: dateRange.value[1].toISOString().split('T')[0]
    };
    
    const response = await getUserUsageList(params);
    
    if (response.success && response.data) {
      userUsageList.value = response.data.items;
      pagination.total = response.data.total;
    }
  } catch (error: any) {
    console.error('加载用户用量列表失败:', error);
    ElMessage.error(error.message || '加载用户用量列表失败');
  } finally {
    loading.value = false;
  }
};

// 查看用户详情
const viewUserDetail = async (user: UserUsage) => {
  try {
    const params = {
      startDate: dateRange.value[0].toISOString().split('T')[0],
      endDate: dateRange.value[1].toISOString().split('T')[0]
    };
    
    const response = await getUserUsageDetail(user.userId, params);
    
    if (response.success && response.data) {
      currentUserDetail.value = response.data;
      detailDialogVisible.value = true;
    }
  } catch (error: any) {
    console.error('加载用户详情失败:', error);
    ElMessage.error(error.message || '加载用户详情失败');
  }
};

// 导出CSV
const exportCSV = () => {
  try {
    // 准备CSV数据
    const csvData = [];

    // 添加标题行
    csvData.push(['用户名', '真实姓名', '邮箱', '调用次数', 'Token数', '总费用(元)']);

    // 添加数据行
    userUsageList.value.forEach(user => {
      csvData.push([
        user.username,
        user.realName || '',
        user.email || '',
        user.totalCalls,
        user.totalTokens,
        user.totalCost.toFixed(6)
      ]);
    });

    // 转换为CSV字符串
    const csvContent = csvData.map(row => row.join(',')).join('\n');

    // 添加BOM以支持中文
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // 创建下载链接
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);

    // 生成文件名
    const startDate = dateRange.value[0].toISOString().split('T')[0];
    const endDate = dateRange.value[1].toISOString().split('T')[0];
    link.setAttribute('download', `用量统计_${startDate}_${endDate}.csv`);

    // 触发下载
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    ElMessage.success('CSV导出成功');
  } catch (error: any) {
    console.error('导出CSV失败:', error);
    ElMessage.error('导出CSV失败');
  }
};

// 导出Excel
const exportExcel = () => {
  try {
    const success = exportUsageToExcel(userUsageList.value, dateRange.value);

    if (success) {
      ElMessage.success('Excel导出成功');
    } else {
      ElMessage.error('Excel导出失败');
    }
  } catch (error: any) {
    console.error('导出Excel失败:', error);
    ElMessage.error('导出Excel失败');
  }
};

// 处理导出命令
const handleExportCommand = (command: string) => {
  if (command === 'csv') {
    exportCSV();
  } else if (command === 'excel') {
    exportExcel();
  }
};

// 加载预警信息
const loadWarnings = async () => {
  try {
    warningsLoading.value = true;
    const response = await getWarnings();

    if (response.success && response.data) {
      warnings.value = response.data;
    } else {
      warnings.value = [];
    }
  } catch (error: any) {
    console.error('加载预警信息失败:', error);
    warnings.value = [];
  } finally {
    warningsLoading.value = false;
  }
};

// 打开配额设置
const openQuotaSettings = async (user: WarningInfo) => {
  try {
    currentQuotaUser.value = user;

    // 加载用户配额信息
    const response = await getUserQuota(user.userId);

    if (response.success && response.data) {
      quotaForm.monthlyQuota = response.data.monthlyQuota;
      quotaForm.monthlyCostQuota = response.data.monthlyCostQuota;
      quotaForm.warningEnabled = response.data.warningEnabled;
      quotaForm.warningThreshold = response.data.warningThreshold;
    }

    showQuotaDialog.value = true;
  } catch (error: any) {
    console.error('加载配额信息失败:', error);
    ElMessage.error('加载配额信息失败');
  }
};

// 保存配额设置
const saveQuotaSettings = async () => {
  if (!currentQuotaUser.value) return;

  try {
    const response = await updateUserQuota(currentQuotaUser.value.userId, quotaForm);

    if (response.success) {
      ElMessage.success('配额设置保存成功');
      showQuotaDialog.value = false;
      // 重新加载预警信息
      await loadWarnings();
    } else {
      ElMessage.error(response.message || '配额设置保存失败');
    }
  } catch (error: any) {
    console.error('保存配额设置失败:', error);
    ElMessage.error('保存配额设置失败');
  }
};

// 获取进度条颜色
const getProgressColor = (percentage: number): string => {
  if (percentage >= 100) return 'var(--danger-color)';
  if (percentage >= 80) return 'var(--warning-color)';
  return 'var(--success-color)';
};

// 刷新数据
const refreshData = () => {
  loadOverview();
  loadUserUsageList();
  loadWarnings();
};

// 日期变化
const handleDateChange = () => {
  refreshData();
};

// 搜索
const handleSearch = () => {
  // TODO: 实现搜索功能
  loadUserUsageList();
};

// 分页变化
const handlePageChange = () => {
  loadUserUsageList();
};

const handleSizeChange = () => {
  pagination.page = 1;
  loadUserUsageList();
};

// 生命周期
onMounted(() => {
  refreshData();
});
</script>

<style scoped lang="scss">
// 导入全局样式变量
@import '@/styles/design-tokens.scss';

.usage-center-timeline {
  background: var(--bg-secondary, var(--bg-container));  // ✅ 与考勤中心一致
  padding: var(--text-2xl);
}

.overview-stats {
  margin-bottom: var(--text-3xl);
  
  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      
      .stat-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--text-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-3xl);
        
        &.primary {
          background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
          color: white;
        }
        
        &.success {
          background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
          color: white;
        }
        
        &.warning {
          background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
          color: #d97706;
        }
        
        &.info {
          background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
          color: #0284c7;
        }

        &.danger {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          color: #dc2626;
        }
      }

      .stat-info {
        flex: 1;

        .stat-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }

        .stat-value {
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--text-primary);
        }
      }
    }
  }
}

.chart-card,
.usage-type-card,
.user-usage-card {
  margin-bottom: var(--text-3xl);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
  }
}

.type-stat {
  display: flex;
  align-items: center;
  gap: var(--text-sm);
  padding: var(--text-lg);
  border-radius: var(--spacing-sm);
  background: #f9fafb;
  
  .type-icon {
    width: var(--icon-size); height: var(--icon-size);
    border-radius: var(--spacing-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-2xl);
    color: white;
    
    &.text {
      background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
    }
    
    &.image {
      background: var(--gradient-pink);
    }
    
    &.audio {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
    
    &.video {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }
    
    &.embedding {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }
  }
  
  .type-info {
    flex: 1;
    
    .type-name {
      font-size: var(--text-base);
      color: var(--text-secondary);
      margin-bottom: var(--spacing-xs);
    }
    
    .type-count {
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-sm);
    }
    
    .type-cost {
      font-size: var(--text-sm);
      color: var(--success-color);
      font-weight: 500;
    }
  }
}

.cost-value {
  color: var(--success-color);
  font-weight: 600;
}

.pagination {
  margin-top: var(--text-2xl);
  display: flex;
  justify-content: flex-end;
}

.user-detail {
  h4 {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--text-sm) 0;
  }
}

// 预警对话框样式
.warnings-loading {
  padding: var(--spacing-10xl) 0;
}

.warnings-content {
  .quota-progress {
    .quota-text {
      margin-top: var(--spacing-xs);
      font-size: var(--text-sm);
      color: var(--text-secondary);
      text-align: center;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}
</style>

