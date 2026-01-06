<template>
  <aside
    class="sidebar parent-sidebar glass-effect"
    :class="sidebarClasses"
    id="parent-sidebar"
  >
    <!-- 侧边栏头部 -->
    <div class="sidebar-header" v-show="!collapsed">
      <div class="sidebar-header-content">
        <div class="user-info">
          <div class="user-avatar">
            <img v-if="userAvatar" :src="userAvatar" :alt="userName" />
            <div v-else class="avatar-placeholder">
              {{ userName.charAt(0).toUpperCase() }}
            </div>
          </div>
          <div class="user-details">
            <div class="user-name">{{ userName }}</div>
            <div class="user-role">家长</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导航菜单 - 家长专用5分组静态菜单 -->
    <nav class="sidebar-nav">
      <!-- 动态导航菜单 -->
      <div
        v-for="section in filteredNavigation"
        :key="section.id"
        class="nav-section"
      >
        <div
          class="nav-section-title"
          v-if="!collapsed"
          @click="toggleSection(section.id)"
          :class="{ 'expanded': expandedSections.includes(section.id) }"
        >
          <div class="section-header">
            <div class="section-info">
              <span class="section-name">{{ section.title }}</span>
              <span class="section-desc" v-if="section.description">{{ section.description }}</span>
            </div>
            <div class="section-toggle">
              <span class="toggle-icon">{{ expandedSections.includes(section.id) ? '−' : '+' }}</span>
            </div>
          </div>
        </div>

        <!-- 只有展开状态才显示菜单项 -->
        <template v-if="!collapsed && expandedSections.includes(section.id)">
          <template v-for="item in section.items" :key="item.id">
            <!-- 普通菜单项 -->
            <a
              v-if="!item.children || item.children.length === 0"
              :href="item.route"
              class="nav-item"
              :class="{ 'active': isActiveItem(item) }"
              @click.prevent="handleItemClick(item)"
              :title="collapsed ? item.title : ''"
            >
              <UnifiedIcon
                :name="item.icon || getItemIcon(item.title)"
                :size="20"
                class="nav-icon"
              />
              <span class="nav-text">{{ item.title }}</span>
            </a>

            <!-- 有子菜单的菜单项 -->
            <div v-else class="nav-item-group">
              <a
                :href="item.route"
                class="nav-item nav-item-parent"
                :class="{
                  'active': isActiveItem(item),
                  'expanded': expandedItems.includes(item.id)
                }"
                @click.prevent="handleParentItemClick(item)"
                :title="collapsed ? item.title : ''"
              >
                <UnifiedIcon
                  :name="item.icon || getItemIcon(item.title)"
                  :size="20"
                  class="nav-icon"
                />
                <span class="nav-text">{{ item.title }}</span>
                <UnifiedIcon
                  name="chevron-down"
                  :size="16"
                  class="nav-arrow"
                  :class="{ 'rotated': expandedItems.includes(item.id) }"
                />
              </a>

              <!-- 子菜单 -->
              <div
                v-show="expandedItems.includes(item.id)"
                class="nav-submenu"
              >
                <a
                  v-for="child in item.children"
                  :key="child.id"
                  :href="child.route"
                  class="nav-item nav-item-child"
                  :class="{ 'active': isActiveItem(child) }"
                  @click.prevent="handleItemClick(child)"
                >
                  <UnifiedIcon
                    :name="child.icon || getItemIcon(child.title)"
                    :size="16"
                    class="nav-icon"
                  />
                  <span class="nav-text">{{ child.title }}</span>
                </a>
              </div>
            </div>
          </template>
        </template>
      </div>
    </nav>

    <!-- 底部快捷操作 -->
    <div class="sidebar-footer" v-show="!collapsed">
      <div class="quick-actions">
        <button
          class="quick-action-btn ai-btn"
          @click="openAIAssistant"
          title="AI助手"
        >
          <UnifiedIcon name="message" :size="18" />
        </button>
        <button
          class="quick-action-btn notification-btn"
          @click="openNotifications"
          title="通知"
        >
          <UnifiedIcon name="message" :size="18" />
          <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        </button>
        <button
          class="quick-action-btn settings-btn"
          @click="openSettings"
          title="设置"
        >
          <UnifiedIcon name="settings" :size="18" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import { fixIconName } from '@/config/icon-mapping'

// 💡 静态菜单配置 - 基于家长角色的业务逻辑
interface StaticMenuItem {
  id: string
  title: string
  route: string
  icon: string
  children?: StaticMenuItem[]
}

interface StaticMenuSection {
  id: string
  title: string
  description?: string
  items: StaticMenuItem[]
}

