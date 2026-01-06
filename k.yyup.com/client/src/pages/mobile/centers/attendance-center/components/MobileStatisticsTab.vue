<template>
  <div class="mobile-statistics-tab">
    <!-- 时间范围选择 -->
    <van-card class="time-range-card">
      <van-cell-group inset>
        <van-field
          v-model="timeRangeText"
          readonly
          label="统计时间"
          placeholder="选择时间范围"
          @click="showTimeRangePicker = true"
        />
        <van-field
          v-model="statisticsTypeText"
          readonly
          label="统计类型"
          placeholder="选择统计类型"
          @click="showTypePicker = true"
        />
      </van-cell-group>
    </van-card>

    <!-- 统计概览 -->
    <van-card class="stats-overview-card">
      <template #title>
        <span class="card-title">统计概览</span>
      </template>

      <div v-if="statisticsData" class="stats-content">
        <!-- 日统计 -->
        <div v-if="statisticsType === 'daily'" class="daily-stats">
          <van-cell
            v-for="item in statisticsData.classes"
            :key="item.classId"
            :title="item.className"
            :label="`${item.totalStudents}名学生`"
          >
            <template #value>
              <div class="class-stats">
                <div class="attendance-rate">{{ item.attendanceRate }}%</div>
                <div class="detail-text">
                  出勤:{{ item.presentCount }} 缺勤:{{ item.absentCount }}
                </div>
              </div>
            </template>
          </van-cell>
        </div>

        <!-- 周/月/季度/年统计 -->
        <div v-else class="period-stats">
          <div class="period-summary">
            <van-row gutter="16">
              <van-col span="8">
                <div class="summary-item">
                  <div class="summary-value">{{ getTotalRecords() }}</div>
                  <div class="summary-label">总人次</div>
                </div>
              </van-col>
              <van-col span="8">
                <div class="summary-item">
                  <div class="summary-value">{{ getTotalPresent() }}</div>
                  <div class="summary-label">出勤人次</div>
                </div>
              </van-col>
              <van-col span="8">
                <div class="summary-item">
                  <div class="summary-value">{{ getAverageRate() }}%</div>
                  <div class="summary-label">平均出勤率</div>
                </div>
              </van-col>
            </van-row>
          </div>

          <!-- 图表展示 -->
          <div class="chart-container">
            <div class="chart-title">出勤趋势图</div>
            <div class="chart-placeholder">
              <van-empty description="图表加载中..." />
            </div>
          </div>

          <!-- 详细数据列表 -->
          <div class="data-list">
            <van-cell
              v-for="(item, index) in getStatisticsList()"
              :key="index"
              :title="item.date || `${item.month}月` || `Q${item.quarter}` || `${item.year}年`"
            >
              <template #value>
                <div class="period-item-stats">
                  <div class="rate">{{ item.attendanceRate }}%</div>
                  <div class="detail">
                    {{ item.presentCount }}/{{ item.totalRecords }}
                  </div>
                </div>
              </template>
            </van-cell>
          </div>
        </div>
      </div>

      <van-empty v-else description="暂无统计数据" />
    </van-card>

    <!-- 时间范围选择器 -->
    <van-popup v-model:show="showTimeRangePicker" position="bottom">
      <van-picker
        :columns="timeRangeColumns"
        @confirm="onTimeRangeConfirm"
        @cancel="showTimeRangePicker = false"
        title="选择时间范围"
      />
    </van-popup>

    <!-- 统计类型选择器 -->
    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="typeColumns"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
        title="选择统计类型"
      />
    </van-popup>

    <!-- 自定义日期选择 -->
    <van-popup v-model:show="showCustomDatePicker" position="bottom">
      <div class="custom-date-picker">
        <div class="picker-header">
          <van-button plain @click="showCustomDatePicker = false">取消</van-button>
          <span class="picker-title">选择日期范围</span>
          <van-button type="primary" @click="onCustomDateConfirm">确定</van-button>
        </div>
        <div class="picker-content">
          <div class="date-item">
            <div class="date-label">开始日期</div>
            <van-date-picker
              v-model="customStartDate"
              :max-date="customEndDate || new Date()"
              title="开始日期"
            />
          </div>
          <div class="date-item">
            <div class="date-label">结束日期</div>
            <van-date-picker
              v-model="customEndDate"
              :min-date="customStartDate"
              :max-date="new Date()"
              title="结束日期"
            />
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import {
  getDailyStatistics,
  getWeeklyStatistics,
  getMonthlyStatistics,
  getQuarterlyStatistics,
  getYearlyStatistics,
  type DailyStatistics,
  type WeeklyStatistics,
  type MonthlyStatistics,
  type QuarterlyStatistics,
  type YearlyStatistics,
} from '@/api/modules/attendance-center'

