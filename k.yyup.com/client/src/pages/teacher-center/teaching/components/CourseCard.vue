<template>
  <el-card class="course-card" shadow="hover">
    <div class="course-header">
      <div class="course-title">{{ course.brainScienceCourse?.course_name || '未命名课程' }}</div>
      <el-tag :type="statusType">{{ statusText }}</el-tag>
    </div>
    
    <div class="course-info">
      <div class="info-item">
        <UnifiedIcon name="School" />
        <span>{{ course.class?.class_name || '未分配班级' }}</span>
      </div>
      <div class="info-item">
        <UnifiedIcon name="Calendar" />
        <span>开始: {{ formatDate(course.start_date) }}</span>
      </div>
    </div>

    <div class="course-progress">
      <div class="progress-info">
        <span>完成进度</span>
        <span class="progress-value">{{ progressPercentage }}%</span>
      </div>
      <el-progress 
        :percentage="progressPercentage" 
        :color="progressColor"
        :stroke-width="8"
      />
      <div class="progress-detail">
        <span>{{ completedLessons }} / {{ totalLessons }} 课时</span>
      </div>
    </div>

    <div class="course-actions">
      <el-button size="small" @click="$emit('viewDetail', course)">
        <UnifiedIcon name="View" />
        查看详情
      </el-button>
      <el-button type="primary" size="small" @click="$emit('addRecord', course)">
        <UnifiedIcon name="Plus" />
        添加记录
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type TeacherCourse } from '@/api/modules/teacher-courses'
import dayjs from 'dayjs'

const props = defineProps<{
  course: TeacherCourse
}>()

const emit = defineEmits<{
  viewDetail: [course: TeacherCourse]
  addRecord: [course: TeacherCourse]
}>()

const statusType = computed(() => {
  const map: Record<string, any> = {
    assigned: '',
    in_progress: 'success',
    completed: 'info',
    paused: 'warning'
  }
  return map[props.course.status] || ''
})

const statusText = computed(() => {
  const map: Record<string, string> = {
    assigned: '已分配',
    in_progress: '进行中',
    completed: '已完成',
    paused: '已暂停'
  }
  return map[props.course.status] || props.course.status
})

const completedLessons = computed(() => props.course.progress?.completed_lessons || 0)
const totalLessons = computed(() => props.course.progress?.total_lessons || 0)
const progressPercentage = computed(() => {
  if (totalLessons.value === 0) return 0
  return Math.round((completedLessons.value / totalLessons.value) * 100)
})

const progressColor = computed(() => {
  const percentage = progressPercentage.value
  if (percentage >= 100) return '#67c23a'
  if (percentage >= 60) return '#409eff'
  if (percentage >= 30) return '#e6a23c'
  return '#f56c6c'
})

const formatDate = (date?: string) => {
  if (!date) return '未设置'
  return dayjs(date).format('YYYY-MM-DD')
}
</script>

<style lang="scss" scoped>
.course-card {
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .course-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;

    .course-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: #303133;
      flex: 1;
      margin-right: 8px;
    }
  }

  .course-info {
    margin-bottom: 16px;

    .info-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      color: #606266;
      font-size: var(--text-sm);
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .course-progress {
    margin-bottom: 16px;

    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: var(--text-sm);
      color: #606266;

      .progress-value {
        font-weight: 600;
        color: #303133;
      }
    }

    .progress-detail {
      margin-top: 4px;
      font-size: var(--text-xs);
      color: #909399;
      text-align: right;
    }
  }

  .course-actions {
    display: flex;
    gap: var(--spacing-sm);
  }
}
</style>
