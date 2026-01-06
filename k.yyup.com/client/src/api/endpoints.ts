/**
 * API端点配置文件 - 重构为模块化结构
 *
 * 此文件提供向后兼容性，同时引入新的模块化端点结构
 * 推荐使用：import { AUTH_ENDPOINTS } from '@/api/endpoints/auth'
 * 或者：import { AUTH_ENDPOINTS } from '@/api/endpoints'
 */

// 重新导出所有端点模块以保持向后兼容
export * from './endpoints/index';

// 导出APPLICATION_ENDPOINTS别名
export { ENROLLMENT_APPLICATION_ENDPOINTS as APPLICATION_ENDPOINTS } from './endpoints/enrollment';

// 招生计划端点导入
import {
  ENROLLMENT_PLAN_ENDPOINTS,
  ENROLLMENT_QUOTA_ENDPOINTS,
  ENROLLMENT_APPLICATION_ENDPOINTS,
  ENROLLMENT_CONSULTATION_ENDPOINTS
} from './endpoints/enrollment';

// 活动管理端点导入
import {
  ACTIVITY_ENDPOINTS,
  ACTIVITY_PLAN_ENDPOINTS,
  ACTIVITY_REGISTRATION_ENDPOINTS,
  ACTIVITY_CHECKIN_ENDPOINTS,
  ACTIVITY_EVALUATION_ENDPOINTS
} from './endpoints/activity';

// 保留原有的基础端点定义以保持兼容性
import { API_PREFIX } from './endpoints/base';

// 招生管理聚合接口（向后兼容）
export const ENROLLMENT_ENDPOINTS = {
  BASE: `${API_PREFIX}/enrollment-plans`,
  STATISTICS: `${API_PREFIX}/enrollment-statistics`, // 修复：统一招生统计路径
  FOLLOW_UP: `${API_PREFIX}/enrollment-consultations/automated-follow-up`,
  ANALYTICS: `${API_PREFIX}/enrollment-plans/analytics`,
  OVERVIEW: `${API_PREFIX}/enrollment-plans/overview`,
} as const;

// 校长管理接口（向后兼容）
export const PRINCIPAL_ENDPOINTS = {
  BASE: `${API_PREFIX}/principal`,
  DASHBOARD_STATS: `${API_PREFIX}/principal/dashboard`,
  NOTICES: `${API_PREFIX}/principal/notices`,
  SCHEDULE: `${API_PREFIX}/principal/schedule`,
  ENROLLMENT_TREND: `${API_PREFIX}/principal/enrollment/trend`,
  CUSTOMER_POOL_STATS: `${API_PREFIX}/principal/customer-pool/stats`,
  CUSTOMER_POOL_LIST: `${API_PREFIX}/principal/customer-pool`,
  CUSTOMER_POOL: `${API_PREFIX}/principal/customer-pool`,
  CUSTOMER_POOL_BATCH_ASSIGN: `${API_PREFIX}/principal/customer-pool/batch-assign`,
  CUSTOMER_POOL_ASSIGN: `${API_PREFIX}/principal/customer-pool/assign`,
  ACTIVITIES: `${API_PREFIX}/principal/activities`,
  ACTIVITIES_BATCH: `${API_PREFIX}/principal/activities/batch`,
  PERFORMANCE_STATS: `${API_PREFIX}/principal/performance/stats`,
  PERFORMANCE_RANKINGS: `${API_PREFIX}/principal/performance/rankings`,
  PERFORMANCE_DETAILS: `${API_PREFIX}/principal/performance/details`,
  // 园区管理
  CAMPUS_OVERVIEW: `${API_PREFIX}/principal/campus/overview`,

  // 审批管理
  APPROVALS: `${API_PREFIX}/principal/approvals`,
  APPROVAL_HANDLE: (id: number | string, action: string) => `${API_PREFIX}/principal/approvals/${id}/${action}`,

  // 通知管理
  NOTICES_IMPORTANT: `${API_PREFIX}/principal/notices/important`,
  NOTICES_PUBLISH: `${API_PREFIX}/principal/notices`,

  // 客户详情管理
  CUSTOMER_POOL_DETAIL: (id: number | string) => `${API_PREFIX}/principal/customer-pool/${id}`,
  CUSTOMER_POOL_DELETE: (id: number | string) => `${API_PREFIX}/principal/customer-pool/${id}`,
  CUSTOMER_POOL_FOLLOW_UP_BY_ID: (id: number | string) => `${API_PREFIX}/principal/customer-pool/${id}/follow-up`,

  // 海报模板管理（修复：使用正确的后端路由）
  POSTER_TEMPLATES: `${API_PREFIX}/poster-templates`,
  POSTER_TEMPLATE_BY_ID: (id: number | string) => `${API_PREFIX}/poster-templates/${id}`,

  // 绩效规则管理（修复：添加缺失的端点）
  PERFORMANCE_RULES: `${API_PREFIX}/performance/rules`,
  PERFORMANCE_RULE_BY_ID: (id: number | string) => `${API_PREFIX}/performance/rules/${id}`,
} as const;

// 认证相关接口（向后兼容）
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_PREFIX}/auth/login`,
  REGISTER: `${API_PREFIX}/auth/register`,
  LOGOUT: `${API_PREFIX}/auth/logout`,
  REFRESH_TOKEN: `${API_PREFIX}/auth/refresh-token`,
  VERIFY_TOKEN: `${API_PREFIX}/auth/verify-token`,
  FORGOT_PASSWORD: `${API_PREFIX}/auth/forgot-password`,
  RESET_PASSWORD: `${API_PREFIX}/auth/reset-password`,
  CHANGE_PASSWORD: `${API_PREFIX}/auth/change-password`,
  USER_INFO: `${API_PREFIX}/auth/me`,
} as const;

// 用户管理接口（向后兼容）
export const USER_ENDPOINTS = {
  BASE: `${API_PREFIX}/users`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/users/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/users/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/users/${id}`,
  GET_PROFILE: `${API_PREFIX}/users/profile`,
  UPDATE_PROFILE: `${API_PREFIX}/users/profile`,
  UPDATE_ROLES: (id: number | string) => `${API_PREFIX}/users/${id}/roles`,
} as const;

// 角色和权限接口（向后兼容）
export const ROLE_ENDPOINTS = {
  BASE: `${API_PREFIX}/roles`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/roles/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/roles/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/roles/${id}`,
  GET_PERMISSIONS: (id: number | string) => `${API_PREFIX}/roles/${id}/permissions`,
  ASSIGN_PERMISSIONS: (id: number | string) => `${API_PREFIX}/roles/${id}/permissions`,
} as const;

export const PERMISSION_ENDPOINTS = {
  BASE: `${API_PREFIX}/system/permissions`, // 修复：统一为系统权限路径
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/system/permissions/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/system/permissions/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/system/permissions/${id}`,
  MY_PAGES: `${API_PREFIX}/permissions/my-pages`, // 保留特殊路径
  CHECK_PAGE: (pagePath: string) => `${API_PREFIX}/permissions/check/${pagePath}`, // 保留特殊路径
  ROLE_PAGES: (roleId: number | string) => `${API_PREFIX}/permissions/roles/${roleId}`, // 保留特殊路径
  UPDATE_ROLE_PAGES: (roleId: number | string) => `${API_PREFIX}/permissions/roles/${roleId}`, // 保留特殊路径
} as const;

