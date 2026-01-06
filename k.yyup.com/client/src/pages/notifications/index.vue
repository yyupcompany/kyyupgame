<template>
  <UnifiedCenterLayout
    title="通知公告"
    description="查看园所发送的通知和公告"
  >
    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="8">
          <el-card class="stat-card unread">
            <div class="stat-content">
              <UnifiedIcon name="bell" class="stat-icon" />
              <div class="stat-info">
                <div class="stat-value">{{ unreadCount }}</div>
                <div class="stat-label">未读通知</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card class="stat-card total">
            <div class="stat-content">
              <UnifiedIcon name="message" class="stat-icon" />
              <div class="stat-info">
                <div class="stat-value">{{ totalCount }}</div>
                <div class="stat-label">全部通知</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card class="stat-card today">
            <div class="stat-content">
              <UnifiedIcon name="calendar" class="stat-icon" />
              <div class="stat-info">
                <div class="stat-value">{{ todayCount }}</div>
                <div class="stat-label">今日通知</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 分类筛选 -->
    <div class="filter-section">
      <el-card>
        <el-radio-group v-model="activeCategory" @change="handleCategoryChange">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="system">系统通知</el-radio-button>
          <el-radio-button label="announcement">园所公告</el-radio-button>
          <el-radio-button label="class">班级通知</el-radio-button>
          <el-radio-button label="activity">活动通知</el-radio-button>
        </el-radio-group>
      </el-card>
    </div>

    <!-- 通知列表 -->
    <div class="notifications-section">
      <el-card v-loading="loading">
        <template #header>
          <div class="card-header">
            <span>我的通知</span>
            <div class="header-actions">
              <el-button @click="handleMarkAllRead" :disabled="unreadCount === 0" type="primary" size="small">
                <UnifiedIcon name="check" />
                全部已读
              </el-button>
              <el-button @click="loadNotifications" size="small">
                <UnifiedIcon name="refresh" />
                刷新
              </el-button>
            </div>
          </div>
        </template>

        <div v-if="notifications.length === 0" class="empty-state">
          <el-empty description="暂无通知" />
        </div>
        <div v-else class="notification-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ 'is-read': notification.isRead }"
            @click="handleViewNotification(notification)"
          >
            <div class="notification-badge" v-if="!notification.isRead">
              <el-badge is-dot />
            </div>
            <div class="notification-icon">
              <UnifiedIcon :name="getNotificationIcon(notification.type)" />
            </div>
            <div class="notification-content">
              <div class="notification-header">
                <span class="notification-title">{{ notification.title }}</span>
                <el-tag
                  :type="getNotificationTypeTag(notification.type)"
                  size="small"
                >
                  {{ getNotificationTypeLabel(notification.type) }}
                </el-tag>
              </div>
              <div class="notification-body">
                {{ notification.content }}
              </div>
              <div class="notification-footer">
                <span class="notification-time">
                  <UnifiedIcon name="clock" />
                  {{ formatTime(notification.createdAt || notification.sendTime) }}
                </span>
                <span class="notification-sender" v-if="notification.sender || notification.senderName">
                  发送人: {{ notification.sender || notification.senderName }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-section" v-if="total > 0">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 通知详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="currentNotification?.title"
      width="600px"
      @close="handleCloseDetail"
    >
      <div class="notification-detail" v-if="currentNotification">
        <div class="detail-meta">
          <el-tag :type="getNotificationTypeTag(currentNotification.type)">
            {{ getNotificationTypeLabel(currentNotification.type) }}
          </el-tag>
          <span class="detail-time">
            <UnifiedIcon name="clock" />
            {{ formatTime(currentNotification.createdAt || currentNotification.sendTime) }}
          </span>
        </div>
        <div class="detail-sender" v-if="currentNotification.sender || currentNotification.senderName">
          <strong>发送人:</strong> {{ currentNotification.sender || currentNotification.senderName }}
        </div>
        <div class="detail-content">
          {{ currentNotification.content }}
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import {
  getNotificationList,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '@/api/modules/notification'

// 响应式数据
const loading = ref(false)
const notifications = ref<any[]>([])
const activeCategory = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const detailDialogVisible = ref(false)
const currentNotification = ref<any>(null)

// 计算属性
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.isRead && !(n.readStatus === 'read')).length
})

const totalCount = computed(() => {
  return total.value
})

const todayCount = computed(() => {
  const today = new Date().toDateString()
  return notifications.value.filter(n => {
    const notificationDate = new Date(n.createdAt || n.sendTime || '').toDateString()
    return notificationDate === today
  }).length
})

