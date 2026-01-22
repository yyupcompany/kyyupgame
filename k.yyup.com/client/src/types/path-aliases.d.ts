// 路径别名类型声明文件
// 解决 TS2307 模块路径解析错误

declare module '@/utils/request' {
  import type { ApiResponse } from '../utils/request'
  import type { AxiosRequestConfig } from 'axios'

  export type { ApiResponse }
  export const get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
  export const post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
  export const put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
  export const patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
  export const del: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
  export const request: {
    request: <T = any>(config: AxiosRequestConfig) => Promise<ApiResponse<T>>
    get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
    del: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
    delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
  }
  export const aiService: any
  export const aiRequest: any
  export const requestFunc: any
  export const requestMethod: any
  const _default: {
    request: <T = any>(config: AxiosRequestConfig) => Promise<ApiResponse<T>>
    get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
    del: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
    delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>
  }
  export default _default
}

declare module '@/utils/request-config' {
  export const API_CONFIG: any
  export const AUTH_CONFIG: any
  export const createHeaders: (...args: any[]) => any
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/request-config'
}

declare module '@/types/api' {
  export interface ApiResponse<T = any> {
    success: boolean
    message?: string
    data?: T
    error?: string
    code?: number
    timestamp?: string
  }
  export interface PaginatedResponse<T = any> {
    data: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
  export interface PaginationParams {
    page?: number
    pageSize?: number
  }
  export interface SortParams {
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
  export interface QueryParams extends PaginationParams, SortParams {
    keyword?: string
    status?: string
    startDate?: string
    endDate?: string
    [key: string]: any
  }
  export * from '../types/api'
}

declare module '@/types/api-response' {
  export * from '../types/api-response'
}

declare module '@/types/api-unified' {
  export * from '../types/api-unified'
}

declare module '@/types/auth' {
  export * from '../types/auth'
}

declare module '@/types/user' {
  export * from '../types/user'
}

declare module '@/types/dashboard' {
  export * from '../types/dashboard'
}

declare module '@/types/enrollment-plan' {
  export * from '../types/enrollment-plan'
}

declare module '@/types/enrollment' {
  export enum EnrollmentPlanStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
  }
  export interface EnrollmentPlan {
    id: number
    name: string
    code?: string
    year: number
    term: string
    startDate: string
    endDate: string
    targetCount: number
    actualCount?: number
    kindergartenId: number
    kindergartenName?: string
    status: EnrollmentPlanStatus
    description?: string
    ageRequirement?: string
    remarks?: string
    createdAt?: string
    updatedAt?: string
  }
  export interface EnrollmentPlanQueryParams {
    keyword?: string
    status?: EnrollmentPlanStatus
    startDateFrom?: string
    startDateTo?: string
    endDateFrom?: string
    endDateTo?: string
    page?: number
    pageSize?: number
    size?: number
    name?: string
    startDate?: string
    endDate?: string
    kindergartenId?: number
    year?: number
  }
  export interface EnrollmentPlanPaginationResult {
    data: EnrollmentPlan[]
    total: number
    page: number
    size: number
  }
  export interface EnrollmentPlanStatistics {
    totalApplications: number
    pendingApplications: number
    approvedApplications: number
    rejectedApplications: number
    enrolledStudents: number
  }
  export interface EnrollmentTracking {
    id: number
    planId: number
    content: string
    createdBy: number
    createdByName: string
    createdAt: string
  }
  export interface AddTrackingRequest {
    content: string
  }
  export interface CreateEnrollmentPlanRequest {
    kindergartenId: number
    name: string
    startDate: string
    endDate: string
    targetCount: number
    description?: string
    term?: string
    ageRequirement?: string
    remarks?: string
  }
  export interface UpdateEnrollmentPlanRequest {
    name?: string
    startDate?: string
    endDate?: string
    targetCount?: number
    description?: string
    term?: string
    ageRequirement?: string
    remarks?: string
  }
  export interface SetEnrollmentPlanClassesRequest {
    classIds: number[]
  }
  export interface EnrollmentQuota {
    id: number
    planId: number
    className: string
    ageRange: string
    totalQuota: number
    usedQuota?: number
    remainingQuota?: number
    createdAt?: string
    updatedAt?: string
    [key: string]: any
  }
  export interface EnrollmentQuotaQueryParams {
    planId?: number
    className?: string
    page?: number
    pageSize?: number
    ageRange?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
  export interface EnrollmentQuotaRequest {
    planId: number
    className: string
    ageRange: string
    totalQuota: number
  }
  export interface BatchEnrollmentQuotaRequest {
    planId: number
    quotas: Array<{
      className: string
      ageRange: string
      totalQuota: number
    }>
  }
  export interface BatchAdjustQuotaParams {
    quotaIds: number[]
    adjustmentType: 'increase' | 'decrease'
    adjustmentValue: number
    reason?: string
  }
  export * from '../types/enrollment'
}

declare module '@/types/activity' {
  export * from '../types/activity'
}

declare module '@/types/advertisement' {
  export * from '../types/advertisement'
}

declare module '@/types/application' {
  export * from '../types/application'
}

declare module '@/types/chat' {
  export * from '../types/chat'
}

declare module '@/types/class' {
  export enum ClassStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    PENDING = 'PENDING',
    CLOSED = 'CLOSED'
  }
  export enum ClassType {
    FULL_TIME = 'FULL_TIME',
    HALF_TIME = 'HALF_TIME',
    SPECIAL = 'SPECIAL'
  }
  export interface ClassFilterRequest {
    keyword?: string
    type?: ClassType
    status?: ClassStatus
    schoolYear?: string
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
  export interface ClassStudentAssignRequest {
    classId: number
    studentIds: number[]
  }
  export interface ClassTeacherAssignRequest {
    classId: number
    teacherIds: number[]
  }
  export interface ClassInfo extends Class {
    headTeacher?: {
      id: string
      name: string
      avatar?: string
    }
    students?: ClassStudent[]
    teachers?: any[]
    statistics?: any
  }
  export interface ClassStudent {
    id: string
    studentId: string
    name: string
    gender: 'MALE' | 'FEMALE'
    age: number
    avatar?: string
    enrollmentDate?: string
    status?: string
    parentContact?: string
  }
  export interface ClassCreateParams {
    name: string
    grade: string
    capacity: number
    kindergartenId: number
    teacherId: number
    description?: string
    classType?: ClassType
    status?: ClassStatus
  }
  export interface ClassQueryParams {
    keyword?: string
    type?: ClassType
    status?: ClassStatus
    page?: number
    pageSize?: number
  }
  export interface TeacherAssignmentParams {
    headTeacherId?: string
    assistantTeacherIds?: string[]
  }
  export interface ClassStatistics {
    totalClasses: number
    activeClasses: number
    totalStudents: number
    totalTeachers: number
    averageCapacityRate: number
  }
  export * from '../types/class'
}

declare module '@/types/layout' {
  export * from '../types/layout'
}

declare module '@/types/principal' {
  export * from '../types/principal'
}

declare module '@/types/route' {
  export * from '../types/route'
}

declare module '@/types/router' {
  export * from '../types/router'
}

declare module '@/types/system' {
  export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    message?: string
    error?: {
      code: string
      message: string
    }
  }
  export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    LOCKED = 'LOCKED'
  }
  export interface User {
    id: string
    username: string
    realName: string
    email: string
    mobile: string
    roles: Role[]
    lastLoginTime?: string
    status: 'active' | 'inactive' | 'ACTIVE' | 'INACTIVE' | 'LOCKED' | UserStatus
    remark?: string
  }
  export interface Role {
    id: string
    name: string
    code: string
    description: string
    status: 'active' | 'inactive'
    userCount?: number
    createTime?: string
  }
  export * from '../types/system'
}

