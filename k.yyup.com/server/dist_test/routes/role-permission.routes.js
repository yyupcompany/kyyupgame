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
var role_permission_controller_1 = __importDefault(require("../controllers/role-permission.controller"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var validate_middleware_1 = require("../middlewares/validate.middleware");
var role_permission_validation_1 = require("../validations/role-permission.validation");
var init_1 = require("../init");
var apiResponse_1 = require("../utils/apiResponse");
var apiError_1 = require("../utils/apiError");
/**
 * @swagger
 * tags:
 *   name: RolePermissions
 *   description: 角色权限关联管理API
 *
 * components:
 *   schemas:
 *     RolePermission:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 角色权限关联ID
 *         roleId:
 *           type: integer
 *           description: 角色ID
 *         permissionId:
 *           type: integer
 *           description: 权限ID
 *         grantorId:
 *           type: integer
 *           description: 授权者ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *         roleName:
 *           type: string
 *           description: 角色名称
 *         roleCode:
 *           type: string
 *           description: 角色代码
 *         roleDescription:
 *           type: string
 *           description: 角色描述
 *         permissionName:
 *           type: string
 *           description: 权限名称
 *         permissionCode:
 *           type: string
 *           description: 权限代码
 *         permissionPath:
 *           type: string
 *           description: 权限路径
 *
 *     CreateRolePermissionRequest:
 *       type: object
 *       required:
 *         - roleId
 *         - permissionId
 *       properties:
 *         roleId:
 *           type: integer
 *           description: 角色ID
 *         permissionId:
 *           type: integer
 *           description: 权限ID
 *         assignedBy:
 *           type: integer
 *           description: 授权者ID
 *         notes:
 *           type: string
 *           description: 备注
 *
 *     UpdateRolePermissionRequest:
 *       type: object
 *       properties:
 *         notes:
 *           type: string
 *           description: 备注
 *
 *     PermissionIdsRequest:
 *       type: object
 *       required:
 *         - permissionIds
 *       properties:
 *         permissionIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: 权限ID列表
 */
var router = (0, express_1.Router)();
// ===== 标准REST API路径 (用于测试脚本) =====
/**
 * @swagger
 * /api/role-permissions:
 *   get:
 *     summary: 获取角色权限关联列表
 *     description: 获取系统中所有角色权限关联的列表信息
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取角色权限关联列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取角色权限关联列表成功
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RolePermission'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ROLE_PERMISSION_MANAGE'), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var rolePermissions, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        rp.id,\n        rp.role_id as roleId,\n        rp.permission_id as permissionId,\n        rp.grantor_id as grantorId,\n        rp.created_at as createdAt,\n        rp.updated_at as updatedAt,\n        r.name as roleName,\n        r.code as roleCode,\n        r.description as roleDescription,\n        p.name as permissionName,\n        p.code as permissionCode,\n        p.path as permissionPath\n      FROM role_permissions rp\n      LEFT JOIN roles r ON rp.role_id = r.id\n      LEFT JOIN permissions p ON rp.permission_id = p.id\n      ORDER BY rp.created_at DESC\n    ")];
            case 1:
                rolePermissions = (_a.sent())[0];
                apiResponse_1.ApiResponse.success(res, rolePermissions, '获取角色权限关联列表成功');
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('获取角色权限关联列表错误:', error_1);
                apiResponse_1.ApiResponse.handleError(res, error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/role-permissions:
 *   post:
 *     summary: 创建角色权限关联
 *     description: 为指定角色分配权限
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRolePermissionRequest'
 *     responses:
 *       201:
 *         description: 创建角色权限关联成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: 创建角色权限关联成功
 *                 data:
 *                   $ref: '#/components/schemas/RolePermission'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ROLE_PERMISSION_MANAGE'), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, roleId, permissionId, assignedBy, notes, roles, permissions, existing, grantorId, newRolePermission, error_2;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 6, , 7]);
                _a = req.body, roleId = _a.roleId, permissionId = _a.permissionId, assignedBy = _a.assignedBy, notes = _a.notes;
                if (!roleId || !permissionId) {
                    throw apiError_1.ApiError.badRequest('角色ID和权限ID不能为空');
                }
                return [4 /*yield*/, init_1.sequelize.query('SELECT id FROM roles WHERE id = ? AND status = 1', {
                        replacements: [roleId]
                    })];
            case 1:
                roles = (_c.sent())[0];
                if (!roles || roles.length === 0) {
                    throw apiError_1.ApiError.notFound('角色不存在');
                }
                return [4 /*yield*/, init_1.sequelize.query('SELECT id FROM permissions WHERE id = ? AND status = 1', {
                        replacements: [permissionId]
                    })];
            case 2:
                permissions = (_c.sent())[0];
                if (!permissions || permissions.length === 0) {
                    throw apiError_1.ApiError.notFound('权限不存在');
                }
                return [4 /*yield*/, init_1.sequelize.query('SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ?', { replacements: [roleId, permissionId] })];
            case 3:
                existing = (_c.sent())[0];
                if (existing && existing.length > 0) {
                    throw apiError_1.ApiError.badRequest('该角色权限关联已存在');
                }
                grantorId = assignedBy || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || 1;
                // 创建角色权限关联
                return [4 /*yield*/, init_1.sequelize.query("\n      INSERT INTO role_permissions (role_id, permission_id, grantor_id, created_at, updated_at)\n      VALUES (?, ?, ?, NOW(), NOW())\n    ", {
                        replacements: [roleId, permissionId, grantorId]
                    })];
            case 4:
                // 创建角色权限关联
                _c.sent();
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        rp.id,\n        rp.role_id as roleId,\n        rp.permission_id as permissionId,\n        rp.grantor_id as grantorId,\n        rp.created_at as createdAt,\n        rp.updated_at as updatedAt\n      FROM role_permissions rp\n      WHERE rp.role_id = ? AND rp.permission_id = ?\n      ORDER BY rp.created_at DESC\n      LIMIT 1\n    ", {
                        replacements: [roleId, permissionId]
                    })];
            case 5:
                newRolePermission = (_c.sent())[0];
                apiResponse_1.ApiResponse.success(res, newRolePermission[0], '创建角色权限关联成功', 201);
                return [3 /*break*/, 7];
            case 6:
                error_2 = _c.sent();
                console.error('创建角色权限关联错误:', error_2);
                apiResponse_1.ApiResponse.handleError(res, error_2);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/role-permissions/{id}:
 *   get:
 *     summary: 获取角色权限关联详情
 *     description: 根据ID获取角色权限关联的详细信息
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 角色权限关联ID
 *     responses:
 *       200:
 *         description: 获取角色权限关联详情成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取角色权限关联详情成功
 *                 data:
 *                   $ref: '#/components/schemas/RolePermission'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ROLE_PERMISSION_MANAGE'), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, rolePermissions, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        rp.id,\n        rp.role_id as roleId,\n        rp.permission_id as permissionId,\n        rp.grantor_id as grantorId,\n        rp.created_at as createdAt,\n        rp.updated_at as updatedAt,\n        r.name as roleName,\n        r.code as roleCode,\n        r.description as roleDescription,\n        p.name as permissionName,\n        p.code as permissionCode,\n        p.path as permissionPath\n      FROM role_permissions rp\n      LEFT JOIN roles r ON rp.role_id = r.id\n      LEFT JOIN permissions p ON rp.permission_id = p.id\n      WHERE rp.id = ?\n    ", {
                        replacements: [id]
                    })];
            case 1:
                rolePermissions = (_a.sent())[0];
                if (!rolePermissions || rolePermissions.length === 0) {
                    throw apiError_1.ApiError.notFound('角色权限关联不存在');
                }
                apiResponse_1.ApiResponse.success(res, rolePermissions[0], '获取角色权限关联详情成功');
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('获取角色权限关联详情错误:', error_3);
                apiResponse_1.ApiResponse.handleError(res, error_3);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/role-permissions/{id}:
 *   put:
 *     summary: 更新角色权限关联
 *     description: 更新指定的角色权限关联信息
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 角色权限关联ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRolePermissionRequest'
 *     responses:
 *       200:
 *         description: 更新角色权限关联成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 更新角色权限关联成功
 *                 data:
 *                   $ref: '#/components/schemas/RolePermission'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ROLE_PERMISSION_MANAGE'), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, notes, existing, updatedRolePermission, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                id = req.params.id;
                notes = req.body.notes;
                return [4 /*yield*/, init_1.sequelize.query('SELECT id FROM role_permissions WHERE id = ?', { replacements: [id] })];
            case 1:
                existing = (_a.sent())[0];
                if (!existing || existing.length === 0) {
                    throw apiError_1.ApiError.notFound('角色权限关联不存在');
                }
                // 更新记录
                return [4 /*yield*/, init_1.sequelize.query("\n      UPDATE role_permissions \n      SET updated_at = NOW()\n      WHERE id = ?\n    ", {
                        replacements: [id]
                    })];
            case 2:
                // 更新记录
                _a.sent();
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        rp.id,\n        rp.role_id as roleId,\n        rp.permission_id as permissionId,\n        rp.grantor_id as grantorId,\n        rp.created_at as createdAt,\n        rp.updated_at as updatedAt\n      FROM role_permissions rp\n      WHERE rp.id = ?\n    ", {
                        replacements: [id]
                    })];
            case 3:
                updatedRolePermission = (_a.sent())[0];
                apiResponse_1.ApiResponse.success(res, updatedRolePermission[0], '更新角色权限关联成功');
                return [3 /*break*/, 5];
            case 4:
                error_4 = _a.sent();
                console.error('更新角色权限关联错误:', error_4);
                apiResponse_1.ApiResponse.handleError(res, error_4);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/role-permissions/by-role/{roleId}:
 *   get:
 *     summary: 按角色获取权限关联
 *     description: 获取指定角色的所有权限关联信息
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 角色ID
 *     responses:
 *       200:
 *         description: 获取角色权限关联成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取角色权限关联成功
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RolePermission'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/by-role/:roleId', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ROLE_PERMISSION_MANAGE'), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var roleId, rolePermissions, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                roleId = req.params.roleId;
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        rp.id,\n        rp.role_id as roleId,\n        rp.permission_id as permissionId,\n        rp.grantor_id as grantorId,\n        rp.created_at as createdAt,\n        rp.updated_at as updatedAt,\n        p.name as permissionName,\n        p.code as permissionCode,\n        p.path as permissionPath\n      FROM role_permissions rp\n      LEFT JOIN permissions p ON rp.permission_id = p.id\n      WHERE rp.role_id = ?\n      ORDER BY rp.created_at DESC\n    ", {
                        replacements: [roleId]
                    })];
            case 1:
                rolePermissions = (_a.sent())[0];
                apiResponse_1.ApiResponse.success(res, rolePermissions, '获取角色权限关联成功');
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('按角色获取权限关联错误:', error_5);
                apiResponse_1.ApiResponse.handleError(res, error_5);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/role-permissions/{id}:
 *   delete:
 *     summary: 删除角色权限关联
 *     description: 删除指定的角色权限关联
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 角色权限关联ID
 *     responses:
 *       200:
 *         description: 删除角色权限关联成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 删除角色权限关联成功
 *                 data:
 *                   type: null
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ROLE_PERMISSION_MANAGE'), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, init_1.sequelize.query("\n      DELETE FROM role_permissions WHERE id = ?\n    ", {
                        replacements: [id]
                    })];
            case 1:
                result = (_a.sent())[0];
                // 删除不存在的记录也返回成功（幂等性）
                apiResponse_1.ApiResponse.success(res, null, '删除角色权限关联成功');
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('删除角色权限关联错误:', error_6);
                apiResponse_1.ApiResponse.handleError(res, error_6);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ===== 嵌套路径 (保留现有功能) =====
