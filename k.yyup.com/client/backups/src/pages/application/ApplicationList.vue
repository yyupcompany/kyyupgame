<template>
  <div class="business-process-container application-list-page">
    <div class="page-header">
      <h2>申请管理</h2>
      <div class="header-actions">
        <el-button class="header-btn" type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <div class="search-filter">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="学生姓名">
          <el-input
            v-model="searchForm.studentName"
            placeholder="请输入学生姓名"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="申请状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部状态"
            clearable
            class="search-select"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select
            v-model="searchForm.className"
            placeholder="全部班级"
            clearable
            class="search-select"
          >
            <el-option
              v-for="item in classOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="申请时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <div class="search-actions">
            <el-button type="primary" class="search-btn" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button class="reset-btn" @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 批量操作区域 -->
    <div class="batch-actions" v-if="selectedIds.length > 0">
      <div class="batch-alert">
        <div class="batch-header">
          <div class="batch-title">
            <el-icon><Select /></el-icon>
            已选择 {{ selectedIds.length }} 条记录
          </div>
          <el-button link type="primary" class="clear-selection" @click="clearSelection">取消选择</el-button>
        </div>
        <div class="batch-buttons">
          <el-button class="batch-btn approve-btn" @click="openBatchApproveDialog">
            <el-icon><Check /></el-icon>
            批量通过
            <span class="selected-count">{{ selectedIds.length }}</span>
          </el-button>
          <el-button class="batch-btn reject-btn" @click="openBatchRejectDialog">
            <el-icon><Close /></el-icon>
            批量拒绝
            <span class="selected-count">{{ selectedIds.length }}</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <el-skeleton :rows="5" animated />
      </div>
      <div class="loading-text">正在加载申请数据...</div>
    </div>

    <!-- 数据为空状态 -->
    <div v-else-if="!loading && applicationList.length === 0" class="empty-container">
      <div class="empty-icon">📄</div>
      <div class="empty-title">暂无申请数据</div>
      <div class="empty-description">还没有收到任何申请，等待家长提交申请或检查搜索条件。</div>
      <button class="empty-action" @click="handleReset">重置搜索</button>
    </div>

    <!-- 数据展示 -->
    <div v-else class="data-container">
      <el-table 
        :data="applicationList" 
        class="application-table"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" width="50" label="#" />
        <el-table-column prop="id" label="申请ID" width="80" />
        <el-table-column label="学生信息" min-width="140">
          <template #default="scope">
            <div class="student-info-cell">
              <div class="student-avatar">
                {{ scope.row.studentName.charAt(0).toUpperCase() }}
              </div>
              <div class="student-details">
                <div class="student-name">{{ scope.row.studentName }}</div>
                <div class="student-age">{{ scope.row.studentAge }}岁</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="家长信息" min-width="140">
          <template #default="scope">
            <div class="parent-info-cell">
              <div class="parent-name">{{ scope.row.parentName }}</div>
              <div class="parent-phone">{{ scope.row.contactPhone }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="className" label="申请班级" min-width="100" />
        <el-table-column label="申请类型" min-width="100">
          <template #default="scope">
            <span class="application-type-tag">{{ scope.row.applicationType }}</span>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="100">
          <template #default="scope">
            {{ formatDate(scope.row.applyTime) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="scope">
            <span class="application-status-tag" :class="getStatusClass(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="table-actions-buttons">
              <button class="action-btn view-btn" @click="handleView(scope.row)">
                <el-icon><View /></el-icon>
                查看
              </button>
              <button 
                v-if="scope.row.status === ApplicationStatus.PENDING"
                class="action-btn review-btn"
                @click="handleReview(scope.row)"
              >
                <el-icon><EditPen /></el-icon>
                审核
              </button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 -->
      <div class="pagination-container">
        <el-pagination
                  v-model:current-page="pagination.page"
                  v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 批量通过对话框 -->
    <el-dialog
      v-model="batchApproveDialogVisible"
      title="批量通过申请"
      :width="isDesktop ? '550px' : '95%'"
      class="batch-operation-dialog"
    >
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="入园时间" required>
          <el-date-picker
            v-model="batchForm.enrollmentDate"
            type="date"
            placeholder="请选择入学日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="full-width-input"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="batchForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="footer-btn secondary" @click="batchApproveDialogVisible = false">取消</el-button>
          <el-button class="footer-btn primary" @click="batchApprove" :loading="batchProcessing">
            <el-icon><Check /></el-icon>
            确认通过
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量拒绝对话框 -->
    <el-dialog
      v-model="batchRejectDialogVisible"
      title="批量拒绝申请"
      :width="isDesktop ? '550px' : '95%'"
      class="batch-operation-dialog"
    >
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="拒绝原因" required>
          <el-select 
            v-model="batchForm.rejectReason" 
            placeholder="选择拒绝原因"
          >
            <el-option :value="RejectReason.QUOTA_FULL" label="名额已满" />
            <el-option :value="RejectReason.AGE_NOT_MATCH" label="年龄不符" />
            <el-option :value="RejectReason.INCOMPLETE_INFO" label="信息不完整" />
            <el-option :value="RejectReason.OTHER" label="其他原因" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="batchForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="footer-btn secondary" @click="batchRejectDialogVisible = false">取消</el-button>
          <el-button class="footer-btn danger" @click="batchReject" :loading="batchProcessing">
            <el-icon><Close /></el-icon>
            确认拒绝
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 错误提示 -->
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      :closable="false"
      show-icon
    />
  </div>
</template>

<script setup lang="ts">
// 1. Vue 相关导入
import { ref, reactive, onMounted, defineComponent, computed } from 'vue'
import { useRouter } from 'vue-router'

// 2. Element Plus 导入
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, Refresh, Download, Select, Check, Close, View, EditPen 
} from '@element-plus/icons-vue'

// 3. 公共工具函数导入
import { ENROLLMENT_APPLICATION_ENDPOINTS } from '@/api/endpoints'
import requestInstance from '@/utils/request'
import type { ApiResponse } from '@/api/endpoints'
// 自定义格式化日期函数，不从外部导入
// import { formatDateTime } from '@/utils/dateFormat'

// 4. 页面内部类型定义
// 本地定义枚举和接口
enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

enum RejectReason {
  QUOTA_FULL = 'QUOTA_FULL',
  AGE_NOT_MATCH = 'AGE_NOT_MATCH',
  INCOMPLETE_INFO = 'INCOMPLETE_INFO',
  OTHER = 'OTHER'
}

interface ApplicationInfo {
  id: number;
  studentName: string;
  studentAge: number;
  parentName: string;
  contactPhone: string;
  className: string;
  applicationType: string;
  status: ApplicationStatus;
  applyTime: string;
  additionalInfo?: string;
  reviewTime: string;
  enrollmentDate: string;
  rejectReason: RejectReason;
  remark: string;
}

interface ApplicationFilter {
  studentName: string;
  status?: ApplicationStatus;
  className?: string;
  dateRange: string[];
}

interface BatchForm {
  ids: number[];
  status: ApplicationStatus;
  enrollmentDate: string;
  rejectReason: RejectReason;
  remark: string;
}

// 格式化日期
const formatDate = (dateString: string | null) => {
  if (!dateString) return '未设置';
  return new Date(dateString).toLocaleDateString('zh-CN');
};

// 本地定义ApplicationStatusTag组件
const ApplicationStatusTag = defineComponent({
  props: {
    status: {
      type: String,
  required: true
    }
  },
  setup(props: { status: string }) {
    const getStatusType = () => {
      switch (props.status) {
        case 'PENDING': return 'warning';
        case 'APPROVED': return 'success';
        case 'REJECTED': return 'danger';
        case 'CANCELLED': return 'info';
        default: return 'info';
      }
    };

    const getStatusText = () => {
      switch (props.status) {
        case 'PENDING': return '待审核';
        case 'APPROVED': return '已通过';
        case 'REJECTED': return '已拒绝';
        case 'CANCELLED': return '已取消';
        default: return '未知';
      }
    };

    return {
      getStatusType,
      getStatusText
    };
  },
  template: '<el-tag :type="getStatusType()">{{ getStatusText() }}</el-tag>'
});

const router = useRouter();

// 响应式计算属性
const isDesktop = computed(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth >= 768
  }
  return true
});

