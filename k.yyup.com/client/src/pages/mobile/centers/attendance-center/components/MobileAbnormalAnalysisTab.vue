<template>
  <div class="mobile-abnormal-analysis-tab">
    <!-- 时间范围选择 -->
    <van-card class="filter-card">
      <van-cell-group inset>
        <van-field
          v-model="dateRangeText"
          readonly
          label="分析时间"
          placeholder="选择时间范围"
          @click="showDateRangePicker = true"
        />
      </van-cell-group>
    </van-card>

    <!-- 异常概览统计 -->
    <van-card class="overview-card">
      <template #title>
        <span class="card-title">异常情况概览</span>
      </template>

      <div v-if="abnormalData" class="overview-stats">
        <van-row gutter="16">
          <van-col span="8">
            <div class="stat-item">
              <div class="stat-icon consecutive">
                <van-icon name="warning-o" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ abnormalData.consecutiveAbsent?.length || 0 }}</div>
                <div class="stat-label">连续缺勤</div>
              </div>
            </div>
          </van-col>
          <van-col span="8">
            <div class="stat-item">
              <div class="stat-icon frequent">
                <van-icon name="clock-o" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ abnormalData.frequentLate?.length || 0 }}</div>
                <div class="stat-label">频繁迟到</div>
              </div>
            </div>
          </van-col>
          <van-col span="8">
            <div class="stat-item">
              <div class="stat-icon early">
                <van-icon name="success" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ abnormalData.frequentEarlyLeave?.length || 0 }}</div>
                <div class="stat-label">频繁早退</div>
              </div>
            </div>
          </van-col>
        </van-row>
      </div>

      <van-empty v-else description="暂无异常数据" />
    </van-card>

    <!-- 异常详情列表 -->
    <div v-if="abnormalData" class="abnormal-list">
      <!-- 连续缺勤学生 -->
      <van-card
        v-if="abnormalData.consecutiveAbsent?.length > 0"
        class="abnormal-section"
      >
        <template #title>
          <div class="section-header">
            <span class="section-title">连续缺勤学生</span>
            <van-tag type="danger" size="medium">
              {{ abnormalData.consecutiveAbsent.length }}人
            </van-tag>
          </div>
        </template>

        <div class="student-list">
          <van-cell
            v-for="student in abnormalData.consecutiveAbsent"
            :key="student.studentId"
            :title="student.studentName"
            :label="student.className"
            is-link
            @click="viewStudentDetail(student, 'consecutive')"
          >
            <template #value>
              <div class="student-info">
                <div class="consecutive-days">
                  连续{{ student.consecutiveDays }}天
                </div>
                <div class="last-date">
                  {{ formatDate(student.lastAbsentDate) }}
                </div>
              </div>
            </template>
          </van-cell>
        </div>
      </van-card>

      <!-- 频繁迟到学生 -->
      <van-card
        v-if="abnormalData.frequentLate?.length > 0"
        class="abnormal-section"
      >
        <template #title>
          <div class="section-header">
            <span class="section-title">频繁迟到学生</span>
            <van-tag type="warning" size="medium">
              {{ abnormalData.frequentLate.length }}人
            </van-tag>
          </div>
        </template>

        <div class="student-list">
          <van-cell
            v-for="student in abnormalData.frequentLate"
            :key="student.studentId"
            :title="student.studentName"
            :label="student.className"
            is-link
            @click="viewStudentDetail(student, 'late')"
          >
            <template #value>
              <div class="student-info">
                <div class="late-count">
                  迟到{{ student.lateCount }}次
                </div>
                <div class="recent-dates">
                  最近: {{ formatDate(student.lateDates[0]) }}
                </div>
              </div>
            </template>
          </van-cell>
        </div>
      </van-card>

      <!-- 频繁早退学生 -->
      <van-card
        v-if="abnormalData.frequentEarlyLeave?.length > 0"
        class="abnormal-section"
      >
        <template #title>
          <div class="section-header">
            <span class="section-title">频繁早退学生</span>
            <van-tag type="primary" size="medium">
              {{ abnormalData.frequentEarlyLeave.length }}人
            </van-tag>
          </div>
        </template>

        <div class="student-list">
          <van-cell
            v-for="student in abnormalData.frequentEarlyLeave"
            :key="student.studentId"
            :title="student.studentName"
            :label="student.className"
            is-link
            @click="viewStudentDetail(student, 'early')"
          >
            <template #value>
              <div class="student-info">
                <div class="early-count">
                  早退{{ student.earlyLeaveCount }}次
                </div>
                <div class="recent-dates">
                  最近: {{ formatDate(student.earlyLeaveDates[0]) }}
                </div>
              </div>
            </template>
          </van-cell>
        </div>
      </van-card>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <van-loading>分析中...</van-loading>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && (!abnormalData || hasNoAbnormalData)" class="empty-container">
      <van-empty description="暂无异常情况" />
      <div class="empty-tip">
        <p>所有学生考勤情况正常，继续保持！</p>
      </div>
    </div>

    <!-- 日期范围选择器 -->
    <van-popup v-model:show="showDateRangePicker" position="bottom">
      <div class="date-range-picker">
        <div class="picker-header">
          <van-button plain @click="showDateRangePicker = false">取消</van-button>
          <span class="picker-title">选择分析时间范围</span>
          <van-button type="primary" @click="onDateRangeConfirm">确定</van-button>
        </div>
        <div class="picker-content">
          <div class="date-item">
            <div class="date-label">开始日期</div>
            <van-date-picker
              v-model="startDate"
              :max-date="endDate || new Date()"
              title="开始日期"
            />
          </div>
          <div class="date-item">
            <div class="date-label">结束日期</div>
            <van-date-picker
              v-model="endDate"
              :min-date="startDate"
              :max-date="new Date()"
              title="结束日期"
            />
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 学生详情弹窗 -->
    <van-popup v-model:show="showStudentDetail" position="bottom" :style="{ height: '70%' }">
      <div class="student-detail-popup">
        <div class="popup-header">
          <van-button plain @click="showStudentDetail = false">关闭</van-button>
          <span class="popup-title">学生考勤详情</span>
          <van-button type="primary" @click="contactParent">联系家长</van-button>
        </div>
        <div class="popup-content" v-if="selectedStudent">
          <van-cell-group inset title="基本信息">
            <van-cell title="学生姓名" :value="selectedStudent.studentName" />
            <van-cell title="所属班级" :value="selectedStudent.className" />
            <van-cell title="异常类型" :value="getAbnormalTypeText(selectedStudentType)" />
          </van-cell-group>

          <van-cell-group inset title="异常详情">
            <van-cell
              v-if="selectedStudentType === 'consecutive'"
              title="连续缺勤天数"
              :value="`${selectedStudent.consecutiveDays}天`"
            />
            <van-cell
              v-if="selectedStudentType === 'consecutive'"
              title="最后缺勤日期"
              :value="formatDate(selectedStudent.lastAbsentDate)"
            />
            <van-cell
              v-if="selectedStudentType === 'late'"
              title="迟到次数"
              :value="`${selectedStudent.lateCount}次`"
            />
            <van-cell
              v-if="selectedStudentType === 'early'"
              title="早退次数"
              :value="`${selectedStudent.earlyLeaveCount}次`"
            />
          </van-cell-group>

          <van-cell-group inset title="异常日期">
            <van-cell
              v-for="(date, index) in getAbnormalDates()"
              :key="index"
              :title="formatDate(date)"
              :value="getDayOfWeek(date)"
            />
          </van-cell-group>

          <div class="action-buttons">
            <van-button type="warning" block @click="createReminder">
              创建提醒
            </van-button>
            <van-button type="primary" block @click="viewFullHistory" style="margin-top: 8px">
              查看完整考勤记录
            </van-button>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useRouter } from 'vue-router'
