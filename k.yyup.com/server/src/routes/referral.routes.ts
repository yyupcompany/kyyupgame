/**
* @swagger
 * components:
 *   schemas:
 *     Referral:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Referral ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Referral 名称
 *           example: "示例Referral"
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
 *     CreateReferralRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Referral 名称
 *           example: "新Referral"
 *     UpdateReferralRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Referral 名称
 *           example: "更新后的Referral"
 *     ReferralListResponse:
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
 *                 $ref: '#/components/schemas/Referral'
 *         message:
 *           type: string
 *           example: "获取referral列表成功"
 *     ReferralResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Referral'
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
 * referral管理路由文件
 * 提供referral的基础CRUD操作
*
 * 功能包括：
 * - 获取referral列表
 * - 创建新referral
 * - 获取referral详情
 * - 更新referral信息
 * - 删除referral
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 转介绍路由
*/

import express from 'express';
import * as referralController from '../controllers/referral.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = express.Router();

/**
* @swagger
 * /api/marketing/referrals/my-code:
 *   get:
 *     summary: 获取我的推广码
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取推广码
*/
router.get('/my-code', verifyToken, referralController.getMyReferralCode);

/**
* @swagger
 * /api/marketing/referrals/my-stats:
 *   get:
 *     summary: 获取我的推广统计
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取推广统计
*/
router.get('/my-stats', verifyToken, referralController.getMyReferralStats);

/**
* @swagger
 * /api/marketing/referrals/my-records:
 *   get:
 *     summary: 获取我的转介绍记录
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: 每页数量
 *       - in: query
 *         name: visitorName
 *         schema:
 *           type: string
 *         description: 访客姓名
 *       - in: query
 *         name: visitorPhone
 *         schema:
 *           type: string
 *         description: 访客手机
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [visited, registered, enrolled, paid]
 *         description: 状态
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [qrcode, link, other]
 *         description: 访问来源
 *     responses:
 *       200:
 *         description: 成功获取转介绍记录
*/
router.get('/my-records', verifyToken, referralController.getMyReferralRecords);

/**
* @swagger
 * /api/marketing/referrals/generate-poster:
 *   post:
 *     summary: 生成推广海报（模板方式）
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               referral_code:
 *                 type: string
 *               qr_code_url:
 *                 type: string
 *               kindergartenName:
 *                 type: string
 *               referrerName:
 *                 type: string
 *               mainTitle:
 *                 type: string
 *               subTitle:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               style:
 *                 type: string
 *                 enum: [professional, warm, modern]
 *     responses:
 *       200:
 *         description: 成功生成海报
*/
router.post('/generate-poster', verifyToken, referralController.generatePoster);

/**
* @swagger
 * /api/marketing/referrals/track-visit:
 *   post:
 *     summary: 记录访问（公开接口）
 *     tags: [Referral]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - referral_code
 *             properties:
 *               referral_code:
 *                 type: string
 *               source:
 *                 type: string
 *                 enum: [qrcode, link, other]
 *     responses:
 *       200:
 *         description: 成功记录访问
*/
router.post('/track-visit', referralController.trackVisit);

/**
* @swagger
 * /api/marketing/referrals/track-conversion:
 *   post:
 *     summary: 记录转化
 *     tags: [Referral]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - referral_code
 *               - status
 *             properties:
 *               referral_code:
 *                 type: string
 *               visitor_name:
 *                 type: string
 *               visitor_phone:
 *                 type: string
 *               visitor_id:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [visited, registered, enrolled, paid]
 *               enrolled_activity_id:
 *                 type: string
 *               enrolled_activity_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: 成功记录转化
*/
router.post('/track-conversion', referralController.trackConversion);

export default router;