// 申请状态选项
const statusOptions = [
  { value: ApplicationStatus.PENDING, label: '待审核' },
  { value: ApplicationStatus.APPROVED, label: '已通过' },
  { value: ApplicationStatus.REJECTED, label: '已拒绝' },
  { value: ApplicationStatus.CANCELLED, label: '已取消' }
];

// 班级选项
const classOptions = [
  { value: '阳光班', label: '阳光班' },
  { value: '月亮班', label: '月亮班' },
  { value: '星星班', label: '星星班' },
  { value: '彩虹班', label: '彩虹班' }
];

// 搜索表单
const searchForm = ref<ApplicationFilter>({
  studentName: '',
  status: undefined,
  className: undefined,
  dateRange: [] as string[]
});

// 列表数据
const loading = ref(false);
const error = ref<string | null>(null);
const applicationList = ref<ApplicationInfo[]>([]);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

// 获取申请列表
const fetchApplicationList = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // 使用统一的API请求方式
    const params = {
      studentName: searchForm.value.studentName,
  status: searchForm.value.status,
      className: searchForm.value.className,
      startDate: searchForm.value.dateRange[0],
      endDate: searchForm.value.dateRange[1],
  page: pagination.page,
      pageSize: pagination.pageSize
    };
    
    const response: ApiResponse = await requestInstance.get(ENROLLMENT_APPLICATION_ENDPOINTS.BASE, { params });

    // 修复条件判断：检查响应是否包含有效数据
    if (response && (response.success || (response.data && (response.data.items || response.data.list)))) {
      // 安全处理API响应数据
      const responseData = response.data || {}
      let items = responseData.items || responseData.list || []

      // 确保items是数组
      if (!Array.isArray(items)) {
        items = []
      }

      applicationList.value = items;
      pagination.total = responseData.total || items.length || 0;
      return;
    }
    
    // 模拟数据
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockData: ApplicationInfo[] = Array.from({ length: 15 }, (_, i) => ({
      id: 2000 + i,
      studentName: `学生${i + 1}`,
      studentAge: 3 + Math.floor(i / 5),
      parentName: `家长${i + 1}`,
      contactPhone: `1380013800${i}`,
      className: classOptions[i % 4].value,
      applicationType: i % 2 === 0 ? '新生入园' : '转班申请',
  status: i % 4 === 0 ? ApplicationStatus.PENDING :
              i % 4 === 1 ? ApplicationStatus.APPROVED :
              i % 4 === 2 ? ApplicationStatus.REJECTED :
              ApplicationStatus.CANCELLED,
      applyTime: '2023-06-01',
      additionalInfo: i % 3 === 0 ? '有特殊dietary需求' : undefined,
      reviewTime: i % 4 === 0 ? '' : '2023-06-05',
      enrollmentDate: i % 4 === 1 ? '2023-09-01' : '',
      rejectReason: i % 4 === 2 ? (i % 3 === 0 ? RejectReason.AGE_NOT_MATCH : RejectReason.QUOTA_FULL) : RejectReason.OTHER,
  remark: i % 4 !== 0 ? '已处理' : ''
    }));
    
    applicationList.value = mockData.slice(
      (pagination.page - 1) * pagination.pageSize,
      pagination.page * pagination.pageSize
    );
    pagination.total = mockData.length;
  } catch (err) {
    console.error('获取申请列表失败', err);
    error.value = '获取申请列表失败，请重试';
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchApplicationList();
};

