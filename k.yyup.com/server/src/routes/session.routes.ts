/**
 * 会话管理路由
*/

import { Router } from 'express';
import sessionController from '../controllers/session.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * tags:
 *   - name: "会话管理"
 *     description: "用户会话管理和监控接口"
*/

/**
* @swagger
 * components:
 *   schemas:
 *     UserSession:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: "会话ID"
 *         userId:
 *           type: integer
 *           description: "用户ID"
 *         username:
 *           type: string
 *           description: "用户名"
 *         role:
 *           type: string
 *           description: "用户角色"
 *         loginTime:
 *           type: string
 *           format: date-time
 *           description: "登录时间"
 *         lastActivity:
 *           type: string
 *           format: date-time
 *           description: "最后活跃时间"
 *         ipAddress:
 *           type: string
 *           description: "IP地址"
 *         userAgent:
 *           type: string
 *           description: "用户代理"
 *         isActive:
 *           type: boolean
 *           description: "是否活跃"
 *     SessionStats:
 *       type: object
 *       properties:
 *         totalSessions:
 *           type: integer
 *           description: "总会话数"
 *         activeSessions:
 *           type: integer
 *           description: "活跃会话数"
 *         uniqueUsers:
 *           type: integer
 *           description: "独立用户数"
 *         averageSessionDuration:
 *           type: number
 *           description: "平均会话时长（分钟）"
 *         peakConcurrentUsers:
 *           type: integer
 *           description: "峰值并发用户数"
 *     OnlineUser:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *           description: "用户ID"
 *         username:
 *           type: string
 *           description: "用户名"
 *         realName:
 *           type: string
 *           description: "真实姓名"
 *         role:
 *           type: string
 *           description: "用户角色"
 *         lastActivity:
 *           type: string
 *           format: date-time
 *           description: "最后活跃时间"
 *         sessionDuration:
 *           type: string
 *           description: "会话持续时间"
 *         ipAddress:
 *           type: string
 *           description: "IP地址"
*/

/**
* @swagger
 * /api/sessions/my:
 *   get:
 *     summary: 获取当前用户的所有会话
 *     description: 获取当前登录用户在所有设备上的活跃会话信息
 *     tags: [会话管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取用户会话列表成功
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
 *                     sessions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserSession'
 *                     total:
 *                       type: integer
 *                       example: 3
 *                 message:
 *                   type: string
 *                   example: "获取用户会话成功"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "未授权访问"
*/
router.get('/my', sessionController.getUserSessions);

/**
* @swagger
 * /api/sessions/online:
 *   get:
 *     summary: 获取在线用户列表（管理员）
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/online', sessionController.getOnlineUsers);

/**
* @swagger
 * /api/sessions/stats:
 *   get:
 *     summary: 获取会话统计信息（管理员）
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/stats', sessionController.getSessionStats);

/**
* @swagger
 * /api/sessions/kickout/{userId}:
 *   post:
 *     summary: 踢出指定用户的所有会话（管理员）
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 踢出成功
*/
router.post('/kickout/:userId', sessionController.kickoutUser);

/**
* @swagger
 * /api/sessions/kickout-others:
 *   post:
 *     summary: 踢出当前用户的其他会话
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 踢出成功
*/
router.post('/kickout-others', sessionController.kickoutOtherSessions);

/**
* @swagger
 * /api/sessions/{token}:
 *   delete:
 *     summary: 删除指定会话
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 删除成功
*/
router.delete('/:token', sessionController.deleteSession);

/**
* @swagger
 * /api/sessions/activity:
 *   put:
 *     summary: 更新当前会话活跃时间
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 更新成功
*/
router.put('/activity', sessionController.updateSessionActivity);

export default router;

