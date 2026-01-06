<template>
  <div class="page-container">
    <page-header title="报名仪表板">
      <template #actions>
        <el-button type="primary" @click="handleExportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
        <el-button type="success" @click="handleRefreshData">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </template>
    </page-header>

    <!-- 数据概览 -->
    <div class="app-card overview-section">
      <div class="app-card-content">
        <h3>报名数据概览</h3>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <div class="stat-card registration">
              <div class="stat-icon">📝</div>
              <div class="stat-content">
                <div class="stat-value">{{ overviewData.totalRegistrations }}</div>
                <div class="stat-label">总报名数</div>
                <div class="stat-change positive">+{{ overviewData.registrationGrowth }}%</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <div class="stat-card pending">
              <div class="stat-icon">⏳</div>
              <div class="stat-content">
                <div class="stat-value">{{ overviewData.pendingRegistrations }}</div>
                <div class="stat-label">待审核</div>
                <div class="stat-change">{{ overviewData.pendingRate }}%</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <div class="stat-card confirmed">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <div class="stat-value">{{ overviewData.confirmedRegistrations }}</div>
                <div class="stat-label">已确认</div>
                <div class="stat-change positive">{{ overviewData.confirmationRate }}%</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <div class="stat-card conversion">
              <div class="stat-icon">🎯</div>
              <div class="stat-content">
                <div class="stat-value">{{ overviewData.conversions }}</div>
                <div class="stat-label">转化成功</div>
                <div class="stat-change positive">{{ overviewData.conversionRate }}%</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="app-card filter-section">
      <div class="app-card-content">
        <el-form :model="filterForm" label-width="100px" class="filter-form">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <el-form-item label="活动选择">
                <el-select 
                  v-model="filterForm.activityId" 
                  placeholder="全部活动" 
                  clearable
                  @change="handleFilterChange"
                >
                  <el-option 
                    v-for="activity in activityList" 
                    :key="activity.id" 
                    :label="activity.title" 
                    :value="activity.id" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <el-form-item label="报名状态">
                <el-select 
                  v-model="filterForm.status" 
                  placeholder="全部状态" 
                  clearable
                  @change="handleFilterChange"
                >
                  <el-option 
                    v-for="status in registrationStatusOptions" 
                    :key="status.value" 
                    :label="status.label" 
                    :value="status.value" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  @change="handleDateRangeChange"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <el-form-item>
                <el-button type="primary" @click="handleSearch">
                  <el-icon><Search /></el-icon>
                  查询
                </el-button>
                <el-button @click="handleReset">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>

    <!-- 报名趋势图表 -->
    <el-row :gutter="24">
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <div class="app-card chart-section">
          <div class="app-card-content">
            <h3>报名趋势</h3>
            <div ref="registrationTrendChartRef" class="chart-container"></div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <div class="app-card chart-section">
          <div class="app-card-content">
            <h3>状态分布</h3>
            <div ref="statusDistributionChartRef" class="chart-container"></div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 热门活动排行 -->
    <div class="app-card ranking-section">
      <div class="app-card-content">
        <h3>热门活动排行</h3>
        <el-table :data="popularActivities" stripe>
          <el-table-column type="index" label="排名" width="80" />
          <el-table-column prop="title" label="活动名称" min-width="200" />
          <el-table-column prop="registrationCount" label="报名人数" width="120" />
          <el-table-column prop="capacity" label="活动容量" width="120" />
          <el-table-column prop="fillRate" label="报名率" width="120">
            <template #default="{ row }">
              <el-progress 
                :percentage="row.fillRate" 
                :color="getProgressColor(row.fillRate)"
                :show-text="false"
              />
              <span class="fill-rate-text">{{ row.fillRate }}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getActivityStatusType(row.status)">
                {{ getActivityStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleViewRegistrations(row)">
                查看报名
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 最新报名记录 -->
    <div class="app-card recent-section">
      <div class="app-card-content">
        <h3>最新报名记录</h3>
        <el-table :data="recentRegistrations" stripe>
          <el-table-column prop="contactName" label="联系人" width="120" />
          <el-table-column prop="contactPhone" label="联系电话" width="140" />
          <el-table-column prop="activityTitle" label="活动名称" min-width="200" />
          <el-table-column prop="childName" label="孩子姓名" width="120" />
          <el-table-column prop="childAge" label="年龄" width="80">
            <template #default="{ row }">
              {{ row.childAge }}岁
            </template>
          </el-table-column>
          <el-table-column prop="registrationTime" label="报名时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.registrationTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getRegistrationStatusType(row.status)">
                {{ getRegistrationStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button 
                v-if="row.status === 0" 
                type="success" 
                size="small" 
                @click="handleApprove(row)"
              >
                审核通过
              </el-button>
              <el-button 
                v-if="row.status === 0" 
                type="danger" 
                size="small" 
                @click="handleReject(row)"
              >
                拒绝
              </el-button>
              <el-button type="primary" size="small" @click="handleViewDetail(row)">
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="app-card actions-section">
      <div class="app-card-content">
        <h3>快速操作</h3>
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <div class="action-card" @click="handleBatchApprove">
              <div class="action-icon">✅</div>
              <div class="action-title">批量审核</div>
              <div class="action-desc">批量处理待审核报名</div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <div class="action-card" @click="handleSendNotification">
              <div class="action-icon">📧</div>
              <div class="action-title">发送通知</div>
              <div class="action-desc">向家长发送活动通知</div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <div class="action-card" @click="handleGenerateReport">
              <div class="action-icon">📊</div>
              <div class="action-title">生成报告</div>
              <div class="action-desc">生成报名统计报告</div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <div class="action-card" @click="handleManageWaitlist">
              <div class="action-icon">📋</div>
              <div class="action-title">候补管理</div>
              <div class="action-desc">管理活动候补名单</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Refresh, Search } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'

// 响应式数据
const loading = ref(false)
const dateRange = ref<[string, string]>(['2024-01-01', '2024-12-31'])

// 图表引用
const registrationTrendChartRef = ref<HTMLDivElement>()
const statusDistributionChartRef = ref<HTMLDivElement>()

// 筛选表单
const filterForm = reactive({
  activityId: undefined,
  status: undefined
})

// 概览数据
const overviewData = reactive({
  totalRegistrations: 1248,
  registrationGrowth: 15.6,
  pendingRegistrations: 89,
  pendingRate: 7.1,
  confirmedRegistrations: 1089,
  confirmationRate: 87.3,
  conversions: 456,
  conversionRate: 36.5
})

// 活动列表
const activityList = ref([
  { id: 1, title: '春季亲子运动会' },
  { id: 2, title: '幼儿园开放日' },
  { id: 3, title: '家长座谈会' },
  { id: 4, title: '艺术展示活动' }
])

// 报名状态选项
const registrationStatusOptions = [
  { label: '待审核', value: 0 },
  { label: '已确认', value: 1 },
  { label: '已拒绝', value: 2 },
  { label: '已取消', value: 3 },
  { label: '已签到', value: 4 },
  { label: '未出席', value: 5 }
]

// 热门活动
const popularActivities = ref([
  { id: 1, title: '春季亲子运动会', registrationCount: 120, capacity: 150, fillRate: 80, status: 1 },
  { id: 2, title: '幼儿园开放日', registrationCount: 98, capacity: 100, fillRate: 98, status: 2 },
  { id: 3, title: '家长座谈会', registrationCount: 76, capacity: 80, fillRate: 95, status: 1 }
])

// 最新报名记录
const recentRegistrations = ref([
  {
    id: 1,
    contactName: '张女士',
    contactPhone: '138****1234',
    activityTitle: '春季亲子运动会',
    childName: '张小明',
    childAge: 5,
    registrationTime: '2024-01-20 14:30:00',
    status: 0
  },
  {
    id: 2,
    contactName: '李先生',
    contactPhone: '139****5678',
    activityTitle: '幼儿园开放日',
    childName: '李小红',
    childAge: 4,
    registrationTime: '2024-01-20 13:45:00',
    status: 1
  }
])

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return 'var(--danger-color)'
  if (percentage >= 70) return 'var(--warning-color)'
  return 'var(--success-color)'
}

// 获取活动状态类型
const getActivityStatusType = (status: number) => {
  const typeMap: Record<number, string> = {
    0: 'info',
    1: 'success',
    2: 'danger',
    3: 'warning',
    4: '',
    5: 'danger'
  }
  return typeMap[status] || ''
}

// 获取活动状态标签
const getActivityStatusLabel = (status: number) => {
  const labelMap: Record<number, string> = {
    0: '计划中',
    1: '报名中',
    2: '已满员',
    3: '进行中',
    4: '已结束',
    5: '已取消'
  }
  return labelMap[status] || '未知'
}

// 获取报名状态类型
const getRegistrationStatusType = (status: number) => {
  const typeMap: Record<number, string> = {
    0: 'warning',
    1: 'success',
    2: 'danger',
    3: 'info',
    4: 'success',
    5: 'danger'
  }
  return typeMap[status] || ''
}

// 获取报名状态标签
const getRegistrationStatusLabel = (status: number) => {
  const option = registrationStatusOptions.find(item => item.value === status)
  return option?.label || '未知'
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

// 初始化图表
const initCharts = async () => {
  await nextTick()
  // TODO: 使用 ECharts 初始化图表
  console.log('初始化图表...')
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // TODO: 调用实际API
    console.log('加载仪表板数据...')
    await initCharts()
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 筛选条件变化
const handleFilterChange = () => {
  loadData()
}

// 日期范围变化
const handleDateRangeChange = () => {
  loadData()
}

// 搜索
const handleSearch = () => {
  loadData()
}

// 重置
const handleReset = () => {
  Object.assign(filterForm, {
    activityId: undefined,
    status: undefined
  })
  dateRange.value = ['2024-01-01', '2024-12-31']
  loadData()
}

// 导出数据
const handleExportData = () => {
  ElMessage.info('导出数据功能开发中...')
}

// 刷新数据
const handleRefreshData = () => {
  ElMessage.success('正在刷新数据...')
  loadData()
}

// 查看报名详情
const handleViewRegistrations = (row: any) => {
  ElMessage.info(`查看"${row.title}"的报名详情`)
}

// 审核通过
const handleApprove = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要审核通过这个报名吗？', '确认审核', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    ElMessage.success('审核通过成功')
    loadData()
  } catch {
    // 用户取消
  }
}

// 拒绝报名
const handleReject = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要拒绝这个报名吗？', '确认拒绝', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    ElMessage.success('拒绝成功')
    loadData()
  } catch {
    // 用户取消
  }
}