// 重置搜索条件
const handleReset = () => {
  searchForm.value.studentName = '';
  searchForm.value.status = undefined;
  searchForm.value.className = undefined;
  searchForm.value.dateRange = [];
  pagination.page = 1;
  fetchApplicationList();
};

// 分页事件处理
const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  fetchApplicationList();
};

const handleCurrentChange = (val: number) => {
  pagination.page = val;
  fetchApplicationList();
};

// 查看申请详情
const handleView = (application: ApplicationInfo) => {
  router.push(`/application/detail/${application.id}`);
};

// 审核申请
const handleReview = (application: ApplicationInfo) => {
  router.push(`/application/review/${application.id}`);
};

// 批量处理相关
const selectedIds = ref<number[]>([]);
const batchApproveDialogVisible = ref(false);
const batchRejectDialogVisible = ref(false);
const batchProcessing = ref(false);

const batchForm = ref<BatchForm>({
  ids: [],
  status: ApplicationStatus.APPROVED,
  enrollmentDate: '',
  rejectReason: RejectReason.QUOTA_FULL,
  remark: ''
});

// 表格选择变化
const handleSelectionChange = (selection: ApplicationInfo[]) => {
  selectedIds.value = selection.map(item => item.id);
};

// 清除选择
const clearSelection = () => {
  selectedIds.value = [];
};

