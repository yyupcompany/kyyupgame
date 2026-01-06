<template>
  <div class="course-plan-detail">
    <!-- 预览模式 -->
    <div v-if="preview" class="preview-mode">
      <div class="stats-overview">
        <div class="stat-row">
          <div class="stat-item">
            <span class="stat-label">全员普及进度</span>
            <span class="stat-value primary">{{ data.data?.overallProgress }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">结果达标率</span>
            <span class="stat-value success">{{ data.data?.achievementRate }}%</span>
          </div>
        </div>
      </div>

      <div class="class-progress-preview">
        <h4 class="preview-title">班级进度概览</h4>
        <div class="class-list">
          <div
            v-for="cls in previewClasses"
            :key="cls.id"
            class="class-item-mini"
          >
            <span class="class-name">{{ cls.name }}</span>
            <div class="progress-info">
              <span class="progress-text">{{ cls.progress }}%</span>
              <van-progress
                :percentage="cls.progress"
                stroke-width="4"
                color="#409EFF"
                :show-pivot="false"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 完整模式 -->
    <div v-else class="full-mode">
      <!-- 总体统计 -->
      <div class="overview-section">
        <h3 class="section-title">课程进度总览</h3>
        <div class="overview-cards">
          <div class="overview-card primary">
            <van-icon name="chart-trending-o" size="24" />
            <div class="card-content">
              <div class="card-value">{{ courseData.overallProgress }}%</div>
              <div class="card-label">全员普及进度</div>
            </div>
          </div>
          <div class="overview-card success">
            <van-icon name="medal-o" size="24" />
            <div class="card-content">
              <div class="card-value">{{ courseData.achievementRate }}%</div>
              <div class="card-label">结果达标率</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 班级详情列表 -->
      <div class="class-section">
        <div class="section-header">
          <h3 class="section-title">班级详细进度</h3>
          <van-button
            size="small"
            icon="plus"
            type="primary"
            @click="showCreateDialog = true"
          >
            创建计划
          </van-button>
        </div>

        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="loadClassList"
        >
          <div
            v-for="cls in classList"
            :key="cls.id"
            class="class-card"
            @click="selectClass(cls)"
          >
            <div class="class-header">
              <div class="class-info">
                <h4 class="class-name">{{ cls.name }}</h4>
                <van-tag
                  :type="getProgressTagType(cls.progress)"
                  size="small"
                >
                  {{ getProgressText(cls.progress) }}
                </van-tag>
              </div>
              <div class="class-stats">
                <div class="stat">
                  <span class="stat-label">普及进度</span>
                  <span class="stat-value">{{ cls.progress }}%</span>
                </div>
                <div class="stat">
                  <span class="stat-label">达标率</span>
                  <span class="stat-value">{{ cls.achievement }}%</span>
                </div>
              </div>
            </div>

            <div class="progress-section">
              <div class="progress-item">
                <span class="progress-label">课程进度</span>
                <van-progress
                  :percentage="cls.progress"
                  stroke-width="6"
                  :color="getProgressColor(cls.progress)"
                />
              </div>
              <div class="progress-item">
                <span class="progress-label">达标率</span>
                <van-progress
                  :percentage="cls.achievement"
                  stroke-width="6"
                  color="#67C23A"
                />
              </div>
            </div>

            <div class="class-actions" v-if="selectedClass?.id === cls.id">
              <van-button
                size="small"
                icon="eye-o"
                @click.stop="viewClassDetail(cls)"
              >
                查看详情
              </van-button>
              <van-button
                size="small"
                icon="edit"
                type="primary"
                @click.stop="editClassPlan(cls)"
              >
                编辑计划
              </van-button>
              <van-button
                size="small"
                icon="success"
                type="success"
                @click.stop="confirmCompletion(cls)"
              >
                确认完成
              </van-button>
            </div>
          </div>
        </van-list>
      </div>
    </div>

    <!-- 创建课程计划弹窗 -->
    <van-popup
      v-model:show="showCreateDialog"
      position="bottom"
      round
      :style="{ height: '70%' }"
      safe-area-inset-bottom
    >
      <div class="create-dialog">
        <div class="dialog-header">
          <h3>创建课程计划</h3>
          <van-button icon="cross" @click="showCreateDialog = false" />
        </div>

        <div class="dialog-content">
          <van-form @submit="createCoursePlan">
            <van-cell-group inset>
              <van-field
                v-model="createForm.semester"
                name="semester"
                label="学期"
                placeholder="请选择学期"
                is-link
                readonly
                @click="showSemesterPicker = true"
                :rules="[{ required: true, message: '请选择学期' }]"
              />
              <van-field
                v-model="createForm.className"
                name="className"
                label="班级"
                placeholder="请选择班级"
                is-link
                readonly
                @click="showClassPicker = true"
                :rules="[{ required: true, message: '请选择班级' }]"
              />
              <van-field
                v-model="createForm.courseName"
                name="courseName"
                label="课程"
                placeholder="请选择课程"
                is-link
                readonly
                @click="showCoursePicker = true"
                :rules="[{ required: true, message: '请选择课程' }]"
              />
              <van-field
                v-model="createForm.startDate"
                name="startDate"
                label="开始日期"
                placeholder="请选择开始日期"
                is-link
                readonly
                @click="showStartDatePicker = true"
                :rules="[{ required: true, message: '请选择开始日期' }]"
              />
              <van-field
                v-model="createForm.endDate"
                name="endDate"
                label="结束日期"
                placeholder="请选择结束日期"
                is-link
                readonly
                @click="showEndDatePicker = true"
                :rules="[{ required: true, message: '请选择结束日期' }]"
              />
              <van-field
                v-model="createForm.targetRate"
                name="targetRate"
                label="目标完成率"
                placeholder="请输入目标完成率"
                type="number"
                :rules="[{ required: true, message: '请输入目标完成率' }]"
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
                创建计划
              </van-button>
            </div>
          </van-form>
        </div>
      </div>
    </van-popup>

    <!-- 选择器弹窗 -->
    <van-popup v-model:show="showSemesterPicker" position="bottom">
      <van-picker
        :columns="semesterColumns"
        @confirm="onSemesterConfirm"
        @cancel="showSemesterPicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showClassPicker" position="bottom">
      <van-picker
        :columns="classColumns"
        @confirm="onClassConfirm"
        @cancel="showClassPicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showCoursePicker" position="bottom">
      <van-picker
        :columns="courseColumns"
        @confirm="onCourseConfirm"
        @cancel="showCoursePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showStartDatePicker" position="bottom">
      <van-date-picker
        @confirm="onStartDateConfirm"
        @cancel="showStartDatePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showEndDatePicker" position="bottom">
      <van-date-picker
        @confirm="onEndDateConfirm"
        @cancel="showEndDatePicker = false"
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
const loading = ref(false)
const finished = ref(false)
const showCreateDialog = ref(false)
const selectedClass = ref<any>(null)

// 选择器状态
const showSemesterPicker = ref(false)
const showClassPicker = ref(false)
const showCoursePicker = ref(false)
const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)

