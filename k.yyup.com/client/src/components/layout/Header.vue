<template>
  <header class="app-header">
    <!-- 左侧区域 -->
    <div class="header-section header-left">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo-icon">
          <img :src="logoStore.currentLogoUrl" alt="系统 Logo" class="logo-image" />
        </div>
        <span class="logo-text">{{ logoStore.logoText }}</span>
      </div>

      <!-- 侧边栏切换按钮 -->
      <button
        class="header-icon-btn sidebar-toggle"
        @click="handleSidebarToggle"
        :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
      >
        <UnifiedIcon
          name="menu"
          :size="20"
        />
        <span class="sidebar-toggle-text">{{ sidebarCollapsed ? '展开' : '收起' }}侧边栏</span>
      </button>

      <!-- 面包屑导航 -->
      <nav class="breadcrumb-nav">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
        </el-breadcrumb>
      </nav>
    </div>

    <!-- 右侧区域 -->
    <div class="header-section header-right">
      <!-- AI助手按钮 -->
      <div
        class="ai-avatar"
        @click="handleAIAssistantToggle"
        :class="{ 'active': aiAssistantVisible }"
        title="AI助手"
      >
        <span class="ai-text">AI</span>
        <div class="status-dot" :class="aiStatus"></div>
      </div>

      <!-- 通知图标 -->
      <div
        class="notification-bell"
        @click="handleNotificationClick"
        title="通知中心"
      >
        <UnifiedIcon name="bell" :size="20" />
        <span v-if="unreadNotificationCount > 0" class="notification-badge">
          {{ unreadNotificationCount > 99 ? '99+' : unreadNotificationCount }}
        </span>
      </div>

      <!-- 主题选择按钮 -->
      <div class="theme-selector" v-click-outside="closeThemeDropdown">
        <button
          class="header-action-btn theme-btn"
          @click="toggleThemeDropdown"
          :class="{ 'active': showThemeDropdown }"
        >
          <UnifiedIcon
            :name="currentTheme === 'theme-dark' ? 'moon' : 'sun'"
            :size="18"
          />
          <span class="btn-label">主题</span>
        </button>

        <!-- 主题下拉列表 -->
        <transition name="dropdown">
          <div v-if="showThemeDropdown" class="theme-dropdown">
            <div
              v-for="theme in availableThemes"
              :key="theme.value"
              class="theme-option"
              :class="{ active: currentTheme === theme.value }"
              @click="changeTheme(theme.value)"
            >
              <div class="theme-icon" :style="{ '--theme-icon-color': theme.color }">
                <UnifiedIcon
                  :name="getThemeIcon(theme.value)"
                  :size="18"
                />
              </div>
              <span class="theme-name">{{ theme.name }}</span>
            </div>
          </div>
        </transition>
      </div>

      <!-- 用户信息 -->
      <div
        class="user-profile"
        @click="handleUserProfileClick"
        title="个人资料设置"
      >
        <div class="user-avatar">
          <span v-if="userDisplayName">{{ userDisplayName.charAt(0).toUpperCase() }}</span>
          <span v-else>U</span>
        </div>
        <div class="user-details">
          <span class="user-name">{{ userDisplayName || '家长' }}</span>
        </div>
      </div>

      <!-- 退出按钮 -->
      <button
        class="header-action-btn logout-btn"
        @click="handleLogout"
        title="退出登录"
      >
        <UnifiedIcon
          name="close"
          :size="16"
        />
        <span class="btn-label">退出</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAIAssistantStore } from '@/stores/ai-assistant'
import { useLogoStore } from '@/stores/logo'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import { getUnreadNotificationCount } from '@/api/modules/notification'

// Props
interface Props {
  sidebarCollapsed?: boolean
  isMobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sidebarCollapsed: false,
  isMobile: false
})

// Emits
interface Emits {
  (e: 'toggle-sidebar'): void
  (e: 'toggle-ai-assistant'): void
  (e: 'user-profile-click'): void
  (e: 'logout'): void
}

const emit = defineEmits<Emits>()

// 路由和状态
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const aiStore = useAIAssistantStore()
const logoStore = useLogoStore()

// 未读通知数量
const unreadNotificationCount = ref(0)

// 加载 Logo 配置
onMounted(() => {
  logoStore.loadLogoConfig()
  // 获取未读通知数量
  fetchUnreadNotificationCount()
})

// 下拉菜单状态
const showThemeDropdown = ref(false)

// 主题相关
const currentTheme = ref('theme-light')
const availableThemes = ref([
  { name: '明亮主题', value: 'theme-light', color: '#f59e0b', icon: 'sun' },
  { name: '暗黑主题', value: 'theme-dark', color: '#6366f1', icon: 'moon' }
])