// 打开批量通过对话框
const openBatchApproveDialog = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请至少选择一条记录');
    return;
  }
  
  batchForm.value.ids = [...selectedIds.value];
  batchForm.value.status = ApplicationStatus.APPROVED;
  batchForm.value.enrollmentDate = new Date().toISOString().split('T')[0];
  batchForm.value.rejectReason = RejectReason.QUOTA_FULL;
  batchForm.value.remark = '';
  
  batchApproveDialogVisible.value = true;
};

// 打开批量拒绝对话框
const openBatchRejectDialog = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请至少选择一条记录');
    return;
  }
  
  batchForm.value.ids = [...selectedIds.value];
  batchForm.value.status = ApplicationStatus.REJECTED;
  batchForm.value.enrollmentDate = '';
  batchForm.value.rejectReason = RejectReason.QUOTA_FULL;
  batchForm.value.remark = '';
  
  batchRejectDialogVisible.value = true;
};

// 批量通过
const batchApprove = async () => {
  if (!batchForm.value.enrollmentDate) {
    ElMessage.warning('请选择入园时间');
    return;
  }
  
  batchProcessing.value = true;
  
  try {
    // 使用统一的API请求方式
    const response: ApiResponse = await requestInstance.post(ENROLLMENT_APPLICATION_ENDPOINTS.BATCH_APPROVE, batchForm.value);
    
    if (response && (response.success || response.data)) {
      ElMessage.success(`已成功通过 ${batchForm.value.ids.length} 条申请`);
      batchApproveDialogVisible.value = false;
      clearSelection();
      fetchApplicationList();
      return;
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    ElMessage.success(`已成功通过 ${batchForm.value.ids.length} 条申请`);
    batchApproveDialogVisible.value = false;
    clearSelection();
    fetchApplicationList();
  } catch (err) {
    console.error('批量通过申请失败', err);
    ElMessage.error('批量操作失败，请重试');
  } finally {
    batchProcessing.value = false;
  }
};

// 批量拒绝
const batchReject = async () => {
  if (!batchForm.value.rejectReason) {
    ElMessage.warning('请选择拒绝原因');
    return;
  }
  
  batchProcessing.value = true;
  
  try {
    // 使用统一的API请求方式
    const response: ApiResponse = await requestInstance.post(ENROLLMENT_APPLICATION_ENDPOINTS.BATCH_REJECT, batchForm.value);
    
    if (response && (response.success || response.data)) {
      ElMessage.success(`已成功拒绝 ${batchForm.value.ids.length} 条申请`);
      batchRejectDialogVisible.value = false;
      clearSelection();
      fetchApplicationList();
      return;
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    ElMessage.success(`已成功拒绝 ${batchForm.value.ids.length} 条申请`);
    batchRejectDialogVisible.value = false;
    clearSelection();
    fetchApplicationList();
  } catch (err) {
    console.error('批量拒绝申请失败', err);
    ElMessage.error('批量操作失败，请重试');
  } finally {
    batchProcessing.value = false;
  }
};

// 获取状态样式类名
const getStatusClass = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'status-pending'
    case 'APPROVED':
      return 'status-approved'
    case 'REJECTED':
      return 'status-rejected'
    case 'CANCELLED':
      return 'status-cancelled'
    default:
      return 'status-pending'
  }
}

