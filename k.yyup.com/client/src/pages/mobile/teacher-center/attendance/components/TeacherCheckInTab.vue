<template>
  <div class="teacher-checkin-tab">
    <!-- 今日打卡状态 -->
    <div class="status-section">
      <van-card class="status-card">
        <template #title>
          <div class="card-title">
            <van-icon name="clock-o" />
            今日打卡状态
          </div>
        </template>
        
        <div class="status-content">
          <div class="status-item">
            <div class="status-label">签到时间</div>
            <div class="status-value" :class="{ 'has-value': todayRecord.checkInTime }">
              {{ todayRecord.checkInTime || '--:--' }}
            </div>
            <van-tag v-if="todayRecord.checkInTime && isLate" type="warning" size="small">
              迟到
            </van-tag>
          </div>
          
          <van-divider />
          
          <div class="status-item">
            <div class="status-label">签退时间</div>
            <div class="status-value" :class="{ 'has-value': todayRecord.checkOutTime }">
              {{ todayRecord.checkOutTime || '--:--' }}
            </div>
            <van-tag v-if="todayRecord.checkOutTime && isEarlyLeave" type="warning" size="small">
              早退
            </van-tag>
          </div>
          
          <van-divider />
          
          <div class="status-item">
            <div class="status-label">工作时长</div>
            <div class="status-value">
              {{ workDuration }}
            </div>
          </div>
          
          <van-divider />
          
          <div class="status-item">
            <div class="status-label">考勤状态</div>
            <van-tag :type="statusType" size="large">
              {{ statusText }}
            </van-tag>
          </div>
        </div>
      </van-card>
    </div>
    
    <!-- 快速打卡 -->
    <div class="action-section">
      <van-card class="action-card">
        <template #title>
          <div class="card-title">
            <van-icon name="clock" />
            快速打卡
          </div>
        </template>
        
        <div class="action-content">
          <div class="current-time">
            <van-icon name="clock" />
            <span>{{ currentTime }}</span>
          </div>
          
          <div class="action-buttons">
            <van-button
              type="primary"
              size="large"
              :icon="todayRecord.checkInTime ? 'passed' : 'success'"
              @click="handleCheckIn"
              :disabled="!!todayRecord.checkInTime"
              :loading="checking"
              class="checkin-btn"
              block
              round
            >
              {{ todayRecord.checkInTime ? '已签到' : '签到' }}
            </van-button>
            
            <van-button
              type="success"
              size="large"
              :icon="todayRecord.checkOutTime ? 'passed' : 'success'"
              @click="handleCheckOut"
              :disabled="!todayRecord.checkInTime || !!todayRecord.checkOutTime"
              :loading="checking"
              class="checkout-btn"
              block
              round
            >
              {{ todayRecord.checkOutTime ? '已签退' : '签退' }}
            </van-button>
          </div>
          
          <van-button
            type="warning"
            icon="comment-o"
            @click="showLeaveDialog = true"
            class="leave-btn"
            block
            round
          >
            请假申请
          </van-button>
        </div>
      </van-card>
    </div>

    <!-- 本月考勤统计 -->
    <div class="calendar-section">
      <van-card class="calendar-card">
        <template #title>
          <div class="card-title">
            <van-icon name="calendar-o" />
            本月考勤统计
          </div>
          <div class="month-selector">
            <van-button size="small" @click="showMonthPicker = true">
              {{ formatMonth(selectedMonth) }}
            </van-button>
          </div>
        </template>
        
        <div class="calendar-content">
          <!-- 简化的月度统计 -->
          <div class="month-stats">
            <div class="stat-item">
              <div class="stat-value">{{ monthStats.attendanceDays }}</div>
              <div class="stat-label">出勤天数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ monthStats.lateCount }}</div>
              <div class="stat-label">迟到次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ monthStats.leaveCount }}</div>
              <div class="stat-label">请假次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ monthStats.attendanceRate }}%</div>
              <div class="stat-label">出勤率</div>
            </div>
          </div>
          
          <!-- 考勤日历（简化版） -->
          <div class="mini-calendar">
            <div class="calendar-weekdays">
              <span v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day" class="weekday">
                {{ day }}
              </span>
            </div>
            <div class="calendar-days">
              <div 
                v-for="day in calendarDays" 
                :key="day.date"
                class="calendar-day"
                :class="getCalendarDayClass(day)"
                @click="selectDate(day)"
              >
                <span class="day-number">{{ day.day }}</span>
                <div v-if="day.hasRecord" class="day-indicator" :class="day.statusClass"></div>
              </div>
            </div>
          </div>
        </div>
      </van-card>
    </div>

    <!-- 请假申请对话框 -->
    <van-popup v-model:show="showLeaveDialog" position="bottom" round>
      <div class="leave-dialog">
        <div class="dialog-header">
          <van-button type="default" size="small" @click="showLeaveDialog = false">
            取消
          </van-button>
          <span class="dialog-title">请假申请</span>
          <van-button type="primary" size="small" @click="submitLeaveRequest" :loading="submitting">
            提交
          </van-button>
        </div>
        
        <div class="dialog-content">
          <van-form ref="leaveFormRef" @submit="submitLeaveRequest">
            <van-field
              v-model="leaveForm.leaveType"
              name="leaveType"
              label="请假类型"
              placeholder="请选择请假类型"
              readonly
              is-link
              @click="showLeaveTypePicker = true"
              :rules="[{ required: true, message: '请选择请假类型' }]"
            />
            
            <van-field
              v-model="leaveForm.startDateText"
              name="startDate"
              label="开始时间"
              placeholder="选择开始时间"
              readonly
              is-link
              @click="showStartDatePicker = true"
              :rules="[{ required: true, message: '请选择开始时间' }]"
            />
            
            <van-field
              v-model="leaveForm.endDateText"
              name="endDate"
              label="结束时间"
              placeholder="选择结束时间"
              readonly
              is-link
              @click="showEndDatePicker = true"
              :rules="[{ required: true, message: '请选择结束时间' }]"
            />
            
            <van-field
              v-model="leaveForm.reason"
              name="reason"
              label="请假原因"
              type="textarea"
              placeholder="请输入请假原因"
              :rows="4"
              :rules="[{ required: true, message: '请输入请假原因' }]"
            />
          </van-form>
        </div>
      </div>
    </van-popup>

    <!-- 请假类型选择器 -->
    <van-popup v-model:show="showLeaveTypePicker" position="bottom">
      <van-picker
        :columns="leaveTypeColumns"
        @confirm="onLeaveTypeConfirm"
        @cancel="showLeaveTypePicker = false"
      />
    </van-popup>

    <!-- 日期时间选择器 -->
    <van-popup v-model:show="showStartDatePicker" position="bottom">
      <van-date-picker
        v-model="leaveForm.startDate"
        type="datetime"
        title="选择开始时间"
        @confirm="onStartDateConfirm"
        @cancel="showStartDatePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showEndDatePicker" position="bottom">
      <van-date-picker
        v-model="leaveForm.endDate"
        type="datetime"
        title="选择结束时间"
        @confirm="onEndDateConfirm"
        @cancel="showEndDatePicker = false"
      />
    </van-popup>

    <!-- 月份选择器 -->
    <van-popup v-model:show="showMonthPicker" position="bottom">
      <van-date-picker
        v-model="selectedMonth"
        title="选择月份"
        type="year-month"
        @confirm="onMonthConfirm"
        @cancel="showMonthPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { useUserStore } from '@/stores/user'
