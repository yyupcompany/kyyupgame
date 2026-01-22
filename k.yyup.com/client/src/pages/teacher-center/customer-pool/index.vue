<template>
  <UnifiedCenterLayout
    title="客户资源池"
    description="查看所有客户资源并申请跟踪"
    icon="User"
  >
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-button
        type="primary"
        :disabled="selectedCustomers.length === 0"
        @click="handleBatchApply"
      >
        <UnifiedIcon name="check" :size="16" />
        批量申请 ({{ selectedCustomers.length }})
      </el-button>
      <el-button @click="loadCustomers">
        <UnifiedIcon name="refresh" :size="16" />
        刷新
      </el-button>
    </template>

    <!-- 统计卡片 - 直接使用 UnifiedCenterLayout 提供的网格容器 -->
    <template #stats>
      <StatCard
        icon="user"
        title="总客户数"
        :value="stats.total"
        subtitle="所有客户"
        type="primary"
        :trend="stats.total > 0 ? 'up' : 'stable'"
        clickable
      />
      <StatCard
        icon="user"
        title="未分配"
        :value="stats.unassigned"
        subtitle="可申请的客户"
        type="success"
        :trend="stats.unassigned > 0 ? 'up' : 'stable'"
        clickable
      />
      <StatCard
        icon="check"
        title="已分配给我"
        :value="stats.mine"
        subtitle="我负责的客户"
        type="warning"
        :trend="stats.mine > 0 ? 'up' : 'stable'"
        clickable
      />
      <StatCard
        icon="user"
        title="已分配给他人"
        :value="stats.assigned"
        subtitle="其他教师负责"
        type="info"
        :trend="stats.assigned > 0 ? 'down' : 'stable'"
        clickable
      />
    </template>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-card shadow="never">
        <el-form :model="filterForm" inline>
          <el-form-item label="分配状态">
            <el-select v-model="filterForm.assignmentStatus" placeholder="选择状态" clearable @change="loadCustomers">
              <el-option label="全部" value="" />
              <el-option label="未分配" value="unassigned" />
              <el-option label="已分配给我" value="mine" />
              <el-option label="已分配给他人" value="assigned" />
            </el-select>
          </el-form-item>

          <el-form-item label="客户来源">
            <el-select v-model="filterForm.source" placeholder="选择来源" clearable @change="loadCustomers">
              <el-option label="全部" value="" />
              <el-option label="线上咨询" value="online" />
              <el-option label="电话咨询" value="phone" />
              <el-option label="现场咨询" value="onsite" />
              <el-option label="转介绍" value="referral" />
            </el-select>
          </el-form-item>

          <el-form-item label="搜索">
            <el-input
              v-model="filterForm.keyword"
              placeholder="客户姓名/电话"
              clearable
              @clear="loadCustomers"
              @keyup.enter="loadCustomers"
            >
              <template #append>
                <el-button @click="loadCustomers">
                  <UnifiedIcon name="search" :size="16" />
                </el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 客户列表 -->
    <div class="customer-list">
      <el-card shadow="never">
        <div class="table-wrapper">
