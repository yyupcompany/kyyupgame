<template>
  <UnifiedCenterLayout
    title="活动中心"
    description="清晰展示活动管理的完整流程，方便园长一目了然地掌握活动进展"
  >
    <template #header-actions>
      <el-button type="primary" size="large" @click="handleCreateActivity">
        <LucideIcon name="Plus" :size="18" />
        新建活动
      </el-button>
    </template>

    <div class="center-container activity-center-timeline">

    <!-- Timeline主体 -->
    <div class="timeline-container">
      <!-- 左侧Timeline队列 (33%宽度) -->
      <div class="timeline-section" v-loading="loading">
        <div class="timeline-header">
          <h2>活动流程</h2>
          <el-button size="small" @click="refreshTimeline">
            <LucideIcon name="RefreshCw" :size="16" />
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

    <!-- AI帮助按钮 -->
    <PageHelpButton :help-content="activityCenterHelp" />
  </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import TimelineItem from '@/components/activity/TimelineItem.vue'
import DetailPanel from '@/components/activity/DetailPanel.vue'
import LucideIcon from '@/components/icons/LucideIcon.vue'
import PageHelpButton from '@/components/common/PageHelpButton.vue'
import { request } from '@/utils/request'

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

// 加载Timeline数据
const loadTimeline = async () => {
  try {
    loading.value = true
    console.log('🔄 开始加载活动中心Timeline数据...')
    
    const response = await request.get('/centers/activity/timeline')
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
    'view-templates': '/activity/templates',
    'activity-planner': '/activity/create',
    'view-activities': '/activity',

    // 海报设计阶段
    'design-poster': '/principal/poster-mode-selection',
    'ai-poster': '/principal/poster-mode-selection?mode=ai',
    'upload-poster': '/principal/poster-mode-selection?mode=upload',

    // 营销配置阶段
    'config-marketing': '/centers/marketing',
    'marketing-tools': '/centers/marketing',
    'promotion-settings': '/centers/marketing',

    // 报名页面阶段
    'generate-page': '/activity/registration-page-generator',
    'registration-dashboard': '/activity/registration/RegistrationDashboard',
    'page-templates': '/activity/registration-page-generator?tab=templates',

    // 活动发布阶段
    'publish': '/activity/publish',
    'publish-channels': '/activity/publish?tab=channels',
    'share-management': '/activity/publish?tab=share',

    // 报名审核阶段
    'approve-registrations': '/activity/registrations',
    'registration-list': '/activity/ActivityRegistrations',
    'approval-workflow': '/activity/registrations?tab=approval',

    // 活动签到阶段
    'checkin': '/activity/checkin',
    'checkin-management': '/activity/ActivityCheckin',
    'attendance-stats': '/activity/checkin?tab=stats',

    // 效果评估阶段
    'create-survey': '/activity/evaluation/ActivityEvaluation',
    'generate-report': '/activity/analytics/ActivityAnalytics',
    'intelligent-analysis': '/activity/analytics/intelligent-analysis',
    'activity-optimizer': '/activity/optimization/ActivityOptimizer'
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
  padding: var(--text-2xl);
  background: var(--bg-primary, #f9fafb);  // 使用全局主背景色
  overflow-x: hidden;  // 防止横向滚动
}

/* .page-header 样式已移至全局 center-common.scss 中统一管理 */

// 🔧 修复：使用flex布局代替固定百分比宽度
.timeline-container {
  flex: 1;
  display: flex;
  gap: var(--text-3xl);
  min-height: 0;
  max-width: 100%;  // 防止超出
  overflow: hidden;  // 防止内容超出
}

.timeline-section {
  flex: 0 0 400px;  // 固定宽度400px，不伸缩
  min-width: 0;  // 允许收缩
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);  // 纯白色背景，不透明
  border-radius: var(--text-lg);
  padding: var(--text-3xl);
  box-shadow: var(--el-box-shadow-light);
  border: var(--border-width-base) solid var(--el-border-color);
  overflow: hidden;
  backdrop-filter: none !important;  // 移除模糊效果

  .timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-2xl);
    padding-bottom: var(--spacing-lg);
    border-bottom: var(--transform-drop) solid var(--border-color);

    h2 {
      font-size: var(--text-xl);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin: 0;
    }
  }

  .timeline-list {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;  // 防止横向滚动
    padding-right: var(--spacing-xs);

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: var(--radius-sm);

      &:hover {
        background: var(--text-secondary);
      }
    }
  }
}

.detail-section {
  flex: 1;  // 占据剩余空间
  min-width: 0;  // 允许收缩
  background: var(--bg-card);  // 纯白色背景，不透明
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: var(--border-width-base) solid var(--border-color);
  overflow: hidden;
  backdrop-filter: none !important;  // 移除模糊效果
}

// 响应式设计
@media (max-width: var(--breakpoint-xl)) {
  .timeline-container {
    flex-direction: column;

    .timeline-section {
      flex: 0 0 auto;  // 自动高度
      max-height: 400px;
      width: 100%;
    }

    .detail-section {
      flex: 1;
      width: 100%;
      min-height: 500px;
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .activity-center-timeline {
    padding: var(--spacing-lg);
  }

  .page-header {
    flex-direction: column;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl);

    .header-content {
      .page-title {
        font-size: var(--text-2xl);
      }

      .page-description {
        font-size: var(--text-sm);
      }
    }

    .header-actions {
      width: 100%;

      .el-button {
        width: 100%;
      }
    }
  }

  .timeline-container {
    gap: var(--spacing-lg);
  }

  .timeline-section {
    padding: var(--spacing-lg);
    flex: 0 0 auto;
  }

  .detail-section {
    padding: var(--spacing-lg);
  }
}

// ✅ 暗黑主题样式 - 与业务中心保持一致
.dark {
  .activity-center-timeline {
    background: var(--el-bg-color);
  }

  .timeline-section,
  .detail-section {
    background: var(--el-fill-color-light);
    backdrop-filter: blur(var(--text-2xl));
    border-color: var(--el-border-color);
    box-shadow: var(--el-box-shadow-light);
  }

  .timeline-header {
    border-bottom-color: var(--el-border-color);

    h2 {
      color: var(--el-text-color-primary);
    }
  }

  .timeline-list {
    &::-webkit-scrollbar-thumb {
      background: var(--el-fill-color-light);

      &:hover {
        background: var(--el-fill-color);
      }
    }
  }
}

// ✅ html.dark 兼容性
html.dark {
  .activity-center-timeline {
    background: var(--el-bg-color);
  }

  .timeline-section,
  .detail-section {
    background: var(--el-fill-color-light);
    backdrop-filter: blur(var(--text-2xl));
    border-color: var(--el-border-color);
    box-shadow: var(--el-box-shadow-light);
  }

  .timeline-header {
    border-bottom-color: var(--el-border-color);

    h2 {
      color: var(--el-text-color-primary);
    }
  }

  .timeline-list {
    &::-webkit-scrollbar-thumb {
      background: var(--el-fill-color-light);

      &:hover {
        background: var(--el-fill-color);
      }
    }
  }
}
</style>

