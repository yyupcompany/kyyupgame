<template>
  <MobileSubPageLayout title="招生中心" back-path="/mobile/teacher-center">
    <template #right>
      <van-icon name="add-o" size="20" @click="handleAddCustomer" />
    </template>

    <div class="mobile-enrollment">
      <!-- 园区概况 -->
      <div class="overview-section">
        <div class="section-title">
          <span>园区招生概况</span>
          <van-tag type="success" size="small">本月目标: {{ schoolOverview.monthlyTarget }}人</van-tag>
        </div>
        <div class="overview-grid">
          <div class="overview-item">
            <div class="item-value">{{ schoolOverview.totalLeads }}</div>
            <div class="item-label">园区总客户</div>
            <div class="item-trend success">+{{ schoolOverview.newLeadsThisMonth }}本月新增</div>
          </div>
          <div class="overview-item">
            <div class="item-value">{{ schoolOverview.currentProgress }}%</div>
            <div class="item-label">目标完成度</div>
            <div class="item-trend" :class="schoolOverview.currentProgress >= 80 ? 'success' : 'warning'">
              {{ schoolOverview.enrolledThisMonth }}/{{ schoolOverview.monthlyTarget }}人
            </div>
          </div>
          <div class="overview-item">
            <div class="item-value">#{{ schoolOverview.teamRanking }}</div>
            <div class="item-label">团队排名</div>
            <div class="item-trend info">共{{ schoolOverview.totalTeachers }}位教师</div>
          </div>
          <div class="overview-item">
            <div class="item-value">{{ schoolOverview.myContribution }}%</div>
            <div class="item-label">我的贡献</div>
            <div class="item-trend success">{{ schoolOverview.myEnrolled }}人已录取</div>
          </div>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-row">
        <div class="stat-card" @click="handleStatClick('total')">
          <van-icon name="friends-o" color="var(--primary-color)" size="24" />
          <div class="stat-info">
            <div class="stat-value">{{ customerStats.total }}</div>
            <div class="stat-label">总客户</div>
          </div>
        </div>
        <div class="stat-card" @click="handleStatClick('new')">
          <van-icon name="add-o" color="var(--success-color)" size="24" />
          <div class="stat-info">
            <div class="stat-value">{{ customerStats.new }}</div>
            <div class="stat-label">新增</div>
          </div>
        </div>
        <div class="stat-card" @click="handleStatClick('contacted')">
          <van-icon name="phone-o" color="var(--warning-color)" size="24" />
          <div class="stat-info">
            <div class="stat-value">{{ customerStats.contacted }}</div>
            <div class="stat-label">已联系</div>
          </div>
        </div>
        <div class="stat-card" @click="handleStatClick('enrolled')">
          <van-icon name="success" color="var(--danger-color)" size="24" />
          <div class="stat-info">
            <div class="stat-value">{{ customerStats.enrolled }}</div>
            <div class="stat-label">已报名</div>
          </div>
        </div>
      </div>

      <!-- 搜索和筛选 -->
      <van-search
        v-model="searchKeyword"
        placeholder="搜索客户姓名或电话"
        @search="onSearch"
      />
      <van-dropdown-menu>
        <van-dropdown-item v-model="statusFilter" :options="statusOptions" @change="loadCustomers" />
        <van-dropdown-item v-model="sourceFilter" :options="sourceOptions" @change="loadCustomers" />
      </van-dropdown-menu>

      <!-- 客户列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="loadCustomers"
        >
          <div v-if="customerList.length === 0 && !loading" class="empty-state">
            <van-empty description="暂无客户数据" />
          </div>
          <div v-else class="customer-list">
            <div
              v-for="customer in customerList"
              :key="customer.id"
              class="customer-card"
              @click="handleViewCustomer(customer)"
            >
              <div class="customer-header">
                <div class="customer-name">{{ customer.name }}</div>
                <van-tag :type="getStatusType(customer.status)" size="small">
                  {{ getStatusText(customer.status) }}
                </van-tag>
              </div>
              <div class="customer-info">
                <div class="info-row">
                  <van-icon name="phone-o" />
                  <span>{{ customer.phone }}</span>
                </div>
                <div class="info-row">
                  <van-icon name="friends-o" />
                  <span>{{ customer.childName }} ({{ customer.childAge }}岁)</span>
                </div>
                <div class="info-row">
                  <van-icon name="location-o" />
                  <span>{{ getSourceText(customer.source) }}</span>
                </div>
              </div>
              <div class="customer-footer">
                <span class="last-follow">
                  <van-icon name="clock-o" />
                  {{ customer.lastFollowDate || '未跟进' }}
                </span>
                <div class="action-buttons">
                  <van-button size="mini" type="primary" @click.stop="handleFollowUp(customer)">跟进</van-button>
                  <van-button size="mini" @click.stop="handleUpdateStatus(customer)">状态</van-button>
                </div>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>

      <!-- 客户详情弹窗 -->
      <van-popup v-model:show="detailVisible" position="bottom" round :style="{ height: '70%' }">
        <div class="detail-popup">
          <div class="popup-header">
            <span>客户详情</span>
            <van-icon name="cross" @click="detailVisible = false" />
          </div>
          <div v-if="currentCustomer" class="popup-content">
            <van-cell-group inset>
              <van-cell title="客户姓名" :value="currentCustomer.name" />
              <van-cell title="联系电话" :value="currentCustomer.phone" />
              <van-cell title="孩子姓名" :value="currentCustomer.childName" />
              <van-cell title="孩子年龄" :value="currentCustomer.childAge + '岁'" />
              <van-cell title="客户来源" :value="getSourceText(currentCustomer.source)" />
              <van-cell title="状态">
                <template #value>
                  <van-tag :type="getStatusType(currentCustomer.status)">
                    {{ getStatusText(currentCustomer.status) }}
                  </van-tag>
                </template>
              </van-cell>
              <van-cell title="创建时间" :value="currentCustomer.createTime" />
              <van-cell title="备注" :value="currentCustomer.notes || '无'" />
            </van-cell-group>
            <div class="detail-actions">
              <van-button type="primary" block @click="handleFollowUp(currentCustomer)">添加跟进</van-button>
              <van-button block @click="handleUpdateStatus(currentCustomer)">更新状态</van-button>
            </div>
          </div>
        </div>
      </van-popup>

      <!-- 添加客户弹窗 -->
      <van-popup v-model:show="addVisible" position="bottom" round :style="{ height: '80%' }">
        <div class="add-popup">
          <div class="popup-header">
            <span>添加客户</span>
            <van-icon name="cross" @click="addVisible = false" />
          </div>
          <div class="popup-content">
            <van-form @submit="onSubmitCustomer">
              <van-cell-group inset>
                <van-field
                  v-model="customerForm.name"
                  label="客户姓名"
                  placeholder="请输入客户姓名"
                  required
                  :rules="[{ required: true, message: '请输入客户姓名' }]"
                />
                <van-field
                  v-model="customerForm.phone"
                  label="联系电话"
                  type="tel"
                  placeholder="请输入联系电话"
                  required
                  :rules="[{ required: true, message: '请输入联系电话' }]"
                />
                <van-field
                  v-model="customerForm.childName"
                  label="孩子姓名"
                  placeholder="请输入孩子姓名"
                />
                <van-field
                  v-model="customerForm.childAge"
                  label="孩子年龄"
                  type="digit"
                  placeholder="请输入孩子年龄"
                />
                <van-field
                  v-model="customerForm.sourceName"
                  is-link
                  readonly
                  label="客户来源"
                  placeholder="请选择客户来源"
                  @click="showSourcePicker = true"
                />
                <van-field
                  v-model="customerForm.notes"
                  type="textarea"
                  label="备注"
                  placeholder="其他备注信息"
                  rows="2"
                />
              </van-cell-group>
              <div class="form-actions">
                <van-button block type="primary" native-type="submit">保存客户</van-button>
              </div>
            </van-form>
          </div>
        </div>
      </van-popup>

      <!-- 跟进弹窗 -->
      <van-popup v-model:show="followVisible" position="bottom" round :style="{ height: '50%' }">
        <div class="follow-popup">
          <div class="popup-header">
            <span>添加跟进记录</span>
            <van-icon name="cross" @click="followVisible = false" />
          </div>
          <div class="popup-content">
            <van-form @submit="onSubmitFollow">
              <van-cell-group inset>
                <van-field
                  v-model="followForm.content"
                  type="textarea"
                  label="跟进内容"
                  placeholder="请输入跟进内容"
                  rows="4"
                  required
                  :rules="[{ required: true, message: '请输入跟进内容' }]"
                />
              </van-cell-group>
              <div class="form-actions">
                <van-button block type="primary" native-type="submit">保存跟进</van-button>
              </div>
            </van-form>
          </div>
        </div>
      </van-popup>

      <!-- 来源选择器 -->
      <van-popup v-model:show="showSourcePicker" position="bottom" round>
        <van-picker
          :columns="sourcePickerOptions"
          @confirm="onSourceConfirm"
          @cancel="showSourcePicker = false"
        />
      </van-popup>

      <!-- 状态选择器 -->
      <van-popup v-model:show="showStatusPicker" position="bottom" round>
        <van-picker
          :columns="statusPickerOptions"
          @confirm="onStatusConfirm"
          @cancel="showStatusPicker = false"
        />
      </van-popup>
    </div>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { showToast } from 'vant'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'

