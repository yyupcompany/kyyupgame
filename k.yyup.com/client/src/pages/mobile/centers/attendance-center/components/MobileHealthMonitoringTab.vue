<template>
  <div class="mobile-health-monitoring-tab">
    <!-- 时间范围选择 -->
    <van-card class="filter-card">
      <van-cell-group inset>
        <van-field
          v-model="dateRangeText"
          readonly
          label="监测时间"
          placeholder="选择时间范围"
          @click="showDateRangePicker = true"
        />
      </van-cell-group>
    </van-card>

    <!-- 健康概览统计 -->
    <van-card class="overview-card">
      <template #title>
        <span class="card-title">健康监测概览</span>
      </template>

      <div v-if="healthData" class="overview-stats">
        <van-row gutter="16">
          <van-col span="8">
            <div class="stat-item">
              <div class="stat-icon temperature">
                <van-icon name="fire-o" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ healthData.abnormalTemperature?.length || 0 }}</div>
                <div class="stat-label">体温异常</div>
              </div>
            </div>
          </van-col>
          <van-col span="8">
            <div class="stat-item">
              <div class="stat-icon sick">
                <van-icon name="contact" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ healthData.sickLeaveStats?.length || 0 }}</div>
                <div class="stat-label">病假记录</div>
              </div>
            </div>
          </van-col>
          <van-col span="8">
            <div class="stat-item">
              <div class="stat-icon rate">
                <van-icon name="shield-o" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ getHealthRate() }}%</div>
                <div class="stat-label">健康率</div>
              </div>
            </div>
          </van-col>
        </van-row>
      </div>

      <van-empty v-else description="暂无健康监测数据" />
    </van-card>

    <!-- 健康详情列表 -->
    <div v-if="healthData" class="health-list">
      <!-- 体温异常记录 -->
      <van-card
        v-if="healthData.abnormalTemperature?.length > 0"
        class="health-section"
      >
        <template #title>
          <div class="section-header">
            <span class="section-title">体温异常记录</span>
            <van-tag type="danger" size="medium">
              {{ healthData.abnormalTemperature.length }}条
            </van-tag>
          </div>
        </template>

        <div class="student-list">
          <van-cell
            v-for="record in healthData.abnormalTemperature"
            :key="`${record.studentId}-${record.date}`"
            :title="record.studentName"
            :label="record.className"
            is-link
            @click="viewTemperatureDetail(record)"
          >
            <template #value>
              <div class="temperature-info">
                <div class="temperature-value" :class="getTemperatureClass(record.temperature)">
                  {{ record.temperature }}°C
                </div>
                <div class="record-date">
                  {{ formatDate(record.date) }}
                </div>
              </div>
            </template>
          </van-cell>
        </div>
      </van-card>

      <!-- 病假统计 -->
      <van-card
        v-if="healthData.sickLeaveStats?.length > 0"
        class="health-section"
      >
        <template #title>
          <div class="section-header">
            <span class="section-title">病假统计</span>
            <van-tag type="warning" size="medium">
              {{ healthData.sickLeaveStats.length }}人
            </van-tag>
          </div>
        </template>

        <div class="student-list">
          <van-cell
            v-for="student in healthData.sickLeaveStats"
            :key="student.studentId"
            :title="student.studentName"
            :label="student.className"
            is-link
            @click="viewSickLeaveDetail(student)"
          >
            <template #value>
              <div class="sick-info">
                <div class="sick-days">
                  病假{{ student.sickLeaveDays }}天
                </div>
                <div class="last-date">
                  最近: {{ formatDate(student.lastSickLeaveDate) }}
                </div>
              </div>
            </template>
          </van-cell>
        </div>
      </van-card>
    </div>

    <!-- 健康趋势图表 -->
    <van-card class="chart-card">
      <template #title>
        <span class="card-title">健康趋势分析</span>
      </template>

      <div class="chart-container">
        <div class="chart-placeholder">
          <van-empty description="健康趋势图表" />
        </div>
      </div>
    </van-card>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <van-loading>加载中...</van-loading>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && (!healthData || hasNoHealthData)" class="empty-container">
      <van-empty description="暂无健康异常情况" />
      <div class="empty-tip">
        <p>所有学生健康状况良好，继续保持！</p>
      </div>
    </div>

    <!-- 日期范围选择器 -->
    <van-popup v-model:show="showDateRangePicker" position="bottom">
      <div class="date-range-picker">
        <div class="picker-header">
          <van-button plain @click="showDateRangePicker = false">取消</van-button>
          <span class="picker-title">选择监测时间范围</span>
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

    <!-- 体温详情弹窗 -->
    <van-popup v-model:show="showTemperatureDetail" position="bottom" :style="{ height: '60%' }">
      <div class="temperature-detail-popup">
        <div class="popup-header">
          <van-button plain @click="showTemperatureDetail = false">关闭</van-button>
          <span class="popup-title">体温异常详情</span>
          <van-button type="danger" @click="handleAbnormalTemperature">处理异常</van-button>
        </div>
        <div class="popup-content" v-if="selectedTemperatureRecord">
          <van-cell-group inset title="基本信息">
            <van-cell title="学生姓名" :value="selectedTemperatureRecord.studentName" />
            <van-cell title="所属班级" :value="selectedTemperatureRecord.className" />
            <van-cell title="监测日期" :value="formatDate(selectedTemperatureRecord.date)" />
          </van-cell-group>

          <van-cell-group inset title="体温数据">
            <van-cell
              title="体温测量"
              :value="`${selectedTemperatureRecord.temperature}°C`"
            >
              <template #right-icon>
                <van-tag
                  :type="getTemperatureTagType(selectedTemperatureRecord.temperature)"
                  size="medium"
                >
                  {{ getTemperatureStatus(selectedTemperatureRecord.temperature) }}
                </van-tag>
              </template>
            </van-cell>
            <van-cell title="测量时间" :value="getCurrentTime()" />
            <van-cell title="测量方式" value="额温枪" />
          </van-cell-group>

          <van-cell-group inset title="健康建议">
            <van-cell title="建议措施" :value="getHealthAdvice(selectedTemperatureRecord.temperature)" />
            <van-cell title="是否就医" value="建议及时就医检查" />
          </van-cell-group>

          <div class="action-buttons">
            <van-button type="warning" block @click="notifyParents">
              通知家长
            </van-button>
            <van-button type="danger" block @click="recordFollowUp" style="margin-top: 8px">
              记录后续处理
            </van-button>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 病假详情弹窗 -->
    <van-popup v-model:show="showSickLeaveDetail" position="bottom" :style="{ height: '60%' }">
      <div class="sick-leave-detail-popup">
        <div class="popup-header">
          <van-button plain @click="showSickLeaveDetail = false">关闭</van-button>
          <span class="popup-title">病假详情</span>
          <van-button type="primary" @click="viewStudentHistory">查看历史</van-button>
        </div>
        <div class="popup-content" v-if="selectedSickLeaveStudent">
          <van-cell-group inset title="基本信息">
            <van-cell title="学生姓名" :value="selectedSickLeaveStudent.studentName" />
            <van-cell title="所属班级" :value="selectedSickLeaveStudent.className" />
          </van-cell-group>

          <van-cell-group inset title="病假统计">
            <van-cell title="病假天数" :value="`${selectedSickLeaveStudent.sickLeaveDays}天`" />
            <van-cell title="最近病假" :value="formatDate(selectedSickLeaveStudent.lastSickLeaveDate)" />
          </van-cell-group>

          <van-cell-group inset title="健康状况">
            <van-cell title="康复情况" value="需要关注" />
            <van-cell title="复学建议" value="建议提供健康证明" />
          </van-cell-group>

          <div class="action-buttons">
            <van-button type="primary" block @click="followUpHealth">
              健康回访
            </van-button>
            <van-button type="success" block @click="scheduleHealthCheck" style="margin-top: 8px">
              安排健康检查
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
  getHealthMonitoring,
  type HealthMonitoring,
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
const healthData = ref<HealthMonitoring | null>(null)
const showDateRangePicker = ref(false)
const showTemperatureDetail = ref(false)
const showSickLeaveDetail = ref(false)
const selectedTemperatureRecord = ref<any>(null)
const selectedSickLeaveStudent = ref<any>(null)

