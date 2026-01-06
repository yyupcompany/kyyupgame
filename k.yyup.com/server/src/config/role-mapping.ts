/**
 * 用户角色映射文件
 * 定义系统角色和权限的映射关系
 */

// 角色定义
export const roles = {
  // 系统管理员，最高权限
  ADMIN: 'admin',
  // 园长，管理幼儿园日常运营
  PRINCIPAL: 'principal',
  // 教师，管理班级教学
  TEACHER: 'teacher',
  // 家长，查看自己孩子的信息
  PARENT: 'parent',
  // 超级管理员，系统级别管理
  SUPER_ADMIN: 'super_admin',
  // 市场人员，负责营销活动
  MARKETING: 'marketing',
  // 招生人员，负责招生工作
  ENROLLMENT: 'enrollment',
  // 财务人员，负责财务管理
  FINANCE: 'finance',
  // 职员，基础工作人员
  STAFF: 'staff'
};

// 角色ID映射
export const roleIdMapping = {
  [roles.ADMIN]: 1,
  [roles.PRINCIPAL]: 2,
  [roles.TEACHER]: 3,
  [roles.PARENT]: 4,
  [roles.SUPER_ADMIN]: 5,
  [roles.MARKETING]: 6,
  [roles.ENROLLMENT]: 7,
  [roles.FINANCE]: 8,
  [roles.STAFF]: 9
};

// 权限定义
export const permissions = {
  // 用户管理权限
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // 角色管理权限
  ROLE_VIEW: 'role:view',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  
  // 班级管理权限
  CLASS_VIEW: 'class:view',
  CLASS_MANAGE: 'class:manage',
  CLASS_CREATE: 'class:create',
  CLASS_UPDATE: 'class:update',
  CLASS_DELETE: 'class:delete',
  
  // 学生管理权限
  STUDENT_VIEW: 'student:view',
  STUDENT_MANAGE: 'student:manage',
  STUDENT_CREATE: 'student:create',
  STUDENT_UPDATE: 'student:update',
  STUDENT_DELETE: 'student:delete',
  
  // 教师管理权限
  TEACHER_VIEW: 'teacher:view',
  TEACHER_MANAGE: 'teacher:manage',
  TEACHER_CREATE: 'teacher:create',
  TEACHER_UPDATE: 'teacher:update',
  TEACHER_DELETE: 'teacher:delete',
  
  // 家长管理权限
  PARENT_VIEW: 'parent:view',
  PARENT_MANAGE: 'parent:manage',
  PARENT_CREATE: 'parent:create',
  PARENT_UPDATE: 'parent:update',
  PARENT_DELETE: 'parent:delete',
  
  // 活动管理权限
  ACTIVITY_VIEW: 'activity:view',
  ACTIVITY_MANAGE: 'activity:manage',
  ACTIVITY_CREATE: 'activity:create',
  ACTIVITY_UPDATE: 'activity:update',
  ACTIVITY_DELETE: 'activity:delete',
  
  // 招生计划权限
  ENROLLMENT_PLAN_VIEW: 'enrollment:plan:view',
  ENROLLMENT_PLAN_MANAGE: 'enrollment:plan:manage',
  ENROLLMENT_PLAN_CREATE: 'enrollment:plan:create',
  ENROLLMENT_PLAN_UPDATE: 'enrollment:plan:update',
  ENROLLMENT_PLAN_DELETE: 'enrollment:plan:delete',
  
  // 招生管理权限
  ENROLLMENT_VIEW: 'enrollment:view',
  ENROLLMENT_MANAGE: 'enrollment:manage',
  
  // 申请管理权限
  APPLICATION_VIEW: 'application:view',
  APPLICATION_MANAGE: 'application:manage',
  
  // 客户管理权限
  CUSTOMER_VIEW: 'customer:view',
  CUSTOMER_MANAGE: 'customer:manage',
  
  // 统计分析权限
  STATISTICS_VIEW: 'statistics:view',
  
  // AI功能权限
  AI_CHAT: 'ai:chat',
  AI_MODEL_SELECT: 'ai:model:select',
  AI_PROMPT_CUSTOM: 'ai:prompt:custom',
  AI_DATA_QUERY: 'ai:data:query',
  AI_MODEL_CONFIG: 'ai:model:config',
  AI_MEMORY_MANAGE: 'ai:memory:manage',
  
  // 数据查询权限
  DATA_VIEW_ALL: 'data:view:all',
  DATA_VIEW_CLASS: 'data:view:class',
  DATA_VIEW_CHILD: 'data:view:child',
  
  // 系统配置权限
  SYSTEM_CONFIG: 'system:config'
};