import {
  getAbnormalAnalysis,
  type AbnormalAnalysis,
} from '@/api/modules/attendance-center'

interface Props {
  kindergartenId: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  refresh: []
}>()

const router = useRouter()

// 响应式数据
const loading = ref(false)
const abnormalData = ref<AbnormalAnalysis | null>(null)
const showDateRangePicker = ref(false)
const showStudentDetail = ref(false)
const selectedStudent = ref<any>(null)
const selectedStudentType = ref<'consecutive' | 'late' | 'early'>('consecutive')

// 日期范围
const startDate = ref(new Date())
const endDate = ref(new Date())

// 计算属性
const dateRangeText = computed(() => {
  return `${startDate.value.toLocaleDateString()} - ${endDate.value.toLocaleDateString()}`
})

const hasNoAbnormalData = computed(() => {
  if (!abnormalData.value) return true
  return (
    (abnormalData.value.consecutiveAbsent?.length || 0) === 0 &&
    (abnormalData.value.frequentLate?.length || 0) === 0 &&
    (abnormalData.value.frequentEarlyLeave?.length || 0) === 0
  )
})

// 方法
const loadAbnormalAnalysis = async () => {
  try {
    loading.value = true
    showLoadingToast({ message: '分析中...', forbidClick: true })

    const response = await getAbnormalAnalysis({
      kindergartenId: props.kindergartenId,
      startDate: startDate.value.toISOString().split('T')[0],
      endDate: endDate.value.toISOString().split('T')[0],
    })

    if (response.success && response.data) {
      abnormalData.value = response.data
    }
  } catch (error) {
    console.error('加载异常分析失败:', error)
    showToast('加载异常分析失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const getDayOfWeek = (dateStr: string): string => {
  const date = new Date(dateStr)
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[date.getDay()]
}

const viewStudentDetail = (student: any, type: 'consecutive' | 'late' | 'early') => {
  selectedStudent.value = student
  selectedStudentType.value = type
  showStudentDetail.value = true
}

const getAbnormalTypeText = (type: string): string => {
  switch (type) {
    case 'consecutive':
      return '连续缺勤'
    case 'late':
      return '频繁迟到'
    case 'early':
      return '频繁早退'
    default:
      return '考勤异常'
  }
}

const getAbnormalDates = (): string[] => {
  if (!selectedStudent.value) return []

  switch (selectedStudentType.value) {
    case 'late':
      return selectedStudent.value.lateDates || []
    case 'early':
      return selectedStudent.value.earlyLeaveDates || []
    case 'consecutive':
      // 为连续缺勤生成最近几天的日期
      const dates = []
      const lastDate = new Date(selectedStudent.value.lastAbsentDate)
      for (let i = selectedStudent.value.consecutiveDays - 1; i >= 0; i--) {
        const date = new Date(lastDate)
        date.setDate(lastDate.getDate() - i)
        dates.push(date.toISOString().split('T')[0])
      }
      return dates
    default:
      return []
  }
}

const contactParent = () => {
  showToast(`联系${selectedStudent.value?.studentName}的家长`)
  // TODO: 实现联系家长功能
}

const createReminder = () => {
  showToast('已创建提醒')
  showStudentDetail.value = false
  // TODO: 实现创建提醒功能
}

const viewFullHistory = () => {
  if (selectedStudent.value) {
    router.push({
      path: '/mobile/attendance/student-history',
      query: {
        studentId: selectedStudent.value.studentId,
        studentName: selectedStudent.value.studentName,
      }
    })
  }
}

const onDateRangeConfirm = () => {
  showDateRangePicker.value = false
  loadAbnormalAnalysis()
}

// 生命周期
onMounted(() => {
  // 设置默认日期范围为最近30天
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)
  startDate.value = thirtyDaysAgo
  endDate.value = now

  loadAbnormalAnalysis()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-abnormal-analysis-tab {
  .filter-card {
    margin: 0 0 12px 0;
  }

  .overview-card {
    margin: 0 0 12px 0;

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

    .overview-stats {
      .stat-item {
        display: flex;
        align-items: center;
        padding: var(--spacing-md);
        border-radius: 8px;
        background: var(--van-background-color);

        .stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;

          .van-icon {
            font-size: var(--text-lg);
            color: white;
          }

          &.consecutive {
            background: linear-gradient(135deg, #F56C6C 0%, #F78989 100%);
          }

          &.frequent {
            background: linear-gradient(135deg, #E6A23C 0%, #EEBE77 100%);
          }

          &.early {
            background: linear-gradient(135deg, #409EFF 0%, #66B1FF 100%);
          }
        }

        .stat-content {
          flex: 1;

          .stat-value {
            font-size: var(--text-xl);
            font-weight: 600;
            color: var(--van-text-color);
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
          }
        }
      }
    }
  }

  .abnormal-list {
    .abnormal-section {
      margin: 0 0 12px 0;

      :deep(.van-card__header) {
        padding: var(--spacing-md) 16px 0;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        .section-title {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--van-text-color);
        }
      }

      .student-list {
        .student-info {
          text-align: right;

          .consecutive-days,
          .late-count,
          .early-count {
            font-size: var(--text-sm);
            font-weight: 600;
            color: var(--van-danger-color);
            margin-bottom: 4px;
          }

          .recent-dates,
          .last-date {
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
          }
        }
      }
    }
  }

  .loading-container,
  .empty-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px 0;

    .empty-tip {
      margin-top: 16px;
      text-align: center;
      color: var(--van-text-color-2);
      font-size: var(--text-sm);
    }
  }

  .date-range-picker {
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

  .student-detail-popup {
    height: 100%;
    display: flex;
    flex-direction: column;

    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--van-border-color);

      .popup-title {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--van-text-color);
      }
    }

    .popup-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-md) 0;

      .action-buttons {
        padding: var(--spacing-md);
        margin-top: 16px;
      }
    }
  }
}
</style>