declare module '@/types/teacher' {
  export * from '../types/teacher'
}

declare module '@/types/ai-business-plus' {
  export * from '../types/ai-business-plus'
}

declare module '@/types/ai-memory' {
  export * from '../types/ai-memory'
}

declare module '@/utils/auth' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/auth'
}

declare module '@/utils/date' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/date'
}

declare module '@/utils/dateFormat' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/dateFormat'
}

declare module '@/utils/permission' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/permission'
}

declare module '@/utils/validate' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/validate'
}


declare module '@/utils/errorHandler' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/errorHandler'
}

declare module '@/utils/enhancedErrorHandler' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/enhancedErrorHandler'
}

declare module '@/utils/enhanced-error-handler' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/enhanced-error-handler'
}

declare module '@/utils/cacheManager' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/cacheManager'
}

declare module '@/utils/cachedRequest' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/cachedRequest'
}

declare module '@/utils/loadingManager' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/loadingManager'
}

declare module '@/utils/dataTransform' {
  export const normalizeResponse: (response: any) => any
  export const transformListResponse: (response: any, dataTransformer?: (item: any) => any) => any
  export const transformEnrollmentPlanData: (backendData: any) => any
  export const transformEnrollmentPlanList: (plans: any[]) => any
  export const transformEnrollmentPlanFormData: (frontendData: any) => any
  export const transformActivityData: (backendData: any) => any
  export const transformActivityRegistrationData: (backendData: any) => any
  export const transformActivityFormData: (frontendData: any) => any
  export const transformActivityRegistrationFormData: (frontendData: any) => any
  export const transformActivityList: (activities: any[]) => any
  export const transformActivityRegistrationList: (registrations: any[]) => any
  export const transformClassData: (backendData: any) => any
  export const transformClassList: (classes: any[]) => any
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/dataTransform'
}

declare module '@/utils/fileUpload' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/fileUpload'
}

declare module '@/utils/formValidator' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/formValidator'
}

declare module '@/utils/image' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/image'
}

declare module '@/utils/iconMapping' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/iconMapping'
}

declare module '@/utils/searchHelper' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/searchHelper'
}

declare module '@/utils/emptyStateHelper' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/emptyStateHelper'
}

declare module '@/utils/api-rules' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/api-rules'
}

declare module '@/utils/api-rules-checker' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/api-rules-checker'
}

declare module '@/utils/api-validator' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/api-validator'
}

declare module '@/utils/api-response-handler' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/api-response-handler'
}

