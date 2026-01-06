<template>
  <div class="notification-management">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" :icon="Plus" @click="handleSendNotification">
          <i class="icon-plus"></i>
          <span>发送通知</span>
        </el-button>
        <el-button type="success" :icon="Template" @click="handleManageTemplates">
          模板管理
        </el-button>
        <el-button type="info" :icon="Setting" @click="handleSettings">
          通知设置
        </el-button>
      </div>
      <div class="toolbar-right">
        <div class="search-box">
          <i class="icon-search"></i>
          <el-input
            v-model="searchForm.title"
            placeholder="搜索通知标题..."
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
        <el-form-item label="通知类型">
          <el-select v-model="searchForm.type" placeholder="选择类型" clearable>
            <el-option label="活动提醒" value="activity_reminder" />
            <el-option label="报名确认" value="registration_confirm" />
            <el-option label="活动变更" value="activity_change" />
            <el-option label="活动取消" value="activity_cancel" />
            <el-option label="系统通知" value="system_notice" />
          </el-select>
        </el-form-item>
        <el-form-item label="发送状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
            <el-option label="待发送" value="pending" />
            <el-option label="发送中" value="sending" />
            <el-option label="已发送" value="sent" />
            <el-option label="发送失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 通知列表 -->
    <div class="table-container">
      <DataTable
        :data="notificationList"
        :columns="tableColumns"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <!-- 通知类型列 -->
        <template #type="{ row }">
          <el-tag :type="getTypeTagType(row.type)" size="small">
            {{ getTypeLabel(row.type) }}
          </el-tag>
        </template>

        <!-- 通知内容列 -->
        <template #content="{ row }">
          <div class="notification-content">
            <div class="notification-title">{{ row.title }}</div>
            <div class="notification-preview">{{ getContentPreview(row.content) }}</div>
          </div>
        </template>

        <!-- 关联活动列 -->
        <template #activity="{ row }">
          <div v-if="row.activityTitle" class="activity-link">
            <el-link type="primary" @click="handleViewActivity(row.activityId)">
              {{ row.activityTitle }}
            </el-link>
          </div>
          <span v-else class="no-activity">-</span>
        </template>

        <!-- 发送状态列 -->
        <template #status="{ row }">
          <el-tag :type="getStatusTagType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>

        <!-- 接收人数列 -->
        <template #recipients="{ row }">
          <div class="recipients-info">
            <span class="count">{{ row.recipients }}</span>
            <span class="unit">人</span>
          </div>
        </template>

        <!-- 发送时间列 -->
        <template #sentAt="{ row }">
          <div class="time-info">
            <div>{{ formatDate(row.sentAt) }}</div>
            <div class="time-detail">{{ formatTime(row.sentAt) }}</div>
          </div>
        </template>

        <!-- 操作列 -->
        <template #actions="{ row }">
          <div class="action-buttons">
            <el-button type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button 
              v-if="row.status === 'pending'" 
              type="success" 
              size="small" 
              @click="handleSend(row)"
            >
              发送
            </el-button>
            <el-button 
              v-if="row.status === 'pending'" 
              type="warning" 
              size="small" 
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-dropdown>
              <el-button size="small">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleDuplicate(row)">
                    复制通知
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleViewStats(row)">
                    查看统计
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

    <!-- 发送通知对话框 -->
    <el-dialog
      v-model="sendDialogVisible"
      title="发送通知"
      width="800px"
      destroy-on-close
    >
      <NotificationForm
        v-if="sendDialogVisible"
        :notification="editingNotification"
        @submit="handleSubmitNotification"
        @cancel="sendDialogVisible = false"
      />
    </el-dialog>

    <!-- 模板管理对话框 -->
    <el-dialog
      v-model="templateDialogVisible"
      title="通知模板管理"
      width="1000px"
      destroy-on-close
    >
      <NotificationTemplates
        v-if="templateDialogVisible"
        @close="templateDialogVisible = false"
        @use-template="handleUseTemplate"
      />
    </el-dialog>

    <!-- 通知详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="通知详情"
      width="800px"
      destroy-on-close
    >
      <NotificationDetail
        v-if="selectedNotification"
        :notification="selectedNotification"
        @close="detailDialogVisible = false"
      />
    </el-dialog>

    <!-- 通知设置对话框 -->
    <el-dialog
      v-model="settingsDialogVisible"
      title="通知设置"
      width="600px"
      destroy-on-close
    >
      <NotificationSettings
        v-if="settingsDialogVisible"
        @close="settingsDialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, ArrowDown, Template, Setting } from '@element-plus/icons-vue'

// 组件导入
import DataTable from '@/components/common/DataTable.vue'
import NotificationForm from './NotificationForm.vue'
import NotificationTemplates from './NotificationTemplates.vue'
import NotificationDetail from './NotificationDetail.vue'
import NotificationSettings from './NotificationSettings.vue'

// API导入
import {
  getNotifications,
  sendActivityNotification,
  type Notification
} from '@/api/activity-center'

// 路由
const router = useRouter()

// 数据状态
const loading = ref(false)
const notificationList = ref<Notification[]>([])

// 对话框状态
const sendDialogVisible = ref(false)
const templateDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const settingsDialogVisible = ref(false)

// 编辑状态
const editingNotification = ref<Notification | null>(null)
const selectedNotification = ref<Notification | null>(null)

// 搜索表单
const searchForm = ref({
  title: '',
  type: '',
  status: ''
})