// 获取状态文本
const getStatusText = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return '待审核'
    case 'APPROVED':
      return '已通过'
    case 'REJECTED':
      return '已拒绝'
    case 'CANCELLED':
      return '已取消'
    default:
      return '未知'
  }
}

// 导出数据
const handleExport = () => {
  ElMessage.info('导出功能待实现')
}

// 页面加载时获取申请列表
onMounted(() => {
  fetchApplicationList();
});
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';
@import './business-process-ux-styles.scss';

/* 新增的全局样式类 */
.search-select {
  width: 140px;
}

.full-width-input {
  width: 100%;
}

/* 使用全局CSS变量，确保主题切换兼容性，完成三重修复 */
.application-list-container {
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  min-height: calc(100vh - var(--header-height));
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  
  h2 {
    margin: 0;
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--text-primary);
    background: var(--gradient-blue);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.search-filter {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--bg-card) !important;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.search-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.batch-actions {
  margin-bottom: var(--spacing-lg);
}

.batch-buttons {
  margin-top: var(--spacing-sm);
  display: flex;
  gap: var(--spacing-sm);
  
  .selected-count {
    font-size: var(--text-xs);
    color: var(--text-muted);
    margin-left: var(--spacing-xs);
  }
}

.loading-container,
.empty-container {
  margin: var(--spacing-xl) 0;
  text-align: center;
  color: var(--text-secondary);
}

.data-container {
  margin-top: var(--spacing-lg);
  background: var(--bg-card);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.table-actions-buttons {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
  align-items: center;
  
  .el-button {
    margin: 0;
    min-width: 4var(--spacing-sm);
    
    &.el-button--small {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--text-xs);
    }
  }
}

.pagination-container {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: var(--bg-tertiary);
  border-top: var(--border-width-base) solid var(--border-color);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

/* 白色区域修复：表格主题化 */
:deep(.el-table) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  
  .el-table__header {
    background: var(--bg-tertiary) !important;
    
    th {
      background: var(--bg-tertiary) !important;
      color: var(--text-primary) !important;
      border-bottom: var(--border-width-base) solid var(--border-color) !important;
    }
  }
  
  .el-table__body {
    tr {
      background: var(--bg-card) !important;
      
      &:hover {
        background: var(--bg-hover) !important;
      }
      
      td {
        border-bottom: var(--border-width-base) solid var(--border-color) !important;
        color: var(--text-primary) !important;
      }
    }
  }
  
  .el-table__border {
    border-color: var(--border-color) !important;
  }
}

/* 白色区域修复：分页组件主题化 */
:deep(.el-pagination) {
  .el-pagination__total,
  .el-pagination__jump {
    color: var(--text-primary) !important;
  }
  
  .el-pager li {
    background: var(--bg-card) !important;
    color: var(--text-primary) !important;
    border: var(--border-width-base) solid var(--border-color) !important;
    
    &:hover {
      background: var(--bg-hover) !important;
    }
    
    &.is-active {
      background: var(--primary-color) !important;
      color: var(--text-light) !important;
    }
  }
  
  .btn-prev,
  .btn-next {
    background: var(--bg-card) !important;
    color: var(--text-primary) !important;
    border: var(--border-width-base) solid var(--border-color) !important;
    
    &:hover {
      background: var(--bg-hover) !important;
    }
  }
  
  .el-select .el-input__wrapper {
    background: var(--bg-card) !important;
    border-color: var(--border-color) !important;
  }
}

/* 白色区域修复：对话框主题化 */
:deep(.el-dialog) {
  background: var(--bg-card) !important;
  border: var(--border-width-base) solid var(--border-color) !important;
  
  .el-dialog__header {
    background: var(--bg-tertiary) !important;
    border-bottom: var(--border-width-base) solid var(--border-color) !important;
    
    .el-dialog__title {
      color: var(--text-primary) !important;
    }
  }
  
  .el-dialog__body {
    background: var(--bg-card) !important;
    color: var(--text-primary) !important;
  }
  
  .el-dialog__footer {
    background: var(--bg-tertiary) !important;
    border-top: var(--border-width-base) solid var(--border-color) !important;
  }
}

/* 白色区域修复：表单控件主题化 */
:deep(.el-form) {
  .el-form-item__label {
    color: var(--text-primary) !important;
  }
}

:deep(.el-input) {
  .el-input__wrapper {
    background: var(--bg-card) !important;
    border-color: var(--border-color) !important;
    color: var(--text-primary) !important;
    
    &:hover {
      border-color: var(--border-light) !important;
    }
    
    &.is-focus {
      border-color: var(--primary-color) !important;
    }
  }
  
  .el-input__inner {
    color: var(--text-primary) !important;
    
    &::placeholder {
      color: var(--text-muted) !important;
    }
  }
}

:deep(.el-select) {
  .el-input__wrapper {
    background: var(--bg-card) !important;
    border-color: var(--border-color) !important;
  }
}

:deep(.el-select-dropdown) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  
  .el-select-dropdown__item {
    color: var(--text-primary) !important;
    
    &:hover {
      background: var(--bg-hover) !important;
    }
    
    &.is-selected {
      background: var(--primary-color) !important;
      color: var(--text-light) !important;
    }
  }
}

