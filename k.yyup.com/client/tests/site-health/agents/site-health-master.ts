/**
 * 全站健康检测系统 - 主协调代理
 *
 * 职责：协调调度、状态管理、结果汇总
 *
 * 使用方式：
 *  npx claude-code-tool invoke --name="Site-Health-Master" --prompt="执行全站健康检测"
 */

import type { Task } from '@anthropic-ai/claude-code'

/**
 * 检测结果接口
 */
interface TestResult {
  page: string           // 页面路由
  role: string           // 角色
  status: 'pass' | 'fail' | 'warning'
  errors: ConsoleError[]
  warnings: ConsoleWarning[]
  elements: {
    buttons: number
    inputs: number
    cards: number
    tables: number
    dialogs: number
  }
  timestamp: string
}

/**
 * 控制台错误接口
 */
interface ConsoleError {
  type: string
  message: string
  location?: string
  timestamp: string
}

/**
 * 控制台警告接口
 */
interface ConsoleWarning {
  type: string
  message: string
  timestamp: string
}

/**
 * 状态管理接口
 */
interface SiteHealthStatus {
  lastUpdate: string
  totalPages: number
  completedPages: number
  failedPages: number
  roles: {
    admin: RoleStatus
    principal: RoleStatus
    teacher: RoleStatus
    parent: RoleStatus
  }
}

/**
 * 角色状态接口
 */
interface RoleStatus {
  total: number
  completed: number
  failed: number
  pages: PageStatus[]
}

/**
 * 页面状态接口
 */
interface PageStatus {
  route: string
  name: string
  status: 'pending' | 'testing' | 'completed' | 'failed'
  errors: number
  warnings: number
  timestamp?: string
  errorDetails?: string[]
}

/**
 * 管理员页面列表
 */
const ADMIN_PAGES: PageStatus[] = [
  // 系统管理模块
  { route: '/system/permissions', name: '权限管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/system/roles', name: '角色管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/system/Backup', name: '备份管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/system/AIModelConfig', name: 'AI模型配置', status: 'pending', errors: 0, warnings: 0 },
  { route: '/system/MessageTemplate', name: '消息模板', status: 'pending', errors: 0, warnings: 0 },
  // 业务中心模块
  { route: '/centers/ActivityCenter', name: '活动中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/AnalyticsCenter', name: '数据分析中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/AssessmentCenter', name: '评估中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/AttendanceCenter', name: '考勤中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/BusinessCenter', name: '业务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/CallCenter', name: '呼叫中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/CustomerPoolCenter', name: '客户池中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/DocumentCenter', name: '文档中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/EnrollmentCenter', name: '招生中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/FinanceCenter', name: '财务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/InspectionCenter', name: '检查中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/MarketingCenter', name: '营销中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/PersonnelCenter', name: '人员中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/SystemCenter', name: '系统中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/TaskCenter', name: '任务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/TeachingCenter', name: '教学中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/UsageCenter', name: '用量中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/AICenter', name: 'AI智能中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/AIBillingCenter', name: 'AI计费中心', status: 'pending', errors: 0, warnings: 0 },
  // 移动端页面
  { route: '/mobile/centers/activity-center', name: '移动端活动中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/analytics-center', name: '移动端数据分析中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/assessment-center', name: '移动端评估中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/attendance-center', name: '移动端考勤中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/business-center', name: '移动端业务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/call-center', name: '移动端呼叫中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/customer-pool-center', name: '移动端客户池中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/document-center', name: '移动端文档中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/enrollment-center', name: '移动端招生中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/finance-center', name: '移动端财务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/inspection-center', name: '移动端检查中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/marketing-center', name: '移动端营销中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/task-center', name: '移动端任务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/teaching-center', name: '移动端教学中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/usage-center', name: '移动端用量中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/system-center', name: '移动端系统中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/notification-center', name: '移动端通知中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/permission-center', name: '移动端权限中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/personnel-center', name: '移动端人员中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/student-center', name: '移动端学生中心', status: 'pending', errors: 0, warnings: 0 },
]

