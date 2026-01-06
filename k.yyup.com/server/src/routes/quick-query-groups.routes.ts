/**
* @swagger
 * components:
 *   schemas:
 *     Quick-query-group:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Quick-query-group ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Quick-query-group 名称
 *           example: "示例Quick-query-group"
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
 *     CreateQuick-query-groupRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Quick-query-group 名称
 *           example: "新Quick-query-group"
 *     UpdateQuick-query-groupRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Quick-query-group 名称
 *           example: "更新后的Quick-query-group"
 *     Quick-query-groupListResponse:
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
 *                 $ref: '#/components/schemas/Quick-query-group'
 *         message:
 *           type: string
 *           example: "获取quick-query-group列表成功"
 *     Quick-query-groupResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Quick-query-group'
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
 * quick-query-group管理路由文件
 * 提供quick-query-group的基础CRUD操作
*
 * 功能包括：
 * - 获取quick-query-group列表
 * - 创建新quick-query-group
 * - 获取quick-query-group详情
 * - 更新quick-query-group信息
 * - 删除quick-query-group
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 快捷查询分组路由
 * 提供 /查询 命令的快捷选择功能API
*/

import { Router } from 'express';
import { quickQueryGroupsService } from '../services/ai/quick-query-groups.service';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/quick-query-groups:
 *   get:
 *     summary: 获取所有快捷查询分组
 *     description: 获取所有快捷查询分组，用于 /查询 命令的分组选择
 *     tags: [快捷查询]
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: 分组ID
 *                       name:
 *                         type: string
 *                         description: 分组名称
 *                       icon:
 *                         type: string
 *                         description: 分组图标
 *                       description:
 *                         type: string
 *                         description: 分组描述
 *                       queries:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             keyword:
 *                               type: string
 *                               description: 查询关键词
 *                             description:
 *                               type: string
 *                               description: 查询描述
 *                             tokens:
 *                               type: number
 *                               description: 预估token消耗
 *                             category:
 *                               type: string
 *                               description: 查询类别
*/
router.get('/', async (req, res) => {
  try {
    logger.info('[快捷查询分组] 获取所有分组');
    
    const groups = quickQueryGroupsService.getAllGroups();
    
    ApiResponse.success(res, groups, '获取快捷查询分组成功');
  } catch (error) {
    logger.error('[快捷查询分组] 获取分组失败:', error);
    ApiResponse.error(res, '获取快捷查询分组失败', 'QUERY_GROUPS_ERROR', 500);
  }
});

/**
* @swagger
 * /api/quick-query-groups/overview:
 *   get:
 *     summary: 获取快捷查询分组概览
 *     description: 获取快捷查询分组概览信息，不包含具体查询列表
 *     tags: [快捷查询]
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/overview', async (req, res) => {
  try {
    logger.info('[快捷查询分组] 获取分组概览');
    
    const overview = quickQueryGroupsService.getGroupsOverview();
    
    ApiResponse.success(res, overview, '获取快捷查询分组概览成功');
  } catch (error) {
    logger.error('[快捷查询分组] 获取分组概览失败:', error);
    ApiResponse.error(res, '获取快捷查询分组概览失败', 'QUERY_GROUPS_OVERVIEW_ERROR', 500);
  }
});

/**
* @swagger
 * /api/quick-query-groups/{groupId}:
 *   get:
 *     summary: 获取指定分组的查询列表
 *     description: 根据分组ID获取该分组下的所有查询关键词
 *     tags: [快捷查询]
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         description: 分组ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 *       404:
 *         description: 分组不存在
*/
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    logger.info('[快捷查询分组] 获取分组查询:', { groupId });

    const group = quickQueryGroupsService.getGroupById(groupId);

    if (!group) {
      ApiResponse.error(res, '分组不存在', 'GROUP_NOT_FOUND', 404);
      return;
    }

    ApiResponse.success(res, group, '获取分组查询成功');
  } catch (error) {
    logger.error('[快捷查询分组] 获取分组查询失败:', error);
    ApiResponse.error(res, '获取分组查询失败', 'GROUP_QUERY_ERROR', 500);
  }
});

/**
* @swagger
 * /api/quick-query-groups/search:
 *   get:
 *     summary: 搜索查询关键词
 *     description: 根据关键词搜索相关的查询
 *     tags: [快捷查询]
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         description: 搜索关键词
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 搜索成功
*/
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      ApiResponse.error(res, '搜索关键词不能为空', 'INVALID_SEARCH_KEYWORD', 400);
      return;
    }

    logger.info('[快捷查询分组] 搜索查询:', { keyword: q });

    const results = quickQueryGroupsService.searchQueries(q);

    ApiResponse.success(res, results, '搜索查询成功');
  } catch (error) {
    logger.error('[快捷查询分组] 搜索查询失败:', error);
    ApiResponse.error(res, '搜索查询失败', 'SEARCH_QUERY_ERROR', 500);
  }
});

/**
* @swagger
 * /api/quick-query-groups/category/{category}:
 *   get:
 *     summary: 根据类别获取查询
 *     description: 根据查询类别获取相关查询
 *     tags: [快捷查询]
 *     parameters:
 *       - name: category
 *         in: path
 *         required: true
 *         description: 查询类别
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    logger.info('[快捷查询分组] 根据类别获取查询:', { category });
    
    const results = quickQueryGroupsService.getQueriesByCategory(category);
    
    ApiResponse.success(res, results, '根据类别获取查询成功');
  } catch (error) {
    logger.error('[快捷查询分组] 根据类别获取查询失败:', error);
    ApiResponse.error(res, '根据类别获取查询失败', 'CATEGORY_QUERY_ERROR', 500);
  }
});

export default router;
