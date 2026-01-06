/**
 * 硬编码数据替换API端点定义
 * 为组件中检测到的硬编码数据提供对应的真实API端点
 */

// 系统管理相关API
export const SYSTEM_ENDPOINTS = {
  // 角色管理
  ROLES: '/api/roles',
  ROLE_OPTIONS: '/api/roles/options',
  ROLE_PERMISSIONS: '/api/roles/:id/permissions',

  // 用户管理
  USERS: '/api/users',
  USER_OPTIONS: '/api/users/options',

  // 权限管理
  PERMISSIONS: '/api/permissions',
  PERMISSION_TREE: '/api/permissions/tree'
}

// 招生管理相关API
export const ENROLLMENT_ENDPOINTS = {
  // 问题列表
  QUESTIONS: '/api/enrollment/questions',
  QUESTION_OPTIONS: '/api/enrollment/questions/options',

  // 申请管理
  APPLICATIONS: '/api/enrollment/applications',
  APPLICATION_STATS: '/api/enrollment/applications/stats',

  // 面试管理
  INTERVIEWS: '/api/enrollment/interviews',
  INTERVIEW_EVALUATION: '/api/enrollment/interviews/:id/evaluation'
}

// 学生管理相关API
export const STUDENT_ENDPOINTS = {
  // 学生基础信息
  STUDENTS: '/api/students',
  STUDENT_DETAIL: '/api/students/:id',
  STUDENT_GROWTH_RECORDS: '/api/students/:id/growth-records',
  STUDENT_ATTENDANCE: '/api/students/:id/attendance',

  // 学生统计
  STUDENT_STATS: '/api/students/stats',
  STUDENT_PERFORMANCE: '/api/students/:id/performance'
}

// 教师管理相关API
export const TEACHER_ENDPOINTS = {
  // 教师基础信息
  TEACHERS: '/api/teachers',
  TEACHER_DETAIL: '/api/teachers/:id',

  // 教师中心菜单
  TEACHER_MENU: '/api/teachers/menu-items',
  TEACHER_DASHBOARD: '/api/teachers/dashboard',

  // 教师统计
  TEACHER_STATS: '/api/teachers/stats',
  TEACHER_PERFORMANCE: '/api/teachers/performance'
}

// 家长管理相关API
export const PARENT_ENDPOINTS = {
  // 家长基础信息
  PARENTS: '/api/parents',
  PARENT_DETAIL: '/api/parents/:id',

  // 家长中心菜单
  PARENT_MENU: '/api/parents/menu-items',
  PARENT_DASHBOARD: '/api/parents/dashboard',

  // 家长统计
  PARENT_STATS: '/api/parents/stats'
}

// 班级管理相关API
export const CLASS_ENDPOINTS = {
  // 班级基础信息
  CLASSES: '/api/classes',
  CLASS_DETAIL: '/api/classes/:id',
  CLASS_OPTIONS: '/api/classes/options',
  CLASS_TYPES: '/api/classes/types',

  // 班级统计
  CLASS_STATS: '/api/classes/stats',
  CLASS_ENROLLMENT: '/api/classes/:id/enrollment'
}

// 活动管理相关API
export const ACTIVITY_ENDPOINTS = {
  // 活动基础信息
  ACTIVITIES: '/api/activities',
  ACTIVITY_DETAIL: '/api/activities/:id',

  // 活动报名管理
  REGISTRATIONS: '/api/activities/registrations',
  REGISTRATION_MANAGEMENT: '/api/activities/registrations/management',
  REGISTRATION_STATS: '/api/activities/registrations/stats',

  // 活动通知
  NOTIFICATIONS: '/api/activities/notifications',
  NOTIFICATION_TEMPLATES: '/api/activities/notifications/templates',
  NOTIFICATION_SETTINGS: '/api/activities/notifications/settings'
}

