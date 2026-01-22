<template>
  <MobileCenterLayout title="活动日历" back-path="/mobile/activity/activity-index">
    <div class="activity-calendar-mobile">
      <!-- 月份切换 -->
      <div class="month-nav">
        <van-button icon="arrow-left" size="small" @click="prevMonth" />
        <div class="current-month">{{ currentYear }}年{{ currentMonth }}月</div>
        <van-button icon="arrow" size="small" @click="nextMonth" />
        <van-button size="small" @click="goToday" class="today-btn">今天</van-button>
      </div>

      <!-- 日历视图 -->
      <div class="calendar-container">
        <div class="weekday-header">
          <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
        </div>
        <div class="days-grid">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            class="day-cell"
            :class="{
              'other-month': !day.isCurrentMonth,
              'today': day.isToday,
              'selected': day.date === selectedDate,
              'has-activity': day.activities.length > 0
            }"
            @click="selectDate(day)"
          >
            <div class="day-number">{{ day.day }}</div>
            <div class="activity-dots" v-if="day.activities.length > 0">
              <span
                v-for="(act, i) in day.activities.slice(0, 3)"
                :key="i"
                class="dot"
                :class="getActivityStatusClass(act.status)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 选中日期的活动列表 -->
      <div class="selected-date-activities">
        <div class="date-title">
          <span>{{ formatSelectedDate }}</span>
          <span class="activity-count">{{ selectedDayActivities.length }} 个活动</span>
        </div>
        <div v-if="selectedDayActivities.length > 0" class="activity-list">
          <div
            v-for="activity in selectedDayActivities"
            :key="activity.id"
            class="activity-item"
            @click="viewActivity(activity)"
          >
            <div class="activity-time">
              <van-icon name="clock-o" />
              {{ formatTime(activity.startTime) }}
            </div>
            <div class="activity-info">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-location">
                <van-icon name="location-o" />
                {{ activity.location }}
              </div>
            </div>
            <van-tag :type="getStatusTagType(activity.status)" size="medium">
              {{ getStatusLabel(activity.status) }}
            </van-tag>
          </div>
        </div>
        <van-empty v-else description="当日无活动" image="search" />
      </div>

      <!-- 近期活动概览 -->
      <van-cell-group inset title="近期活动" class="upcoming-section">
        <van-cell
          v-for="activity in upcomingActivities"
          :key="activity.id"
          :title="activity.title"
          :label="formatDateTime(activity.startTime)"
          is-link
          @click="viewActivity(activity)"
        >
          <template #right-icon>
            <van-tag :type="getStatusTagType(activity.status)" size="medium">
              {{ getStatusLabel(activity.status) }}
            </van-tag>
          </template>
        </van-cell>
        <van-cell v-if="upcomingActivities.length === 0" title="暂无近期活动" />
      </van-cell-group>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'
import type { TagType } from 'vant'

const router = useRouter()

// 周日标题
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 当前日期
const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth() + 1)
const selectedDate = ref('')

// 活动数据
interface Activity {
  id: number
  title: string
  startTime: string
  endTime: string
  location: string
  status: number
}

const activities = ref<Activity[]>([
  { id: 1, title: '开放日活动', startTime: '2025-01-10 09:00:00', endTime: '2025-01-10 12:00:00', location: '幼儿园大厅', status: 1 },
  { id: 2, title: '家长会', startTime: '2025-01-15 14:00:00', endTime: '2025-01-15 16:00:00', location: '会议室', status: 1 },
  { id: 3, title: '亲子运动会', startTime: '2025-01-20 08:30:00', endTime: '2025-01-20 11:30:00', location: '操场', status: 0 },
  { id: 4, title: '新年联欢会', startTime: '2025-01-25 09:00:00', endTime: '2025-01-25 11:00:00', location: '教室', status: 0 },
  { id: 5, title: '毕业典礼', startTime: '2025-01-07 10:00:00', endTime: '2025-01-07 12:00:00', location: '礼堂', status: 3 }
])

// 计算日历天数
interface CalendarDay {
  date: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  activities: Activity[]
}

const calendarDays = computed<CalendarDay[]>(() => {
  const days: CalendarDay[] = []
  const year = currentYear.value
  const month = currentMonth.value

  // 本月第一天
  const firstDay = new Date(year, month - 1, 1)
  const firstDayWeek = firstDay.getDay()

  // 本月最后一天
  const lastDay = new Date(year, month, 0)
  const totalDays = lastDay.getDate()

  // 上月的天数
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate()

  // 填充上月的天数
  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    const date = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    days.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: false,
      activities: getActivitiesForDate(date)
    })
  }

  // 本月的天数
  for (let i = 1; i <= totalDays; i++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const isToday = date === formatDate(today)
    days.push({
      date,
      day: i,
      isCurrentMonth: true,
      isToday,
      activities: getActivitiesForDate(date)
    })
  }

  // 填充下月的天数
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    const date = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    days.push({
      date,
      day: i,
      isCurrentMonth: false,
      isToday: false,
      activities: getActivitiesForDate(date)
    })
  }

  return days
})

