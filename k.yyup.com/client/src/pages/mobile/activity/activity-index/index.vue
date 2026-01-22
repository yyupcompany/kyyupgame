<template>
  <MobileCenterLayout title="活动中心" back-path="/mobile/centers">
    <template #right>
      <van-icon name="plus" size="20" @click="handleCreate" />
    </template>

    <div class="activity-center-mobile">
      <!-- 顶部Tab切换：列表 / 流程Timeline -->
      <van-tabs v-model:active="mainTab" sticky offset-top="46" line-width="60">
        <van-tab title="活动列表" name="list">
          <!-- 搜索栏 -->
          <van-search
            v-model="searchKeyword"
            placeholder="搜索活动"
            shape="round"
            @search="onSearch"
          />

          <!-- 统计卡片 -->
          <div class="stats-section">
            <van-grid :column-num="4" :gutter="8">
              <van-grid-item v-for="stat in statsData" :key="stat.key">
                <div class="stat-content">
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </van-grid-item>
            </van-grid>
          </div>

          <!-- 活动状态筛选 -->
          <van-tabs v-model:active="statusTab" class="status-tabs" @change="onStatusChange">
            <van-tab title="全部" name="all" />
            <van-tab title="进行中" name="ongoing" />
            <van-tab title="即将开始" name="upcoming" />
            <van-tab title="已结束" name="ended" />
          </van-tabs>

          <!-- 活动列表 -->
          <div class="activity-list">
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
              <van-list
                v-model:loading="loading"
                :finished="finished"
                finished-text="没有更多了"
                @load="onLoad"
              >
                <div v-if="activities.length === 0 && !loading" class="empty-state">
                  <van-empty description="暂无活动" />
                </div>
                <div
                  v-for="item in activities"
                  :key="item.id"
                  class="activity-card"
                  @click="viewActivityTimeline(item)"
                >
                  <div class="card-header">
                    <div class="card-title">{{ item.name }}</div>
                    <van-tag :type="getStatusType(item.status)" size="medium">
                      {{ getStatusLabel(item.status) }}
                    </van-tag>
                  </div>
                  <div class="card-content">
                    <div class="card-meta">
                      <div class="meta-item">
                        <van-icon name="clock-o" size="14" />
                        <span>{{ formatDate(item.startDate) }}</span>
                      </div>
                      <div class="meta-item">
                        <van-icon name="location-o" size="14" />
                        <span>{{ item.location || '待定' }}</span>
                      </div>
                    </div>
                    <div class="card-footer">
                      <div class="participants">
                        <van-icon name="friends-o" size="14" />
                        <span>{{ item.participantCount || 0 }}/{{ item.maxParticipants || '不限' }}人</span>
                      </div>
                      <van-button size="mini" type="primary" plain @click.stop="handleRegister(item)">
                        报名
                      </van-button>
                    </div>
                  </div>
                </div>
              </van-list>
            </van-pull-refresh>
          </div>
        </van-tab>

        <van-tab title="流程管理" name="timeline">
          <!-- 流程Timeline（8步骤） -->
          <div class="timeline-section">
            <div class="timeline-header">
              <h3>活动流程</h3>
              <van-button size="small" plain @click="refreshTimeline">
                <van-icon name="replay" /> 刷新
              </van-button>
            </div>

            <!-- 8步流程Timeline -->
            <div class="timeline-list">
              <div
                v-for="(item, index) in timelineItems"
                :key="item.id"
                class="timeline-item"
                :class="{
                  'active': selectedTimeline?.id === item.id,
                  'completed': item.status === 'completed',
                  'in-progress': item.status === 'in-progress',
                  'pending': item.status === 'pending'
                }"
                @click="selectTimelineItem(item)"
              >
                <!-- 连接线 -->
                <div class="timeline-line" v-if="index < timelineItems.length - 1"></div>
                
                <!-- 节点 -->
                <div class="timeline-node">
                  <van-icon :name="item.icon" size="18" />
                </div>
                
                <!-- 内容 -->
                <div class="timeline-content">
                  <div class="timeline-title-row">
                    <span class="timeline-title">{{ item.title }}</span>
                    <van-tag
                      :type="getTimelineStatusType(item.status)"
                      size="medium"
                    >
                      {{ getTimelineStatusText(item.status) }}
                    </van-tag>
                  </div>
                  <p class="timeline-desc">{{ item.description }}</p>
                  
                  <!-- 进度条 -->
                  <van-progress
                    :percentage="item.progress"
                    :stroke-width="6"
                    :show-pivot="false"
                    class="timeline-progress"
                  />
                  <span class="progress-text">{{ item.progress }}%</span>
                  
                  <!-- 统计数据 -->
                  <div class="timeline-stats" v-if="item.stats && Object.keys(item.stats).length">
                    <div
                      v-for="(value, key) in item.stats"
                      :key="key"
                      class="stat-item"
                    >
                      <span class="stat-label">{{ formatStatLabel(key) }}</span>
                      <span class="stat-value">{{ formatStatValue(value) }}</span>
                    </div>
                  </div>

                  <!-- 快捷操作 -->
                  <div class="timeline-actions" v-if="item.actions && item.actions.length">
                    <van-button
                      v-for="action in item.actions.slice(0, 3)"
                      :key="action.key"
                      size="small"
                      :type="action.type === 'primary' ? 'primary' : 'default'"
                      :plain="action.type !== 'primary'"
                      @click.stop="handleTimelineAction(item, action)"
                    >
                      {{ action.label }}
                    </van-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import type { TagType } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'
