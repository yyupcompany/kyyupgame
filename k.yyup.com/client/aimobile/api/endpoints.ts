/**
 * Mobile模块专用API端点配置
 *
 * 此文件提供Mobile模块特定的API端点配置
 * 使用统一的端点常量，确保零硬编码
 */

import {
  // 认证相关
  AUTH_ENDPOINTS,
  // 用户管理
  USER_ENDPOINTS,
  // 仪表盘
  DASHBOARD_ENDPOINTS,
  // 学生管理
  STUDENT_ENDPOINTS,
  // 班级管理
  CLASS_ENDPOINTS,
  // 教师管理
  TEACHER_ENDPOINTS,
  // 活动管理
  ACTIVITY_ENDPOINTS,
  ACTIVITY_PLAN_ENDPOINTS,
  ACTIVITY_REGISTRATION_ENDPOINTS,
  // 通知管理
  NOTIFICATION_ENDPOINTS,
  // 日程管理
  SCHEDULE_ENDPOINTS,
  // TODO管理
  TODO_ENDPOINTS,
  // 文件管理
  FILE_ENDPOINTS,
  // AI相关
  AI_ENDPOINTS,
  // 统计分析
  STATISTICS_ENDPOINTS,
  // 系统相关
  SYSTEM_ENDPOINTS,
  // 上传相关
  UPLOAD_ENDPOINTS,
  // API前缀
  API_PREFIX
} from '@/api/endpoints';

/**
 * Mobile模块专用API端点聚合
 * 按照移动端功能模块分类组织
 */
