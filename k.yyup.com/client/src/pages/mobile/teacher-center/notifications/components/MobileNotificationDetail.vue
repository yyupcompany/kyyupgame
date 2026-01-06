<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '90%' }"
    round
    safe-area-inset-bottom
  >
    <div class="mobile-notification-detail">
      <!-- 头部 -->
      <div class="detail-header">
        <div class="header-nav">
          <van-nav-bar
            title="通知详情"
            :left-arrow="true"
            @click-left="handleClose"
          >
            <template #right>
              <van-button
                size="small"
                type="danger"
                plain
                @click="handleDelete"
              >
                删除
              </van-button>
            </template>
          </van-nav-bar>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="detail-content" v-if="notification">
        <!-- 通知基本信息 -->
        <div class="notification-info">
          <div class="info-header">
            <h2 class="notification-title">{{ notification.title }}</h2>
            <div class="notification-meta">
              <van-tag
                :type="getPriorityType(notification.priority)"
                size="small"
              >
                {{ getPriorityText(notification.priority) }}
              </van-tag>
              <van-tag
                :type="getCategoryType(notification.type)"
                size="small"
              >
                {{ getCategoryText(notification.type) }}
              </van-tag>
              <van-tag
                v-if="!notification.is_read"
                type="warning"
                size="small"
              >
                未读
              </van-tag>
            </div>
          </div>

          <div class="info-time">
            <van-icon name="clock-o" />
            <span>{{ formatDateTime(notification.created_at) }}</span>
          </div>
        </div>

        <!-- 通知内容 -->
        <div class="notification-body">
          <van-cell-group inset title="通知内容">
            <van-cell>
              <div class="content-text">
                {{ notification.content }}
              </div>
            </van-cell>
          </van-cell-group>

          <!-- 附件 -->
          <van-cell-group
            v-if="notification.attachments && notification.attachments.length > 0"
            inset
            title="附件"
          >
            <van-cell
              v-for="attachment in notification.attachments"
              :key="attachment.id"
              :title="attachment.name"
              :label="formatFileSize(attachment.size)"
              is-link
              @click="downloadAttachment(attachment)"
            >
              <template #right-icon>
                <van-icon name="arrow" />
              </template>
            </van-cell>
          </van-cell-group>

          <!-- 详细信息 -->
          <van-cell-group inset title="详细信息">
            <van-cell title="发送者" :value="notification.sender_name || '系统'" />
            <van-cell
              title="发送时间"
              :value="formatDateTime(notification.created_at)"
            />
            <van-cell title="通知类型" :value="getCategoryText(notification.type)" />
            <van-cell title="优先级" :value="getPriorityText(notification.priority)" />
            <van-cell title="状态">
              <template #value>
                <van-tag
                  :type="notification.is_read ? 'success' : 'warning'"
                  size="small"
                >
                  {{ notification.is_read ? '已读' : '未读' }}
                </van-tag>
              </template>
            </van-cell>
            <van-cell
              title="阅读时间"
              :value="notification.read_at ? formatDateTime(notification.read_at) : '未读'"
            />
          </van-cell-group>

          <!-- 操作记录 -->
          <van-cell-group
            v-if="notification.actions && notification.actions.length > 0"
            inset
            title="操作记录"
          >
            <van-steps direction="vertical" :active="notification.actions.length">
              <van-step
                v-for="action in notification.actions"
                :key="action.id"
                :title="action.title"
                :description="action.description"
              >
                <template #inactive-icon>
                  <van-icon name="clock-o" />
                </template>
              </van-step>
            </van-steps>
          </van-cell-group>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="detail-footer" v-if="notification">
        <van-button
          block
          round
          :type="notification.is_read ? 'warning' : 'success'"
          @click="handleToggleRead"
        >
          {{ notification.is_read ? '标记未读' : '标记已读' }}
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { showToast } from 'vant'

interface Attachment {
  id: number
  name: string
  url: string
  size: number
}

interface Action {
  id: number
  title: string
  description: string
  created_at: string
}

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
  attachments?: Attachment[]
  actions?: Action[]
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

const downloadAttachment = (attachment: Attachment) => {
  try {
    // 创建下载链接
    const link = document.createElement('a')
    link.href = attachment.url || ''
    link.download = attachment.name || '附件'

    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToast('下载已开始')
  } catch (error) {
    console.error('下载附件失败:', error)
    showToast('下载失败')
  }
}

// 工具方法
const getPriorityType = (priority: string) => {
  const typeMap: Record<string, string> = {
    urgent: 'danger',
    important: 'warning',
    normal: 'primary'
  }
  return typeMap[priority] || 'primary'
}

const getPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    urgent: '紧急',
    important: '重要',
    normal: '普通'
  }
  return textMap[priority] || '普通'
}

const getCategoryType = (type: string) => {
  const typeMap: Record<string, string> = {
    system: 'primary',
    announcement: 'success',
    class: 'warning',
    personal: 'danger'
  }
  return typeMap[type] || 'primary'
}

const getCategoryText = (type: string) => {
  const textMap: Record<string, string> = {
    system: '系统通知',
    announcement: '园区公告',
    class: '班级通知',
    personal: '个人消息'
  }
  return textMap[type] || '系统通知'
}

const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + ' KB'
  } else {
    return (size / (1024 * 1024)).toFixed(1) + ' MB'
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-notification-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--van-background-color-light);

  .detail-header {
    .header-nav {
      :deep(.van-nav-bar) {
        background: var(--card-bg);
        box-shadow: 0 2px 12px rgba(100, 101, 102, 0.08);
      }
    }
  }

  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 0 80px 0;

    .notification-info {
      background: var(--card-bg);
      padding: var(--spacing-md);
      margin-bottom: 12px;

      .info-header {
        margin-bottom: 12px;

        .notification-title {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--van-text-color-1);
          margin: 0 0 8px 0;
          line-height: 1.4;
        }

        .notification-meta {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
      }

      .info-time {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-xs);
        color: var(--van-text-color-3);
      }
    }

    .notification-body {
      .content-text {
        font-size: var(--text-sm);
        line-height: 1.6;
        color: var(--van-text-color-2);
        white-space: pre-wrap;
      }

      :deep(.van-cell-group) {
        margin-bottom: 12px;
      }

      :deep(.van-steps) {
        padding: var(--spacing-md);
      }
    }
  }

  .detail-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: var(--spacing-md) 16px;
    background: var(--card-bg);
    box-shadow: 0 -2px 12px rgba(100, 101, 102, 0.08);
    border-bottom: constant(safe-area-inset-bottom);
    border-bottom: env(safe-area-inset-bottom);
  }
}

// 响应式适配
@media (max-width: 375px) {
  .mobile-notification-detail {
    .detail-content {
      .notification-info {
        padding: var(--spacing-md);

        .info-header {
          .notification-title {
            font-size: var(--text-base);
          }
        }
      }
    }

    .detail-footer {
      padding: var(--spacing-sm) 12px;
    }
  }
}
</style>