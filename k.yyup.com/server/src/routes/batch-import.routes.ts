/**
 * 批量导入路由
*/

import express from 'express';
import multer from 'multer';
import { batchImportController } from '../controllers/batch-import.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = express.Router();

/**
* @swagger
 * tags:
 *   - name: "批量导入服务"
 *     description: "幼儿园管理系统批量数据导入接口"
*/

/**
* @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     ImportError:
 *       type: object
 *       properties:
 *         row:
 *           type: integer
 *           description: "错误行号"
 *           example: 5
 *         field:
 *           type: string
 *           description: "错误字段"
 *           example: "phone"
 *         value:
 *           type: string
 *           description: "错误值"
 *           example: "123456"
 *         message:
 *           type: string
 *           description: "错误信息"
 *           example: "手机号格式不正确"
 *     ImportPreview:
 *       type: object
 *       properties:
 *         totalRows:
 *           type: integer
 *           description: "总行数"
 *           example: 100
 *         validRows:
 *           type: integer
 *           description: "有效行数"
 *           example: 95
 *         invalidRows:
 *           type: integer
 *           description: "无效行数"
 *           example: 5
 *         errors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ImportError'
 *           description: "错误列表"
 *         columns:
 *           type: array
 *           items:
 *             type: string
 *           description: "列名列表"
 *           example: ["姓名", "性别", "年龄", "联系电话"]
 *         sampleData:
 *           type: array
 *           items:
 *             type: object
 *           description: "示例数据（前5行）"
*/

// 配置multer（内存存储）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));

    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 .xlsx, .xls, .csv 格式的文件'));
    }
  }
});

/**
* @swagger
 * /api/batch-import/preview:
 *   post:
 *     tags: [批量导入服务]
 *     summary: "上传并预览导入文件"
 *     description: "上传Excel或CSV文件，预览导入数据并验证格式"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - entityType
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: "导入文件（支持.xlsx, .xls, .csv格式，最大10MB）"
 *               entityType:
 *                 type: string
 *                 enum: [students, teachers, parents, customers, activities]
 *                 description: "导入实体类型"
 *                 example: "students"
 *               options:
 *                 type: object
 *                 properties:
 *                   skipHeader:
 *                     type: boolean
 *                     description: "是否跳过表头"
 *                     default: true
 *                   encoding:
 *                     type: string
 *                     enum: [utf-8, gbk]
 *                     description: "文件编码"
 *                     default: "utf-8"
 *     responses:
 *       200:
 *         description: "预览成功"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ImportPreview'
 *       400:
 *         description: "请求参数错误"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "不支持的文件格式"
 *       401:
 *         description: "未授权访问"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "未授权访问"
 *       413:
 *         description: "文件过大"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "文件大小不能超过10MB"
*/
router.post(
  '/preview',
  verifyToken,
  upload.single('file'),
  batchImportController.previewImport.bind(batchImportController)
);

/**
* @swagger
 * /api/batch-import/customer-preview:
 *   post:
 *     tags: [批量导入服务]
 *     summary: "客户导入预览（AI识别字段映射）"
 *     description: "使用AI智能识别客户导入文件的字段映射关系"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: "客户数据文件（支持.xlsx, .xls, .csv格式）"
 *               autoMapping:
 *                 type: boolean
 *                 description: "是否启用AI自动字段映射"
 *                 default: true
 *     responses:
 *       200:
 *         description: "AI字段映射成功"
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
 *                     mapping:
 *                       type: object
 *                       description: "AI识别的字段映射关系"
 *                       example:
 *                         name: "customer_name"
 *                         phone: "contact_phone"
 *                         address: "home_address"
 *                     confidence:
 *                       type: number
 *                       description: "映射置信度"
 *                       example: 0.85
 *                     preview:
 *                       $ref: '#/components/schemas/ImportPreview'
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: "AI优化建议"
 *                       example: ["建议添加'客户类型'字段", "建议检查手机号格式"]
 *       500:
 *         description: "AI处理失败"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "AI字段识别失败"
*/
router.post(
  '/customer-preview',
  verifyToken,
  upload.single('file'),
  batchImportController.previewCustomerImport.bind(batchImportController)
);

/**
* @swagger
 * /api/batch-import/execute:
 *   post:
 *     tags: [批量导入服务]
 *     summary: "执行批量导入"
 *     description: "执行批量数据导入操作"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entityType
 *               - data
 *             properties:
 *               entityType:
 *                 type: string
 *                 enum: [students, teachers, parents, customers, activities]
 *                 description: "导入实体类型"
 *                 example: "students"
 *               data:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: "导入数据列表"
 *                 example:
 *                   - name: "张三"
 *                     gender: "男"
 *                     age: 5
 *               options:
 *                 type: object
 *                 properties:
 *                   skipDuplicates:
 *                     type: boolean
 *                     description: "是否跳过重复数据"
 *                     default: true
 *                   updateExisting:
 *                     type: boolean
 *                     description: "是否更新已存在的数据"
 *                     default: false
 *                   batchSize:
 *                     type: integer
 *                     description: "批处理大小"
 *                     default: 100
 *                     minimum: 10
 *                     maximum: 1000
 *     responses:
 *       200:
 *         description: "导入执行成功"
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
 *                     totalProcessed:
 *                       type: integer
 *                       description: "总处理数"
 *                       example: 100
 *                     successCount:
 *                       type: integer
 *                       description: "成功导入数"
 *                       example: 95
 *                     failureCount:
 *                       type: integer
 *                       description: "导入失败数"
 *                       example: 5
 *                     duplicateCount:
 *                       type: integer
 *                       description: "重复数据数"
 *                       example: 3
 *                     errors:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ImportError'
 *                       description: "详细错误信息"
 *                     importId:
 *                       type: string
 *                       description: "导入任务ID"
 *                       example: "import_20240115_001"
 *       400:
 *         description: "请求参数错误"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "导入数据不能为空"
*/
router.post(
  '/execute',
  verifyToken,
  batchImportController.executeImport.bind(batchImportController)
);

/**
* @swagger
 * /api/batch-import/template/{entityType}:
 *   get:
 *     tags: [批量导入服务]
 *     summary: "下载导入模板"
 *     description: "下载指定类型的标准导入模板文件"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [students, teachers, parents, customers, activities]
 *         description: "实体类型"
 *         example: "students"
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [xlsx, csv]
 *           default: "xlsx"
 *         description: "模板格式"
 *         example: "xlsx"
 *     responses:
 *       200:
 *         description: "模板下载成功"
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: "模板不存在"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "该实体类型的模板不存在"
*/
router.get(
  '/template/:entityType',
  verifyToken,
  batchImportController.downloadTemplate.bind(batchImportController)
);

export default router;

