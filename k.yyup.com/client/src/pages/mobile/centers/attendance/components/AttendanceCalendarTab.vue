<template>
  <div class="attendance-calendar-tab">
    <!-- 日历组件 -->
    <van-calendar
      v-model="selectedDate"
      :show-confirm="false"
      :default-date="defaultDate"
      :formatter="formatCalendarDay"
      @select="onDateSelect"
    />

    <!-- 当日出勤统计 -->
    <div class="day-summary" v-if="selectedDateData">
      <div class="summary-header">
        <h3>{{ formatDate(selectedDate) }}出勤统计</h3>
      </div>
      <van-row :gutter="12">
        <van-col span="6">
          <div class="summary-item present">
            <div class="item-count">{{ selectedDateData.present }}</div>
            <div class="item-label">出勤</div>
          </div>
        </van-col>
        <van-col span="6">
          <div class="summary-item absent">
            <div class="item-count">{{ selectedDateData.absent }}</div>
            <div class="item-label">缺勤</div>
          </div>
        </van-col>
        <van-col span="6">
          <div class="summary-item late">
            <div class="item-count">{{ selectedDateData.late }}</div>
            <div class="item-label">迟到</div>
          </div>
        </van-col>
        <van-col span="6">
          <div class="summary-item leave">
            <div class="item-count">{{ selectedDateData.leave }}</div>
            <div class="item-label">请假</div>
          </div>
        </van-col>
      </van-row>
    </div>

    <!-- 考勤详情列表 -->
    <div class="attendance-details" v-if="attendanceDetails.length > 0">
      <div class="details-header">
        <h3>考勤详情</h3>
        <van-button
          size="small"
          type="primary"
          plain
          @click="$emit('export-details', selectedDate)"
        >
          导出
        </van-button>
      </div>
      <van-cell-group inset>
        <van-cell
          v-for="detail in attendanceDetails"
          :key="detail.id"
          :title="detail.studentName"
          :label="detail.className"
          :value="getStatusText(detail.status)"
        >
          <template #icon>
            <van-avatar
              :src="detail.avatar"
              :size="32"
              fit="cover"
            />
          </template>

          <template #right-icon>
            <van-tag
              :type="getStatusType(detail.status)"
              size="small"
            >
              {{ getStatusText(detail.status) }}
            </van-tag>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast } from 'vant'

interface DayData {
  date: string
  present: number
  absent: number
  late: number
  leave: number
}

interface AttendanceDetail {
  id: string
  studentName: string
  className: string
  status: 'present' | 'absent' | 'late' | 'leave'
  avatar: string
}

interface Props {
  calendarData?: DayData[]
  attendanceDetails?: AttendanceDetail[]
}

const props = withDefaults(defineProps<Props>(), {
  calendarData: () => [],
  attendanceDetails: () => []
})

const emit = defineEmits<{
  'date-select': [date: Date]
  'export-details': [date: Date]
}>()

const selectedDate = ref(new Date())
const defaultDate = new Date()

const selectedDateData = computed(() => {
  const dateStr = selectedDate.value.toISOString().split('T')[0]
  return props.calendarData.find(data => data.date === dateStr)
})

const formatCalendarDay = (day: any) => {
  const dateStr = day.date.toISOString().split('T')[0]
  const data = props.calendarData.find(d => d.date === dateStr)

  if (data) {
    let className = 'calendar-day'
    if (data.absent > 0) className += ' has-absent'
    if (data.late > 0) className += ' has-late'
    if (data.leave > 0) className += ' has-leave'

    return {
      ...day,
      className
    }
  }
  return day
}

const onDateSelect = (date: Date) => {
  selectedDate.value = date
  emit('date-select', date)
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'present': '出勤',
    'absent': '缺勤',
    'late': '迟到',
    'leave': '请假'
  }
  return statusMap[status] || status
}

const getStatusType = (status: string): string => {
  const typeMap: Record<string, string> = {
    'present': 'success',
    'absent': 'danger',
    'late': 'warning',
    'leave': 'primary'
  }
  return typeMap[status] || 'default'
}
</script>

<style lang="scss" scoped>
.attendance-calendar-tab {
  .day-summary {
    padding: var(--van-padding-md);
    background: white;
    margin: var(--van-padding-sm);
    border-radius: var(--van-border-radius-lg);

    .summary-header {
      margin-bottom: var(--van-padding-md);

      h3 {
        margin: 0;
        font-size: var(--van-font-size-md);
        font-weight: var(--van-font-weight-bold);
        color: var(--van-text-color);
      }
    }

    .summary-item {
      text-align: center;
      padding: var(--van-padding-sm);
      border-radius: var(--van-border-radius-md);

      .item-count {
        font-size: var(--van-font-size-lg);
        font-weight: var(--van-font-weight-bold);
        margin-bottom: 4px;
      }

      .item-label {
        font-size: var(--van-font-size-xs);
        color: var(--van-text-color-2);
      }

      &.present .item-count {
        color: #67C23A;
      }

      &.absent .item-count {
        color: #F56C6C;
      }

      &.late .item-count {
        color: #E6A23C;
      }

      &.leave .item-count {
        color: #409EFF;
      }
    }
  }

  .attendance-details {
    padding: var(--van-padding-sm);

    .details-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--van-padding-sm);

      h3 {
        margin: 0;
        font-size: var(--van-font-size-md);
        font-weight: var(--van-font-weight-bold);
        color: var(--van-text-color);
      }
    }
  }
}

:deep(.van-calendar__day) {
  &.calendar-day {
    &.has-absent {
      background: rgba(245, 108, 108, 0.1);
      color: #F56C6C;
    }

    &.has-late {
      background: rgba(230, 162, 60, 0.1);
      color: #E6A23C;
    }

    &.has-leave {
      background: rgba(64, 158, 255, 0.1);
      color: #409EFF;
    }
  }
}
</style>