interface Props {
  kindergartenId: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  refresh: []
}>()

// 响应式数据
const statisticsType = ref('daily')
const timeRange = ref('today')
const showTimeRangePicker = ref(false)
const showTypePicker = ref(false)
const showCustomDatePicker = ref(false)

// 统计数据
const statisticsData = ref<
  DailyStatistics | WeeklyStatistics | MonthlyStatistics | QuarterlyStatistics | YearlyStatistics | null
>(null)

// 自定义日期范围
const customStartDate = ref(new Date())
const customEndDate = ref(new Date())

// 选择器配置
const timeRangeColumns = [
  { text: '今天', value: 'today' },
  { text: '昨天', value: 'yesterday' },
  { text: '本周', value: 'thisWeek' },
  { text: '上周', value: 'lastWeek' },
  { text: '本月', value: 'thisMonth' },
  { text: '上月', value: 'lastMonth' },
  { text: '本季度', value: 'thisQuarter' },
  { text: '上季度', value: 'lastQuarter' },
  { text: '本年', value: 'thisYear' },
  { text: '上年', value: 'lastYear' },
  { text: '自定义', value: 'custom' },
]

const typeColumns = [
  { text: '日统计', value: 'daily' },
  { text: '周统计', value: 'weekly' },
  { text: '月统计', value: 'monthly' },
  { text: '季度统计', value: 'quarterly' },
  { text: '年统计', value: 'yearly' },
]

// 计算属性
const statisticsTypeText = computed(() => {
  const type = typeColumns.find(t => t.value === statisticsType.value)
  return type?.text || '选择统计类型'
})

const timeRangeText = computed(() => {
  const range = timeRangeColumns.find(r => r.value === timeRange.value)
  if (timeRange.value === 'custom') {
    return `${customStartDate.value.toLocaleDateString()} - ${customEndDate.value.toLocaleDateString()}`
  }
  return range?.text || '选择时间范围'
})