<el-table class="responsive-table"
          v-loading="loading"
          :data="customers"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" :selectable="isSelectable" />
          
          <el-table-column prop="name" label="客户姓名" min-width="120" />
          
          <el-table-column prop="phone" label="联系电话" min-width="130" />
          
          <el-table-column prop="source" label="客户来源" min-width="100">
            <template #default="{ row }">
              <el-tag :type="getSourceType(row.source)" size="small">
                {{ getSourceText(row.source) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="分配状态" min-width="120">
            <template #default="{ row }">
              <el-tag :type="getAssignmentStatusType(row)" size="small">
                {{ getAssignmentStatusText(row) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="assignedTeacherName" label="负责教师" min-width="100">
            <template #default="{ row }">
              {{ row.assignedTeacherName || '-' }}
            </template>
          </el-table-column>
          
          <el-table-column prop="createdAt" label="创建时间" min-width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="!row.assigned_teacher_id"
                type="primary"
                size="small"
                @click="handleApply(row)"
              >
                申请跟踪
              </el-button>
              <el-button
                v-else-if="row.assignmentStatus === 'mine'"
                type="success"
                size="small"
                disabled
              >
                已分配给我
              </el-button>
              <el-button
                v-else
                type="info"
                size="small"
                disabled
              >
                已分配
              </el-button>
            </template>
          </el-table-column>
        </el-table>
</div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadCustomers"
            @current-change="loadCustomers"
          />
        </div>
      </el-card>
    </div>

    <!-- 申请对话框 -->
    <el-dialog
      v-model="applyDialogVisible"
      :title="isBatchApply ? '批量申请客户' : '申请客户'"
      width="500px"
    >
      <el-form :model="applyForm" label-width="80px">
        <el-form-item label="申请客户">
          <div v-if="isBatchApply" class="apply-customers-list">
            <el-tag
              v-for="customer in applyCustomers"
              :key="customer.id"
              closable
              @close="removeApplyCustomer(customer.id)"
            >
              {{ customer.name }} ({{ customer.phone }})
            </el-tag>
          </div>
          <div v-else>
            {{ applyCustomers[0]?.name }} ({{ applyCustomers[0]?.phone }})
          </div>
        </el-form-item>

        <el-form-item label="申请理由">
          <el-input
            v-model="applyForm.applyReason"
            type="textarea"
            :rows="4"
            placeholder="请输入申请理由（选填）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="applyDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmitApply">
          提交申请
        </el-button>
      </template>
    </el-dialog>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import StatCard from '@/components/centers/StatCard.vue'

import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { formatDateTime } from '@/utils/date';
import { customerApplicationApi } from '@/api/endpoints/customer-application';
import { useUserStore } from '@/stores/user';

// 用户store
const userStore = useUserStore();

// 响应式数据
const loading = ref(false);
const submitting = ref(false);
const applyDialogVisible = ref(false);
const isBatchApply = ref(false);
const selectedCustomers = ref<any[]>([]);
const applyCustomers = ref<any[]>([]);

// 统计数据
const stats = reactive({
  total: 0,
  unassigned: 0,
  mine: 0,
  assigned: 0,
});

// 筛选表单
const filterForm = reactive({
  assignmentStatus: '',
  source: '',
  keyword: '',
});

// 申请表单
const applyForm = reactive({
  applyReason: '',
});

// 客户列表
const customers = ref<any[]>([]);

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 加载客户列表
const loadCustomers = async () => {
  loading.value = true;
  try {
    // TODO: 调用实际的API
    // 这里需要一个新的API端点来获取所有客户（包括分配状态）
    // const response = await customerPoolApi.getAllCustomers({
    //   ...filterForm,
    //   page: pagination.page,
    //   pageSize: pagination.pageSize,
    // });

    // 模拟数据
    customers.value = [
      {
        id: 1,
        name: '张三',
        phone: '13800138001',
        source: 'online',
        assigned_teacher_id: null,
        assignmentStatus: 'unassigned',
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: '李四',
        phone: '13800138002',
        source: 'phone',
        assigned_teacher_id: userStore.userId,
        assignmentStatus: 'mine',
        assignedTeacherName: '我',
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        name: '王五',
        phone: '13800138003',
        source: 'onsite',
        assigned_teacher_id: 999,
        assignmentStatus: 'assigned',
        assignedTeacherName: '其他教师',
        createdAt: new Date().toISOString(),
      },
    ];

    pagination.total = 3;

    // 更新统计
    stats.total = 3;
    stats.unassigned = 1;
    stats.mine = 1;
    stats.assigned = 1;
  } catch (error: any) {
    console.error('加载客户列表失败:', error);
    ElMessage.error(error.message || '加载客户列表失败');
  } finally {
    loading.value = false;
  }
};

// 判断行是否可选（只有未分配的客户可以批量选择）
const isSelectable = (row: any) => {
  return !row.assigned_teacher_id;
};

// 处理选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedCustomers.value = selection;
};

// 单个申请
const handleApply = (customer: any) => {
  isBatchApply.value = false;
  applyCustomers.value = [customer];
  applyForm.applyReason = '';
  applyDialogVisible.value = true;
};

// 批量申请
const handleBatchApply = () => {
  if (selectedCustomers.value.length === 0) {
    ElMessage.warning('请选择要申请的客户');
    return;
  }

  isBatchApply.value = true;
  applyCustomers.value = [...selectedCustomers.value];
  applyForm.applyReason = '';
  applyDialogVisible.value = true;
};

// 移除申请客户
const removeApplyCustomer = (customerId: number) => {
  const index = applyCustomers.value.findIndex(c => c.id === customerId);
  if (index > -1) {
    applyCustomers.value.splice(index, 1);
  }

  if (applyCustomers.value.length === 0) {
    applyDialogVisible.value = false;
  }
};

// 提交申请
const handleSubmitApply = async () => {
  if (applyCustomers.value.length === 0) {
    ElMessage.warning('没有要申请的客户');
    return;
  }

  submitting.value = true;
  try {
    const customerIds = applyCustomers.value.map(c => c.id);
    const response = await customerApplicationApi.applyForCustomers({
      customerIds,
      applyReason: applyForm.applyReason || undefined,
    });

    const result = response.data;
    if (result.successCount > 0) {
      ElMessage.success(`成功申请 ${result.successCount} 个客户`);

      if (result.failedCount > 0) {
        ElMessage.warning(`${result.failedCount} 个客户申请失败`);
      }

      // 刷新列表
      loadCustomers();
      applyDialogVisible.value = false;
      selectedCustomers.value = [];
    } else {
      ElMessage.error('申请失败');
    }
  } catch (error: any) {
    console.error('申请失败:', error);
    ElMessage.error(error.message || '申请失败');
  } finally {
    submitting.value = false;
  }
};

// 获取来源文本
const getSourceText = (source: string) => {
  const sourceMap: Record<string, string> = {
    online: '线上咨询',
    phone: '电话咨询',
    onsite: '现场咨询',
    referral: '转介绍',
  };
  return sourceMap[source] || source;
};

// 获取来源标签类型
const getSourceType = (source: string) => {
  const typeMap: Record<string, any> = {
    online: 'primary',
    phone: 'success',
    onsite: 'warning',
    referral: 'info',
  };
  return typeMap[source] || 'info';
};

// 获取分配状态文本
const getAssignmentStatusText = (row: any) => {
  if (!row.assigned_teacher_id) return '未分配';
  if (row.assignmentStatus === 'mine') return '已分配给我';
  return '已分配给他人';
};

// 获取分配状态标签类型
const getAssignmentStatusType = (row: any) => {
  if (!row.assigned_teacher_id) return 'info';
  if (row.assignmentStatus === 'mine') return 'success';
  return 'warning';
};

// 生命周期
onMounted(() => {
  loadCustomers();
});
</script>

<style lang="scss" scoped>
@use "@/styles/design-tokens.scss" as *;

/* ==================== 筛选区域 ==================== */
.filter-section {
  margin-bottom: var(--spacing-xl);

  :deep(.el-card) {
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
    background: var(--bg-card);
  }

  :deep(.el-form-item) {
    margin-bottom: 0;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: var(--text-primary);
  }
}

/* ==================== 客户列表区域 ==================== */
.customer-list {
  :deep(.el-card) {
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
    background: var(--bg-card);
  }

  .table-wrapper {
    :deep(.el-table) {
      border-radius: var(--radius-md);
      overflow: hidden;

      &::before {
        display: none;
      }

      th.el-table__cell {
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-weight: 600;
      }

      tr:hover > td.el-table__cell {
        background: var(--bg-secondary);
      }
    }
  }

  .pagination-wrapper {
    margin-top: var(--spacing-xl);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
  }
}

/* ==================== 申请客户列表 ==================== */
.apply-customers-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

/* ==================== 对话框样式 ==================== */
:deep(.el-dialog) {
  border-radius: var(--radius-lg);

  .el-dialog__header {
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
  }

  .el-dialog__body {
    padding: var(--spacing-xl);
  }

  .el-dialog__footer {
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: 1px solid var(--border-color);
  }
}

/* ==================== 响应式设计 ==================== */
@media (max-width: var(--breakpoint-md)) {
  .filter-section {
    .filter-form {
      :deep(.el-form) {
        flex-direction: column;

        .el-form-item {
          margin-bottom: var(--spacing-sm);
          width: 100%;
        }
      }

      :deep(.el-select),
      :deep(.el-input) {
        width: 100%;
      }
    }
  }
}
</style>