// 日期范围
const startDate = ref(new Date())
const endDate = ref(new Date())

// 计算属性
const dateRangeText = computed(() => {
  return `${startDate.value.toLocaleDateString()} - ${endDate.value.toLocaleDateString()}`
})

const hasNoHealthData = computed(() => {
  if (!healthData.value) return true
  return (
    (healthData.value.abnormalTemperature?.length || 0) === 0 &&
    (healthData.value.sickLeaveStats?.length || 0) === 0
  )
})

// 方法
const loadHealthMonitoring = async () => {
  try {
    loading.value = true
    showLoadingToast({ message: '加载中...', forbidClick: true })

    const response = await getHealthMonitoring({
      kindergartenId: props.kindergartenId,
      startDate: startDate.value.toISOString().split('T')[0],
      endDate: endDate.value.toISOString().split('T')[0],
    })

    if (response.success && response.data) {
      healthData.value = response.data
    }
  } catch (error) {
    console.error('加载健康监测失败:', error)
    showToast('加载健康监测失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

const getHealthRate = (): string => {
  // 计算健康率的逻辑
  const totalStudents = 100 // 这里应该从实际数据获取
  const abnormalCount = (healthData.value?.abnormalTemperature?.length || 0) +
                        (healthData.value?.sickLeaveStats?.length || 0)
  const healthyCount = totalStudents - abnormalCount
  return totalStudents > 0 ? ((healthyCount / totalStudents) * 100).toFixed(1) : '100'
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const getCurrentTime = (): string => {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const getTemperatureClass = (temperature: number): string => {
  if (temperature >= 38.5) return 'high-fever'
  if (temperature >= 37.5) return 'fever'
  if (temperature >= 37.3) return 'low-fever'
  return 'normal'
}

const getTemperatureTagType = (temperature: number): string => {
  if (temperature >= 38.5) return 'danger'
  if (temperature >= 37.5) return 'warning'
  if (temperature >= 37.3) return 'primary'
  return 'success'
}

const getTemperatureStatus = (temperature: number): string => {
  if (temperature >= 38.5) return '高烧'
  if (temperature >= 37.5) return '发烧'
  if (temperature >= 37.3) return '低烧'
  return '正常'
}

const getHealthAdvice = (temperature: number): string => {
  if (temperature >= 38.5) return '立即就医，居家休息'
  if (temperature >= 37.5) return '建议就医，密切观察'
  if (temperature >= 37.3) return '多休息，多喝水，密切观察'
  return '正常监测，注意防护'
}

const viewTemperatureDetail = (record: any) => {
  selectedTemperatureRecord.value = record
  showTemperatureDetail.value = true
}

const viewSickLeaveDetail = (student: any) => {
  selectedSickLeaveStudent.value = student
  showSickLeaveDetail.value = true
}

const handleAbnormalTemperature = () => {
  showToast('已处理体温异常记录')
  showTemperatureDetail.value = false
  // TODO: 实现处理体温异常的逻辑
}

const notifyParents = () => {
  showToast(`已通知${selectedTemperatureRecord.value?.studentName}的家长`)
  // TODO: 实现通知家长的功能
}

const recordFollowUp = () => {
  showToast('已记录后续处理情况')
  showTemperatureDetail.value = false
  // TODO: 实现记录后续处理的逻辑
}

const followUpHealth = () => {
  showToast('已安排健康回访')
  showSickLeaveDetail.value = false
  // TODO: 实现健康回访功能
}

const scheduleHealthCheck = () => {
  showToast('已安排健康检查')
  showSickLeaveDetail.value = false
  // TODO: 实现安排健康检查功能
}

const viewStudentHistory = () => {
  if (selectedSickLeaveStudent.value) {
    router.push({
      path: '/mobile/attendance/student-history',
      query: {
        studentId: selectedSickLeaveStudent.value.studentId,
        studentName: selectedSickLeaveStudent.value.studentName,
      }
    })
  }
}

const onDateRangeConfirm = () => {
  showDateRangePicker.value = false
  loadHealthMonitoring()
}

// 生命周期
onMounted(() => {
  // 设置默认日期范围为最近7天
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 7)
  startDate.value = sevenDaysAgo
  endDate.value = now

  loadHealthMonitoring()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-health-monitoring-tab {
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

          &.temperature {
            background: linear-gradient(135deg, #F56C6C 0%, #F78989 100%);
          }

          &.sick {
            background: linear-gradient(135deg, #E6A23C 0%, #EEBE77 100%);
          }

          &.rate {
            background: linear-gradient(135deg, #67C23A 0%, #85CE61 100%);
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

  .health-list {
    .health-section {
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
        .temperature-info {
          text-align: right;

          .temperature-value {
            font-size: var(--text-base);
            font-weight: 600;
            margin-bottom: 4px;

            &.high-fever {
              color: var(--text-primary);
            }

            &.fever {
              color: var(--text-primary);
            }

            &.low-fever {
              color: var(--text-primary);
            }

            &.normal {
              color: var(--text-primary);
            }
          }

          .record-date {
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
          }
        }

        .sick-info {
          text-align: right;

          .sick-days {
            font-size: var(--text-sm);
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 4px;
          }

          .last-date {
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
          }
        }
      }
    }
  }

  .chart-card {
    margin: 0 0 12px 0;

    .chart-container {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--van-background-color);
      border-radius: 8px;
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

  .temperature-detail-popup,
  .sick-leave-detail-popup {
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