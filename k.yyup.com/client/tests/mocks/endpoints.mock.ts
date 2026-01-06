import { vi } from 'vitest'

/**
 * API端点Mock配置
 * 修复测试中缺少的端点定义问题
 */

// 认证相关端点
export const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REGISTER: '/api/auth/register',
  REFRESH_TOKEN: '/api/auth/refresh',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  VERIFY_EMAIL: '/api/auth/verify-email',
  CHANGE_PASSWORD: '/api/auth/change-password',
  GET_PROFILE: '/api/auth/profile',
  UPDATE_PROFILE: '/api/auth/profile',
  GET_USER_INFO: '/api/auth/user-info',
  UPDATE_USER_INFO: '/api/auth/user-info'
}

// 系统管理端点
export const SYSTEM_ENDPOINTS = {
  // 用户管理
  USERS: '/api/users',
  USER_DETAIL: (id: string) => `/api/users/${id}`,
  CREATE_USER: '/api/users',
  UPDATE_USER: (id: string) => `/api/users/${id}`,
  DELETE_USER: (id: string) => `/api/users/${id}`,
  USER_STATUS: (id: string) => `/api/users/${id}/status`,
  RESET_PASSWORD: (id: string) => `/api/users/${id}/reset-password`,

  // 角色管理
  ROLES: '/api/roles',
  ROLE_DETAIL: (id: string) => `/api/roles/${id}`,
  CREATE_ROLE: '/api/roles',
  UPDATE_ROLE: (id: string) => `/api/roles/${id}`,
  DELETE_ROLE: (id: string) => `/api/roles/${id}`,
  ROLE_PERMISSIONS: (id: string) => `/api/roles/${id}/permissions`,

  // 权限管理
  PERMISSIONS: '/api/permissions',
  PERMISSION_DETAIL: (id: string) => `/api/permissions/${id}`,
  PERMISSION_TREE: '/api/permissions/tree',

  // 角色选项端点 - 用于表单选择
  ROLE_OPTIONS: '/api/roles/options'
}

// 业务中心端点
export const CENTER_ENDPOINTS = {
  // 招生中心
  ENROLLMENT: '/api/enrollment',
  ENROLLMENT_APPLICATIONS: '/api/enrollment/applications',
  ENROLLMENT_INTERVIEWS: '/api/enrollment/interviews',
  ENROLLMENT_ADMISSIONS: '/api/enrollment/admissions',
  ENROLLMENT_QUOTAS: '/api/enrollment/quotas',
  ENROLLMENT_PLANS: '/api/enrollment/plans',

  // 班级中心
  CLASSES: '/api/classes',
  CLASS_DETAIL: (id: string) => `/api/classes/${id}`,
  CLASS_STUDENTS: (id: string) => `/api/classes/${id}/students`,
  CLASS_TEACHERS: (id: string) => `/api/classes/${id}/teachers`,
  CLASS_SCHEDULE: (id: string) => `/api/classes/${id}/schedule`,

  // 学生中心
  STUDENTS: '/api/students',
  STUDENT_DETAIL: (id: string) => `/api/students/${id}`,
  STUDENT_ATTENDANCE: (id: string) => `/api/students/${id}/attendance`,
  STUDENT_GRADES: (id: string) => `/api/students/${id}/grades`,
  STUDENT_HEALTH: (id: string) => `/api/students/${id}/health`,

  // 教师中心
  TEACHERS: '/api/teachers',
  TEACHER_DETAIL: (id: string) => `/api/teachers/${id}`,
  TEACHER_CLASSES: (id: string) => `/api/teachers/${id}/classes`,
  TEACHER_SCHEDULE: (id: string) => `/api/teachers/${id}/schedule`,
  TEACHER_PERFORMANCE: (id: string) => `/api/teachers/${id}/performance`,

  // 活动中心
  ACTIVITIES: '/api/activities',
  ACTIVITY_DETAIL: (id: string) => `/api/activities/${id}`,
  ACTIVITY_REGISTRATIONS: '/api/activities/registrations',
  ACTIVITY_PHOTOS: '/api/activities/photos',
  ACTIVITY_EVALUATIONS: '/api/activities/evaluations',

  // 家长中心
  PARENTS: '/api/parents',
  PARENT_DETAIL: (id: string) => `/api/parents/${id}`,
  PARENT_CHILDREN: (id: string) => `/api/parents/${id}/children`,
  PARENT_NOTIFICATIONS: '/api/parents/notifications',
  PARENT_PAYMENTS: '/api/parents/payments'
}

