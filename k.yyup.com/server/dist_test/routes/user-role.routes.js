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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var user_role_controller_1 = __importDefault(require("../controllers/user-role.controller"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var validate_middleware_1 = require("../middlewares/validate.middleware");
var user_role_validation_1 = require("../validations/user-role.validation");
var init_1 = require("../init");
var apiResponse_1 = require("../utils/apiResponse");
var apiError_1 = require("../utils/apiError");
var cache_invalidation_middleware_1 = require("../middlewares/cache-invalidation.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: 用户角色关联
 *   description: 用户角色关联管理API - 管理用户与角色之间的关联关系、权限分配和角色生效期管理
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     UserRole:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 用户角色关联ID
 *           example: 1
 *         userId:
 *           type: integer
 *           description: 用户ID
 *           example: 123
 *         roleId:
 *           type: integer
 *           description: 角色ID
 *           example: 456
 *         isPrimary:
 *           type: boolean
 *           description: 是否为主要角色
 *           example: true
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: 角色生效开始时间
 *           example: "2023-01-01T00:00:00.000Z"
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: 角色生效结束时间
 *           example: "2024-12-31T23:59:59.000Z"
 *         grantorId:
 *           type: integer
 *           description: 授权人ID
 *           example: 789
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2023-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2023-01-01T00:00:00.000Z"
 *         username:
 *           type: string
 *           description: 用户名
 *           example: "john_doe"
 *         realName:
 *           type: string
 *           description: 真实姓名
 *           example: "张三"
 *         roleName:
 *           type: string
 *           description: 角色名称
 *           example: "管理员"
 *         roleCode:
 *           type: string
 *           description: 角色代码
 *           example: "ADMIN"
 *         roleDescription:
 *           type: string
 *           description: 角色描述
 *           example: "系统管理员角色"
 *
 *     CreateUserRoleRequest:
 *       type: object
 *       required:
 *         - userId
 *         - roleId
 *       properties:
 *         userId:
 *           type: integer
 *           description: 用户ID
 *           example: 123
 *         roleId:
 *           type: integer
 *           description: 角色ID
 *           example: 456
 *         assignedBy:
 *           type: integer
 *           description: 分配人ID（可选）
 *           example: 789
 *         notes:
 *           type: string
 *           description: 备注信息（可选）
 *           example: "临时分配管理员权限"
 *
 *     UpdateUserRoleRequest:
 *       type: object
 *       properties:
 *         isPrimary:
 *           type: boolean
 *           description: 是否为主要角色
 *           example: true
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: 角色生效开始时间
 *           example: "2023-01-01T00:00:00.000Z"
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: 角色生效结束时间
 *           example: "2024-12-31T23:59:59.000Z"
 *         notes:
 *           type: string
 *           description: 备注信息
 *           example: "更新角色有效期"
 *
 *     RoleAssignmentRequest:
 *       type: object
 *       required:
 *         - roleIds
 *       properties:
 *         roleIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: 角色ID数组
 *           example: [1, 2, 3]
 *
 *     SetPrimaryRoleRequest:
 *       type: object
 *       required:
 *         - roleId
 *       properties:
 *         roleId:
 *           type: integer
 *           description: 设置为主要角色的角色ID
 *           example: 1
 *
 *     UpdateRoleValidityRequest:
 *       type: object
 *       properties:
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: 角色生效开始时间
 *           example: "2023-01-01T00:00:00.000Z"
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: 角色生效结束时间
 *           example: "2024-12-31T23:59:59.000Z"
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
// ===== 标准REST API路径 (用于测试脚本) =====
/**
 * @swagger
 * /api/user-role:
 *   get:
 *     summary: 获取用户角色关联列表
 *     description: 获取所有用户角色关联记录的详细信息，包括用户信息、角色信息及关联状态
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户角色关联列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取用户角色关联列表成功"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserRole'
 *       401:
 *         description: 未授权 - 缺少或无效的访问令牌
 *       403:
 *         description: 权限不足 - 需要USER_ROLE_MANAGE权限
 *       500:
 *         description: 服务器内部错误
 */
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('USER_ROLE_MANAGE'), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userRoles, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        ur.id,\n        ur.user_id as userId,\n        ur.role_id as roleId,\n        ur.is_primary as isPrimary,\n        ur.start_time as startTime,\n        ur.end_time as endTime,\n        ur.grantor_id as grantorId,\n        ur.created_at as createdAt,\n        ur.updated_at as updatedAt,\n        u.username,\n        u.real_name as realName,\n        r.name as roleName,\n        r.code as roleCode,\n        r.description as roleDescription\n      FROM user_roles ur\n      LEFT JOIN users u ON ur.user_id = u.id\n      LEFT JOIN roles r ON ur.role_id = r.id\n      WHERE ur.deleted_at IS NULL\n      ORDER BY ur.created_at DESC\n    ")];
            case 1:
                userRoles = (_a.sent())[0];
                apiResponse_1.ApiResponse.success(res, userRoles, '获取用户角色关联列表成功');
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('获取用户角色关联列表错误:', error_1);
                apiResponse_1.ApiResponse.handleError(res, error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/user-role:
 *   post:
 *     summary: 创建用户角色关联
 *     description: 为指定用户分配角色，建立用户与角色之间的关联关系
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRoleRequest'
 *     responses:
 *       201:
 *         description: 成功创建用户角色关联
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "创建用户角色关联成功"
 *                 data:
 *                   $ref: '#/components/schemas/UserRole'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   examples:
 *                     missing_params:
 *                       value: "用户ID和角色ID不能为空"
 *                     existing_relation:
 *                       value: "该用户角色关联已存在"
 *       401:
 *         description: 未授权 - 缺少或无效的访问令牌
 *       403:
 *         description: 权限不足 - 需要USER_ROLE_MANAGE权限
 *       404:
 *         description: 资源不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   examples:
 *                     user_not_found:
 *                       value: "用户不存在或已被禁用"
 *                     role_not_found:
 *                       value: "角色不存在"
 *       500:
 *         description: 服务器内部错误
 */
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('USER_ROLE_MANAGE'), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userId, roleId, assignedBy, notes, users, roles, existing, grantorId, newUserRole, error_2;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 6, , 7]);
                _a = req.body, userId = _a.userId, roleId = _a.roleId, assignedBy = _a.assignedBy, notes = _a.notes;
                if (!userId || !roleId) {
                    throw apiError_1.ApiError.badRequest('用户ID和角色ID不能为空');
                }
                return [4 /*yield*/, init_1.sequelize.query('SELECT id FROM users WHERE id = ? AND status = "active"', {
                        replacements: [userId]
                    })];
            case 1:
                users = (_c.sent())[0];
                if (!users || users.length === 0) {
                    throw apiError_1.ApiError.notFound('用户不存在或已被禁用');
                }
                return [4 /*yield*/, init_1.sequelize.query('SELECT id FROM roles WHERE id = ? AND status = 1', {
                        replacements: [roleId]
                    })];
            case 2:
                roles = (_c.sent())[0];
                if (!roles || roles.length === 0) {
                    throw apiError_1.ApiError.notFound('角色不存在');
                }
                return [4 /*yield*/, init_1.sequelize.query('SELECT id FROM user_roles WHERE user_id = ? AND role_id = ? AND deleted_at IS NULL', { replacements: [userId, roleId] })];
            case 3:
                existing = (_c.sent())[0];
                if (existing && existing.length > 0) {
                    throw apiError_1.ApiError.badRequest('该用户角色关联已存在');
                }
                grantorId = assignedBy || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || 1;
                // 创建用户角色关联
                return [4 /*yield*/, init_1.sequelize.query("\n      INSERT INTO user_roles (user_id, role_id, grantor_id, is_primary, start_time, created_at, updated_at)\n      VALUES (?, ?, ?, 0, NOW(), NOW(), NOW())\n    ", {
                        replacements: [userId, roleId, grantorId]
                    })];
            case 4:
                // 创建用户角色关联
                _c.sent();
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        ur.id,\n        ur.user_id as userId,\n        ur.role_id as roleId,\n        ur.is_primary as isPrimary,\n        ur.start_time as startTime,\n        ur.end_time as endTime,\n        ur.grantor_id as grantorId,\n        ur.created_at as createdAt,\n        ur.updated_at as updatedAt\n      FROM user_roles ur\n      WHERE ur.user_id = ? AND ur.role_id = ? AND ur.deleted_at IS NULL\n      ORDER BY ur.created_at DESC\n      LIMIT 1\n    ", {
                        replacements: [userId, roleId]
                    })];
            case 5:
                newUserRole = (_c.sent())[0];
                apiResponse_1.ApiResponse.success(res, newUserRole[0], '创建用户角色关联成功', 201);
                return [3 /*break*/, 7];
            case 6:
                error_2 = _c.sent();
                console.error('创建用户角色关联错误:', error_2);
                apiResponse_1.ApiResponse.handleError(res, error_2);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/user-role/{id}:
 *   get:
 *     summary: 获取用户角色关联详情
 *     description: 根据用户角色关联ID获取特定用户角色关联的详细信息
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户角色关联ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功获取用户角色关联详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取用户角色关联详情成功"
 *                 data:
 *                   $ref: '#/components/schemas/UserRole'
 *       401:
 *         description: 未授权 - 缺少或无效的访问令牌
 *       403:
 *         description: 权限不足 - 需要USER_ROLE_MANAGE权限
 *       404:
 *         description: 用户角色关联不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "用户角色关联不存在"
 *       500:
 *         description: 服务器内部错误
 */