// AI助手状态
const aiAssistantVisible = computed({
  get: () => aiStore.panelVisible,
  set: (value: boolean) => {
    if (value) {
      aiStore.showPanel()
    } else {
      aiStore.hidePanel()
    }
  }
})

const aiStatus = computed(() => {
  if (aiStore.panelVisible) return 'active'
  return 'idle'
})

// 计算属性
const currentPageTitle = computed(() => {
  const pathMap: Record<string, string> = {
    // 工作台
    '/dashboard': '数据概览',
    '/dashboard/schedule': '日程管理',
    '/dashboard/important-notices': '消息通知',
    '/dashboard/campus-overview': '园区概览',
    '/dashboard/data-statistics': '数据统计',

    // 招生管理
    '/enrollment-plan': '招生计划',
    '/enrollment': '招生活动',
    '/enrollment-plan/statistics': '招生统计',
    '/enrollment-plan/quota-manage': '名额管理',

    // 中心页面
    '/centers/dashboard': '仪表板中心',
    '/centers/personnel': '人事中心',
    '/centers/activity': '活动中心',
    '/centers/enrollment': '招生中心',
    '/centers/marketing': '营销中心',
    '/centers/ai': 'AI中心',
    '/centers/system': '系统中心',

    // 客户管理
    '/customer': '客户列表',
    '/principal/customer-pool': '客户池',

    // 学生管理
    '/student': '学生管理',
    '/class': '班级管理',
    '/application': '入园申请',

    // 活动管理
    '/activity': '活动列表',
    '/activity/create': '创建活动',
    '/principal/activities': '园长活动',

    // 家长服务
    '/parent': '家长列表',
    '/parent/children': '孩子列表',

    // 教师管理
    '/teacher': '教师列表',

    // 营销管理
    '/marketing': '营销管理',
    '/marketing/coupons': '优惠券管理',
    '/marketing/consultations': '咨询管理',
    '/marketing/intelligent-engine/marketing-engine': '智能营销引擎',

    // 营销工具
    '/principal/poster-editor': '海报编辑',
    '/principal/poster-generator': '海报生成器',
    '/chat': '在线咨询',
    '/ai': 'AI助手',

    // AI相关页面
    '/ai/query': 'AI智能查询',
    '/ai/model': 'AI模型管理',
    '/ai-services': 'AI服务',
    '/ai-services/ExpertConsultationPage': '专家咨询',
    '/ai-center/expert-consultation': 'AI专家咨询',

    // 数据分析
    '/statistics': '统计报表',
    '/principal/performance': '绩效管理',
    '/principal/marketing-analysis': '经营分析',
    '/principal/dashboard': '园长仪表盘',
    '/principal/intelligent-dashboard': '智能决策支持',
    '/principal/basic-info': '基本资料',

    '/principal/PosterGenerator': '海报生成器',
    '/principal/PosterTemplates': '海报模板',
    '/principal/PosterEditor': '海报编辑器',

    // 系统管理
    '/system': '系统设置',
    '/system/users': '用户管理',
    '/system/roles': '角色管理',
    '/system/permissions': '权限管理',
    '/system/logs': '系统日志',
    '/system/backup': '数据备份',
    '/system/settings': '系统配置',
    '/system/ai-model-config': 'AI模型配置'
  }

  // 精确匹配
  if (pathMap[route.path]) {
    return pathMap[route.path]
  }

  // 模糊匹配
  for (const [key, value] of Object.entries(pathMap)) {
    if (route.path.startsWith(key)) {
      return value
    }
  }

  return '当前页面'
})

const userDisplayName = computed(() => {
  const role = userStore.userInfo?.role
  if (role === 'parent' || role === '家长') {
    return userStore.userInfo?.realName || userStore.userInfo?.username || '家长'
  }
  return userStore.userInfo?.realName || userStore.userInfo?.username || '管理员'
})

// HTMLElement 扩展接口，用于 v-click-outside 指令
interface HTMLElementWithClickOutside extends HTMLElement {
  _clickOutside?: (event: MouseEvent) => void
}

// v-click-outside 指令
const vClickOutside = {
  mounted(el: HTMLElementWithClickOutside, binding: any) {
    el._clickOutside = (event: MouseEvent) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el: HTMLElementWithClickOutside) {
    if (el._clickOutside) {
      document.removeEventListener('click', el._clickOutside)
    }
  }
}

// 方法
const handleSidebarToggle = () => {
  emit('toggle-sidebar')
}

const handleAIAssistantToggle = () => {
  emit('toggle-ai-assistant')
}

const handleUserProfileClick = () => {
  emit('user-profile-click')
}

