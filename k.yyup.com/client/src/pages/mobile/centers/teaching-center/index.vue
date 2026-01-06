<template>
  <MobileMainLayout
    title="教学中心"
    :show-back="true"
  >
    <div class="mobile-teaching-center">
      <!-- 教学进度总览 -->
      <div class="progress-overview">
        <div class="section-header">
          <h3 class="section-title">教学进度总览</h3>
          <p class="section-subtitle">全员普及进度和结果达标率管理</p>
        </div>

        <div class="stats-grid">
          <div
            v-for="stat in progressStats"
            :key="stat.key"
            class="stat-card-mobile"
            :class="`stat-card--${stat.type}`"
            @click="handleStatClick(stat)"
          >
            <div class="stat-icon">
              <van-icon :name="getMobileIcon(stat.iconName)" size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stat.value }}{{ stat.unit }}</div>
              <div class="stat-title">{{ stat.title }}</div>
              <div v-if="stat.trend !== 0" class="stat-trend">
                <van-icon
                  :name="stat.trend > 0 ? 'arrow-up' : 'arrow-down'"
                  :color="stat.trend > 0 ? '#07c160' : '#ee0a24'"
                  size="12"
                />
                <span :class="stat.trend > 0 ? 'trend-up' : 'trend-down'">
                  {{ Math.abs(stat.trend) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 教学流程时间轴 -->
      <div class="teaching-timeline">
        <div class="section-header">
          <h3 class="section-title">教学流程</h3>
          <p class="section-subtitle">跟踪教学进度和活动安排</p>
        </div>

        <van-steps direction="vertical" :active="activeStep" active-color="#409EFF">
          <van-step
            v-for="(item, index) in timelineItems"
            :key="item.id"
            :title="item.title"
            :description="item.description"
            @click="selectTimelineItem(item)"
            :class="{ 'timeline-item-active': selectedItem?.id === item.id }"
          >
            <template #icon>
              <div class="step-icon" :class="`step-icon--${getStepIconClass(item.status)}`">
                <van-icon :name="getTimelineIcon(item.type)" size="16" />
              </div>
            </template>

            <div class="timeline-content">
              <div class="timeline-meta">
                <span class="timeline-date">{{ item.date }}</span>
                <van-tag
                  :type="getTagType(item.status)"
                  size="small"
                  class="timeline-status"
                >
                  {{ getStatusText(item.status) }}
                </van-tag>
              </div>

              <div class="timeline-stats" v-if="item.stats">
                <div class="stat-item" v-for="stat in item.stats" :key="stat.label">
                  <span class="stat-label">{{ stat.label }}:</span>
                  <span class="stat-value">{{ stat.value }}</span>
                </div>
              </div>
            </div>
          </van-step>
        </van-steps>
      </div>

      <!-- 选中项详情 -->
      <div class="selected-detail" v-if="selectedItem">
        <div class="detail-header">
          <h3 class="detail-title">{{ selectedItem.title }}</h3>
          <van-button
            type="primary"
            size="small"
            icon="eye-o"
            @click="showDetailDrawer = true"
          >
            查看详细内容
          </van-button>
        </div>

        <div class="detail-preview">
          <component
            :is="getDetailComponent(selectedItem.type)"
            :data="selectedItem"
            :preview="true"
            @refresh="loadTimelineData"
          />
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <van-empty description="请选择教学流程项目查看详情">
          <template #image>
            <van-icon name="records" size="48" color="#c8c9cc" />
          </template>
        </van-empty>
      </div>
    </div>

    <!-- 操作面板 -->
    <van-action-sheet
      v-model:show="showActionSheet"
      :actions="sheetActions"
      cancel-text="取消"
      close-on-click-action
      @select="onSheetActionSelect"
    />

    <!-- 详情抽屉 -->
    <van-popup
      v-model:show="showDetailDrawer"
      position="bottom"
      round
      :style="{ height: '85%' }"
      safe-area-inset-bottom
    >
      <div class="detail-drawer">
        <div class="drawer-header">
          <h3>{{ selectedItem?.title }}</h3>
          <van-button icon="cross" @click="showDetailDrawer = false" />
        </div>

        <div class="drawer-content">
          <component
            :is="getDetailComponent(selectedItem?.type)"
            v-if="selectedItem"
            :data="selectedItem"
            @refresh="loadTimelineData"
          />
        </div>
      </div>
    </van-popup>

    <!-- 加载状态 -->
    <van-loading v-if="loading" class="loading-fullscreen" />

    <!-- 悬浮操作按钮 -->
    <FabButton
      icon="plus"
      :multiple="true"
      :actions="fabActions"
      @action-click="handleFabAction"
    />
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import FabButton from '@/components/mobile/FabButton.vue'
import { teachingCenterApi } from '@/api/endpoints/teaching-center'

// 导入详情组件
import CoursePlanDetail from './components/CoursePlanDetail.vue'
import OutdoorTrainingDetail from './components/OutdoorTrainingDetail.vue'
import ExternalDisplayDetail from './components/ExternalDisplayDetail.vue'
import ChampionshipDetail from './components/ChampionshipDetail.vue'

// 接口定义
interface TimelineItem {
  id: string
  type: 'course-plan' | 'outdoor-training' | 'external-display' | 'championship'
  title: string
  description: string
  date: string
  status: 'completed' | 'in-progress' | 'pending' | 'not-started'
  stats?: Array<{
    label: string
    value: string | number
  }>
  data?: any
}

interface ProgressStat {
  key: string
  title: string
  value: number | string
  unit: string
  trend: number
  type: 'primary' | 'success' | 'warning' | 'info'
  iconName: string
}

interface QuickAction {
  key: string
  label: string
  type: 'primary' | 'success' | 'warning' | 'info'
  icon: string
  action: () => void
}

// 路由
const router = useRouter()

// 响应式数据
const selectedItem = ref<TimelineItem | null>(null)
const showActionSheet = ref(false)
const showDetailDrawer = ref(false)
const loading = ref(false)
const activeStep = ref(0)

// 进度统计数据
const progressStats = ref<ProgressStat[]>([
  {
    key: 'overallProgress',
    title: '全员普及进度',
    value: 0,
    unit: '%',
    trend: 0,
    type: 'primary',
    iconName: 'chart-trending-o'
  },
  {
    key: 'achievementRate',
    title: '结果达标率',
    value: 0,
    unit: '%',
    trend: 0,
    type: 'success',
    iconName: 'medal-o'
  },
  {
    key: 'outdoorWeeks',
    title: '户外训练周数',
    value: 0,
    unit: '/16',
    trend: 0,
    type: 'warning',
    iconName: 'location-o'
  },
  {
    key: 'semesterOutings',
    title: '本学期外出',
    value: 0,
    unit: '次',
    trend: 0,
    type: 'info',
    iconName: 'friends-o'
  }
])

// 时间轴数据
const timelineItems = ref<TimelineItem[]>([])

// 快捷操作配置
const quickActions = computed<QuickAction[]>(() => [
  {
    key: 'create-course',
    label: '创建课程计划',
    type: 'primary',
    icon: 'add-o',
    action: () => handleCreateCourse()
  },
  {
    key: 'outdoor-record',
    label: '记录户外训练',
    type: 'success',
    icon: 'records',
    action: () => handleOutdoorRecord()
  },
  {
    key: 'external-display',
    label: '添加校外展示',
    type: 'warning',
    icon: 'location-o',
    action: () => handleExternalDisplay()
  },
  {
    key: 'championship',
    label: '创建锦标赛',
    type: 'info',
    icon: 'trophy-o',
    action: () => handleChampionship()
  }
])

// 悬浮按钮操作配置
const fabActions = [
  {
    name: 'course',
    icon: 'add-o',
    label: '课程计划'
  },
  {
    name: 'outdoor',
    icon: 'records',
    label: '户外训练'
  },
  {
    name: 'external',
    icon: 'location-o',
    label: '校外展示'
  },
  {
    name: 'championship',
    icon: 'trophy-o',
    label: '锦标赛'
  }
]

// 操作面板配置
const sheetActions = computed(() => [
  {
    name: '创建课程计划',
    icon: 'add-o',
    type: 'primary'
  },
  {
    name: '记录户外训练',
    icon: 'records',
    type: 'success'
  },
  {
    name: '添加校外展示',
    icon: 'location-o',
    type: 'warning'
  },
  {
    name: '创建锦标赛',
    icon: 'trophy-o',
    type: 'info'
  },
  {
    name: '导出教学报告',
    icon: 'description',
    type: 'default'
  }
])

// 方法
const selectTimelineItem = (item: TimelineItem) => {
  selectedItem.value = item
  const index = timelineItems.value.findIndex(i => i.id === item.id)
  activeStep.value = index
}

const handleStatClick = (stat: ProgressStat) => {
  showToast(`查看${stat.title}详情`)
}

// 处理悬浮按钮操作
const handleFabAction = (action: any) => {
  switch (action.name) {
    case 'course':
      handleCreateCourse()
      break
    case 'outdoor':
      handleOutdoorRecord()
      break
    case 'external':
      handleExternalDisplay()
      break
    case 'championship':
      handleChampionship()
      break
  }
}

const getMobileIcon = (iconName: string) => {
  const iconMap: Record<string, string> = {
    'chart-trending-o': 'chart-trending-o',
    'medal-o': 'medal-o',
    'location-o': 'location-o',
    'friends-o': 'friends-o'
  }
  return iconMap[iconName] || 'apps-o'
}

const getTimelineIcon = (type: string) => {
  const iconMap = {
    'course-plan': 'records',
    'outdoor-training': 'location-o',
    'external-display': 'friends-o',
    'championship': 'trophy-o'
  }
  return iconMap[type as keyof typeof iconMap] || 'records'
}

const getStepIconClass = (status: string) => {
  return status
}

const getTagType = (status: string) => {
  const typeMap = {
    'completed': 'success',
    'in-progress': 'primary',
    'pending': 'warning',
    'not-started': 'default'
  }
  return typeMap[status as keyof typeof typeMap] || 'default'
}

const getStatusText = (status: string) => {
  const textMap = {
    'completed': '已完成',
    'in-progress': '进行中',
    'pending': '待处理',
    'not-started': '未开始'
  }
  return textMap[status as keyof typeof textMap] || status
}

const getDetailComponent = (type: string) => {
  const componentMap = {
    'course-plan': CoursePlanDetail,
    'outdoor-training': OutdoorTrainingDetail,
    'external-display': ExternalDisplayDetail,
    'championship': ChampionshipDetail
  }
  return componentMap[type as keyof typeof componentMap]
}

const handleQuickAction = (action: QuickAction) => {
  action.action()
}

const handleCreateCourse = () => {
  const coursePlanItem = timelineItems.value.find(item => item.type === 'course-plan')
  if (coursePlanItem) {
    selectedItem.value = coursePlanItem
    showDetailDrawer.value = true
  }
}

const handleOutdoorRecord = () => {
  const outdoorItem = timelineItems.value.find(item => item.type === 'outdoor-training')
  if (outdoorItem) {
    selectedItem.value = outdoorItem
    showDetailDrawer.value = true
  }
}

const handleExternalDisplay = () => {
  const displayItem = timelineItems.value.find(item => item.type === 'external-display')
  if (displayItem) {
    selectedItem.value = displayItem
    showDetailDrawer.value = true
  }
}

const handleChampionship = () => {
  const championshipItem = timelineItems.value.find(item => item.type === 'championship')
  if (championshipItem) {
    selectedItem.value = championshipItem
    showDetailDrawer.value = true
  }
}

const onSheetActionSelect = (action: any) => {
  switch (action.icon) {
    case 'add-o':
      handleCreateCourse()
      break
    case 'records':
      handleOutdoorRecord()
      break
    case 'location-o':
      handleExternalDisplay()
      break
    case 'trophy-o':
      handleChampionship()
      break
    case 'description':
      showToast('导出教学报告功能开发中...')
      break
  }
}

// 数据加载方法
const loadTimelineData = async () => {
  try {
    loading.value = true

    const loadingToast = showLoadingToast('加载教学数据...')

    // 并行加载各类数据
    const [courseProgress, outdoorTraining, externalDisplay, championship] = await Promise.all([
      loadCourseProgressData(),
      loadOutdoorTrainingData(),
      loadExternalDisplayData(),
      loadChampionshipData()
    ])

    closeToast()

    // 构建时间轴数据
    timelineItems.value = [
      {
        id: 'course-plan',
        type: 'course-plan',
        title: '脑科学课程计划',
        description: '全员普及进度和结果达标率管理',
        date: '2024-01-15',
        status: getProgressStatus(courseProgress.overallProgress),
        stats: [
          { label: '普及进度', value: `${courseProgress.overallProgress}%` },
          { label: '达标率', value: `${courseProgress.achievementRate}%` }
        ],
        data: courseProgress
      },
      {
        id: 'outdoor-training',
        type: 'outdoor-training',
        title: '户外训练与展示',
        description: '16周户外训练和离园展示进度管理',
        date: '2024-02-01',
        status: getProgressStatus(outdoorTraining.averageRate),
        stats: [
          { label: '完成率', value: `${outdoorTraining.averageRate}%` },
          { label: '完成周数', value: `${outdoorTraining.completedWeeks}/16` }
        ],
        data: outdoorTraining
      },
      {
        id: 'external-display',
        type: 'external-display',
        title: '校外展示',
        description: '校外展示活动管理，包括本学期和累计外出统计',
        date: '2024-02-15',
        status: 'in-progress',
        stats: [
          { label: '平均达标率', value: `${externalDisplay.averageRate}%` },
          { label: '本学期外出', value: `${externalDisplay.semesterOutings}次` }
        ],
        data: externalDisplay
      },
      {
        id: 'championship',
        type: 'championship',
        title: '全员锦标赛',
        description: '每学期锦标赛管理，包括四项达标率统计',
        date: '2024-03-01',
        status: 'pending',
        stats: [
          { label: '脑科学达标率', value: `${championship.brainScienceRate}%` },
          { label: '课程达标率', value: `${championship.courseContentRate}%` }
        ],
        data: championship
      }
    ]

    // 更新进度统计
    progressStats.value[0].value = courseProgress.overallProgress
    progressStats.value[1].value = courseProgress.achievementRate
    progressStats.value[2].value = outdoorTraining.completedWeeks
    progressStats.value[3].value = externalDisplay.semesterOutings

    // 默认选择第一个项目
    if (timelineItems.value.length > 0 && !selectedItem.value) {
      selectedItem.value = timelineItems.value[0]
      activeStep.value = 0
    }

  } catch (error) {
    console.error('加载时间轴数据失败:', error)
    showToast('加载教学数据失败')
  } finally {
    loading.value = false
  }
}

const getProgressStatus = (progress: number): TimelineItem['status'] => {
  if (progress >= 90) return 'completed'
  if (progress >= 50) return 'in-progress'
  if (progress > 0) return 'pending'
  return 'not-started'
}

const loadCourseProgressData = async () => {
  try {
    const response = await teachingCenterApi.getCourseProgressStats()
    if (response && response.success) {
      const data = response.data as any
      return {
        overallProgress: data?.overall_stats?.overall_completion_rate || 75,
        achievementRate: data?.overall_stats?.overall_achievement_rate || 82,
        classList: data?.course_plans || []
      }
    }
  } catch (error) {
    console.warn('课程进度API调用失败，使用模拟数据')
  }

  return {
    overallProgress: 75,
    achievementRate: 82,
    classList: [
      { id: 1, name: '小班A班', progress: 85, achievement: 88 },
      { id: 2, name: '中班B班', progress: 72, achievement: 79 },
      { id: 3, name: '大班C班', progress: 68, achievement: 80 }
    ]
  }
}

const loadOutdoorTrainingData = async () => {
  try {
    const response = await teachingCenterApi.getOutdoorTrainingStats()
    if (response && response.success) {
      const data = response.data as any
      return {
        averageRate: data?.overview?.outdoor_training?.average_rate || 75,
        completedWeeks: data?.overview?.outdoor_training?.completed_weeks || 12,
        classList: data?.class_statistics || []
      }
    }
  } catch (error) {
    console.warn('户外训练API调用失败，使用模拟数据')
  }

  return {
    averageRate: 75,
    completedWeeks: 12,
    classList: []
  }
}

const loadExternalDisplayData = async () => {
  try {
    const response = await teachingCenterApi.getExternalDisplayStats()
    if (response && response.success) {
      const data = response.data
      return {
        averageRate: data?.overview?.average_achievement_rate || 85,
        semesterOutings: data?.overview?.semester_total_outings || 6,
        totalOutings: data?.overview?.all_time_total_outings || 24,
        classList: data?.class_statistics || []
      }
    }
  } catch (error) {
    console.warn('校外展示API调用失败，使用模拟数据')
  }

  return {
    averageRate: 85,
    semesterOutings: 6,
    totalOutings: 24,
    classList: []
  }
}

const loadChampionshipData = async () => {
  try {
    const response = await teachingCenterApi.getChampionshipStats()
    if (response && response.success) {
      const data = response.data
      return {
        brainScienceRate: data?.achievement_rates?.brain_science_plan || 78,
        courseContentRate: data?.achievement_rates?.course_content || 82,
        outdoorTrainingRate: data?.achievement_rates?.outdoor_training_display || 75,
        externalDisplayRate: data?.achievement_rates?.external_display || 85,
        championshipList: data?.championship_list || []
      }
    }
  } catch (error) {
    console.warn('锦标赛API调用失败，使用模拟数据')
  }

  return {
    brainScienceRate: 78,
    courseContentRate: 82,
    outdoorTrainingRate: 75,
    externalDisplayRate: 85,
    championshipList: []
  }
}

// 生命周期
onMounted(() => {
  console.log('移动端教学中心已加载')
  loadTimelineData()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.mobile-teaching-center {
  padding: var(--van-padding-md);
  background: var(--van-background-color-light);
  min-height: calc(100vh - var(--van-nav-bar-height) - var(--van-tabbar-height));
}

// 区域标题样式
.section-header {
  margin-bottom: var(--van-padding-lg);
  text-align: left;

  .section-title {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--van-text-color);
    margin: 0 0 var(--van-padding-xs) 0;
    line-height: 1.3;
  }

  .section-subtitle {
    font-size: var(--text-sm);
    color: var(--van-text-color-2);
    margin: 0;
    line-height: 1.5;
  }
}

// 统计卡片样式
.progress-overview {
  margin-bottom: var(--van-padding-xl);

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--van-padding-md);

    .stat-card-mobile {
      background: var(--card-bg);
      border-radius: var(--van-radius-lg);
      padding: var(--van-padding-md);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      display: flex;
      align-items: center;
      gap: var(--van-padding-sm);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
      }

      .stat-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--van-radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--van-background-color-light);
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--van-text-color);
          margin-bottom: 2px;
        }

        .stat-title {
          font-size: var(--text-xs);
          color: var(--van-text-color-2);
          margin-bottom: 4px;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 11px;

          .trend-up {
            color: #07c160;
          }

          .trend-down {
            color: #ee0a24;
          }
        }
      }

      &.stat-card--primary .stat-icon {
        background: rgba(64, 158, 255, 0.1);
        color: var(--primary-color);
      }

      &.stat-card--success .stat-icon {
        background: rgba(103, 194, 58, 0.1);
        color: var(--success-color);
      }

      &.stat-card--warning .stat-icon {
        background: rgba(230, 162, 60, 0.1);
        color: var(--warning-color);
      }

      &.stat-card--info .stat-icon {
        background: rgba(144, 147, 153, 0.1);
        color: var(--info-color);
      }
    }
  }
}