router.get('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('USER_ROLE_MANAGE'), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userRoles, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        ur.id,\n        ur.user_id as userId,\n        ur.role_id as roleId,\n        ur.is_primary as isPrimary,\n        ur.start_time as startTime,\n        ur.end_time as endTime,\n        ur.grantor_id as grantorId,\n        ur.created_at as createdAt,\n        ur.updated_at as updatedAt,\n        u.username,\n        u.real_name as realName,\n        r.name as roleName,\n        r.code as roleCode,\n        r.description as roleDescription\n      FROM user_roles ur\n      LEFT JOIN users u ON ur.user_id = u.id\n      LEFT JOIN roles r ON ur.role_id = r.id\n      WHERE ur.id = ? AND ur.deleted_at IS NULL\n    ", {
                        replacements: [id]
                    })];
            case 1:
                userRoles = (_a.sent())[0];
                if (!userRoles || userRoles.length === 0) {
                    throw apiError_1.ApiError.notFound('用户角色关联不存在');
                }
                apiResponse_1.ApiResponse.success(res, userRoles[0], '获取用户角色关联详情成功');
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('获取用户角色关联详情错误:', error_3);
                apiResponse_1.ApiResponse.handleError(res, error_3);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/user-role/{id}:
 *   put:
 *     summary: 更新用户角色关联
 *     description: 更新指定用户角色关联的配置，如主要角色状态、生效时间等
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户角色关联ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRoleRequest'
 *     responses:
 *       200:
 *         description: 成功更新用户角色关联
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "更新用户角色关联成功"
 *                 data:
 *                   $ref: '#/components/schemas/UserRole'
 *       401:
 *         description: 未授权 - 缺少或无效的访问令牌
 *       403:
 *         description: 权限不足 - 需要USER_ROLE_MANAGE权限
 *       404:
 *         description: 用户角色关联不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "用户角色关联不存在"
 *       500:
 *         description: 服务器内部错误
 */
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('USER_ROLE_MANAGE'), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, isPrimary, startTime, endTime, notes, existing, updateFields, replacements, updatedUserRole, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                id = req.params.id;
                _a = req.body, isPrimary = _a.isPrimary, startTime = _a.startTime, endTime = _a.endTime, notes = _a.notes;
                return [4 /*yield*/, init_1.sequelize.query('SELECT id FROM user_roles WHERE id = ? AND deleted_at IS NULL', { replacements: [id] })];
            case 1:
                existing = (_b.sent())[0];
                if (!existing || existing.length === 0) {
                    throw apiError_1.ApiError.notFound('用户角色关联不存在');
                }
                updateFields = [];
                replacements = [];
                if (isPrimary !== undefined) {
                    updateFields.push('is_primary = ?');
                    replacements.push(isPrimary);
                }
                if (startTime) {
                    updateFields.push('start_time = ?');
                    replacements.push(new Date(startTime));
                }
                if (endTime) {
                    updateFields.push('end_time = ?');
                    replacements.push(new Date(endTime));
                }
                updateFields.push('updated_at = NOW()');
                replacements.push(id);
                return [4 /*yield*/, init_1.sequelize.query("\n      UPDATE user_roles \n      SET ".concat(updateFields.join(', '), "\n      WHERE id = ?\n    "), {
                        replacements: replacements
                    })];
            case 2:
                _b.sent();
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        ur.id,\n        ur.user_id as userId,\n        ur.role_id as roleId,\n        ur.is_primary as isPrimary,\n        ur.start_time as startTime,\n        ur.end_time as endTime,\n        ur.grantor_id as grantorId,\n        ur.created_at as createdAt,\n        ur.updated_at as updatedAt\n      FROM user_roles ur\n      WHERE ur.id = ?\n    ", {
                        replacements: [id]
                    })];
            case 3:
                updatedUserRole = (_b.sent())[0];
                apiResponse_1.ApiResponse.success(res, updatedUserRole[0], '更新用户角色关联成功');
                return [3 /*break*/, 5];
            case 4:
                error_4 = _b.sent();
                console.error('更新用户角色关联错误:', error_4);
                apiResponse_1.ApiResponse.handleError(res, error_4);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/user-role/by-user/{userId}:
 *   get:
 *     summary: 按用户获取角色关联
 *     description: 获取指定用户的所有角色关联记录，按主要角色优先排序
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *         example: 123
 *     responses:
 *       200:
 *         description: 成功获取用户角色关联
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取用户角色关联成功"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserRole'
 *       401:
 *         description: 未授权 - 缺少或无效的访问令牌
 *       403:
 *         description: 权限不足 - 需要USER_ROLE_MANAGE权限
 *       500:
 *         description: 服务器内部错误
 */
