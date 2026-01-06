<template>
  <div class="fee-management-container">
    <!-- 页面头部 -->
    <div class="fee-header">
      <div class="header-content">
        <div class="page-title">
          <h1>收费管理</h1>
          <p>管理学费、杂费等各项收费项目</p>
        </div>
        <div class="header-actions">
          <el-button @click="handleRefresh">
            <UnifiedIcon name="Refresh" />
            刷新
          </el-button>
          <el-button type="primary" @click="showCreateDialog = true">
            <UnifiedIcon name="Plus" />
            新增收费项目
          </el-button>
        </div>
      </div>
    </div>

    <!-- 收费统计 -->
    <div class="fee-statistics">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ formatMoney(statistics.totalAmount) }}</div>
                <div class="stat-label">总收费金额</div>
                <div class="stat-detail">本月收费</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon collected">
                <UnifiedIcon name="Check" />
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ formatMoney(statistics.collectedAmount) }}</div>
                <div class="stat-label">已收金额</div>
                <div class="stat-detail">{{ statistics.collectedCount }}笔</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon pending">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ formatMoney(statistics.pendingAmount) }}</div>
                <div class="stat-label">待收金额</div>
                <div class="stat-detail">{{ statistics.pendingCount }}笔</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon overdue">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ formatMoney(statistics.overdueAmount) }}</div>
                <div class="stat-label">逾期金额</div>
                <div class="stat-detail">{{ statistics.overdueCount }}笔</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 收费项目管理 -->
    <div class="fee-items-section">
      <el-card shadow="never">
        <template #header>
          <div class="section-header">
            <span>收费项目</span>
            <el-button type="text" @click="showItemsDialog = true">
              管理收费项目
              <UnifiedIcon name="ArrowRight" />
            </el-button>
          </div>
        </template>
        
        <div class="fee-items-grid">
          <div
            v-for="item in feeItems"
            :key="item.id"
            class="fee-item"
            @click="handleItemClick(item)"
          >
            <div class="item-icon" :class="item.color">
              <UnifiedIcon name="default" />
            </div>
            <div class="item-content">
              <h4>{{ item.name }}</h4>
              <p>{{ item.description }}</p>
              <div class="item-stats">
                <span>¥{{ formatMoney(item.amount) }}/{{ item.unit }}</span>
                <span class="item-count">{{ item.studentCount }}名学生</span>
              </div>
            </div>
            <div class="item-status">
              <el-tag :type="item.status === 'active' ? 'success' : 'info'" size="small">
                {{ item.status === 'active' ? '启用' : '停用' }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <el-card shadow="never">
        <el-form :model="filterForm" inline>
          <el-form-item label="收费项目">
            <el-select v-model="filterForm.feeItem" placeholder="选择收费项目" clearable>
              <el-option label="全部" value="" />
              <el-option
                v-for="item in feeItems"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="班级">
            <el-select v-model="filterForm.class" placeholder="选择班级" clearable>
              <el-option label="全部" value="" />
              <el-option label="小班" value="small" />
              <el-option label="中班" value="medium" />
              <el-option label="大班" value="large" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="缴费状态">
            <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="已缴费" value="paid" />
              <el-option label="待缴费" value="pending" />
              <el-option label="逾期" value="overdue" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="学生姓名">
            <el-input
              v-model="filterForm.studentName"
              placeholder="搜索学生姓名"
              clearable
              style="max-width: 200px; width: 100%"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 收费记录列表 -->
    <div class="fee-records">
      <el-card shadow="never">
        <template #header>
          <div class="section-header">
            <span>收费记录</span>
            <div class="header-tools">
              <el-button @click="handleBatchPayment" :disabled="selectedRecords.length === 0">
                批量收费
              </el-button>
              <el-button @click="handleExport">
                导出记录
              </el-button>
            </div>
          </div>
        </template>
        
        <div v-loading="loading" class="records-content">
          <div class="table-wrapper">
<el-table class="responsive-table"
            :data="feeRecords"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            
            <el-table-column prop="studentName" label="学生姓名" width="120">
              <template #default="{ row }">
                <div class="student-info">
                  <el-avatar :size="32" :src="row.studentAvatar">
                    {{ row.studentName.charAt(0) }}
                  </el-avatar>
                  <div class="student-details">
                    <div class="name">{{ row.studentName }}</div>
                    <div class="class">{{ row.className }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="feeItem" label="收费项目" width="120">
              <template #default="{ row }">
                <el-tag :type="getFeeItemTagType(row.feeItemType)" size="small">
                  {{ row.feeItem }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="amount" label="应收金额" width="100" align="right">
              <template #default="{ row }">
                ¥{{ formatMoney(row.amount) }}
              </template>
            </el-table-column>
            
            <el-table-column prop="paidAmount" label="已收金额" width="100" align="right">
              <template #default="{ row }">
                <span :class="row.paidAmount > 0 ? 'text-success' : 'text-muted'">
                  ¥{{ formatMoney(row.paidAmount) }}
                </span>
              </template>
            </el-table-column>
            
            <el-table-column prop="remainingAmount" label="待收金额" width="100" align="right">
              <template #default="{ row }">
                <span :class="row.remainingAmount > 0 ? 'text-warning' : 'text-success'">
                  ¥{{ formatMoney(row.remainingAmount) }}
                </span>
              </template>
            </el-table-column>
            
            <el-table-column prop="dueDate" label="缴费期限" width="120">
              <template #default="{ row }">
                <span :class="{ 'text-danger': isOverdue(row.dueDate) }">
                  {{ formatDate(row.dueDate) }}
                </span>
              </template>
            </el-table-column>
            
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="lastPaymentDate" label="最近缴费" width="120">
              <template #default="{ row }">
                {{ row.lastPaymentDate ? formatDate(row.lastPaymentDate) : '-' }}
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="text"
                  size="small"
                  @click="handlePayment(row)"
                  :disabled="row.status === 'paid'"
                >
                  收费
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="handleViewDetails(row)"
                >
                  详情
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="handleSendNotice(row)"
                  :disabled="row.status === 'paid'"
                >
                  催费
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="handleEdit(row)"
                >
                  编辑
                </el-button>
              </template>
            </el-table-column>
          </el-table>
</div>
        </div>
        
        <!-- 分页 -->
        <div v-if="feeRecords.length > 0" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 新增收费项目对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新增收费项目"
      width="600px"
      @close="handleCreateDialogClose"
    >
      <el-form :model="createForm" :rules="createRules" label-width="100px" ref="createFormRef">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入收费项目名称" />
        </el-form-item>
        
        <el-form-item label="项目类型" prop="type">
          <el-select v-model="createForm.type" placeholder="选择项目类型" style="width: 100%">
            <el-option label="学费" value="tuition" />
            <el-option label="餐费" value="meal" />
            <el-option label="活动费" value="activity" />
            <el-option label="材料费" value="material" />
            <el-option label="其他费用" value="other" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="收费金额" prop="amount">
          <el-input-number
            v-model="createForm.amount"
            :min="0"
            :precision="2"
            placeholder="请输入收费金额"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="收费单位" prop="unit">
          <el-select v-model="createForm.unit" placeholder="选择收费单位" style="width: 100%">
            <el-option label="月" value="month" />
            <el-option label="学期" value="semester" />
            <el-option label="学年" value="year" />
            <el-option label="次" value="time" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="适用班级">
          <el-checkbox-group v-model="createForm.classes">
            <el-checkbox label="small">小班</el-checkbox>
            <el-checkbox label="medium">中班</el-checkbox>
            <el-checkbox label="large">大班</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="项目描述">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入项目描述"
          />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-radio-group v-model="createForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="handleCreateFeeItem" :loading="creating">
            创建
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 收费对话框 -->
    <el-dialog
      v-model="showPaymentDialog"
      title="收费登记"
      width="500px"
      @close="handlePaymentDialogClose"
    >
      <div v-if="currentRecord" class="payment-info">
        <div class="student-summary">
          <el-avatar :size="48" :src="currentRecord.studentAvatar">
            {{ currentRecord.studentName.charAt(0) }}
          </el-avatar>
          <div class="summary-details">
            <h4>{{ currentRecord.studentName }}</h4>
            <p>{{ currentRecord.className }} - {{ currentRecord.feeItem }}</p>
            <p>应收金额：¥{{ formatMoney(currentRecord.amount) }}</p>
            <p>待收金额：¥{{ formatMoney(currentRecord.remainingAmount) }}</p>
          </div>
        </div>
        
        <el-form :model="paymentForm" label-width="100px" style="margin-top: var(--text-2xl)">
          <el-form-item label="收费金额">
            <el-input-number
              v-model="paymentForm.amount"
              :min="0"
              :max="currentRecord.remainingAmount"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="收费方式">
            <el-select v-model="paymentForm.method" placeholder="选择收费方式" style="width: 100%">
              <el-option label="现金" value="cash" />
              <el-option label="银行转账" value="transfer" />
              <el-option label="微信支付" value="wechat" />
              <el-option label="支付宝" value="alipay" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="备注">
            <el-input
              v-model="paymentForm.remarks"
              type="textarea"
              :rows="2"
              placeholder="请输入备注信息（可选）"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPaymentDialog = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmPayment" :loading="paying">
            确认收费
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import {
  Money, Check, Clock, Warning, Plus, Refresh, ArrowRight
} from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/date'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const creating = ref(false)
const paying = ref(false)
const showCreateDialog = ref(false)
const showItemsDialog = ref(false)
const showPaymentDialog = ref(false)
const currentRecord = ref(null)
const selectedRecords = ref([])
const createFormRef = ref<InstanceType<typeof ElForm>>()

// 统计数据
const statistics = reactive({
  totalAmount: 1250000,
  collectedAmount: 950000,
  pendingAmount: 250000,
  overdueAmount: 50000,
  collectedCount: 156,
  pendingCount: 28,
  overdueCount: 8
})

// 收费项目
const feeItems = ref([
  {
    id: 1,
    name: '学费',
    description: '每月学费',
    amount: 2800,
    unit: '月',
    studentCount: 120,
    status: 'active',
    icon: 'Reading',
    color: 'blue',
    type: 'tuition'
  },
  {
    id: 2,
    name: '餐费',
    description: '每月餐费',
    amount: 600,
    unit: '月',
    studentCount: 115,
    status: 'active',
    icon: 'Food',
    color: 'green',
    type: 'meal'
  },
  {
    id: 3,
    name: '活动费',
    description: '课外活动费用',
    amount: 200,
    unit: '次',
    studentCount: 80,
    status: 'active',
    icon: 'star',
    color: 'orange',
    type: 'activity'
  },
  {
    id: 4,
    name: '材料费',
    description: '学习材料费用',
    amount: 150,
    unit: '月',
    studentCount: 120,
    status: 'active',
    icon: 'Box',
    color: 'purple',
    type: 'material'
  }
])

// 筛选表单
const filterForm = reactive({
  feeItem: '',
  class: '',
  status: '',
  studentName: ''
})

// 收费记录
const feeRecords = ref([])

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 创建表单
const createForm = reactive({
  name: '',
  type: '',
  amount: 0,
  unit: '',
  classes: [],
  description: '',
  status: 'active'
})

// 收费表单
const paymentForm = reactive({
  amount: 0,
  method: '',
  remarks: ''
})

// 表单验证规则
const createRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择项目类型', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入收费金额', trigger: 'blur' }
  ],
  unit: [
    { required: true, message: '请选择收费单位', trigger: 'change' }
  ]
}

