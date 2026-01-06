/**
* @swagger
 * components:
 *   schemas:
 *     Teacher-sop:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Teacher-sop ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Teacher-sop 名称
 *           example: "示例Teacher-sop"
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
 *     CreateTeacher-sopRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Teacher-sop 名称
 *           example: "新Teacher-sop"
 *     UpdateTeacher-sopRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Teacher-sop 名称
 *           example: "更新后的Teacher-sop"
 *     Teacher-sopListResponse:
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
 *                 $ref: '#/components/schemas/Teacher-sop'
 *         message:
 *           type: string
 *           example: "获取teacher-sop列表成功"
 *     Teacher-sopResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Teacher-sop'
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
 * teacher-sop管理路由文件
 * 提供teacher-sop的基础CRUD操作
*
 * 功能包括：
 * - 获取teacher-sop列表
 * - 创建新teacher-sop
 * - 获取teacher-sop详情
 * - 更新teacher-sop信息
 * - 删除teacher-sop
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { TeacherSOPController } from '../controllers/teacher-sop.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/teacher-sop/stages:
 *   get:
 *     summary: 获取所有SOP阶段
 *     description: 获取所有激活的SOP阶段列表
 *     tags:
 *       - 教师SOP
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/stages', TeacherSOPController.getAllStages);

/**
* @swagger
 * /api/teacher-sop/stages/{id}:
 *   get:
 *     summary: 获取阶段详情
 *     description: 获取指定SOP阶段的详细信息
 *     tags:
 *       - 教师SOP
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *       404:
 *         description: 阶段不存在
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/stages/:id', TeacherSOPController.getStageById);

/**
* @swagger
 * /api/teacher-sop/stages/{id}/tasks:
 *   get:
 *     summary: 获取阶段任务列表
 *     description: 获取指定阶段的所有任务
 *     tags:
 *       - 教师SOP
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/stages/:id/tasks', TeacherSOPController.getTasksByStage);

/**
* @swagger
 * /api/teacher-sop/customers/{customerId}/progress:
 *   get:
 *     summary: 获取客户SOP进度
 *     description: 获取指定客户的SOP进度信息
 *     tags:
 *       - 教师SOP
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/customers/:customerId/progress', TeacherSOPController.getCustomerProgress);

/**
* @swagger
 * /api/teacher-sop/customers/{customerId}/progress:
 *   put:
 *     summary: 更新客户SOP进度
 *     description: 更新指定客户的SOP进度信息
 *     tags:
 *       - 教师SOP
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentStageId:
 *                 type: integer
 *               stageProgress:
 *                 type: number
 *               completedTasks:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.put('/customers/:customerId/progress', TeacherSOPController.updateCustomerProgress);

/**
* @swagger
 * /api/teacher-sop/customers/{customerId}/tasks/{taskId}/complete:
 *   post:
 *     summary: 完成任务
 *     description: 标记指定任务为已完成
 *     tags:
 *       - 教师SOP
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 任务已完成
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/customers/:customerId/tasks/:taskId/complete', TeacherSOPController.completeTask);

/**
* @swagger
 * /api/teacher-sop/customers/{customerId}/progress/advance:
 *   post:
 *     summary: 推进到下一阶段
 *     description: 将客户推进到下一个SOP阶段
 *     tags:
 *       - 教师SOP
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 已进入下一阶段
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/customers/:customerId/progress/advance', TeacherSOPController.advanceToNextStage);

/**
* @swagger
 * /api/teacher-sop/customers/{customerId}/conversations:
 *   get:
 *     summary: 获取对话记录
 *     description: 获取指定客户的所有对话记录
 *     tags:
 *       - 教师SOP
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/customers/:customerId/conversations', TeacherSOPController.getConversations);

/**
* @swagger
 * /api/teacher-sop/customers/{customerId}/conversations:
 *   post:
 *     summary: 添加对话记录
 *     description: 为指定客户添加一条对话记录
 *     tags:
 *       - 教师SOP
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - speakerType
 *               - content
 *             properties:
 *               speakerType:
 *                 type: string
 *                 enum: [teacher, customer]
 *               content:
 *                 type: string
 *               messageType:
 *                 type: string
 *                 enum: [text, image, voice, video]
 *     responses:
 *       200:
 *         description: 对话记录已添加
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/customers/:customerId/conversations', TeacherSOPController.addConversation);

/**
* @swagger
 * /api/teacher-sop/customers/{customerId}/conversations/batch:
 *   post:
 *     summary: 批量添加对话记录
 *     description: 为指定客户批量添加对话记录
 *     tags:
 *       - 教师SOP
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversations:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: 对话记录已添加
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/customers/:customerId/conversations/batch', TeacherSOPController.addConversationsBatch);

/**
* @swagger
 * /api/teacher-sop/customers/{customerId}/screenshots/upload:
 *   post:
 *     summary: 上传截图
 *     description: 上传客户对话截图
 *     tags:
 *       - 教师SOP
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: 截图已上传
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/customers/:customerId/screenshots/upload', TeacherSOPController.uploadScreenshot);

/**
* @swagger
 * /api/teacher-sop/customers/{customerId}/screenshots/{screenshotId}/analyze:
 *   post:
 *     summary: 分析截图
 *     description: 使用AI分析对话截图
 *     tags:
 *       - 教师SOP
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: screenshotId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 截图分析完成
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/customers/:customerId/screenshots/:screenshotId/analyze', TeacherSOPController.analyzeScreenshot);

/**
* @swagger
 * /api/teacher-sop/customers/{customerId}/ai-suggestions/task:
 *   post:
 *     summary: 获取任务AI建议
 *     description: 获取指定任务的AI智能建议
 *     tags:
 *       - 教师SOP
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/customers/:customerId/ai-suggestions/task', TeacherSOPController.getTaskAISuggestion);

/**
* @swagger
 * /api/teacher-sop/customers/{customerId}/ai-suggestions/global:
 *   post:
 *     summary: 获取全局AI分析
 *     description: 获取客户的全局AI分析和建议
 *     tags:
 *       - 教师SOP
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/customers/:customerId/ai-suggestions/global', TeacherSOPController.getGlobalAIAnalysis);

export default router;