router.get('/by-user/:userId', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('USER_ROLE_MANAGE'), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, userRoles, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.params.userId;
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        ur.id,\n        ur.user_id as userId,\n        ur.role_id as roleId,\n        ur.is_primary as isPrimary,\n        ur.start_time as startTime,\n        ur.end_time as endTime,\n        ur.grantor_id as grantorId,\n        ur.created_at as createdAt,\n        ur.updated_at as updatedAt,\n        r.name as roleName,\n        r.code as roleCode,\n        r.description as roleDescription\n      FROM user_roles ur\n      LEFT JOIN roles r ON ur.role_id = r.id\n      WHERE ur.user_id = ? AND ur.deleted_at IS NULL\n      ORDER BY ur.is_primary DESC, ur.created_at DESC\n    ", {
                        replacements: [userId]
                    })];
            case 1:
                userRoles = (_a.sent())[0];
                apiResponse_1.ApiResponse.success(res, userRoles, '获取用户角色关联成功');
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('按用户获取角色关联错误:', error_5);
                apiResponse_1.ApiResponse.handleError(res, error_5);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/user-role/{id}:
 *   delete:
 *     summary: 删除用户角色关联
 *     description: 软删除指定的用户角色关联记录，操作具有幂等性
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户角色关联ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功删除用户角色关联
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "删除用户角色关联成功"
 *                 data:
 *                   type: null
 *                   example: null
 *       401:
 *         description: 未授权 - 缺少或无效的访问令牌
 *       403:
 *         description: 权限不足 - 需要USER_ROLE_MANAGE权限
 *       500:
 *         description: 服务器内部错误
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('USER_ROLE_MANAGE'), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, init_1.sequelize.query("\n      UPDATE user_roles \n      SET deleted_at = NOW(), updated_at = NOW()\n      WHERE id = ? AND deleted_at IS NULL\n    ", {
                        replacements: [id]
                    })];
            case 1:
                result = (_a.sent())[0];
                // 删除不存在的记录也返回成功（幂等性）
                apiResponse_1.ApiResponse.success(res, null, '删除用户角色关联成功');
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('删除用户角色关联错误:', error_6);
                apiResponse_1.ApiResponse.handleError(res, error_6);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ===== 嵌套路径 (保留现有功能) =====