// 💡 静态菜单配置 - 家长角色专用
// 基于家长需求的5分组设计：儿童成长、教育游戏、家园互动、AI助手、个人中心
const STATIC_MENU: StaticMenuSection[] = [
  {
    id: 'child-growth',
    title: '儿童成长',
    description: '孩子信息、成长记录、评估报告等',
    items: [
      {
        id: 'my-children',
        title: '我的孩子',
        route: '/parent-center/children',
        icon: 'user'
      },
      {
        id: 'growth-trajectory',
        title: '成长轨迹',
        route: '/parent-center/children/growth',
        icon: 'trend-charts'
      },
      {
        id: 'assessment-start',
        title: '开始评估',
        route: '/parent-center/assessment/start',
        icon: 'analytics'
      },
      {
        id: 'assessment-doing',
        title: '进行评估',
        route: '/parent-center/assessment/doing',
        icon: 'edit'
      },
      {
        id: 'assessment-report',
        title: '评估报告',
        route: '/parent-center/assessment/report',
        icon: 'document'
      }
    ]
  },
  {
    id: 'educational-games',
    title: '教育游戏',
    description: '益智游戏、学习活动、互动娱乐等',
    items: [
      {
        id: 'games-index',
        title: '游戏大厅',
        route: '/parent-center/games',
        icon: 'activity'
      },
      {
        id: 'game-records',
        title: '游戏记录',
        route: '/parent-center/games/records',
        icon: 'document'
      },
      {
        id: 'game-achievements',
        title: '成就奖励',
        route: '/parent-center/games/achievements',
        icon: 'star'
      },
      {
        id: 'play-animal-observer',
        title: '动物观察员',
        route: '/parent-center/games/play/AnimalObserver',
        icon: 'eye'
      },
      {
        id: 'play-color-sorting',
        title: '颜色分类',
        route: '/parent-center/games/play/ColorSorting',
        icon: 'palette'
      },
      {
        id: 'play-dinosaur-memory',
        title: '恐龙记忆',
        route: '/parent-center/games/play/DinosaurMemory',
        icon: 'brain'
      },
      {
        id: 'play-dollhouse-tidy',
        title: '娃娃屋整理',
        route: '/parent-center/games/play/DollhouseTidy',
        icon: 'home'
      },
      {
        id: 'play-fruit-sequence',
        title: '水果序列',
        route: '/parent-center/games/play/FruitSequence',
        icon: 'activity'
      },
      {
        id: 'play-princess-garden',
        title: '公主花园',
        route: '/parent-center/games/play/PrincessGarden',
        icon: 'flower'
      },
      {
        id: 'play-princess-memory',
        title: '公主记忆',
        route: '/parent-center/games/play/PrincessMemory',
        icon: 'crown'
      },
      {
        id: 'play-robot-factory',
        title: '机器人工厂',
        route: '/parent-center/games/play/RobotFactory',
        icon: 'cpu'
      },
      {
        id: 'play-space-treasure',
        title: '太空宝藏',
        route: '/parent-center/games/play/SpaceTreasure',
        icon: 'rocket'
      }
    ]
  },
  {
    id: 'home-interaction',
    title: '家园互动',
    description: '活动报名、家园沟通、意见反馈等',
    items: [
      {
        id: 'activities',
        title: '活动中心',
        route: '/parent-center/activities',
        icon: 'calendar'
      },
      {
        id: 'smart-hub',
        title: '智能枢纽',
        route: '/parent-center/communication/smart-hub',
        icon: 'message'
      },
      {
        id: 'parent-feedback',
        title: '家长反馈',
        route: '/parent-center/feedback/ParentFeedback',
        icon: 'edit'
      },
      {
        id: 'share-stats',
        title: '分享统计',
        route: '/parent-center/share-stats',
        icon: 'analytics'
      }
    ]
  },
  {
    id: 'ai-assistant',
    title: 'AI助手',
    description: '智能问答、成长建议、学习指导等',
    items: [
      {
        id: 'ai-assistant-index',
        title: 'AI智能助手',
        route: '/parent-center/ai-assistant',
        icon: 'message'
      }
    ]
  },
  {
    id: 'personal-center',
    title: '个人中心',
    description: '家长工作台、个人设置、信息管理等',
    items: [
      {
        id: 'parent-dashboard',
        title: '家长工作台',
        route: '/parent-center/dashboard',
        icon: 'dashboard'
      },
      {
        id: 'profile',
        title: '个人资料',
        route: '/parent-center/profile',
        icon: 'user'
      }
    ]
  }
]

interface Props {
  collapsed?: boolean
  isMobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  isMobile: false
})

