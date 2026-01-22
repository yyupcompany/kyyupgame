<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotificationCenter } from '@/composables/useNotificationCenter'
import type { Alert } from '@/api/modules/alert'
import { Bell, Clock, Check, CircleClose, Warning, Finished } from '@element-plus/icons-vue'

interface Props {
  maxHeight?: string
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxHeight: '400px',
  compact: false
})

const emit = defineEmits<{
  (e: 'viewAll'): void
  (e: 'click', alert: Alert): void
}>()

const {
  alerts,
  loading,
  statistics,
  activeAlerts,
  criticalAlerts,
  unreadCount,
  fetchAlerts,
  fetchStatistics,
  acknowledgeAlert,
  resolveAlert,
  dismissAlert,
  getTypeIcon,
  formatTime,
  levelColors,
  levelLabels
} = useNotificationCenter()

const activeTab = ref<'all' | 'critical'>('all')

const filteredAlerts = computed(() => {
  if (activeTab.value === 'critical') {
    return criticalAlerts.value
  }
  return activeAlerts.value
})

const handleAlertClick = (alert: Alert) => {
  emit('click', alert)
}

const handleAction = async (action: 'acknowledge' | 'resolve' | 'dismiss', alert: Alert) => {
  switch (action) {
    case 'acknowledge':
      await acknowledgeAlert(alert)
      break
    case 'resolve':
      await resolveAlert(alert)
      break
    case 'dismiss':
      await dismissAlert(alert)
      break
  }
}

onMounted(() => {
  fetchAlerts()
  fetchStatistics()
})
</script>

<template>
  <div class="notification-panel">
    <!-- 统计概览 -->
    <div v-if="!compact" class="stats-bar">
      <div class="stat-item" :class="{ critical: statistics.criticalCount > 0 }">
        <Warning class="stat-icon" />
        <span class="stat-value">{{ statistics.criticalCount }}</span>
        <span class="stat-label">紧急告警</span>
      </div>
      <div class="stat-item">
        <Bell class="stat-icon" />
        <span class="stat-value">{{ statistics.activeCount }}</span>
        <span class="stat-label">待处理</span>
      </div>
      <div class="stat-item today">
        <Clock class="stat-icon" />
        <span class="stat-value">{{ statistics.todayCount }}</span>
        <span class="stat-label">今日新增</span>
      </div>
    </div>

    <!-- 标签页 -->
    <div v-if="!compact" class="tabs">
      <div
        class="tab"
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        全部 ({{ activeAlerts.length }})
      </div>
      <div
        class="tab"
        :class="{ active: activeTab === 'critical', critical: criticalAlerts.length > 0 }"
        @click="activeTab = 'critical'"
      >
        紧急 ({{ criticalAlerts.length }})
      </div>
    </div>

    <!-- 告警列表 -->
    <div class="alert-list" :style="{ maxHeight }">
      <el-scrollbar>
        <div v-if="loading" class="loading-state">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <div v-else-if="filteredAlerts.length === 0" class="empty-state">
          <el-icon><Finished /></el-icon>
          <span>暂无待处理告警</span>
        </div>

        <div
          v-else
          v-for="alert in filteredAlerts"
          :key="alert.id"
          class="alert-item"
          :class="[`level-${alert.alertLevel}`, { unread: alert.status === 'active' }]"
          @click="handleAlertClick(alert)"
        >
          <!-- 告警图标 -->
          <div class="alert-icon" :style="{ backgroundColor: levelColors[alert.alertLevel] }">
            <el-icon :size="16">
              <component :is="getTypeIcon(alert.alertType)" />
            </el-icon>
          </div>

          <!-- 告警内容 -->
          <div class="alert-content">
            <div class="alert-header">
              <span class="alert-title">{{ alert.title }}</span>
              <el-tag
                :type="alert.alertLevel === 'critical' ? 'danger' : alert.alertLevel === 'high' ? 'warning' : 'info'"
                size="small"
                effect="dark"
              >
                {{ levelLabels[alert.alertLevel] }}
              </el-tag>
            </div>
            <div class="alert-desc">{{ alert.description }}</div>
            <div class="alert-meta">
              <span class="alert-time">
                <el-icon><Clock /></el-icon>
                {{ formatTime(alert.triggeredAt) }}
              </span>
              <span v-if="alert.metadata?.studentName" class="alert-student">
                {{ alert.metadata.studentName }}
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div v-if="!compact && alert.status === 'active'" class="alert-actions">
            <el-tooltip content="确认" placement="top">
              <el-button
                size="small"
                type="primary"
                plain
                circle
                @click.stop="handleAction('acknowledge', alert)"
              >
                <el-icon><Check /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="解决" placement="top">
              <el-button
                size="small"
                type="success"
                plain
                circle
                @click.stop="handleAction('resolve', alert)"
              >
                <el-icon><Finished /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="忽略" placement="top">
              <el-button
                size="small"
                type="info"
                plain
                circle
                @click.stop="handleAction('dismiss', alert)"
              >
                <el-icon><CircleClose /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <!-- 底部操作 -->
    <div v-if="!compact" class="panel-footer">
      <el-button text type="primary" @click="emit('viewAll')">
        查看全部告警
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.notification-panel {
  background: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.stats-bar {
  display: flex;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color-lighter);

  .stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    border-radius: 8px;
    background: var(--el-bg-color);
    transition: all 0.3s;

    &.critical {
      background: rgba(245, 108, 108, 0.1);

      .stat-icon {
        color: #F56C6C;
      }

      .stat-value {
        color: #F56C6C;
      }
    }

    .stat-icon {
      font-size: 20px;
      color: var(--el-text-color-secondary);
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      line-height: 1;
    }

    .stat-label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-top: 4px;
    }
  }

  .stat-item + .stat-item {
    margin-left: 12px;
  }
}

