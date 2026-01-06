/**
* @swagger
 * components:
 *   schemas:
 *     Text-polish:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Text-polish ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Text-polish 名称
 *           example: "示例Text-polish"
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
 *     CreateText-polishRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Text-polish 名称
 *           example: "新Text-polish"
 *     UpdateText-polishRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Text-polish 名称
 *           example: "更新后的Text-polish"
 *     Text-polishListResponse:
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
 *                 $ref: '#/components/schemas/Text-polish'
 *         message:
 *           type: string
 *           example: "获取text-polish列表成功"
 *     Text-polishResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Text-polish'
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
 * text-polish管理路由文件
 * 提供text-polish的基础CRUD操作
*
 * 功能包括：
 * - 获取text-polish列表
 * - 创建新text-polish
 * - 获取text-polish详情
 * - 更新text-polish信息
 * - 删除text-polish
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { TextPolishController } from '../controllers/text-polish.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/text-polish/description:
 *   post:
 *     summary: 润色幼儿园介绍文本
 *     tags: [文本润色]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: 需要润色的文本
 *                 example: "我们是一所优质幼儿园，有很好的老师和设施。"
 *     responses:
 *       200:
 *         description: 润色成功
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
 *                     originalText:
 *                       type: string
 *                       description: 原始文本
 *                     polishedText:
 *                       type: string
 *                       description: 润色后的文本
*/
router.post('/description', TextPolishController.polishDescription);

export default router;

