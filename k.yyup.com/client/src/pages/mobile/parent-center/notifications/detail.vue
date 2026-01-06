<template>
  <MobileMainLayout
    title="通知详情"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <div v-if="loading" class="loading-container">
      <van-loading size="24px" vertical>加载中...</van-loading>
    </div>

    <div v-else-if="notification" class="notification-detail">
      <!-- 通知头部信息 -->
      <div class="notification-header">
        <div class="header-top">
          <van-tag
            :type="getTypeTagType(notification.type)"
            size="small"
          >
            {{ getTypeLabel(notification.type) }}
          </van-tag>
          <van-tag
            v-if="notification.priority === 'high'"
            type="danger"
            size="small"
            class="ml-2"
          >
            重要
          </van-tag>
          <div class="notification-time">
            {{ formatDateTime(notification.createdAt) }}
          </div>
        </div>

        <h1 class="notification-title">{{ notification.title }}</h1>

        <div class="sender-info" v-if="notification.senderName">
          <van-image
            :src="notification.senderAvatar || '/default-avatar.png'"
            width="32"
            height="32"
            round
          />
          <div class="sender-details">
            <div class="sender-name">{{ notification.senderName }}</div>
            <div class="sender-role">{{ notification.senderRole || '发送者' }}</div>
          </div>
        </div>
      </div>

      <!-- 通知内容 -->
      <div class="notification-content">
        <div class="content-text" v-html="formatContent(notification.message)"></div>
      </div>

      <!-- 附件列表 -->
      <div v-if="notification.attachments && notification.attachments.length > 0" class="attachments-section">
        <h3 class="section-title">附件</h3>
        <div class="attachments-list">
          <div
            v-for="attachment in notification.attachments"
            :key="attachment.id"
            class="attachment-item"
            @click="downloadAttachment(attachment)"
          >
            <div class="attachment-icon">
              <van-icon :name="getAttachmentIcon(attachment.name)" size="24" />
            </div>
            <div class="attachment-info">
              <div class="attachment-name">{{ attachment.name }}</div>
              <div class="attachment-size">{{ formatFileSize(attachment.size) }}</div>
            </div>
            <van-icon name="arrow" size="16" color="#969799" />
          </div>
        </div>
      </div>

      <!-- 阅读状态 -->
      <div class="read-status">
        <div class="status-info">
          <van-icon name="eye-o" size="16" />
          <span>已读 {{ notification.readCount }} 人</span>
        </div>
        <div class="total-recipients">
          总计 {{ notification.totalRecipients }} 人
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button
          v-if="!notification.read"
          type="primary"
          size="large"
          block
          @click="markAsRead"
        >
          标记为已读
        </van-button>

        <van-button
          type="default"
          size="large"
          block
          @click="shareNotification"
        >
          <van-icon name="share-o" />
          分享通知
        </van-button>
      </div>

      <!-- 相关通知 -->
      <div v-if="relatedNotifications.length > 0" class="related-notifications">
        <h3 class="section-title">相关通知</h3>
        <div class="related-list">
          <div
            v-for="related in relatedNotifications"
            :key="related.id"
            class="related-item"
            @click="viewRelatedNotification(related)"
          >
            <div class="related-content">
              <h4 class="related-title">{{ related.title }}</h4>
              <p class="related-message">{{ related.message }}</p>
              <div class="related-meta">
                <span class="related-type">{{ getTypeLabel(related.type) }}</span>
                <span class="related-time">{{ formatDateTime(related.createdAt) }}</span>
              </div>
            </div>
            <div class="related-dot" v-if="!related.read"></div>
          </div>
        </div>
      </div>
    </div>

    <van-empty
      v-else
      description="通知不存在或已被删除"
      image="error"
    >
      <van-button
        type="primary"
        @click="goBack"
      >
        返回列表
      </van-button>
    </van-empty>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import {
  getNotificationDetail,
  markNotificationAsRead
} from '@/api/modules/notification'

