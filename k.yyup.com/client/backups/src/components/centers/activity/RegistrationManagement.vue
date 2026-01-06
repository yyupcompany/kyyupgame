<template>
  <div class="registration-management">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="success" :icon="Check" @click="handleBatchApprove">
          批量通过
        </el-button>
        <el-button type="warning" :icon="Close" @click="handleBatchReject">
          批量拒绝
        </el-button>
        <el-button type="primary" :icon="Download" @click="handleExport">
          导出数据
        </el-button>
      </div>
      <div class="toolbar-right">
        <div class="search-box">
          <i class="icon-search"></i>
          <el-input
            v-model="searchForm.studentName"
            placeholder="搜索学生姓名..."
            clearable
            @keyup.enter="handleSearch"
          />
        </div>
        <el-button :icon="Refresh" @click="handleRefresh">
          <i class="icon-refresh"></i>
          <span>刷新</span>
        </el-button>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters">
      <el-form :model="searchForm" inline>
        <el-form-item label="活动">
          <el-select v-model="searchForm.activityId" placeholder="选择活动" clearable filterable>
            <el-option
              v-for="activity in activityOptions"
              :key="activity.id"
              :label="activity.title"
              :value="activity.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="报名状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="家长姓名">
          <el-input v-model="searchForm.parentName" placeholder="输入家长姓名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 报名列表 -->
    <div class="table-container">
      <DataTable
        :data="registrationList"
        :columns="tableColumns"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @selection-change="handleSelectionChange"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <!-- 活动信息列 -->
        <template #activity="{ row }">
          <div class="activity-info">
            <div class="activity-title">{{ row.activityTitle }}</div>
            <div class="activity-time">{{ formatDateTime(row.activityStartTime) }}</div>
          </div>
        </template>

        <!-- 学生信息列 -->
        <template #student="{ row }">
          <div class="student-info">
            <div class="student-name">{{ row.studentName }}</div>
            <div class="student-age">{{ row.studentAge }}岁</div>
          </div>
        </template>

        <!-- 家长信息列 -->
        <template #parent="{ row }">
          <div class="parent-info">
            <div class="parent-name">{{ row.parentName }}</div>
            <div class="parent-phone">{{ row.parentPhone }}</div>
          </div>
        </template>

        <!-- 报名状态列 -->
        <template #status="{ row }">
          <el-tag :type="getStatusTagType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>

        <!-- 报名时间列 -->
        <template #registeredAt="{ row }">
          <div class="time-info">
            <div>{{ formatDate(row.registeredAt) }}</div>
            <div class="time-detail">{{ formatTime(row.registeredAt) }}</div>
          </div>
        </template>

        <!-- 操作列 -->
        <template #actions="{ row }">
          <div class="action-buttons">
            <el-button type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
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
            <el-dropdown>
              <el-button size="small">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleSendMessage(row)">
                    发送消息
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleViewHistory(row)">
                    查看历史
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleCancel(row)" class="text-danger">
                    取消报名
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- 报名详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="报名详情"
      width="800px"
      destroy-on-close
    >
      <RegistrationDetail
        v-if="selectedRegistration"
        :registration="selectedRegistration"
        @approve="handleDetailApprove"
        @reject="handleDetailReject"
        @close="detailDialogVisible = false"
      />
    </el-dialog>

    <!-- 批量审核对话框 -->
    <el-dialog
      v-model="batchDialogVisible"
      :title="batchAction === 'approve' ? '批量通过' : '批量拒绝'"
      width="500px"
    >
      <el-form :model="batchForm" label-width="80px">
        <el-form-item label="审核备注">
          <el-input
            v-model="batchForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入审核备注（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleConfirmBatch"
          :loading="batchLoading"
        >
          确认{{ batchAction === 'approve' ? '通过' : '拒绝' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Close, Download, Refresh, ArrowDown } from '@element-plus/icons-vue'

// 组件导入
import DataTable from '@/components/common/DataTable.vue'
import RegistrationDetail from './RegistrationDetail.vue'

// API导入
import {
  getRegistrations,
  approveRegistration,
  batchApproveRegistrations,
  getActivities,
  type Registration,
  type Activity
} from '@/api/activity-center'

// 数据状态
const loading = ref(false)
const batchLoading = ref(false)
const registrationList = ref<Registration[]>([])
const selectedRegistrations = ref<Registration[]>([])
const activityOptions = ref<Activity[]>([])

// 对话框状态
const detailDialogVisible = ref(false)
const batchDialogVisible = ref(false)
const selectedRegistration = ref<Registration | null>(null)

// 搜索表单
const searchForm = ref({
  activityId: '',
  studentName: '',
  parentName: '',
  status: ''
})

// 批量操作表单
const batchForm = ref({
  remark: ''
})

const batchAction = ref<'approve' | 'reject'>('approve')

// 分页配置
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表格列配置
const tableColumns = [
  { type: 'selection', width: 55 },
  { prop: 'activity', label: '活动信息', slot: 'activity', minWidth: 200 },
  { prop: 'student', label: '学生信息', slot: 'student', width: 120 },
  { prop: 'parent', label: '家长信息', slot: 'parent', width: 140 },
  { prop: 'status', label: '状态', slot: 'status', width: 100 },
  { prop: 'registeredAt', label: '报名时间', slot: 'registeredAt', width: 140 },
  { prop: 'actions', label: '操作', slot: 'actions', width: 200, fixed: 'right' }
]

// 加载报名列表
const loadRegistrationList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm.value,
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize
    }
    
    const response = await getRegistrations(params)
    if (response.success) {
      registrationList.value = response.data.items
      pagination.value.total = response.data.total
    }
  } catch (error) {
    console.error('Failed to load registrations:', error)
    ElMessage.error('加载报名列表失败')
  } finally {
    loading.value = false
  }
}

