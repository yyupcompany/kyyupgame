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
var auth_middleware_1 = require("../middlewares/auth.middleware");
var apiResponse_1 = require("../utils/apiResponse");
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var notification_controller_1 = require("../controllers/notification.controller");
var router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 通知唯一标识符
 *           example: 1
 *         title:
 *           type: string
 *           description: 通知标题
 *           example: "新消息通知"
 *         content:
 *           type: string
 *           description: 通知内容
 *           example: "您有一条新的消息，请及时查看"
 *         type:
 *           type: string
 *           description: 通知类型
 *           enum: ["info", "warning", "error", "success"]
 *           example: "info"
 *         user_id:
 *           type: integer
 *           description: 接收用户ID
 *           example: 123
 *         is_read:
 *           type: boolean
 *           description: 是否已读
 *           example: false
 *         read_at:
 *           type: string
 *           format: date-time
 *           description: 阅读时间
 *           nullable: true
 *           example: "2024-01-01T12:00:00Z"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2024-01-01T10:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2024-01-01T10:00:00Z"
 *
 *     NotificationListResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Notification'
 *         total:
 *           type: integer
 *           description: 总数量
 *           example: 10
 *         page:
 *           type: integer
 *           description: 当前页码
 *           example: 1
 *         pageSize:
 *           type: integer
 *           description: 每页数量
 *           example: 10
 *         totalPages:
 *           type: integer
 *           description: 总页数
 *           example: 1
 *
 *     UnreadCountResponse:
 *       type: object
 *       properties:
 *         unread_count:
 *           type: integer
 *           description: 未读通知数量
 *           example: 5
 *
 *     CreateNotificationRequest:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - type
 *         - user_id
 *       properties:
 *         title:
 *           type: string
 *           description: 通知标题
 *           example: "新消息通知"
 *         content:
 *           type: string
 *           description: 通知内容
 *           example: "您有一条新的消息，请及时查看"
 *         type:
 *           type: string
 *           description: 通知类型
 *           enum: ["info", "warning", "error", "success"]
 *           example: "info"
 *         user_id:
 *           type: integer
 *           description: 接收用户ID
 *           example: 123
 *
 *     UpdateNotificationRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: 通知标题
 *           example: "更新的通知标题"
 *         content:
 *           type: string
 *           description: 通知内容
 *           example: "更新的通知内容"
 *         type:
 *           type: string
 *           description: 通知类型
 *           enum: ["info", "warning", "error", "success"]
 *           example: "warning"
 */
/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: 获取通知列表
 *     description: 获取当前用户的所有通知列表，按创建时间倒序排列
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取通知列表
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/NotificationListResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var notifications, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, init_1.sequelize.query('SELECT * FROM notifications ORDER BY created_at DESC', { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                notifications = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        items: notifications,
                        total: notifications.length,
                        page: 1,
                        pageSize: notifications.length,
                        totalPages: 1
                    })];
            case 2:
                error_1 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_1, '获取通知列表失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/notifications/unread/count:
 *   get:
 *     summary: 获取未读通知数量
 *     description: 获取当前用户的未读通知数量统计
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取未读通知数量
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UnreadCountResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/unread/count', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, init_1.sequelize.query('SELECT COUNT(*) as count FROM notifications WHERE is_read = 0', { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                result = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        unread_count: ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.count) || 0
                    })];
            case 2:
                error_2 = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_2, '获取未读通知数失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: 获取未读通知数量 (兼容路径)
 *     description: 获取当前用户的未读通知数量统计 (兼容性接口)
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取未读通知数量
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UnreadCountResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/unread-count', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, init_1.sequelize.query('SELECT COUNT(*) as count FROM notifications WHERE is_read = 0', { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                result = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        unread_count: ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.count) || 0
                    })];
            case 2:
                error_3 = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_3, '获取未读通知数失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   patch:
 *     summary: 批量标记所有通知为已读
 *     description: 将当前用户的所有未读通知标记为已读状态
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功标记所有通知为已读
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/mark-all-read', auth_middleware_1.verifyToken, notification_controller_1.markAllAsRead);
/**
 * @swagger
 * /api/notifications/batch-read:
 *   post:
 *     summary: 批量标记通知为已读 (兼容路径)
 *     description: 批量将指定的通知标记为已读状态 (兼容性接口)
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notification_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 要标记为已读的通知ID列表
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: 成功批量标记通知为已读
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/batch-read', auth_middleware_1.verifyToken, notification_controller_1.markAllAsRead);
/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: 创建新通知
 *     description: 创建一条新的系统通知
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotificationRequest'
 *     responses:
 *       201:
 *         description: 成功创建通知
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Notification'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '创建通知功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '创建通知失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: 获取通知详情
 *     description: 根据通知ID获取特定通知的详细信息
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 通知ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功获取通知详情
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 通知不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, notifications, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, init_1.sequelize.query('SELECT * FROM notifications WHERE id = ? LIMIT 1', {
                        replacements: [id],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                notifications = _a.sent();
                if (notifications.length === 0) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '通知不存在', 'NOT_FOUND', 404)];
                }
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, notifications[0])];
            case 2:
                error_4 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_4, '获取通知详情失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/notifications/{id}:
 *   put:
 *     summary: 更新通知信息
 *     description: 根据通知ID更新通知的详细信息
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 通知ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNotificationRequest'
 *     responses:
 *       200:
 *         description: 成功更新通知信息
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Notification'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 通知不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '更新通知功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '更新通知失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: 标记通知为已读
 *     description: 将指定的通知标记为已读状态
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 通知ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功标记通知为已读
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 通知不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id/read', auth_middleware_1.verifyToken, notification_controller_1.markAsRead);
/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: 删除通知
 *     description: 根据通知ID删除指定的通知
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 通知ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功删除通知
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 通知不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, notification_controller_1.deleteNotification);
exports["default"] = router;
