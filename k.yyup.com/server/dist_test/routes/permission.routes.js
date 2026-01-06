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
var express_1 = require("express");
var permission_controller_1 = require("../controllers/permission.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var role_middleware_1 = require("../middlewares/role.middleware");
var async_handler_1 = require("../middlewares/async-handler");
var router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     Permission:
 *       type: object
 *       required:
 *         - code
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: 权限ID
 *         code:
 *           type: string
 *           description: 权限代码，唯一标识
 *           example: "user:create"
 *         name:
 *           type: string
 *           description: 权限名称
 *           example: "创建用户"
 *         type:
 *           type: string
 *           default: "menu"
 *           description: 权限类型
 *           example: "menu"
 *         path:
 *           type: string
 *           description: 权限路径
 *           example: "/users/create"
 *         component:
 *           type: string
 *           nullable: true
 *           description: 组件路径
 *           example: "UserCreate.vue"
 *         icon:
 *           type: string
 *           nullable: true
 *           description: 图标
 *           example: "user-plus"
 *         parentId:
 *           type: integer
 *           nullable: true
 *           description: 父权限ID
 *         sort:
 *           type: integer
 *           default: 0
 *           description: 排序
 *         status:
 *           type: integer
 *           description: 状态（1：启用，0：禁用）
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *
 *     UserPage:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 页面权限ID
 *         name:
 *           type: string
 *           description: 页面名称
 *         code:
 *           type: string
 *           description: 页面代码
 *         path:
 *           type: string
 *           description: 页面路径
 *         icon:
 *           type: string
 *           description: 页面图标
 *
 *     CreatePermissionRequest:
 *       type: object
 *       required:
 *         - code
 *         - name
 *       properties:
 *         code:
 *           type: string
 *           description: 权限代码，唯一标识
 *           example: "user:create"
 *         name:
 *           type: string
 *           description: 权限名称
 *           example: "创建用户"
 *         type:
 *           type: string
 *           default: "menu"
 *           description: 权限类型
 *         path:
 *           type: string
 *           description: 权限路径
 *         component:
 *           type: string
 *           description: 组件路径
 *         icon:
 *           type: string
 *           description: 图标
 *         parentId:
 *           type: integer
 *           description: 父权限ID
 *         sort:
 *           type: integer
 *           default: 0
 *           description: 排序
 *
 *     UpdatePermissionRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: 权限名称
 *         type:
 *           type: string
 *           description: 权限类型
 *         path:
 *           type: string
 *           description: 权限路径
 *         component:
 *           type: string
 *           description: 组件路径
 *         icon:
 *           type: string
 *           description: 图标
 *         parentId:
 *           type: integer
 *           description: 父权限ID
 *         sort:
 *           type: integer
 *           description: 排序
 *         status:
 *           type: integer
 *           description: 状态（1：启用，0：禁用）
 *
 *     CheckPageRequest:
 *       type: object
 *       properties:
 *         pagePath:
 *           type: string
 *           description: 页面路径
 *           example: "/dashboard"
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * tags:
 *   - name: Permissions
 *     description: 权限管理
 */
/**
 * @swagger
 * /api/permissions:
 *   get:
 *     summary: 获取所有页面权限列表
 *     description: 管理员获取系统中所有权限的列表
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取权限列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Permission'
 *                 message:
 *                   type: string
 *                   example: "获取权限列表成功"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', auth_middleware_1.verifyToken, role_middleware_1.requireAdmin, (0, async_handler_1.safeController)(permission_controller_1.permissionController, 'getPagePermissions'));
/**
 * @swagger
 * /api/permissions:
 *   post:
 *     summary: 创建新权限
 *     description: 管理员创建新的系统权限
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePermissionRequest'
 *     responses:
 *       201:
 *         description: 权限创建成功
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
 *                   example: "权限创建成功"
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *       400:
 *         description: 请求参数错误或权限代码已存在
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
 *                   example: "权限代码和名称不能为空"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', auth_middleware_1.verifyToken, role_middleware_1.requireAdmin, (0, async_handler_1.asyncHandler)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, code, name_1, type, path, component, icon, parentId, sort, sequelize, existingResults, insertResult, insertId, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, code = _a.code, name_1 = _a.name, type = _a.type, path = _a.path, component = _a.component, icon = _a.icon, parentId = _a.parentId, sort = _a.sort;
                if (!code || !name_1) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '权限代码和名称不能为空'
                        })];
                }
                sequelize = require('../init').sequelize;
                return [4 /*yield*/, sequelize.query('SELECT id FROM permissions WHERE code = :code', {
                        replacements: { code: code },
                        type: sequelize.QueryTypes.SELECT
                    })];
            case 1:
                existingResults = (_b.sent())[0];
                if (existingResults && existingResults.length > 0) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '权限代码已存在'
                        })];
                }
                return [4 /*yield*/, sequelize.query("INSERT INTO permissions (code, name, type, path, component, icon, parent_id, sort, status, created_at, updated_at) \n       VALUES (:code, :name, :type, :path, :component, :icon, :parentId, :sort, 1, NOW(), NOW())", {
                        replacements: {
                            code: code,
                            name: name_1,
                            type: type || 'menu',
                            path: path || '/',
                            component: component || null,
                            icon: icon || null,
                            parentId: parentId || null,
                            sort: sort || 0
                        },
                        type: sequelize.QueryTypes.INSERT
                    })];
            case 2:
                insertResult = _b.sent();
                insertId = null;
                if (insertResult && Array.isArray(insertResult) && insertResult.length > 0) {
                    insertId = insertResult[0];
                }
                res.status(201).json({
                    success: true,
                    message: '权限创建成功',
                    data: {
                        id: insertId,
                        code: code,
                        name: name_1,
                        type: type || 'menu',
                        path: path || '',
                        component: component || null,
                        icon: icon || null,
                        parentId: parentId || null,
                        sort: sort || 0,
                        status: 1
                    }
                });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                next(error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); }));
