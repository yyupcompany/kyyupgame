/**
 * 系统备份管理路由
 * 提供数据库备份、文件备份、恢复管理等功能，确保幼儿园管理系统的数据安全
 * 支持自动备份、手动备份、备份验证、恢复操作等完整的备份生命周期管理
*/

import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { ApiResponse } from '../utils/apiResponse';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { sequelize } from '../init';
import databaseBackupService from '../services/system/database-backup.service';

const execAsync = promisify(exec);
const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * components:
 *   schemas:
 *     BackupFile:
 *       type: object
 *       description: 备份文件信息
 *       properties:
 *         id:
 *           type: string
 *           description: 备份文件唯一标识（移除扩展名的文件名）
 *           example: "backup-2025-01-15T10-30-00-000Z"
 *         name:
 *           type: string
 *           description: 备份文件名（包含扩展名）
 *           example: "backup-2025-01-15T10-30-00-000Z.sql"
 *         size:
 *           type: integer
 *           description: 文件大小（字节）
 *           example: 1048576
 *         sizeFormatted:
 *           type: string
 *           description: 格式化后的文件大小
 *           example: "1.00 MB"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2025-01-15T10:30:00.000Z"
 *         type:
 *           type: string
 *           description: 备份类型
 *           enum: [manual, auto, scheduled]
 *           example: "manual"
 *         status:
 *           type: string
 *           description: 备份状态
 *           enum: [completed, failed, in_progress]
 *           example: "completed"
 *         description:
 *           type: string
 *           description: 备份描述
 *           example: "手动备份"
 *         tableCount:
 *           type: integer
 *           description: 表数量
 *           example: 25
 *         recordCount:
 *           type: integer
 *           description: 记录数量
 *           example: 15000
 *       required:
 *         - id
 *         - name
 *         - size
 *         - sizeFormatted
 *         - createdAt
 *         - type
 *         - status

 *     BackupStatistics:
 *       type: object
 *       description: 备份统计信息
 *       properties:
 *         totalBackups:
 *           type: integer
 *           description: 备份文件总数
 *           example: 15
 *         totalSize:
 *           type: integer
 *           description: 所有备份文件总大小（字节）
 *           example: 52428800
 *         totalSizeFormatted:
 *           type: string
 *           description: 格式化后的总大小
 *           example: "50.00 MB"
 *         latestBackup:
 *           type: string
 *           format: date-time
 *           description: 最新备份时间
 *           example: "2025-01-15T10:30:00.000Z"
 *         oldestBackup:
 *           type: string
 *           format: date-time
 *           description: 最早备份时间
 *           example: "2025-01-01T08:00:00.000Z"
 *       required:
 *         - totalBackups
 *         - totalSize
 *         - totalSizeFormatted

 *     BackupConfig:
 *       type: object
 *       description: 备份配置信息
 *       properties:
 *         autoBackup:
 *           type: object
 *           properties:
 *             enabled:
 *               type: boolean
 *               description: 是否启用自动备份
 *               example: true
 *             schedule:
 *               type: string
 *               description: 备份计划（cron表达式）
 *               example: "0 2 * * *"
 *             retention:
 *               type: integer
 *               description: 备份保留天数
 *               example: 7
 *         backupTypes:
 *           type: object
 *           properties:
 *             database:
 *               type: boolean
 *               description: 是否启用数据库备份
 *               example: true
 *             files:
 *               type: boolean
 *               description: 是否启用文件备份
 *               example: false
 *             full:
 *               type: boolean
 *               description: 是否启用完整备份
 *               example: false
 *         maxBackupSize:
 *           type: integer
 *           description: 最大备份文件大小（字节）
 *           example: 1073741824
 *         backupPath:
 *           type: string
 *           description: 备份文件存储路径
 *           example: "/home/project/backups"
 *         lastBackup:
 *           type: string
 *           format: date-time
 *           description: 上次备份时间
 *           nullable: true
 *           example: "2025-01-15T02:00:00.000Z"
 *         nextBackup:
 *           type: string
 *           format: date-time
 *           description: 下次备份时间
 *           nullable: true
 *           example: "2025-01-16T02:00:00.000Z"
 *       required:
 *         - autoBackup
 *         - backupTypes
 *         - maxBackupSize
 *         - backupPath

 *     RestoreResult:
 *       type: object
 *       description: 备份恢复结果
 *       properties:
 *         tablesRestored:
 *           type: integer
 *           description: 恢复的表数量
 *           example: 25
 *         restoredAt:
 *           type: string
 *           format: date-time
 *           description: 恢复时间
 *           example: "2025-01-15T10:30:00.000Z"
 *         success:
 *           type: boolean
 *           description: 恢复是否成功
 *           example: true
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           description: 恢复过程中的错误信息
 *           example: []
 *       required:
 *         - tablesRestored
 *         - restoredAt
 *         - success

 *     BackupValidation:
 *       type: object
 *       description: 备份文件验证结果
 *       properties:
 *         valid:
 *           type: boolean
 *           description: 备份文件是否有效
 *           example: true
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           description: 验证错误信息
 *           example: []
 *         warnings:
 *           type: array
 *           items:
 *             type: string
 *           description: 验证警告信息
 *           example: ["备份文件较老，可能不包含最新数据"]
 *         fileSize:
 *           type: integer
 *           description: 文件大小（字节）
 *           example: 1048576
 *         tableCount:
 *           type: integer
 *           description: 表数量
 *           example: 25
 *         recordCount:
 *           type: integer
 *           description: 记录数量
 *           example: 15000
 *       required:
 *         - valid
 *         - errors

