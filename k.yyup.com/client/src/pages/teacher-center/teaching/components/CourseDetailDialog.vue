<template>
  <el-dialog
    v-model="visible"
    title="课程详情"
    width="800px"
    :before-close="handleClose"
  >
    <div v-if="course" class="course-detail">
      <!-- 课程基本信息 -->
      <el-descriptions :column="2" border>
        <el-descriptions-item label="课程名称">
          {{ course.brainScienceCourse?.course_name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="课程状态">
          <el-tag :type="statusType">{{ statusText }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="所属班级">
          {{ course.class?.class_name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="课程类型">
          {{ course.brainScienceCourse?.course_type || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="开始日期">
          {{ formatDate(course.start_date) }}
        </el-descriptions-item>
        <el-descriptions-item label="预计结束日期">
          {{ formatDate(course.expected_end_date) }}
        </el-descriptions-item>
        <el-descriptions-item label="分配时间">
          {{ formatDateTime(course.assigned_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="实际结束日期">
          {{ formatDate(course.actual_end_date) || '进行中' }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 教学进度 -->
      <div class="section-title">教学进度</div>
      <div class="progress-section">
        <el-progress 
          :percentage="progressPercentage" 
          :stroke-width="20"
          :color="progressColor"
        >
          <span class="progress-text">{{ progressPercentage }}%</span>
        </el-progress>
        <div class="progress-info">
          <span>已完成: {{ course.progress?.completed_lessons || 0 }} 课时</span>
          <span>总课时: {{ course.progress?.total_lessons || 0 }} 课时</span>
        </div>
      </div>

      <!-- 教学记录列表 -->
      <div class="section-title">
        教学记录
        <el-button type="primary" size="small" @click="handleAddRecord">
          <UnifiedIcon name="Plus" />
          添加记录
        </el-button>
      </div>
      <el-table :data="course.records || []" border style="width: 100%">
        <el-table-column prop="lesson_date" label="上课日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.lesson_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="lesson_duration" label="课时(分钟)" width="100" />
        <el-table-column prop="attendance_count" label="出勤人数" width="100" />
        <el-table-column prop="teaching_content" label="教学内容" show-overflow-tooltip />
        <el-table-column prop="created_at" label="记录时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 状态更新 -->
      <div v-if="course.status !== 'completed'" class="section-title">更新状态</div>
      <div v-if="course.status !== 'completed'" class="status-actions">
        <el-button 
          v-if="course.status === 'assigned'"
          type="success"
          @click="handleUpdateStatus('in_progress')"
        >
          开始课程
        </el-button>
        <el-button 
          v-if="course.status === 'in_progress'"
          type="warning"
          @click="handleUpdateStatus('paused')"
        >
          暂停课程
        </el-button>
        <el-button 
          v-if="course.status === 'paused'"
          type="success"
          @click="handleUpdateStatus('in_progress')"
        >
          继续课程
        </el-button>
        <el-button 
          v-if="course.status === 'in_progress' && progressPercentage >= 100"
          type="primary"
          @click="handleUpdateStatus('completed')"
        >
          完成课程
        </el-button>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type TeacherCourse } from '@/api/modules/teacher-courses'
import dayjs from 'dayjs'

const props = defineProps<{
  modelValue: boolean
  course: TeacherCourse | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'addRecord': [course: TeacherCourse]
  'updateStatus': [courseId: number, status: string]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const statusType = computed(() => {
  if (!props.course) return ''
  const map: Record<string, any> = {
    assigned: '',
    in_progress: 'success',
    completed: 'info',
    paused: 'warning'
  }
  return map[props.course.status] || ''
})

const statusText = computed(() => {
  if (!props.course) return ''
  const map: Record<string, string> = {
    assigned: '已分配',
    in_progress: '进行中',
    completed: '已完成',
    paused: '已暂停'
  }
  return map[props.course.status] || props.course.status
})

const progressPercentage = computed(() => {
  if (!props.course?.progress) return 0
  const { completed_lessons = 0, total_lessons = 0 } = props.course.progress
  if (total_lessons === 0) return 0
  return Math.round((completed_lessons / total_lessons) * 100)
})

const progressColor = computed(() => {
  const percentage = progressPercentage.value
  if (percentage >= 100) return '#67c23a'
  if (percentage >= 60) return '#409eff'
  if (percentage >= 30) return '#e6a23c'
  return '#f56c6c'
})

const formatDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}

const formatDateTime = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const handleClose = () => {
  visible.value = false
}

const handleAddRecord = () => {
  if (props.course) {
    emit('addRecord', props.course)
    handleClose()
  }
}

const handleUpdateStatus = (status: string) => {
  if (props.course) {
    emit('updateStatus', props.course.id, status)
  }
}
</script>

<style lang="scss" scoped>
.course-detail {
  .section-title {
    font-size: var(--text-base);
    font-weight: 600;
    color: #303133;
    margin: var(--spacing-lg) 0 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:first-child {
      margin-top: 0;
    }
  }

  .progress-section {
    margin-bottom: 16px;

    .progress-text {
      font-size: var(--text-sm);
      font-weight: 600;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: var(--text-sm);
      color: #606266;
    }
  }

  .status-actions {
    display: flex;
    gap: var(--spacing-md);
  }
}
</style>
