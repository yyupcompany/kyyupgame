import { Router } from 'express';
import { DocumentInstanceController } from '../controllers/document-instance.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

/**
* @swagger
 * components:
 *   schemas:
 *     DocumentInstance:
 *       type: object
 *       required:
 *         - templateId
 *         - title
 *         - status
 *         - completionRate
 *         - version
 *       properties:
 *         id:
 *           type: integer
 *           description: 文档实例ID
 *           example: 1
 *         templateId:
 *           type: integer
 *           description: 文档模板ID
 *           example: 1
 *         inspectionTaskId:
 *           type: integer
 *           description: 检查任务ID
 *           example: 1
 *         title:
 *           type: string
 *           description: 文档标题
 *           example: "安全检查记录表"
 *         documentNumber:
 *           type: string
 *           description: 文档编号
 *           example: "DOC-2024-001"
 *         content:
 *           type: string
 *           description: 文档内容
 *           example: "这是文档的具体内容..."
 *         filledData:
 *           type: object
 *           description: 填充的数据
 *           example: {"field1": "value1", "field2": "value2"}
 *         status:
 *           type: string
 *           description: 文档状态
 *           enum: [draft, in_progress, submitted, under_review, approved, rejected, completed]
 *           example: "draft"
 *         completionRate:
 *           type: number
 *           description: 完成率 (0-100)
 *           example: 85
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: 截止日期
 *         submittedAt:
 *           type: string
 *           format: date-time
 *           description: 提交时间
 *         reviewedAt:
 *           type: string
 *           format: date-time
 *           description: 审核时间
 *         startedAt:
 *           type: string
 *           format: date-time
 *           description: 开始时间
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: 完成时间
 *         createdBy:
 *           type: integer
 *           description: 创建者ID
 *           example: 1
 *         assignedTo:
 *           type: integer
 *           description: 分配给的用户ID
 *           example: 2
 *         reviewedBy:
 *           type: integer
 *           description: 审核者ID
 *           example: 3
 *         reviewers:
 *           type: array
 *           items:
 *             type: integer
 *           description: 审核者ID列表
 *           example: [3, 4]
 *         reviewComments:
 *           type: string
 *           description: 审核意见
 *           example: "文档内容完整，符合要求"
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *           description: 附件列表
 *         version:
 *           type: integer
 *           description: 版本号
 *           example: 1
 *         parentVersionId:
 *           type: integer
 *           description: 父版本ID
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: 标签列表
 *           example: ["安全", "检查", "月度"]
 *         metadata:
 *           type: object
 *           description: 元数据
 *           example: {"priority": "high", "category": "safety"}
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           description: 删除时间
*
 *     DocumentInstanceComment:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         id:
 *           type: integer
 *           description: 评论ID
 *           example: 1
 *         documentInstanceId:
 *           type: integer
 *           description: 文档实例ID
 *           example: 1
 *         content:
 *           type: string
 *           description: 评论内容
 *           example: "这个地方需要修改"
 *         authorId:
 *           type: integer
 *           description: 评论作者ID
 *           example: 2
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
*
 *     DocumentInstanceVersion:
 *       type: object
 *       required:
 *         - version
 *         - content
 *       properties:
 *         id:
 *           type: integer
 *           description: 版本ID
 *           example: 1
 *         documentInstanceId:
 *           type: integer
 *           description: 文档实例ID
 *           example: 1
 *         version:
 *           type: integer
 *           description: 版本号
 *           example: 2
 *         content:
 *           type: string
 *           description: 版本内容
 *         changes:
 *           type: string
 *           description: 变更说明
 *           example: "更新了安全检查标准"
 *         createdBy:
 *           type: integer
 *           description: 创建者ID
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
*
 *   parameters:
 *     DocumentInstanceId:
 *       name: id
 *       in: path
 *       required: true
 *       description: 文档实例ID
 *       schema:
 *         type: integer
 *         example: 1
*
 *   responses:
 *     DocumentInstanceNotFound:
 *       description: 文档实例不存在
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "文档实例不存在"
 *               code:
 *                 type: string
 *                 example: "INSTANCE_NOT_FOUND"
 *     UnauthorizedError:
 *       description: 未授权访问
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "未授权访问"
 *               code:
 *                 type: string
 *                 example: "UNAUTHORIZED"
*
 * tags:
 *   - name: 文档实例管理
 *     description: 文档实例的创建、编辑、审核、版本管理等操作
*/

/**
 * 文档实例相关路由
 * 基础路径: /api/document-instances
*/

// 所有路由都需要认证
router.use(verifyToken);