// 营销管理相关API
export const MARKETING_ENDPOINTS = {
  // 营销活动
  CAMPAIGNS: '/api/marketing/campaigns',
  CAMPAIGN_TEMPLATES: '/api/marketing/campaigns/templates',
  CAMPAIGN_ANALYTICS: '/api/marketing/campaigns/analytics',

  // 客户池
  CUSTOMER_POOL: '/api/marketing/customer-pool',
  CUSTOMER_FOLLOWUP: '/api/marketing/customer-pool/followup',
  CUSTOMER_ANALYSIS: '/api/marketing/customer-pool/analysis',

  // 营销统计
  MARKETING_STATS: '/api/marketing/stats',
  CAMPAIGN_PERFORMANCE: '/api/marketing/campaigns/performance'
}

// 绩效管理相关API
export const PERFORMANCE_ENDPOINTS = {
  // 绩效规则
  PERFORMANCE_RULES: '/api/performance/rules',
  RULE_TYPES: '/api/performance/rules/types',
  CALCULATION_METHODS: '/api/performance/rules/calculation-methods',

  // 绩效数据
  PERFORMANCE_DATA: '/api/performance/data',
  PERFORMANCE_STATS: '/api/performance/stats',

  // 绩效报表
  PERFORMANCE_REPORTS: '/api/performance/reports',
  PERFORMANCE_CHARTS: '/api/performance/charts'
}

// AI助手相关API
export const AI_ENDPOINTS = {
  // AI对话
  AI_CHAT: '/api/ai/chat',
  AI_HISTORY: '/api/ai/history',

  // AI记忆系统
  AI_MEMORY: '/api/ai/memory',
  MEMORY_STATS: '/api/ai/memory/stats',
  MEMORY_VISUALIZATION: '/api/ai/memory/visualization',

  // AI模型管理
  AI_MODELS: '/api/ai/models',
  MODEL_CONFIG: '/api/ai/models/config',

  // AI功能
  AI_FEATURES: '/api/ai/features',
  AI_ACTIONS: '/api/ai/actions',
  AI_SIDEBAR: '/api/ai/sidebar-items',

  // AI统计
  AI_STATS: '/api/ai/stats',
  AI_USAGE: '/api/ai/usage'
}

// 通知管理相关API
export const NOTIFICATION_ENDPOINTS = {
  // 通知消息
  NOTIFICATIONS: '/api/notifications',
  NOTIFICATION_CENTER: '/api/notifications/center',

  // 消息模板
  MESSAGE_TEMPLATES: '/api/notifications/templates',

  // 通知统计
  NOTIFICATION_STATS: '/api/notifications/stats'
}

// 数据分析相关API
export const ANALYTICS_ENDPOINTS = {
  // 仪表板统计
  DASHBOARD_STATS: '/api/dashboard/stats',
  DASHBOARD_OVERVIEW: '/api/dashboard/overview',
  DASHBOARD_CHARTS: '/api/dashboard/charts',

  // 招生分析
  ENROLLMENT_ANALYTICS: '/api/analytics/enrollment',
  ENROLLMENT_TRENDS: '/api/analytics/enrollment/trends',
  ENROLLMENT_CONVERSION: '/api/analytics/enrollment/conversion',

  // 用户行为分析
  USER_BEHAVIOR: '/api/analytics/user-behavior',
  USAGE_TRENDS: '/api/analytics/usage-trends',

  // 系统分析
  SYSTEM_ANALYTICS: '/api/analytics/system',
  PERFORMANCE_METRICS: '/api/analytics/performance'
}

// 呼叫中心相关API
export const CALL_CENTER_ENDPOINTS = {
  // SIP设置
  SIP_SETTINGS: '/api/call-center/sip-settings',

  // 通话记录
  CALL_RECORDS: '/api/call-center/records',
  CALL_ANALYTICS: '/api/call-center/analytics',

  // AI分析
  AI_ANALYSIS: '/api/call-center/ai-analysis'
}

