<!--
  CentersContent.vue - 移动端中心目录内容组件
  Mobile Centers Content Component

  四个角色共享的内容组件，确保视觉完全统一
  使用新创建的5个移动端组件
-->
<template>
  <div class="mobile-centers-content">
    <!-- 搜索栏 -->
    <MobileSearchBar
      v-model="searchQuery"
      :search-data="allCenters"
      :hot-searches="hotSearches"
      placeholder="搜索中心..."
      @search="handleSearch"
    />

    <!-- 快捷操作 -->
    <MobileQuickActions
      v-if="showQuickActions"
      :actions="quickActions"
      @action="handleQuickAction"
    />

    <!-- 统计概览 -->
    <div class="overview-section">
      <div class="stats-grid">
        <MobileStatCard
          v-for="stat in centerStats"
          :key="stat.key"
          :value="stat.value"
          :label="stat.label"
          :icon="stat.icon"
          :color="stat.color"
          :variant="stat.variant"
          :trend="stat.trend"
        />
      </div>
    </div>

    <!-- 中心分组 -->
    <div class="centers-sections">
      <MobileSectionCard
        v-for="section in filteredSections"
        :key="section.id"
        :title="section.title"
        :description="section.description"
        :icon="section.icon"
        :color="getSectionColor(section.id)"
        :section-id="section.id"
        :default-collapsed="section.defaultCollapsed"
      >
        <template #centers>
          <div class="section-centers-grid">
            <MobileCenterCard
              v-for="center in section.centers"
              :key="center.name"
              :name="center.name"
              :description="center.description"
              :icon="center.icon"
              :route="center.route"
              :accent-color="getCenterAccentColor(center.route)"
              :badge="center.badge"
              @click="navigateToCenter"
            />
          </div>
        </template>
      </MobileSectionCard>
    </div>

    <!-- 无搜索结果提示 -->
    <div v-if="searchQuery && filteredSections.length === 0" class="no-results">
      <UnifiedIcon name="search" :size="48" />
      <p>未找到相关中心</p>
      <button @click="clearSearch">清除搜索</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import MobileSearchBar from '@/components/mobile/MobileSearchBar.vue'
import MobileQuickActions, { type QuickAction } from '@/components/mobile/MobileQuickActions.vue'
import MobileStatCard from '@/components/mobile/MobileStatCard.vue'
import MobileCenterCard from '@/components/mobile/MobileCenterCard.vue'
import MobileSectionCard from '@/components/mobile/MobileSectionCard.vue'
import { getCenterAccentColor, getSectionColor, colorValues } from '@/utils/center-colors'
import { getCenterIcon } from '@/utils/center-icons'

const router = useRouter()

// ==================== 状态管理 ====================

const searchQuery = ref('')
const showQuickActions = ref(true)

// ==================== 统计概览数据 ====================

interface CenterStat {
  key: string
  label: string
  value: string | number
  icon: string
  color: string
  variant?: 'default' | 'gradient' | 'glass'
  trend?: 'up' | 'down' | 'neutral'
}

const centerStats = ref<CenterStat[]>([
  {
    key: 'total',
    label: '中心总数',
    value: '24',
    icon: 'grid',
    color: colorValues.primary,
    variant: 'gradient',
    trend: 'up'
  },
  {
    key: 'kindergarten',
    label: '园所管理',
    value: '4',
    icon: 'users',
    color: colorValues.accentPersonnel,
    trend: 'neutral'
  },
  {
    key: 'business',
    label: '业务管理',
    value: '6',
    icon: 'briefcase',
    color: colorValues.accentEnrollment,
    trend: 'up'
  },
  {
    key: 'finance',
    label: '财务管理',
    value: '1',
    icon: 'credit-card',
    color: colorValues.success,
    trend: 'neutral'
  },
  {
    key: 'system',
    label: '系统管理',
    value: '4',
    icon: 'settings',
    color: colorValues.accentSystem,
    trend: 'neutral'
  },
  {
    key: 'ai',
    label: 'AI智能',
    value: '4',
    icon: 'message-circle',
    color: colorValues.accentAI,
    variant: 'gradient',
    trend: 'up'
  }
])

// ==================== 快捷操作配置 ====================

const quickActions = ref<QuickAction[]>([
  {
    id: 'add-center',
    icon: 'plus',
    label: '新增中心',
    variant: 'primary',
    data: { action: 'add' }
  },
  {
    id: 'import-data',
    icon: 'upload',
    label: '导入数据',
    variant: 'default',
    data: { action: 'import' }
  },
  {
    id: 'export-data',
    icon: 'download',
    label: '导出数据',
    variant: 'default',
    data: { action: 'export' }
  },
  {
    id: 'refresh',
    icon: 'refresh-cw',
    label: '刷新',
    variant: 'default',
    data: { action: 'refresh' }
  },
  {
    id: 'settings',
    icon: 'settings',
    label: '设置',
    variant: 'default',
    data: { action: 'settings' }
  }
])