/**
* @swagger
 * /api/document-instances/batch-delete:
 *   post:
 *     summary: 批量删除文档实例
 *     tags:
 *       - 文档实例管理
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 要删除的文档实例ID列表
 *                 example: [1, 2, 3]
 *     responses:
 *       '200':
 *         description: 批量删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "成功删除3个文档实例"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *                       example: 3
 *                     deletedIds:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [1, 2, 3]
 *       '400':
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "请提供要删除的文档实例ID列表"
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/batch-delete', DocumentInstanceController.batchDelete);

/**
* @swagger
 * /api/document-instances/{id}/export:
 *   get:
 *     summary: 导出文档实例
 *     tags:
 *       - 文档实例管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentInstanceId'
 *       - name: format
 *         in: query
 *         required: false
 *         description: 导出格式
 *         schema:
 *           type: string
 *           enum: [pdf, docx, excel]
 *           default: pdf
 *       - name: includeComments
 *         in: query
 *         required: false
 *         description: 是否包含评论
 *         schema:
 *           type: boolean
 *           default: false
 *       - name: includeHistory
 *         in: query
 *         required: false
 *         description: 是否包含版本历史
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       '200':
 *         description: 导出成功
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
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
 *                     downloadUrl:
 *                       type: string
 *                       example: "/api/files/download/document-export-123456.pdf"
 *                     fileName:
 *                       type: string
 *                       example: "安全检查记录表_20240115.pdf"
 *       '404':
 *         $ref: '#/components/responses/DocumentInstanceNotFound'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/:id/export', DocumentInstanceController.exportInstance);

/**
* @swagger
 * /api/document-instances/{id}/assign:
 *   post:
 *     summary: 分配文档
 *     tags:
 *       - 文档实例管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentInstanceId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignedTo
 *             properties:
 *               assignedTo:
 *                 type: integer
 *                 description: 分配给的用户ID
 *                 example: 2
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 description: 截止日期
 *                 example: "2024-02-01T23:59:59Z"
 *               assignMessage:
 *                 type: string
 *                 description: 分配备注信息
 *                 example: "请在月底前完成填写"
 *     responses:
 *       '200':
 *         description: 分配成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "文档分配成功"
 *                 data:
 *                   $ref: '#/components/schemas/DocumentInstance'
 *       '404':
 *         $ref: '#/components/responses/DocumentInstanceNotFound'
 *       '400':
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "分配用户不存在或无效"
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/:id/assign', DocumentInstanceController.assignDocument);

/**
* @swagger
 * /api/document-instances/{id}/submit:
 *   post:
 *     summary: 提交审核
 *     tags:
 *       - 文档实例管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentInstanceId'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               submitMessage:
 *                 type: string
 *                 description: 提交备注信息
 *                 example: "文档已完成，请审核"
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: 提交时的附件
 *     responses:
 *       '200':
 *         description: 提交成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "文档已提交审核"
 *                 data:
 *                   $ref: '#/components/schemas/DocumentInstance'
 *       '400':
 *         description: 文档状态不允许提交
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "文档已完成，无法重复提交"
 *       '404':
 *         $ref: '#/components/responses/DocumentInstanceNotFound'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/:id/submit', DocumentInstanceController.submitForReview);

/**
* @swagger
 * /api/document-instances/{id}/review:
 *   post:
 *     summary: 审核文档
 *     tags:
 *       - 文档实例管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentInstanceId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - status
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject, request_changes]
 *                 description: 审核动作
 *                 example: "approve"
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, under_review]
 *                 description: 审核结果状态
 *                 example: "approved"
 *               reviewComments:
 *                 type: string
 *                 description: 审核意见
 *                 example: "文档内容完整，符合安全检查要求"
 *               requiresChanges:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                       example: "安全措施描述"
 *                     issue:
 *                       type: string
 *                       example: "描述不够详细"
 *                     suggestion:
 *                       type: string
 *                       example: "请补充具体的防护措施"
 *                 description: 需要修改的内容（仅在request_changes时使用）
 *     responses:
 *       '200':
 *         description: 审核成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "文档审核完成"
 *                 data:
 *                   $ref: '#/components/schemas/DocumentInstance'
 *       '400':
 *         description: 审核失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "文档状态不允许审核"
 *       '404':
 *         $ref: '#/components/responses/DocumentInstanceNotFound'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         description: 无权限审核
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "您没有权限审核此文档"
*/
router.post('/:id/review', DocumentInstanceController.reviewDocument);

