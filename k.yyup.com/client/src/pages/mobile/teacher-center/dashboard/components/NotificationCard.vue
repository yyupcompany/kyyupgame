<template>
  <div class="mobile-notification-card" @click="$emit('click')">
    <van-card :thumb="iconUrl" :centered="true">
      <template #title>
        <div class="card-title">
          <van-icon name="bell" />
          <span>通知</span>
          <van-badge
            v-if="stats.unread > 0"
            :content="stats.unread > 99 ? '99+' : stats.unread.toString()"
            :dot="false"
            class="notification-badge"
          />
        </div>
      </template>

      <template #desc>
        <div class="card-stats">
          <div class="main-stat">
            <div class="number" :class="{ 'has-unread': stats.unread > 0 }">
              {{ stats.unread }}
            </div>
            <div class="label">未读消息</div>
          </div>

          <van-grid :column-num="2" :gutter="12">
            <van-grid-item>
              <div class="sub-stat-item total">
                <div class="number">{{ stats.total }}</div>
                <div class="label">总消息</div>
              </div>
            </van-grid-item>
            <van-grid-item v-if="stats.urgent > 0">
              <div class="sub-stat-item urgent">
                <div class="number">{{ stats.urgent }}</div>
                <div class="label">紧急消息</div>
              </div>
            </van-grid-item>
          </van-grid>
        </div>
      </template>

      <template #footer>
        <div class="card-footer">
          <div v-if="stats.urgent > 0" class="urgent-badge">
            <van-icon name="warning-o" />
            <span>{{ stats.urgent }} 条紧急消息需要处理</span>
          </div>
          <div v-else-if="stats.unread > 0" class="normal-badge">
            <van-icon name="info-o" />
            <span>有 {{ stats.unread }} 条未读消息</span>
          </div>
          <div v-else class="clear-badge">
            <van-icon name="success" />
            <span>暂无新消息</span>
          </div>
        </div>
      </template>
    </van-card>

    <!-- 快速操作按钮 -->
    <div class="quick-actions">
      <van-button
        v-if="stats.urgent > 0"
        type="danger"
        size="small"
        icon="warning"
        @click.stop="$emit('view-urgent')"
      >
        紧急消息
      </van-button>
      <van-button
        type="primary"
        size="small"
        icon="chat-o"
        @click.stop="$emit('view-all')"
      >
        查看全部
      </van-button>
      <van-button
        v-if="stats.unread > 0"
        type="default"
        size="small"
        icon="passed"
        @click.stop="$emit('mark-all-read')"
      >
        全部已读
      </van-button>
      <van-button
        type="default"
        size="small"
        icon="setting-o"
        @click.stop="$emit('settings')"
      >
        设置
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface NotificationStats {
  unread: number
  total: number
  urgent: number
}

interface Props {
  stats: NotificationStats
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
  'view-all': []
  'view-urgent': []
  'mark-all-read': []
  settings: []
}>()

const iconUrl = computed(() => {
  if (props.stats.urgent > 0) {
    return '/icons/notification-urgent.png'
  } else if (props.stats.unread > 0) {
    return '/icons/notification-unread.png'
  }
  return '/icons/notification-clear.png'
})

const iconClass = computed(() => {
  if (props.stats.urgent > 0) return 'danger'
  if (props.stats.unread > 0) return 'warning'
  return 'primary'
})
</script>

