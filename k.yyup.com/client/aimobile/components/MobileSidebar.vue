<!--
  🏫 移动端侧边栏组件
  
  基于 04-组件开发指南.md 的侧边栏设计
  特性：角色权限控制、手势操作、动画效果
-->

<template>
  <div class="mobile-sidebar">
    <!-- 用户信息区域 -->
    <div class="sidebar__user" @click="handleUserClick">
      <div class="user__avatar">
        <el-avatar 
          :size="64" 
          :src="userInfo.avatar"
          :alt="userInfo.name"
        >
          <el-icon><User /></el-icon>
        </el-avatar>
      </div>
      <div class="user__info">
        <h3 class="user__name">{{ userInfo.name }}</h3>
        <p class="user__role">{{ userRoleText }}</p>
        <p class="user__organization">{{ userInfo.organizationName }}</p>
      </div>
      <div class="user__status">
        <el-badge 
          :value="unreadCount" 
          :max="99" 
          :hidden="unreadCount === 0"
        >
          <el-icon class="status-icon" :class="onlineStatusClass">
            <CircleCheck />
          </el-icon>
        </el-badge>
      </div>
    </div>

    <!-- 快捷操作区 -->
    <div class="sidebar__actions">
      <div class="actions__grid">
        <button 
          class="action__item"
          @click="handleQuickAction('scan')"
        >
          <el-icon><Scan /></el-icon>
          <span>扫一扫</span>
        </button>
        <button 
          class="action__item"
          @click="handleQuickAction('ai-chat')"
        >
          <el-icon><ChatRound /></el-icon>
          <span>AI助手</span>
        </button>
        <button 
          class="action__item"
          @click="handleQuickAction('voice')"
        >
          <el-icon><Microphone /></el-icon>
          <span>语音助手</span>
        </button>
        <button 
          class="action__item"
          @click="handleQuickAction('notification')"
        >
          <el-icon><Bell /></el-icon>
          <span>消息</span>
          <el-badge v-if="notificationCount > 0" :value="notificationCount" />
        </button>
      </div>
    </div>

    <!-- 主导航菜单 -->
    <div class="sidebar__menu">
      <div class="menu__section" v-for="section in menuSections" :key="section.id">
        <h4 class="section__title">{{ section.title }}</h4>
        <div class="section__items">
          <div
            v-for="item in section.items"
            :key="item.id"
            class="menu__item"
            :class="{
              'item--active': isActiveMenuItem(item),
              'item--disabled': !item.enabled
            }"
            @click="handleMenuClick(item)"
          >
            <div class="item__content">
              <div class="item__icon">
                <el-icon>
                  <component :is="item.icon" />
                </el-icon>
              </div>
              <div class="item__text">
                <span class="item__title">{{ item.title }}</span>
                <span v-if="item.subtitle" class="item__subtitle">{{ item.subtitle }}</span>
              </div>
              <div v-if="item.badge" class="item__badge">
                <el-badge :value="item.badge" :type="item.badgeType || 'primary'" />
              </div>
              <div v-if="item.hasChildren" class="item__arrow">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
            
            <!-- 子菜单 -->
            <div v-if="item.children && item.expanded" class="item__children">
              <div
                v-for="child in item.children"
                :key="child.id"
                class="menu__child"
                :class="{ 'child--active': isActiveMenuItem(child) }"
                @click.stop="handleMenuClick(child)"
              >
                <div class="child__content">
                  <div class="child__icon">
                    <el-icon>
                      <component :is="child.icon" />
                    </el-icon>
                  </div>
                  <span class="child__title">{{ child.title }}</span>
                  <div v-if="child.badge" class="child__badge">
                    <el-badge :value="child.badge" size="small" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作区 -->
    <div class="sidebar__footer">
      <div class="footer__actions">
        <button class="footer__action" @click="handleSettings">
          <el-icon><Setting /></el-icon>
          <span>设置</span>
        </button>
        <button class="footer__action" @click="handleFeedback">
          <el-icon><ChatDotRound /></el-icon>
          <span>反馈</span>
        </button>
        <button class="footer__action" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <span>退出</span>
        </button>
      </div>
      
      <!-- 版本信息 -->
      <div class="footer__version">
        <span>版本 {{ appVersion }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionsStore } from '@/stores/permissions'
import { useMobileStore } from '../stores/mobile'
import {
  User,
  CircleCheck,
  Scan,
  ChatRound,
  Microphone,
  Bell,
  ArrowRight,
  Setting,
  ChatDotRound,
  SwitchButton,
  // 业务图标
  DataLine,
  Calendar,
  UserFilled,
  School,
  Trophy,
  Service,
  Management,
  DataAnalysis,
  Tools
} from '@element-plus/icons-vue'

