<template>
  <div class="app-container cls-final-fix-2025 cls-ultimate-fix-2025 cls-performance-fix">
    <!-- 移动端遮罩层 -->
    <div
      v-if="isMobile && !sidebarCollapsed"
      class="mobile-overlay"
      @click="toggleSidebar"
    ></div>

    <!-- 头部插槽 -->
    <slot name="header">
      <!-- 默认头部组件 -->
      <Header
        :sidebar-collapsed="sidebarCollapsed"
        :is-mobile="isMobile"
        @toggle-sidebar="toggleSidebar"
        @toggle-ai-assistant="toggleAIAssistant"
        @user-profile-click="openUserProfile"
        @logout="handleLogout"
      />
    </slot>

    <!-- 主布局区域 -->
    <div class="main-layout-area">
      <!-- 左侧侧边栏插槽 -->
      <aside class="sidebar-slot" :class="{ 'collapsed': sidebarCollapsed }">
        <!-- 根据用户角色显示不同的侧边栏 -->
        <ParentCenterSidebar
          v-if="userRole === 'parent'"
          :collapsed="sidebarCollapsed"
          :is-mobile="isMobile"
        />
        <TeacherCenterSidebar
          v-else-if="userRole === 'teacher'"
          :collapsed="sidebarCollapsed"
          :is-mobile="isMobile"
        />
        <CentersSidebar
          v-else
          :collapsed="sidebarCollapsed"
          :is-mobile="isMobile"
        />
      </aside>

      <!-- 主内容区域插槽 -->
      <main class="content-slot" :class="{
        'sidebar-expanded': !sidebarCollapsed,
        'ai-sidebar-open': aiAssistantVisible
      }">
        <router-view />
      </main>
    </div>

    <!-- 测试组件 (仅开发环境) - 暂时禁用以避免覆盖AI窗口 -->
    <!-- <RoleSwitcher v-if="isDevelopment" /> -->
    <!-- <PerformanceMonitor v-model="showPerformanceMonitor" v-if="isDevelopment" /> -->
    <!-- <MobileTestSuite v-model="showMobileTestSuite" v-if="isDevelopment" /> -->

    <!-- AI助手侧边栏（插槽模式） -->
    <div v-if="aiAssistantVisible" class="ai-sidebar-slot">
      <AIAssistant
        v-model:visible="aiAssistantVisible"
        :mode="aiAssistantMode"
        @update:visible="handleAIVisibilityChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'

import CentersSidebar from '../components/sidebar/CentersSidebar.vue'
import TeacherCenterSidebar from '../components/sidebar/TeacherCenterSidebar.vue'
import ParentCenterSidebar from '../components/sidebar/ParentCenterSidebar.vue'
import Header from '../components/layout/Header.vue'
import { useAIAssistantStore } from '../stores/ai-assistant'
import AIAssistant from '@/components/ai-assistant/AIAssistant.vue'
import { useIconSystemStore } from '../stores/icon-system'

// Document 接口扩展，支持浏览器全屏 API 的非标准属性
interface DocumentWithFullscreen extends Document {
  webkitFullscreenElement?: Element
  msFullscreenElement?: Element
  webkitExitFullscreen?: () => Promise<void>
  msExitFullscreen?: () => Promise<void>
}

// HTMLElement 接口扩展，支持全屏 API
interface HTMLElementWithFullscreen extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>
  msRequestFullscreen?: () => Promise<void>
}

// 获取扩展后的 document 和 documentElement
const documentExt = document as DocumentWithFullscreen
const documentElementExt = document.documentElement as HTMLElementWithFullscreen

import { mobileNavigationManager, touchOptimizer } from '../utils/navigation-fix'

// 路由和状态
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const aiStore = useAIAssistantStore()

// 图标系统状态
const iconSystemStore = useIconSystemStore()

// 提供图标系统给子组件
provide('iconSystem', computed(() => iconSystemStore.currentSystem))



// 测试组件状态
const showRoleSwitcher = ref(false)
const showPerformanceMonitor = ref(false)
const showMobileTestSuite = ref(false)

// 开发环境检查
const isDevelopment = computed(() => {
  return process.env.NODE_ENV === 'development' ||
         window.location.hostname === 'localhost' ||
         window.location.search.includes('debug=true')
})

// 响应式状态
const sidebarCollapsed = ref(window.innerWidth < 640)
const windowWidth = ref(window.innerWidth)
const isFullscreen = ref(false)

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

// AI助手显示模式：sidebar（侧边栏）或 fullpage（全屏）
const aiAssistantMode = ref<'sidebar' | 'fullpage'>('sidebar')