// ==================== 热门搜索标签 ====================

const hotSearches = ref([
  { label: '招生', icon: 'user-plus' },
  { label: '财务', icon: 'credit-card' },
  { label: 'AI助手', icon: 'message-circle' },
  { label: '教学', icon: 'book-open' }
])

// ==================== 中心分组数据 ====================

interface Center {
  name: string
  route: string
  description: string
  icon: string
  badge?: string | number
}

interface Section {
  id: string
  title: string
  description: string
  icon: string
  centers: Center[]
  defaultCollapsed?: boolean
}

const centerSections = ref<Section[]>([
  {
    id: 'kindergarten-management',
    title: '园所管理',
    description: '人员、班级、考勤、教学等基础管理',
    icon: 'users',
    centers: [
      {
        name: '人员中心',
        route: '/mobile/centers/user-center',
        description: '管理教师、学生、家长等人员信息',
        icon: 'user'
      },
      {
        name: '考勤中心',
        route: '/mobile/centers/attendance-center',
        description: '学生和教师的考勤记录管理',
        icon: 'clock'
      },
      {
        name: '教学中心',
        route: '/mobile/centers/teaching-center',
        description: '课程安排、教学进度、评估管理',
        icon: 'book-open'
      },
      {
        name: '评估中心',
        route: '/mobile/centers/assessment-center',
        description: '学生能力评估、成长记录分析',
        icon: 'analytics'
      }
    ]
  },
  {
    id: 'business-management',
    title: '业务管理',
    description: '招生、营销、活动等核心业务功能',
    icon: 'briefcase',
    centers: [
      {
        name: '招生中心',
        route: '/mobile/centers/enrollment-center',
        description: '招生计划、咨询记录、申请管理',
        icon: 'user-plus',
        badge: 12
      },
      {
        name: '营销中心',
        route: '/mobile/centers/marketing-center',
        description: '营销活动、广告投放、效果分析',
        icon: 'megaphone'
      },
      {
        name: '活动中心',
        route: '/mobile/centers/activity-center',
        description: '活动策划、报名管理、效果评估',
        icon: 'calendar',
        badge: 3
      },
      {
        name: '客户池中心',
        route: '/mobile/centers/customer-pool-center',
        description: '潜在客户管理、跟进记录分析',
        icon: 'user-group'
      },
      {
        name: '呼叫中心',
        route: '/mobile/centers/call-center',
        description: '来电记录、客户沟通、呼叫分析',
        icon: 'phone'
      },
      {
        name: '业务中心',
        route: '/mobile/centers/business-center',
        description: '业务流程管理、进度跟踪、快捷操作',
        icon: 'grid'
      }
    ]
  },
  {
    id: 'finance-management',
    title: '财务管理',
    description: '收费、收支、报表等财务功能',
    icon: 'credit-card',
    centers: [
      {
        name: '财务中心',
        route: '/mobile/centers/finance-center',
        description: '收费管理、收支记录、财务报表',
        icon: 'wallet'
      }
    ]
  },
  {
    id: 'system-management',
    title: '系统管理',
    description: '系统配置、权限、日志等后台功能',
    icon: 'settings',
    centers: [
      {
        name: '系统中心',
        route: '/mobile/centers/system-center',
        description: '系统设置、参数配置、基础数据',
        icon: 'cog'
      },
      {
        name: '任务中心',
        route: '/mobile/centers/my-task-center',
        description: '任务分配、进度跟踪、协作管理',
        icon: 'check-square',
        badge: 5
      },
      {
        name: '检查中心',
        route: '/mobile/centers/inspection-center',
        description: '检查计划、记录管理、整改跟踪',
        icon: 'search'
      },
      {
        name: '话术中心',
        route: '/mobile/centers/script-center',
        description: '话术模板、沟通记录、知识库',
        icon: 'message-square'
      }
    ]
  },
  {
    id: 'ai-intelligence',
    title: 'AI智能',
    description: 'AI功能和智能工具',
    icon: 'message-circle',
    defaultCollapsed: false,
    centers: [
      {
        name: '智能中心',
        route: '/mobile/centers/ai-center',
        description: 'AI助手、智能对话、自动化工具',
        icon: 'message-circle',
        badge: 'NEW'
      },
      {
        name: '分析中心',
        route: '/mobile/centers/analytics-center',
        description: '数据分析、预测模型、智能洞察',
        icon: 'trending-up'
      },
      {
        name: '文档模板中心',
        route: '/mobile/centers/document-template-center',
        description: '模板管理、文档生成、协作编辑',
        icon: 'file-text'
      },
      {
        name: '文档协作',
        route: '/mobile/centers/document-collaboration',
        description: '多人协作、版本控制、实时编辑',
        icon: 'users'
      }
    ]
  }
])

