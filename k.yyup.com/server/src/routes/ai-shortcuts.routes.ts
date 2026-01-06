/**
* @swagger
 * components:
 *   schemas:
 *     Ai-shortcut:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Ai-shortcut ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Ai-shortcut 名称
 *           example: "示例Ai-shortcut"
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
 *     CreateAi-shortcutRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Ai-shortcut 名称
 *           example: "新Ai-shortcut"
 *     UpdateAi-shortcutRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Ai-shortcut 名称
 *           example: "更新后的Ai-shortcut"
 *     Ai-shortcutListResponse:
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
 *                 $ref: '#/components/schemas/Ai-shortcut'
 *         message:
 *           type: string
 *           example: "获取ai-shortcut列表成功"
 *     Ai-shortcutResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Ai-shortcut'
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
 * ai-shortcut管理路由文件
 * 提供ai-shortcut的基础CRUD操作
*
 * 功能包括：
 * - 获取ai-shortcut列表
 * - 创建新ai-shortcut
 * - 获取ai-shortcut详情
 * - 更新ai-shortcut信息
 * - 删除ai-shortcut
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { verifyToken } from '../middlewares/auth.middleware';
import { permissionMiddleware } from '../middlewares/permission.middleware';
import aiShortcutsController from '../controllers/ai-shortcuts.controller';

const router = Router();

// 应用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * tags:
 *   name: AI快捷操作
 *   description: AI助手快捷操作配置管理
*/

/**
* @swagger
 * /api/ai-shortcuts:
 *   get:
 *     summary: 获取AI快捷操作列表
 *     description: 获取AI快捷操作配置列表，支持角色过滤、分页和搜索
 *     tags: [AI快捷操作]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: role
 *         in: query
 *         description: 角色过滤
 *         schema:
 *           type: string
 *           enum: [principal, admin, teacher, all]
 *       - name: category
 *         in: query
 *         description: 类别过滤
 *         schema:
 *           type: string
 *       - name: is_active
 *         in: query
 *         description: 状态过滤
 *         schema:
 *           type: boolean
 *       - name: page
 *         in: query
 *         description: 页码
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: 每页条数
 *         schema:
 *           type: integer
 *           default: 20
 *       - name: search
 *         in: query
 *         description: 搜索关键词
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 *       500:
 *         description: 服务器错误
*/
router.get('/', 
  permissionMiddleware(['AI_SHORTCUTS_VIEW']),
  [
    query('role').optional().isIn(['principal', 'admin', 'teacher', 'all']),
    query('category').optional().isString(),
    query('is_active').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString()
  ],
  aiShortcutsController.getShortcuts
);

/**
* @swagger
 * /api/ai-shortcuts/user:
 *   get:
 *     summary: 获取用户可用的快捷操作
 *     description: 根据用户角色获取可用的AI快捷操作
 *     tags: [AI快捷操作]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       500:
 *         description: 服务器错误
*/
router.get('/user', 
  aiShortcutsController.getUserShortcuts
);

/**
* @swagger
 * /api/ai-shortcuts/{id}:
 *   get:
 *     summary: 获取AI快捷操作详情
 *     description: 根据ID获取AI快捷操作的详细信息
 *     tags: [AI快捷操作]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 快捷操作ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *       404:
 *         description: 记录不存在
 *       500:
 *         description: 服务器错误
*/
router.get('/:id', 
  permissionMiddleware(['AI_SHORTCUTS_VIEW']),
  [
    param('id').isInt({ min: 1 }).withMessage('ID必须是正整数')
  ],
  aiShortcutsController.getShortcutById
);

/**
* @swagger
 * /api/ai-shortcuts/{id}/config:
 *   get:
 *     summary: 获取快捷操作配置
 *     description: 获取用于AI调用的快捷操作配置信息
 *     tags: [AI快捷操作]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 快捷操作ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *       404:
 *         description: 记录不存在或无权限
 *       500:
 *         description: 服务器错误
*/
router.get('/:id/config', 
  [
    param('id').isInt({ min: 1 }).withMessage('ID必须是正整数')
  ],
  aiShortcutsController.getShortcutConfig
);

/**
* @swagger
 * /api/ai-shortcuts:
 *   post:
 *     summary: 创建AI快捷操作
 *     description: 创建新的AI快捷操作配置
 *     tags: [AI快捷操作]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shortcut_name
 *               - prompt_name
 *               - category
 *               - system_prompt
 *               - api_endpoint
 *             properties:
 *               shortcut_name:
 *                 type: string
 *                 description: 快捷按钮显示名称
 *               prompt_name:
 *                 type: string
 *                 description: 提示词标识名称
 *               category:
 *                 type: string
 *                 enum: [enrollment_planning, activity_planning, progress_analysis, follow_up_reminder, conversion_monitoring, age_reminder, task_management, comprehensive_analysis]
 *                 description: 功能类别
 *               role:
 *                 type: string
 *                 enum: [principal, admin, teacher, all]
 *                 default: all
 *                 description: 适用角色
 *               system_prompt:
 *                 type: string
 *                 description: 系统提示词内容
 *               api_endpoint:
 *                 type: string
 *                 enum: [ai_chat, ai_query]
 *                 description: API接口类型
 *               is_active:
 *                 type: boolean
 *                 default: true
 *                 description: 是否启用
 *               sort_order:
 *                 type: integer
 *                 default: 0
 *                 description: 排序权重
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 参数错误
 *       500:
 *         description: 服务器错误
*/
router.post('/', 
  permissionMiddleware(['AI_SHORTCUTS_CREATE']),
  [
    body('shortcut_name').notEmpty().withMessage('快捷名称不能为空'),
    body('prompt_name').notEmpty().withMessage('提示词名称不能为空'),
    body('category').isIn([
      'enrollment_planning', 'activity_planning', 'progress_analysis', 
      'follow_up_reminder', 'conversion_monitoring', 'age_reminder', 
      'task_management', 'comprehensive_analysis'
    ]).withMessage('功能类别无效'),
    body('role').optional().isIn(['principal', 'admin', 'teacher', 'all']).withMessage('角色无效'),
    body('system_prompt').notEmpty().withMessage('系统提示词不能为空'),
    body('api_endpoint').isIn(['ai_chat', 'ai_query']).withMessage('API接口类型无效'),
    body('is_active').optional().isBoolean().withMessage('启用状态必须是布尔值'),
    body('sort_order').optional().isInt({ min: 0 }).withMessage('排序权重必须是非负整数')
  ],
  aiShortcutsController.createShortcut
);