// 数据导入相关API
export const DATA_IMPORT_ENDPOINTS = {
  // 导入任务
  IMPORT_TASKS: '/api/data-import/tasks',
  IMPORT_HISTORY: '/api/data-import/history',

  // 字段映射
  FIELD_MAPPING: '/api/data-import/field-mapping',

  // 导入验证
  IMPORT_VALIDATION: '/api/data-import/validation'
}

// 移动端测试相关API
export const MOBILE_TEST_ENDPOINTS = {
  // 设备信息
  DEVICES: '/api/testing/devices',
  DEVICE_CONFIGS: '/api/testing/devices/configs',

  // 测试套件
  TEST_SUITES: '/api/testing/suites',
  TEST_RESULTS: '/api/testing/results'
}

// 图片生成相关API
export const IMAGE_GENERATION_ENDPOINTS = {
  // 模板管理
  TEMPLATES: '/api/image-generation/templates',
  QUICK_TEMPLATES: '/api/image-generation/templates/quick',

  // 主题配置
  THEMES: '/api/image-generation/themes',
  STYLE_OPTIONS: '/api/image-generation/styles',

  // 生成历史
  GENERATION_HISTORY: '/api/image-generation/history'
}

// 动画效果相关API
export const ANIMATION_ENDPOINTS = {
  // 动画配置
  ANIMATION_CONFIGS: '/api/animations/configs',
  ANIMATION_PRESETS: '/api/animations/presets',

  // 效果库
  EFFECTS_LIBRARY: '/api/animations/effects'
}

// 应用配置相关API
export const CONFIG_ENDPOINTS = {
  // 系统配置
  SYSTEM_CONFIG: '/api/system/config',
  APP_SETTINGS: '/api/system/settings',

  // 用户配置
  USER_CONFIG: '/api/users/config',
  USER_PREFERENCES: '/api/users/preferences',

  // 环境配置
  ENV_CONFIG: '/api/system/environment',
  API_CONFIG: '/api/system/api-config'
}

// 媒体库相关API
export const MEDIA_ENDPOINTS = {
  // 媒体文件
  MEDIA_FILES: '/api/media/files',
  MEDIA_UPLOAD: '/api/media/upload',

  // 媒体类型
  MEDIA_TYPES: '/api/media/types',

  // 媒体统计
  MEDIA_STATS: '/api/media/stats'
}

// 预览相关API
export const PREVIEW_ENDPOINTS = {
  // 海报预览
  POSTER_PREVIEW: '/api/preview/poster',

  // 移动端预览
  MOBILE_PREVIEW: '/api/preview/mobile',

  // 微信朋友圈预览
  WECHAT_PREVIEW: '/api/preview/wechat'
}

// 角色切换相关API
export const ROLE_SWITCH_ENDPOINTS = {
  // 可用角色
  AVAILABLE_ROLES: '/api/roles/available',

  // 角色切换
  SWITCH_ROLE: '/api/auth/switch-role',

  // 当前角色
  CURRENT_ROLE: '/api/auth/current-role'
}

export default {
  SYSTEM_ENDPOINTS,
  ENROLLMENT_ENDPOINTS,
  STUDENT_ENDPOINTS,
  TEACHER_ENDPOINTS,
  PARENT_ENDPOINTS,
  CLASS_ENDPOINTS,
  ACTIVITY_ENDPOINTS,
  MARKETING_ENDPOINTS,
  PERFORMANCE_ENDPOINTS,
  AI_ENDPOINTS,
  NOTIFICATION_ENDPOINTS,
  ANALYTICS_ENDPOINTS,
  CALL_CENTER_ENDPOINTS,
  DATA_IMPORT_ENDPOINTS,
  MOBILE_TEST_ENDPOINTS,
  IMAGE_GENERATION_ENDPOINTS,
  ANIMATION_ENDPOINTS,
  CONFIG_ENDPOINTS,
  MEDIA_ENDPOINTS,
  PREVIEW_ENDPOINTS,
  ROLE_SWITCH_ENDPOINTS
}