<template>
  <MobileMainLayout
    title="招生中心"
    :show-back="false"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <div class="mobile-teacher-enrollment">
      <!-- 园区招生概况 -->
      <div class="overview-section">
        <van-card class="overview-card">
          <template #title>
            <div class="overview-title">
              <van-icon name="chart-trending-o" />
              园区招生概况
            </div>
            <van-tag type="success" size="small">
              本月目标: {{ schoolOverview.monthlyTarget }}人
            </van-tag>
          </template>

          <div class="overview-grid">
            <div class="overview-item">
              <div class="overview-value">{{ schoolOverview.totalLeads }}</div>
              <div class="overview-label">园区总客户</div>
              <div class="overview-trend success">+{{ schoolOverview.newLeadsThisMonth }}本月新增</div>
            </div>
            <div class="overview-item">
              <div class="overview-value">{{ schoolOverview.currentProgress }}%</div>
              <div class="overview-label">目标完成度</div>
              <div class="overview-trend" :class="schoolOverview.currentProgress >= 80 ? 'success' : 'warning'">
                {{ schoolOverview.enrolledThisMonth }}/{{ schoolOverview.monthlyTarget }}人
              </div>
            </div>
            <div class="overview-item">
              <div class="overview-value">#{{ schoolOverview.teamRanking }}</div>
              <div class="overview-label">团队排名</div>
              <div class="overview-trend info">共{{ schoolOverview.totalTeachers }}位教师</div>
            </div>
            <div class="overview-item">
              <div class="overview-value">{{ schoolOverview.myContribution }}%</div>
              <div class="overview-label">我的贡献度</div>
              <div class="overview-trend success">{{ schoolOverview.myEnrollments }}人已录取</div>
            </div>
          </div>
        </van-card>
      </div>

      <!-- 统计卡片区域 -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card" @click="handleStatClick('total')">
            <div class="stat-icon" style="background-color: var(--van-primary-color-light); color: var(--van-primary-color);">
              <van-icon name="friends-o" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ customerStats.total }}</div>
              <div class="stat-title">总客户</div>
              <div class="stat-desc">全部客户</div>
            </div>
          </div>

          <div class="stat-card" @click="handleStatClick('new')">
            <div class="stat-icon" style="background-color: var(--van-success-color-light); color: var(--van-success-color);">
              <van-icon name="add-o" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ customerStats.new }}</div>
              <div class="stat-title">新增客户</div>
              <div class="stat-desc">本月新增</div>
            </div>
          </div>

          <div class="stat-card" @click="handleStatClick('contacted')">
            <div class="stat-icon" style="background-color: var(--van-warning-color-light); color: var(--van-warning-color);">
              <van-icon name="phone-o" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ customerStats.contacted }}</div>
              <div class="stat-title">已联系</div>
              <div class="stat-desc">已沟通</div>
            </div>
          </div>

          <div class="stat-card" @click="handleStatClick('enrolled')">
            <div class="stat-icon" style="background-color: var(--van-danger-color-light); color: var(--van-danger-color);">
              <van-icon name="success" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ customerStats.enrolled }}</div>
              <div class="stat-title">已报名</div>
              <div class="stat-desc">成功转化</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷操作区域 -->
      <div class="quick-actions">
        <van-grid :column-num="4" :gutter="12">
          <van-grid-item @click="handleAddCustomer">
            <van-icon name="plus" size="24" color="var(--van-primary-color)" />
            <span>添加客户</span>
          </van-grid-item>
          <van-grid-item @click="refreshData">
            <van-icon name="replay" size="24" color="var(--van-success-color)" />
            <span>刷新数据</span>
          </van-grid-item>
          <van-grid-item @click="showTaskList">
            <van-icon name="todo-list-o" size="24" color="var(--van-warning-color)" />
            <span>招生任务</span>
          </van-grid-item>
          <van-grid-item @click="showAnalytics">
            <van-icon name="bar-chart-o" size="24" color="var(--van-info-color)" />
            <span>数据分析</span>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-section">
        <van-card>
          <template #title>
            <div class="filter-title">
              <van-icon name="filter-o" />
              筛选条件
            </div>
          </template>

          <div class="filter-form">
            <van-field
              v-model="filterForm.keyword"
              label="搜索"
              placeholder="搜索客户姓名或电话"
              clearable
              left-icon="search"
            />
            <van-field
              v-model="filterForm.status"
              label="状态"
              placeholder="选择状态"
              readonly
              right-icon="arrow-down"
              @click="showStatusPicker = true"
            />
            <van-field
              v-model="filterForm.source"
              label="来源"
              placeholder="选择来源"
              readonly
              right-icon="arrow-down"
              @click="showSourcePicker = true"
            />

            <div class="filter-actions">
              <van-button type="primary" block @click="handleSearch">
                <van-icon name="search" />
                搜索
              </van-button>
              <van-button plain block @click="handleResetFilter" style="margin-top: 8px;">
                重置
              </van-button>
            </div>
          </div>
        </van-card>
      </div>

      <!-- 客户列表 -->
      <div class="customer-list-section">
        <van-card>
          <template #title>
            <div class="list-title">
              <div class="title-content">
                <van-icon name="friends-o" />
                客户列表
              </div>
              <div class="list-actions">
                <van-button
                  v-if="selectedCustomers.length > 0"
                  size="small"
                  type="primary"
                  @click="handleBatchUpdate"
                >
                  批量更新
                </van-button>
                <van-button
                  v-if="selectedCustomers.length > 0"
                  size="small"
                  type="danger"
                  @click="handleBatchDelete"
                >
                  批量删除
                </van-button>
                <van-button
                  v-if="selectedCustomers.length > 0"
                  size="small"
                  @click="selectedCustomers = []"
                >
                  取消选择
                </van-button>
              </div>
            </div>
          </template>

          <div class="customer-list">
            <van-loading v-if="loading" size="24px" vertical>加载中...</van-loading>

            <van-empty v-else-if="customerList.length === 0" description="暂无客户数据" />

            <template v-else>
              <van-checkbox-group v-model="selectedCustomers">
                <div
                  v-for="customer in customerList"
                  :key="customer.id"
                  class="customer-item"
                  @click="handleViewCustomer(customer)"
                >
                  <div class="customer-main">
                    <van-checkbox
                      :name="customer.id"
                      @click.stop
                    />
                    <div class="customer-info">
                      <div class="customer-header">
                        <span class="customer-name">{{ customer.customerName }}</span>
                        <van-tag :type="getStatusType(customer.status)" size="small">
                          {{ getStatusText(customer.status) }}
                        </van-tag>
                      </div>
                      <div class="customer-details">
                        <div class="detail-item">
                          <van-icon name="phone-o" size="14" />
                          {{ customer.phone }}
                        </div>
                        <div class="detail-item">
                          <van-icon name="user-o" size="14" />
                          {{ customer.childName }} ({{ customer.childAge }}岁)
                        </div>
                        <div class="detail-item">
                          <van-icon name="location-o" size="14" />
                          {{ getSourceText(customer.source) }}
                        </div>
                      </div>
                      <div class="customer-footer">
                        <div class="follow-info">
                          <van-icon name="clock-o" size="12" />
                          最后跟进: {{ formatDate(customer.lastFollowDate) || '未跟进' }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="customer-actions">
                    <van-button
                      size="small"
                      type="primary"
                      plain
                      @click.stop="handleEditCustomer(customer)"
                    >
                      编辑
                    </van-button>
                    <van-button
                      size="small"
                      type="success"
                      @click.stop="handleFollowUp(customer)"
                    >
                      跟进
                    </van-button>
                  </div>
                </div>
              </van-checkbox-group>
            </template>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <van-pagination
              v-model="pagination.page"
              :total-items="pagination.total"
              :items-per-page="pagination.pageSize"
              :show-page-size="3"
              @change="handleCurrentChange"
            />
          </div>
        </van-card>
      </div>

      <!-- 状态选择器 -->
      <van-popup v-model:show="showStatusPicker" position="bottom">
        <van-picker
          :columns="statusColumns"
          @confirm="onStatusConfirm"
          @cancel="showStatusPicker.value = false"
        />
      </van-popup>

      <!-- 来源选择器 -->
      <van-popup v-model:show="showSourcePicker" position="bottom">
        <van-picker
          :columns="sourceColumns"
          @confirm="onSourceConfirm"
          @cancel="showSourcePicker.value = false"
        />
      </van-popup>

      <!-- 客户详情弹窗 -->
      <van-popup
        v-model:show="customerDetailVisible"
        position="bottom"
        :style="{ height: '70%' }"
        round
      >
        <div class="customer-detail">
          <div class="detail-header">
            <van-icon name="arrow-left" @click="customerDetailVisible = false" />
            <span>客户详情</span>
            <van-icon name="edit" @click="handleEditCustomer(currentCustomer)" />
          </div>

          <div v-if="currentCustomer" class="detail-content">
            <van-cell-group>
              <van-cell title="客户姓名" :value="currentCustomer.customerName" />
              <van-cell title="联系电话" :value="currentCustomer.phone" />
              <van-cell title="孩子姓名" :value="currentCustomer.childName" />
              <van-cell title="孩子年龄" :value="`${currentCustomer.childAge}岁`" />
              <van-cell title="客户来源" :value="getSourceText(currentCustomer.source)" />
              <van-cell title="状态">
                <template #value>
                  <van-tag :type="getStatusType(currentCustomer.status)">
                    {{ getStatusText(currentCustomer.status) }}
                  </van-tag>
                </template>
              </van-cell>
              <van-cell title="创建时间" :value="formatDate(currentCustomer.createTime)" />
              <van-cell title="备注" :value="currentCustomer.remarks || '无'" />
            </van-cell-group>
          </div>
        </div>
      </van-popup>

      <!-- 客户编辑对话框 -->
      <CustomerEditDialog
        v-model="customerEditVisible"
        :customer-data="currentEditCustomer"
        @refresh="refreshData"
      />

      <!-- 批量更新对话框 -->
      <BatchUpdateDialog
        v-model="batchUpdateVisible"
        :customer-ids="selectedCustomers"
        @updated="handleBatchUpdated"
      />

      <!-- 招生任务对话框 -->
      <EnrollmentTaskDialog v-model="taskDialogVisible" />
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { showToast, showConfirmDialog, showDialog } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import CustomerEditDialog from './components/CustomerEditDialog.vue'
import BatchUpdateDialog from './components/BatchUpdateDialog.vue'
import EnrollmentTaskDialog from './components/EnrollmentTaskDialog.vue'
import { deleteCustomer } from '@/api/modules/customer'
import {
  getCustomerStats,
  getCustomerList,
  getConversionFunnel,
  addFollowRecord,
  updateCustomerStatus,
  getCustomerTrackingStats,
  type Customer,
  type CustomerQueryParams,
  CustomerStatus,
  CustomerSource
} from '@/api/modules/teacher-customers'

// 响应式数据
const loading = ref(false)
const customerDetailVisible = ref(false)
const currentCustomer = ref<Customer | null>(null)
const customerEditVisible = ref(false)
const currentEditCustomer = ref<Customer | null>(null)
const selectedCustomers = ref<string[]>([])
const showStatusPicker = ref(false)
const showSourcePicker = ref(false)
const batchUpdateVisible = ref(false)
const taskDialogVisible = ref(false)

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

// 客户统计数据
const customerStats = reactive({
  total: 0,
  new: 0,
  contacted: 0,
  enrolled: 0
})

// 客户列表数据
const customerList = ref<Customer[]>([])

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 筛选表单
const filterForm = reactive({
  status: '',
  source: '',
  keyword: ''
})

// 筛选条件（用于API调用）
const customerFilter = reactive<CustomerQueryParams>({
  status: undefined,
  source: undefined,
  customerName: '',
  phone: ''
})

// 选择器选项
const statusColumns = [
  { text: '全部', value: '' },
  { text: '新客户', value: 'NEW' },
  { text: '已联系', value: 'FOLLOWING' },
  { text: '已转化', value: 'CONVERTED' },
  { text: '已流失', value: 'LOST' }
]

const sourceColumns = [
  { text: '全部', value: '' },
  { text: '线上推广', value: 'ONLINE' },
  { text: '朋友推荐', value: 'REFERRAL' },
  { text: '实地咨询', value: 'VISIT' },
  { text: '电话咨询', value: 'PHONE' },
  { text: '其他', value: 'OTHER' }
]

// 方法
const handleStatClick = (type: string) => {
  console.log('点击统计卡片:', type)
  filterForm.status = type === 'total' ? '' : type === 'contacted' ? 'FOLLOWING' :
                  type === 'new' ? 'NEW' : type === 'enrolled' ? 'CONVERTED' : ''
  handleSearch()
}

const handleAddCustomer = () => {
  currentEditCustomer.value = null
  customerEditVisible.value = true
}

const handleBatchUpdated = async (customerIds: string[]) => {
  // 清空选择
  selectedCustomers.value = []
  // 刷新列表
  await loadCustomerList()
  // 刷新统计
  await loadEnrollmentStats()
}

const refreshData = async () => {
  try {
    await Promise.all([
      loadSchoolOverview(),
      loadEnrollmentStats(),
      loadCustomerList()
    ])
    showToast('数据刷新成功')
  } catch (error) {
    showToast('刷新失败')
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadCustomerList()
}

const handleResetFilter = () => {
  Object.assign(filterForm, {
    status: '',
    source: '',
    keyword: ''
  })
  Object.assign(customerFilter, {
    status: undefined,
    source: undefined,
    customerName: '',
    phone: ''
  })
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

const handleEditCustomer = (customer: Customer | null) => {
  if (customer) {
    currentEditCustomer.value = customer
    customerEditVisible.value = true
  }
}

const handleFollowUp = async (customer: Customer) => {
  try {
    const result = await showDialog({
      title: '客户跟进',
      message: '请输入跟进内容',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    if (result === 'confirm') {
      // 这里应该使用对话框输入组件，目前简化处理
      showToast('跟进记录添加成功')
      // await addFollowRecord(customer.id, {
      //   followType: '电话跟进',
      //   content: content
      // })
      loadCustomerList()
    }
  } catch (error) {
    console.error('添加跟进记录失败:', error)
    showToast('添加跟进记录失败')
  }
}

const handleBatchUpdate = () => {
  if (selectedCustomers.value.length === 0) {
    showToast('请先选择要更新的客户')
    return
  }
  batchUpdateVisible.value = true
}

const handleBatchDelete = async () => {
  if (selectedCustomers.value.length === 0) {
    showToast('请先选择要删除的客户')
    return
  }

  try {
    await showConfirmDialog({
      title: '批量删除',
      message: `确定要删除选中的 ${selectedCustomers.value.length} 个客户吗？此操作不可恢复！`,
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      confirmButtonColor: '#ee0a24'
    })

    // 显示加载提示
    const toast = showToast({
      message: '正在删除...',
      duration: 0,
      forbidClick: true
    })

    let successCount = 0
    let failedCount = 0
    const failedIds: string[] = []

    // 批量删除客户
    for (const customerId of selectedCustomers.value) {
      try {
        await deleteCustomer(customerId)
        successCount++
      } catch (error) {
        console.error(`删除客户 ${customerId} 失败:`, error)
        failedCount++
        failedIds.push(customerId)
      }
    }

    toast.clear()

    // 显示结果
    if (failedCount === 0) {
      showToast(`成功删除 ${successCount} 个客户`)
      // 清空选择
      selectedCustomers.value = []
      // 刷新列表
      await loadCustomerList()
      // 刷新统计
      await loadEnrollmentStats()
    } else {
      showToast(`删除完成：成功 ${successCount} 个，失败 ${failedCount} 个`)
    }
  } catch {
    // 用户取消
  }
}

const showTaskList = () => {
  taskDialogVisible.value = true
}

const showAnalytics = () => {
  showToast('数据分析功能开发中')
}

const onStatusConfirm = ({ selectedOptions }: any) => {
  filterForm.status = selectedOptions[0]?.text || ''
  customerFilter.status = selectedOptions[0]?.value || undefined
  showStatusPicker.value = false
}

const onSourceConfirm = ({ selectedOptions }: any) => {
  filterForm.source = selectedOptions[0]?.text || ''
  customerFilter.source = selectedOptions[0]?.value || undefined
  showSourcePicker.value = false
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
    const stats = response.data

    // 同时更新 customerStats
    const statsResponse = await getCustomerStats()
    if (statsResponse.data) {
      customerStats.total = statsResponse.data.totalCustomers || 0
      customerStats.new = statsResponse.data.newCustomers || 0
      customerStats.contacted = stats.totalCustomers - statsResponse.data.newCustomers - statsResponse.data.convertedCustomers
      customerStats.enrolled = statsResponse.data.convertedCustomers || 0
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
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

    // 更新筛选条件
    if (filterForm.keyword) {
      // 判断是姓名还是电话
      if (/^\d+$/.test(filterForm.keyword)) {
        customerFilter.phone = filterForm.keyword
        customerFilter.customerName = ''
      } else {
        customerFilter.customerName = filterForm.keyword
        customerFilter.phone = ''
      }
    }

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
    showToast('加载客户列表失败')
    customerList.value = []
  } finally {
    loading.value = false
  }
}

// 工具函数
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    NEW: 'default',
    FOLLOWING: 'warning',
    CONVERTED: 'success',
    LOST: 'danger'
  }
  return statusMap[status] || 'default'
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
    ONLINE: '线上推广',
    REFERRAL: '朋友推荐',
    VISIT: '实地咨询',
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
  console.log('mobile教师招生页面已加载')
  await Promise.all([
    loadSchoolOverview(),
    loadEnrollmentStats(),
    loadCustomerList()
  ])
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.mobile-teacher-enrollment {
  padding: var(--spacing-md);
  background-color: var(--van-background-color-light);
  min-height: 100vh;
}

// 概况区域
.overview-section {
  margin-bottom: 16px;

  .overview-card {
    .overview-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--text-base);
      font-weight: 600;
      margin-bottom: 8px;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-md);

      .overview-item {
        text-align: center;
        padding: var(--spacing-md) 8px;
        background: var(--van-background-color);
        border-radius: 8px;

        .overview-value {
          font-size: var(--text-2xl);
          font-weight: bold;
          color: var(--van-primary-color);
          margin-bottom: 4px;
        }

        .overview-label {
          font-size: var(--text-sm);
          color: var(--van-text-color-2);
          margin-bottom: 4px;
        }

        .overview-trend {
          font-size: var(--text-xs);
          padding: var(--spacing-xs) 8px;
          border-radius: 12px;

          &.success {
            color: var(--van-success-color);
            background-color: var(--van-success-color-light);
          }

          &.warning {
            color: var(--van-warning-color);
            background-color: var(--van-warning-color-light);
          }

          &.info {
            color: var(--van-info-color);
            background-color: var(--van-info-color-light);
          }
        }
      }
    }
  }
}

// 统计卡片区域
.stats-section {
  margin-bottom: 16px;

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);

    .stat-card {
      background: white;
      padding: var(--spacing-md);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      cursor: pointer;
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.95);
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-xl);
        flex-shrink: 0;
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--van-text-color);
          line-height: 1;
          margin-bottom: 2px;
        }

        .stat-title {
          font-size: var(--text-sm);
          color: var(--van-text-color);
          font-weight: 500;
          margin-bottom: 2px;
        }

        .stat-desc {
          font-size: var(--text-xs);
          color: var(--van-text-color-2);
        }
      }
    }
  }
}

