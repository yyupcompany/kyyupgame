<template>
  <div
    class="mobile-timeline-item"
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
      <van-icon :name="data.icon" :size="18" />
    </div>

    <!-- Timeline内容 -->
    <div class="timeline-content">
      <div class="timeline-header">
        <h4 class="timeline-title">{{ data.title }}</h4>
        <van-tag
          :type="getStatusType(data.status)"
          size="small"
        >
          {{ getStatusText(data.status) }}
        </van-tag>
      </div>

      <p class="timeline-description">{{ data.description }}</p>

      <!-- 进度条 -->
      <div class="timeline-progress" v-if="data.progress > 0">
        <div class="progress-info">
          <span class="progress-label">进度</span>
          <span class="progress-text">{{ data.progress }}%</span>
        </div>
        <van-progress
          :percentage="data.progress"
          :show-pivot="false"
          stroke-width="6"
          color="#1989fa"
          track-color="#f5f5f5"
        />
      </div>

      <!-- 统计数据 -->
      <div class="timeline-stats" v-if="data.stats && Object.keys(data.stats).length > 0">
        <div
          v-for="(value, key) in getDisplayStats(data.stats)"
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
    'pending': 'default'
  }
  return typeMap[status] || 'default'
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

// 获取显示的统计数据（只显示前3个重要数据）
const getDisplayStats = (stats: Record<string, any>) => {
  const statOrder = [
    'totalActivities', 'publishedActivities', 'ongoingActivities',
    'totalRegistrations', 'approvedRegistrations', 'pendingRegistrations',
    'completedActivities', 'averageRating'
  ]

  const orderedStats: Record<string, any> = {}
  let count = 0

  // 按优先级添加统计数据
  for (const key of statOrder) {
    if (stats[key] !== undefined && count < 3) {
      orderedStats[key] = stats[key]
      count++
    }
  }

  // 如果优先级数据不足3个，添加其他数据
  for (const [key, value] of Object.entries(stats)) {
    if (!orderedStats[key] && count < 3) {
      orderedStats[key] = value
      count++
    }
  }

  return orderedStats
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
@import '@/styles/mobile-base.scss';

.mobile-timeline-item {
  position: relative;
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  margin-bottom: 8px;
  background: var(--card-bg);
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--van-primary-color);
    box-shadow: 0 2px 8px rgba(25, 137, 239, 0.2);
    transform: translateX(2px);
  }

  &.active {
    border-color: var(--van-primary-color);
    background: linear-gradient(135deg, rgba(25, 137, 239, 0.05) 0%, rgba(25, 137, 239, 0.02) 100%);
    box-shadow: 0 2px 8px rgba(25, 137, 239, 0.2);
  }

  &.completed .timeline-dot {
    background: var(--van-success-color);
    border-color: var(--van-success-color);
  }

  &.in-progress .timeline-dot {
    background: var(--van-primary-color);
    border-color: var(--van-primary-color);
    animation: pulse 2s infinite;
  }

  &.pending .timeline-dot {
    background: var(--van-gray-5);
    border-color: var(--van-gray-5);
  }
}

.timeline-line {
  position: absolute;
  left: 35px;
  top: 50px;
  bottom: -8px;
  width: 2px;
  background: linear-gradient(180deg, var(--van-border-color) 0%, transparent 100%);
}

.timeline-dot {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid;
  background: var(--card-bg);
  z-index: 2;
  transition: all 0.3s ease;

  :deep(.van-icon) {
    color: white;
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(25, 137, 239, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(25, 137, 239, 0);
  }
}

.timeline-content {
  flex: 1;
  min-width: 0;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;

  .timeline-title {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--van-text-color);
    margin: 0;
    line-height: 1.3;
    flex: 1;
    margin-right: 8px;
  }
}

.timeline-description {
  font-size: var(--text-sm);
  color: var(--van-text-color-2);
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.timeline-progress {
  margin-bottom: 12px;

  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;

    .progress-label {
      font-size: var(--text-xs);
      color: var(--van-text-color-2);
    }

    .progress-text {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--van-primary-color);
    }
  }
}

.timeline-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 60px;

    .stat-label {
      font-size: 11px;
      color: var(--van-text-color-2);
    }

    .stat-value {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--van-text-color);
    }
  }
}

// 深色模式适配
:root[data-theme="dark"] {
  .mobile-timeline-item {
    background: var(--van-background-color-dark);

    &:hover {
      border-color: var(--van-primary-color);
      box-shadow: 0 2px 8px rgba(25, 137, 239, 0.3);
    }

    &.active {
      background: linear-gradient(135deg, rgba(25, 137, 239, 0.1) 0%, rgba(25, 137, 239, 0.05) 100%);
    }
  }

  .timeline-dot {
    background: var(--van-background-color-dark);
  }

  .timeline-description {
    color: var(--van-text-color-3);
  }

  .timeline-stats .stat-item .stat-label {
    color: var(--van-text-color-3);
  }
}
</style>