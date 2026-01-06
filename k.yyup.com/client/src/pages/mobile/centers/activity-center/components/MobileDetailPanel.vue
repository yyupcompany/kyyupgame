<template>
  <div class="mobile-detail-panel" v-if="item">
    <!-- 标题区域 -->
    <div class="panel-header">
      <div class="header-icon">
        <van-icon :name="item.icon" :size="24" />
      </div>
      <div class="header-content">
        <h3 class="panel-title">{{ item.title }}</h3>
        <p class="panel-description">{{ item.description }}</p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards" v-if="item.stats && Object.keys(item.stats).length > 0">
      <div
        v-for="(value, key) in getDisplayStats(item.stats)"
        :key="key"
        class="stat-card"
      >
        <div class="stat-icon">
          <van-icon :name="getStatIcon(key)" :size="20" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatStatValue(value, key) }}</div>
          <div class="stat-label">{{ formatStatLabel(key) }}</div>
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h4 class="section-title">快捷操作</h4>
      <div class="actions-grid">
        <van-button
          v-for="action in item.actions"
          :key="action.key"
          :type="getButtonType(action.type)"
          size="small"
          block
          @click="handleAction(action.key)"
        >
          <van-icon :name="getActionIcon(action.key)" :size="16" />
          {{ action.label }}
        </van-button>
      </div>
    </div>

    <!-- 功能详情 -->
    <div class="feature-details" v-if="getFeatures(item.id).length > 0">
      <h4 class="section-title">功能详情</h4>
      <van-collapse v-model="activeNames" accordion>
        <van-collapse-item
          v-for="feature in getFeatures(item.id)"
          :key="feature.title"
          :title="feature.title"
          :name="feature.title"
        >
          <div class="feature-content">
            <div class="feature-icon">{{ feature.icon }}</div>
            <p>{{ feature.description }}</p>
          </div>
        </van-collapse-item>
      </van-collapse>
    </div>

    <!-- 进度展示 -->
    <div class="progress-section" v-if="item.progress > 0">
      <h4 class="section-title">完成进度</h4>
      <div class="progress-circle">
        <van-circle
          :current-rate="item.progress"
          :rate="100"
          :speed="100"
          :text="item.progress + '%'"
          :stroke-width="60"
          size="120px"
          color="#1989fa"
          layer-color="#f5f5f5"
        />
      </div>
      <div class="progress-status">
        <van-tag :type="getStatusType(item.status)" size="large">
          {{ getStatusText(item.status) }}
        </van-tag>
      </div>
    </div>
  </div>
  <div class="detail-panel-empty" v-else>
    <van-empty description="请选择一个流程查看详情" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'

interface TimelineItem {
  id: string
  title: string
  description: string
  icon: string
  status: string
  progress: number
  stats: Record<string, any>
  actions: Array<{
    key: string
    label: string
    type: string
  }>
}

interface Props {
  item: TimelineItem | null
}

defineProps<Props>()

const emit = defineEmits<{
  action: [actionKey: string]
}>()

const activeNames = ref<string[]>([])

// 获取按钮类型
const getButtonType = (type: string) => {
  const typeMap: Record<string, string> = {
    'primary': 'primary',
    'success': 'success',
    'default': 'default',
    'warning': 'warning',
    'danger': 'danger'
  }
  return typeMap[type] || 'default'
}

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

// 获取显示的统计数据（只显示前4个重要数据）
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
    if (stats[key] !== undefined && count < 4) {
      orderedStats[key] = stats[key]
      count++
    }
  }

  // 如果优先级数据不足4个，添加其他数据
  for (const [key, value] of Object.entries(stats)) {
    if (!orderedStats[key] && count < 4) {
      orderedStats[key] = value
      count++
    }
  }

  return orderedStats
}

// 获取统计图标
const getStatIcon = (key: string) => {
  const iconMap: Record<string, string> = {
    totalActivities: 'calendar-o',
    totalTemplates: 'records',
    totalPosters: 'photo-o',
    publishedActivities: 'send',
    totalRegistrations: 'friends-o',
    totalViews: 'eye-o',
    totalShares: 'share-o',
    checkedIn: 'passed',
    totalEvaluations: 'star-o',
    averageRating: 'good-job-o',
    averageROI: 'chart-trending-o',
    approvedRegistrations: 'success',
    pendingRegistrations: 'clock-o',
    ongoingActivities: 'play',
    completedActivities: 'success',
    conversionRate: 'chart-trending-o'
  }
  return iconMap[key] || 'bar-chart-o'
}

