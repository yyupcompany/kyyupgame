<template>
  <MobileMainLayout
    title="客户跟踪"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <div class="mobile-customer-tracking">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">客户跟踪</h1>
          <p class="page-subtitle">管理我的客户跟进记录</p>
        </div>
        <div class="header-actions">
          <van-button
            type="primary"
            size="small"
            icon="plus"
            @click="showAddCustomerDialog = true"
          >
            新增客户
          </van-button>
          <van-button
            size="small"
            icon="replay"
            @click="refreshData"
            :loading="loading"
          >
            刷新
          </van-button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-section">
        <van-row :gutter="12">
          <van-col span="12">
            <div class="stat-card">
              <div class="stat-icon" style="background: var(--primary-color)20; color: var(--primary-color);">
                <van-icon name="friends" />
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.totalCustomers }}</div>
                <div class="stat-title">我的客户</div>
                <div class="stat-desc">总客户数</div>
              </div>
            </div>
          </van-col>
          <van-col span="12">
            <div class="stat-card">
              <div class="stat-icon" style="background: var(--success-color)20; color: var(--success-color);">
                <van-icon name="chat" />
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.todayFollows }}</div>
                <div class="stat-title">今日跟进</div>
                <div class="stat-desc">已跟进</div>
              </div>
            </div>
          </van-col>
          <van-col span="12">
            <div class="stat-card">
              <div class="stat-icon" style="background: var(--warning-color)20; color: var(--warning-color);">
                <van-icon name="clock" />
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.pendingFollows }}</div>
                <div class="stat-title">待跟进</div>
                <div class="stat-desc">需要跟进</div>
              </div>
            </div>
          </van-col>
          <van-col span="12">
            <div class="stat-card">
              <div class="stat-icon" style="background: var(--danger-color)20; color: var(--danger-color);">
                <van-icon name="success" />
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.successRate }}%</div>
                <div class="stat-title">成功率</div>
                <div class="stat-desc">转化成功率</div>
              </div>
            </div>
          </van-col>
        </van-row>
      </div>

      <!-- 标签页 -->
      <van-tabs v-model:active="activeTab" class="main-tabs" animated>
        <van-tab title="客户列表" name="customers">
          <!-- 搜索和筛选 -->
          <div class="filter-section">
            <van-search
              v-model="searchKeyword"
              placeholder="搜索客户姓名或电话"
              @search="handleSearch"
              @clear="handleSearch"
            />
            <van-dropdown-menu class="filter-dropdown">
              <van-dropdown-item
                v-model="filterStatus"
                :options="statusOptions"
                @change="handleFilterChange"
                title="状态筛选"
              />
            </van-dropdown-menu>
          </div>

          <!-- 客户卡片列表 -->
          <div class="customer-list" v-loading="loading">
            <div
              v-for="customer in filteredCustomers"
              :key="customer.id"
              class="customer-card"
              @click="viewCustomer(customer)"
            >
              <div class="customer-header">
                <div class="customer-info">
                  <div class="customer-name">{{ customer.customerName }}</div>
                  <van-tag :type="getStatusType(customer.status)" size="small">
                    {{ getStatusText(customer.status) }}
                  </van-tag>
                </div>
                <div class="customer-phone">{{ customer.phone }}</div>
              </div>

              <div class="customer-details">
                <div class="detail-item">
                  <span class="label">孩子：</span>
                  <span>{{ customer.childName }} ({{ customer.childAge }}岁)</span>
                </div>
                <div class="detail-item">
                  <span class="label">来源：</span>
                  <span>{{ getSourceText(customer.source) }}</span>
                </div>
              </div>

              <div class="customer-timeline">
                <div class="timeline-item">
                  <span class="timeline-label">最后跟进：</span>
                  <span class="timeline-value">{{ formatTime(customer.lastFollowDate) }}</span>
                </div>
                <div class="timeline-item" v-if="customer.nextFollowDate">
                  <span class="timeline-label">下次跟进：</span>
                  <span class="timeline-value" :class="{ 'overdue': isOverdue(customer.nextFollowDate) }">
                    {{ formatTime(customer.nextFollowDate) }}
                  </span>
                </div>
              </div>

              <div class="customer-actions">
                <van-button
                  size="mini"
                  type="primary"
                  @click.stop="addFollow(customer)"
                >
                  跟进
                </van-button>
                <van-button
                  size="mini"
                  @click.stop="viewHistory(customer)"
                >
                  记录
                </van-button>
                <van-button
                  size="mini"
                  type="warning"
                  @click.stop="viewSOP(customer)"
                >
                  SOP
                </van-button>
              </div>
            </div>

            <!-- 空状态 -->
            <van-empty
              v-if="!loading && filteredCustomers.length === 0"
              description="暂无客户数据"
              image="search"
            />

            <!-- 加载更多 -->
            <div v-if="hasMore && !loading" class="load-more">
              <van-button type="default" size="small" @click="loadMore">
                加载更多
              </van-button>
            </div>
          </div>
        </van-tab>

        <van-tab title="跟进记录" name="records">
          <div class="follow-records">
            <div v-if="!selectedCustomerId" class="no-customer-selected">
              <van-empty description="请先选择一个客户查看跟进记录" />
              <van-button
                type="primary"
                @click="activeTab = 'customers'"
                style="margin-top: 16px;"
              >
                选择客户
              </van-button>
            </div>

            <div v-else>
              <div class="selected-customer">
                <van-cell :title="selectedCustomerName" :border="false" />
              </div>

              <div class="add-record-btn">
                <van-button
                  type="primary"
                  icon="plus"
                  block
                  @click="showAddRecordDialog = true"
                >
                  添加跟进记录
                </van-button>
              </div>

              <div class="records-list" v-loading="recordsLoading">
                <van-steps :active="followRecords.length - 1" direction="vertical" :active-icon="'van-icon van-icon'" :inactive-icon="'van-icon van-icon'">
                  <van-step
                    v-for="record in followRecords"
                    :key="record.id"
                  >
                    <template #default>
                      <div class="timeline-item">
                        <div class="timeline-time">{{ formatTime(record.followDate) }}</div>
                        <div class="record-content">
                          <div class="record-header">
                            <span class="record-type">{{ record.followType }}</span>
                            <span class="record-teacher">{{ record.teacherName }}</span>
                          </div>
                          <div class="record-text">{{ record.content }}</div>
                          <div v-if="record.nextFollowDate" class="next-follow">
                            下次跟进：{{ formatTime(record.nextFollowDate) }}
                          </div>
                        </div>
                      </div>
                    </template>
                  </van-step>
                </van-steps>

                <van-empty
                  v-if="!recordsLoading && followRecords.length === 0"
                  description="暂无跟进记录"
                />
              </div>
            </div>
          </div>
        </van-tab>

        <van-tab title="转化分析" name="funnel">
          <div class="conversion-funnel" v-loading="funnelLoading">
            <!-- 时间选择器 -->
            <div class="time-selector">
              <van-radio-group v-model="timeRange" direction="horizontal" @change="handleTimeRangeChange">
                <van-radio name="week">本周</van-radio>
                <van-radio name="month">本月</van-radio>
                <van-radio name="quarter">本季度</van-radio>
                <van-radio name="year">本年</van-radio>
              </van-radio-group>
            </div>

            <!-- 转化卡片列表 -->
            <div class="conversion-stages">
              <div
                v-for="(stage, index) in conversionData"
                :key="stage.stage"
                class="conversion-stage"
                :style="{ opacity: 1 - (index * 0.15) }"
              >
                <div class="stage-header">
                  <div class="stage-name">{{ stage.stage }}</div>
                  <div class="stage-stats">
                    <span class="stage-count">{{ stage.count }}人</span>
                    <span class="stage-rate" :class="getRateClass(stage.rate)">{{ stage.rate }}%</span>
                  </div>
                </div>
                <div class="stage-progress">
                  <van-progress
                    :percentage="stage.rate"
                    :stroke-width="8"
                    color="#409eff"
                    track-color="#f5f5f5"
                  />
                </div>
                <div class="stage-desc">{{ stage.description }}</div>
              </div>
            </div>

            <!-- 改进建议 -->
            <div class="improvement-suggestions" v-if="suggestions.length > 0">
              <div class="suggestions-title">改进建议</div>
              <van-notice-bar
                v-for="suggestion in suggestions"
                :key="suggestion.id"
                :text="suggestion.title"
                :color="getSuggestionColor(suggestion.type)"
                background="white"
                wrapable
                style="margin-bottom: 8px;"
              />
            </div>
          </div>
        </van-tab>
      </van-tabs>

      <!-- 新增客户弹窗 -->
      <van-popup
        v-model:show="showAddCustomerDialog"
        position="bottom"
        :style="{ height: '80%' }"
        round
      >
        <div class="add-customer-dialog">
          <div class="dialog-header">
            <div class="dialog-title">新增客户</div>
            <van-icon name="cross" @click="showAddCustomerDialog = false" />
          </div>

          <van-form @submit="submitCustomer" ref="customerFormRef">
            <van-field
              v-model="customerForm.name"
              label="客户姓名"
              placeholder="请输入客户姓名"
              :rules="[{ required: true, message: '请输入客户姓名' }]"
            />
            <van-field
              v-model="customerForm.phone"
              label="联系电话"
              placeholder="请输入联系电话"
              :rules="[{ required: true, message: '请输入联系电话' }]"
            />
            <van-field
              v-model="customerForm.childName"
              label="孩子姓名"
              placeholder="请输入孩子姓名"
              :rules="[{ required: true, message: '请输入孩子姓名' }]"
            />
            <van-field
              v-model="customerForm.childAge"
              label="孩子年龄"
              type="number"
              placeholder="请输入孩子年龄"
              :rules="[{ required: true, message: '请输入孩子年龄' }]"
            />
            <van-field
              v-model="customerForm.source"
              label="客户来源"
              placeholder="选择客户来源"
              readonly
              is-link
              @click="showSourcePicker = true"
              :rules="[{ required: true, message: '请选择客户来源' }]"
            />
            <van-field
              v-model="customerForm.remark"
              label="备注"
              type="textarea"
              placeholder="其他备注信息"
              :rows="3"
            />

            <div class="dialog-actions">
              <van-button block type="primary" native-type="submit" :loading="submitting">
                确定
              </van-button>
            </div>
          </van-form>
        </div>
      </van-popup>

      <!-- 客户来源选择器 -->
      <van-popup v-model:show="showSourcePicker" position="bottom" round>
        <van-picker
          :columns="sourceColumns"
          @confirm="onSourceConfirm"
          @cancel="showSourcePicker = false"
        />
      </van-popup>

      <!-- 添加跟进记录弹窗 -->
      <van-popup
        v-model:show="showAddRecordDialog"
        position="bottom"
        :style="{ height: '60%' }"
        round
      >
        <div class="add-record-dialog">
          <div class="dialog-header">
            <div class="dialog-title">添加跟进记录</div>
            <van-icon name="cross" @click="showAddRecordDialog = false" />
          </div>

          <van-form @submit="submitRecord">
            <van-field
              v-model="recordForm.followType"
              label="跟进类型"
              placeholder="请输入跟进类型"
              :rules="[{ required: true, message: '请输入跟进类型' }]"
            />
            <van-field
              v-model="recordForm.content"
              label="跟进内容"
              type="textarea"
              placeholder="请输入跟进内容"
              :rows="4"
              :rules="[{ required: true, message: '请输入跟进内容' }]"
            />
            <van-field
              v-model="recordForm.nextFollowDate"
              label="下次跟进时间"
              placeholder="选择下次跟进时间"
              readonly
              is-link
              @click="showDatePicker = true"
            />

            <div class="dialog-actions">
              <van-button block type="primary" native-type="submit" :loading="recordSubmitting">
                确定
              </van-button>
            </div>
          </van-form>
        </div>
      </van-popup>

      <!-- 日期选择器 -->
      <van-popup v-model:show="showDatePicker" position="bottom" round>
        <van-date-picker
          v-model="selectedDate"
          type="datetime"
          title="选择下次跟进时间"
          @confirm="onDateConfirm"
          @cancel="showDatePicker = false"
        />
      </van-popup>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'

