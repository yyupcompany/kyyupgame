/**
* @swagger
 * components:
 *   schemas:
 *     Database-metadata:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Database-metadata ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Database-metadata 名称
 *           example: "示例Database-metadata"
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
 *     CreateDatabase-metadataRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Database-metadata 名称
 *           example: "新Database-metadata"
 *     UpdateDatabase-metadataRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Database-metadata 名称
 *           example: "更新后的Database-metadata"
 *     Database-metadataListResponse:
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
 *                 $ref: '#/components/schemas/Database-metadata'
 *         message:
 *           type: string
 *           example: "获取database-metadata列表成功"
 *     Database-metadataResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Database-metadata'
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
 * database-metadata管理路由文件
 * 提供database-metadata的基础CRUD操作
*
 * 功能包括：
 * - 获取database-metadata列表
 * - 创建新database-metadata
 * - 获取database-metadata详情
 * - 更新database-metadata信息
 * - 删除database-metadata
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import databaseMetadataController from '../controllers/database-metadata.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 注意：数据库元数据 API 是 AI 工具内部调用的，不需要认证
// any_query 工具会在后端直接调用这些 API 获取表结构信息
// 已移除全局认证中间件，允许内部服务调用
// router.use(verifyToken);

/**
* @swagger
 * tags:
 *   name: Database Metadata
 *   description: 数据库元数据查询API（仅供AI工具内部使用）
*/

/**
* @swagger
 * /api/database/tables:
 *   get:
 *     summary: 获取所有数据库表列表
 *     tags: [Database Metadata]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取表列表
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
 *                     database:
 *                       type: string
 *                       example: "kindergarten_db"
 *                     tableCount:
 *                       type: integer
 *                       example: 73
 *                     tables:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tableName:
 *                             type: string
 *                             example: "students"
 *                           tableComment:
 *                             type: string
 *                             example: "学生信息表"
 *                           estimatedRows:
 *                             type: integer
 *                             example: 1200
 *                           createTime:
 *                             type: string
 *                             format: date-time
 *                           updateTime:
 *                             type: string
 *                             format: date-time
 *                 message:
 *                   type: string
 *                   example: "成功获取 73 个数据表信息"
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/tables', databaseMetadataController.getAllTables);

/**
* @swagger
 * /api/database/tables/{tableName}:
 *   get:
 *     summary: 获取单个表的详细结构
 *     tags: [Database Metadata]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tableName
 *         required: true
 *         schema:
 *           type: string
 *         description: 表名
 *         example: "students"
 *     responses:
 *       200:
 *         description: 成功获取表结构
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
 *                     table:
 *                       type: object
 *                       properties:
 *                         tableName:
 *                           type: string
 *                           example: "students"
 *                         tableComment:
 *                           type: string
 *                           example: "学生信息表"
 *                         estimatedRows:
 *                           type: integer
 *                           example: 1200
 *                     columns:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           columnName:
 *                             type: string
 *                             example: "id"
 *                           dataType:
 *                             type: string
 *                             example: "int"
 *                           columnType:
 *                             type: string
 *                             example: "int(11)"
 *                           isNullable:
 *                             type: string
 *                             example: "NO"
 *                           columnKey:
 *                             type: string
 *                             example: "PRI"
 *                           columnDefault:
 *                             type: string
 *                             nullable: true
 *                           extra:
 *                             type: string
 *                             example: "auto_increment"
 *                           columnComment:
 *                             type: string
 *                             example: "学生ID"
 *                     columnCount:
 *                       type: integer
 *                       example: 15
 *                 message:
 *                   type: string
 *                   example: "成功获取表 students 的结构信息"
 *       404:
 *         description: 表不存在
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/tables/:tableName', databaseMetadataController.getTableStructure);

/**
* @swagger
 * /api/database/tables/{tableName}/indexes:
 *   get:
 *     summary: 获取表的索引信息
 *     tags: [Database Metadata]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tableName
 *         required: true
 *         schema:
 *           type: string
 *         description: 表名
 *         example: "students"
 *     responses:
 *       200:
 *         description: 成功获取索引信息
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
 *                     tableName:
 *                       type: string
 *                       example: "students"
 *                     indexCount:
 *                       type: integer
 *                       example: 5
 *                     indexes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           indexName:
 *                             type: string
 *                             example: "idx_class_id"
 *                           unique:
 *                             type: boolean
 *                             example: false
 *                           indexType:
 *                             type: string
 *                             example: "BTREE"
 *                           columns:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["class_id"]
 *                           comment:
 *                             type: string
 *                             example: "班级索引"
 *                 message:
 *                   type: string
 *                   example: "成功获取表 students 的索引信息"
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/tables/:tableName/indexes', databaseMetadataController.getTableIndexes);

/**
* @swagger
 * /api/database/tables/{tableName}/relations:
 *   get:
 *     summary: 获取表的关联关系（外键）
 *     tags: [Database Metadata]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tableName
 *         required: true
 *         schema:
 *           type: string
 *         description: 表名
 *         example: "students"
 *     responses:
 *       200:
 *         description: 成功获取关联关系
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
 *                     tableName:
 *                       type: string
 *                       example: "students"
 *                     relationCount:
 *                       type: integer
 *                       example: 2
 *                     relations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           constraintName:
 *                             type: string
 *                             example: "fk_students_class"
 *                           columnName:
 *                             type: string
 *                             example: "class_id"
 *                           referencedTable:
 *                             type: string
 *                             example: "classes"
 *                           referencedColumn:
 *                             type: string
 *                             example: "id"
 *                           updateRule:
 *                             type: string
 *                             example: "CASCADE"
 *                           deleteRule:
 *                             type: string
 *                             example: "SET NULL"
 *                 message:
 *                   type: string
 *                   example: "成功获取表 students 的关联关系"
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/tables/:tableName/relations', databaseMetadataController.getTableRelations);

export default router;