export const MOBILE_API_ENDPOINTS = {
  // ==================== 认证模块 ====================
  AUTH: {
    LOGIN: AUTH_ENDPOINTS.LOGIN,
    LOGOUT: AUTH_ENDPOINTS.LOGOUT,
    REGISTER: AUTH_ENDPOINTS.REGISTER,
    REFRESH_TOKEN: AUTH_ENDPOINTS.REFRESH_TOKEN,
    VERIFY_TOKEN: AUTH_ENDPOINTS.VERIFY_TOKEN,
    USER_INFO: AUTH_ENDPOINTS.USER_INFO,
    FORGOT_PASSWORD: AUTH_ENDPOINTS.FORGOT_PASSWORD,
    RESET_PASSWORD: AUTH_ENDPOINTS.RESET_PASSWORD,
    CHANGE_PASSWORD: AUTH_ENDPOINTS.CHANGE_PASSWORD,
  },

  // ==================== 用户信息模块 ====================
  USER: {
    PROFILE: USER_ENDPOINTS.GET_PROFILE,
    UPDATE_PROFILE: USER_ENDPOINTS.UPDATE_PROFILE,
    BASE: USER_ENDPOINTS.BASE,
  },

  // ==================== 仪表盘模块 ====================
  DASHBOARD: {
    STATS: DASHBOARD_ENDPOINTS.STATS,
    OVERVIEW: DASHBOARD_ENDPOINTS.OVERVIEW,
    TODOS: DASHBOARD_ENDPOINTS.TODOS,
    SCHEDULES: DASHBOARD_ENDPOINTS.SCHEDULES,
    ACTIVITIES: DASHBOARD_ENDPOINTS.ACTIVITIES,
    NOTICES_IMPORTANT: DASHBOARD_ENDPOINTS.NOTICES_IMPORTANT,
  },

  // ==================== 学生管理模块 ====================
  STUDENT: {
    LIST: STUDENT_ENDPOINTS.LIST,
    BASE: STUDENT_ENDPOINTS.BASE,
    SEARCH: STUDENT_ENDPOINTS.SEARCH,
    STATS: STUDENT_ENDPOINTS.STATS,
    GROWTH_RECORDS: (id: number | string) => STUDENT_ENDPOINTS.GROWTH_RECORDS(id),
    PERFORMANCE: (id: number | string) => STUDENT_ENDPOINTS.PERFORMANCE(id),
    ATTENDANCE: (id: number | string) => STUDENT_ENDPOINTS.ATTENDANCE(id),
  },

  // ==================== 班级管理模块 ====================
  CLASS: {
    LIST: CLASS_ENDPOINTS.BASE,
    BASE: CLASS_ENDPOINTS.BASE,
    STATISTICS: CLASS_ENDPOINTS.STATISTICS,
    AVAILABLE_CLASSROOMS: CLASS_ENDPOINTS.AVAILABLE_CLASSROOMS,
    GET_STUDENTS: (id: number | string) => CLASS_ENDPOINTS.GET_STUDENTS(id),
    GET_TEACHERS: (id: number | string) => CLASS_ENDPOINTS.GET_TEACHERS(id),
  },

  // ==================== 教师管理模块 ====================
  TEACHER: {
    LIST: TEACHER_ENDPOINTS.LIST,
    BASE: TEACHER_ENDPOINTS.BASE,
    SEARCH: TEACHER_ENDPOINTS.SEARCH,
    STATISTICS: TEACHER_ENDPOINTS.STATISTICS,
    GET_CLASSES: (id: number | string) => TEACHER_ENDPOINTS.GET_CLASSES(id),
    SCHEDULE: (id: number | string) => TEACHER_ENDPOINTS.SCHEDULE(id),
  },

  // ==================== 活动管理模块 ====================
  ACTIVITY: {
    LIST: ACTIVITY_ENDPOINTS.BASE,
    BASE: ACTIVITY_ENDPOINTS.BASE,
    REGISTRATIONS: ACTIVITY_REGISTRATION_ENDPOINTS.BASE,
    PLANS: ACTIVITY_PLAN_ENDPOINTS.BASE,
    CHECKIN: ACTIVITY_REGISTRATION_ENDPOINTS.BASE,
  },

  // ==================== 通知模块 ====================
  NOTIFICATION: {
    LIST: NOTIFICATION_ENDPOINTS.BASE,
    BASE: NOTIFICATION_ENDPOINTS.BASE,
    MARK_READ: (id: number | string) => NOTIFICATION_ENDPOINTS.MARK_READ(id),
    MARK_ALL_READ: NOTIFICATION_ENDPOINTS.MARK_ALL_READ,
    SEND: NOTIFICATION_ENDPOINTS.SEND,
  },

  // ==================== 日程模块 ====================
  SCHEDULE: {
    LIST: SCHEDULE_ENDPOINTS.BASE,
    BASE: SCHEDULE_ENDPOINTS.BASE,
    BY_DATE: (date: string) => SCHEDULE_ENDPOINTS.BY_DATE(date),
  },

  // ==================== 任务模块 ====================
  TODO: {
    LIST: TODO_ENDPOINTS.BASE,
    BASE: TODO_ENDPOINTS.BASE,
    UPDATE_STATUS: (id: number | string) => TODO_ENDPOINTS.UPDATE_STATUS(id),
    BY_USER: (userId: number | string) => TODO_ENDPOINTS.BY_USER(userId),
  },

  // ==================== 文件管理模块 ====================
  FILE: {
    UPLOAD: FILE_ENDPOINTS.UPLOAD,
    BASE: FILE_ENDPOINTS.BASE,
    DOWNLOAD: (id: number | string) => FILE_ENDPOINTS.DOWNLOAD(id),
    DELETE: (id: number | string) => FILE_ENDPOINTS.DELETE(id),
  },

  // ==================== AI功能模块 ====================
  AI: {
    CONVERSATIONS: AI_ENDPOINTS.CONVERSATIONS,
    SEND_MESSAGE: (conversationId: number | string) => AI_ENDPOINTS.SEND_MESSAGE(conversationId),
    MODELS: AI_ENDPOINTS.MODELS,
    STUDENT_RECOMMENDATIONS: (studentId: number | string) => AI_ENDPOINTS.STUDENT_RECOMMENDATIONS(studentId),
    MEMORY_SEARCH: (userId: number | string) => AI_ENDPOINTS.MEMORY.SEARCH(userId),
    SMART_EXPERT_CHAT: AI_ENDPOINTS.SMART_EXPERT.SMART_CHAT,
  },

  // ==================== 统计分析模块 ====================
  STATISTICS: {
    DASHBOARD: STATISTICS_ENDPOINTS.DASHBOARD,
    STUDENTS: STATISTICS_ENDPOINTS.STUDENTS,
    ACTIVITIES: STATISTICS_ENDPOINTS.ACTIVITIES,
    REALTIME: STATISTICS_ENDPOINTS.REALTIME,
    PERFORMANCE: STATISTICS_ENDPOINTS.PERFORMANCE,
  },

  // ==================== 系统模块 ====================
  SYSTEM: {
    HEALTH: SYSTEM_ENDPOINTS.HEALTH,
    VERSION: SYSTEM_ENDPOINTS.VERSION,
    API_LIST: SYSTEM_ENDPOINTS.API_LIST,
  },

  // ==================== 上传模块 ====================
  UPLOAD: {
    FILE: UPLOAD_ENDPOINTS.FILE,
    IMAGE: UPLOAD_ENDPOINTS.IMAGE,
    AVATAR: UPLOAD_ENDPOINTS.AVATAR,
  }
} as const;

