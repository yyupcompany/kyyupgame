/**
 * 动画模块数据管理
 * 根据用户角色提供对应的侧边栏功能模块
 * 用于在入场动画中展示丰富的功能内容
 */

// 通用接口定义
interface Module {
  id: string
  title: string
  icon: string
  route?: string
  color?: string
  category?: string
}

interface RoleModules {
  role: string
  displayName: string
  modules: Module[]
  categories: {
    id: string
    title: string
    icon: string
    modules: Module[]
  }[]
}

// Admin/园长角色模块 (来自 CentersSidebar)
export const adminModules: RoleModules = {
  role: 'admin',
  displayName: '管理员',
  modules: [
    // 管理控制台
    { id: 'dashboard', title: '管理控制台', icon: 'dashboard', route: '/dashboard', color: '#007bff' },
    // 业务管理
    { id: 'business', title: '业务中心', icon: 'briefcase', route: '/centers/business', color: '#28a745' },
    { id: 'activity', title: '活动中心', icon: 'calendar', route: '/centers/activity', color: '#fd7e14' },
    { id: 'enrollment', title: '招生中心', icon: 'school', route: '/centers/enrollment', color: '#17a2b8' },
    { id: 'customer-pool', title: '客户池中心', icon: 'user-check', route: '/centers/customer-pool', color: '#6f42c1' },
    { id: 'task', title: '任务中心', icon: 'task', route: '/centers/task', color: '#dc3545' },
    { id: 'script', title: '话术中心', icon: 'chat-square', route: '/centers/script', color: '#20c997' },
    { id: 'document-center', title: '文档中心', icon: 'document', route: '/centers/document-center', color: '#6610f2' },
    { id: 'finance', title: '财务中心', icon: 'finance', route: '/centers/finance', color: '#e83e8c' },
    // 营销管理
    { id: 'marketing', title: '营销中心', icon: 'marketing', route: '/centers/marketing', color: '#ff6b6b' },
    { id: 'call-center', title: '呼叫中心', icon: 'phone', route: '/centers/call-center', color: '#4ecdc4' },
    { id: 'media', title: '媒体中心', icon: 'video-camera', route: '/centers/media', color: '#f8b500' },
    // 人事与教学管理
    { id: 'personnel', title: '人员中心', icon: 'user-group', route: '/centers/personnel', color: '#6c757d' },
    { id: 'teaching', title: '教学中心', icon: 'book-open', route: '/centers/teaching', color: '#6f42c1' },
    { id: 'assessment', title: '测评中心', icon: 'check', route: '/centers/assessment', color: '#28a745' },
    { id: 'attendance', title: '考勤中心', icon: 'clock', route: '/centers/attendance', color: '#ffc107' },
    // 数据与分析管理
    { id: 'analytics', title: '数据分析中心', icon: 'analytics', route: '/centers/analytics', color: '#17a2b8' },
    { id: 'usage', title: '用量中心', icon: 'analytics', route: '/centers/usage', color: '#20c997' },
    // 治理与集团管理
    { id: 'group', title: '集团中心', icon: 'home', route: '/group', color: '#007bff' },
    { id: 'inspection', title: '督查中心', icon: 'check', route: '/centers/inspection', color: '#dc3545' },
    // 系统与AI管理
    { id: 'system', title: '系统中心', icon: 'settings', route: '/centers/system', color: '#6c757d' },
    { id: 'ai', title: 'AI中心', icon: 'ai-brain', route: '/centers/ai', color: '#e83e8c' }
  ],
  categories: [
    {
      id: 'management',
      title: '核心管理',
      icon: 'settings',
      modules: [
        { id: 'dashboard', title: '管理控制台', icon: 'dashboard', route: '/dashboard', color: '#007bff' },
        { id: 'business', title: '业务中心', icon: 'briefcase', route: '/centers/business', color: '#28a745' },
        { id: 'activity', title: '活动中心', icon: 'calendar', route: '/centers/activity', color: '#fd7e14' },
        { id: 'enrollment', title: '招生中心', icon: 'school', route: '/centers/enrollment', color: '#17a2b8' }
      ]
    },
    {
      id: 'operations',
      title: '运营管理',
      icon: 'briefcase',
      modules: [
        { id: 'customer-pool', title: '客户池中心', icon: 'user-check', route: '/centers/customer-pool', color: '#6f42c1' },
        { id: 'task', title: '任务中心', icon: 'task', route: '/centers/task', color: '#dc3545' },
        { id: 'script', title: '话术中心', icon: 'chat-square', route: '/centers/script', color: '#20c997' },
        { id: 'document-center', title: '文档中心', icon: 'document', route: '/centers/document-center', color: '#6610f2' },
        { id: 'finance', title: '财务中心', icon: 'finance', route: '/centers/finance', color: '#e83e8c' }
      ]
    },
    {
      id: 'marketing',
      title: '营销推广',
      icon: 'marketing',
      modules: [
        { id: 'marketing', title: '营销中心', icon: 'marketing', route: '/centers/marketing', color: '#ff6b6b' },
        { id: 'call-center', title: '呼叫中心', icon: 'phone', route: '/centers/call-center', color: '#4ecdc4' },
        { id: 'media', title: '媒体中心', icon: 'video-camera', route: '/centers/media', color: '#f8b500' }
      ]
    },
    {
      id: 'education',
      title: '教育教学',
      icon: 'book-open',
      modules: [
        { id: 'personnel', title: '人员中心', icon: 'user-group', route: '/centers/personnel', color: '#6c757d' },
        { id: 'teaching', title: '教学中心', icon: 'book-open', route: '/centers/teaching', color: '#6f42c1' },
        { id: 'assessment', title: '测评中心', icon: 'check', route: '/centers/assessment', color: '#28a745' },
        { id: 'attendance', title: '考勤中心', icon: 'clock', route: '/centers/attendance', color: '#ffc107' }
      ]
    },
    {
      id: 'data',
      title: '数据智能',
      icon: 'analytics',
      modules: [
        { id: 'analytics', title: '数据分析中心', icon: 'analytics', route: '/centers/analytics', color: '#17a2b8' },
        { id: 'usage', title: '用量中心', icon: 'analytics', route: '/centers/usage', color: '#20c997' }
      ]
    },
    {
      id: 'governance',
      title: '治理体系',
      icon: 'home',
      modules: [
        { id: 'group', title: '集团中心', icon: 'home', route: '/group', color: '#007bff' },
        { id: 'inspection', title: '督查中心', icon: 'check', route: '/centers/inspection', color: '#dc3545' }
      ]
    },
    {
      id: 'system',
      title: '系统科技',
      icon: 'settings',
      modules: [
        { id: 'system', title: '系统中心', icon: 'settings', route: '/centers/system', color: '#6c757d' },
        { id: 'ai', title: 'AI中心', icon: 'ai-brain', route: '/centers/ai', color: '#e83e8c' }
      ]
    }
  ]
}

