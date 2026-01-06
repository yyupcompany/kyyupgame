/**
* @swagger
 * components:
 *   schemas:
 *     Task-attachment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Task-attachment ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Task-attachment 名称
 *           example: "示例Task-attachment"
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
 *     CreateTask-attachmentRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Task-attachment 名称
 *           example: "新Task-attachment"
 *     UpdateTask-attachmentRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Task-attachment 名称
 *           example: "更新后的Task-attachment"
 *     Task-attachmentListResponse:
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
 *                 $ref: '#/components/schemas/Task-attachment'
 *         message:
 *           type: string
 *           example: "获取task-attachment列表成功"
 *     Task-attachmentResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Task-attachment'
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
 * task-attachment管理路由文件
 * 提供task-attachment的基础CRUD操作
*
 * 功能包括：
 * - 获取task-attachment列表
 * - 创建新task-attachment
 * - 获取task-attachment详情
 * - 更新task-attachment信息
 * - 删除task-attachment
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { TaskAttachmentController } from '../controllers/task-attachment.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/tasks');
    
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `task-${uniqueSuffix}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 允许的文件类型
  const allowedMimes = [
    // 图片
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // 文档
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    // 视频
    'video/mp4',
    'video/avi',
    'video/quicktime',
    'video/x-msvideo'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'));
  }
};

// 文件大小限制
const limits = {
  fileSize: 100 * 1024 * 1024 // 100MB
};

const upload = multer({
  storage,
  fileFilter,
  limits
});

// 任务附件路由

/**
* @swagger
 * /tasks/{taskId}/attachments:
 *   get:
 *     summary: 获取任务的所有附件
 *     description: 获取指定任务的所有附件列表和基本信息
 *     tags: [任务附件]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 任务ID
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
 *       - in: query
 *         name: fileType
 *         schema:
 *           type: string
 *           enum: [image, document, video, audio, all]
 *           default: all
 *         description: 文件类型筛选
 *     responses:
 *       200:
 *         description: 获取附件列表成功
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
 *                     total:
 *                       type: integer
 *                       description: 总附件数
 *                     totalSize:
 *                       type: number
 *                       description: 总文件大小(字节)
 *                     attachments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           filename:
 *                             type: string
 *                           originalName:
 *                             type: string
 *                           mimeType:
 *                             type: string
 *                           size:
 *                             type: number
 *                           uploadTime:
 *                             type: string
 *                           uploadedBy:
 *                             type: string
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限访问任务
 *       404:
 *         description: 任务不存在
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/tasks/:taskId/attachments',
  TaskAttachmentController.getTaskAttachments
);

/**
* @swagger
 * /tasks/{taskId}/attachments:
 *   post:
 *     summary: 上传任务附件
 *     description: 为指定任务上传单个附件文件
 *     tags: [任务附件]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 要上传的文件 (支持图片、文档、视频，最大100MB)
 *               description:
 *                 type: string
 *                 description: 文件描述 (可选)
 *               category:
 *                 type: string
 *                 description: 文件分类 (可选)
 *     responses:
 *       200:
 *         description: 上传成功
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
 *                   example: "文件上传成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     attachmentId:
 *                       type: integer
 *                       description: 附件ID
 *                     filename:
 *                       type: string
 *                       description: 文件名
 *                     size:
 *                       type: number
 *                       description: 文件大小
 *                     uploadTime:
 *                       type: string
 *                       description: 上传时间
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限操作任务
 *       404:
 *         description: 任务不存在
 *       400:
 *         description: 文件格式不支持或文件过大
 *       500:
 *         description: 服务器错误或上传失败
*/
router.post(
  '/tasks/:taskId/attachments',
  upload.single('file'),
  TaskAttachmentController.uploadTaskAttachment
);

/**
* @swagger
 * /tasks/{taskId}/attachments/batch:
 *   post:
 *     summary: 批量上传任务附件
 *     description: 为指定任务批量上传多个附件文件
 *     tags: [任务附件]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 要上传的文件列表 (最多10个文件)
 *               description:
 *                 type: string
 *                 description: 批量描述 (可选)
 *     responses:
 *       200:
 *         description: 批量上传完成
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
 *                   example: "批量上传完成"
 *                 data:
 *                   type: object
 *                   properties:
 *                     uploaded:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           attachmentId:
 *                             type: integer
 *                           filename:
 *                             type: string
 *                           size:
 *                             type: number
 *                           status:
 *                             type: string
 *                       description: 成功上传的文件
 *                     failed:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           filename:
 *                             type: string
 *                           error:
 *                             type: string
 *                       description: 上传失败的文件
 *                     totalUploaded:
 *                       type: integer
 *                       description: 成功上传数量
 *                     totalFailed:
 *                       type: integer
 *                       description: 失败数量
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限操作任务
 *       404:
 *         description: 任务不存在
 *       400:
 *         description: 文件数量超出限制或格式不支持
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/tasks/:taskId/attachments/batch',
  upload.array('files', 10),
  TaskAttachmentController.batchUploadTaskAttachments
);

/**
* @swagger
 * /tasks/{taskId}/attachments/{attachmentId}:
 *   delete:
 *     summary: 删除任务附件
 *     description: 删除指定任务的特定附件文件
 *     tags: [任务附件]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 任务ID
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 附件ID
 *     responses:
 *       200:
 *         description: 删除成功
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
 *                   example: "附件删除成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedAttachmentId:
 *                       type: integer
 *                       description: 被删除的附件ID
 *                     filename:
 *                       type: string
 *                       description: 被删除的文件名
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限删除附件
 *       404:
 *         description: 任务或附件不存在
 *       500:
 *         description: 服务器错误或删除失败
*/
router.delete(
  '/tasks/:taskId/attachments/:attachmentId',
  TaskAttachmentController.deleteTaskAttachment
);

/**
* @swagger
 * /tasks/{taskId}/attachments/{attachmentId}/download:
 *   get:
 *     summary: 下载任务附件
 *     description: 下载指定任务的特定附件文件
 *     tags: [任务附件]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 任务ID
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 附件ID
 *       - in: query
 *         name: inline
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否以内联方式打开 (图片等)
 *     responses:
 *       200:
 *         description: 文件下载
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             description: 文件下载头信息
 *           Content-Type:
 *             description: 文件MIME类型
 *           Content-Length:
 *             description: 文件大小
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限访问附件
 *       404:
 *         description: 任务或附件不存在或文件已丢失
 *       500:
 *         description: 服务器错误或下载失败
*/
router.get(
  '/tasks/:taskId/attachments/:attachmentId/download',
  TaskAttachmentController.downloadTaskAttachment
);

export default router;