// 加载通知列表
const loadNotifications = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      type: activeCategory.value || undefined
    }
    const response = await getNotificationList(params)
    if (response.success && response.data) {
      notifications.value = (response.data.items || response.data.list || []).map((n: any) => ({
        ...n,
        isRead: n.isRead || n.readStatus === 'read' || false,
        sender: n.sender || n.senderName || ''
      }))
      total.value = response.data.total || notifications.value.length
    } else if (response.data) {
      // 兼容直接返回数组的情况
      notifications.value = (Array.isArray(response.data) ? response.data : []).map((n: any) => ({
        ...n,
        isRead: n.isRead || n.readStatus === 'read' || false,
        sender: n.sender || n.senderName || ''
      }))
      total.value = notifications.value.length
    }
  } catch (error: any) {
    console.error('加载通知失败:', error)
    ElMessage.error(error.message || '加载通知失败')
  } finally {
    loading.value = false
  }
}

// 查看通知详情
const handleViewNotification = async (notification: any) => {
  currentNotification.value = notification
  detailDialogVisible.value = true

  // 标记为已读
  if (!notification.isRead) {
    try {
      await markNotificationAsRead(notification.id)
      notification.isRead = true
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }
}

// 关闭详情对话框
const handleCloseDetail = () => {
  detailDialogVisible.value = false
  currentNotification.value = null
}

// 全部标记为已读
const handleMarkAllRead = async () => {
  try {
    await markAllNotificationsAsRead()
    notifications.value.forEach(n => n.isRead = true)
    ElMessage.success('已全部标记为已读')
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 分类变更
const handleCategoryChange = () => {
  currentPage.value = 1
  loadNotifications()
}

// 分页变更
const handlePageChange = () => {
  loadNotifications()
}

const handleSizeChange = () => {
  currentPage.value = 1
  loadNotifications()
}

// 获取通知图标
const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    system: 'setting',
    announcement: 'notification',
    class: 'school',
    activity: 'calendar'
  }
  return iconMap[type] || 'message'
}

// 获取通知类型标签
const getNotificationTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    system: 'info',
    announcement: 'warning',
    class: 'success',
    activity: 'primary'
  }
  return typeMap[type] || 'info'
}

// 获取通知类型标签文本
const getNotificationTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    system: '系统通知',
    announcement: '园所公告',
    class: '班级通知',
    activity: '活动通知'
  }
  return labelMap[type] || '通知'
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 组件挂载时加载数据
onMounted(() => {
  loadNotifications()
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.stats-section {
  margin-bottom: var(--spacing-xl);
  
  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      
      .stat-icon {
        font-size: var(--size-icon-lg);
      }
      
      .stat-info {
        .stat-value {
          font-size: var(--text-2xl);
          font-weight: var(--font-semibold);
          line-height: 1;
          margin-bottom: var(--spacing-sm);
          color: var(--text-primary);
        }
        
        .stat-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
      }
    }
    
    &.unread .stat-icon {
      color: var(--danger-color);
    }
    
    &.total .stat-icon {
      color: var(--primary-color);
    }
    
    &.today .stat-icon {
      color: var(--success-color);
    }
  }
}

.filter-section {
  margin-bottom: var(--spacing-xl);
}

.notifications-section {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }
  
  .notification-list {
    .notification-item {
      display: flex;
      gap: var(--spacing-lg);
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--border-color);
      cursor: pointer;
      transition: background-color 0.3s;
      position: relative;
      
      &:hover {
        background-color: var(--bg-hover);
      }
      
      &.is-read {
        opacity: 0.6;
      }
      
      .notification-badge {
        position: absolute;
        left: 0;
        top: var(--spacing-lg);
      }
      
      .notification-icon {
        font-size: var(--text-xl);
        color: var(--primary-color);
        flex-shrink: 0;
      }
      
      .notification-content {
        flex: 1;
        
        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
          
          .notification-title {
            font-size: var(--text-lg);
            font-weight: var(--font-medium);
            color: var(--text-primary);
          }
        }
        
        .notification-body {
          color: var(--text-secondary);
          margin-bottom: var(--spacing-sm);
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .notification-footer {
          display: flex;
          justify-content: space-between;
          font-size: var(--text-xs);
          color: var(--text-muted);
          
          .notification-time {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
          }
        }
      }
    }
  }
  
  .pagination-section {
    margin-top: var(--spacing-xl);
    display: flex;
    justify-content: center;
  }
  
  .empty-state {
    padding: var(--spacing-3xl);
    text-align: center;
  }
}

.notification-detail {
  .detail-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
    
    .detail-time {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      color: var(--text-secondary);
    }
  }
  
  .detail-sender {
    margin-bottom: var(--spacing-lg);
    color: var(--text-regular);
  }
  
  .detail-content {
    line-height: 1.8;
    white-space: pre-wrap;
    color: var(--text-primary);
  }
}
</style>