import {
  checkIn as apiCheckIn,
  checkOut as apiCheckOut,
  getTodayAttendance,
  getMonthAttendance,
  createLeaveRequest as apiCreateLeaveRequest,
  getTeacherStatistics,
  TeacherAttendanceStatus,
  LeaveType,
  type TeacherAttendanceRecord,
} from '@/api/modules/teacher-checkin'

// ==================== 类型定义 ====================

interface CalendarDay {
  date: string
  day: number
  hasRecord: boolean
  status?: string
  statusClass?: string
}

interface MonthStats {
  attendanceDays: number
  lateCount: number
  leaveCount: number
  attendanceRate: number
}

// ==================== 数据定义 ====================

const emit = defineEmits<{
  refresh: []
}>()

const userStore = useUserStore()
const checking = ref(false)
const submitting = ref(false)
const showLeaveDialog = ref(false)
const showLeaveTypePicker = ref(false)
const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)
const showMonthPicker = ref(false)

// 当前时间
const currentTime = ref('')
let timeInterval: number | null = null

// 今日考勤记录
const todayRecord = ref<TeacherAttendanceRecord>({
  teacherId: userStore.user?.id || 0,
  attendanceDate: new Date().toISOString().split('T')[0],
  status: TeacherAttendanceStatus.ABSENT,
})

// 本月考勤记录
const selectedMonth = ref(new Date())
const monthRecords = ref<TeacherAttendanceRecord[]>([])
const monthStats = ref<MonthStats>({
  attendanceDays: 0,
  lateCount: 0,
  leaveCount: 0,
  attendanceRate: 0,
})

