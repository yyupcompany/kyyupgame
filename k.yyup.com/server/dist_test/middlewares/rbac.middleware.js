"use strict";
/**
 * RBAC权限检查中间件
 * 为统一智能服务提供严格的角色权限控制
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var _a;
exports.__esModule = true;
exports.logSecurityViolation = exports.requirePermission = exports.createRBACMiddleware = exports.ROLE_PERMISSIONS = exports.SENSITIVE_OPERATIONS = exports.PermissionLevel = exports.Role = void 0;
// 角色定义
var Role;
(function (Role) {
    Role["ADMIN"] = "admin";
    Role["PRINCIPAL"] = "principal";
    Role["TEACHER"] = "teacher";
    Role["PARENT"] = "parent";
})(Role = exports.Role || (exports.Role = {}));
// 权限级别定义
var PermissionLevel;
(function (PermissionLevel) {
    PermissionLevel["FULL"] = "full";
    PermissionLevel["LIMITED"] = "limited";
    PermissionLevel["RESTRICTED"] = "restricted";
    PermissionLevel["DENIED"] = "denied"; // 拒绝访问
})(PermissionLevel = exports.PermissionLevel || (exports.PermissionLevel = {}));
// 敏感操作定义
exports.SENSITIVE_OPERATIONS = [
    // 系统管理
    'modify_system_config',
    'manage_user_permissions',
    'access_all_user_data',
    'modify_admin_settings',
    // 财务数据
    'view_financial_data',
    'modify_financial_settings',
    'access_revenue_data',
    // 用户管理
    'create_admin_user',
    'modify_user_roles',
    'delete_user_accounts',
    // 数据导出
    'export_all_data',
    'access_sensitive_reports'
];
// 角色权限映射
exports.ROLE_PERMISSIONS = (_a = {},
    _a[Role.ADMIN] = {
        level: PermissionLevel.FULL,
        allowedOperations: [
            'view_all_data',
            'modify_system_config',
            'manage_users',
            'access_financial_data',
            'system_administration'
        ],
        dataAccess: {
            users: 'all',
            students: 'all',
            teachers: 'all',
            parents: 'all',
            financial: 'all',
            system: 'all'
        }
    },
    _a[Role.PRINCIPAL] = {
        level: PermissionLevel.LIMITED,
        allowedOperations: [
            'view_school_data',
            'manage_teachers',
            'manage_students',
            'view_financial_reports',
            'manage_activities'
        ],
        dataAccess: {
            users: 'school_only',
            students: 'school_only',
            teachers: 'school_only',
            parents: 'school_only',
            financial: 'reports_only',
            system: 'none'
        },
        restrictions: [
            'cannot_modify_system_config',
            'cannot_access_other_schools',
            'cannot_modify_admin_users'
        ]
    },
    _a[Role.TEACHER] = {
        level: PermissionLevel.RESTRICTED,
        allowedOperations: [
            'view_own_classes',
            'manage_own_students',
            'view_class_activities',
            'submit_reports'
        ],
        dataAccess: {
            users: 'none',
            students: 'own_classes_only',
            teachers: 'basic_info_only',
            parents: 'student_parents_only',
            financial: 'none',
            system: 'none'
        },
        restrictions: [
            'cannot_access_other_classes',
            'cannot_view_financial_data',
            'cannot_modify_system_settings',
            'cannot_access_admin_functions'
        ]
    },
    _a[Role.PARENT] = {
        level: PermissionLevel.DENIED,
        allowedOperations: [
            'view_own_children',
            'view_child_activities',
            'communicate_with_teachers'
        ],
        dataAccess: {
            users: 'none',
            students: 'own_children_only',
            teachers: 'child_teachers_only',
            parents: 'none',
            financial: 'own_payments_only',
            system: 'none'
        },
        restrictions: [
            'cannot_access_other_children',
            'cannot_view_system_data',
            'cannot_access_admin_functions',
            'cannot_view_financial_data',
            'cannot_modify_any_settings'
        ]
    },
    _a);
/**
 * 创建RBAC中间件
 */
function createRBACMiddleware() {
    return function (req, res, next) {
        try {
            // 从请求中提取安全上下文
            var context = extractSecurityContext(req);
            // 验证权限
            var permissionCheck = validatePermissions(context);
            if (!permissionCheck.allowed) {
                return res.status(403).json({
                    success: false,
                    error: 'Access Denied',
                    message: permissionCheck.reason,
                    code: 'RBAC_PERMISSION_DENIED'
                });
            }
            // 将安全上下文附加到请求对象
            req.securityContext = __assign(__assign({}, context), { permissionLevel: permissionCheck.level, allowedOperations: permissionCheck.allowedOperations });
            next();
        }
        catch (error) {
            console.error('❌ RBAC中间件错误:', error);
            return res.status(500).json({
                success: false,
                error: 'Security Check Failed',
                message: '权限验证过程中发生错误'
            });
        }
    };
}
exports.createRBACMiddleware = createRBACMiddleware;
/**
 * 提取安全上下文
 */