<style lang="scss" scoped>
.mobile-notification-card {
  margin: var(--spacing-md);
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  // 未读消息动画效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--van-primary-color), var(--van-success-color));
    border-radius: 12px 12px 0 0;
    opacity: 0;
    transform: scaleX(0);
    transform-origin: left;
    transition: all 0.3s ease;
  }

  &:has(.has-unread)::before {
    opacity: 1;
    transform: scaleX(1);
  }

  :deep(.van-card) {
    background: transparent;

    .van-card__thumb {
      width: 48px;
      height: 48px;
      margin: var(--spacing-md) auto;
      position: relative;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .van-card__content {
      padding: 0 16px 16px;
    }

    .van-card__title {
      margin-bottom: 12px;
      position: relative;

      .card-title {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--van-text-color-1);
        position: relative;

        .van-icon {
          color: var(--van-primary-color);
          font-size: var(--text-xl);
        }

        .notification-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          z-index: 10;

          :deep(.van-badge__wrapper) {
            transform: scale(0.8);
          }
        }
      }
    }

    .van-card__desc {
      .card-stats {
        text-align: center;

        .main-stat {
          margin-bottom: 16px;

          .number {
            font-size: var(--text-4xl);
            font-weight: bold;
            color: var(--van-warning-color);
            line-height: 1;
            margin-bottom: 4px;
            transition: all 0.3s ease;

            &.has-unread {
              animation: pulse 2s infinite;
              color: var(--van-primary-color);
            }

            @keyframes pulse {
              0% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.05);
              }
              100% {
                transform: scale(1);
              }
            }
          }

          .label {
            font-size: var(--text-sm);
            color: var(--van-text-color-2);
          }
        }

        .sub-stat-item {
          text-align: center;
          padding: var(--spacing-md);
          border-radius: 8px;
          background: var(--van-background-color-light);

          .number {
            font-size: var(--text-xl);
            font-weight: 600;
            line-height: 1;
            margin-bottom: 4px;
          }

          .label {
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
          }

          &.total {
            .number {
              color: var(--van-text-color-1);
            }
          }

          &.urgent {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            .number {
              color: var(--van-danger-color);
              font-weight: bold;
            }

            .label {
              color: var(--van-danger-color);
            }
          }
        }
      }
    }

    .van-card__footer {
      padding: 0;

      .card-footer {
        .urgent-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border-radius: 0 0 12px 12px;
          font-size: var(--text-sm);
          color: var(--van-danger-color);
          font-weight: 500;
          animation: urgentPulse 2s infinite;

          .van-icon {
            color: var(--van-danger-color);
            font-size: var(--text-base);
          }

          @keyframes urgentPulse {
            0%, 100% {
              background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            }
            50% {
              background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            }
          }
        }

        .normal-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 0 0 12px 12px;
          font-size: var(--text-sm);
          color: var(--van-primary-color);
          font-weight: 500;

          .van-icon {
            color: var(--van-primary-color);
          }
        }

        .clear-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-radius: 0 0 12px 12px;
          font-size: var(--text-sm);
          color: var(--van-success-color);
          font-weight: 500;

          .van-icon {
            color: var(--van-success-color);
          }
        }
      }
    }
  }

  .quick-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: white;
    border-top: 1px solid var(--van-border-color);

    .van-button {
      border-radius: 8px;
      font-size: var(--text-sm);
      font-weight: 500;

      &.van-button--danger {
        grid-column: span 2;
        background: linear-gradient(135deg, var(--van-danger-color), #ef4444);
        border: none;
      }

      .van-icon {
        margin-right: 4px;
        font-size: var(--text-sm);
      }
    }
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .mobile-notification-card {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

    .quick-actions {
      background: var(--van-background-color);
      border-top-color: var(--van-border-color);
    }
  }
}

// 响应式设计
@media (max-width: 375px) {
  .mobile-notification-card {
    margin: var(--spacing-md);

    .quick-actions {
      padding: var(--spacing-md);
      gap: var(--spacing-sm);

      .van-button {
        font-size: var(--text-xs);
        padding: 6px 12px;

        .van-icon {
          font-size: var(--text-xs);
          margin-right: 2px;
        }
      }
    }

    :deep(.van-card) {
      .van-card__thumb {
        width: 40px;
        height: 40px;
      }

      .van-card__title .card-title {
        font-size: var(--text-base);

        .van-icon {
          font-size: var(--text-lg);
        }
      }

      .van-card__desc .card-stats {
        .main-stat .number {
          font-size: var(--text-3xl);
        }

        .sub-stat-item {
          padding: 10px;

          .number {
            font-size: var(--text-lg);
          }

          .label {
            font-size: 11px;
          }
        }
      }
    }
  }
}
</style>