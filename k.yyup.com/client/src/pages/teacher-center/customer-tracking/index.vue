<template>
  <UnifiedCenterLayout
    title="客户跟踪"
    description="管理我的客户跟进记录"
    icon="User"
  >
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-button type="primary" @click="showAddCustomerDialog = true">
        <UnifiedIcon name="plus" :size="16" />
        新增客户
      </el-button>
      <el-button @click="refreshData">
        <UnifiedIcon name="refresh" :size="16" />
        刷新
      </el-button>
    </template>

    <!-- 统计卡片 - 直接使用 UnifiedCenterLayout 提供的网格容器 -->
    <template #stats>
      <StatCard
        icon-name="User"
        title="我的客户"
        :value="stats.totalCustomers"
        subtitle="总客户数"
        type="primary"
        :trend="stats.totalCustomers > 0 ? 'up' : 'stable'"
        clickable
      />
      <StatCard
        icon-name="Message"
        title="今日跟进"
        :value="stats.todayFollows"
        subtitle="已跟进"
        type="success"
        :trend="stats.todayFollows > 0 ? 'up' : 'stable'"
        clickable
      />
      <StatCard
        icon-name="Clock"
        title="待跟进"
        :value="stats.pendingFollows"
        subtitle="需要跟进"
        type="warning"
        :trend="stats.pendingFollows > 0 ? 'down' : 'stable'"
        clickable
      />
      <StatCard
        icon-name="TrendingUp"
        title="成功率"
        :value="`${stats.successRate}%`"
        subtitle="转化成功率"
        type="danger"
        :trend="stats.successRate >= 50 ? 'up' : 'stable'"
        clickable
      />
    </template>

    <!-- 主要内容区域 -->
    <el-tabs v-model="activeTab" type="card" class="main-tabs">
      <el-tab-pane label="客户列表" name="customers">
        <CustomerList
          :customers="customers"
          :loading="loading"
          :total="total"
          @add-customer="showAddCustomerDialog = true"
          @refresh="refreshData"
          @view-customer="viewCustomer"
          @add-follow="addFollow"
          @view-history="viewHistory"
          @view-sop="viewSOP"
          @filter-change="handleFilterChange"
        />
      </el-tab-pane>

      <el-tab-pane label="跟进记录" name="records">
        <FollowRecord
          :customer-id="selectedCustomerId"
          :records="followRecords"
          :loading="recordsLoading"
          @add-record="handleAddRecord"
          @update-record="handleUpdateRecord"
          @delete-record="handleDeleteRecord"
          @refresh="loadFollowRecords"
        />
      </el-tab-pane>

      <el-tab-pane label="转化分析" name="funnel">
        <ConversionFunnel
          :loading="funnelLoading"
          :funnel-data="funnelData"
          @time-range-change="handleTimeRangeChange"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 新增客户对话框 -->
    <el-dialog
      v-model="showAddCustomerDialog"
      title="新增客户"
      width="600px"
      :before-close="handleCloseCustomerDialog"
    >
      <el-form :model="customerForm" :rules="customerRules" ref="customerFormRef" label-width="100px">
        <el-form-item label="客户姓名" prop="name">
          <el-input v-model="customerForm.name" placeholder="请输入客户姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="customerForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="孩子姓名" prop="childName">
          <el-input v-model="customerForm.childName" placeholder="请输入孩子姓名" />
        </el-form-item>
        <el-form-item label="孩子年龄" prop="childAge">
          <el-input-number v-model="customerForm.childAge" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="客户来源" prop="source">
          <el-select v-model="customerForm.source" placeholder="选择客户来源" style="width: 100%">
            <el-option label="网络咨询" value="online" />
            <el-option label="电话咨询" value="phone" />
            <el-option label="朋友推荐" value="referral" />
            <el-option label="广告投放" value="advertisement" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="customerForm.remark"
            type="textarea"
            :rows="3"
            placeholder="其他备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseCustomerDialog">取消</el-button>
        <el-button type="primary" @click="submitCustomer" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- SOP流程对话框 -->
    <el-dialog
      v-model="showSOPDialog"
      title="客户跟进SOP流程"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="sop-content">
        <div class="sop-header">
          <h3>客户信息</h3>
          <p v-if="selectedCustomer">
            <strong>姓名：</strong>{{ selectedCustomer.name }} | 
            <strong>电话：</strong>{{ selectedCustomer.phone }} | 
            <strong>孩子：</strong>{{ selectedCustomer.childName }}({{ selectedCustomer.childAge }}岁)
          </p>
        </div>

        <el-divider />

        <div class="sop-steps">
          <h3>跟进SOP流程【点击更新进度】</h3>
          <el-steps direction="vertical" :active="currentSOPStep" finish-status="success">
            <el-step 
              v-for="(step, index) in sopSteps" 
              :key="index"
              :title="step.title" 
              :description="step.description"
              class="clickable-step"
              @click="handleStepClick(index)"
            >
              <template #icon>
                <div class="step-icon" :class="{ 'active': index <= currentSOPStep }">
                  <el-icon v-if="index < currentSOPStep"><Check /></el-icon>
                  <span v-else>{{ index + 1 }}</span>
                </div>
              </template>
            </el-step>
          </el-steps>
        </div>

        <el-divider />

        <div class="sop-actions">
          <el-alert
            type="info"
            :closable="false"
            show-icon
          >
            <template #title>
              <strong>当前进度：</strong>{{ sopSteps[currentSOPStep]?.title }}
            </template>
          </el-alert>

          <div class="progress-buttons">
            <el-button 
              v-if="currentSOPStep > 0"
              @click="currentSOPStep--"
              :icon="ArrowLeft"
            >
              上一步
            </el-button>
            <el-button 
              v-if="currentSOPStep < sopSteps.length - 1"
              type="primary"
              @click="handleNextStep"
              :icon="ArrowRight"
            >
              下一步
            </el-button>
            <el-button 
              v-if="currentSOPStep === sopSteps.length - 1"
              type="success"
              @click="handleComplete"
              :icon="Check"
            >
              完成签约
            </el-button>
          </div>
        </div>

        <el-divider />

        <div class="sop-notes">
          <h3>注意事项</h3>
          <ul>
            <li>每次沟通后记录跟进内容</li>
            <li>根据客户意向调整沟通策略</li>
            <li>及时处理客户疑问和需求</li>
            <li>保持良好沟通频率，避免客户流失</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleSOPCancel">取消</el-button>
        <el-button type="primary" @click="handleSOPSave" :loading="submitting">
          保存进度
        </el-button>
      </template>
    </el-dialog>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import StatCard from '@/components/centers/StatCard.vue'