// Emits定义
interface Emits {
  menuClick: [item: MenuItem]
  close: []
}

const emit = defineEmits<Emits>()

// 数据
const router = useRouter()
const userStore = useUserStore()
const permissionsStore = usePermissionsStore()
const mobileStore = useMobileStore()

const appVersion = ref('1.0.0')
const unreadCount = ref(5)
const notificationCount = ref(8)

// 计算属性
const userInfo = computed(() => userStore.userInfo)
const userRoleText = computed(() => {
  const roleMap: Record<string, string> = {
    admin: '系统管理员',
    principal: '园长',
    teacher: '教师',
    parent: '家长'
  }
  return roleMap[userStore.userRole] || '用户'
})

const onlineStatusClass = computed(() => ({
  'status-icon--online': userStore.isOnline,
  'status-icon--offline': !userStore.isOnline
}))

// 菜单数据结构
interface MenuItem {
  id: string
  title: string
  subtitle?: string
  icon: any
  path?: string
  badge?: number
  badgeType?: string
  enabled: boolean
  hasChildren?: boolean
  children?: MenuItem[]
  expanded?: boolean
  roles?: string[]
}

// 根据角色生成菜单
const menuSections = computed(() => {
  const role = userStore.userRole
  const sections = []

  // 工作台
  sections.push({
    id: 'workspace',
    title: '工作台',
    items: [
      {
        id: 'dashboard',
        title: '仪表盘',
        subtitle: '数据概览',
        icon: DataLine,
        path: '/mobile/dashboard',
        enabled: true,
        roles: ['admin', 'principal', 'teacher']
      },
      {
        id: 'schedule',
        title: '我的日程',
        subtitle: '今日待办',
        icon: Calendar,
        path: '/mobile/schedule',
        enabled: true,
        badge: 3,
        roles: ['admin', 'principal', 'teacher']
      }
    ]
  })

  // 业务功能 - 根据角色显示
  if (role === 'admin' || role === 'principal') {
    sections.push({
      id: 'management',
      title: '管理中心',
      items: [
        {
          id: 'enrollment',
          title: '招生管理',
          icon: UserFilled,
          path: '/mobile/enrollment',
          enabled: true,
          hasChildren: true,
          children: [
            { id: 'enrollment-plan', title: '招生计划', icon: DataLine, path: '/mobile/enrollment/plan', enabled: true },
            { id: 'enrollment-apply', title: '报名管理', icon: UserFilled, path: '/mobile/enrollment/apply', enabled: true },
            { id: 'enrollment-stats', title: '招生统计', icon: DataAnalysis, path: '/mobile/enrollment/stats', enabled: true }
          ]
        },
        {
          id: 'student',
          title: '学生管理',
          icon: School,
          path: '/mobile/students',
          enabled: true
        },
        {
          id: 'teacher',
          title: '教师管理',
          icon: Management,
          path: '/mobile/teachers',
          enabled: true
        },
        {
          id: 'class',
          title: '班级管理',
          icon: School,
          path: '/mobile/classes',
          enabled: true
        }
      ]
    })
  }

  if (role === 'teacher') {
    sections.push({
      id: 'teaching',
      title: '教学中心',
      items: [
        {
          id: 'my-class',
          title: '我的班级',
          icon: School,
          path: '/mobile/my-class',
          enabled: true
        },
        {
          id: 'students',
          title: '学生管理',
          icon: UserFilled,
          path: '/mobile/students',
          enabled: true
        },
        {
          id: 'activities',
          title: '活动管理',
          icon: Trophy,
          path: '/mobile/activities',
          enabled: true
        }
      ]
    })
  }

  if (role === 'parent') {
    sections.push({
      id: 'parent',
      title: '家长服务',
      items: [
        {
          id: 'children',
          title: '我的孩子',
          icon: UserFilled,
          path: '/mobile/children',
          enabled: true
        },
        {
          id: 'communication',
          title: '家校沟通',
          icon: ChatRound,
          path: '/mobile/communication',
          enabled: true,
          badge: 2
        },
        {
          id: 'growth',
          title: '成长记录',
          icon: Trophy,
          path: '/mobile/growth',
          enabled: true
        }
      ]
    })
  }

  // 系统管理 - 仅管理员可见
  if (role === 'admin') {
    sections.push({
      id: 'system',
      title: '系统管理',
      items: [
        {
          id: 'users',
          title: '用户管理',
          icon: UserFilled,
          path: '/mobile/users',
          enabled: true
        },
        {
          id: 'permissions',
          title: '权限管理',
          icon: Tools,
          path: '/mobile/permissions',
          enabled: true
        },
        {
          id: 'system-settings',
          title: '系统设置',
          icon: Setting,
          path: '/mobile/system-settings',
          enabled: true
        }
      ]
    })
  }

  return sections
})

