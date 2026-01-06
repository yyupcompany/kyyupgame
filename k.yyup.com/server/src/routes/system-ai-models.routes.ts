/**
 * 🚀 AI模型管理已迁移到统一租户中心
 * 原来的System AI Model路由已注释，现在使用统一租户中心的AI模型管理
 * 新服务地址: http://localhost:4000/api/ai-models (统一租户中心)
*
* @deprecated 此路由已被统一租户中心替代
* @see http://localhost:4000/api/ai-models
*/
/*
* @swagger
* components:
*   schemas:
*     System-ai-model:
*       type: object
*       properties:
*         id:
*           type: integer
*           description: System-ai-model ID
*           example: 1
*         name:
*           type: string
*           description: System-ai-model 名称
*           example: "示例System-ai-model"
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
*     CreateSystem-ai-modelRequest:
*       type: object
*       required:
*         - name
*       properties:
*         name:
*           type: string
*           description: System-ai-model 名称
*           example: "新System-ai-model"
*     UpdateSystem-ai-modelRequest:
*       type: object
*       properties:
*         name:
*           type: string
*           description: System-ai-model 名称
*           example: "更新后的System-ai-model"
*     System-ai-modelListResponse:
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
*                 $ref: '#/components/schemas/System-ai-model'
*         message:
*           type: string
*           example: "获取system-ai-model列表成功"
*     System-ai-modelResponse:
*       type: object
*       properties:
*         success:
*           type: boolean
*           example: true
*         data:
*           $ref: '#/components/schemas/System-ai-model'
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
 * system-ai-model管理路由文件
 * 提供system-ai-model的基础CRUD操作
*
 * 功能包括：
 * - 获取system-ai-model列表
 * - 创建新system-ai-model
 * - 获取system-ai-model详情
 * - 更新system-ai-model信息
 * - 删除system-ai-model
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';
import aiController from '../controllers/ai.controller';
import AIModelConfigService from '../services/ai/ai-model-config.service';

console.log('[路由] system-ai-models.routes.ts 已加载');

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /system/ai-models:
 *   get:
 *     tags: [AI Models]
 *     summary: 获取所有AI模型
 *     description: 获取系统中所有AI模型的分页列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *         description: 只返回激活的模型
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
 *     responses:
 *       200:
 *         description: 获取模型列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AIModel'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
// 获取所有模型 - 返回分页格式
router.get('/', checkPermission('AI_MODEL_VIEW'), async (req, res) => {
  try {
    const { activeOnly, page = 1, pageSize = 10 } = req.query;
    const models = await AIModelConfigService.getAllModels(activeOnly === 'true');
    
    const currentPage = parseInt(page as string);
    const size = parseInt(pageSize as string);
    
    // 分页处理
    const startIndex = (currentPage - 1) * size;
    const endIndex = startIndex + size;
    const paginatedModels = models.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      message: '获取模型列表成功',
      data: {
        items: paginatedModels,
        total: models.length,
        page: currentPage,
        pageSize: size,
        totalPages: Math.ceil(models.length / size)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取模型列表失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
* @swagger
 * /system/ai-models/stats:
 *   get:
 *     tags: [AI Models]
 *     summary: 获取AI模型统计信息
 *     description: 获取AI模型的统计数据，包括使用量、性能指标等
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取统计信息成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalModels:
 *                       type: integer
 *                       description: 模型总数
 *                     activeModels:
 *                       type: integer
 *                       description: 激活模型数
 *                     totalUsage:
 *                       type: integer
 *                       description: 总使用次数
 *                     averageResponseTime:
 *                       type: number
 *                       description: 平均响应时间
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
// 获取模型统计信息
router.get('/stats', checkPermission('AI_MODEL_VIEW'), aiController.getStats.bind(aiController));

/**
* @swagger
 * /system/ai-models/{id}/status:
 *   put:
 *     tags: [AI Models]
 *     summary: 更新AI模型状态
 *     description: 更新指定AI模型的启用/禁用状态
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 模型ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: 模型状态
 *     responses:
 *       200:
 *         description: 模型状态更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/AIModel'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
// 更新模型状态
router.put('/:id/status', checkPermission('AI_MODEL_MANAGE'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // 调用AI控制器的状态更新方法
    const result = await aiController.updateModelStatus(id, status);
    
    res.json({
      success: true,
      message: '模型状态更新成功',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '模型状态更新失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
* @swagger
 * /system/ai-models/{id}:
 *   get:
 *     tags: [AI Models]
 *     summary: 获取单个AI模型详情
 *     description: 根据ID获取指定AI模型的详细信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 模型ID
 *     responses:
 *       200:
 *         description: 获取模型详情成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/AIModel'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   put:
 *     tags: [AI Models]
 *     summary: 更新AI模型信息
 *     description: 更新指定AI模型的配置信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 模型ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               modelName:
 *                 type: string
 *                 description: 模型名称
 *               provider:
 *                 type: string
 *                 description: 提供商
 *               apiEndpoint:
 *                 type: string
 *                 description: API端点
 *               maxTokens:
 *                 type: integer
 *                 description: 最大令牌数
 *               temperature:
 *                 type: number
 *                 description: 温度参数
 *               isActive:
 *                 type: boolean
 *                 description: 是否激活
 *     responses:
 *       200:
 *         description: 模型更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/AIModel'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   delete:
 *     tags: [AI Models]
 *     summary: 删除AI模型
 *     description: 删除指定的AI模型配置
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 模型ID
 *     responses:
 *       200:
 *         description: 模型删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
// 其他路由保持不变
router.get('/:id', checkPermission('AI_MODEL_VIEW'), aiController.getModelById.bind(aiController));

/**
* @swagger
 * /system/ai-models:
 *   post:
 *     tags: [AI Models]
 *     summary: 创建新的AI模型
 *     description: 在系统中创建新的AI模型配置
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modelName
 *               - provider
 *               - apiEndpoint
 *             properties:
 *               modelName:
 *                 type: string
 *                 description: 模型名称
 *               provider:
 *                 type: string
 *                 description: 提供商
 *               apiEndpoint:
 *                 type: string
 *                 description: API端点
 *               maxTokens:
 *                 type: integer
 *                 description: 最大令牌数
 *               temperature:
 *                 type: number
 *                 description: 温度参数
 *               isActive:
 *                 type: boolean
 *                 description: 是否激活
 *     responses:
 *       201:
 *         description: 模型创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/AIModel'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.post('/', checkPermission('AI_MODEL_MANAGE'), aiController.createModel.bind(aiController));

/**
* @swagger
 * /api/system/ai-models/{id}:
 *   put:
 *     summary: 更新AI模型
 *     tags: [AI模型管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 模型ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIModelInput'
 *     responses:
 *       200:
 *         description: 模型更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIModelResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.put('/:id', checkPermission('AI_MODEL_MANAGE'), aiController.updateModel.bind(aiController));

/**
* @swagger
 * /api/system/ai-models/{id}:
 *   delete:
 *     summary: 删除AI模型
 *     tags: [AI模型管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 模型ID
 *     responses:
 *       200:
 *         description: 模型删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 删除成功
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.delete('/:id', checkPermission('AI_MODEL_MANAGE'), (req, res) => {
  console.log(`[路由] 收到删除请求: DELETE /system/ai-models/${req.params.id}`);
  aiController.deleteModel(req, res);
});

export default router; 