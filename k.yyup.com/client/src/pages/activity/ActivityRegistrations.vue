<template>
  <div class="activity-registrations-page">
    <div class="page-header">
      <h1>活动报名审批</h1>
      <p>管理和审批活动报名申请</p>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="活动">
          <el-select v-model="filters.activityId" placeholder="选择活动" clearable style="max-width: 200px; width: 100%">
            <el-option
              v-for="activity in activities"
              :key="activity.id"
              :label="activity.title"
              :value="activity.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="选择状态" clearable style="max-width: 150px; width: 100%">
            <el-option label="待审批" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadRegistrations">
            <UnifiedIcon name="Search" />
            查询
          </el-button>
          <el-button @click="resetFilters">
            <UnifiedIcon name="Refresh" />
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 报名列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>报名列表</span>
          <div class="header-actions">
            <el-button type="success" @click="batchApprove" :disabled="selectedIds.length === 0">
              <UnifiedIcon name="Check" />
              批量通过
            </el-button>
            <el-button type="danger" @click="batchReject" :disabled="selectedIds.length === 0">
              <UnifiedIcon name="Close" />
              批量拒绝
            </el-button>
          </div>
        </div>
      </template>

      <div class="table-wrapper">
<el-table class="responsive-table"
        v-loading="loading"
        :data="registrations"
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="activityTitle" label="活动名称" min-width="200" />
        <el-table-column prop="userName" label="报名人" width="120" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="registrationTime" label="报名时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.registrationTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="danger"
              size="small"
              @click="handleReject(row)"
            >
              拒绝
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="handleViewDetail(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
</div>

      <!-- 分页 -->
      <div class="pagination-container">
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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="报名详情"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="活动名称">{{ currentRegistration.activityTitle }}</el-descriptions-item>
        <el-descriptions-item label="报名人">{{ currentRegistration.userName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentRegistration.phone }}</el-descriptions-item>
        <el-descriptions-item label="报名时间">{{ formatDate(currentRegistration.registrationTime) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentRegistration.status)">
            {{ getStatusLabel(currentRegistration.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentRegistration.remark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Check, Close } from '@element-plus/icons-vue'
import { get, put } from '@/utils/request'

// 数据
const loading = ref(false)
const activities = ref([])
const registrations = ref([])
const selectedIds = ref<number[]>([])
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

const filters = ref({
  activityId: null,
  status: null
})

const detailDialogVisible = ref(false)
const currentRegistration = ref<any>({})

// 方法
const loadActivities = async () => {
  try {
    const response = await get('/activities', { status: 'active' })
    if (response.success) {
      activities.value = response.data.items || []
    }
  } catch (error) {
    console.error('加载活动列表失败:', error)
  }
}

const loadRegistrations = async () => {
  try {
    loading.value = true
    const response = await get('/activity-registrations', {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      ...filters.value
    })

    if (response.success) {
      registrations.value = response.data.items || []
      pagination.value.total = response.data.total || 0
    }
  } catch (error) {
    console.error('加载报名列表失败:', error)
    ElMessage.error('加载报名列表失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    activityId: null,
    status: null
  }
  loadRegistrations()
}

const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleApprove = async (registration: any) => {
  try {
    await ElMessageBox.confirm('确定通过该报名申请吗？', '确认', { type: 'success' })
    
    const response = await put(`/activity-registrations/${registration.id}/approve`, {})
    if (response.success) {
      ElMessage.success('审批通过')
      loadRegistrations()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleReject = async (registration: any) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝报名', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入拒绝原因'
    })
    
    const response = await put(`/activity-registrations/${registration.id}/reject`, { reason })
    if (response.success) {
      ElMessage.success('已拒绝')
      loadRegistrations()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const batchApprove = async () => {
  try {
    await ElMessageBox.confirm(`确定通过选中的 ${selectedIds.value.length} 条报名申请吗？`, '批量通过', { type: 'success' })
    
    const response = await put('/activity-registrations/batch-approve', { ids: selectedIds.value })
    if (response.success) {
      ElMessage.success('批量审批成功')
      loadRegistrations()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const batchReject = async () => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入拒绝原因', '批量拒绝', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入拒绝原因'
    })
    
    const response = await put('/activity-registrations/batch-reject', { 
      ids: selectedIds.value,
      reason 
    })
    if (response.success) {
      ElMessage.success('批量拒绝成功')
      loadRegistrations()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleViewDetail = (registration: any) => {
  currentRegistration.value = registration
  detailDialogVisible.value = true
}

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  loadRegistrations()
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  loadRegistrations()
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待审批',
    'approved': '已通过',
    'rejected': '已拒绝'
  }
  return statusMap[status] || status
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  }
  return typeMap[status] || 'info'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadActivities()
  loadRegistrations()
})
</script>

<style scoped lang="scss">
@import "@/styles/design-tokens.scss";
@import "@/styles/list-components-optimization.scss";

.activity-registrations-page {
  padding: var(--text-3xl);

  .page-header {
    margin-bottom: var(--text-3xl);

    h1 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--text-3xl);
      font-weight: 600;
      color: var(--text-primary);
    }

    p {
      margin: 0;
      font-size: var(--text-base);
      color: var(--info-color);
    }
  }

  .filter-card {
    margin-bottom: var(--text-lg);
  }

  .list-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }
  }

  .pagination-container {
    margin-top: var(--text-2xl);
    display: flex;
    justify-content: flex-end;
  }
}
</style>