import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import CustomerList from './components/CustomerList.vue'
import FollowRecord from './components/FollowRecord.vue'
import ConversionFunnel from './components/ConversionFunnel.vue'

// 导入API
import {
  getCustomerTrackingStats,
  getCustomerList,
  getFollowRecords,
  addFollowRecord,
  updateCustomerStatus,
  getConversionFunnel,
  createCustomer,
  updateFollowRecord,
  deleteFollowRecord,
  type CustomerCreateParams
} from '@/api/modules/teacher-customers'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const recordsLoading = ref(false)
const funnelLoading = ref(false)
const submitting = ref(false)
const showAddCustomerDialog = ref(false)
const showSOPDialog = ref(false)
const selectedCustomer = ref<any>(null)
const currentSOPStep = ref(0)
const originalSOPStep = ref(0) // 保存原始进度，用于取消时恢复

// SOP流程步骤定义
const sopSteps = [
  { title: '初次联系', description: '了解客户基本情况、需求和意向' },
  { title: '预约参观', description: '邀请客户到园参观，介绍园区环境和课程' },
  { title: '试听体验', description: '安排孩子试听体验课，收集反馈' },
  { title: '方案讲解', description: '根据客户需求讲解报名方案和优惠政策' },
  { title: '签约成交', description: '确认意向，办理报名签约手续' }
]
const activeTab = ref('customers')
const selectedCustomerId = ref('')
const total = ref(0)

// 统计数据
const stats = reactive({
  totalCustomers: 0,
  todayFollows: 0,
  pendingFollows: 0,
  successRate: 0
})

// 客户列表
const customers = ref([])
const followRecords = ref([])
const funnelData = ref<any>(undefined)

// 客户表单
const customerForm = reactive({
  name: '',
  phone: '',
  childName: '',
  childAge: 3,
  source: '',
  remark: ''
})

const customerRules = {
  name: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  childName: [{ required: true, message: '请输入孩子姓名', trigger: 'blur' }],
  childAge: [{ required: true, message: '请输入孩子年龄', trigger: 'change' }],
  source: [{ required: true, message: '请选择客户来源', trigger: 'change' }]
}

const customerFormRef = ref()

// 方法
const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadCustomers(),
      loadStats(),
      loadFunnelData()
    ])
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

const loadCustomers = async (filters?: any) => {
  try {
    const params: any = {
      page: 1,
      pageSize: 100
    }
    
    // 如果有筛选条件，添加到参数中
    if (filters) {
      if (filters.status) params.status = filters.status
      if (filters.source) params.source = filters.source
      if (filters.customerName) params.customerName = filters.customerName
      if (filters.phone) params.phone = filters.phone
    }
    
    const response = await getCustomerList(params)

    if (response.data) {
      customers.value = response.data.list || []
      total.value = response.data.total || 0
    }
  } catch (error) {
    console.error('加载客户数据失败:', error)
    // 如果API调用失败，使用空数组
    customers.value = []
    total.value = 0
  }
}

