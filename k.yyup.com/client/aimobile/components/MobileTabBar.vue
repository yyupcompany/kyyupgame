<!--
  🏫 移动端底部导航栏组件
  
  基于 04-组件开发指南.md 的导航设计
  特性：角色适配、徽章提示、触摸优化
-->

<template>
  <div class="mobile-tabbar" :class="tabbarClasses">
    <div class="tabbar__container">
      <div
        v-for="tab in visibleTabs"
        :key="tab.id"
        class="tabbar__item"
        :class="{
          'item--active': activeTab === tab.id,
          'item--disabled': !tab.enabled
        }"
        @click="handleTabClick(tab)"
      >
        <!-- 图标和徽章 -->
        <div class="item__icon-wrapper">
          <div class="item__icon">
            <el-icon :size="24">
              <component :is="activeTab === tab.id ? tab.activeIcon : tab.icon" />
            </el-icon>
          </div>
          
          <!-- 徽章提示 -->
          <el-badge
            v-if="tab.badge && tab.badge > 0"
            :value="tab.badge"
            :max="99"
            :type="tab.badgeType"
            class="item__badge"
          />
          
          <!-- 红点提示 -->
          <div
            v-else-if="tab.dot"
            class="item__dot"
          />
        </div>

        <!-- 标签文字 -->
        <span class="item__label">{{ tab.label }}</span>

        <!-- 激活状态指示器 -->
        <div
          v-if="activeTab === tab.id"
          class="item__indicator"
        />
      </div>
    </div>

    <!-- 安全区域适配 -->
    <div class="tabbar__safe-area" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useMobileStore } from '../stores/mobile'
import {
  // 通用图标
  House,
  HouseFilled,
  User,
  UserFilled,
  Calendar,
  CalendarFilled,
  ChatDotRound,
  ChatDotSquare,
  DataAnalysis,
  DataBoard,
  // 角色特定图标
  School,
  SchoolFilled,
  Trophy,
  TrophyFilled,
  Service,
  ServiceFilled,
  Tools,
  Briefcase
} from '@element-plus/icons-vue'

// Props定义
interface Props {
  activeTab: string
}

const props = defineProps<Props>()

// Emits定义
interface Emits {
  tabChange: [tab: string]
}

const emit = defineEmits<Emits>()

// 数据
const userStore = useUserStore()
const mobileStore = useMobileStore()

// Tab配置接口
interface TabConfig {
  id: string
  label: string
  icon: any
  activeIcon: any
  badge?: number
  badgeType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  dot?: boolean
  enabled: boolean
  roles: string[]  // 允许访问的角色
  path: string
}

// 所有可能的Tab配置
const allTabs: TabConfig[] = [
  // 通用 - 工作台/首页
  {
    id: 'dashboard',
    label: '工作台',
    icon: House,
    activeIcon: HouseFilled,
    enabled: true,
    roles: ['admin', 'principal', 'teacher', 'parent'],
    path: '/mobile/dashboard'
  },
  
  // 管理员和园长 - 数据分析
  {
    id: 'analytics',
    label: '数据分析',
    icon: DataAnalysis,
    activeIcon: DataBoard,
    enabled: true,
    roles: ['admin', 'principal'],
    path: '/mobile/analytics'
  },
  
  // 教师 - 我的班级
  {
    id: 'my-class',
    label: '我的班级',
    icon: School,
    activeIcon: SchoolFilled,
    enabled: true,
    roles: ['teacher'],
    path: '/mobile/my-class',
    badge: 3  // 待处理事项
  },
  
  // 家长 - 我的孩子
  {
    id: 'children',
    label: '我的孩子',
    icon: User,
    activeIcon: UserFilled,
    enabled: true,
    roles: ['parent'],
    path: '/mobile/children'
  },
  
  // 通用 - 日程/活动
  {
    id: 'schedule',
    label: '日程',
    icon: Calendar,
    activeIcon: CalendarFilled,
    enabled: true,
    roles: ['admin', 'principal', 'teacher'],
    path: '/mobile/schedule',
    badge: 2  // 今日待办
  },
  
  // 家长 - 活动
  {
    id: 'activities',
    label: '活动',
    icon: Trophy,
    activeIcon: TrophyFilled,
    enabled: true,
    roles: ['parent', 'teacher'],
    path: '/mobile/activities',
    dot: true  // 新活动提醒
  },
  
  // 通用 - 消息/沟通
  {
    id: 'messages',
    label: '消息',
    icon: ChatDotRound,
    activeIcon: ChatDotSquare,
    enabled: true,
    roles: ['admin', 'principal', 'teacher', 'parent'],
    path: '/mobile/messages',
    badge: 5,  // 未读消息
    badgeType: 'danger'
  },
  
  // 管理员 - 系统管理
  {
    id: 'system',
    label: '系统',
    icon: Tools,
    activeIcon: Tools,
    enabled: true,
    roles: ['admin'],
    path: '/mobile/system'
  },
  
  // 园长 - 管理中心
  {
    id: 'management',
    label: '管理',
    icon: Briefcase,
    activeIcon: Briefcase,
    enabled: true,
    roles: ['principal'],
    path: '/mobile/management',
    badge: 1  // 待审批
  },
  
  // 通用 - 个人中心
  {
    id: 'profile',
    label: '我的',
    icon: User,
    activeIcon: UserFilled,
    enabled: true,
    roles: ['admin', 'principal', 'teacher', 'parent'],
    path: '/mobile/profile'
  }
]

// 计算属性
const tabbarClasses = computed(() => ({
  'tabbar--ios': mobileStore.isIOS,
  'tabbar--android': mobileStore.isAndroid,
  'tabbar--safe-area': mobileStore.hasSafeArea
}))