// 获取操作图标
const getActionIcon = (key: string) => {
  const iconMap: Record<string, string> = {
    'create-activity': 'plus',
    'view-templates': 'records',
    'ai-planning': 'bulb-o',
    'design-poster': 'photo-o',
    'config-marketing': 'market-o',
    'preview': 'eye-o',
    'generate-page': 'newspaper-o',
    'view-qrcode': 'qr',
    'share': 'share-o',
    'publish': 'send',
    'set-channels': 'setting-o',
    'view-stats': 'chart-trending-o',
    'approve-registrations': 'success',
    'export-list': 'down',
    'send-notification': 'volume-o',
    'checkin': 'records',
    'manual-checkin': 'edit',
    'view-participants': 'friends-o',
    'create-survey': 'question',
    'view-feedback': 'chat-o',
    'analyze-satisfaction': 'chart-trending-o',
    'generate-report': 'newspaper-o',
    'view-analytics': 'bar-chart-o',
    'export-data': 'down'
  }
  return iconMap[key] || 'arrow'
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

// 获取功能列表
const getFeatures = (id: string) => {
  const featuresMap: Record<string, Array<{ icon: string; title: string; description: string }>> = {
    'activity-planning': [
      { icon: '📋', title: '模板选择', description: '从活动模板库中选择合适的模板快速创建活动' },
      { icon: '✏️', title: '基本信息', description: '填写活动标题、时间、地点、人数等基本信息' },
      { icon: '🎯', title: '目标设定', description: '设置活动类型和预期目标' }
    ],
    'poster-design': [
      { icon: '🎨', title: '模板设计', description: '选择海报模板、编辑文字、调整布局' },
      { icon: '🤖', title: 'AI生成', description: '使用AI智能生成个性化海报设计' },
      { icon: '📤', title: '批量制作', description: '支持批量制作多个活动海报' }
    ],
    'marketing-config': [
      { icon: '🛒', title: '团购设置', description: '设置团购价格、人数限制、时间限制' },
      { icon: '👍', title: '积攒活动', description: '配置积攒人数、奖励机制' },
      { icon: '🎫', title: '优惠券', description: '创建优惠券、设置使用条件' }
    ],
    'registration-page': [
      { icon: '📱', title: '页面生成', description: '生成活动报名页面（H5/小程序）' },
      { icon: '🔗', title: '链接管理', description: '生成分享链接和二维码' },
      { icon: '💰', title: '营销展示', description: '团购倒计时、积攒进度条、优惠券领取' }
    ],
    'activity-publish': [
      { icon: '📢', title: '渠道发布', description: '发布到微信、网站、小程序等渠道' },
      { icon: '✍️', title: '分享设置', description: '设置分享文案和图片' },
      { icon: '📊', title: '推广管理', description: '查看浏览量、分享次数、转化率' }
    ],
    'registration-approval': [
      { icon: '✅', title: '报名审核', description: '审核报名信息，批量处理' },
      { icon: '📈', title: '报名统计', description: '统计报名人数、团购、积攒数据' },
      { icon: '📋', title: '名单管理', description: '导出名单、打印签到表' }
    ],
    'activity-checkin': [
      { icon: '📷', title: '扫码签到', description: '扫码二维码快速签到' },
      { icon: '✋', title: '手动签到', description: '手动输入信息进行签到' },
      { icon: '📊', title: '签到统计', description: '实时统计签到人数和签到率' }
    ],
    'activity-evaluation': [
      { icon: '📝', title: '满意度调查', description: '问卷设计、发放、结果统计' },
      { icon: '💬', title: '反馈收集', description: '文字反馈、图片反馈、建议收集' },
      { icon: '📈', title: '效果分析', description: '评分统计、评论分析、改进建议' }
    ]
  }
  return featuresMap[id] || []
}

// 处理操作
const handleAction = (actionKey: string) => {
  emit('action', actionKey)
  showToast(`执行操作: ${actionKey}`)
}
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-detail-panel {
  padding: var(--spacing-md);
  background: var(--card-bg);
}

.panel-header {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--van-border-color);

  .header-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--van-primary-color) 0%, #1677ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .header-content {
    flex: 1;

    .panel-title {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--van-text-color);
      margin: 0 0 4px 0;
      line-height: 1.3;
    }

    .panel-description {
      font-size: var(--text-sm);
      color: var(--van-text-color-2);
      margin: 0;
      line-height: 1.4;
    }
  }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: 20px;

  .stat-card {
    display: flex;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: var(--van-gray-1);
    border-radius: 8px;
    border: 1px solid var(--van-border-color);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
    }

    .stat-icon {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: linear-gradient(135deg, rgba(25, 137, 239, 0.1) 0%, rgba(25, 137, 239, 0.05) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--van-primary-color);
    }

    .stat-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .stat-value {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--van-text-color);
        margin-bottom: 2px;
      }

      .stat-label {
        font-size: 11px;
        color: var(--van-text-color-2);
      }
    }
  }
}

.section-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--van-text-color);
  margin: 0 0 12px 0;
}

.quick-actions {
  margin-bottom: 20px;

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);

    .van-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-xs);
      height: 40px;
      font-size: var(--text-sm);
    }
  }
}

.feature-details {
  margin-bottom: 20px;

  :deep(.van-collapse-item__content) {
    padding: var(--spacing-md) 16px;
  }

  .feature-content {
    display: flex;
    gap: var(--spacing-sm);
    align-items: flex-start;

    .feature-icon {
      flex-shrink: 0;
      font-size: var(--text-base);
    }

    p {
      flex: 1;
      margin: 0;
      font-size: var(--text-sm);
      color: var(--van-text-color-2);
      line-height: 1.5;
    }
  }
}

.progress-section {
  text-align: center;

  .progress-circle {
    margin-bottom: 12px;
  }

  .progress-status {
    .van-tag {
      font-size: var(--text-sm);
      padding: var(--spacing-sm) 16px;
    }
  }
}

.detail-panel-empty {
  padding: 60px 20px;
  text-align: center;
}

// 深色模式适配
:root[data-theme="dark"] {
  .mobile-detail-panel {
    background: var(--van-background-color-dark);
  }

  .panel-header {
    border-bottom-color: var(--van-border-color-dark);

    .header-content {
      .panel-title {
        color: var(--van-text-color-dark);
      }

      .panel-description {
        color: var(--van-text-color-3);
      }
    }
  }

  .stats-cards .stat-card {
    background: var(--van-gray-8);
    border-color: var(--van-border-color-dark);

    .stat-content {
      .stat-value {
        color: var(--van-text-color-dark);
      }

      .stat-label {
        color: var(--van-text-color-3);
      }
    }
  }

  .section-title {
    color: var(--van-text-color-dark);
  }

  .feature-details .feature-content p {
    color: var(--van-text-color-3);
  }
}
</style>