// 角色权限映射
export const rolePermissionMapping = {
  // 管理员拥有所有权限
  [roles.ADMIN]: [
    permissions.USER_VIEW,
    permissions.USER_CREATE,
    permissions.USER_UPDATE,
    permissions.USER_DELETE,
    permissions.ROLE_VIEW,
    permissions.ROLE_CREATE,
    permissions.ROLE_UPDATE,
    permissions.ROLE_DELETE,
    permissions.AI_CHAT,
    permissions.AI_MODEL_SELECT,
    permissions.AI_PROMPT_CUSTOM,
    permissions.AI_DATA_QUERY,
    permissions.AI_MODEL_CONFIG,
    permissions.AI_MEMORY_MANAGE,
    permissions.DATA_VIEW_ALL,
    permissions.SYSTEM_CONFIG
  ],
  
  // 园长权限
  [roles.PRINCIPAL]: [
    permissions.USER_VIEW,
    permissions.USER_CREATE,
    permissions.USER_UPDATE,
    permissions.ROLE_VIEW,
    permissions.AI_CHAT,
    permissions.AI_MODEL_SELECT,
    permissions.AI_PROMPT_CUSTOM,
    permissions.AI_DATA_QUERY,
    permissions.DATA_VIEW_ALL
  ],
  
  // 教师权限
  [roles.TEACHER]: [
    // 班级管理权限
    permissions.CLASS_VIEW,
    permissions.CLASS_MANAGE,
    permissions.CLASS_UPDATE,
    
    // 学生管理权限
    permissions.STUDENT_VIEW,
    permissions.STUDENT_MANAGE,
    permissions.STUDENT_UPDATE,
    
    // 教师管理权限（查看和更新）
    permissions.TEACHER_VIEW,
    permissions.TEACHER_UPDATE,
    
    // 家长管理权限（查看）
    permissions.PARENT_VIEW,
    
    // 活动管理权限
    permissions.ACTIVITY_VIEW,
    permissions.ACTIVITY_MANAGE,
    permissions.ACTIVITY_CREATE,
    permissions.ACTIVITY_UPDATE,
    
    // 招生计划权限（查看）
    permissions.ENROLLMENT_PLAN_VIEW,
    permissions.ENROLLMENT_VIEW,
    
    // 申请管理权限（查看）
    permissions.APPLICATION_VIEW,
    
    // 客户管理权限（查看和管理）
    permissions.CUSTOMER_VIEW,
    permissions.CUSTOMER_MANAGE,
    
    // 统计分析权限
    permissions.STATISTICS_VIEW,
    
    // AI功能权限
    permissions.AI_CHAT,
    permissions.AI_MODEL_SELECT,
    permissions.AI_PROMPT_CUSTOM,
    permissions.AI_DATA_QUERY,
    
    // 数据查询权限
    permissions.DATA_VIEW_CLASS
  ],
  
  // 家长权限
  [roles.PARENT]: [
    permissions.AI_CHAT,
    permissions.AI_PROMPT_CUSTOM,
    permissions.DATA_VIEW_CHILD
  ],
  
  // 超级管理员权限
  [roles.SUPER_ADMIN]: [
    // 所有权限...
  ],
  
  // 其他角色权限...
};

// 数据访问过滤规则
export const dataAccessFilters = {
  // 教师只能访问自己班级的数据
  [roles.TEACHER]: {
    students: (userId: number) => ({ class_id: { $in: getUserClassIds(userId) } }),
    attendance: (userId: number) => ({ class_id: { $in: getUserClassIds(userId) } }),
    activities: (userId: number) => ({ teacher_id: userId })
  },
  
  // 家长只能访问自己孩子的数据
  [roles.PARENT]: {
    students: (userId: number) => ({ parent_id: userId }),
    attendance: (userId: number) => ({ student_id: { $in: getParentChildrenIds(userId) } }),
    activities: (userId: number) => ({ class_id: { $in: getParentChildrenClassIds(userId) } })
  }
};