// 仪表盘接口
export const DASHBOARD_ENDPOINTS = {
  STATS: `${API_PREFIX}/dashboard/stats`,
  CLASSES: `${API_PREFIX}/dashboard/classes`,
  TODOS: `${API_PREFIX}/dashboard/todos`,
  TODO_STATUS: (id: number | string) => `${API_PREFIX}/dashboard/todos/${id}/status`,
  TODO_DELETE: (id: number | string) => `${API_PREFIX}/dashboard/todos/${id}`,
  SCHEDULES: `${API_PREFIX}/dashboard/schedules`,
  ENROLLMENT_TRENDS: `${API_PREFIX}/dashboard/enrollment-trends`,
  CHANNEL_ANALYSIS: `${API_PREFIX}/dashboard/channel-analysis`,
  CONVERSION_FUNNEL: `${API_PREFIX}/dashboard/conversion-funnel`,
  ACTIVITIES: `${API_PREFIX}/dashboard/activities`,
  OVERVIEW: `${API_PREFIX}/dashboard/overview`,
  SYSTEM_STATUS: `${API_PREFIX}/dashboard/real-time/system-status`,
  STATISTICS: `${API_PREFIX}/dashboard/statistics`,
  STATISTICS_TABLE: `${API_PREFIX}/dashboard/statistics/table`,
  STATISTICS_ENROLLMENT_TRENDS: `${API_PREFIX}/dashboard/statistics/enrollment-trends`,
  STATISTICS_ACTIVITY_DATA: `${API_PREFIX}/dashboard/statistics/activity-data`,
  NOTICES_STATS: `${API_PREFIX}/dashboard/notices/stats`,
  NOTICES_IMPORTANT: `${API_PREFIX}/dashboard/notices/important`,
  NOTICE_READ: (id: number | string) => `${API_PREFIX}/dashboard/notices/${id}/read`,
  NOTICES_MARK_ALL_READ: `${API_PREFIX}/dashboard/notices/mark-all-read`,
  NOTICE_DELETE: (id: number | string) => `${API_PREFIX}/dashboard/notices/${id}`,
  // ✅ 新增统计端点 - 修复dashboard页面数据加载问题
  GRADUATION_STATS: `${API_PREFIX}/dashboard/graduation-stats`,
  PRE_ENROLLMENT_STATS: `${API_PREFIX}/dashboard/pre-enrollment-stats`,
};

// 幼儿园管理接口
export const KINDERGARTEN_ENDPOINTS = {
  BASE: `${API_PREFIX}/kindergartens`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/kindergartens/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/kindergartens/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/kindergartens/${id}`,
};

// 班级管理接口
export const CLASS_ENDPOINTS = {
  BASE: `${API_PREFIX}/classes`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/classes/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/classes/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/classes/${id}`,
  UPDATE_STATUS: (id: number | string) => `${API_PREFIX}/classes/${id}/status`,
  TEACHERS: (id: number | string) => `${API_PREFIX}/classes/${id}/teachers`,
  STUDENTS: (id: number | string) => `${API_PREFIX}/classes/${id}/students`,
  REMOVE_STUDENT: (classId: number | string, studentId: number | string) =>
    `${API_PREFIX}/classes/${classId}/students/${studentId}`,
  TRANSFER: (id: number | string) => `${API_PREFIX}/classes/${id}/transfer`,
  STATISTICS: `${API_PREFIX}/classes/stats`,
  AVAILABLE_CLASSROOMS: `${API_PREFIX}/classes/available-classrooms`,
  EXPORT: `${API_PREFIX}/classes/export`,
  GET_STUDENTS: (id: number | string) => `${API_PREFIX}/classes/${id}/students`,
  GET_TEACHERS: (id: number | string) => `${API_PREFIX}/classes/${id}/teachers`,
};

// 教师管理接口
export const TEACHER_ENDPOINTS = {
  BASE: `${API_PREFIX}/teachers`,
  LIST: `${API_PREFIX}/teachers`,
  CREATE: `${API_PREFIX}/teachers`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/teachers/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/teachers/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/teachers/${id}`,
  SEARCH: `${API_PREFIX}/teachers/search`,
  BY_USER_ID: (userId: number | string) => `${API_PREFIX}/teachers/by-user/${userId}`,
  GET_CLASSES: (id: number | string) => `${API_PREFIX}/teachers/${id}/classes`,
  ASSIGN_CLASSES: (id: number | string) => `${API_PREFIX}/teachers/${id}/classes`,
  UPDATE_STATUS: (id: number | string) => `${API_PREFIX}/teachers/${id}/status`,
  PERFORMANCE: (id: number | string) => `${API_PREFIX}/teachers/${id}/performance`,
  SCHEDULE: (id: number | string) => `${API_PREFIX}/teachers/${id}/schedule`,
  STATS: (id: number | string) => `${API_PREFIX}/teachers/${id}/stats`,
  STATISTICS: `${API_PREFIX}/teachers/statistics`,
  EXPORT: `${API_PREFIX}/teachers/export`,
};

// 教师客户跟踪接口
export const TEACHER_CUSTOMER_ENDPOINTS = {
  BASE: `${API_PREFIX}/teacher/customers`,
  STATS: `${API_PREFIX}/teacher/customers/stats`,
  LIST: `${API_PREFIX}/teacher/customers/list`,
  ADD_FOLLOW: (customerId: number | string) => `${API_PREFIX}/teacher/customers/${customerId}/follow`,
  UPDATE_STATUS: (customerId: number | string) => `${API_PREFIX}/teacher/customers/${customerId}/status`,
  FOLLOW_RECORDS: (customerId: number | string) => `${API_PREFIX}/teacher/customers/${customerId}/follow-records`,
};


// 学生管理接口
export const STUDENT_ENDPOINTS = {
  BASE: `${API_PREFIX}/students`,
  LIST: `${API_PREFIX}/students`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/students/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/students/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/students/${id}`,
  GET_PARENTS: (id: number | string) => `${API_PREFIX}/students/${id}/parents`,
  SEARCH: `${API_PREFIX}/students/search`,
  AVAILABLE: `${API_PREFIX}/students/available`,
  STATS: `${API_PREFIX}/students/stats`,
  STATISTICS: `${API_PREFIX}/students/statistics`,
  UPDATE_STATUS: (id: number | string) => `${API_PREFIX}/students/${id}/status`,
  ASSIGN_CLASS: `${API_PREFIX}/students/assign-class`,
  BATCH_ASSIGN_CLASS: `${API_PREFIX}/students/batch-assign-class`,
  GROWTH_RECORDS: (id: number | string) => `${API_PREFIX}/students/${id}/growth-records`,
  GROWTH_RECORD: (id: number | string) => `${API_PREFIX}/students/${id}/growth-record`,
  PERFORMANCE: (id: number | string) => `${API_PREFIX}/students/${id}/performance`,
  ANALYTICS: (id: number | string) => `${API_PREFIX}/students/${id}/analytics`,
  ASSESSMENTS: `${API_PREFIX}/students/assessments`,
  DETAIL: (id: number | string) => `${API_PREFIX}/students/${id}`,
  ATTENDANCE: (id: number | string) => `${API_PREFIX}/students/${id}/attendance`,
  EXPORT_GROWTH_REPORT: (id: number | string) => `${API_PREFIX}/students/${id}/export-growth-report`,
  EXPORT_ASSESSMENTS: `${API_PREFIX}/students/export-assessments`,
  EXPORT_ANALYTICS: (id: number | string) => `${API_PREFIX}/students/${id}/export-analytics`,
  REMOVE_FROM_CLASS: (studentId: number | string, classId: number | string) =>
    `${API_PREFIX}/students/${studentId}/remove-from-class/${classId}`,
};

