<template>
  <UnifiedCenterLayout
    title="页面标题"
    description="页面描述"
    icon="User"
  >
    <div class="center-container teacher-enrollment">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1>招生中心</h1>
          <p>管理我的招生客户和咨询记录</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleAddCustomer">
            <UnifiedIcon name="Plus" />
            添加客户
          </el-button>
          <el-button @click="refreshData">
            <UnifiedIcon name="Refresh" />
            刷新
          </el-button>
        </div>
      </div>
    </div>

    <!-- 园区招生概况 -->
    <div class="school-overview">
      <el-card>
        <template #header>
          <div class="card-header">
            <span class="card-title">
              <UnifiedIcon name="default" />
              园区招生概况
            </span>
            <el-tag type="success" size="small">本月目标: {{ schoolOverview.monthlyTarget }}人</el-tag>
          </div>
        </template>

        <div class="overview-grid">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <div class="overview-item">
                <div class="overview-value">{{ schoolOverview.totalLeads }}</div>
                <div class="overview-label">园区总客户</div>
                <div class="overview-trend success">+{{ schoolOverview.newLeadsThisMonth }}本月新增</div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <div class="overview-item">
                <div class="overview-value">{{ schoolOverview.currentProgress }}%</div>
                <div class="overview-label">目标完成度</div>
                <div class="overview-trend" :class="schoolOverview.currentProgress >= 80 ? 'success' : 'warning'">
                  {{ schoolOverview.enrolledThisMonth }}/{{ schoolOverview.monthlyTarget }}人
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <div class="overview-item">
                <div class="overview-value">#{{ schoolOverview.teamRanking }}</div>
                <div class="overview-label">团队排名</div>
                <div class="overview-trend info">共{{ schoolOverview.totalTeachers }}位教师</div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <div class="overview-item">
                <div class="overview-value">{{ schoolOverview.myContribution }}%</div>
                <div class="overview-label">我的贡献度</div>
                <div class="overview-trend success">{{ schoolOverview.myEnrolled }}人已录取</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <EnrollmentStatCard
            title="总客户"
            :value="customerStats.total"
            icon="User"
            color="var(--el-color-primary)"
            description="全部客户"
            @click="handleStatClick('total')"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <EnrollmentStatCard
            title="新增客户"
            :value="customerStats.new"
            icon="Plus"
            color="var(--el-color-success)"
            description="本月新增"
            @click="handleStatClick('new')"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <EnrollmentStatCard
            title="已联系"
            :value="customerStats.contacted"
            icon="Phone"
            color="var(--el-color-warning)"
            description="已沟通"
            @click="handleStatClick('contacted')"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <EnrollmentStatCard
            title="已报名"
            :value="customerStats.enrolled"
            icon="Check"
            color="var(--el-color-danger)"
            description="成功转化"
            @click="handleStatClick('enrolled')"
          />
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 筛选区域 -->
      <div class="filter-section">
        <el-card>
          <div class="filter-form">
            <el-row :gutter="16">
              <el-col :xs="24" :sm="8" :md="6">
                <el-form-item label="状态筛选">
                  <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
                    <el-option label="全部" value="" />
                    <el-option label="新客户" value="new" />
                    <el-option label="已联系" value="contacted" />
                    <el-option label="意向客户" value="interested" />
                    <el-option label="已报名" value="enrolled" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="8" :md="6">
                <el-form-item label="来源渠道">
                  <el-select v-model="filterForm.source" placeholder="选择来源" clearable>
                    <el-option label="全部" value="" />
                    <el-option label="线上推广" value="online" />
                    <el-option label="朋友推荐" value="referral" />
                    <el-option label="实地咨询" value="visit" />
                    <el-option label="电话咨询" value="phone" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="8" :md="6">
                <el-form-item label="搜索">
                  <el-input
                    v-model="filterForm.keyword"
                    placeholder="搜索客户姓名或电话"
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="6">
                <div class="filter-actions">
                  <el-button @click="handleSearch">
                    <UnifiedIcon name="Search" />
                    搜索
                  </el-button>
                  <el-button @click="handleResetFilter">重置</el-button>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </div>

      <!-- 客户表格 -->
      <div class="table-section">
        <el-card>
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <UnifiedIcon name="default" />
                客户列表
              </span>
              <div class="card-actions">
                <el-button :disabled="selectedCustomers.length === 0" @click="handleBatchUpdate">
                  批量更新
                </el-button>
                <el-button :disabled="selectedCustomers.length === 0" @click="handleBatchDelete">
                  批量删除
                </el-button>
              </div>
            </div>
          </template>

          <div class="table-container">
            <div class="table-wrapper">