// 方法
const handleUserClick = () => {
  router.push('/mobile/profile')
  emit('close')
}

const handleQuickAction = (action: string) => {
  switch (action) {
    case 'scan':
      mobileStore.openScanner()
      break
    case 'ai-chat':
      mobileStore.openAiAssistant()
      break
    case 'voice':
      mobileStore.openVoiceAssistant()
      break
    case 'notification':
      router.push('/mobile/notifications')
      break
  }
  emit('close')
}

const isActiveMenuItem = (item: MenuItem) => {
  return router.currentRoute.value.path.startsWith(item.path || '')
}

const handleMenuClick = (item: MenuItem) => {
  if (!item.enabled) return

  if (item.hasChildren) {
    item.expanded = !item.expanded
    return
  }

  if (item.path) {
    router.push(item.path)
    emit('menuClick', item)
    emit('close')
  }
}

const handleSettings = () => {
  router.push('/mobile/settings')
  emit('close')
}

const handleFeedback = () => {
  router.push('/mobile/feedback')
  emit('close')
}

const handleLogout = async () => {
  try {
    await userStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// 生命周期
onMounted(() => {
  // 获取应用版本信息
  appVersion.value = import.meta.env.VITE_APP_VERSION || '1.0.0'
})
</script>

<style lang="scss" scoped>
// 移动端侧边栏主容器 - 独立样式
.mobile-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-card);
  overflow: hidden;
  border-radius: 0 var(--spacing-md) var(--spacing-md) 0;
  box-shadow: 2px 0 12px var(--shadow-light);
}

// 用户信息区域 - 移动端专用样式
.sidebar__user {
  display: flex;
  align-items: center;
  padding: 20px var(--spacing-md);
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 0 0 var(--spacing-md) var(--spacing-md);
  box-shadow: 0 var(--spacing-xs) 12px var(--shadow-light);

  &:active {
    transform: scale(0.98);
  }

  &:hover {
    background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
    transform: translateY(-var(--border-width-base));
    box-shadow: 0 6px var(--spacing-md) rgba(0, 0, 0, 0.15);
  }

  .user__avatar {
    margin-right: 12px;
  }

  .user__info {
    flex: 1;

    .user__name {
      margin: 0 0 var(--spacing-xs) 0;
      font-size: var(--spacing-md);
      font-weight: 600;
    }

    .user__role {
      margin: 0 0 2px 0;
      font-size: 12px;
      opacity: 0.9;
    }

    .user__organization {
      margin: 0;
      font-size: 1var(--border-width-base);
      opacity: 0.8;
    }
  }

  .user__status {
    .status-icon {
      font-size: var(--spacing-md);
      
      &--online {
        color: #67c23a;
      }
      
      &--offline {
        color: #f56c6c;
      }
    }
  }
}

// 快捷操作区 - 移动端专用样式
.sidebar__actions {
  padding: var(--spacing-md);
  border-bottom: var(--border-width-base) solid var(--border-color);
  background: var(--bg-card);

  .actions__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .action__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
    padding: 12px var(--spacing-sm);
    border: none;
    border-radius: 12px;
    background: var(--bg-tertiary);
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    border: var(--border-width-base) solid var(--border-light);

    &:hover {
      background: var(--bg-hover);
      transform: translateY(-2px);
      box-shadow: 0 var(--spacing-xs) 12px var(--shadow-light);
      border-color: var(--primary-color);
    }

    &:active {
      transform: translateY(0);
    }

    .el-icon {
      font-size: 20px;
      color: var(--primary-color);
    }

    span {
      font-size: 12px;
      color: var(--text-primary);
      font-weight: 500;
    }

    .el-badge {
      position: absolute;
      top: var(--spacing-xs);
      right: var(--spacing-xs);
    }
  }
}

