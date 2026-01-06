"use strict";
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
exports.SetupPermissionsController = void 0;
var sequelize_1 = require("sequelize");
var database_1 = require("../config/database");
var apiResponse_1 = require("../utils/apiResponse");
/**
 * 权限设置控制器
 * 用于初始化和配置系统权限
 */
var SetupPermissionsController = /** @class */ (function () {
    function SetupPermissionsController() {
    }
    /**
     * 设置业务中心权限
     * @route POST /api/setup/business-center-permissions
     */
    SetupPermissionsController.prototype.setupBusinessCenterPermissions = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var centerPermissions, _i, centerPermissions_1, permission, pagePermissions, _a, pagePermissions_1, page, parentResult, roles, _b, roles_1, role, adminPermissions, principalPermissions, teacherPermissions, parentPermissions, verification, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 21, , 22]);
                        console.log('🔧 开始设置业务中心权限...');
                        centerPermissions = [
                            { id: 3001, name: 'Dashboard Center', chinese_name: '仪表板中心', code: 'DASHBOARD_CENTER', icon: 'Dashboard', sort: 1 },
                            { id: 3002, name: 'Personnel Center', chinese_name: '人员中心', code: 'PERSONNEL_CENTER', icon: 'Users', sort: 2 },
                            { id: 3003, name: 'Activity Center', chinese_name: '活动中心', code: 'ACTIVITY_CENTER', icon: 'Calendar', sort: 3 },
                            { id: 3004, name: 'Enrollment Center', chinese_name: '招生中心', code: 'ENROLLMENT_CENTER', icon: 'School', sort: 4 },
                            { id: 3005, name: 'Marketing Center', chinese_name: '营销中心', code: 'MARKETING_CENTER', icon: 'TrendingUp', sort: 5 },
                            { id: 3006, name: 'AI Center', chinese_name: 'AI中心', code: 'AI_CENTER', icon: 'Brain', sort: 6 },
                            { id: 2013, name: '系统管理', chinese_name: '系统中心', code: 'SYSTEM_CENTER', icon: 'Settings', sort: 7 },
                            { id: 3074, name: 'FinanceCenter', chinese_name: '财务中心', code: 'FINANCE_CENTER', icon: 'money', sort: 10 },
                            { id: 3035, name: '任务中心', chinese_name: '任务中心', code: 'TASK_CENTER_CATEGORY', icon: 'List', sort: 17 },
                            { id: 3054, name: 'CustomerPoolCenter', chinese_name: '客户池中心', code: 'CUSTOMER_POOL_CENTER', icon: 'icon-users', sort: 75 },
                            { id: 3073, name: 'AnalyticsCenter', chinese_name: '分析中心', code: 'ANALYTICS_CENTER', icon: 'DataAnalysis', sort: 80 }
                        ];
                        _i = 0, centerPermissions_1 = centerPermissions;
                        _c.label = 1;
                    case 1:
                        if (!(_i < centerPermissions_1.length)) return [3 /*break*/, 4];
                        permission = centerPermissions_1[_i];
                        return [4 /*yield*/, database_1.sequelize.query("\n          INSERT IGNORE INTO permissions (id, name, chinese_name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)\n          VALUES (?, ?, ?, ?, 'category', NULL, ?, NULL, ?, ?, ?, 1, NOW(), NOW())\n        ", {
                                replacements: [
                                    permission.id, permission.name, permission.chinese_name, permission.code,
                                    "#".concat(permission.code.toLowerCase().replace('_', '-')),
                                    permission.code, permission.icon, permission.sort
                                ],
                                type: sequelize_1.QueryTypes.INSERT
                            })];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        console.log('✅ 业务中心权限创建完成');
                        pagePermissions = [
                            { code: 'ENROLLMENT_CENTER_PAGE', parent_code: 'ENROLLMENT_CENTER', path: '/centers/enrollment', component: 'pages/centers/EnrollmentCenter.vue' },
                            { code: 'ACTIVITY_CENTER_PAGE', parent_code: 'ACTIVITY_CENTER', path: '/centers/activity', component: 'pages/centers/ActivityCenter.vue' },
                            { code: 'PERSONNEL_CENTER_PAGE', parent_code: 'PERSONNEL_CENTER', path: '/centers/personnel', component: 'pages/centers/PersonnelCenter.vue' },
                            { code: 'MARKETING_CENTER_PAGE', parent_code: 'MARKETING_CENTER', path: '/centers/marketing', component: 'pages/centers/MarketingCenter.vue' },
                            { code: 'AI_CENTER_PAGE', parent_code: 'AI_CENTER', path: '/centers/ai', component: 'pages/centers/AICenter.vue' },
                            { code: 'DASHBOARD_CENTER_PAGE', parent_code: 'DASHBOARD_CENTER', path: '/centers/dashboard', component: 'pages/centers/DashboardCenter.vue' }
                        ];
                        _a = 0, pagePermissions_1 = pagePermissions;
                        _c.label = 5;
                    case 5:
                        if (!(_a < pagePermissions_1.length)) return [3 /*break*/, 9];
                        page = pagePermissions_1[_a];
                        return [4 /*yield*/, database_1.sequelize.query("\n          SELECT id FROM permissions WHERE code = ?\n        ", {
                                replacements: [page.parent_code],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 6:
                        parentResult = (_c.sent())[0];
                        if (!parentResult) return [3 /*break*/, 8];
                        return [4 /*yield*/, database_1.sequelize.query("\n            INSERT IGNORE INTO permissions (name, chinese_name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)\n            VALUES (?, ?, ?, 'menu', ?, ?, ?, ?, '', 1, 1, NOW(), NOW())\n          ", {
                                replacements: [
                                    "".concat(page.parent_code, " Page"),
                                    "".concat(page.parent_code, "\u9875\u9762"),
                                    page.code,
                                    parentResult.id, page.path, page.component,
                                    "".concat(page.parent_code, "_VIEW")
                                ],
                                type: sequelize_1.QueryTypes.INSERT
                            })];
                    case 7:
                        _c.sent();
                        _c.label = 8;
                    case 8:
                        _a++;
                        return [3 /*break*/, 5];
                    case 9:
                        console.log('✅ 页面权限创建完成');
                        roles = [
                            { name: 'admin', description: '系统管理员' },
                            { name: '园长', description: '幼儿园园长，负责园区整体管理' },
                            { name: '教师', description: '幼儿园教师，负责教学和学生管理' },
                            { name: '家长', description: '学生家长，可查看孩子相关信息' }
                        ];
                        _b = 0, roles_1 = roles;
                        _c.label = 10;
                    case 10:
                        if (!(_b < roles_1.length)) return [3 /*break*/, 13];
                        role = roles_1[_b];
                        return [4 /*yield*/, database_1.sequelize.query("\n          INSERT IGNORE INTO roles (name, description, status, created_at, updated_at)\n          VALUES (?, ?, 1, NOW(), NOW())\n        ", {
                                replacements: [role.name, role.description],
                                type: sequelize_1.QueryTypes.INSERT
                            })];
                    case 11:
                        _c.sent();
                        _c.label = 12;
                    case 12:
                        _b++;
                        return [3 /*break*/, 10];
                    case 13:
                        console.log('✅ 角色创建完成');
                        adminPermissions = [
                            'DASHBOARD_CENTER', 'PERSONNEL_CENTER', 'ACTIVITY_CENTER', 'ENROLLMENT_CENTER',
                            'MARKETING_CENTER', 'AI_CENTER', 'SYSTEM_CENTER', 'FINANCE_CENTER',
                            'TASK_CENTER_CATEGORY', 'CUSTOMER_POOL_CENTER', 'ANALYTICS_CENTER',
                            'DASHBOARD_CENTER_PAGE', 'PERSONNEL_CENTER_PAGE', 'ACTIVITY_CENTER_PAGE',
                            'ENROLLMENT_CENTER_PAGE', 'MARKETING_CENTER_PAGE', 'AI_CENTER_PAGE'
                        ];
                        return [4 /*yield*/, this.assignPermissionsToRole('admin', adminPermissions)];
                    case 14:
                        _c.sent();
                        principalPermissions = [
                            'DASHBOARD_CENTER', 'PERSONNEL_CENTER', 'ACTIVITY_CENTER', 'ENROLLMENT_CENTER',
                            'MARKETING_CENTER', 'AI_CENTER', 'FINANCE_CENTER',
                            'TASK_CENTER_CATEGORY', 'CUSTOMER_POOL_CENTER', 'ANALYTICS_CENTER',
                            'DASHBOARD_CENTER_PAGE', 'PERSONNEL_CENTER_PAGE', 'ACTIVITY_CENTER_PAGE',
                            'ENROLLMENT_CENTER_PAGE', 'MARKETING_CENTER_PAGE', 'AI_CENTER_PAGE'
                        ];
                        return [4 /*yield*/, this.assignPermissionsToRole('园长', principalPermissions)];
                    case 15:
                        _c.sent();
                        teacherPermissions = [
                            'DASHBOARD_CENTER', 'PERSONNEL_CENTER', 'ACTIVITY_CENTER', 'ENROLLMENT_CENTER',
                            'TASK_CENTER_CATEGORY', 'ANALYTICS_CENTER',
                            'DASHBOARD_CENTER_PAGE', 'PERSONNEL_CENTER_PAGE', 'ACTIVITY_CENTER_PAGE',
                            'ENROLLMENT_CENTER_PAGE'
                        ];
                        return [4 /*yield*/, this.assignPermissionsToRole('教师', teacherPermissions)];
                    case 16:
                        _c.sent();
                        parentPermissions = [
                            'ACTIVITY_CENTER', 'ENROLLMENT_CENTER',
                            'ACTIVITY_CENTER_PAGE', 'ENROLLMENT_CENTER_PAGE'
                        ];
                        return [4 /*yield*/, this.assignPermissionsToRole('家长', parentPermissions)];
                    case 17:
                        _c.sent();
                        console.log('✅ 角色权限分配完成');
                        // 5. 为测试用户分配角色
                        return [4 /*yield*/, this.assignUserRole(130, '教师')];
                    case 18:
                        // 5. 为测试用户分配角色
                        _c.sent(); // teacher用户
                        return [4 /*yield*/, this.assignUserRole(131, '家长')];
                    case 19:
                        _c.sent(); // parent用户
                        console.log('✅ 测试用户角色分配完成');
                        return [4 /*yield*/, this.verifyPermissionSetup()];
                    case 20:
                        verification = _c.sent();
                        apiResponse_1.ApiResponse.success(res, {
                            message: '业务中心权限设置完成',
                            verification: verification
                        }, '权限配置成功');
                        return [3 /*break*/, 22];
                    case 21:
                        error_1 = _c.sent();
                        console.error('❌ 权限设置失败:', error_1);
                        apiResponse_1.ApiResponse.handleError(res, error_1, '权限设置失败');
                        return [3 /*break*/, 22];
                    case 22: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 为角色分配权限
     */
    SetupPermissionsController.prototype.assignPermissionsToRole = function (roleName, permissionCodes) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, permissionCodes_1, code;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, permissionCodes_1 = permissionCodes;
                        _a.label = 1;
                    case 1:
                        if (!(_i < permissionCodes_1.length)) return [3 /*break*/, 4];
                        code = permissionCodes_1[_i];
                        return [4 /*yield*/, database_1.sequelize.query("\n        INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)\n        SELECT r.id, p.id, NOW(), NOW()\n        FROM roles r, permissions p\n        WHERE r.name = ? AND p.code = ?\n      ", {
                                replacements: [roleName, code],
                                type: sequelize_1.QueryTypes.INSERT
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        console.log("\u2705 ".concat(roleName, "\u89D2\u8272\u6743\u9650\u5206\u914D\u5B8C\u6210 (").concat(permissionCodes.length, "\u4E2A\u6743\u9650)"));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 为用户分配角色
     */
    SetupPermissionsController.prototype.assignUserRole = function (userId, roleName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.sequelize.query("\n      INSERT IGNORE INTO user_roles (user_id, role_id, created_at, updated_at)\n      SELECT ?, r.id, NOW(), NOW()\n      FROM roles r\n      WHERE r.name = ?\n    ", {
                            replacements: [userId, roleName],
                            type: sequelize_1.QueryTypes.INSERT
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 修复业务中心权限路径
     * @route POST /api/setup/fix-business-center-paths
     */
    SetupPermissionsController.prototype.fixBusinessCenterPaths = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var pathMappings, _i, pathMappings_1, mapping, pagePermissions, _a, pagePermissions_2, page, parentResult, rolePagePermissions, _b, _c, _d, roleName, permissionCodes, _e, permissionCodes_2, permissionCode, verification, error_2;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 18, , 19]);
                        console.log('🔧 开始修复业务中心权限路径...');
                        pathMappings = [
                            { code: 'DASHBOARD_CENTER', newPath: '/centers/dashboard' },
                            { code: 'PERSONNEL_CENTER', newPath: '/centers/personnel' },
                            { code: 'ACTIVITY_CENTER', newPath: '/centers/activity' },
                            { code: 'ENROLLMENT_CENTER', newPath: '/centers/enrollment' },
                            { code: 'MARKETING_CENTER', newPath: '/centers/marketing' },
                            { code: 'AI_CENTER', newPath: '/centers/ai' },
                            { code: 'SYSTEM_CENTER', newPath: '/centers/system' },
                            { code: 'FINANCE_CENTER', newPath: '/centers/finance' },
                            { code: 'TASK_CENTER_CATEGORY', newPath: '/centers/task' },
                            { code: 'CUSTOMER_POOL_CENTER', newPath: '/centers/customer-pool' },
                            { code: 'ANALYTICS_CENTER', newPath: '/centers/analytics' }
                        ];
                        _i = 0, pathMappings_1 = pathMappings;
                        _f.label = 1;
                    case 1:
                        if (!(_i < pathMappings_1.length)) return [3 /*break*/, 4];
                        mapping = pathMappings_1[_i];
                        return [4 /*yield*/, database_1.sequelize.query("\n          UPDATE permissions SET path = ?, updated_at = NOW() WHERE code = ?\n        ", {
                                replacements: [mapping.newPath, mapping.code],
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 2:
                        _f.sent();
                        console.log("\u2705 \u66F4\u65B0 ".concat(mapping.code, ": ").concat(mapping.newPath));
                        _f.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        pagePermissions = [
                            { code: 'DASHBOARD_CENTER_PAGE', parent_code: 'DASHBOARD_CENTER', path: '/centers/dashboard', component: 'pages/centers/DashboardCenter.vue' },
                            { code: 'PERSONNEL_CENTER_PAGE', parent_code: 'PERSONNEL_CENTER', path: '/centers/personnel', component: 'pages/centers/PersonnelCenter.vue' },
                            { code: 'ACTIVITY_CENTER_PAGE', parent_code: 'ACTIVITY_CENTER', path: '/centers/activity', component: 'pages/centers/ActivityCenter.vue' },
                            { code: 'ENROLLMENT_CENTER_PAGE', parent_code: 'ENROLLMENT_CENTER', path: '/centers/enrollment', component: 'pages/centers/EnrollmentCenter.vue' },
                            { code: 'MARKETING_CENTER_PAGE', parent_code: 'MARKETING_CENTER', path: '/centers/marketing', component: 'pages/centers/MarketingCenter.vue' },
                            { code: 'AI_CENTER_PAGE', parent_code: 'AI_CENTER', path: '/centers/ai', component: 'pages/centers/AICenter.vue' }
                        ];
                        _a = 0, pagePermissions_2 = pagePermissions;
                        _f.label = 5;
                    case 5:
                        if (!(_a < pagePermissions_2.length)) return [3 /*break*/, 9];
                        page = pagePermissions_2[_a];
                        return [4 /*yield*/, database_1.sequelize.query("\n          SELECT id FROM permissions WHERE code = ?\n        ", {
                                replacements: [page.parent_code],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 6:
                        parentResult = (_f.sent())[0];
                        if (!parentResult) return [3 /*break*/, 8];
                        return [4 /*yield*/, database_1.sequelize.query("\n            INSERT IGNORE INTO permissions (name, chinese_name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)\n            VALUES (?, ?, ?, 'menu', ?, ?, ?, ?, '', 1, 1, NOW(), NOW())\n          ", {
                                replacements: [
                                    "".concat(page.parent_code, " Page"),
                                    "".concat(page.parent_code, "\u9875\u9762"),
                                    page.code,
                                    parentResult.id, page.path, page.component,
                                    "".concat(page.parent_code, "_VIEW")
                                ],
                                type: sequelize_1.QueryTypes.INSERT
                            })];
                    case 7:
                        _f.sent();
                        console.log("\u2705 \u6DFB\u52A0\u9875\u9762\u6743\u9650: ".concat(page.code));
                        _f.label = 8;
                    case 8:
                        _a++;
                        return [3 /*break*/, 5];
                    case 9:
                        rolePagePermissions = {
                            'admin': ['DASHBOARD_CENTER_PAGE', 'PERSONNEL_CENTER_PAGE', 'ACTIVITY_CENTER_PAGE', 'ENROLLMENT_CENTER_PAGE', 'MARKETING_CENTER_PAGE', 'AI_CENTER_PAGE'],
                            '园长': ['DASHBOARD_CENTER_PAGE', 'PERSONNEL_CENTER_PAGE', 'ACTIVITY_CENTER_PAGE', 'ENROLLMENT_CENTER_PAGE', 'MARKETING_CENTER_PAGE', 'AI_CENTER_PAGE'],
                            '教师': ['DASHBOARD_CENTER_PAGE', 'PERSONNEL_CENTER_PAGE', 'ACTIVITY_CENTER_PAGE', 'ENROLLMENT_CENTER_PAGE'],
                            '家长': ['ACTIVITY_CENTER_PAGE', 'ENROLLMENT_CENTER_PAGE']
                        };
                        _b = 0, _c = Object.entries(rolePagePermissions);
                        _f.label = 10;
                    case 10:
                        if (!(_b < _c.length)) return [3 /*break*/, 16];
                        _d = _c[_b], roleName = _d[0], permissionCodes = _d[1];
                        _e = 0, permissionCodes_2 = permissionCodes;
                        _f.label = 11;
                    case 11:
                        if (!(_e < permissionCodes_2.length)) return [3 /*break*/, 14];
                        permissionCode = permissionCodes_2[_e];
                        return [4 /*yield*/, database_1.sequelize.query("\n            INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)\n            SELECT r.id, p.id, NOW(), NOW()\n            FROM roles r, permissions p\n            WHERE r.name = ? AND p.code = ?\n          ", {
                                replacements: [roleName, permissionCode],
                                type: sequelize_1.QueryTypes.INSERT
                            })];
                    case 12:
                        _f.sent();
                        _f.label = 13;
                    case 13:
                        _e++;
                        return [3 /*break*/, 11];
                    case 14:
                        console.log("\u2705 ".concat(roleName, "\u89D2\u8272\u9875\u9762\u6743\u9650\u5206\u914D\u5B8C\u6210"));
                        _f.label = 15;
                    case 15:
                        _b++;
                        return [3 /*break*/, 10];
                    case 16:
                        console.log('✅ 业务中心权限路径修复完成');
                        return [4 /*yield*/, this.verifyPermissionSetup()];
                    case 17:
                        verification = _f.sent();
                        apiResponse_1.ApiResponse.success(res, {
                            message: '业务中心权限路径修复完成',
                            pathMappings: pathMappings.length,
                            pagePermissions: pagePermissions.length,
                            verification: verification
                        }, '权限路径修复成功');
                        return [3 /*break*/, 19];
                    case 18:
                        error_2 = _f.sent();
                        console.error('❌ 权限路径修复失败:', error_2);
                        apiResponse_1.ApiResponse.handleError(res, error_2, '权限路径修复失败');
                        return [3 /*break*/, 19];
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 验证权限配置
     */
    SetupPermissionsController.prototype.verifyPermissionSetup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rolePermissions, userRoles, permissionPaths;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database_1.sequelize.query("\n      SELECT\n        r.name as role_name,\n        COUNT(rp.permission_id) as permission_count\n      FROM roles r\n      LEFT JOIN role_permissions rp ON r.id = rp.role_id\n      LEFT JOIN permissions p ON rp.permission_id = p.id\n      WHERE r.name IN ('admin', '\u56ED\u957F', '\u6559\u5E08', '\u5BB6\u957F')\n        AND p.code LIKE '%CENTER%'\n      GROUP BY r.id, r.name\n      ORDER BY r.name\n    ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        rolePermissions = _a.sent();
                        return [4 /*yield*/, database_1.sequelize.query("\n      SELECT\n        u.id as user_id,\n        u.username,\n        r.name as role_name\n      FROM users u\n      LEFT JOIN user_roles ur ON u.id = ur.user_id\n      LEFT JOIN roles r ON ur.role_id = r.id\n      WHERE u.id IN (121, 130, 131)\n      ORDER BY u.id\n    ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 2:
                        userRoles = _a.sent();
                        return [4 /*yield*/, database_1.sequelize.query("\n      SELECT code, path, type FROM permissions\n      WHERE code LIKE '%CENTER%'\n      ORDER BY code\n    ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 3:
                        permissionPaths = _a.sent();
                        return [2 /*return*/, {
                                rolePermissions: rolePermissions,
                                userRoles: userRoles,
                                permissionPaths: permissionPaths
                            }];
                }
            });
        });
    };
    /**
     * 为其他角色分配业务中心权限
     * @route POST /api/setup/assign-role-permissions
     */
    SetupPermissionsController.assignRolePermissions = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var rolePermissionMapping, totalAssigned, _i, _a, _b, roleCode, permissionIds, roleResult, roleId, _c, permissionIds_1, permissionId, existingResult, error_3;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 9, , 10]);
                        console.log('🔑 开始为其他角色分配业务中心权限...');
                        rolePermissionMapping = {
                            // 园长权限：10个业务中心（排除系统中心）
                            principal: [3001, 3002, 3003, 3004, 3005, 3006, 3054, 3035, 3074, 3073],
                            // 教师权限：6个教学相关中心
                            teacher: [3001, 3002, 3003, 3004, 3035, 3073],
                            // 家长权限：2个相关中心
                            parent: [3003, 3004]
                        };
                        totalAssigned = 0;
                        _i = 0, _a = Object.entries(rolePermissionMapping);
                        _d.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        _b = _a[_i], roleCode = _b[0], permissionIds = _b[1];
                        console.log("\uD83D\uDD04 \u5904\u7406\u89D2\u8272: ".concat(roleCode));
                        return [4 /*yield*/, database_1.sequelize.query('SELECT id FROM roles WHERE code = :roleCode AND status = 1', {
                                replacements: { roleCode: roleCode },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        roleResult = (_d.sent())[0];
                        if (!roleResult || roleResult.length === 0) {
                            console.warn("\u26A0\uFE0F \u89D2\u8272 ".concat(roleCode, " \u4E0D\u5B58\u5728\uFF0C\u8DF3\u8FC7"));
                            return [3 /*break*/, 7];
                        }
                        roleId = roleResult[0].id;
                        console.log("\u2705 \u627E\u5230\u89D2\u8272 ".concat(roleCode, " (ID: ").concat(roleId, ")"));
                        _c = 0, permissionIds_1 = permissionIds;
                        _d.label = 3;
                    case 3:
                        if (!(_c < permissionIds_1.length)) return [3 /*break*/, 7];
                        permissionId = permissionIds_1[_c];
                        return [4 /*yield*/, database_1.sequelize.query('SELECT id FROM role_permissions WHERE role_id = :roleId AND permission_id = :permissionId', {
                                replacements: { roleId: roleId, permissionId: permissionId },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 4:
                        existingResult = (_d.sent())[0];
                        if (existingResult && existingResult.length > 0) {
                            console.log("\u23ED\uFE0F \u89D2\u8272 ".concat(roleCode, " \u5DF2\u6709\u6743\u9650 ").concat(permissionId, "\uFF0C\u8DF3\u8FC7"));
                            return [3 /*break*/, 6];
                        }
                        // 创建角色权限关联
                        return [4 /*yield*/, database_1.sequelize.query('INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at) VALUES (:roleId, :permissionId, NOW(), NOW())', {
                                replacements: { roleId: roleId, permissionId: permissionId },
                                type: sequelize_1.QueryTypes.INSERT
                            })];
                    case 5:
                        // 创建角色权限关联
                        _d.sent();
                        console.log("\u2705 \u4E3A\u89D2\u8272 ".concat(roleCode, " \u5206\u914D\u6743\u9650 ").concat(permissionId));
                        totalAssigned++;
                        _d.label = 6;
                    case 6:
                        _c++;
                        return [3 /*break*/, 3];
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8:
                        res.json({
                            success: true,
                            message: '角色权限分配完成',
                            data: {
                                totalAssigned: totalAssigned,
                                rolePermissionMapping: rolePermissionMapping
                            }
                        });
                        return [3 /*break*/, 10];
                    case 9:
                        error_3 = _d.sent();
                        console.error('❌ 角色权限分配失败:', error_3);
                        res.status(500).json({
                            success: false,
                            message: '角色权限分配失败',
                            error: error_3.message
                        });
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    return SetupPermissionsController;
}());
exports.SetupPermissionsController = SetupPermissionsController;
