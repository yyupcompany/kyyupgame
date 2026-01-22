<template>
  <div class="teaching-progress">
    <!-- 进度概览 -->
    <div class="progress-overview">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="8">
          <el-card class="overview-card">
            <div class="overview-content">
              <div class="overview-icon">
                <UnifiedIcon name="default" />
              </div>
              <div class="overview-info">
                <div class="overview-value">{{ overallProgress }}%</div>
                <div class="overview-label">总体进度</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card class="overview-card">
            <div class="overview-content">
              <div class="overview-icon">
                <UnifiedIcon name="default" />
              </div>
              <div class="overview-info">
                <div class="overview-value">{{ completedLessons }}</div>
                <div class="overview-label">已完成课时</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card class="overview-card">
            <div class="overview-content">
              <div class="overview-icon">
                <UnifiedIcon name="default" />
              </div>
              <div class="overview-info">
                <div class="overview-value">{{ remainingLessons }}</div>
                <div class="overview-label">剩余课时</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="班级">
          <el-select v-model="filterForm.classId" placeholder="选择班级" clearable style="max-max-width: 150px; width: 100%; width: 100%">
            <el-option label="全部班级" value="" />
            <el-option 
              v-for="classItem in classList" 
              :key="classItem.id"
              :label="classItem.name" 
              :value="classItem.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="filterForm.courseId" placeholder="选择课程" clearable style="width: 150px">
            <el-option label="全部课程" value="" />
            <el-option 
              v-for="course in courseList" 
              :key="course.id"
              :label="course.name" 
              :value="course.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">
            <UnifiedIcon name="Search" />
            筛选
          </el-button>
          <el-button @click="handleResetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 进度列表 -->
    <div class="progress-list" v-loading="loading">
      <div 
        v-for="progress in filteredProgressData" 
        :key="`${progress.classId}-${progress.courseId}`"
        class="progress-item"
      >
        <el-card shadow="hover">
          <div class="progress-header">
            <div class="progress-title">
              <div class="class-name">{{ progress.className }}</div>
              <div class="course-name">{{ progress.courseName }}</div>
            </div>
            <div class="progress-actions">
              <el-button size="small" @click="handleViewDetails(progress)">
                查看详情
              </el-button>
              <el-button size="small" type="primary" @click="handleUpdateProgress(progress)">
                更新进度
              </el-button>
            </div>
          </div>
          
          <div class="progress-content">
            <div class="progress-stats">
              <div class="stat-item">
                <span class="stat-label">总课时:</span>
                <span class="stat-value">{{ progress.totalLessons }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">已完成:</span>
                <span class="stat-value">{{ progress.completedLessons }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">完成率:</span>
                <span class="stat-value">{{ progress.completionRate }}%</span>
              </div>
            </div>
            
            <div class="progress-bar">
              <el-progress 
                :percentage="progress.completionRate" 
                :stroke-width="12"
                :color="getProgressColor(progress.completionRate)"
              />
            </div>
            
            <div class="progress-details">
              <div class="detail-item">
                <span class="detail-label">最近更新:</span>
                <span class="detail-value">{{ formatDate(progress.lastUpdate) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">下次课程:</span>
                <span class="detail-value">{{ formatDate(progress.nextLesson) }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>
      
      <div v-if="filteredProgressData.length === 0" class="empty-state">
        <el-empty description="暂无进度数据" />
      </div>
    </div>

    <!-- 进度更新弹窗 -->
    <el-dialog
      v-model="updateDialogVisible"
      title="更新教学进度"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form v-if="currentProgress" :model="updateForm" :rules="updateRules" ref="updateFormRef" label-width="100px">
        <el-form-item label="班级课程">
          <el-input :value="`${currentProgress.className} - ${currentProgress.courseName}`" disabled />
        </el-form-item>
        <el-form-item label="完成课时" prop="completedLessons">
          <el-input-number 
            v-model="updateForm.completedLessons" 
            :min="0" 
            :max="currentProgress.totalLessons"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="进度说明" prop="progressNote">
          <el-input 
            v-model="updateForm.progressNote" 
            type="textarea" 
            :rows="3"
            placeholder="请输入进度说明"
          />
        </el-form-item>
        <el-form-item label="下次课程" prop="nextLesson">
          <el-date-picker
            v-model="updateForm.nextLesson"
            type="datetime"
            placeholder="选择下次课程时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="updateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveProgress" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  TrendCharts,
  Clock,
  Calendar,
  Search
} from '@element-plus/icons-vue'

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
  progressData: ProgressData[]
}

interface Emits {
  (e: 'update-progress', progress: ProgressData): void
  (e: 'view-details', progress: ProgressData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const updateDialogVisible = ref(false)
const saving = ref(false)
const currentProgress = ref<ProgressData | null>(null)
const updateFormRef = ref<FormInstance>()

const filterForm = reactive({
  classId: '',
  courseId: ''
})

const updateForm = reactive({
  completedLessons: 0,
  progressNote: '',
  nextLesson: null
})

const updateRules: FormRules = {
  completedLessons: [
    { required: true, message: '请输入完成课时', trigger: 'blur' }
  ],
  progressNote: [
    { required: true, message: '请输入进度说明', trigger: 'blur' }
  ]
}

// 模拟数据
const classList = ref([
  { id: 1, name: '大班A' },
  { id: 2, name: '中班B' },
  { id: 3, name: '小班C' }
])

const courseList = ref([
  { id: 1, name: '数学启蒙' },
  { id: 2, name: '语言表达' },
  { id: 3, name: '艺术创作' }
])

// 计算属性
const filteredProgressData = computed(() => {
  let result = props.progressData
  
  if (filterForm.classId) {
    result = result.filter(item => item.classId === Number(filterForm.classId))
  }
  
  if (filterForm.courseId) {
    result = result.filter(item => item.courseId === Number(filterForm.courseId))
  }
  
  return result
})

const overallProgress = computed(() => {
  if (props.progressData.length === 0) return 0
  const total = props.progressData.reduce((sum, item) => sum + item.completionRate, 0)
  return Math.round(total / props.progressData.length)
})

const completedLessons = computed(() => {
  return props.progressData.reduce((sum, item) => sum + item.completedLessons, 0)
})

const remainingLessons = computed(() => {
  const total = props.progressData.reduce((sum, item) => sum + item.totalLessons, 0)
  return total - completedLessons.value
})

// 方法
const handleFilter = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleResetFilter = () => {
  Object.assign(filterForm, {
    classId: '',
    courseId: ''
  })
}

const handleViewDetails = (progress: ProgressData) => {
  emit('view-details', progress)
}

const handleUpdateProgress = (progress: ProgressData) => {
  currentProgress.value = progress
  Object.assign(updateForm, {
    completedLessons: progress.completedLessons,
    progressNote: '',
    nextLesson: progress.nextLesson ? new Date(progress.nextLesson) : null
  })
  updateDialogVisible.value = true
}

const handleSaveProgress = async () => {
  if (!updateFormRef.value || !currentProgress.value) return
  
  try {
    await updateFormRef.value.validate()
    saving.value = true
    
    const updatedProgress = {
      ...currentProgress.value,
      completedLessons: updateForm.completedLessons,
      completionRate: Math.round((updateForm.completedLessons / currentProgress.value.totalLessons) * 100),
      nextLesson: updateForm.nextLesson ? updateForm.nextLesson.toISOString() : '',
      lastUpdate: new Date().toISOString()
    }
    
    emit('update-progress', updatedProgress)
    updateDialogVisible.value = false
    ElMessage.success('进度更新成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    saving.value = false
  }
}

// 工具方法
const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return 'var(--success-color)'
  if (percentage >= 60) return 'var(--warning-color)'
  if (percentage >= 40) return 'var(--danger-color)'
  return 'var(--info-color)'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style lang="scss" scoped>
.teaching-progress {
  .progress-overview {
    margin-bottom: var(--spacing-2xl);

    .overview-card {
      .overview-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);

        .overview-icon {
          width: auto;
          min-height: 60px; height: auto;
          background: var(--gradient-primary);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-on-primary);
          font-size: var(--text-2xl);
        }

        .overview-info {
          flex: 1;

          .overview-value {
            font-size: var(--text-3xl);
            font-weight: var(--font-bold);
            color: var(--text-primary);
            line-height: var(--leading-none);
            margin-bottom: var(--spacing-xs);
          }

          .overview-label {
            font-size: var(--text-base);
            color: var(--text-secondary);
          }
        }
      }
    }
  }

  .filter-section {
    margin-bottom: var(--spacing-xl);
    padding: var(--spacing-lg);
    background-color: var(--bg-page);
    border-radius: var(--radius-md);
  }
  
  .progress-list {
    .progress-item {
      margin-bottom: var(--spacing-xl);

      .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--spacing-lg);

        .progress-title {
          .class-name {
            font-size: var(--text-xl);
            font-weight: var(--font-semibold);
            color: var(--text-primary);
            margin-bottom: var(--spacing-xs);
          }

          .course-name {
            font-size: var(--text-base);
            color: var(--text-secondary);
          }
        }

        .progress-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
      }

      .progress-content {
        .progress-stats {
          display: flex;
          gap: var(--spacing-2xl);
          margin-bottom: var(--spacing-lg);

          .stat-item {
            .stat-label {
              font-size: var(--text-base);
              color: var(--text-secondary);
              margin-right: var(--spacing-xs);
            }

            .stat-value {
              font-size: var(--text-lg);
              font-weight: var(--font-semibold);
              color: var(--text-primary);
            }
          }
        }
        
        .progress-bar {
          margin-bottom: var(--spacing-lg);
        }

        .progress-details {
          display: flex;
          gap: var(--spacing-2xl);

          .detail-item {
            .detail-label {
              font-size: var(--text-sm);
              color: var(--text-secondary);
              margin-right: var(--spacing-xs);
            }

            .detail-value {
              font-size: var(--text-base);
              color: var(--text-regular);
            }
          }
        }
      }
    }
  }

  .empty-state {
    padding: var(--spacing-5xl);
    text-align: center;
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .teaching-progress {
    .progress-overview {
      :deep(.el-col) {
        margin-bottom: var(--spacing-lg);
      }
    }

    .progress-list {
      .progress-item {
        .progress-header {
          flex-direction: column;
          gap: var(--spacing-sm);
          align-items: flex-start;
        }

        .progress-content {
          .progress-stats {
            flex-direction: column;
            gap: var(--spacing-sm);
          }

          .progress-details {
            flex-direction: column;
            gap: var(--spacing-sm);
          }
        }
      }
    }
  }
}
</style>