// 家长管理接口
export const PARENT_ENDPOINTS = {
  BASE: `${API_PREFIX}/parents`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/parents/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/parents/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/parents/${id}`,
  GET_STUDENTS: (id: number | string) => `${API_PREFIX}/parents/${id}/students`,
  GET_CHILDREN: (id: number | string) => `${API_PREFIX}/parents/${id}/children`,
  ADD_STUDENT: (id: number | string) => `${API_PREFIX}/parents/${id}/students`,
  REMOVE_STUDENT: (parentId: number | string, studentId: number | string) => `${API_PREFIX}/parents/${parentId}/students/${studentId}`,
};

// 通知管理接口
export const NOTIFICATION_ENDPOINTS_10 = {
  BASE: `${API_PREFIX}/notifications`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/notifications/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/notifications/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/notifications/${id}`,
  MARK_READ: (id: number | string) => `${API_PREFIX}/notifications/${id}/read`,
  MARK_ALL_READ: `${API_PREFIX}/notifications/mark-all-read`,
};

// 日程管理接口
export const SCHEDULE_ENDPOINTS = {
  BASE: `${API_PREFIX}/schedules`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/schedules/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/schedules/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/schedules/${id}`,
  BY_USER: (userId: number | string) => `${API_PREFIX}/schedules/user/${userId}`,
  BY_DATE: (date: string) => `${API_PREFIX}/schedules/date/${date}`,
};

// TODO管理接口
export const TODO_ENDPOINTS = {
  BASE: `${API_PREFIX}/todos`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/todos/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/todos/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/todos/${id}`,
  UPDATE_STATUS: (id: number | string) => `${API_PREFIX}/todos/${id}/status`,
  BY_USER: (userId: number | string) => `${API_PREFIX}/todos/user/${userId}`,
};

// 文件管理接口
export const FILE_ENDPOINTS_12 = {
  BASE: `${API_PREFIX}/files`,
  UPLOAD: `${API_PREFIX}/files/upload`,
  DOWNLOAD: (id: number | string) => `${API_PREFIX}/files/${id}/download`,
  DELETE: (id: number | string) => `${API_PREFIX}/files/${id}`,
};

// 测试系统接口
export const SYSTEM_TEST_ENDPOINTS = {
  HEALTH: `${API_PREFIX}/health`,
  VERSION: `${API_PREFIX}/version`,
  CACHE: `${API_PREFIX}/cache`,
  DOCS: `${API_PREFIX}/docs`,
  TEST: `${API_PREFIX}/test`,
};

// 系统备份接口
export const SYSTEM_BACKUP_ENDPOINTS = {
  BASE: `${API_PREFIX}/system-backup`,
  CREATE: `${API_PREFIX}/system-backup/create`,
  DATABASE: `${API_PREFIX}/system-backup/database`,
  RESTORE: `${API_PREFIX}/system-backup/restore`,
  LIST: `${API_PREFIX}/system-backup/list`,
  STATUS: `${API_PREFIX}/system-backup/stats`,
  SCHEDULE: `${API_PREFIX}/system-backup/schedule`,
  DELETE: (id: number | string) => `${API_PREFIX}/system-backup/${id}`,
  DOWNLOAD: (id: number | string) => `${API_PREFIX}/system-backup/${id}/download`,
  VALIDATE: (id: number | string) => `${API_PREFIX}/system-backup/validate/${id}`,
  CLEANUP: `${API_PREFIX}/system-backup/cleanup`,
};

// 操作日志接口
export const OPERATION_LOG_ENDPOINTS = {
  BASE: `${API_PREFIX}/operation-logs`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/operation-logs/${id}`,
  EXPORT: `${API_PREFIX}/operation-logs/export`,
};

// 广告管理接口
export const ADVERTISEMENT_ENDPOINTS_2 = {
  BASE: `${API_PREFIX}/advertisements`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/advertisements/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/advertisements/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/advertisements/${id}`,
};

// 营销活动接口
export const MARKETING_CAMPAIGN_ENDPOINTS_3 = {
  BASE: `${API_PREFIX}/marketing-campaigns`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/marketing-campaigns/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/marketing-campaigns/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/marketing-campaigns/${id}`,
  ANALYTICS: (id: number | string) => `${API_PREFIX}/marketing-campaigns/${id}/analytics`,
};

// 渠道追踪接口
export const CHANNEL_TRACKING_ENDPOINTS_4 = {
  BASE: `${API_PREFIX}/channel-trackings`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/channel-trackings/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/channel-trackings/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/channel-trackings/${id}`,
};

// 转化追踪接口
export const CONVERSION_TRACKING_ENDPOINTS_5 = {
  BASE: `${API_PREFIX}/conversion-trackings`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/conversion-trackings/${id}`,
};

// 录取结果接口
export const ADMISSION_RESULT_ENDPOINTS_6 = {
  BASE: `${API_PREFIX}/admission-results`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/admission-results/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/admission-results/${id}`,
};

// 录取通知接口
export const ADMISSION_NOTIFICATION_ENDPOINTS_7 = {
  BASE: `${API_PREFIX}/admission-notifications`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/admission-notifications/${id}`,
  SEND: (id: number | string) => `${API_PREFIX}/admission-notifications/${id}/send`,
};

// 海报模板接口
export const POSTER_TEMPLATE_ENDPOINTS_8 = {
  BASE: `${API_PREFIX}/poster-templates`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/poster-templates/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/poster-templates/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/poster-templates/${id}`,
};

// 海报生成接口（废弃，使用下面的POSTER_GENERATION_ENDPOINTS）
export const POSTER_GENERATION_ENDPOINTS_9 = {
  BASE: `${API_PREFIX}/poster-generation`, // 修复：统一为单数形式
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/poster-generation/${id}`,
  GENERATE: `${API_PREFIX}/poster-generation/generate`,
};

// 绩效规则接口
export const PERFORMANCE_RULE_ENDPOINTS = {
  BASE: `${API_PREFIX}/performance/rules`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/performance/rules/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/performance/rules/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/performance/rules/${id}`,
};

