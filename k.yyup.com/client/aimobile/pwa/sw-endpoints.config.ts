/**
 * Service Worker API 端点配置
 *
 * 此文件包含 Service Worker 所需的 API 端点配置
 * 在构建时通过 rollup 或 vite 插件注入到 Service Worker 中
 */

import {
  AUTH_ENDPOINTS,
  DASHBOARD_ENDPOINTS,
  STUDENT_ENDPOINTS,
  CLASS_ENDPOINTS,
  ACTIVITY_ENDPOINTS,
  API_PREFIX
} from '@/api/endpoints';

// API 基础配置
const API_CONFIG = {
  // API 基础路径 - 使用环境变量或默认值
  BASE_URL: process.env.VITE_API_BASE_URL || '/api',

  // 缓存策略配置
  CACHE_STRATEGIES: {
    // 需要缓存的 API 端点（网络优先策略）- 使用统一端点常量
    API_ENDPOINTS: [
      AUTH_ENDPOINTS.USER_INFO,
      DASHBOARD_ENDPOINTS.STATS,
      STUDENT_ENDPOINTS.BASE,
      CLASS_ENDPOINTS.BASE,
      ACTIVITY_ENDPOINTS.BASE
    ],

    // 缓存时间配置（毫秒）
    CACHE_TTL: {
      AUTH_USER: 5 * 60 * 1000,        // 5分钟
      DASHBOARD_STATS: 2 * 60 * 1000,  // 2分钟
      STUDENTS: 10 * 60 * 1000,        // 10分钟
      CLASSES: 15 * 60 * 1000,         // 15分钟
      ACTIVITIES: 20 * 60 * 1000       // 20分钟
    }
  },

  // 离线页面配置
  OFFLINE_CONFIG: {
    PAGE: '/mobile/offline',
    API_RESPONSE: {
      success: false,
      data: null,
      message: '网络连接失败，请检查网络设置'
    }
  }
}

// 构建完整的 API 端点 URL
const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// 需要缓存的完整 API 端点列表
const CACHED_API_ENDPOINTS = API_CONFIG.CACHE_STRATEGIES.API_ENDPOINTS.map(
  endpoint => buildApiUrl(endpoint)
)

// Service Worker 专用的端点常量 - 使用统一端点配置
export const SW_API_ENDPOINTS = {
  // 认证相关
  AUTH_USER: AUTH_ENDPOINTS.USER_INFO,

  // 仪表盘相关
  DASHBOARD_STATS: DASHBOARD_ENDPOINTS.STATS,

  // 学生管理
  STUDENTS: STUDENT_ENDPOINTS.BASE,

  // 班级管理
  CLASSES: CLASS_ENDPOINTS.BASE,

  // 活动管理
  ACTIVITIES: ACTIVITY_ENDPOINTS.BASE,

  // API 基础路径（用于判断）
  API_BASE: API_CONFIG.BASE_URL,
  API_PREFIX: `${API_CONFIG.BASE_URL}/`,

  // 离线配置
  OFFLINE_PAGE: API_CONFIG.OFFLINE_CONFIG.PAGE,
  OFFLINE_RESPONSE: API_CONFIG.OFFLINE_CONFIG.API_RESPONSE
} as const

// 缓存策略配置
export const SW_CACHE_CONFIG = {
  // 缓存版本控制
  VERSION: 'v1.0.0',

  // 缓存名称前缀
  CACHE_PREFIX: 'kindergarten',

  // 缓存类型
  CACHE_TYPES: {
    STATIC: 'static',
    API: 'api',
    PAGES: 'pages',
    IMAGES: 'images'
  },

  // 缓存时间配置
  CACHE_TTL: API_CONFIG.CACHE_STRATEGIES.CACHE_TTL,

  // 需要缓存的端点列表
  CACHED_ENDPOINTS: CACHED_API_ENDPOINTS
} as const

// 导出配置对象（用于注入到 Service Worker）
export const SW_CONFIG = {
  ENDPOINTS: SW_API_ENDPOINTS,
  CACHE: SW_CACHE_CONFIG,
  BUILD_TIME: new Date().toISOString(),
  VERSION: SW_CACHE_CONFIG.VERSION
}

// TypeScript 类型定义
export type SwApiEndpoints = typeof SW_API_ENDPOINTS
export type SwCacheConfig = typeof SW_CACHE_CONFIG
export type SwConfig = typeof SW_CONFIG

// 用于检查是否为 API 请求的函数
export const isApiRequest = (url: string): boolean => {
  return url.includes(SW_API_ENDPOINTS.API_PREFIX)
}

// 用于检查是否为需要缓存的 API 请求
export const isCacheableApiEndpoint = (url: string): boolean => {
  return CACHED_API_ENDPOINTS.some(endpoint => url.includes(endpoint))
}

// 用于生成缓存名称的函数
export const generateCacheName = (type: keyof typeof SW_CACHE_CONFIG.CACHE_TYPES, version?: string): string => {
  const cacheVersion = version || SW_CACHE_CONFIG.VERSION
  return `${SW_CACHE_CONFIG.CACHE_PREFIX}-${type}-${cacheVersion}`
}