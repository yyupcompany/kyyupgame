<template>
  <MobileMainLayout
    title="活动中心"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <!-- 头部操作区域 -->
    <template #header-extra>
      <van-icon name="plus" size="20" @click="handleCreateActivity" />
    </template>

    <div class="mobile-activity-center">
      <!-- 活动流程卡片 -->
      <div class="flow-card">
        <div class="card-header">
          <h3>活动流程</h3>
          <van-button
            size="small"
            type="primary"
            plain
            @click="refreshTimeline"
            :loading="loading"
          >
            <van-icon name="replay" size="16" />
            刷新
          </van-button>
        </div>

        <!-- Timeline流程列表 -->
        <div class="timeline-list">
          <MobileTimelineItem
            v-for="(item, index) in timelineItems"
            :key="item.id"
            :data="item"
            :active="selectedItem?.id === item.id"
            :is-last="index === timelineItems.length - 1"
            @click="selectItem"
          />
        </div>
      </div>

      <!-- 详情面板 -->
      <div class="detail-card" v-if="selectedItem">
        <MobileDetailPanel
          :item="selectedItem"
          @action="handleAction"
        />
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-else>
        <van-empty description="请选择一个流程查看详情" />
      </div>

      <!-- AI帮助按钮 -->
      <van-floating-bubble
        icon="question"
        magnetic="x"
        @click="showHelp = true"
      />
    </div>

    <!-- AI帮助弹窗 -->
    <van-popup
      v-model:show="showHelp"
      position="bottom"
      :style="{ height: '80%' }"
      round
      closeable
    >
      <div class="help-content">
        <div class="help-header">
          <h3>活动中心使用指南</h3>
          <p>{{ activityCenterHelp.description }}</p>
        </div>

        <van-tabs v-model:active="helpTab">
          <van-tab title="功能特色">
            <div class="feature-list">
              <div
                v-for="(feature, index) in activityCenterHelp.features"
                :key="index"
                class="feature-item"
              >
                <van-icon name="star" color="#ffd21e" />
                <span>{{ feature }}</span>
              </div>
            </div>
          </van-tab>

          <van-tab title="使用步骤">
            <div class="steps-list">
              <van-steps direction="vertical" :active="0">
                <van-step
                  v-for="(step, index) in activityCenterHelp.steps"
                  :key="index"
                >
                  {{ step }}
                </van-step>
              </van-steps>
            </div>
          </van-tab>

          <van-tab title="使用技巧">
            <div class="tips-list">
              <div
                v-for="(tip, index) in activityCenterHelp.tips"
                :key="index"
                class="tip-item"
              >
                <van-icon name="lightbulb" color="#ff6b35" />
                <span>{{ tip }}</span>
              </div>
            </div>
          </van-tab>
        </van-tabs>
      </div>
    </van-popup>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import MobileTimelineItem from './components/MobileTimelineItem.vue'
import MobileDetailPanel from './components/MobileDetailPanel.vue'
import { centersAPI } from '@/api/modules/centers'

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

const router = useRouter()

// 响应式数据
const loading = ref(false)
const timelineItems = ref<TimelineItemData[]>([])
const selectedItem = ref<TimelineItemData | null>(null)
const showHelp = ref(false)
const helpTab = ref(0)

// 统一活动中心图标映射
const activityIconMap = {
  'activity-planning': 'calendar-o',        // 活动策划
  'poster-design': 'photo-o',              // 海报设计
  'marketing-config': 'market-o',          // 营销配置
  'registration-page': 'friends-o',        // 报名页面
  'activity-publish': 'send',             // 活动发布
  'registration-approval': 'checked',     // 报名审核
  'activity-checkin': 'location-o',        // 活动签到
  'activity-evaluation': 'chart-trending-o' // 效果评估
}