// 计算属性
const isMobile = computed(() => windowWidth.value < 640)

// const currentPageTitle = computed(() => {
//   const pathMap: Record<string, string> = {
//     // 工作台
//     '/dashboard': '数据概览',
//     '/dashboard/schedule': '日程管理',
//     '/dashboard/important-notices': '消息通知',
//     '/dashboard/campus-overview': '园区概览',
//     '/dashboard/data-statistics': '数据统计',

//     // 招生管理
//     '/enrollment-plan': '招生计划',
//     '/enrollment': '招生活动',
//     '/enrollment-plan/statistics': '招生统计',
//     '/enrollment-plan/quota-manage': '名额管理',

//     // 中心页面
//     '/centers/dashboard': '仪表板中心',
//     '/centers/personnel': '人事中心',
//     '/centers/activity': '活动中心',
//     '/centers/enrollment': '招生中心',
//     '/centers/marketing': '营销中心',
//     '/centers/ai': 'AI中心',
//     '/centers/system': '系统中心',

//     // 客户管理
//     '/customer': '客户列表',
//     '/principal/customer-pool': '客户池',

//     // 学生管理
//     '/student': '学生管理',
//     '/class': '班级管理',
//     '/application': '入园申请',

//     // 活动管理
//     '/activity': '活动列表',
//     '/activity/create': '创建活动',
//     '/principal/activities': '园长活动',

//     // 家长服务
//     '/parent': '家长列表',
//     '/parent/children': '孩子列表',

//     // 教师管理
//     '/teacher': '教师列表',

//     // 营销管理
//     '/marketing': '营销管理',
//     '/marketing/coupons': '优惠券管理',
//     '/marketing/consultations': '咨询管理',
//     '/marketing/intelligent-engine/marketing-engine': '智能营销引擎',

//     // 营销工具
//     '/principal/poster-editor': '海报编辑',
//     '/principal/poster-generator': '海报生成器',
//     '/chat': '在线咨询',
//     '/ai': 'AI助手',

//     // AI相关页面
//     '/ai/query': 'AI智能查询',
//     '/ai/model': 'AI模型管理',
//     '/ai-services': 'AI服务',
//     '/ai-services/ExpertConsultationPage': '专家咨询',

//     '/ai-center/expert-consultation': 'AI专家咨询',

//     // 数据分析
//     '/statistics': '统计报表',
//     '/principal/performance': '绩效管理',
//     '/principal/marketing-analysis': '经营分析',
//     '/principal/dashboard': '园长仪表盘',
//     '/principal/intelligent-dashboard': '智能决策支持',
//     '/principal/basic-info': '基本资料',

//     '/principal/PosterGenerator': '海报生成器',
//     '/principal/PosterTemplates': '海报模板',
//     '/principal/PosterEditor': '海报编辑器',

//     // 系统管理
//     '/system': '系统设置',
//     '/system/users': '用户管理',
//     '/system/roles': '角色管理',
//     '/system/permissions': '权限管理',
//     '/system/logs': '系统日志',
//     '/system/backup': '数据备份',
//     '/system/settings': '系统配置',
//     '/system/ai-model-config': 'AI模型配置'
//   }

//   // 精确匹配
//   if (pathMap[route.path]) {
//     return pathMap[route.path]
//   }

//   // 模糊匹配
//   for (const [key, value] of Object.entries(pathMap)) {
//     if (route.path.startsWith(key)) {
//       return value
//     }
//   }

//   return '当前页面'
// })

// const userDisplayName = computed(() => {
//   // 根据用户角色显示不同的名称
//   const role = userStore.userInfo?.role
//   if (role === 'parent' || role === '家长') {
//     return userStore.userInfo?.realName || userStore.userInfo?.username || '家长'
//   }
//   return userStore.userInfo?.realName || userStore.userInfo?.username || '管理员'
// })

const userRole = computed(() => {
  // 获取用户角色，优先使用 role 字段，如果不存在则使用 roles 数组的第一个元素的 code
  const userInfo = userStore.userInfo
  if (!userInfo) return 'user'
  
  if (userInfo.role) {
    return typeof userInfo.role === 'string' ? userInfo.role : userInfo.role
  }
  
  if (userInfo.roles && userInfo.roles.length > 0) {
    const firstRole = userInfo.roles[0]
    if (typeof firstRole === 'string') {
      return firstRole
    }
    // 确保 firstRole是对象类型后再访问.code
    return (firstRole as any).code || 'user'
  }
  
  return 'user'
})

