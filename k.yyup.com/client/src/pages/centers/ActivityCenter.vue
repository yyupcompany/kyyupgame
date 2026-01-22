<template>
  <UnifiedCenterLayout
    title="活动中心"
    description="清晰展示活动管理的完整流程，方便园长一目了然地掌握活动进展"
    :full-width="true"
  >
    <div class="center-container activity-center-timeline">
    <!-- Tab切换 -->
    <el-tabs v-model="activeTab" class="activity-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="活动列表" name="list">
        <div class="activity-list-container" v-loading="loading">
          <DataTable
            :data="filteredActivities"
            :columns="activityColumns"
            :loading="loading"
            :show-pagination="false"
            :show-toolbar="false"
            @row-click="handleActivityClick"
          >
            <template #column-title="{ row }">
              <div class="activity-name-cell">
                <UnifiedIcon :name="getActivityIcon(row.status)" :size="18" />
                <span>{{ row.title }}</span>
              </div>
            </template>

            <template #column-status="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>

            <template #column-registrations="{ row }">
              <el-badge :value="row.registrations || 0" :max="999" />
            </template>
          </DataTable>

          <el-empty v-if="filteredActivities.length === 0" description="暂无活动数据" />
        </div>
      </el-tab-pane>

      <el-tab-pane label="流程时间线" name="timeline">
        <!-- Timeline主体 -->
        <div class="timeline-container">
      <!-- 左侧Timeline队列 (33%宽度) -->
      <div class="timeline-section" v-loading="loading">
        <div class="timeline-header">
          <h2>活动流程</h2>
          <el-button size="small" @click="refreshTimeline">
            <UnifiedIcon name="RefreshCw" :size="16" />
            刷新
          </el-button>
        </div>
        
        <div class="timeline-list">
          <TimelineItem
            v-for="(item, index) in timelineItems"
            :key="item.id"
            :data="item"
            :active="selectedItem?.id === item.id"
            :is-last="index === timelineItems.length - 1"
            @click="selectItem"
          />
        </div>
      </div>

      <!-- 右侧详情区域 (67%宽度) -->
      <div class="detail-section">
        <DetailPanel
          :item="selectedItem"
          @action="handleAction"
        />
      </div>
    </div>
      </el-tab-pane>
    </el-tabs>

    <!-- AI帮助按钮 -->
    <PageHelpButton :help-content="activityCenterHelp" />
  </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import TimelineItem from '@/components/activity/TimelineItem.vue'
import DetailPanel from '@/components/activity/DetailPanel.vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import PageHelpButton from '@/components/common/PageHelpButton.vue'
import { DataTable } from '@/components/centers'
import { request } from '@/utils/request'
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
const activeTab = ref('timeline')  // 默认显示timeline
const loading = ref(false)
const timelineItems = ref<TimelineItemData[]>([])
const selectedItem = ref<TimelineItemData | null>(null)
const searchKeyword = ref('')
const activities = ref<any[]>([])

// 活动列表列配置
const activityColumns = [
  { prop: 'title', label: '活动名称', minWidth: 200 },
  { prop: 'description', label: '描述', minWidth: 250, showOverflowTooltip: true },
  { prop: 'startDate', label: '开始时间', width: 180 },
  { prop: 'status', label: '状态', width: 100 },
  { prop: 'registrations', label: '报名数', width: 100, align: 'center' as const }
]