// 时间轴样式
.teaching-timeline {
  margin-bottom: var(--van-padding-xl);
  background: var(--card-bg);
  border-radius: var(--van-radius-lg);
  padding: var(--van-padding-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  :deep(.van-step) {
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
    }
  }

  .timeline-item-active {
    :deep(.van-step__title) {
      font-weight: 600;
      color: var(--van-primary-color);
    }

    .step-icon {
      background: var(--van-primary-color);
      color: white;
    }
  }

  .step-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--van-gray-4);
    color: white;
    transition: all 0.3s ease;

    &--completed {
      background: var(--van-success-color);
    }

    &--in-progress {
      background: var(--van-primary-color);
    }

    &--pending {
      background: var(--van-warning-color);
    }

    &--not-started {
      background: var(--van-gray-4);
    }
  }

  .timeline-content {
    margin-top: var(--van-padding-sm);

    .timeline-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--van-padding-sm);

      .timeline-date {
        font-size: var(--text-xs);
        color: var(--van-text-color-3);
      }

      .timeline-status {
        font-size: 11px;
      }
    }

    .timeline-stats {
      display: flex;
      gap: var(--van-padding-md);

      .stat-item {
        display: flex;
        align-items: center;
        gap: var(--van-padding-xs);
        font-size: var(--text-xs);

        .stat-label {
          color: var(--van-text-color-3);
        }

        .stat-value {
          font-weight: 600;
          color: var(--van-text-color);
        }
      }
    }
  }
}

