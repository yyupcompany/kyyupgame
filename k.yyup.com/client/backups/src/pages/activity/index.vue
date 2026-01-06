<template>
  <CenterContainer
    title="活动管理"
    :show-header="true"
    :show-actions="true"
    @create="handleCreateActivity"
  >
    <template #header-actions>
      <el-button type="primary" @click="handleCreateActivity">
        <el-icon><Plus /></el-icon>
        创建活动
      </el-button>
      <el-button type="success" @click="handleExportActivities">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
      <el-button type="danger" :disabled="selectedActivities.length === 0" @click="handleBatchDelete">
        批量删除
      </el-button>
    </template>

    <template #content>

    <!-- 搜索区域 -->
    <div class="app-card search-section">
      <div class="app-card-content">
        <el-form :model="queryForm" label-width="80px" class="search-form">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <el-form-item label="活动标题">
                <el-input 
                  v-model="queryForm.title" 
                  placeholder="请输入活动标题" 
                  clearable 
                  class="search-input"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <el-form-item label="活动类型">
                <el-select 
                  v-model="queryForm.activityType" 
                  placeholder="全部类型" 
                  clearable
                  class="search-select"
                >
                  <el-option 
                    v-for="type in activityTypeOptions" 
                    :key="type.value" 
                    :label="type.label" 
                    :value="type.value" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <el-form-item label="活动状态">
                <el-select 
                  v-model="queryForm.status" 
                  placeholder="全部状态" 
                  clearable
                  class="search-select"
                >
                  <el-option 
                    v-for="status in activityStatusOptions" 
                    :key="status.value" 
                    :label="status.label" 
                    :value="status.value" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <el-form-item label="活动时间">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  clearable
                  class="search-date-picker"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item class="search-actions">
                <div class="action-buttons">
                  <el-button type="primary" @click="handleSearch" class="search-btn">
                    <el-icon><Search /></el-icon>
                    查询
                  </el-button>
                  <el-button @click="handleReset" class="reset-btn">
                    <el-icon><Refresh /></el-icon>
                    重置
                  </el-button>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-section">
      <el-col :xs="24" :sm="12" :md="6" v-for="(stat, index) in statCards" :key="index">
        <el-card class="stat-card" :class="stat.type" shadow="hover">
          <div class="stat-card-content">
            <div class="stat-icon">
              <el-icon :size="24">
                <component :is="iconComponents[stat.icon]" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 活动列表 -->
    <el-card class="activity-list-container">
      <el-table
        v-loading="loading"
        :data="activityList"
        border
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="活动标题" prop="title" min-width="150" />
        <el-table-column label="活动类型" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getActivityTypeColor(row.activityType)">
              {{ getActivityTypeLabel(row.activityType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="活动状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" prop="startTime" min-width="150">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="活动地点" prop="location" min-width="120" />
        <el-table-column label="报名情况" min-width="100">
          <template #default="{ row }">
            <span :class="getCapacityClass(row)">
              {{ row.registeredCount || 0 }}/{{ row.capacity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="活动费用" prop="fee" min-width="100">
          <template #default="{ row }">
            <span v-if="row.fee && row.fee > 0" class="fee-amount">
              ¥{{ row.fee }}
            </span>
            <el-tag v-else type="success" size="small">免费</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewActivity(row)">
              查看
            </el-button>
            <el-button type="warning" size="small" @click="handleEditActivity(row)">
              编辑
            </el-button>
            <el-button 
              v-if="row.status === 0" 
              type="success" 
              size="small" 
              @click="handlePublishActivity(row)"
            >
              发布
            </el-button>
            <el-button type="info" size="small" @click="handleManageRegistrations(row)">
              报名管理
            </el-button>
            <el-button type="danger" size="small" @click="handleDeleteActivity(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
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

    <!-- 报名管理对话框 -->
    <el-dialog 
      v-model="registrationDialogVisible" 
      title="报名管理" 
      width="1000px"
      destroy-on-close
    >
      <div class="registration-management">
        <div class="registration-header">
          <h3>{{ selectedActivity?.title }} - 报名管理</h3>
          <div class="registration-stats">
            <el-statistic 
              title="报名人数" 
              :value="registrations.length" 
              suffix="人"
            />
            <el-statistic 
              title="容量" 
              :value="selectedActivity?.capacity || 0" 
              suffix="人"
            />
            <el-statistic 
              title="剩余名额" 
              :value="Math.max(0, (selectedActivity?.capacity || 0) - registrations.length)" 
              suffix="人"
            />
          </div>
        </div>
        
        <el-table 
          :data="registrations" 
          v-loading="loadingRegistrations"
          style="width: 100%"
        >
          <el-table-column prop="contactName" label="联系人" width="100" />
          <el-table-column prop="contactPhone" label="联系电话" width="120" />
          <el-table-column prop="childName" label="孩子姓名" width="100" />
          <el-table-column prop="childAge" label="孩子年龄" width="80">
            <template #default="{ row }">
              {{ row.childAge ? row.childAge + '岁' : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="attendeeCount" label="参与人数" width="80" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getRegistrationStatusColor(row.status)">
                {{ getRegistrationStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="报名时间" width="150">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="specialNeeds" label="特殊需求" min-width="150" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button 
                v-if="row.status === 0" 
                type="success" 
                size="small" 
                @click="handleConfirmRegistration(row)"
              >
                确认
              </el-button>
              <el-button 
                v-if="row.status === 0" 
                type="danger" 
                size="small" 
                @click="handleRejectRegistration(row)"
              >
                拒绝
              </el-button>
              <el-button 
                v-if="row.status === 1" 
                type="primary" 
                size="small" 
                @click="handleCheckinRegistration(row)"
              >
                签到
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
    </template>
  </CenterContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Download, Search, Refresh, Calendar, Trophy, User, TrendCharts
} from '@element-plus/icons-vue'

// API imports
import { 
  getActivityList, 
  getActivityStatistics, 
  updateActivityPlan,
  deleteActivityPlan,
  getRegistrationsByActivity,
  updateRegistration,
  batchCreateCheckins,
  type Activity, 
  type ActivityQueryParams,
  type ActivityRegistration,
  type ActivityStatistics
} from '@/api/modules/activity'

// Components
import CenterContainer from '@/components/centers/CenterContainer.vue'

// Utils
import { formatDateTime } from '@/utils/dateFormat'

const router = useRouter()

// Reactive data
const loading = ref(false)
const loadingRegistrations = ref(false)
const registrationDialogVisible = ref(false)
const activityList = ref<Activity[]>([])
const selectedActivities = ref<Activity[]>([])
const selectedActivity = ref<Activity | null>(null)
const registrations = ref<ActivityRegistration[]>([])
const dateRange = ref<string[]>([])

// Statistics
const statCards = ref([
  { label: '活动总数', value: 0, icon: 'Calendar', type: 'primary' },
  { label: '进行中', value: 0, icon: 'Trophy', type: 'success' },
  { label: '本月新增', value: 0, icon: 'Plus', type: 'warning' },
  { label: '报名人数', value: 0, icon: 'User', type: 'info' }
])

// Icon components mapping
const iconComponents = {
  Calendar,
  Trophy,
  Plus,
  User,
  TrendCharts
}

// Pagination
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// Search form
const queryForm = ref<ActivityQueryParams>({
  title: '',
  activityType: undefined,
  status: undefined,
  page: 1,
  size: 20
})

// Options
const activityTypeOptions = [
  { label: '开放日', value: 1 },
  { label: '体验课', value: 2 },
  { label: '亲子活动', value: 3 },
  { label: '招生说明会', value: 4 },
  { label: '家长会', value: 5 },
  { label: '节日活动', value: 6 },
  { label: '其他', value: 7 }
]

const activityStatusOptions = [
  { label: '草稿', value: 0 },
  { label: '未开始', value: 1 },
  { label: '报名中', value: 2 },
  { label: '进行中', value: 3 },
  { label: '已结束', value: 4 },
  { label: '已取消', value: 5 }
]

// Watch date range changes
watch(dateRange, (newVal) => {
  if (newVal && newVal.length === 2) {
    queryForm.value.startTimeStart = newVal[0]
    queryForm.value.startTimeEnd = newVal[1]
  } else {
    queryForm.value.startTimeStart = ''
    queryForm.value.startTimeEnd = ''
  }
})

// Load statistics
const loadStatistics = async () => {
  try {
    const response = await getActivityStatistics()
    if (response.success && response.data) {
      const stats = response.data
      statCards.value[0].value = stats.total_activities || 0
      statCards.value[1].value = stats.active || 0
      statCards.value[2].value = stats.this_month || 0
      statCards.value[3].value = Math.round((stats.participation_rate || 0) * 100)
    }
  } catch (error) {
    console.error('Failed to load statistics:', error)
  }
}

// Load activity list
const loadActivityList = async () => {
  loading.value = true
  try {
    const params = {
      ...queryForm.value,
      page: pagination.value?.currentPage || 1,
      size: pagination.value?.pageSize || 20
    }
    
    const response = await getActivityList(params)
    if (response.success || response.items) {
      activityList.value = response.items || response.data?.items || []
      if (pagination.value) {
        pagination.value.total = response.total || response.data?.total || 0
      }
    } else {
      activityList.value = []
      if (pagination.value) {
        pagination.value.total = 0
      }
      ElMessage.warning('获取活动列表失败')
    }
  } catch (error) {
    console.error('Failed to load activity list:', error)
    ElMessage.error('获取活动列表失败')
  } finally {
    loading.value = false
  }
}

// Load registrations for activity
const loadRegistrations = async (activityId: number) => {
  loadingRegistrations.value = true
  try {
    const response = await getRegistrationsByActivity(activityId)
    if (response.success || response.items) {
      registrations.value = response.items || response.data?.items || []
    } else {
      registrations.value = []
      ElMessage.warning('获取报名信息失败')
    }
  } catch (error) {
    console.error('Failed to load registrations:', error)
    ElMessage.error('获取报名信息失败')
  } finally {
    loadingRegistrations.value = false
  }
}

// Event handlers
const handleSearch = () => {
  if (pagination.value) {
    pagination.value.currentPage = 1
  }
  loadActivityList()
}

const handleReset = () => {
  queryForm.value = {
    title: '',
    activityType: undefined,
    status: undefined,
    page: 1,
    size: 20
  }
  dateRange.value = []
  if (pagination.value) {
    pagination.value.currentPage = 1
  }
  loadActivityList()
}

const handleSizeChange = (size: number) => {
  if (pagination.value) {
    pagination.value.pageSize = size
  }
  loadActivityList()
}

const handleCurrentChange = (page: number) => {
  if (pagination.value) {
    pagination.value.currentPage = page
  }
  loadActivityList()
}

const handleSelectionChange = (selection: Activity[]) => {
  selectedActivities.value = selection
}

const handleCreateActivity = () => {
  router.push('/activity/create')
}

const handleViewActivity = (activity: Activity) => {
  router.push(`/activity/detail/${activity.id}`)
}

const handleEditActivity = (activity: Activity) => {
  router.push(`/activity/edit/${activity.id}`)
}

const handlePublishActivity = async (activity: Activity) => {
  try {
    await ElMessageBox.confirm(
      `确定要发布活动 "${activity.title}" 吗？`,
      '发布确认',
      { type: 'warning' }
    )
    
    const response = await updateActivityPlan(activity.id, { status: 1 })
    if (response.success) {
      ElMessage.success('活动发布成功')
      loadActivityList()
    } else {
      ElMessage.error(response.message || '发布失败')
    }
  } catch (error) {
    console.error('Failed to publish activity:', error)
  }
}

const handleManageRegistrations = async (activity: Activity) => {
  selectedActivity.value = activity
  registrationDialogVisible.value = true
  await loadRegistrations(activity.id)
}

const handleDeleteActivity = async (activity: Activity) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除活动 "${activity.title}" 吗？此操作不可恢复。`,
      '删除确认',
      { type: 'warning' }
    )
    
    const response = await deleteActivityPlan(activity.id)
    if (response.success) {
      ElMessage.success('活动删除成功')
      loadActivityList()
      loadStatistics()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    console.error('Failed to delete activity:', error)
  }
}

const handleBatchDelete = async () => {
  if (selectedActivities.value.length === 0) {
    ElMessage.warning('请至少选择一个活动')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedActivities.value.length} 个活动吗？此操作不可恢复。`,
      '批量删除确认',
      { type: 'warning' }
    )
    
    const deletePromises = selectedActivities.value.map(activity => 
      deleteActivityPlan(activity.id)
    )
    
    await Promise.all(deletePromises)
    ElMessage.success('批量删除成功')
    loadActivityList()
    loadStatistics()
    selectedActivities.value = []
  } catch (error) {
    console.error('Failed to batch delete:', error)
    ElMessage.error('批量删除失败')
  }
}

const handleExportActivities = () => {
  if (activities.value.length === 0) {
    ElMessage.warning('暂无活动数据可导出')
    return
  }

  try {
    // 准备导出数据
    const exportData = activities.value.map(activity => ({
      活动名称: activity.title,
      活动类型: activity.type,
      开始时间: activity.startTime,
      结束时间: activity.endTime,
      地点: activity.location,
      状态: activity.status === 'upcoming' ? '即将开始' :
            activity.status === 'ongoing' ? '进行中' :
            activity.status === 'completed' ? '已完成' : '已取消',
      参与人数: activity.participantCount,
      最大人数: activity.maxParticipants,
      描述: activity.description
    }))

    // 创建CSV内容
    const headers = Object.keys(exportData[0])
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n')

    // 创建下载链接
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `活动信息_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success(`成功导出 ${activities.value.length} 条活动信息`)
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请稍后重试')
  }
}

// Registration management handlers
const handleConfirmRegistration = async (registration: ActivityRegistration) => {
  try {
    const response = await updateRegistration(registration.id, { status: 1 })
    if (response.success) {
      ElMessage.success('确认报名成功')
      if (selectedActivity.value) {
        await loadRegistrations(selectedActivity.value.id)
      }
    } else {
      ElMessage.error(response.message || '确认失败')
    }
  } catch (error) {
    console.error('Failed to confirm registration:', error)
    ElMessage.error('确认失败')
  }
}

const handleRejectRegistration = async (registration: ActivityRegistration) => {
  try {
    await ElMessageBox.confirm('确定要拒绝此报名吗？', '拒绝确认', { type: 'warning' })
    
    const response = await updateRegistration(registration.id, { status: 2 })
    if (response.success) {
      ElMessage.success('已拒绝报名')
      if (selectedActivity.value) {
        await loadRegistrations(selectedActivity.value.id)
      }
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('Failed to reject registration:', error)
  }
}

const handleCheckinRegistration = async (registration: ActivityRegistration) => {
  try {
    if (!selectedActivity.value) return
    
    const response = await batchCreateCheckins({
      activityId: selectedActivity.value.id,
      registrationIds: [registration.id],
      checkinMethod: 1
    })
    
    if (response.success) {
      ElMessage.success('签到成功')
      // Update registration status
      await updateRegistration(registration.id, { status: 4 })
      await loadRegistrations(selectedActivity.value.id)
    } else {
      ElMessage.error(response.message || '签到失败')
    }
  } catch (error) {
    console.error('Failed to checkin:', error)
    ElMessage.error('签到失败')
  }
}

// Utility functions
const getActivityTypeLabel = (type: number) => {
  const typeMap = {
    1: '开放日',
    2: '体验课',
    3: '亲子活动',
    4: '招生说明会',
    5: '家长会',
    6: '节日活动',
    7: '其他'
  }
  return typeMap[type] || '未知'
}

const getActivityTypeColor = (type: number) => {
  const colorMap = {
    1: 'primary',
    2: 'success',
    3: 'warning',
    4: 'info',
    5: 'danger',
    6: 'primary',
    7: 'info'
  }
  return colorMap[type] || 'info'
}

const getStatusLabel = (status: number) => {
  const statusMap = {
    0: '草稿',
    1: '未开始',
    2: '报名中',
    3: '进行中',
    4: '已结束',
    5: '已取消'
  }
  return statusMap[status] || '未知'
}

const getStatusColor = (status: number) => {
  const colorMap = {
    0: 'info',
    1: 'warning',
    2: 'primary',
    3: 'success',
    4: 'info',
    5: 'danger'
  }
  return colorMap[status] || 'info'
}

const getCapacityClass = (activity: Activity) => {
  const registered = activity.registeredCount || 0
  const capacity = activity.capacity || 0
  const ratio = registered / capacity
  
  if (ratio >= 1) return 'capacity-full'
  if (ratio >= 0.8) return 'capacity-high'
  if (ratio >= 0.5) return 'capacity-medium'
  return 'capacity-low'
}

const getRegistrationStatusLabel = (status: number) => {
  const statusMap = {
    0: '待审核',
    1: '已确认',
    2: '已拒绝',
    3: '已取消',
    4: '已签到',
    5: '未出席'
  }
  return statusMap[status] || '未知'
}

const getRegistrationStatusColor = (status: number) => {
  const colorMap = {
    0: 'warning',
    1: 'success',
    2: 'danger',
    3: 'info',
    4: 'primary',
    5: 'danger'
  }
  return colorMap[status] || 'info'
}

// Initialize page
onMounted(async () => {
  await Promise.all([
    loadStatistics(),
    loadActivityList()
  ])
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.search-section {
  margin-bottom: var(--app-gap);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: var(--border-width-base) solid var(--border-color);
}

.stats-section {
  margin-bottom: var(--app-gap);
}

.stat-card {
  height: 100%;
  border-radius: var(--radius-lg);
  border: var(--border-width-base) solid var(--border-color);
  background: var(--bg-card);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  overflow: hidden;
}

.stat-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.stat-card.primary {
  border-left: var(--spacing-xs) solid var(--primary-color);
}

.stat-card.success {
  border-left: var(--spacing-xs) solid var(--success-color);
}

.stat-card.warning {
  border-left: var(--spacing-xs) solid var(--warning-color);
}

.stat-card.info {
  border-left: var(--spacing-xs) solid var(--info-color);
}

.stat-card-content {
  display: flex;
  align-items: center;
  padding: var(--app-gap);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--app-gap);
  background: var(--gradient-blue);
  color: var(--text-light);
  box-shadow: var(--shadow-sm);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: var(--app-gap-xs);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.activity-list-container {
  margin-bottom: var(--app-gap);
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: var(--app-gap);
  padding: var(--app-gap);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: var(--border-width-base) solid var(--border-color);
}

.fee-amount {
  color: var(--warning-color);
  font-weight: 600;
}

.capacity-full {
  color: var(--danger-color);
  font-weight: 600;
}

.capacity-high {
  color: var(--warning-color);
  font-weight: 600;
}

.capacity-medium {
  color: var(--primary-color);
  font-weight: 500;
}

.capacity-low {
  color: var(--success-color);
}

.registration-management {
  padding: var(--app-gap);
}

.registration-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--app-gap);
  padding-bottom: var(--app-gap);
  border-bottom: var(--border-width-base) solid var(--border-color);
}

.registration-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--text-lg);
}

.registration-stats {
  display: flex;
  gap: var(--app-gap-lg);
}

.action-buttons {
  display: flex;
  gap: var(--app-gap-sm);
  align-items: center;
}

/* Element Plus theme overrides */
:deep(.el-card) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-table) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
}

:deep(.el-table .el-table__header th) {
  background: var(--bg-tertiary) !important;
  color: var(--text-primary) !important;
}

:deep(.el-table .el-table__body tr) {
  background: var(--bg-card) !important;
}

:deep(.el-table .el-table__body tr:hover) {
  background: var(--bg-hover) !important;
}

:deep(.el-button.el-button--primary) {
  background: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}

:deep(.el-button.el-button--success) {
  background: var(--success-color) !important;
  border-color: var(--success-color) !important;
}

:deep(.el-button.el-button--warning) {
  background: var(--warning-color) !important;
  border-color: var(--warning-color) !important;
}

:deep(.el-button.el-button--danger) {
  background: var(--danger-color) !important;
  border-color: var(--danger-color) !important;
}

/* Responsive design */
@media (max-width: var(--breakpoint-md)) {
  .registration-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--app-gap);
  }
  
  .registration-stats {
    flex-direction: column;
    gap: var(--app-gap-sm);
  }
  
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
}
</style>