const loadStats = async () => {
  try {
    const response = await getCustomerTrackingStats()

    if (response.data) {
      Object.assign(stats, response.data)
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    // 如果API调用失败，使用默认值
    stats.totalCustomers = 0
    stats.todayFollows = 0
    stats.pendingFollows = 0
    stats.successRate = 0
  }
}

const loadFunnelData = async () => {
  try {
    const response = await getConversionFunnel()

    if (response.data) {
      funnelData.value = response.data
    }
  } catch (error) {
    console.error('加载转化漏斗数据失败:', error)
    funnelData.value = undefined
  }
}

const loadFollowRecords = async () => {
  if (!selectedCustomerId.value) return

  recordsLoading.value = true
  try {
    const response = await getFollowRecords(selectedCustomerId.value)

    if (response.data) {
      followRecords.value = response.data
    }
  } catch (error) {
    console.error('加载跟进记录失败:', error)
    ElMessage.error('加载跟进记录失败')
    followRecords.value = []
  } finally {
    recordsLoading.value = false
  }
}

const viewCustomer = (customer: any) => {
  // 跳转到SOP详情页
  router.push(`/teacher-center/customer-tracking/${customer.id}`)
}

const viewSOP = (customer: any) => {
  selectedCustomer.value = customer
  // 根据客户状态设置SOP步骤
  const statusMap: Record<string, number> = {
    'new': 0,
    'following': 2,
    'success': 5,
    'lost': 0
  }
  currentSOPStep.value = statusMap[customer.status] || 0
  originalSOPStep.value = currentSOPStep.value // 保存原始进度
  showSOPDialog.value = true
}

// SOP步骤点击处理
const handleStepClick = (index: number) => {
  currentSOPStep.value = index
}

// 下一步
const handleNextStep = () => {
  if (currentSOPStep.value < sopSteps.length - 1) {
    currentSOPStep.value++
  }
}

// 完成签约
const handleComplete = async () => {
  try {
    await ElMessageBox.confirm('确认客户已签约成功？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'success'
    })
    
    // TODO: 调用API更新客户状态为“已成交”
    ElMessage.success('恭喜！客户签约成功')
    showSOPDialog.value = false
    refreshData()
  } catch (error) {
    // 用户取消
  }
}

// 取消SOP编辑
const handleSOPCancel = () => {
  // 恢复原始进度
  currentSOPStep.value = originalSOPStep.value
  showSOPDialog.value = false
}

// 保存SOP进度
const handleSOPSave = async () => {
  try {
    submitting.value = true
    
    // TODO: 调用API保存SOP进度
    // await updateCustomerSOPProgress(selectedCustomer.value.id, currentSOPStep.value)
    
    ElMessage.success(`已更新跟进进度为：${sopSteps[currentSOPStep.value].title}`)
    originalSOPStep.value = currentSOPStep.value // 更新原始进度
    showSOPDialog.value = false
    refreshData()
  } catch (error) {
    console.error('保存SOP进度失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    submitting.value = false
  }
}

const addFollow = (customer: any) => {
  selectedCustomerId.value = customer.id
  activeTab.value = 'records'
  loadFollowRecords()
}

const viewHistory = (customer: any) => {
  selectedCustomerId.value = customer.id
  activeTab.value = 'records'
  loadFollowRecords()
}

const handleFilterChange = (filters: any) => {
  // 处理筛选条件变化
  console.log('筛选条件变化:', filters)
  // 重新加载客户列表，传入筛选条件
  loadCustomers(filters)
}

const handleAddRecord = async (record: any) => {
  try {
    await addFollowRecord(selectedCustomerId.value, record)
    ElMessage.success('跟进记录添加成功')
    loadFollowRecords()
    loadStats() // 刷新统计数据
  } catch (error) {
    console.error('添加跟进记录失败:', error)
    ElMessage.error('添加跟进记录失败')
  }
}

const handleUpdateRecord = async (record: any) => {
  try {
    await updateFollowRecord(selectedCustomerId.value, record.id, {
      followType: record.followType,
      content: record.content,
      nextFollowDate: record.nextFollowDate
    })
    ElMessage.success('跟进记录更新成功')
    loadFollowRecords()
    loadStats() // 刷新统计数据
  } catch (error) {
    console.error('更新跟进记录失败:', error)
    ElMessage.error('更新跟进记录失败')
  }
}

const handleDeleteRecord = async (recordId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条跟进记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteFollowRecord(selectedCustomerId.value, recordId)
    ElMessage.success('跟进记录删除成功')
    loadFollowRecords()
    loadStats() // 刷新统计数据
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除跟进记录失败:', error)
      ElMessage.error('删除跟进记录失败')
    }
  }
}