// 绩效管理接口
export const PERFORMANCE_ENDPOINTS = {
  BASE: `${API_PREFIX}/performance`,
  EVALUATIONS: `${API_PREFIX}/performance/evaluations`,
  REPORTS: `${API_PREFIX}/performance/reports`,
  EVALUATION_BY_ID: (id: number | string) => `${API_PREFIX}/performance/evaluations/${id}`,
  REPORT_BY_ID: (id: number | string) => `${API_PREFIX}/performance/reports/${id}`,
};

// 系统配置接口
export const SYSTEM_CONFIG_ENDPOINTS = {
  BASE: `${API_PREFIX}/system-configs`,
  GET_BY_KEY: (key: string) => `${API_PREFIX}/system-configs/${key}`,
  UPDATE: `${API_PREFIX}/system-configs`,
};

// 系统AI模型接口
export const SYSTEM_AI_MODEL_ENDPOINTS = {
  BASE: `${API_PREFIX}/system/ai-models`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/system/ai-models/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/system/ai-models/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/system/ai-models/${id}`,
};

// 招生任务接口
export const ENROLLMENT_TASK_ENDPOINTS = {
  BASE: `${API_PREFIX}/enrollment-tasks`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/enrollment-tasks/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/enrollment-tasks/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/enrollment-tasks/${id}`,
};

// 消息模板接口
export const MESSAGE_TEMPLATE_ENDPOINTS_11 = {
  BASE: `${API_PREFIX}/message-templates`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/message-templates/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/message-templates/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/message-templates/${id}`,
};

// 聊天接口
export const CHAT_ENDPOINTS = {
  BASE: `${API_PREFIX}/chat`,
  SEND_MESSAGE: `${API_PREFIX}/chat/send`,
  GET_HISTORY: (conversationId: number | string) => `${API_PREFIX}/chat/history/${conversationId}`,
  START_CONVERSATION: `${API_PREFIX}/chat/start`,
};

// 示例接口
export const EXAMPLE_ENDPOINTS = {
  BASE: `${API_PREFIX}/examples`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/examples/${id}`,
};

// 错误管理接口
export const ERROR_ENDPOINTS = {
  BASE: `${API_PREFIX}/errors`,
  REPORT: `${API_PREFIX}/errors/report`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/errors/${id}`,
};



// 广告管理接口
export const ADVERTISEMENT_ENDPOINTS = {
  BASE: `${API_PREFIX}/advertisement`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/advertisement/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/advertisement/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/advertisement/${id}`,
};

// 园长绩效接口
export const PRINCIPAL_PERFORMANCE_ENDPOINTS = {
  STATS: `${API_PREFIX}/principal/performance/stats`,
  RANKINGS: `${API_PREFIX}/principal/performance/rankings`,
  DETAILS: `${API_PREFIX}/principal/performance/details`,
  EXPORT: `${API_PREFIX}/principal/performance/export`,
  GOALS: `${API_PREFIX}/principal/performance/goals`,
};

// 营销活动接口
export const MARKETING_CAMPAIGN_ENDPOINTS = {
  BASE: `${API_PREFIX}/marketing-campaign`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/marketing-campaign/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/marketing-campaign/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/marketing-campaign/${id}`,
};

// 渠道追踪接口
export const CHANNEL_TRACKING_ENDPOINTS = {
  BASE: `${API_PREFIX}/channel-tracking`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/channel-tracking/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/channel-tracking/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/channel-tracking/${id}`,
};

// 转化追踪接口
export const CONVERSION_TRACKING_ENDPOINTS = {
  BASE: `${API_PREFIX}/conversion-tracking`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/conversion-tracking/${id}`,
};

// 录取结果接口
export const ADMISSION_RESULT_ENDPOINTS = {
  BASE: `${API_PREFIX}/admission-result`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/admission-result/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/admission-result/${id}`,
};

// 录取通知接口
export const ADMISSION_NOTIFICATION_ENDPOINTS = {
  BASE: `${API_PREFIX}/admission-notification`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/admission-notification/${id}`,
  SEND: (id: number | string) => `${API_PREFIX}/admission-notification/${id}/send`,
};

// 海报模板接口
export const POSTER_TEMPLATE_ENDPOINTS = {
  BASE: `${API_PREFIX}/poster-templates`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/poster-templates/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/poster-templates/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/poster-templates/${id}`,
};

// 海报生成接口（推荐使用）
export const POSTER_GENERATION_ENDPOINTS = {
  BASE: `${API_PREFIX}/poster-generation`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/poster-generation/${id}`,
  GENERATE: `${API_PREFIX}/poster-generation/generate`,
};

// 系统接口
export const SYSTEM_ENDPOINTS = {
  HEALTH: `${API_PREFIX}/health`,
  VERSION: `${API_PREFIX}/version`,
  API_LIST: `${API_PREFIX}/list`,
  DEPARTMENTS_TREE: `${API_PREFIX}/system/departments/tree`,
};

// 系统用户接口
export const SYSTEM_USER_ENDPOINTS = {
  BASE: `${API_PREFIX}/system/users`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/system/users/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/system/users/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/system/users/${id}`,
  UPDATE_STATUS: (id: number | string) => `${API_PREFIX}/system/users/${id}/status`,
  RESET_PASSWORD: (id: number | string) => `${API_PREFIX}/system/users/${id}/reset-password`,
  UPDATE_ROLES: (id: number | string) => `${API_PREFIX}/system/users/${id}/roles`,
};

// 系统角色接口
export const SYSTEM_ROLE_ENDPOINTS = {
  BASE: `${API_PREFIX}/system/roles`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/system/roles/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/system/roles/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/system/roles/${id}`,
  PERMISSIONS: (id: number | string) => `${API_PREFIX}/system/roles/${id}/permissions`,
};

// 系统权限接口（主要权限管理接口）
export const SYSTEM_PERMISSION_ENDPOINTS = {
  BASE: `${API_PREFIX}/system/permissions`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/system/permissions/${id}`,
  GET_TREE: `${API_PREFIX}/system/permissions/tree`,
  MY_PAGES: `${API_PREFIX}/permissions/my-pages`,
  CHECK_PAGE: (pagePath: string) => `${API_PREFIX}/permissions/check/${pagePath}`,
  ROLE_PAGES: (roleId: number | string) => `${API_PREFIX}/permissions/roles/${roleId}`,
  UPDATE_ROLE_PAGES: (roleId: number | string) => `${API_PREFIX}/permissions/roles/${roleId}`,
};

// 系统设置接口
export const SYSTEM_SETTINGS_ENDPOINTS = {
  BASE: `${API_PREFIX}/system/settings`,
  GET_BY_KEY: (key: string) => `${API_PREFIX}/system/settings/${key}`,
  UPDATE: `${API_PREFIX}/system/settings`,
  RESTORE_DEFAULTS: `${API_PREFIX}/system/settings/restore-defaults`,
  EMAIL_TEST: `${API_PREFIX}/system/settings/test-email`,
  STORAGE_TEST: `${API_PREFIX}/system/settings/test-storage`,
};

