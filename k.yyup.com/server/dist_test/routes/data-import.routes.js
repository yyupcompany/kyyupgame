"use strict";
exports.__esModule = true;
var express_1 = require("express");
var data_import_controller_1 = require("../controllers/data-import.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var audit_log_middleware_1 = require("../middlewares/audit-log.middleware");
var data_import_permission_middleware_1 = require("../middlewares/data-import-permission.middleware");
/**
 * 数据导入路由配置
 * 提供完整的数据导入工作流API
 */
var router = (0, express_1.Router)();
var dataImportController = new data_import_controller_1.DataImportController();
// 所有路由都需要认证
router.use(auth_middleware_1.verifyToken);
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
router.post('/parse', audit_log_middleware_1.auditLogPresets.dataImport, dataImportController.parseDocument);
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
router.post('/mapping', audit_log_middleware_1.auditLogPresets.dataImport, dataImportController.generateMapping);
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
router.post('/preview', audit_log_middleware_1.auditLogPresets.dataImport, dataImportController.previewData);
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
router.post('/execute', audit_log_middleware_1.auditLogPresets.dataImport, dataImportController.executeImport);
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
router.get('/history', data_import_permission_middleware_1.requireAnyImportPermission, dataImportController.getImportHistory);
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
exports["default"] = router;
