import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

/**
 * 页面上下文类型
 */
interface PageContext {
  route: string
  title: string
  permissions: string[]
  timestamp: string
  userRole?: string
}

/**
 * 快捷操作类型
 */
interface Shortcut {
  id: string
  title: string
  action?: string
  [key: string]: any
}

/**
 * AI助手状态管理
 */
export const useAIAssistantStore = defineStore('ai-assistant', () => {
  // 面板状态
  const panelVisible = ref(false)
  const panelWidth = ref(400)
  const isFullscreen = ref(false)

  // 聊天状态
  const currentSessionId = ref<string | null>(null)
  const sending = ref(false)

  // 上下文状态
  const currentPageContext = ref<PageContext | null>(null)
  const userPermissions = ref<string[]>([])

  // 记忆管理
  const memoryEnabled = ref(true)
  const maxMemoryLines = ref(500)

  // 快捷操作缓存
  const shortcutsCache = ref<Shortcut[]>([])
  const shortcutsCacheTime = ref(0)
  const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

  /**
   * 计算属性
   */
  const contextSummary = computed(() => {
    if (!currentPageContext.value) return '无上下文'
    return `${currentPageContext.value.title} - ${currentPageContext.value.route}`
  })

  const permissionsSummary = computed(() => {
    return userPermissions.value.slice(0, 3).join(', ') + 
           (userPermissions.value.length > 3 ? '...' : '')
  })

  const isShortcutsCacheValid = computed(() => {
    return Date.now() - shortcutsCacheTime.value < CACHE_DURATION
  })

  /**
   * Actions
   */
  
  /**
   * 切换面板显示
   * 🎯 修改：切换侧边栏显示状态
   */
  const togglePanel = () => {
    panelVisible.value = !panelVisible.value
    localStorage.setItem('ai-panel-visible', String(panelVisible.value))

    window.dispatchEvent(new CustomEvent('ai-panel-toggle', {
      detail: {
        visible: panelVisible.value,
        fullscreen: isFullscreen.value
      }
    }))
  }

  /**
   * 显示面板
   * 🎯 修改：显示侧边栏模式
   */
  const showPanel = () => {
    panelVisible.value = true
    localStorage.setItem('ai-panel-visible', 'true')

    window.dispatchEvent(new CustomEvent('ai-panel-toggle', {
      detail: {
        visible: true,
        fullscreen: isFullscreen.value
      }
    }))
  }

  /**
   * 隐藏面板
   * 🎯 修改：关闭面板时重置全屏状态
   */
  const hidePanel = () => {
    panelVisible.value = false
    localStorage.setItem('ai-panel-visible', 'false')

    // 🎯 关闭面板时重置全屏状态
    isFullscreen.value = false
    localStorage.setItem('ai-fullscreen', 'false')

    window.dispatchEvent(new CustomEvent('ai-panel-toggle', {
      detail: {
        visible: false,
        fullscreen: false
      }
    }))
  }

  /**
   * 更新页面上下文
   */
  const updatePageContext = (route: RouteLocationNormalized, userStore: any) => {
    currentPageContext.value = {
      route: route.path,
      title: getPageTitle(route.path),
      permissions: userStore.userPermissions || [],
      timestamp: new Date().toISOString(),
      userRole: userStore.userInfo?.role
    }
    userPermissions.value = userStore.userPermissions || []
  }

  /**
   * 获取页面标题
   */
  const getPageTitle = (path: string): string => {
    const titleMap: Record<string, string> = {
      // 主要页面
      '/dashboard': '工作台',
      '/student': '学生管理',
      '/teacher': '教师管理',
      '/customer': '客户管理',
      '/class': '班级管理',
      '/application': '入园申请',
      '/activity': '活动管理',
      '/parent': '家长管理',
      '/marketing': '营销管理',
      '/statistics': '统计报表',
      '/chat': '在线咨询',
      '/ai': 'AI助手',

      // 中心页面 - 这是关键的缺失部分
      '/centers/dashboard': '仪表板中心',
      '/centers/personnel': '人事中心',
      '/centers/activity': '活动中心',
      '/centers/enrollment': '招生中心',
      '/centers/marketing': '营销中心',
      '/centers/ai': 'AI中心',
      '/centers/system': '系统中心',

      // 招生管理
      '/enrollment': '招生管理',
      '/enrollment/prospects': '意向客户',
      '/enrollment/activities': '招生活动',
      '/enrollment/statistics': '招生统计',
      '/enrollment/follow-up': '跟进管理',

      // 学生管理
      '/students': '学生管理',
      '/students/list': '学生列表',
      '/students/classes': '班级管理',

      // 教师管理
      '/teachers': '教师管理',
      '/teachers/list': '教师列表',
      '/teachers/schedule': '排课管理',

      // 财务管理
      '/finance': '财务管理',
      '/finance/tuition': '学费管理',
      '/finance/expenses': '支出管理',

      // 营销管理子页面
      '/marketing/coupons': '优惠券管理',
      '/marketing/consultations': '咨询管理',
      '/marketing/intelligent-engine/marketing-engine': '智能营销引擎',

      // 园长功能
      '/principal/dashboard': '园长仪表盘',
      '/principal/intelligent-dashboard': '智能决策支持',
      '/principal/performance': '绩效管理',
      '/principal/marketing-analysis': '营销分析',
      '/principal/customer-pool': '客户池',
      '/principal/basic-info': '基本资料',
      '/principal/poster-editor': '海报编辑',
      '/principal/poster-generator': '海报生成器',
      '/principal/activities': '园长活动',

      // 系统管理
      '/system': '系统设置',
      '/system/settings': '系统配置',
      '/system/users': '用户管理',
      '/system/roles': '角色管理',
      '/system/permissions': '权限管理',
      '/system/logs': '系统日志',
      '/system/backup': '数据备份',
      '/system/ai-model-config': 'AI模型配置',

      // AI相关页面
      '/ai/query': 'AI智能查询',
      '/ai/model': 'AI模型管理',
      '/ai-services': 'AI服务',
      '/ai-services/ExpertConsultationPage': '专家咨询'
    }

    // 精确匹配
    if (titleMap[path]) {
      return titleMap[path]
    }

    // 模糊匹配
    for (const [key, value] of Object.entries(titleMap)) {
      if (path.startsWith(key)) {
        return value
      }
    }

    return '当前页面'
  }

  /**
   * 生成会话ID
   */
  const generateSessionId = (): string => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 11)
    return `session_${timestamp}_${random}`
  }

  /**
   * 开始新会话
   */
  const startNewSession = () => {
    currentSessionId.value = generateSessionId()
  }

  /**
   * 设置发送状态
   */
  const setSending = (status: boolean) => {
    sending.value = status
  }

  /**
   * 缓存快捷操作
   */
  const cacheShortcuts = (shortcuts: any[]) => {
    shortcutsCache.value = shortcuts
    shortcutsCacheTime.value = Date.now()
  }

  /**
   * 获取缓存的快捷操作
   */
  const getCachedShortcuts = () => {
    if (isShortcutsCacheValid.value) {
      return shortcutsCache.value
    }
    return null
  }

  /**
   * 清除快捷操作缓存
   */
  const clearShortcutsCache = () => {
    shortcutsCache.value = []
    shortcutsCacheTime.value = 0
  }

  /**
   * 初始化状态
   */
  const initializeState = async () => {
    // 检查用户权限
    try {
      const userStoreModule = await import('../stores/user')
      const useUserStore = userStoreModule.useUserStore
      const userStore = useUserStore()
      const userRole = userStore.userInfo?.role?.toLowerCase()
      const canUseAI = userRole === 'admin' || userRole === 'principal' || userRole === 'teacher'

      // 如果没有权限，强制隐藏面板
      if (!canUseAI) {
        panelVisible.value = false
        localStorage.setItem('ai-panel-visible', 'false')
        return
      }
    } catch (error) {
      console.warn('检查AI权限失败，默认隐藏面板:', error)
      panelVisible.value = false
      localStorage.setItem('ai-panel-visible', 'false')
      return
    }

    // 从本地存储恢复面板状态
    const savedVisible = localStorage.getItem('ai-panel-visible')
    if (savedVisible !== null) {
      panelVisible.value = savedVisible === 'true'
    }

    // 从本地存储恢复面板宽度
    const savedWidth = localStorage.getItem('ai-panel-width')
    if (savedWidth) {
      panelWidth.value = parseInt(savedWidth, 10)
    }

    // 从本地存储恢复记忆设置
    const savedMemoryEnabled = localStorage.getItem('ai-memory-enabled')
    if (savedMemoryEnabled !== null) {
      memoryEnabled.value = savedMemoryEnabled === 'true'
    }

    // 生成初始会话ID
    if (!currentSessionId.value) {
      startNewSession()
    }
  }

  /**
   * 重置状态
   */
  const resetState = () => {
    panelVisible.value = false
    currentSessionId.value = null
    sending.value = false
    currentPageContext.value = null
    userPermissions.value = []
    clearShortcutsCache()
  }

  /**
   * 设置面板宽度
   */
  const setPanelWidth = (width: number) => {
    panelWidth.value = Math.max(300, Math.min(600, width))
    localStorage.setItem('ai-panel-width', String(panelWidth.value))
  }

  /**
   * 设置全屏状态
   */
  const setFullscreen = (fullscreen: boolean) => {
    isFullscreen.value = fullscreen
    localStorage.setItem('ai-fullscreen', String(fullscreen))
  }

  /**
   * 切换记忆功能
   */
  const toggleMemory = () => {
    memoryEnabled.value = !memoryEnabled.value
    localStorage.setItem('ai-memory-enabled', String(memoryEnabled.value))
  }

  /**
   * 获取当前上下文信息（用于AI调用）
   */
  const getCurrentContext = () => {
    return {
      route: currentPageContext.value?.route,
      title: currentPageContext.value?.title,
      userRole: currentPageContext.value?.userRole,
      permissions: userPermissions.value,
      sessionId: currentSessionId.value,
      timestamp: new Date().toISOString()
    }
  }

  return {
    // State
    panelVisible,
    panelWidth,
    isFullscreen,
    currentSessionId,
    sending,
    currentPageContext,
    userPermissions,
    memoryEnabled,
    maxMemoryLines,
    shortcutsCache,
    shortcutsCacheTime,

    // Getters
    contextSummary,
    permissionsSummary,
    isShortcutsCacheValid,

    // Actions
    togglePanel,
    showPanel,
    hidePanel,
    updatePageContext,
    getPageTitle,
    generateSessionId,
    startNewSession,
    setSending,
    cacheShortcuts,
    getCachedShortcuts,
    clearShortcutsCache,
    initializeState,
    resetState,
    setPanelWidth,
    setFullscreen,
    toggleMemory,
    getCurrentContext
  }
})

export default useAIAssistantStore
