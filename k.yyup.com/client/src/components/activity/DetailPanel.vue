<template>
  <div class="detail-panel" v-if="item">
    <!-- 标题区域 -->
    <div class="panel-header">
      <div class="header-icon">
        <UnifiedIcon :name="convertIconName(item.icon)" :size="32" />
      </div>
      <div class="header-content">
        <h2 class="panel-title">{{ item.title }}</h2>
        <p class="panel-description">{{ item.description }}</p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div
        v-for="(value, key) in item.stats"
        :key="key"
        class="stat-card"
      >
        <div class="stat-icon">
          <UnifiedIcon :name="convertIconName(getStatIcon(key))" :size="24" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatStatValue(value, key) }}</div>
          <div class="stat-label">{{ formatStatLabel(key) }}</div>
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h3 class="section-title">快捷操作</h3>
      <div class="actions-grid">
        <div
          v-for="action in item.actions"
          :key="action.key"
          class="action-item"
          :class="[`action-item--${action.type || 'default'}`]"
          @click="handleAction(action.key)"
        >
          <div class="action-icon-wrapper">
            <UnifiedIcon :name="convertIconName(getActionIcon(action.key))" :size="20" />
          </div>
          <div class="action-info">
            <span class="action-label">{{ action.label }}</span>
          </div>
          <div class="action-arrow">
            <UnifiedIcon name="arrow-right" :size="14" />
          </div>
        </div>
      </div>
    </div>

    <!-- 功能详情 -->
    <div class="feature-details">
      <h3 class="section-title">功能详情</h3>
      <div class="feature-list">
        <div
          v-for="feature in getFeatures(item.id)"
          :key="feature.title"
          class="feature-item"
        >
          <div class="feature-icon">
            <UnifiedIcon :name="feature.icon" :size="24" />
          </div>
          <div class="feature-content">
            <h4>{{ feature.title }}</h4>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="detail-panel-empty" v-else>
    <el-empty description="请选择一个流程查看详情" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

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

// 图标名称转换函数 - 将Lucide图标名称转换为UnifiedIcon支持的名称
const convertIconName = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    // LucideIcon -> UnifiedIcon 映射
    'Calendar': 'calendar',
    'FileText': 'book',
    'Image': 'activity',
    'Send': 'message',
    'Users': 'users',
    'Eye': 'view',
    'Share2': 'users',
    'CheckCircle': 'check',
    'Star': 'activity',
    'Award': 'activity',
    'TrendingUp': 'trend-charts',
    'BarChart': 'analytics',
    'Plus': 'plus',
    'Sparkles': 'activity',
    'Palette': 'edit',
    'DollarSign': 'analytics',
    'FileCode': 'edit',
    'DocumentCopy': 'copy',
    'Settings': 'settings',
    'Bell': 'message',
    'Edit': 'edit',
    'FileQuestion': 'help',
    'MessageSquare': 'message',
    'Download': 'download',
    'ArrowRight': 'arrow-right',
    'Home': 'home',
    'Dashboard': 'dashboard',
    'Phone': 'phone',
    'Mail': 'message',
    'User': 'user',
    'Search': 'search',
    'Menu': 'menu',
    'X': 'close',
    'Check': 'check',
    'Minus': 'delete',
    'ChevronDown': 'chevron-down',
    'ChevronUp': 'chevron-up',
    'ChevronLeft': 'chevron-left',
    'ChevronRight': 'chevron-right',
    // 🔧 新增：活动状态图标映射
    'Clock': 'clock',                // 进行中
    'XCircle': 'close'               // 已取消
  }
  return iconMap[iconName] || 'grid'
}

// 获取统计图标
const getStatIcon = (key: string) => {
  const iconMap: Record<string, string> = {
    totalActivities: 'Calendar',
    totalTemplates: 'FileText',
    totalPosters: 'Image',
    publishedActivities: 'Send',
    ongoingActivities: 'Clock',        // 🔧 新增：进行中活动图标
    completedActivities: 'CheckCircle', // 🔧 新增：已完成活动图标
    cancelledActivities: 'XCircle',     // 🔧 新增：已取消活动图标
    participationRate: 'TrendingUp',    // 🔧 新增：参与率图标
    totalRegistrations: 'Users',
    totalViews: 'Eye',
    totalShares: 'Share2',
    checkedIn: 'CheckCircle',
    totalEvaluations: 'Star',
    averageRating: 'Award',
    averageROI: 'TrendingUp'
  }
  return iconMap[key] || 'BarChart'
}