/**
 * Mobile模块专用的端点类别
 * 按照移动端使用频率和重要性分类
 */
export const MOBILE_ENDPOINT_CATEGORIES = {
  // 核心功能 - 最高优先级缓存
  CORE: [
    MOBILE_API_ENDPOINTS.AUTH.USER_INFO,
    MOBILE_API_ENDPOINTS.DASHBOARD.STATS,
    MOBILE_API_ENDPOINTS.USER.PROFILE,
  ],

  // 业务功能 - 高优先级缓存
  BUSINESS: [
    MOBILE_API_ENDPOINTS.STUDENT.LIST,
    MOBILE_API_ENDPOINTS.CLASS.LIST,
    MOBILE_API_ENDPOINTS.ACTIVITY.LIST,
    MOBILE_API_ENDPOINTS.NOTIFICATION.LIST,
    MOBILE_API_ENDPOINTS.TODO.LIST,
    MOBILE_API_ENDPOINTS.SCHEDULE.LIST,
  ],

  // 扩展功能 - 中等优先级缓存
  EXTENDED: [
    MOBILE_API_ENDPOINTS.AI.CONVERSATIONS,
    MOBILE_API_ENDPOINTS.STATISTICS.DASHBOARD,
    MOBILE_API_ENDPOINTS.FILE.UPLOAD,
  ],

  // 系统功能 - 低优先级缓存
  SYSTEM: [
    MOBILE_API_ENDPOINTS.SYSTEM.HEALTH,
    MOBILE_API_ENDPOINTS.SYSTEM.VERSION,
  ]
} as const;

/**
 * Mobile端点工具函数
 */
export const MobileEndpointUtils = {
  /**
   * 检查是否为核心API
   */
  isCoreEndpoint: (url: string): boolean => {
    return MOBILE_ENDPOINT_CATEGORIES.CORE.some(endpoint => url.includes(endpoint));
  },

  /**
   * 检查是否为业务API
   */
  isBusinessEndpoint: (url: string): boolean => {
    return MOBILE_ENDPOINT_CATEGORIES.BUSINESS.some(endpoint => url.includes(endpoint));
  },

  /**
   * 检查是否为扩展API
   */
  isExtendedEndpoint: (url: string): boolean => {
    return MOBILE_ENDPOINT_CATEGORIES.EXTENDED.some(endpoint => url.includes(endpoint));
  },

  /**
   * 检查是否为系统API
   */
  isSystemEndpoint: (url: string): boolean => {
    return MOBILE_ENDPOINT_CATEGORIES.SYSTEM.some(endpoint => url.includes(endpoint));
  },

  /**
   * 根据URL获取端点类别
   */
  getEndpointCategory: (url: string): 'core' | 'business' | 'extended' | 'system' | 'unknown' => {
    if (MobileEndpointUtils.isCoreEndpoint(url)) return 'core';
    if (MobileEndpointUtils.isBusinessEndpoint(url)) return 'business';
    if (MobileEndpointUtils.isExtendedEndpoint(url)) return 'extended';
    if (MobileEndpointUtils.isSystemEndpoint(url)) return 'system';
    return 'unknown';
  }
} as const;

/**
 * 缓存策略配置（基于端点类别）
 */
export const MOBILE_CACHE_STRATEGIES = {
  CORE: {
    ttl: 5 * 60 * 1000,        // 5分钟
    strategy: 'network-first' as const,
  },
  BUSINESS: {
    ttl: 10 * 60 * 1000,       // 10分钟
    strategy: 'network-first' as const,
  },
  EXTENDED: {
    ttl: 30 * 60 * 1000,       // 30分钟
    strategy: 'cache-first' as const,
  },
  SYSTEM: {
    ttl: 60 * 60 * 1000,       // 1小时
    strategy: 'cache-first' as const,
  }
} as const;

// TypeScript类型定义
export type MobileApiEndpoints = typeof MOBILE_API_ENDPOINTS;
export type MobileEndpointCategory = keyof typeof MOBILE_ENDPOINT_CATEGORIES;
export type MobileCacheStrategy = typeof MOBILE_CACHE_STRATEGIES;

// 默认导出
export default MOBILE_API_ENDPOINTS;