// 根据用户角色筛选可见的Tabs
const visibleTabs = computed(() => {
  const userRole = userStore.userRole
  const filtered = allTabs.filter(tab => 
    tab.roles.includes(userRole) && tab.enabled
  )
  
  // 限制最多显示5个Tab，确保UI美观
  return filtered.slice(0, 5)
})

// 方法
const handleTabClick = (tab: TabConfig) => {
  if (!tab.enabled || props.activeTab === tab.id) return
  
  // 触觉反馈 (支持的设备)
  if ('vibrate' in navigator) {
    navigator.vibrate(10)
  }
  
  emit('tabChange', tab.id)
}

// 模拟获取动态数据
const updateTabBadges = () => {
  // 这里应该从API获取实际的徽章数据
  // 现在用模拟数据
  const role = userStore.userRole
  
  allTabs.forEach(tab => {
    switch (tab.id) {
      case 'messages':
        // 模拟未读消息数
        tab.badge = Math.floor(Math.random() * 10)
        break
      case 'schedule':
        if (role === 'teacher') {
          // 模拟待办事项
          tab.badge = Math.floor(Math.random() * 5)
        }
        break
      case 'my-class':
        if (role === 'teacher') {
          // 模拟班级待处理事项
          tab.badge = Math.floor(Math.random() * 8)
        }
        break
      case 'activities':
        // 模拟活动提醒
        tab.dot = Math.random() > 0.5
        break
      case 'management':
        if (role === 'principal') {
          // 模拟待审批项目
          tab.badge = Math.floor(Math.random() * 3)
        }
        break
    }
  })
}

// 生命周期
onMounted(() => {
  updateTabBadges()
  
  // 定期更新徽章数据
  const interval = setInterval(updateTabBadges, 30000) // 30秒更新一次
  
  // 清理定时器
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style lang="scss" scoped>
.mobile-tabbar {
  position: relative;
  background: var(--el-bg-color);
  border-top: var(--border-width-base) solid var(--el-border-color-lighter);
  user-select: none;

  // iOS样式适配
  &.tabbar--ios {
    .tabbar__container {
      padding-bottom: var(--spacing-xs);
    }
    
    &.tabbar--safe-area {
      .tabbar__safe-area {
        height: env(safe-area-inset-bottom, 20px);
      }
    }
  }

  // Android样式适配
  &.tabbar--android {
    .tabbar__container {
      padding-bottom: 2px;
    }
    
    .item__indicator {
      display: none; // Android风格不显示指示器
    }
  }
}

.tabbar__container {
  display: flex;
  align-items: center;
  height: 60px;
  padding: var(--spacing-sm) 0;
}

.tabbar__item {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: var(--spacing-xs) var(--spacing-sm);

  // 点击效果
  &:active {
    transform: scale(0.95);
  }

  &.item--active {
    .item__icon {
      color: var(--el-color-primary);
      transform: scale(1.1);
    }
    
    .item__label {
      color: var(--el-color-primary);
      font-weight: 600;
    }
  }

  &.item--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:active {
      transform: none;
    }
  }

  // 图标容器
  .item__icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .item__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-regular);
    transition: all 0.2s ease;
  }

  // 徽章样式
  .item__badge {
    position: absolute;
    top: -var(--spacing-sm);
    right: -var(--spacing-sm);
    z-index: 10;

    :deep(.el-badge__content) {
      font-size: 10px;
      min-width: var(--spacing-md);
      height: var(--spacing-md);
      line-height: var(--spacing-md);
      padding: 0 var(--spacing-xs);
    }
  }

  // 红点提示
  .item__dot {
    position: absolute;
    top: -2px;
    right: -2px;
    width: var(--spacing-sm);
    height: var(--spacing-sm);
    background: var(--el-color-danger);
    border-radius: var(--radius-full);
    border: 2px solid var(--el-bg-color);
  }

  // 标签文字
  .item__label {
    font-size: 1var(--border-width-base);
    color: var(--el-text-color-secondary);
    line-height: 1.2;
    text-align: center;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: all 0.2s ease;
  }

  // 激活状态指示器
  .item__indicator {
    position: absolute;
    bottom: -var(--spacing-sm);
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 3px;
    background: var(--el-color-primary);
    border-radius: 2px;
    animation: slideIn 0.3s ease;
  }
}

// 安全区域
.tabbar__safe-area {
  height: 0;
  background: var(--el-bg-color);
  transition: height 0.2s ease;
}

// 动画效果
@keyframes slideIn {
  from {
    width: 0;
  }
  to {
    width: 20px;
  }
}

// 响应式适配
@media (max-width: 480px) {
  .tabbar__container {
    height: 56px;
    padding: 6px 0;
  }

  .tabbar__item {
    padding: 2px var(--spacing-xs);
    
    .item__label {
      font-size: 10px;
    }
    
    .item__icon {
      :deep(.el-icon) {
        font-size: 22px !important;
      }
    }
  }
}

@media (max-width: 320px) {
  .tabbar__item {
    .item__label {
      font-size: 9px;
    }
    
    .item__icon {
      :deep(.el-icon) {
        font-size: 20px !important;
      }
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .mobile-tabbar {
    border-top-color: var(--el-border-color);
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  .mobile-tabbar {
    border-top-width: 2px;
  }
  
  .tabbar__item {
    .item__label {
      font-weight: 500;
    }
  }
}

// 减少动画模式
@media (prefers-reduced-motion: reduce) {
  .tabbar__item {
    transition: none;
    
    &:active {
      transform: none;
    }
    
    .item__icon,
    .item__label {
      transition: none;
    }
  }
  
  .item__indicator {
    animation: none;
  }
}
</style>