// 导入API
import {
  getCustomerTrackingStats,
  getCustomerList,
  getFollowRecords,
  addFollowRecord,
  updateCustomerStatus,
  getConversionFunnel,
  type Customer,
  type FollowRecord,
  CustomerStatus,
  CustomerSource
} from '@/api/modules/teacher-customers'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const recordsLoading = ref(false)
const funnelLoading = ref(false)
const submitting = ref(false)
const recordSubmitting = ref(false)
const showAddCustomerDialog = ref(false)
const showAddRecordDialog = ref(false)
const showSourcePicker = ref(false)
const showDatePicker = ref(false)
const selectedDate = ref(new Date())
const activeTab = ref('customers')
const selectedCustomerId = ref('')
const selectedCustomerName = ref('')
const searchKeyword = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)
const total = ref(0)
const timeRange = ref('month')

// 统计数据
const stats = reactive({
  totalCustomers: 0,
  todayFollows: 0,
  pendingFollows: 0,
  successRate: 0
})

// 客户列表
const customers = ref<Customer[]>([])
const followRecords = ref<FollowRecord[]>([])
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

// 跟进记录表单
const recordForm = reactive({
  followType: '',
  content: '',
  nextFollowDate: ''
})

// 状态选项
const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '新客户', value: 'NEW' },
  { text: '跟进中', value: 'FOLLOWING' },
  { text: '已转化', value: 'CONVERTED' },
  { text: '已流失', value: 'LOST' }
]

