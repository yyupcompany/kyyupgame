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
var user_controller_1 = __importDefault(require("../controllers/user.controller"));
var user_simple_controller_1 = require("../controllers/user-simple.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var role_middleware_1 = require("../middlewares/role.middleware");
var validate_middleware_1 = require("../middlewares/validate.middleware");
var user_validation_1 = require("../validations/user.validation");
var cache_invalidation_middleware_1 = require("../middlewares/cache-invalidation.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 用户ID
 *         username:
 *           type: string
 *           description: 用户名
 *         email:
 *           type: string
 *           format: email
 *           description: 邮箱地址
 *         phone:
 *           type: string
 *           description: 手机号码
 *         name:
 *           type: string
 *           description: 真实姓名
 *         role:
 *           type: string
 *           enum: [admin, principal, teacher, parent]
 *           description: 用户角色
 *         status:
 *           type: string
 *           enum: [active, inactive, locked]
 *           description: 用户状态
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - name
 *         - role
 *       properties:
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 20
 *           description: 用户名
 *         email:
 *           type: string
 *           format: email
 *           description: 邮箱地址
 *         password:
 *           type: string
 *           minLength: 6
 *           description: 密码
 *         phone:
 *           type: string
 *           description: 手机号码
 *         name:
 *           type: string
 *           description: 真实姓名
 *         role:
 *           type: string
 *           enum: [admin, principal, teacher, parent]
 *           description: 用户角色
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 20
 *           description: 用户名
 *         email:
 *           type: string
 *           format: email
 *           description: 邮箱地址
 *         phone:
 *           type: string
 *           description: 手机号码
 *         name:
 *           type: string
 *           description: 真实姓名
 *         role:
 *           type: string
 *           enum: [admin, principal, teacher, parent]
 *           description: 用户角色
 *     UpdateStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           oneOf:
 *             - type: string
 *               enum: [active, inactive, locked]
 *             - type: integer
 *               enum: [0, 1]
 *               description: 0=inactive, 1=active
 *           description: 用户状态
 *         reason:
 *           type: string
 *           description: 状态变更原因
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           description: 当前密码
 *         newPassword:
 *           type: string
 *           minLength: 6
 *           description: 新密码
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [用户管理]
 *     summary: 创建用户
 *     description: 管理员创建新用户账户
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: 用户创建成功
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
 *                   example: 用户创建成功
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足，需要管理员权限
 *       409:
 *         description: 用户名或邮箱已存在
 */
router.post('/', auth_middleware_1.verifyToken, role_middleware_1.requireAdmin, (0, validate_middleware_1.validateRequest)(user_validation_1.createUserSchema), user_controller_1["default"].createUser, cache_invalidation_middleware_1.invalidateUserCache // 创建用户后清除缓存
);
/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [用户管理]
 *     summary: 获取用户列表
 *     description: 获取系统中的所有用户列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: 每页数量
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, principal, teacher, parent]
 *         description: 按角色筛选
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, locked]
 *         description: 按状态筛选
 *     responses:
 *       200:
 *         description: 用户列表获取成功
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
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: 未授权访问
 */
router.get('/', auth_middleware_1.verifyToken, user_simple_controller_1.getUsers);
/**
 * @swagger
 * /api/users/me:
 *   get:
 *     tags: [用户管理]
 *     summary: 获取当前登录用户信息
 *     description: 获取当前登录用户的详细信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 用户信息获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 未授权访问
 */
router.get('/me', auth_middleware_1.verifyToken, function (req, res) {
    // 认证中间件已将用户信息附加到req对象
    // 直接返回req.user
    var userReq = req;
    res.json({
        success: true,
        data: userReq.user
    });
});
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags: [用户管理]
 *     summary: 获取用户资料
 *     description: 获取当前用户的详细资料信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 用户资料获取成功
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     profile:
 *                       type: object
 *                       description: 用户扩展资料
 *       401:
 *         description: 未授权访问
 *       404:
 *         description: 用户不存在
 */
