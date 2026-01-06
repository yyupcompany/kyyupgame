/**
 * 移动端导航配置系统
 * 采用"底部Tab + 抽屉菜单"的标准移动端导航架构
 *
 * 设计原则：
 * 1. 底部Tab：5个核心功能，横向排列，支持徽章和角标
 * 2. 抽屉菜单：次要功能通过"更多"Tab打开侧边抽屉展示
 * 3. 独立于PC端：不再直接映射PC端侧边栏，而是为移动端单独设计
 * 4. 保持懒加载：所有页面继续使用动态导入
 */

import type {
  BottomTab,
  DrawerMenuItem,
  DrawerCategory,
  DrawerMenu,
  MobileNavigationConfig,
  UserRole
} from './mobile-navigation.types'

// ==================== 园长/Admin端配置 ====================

/**
 * 园长端底部Tab配置（5个核心功能）
 */
const principalBottomTabs: BottomTab[] = [
  {
    id: 'dashboard',
    title: '首页',
    icon: 'home-o',
    path: '/mobile/dashboard'
  },
  {
    id: 'business',
    title: '业务',
    icon: 'apps-o',
    path: '/mobile/business-hub'
  },
  {
    id: 'customer',
    title: '客户',
    icon: 'user-o',
    path: '/mobile/customer-pool'
  },
  {
    id: 'data',
    title: '数据',
    icon: 'bar-chart-o',
    path: '/mobile/analytics-hub'
  },
  {
    id: 'more',
    title: '更多',
    icon: 'ellipsis',
    path: '/mobile/more',
    dot: true  // 红点提示有更多功能
  }
]

/**
 * 园长端抽屉菜单配置（4大类，17个功能）
 */
const principalDrawerMenu: DrawerMenu = {
  categories: [
    {
      id: 'business-management',
      title: '业务管理',
      icon: 'bag-o',
      collapsible: true,
      defaultCollapsed: false,
      items: [
        {
          id: 'activity-center',
          title: '活动中心',
          icon: 'calendar-o',
          path: '/mobile/centers/activity'
        },
        {
          id: 'enrollment-center',
          title: '招生中心',
          icon: 'guide-o',
          path: '/mobile/centers/enrollment'
        },
        {
          id: 'task-center',
          title: '任务中心',
          icon: 'todo-list-o',
          path: '/mobile/centers/task'
        },
        {
          id: 'document-center',
          title: '文档中心',
          icon: 'description',
          path: '/mobile/centers/document'
        },
        {
          id: 'finance-center',
          title: '财务中心',
          icon: 'gold-coin-o',
          path: '/mobile/centers/finance'
        }
      ]
    },
    {
      id: 'marketing-management',
      title: '营销管理',
      icon: 'shop-o',
      collapsible: true,
      defaultCollapsed: false,
      items: [
        {
          id: 'marketing-center',
          title: '营销中心',
          icon: 'shop-collect-o',
          path: '/mobile/centers/marketing'
        },
        {
          id: 'call-center',
          title: '呼叫中心',
          icon: 'phone-o',
          path: '/mobile/centers/call-center'
        },
        {
          id: 'photo-center',
          title: '相册中心',
          icon: 'photo-o',
          path: '/mobile/centers/media'
        },
        {
          id: 'media-center',
          title: '新媒体中心',
          icon: 'video-o',
          path: '/mobile/principal/media-center'
        }
      ]
    },
    {
      id: 'hr-teaching',
      title: '人事教学',
      icon: 'manager-o',
      collapsible: true,
      defaultCollapsed: false,
      items: [
        {
          id: 'personnel-center',
          title: '人员中心',
          icon: 'friends-o',
          path: '/mobile/centers/personnel'
        },
        {
          id: 'teaching-center',
          title: '教学中心',
          icon: 'notes-o',
          path: '/mobile/centers/teaching'
        },
        {
          id: 'assessment-center',
          title: '测评中心',
          icon: 'passed',
          path: '/mobile/centers/assessment'
        },
        {
          id: 'attendance-center',
          title: '考勤中心',
          icon: 'clock-o',
          path: '/mobile/centers/attendance'
        }
      ]
    },
    {
      id: 'system-management',
      title: '系统管理',
      icon: 'setting-o',
      collapsible: true,
      defaultCollapsed: false,
      items: [
        {
          id: 'analytics-center',
          title: '数据分析',
          icon: 'data-bar-chart-o',
          path: '/mobile/centers/analytics'
        },
        {
          id: 'usage-center',
          title: '用量中心',
          icon: 'bar-chart-o',
          path: '/mobile/centers/usage'
        },
        {
          id: 'group-center',
          title: '集团中心',
          icon: 'hotel-o',
          path: '/mobile/group'
        },
        {
          id: 'inspection-center',
          title: '督查中心',
          icon: 'certificate',
          path: '/mobile/centers/inspection'
        },
        {
          id: 'system-center',
          title: '系统设置',
          icon: 'setting-o',
          path: '/mobile/centers/system'
        },
        {
          id: 'ai-center',
          title: 'AI中心',
          icon: 'chat-o',
          path: '/mobile/centers/ai'
        }
      ]
    }
  ]
}

