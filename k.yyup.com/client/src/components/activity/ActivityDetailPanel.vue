<template>
  <div class="detail-panel" v-if="item">
    <!-- 标题区域 -->
    <div class="panel-header">
      <div class="header-icon">
        <UnifiedIcon :name="item.icon" :size="32" />
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
          <UnifiedIcon :name="getStatIcon(key)" :size="24" />
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
        <el-button
          v-for="action in item.actions"
          :key="action.key"
          :type="action.type as any"
          size="large"
          @click="handleAction(action.key)"
        >
          <UnifiedIcon :name="getActionIcon(action.key)" :size="18" />
          {{ action.label }}
        </el-button>
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
          <div class="feature-icon">{{ feature.icon }}</div>
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

// 获取统计图标
const getStatIcon = (key: string) => {
  const iconMap: Record<string, string> = {
    totalActivities: 'Calendar',
    totalTemplates: 'FileText',
    totalPosters: 'Image',
    publishedActivities: 'Send',
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

// 获取功能列表
const getFeatures = (id: string) => {
  const featuresMap: Record<string, Array<{ icon: string; title: string; description: string }>> = {
    'activity-planning': [
      { icon: '📋', title: '模板选择', description: '从活动模板库中选择合适的模板快速创建活动' },
      { icon: '✏️', title: '基本信息', description: '填写活动标题、时间、地点、人数等基本信息' },
      { icon: '🎯', title: '目标设定', description: '设置活动类型和预期目标' }
    ],
    'content-creation': [
      { icon: '🎨', title: '海报设计', description: '选择模板、编辑海报、AI生成海报' },
      { icon: '🛒', title: '营销配置', description: '设置团购、积攒、优惠券、推荐奖励' },
      { icon: '👁️', title: '预览效果', description: '实时预览海报和营销配置效果' }
    ],
    'page-generation': [
      { icon: '📱', title: '页面生成', description: '生成活动报名页面（H5/小程序）' },
      { icon: '🔗', title: '链接管理', description: '生成分享链接和二维码' },
      { icon: '💰', title: '营销展示', description: '团购倒计时、积攒进度条、优惠券领取' }
    ],
    'activity-publish': [
      { icon: '📢', title: '渠道发布', description: '发布到微信、网站、小程序等渠道' },
      { icon: '✍️', title: '分享设置', description: '设置分享文案和图片' },
      { icon: '📊', title: '推广管理', description: '查看浏览量、分享次数、转化率' }
    ],
    'registration-management': [
      { icon: '✅', title: '报名审核', description: '审核报名信息，批量处理' },
      { icon: '📈', title: '报名统计', description: '统计报名人数、团购、积攒数据' },
      { icon: '📋', title: '名单管理', description: '导出名单、打印签到表' }
    ],
    'activity-execution': [
      { icon: '📷', title: '签到管理', description: '扫码签到、手动签到' },
      { icon: '👥', title: '现场管理', description: '实时人数、活动进度、突发事件处理' },
      { icon: '📸', title: '参与统计', description: '参与度分析、现场照片、现场反馈' }
    ],
    'activity-evaluation': [
      { icon: '📝', title: '满意度调查', description: '问卷设计、发放、结果统计' },
      { icon: '💬', title: '反馈收集', description: '文字反馈、图片反馈、建议收集' },
      { icon: '📊', title: '评价分析', description: '评分统计、评论分析、改进建议' }
    ],
    'effect-analysis': [
      { icon: '📈', title: '数据分析', description: '参与度、转化率、营销效果分析' },
      { icon: '💰', title: 'ROI计算', description: '成本统计、收益统计、投资回报率' },
      { icon: '📄', title: '报告生成', description: '活动总结报告、数据可视化、报告导出' }
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
.detail-panel {
  height: 100%;
  overflow-y: auto;
  padding: var(--text-3xl);
}

.panel-header {
  display: flex;
  gap: var(--text-lg);
  margin-bottom: var(--spacing-3xl);
  padding-bottom: var(--text-3xl);
  border-bottom: var(--transform-drop) solid var(--border-color);

  .header-icon {
    flex-shrink: 0;
    width: var(--icon-size); height: var(--icon-size);
    border-radius: var(--text-lg);
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-on-primary);
  }

  .header-content {
    flex: 1;

    .panel-title {
      font-size: var(--text-3xl);
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm) 0;
    }

    .panel-description {
      font-size: var(--text-base);
      color: var(--text-secondary);
      margin: 0;
    }
  }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--text-lg);
  margin-bottom: var(--spacing-3xl);

  .stat-card {
    display: flex;
    gap: var(--text-sm);
    padding: var(--text-lg);
    background: var(--bg-color, var(--bg-white));
    border-radius: var(--text-sm);
    border: var(--border-width) solid var(--border-color);
    transition: all var(--transition-normal) ease;

    &:hover {
      border-color: var(--primary-color);
      box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
      transform: translateY(var(--transform-hover-lift));
    }

    .stat-icon {
      flex-shrink: 0;
      width: var(--icon-size); height: var(--icon-size);
      border-radius: var(--text-sm);
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.05) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
    }

    .stat-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .stat-value {
        font-size: var(--text-3xl);
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: var(--spacing-xs);
      }

      .stat-label {
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }
    }
  }
}

.section-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--text-lg) 0;
}

.quick-actions {
  margin-bottom: var(--spacing-3xl);

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--text-sm);

    .el-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
    }
  }
}

.feature-details {
  .feature-list {
    display: flex;
    flex-direction: column;
    gap: var(--text-lg);

    .feature-item {
      display: flex;
      gap: var(--text-lg);
      padding: var(--text-lg);
      background: var(--bg-color, var(--bg-white));
      border-radius: var(--text-sm);
      border: var(--border-width) solid var(--border-color);
      transition: all var(--transition-normal) ease;

      &:hover {
        border-color: var(--primary-color);
        box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
      }

      .feature-icon {
        flex-shrink: 0;
        font-size: var(--spacing-3xl);
      }

      .feature-content {
        flex: 1;

        h4 {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--spacing-sm) 0;
        }

        p {
          font-size: var(--text-base);
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

