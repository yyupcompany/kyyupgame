<template>
  <div class="invoice-management-page">
    <div class="page-header">
      <h1>发票管理</h1>
      <p>管理发票开具、打印和统计</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card>
          <el-statistic title="待开票" :value="stats.pending">
            <template #suffix>张</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="已开票" :value="stats.issued">
            <template #suffix>张</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="本月开票金额" :value="formatMoney(stats.monthlyAmount)">
            <template #prefix>¥</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="累计开票金额" :value="formatMoney(stats.totalAmount)">
            <template #prefix>¥</template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="发票号码">
          <el-input v-model="filters.invoiceNumber" placeholder="输入发票号码" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="客户名称">
          <el-input v-model="filters.customerName" placeholder="输入客户名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="发票类型">
          <el-select v-model="filters.invoiceType" placeholder="选择类型" clearable style="width: 150px">
            <el-option label="普通发票" value="normal" />
            <el-option label="专用发票" value="special" />
            <el-option label="电子发票" value="electronic" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="选择状态" clearable style="width: 150px">
            <el-option label="待开票" value="pending" />
            <el-option label="已开票" value="issued" />
            <el-option label="已作废" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadInvoices">
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

    <!-- 发票列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>发票列表</span>
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            开具发票
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="invoices"
        style="width: 100%"
      >
        <el-table-column prop="invoiceNumber" label="发票号码" width="150" />
        <el-table-column prop="customerName" label="客户名称" width="150" />
        <el-table-column prop="invoiceType" label="发票类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getInvoiceTypeLabel(row.invoiceType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            ¥{{ formatMoney(row.amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="taxAmount" label="税额" width="100">
          <template #default="{ row }">
            ¥{{ formatMoney(row.taxAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="issueDate" label="开票日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              @click="handleIssue(row)"
            >
              开票
            </el-button>
            <el-button
              v-if="row.status === 'issued'"
              type="primary"
              size="small"
              @click="handlePrint(row)"
            >
              打印
            </el-button>
            <el-button
              v-if="row.status === 'issued'"
              type="danger"
              size="small"
              @click="handleCancel(row)"
            >
              作废
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

    <!-- 开具发票对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="开具发票"
      width="700px"
    >
      <el-form :model="createForm" label-width="120px">
        <el-form-item label="客户名称">
          <el-input v-model="createForm.customerName" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="纳税人识别号">
          <el-input v-model="createForm.taxNumber" placeholder="请输入纳税人识别号" />
        </el-form-item>
        <el-form-item label="发票类型">
          <el-select v-model="createForm.invoiceType" placeholder="选择发票类型" style="width: 100%">
            <el-option label="普通发票" value="normal" />
            <el-option label="专用发票" value="special" />
            <el-option label="电子发票" value="electronic" />
          </el-select>
        </el-form-item>
        <el-form-item label="开票金额">
          <el-input-number v-model="createForm.amount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="税率">
          <el-select v-model="createForm.taxRate" placeholder="选择税率" style="width: 100%">
            <el-option label="0%" value="0" />
            <el-option label="3%" value="3" />
            <el-option label="6%" value="6" />
            <el-option label="9%" value="9" />
            <el-option label="13%" value="13" />
          </el-select>
        </el-form-item>
        <el-form-item label="开票项目">
          <el-input v-model="createForm.items" type="textarea" :rows="3" placeholder="请输入开票项目" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="createForm.remark" type="textarea" :rows="2" placeholder="备注信息（可选）" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate" :loading="creating">
          确认开票
        </el-button>
      </template>
    </el-dialog>

    <!-- 发票详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="发票详情"
      width="700px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="发票号码">{{ currentInvoice.invoiceNumber }}</el-descriptions-item>
        <el-descriptions-item label="发票类型">{{ getInvoiceTypeLabel(currentInvoice.invoiceType) }}</el-descriptions-item>
        <el-descriptions-item label="客户名称">{{ currentInvoice.customerName }}</el-descriptions-item>
        <el-descriptions-item label="纳税人识别号">{{ currentInvoice.taxNumber }}</el-descriptions-item>
        <el-descriptions-item label="开票金额">¥{{ formatMoney(currentInvoice.amount) }}</el-descriptions-item>
        <el-descriptions-item label="税率">{{ currentInvoice.taxRate }}%</el-descriptions-item>
        <el-descriptions-item label="税额">¥{{ formatMoney(currentInvoice.taxAmount) }}</el-descriptions-item>
        <el-descriptions-item label="价税合计">¥{{ formatMoney(currentInvoice.totalAmount) }}</el-descriptions-item>
        <el-descriptions-item label="开票日期">{{ currentInvoice.issueDate }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentInvoice.status)">
            {{ getStatusLabel(currentInvoice.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="开票项目" :span="2">{{ currentInvoice.items }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentInvoice.remark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button v-if="currentInvoice.status === 'issued'" type="primary" @click="handlePrint(currentInvoice)">
          打印发票
        </el-button>
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
const invoices = ref([])
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

const stats = ref({
  pending: 0,
  issued: 0,
  monthlyAmount: 0,
  totalAmount: 0
})

const filters = ref({
  invoiceNumber: '',
  customerName: '',
  invoiceType: null,
  status: null
})

const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const currentInvoice = ref<any>({})

const createForm = ref({
  customerName: '',
  taxNumber: '',
  invoiceType: 'normal',
  amount: 0,
  taxRate: '6',
  items: '',
  remark: ''
})

// 方法
const loadInvoices = async () => {
  try {
    loading.value = true
    const response = await get('/finance/invoices', {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      ...filters.value
    })

    if (response.success) {
      invoices.value = response.data.items || []
      pagination.value.total = response.data.total || 0
      stats.value = response.data.stats || stats.value
    }
  } catch (error) {
    console.error('加载发票列表失败:', error)
    ElMessage.error('加载发票列表失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    invoiceNumber: '',
    customerName: '',
    invoiceType: null,
    status: null
  }
  loadInvoices()
}

const handleCreate = async () => {
  try {
    creating.value = true
    const response = await post('/finance/invoices', createForm.value)
    
    if (response.success) {
      ElMessage.success('发票开具成功')
      showCreateDialog.value = false
      loadInvoices()
    }
  } catch (error) {
    console.error('开具发票失败:', error)
    ElMessage.error('开具发票失败')
  } finally {
    creating.value = false
  }
}

const handleIssue = async (invoice: any) => {
  try {
    await ElMessageBox.confirm('确定开具该发票吗？', '确认', { type: 'success' })
    
    const response = await put(`/finance/invoices/${invoice.id}/issue`, {})
    if (response.success) {
      ElMessage.success('发票开具成功')
      loadInvoices()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handlePrint = (invoice: any) => {
  ElMessage.info('正在准备打印...')
  window.print()
}

const handleCancel = async (invoice: any) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入作废原因', '作废发票', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入作废原因'
    })
    
    const response = await put(`/finance/invoices/${invoice.id}/cancel`, { reason })
    if (response.success) {
      ElMessage.success('发票已作废')
      loadInvoices()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleViewDetail = (invoice: any) => {
  currentInvoice.value = invoice
  showDetailDialog.value = true
}

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  loadInvoices()
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  loadInvoices()
}

const getInvoiceTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    'normal': '普通发票',
    'special': '专用发票',
    'electronic': '电子发票'
  }
  return typeMap[type] || type
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待开票',
    'issued': '已开票',
    'cancelled': '已作废'
  }
  return statusMap[status] || status
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    'pending': 'warning',
    'issued': 'success',
    'cancelled': 'danger'
  }
  return typeMap[status] || 'info'
}

const formatMoney = (amount: number) => {
  return amount?.toFixed(2) || '0.00'
}

onMounted(() => {
  loadInvoices()
})
</script>

<style scoped lang="scss">
.invoice-management-page {
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

