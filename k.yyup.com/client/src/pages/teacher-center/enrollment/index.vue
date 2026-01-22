<template>
  <UnifiedCenterLayout
    :title="t('teacher.enrollment.title')"
    :description="t('teacher.enrollment.description')"
    icon="enrollment"
    :show-header="true"
    :show-title="true"
  >
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-button type="primary" @click="handleAddCustomer" class="action-btn">
        <UnifiedIcon name="plus" :size="16" />
        {{ t('teacher.enrollment.addCustomer') }}
      </el-button>
      <el-button @click="refreshData" class="action-btn">
        <UnifiedIcon name="refresh" :size="16" />
        {{ t('teacher.enrollment.refresh') }}
      </el-button>
    </template>

    <!-- 统计卡片区域 - 直接使用 UnifiedCenterLayout 提供的网格容器 -->
    <template #stats>
      <StatCard
        v-if="!loading.stats"
        icon="user"
        :title="t('teacher.enrollment.totalCustomers')"
        :value="customerStats.total"
        :subtitle="t('teacher.enrollment.allCustomers')"
        type="primary"
        :trend="customerStats.total > 0 ? 'up' : 'stable'"
        clickable
        @click="handleStatClick('total')"
      />
      <el-skeleton v-else animated class="stat-card-skeleton">
        <template #template>
          <el-skeleton-item variant="rect" style="width: 100%; height: 120px; border-radius: 12px;" />
        </template>
      </el-skeleton>

      <StatCard
        v-if="!loading.stats"
        icon="user-plus"
        :title="t('teacher.enrollment.newCustomers')"
        :value="customerStats.new"
        :subtitle="t('teacher.enrollment.thisMonth')"
        type="success"
        :trend="customerStats.new > 0 ? 'up' : 'stable'"
        clickable
        @click="handleStatClick('new')"
      />
      <el-skeleton v-else animated class="stat-card-skeleton">
        <template #template>
          <el-skeleton-item variant="rect" style="width: 100%; height: 120px; border-radius: 12px;" />
        </template>
      </el-skeleton>

      <StatCard
        v-if="!loading.stats"
        icon="phone"
        :title="t('teacher.enrollment.contacted')"
        :value="customerStats.contacted"
        :subtitle="t('teacher.enrollment.contactedDesc')"
        type="warning"
        clickable
        @click="handleStatClick('contacted')"
      />
      <el-skeleton v-else animated class="stat-card-skeleton">
        <template #template>
          <el-skeleton-item variant="rect" style="width: 100%; height: 120px; border-radius: 12px;" />
        </template>
      </el-skeleton>

      <StatCard
        v-if="!loading.stats"
        icon="check"
        :title="t('teacher.enrollment.enrolled')"
        :value="customerStats.enrolled"
        :subtitle="t('teacher.enrollment.enrolledDesc')"
        type="danger"
        clickable
        @click="handleStatClick('enrolled')"
      />
      <el-skeleton v-else animated class="stat-card-skeleton">
        <template #template>
          <el-skeleton-item variant="rect" style="width: 100%; height: 120px; border-radius: 12px;" />
        </template>
      </el-skeleton>
    </template>

    <!-- 主要内容区域 -->
    <div class="enrollment-content">
      <!-- 园区招生概况 -->
      <div class="overview-section">
        <el-card class="section-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="card-title-wrapper">
                <UnifiedIcon name="enrollment" :size="20" class="card-icon" />
                <span class="card-title">{{ t('teacher.enrollment.schoolOverview') }}</span>
              </div>
              <el-tag type="success" effect="light" size="small">
                {{ t('teacher.enrollment.monthlyTarget') }}: {{ schoolOverview.monthlyTarget }}{{ t('teacher.enrollment.people') }}
              </el-tag>
            </div>
          </template>

          <div class="overview-grid">
            <div class="overview-item" @click="handleOverviewClick('totalLeads')">
              <div class="overview-value primary">{{ schoolOverview.totalLeads }}</div>
              <div class="overview-label">{{ t('teacher.enrollment.totalLeads') }}</div>
              <div class="overview-trend success">
                <UnifiedIcon name="trending-up" :size="12" />
                +{{ schoolOverview.newLeadsThisMonth }}{{ t('teacher.enrollment.thisMonth') }}
              </div>
            </div>
            <div class="overview-item" @click="handleOverviewClick('progress')">
              <div class="overview-value success">{{ schoolOverview.currentProgress }}%</div>
              <div class="overview-label">{{ t('teacher.enrollment.completionRate') }}</div>
              <div class="overview-trend" :class="schoolOverview.currentProgress >= 80 ? 'success' : 'warning'">
                {{ schoolOverview.enrolledThisMonth }}/{{ schoolOverview.monthlyTarget }}{{ t('teacher.enrollment.people') }}
              </div>
            </div>
            <div class="overview-item" @click="handleOverviewClick('ranking')">
              <div class="overview-value warning">#{{ schoolOverview.teamRanking }}</div>
              <div class="overview-label">{{ t('teacher.enrollment.teamRanking') }}</div>
              <div class="overview-trend info">
                <UnifiedIcon name="user-group" :size="12" />
                {{ t('teacher.enrollment.totalTeachers', { count: schoolOverview.totalTeachers }) }}
              </div>
            </div>
            <div class="overview-item" @click="handleOverviewClick('contribution')">
              <div class="overview-value info">{{ schoolOverview.myContribution }}%</div>
              <div class="overview-label">{{ t('teacher.enrollment.myContribution') }}</div>
              <div class="overview-trend success">
                {{ schoolOverview.myEnrolled }}{{ t('teacher.enrollment.enrolled') }}
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-section">
        <el-card class="filter-card" shadow="hover">
          <div class="filter-content">
            <el-row :gutter="20" align="middle">
              <el-col :xs="24" :sm="12" :md="6">
                <el-form-item :label="t('teacher.enrollment.statusFilter')" label-width="80">
                  <el-select v-model="filterForm.status" :placeholder="t('teacher.enrollment.selectStatus')" clearable class="filter-select">
                    <el-option :label="t('teacher.enrollment.all')" value="" />
                    <el-option :label="t('teacher.enrollment.statusNew')" value="new" />
                    <el-option :label="t('teacher.enrollment.statusContacted')" value="contacted" />
                    <el-option :label="t('teacher.enrollment.statusInterested')" value="interested" />
                    <el-option :label="t('teacher.enrollment.statusEnrolled')" value="enrolled" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <el-form-item :label="t('teacher.enrollment.sourceFilter')" label-width="80">
                  <el-select v-model="filterForm.source" :placeholder="t('teacher.enrollment.selectSource')" clearable class="filter-select">
                    <el-option :label="t('teacher.enrollment.all')" value="" />
                    <el-option :label="t('teacher.enrollment.sourceOnline')" value="online" />
                    <el-option :label="t('teacher.enrollment.sourceReferral')" value="referral" />
                    <el-option :label="t('teacher.enrollment.sourceVisit')" value="visit" />
                    <el-option :label="t('teacher.enrollment.sourcePhone')" value="phone" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <el-form-item :label="t('teacher.enrollment.search')" label-width="60">
                  <el-input
                    v-model="filterForm.keyword"
                    :placeholder="t('teacher.enrollment.searchPlaceholder')"
                    clearable
                    class="filter-input"
                  >
                    <template #prefix>
                      <UnifiedIcon name="search" :size="14" />
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <div class="filter-actions">
                  <el-button type="primary" @click="handleSearch">
                    <UnifiedIcon name="search" :size="14" />
                    {{ t('teacher.enrollment.search') }}
                  </el-button>
                  <el-button @click="handleResetFilter">
                    <UnifiedIcon name="refresh" :size="14" />
                    {{ t('teacher.enrollment.reset') }}
                  </el-button>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </div>

      <!-- 客户表格 -->
      <div class="table-section">
        <el-card class="section-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="card-title-wrapper">
                <UnifiedIcon name="customers" :size="20" class="card-icon" />
                <span class="card-title">{{ t('teacher.enrollment.customerList') }}</span>
              </div>
              <div class="card-actions">
                <el-button
                  :disabled="selectedCustomers.length === 0"
                  @click="handleBatchUpdate"
                  size="small"
                >
                  <UnifiedIcon name="edit" :size="14" />
                  {{ t('teacher.enrollment.batchUpdate') }}
                </el-button>
                <el-button
                  :disabled="selectedCustomers.length === 0"
                  @click="handleBatchDelete"
                  size="small"
                  type="danger"
                >
                  <UnifiedIcon name="close" :size="14" />
                  {{ t('teacher.enrollment.batchDelete') }}
                </el-button>
              </div>
            </div>
          </template>

          <div v-if="loading.list" class="loading-container">
            <el-skeleton :loading="loading.list" animated :rows="5">
              <template #template>
                <div class="skeleton-table">
                  <div v-for="i in 5" :key="i" class="skeleton-row">
                    <el-skeleton-item variant="text" style="width: 5%" />
                    <el-skeleton-item variant="text" style="width: 15%" />
                    <el-skeleton-item variant="text" style="width: 15%" />
                    <el-skeleton-item variant="text" style="width: 10%" />
                    <el-skeleton-item variant="text" style="width: 10%" />
                    <el-skeleton-item variant="text" style="width: 10%" />
                    <el-skeleton-item variant="text" style="width: 10%" />
                    <el-skeleton-item variant="text" style="width: 25%" />
                  </div>
                </div>
              </template>
            </el-skeleton>
          </div>
          <div v-else-if="customerList.length === 0" class="empty-container">
            <UnifiedIcon name="customers" :size="48" class="empty-icon" />
            <p class="empty-text">{{ t('teacher.enrollment.noCustomers') }}</p>
          </div>
          <div v-else class="table-container">
            <el-table
              :data="customerList"
              @selection-change="handleSelectionChange"
              style="width: 100%"
              class="responsive-table"
              row-key="id"
            >
              <el-table-column type="selection" width="50" />
              <el-table-column prop="customerName" :label="t('teacher.enrollment.customerName')" min-width="120">
                <template #default="{ row }">
                  <div class="customer-name">
                    <div class="customer-avatar">
                      <UnifiedIcon name="user" :size="16" />
                    </div>
                    <span>{{ row.customerName }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="phone" :label="t('teacher.enrollment.phone')" min-width="130">
                <template #default="{ row }">
                  <span class="phone-text">{{ row.phone }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="childName" :label="t('teacher.enrollment.childName')" min-width="120" />
              <el-table-column prop="childAge" :label="t('teacher.enrollment.childAge')" min-width="100">
                <template #default="{ row }">
                  <el-tag type="info" size="small" effect="plain">
                    {{ row.childAge }}{{ t('teacher.enrollment.ageUnit') }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="source" :label="t('teacher.enrollment.source')" min-width="110">
                <template #default="{ row }">
                  <el-tag size="small" effect="light">
                    {{ getSourceText(row.source) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" :label="t('teacher.enrollment.status')" min-width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)" size="small" effect="light">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="lastFollowDate" :label="t('teacher.enrollment.lastFollow')" min-width="150">
                <template #default="{ row }">
                  <div class="date-cell">
                    <UnifiedIcon name="clock" :size="12" />
                    {{ formatDate(row.lastFollowDate) || t('teacher.enrollment.notFollowed') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" :label="t('teacher.enrollment.createTime')" min-width="150">
                <template #default="{ row }">
                  <div class="date-cell">
                    <UnifiedIcon name="calendar" :size="12" />
                    {{ formatDate(row.createTime) }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label="t('teacher.enrollment.actions')" width="220" fixed="right">
                <template #default="{ row }">
                  <div class="table-actions">
                    <el-button size="small" @click="handleViewCustomer(row)">
                      <UnifiedIcon name="eye" :size="14" />
                    </el-button>
                    <el-button size="small" type="primary" @click="handleEditCustomer(row)">
                      <UnifiedIcon name="edit" :size="14" />
                    </el-button>
                    <el-button size="small" type="success" @click="handleFollowUp(row)">
                      <UnifiedIcon name="phone" :size="14" />
                    </el-button>
                    <el-button size="small" type="warning" @click="handleUpdateStatus(row)">
                      <UnifiedIcon name="refresh" :size="14" />
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页 -->
          <div class="pagination" v-if="pagination.total > 0">
            <div class="pagination-info">
              {{ t('teacher.enrollment.totalRecords', { total: pagination.total }) }}
            </div>
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
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
      :title="t('teacher.enrollment.customerDetail')"
      width="600px"
      class="customer-dialog"
    >
      <div v-if="currentCustomer" class="customer-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="t('teacher.enrollment.customerName')">
            {{ currentCustomer.customerName }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('teacher.enrollment.phone')">
            {{ currentCustomer.phone }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('teacher.enrollment.childName')">
            {{ currentCustomer.childName }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('teacher.enrollment.childAge')">
            {{ currentCustomer.childAge }}{{ t('teacher.enrollment.ageUnit') }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('teacher.enrollment.source')">
            <el-tag size="small" effect="light">
              {{ getSourceText(currentCustomer.source) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('teacher.enrollment.status')">
            <el-tag :type="getStatusType(currentCustomer.status)" size="small" effect="light">
              {{ getStatusText(currentCustomer.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('teacher.enrollment.createTime')" :span="2">
            {{ formatDate(currentCustomer.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('teacher.enrollment.notes')" :span="2">
            {{ currentCustomer.notes || t('teacher.enrollment.noNotes') }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="customerDetailVisible = false">
          {{ t('teacher.enrollment.close') }}
        </el-button>
        <el-button type="primary" @click="handleEditCustomer(currentCustomer)">
          <UnifiedIcon name="edit" :size="14" />
          {{ t('teacher.enrollment.edit') }}
        </el-button>
      </template>
    </el-dialog>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
// 翻译函数 - 支持插值
const t = (key: string, params?: Record<string, any>) => {
  const translations: Record<string, string> = {
    'teacher.enrollment.title': '招生管理',
    'teacher.enrollment.description': '管理招生客户、跟进记录和招生数据',
    'teacher.enrollment.addCustomer': '添加客户',
    'teacher.enrollment.refresh': '刷新',
    'teacher.enrollment.totalCustomers': '总客户数',
    'teacher.enrollment.allCustomers': '全部客户',
    'teacher.enrollment.newCustomers': '新增客户',
    'teacher.enrollment.thisMonth': '本月',
    'teacher.enrollment.contacted': '已联系',
    'teacher.enrollment.contactedDesc': '已跟进客户',
    'teacher.enrollment.enrolled': '已报名',
    'teacher.enrollment.enrolledDesc': '成功报名',
    'teacher.enrollment.schoolOverview': '园区招生概况',
    'teacher.enrollment.monthlyTarget': '本月目标',
    'teacher.enrollment.people': '人',
    'teacher.enrollment.totalLeads': '总线索',
    'teacher.enrollment.completionRate': '完成率',
    'teacher.enrollment.teamRanking': '团队排名',
    'teacher.enrollment.totalTeachers': '共{count}位教师',
    'teacher.enrollment.myContribution': '我的贡献',
    'teacher.enrollment.enrolled': '已报名',
    'teacher.enrollment.statusFilter': '状态筛选',
    'teacher.enrollment.selectStatus': '选择状态',
    'teacher.enrollment.all': '全部',
    'teacher.enrollment.statusNew': '新客户',
    'teacher.enrollment.statusContacted': '已联系',
    'teacher.enrollment.statusInterested': '有意向',
    'teacher.enrollment.statusEnrolled': '已报名',
    'teacher.enrollment.sourceFilter': '来源筛选',
    'teacher.enrollment.selectSource': '选择来源',
    'teacher.enrollment.sourceOnline': '线上',
    'teacher.enrollment.sourceReferral': '推荐',
    'teacher.enrollment.sourceVisit': '到访',
    'teacher.enrollment.sourcePhone': '电话',
    'teacher.enrollment.search': '搜索',
    'teacher.enrollment.searchPlaceholder': '搜索客户名称或手机号',
    'teacher.enrollment.reset': '重置',
    'teacher.enrollment.customerList': '客户列表',
    'teacher.enrollment.batchUpdate': '批量更新',
    'teacher.enrollment.batchDelete': '批量删除',
    'teacher.enrollment.customerName': '客户姓名',
    'teacher.enrollment.phone': '联系电话',
    'teacher.enrollment.childName': '孩子姓名',
    'teacher.enrollment.childAge': '孩子年龄',
    'teacher.enrollment.ageUnit': '岁',
    'teacher.enrollment.source': '来源',
    'teacher.enrollment.status': '状态',
    'teacher.enrollment.statusUnknown': '未知',
    'teacher.enrollment.lastFollow': '最后跟进',
    'teacher.enrollment.notFollowed': '未跟进',
    'teacher.enrollment.createTime': '创建时间',
    'teacher.enrollment.actions': '操作',
    'teacher.enrollment.totalRecords': '共 {total} 条',
    'teacher.enrollment.customerDetail': '客户详情',
    'teacher.enrollment.notes': '备注',
    'teacher.enrollment.noNotes': '暂无备注',
    'teacher.enrollment.close': '关闭',
    'teacher.enrollment.edit': '编辑',
    'teacher.enrollment.addCustomerDeveloping': '添加客户功能开发中',
    'teacher.enrollment.dataRefreshed': '数据已刷新',
    'teacher.enrollment.followUpPlaceholder': '请输入跟进内容',
    'teacher.enrollment.followUpTitle': '跟进记录',
    'teacher.enrollment.confirm': '确定',
    'teacher.enrollment.cancel': '取消',
    'teacher.enrollment.followUpContentPlaceholder': '请输入本次跟进的具体内容',
    'teacher.enrollment.followUpType': '电话跟进',
    'teacher.enrollment.followUpSuccess': '跟进记录添加成功',
    'teacher.enrollment.followUpFailed': '添加跟进记录失败',
    'teacher.enrollment.updateStatusPlaceholder': '请选择新状态',
    'teacher.enrollment.updateStatusTitle': '更新状态',
    'teacher.enrollment.updateStatusSuccess': '状态更新成功',
    'teacher.enrollment.updateStatusFailed': '更新状态失败',
    'teacher.enrollment.selectCustomersFirst': '请先选择客户',
    'teacher.enrollment.batchUpdateDeveloping': '批量更新功能开发中',
    'teacher.enrollment.batchDeleteConfirm': '确定删除选中的 {count} 个客户吗？',
    'teacher.enrollment.batchDeleteTitle': '批量删除',
    'teacher.enrollment.batchDeleteDeveloping': '批量删除功能开发中',
    'teacher.enrollment.noCustomers': '暂无客户数据',
    'teacher.enrollment.editCustomerDeveloping': '编辑客户功能开发中',
    'teacher.enrollment.loadCustomersFailed': '加载客户列表失败',
    // 概况点击提示
    'teacher.enrollment.overviewTotalLeadsClick': '查看所有线索客户',
    'teacher.enrollment.overviewProgressClick': '查看完成进度详情',
    'teacher.enrollment.overviewRankingClick': '查看团队排名详情',
    'teacher.enrollment.overviewContributionClick': '查看我的贡献详情'
  }
  let result = translations[key] || key
  // 插值处理
  if (params) {
    Object.keys(params).forEach(paramKey => {
      result = result.replace(`{${paramKey}}`, String(params[paramKey]))
    })
  }
  return result
}
import { ElMessage, ElMessageBox } from 'element-plus'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import StatCard from '@/components/common/StatCard.vue'
import { getCustomerList, addFollowRecord, updateCustomerStatus } from '@/api/modules/teacher-customers'

// 加载状态
const loading = reactive({
  stats: false,
  list: false,
  overview: false
})

// 响应式数据
const customerDetailVisible = ref(false)
const currentCustomer = ref<any>(null)
const selectedCustomers = ref<any[]>([])

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
  myEnrolled: 0
})

// 客户统计数据
const customerStats = reactive({
  total: 0,
  new: 0,
  contacted: 0,
  enrolled: 0
})

// 客户列表
const customerList = ref<any[]>([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 筛选表单
const filterForm = reactive({
  status: '',
  source: '',
  keyword: ''
})

// 状态类型映射
const getStatusType = (status: string): string => {
  const map: Record<string, string> = {
    new: 'info',
    contacted: 'warning',
    interested: 'success',
    enrolled: 'danger'
  }
  return map[status] || 'info'
}

// 状态文本映射
const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    new: t('teacher.enrollment.statusNew'),
    contacted: t('teacher.enrollment.statusContacted'),
    interested: t('teacher.enrollment.statusInterested'),
    enrolled: t('teacher.enrollment.statusEnrolled')
  }
  return map[status] || t('teacher.enrollment.statusUnknown')
}

// 来源文本映射
const getSourceText = (source: string): string => {
  const map: Record<string, string> = {
    online: t('teacher.enrollment.sourceOnline'),
    referral: t('teacher.enrollment.sourceReferral'),
    visit: t('teacher.enrollment.sourceVisit'),
    phone: t('teacher.enrollment.sourcePhone')
  }
  return map[source] || source
}

// 日期格式化
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 添加客户
const handleAddCustomer = () => {
  ElMessage.info(t('teacher.enrollment.addCustomerDeveloping'))
}

// 刷新数据
const refreshData = async () => {
  await Promise.all([
    loadSchoolOverview(),
    loadEnrollmentStats(),
    loadCustomerList()
  ])
  ElMessage.success(t('teacher.enrollment.dataRefreshed'))
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadCustomerList()
}

// 重置筛选
const handleResetFilter = () => {
  filterForm.status = ''
  filterForm.source = ''
  filterForm.keyword = ''
  pagination.page = 1
  loadCustomerList()
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedCustomers.value = selection
}

// 统计卡片点击
const handleStatClick = (type: string) => {
  filterForm.status = type === 'total' ? '' : type
  handleSearch()
}

// 概况卡片点击
const handleOverviewClick = (type: string) => {
  ElMessage.info(t(`teacher.enrollment.overview${type.charAt(0).toUpperCase() + type.slice(1)}Click`))
}

// 查看客户
const handleViewCustomer = (customer: any) => {
  currentCustomer.value = customer
  customerDetailVisible.value = true
}

// 编辑客户
const handleEditCustomer = (customer: any) => {
  ElMessage.info(t('teacher.enrollment.editCustomerDeveloping'))
}

// 跟进客户
const handleFollowUp = async (customer: any) => {
  try {
    const { value: content } = await ElMessageBox.prompt(
      t('teacher.enrollment.followUpPlaceholder'),
      t('teacher.enrollment.followUpTitle'),
      {
        confirmButtonText: t('teacher.enrollment.confirm'),
        cancelButtonText: t('teacher.enrollment.cancel'),
        inputType: 'textarea',
        inputPlaceholder: t('teacher.enrollment.followUpContentPlaceholder')
      }
    )

    if (content) {
      await addFollowRecord(customer.id, {
        followType: t('teacher.enrollment.followUpType'),
        content: content
      })
      ElMessage.success(t('teacher.enrollment.followUpSuccess'))
      loadCustomerList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('添加跟进记录失败:', error)
      ElMessage.error(t('teacher.enrollment.followUpFailed'))
    }
  }
}

// 更新状态
const handleUpdateStatus = async (customer: any) => {
  try {
    const { value: status } = await ElMessageBox.prompt(
      t('teacher.enrollment.updateStatusPlaceholder'),
      t('teacher.enrollment.updateStatusTitle'),
      {
        confirmButtonText: t('teacher.enrollment.confirm'),
        cancelButtonText: t('teacher.enrollment.cancel'),
        inputType: 'select',
        inputOptions: [
          { label: t('teacher.enrollment.statusNew'), value: 'new' },
          { label: t('teacher.enrollment.statusContacted'), value: 'contacted' },
          { label: t('teacher.enrollment.statusInterested'), value: 'interested' },
          { label: t('teacher.enrollment.statusEnrolled'), value: 'enrolled' }
        ]
      }
    )

    if (status) {
      await updateCustomerStatus(customer.id, status)
      ElMessage.success(t('teacher.enrollment.updateStatusSuccess'))
      loadCustomerList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('更新客户状态失败:', error)
      ElMessage.error(t('teacher.enrollment.updateStatusFailed'))
    }
  }
}

// 批量更新
const handleBatchUpdate = () => {
  if (selectedCustomers.value.length === 0) {
    ElMessage.warning(t('teacher.enrollment.selectCustomersFirst'))
    return
  }
  ElMessage.info(t('teacher.enrollment.batchUpdateDeveloping'))
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedCustomers.value.length === 0) {
    ElMessage.warning(t('teacher.enrollment.selectCustomersFirst'))
    return
  }

  ElMessageBox.confirm(
    t('teacher.enrollment.batchDeleteConfirm', { count: selectedCustomers.value.length }),
    t('teacher.enrollment.batchDeleteTitle'),
    {
      confirmButtonText: t('teacher.enrollment.confirm'),
      cancelButtonText: t('teacher.enrollment.cancel'),
      type: 'warning'
    }
  ).then(() => {
    ElMessage.info(t('teacher.enrollment.batchDeleteDeveloping'))
  }).catch(() => {})
}

// 页码变化
const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadCustomerList()
}

// 每页数量变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadCustomerList()
}

// 加载园区概况
const loadSchoolOverview = async () => {
  try {
    loading.overview = true
    // 模拟数据 - 实际应该调用 API
    schoolOverview.totalLeads = 1250
    schoolOverview.newLeadsThisMonth = 85
    schoolOverview.monthlyTarget = 120
    schoolOverview.enrolledThisMonth = 96
    schoolOverview.currentProgress = Math.round((96 / 120) * 100)
    schoolOverview.teamRanking = 3
    schoolOverview.totalTeachers = 12
    schoolOverview.myEnrolled = 8
    schoolOverview.myContribution = Math.round((8 / 96) * 100)
  } catch (error) {
    console.error('加载园区概况失败:', error)
  } finally {
    loading.overview = false
  }
}

// 加载统计数据
const loadEnrollmentStats = async () => {
  try {
    loading.stats = true
    // 模拟统计数据
    customerStats.total = customerList.value.length || 25
    customerStats.new = 8
    customerStats.contacted = 12
    customerStats.enrolled = 5
  } catch (error) {
    console.error('加载统计数据失败:', error)
    // 默认值
    Object.assign(customerStats, { total: 0, new: 0, contacted: 0, enrolled: 0 })
  } finally {
    loading.stats = false
  }
}

// 加载客户列表
const loadCustomerList = async () => {
  try {
    loading.list = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: filterForm.status || undefined,
      source: filterForm.source || undefined,
      keyword: filterForm.keyword || undefined
    }

    const response = await getCustomerList(params)
    if (response.success && response.data) {
      const data = response.data
      customerList.value = (data.items || data.list || []).map((item: any, index: number) => ({
        id: item.id || index + 1,
        customerName: item.customerName || item.name || '客户' + (index + 1),
        phone: item.phone || '138****' + String(1000 + index).slice(-4),
        childName: item.childName || item.child_name || '孩子' + (index + 1),
        childAge: item.childAge || item.child_age || Math.floor(Math.random() * 5) + 2,
        source: item.source || 'online',
        status: item.status || 'new',
        lastFollowDate: item.lastFollowDate || item.last_follow_date || null,
        createTime: item.createTime || item.created_at || new Date().toISOString(),
        notes: item.notes || ''
      }))
      pagination.total = data.total || customerList.value.length
    }
  } catch (error) {
    console.error('加载客户列表失败:', error)
    ElMessage.error(t('teacher.enrollment.loadCustomersFailed'))
    // 使用模拟数据
    customerList.value = [
      { id: 1, customerName: '张三', phone: '13812345678', childName: '张小明', childAge: 4, source: 'online', status: 'new', createTime: new Date().toISOString() },
      { id: 2, customerName: '李四', phone: '13987654321', childName: '李小红', childAge: 3, source: 'referral', status: 'contacted', createTime: new Date(Date.now() - 86400000).toISOString() },
      { id: 3, customerName: '王五', phone: '13655556666', childName: '王小华', childAge: 5, source: 'visit', status: 'interested', createTime: new Date(Date.now() - 172800000).toISOString() },
      { id: 4, customerName: '赵六', phone: '13577778888', childName: '赵小芳', childAge: 4, source: 'phone', status: 'enrolled', createTime: new Date(Date.now() - 259200000).toISOString() },
      { id: 5, customerName: '钱七', phone: '13799990000', childName: '钱小明', childAge: 3, source: 'online', status: 'new', createTime: new Date(Date.now() - 345600000).toISOString() }
    ]
    pagination.total = 25
  } finally {
    loading.list = false
  }
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    loadSchoolOverview(),
    loadEnrollmentStats(),
    loadCustomerList()
  ])
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

/* ==================== 内容区域 ==================== */
.enrollment-content {
  padding: var(--spacing-md);
}

/* ==================== 操作按钮 ==================== */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast) ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
}

/* ==================== 统计卡片骨架屏 ==================== */
.stat-card-skeleton {
  border-radius: var(--radius-lg);
  border: var(--border-width-base) solid var(--border-color-light);
  background: var(--el-bg-color);
  transition: all var(--transition-base) ease;

  &:hover {
    box-shadow: var(--shadow-sm);
  }

  .skeleton-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--spacing-lg);
  }
}

/* ==================== 概况区域 ==================== */
.overview-section {
  margin-bottom: var(--spacing-md);
}

/* ==================== 通用卡片样式 ==================== */
.section-card {
  border-radius: var(--radius-lg);
  border: var(--border-width-base) solid var(--border-color-light);
  background: var(--el-bg-color);
  box-shadow: var(--shadow-xs);
  transition: all var(--transition-base) ease;

  &:hover {
    box-shadow: var(--shadow-md);
  }

  :deep(.el-card__header) {
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: var(--border-width-base) solid var(--border-color-lighter);
    background: var(--bg-tertiary);
  }

  :deep(.el-card__body) {
    padding: var(--spacing-md);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .card-title-wrapper {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      .card-icon {
        color: var(--primary-color);
        flex-shrink: 0;
      }

      .card-title {
        font-weight: var(--font-semibold);
        font-size: var(--text-base);
        color: var(--text-primary);
        line-height: var(--leading-normal);
      }
    }

    .card-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }
}

/* ==================== 概况网格 ==================== */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);

  .overview-item {
    text-align: center;
    padding: var(--spacing-md);
    border: var(--border-width-base) solid var(--border-color-light);
    border-radius: var(--radius-md);
    background: var(--el-bg-color);
    cursor: pointer;
    transition: all var(--transition-fast) ease;

    &:hover {
      border-color: var(--primary-color-light-3);
      background: var(--bg-hover);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    .overview-value {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      margin-bottom: var(--spacing-xs);

      &.primary { color: var(--primary-color); }
      &.success { color: var(--success-color); }
      &.warning { color: var(--warning-color); }
      &.info { color: var(--info-color); }
    }

    .overview-label {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin-bottom: var(--spacing-sm);
    }

    .overview-trend {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--text-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-sm);

      &.success {
        color: var(--success-color);
        background: var(--success-color-light-9);
      }

      &.warning {
        color: var(--warning-color);
        background: var(--warning-color-light-9);
      }

      &.info {
        color: var(--info-color);
        background: var(--info-color-light-9);
      }
    }
  }
}

/* ==================== 筛选区域 ==================== */
.filter-section {
  margin-bottom: var(--spacing-md);

  .filter-card {
    border-radius: var(--radius-lg);
    border: var(--border-width-base) solid var(--border-color-light);
    background: var(--el-bg-color);
    transition: all var(--transition-base) ease;

    &:hover {
      box-shadow: var(--shadow-sm);
    }

    :deep(.el-card__body) {
      padding: var(--spacing-md);
    }
  }

  .filter-content {
    :deep(.el-form-item) {
      margin-bottom: 0;
    }

    :deep(.el-form-item__label) {
      font-weight: var(--font-medium);
      color: var(--text-primary);
    }
  }

  .filter-select,
  .filter-input {
    width: 100%;
  }

  .filter-actions {
    display: flex;
    gap: var(--spacing-sm);
    height: 100%;
    align-items: flex-end;
  }
}

/* ==================== 表格区域 ==================== */
.table-section {
  margin-bottom: var(--spacing-md);
}

.table-container {
  min-height: 200px;

  .responsive-table {
    :deep(.el-table) {
      border-radius: var(--radius-md);
      overflow: hidden;

      &::before {
        display: none;
      }

      th.el-table__cell {
        background: var(--bg-tertiary);
        color: var(--text-primary);
        font-weight: var(--font-semibold);
      }

      tr:hover > td.el-table__cell {
        background: var(--bg-hover);
      }
    }
  }

  .customer-name {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    .customer-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary-light-bg);
      color: var(--primary-color);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .phone-text {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }

  .date-cell {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }
}

.table-actions {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: nowrap;
}

.skeleton-table {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);

  .skeleton-row {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-sm) 0;
    border-bottom: var(--border-width-base) solid var(--border-color-lighter);
  }
}

/* ==================== 加载和空状态 ==================== */
.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: var(--spacing-lg);
  gap: var(--spacing-md);
}

.empty-container {
  .empty-icon {
    color: var(--text-disabled);
    opacity: 0.5;
  }

  .empty-text {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-secondary);
    text-align: center;
  }
}

/* ==================== 分页 ==================== */
.pagination {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-lg);
  border-top: var(--border-width-base) solid var(--border-color-lighter);

  .pagination-info {
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  :deep(.el-pagination) {
    --el-pagination-bg-color: transparent;
    --el-pagination-button-bg-color: transparent;
  }
}

/* ==================== 详情弹窗 ==================== */
.customer-dialog {
  :deep(.el-dialog) {
    border-radius: var(--radius-lg);
  }

  :deep(.el-dialog__header) {
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: var(--border-width-base) solid var(--border-color-lighter);
  }

  :deep(.el-dialog__body) {
    padding: var(--spacing-lg);
  }

  :deep(.el-dialog__footer) {
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: var(--border-width-base) solid var(--border-color-lighter);
  }
}

.customer-detail {
  .el-descriptions {
    :deep(.el-descriptions__label) {
      font-weight: var(--font-medium);
      color: var(--text-primary);
    }

    :deep(.el-descriptions__content) {
      color: var(--text-secondary);
    }
  }
}

/* ==================== 响应式设计 ==================== */
@media (max-width: var(--breakpoint-lg)) {
  .enrollment-content {
    padding: var(--spacing-sm);
  }

  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: var(--breakpoint-md)) {
  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }

  .filter-section {
    .filter-content {
      :deep(.el-row) {
        margin: 0 !important;
      }

      :deep(.el-col) {
        padding: var(--spacing-xs) 0 !important;
      }
    }

    .filter-actions {
      width: 100%;

      .el-button {
        flex: 1;
      }
    }
  }

  .table-actions {
    flex-wrap: wrap;
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .overview-item {
    padding: var(--spacing-sm) !important;

    .overview-value {
      font-size: var(--text-xl) !important;
    }
  }
}

/* ==================== 主题切换支持 ==================== */
html[data-theme="dark"],
.theme-dark {
  .section-card {
    border-color: var(--border-color-dark);

    :deep(.el-card__header) {
      background: var(--bg-tertiary-dark);
    }
  }

  .overview-item {
    border-color: var(--border-color-dark);
    background: var(--bg-card-dark);

    &:hover {
      background: var(--bg-hover-dark);
    }
  }

  .filter-card {
    border-color: var(--border-color-dark);
    background: var(--bg-card-dark);
  }

  .customer-name .customer-avatar {
    background: var(--primary-color-dark);
    color: var(--text-on-primary);
  }
}
</style>
