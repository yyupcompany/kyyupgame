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
var role_controller_1 = require("../controllers/role.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var cache_invalidation_middleware_1 = require("../middlewares/cache-invalidation.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/roles/my-roles:
 *   get:
 *     summary: 获取当前用户的角色
 *     description: 获取当前登录用户拥有的所有角色信息
 *     tags:
 *       - 角色管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取用户角色成功
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: 角色ID
 *                       name:
 *                         type: string
 *                         description: 角色名称
 *                       code:
 *                         type: string
 *                         description: 角色代码
 *                       description:
 *                         type: string
 *                         description: 角色描述
 *                 message:
 *                   type: string
 *                   example: "获取用户角色成功"
 *       401:
 *         description: 未授权
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
 *                   example: "未授权访问"
 */
router.get('/my-roles', auth_middleware_1.verifyToken, role_controller_1.roleController.getUserRoles.bind(role_controller_1.roleController));
/**
 * @swagger
 * /api/roles/check/{roleCode}:
 *   get:
 *     summary: 检查用户是否有指定角色
 *     description: 检查当前登录用户是否拥有指定角色代码的角色
 *     tags:
 *       - 角色管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleCode
 *         required: true
 *         description: 角色代码
 *         schema:
 *           type: string
 *           example: "ADMIN"
 *     responses:
 *       200:
 *         description: 角色检查成功
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
 *                     hasRole:
 *                       type: boolean
 *                       description: 是否拥有该角色
 *                       example: true
 *                 message:
 *                   type: string
 *                   example: "角色检查成功"
 *       401:
 *         description: 未授权
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
 *                   example: "未授权访问"
 */
router.get('/check/:roleCode', auth_middleware_1.verifyToken, role_controller_1.roleController.checkUserRole.bind(role_controller_1.roleController));
/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: 获取所有角色列表
 *     description: 获取系统中所有角色的列表信息（管理员功能）
 *     tags:
 *       - 角色管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取角色列表成功
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: 角色ID
 *                         example: 1
 *                       name:
 *                         type: string
 *                         description: 角色名称
 *                         example: "管理员"
 *                       code:
 *                         type: string
 *                         description: 角色代码
 *                         example: "ADMIN"
 *                       description:
 *                         type: string
 *                         description: 角色描述
 *                         example: "系统管理员"
 *                       status:
 *                         type: integer
 *                         description: 角色状态
 *                         example: 1
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: 创建时间
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: 更新时间
 *                 message:
 *                   type: string
 *                   example: "获取角色列表成功"
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 */
router.get('/', auth_middleware_1.verifyToken, role_controller_1.roleController.getAllRoles.bind(role_controller_1.roleController));
/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: 创建角色
 *     description: 创建新的角色（管理员功能，需要ROLE_MANAGE权限）
 *     tags:
 *       - 角色管理
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 description: 角色名称
 *                 example: "教师"
 *               code:
 *                 type: string
 *                 description: 角色代码
 *                 example: "TEACHER"
 *               description:
 *                 type: string
 *                 description: 角色描述
 *                 example: "幼儿园教师角色"
 *     responses:
 *       201:
 *         description: 角色创建成功
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
 *                     id:
 *                       type: integer
 *                       description: 角色ID
 *                       example: 3
 *                     name:
 *                       type: string
 *                       description: 角色名称
 *                       example: "教师"
 *                     code:
 *                       type: string
 *                       description: 角色代码
 *                       example: "TEACHER"
 *                     description:
 *                       type: string
 *                       description: 角色描述
 *                       example: "幼儿园教师角色"
 *                     status:
 *                       type: integer
 *                       description: 角色状态
 *                       example: 1
 *                 message:
 *                   type: string
 *                   example: "角色创建成功"
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       409:
 *         description: 角色代码已存在
 */
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ROLE_MANAGE'), role_controller_1.roleController.createRole.bind(role_controller_1.roleController), cache_invalidation_middleware_1.invalidateRoleCache);
/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: 获取角色详情
 *     description: 根据角色ID获取角色的详细信息（管理员功能，需要ROLE_MANAGE权限）
 *     tags:
 *       - 角色管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 角色ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 获取角色详情成功
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
 *                     id:
 *                       type: integer
 *                       description: 角色ID
 *                       example: 1
 *                     name:
 *                       type: string
 *                       description: 角色名称
 *                       example: "管理员"
 *                     code:
 *                       type: string
 *                       description: 角色代码
 *                       example: "ADMIN"
 *                     description:
 *                       type: string
 *                       description: 角色描述
 *                       example: "系统管理员"
 *                     status:
 *                       type: integer
 *                       description: 角色状态
 *                       example: 1
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: 创建时间
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 更新时间
 *                 message:
 *                   type: string
 *                   example: "获取角色详情成功"
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 角色不存在
 */
router.get('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ROLE_MANAGE'), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, sequelize, QueryTypes, roleResults, role, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                sequelize = require('../init').sequelize;
                QueryTypes = require('sequelize').QueryTypes;
                console.log('[角色详情] 查询角色ID:', id);
                return [4 /*yield*/, sequelize.query('SELECT * FROM roles WHERE id = :id AND status = 1', {
                        replacements: { id: Number(id) || 0 },
                        type: QueryTypes.SELECT
                    })];
            case 1:
                roleResults = _a.sent();
                console.log('[角色详情] 查询结果:', roleResults);
                if (!roleResults || roleResults.length === 0) {
                    console.log('[角色详情] 角色不存在');
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: '角色不存在'
                        })];
                }
                role = roleResults[0];
                console.log('[角色详情] 返回角色信息:', role);
                res.json({
                    success: true,
                    data: role,
                    message: '获取角色详情成功'
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('[角色详情] 查询错误:', error_1);
                next(error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: 更新角色
 *     description: 更新指定角色的信息（管理员功能，需要ROLE_MANAGE权限）
 *     tags:
 *       - 角色管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 角色ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 角色名称
 *                 example: "高级管理员"
 *               code:
 *                 type: string
 *                 description: 角色代码
 *                 example: "ADMIN"
 *               description:
 *                 type: string
 *                 description: 角色描述
 *                 example: "系统高级管理员"
 *               status:
 *                 type: integer
 *                 description: 角色状态
 *                 example: 1
 *     responses:
 *       200:
 *         description: 角色更新成功
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
 *                     id:
 *                       type: integer
 *                       description: 角色ID
 *                       example: 1
 *                     name:
 *                       type: string
 *                       description: 角色名称
 *                       example: "高级管理员"
 *                     code:
 *                       type: string
 *                       description: 角色代码
 *                       example: "ADMIN"
 *                     description:
 *                       type: string
 *                       description: 角色描述
 *                       example: "系统高级管理员"
 *                     status:
 *                       type: integer
 *                       description: 角色状态
 *                       example: 1
 *                 message:
 *                   type: string
 *                   example: "角色更新成功"
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 角色不存在
 *       409:
 *         description: 角色代码已存在
 */
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ROLE_MANAGE'), role_controller_1.roleController.updateRole.bind(role_controller_1.roleController), cache_invalidation_middleware_1.invalidateRoleCache);
/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: 删除角色
 *     description: 删除指定的角色（管理员功能，需要ROLE_MANAGE权限）
 *     tags:
 *       - 角色管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 角色ID
 *         schema:
 *           type: integer
 *           example: 3
 *     responses:
 *       200:
 *         description: 角色删除成功
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
 *                   example: "角色删除成功"
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 角色不存在
 *       409:
 *         description: 角色正在使用中，无法删除
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ROLE_MANAGE'), role_controller_1.roleController.deleteRole.bind(role_controller_1.roleController), cache_invalidation_middleware_1.invalidateRoleCache);
exports["default"] = router;
