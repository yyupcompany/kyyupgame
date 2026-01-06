"use strict";
exports.__esModule = true;
var express_1 = require("express");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var file_controller_1 = require("../controllers/file.controller");
var router = (0, express_1.Router)();
var fileController = new file_controller_1.FileController();
/**
 * @swagger
 * components:
 *   schemas:
 *     File:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 文件ID
 *         filename:
 *           type: string
 *           description: 文件名
 *         original_filename:
 *           type: string
 *           description: 原始文件名
 *         file_path:
 *           type: string
 *           description: 文件路径
 *         file_size:
 *           type: integer
 *           description: 文件大小(字节)
 *         mime_type:
 *           type: string
 *           description: 文件MIME类型
 *         description:
 *           type: string
 *           description: 文件描述
 *         category:
 *           type: string
 *           description: 文件分类
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: 文件标签
 *         is_public:
 *           type: boolean
 *           description: 是否公开
 *         download_count:
 *           type: integer
 *           description: 下载次数
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: 当前页码
 *         limit:
 *           type: integer
 *           description: 每页数量
 *         total:
 *           type: integer
 *           description: 总记录数
 *         total_pages:
 *           type: integer
 *           description: 总页数
 *
 *     Error:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *           description: 错误代码
 *         message:
 *           type: string
 *           description: 错误信息
 *         details:
 *           type: string
 *           description: 错误详情
 *
 *   tags:
 *     - name: Files
 *       description: 文件管理API
 */