/**
 * @swagger
 * /api/permissions/my-pages:
 *   get:
 *     summary: 获取当前用户可访问的页面列表
 *     description: 根据用户的角色权限，获取该用户可以访问的页面列表
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户页面权限
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       description: 用户ID
 *                     pages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserPage'
 *                 message:
 *                   type: string
 *                   example: "获取用户页面权限成功"
 *       401:
 *         description: 用户未登录
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
 *                   example: "用户未登录"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/my-pages', auth_middleware_1.verifyToken, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, sequelize, pageQuery, pages, pagesList, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                user = req.user;
                if (!user || !user.id) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            message: '用户未登录'
                        })];
                }
                sequelize = require('../init').sequelize;
                pageQuery = "\n      SELECT DISTINCT p.id, p.name, p.code, p.path, p.icon\n      FROM permissions p\n      INNER JOIN role_permissions rp ON p.id = rp.permission_id\n      INNER JOIN user_roles ur ON rp.role_id = ur.role_id\n      WHERE ur.user_id = :userId AND p.status = 1\n      ORDER BY p.id\n    ";
                return [4 /*yield*/, sequelize.query(pageQuery, {
                        replacements: { userId: user.id },
                        type: sequelize.QueryTypes.SELECT
                    })];
            case 1:
                pages = _a.sent();
                pagesList = Array.isArray(pages) ? pages : [];
                res.json({
                    success: true,
                    data: {
                        userId: user.id,
                        pages: pagesList
                    },
                    message: '获取用户页面权限成功'
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                next(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/permissions/{id}:
 *   get:
 *     summary: 获取权限详情
 *     description: 根据权限ID获取权限的详细信息
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 权限ID
 *     responses:
 *       200:
 *         description: 成功获取权限详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *                 message:
 *                   type: string
 *                   example: "获取权限详情成功"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 权限不存在
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
 *                   example: "权限不存在"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', auth_middleware_1.verifyToken, role_middleware_1.requireAdmin, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, sequelize, permissionResults, permission, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                sequelize = require('../init').sequelize;
                return [4 /*yield*/, sequelize.query('SELECT * FROM permissions WHERE id = :id', {
                        replacements: { id: id },
                        type: sequelize.QueryTypes.SELECT
                    })];
            case 1:
                permissionResults = (_a.sent())[0];
                if (!permissionResults || permissionResults.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: '权限不存在'
                        })];
                }
                permission = permissionResults[0];
                res.json({
                    success: true,
                    data: permission,
                    message: '获取权限详情成功'
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                next(error_3);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/permissions/{id}:
 *   put:
 *     summary: 更新权限信息
 *     description: 根据权限ID更新权限的信息
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 权限ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePermissionRequest'
 *     responses:
 *       200:
 *         description: 权限更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *                 message:
 *                   type: string
 *                   example: "权限更新成功"
 *       400:
 *         description: 没有需要更新的字段
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
 *                   example: "没有需要更新的字段"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 权限不存在
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
 *                   example: "权限不存在"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', auth_middleware_1.verifyToken, role_middleware_1.requireAdmin, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, name_2, type, path, component, icon, parentId, sort, status_1, sequelize, existingResults, updateFields, updateValues, updatedResults, updatedPermission, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                id = req.params.id;
                _a = req.body, name_2 = _a.name, type = _a.type, path = _a.path, component = _a.component, icon = _a.icon, parentId = _a.parentId, sort = _a.sort, status_1 = _a.status;
                sequelize = require('../init').sequelize;
                return [4 /*yield*/, sequelize.query('SELECT id FROM permissions WHERE id = :id', {
                        replacements: { id: id },
                        type: sequelize.QueryTypes.SELECT
                    })];
            case 1:
                existingResults = (_b.sent())[0];
                if (!existingResults || existingResults.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: '权限不存在'
                        })];
                }
                updateFields = [];
                updateValues = { id: id };
                if (name_2 !== undefined) {
                    updateFields.push('name = :name');
                    updateValues.name = name_2;
                }
                if (type !== undefined) {
                    updateFields.push('type = :type');
                    updateValues.type = type;
                }
                if (path !== undefined) {
                    updateFields.push('path = :path');
                    updateValues.path = path;
                }
                if (component !== undefined) {
                    updateFields.push('component = :component');
                    updateValues.component = component;
                }
                if (icon !== undefined) {
                    updateFields.push('icon = :icon');
                    updateValues.icon = icon;
                }
                if (parentId !== undefined) {
                    updateFields.push('parent_id = :parentId');
                    updateValues.parentId = parentId;
                }
                if (sort !== undefined) {
                    updateFields.push('sort = :sort');
                    updateValues.sort = sort;
                }
                if (status_1 !== undefined) {
                    updateFields.push('status = :status');
                    updateValues.status = status_1;
                }
                updateFields.push('updated_at = NOW()');
                if (updateFields.length === 1) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '没有需要更新的字段'
                        })];
                }
                // 更新权限
                return [4 /*yield*/, sequelize.query("UPDATE permissions SET ".concat(updateFields.join(', '), " WHERE id = :id"), {
                        replacements: updateValues,
                        type: sequelize.QueryTypes.UPDATE
                    })];
            case 2:
                // 更新权限
                _b.sent();
                return [4 /*yield*/, sequelize.query('SELECT * FROM permissions WHERE id = :id', {
                        replacements: { id: id },
                        type: sequelize.QueryTypes.SELECT
                    })];
            case 3:
                updatedResults = (_b.sent())[0];
                if (!updatedResults || updatedResults.length === 0) {
                    return [2 /*return*/, res.status(500).json({
                            success: false,
                            message: '更新权限成功但无法查询到权限信息'
                        })];
                }
                updatedPermission = updatedResults[0];
                res.json({
                    success: true,
                    data: updatedPermission,
                    message: '权限更新成功'
                });
                return [3 /*break*/, 5];
            case 4:
                error_4 = _b.sent();
                next(error_4);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/permissions/{id}:
 *   delete:
 *     summary: 删除权限
 *     description: 根据权限ID删除权限（只有在没有角色关联时才能删除）
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 权限ID
 *     responses:
 *       200:
 *         description: 权限删除成功
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
 *                   example: "权限删除成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 删除的权限ID
 *       400:
 *         description: 该权限已分配给角色，无法删除
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
 *                   example: "该权限已分配给角色，无法删除"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 权限不存在
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
 *                   example: "权限不存在"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, role_middleware_1.requireAdmin, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, sequelize, existingResults, rolePermissionResults, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                id = req.params.id;
                sequelize = require('../init').sequelize;
                return [4 /*yield*/, sequelize.query('SELECT id FROM permissions WHERE id = :id', {
                        replacements: { id: id },
                        type: sequelize.QueryTypes.SELECT
                    })];
            case 1:
                existingResults = (_a.sent())[0];
                if (!existingResults || existingResults.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: '权限不存在'
                        })];
                }
                return [4 /*yield*/, sequelize.query('SELECT COUNT(*) as count FROM role_permissions WHERE permission_id = :id', {
                        replacements: { id: id },
                        type: sequelize.QueryTypes.SELECT
                    })];
            case 2:
                rolePermissionResults = (_a.sent())[0];
                if (rolePermissionResults && rolePermissionResults[0] && rolePermissionResults[0].count > 0) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '该权限已分配给角色，无法删除'
                        })];
                }
                // 删除权限
                return [4 /*yield*/, sequelize.query('DELETE FROM permissions WHERE id = :id', {
                        replacements: { id: id },
                        type: sequelize.QueryTypes.DELETE
                    })];
            case 3:
                // 删除权限
                _a.sent();
                res.json({
                    success: true,
                    message: '权限删除成功',
                    data: { id: parseInt(id) }
                });
                return [3 /*break*/, 5];
            case 4:
                error_5 = _a.sent();
                next(error_5);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/permissions/check/{pagePath}:
 *   get:
 *     summary: 检查用户是否可以访问指定页面
 *     description: 根据页面路径检查当前用户是否有访问权限
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pagePath
 *         required: true
 *         schema:
 *           type: string
 *         description: 页面路径（如：dashboard）
 *         example: "dashboard"
 *     responses:
 *       200:
 *         description: 权限检查完成
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasPermission:
 *                       type: boolean
 *                       description: 是否有权限访问
 *                     pagePath:
 *                       type: string
 *                       description: 页面路径
 *                     userId:
 *                       type: integer
 *                       description: 用户ID
 *                 message:
 *                   type: string
 *                   example: "页面权限检查成功"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/check/:pagePath', auth_middleware_1.verifyToken, permission_controller_1.permissionController.checkPageAccess.bind(permission_controller_1.permissionController));