// 教师角色模块 (来自 TeacherCenterSidebar)
export const teacherModules: RoleModules = {
  role: 'teacher',
  displayName: '教师',
  modules: [
    { id: 'teacher-dashboard', title: '教师工作台', icon: 'dashboard', route: '/teacher-center/dashboard', color: '#007bff' },
    { id: 'teacher-notifications', title: '通知中心', icon: 'bell', route: '/teacher-center/notifications', color: '#17a2b8' },
    { id: 'teacher-tasks', title: '任务中心', icon: 'task', route: '/teacher-center/tasks', color: '#dc3545' },
    { id: 'teacher-activities', title: '活动中心', icon: 'calendar', route: '/teacher-center/activities', color: '#fd7e14' },
    { id: 'teacher-enrollment', title: '招生中心', icon: 'school', route: '/teacher-center/enrollment', color: '#28a745' },
    { id: 'teacher-teaching', title: '教学中心', icon: 'book-open', route: '/teacher-center/teaching', color: '#6f42c1' },
    { id: 'teacher-customer-tracking', title: '客户跟踪', icon: 'user-check', route: '/teacher-center/customer-tracking', color: '#20c997' },
    { id: 'teacher-creative-curriculum', title: 'AI互动课堂', icon: 'star', route: '/teacher-center/creative-curriculum', color: '#ff6b6b' },
    { id: 'teacher-attendance', title: '考勤管理', icon: 'clock', route: '/teacher-center/attendance', color: '#ffc107' }
  ],
  categories: [
    {
      id: 'core',
      title: '核心工作',
      icon: 'dashboard',
      modules: [
        { id: 'teacher-dashboard', title: '教师工作台', icon: 'dashboard', route: '/teacher-center/dashboard', color: '#007bff' },
        { id: 'teacher-notifications', title: '通知中心', icon: 'bell', route: '/teacher-center/notifications', color: '#17a2b8' },
        { id: 'teacher-tasks', title: '任务中心', icon: 'task', route: '/teacher-center/tasks', color: '#dc3545' }
      ]
    },
    {
      id: 'teaching',
      title: '教学管理',
      icon: 'book-open',
      modules: [
        { id: 'teacher-activities', title: '活动中心', icon: 'calendar', route: '/teacher-center/activities', color: '#fd7e14' },
        { id: 'teacher-enrollment', title: '招生中心', icon: 'school', route: '/teacher-center/enrollment', color: '#28a745' },
        { id: 'teacher-teaching', title: '教学中心', icon: 'book-open', route: '/teacher-center/teaching', color: '#6f42c1' },
        { id: 'teacher-creative-curriculum', title: '创意课程', icon: 'star', route: '/teacher-center/creative-curriculum', color: '#ff6b6b' }
      ]
    },
    {
      id: 'student',
      title: '学生管理',
      icon: 'user-group',
      modules: [
        { id: 'teacher-customer-tracking', title: '客户跟踪', icon: 'user-check', route: '/teacher-center/customer-tracking', color: '#20c997' },
        { id: 'teacher-attendance', title: '考勤管理', icon: 'clock', route: '/teacher-center/attendance', color: '#ffc107' }
      ]
    }
  ]
}

