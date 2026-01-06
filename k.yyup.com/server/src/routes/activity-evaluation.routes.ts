/**
* @swagger
 * components:
 *   schemas:
 *     Activity-evaluation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Activity-evaluation ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Activity-evaluation 名称
 *           example: "示例Activity-evaluation"
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
 *     CreateActivity-evaluationRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Activity-evaluation 名称
 *           example: "新Activity-evaluation"
 *     UpdateActivity-evaluationRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Activity-evaluation 名称
 *           example: "更新后的Activity-evaluation"
 *     Activity-evaluationListResponse:
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
 *                 $ref: '#/components/schemas/Activity-evaluation'
 *         message:
 *           type: string
 *           example: "获取activity-evaluation列表成功"
 *     Activity-evaluationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Activity-evaluation'
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
 * activity-evaluation管理路由文件
 * 提供activity-evaluation的基础CRUD操作
*
 * 功能包括：
 * - 获取activity-evaluation列表
 * - 创建新activity-evaluation
 * - 获取activity-evaluation详情
 * - 更新activity-evaluation信息
 * - 删除activity-evaluation
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import * as activityEvaluationController from '../controllers/activity-evaluation.controller';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';
import { Request, Response, NextFunction } from 'express';
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';
import { ApiResponse } from '../utils/apiResponse';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

// 创建一个包装器，将返回Promise<Response>的控制器函数转换为Express中间件
const asyncHandler = (fn: (req: Request, res: Response) => Promise<Response | void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
};

/**
* @swagger
 * /api/activity-evaluations/by-activity/{activityId}:
 *   get:
 *     summary: 按活动获取评估列表
 *     tags: [活动评价]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 活动ID
 *     responses:
 *       200:
 *         description: 成功
*/
router.get('/by-activity/:activityId', checkPermission('activity:manage'), async (req, res) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { activityId } = req.params;

    const evaluations = await sequelize.query(`
      SELECT ae.*, a.title as activity_title
      FROM ${tenantDb}.activity_evaluations ae
      LEFT JOIN ${tenantDb}.activities a ON ae.activity_id = a.id
      WHERE ae.activity_id = :activityId AND ae.deleted_at IS NULL
      ORDER BY ae.created_at DESC
    `, {
      replacements: { activityId: Number(activityId) },
      type: QueryTypes.SELECT
    });

    return ApiResponse.success(res, {
      activityId: Number(activityId),
      items: evaluations,
      total: evaluations.length
    }, '按活动获取评估列表成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '按活动获取评估列表失败');
  }
});

/**
* @swagger
 * /api/activity-evaluations/by-rating/{rating}:
 *   get:
 *     summary: 按评分获取评估列表
 *     tags: [活动评价]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rating
 *         schema:
 *           type: integer
 *         required: true
 *         description: 评分
 *     responses:
 *       200:
 *         description: 成功
*/
router.get('/by-rating/:rating', checkPermission('activity:manage'), async (req, res) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { rating } = req.params;

    const evaluations = await sequelize.query(`
      SELECT ae.*, a.title as activity_title
      FROM ${tenantDb}.activity_evaluations ae
      LEFT JOIN ${tenantDb}.activities a ON ae.activity_id = a.id
      WHERE ae.overall_rating = :rating AND ae.deleted_at IS NULL
      ORDER BY ae.created_at DESC
    `, {
      replacements: { rating: Number(rating) },
      type: QueryTypes.SELECT
    });

    return ApiResponse.success(res, {
      rating: Number(rating),
      items: evaluations,
      total: evaluations.length
    }, '按评分获取评估列表成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '按评分获取评估列表失败');
  }
});

/**
* @swagger
 * /api/activity-evaluations/statistics/{activityId}:
 *   get:
 *     summary: 获取活动评估统计
 *     tags: [活动评价]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 活动ID
 *     responses:
 *       200:
 *         description: 成功
*/
router.get('/statistics/:activityId', checkPermission('activity:manage'), async (req, res) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { activityId } = req.params;

    const [stats] = await sequelize.query(`
      SELECT
        COUNT(*) as total_evaluations,
        AVG(overall_rating) as avg_overall_rating,
        AVG(content_rating) as avg_content_rating,
        AVG(organization_rating) as avg_organization_rating,
        AVG(environment_rating) as avg_environment_rating,
        AVG(service_rating) as avg_service_rating,
        SUM(CASE WHEN overall_rating = 5 THEN 1 ELSE 0 END) as five_star_count,
        SUM(CASE WHEN overall_rating = 4 THEN 1 ELSE 0 END) as four_star_count,
        SUM(CASE WHEN overall_rating = 3 THEN 1 ELSE 0 END) as three_star_count,
        SUM(CASE WHEN overall_rating = 2 THEN 1 ELSE 0 END) as two_star_count,
        SUM(CASE WHEN overall_rating = 1 THEN 1 ELSE 0 END) as one_star_count
      FROM ${tenantDb}.activity_evaluations
      WHERE activity_id = :activityId AND deleted_at IS NULL
    `, {
      replacements: { activityId: Number(activityId) },
      type: QueryTypes.SELECT
    }) as any;

    return ApiResponse.success(res, {
      activityId: Number(activityId),
      ...stats
    }, '获取活动评估统计成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取活动评估统计失败');
  }
});