const emit = defineEmits<{
  toggle: []
  menuClick: []
  openAIAssistant: []
}>()

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 状态
const activeItemId = ref<string>('')
const expandedItems = ref<string[]>([])
const expandedSections = ref<string[]>([])
const unreadCount = ref(0)

// 计算属性
const sidebarClasses = computed(() => ({
  'sidebar-open': !props.collapsed,
  'collapsed': props.collapsed,
  'show': !props.collapsed && props.isMobile
}))

const userName = computed(() => userStore.userInfo?.realName || userStore.userInfo?.username || '家长')
const userAvatar = computed(() => userStore.userInfo?.avatar || '')

const filteredNavigation = computed(() => {
  // 💡 使用静态菜单配置（基于家长角色的业务逻辑）
  // 静态菜单的优势：
  // 1. 无需每次从数据库读取，提升性能
  // 2. 基于家长实际需求，保证分类合理
  // 3. 不依赖网络请求，避免加载失败
  console.log('✅ [ParentSidebar] 使用静态菜单配置，共', STATIC_MENU.length, '个分组')
  return STATIC_MENU
})

// 使用统一图标系统的图标映射
const getIconByTitle = (title: string): string => {
  const iconMap: Record<string, string> = {
    // 家长专用图标
    '家长工作台': 'dashboard',
    '我的孩子': 'user',
    '成长轨迹': 'trend-charts',
    '开始评估': 'analytics',
    '进行评估': 'edit',
    '评估报告': 'document',
    '游戏大厅': 'activity',
    '游戏记录': 'document',
    '成就奖励': 'star',
    '动物观察员': 'eye',
    '颜色分类': 'palette',
    '恐龙记忆': 'brain',
    '娃娃屋整理': 'home',
    '水果序列': 'activity',
    '公主花园': 'flower',
    '公主记忆': 'crown',
    '机器人工厂': 'cpu',
    '太空宝藏': 'rocket',
    '活动中心': 'calendar',
    '智能枢纽': 'message',
    '家长反馈': 'edit',
    '分享统计': 'analytics',
    'AI智能助手': 'message',
    '个人资料': 'user',

    // 通用图标
    '主页': 'home',
    '仪表板': 'dashboard',
    '数据': 'analytics',
    '用户': 'user',
    '设置': 'settings',
    '帮助': 'view',
    '退出': 'arrow-right'
  }

  return iconMap[title] || 'dashboard'
}

// 方法
const getItemIcon = (title: string): string => {
  const iconName = getIconByTitle(title)
  return fixIconName(iconName)
}

const isActiveItem = (item: any): boolean => {
  return route.path === item.route || activeItemId.value === item.id
}

const handleItemClick = (item: any) => {
  activeItemId.value = item.id

  if (props.isMobile) {
    emit('menuClick')
  }

  router.push(item.route)
  emit('menuClick')
}

const handleParentItemClick = (item: any) => {
  const index = expandedItems.value.indexOf(item.id)
  if (index > -1) {
    expandedItems.value.splice(index, 1)
  } else {
    expandedItems.value.push(item.id)
  }
}

const toggleSection = (sectionId: string) => {
  const index = expandedSections.value.indexOf(sectionId)
  if (index > -1) {
    expandedSections.value.splice(index, 1)
  } else {
    expandedSections.value.push(sectionId)
  }
}

const openAIAssistant = () => {
  emit('openAIAssistant')
  if (props.isMobile) {
    emit('menuClick')
  }
}

const openNotifications = () => {
  router.push('/parent-center/communication/smart-hub')
  if (props.isMobile) {
    emit('menuClick')
  }
}

const openSettings = () => {
  router.push('/parent-center/profile')
  if (props.isMobile) {
    emit('menuClick')
  }
}