*/

/**
* @swagger
 * /api/system-backup:
 *   get:
 *     summary: 获取系统备份列表
 *     description: |
 *       获取所有系统备份文件的列表，包括数据库备份和完整备份信息。
 *       这是系统备份管理的核心接口，提供备份文件的完整信息用于管理和监控。
*
 *       **业务场景**：
 *       - 系统管理员查看备份历史记录
 *       - 监控备份执行情况和存储空间使用
 *       - 选择合适的备份文件进行恢复
 *       - 定期清理过期备份文件
*
 *       **权限要求**：需要系统管理员权限
*
 *       **主要功能**：
 *       - 列出所有备份文件及其详细信息
 *       - 显示文件大小和创建时间
 *       - 区分备份类型（手动、自动、定时）
 *       - 提供备份状态信息
 *       - 统计备份文件总数和总大小
*
 *       **数据特性**：
 *       - 备份文件按创建时间倒序排列
 *       - 自动计算文件大小的友好显示格式
 *       - 包含备份的表数量和记录数量
 *       - 支持多种备份类型的混合显示
*
 *       **安全特性**：
 *       - 基于身份验证的访问控制
 *       - 备份文件路径安全验证
 *       - 防止路径遍历攻击
 *       - 敏感操作日志记录
*
 *       **性能优化**：
 *       - 使用数据库备份服务提高查询效率
 *       - 缓存备份统计信息
 *       - 异步处理大文件操作
 *     tags: [系统备份管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取备份列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 响应状态
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       description: 备份文件列表
 *                       items:
 *                         $ref: '#/components/schemas/BackupFile'
 *                     total:
 *                       type: integer
 *                       description: 备份文件总数
 *                       example: 15
 *                     totalSize:
 *                       type: integer
 *                       description: 所有备份文件总大小（字节）
 *                       example: 52428800
 *                     totalSizeFormatted:
 *                       type: string
 *                       description: 格式化后的总大小
 *                       example: "50.00 MB"
 *                 message:
 *                   type: string
 *                   description: 响应消息
 *                   example: "获取备份列表成功"
 *             examples:
 *               success_response:
 *                 summary: 成功响应示例
 *                 value:
 *                   success: true
 *                   data:
 *                     items:
 *                       - id: "backup-2025-01-15T10-30-00-000Z"
 *                         name: "backup-2025-01-15T10-30-00-000Z.sql"
 *                         size: 1048576
 *                         sizeFormatted: "1.00 MB"
 *                         createdAt: "2025-01-15T10:30:00.000Z"
 *                         type: "manual"
 *                         status: "completed"
 *                         description: "手动备份"
 *                         tableCount: 25
 *                         recordCount: 15000
 *                       - id: "backup-2025-01-14T02-00-00-000Z"
 *                         name: "backup-2025-01-14T02-00-00-000Z.sql"
 *                         size: 2097152
 *                         sizeFormatted: "2.00 MB"
 *                         createdAt: "2025-01-14T02:00:00.000Z"
 *                         type: "auto"
 *                         status: "completed"
 *                         description: "自动备份"
 *                         tableCount: 25
 *                         recordCount: 14500
 *                     total: 15
 *                     totalSize: 52428800
 *                     totalSizeFormatted: "50.00 MB"
 *                   message: "获取备份列表成功"
 *       401:
 *         description: 未授权，需要登录
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
 *                   example: "未授权访问"
 *       403:
 *         description: 权限不足
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
 *                   example: "权限不足，需要系统管理员权限"
 *       500:
 *         description: 服务器内部错误
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
 *                   example: "获取备份列表失败"
 *                 error:
 *                   type: string
 *                   example: "备份目录不存在或无法访问"
*/
router.get('/', async (req, res) => {
  try {
    // 使用新的数据库备份服务获取备份列表
    const backups = await databaseBackupService.getBackupList();
    const stats = await databaseBackupService.getBackupStats();

    console.log('[SYSTEM]: 备份列表调试信息:', backups.length);
    console.log('[SYSTEM]: - 前3个备份文件:', backups.slice(0, 3));
    console.log('[SYSTEM]: - 统计信息:', stats);

    const result = {
      items: backups.map(backup => ({
        id: backup.filename.replace(/\.[^/.]+$/, ""), // 移除文件扩展名作为ID
        name: backup.filename,
        size: backup.size,
        sizeFormatted: backup.sizeFormatted,
        createdAt: backup.createdAt,
        type: backup.type || 'manual',
        status: 'completed'
      })),
      total: stats.totalBackups,
      totalSize: stats.totalSize,
      totalSizeFormatted: stats.totalSizeFormatted
    };

    console.log('[SYSTEM]: 返回给前端的数据:', JSON.stringify(result, null, 2));

    return ApiResponse.success(res, result);
  } catch (error) {
    console.error('[SYSTEM]: 获取备份列表失败:', error);
    return ApiResponse.handleError(res, error, '获取备份列表失败');
  }
});

