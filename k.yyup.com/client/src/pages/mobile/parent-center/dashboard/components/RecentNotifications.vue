<template>
  <div class="recent-notifications">
    <van-cell-group inset>
      <van-cell
        v-for="notification in notifications"
        :key="notification.id"
        :title="notification.title"
        :label="notification.content"
        :value="formatTime(notification.createdAt)"
        :is-link="true"
        @click="$emit('notification-click', notification)"
        :class="{ 'unread': !notification.read }"
      >
        <template #icon>
          <van-icon
            :name="getNotificationIcon(notification.type)"
            :color="getNotificationColor(notification.type)"
            size="20"
            style="margin-right: 12px"
          />
        </template>

        <template #right-icon>
          <van-badge
            v-if="!notification.read"
            dot
            color="#1989fa"
          />
          <van-icon name="arrow" size="16" color="#c8c9cc" />
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 查看更多 -->
    <div v-if="showMore" class="view-more">
      <van-button
        type="primary"
        plain
        size="small"
        block
        @click="$emit('view-more')"
        :loading="loading"
      >
        查看全部通知
      </van-button>
    </div>

    <!-- 空状态 -->
    <van-empty
      v-if="!loading && notifications.length === 0"
      description="暂无通知"
      :image="emptyImage"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Notification {
  id: string | number
  title: string
  content: string
  type: string
  read: boolean
  createdAt: string | Date
  priority?: 'high' | 'medium' | 'low'
}

interface Props {
  notifications: Notification[]
  loading?: boolean
  showMore?: boolean
  maxItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showMore: true,
  maxItems: 5
})

const emit = defineEmits<{
  'notification-click': [notification: Notification]
  'view-more': []
}>()

// 显示的通知列表（限制数量）
const displayNotifications = computed(() => {
  return props.notifications.slice(0, props.maxItems)
})

// 获取通知图标
const getNotificationIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'activity': 'calendar-o',
    'message': 'chat-o',
    'system': 'info-o',
    'warning': 'warning-o',
    'success': 'success',
    'growth': 'chart-trending-o',
    'homework': 'edit',
    'exam': 'medal-o',
    'health': 'hospital-o',
    'safety': 'shield-o'
  }
  return iconMap[type] || 'bell'
}

// 获取通知颜色
const getNotificationColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    'activity': '#409EFF',
    'message': '#67C23A',
    'system': '#909399',
    'warning': '#E6A23C',
    'success': '#67C23A',
    'growth': '#F56C6C',
    'homework': '#909399',
    'exam': '#E6A23C',
    'health': '#F56C6C',
    'safety': '#F56C6C'
  }
  return colorMap[type] || '#909399'
}

// 格式化时间
const formatTime = (time: string | Date): string => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 一小时内显示"刚刚"
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return minutes < 1 ? '刚刚' : `${minutes}分钟前`
  }

  // 一天内显示"X小时前"
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}小时前`
  }

  // 一周内显示"X天前"
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}天前`
  }

  // 超过一周显示具体日期
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
}

// 空状态图片
const emptyImage = 'https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png'
</script>

<style lang="scss" scoped>
.recent-notifications {
  margin: var(--van-padding-md) 0;

  .unread {
    background: linear-gradient(90deg, #f0f9ff 0%, transparent 100%);

    .van-cell__title {
      font-weight: var(--van-font-weight-bold);
      color: var(--van-text-color);
    }
  }

  .van-cell {
    transition: all 0.3s ease;

    &:active {
      background-color: var(--van-cell-active-color);
    }

    .van-cell__title {
      font-size: var(--van-font-size-md);
      font-weight: var(--van-font-weight-medium);
      color: var(--van-text-color);
      margin-bottom: 4px;
      line-height: 1.3;
    }

    .van-cell__label {
      font-size: var(--van-font-size-sm);
      color: var(--van-text-color-2);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .van-cell__value {
      font-size: var(--van-font-size-xs);
      color: var(--van-text-color-3);
      white-space: nowrap;
    }
  }

  .view-more {
    padding: var(--van-padding-md) var(--van-padding-md) 0;

    .van-button {
      height: 40px;
      border-radius: var(--van-border-radius-lg);
      font-size: var(--van-font-size-sm);
    }
  }

  .van-empty {
    padding: var(--van-padding-xl) 0;

    :deep(.van-empty__description) {
      font-size: var(--van-font-size-sm);
      color: var(--van-text-color-2);
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .recent-notifications {
    .unread {
      background: linear-gradient(90deg, #1a3a52 0%, transparent 100%);
    }

    .van-cell {
      .van-cell__title {
        color: var(--van-text-color);
      }

      .van-cell__label {
        color: var(--van-text-color-2);
      }

      .van-cell__value {
        color: var(--van-text-color-3);
      }
    }
  }
}

// 小屏幕适配
@media (max-width: 375px) {
  .recent-notifications {
    margin: var(--van-padding-sm) 0;

    .van-cell {
      .van-cell__title {
        font-size: var(--van-font-size-sm);
      }

      .van-cell__label {
        font-size: var(--van-font-size-xs);
      }

      .van-cell__value {
        font-size: 10px;
      }
    }
  }
}

// 大屏幕适配
@media (min-width: 768px) {
  .recent-notifications {
    max-width: 600px;
    margin: var(--van-padding-md) auto;
  }
}
</style>