const handleLogout = () => {
  emit('logout')
}

// 通知点击处理
const handleNotificationClick = () => {
  router.push('/notifications')
}

// 获取未读通知数量
const fetchUnreadNotificationCount = async () => {
  try {
    const res = await getUnreadNotificationCount()
    if (res && res.data) {
      unreadNotificationCount.value = res.data.unread_count || 0
    }
  } catch (error) {
    console.warn('获取未读通知数量失败:', error)
    unreadNotificationCount.value = 0
  }
}

// 主题切换功能
const toggleThemeDropdown = () => {
  showThemeDropdown.value = !showThemeDropdown.value
}

const closeThemeDropdown = () => {
  showThemeDropdown.value = false
}

// 获取主题图标 - 使用全局统一图标
const getThemeIcon = (themeValue: string) => {
  const iconMap: Record<string, string> = {
    'theme-light': 'sun',
    'theme-dark': 'moon'
  }
  return iconMap[themeValue] || 'sun'
}

const changeTheme = (theme: string) => {
  currentTheme.value = theme
  showThemeDropdown.value = false

  // 移除所有旧的主题类和属性
  const allThemeClasses = [
    'theme-light', 'theme-dark', 'theme-custom',
    'default-theme', 'dark-theme', 'custom-theme',
    'glassmorphism-theme', 'cyberpunk-theme', 'nature-theme',
    'ocean-theme', 'sunset-theme', 'midnight-theme',
    'glass-light', 'glass-dark', 'glass-neon', 'glass-gradient',
    'el-theme-dark'
  ]
  document.documentElement.classList.remove(...allThemeClasses)
  document.body.classList.remove(...allThemeClasses)

  // 移除旧的 data-theme 属性
  document.documentElement.removeAttribute('data-theme')
  document.body.removeAttribute('data-theme')

  // 根据主题类型设置 data-theme 属性
  // CSS 选择器 [data-theme="xxx"] 会自动应用正确的变量
  switch (theme) {
    case 'theme-dark':
      // 暗黑主题 - 设置 data-theme="dark" 来触发 design-tokens.scss 中的样式
      document.documentElement.setAttribute('data-theme', 'dark')
      document.body.setAttribute('data-theme', 'dark')
      document.body.classList.add('theme-dark')
      document.body.classList.add('el-theme-dark')
      break

    case 'theme-light':
    default:
      // 明亮主题（默认）- 设置 data-theme="light"
      document.documentElement.setAttribute('data-theme', 'light')
      document.body.setAttribute('data-theme', 'light')
      document.body.classList.add('theme-light')
      break
  }

  // 持久化主题设置
  localStorage.setItem('app-theme', theme)
  localStorage.setItem('app_theme', theme)
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.theme-selector')) {
    showThemeDropdown.value = false
  }
}