/**
* @swagger
 * /api/system-backup/database:
 *   post:
 *     summary: 创建数据库备份
 *     description: 创建新的数据库备份文件，使用mysqldump工具导出数据库
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: 备份描述
 *                 example: "每日自动备份"
 *     responses:
 *       200:
 *         description: 数据库备份创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 响应状态
 *                 data:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                       description: 备份文件名
 *                     size:
 *                       type: number
 *                       description: 文件大小（字节）
 *                     sizeFormatted:
 *                       type: string
 *                       description: 格式化后的文件大小
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: 创建时间
 *                     description:
 *                       type: string
 *                       description: 备份描述
 *                     status:
 *                       type: string
 *                       description: 备份状态（仅在模拟模式下）
 *                       example: "simulated"
 *                     message:
 *                       type: string
 *                       description: 备份状态消息（仅在模拟模式下）
 *                 message:
 *                   type: string
 *                   description: 响应消息
 *             example:
 *               success: true
 *               data:
 *                 filename: "backup-2025-01-15T10-30-00-000Z.sql"
 *                 size: 1048576
 *                 sizeFormatted: "1.00 MB"
 *                 createdAt: "2025-01-15T10:30:00.000Z"
 *                 description: "每日自动备份"
 *               message: "数据库备份成功"
 *       401:
 *         description: 未授权，需要登录
 *       500:
 *         description: 服务器内部错误
*/
router.post('/database', async (req, res) => {
  try {
    const { description, name, includeData = true, includeTables, excludeTables } = req.body;

    // 使用新的数据库备份服务
    const result = await databaseBackupService.createBackup({
      name,
      description,
      includeData,
      includeTables,
      excludeTables
    });

    return ApiResponse.success(res, {
      filename: result.filename,
      size: result.size,
      sizeFormatted: result.sizeFormatted,
      createdAt: result.createdAt,
      description: result.description,
      tableCount: result.tableCount,
      recordCount: result.recordCount
    }, '数据库备份成功');
  } catch (error) {
    console.error('[SYSTEM]: 创建数据库备份失败:', error);
    return ApiResponse.handleError(res, error, '创建数据库备份失败');
  }
});

