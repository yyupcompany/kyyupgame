<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    @close="handleClose"
  >
    <div class="class-detail-content" v-loading="loading">
      <!-- 班级基本信息 -->
      <div class="class-info-section">
        <div class="section-header">
          <h3>班级信息</h3>
          <div class="class-actions">
            <el-button size="small" @click="refreshDetail">
              <UnifiedIcon name="Refresh" />
              刷新
            </el-button>
          </div>
        </div>
        
        <div class="class-basic-info">
          <div class="info-item">
            <span class="label">班级名称：</span>
            <span class="value">{{ classData?.class_name || '--' }}</span>
          </div>
          <div class="info-item">
            <span class="label">学生人数：</span>
            <span class="value">{{ classData?.current_student_count || 0 }}人</span>
          </div>
          <div class="info-item">
            <span class="label">媒体文件：</span>
            <MediaStatusIndicator 
              :has-media="classData?.has_class_media || false"
              :media-count="classData?.class_media_count || 0"
              :type="getMediaType()"
              @click="showMediaPreview"
            />
          </div>
        </div>
      </div>

      <!-- 学生详情列表 -->
      <div class="students-section" v-if="detailType === 'course_plan'">
        <div class="section-header">
          <h3>学生达标情况</h3>
        </div>
        
        <div class="students-list">
          <div 
            v-for="student in studentsList" 
            :key="student.student_id"
            class="student-item"
          >
            <div class="student-info">
              <div class="student-avatar">
                <img 
                  v-if="student.photo_url" 
                  :src="student.photo_url" 
                  :alt="student.student_name"
                  @error="handleImageError"
                />
                <div v-else class="avatar-placeholder">
                  {{ student.student_name?.charAt(0) || '?' }}
                </div>
              </div>
              <div class="student-details">
                <div class="student-name">{{ student.student_name }}</div>
                <div class="student-no">学号：{{ student.student_no }}</div>
              </div>
            </div>
            <div class="student-progress">
              <div class="achievement-rate">{{ student.achievement_rate || 0 }}%</div>
              <el-progress 
                :percentage="student.achievement_rate || 0" 
                :stroke-width="4"
                :show-text="false"
                :color="getProgressColor(student.achievement_rate || 0)"
              />
              <MediaStatusIndicator 
                :has-media="student.has_media || false"
                :media-count="student.media_count || 0"
                type="student"
                size="small"
                @click="showStudentMedia(student)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 训练记录列表 -->
      <div class="training-records-section" v-else-if="detailType === 'outdoor_training'">
        <div class="section-header">
          <h3>训练记录</h3>
        </div>
        
        <div class="training-records-list">
          <div 
            v-for="record in trainingRecords" 
            :key="record.id"
            class="training-record-item"
          >
            <div class="record-info">
              <div class="record-title">第{{ record.week_number }}周 - {{ record.training_type === 'outdoor_training' ? '户外训练' : '离园展示' }}</div>
              <div class="record-date">{{ record.training_date }}</div>
              <div class="record-location" v-if="record.location">地点：{{ record.location }}</div>
            </div>
            <div class="record-stats">
              <div class="attendance">参与：{{ record.attendance_count }}人</div>
              <div class="achievement">达标：{{ record.target_achieved_count }}人</div>
              <div class="rate">{{ record.achievement_rate }}%</div>
              <div class="status" :class="`status-${record.completion_status}`">
                {{ getStatusText(record.completion_status) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 展示记录列表 -->
      <div class="display-records-section" v-else-if="detailType === 'external_display'">
        <div class="section-header">
          <h3>展示记录</h3>
        </div>
        
        <div class="display-records-list">
          <div 
            v-for="record in displayRecords" 
            :key="record.id"
            class="display-record-item"
          >
            <div class="record-info">
              <div class="record-title">{{ record.activity_name }}</div>
              <div class="record-date">{{ record.activity_date }}</div>
              <div class="record-location">{{ record.location }}</div>
              <div class="record-type">{{ record.activity_type }}</div>
            </div>
            <div class="record-stats">
              <div class="participants">{{ record.participant_count }}人参与</div>
              <div class="achievement-level">{{ record.achievement_level }}</div>
              <div class="rate">{{ record.achievement_rate }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="isEmpty" class="empty-state">
        <el-empty description="暂无数据" />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="exportData" v-if="!isEmpty">
          <UnifiedIcon name="Download" />
          导出数据
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 媒体预览弹窗 -->
  <MediaPreviewDialog
    v-model="showMediaDialog"
    :media-list="mediaList"
    :title="mediaDialogTitle"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Refresh, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import MediaStatusIndicator from './MediaStatusIndicator.vue'
import MediaPreviewDialog from './MediaPreviewDialog.vue'
import { teachingCenterApi } from '@/api/endpoints/teaching-center'

interface Props {
  modelValue: boolean
  classData: any
  detailType: 'course_plan' | 'outdoor_training' | 'external_display'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  refresh: []
}>()

// 响应式数据
const loading = ref(false)
const studentsList = ref([])
const trainingRecords = ref([])
const displayRecords = ref([])
const showMediaDialog = ref(false)
const mediaList = ref([])
const mediaDialogTitle = ref('')

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const dialogTitle = computed(() => {
  const typeNames = {
    course_plan: '课程计划详情',
    outdoor_training: '户外训练详情',
    external_display: '校外展示详情'
  }
  return `${props.classData?.class_name || ''} - ${typeNames[props.detailType] || '详情'}`
})

const isEmpty = computed(() => {
  switch (props.detailType) {
    case 'course_plan':
      return studentsList.value.length === 0
    case 'outdoor_training':
      return trainingRecords.value.length === 0
    case 'external_display':
      return displayRecords.value.length === 0
    default:
      return true
  }
})

// 监听弹窗显示状态
watch(() => props.modelValue, (visible) => {
  if (visible && props.classData) {
    loadDetailData()
  }
})

// 方法
const handleClose = () => {
  emit('update:modelValue', false)
}

const refreshDetail = () => {
  loadDetailData()
}

const getMediaType = () => {
  const typeMap = {
    course_plan: 'class',
    outdoor_training: 'outdoor',
    external_display: 'external'
  }
  return typeMap[props.detailType] || 'class'
}

const getProgressColor = (rate: number) => {
  if (rate >= 80) return 'var(--success-color)'
  if (rate >= 60) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const getStatusText = (status: string) => {
  const statusMap = {
    'not_started': '未开始',
    'in_progress': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const showMediaPreview = () => {
  mediaDialogTitle.value = `${props.classData?.class_name} - 班级媒体文件`
  // TODO: 加载媒体文件列表
  showMediaDialog.value = true
}

const showStudentMedia = (student: any) => {
  mediaDialogTitle.value = `${student.student_name} - 学习媒体文件`
  // TODO: 加载学生媒体文件列表
  showMediaDialog.value = true
}

const exportData = () => {
  ElMessage.success('导出功能开发中')
}

const loadDetailData = async () => {
  if (!props.classData?.class_id) return

  try {
    loading.value = true
    
    switch (props.detailType) {
      case 'course_plan':
        await loadStudentsData()
        break
      case 'outdoor_training':
        await loadTrainingRecords()
        break
      case 'external_display':
        await loadDisplayRecords()
        break
    }
  } catch (error) {
    console.error('加载详情数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadStudentsData = async () => {
  const response = await teachingCenterApi.getClassDetailedProgress(props.classData.class_id)
  if (response.success) {
    studentsList.value = response.data.students || []
  }
}

const loadTrainingRecords = async () => {
  const response = await teachingCenterApi.getClassOutdoorTrainingDetails(props.classData.class_id)
  if (response.success) {
    trainingRecords.value = response.data.training_records || []
  }
}

const loadDisplayRecords = async () => {
  const response = await teachingCenterApi.getClassExternalDisplayDetails(props.classData.class_id)
  if (response.success) {
    displayRecords.value = response.data.display_records || []
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.class-detail-content {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
    }

    .class-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .class-info-section {
    margin-bottom: var(--spacing-2xl);
    padding: var(--spacing-lg);
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);

    .class-basic-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-lg);

      .info-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .label {
          font-size: var(--text-base);
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .value {
          font-size: var(--text-base);
          font-weight: var(--font-medium);
          color: var(--text-primary);
        }
      }
    }
  }

  .students-section,
  .training-records-section,
  .display-records-section {
    .students-list,
    .training-records-list,
    .display-records-list {
      max-min-height: 60px; height: auto;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .student-item,
    .training-record-item,
    .display-record-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      background: var(--bg-card);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      transition: all var(--transition-fast) var(--ease-in-out);

      &:hover {
        border-color: var(--border-focus);
        box-shadow: var(--shadow-sm);
      }
    }

    .student-item {
      .student-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        flex: 1;

        .student-avatar {
          width: 40px; height: 40px;
          border-radius: var(--radius-full);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          flex-shrink: 0;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .avatar-placeholder {
            width: 100%;
            height: 100%;
            background: var(--primary-light-bg);
            color: var(--primary-color);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: var(--font-semibold);
            font-size: var(--text-lg);
          }
        }

        .student-details {
          .student-name {
            font-size: var(--text-base);
            font-weight: var(--font-semibold);
            color: var(--text-primary);
            margin-bottom: var(--spacing-sm);
          }

          .student-no {
            font-size: var(--text-sm);
            color: var(--text-secondary);
          }
        }
      }

      .student-progress {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: var(--spacing-sm);
        min-max-width: 120px; width: 100%;

        .achievement-rate {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--el-color-primary);
        }

        .el-progress {
          width: auto;
        }
      }
    }

    .training-record-item,
    .display-record-item {
      .record-info {
        flex: 1;

        .record-title {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .record-date {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-sm);
        }

        .record-location,
        .record-type {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
      }

      .record-stats {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: var(--spacing-xs);

        .attendance,
        .achievement,
        .participants {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .rate {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--el-color-success);
        }

        .achievement-level {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--el-color-warning);
        }

        .status {
          padding: var(--spacing-sm) 6px;
          border-radius: var(--radius-xl);
          font-size: var(--text-2xs);
          font-weight: 500;

          &.status-not_started {
            background: var(--el-color-info-light-8);
            color: var(--el-color-info);
          }

          &.status-in_progress {
            background: var(--el-color-warning-light-8);
            color: var(--el-color-warning);
          }

          &.status-completed {
            background: var(--el-color-success-light-8);
            color: var(--el-color-success);
          }

          &.status-cancelled {
            background: var(--el-color-danger-light-8);
            color: var(--el-color-danger);
          }
        }
      }
    }
  }

  .empty-state {
    padding: var(--spacing-10xl);
    text-align: center;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

// 移动端适配
@media (max-width: var(--breakpoint-md)) {
  .class-detail-content {
    .class-basic-info {
      grid-template-columns: 1fr;
    }

    .student-item,
    .training-record-item,
    .display-record-item {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--text-sm);

      .student-progress,
      .record-stats {
        align-items: flex-start;
        width: 100%;
      }
    }
  }
}
</style>