// const userRoleDisplay = computed(() => {
//   const roleMap: Record<string, string> = {
//     'admin': '系统管理员',
//     'ADMIN': '系统管理员',
//     'super_admin': '超级管理员',
//     'SUPER_ADMIN': '超级管理员',
//     'teacher': '教师',
//     'TEACHER': '教师',
//     'principal': '园长',
//     'PRINCIPAL': '园长',
//     'parent': '家长',
//     'PARENT': '家长',
//     'user': '普通用户',
//     'USER': '普通用户'
//   }

//   return roleMap[userRole.value] || roleMap['user']
// })

// 方法
const toggleSidebar = () => {
  if (isMobile.value) {
    // 移动端使用导航管理器
    mobileNavigationManager.toggleSidebar()
  } else {
    // 桌面端传统方式
    sidebarCollapsed.value = !sidebarCollapsed.value
    // 持久化侧边栏状态
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed.value))
  }
}

// // 处理侧边栏菜单点击
// const handleSidebarMenuClick = () => {
//   // 移动端点击菜单后自动收起侧边栏
//   if (isMobile.value) {
//     mobileNavigationManager.closeSidebar()
//   }
// }

// AI助手切换
const toggleAIAssistant = () => {
  // 切换侧边栏显示状态
  aiAssistantVisible.value = !aiAssistantVisible.value
}

// 处理AI助手可见性变化
const handleAIVisibilityChange = (visible: boolean) => {
  if (visible) {
    aiStore.showPanel()
  } else {
    aiStore.hidePanel()
  }
}

// // 切换AI助手模式（侧边栏 ↔ 全屏）
// const toggleAIAssistantMode = () => {
//   if (aiAssistantMode.value === 'sidebar') {
//     // 切换到全屏模式：跳转到 /ai 页面
//     router.push('/ai')
//   } else {
//     // 切换到侧边栏模式：返回上一页并显示侧边栏
//     router.back()
//     aiAssistantVisible.value = true
//     aiAssistantMode.value = 'sidebar'
//   }
// }





// 打开用户资料设置
const openUserProfile = () => {
  // 根据用户角色路由到对应的个人中心页面
  const role = userStore.userInfo?.role
  if (role === 'parent' || role === '家长') {
    router.push('/parent-center/profile')
  } else if (role === 'teacher' || role === '教师') {
    router.push('/teacher-center/profile')
  } else {
    router.push('/profile')
  }
}