// 来源选项
const sourceColumns = [
  { text: '网络咨询', value: 'ONLINE' },
  { text: '朋友推荐', value: 'REFERRAL' },
  { text: '到园参观', value: 'VISIT' },
  { text: '电话咨询', value: 'PHONE' },
  { text: '其他', value: 'OTHER' }
]

// 计算属性
const filteredCustomers = computed(() => {
  let result = customers.value

  if (filterStatus.value) {
    result = result.filter(customer => customer.status === filterStatus.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(customer =>
      customer.customerName.toLowerCase().includes(keyword) ||
      customer.phone.includes(keyword)
    )
  }

  return result
})

const conversionData = computed(() => {
  if (funnelData.value && funnelData.value.stages.length > 0) {
    return funnelData.value.stages.map((stage: any) => ({
      stage: stage.stage,
      count: stage.count,
      rate: stage.percentage,
      description: getStageDescription(stage.stage)
    }))
  }

  // 默认模拟数据
  return [
    { stage: '潜在客户', count: 150, rate: 100, description: '通过各种渠道获得的潜在客户' },
    { stage: '已联系', count: 120, rate: 80, description: '成功建立初次联系的客户' },
    { stage: '有意向', count: 90, rate: 75, description: '进行深度需求沟通的客户' },
    { stage: '跟进中', count: 60, rate: 67, description: '明确表达入园意向的客户' },
    { stage: '已转化', count: 30, rate: 50, description: '最终签约入园的客户' }
  ]
})

const suggestions = ref([
  {
    id: '1',
    title: '提高初次接触转化率',
    type: 'warning'
  },
  {
    id: '2',
    title: '加强试听体验环节',
    type: 'success'
  },
  {
    id: '3',
    title: '优化签约流程',
    type: 'info'
  }
])

// 方法
const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadCustomers(),
      loadStats(),
      loadFunnelData()
    ])
    showToast('数据刷新成功')
  } catch (error) {
    showToast('数据刷新失败')
  } finally {
    loading.value = false
  }
}

