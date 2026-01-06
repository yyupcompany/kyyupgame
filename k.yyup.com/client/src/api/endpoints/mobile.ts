/**
 * Mobile专用API端点配置
 *
 * 为mobile应用提供专门的端点配置，包含mobile特定的API前缀和版本控制
 */

import { API_PREFIX } from './base'
import type { ApiResponse } from '@/api'

// Mobile专用API前缀
export const MOBILE_API_PREFIX = `${API_PREFIX}mobile`;

// Mobile用户认证端点
export const MOBILE_AUTH_ENDPOINTS = {
  BASE: `${MOBILE_API_PREFIX}/auth`,
  LOGIN: `${MOBILE_API_PREFIX}/auth/login`,
  LOGOUT: `${MOBILE_API_PREFIX}/auth/logout`,
  REFRESH_TOKEN: `${MOBILE_API_PREFIX}/auth/refresh-token`,
  VERIFY_CODE: `${MOBILE_API_PREFIX}/auth/verify-code`,
  SEND_CODE: `${MOBILE_API_PREFIX}/auth/send-code`,
  RESET_PASSWORD: `${MOBILE_API_PREFIX}/auth/reset-password`,
  CHANGE_PASSWORD: `${MOBILE_API_PREFIX}/auth/change-password`,
  DEVICE_REGISTER: `${MOBILE_API_PREFIX}/auth/device-register`,
  DEVICE_UNREGISTER: `${MOBILE_API_PREFIX}/auth/device-unregister`,
  BIOMETRIC_LOGIN: `${MOBILE_API_PREFIX}/auth/biometric-login`,
  QUICK_LOGIN: `${MOBILE_API_PREFIX}/auth/quick-login`,
  SOCIAL_LOGIN: `${MOBILE_API_PREFIX}/auth/social-login`,
} as const;

// Mobile家长中心端点
export const MOBILE_PARENT_ENDPOINTS = {
  BASE: `${MOBILE_API_PREFIX}/parent`,
  DASHBOARD: `${MOBILE_API_PREFIX}/parent/dashboard`,
  CHILDREN: `${MOBILE_API_PREFIX}/parent/children`,
  CHILD_DETAIL: (id: string | number) => `${MOBILE_API_PREFIX}/parent/children/${id}`,
  CHILD_GROWTH: (id: string | number) => `${MOBILE_API_PREFIX}/parent/children/${id}/growth`,
  CHILD_ASSESSMENT: (id: string | number) => `${MOBILE_API_PREFIX}/parent/children/${id}/assessment`,
  ATTENDANCE: `${MOBILE_API_PREFIX}/parent/attendance`,
  NOTIFICATIONS: `${MOBILE_API_PREFIX}/parent/notifications`,
  MESSAGES: `${MOBILE_API_PREFIX}/parent/messages`,
  ACTIVITIES: `${MOBILE_API_PREFIX}/parent/activities`,
  ACTIVITY_DETAIL: (id: string | number) => `${MOBILE_API_PREFIX}/parent/activities/${id}`,
  ACTIVITY_REGISTER: (id: string | number) => `${MOBILE_API_PREFIX}/parent/activities/${id}/register`,
  FEEDBACK: `${MOBILE_API_PREFIX}/parent/feedback`,
  AI_ASSISTANT: `${MOBILE_API_PREFIX}/parent/ai-assistant`,
  PHOTOS: `${MOBILE_API_PREFIX}/parent/photos`,
  VIDEOS: `${MOBILE_API_PREFIX}/parent/videos`,
  SCHEDULE: `${MOBILE_API_PREFIX}/parent/schedule`,
  PAYMENTS: `${MOBILE_API_PREFIX}/parent/payments`,
  COMMUNICATION: `${MOBILE_API_PREFIX}/parent/communication`,
  HOMEWORK: `${MOBILE_API_PREFIX}/parent/homework`,
  REPORTS: `${MOBILE_API_PREFIX}/parent/reports`,
} as const;