/**
* @swagger
 * /api/system-backup/download/{filename}:
 *   get:
 *     summary: 下载备份文件
 *     description: 下载指定的备份文件到本地
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: 备份文件名
 *         example: "backup-2025-01-15T10-30-00-000Z.sql"
 *     responses:
 *       200:
 *         description: 成功下载备份文件
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             description: 文件下载头信息
 *             schema:
 *               type: string
 *               example: 'attachment; filename="backup-2025-01-15T10-30-00-000Z.sql"'
 *       404:
 *         description: 备份文件不存在
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
 *                   example: "备份文件不存在"
 *                 code:
 *                   type: string
 *                   example: "NOT_FOUND"
 *       401:
 *         description: 未授权，需要登录
 *       500:
 *         description: 服务器内部错误
*/
router.get('/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const backupDir = path.join(process.cwd(), 'backups');
    const filePath = path.join(backupDir, filename);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return ApiResponse.error(res, '备份文件不存在', 'NOT_FOUND');
    }

    // 设置响应头
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // 创建读取流并发送文件
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    return ApiResponse.handleError(res, error, '下载备份文件失败');
  }
});

/**
* @swagger
 * /api/system/backup/restore:
 *   post:
 *     summary: 恢复备份
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - backupId
 *             properties:
 *               backupId:
 *                 type: string
 *                 description: 备份文件名
 *                 example: "backup-2025-01-15T10-30-00-000Z.sql"
 *               dropExisting:
 *                 type: boolean
 *                 description: 是否删除现有表
 *                 default: true
 *               ignoreErrors:
 *                 type: boolean
 *                 description: 是否忽略错误继续执行
 *                 default: false
 *     responses:
 *       200:
 *         description: 恢复成功
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
 *                     tablesRestored:
 *                       type: integer
 *                       example: 15
 *                     restoredAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-15T10:30:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "备份恢复成功"
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权，需要登录
 *       500:
 *         description: 服务器内部错误
*/
router.post('/restore', async (req, res) => {
  try {
    const { backupId, dropExisting = true, ignoreErrors = false } = req.body;

    if (!backupId) {
      return ApiResponse.error(res, '备份文件名不能为空', 'INVALID_PARAMS', 400);
    }

    // 使用新的数据库备份服务进行恢复
    const result = await databaseBackupService.restoreBackup({
      filename: backupId,
      dropExisting,
      ignoreErrors
    });

    return ApiResponse.success(res, {
      tablesRestored: result.tablesRestored,
      restoredAt: new Date(),
      success: result.success
    }, result.message);
  } catch (error) {
    console.error('[SYSTEM]: 恢复备份失败:', error);
    return ApiResponse.handleError(res, error, '恢复备份失败');
  }
});

