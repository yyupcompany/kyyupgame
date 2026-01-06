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
var ai_1 = require("../../middlewares/ai");
var handleMiddlewareResponse_1 = require("./utils/handleMiddlewareResponse");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/ai/user/{userId}/permissions:
 *   get:
 *     summary: 获取用户权限
 *     description: 获取指定用户的AI系统权限配置
 *     tags: [AI用户管理]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 成功获取用户权限
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
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 权限列表
 *                       example: ["ai_chat", "ai_analysis", "ai_memory"]
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 角色列表
 *                       example: ["user", "teacher"]
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器错误
 *     security:
 *       - bearerAuth: []
 */
router.get('/:userId/permissions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.params.userId;
                return [4 /*yield*/, ai_1.aiUserMiddleware.getUserPermissions(parseInt(userId, 10))];
            case 1:
                result = _a.sent();
                (0, handleMiddlewareResponse_1.handleMiddlewareResponse)(res, result);
                return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/ai/user/{userId}/permissions:
 *   post:
 *     summary: 设置用户权限 (管理员)
 *     description: 管理员设置指定用户的AI系统权限
 *     tags: [AI用户管理]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 目标用户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adminUserId
 *               - permissions
 *             properties:
 *               adminUserId:
 *                 type: integer
 *                 minimum: 1
 *                 description: 管理员用户ID
 *                 example: 1
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 要设置的权限列表
 *                 example: ["ai_chat", "ai_analysis"]
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 要设置的角色列表（可选）
 *                 example: ["user", "teacher"]
 *     responses:
 *       200:
 *         description: 成功设置用户权限
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
 *                   example: "权限设置成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       description: 用户ID
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 更新后的权限列表
 *       400:
 *         description: 参数错误或权限设置失败
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足（非管理员）
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器错误
 *     security:
 *       - bearerAuth: []
 */
router.post('/:userId/permissions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, adminUserId, permissions, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userId = req.params.userId;
                _a = req.body, adminUserId = _a.adminUserId, permissions = _a.permissions;
                return [4 /*yield*/, ai_1.aiUserMiddleware.setPermissions(adminUserId, permissions)];
            case 1:
                result = _b.sent();
                (0, handleMiddlewareResponse_1.handleMiddlewareResponse)(res, result);
                return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/ai/user/{userId}/settings:
 *   get:
 *     summary: 获取用户设置
 *     description: 获取指定用户的AI系统个人设置
 *     tags: [AI用户管理]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 成功获取用户设置
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
 *                     settings:
 *                       type: object
 *                       properties:
 *                         aiModel:
 *                           type: string
 *                           description: 默认AI模型
 *                           example: "gpt-4"
 *                         language:
 *                           type: string
 *                           description: 界面语言
 *                           example: "zh-CN"
 *                         theme:
 *                           type: string
 *                           description: 界面主题
 *                           example: "light"
 *                         notifications:
 *                           type: object
 *                           properties:
 *                             email:
 *                               type: boolean
 *                               description: 邮件通知
 *                             push:
 *                               type: boolean
 *                               description: 推送通知
 *                         privacy:
 *                           type: object
 *                           properties:
 *                             shareData:
 *                               type: boolean
 *                               description: 是否共享数据
 *                             memoryRetention:
 *                               type: integer
 *                               description: 记忆保留天数
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器错误
 *     security:
 *       - bearerAuth: []
 */
router.get('/:userId/settings', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.params.userId;
                return [4 /*yield*/, ai_1.aiUserMiddleware.getUserSettings(parseInt(userId, 10))];
            case 1:
                result = _a.sent();
                (0, handleMiddlewareResponse_1.handleMiddlewareResponse)(res, result);
                return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/ai/user/{userId}/settings:
 *   put:
 *     summary: 更新用户设置
 *     description: 更新指定用户的AI系统个人设置
 *     tags: [AI用户管理]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 用户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - settings
 *             properties:
 *               settings:
 *                 type: object
 *                 description: 用户设置对象
 *                 properties:
 *                   aiModel:
 *                     type: string
 *                     description: 默认AI模型
 *                     example: "gpt-4"
 *                   language:
 *                     type: string
 *                     description: 界面语言
 *                     example: "zh-CN"
 *                   theme:
 *                     type: string
 *                     enum: ["light", "dark", "auto"]
 *                     description: 界面主题
 *                     example: "light"
 *                   notifications:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: boolean
 *                         description: 邮件通知
 *                       push:
 *                         type: boolean
 *                         description: 推送通知
 *                   privacy:
 *                     type: object
 *                     properties:
 *                       shareData:
 *                         type: boolean
 *                         description: 是否共享数据
 *                       memoryRetention:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 365
 *                         description: 记忆保留天数
 *     responses:
 *       200:
 *         description: 成功更新用户设置
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
 *                   example: "设置更新成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       description: 用户ID
 *                     settings:
 *                       type: object
 *                       description: 更新后的设置
 *       400:
 *         description: 参数错误或设置更新失败
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足（只能修改自己的设置）
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器错误
 *     security:
 *       - bearerAuth: []
 */
router.put('/:userId/settings', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, settings, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.params.userId;
                settings = req.body.settings;
                return [4 /*yield*/, ai_1.aiUserMiddleware.updateUserSettings(parseInt(userId, 10), settings)];
            case 1:
                result = _a.sent();
                (0, handleMiddlewareResponse_1.handleMiddlewareResponse)(res, result);
                return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