// 方法
const formatMoney = (amount: number) => {
  return amount.toLocaleString()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const isOverdue = (dueDate: string) => {
  return new Date(dueDate) < new Date()
}

const getFeeItemTagType = (type: string) => {
  const typeMap = {
    'tuition': 'primary',
    'meal': 'success',
    'activity': 'warning',
    'material': 'info',
    'other': ''
  }
  return typeMap[type] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap = {
    'paid': '已缴费',
    'pending': '待缴费',
    'overdue': '逾期',
    'partial': '部分缴费'
  }
  return statusMap[status] || '未知状态'
}

const getStatusTagType = (status: string) => {
  const statusMap = {
    'paid': 'success',
    'pending': 'warning',
    'overdue': 'danger',
    'partial': 'info'
  }
  return statusMap[status] || 'info'
}

const loadFeeRecords = async () => {
  loading.value = true
  try {
    // 模拟收费记录数据
    const mockData = [
      {
        id: 1,
        studentName: '张小明',
        studentAvatar: '',
        className: '小班A',
        feeItem: '学费',
        feeItemType: 'tuition',
        amount: 2800,
        paidAmount: 2800,
        remainingAmount: 0,
        dueDate: '2024-01-31',
        status: 'paid',
        lastPaymentDate: '2024-01-15'
      },
      {
        id: 2,
        studentName: '李小红',
        studentAvatar: '',
        className: '中班B',
        feeItem: '学费',
        feeItemType: 'tuition',
        amount: 2800,
        paidAmount: 1400,
        remainingAmount: 1400,
        dueDate: '2024-01-31',
        status: 'partial',
        lastPaymentDate: '2024-01-10'
      },
      {
        id: 3,
        studentName: '王小华',
        studentAvatar: '',
        className: '大班C',
        feeItem: '餐费',
        feeItemType: 'meal',
        amount: 600,
        paidAmount: 0,
        remainingAmount: 600,
        dueDate: '2024-01-25',
        status: 'pending',
        lastPaymentDate: null
      },
      {
        id: 4,
        studentName: '赵小丽',
        studentAvatar: '',
        className: '小班A',
        feeItem: '活动费',
        feeItemType: 'activity',
        amount: 200,
        paidAmount: 0,
        remainingAmount: 200,
        dueDate: '2024-01-20',
        status: 'overdue',
        lastPaymentDate: null
      }
    ]
    
    feeRecords.value = mockData
    pagination.total = mockData.length
    
  } catch (error) {
    console.error('加载收费记录失败:', error)
    ElMessage.error('加载收费记录失败')
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  loadFeeRecords()
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadFeeRecords()
}

const handleReset = () => {
  Object.assign(filterForm, {
    feeItem: '',
    class: '',
    status: '',
    studentName: ''
  })
  handleSearch()
}

const handleItemClick = (item: any) => {
  filterForm.feeItem = item.id
  handleSearch()
}

const handleSelectionChange = (selection: any[]) => {
  selectedRecords.value = selection
}

const handleBatchPayment = () => {
  ElMessage.info('批量收费功能开发中')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

const handlePayment = (record: any) => {
  currentRecord.value = record
  paymentForm.amount = record.remainingAmount
  showPaymentDialog.value = true
}

const handleConfirmPayment = async () => {
  paying.value = true
  try {
    // 模拟收费处理
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    ElMessage.success('收费成功')
    showPaymentDialog.value = false
    loadFeeRecords()
  } catch (error) {
    ElMessage.error('收费失败，请重试')
  } finally {
    paying.value = false
  }
}

const handlePaymentDialogClose = () => {
  currentRecord.value = null
  Object.assign(paymentForm, {
    amount: 0,
    method: '',
    remarks: ''
  })
}

const handleViewDetails = (record: any) => {
  ElMessage.info('查看详情功能开发中')
}

const handleSendNotice = (record: any) => {
  ElMessage.success(`已向${record.studentName}家长发送催费通知`)
}

const handleEdit = (record: any) => {
  ElMessage.info('编辑功能开发中')
}

const handleCreateFeeItem = async () => {
  if (!createFormRef.value) return
  
  try {
    await createFormRef.value.validate()
    creating.value = true
    
    // 模拟创建收费项目
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    ElMessage.success('收费项目创建成功')
    showCreateDialog.value = false
    // 重新加载收费项目列表
  } catch (error) {
    ElMessage.error('创建失败，请重试')
  } finally {
    creating.value = false
  }
}

const handleCreateDialogClose = () => {
  Object.assign(createForm, {
    name: '',
    type: '',
    amount: 0,
    unit: '',
    classes: [],
    description: '',
    status: 'active'
  })
  createFormRef.value?.clearValidate()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadFeeRecords()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadFeeRecords()
}

// 生命周期
onMounted(() => {
  loadFeeRecords()
})
</script>

<style lang="scss">
.fee-management-container {
  padding: var(--text-2xl);
  max-width: 100%; max-width: 1400px;
  margin: 0 auto;
}

.fee-header {
  margin-bottom: var(--text-3xl);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    .page-title {
      h1 {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-sm) 0;
      }
      
      p {
        color: var(--text-secondary);
        margin: 0;
      }
    }
    
    .header-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }
}

.fee-statistics {
  margin-bottom: var(--text-3xl);
  
  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      
      .stat-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-3xl);
        
        &.total {
          background: #f0f9ff;
          color: var(--primary-color);
        }
        
        &.collected {
          background: #f0fdf4;
          color: var(--success-color);
        }
        
        &.pending {
          background: #fefbf2;
          color: var(--warning-color);
        }
        
        &.overdue {
          background: #fef2f2;
          color: var(--danger-color);
        }
      }
      
      .stat-info {
        flex: 1;
        
        .stat-value {
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: var(--spacing-xs);
        }
        
        .stat-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }
        
        .stat-detail {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
        }
      }
    }
  }
}