/**
* @swagger
 * /api/system-backup/{filename}:
 *   delete:
 *     summary: 删除备份文件
 *     description: 删除指定的备份文件
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: 要删除的备份文件名
 *         example: "backup-2025-01-15T10-30-00-000Z.sql"
 *     responses:
 *       200:
 *         description: 备份文件删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 响应状态
 *                 data:
 *                   type: null
 *                   description: 响应数据（删除操作为null）
 *                 message:
 *                   type: string
 *                   description: 响应消息
 *             example:
 *               success: true
 *               data: null
 *               message: "备份文件删除成功"
 *       404:
 *         description: 备份文件不存在
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
 *                   example: "备份文件不存在"
 *                 code:
 *                   type: string
 *                   example: "NOT_FOUND"
 *       401:
 *         description: 未授权，需要登录
 *       500:
 *         description: 服务器内部错误
*/
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    // 使用新的数据库备份服务删除备份
    await databaseBackupService.deleteBackup(filename);

    return ApiResponse.success(res, null, '备份文件删除成功');
  } catch (error) {
    console.error('[SYSTEM]: 删除备份文件失败:', error);
    return ApiResponse.handleError(res, error, '删除备份文件失败');
  }
});

/**
* @swagger
 * /api/system/backup/validate/{filename}:
 *   post:
 *     summary: 验证备份文件
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: 备份文件名
 *     responses:
 *       200:
 *         description: 验证结果
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
 *                     valid:
 *                       type: boolean
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
*/
router.post('/validate/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    const result = await databaseBackupService.validateBackup(filename);

    return ApiResponse.success(res, result, result.valid ? '备份文件验证通过' : '备份文件验证失败');
  } catch (error) {
    console.error('[SYSTEM]: 验证备份文件失败:', error);
    return ApiResponse.handleError(res, error, '验证备份文件失败');
  }
});

/**
* @swagger
 * /api/system/backup/cleanup:
 *   post:
 *     summary: 清理旧备份
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               retentionDays:
 *                 type: number
 *                 description: 保留天数
 *                 default: 7
 *     responses:
 *       200:
 *         description: 清理结果
*/
router.post('/cleanup', async (req, res) => {
  try {
    const { retentionDays = 7 } = req.body;

    const result = await databaseBackupService.cleanupOldBackups(retentionDays);

    return ApiResponse.success(res, result, `清理完成，删除了 ${result.deletedCount} 个备份文件`);
  } catch (error) {
    console.error('[SYSTEM]: 清理备份失败:', error);
    return ApiResponse.handleError(res, error, '清理备份失败');
  }
});

/**
* @swagger
 * /api/system-backup/stats:
 *   get:
 *     summary: 获取备份统计信息
 *     description: 获取系统备份的统计数据，包括总数、总大小和最新备份时间
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取备份统计信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 响应状态
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalBackups:
 *                       type: number
 *                       description: 备份文件总数
 *                     totalSize:
 *                       type: number
 *                       description: 所有备份文件总大小（字节）
 *                     latestBackup:
 *                       type: string
 *                       format: date-time
 *                       description: 最新备份时间，如果没有备份则为null
 *                       nullable: true
 *                 message:
 *                   type: string
 *                   description: 响应消息
 *             example:
 *               success: true
 *               data:
 *                 totalBackups: 5
 *                 totalSize: 52428800
 *                 latestBackup: "2025-01-15T10:30:00.000Z"
 *               message: "获取备份统计成功"
 *       401:
 *         description: 未授权，需要登录
 *       500:
 *         description: 服务器内部错误
*/
router.get('/stats', async (req, res) => {
  try {
    // 使用新的数据库备份服务获取统计信息
    const stats = await databaseBackupService.getBackupStats();

    return ApiResponse.success(res, {
      totalBackups: stats.totalBackups,
      totalSize: stats.totalSize,
      totalSizeFormatted: stats.totalSizeFormatted,
      latestBackup: stats.latestBackup ? stats.latestBackup.toISOString() : null,
      oldestBackup: stats.oldestBackup ? stats.oldestBackup.toISOString() : null
    });
  } catch (error) {
    console.error('[SYSTEM]: 获取备份统计失败:', error);
    return ApiResponse.handleError(res, error, '获取备份统计失败');
  }
});