// 加载Timeline数据
const loadTimeline = async () => {
  try {
    loading.value = true
    const startTime = performance.now()
    console.log('🔄 开始加载移动端活动中心数据...')

    // 优先使用集合API
    try {
      const response = await centersAPI.getActivityOverview()
      const endTime = performance.now()
      console.log(`📊 移动端集合API响应时间: ${Math.round(endTime - startTime)}ms`)

      if (response.success && response.data) {
        // 将集合API数据转换为Timeline格式
        timelineItems.value = convertToTimelineFormat(response.data)

        // 默认选中第一个进行中的项目
        const inProgressItem = timelineItems.value.find(item => item.status === 'in-progress')
        selectedItem.value = inProgressItem || timelineItems.value[0]

        console.log('✅ 移动端活动中心数据加载成功:', timelineItems.value.length, '个流程')
        return
      }
    } catch (aggregateError) {
      console.warn('⚠️ 集合API加载失败，使用模拟数据:', aggregateError)
    }

    // 使用模拟数据作为降级方案
    timelineItems.value = getMockTimelineData()
    const inProgressItem = timelineItems.value.find(item => item.status === 'in-progress')
    selectedItem.value = inProgressItem || timelineItems.value[0]

  } catch (error) {
    console.error('❌ 加载Timeline失败:', error)
    showToast('加载数据失败，请刷新重试')
  } finally {
    loading.value = false
  }
}

// 将集合API数据转换为Timeline格式
const convertToTimelineFormat = (data: any) => {
  const { activityStats, registrationStats } = data

  return [
    {
      id: 'activity-planning',
      title: '活动策划',
      description: `共${activityStats.totalActivities}个活动，${activityStats.publishedActivities}个已发布`,
      icon: activityIconMap['activity-planning'],
      status: activityStats.publishedActivities > 0 ? 'completed' : 'in-progress',
      progress: Math.round((activityStats.publishedActivities / Math.max(activityStats.totalActivities, 1)) * 100),
      stats: {
        totalActivities: activityStats.totalActivities,
        publishedActivities: activityStats.publishedActivities,
        ongoingActivities: activityStats.ongoingActivities
      },
      actions: [
        { key: 'create-activity', label: '创建活动', type: 'primary' },
        { key: 'view-templates', label: '查看模板', type: 'default' },
        { key: 'activity-planner', label: '活动策划', type: 'success' }
      ]
    },
    {
      id: 'poster-design',
      title: '海报设计',
      description: '为活动设计宣传海报',
      icon: activityIconMap['poster-design'],
      status: 'pending',
      progress: 0,
      stats: {},
      actions: [
        { key: 'design-poster', label: '设计海报', type: 'primary' },
        { key: 'ai-poster', label: 'AI生成', type: 'success' },
        { key: 'upload-poster', label: '上传海报', type: 'default' }
      ]
    },
    {
      id: 'marketing-config',
      title: '营销配置',
      description: '设置活动推广策略',
      icon: activityIconMap['marketing-config'],
      status: 'pending',
      progress: 0,
      stats: {},
      actions: [
        { key: 'config-marketing', label: '营销配置', type: 'primary' },
        { key: 'marketing-tools', label: '营销工具', type: 'default' }
      ]
    },
    {
      id: 'registration-page',
      title: '报名页面',
      description: `总报名${registrationStats.totalRegistrations}人`,
      icon: activityIconMap['registration-page'],
      status: registrationStats.totalRegistrations > 0 ? 'completed' : 'pending',
      progress: Math.round((registrationStats.approvedRegistrations / Math.max(registrationStats.totalRegistrations, 1)) * 100),
      stats: registrationStats,
      actions: [
        { key: 'generate-page', label: '生成页面', type: 'primary' },
        { key: 'registration-dashboard', label: '报名管理', type: 'default' },
        { key: 'page-templates', label: '页面模板', type: 'success' }
      ]
    },
    {
      id: 'activity-publish',
      title: '活动发布',
      description: `${activityStats.ongoingActivities}个活动进行中`,
      icon: activityIconMap['activity-publish'],
      status: activityStats.ongoingActivities > 0 ? 'in-progress' : 'pending',
      progress: 60,
      stats: activityStats,
      actions: [
        { key: 'publish', label: '发布活动', type: 'primary' },
        { key: 'publish-channels', label: '发布渠道', type: 'default' },
        { key: 'share-management', label: '分享管理', type: 'success' }
      ]
    },
    {
      id: 'registration-approval',
      title: '报名审核',
      description: `${registrationStats.pendingRegistrations}人待审核`,
      icon: activityIconMap['registration-approval'],
      status: registrationStats.pendingRegistrations > 0 ? 'in-progress' : 'completed',
      progress: Math.round((registrationStats.approvedRegistrations / Math.max(registrationStats.totalRegistrations, 1)) * 100),
      stats: registrationStats,
      actions: [
        { key: 'approve-registrations', label: '审核报名', type: 'primary' },
        { key: 'registration-list', label: '报名列表', type: 'default' },
        { key: 'approval-workflow', label: '审核流程', type: 'success' }
      ]
    },
    {
      id: 'activity-checkin',
      title: '活动签到',
      description: '活动现场签到管理',
      icon: activityIconMap['activity-checkin'],
      status: 'pending',
      progress: 0,
      stats: {},
      actions: [
        { key: 'checkin', label: '活动签到', type: 'primary' },
        { key: 'checkin-management', label: '签到管理', type: 'default' },
        { key: 'attendance-stats', label: '签到统计', type: 'success' }
      ]
    },
    {
      id: 'activity-evaluation',
      title: '效果评估',
      description: '活动效果分析和评估',
      icon: activityIconMap['activity-evaluation'],
      status: 'pending',
      progress: 0,
      stats: {},
      actions: [
        { key: 'create-survey', label: '创建调研', type: 'primary' },
        { key: 'generate-report', label: '生成报告', type: 'default' },
        { key: 'intelligent-analysis', label: '智能分析', type: 'success' }
      ]
    }
  ]
}