<el-table class="responsive-table"
              :data="customerList"
              @selection-change="handleSelectionChange"
              style="width: 100%"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="customerName" label="客户姓名" width="120" />
              <el-table-column prop="phone" label="联系电话" width="130" />
              <el-table-column prop="childName" label="孩子姓名" width="120" />
              <el-table-column prop="childAge" label="孩子年龄" width="100">
                <template #default="{ row }">
                  {{ row.childAge }}岁
                </template>
              </el-table-column>
              <el-table-column prop="source" label="客户来源" width="100">
                <template #default="{ row }">
                  {{ getSourceText(row.source) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="lastFollowDate" label="最后跟进" width="150">
                <template #default="{ row }">
                  {{ formatDate(row.lastFollowDate) || '未跟进' }}
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="150">
                <template #default="{ row }">
                  {{ formatDate(row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="250" fixed="right">
                <template #default="{ row }">
                  <div class="table-actions">
                    <el-button size="small" @click="handleViewCustomer(row)">
                      查看
                    </el-button>
                    <el-button size="small" type="primary" @click="handleEditCustomer(row)">
                      编辑
                    </el-button>
                    <el-button size="small" type="success" @click="handleFollowUp(row)">
                      跟进
                    </el-button>
                    <el-button size="small" type="warning" @click="handleUpdateStatus(row)">
                      状态
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
</div>
          </div>

          <!-- 分页 -->
          <div class="pagination-container">
            <div class="pagination-info">
              共 {{ pagination.total }} 条
            </div>
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[20, 50, 100]"
              :total="pagination.total"
              layout="sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>
    </div>

    <!-- 客户详情弹窗 -->
    <el-dialog
      v-model="customerDetailVisible"
      title="客户详情"
      width="600px"
    >
      <div v-if="currentCustomer">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="客户姓名">{{ currentCustomer.name }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentCustomer.phone }}</el-descriptions-item>
          <el-descriptions-item label="孩子姓名">{{ currentCustomer.childName }}</el-descriptions-item>
          <el-descriptions-item label="孩子年龄">{{ currentCustomer.childAge }}岁</el-descriptions-item>
          <el-descriptions-item label="客户来源">{{ currentCustomer.source }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentCustomer.status)">
              {{ getStatusText(currentCustomer.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ currentCustomer.createTime }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentCustomer.notes || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="customerDetailVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEditCustomer(currentCustomer)">编辑</el-button>
      </template>
    </el-dialog>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Refresh,
  Search,
  User,
  ChatDotRound,
  Clock,
  TrendCharts,
  Phone,
  Check
} from '@element-plus/icons-vue'
import {
  getCustomerStats,
  getCustomerList,
  getConversionFunnel,
  addFollowRecord,
  updateCustomerStatus,
  getCustomerTrackingStats,
  type Customer,
  type CustomerQueryParams,
  type CustomerStats,
  type ConversionFunnelData,
  CustomerStatus,
  CustomerSource
} from '@/api/modules/teacher-customers'
import EnrollmentStatCard from './components/EnrollmentStatCard.vue'

// 响应式数据
const activeTab = ref('customers')
const loading = ref(false)
const consultationLoading = ref(false)
const customerDetailVisible = ref(false)
const currentCustomer = ref<Customer | null>(null)
const selectedCustomers = ref<Customer[]>([])

// 园区招生概况数据
const schoolOverview = reactive({
  totalLeads: 0,
  newLeadsThisMonth: 0,
  monthlyTarget: 0,
  enrolledThisMonth: 0,
  currentProgress: 0,
  teamRanking: 0,
  totalTeachers: 0,
  myContribution: 0,
  myEnrollments: 0
})

// 统计数据
const enrollmentStats = reactive({
  totalCustomers: 0,
  todayFollows: 0,
  pendingFollows: 0,
  successRate: 0
})

// 客户列表数据
const customerList = ref<Customer[]>([])

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 筛选条件
const customerFilter = reactive<CustomerQueryParams>({
  customerName: '',
  phone: '',
  status: undefined,
  source: undefined
})

// 筛选表单（用于模板绑定）
const filterForm = reactive({
  status: '',
  source: '',
  keyword: ''
})

// 客户统计数据（用于模板绑定）
const customerStats = reactive({
  total: 0,
  new: 0,
  contacted: 0,
  enrolled: 0
})

// 咨询列表数据
const consultationList = ref([])

// 转化漏斗数据
const funnelData = reactive<ConversionFunnelData>({
  stages: [],
  conversionRate: 0,
  totalLeads: 0
})

// 计算属性
const getConvertedCount = computed(() => {
  return funnelData.stages.find(stage => stage.stage === '已转化')?.count || 0
})

// 方法
const handleTabChange = (tabName: string) => {
  console.log('切换标签页:', tabName)
  if (tabName === 'consultations') {
    loadConsultationList()
  } else if (tabName === 'statistics') {
    loadFunnelData()
  }
}

const handleAddCustomer = () => {
  ElMessage.info('添加客户功能开发中')
}

const refreshData = async () => {
  await Promise.all([
    loadSchoolOverview(),
    loadEnrollmentStats(),
    loadCustomerList(),
    loadFunnelData()
  ])
  ElMessage.success('数据刷新成功')
}

const handleSearch = () => {
  pagination.page = 1
  loadCustomerList()
}

const handleResetFilter = () => {
  Object.assign(customerFilter, {
    customerName: '',
    phone: '',
    status: undefined,
    source: undefined
  })
  pagination.page = 1
  loadCustomerList()
}

const handleSelectionChange = (selection: Customer[]) => {
  selectedCustomers.value = selection
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadCustomerList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadCustomerList()
}

const handleViewCustomer = (customer: Customer) => {
  currentCustomer.value = customer
  customerDetailVisible.value = true
}

const handleEditCustomer = (customer: Customer) => {
  ElMessage.info('编辑客户功能开发中')
}

const handleFollowUp = async (customer: Customer) => {
  try {
    const { value: content } = await ElMessageBox.prompt('请输入跟进内容', '客户跟进', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入跟进内容...'
    })

    if (content) {
      await addFollowRecord(customer.id, {
        followType: '电话跟进',
        content: content
      })
      ElMessage.success('跟进记录添加成功')
      loadCustomerList()
    }
  } catch (error) {
    console.error('添加跟进记录失败:', error)
    ElMessage.error('添加跟进记录失败')
  }
}

const handleUpdateStatus = async (customer: Customer) => {
  try {
    const { value: status } = await ElMessageBox.prompt('请选择新状态', '更新客户状态', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'select',
      inputOptions: [
        { label: '新客户', value: CustomerStatus.NEW },
        { label: '跟进中', value: CustomerStatus.FOLLOWING },
        { label: '已转化', value: CustomerStatus.CONVERTED },
        { label: '已流失', value: CustomerStatus.LOST }
      ]
    })

    if (status) {
      await updateCustomerStatus(customer.id, status as CustomerStatus)
      ElMessage.success('客户状态更新成功')
      loadCustomerList()
    }
  } catch (error) {
    console.error('更新客户状态失败:', error)
    ElMessage.error('更新客户状态失败')
  }
}

const handleViewConsultation = (consultation: any) => {
  ElMessage.info('查看咨询功能开发中')
}

const handleEditConsultation = (consultation: any) => {
  ElMessage.info('编辑咨询功能开发中')
}

const handleCreateConsultation = () => {
  ElMessage.info('创建咨询功能开发中')
}

const handleStatClick = (type: string) => {
  console.log('点击统计卡片:', type)
  // 可以根据类型筛选客户列表
  filterForm.status = type === 'total' ? '' : type
  handleSearch()
}

const handleBatchUpdate = () => {
  if (selectedCustomers.value.length === 0) {
    ElMessage.warning('请先选择要更新的客户')
    return
  }
  ElMessage.info('批量更新功能开发中')
}

const handleBatchDelete = () => {
  if (selectedCustomers.value.length === 0) {
    ElMessage.warning('请先选择要删除的客户')
    return
  }
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedCustomers.value.length} 个客户吗？`,
    '批量删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.info('批量删除功能开发中')
  }).catch(() => {
    // 用户取消
  })
}

// 数据加载函数
const loadSchoolOverview = async () => {
  try {
    // 模拟园区概况数据
    schoolOverview.totalLeads = 1250
    schoolOverview.newLeadsThisMonth = 85
    schoolOverview.monthlyTarget = 120
    schoolOverview.enrolledThisMonth = 96
    schoolOverview.currentProgress = Math.round((schoolOverview.enrolledThisMonth / schoolOverview.monthlyTarget) * 100)
    schoolOverview.teamRanking = 3
    schoolOverview.totalTeachers = 12
    schoolOverview.myEnrollments = 8
    schoolOverview.myContribution = Math.round((schoolOverview.myEnrollments / schoolOverview.enrolledThisMonth) * 100)
  } catch (error) {
    console.error('加载园区概况数据失败:', error)
  }
}

const loadEnrollmentStats = async () => {
  try {
    const response = await getCustomerTrackingStats()
    Object.assign(enrollmentStats, response.data)

    // 同时更新 customerStats
    const statsResponse = await getCustomerStats()
    if (statsResponse.data) {
      customerStats.total = statsResponse.data.total || 0
      customerStats.new = statsResponse.data.new || 0
      customerStats.contacted = statsResponse.data.contacted || 0
      customerStats.enrolled = statsResponse.data.enrolled || 0
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    // 使用默认值
    Object.assign(enrollmentStats, {
      totalCustomers: 0,
      todayFollows: 0,
      pendingFollows: 0,
      successRate: 0
    })
    Object.assign(customerStats, {
      total: 0,
      new: 0,
      contacted: 0,
      enrolled: 0
    })
  }
}

const loadCustomerList = async () => {
  try {
    loading.value = true
    const params: CustomerQueryParams = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...customerFilter
    }

    const response = await getCustomerList(params)
    customerList.value = response.data?.list || []
    pagination.total = response.data?.total || 0
  } catch (error) {
    console.error('加载客户列表失败:', error)
    ElMessage.error('加载客户列表失败')
    customerList.value = []
  } finally {
    loading.value = false
  }
}

const loadConsultationList = async () => {
  try {
    consultationLoading.value = true
    // 这里应该调用咨询相关的API
    // const response = await getConsultationList()
    // consultationList.value = response.data || []

    // 临时使用模拟数据
    consultationList.value = []
  } catch (error) {
    console.error('加载咨询列表失败:', error)
    consultationList.value = []
  } finally {
    consultationLoading.value = false
  }
}

const loadFunnelData = async () => {
  try {
    const response = await getConversionFunnel()
    Object.assign(funnelData, response.data)
  } catch (error) {
    console.error('加载转化漏斗数据失败:', error)
    // 使用默认值
    Object.assign(funnelData, {
      stages: [
        { stage: '新线索', count: 0, percentage: 100, color: 'var(--el-color-primary)' },
        { stage: '初次接触', count: 0, percentage: 0, color: 'var(--el-color-success)' },
        { stage: '深度沟通', count: 0, percentage: 0, color: 'var(--el-color-warning)' },
        { stage: '已转化', count: 0, percentage: 0, color: 'var(--el-color-danger)' }
      ],
      conversionRate: 0,
      totalLeads: 0
    })
  }
}

// 工具函数
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    NEW: 'info',
    FOLLOWING: 'warning',
    CONVERTED: 'success',
    LOST: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    NEW: '新客户',
    FOLLOWING: '跟进中',
    CONVERTED: '已转化',
    LOST: '已流失'
  }
  return statusMap[status] || '未知'
}

const getSourceText = (source: string) => {
  const sourceMap: Record<string, string> = {
    ONLINE: '网络咨询',
    REFERRAL: '朋友推荐',
    VISIT: '上门咨询',
    PHONE: '电话咨询',
    OTHER: '其他'
  }
  return sourceMap[source] || '未知'
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(async () => {
  console.log('教师招生页面已加载')
  await Promise.all([
    loadEnrollmentStats(),
    loadCustomerList()
  ])
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.teacher-enrollment {
  padding: var(--spacing-lg);
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;
}

.school-overview {
  margin-bottom: var(--spacing-lg);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .overview-item {
    text-align: center;
    padding: var(--text-2xl) 10px;

    .overview-value {
      font-size: var(--text-3xl);
      font-weight: bold;
      color: var(--el-color-primary);
      margin-bottom: var(--spacing-sm);
    }

    .overview-label {
      font-size: var(--text-base);
      color: var(--el-text-color-regular);
      margin-bottom: var(--spacing-sm);
    }

    .overview-trend {
      font-size: var(--text-sm);
      padding: var(--spacing-sm) var(--spacing-sm);
      border-radius: var(--text-sm);

      &.success {
        color: var(--el-color-success);
        background-color: var(--el-color-success-light-9);
      }

      &.warning {
        color: var(--el-color-warning);
        background-color: var(--el-color-warning-light-9);
      }

      &.info {
        color: var(--el-color-info);
        background-color: var(--el-color-info-light-9);
      }

      &.primary {
        color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }
    }
  }
}

.enrollment-header {
  margin-bottom: var(--spacing-lg);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--el-bg-color);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--el-box-shadow-light);
  border: var(--border-width-base) solid var(--el-border-color-light);
}

.page-title h1 {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: var(--text-2xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.page-title p {
  margin: var(--spacing-xs) 0 0 0;
  color: var(--el-text-color-secondary);
  font-size: var(--text-sm);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.stats-cards {
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  background: var(--el-bg-color);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--el-box-shadow-light);
  border: var(--border-width-base) solid var(--el-border-color-light);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: var(--el-box-shadow);
  transform: translateY(var(--transform-hover-lift));
}

.stat-icon {
  width: auto;
  min-height: 60px; height: auto;
  border-radius: var(--radius-full);
  background: var(--el-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--text-2xl);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: var(--text-3xl);
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-base);
}

.stat-label {
  font-size: var(--text-base);
  color: var(--el-text-color-secondary);
}

.main-content {
  background: var(--el-bg-color);
  border-radius: var(--spacing-sm);
  box-shadow: var(--el-box-shadow-light);
  border: var(--border-width-base) solid var(--el-border-color-light);
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
}

.tab-content {
  padding: var(--spacing-lg);
}

.filter-section {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--el-fill-color-light);
  border-radius: var(--radius-md);
  border: var(--border-width-base) solid var(--el-border-color-lighter);
}

.customer-table {
  margin-top: var(--spacing-lg);
}

.pagination-wrapper {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: center;
}

.consultation-header {
  margin-bottom: var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistics-content {
  padding: var(--spacing-lg) 0;
}

.funnel-chart {
  margin-bottom: var(--spacing-2xl);
}

.funnel-chart h3 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--text-2xl);
}

.funnel-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
  max-width: 100%; max-width: 600px;
  margin: 0 auto;
}

.funnel-stage {
  padding: var(--spacing-4xl) var(--text-2xl);
  border-radius: var(--spacing-sm);
  color: white;
  text-align: center;
  position: relative;
  margin: 0 auto;
  width: 100%; /* 简化width，移除 problematic calc */
}

.stage-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stage-name {
  font-weight: bold;
  font-size: var(--text-lg);
}

.stage-count {
  font-size: var(--text-xl);
  font-weight: bold;
}

.stage-percentage {
  font-size: var(--text-base);
  opacity: 0.9;
}

.stats-summary {
  margin-bottom: var(--spacing-8xl);
}

.summary-card {
  background: var(--el-bg-color);
  padding: var(--text-2xl);
  border-radius: var(--spacing-sm);
  box-shadow: var(--el-box-shadow-light);
  border: var(--border-width-base) solid var(--el-border-color-light);
  text-align: center;
}

.card-title {
  color: var(--el-text-color-secondary);
  font-size: var(--text-base);
  margin-bottom: var(--spacing-2xl);
}

.card-value {
  color: var(--el-text-color-primary);
  font-size: var(--text-3xl);
  font-weight: bold;
}

.trend-chart h3 {
  color: var(--el-text-color-primary);
  margin-bottom: var(--text-2xl);
}

.chart-placeholder {
  min-height: 60px; height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color-lighter);
}

@media (max-width: var(--breakpoint-md)) {
  .teacher-enrollment {
    padding: var(--spacing-2xl);
  }

  .header-content {
    flex-direction: column;
    gap: var(--spacing-4xl);
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .filter-section .el-form {
    flex-direction: column;
  }

  .filter-section .el-form-item {
    margin-right: 0;
    margin-bottom: var(--spacing-4xl);
  }

  .funnel-container {
    max-width: 100%;
  }

  .stage-info {
    flex-direction: column;
    gap: var(--spacing-base);
  }
}
</style>