// Mobile教师中心端点
export const MOBILE_TEACHER_ENDPOINTS = {
  BASE: `${MOBILE_API_PREFIX}/teacher`,
  DASHBOARD: `${MOBILE_API_PREFIX}/teacher/dashboard`,
  CLASSES: `${MOBILE_API_PREFIX}/teacher/classes`,
  CLASS_DETAIL: (id: string | number) => `${MOBILE_API_PREFIX}/teacher/classes/${id}`,
  STUDENTS: `${MOBILE_API_PREFIX}/teacher/students`,
  STUDENT_DETAIL: (id: string | number) => `${MOBILE_API_PREFIX}/teacher/students/${id}`,
  ATTENDANCE: `${MOBILE_API_PREFIX}/teacher/attendance`,
  ATTENDANCE_CHECKIN: `${MOBILE_API_PREFIX}/teacher/attendance/checkin`,
  ATTENDANCE_RECORDS: (classId: string | number) => `${MOBILE_API_PREFIX}/teacher/attendance/classes/${classId}`,
  ACTIVITIES: `${MOBILE_API_PREFIX}/teacher/activities`,
  ACTIVITY_CREATE: `${MOBILE_API_PREFIX}/teacher/activities/create`,
  ACTIVITY_DETAIL: (id: string | number) => `${MOBILE_API_PREFIX}/teacher/activities/${id}`,
  TASKS: `${MOBILE_API_PREFIX}/teacher/tasks`,
  TASK_CREATE: `${MOBILE_API_PREFIX}/teacher/tasks/create`,
  TASK_DETAIL: (id: string | number) => `${MOBILE_API_PREFIX}/teacher/tasks/${id}`,
  MESSAGES: `${MOBILE_API_PREFIX}/teacher/messages`,
  PARENT_COMMUNICATION: `${MOBILE_API_PREFIX}/teacher/parent-communication`,
  TEACHING_PLANS: `${MOBILE_API_PREFIX}/teacher/teaching-plans`,
  HOMEWORK: `${MOBILE_API_PREFIX}/teacher/homework`,
  GRADING: `${MOBILE_API_PREFIX}/teacher/grading`,
  NOTIFICATIONS: `${MOBILE_API_PREFIX}/teacher/notifications`,
  CURRICULUM: `${MOBILE_API_PREFIX}/teacher/curriculum`,
  CREATIVE_CURRICULUM: `${MOBILE_API_PREFIX}/teacher/creative-curriculum`,
  CUSTOMER_TRACKING: `${MOBILE_API_PREFIX}/teacher/customer-tracking`,
  ENROLLMENT: `${MOBILE_API_PREFIX}/teacher/enrollment`,
  APPOINTMENT_MANAGEMENT: `${MOBILE_API_PREFIX}/teacher/appointment-management`,
} as const;

// Mobile管理中心端点
export const MOBILE_CENTER_ENDPOINTS = {
  BASE: `${MOBILE_API_PREFIX}/center`,
  SYSTEM: `${MOBILE_API_PREFIX}/center/system`,
  SYSTEM_LOG: `${MOBILE_API_PREFIX}/center/system/log`,
  USAGE: `${MOBILE_API_PREFIX}/center/usage`,
  CUSTOMER_POOL: `${MOBILE_API_PREFIX}/center/customer-pool`,
  ENROLLMENT: `${MOBILE_API_PREFIX}/center/enrollment`,
  CALL: `${MOBILE_API_PREFIX}/center/call`,
  ASSESSMENT: `${MOBILE_API_PREFIX}/center/assessment`,
  STUDENT_MANAGEMENT: `${MOBILE_API_PREFIX}/center/student-management`,
  BUSINESS: `${MOBILE_API_PREFIX}/center/business`,
  DOCUMENT_TEMPLATE: `${MOBILE_API_PREFIX}/center/document-template`,
  DOCUMENT_STATISTICS: `${MOBILE_API_PREFIX}/center/document-statistics`,
  AI_BILLING: `${MOBILE_API_PREFIX}/center/ai-billing`,
  DOCUMENT_INSTANCE: `${MOBILE_API_PREFIX}/center/document-instance`,
  TASK: `${MOBILE_API_PREFIX}/center/task`,
  AI: `${MOBILE_API_PREFIX}/center/ai`,
  SCHEDULE: `${MOBILE_API_PREFIX}/center/schedule`,
  ANALYTICS: `${MOBILE_API_PREFIX}/center/analytics`,
  NOTIFICATION: `${MOBILE_API_PREFIX}/center/notification`,
  INSPECTION: `${MOBILE_API_PREFIX}/center/inspection`,
  TEACHING: `${MOBILE_API_PREFIX}/center/teaching`,
  PERSONNEL: `${MOBILE_API_PREFIX}/center/personnel`,
  SETTINGS: `${MOBILE_API_PREFIX}/center/settings`,
  SCRIPT: `${MOBILE_API_PREFIX}/center/script`,
  PRINCIPAL: `${MOBILE_API_PREFIX}/center/principal`,
  ACTIVITY: `${MOBILE_API_PREFIX}/center/activity`,
  DOCUMENT: `${MOBILE_API_PREFIX}/center/document`,
  ATTENDANCE: `${MOBILE_API_PREFIX}/center/attendance`,
  MEDIA: `${MOBILE_API_PREFIX}/center/media`,
  MEDIA_STATISTICS: `${MOBILE_API_PREFIX}/center/media/statistics`,
  MEDIA_RECENT_CREATIONS: `${MOBILE_API_PREFIX}/center/media/recent-creations`,
  TEMPLATE_DETAIL: `${MOBILE_API_PREFIX}/center/template-detail`,
  DOCUMENT_COLLABORATION: `${MOBILE_API_PREFIX}/center/document-collaboration`,
  SYSTEM_UNIFIED: `${MOBILE_API_PREFIX}/center/system-unified`,
  DOCUMENT_EDITOR: `${MOBILE_API_PREFIX}/center/document-editor`,
  SCRIPT_TEMPLATES: `${MOBILE_API_PREFIX}/center/script-templates`,
  USER: `${MOBILE_API_PREFIX}/center/user`,
  PERMISSION: `${MOBILE_API_PREFIX}/center/permission`,
  PHOTO_ALBUM: `${MOBILE_API_PREFIX}/center/photo-album`,
  TASK_FORM: `${MOBILE_API_PREFIX}/center/task-form`,
  MY_TASK: `${MOBILE_API_PREFIX}/center/my-task`,
} as const;

