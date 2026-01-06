<template>
  <el-dialog
    v-model="visible"
    title="通知详情"
    width="700px"
    :close-on-click-modal="false"
  >
    <div v-if="notification" class="notification-detail">
      <!-- 通知头部 -->
      <div class="notification-header">
        <div class="header-left">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-meta">
            <el-tag :type="getPriorityType(notification.priority)" size="small">
              {{ getPriorityText(notification.priority) }}
            </el-tag>
            <el-tag :type="getCategoryType(notification.type)" size="small">
              {{ getCategoryText(notification.type) }}
            </el-tag>
            <span class="notification-time">{{ formatDateTime(notification.created_at) }}</span>
          </div>
        </div>
        <div class="header-right">
          <el-badge v-if="!notification.is_read" is-dot type="danger" />
        </div>
      </div>

      <!-- 通知内容 -->
      <div class="notification-content">
        <div class="content-text">{{ notification.content }}</div>
        
        <!-- 附件（如果有） -->
        <div v-if="notification.attachments && notification.attachments.length > 0" class="attachments">
          <el-divider content-position="left">附件</el-divider>
          <div class="attachment-list">
            <div 
              v-for="attachment in notification.attachments" 
              :key="attachment.id"
              class="attachment-item"
            >
              <el-icon><Document /></el-icon>
              <span class="attachment-name">{{ attachment.name }}</span>
              <el-button size="small" text type="primary" @click="downloadAttachment(attachment)">
                下载
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 通知详细信息 -->
      <div class="notification-info">
        <el-divider content-position="left">详细信息</el-divider>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="发送者">
            {{ notification.sender_name || '系统' }}
          </el-descriptions-item>
          <el-descriptions-item label="发送时间">
            {{ formatDateTime(notification.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="通知类型">
            {{ getCategoryText(notification.type) }}
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            {{ getPriorityText(notification.priority) }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="notification.is_read ? 'success' : 'warning'" size="small">
              {{ notification.is_read ? '已读' : '未读' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="阅读时间">
            {{ notification.read_at ? formatDateTime(notification.read_at) : '未读' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 相关操作记录（如果有） -->
      <div v-if="notification.actions && notification.actions.length > 0" class="notification-actions">
        <el-divider content-position="left">操作记录</el-divider>
        <el-timeline>
          <el-timeline-item
            v-for="action in notification.actions"
            :key="action.id"
            :timestamp="formatDateTime(action.created_at)"
            placement="top"
          >
            <div class="action-content">
              <div class="action-title">{{ action.title }}</div>
              <div class="action-description">{{ action.description }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button 
          :type="notification?.is_read ? 'warning' : 'success'"
          @click="handleToggleRead"
        >
          {{ notification?.is_read ? '标记未读' : '标记已读' }}
        </el-button>
        <el-button type="danger" @click="handleDelete">删除</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'

interface Notification {
  id: number
  title: string
  content: string
  type: string
  priority: string
  is_read: boolean
  created_at: string
  read_at?: string
  sender_name?: string
  attachments?: Array<{
    id: number
    name: string
    url: string
    size: number
  }>
  actions?: Array<{
    id: number
    title: string
    description: string
    created_at: string
  }>
}

interface Props {
  modelValue: boolean
  notification?: Notification | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'read', notification: Notification): void
  (e: 'delete', notification: Notification): void
}

const props = withDefaults(defineProps<Props>(), {
  notification: null
})

const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleClose = () => {
  visible.value = false
}

const handleToggleRead = () => {
  if (props.notification) {
    emit('read', props.notification)
  }
}

const handleDelete = () => {
  if (props.notification) {
    emit('delete', props.notification)
    visible.value = false
  }
}

const downloadAttachment = (attachment: any) => {
  // TODO: 实现附件下载功能
  ElMessage.info('下载功能开发中...')
}

// 工具方法
const getPriorityType = (priority: string) => {
  const typeMap = {
    'urgent': 'danger',
    'important': 'warning',
    'normal': 'info'
  }
  return typeMap[priority] || 'info'
}

const getPriorityText = (priority: string) => {
  const textMap = {
    'urgent': '紧急',
    'important': '重要',
    'normal': '普通'
  }
  return textMap[priority] || '普通'
}

const getCategoryType = (type: string) => {
  const typeMap = {
    'system': 'info',
    'announcement': 'primary',
    'class': 'success',
    'personal': 'warning'
  }
  return typeMap[type] || 'info'
}

const getCategoryText = (type: string) => {
  const textMap = {
    'system': '系统通知',
    'announcement': '园区公告',
    'class': '班级通知',
    'personal': '个人消息'
  }
  return textMap[type] || '系统通知'
}

const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}
</script>

<style lang="scss" scoped>
.notification-detail {
  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--text-3xl);
    padding-bottom: var(--text-lg);
    border-bottom: var(--border-width-base) solid var(--bg-gray-light);
    
    .header-left {
      flex: 1;
      
      .notification-title {
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
      }
      
      .notification-meta {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        flex-wrap: wrap;
        
        .notification-time {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
      }
    }
    
    .header-right {
      margin-left: var(--text-lg);
    }
  }
  
  .notification-content {
    margin-bottom: var(--text-3xl);
    
    .content-text {
      font-size: var(--text-base);
      line-height: 1.6;
      color: var(--color-gray-700);
      white-space: pre-wrap;
      margin-bottom: var(--text-lg);
    }
    
    .attachments {
      .attachment-list {
        .attachment-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--text-sm);
          background-color: #f9fafb;
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-sm);
          
          .attachment-name {
            flex: 1;
            font-size: var(--text-base);
            color: var(--color-gray-700);
          }
        }
      }
    }
  }
  
  .notification-info {
    margin-bottom: var(--text-3xl);
  }
  
  .notification-actions {
    .action-content {
      .action-title {
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: var(--spacing-xs);
      }
      
      .action-description {
        font-size: var(--text-base);
        color: var(--text-secondary);
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto;
  }
  
  .notification-header {
    .notification-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-xs);
    }
  }
}
</style>