// 辅助函数：获取教师的班级ID列表
function getUserClassIds(userId: number): number[] {
  // 实际实现中需要从数据库查询
  return [];
}

// 辅助函数：获取家长的孩子ID列表
function getParentChildrenIds(userId: number): number[] {
  // 实际实现中需要从数据库查询
  return [];
}

// 辅助函数：获取家长孩子所在的班级ID列表
function getParentChildrenClassIds(userId: number): number[] {
  // 实际实现中需要从数据库查询
  return [];
}

// 中心权限代码定义
export const centerPermissions = {
  PERSONNEL_CENTER: 'PERSONNEL_CENTER',
  ACTIVITY_CENTER: 'ACTIVITY_CENTER',
  ENROLLMENT_CENTER: 'ENROLLMENT_CENTER',
  MARKETING_CENTER: 'MARKETING_CENTER',
  AI_CENTER: 'AI_CENTER',
  CUSTOMER_POOL_CENTER: 'CUSTOMER_POOL_CENTER',
  TASK_CENTER_CATEGORY: 'TASK_CENTER_CATEGORY',
  SYSTEM_CENTER: 'SYSTEM_CENTER',
  FINANCE_CENTER: 'FINANCE_CENTER',
  ANALYTICS_CENTER: 'ANALYTICS_CENTER',
  TEACHING_CENTER: 'TEACHING_CENTER',
  INSPECTION_CENTER: 'INSPECTION_CENTER',
  SCRIPT_CENTER: 'SCRIPT_CENTER',        // 话术中心
  MEDIA_CENTER: 'MEDIA_CENTER',          // 新媒体中心
  BUSINESS_CENTER: 'BUSINESS_CENTER',    // 业务中心
  ATTENDANCE_CENTER: 'ATTENDANCE_CENTER',  // 考勤中心
  GROUP_MANAGEMENT: 'GROUP_MANAGEMENT',    // 集团管理
  USAGE_CENTER: 'USAGE_CENTER',            // 用量中心
  CALL_CENTER: 'CALL_CENTER',              // 呼叫中心 ✅ 新增
  TEACHER_DASHBOARD: 'DASHBOARD_INDEX',  // 教师工作台
  TEACHER_NOTIFICATION_CENTER: 'TEACHER_NOTIFICATION_CENTER'  // 教师通知中心
};

// 角色-中心访问权限映射
export const roleCenterAccess = {
  // Admin: 所有17个中心（数据库中实际存在的中心）
  [roles.ADMIN]: [
    centerPermissions.PERSONNEL_CENTER,      // 人员中心
    centerPermissions.ACTIVITY_CENTER,       // 活动中心
    centerPermissions.ENROLLMENT_CENTER,     // 招生中心
    centerPermissions.MARKETING_CENTER,      // 营销中心
    centerPermissions.SYSTEM_CENTER,         // 系统中心
    centerPermissions.FINANCE_CENTER,        // 财务中心
    centerPermissions.SCRIPT_CENTER,         // 话术中心
    centerPermissions.MEDIA_CENTER,          // 新媒体中心
    centerPermissions.BUSINESS_CENTER,       // 业务中心
    centerPermissions.CUSTOMER_POOL_CENTER,  // 客户池中心
    centerPermissions.TASK_CENTER_CATEGORY,  // 任务中心
    centerPermissions.TEACHING_CENTER,       // 教学中心
    centerPermissions.INSPECTION_CENTER,     // 督查中心
    centerPermissions.ATTENDANCE_CENTER,     // 考勤中心
    centerPermissions.GROUP_MANAGEMENT,      // 集团管理
    centerPermissions.USAGE_CENTER,          // 用量中心
    centerPermissions.CALL_CENTER            // 呼叫中心 ✅ 新增
  ],

  // Principal: 15个业务中心（排除系统中心和业务中心的敏感功能，包含四个新中心）
  [roles.PRINCIPAL]: [
    centerPermissions.PERSONNEL_CENTER,
    centerPermissions.ACTIVITY_CENTER,
    centerPermissions.ENROLLMENT_CENTER,
    centerPermissions.MARKETING_CENTER,
    centerPermissions.AI_CENTER,
    centerPermissions.CUSTOMER_POOL_CENTER,
    centerPermissions.TASK_CENTER_CATEGORY,
    centerPermissions.FINANCE_CENTER,
    centerPermissions.ANALYTICS_CENTER,
    centerPermissions.TEACHING_CENTER,
    centerPermissions.INSPECTION_CENTER,
    centerPermissions.SCRIPT_CENTER,      // 话术中心
    centerPermissions.MEDIA_CENTER,       // 新媒体中心
    centerPermissions.ATTENDANCE_CENTER,  // 考勤中心
    centerPermissions.USAGE_CENTER,       // 用量中心
    centerPermissions.CALL_CENTER         // 呼叫中心 ✅ 新增
    // 注意：集团管理(GROUP_MANAGEMENT)仅限管理员访问
  ],

  // Teacher: 7个教学相关中心（使用teacher-center专用页面）
  [roles.TEACHER]: [
    centerPermissions.TEACHER_DASHBOARD,      // 教师工作台
    centerPermissions.ACTIVITY_CENTER,
    centerPermissions.ENROLLMENT_CENTER,
    centerPermissions.CUSTOMER_POOL_CENTER,  // 客户池中心，支持客户跟踪功能
    centerPermissions.TASK_CENTER_CATEGORY,
    centerPermissions.TEACHING_CENTER,
    centerPermissions.TEACHER_NOTIFICATION_CENTER  // 通知中心
  ],

  // Parent: 2个相关中心
  [roles.PARENT]: [
    centerPermissions.ACTIVITY_CENTER,
    centerPermissions.ENROLLMENT_CENTER
  ]
};

