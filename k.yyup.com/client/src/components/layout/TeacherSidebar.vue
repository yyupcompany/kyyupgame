<template>
  <aside
    class="sidebar teacher-sidebar glass-effect"
    :class="sidebarClasses"
    id="teacher-sidebar"
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
            <div class="user-role">教师</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导航菜单 - 教师专用5分组静态菜单 -->
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

// 💡 静态菜单配置 - 基于教师角色的业务逻辑
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

// 💡 静态菜单配置 - 教师角色专用
// 基于教师工作流程的5分组设计：教学工作、学生管理、客户管理、任务协作、工作台
const STATIC_MENU: StaticMenuSection[] = [
  {
    id: 'teaching-work',
    title: '教学工作',
    description: '课程设计、教学资源、创意课程等教学活动',
    items: [
      {
	        id: 'creative-curriculum',
	        title: '互动AI课程',
        route: '/teacher-center/creative-curriculum',
        icon: 'edit'
      },
      {
        id: 'interactive-curriculum',
	        title: 'AI课程生成器',
        route: '/teacher-center/creative-curriculum/interactive',
        icon: 'video'
      },
      {
        id: 'teaching-record',
        title: '教学记录',
        route: '/teacher-center/teaching/teaching-record',
        icon: 'book'
      },
      {
        id: 'teaching-progress',
        title: '教学进度',
        route: '/teacher-center/teaching/teaching-progress',
        icon: 'analytics'
      }
    ]
  },
  {
    id: 'student-management',
    title: '学生管理',
    description: '学生信息、考勤管理、活动组织等',
    items: [
      {
        id: 'student-attendance',
        title: '学生考勤',
        route: '/teacher-center/attendance/student-attendance',
        icon: 'clock'
      },
      {
        id: 'teacher-checkin',
        title: '教师签到',
        route: '/teacher-center/attendance/teacher-check-in',
        icon: 'check'
      },
      {
        id: 'my-activities',
        title: '我的活动',
        route: '/teacher-center/activities/my-activities',
        icon: 'calendar'
      },
      {
        id: 'activity-calendar',
        title: '活动日历',
        route: '/teacher-center/activities/activity-calendar',
        icon: 'calendar'
      },
      {
        id: 'student-management',
        title: '学生管理',
        route: '/teacher-center/teaching/student-management',
        icon: 'user'
      }
    ]
  },
  {
    id: 'customer-management',
    title: '客户管理',
    description: '客户跟进、招生管理、沟通记录等',
    items: [
      {
        id: 'customer-tracking',
        title: '客户跟进',
        route: '/teacher-center/customer-tracking',
        icon: 'phone'
      },
      {
        id: 'customer-list',
        title: '客户列表',
        route: '/teacher-center/customer-tracking/customer-list',
        icon: 'user-group'
      },
      {
        id: 'customer-statistics',
        title: '客户统计',
        route: '/teacher-center/customer-tracking/data-statistics',
        icon: 'analytics'
      },
      {
        id: 'enrollment-management',
        title: '招生管理',
        route: '/teacher-center/enrollment',
        icon: 'user-plus'
      },
      {
        id: 'customer-pool',
        title: '客户池',
        route: '/teacher-center/customer-pool',
        icon: 'users'
      }
    ]
  },
  {
    id: 'task-collaboration',
    title: '任务协作',
    description: '任务分配、预约管理、班级联络等',
    items: [
      {
        id: 'task-management',
        title: '任务管理',
        route: '/teacher-center/tasks',
        icon: 'task'
      },
      {
        id: 'task-overview',
        title: '任务概览',
        route: '/teacher-center/tasks/index',
        icon: 'grid'
      },
      {
        id: 'appointment-management',
        title: '预约管理',
        route: '/teacher-center/appointment-management',
        icon: 'calendar'
      },
      {
        id: 'class-contacts',
        title: '班级联络',
        route: '/teacher-center/class-contacts',
        icon: 'message'
      }
    ]
  },
  {
    id: 'dashboard',
    title: '工作台',
    description: '教师工作台、数据统计、个人设置等',
    items: [
      {
        id: 'teacher-dashboard',
        title: '教师工作台',
        route: '/teacher-center/dashboard',
        icon: 'dashboard'
      },
      {
        id: 'notifications',
        title: '通知公告',
        route: '/teacher-center/notifications',
        icon: 'message'
      },
      {
        id: 'statistics',
        title: '数据统计',
        route: '/teacher-center/attendance/statistics',
        icon: 'analytics'
      },
      {
        id: 'attendance-history',
        title: '考勤历史',
        route: '/teacher-center/attendance/attendance-history',
        icon: 'clock'
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

const userName = computed(() => userStore.userInfo?.realName || userStore.userInfo?.username || '教师')
const userAvatar = computed(() => userStore.userInfo?.avatar || '')

const filteredNavigation = computed(() => {
  // 💡 使用静态菜单配置（基于教师角色的业务逻辑）
  // 静态菜单的优势：
  // 1. 无需每次从数据库读取，提升性能
  // 2. 基于教师实际工作流程，保证分类合理
  // 3. 不依赖网络请求，避免加载失败
  console.log('✅ [TeacherSidebar] 使用静态菜单配置，共', STATIC_MENU.length, '个分组')
  return STATIC_MENU
})

// 使用统一图标系统的图标映射
const getIconByTitle = (title: string): string => {
  const iconMap: Record<string, string> = {
    // 教师专用图标
    '教师工作台': 'dashboard',
	    '互动AI课程': 'edit',
	    'AI课程生成器': 'video',
    '教学记录': 'book',
    '教学进度': 'analytics',
    '学生考勤': 'clock',
    '教师签到': 'check',
    '我的活动': 'calendar',
    '活动日历': 'calendar',
    '学生管理': 'user',
    '客户跟进': 'phone',
    '客户列表': 'user-group',
    '客户统计': 'analytics',
    '招生管理': 'user-plus',
    '客户池': 'users',
    '任务管理': 'task',
    '任务概览': 'grid',
    '预约管理': 'calendar',
    '班级联络': 'message',
    '通知公告': 'message',
    '数据统计': 'analytics',
    '考勤历史': 'clock',

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
  router.push('/teacher-center/notifications')
  if (props.isMobile) {
    emit('menuClick')
  }
}

const openSettings = () => {
  router.push('/teacher-center/dashboard')
  if (props.isMobile) {
    emit('menuClick')
  }
}

// 初始化
onMounted(async () => {
  // 💡 静态菜单模式：无需从数据库获取菜单
  console.log('✅ [TeacherSidebar] 静态菜单模式启动')
  console.log('✅ [TeacherSidebar] 目录权限：路由守卫 | 按钮权限：角色控制')

  // 默认展开所有section
  if (STATIC_MENU.length > 0) {
    expandedSections.value = STATIC_MENU.map(section => section.id)
  }

  // 模拟获取未读消息数量
  try {
    // const response = await api.get('/teacher/notifications/unread-count')
    // unreadCount.value = response.data.count
  } catch (error) {
    console.warn('获取未读消息数量失败:', error)
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/design-tokens.scss' as *;
@use '@/styles/base/variables.scss' as *;

.teacher-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: var(--sidebar-width, 280px);
  height: 100vh;
  background: linear-gradient(135deg, #2D3748 0%, #4A5568 50%, #2B6CB0 100%);
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
        background: rgba(59, 130, 246, 0.2);
        padding: 2px 8px;
        border-radius: 12px;
        border: 1px solid rgba(59, 130, 246, 0.3);
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
      color: #60A5FA; /* 蓝色hover状态 */
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
      background: #60A5FA;
      border-radius: 0 2px 2px 0;
    }

    .nav-icon {
      color: #60A5FA;
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
        background: #EF4444;
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
  .teacher-sidebar {
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