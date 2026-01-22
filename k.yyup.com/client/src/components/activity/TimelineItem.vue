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
      <UnifiedIcon :name="data.icon" :size="20" />
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
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

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
    ongoingActivities: '进行中',
    completedActivities: '已完成',
    cancelledActivities: '已取消',       // 🔧 新增
    participationRate: '参与率',          // 🔧 新增
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
@use '@/styles/design-tokens.scss' as *;

.timeline-item {
  position: relative;
  display: flex;
  gap: var(--spacing-lg); /* ✨ 优化：减小间距 */
  padding: var(--spacing-lg); /* ✨ 优化：减小内边距 */
  margin-bottom: var(--spacing-md);
  background: var(--bg-card);
  border-radius: var(--radius-xl); /* ✨ 优化：更大的圆角 */
  border: 1px solid var(--border-color-light); /* ✨ 优化：更浅的边框 */
  cursor: pointer;
  transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: var(--primary-color);
    box-shadow: var(--shadow-md);
    transform: translateX(var(--spacing-xs)) translateY(-2px);
    background: var(--bg-hover);
  }

  &.active {
    border-color: var(--primary-color);
    background: linear-gradient(135deg, var(--primary-light-bg) 0%, var(--bg-card) 100%);
    box-shadow: var(--shadow-lg), var(--glow-primary);
    transform: scale(1.02) translateX(var(--spacing-sm));
    z-index: 2;

    .timeline-dot {
      transform: scale(1.1);
      box-shadow: var(--glow-primary);
    }

    .timeline-title {
      color: var(--primary-color);
    }
  }

  &.completed .timeline-dot {
    background: var(--success-color);
    border-color: var(--success-color);
    color: white;
  }

  &.in-progress .timeline-dot {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
    animation: pulse 2s infinite;
  }

  &.pending .timeline-dot {
    background: var(--bg-tertiary);
    border-color: var(--border-color);
    color: var(--text-muted);
  }
}

.timeline-line {
  position: absolute;
  left: 31px; /* ✨ 优化：根据新的内边距和圆点大小调整位置 */
  top: 52px;
  bottom: -var(--spacing-lg);
  width: 2px;
  background: linear-gradient(180deg, var(--border-color) 0%, transparent 100%);
  opacity: 0.5;
}

.timeline-dot {
  flex-shrink: 0;
  width: 32px; /* ✨ 优化：稍微减小圆点大小 */
  height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-card);
  background: var(--bg-card);
  z-index: var(--z-dropdown);
  transition: all var(--transition-normal) ease;
  box-shadow: var(--shadow-sm);

  // 确保图标不被拉伸
  :deep(svg) {
    width: 16px; /* ✨ 优化：稍微减小图标大小 */
    height: 16px;
    flex-shrink: 0;
    transition: transform var(--transition-normal);
  }
}

.timeline-item:hover .timeline-dot :deep(svg) {
  transform: rotate(10deg) scale(1.1);
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 var(--glow-primary);
  }
  50% {
    box-shadow: 0 0 0 10px var(--glow-primary);
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
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border: var(--border-width-thin) solid;
  transition: var(--transition-slow);

  &--completed {
    background: var(--success-color);
    background: var(--success-color);
    color: var(--text-on-primary);
    border-color: var(--success-color);
  }

  &--in-progress {
    background: var(--primary-color);
    background: var(--primary-light-bg);
    color: var(--primary-color);
    border-color: var(--primary-color);
  }

  &--pending {
    background: var(--text-secondary);
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border-color: var(--border-color);
  }
}

.timeline-description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-md) 0;
}

.timeline-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);

  .progress-bar {
    flex: 1;
    height: var(--spacing-sm);
    background: var(--border-color);
    border-radius: var(--radius-sm);
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: var(--gradient-primary);
      border-radius: var(--radius-sm);
      transition: width 0.6s ease;
    }
  }

  .progress-text {
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    color: var(--primary-color);
    min-width: auto;
    text-align: right;
  }
}

.timeline-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-md);

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
      font-weight: var(--font-semibold);
      color: var(--text-primary);
    }
  }
}
</style>