const handleLogout = async () => {
  try {
    // 清除localStorage中的认证信息
    localStorage.removeItem('token')
    localStorage.removeItem('kindergarten_token')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('userInfo')

    // 重置用户store
    userStore.clearUserInfo()

    // 重置侧边栏状态
    sidebarCollapsed.value = false
    localStorage.removeItem('sidebarCollapsed')

    // 跳转到登录页
    await router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

// // 全屏功能
// const toggleFullscreen = async () => {
//   try {
//     console.log('🖥️ 全屏切换开始，当前状态:', !!documentExt.fullscreenElement)

//     if (!documentExt.fullscreenElement &&
//         !documentExt.webkitFullscreenElement &&
//         !documentExt.msFullscreenElement) {
//       // 进入全屏
//       if (documentElementExt.requestFullscreen) {
//         await documentElementExt.requestFullscreen()
//       } else if (documentElementExt.webkitRequestFullscreen) {
//         await documentElementExt.webkitRequestFullscreen()
//       } else if (documentElementExt.msRequestFullscreen) {
//         await documentElementExt.msRequestFullscreen()
//       } else {
//         throw new Error('浏览器不支持全屏功能')
//       }

//       console.log('✅ 进入全屏成功')
//       isFullscreen.value = true
//     } else {
//       // 退出全屏
//       if (documentExt.exitFullscreen) {
//         await documentExt.exitFullscreen()
//       } else if (documentExt.webkitExitFullscreen) {
//         await documentExt.webkitExitFullscreen()
//       } else if (documentExt.msExitFullscreen) {
//         await documentExt.msExitFullscreen()
//       }

//       console.log('✅ 退出全屏成功')
//       isFullscreen.value = false
//     }
//   } catch (error: any) {
//     console.error('❌ 全屏切换失败:', error)

//     // 提供用户友好的错误提示
//     if (error.message.includes('not granted') || error.message.includes('denied')) {
//       console.warn('⚠️ 全屏权限被拒绝，这通常是浏览器安全策略导致的')
//     } else if (error.message.includes('not supported')) {
//       console.warn('⚠️ 当前浏览器不支持全屏功能')
//     }

//     // 确保状态同步
//     isFullscreen.value = !!(documentExt.fullscreenElement ||
//                            documentExt.webkitFullscreenElement ||
//                            documentExt.msFullscreenElement)
//   }
// }

// 监听全屏状态变化
const handleFullscreenChange = () => {
  const isCurrentlyFullscreen = !!(documentExt.fullscreenElement ||
                                  documentExt.webkitFullscreenElement ||
                                  documentExt.msFullscreenElement)

  console.log('🔄 全屏状态变化:', isCurrentlyFullscreen)
  isFullscreen.value = isCurrentlyFullscreen
}

// 监听路由变化，确保视口宽度正确更新
watch(() => route.path, () => {
  // 在路由变化时强制更新视口宽度
  nextTick(() => {
    windowWidth.value = window.innerWidth
    console.log('🔄 路由变化，更新视口宽度:', windowWidth.value)
  })
}, { immediate: false })


const handleResize = () => {
  windowWidth.value = window.innerWidth

  // 移动端自动收起侧边栏
  if (isMobile.value) {
    sidebarCollapsed.value = true
  }
}

// // 响应式内容内边距计算 - 修复过度延伸问题
// const dynamicContentPadding = computed(() => {
//   // 使用实时视口宽度，避免缓存导致的计算错误
//   const currentWidth = window.innerWidth || windowWidth.value

//   // 设置合理的内边距范围，防止计算值过大
//   if (currentWidth < 768) {
//     // 移动端：固定内边距，避免过小的值
//     return '12px'
//   } else if (currentWidth < 1024) {
//     // 平板：适中的内边距
//     return '16px'
//   } else if (currentWidth < 1440) {
//     // 桌面：标准内边距
//     return '20px'
//   } else if (currentWidth < 1920) {
//     // 大屏：稍微增加内边距，但不过度
//     return '24px'
//   } else {
//     // 超大屏：设置最大内边距限制
//     return '28px'
//   }
// })



// 键盘快捷键处理
const handleKeyboardShortcuts = (event: KeyboardEvent) => {
  // 仅在开发环境启用
  if (!isDevelopment.value) return

  // Ctrl/Cmd + Shift + 组合键
  if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
    switch (event.key) {
      case 'R': // 角色切换器
        event.preventDefault()
        showRoleSwitcher.value = !showRoleSwitcher.value
        break
      case 'P': // 性能监控
        event.preventDefault()
        showPerformanceMonitor.value = !showPerformanceMonitor.value
        break
      case 'M': // 移动端测试
        event.preventDefault()
        showMobileTestSuite.value = !showMobileTestSuite.value
        break
    }
  }
}

// 生命周期
onMounted(async () => {
  // 确保用户信息已加载
  if (!userStore.userInfo) {
    userStore.tryRestoreFromLocalStorage()
  }

  // 恢复主题设置
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    // 应用主题
    const allThemes = ['theme-light', 'theme-dark', 'glass-light', 'glass-dark', 'glass-neon', 'glass-gradient']
    document.documentElement.classList.remove(...allThemes)
    document.body.classList.remove(...allThemes)
    document.documentElement.removeAttribute('data-theme')
    document.body.removeAttribute('data-theme')

    if (savedTheme.startsWith('glass-')) {
      document.documentElement.setAttribute('data-theme', savedTheme)
      document.body.setAttribute('data-theme', savedTheme)
      document.documentElement.classList.add(savedTheme)
      document.body.classList.add(savedTheme)
    } else {
      document.documentElement.classList.add(savedTheme)
      document.body.classList.add(savedTheme)
    }
  }

  // 恢复侧边栏状态
  const savedSidebarState = localStorage.getItem('sidebarCollapsed')
  if (savedSidebarState !== null) {
    sidebarCollapsed.value = savedSidebarState === 'true'
  }

  // 初始化图标系统
  iconSystemStore.initializeIconSystem()

  // 添加调试日志
  console.log('MainLayout mounted')

  // 初始化全屏状态
  isFullscreen.value = !!documentExt.fullscreenElement

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)

  // 监听全屏状态变化
  document.addEventListener('fullscreenchange', handleFullscreenChange)

  
  // 添加键盘事件监听（开发环境）
  if (isDevelopment.value) {
    document.addEventListener('keydown', handleKeyboardShortcuts)
  }

  // 为侧边栏切换按钮和其他按钮添加触摸优化
  nextTick(() => {
    const sidebarToggleBtn = document.querySelector('.sidebar-toggle-btn')
    const headerActionBtns = document.querySelectorAll('.header-action-btn')

    if (sidebarToggleBtn) {
      touchOptimizer.addTouchFeedback(sidebarToggleBtn as HTMLElement)
      touchOptimizer.preventDoubleTap(sidebarToggleBtn as HTMLElement)
    }

    headerActionBtns.forEach(btn => {
      touchOptimizer.addTouchFeedback(btn as HTMLElement)
      touchOptimizer.preventDoubleTap(btn as HTMLElement)
    })
  })

  // 清理函数
  const cleanup = () => {
    window.removeEventListener('resize', handleResize)
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    if (isDevelopment.value) {
      document.removeEventListener('keydown', handleKeyboardShortcuts)
    }
  }

  // 在组件卸载时清理事件监听器
  return cleanup
})
</script>