// 方法
const loadStatistics = async () => {
  try {
    showLoadingToast({ message: '加载中...', forbidClick: true })
    let response

    switch (statisticsType.value) {
      case 'daily':
        response = await getDailyStatistics({
          kindergartenId: props.kindergartenId,
          date: getDateForRange(),
        })
        break
      case 'weekly':
        const { startDate, endDate } = getWeekRange()
        response = await getWeeklyStatistics({
          kindergartenId: props.kindergartenId,
          startDate,
          endDate,
        })
        break
      case 'monthly':
        const date = getDateForRange()
        const monthData = new Date(date)
        response = await getMonthlyStatistics({
          kindergartenId: props.kindergartenId,
          year: monthData.getFullYear(),
          month: monthData.getMonth() + 1,
        })
        break
      case 'quarterly':
        const quarterDate = getDateForRange()
        const quarter = Math.floor((quarterDate.getMonth() + 3) / 3)
        response = await getQuarterlyStatistics({
          kindergartenId: props.kindergartenId,
          year: quarterDate.getFullYear(),
          quarter,
        })
        break
      case 'yearly':
        const yearDate = getDateForRange()
        response = await getYearlyStatistics({
          kindergartenId: props.kindergartenId,
          year: yearDate.getFullYear(),
        })
        break
      default:
        throw new Error('不支持的统计类型')
    }

    if (response.success && response.data) {
      statisticsData.value = response.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    showToast('加载统计数据失败')
  } finally {
    closeToast()
  }
}

const getDateForRange = (): string => {
  const now = new Date()
  switch (timeRange.value) {
    case 'today':
      return now.toISOString().split('T')[0]
    case 'yesterday':
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      return yesterday.toISOString().split('T')[0]
    case 'thisMonth':
      return now.toISOString().split('T')[0]
    case 'lastMonth':
      const lastMonth = new Date(now)
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      return lastMonth.toISOString().split('T')[0]
    case 'custom':
      return customStartDate.value.toISOString().split('T')[0]
    default:
      return now.toISOString().split('T')[0]
  }
}

const getWeekRange = () => {
  const now = new Date()
  let startDate: Date
  let endDate: Date

  if (timeRange.value === 'thisWeek') {
    const dayOfWeek = now.getDay()
    startDate = new Date(now)
    startDate.setDate(now.getDate() - dayOfWeek)
    endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
  } else if (timeRange.value === 'lastWeek') {
    const dayOfWeek = now.getDay()
    startDate = new Date(now)
    startDate.setDate(now.getDate() - dayOfWeek - 7)
    endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
  } else {
    startDate = customStartDate.value
    endDate = customEndDate.value
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  }
}

const getTotalRecords = (): number => {
  if (!statisticsData.value) return 0
  if ('dailyData' in statisticsData.value) {
    return statisticsData.value.dailyData.reduce((sum, item) => sum + item.totalRecords, 0)
  } else if ('monthlyData' in statisticsData.value) {
    return statisticsData.value.monthlyData.reduce((sum, item) => sum + item.totalRecords, 0)
  }
  return 0
}

const getTotalPresent = (): number => {
  if (!statisticsData.value) return 0
  if ('dailyData' in statisticsData.value) {
    return statisticsData.value.dailyData.reduce((sum, item) => sum + item.presentCount, 0)
  } else if ('monthlyData' in statisticsData.value) {
    return statisticsData.value.monthlyData.reduce((sum, item) => sum + item.presentCount, 0)
  }
  return 0
}

const getAverageRate = (): string => {
  const total = getTotalRecords()
  const present = getTotalPresent()
  return total > 0 ? ((present / total) * 100).toFixed(1) : '0'
}

const getStatisticsList = () => {
  if (!statisticsData.value) return []
  if ('dailyData' in statisticsData.value) {
    return statisticsData.value.dailyData
  } else if ('monthlyData' in statisticsData.value) {
    return statisticsData.value.monthlyData
  }
  return []
}

// 事件处理
const onTimeRangeConfirm = ({ selectedValues }) => {
  timeRange.value = selectedValues[0]
  showTimeRangePicker.value = false
  if (timeRange.value === 'custom') {
    showCustomDatePicker.value = true
  } else {
    loadStatistics()
  }
}

const onTypeConfirm = ({ selectedValues }) => {
  statisticsType.value = selectedValues[0]
  showTypePicker.value = false
  loadStatistics()
}

const onCustomDateConfirm = () => {
  showCustomDatePicker.value = false
  loadStatistics()
}

// 生命周期
onMounted(() => {
  loadStatistics()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-statistics-tab {
  .time-range-card {
    margin: 0 0 12px 0;
  }

  .stats-overview-card {
    margin: 0;

    :deep(.van-card__header) {
      padding: var(--spacing-md) 16px 0;
    }

    :deep(.van-card__content) {
      padding: 0 16px 16px;
    }

    .card-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
    }

    .stats-content {
      .class-stats {
        text-align: right;

        .attendance-rate {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--van-primary-color);
          margin-bottom: 4px;
        }

        .detail-text {
          font-size: var(--text-xs);
          color: var(--van-text-color-2);
        }
      }

      .period-summary {
        margin-bottom: 16px;

        .summary-item {
          text-align: center;
          padding: var(--spacing-md);
          background: var(--van-background-color);
          border-radius: 8px;

          .summary-value {
            font-size: var(--text-xl);
            font-weight: 600;
            color: var(--van-primary-color);
            margin-bottom: 4px;
          }

          .summary-label {
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
          }
        }
      }

      .chart-container {
        margin: var(--spacing-md) 0;
        padding: var(--spacing-md);
        background: var(--van-background-color);
        border-radius: 8px;

        .chart-title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--van-text-color);
          margin-bottom: 12px;
        }

        .chart-placeholder {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .data-list {
        .period-item-stats {
          text-align: right;

          .rate {
            font-size: var(--text-base);
            font-weight: 600;
            color: var(--van-primary-color);
            margin-bottom: 4px;
          }

          .detail {
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
          }
        }
      }
    }
  }

  .custom-date-picker {
    height: 70vh;
    display: flex;
    flex-direction: column;

    .picker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--van-border-color);

      .picker-title {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--van-text-color);
      }
    }

    .picker-content {
      flex: 1;
      overflow-y: auto;

      .date-item {
        margin-bottom: 16px;

        .date-label {
          padding: var(--spacing-md);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--van-text-color);
        }
      }
    }
  }
}
</style>