const loadCustomers = async (reset = true) => {
  try {
    if (reset) {
      currentPage.value = 1
      hasMore.value = true
    }

    const response = await getCustomerList({
      page: currentPage.value,
      pageSize: pageSize.value
    })

    if (response.data) {
      const newCustomers = response.data.items || response.data.list || []

      if (reset) {
        customers.value = newCustomers
      } else {
        customers.value.push(...newCustomers)
      }

      total.value = response.data.total || 0
      hasMore.value = customers.value.length < total.value
    }
  } catch (error) {
    console.error('加载客户数据失败:', error)
    showToast('加载客户数据失败')
    if (reset) {
      customers.value = []
    }
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
    Object.assign(stats, {
      totalCustomers: 0,
      todayFollows: 0,
      pendingFollows: 0,
      successRate: 0
    })
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
    showToast('加载跟进记录失败')
    followRecords.value = []
  } finally {
    recordsLoading.value = false
  }
}

const loadMore = () => {
  currentPage.value++
  loadCustomers(false)
}

const handleSearch = () => {
  // 搜索时重新加载
  loadCustomers()
}

const handleFilterChange = () => {
  loadCustomers()
}

const handleTimeRangeChange = () => {
  loadFunnelData()
}

const viewCustomer = (customer: Customer) => {
  router.push(`/mobile/teacher-center/customer-detail/${customer.id}`)
}

const addFollow = (customer: Customer) => {
  selectedCustomerId.value = customer.id
  selectedCustomerName.value = customer.customerName
  activeTab.value = 'records'
  loadFollowRecords()
  showAddRecordDialog.value = true
}

const viewHistory = (customer: Customer) => {
  selectedCustomerId.value = customer.id
  selectedCustomerName.value = customer.customerName
  activeTab.value = 'records'
  loadFollowRecords()
}

const viewSOP = (customer: Customer) => {
  router.push(`/mobile/teacher-center/customer-sop/${customer.id}`)
}

