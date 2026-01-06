<!--
  🎯 活动列表结果展示组件
  用于展示查询活动信息的Function Tool结果
-->

<template>
  <div class="activity-list-result">
    <div class="result-header">
      <div class="result-title">
        <span class="title-icon">🎯</span>
        <h4>{{ metadata?.title || '活动信息' }}</h4>
      </div>
      <div class="result-summary">
        找到 {{ data?.activities?.length || 0 }} 个活动
      </div>
    </div>

    <div v-if="data?.activities?.length > 0" class="activity-cards">
      <div 
        v-for="activity in data.activities" 
        :key="activity.id"
        class="activity-card"
        @click="handleActivityClick(activity)"
      >
        <div class="activity-image">
          <img v-if="activity.image" :src="activity.image" :alt="activity.title" />
          <div v-else class="image-placeholder">
            <span>{{ getActivityIcon(activity.type) }}</span>
          </div>
          <div v-if="activity.status" class="activity-status" :class="getStatusClass(activity.status)">
            {{ getStatusText(activity.status) }}
          </div>
        </div>
        
        <div class="activity-info">
          <div class="activity-title">{{ activity.title || '未命名活动' }}</div>
          <div class="activity-details">
            <div class="detail-row">
              <span class="detail-item">
                <span class="detail-icon">📅</span>
                {{ formatDate(activity.date) || '待定' }}
              </span>
              <span class="detail-item">
                <span class="detail-icon">📍</span>
                {{ activity.location || '未指定' }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-item">
                <span class="detail-icon">👥</span>
                {{ activity.participantCount || 0 }} 人参与
              </span>
              <span v-if="activity.maxParticipants" class="detail-item">
                <span class="detail-icon">🎯</span>
                限额 {{ activity.maxParticipants }} 人
              </span>
            </div>
          </div>
          <div v-if="activity.description" class="activity-description">
            {{ activity.description }}
          </div>
        </div>

        <div class="activity-actions">
          <button 
            @click.stop="handleAction('view-detail', activity)"
            class="action-btn primary"
            title="查看详情"
          >
            👁️
          </button>
          <button 
            v-if="activity.status === 'active'"
            @click.stop="handleAction('register', activity)"
            class="action-btn success"
            title="报名"
          >
            ✋
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">🎯</div>
      <div class="empty-text">{{ data?.message || '没有找到符合条件的活动' }}</div>
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

interface Activity {
  id: string
  title: string
  description?: string
  date?: string
  location?: string
  image?: string
  type?: 'education' | 'sports' | 'art' | 'outdoor' | 'other'
  status?: 'active' | 'completed' | 'cancelled' | 'draft'
  participantCount?: number
  maxParticipants?: number
  [key: string]: any
}

interface Props {
  data: {
    activities: Activity[]
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

const handleActivityClick = (activity: Activity) => {
  emit('action', 'view-activity', activity)
}

const handleAction = (action: string, params?: any) => {
  emit('action', action, params)
}

const getActivityIcon = (type: string) => {
  const iconMap = {
    'education': '📚',
    'sports': '⚽',
    'art': '🎨',
    'outdoor': '🌳',
    'other': '🎯'
  }
  return iconMap[type as keyof typeof iconMap] || '🎯'
}

const getStatusClass = (status: string) => {
  const classMap = {
    'active': 'status-active',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled',
    'draft': 'status-draft'
  }
  return classMap[status as keyof typeof classMap] || ''
}

const getStatusText = (status: string) => {
  const textMap = {
    'active': '进行中',
    'completed': '已完成',
    'cancelled': '已取消',
    'draft': '草稿'
  }
  return textMap[status as keyof typeof textMap] || status
}

const formatDate = (date: string) => {
  if (!date) return ''
  try {
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return date
  }
}
</script>

<style lang="scss" scoped>
.activity-list-result {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
}

.result-header {
  padding: var(--spacing-md);
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

.activity-cards {
  padding: var(--spacing-sm);
  max-height: 400px;
  overflow-y: auto;
}

.activity-card {
  display: flex;
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
    border-color: #f093fb;
    box-shadow: 0 2px var(--spacing-xs) rgba(240, 147, 251, 0.1);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.activity-image {
  width: 60px;
  height: 60px;
  border-radius: var(--spacing-sm);
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 2var(--spacing-xs);
  }

  .activity-status {
    position: absolute;
    top: var(--spacing-xs);
    right: var(--spacing-xs);
    font-size: 10px;
    padding: 2px var(--spacing-xs);
    border-radius: var(--spacing-xs);
    font-weight: 600;

    &.status-active {
      background: #dcfce7;
      color: #166534;
    }

    &.status-completed {
      background: #dbeafe;
      color: #1e40af;
    }

    &.status-cancelled {
      background: #fee2e2;
      color: #991b1b;
    }

    &.status-draft {
      background: #f3f4f6;
      color: #374151;
    }
  }
}

.activity-info {
  flex: 1;
  min-width: 0;

  .activity-title {
    font-size: 1var(--spacing-xs);
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 6px;
    line-height: 1.3;
  }

  .activity-details {
    margin-bottom: 6px;

    .detail-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 3px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: 1var(--border-width-base);
      color: #6b7280;

      .detail-icon {
        font-size: 10px;
      }
    }
  }

  .activity-description {
    font-size: 1var(--border-width-base);
    color: #9ca3af;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.activity-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  align-items: center;

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
      background: #f093fb;
      color: white;

      &:hover {
        background: #e879f9;
      }
    }

    &.success {
      background: #10b981;
      color: white;

      &:hover {
        background: #059669;
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