// AI服务端点
export const AI_ENDPOINTS = {
  CHAT: '/api/ai/chat',
  GENERATE_IMAGE: '/api/ai/generate/image',
  GENERATE_TEXT: '/api/ai/generate/text',
  GENERATE_AUDIO: '/api/ai/generate/audio',
  GENERATE_VIDEO: '/api/ai/generate/video',
  ANALYZE_IMAGE: '/api/ai/analyze/image',
  ANALYZE_TEXT: '/api/ai/analyze/text',
  SMART_SUGGEST: '/api/ai/smart-suggest',
  MODELS: '/api/ai/models',
  MODEL_CONFIG: '/api/ai/model-config',
  SERVICE_STATUS: '/api/ai/status',
  MEMORIES: '/api/ai/memories',
  MEMORY_SEARCH: '/api/ai/memories/search',
  VOICE_CHAT: '/api/ai/voice-chat',
  TEXT_TO_SPEECH: '/api/ai/tts',
  SPEECH_TO_TEXT: '/api/ai/stt',
  DOCUMENT_PROCESSING: '/api/ai/document',
  CREATE_EMBEDDING: '/api/ai/embedding',
  ACTIVITY_IMAGE_GENERATION: '/api/ai/activity-image',
  POSTER_GENERATION: '/api/ai/poster',
  TEMPLATE_GENERATION: '/api/ai/template',
  BATCH_GENERATION: '/api/ai/batch',
  QUICK_GENERATE: '/api/ai/quick-generate',
  SMART_GENERATE: '/api/ai/smart-generate'
}

// 财务管理端点
export const FINANCE_ENDPOINTS = {
  PAYMENTS: '/api/finance/payments',
  PAYMENT_RECORDS: '/api/finance/payments/records',
  PAYMENT_METHODS: '/api/finance/payments/methods',
  PAYMENT_REFUNDS: '/api/finance/payments/refunds',
  INVOICE: '/api/finance/invoice',
  INVOICE_DETAIL: (id: string) => `/api/finance/invoice/${id}`,
  EXPENSES: '/api/finance/expenses',
  EXPENSE_DETAIL: (id: string) => `/api/finance/expenses/${id}`,
  BUDGET: '/api/finance/budget',
  BUDGET_DETAIL: (id: string) => `/api/finance/budget/${id}`,
  REPORTS: '/api/finance/reports',
  REPORT_TEMPLATES: '/api/finance/reports/templates',
  CUSTOM_REPORTS: '/api/finance/reports/custom',
  REPORT_HISTORY: '/api/finance/reports/history',
  REPORT_SHARE: '/api/finance/reports/share',
  FINANCIAL_SUMMARY: '/api/finance/summary',
  FINANCIAL_CHARTS: '/api/finance/charts'
}

// 营销管理端点
export const MARKETING_ENDPOINTS = {
  ADVERTISEMENTS: '/api/marketing/advertisements',
  ADVERTISEMENT_DETAIL: (id: string) => `/api/marketing/advertisements/${id}`,
  CAMPAIGNS: '/api/marketing/campaigns',
  CAMPAIGN_DETAIL: (id: string) => `/api/marketing/campaigns/${id}`,
  CUSTOMER_POOL: '/api/marketing/customer-pool',
  LEADS: '/api/marketing/leads',
  LEAD_DETAIL: (id: string) => `/api/marketing/leads/${id}`,
  MARKETING_ANALYTICS: '/api/marketing/analytics',
  CONVERSION_TRACKING: '/api/marketing/conversion',
  A_B_TESTING: '/api/marketing/ab-testing',
  EMAIL_MARKETING: '/api/marketing/email',
  SMS_MARKETING: '/api/marketing/sms',
  SOCIAL_MEDIA: '/api/marketing/social-media'
}

// 通知管理端点
export const NOTIFICATION_ENDPOINTS = {
  NOTIFICATIONS: '/api/notifications',
  NOTIFICATION_DETAIL: (id: string) => `/api/notifications/${id}`,
  CREATE_NOTIFICATION: '/api/notifications',
  UPDATE_NOTIFICATION: (id: string) => `/api/notifications/${id}`,
  DELETE_NOTIFICATION: (id: string) => `/api/notifications/${id}`,
  MARK_READ: (id: string) => `/api/notifications/${id}/read`,
  BULK_ACTIONS: '/api/notifications/bulk',
  TEMPLATES: '/api/notifications/templates',
  TEMPLATE_DETAIL: (id: string) => `/api/notifications/templates/${id}`,
  SEND_BULK: '/api/notifications/send-bulk',
  SCHEDULE_NOTIFICATION: '/api/notifications/schedule',
  NOTIFICATION_SETTINGS: '/api/notifications/settings',
  NOTIFICATION_STATS: '/api/notifications/stats'
}

// 文件管理端点
export const FILE_ENDPOINTS = {
  UPLOAD: '/api/files/upload',
  UPLOAD_MULTIPLE: '/api/files/upload-multiple',
  DOWNLOAD: (id: string) => `/api/files/download/${id}`,
  DELETE: (id: string) => `/api/files/${id}`,
  FILE_INFO: (id: string) => `/api/files/${id}`,
  FILE_LIST: '/api/files',
  FILE_SEARCH: '/api/files/search',
  FILE_CATEGORIES: '/api/files/categories',
  FILE_TAGS: '/api/files/tags',
  FILE_SHARE: (id: string) => `/api/files/${id}/share`,
  FILE_PREVIEW: (id: string) => `/api/files/${id}/preview`,
  FILE_THUMBNAIL: (id: string) => `/api/files/${id}/thumbnail`
}