import { centersAPI } from '@/api/modules/centers'

const router = useRouter()

// Tab状态
const mainTab = ref('timeline')  // 默认显示timeline，与PC端保持一致
const statusTab = ref('all')
const searchKeyword = ref('')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 统计数据
const statsData = reactive([
  { key: 'total', label: '全部活动', value: 0 },
  { key: 'ongoing', label: '进行中', value: 0 },
  { key: 'upcoming', label: '即将开始', value: 0 },
  { key: 'ended', label: '已结束', value: 0 }
])

// 活动列表
const activities = ref<any[]>([])

// Timeline数据结构
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

// Timeline项
const timelineItems = ref<TimelineItemData[]>([])
const selectedTimeline = ref<TimelineItemData | null>(null)

// 8步流程图标映射（与PC端一致）
const activityIconMap: Record<string, string> = {
  'activity-planning': 'edit',           // 活动策划
  'poster-design': 'photo-o',            // 海报设计
  'marketing-config': 'fire-o',          // 营销配置
  'registration-page': 'friends-o',      // 报名页面
  'activity-publish': 'share-o',         // 活动发布
  'registration-approval': 'passed',     // 报名审核
  'activity-checkin': 'location-o',      // 活动签到
  'activity-evaluation': 'chart-trending-o'  // 效果评估
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

// 获取状态类型
const getStatusType = (status: string): TagType => {
  const types: Record<string, TagType> = {
    ongoing: 'success',
    upcoming: 'primary',
    ended: 'default',
    cancelled: 'danger'
  }
  return types[status] || 'default'
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ongoing: '进行中',
    upcoming: '即将开始',
    ended: '已结束',
    cancelled: '已取消'
  }
  return labels[status] || status
}

// Timeline状态类型
const getTimelineStatusType = (status: string): TagType => {
  const types: Record<string, TagType> = {
    completed: 'success',
    'in-progress': 'primary',
    pending: 'default'
  }
  return types[status] || 'default'
}

// Timeline状态文本
const getTimelineStatusText = (status: string) => {
  const texts: Record<string, string> = {
    completed: '已完成',
    'in-progress': '进行中',
    pending: '待开始'
  }
  return texts[status] || status
}

// 格式化统计标签
const formatStatLabel = (key: string) => {
  const labelMap: Record<string, string> = {
    totalActivities: '总活动数',
    publishedActivities: '已发布',
    ongoingActivities: '进行中',
    totalRegistrations: '总报名数',
    pendingRegistrations: '待审核',
    approvedRegistrations: '已审核'
  }
  return labelMap[key] || key
}

// 格式化统计值
const formatStatValue = (value: any) => {
  if (typeof value === 'number') {
    if (value >= 10000) {
      return (value / 10000).toFixed(1) + '万'
    }
    return value.toLocaleString()
  }
  return value
}

// 搜索
const onSearch = () => {
  activities.value = []
  finished.value = false
  onLoad()
}