// 选中项详情样式
.selected-detail {
  background: var(--card-bg);
  border-radius: var(--van-radius-lg);
  padding: var(--van-padding-lg);
  margin-bottom: var(--van-padding-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--van-padding-md);

    .detail-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
      margin: 0;
    }
  }

  .detail-preview {
    min-height: 100px;
  }
}

// 空状态样式
.empty-state {
  background: var(--card-bg);
  border-radius: var(--van-radius-lg);
  padding: var(--van-padding-xl);
  margin-bottom: var(--van-padding-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-align: center;
}

// 快捷操作样式
.quick-actions {
  background: var(--card-bg);
  border-radius: var(--van-radius-lg);
  padding: var(--van-padding-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .action-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--van-padding-md);
    border-radius: var(--van-radius-md);
    transition: all 0.3s ease;
    height: 60px;

    &:active {
      transform: scale(0.95);
    }

    .action-text {
      font-size: var(--text-xs);
      margin-top: var(--van-padding-xs);
      color: var(--van-text-color);
    }

    &.action-card--primary {
      background: rgba(64, 158, 255, 0.1);
      color: var(--primary-color);
    }

    &.action-card--success {
      background: rgba(103, 194, 58, 0.1);
      color: var(--success-color);
    }

    &.action-card--warning {
      background: rgba(230, 162, 60, 0.1);
      color: var(--warning-color);
    }

    &.action-card--info {
      background: rgba(144, 147, 153, 0.1);
      color: var(--info-color);
    }
  }
}

// 详情抽屉样式
.detail-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--van-padding-lg) var(--van-padding-md);
    border-bottom: 1px solid var(--van-border-color);

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--van-text-color);
    }
  }

  .drawer-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--van-padding-md);
  }
}

// 加载状态样式
.loading-fullscreen {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
}

// 响应式设计
@media (max-width: 375px) {
  .mobile-teaching-center {
    padding: var(--van-padding-sm);
  }

  .stats-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