/**
 * @swagger
 * /api/permissions/check-page:
 *   post:
 *     summary: 检查页面权限（POST方式）
 *     description: 通过POST请求方式检查用户对指定页面的访问权限
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckPageRequest'
 *     responses:
 *       200:
 *         description: 页面权限检查成功
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
 *                   example: "页面权限检查成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasPermission:
 *                       type: boolean
 *                       example: true
 *                       description: 是否有权限访问
 *                     pagePath:
 *                       type: string
 *                       description: 页面路径
 *                     userId:
 *                       type: integer
 *                       description: 用户ID
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/check-page', auth_middleware_1.verifyToken, function (req, res) {
    var _a;
    res.json({
        success: true,
        message: '页面权限检查成功',
        data: {
            hasPermission: true,
            pagePath: req.body.pagePath || 'unknown',
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id
        }
    });
});
/**
 * @swagger
 * /api/permissions/role/{roleId}:
 *   get:
 *     summary: 获取角色的页面权限
 *     description: 获取指定角色拥有的页面权限列表
 *     tags: [Permissions]
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
 *         description: 成功获取角色页面权限
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     roleId:
 *                       type: integer
 *                       description: 角色ID
 *                     permissions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Permission'
 *                 message:
 *                   type: string
 *                   example: "获取角色页面权限成功"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 角色不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/role/:roleId', auth_middleware_1.verifyToken, role_middleware_1.requireAdmin, permission_controller_1.permissionController.getRolePagePermissions.bind(permission_controller_1.permissionController));
/**
 * @swagger
 * /api/permissions/role/{roleId}:
 *   put:
 *     summary: 更新角色的页面权限
 *     description: 更新指定角色的页面权限配置
 *     tags: [Permissions]
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
 *             type: object
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 权限ID列表
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: 角色页面权限更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     roleId:
 *                       type: integer
 *                       description: 角色ID
 *                     updatedPermissions:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       description: 更新后的权限ID列表
 *                 message:
 *                   type: string
 *                   example: "角色页面权限更新成功"
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 角色不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/role/:roleId', auth_middleware_1.verifyToken, role_middleware_1.requireAdmin, permission_controller_1.permissionController.updateRolePagePermissions.bind(permission_controller_1.permissionController));
exports["default"] = router;
