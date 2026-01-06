<template>
  <div 
    class="timeline-item"
    :class="{
      'active': active,
      'completed': data.status === 'completed',
      'in-progress': data.status === 'in-progress',
      'pending': data.status === 'pending'
    }"
    @click="$emit('click', data)"
  >
    <!-- Timeline连接线 -->
    <div class="timeline-line" v-if="!isLast"></div>
    
    <!-- Timeline节点 -->
    <div class="timeline-dot">
      <LucideIcon :name="data.icon" :size="20" />
    </div>
    
    <!-- Timeline内容 -->
    <div class="timeline-content">
      <div class="timeline-header">
        <h3 class="timeline-title">{{ data.title }}</h3>
        <span
          class="status-badge"
          :class="`status-badge--${data.status}`"
        >
          {{ getStatusText(data.status) }}
        </span>
      </div>
      
      <p class="timeline-description">{{ data.description }}</p>
      
      <!-- 进度条 -->
      <div class="timeline-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: data.progress + '%' }"
          ></div>
        </div>
        <span class="progress-text">{{ data.progress }}%</span>
      </div>
      
      <!-- 统计数据 -->
      <div class="timeline-stats" v-if="data.stats">
        <div
          v-for="(value, key) in data.stats"
          :key="key"
          class="stat-item"
        >
          <span class="stat-label">{{ formatStatLabel(key) }}</span>
          <span class="stat-value">{{ formatStatValue(value, key) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LucideIcon from '@/components/icons/LucideIcon.vue'

interface TimelineItemData {
  id: string
  title: string
  description: string
  icon: string
  status: 'completed' | 'in-progress' | 'pending'
  progress: number
  stats: Record<string, any>
  actions: Array<{
    key: string
    label: string
    type: string
  }>
}

interface Props {
  data: TimelineItemData
  active?: boolean
  isLast?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  isLast: false
})

defineEmits<{
  click: [data: TimelineItemData]
}>()

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    'completed': 'success',
    'in-progress': 'primary',
    'pending': 'info'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'completed': '已完成',
    'in-progress': '进行中',
    'pending': '待开始'
  }
  return textMap[status] || '未知'
}

// 格式化统计标签
const formatStatLabel = (key: string) => {
  const labelMap: Record<string, string> = {
    totalActivities: '总活动数',
    totalTemplates: '模板总数',
    usedTemplates: '已使用模板',
    draftActivities: '草稿活动',
    totalPosters: '海报总数',
    activitiesWithMarketing: '营销活动',
    publishedActivities: '已发布',
    generatedPages: '已生成页面',
    activePages: '活跃页面',
    totalViews: '总浏览量',
    totalRegistrations: '总报名数',
    channels: '发布渠道',
    totalShares: '总分享次数',
    approvedRegistrations: '已审核',
    pendingRegistrations: '待审核',
    conversionRate: '转化率',
    checkedIn: '已签到',
    totalParticipants: '总参与人数',
    ongoingActivities: '进行中',
    completedActivities: '已完成',
    totalEvaluations: '总评价数',
    averageRating: '平均评分',
    evaluationRate: '评价率',
    analyzedActivities: '已分析',
    averageROI: '平均ROI',
    generatedReports: '已生成报告'
  }
  return labelMap[key] || key
}

// 格式化统计值
const formatStatValue = (value: any, key?: string) => {
  if (typeof value === 'number') {
    // 确保数值不为负数
    let safeValue = Math.max(0, value)

    // 如果是百分比字段，限制在0-100之间
    const percentageFields = ['evaluationRate', 'conversionRate']
    if (key && percentageFields.includes(key)) {
      safeValue = Math.min(100, Math.max(0, value))
      return safeValue.toFixed(0) + '%'
    }

    // 万位格式化
    if (safeValue >= 10000) {
      return (safeValue / 10000).toFixed(1) + '万'
    }

    return safeValue.toLocaleString()
  }
  return value
}
</script>

<style scoped lang="scss">
.timeline-item {
  position: relative;
  display: flex;
  gap: var(--text-2xl);
  padding: var(--text-2xl);
  margin-bottom: var(--text-lg);
  background: var(--bg-color, var(--bg-white));
  border-radius: var(--text-sm);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--primary-color);
    box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
    transform: translateX(var(--spacing-xs));
  }

  &.active {
    border-color: var(--primary-color);
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(64, 158, 255, 0.02) 100%);
    box-shadow: 0 var(--spacing-xs) var(--text-lg) rgba(64, 158, 255, 0.2);
  }

  &.completed .timeline-dot {
    background: var(--success-color);
    border-color: var(--success-color);
  }

  &.in-progress .timeline-dot {
    background: var(--primary-color);
    border-color: var(--primary-color);
    animation: pulse 2s infinite;
  }

  &.pending .timeline-dot {
    background: var(--info-color);
    border-color: var(--info-color);
  }
}

.timeline-line {
  position: absolute;
  left: 39px;
  top: 60px;
  bottom: -var(--text-lg);
  width: 2px;
  background: linear-gradient(180deg, var(--border-color) 0%, transparent 100%);
}

.timeline-dot {
  flex-shrink: 0;
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid;
  background: white;
  z-index: 1;
  transition: all 0.3s ease;

  :deep(svg) {
    color: white;
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
  }
}

.timeline-content {
  flex: 1;
  min-width: 0;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.timeline-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--text-sm);
  border-radius: var(--text-sm);
  font-size: var(--text-sm);
  font-weight: 500;
  border: var(--border-width-base) solid;
  transition: all 0.3s ease;

  &--completed {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.12) 100%);
    color: #059669;
    border-color: rgba(16, 185, 129, 0.25);
  }

  &--in-progress {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%);
    color: var(--primary-color);
    border-color: rgba(99, 102, 241, 0.25);
  }

  &--pending {
    background: linear-gradient(135deg, rgba(107, 114, 128, 0.12) 0%, rgba(75, 85, 99, 0.12) 100%);
    color: var(--text-secondary);
    border-color: rgba(107, 114, 128, 0.25);
  }
}

.timeline-description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin: 0 0 var(--text-sm) 0;
}

.timeline-progress {
  display: flex;
  align-items: center;
  gap: var(--text-sm);
  margin-bottom: var(--text-lg);

  .progress-bar {
    flex: 1;
    height: var(--spacing-sm);
    background: var(--border-color);
    border-radius: var(--spacing-xs);
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-hover) 100%);
      border-radius: var(--spacing-xs);
      transition: width 0.6s ease;
    }
  }

  .progress-text {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--primary-color);
    min-width: 45px;
    text-align: right;
  }
}

.timeline-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--text-sm);

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);

    .stat-label {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .stat-value {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
    }
  }
}
</style>