// 家长角色模块 (来自 ParentCenterSidebar)
export const parentModules: RoleModules = {
  role: 'parent',
  displayName: '家长',
  modules: [
    { id: 'parent-dashboard', title: '我的首页', icon: 'home', route: '/parent-center/dashboard', color: '#007bff' },
    { id: 'my-children', title: '我的孩子', icon: 'school', route: '/parent-center/children', color: '#28a745' },
    { id: 'child-growth', title: '成长报告', icon: 'growth', route: '/parent-center/child-growth', color: '#17a2b8' },
    { id: 'assessment', title: '能力测评', icon: 'document', route: '/parent-center/assessment', color: '#6f42c1' },
    { id: 'games', title: '游戏大厅', icon: 'star', route: '/parent-center/games', color: '#fd7e14' },
    { id: 'ai-assistant', title: 'AI育儿助手', icon: 'ai-brain', route: '/parent-center/ai-assistant', color: '#e83e8c' },
    { id: 'activities', title: '活动列表', icon: 'calendar', route: '/parent-center/activities', color: '#dc3545' },
    { id: 'parent-communication', title: '家园沟通', icon: 'chat-square', route: '/parent-center/communication', color: '#20c997' },
    { id: 'parent-feedback', title: '反馈建议', icon: 'message-circle', route: '/parent-center/feedback', color: '#6610f2' },
    { id: 'share-stats', title: '分享统计', icon: 'share', route: '/parent-center/share-stats', color: '#ff6b6b' }
  ],
  categories: [
    {
      id: 'family',
      title: '家庭中心',
      icon: 'home',
      modules: [
        { id: 'parent-dashboard', title: '我的首页', icon: 'home', route: '/parent-center/dashboard', color: '#007bff' },
        { id: 'my-children', title: '我的孩子', icon: 'school', route: '/parent-center/children', color: '#28a745' },
        { id: 'parent-communication', title: '家园沟通', icon: 'chat-square', route: '/parent-center/communication', color: '#20c997' }
      ]
    },
    {
      id: 'development',
      title: '成长发展',
      icon: 'growth',
      modules: [
        { id: 'child-growth', title: '成长报告', icon: 'growth', route: '/parent-center/child-growth', color: '#17a2b8' },
        { id: 'assessment', title: '能力测评', icon: 'document', route: '/parent-center/assessment', color: '#6f42c1' },
        { id: 'activities', title: '活动列表', icon: 'calendar', route: '/parent-center/activities', color: '#dc3545' }
      ]
    },
    {
      id: 'entertainment',
      title: '娱乐学习',
      icon: 'star',
      modules: [
        { id: 'games', title: '游戏大厅', icon: 'star', route: '/parent-center/games', color: '#fd7e14' },
        { id: 'ai-assistant', title: 'AI育儿助手', icon: 'ai-brain', route: '/parent-center/ai-assistant', color: '#e83e8c' }
      ]
    },
    {
      id: 'community',
      title: '互动社区',
      icon: 'share',
      modules: [
        { id: 'parent-feedback', title: '反馈建议', icon: 'message-circle', route: '/parent-center/feedback', color: '#6610f2' },
        { id: 'share-stats', title: '分享统计', icon: 'share', route: '/parent-center/share-stats', color: '#ff6b6b' }
      ]
    }
  ]
}

// 角色模块映射
export const roleModulesMap = {
  admin: adminModules,
  teacher: teacherModules,
  parent: parentModules,
  principal: adminModules, // 园长使用admin模块
  manager: adminModules   // 管理员使用admin模块
}

/**
 * 根据用户角色获取对应的模块数据
 */
export const getRoleModules = (role: string): RoleModules => {
  return roleModulesMap[role as keyof typeof roleModulesMap] || adminModules
}

/**
 * 根据用户角色获取模块列表（扁平化）
 */
export const getRoleModuleList = (role: string): Module[] => {
  const roleData = getRoleModules(role)
  return roleData.modules
}

/**
 * 根据用户角色获取分类模块
 */
export const getRoleCategories = (role: string) => {
  const roleData = getRoleModules(role)
  return roleData.categories
}

/**
 * 随机获取指定角色的部分模块（用于动画显示）
 */
export const getRandomModulesForAnimation = (role: string, count: number = 8): Module[] => {
  const modules = getRoleModuleList(role)
  const shuffled = [...modules].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, modules.length))
}

/**
 * 获取角色的核心模块（前几个重要模块）
 */
export const getCoreModulesForAnimation = (role: string): Module[] => {
  const modules = getRoleModuleList(role)
  return modules.slice(0, 6) // 返回前6个核心模块
}

/**
 * 根据用户角色获取显示名称
 */
export const getRoleDisplayName = (role: string): string => {
  const roleData = getRoleModules(role)
  return roleData.displayName
}

export default {
  adminModules,
  teacherModules,
  parentModules,
  getRoleModules,
  getRoleModuleList,
  getRoleCategories,
  getRandomModulesForAnimation,
  getCoreModulesForAnimation,
  getRoleDisplayName
}