// Mobile文件上传端点（针对mobile优化的上传接口）
export const MOBILE_UPLOAD_ENDPOINTS = {
  BASE: `${MOBILE_API_PREFIX}/upload`,
  SINGLE_FILE: `${MOBILE_API_PREFIX}/upload/single`,
  MULTIPLE_FILES: `${MOBILE_API_PREFIX}/upload/multiple`,
  CHUNK_UPLOAD: `${MOBILE_API_PREFIX}/upload/chunk`,
  CHUNK_INIT: `${MOBILE_API_PREFIX}/upload/chunk/init`,
  CHUNK_COMPLETE: `${MOBILE_API_PREFIX}/upload/chunk/complete`,
  AVATAR: `${MOBILE_API_PREFIX}/upload/avatar`,
  PHOTO: `${MOBILE_API_PREFIX}/upload/photo`,
  VIDEO: `${MOBILE_API_PREFIX}/upload/video`,
  AUDIO: `${MOBILE_API_PREFIX}/upload/audio`,
  DOCUMENT: `${MOBILE_API_PREFIX}/upload/document`,
  ACTIVITY_IMAGE: `${MOBILE_API_PREFIX}/upload/activity-image`,
  CURRICULUM_MATERIAL: `${MOBILE_API_PREFIX}/upload/curriculum-material`,
  ASSESSMENT_FILE: `${MOBILE_API_PREFIX}/upload/assessment-file`,
  PROGRESS: (uploadId: string) => `${MOBILE_API_PREFIX}/upload/progress/${uploadId}`,
  CANCEL: (uploadId: string) => `${MOBILE_API_PREFIX}/upload/cancel/${uploadId}`,
  RETRY: (uploadId: string) => `${MOBILE_API_PREFIX}/upload/retry/${uploadId}`,
} as const;

// Mobile同步端点
export const MOBILE_SYNC_ENDPOINTS = {
  BASE: `${MOBILE_API_PREFIX}/sync`,
  FULL_SYNC: `${MOBILE_API_PREFIX}/sync/full`,
  INCREMENTAL_SYNC: `${MOBILE_API_PREFIX}/sync/incremental`,
  CONFIG: `${MOBILE_API_PREFIX}/sync/config`,
  STATUS: `${MOBILE_API_PREFIX}/sync/status`,
  LAST_SYNC: `${MOBILE_API_PREFIX}/sync/last-sync`,
  FORCE_SYNC: `${MOBILE_API_PREFIX}/sync/force`,
  CONFLICTS: `${MOBILE_API_PREFIX}/sync/conflicts`,
  RESOLVE_CONFLICT: `${MOBILE_API_PREFIX}/sync/resolve-conflict`,
  DATA_TYPES: `${MOBILE_API_PREFIX}/sync/data-types`,
  QUEUE: `${MOBILE_API_PREFIX}/sync/queue`,
  HISTORY: `${MOBILE_API_PREFIX}/sync/history`,
  LOGS: `${MOBILE_API_PREFIX}/sync/logs`,
} as const;

