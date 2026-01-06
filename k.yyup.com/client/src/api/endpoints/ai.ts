/**
 * AI功能相关API端点
 */
import { API_PREFIX } from './base';

// AI助手接口
export const AI_ENDPOINTS = {
  BASE: `${API_PREFIX}ai`,
  // CHAT: `${API_PREFIX}ai/chat`, // ❌ 简易版已删除，请使用完整的会话消息API
  CONVERSATION: `${API_PREFIX}ai/conversation`,
  CONVERSATIONS: `${API_PREFIX}ai/conversations`, // ✅ 完整的会话API
  EXPERT_CONSULTATION: `${API_PREFIX}ai/expert-consultation`,
  MODELS: `${API_PREFIX}ai/models`,
  MEMORY: `${API_PREFIX}ai/memory`,
  FEEDBACK: `${API_PREFIX}ai/feedback`,
  USAGE: `${API_PREFIX}ai/usage`,
  SETTINGS: `${API_PREFIX}ai/settings`,
  HEALTH: `${API_PREFIX}ai/health`,
  CAPABILITIES: `${API_PREFIX}ai/capabilities`,
  
  // 添加缺失的端点
  USER_QUOTA: `${API_PREFIX}ai/quota/user`,
  UPLOAD_IMAGE: `${API_PREFIX}ai/upload/image`,
  TRANSCRIBE_AUDIO: `${API_PREFIX}ai/transcribe/audio`,
  
  // 对话相关端点
  CONVERSATION_BY_ID: (conversationId: string | number) => `${API_PREFIX}ai/conversations/${conversationId}`,
  CONVERSATION_MESSAGES: (conversationId: string | number) => `${API_PREFIX}ai/conversations/${conversationId}/messages`,
  CONVERSATION_MESSAGE_METADATA: (conversationId: string | number, messageId: string | number) => `${API_PREFIX}ai/conversations/${conversationId}/messages/${messageId}/metadata`,
  SEND_MESSAGE: `${API_PREFIX}ai/conversations/send-message`,
  DELETE_CONVERSATION: (conversationId: string | number) => `${API_PREFIX}ai/conversations/${conversationId}`,
  UPDATE_CONVERSATION: (conversationId: string | number) => `${API_PREFIX}ai/conversations/${conversationId}`,
  CONVERSATION_HISTORY: (conversationId: string | number) => `${API_PREFIX}ai/conversations/${conversationId}/history`,
  
  // 咨询相关端点
  CONSULTATION: `${API_PREFIX}ai/consultation`,
  CONSULTATION_START: `${API_PREFIX}ai/consultation/start`,
  
  // 模型相关详细端点
  INITIALIZE: `${API_PREFIX}ai/initialize`,
  MODEL_BY_ID: (id: string | number) => `${API_PREFIX}ai/models/${id}`,
  MODEL_BILLING: (id: string | number) => `${API_PREFIX}ai/models/${id}/billing`,
  MODEL_DEFAULT: `${API_PREFIX}ai/models/default`,
  MODEL_CAPABILITIES: (id: string | number, capability: string) => `${API_PREFIX}ai/models/${id}/capabilities/${capability}`,
  MODEL_USAGE: (id: string | number) => `${API_PREFIX}ai/models/${id}/usage`,
  MODEL_CONFIG: (id: string | number) => `${API_PREFIX}ai/models/${id}/config`,
  MODEL_STATUS: (id: string | number) => `${API_PREFIX}ai/models/${id}/status`,
  MODEL_METRICS: (id: string | number) => `${API_PREFIX}ai/models/${id}/metrics`,
  MODEL_LOGS: (id: string | number) => `${API_PREFIX}ai/models/${id}/logs`,
  MODEL_RESET: (id: string | number) => `${API_PREFIX}ai/models/${id}/reset`,
  MODEL_TRAIN: (id: string | number) => `${API_PREFIX}ai/models/${id}/train`,
  MODEL_DEPLOY: (id: string | number) => `${API_PREFIX}ai/models/${id}/deploy`,
  MODEL_UNDEPLOY: (id: string | number) => `${API_PREFIX}ai/models/${id}/undeploy`,
  MODEL_VERSION: (id: string | number, version: string) => `${API_PREFIX}ai/models/${id}/versions/${version}`,
  MODEL_VERSIONS: (id: string | number) => `${API_PREFIX}ai/models/${id}/versions`,
  MODEL_COMPARE: `${API_PREFIX}ai/models/compare`,
  MODEL_BENCHMARK: (id: string | number) => `${API_PREFIX}ai/models/${id}/benchmark`,
  MODEL_OPTIMIZE: (id: string | number) => `${API_PREFIX}ai/models/${id}/optimize`,
  MODEL_BACKUP: (id: string | number) => `${API_PREFIX}ai/models/${id}/backup`,
  MODEL_RESTORE: (id: string | number) => `${API_PREFIX}ai/models/${id}/restore`,
  MODEL_CLONE: (id: string | number) => `${API_PREFIX}ai/models/${id}/clone`,
  MODEL_TRANSFER: (id: string | number) => `${API_PREFIX}ai/models/${id}/transfer`,
  WORKLOAD_BALANCE: `${API_PREFIX}ai/workload/balance`,
} as const;

