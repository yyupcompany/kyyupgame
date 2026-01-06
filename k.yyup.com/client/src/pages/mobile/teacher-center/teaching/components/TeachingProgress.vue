<template>
  <div class="mobile-teaching-progress">
    <!-- 进度概览卡片 -->
    <div class="progress-overview">
      <van-grid :column-num="3" :gutter="12">
        <van-grid-item>
          <div class="overview-card primary">
            <div class="overview-icon">
              <van-icon name="chart-trending-o" />
            </div>
            <div class="overview-content">
              <div class="overview-value">{{ overallProgress }}%</div>
              <div class="overview-label">总体进度</div>
            </div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="overview-card success">
            <div class="overview-icon">
              <van-icon name="passed" />
            </div>
            <div class="overview-content">
              <div class="overview-value">{{ completedLessons }}</div>
              <div class="overview-label">已完成课时</div>
            </div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="overview-card warning">
            <div class="overview-icon">
              <van-icon name="clock-o" />
            </div>
            <div class="overview-content">
              <div class="overview-value">{{ remainingLessons }}</div>
              <div class="overview-label">剩余课时</div>
            </div>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索班级或课程"
        @search="handleFilter"
        @clear="handleClearSearch"
        show-action
      >
        <template #action>
          <van-button
            size="small"
            @click="showFilterSheet = true"
          >
            筛选
          </van-button>
        </template>
      </van-search>
    </div>

    <!-- 进度列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div
          v-for="progress in filteredProgressData"
          :key="`${progress.classId}-${progress.courseId}`"
          class="progress-item"
        >
          <div class="progress-header">
            <div class="progress-title">
              <div class="class-name">{{ progress.className }}</div>
              <div class="course-name">{{ progress.courseName }}</div>
            </div>
            <div class="progress-percentage">
              <span class="percentage-value">{{ progress.completionRate }}%</span>
            </div>
          </div>

          <div class="progress-content">
            <div class="progress-stats">
              <div class="stat-item">
                <div class="stat-number">{{ progress.totalLessons }}</div>
                <div class="stat-label">总课时</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ progress.completedLessons }}</div>
                <div class="stat-label">已完成</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ progress.totalLessons - progress.completedLessons }}</div>
                <div class="stat-label">剩余</div>
              </div>
            </div>

            <div class="progress-bar">
              <van-progress
                :percentage="progress.completionRate"
                stroke-width="8"
                :color="getProgressColor(progress.completionRate)"
                :show-pivot="false"
              />
            </div>

            <div class="progress-details">
              <div class="detail-item">
                <van-icon name="clock-o" size="14" />
                <span>最近更新: {{ formatDate(progress.lastUpdate) }}</span>
              </div>
              <div class="detail-item" v-if="progress.nextLesson">
                <van-icon name="calendar-o" size="14" />
                <span>下次课程: {{ formatDate(progress.nextLesson) }}</span>
              </div>
            </div>

            <div class="progress-actions">
              <van-button
                size="small"
                type="primary"
                plain
                @click="handleViewDetails(progress)"
              >
                查看详情
              </van-button>
              <van-button
                size="small"
                type="success"
                @click="handleUpdateProgress(progress)"
              >
                更新进度
              </van-button>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 空状态 -->
    <van-empty
      v-if="filteredProgressData.length === 0 && !loading"
      description="暂无进度数据"
      image="search"
    />

    <!-- 筛选弹窗 -->
    <van-action-sheet
      v-model:show="showFilterSheet"
      title="筛选条件"
      :closeable="true"
    >
      <div class="filter-content">
        <van-field name="classId" label="班级">
          <template #input>
            <van-radio-group v-model="filterForm.classId" direction="horizontal">
              <van-radio name="">全部</van-radio>
              <van-radio name="1">大班A</van-radio>
              <van-radio name="2">中班B</van-radio>
              <van-radio name="3">小班C</van-radio>
            </van-radio-group>
          </template>
        </van-field>

        <van-field name="courseId" label="课程">
          <template #input>
            <van-radio-group v-model="filterForm.courseId" direction="horizontal">
              <van-radio name="">全部</van-radio>
              <van-radio name="1">数学启蒙</van-radio>
              <van-radio name="2">语言表达</van-radio>
              <van-radio name="3">艺术创作</van-radio>
            </van-radio-group>
          </template>
        </van-field>

        <div class="filter-actions">
          <van-button block @click="handleResetFilter">重置</van-button>
          <van-button block type="primary" @click="applyFilter">确定</van-button>
        </div>
      </div>
    </van-action-sheet>

    <!-- 进度更新弹窗 -->
    <van-popup
      v-model:show="updateDialogVisible"
      position="bottom"
      :style="{ height: '70%' }"
      round
    >
      <div v-if="currentProgress" class="update-progress">
        <div class="update-header">
          <div class="header-title">更新教学进度</div>
          <van-button
            icon="cross"
            size="small"
            @click="updateDialogVisible = false"
          />
        </div>

        <div class="update-content">
          <van-form @submit="handleSaveProgress" ref="updateFormRef">
            <van-cell-group inset title="班级课程信息">
              <van-field
                :value="`${currentProgress.className} - ${currentProgress.courseName}`"
                label="班级课程"
                readonly
              />
            </van-cell-group>

            <van-cell-group inset title="进度信息">
              <van-field
                v-model="updateForm.completedLessons"
                name="completedLessons"
                label="完成课时"
                type="number"
                placeholder="请输入完成课时数"
                :rules="[{ required: true, message: '请输入完成课时' }]"
                :max="currentProgress.totalLessons"
              />

              <van-field
                v-model="updateForm.progressNote"
                name="progressNote"
                label="进度说明"
                type="textarea"
                placeholder="请输入进度说明"
                :rows="3"
                maxlength="200"
                show-word-limit
                :rules="[{ required: true, message: '请输入进度说明' }]"
              />

              <van-field
                v-model="updateForm.nextLessonText"
                name="nextLesson"
                label="下次课程"
                placeholder="选择下次课程时间"
                is-link
                readonly
                @click="showDatePicker = true"
              />
            </van-cell-group>
          </van-form>
        </div>

        <div class="update-footer">
          <van-button block @click="updateDialogVisible = false">取消</van-button>
          <van-button block type="primary" :loading="saving" @click="handleSaveProgress">
            保存进度
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-picker-group
        title="选择下次课程时间"
        :tabs="['选择日期', '选择时间']"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      >
        <van-date-picker
          v-model="currentDate"
          :min-date="minDate"
          :max-date="maxDate"
        />
        <van-time-picker v-model="currentTime" />
      </van-picker-group>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { showToast, showSuccessToast, showFailToast } from 'vant'

