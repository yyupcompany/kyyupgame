<template>
  <div class="attendance-tab">
    <!-- 月份选择 -->
    <van-cell-group inset>
      <van-field
        v-model="currentMonthText"
        label="月份"
        placeholder="选择月份"
        readonly
        is-link
        @click="showMonthPicker = true"
      />
    </van-cell-group>

    <!-- 考勤统计 -->
    <div class="attendance-stats">
      <van-grid :column-num="4" :gutter="8">
        <van-grid-item>
          <div class="stat-item">
            <div class="stat-value present">{{ attendanceStats.present }}</div>
            <div class="stat-label">出勤</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-item">
            <div class="stat-value absent">{{ attendanceStats.absent }}</div>
            <div class="stat-label">缺勤</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-item">
            <div class="stat-value leave">{{ attendanceStats.leave }}</div>
            <div class="stat-label">请假</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-item">
            <div class="stat-value late">{{ attendanceStats.late }}</div>
            <div class="stat-label">迟到</div>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- 出勤率 -->
    <div class="attendance-rate">
      <van-cell-group inset>
        <van-cell title="出勤率">
          <template #value>
            <div class="rate-display">
              <div class="rate-value">{{ attendanceRate }}%</div>
              <van-progress
                :percentage="attendanceRate"
                color="#52c41a"
                :show-pivot="false"
                stroke-width="6"
              />
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 日历视图 -->
    <van-cell-group title="考勤日历" inset>
      <div class="calendar-container">
        <div class="calendar-weekdays">
          <div v-for="day in weekdays" :key="day" class="weekday">
            {{ day }}
          </div>
        </div>
        <div class="calendar-grid">
          <div
            v-for="day in calendarDays"
            :key="day.date"
            :class="['calendar-day', day.status, { 'today': day.isToday }]"
            @click="viewDayDetail(day)"
          >
            <div class="day-number">{{ day.day }}</div>
            <div v-if="day.status !== 'empty'" class="attendance-indicator"></div>
          </div>
        </div>
      </div>
    </van-cell-group>

    <!-- 最近考勤记录 -->
    <van-cell-group title="最近考勤记录" inset>
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadMoreRecords"
      >
        <div
          v-for="record in attendanceRecords"
          :key="record.id"
          class="attendance-record"
        >
          <div class="record-date">
            <div class="date-text">{{ formatDate(record.date) }}</div>
            <div class="weekday-text">{{ getWeekdayText(record.date) }}</div>
          </div>

          <div class="record-status">
            <van-tag
              :type="getStatusTagType(record.status)"
              size="medium"
            >
              {{ getStatusText(record.status) }}
            </van-tag>
          </div>

          <div class="record-details">
            <div v-if="record.checkInTime" class="detail-item">
              <van-icon name="clock-o" size="12" />
              <span>签到: {{ record.checkInTime }}</span>
            </div>
            <div v-if="record.checkOutTime" class="detail-item">
              <van-icon name="completed" size="12" />
              <span>签退: {{ record.checkOutTime }}</span>
            </div>
            <div v-if="record.duration" class="detail-item">
              <van-icon name="timer-o" size="12" />
              <span>时长: {{ record.duration }}</span>
            </div>
          </div>

          <div class="record-note" v-if="record.note">
            <div class="note-content">{{ record.note }}</div>
          </div>

          <div class="record-teacher" v-if="record.teacher">
            <van-icon name="contact" size="12" />
            <span>记录人: {{ record.teacher }}</span>
          </div>
        </div>
      </van-list>
    </van-cell-group>

    <!-- 月度分析 -->
    <van-cell-group title="月度分析" inset>
      <div class="monthly-analysis">
        <div class="trend-chart">
          <div id="attendanceTrendChart" class="chart"></div>
        </div>

        <div class="analysis-cards">
          <div class="analysis-card">
            <div class="card-title">出勤趋势</div>
            <div class="card-value">
              {{ getTrendText(attendanceTrend) }}
              <van-icon
                :name="attendanceTrend >= 0 ? 'trend-up' : 'trend-down'"
                :color="attendanceTrend >= 0 ? '#52c41a' : '#ff4d4f'"
              />
            </div>
          </div>

          <div class="analysis-card">
            <div class="card-title">连续出勤</div>
            <div class="card-value">{{ consecutiveDays }}天</div>
          </div>

          <div class="analysis-card">
            <div class="card-title">异常情况</div>
            <div class="card-value">{{ abnormalCount }}次</div>
          </div>
        </div>
      </div>
    </van-cell-group>

    <!-- 月份选择器 -->
    <van-popup v-model:show="showMonthPicker" position="bottom">
      <van-date-picker
        v-model="currentMonth"
        :columns-type="['year', 'month']"
        @confirm="onMonthConfirm"
        @cancel="showMonthPicker = false"
      />
    </van-popup>

    <!-- 考勤详情弹窗 -->
    <van-popup
      v-model:show="showDetailDialog"
      position="bottom"
      :style="{ height: '60%' }"
      round
    >
      <div class="detail-dialog">
        <div class="dialog-header">
          <h3>考勤详情</h3>
          <van-button size="small" @click="showDetailDialog = false">
            关闭
          </van-button>
        </div>
        <div class="dialog-content" v-if="selectedDayRecord">
          <van-cell-group>
            <van-cell title="日期" :value="formatDate(selectedDayRecord.date)" />
            <van-cell title="状态">
              <template #value>
                <van-tag
                  :type="getStatusTagType(selectedDayRecord.status)"
                  size="medium"
                >
                  {{ getStatusText(selectedDayRecord.status) }}
                </van-tag>
              </template>
            </van-cell>
            <van-cell title="签到时间" :value="selectedDayRecord.checkInTime || '-' " />
            <van-cell title="签退时间" :value="selectedDayRecord.checkOutTime || '-'" />
            <van-cell title="在园时长" :value="selectedDayRecord.duration || '-'" />
            <van-cell title="记录老师" :value="selectedDayRecord.teacher || '-'" />
            <van-cell title="备注" v-if="selectedDayRecord.note">
              <template #title>
                <div class="remark-content">{{ selectedDayRecord.note }}</div>
              </template>
            </van-cell>
          </van-cell-group>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { showToast } from 'vant'