// 通知详情接口
interface NotificationDetail {
  id: string
  title: string
  message: string
  type: string
  priority: string
  read: boolean
  readCount: number
  totalRecipients: number
  createdAt: string
  updatedAt: string
  senderId: string
  senderName?: string
  senderRole?: string
  senderAvatar?: string
  attachments?: Array<{
    id: string
    name: string
    url: string
    size: number
  }>
}

// 响应式数据
const router = useRouter()
const route = useRoute()
const loading = ref(true)
const notification = ref<NotificationDetail | null>(null)
const relatedNotifications = ref<any[]>([])

// 通知类型映射
const notificationTypes = [
  { value: 'announcement', label: '公告通知' },
  { value: 'activity', label: '活动通知' },
  { value: 'homework', label: '作业通知' },
  { value: 'holiday', label: '假期通知' },
  { value: 'emergency', label: '紧急通知' },
  { value: 'health', label: '健康提醒' }
]

// 方法
const loadNotificationDetail = async () => {
  try {
    loading.value = true
    const notificationId = route.query.id as string

    if (!notificationId) {
      showToast('通知ID不存在')
      goBack()
      return
    }

    // 这里可以调用真实的API
    // const response = await getNotificationDetail(notificationId)
    // notification.value = response.data

    // 模拟数据
    notification.value = {
      id: notificationId,
      title: '本周家长会通知',
      message: '尊敬的各位家长：<br><br>定于本周五（11月24日）下午2点在幼儿园多功能厅召开本学期第一次家长会。会议议程如下：<br><br>1. 园长致辞（15分钟）<br>2. 本学期教学工作总结（20分钟）<br>3. 幼儿发展情况分析（25分钟）<br>4. 家园配合事项说明（15分钟）<br>5. 互动交流环节（30分钟）<br><br>请各位家长准时参加，如有特殊情况不能出席，请提前与班主任联系。<br><br>感谢您的配合！',
      type: 'announcement',
      priority: 'high',
      read: false,
      readCount: 25,
      totalRecipients: 30,
      createdAt: '2024-11-18 09:00:00',
      updatedAt: '2024-11-18 09:00:00',
      senderId: 'teacher1',
      senderName: '王老师',
      senderRole: '班主任',
      senderAvatar: 'https://via.placeholder.com/32',
      attachments: [
        {
          id: '1',
          name: '家长会议程.pdf',
          url: '#',
          size: 1024000
        },
        {
          id: '2',
          name: '会议须知.docx',
          url: '#',
          size: 512000
        }
      ]
    }

    // 加载相关通知
    loadRelatedNotifications(notificationId)
  } catch (error) {
    console.error('加载通知详情失败:', error)
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

const loadRelatedNotifications = (currentId: string) => {
  // 模拟相关通知数据
  relatedNotifications.value = [
    {
      id: '2',
      title: '幼儿园开放日活动安排',
      message: '本月底将举办幼儿园开放日活动，邀请家长参观...',
      type: 'activity',
      read: true,
      createdAt: '2024-11-15 10:00:00'
    },
    {
      id: '3',
      title: '本周重点活动安排',
      message: '本周将开展户外探索活动和手工制作课程...',
      type: 'activity',
      read: false,
      createdAt: '2024-11-17 14:30:00'
    }
  ]
}

const markAsRead = async () => {
  if (!notification.value) return

  try {
    await markNotificationAsRead(notification.value.id)
    notification.value.read = true
    showToast('已标记为已读')
  } catch (error) {
    showToast('标记失败')
  }
}

// shareNotification function removed due to Vant API changes

const downloadAttachment = (attachment: any) => {
  showToast(`开始下载: ${attachment.name}`)
  // 这里可以实现文件下载逻辑
}

const viewRelatedNotification = (related: any) => {
  router.push(`/mobile/parent-center/notifications/detail?id=${related.id}`)
}

const goBack = () => {
  router.back()
}

const formatContent = (content: string) => {
  // 将换行符转换为HTML换行标签
  return content.replace(/\n/g, '<br>')
}

const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  } else {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }
}

const getTypeLabel = (type: string) => {
  const typeObj = notificationTypes.find(t => t.value === type)
  return typeObj ? typeObj.label : type
}

