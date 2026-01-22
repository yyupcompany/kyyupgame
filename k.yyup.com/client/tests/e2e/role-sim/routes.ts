export interface NavTarget {
  title: string
  route: string
}

// 来自 CentersSidebar.vue（管理员/园长共用的“业务中心”侧边栏）
export const adminCentersRoutes: NavTarget[] = [
  { title: '管理控制台', route: '/dashboard' },
  // 业务管理
  { title: '业务中心', route: '/centers/business' },
  { title: '活动中心', route: '/centers/activity' },
  { title: '招生中心', route: '/centers/enrollment' },
  { title: '客户池中心', route: '/centers/customer-pool' },
  { title: '任务中心', route: '/centers/task' },
  { title: '文档中心', route: '/centers/document-center' },
  { title: '财务中心', route: '/centers/finance' },
  // 营销管理
  { title: '营销中心', route: '/centers/marketing' },
  { title: '呼叫中心', route: '/centers/call' },
  { title: '相册中心', route: '/centers/media' },
  { title: '新媒体中心', route: '/principal/media-center' },
  // 人事与教学管理
  { title: '人员中心', route: '/centers/personnel' },
  { title: '教学中心', route: '/centers/teaching' },
  { title: '测评中心', route: '/centers/assessment' },
  { title: '考勤中心', route: '/centers/attendance' },
  // 数据与分析管理
  { title: '数据分析中心', route: '/centers/analytics' },
  { title: '用量中心', route: '/centers/usage' },
  // 治理与集团管理
  { title: '集团中心', route: '/group' },
  { title: '督查中心', route: '/centers/inspection' },
  // 系统与AI管理
  { title: '系统中心', route: '/centers/system' },
  { title: 'AI中心', route: '/centers/ai' }
]

// 来自 TeacherCenterSidebar.vue
export const teacherRoutes: NavTarget[] = [
  { title: '教师工作台', route: '/teacher-center/dashboard' },
  { title: '通知中心', route: '/teacher-center/notifications' },
  { title: '任务中心', route: '/teacher-center/tasks' },
  { title: '活动中心', route: '/teacher-center/activities' },
  { title: '招生中心', route: '/teacher-center/enrollment' },
  { title: '教学中心', route: '/teacher-center/teaching' },
  { title: '客户跟踪', route: '/teacher-center/customer-tracking' },
  { title: 'AI互动课堂', route: '/teacher-center/creative-curriculum' },
  { title: '绩效中心', route: '/teacher-center/performance-rewards' }
]

// 来自 ParentCenterSidebar.vue
export const parentRoutes: NavTarget[] = [
  { title: '我的首页', route: '/parent-center/dashboard' },
  { title: '我的孩子', route: '/parent-center/children' },
  { title: '成长报告', route: '/parent-center/child-growth' },
  { title: '能力测评', route: '/parent-center/assessment' },
  { title: '游戏大厅', route: '/parent-center/games' },
  { title: 'AI育儿助手', route: '/parent-center/ai-assistant' },
  { title: '活动列表', route: '/parent-center/activities' },
  { title: '家园沟通', route: '/parent-center/communication' },
  { title: '相册中心', route: '/parent-center/photo-album' },
  { title: '园所奖励', route: '/parent-center/kindergarten-rewards' },
  { title: '最新通知', route: '/parent-center/notifications' }
]