// 查看详情
const handleViewDetail = (row: any) => {
  ElMessage.info(`查看报名详情: ${row.contactName}`)
}

// 批量审核
const handleBatchApprove = () => {
  ElMessage.info('批量审核功能开发中...')
}

// 发送通知
const handleSendNotification = () => {
  ElMessage.info('发送通知功能开发中...')
}

// 生成报告
const handleGenerateReport = () => {
  ElMessage.info('生成报告功能开发中...')
}

// 候补管理
const handleManageWaitlist = () => {
  ElMessage.info('候补管理功能开发中...')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.overview-section,
.filter-section,
.chart-section,
.ranking-section,
.recent-section,
.actions-section {
  margin-bottom: var(--text-3xl);
}

.stat-card {
  display: flex;
  align-items: center;
  padding: var(--spacing-lg);
  border-radius: var(--spacing-sm);
  color: white;
  margin-bottom: var(--text-lg);
  position: relative;
  overflow: hidden;
}

.stat-card.registration {
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
}

.stat-card.pending {
  background: var(--gradient-pink);
}

.stat-card.confirmed {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card.conversion {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon {
  font-size: var(--text-4xl);
  margin-right: var(--text-lg);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: bold;
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--text-sm);
  opacity: 0.9;
  margin-bottom: var(--spacing-xs);
}

.stat-change {
  font-size: var(--text-xs);
  opacity: 0.8;
}

.stat-change.positive {
  color: #a8f5a8;
}

.chart-container {
  height: 300px;
  background: var(--bg-hover);
  border-radius: var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

.chart-container::before {
  content: '图表加载中...';
}

.fill-rate-text {
  margin-left: var(--spacing-sm);
  font-size: var(--text-xs);
}

.action-card {
  text-align: center;
  padding: var(--text-2xl);
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--spacing-sm);
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: var(--text-lg);
}

.action-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px var(--text-sm) rgba(64, 158, 255, 0.2);
}

.action-icon {
  font-size: var(--text-4xl);
  margin-bottom: var(--text-sm);
}

.action-title {
  font-size: var(--text-base);
  font-weight: bold;
  margin-bottom: var(--spacing-sm);
}

.action-desc {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}
</style>
