/**
* @swagger
 * components:
 *   schemas:
 *     Admission-notification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Admission-notification ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Admission-notification 名称
 *           example: "示例Admission-notification"
 *         status:
 *           type: string
 *           description: 状态
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2024-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2024-01-01T00:00:00.000Z"
 *     CreateAdmission-notificationRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Admission-notification 名称
 *           example: "新Admission-notification"
 *     UpdateAdmission-notificationRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Admission-notification 名称
 *           example: "更新后的Admission-notification"
 *     Admission-notificationListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             list:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Admission-notification'
 *         message:
 *           type: string
 *           example: "获取admission-notification列表成功"
 *     Admission-notificationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Admission-notification'
 *         message:
 *           type: string
 *           example: "操作成功"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "操作失败"
 *         code:
 *           type: string
 *           example: "INTERNAL_ERROR"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
*/

/**
 * admission-notification管理路由文件
 * 提供admission-notification的基础CRUD操作
*
 * 功能包括：
 * - 获取admission-notification列表
 * - 创建新admission-notification
 * - 获取admission-notification详情
 * - 更新admission-notification信息
 * - 删除admission-notification
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 录取通知路由
*/
import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import * as admissionNotificationController from '../controllers/admission-notification.controller';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

// 创建异步处理器函数来包装控制器方法
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
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
router.post(
  '/', checkPermission('ADMISSION_NOTIFICATION_MANAGE'),
  asyncHandler(admissionNotificationController.createNotification)
);

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
router.get(
  '/', checkPermission('ADMISSION_NOTIFICATION_MANAGE'),
  asyncHandler(admissionNotificationController.getNotifications)
);

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
router.get(
  '/by-result/:resultId', checkPermission('ADMISSION_NOTIFICATION_MANAGE'),
  asyncHandler(admissionNotificationController.getNotificationsByResult)
);

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
router.get(
  '/by-parent/:parentId', checkPermission('ADMISSION_NOTIFICATION_MANAGE'),
  asyncHandler(admissionNotificationController.getNotificationsByParent)
);

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
router.get(
  '/:id', checkPermission('ADMISSION_NOTIFICATION_MANAGE'),
  asyncHandler(admissionNotificationController.getNotificationById)
);

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
router.put(
  '/:id', checkPermission('ADMISSION_NOTIFICATION_MANAGE'),
  asyncHandler(admissionNotificationController.updateNotification)
);

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
router.delete(
  '/:id', checkPermission('ADMISSION_NOTIFICATION_MANAGE'),
  asyncHandler(admissionNotificationController.deleteNotification)
);

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
router.post(
  '/:id/send', checkPermission('ADMISSION_NOTIFICATION_MANAGE'),
  asyncHandler(admissionNotificationController.sendNotification)
);

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
router.post(
  '/:id/resend', checkPermission('ADMISSION_NOTIFICATION_MANAGE'),
  asyncHandler(admissionNotificationController.resendNotification)
);

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
router.put(
  '/:id/delivered', checkPermission('ADMISSION_NOTIFICATION_MANAGE'),
  asyncHandler(admissionNotificationController.markDelivered)
);

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
router.put(
  '/:id/read', checkPermission('ADMISSION_NOTIFICATION_MANAGE'),
  asyncHandler(admissionNotificationController.markRead)
);

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
router.post(
  '/:id/response', checkPermission('ADMISSION_NOTIFICATION_MANAGE'),
  asyncHandler(admissionNotificationController.recordResponse)
);

export default router; 