/**
* @swagger
 * /api/activity-evaluations:
 *   post:
 *     summary: 创建活动评价
 *     description: 创建一个新的活动评价记录
 *     tags: [活动评价]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activityId
 *               - evaluatorType
 *               - evaluatorName
 *               - overallRating
 *             properties:
 *               activityId:
 *                 type: integer
 *                 description: 活动ID
 *               registrationId:
 *                 type: integer
 *                 description: 报名记录ID
 *               parentId:
 *                 type: integer
 *                 description: 家长ID
 *               teacherId:
 *                 type: integer
 *                 description: 教师ID
 *               evaluatorType:
 *                 type: integer
 *                 description: 评价者类型（1-家长，2-教师，3-其他）
 *               evaluatorName:
 *                 type: string
 *                 description: 评价者姓名
 *               overallRating:
 *                 type: integer
 *                 description: 总体评分（1-5星）
 *               contentRating:
 *                 type: integer
 *                 description: 内容评分（1-5星）
 *               organizationRating:
 *                 type: integer
 *                 description: 组织评分（1-5星）
 *               environmentRating:
 *                 type: integer
 *                 description: 环境评分（1-5星）
 *               serviceRating:
 *                 type: integer
 *                 description: 服务评分（1-5星）
 *               comment:
 *                 type: string
 *                 description: 评价内容
 *               strengths:
 *                 type: string
 *                 description: 活动优点
 *               weaknesses:
 *                 type: string
 *                 description: 活动不足
 *               suggestions:
 *                 type: string
 *                 description: 改进建议
 *               images:
 *                 type: string
 *                 description: 图片（JSON字符串，包含图片URL数组）
 *               isPublic:
 *                 type: integer
 *                 description: 是否公开（0-不公开，1-公开）
 *     responses:
 *       200:
 *         description: 评价创建成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.post('/', checkPermission('activity:manage'), async (req, res) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const userId = req.user?.id;
    const {
      activityId,
      registrationId,
      parentId,
      teacherId,
      evaluatorType,
      evaluatorName,
      overallRating,
      contentRating,
      organizationRating,
      environmentRating,
      serviceRating,
      comment,
      strengths,
      weaknesses,
      suggestions,
      images,
      isPublic = 1
    } = req.body;

    if (!activityId || !evaluatorType || !evaluatorName || !overallRating) {
      res.status(400).json({ success: false, message: '缺少必填参数' });
      return;
    }
    
    const [result] = await sequelize.query(`
      INSERT INTO ${tenantDb}.activity_evaluations (
        activity_id, registration_id, parent_id, teacher_id,
        evaluator_type, evaluator_name, evaluation_time,
        overall_rating, content_rating, organization_rating,
        environment_rating, service_rating, comment,
        strengths, weaknesses, suggestions, images,
        is_public, status, creator_id, created_at, updated_at
      ) VALUES (
        :activityId, :registrationId, :parentId, :teacherId,
        :evaluatorType, :evaluatorName, NOW(),
        :overallRating, :contentRating, :organizationRating,
        :environmentRating, :serviceRating, :comment,
        :strengths, :weaknesses, :suggestions, :images,
        :isPublic, 1, :userId, NOW(), NOW()
      )
    `, {
      replacements: {
        activityId, 
        registrationId: registrationId || null, 
        parentId: parentId || null, 
        teacherId: teacherId || null,
        evaluatorType, 
        evaluatorName, 
        overallRating,
        contentRating: contentRating || null, 
        organizationRating: organizationRating || null, 
        environmentRating: environmentRating || null,
        serviceRating: serviceRating || null, 
        comment: comment || null, 
        strengths: strengths || null, 
        weaknesses: weaknesses || null,
        suggestions: suggestions || null, 
        images: images || null, 
        isPublic, 
        userId
      },
      type: QueryTypes.INSERT
    });

    res.json({
      success: true,
      message: '创建活动评估成功',
      data: {
        id: result,
        activityId,
        evaluatorName,
        overallRating,
        createTime: new Date()
      }
    });
  } catch (error) {
    console.error('[ACTIVITY]: 创建活动评估失败:', error);
    res.status(500).json({ success: false, message: '创建活动评估失败' });
  }
});

/**
* @swagger
 * /api/activity-evaluations:
 *   get:
 *     summary: 获取评价列表
 *     description: 获取活动评价列表，支持分页和筛选
 *     tags: [活动评价]
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
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: activityId
 *         schema:
 *           type: integer
 *         description: 活动ID
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: integer
 *         description: 家长ID
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: integer
 *         description: 教师ID
 *       - in: query
 *         name: registrationId
 *         schema:
 *           type: integer
 *         description: 报名记录ID
 *       - in: query
 *         name: evaluatorType
 *         schema:
 *           type: integer
 *         description: 评价者类型
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *         description: 最低评分
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: integer
 *         description: 最高评分
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: 状态
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: integer
 *         description: 是否公开
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: 排序字段
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: 排序方向
 *     responses:
 *       200:
 *         description: 获取评价列表成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/', checkPermission('activity:manage'), asyncHandler(activityEvaluationController.getEvaluations));

/**
* @swagger
 * /api/activity-evaluations/{id}:
 *   get:
 *     summary: 获取评价详情
 *     description: 根据ID获取活动评价详情
 *     tags: [活动评价]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 评价ID
 *     responses:
 *       200:
 *         description: 获取评价详情成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 评价不存在
 *       500:
 *         description: 服务器错误
*/
router.get('/:id', checkPermission('activity:manage'), asyncHandler(activityEvaluationController.getEvaluationById));

