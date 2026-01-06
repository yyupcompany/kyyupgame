"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
exports.__esModule = true;
/**
 * 录取通知路由
 */
var express_1 = require("express");
var admissionNotificationController = __importStar(require("../controllers/admission-notification.controller"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
// 创建异步处理器函数来包装控制器方法
var asyncHandler = function (fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next))["catch"](next);
    };
};
/**
 * @swagger
 * /api/admission-notifications:
 *   post:
 *     summary: 创建录取通知
 *     tags: [录取通知]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - admissionId
 *               - studentName
 *               - parentId
 *               - method
 *               - content
 *               - recipientContact
 *             properties:
 *               admissionId:
 *                 type: integer
 *                 description: 录取结果ID
 *               studentName:
 *                 type: string
 *                 description: 学生姓名
 *               parentId:
 *                 type: integer
 *                 description: 家长ID
 *               method:
 *                 type: string
 *                 enum: [sms, email, wechat, phone, letter, app]
 *                 description: 通知方式
 *               content:
 *                 type: string
 *                 description: 通知内容
 *               recipientContact:
 *                 type: string
 *                 description: 接收人联系方式
 *               subject:
 *                 type: string
 *                 description: 主题
 *               templateId:
 *                 type: integer
 *                 description: 模板ID
 *               attachments:
 *                 type: string
 *                 description: 附件
 *               responseRequired:
 *                 type: boolean
 *                 description: 是否需要回复
 *               responseDeadline:
 *                 type: string
 *                 format: date
 *                 description: 回复截止日期
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADMISSION_NOTIFICATION_MANAGE'), asyncHandler(admissionNotificationController.createNotification));
/**
 * @swagger
 * /api/admission-notifications:
 *   get:
 *     summary: 获取通知列表
 *     tags: [录取通知]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: studentName
 *         schema:
 *           type: string
 *         description: 学生姓名
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 通知状态
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *         description: 通知方式
 *       - in: query
 *         name: admissionId
 *         schema:
 *           type: integer
 *         description: 录取结果ID
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: integer
 *         description: 家长ID
 *       - in: query
 *         name: senderId
 *         schema:
 *           type: integer
 *         description: 发送人ID
 *       - in: query
 *         name: sendTimeStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 发送开始时间
 *       - in: query
 *         name: sendTimeEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 发送结束时间
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADMISSION_NOTIFICATION_MANAGE'), asyncHandler(admissionNotificationController.getNotifications));
/**
 * @swagger
 * /api/admission-notifications/by-result/{resultId}:
 *   get:
 *     summary: 按录取结果获取通知
 *     tags: [录取通知]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resultId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 录取结果ID
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.get('/by-result/:resultId', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADMISSION_NOTIFICATION_MANAGE'), asyncHandler(admissionNotificationController.getNotificationsByResult));
/**
 * @swagger
 * /api/admission-notifications/by-parent/{parentId}:
 *   get:
 *     summary: 按家长获取通知
 *     tags: [录取通知]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 家长ID
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.get('/by-parent/:parentId', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADMISSION_NOTIFICATION_MANAGE'), asyncHandler(admissionNotificationController.getNotificationsByParent));
/**
 * @swagger
 * /api/admission-notifications/{id}:
 *   get:
 *     summary: 获取通知详情
 *     tags: [录取通知]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 通知ID
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.get('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADMISSION_NOTIFICATION_MANAGE'), asyncHandler(admissionNotificationController.getNotificationById));
/**
 * @swagger
 * /api/admission-notifications/{id}:
 *   put:
 *     summary: 更新通知
 *     tags: [录取通知]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 通知ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentName:
 *                 type: string
 *                 description: 学生姓名
 *               parentId:
 *                 type: integer
 *                 description: 家长ID
 *               method:
 *                 type: string
 *                 enum: [sms, email, wechat, phone, letter, app]
 *                 description: 通知方式
 *               content:
 *                 type: string
 *                 description: 通知内容
 *               recipientContact:
 *                 type: string
 *                 description: 接收人联系方式
 *               subject:
 *                 type: string
 *                 description: 主题
 *               templateId:
 *                 type: integer
 *                 description: 模板ID
 *               attachments:
 *                 type: string
 *                 description: 附件
 *               responseRequired:
 *                 type: boolean
 *                 description: 是否需要回复
 *               responseDeadline:
 *                 type: string
 *                 format: date
 *                 description: 回复截止日期
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADMISSION_NOTIFICATION_MANAGE'), asyncHandler(admissionNotificationController.updateNotification));
/**
 * @swagger
 * /api/admission-notifications/{id}:
 *   delete:
 *     summary: 删除通知
 *     tags: [录取通知]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 通知ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADMISSION_NOTIFICATION_MANAGE'), asyncHandler(admissionNotificationController.deleteNotification));
/**
 * @swagger
 * /api/admission-notifications/{id}/send:
 *   post:
 *     summary: 发送通知
 *     tags: [录取通知]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 通知ID
 *     responses:
 *       200:
 *         description: 发送成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.post('/:id/send', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADMISSION_NOTIFICATION_MANAGE'), asyncHandler(admissionNotificationController.sendNotification));
/**
 * @swagger
 * /api/admission-notifications/{id}/resend:
 *   post:
 *     summary: 重新发送通知
 *     tags: [录取通知]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 通知ID
 *     responses:
 *       200:
 *         description: 重新发送成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.post('/:id/resend', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADMISSION_NOTIFICATION_MANAGE'), asyncHandler(admissionNotificationController.resendNotification));
/**
 * @swagger
 * /api/admission-notifications/{id}/delivered:
 *   put:
 *     summary: 标记通知为已送达
 *     tags: [录取通知]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 通知ID
 *     responses:
 *       200:
 *         description: 标记成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.put('/:id/delivered', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADMISSION_NOTIFICATION_MANAGE'), asyncHandler(admissionNotificationController.markDelivered));
/**
 * @swagger
 * /api/admission-notifications/{id}/read:
 *   put:
 *     summary: 标记通知为已读
 *     tags: [录取通知]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 通知ID
 *     responses:
 *       200:
 *         description: 标记成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.put('/:id/read', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADMISSION_NOTIFICATION_MANAGE'), asyncHandler(admissionNotificationController.markRead));
/**
 * @swagger
 * /api/admission-notifications/{id}/response:
 *   post:
 *     summary: 记录通知回复
 *     tags: [录取通知]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 通知ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 回复内容
 *     responses:
 *       200:
 *         description: 记录成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.post('/:id/response', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADMISSION_NOTIFICATION_MANAGE'), asyncHandler(admissionNotificationController.recordResponse));
exports["default"] = router;
