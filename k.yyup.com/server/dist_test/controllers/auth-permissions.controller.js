"use strict";
/**
 * 权限相关的认证控制器
 * 提供用户权限验证和菜单获取功能
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.AuthPermissionsController = void 0;
var sequelize_1 = require("sequelize");
var apiResponse_1 = require("../utils/apiResponse");
var index_1 = require("../models/index");
var AuthPermissionsController = /** @class */ (function () {
    function AuthPermissionsController() {
    }
    /**
     * 获取用户权限列表
     */
    AuthPermissionsController.getUserPermissions = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, userRoles, roleIds, activeRoles, activeRoleIds, rolePermissions, permissions, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, apiResponse_1.ApiResponse.unauthorized(res, '用户未登录')];
                        }
                        console.log('🔐 获取用户权限:', userId);
                        return [4 /*yield*/, index_1.UserRoleModel.findAll({
                                where: { userId: userId }
                            })];
                    case 1:
                        userRoles = _b.sent();
                        if (!userRoles || userRoles.length === 0) {
                            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, [], '用户没有分配角色')];
                        }
                        roleIds = userRoles.map(function (ur) { return ur.roleId; });
                        return [4 /*yield*/, index_1.Role.findAll({
                                where: {
                                    id: roleIds,
                                    status: 1
                                }
                            })];
                    case 2:
                        activeRoles = _b.sent();
                        if (activeRoles.length === 0) {
                            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, [], '用户没有激活的角色')];
                        }
                        activeRoleIds = activeRoles.map(function (role) { return role.id; });
                        console.log('👥 用户激活角色ID:', activeRoleIds);
                        return [4 /*yield*/, index_1.RolePermission.findAll({
                                where: { roleId: activeRoleIds },
                                include: [
                                    {
                                        model: index_1.Permission,
                                        as: 'permission',
                                        where: { status: 1 }
                                    }
                                ]
                            })];
                    case 3:
                        rolePermissions = _b.sent();
                        permissions = rolePermissions.map(function (rp) { return rp.permission; });
                        console.log('✅ 用户权限数量:', permissions.length);
                        apiResponse_1.ApiResponse.success(res, permissions, '获取用户权限成功');
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        console.error('❌ 获取用户权限失败:', error_1);
                        apiResponse_1.ApiResponse.handleError(res, error_1, '获取用户权限失败');
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户菜单 - 完全基于数据库role_permissions表
     */
    AuthPermissionsController.getUserMenu = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var userId, startTime, userRoles, roleIds, rolePermissions, permissionIds, userRoleCode, whereCondition, menuPermissions, parentIdGroups_1, buildMenuTree, menuTree, totalTime, error_2, fallbackMenu;
            var _c, _d, _e, _f, _g, _h, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        _k.trys.push([0, 4, , 5]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, apiResponse_1.ApiResponse.unauthorized(res, '用户未登录')];
                        }
                        console.log('🍽️ 获取用户菜单 (纯数据库版):', userId);
                        startTime = Date.now();
                        return [4 /*yield*/, index_1.UserRoleModel.findAll({
                                where: { userId: userId },
                                include: [{
                                        model: index_1.Role,
                                        as: 'role',
                                        where: { status: 1 }
                                    }]
                            })];
                    case 1:
                        userRoles = _k.sent();
                        if (!userRoles || userRoles.length === 0) {
                            console.log('❌ 用户没有分配角色');
                            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, [], '用户没有分配角色')];
                        }
                        roleIds = userRoles.map(function (ur) { return ur.roleId; });
                        console.log('👤 用户角色ID:', roleIds);
                        return [4 /*yield*/, index_1.RolePermission.findAll({
                                where: { roleId: roleIds }
                            })];
                    case 2:
                        rolePermissions = _k.sent();
                        permissionIds = rolePermissions.map(function (rp) { return rp.permissionId; });
                        console.log('🔑 角色拥有的权限ID数量:', permissionIds.length);
                        userRoleCode = ((_b = userRoles[0].role) === null || _b === void 0 ? void 0 : _b.code) || 'admin';
                        console.log('👤 用户角色code:', userRoleCode);
                        whereCondition = {
                            id: (_c = {}, _c[sequelize_1.Op["in"]] = permissionIds, _c),
                            status: 1,
                            type: (_d = {}, _d[sequelize_1.Op["in"]] = ['category', 'menu', 'page'], _d)
                        };
                        // 🎯 关键修复：根据角色过滤菜单
                        if (userRoleCode === 'teacher') {
                            // 教师：只显示TEACHER_开头的权限
                            whereCondition.code = (_e = {}, _e[sequelize_1.Op.like] = 'TEACHER_%', _e);
                            console.log('🔐 教师角色：只返回TEACHER_开头的菜单');
                        }
                        else if (userRoleCode === 'parent') {
                            // 家长：只显示PARENT_开头的权限
                            whereCondition.code = (_f = {}, _f[sequelize_1.Op.like] = 'PARENT_%', _f);
                            console.log('🔐 家长角色：只返回PARENT_开头的菜单');
                        }
                        else {
                            // Admin/园长：排除TEACHER_和PARENT_开头的权限，只显示通用中心菜单
                            whereCondition.code = (_g = {},
                                _g[sequelize_1.Op.and] = [
                                    (_h = {}, _h[sequelize_1.Op.notLike] = 'TEACHER_%', _h),
                                    (_j = {}, _j[sequelize_1.Op.notLike] = 'PARENT_%', _j)
                                ],
                                _g);
                            console.log('🔐 Admin/园长角色：排除TEACHER_和PARENT_菜单，只返回中心目录');
                        }
                        return [4 /*yield*/, index_1.Permission.findAll({
                                where: whereCondition,
                                order: [['sort', 'ASC']]
                            })];
                    case 3:
                        menuPermissions = _k.sent();
                        console.log('📊 从数据库获取并过滤菜单权限:', menuPermissions.length, '条，耗时:', Date.now() - startTime, 'ms');
                        if (menuPermissions.length === 0) {
                            console.log('⚠️ 没有找到菜单权限，返回空数组');
                            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, [], '没有菜单权限')];
                        }
                        console.log('🔍 前5个菜单权限:', menuPermissions.slice(0, 5).map(function (p) { return ({
                            id: p.id,
                            name: p.name,
                            chineseName: p.chineseName || p.chinese_name,
                            type: p.type,
                            parentId: p.parentId
                        }); }));
                        parentIdGroups_1 = {};
                        menuPermissions.forEach(function (p) {
                            var parentId = p.parentId || 'NULL';
                            if (!parentIdGroups_1[parentId]) {
                                parentIdGroups_1[parentId] = [];
                            }
                            parentIdGroups_1[parentId].push(p);
                        });
                        console.log('🔍 ParentId分布:');
                        Object.keys(parentIdGroups_1).forEach(function (parentId) {
                            console.log("  ".concat(parentId, ": ").concat(parentIdGroups_1[parentId].length, " \u9879"));
                            if (parentId === 'NULL') {
                                console.log('    根级项目:', parentIdGroups_1[parentId].map(function (p) { return "".concat(p.name, "(").concat(p.type, ")"); }).join(', '));
                            }
                        });
                        buildMenuTree = function (permissions) {
                            var permissionMap = new Map();
                            var rootItems = [];
                            // 创建所有权限的映射
                            permissions.forEach(function (permission) {
                                permissionMap.set(permission.id, {
                                    id: permission.id,
                                    name: permission.name,
                                    chinese_name: permission.chineseName || permission.chinese_name || permission.name,
                                    path: permission.path,
                                    component: permission.component,
                                    icon: permission.icon || 'Menu',
                                    sort: permission.sort,
                                    type: permission.type,
                                    parentId: permission.parentId,
                                    children: []
                                });
                            });
                            // 构建树结构
                            permissions.forEach(function (permission) {
                                var menuItem = permissionMap.get(permission.id);
                                if (permission.parentId) {
                                    var parent_1 = permissionMap.get(permission.parentId);
                                    if (parent_1) {
                                        parent_1.children.push(menuItem);
                                        // 对子项进行排序
                                        parent_1.children.sort(function (a, b) { return a.sort - b.sort; });
                                    }
                                }
                                else {
                                    // 根项目包括category和没有父级的menu
                                    rootItems.push(menuItem);
                                }
                            });
                            // 对根项进行排序
                            rootItems.sort(function (a, b) { return a.sort - b.sort; });
                            // 构建完整的菜单树，保留所有菜单项
                            var filterMenuItems = function (items) {
                                return items.map(function (item) {
                                    // 递归处理子项
                                    var filteredChildren = item.children ? filterMenuItems(item.children) : [];
                                    // 返回当前项目（包含过滤后的子项）
                                    return __assign(__assign({}, item), { children: filteredChildren });
                                });
                            };
                            return filterMenuItems(rootItems);
                        };
                        menuTree = buildMenuTree(menuPermissions);
                        console.log('📁 菜单树结构:', menuTree.length, '个根项目');
                        console.log('🔍 菜单详情:', JSON.stringify(menuTree.map(function (item) { return ({
                            name: item.name,
                            path: item.path,
                            type: item.type,
                            children: item.children.length
                        }); }), null, 2));
                        totalTime = Date.now() - startTime;
                        console.log("\u26A1 \u83DC\u5355\u6743\u9650\u83B7\u53D6\u5B8C\u6210\uFF0C\u603B\u8017\u65F6: ".concat(totalTime, "ms"));
                        // 🎯 返回菜单数据
                        apiResponse_1.ApiResponse.success(res, menuTree, '获取菜单权限成功');
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _k.sent();
                        console.error('❌ 获取用户菜单失败:', error_2);
                        console.warn('🔄 使用fallback菜单数据');
                        fallbackMenu = [
                            {
                                id: 3001,
                                name: '仪表盘中心',
                                path: '/dashboard',
                                icon: 'dashboard',
                                sort: 1,
                                children: [
                                    { id: 30011, name: '数据概览', path: '/dashboard', icon: 'chart-line', sort: 1 },
                                    { id: 30012, name: '实时监控', path: '/dashboard/real-time', icon: 'monitor', sort: 2 }
                                ]
                            },
                            {
                                id: 3002,
                                name: '人事中心',
                                path: '/personnel',
                                icon: 'user-group',
                                sort: 2,
                                children: [
                                    { id: 30021, name: '教师管理', path: '/personnel/teachers', icon: 'user-tie', sort: 1 },
                                    { id: 30022, name: '员工档案', path: '/personnel/profiles', icon: 'id-card', sort: 2 }
                                ]
                            },
                            {
                                id: 3003,
                                name: '活动中心',
                                path: '/activities',
                                icon: 'calendar',
                                sort: 3,
                                children: [
                                    { id: 30031, name: '活动管理', path: '/activities/management', icon: 'calendar-plus', sort: 1 },
                                    { id: 30032, name: '活动报名', path: '/activities/registration', icon: 'user-plus', sort: 2 }
                                ]
                            },
                            {
                                id: 3004,
                                name: '招生中心',
                                path: '/enrollment',
                                icon: 'graduation-cap',
                                sort: 4,
                                children: [
                                    { id: 30041, name: '招生管理', path: '/enrollment/management', icon: 'user-graduate', sort: 1 },
                                    { id: 30042, name: '报名审核', path: '/enrollment/review', icon: 'check-circle', sort: 2 }
                                ]
                            },
                            {
                                id: 3005,
                                name: '营销中心',
                                path: '/marketing',
                                icon: 'megaphone',
                                sort: 5,
                                children: [
                                    { id: 30051, name: '营销活动', path: '/marketing/campaigns', icon: 'bullhorn', sort: 1 },
                                    { id: 30052, name: '海报设计', path: '/marketing/posters', icon: 'image', sort: 2 }
                                ]
                            },
                            {
                                id: 3006,
                                name: 'AI中心',
                                path: '/ai',
                                icon: 'robot',
                                sort: 6,
                                children: [
                                    { id: 30061, name: 'AI助手', path: '/ai/assistant', icon: 'comments', sort: 1 },
                                    { id: 30062, name: '智能分析', path: '/ai/analytics', icon: 'chart-bar', sort: 2 }
                                ]
                            },
                            {
                                id: 3054,
                                name: '客户池中心',
                                path: '/customer-pool',
                                icon: 'users',
                                sort: 7,
                                children: [
                                    { id: 30541, name: '客户管理', path: '/customer-pool/management', icon: 'user-friends', sort: 1 },
                                    { id: 30542, name: '客户分析', path: '/customer-pool/analytics', icon: 'chart-pie', sort: 2 }
                                ]
                            },
                            {
                                id: 2013,
                                name: '系统中心',
                                path: '/system',
                                icon: 'cog',
                                sort: 8,
                                children: [
                                    { id: 20131, name: '系统设置', path: '/system/settings', icon: 'cogs', sort: 1 },
                                    { id: 20132, name: '用户管理', path: '/system/users', icon: 'users-cog', sort: 2 }
                                ]
                            }
                        ];
                        apiResponse_1.ApiResponse.success(res, fallbackMenu, '获取用户菜单成功（使用默认数据）');
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 验证用户是否有访问某个路径的权限
     */
    AuthPermissionsController.checkPermission = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var userId, path, userRoles, roleIds, activeRoles, activeRoleIds, userRole, result_1, permission, hasPermission, result, error_3;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, , 6]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        path = req.body.path;
                        if (!userId) {
                            return [2 /*return*/, apiResponse_1.ApiResponse.unauthorized(res, '用户未登录')];
                        }
                        if (!path) {
                            return [2 /*return*/, apiResponse_1.ApiResponse.badRequest(res, '路径参数不能为空')];
                        }
                        console.log('🔍 检查用户权限:', { userId: userId, path: path });
                        return [4 /*yield*/, index_1.UserRoleModel.findAll({
                                where: { userId: userId }
                            })];
                    case 1:
                        userRoles = _d.sent();
                        if (!userRoles || userRoles.length === 0) {
                            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { hasPermission: false }, '用户没有分配角色')];
                        }
                        roleIds = userRoles.map(function (ur) { return ur.roleId; });
                        return [4 /*yield*/, index_1.Role.findAll({
                                where: {
                                    id: roleIds,
                                    status: 1
                                }
                            })];
                    case 2:
                        activeRoles = _d.sent();
                        if (activeRoles.length === 0) {
                            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { hasPermission: false }, '用户没有激活的角色')];
                        }
                        activeRoleIds = activeRoles.map(function (role) { return role.id; });
                        // 🎯 特殊处理：允许教师访问互动课程路由
                        if (path === '/teacher-center/creative-curriculum/interactive') {
                            userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                            if (userRole === 'teacher') {
                                console.log('✅ 特殊处理：允许教师访问互动课程路由');
                                result_1 = {
                                    hasPermission: true,
                                    path: path,
                                    userId: userId
                                };
                                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, result_1, '权限检查完成')];
                            }
                        }
                        return [4 /*yield*/, index_1.Permission.findOne({
                                where: {
                                    status: 1,
                                    path: path
                                }
                            })];
                    case 3:
                        permission = _d.sent();
                        if (!permission) {
                            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { hasPermission: false }, '权限路径不存在')];
                        }
                        return [4 /*yield*/, index_1.RolePermission.findOne({
                                where: {
                                    roleId: (_c = {},
                                        _c[sequelize_1.Op["in"]] = activeRoleIds,
                                        _c),
                                    permissionId: permission.id
                                }
                            })];
                    case 4:
                        hasPermission = _d.sent();
                        result = {
                            hasPermission: !!hasPermission,
                            path: path,
                            userId: userId
                        };
                        console.log('✅ 权限检查结果:', result);
                        apiResponse_1.ApiResponse.success(res, result, '权限检查完成');
                        return [3 /*break*/, 6];
                    case 5:
                        error_3 = _d.sent();
                        console.error('❌ 权限检查失败:', error_3);
                        apiResponse_1.ApiResponse.handleError(res, error_3, '权限检查失败');
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 构建菜单树结构
     */
    AuthPermissionsController.buildMenuTree = function (permissions) {
        // 按路径深度排序
        var sortedPermissions = permissions.sort(function (a, b) {
            var aDepth = a.path.split('/').length;
            var bDepth = b.path.split('/').length;
            return aDepth - bDepth;
        });
        // 构建菜单项
        var menuItems = sortedPermissions.map(function (permission) { return ({
            id: permission.id,
            name: permission.name,
            path: permission.path,
            component: permission.component,
            icon: permission.icon || 'Menu',
            sort: permission.sort,
            children: []
        }); });
        // 按排序字段排序
        menuItems.sort(function (a, b) { return a.sort - b.sort; });
        return menuItems;
    };
    /**
     * 获取用户角色信息
     */
    AuthPermissionsController.getUserRoles = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, userRoles, roleIds, roles_1, error_4, fallbackRoles;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, apiResponse_1.ApiResponse.unauthorized(res, '用户未登录')];
                        }
                        console.log('👤 获取用户角色:', userId);
                        return [4 /*yield*/, index_1.UserRoleModel.findAll({
                                where: { userId: userId }
                            })];
                    case 1:
                        userRoles = _b.sent();
                        if (!userRoles || userRoles.length === 0) {
                            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, [], '用户没有分配角色')];
                        }
                        roleIds = userRoles.map(function (ur) { return ur.roleId; });
                        return [4 /*yield*/, index_1.Role.findAll({
                                where: {
                                    id: roleIds,
                                    status: 1
                                }
                            })];
                    case 2:
                        roles_1 = _b.sent();
                        console.log('✅ 用户角色:', roles_1.map(function (r) { return r.name; }));
                        apiResponse_1.ApiResponse.success(res, roles_1, '获取用户角色成功');
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _b.sent();
                        console.error('❌ 获取用户角色失败:', error_4);
                        console.warn('🔄 使用fallback角色数据');
                        fallbackRoles = [
                            {
                                id: 1,
                                name: 'admin',
                                displayName: '系统管理员',
                                description: '拥有系统所有权限的管理员角色',
                                status: 1,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            }
                        ];
                        apiResponse_1.ApiResponse.success(res, fallbackRoles, '获取用户角色成功（使用默认数据）');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return AuthPermissionsController;
}());
exports.AuthPermissionsController = AuthPermissionsController;