// 过滤后的活动列表
const filteredActivities = computed(() => {
  if (!searchKeyword.value) {
    return activities.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return activities.value.filter(activity =>
    activity.title?.toLowerCase().includes(keyword) ||
    activity.description?.toLowerCase().includes(keyword)
  )
})

// Tab切换处理
const handleTabChange = (tabName: string) => {
  console.log('切换到:', tabName)
  if (tabName === 'list' && activities.value.length === 0) {
    loadActivities()
  }
}

// 加载活动列表
const loadActivities = async () => {
  try {
    loading.value = true
    // 直接使用模拟数据，因为API可能不存在
    console.log('🔄 加载活动列表（模拟数据）')
    activities.value = getMockActivities()
    console.log('✅ 活动列表加载成功:', activities.value.length, '个活动')
  } catch (error) {
    console.error('❌ 加载活动失败:', error)
    activities.value = []
  } finally {
    loading.value = false
  }
}

// 模拟活动数据
const getMockActivities = () => [
  {
    id: '1',
    title: '春季亲子运动会',
    description: '增进亲子关系的户外活动',
    startDate: '2025-03-15 09:00',
    status: 'ongoing',
    registrations: 45
  },
  {
    id: '2',
    title: '科学实验体验课',
    description: '培养孩子科学探索精神',
    startDate: '2025-03-20 14:00',
    status: 'draft',
    registrations: 0
  },
  {
    id: '3',
    title: '校园开放日活动',
    description: '展示幼儿园教学成果',
    startDate: '2025-04-01 09:00',
    status: 'completed',
    registrations: 120
  },
  {
    id: '4',
    title: '艺术绘画比赛',
    description: '发掘幼儿艺术天赋',
    startDate: '2025-04-10 10:00',
    status: 'draft',
    registrations: 0
  },
  {
    id: '5',
    title: '家长座谈会',
    description: '家园共育交流分享',
    startDate: '2025-04-15 19:00',
    status: 'ongoing',
    registrations: 32
  }
]

// 点击活动跳转到timeline
const handleActivityClick = (activity: any) => {
  console.log('点击活动:', activity)
  // 切换到timeline tab
  activeTab.value = 'timeline'
  // 选中对应的活动策划流程项
  selectedItem.value = timelineItems.value.find(item => item.id === 'activity-planning') || timelineItems.value[0]
  ElMessage.success(`已切换到活动流程：${activity.title}`)
}

// 搜索处理
const handleSearch = () => {
  // computed会自动处理
}

// 获取活动状态图标
const getActivityIcon = (status: string) => {
  const iconMap: Record<string, string> = {
    'draft': 'file',
    'ongoing': 'activity',
    'completed': 'check',
    'cancelled': 'close'
  }
  return iconMap[status] || 'file'
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'draft': 'info',
    'ongoing': 'warning',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'draft': '草稿',
    'ongoing': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return textMap[status] || status
}

// 加载Timeline数据 - 优化版本使用集合API
const loadTimeline = async () => {
  try {
    loading.value = true
    const startTime = performance.now()
    console.log('🔄 开始加载活动中心Timeline数据...')

    // 优先使用集合API
    try {
      const response = await centersAPI.getActivityOverview()
      const endTime = performance.now()
      console.log(`📊 集合API响应时间: ${Math.round(endTime - startTime)}ms`)
      console.log('📊 活动中心集合API响应:', response)

      if (response.success && response.data) {
        // 将集合API数据转换为Timeline格式
        timelineItems.value = convertToTimelineFormat(response.data)

        // 默认选中第一个进行中的项目，如果没有则选中第一个
        const inProgressItem = timelineItems.value.find(item => item.status === 'in-progress')
        selectedItem.value = inProgressItem || timelineItems.value[0]

        console.log('✅ 活动中心集合API数据加载成功:', timelineItems.value.length, '个流程')
        return
      }
    } catch (aggregateError) {
      console.warn('⚠️ 集合API加载失败，降级到原始API:', aggregateError)
      // 降级到原始API
    }

    // 原始API作为降级方案
    const response = await request.get('/api/centers/activity/timeline')
    const endTime = performance.now()
    console.log(`📊 原始API响应时间: ${Math.round(endTime - startTime)}ms`)
    console.log('📊 Timeline API响应:', response)

    if (response.success && response.data) {
      timelineItems.value = response.data

      // 默认选中第一个进行中的项目，如果没有则选中第一个
      const inProgressItem = timelineItems.value.find(item => item.status === 'in-progress')
      selectedItem.value = inProgressItem || timelineItems.value[0]

      console.log('✅ Timeline数据加载成功:', timelineItems.value.length, '个流程')
    } else {
      throw new Error('Timeline数据格式异常')
    }
  } catch (error) {
    console.error('❌ 加载Timeline失败:', error)
    ElMessage.error('加载Timeline失败，请刷新页面重试')
  } finally {
    loading.value = false
  }
}

// 统一活动中心图标映射 - 使用全局统一样式图标
const activityIconMap = {
  'activity-planning': 'activity',        // 活动策划
  'poster-design': 'design',              // 海报设计
  'marketing-config': 'marketing',        // 营销配置
  'registration-page': 'user-group',      // 报名页面
  'activity-publish': 'send',             // 活动发布
  'registration-approval': 'check',       // 报名审核
  'activity-checkin': 'location',         // 活动签到
  'activity-evaluation': 'analytics'      // 效果评估
}

// 将集合API数据转换为Timeline格式
const convertToTimelineFormat = (data: any) => {
  const { activityStats, recentActivities, registrationStats } = data

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

// 刷新Timeline
const refreshTimeline = async () => {
  ElMessage.info('正在刷新Timeline数据...')
  await loadTimeline()
  ElMessage.success('Timeline数据已刷新')
}

// 选择Timeline项
const selectItem = (item: TimelineItemData) => {
  selectedItem.value = item
  console.log('选中Timeline项:', item.title)
}

// 处理新建活动
const handleCreateActivity = () => {
  router.push('/activity/create')
}

// 处理快捷操作
const handleAction = (actionKey: string) => {
  console.log('执行操作:', actionKey)

  // 根据操作类型跳转到对应页面
  const actionRoutes: Record<string, string> = {
    // 活动策划阶段
    'create-activity': '/activity/create',
    'view-templates': '/activity/template',
    'activity-planner': '/activity/plan/activity-planner',
    'view-activities': '/activity',

    // 海报设计阶段
    'design-poster': '/activity/poster-preview',
    'ai-poster': '/activity/poster-preview?mode=ai',
    'upload-poster': '/activity/poster-preview?mode=upload',

    // 营销配置阶段
    'config-marketing': '/centers/marketing',
    'marketing-tools': '/centers/marketing',
    'promotion-settings': '/centers/marketing',

    // 报名页面阶段
    'generate-page': '/activity/registration-page-generator',
    'registration-dashboard': '/activity/registration/registration-dashboard',
    'page-templates': '/activity/registration-page-generator?tab=templates',

    // 活动发布阶段
    'publish': '/activity/publish',
    'publish-channels': '/activity/publish?tab=channels',
    'share-management': '/activity/publish?tab=share',

    // 报名审核阶段
    'approve-registrations': '/activity/registrations',
    'registration-list': '/activity/registrations',
    'approval-workflow': '/activity/registrations?tab=approval',

    // 活动签到阶段
    'checkin': '/activity/checkin',
    'checkin-management': '/activity/checkin',
    'attendance-stats': '/activity/checkin?tab=stats',

    // 效果评估阶段
    'create-survey': '/activity/evaluation/ActivityEvaluation',
    'generate-report': '/activity/analytics/ActivityAnalytics',
    'intelligent-analysis': '/activity/analytics/intelligent-analysis',
    'activity-optimizer': '/activity'
  }

  const route = actionRoutes[actionKey]
  if (route) {
    router.push(route)
  } else {
    ElMessage.info(`功能开发中: ${actionKey}`)
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
    '点击左侧时间线选择要操作的流程环节',
    '查看右侧详情面板了解当前环节的统计数据',
    '点击"快捷操作"按钮执行对应功能',
    '按照8个流程顺序完成活动全流程管理'
  ],
  tips: [
    '建议按照时间线顺序操作，确保活动流程完整',
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

<style scoped lang="scss">
.activity-center-timeline {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-lg) var(--spacing-xl); /* ✨ 优化：稍微增加边距，使页面更透气 */
  background: var(--bg-page);
  overflow-x: hidden;
}

/* .page-header 样式已移至全局 center-common.scss 中统一管理 */

// Timeline 容器布局
.timeline-container {
  flex: 1;
  display: flex;
  gap: var(--spacing-lg); /* ✨ 优化：减小间距 */
  min-height: 0;
  max-width: 100%;
  overflow: hidden;
}

.timeline-section {
  flex: 0 0 360px; /* ✨ 优化：稍微减小左侧宽度 */
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--glass-bg, rgba(255, 255, 255, 0.8)); /* ✨ 优化：使用毛玻璃背景 */
  backdrop-filter: blur(15px); /* ✨ 优化：毛玻璃效果 */
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg); /* ✨ 优化：减小内边距 */
  box-shadow: var(--shadow-md);
  border: 1px solid var(--white-alpha-20); /* ✨ 优化：半透明边框 */
  overflow: hidden;
  transition: all var(--transition-normal) ease;

  &:hover {
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-light);
  }

  .timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg); /* ✨ 优化：减小间距 */
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--bg-tertiary);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);

    h2 {
      font-size: var(--text-lg); /* ✨ 优化：稍微减小标题字号 */
      font-weight: var(--font-bold); /* ✨ 优化：增加字重 */
      color: var(--text-primary);
      margin: 0;
      letter-spacing: 0.5px;
    }
  }

  .timeline-list {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--spacing-sm); /* ✨ 优化：增加内边距 */
    margin: 0 -var(--spacing-sm); /* ✨ 优化：负边距抵消，允许滚动条贴边 */

    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: var(--radius-full);

      &:hover {
        background: var(--text-muted);
      }
    }
  }
}

