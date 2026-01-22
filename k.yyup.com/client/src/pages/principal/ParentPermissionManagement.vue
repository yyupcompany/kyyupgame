<template>
  <div class="parent-permission-management">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><User /></el-icon>
        家长权限管理
      </h1>
      <p class="page-subtitle">管理家长的相册、通知、活动等访问权限</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon pending">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.pending }}</div>
                <div class="stat-label">待审核</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon approved">
                <el-icon><Check /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.approved }}</div>
                <div class="stat-label">已确认</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon rejected">
                <el-icon><Close /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.rejected }}</div>
                <div class="stat-label">已拒绝</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon suspended">
                <el-icon><Pause /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.suspended }}</div>
                <div class="stat-label">已暂停</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 操作区域 -->
    <div class="action-bar">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="待审核" name="pending">
          <template #label>
            <span class="tab-label">
              待审核
              <el-badge v-if="stats.pending > 0" :value="stats.pending" class="tab-badge" />
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="已确认" name="approved" />
        <el-tab-pane label="已拒绝" name="rejected" />
        <el-tab-pane label="已暂停" name="suspended" />
        <el-tab-pane label="全部记录" name="all" />
      </el-tabs>

      <div class="action-buttons">
        <el-button
          v-if="selectedRequests.length > 0"
          type="primary"
          @click="showBatchConfirmDialog = true"
        >
          <el-icon><Select /></el-icon>
          批量操作 ({{ selectedRequests.length }})
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 申请列表 -->
    <div class="requests-table">
      <el-table
        :data="filteredRequests"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        stripe
      >
        <el-table-column type="selection" width="55" />

        <el-table-column label="申请信息" min-width="250">
          <template #default="{ row }">
            <div class="request-info">
              <div class="parent-info">
                <span class="parent-name">{{ row.parent?.realName }}</span>
                <span class="parent-phone">{{ row.parent?.phone }}</span>
              </div>
              <div class="student-info">
                <span class="student-name">学生: {{ row.student?.name }}</span>
                <el-tag size="small" type="info">{{ row.permissionScope }}</el-tag>
              </div>
              <div class="request-time">
                申请时间: {{ formatDateTime(row.requestedAt) }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="权限范围" prop="permissionScope" width="120">
          <template #default="{ row }">
            <el-tag :type="getPermissionScopeType(row.permissionScope)">
              {{ getPermissionScopeName(row.permissionScope) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" prop="status" width="100" sortable="custom">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="确认时间" prop="confirmedAt" width="160" sortable="custom">
          <template #default="{ row }">
            {{ row.confirmedAt ? formatDateTime(row.confirmedAt) : '--' }}
          </template>
        </el-table-column>

        <el-table-column label="备注信息" min-width="200">
          <template #default="{ row }">
            <div class="remark-info">
              <div v-if="row.confirmNote" class="confirm-note">
                <el-icon><Check /></el-icon>
                {{ row.confirmNote }}
              </div>
              <div v-if="row.rejectReason" class="reject-reason">
                <el-icon><Close /></el-icon>
                {{ row.rejectReason }}
              </div>
              <div v-if="row.isPermanent" class="permanent-badge">
                <el-tag size="small" type="success">永久权限</el-tag>
              </div>
              <div v-if="row.expiryDate" class="expiry-date">
                <el-icon><Clock /></el-icon>
                过期: {{ formatDate(row.expiryDate) }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                v-if="row.status === 'pending'"
                type="primary"
                size="small"
                @click="showConfirmDialog(row)"
              >
                审核
              </el-button>
              <el-button
                v-if="row.status === 'approved'"
                type="warning"
                size="small"
                @click="togglePermission(row, true)"
              >
                暂停
              </el-button>
              <el-button
                v-if="row.status === 'suspended'"
                type="success"
                size="small"
                @click="togglePermission(row, false)"
              >
                恢复
              </el-button>
              <el-button
                size="small"
                @click="viewDetails(row)"
              >
                详情
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 单个确认对话框 -->
    <el-dialog
      v-model="showSingleConfirmDialog"
      :title="`审核权限申请 - ${currentRequest?.parent?.realName}`"
      width="600px"
    >
      <div v-if="currentRequest" class="confirm-dialog-content">
        <div class="request-summary">
          <h4>申请信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="申请人">
              {{ currentRequest.parent?.realName }} ({{ currentRequest.parent?.phone }})
            </el-descriptions-item>
            <el-descriptions-item label="关联学生">
              {{ currentRequest.student?.name }}
            </el-descriptions-item>
            <el-descriptions-item label="权限范围">
              <el-tag :type="getPermissionScopeType(currentRequest.permissionScope)">
                {{ getPermissionScopeName(currentRequest.permissionScope) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="申请时间">
              {{ formatDateTime(currentRequest.requestedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="confirm-form">
          <h4>审核操作</h4>
          <el-form :model="confirmForm" label-width="100px">
            <el-form-item label="审核结果">
              <el-radio-group v-model="confirmForm.approved">
                <el-radio :label="true">确认通过</el-radio>
                <el-radio :label="false">拒绝申请</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="confirmForm.approved" label="备注说明">
              <el-input
                v-model="confirmForm.confirmNote"
                type="textarea"
                :rows="3"
                placeholder="请输入确认备注（可选）"
              />
            </el-form-item>

            <el-form-item v-if="!confirmForm.approved" label="拒绝原因">
              <el-input
                v-model="confirmForm.rejectReason"
                type="textarea"
                :rows="3"
                placeholder="请输入拒绝原因"
              />
            </el-form-item>

            <el-form-item v-if="confirmForm.approved" label="权限期限">
              <el-radio-group v-model="confirmForm.isPermanent">
                <el-radio :label="true">永久权限</el-radio>
                <el-radio :label="false">设置过期时间</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="confirmForm.approved && !confirmForm.isPermanent" label="过期时间">
              <el-date-picker
                v-model="confirmForm.expiryDate"
                type="datetime"
                placeholder="选择过期时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <template #footer>
        <el-button @click="showSingleConfirmDialog = false">取消</el-button>
        <el-button
          type="primary"
          :loading="confirming"
          @click="confirmSingleRequest"
        >
          确认
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量确认对话框 -->
    <el-dialog
      v-model="showBatchConfirmDialog"
      title="批量审核权限申请"
      width="500px"
    >
      <div class="batch-confirm-content">
        <div class="batch-summary">
          <p>已选择 <strong>{{ selectedRequests.length }}</strong> 个申请进行批量操作</p>
        </div>

        <el-form :model="batchConfirmForm" label-width="100px">
          <el-form-item label="操作类型">
            <el-radio-group v-model="batchConfirmForm.approved">
              <el-radio :label="true">批量通过</el-radio>
              <el-radio :label="false">批量拒绝</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="!batchConfirmForm.approved" label="拒绝原因">
            <el-input
              v-model="batchConfirmForm.rejectReason"
              type="textarea"
              :rows="3"
              placeholder="请输入拒绝原因"
            />
          </el-form-item>

          <el-form-item v-if="batchConfirmForm.approved" label="备注说明">
            <el-input
              v-model="batchConfirmForm.confirmNote"
              type="textarea"
              :rows="3"
              placeholder="请输入确认备注（可选）"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="showBatchConfirmDialog = false">取消</el-button>
        <el-button
          type="primary"
          :loading="batchConfirming"
          @click="confirmBatchRequests"
        >
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { parentPermissionAPI } from '@/api/modules/parent-permission'

// 状态管理
const loading = ref(false)
const confirming = ref(false)
const batchConfirming = ref(false)
const activeTab = ref('pending')
const requests = ref([])
const selectedRequests = ref([])
const stats = reactive({
  pending: 0,
  approved: 0,
  rejected: 0,
  suspended: 0
})

// 对话框状态
const showSingleConfirmDialog = ref(false)
const showBatchConfirmDialog = ref(false)
const currentRequest = ref(null)

// 表单数据
const confirmForm = reactive({
  approved: true,
  confirmNote: '',
  rejectReason: '',
  isPermanent: true,
  expiryDate: ''
})

const batchConfirmForm = reactive({
  approved: true,
  confirmNote: '',
  rejectReason: ''
})

// 计算属性
const filteredRequests = computed(() => {
  if (activeTab.value === 'all') {
    return requests.value
  }
  return requests.value.filter(request => request.status === activeTab.value)
})

// 方法
const loadRequests = async () => {
  try {
    loading.value = true
    // 这里应该调用API获取权限申请列表
    // const response = await parentPermissionAPI.getPendingRequests()
    // requests.value = response.data

    // 模拟数据
    requests.value = [
      {
        id: 1,
        parent: { realName: '张三', phone: '13800138000' },
        student: { name: '张小明' },
        permissionScope: 'all',
        status: 'pending',
        requestedAt: '2025-11-26T10:00:00Z',
        confirmedAt: null,
        confirmNote: null,
        rejectReason: null,
        isPermanent: false,
        expiryDate: null
      }
    ]

    updateStats()
  } catch (error) {
    console.error('加载权限申请失败:', error)
    ElMessage.error('加载权限申请失败')
  } finally {
    loading.value = false
  }
}

const updateStats = () => {
  stats.pending = requests.value.filter(r => r.status === 'pending').length
  stats.approved = requests.value.filter(r => r.status === 'approved').length
  stats.rejected = requests.value.filter(r => r.status === 'rejected').length
  stats.suspended = requests.value.filter(r => r.status === 'suspended').length
}

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
}

const handleSelectionChange = (selection: any[]) => {
  selectedRequests.value = selection
}

const handleSortChange = ({ prop, order }: any) => {
  // 实现排序逻辑
}

const showConfirmDialog = (request: any) => {
  currentRequest.value = request
  confirmForm.approved = true
  confirmForm.confirmNote = ''
  confirmForm.rejectReason = ''
  confirmForm.isPermanent = true
  confirmForm.expiryDate = ''
  showSingleConfirmDialog.value = true
}

const confirmSingleRequest = async () => {
  try {
    confirming.value = true

    // 调用API确认权限
    // await parentPermissionAPI.confirmPermission(currentRequest.value.id, confirmForm)

    ElMessage.success('权限审核完成')
    showSingleConfirmDialog.value = false
    await loadRequests()
  } catch (error) {
    console.error('确认权限失败:', error)
    ElMessage.error('确认权限失败')
  } finally {
    confirming.value = false
  }
}

const confirmBatchRequests = async () => {
  try {
    batchConfirming.value = true

    const confirmationIds = selectedRequests.value.map(r => r.id)

    // 调用API批量确认权限
    // await parentPermissionAPI.batchConfirmPermissions(confirmationIds, batchConfirmForm)

    ElMessage.success('批量审核完成')
    showBatchConfirmDialog.value = false
    selectedRequests.value = []
    await loadRequests()
  } catch (error) {
    console.error('批量确认权限失败:', error)
    ElMessage.error('批量确认权限失败')
  } finally {
    batchConfirming.value = false
  }
}

const togglePermission = async (request: any, suspend: boolean) => {
  try {
    const action = suspend ? '暂停' : '恢复'
    await ElMessageBox.confirm(`确定要${action}该权限吗？`, '确认操作')

    // 调用API切换权限状态
    // await parentPermissionAPI.togglePermission(request.id, suspend)

    ElMessage.success(`权限${action}成功`)
    await loadRequests()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('切换权限状态失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

const viewDetails = (request: any) => {
  // 显示详细信息
  console.log('查看详情:', request)
}

const refreshData = () => {
  loadRequests()
}

// 工具方法
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getStatusType = (status: string) => {
  const types = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    suspended: 'info'
  }
  return types[status] || 'info'
}

const getStatusName = (status: string) => {
  const names = {
    pending: '待审核',
    approved: '已确认',
    rejected: '已拒绝',
    suspended: '已暂停'
  }
  return names[status] || status
}

const getPermissionScopeType = (scope: string) => {
  const types = {
    basic: 'info',
    album: 'primary',
    notification: 'warning',
    activity: 'success',
    academic: 'danger',
    all: 'primary'
  }
  return types[scope] || 'info'
}

const getPermissionScopeName = (scope: string) => {
  const names = {
    basic: '基础权限',
    album: '相册权限',
    notification: '通知权限',
    activity: '活动权限',
    academic: '学业权限',
    all: '全部权限'
  }
  return names[scope] || scope
}

// 初始化
onMounted(() => {
  loadRequests()
})
</script>

<style lang="scss" scoped>
.parent-permission-management {
  padding: var(--spacing-lg);
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);

  .page-header {
    margin-bottom: 24px;

    .page-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--text-2xl);
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;
    }

    .page-subtitle {
      color: #909399;
      margin: 0;
      font-size: var(--text-sm);
    }
  }

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: 24px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xl);
          color: white;

          &.pending { background-color: #e6a23c; }
          &.approved { background-color: #67c23a; }
          &.rejected { background-color: #f56c6c; }
          &.suspended { background-color: #909399; }
        }

        .stat-info {
          .stat-number {
            font-size: var(--text-2xl);
            font-weight: 600;
            color: #303133;
            line-height: 1;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: var(--text-sm);
            color: #909399;
          }
        }
      }
    }
  }

  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    background: white;
    padding: var(--spacing-md);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .tab-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);

      .tab-badge {
        margin-left: 4px;
      }
    }

    .action-buttons {
      display: flex;
      gap: var(--spacing-md);
    }
  }

  .requests-table {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .request-info {
      .parent-info {
        margin-bottom: 4px;

        .parent-name {
          font-weight: 600;
          color: #303133;
          margin-right: 8px;
        }

        .parent-phone {
          color: #909399;
          font-size: var(--text-xs);
        }
      }

      .student-info {
        margin-bottom: 4px;

        .student-name {
          color: #606266;
          font-size: var(--text-sm);
          margin-right: 8px;
        }
      }

      .request-time {
        color: #c0c4cc;
        font-size: var(--text-xs);
      }
    }

    .remark-info {
      .confirm-note {
        color: #67c23a;
        font-size: var(--text-xs);
        margin-bottom: 4px;

        .el-icon {
          margin-right: 4px;
        }
      }

      .reject-reason {
        color: #f56c6c;
        font-size: var(--text-xs);
        margin-bottom: 4px;

        .el-icon {
          margin-right: 4px;
        }
      }

      .permanent-badge {
        margin-bottom: 4px;
      }

      .expiry-date {
        color: #e6a23c;
        font-size: var(--text-xs);

        .el-icon {
          margin-right: 4px;
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .confirm-dialog-content {
    .request-summary {
      margin-bottom: 24px;

      h4 {
        margin: 0 0 16px 0;
        color: #303133;
      }
    }

    .confirm-form {
      h4 {
        margin: 0 0 16px 0;
        color: #303133;
      }
    }
  }

  .batch-confirm-content {
    .batch-summary {
      margin-bottom: 24px;
      padding: var(--spacing-md);
      background-color: #f0f9ff;
      border-radius: 4px;

      strong {
        color: #409eff;
      }
    }
  }
}
</style>