<template>
  <div class="enrollment-finance-linkage">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h2>招生财务联动</h2>
          <p>管理招生申请与缴费单的自动关联，实现招生到入园的完整财务流程</p>
        </div>
        <div class="header-actions">
          <el-button @click="handleRefresh" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button type="success" @click="showBatchDialog = true">
            <el-icon><Document /></el-icon>
            批量生成
          </el-button>
          <el-button type="primary" @click="showConfigDialog = true">
            <el-icon><Setting /></el-icon>
            流程配置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <el-row :gutter="24">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total">
                <el-icon><School /></el-icon>
              </div>
              <div class="stat-info">
                <h3>总招生数</h3>
                <div class="stat-value">{{ stats.totalEnrollments }}</div>
                <div class="stat-desc">本学期申请</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon paid">
                <el-icon><SuccessFilled /></el-icon>
              </div>
              <div class="stat-info">
                <h3>已缴费</h3>
                <div class="stat-value">{{ stats.paidEnrollments }}</div>
                <div class="stat-desc">转化率 {{ stats.conversionRate }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon pending">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <h3>待缴费</h3>
                <div class="stat-value">{{ stats.pendingPayments }}</div>
                <div class="stat-desc">平均 {{ stats.averagePaymentTime }}天</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon revenue">
                <el-icon><Money /></el-icon>
              </div>
              <div class="stat-info">
                <h3>收入金额</h3>
                <div class="stat-value">¥{{ formatMoney(stats.totalRevenue) }}</div>
                <div class="stat-desc">招生收入</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 费用套餐模板管理 -->
    <div class="package-templates">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>费用套餐模板</span>
            <el-button size="small" type="primary" @click="showPackageDialog = true">
              <el-icon><Plus /></el-icon>
              新增模板
            </el-button>
          </div>
        </template>
        
        <el-row :gutter="16">
          <el-col :span="8" v-for="template in packageTemplates" :key="template.id">
            <div class="package-template-item">
              <div class="template-header">
                <h4>{{ template.name }}</h4>
                <el-tag size="small" :type="template.isActive ? 'success' : 'danger'">
                  {{ template.isActive ? '启用' : '停用' }}
                </el-tag>
              </div>
              <div class="template-info">
                <p>{{ template.description }}</p>
                <div class="template-details">
                  <div class="detail-item">
                    <span class="label">适用年级:</span>
                    <span class="value">{{ template.targetGrade }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">费用项目:</span>
                    <span class="value">{{ template.items.length }}项</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">总金额:</span>
                    <span class="value amount">¥{{ formatMoney(template.totalAmount) }}</span>
                  </div>
                </div>
              </div>
              <div class="template-actions">
                <el-button size="small" type="text" @click="handleEditTemplate(template)">
                  编辑
                </el-button>
                <el-button size="small" type="text" @click="handleViewTemplate(template)">
                  查看详情
                </el-button>
                <el-button size="small" type="text" @click="handleCopyTemplate(template)">
                  复制
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-card>
        <el-form :model="filterForm" inline>
          <el-form-item label="学生姓名">
            <el-input
              v-model="filterForm.studentName"
              placeholder="输入学生姓名"
              clearable
              style="width: 160px"
            />
          </el-form-item>
          
          <el-form-item label="班级">
            <el-select v-model="filterForm.className" placeholder="选择班级" clearable>
              <el-option label="全部" value="" />
              <el-option label="小班一班" value="小班一班" />
              <el-option label="小班二班" value="小班二班" />
              <el-option label="中班一班" value="中班一班" />
              <el-option label="中班二班" value="中班二班" />
              <el-option label="大班一班" value="大班一班" />
              <el-option label="大班二班" value="大班二班" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="招生状态">
            <el-select v-model="filterForm.enrollmentStatus" placeholder="选择招生状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="待审批" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="财务状态">
            <el-select v-model="filterForm.financialStatus" placeholder="选择财务状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="未生成" value="not_generated" />
              <el-option label="待缴费" value="pending_payment" />
              <el-option label="已缴费" value="paid" />
              <el-option label="逾期" value="overdue" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 招生财务列表 -->
    <div class="linkage-list">
      <el-card>
        <div v-loading="loading" class="list-content">
          <el-table :data="linkageList" style="width: 100%">
            <el-table-column prop="studentName" label="学生姓名" width="120">
              <template #default="{ row }">
                <div class="student-info">
                  <div class="name">{{ row.studentName }}</div>
                  <div class="id">{{ row.studentId }}</div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="className" label="班级" width="100" />
            
            <el-table-column prop="enrollmentStatus" label="招生状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getEnrollmentStatusType(row.enrollmentStatus)" size="small">
                  {{ getEnrollmentStatusText(row.enrollmentStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="financialStatus" label="财务状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getFinancialStatusType(row.financialStatus)" size="small">
                  {{ getFinancialStatusText(row.financialStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="费用套餐" min-width="200">
              <template #default="{ row }">
                <div v-if="row.feePackage" class="fee-package">
                  <div class="package-name">{{ row.feePackage.name }}</div>
                  <div class="package-amount">
                    <span class="final-amount">¥{{ formatMoney(row.feePackage.finalAmount) }}</span>
                    <span v-if="row.feePackage.discountAmount" class="discount">
                      (优惠 ¥{{ formatMoney(row.feePackage.discountAmount) }})
                    </span>
                  </div>
                </div>
                <span v-else class="no-package">未配置</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="enrollmentDate" label="申请时间" width="140">
              <template #default="{ row }">
                {{ formatDate(row.enrollmentDate) }}
              </template>
            </el-table-column>
            
            <el-table-column prop="paymentDueDate" label="缴费截止" width="140">
              <template #default="{ row }">
                <div v-if="row.paymentDueDate" class="due-date">
                  {{ formatDate(row.paymentDueDate) }}
                  <el-tag v-if="isOverdue(row.paymentDueDate)" type="danger" size="small">
                    逾期
                  </el-tag>
                </div>
                <span v-else>-</span>
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.enrollmentStatus === 'approved' && row.financialStatus === 'not_generated'"
                  type="text"
                  size="small"
                  @click="handleGenerateBill(row)"
                >
                  生成缴费单
                </el-button>
                
                <el-button
                  v-if="row.financialStatus === 'pending_payment'"
                  type="text"
                  size="small"
                  @click="handleConfirmPayment(row)"
                >
                  确认收款
                </el-button>
                
                <el-button
                  type="text"
                  size="small"
                  @click="handleViewProcess(row)"
                >
                  查看流程
                </el-button>
                
                <el-button
                  v-if="['pending_payment', 'overdue'].includes(row.financialStatus)"
                  type="text"
                  size="small"
                  @click="handleSendReminder(row)"
                >
                  发送提醒
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 分页 -->
        <div v-if="pagination.total > 0" class="pagination">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 流程详情对话框 -->
    <el-dialog
      v-model="showProcessDialog"
      title="招生财务流程"
      width="600px"
    >
      <div v-if="currentProcess" class="process-details">
        <div class="process-header">
          <h3>{{ currentProcess.enrollmentId }}</h3>
          <el-tag>当前阶段：{{ getStepText(currentProcess.currentStep) }}</el-tag>
        </div>
        
        <el-steps :active="getActiveStep()" direction="vertical" style="margin-top: var(--text-2xl)">
          <el-step
            v-for="(step, index) in currentProcess.steps"
            :key="step.step"
            :title="step.description"
            :status="getStepStatus(step.status)"
            :description="step.completedAt ? `完成时间: ${formatDateTime(step.completedAt)}` : ''"
          />
        </el-steps>
        
        <div v-if="currentProcess.nextAction" class="next-action">
          <el-alert
            :title="`下一步: ${currentProcess.nextAction.description}`"
            type="info"
            :closable="false"
            show-icon
          >
            <div v-if="currentProcess.nextAction.dueDate">
              截止时间: {{ formatDateTime(currentProcess.nextAction.dueDate) }}
            </div>
          </el-alert>
        </div>
      </div>
    </el-dialog>

    <!-- 其他对话框占位 -->
    <el-dialog v-model="showBatchDialog" title="批量生成缴费单" width="600px">
      <div class="batch-form">
        <el-alert title="批量生成功能开发中" type="info" :closable="false" show-icon />
      </div>
    </el-dialog>

    <el-dialog v-model="showConfigDialog" title="流程配置" width="600px">
      <div class="config-form">
        <el-alert title="流程配置功能开发中" type="info" :closable="false" show-icon />
      </div>
    </el-dialog>

    <el-dialog v-model="showPackageDialog" title="费用套餐模板" width="800px">
      <div class="package-form">
        <el-alert title="套餐模板管理功能开发中" type="info" :closable="false" show-icon />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh, Document, Setting, Plus, School, SuccessFilled, 
  Clock, Money
} from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/date'
import enrollmentFinanceAPI, { 
  type EnrollmentFinanceLinkage,
  type FeePackageTemplate,
  type EnrollmentPaymentProcess
} from '@/api/modules/enrollmentFinance'

const loading = ref(false)
const showBatchDialog = ref(false)
const showConfigDialog = ref(false)
const showPackageDialog = ref(false)
const showProcessDialog = ref(false)
const currentProcess = ref<EnrollmentPaymentProcess | null>(null)

// 统计数据
const stats = reactive({
  totalEnrollments: 156,
  paidEnrollments: 142,
  pendingPayments: 14,
  overduePayments: 3,
  totalRevenue: 554600,
  averagePaymentTime: 2.5,
  conversionRate: 91.0
})

// 费用套餐模板
const packageTemplates = ref<FeePackageTemplate[]>([])

// 筛选表单
const filterForm = reactive({
  studentName: '',
  className: '',
  enrollmentStatus: '',
  financialStatus: ''
})

// 招生财务关联列表
const linkageList = ref<EnrollmentFinanceLinkage[]>([])

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 格式化金额
const formatMoney = (amount: number): string => {
  return amount.toLocaleString()
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 判断是否逾期
const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date()
}

// 获取招生状态类型
const getEnrollmentStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取招生状态文本
const getEnrollmentStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return textMap[status] || '未知'
}

// 获取财务状态类型
const getFinancialStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    not_generated: 'info',
    pending_payment: 'warning',
    paid: 'success',
    overdue: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取财务状态文本
const getFinancialStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    not_generated: '未生成',
    pending_payment: '待缴费',
    paid: '已缴费',
    overdue: '逾期'
  }
  return textMap[status] || '未知'
}

// 获取步骤文本
const getStepText = (step: string) => {
  const stepMap: Record<string, string> = {
    application: '申请提交',
    interview: '面试评估',
    approved: '审批通过',
    payment: '缴费确认',
    enrolled: '正式入园'
  }
  return stepMap[step] || step
}

// 获取步骤状态
const getStepStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'wait',
    in_progress: 'process',
    completed: 'finish',
    failed: 'error'
  }
  return statusMap[status] || 'wait'
}

// 获取当前步骤索引
const getActiveStep = () => {
  if (!currentProcess.value) return 0
  return currentProcess.value.steps.findIndex(step => step.status === 'in_progress')
}

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await enrollmentFinanceAPI.getEnrollmentFinanceStats()
    if (response.success) {
      Object.assign(stats, response.data)
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载套餐模板
const loadPackageTemplates = async () => {
  try {
    const response = await enrollmentFinanceAPI.getFeePackageTemplates()
    if (response.success) {
      packageTemplates.value = response.data || []
    }
  } catch (error) {
    console.error('加载套餐模板失败:', error)
  }
}

// 加载招生财务关联列表
const loadLinkageList = async () => {
  loading.value = true
  try {
    const response = await enrollmentFinanceAPI.getEnrollmentFinanceLinkages({
      page: pagination.current,
      pageSize: pagination.pageSize
    })
    
    if (response.success) {
      linkageList.value = response.data?.list || []
      pagination.total = response.data?.total || 0
    }
  } catch (error) {
    console.error('加载招生财务关联失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 生成缴费单
const handleGenerateBill = async (row: EnrollmentFinanceLinkage) => {
  try {
    await ElMessageBox.confirm(
      `确定为 ${row.studentName} 生成缴费单吗？`,
      '生成缴费单',
      {
        type: 'info'
      }
    )
    
    ElMessage.success('缴费单生成成功')
    await loadLinkageList()
  } catch {
    // 用户取消
  }
}

// 确认收款
const handleConfirmPayment = (row: EnrollmentFinanceLinkage) => {
  ElMessageBox.prompt('请输入收款金额', '确认收款', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputPattern: /^\d+(\.\d{1,2})?$/,
    inputErrorMessage: '请输入正确的金额格式',
    inputValue: row.feePackage?.finalAmount?.toString() || '0'
  }).then(async ({ value }) => {
    try {
      ElMessage.success('收款确认成功')
      await loadLinkageList()
    } catch (error) {
      ElMessage.error('收款确认失败')
    }
  })
}

// 查看流程
const handleViewProcess = async (row: EnrollmentFinanceLinkage) => {
  try {
    const response = await enrollmentFinanceAPI.getEnrollmentPaymentProcess(row.enrollmentId)
    if (response.success) {
      currentProcess.value = response.data
      showProcessDialog.value = true
    }
  } catch (error) {
    ElMessage.error('获取流程信息失败')
  }
}

// 发送提醒
const handleSendReminder = async (row: EnrollmentFinanceLinkage) => {
  try {
    await enrollmentFinanceAPI.sendPaymentReminder([row.enrollmentId])
    ElMessage.success('提醒已发送')
  } catch (error) {
    ElMessage.error('发送提醒失败')
  }
}

// 编辑模板
const handleEditTemplate = (template: FeePackageTemplate) => {
  ElMessage.info('编辑模板功能开发中')
}

// 查看模板
const handleViewTemplate = (template: FeePackageTemplate) => {
  ElMessage.info('查看模板详情功能开发中')
}

// 复制模板
const handleCopyTemplate = (template: FeePackageTemplate) => {
  ElMessage.info('复制模板功能开发中')
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadLinkageList()
}

// 重置筛选
const handleReset = () => {
  Object.assign(filterForm, {
    studentName: '',
    className: '',
    enrollmentStatus: '',
    financialStatus: ''
  })
  handleSearch()
}

// 刷新
const handleRefresh = () => {
  Promise.all([
    loadStats(),
    loadPackageTemplates(),
    loadLinkageList()
  ])
}

// 分页处理
const handlePageChange = (page: number) => {
  pagination.current = page
  loadLinkageList()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  loadLinkageList()
}

onMounted(() => {
  handleRefresh()
})
</script>

<style scoped lang="scss">
.enrollment-finance-linkage {
  padding: var(--text-3xl);
  background: var(--bg-hover);
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: var(--text-3xl);
  background: white;
  border-radius: var(--text-sm);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: var(--text-3xl);
    
    .header-left {
      h2 {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-sm) 0;
      }
      
      p {
        color: var(--text-secondary);
        margin: 0;
        font-size: var(--text-base);
      }
    }
    
    .header-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }
}

.stats-overview {
  margin-bottom: var(--text-3xl);
  
  .stat-card {
    border-radius: var(--text-sm);
    border: none;
    box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
    
    .stat-content {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      padding: var(--spacing-sm);
      
      .stat-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--text-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-3xl);
        color: white;
        
        &.total {
          background: linear-gradient(135deg, var(--primary-color), #1d4ed8);
        }
        
        &.paid {
          background: linear-gradient(135deg, var(--success-color), #059669);
        }
        
        &.pending {
          background: linear-gradient(135deg, var(--warning-color), #d97706);
        }
        
        &.revenue {
          background: linear-gradient(135deg, var(--ai-primary), var(--ai-dark));
        }
      }
      
      .stat-info {
        flex: 1;
        
        h3 {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin: 0 0 var(--spacing-sm) 0;
          font-weight: normal;
        }
        
        .stat-value {
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }
        
        .stat-desc {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
        }
      }
    }
  }
}

.package-templates {
  margin-bottom: var(--text-3xl);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .package-template-item {
    border: var(--border-width-base) solid var(--border-color);
    border-radius: var(--spacing-sm);
    padding: var(--text-lg);
    transition: all 0.3s ease;
    
    &:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px var(--spacing-sm) var(--accent-enrollment-light);
    }
    
    .template-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--text-sm);
      
      h4 {
        font-size: var(--text-lg);
        font-weight: 500;
        color: var(--text-primary);
        margin: 0;
      }
    }
    
    .template-info {
      p {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        margin: 0 0 var(--text-sm) 0;
      }
    }
    
    .template-details {
      .detail-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--spacing-sm);
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
        
        .value {
          font-size: var(--text-sm);
          color: var(--text-primary);
          
          &.amount {
            font-weight: 600;
            color: #059669;
          }
        }
      }
    }
    
    .template-actions {
      margin-top: var(--text-lg);
      padding-top: var(--text-lg);
      border-top: var(--border-width-base) solid #f3f4f6;
      display: flex;
      gap: var(--spacing-sm);
    }
  }
}