// 生命周期
onMounted(() => {
  // 恢复主题设置
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme && availableThemes.value.some(t => t.value === savedTheme)) {
    changeTheme(savedTheme)
  } else {
    changeTheme('theme-light')
  }

  // 监听点击外部关闭下拉菜单
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
// 使用全局头部样式
@use '@/styles/components/header.scss';

// 头部操作按钮统一样式
.header-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary, #606266);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  // 悬停光效
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(circle, var(--primary-color, #6366f1) 0%, transparent 70%);
    opacity: 0;
    transform: translate(-50%, -50%);
    transition: all 0.4s ease-out;
    border-radius: 50%;
  }

  &:hover {
    background: var(--bg-tertiary, #f5f7fa);
    color: var(--primary-color, #6366f1);
    border-color: var(--border-primary, #dcdfe6);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);

    &::before {
      width: 150px;
      height: 150px;
      opacity: 0.15;
    }

    .unified-icon {
      transform: scale(1.1) rotate(5deg);
    }
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  &.active {
    background: var(--primary-color, #6366f1);
    color: #fff;
    border-color: var(--primary-color, #6366f1);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  .unified-icon {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: center;
  }

  .btn-label {
    transition: all 0.3s ease;
  }
}

// 主题按钮特殊动画
.theme-btn {
  .unified-icon {
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &:hover .unified-icon {
    transform: rotate(180deg) scale(1.15);
  }

  // 太阳转月亮动画
  &:has(.icon-sun):hover .unified-icon {
    animation: sunToMoon 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  // 月亮转太阳动画
  &:has(.icon-moon):hover .unified-icon {
    animation: moonToSun 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

@keyframes sunToMoon {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(90deg) scale(0.5);
    opacity: 0.5;
  }
  100% {
    transform: rotate(180deg) scale(1);
    opacity: 1;
  }
}

@keyframes moonToSun {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(-90deg) scale(0.5);
    opacity: 0.5;
  }
  100% {
    transform: rotate(-180deg) scale(1);
    opacity: 1;
  }
}

// 通知图标样式
.notification-bell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--text-secondary);

  // 悬停波纹效果
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    background: var(--primary-color);
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.3s ease;
    z-index: -1;
  }

  &:hover {
    background: var(--bg-tertiary, #f5f7fa);
    color: var(--primary-color, #6366f1);
    transform: translateY(-2px);

    &::after {
      opacity: 0.1;
      transform: scale(1);
    }

    .unified-icon {
      animation: bellShake 0.5s ease-in-out;
    }
  }

  .unified-icon {
    transition: all 0.3s ease;
  }

  .notification-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    font-size: 11px;
    font-weight: 600;
    line-height: 18px;
    text-align: center;
    color: #fff;
    background: var(--danger-color, #f56c6c);
    border-radius: 9px;
    transform: scale(0.9);
    box-shadow: 0 2px 6px rgba(245, 108, 108, 0.4);
    animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

@keyframes bellShake {
  0%, 100% { transform: rotate(0); }
  20% { transform: rotate(-15deg); }
  40% { transform: rotate(15deg); }
  60% { transform: rotate(-10deg); }
  80% { transform: rotate(10deg); }
}

@keyframes badgePop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(0.9); }
}

// AI头像样式优化
.ai-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary-color, #6366f1) 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
  }

  &.active {
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3), 0 6px 20px rgba(99, 102, 241, 0.4);
  }

  .ai-text {
    color: #fff;
    font-size: 14px;
    font-weight: 600;
  }

  .status-dot {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 2px solid #fff;

    &.idle {
      background: #22c55e;
    }

    &.active {
      background: #f59e0b;
      animation: statusPulse 2s ease-in-out infinite;
    }
  }
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.2); }
}

// 用户信息样式优化
.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 6px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: var(--bg-tertiary, #f5f7fa);

    .user-avatar {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    }
  }

  .user-avatar {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: linear-gradient(135deg, var(--primary-color, #6366f1) 0%, #8b5cf6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .user-details {
    .user-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary, #303133);
    }
  }
}

// 侧边栏切换按钮样式
.sidebar-toggle {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
  color: var(--text-secondary, #606266);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;

  &:hover {
    background: var(--bg-tertiary, #f5f7fa);
    color: var(--primary-color, #6366f1);
    transform: translateY(-2px);

    .unified-icon {
      transform: scale(1.1);
    }
  }

  .unified-icon {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
  }

  .sidebar-toggle-text {
    font-size: 13px;
    font-weight: 500;
    display: inline-block;
  }
}

// 固定定位样式
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-header, 1030);
}

// 下拉菜单动画
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}

// Logo区域样式
.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 10px;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-tertiary, #f5f7fa);
  }

  .logo-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary, #ffffff);

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    }

    .logo-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
  }

  .logo-text {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary, #303133);
  }
}

// 面包屑导航优化
.breadcrumb-nav {
  :deep(.el-breadcrumb) {
    .el-breadcrumb__inner {
      color: var(--text-secondary, #606266);
      font-size: 13px;
      transition: all 0.3s ease;

      &:hover {
        color: var(--primary-color, #6366f1);
      }

      &.is-link:hover {
        color: var(--primary-color, #6366f1);
      }
    }

    .el-breadcrumb__item:last-child .el-breadcrumb__inner {
      color: var(--text-primary, #303133);
      font-weight: 500;
    }

    .el-breadcrumb__separator {
      color: var(--text-tertiary, #909399);
    }
  }
}

// 主题下拉菜单样式
.theme-dropdown {
  background: var(--bg-elevated, #fff);
  border: 1px solid var(--border-primary, #dcdfe6);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 8px;
  min-width: 180px;

  .theme-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--bg-tertiary, #f5f7fa);
      transform: translateX(4px);
    }

    &.active {
      background: var(--primary-color, #6366f1);
      color: #fff;

      .theme-icon {
        color: #fff;
      }
    }

    .theme-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-tertiary, #f5f7fa);
      color: var(--text-secondary, #606266);
      transition: all 0.3s ease;
    }

    .theme-name {
      font-size: 13px;
      font-weight: 500;
    }
  }
}

// 退出按钮样式
.logout-btn {
  &:hover {
    background: rgba(245, 108, 108, 0.1);
    color: var(--danger-color, #f56c6c);
    border-color: var(--danger-color, #f56c6c);

    &::before {
      background: radial-gradient(circle, var(--danger-color, #f56c6c) 0%, transparent 70%);
    }
  }
}
</style>