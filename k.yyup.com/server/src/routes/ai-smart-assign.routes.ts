/**
* @swagger
 * components:
 *   schemas:
 *     Ai-smart-assign:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Ai-smart-assign ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Ai-smart-assign 名称
 *           example: "示例Ai-smart-assign"
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
 *     CreateAi-smart-assignRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Ai-smart-assign 名称
 *           example: "新Ai-smart-assign"
 *     UpdateAi-smart-assignRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Ai-smart-assign 名称
 *           example: "更新后的Ai-smart-assign"
 *     Ai-smart-assignListResponse:
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
 *                 $ref: '#/components/schemas/Ai-smart-assign'
 *         message:
 *           type: string
 *           example: "获取ai-smart-assign列表成功"
 *     Ai-smart-assignResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Ai-smart-assign'
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
 * ai-smart-assign管理路由文件
 * 提供ai-smart-assign的基础CRUD操作
*
 * 功能包括：
 * - 获取ai-smart-assign列表
 * - 创建新ai-smart-assign
 * - 获取ai-smart-assign详情
 * - 更新ai-smart-assign信息
 * - 删除ai-smart-assign
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * AI智能分配路由
*/

import express from 'express';
import * as aiSmartAssignController from '../controllers/ai-smart-assign.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = express.Router();

// 所有路由都需要认证
router.use(verifyToken);

/**
* @swagger
 * /api/ai-smart-assign/smart-assign:
 *   post:
 *     summary: AI智能分配客户
 *     description: 使用AI算法智能分配客户给教师
 *     tags:
 *       - AI智能分配
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 分配成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/smart-assign', aiSmartAssignController.smartAssign);

/**
* @swagger
 * /api/ai-smart-assign/batch-assign:
 *   post:
 *     summary: 执行批量分配
 *     description: 批量分配多个客户给教师
 *     tags:
 *       - AI智能分配
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 批量分配成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/batch-assign', aiSmartAssignController.batchAssign);

/**
* @swagger
 * /api/ai-smart-assign/teacher-capacity:
 *   get:
 *     summary: 获取教师能力分析
 *     description: 获取教师的能力分析数据
 *     tags:
 *       - AI智能分配
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/teacher-capacity', aiSmartAssignController.getTeacherCapacity);

export default router;

