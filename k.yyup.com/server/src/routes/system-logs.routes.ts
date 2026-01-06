import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { ApiResponse } from '../utils/apiResponse';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../init';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * components:
 *   schemas:
 *     SystemLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 系统日志ID
 *         level:
 *           type: string
 *           enum: [info, warn, error, debug]
 *           description: 日志级别
 *         message:
 *           type: string
 *           description: 日志消息内容
 *         module:
 *           type: string
 *           description: 模块名称
 *         user_id:
 *           type: integer
 *           nullable: true
 *           description: 用户ID
 *         ip:
 *           type: string
 *           nullable: true
 *           description: IP地址
 *         user_agent:
 *           type: string
 *           nullable: true
 *           description: 用户代理
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *     SystemLogCreate:
 *       type: object
 *       required:
 *         - level
 *         - message
 *       properties:
 *         level:
 *           type: string
 *           enum: [info, warn, error, debug]
 *           description: 日志级别
 *         message:
 *           type: string
 *           description: 日志消息内容
 *         module:
 *           type: string
 *           description: 模块名称
 *         userId:
 *           type: integer
 *           description: 用户ID
 *         ip:
 *           type: string
 *           description: IP地址
 *         userAgent:
 *           type: string
 *           description: 用户代理
 *     OperationLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 操作日志ID
 *         action:
 *           type: string
 *           description: 操作类型
 *         resource:
 *           type: string
 *           description: 操作资源
 *         user_id:
 *           type: integer
 *           description: 操作用户ID
 *         details:
 *           type: string
 *           description: 操作详情
 *         ip:
 *           type: string
 *           description: IP地址
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *     LogStatistics:
 *       type: object
 *       properties:
 *         system_logs:
 *           type: integer
 *           description: 系统日志总数
 *         operation_logs:
 *           type: integer
 *           description: 操作日志总数
 *         total:
 *           type: integer
 *           description: 总日志数量
 *   tags:
 *     - name: SystemLogs
 *       description: 系统日志管理
*/