const getTypeTagType = (type: string) => {
  const types: Record<string, string> = {
    announcement: 'primary',
    activity: 'success',
    homework: 'warning',
    holiday: 'default',
    emergency: 'danger',
    health: 'warning'
  }
  return types[type] || 'default'
}

const getAttachmentIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const iconMap: Record<string, string> = {
    'pdf': 'description',
    'doc': 'description',
    'docx': 'description',
    'xls': 'table-view',
    'xlsx': 'table-view',
    'ppt': 'photo',
    'pptx': 'photo',
    'jpg': 'photo',
    'jpeg': 'photo',
    'png': 'photo',
    'gif': 'photo',
    'zip': 'zip',
    'rar': 'zip'
  }
  return iconMap[ext || ''] || 'description'
}

// 生命周期
onMounted(() => {
  loadNotificationDetail()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.notification-detail {
  padding: var(--spacing-md);
  background: var(--card-bg);
  min-height: calc(100vh - 46px);

  .notification-header {
    margin-bottom: 24px;

    .header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      .notification-time {
        font-size: var(--text-xs);
        color: #969799;
      }
    }

    .notification-title {
      font-size: var(--text-xl);
      font-weight: 600;
      color: #323233;
      line-height: 1.4;
      margin: 0 0 16px 0;
    }

    .sender-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: var(--app-bg-color);
      border-radius: 8px;

      .sender-details {
        flex: 1;

        .sender-name {
          font-size: var(--text-sm);
          font-weight: 500;
          color: #323233;
          margin-bottom: 4px;
        }

        .sender-role {
          font-size: var(--text-xs);
          color: #969799;
        }
      }
    }
  }

  .notification-content {
    margin-bottom: 24px;

    .content-text {
      font-size: var(--text-base);
      line-height: 1.6;
      color: #323233;
      padding: var(--spacing-md);
      background: var(--app-bg-color);
      border-radius: 8px;
      border-left: 4px solid #409eff;
    }
  }

  .attachments-section {
    margin-bottom: 24px;

    .section-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: #323233;
      margin: 0 0 12px 0;
    }

    .attachments-list {
      .attachment-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: var(--app-bg-color);
        border-radius: 8px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:active {
          background: #ebedf0;
        }

        .attachment-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: var(--card-bg);
          border-radius: 8px;
          color: var(--primary-color);
        }

        .attachment-info {
          flex: 1;

          .attachment-name {
            font-size: var(--text-sm);
            font-weight: 500;
            color: #323233;
            margin-bottom: 4px;
            word-break: break-all;
          }

          .attachment-size {
            font-size: var(--text-xs);
            color: #969799;
          }
        }
      }
    }
  }

  .read-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) 16px;
    background: #f0f9ff;
    border-radius: 8px;
    margin-bottom: 24px;

    .status-info {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: var(--text-sm);
      color: #323233;
    }

    .total-recipients {
      font-size: var(--text-xs);
      color: #969799;
    }
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    margin-bottom: 32px;

    .van-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
    }
  }

  .related-notifications {
    .section-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: #323233;
      margin: 0 0 12px 0;
    }

    .related-list {
      .related-item {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: var(--app-bg-color);
        border-radius: 8px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:active {
          background: #ebedf0;
        }

        .related-content {
          flex: 1;
          min-width: 0;

          .related-title {
            font-size: var(--text-sm);
            font-weight: 500;
            color: #323233;
            margin: 0 0 4px 0;
            line-height: 1.4;
          }

          .related-message {
            font-size: var(--text-xs);
            color: #646566;
            line-height: 1.4;
            margin: 0 0 8px 0;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .related-meta {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);

            .related-type {
              font-size: 10px;
              padding: 2px 6px;
              background: #e1f3d8;
              color: #52c41a;
              border-radius: 4px;
            }

            .related-time {
              font-size: 11px;
              color: #969799;
            }
          }
        }

        .related-dot {
          width: 8px;
          height: 8px;
          background: var(--primary-color);
          border-radius: 50%;
          margin-top: 4px;
          flex-shrink: 0;
        }
      }
    }
  }
}

.ml-2 {
  margin-left: 8px;
}
</style>