// 获取操作图标
const getActionIcon = (key: string) => {
  const iconMap: Record<string, string> = {
    'create-activity': 'Plus',
    'view-templates': 'FileText',
    'ai-planning': 'Sparkles',
    'design-poster': 'Palette',
    'config-marketing': 'DollarSign',
    'preview': 'Eye',
    'generate-page': 'FileCode',
    'view-qrcode': 'DocumentCopy',
    'share': 'Share2',
    'publish': 'Send',
    'set-channels': 'Settings',
    'view-stats': 'BarChart',
    'approve-registrations': 'CheckCircle',
    'export-list': 'Download',
    'send-notification': 'Bell',
    'checkin': 'DocumentCopy',
    'manual-checkin': 'Edit',
    'view-participants': 'Users',
    'create-survey': 'FileQuestion',
    'view-feedback': 'MessageSquare',
    'analyze-satisfaction': 'TrendingUp',
    'generate-report': 'FileText',
    'view-analytics': 'BarChart',
    'export-data': 'Download'
  }
  return iconMap[key] || 'ArrowRight'
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
    cancelledActivities: '已取消',       // 🔧 新增：已取消标签
    participationRate: '参与率',          // 🔧 新增：参与率标签
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
      { icon: 'file', title: '模板选择', description: '从活动模板库中选择合适的模板快速创建活动' },
      { icon: 'edit', title: '基本信息', description: '填写活动标题、时间、地点、人数等基本信息' },
      { icon: 'check', title: '目标设定', description: '设置活动类型和预期目标' }
    ],
    'content-creation': [
      { icon: 'activity', title: '海报设计', description: '选择模板、编辑海报、AI生成海报' },
      { icon: 'marketing', title: '营销配置', description: '设置团购、积攒、优惠券、推荐奖励' },
      { icon: 'view', title: '预览效果', description: '实时预览海报和营销配置效果' }
    ],
    'page-generation': [
      { icon: 'phone', title: '页面生成', description: '生成活动报名页面（H5/小程序）' },
      { icon: 'link', title: '链接管理', description: '生成分享链接和二维码' },
      { icon: 'activity', title: '营销展示', description: '团购倒计时、积攒进度条、优惠券领取' }
    ],
    'activity-publish': [
      { icon: 'send', title: '渠道发布', description: '发布到微信、网站、小程序等渠道' },
      { icon: 'edit', title: '分享设置', description: '设置分享文案和图片' },
      { icon: 'analytics', title: '推广管理', description: '查看浏览量、分享次数、转化率' }
    ],
    'registration-management': [
      { icon: 'check', title: '报名审核', description: '审核报名信息，批量处理' },
      { icon: 'trend-charts', title: '报名统计', description: '统计报名人数、团购、积攒数据' },
      { icon: 'file', title: '名单管理', description: '导出名单、打印签到表' }
    ],
    'activity-execution': [
      { icon: 'qr-code', title: '签到管理', description: '扫码签到、手动签到' },
      { icon: 'users', title: '现场管理', description: '实时人数、活动进度、突发事件处理' },
      { icon: 'photo', title: '参与统计', description: '参与度分析、现场照片、现场反馈' }
    ],
    'activity-evaluation': [
      { icon: 'file', title: '满意度调查', description: '问卷设计、发放、结果统计' },
      { icon: 'message', title: '反馈收集', description: '文字反馈、图片反馈、建议收集' },
      { icon: 'analytics', title: '评价分析', description: '评分统计、评论分析、改进建议' }
    ],
    'effect-analysis': [
      { icon: 'trend-charts', title: '数据分析', description: '参与度、转化率、营销效果分析' },
      { icon: 'finance', title: 'ROI计算', description: '成本统计、收益统计、投资回报率' },
      { icon: 'document', title: '报告生成', description: '活动总结报告、数据可视化、报告导出' }
    ]
  }
  return featuresMap[id] || []
}

