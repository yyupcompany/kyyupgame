<template>
  <UnifiedCenterLayout
    title="页面标题"
    description="页面描述"
    icon="User"
  >
    <div class="center-container teacher-customer-tracking">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><Connection /></el-icon>
          客户跟踪
        </h1>
        <p class="page-subtitle">管理我的客户跟进记录</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddCustomerDialog = true">
          <el-icon><Plus /></el-icon>
          新增客户
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <TrackingStatCard
            title="我的客户"
            :value="stats.totalCustomers"
            icon="User"
            color="var(--el-color-primary)"
            description="总客户数"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <TrackingStatCard
            title="今日跟进"
            :value="stats.todayFollows"
            icon="ChatDotRound"
            color="var(--el-color-success)"
            description="已跟进"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <TrackingStatCard
            title="待跟进"
            :value="stats.pendingFollows"
            icon="Clock"
            color="var(--el-color-warning)"
            description="需要跟进"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <TrackingStatCard
            title="成功率"
            :value="stats.successRate"
            icon="SuccessFilled"
            color="var(--el-color-danger)"
            description="转化成功率"
          />
        </el-col>
      </el-row>
    </div>

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
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import CustomerList from './components/CustomerList.vue'
import FollowRecord from './components/FollowRecord.vue'
import ConversionFunnel from './components/ConversionFunnel.vue'
import TrackingStatCard from './components/TrackingStatCard.vue'

// 导入API
import {
  getCustomerTrackingStats,
  getCustomerList,
  getFollowRecords,
  addFollowRecord,
  updateCustomerStatus,
  getConversionFunnel
} from '@/api/modules/teacher-customers'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const recordsLoading = ref(false)
const funnelLoading = ref(false)
const submitting = ref(false)
const showAddCustomerDialog = ref(false)
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
const funnelData = ref(null)

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

const loadCustomers = async () => {
  try {
    const response = await getCustomerList({
      page: 1,
      pageSize: 100
    })

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
    funnelData.value = null
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
  // 跳转到SOP详情页（与查看相同）
  router.push(`/teacher-center/customer-tracking/${customer.id}`)
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
  // TODO: 处理筛选条件变化
  console.log('筛选条件变化:', filters)
  loadCustomers()
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

const handleUpdateRecord = (record: any) => {
  // TODO: 更新跟进记录
  console.log('更新跟进记录:', record)
  ElMessage.success('跟进记录更新成功')
  loadFollowRecords()
}

const handleDeleteRecord = (recordId: string) => {
  // TODO: 删除跟进记录
  console.log('删除跟进记录:', recordId)
  ElMessage.success('跟进记录删除成功')
  loadFollowRecords()
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

    // TODO: 提交客户信息
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('客户添加成功')
    handleCloseCustomerDialog()
    await refreshData()
  } catch (error) {
    ElMessage.error('添加客户失败')
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

<style scoped lang="scss">
@import '@/styles/index.scss';

.teacher-customer-tracking {
  padding: var(--spacing-lg);
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: var(--border-width-base) solid var(--el-border-color-light);
}

.header-content h1 {
  margin: 0;
  font-size: var(--text-2xl);
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.header-content p {
  margin: var(--spacing-xs) 0 0 0;
  color: var(--el-text-color-secondary);
  font-size: var(--text-sm);
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
}

.stats-section {
  margin-bottom: var(--spacing-2xl);
}

.stat-card {
  background: var(--el-bg-color);
  border-radius: var(--spacing-sm);
  padding: var(--text-2xl);
  box-shadow: var(--el-box-shadow-light);
  display: flex;
  align-items: center;
  gap: var(--spacing-4xl);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-full);
  background: var(--el-color-primary-light-9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
  font-size: var(--text-3xl);
}

.stat-number {
  font-size: var(--text-3xl);
  font-weight: bold;
  color: var(--el-text-color-primary);
  line-height: 1;
}

.stat-label {
  font-size: var(--text-base);
  color: var(--el-text-color-secondary);
  margin-top: var(--spacing-xs);
}

.main-tabs {
  background: white;
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-xs) var(--shadow-light);
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;
}

:deep(.el-tabs__content) {
  padding: var(--text-2xl);
}

:deep(.el-tabs__header) {
  margin: 0;
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-sm) var(--spacing-sm) 0 0;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 var(--text-2xl);
}
</style>
