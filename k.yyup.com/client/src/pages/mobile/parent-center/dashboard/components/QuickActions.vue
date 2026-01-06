<template>
  <div class="quick-actions">
    <van-grid :column-num="4" :gutter="12">
      <van-grid-item
        v-for="action in quickActions"
        :key="action.type"
        @click="$emit('action-click', action.type)"
      >
        <div class="action-card" :class="`action-${action.type}`">
          <div class="action-icon">
            <van-icon :name="action.icon" :color="action.color" size="24" />
          </div>
          <div class="action-title">{{ action.title }}</div>
          <div class="action-desc">{{ action.description }}</div>
          <van-badge
            v-if="action.badge"
            :content="action.badge"
            :max="99"
            class="action-badge"
          />
        </div>
      </van-grid-item>
    </van-grid>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface QuickAction {
  type: string
  icon: string
  title: string
  description: string
  color?: string
  badge?: number | string
}

interface Props {
  actions?: QuickAction[]
  clockInStatus?: boolean
  notificationsCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  actions: () => [],
  clockInStatus: false,
  notificationsCount: 0
})

const emit = defineEmits<{
  'action-click': [type: string]
}>()

const quickActions = computed<QuickAction[]>(() => {
  const defaultActions: QuickAction[] = [
    {
      type: 'view-children',
      icon: 'friends-o',
      title: '我的孩子',
      description: '查看孩子信息',
      color: '#409EFF'
    },
    {
      type: 'activities',
      icon: 'calendar-o',
      title: '活动报名',
      description: '浏览活动',
      color: '#67C23A',
      badge: props.notificationsCount || undefined
    },
    {
      type: 'communication',
      icon: 'chat-o',
      title: '师生沟通',
      description: '消息中心',
      color: '#E6A23C'
    },
    {
      type: 'growth-records',
      icon: 'chart-trending-o',
      title: '成长记录',
      description: '查看成长',
      color: '#F56C6C'
    }
  ]

  // 如果提供了自定义actions则使用自定义的，否则使用默认的
  return props.actions.length > 0 ? props.actions : defaultActions
})
</script>

<style lang="scss" scoped>
.quick-actions {
  margin: var(--van-padding-sm) 0;
  padding: 0 var(--van-padding-md);

  .action-card {
    position: relative;
    background: var(--van-background-color-light);
    border-radius: var(--van-border-radius-lg);
    padding: var(--van-padding-md);
    text-align: center;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    &:active {
      transform: scale(0.95);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }

    .action-icon {
      margin-bottom: var(--van-padding-xs);

      .van-icon {
        font-size: var(--text-2xl);
      }
    }

    .action-title {
      font-size: var(--van-font-size-sm);
      font-weight: var(--van-font-weight-bold);
      color: var(--van-text-color);
      margin-bottom: 2px;
      line-height: 1.2;
    }

    .action-desc {
      font-size: var(--van-font-size-xs);
      color: var(--van-text-color-2);
      line-height: 1.2;
    }

    .action-badge {
      position: absolute;
      top: -4px;
      right: -4px;

      :deep(.van-badge) {
        border: 2px solid var(--van-background-color-light);
      }
    }

    // 特定动作的样式
    &.action-view-children {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    }

    &.action-activities {
      background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
    }

    &.action-communication {
      background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    }

    &.action-growth-records {
      background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .quick-actions {
    .action-card {
      background: var(--van-background-color-dark);

      &.action-view-children {
        background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
      }

      &.action-activities {
        background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
      }

      &.action-communication {
        background: linear-gradient(135deg, #ef6c00 0%, #e65100 100%);
      }

      &.action-growth-records {
        background: linear-gradient(135deg, #c2185b 0%, #880e4f 100%);
      }

      .action-title {
        color: var(--van-text-color);
      }

      .action-desc {
        color: var(--van-text-color-2);
      }

      .action-badge {
        :deep(.van-badge) {
          border-color: var(--van-background-color-dark);
        }
      }
    }
  }
}

// 小屏幕适配
@media (max-width: 375px) {
  .quick-actions {
    padding: 0 var(--van-padding-sm);

    .action-card {
      padding: var(--van-padding-sm);

      .action-title {
        font-size: var(--van-font-size-xs);
      }

      .action-desc {
        font-size: 10px;
      }
    }
  }
}

// 大屏幕适配
@media (min-width: 768px) {
  .quick-actions {
    max-width: 600px;
    margin: var(--van-padding-md) auto;
    padding: 0;
  }
}
</style>