/**
* @swagger
 * components:
 *   schemas:
 *     Reminder-log:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Reminder-log ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Reminder-log 名称
 *           example: "示例Reminder-log"
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
 *     CreateReminder-logRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Reminder-log 名称
 *           example: "新Reminder-log"
 *     UpdateReminder-logRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Reminder-log 名称
 *           example: "更新后的Reminder-log"
 *     Reminder-logListResponse:
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
 *                 $ref: '#/components/schemas/Reminder-log'
 *         message:
 *           type: string
 *           example: "获取reminder-log列表成功"
 *     Reminder-logResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Reminder-log'
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
 * reminder-log管理路由文件
 * 提供reminder-log的基础CRUD操作
*
 * 功能包括：
 * - 获取reminder-log列表
 * - 创建新reminder-log
 * - 获取reminder-log详情
 * - 更新reminder-log信息
 * - 删除reminder-log
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { ReminderLogController } from '../controllers/reminder-log.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * tags:
 *   name: ReminderLogs
 *   description: 提醒日志管理
*/

/**
* @swagger
 * /api/reminder-logs:
 *   get:
 *     summary: 获取提醒日志列表
 *     tags: [ReminderLogs]
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
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, sent, failed]
 *         description: 发送状态
 *       - in: query
 *         name: inspectionPlanId
 *         schema:
 *           type: integer
 *         description: 检查计划ID
 *       - in: query
 *         name: sentTo
 *         schema:
 *           type: integer
 *         description: 接收人ID
 *       - in: query
 *         name: channel
 *         schema:
 *           type: string
 *         description: 通知渠道
 *     responses:
 *       200:
 *         description: 成功获取提醒日志列表
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/reminder-logs', ReminderLogController.getReminderLogs);

/**
* @swagger
 * /api/reminder-logs/stats:
 *   get:
 *     summary: 获取提醒统计
 *     tags: [ReminderLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期
 *     responses:
 *       200:
 *         description: 成功获取提醒统计
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/reminder-logs/stats', ReminderLogController.getReminderStats);

/**
* @swagger
 * /api/reminder-logs/{id}:
 *   get:
 *     summary: 获取提醒日志详情
 *     tags: [ReminderLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 日志ID
 *     responses:
 *       200:
 *         description: 成功获取提醒日志详情
 *       401:
 *         description: 未授权
 *       404:
 *         description: 日志不存在
 *       500:
 *         description: 服务器错误
*/
router.get('/reminder-logs/:id', ReminderLogController.getReminderLogDetail);

/**
* @swagger
 * /api/reminder-logs:
 *   post:
 *     summary: 创建提醒日志
 *     tags: [ReminderLogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inspectionPlanId
 *               - reminderId
 *               - sentTo
 *               - channel
 *             properties:
 *               inspectionPlanId:
 *                 type: integer
 *               reminderId:
 *                 type: integer
 *               sentTo:
 *                 type: integer
 *               channel:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: 提醒日志创建成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.post('/reminder-logs', ReminderLogController.createReminderLog);

/**
* @swagger
 * /api/reminder-logs/{id}/status:
 *   put:
 *     summary: 更新提醒日志状态
 *     tags: [ReminderLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 日志ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, sent, failed]
 *               errorMessage:
 *                 type: string
 *     responses:
 *       200:
 *         description: 状态更新成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 日志不存在
 *       500:
 *         description: 服务器错误
*/
router.put('/reminder-logs/:id/status', ReminderLogController.updateReminderLogStatus);

export default router;

