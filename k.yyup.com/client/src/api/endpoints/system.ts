/**
 * 系统管理相关API端点
 */
import { API_PREFIX } from './base';

// 系统日志接口
export const SYSTEM_LOG_ENDPOINTS = {
  BASE: `${API_PREFIX}system/logs`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}system/logs/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}system/logs/${id}`,
  SEARCH: `${API_PREFIX}system/logs/search`,
  EXPORT: `${API_PREFIX}system/logs/export`,
  CLEAR: `${API_PREFIX}system/logs/clear`,
  STATS: `${API_PREFIX}system/logs/stats`,
  BATCH_DELETE: `${API_PREFIX}system/logs/batch-delete`,
} as const;

// 系统设置接口
export const SYSTEM_SETTINGS_ENDPOINTS = {
  BASE: `${API_PREFIX}system/settings`,
  GET_BY_KEY: (key: string) => `${API_PREFIX}system/settings/${key}`,
  UPDATE_BY_KEY: (key: string) => `${API_PREFIX}system/settings/${key}`,
  BASIC: `${API_PREFIX}system/settings/basic`,
  EMAIL: `${API_PREFIX}system/settings/email`,
  SECURITY: `${API_PREFIX}system/settings/security`,
  STORAGE: `${API_PREFIX}system/settings/storage`,
  BACKUP: `${API_PREFIX}system/settings/backup`,
  TEST_EMAIL: `${API_PREFIX}system/settings/test-email`,
  TEST_STORAGE: `${API_PREFIX}system/settings/test-storage`,
} as const;

// 系统备份接口
export const SYSTEM_BACKUP_ENDPOINTS = {
  BASE: `${API_PREFIX}system/backup`,
  CREATE: `${API_PREFIX}system/backup/create`,
  RESTORE: `${API_PREFIX}system/backup/restore`,
  DELETE: (id: number | string) => `${API_PREFIX}system/backup/${id}`,
  DOWNLOAD: (id: number | string) => `${API_PREFIX}system/backup/${id}/download`,
  STATUS: `${API_PREFIX}system/backup/status`,
  SCHEDULE: `${API_PREFIX}system/backup/schedule`,
  CLEANUP: `${API_PREFIX}system/backup/cleanup`,
} as const;

// 消息模板接口
export const MESSAGE_TEMPLATE_ENDPOINTS = {
  BASE: `${API_PREFIX}system/message-templates`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}system/message-templates/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}system/message-templates/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}system/message-templates/${id}`,
  GET_BY_TYPE: (type: string) => `${API_PREFIX}system/message-templates/type/${type}`,
  PREVIEW: (id: number | string) => `${API_PREFIX}system/message-templates/${id}/preview`,
  SEND_TEST: (id: number | string) => `${API_PREFIX}system/message-templates/${id}/test`,
} as const;

// AI模型配置接口
export const AI_MODEL_CONFIG_ENDPOINTS = {
  BASE: `${API_PREFIX}system/ai-models`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}system/ai-models/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}system/ai-models/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}system/ai-models/${id}`,
  TEST: (id: number | string) => `${API_PREFIX}system/ai-models/${id}/test`,
  ACTIVATE: (id: number | string) => `${API_PREFIX}system/ai-models/${id}/activate`,
  DEACTIVATE: (id: number | string) => `${API_PREFIX}system/ai-models/${id}/deactivate`,
  USAGE_STATS: (id: number | string) => `${API_PREFIX}system/ai-models/${id}/usage`,
} as const;

// 系统监控接口
export const SYSTEM_MONITOR_ENDPOINTS = {
  HEALTH: `${API_PREFIX}system/health`,
  STATUS: `${API_PREFIX}system/status`,
  METRICS: `${API_PREFIX}system/metrics`,
  PERFORMANCE: `${API_PREFIX}system/performance`,
  DISK_USAGE: `${API_PREFIX}system/disk-usage`,
  MEMORY_USAGE: `${API_PREFIX}system/memory-usage`,
  CPU_USAGE: `${API_PREFIX}system/cpu-usage`,
  DATABASE_STATUS: `${API_PREFIX}system/database-status`,
  CACHE_STATUS: `${API_PREFIX}system/cache-status`,
} as const;