interface Props {
  studentId: string
}

const props = defineProps<Props>()

// 响应式数据
const loading = ref(false)
const finished = ref(false)
const showMonthPicker = ref(false)
const showDetailDialog = ref(false)
const currentMonth = ref(new Date())

// 考勤统计数据
const attendanceStats = reactive({
  present: 18,
  absent: 1,
  leave: 2,
  late: 1
})

// 考勤记录
const attendanceRecords = ref([
  {
    id: 1,
    date: '2024-03-15',
    status: 'present',
    checkInTime: '08:30',
    checkOutTime: '16:30',
    duration: '8小时',
    teacher: '王老师',
    note: '表现良好'
  },
  {
    id: 2,
    date: '2024-03-14',
    status: 'leave',
    checkInTime: null,
    checkOutTime: null,
    duration: null,
    teacher: '李老师',
    note: '因病请假'
  },
  {
    id: 3,
    date: '2024-03-13',
    status: 'late',
    checkInTime: '09:15',
    checkOutTime: '16:30',
    duration: '7小时15分',
    teacher: '张老师',
    note: '迟到15分钟'
  }
])

// 其他统计数据
const attendanceTrend = ref(2.5) // 相比上月的增长率
const consecutiveDays = ref(5) // 连续出勤天数
const abnormalCount = ref(2) // 异常情况次数
const selectedDayRecord = ref(null)

// 星期和日历数据
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  const today = new Date()

  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)

    const isCurrentMonth = currentDate.getMonth() === month
    const isToday = currentDate.toDateString() === today.toDateString()
    const dayNum = currentDate.getDate()

    let status = 'empty'
    if (isCurrentMonth) {
      if (dayNum <= 20) {
        status = 'present'
      } else if (dayNum === 21) {
        status = 'absent'
      } else if (dayNum === 22) {
        status = 'leave'
      } else if (dayNum === 23) {
        status = 'late'
      }
    }

    days.push({
      day: isCurrentMonth ? dayNum : '',
      date: currentDate.toISOString().split('T')[0],
      status,
      isToday
    })
  }

  return days
})

// 计算属性
const currentMonthText = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth() + 1
  return `${year}年${month}月`
})

const attendanceRate = computed(() => {
  const total = attendanceStats.present + attendanceStats.absent + attendanceStats.leave
  if (total === 0) return 0
  return Math.round((attendanceStats.present / total) * 100)
})

// 工具函数
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric'
  })
}

const getWeekdayText = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return weekdays[date.getDay()]
}

const getStatusTagType = (status: string) => {
  const statusMap: Record<string, string> = {
    present: 'success',
    absent: 'danger',
    leave: 'warning',
    late: 'info'
  }
  return statusMap[status] || 'default'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    present: '出勤',
    absent: '缺勤',
    leave: '请假',
    late: '迟到'
  }
  return statusMap[status] || status
}

const getTrendText = (trend: number) => {
  return trend >= 0 ? `上升${Math.abs(trend)}%` : `下降${Math.abs(trend)}%`
}

// 事件处理
const onMonthConfirm = () => {
  showMonthPicker.value = false
  loadAttendanceData()
}

const viewDayDetail = (day: any) => {
  if (day.status === 'empty' || !day.date) return

  // 查找对应的考勤记录
  selectedDayRecord.value = attendanceRecords.value.find(
    record => record.date === day.date
  ) || {
    date: day.date,
    status: day.status,
    checkInTime: '08:30',
    checkOutTime: '16:30',
    duration: '8小时',
    teacher: '系统',
    note: day.status === 'present' ? '正常出勤' : '有特殊情况'
  }

  showDetailDialog.value = true
}