// 加载活动选项
const loadActivityOptions = async () => {
  try {
    const response = await getActivities({ pageSize: 100 })
    if (response.success) {
      activityOptions.value = response.data.items
    }
  } catch (error) {
    console.error('Failed to load activity options:', error)
  }
}

// 处理搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  loadRegistrationList()
}

// 处理重置
const handleReset = () => {
  searchForm.value = {
    activityId: '',
    studentName: '',
    parentName: '',
    status: ''
  }
  handleSearch()
}

// 处理刷新
const handleRefresh = () => {
  loadRegistrationList()
}

// 处理导出
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 处理选择变化
const handleSelectionChange = (selection: Registration[]) => {
  selectedRegistrations.value = selection
}

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.value.currentPage = page
  loadRegistrationList()
}

// 处理页大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  loadRegistrationList()
}

// 处理查看详情
const handleView = (registration: Registration) => {
  selectedRegistration.value = registration
  detailDialogVisible.value = true
}

// 处理单个通过
const handleApprove = async (registration: Registration) => {
  try {
    await approveRegistration(registration.id, { status: 'approved' })
    ElMessage.success('审核通过')
    loadRegistrationList()
  } catch (error) {
    console.error('Failed to approve registration:', error)
    ElMessage.error('审核失败')
  }
}

// 处理单个拒绝
const handleReject = async (registration: Registration) => {
  try {
    const { value: remark } = await ElMessageBox.prompt(
      '请输入拒绝原因',
      '拒绝报名',
      { inputType: 'textarea' }
    )
    
    await approveRegistration(registration.id, { status: 'rejected', remark })
    ElMessage.success('已拒绝报名')
    loadRegistrationList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to reject registration:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 处理批量通过
const handleBatchApprove = () => {
  if (selectedRegistrations.value.length === 0) {
    ElMessage.warning('请选择要操作的报名记录')
    return
  }
  batchAction.value = 'approve'
  batchForm.value.remark = ''
  batchDialogVisible.value = true
}

// 处理批量拒绝
const handleBatchReject = () => {
  if (selectedRegistrations.value.length === 0) {
    ElMessage.warning('请选择要操作的报名记录')
    return
  }
  batchAction.value = 'reject'
  batchForm.value.remark = ''
  batchDialogVisible.value = true
}

// 确认批量操作
const handleConfirmBatch = async () => {
  batchLoading.value = true
  try {
    const ids = selectedRegistrations.value.map(item => item.id)
    const status = batchAction.value === 'approve' ? 'approved' : 'rejected'
    
    await batchApproveRegistrations(ids, { status, remark: batchForm.value.remark })
    
    ElMessage.success(`批量${batchAction.value === 'approve' ? '通过' : '拒绝'}成功`)
    batchDialogVisible.value = false
    loadRegistrationList()
  } catch (error) {
    console.error('Failed to batch approve registrations:', error)
    ElMessage.error('批量操作失败')
  } finally {
    batchLoading.value = false
  }
}

// 处理详情页面的审核
const handleDetailApprove = () => {
  detailDialogVisible.value = false
  loadRegistrationList()
}

const handleDetailReject = () => {
  detailDialogVisible.value = false
  loadRegistrationList()
}

// 处理发送消息
const handleSendMessage = (registration: Registration) => {
  ElMessage.info('发送消息功能开发中...')
}

// 处理查看历史
const handleViewHistory = (registration: Registration) => {
  ElMessage.info('查看历史功能开发中...')
}

// 处理取消报名
const handleCancel = async (registration: Registration) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消 ${registration.studentName} 的报名吗？`,
      '取消报名确认',
      { type: 'warning' }
    )
    
    await approveRegistration(registration.id, { status: 'cancelled' })
    ElMessage.success('已取消报名')
    loadRegistrationList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to cancel registration:', error)
      ElMessage.error('取消失败')
    }
  }
}

// 工具函数
const formatDateTime = (dateTime: string) => {
  return dateTime ? new Date(dateTime).toLocaleString() : '-'
}

const formatDate = (dateTime: string) => {
  return dateTime ? new Date(dateTime).toLocaleDateString() : '-'
}

const formatTime = (dateTime: string) => {
  return dateTime ? new Date(dateTime).toLocaleTimeString() : '-'
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const getStatusTagType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    cancelled: 'info'
  }
  return statusMap[status] || 'info'
}

// 初始化
onMounted(() => {
  loadRegistrationList()
  loadActivityOptions()
})
</script>

<style scoped lang="scss">
@import '@/styles/management.scss';

.registration-management {
  min-height: 100vh;
  background: var(--bg-hover);
}

.toolbar {
  background: var(--bg-white);
  border-radius: var(--spacing-sm);
  padding: var(--text-lg) var(--text-2xl);
  margin-bottom: var(--text-2xl);
  box-shadow: 0 2px var(--text-sm) var(--shadow-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--text-lg);
}

.filters {
  display: flex;
  gap: var(--text-lg);
  align-items: center;
  flex-wrap: wrap;
}

.table-container {
  background: var(--bg-white);
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--text-sm) var(--shadow-light);
  overflow: hidden;
}

.activity-info {
  .activity-title {
    font-weight: 500;
    margin-bottom: var(--spacing-xs);
  }
  
  .activity-time {
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
  }
}

.student-info, .parent-info {
  .student-name, .parent-name {
    font-weight: 500;
    margin-bottom: var(--spacing-sm);
  }
  
  .student-age, .parent-phone {
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
  }
}

.time-info {
  .time-detail {
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
  }
}

.action-buttons {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.text-danger {
  color: var(--el-color-danger);
}
</style>