router.get('/profile', auth_middleware_1.verifyToken, user_controller_1["default"].getUserProfile);
/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     tags: [用户管理]
 *     summary: 更新用户状态
 *     description: 管理员更新指定用户的状态
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStatusRequest'
 *     responses:
 *       200:
 *         description: 用户状态更新成功
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
 *                   example: 用户状态更新成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 用户ID
 *                     status:
 *                       type: string
 *                       description: 更新后的状态
 *                     reason:
 *                       type: string
 *                       description: 状态变更原因
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足，需要管理员权限
 *       404:
 *         description: 用户不存在
 */
router.patch('/:id/status', auth_middleware_1.verifyToken, role_middleware_1.requireAdmin, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, status_1, reason, statusValue, validStatuses, sequelize, userResults, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                id = req.params.id;
                _a = req.body, status_1 = _a.status, reason = _a.reason;
                if (!status_1) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '状态参数不能为空'
                        })];
                }
                statusValue = status_1;
                if (typeof status_1 === 'number') {
                    // 数字格式：0=inactive, 1=active
                    if (status_1 === 0)
                        statusValue = 'inactive';
                    else if (status_1 === 1)
                        statusValue = 'active';
                    else {
                        return [2 /*return*/, res.status(400).json({
                                success: false,
                                message: '无效的状态值，数字格式只支持0或1'
                            })];
                    }
                }
                else {
                    validStatuses = ['active', 'inactive', 'locked'];
                    if (!validStatuses.includes(status_1)) {
                        return [2 /*return*/, res.status(400).json({
                                success: false,
                                message: '无效的状态值'
                            })];
                    }
                    statusValue = status_1;
                }
                sequelize = require('../init').sequelize;
                return [4 /*yield*/, sequelize.query('SELECT id FROM users WHERE id = :id', {
                        replacements: { id: id },
                        type: sequelize.QueryTypes.SELECT
                    })];
            case 1:
                userResults = (_b.sent())[0];
                if (!userResults || userResults.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: '用户不存在'
                        })];
                }
                // 更新用户状态
                return [4 /*yield*/, sequelize.query('UPDATE users SET status = :status, updated_at = NOW() WHERE id = :id', {
                        replacements: { status: statusValue, id: id },
                        type: sequelize.QueryTypes.UPDATE
                    })];
            case 2:
                // 更新用户状态
                _b.sent();
                res.json({
                    success: true,
                    message: '用户状态更新成功',
                    data: { id: parseInt(id), status: statusValue, reason: reason }
                });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                next(error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/users/{id}/change-password:
 *   post:
 *     tags: [用户管理]
 *     summary: 修改用户密码
 *     description: 修改指定用户的密码
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: 密码修改成功
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
 *                   example: 密码修改成功
 *       400:
 *         description: 请求参数错误或当前密码不正确
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 用户不存在
 */
router.post('/:id/change-password', auth_middleware_1.verifyToken, (0, validate_middleware_1.validateRequest)(user_validation_1.changePasswordSchema), user_controller_1["default"].changePassword);
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [用户管理]
 *     summary: 获取用户详情
 *     description: 根据用户ID获取用户详细信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 用户详情获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 未授权访问
 *       404:
 *         description: 用户不存在
 */
router.get('/:id', auth_middleware_1.verifyToken, user_controller_1["default"].getUserById);
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [用户管理]
 *     summary: 更新用户信息
 *     description: 管理员更新指定用户的信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: 用户信息更新成功
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
 *                   example: 用户信息更新成功
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足，需要管理员权限
 *       404:
 *         description: 用户不存在
 *       409:
 *         description: 用户名或邮箱已存在
 */
router.put('/:id', auth_middleware_1.verifyToken, role_middleware_1.requireAdmin, (0, validate_middleware_1.validateRequest)(user_validation_1.updateUserSchema), user_controller_1["default"].updateUser, cache_invalidation_middleware_1.invalidateUserCache // 更新用户后清除缓存
);
/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [用户管理]
 *     summary: 删除用户
 *     description: 管理员删除指定用户账户
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 用户删除成功
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
 *                   example: 用户删除成功
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足，需要管理员权限
 *       404:
 *         description: 用户不存在
 *       409:
 *         description: 用户有关联数据，无法删除
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, role_middleware_1.requireAdmin, user_controller_1["default"].deleteUser, cache_invalidation_middleware_1.invalidateUserCache // 删除用户后清除缓存
);
exports["default"] = router;