function extractSecurityContext(req) {
    var _a, _b, _c;
    var body = req.body || {};
    var context = body.context || {};
    // 提取用户ID（优先从认证信息，其次从请求参数）
    var userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || body.userId || context.userId || '121';
    // 提取角色信息
    console.log('🔍 [RBAC] req.user:', req.user);
    console.log('🔍 [RBAC] req.user?.role:', (_b = req.user) === null || _b === void 0 ? void 0 : _b.role);
    console.log('🔍 [RBAC] context.role:', context.role);
    var role = normalizeRole(((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) || context.role || 'parent');
    console.log('🔍 [RBAC] 最终角色:', role);
    // 提取请求信息
    var message = body.message || '';
    var requestType = determineRequestType(message, req.path);
    return {
        userId: userId,
        role: role,
        message: message,
        requestType: requestType,
        timestamp: new Date()
    };
}
/**
 * 标准化角色名称
 */
function normalizeRole(role) {
    var normalizedRole = role.toLowerCase();
    switch (normalizedRole) {
        case 'admin':
        case 'administrator':
        case 'super_admin':
            return Role.ADMIN;
        case 'principal':
        case 'headmaster':
            return Role.PRINCIPAL;
        case 'teacher':
        case 'instructor':
            return Role.TEACHER;
        case 'parent':
        case 'guardian':
            return Role.PARENT;
        default:
            console.warn("\u26A0\uFE0F \u672A\u77E5\u89D2\u8272\u7C7B\u578B: ".concat(role, ", \u9ED8\u8BA4\u4E3Aparent"));
            return Role.PARENT;
    }
}
/**
 * 确定请求类型
 */
function determineRequestType(message, path) {
    var lowerMessage = message.toLowerCase();
    // 系统管理类请求
    if (lowerMessage.includes('系统') || lowerMessage.includes('配置') ||
        lowerMessage.includes('权限') || lowerMessage.includes('管理员')) {
        return 'system_management';
    }
    // 财务相关请求
    if (lowerMessage.includes('财务') || lowerMessage.includes('收支') ||
        lowerMessage.includes('费用') || lowerMessage.includes('收入')) {
        return 'financial_access';
    }
    // 用户数据访问
    if (lowerMessage.includes('所有用户') || lowerMessage.includes('全部用户') ||
        lowerMessage.includes('用户统计') || lowerMessage.includes('登录统计')) {
        return 'user_data_access';
    }
    // 跨权限数据访问
    if (lowerMessage.includes('其他') || lowerMessage.includes('所有') ||
        lowerMessage.includes('全部') || lowerMessage.includes('所有班级') ||
        lowerMessage.includes('其他家庭') || lowerMessage.includes('全部门')) {
        return 'cross_permission_access';
    }
    // 数据可视化
    if (lowerMessage.includes('图表') || lowerMessage.includes('统计') ||
        lowerMessage.includes('报告') || lowerMessage.includes('分析')) {
        return 'data_visualization';
    }
    return 'general_query';
}
/**
 * 验证权限
 */
function validatePermissions(context) {
    var rolePermissions = exports.ROLE_PERMISSIONS[context.role];
    if (!rolePermissions) {
        return {
            allowed: false,
            reason: '无效的用户角色',
            level: PermissionLevel.DENIED,
            allowedOperations: []
        };
    }
    // 检查请求类型权限
    var requestCheck = checkRequestPermissions(context, rolePermissions);
    if (!requestCheck.allowed) {
        return requestCheck;
    }
    // 检查敏感操作权限
    var sensitiveCheck = checkSensitiveOperations(context, rolePermissions);
    if (!sensitiveCheck.allowed) {
        return sensitiveCheck;
    }
    // 检查数据访问权限
    var dataAccessCheck = checkDataAccessPermissions(context, rolePermissions);
    if (!dataAccessCheck.allowed) {
        return dataAccessCheck;
    }
    return {
        allowed: true,
        level: rolePermissions.level,
        allowedOperations: rolePermissions.allowedOperations
    };
}
/**
 * 检查请求类型权限
 */
function checkRequestPermissions(context, permissions) {
    switch (context.requestType) {
        case 'system_management':
            if (context.role !== Role.ADMIN) {
                return {
                    allowed: false,
                    reason: '您没有权限访问系统管理功能，该功能仅限管理员使用',
                    level: PermissionLevel.DENIED,
                    allowedOperations: []
                };
            }
            break;
        case 'financial_access':
            if (context.role === Role.TEACHER || context.role === Role.PARENT) {
                return {
                    allowed: false,
                    reason: '您没有权限访问财务数据，该功能仅限管理员和园长使用',
                    level: PermissionLevel.DENIED,
                    allowedOperations: []
                };
            }
            break;
        case 'user_data_access':
            if (context.role === Role.TEACHER || context.role === Role.PARENT) {
                return {
                    allowed: false,
                    reason: '您没有权限查看所有用户数据，只能访问与您相关的信息',
                    level: PermissionLevel.DENIED,
                    allowedOperations: []
                };
            }
            break;
        case 'cross_permission_access':
            if (context.role === Role.TEACHER) {
                return {
                    allowed: false,
                    reason: '教师只能访问自己负责班级的数据，无法查看其他班级信息',
                    level: PermissionLevel.DENIED,
                    allowedOperations: []
                };
            }
            if (context.role === Role.PARENT) {
                return {
                    allowed: false,
                    reason: '家长只能查看自己孩子的相关信息，无法访问其他家庭的数据',
                    level: PermissionLevel.DENIED,
                    allowedOperations: []
                };
            }
            break;
    }
    return {
        allowed: true,
        level: permissions.level,
        allowedOperations: permissions.allowedOperations
    };
}
/**
 * 检查敏感操作权限
 */
function checkSensitiveOperations(context, permissions) {
    var message = context.message.toLowerCase();
    // 检查是否包含敏感操作关键词
    var sensitiveKeywords = [
        '修改系统', '删除所有', '修改权限', '管理员密码',
        '系统配置', '删除用户', '重置系统', '清空数据'
    ];
    var containsSensitiveOperation = sensitiveKeywords.some(function (keyword) {
        return message.includes(keyword);
    });
    if (containsSensitiveOperation && context.role !== Role.ADMIN) {
        return {
            allowed: false,
            reason: '检测到敏感操作，该操作仅限系统管理员执行',
            level: PermissionLevel.DENIED,
            allowedOperations: []
        };
    }
    return {
        allowed: true,
        level: permissions.level,
        allowedOperations: permissions.allowedOperations
    };
}
/**
 * 检查数据访问权限
 */
function checkDataAccessPermissions(context, permissions) {
    var dataAccess = permissions.dataAccess;
    var message = context.message.toLowerCase();
    // 检查用户数据访问
    if (message.includes('用户') && dataAccess.users === 'none') {
        return {
            allowed: false,
            reason: '您没有权限访问用户数据',
            level: PermissionLevel.DENIED,
            allowedOperations: []
        };
    }
    // 检查财务数据访问
    if ((message.includes('财务') || message.includes('收支')) &&
        dataAccess.financial === 'none') {
        return {
            allowed: false,
            reason: '您没有权限访问财务数据',
            level: PermissionLevel.DENIED,
            allowedOperations: []
        };
    }
    // 检查系统数据访问
    if (message.includes('系统') && dataAccess.system === 'none') {
        return {
            allowed: false,
            reason: '您没有权限访问系统数据',
            level: PermissionLevel.DENIED,
            allowedOperations: []
        };
    }
    return {
        allowed: true,
        level: permissions.level,
        allowedOperations: permissions.allowedOperations
    };
}
/**
 * 权限检查装饰器（用于服务层）
 */
function requirePermission(requiredRole, operation) {
    return function (target, propertyName, descriptor) {
        var method = descriptor.value;
        descriptor.value = function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var context = (_a = args[0]) === null || _a === void 0 ? void 0 : _a.context;
            if (!context) {
                throw new Error('权限检查失败：缺少安全上下文');
            }
            var userRole = normalizeRole(context.role);
            var allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
            if (!allowedRoles.includes(userRole)) {
                throw new Error("\u6743\u9650\u4E0D\u8DB3\uFF1A\u8BE5\u64CD\u4F5C\u9700\u8981 ".concat(allowedRoles.join('或'), " \u89D2\u8272"));
            }
            if (operation) {
                var rolePermissions = exports.ROLE_PERMISSIONS[userRole];
                if (!rolePermissions.allowedOperations.includes(operation)) {
                    throw new Error("\u6743\u9650\u4E0D\u8DB3\uFF1A\u89D2\u8272 ".concat(userRole, " \u65E0\u6CD5\u6267\u884C\u64CD\u4F5C ").concat(operation));
                }
            }
            return method.apply(this, args);
        };
        return descriptor;
    };
}
exports.requirePermission = requirePermission;
/**
 * 记录权限违规行为
 */
function logSecurityViolation(context, violation) {
    var logEntry = {
        timestamp: new Date().toISOString(),
        userId: context.userId,
        role: context.role,
        message: context.message,
        violation: violation,
        severity: 'HIGH',
        action: 'BLOCKED'
    };
    console.warn('🚨 安全违规检测:', logEntry);
    // 在实际应用中，这里应该记录到安全日志系统
    // await securityLogger.logViolation(logEntry);
}
exports.logSecurityViolation = logSecurityViolation;
exports["default"] = {
    createRBACMiddleware: createRBACMiddleware,
    Role: Role,
    PermissionLevel: PermissionLevel,
    ROLE_PERMISSIONS: exports.ROLE_PERMISSIONS,
    requirePermission: requirePermission,
    logSecurityViolation: logSecurityViolation
};