interface ProgressData {
  classId: number
  courseId: number
  className: string
  courseName: string
  totalLessons: number
  completedLessons: number
  completionRate: number
  lastUpdate: string
  nextLesson: string
}

interface Props {
  progressData?: ProgressData[]
}

interface Emits {
  (e: 'update-progress', progress: ProgressData): void
  (e: 'view-details', progress: ProgressData): void
  (e: 'refresh'): void
}

const props = withDefaults(defineProps<Props>(), {
  progressData: () => []
})

const emit = defineEmits<Emits>()

const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const showFilterSheet = ref(false)
const updateDialogVisible = ref(false)
const saving = ref(false)
const showDatePicker = ref(false)
const currentProgress = ref<ProgressData | null>(null)
const updateFormRef = ref()
const searchKeyword = ref('')

const currentDate = ref(['2024', '01', '01'])
const currentTime = ref(['09', '00'])
const minDate = new Date(2024, 0, 1)
const maxDate = new Date(2025, 11, 31)

const filterForm = reactive({
  classId: '',
  courseId: ''
})

const updateForm = reactive({
  completedLessons: 0,
  progressNote: '',
  nextLessonText: '',
  nextLesson: null as Date | null
})

// 模拟数据
const mockProgressData: ProgressData[] = [
  {
    classId: 1,
    courseId: 1,
    className: '大班A班',
    courseName: '数学启蒙',
    totalLessons: 40,
    completedLessons: 28,
    completionRate: 70,
    lastUpdate: '2024-01-15T10:30:00Z',
    nextLesson: '2024-01-17T09:00:00Z'
  },
  {
    classId: 1,
    courseId: 2,
    className: '大班A班',
    courseName: '语言表达',
    totalLessons: 35,
    completedLessons: 32,
    completionRate: 91,
    lastUpdate: '2024-01-14T14:20:00Z',
    nextLesson: '2024-01-16T10:30:00Z'
  },
  {
    classId: 2,
    courseId: 1,
    className: '中班B班',
    courseName: '数学启蒙',
    totalLessons: 36,
    completedLessons: 18,
    completionRate: 50,
    lastUpdate: '2024-01-13T11:15:00Z',
    nextLesson: '2024-01-18T09:00:00Z'
  },
  {
    classId: 3,
    courseId: 3,
    className: '小班C班',
    courseName: '艺术创作',
    totalLessons: 30,
    completedLessons: 24,
    completionRate: 80,
    lastUpdate: '2024-01-12T15:45:00Z',
    nextLesson: '2024-01-19T14:00:00Z'
  }
]