// 请假表单
const leaveFormRef = ref()
const leaveForm = reactive({
  leaveType: '',
  leaveTypeText: '',
  startDate: new Date(),
  startDateText: '',
  endDate: new Date(),
  endDateText: '',
  reason: '',
})

const leaveTypeColumns = [
  { text: '病假', value: LeaveType.SICK },
  { text: '事假', value: LeaveType.PERSONAL },
  { text: '年假', value: LeaveType.ANNUAL },
  { text: '产假', value: LeaveType.MATERNITY },
]

// ==================== 计算属性 ====================

// 是否迟到
const isLate = computed(() => {
  if (!todayRecord.value.checkInTime) return false
  const checkInHour = parseInt(todayRecord.value.checkInTime.split(':')[0])
  const checkInMinute = parseInt(todayRecord.value.checkInTime.split(':')[1])
  return checkInHour > 9 || (checkInHour === 9 && checkInMinute > 0)
})

// 是否早退
const isEarlyLeave = computed(() => {
  if (!todayRecord.value.checkOutTime) return false
  const checkOutHour = parseInt(todayRecord.value.checkOutTime.split(':')[0])
  return checkOutHour < 18
})

// 工作时长
const workDuration = computed(() => {
  if (!todayRecord.value.checkInTime || !todayRecord.value.checkOutTime) {
    return '--'
  }
  
  const [inHour, inMinute] = todayRecord.value.checkInTime.split(':').map(Number)
  const [outHour, outMinute] = todayRecord.value.checkOutTime.split(':').map(Number)
  
  const totalMinutes = (outHour * 60 + outMinute) - (inHour * 60 + inMinute)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  return `${hours}小时${minutes}分钟`
})

// 状态类型
const statusType = computed(() => {
  if (todayRecord.value.status === TeacherAttendanceStatus.PRESENT) return 'success'
  if (todayRecord.value.status === TeacherAttendanceStatus.LATE) return 'warning'
  if (todayRecord.value.status === TeacherAttendanceStatus.LEAVE) return 'default'
  return 'danger'
})

// 状态文本
const statusText = computed(() => {
  const statusMap = {
    [TeacherAttendanceStatus.PRESENT]: '正常',
    [TeacherAttendanceStatus.ABSENT]: '未打卡',
    [TeacherAttendanceStatus.LATE]: '迟到',
    [TeacherAttendanceStatus.EARLY_LEAVE]: '早退',
    [TeacherAttendanceStatus.LEAVE]: '请假',
  }
  return statusMap[todayRecord.value.status] || '未知'
})

// 日历天数
const calendarDays = computed(() => {
  const year = selectedMonth.value.getFullYear()
  const month = selectedMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startWeekday = firstDay.getDay()
  
  const days: CalendarDay[] = []
  
  // 添加上个月的日期
  const prevMonth = new Date(year, month, 0)
  const daysInPrevMonth = prevMonth.getDate()
  for (let i = startWeekday - 1; i >= 0; i--) {
    days.push({
      date: '',
      day: daysInPrevMonth - i,
      hasRecord: false,
    })
  }
  
  // 添加当月日期
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const record = monthRecords.value.find(r => r.attendanceDate === dateStr)
    
    let statusClass = ''
    if (record) {
      if (record.status === TeacherAttendanceStatus.PRESENT) statusClass = 'status-present'
      else if (record.status === TeacherAttendanceStatus.LATE) statusClass = 'status-late'
      else if (record.status === TeacherAttendanceStatus.LEAVE) statusClass = 'status-leave'
      else statusClass = 'status-absent'
    }
    
    days.push({
      date: dateStr,
      day: i,
      hasRecord: !!record,
      status: record?.status,
      statusClass,
    })
  }
  
  // 添加下个月的日期
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: '',
      day: i,
      hasRecord: false,
    })
  }
  
  return days
})

// ==================== 方法 ====================

// 更新当前时间
const updateCurrentTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
}