// 模拟数据
const getMockTimelineData = (): TimelineItemData[] => {
  return [
    {
      id: 'activity-planning',
      title: '活动策划',
      description: '共12个活动，8个已发布',
      icon: 'calendar-o',
      status: 'completed',
      progress: 75,
      stats: {
        totalActivities: 12,
        publishedActivities: 8,
        ongoingActivities: 3
      },
      actions: [
        { key: 'create-activity', label: '创建活动', type: 'primary' },
        { key: 'view-templates', label: '查看模板', type: 'default' }
      ]
    },
    {
      id: 'poster-design',
      title: '海报设计',
      description: '为活动设计宣传海报',
      icon: 'photo-o',
      status: 'pending',
      progress: 0,
      stats: {},
      actions: [
        { key: 'design-poster', label: '设计海报', type: 'primary' },
        { key: 'ai-poster', label: 'AI生成', type: 'success' }
      ]
    },
    {
      id: 'registration-page',
      title: '报名页面',
      description: '总报名156人',
      icon: 'friends-o',
      status: 'in-progress',
      progress: 65,
      stats: {
        totalRegistrations: 156,
        pendingRegistrations: 23,
        approvedRegistrations: 101
      },
      actions: [
        { key: 'generate-page', label: '生成页面', type: 'primary' },
        { key: 'registration-dashboard', label: '报名管理', type: 'default' }
      ]
    }
  ]
}

// 刷新Timeline
const refreshTimeline = async () => {
  showToast('正在刷新数据...')
  await loadTimeline()
  showToast('数据已刷新')
}

// 选择Timeline项
const selectItem = (item: TimelineItemData) => {
  selectedItem.value = item
  console.log('选中Timeline项:', item.title)
}

// 处理新建活动
const handleCreateActivity = () => {
  router.push('/mobile/activity/create')
}

// 处理快捷操作
const handleAction = (actionKey: string) => {
  console.log('执行操作:', actionKey)

  // 根据操作类型跳转到对应页面
  const actionRoutes: Record<string, string> = {
    'create-activity': '/mobile/activity/create',
    'view-templates': '/mobile/activity/templates',
    'activity-planner': '/mobile/activity/create',
    'design-poster': '/mobile/activity/poster-design',
    'ai-poster': '/mobile/activity/poster-design?mode=ai',
    'upload-poster': '/mobile/activity/poster-design?mode=upload',
    'config-marketing': '/mobile/marketing/config',
    'marketing-tools': '/mobile/marketing/tools',
    'generate-page': '/mobile/activity/registration-page',
    'registration-dashboard': '/mobile/activity/registrations',
    'page-templates': '/mobile/activity/registration-page?tab=templates',
    'publish': '/mobile/activity/publish',
    'publish-channels': '/mobile/activity/publish?tab=channels',
    'share-management': '/mobile/activity/publish?tab=share',
    'approve-registrations': '/mobile/activity/registrations',
    'registration-list': '/mobile/activity/registrations',
    'approval-workflow': '/mobile/activity/registrations?tab=approval',
    'checkin': '/mobile/activity/checkin',
    'checkin-management': '/mobile/activity/checkin',
    'attendance-stats': '/mobile/activity/checkin?tab=stats',
    'create-survey': '/mobile/activity/evaluation',
    'generate-report': '/mobile/activity/analytics',
    'intelligent-analysis': '/mobile/activity/analytics?tab=ai'
  }

  const route = actionRoutes[actionKey]
  if (route) {
    router.push(route)
  } else {
    showToast(`功能开发中: ${actionKey}`)
  }
}