// 状态切换
const onStatusChange = () => {
  activities.value = []
  finished.value = false
  onLoad()
}

// 下拉刷新
const onRefresh = async () => {
  activities.value = []
  finished.value = false
  await onLoad()
  refreshing.value = false
}

// 加载活动列表
const onLoad = async () => {
  loading.value = true
  try {
    // 模拟数据
    setTimeout(() => {
      const newActivities = [
        {
          id: '1',
          name: '春季亲子运动会',
          startDate: '2025-03-15',
          location: '运动场',
          status: 'ongoing',
          participantCount: 45,
          maxParticipants: 80
        },
        {
          id: '2',
          name: '科学实验体验课',
          startDate: '2025-03-20',
          location: '科学教室',
          status: 'upcoming',
          participantCount: 28,
          maxParticipants: 40
        },
        {
          id: '3',
          name: '校园开放日活动',
          startDate: '2025-04-01',
          location: '校园',
          status: 'upcoming',
          participantCount: 120,
          maxParticipants: 200
        }
      ]
      activities.value.push(...newActivities)
      statsData[0].value = 3
      statsData[1].value = 1
      statsData[2].value = 2
      statsData[3].value = 0
      loading.value = false
      finished.value = true
    }, 500)
  } catch (error) {
    console.error('加载活动失败:', error)
    loading.value = false
  }
}

// 加载Timeline数据
const loadTimeline = async () => {
  try {
    // 尝试从API获取
    const response = await centersAPI.getActivityOverview()
    if (response.success && response.data) {
      timelineItems.value = convertToTimelineFormat(response.data)
    } else {
      // 使用默认数据
      timelineItems.value = getDefaultTimelineItems()
    }
    // 默认选中第一个进行中的项目
    const inProgressItem = timelineItems.value.find(item => item.status === 'in-progress')
    selectedTimeline.value = inProgressItem || timelineItems.value[0]
  } catch (error) {
    console.error('加载Timeline失败:', error)
    timelineItems.value = getDefaultTimelineItems()
    selectedTimeline.value = timelineItems.value[0]
  }
}

