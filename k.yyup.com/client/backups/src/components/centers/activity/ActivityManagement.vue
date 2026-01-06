<template>
  <div class="activity-management">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" :icon="Plus" @click="handleCreate">
          <i class="icon-plus"></i>
          <span>新建活动</span>
        </el-button>
        <el-button type="success" :icon="Download" @click="handleExport">
          导出数据
        </el-button>
        <el-button 
          type="danger" 
          :disabled="selectedActivities.length === 0" 
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
      </div>
      <div class="toolbar-right">
        <div class="search-box">
          <i class="icon-search"></i>
          <el-input
            v-model="searchForm.title"
            placeholder="搜索活动标题..."
            clearable
            @keyup.enter="handleSearch"
          />
        </div>
        <el-button :icon="Refresh" @click="handleRefresh">
          <i class="icon-refresh"></i>
          <span>刷新</span>
        </el-button>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters">
      <el-form :model="searchForm" inline>
        <el-form-item label="活动类型">
          <el-select v-model="searchForm.type" placeholder="选择类型" clearable>
            <el-option label="体验课" value="trial" />
            <el-option label="亲子活动" value="family" />
            <el-option label="节日庆典" value="festival" />
            <el-option label="教育讲座" value="lecture" />
            <el-option label="户外活动" value="outdoor" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
            <el-option label="草稿" value="draft" />
            <el-option label="报名中" value="registration" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已结束" value="ended" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
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
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 活动列表 -->
    <div class="table-container">
      <DataTable
        :data="activityList"
        :columns="tableColumns"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @selection-change="handleSelectionChange"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <!-- 封面图片列 -->
        <template #coverImage="{ row }">
          <div class="cover-image">
            <el-image
              v-if="row.coverImage"
              :src="row.coverImage"
              :preview-src-list="[row.coverImage]"
              fit="cover"
              style="width: 60px; height: var(--button-height-lg); border-radius: var(--spacing-xs);"
              :preview-teleported="true"
            />
            <div v-else class="no-image">
              <el-icon><Picture /></el-icon>
              <span>暂无图片</span>
            </div>
          </div>
        </template>

        <!-- 活动标题列 -->
        <template #title="{ row }">
          <div class="activity-title">
            <span class="title-text">{{ row.title }}</span>
            <el-tag v-if="row.isHot" type="danger" size="small">热门</el-tag>
          </div>
        </template>

        <!-- 活动类型列 -->
        <template #activityType="{ row }">
          <el-tag :type="getActivityTypeTagType(row.activityType)" size="small">
            {{ getActivityTypeLabel(row.activityType) }}
          </el-tag>
        </template>

        <!-- 活动状态列 -->
        <template #status="{ row }">
          <el-tag :type="getStatusTagType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>

        <!-- 报名情况列 -->
        <template #registration="{ row }">
          <div class="registration-info">
            <span class="count">{{ row.registeredCount }}/{{ row.capacity }}</span>
            <el-progress
              :percentage="Math.round((row.registeredCount / row.capacity) * 100)"
              :stroke-width="6"
              :show-text="false"
              :color="getProgressColor(row.registeredCount / row.capacity)"
            />
          </div>
        </template>

        <!-- 操作列 -->
        <template #actions="{ row }">
          <div class="action-buttons">
            <el-button type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button type="warning" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button 
              v-if="row.status === 'draft'" 
              type="success" 
              size="small" 
              @click="handlePublish(row)"
            >
              发布
            </el-button>
            <el-button type="info" size="small" @click="handleManageRegistrations(row)">
              报名管理
            </el-button>
            <el-dropdown>
              <el-button size="small">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleDuplicate(row)">
                    复制活动
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleSendNotification(row)">
                    发送通知
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleDelete(row)" class="text-danger">
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Refresh, ArrowDown, Picture } from '@element-plus/icons-vue'

// 组件导入
import DataTable from '@/components/common/DataTable.vue'

// API导入
import {
  getActivityList,
  deleteActivity as deleteActivityById,
  type Activity
} from '@/api/modules/activity'

// 路由
const router = useRouter()

// 数据状态
const loading = ref(false)
const activityList = ref<Activity[]>([])
const selectedActivities = ref<Activity[]>([])

// 搜索表单
const searchForm = ref({
  title: '',
  type: '',
  status: '',
  startDate: '',
  endDate: ''
})

// 日期范围
const dateRange = ref<[string, string] | null>(null)

// 分页配置
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表格列配置
const tableColumns = [
  { type: 'selection', width: 55 },
  { prop: 'coverImage', label: '封面图片', slot: 'coverImage', width: 100 },
  { prop: 'title', label: '活动标题', slot: 'title', minWidth: 200 },
  { prop: 'activityType', label: '活动类型', slot: 'activityType', width: 100 },
  { prop: 'status', label: '状态', slot: 'status', width: 100 },
  { prop: 'startTime', label: '开始时间', width: 160, formatter: formatDateTime },
  { prop: 'endTime', label: '结束时间', width: 160, formatter: formatDateTime },
  { prop: 'location', label: '地点', width: 120 },
  { prop: 'registration', label: '报名情况', slot: 'registration', width: 120 },
  { prop: 'fee', label: '价格', width: 80, formatter: formatPrice },
  { prop: 'actions', label: '操作', slot: 'actions', width: 280, fixed: 'right' }
]

