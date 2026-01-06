<template>
  <UnifiedCenterLayout>
    <div class="center-container document-instance-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>📄 我的文档</h1>
      <p>管理您创建和分配的文档实例</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <UnifiedIcon name="default" />
            <div class="stat-info">
              <div class="stat-value">{{ stats.draft }}</div>
              <div class="stat-label">草稿</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <UnifiedIcon name="Edit" />
            <div class="stat-info">
              <div class="stat-value">{{ stats.filling }}</div>
              <div class="stat-label">填写中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <UnifiedIcon name="eye" />
            <div class="stat-info">
              <div class="stat-value">{{ stats.review }}</div>
              <div class="stat-label">审核中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <UnifiedIcon name="Check" />
            <div class="stat-info">
              <div class="stat-value">{{ stats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选和操作 -->
    <el-card class="filter-card">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索文档标题..."
            :prefix-icon="Search"
            @input="handleSearch"
            clearable
          />
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterStatus" placeholder="状态筛选" clearable @change="loadInstances">
            <el-option label="全部状态" value="" />
            <el-option label="草稿" value="draft" />
            <el-option label="填写中" value="filling" />
            <el-option label="审核中" value="review" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="sortBy" placeholder="排序方式" @change="loadInstances">
            <el-option label="创建时间" value="createdAt" />
            <el-option label="更新时间" value="updatedAt" />
            <el-option label="截止时间" value="deadline" />
            <el-option label="进度" value="progress" />
          </el-select>
        </el-col>
        <el-col :span="10" class="action-buttons">
          <el-button type="primary" @click="handleCreateDocument">
            <UnifiedIcon name="Plus" />
            新建文档
          </el-button>
          <el-button
            type="danger"
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
          >
            <UnifiedIcon name="Delete" />
            批量删除
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 文档列表 -->
    <el-card class="list-card">
      <div class="table-wrapper">
<el-table class="responsive-table"
        v-loading="loading"
        :data="instances"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        stripe
      >
        <el-table-column type="selection" width="var(--table-selection-width)" />
        <el-table-column prop="title" label="文档标题" min-width="var(--table-title-width)">
          <template #default="{ row }">
            <div class="document-title">
              <span class="title-text" @click="handleViewDocument(row)">{{ row.title }}</span>
              <el-tag v-if="row.deadline && isOverdue(row.deadline)" type="danger" size="small">
                已逾期
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="template" label="模板" width="var(--table-column-width-sm)">
          <template #default="{ row }">
            {{ row.template?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="var(--table-column-width-xs)">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="var(--table-column-width-md)">
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress"
              :color="getProgressColor(row.progress)"
              stroke-width="var(--progress-stroke-width)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止时间" width="var(--table-date-width)">
          <template #default="{ row }">
            {{ formatDate(row.deadline) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="var(--table-date-width)">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="var(--table-actions-width)" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'draft' || row.status === 'filling'"
              type="primary"
              size="small"
              @click="handleEditDocument(row)"
            >
              <UnifiedIcon name="Edit" />
              编辑
            </el-button>
            <el-button
              v-else
              type="default"
              size="small"
              @click="handleViewDocument(row)"
            >
              <UnifiedIcon name="eye" />
              查看
            </el-button>
            <el-button
              type="success"
              size="small"
              @click="handleExportDocument(row)"
            >
              <UnifiedIcon name="Download" />
              导出
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDeleteDocument(row)"
            >
              <UnifiedIcon name="Delete" />
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
</div>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="PAGE_SIZES"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        class="pagination"
      />
    </el-card>
  </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Document, Edit, View, CircleCheckFilled, Search,
  Plus, Delete, Download
} from '@element-plus/icons-vue';
import { getInstances, deleteInstance, batchDeleteInstances } from '@/api/endpoints/document-instances';

const router = useRouter();

// 数据
const loading = ref(false);
const searchKeyword = ref('');
const filterStatus = ref('');
const sortBy = ref('createdAt');
const selectedIds = ref<number[]>([]);

const stats = ref({
  draft: 0,
  filling: 0,
  review: 0,
  completed: 0
});

const instances = ref<any[]>([]);

const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
});

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

// 进度阈值常量
const PROGRESS_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 70,
  MEDIUM: 50
};

// 分页尺寸常量
const PAGE_SIZES = [10, 20, 50, 100];

const getProgressColor = (progress: number) => {
  if (progress >= PROGRESS_THRESHOLDS.EXCELLENT) return 'var(--success-color)';
  if (progress >= PROGRESS_THRESHOLDS.GOOD) return 'var(--warning-color)';
  if (progress >= PROGRESS_THRESHOLDS.MEDIUM) return 'var(--danger-color)';
  return 'var(--info-color)';
};

const formatDate = (date: string | Date | null) => {
  if (!date) return '-';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const isOverdue = (deadline: string | Date) => {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
};

const handleSearch = () => {
  pagination.value.page = 1;
  loadInstances();
};

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  loadInstances();
};

const handlePageChange = (page: number) => {
  pagination.value.page = page;
  loadInstances();
};

const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id);
};