// 主导航菜单 - 移动端专用样式
.sidebar__menu {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm) 0;
  background: var(--bg-card);

  // 使用全局极细滚动条样式

  .menu__section {
    margin-bottom: var(--spacing-md);

    .section__title {
      margin: 0 0 var(--spacing-sm) 0;
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: var(--bg-tertiary);
      border-radius: 6px;
      margin: 0 var(--spacing-sm) var(--spacing-sm) var(--spacing-sm);
    }
  }

  .menu__item {
    .item__content {
      display: flex;
      align-items: center;
      padding: 12px var(--spacing-md);
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: var(--spacing-sm);
      margin: 2px var(--spacing-sm);

      &:hover {
        background: var(--bg-hover);
        transform: translateX(var(--spacing-xs));
      }

      &:active {
        background: var(--bg-tertiary);
      }
    }

    &.item--active {
      .item__content {
        background: var(--primary-color);
        border-right: none;
        border-radius: var(--spacing-sm);
        box-shadow: 0 2px var(--spacing-sm) rgba(0, 0, 0, 0.15);

        .item__icon {
          color: white;
        }

        .item__title {
          color: white;
          font-weight: 600;
        }
      }
    }

    &.item--disabled {
      .item__content {
        opacity: 0.5;
        cursor: not-allowed;

        &:hover {
          background: transparent;
        }
      }
    }

    .item__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2var(--spacing-xs);
      height: 2var(--spacing-xs);
      margin-right: 12px;
      font-size: 1var(--spacing-sm);
      color: var(--text-secondary);
      transition: all 0.3s ease;
    }

    .item__text {
      flex: 1;

      .item__title {
        display: block;
        font-size: 1var(--spacing-xs);
        font-weight: 500;
        color: var(--text-primary);
        transition: all 0.3s ease;
      }

      .item__subtitle {
        display: block;
        font-size: 12px;
        color: var(--text-muted);
        margin-top: 2px;
        transition: all 0.3s ease;
      }
    }

    .item__badge {
      margin-right: var(--spacing-sm);
    }

    .item__arrow {
      color: var(--el-text-color-placeholder);
      font-size: 1var(--spacing-xs);
    }

    // 子菜单样式
    .item__children {
      background: var(--el-fill-color-extra-light);
      border-left: 2px solid var(--el-color-primary-light-8);
      margin-left: var(--spacing-md);

      .menu__child {
        .child__content {
          display: flex;
          align-items: center;
          padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) var(--spacing-xl);
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 6px;
          margin: var(--border-width-base) 12px;

          &:hover {
            background: var(--bg-hover);
            transform: translateX(var(--spacing-xs));
          }
        }

        &.child--active {
          .child__content {
            background: var(--secondary-color);
            box-shadow: 0 2px 6px var(--shadow-light);

            .child__icon {
              color: white;
            }

            .child__title {
              color: white;
              font-weight: 600;
            }
          }
        }

        .child__icon {
          width: 20px;
          height: 20px;
          margin-right: var(--spacing-sm);
          font-size: var(--spacing-md);
          color: var(--text-secondary);
          transition: all 0.3s ease;
        }

        .child__title {
          flex: 1;
          font-size: 13px;
          color: var(--text-primary);
          transition: all 0.3s ease;
        }

        .child__badge {
          margin-left: var(--spacing-sm);
        }
      }
    }
  }
}

// 底部操作区 - 移动端专用样式
.sidebar__footer {
  padding: var(--spacing-md);
  border-top: var(--border-width-base) solid var(--border-color);
  background: var(--bg-card);
  border-radius: var(--spacing-md) var(--spacing-md) 0 0;

  .footer__actions {
    display: flex;
    gap: var(--spacing-sm);
    margin-bottom: 12px;

    .footer__action {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-xs);
      padding: 12px var(--spacing-xs);
      border: none;
      border-radius: var(--spacing-sm);
      background: var(--bg-tertiary);
      cursor: pointer;
      transition: all 0.3s ease;
      border: var(--border-width-base) solid var(--border-light);

      &:hover {
        background: var(--bg-hover);
        transform: translateY(-2px);
        box-shadow: 0 var(--spacing-xs) var(--spacing-sm) var(--shadow-light);
      }

      .el-icon {
        font-size: var(--spacing-md);
        color: var(--text-secondary);
      }

      span {
        font-size: 1var(--border-width-base);
        color: var(--text-muted);
        font-weight: 500;
      }
    }
  }

  .footer__version {
    text-align: center;
    padding: var(--spacing-sm);
    background: var(--bg-tertiary);
    border-radius: 6px;

    span {
      font-size: 1var(--border-width-base);
      color: var(--text-disabled);
      font-weight: 500;
    }
  }
}

// 响应式适配 - 移动端专用
@media (max-width: 480px) {
  .mobile-sidebar {
    border-radius: 0;
  }

  .sidebar__user {
    padding: var(--spacing-md) 12px;
    border-radius: 0;
  }

  .sidebar__actions {
    padding: 12px;

    .actions__grid {
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-sm);
    }
  }

  .menu__item .item__content {
    padding: 10px 12px;
    margin: 2px var(--spacing-xs);
  }

  .sidebar__footer {
    padding: 12px;
    border-radius: 0;
  }
}
</style>