/**
* @swagger
 * /api/activity-evaluations/{id}:
 *   put:
 *     summary: 更新评价
 *     description: 根据ID更新活动评价
 *     tags: [活动评价]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 评价ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               overallRating:
 *                 type: integer
 *                 description: 总体评分（1-5星）
 *               contentRating:
 *                 type: integer
 *                 description: 内容评分（1-5星）
 *               organizationRating:
 *                 type: integer
 *                 description: 组织评分（1-5星）
 *               environmentRating:
 *                 type: integer
 *                 description: 环境评分（1-5星）
 *               serviceRating:
 *                 type: integer
 *                 description: 服务评分（1-5星）
 *               comment:
 *                 type: string
 *                 description: 评价内容
 *               strengths:
 *                 type: string
 *                 description: 活动优点
 *               weaknesses:
 *                 type: string
 *                 description: 活动不足
 *               suggestions:
 *                 type: string
 *                 description: 改进建议
 *               images:
 *                 type: string
 *                 description: 图片（JSON字符串，包含图片URL数组）
 *               isPublic:
 *                 type: integer
 *                 description: 是否公开（0-不公开，1-公开）
 *     responses:
 *       200:
 *         description: 评价更新成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权限
 *       404:
 *         description: 评价不存在
 *       500:
 *         description: 服务器错误
*/
router.put('/:id', checkPermission('activity:manage'), asyncHandler(activityEvaluationController.updateEvaluation));

/**
* @swagger
 * /api/activity-evaluations/{id}:
 *   delete:
 *     summary: 删除评价
 *     description: 根据ID删除活动评价
 *     tags: [活动评价]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 评价ID
 *     responses:
 *       200:
 *         description: 评价删除成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权限
 *       404:
 *         description: 评价不存在
 *       500:
 *         description: 服务器错误
*/
router.delete('/:id', checkPermission('activity:manage'), asyncHandler(activityEvaluationController.deleteEvaluation));

/**
* @swagger
 * /api/activity-evaluations/{id}/reply:
 *   post:
 *     summary: 回复评价
 *     description: 回复活动评价
 *     tags: [活动评价]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 评价ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 回复内容
 *     responses:
 *       200:
 *         description: 回复评价成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 评价不存在
 *       500:
 *         description: 服务器错误
*/
router.post('/:id/reply', checkPermission('activity:manage'), asyncHandler(activityEvaluationController.replyEvaluation));

/**
* @swagger
 * /api/activity-evaluations/activity/{activityId}/statistics:
 *   get:
 *     summary: 获取评价统计
 *     description: 获取特定活动的评价统计数据
 *     tags: [活动评价]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 活动ID
 *     responses:
 *       200:
 *         description: 获取评价统计成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 活动不存在
 *       500:
 *         description: 服务器错误
*/
router.get('/activity/:activityId/statistics', checkPermission('activity:manage'), asyncHandler(activityEvaluationController.getEvaluationStatistics));

/**
* @swagger
 * /api/activity-evaluations/satisfaction-report:
 *   get:
 *     summary: 生成满意度报表
 *     description: 根据条件生成活动满意度报表
 *     tags: [活动评价]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期
 *       - in: query
 *         name: kindergartenId
 *         schema:
 *           type: integer
 *         description: 幼儿园ID
 *     responses:
 *       200:
 *         description: 生成满意度报表成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/satisfaction-report', checkPermission('activity:manage'), asyncHandler(activityEvaluationController.generateSatisfactionReport));

export default router; 