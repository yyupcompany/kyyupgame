"use strict";
/**
 * 用户角色映射文件
 * 定义系统角色和权限的映射关系
 */
var _a, _b, _c, _d, _e;
exports.__esModule = true;
exports.centerPermissionIds = exports.roleCenterAccess = exports.centerPermissions = exports.dataAccessFilters = exports.rolePermissionMapping = exports.permissions = exports.roleIdMapping = exports.roles = void 0;
// 角色定义
exports.roles = {
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
exports.roleIdMapping = (_a = {},
    _a[exports.roles.ADMIN] = 1,
    _a[exports.roles.PRINCIPAL] = 2,
    _a[exports.roles.TEACHER] = 3,
    _a[exports.roles.PARENT] = 4,
    _a[exports.roles.SUPER_ADMIN] = 5,
    _a[exports.roles.MARKETING] = 6,
    _a[exports.roles.ENROLLMENT] = 7,
    _a[exports.roles.FINANCE] = 8,
    _a[exports.roles.STAFF] = 9,
    _a);
// 权限定义
exports.permissions = {
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
exports.rolePermissionMapping = (_b = {},
    // 管理员拥有所有权限
    _b[exports.roles.ADMIN] = [
        exports.permissions.USER_VIEW,
        exports.permissions.USER_CREATE,
        exports.permissions.USER_UPDATE,
        exports.permissions.USER_DELETE,
        exports.permissions.ROLE_VIEW,
        exports.permissions.ROLE_CREATE,
        exports.permissions.ROLE_UPDATE,
        exports.permissions.ROLE_DELETE,
        exports.permissions.AI_CHAT,
        exports.permissions.AI_MODEL_SELECT,
        exports.permissions.AI_PROMPT_CUSTOM,
        exports.permissions.AI_DATA_QUERY,
        exports.permissions.AI_MODEL_CONFIG,
        exports.permissions.AI_MEMORY_MANAGE,
        exports.permissions.DATA_VIEW_ALL,
        exports.permissions.SYSTEM_CONFIG
    ],
    // 园长权限
    _b[exports.roles.PRINCIPAL] = [
        exports.permissions.USER_VIEW,
        exports.permissions.USER_CREATE,
        exports.permissions.USER_UPDATE,
        exports.permissions.ROLE_VIEW,
        exports.permissions.AI_CHAT,
        exports.permissions.AI_MODEL_SELECT,
        exports.permissions.AI_PROMPT_CUSTOM,
        exports.permissions.AI_DATA_QUERY,
        exports.permissions.DATA_VIEW_ALL
    ],
    // 教师权限
    _b[exports.roles.TEACHER] = [
        // 班级管理权限
        exports.permissions.CLASS_VIEW,
        exports.permissions.CLASS_MANAGE,
        exports.permissions.CLASS_UPDATE,
        // 学生管理权限
        exports.permissions.STUDENT_VIEW,
        exports.permissions.STUDENT_MANAGE,
        exports.permissions.STUDENT_UPDATE,
        // 教师管理权限（查看和更新）
        exports.permissions.TEACHER_VIEW,
        exports.permissions.TEACHER_UPDATE,
        // 家长管理权限（查看）
        exports.permissions.PARENT_VIEW,
        // 活动管理权限
        exports.permissions.ACTIVITY_VIEW,
        exports.permissions.ACTIVITY_MANAGE,
        exports.permissions.ACTIVITY_CREATE,
        exports.permissions.ACTIVITY_UPDATE,
        // 招生计划权限（查看）
        exports.permissions.ENROLLMENT_PLAN_VIEW,
        exports.permissions.ENROLLMENT_VIEW,
        // 申请管理权限（查看）
        exports.permissions.APPLICATION_VIEW,
        // 客户管理权限（查看和管理）
        exports.permissions.CUSTOMER_VIEW,
        exports.permissions.CUSTOMER_MANAGE,
        // 统计分析权限
        exports.permissions.STATISTICS_VIEW,
        // AI功能权限
        exports.permissions.AI_CHAT,
        exports.permissions.AI_MODEL_SELECT,
        exports.permissions.AI_PROMPT_CUSTOM,
        exports.permissions.AI_DATA_QUERY,
        // 数据查询权限
        exports.permissions.DATA_VIEW_CLASS
    ],
    // 家长权限
    _b[exports.roles.PARENT] = [
        exports.permissions.AI_CHAT,
        exports.permissions.AI_PROMPT_CUSTOM,
        exports.permissions.DATA_VIEW_CHILD
    ],
    // 超级管理员权限
    _b[exports.roles.SUPER_ADMIN] = [
    // 所有权限...
    ],
    _b);
// 数据访问过滤规则
exports.dataAccessFilters = (_c = {},
    // 教师只能访问自己班级的数据
    _c[exports.roles.TEACHER] = {
        students: function (userId) { return ({ class_id: { $in: getUserClassIds(userId) } }); },
        attendance: function (userId) { return ({ class_id: { $in: getUserClassIds(userId) } }); },
        activities: function (userId) { return ({ teacher_id: userId }); }
    },
    // 家长只能访问自己孩子的数据
    _c[exports.roles.PARENT] = {
        students: function (userId) { return ({ parent_id: userId }); },
        attendance: function (userId) { return ({ student_id: { $in: getParentChildrenIds(userId) } }); },
        activities: function (userId) { return ({ class_id: { $in: getParentChildrenClassIds(userId) } }); }
    },
    _c);
// 辅助函数：获取教师的班级ID列表
function getUserClassIds(userId) {
    // 实际实现中需要从数据库查询
    return [];
}
// 辅助函数：获取家长的孩子ID列表
function getParentChildrenIds(userId) {
    // 实际实现中需要从数据库查询
    return [];
}
// 辅助函数：获取家长孩子所在的班级ID列表
function getParentChildrenClassIds(userId) {
    // 实际实现中需要从数据库查询
    return [];
}
// 中心权限代码定义
exports.centerPermissions = {
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
    SCRIPT_CENTER: 'SCRIPT_CENTER',
    MEDIA_CENTER: 'MEDIA_CENTER',
    BUSINESS_CENTER: 'BUSINESS_CENTER',
    ATTENDANCE_CENTER: 'ATTENDANCE_CENTER',
    GROUP_MANAGEMENT: 'GROUP_MANAGEMENT',
    USAGE_CENTER: 'USAGE_CENTER',
    CALL_CENTER: 'CALL_CENTER',
    TEACHER_DASHBOARD: 'DASHBOARD_INDEX',
    TEACHER_NOTIFICATION_CENTER: 'TEACHER_NOTIFICATION_CENTER' // 教师通知中心
};
// 角色-中心访问权限映射
exports.roleCenterAccess = (_d = {},
    // Admin: 所有17个中心（数据库中实际存在的中心）
    _d[exports.roles.ADMIN] = [
        exports.centerPermissions.PERSONNEL_CENTER,
        exports.centerPermissions.ACTIVITY_CENTER,
        exports.centerPermissions.ENROLLMENT_CENTER,
        exports.centerPermissions.MARKETING_CENTER,
        exports.centerPermissions.SYSTEM_CENTER,
        exports.centerPermissions.FINANCE_CENTER,
        exports.centerPermissions.SCRIPT_CENTER,
        exports.centerPermissions.MEDIA_CENTER,
        exports.centerPermissions.BUSINESS_CENTER,
        exports.centerPermissions.CUSTOMER_POOL_CENTER,
        exports.centerPermissions.TASK_CENTER_CATEGORY,
        exports.centerPermissions.TEACHING_CENTER,
        exports.centerPermissions.INSPECTION_CENTER,
        exports.centerPermissions.ATTENDANCE_CENTER,
        exports.centerPermissions.GROUP_MANAGEMENT,
        exports.centerPermissions.USAGE_CENTER,
        exports.centerPermissions.CALL_CENTER // 呼叫中心 ✅ 新增
    ],
    // Principal: 15个业务中心（排除系统中心和业务中心的敏感功能，包含四个新中心）
    _d[exports.roles.PRINCIPAL] = [
        exports.centerPermissions.PERSONNEL_CENTER,
        exports.centerPermissions.ACTIVITY_CENTER,
        exports.centerPermissions.ENROLLMENT_CENTER,
        exports.centerPermissions.MARKETING_CENTER,
        exports.centerPermissions.AI_CENTER,
        exports.centerPermissions.CUSTOMER_POOL_CENTER,
        exports.centerPermissions.TASK_CENTER_CATEGORY,
        exports.centerPermissions.FINANCE_CENTER,
        exports.centerPermissions.ANALYTICS_CENTER,
        exports.centerPermissions.TEACHING_CENTER,
        exports.centerPermissions.INSPECTION_CENTER,
        exports.centerPermissions.SCRIPT_CENTER,
        exports.centerPermissions.MEDIA_CENTER,
        exports.centerPermissions.ATTENDANCE_CENTER,
        exports.centerPermissions.USAGE_CENTER,
        exports.centerPermissions.CALL_CENTER // 呼叫中心 ✅ 新增
        // 注意：集团管理(GROUP_MANAGEMENT)仅限管理员访问
    ],
    // Teacher: 7个教学相关中心（使用teacher-center专用页面）
    _d[exports.roles.TEACHER] = [
        exports.centerPermissions.TEACHER_DASHBOARD,
        exports.centerPermissions.ACTIVITY_CENTER,
        exports.centerPermissions.ENROLLMENT_CENTER,
        exports.centerPermissions.CUSTOMER_POOL_CENTER,
        exports.centerPermissions.TASK_CENTER_CATEGORY,
        exports.centerPermissions.TEACHING_CENTER,
        exports.centerPermissions.TEACHER_NOTIFICATION_CENTER // 通知中心
    ],
    // Parent: 2个相关中心
    _d[exports.roles.PARENT] = [
        exports.centerPermissions.ACTIVITY_CENTER,
        exports.centerPermissions.ENROLLMENT_CENTER
    ],
    _d);
// 中心权限ID映射（对应数据库中的权限ID）
// 🎯 重要：这些ID必须与数据库中permissions表的实际ID完全匹配
exports.centerPermissionIds = (_e = {},
    _e[exports.centerPermissions.PERSONNEL_CENTER] = 3002,
    _e[exports.centerPermissions.ACTIVITY_CENTER] = 5234,
    _e[exports.centerPermissions.ENROLLMENT_CENTER] = 5237,
    _e[exports.centerPermissions.MARKETING_CENTER] = 3005,
    _e[exports.centerPermissions.SYSTEM_CENTER] = 2013,
    _e[exports.centerPermissions.FINANCE_CENTER] = 3074,
    _e[exports.centerPermissions.SCRIPT_CENTER] = 5217,
    _e[exports.centerPermissions.MEDIA_CENTER] = 5219,
    _e[exports.centerPermissions.BUSINESS_CENTER] = 5235,
    _e[exports.centerPermissions.CUSTOMER_POOL_CENTER] = 5236,
    _e[exports.centerPermissions.TASK_CENTER_CATEGORY] = 5238,
    _e[exports.centerPermissions.TEACHING_CENTER] = 5240,
    _e[exports.centerPermissions.INSPECTION_CENTER] = 5001,
    _e[exports.centerPermissions.ATTENDANCE_CENTER] = 5316,
    _e[exports.centerPermissions.GROUP_MANAGEMENT] = 1000,
    _e[exports.centerPermissions.USAGE_CENTER] = 5323,
    _e[exports.centerPermissions.CALL_CENTER] = 5328,
    // 以下中心在数据库中不存在，暂时保留配置
    _e[exports.centerPermissions.AI_CENTER] = 3006,
    _e[exports.centerPermissions.ANALYTICS_CENTER] = 3073,
    _e[exports.centerPermissions.TEACHER_DASHBOARD] = 1164,
    _e[exports.centerPermissions.TEACHER_NOTIFICATION_CENTER] = 5221 // 教师通知中心 (数据库中不存在)
,
    _e);
