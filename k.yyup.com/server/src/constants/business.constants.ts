/**
 * 业务常量定义
 *
 * 集中管理所有业务相关的魔法数字和硬编码值
 */

/**
 * 分页常量
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1
} as const;

/**
 * 用户状态
 */
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending'
} as const;

/**
 * 用户角色
 */
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PRINCIPAL: 'principal',
  TEACHER: 'teacher',
  PARENT: 'parent'
} as const;

/**
 * 幼儿园相关常量
 */
export const KINDERGARTEN = {
  MAX_STUDENTS_PER_CLASS: 30,
  MAX_TEACHERS_PER_CLASS: 5,
  DEFAULT_CAPACITY: 100,
  MIN_AGE: 2,
  MAX_AGE: 6
} as const;

/**
 * 学生状态
 */
export const STUDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  GRADUATED: 'graduated',
  TRANSFERRED: 'transferred'
} as const;

/**
 * 审核状态
 */
export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

/**
 * 通知类型
 */
export const NOTIFICATION_TYPES = {
  SYSTEM: 'system',
  ACADEMIC: 'academic',
  ACTIVITY: 'activity',
  EMERGENCY: 'emergency',
  REMINDER: 'reminder'
} as const;

/**
 * 活动状态
 */
export const ACTIVITY_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

/**
 * 课程类型
 */
export const CURRICULUM_TYPES = {
  CREATIVE: 'creative',
  THEME: 'theme',
  Montessori: 'montessori',
  REGIO: 'regio'
} as const;

/**
 * 时间相关常量（毫秒）
 */
export const TIME = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000
} as const;

/**
 * Token相关常量
 */
export const TOKEN = {
  ACCESS_TOKEN_EXPIRY: '7d',
  REFRESH_TOKEN_EXPIRY: '30d',
  RESET_TOKEN_EXPIRY: '1h',
  VERIFICATION_CODE_EXPIRY: 5 * 60 * 1000, // 5分钟
  MAGIC_LINK_EXPIRY: 15 * 60 * 1000 // 15分钟
} as const;

/**
 * 文件上传相关常量
 */
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg']
} as const;

/**
 * 年龄分段常量
 */
export const AGE_GROUPS = {
  TODDLER: { min: 2, max: 3, name: '托班' },
  SMALL: { min: 3, max: 4, name: '小班' },
  MEDIUM: { min: 4, max: 5, name: '中班' },
  LARGE: { min: 5, max: 6, name: '大班' }
} as const;

/**
 * 性别常量
 */
export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other'
} as const;

/**
 * 血型常量
 */
export const BLOOD_TYPE = {
  A: 'A',
  B: 'B',
  AB: 'AB',
  O: 'O',
  UNKNOWN: 'unknown'
} as const;

/**
 * 过敏史类型
 */
export const ALLERGY_TYPES = {
  FOOD: 'food',
  MEDICINE: 'medicine',
  ENVIRONMENTAL: 'environmental',
  OTHER: 'other'
} as const;

/**
 * 联系方式类型
 */
export const CONTACT_TYPE = {
  FATHER: 'father',
  MOTHER: 'mother',
  GUARDIAN: 'guardian',
  OTHER: 'other'
} as const;

/**
 * 关系类型
 */
export const RELATIONSHIP = {
  FATHER: 'father',
  MOTHER: 'mother',
  GRANDFATHER: 'grandfather',
  GRANDMOTHER: 'grandmother',
  GUARDIAN: 'guardian',
  OTHER: 'other'
} as const;

/**
 * HTTP状态码相关常量
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

/**
 * 错误代码常量
 */
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS'
} as const;

/**
 * 正则表达式常量
 */
export const REGEX = {
  PHONE: /^1[3-9]\d{9}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  ID_CARD: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
} as const;

/**
 * 缓存键前缀
 */
export const CACHE_KEYS = {
  USER: 'user:',
  PERMISSION: 'permission:',
  CLASS: 'class:',
  STUDENT: 'student:',
  ACTIVITY: 'activity:',
  NOTIFICATION: 'notification:'
} as const;

/**
 * 缓存过期时间（秒）
 */
export const CACHE_TTL = {
  SHORT: 300, // 5分钟
  MEDIUM: 1800, // 30分钟
  LONG: 3600, // 1小时
  VERY_LONG: 86400 // 1天
} as const;

/**
 * 导出所有常量
 */
export const CONSTANTS = {
  PAGINATION,
  USER_STATUS,
  USER_ROLES,
  KINDERGARTEN,
  STUDENT_STATUS,
  APPROVAL_STATUS,
  NOTIFICATION_TYPES,
  ACTIVITY_STATUS,
  CURRICULUM_TYPES,
  TIME,
  TOKEN,
  FILE_UPLOAD,
  AGE_GROUPS,
  GENDER,
  BLOOD_TYPE,
  ALLERGY_TYPES,
  CONTACT_TYPE,
  RELATIONSHIP,
  HTTP_STATUS,
  ERROR_CODES,
  REGEX,
  CACHE_KEYS,
  CACHE_TTL
} as const;

export default CONSTANTS;
