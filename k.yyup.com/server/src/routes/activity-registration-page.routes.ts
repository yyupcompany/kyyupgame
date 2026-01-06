/**
* @swagger
 * components:
 *   schemas:
 *     Activity-registration-page:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Activity-registration-page ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Activity-registration-page 名称
 *           example: "示例Activity-registration-page"
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
 *     CreateActivity-registration-pageRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Activity-registration-page 名称
 *           example: "新Activity-registration-page"
 *     UpdateActivity-registration-pageRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Activity-registration-page 名称
 *           example: "更新后的Activity-registration-page"
 *     Activity-registration-pageListResponse:
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
 *                 $ref: '#/components/schemas/Activity-registration-page'
 *         message:
 *           type: string
 *           example: "获取activity-registration-page列表成功"
 *     Activity-registration-pageResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Activity-registration-page'
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
 * activity-registration-page管理路由文件
 * 提供activity-registration-page的基础CRUD操作
*
 * 功能包括：
 * - 获取activity-registration-page列表
 * - 创建新activity-registration-page
 * - 获取activity-registration-page详情
 * - 更新activity-registration-page信息
 * - 删除activity-registration-page
*
 * 权限要求：需要有效的JWT Token认证
*/

import express from 'express';
import {
  generateRegistrationPage,
  getRegistrationPage,
  submitRegistration,
  getRegistrationStats
} from '../controllers/activity-registration-page.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = express.Router();

/**
* @swagger
 * /activity-registration-page/generate:
 *   post:
 *     summary: 生成活动报名页面
 *     description: 为活动生成自定义报名页面，支持多种表单配置
 *     tags: [活动报名页面]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activityId:
 *                 type: integer
 *                 description: 活动ID
 *               title:
 *                 type: string
 *                 description: 报名页面标题
 *               description:
 *                 type: string
 *                 description: 报名页面描述
 *               formFields:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     label:
 *                       type: string
 *                     type:
 *                       type: string
 *                     required:
 *                       type: boolean
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                 description: 表单字段配置
 *               theme:
 *                 type: object
 *                 description: 页面主题配置
 *               settings:
 *                 type: object
 *                 description: 其他设置
 *     responses:
 *       200:
 *         description: 生成成功
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
 *                   example: "报名页面生成成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pageId:
 *                       type: string
 *                       description: 页面ID
 *                     pageUrl:
 *                       type: string
 *                       description: 页面访问链接
 *       401:
 *         description: 未认证
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
*/
router.post('/generate', verifyToken, generateRegistrationPage);

/**
* @swagger
 * /activity-registration-page/{pageId}:
 *   get:
 *     summary: 获取报名页面配置
 *     description: 获取指定报名页面的配置信息，支持公开访问
 *     tags: [活动报名页面]
 *     parameters:
 *       - in: path
 *         name: pageId
 *         required: true
 *         schema:
 *           type: string
 *         description: 页面ID
 *     responses:
 *       200:
 *         description: 获取页面配置成功
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     pageId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     formFields:
 *                       type: array
 *                       items:
 *                         type: object
 *                     theme:
 *                       type: object
 *                     activity:
 *                       type: object
 *       404:
 *         description: 页面不存在
 *       500:
 *         description: 服务器错误
*/
router.get('/:pageId', getRegistrationPage);

/**
* @swagger
 * /activity-registration-page/{pageId}/submit:
 *   post:
 *     summary: 提交报名信息
 *     description: 用户提交报名信息到指定的活动报名页面
 *     tags: [活动报名页面]
 *     parameters:
 *       - in: path
 *         name: pageId
 *         required: true
 *         schema:
 *           type: string
 *         description: 页面ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               formData:
 *                 type: object
 *                 description: 表单数据
 *               participantInfo:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *                 description: 参与者基本信息
 *     responses:
 *       200:
 *         description: 提交成功
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
 *                   example: "报名提交成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     registrationId:
 *                       type: integer
 *                       description: 报名ID
 *                     status:
 *                       type: string
 *                       description: 报名状态
 *       400:
 *         description: 请求参数错误或表单验证失败
 *       404:
 *         description: 页面不存在
 *       500:
 *         description: 服务器错误
*/
router.post('/:pageId/submit', submitRegistration);

/**
* @swagger
 * /activity-registration-page/{pageId}/stats:
 *   get:
 *     summary: 获取报名统计
 *     description: 获取指定报名页面的统计数据和报名列表
 *     tags: [活动报名页面]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pageId
 *         required: true
 *         schema:
 *           type: string
 *         description: 页面ID
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRegistrations:
 *                       type: integer
 *                       description: 总报名数
 *                     todayRegistrations:
 *                       type: integer
 *                       description: 今日报名数
 *                     conversionRate:
 *                       type: number
 *                       description: 转化率
 *                     registrations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           participantName:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           submittedAt:
 *                             type: string
 *                           status:
 *                             type: string
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限访问
 *       404:
 *         description: 页面不存在
 *       500:
 *         description: 服务器错误
*/
router.get('/:pageId/stats', verifyToken, getRegistrationStats);

export default router;

