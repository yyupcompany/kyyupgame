/**
 * 招生管理相关API端点
 */
import { API_PREFIX } from './base';

// 招生计划接口
export const ENROLLMENT_PLAN_ENDPOINTS = {
  BASE: `${API_PREFIX}/enrollment-plans`,
  LIST: `${API_PREFIX}/enrollment-plans`,
  CREATE: `${API_PREFIX}/enrollment-plans`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/enrollment-plans/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/enrollment-plans/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/enrollment-plans/${id}`,
  GET_QUOTAS: (id: number | string) => `${API_PREFIX}/enrollment-plans/${id}/quotas`,
  GET_STATISTICS: (id: number | string) => `${API_PREFIX}/enrollment-plans/${id}/statistics`,
  EXPORT: (id: number | string) => `${API_PREFIX}/enrollment-plans/${id}/export`,
  UPDATE_STATUS: (id: number | string) => `${API_PREFIX}/enrollment-plans/${id}/status`,
  ANALYTICS: `${API_PREFIX}/enrollment-plans/analytics`,
  OVERVIEW: `${API_PREFIX}/enrollment-plans/overview`,
  TRACKING: (id: number | string) => `${API_PREFIX}/enrollment-plans/${id}/tracking`,
  BATCH_DELETE: `${API_PREFIX}/enrollment-plans/batch-delete`,
} as const;

// 招生名额接口
export const ENROLLMENT_QUOTA_ENDPOINTS = {
  BASE: `${API_PREFIX}/enrollment-quotas`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/enrollment-quotas/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/enrollment-quotas/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/enrollment-quotas/${id}`,
  BATCH: `${API_PREFIX}/enrollment-quotas/batch`,
  ADJUST: (id: number | string) => `${API_PREFIX}/enrollment-quotas/${id}/adjust`,
  BATCH_ADJUST: `${API_PREFIX}/enrollment-quotas/batch-adjust`,
  STATISTICS: `${API_PREFIX}/enrollment-quotas/statistics`,
  MANAGE: `${API_PREFIX}/enrollment-quotas/manage`,
  HISTORY: (id: number | string) => `${API_PREFIX}/enrollment-quotas/${id}/history`,
  FORECAST: `${API_PREFIX}/enrollment-quotas/forecast`,
} as const;

// 招生申请接口
export const ENROLLMENT_APPLICATION_ENDPOINTS = {
  BASE: `${API_PREFIX}/enrollment-applications`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/enrollment-applications/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/enrollment-applications/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/enrollment-applications/${id}`,
  UPDATE_STATUS: (id: number | string) => `${API_PREFIX}/enrollment-applications/${id}/status`,
  APPROVE: (id: number | string) => `${API_PREFIX}/enrollment-applications/${id}/approve`,
  REJECT: (id: number | string) => `${API_PREFIX}/enrollment-applications/${id}/reject`,
  REVIEW: (id: number | string) => `${API_PREFIX}/enrollment-applications/${id}/review`,
  DOCUMENTS: (id: number | string) => `${API_PREFIX}/enrollment-applications/${id}/documents`,
  EXPORT: `${API_PREFIX}/enrollment-applications/export`,
  BATCH_APPROVE: `${API_PREFIX}/enrollment-applications/batch-approve`,
  BATCH_REJECT: `${API_PREFIX}/enrollment-applications/batch-reject`,
  STATISTICS: `${API_PREFIX}/enrollment-applications/statistics`,
} as const;

// 招生咨询接口
export const ENROLLMENT_CONSULTATION_ENDPOINTS = {
  BASE: `${API_PREFIX}/enrollment-consultations`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/enrollment-consultations/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/enrollment-consultations/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/enrollment-consultations/${id}`,
  UPDATE_STATUS: (id: number | string) => `${API_PREFIX}/enrollment-consultations/${id}/status`,
  FOLLOW_UP: (id: number | string) => `${API_PREFIX}/enrollment-consultations/${id}/follow-up`,
  SCHEDULE: (id: number | string) => `${API_PREFIX}/enrollment-consultations/${id}/schedule`,
  NOTES: (id: number | string) => `${API_PREFIX}/enrollment-consultations/${id}/notes`,
  EXPORT: `${API_PREFIX}/enrollment-consultations/export`,
  STATISTICS: `${API_PREFIX}/enrollment-consultations/statistics`,
  AUTOMATED_FOLLOW_UP: `${API_PREFIX}/enrollment-consultations/automated-follow-up`,
} as const;

// 招生渠道接口
export const ENROLLMENT_CHANNEL_ENDPOINTS = {
  BASE: `${API_PREFIX}/enrollment-channels`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/enrollment-channels/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/enrollment-channels/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/enrollment-channels/${id}`,
  PERFORMANCE: (id: number | string) => `${API_PREFIX}/enrollment-channels/${id}/performance`,
  STATISTICS: `${API_PREFIX}/enrollment-channels/statistics`,
  ANALYSIS: `${API_PREFIX}/enrollment-channels/analysis`,
  OPTIMIZATION: `${API_PREFIX}/enrollment-channels/optimization`,
  ROI: `${API_PREFIX}/enrollment-channels/roi`,
} as const;

// 招生活动接口
export const ENROLLMENT_ACTIVITY_ENDPOINTS = {
  BASE: `${API_PREFIX}/enrollment-activities`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}/enrollment-activities/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}/enrollment-activities/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}/enrollment-activities/${id}`,
  PARTICIPANTS: (id: number | string) => `${API_PREFIX}/enrollment-activities/${id}/participants`,
  REGISTER: (id: number | string) => `${API_PREFIX}/enrollment-activities/${id}/register`,
  CANCEL_REGISTRATION: (id: number | string) => `${API_PREFIX}/enrollment-activities/${id}/cancel-registration`,
  FEEDBACK: (id: number | string) => `${API_PREFIX}/enrollment-activities/${id}/feedback`,
  STATISTICS: `${API_PREFIX}/enrollment-activities/statistics`,
  EFFECTIVENESS: `${API_PREFIX}/enrollment-activities/effectiveness`,
} as const;