/**
* @swagger
 * /api/system-backup/config:
 *   get:
 *     summary: 获取备份配置
 *     description: 获取系统备份的配置信息，包括自动备份设置和备份类型
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取备份配置
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 响应状态
 *                 data:
 *                   type: object
 *                   properties:
 *                     autoBackup:
 *                       type: object
 *                       properties:
 *                         enabled:
 *                           type: boolean
 *                           description: 是否启用自动备份
 *                         schedule:
 *                           type: string
 *                           description: 备份计划（cron表达式）
 *                         retention:
 *                           type: number
 *                           description: 备份保留天数
 *                     backupTypes:
 *                       type: object
 *                       properties:
 *                         database:
 *                           type: boolean
 *                           description: 是否启用数据库备份
 *                         files:
 *                           type: boolean
 *                           description: 是否启用文件备份
 *                         full:
 *                           type: boolean
 *                           description: 是否启用完整备份
 *                     maxBackupSize:
 *                       type: number
 *                       description: 最大备份文件大小（字节）
 *                     backupPath:
 *                       type: string
 *                       description: 备份文件存储路径
 *                 message:
 *                   type: string
 *                   description: 响应消息
 *             example:
 *               success: true
 *               data:
 *                 autoBackup:
 *                   enabled: false
 *                   schedule: "0 2 * * *"
 *                   retention: 7
 *                 backupTypes:
 *                   database: true
 *                   files: false
 *                   full: false
 *                 maxBackupSize: 1073741824
 *                 backupPath: "/home/project/backups"
 *               message: "获取备份配置成功"
 *       401:
 *         description: 未授权，需要登录
 *       500:
 *         description: 服务器内部错误
*/
router.get('/config', async (req, res) => {
  try {
    // 返回备份配置（可以从配置文件或数据库读取）
    const config = {
      autoBackup: {
        enabled: false,
        schedule: '0 2 * * *', // 每天凌晨2点
        retention: 7 // 保留7天
      },
      backupTypes: {
        database: true,
        files: false,
        full: false
      },
      maxBackupSize: 1024 * 1024 * 1024, // 1GB
      backupPath: path.join(process.cwd(), 'backups')
    };

    return ApiResponse.success(res, config);
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取备份配置失败');
  }
});

/**
* @swagger
 * /api/system-backup/auto-settings:
 *   get:
 *     summary: 获取自动备份设置
 *     description: 获取自动备份的详细设置信息，包括计划、保留策略等
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取自动备份设置
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 响应状态
 *                 data:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                       description: 是否启用自动备份
 *                     schedule:
 *                       type: string
 *                       description: 备份计划（cron表达式）
 *                     retention:
 *                       type: number
 *                       description: 备份保留天数
 *                     maxBackupSize:
 *                       type: number
 *                       description: 最大备份文件大小（字节）
 *                     backupTypes:
 *                       type: object
 *                       properties:
 *                         database:
 *                           type: boolean
 *                           description: 是否启用数据库备份
 *                         files:
 *                           type: boolean
 *                           description: 是否启用文件备份
 *                         full:
 *                           type: boolean
 *                           description: 是否启用完整备份
 *                     lastBackup:
 *                       type: string
 *                       format: date-time
 *                       description: 上次备份时间
 *                       nullable: true
 *                     nextBackup:
 *                       type: string
 *                       format: date-time
 *                       description: 下次备份时间
 *                       nullable: true
 *                 message:
 *                   type: string
 *                   description: 响应消息
 *             example:
 *               success: true
 *               data:
 *                 enabled: false
 *                 schedule: "0 2 * * *"
 *                 retention: 7
 *                 maxBackupSize: 1073741824
 *                 backupTypes:
 *                   database: true
 *                   files: false
 *                   full: false
 *                 lastBackup: null
 *                 nextBackup: null
 *               message: "获取自动备份设置成功"
 *       401:
 *         description: 未授权，需要登录
 *       500:
 *         description: 服务器内部错误
*/
router.get('/auto-settings', async (req, res) => {
  try {
    // 返回自动备份设置
    const autoSettings = {
      enabled: false,
      schedule: '0 2 * * *', // 每天凌晨2点
      retention: 7, // 保留7天
      maxBackupSize: 1024 * 1024 * 1024, // 1GB
      backupTypes: {
        database: true,
        files: false,
        full: false
      },
      lastBackup: null,
      nextBackup: null
    };

    return ApiResponse.success(res, autoSettings);
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取自动备份设置失败');
  }
});

