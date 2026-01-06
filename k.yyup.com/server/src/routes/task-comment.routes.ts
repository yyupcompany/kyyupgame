/**
* @swagger
 * components:
 *   schemas:
 *     Task-comment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Task-comment ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Task-comment 名称
 *           example: "示例Task-comment"
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
 *     CreateTask-commentRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Task-comment 名称
 *           example: "新Task-comment"
 *     UpdateTask-commentRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Task-comment 名称
 *           example: "更新后的Task-comment"
 *     Task-commentListResponse:
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
 *                 $ref: '#/components/schemas/Task-comment'
 *         message:
 *           type: string
 *           example: "获取task-comment列表成功"
 *     Task-commentResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Task-comment'
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
 * task-comment管理路由文件
 * 提供task-comment的基础CRUD操作
*
 * 功能包括：
 * - 获取task-comment列表
 * - 创建新task-comment
 * - 获取task-comment详情
 * - 更新task-comment信息
 * - 删除task-comment
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { TaskCommentController } from '../controllers/task-comment.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * tags:
 *   name: TaskComments
 *   description: 任务评论管理
*/

/**
* @swagger
 * /api/inspection-tasks/{taskId}/comments:
 *   get:
 *     summary: 获取任务的所有评论
 *     tags: [TaskComments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 任务ID
 *     responses:
 *       200:
 *         description: 成功获取评论列表
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/inspection-tasks/:taskId/comments', TaskCommentController.getTaskComments);

/**
* @swagger
 * /api/inspection-tasks/{taskId}/comments:
 *   post:
 *     summary: 创建任务评论
 *     tags: [TaskComments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 任务ID
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
 *                 description: 评论内容
 *     responses:
 *       201:
 *         description: 评论创建成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 任务不存在
 *       500:
 *         description: 服务器错误
*/
router.post('/inspection-tasks/:taskId/comments', TaskCommentController.createComment);

/**
* @swagger
 * /api/task-comments/{commentId}:
 *   delete:
 *     summary: 删除任务评论
 *     tags: [TaskComments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 评论ID
 *     responses:
 *       200:
 *         description: 评论删除成功
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权删除
 *       404:
 *         description: 评论不存在
 *       500:
 *         description: 服务器错误
*/
router.delete('/task-comments/:commentId', TaskCommentController.deleteComment);

export default router;

