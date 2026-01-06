import { Router } from 'express';
import { DataImportController } from '../controllers/data-import.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { auditLogPresets } from '../middlewares/audit-log.middleware';

/**
* @swagger
 * components:
 *   schemas:
 *     Data-import:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Data-import ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Data-import 名称
 *           example: "示例Data-import"
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
 *     CreateData-importRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Data-import 名称
 *           example: "新Data-import"
 *     UpdateData-importRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Data-import 名称
 *           example: "更新后的Data-import"
 *     Data-importListResponse:
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
 *                 $ref: '#/components/schemas/Data-import'
 *         message:
 *           type: string
 *           example: "获取data-import列表成功"
 *     Data-importResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Data-import'
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
 * data-import管理路由文件
 * 提供data-import的基础CRUD操作
*
 * 功能包括：
 * - 获取data-import列表
 * - 创建新data-import
 * - 获取data-import详情
 * - 更新data-import信息
 * - 删除data-import
*
 * 权限要求：需要有效的JWT Token认证
*/
import {
  smartImportPermissionCheck,
  requireAnyImportPermission,
  importPermissionPresets
} from '../middlewares/data-import-permission.middleware';

/**
 * 数据导入路由配置
 * 提供完整的数据导入工作流API
*/

const router = Router();
const dataImportController = new DataImportController();

// 所有路由都需要认证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * tags:
 *   name: DataImport
 *   description: 数据导入管理接口
*/

/**
* @swagger
 * /api/data-import/check-permission:
 *   post:
 *     summary: 检查数据导入权限
 *     tags: [DataImport]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               importType:
 *                 type: string
 *                 enum: [student, parent, teacher]
 *                 description: 导入类型
 *             required:
 *               - importType
 *     responses:
 *       200:
 *         description: 权限检查成功
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
 *                     hasPermission:
 *                       type: boolean
 *                     importType:
 *                       type: string
 *                     userId:
 *                       type: number
 *                 message:
 *                   type: string
*/
router.post('/check-permission', dataImportController.checkPermission);

/**
* @swagger
 * /api/data-import/parse:
 *   post:
 *     summary: 解析上传的文档
 *     tags: [DataImport]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filePath:
 *                 type: string
 *                 description: 文件路径
 *               importType:
 *                 type: string
 *                 enum: [student, parent, teacher]
 *                 description: 导入类型
 *             required:
 *               - filePath
 *               - importType
 *     responses:
 *       200:
 *         description: 文档解析成功
*/
router.post('/parse', auditLogPresets.dataImport, dataImportController.parseDocument);

/**
* @swagger
 * /api/data-import/schema/{type}:
 *   get:
 *     summary: 获取数据库表结构
 *     tags: [DataImport]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [student, parent, teacher]
 *         description: 数据类型
 *     responses:
 *       200:
 *         description: 获取表结构成功
*/
router.get('/schema/:type', dataImportController.getSchema);

/**
* @swagger
 * /api/data-import/mapping:
 *   post:
 *     summary: 生成字段映射建议
 *     tags: [DataImport]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documentFields:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 文档字段列表
 *               importType:
 *                 type: string
 *                 enum: [student, parent, teacher]
 *                 description: 导入类型
 *             required:
 *               - documentFields
 *               - importType
 *     responses:
 *       200:
 *         description: 字段映射生成成功
*/
router.post('/mapping', auditLogPresets.dataImport, dataImportController.generateMapping);

/**
* @swagger
 * /api/data-import/preview:
 *   post:
 *     summary: 数据预览和验证
 *     tags: [DataImport]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: array
 *                 description: 待导入的数据
 *               fieldMappings:
 *                 type: array
 *                 description: 字段映射关系
 *               importType:
 *                 type: string
 *                 enum: [student, parent, teacher]
 *                 description: 导入类型
 *             required:
 *               - data
 *               - fieldMappings
 *               - importType
 *     responses:
 *       200:
 *         description: 数据预览生成成功
*/
router.post('/preview', auditLogPresets.dataImport, dataImportController.previewData);

/**
* @swagger
 * /api/data-import/execute:
 *   post:
 *     summary: 执行数据导入
 *     tags: [DataImport]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: array
 *                 description: 待导入的数据
 *               fieldMappings:
 *                 type: array
 *                 description: 字段映射关系
 *               importType:
 *                 type: string
 *                 enum: [student, parent, teacher]
 *                 description: 导入类型
 *             required:
 *               - data
 *               - fieldMappings
 *               - importType
 *     responses:
 *       200:
 *         description: 数据导入成功
 *       400:
 *         description: 数据验证失败
*/
router.post('/execute', auditLogPresets.dataImport, dataImportController.executeImport);

/**
* @swagger
 * /api/data-import/history:
 *   get:
 *     summary: 获取导入历史记录
 *     tags: [DataImport]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: importType
 *         schema:
 *           type: string
 *           enum: [student, parent, teacher]
 *         description: 导入类型过滤
 *     responses:
 *       200:
 *         description: 获取导入历史成功
*/
router.get('/history', requireAnyImportPermission, dataImportController.getImportHistory);

/**
* @swagger
 * /api/data-import/supported-types:
 *   get:
 *     summary: 获取支持的导入类型
 *     tags: [DataImport]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取支持的导入类型成功
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
 *                     supportedTypes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           hasPermission:
 *                             type: boolean
 *                           displayName:
 *                             type: string
 *                     allTypes:
 *                       type: array
 *                       items:
 *                         type: object
 *                 message:
 *                   type: string
*/
router.get('/supported-types', dataImportController.getSupportedTypes);

export default router;