// 获取某日的活动
const getActivitiesForDate = (date: string) => {
  return activities.value.filter(a => a.startTime.startsWith(date))
}

// 选中日期的活动
const selectedDayActivities = computed(() => {
  if (!selectedDate.value) return []
  return getActivitiesForDate(selectedDate.value)
})

// 近期活动
const upcomingActivities = computed(() => {
  const todayStr = formatDate(today)
  return activities.value
    .filter(a => a.startTime >= todayStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, 5)
})

// 格式化函数
const formatDate = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  const [y, m, d] = selectedDate.value.split('-')
  return `${y}年${m}月${d}日`
})

const formatTime = (dateStr: string) => {
  return dateStr.split(' ')[1]?.substring(0, 5) || ''
}

const formatDateTime = (dateStr: string) => {
  const [date, time] = dateStr.split(' ')
  return `${date} ${time?.substring(0, 5) || ''}`
}

// 状态转换
const getStatusTagType = (status: number): TagType => {
  const map: Record<number, TagType> = { 0: 'primary', 1: 'success', 2: 'warning', 3: 'default', 4: 'default' }
  return map[status] || 'default'
}

const getStatusLabel = (status: number) => {
  const map: Record<number, string> = { 0: '计划中', 1: '报名中', 2: '进行中', 3: '已结束', 4: '已取消' }
  return map[status] || '未知'
}

const getActivityStatusClass = (status: number) => {
  const map: Record<number, string> = { 0: 'planning', 1: 'registering', 2: 'ongoing', 3: 'ended', 4: 'cancelled' }
  return map[status] || ''
}

// 操作函数
const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const goToday = () => {
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth() + 1
  selectedDate.value = formatDate(today)
}

const selectDate = (day: CalendarDay) => {
  selectedDate.value = day.date
}

const viewActivity = (activity: Activity) => {
  router.push(`/mobile/activity/activity-detail/${activity.id}`)
}

onMounted(() => {
  selectedDate.value = formatDate(today)
})
</script>

<style scoped lang="scss">
.activity-calendar-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;

  .current-month {
    font-size: 16px;
    font-weight: 500;
    min-width: 100px;
    text-align: center;
  }

  .today-btn {
    margin-left: 8px;
  }
}

.calendar-container {
  background: #fff;
  padding: 8px 12px 16px;

  .weekday-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-size: 12px;
    color: #969799;
    padding: 8px 0;
  }

  .days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .day-cell {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    cursor: pointer;
    position: relative;

    .day-number {
      font-size: 14px;
      color: #323233;
    }

    &.other-month .day-number {
      color: #c8c9cc;
    }

    &.today {
      background: #e8f4ff;
      .day-number {
        color: #1989fa;
        font-weight: 600;
      }
    }

    &.selected {
      background: #1989fa;
      .day-number {
        color: #fff;
      }
    }

    &.has-activity {
      .day-number {
        font-weight: 500;
      }
    }

    .activity-dots {
      display: flex;
      gap: 2px;
      margin-top: 2px;

      .dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: #1989fa;

        &.planning { background: #1989fa; }
        &.registering { background: #07c160; }
        &.ongoing { background: #ff9800; }
        &.ended { background: #969799; }
        &.cancelled { background: #ee0a24; }
      }
    }
  }
}

.selected-date-activities {
  margin: 12px;
  background: #fff;
  border-radius: 8px;
  padding: 12px;

  .date-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 12px;

    .activity-count {
      font-size: 12px;
      color: #969799;
      font-weight: normal;
    }
  }

  .activity-list {
    .activity-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid #ebedf0;

      &:last-child {
        border-bottom: none;
      }

      .activity-time {
        font-size: 12px;
        color: #969799;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .activity-info {
        flex: 1;
        min-width: 0;

        .activity-title {
          font-size: 14px;
          color: #323233;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .activity-location {
          font-size: 12px;
          color: #969799;
          display: flex;
          align-items: center;
          gap: 2px;
          margin-top: 2px;
        }
      }
    }
  }
}

.upcoming-section {
  margin: 12px;
}
</style>
