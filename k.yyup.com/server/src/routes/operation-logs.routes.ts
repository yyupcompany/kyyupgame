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
 *     OperationLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 操作日志ID
 *         action:
 *           type: string
 *           description: "操作类型 (如: create, update, delete, login, logout等)"
 *         module:
 *           type: string
 *           description: "操作模块 (如: user, student, teacher等)"
 *         targetType:
 *           type: string
 *           nullable: true
 *           description: 操作目标类型
 *         targetId:
 *           type: integer
 *           nullable: true
 *           description: 操作目标ID
 *         details:
 *           type: string
 *           nullable: true
 *           description: 操作详情 (JSON格式)
 *         result:
 *           type: string
 *           description: 操作结果 (success, failed等)
 *           default: success
 *         userId:
 *           type: integer
 *           nullable: true
 *           description: 操作用户ID
 *         ip:
 *           type: string
 *           nullable: true
 *           description: 操作者IP地址
 *         userAgent:
 *           type: string
 *           nullable: true
 *           description: 用户代理信息
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *     CreateOperationLogRequest:
 *       type: object
 *       required:
 *         - action
 *         - module
 *       properties:
 *         action:
 *           type: string
 *           description: 操作类型
 *           example: "create"
 *         module:
 *           type: string
 *           description: 操作模块
 *           example: "user"
 *         targetType:
 *           type: string
 *           description: 操作目标类型
 *           example: "User"
 *         targetId:
 *           type: integer
 *           description: 操作目标ID
 *           example: 123
 *         details:
 *           type: string
 *           description: 操作详情 (JSON格式)
 *           example: '{"name": "新用户", "role": "teacher"}'
 *         result:
 *           type: string
 *           description: 操作结果
 *           example: "success"
 *         userId:
 *           type: integer
 *           description: 操作用户ID
 *           example: 1
 *         ip:
 *           type: string
 *           description: 操作者IP地址
 *           example: "192.168.1.100"
 *         userAgent:
 *           type: string
 *           description: 用户代理信息
 *           example: "Mozilla/5.0..."
 *     OperationLogsResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OperationLog'
 *         total:
 *           type: integer
 *           description: 总记录数
 *         page:
 *           type: integer
 *           description: 当前页码
 *         pageSize:
 *           type: integer
 *           description: 每页记录数
 *         totalPages:
 *           type: integer
 *           description: 总页数
 *   tags:
 *     - name: 操作日志
 *       description: 系统操作日志管理
*/

/**
* @swagger
 * /operation-logs:
 *   get:
 *     summary: 获取操作日志列表
 *     description: 分页获取系统操作日志列表
 *     tags: [操作日志]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: 每页记录数
 *     responses:
 *       200:
 *         description: 成功获取操作日志列表
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/OperationLogsResponse'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
*/
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;
    
    const operationLogs = await sequelize.query(
      'SELECT * FROM operation_logs ORDER BY created_at DESC LIMIT :limit OFFSET :offset',
      { 
        replacements: { limit: pageSize, offset },
        type: QueryTypes.SELECT 
      }
    );
    
    const totalCountResult = await sequelize.query(
      'SELECT COUNT(*) as total FROM operation_logs',
      { type: QueryTypes.SELECT }
    );
    const total = (totalCountResult[0] as any).total;

    return ApiResponse.success(res, {
      items: operationLogs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取操作日志失败');
  }
});