/**
 * @swagger
 * /api/user-role/users/{userId}/roles:
 *   post:
 *     summary: 为用户分配角色
 *     description: 批量为指定用户分配多个角色
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *         example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleAssignmentRequest'
 *     responses:
 *       200:
 *         description: 成功为用户分配角色
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "角色分配成功"
 *                 data:
 *                   type: object
 *                   description: 分配结果详情
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */
router.post('/users/:userId/roles', auth_middleware_1.verifyToken, (0, validate_middleware_1.validateRequest)(user_role_validation_1.roleIdsSchema), user_role_controller_1["default"].assignRolesToUser, cache_invalidation_middleware_1.invalidateUserRoleCache // 分配角色后清除用户缓存
);
/**
 * @swagger
 * /api/user-role/users/{userId}/roles:
 *   delete:
 *     summary: 移除用户的角色
 *     description: 批量移除指定用户的多个角色
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *         example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleAssignmentRequest'
 *     responses:
 *       200:
 *         description: 成功移除用户角色
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "角色移除成功"
 *                 data:
 *                   type: object
 *                   description: 移除结果详情
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */
router["delete"]('/users/:userId/roles', auth_middleware_1.verifyToken, (0, validate_middleware_1.validateRequest)(user_role_validation_1.roleIdsSchema), user_role_controller_1["default"].removeRolesFromUser, cache_invalidation_middleware_1.invalidateUserRoleCache // 移除角色后清除用户缓存
);
/**
 * @swagger
 * /api/user-role/users/{userId}/roles:
 *   get:
 *     summary: 获取用户的所有角色
 *     description: 获取指定用户的所有角色信息，包括角色详情和权限列表
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *         example: 123
 *     responses:
 *       200:
 *         description: 成功获取用户角色列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取用户角色成功"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: 用户角色详情，包含角色信息和权限列表
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/users/:userId/roles', auth_middleware_1.verifyToken, user_role_controller_1["default"].getUserRoles);
/**
 * @swagger
 * /api/user-role/users/{userId}/primary-role:
 *   put:
 *     summary: 设置用户主要角色
 *     description: 设置指定用户的主要角色，同时取消其他角色的主要状态
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *         example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetPrimaryRoleRequest'
 *     responses:
 *       200:
 *         description: 成功设置用户主要角色
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "设置主要角色成功"
 *                 data:
 *                   type: object
 *                   description: 更新后的用户角色信息
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 用户或角色不存在
 *       500:
 *         description: 服务器内部错误
 */
