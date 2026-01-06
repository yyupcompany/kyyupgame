<template>
  <div class="outdoor-training-detail">
    <!-- 预览模式 -->
    <div v-if="preview" class="preview-mode">
      <div class="stats-overview">
        <div class="stat-row">
          <div class="stat-item">
            <span class="stat-label">完成周数</span>
            <span class="stat-value primary">{{ data.data?.completedWeeks }}/16</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">完成率</span>
            <span class="stat-value success">{{ data.data?.averageRate }}%</span>
          </div>
        </div>
      </div>

      <div class="weekly-progress-preview">
        <h4 class="preview-title">周进度概览</h4>
        <div class="week-grid">
          <div
            v-for="week in previewWeeks"
            :key="week.number"
            class="week-item-mini"
            :class="{ 'completed': week.completed }"
          >
            <span class="week-number">第{{ week.number }}周</span>
            <van-icon
              :name="week.completed ? 'success' : 'clock-o'"
              :color="week.completed ? '#07c160' : '#c8c9cc'"
              size="14"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 完整模式 -->
    <div v-else class="full-mode">
      <!-- 总体统计 -->
      <div class="overview-section">
        <h3 class="section-title">户外训练总览</h3>
        <div class="overview-cards">
          <div class="overview-card primary">
            <van-icon name="calendar-o" size="24" />
            <div class="card-content">
              <div class="card-value">{{ trainingData.completedWeeks }}/16</div>
              <div class="card-label">完成周数</div>
            </div>
          </div>
          <div class="overview-card success">
            <van-icon name="bar-chart-o" size="24" />
            <div class="card-content">
              <div class="card-value">{{ trainingData.averageRate }}%</div>
              <div class="card-label">平均完成率</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 周进度详情 -->
      <div class="weekly-section">
        <div class="section-header">
          <h3 class="section-title">周训练进度</h3>
          <van-button
            size="small"
            icon="plus"
            type="primary"
            @click="showCreateDialog = true"
          >
            记录训练
          </van-button>
        </div>

        <!-- 周进度网格 -->
        <div class="week-grid">
          <div
            v-for="week in weekList"
            :key="week.id"
            class="week-card"
            :class="{
              'completed': week.status === 'completed',
              'in-progress': week.status === 'in-progress',
              'pending': week.status === 'pending'
            }"
            @click="selectWeek(week)"
          >
            <div class="week-header">
              <span class="week-number">第{{ week.number }}周</span>
              <van-tag
                :type="getWeekStatusType(week.status)"
                size="small"
              >
                {{ getWeekStatusText(week.status) }}
              </van-tag>
            </div>

            <div class="week-content">
              <div class="week-info">
                <div class="info-item">
                  <span class="info-label">日期</span>
                  <span class="info-value">{{ week.date || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">地点</span>
                  <span class="info-value">{{ week.location || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">参与人数</span>
                  <span class="info-value">{{ week.attendance || 0 }}人</span>
                </div>
              </div>

              <div class="week-actions" v-if="selectedWeek?.id === week.id">
                <van-button
                  size="mini"
                  icon="eye-o"
                  @click.stop="viewWeekDetail(week)"
                >
                  查看
                </van-button>
                <van-button
                  size="mini"
                  icon="edit"
                  type="primary"
                  @click.stop="editWeekRecord(week)"
                >
                  编辑
                </van-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 班级统计 -->
      <div class="class-section" v-if="classList.length > 0">
        <h3 class="section-title">班级完成情况</h3>
        <div class="class-cards">
          <div
            v-for="cls in classList"
            :key="cls.id"
            class="class-card"
          >
            <div class="class-header">
              <span class="class-name">{{ cls.name }}</span>
              <span class="completion-rate">{{ cls.completionRate }}%</span>
            </div>
            <van-progress
              :percentage="cls.completionRate"
              stroke-width="6"
              :color="getProgressColor(cls.completionRate)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 创建训练记录弹窗 -->
    <van-popup
      v-model:show="showCreateDialog"
      position="bottom"
      round
      :style="{ height: '80%' }"
      safe-area-inset-bottom
    >
      <div class="create-dialog">
        <div class="dialog-header">
          <h3>记录户外训练</h3>
          <van-button icon="cross" @click="showCreateDialog = false" />
        </div>

        <div class="dialog-content">
          <van-form @submit="createTrainingRecord">
            <van-cell-group inset>
              <van-field
                v-model="createForm.classId"
                name="classId"
                label="班级"
                placeholder="请选择班级"
                is-link
                readonly
                @click="showClassPicker = true"
                :rules="[{ required: true, message: '请选择班级' }]"
              />
              <van-field
                v-model="createForm.weekNumber"
                name="weekNumber"
                label="周数"
                placeholder="请选择周数"
                is-link
                readonly
                @click="showWeekPicker = true"
                :rules="[{ required: true, message: '请选择周数' }]"
              />
              <van-field
                v-model="createForm.trainingType"
                name="trainingType"
                label="训练类型"
                placeholder="请选择训练类型"
                is-link
                readonly
                @click="showTypePicker = true"
                :rules="[{ required: true, message: '请选择训练类型' }]"
              />
              <van-field
                v-model="createForm.trainingDate"
                name="trainingDate"
                label="训练日期"
                placeholder="请选择训练日期"
                is-link
                readonly
                @click="showDatePicker = true"
                :rules="[{ required: true, message: '请选择训练日期' }]"
              />
              <van-field
                v-model="createForm.location"
                name="location"
                label="训练地点"
                placeholder="请输入训练地点"
                :rules="[{ required: true, message: '请输入训练地点' }]"
              />
              <van-field
                v-model="createForm.attendanceCount"
                name="attendanceCount"
                label="参与人数"
                placeholder="请输入参与人数"
                type="number"
                :rules="[{ required: true, message: '请输入参与人数' }]"
              />
              <van-field
                v-model="createForm.targetAchievedCount"
                name="targetAchievedCount"
                label="达标人数"
                placeholder="请输入达标人数"
                type="number"
                :rules="[{ required: true, message: '请输入达标人数' }]"
              />
              <van-field
                v-model="createForm.notes"
                name="notes"
                label="备注"
                placeholder="请输入备注信息"
                type="textarea"
                rows="3"
              />
            </van-cell-group>

            <div class="dialog-actions">
              <van-button block type="primary" native-type="submit">
                记录训练
              </van-button>
            </div>
          </van-form>
        </div>
      </div>
    </van-popup>

    <!-- 选择器弹窗 -->
    <van-popup v-model:show="showClassPicker" position="bottom">
      <van-picker
        :columns="classColumns"
        @confirm="onClassConfirm"
        @cancel="showClassPicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showWeekPicker" position="bottom">
      <van-picker
        :columns="weekColumns"
        @confirm="onWeekConfirm"
        @cancel="showWeekPicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="typeColumns"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { teachingCenterApi } from '@/api/endpoints/teaching-center'

// Props
interface Props {
  data: any
  preview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  preview: false
})

// Emits
const emit = defineEmits<{
  refresh: []
}>()

// 响应式数据
const showCreateDialog = ref(false)
const selectedWeek = ref<any>(null)

// 选择器状态
const showClassPicker = ref(false)
const showWeekPicker = ref(false)
const showTypePicker = ref(false)
const showDatePicker = ref(false)

// 训练数据
const trainingData = reactive({
  completedWeeks: 0,
  averageRate: 0
})

// 周列表
const weekList = ref<any[]>([])
const classList = ref<any[]>([])

// 创建表单
const createForm = reactive({
  classId: '',
  weekNumber: '',
  trainingType: '',
  trainingDate: '',
  location: '',
  attendanceCount: '',
  targetAchievedCount: '',
  notes: ''
})

// 选择器数据
const classColumns = [
  { text: '小班A班', value: 1 },
  { text: '小班B班', value: 2 },
  { text: '中班A班', value: 3 },
  { text: '中班B班', value: 4 },
  { text: '大班A班', value: 5 },
  { text: '大班B班', value: 6 }
]

const weekColumns = Array.from({ length: 16 }, (_, i) => ({
  text: `第${i + 1}周`,
  value: i + 1
}))

const typeColumns = [
  { text: '户外训练', value: 'outdoor_training' },
  { text: '离园展示', value: 'departure_display' }
]

// 计算属性
const previewWeeks = computed(() => {
  return weekList.value.slice(0, 8)
})

// 方法
const getWeekStatusType = (status: string) => {
  const typeMap = {
    'completed': 'success',
    'in-progress': 'primary',
    'pending': 'warning'
  }
  return typeMap[status as keyof typeof typeMap] || 'default'
}

const getWeekStatusText = (status: string) => {
  const textMap = {
    'completed': '已完成',
    'in-progress': '进行中',
    'pending': '待完成'
  }
  return textMap[status as keyof typeof textMap] || status
}

const getProgressColor = (rate: number) => {
  if (rate >= 90) return '#67C23A'
  if (rate >= 70) return '#409EFF'
  if (rate >= 50) return '#E6A23C'
  return '#F56C6C'
}

const selectWeek = (week: any) => {
  selectedWeek.value = selectedWeek.value?.id === week.id ? null : week
}

const generateWeekList = () => {
  const completedWeeks = trainingData.completedWeeks
  const weeks = []

  for (let i = 1; i <= 16; i++) {
    weeks.push({
      id: `week-${i}`,
      number: i,
      status: i <= completedWeeks ? 'completed' : 'pending',
      date: i <= completedWeeks ? `2024-02-${String(i).padStart(2, '0')}` : '',
      location: i <= completedWeeks ? '户外活动区' : '',
      attendance: i <= completedWeeks ? Math.floor(Math.random() * 10) + 15 : 0
    })
  }

  weekList.value = weeks
}

const generateClassList = () => {
  const classes = [
    { id: 1, name: '小班A班', completionRate: 75 },
    { id: 2, name: '小班B班', completionRate: 82 },
    { id: 3, name: '中班A班', completionRate: 68 },
    { id: 4, name: '中班B班', completionRate: 91 },
    { id: 5, name: '大班A班', completionRate: 87 },
    { id: 6, name: '大班B班', completionRate: 79 }
  ]

  classList.value = classes
}

const viewWeekDetail = (week: any) => {
  showToast(`查看第${week.number}周详情`)
}

const editWeekRecord = (week: any) => {
  showToast(`编辑第${week.number}周记录`)
}

const createTrainingRecord = async () => {
  try {
    const loadingToast = showLoadingToast('记录户外训练中...')

    await teachingCenterApi.createOutdoorTrainingRecord({
      class_id: parseInt(createForm.classId),
      week_number: parseInt(createForm.weekNumber),
      training_type: createForm.trainingType as any,
      training_date: createForm.trainingDate,
      location: createForm.location,
      attendance_count: parseInt(createForm.attendanceCount),
      target_achieved_count: parseInt(createForm.targetAchievedCount),
      notes: createForm.notes
    })

    closeToast()
    showToast('户外训练记录成功')
    showCreateDialog.value = false

    // 重置表单
    Object.keys(createForm).forEach(key => {
      createForm[key as keyof typeof createForm] = ''
    })

    // 刷新数据
    emit('refresh')
  } catch (error) {
    closeToast()
    console.error('创建户外训练记录失败:', error)
    showToast('记录户外训练失败')
  }
}

// 选择器确认方法
const onClassConfirm = ({ selectedOptions }: any) => {
  createForm.classId = selectedOptions[0].value.toString()
  showClassPicker.value = false
}

const onWeekConfirm = ({ selectedOptions }: any) => {
  createForm.weekNumber = selectedOptions[0].value.toString()
  showWeekPicker.value = false
}

const onTypeConfirm = ({ selectedOptions }: any) => {
  createForm.trainingType = selectedOptions[0].value
  showTypePicker.value = false
}

const onDateConfirm = ({ selectedValues }: any) => {
  createForm.trainingDate = selectedValues.join('-')
  showDatePicker.value = false
}

// 监听数据变化
watch(
  () => props.data,
  (newData) => {
    if (newData?.data) {
      trainingData.completedWeeks = newData.data.completedWeeks || 0
      trainingData.averageRate = newData.data.averageRate || 0

      generateWeekList()
      generateClassList()
    }
  },
  { immediate: true }
)

// 生命周期
onMounted(() => {
  if (props.data?.data) {
    trainingData.completedWeeks = props.data.data.completedWeeks || 0
    trainingData.averageRate = props.data.data.averageRate || 0

    generateWeekList()
    generateClassList()
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.outdoor-training-detail {
  width: 100%;
}

// 预览模式样式
.preview-mode {
  .stats-overview {
    margin-bottom: var(--van-padding-md);

    .stat-row {
      display: flex;
      gap: var(--van-padding-md);

      .stat-item {
        flex: 1;
        text-align: center;
        padding: var(--van-padding-sm);
        background: var(--van-background-color-light);
        border-radius: var(--van-radius-md);

        .stat-label {
          display: block;
          font-size: var(--text-xs);
          color: var(--van-text-color-2);
          margin-bottom: var(--van-padding-xs);
        }

        .stat-value {
          font-size: var(--text-lg);
          font-weight: 600;

          &.primary {
            color: var(--van-primary-color);
          }

          &.success {
            color: var(--van-success-color);
          }
        }
      }
    }
  }

  .weekly-progress-preview {
    .preview-title {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--van-text-color);
      margin: 0 0 var(--van-padding-sm) 0;
    }

    .week-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--van-padding-xs);

      .week-item-mini {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--van-padding-xs);
        background: var(--van-background-color-light);
        border-radius: var(--van-radius-sm);
        font-size: 10px;

        &.completed {
          background: rgba(103, 194, 58, 0.1);
          color: var(--van-success-color);
        }

        .week-number {
          margin-bottom: 2px;
        }
      }
    }
  }
}

// 完整模式样式
.full-mode {
  .overview-section {
    margin-bottom: var(--van-padding-lg);

    .section-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
      margin: 0 0 var(--van-padding-md) 0;
    }

    .overview-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--van-padding-md);

      .overview-card {
        display: flex;
        align-items: center;
        gap: var(--van-padding-sm);
        padding: var(--van-padding-md);
        background: var(--card-bg);
        border-radius: var(--van-radius-lg);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        &.primary {
          background: rgba(64, 158, 255, 0.1);
          color: var(--text-primary);
        }

        &.success {
          background: rgba(103, 194, 58, 0.1);
          color: var(--text-primary);
        }

        .card-content {
          .card-value {
            font-size: var(--text-xl);
            font-weight: 600;
            line-height: 1.2;
          }

          .card-label {
            font-size: var(--text-xs);
            opacity: 0.8;
          }
        }
      }
    }
  }

  .weekly-section {
    margin-bottom: var(--van-padding-lg);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--van-padding-md);

      .section-title {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--van-text-color);
        margin: 0;
      }
    }

    .week-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--van-padding-md);

      .week-card {
        background: var(--card-bg);
        border-radius: var(--van-radius-lg);
        padding: var(--van-padding-md);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        transition: all 0.3s ease;
        border: 2px solid transparent;

        &.completed {
          border-color: var(--van-success-color);
          background: rgba(103, 194, 58, 0.05);
        }

        &.in-progress {
          border-color: var(--van-primary-color);
          background: rgba(64, 158, 255, 0.05);
        }

        &:active {
          transform: scale(0.98);
        }

        .week-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--van-padding-sm);

          .week-number {
            font-size: var(--text-sm);
            font-weight: 600;
            color: var(--van-text-color);
          }
        }

        .week-content {
          .week-info {
            margin-bottom: var(--van-padding-sm);

            .info-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;

              .info-label {
                font-size: var(--text-xs);
                color: var(--van-text-color-3);
              }

              .info-value {
                font-size: var(--text-xs);
                color: var(--van-text-color);
                font-weight: 500;
              }
            }
          }

          .week-actions {
            display: flex;
            gap: var(--van-padding-xs);
            justify-content: flex-end;
          }
        }
      }
    }
  }

  .class-section {
    .section-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
      margin: 0 0 var(--van-padding-md) 0;
    }

    .class-cards {
      .class-card {
        background: var(--card-bg);
        border-radius: var(--van-radius-lg);
        padding: var(--van-padding-md);
        margin-bottom: var(--van-padding-sm);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        .class-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--van-padding-sm);

          .class-name {
            font-size: var(--text-sm);
            font-weight: 500;
            color: var(--van-text-color);
          }

          .completion-rate {
            font-size: var(--text-sm);
            font-weight: 600;
            color: var(--van-primary-color);
          }
        }
      }
    }
  }
}

// 创建弹窗样式
.create-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--van-padding-lg) var(--van-padding-md);
    border-bottom: 1px solid var(--van-border-color);

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--van-text-color);
    }
  }

  .dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--van-padding-md);

    .dialog-actions {
      margin-top: var(--van-padding-lg);
      padding: var(--van-padding-md);
    }
  }
}
</style>