// 园区概况
const schoolOverview = reactive({
  totalLeads: 1250,
  newLeadsThisMonth: 85,
  monthlyTarget: 120,
  enrolledThisMonth: 96,
  currentProgress: 80,
  teamRanking: 3,
  totalTeachers: 12,
  myContribution: 8,
  myEnrolled: 8
})

// 客户统计
const customerStats = reactive({
  total: 156,
  new: 23,
  contacted: 68,
  enrolled: 45
})

// 筛选
const searchKeyword = ref('')
const statusFilter = ref('')
const sourceFilter = ref('')
const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '新客户', value: 'NEW' },
  { text: '已联系', value: 'CONTACTED' },
  { text: '意向客户', value: 'INTERESTED' },
  { text: '已报名', value: 'ENROLLED' }
]
const sourceOptions = [
  { text: '全部来源', value: '' },
  { text: '线上推广', value: 'ONLINE' },
  { text: '朋友推荐', value: 'REFERRAL' },
  { text: '实地咨询', value: 'VISIT' },
  { text: '电话咨询', value: 'PHONE' }
]

// 列表状态
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 客户列表
const customerList = ref<any[]>([])

// 弹窗状态
const detailVisible = ref(false)
const addVisible = ref(false)
const followVisible = ref(false)
const showSourcePicker = ref(false)
const showStatusPicker = ref(false)
const currentCustomer = ref<any>(null)