declare module '@/utils/performance-monitor' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/performance-monitor'
}

declare module '@/utils/performance-optimizer' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/performance-optimizer'
}

declare module '@/utils/device-detection' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/device-detection'
}

declare module '@/utils/mobile-performance' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/mobile-performance'
}

declare module '@/utils/pwa-mobile-optimization' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/pwa-mobile-optimization'
}

declare module '@/utils/navigation-fix' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/navigation-fix'
}

declare module '@/utils/navigation-timeout-fix' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/navigation-timeout-fix'
}

declare module '@/utils/navigation-timeout-emergency-fix' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/navigation-timeout-emergency-fix'
}

declare module '@/utils/resize-handler' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/resize-handler'
}

declare module '@/utils/route-preloader' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/route-preloader'
}

declare module '@/utils/predictive-preloader' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/predictive-preloader'
}

declare module '@/utils/async-component-loader' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/async-component-loader'
}

declare module '@/utils/empty-component-detector' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/empty-component-detector'
}

declare module '@/utils/element-plus-fixes' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/element-plus-fixes'
}

declare module '@/utils/replace-default-images' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/replace-default-images'
}

declare module '@/utils/advanced-cache-manager' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/advanced-cache-manager'
}

declare module '@/utils/local-todolist-manager' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/local-todolist-manager'
}

declare module '@/utils/testReportGenerator' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/testReportGenerator'
}

declare module '@/utils/visual-debugger' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../utils/visual-debugger'
}

// API 模块声明
declare module '@/api/activity-center' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/activity-center'
}

declare module '@/api/activity' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/activity'
}

declare module '@/api/advertisement' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/advertisement'
}

declare module '@/api/ai-assistant-optimized' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/ai-assistant-optimized'
}

declare module '@/api/ai-model-config' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/ai-model-config'
}

declare module '@/api/application' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/application'
}

declare module '@/api/auth' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/auth'
}

declare module '@/api/auto-image' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/auto-image'
}

declare module '@/api/chat' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/chat'
}

declare module '@/api/dashboard' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/dashboard'
}

declare module '@/api/enrollment-center' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/enrollment-center'
}

declare module '@/api/enrollment-plan' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/enrollment-plan'
}

declare module '@/api/index' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/index'
}

declare module '@/api/interceptors' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/interceptors'
}

declare module '@/api/principal' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/principal'
}

declare module '@/api/student' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/student'
}

declare module '@/api/task-center' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/task-center'
}

declare module '@/api/teacher' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/teacher'
}

declare module '@/api/user' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/user'
}

declare module '@/api/endpoints' {
  export const API_PREFIX: string
  export const ENROLLMENT_PLAN_ENDPOINTS: any
  export const ENROLLMENT_QUOTA_ENDPOINTS: any
  export const ENROLLMENT_APPLICATION_ENDPOINTS: any
  export const ENROLLMENT_CONSULTATION_ENDPOINTS: any
  export const ACTIVITY_ENDPOINTS: any
  export const AUTH_ENDPOINTS: any
  export const USER_ENDPOINTS: any
  export const DASHBOARD_ENDPOINTS: any
  export const CLASS_ENDPOINTS: any
  export const TEACHER_ENDPOINTS: any
  export const STUDENT_ENDPOINTS: any
  export const AI_ENDPOINTS: any
  export const SMART_EXPERT_ENDPOINTS: any
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/endpoints'
}

declare module '@/api/enrollment-quota' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/enrollment-quota'
}

declare module '@/api/system' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/system'
}

// API modules 子目录
declare module '@/api/modules/advertisement' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/modules/advertisement'
}

declare module '@/api/modules/ai-enrollment' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/modules/ai-enrollment'
}

declare module '@/api/modules/ai' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/modules/ai'
}

declare module '@/api/modules/auth' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/modules/auth'
}

declare module '@/api/modules/chat' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/modules/chat'
}

declare module '@/api/modules/customer' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/modules/customer'
}

declare module '@/api/modules/enrollment' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/modules/enrollment'
}

declare module '@/api/modules/statistics' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/modules/statistics'
}

declare module '@/api/modules/ai-query' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/modules/ai-query'
}

// API endpoints 子目录
declare module '@/api/endpoints/websiteAutomation' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/endpoints/websiteAutomation'
}

// Services 模块

// Stores 模块

declare module '@/stores/ai' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../stores/ai'
}

declare module '@/stores/permissions-simple' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../stores/permissions-simple'
}

// 更多 API modules
declare module '@/api/modules/activity' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/modules/activity'
}

declare module '@/api/modules/class' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/modules/class'
}

declare module '@/api/modules/marketing' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/modules/marketing'
}

declare module '@/api/modules/principal' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/modules/principal'
}

declare module '@/api/modules/auth-permissions' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../api/modules/auth-permissions'
}


// Services

// Config
declare module '@/config/router' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../config/router'
}

declare module '@/config/environment' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../config/environment'
}

// Router
declare module '@/router' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../router/index'
}

// Env
declare module '@/env' {
  // 移除运行时导出，避免浏览器尝试加载.ts文件
  // export * from '../env'
}