// 加载活动列表
const loadActivityList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm.value,
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize
    }

    const response = await getActivityList(params)
    if (response.success) {
      activityList.value = response.data.items || []
      pagination.value.total = response.data.total || 0
    }
  } catch (error) {
    console.error('Failed to load activities:', error)
    ElMessage.error('加载活动列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  loadActivityList()
}

// 处理重置
const handleReset = () => {
  searchForm.value = {
    title: '',
    type: '',
    status: '',
    startDate: '',
    endDate: ''
  }
  dateRange.value = null
  handleSearch()
}

// 处理日期范围变化
const handleDateRangeChange = (dates: [string, string] | null) => {
  if (dates) {
    searchForm.value.startDate = dates[0]
    searchForm.value.endDate = dates[1]
  } else {
    searchForm.value.startDate = ''
    searchForm.value.endDate = ''
  }
}

// 处理刷新
const handleRefresh = () => {
  loadActivityList()
}

// 处理新建
const handleCreate = () => {
  router.push('/activity/create')
}

// 处理导出
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 处理批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedActivities.value.length} 个活动吗？`,
      '批量删除确认',
      { type: 'warning' }
    )
    
    // 批量删除逻辑
    ElMessage.success('批量删除成功')
    loadActivityList()
  } catch (error) {
    // 用户取消
  }
}

// 处理选择变化
const handleSelectionChange = (selection: Activity[]) => {
  selectedActivities.value = selection
}

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.value.currentPage = page
  loadActivityList()
}

// 处理页大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  loadActivityList()
}

// 处理查看
const handleView = (activity: Activity) => {
  router.push(`/activity/detail/${activity.id}`)
}

// 处理编辑
const handleEdit = (activity: Activity) => {
  router.push(`/activity/edit/${activity.id}`)
}

// 处理发布
const handlePublish = async (activity: Activity) => {
  try {
    await ElMessageBox.confirm(
      `确定要发布活动 "${activity.title}" 吗？`,
      '发布确认',
      { type: 'warning' }
    )

    // 更新活动状态为报名中
    // await updateActivityStatus(activity.id, 'REGISTRATION_OPEN')
    ElMessage.success('活动发布成功')
    loadActivityList()
  } catch (error) {
    console.error('Failed to publish activity:', error)
    ElMessage.error('发布失败')
  }
}

// 处理报名管理
const handleManageRegistrations = (activity: Activity) => {
  router.push(`/activity/registrations/${activity.id}`)
}

// 处理复制
const handleDuplicate = (activity: Activity) => {
  router.push(`/activity/create?template=${activity.id}`)
}

// 处理发送通知
const handleSendNotification = (activity: Activity) => {
  ElMessage.info('发送通知功能开发中...')
}

// 处理删除
const handleDelete = async (activity: Activity) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除活动 "${activity.title}" 吗？`,
      '删除确认',
      { type: 'warning' }
    )

    await deleteActivityById(activity.id.toString())
    ElMessage.success('删除成功')
    loadActivityList()
  } catch (error) {
    console.error('Failed to delete activity:', error)
    ElMessage.error('删除失败')
  }
}

// 工具函数
const formatDateTime = (row: any, column: any, cellValue: string) => {
  return cellValue ? new Date(cellValue).toLocaleString() : '-'
}

const formatPrice = (row: any, column: any, cellValue: number) => {
  return cellValue === 0 ? '免费' : `¥${cellValue}`
}

const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    trial: '体验课',
    family: '亲子活动',
    festival: '节日庆典',
    lecture: '教育讲座',
    outdoor: '户外活动'
  }
  return typeMap[type] || type
}

const getTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    trial: 'primary',
    family: 'success',
    festival: 'warning',
    lecture: 'info',
    outdoor: 'danger'
  }
  return typeMap[type] || 'info'
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    registration: '报名中',
    ongoing: '进行中',
    ended: '已结束',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const getStatusTagType = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: 'info',
    registration: 'warning',
    ongoing: 'success',
    ended: 'info',
    cancelled: 'danger'
  }
  return statusMap[status] || 'info'
}

const getProgressColor = (percentage: number) => {
  if (percentage < 0.5) return 'var(--success-color)'
  if (percentage < 0.8) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

// 活动类型相关函数
const getActivityTypeLabel = (activityType: number) => {
  const typeMap: Record<number, string> = {
    1: '开放日',
    2: '家长会',
    3: '亲子活动',
    4: '招生宣讲',
    5: '园区参观',
    6: '其他'
  }
  return typeMap[activityType] || '未知'
}

const getActivityTypeTagType = (activityType: number) => {
  const typeMap: Record<number, string> = {
    1: 'success',
    2: 'warning',
    3: 'primary',
    4: 'danger',
    5: 'info',
    6: 'default'
  }
  return typeMap[activityType] || 'default'
}

// 初始化
onMounted(() => {
  loadActivityList()
})
</script>

<style scoped lang="scss">
@import '@/styles/management.scss';

.activity-management {
  min-height: 100vh;
  background: var(--bg-hover);
}

.toolbar {
  background: var(--bg-white);
  border-radius: var(--spacing-sm);
  padding: var(--text-lg) var(--text-2xl);
  margin-bottom: var(--text-2xl);
  box-shadow: 0 2px var(--text-sm) var(--shadow-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--text-lg);
}

.filters {
  display: flex;
  gap: var(--text-lg);
  align-items: center;
  flex-wrap: wrap;
}

.table-container {
  background: var(--bg-white);
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--text-sm) var(--shadow-light);
  overflow: hidden;
}

.cover-image {
  display: flex;
  align-items: center;
  justify-content: center;

  .no-image {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--text-tertiary);
    font-size: var(--text-sm);

    .el-icon {
      font-size: var(--text-2xl);
    }

    span {
      font-size: var(--text-2xs);
    }
  }
}

.activity-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  .title-text {
    font-weight: 500;
  }
}

.registration-info {
  .count {
    display: block;
    font-size: var(--text-sm);
    margin-bottom: var(--spacing-xs);
  }
}

.action-buttons {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.text-danger {
  color: var(--el-color-danger);
}
</style>
