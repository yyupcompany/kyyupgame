<template>
  <div class="notification-stats-card" @click="$emit('click')">
    <van-loading v-if="loading" type="spinner" color="#409eff" />
    <div v-else class="card-content">
      <div class="card-header">
        <van-icon name="bell-o" size="24" color="#ff976a" />
        <span class="card-title">通知消息</span>
        <van-badge
          v-if="stats.unread > 0"
          :content="stats.unread > 99 ? '99+' : stats.unread.toString()"
          :show-zero="false"
        />
      </div>

      <div class="stats-main">
        <div class="unread-stats">
          <div class="unread-number">{{ stats.unread }}</div>
          <div class="unread-label">未读消息</div>
          <div class="urgent-indicator" v-if="stats.urgent > 0">
            <van-icon name="warning-o" color="#ee0a24" />
            <span>{{ stats.urgent }} 条紧急消息</span>
          </div>
          <div class="normal-status" v-else>
            <van-icon name="check" color="#07c160" />
            <span>暂无紧急消息</span>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number total">{{ stats.total }}</div>
          <div class="stat-label">总消息</div>
        </div>
        <div class="stat-item" v-if="stats.system > 0">
          <div class="stat-number system">{{ stats.system }}</div>
          <div class="stat-label">系统通知</div>
        </div>
        <div class="stat-item" v-if="stats.task > 0">
          <div class="stat-number task">{{ stats.task }}</div>
          <div class="stat-label">任务提醒</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NotificationStats {
  total: number
  unread: number
  system: number
  task: number
  urgent?: number
}

interface Props {
  stats: NotificationStats
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  urgent: 0
})

const emit = defineEmits<{
  click: []
}>()
</script>

<style lang="scss" scoped>
.notification-stats-card {
  background: #fff;
  border-radius: 12px;
  padding: var(--spacing-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 12px;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  }

  .card-content {
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: 16px;

    .card-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: #323233;
      flex: 1;
    }
  }

  .stats-main {
    margin-bottom: 16px;

    .unread-stats {
      text-align: center;

      .unread-number {
        font-size: var(--text-4xl);
        font-weight: 700;
        color: #ff976a;
        margin-bottom: 4px;
        line-height: 1;
      }

      .unread-label {
        font-size: var(--text-sm);
        color: #969799;
        margin-bottom: 12px;
      }

      .urgent-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-xs);
        padding: 6px 12px;
        background-color: #fee2e2;
        border-radius: 6px;
        font-size: var(--text-xs);
        color: #dc2626;
        font-weight: 500;
      }

      .normal-status {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-xs);
        padding: 6px 12px;
        background-color: #f0f9ff;
        border-radius: 6px;
        font-size: var(--text-xs);
        color: #0891b2;
        font-weight: 500;
      }
    }
  }

  .stats-grid {
    display: flex;
    justify-content: space-around;
    gap: var(--spacing-sm);

    .stat-item {
      text-align: center;
      flex: 1;

      .stat-number {
        font-size: var(--text-xl);
        font-weight: 600;
        line-height: 1;
        margin-bottom: 4px;

        &.total {
          color: #409eff;
        }

        &.system {
          color: #6c5ce7;
        }

        &.task {
          color: #ff976a;
        }
      }

      .stat-label {
        font-size: var(--text-xs);
        color: #969799;
      }
    }
  }
}
</style>