<!--
  🎓 学生列表结果展示组件
  用于展示查询学生信息的Function Tool结果
-->

<template>
  <div class="student-list-result">
    <div class="result-header">
      <div class="result-title">
        <span class="title-icon">👥</span>
        <h4>{{ metadata?.title || '学生信息' }}</h4>
      </div>
      <div class="result-summary">
        找到 {{ data?.students?.length || 0 }} 名学生
      </div>
    </div>

    <div v-if="data?.students?.length > 0" class="student-cards">
      <div 
        v-for="student in data.students" 
        :key="student.id"
        class="student-card"
        @click="handleStudentClick(student)"
      >
        <div class="student-avatar">
          <img v-if="student.avatar" :src="student.avatar" :alt="student.name" />
          <span v-else class="avatar-placeholder">{{ student.name?.[0] || '学' }}</span>
        </div>
        
        <div class="student-info">
          <div class="student-name">{{ student.name || '未知学生' }}</div>
          <div class="student-details">
            <span class="detail-item">
              <span class="detail-icon">🎂</span>
              {{ student.age || '--' }}岁
            </span>
            <span class="detail-item">
              <span class="detail-icon">🏫</span>
              {{ student.className || '未分班' }}
            </span>
          </div>
          <div v-if="student.status" class="student-status" :class="getStatusClass(student.status)">
            {{ getStatusText(student.status) }}
          </div>
        </div>

        <div class="student-actions">
          <button 
            @click.stop="handleAction('view-detail', student)"
            class="action-btn primary"
            title="查看详情"
          >
            👁️
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">📚</div>
      <div class="empty-text">{{ data?.message || '没有找到符合条件的学生' }}</div>
    </div>

    <div v-if="metadata?.actions?.length > 0" class="result-actions">
      <button 
        v-for="action in metadata.actions"
        :key="action.action"
        @click="handleAction(action.action, action.params)"
        class="result-action-btn"
      >
        {{ action.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface Student {
  id: string
  name: string
  age?: number
  avatar?: string
  className?: string
  status?: 'active' | 'inactive' | 'graduated'
  [key: string]: any
}

interface Props {
  data: {
    students: Student[]
    total?: number
    message?: string
  }
  metadata?: {
    title?: string
    description?: string
    type?: string
    actions?: Array<{
      label: string
      action: string
      params?: any
    }>
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  action: [action: string, params?: any]
}>()

const handleStudentClick = (student: Student) => {
  emit('action', 'view-student', student)
}

const handleAction = (action: string, params?: any) => {
  emit('action', action, params)
}

const getStatusClass = (status: string) => {
  const classMap = {
    'active': 'status-active',
    'inactive': 'status-inactive', 
    'graduated': 'status-graduated'
  }
  return classMap[status as keyof typeof classMap] || ''
}

const getStatusText = (status: string) => {
  const textMap = {
    'active': '在校',
    'inactive': '休学',
    'graduated': '毕业'
  }
  return textMap[status as keyof typeof textMap] || status
}
</script>

<style lang="scss" scoped>
.student-list-result {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
}

.result-header {
  padding: var(--spacing-md);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  .result-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);

    .title-icon {
      font-size: 1var(--spacing-sm);
    }

    h4 {
      margin: 0;
      font-size: var(--spacing-md);
      font-weight: 600;
    }
  }

  .result-summary {
    font-size: 12px;
    opacity: 0.9;
  }
}

.student-cards {
  padding: var(--spacing-sm);
  max-height: 300px;
  overflow-y: auto;
}

.student-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--spacing-sm);
  background: white;
  border: var(--border-width-base) solid #e5e7eb;
  margin-bottom: var(--spacing-sm);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
    border-color: #667eea;
    box-shadow: 0 2px var(--spacing-xs) rgba(102, 126, 234, 0.1);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    font-size: var(--spacing-md);
    font-weight: 600;
    color: #667eea;
  }
}

.student-info {
  flex: 1;
  min-width: 0;

  .student-name {
    font-size: 1var(--spacing-xs);
    font-weight: 600;
    color: #1f2937;
    margin-bottom: var(--spacing-xs);
  }

  .student-details {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);

    .detail-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: 12px;
      color: #6b7280;

      .detail-icon {
        font-size: 1var(--border-width-base);
      }
    }
  }

  .student-status {
    font-size: 1var(--border-width-base);
    padding: 2px 6px;
    border-radius: var(--spacing-xs);
    display: inline-block;

    &.status-active {
      background: #dcfce7;
      color: #166534;
    }

    &.status-inactive {
      background: #fef3c7;
      color: #92400e;
    }

    &.status-graduated {
      background: #dbeafe;
      color: #1e40af;
    }
  }
}

.student-actions {
  display: flex;
  gap: var(--spacing-xs);

  .action-btn {
    width: 2var(--spacing-sm);
    height: 2var(--spacing-sm);
    border: none;
    border-radius: 6px;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 12px;

    &:hover {
      background: #e5e7eb;
    }

    &.primary {
      background: #667eea;
      color: white;

      &:hover {
        background: #5a67d8;
      }
    }
  }
}

.empty-state {
  padding: var(--spacing-xl) var(--spacing-md);
  text-align: center;
  color: #6b7280;

  .empty-icon {
    font-size: var(--spacing-xl);
    margin-bottom: var(--spacing-sm);
  }

  .empty-text {
    font-size: 1var(--spacing-xs);
  }
}

.result-actions {
  padding: 12px var(--spacing-md);
  background: #f9fafb;
  border-top: var(--border-width-base) solid #e5e7eb;
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;

  .result-action-btn {
    padding: 6px 12px;
    background: white;
    border: var(--border-width-base) solid #d1d5db;
    border-radius: 6px;
    font-size: 12px;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #f3f4f6;
      border-color: #9ca3af;
    }
  }
}
</style>