const submitCustomer = async () => {
  try {
    submitting.value = true

    // TODO: 调用新增客户API
    await new Promise(resolve => setTimeout(resolve, 1000))

    showToast('客户添加成功')
    showAddCustomerDialog.value = false
    resetCustomerForm()
    await refreshData()
  } catch (error) {
    showToast('添加客户失败')
  } finally {
    submitting.value = false
  }
}

const submitRecord = async () => {
  try {
    recordSubmitting.value = true

    await addFollowRecord(selectedCustomerId.value, {
      followType: recordForm.followType,
      content: recordForm.content,
      nextFollowDate: recordForm.nextFollowDate
    })

    showToast('跟进记录添加成功')
    showAddRecordDialog.value = false
    resetRecordForm()
    await loadFollowRecords()
    await loadStats()
  } catch (error) {
    showToast('添加跟进记录失败')
  } finally {
    recordSubmitting.value = false
  }
}

const onSourceConfirm = (option: any, index: number) => {
  customerForm.source = option.value
  showSourcePicker.value = false
}

const onDateConfirm = () => {
  recordForm.nextFollowDate = selectedDate.value.toISOString()
  showDatePicker.value = false
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
}

const resetRecordForm = () => {
  Object.assign(recordForm, {
    followType: '',
    content: '',
    nextFollowDate: ''
  })
}

// 辅助方法
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    [CustomerStatus.NEW]: 'info',
    [CustomerStatus.FOLLOWING]: 'warning',
    [CustomerStatus.CONVERTED]: 'success',
    [CustomerStatus.LOST]: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    [CustomerStatus.NEW]: '新客户',
    [CustomerStatus.FOLLOWING]: '跟进中',
    [CustomerStatus.CONVERTED]: '已转化',
    [CustomerStatus.LOST]: '已流失'
  }
  return texts[status] || status
}

const getSourceText = (source: string) => {
  const texts: Record<string, string> = {
    [CustomerSource.ONLINE]: '网络咨询',
    [CustomerSource.REFERRAL]: '朋友推荐',
    [CustomerSource.VISIT]: '到园参观',
    [CustomerSource.PHONE]: '电话咨询',
    [CustomerSource.OTHER]: '其他'
  }
  return texts[source] || source
}

const getRateClass = (rate: number) => {
  if (rate >= 80) return 'rate-high'
  if (rate >= 60) return 'rate-medium'
  return 'rate-low'
}

const getStageDescription = (stage: string) => {
  const descriptions: Record<string, string> = {
    '潜在客户': '通过各种渠道获得的潜在客户',
    '已联系': '成功建立初次联系的客户',
    '有意向': '进行深度需求沟通的客户',
    '跟进中': '明确表达入园意向的客户',
    '已转化': '最终签约入园的客户'
  }
  return descriptions[stage] || '客户转化阶段'
}

const getSuggestionColor = (type: string) => {
  const colors: Record<string, string> = {
    success: '#67c23a',
    warning: '#e6a23c',
    info: '#409eff',
    error: '#f56c6c'
  }
  return colors[type] || '#409eff'
}

const isOverdue = (time: string) => {
  if (!time) return false
  return new Date(time) < new Date()
}

const formatTime = (time: string) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  showLoadingToast({ message: '加载中...', forbidClick: true })
  refreshData().finally(() => {
    closeToast()
  })
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.mobile-customer-tracking {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: var(--van-tabbar-height);
}

// 页面头部
.page-header {
  background: var(--card-bg);
  padding: var(--spacing-md);
  margin-bottom: 12px;

  .header-content {
    margin-bottom: 12px;

    .page-title {
      font-size: var(--text-xl);
      font-weight: 600;
      color: #323233;
      margin: 0 0 4px 0;
    }

    .page-subtitle {
      font-size: var(--text-sm);
      color: #969799;
      margin: 0;
    }
  }

  .header-actions {
    display: flex;
    gap: var(--spacing-sm);
  }
}

// 统计卡片
.stats-section {
  padding: 0 16px;
  margin-bottom: 12px;
}

.stat-card {
  background: var(--card-bg);
  border-radius: 8px;
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-xl);
  }

  .stat-content {
    flex: 1;

    .stat-number {
      font-size: var(--text-2xl);
      font-weight: 700;
      color: #323233;
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-title {
      font-size: var(--text-sm);
      color: #323233;
      font-weight: 500;
      margin-bottom: 2px;
    }

    .stat-desc {
      font-size: var(--text-xs);
      color: #969799;
    }
  }
}

// 标签页
.main-tabs {
  background: var(--card-bg);

  :deep(.van-tabs__content) {
    padding: 0;
  }

  :deep(.van-tabs__nav) {
    background: var(--card-bg);
  }
}