const handleCreateDocument = () => {
  router.push('/document-template-center');
};

const handleViewDocument = (row: any) => {
  router.push(`/document-instances/${row.id}`);
};

const handleEditDocument = (row: any) => {
  router.push(`/document-instances/${row.id}/edit`);
};

const handleExportDocument = async (row: any) => {
  try {
    ElMessage.info('导出功能开发中...');
    // TODO: 调用导出API
  } catch (error) {
    ElMessage.error('导出失败');
  }
};

const handleDeleteDocument = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个文档吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const response = await deleteInstance(row.id);
    if (response.success) {
      ElMessage.success('删除成功');
      loadInstances();
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个文档吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const response = await batchDeleteInstances(selectedIds.value);
    if (response.success) {
      ElMessage.success(`成功删除 ${response.data.deletedCount} 个文档`);
      selectedIds.value = [];
      loadInstances();
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败');
    }
  }
};

// 加载数据
const loadInstances = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      sortBy: sortBy.value,
      sortOrder: 'DESC'
    };

    if (filterStatus.value) {
      params.status = filterStatus.value;
    }

    if (searchKeyword.value) {
      params.keyword = searchKeyword.value;
    }

    const response = await getInstances(params);
    if (response.success) {
      instances.value = response.data.items;
      pagination.value.total = response.data.total;
      
      // 更新统计
      updateStats();
    }
  } catch (error) {
    console.error('加载文档列表失败:', error);
    ElMessage.error('加载文档列表失败');
  } finally {
    loading.value = false;
  }
};

const updateStats = () => {
  // TODO: 调用统计API或从列表数据计算
  stats.value = {
    draft: instances.value.filter(i => i.status === 'draft').length,
    filling: instances.value.filter(i => i.status === 'filling').length,
    review: instances.value.filter(i => i.status === 'review').length,
    completed: instances.value.filter(i => i.status === 'completed').length
  };
};

onMounted(() => {
  loadInstances();
});
</script>

<style scoped lang="scss">
.document-instance-list {
  padding: var(--spacing-xl);

  .page-header {
    margin-bottom: var(--spacing-xl);

    h1 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--text-3xl);
    }

    p {
      margin: 0;
      color: var(--text-secondary);
    }
  }

  .stats-row {
    margin-bottom: var(--spacing-xl);

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);

        .stat-info {
          .stat-value {
            font-size: var(--text-3xl);
            font-weight: bold;
            line-height: 1;
            margin-bottom: var(--spacing-xs);
          }

          .stat-label {
            font-size: var(--text-base);
            color: var(--text-secondary);
          }
        }
      }
    }
  }

  .filter-card {
    margin-bottom: var(--spacing-xl);

    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-sm);
    }
  }

  .list-card {
    .document-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      .title-text {
        cursor: pointer;
        color: var(--primary-color);

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .pagination {
      margin-top: var(--spacing-xl);
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>