// 系统日志接口
export const SYSTEM_LOG_ENDPOINTS = {
  BASE: `${API_PREFIX}/system-logs`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/system-logs/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/system-logs/${id}`,
  BATCH_DELETE: `${API_PREFIX}/system-logs/batch`,
  CLEAR: `${API_PREFIX}/system-logs/clear`,
  EXPORT: `${API_PREFIX}/system-logs/export`,
};

// 上传接口
export const UPLOAD_ENDPOINTS = {
  FILE: `${API_PREFIX}/upload/file`,
  IMAGE: `${API_PREFIX}/upload/image`,
  AVATAR: `${API_PREFIX}/upload/avatar`,
};

// AI记忆接口
export const AI_MEMORY_ENDPOINTS = {
  CREATE: `${API_PREFIX}/ai/memory`,
  GET_CONVERSATION: (conversationId: number | string, userId: number | string) =>
    `${API_PREFIX}/ai/memory/conversation/${conversationId}/users/${userId}`,
  DELETE: (memoryId: number | string, userId: number | string) =>
    `${API_PREFIX}/ai/memory/${memoryId}/users/${userId}`,
  DELETE_BY_ID: (memoryId: number | string) => `${API_PREFIX}/ai/memory/${memoryId}`,
  SUMMARIZE: (conversationId: number | string, userId: number | string) =>
    `${API_PREFIX}/ai/memory/summarize/conversation/${conversationId}/users/${userId}`,
  CREATE_WITH_EMBEDDING: `${API_PREFIX}/ai/memory/embedding`,
  SEARCH_SIMILAR: `${API_PREFIX}/ai/memory/search/similar`,
  SEARCH: (userId: number | string) => `${API_PREFIX}/ai/memory/memory/search/${userId}`,
  GET_BY_ID: (memoryId: number | string) => `${API_PREFIX}/ai/memory/memory/${memoryId}`,
  UPDATE: (memoryId: number | string) => `${API_PREFIX}/ai/memory/memory/${memoryId}`,
  STATS: (userId: number | string) => `${API_PREFIX}/ai/memory/memory/stats/${userId}`,
  ARCHIVE: (memoryId: number | string) => `${API_PREFIX}/ai/memory/memory/archive/${memoryId}`,
  CLEANUP_EXPIRED: `${API_PREFIX}/ai/memory/memory/expired`,
};

// AI模块接口
export const AI_ENDPOINTS = {
  // 初始化
  INITIALIZE: `${API_PREFIX}/ai/initialize`,

  // 模型管理
  MODELS: `${API_PREFIX}/ai/models`,
  MODEL_BY_ID: (id: number | string) => `${API_PREFIX}/ai/models/${id}`,
  MODEL_BILLING: (id: number | string) => `${API_PREFIX}/ai/models/${id}/billing`,
  MODEL_DEFAULT: `${API_PREFIX}/ai/models/default`,
  MODEL_CAPABILITIES: (id: number | string, capability: string) =>
    `${API_PREFIX}/ai/models/${id}/capabilities/${capability}`,

  // 用户配额管理
  USER_QUOTA: `${API_PREFIX}/ai/user-quota`,

  // 上传和媒体处理
  UPLOAD_IMAGE: `${API_PREFIX}/ai/upload/image`,
  TRANSCRIBE_AUDIO: `${API_PREFIX}/ai/transcribe/audio`,

  // 会话管理
  CONVERSATIONS: `${API_PREFIX}/ai/conversations`,
  CONVERSATION_BY_ID: (id: number | string) => `${API_PREFIX}/ai/conversations/${id}`,
  CONVERSATION_MESSAGES: (id: number | string) => `${API_PREFIX}/ai/conversations/${id}/messages`,

  // 消息管理
  SEND_MESSAGE: (conversationId: number | string) =>
    `${API_PREFIX}/ai/conversations/${conversationId}/messages`,

  // 更新消息元数据
  CONVERSATION_MESSAGE_METADATA: (conversationId: number | string, messageId: number | string) =>
    `${API_PREFIX}/ai/conversations/${conversationId}/messages/${messageId}/metadata`,

  // 记忆管理
  MEMORY: {
    ...AI_MEMORY_ENDPOINTS,
    SEARCH: (userId: number | string) => `${API_PREFIX}/ai/memory/search/${userId}`,
    DELETE_BY_ID: (memoryId: number | string) => `${API_PREFIX}/ai/memory/${memoryId}`,
  },

  // 咨询功能
  CONSULTATION: {
    START: `${API_PREFIX}/ai/consultation/start`,
  },
  CONSULTATION_START: `${API_PREFIX}/ai/consultation/start`,

  // 智能学生分析
  STUDENT_GROWTH_ANALYSIS: (studentId: number | string) =>
    `${API_PREFIX}/ai/student-growth-analysis/${studentId}`,
  GENERATE_LEARNING_PLAN: `${API_PREFIX}/ai/generate-learning-plan`,
  STUDENT_MILESTONES: (studentId: number | string) =>
    `${API_PREFIX}/ai/student-milestones/${studentId}`,
  STUDENT_RECOMMENDATIONS: (studentId: number | string) =>
    `${API_PREFIX}/ai/student-recommendations/${studentId}`,

  // 智能教师分析
  TEACHER_PERFORMANCE_ANALYSIS: (teacherId: number | string) =>
    `${API_PREFIX}/ai/teacher-performance-analysis/${teacherId}`,
  TEACHER_OPTIMIZATION: `${API_PREFIX}/ai/teacher-optimization`,
  TEACHER_DEVELOPMENT_PLAN: (teacherId: number | string) =>
    `${API_PREFIX}/ai/teacher-development-plan/${teacherId}`,
  TEACHING_INSIGHTS: (teacherId: number | string) =>
    `${API_PREFIX}/ai/teaching-insights/${teacherId}`,

  // 智能班级管理
  CLASS_ATMOSPHERE_MONITORING: (classId: number | string) =>
    `${API_PREFIX}/ai/class-atmosphere/${classId}`,
  OPTIMAL_CLASS_COMPOSITION: `${API_PREFIX}/ai/optimal-class-composition`,
  CONFLICT_PREDICTION: (classId: number | string) =>
    `${API_PREFIX}/ai/conflict-prediction/${classId}`,
  INTERVENTION_SUGGESTIONS: (classId: number | string) =>
    `${API_PREFIX}/ai/intervention-suggestions/${classId}`,

  // 智能家长沟通
  PERSONALIZED_PARENT_CONTENT: `${API_PREFIX}/ai/personalized-parent-content`,
  RESPONSE_SUGGESTIONS: `${API_PREFIX}/ai/response-suggestions`,
  COMMUNICATION_ANALYSIS: `${API_PREFIX}/ai/communication-analysis`,
  PARENT_ENGAGEMENT_OPTIMIZATION: `${API_PREFIX}/ai/parent-engagement-optimization`,

  // 智能排课系统
  SCHEDULE_OPTIMIZATION: `${API_PREFIX}/ai/schedule-optimization`,
  RESOURCE_ALLOCATION: `${API_PREFIX}/ai/resource-allocation`,
  WORKLOAD_BALANCE: `${API_PREFIX}/ai/workload-balance`,

  // 专家咨询 - 独立模块
  EXPERT_CONSULTATION: {
    START: `${API_PREFIX}/expert-consultation/start`,
    NEXT_SPEECH: `${API_PREFIX}/expert-consultation/next-speech`,
    SUMMARY: `${API_PREFIX}/expert-consultation/summary`,
    ACTION_PLAN: `${API_PREFIX}/expert-consultation/action-plan`,
  },
};

// AI活动策划接口
export const ACTIVITY_PLANNER_ENDPOINTS = {
  GENERATE: `${API_PREFIX}/activity-planner/generate`,
  STATS: `${API_PREFIX}/activity-planner/stats`,
  MODELS: `${API_PREFIX}/activity-planner/models`,
};

// 智能营销自动化接口
export const MARKETING_AUTOMATION_ENDPOINTS = {
  BASE: `${API_PREFIX}/marketing`,
  INTELLIGENT_CAMPAIGN: `${API_PREFIX}/marketing/intelligent-campaign`,
  CUSTOMER_JOURNEY_MAPPING: `${API_PREFIX}/ai/customer-journey-mapping`,
  DYNAMIC_CONTENT_PERSONALIZATION: `${API_PREFIX}/ai/dynamic-content-personalization`,
  PREDICTIVE_MARKETING: `${API_PREFIX}/ai/predictive-marketing`,
  AUTOMATION_RULES: `${API_PREFIX}/marketing/automation-rules`,
  RULE_BY_ID: (id: number | string) => `${API_PREFIX}/marketing/automation-rules/${id}`,
  TOGGLE_RULE: (id: number | string) => `${API_PREFIX}/marketing/automation-rules/${id}/toggle`,
  CUSTOMER_SEGMENTS: `${API_PREFIX}/marketing/customer-segments`,
  BEHAVIOR_PREDICTIONS: `${API_PREFIX}/ai/behavior-predictions`,
};

// 客户生命周期管理接口
export const CUSTOMER_LIFECYCLE_ENDPOINTS = {
  BASE: `${API_PREFIX}/customer`,
  LIFECYCLE_ANALYSIS: `${API_PREFIX}/ai/customer-lifecycle-analysis`,
  INTELLIGENT_COMMUNICATION_QUEUE: `${API_PREFIX}/ai/intelligent-communication-queue`,
  EXECUTE_RETENTION_STRATEGY: `${API_PREFIX}/customer/execute-retention-strategy`,
  PURSUE_UPSELL_OPPORTUNITY: `${API_PREFIX}/customer/pursue-upsell-opportunity`,
  APPLY_INSIGHT: `${API_PREFIX}/customer/apply-insight`,
  OPTIMIZE_LIFECYCLE_STAGE: `${API_PREFIX}/customer/optimize-lifecycle-stage`,
  STAGE_DETAILS: (stageName: string) => `${API_PREFIX}/customer/stage-details/${stageName}`,
  SEND_COMMUNICATION: `${API_PREFIX}/customer/send-communication`,
  SCHEDULE_COMMUNICATION: `${API_PREFIX}/customer/schedule-communication`,
  EXECUTE_RECOMMENDATION: `${API_PREFIX}/customer/execute-recommendation`,
  SCHEDULE_RECOMMENDATION: `${API_PREFIX}/customer/schedule-recommendation`,
};

// 智能活动分析接口
export const ACTIVITY_ANALYTICS_ENDPOINTS = {
  BASE: `${API_PREFIX}/activity`,
  ACTIVITIES: `${API_PREFIX}/activities`,
  DEEP_ANALYSIS: `${API_PREFIX}/ai/deep-activity-analysis`,
  ROI_ANALYSIS: `${API_PREFIX}/ai/activity-roi-analysis`,
  OPTIMIZATION_RECOMMENDATIONS: `${API_PREFIX}/ai/activity-optimization-recommendations`,
  PREDICT_SUCCESS: `${API_PREFIX}/ai/predict-activity-success`,
  ACTIVITY_COMPARISON: `${API_PREFIX}/ai/activity-comparison`,
  ACTIVITY_TRENDS: `${API_PREFIX}/ai/activity-trends`,
  ACTIVITY_BENCHMARKS: `${API_PREFIX}/activity/benchmarks`,
  HISTORICAL_DATA: `${API_PREFIX}/activity/historical-data`,
  PARTICIPANT_PROFILES: `${API_PREFIX}/participant/profiles`,
  EXTERNAL_FACTORS: `${API_PREFIX}/external/factors`,
  IMPLEMENT_RECOMMENDATION: `${API_PREFIX}/activity/implement-recommendation`,
};

// 决策支持系统接口
export const DECISION_SUPPORT_ENDPOINTS = {
  BASE: `${API_PREFIX}/decision`,
  SCENARIO_ANALYSIS: `${API_PREFIX}/ai/decision-scenario-analysis`,
  STRATEGIC_PLANNING_ASSISTANT: `${API_PREFIX}/ai/strategic-planning-assistant`,
  COMPREHENSIVE_RISK_ASSESSMENT: `${API_PREFIX}/ai/comprehensive-risk-assessment`,
  PERFORMANCE_PREDICTION: `${API_PREFIX}/ai/performance-prediction`,
  CREATE_SCENARIO: `${API_PREFIX}/decision/create-scenario`,
  EXECUTE_DECISION: `${API_PREFIX}/decision/execute`,
  SIMULATE_OUTCOME: `${API_PREFIX}/ai/simulate-decision-outcome`,
  IMPLEMENT_MITIGATION: `${API_PREFIX}/risk/implement-mitigation`,
  CURRENT_SITUATION_ANALYSIS: `${API_PREFIX}/analysis/current-situation`,
  MARKET_TREND_ANALYSIS: `${API_PREFIX}/analysis/market-trends`,
  COMPETITOR_ANALYSIS: `${API_PREFIX}/analysis/competitors`,
  RESOURCE_ANALYSIS: `${API_PREFIX}/analysis/resources`,
  BASELINE_METRICS: `${API_PREFIX}/metrics/baseline`,
};

// AI专家咨询接口 - 独立模块 (旧版本，已弃用)
export const EXPERT_CONSULTATION_ENDPOINTS = {
  START_CONSULTATION: `${API_PREFIX}/expert-consultation/start`,
  GET_NEXT_SPEECH: (sessionId: number | string) => `${API_PREFIX}/expert-consultation/${sessionId}/next`,
  GET_PROGRESS: (sessionId: number | string) => `${API_PREFIX}/expert-consultation/${sessionId}/progress`,
  GET_SUMMARY: (sessionId: number | string) => `${API_PREFIX}/expert-consultation/${sessionId}/summary`,
  GENERATE_ACTION_PLAN: (sessionId: number | string) => `${API_PREFIX}/expert-consultation/${sessionId}/action-plan`,
  GET_SESSION: (sessionId: number | string) => `${API_PREFIX}/expert-consultation/${sessionId}`,
};

// 智能专家咨询接口 - 新版本 (使用Function Calls和大模型智能选择专家)
export const SMART_EXPERT_ENDPOINTS = {
  // 智能专家聊天 - 主要接口
  SMART_CHAT: `${API_PREFIX}/ai/smart-expert/smart-chat`,

  // 直接调用专家
  CALL_EXPERT: `${API_PREFIX}/ai/smart-expert/call`,

  // 获取专家列表
  GET_EXPERTS: `${API_PREFIX}/ai/smart-expert/experts`,

  // 智能专家咨询会话 (带思考过程推送)
  START_CONSULTATION: `${API_PREFIX}/ai/smart-expert/start`,
  THINKING_STREAM: (sessionId: string) => `${API_PREFIX}/ai/smart-expert/thinking-stream/${sessionId}`,
  EXPERT_STATUS_STREAM: (sessionId: string) => `${API_PREFIX}/ai/smart-expert/expert-status-stream/${sessionId}`,
  COMPLETION_STREAM: (sessionId: string) => `${API_PREFIX}/ai/smart-expert/completion-stream/${sessionId}`,
  CONTINUE_CONSULTATION: (sessionId: string) => `${API_PREFIX}/ai/smart-expert/continue/${sessionId}`,
  GET_SESSION_STATUS: (sessionId: string) => `${API_PREFIX}/ai/smart-expert/session/${sessionId}`,

  // 统一智能系统
  UNIFIED_CHAT: `${API_PREFIX}/ai/unified/unified-chat`,
  UNIFIED_STATUS: `${API_PREFIX}/ai/unified/status`,
  UNIFIED_CAPABILITIES: `${API_PREFIX}/ai/unified/capabilities`,
};

// 考勤管理接口
export const ATTENDANCE_ENDPOINTS = {
  BASE: `${API_PREFIX}/attendance`,
  STUDENT: (studentId: number | string) => `${API_PREFIX}/attendance/students/${studentId}`,
  CLASS: (classId: number | string) => `${API_PREFIX}/attendance/classes/${classId}`,
  RECORD: `${API_PREFIX}/attendance/record`,
  UPDATE: (id: number | string) => `${API_PREFIX}/attendance/${id}`,
  STATISTICS: `${API_PREFIX}/attendance/statistics`,
};

// 招生统计接口
export const ENROLLMENT_STATISTICS_ENDPOINTS = {
  BASE: `${API_PREFIX}/enrollment-statistics`,
  PLANS: `${API_PREFIX}/enrollment-statistics/plans`,
  CHANNELS: `${API_PREFIX}/enrollment-statistics/channels`,
  ACTIVITIES: `${API_PREFIX}/enrollment-statistics/activities`,
  CONVERSIONS: `${API_PREFIX}/enrollment-statistics/conversions`,
  PERFORMANCE: `${API_PREFIX}/enrollment-statistics/performance`,
  TRENDS: `${API_PREFIX}/enrollment-statistics/trends`,
};

// 统计分析端点
export const STATISTICS_ENDPOINTS = {
  BASE: `${API_PREFIX}/statistics`,
  DASHBOARD: `${API_PREFIX}/statistics/dashboard`,
  ENROLLMENT: `${API_PREFIX}/statistics/enrollment`,
  STUDENTS: `${API_PREFIX}/statistics/students`,
  REVENUE: `${API_PREFIX}/statistics/revenue`,
  ACTIVITIES: `${API_PREFIX}/statistics/activities`,
  REALTIME: `${API_PREFIX}/statistics/realtime`,
  FINANCIAL: `${API_PREFIX}/statistics/financial`,
  REGIONS: `${API_PREFIX}/statistics/regions`,
  REPORTS: `${API_PREFIX}/statistics/reports`,
  EXPORT_DRILLDOWN: `${API_PREFIX}/statistics/export-drilldown`,
  COMPREHENSIVE: `${API_PREFIX}/statistics/comprehensive`,
  FUNNEL: `${API_PREFIX}/statistics/funnel`,
  CONVERSION: `${API_PREFIX}/statistics/conversion`,
  LIFECYCLE: `${API_PREFIX}/statistics/lifecycle`,
  COHORT: `${API_PREFIX}/statistics/cohort`,
  RETENTION: `${API_PREFIX}/statistics/retention`,
  PERFORMANCE: `${API_PREFIX}/statistics/performance`,
  KPI: `${API_PREFIX}/statistics/kpi`,
  TRENDS: `${API_PREFIX}/statistics/trends`,
};

// 分析相关端点
export const ANALYSIS_ENDPOINTS = {
  CURRENT_SITUATION: `${API_PREFIX}/analysis/current-situation`,
  MARKET_TRENDS: `${API_PREFIX}/analysis/market-trends`,
  COMPETITORS: `${API_PREFIX}/analysis/competitors`,
  RESOURCES: `${API_PREFIX}/analysis/resources`,
  SWOT: `${API_PREFIX}/analysis/swot`,
  PERFORMANCE: `${API_PREFIX}/analysis/performance`,
  COST_BENEFIT: `${API_PREFIX}/analysis/cost-benefit`,
  RISK: `${API_PREFIX}/analysis/risk`,
};

// 客户端点
export const CUSTOMER_ENDPOINTS = {
  BASE: `${API_PREFIX}/customers`,
  ASSIGN: `${API_PREFIX}/customers/assign`,
  STATS: `${API_PREFIX}/customers/stats`,
  POOL: `${API_PREFIX}/customer-pool`,
  POOL_STATS: `${API_PREFIX}/centers/customer-pool/dashboard`,
  POOL_BY_ID: (id: number | string) => `${API_PREFIX}/customer-pool/${id}`,
  LIFECYCLE: `${API_PREFIX}/customers/lifecycle`,
  SEGMENTS: `${API_PREFIX}/customers/segments`,
  INSIGHTS: `${API_PREFIX}/customers/insights`,
  COMMUNICATIONS: `${API_PREFIX}/customers/communications`,
  TOUCHPOINTS: `${API_PREFIX}/customers/touchpoints`,
};

// 风险管理端点
export const RISK_ENDPOINTS = {
  BASE: `${API_PREFIX}/risk`,
  ASSESSMENT: `${API_PREFIX}/risk/assessment`,
  MITIGATION: `${API_PREFIX}/risk/mitigation`,
  MONITORING: `${API_PREFIX}/risk/monitoring`,
  REPORTS: `${API_PREFIX}/risk/reports`,
  IMPLEMENT_MITIGATION: `${API_PREFIX}/risk/implement-mitigation`,
};

// 指标端点
export const METRICS_ENDPOINTS = {
  BASE: `${API_PREFIX}/metrics`,
  BASELINE: `${API_PREFIX}/metrics/baseline`,
  KPI: `${API_PREFIX}/metrics/kpi`,
  PERFORMANCE: `${API_PREFIX}/metrics/performance`,
  TRENDS: `${API_PREFIX}/metrics/trends`,
  BENCHMARKS: `${API_PREFIX}/metrics/benchmarks`,
};

// 营销端点扩展
export const MARKETING_ENDPOINTS = {
  BASE: `${API_PREFIX}/marketing`,
  CAMPAIGNS: `${API_PREFIX}/marketing/campaigns`,
  INTELLIGENT_CAMPAIGN: `${API_PREFIX}/marketing/intelligent-campaign`,
  AUTOMATION_RULES: `${API_PREFIX}/marketing/automation-rules`,
  RULE_BY_ID: (id: number | string) => `${API_PREFIX}/marketing/automation-rules/${id}`,
  TOGGLE_RULE: (id: number | string) => `${API_PREFIX}/marketing/automation-rules/${id}/toggle`,
  CUSTOMER_SEGMENTS: `${API_PREFIX}/marketing/customer-segments`,
  CHANNELS: `${API_PREFIX}/marketing/channels`,
  ROI: `${API_PREFIX}/marketing/roi`,
  ATTRIBUTION: `${API_PREFIX}/marketing/attribution`,
};

// 系统备份端点
export const BACKUP_ENDPOINTS = {
  BASE: `${API_PREFIX}/system/backups`,
  CREATE: `${API_PREFIX}/system/backups/create`,
  RESTORE: (id: number | string) => `${API_PREFIX}/system/backups/${id}/restore`,
  DELETE: (id: number | string) => `${API_PREFIX}/system/backups/${id}`,
  DOWNLOAD: (id: number | string) => `${API_PREFIX}/system/backups/${id}/download`,
  LIST: `${API_PREFIX}/system/backups/list`,
  STATUS: `${API_PREFIX}/system/backups/status`,
  VERIFY: (id: number | string) => `${API_PREFIX}/system/backups/${id}/verify`,
  SETTINGS: `${API_PREFIX}/system/backups/settings`,
};

// 招生跟进端点
export const ENROLLMENT_FOLLOW_ENDPOINTS = {
  BASE: `${API_PREFIX}/enrollment/follow`,
  BY_ID: (id: number | string) => `${API_PREFIX}/enrollment/follow/${id}`,
  STATS: `${API_PREFIX}/enrollment/follow/stats`,
  BATCH: `${API_PREFIX}/enrollment/follow/batch`,
};

// 通知端点
export const NOTIFICATION_ENDPOINTS = {
  BASE: `${API_PREFIX}/notifications`,
  SEND: `${API_PREFIX}/notifications/send`,
  BATCH_SEND: `${API_PREFIX}/notifications/batch-send`,
  TEMPLATES: `${API_PREFIX}/notifications/templates`,
  SETTINGS: `${API_PREFIX}/notifications/settings`,
  HISTORY: `${API_PREFIX}/notifications/history`,
  MARK_READ: (id: number | string) => `${API_PREFIX}/notifications/${id}/read`,
};

// 消息模板端点
export const MESSAGE_TEMPLATE_ENDPOINTS = {
  BASE: `${API_PREFIX}/message-templates`,
  BY_ID: (id: number | string) => `${API_PREFIX}/message-templates/${id}`,
  PREVIEW: (id: number | string) => `${API_PREFIX}/message-templates/${id}/preview`,
  CATEGORIES: `${API_PREFIX}/message-templates/categories`,
  VARIABLES: `${API_PREFIX}/message-templates/variables`,
};

// 文件管理端点
export const FILE_ENDPOINTS = {
  UPLOAD: `${API_PREFIX}/files/upload`,
  DELETE: (id: number | string) => `${API_PREFIX}/files/${id}`,
  DOWNLOAD: (id: number | string) => `${API_PREFIX}/files/${id}/download`,
  LIST: `${API_PREFIX}/files`,
  METADATA: (id: number | string) => `${API_PREFIX}/files/${id}/metadata`,
};

// 导出所有API端点
export default {
  API_PREFIX,
  AUTH: AUTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  ROLE: ROLE_ENDPOINTS,
  PERMISSION: PERMISSION_ENDPOINTS,
  DASHBOARD: DASHBOARD_ENDPOINTS,
  KINDERGARTEN: KINDERGARTEN_ENDPOINTS,
  CLASS: CLASS_ENDPOINTS,
  TEACHER: TEACHER_ENDPOINTS,
  TEACHER_CUSTOMER: TEACHER_CUSTOMER_ENDPOINTS,
  STUDENT: STUDENT_ENDPOINTS,
  PARENT: PARENT_ENDPOINTS,
  ENROLLMENT_PLAN: ENROLLMENT_PLAN_ENDPOINTS,
  ENROLLMENT_QUOTA: ENROLLMENT_QUOTA_ENDPOINTS,
  ENROLLMENT_APPLICATION: ENROLLMENT_APPLICATION_ENDPOINTS,
  ENROLLMENT_CONSULTATION: ENROLLMENT_CONSULTATION_ENDPOINTS,
  ACTIVITY: ACTIVITY_ENDPOINTS,
  ACTIVITY_PLAN: ACTIVITY_PLAN_ENDPOINTS,
  ACTIVITY_REGISTRATION: ACTIVITY_REGISTRATION_ENDPOINTS,
  ACTIVITY_CHECKIN: ACTIVITY_CHECKIN_ENDPOINTS,
  ACTIVITY_EVALUATION: ACTIVITY_EVALUATION_ENDPOINTS,
  ADVERTISEMENT: ADVERTISEMENT_ENDPOINTS,
  PRINCIPAL_PERFORMANCE: PRINCIPAL_PERFORMANCE_ENDPOINTS,
  MARKETING_CAMPAIGN: MARKETING_CAMPAIGN_ENDPOINTS,
  CHANNEL_TRACKING: CHANNEL_TRACKING_ENDPOINTS,
  CONVERSION_TRACKING: CONVERSION_TRACKING_ENDPOINTS,
  ADMISSION_RESULT: ADMISSION_RESULT_ENDPOINTS,
  ADMISSION_NOTIFICATION: ADMISSION_NOTIFICATION_ENDPOINTS,
  POSTER_TEMPLATE: POSTER_TEMPLATE_ENDPOINTS,
  POSTER_GENERATION: POSTER_GENERATION_ENDPOINTS,
  SYSTEM: SYSTEM_ENDPOINTS,
  SYSTEM_USER: SYSTEM_USER_ENDPOINTS,
  SYSTEM_ROLE: SYSTEM_ROLE_ENDPOINTS,
  SYSTEM_PERMISSION: SYSTEM_PERMISSION_ENDPOINTS,
  SYSTEM_SETTINGS: SYSTEM_SETTINGS_ENDPOINTS,
  SYSTEM_LOG: SYSTEM_LOG_ENDPOINTS,
  UPLOAD: UPLOAD_ENDPOINTS,
  ATTENDANCE: ATTENDANCE_ENDPOINTS,
  ENROLLMENT_STATISTICS: ENROLLMENT_STATISTICS_ENDPOINTS,
  AI: AI_ENDPOINTS,
  ACTIVITY_PLANNER: ACTIVITY_PLANNER_ENDPOINTS,
  EXPERT_CONSULTATION: EXPERT_CONSULTATION_ENDPOINTS,
  MARKETING_AUTOMATION: MARKETING_AUTOMATION_ENDPOINTS,
  CUSTOMER_LIFECYCLE: CUSTOMER_LIFECYCLE_ENDPOINTS,
  ACTIVITY_ANALYTICS: ACTIVITY_ANALYTICS_ENDPOINTS,
  DECISION_SUPPORT: DECISION_SUPPORT_ENDPOINTS,
  APPLICATION: ENROLLMENT_APPLICATION_ENDPOINTS,
};