/**
* @swagger
 * /api/ai-shortcuts/{id}:
 *   put:
 *     summary: 更新AI快捷操作
 *     description: 更新指定的AI快捷操作配置
 *     tags: [AI快捷操作]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 快捷操作ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shortcut_name:
 *                 type: string
 *               prompt_name:
 *                 type: string
 *               category:
 *                 type: string
 *               role:
 *                 type: string
 *               system_prompt:
 *                 type: string
 *               api_endpoint:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *               sort_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 参数错误
 *       404:
 *         description: 记录不存在
 *       500:
 *         description: 服务器错误
*/
router.put('/:id', 
  permissionMiddleware(['AI_SHORTCUTS_UPDATE']),
  [
    param('id').isInt({ min: 1 }).withMessage('ID必须是正整数'),
    body('shortcut_name').optional().notEmpty().withMessage('快捷名称不能为空'),
    body('prompt_name').optional().notEmpty().withMessage('提示词名称不能为空'),
    body('category').optional().isIn([
      'enrollment_planning', 'activity_planning', 'progress_analysis', 
      'follow_up_reminder', 'conversion_monitoring', 'age_reminder', 
      'task_management', 'comprehensive_analysis'
    ]).withMessage('功能类别无效'),
    body('role').optional().isIn(['principal', 'admin', 'teacher', 'all']).withMessage('角色无效'),
    body('system_prompt').optional().notEmpty().withMessage('系统提示词不能为空'),
    body('api_endpoint').optional().isIn(['ai_chat', 'ai_query']).withMessage('API接口类型无效'),
    body('is_active').optional().isBoolean().withMessage('启用状态必须是布尔值'),
    body('sort_order').optional().isInt({ min: 0 }).withMessage('排序权重必须是非负整数')
  ],
  aiShortcutsController.updateShortcut
);

/**
* @swagger
 * /api/ai-shortcuts/{id}:
 *   delete:
 *     summary: 删除AI快捷操作
 *     description: 软删除指定的AI快捷操作
 *     tags: [AI快捷操作]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 快捷操作ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
 *       404:
 *         description: 记录不存在
 *       500:
 *         description: 服务器错误
*/
router.delete('/:id', 
  permissionMiddleware(['AI_SHORTCUTS_DELETE']),
  [
    param('id').isInt({ min: 1 }).withMessage('ID必须是正整数')
  ],
  aiShortcutsController.deleteShortcut
);

/**
* @swagger
 * /api/ai-shortcuts/batch/delete:
 *   post:
 *     summary: 批量删除AI快捷操作
 *     description: 批量软删除AI快捷操作
 *     tags: [AI快捷操作]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 要删除的ID列表
 *     responses:
 *       200:
 *         description: 批量删除成功
 *       400:
 *         description: 参数错误
 *       500:
 *         description: 服务器错误
*/
router.post('/batch/delete', 
  permissionMiddleware(['AI_SHORTCUTS_DELETE']),
  [
    body('ids').isArray({ min: 1 }).withMessage('请提供要删除的ID列表'),
    body('ids.*').isInt({ min: 1 }).withMessage('ID必须是正整数')
  ],
  aiShortcutsController.batchDeleteShortcuts
);

/**
* @swagger
 * /api/ai-shortcuts/sort:
 *   put:
 *     summary: 更新排序顺序
 *     description: 批量更新AI快捷操作的排序顺序
 *     tags: [AI快捷操作]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sortData
 *             properties:
 *               sortData:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     sort_order:
 *                       type: integer
 *                 description: 排序数据
 *     responses:
 *       200:
 *         description: 更新排序成功
 *       400:
 *         description: 参数错误
 *       500:
 *         description: 服务器错误
*/
router.put('/sort', 
  permissionMiddleware(['AI_SHORTCUTS_UPDATE']),
  [
    body('sortData').isArray({ min: 1 }).withMessage('请提供排序数据'),
    body('sortData.*.id').isInt({ min: 1 }).withMessage('ID必须是正整数'),
    body('sortData.*.sort_order').isInt({ min: 0 }).withMessage('排序权重必须是非负整数')
  ],
  aiShortcutsController.updateSortOrder
);

export default router;