// AI帮助内容
const activityCenterHelp = {
  title: '活动中心使用指南',
  description: '活动中心是幼儿园活动管理的核心平台，帮助您从活动策划到效果分析的全流程管理。通过8个标准化流程，让活动组织更专业、更高效。',
  features: [
    '完整的活动生命周期管理（策划→执行→评价→分析）',
    'AI智能文案生成和海报设计',
    '一键生成报名页面和分享素材',
    '实时数据统计和效果分析',
    '多渠道发布和推广管理'
  ],
  steps: [
    '点击流程卡片选择要操作的环节',
    '查看详情面板了解当前环节的统计数据',
    '点击"快捷操作"按钮执行对应功能',
    '按照8个流程顺序完成活动全流程管理'
  ],
  tips: [
    '建议按照流程顺序操作，确保活动流程完整',
    'AI文案和海报会自动包含幼儿园基础信息',
    '海报支持"上传"和"AI生成"两种方式',
    '营销配置可以设置团购、积攒、优惠券等功能',
    '报名页面会自动包含活动信息和幼儿园联系方式'
  ]
}

// 组件挂载时加载数据
onMounted(() => {
  loadTimeline()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.mobile-activity-center {
  padding: var(--spacing-md);
  background: var(--van-background-color-light);
  min-height: 100vh;
}

.flow-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--van-border-color);

    h3 {
      margin: 0;
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
    }
  }

  .timeline-list {
    padding: var(--spacing-sm);
    max-height: 400px;
    overflow-y: auto;
  }
}

.detail-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.empty-state {
  background: white;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.help-content {
  padding: var(--spacing-lg);
  height: 100%;
  overflow-y: auto;

  .help-header {
    margin-bottom: 20px;
    text-align: center;

    h3 {
      margin: 0 0 8px 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--van-text-color);
    }

    p {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--van-text-color-2);
      line-height: 1.5;
    }
  }

  .feature-list,
  .tips-list {
    .feature-item,
    .tip-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) 0;
      border-bottom: 1px solid var(--van-border-color);

      &:last-child {
        border-bottom: none;
      }

      span {
        flex: 1;
        font-size: var(--text-sm);
        color: var(--van-text-color);
        line-height: 1.5;
      }
    }
  }

  .steps-list {
    padding: var(--spacing-md) 0;
  }
}

// 自定义滚动条样式
.timeline-list::-webkit-scrollbar {
  width: 4px;
}

.timeline-list::-webkit-scrollbar-thumb {
  background: var(--van-border-color);
  border-radius: 2px;

  &:hover {
    background: var(--van-text-color-3);
  }
}

// 深色模式适配
:root[data-theme="dark"] {
  .mobile-activity-center {
    background: var(--van-background-color-dark);
  }

  .flow-card,
  .detail-card,
  .empty-state {
    background: var(--van-background-color-dark);
    border-color: var(--van-border-color-dark);
  }

  .flow-card .card-header {
    border-bottom-color: var(--van-border-color-dark);

    h3 {
      color: var(--van-text-color-dark);
    }
  }

  .help-content .help-header {
    h3 {
      color: var(--van-text-color-dark);
    }

    p {
      color: var(--van-text-color-3);
    }
  }

  .feature-list,
  .tips-list {
    .feature-item,
    .tip-item {
      border-bottom-color: var(--van-border-color-dark);

      span {
        color: var(--van-text-color-dark);
      }
    }
  }
}
</style>