/**
 * 园长页面列表
 */
const PRINCIPAL_PAGES: PageStatus[] = [
  { route: '/principal/Dashboard', name: '园长仪表板', status: 'pending', errors: 0, warnings: 0 },
  { route: '/principal/CustomerPool', name: '园长客户池', status: 'pending', errors: 0, warnings: 0 },
  { route: '/principal/Performance', name: '园长绩效', status: 'pending', errors: 0, warnings: 0 },
  { route: '/principal/PosterGenerator', name: '海报生成器', status: 'pending', errors: 0, warnings: 0 },
  { route: '/principal/PosterTemplates', name: '海报模板', status: 'pending', errors: 0, warnings: 0 },
  { route: '/principal/ParentPermissionManagement', name: '家长权限管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/principal/decision-support/intelligent-dashboard', name: '智能决策仪表板', status: 'pending', errors: 0, warnings: 0 },
  { route: '/principal/media-center/VideoCreatorTimeline', name: '视频创作时间线', status: 'pending', errors: 0, warnings: 0 },
  // 园长可见业务中心
  { route: '/centers/AnalyticsCenter', name: '数据分析中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/BusinessCenter', name: '业务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/CallCenter', name: '呼叫中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/CustomerPoolCenter', name: '客户池中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/EnrollmentCenter', name: '招生中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/FinanceCenter', name: '财务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/MarketingCenter', name: '营销中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/TaskCenter', name: '任务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/TeachingCenter', name: '教学中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/UsageCenter', name: '用量中心', status: 'pending', errors: 0, warnings: 0 },
  // 移动端页面
  { route: '/mobile/centers/analytics-hub', name: '移动端数据分析', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/business-hub', name: '移动端业务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/call-center', name: '移动端呼叫中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/customer-pool-center', name: '移动端客户池中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/enrollment-center', name: '移动端招生中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/finance-center', name: '移动端财务中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/marketing-center', name: '移动端营销中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/centers/task-center', name: '移动端任务中心', status: 'pending', errors: 0, warnings: 0 },
]

/**
 * 教师页面列表
 */
const TEACHER_PAGES: PageStatus[] = [
  { route: '/teacher-center/dashboard', name: '教师仪表板', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/activities', name: '活动管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/attendance', name: '考勤管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/tasks', name: '任务管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/tasks/create', name: '新建任务', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/tasks/detail', name: '任务详情', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/tasks/edit', name: '编辑任务', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/enrollment', name: '招生协助', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/customer-pool', name: '客户池', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/customer-tracking', name: '客户跟进', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/teaching', name: '教学工作', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/creative-curriculum', name: '创意课程', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/notifications', name: '通知消息', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/performance-rewards', name: '绩效奖励', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/class-contacts', name: '班级联系', status: 'pending', errors: 0, warnings: 0 },
  { route: '/teacher-center/appointment-management', name: '预约管理', status: 'pending', errors: 0, warnings: 0 },
  // 教师可见业务中心
  { route: '/centers/ActivityCenter', name: '活动中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/AssessmentCenter', name: '评估中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/AttendanceCenter', name: '考勤中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/DocumentCenter', name: '文档中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/InspectionCenter', name: '检查中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/centers/TaskCenter', name: '任务中心', status: 'pending', errors: 0, warnings: 0 },
  // 移动端教师页面
  { route: '/mobile/teacher-center/dashboard', name: '移动端教师仪表板', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/activities', name: '移动端活动管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/teaching', name: '移动端教学工作', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/attendance', name: '移动端考勤管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/customer-pool', name: '移动端客户池', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/customer-tracking', name: '移动端客户跟进', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/tasks', name: '移动端任务管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/tasks/create', name: '移动端新建任务', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/tasks/detail', name: '移动端任务详情', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/tasks/edit', name: '移动端编辑任务', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/performance-rewards', name: '移动端绩效奖励', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/notifications', name: '移动端通知消息', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/enrollment', name: '移动端招生协助', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/appointment-management', name: '移动端预约管理', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/class-contacts', name: '移动端班级联系', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/teacher-center/creative-curriculum', name: '移动端创意课程', status: 'pending', errors: 0, warnings: 0 },
]

/**
 * 家长页面列表
 */
const PARENT_PAGES: PageStatus[] = [
  { route: '/parent-center/dashboard', name: '家长仪表板', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/AIAssistant', name: 'AI助手', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/ai-assistant', name: 'AI助手', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/activities', name: '活动列表', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/children', name: '孩子信息', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/children/add', name: '添加孩子', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/children/edit', name: '编辑孩子', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/children/growth', name: '孩子成长', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/children/followup', name: '孩子跟进', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/assessment', name: '能力评估', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/assessment/start', name: '开始测评', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/assessment/doing', name: '测评进行中', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/assessment/report', name: '测评报告', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/assessment/development-assessment', name: '发育测评', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/assessment/growth-trajectory', name: '成长轨迹', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/child-growth', name: '成长记录', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/communication', name: '家园沟通', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/communication/smart-hub', name: '智能沟通', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/notifications', name: '通知消息', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/notifications/detail', name: '通知详情', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/photo-album', name: '成长相册', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/profile', name: '个人中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/feedback', name: '意见反馈', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/promotion-center', name: '推广中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/share-stats', name: '分享统计', status: 'pending', errors: 0, warnings: 0 },
  // 游戏页面
  { route: '/parent-center/games', name: '亲子游戏', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/games/records', name: '游戏记录', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/games/achievements', name: '游戏成就', status: 'pending', errors: 0, warnings: 0 },
  { route: '/parent-center/kindergarten-rewards', name: '园所奖励', status: 'pending', errors: 0, warnings: 0 },
  // 移动端家长页面
  { route: '/mobile/parent-center', name: '移动端家长中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/dashboard', name: '移动端家长仪表板', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/activities', name: '移动端活动列表', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/activities/detail', name: '移动端活动详情', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/activity-registration', name: '移动端活动报名', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/children', name: '移动端孩子信息', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/child-growth', name: '移动端成长记录', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/assessment', name: '移动端能力评估', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/assessment/start', name: '移动端开始测评', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/assessment/doing', name: '移动端测评进行中', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/assessment/report', name: '移动端测评报告', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/assessment/development-assessment', name: '移动端发育测评', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/assessment/growth-trajectory', name: '移动端成长轨迹', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/games', name: '移动端亲子游戏', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/games/records', name: '移动端游戏记录', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/games/achievements', name: '移动端游戏成就', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/photo-album', name: '移动端成长相册', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/communication', name: '移动端家园沟通', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/communication/smart-hub', name: '移动端智能沟通', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/notifications', name: '移动端通知消息', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/notifications/detail', name: '移动端通知详情', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/profile', name: '移动端个人中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/feedback', name: '移动端意见反馈', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/ai-assistant', name: '移动端AI助手', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/promotion-center', name: '移动端推广中心', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/share-stats', name: '移动端分享统计', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/parent-center/kindergarten-rewards', name: '移动端园所奖励', status: 'pending', errors: 0, warnings: 0 },
]

/**
 * 公共页面列表
 */
const COMMON_PAGES: PageStatus[] = [
  { route: '/login', name: '登录页', status: 'pending', errors: 0, warnings: 0 },
  { route: '/register', name: '注册页', status: 'pending', errors: 0, warnings: 0 },
  { route: '/', name: '设备选择页', status: 'pending', errors: 0, warnings: 0 },
  { route: '/403', name: '403错误页', status: 'pending', errors: 0, warnings: 0 },
  { route: '/404', name: '404错误页', status: 'pending', errors: 0, warnings: 0 },
  { route: '/mobile/login', name: '移动端登录页', status: 'pending', errors: 0, warnings: 0 },
]

/**
 * 初始化状态文件
 */
function initializeStatus(): SiteHealthStatus {
  return {
    lastUpdate: new Date().toISOString(),
    totalPages: ADMIN_PAGES.length + PRINCIPAL_PAGES.length + TEACHER_PAGES.length + PARENT_PAGES.length + COMMON_PAGES.length,
    completedPages: 0,
    failedPages: 0,
    roles: {
      admin: { total: ADMIN_PAGES.length, completed: 0, failed: 0, pages: ADMIN_PAGES },
      principal: { total: PRINCIPAL_PAGES.length, completed: 0, failed: 0, pages: PRINCIPAL_PAGES },
      teacher: { total: TEACHER_PAGES.length, completed: 0, failed: 0, pages: TEACHER_PAGES },
      parent: { total: PARENT_PAGES.length, completed: 0, failed: 0, pages: PARENT_PAGES },
    },
  }
}

/**
 * 页面检测函数
 */
async function testPage(
  baseUrl: string,
  role: string,
  page: PageStatus,
  browser: any
): Promise<PageStatus> {
  const startTime = Date.now()

  console.log(`  开始检测: ${page.name} (${page.route})`)

  try {
    // 1. 导航到页面
    await browser.navigate({ url: baseUrl + page.route })

    // 2. 等待页面加载
    await browser.wait({ time: 3 })

    // 3. 获取页面快照
    const snapshot = await browser.snapshot()

    if (!snapshot) {
      console.error(`    ❌ 页面无法渲染: ${page.route}`)
      return {
        ...page,
        status: 'failed',
        errors: 1,
        timestamp: new Date().toISOString(),
        errorDetails: ['页面无法渲染'],
      }
    }

    // 4. 检测交互元素
    const buttons = findAllButtons(snapshot)
    const inputs = findAllInputs(snapshot)
    const cards = findAllCards(snapshot)
    const tables = findAllTables(snapshot)

    console.log(`    元素检测: 按钮(${buttons.length}) 输入框(${inputs.length}) 卡片(${cards.length}) 表格(${tables.length})`)

    // 5. 点击所有按钮
    let clickErrors: string[] = []
    for (const button of buttons.slice(0, 5)) { // 限制点击数量，避免过多操作
      try {
        await browser.click({ element: button.description, ref: button.ref })
        await browser.wait({ time: 0.5 })
        await browser.snapshot()
      } catch (e: any) {
        clickErrors.push(`点击失败: ${button.description} - ${e.message}`)
      }
    }

    // 6. 获取控制台错误
    const errors = await browser.consoleMessages({ level: 'error' })

    const duration = Date.now() - startTime
    const errorCount = errors.length + clickErrors.length

    if (errorCount > 0) {
      console.error(`    ⚠️ 发现 ${errorCount} 个问题 (${duration}ms)`)
      return {
        ...page,
        status: 'failed',
        errors: errorCount,
        warnings: errors.length,
        timestamp: new Date().toISOString(),
        errorDetails: clickErrors,
      }
    }

    console.log(`    ✅ 通过 (${duration}ms)`)
    return {
      ...page,
      status: 'completed',
      errors: 0,
      warnings: 0,
      timestamp: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error(`    ❌ 检测失败: ${error.message}`)
    return {
      ...page,
      status: 'failed',
      errors: 1,
      timestamp: new Date().toISOString(),
      errorDetails: [error.message],
    }
  }
}

/**
 * 查找所有按钮
 */
function findAllButtons(snapshot: any): { description: string; ref: string }[] {
  const buttons: { description: string; ref: string }[] = []
  if (!snapshot) return buttons

  function traverse(node: any) {
    if (!node) return

    const role = node.role || ''
    const type = node.type || ''

    if (role === 'button' || role === 'link' || type === 'button' || (role === 'text' && node.name?.includes('按钮'))) {
      buttons.push({
        description: node.name || node.description || '按钮',
        ref: node.ref || '',
      })
    }

    if (node.children) {
      node.children.forEach(traverse)
    }
  }

  traverse(snapshot)
  return buttons
}

/**
 * 查找所有输入框
 */
function findAllInputs(snapshot: any): { description: string; ref: string }[] {
  const inputs: { description: string; ref: string }[] = []
  if (!snapshot) return inputs

  function traverse(node: any) {
    if (!node) return

    const role = node.role || ''
    const type = node.type || ''

    if (role === 'textbox' || role === 'searchbox' || role === 'combobox' || type === 'text') {
      inputs.push({
        description: node.name || node.description || '输入框',
        ref: node.ref || '',
      })
    }

    if (node.children) {
      node.children.forEach(traverse)
    }
  }

  traverse(snapshot)
  return inputs
}

/**
 * 查找所有卡片
 */
function findAllCards(snapshot: any): { description: string; ref: string }[] {
  const cards: { description: string; ref: string }[] = []
  if (!snapshot) return cards

  function traverse(node: any) {
    if (!node) return

    const role = node.role || ''

    if (role === 'group' || role === 'section' || node.name?.includes('卡片') || node.name?.includes('card')) {
      cards.push({
        description: node.name || node.description || '卡片',
        ref: node.ref || '',
      })
    }

    if (node.children) {
      node.children.forEach(traverse)
    }
  }

  traverse(snapshot)
  return cards
}

/**
 * 查找所有表格
 */
function findAllTables(snapshot: any): { description: string; ref: string }[] {
  const tables: { description: string; ref: string }[] = []
  if (!snapshot) return tables

  function traverse(node: any) {
    if (!node) return

    const role = node.role || ''

    if (role === 'table' || node.name?.includes('表格') || node.name?.includes('table') || node.name?.includes('列表')) {
      tables.push({
        description: node.name || node.description || '表格',
        ref: node.ref || '',
      })
    }

    if (node.children) {
      node.children.forEach(traverse)
    }
  }

  traverse(snapshot)
  return tables
}

/**
 * 主协调代理执行函数
 */
export async function runSiteHealthMaster(
  baseUrl: string = 'http://localhost:5173',
  options: {
    roles?: ('admin' | 'principal' | 'teacher' | 'parent')[]
    skipCommon?: boolean
    continueOnError?: boolean
  } = {}
): Promise<SiteHealthStatus> {
  const { roles = ['admin', 'principal', 'teacher', 'parent'], skipCommon = false, continueOnError = true } = options

  console.log('='.repeat(80))
  console.log('全站健康检测系统 - 主协调代理')
  console.log('='.repeat(80))
  console.log(`检测地址: ${baseUrl}`)
  console.log(`检测角色: ${roles.join(', ')}`)
  console.log(`跳过公共页面: ${skipCommon}`)
  console.log(`错误继续执行: ${continueOnError}`)
  console.log('='.repeat(80))

  const status = initializeStatus()

  // 1. 检测公共页面
  if (!skipCommon) {
    console.log('\n📋 检测公共页面...')
    for (const page of COMMON_PAGES) {
      // 公共页面不需要登录即可访问
      const result = await testPage(baseUrl, 'common', page, {
        navigate: async () => {},
        wait: async () => {},
        snapshot: async () => null,
        click: async () => {},
        consoleMessages: async () => [],
      })

      const statusKey = 'common' as keyof typeof status.roles
      if (!status.roles[statusKey]) {
        status.roles[statusKey] = { total: COMMON_PAGES.length, completed: 0, failed: 0, pages: [] }
      }

      status.roles[statusKey].pages.push(result)
      if (result.status === 'completed') {
        status.roles[statusKey].completed++
        status.completedPages++
      } else {
        status.roles[statusKey].failed++
        status.failedPages++
      }
    }
  }

  // 2. 检测管理员页面
  if (roles.includes('admin')) {
    console.log('\n👤 检测管理员页面...')
    for (const page of ADMIN_PAGES) {
      const result = await testPage(baseUrl, 'admin', page, {
        navigate: async () => {},
        wait: async () => {},
        snapshot: async () => null,
        click: async () => {},
        consoleMessages: async () => [],
      })

      const pageIndex = status.roles.admin.pages.findIndex(p => p.route === page.route)
      if (pageIndex >= 0) {
        status.roles.admin.pages[pageIndex] = result
      }

      if (result.status === 'completed') {
        status.roles.admin.completed++
        status.completedPages++
      } else {
        status.roles.admin.failed++
        status.failedPages++
      }

      if (!continueOnError && result.status === 'failed') {
        break
      }
    }
  }

  // 3. 检测园长页面
  if (roles.includes('principal')) {
    console.log('\n🏫 检测园长页面...')
    for (const page of PRINCIPAL_PAGES) {
      const result = await testPage(baseUrl, 'principal', page, {
        navigate: async () => {},
        wait: async () => {},
        snapshot: async () => null,
        click: async () => {},
        consoleMessages: async () => [],
      })

      const pageIndex = status.roles.principal.pages.findIndex(p => p.route === page.route)
      if (pageIndex >= 0) {
        status.roles.principal.pages[pageIndex] = result
      }

      if (result.status === 'completed') {
        status.roles.principal.completed++
        status.completedPages++
      } else {
        status.roles.principal.failed++
        status.failedPages++
      }

      if (!continueOnError && result.status === 'failed') {
        break
      }
    }
  }

  // 4. 检测教师页面
  if (roles.includes('teacher')) {
    console.log('\n📚 检测教师页面...')
    for (const page of TEACHER_PAGES) {
      const result = await testPage(baseUrl, 'teacher', page, {
        navigate: async () => {},
        wait: async () => {},
        snapshot: async () => null,
        click: async () => {},
        consoleMessages: async () => [],
      })

      const pageIndex = status.roles.teacher.pages.findIndex(p => p.route === page.route)
      if (pageIndex >= 0) {
        status.roles.teacher.pages[pageIndex] = result
      }

      if (result.status === 'completed') {
        status.roles.teacher.completed++
        status.completedPages++
      } else {
        status.roles.teacher.failed++
        status.failedPages++
      }

      if (!continueOnError && result.status === 'failed') {
        break
      }
    }
  }

  // 5. 检测家长页面
  if (roles.includes('parent')) {
    console.log('\n👨‍👩‍👧 检测家长页面...')
    for (const page of PARENT_PAGES) {
      const result = await testPage(baseUrl, 'parent', page, {
        navigate: async () => {},
        wait: async () => {},
        snapshot: async () => null,
        click: async () => {},
        consoleMessages: async () => [],
      })

      const pageIndex = status.roles.parent.pages.findIndex(p => p.route === page.route)
      if (pageIndex >= 0) {
        status.roles.parent.pages[pageIndex] = result
      }

      if (result.status === 'completed') {
        status.roles.parent.completed++
        status.completedPages++
      } else {
        status.roles.parent.failed++
        status.failedPages++
      }

      if (!continueOnError && result.status === 'failed') {
        break
      }
    }
  }

  // 更新最后更新时间
  status.lastUpdate = new Date().toISOString()

  // 输出统计信息
  console.log('\n' + '='.repeat(80))
  console.log('检测完成 - 统计信息')
  console.log('='.repeat(80))
  console.log(`总页面数: ${status.totalPages}`)
  console.log(`成功: ${status.completedPages}`)
  console.log(`失败: ${status.failedPages}`)
  console.log(`成功率: ${((status.completedPages / status.totalPages) * 100).toFixed(2)}%`)
  console.log('='.repeat(80))

  // 按角色统计
  console.log('\n按角色统计:')
  for (const [role, data] of Object.entries(status.roles)) {
    if (data.total > 0) {
      const successRate = ((data.completed / data.total) * 100).toFixed(2)
      console.log(`  ${role}: ${data.completed}/${data.total} (${successRate}%)`)
    }
  }

  return status
}

export default runSiteHealthMaster
