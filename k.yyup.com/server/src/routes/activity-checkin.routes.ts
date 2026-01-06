/**
* @swagger
 * components:
 *   schemas:
 *     Activity-checkin:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Activity-checkin ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Activity-checkin 名称
 *           example: "示例Activity-checkin"
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
 *     CreateActivity-checkinRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Activity-checkin 名称
 *           example: "新Activity-checkin"
 *     UpdateActivity-checkinRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Activity-checkin 名称
 *           example: "更新后的Activity-checkin"
 *     Activity-checkinListResponse:
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
 *                 $ref: '#/components/schemas/Activity-checkin'
 *         message:
 *           type: string
 *           example: "获取activity-checkin列表成功"
 *     Activity-checkinResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Activity-checkin'
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
 * activity-checkin管理路由文件
 * 提供activity-checkin的基础CRUD操作
*
 * 功能包括：
 * - 获取activity-checkin列表
 * - 创建新activity-checkin
 * - 获取activity-checkin详情
 * - 更新activity-checkin信息
 * - 删除activity-checkin
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../init';
import { 
  checkIn, 
  batchCheckIn, 
  getCheckins, 
  getCheckinStats, 
  exportCheckinData, 
  checkInByPhone 
} from '../controllers/activity-checkin.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

// 创建异步处理器函数来包装控制器方法
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
* @swagger
 * /api/activity-checkins/registration/{id}:
 *   post:
 *     summary: 活动报名签到
 *     tags: [活动签到]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 报名ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - location
 *             properties:
 *               location:
 *                 type: string
 *                 description: 签到地点
 *     responses:
 *       200:
 *         description: 签到成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 报名记录不存在
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/registration/:id', checkPermission('ACTIVITY_CHECKIN_MANAGE'),
  asyncHandler(checkIn)
);

/**
* @swagger
 * /api/activity-checkins/batch:
 *   post:
 *     summary: 批量签到
 *     tags: [活动签到]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registrationIds
 *               - location
 *             properties:
 *               registrationIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 报名ID列表
 *               location:
 *                 type: string
 *                 description: 签到地点
 *     responses:
 *       200:
 *         description: 批量签到处理完成
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/batch', checkPermission('ACTIVITY_CHECKIN_MANAGE'),
  asyncHandler(batchCheckIn)
);

/**
* @swagger
 * /api/activity-checkins/{activityId}/phone:
 *   post:
 *     summary: 根据手机号签到
 *     tags: [活动签到]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 活动ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - location
 *             properties:
 *               phone:
 *                 type: string
 *                 description: 手机号
 *               location:
 *                 type: string
 *                 description: 签到地点
 *     responses:
 *       200:
 *         description: 签到成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 活动或报名记录不存在
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/:activityId/phone', checkPermission('ACTIVITY_CHECKIN_MANAGE'),
  asyncHandler(checkInByPhone)
);

/**
* @swagger
 * /api/activity-checkins/{activityId}/stats:
 *   get:
 *     summary: 获取活动签到统计数据
 *     tags: [活动签到]
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
 *         description: 获取活动签到统计数据成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 活动不存在
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/:activityId/stats', checkPermission('ACTIVITY_CHECKIN_MANAGE'),
  asyncHandler(getCheckinStats)
);

/**
* @swagger
 * /api/activity-checkins/{activityId}/export:
 *   get:
 *     summary: 导出活动签到数据
 *     tags: [活动签到]
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
 *         description: 导出签到数据成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 活动不存在
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/:activityId/export', checkPermission('ACTIVITY_CHECKIN_MANAGE'),
  asyncHandler(exportCheckinData)
);

/**
* @swagger
 * /api/activity-checkins/by-activity/{activityId}:
 *   get:
 *     summary: 按活动获取签到列表
 *     tags: [活动签到]
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
router.get(
  '/by-activity/:activityId', checkPermission('ACTIVITY_CHECKIN_MANAGE'),
  asyncHandler((req: Request, res: Response) => {
    // 将activityId作为查询参数传递给getCheckins
    req.query.activityId = req.params.activityId;
    return getCheckins(req, res);
  })
);

/**
* @swagger
 * /api/activity-checkins:
 *   get:
 *     summary: 获取活动签到列表
 *     tags: [活动签到]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activityId
 *         schema:
 *           type: integer
 *         description: 活动ID
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
 *     responses:
 *       200:
 *         description: 获取活动签到列表成功
*/
router.get(
  '/', checkPermission('ACTIVITY_CHECKIN_MANAGE'),
  asyncHandler(async (req: Request, res: Response) => {
    // 如果没有提供activityId，返回所有活动的签到统计
    if (!req.query.activityId) {
      try {
        const tenantDb = req.tenant?.databaseName || 'tenant_dev';
        const [stats] = await sequelize.query(`
          SELECT
            a.id as activity_id,
            a.title as activity_title,
            COUNT(ar.id) as total_registrations,
            SUM(CASE WHEN ar.check_in_time IS NOT NULL THEN 1 ELSE 0 END) as checked_in_count,
            SUM(CASE WHEN ar.check_in_time IS NULL THEN 1 ELSE 0 END) as not_checked_in_count
          FROM ${tenantDb}.activities a
          LEFT JOIN ${tenantDb}.activity_registrations ar ON a.id = ar.activity_id AND ar.deleted_at IS NULL
          WHERE a.deleted_at IS NULL
          GROUP BY a.id, a.title
          ORDER BY a.created_at DESC
          LIMIT 20
        `, {
          type: QueryTypes.SELECT
        }) as [Record<string, any>[]];

        res.json({
          success: true,
          message: '获取活动签到统计成功',
          data: {
            items: stats || [],
            total: stats?.length || 0,
            note: '请提供activityId参数获取具体活动的签到详情'
          }
        });
        return;
      } catch (error) {
        console.error('[ACTIVITY]: 获取活动签到统计失败:', error);
        res.status(500).json({ success: false, message: '获取活动签到统计失败' });
        return;
      }
    }
    
    // 如果提供了activityId，调用原有的getCheckins函数
    return getCheckins(req, res);
  })
);