/**
* @swagger
 * /operation-logs:
 *   post:
 *     summary: 创建操作日志
 *     description: 创建新的系统操作日志记录
 *     tags: [操作日志]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOperationLogRequest'
 *           examples:
 *             创建用户:
 *               value:
 *                 action: "create"
 *                 module: "user"
 *                 targetType: "User"
 *                 targetId: 123
 *                 details: '{"name": "张三", "role": "teacher"}'
 *                 result: "success"
 *             登录操作:
 *               value:
 *                 action: "login"
 *                 module: "auth"
 *                 result: "success"
 *     responses:
 *       200:
 *         description: 成功创建操作日志
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/OperationLog'
 *       400:
 *         description: "请求参数错误 (操作类型和模块不能为空)"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "操作类型和模块不能为空"
 *               code: "INVALID_PARAMS"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
*/
router.post('/', async (req, res) => {
  try {
    const { action, module, targetType, targetId, details, result: operationResult, userId, ip, userAgent } = req.body;
    
    if (!action || !module) {
      return ApiResponse.error(res, '操作类型和模块不能为空', 'INVALID_PARAMS', 400);
    }
    
    const insertResult = await sequelize.query(
      `INSERT INTO operation_logs (action, module, target_type, target_id, details, result, user_id, ip, user_agent, created_at, updated_at) 
       VALUES (:action, :module, :targetType, :targetId, :details, :result, :userId, :ip, :userAgent, NOW(), NOW())`,
      {
        replacements: {
          action,
          module,
          targetType: targetType || null,
          targetId: targetId || null,
          details: details || null,
          result: operationResult || 'success',
          userId: userId || req.user?.id || null,
          ip: ip || req.ip || null,
          userAgent: userAgent || req.get('User-Agent') || null
        },
        type: QueryTypes.INSERT
      }
    );
    
    const insertId = insertResult[0];
    
    return ApiResponse.success(res, {
      id: insertId,
      action,
      module,
      targetType: targetType || null,
      targetId: targetId || null,
      details: details || null,
      result: operationResult || 'success',
      userId: userId || req.user?.id || null,
      ip: ip || req.ip || null,
      userAgent: userAgent || req.get('User-Agent') || null,
      createdAt: new Date().toISOString()
    }, '创建操作日志成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '创建操作日志失败');
  }
});

/**
* @swagger
 * /operation-logs/{id}:
 *   get:
 *     summary: 获取操作日志详情
 *     description: 根据ID获取特定操作日志的详细信息
 *     tags: [操作日志]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 操作日志ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功获取操作日志详情
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/OperationLog'
 *             example:
 *               success: true
 *               message: "获取操作日志详情成功"
 *               data:
 *                 id: 1
 *                 action: "create"
 *                 module: "user"
 *                 targetType: "User"
 *                 targetId: 123
 *                 details: '{"name": "张三", "role": "teacher"}'
 *                 result: "success"
 *                 userId: 1
 *                 ip: "192.168.1.100"
 *                 userAgent: "Mozilla/5.0..."
 *                 createdAt: "2024-01-01T10:00:00.000Z"
 *                 updatedAt: "2024-01-01T10:00:00.000Z"
 *       404:
 *         description: 操作日志不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "操作日志不存在"
 *               code: "NOT_FOUND"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
*/
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const operationLogs = await sequelize.query(
      'SELECT * FROM operation_logs WHERE id = :id LIMIT 1',
      { 
        replacements: { id },
        type: QueryTypes.SELECT 
      }
    );

    if (operationLogs.length === 0) {
      return ApiResponse.error(res, '操作日志不存在', 'NOT_FOUND', 404);
    }

    return ApiResponse.success(res, operationLogs[0], '获取操作日志详情成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取操作日志详情失败');
  }
});

/**
* @swagger
 * /operation-logs/{id}:
 *   delete:
 *     summary: 删除操作日志
 *     description: 根据ID删除特定的操作日志记录
 *     tags: [操作日志]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 操作日志ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功删除操作日志
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: 被删除的操作日志ID
 *             example:
 *               success: true
 *               message: "删除操作日志成功"
 *               data:
 *                 id: 1
 *       404:
 *         description: 操作日志不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "操作日志不存在"
 *               code: "NOT_FOUND"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
*/
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查日志是否存在
    const existingLogs = await sequelize.query(
      'SELECT id FROM operation_logs WHERE id = :id',
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );
    
    if (existingLogs.length === 0) {
      return ApiResponse.error(res, '操作日志不存在', 'NOT_FOUND', 404);
    }
    
    await sequelize.query(
      'DELETE FROM operation_logs WHERE id = :id',
      {
        replacements: { id },
        type: QueryTypes.DELETE
      }
    );
    
    return ApiResponse.success(res, { id: parseInt(id) }, '删除操作日志成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '删除操作日志失败');
  }
});

/**
* @swagger
 * /operation-logs/cleanup:
 *   delete:
 *     summary: 清理操作日志
 *     description: 批量清理过期或满足条件的操作日志记录 (当前暂未实现)
 *     tags: [操作日志]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "清理功能暂未实现"
 *               code: "NOT_IMPLEMENTED"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
*/
router.delete('/cleanup', async (req, res) => {
  try {
    return ApiResponse.error(res, '清理功能暂未实现', 'NOT_IMPLEMENTED', 501);
  } catch (error) {
    return ApiResponse.handleError(res, error, '清理操作日志失败');
  }
});

export default router; 