/**
 * 园长端导航配置
 */
const principalConfig: MobileNavigationConfig = {
  role: 'principal',
  bottomTabs: principalBottomTabs,
  drawerMenu: principalDrawerMenu,
  defaultTabOrder: principalBottomTabs.map(t => t.id)
}

// ==================== 教师端配置 ====================

/**
 * 教师端底部Tab配置（5个核心功能）
 */
const teacherBottomTabs: BottomTab[] = [
  {
    id: 'dashboard',
    title: '工作台',
    icon: 'home-o',
    path: '/mobile/teacher-center/dashboard'
  },
  {
    id: 'tasks',
    title: '任务',
    icon: 'todo-list-o',
    path: '/mobile/teacher-center/tasks',
    badge: 5  // 示例：显示待办任务数
  },
  {
    id: 'customer',
    title: '客户',
    icon: 'manager-o',
    path: '/mobile/teacher-center/customer-pool'
  },
  {
    id: 'teaching',
    title: '教学',
    icon: 'notes-o',
    path: '/mobile/teacher-center/teaching'
  },
  {
    id: 'more',
    title: '更多',
    icon: 'ellipsis',
    path: '/mobile/teacher-center/more',
    dot: true
  }
]

/**
 * 教师端抽屉菜单配置
 */
const teacherDrawerMenu: DrawerMenu = {
  categories: [
    {
      id: 'teaching-features',
      title: '教学功能',
      icon: 'notes-o',
      collapsible: true,
      defaultCollapsed: false,
      items: [
        {
          id: 'creative-curriculum',
          title: 'AI互动课堂',
          icon: 'star-o',
          path: '/mobile/teacher-center/creative-curriculum'
        },
        {
          id: 'activities',
          title: '活动中心',
          icon: 'calendar-o',
          path: '/mobile/teacher-center/activities'
        },
        {
          id: 'enrollment',
          title: '招生中心',
          icon: 'guide-o',
          path: '/mobile/teacher-center/enrollment'
        }
      ]
    },
    {
      id: 'teacher-tools',
      title: '教师工具',
      icon: 'tool-o',
      collapsible: true,
      defaultCollapsed: false,
      items: [
        {
          id: 'notifications',
          title: '通知中心',
          icon: 'bell',
          path: '/mobile/teacher-center/notifications',
          badge: 3
        },
        {
          id: 'performance',
          title: '绩效中心',
          icon: 'medal-o',
          path: '/mobile/teacher-center/performance-rewards'
        },
        {
          id: 'customer-tracking',
          title: '客户跟踪',
          icon: 'logistics',
          path: '/mobile/teacher-center/customer-tracking'
        }
      ]
    }
  ]
}

/**
 * 教师端导航配置
 */
const teacherConfig: MobileNavigationConfig = {
  role: 'teacher',
  bottomTabs: teacherBottomTabs,
  drawerMenu: teacherDrawerMenu,
  defaultTabOrder: teacherBottomTabs.map(t => t.id)
}

// ==================== 家长端配置 ====================

/**
 * 家长端底部Tab配置（5个核心功能）
 */
const parentBottomTabs: BottomTab[] = [
  {
    id: 'dashboard',
    title: '首页',
    icon: 'home-o',
    path: '/mobile/parent-center/dashboard'
  },
  {
    id: 'children',
    title: '孩子',
    icon: 'bag-o',
    path: '/mobile/parent-center/children'
  },
  {
    id: 'growth',
    title: '成长',
    icon: 'chart-trending-o',
    path: '/mobile/parent-center/growth'
  },
  {
    id: 'activities',
    title: '活动',
    icon: 'calendar-o',
    path: '/mobile/parent-center/activities'
  },
  {
    id: 'more',
    title: '更多',
    icon: 'ellipsis',
    path: '/mobile/parent-center/more',
    dot: true
  }
]

/**
 * 家长端抽屉菜单配置
 */
const parentDrawerMenu: DrawerMenu = {
  categories: [
    {
      id: 'parent-features',
      title: '家长服务',
      icon: 'service-o',
      collapsible: true,
      defaultCollapsed: false,
      items: [
        {
          id: 'ai-assistant',
          title: 'AI育儿助手',
          icon: 'chat-o',
          path: '/mobile/parent-center/ai-assistant'
        },
        {
          id: 'assessment',
          title: '能力测评',
          icon: 'certificate',
          path: '/mobile/parent-center/assessment'
        },
        {
          id: 'games',
          title: '游戏大厅',
          icon: 'play-circle-o',
          path: '/mobile/parent-center/games'
        }
      ]
    },
    {
      id: 'communication',
      title: '家园沟通',
      icon: 'comment-o',
      collapsible: true,
      defaultCollapsed: false,
      items: [
        {
          id: 'communication',
          title: '家园沟通',
          icon: 'chat-o',
          path: '/mobile/parent-center/communication'
        },
        {
          id: 'notifications',
          title: '最新通知',
          icon: 'bell',
          path: '/mobile/parent-center/notifications',
          badge: 2
        },
        {
          id: 'photo-album',
          title: '相册中心',
          icon: 'photo-o',
          path: '/mobile/parent-center/photo-album'
        }
      ]
    },
    {
      id: 'rewards',
      title: '奖励活动',
      icon: 'gift-o',
      collapsible: true,
      defaultCollapsed: false,
      items: [
        {
          id: 'kindergarten-rewards',
          title: '园所奖励',
          icon: 'award-o',
          path: '/mobile/parent-center/kindergarten-rewards'
        }
      ]
    }
  ]
}