const progressData = ref<ProgressData[]>(props.progressData.length > 0 ? props.progressData : mockProgressData)

// 计算属性
const filteredProgressData = computed(() => {
  let result = progressData.value

  if (filterForm.classId) {
    result = result.filter(item => item.classId === Number(filterForm.classId))
  }

  if (filterForm.courseId) {
    result = result.filter(item => item.courseId === Number(filterForm.courseId))
  }

  if (searchKeyword.value) {
    result = result.filter(item =>
      item.className.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      item.courseName.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  return result
})

const overallProgress = computed(() => {
  if (progressData.value.length === 0) return 0
  const total = progressData.value.reduce((sum, item) => sum + item.completionRate, 0)
  return Math.round(total / progressData.value.length)
})

const completedLessons = computed(() => {
  return progressData.value.reduce((sum, item) => sum + item.completedLessons, 0)
})

const remainingLessons = computed(() => {
  const total = progressData.value.reduce((sum, item) => sum + item.totalLessons, 0)
  return total - completedLessons.value
})

// 方法
const onLoad = () => {
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 1000)
}

const onRefresh = () => {
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
    emit('refresh')
    showSuccessToast('刷新成功')
  }, 1000)
}

const handleFilter = () => {
  showToast('搜索完成')
}

const handleClearSearch = () => {
  searchKeyword.value = ''
}

const applyFilter = () => {
  showFilterSheet.value = false
  showSuccessToast('筛选已应用')
}

const handleResetFilter = () => {
  Object.assign(filterForm, {
    classId: '',
    courseId: ''
  })
  searchKeyword.value = ''
  showFilterSheet.value = false
  showSuccessToast('筛选已重置')
}

const handleViewDetails = (progress: ProgressData) => {
  emit('view-details', progress)
  showToast(`查看${progress.className}-${progress.courseName}的详情`)
}

const handleUpdateProgress = (progress: ProgressData) => {
  currentProgress.value = progress
  Object.assign(updateForm, {
    completedLessons: progress.completedLessons.toString(),
    progressNote: '',
    nextLessonText: progress.nextLesson ? formatDate(progress.nextLesson) : '',
    nextLesson: progress.nextLesson ? new Date(progress.nextLesson) : null
  })
  updateDialogVisible.value = true
}

const handleSaveProgress = async () => {
  if (!updateFormRef.value || !currentProgress.value) return

  try {
    // 基本验证
    if (!updateForm.completedLessons) {
      showFailToast('请输入完成课时')
      return
    }

    if (!updateForm.progressNote) {
      showFailToast('请输入进度说明')
      return
    }

    saving.value = true

    const completed = Number(updateForm.completedLessons)
    if (completed < 0 || completed > currentProgress.value.totalLessons) {
      showFailToast(`完成课时必须在0-${currentProgress.value.totalLessons}之间`)
      return
    }

    const updatedProgress: ProgressData = {
      ...currentProgress.value,
      completedLessons: completed,
      completionRate: Math.round((completed / currentProgress.value.totalLessons) * 100),
      nextLesson: updateForm.nextLesson?.toISOString() || '',
      lastUpdate: new Date().toISOString()
    }

    emit('update-progress', updatedProgress)
    updateDialogVisible.value = false
    showSuccessToast('进度更新成功')

  } catch (error) {
    console.error('保存进度失败:', error)
    showFailToast('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const onDateConfirm = () => {
  const [year, month, day] = currentDate.value
  const [hour, minute] = currentTime.value

  const date = new Date(`${year}-${month}-${day} ${hour}:${minute}:00`)
  updateForm.nextLesson = date
  updateForm.nextLessonText = formatDate(date.toISOString())
  showDatePicker.value = false

  showSuccessToast('已选择下次课程时间')
}

// 工具方法
const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return '#07c160'
  if (percentage >= 60) return '#ff976a'
  if (percentage >= 40) return '#ff6034'
  return '#1989fa'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  console.log('TeachingProgress组件已挂载')
})
</script>