.fee-items-section {
  margin-bottom: var(--text-3xl);
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .fee-items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--text-lg);
    
    .fee-item {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      padding: var(--text-lg);
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--spacing-sm);
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px var(--spacing-sm) var(--accent-enrollment-light);
      }
      
      .item-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-2xl);
        
        &.blue {
          background: #f0f9ff;
          color: var(--primary-color);
        }
        
        &.green {
          background: #f0fdf4;
          color: var(--success-color);
        }
        
        &.orange {
          background: var(--bg-white)7ed;
          color: #f97316;
        }
        
        &.purple {
          background: #faf5ff;
          color: #a855f7;
        }
      }
      
      .item-content {
        flex: 1;
        
        h4 {
          font-size: var(--text-lg);
          font-weight: 500;
          color: var(--text-primary);
          margin: 0 0 var(--spacing-xs) 0;
        }
        
        p {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin: 0 0 var(--spacing-sm) 0;
        }
        
        .item-stats {
          display: flex;
          justify-content: space-between;
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          
          .item-count {
            color: var(--text-secondary);
          }
        }
      }
      
      .item-status {
        flex-shrink: 0;
      }
    }
  }
}

.filter-toolbar {
  margin-bottom: var(--text-3xl);
}

.fee-records {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-tools {
      display: flex;
      gap: var(--text-sm);
    }
  }
  
  .student-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    
    .student-details {
      .name {
        font-weight: 500;
        color: var(--text-primary);
      }
      
      .class {
        font-size: var(--text-sm);
        color: var(--text-tertiary);
        margin-top: var(--spacing-sm);
      }
    }
  }
  
  .text-success {
    color: var(--success-color);
  }
  
  .text-warning {
    color: var(--warning-color);
  }
  
  .text-danger {
    color: var(--danger-color);
  }
  
  .text-muted {
    color: var(--text-tertiary);
  }
}

