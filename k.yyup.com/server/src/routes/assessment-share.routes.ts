/**
* @swagger
 * components:
 *   schemas:
 *     Assessment-share:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Assessment-share ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Assessment-share 名称
 *           example: "示例Assessment-share"
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
 *     CreateAssessment-shareRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Assessment-share 名称
 *           example: "新Assessment-share"
 *     UpdateAssessment-shareRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Assessment-share 名称
 *           example: "更新后的Assessment-share"
 *     Assessment-shareListResponse:
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
 *                 $ref: '#/components/schemas/Assessment-share'
 *         message:
 *           type: string
 *           example: "获取assessment-share列表成功"
 *     Assessment-shareResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Assessment-share'
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
 * assessment-share管理路由文件
 * 提供assessment-share的基础CRUD操作
*
 * 功能包括：
 * - 获取assessment-share列表
 * - 创建新assessment-share
 * - 获取assessment-share详情
 * - 更新assessment-share信息
 * - 删除assessment-share
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import * as assessmentShareController from '../controllers/assessment-share.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /assessment-share/share:
 *   post:
 *     summary: 记录分享行为
 *     description: 记录用户分享评估报告的行为，支持匿名分享
 *     tags: [评估分享]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recordId:
 *                 type: string
 *                 description: 评估记录ID
 *               shareType:
 *                 type: string
 *                 description: 分享类型 (微信朋友圈/微信群/直接分享)
 *               userId:
 *                 type: integer
 *                 description: 用户ID (可选，支持匿名分享)
 *     responses:
 *       200:
 *         description: 分享记录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "分享记录成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     shareId:
 *                       type: string
 *                       description: 分享记录ID
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
*/
router.post('/share', assessmentShareController.recordShare);

/**
* @swagger
 * /assessment-share/scan:
 *   post:
 *     summary: 记录扫描行为
 *     description: 记录用户扫描分享二维码的行为
 *     tags: [评估分享]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shareId:
 *                 type: string
 *                 description: 分享记录ID
 *               scanTime:
 *                 type: string
 *                 description: 扫描时间
 *               deviceInfo:
 *                 type: object
 *                 description: 设备信息
 *     responses:
 *       200:
 *         description: 扫描记录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "扫描记录成功"
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
*/
router.post('/scan', assessmentShareController.recordScan);

/**
* @swagger
 * /assessment-share/stats/{recordId}:
 *   get:
 *     summary: 获取分享统计
 *     description: 获取指定评估记录的分享统计数据
 *     tags: [评估分享]
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *         description: 评估记录ID
 *     responses:
 *       200:
 *         description: 获取统计数据成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取统计数据成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalShares:
 *                       type: integer
 *                       description: 总分享次数
 *                     totalScans:
 *                       type: integer
 *                       description: 总扫描次数
 *                     shareChannels:
 *                       type: object
 *                       description: 各渠道分享统计
 *                     scanTimeline:
 *                       type: array
 *                       description: 扫描时间线
 *       404:
 *         description: 记录不存在
 *       500:
 *         description: 服务器错误
*/
router.get('/stats/:recordId', assessmentShareController.getShareStats);

/**
* @swagger
 * /assessment-share/rewards:
 *   get:
 *     summary: 获取用户分享奖励
 *     description: 获取当前用户的分享奖励记录
 *     tags: [评估分享]
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
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取奖励记录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取奖励记录成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: 总记录数
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                     limit:
 *                       type: integer
 *                       description: 每页数量
 *                     rewards:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           rewardType:
 *                             type: string
 *                           rewardValue:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
*/
router.get('/rewards', assessmentShareController.getUserShareRewards);

export default router;