// 表单
const customerForm = reactive({
  name: '',
  phone: '',
  childName: '',
  childAge: '',
  source: '',
  sourceName: '',
  notes: ''
})
const followForm = reactive({
  content: ''
})

const sourcePickerOptions = [
  { text: '线上推广', value: 'ONLINE' },
  { text: '朋友推荐', value: 'REFERRAL' },
  { text: '实地咨询', value: 'VISIT' },
  { text: '电话咨询', value: 'PHONE' },
  { text: '其他', value: 'OTHER' }
]
const statusPickerOptions = [
  { text: '新客户', value: 'NEW' },
  { text: '跟进中', value: 'FOLLOWING' },
  { text: '已转化', value: 'CONVERTED' },
  { text: '已流失', value: 'LOST' }
]

// 模拟数据
const mockCustomers = [
  {
    id: 1,
    name: '张三',
    phone: '13800138001',
    childName: '张小明',
    childAge: 4,
    source: 'ONLINE',
    status: 'NEW',
    lastFollowDate: '',
    createTime: '2025-01-05 10:30',
    notes: ''
  },
  {
    id: 2,
    name: '李四',
    phone: '13800138002',
    childName: '李小花',
    childAge: 3,
    source: 'REFERRAL',
    status: 'CONTACTED',
    lastFollowDate: '2025-01-06',
    createTime: '2025-01-03 14:20',
    notes: '朋友推荐，对英语课程感兴趣'
  },
  {
    id: 3,
    name: '王五',
    phone: '13800138003',
    childName: '王小强',
    childAge: 5,
    source: 'VISIT',
    status: 'INTERESTED',
    lastFollowDate: '2025-01-07',
    createTime: '2025-01-01 09:15',
    notes: '上门咨询，已预约试听'
  },
  {
    id: 4,
    name: '赵六',
    phone: '13800138004',
    childName: '赵小红',
    childAge: 4,
    source: 'PHONE',
    status: 'ENROLLED',
    lastFollowDate: '2025-01-04',
    createTime: '2024-12-25 16:00',
    notes: '已报名中班'
  }
]

// 获取状态样式
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    NEW: 'primary',
    CONTACTED: 'warning',
    INTERESTED: 'success',
    ENROLLED: 'danger',
    FOLLOWING: 'warning',
    CONVERTED: 'success',
    LOST: 'default'
  }
  return map[status] || 'default'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    NEW: '新客户',
    CONTACTED: '已联系',
    INTERESTED: '意向客户',
    ENROLLED: '已报名',
    FOLLOWING: '跟进中',
    CONVERTED: '已转化',
    LOST: '已流失'
  }
  return map[status] || '未知'
}

const getSourceText = (source: string) => {
  const map: Record<string, string> = {
    ONLINE: '线上推广',
    REFERRAL: '朋友推荐',
    VISIT: '实地咨询',
    PHONE: '电话咨询',
    OTHER: '其他'
  }
  return map[source] || '未知'
}

// 加载客户
const loadCustomers = () => {
  loading.value = true
  setTimeout(() => {
    let filtered = [...mockCustomers]
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(keyword) || 
        c.phone.includes(keyword)
      )
    }
    if (statusFilter.value) {
      filtered = filtered.filter(c => c.status === statusFilter.value)
    }
    if (sourceFilter.value) {
      filtered = filtered.filter(c => c.source === sourceFilter.value)
    }
    customerList.value = filtered
    loading.value = false
    finished.value = true
  }, 500)
}

const onSearch = () => {
  loadCustomers()
}