// 课程数据
const courseData = reactive({
  overallProgress: 0,
  achievementRate: 0
})

// 班级列表
const classList = ref<any[]>([])

// 创建表单
const createForm = reactive({
  semester: '',
  classId: '',
  className: '',
  courseId: '',
  courseName: '',
  startDate: '',
  endDate: '',
  targetRate: '',
  notes: ''
})

// 选择器数据
const semesterColumns = [
  { text: '2024年春季学期', value: '2024-spring' },
  { text: '2024年秋季学期', value: '2024-fall' },
  { text: '2025年春季学期', value: '2025-spring' }
]

const classColumns = [
  { text: '小班A班', value: 1 },
  { text: '小班B班', value: 2 },
  { text: '中班A班', value: 3 },
  { text: '中班B班', value: 4 },
  { text: '大班A班', value: 5 },
  { text: '大班B班', value: 6 }
]

const courseColumns = [
  { text: '脑科学基础课程', value: 1 },
  { text: '脑科学进阶课程', value: 2 },
  { text: '认知发展课程', value: 3 },
  { text: '语言发展课程', value: 4 }
]

// 计算属性
const previewClasses = computed(() => {
  return classList.value.slice(0, 3)
})

// 方法
const getProgressTagType = (progress: number) => {
  if (progress >= 90) return 'success'
  if (progress >= 70) return 'primary'
  if (progress >= 50) return 'warning'
  return 'danger'
}

const getProgressText = (progress: number) => {
  if (progress >= 90) return '优秀'
  if (progress >= 70) return '良好'
  if (progress >= 50) return '一般'
  return '需改进'
}

const getProgressColor = (progress: number) => {
  if (progress >= 90) return '#67C23A'
  if (progress >= 70) return '#409EFF'
  if (progress >= 50) return '#E6A23C'
  return '#F56C6C'
}

const selectClass = (cls: any) => {
  selectedClass.value = selectedClass.value?.id === cls.id ? null : cls
}

const loadClassList = async () => {
  try {
    loading.value = true

    if (props.data?.data?.classList) {
      // 使用传入的数据
      classList.value = props.data.data.classList
      finished.value = true
    } else {
      // 从API加载数据
      const response = await teachingCenterApi.getCourseProgressStats()
      if (response.success && response.data?.course_plans) {
        classList.value = response.data.course_plans
      }
      finished.value = true
    }
  } catch (error) {
    console.error('加载班级列表失败:', error)
    showToast('加载班级列表失败')
    finished.value = true
  } finally {
    loading.value = false
  }
}