<style lang="scss" scoped>
// 导入侧边栏样式
@use '@/styles/components/sidebar.scss';

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-color-page);
  position: relative;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
  /* 不限制容器宽度，让内容自适应 */
  margin: 0;
  padding: 0;
  width: 100%;
}

/* 主布局区域 */
.main-layout-area {
  display: flex;
  height: calc(100vh - var(--header-height, 64px));
  margin-top: var(--header-height, 64px);
  position: relative;
  /* 优化垂直空间利用，减少不必要的边距 */
  min-height: calc(100vh - var(--header-height, 64px));
}

/* 侧边栏插槽 */
.sidebar-slot {
  width: var(--sidebar-width, 280px);
  flex-shrink: 0;
  transition: width var(--transition-base);
  background: var(--sidebar-bg, var(--bg-card));
  border-right: var(--border-width-base) solid var(--border-color);
  position: relative;
  z-index: var(--z-sidebar, 1020);

  &.collapsed {
    width: var(--sidebar-width-collapsed, 80px);
  }

  // ✅ 移动端处理 - 统一使用design-tokens断点
  @media (max-width: var(--breakpoint-md)) {
    position: fixed;
    top: var(--header-height, 64px);
    left: 0;
    height: calc(100vh - var(--header-height, 64px));
    transform: translateX(-100%);
    transition: transform var(--transition-base);
    z-index: var(--z-sidebar, 1020);

    &:not(.collapsed) {
      transform: translateX(0);
    }
  }
}

/* 内容区域插槽 */
.content-slot {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  transition: all var(--transition-base);
  /* 优化水平外边距 - 减少左右空白 */
  margin: 0;
  padding: 0;

  /* AI助手侧边栏打开时调整 */
  &.ai-sidebar-open {
    margin-right: 450px;  /* 与SidebarLayout默认宽度保持一致 */
  }
}

/* AI助手侧边栏插槽 */
.ai-sidebar-slot {
  position: fixed;
  top: var(--header-height, 64px);
  right: 0;
  width: 100%; max-width: 450px;  /* 与SidebarLayout默认宽度保持一致 */
  height: calc(100vh - var(--header-height, 64px));
  background: var(--bg-card);
  border-left: var(--border-width-base) solid var(--border-color);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown, 1000);
  transition: all var(--transition-base);
  backdrop-filter: blur(var(--blur-lg));

  /* 暗黑模式适配 */
  [data-theme="dark"] & {
    background: var(--bg-card);
    border-left-color: var(--border-color);
    box-shadow: -2px 0 var(--spacing-sm) var(--shadow-lg);
  }

  // ✅ 移动端适配 - 统一使用design-tokens断点
  @media (max-width: var(--breakpoint-md)) {
    width: 100%;
    height: calc(100vh - var(--header-height, 64px));
    box-shadow: var(--shadow-xl);
  }
}

/* 移动端遮罩层 - 优化设计 */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(var(--blur-sm));
  z-index: var(--z-sidebar-overlay, 1010);
  transition: all var(--transition-base);

  // 添加渐变效果，让遮罩更自然
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0.3) 100%
    );
  }
}

/* ✅ 响应式设计 - 统一使用design-tokens断点 */
@media (max-width: var(--breakpoint-md)) {
  .content-slot {
    margin: 0 !important;

    &.ai-sidebar-open {
      margin-right: 0 !important;  /* 移动端侧边栏全屏显示，主内容完全隐藏 */
    }
  }

  // 优化移动端侧边栏插槽
  .ai-sidebar-slot {
    width: 100%;
    right: 0;
    transform: translateX(100%);  /* 默认隐藏在屏幕右侧 */

    // 显示时滑入动画
    &[style*="block"], &:not([style*="display: none"]) {
      transform: translateX(0);
    }
  }
}

/* 滚动条优化 */
.content-slot .main-content-wrapper {
  &::-webkit-scrollbar {
    width: var(--border-width-base);
    height: var(--border-width-base);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 0;

    &:hover {
      background: var(--text-disabled);
    }
  }
}
</style>
