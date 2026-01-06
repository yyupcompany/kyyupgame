<template>
  <div class="refund-management-page">
    <div class="page-header">
      <h1>退费管理</h1>
      <p>管理学生退费申请和审批流程</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card>
          <el-statistic title="待审批" :value="stats.pending">
            <template #suffix>笔</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="已通过" :value="stats.approved">
            <template #suffix>笔</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="已拒绝" :value="stats.rejected">
            <template #suffix>笔</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="退费总额" :value="formatMoney(stats.totalAmount)">
            <template #prefix>¥</template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="学生姓名">
          <el-input v-model="filters.studentName" placeholder="输入学生姓名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="选择状态" clearable style="width: 150px">
            <el-option label="待审批" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadRefunds">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetFilters">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 退费列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>退费申请列表</span>
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            新建退费申请
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="refunds"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="refundAmount" label="退费金额" width="120">
          <template #default="{ row }">
            ¥{{ formatMoney(row.refundAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="refundReason" label="退费原因" width="200" show-overflow-tooltip />
        <el-table-column prop="applyTime" label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.applyTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
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
              v-if="row.status === 'approved'"
              type="primary"
              size="small"
              @click="handleRefund(row)"
            >
              确认退款
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

    <!-- 新建退费申请对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新建退费申请"
      width="600px"
    >
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="学生">
          <el-select v-model="createForm.studentId" placeholder="选择学生" style="width: 100%">
            <el-option
              v-for="student in students"
              :key="student.id"
              :label="`${student.name} - ${student.className}`"
              :value="student.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="退费金额">
          <el-input-number v-model="createForm.refundAmount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="退费原因">
          <el-input
            v-model="createForm.refundReason"
            type="textarea"
            :rows="4"
            placeholder="请输入退费原因"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="createForm.remark"
            type="textarea"
            :rows="3"
            placeholder="其他说明（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate" :loading="creating">
          提交申请
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="退费详情"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="申请ID">{{ currentRefund.id }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ currentRefund.studentName }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ currentRefund.className }}</el-descriptions-item>
        <el-descriptions-item label="退费金额">¥{{ formatMoney(currentRefund.refundAmount) }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ formatDate(currentRefund.applyTime) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentRefund.status)">
            {{ getStatusLabel(currentRefund.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="退费原因" :span="2">{{ currentRefund.refundReason }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentRefund.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item v-if="currentRefund.approveTime" label="审批时间">
          {{ formatDate(currentRefund.approveTime) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRefund.approver" label="审批人">
          {{ currentRefund.approver }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRefund.refundTime" label="退款时间">
          {{ formatDate(currentRefund.refundTime) }}
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { get, post, put } from '@/utils/request'

// 数据
const loading = ref(false)
const creating = ref(false)
const refunds = ref([])
const students = ref([])
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

const stats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  totalAmount: 0
})

const filters = ref({
  studentName: '',
  status: null
})

const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const currentRefund = ref<any>({})

const createForm = ref({
  studentId: null,
  refundAmount: 0,
  refundReason: '',
  remark: ''
})

// 方法
const loadRefunds = async () => {
  try {
    loading.value = true
    const response = await get('/finance/refunds', {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      ...filters.value
    })

    if (response.success) {
      refunds.value = response.data.items || []
      pagination.value.total = response.data.total || 0
      
      // 更新统计
      stats.value = response.data.stats || stats.value
    }
  } catch (error) {
    console.error('加载退费列表失败:', error)
    ElMessage.error('加载退费列表失败')
  } finally {
    loading.value = false
  }
}

const loadStudents = async () => {
  try {
    const response = await get('/students', { status: 'active' })
    if (response.success) {
      students.value = response.data.items || []
    }
  } catch (error) {
    console.error('加载学生列表失败:', error)
  }
}

const resetFilters = () => {
  filters.value = {
    studentName: '',
    status: null
  }
  loadRefunds()
}

const handleCreate = async () => {
  try {
    creating.value = true
    const response = await post('/finance/refunds', createForm.value)
    
    if (response.success) {
      ElMessage.success('退费申请提交成功')
      showCreateDialog.value = false
      loadRefunds()
    }
  } catch (error) {
    console.error('创建退费申请失败:', error)
    ElMessage.error('创建退费申请失败')
  } finally {
    creating.value = false
  }
}

const handleApprove = async (refund: any) => {
  try {
    await ElMessageBox.confirm('确定通过该退费申请吗？', '确认', { type: 'success' })
    
    const response = await put(`/finance/refunds/${refund.id}/approve`, {})
    if (response.success) {
      ElMessage.success('审批通过')
      loadRefunds()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleReject = async (refund: any) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝退费', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入拒绝原因'
    })
    
    const response = await put(`/finance/refunds/${refund.id}/reject`, { reason })
    if (response.success) {
      ElMessage.success('已拒绝')
      loadRefunds()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleRefund = async (refund: any) => {
  try {
    await ElMessageBox.confirm('确认已完成退款操作吗？', '确认退款', { type: 'warning' })
    
    const response = await put(`/finance/refunds/${refund.id}/refund`, {})
    if (response.success) {
      ElMessage.success('退款确认成功')
      loadRefunds()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleViewDetail = (refund: any) => {
  currentRefund.value = refund
  showDetailDialog.value = true
}

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  loadRefunds()
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  loadRefunds()
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待审批',
    'approved': '已通过',
    'rejected': '已拒绝',
    'refunded': '已退款'
  }
  return statusMap[status] || status
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger',
    'refunded': 'info'
  }
  return typeMap[status] || 'info'
}

const formatMoney = (amount: number) => {
  return amount?.toFixed(2) || '0.00'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadRefunds()
  loadStudents()
})
</script>

<style scoped lang="scss">
.refund-management-page {
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

  .stats-row {
    margin-bottom: var(--text-lg);
  }

  .filter-card {
    margin-bottom: var(--text-lg);
  }

  .list-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .pagination-container {
    margin-top: var(--text-2xl);
    display: flex;
    justify-content: flex-end;
  }
}
</style>