router.put('/users/:userId/primary-role', auth_middleware_1.verifyToken, (0, validate_middleware_1.validateRequest)(user_role_validation_1.primaryRoleSchema), user_role_controller_1["default"].setPrimaryRole);
/**
 * @swagger
 * /api/user-role/users/{userId}/roles/{roleId}/validity:
 *   put:
 *     summary: 更新用户角色有效期
 *     description: 更新指定用户特定角色的生效时间和失效时间
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *         example: 123
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 角色ID
 *         example: 456
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRoleValidityRequest'
 *     responses:
 *       200:
 *         description: 成功更新角色有效期
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "更新角色有效期成功"
 *                 data:
 *                   type: object
 *                   description: 更新后的用户角色关联信息
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 用户角色关联不存在
 *       500:
 *         description: 服务器内部错误
 */
router.put('/users/:userId/roles/:roleId/validity', auth_middleware_1.verifyToken, (0, validate_middleware_1.validateRequest)(user_role_validation_1.roleValiditySchema), user_role_controller_1["default"].updateRoleValidity);
/**
 * @swagger
 * /api/user-role/users/{userId}/role-history:
 *   get:
 *     summary: 获取用户角色分配记录
 *     description: 获取指定用户的角色分配历史记录，包括分配时间、操作人等信息
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *         example: 123
 *     responses:
 *       200:
 *         description: 成功获取用户角色分配记录
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取角色分配记录成功"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: 用户角色分配历史记录，包含操作时间、操作人、角色变更等信息
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/users/:userId/role-history', auth_middleware_1.verifyToken, user_role_controller_1["default"].getUserRoleHistory);
exports["default"] = router;
