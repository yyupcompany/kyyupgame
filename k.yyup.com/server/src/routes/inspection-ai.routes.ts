/**
* @swagger
 * components:
 *   schemas:
 *     Inspection-ai:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Inspection-ai ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Inspection-ai 名称
 *           example: "示例Inspection-ai"
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
 *     CreateInspection-aiRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Inspection-ai 名称
 *           example: "新Inspection-ai"
 *     UpdateInspection-aiRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Inspection-ai 名称
 *           example: "更新后的Inspection-ai"
 *     Inspection-aiListResponse:
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
 *                 $ref: '#/components/schemas/Inspection-ai'
 *         message:
 *           type: string
 *           example: "获取inspection-ai列表成功"
 *     Inspection-aiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Inspection-ai'
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
 * inspection-ai管理路由文件
 * 提供inspection-ai的基础CRUD操作
*
 * 功能包括：
 * - 获取inspection-ai列表
 * - 创建新inspection-ai
 * - 获取inspection-ai详情
 * - 更新inspection-ai信息
 * - 删除inspection-ai
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import inspectionAIController from '../controllers/inspection-ai.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 应用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/inspection-ai/document-analysis:
 *   post:
 *     summary: 文档AI分析
 *     description: 使用AI分析督查文档的完整性和质量，提供填写建议
 *     tags:
 *       - 督查中心AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documentId:
 *                 type: string
 *                 description: 文档实例ID
 *               documentTitle:
 *                 type: string
 *                 description: 文档标题
 *               templateType:
 *                 type: string
 *                 description: 模板类型
 *               currentContent:
 *                 type: string
 *                 description: 当前文档内容
 *     responses:
 *       200:
 *         description: 分析成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     analysis:
 *                       type: object
 *                       properties:
 *                         completeness:
 *                           type: object
 *                           properties:
 *                             score:
 *                               type: number
 *                             description:
 *                               type: string
 *                         quality:
 *                           type: object
 *                           properties:
 *                             score:
 *                               type: number
 *                             description:
 *                               type: string
 *                         missingContent:
 *                           type: array
 *                           items:
 *                             type: string
 *                         suggestions:
 *                           type: array
 *                           items:
 *                             type: string
 *                         warnings:
 *                           type: array
 *                           items:
 *                             type: string
 *                         summary:
 *                           type: string
 *                     modelUsed:
 *                       type: string
 *                     documentInfo:
 *                       type: object
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: 分析失败
*/
router.post('/document-analysis', inspectionAIController.analyzeDocument);

/**
* @swagger
 * /api/inspection-ai/plan-analysis:
 *   post:
 *     summary: 检查计划AI分析
 *     description: 使用AI分析年度检查计划的合理性，提供优化建议
 *     tags:
 *       - 督查中心AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: number
 *                 description: 年度
 *               plans:
 *                 type: array
 *                 description: 检查计划列表
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: 分析成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     analysis:
 *                       type: object
 *                       properties:
 *                         timeDistribution:
 *                           type: object
 *                           properties:
 *                             score:
 *                               type: number
 *                             description:
 *                               type: string
 *                         frequency:
 *                           type: object
 *                           properties:
 *                             score:
 *                               type: number
 *                             description:
 *                               type: string
 *                         resourceAllocation:
 *                           type: object
 *                           properties:
 *                             score:
 *                               type: number
 *                             description:
 *                               type: string
 *                         risks:
 *                           type: array
 *                           items:
 *                             type: string
 *                         recommendations:
 *                           type: array
 *                           items:
 *                             type: string
 *                         summary:
 *                           type: string
 *                     statistics:
 *                       type: object
 *                     modelUsed:
 *                       type: string
 *                     planCount:
 *                       type: number
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: 分析失败
*/
router.post('/plan-analysis', inspectionAIController.analyzePlan);

export default router;