/**
 * @swagger
 * /api/role-permissions/roles/{roleId}/permissions:
 *   post:
 *     summary: 为角色分配权限
 *     description: 为指定角色批量分配权限
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 角色ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PermissionIdsRequest'
 *     responses:
 *       200:
 *         description: 权限分配成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/roles/:roleId/permissions', auth_middleware_1.verifyToken, (0, validate_middleware_1.validateRequest)(role_permission_validation_1.permissionIdsSchema), role_permission_controller_1["default"].assignPermissionsToRole);
/**
 * @swagger
 * /api/role-permissions/roles/{roleId}/permissions:
 *   delete:
 *     summary: 移除角色的权限
 *     description: 批量移除角色的指定权限
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 角色ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PermissionIdsRequest'
 *     responses:
 *       200:
 *         description: 权限移除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router["delete"]('/roles/:roleId/permissions', auth_middleware_1.verifyToken, (0, validate_middleware_1.validateRequest)(role_permission_validation_1.permissionIdsSchema), role_permission_controller_1["default"].removePermissionsFromRole);
/**
 * @swagger
 * /api/role-permissions/roles/{roleId}/permissions:
 *   get:
 *     summary: 获取角色的所有权限
 *     description: 获取指定角色的所有权限列表
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 角色ID
 *     responses:
 *       200:
 *         description: 获取角色权限成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/roles/:roleId/permissions', auth_middleware_1.verifyToken, role_permission_controller_1["default"].getRolePermissions);
/**
 * @swagger
 * /api/role-permissions/permissions/{permissionId}/inheritance:
 *   get:
 *     summary: 获取权限继承结构
 *     description: 获取指定权限的继承关系结构
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 权限ID
 *     responses:
 *       200:
 *         description: 获取权限继承结构成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/permissions/:permissionId/inheritance', auth_middleware_1.verifyToken, role_permission_controller_1["default"].getPermissionInheritance);
/**
 * @swagger
 * /api/role-permissions/roles/{roleId}/permission-history:
 *   get:
 *     summary: 获取权限分配历史
 *     description: 获取指定角色的权限分配历史记录
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 角色ID
 *     responses:
 *       200:
 *         description: 获取权限分配历史成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/roles/:roleId/permission-history', auth_middleware_1.verifyToken, role_permission_controller_1["default"].getRolePermissionHistory);
/**
 * @swagger
 * /api/role-permissions/check-conflicts:
 *   post:
 *     summary: 检查权限冲突
 *     description: 检查权限分配是否存在冲突
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleId:
 *                 type: integer
 *                 description: 角色ID
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 权限ID列表
 *     responses:
 *       200:
 *         description: 权限冲突检查完成
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/check-conflicts', auth_middleware_1.verifyToken, (0, validate_middleware_1.validateRequest)(role_permission_validation_1.checkPermissionConflictsSchema), role_permission_controller_1["default"].checkPermissionConflicts);
exports["default"] = router;