// 格式化月份
const formatMonth = (date: Date) => {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

// 签到
const handleCheckIn = async () => {
  checking.value = true
  try {
    const response = await apiCheckIn({
      teacherId: userStore.user?.teacherId || 0,
      userId: userStore.user?.id || 0,
      kindergartenId: userStore.user?.kindergartenId || 0,
    })

    if (response.success && response.data) {
      todayRecord.value = response.data as any
      showToast('签到成功')
      emit('refresh')
      await loadTodayAttendance()
    }
  } catch (error: any) {
    console.error('签到失败:', error)
    showToast(error.message || '签到失败')
  } finally {
    checking.value = false
  }
}

// 签退
const handleCheckOut = async () => {
  checking.value = true
  try {
    const response = await apiCheckOut({
      teacherId: userStore.user?.teacherId || 0,
    })

    if (response.success && response.data) {
      todayRecord.value = response.data as any
      showToast('签退成功')
      emit('refresh')
      await loadTodayAttendance()
    }
  } catch (error: any) {
    console.error('签退失败:', error)
    showToast(error.message || '签退失败')
  } finally {
    checking.value = false
  }
}

// 提交请假申请
const submitLeaveRequest = async () => {
  submitting.value = true
  try {
    const response = await apiCreateLeaveRequest({
      teacherId: userStore.user?.teacherId || 0,
      userId: userStore.user?.id || 0,
      kindergartenId: userStore.user?.kindergartenId || 0,
      leaveType: leaveForm.leaveType as LeaveType,
      leaveReason: leaveForm.reason,
      leaveStartTime: leaveForm.startDate.toISOString(),
      leaveEndTime: leaveForm.endDate.toISOString(),
    })

    if (response.success) {
      showToast('请假申请已提交')
      showLeaveDialog.value = false
      emit('refresh')
      await loadMonthRecords()
    }
  } catch (error: any) {
    console.error('提交请假申请失败:', error)
    showToast(error.message || '提交请假申请失败')
  } finally {
    submitting.value = false
  }
}

// 加载今日考勤
const loadTodayAttendance = async () => {
  try {
    const teacherId = userStore.user?.teacherId || 0
    if (!teacherId) return

    const response = await getTodayAttendance(teacherId)
    if (response.success && response.data) {
      todayRecord.value = response.data as any
    }
  } catch (error) {
    console.error('加载今日考勤失败:', error)
  }
}

// 加载本月考勤记录
const loadMonthRecords = async () => {
  try {
    const teacherId = userStore.user?.teacherId || 0
    if (!teacherId) return

    const date = new Date(selectedMonth.value)
    const year = date.getFullYear()
    const month = date.getMonth() + 1

    const response = await getMonthAttendance(teacherId, year, month)
    if (response.success && response.data) {
      monthRecords.value = response.data as any[]
      
      // 计算月度统计
      calculateMonthStats()
    }
  } catch (error) {
    console.error('加载本月考勤记录失败:', error)
  }
}

// 计算月度统计
const calculateMonthStats = () => {
  const totalDays = monthRecords.value.length
  const attendanceDays = monthRecords.value.filter(r => r.status === TeacherAttendanceStatus.PRESENT).length
  const lateCount = monthRecords.value.filter(r => r.status === TeacherAttendanceStatus.LATE).length
  const leaveCount = monthRecords.value.filter(r => r.status === TeacherAttendanceStatus.LEAVE).length
  
  monthStats.value = {
    attendanceDays,
    lateCount,
    leaveCount,
    attendanceRate: totalDays > 0 ? Math.round((attendanceDays / totalDays) * 100) : 0,
  }
}

// 获取日历日期样式类
const getCalendarDayClass = (day: CalendarDay) => {
  const classes = []
  if (!day.date) classes.push('empty-day')
  if (day.statusClass) classes.push(day.statusClass)
  
  // 今天高亮
  const today = new Date().toISOString().split('T')[0]
  if (day.date === today) classes.push('today')
  
  return classes.join(' ')
}

// 选择日期
const selectDate = (day: CalendarDay) => {
  if (!day.date || !day.hasRecord) return
  
  const record = monthRecords.value.find(r => r.attendanceDate === day.date)
  if (record) {
    showToast(`${day.date}: ${statusText.value}`)
  }
}

// 请假类型确认
const onLeaveTypeConfirm = ({ selectedValues }: any) => {
  leaveForm.leaveType = selectedValues[0]
  const column = leaveTypeColumns.find(c => c.value === selectedValues[0])
  leaveForm.leaveTypeText = column?.text || ''
  showLeaveTypePicker.value = false
}

// 开始日期确认
const onStartDateConfirm = () => {
  leaveForm.startDateText = leaveForm.startDate.toLocaleString('zh-CN')
  showStartDatePicker.value = false
}

// 结束日期确认
const onEndDateConfirm = () => {
  leaveForm.endDateText = leaveForm.endDate.toLocaleString('zh-CN')
  showEndDatePicker.value = false
}

// 月份确认
const onMonthConfirm = () => {
  loadMonthRecords()
  showMonthPicker.value = false
}

// ==================== 生命周期 ====================

onMounted(() => {
  updateCurrentTime()
  timeInterval = window.setInterval(updateCurrentTime, 1000)
  loadTodayAttendance()
  loadMonthRecords()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.teacher-checkin-tab {
  padding: var(--van-padding-md);
  
  .status-section,
  .action-section,
  .calendar-section {
    margin-bottom: var(--van-padding-md);
  }

  .status-card,
  .action-card,
  .calendar-card {
    .card-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: var(--van-font-size-lg);
      font-weight: var(--van-font-weight-bold);
      
      .van-icon {
        margin-right: var(--van-padding-xs);
        color: var(--van-primary-color);
      }
    }
  }

  .status-content {
    .status-item {
      text-align: center;
      padding: var(--van-padding-sm) 0;

      .status-label {
        font-size: var(--van-font-size-md);
        color: var(--van-gray-6);
        margin-bottom: var(--van-padding-xs);
      }

      .status-value {
        font-size: var(--van-font-size-xl);
        font-weight: var(--van-font-weight-bold);
        color: var(--van-gray-4);
        margin-bottom: var(--van-padding-xs);

        &.has-value {
          color: var(--van-text-color);
        }
      }
    }
  }

  .action-content {
    .current-time {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--van-padding-sm);
      font-size: var(--van-font-size-xl);
      font-weight: var(--van-font-weight-bold);
      color: var(--van-primary-color);
      margin-bottom: var(--van-padding-lg);
      
      .van-icon {
        font-size: var(--van-font-size-xl);
      }
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: var(--van-padding-md);
      margin-bottom: var(--van-padding-md);

      .checkin-btn,
      .checkout-btn {
        min-height: 60px;
        font-size: var(--van-font-size-lg);
        font-weight: var(--van-font-weight-bold);
      }
    }

    .leave-btn {
      min-height: 50px;
      font-weight: var(--van-font-weight-bold);
    }
  }

  .calendar-content {
    .month-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--van-padding-sm);
      margin-bottom: var(--van-padding-lg);

      .stat-item {
        text-align: center;
        padding: var(--van-padding-sm);
        background: var(--van-background-color-light);
        border-radius: var(--van-radius-sm);

        .stat-value {
          font-size: var(--van-font-size-xl);
          font-weight: var(--van-font-weight-bold);
          color: var(--van-primary-color);
          margin-bottom: var(--van-padding-xs);
        }

        .stat-label {
          font-size: var(--van-font-size-sm);
          color: var(--van-gray-6);
        }
      }
    }

    .mini-calendar {
      .calendar-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: var(--van-padding-xs);
        margin-bottom: var(--van-padding-xs);

        .weekday {
          text-align: center;
          font-size: var(--van-font-size-sm);
          color: var(--van-gray-6);
          font-weight: var(--van-font-weight-bold);
        }
      }

      .calendar-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: var(--van-padding-xs);

        .calendar-day {
          position: relative;
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: var(--van-radius-sm);
          font-size: var(--van-font-size-sm);
          background: var(--van-background-color-light);
          cursor: pointer;
          transition: all 0.2s;

          &:not(.empty-day):active {
            transform: scale(0.95);
          }

          .day-number {
            font-weight: var(--van-font-weight-bold);
          }

          .day-indicator {
            position: absolute;
            bottom: 2px;
            width: 6px;
            height: 6px;
            border-radius: 50%;

            &.status-present {
              background: var(--van-success-color);
            }

            &.status-late {
              background: var(--van-warning-color);
            }

            &.status-leave {
              background: var(--van-gray-5);
            }

            &.status-absent {
              background: var(--van-danger-color);
            }
          }

          &.today {
            background: var(--van-primary-color-light);
            color: var(--van-primary-color);
            font-weight: var(--van-font-weight-bold);
          }

          &.empty-day {
            background: transparent;
            color: var(--van-gray-4);
            cursor: default;
          }
        }
      }
    }
  }

  .leave-dialog {
    max-height: 80vh;
    overflow-y: auto;

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--van-padding-md);
      border-bottom: 1px solid var(--van-border-color);

      .dialog-title {
        font-size: var(--van-font-size-lg);
        font-weight: var(--van-font-weight-bold);
      }
    }

    .dialog-content {
      padding: var(--van-padding-md);
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .teacher-checkin-tab {
    max-width: 768px;
    margin: 0 auto;
    
    .calendar-content {
      .month-stats {
        .stat-item {
          .stat-value {
            font-size: var(--van-font-size-2xl);
          }
        }
      }
    }
  }
}
</style>