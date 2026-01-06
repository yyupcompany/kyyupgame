/**
* @swagger
 * components:
 *   schemas:
 *     Kindergarten-completenes:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Kindergarten-completenes ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Kindergarten-completenes 名称
 *           example: "示例Kindergarten-completenes"
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
 *     CreateKindergarten-completenesRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Kindergarten-completenes 名称
 *           example: "新Kindergarten-completenes"
 *     UpdateKindergarten-completenesRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Kindergarten-completenes 名称
 *           example: "更新后的Kindergarten-completenes"
 *     Kindergarten-completenesListResponse:
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
 *                 $ref: '#/components/schemas/Kindergarten-completenes'
 *         message:
 *           type: string
 *           example: "获取kindergarten-completenes列表成功"
 *     Kindergarten-completenesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Kindergarten-completenes'
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
 * kindergarten-completenes管理路由文件
 * 提供kindergarten-completenes的基础CRUD操作
*
 * 功能包括：
 * - 获取kindergarten-completenes列表
 * - 创建新kindergarten-completenes
 * - 获取kindergarten-completenes详情
 * - 更新kindergarten-completenes信息
 * - 删除kindergarten-completenes
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { KindergartenCompletenessController } from '../controllers/kindergarten-completeness.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * 幼儿园信息完整度相关路由
 * 基础路径: /api/kindergarten
*/

// 所有路由都需要认证
router.use(verifyToken);

/**
* @swagger
 * /kindergarten/completeness:
 *   get:
 *     summary: 获取幼儿园信息完整度
 *     description: 获取当前幼儿园的信息完整度统计数据
 *     tags: [幼儿园管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取完整度数据成功
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
 *                     completeness:
 *                       type: number
 *                       description: 完整度百分比
 *                     totalFields:
 *                       type: integer
 *                       description: 总字段数
 *                     filledFields:
 *                       type: integer
 *                       description: 已填字段数
 *                     missingFields:
 *                       type: integer
 *                       description: 缺失字段数
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
*/
router.get('/completeness', KindergartenCompletenessController.getCompleteness);

/**
* @swagger
 * /kindergarten/missing-fields:
 *   get:
 *     summary: 获取缺失字段列表
 *     description: 获取当前幼儿园缺失或未填写的字段清单
 *     tags: [幼儿园管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取缺失字段成功
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
 *                     requiredFields:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           fieldName:
 *                             type: string
 *                           fieldLabel:
 *                             type: string
 *                           priority:
 *                             type: string
 *                       description: 必填缺失字段
 *                     recommendedFields:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           fieldName:
 *                             type: string
 *                           fieldLabel:
 *                             type: string
 *                           priority:
 *                             type: string
 *                       description: 推荐填写字段
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
*/
router.get('/missing-fields', KindergartenCompletenessController.getMissingFields);

/**
* @swagger
 * /kindergarten/base-info/batch:
 *   put:
 *     summary: 批量更新基础信息
 *     description: 批量更新幼儿园的基础信息数据
 *     tags: [幼儿园管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fields:
 *                 type: object
 *                 description: 要更新的字段键值对
 *     responses:
 *       200:
 *         description: 更新成功
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
 *                   example: "更新成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedCount:
 *                       type: integer
 *                       description: 更新的字段数量
 *                     completeness:
 *                       type: number
 *                       description: 更新后的完整度
 *       401:
 *         description: 未认证
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
*/
router.put('/base-info/batch', KindergartenCompletenessController.batchUpdateBaseInfo);

/**
* @swagger
 * /kindergarten/calculate-completeness:
 *   post:
 *     summary: 计算信息完整度
 *     description: 手动触发重新计算并更新幼儿园信息完整度
 *     tags: [幼儿园管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 计算完成
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
 *                   example: "完整度计算完成"
 *                 data:
 *                   type: object
 *                   properties:
 *                     previousCompleteness:
 *                       type: number
 *                       description: 计算前完整度
 *                     currentCompleteness:
 *                       type: number
 *                       description: 计算后完整度
 *                     improvement:
 *                       type: number
 *                       description: 提升百分点
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
*/
router.post('/calculate-completeness', KindergartenCompletenessController.calculateCompleteness);

/**
* @swagger
 * /kindergarten/field-config:
 *   get:
 *     summary: 获取字段配置
 *     description: 获取幼儿园信息字段的配置规则（必填/推荐/可选）
 *     tags: [幼儿园管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取配置成功
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
 *                     fieldGroups:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           groupName:
 *                             type: string
 *                           fields:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                 label:
 *                                   type: string
 *                                 type:
 *                                   type: string
 *                                 required:
 *                                   type: boolean
 *                                 priority:
 *                                   type: string
 *                                 description:
 *                                   type: string
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
*/
router.get('/field-config', KindergartenCompletenessController.getFieldConfig);

export default router;