// 中心权限ID映射（对应数据库中的权限ID）
// 🎯 重要：这些ID必须与数据库中permissions表的实际ID完全匹配
export const centerPermissionIds = {
  [centerPermissions.PERSONNEL_CENTER]: 3002,      // 人员中心
  [centerPermissions.ACTIVITY_CENTER]: 5234,       // 活动中心 (修正: 3003 -> 5234)
  [centerPermissions.ENROLLMENT_CENTER]: 5237,     // 招生中心 (修正: 3004 -> 5237)
  [centerPermissions.MARKETING_CENTER]: 3005,      // 营销中心
  [centerPermissions.SYSTEM_CENTER]: 2013,         // 系统中心
  [centerPermissions.FINANCE_CENTER]: 3074,        // 财务中心
  [centerPermissions.SCRIPT_CENTER]: 5217,         // 话术中心
  [centerPermissions.MEDIA_CENTER]: 5219,          // 新媒体中心
  [centerPermissions.BUSINESS_CENTER]: 5235,       // 业务中心 (新增)
  [centerPermissions.CUSTOMER_POOL_CENTER]: 5236,  // 客户池中心 (修正: 3054 -> 5236)
  [centerPermissions.TASK_CENTER_CATEGORY]: 5238,  // 任务中心 (修正: 3035 -> 5238)
  [centerPermissions.TEACHING_CENTER]: 5240,       // 教学中心 (修正: 4059 -> 5240)
  [centerPermissions.INSPECTION_CENTER]: 5001,     // 督查中心 ✅ 已启用
  [centerPermissions.ATTENDANCE_CENTER]: 5316,     // 考勤中心 ✅ 新增
  [centerPermissions.GROUP_MANAGEMENT]: 1000,      // 集团管理 ✅ 新增
  [centerPermissions.USAGE_CENTER]: 5323,          // 用量中心 ✅ 新增
  [centerPermissions.CALL_CENTER]: 5328,           // 呼叫中心 ✅ 修复：5324 -> 5328
  // 以下中心在数据库中不存在，暂时保留配置
  [centerPermissions.AI_CENTER]: 3006,             // AI中心 (数据库中不存在)
  [centerPermissions.ANALYTICS_CENTER]: 3073,      // 分析中心 (数据库中不存在)
  [centerPermissions.TEACHER_DASHBOARD]: 1164,     // 教师工作台 (数据库中不存在)
  [centerPermissions.TEACHER_NOTIFICATION_CENTER]: 5221  // 教师通知中心 (数据库中不存在)
};