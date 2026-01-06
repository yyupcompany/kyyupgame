"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var database_metadata_controller_1 = __importDefault(require("../controllers/database-metadata.controller"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
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
router.get('/tables', auth_middleware_1.authenticate, database_metadata_controller_1["default"].getAllTables);
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
router.get('/tables/:tableName', auth_middleware_1.authenticate, database_metadata_controller_1["default"].getTableStructure);
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
router.get('/tables/:tableName/indexes', auth_middleware_1.authenticate, database_metadata_controller_1["default"].getTableIndexes);
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
router.get('/tables/:tableName/relations', auth_middleware_1.authenticate, database_metadata_controller_1["default"].getTableRelations);
exports["default"] = router;