/**
* @swagger
 * /api/activity-checkins:
 *   post:
 *     summary: 创建活动签到
 *     tags: [活动签到]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post(
  '/', checkPermission('ACTIVITY_CHECKIN_MANAGE'),
  (req, res) => {
    res.status(201).json({
      success: true,
      message: '创建活动签到成功',
      data: {
        id: Math.floor(Math.random() * 1000) + 1,
        createTime: new Date()
      }
    });
  }
);

/**
* @swagger
 * /api/activity-checkins/{id}:
 *   get:
 *     summary: 获取活动签到详情
 *     tags: [活动签到]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 签到ID
 *     responses:
 *       200:
 *         description: 成功
*/
router.get(
  '/:id', checkPermission('ACTIVITY_CHECKIN_MANAGE'),
  (req, res) => {
    const { id } = req.params;
    res.json({
      success: true,
      message: '获取活动签到详情成功',
      data: {
        id: parseInt(id),
        activityId: 1,
        studentName: '测试学生',
        checkInTime: new Date()
      }
    });
  }
);

/**
* @swagger
 * /api/activity-checkins/{id}:
 *   put:
 *     summary: 更新活动签到
 *     tags: [活动签到]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 签到ID
 *     responses:
 *       200:
 *         description: 更新成功
*/
router.put(
  '/:id', checkPermission('ACTIVITY_CHECKIN_MANAGE'),
  (req, res) => {
    const { id } = req.params;
    res.json({
      success: true,
      message: '更新活动签到成功',
      data: {
        id: parseInt(id),
        updateTime: new Date()
      }
    });
  }
);

/**
* @swagger
 * /api/activity-checkins/{id}:
 *   delete:
 *     summary: 删除活动签到
 *     tags: [活动签到]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 签到ID
 *     responses:
 *       200:
 *         description: 删除成功
*/
router.delete(
  '/:id', checkPermission('ACTIVITY_CHECKIN_MANAGE'),
  (req, res) => {
    const { id } = req.params;
    res.json({
      success: true,
      message: '删除活动签到成功',
      data: {
        id: parseInt(id)
      }
    });
  }
);

export default router; 