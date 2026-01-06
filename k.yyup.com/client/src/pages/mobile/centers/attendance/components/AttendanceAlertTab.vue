<template>
  <div class="attendance-alert-tab">
    <!-- 考勤异常提醒 -->
    <div class="alert-list">
      <div
        v-for="alert in attendanceAlerts"
        :key="alert.id"
        class="alert-item"
        :class="`alert-${alert.type}`"
        @click="$emit('alert-click', alert)"
      >
        <div class="alert-icon">
          <van-icon
            :name="getAlertIcon(alert.type)"
            :color="getAlertColor(alert.type)"
            size="20"
          />
        </div>
        <div class="alert-content">
          <div class="alert-title">{{ alert.title }}</div>
          <div class="alert-desc">{{ alert.description }}</div>
          <div class="alert-time">{{ formatTime(alert.createdAt) }}</div>
        </div>
        <div class="alert-action">
          <van-button
            size="mini"
            :type="getButtonType(alert.type)"
            @click.stop="$emit('handle-alert', alert)"
          >
            处理
          </van-button>
        </div>
      </div>
    </div>

    <!-- 快速统计 -->
    <div class="quick-stats">
      <van-grid :column-num="3" :gutter="8">
        <van-grid-item
          v-for="stat in alertStats"
          :key="stat.type"
          :text="stat.label"
        >
          <div class="stat-value" :style="{ color: stat.color }">
            {{ stat.count }}
          </div>
        </van-grid-item>
      </van-grid>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AttendanceAlert {
  id: string
  type: 'absence' | 'late' | 'early' | 'leave'
  title: string
  description: string
  createdAt: string
  studentName: string
}

interface AlertStat {
  type: string
  label: string
  count: number
  color: string
}

interface Props {
  attendanceAlerts?: AttendanceAlert[]
  alertStats?: AlertStat[]
}

const props = withDefaults(defineProps<Props>(), {
  attendanceAlerts: () => [],
  alertStats: () => []
})

const emit = defineEmits<{
  'alert-click': [alert: AttendanceAlert]
  'handle-alert': [alert: AttendanceAlert]
}>()

const getAlertIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'absence': 'warning-o',
    'late': 'clock-o',
    'early': 'arrow-left',
    'leave': 'calendar-o'
  }
  return iconMap[type] || 'info-o'
}

const getAlertColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    'absence': '#F56C6C',
    'late': '#E6A23C',
    'early': '#E6A23C',
    'leave': '#409EFF'
  }
  return colorMap[type] || '#909399'
}

const getButtonType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'absence': 'danger',
    'late': 'warning',
    'early': 'warning',
    'leave': 'primary'
  }
  return typeMap[type] || 'default'
}

const formatTime = (time: string): string => {
  return new Date(time).toLocaleDateString('zh-CN')
}
</script>

<style lang="scss" scoped>
.attendance-alert-tab {
  padding: var(--van-padding-sm);

  .alert-list {
    margin-bottom: var(--van-padding-md);

    .alert-item {
      display: flex;
      align-items: flex-start;
      gap: var(--van-padding-sm);
      padding: var(--van-padding-md);
      background: white;
      border-radius: var(--van-border-radius-lg);
      margin-bottom: var(--van-padding-sm);
      border-left: 4px solid transparent;

      &.alert-absence {
        border-left-color: #F56C6C;
      }

      &.alert-late {
        border-left-color: #E6A23C;
      }

      &.alert-early {
        border-left-color: #E6A23C;
      }

      &.alert-leave {
        border-left-color: #409EFF;
      }

      .alert-content {
        flex: 1;

        .alert-title {
          font-size: var(--van-font-size-md);
          font-weight: var(--van-font-weight-bold);
          color: var(--van-text-color);
          margin-bottom: 4px;
        }

        .alert-desc {
          font-size: var(--van-font-size-sm);
          color: var(--van-text-color-2);
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .alert-time {
          font-size: var(--van-font-size-xs);
          color: var(--van-text-color-3);
        }
      }

      .alert-action {
        align-self: center;
      }
    }
  }

  .quick-stats {
    .stat-value {
      font-size: var(--van-font-size-xl);
      font-weight: var(--van-font-weight-bold);
      margin-bottom: 4px;
    }
  }
}
</style>