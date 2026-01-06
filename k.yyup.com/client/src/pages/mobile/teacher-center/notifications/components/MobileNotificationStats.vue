<template>
  <div class="mobile-notification-stats">
    <div class="stats-grid">
      <div
        v-for="stat in statsData"
        :key="stat.key"
        class="stat-card"
        :class="[stat.type]"
        @click="handleStatClick(stat)"
      >
        <div class="stat-icon">
          <van-icon :name="stat.icon" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface StatItem {
  key: string
  label: string
  value: number
  icon: string
  type: 'unread' | 'total' | 'today'
  color: string
}

interface Props {
  unread: number
  total: number
  today: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  statClick: [stat: StatItem]
}>()

const statsData = computed<StatItem[]>(() => [
  {
    key: 'unread',
    label: '未读消息',
    value: props.unread,
    icon: 'bell',
    type: 'unread',
    color: '#ee0a24'
  },
  {
    key: 'total',
    label: '总消息',
    value: props.total,
    icon: 'chat-o',
    type: 'total',
    color: '#1989fa'
  },
  {
    key: 'today',
    label: '今日消息',
    value: props.today,
    icon: 'calendar-o',
    type: 'today',
    color: '#07c160'
  }
])

const handleStatClick = (stat: StatItem) => {
  emit('statClick', stat)
}
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-notification-stats {
  padding: var(--spacing-md) 16px;
  background: var(--van-background-color-light);

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-md);
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--spacing-md) 8px;
    border-radius: 12px;
    background: var(--card-bg);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    cursor: pointer;

    &:active {
      transform: scale(0.95);
    }

    &.unread {
      background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%);
      color: white;

      .stat-icon {
        background: rgba(255, 255, 255, 0.2);
      }

      .stat-label {
        color: rgba(255, 255, 255, 0.9);
      }
    }

    &.total {
      background: linear-gradient(135deg, #3742fa 0%, #5352ed 100%);
      color: white;

      .stat-icon {
        background: rgba(255, 255, 255, 0.2);
      }

      .stat-label {
        color: rgba(255, 255, 255, 0.9);
      }
    }

    &.today {
      background: linear-gradient(135deg, #26de81 0%, #20bf6b 100%);
      color: white;

      .stat-icon {
        background: rgba(255, 255, 255, 0.2);
      }

      .stat-label {
        color: rgba(255, 255, 255, 0.9);
      }
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      font-size: var(--text-xl);
      background: var(--van-primary-color-light-9);
      color: var(--van-primary-color);
    }

    .stat-content {
      text-align: center;

      .stat-value {
        font-size: var(--text-2xl);
        font-weight: 700;
        margin-bottom: 4px;
        line-height: 1;
      }

      .stat-label {
        font-size: var(--text-xs);
        color: var(--van-text-color-2);
      }
    }
  }
}

// 响应式适配
@media (max-width: 375px) {
  .mobile-notification-stats {
    .stats-grid {
      gap: var(--spacing-sm);
    }

    .stat-card {
      padding: var(--spacing-md) 6px;

      .stat-icon {
        width: 32px;
        height: 32px;
        font-size: var(--text-lg);
      }

      .stat-content {
        .stat-value {
          font-size: var(--text-xl);
        }

        .stat-label {
          font-size: 11px;
        }
      }
    }
  }
}
</style>