// Mobile待办事项端点
export const MOBILE_TODO_ENDPOINTS = {
  BASE: `${MOBILE_API_PREFIX}/todos`,
  LIST: `${MOBILE_API_PREFIX}/todos`,
  CREATE: `${MOBILE_API_PREFIX}/todos`,
  DETAIL: (id: string | number) => `${MOBILE_API_PREFIX}/todos/${id}`,
  UPDATE: (id: string | number) => `${MOBILE_API_PREFIX}/todos/${id}`,
  DELETE: (id: string | number) => `${MOBILE_API_PREFIX}/todos/${id}`,
  STATUS_UPDATE: (id: string | number) => `${MOBILE_API_PREFIX}/todos/${id}/status`,
  BATCH_UPDATE: `${MOBILE_API_PREFIX}/todos/batch-update`,
  BATCH_DELETE: `${MOBILE_API_PREFIX}/todos/batch-delete`,
  MY_TODOS: `${MOBILE_API_PREFIX}/todos/my`,
  OVERDUE: `${MOBILE_API_PREFIX}/todos/overdue`,
  TODAY: `${MOBILE_API_PREFIX}/todos/today`,
  UPCOMING: `${MOBILE_API_PREFIX}/todos/upcoming`,
  COMPLETED: `${MOBILE_API_PREFIX}/todos/completed`,
  CATEGORIES: `${MOBILE_API_PREFIX}/todos/categories`,
  PRIORITIES: `${MOBILE_API_PREFIX}/todos/priorities`,
  SEARCH: `${MOBILE_API_PREFIX}/todos/search`,
  REMINDERS: `${MOBILE_API_PREFIX}/todos/reminders`,
  NOTIFICATIONS: `${MOBILE_API_PREFIX}/todos/notifications`,
  STATISTICS: `${MOBILE_API_PREFIX}/todos/statistics`,
} as const;

// Mobile AI端点（mobile优化的AI接口）
export const MOBILE_AI_ENDPOINTS = {
  BASE: `${MOBILE_API_PREFIX}/ai`,
  CHAT: `${MOBILE_API_PREFIX}/ai/chat`,
  CHAT_STREAM: `${MOBILE_API_PREFIX}/ai/chat/stream`,
  VOICE_CHAT: `${MOBILE_API_PREFIX}/ai/voice-chat`,
  IMAGE_GENERATION: `${MOBILE_API_PREFIX}/ai/generate-image`,
  ACTIVITY_IMAGE_GENERATION: `${MOBILE_API_PREFIX}/ai/generate-activity-image`,
  CURRICULUM_GENERATE: `${MOBILE_API_PREFIX}/ai/curriculum/generate`,
  CURRICULUM_GENERATE_STREAM: `${MOBILE_API_PREFIX}/ai/curriculum/generate-stream`,
  SMART_ASSISTANT: `${MOBILE_API_PREFIX}/ai/smart-assistant`,
  PARENT_ASSISTANT: `${MOBILE_API_PREFIX}/ai/parent-assistant`,
  TEACHER_ASSISTANT: `${MOBILE_API_PREFIX}/ai/teacher-assistant`,
  TRANSLATE: `${MOBILE_API_PREFIX}/ai/translate`,
  VOICE_TRANSCRIBE: `${MOBILE_API_PREFIX}/ai/voice/transcribe`,
  TEXT_TO_SPEECH: `${MOBILE_API_PREFIX}/ai/text-to-speech`,
  IMAGE_RECOGNITION: `${MOBILE_API_PREFIX}/ai/image-recognition`,
  OCR: `${MOBILE_API_PREFIX}/ai/ocr`,
  SMART_SEARCH: `${MOBILE_API_PREFIX}/ai/smart-search`,
  RECOMMENDATIONS: `${MOBILE_API_PREFIX}/ai/recommendations`,
  STATUS: `${MOBILE_API_PREFIX}/ai/status`,
  CAPABILITIES: `${MOBILE_API_PREFIX}/ai/capabilities`,
  USAGE: `${MOBILE_API_PREFIX}/ai/usage`,
  QUOTA: `${MOBILE_API_PREFIX}/ai/quota`,
} as const;