const viewClassDetail = (cls: any) => {
  showToast(`查看${cls.name}详情`)
}

const editClassPlan = (cls: any) => {
  showToast(`编辑${cls.name}课程计划`)
}

const confirmCompletion = (cls: any) => {
  showToast(`确认${cls.name}课程完成`)
}

const createCoursePlan = async () => {
  try {
    const loadingToast = showLoadingToast('创建课程计划中...')

    await teachingCenterApi.createCoursePlan({
      semester: createForm.semester,
      class_id: parseInt(createForm.classId),
      course_id: parseInt(createForm.courseId),
      planned_start_date: createForm.startDate,
      planned_end_date: createForm.endDate,
      target_completion_rate: parseInt(createForm.targetRate),
      notes: createForm.notes
    })

    closeToast()
    showToast('课程计划创建成功')
    showCreateDialog.value = false

    // 重置表单
    Object.keys(createForm).forEach(key => {
      createForm[key as keyof typeof createForm] = ''
    })

    // 刷新数据
    emit('refresh')
  } catch (error) {
    closeToast()
    console.error('创建课程计划失败:', error)
    showToast('创建课程计划失败')
  }
}

// 选择器确认方法
const onSemesterConfirm = ({ selectedValues }: any) => {
  createForm.semester = selectedValues[0]
  showSemesterPicker.value = false
}

const onClassConfirm = ({ selectedOptions }: any) => {
  createForm.className = selectedOptions[0].text
  createForm.classId = selectedOptions[0].value.toString()
  showClassPicker.value = false
}

const onCourseConfirm = ({ selectedOptions }: any) => {
  createForm.courseName = selectedOptions[0].text
  createForm.courseId = selectedOptions[0].value.toString()
  showCoursePicker.value = false
}

const onStartDateConfirm = ({ selectedValues }: any) => {
  createForm.startDate = selectedValues.join('-')
  showStartDatePicker.value = false
}

const onEndDateConfirm = ({ selectedValues }: any) => {
  createForm.endDate = selectedValues.join('-')
  showEndDatePicker.value = false
}

// 监听数据变化
watch(
  () => props.data,
  (newData) => {
    if (newData?.data) {
      courseData.overallProgress = newData.data.overallProgress || 0
      courseData.achievementRate = newData.data.achievementRate || 0

      if (newData.data.classList) {
        classList.value = newData.data.classList
      }
    }
  },
  { immediate: true }
)

// 生命周期
onMounted(() => {
  if (props.data?.data) {
    courseData.overallProgress = props.data.data.overallProgress || 0
    courseData.achievementRate = props.data.data.achievementRate || 0

    if (props.data.data.classList) {
      classList.value = props.data.data.classList
    } else {
      loadClassList()
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.course-plan-detail {
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

  .class-progress-preview {
    .preview-title {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--van-text-color);
      margin: 0 0 var(--van-padding-sm) 0;
    }

    .class-list {
      .class-item-mini {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--van-padding-xs) 0;

        .class-name {
          font-size: var(--text-xs);
          color: var(--van-text-color-2);
          min-width: 60px;
        }

        .progress-info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: var(--van-padding-sm);
          margin-left: var(--van-padding-sm);

          .progress-text {
            font-size: var(--text-xs);
            color: var(--van-primary-color);
            font-weight: 600;
            min-width: 30px;
          }

          :deep(.van-progress) {
            flex: 1;
          }
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

  .class-section {
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

    .class-card {
      background: var(--card-bg);
      border-radius: var(--van-radius-lg);
      padding: var(--van-padding-md);
      margin-bottom: var(--van-padding-md);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
      }

      .class-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--van-padding-md);

        .class-info {
          .class-name {
            font-size: var(--text-base);
            font-weight: 600;
            color: var(--van-text-color);
            margin: 0 0 var(--van-padding-xs) 0;
          }
        }

        .class-stats {
          display: flex;
          gap: var(--van-padding-md);

          .stat {
            text-align: center;

            .stat-label {
              display: block;
              font-size: 11px;
              color: var(--van-text-color-3);
              margin-bottom: 2px;
            }

            .stat-value {
              font-size: var(--text-sm);
              font-weight: 600;
              color: var(--van-text-color);
            }
          }
        }
      }

      .progress-section {
        margin-bottom: var(--van-padding-md);

        .progress-item {
          margin-bottom: var(--van-padding-sm);

          .progress-label {
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
            margin-bottom: var(--van-padding-xs);
            display: block;
          }
        }
      }

      .class-actions {
        display: flex;
        gap: var(--van-padding-sm);
        justify-content: flex-end;
        padding-top: var(--van-padding-sm);
        border-top: 1px solid var(--van-border-color);
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