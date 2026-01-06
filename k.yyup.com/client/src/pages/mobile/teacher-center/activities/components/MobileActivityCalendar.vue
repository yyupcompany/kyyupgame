<template>
  <div class="mobile-activity-calendar">
    <!-- 月份选择器 -->
    <div class="calendar-header">
      <van-button
        size="small"
        icon="arrow-left"
        @click="previousMonth"
        :disabled="isLoading"
      />
      <span class="current-month">{{ currentMonthText }}</span>
      <van-button
        size="small"
        icon="arrow"
        @click="nextMonth"
        :disabled="isLoading"
      />
    </div>

    <!-- 日历组件 -->
    <van-calendar
      v-model:show="showCalendar"
      :show-confirm="false"
      :default-date="currentDate"
      :max-date="maxDate"
      :min-date="minDate"
      :formatter="formatter"
      @select="onDateSelect"
      @confirm="onDateConfirm"
      class="activity-calendar"
    >
      <template #top>
        <div class="calendar-top">
          <div class="activity-legend">
            <div class="legend-item">
              <div class="legend-dot upcoming"></div>
              <span>即将开始</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot ongoing"></div>
              <span>进行中</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot completed"></div>
              <span>已结束</span>
            </div>
          </div>
        </div>
      </template>
    </van-calendar>

    <!-- 显示选择的日期 -->
    <van-cell-group inset class="selected-date-info">
      <van-cell
        v-if="selectedDate"
        title="选择日期"
        :value="formatDate(selectedDate)"
      />
    </van-cell-group>

    <!-- 当日活动列表 -->
    <div v-if="dayActivities.length > 0" class="day-activities">
      <van-divider>当日活动</van-divider>
      <van-list>
        <van-cell
          v-for="activity in dayActivities"
          :key="activity.id"
          :title="activity.title"
          :label="`${activity.time} | ${activity.location}`"
          is-link
          @click="handleActivityClick(activity)"
        >
          <template #right-icon>
            <van-tag
              :type="getActivityStatusType(activity.status)"
              size="small"
            >
              {{ getActivityStatusText(activity.status) }}
            </van-tag>
          </template>
        </van-cell>
      </van-list>
    </div>

    <!-- 快捷操作 -->
    <van-floating-bubble
      v-if="selectedDate"
      axis="xy"
      icon="plus"
      @click="handleCreateActivity"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { showToast } from 'vant'
import dayjs from 'dayjs'

interface Activity {
  id: number
  title: string
  date: string
  time: string
  location: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  type: string
  participants?: number
  maxParticipants?: number
}

interface Props {
  activities: Activity[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  dateSelect: [date: Date]
  activityClick: [activity: Activity]
  createActivity: [date: Date]
}>()

const showCalendar = ref(true)
const currentDate = ref(new Date())
const selectedDate = ref<Date | null>(null)
const isLoading = ref(false)

const currentMonthText = computed(() => {
  return dayjs(currentDate.value).format('YYYY年MM月')
})

const minDate = computed(() => {
  return dayjs().subtract(3, 'month').toDate()
})

const maxDate = computed(() => {
  return dayjs().add(6, 'month').toDate()
})

const dayActivities = computed(() => {
  if (!selectedDate.value) return []

  const dateStr = dayjs(selectedDate.value).format('YYYY-MM-DD')
  return props.activities.filter(activity =>
    dayjs(activity.date).format('YYYY-MM-DD') === dateStr
  )
})

// 日期格式化器
const formatter = (day: any) => {
  const date = dayjs(day.date).format('YYYY-MM-DD')
  const dayActivities = props.activities.filter(activity =>
    dayjs(activity.date).format('YYYY-MM-DD') === date
  )

  if (dayActivities.length > 0) {
    const hasOngoing = dayActivities.some(a => a.status === 'ongoing')
    const hasUpcoming = dayActivities.some(a => a.status === 'upcoming')
    const hasCompleted = dayActivities.some(a => a.status === 'completed')

    if (hasOngoing) {
      day.topInfo = '●'
      day.className = 'activity-day ongoing'
    } else if (hasUpcoming) {
      day.topInfo = '●'
      day.className = 'activity-day upcoming'
    } else if (hasCompleted) {
      day.topInfo = '●'
      day.className = 'activity-day completed'
    }
  }

  return day
}

const previousMonth = () => {
  currentDate.value = dayjs(currentDate.value).subtract(1, 'month').toDate()
}

const nextMonth = () => {
  currentDate.value = dayjs(currentDate.value).add(1, 'month').toDate()
}

const onDateSelect = (date: Date) => {
  selectedDate.value = date
  emit('dateSelect', date)
}

const onDateConfirm = (date: Date) => {
  selectedDate.value = date
  emit('dateSelect', date)
  showCalendar.value = false
  // 延迟重新显示，以触发重新渲染
  setTimeout(() => {
    showCalendar.value = true
  }, 100)
}

const handleActivityClick = (activity: Activity) => {
  emit('activityClick', activity)
}

const handleCreateActivity = () => {
  if (selectedDate.value) {
    emit('createActivity', selectedDate.value)
  }
}

const formatDate = (date: Date): string => {
  return dayjs(date).format('YYYY年MM月DD日')
}

const getActivityStatusType = (status: string): string => {
  const typeMap: Record<string, string> = {
    upcoming: 'warning',
    ongoing: 'success',
    completed: 'default',
    cancelled: 'danger'
  }
  return typeMap[status] || 'default'
}

const getActivityStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    upcoming: '即将开始',
    ongoing: '进行中',
    completed: '已结束',
    cancelled: '已取消'
  }
  return textMap[status] || '未知'
}

// 监听当前日期变化，更新日历显示
watch(currentDate, () => {
  // 触发日历重新渲染
  showCalendar.value = false
  setTimeout(() => {
    showCalendar.value = true
  }, 50)
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.mobile-activity-calendar {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;

  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    .current-month {
      font-size: var(--text-lg);
      font-weight: 600;
    }
  }

  .calendar-top {
    padding: var(--spacing-md) 16px;
    background: var(--primary-color);

    .activity-legend {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
      flex-wrap: wrap;

      .legend-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-xs);
        color: #666;

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;

          &.upcoming {
            background: var(--primary-color);
          }

          &.ongoing {
            background: var(--primary-color);
          }

          &.completed {
            background: var(--primary-color);
          }
        }
      }
    }
  }

  .selected-date-info {
    margin: var(--spacing-md) 0;
  }

  .day-activities {
    padding: 0 16px 16px;

    .van-cell {
      margin-bottom: 8px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

:deep(.activity-calendar) {
  .van-calendar {
    .activity-day {
      position: relative;

      &.upcoming .van-calendar-day__top-info {
        color: var(--text-primary);
      }

      &.ongoing .van-calendar-day__top-info {
        color: var(--text-primary);
      }

      &.completed .van-calendar-day__top-info {
        color: var(--text-primary);
      }
    }
  }
}
</style>