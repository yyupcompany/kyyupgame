/**
 * 活动管理相关API端点
 */
import { API_PREFIX } from './base';

// 活动管理基础接口
export const ACTIVITY_ENDPOINTS = {
  BASE: `${API_PREFIX}activities`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}activities/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}activities/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}activities/${id}`,
  UPDATE_STATUS: (id: number | string) => `${API_PREFIX}activities/${id}/status`,
  PUBLISH: (id: number | string) => `${API_PREFIX}activities/${id}/publish`,
  STATISTICS: `${API_PREFIX}activities/statistics`,
} as const;

// 活动计划接口
export const ACTIVITY_PLAN_ENDPOINTS = {
  BASE: `${API_PREFIX}activity-plans`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}activity-plans/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}activity-plans/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}activity-plans/${id}`,
  STATUS: (id: number | string) => `${API_PREFIX}activity-plans/${id}/status`,
  CANCEL: (id: number | string) => `${API_PREFIX}activity-plans/${id}/cancel`,
  PUBLISH: (id: number | string) => `${API_PREFIX}activity-plans/${id}/publish`,
  STATISTICS: (id: number | string) => `${API_PREFIX}activity-plans/${id}/statistics`,
  BY_CATEGORY: (category: string) => `${API_PREFIX}activity-plans/by-category/${category}`,
  BY_DATE: (date: string) => `${API_PREFIX}activity-plans/by-date/${date}`,
} as const;

// 活动报名接口
export const ACTIVITY_REGISTRATION_ENDPOINTS = {
  BASE: `${API_PREFIX}activity-registrations`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}activity-registrations/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}activity-registrations/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}activity-registrations/${id}`,
  REVIEW: (id: number | string) => `${API_PREFIX}activity-registrations/${id}/review`,
  CANCEL: (id: number | string) => `${API_PREFIX}activity-registrations/${id}/cancel`,
  PAYMENT: (id: number | string) => `${API_PREFIX}activity-registrations/${id}/payment`,
  CHECK_IN: (id: number | string) => `${API_PREFIX}activity-registrations/${id}/check-in`,
  ABSENT: (id: number | string) => `${API_PREFIX}activity-registrations/${id}/absent`,
  FEEDBACK: (id: number | string) => `${API_PREFIX}activity-registrations/${id}/feedback`,
  CONVERT: (id: number | string) => `${API_PREFIX}activity-registrations/${id}/convert`,
  BATCH_CONFIRM: `${API_PREFIX}activity-registrations/batch-confirm`,
  BY_ACTIVITY: (activityId: number | string) => `${API_PREFIX}activity-registrations/by-activity/${activityId}`,
  BY_STUDENT: (studentId: number | string) => `${API_PREFIX}activity-registrations/by-student/${studentId}`,
  BY_STATUS: (status: string) => `${API_PREFIX}activity-registrations/by-status/${status}`,
  STATS: (activityId: number | string) => `${API_PREFIX}activity-registrations/activity/${activityId}/stats`,
} as const;

// 活动签到接口
export const ACTIVITY_CHECKIN_ENDPOINTS = {
  BASE: `${API_PREFIX}activity-checkins`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}activity-checkins/${id}`,
  CREATE_BATCH: `${API_PREFIX}activity-checkins/batch`,
  BY_ACTIVITY: (activityId: number | string) => `${API_PREFIX}activity-checkins/by-activity/${activityId}`,
  REGISTRATION_CHECKIN: (id: number | string) => `${API_PREFIX}activity-checkins/registration/${id}`,
  PHONE_CHECKIN: (activityId: number | string) => `${API_PREFIX}activity-checkins/${activityId}/phone`,
  STATS: (activityId: number | string) => `${API_PREFIX}activity-checkins/${activityId}/stats`,
  EXPORT: `${API_PREFIX}activity-checkins/export`,
} as const;

// 活动评价接口
export const ACTIVITY_EVALUATION_ENDPOINTS = {
  BASE: `${API_PREFIX}activity-evaluations`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}activity-evaluations/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}activity-evaluations/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}activity-evaluations/${id}`,
  BY_ACTIVITY: (activityId: number | string) => `${API_PREFIX}activity-evaluations/by-activity/${activityId}`,
  BY_RATING: (rating: number | string) => `${API_PREFIX}activity-evaluations/by-rating/${rating}`,
  STATISTICS: (activityId: number | string) => `${API_PREFIX}activity-evaluations/statistics/${activityId}`,
  ACTIVITY_STATISTICS: (activityId: number | string) => `${API_PREFIX}activity-evaluations/activity/${activityId}/statistics`,
  REPLY: (id: number | string) => `${API_PREFIX}activity-evaluations/${id}/reply`,
  SATISFACTION_REPORT: `${API_PREFIX}activity-evaluations/satisfaction-report`,
} as const;

// 活动模板接口
export const ACTIVITY_TEMPLATE_ENDPOINTS = {
  BASE: `${API_PREFIX}activity-templates`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}activity-templates/${id}`,
  CREATE: `${API_PREFIX}activity-templates`,
  UPDATE: (id: number | string) => `${API_PREFIX}activity-templates/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}activity-templates/${id}`,
  USE: (id: number | string) => `${API_PREFIX}activity-templates/${id}/use`,
  BY_CATEGORY: (category: string) => `${API_PREFIX}activity-templates?category=${category}`,
} as const;