/**
 * @swagger
 * /api/files:
 *   get:
 *     summary: 获取文件列表
 *     description: 获取当前用户上传的文件列表，支持分页和过滤
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: 文件类型过滤
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 文件名搜索关键字
 *     responses:
 *       200:
 *         description: 成功获取文件列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取文件列表成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     files:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/File'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', auth_middleware_1.verifyToken, fileController.getFileList);
/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: 单文件上传
 *     description: 上传单个文件到服务器
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
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
 *                 description: 要上传的文件
 *               description:
 *                 type: string
 *                 description: 文件描述
 *               category:
 *                 type: string
 *                 description: 文件分类
 *             required:
 *               - file
 *     responses:
 *       200:
 *         description: 文件上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 文件上传成功
 *                 data:
 *                   $ref: '#/components/schemas/File'
 *       400:
 *         description: 请求参数错误或文件格式不支持
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       413:
 *         description: 文件大小超出限制
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/upload', auth_middleware_1.verifyToken, file_controller_1.uploadFileMiddleware.single('file'), fileController.uploadFile);
/**
 * @swagger
 * /api/files/upload-multiple:
 *   post:
 *     summary: 多文件上传
 *     description: 一次上传多个文件（最多5个）
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
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
 *                 maxItems: 5
 *                 description: 要上传的文件数组（最多5个）
 *               description:
 *                 type: string
 *                 description: 批量文件描述
 *               category:
 *                 type: string
 *                 description: 文件分类
 *             required:
 *               - files
 *     responses:
 *       200:
 *         description: 多文件上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 多文件上传成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     uploaded_files:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/File'
 *                     failed_files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           filename:
 *                             type: string
 *                           error:
 *                             type: string
 *       400:
 *         description: 请求参数错误或文件数量超出限制
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/upload-multiple', auth_middleware_1.verifyToken, file_controller_1.uploadFileMiddleware.array('files', 5), fileController.uploadMultipleFiles);
/**
 * @swagger
 * /api/files/statistics:
 *   get:
 *     summary: 获取文件统计信息
 *     description: 获取用户文件的统计数据，包括总数、大小、类型分布等
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取文件统计信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取文件统计成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_files:
 *                       type: integer
 *                       description: 总文件数
 *                     total_size:
 *                       type: integer
 *                       description: 总文件大小（字节）
 *                     file_types:
 *                       type: object
 *                       description: 文件类型分布
 *                       additionalProperties:
 *                         type: integer
 *                     upload_trend:
 *                       type: array
 *                       description: 最近7天上传趋势
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           count:
 *                             type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/statistics', auth_middleware_1.verifyToken, fileController.getFileStatistics);
/**
 * @swagger
 * /api/files/storage-info:
 *   get:
 *     summary: 获取存储空间信息
 *     description: 获取用户当前存储空间使用情况和限制信息
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取存储空间信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取存储信息成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     used_space:
 *                       type: integer
 *                       description: 已使用空间（字节）
 *                     total_space:
 *                       type: integer
 *                       description: 总空间限制（字节）
 *                     remaining_space:
 *                       type: integer
 *                       description: 剩余空间（字节）
 *                     usage_percentage:
 *                       type: number
 *                       format: float
 *                       description: 使用率百分比
 *                     file_count:
 *                       type: integer
 *                       description: 文件总数
 *                     max_file_size:
 *                       type: integer
 *                       description: 单文件大小限制（字节）
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/storage-info', auth_middleware_1.verifyToken, fileController.getStorageInfo);
/**
 * @swagger
 * /api/files/cleanup-temp:
 *   post:
 *     summary: 清理临时文件
 *     description: 清理系统中的临时文件和无效引用
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               older_than_hours:
 *                 type: integer
 *                 minimum: 1
 *                 default: 24
 *                 description: 清理超过指定小时数的临时文件
 *               force:
 *                 type: boolean
 *                 default: false
 *                 description: 强制清理所有临时文件
 *     responses:
 *       200:
 *         description: 清理操作完成
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 临时文件清理完成
 *                 data:
 *                   type: object
 *                   properties:
 *                     cleaned_files:
 *                       type: integer
 *                       description: 清理的文件数量
 *                     freed_space:
 *                       type: integer
 *                       description: 释放的空间大小（字节）
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/cleanup-temp', auth_middleware_1.verifyToken, fileController.cleanupTempFiles);
/**
 * @swagger
 * /api/files/download/{id}:
 *   get:
 *     summary: 下载文件
 *     description: 通过文件ID下载文件
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文件ID
 *       - in: query
 *         name: inline
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否在浏览器中内联显示（适用于图片、PDF等）
 *     responses:
 *       200:
 *         description: 文件下载成功
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             description: 文件下载头信息
 *             schema:
 *               type: string
 *           Content-Length:
 *             description: 文件大小
 *             schema:
 *               type: integer
 *           Content-Type:
 *             description: 文件MIME类型
 *             schema:
 *               type: string
 *       404:
 *         description: 文件不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 无权限访问该文件
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/download/:id', auth_middleware_1.verifyToken, fileController.downloadFile);
/**
 * @swagger
 * /api/files/{id}:
 *   get:
 *     summary: 获取文件详情
 *     description: 根据文件ID获取文件的详细信息
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文件ID
 *     responses:
 *       200:
 *         description: 成功获取文件详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取文件详情成功
 *                 data:
 *                   $ref: '#/components/schemas/File'
 *       404:
 *         description: 文件不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 无权限访问该文件
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   put:
 *     summary: 更新文件信息
 *     description: 更新文件的元数据信息（如名称、描述等）
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文件ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *                 description: 新的文件名
 *               description:
 *                 type: string
 *                 description: 文件描述
 *               category:
 *                 type: string
 *                 description: 文件分类
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 文件标签
 *               is_public:
 *                 type: boolean
 *                 description: 是否公开
 *     responses:
 *       200:
 *         description: 文件信息更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 文件信息更新成功
 *                 data:
 *                   $ref: '#/components/schemas/File'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 文件不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 无权限修改该文件
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   delete:
 *     summary: 删除文件
 *     description: 删除指定的文件（包括物理文件和数据库记录）
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文件ID
 *       - in: query
 *         name: force
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 强制删除（即使物理文件不存在）
 *     responses:
 *       200:
 *         description: 文件删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 文件删除成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     deleted_file_id:
 *                       type: integer
 *                     freed_space:
 *                       type: integer
 *                       description: 释放的空间大小（字节）
 *       404:
 *         description: 文件不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 无权限删除该文件
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', auth_middleware_1.verifyToken, fileController.getFileById);
/**
 * @swagger
 * /api/files/{id}:
 *   put:
 *     summary: 更新文件信息
 *     description: 更新指定ID的文件元信息
 *     tags: [File Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 文件ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileName:
 *                 type: string
 *                 description: 文件名
 *               description:
 *                 type: string
 *                 description: 文件描述
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 文件标签
 *     responses:
 *       200:
 *         description: 文件信息更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', auth_middleware_1.verifyToken, fileController.updateFile);
router["delete"]('/:id', auth_middleware_1.verifyToken, fileController.deleteFile);
exports["default"] = router;