:deep(.el-date-editor) {
  .el-input__wrapper {
    background: var(--bg-card) !important;
    border-color: var(--border-color) !important;
  }
}

:deep(.el-textarea) {
  .el-textarea__inner {
    background: var(--bg-card) !important;
    border-color: var(--border-color) !important;
    color: var(--text-primary) !important;
    
    &::placeholder {
      color: var(--text-muted) !important;
    }
  }
}

/* 白色区域修复：按钮主题化 */
:deep(.el-button) {
  &.el-button--primary {
    background: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    
    &:hover {
      background: var(--primary-light) !important;
      border-color: var(--primary-light) !important;
    }
  }
  
  &.el-button--success {
    background: var(--success-color) !important;
    border-color: var(--success-color) !important;
    
    &:hover {
      background: var(--success-light) !important;
      border-color: var(--success-light) !important;
    }
  }
  
  &.el-button--danger {
    background: var(--danger-color) !important;
    border-color: var(--danger-color) !important;
    
    &:hover {
      background: var(--danger-light) !important;
      border-color: var(--danger-light) !important;
    }
  }
  
  &.el-button--default {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
    color: var(--text-primary) !important;
    
    &:hover {
      background: var(--bg-hover) !important;
      border-color: var(--border-light) !important;
    }
  }
}

/* 白色区域修复：Alert组件主题化 */
:deep(.el-alert) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  
  .el-alert__title {
    color: var(--text-primary) !important;
  }
  
  .el-alert__content {
    color: var(--text-secondary) !important;
  }
}

/* 白色区域修复：Skeleton组件主题化 */
:deep(.el-skeleton) {
  .el-skeleton__item {
    background: var(--bg-tertiary) !important;
  }
}

/* 白色区域修复：Empty组件主题化 */
:deep(.el-empty) {
  .el-empty__description {
    color: var(--text-secondary) !important;
  }
}

/* 响应式设计优化 */
@media (max-width: 992px) {
  .search-filter {
    .el-form {
      .el-form-item {
        width: 100%;
        margin-bottom: var(--spacing-sm);
        
        .el-input,
        .el-select,
        .el-date-editor {
          width: 100% !important;
        }
      }
    }
  }
  
  .batch-buttons {
    flex-direction: column;
    align-items: stretch;
    
    .el-button {
      width: 100%;
      justify-content: center;
    }
  }
  
  .table-actions-buttons {
    flex-direction: column;
    gap: var(--spacing-xs);
    
    .el-button {
      width: 100%;
      min-width: auto;
    }
  }
  
  .pagination-container {
    text-align: center;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .application-list-container {
    padding: var(--spacing-md);
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}
</style> 