// 转换API数据为Timeline格式（与PC端一致）
const convertToTimelineFormat = (data: any): TimelineItemData[] => {
  const { activityStats, registrationStats } = data
  return [
    {
      id: 'activity-planning',
      title: '活动策划',
      description: `共${activityStats?.totalActivities || 0}个活动，${activityStats?.publishedActivities || 0}个已发布`,
      icon: activityIconMap['activity-planning'],
      status: (activityStats?.publishedActivities || 0) > 0 ? 'completed' : 'in-progress',
      progress: Math.round(((activityStats?.publishedActivities || 0) / Math.max(activityStats?.totalActivities || 1, 1)) * 100),
      stats: {
        totalActivities: activityStats?.totalActivities || 0,
        publishedActivities: activityStats?.publishedActivities || 0
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
      icon: activityIconMap['poster-design'],
      status: 'pending',
      progress: 0,
      stats: {},
      actions: [
        { key: 'design-poster', label: '设计海报', type: 'primary' },
        { key: 'ai-poster', label: 'AI生成', type: 'default' }
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
        { key: 'config-marketing', label: '营销配置', type: 'primary' }
      ]
    },
    {
      id: 'registration-page',
      title: '报名页面',
      description: `总报名${registrationStats?.totalRegistrations || 0}人`,
      icon: activityIconMap['registration-page'],
      status: (registrationStats?.totalRegistrations || 0) > 0 ? 'completed' : 'pending',
      progress: Math.round(((registrationStats?.approvedRegistrations || 0) / Math.max(registrationStats?.totalRegistrations || 1, 1)) * 100),
      stats: registrationStats || {},
      actions: [
        { key: 'generate-page', label: '生成页面', type: 'primary' },
        { key: 'registration-dashboard', label: '报名管理', type: 'default' }
      ]
    },
    {
      id: 'activity-publish',
      title: '活动发布',
      description: `${activityStats?.ongoingActivities || 0}个活动进行中`,
      icon: activityIconMap['activity-publish'],
      status: (activityStats?.ongoingActivities || 0) > 0 ? 'in-progress' : 'pending',
      progress: 60,
      stats: {},
      actions: [
        { key: 'publish', label: '发布活动', type: 'primary' }
      ]
    },
    {
      id: 'registration-approval',
      title: '报名审核',
      description: `${registrationStats?.pendingRegistrations || 0}人待审核`,
      icon: activityIconMap['registration-approval'],
      status: (registrationStats?.pendingRegistrations || 0) > 0 ? 'in-progress' : 'completed',
      progress: Math.round(((registrationStats?.approvedRegistrations || 0) / Math.max(registrationStats?.totalRegistrations || 1, 1)) * 100),
      stats: {},
      actions: [
        { key: 'approve-registrations', label: '审核报名', type: 'primary' }
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
        { key: 'checkin', label: '活动签到', type: 'primary' }
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
        { key: 'generate-report', label: '生成报告', type: 'primary' },
        { key: 'intelligent-analysis', label: '智能分析', type: 'default' }
      ]
    }
  ]
}

// 默认Timeline数据
const getDefaultTimelineItems = (): TimelineItemData[] => {
  return [
    {
      id: 'activity-planning',
      title: '活动策划',
      description: '制定活动计划和方案',
      icon: activityIconMap['activity-planning'],
      status: 'in-progress',
      progress: 30,
      stats: { totalActivities: 5, publishedActivities: 2 },
      actions: [
        { key: 'create-activity', label: '创建活动', type: 'primary' },
        { key: 'view-templates', label: '查看模板', type: 'default' }
      ]
    },
    {
      id: 'poster-design',
      title: '海报设计',
      description: '设计活动宣传海报',
      icon: activityIconMap['poster-design'],
      status: 'pending',
      progress: 0,
      stats: {},
      actions: [
        { key: 'design-poster', label: '设计海报', type: 'primary' }
      ]
    },
    {
      id: 'marketing-config',
      title: '营销配置',
      description: '配置营销策略和推广方案',
      icon: activityIconMap['marketing-config'],
      status: 'pending',
      progress: 0,
      stats: {},
      actions: [
        { key: 'config-marketing', label: '营销配置', type: 'primary' }
      ]
    },
    {
      id: 'registration-page',
      title: '报名页面',
      description: '生成活动报名页面',
      icon: activityIconMap['registration-page'],
      status: 'pending',
      progress: 0,
      stats: {},
      actions: [
        { key: 'generate-page', label: '生成页面', type: 'primary' }
      ]
    },
    {
      id: 'activity-publish',
      title: '活动发布',
      description: '发布活动到各个渠道',
      icon: activityIconMap['activity-publish'],
      status: 'pending',
      progress: 0,
      stats: {},
      actions: [
        { key: 'publish', label: '发布活动', type: 'primary' }
      ]
    },
    {
      id: 'registration-approval',
      title: '报名审核',
      description: '审核参与者报名信息',
      icon: activityIconMap['registration-approval'],
      status: 'pending',
      progress: 0,
      stats: {},
      actions: [
        { key: 'approve-registrations', label: '审核报名', type: 'primary' }
      ]
    },
    {
      id: 'activity-checkin',
      title: '活动签到',
      description: '现场签到管理',
      icon: activityIconMap['activity-checkin'],
      status: 'pending',
      progress: 0,
      stats: {},
      actions: [
        { key: 'checkin', label: '活动签到', type: 'primary' }
      ]
    },
    {
      id: 'activity-evaluation',
      title: '效果评估',
      description: '收集反馈和评估效果',
      icon: activityIconMap['activity-evaluation'],
      status: 'pending',
      progress: 0,
      stats: {},
      actions: [
        { key: 'generate-report', label: '生成报告', type: 'primary' }
      ]
    }
  ]
}

// 刷新Timeline
const refreshTimeline = async () => {
  showToast('正在刷新...')
  await loadTimeline()
  showToast('刷新成功')
}

// 选择Timeline项
const selectTimelineItem = (item: TimelineItemData) => {
  selectedTimeline.value = item
}

// 查看活动Timeline（点击活动列表中的活动）
const viewActivityTimeline = (item: any) => {
  // 切换到timeline tab并选中对应的流程
  mainTab.value = 'timeline'
  selectedTimeline.value = timelineItems.value.find(t => t.id === 'activity-planning') || timelineItems.value[0]
  showToast(`已切换到活动流程：${item.name}`)
}

// 报名
const handleRegister = (item: any) => {
  router.push(`/mobile/activity/activity-register?id=${item.id}`)
}

// 创建活动
const handleCreate = () => {
  router.push('/mobile/activity/activity-create')
}

// Timeline操作（与PC端路由对应）
const handleTimelineAction = (item: TimelineItemData, action: any) => {
  const actionRoutes: Record<string, string> = {
    // 活动策划
    'create-activity': '/mobile/activity/activity-create',
    'view-templates': '/mobile/activity/activity-template',
    // 海报设计
    'design-poster': '/mobile/activity/activity-poster',
    'ai-poster': '/mobile/activity/activity-poster?mode=ai',
    // 营销配置
    'config-marketing': '/mobile/centers/marketing-center',
    // 报名页面
    'generate-page': '/mobile/activity/activity-publish',
    'registration-dashboard': '/mobile/activity/activity-registrations',
    // 活动发布
    'publish': '/mobile/activity/activity-publish',
    // 报名审核
    'approve-registrations': '/mobile/activity/activity-approval',
    // 活动签到
    'checkin': '/mobile/activity/activity-checkin',
    // 效果评估
    'generate-report': '/mobile/activity/activity-analytics',
    'intelligent-analysis': '/mobile/activity/activity-analytics?tab=ai'
  }

  const route = actionRoutes[action.key]
  if (route) {
    router.push(route)
  } else {
    showToast(`功能开发中: ${action.label}`)
  }
}

onMounted(() => {
  onLoad()
  loadTimeline()
})
</script>

<style scoped lang="scss">
.activity-center-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;

  .stats-section {
    padding: 12px;
    background: #fff;
    margin-bottom: 12px;

    .stat-content {
      text-align: center;
      .stat-value {
        font-size: 20px;
        font-weight: bold;
        color: #333;
      }
      .stat-label {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }
    }
  }

  .status-tabs {
    margin-bottom: 12px;
  }

  .activity-list {
    padding: 0 12px;
  }

  .activity-card {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 12px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .card-title {
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }
    }

    .card-meta {
      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #999;
        margin-bottom: 4px;
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #f0f0f0;

      .participants {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #666;
      }
    }
  }

  .empty-state {
    padding: 40px 0;
  }

  // Timeline样式
  .timeline-section {
    padding: 12px;

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding: 0 4px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0;
      }
    }
  }

  .timeline-list {
    .timeline-item {
      position: relative;
      display: flex;
      padding: 16px;
      background: #fff;
      border-radius: 12px;
      margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      transition: all 0.3s;

      &:active {
        transform: scale(0.98);
      }

      &.active {
        border: 2px solid #1989fa;
        background: #f0f7ff;
      }

      &.completed .timeline-node {
        background: #07c160;
      }

      &.in-progress .timeline-node {
        background: #1989fa;
        animation: pulse 2s infinite;
      }

      &.pending .timeline-node {
        background: #c8c9cc;
      }

      .timeline-line {
        position: absolute;
        left: 31px;
        top: 56px;
        bottom: -12px;
        width: 2px;
        background: linear-gradient(180deg, #ddd 0%, transparent 100%);
      }

      .timeline-node {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        color: #fff;
      }

      .timeline-content {
        flex: 1;
        min-width: 0;

        .timeline-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .timeline-title {
          font-size: 15px;
          font-weight: 600;
          color: #333;
        }

        .timeline-desc {
          font-size: 12px;
          color: #999;
          margin: 0 0 8px 0;
        }

        .timeline-progress {
          margin-bottom: 4px;
        }

        .progress-text {
          font-size: 12px;
          color: #1989fa;
          font-weight: 600;
        }

        .timeline-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin: 8px 0;
          padding: 8px;
          background: #f7f8fa;
          border-radius: 8px;

          .stat-item {
            display: flex;
            flex-direction: column;
            gap: 2px;

            .stat-label {
              font-size: 11px;
              color: #999;
            }

            .stat-value {
              font-size: 14px;
              font-weight: 600;
              color: #333;
            }
          }
        }

        .timeline-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #f0f0f0;
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(25, 137, 250, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(25, 137, 250, 0);
  }
}
</style>