// ==================== 计算属性 ====================

// 所有中心的扁平化列表（用于搜索）
const allCenters = computed(() => {
  return centerSections.value.flatMap(section =>
    section.centers.map(center => ({
      name: center.name,
      description: center.description,
      route: center.route
    }))
  )
})

// 过滤后的分组（基于搜索）
const filteredSections = computed(() => {
  if (!searchQuery.value.trim()) {
    return centerSections.value
  }

  const query = searchQuery.value.toLowerCase()

  return centerSections.value
    .map(section => ({
      ...section,
      centers: section.centers.filter(center =>
        center.name.toLowerCase().includes(query) ||
        center.description.toLowerCase().includes(query)
      )
    }))
    .filter(section => section.centers.length > 0)
})

// ==================== 方法 ====================

// 导航到中心页面
function navigateToCenter(payload: { name: string; route: string }) {
  const { route, name } = payload

  try {
    router.push(route)
  } catch (error) {
    console.warn('路由跳转失败:', route, error)
    showToast(`${name}页面开发中...`)
  }
}

// 搜索处理
function handleSearch(query: string) {
  console.log('搜索:', query)
}

// 清除搜索
function clearSearch() {
  searchQuery.value = ''
}

// 快捷操作处理
function handleQuickAction(action: QuickAction, index: number) {
  console.log('快捷操作:', action, index)

  switch (action.id) {
    case 'add-center':
      showToast('新增中心功能开发中...')
      break
    case 'import-data':
      showToast('导入数据功能开发中...')
      break
    case 'export-data':
      showToast('导出数据功能开发中...')
      break
    case 'refresh':
      showToast('已刷新')
      break
    case 'settings':
      showToast('设置功能开发中...')
      break
    default:
      showToast(`${action.label}功能开发中...`)
  }

  // 震动反馈（如果支持）
  if ('vibrate' in navigator) {
    navigator.vibrate(10)
  }
}

// 获取分组颜色 - 已从 center-colors.ts 导入
// 使用别名避免函数名冲突
</script>

<style lang="scss" scoped>
@use '@/styles/design-tokens.scss' as *;
@use '@/styles/mobile-centers-theme.scss' as *;
@use '@/styles/mobile-centers-animations.scss' as *;
@use '@/styles/mobile-centers-responsive.scss' as *;

.mobile-centers-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--bg-color-page);
  min-height: 100vh;

  // 入场动画
  animation: fadeIn 300ms ease-out;
}

// ==================== 概览区域 ====================

.overview-section {
  margin-bottom: var(--spacing-sm);

  // 入场动画
  animation: fadeInUp 400ms ease-out backwards;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

// ==================== 中心分组 ====================

.centers-sections {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);

  // 入场动画延迟
  animation: fadeInUp 400ms ease-out 100ms backwards;
}

.section-centers-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);

  @media (min-width: 1024px) {
    // 大屏设备可以使用网格布局
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
}

// ==================== 无搜索结果 ====================

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--text-secondary);

  svg {
    color: var(--text-tertiary);
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
  }

  p {
    font-size: var(--text-lg);
    margin-bottom: var(--spacing-md);
  }

  button {
    padding: var(--spacing-sm) var(--spacing-lg);
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    cursor: pointer;
    transition: all var(--transition-duration-fast) var(--transition-timing-ease);

    &:hover {
      background: var(--primary-color-dark);
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

// ==================== 响应式调整 ====================

// 小屏设备
@media (max-width: 479px) {
  .mobile-centers-content {
    padding: var(--spacing-sm);
    gap: var(--spacing-md);
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-xs);
  }
}

// 中等屏幕
@media (min-width: 480px) and (max-width: 1023px) {
  .mobile-centers-content {
    padding: var(--spacing-md);
    gap: var(--spacing-lg);
  }

  .stats-grid {
    gap: var(--spacing-sm);
  }
}

// 大屏设备
@media (min-width: 1024px) {
  .mobile-centers-content {
    max-width: var(--breakpoint-lg, 1024px);
    margin: 0 auto;
    padding: var(--spacing-lg);
    gap: var(--spacing-xl);
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-md);
  }
}

// ==================== 深色主题适配 ====================

[data-theme='dark'] {
  .mobile-centers-content {
    background: var(--bg-color-page-dark, #0f172a);
  }

  .no-results {
    color: var(--text-secondary-dark, #94a3b8);

    svg {
      color: var(--text-tertiary-dark, #64748b);
    }
  }
}

// ==================== 辅助功能 ====================

// 减少动画模式
@media (prefers-reduced-motion: reduce) {
  .mobile-centers-content,
  .overview-section,
  .centers-sections {
    animation: none;
  }
}
</style>