const loadMoreRecords = () => {
  loading.value = true
  setTimeout(() => {
    // 模拟加载更多数据
    loading.value = false
    finished.value = true
  }, 1000)
}

const loadAttendanceData = () => {
  // 根据选择的月份加载考勤数据
  showToast('加载考勤数据...')
}

// 绘制趋势图
const drawTrendChart = () => {
  const chartElement = document.getElementById('attendanceTrendChart')
  if (chartElement) {
    chartElement.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">考勤趋势图</div>'
  }
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    drawTrendChart()
  })
})
</script>

<style lang="scss" scoped>
.attendance-tab {
  padding: var(--spacing-md) 0;

  .attendance-stats {
    margin: 0 16px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: var(--spacing-md);

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--spacing-md) 8px;

      .stat-value {
        font-size: var(--text-xl);
        font-weight: bold;
        color: white;
        margin-bottom: 4px;

        &.present { color: #52c41a; }
        &.absent { color: #ff4d4f; }
        &.leave { color: #faad14; }
        &.late { color: #1890ff; }
      }

      .stat-label {
        font-size: var(--text-xs);
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }

  .rate-display {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--spacing-xs);

    .rate-value {
      font-size: var(--text-lg);
      font-weight: bold;
      color: var(--van-text-color);
    }
  }

  .calendar-container {
    padding: var(--spacing-md);

    .calendar-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: var(--spacing-xs);
      margin-bottom: 8px;

      .weekday {
        text-align: center;
        font-size: var(--text-xs);
        font-weight: 600;
        color: var(--van-text-color-2);
        padding: var(--spacing-sm) 0;
      }
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: var(--spacing-xs);

      .calendar-day {
        aspect-ratio: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        border-radius: 8px;
        font-size: var(--text-sm);
        cursor: pointer;

        &.present {
          background: #f6ffed;
          color: #52c41a;

          .attendance-indicator {
            background: #52c41a;
          }
        }

        &.absent {
          background: #fff2f0;
          color: #ff4d4f;

          .attendance-indicator {
            background: #ff4d4f;
          }
        }

        &.leave {
          background: #fffbe6;
          color: #faad14;

          .attendance-indicator {
            background: #faad14;
          }
        }

        &.late {
          background: #e6f7ff;
          color: #1890ff;

          .attendance-indicator {
            background: #1890ff;
          }
        }

        &.today {
          border: 2px solid #1890ff;
          font-weight: bold;
        }

        .day-number {
          font-size: var(--text-sm);
        }

        .attendance-indicator {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          position: absolute;
          bottom: 6px;
        }
      }
    }
  }

  .attendance-record {
    background: white;
    border-radius: 8px;
    padding: var(--spacing-md);
    margin: 0 16px 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .record-date {
      display: flex;
      align-items: baseline;
      margin-bottom: 8px;

      .date-text {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--van-text-color);
        margin-right: 8px;
      }

      .weekday-text {
        font-size: var(--text-xs);
        color: var(--van-text-color-3);
      }
    }

    .record-status {
      margin-bottom: 12px;
    }

    .record-details {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-md);
      margin-bottom: 8px;

      .detail-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-xs);
        color: var(--van-text-color-2);
      }
    }

    .record-note {
      background: #f8f9fa;
      padding: var(--spacing-sm);
      border-radius: 4px;
      margin-bottom: 8px;

      .note-content {
        font-size: var(--text-sm);
        color: var(--van-text-color-2);
        line-height: 1.4;
      }
    }

    .record-teacher {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--text-xs);
      color: var(--van-text-color-3);
    }
  }

  .monthly-analysis {
    padding: var(--spacing-sm);

    .trend-chart {
      padding: var(--spacing-lg);
      background: white;
      margin-bottom: 12px;
      border-radius: 8px;

      .chart {
        width: 100%;
        height: 150px;
        background: #f8f9fa;
        border-radius: 8px;
      }
    }

    .analysis-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-sm);

      .analysis-card {
        background: white;
        padding: var(--spacing-md) 8px;
        border-radius: 8px;
        text-align: center;

        .card-title {
          font-size: var(--text-xs);
          color: var(--van-text-color-3);
          margin-bottom: 4px;
        }

        .card-value {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--van-text-color);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-xs);
        }
      }
    }
  }
}

.detail-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) 20px;
    border-bottom: 1px solid #ebedf0;

    h3 {
      margin: 0;
      font-size: var(--text-base);
      font-weight: 600;
    }
  }

  .dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: 0;

    .remark-content {
      white-space: pre-wrap;
      line-height: 1.5;
      color: var(--van-text-color-2);
    }
  }
}

:deep(.van-cell-group) {
  margin: 0 16px 16px;
}

:deep(.van-progress) {
  width: 80px;
}
</style>