// 筛选区域
.filter-section {
  background: var(--card-bg);
  padding: var(--spacing-md);
  margin-bottom: 12px;

  .filter-dropdown {
    margin-top: 8px;
  }
}

// 客户列表
.customer-list {
  padding: 0 16px;
}

.customer-card {
  background: var(--card-bg);
  border-radius: 8px;
  padding: var(--spacing-md);
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .customer-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;

    .customer-info {
      flex: 1;

      .customer-name {
        font-size: var(--text-base);
        font-weight: 600;
        color: #323233;
        margin-bottom: 4px;
      }
    }

    .customer-phone {
      font-size: var(--text-sm);
      color: #646566;
    }
  }

  .customer-details {
    margin-bottom: 12px;

    .detail-item {
      font-size: var(--text-sm);
      color: #646566;
      margin-bottom: 4px;

      .label {
        color: #969799;
      }
    }
  }

  .customer-timeline {
    margin-bottom: 12px;

    .timeline-item {
      font-size: var(--text-xs);
      color: #969799;
      margin-bottom: 4px;

      .timeline-label {
        color: #969799;
      }

      .timeline-value {
        color: #646566;

        &.overdue {
          color: #ee0a24;
          font-weight: 500;
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

.load-more {
  text-align: center;
  padding: var(--spacing-md);
}

// 跟进记录
.follow-records {
  .no-customer-selected {
    padding: 40px 16px;
    text-align: center;
  }

  .selected-customer {
    background: var(--card-bg);
    margin-bottom: 12px;
  }

  .add-record-btn {
    padding: 0 16px;
    margin-bottom: 12px;
  }

  .records-list {
    padding: 0 16px;

    .record-content {
      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .record-type {
          font-size: var(--text-sm);
          font-weight: 500;
          color: #323233;
        }

        .record-teacher {
          font-size: var(--text-xs);
          color: #969799;
        }
      }

      .record-text {
        font-size: var(--text-sm);
        color: #646566;
        line-height: 1.5;
        margin-bottom: 8px;
      }

      .next-follow {
        font-size: var(--text-xs);
        color: var(--primary-color);
      }
    }
  }

  .timeline-item {
    .timeline-time {
      font-size: var(--text-xs);
      color: #969799;
      margin-bottom: 8px;
    }
  }

  .van-steps {
    padding: var(--spacing-md) 0;

    .van-step {
      .van-step__line {
        background-color: #e5e5e5;
      }

      .van-step__circle {
        background-color: var(--primary-color);
      }
    }
  }
}

// 转化分析
.conversion-funnel {
  padding: var(--spacing-md);

  .time-selector {
    background: var(--card-bg);
    border-radius: 8px;
    padding: var(--spacing-md);
    margin-bottom: 12px;
    text-align: center;
  }

  .conversion-stages {
    margin-bottom: 20px;
  }

  .conversion-stage {
    background: var(--card-bg);
    border-radius: 8px;
    padding: var(--spacing-md);
    margin-bottom: 12px;

    .stage-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .stage-name {
        font-size: var(--text-base);
        font-weight: 600;
        color: #323233;
      }

      .stage-stats {
        text-align: right;

        .stage-count {
          display: block;
          font-size: var(--text-lg);
          font-weight: 700;
          color: #323233;
        }

        .stage-rate {
          font-size: var(--text-sm);
          font-weight: 500;

          &.rate-high {
            color: var(--success-color);
          }

          &.rate-medium {
            color: var(--warning-color);
          }

          &.rate-low {
            color: var(--danger-color);
          }
        }
      }
    }

    .stage-progress {
      margin-bottom: 8px;
    }

    .stage-desc {
      font-size: var(--text-xs);
      color: #969799;
      line-height: 1.4;
    }
  }

  .improvement-suggestions {
    .suggestions-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: #323233;
      margin-bottom: 12px;
      padding: 0 4px;
    }
  }
}

// 弹窗样式
.add-customer-dialog,
.add-record-dialog {
  padding: var(--spacing-lg);
  height: 100%;
  overflow-y: auto;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .dialog-title {
      font-size: var(--text-lg);
      font-weight: 600;
      color: #323233;
    }

    .van-icon {
      font-size: var(--text-xl);
      color: #969799;
    }
  }

  .dialog-actions {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #ebedf0;
  }
}

:deep(.van-progress__portion) {
  background: linear-gradient(to right, #409eff, #66b1ff);
}
</style>