/**
 * 家长端导航配置
 */
const parentConfig: MobileNavigationConfig = {
  role: 'parent',
  bottomTabs: parentBottomTabs,
  drawerMenu: parentDrawerMenu,
  defaultTabOrder: parentBottomTabs.map(t => t.id)
}

// ==================== 导航配置映射表 ====================

/**
 * 角色导航配置映射
 */
export const mobileNavigationConfigs: Record<UserRole, MobileNavigationConfig> = {
  parent: parentConfig,
  teacher: teacherConfig,
  principal: principalConfig,
  admin: principalConfig  // Admin端使用与园长端相同的配置
}

// ==================== 工具函数 ====================

/**
 * 根据角色获取移动端导航配置
 */
export function getMobileNavigationConfig(role: UserRole): MobileNavigationConfig {
  return mobileNavigationConfigs[role] || parentConfig
}

/**
 * 根据当前路径获取底部导航激活项ID
 */
export function getActiveBottomTab(path: string, role: UserRole): string {
  const config = getMobileNavigationConfig(role)

  // 优先精确匹配
  const exactMatch = config.bottomTabs.find(tab => tab.path === path)
  if (exactMatch) {
    return exactMatch.id
  }

  // 其次前缀匹配（用于聚合页面和子页面）
  const prefixMatch = config.bottomTabs.find(tab => {
    // 处理根路径特殊匹配
    if (tab.path === '/mobile/dashboard' && (path === '/mobile' || path === '/mobile/')) {
      return true
    }
    return path.startsWith(tab.path + '/') || path.startsWith(tab.path + '?')
  })

  return prefixMatch?.id || config.bottomTabs[0].id
}

/**
 * 根据路径获取激活的底部Tab对象
 */
export function getActiveBottomTabObject(path: string, role: UserRole): BottomTab | null {
  const config = getMobileNavigationConfig(role)
  const activeId = getActiveBottomTab(path, role)
  return config.bottomTabs.find(tab => tab.id === activeId) || null
}

/**
 * 获取排序后的底部Tab列表
 */
export function getSortedBottomTabs(role: UserRole): BottomTab[] {
  const config = getMobileNavigationConfig(role)

  // 可以扩展用户自定义排序功能
  // 目前返回默认排序
  return [...config.bottomTabs]
}

/**
 * 检查路径是否需要显示底部导航
 */
export function shouldShowBottomNav(path: string): boolean {
  const excludePatterns = [
    '/mobile/login',
    '/mobile/detail/',
    '/mobile/edit/',
    '/mobile/preview/',
    '/mobile/auth/'
  ]

  return !excludePatterns.some(pattern => path.includes(pattern))
}

/**
 * 检查路径是否在抽屉菜单中
 */
export function isInDrawerMenu(path: string, role: UserRole): boolean {
  const config = getMobileNavigationConfig(role)

  if (!config.drawerMenu) {
    return false
  }

  for (const category of config.drawerMenu.categories) {
    for (const item of category.items) {
      if (path === item.path || path.startsWith(item.path + '/')) {
        return true
      }
    }
  }

  return false
}

/**
 * 根据路径获取对应的抽屉菜单项
 */
export function getDrawerMenuItem(path: string, role: UserRole): DrawerMenuItem | null {
  const config = getMobileNavigationConfig(role)

  if (!config.drawerMenu) {
    return null
  }

  for (const category of config.drawerMenu.categories) {
    const exactMatch = category.items.find(item => item.path === path)
    if (exactMatch) {
      return exactMatch
    }

    const prefixMatch = category.items.find(item =>
      path.startsWith(item.path + '/') || path.startsWith(item.path + '?')
    )
    if (prefixMatch) {
      return prefixMatch
    }
  }

  return null
}

// ==================== 统计信息 ====================

/**
 * 获取导航统计信息
 */
export function getNavigationStats(role: UserRole) {
  const config = getMobileNavigationConfig(role)

  let drawerItemsCount = 0
  if (config.drawerMenu) {
    drawerItemsCount = config.drawerMenu.categories.reduce(
      (sum, cat) => sum + cat.items.length,
      0
    )
  }

  return {
    role,
    bottomTabsCount: config.bottomTabs.length,
    drawerCategoriesCount: config.drawerMenu?.categories.length || 0,
    drawerItemsCount,
    totalItems: config.bottomTabs.length + drawerItemsCount
  }
}

// ==================== 导出 ====================

export default mobileNavigationConfigs