// Mobile设备管理端点
export const MOBILE_DEVICE_ENDPOINTS = {
  BASE: `${MOBILE_API_PREFIX}/device`,
  REGISTER: `${MOBILE_API_PREFIX}/device/register`,
  UNREGISTER: `${MOBILE_API_PREFIX}/device/unregister`,
  UPDATE: (deviceId: string) => `${MOBILE_API_PREFIX}/device/${deviceId}`,
  INFO: (deviceId: string) => `${MOBILE_API_PREFIX}/device/${deviceId}/info`,
  STATUS: (deviceId: string) => `${MOBILE_API_PREFIX}/device/${deviceId}/status`,
  PUSH_TOKEN: `${MOBILE_API_PREFIX}/device/push-token`,
  NOTIFICATIONS: `${MOBILE_API_PREFIX}/device/notifications`,
  SETTINGS: `${MOBILE_API_PREFIX}/device/settings`,
  LOCATION: `${MOBILE_API_PREFIX}/device/location`,
  BATTERY: `${MOBILE_API_PREFIX}/device/battery`,
  NETWORK: `${MOBILE_API_PREFIX}/device/network`,
  STORAGE: `${MOBILE_API_PREFIX}/device/storage`,
  CLEANUP: `${MOBILE_API_PREFIX}/device/cleanup`,
} as const;

// Mobile推送通知端点
export const MOBILE_PUSH_ENDPOINTS = {
  BASE: `${MOBILE_API_PREFIX}/push`,
  REGISTER: `${MOBILE_API_PREFIX}/push/register`,
  UNREGISTER: `${MOBILE_API_PREFIX}/push/unregister`,
  TOKEN_UPDATE: `${MOBILE_API_PREFIX}/push/token/update`,
  NOTIFICATIONS: `${MOBILE_API_PREFIX}/push/notifications`,
  MARK_READ: (id: string | number) => `${MOBILE_API_PREFIX}/push/notifications/${id}/read`,
  MARK_ALL_READ: `${MOBILE_API_PREFIX}/push/notifications/read-all`,
  DELETE: (id: string | number) => `${MOBILE_API_PREFIX}/push/notifications/${id}`,
  SETTINGS: `${MOBILE_API_PREFIX}/push/settings`,
  PREFERENCES: `${MOBILE_API_PREFIX}/push/preferences`,
  STATISTICS: `${MOBILE_API_PREFIX}/push/statistics`,
  HISTORY: `${MOBILE_API_PREFIX}/push/history`,
} as const;

// Mobile离线缓存端点
export const MOBILE_OFFLINE_ENDPOINTS = {
  BASE: `${MOBILE_API_PREFIX}/offline`,
  CACHE: `${MOBILE_API_PREFIX}/offline/cache`,
  SYNC: `${MOBILE_API_PREFIX}/offline/sync`,
  CLEAR: `${MOBILE_API_PREFIX}/offline/clear`,
  SIZE: `${MOBILE_API_PREFIX}/offline/size`,
  STATUS: `${MOBILE_API_PREFIX}/offline/status`,
  CONFIG: `${MOBILE_API_PREFIX}/offline/config`,
  QUEUES: `${MOBILE_API_PREFIX}/offline/queues`,
  CONFLICTS: `${MOBILE_API_PREFIX}/offline/conflicts`,
  RESOLUTION: `${MOBILE_API_PREFIX}/offline/resolution`,
} as const;

// 类型定义
export interface MobileApiOptions {
  version?: string;
  platform?: 'ios' | 'android';
  deviceId?: string;
  appVersion?: string;
}

// Mobile API响应类型（扩展基础ApiResponse）
// 统一使用ApiResponse作为基础类型，保持桌面端和移动端API响应类型一致
export interface MobileApiResponse<T = any> extends ApiResponse<T> {
  timestamp?: number;
  requestId?: string;
  mobileVersion?: string;
  requiresUpdate?: boolean;
  updateUrl?: string;
}

// Mobile分页响应类型
export interface MobilePaginatedResponse<T = any> extends MobileApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
    nextPage?: number;
  };
}

// Mobile同步状态类型
export interface MobileSyncStatus {
  lastSyncTime: string;
  isSyncing: boolean;
  pendingChanges: number;
  conflicts: number;
  syncProgress?: number;
  nextSyncTime?: string;
}

// Mobile设备信息类型
export interface MobileDeviceInfo {
  deviceId: string;
  platform: 'ios' | 'android';
  appVersion: string;
  osVersion: string;
  model: string;
  pushToken?: string;
  lastActiveTime: string;
  isOnline: boolean;
  batteryLevel?: number;
  networkType?: string;
  storageInfo?: {
    total: number;
    used: number;
    available: number;
  };
}