<style lang="scss" scoped>
.mobile-teaching-progress {
  min-height: 100vh;
  background-color: var(--van-background-color);
  padding: var(--spacing-md);

  .progress-overview {
    margin-bottom: var(--spacing-md);

    .overview-card {
      background: white;
      border-radius: var(--radius-md);
      padding: var(--spacing-md);
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      .overview-icon {
        margin-bottom: var(--spacing-sm);

        .van-icon {
          font-size: var(--text-2xl);
        }
      }

      &.primary .overview-icon .van-icon { color: var(--van-primary-color); }
      &.success .overview-icon .van-icon { color: var(--van-success-color); }
      &.warning .overview-icon .van-icon { color: var(--van-warning-color); }

      .overview-content {
        .overview-value {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
          color: var(--van-text-color);
          margin-bottom: var(--spacing-xs);
        }

        .overview-label {
          font-size: var(--font-size-sm);
          color: var(--van-text-color-2);
        }
      }
    }
  }

  .filter-section {
    margin-bottom: var(--spacing-md);
  }

  .progress-item {
    background: white;
    border-radius: var(--radius-lg);
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-lg);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-md);

      .progress-title {
        flex: 1;

        .class-name {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
          color: var(--van-text-color);
          margin-bottom: var(--spacing-xs);
        }

        .course-name {
          font-size: var(--font-size-sm);
          color: var(--van-text-color-2);
        }
      }

      .progress-percentage {
        .percentage-value {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
          color: var(--van-primary-color);
        }
      }
    }

    .progress-content {
      .progress-stats {
        display: flex;
        justify-content: space-around;
        margin-bottom: var(--spacing-md);

        .stat-item {
          text-align: center;

          .stat-number {
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-bold);
            color: var(--van-text-color);
            margin-bottom: var(--spacing-xs);
          }

          .stat-label {
            font-size: var(--font-size-sm);
            color: var(--van-text-color-2);
          }
        }
      }

      .progress-bar {
        margin-bottom: var(--spacing-md);
      }

      .progress-details {
        margin-bottom: var(--spacing-md);

        .detail-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-sm);
          font-size: var(--font-size-sm);
          color: var(--van-text-color-2);

          .van-icon {
            color: var(--van-text-color-3);
          }

          &:last-child {
            margin-bottom: 0;
          }
        }
      }

      .progress-actions {
        display: flex;
        gap: var(--spacing-sm);

        .van-button {
          flex: 1;
        }
      }
    }
  }
}

.filter-content {
  padding: var(--spacing-lg);

  .filter-actions {
    display: flex;
    gap: var(--spacing-md);
    margin-top: var(--spacing-xl);

    .van-button {
      flex: 1;
    }
  }
}

.update-progress {
  height: 100%;
  display: flex;
  flex-direction: column;

  .update-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--van-border-color);

    .header-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      color: var(--van-text-color);
    }
  }

  .update-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md);
  }

  .update-footer {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    border-top: 1px solid var(--van-border-color);

    .van-button {
      flex: 1;
    }
  }
}

// 响应式设计
@media (max-width: 375px) {
  .mobile-teaching-progress {
    padding: var(--spacing-sm);

    .progress-item {
      padding: var(--spacing-md);

      .progress-content {
        .progress-stats {
          .stat-item {
            .stat-number {
              font-size: var(--font-size-base);
            }
          }
        }
      }
    }
  }
}
</style>