.pagination-wrapper {
  margin-top: var(--text-3xl);
  display: flex;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

.payment-info {
  .student-summary {
    display: flex;
    gap: var(--text-lg);
    padding: var(--text-lg);
    background: #f9fafb;
    border-radius: var(--spacing-sm);
    
    .summary-details {
      flex: 1;
      
      h4 {
        font-size: var(--text-lg);
        font-weight: 500;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-sm) 0;
      }
      
      p {
        font-size: var(--text-base);
        color: var(--text-secondary);
        margin: var(--spacing-xs) 0;
      }
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .fee-management-container {
    padding: var(--text-lg);
  }
  
  .fee-header .header-content {
    flex-direction: column;
    gap: var(--text-lg);
    align-items: flex-start;
  }
  
  .fee-statistics {
    .el-col {
      margin-bottom: var(--text-lg);
    }
  }
  
  .fee-items-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-toolbar {
    .el-form {
      flex-direction: column;
      
      .el-form-item {
        margin-bottom: var(--text-lg);
        margin-right: 0;
      }
    }
  }
  
  .section-header {
    flex-direction: column;
    gap: var(--text-sm);
    align-items: flex-start !important;
    
    .header-tools {
      width: 100%;
      
      .el-button {
        flex: 1;
      }
    }
  }
}
</style>