/**
* @swagger
 * /api/document-instances/{id}/comments:
 *   get:
 *     summary: 获取评论列表
 *     tags:
 *       - 文档实例管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentInstanceId'
 *       - name: page
 *         in: query
 *         required: false
 *         description: 页码
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         required: false
 *         description: 每页数量
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - name: sortBy
 *         in: query
 *         required: false
 *         description: 排序字段
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt]
 *           default: createdAt
 *       - name: sortOrder
 *         in: query
 *         required: false
 *         description: 排序方向
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       '200':
 *         description: 获取评论列表成功
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
 *                     comments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DocumentInstanceComment'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 20
 *                         total:
 *                           type: integer
 *                           example: 15
 *                         totalPages:
 *                           type: integer
 *                           example: 1
 *       '404':
 *         $ref: '#/components/responses/DocumentInstanceNotFound'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     summary: 添加评论
 *     tags:
 *       - 文档实例管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentInstanceId'
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
 *                 minLength: 1
 *                 maxLength: 1000
 *                 example: "这个地方需要修改，应该补充安全防护措施的描述"
 *               parentId:
 *                 type: integer
 *                 description: 父评论ID（回复评论时使用）
 *                 example: 5
 *               mentions:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 提及的用户ID列表
 *                 example: [2, 3]
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: 评论附件
 *     responses:
 *       '201':
 *         description: 添加评论成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "评论添加成功"
 *                 data:
 *                   $ref: '#/components/schemas/DocumentInstanceComment'
 *       '400':
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "评论内容不能为空"
 *       '404':
 *         $ref: '#/components/responses/DocumentInstanceNotFound'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/:id/comments', DocumentInstanceController.getComments);
router.post('/:id/comments', DocumentInstanceController.addComment);

/**
* @swagger
 * /api/document-instances/{id}/versions:
 *   get:
 *     summary: 获取版本历史
 *     tags:
 *       - 文档实例管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentInstanceId'
 *       - name: page
 *         in: query
 *         required: false
 *         description: 页码
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         required: false
 *         description: 每页数量
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       '200':
 *         description: 获取版本历史成功
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
 *                     versions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DocumentInstanceVersion'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 5
 *                         totalPages:
 *                           type: integer
 *                           example: 1
 *       '404':
 *         $ref: '#/components/responses/DocumentInstanceNotFound'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     summary: 创建新版本
 *     tags:
 *       - 文档实例管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentInstanceId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - changes
 *             properties:
 *               content:
 *                 type: string
 *                 description: 新版本内容
 *                 example: "更新后的文档内容，包含新的安全检查标准..."
 *               changes:
 *                 type: string
 *                 description: 变更说明
 *                 minLength: 1
 *                 maxLength: 500
 *                 example: "根据最新安全标准更新了检查项目"
 *               version:
 *                 type: integer
 *                 description: 版本号（可选，自动递增）
 *                 example: 2
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 版本标签
 *                 example: ["安全更新", "标准修订"]
 *     responses:
 *       '201':
 *         description: 创建新版本成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "新版本创建成功"
 *                 data:
 *                   $ref: '#/components/schemas/DocumentInstanceVersion'
 *       '400':
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "文档内容或变更说明不能为空"
 *       '404':
 *         $ref: '#/components/responses/DocumentInstanceNotFound'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/:id/versions', DocumentInstanceController.getVersionHistory);
router.post('/:id/versions', DocumentInstanceController.createVersion);

/**
* @swagger
 * /api/document-instances/{id}:
 *   get:
 *     summary: 获取文档实例详情
 *     tags:
 *       - 文档实例管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentInstanceId'
 *       - name: include
 *         in: query
 *         required: false
 *         description: 包含的关联数据
 *         schema:
 *           type: string
 *           enum: [template, creator, assignee, reviewer, comments, versions]
 *           example: "template,creator,comments"
 *     responses:
 *       '200':
 *         description: 获取文档实例详情成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DocumentInstance'
 *       '404':
 *         $ref: '#/components/responses/DocumentInstanceNotFound'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *   put:
 *     summary: 更新文档实例
 *     tags:
 *       - 文档实例管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentInstanceId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 文档标题
 *                 example: "更新后的安全检查记录表"
 *               content:
 *                 type: string
 *                 description: 文档内容
 *                 example: "更新后的文档内容..."
 *               filledData:
 *                 type: object
 *                 description: 填充的数据
 *                 example: {"field1": "updated_value1", "field2": "updated_value2"}
 *               status:
 *                 type: string
 *                 enum: [draft, in_progress, submitted, under_review, approved, rejected, completed]
 *                 description: 文档状态
 *                 example: "in_progress"
 *               completionRate:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: 完成率
 *                 example: 90
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 description: 截止日期
 *                 example: "2024-02-01T23:59:59Z"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 标签列表
 *                 example: ["安全", "检查", "月度", "更新"]
 *               metadata:
 *                 type: object
 *                 description: 元数据
 *                 example: {"priority": "high", "category": "safety", "updated": true}
 *     responses:
 *       '200':
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "文档实例更新成功"
 *                 data:
 *                   $ref: '#/components/schemas/DocumentInstance'
 *       '400':
 *         description: 请求参数错误或文档状态不允许修改
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "文档已提交审核，无法修改"
 *       '404':
 *         $ref: '#/components/responses/DocumentInstanceNotFound'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *   delete:
 *     summary: 删除文档实例
 *     tags:
 *       - 文档实例管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DocumentInstanceId'
 *     responses:
 *       '200':
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "文档实例删除成功"
 *       '400':
 *         description: 文档状态不允许删除
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "已审核的文档无法删除"
 *       '404':
 *         $ref: '#/components/responses/DocumentInstanceNotFound'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/:id', DocumentInstanceController.getInstanceById);
router.put('/:id', DocumentInstanceController.updateInstance);
router.delete('/:id', DocumentInstanceController.deleteInstance);

/**
* @swagger
 * /api/document-instances:
 *   get:
 *     summary: 获取文档实例列表
 *     tags:
 *       - 文档实例管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: 页码
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         required: false
 *         description: 每页数量
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - name: status
 *         in: query
 *         required: false
 *         description: 文档状态过滤
 *         schema:
 *           type: string
 *           enum: [draft, in_progress, submitted, under_review, approved, rejected, completed]
 *           example: "draft"
 *       - name: templateId
 *         in: query
 *         required: false
 *         description: 模板ID过滤
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: createdBy
 *         in: query
 *         required: false
 *         description: 创建者ID过滤
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: assignedTo
 *         in: query
 *         required: false
 *         description: 分配用户ID过滤
 *         schema:
 *           type: integer
 *           example: 2
 *       - name: keyword
 *         in: query
 *         required: false
 *         description: 关键词搜索（标题、内容）
 *         schema:
 *           type: string
 *           example: "安全检查"
 *       - name: sortBy
 *         in: query
 *         required: false
 *         description: 排序字段
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title, deadline, completionRate]
 *           default: createdAt
 *       - name: sortOrder
 *         in: query
 *         required: false
 *         description: 排序方向
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: DESC
 *       - name: deadlineFrom
 *         in: query
 *         required: false
 *         description: 截止日期开始范围
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00Z"
 *       - name: deadlineTo
 *         in: query
 *         required: false
 *         description: 截止日期结束范围
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2024-12-31T23:59:59Z"
 *       - name: tags
 *         in: query
 *         required: false
 *         description: 标签过滤（逗号分隔）
 *         schema:
 *           type: string
 *           example: "安全,检查"
 *     responses:
 *       '200':
 *         description: 获取文档实例列表成功
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
 *                     instances:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DocumentInstance'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 20
 *                         total:
 *                           type: integer
 *                           example: 125
 *                         totalPages:
 *                           type: integer
 *                           example: 7
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalCount:
 *                           type: integer
 *                           example: 125
 *                         statusCounts:
 *                           type: object
 *                           example:
 *                             draft: 45
 *                             in_progress: 30
 *                             submitted: 15
 *                             approved: 25
 *                             rejected: 10
 *                         avgCompletionRate:
 *                           type: number
 *                           example: 78.5
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     summary: 创建文档实例
 *     tags:
 *       - 文档实例管理
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateId
 *               - title
 *             properties:
 *               templateId:
 *                 type: integer
 *                 description: 文档模板ID
 *                 example: 1
 *               inspectionTaskId:
 *                 type: integer
 *                 description: 检查任务ID（可选）
 *                 example: 1
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: 文档标题
 *                 example: "幼儿园月度安全检查记录表"
 *               content:
 *                 type: string
 *                 description: 文档内容（可选，从模板继承）
 *                 example: "安全检查的详细内容..."
 *               filledData:
 *                 type: object
 *                 description: 预填充的数据
 *                 example: {"检查日期": "2024-01-15", "检查人": "张老师"}
 *               status:
 *                 type: string
 *                 enum: [draft, in_progress]
 *                 description: 初始状态
 *                 default: draft
 *                 example: "draft"
 *               completionRate:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: 初始完成率
 *                 default: 0
 *                 example: 0
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 description: 截止日期
 *                 example: "2024-02-01T23:59:59Z"
 *               assignedTo:
 *                 type: integer
 *                 description: 分配给的用户ID（可选）
 *                 example: 2
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 标签列表
 *                 example: ["安全", "检查", "月度"]
 *               metadata:
 *                 type: object
 *                 description: 元数据
 *                 example: {"priority": "high", "category": "safety"}
 *     responses:
 *       '201':
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "文档实例创建成功"
 *                 data:
 *                   $ref: '#/components/schemas/DocumentInstance'
 *       '400':
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "文档模板不存在或标题不能为空"
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/', DocumentInstanceController.getInstances);
router.post('/', DocumentInstanceController.createInstance);

export default router;