// 处理操作
const handleAction = (actionKey: string) => {
  emit('action', actionKey)
  ElMessage.info(`执行操作: ${actionKey}`)
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.detail-panel {
  height: 100%;
  overflow-y: auto;
  padding: var(--spacing-xl); /* ✨ 优化：减小内边距 */
  background: linear-gradient(to bottom, var(--bg-card) 0%, var(--bg-page) 100%);
}

.panel-header {
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl); /* ✨ 优化：减小间距 */
  padding: var(--spacing-xl);
  background: var(--bg-tertiary);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);

  .header-icon {
    flex-shrink: 0;
    width: 72px;
    height: 72px;
    border-radius: var(--radius-lg);
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-on-primary);
    box-shadow: var(--glow-primary);

    // 确保图标不被拉伸
    :deep(svg) {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
    }
  }

  .header-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .panel-title {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs) 0;
      letter-spacing: -0.5px;
    }

    .panel-description {
      font-size: var(--text-base);
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.5;
    }
  }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);

  .stat-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color-light);
    transition: all var(--transition-normal) ease;
    box-shadow: var(--shadow-sm);

    &:hover {
      border-color: var(--primary-color);
      box-shadow: var(--shadow-md);
      transform: translateY(-4px);
      background: var(--bg-hover);
    }

    .stat-icon {
      flex-shrink: 0;
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: var(--primary-light-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
      transition: transform var(--transition-normal) ease;

      // 确保图标不被拉伸
      :deep(svg) {
        width: 22px;
        height: 22px;
        flex-shrink: 0;
      }
    }

    &:hover .stat-icon {
      transform: scale(1.1) rotate(-5deg);
    }

    .stat-content {
      flex: 1;
      display: flex;
      flex-direction: column;

      .stat-value {
        font-size: var(--text-xl);
        font-weight: var(--font-bold);
        color: var(--text-primary);
        line-height: 1.2;
      }

      .stat-label {
        font-size: var(--text-xs);
        color: var(--text-muted);
        margin-top: 2px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
  }
}

.section-title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-lg) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  &::before {
    content: '';
    width: 4px;
    height: 18px;
    background: var(--primary-color);
    border-radius: var(--radius-full);
  }
}

.quick-actions {
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-xl);
  background: var(--bg-tertiary);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--spacing-lg);

    .action-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color-light);
      cursor: pointer;
      transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
        border-color: var(--primary-color);

        .action-icon-wrapper {
          transform: scale(1.1) rotate(-5deg);
        }

        .action-arrow {
          transform: translateX(4px);
          opacity: 1;
        }
      }

      .action-icon-wrapper {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-secondary);
        color: var(--primary-color);
        transition: all var(--transition-normal);
        flex-shrink: 0;

        :deep(svg) {
          width: 20px;
          height: 20px;
        }
      }

      .action-info {
        flex: 1;
        min-width: 0;

        .action-label {
          font-size: var(--text-base);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .action-arrow {
        color: var(--text-muted);
        opacity: 0.5;
        transition: all var(--transition-normal);
        flex-shrink: 0;
      }

      // 不同类型的配色方案
      &--primary {
        &:hover {
          background: linear-gradient(135deg, var(--bg-card) 0%, var(--primary-light-bg) 100%);
          border-color: var(--primary-color);
        }
        .action-icon-wrapper {
          background: var(--primary-light-bg);
          color: var(--primary-color);
        }
      }

      &--success {
        &:hover {
          background: linear-gradient(135deg, var(--bg-card) 0%, var(--success-light-bg) 100%);
          border-color: var(--success-color);
        }
        .action-icon-wrapper {
          background: var(--success-light-bg);
          color: var(--success-color);
        }
      }

      &--warning {
        &:hover {
          background: linear-gradient(135deg, var(--bg-card) 0%, var(--warning-light-bg) 100%);
          border-color: var(--warning-color);
        }
        .action-icon-wrapper {
          background: var(--warning-light-bg);
          color: var(--warning-color);
        }
      }

      &--danger {
        &:hover {
          background: linear-gradient(135deg, var(--bg-card) 0%, var(--danger-light-bg) 100%);
          border-color: var(--danger-color);
        }
        .action-icon-wrapper {
          background: var(--danger-light-bg);
          color: var(--danger-color);
        }
      }

      &--info, &--default {
        &:hover {
          background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
          border-color: var(--text-muted);
        }
        .action-icon-wrapper {
          background: var(--bg-secondary);
          color: var(--text-secondary);
        }
      }
    }
  }
}

.feature-details {
  .feature-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-lg);

    .feature-item {
      display: flex;
      gap: var(--spacing-lg);
      padding: var(--spacing-xl);
      background: var(--bg-card);
      border-radius: var(--radius-xl);
      border: 1px solid var(--border-color-light);
      transition: all var(--transition-normal) ease;

      &:hover {
        border-color: var(--primary-color);
        box-shadow: var(--shadow-md);
        transform: scale(1.02);
      }

      .feature-icon {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        border-radius: var(--radius-lg);
        background: var(--bg-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-color);
        transition: all var(--transition-normal);

        // 确保图标不被拉伸
        :deep(svg) {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }
      }

      &:hover .feature-icon {
        background: var(--primary-color);
        color: white;
      }

      .feature-content {
        flex: 1;

        h4 {
          font-size: var(--text-lg);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          margin: 0 0 var(--spacing-xs) 0;
        }

        p {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.6;
        }
      }
    }
  }
}

.detail-panel-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