// 分页配置
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表格列配置
const tableColumns = [
  { prop: 'type', label: '类型', slot: 'type', width: 120 },
  { prop: 'content', label: '通知内容', slot: 'content', minWidth: 300 },
  { prop: 'activity', label: '关联活动', slot: 'activity', width: 180 },
  { prop: 'recipients', label: '接收人数', slot: 'recipients', width: 100 },
  { prop: 'status', label: '状态', slot: 'status', width: 100 },
  { prop: 'sentAt', label: '发送时间', slot: 'sentAt', width: 140 },
  { prop: 'actions', label: '操作', slot: 'actions', width: 200, fixed: 'right' }
]

// 加载通知列表
const loadNotificationList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm.value,
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize
    }
    
    const response = await getNotifications(params)
    if (response.success) {
      notificationList.value = response.data.items
      pagination.value.total = response.data.total
    }
  } catch (error) {
    console.error('Failed to load notifications:', error)
    ElMessage.error('加载通知列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  loadNotificationList()
}

// 处理重置
const handleReset = () => {
  searchForm.value = {
    title: '',
    type: '',
    status: ''
  }
  handleSearch()
}

// 处理刷新
const handleRefresh = () => {
  loadNotificationList()
}

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.value.currentPage = page
  loadNotificationList()
}

// 处理页大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  loadNotificationList()
}

// 处理发送通知
const handleSendNotification = () => {
  editingNotification.value = null
  sendDialogVisible.value = true
}

// 处理模板管理
const handleManageTemplates = () => {
  templateDialogVisible.value = true
}

// 处理通知设置
const handleSettings = () => {
  settingsDialogVisible.value = true
}

// 处理查看详情
const handleView = (notification: Notification) => {
  selectedNotification.value = notification
  detailDialogVisible.value = true
}

// 处理发送
const handleSend = async (notification: Notification) => {
  try {
    await ElMessageBox.confirm(
      `确定要发送通知 "${notification.title}" 吗？`,
      '发送确认',
      { type: 'warning' }
    )
    
    // 发送通知逻辑
    ElMessage.success('通知发送成功')
    loadNotificationList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to send notification:', error)
      ElMessage.error('发送失败')
    }
  }
}

// 处理编辑
const handleEdit = (notification: Notification) => {
  editingNotification.value = notification
  sendDialogVisible.value = true
}

// 处理复制
const handleDuplicate = (notification: Notification) => {
  editingNotification.value = { ...notification, id: '', title: `${notification.title} - 副本` }
  sendDialogVisible.value = true
}

// 处理查看统计
const handleViewStats = (notification: Notification) => {
  ElMessage.info('查看统计功能开发中...')
}

// 处理删除
const handleDelete = async (notification: Notification) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除通知 "${notification.title}" 吗？`,
      '删除确认',
      { type: 'warning' }
    )
    
    // 删除通知逻辑
    ElMessage.success('删除成功')
    loadNotificationList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete notification:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 处理查看活动
const handleViewActivity = (activityId: string) => {
  router.push(`/activity/detail/${activityId}`)
}

// 处理提交通知
const handleSubmitNotification = async (data: any) => {
  try {
    await sendActivityNotification(data)
    ElMessage.success('通知创建成功')
    sendDialogVisible.value = false
    loadNotificationList()
  } catch (error) {
    console.error('Failed to create notification:', error)
    ElMessage.error('创建失败')
  }
}

// 处理使用模板
const handleUseTemplate = (template: any) => {
  editingNotification.value = {
    id: '',
    type: template.type,
    title: template.title,
    content: template.content,
    activityId: '',
    activityTitle: '',
    recipients: 0,
    sentAt: '',
    status: 'pending'
  }
  templateDialogVisible.value = false
  sendDialogVisible.value = true
}

// 工具函数
const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    activity_reminder: '活动提醒',
    registration_confirm: '报名确认',
    activity_change: '活动变更',
    activity_cancel: '活动取消',
    system_notice: '系统通知'
  }
  return typeMap[type] || type
}

const getTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    activity_reminder: 'primary',
    registration_confirm: 'success',
    activity_change: 'warning',
    activity_cancel: 'danger',
    system_notice: 'info'
  }
  return typeMap[type] || 'info'
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待发送',
    sending: '发送中',
    sent: '已发送',
    failed: '发送失败'
  }
  return statusMap[status] || status
}

const getStatusTagType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'warning',
    sending: 'primary',
    sent: 'success',
    failed: 'danger'
  }
  return statusMap[status] || 'info'
}

const getContentPreview = (content: string) => {
  return content.length > 50 ? content.substring(0, 50) + '...' : content
}

const formatDate = (dateTime: string) => {
  return dateTime ? new Date(dateTime).toLocaleDateString() : '-'
}

const formatTime = (dateTime: string) => {
  return dateTime ? new Date(dateTime).toLocaleTimeString() : '-'
}

// 初始化
onMounted(() => {
  loadNotificationList()
})
</script>

<style scoped lang="scss">
@import '@/styles/management.scss';

.notification-management {
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

.notification-content {
  .notification-title {
    font-weight: 500;
    margin-bottom: var(--spacing-xs);
  }
  
  .notification-preview {
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
    line-height: 1.4;
  }
}

.activity-link {
  .el-link {
    font-size: var(--text-sm);
  }
}

.no-activity {
  color: var(--el-text-color-placeholder);
}

.recipients-info {
  .count {
    font-weight: 500;
  }
  
  .unit {
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
  }
}

.time-info {
  .time-detail {
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
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