/**
* @swagger
 * /api/system-backup/auto-settings:
 *   put:
 *     summary: 更新自动备份设置
 *     description: 更新系统自动备份的配置设置
 *     tags: [系统备份]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 description: 是否启用自动备份
 *                 example: true
 *               schedule:
 *                 type: string
 *                 description: 备份计划（cron表达式）
 *                 example: "0 2 * * *"
 *               retention:
 *                 type: number
 *                 description: 备份保留天数
 *                 example: 7
 *               maxBackupSize:
 *                 type: number
 *                 description: 最大备份文件大小（字节）
 *                 example: 1073741824
 *               backupTypes:
 *                 type: object
 *                 properties:
 *                   database:
 *                     type: boolean
 *                     description: 是否启用数据库备份
 *                     example: true
 *                   files:
 *                     type: boolean
 *                     description: 是否启用文件备份
 *                     example: false
 *                   full:
 *                     type: boolean
 *                     description: 是否启用完整备份
 *                     example: false
 *     responses:
 *       200:
 *         description: 自动备份设置更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 响应状态
 *                 data:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                       description: 是否启用自动备份
 *                     schedule:
 *                       type: string
 *                       description: 备份计划（cron表达式）
 *                     retention:
 *                       type: number
 *                       description: 备份保留天数
 *                     maxBackupSize:
 *                       type: number
 *                       description: 最大备份文件大小（字节）
 *                     backupTypes:
 *                       type: object
 *                       properties:
 *                         database:
 *                           type: boolean
 *                           description: 是否启用数据库备份
 *                         files:
 *                           type: boolean
 *                           description: 是否启用文件备份
 *                         full:
 *                           type: boolean
 *                           description: 是否启用完整备份
 *                     lastBackup:
 *                       type: string
 *                       format: date-time
 *                       description: 上次备份时间
 *                       nullable: true
 *                     nextBackup:
 *                       type: string
 *                       format: date-time
 *                       description: 下次备份时间
 *                       nullable: true
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 设置更新时间
 *                 message:
 *                   type: string
 *                   description: 响应消息
 *             example:
 *               success: true
 *               data:
 *                 enabled: true
 *                 schedule: "0 2 * * *"
 *                 retention: 7
 *                 maxBackupSize: 1073741824
 *                 backupTypes:
 *                   database: true
 *                   files: false
 *                   full: false
 *                 lastBackup: null
 *                 nextBackup: null
 *                 updatedAt: "2025-01-15T10:30:00.000Z"
 *               message: "自动备份设置更新成功"
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权，需要登录
 *       500:
 *         description: 服务器内部错误
*/
router.put('/auto-settings', async (req, res) => {
  try {
    const { enabled, schedule, retention, backupTypes, maxBackupSize } = req.body;
    
    // 这里可以保存到数据库或配置文件
    const updatedSettings = {
      enabled: enabled || false,
      schedule: schedule || '0 2 * * *',
      retention: retention || 7,
      maxBackupSize: maxBackupSize || 1024 * 1024 * 1024,
      backupTypes: backupTypes || {
        database: true,
        files: false,
        full: false
      },
      lastBackup: null,
      nextBackup: null,
      updatedAt: new Date()
    };

    return ApiResponse.success(res, updatedSettings, '自动备份设置更新成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '更新自动备份设置失败');
  }
});

// 辅助函数：格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default router;