// 报表统计端点
export const DASHBOARD_ENDPOINTS = {
  OVERVIEW: '/api/dashboard/overview',
  STATS: '/api/dashboard/stats',
  CHARTS: '/api/dashboard/charts',
  WIDGETS: '/api/dashboard/widgets',
  WIDGET_CONFIG: '/api/dashboard/widget-config',
  REAL_TIME_DATA: '/api/dashboard/real-time',
  EXPORT_DATA: '/api/dashboard/export',
  HISTORICAL_DATA: '/api/dashboard/historical',
  TREND_ANALYSIS: '/api/dashboard/trends',
  PERFORMANCE_METRICS: '/api/dashboard/performance',
  USER_ACTIVITY: '/api/dashboard/user-activity',
  SYSTEM_HEALTH: '/api/dashboard/health',
  ALERTS: '/api/dashboard/alerts'
}

// 日程管理端点
export const SCHEDULE_ENDPOINTS = {
  SCHEDULES: '/api/schedules',
  SCHEDULE_DETAIL: (id: string) => `/api/schedules/${id}`,
  CREATE_SCHEDULE: '/api/schedules',
  UPDATE_SCHEDULE: (id: string) => `/api/schedules/${id}`,
  DELETE_SCHEDULE: (id: string) => `/api/schedules/${id}`,
  CALENDAR_VIEW: '/api/schedules/calendar',
  TIMELINE_VIEW: '/api/schedules/timeline',
  CONFLICT_CHECK: '/api/schedules/conflicts',
  REMINDERS: '/api/schedules/reminders',
  RECURRING_PATTERNS: '/api/schedules/recurring',
  AVAILABILITY_CHECK: '/api/schedules/availability',
  SCHEDULE_TEMPLATES: '/api/schedules/templates'
}

// 任务管理端点
export const TODO_ENDPOINTS = {
  TODOS: '/api/todos',
  TODO_DETAIL: (id: string) => `/api/todos/${id}`,
  CREATE_TODO: '/api/todos',
  UPDATE_TODO: (id: string) => `/api/todos/${id}`,
  DELETE_TODO: (id: string) => `/api/todos/${id}`,
  TODO_LISTS: '/api/todos/lists',
  TODO_LIST_DETAIL: (id: string) => `/api/todos/lists/${id}`,
  CREATE_LIST: '/api/todos/lists',
  UPDATE_LIST: (id: string) => `/api/todos/lists/${id}`,
  DELETE_LIST: (id: string) => `/api/todos/lists/${id}`,
  TODO_CATEGORIES: '/api/todos/categories',
  TODO_TAGS: '/api/todos/tags',
  TODO_COMMENTS: (id: string) => `/api/todos/${id}/comments`,
  TODO_ATTACHMENTS: (id: string) => `/api/todos/${id}/attachments`
}

// 统一的端点导出
export const API_ENDPOINTS = {
  ...AUTH_ENDPOINTS,
  ...SYSTEM_ENDPOINTS,
  ...CENTER_ENDPOINTS,
  ...AI_ENDPOINTS,
  ...FINANCE_ENDPOINTS,
  ...MARKETING_ENDPOINTS,
  ...NOTIFICATION_ENDPOINTS,
  ...FILE_ENDPOINTS,
  ...DASHBOARD_ENDPOINTS,
  ...SCHEDULE_ENDPOINTS,
  ...TODO_ENDPOINTS
}

// 创建端点Mock函数
export function createEndpointsMock() {
  return {
    AUTH_ENDPOINTS,
    SYSTEM_ENDPOINTS,
    CENTER_ENDPOINTS,
    AI_ENDPOINTS,
    FINANCE_ENDPOINTS,
    MARKETING_ENDPOINTS,
    NOTIFICATION_ENDPOINTS,
    FILE_ENDPOINTS,
    DASHBOARD_ENDPOINTS,
    SCHEDULE_ENDPOINTS,
    TODO_ENDPOINTS,
    API_ENDPOINTS
  }
}

// Vitest Mock设置函数
export function setupEndpointsMock() {
  const endpointsMock = createEndpointsMock()

  // Mock端点模块
  vi.mock('@/api/endpoints', () => endpointsMock)
  vi.mock('@/api/endpoints/hardcoded-data-replacements', () => ({
    SYSTEM_ENDPOINTS: endpointsMock.SYSTEM_ENDPOINTS
  }))

  return endpointsMock
}

// 重置端点Mock
export function resetEndpointsMock() {
  vi.clearAllMocks()
  console.log('🔄 Endpoints Mock已重置')
}

// 默认导出
export default createEndpointsMock()