.tabs {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  .tab {
    padding: 8px 16px;
    margin-right: 8px;
    border-radius: 16px;
    font-size: 14px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: var(--el-bg-color-page);
    }

    &.active {
      background: var(--primary-color);
      color: #fff;
    }

    &.critical.active {
      background: #F56C6C;
    }
  }
}

.alert-list {
  padding: 8px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--el-text-color-secondary);

  .el-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }
}

.alert-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: var(--el-bg-color-page);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--el-bg-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.unread {
    border-left: 3px solid var(--primary-color);
  }

  &.level-critical {
    background: rgba(245, 108, 108, 0.05);

    &:hover {
      background: rgba(245, 108, 108, 0.1);
    }
  }

  &.level-high {
    background: rgba(230, 162, 60, 0.05);

    &:hover {
      background: rgba(230, 162, 60, 0.1);
    }
  }

  .alert-icon {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    margin-right: 12px;
  }

  .alert-content {
    flex: 1;
    min-width: 0;

    .alert-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;

      .alert-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
    }

    .alert-desc {
      font-size: 13px;
      color: var(--el-text-color-regular);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .alert-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: var(--el-text-color-secondary);

      .alert-time {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .alert-student {
        padding: 2px 8px;
        background: var(--el-bg-color);
        border-radius: 4px;
      }
    }
  }

  .alert-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-left: 8px;
  }
}

.panel-footer {
  display: flex;
  justify-content: center;
  padding: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

// 紧凑模式
.compact {
  .alert-item {
    padding: 8px;

    .alert-icon {
      width: 28px;
      height: 28px;

      .el-icon {
        font-size: 14px;
      }
    }

    .alert-content {
      .alert-title {
        font-size: 13px;
      }

      .alert-desc {
        font-size: 12px;
        -webkit-line-clamp: 1;
      }

      .alert-meta {
        font-size: 11px;
      }
    }
  }
}
</style>