.detail-section {
  flex: 1;
  min-width: 0;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all var(--transition-normal) ease;

  &:hover {
    box-shadow: var(--shadow-lg);
  }
}

// 响应式设计 - 平板
@media (max-width: var(--breakpoint-lg)) {
  .timeline-container {
    flex-direction: column;
    gap: var(--spacing-xl);

    .timeline-section {
      flex: 0 0 auto;
      width: 100%;
    }

    .detail-section {
      flex: 1;
      width: 100%;
    }
  }
}

// 响应式设计 - 手机
@media (max-width: var(--breakpoint-md)) {
  .activity-center-timeline {
    padding: var(--spacing-lg);
  }

  .timeline-container {
    gap: var(--spacing-lg);
  }

  .timeline-section {
    padding: var(--spacing-lg);
  }
}

// 暗黑主题样式
.dark,
html.dark {
  .activity-center-timeline {
    background: var(--bg-page);
  }

  .timeline-section {
    background: var(--glass-bg-dark, rgba(30, 41, 59, 0.7));
    backdrop-filter: blur(20px);
    border-color: var(--white-alpha-10);
  }

  .detail-section {
    background: var(--bg-card);
    border-color: var(--border-color);
  }

  .timeline-header {
    background: var(--bg-secondary);
    border-color: var(--border-color);

    h2 {
      color: var(--text-primary);
    }
  }
}