const onRefresh = () => {
  finished.value = false
  loadCustomers()
  refreshing.value = false
  showToast('刷新成功')
}

const handleStatClick = (type: string) => {
  if (type === 'total') {
    statusFilter.value = ''
  } else if (type === 'new') {
    statusFilter.value = 'NEW'
  } else if (type === 'contacted') {
    statusFilter.value = 'CONTACTED'
  } else if (type === 'enrolled') {
    statusFilter.value = 'ENROLLED'
  }
  loadCustomers()
}

const handleViewCustomer = (customer: any) => {
  currentCustomer.value = customer
  detailVisible.value = true
}

const handleAddCustomer = () => {
  customerForm.name = ''
  customerForm.phone = ''
  customerForm.childName = ''
  customerForm.childAge = ''
  customerForm.source = ''
  customerForm.sourceName = ''
  customerForm.notes = ''
  addVisible.value = true
}

const handleFollowUp = (customer: any) => {
  currentCustomer.value = customer
  followForm.content = ''
  followVisible.value = true
  detailVisible.value = false
}

const handleUpdateStatus = (customer: any) => {
  currentCustomer.value = customer
  showStatusPicker.value = true
}

const onSourceConfirm = ({ selectedValues, selectedOptions }: any) => {
  customerForm.source = selectedValues[0]
  customerForm.sourceName = selectedOptions[0]?.text || ''
  showSourcePicker.value = false
}

const onStatusConfirm = ({ selectedOptions }: any) => {
  if (currentCustomer.value) {
    showToast(`状态已更新为: ${selectedOptions[0]?.text}`)
  }
  showStatusPicker.value = false
  detailVisible.value = false
  loadCustomers()
}

const onSubmitCustomer = () => {
  if (!customerForm.name || !customerForm.phone) {
    showToast('请填写必填信息')
    return
  }
  showToast('客户添加成功')
  addVisible.value = false
  loadCustomers()
}

const onSubmitFollow = () => {
  if (!followForm.content) {
    showToast('请输入跟进内容')
    return
  }
  showToast('跟进记录添加成功')
  followVisible.value = false
  loadCustomers()
}

onMounted(() => {
  loadCustomers()
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;
.mobile-enrollment {
  min-height: 100vh;
  background: var(--bg-page);
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
}

.content {
  padding-bottom: var(--spacing-xl);
}

.overview-section {
  background: var(--white);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);

  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    font-size: var(--spacing-lg);
    font-weight: 600;
    color: var(--text-primary);
  }
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);

  .overview-item {
    background: var(--bg-page);
    border-radius: var(--spacing-sm);
    padding: var(--spacing-md);
    text-align: center;

    .item-value {
      font-size: var(--spacing-2xl);
      font-weight: bold;
      color: var(--primary-color);
    }

    .item-label {
      font-size: var(--spacing-lg);
      color: var(--text-secondary);
      margin: 4px 0;
    }

    .item-trend {
      font-size: var(--spacing-md);
      padding: 2px 8px;
      border-radius: var(--spacing-xs);
      display: inline-block;

      &.success {
        color: var(--success-color);
        background: #f6ffed;
      }

      &.warning {
        color: var(--warning-color);
        background: var(--white)be6;
      }

      &.info {
        color: var(--primary-color);
        background: #e6f4ff;
      }
    }
  }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--white);
  margin-bottom: var(--spacing-md);

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 8px;
    background: var(--bg-page);
    border-radius: var(--spacing-sm);

    .stat-info {
      margin-top: var(--spacing-sm);
      text-align: center;

      .stat-value {
        font-size: var(--spacing-xl);
        font-weight: bold;
        color: var(--text-primary);
      }

      .stat-label {
        font-size: var(--spacing-md);
        color: var(--text-tertiary);
        margin-top: var(--spacing-xs);
      }
    }
  }
}

.empty-state {
  padding: 40px 0;
}

.customer-list {
  padding: var(--spacing-md);
}

.customer-card {
  background: var(--white);
  border-radius: var(--spacing-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .customer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);

    .customer-name {
      font-size: var(--spacing-lg);
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .customer-info {
    margin-bottom: var(--spacing-md);

    .info-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--spacing-lg);
      color: var(--text-secondary);
      margin-bottom: var(--spacing-sm);

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .customer-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border-light);

    .last-follow {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--spacing-md);
      color: var(--text-tertiary);
    }

    .action-buttons {
      display: flex;
      gap: var(--spacing-sm);
    }
  }
}

.detail-popup, .add-popup, .follow-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
  font-size: var(--spacing-lg);
  font-weight: 600;
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: var(--spacing-xl);
}

.detail-actions, .form-actions {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* ==================== 暗色模式支持 ==================== */
@media (prefers-color-scheme: dark) {
  :root {
    /* 设计令牌会自动适配暗色模式 */
  }
}
</style>