// AI记忆管理接口
export const AI_MEMORY_ENDPOINTS = {
  BASE: `${API_PREFIX}ai/memory`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}ai/memory/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}ai/memory/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}ai/memory/${id}`,
  DELETE_BY_ID: (id: number | string) => `${API_PREFIX}ai/memory/${id}`,
  SEARCH: `${API_PREFIX}ai/memory/search`,
  CATEGORIES: `${API_PREFIX}ai/memory/categories`,
  TAGS: `${API_PREFIX}ai/memory/tags`,
  EXPORT: `${API_PREFIX}ai/memory/export`,
  IMPORT: `${API_PREFIX}ai/memory/import`,
  BACKUP: `${API_PREFIX}ai/memory/backup`,
  RESTORE: `${API_PREFIX}ai/memory/restore`,
  ANALYTICS: `${API_PREFIX}ai/memory/analytics`,
  VISUALIZATION: `${API_PREFIX}ai/memory/visualization`,
  
  // 添加缺失的端点
  CREATE: `${API_PREFIX}ai/memory`,
  GET_CONVERSATION: (conversationId: string | number) => `${API_PREFIX}ai/memory/conversation/${conversationId}`,
  SUMMARIZE: `${API_PREFIX}ai/memory/summarize`,
  CREATE_WITH_EMBEDDING: `${API_PREFIX}ai/memory/with-embedding`,
  SEARCH_SIMILAR: `${API_PREFIX}ai/memory/search-similar`,
} as const;

// AI模型管理接口
export const AI_MODEL_ENDPOINTS = {
  BASE: `${API_PREFIX}ai/models`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}ai/models/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}ai/models/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}ai/models/${id}`,
  ACTIVATE: (id: number | string) => `${API_PREFIX}ai/models/${id}/activate`,
  DEACTIVATE: (id: number | string) => `${API_PREFIX}ai/models/${id}/deactivate`,
  TEST: (id: number | string) => `${API_PREFIX}ai/models/${id}/test`,
  PERFORMANCE: (id: number | string) => `${API_PREFIX}ai/models/${id}/performance`,
  USAGE_STATS: (id: number | string) => `${API_PREFIX}ai/models/${id}/usage-stats`,
  FINE_TUNE: (id: number | string) => `${API_PREFIX}ai/models/${id}/fine-tune`,
  EXPORT: (id: number | string) => `${API_PREFIX}ai/models/${id}/export`,
  IMPORT: `${API_PREFIX}ai/models/import`,
  AVAILABLE: `${API_PREFIX}ai/models/available`,
  RECOMMENDED: `${API_PREFIX}ai/models/recommended`,
} as const;

// AI分析接口
export const AI_ANALYSIS_ENDPOINTS = {
  BASE: `${API_PREFIX}ai/analysis`,
  STUDENT_PERFORMANCE: `${API_PREFIX}ai/analysis/student-performance`,
  TEACHER_EFFICIENCY: `${API_PREFIX}ai/analysis/teacher-efficiency`,
  CLASS_OPTIMIZATION: `${API_PREFIX}ai/analysis/class-optimization`,
  ENROLLMENT_PREDICTION: `${API_PREFIX}ai/analysis/enrollment-prediction`,
  RESOURCE_ALLOCATION: `${API_PREFIX}ai/analysis/resource-allocation`,
  RISK_ASSESSMENT: `${API_PREFIX}ai/analysis/risk-assessment`,
  TREND_ANALYSIS: `${API_PREFIX}ai/analysis/trend-analysis`,
  RECOMMENDATION: `${API_PREFIX}ai/analysis/recommendation`,
  INSIGHTS: `${API_PREFIX}ai/analysis/insights`,
  REPORTS: `${API_PREFIX}ai/analysis/reports`,
  EXPORT: `${API_PREFIX}ai/analysis/export`,
} as const;

// AI智能推荐接口
export const AI_RECOMMENDATION_ENDPOINTS = {
  BASE: `${API_PREFIX}ai/recommendations`,
  STUDENT_PLACEMENT: `${API_PREFIX}ai/recommendations/student-placement`,
  TEACHER_ASSIGNMENT: `${API_PREFIX}ai/recommendations/teacher-assignment`,
  CLASS_SCHEDULING: `${API_PREFIX}ai/recommendations/class-scheduling`,
  ACTIVITY_PLANNING: `${API_PREFIX}ai/recommendations/activity-planning`,
  RESOURCE_OPTIMIZATION: `${API_PREFIX}ai/recommendations/resource-optimization`,
  CURRICULUM_DESIGN: `${API_PREFIX}ai/recommendations/curriculum-design`,
  PARENT_ENGAGEMENT: `${API_PREFIX}ai/recommendations/parent-engagement`,
  MARKETING_STRATEGY: `${API_PREFIX}ai/recommendations/marketing-strategy`,
  ENROLLMENT_STRATEGY: `${API_PREFIX}ai/recommendations/enrollment-strategy`,
  PERSONALIZED: `${API_PREFIX}ai/recommendations/personalized`,
} as const;

// AI配额管理接口
export const AI_QUOTA_ENDPOINTS = {
  BASE: `${API_PREFIX}ai/quota`,
  CURRENT: `${API_PREFIX}ai/quota/current`,
  USAGE: `${API_PREFIX}ai/quota/usage`,
  LIMITS: `${API_PREFIX}ai/quota/limits`,
  HISTORY: `${API_PREFIX}ai/quota/history`,
  UPGRADE: `${API_PREFIX}ai/quota/upgrade`,
  PURCHASE: `${API_PREFIX}ai/quota/purchase`,
  BILLING: `${API_PREFIX}ai/quota/billing`,
  ALERTS: `${API_PREFIX}ai/quota/alerts`,
} as const;