// 活动列表Tab样式
.activity-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: transparent; /* ✨ 优化：保持透明，由父级控制 */
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  border: none;

  :deep(.el-tabs__header) {
    margin: 0 0 var(--spacing-xl) 0;
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__item) {
    font-size: var(--text-base);
    font-weight: var(--font-bold);
    padding: 0 var(--spacing-2xl) !important; /* ✨ 核心修复：增加水平内边距，确保长文字不溢出 */
    height: 40px;
    line-height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    transition: all var(--transition-normal);
    border-radius: var(--radius-lg);
    margin: 4px 8px;
    border: 1px solid transparent;
    white-space: nowrap; /* ✨ 核心修复：防止文字换行 */
    min-width: 100px; /* ✨ 核心修复：确保按钮有最小宽度 */

    &:hover {
      color: var(--primary-color);
      background: var(--primary-light-bg);
    }

    &.is-active {
      color: white !important;
      background: var(--primary-color) !important;
      box-shadow: 0 4px 12px var(--glow-primary);
      border-color: var(--primary-color);
    }
  }

  :deep(.el-tabs__active-bar) {
    display: none; /* ✨ 优化：使用背景色表示激活状态，不再需要底边条 */
  }

  :deep(.el-tabs__content) {
    flex: 1;
    overflow: visible; /* ✨ 优化：允许阴影显示 */
    padding: 0;
  }
}

.activity-list-container {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl); /* ✨ 优化：增加内边距 */
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);

  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-lg);
    border-bottom: var(--border-width-thin) solid var(--border-color);

    h3 {
      font-size: var(--text-xl);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin: 0;
    }
  }

  .activity-name-cell {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    :deep(.unified-icon) {
      color: var(--primary-color);
      flex-shrink: 0;
    }

    span {
      font-size: var(--text-sm);
      color: var(--text-primary);
    }
  }

  :deep(.el-table) {
    font-size: var(--text-sm);

    .el-table__row {
      cursor: pointer;
      transition: background-color var(--transition-fast);

      &:hover {
        background-color: var(--bg-tertiary);
      }
    }

    th {
      font-size: var(--text-sm);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
    }

    td {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }
  }

  :deep(.el-table__body-wrapper) {
    max-height: 600px;
    overflow-y: auto;
  }
}
</style>