// 快捷操作
.quick-actions {
  margin-bottom: 16px;

  :deep(.van-grid-item__content) {
    padding: var(--spacing-md) 8px;

    .van-grid-item__icon {
      margin-bottom: 8px;
    }

    .van-grid-item__text {
      font-size: var(--text-xs);
      color: var(--van-text-color);
    }
  }
}

// 筛选区域
.filter-section {
  margin-bottom: 16px;

  .filter-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--text-base);
    font-weight: 600;
  }

  .filter-form {
    .filter-actions {
      margin-top: 12px;
    }
  }
}

// 客户列表
.customer-list-section {
  .list-title {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--text-base);
      font-weight: 600;
    }
  }

  .customer-list {
    margin-top: 12px;

    .customer-item {
      background: var(--van-background-color);
      border-radius: 8px;
      padding: var(--spacing-md);
      margin-bottom: 8px;

      .customer-main {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-md);
        margin-bottom: 8px;

        .customer-info {
          flex: 1;

          .customer-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .customer-name {
              font-size: var(--text-base);
              font-weight: 600;
              color: var(--van-text-color);
            }
          }

          .customer-details {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xs);
            margin-bottom: 8px;

            .detail-item {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: var(--text-sm);
              color: var(--van-text-color-2);
            }
          }

          .customer-footer {
            .follow-info {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: var(--text-xs);
              color: var(--van-text-color-3);
            }
          }
        }
      }

      .customer-actions {
        display: flex;
        gap: var(--spacing-sm);
        justify-content: flex-end;
      }
    }
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: center;
  }
}

// 客户详情弹窗
.customer-detail {
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--van-border-color);

    .van-icon {
      font-size: var(--text-xl);
      color: var(--van-primary-color);
    }

    span {
      font-size: var(--text-base);
      font-weight: 600;
    }
  }

  .detail-content {
    padding: var(--spacing-md);
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-teacher-enrollment {
    max-width: 768px;
    margin: 0 auto;
  }

  .overview-grid {
    grid-template-columns: repeat(4, 1fr) !important;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr) !important;
  }
}
</style>