/**
* @swagger
 * /system-logs:
 *   get:
 *     summary: 获取系统日志列表
 *     description: 分页获取系统日志列表，支持查询参数
 *     tags: [SystemLogs]
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
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
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
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SystemLog'
 *                     total:
 *                       type: integer
 *                       description: 总记录数
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                     pageSize:
 *                       type: integer
 *                       description: 每页数量
 *                     totalPages:
 *                       type: integer
 *                       description: 总页数
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;
    
    const systemLogs = await sequelize.query(
      'SELECT * FROM system_logs ORDER BY created_at DESC LIMIT :limit OFFSET :offset',
      { 
        replacements: { limit: pageSize, offset },
        type: QueryTypes.SELECT 
      }
    );
    
    const totalCountResult = await sequelize.query(
      'SELECT COUNT(*) as total FROM system_logs',
      { type: QueryTypes.SELECT }
    );
    const total = (totalCountResult[0] as any).total;

    return ApiResponse.success(res, {
      items: systemLogs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取系统日志失败');
  }
});

/**
* @swagger
 * /system-logs:
 *   post:
 *     summary: 创建系统日志
 *     description: 创建新的系统日志记录
 *     tags: [SystemLogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SystemLogCreate'
 *           example:
 *             level: "info"
 *             message: "用户登录成功"
 *             module: "auth"
 *             userId: 1
 *             ip: "192.168.1.1"
 *             userAgent: "Mozilla/5.0"
 *     responses:
 *       200:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SystemLog'
 *                 message:
 *                   type: string
 *                   example: "创建系统日志成功"
 *       400:
 *         description: 参数错误
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
 *                   example: "日志级别和消息内容不能为空"
 *                 error:
 *                   type: string
 *                   example: "INVALID_PARAMS"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.post('/', async (req, res) => {
  try {
    const { level, message, module, userId, ip, userAgent } = req.body;
    
    if (!level || !message) {
      return ApiResponse.error(res, '日志级别和消息内容不能为空', 'INVALID_PARAMS', 400);
    }
    
    const result = await sequelize.query(
      `INSERT INTO system_logs (level, message, module, user_id, ip, user_agent, created_at, updated_at) 
       VALUES (:level, :message, :module, :userId, :ip, :userAgent, NOW(), NOW())`,
      {
        replacements: {
          level,
          message,
          module: module || 'system',
          userId: userId || req.user?.id || null,
          ip: ip || req.ip || null,
          userAgent: userAgent || req.get('User-Agent') || null
        },
        type: QueryTypes.INSERT
      }
    );
    
    const insertId = result[0];
    
    return ApiResponse.success(res, {
      id: insertId,
      level,
      message,
      module: module || 'system',
      userId: userId || req.user?.id || null,
      ip: ip || req.ip || null,
      userAgent: userAgent || req.get('User-Agent') || null,
      createdAt: new Date().toISOString()
    }, '创建系统日志成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '创建系统日志失败');
  }
});

/**
* @swagger
 * /system-logs/{id}:
 *   get:
 *     summary: 获取单条系统日志
 *     description: 根据ID获取特定的系统日志详情
 *     tags: [SystemLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 系统日志ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SystemLog'
 *                 message:
 *                   type: string
 *                   example: "获取系统日志详情成功"
 *       404:
 *         description: 系统日志不存在
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
 *                   example: "系统日志不存在"
 *                 error:
 *                   type: string
 *                   example: "NOT_FOUND"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const systemLogs = await sequelize.query(
      'SELECT * FROM system_logs WHERE id = :id',
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );
    
    if (systemLogs.length === 0) {
      return ApiResponse.error(res, '系统日志不存在', 'NOT_FOUND', 404);
    }
    
    return ApiResponse.success(res, systemLogs[0], '获取系统日志详情成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取系统日志详情失败');
  }
});

/**
* @swagger
 * /system-logs/{id}:
 *   delete:
 *     summary: 删除系统日志
 *     description: 根据ID删除特定的系统日志
 *     tags: [SystemLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 系统日志ID
 *     responses:
 *       200:
 *         description: 删除成功
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
 *                     id:
 *                       type: integer
 *                       description: 删除的日志ID
 *                 message:
 *                   type: string
 *                   example: "删除系统日志成功"
 *       404:
 *         description: 系统日志不存在
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
 *                   example: "系统日志不存在"
 *                 error:
 *                   type: string
 *                   example: "NOT_FOUND"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查日志是否存在
    const existingLogs = await sequelize.query(
      'SELECT id FROM system_logs WHERE id = :id',
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );
    
    if (existingLogs.length === 0) {
      return ApiResponse.error(res, '系统日志不存在', 'NOT_FOUND', 404);
    }
    
    await sequelize.query(
      'DELETE FROM system_logs WHERE id = :id',
      {
        replacements: { id },
        type: QueryTypes.DELETE
      }
    );
    
    return ApiResponse.success(res, { id: parseInt(id) }, '删除系统日志成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '删除系统日志失败');
  }
});

/**
* @swagger
 * /system-logs/cleanup:
 *   post:
 *     summary: 清理系统日志
 *     description: 清理历史系统日志记录（暂未实现）
 *     tags: [SystemLogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       501:
 *         description: 功能暂未实现
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
 *                   example: "清理功能暂未实现"
 *                 error:
 *                   type: string
 *                   example: "NOT_IMPLEMENTED"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.post('/cleanup', async (req, res) => {
  try {
    return ApiResponse.error(res, '清理功能暂未实现', 'NOT_IMPLEMENTED', 501);
  } catch (error) {
    return ApiResponse.handleError(res, error, '清理系统日志失败');
  }
});

/**
* @swagger
 * /system-logs/system:
 *   get:
 *     summary: 获取系统日志
 *     description: 获取最近100条系统日志记录
 *     tags: [SystemLogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
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
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SystemLog'
 *                     total:
 *                       type: integer
 *                       description: 记录总数
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       description: 每页数量
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.get('/system', async (req, res) => {
  try {
    const systemLogs = await sequelize.query(
      'SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 100',
      { type: QueryTypes.SELECT }
    );

    return ApiResponse.success(res, {
      items: systemLogs,
      total: systemLogs.length,
      page: 1,
      pageSize: systemLogs.length,
      totalPages: 1
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取系统日志失败');
  }
});

/**
* @swagger
 * /system-logs/operations:
 *   get:
 *     summary: 获取操作日志
 *     description: 获取最近100条操作日志记录
 *     tags: [SystemLogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
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
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/OperationLog'
 *                     total:
 *                       type: integer
 *                       description: 记录总数
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       description: 每页数量
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.get('/operations', async (req, res) => {
  try {
    const operationLogs = await sequelize.query(
      'SELECT * FROM operation_logs ORDER BY created_at DESC LIMIT 100',
      { type: QueryTypes.SELECT }
    );

    return ApiResponse.success(res, {
      items: operationLogs,
      total: operationLogs.length,
      page: 1,
      pageSize: operationLogs.length,
      totalPages: 1
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取操作日志失败');
  }
});

/**
* @swagger
 * /system-logs/system/cleanup:
 *   delete:
 *     summary: 清理系统日志
 *     description: 清理历史系统日志记录（暂未实现）
 *     tags: [SystemLogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       501:
 *         description: 功能暂未实现
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
 *                   example: "清理功能暂未实现"
 *                 error:
 *                   type: string
 *                   example: "NOT_IMPLEMENTED"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.delete('/system/cleanup', async (req, res) => {
  try {
    return ApiResponse.error(res, '清理功能暂未实现', 'NOT_IMPLEMENTED', 501);
  } catch (error) {
    return ApiResponse.handleError(res, error, '清理系统日志失败');
  }
});

/**
* @swagger
 * /system-logs/statistics:
 *   get:
 *     summary: 获取日志统计
 *     description: 获取系统日志和操作日志的统计信息
 *     tags: [SystemLogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LogStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.get('/statistics', async (req, res) => {
  try {
    const systemLogCount = await sequelize.query(
      'SELECT COUNT(*) as count FROM system_logs',
      { type: QueryTypes.SELECT }
    );
    
    const operationLogCount = await sequelize.query(
      'SELECT COUNT(*) as count FROM operation_logs',
      { type: QueryTypes.SELECT }
    );

    return ApiResponse.success(res, {
      system_logs: (systemLogCount[0] as any)?.count || 0,
      operation_logs: (operationLogCount[0] as any)?.count || 0,
      total: ((systemLogCount[0] as any)?.count || 0) + ((operationLogCount[0] as any)?.count || 0)
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取日志统计失败');
  }
});

export default router; 