const handleTimeRangeChange = (timeRange: string) => {
  // 重新加载转化漏斗数据
  loadFunnelData()
  console.log('时间范围变化:', timeRange)
}

const submitCustomer = async () => {
  if (!customerFormRef.value) return

  try {
    await customerFormRef.value.validate()
    submitting.value = true

    // 提交客户信息
    const customerData: CustomerCreateParams = {
      name: customerForm.name,
      phone: customerForm.phone,
      childName: customerForm.childName,
      childAge: customerForm.childAge,
      source: customerForm.source,
      remark: customerForm.remark
    }
    
    await createCustomer(customerData)

    ElMessage.success('客户添加成功')
    handleCloseCustomerDialog()
    await refreshData()
  } catch (error: any) {
    if (error.errors) {
      // 表单验证错误
      return
    }
    console.error('添加客户失败:', error)
    ElMessage.error(error.message || '添加客户失败')
  } finally {
    submitting.value = false
  }
}

const resetCustomerForm = () => {
  Object.assign(customerForm, {
    name: '',
    phone: '',
    childName: '',
    childAge: 3,
    source: '',
    remark: ''
  })
  customerFormRef.value?.resetFields()
}

const handleCloseCustomerDialog = () => {
  resetCustomerForm()
  showAddCustomerDialog.value = false
}

// 生命周期
onMounted(() => {
  refreshData()
})
</script>

<style lang="scss" scoped>
@use "@/styles/design-tokens.scss" as *;

/* ==================== 主选项卡 ==================== */
.main-tabs {
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;

  :deep(.el-tabs) {
    .el-tabs__header {
      margin: 0;
      background-color: var(--bg-card);
      border-bottom: 1px solid var(--border-color);
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    }

    .el-tabs__nav-wrap {
      padding: 0 var(--spacing-lg);

      &::after {
        display: none;
      }
    }

    .el-tabs__item {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      padding: 0 var(--spacing-lg);

      &:hover {
        color: var(--primary-color);
      }

      &.is-active {
        color: var(--primary-color);
        font-weight: 600;
      }
    }

    .el-tabs__active-bar {
      background-color: var(--primary-color);
      height: var(--spacing-xs);
    }

    .el-tabs__content {
      padding: var(--spacing-lg);
      background-color: var(--bg-card);
      border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    }
  }
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

/* ==================== SOP对话框样式 ==================== */
.sop-content {
  .sop-header {
    margin-bottom: var(--spacing-lg);

    h3 {
      font-size: var(--text-lg);
      color: var(--text-primary);
      margin-bottom: var(--spacing-md);
    }

    p {
      color: var(--text-secondary);
      line-height: 1.6;

      strong {
        color: var(--text-primary);
        margin-right: var(--spacing-xs);
      }
    }
  }

  .sop-steps {
    margin: var(--spacing-lg) 0;

    h3 {
      font-size: var(--text-lg);
      color: var(--text-primary);
      margin-bottom: var(--spacing-lg);
    }

    :deep(.el-steps) {
      .el-step__title {
        font-size: var(--text-base);
        font-weight: 600;
      }

      .el-step__description {
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }
      
      // 可点击步骤样式
      .clickable-step {
        cursor: pointer;
        transition: all var(--transition-base);
        
        &:hover {
          .el-step__head {
            transform: scale(1.1);
          }
          
          .el-step__title {
            color: var(--primary-color);
          }
        }
      }
      
      // 自定义步骤图标
      .step-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--bg-secondary);
        color: var(--text-secondary);
        font-weight: 600;
        transition: all var(--transition-base);
        
        &.active {
          background: var(--primary-color);
          color: white;
          box-shadow: 0 0 0 4px var(--primary-light-bg);
        }
      }
    }
  }
  
  .sop-actions {
    margin: var(--spacing-lg) 0;
    
    .el-alert {
      margin-bottom: var(--spacing-lg);
    }
    
    .progress-buttons {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
    }
  }

  .sop-notes {
    margin-top: var(--spacing-lg);

    h3 {
      font-size: var(--text-lg);
      color: var(--text-primary);
      margin-bottom: var(--spacing-md);
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        padding: var(--spacing-sm) 0;
        padding-left: var(--spacing-lg);
        position: relative;
        color: var(--text-secondary);
        line-height: 1.6;

        &::before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--primary-color);
          font-weight: bold;
          font-size: var(--text-lg);
        }
      }
    }
  }
}

/* ==================== 响应式设计 ==================== */
@media (max-width: var(--breakpoint-md)) {
  .main-tabs {
    :deep(.el-tabs) {
      .el-tabs__nav-wrap {
        padding: 0 var(--spacing-md);
      }

      .el-tabs__item {
        padding: 0 var(--spacing-md);
      }

      .el-tabs__content {
        padding: var(--spacing-md);
      }
    }
  }
}
</style>