.filter-section {
  margin-bottom: var(--text-3xl);
}

.linkage-list {
  .student-info {
    .name {
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .id {
      font-size: var(--text-sm);
      color: var(--text-tertiary);
    }
  }
  
  .fee-package {
    .package-name {
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }
    
    .package-amount {
      .final-amount {
        font-weight: 600;
        color: #059669;
      }
      
      .discount {
        font-size: var(--text-sm);
        color: var(--warning-color);
        margin-left: var(--spacing-sm);
      }
    }
  }
  
  .no-package {
    color: var(--text-tertiary);
    font-style: italic;
  }
  
  .due-date {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .pagination {
    margin-top: var(--text-3xl);
    display: flex;
    justify-content: center;
  }
}

.process-details {
  .process-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-lg);
    
    h3 {
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
  }
  
  .next-action {
    margin-top: var(--text-3xl);
  }
}

:deep(.el-card) {
  border-radius: var(--text-sm);
  border: none;
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
}

:deep(.el-card__header) {
  padding: var(--text-2xl);
  border-bottom: var(--border-width-base) solid #f3f4f6;
  font-weight: 500;
}

:deep(.el-card__body) {
  padding: var(--text-2xl);
}

@media (max-width: var(--breakpoint-md)) {
  .enrollment-finance-linkage {
    padding: var(--text-lg);
  }
  
  .page-header .header-content {
    flex-direction: column;
    gap: var(--text-lg);
    align-items: flex-start;
  }
  
  .el-form--inline .el-form-item {
    display: block;
    margin-bottom: var(--text-lg);
  }
}
</style>