// 初始化
onMounted(async () => {
  // 💡 静态菜单模式：无需从数据库获取菜单
  console.log('✅ [ParentSidebar] 静态菜单模式启动')
  console.log('✅ [ParentSidebar] 目录权限：路由守卫 | 按钮权限：角色控制')

  // 默认展开所有section
  if (STATIC_MENU.length > 0) {
    expandedSections.value = STATIC_MENU.map(section => section.id)
  }

  // 模拟获取未读消息数量
  try {
    // const response = await api.get('/parent/notifications/unread-count')
    // unreadCount.value = response.data.count
  } catch (error) {
    console.warn('获取未读消息数量失败:', error)
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/design-tokens.scss' as *;
@use '@/styles/base/variables.scss' as *;

.parent-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: var(--sidebar-width, 280px);
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: var(--z-index-sidebar);
  transition: all var(--transition-normal, 0.3s) ease;
  overflow: hidden;

  &.collapsed {
    width: var(--sidebar-collapsed-width, 80px);

    .sidebar-header .user-details,
    .sidebar-footer,
    .nav-text {
      opacity: 0;
      transform: translateX(-10px);
    }

    .user-avatar {
      margin: 0 auto;
    }

    .nav-arrow {
      opacity: 0;
    }
  }
}

.sidebar-header {
  padding: var(--spacing-xl) var(--spacing-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;

  .user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    color: white;

    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.3);
      overflow: hidden;
      margin-bottom: var(--spacing-sm);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-placeholder {
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-lg);
        font-weight: 600;
        color: white;
      }
    }

    .user-details {
      .user-name {
        font-size: var(--text-lg);
        font-weight: 600;
        margin-bottom: 4px;
        color: white;
      }

      .user-role {
        font-size: var(--text-sm);
        color: rgba(255, 255, 255, 0.8);
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 8px;
        border-radius: 12px;
      }
    }
  }
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-md) 0;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  .nav-section {
    margin-bottom: var(--spacing-sm);

    .nav-section-title {
      padding: var(--spacing-sm) var(--spacing-md);
      transition: all var(--transition-fast);
      cursor: pointer;
      border-radius: var(--radius-md);
      margin: 0 var(--spacing-sm);

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      &.expanded {
        background: rgba(255, 255, 255, 0.15);

        .section-toggle {
          background: rgba(255, 255, 255, 0.2);

          .toggle-icon {
            color: white;
          }
        }
      }

      &:hover .section-toggle {
        background: rgba(255, 255, 255, 0.2);

        .toggle-icon {
          color: white;
        }
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-sm);

        .section-info {
          flex: 1;

          .section-name {
            font-size: var(--text-xs);
            font-weight: 600;
            color: rgba(255, 255, 255, 0.9);
            text-transform: uppercase;
            letter-spacing: var(--letter-spacing-tight);
          }

          .section-desc {
            font-size: var(--text-xs);
            color: rgba(255, 255, 255, 0.6);
            margin-top: var(--spacing-xs);
          }
        }

        .section-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--text-2xl);
          height: var(--text-2xl);
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.1);
          transition: all var(--transition-fast);

          .toggle-icon {
            font-size: var(--text-lg);
            font-weight: 600;
            color: rgba(255, 255, 255, 0.8);
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }
    }
  }
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: var(--spacing-md) var(--spacing-lg);
  margin: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    transform: translateX(4px);
    border-color: rgba(255, 255, 255, 0.2);

    .nav-icon {
      transform: scale(1.1);
      color: #ffd700;
    }
  }

  &.active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 24px;
      background: #ffd700;
      border-radius: 0 2px 2px 0;
    }

    .nav-icon {
      color: #ffd700;
    }
  }

  .nav-icon {
    width: 20px;
    height: 20px;
    margin-right: var(--spacing-md);
    transition: all var(--transition-fast);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333; /* 黑色图标 */
  }

  .nav-text {
    font-size: var(--text-base);
    font-weight: 500;
    transition: all var(--transition-fast);
    white-space: nowrap;
    flex: 1;
    text-align: left;
    color: rgba(255, 255, 255, 0.9);
  }

  .nav-arrow {
    margin-left: auto;
    transition: transform var(--transition-fast);
  }

  &.expanded .nav-arrow {
    transform: rotate(180deg);
  }
}

.nav-submenu {
  padding-left: calc(var(--spacing-lg) + 20px);
  margin-left: 20px;
  border-left: 2px solid rgba(255, 255, 255, 0.2);
  padding-top: var(--spacing-xs);

  .nav-item {
    padding: var(--spacing-sm) var(--spacing-md);
    margin: var(--spacing-xs) 0;
    font-size: var(--text-sm);
    background: rgba(0, 0, 0, 0.1);

    &:hover {
      transform: translateX(2px);
    }

    .nav-text {
      font-size: var(--text-sm);
    }

    .nav-icon {
      width: 16px;
      height: 16px;
    }
  }
}

.sidebar-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);

  .quick-actions {
    display: flex;
    justify-content: space-around;
    gap: var(--spacing-sm);

    .quick-action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      transition: all var(--transition-fast);
      position: relative;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        transform: scale(1.05);
      }

      .notification-badge {
        position: absolute;
        top: -2px;
        right: -2px;
        background: #ff4757;
        color: white;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 10px;
        font-weight: 600;
        min-width: 16px;
        text-align: center;
      }
    }
  }
}

// 移动端适配
@media (max-width: var(--breakpoint-md)) {
  .parent-sidebar {
    transform: translateX(-100%);
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);

    &.show {
      transform: translateX(0);
    }
  }
}

// 玻璃态效果
.glass-effect {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
</style>