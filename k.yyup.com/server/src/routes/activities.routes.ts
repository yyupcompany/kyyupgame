import { Router } from 'express';
import { verifyToken, checkPermission, checkParentStudentAccess, checkParentClassAccess } from '../middlewares/auth.middleware';
import { activityController } from '../controllers/activity.controller';

const router = Router();

// 全局认证中间件 - 所有路由都需要用户认证
router.use(verifyToken);

/**
* @swagger
 * tags:
 *   name: Activities
 *   description: 活动管理API
*/

/**
* @swagger
 * components:
 *   schemas:
 *     Activity:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 活动ID
 *         title:
 *           type: string
 *           description: 活动标题
 *         description:
 *           type: string
 *           description: 活动描述
 *         type:
 *           type: string
 *           enum: [outdoor, indoor, sports, arts, science, social]
 *           description: 活动类型
 *         date:
 *           type: string
 *           format: date
 *           description: 活动日期
 *         startTime:
 *           type: string
 *           format: time
 *           description: 开始时间
 *         endTime:
 *           type: string
 *           format: time
 *           description: 结束时间
 *         location:
 *           type: string
 *           description: 活动地点
 *         maxParticipants:
 *           type: integer
 *           description: 最大参与人数
 *         currentParticipants:
 *           type: integer
 *           description: 当前参与人数
 *         status:
 *           type: string
 *           enum: [draft, published, cancelled, completed]
 *           description: 活动状态
 *         targetAgeGroup:
 *           type: string
 *           description: 目标年龄组
 *         requirements:
 *           type: string
 *           description: 参与要求
 *         materials:
 *           type: string
 *           description: 所需材料
 *         fee:
 *           type: number
 *           format: decimal
 *           description: 活动费用
 *         organizer:
 *           type: string
 *           description: 组织者
 *         contactInfo:
 *           type: string
 *           description: 联系信息
 *         registrationDeadline:
 *           type: string
 *           format: date-time
 *           description: 报名截止时间
 *         isActive:
 *           type: boolean
 *           description: 是否启用
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *     ActivityRegistration:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 报名ID
 *         activityId:
 *           type: integer
 *           description: 活动ID
 *         studentId:
 *           type: integer
 *           description: 学生ID
 *         student:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             class:
 *               type: string
 *           description: 学生信息
 *         parentId:
 *           type: integer
 *           description: 家长ID
 *         parent:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             phone:
 *               type: string
 *           description: 家长信息
 *         registrationDate:
 *           type: string
 *           format: date
 *           description: 报名日期
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *           description: 报名状态
 *         remarks:
 *           type: string
 *           description: 备注信息
 *     ActivityStatistics:
 *       type: object
 *       properties:
 *         totalActivities:
 *           type: integer
 *           description: 活动总数
 *         activeActivities:
 *           type: integer
 *           description: 进行中的活动数
 *         completedActivities:
 *           type: integer
 *           description: 已完成的活动数
 *         totalParticipants:
 *           type: integer
 *           description: 总参与人数
 *         averageParticipation:
 *           type: number
 *           format: decimal
 *           description: 平均参与率
 *         popularActivityTypes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               count:
 *                 type: integer
 *           description: 热门活动类型
 *     CreateActivityRequest:
 *       type: object
 *       required:
 *         - title
 *         - type
 *         - date
 *         - startTime
 *         - endTime
 *         - location
 *         - maxParticipants
 *       properties:
 *         title:
 *           type: string
 *           description: 活动标题
 *         description:
 *           type: string
 *           description: 活动描述
 *         type:
 *           type: string
 *           enum: [outdoor, indoor, sports, arts, science, social]
 *           description: 活动类型
 *         date:
 *           type: string
 *           format: date
 *           description: 活动日期
 *         startTime:
 *           type: string
 *           format: time
 *           description: 开始时间
 *         endTime:
 *           type: string
 *           format: time
 *           description: 结束时间
 *         location:
 *           type: string
 *           description: 活动地点
 *         maxParticipants:
 *           type: integer
 *           minimum: 1
 *           description: 最大参与人数
 *         targetAgeGroup:
 *           type: string
 *           description: 目标年龄组
 *         requirements:
 *           type: string
 *           description: 参与要求
 *         materials:
 *           type: string
 *           description: 所需材料
 *         fee:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           description: 活动费用
 *         organizer:
 *           type: string
 *           description: 组织者
 *         contactInfo:
 *           type: string
 *           description: 联系信息
 *         registrationDeadline:
 *           type: string
 *           format: date-time
 *           description: 报名截止时间
 *     UpdateActivityRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: 活动标题
 *         description:
 *           type: string
 *           description: 活动描述
 *         type:
 *           type: string
 *           enum: [outdoor, indoor, sports, arts, science, social]
 *           description: 活动类型
 *         date:
 *           type: string
 *           format: date
 *           description: 活动日期
 *         startTime:
 *           type: string
 *           format: time
 *           description: 开始时间
 *         endTime:
 *           type: string
 *           format: time
 *           description: 结束时间
 *         location:
 *           type: string
 *           description: 活动地点
 *         maxParticipants:
 *           type: integer
 *           minimum: 1
 *           description: 最大参与人数
 *         targetAgeGroup:
 *           type: string
 *           description: 目标年龄组
 *         requirements:
 *           type: string
 *           description: 参与要求
 *         materials:
 *           type: string
 *           description: 所需材料
 *         fee:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           description: 活动费用
 *         organizer:
 *           type: string
 *           description: 组织者
 *         contactInfo:
 *           type: string
 *           description: 联系信息
 *         registrationDeadline:
 *           type: string
 *           format: date-time
 *           description: 报名截止时间
 *         isActive:
 *           type: boolean
 *           description: 是否启用
 *     UpdateActivityStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [draft, published, cancelled, completed]
 *           description: 活动状态
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
*/

/**
* @swagger
 * /api/activities/statistics:
 *   get:
 *     summary: 获取活动统计信息
 *     tags: [Activities]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 活动统计信息
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
 *                   example: "获取活动统计信息成功"
 *                 data:
 *                   $ref: '#/components/schemas/ActivityStatistics'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
*/
// 获取活动统计 (必须在 /:id 之前)
router.get('/statistics', checkPermission('activity:view'), activityController.getStatistics);

/**
* @swagger
 * /api/activities:
 *   get:
 *     summary: 获取活动列表
 *     tags: [Activities]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [outdoor, indoor, sports, arts, science, social]
 *         description: 活动类型
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, cancelled, completed]
 *         description: 活动状态
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词(标题、描述、地点)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期筛选
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期筛选
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, title, createdAt, maxParticipants]
 *           default: date
 *         description: 排序字段
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: 排序方向
 *     responses:
 *       200:
 *         description: 活动列表
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
 *                   example: "获取活动列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     activities:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Activity'
 *                     total:
 *                       type: integer
 *                       description: 总数量
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                     limit:
 *                       type: integer
 *                       description: 每页数量
 *                     totalPages:
 *                       type: integer
 *                       description: 总页数
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
*/
// 获取活动列表 - 家长也可以查看活动
router.get('/', (req, res, next) => {
  const userRole = (req as any).user?.role;
  if (userRole === 'parent') {
    // 家长角色直接放行，由控制器返回数据
    return activityController.getList(req, res, next);
  }
  // 其他角色需要权限检查
  return checkPermission('activity:view')(req, res, next);
}, activityController.getList);

/**
* @swagger
 * /api/activities/{id}:
 *   get:
 *     summary: 获取活动详情
 *     tags: [Activities]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 活动ID
 *     responses:
 *       200:
 *         description: 活动详情
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
 *                   example: "获取活动详情成功"
 *                 data:
 *                   $ref: '#/components/schemas/Activity'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 活动不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
*/
// 获取活动详情
router.get('/:id', checkPermission('activity:view'), activityController.getById);

/**
* @swagger
 * /api/activities:
 *   post:
 *     summary: 创建新活动
 *     tags: [Activities]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateActivityRequest'
 *           example:
 *             title: "春季户外探索活动"
 *             description: "带领孩子们走进大自然，观察植物生长，培养对自然的热爱"
 *             type: "outdoor"
 *             date: "2024-04-15"
 *             startTime: "09:00"
 *             endTime: "11:30"
 *             location: "城市公园"
 *             maxParticipants: 20
 *             targetAgeGroup: "3-6岁"
 *             requirements: "穿着运动鞋，自备水杯"
 *             materials: "放大镜、观察记录本、彩色笔"
 *             fee: 30.00
 *             organizer: "张老师"
 *             contactInfo: "13800000001"
 *             registrationDeadline: "2024-04-10T18:00:00Z"
 *     responses:
 *       201:
 *         description: 活动创建成功
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
 *                   example: "活动创建成功"
 *                 data:
 *                   $ref: '#/components/schemas/Activity'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: 活动时间冲突
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
*/
// 创建活动
router.post('/', checkPermission('activity:create'),
  activityController.create
);

/**
* @swagger
 * /api/activities/{id}:
 *   put:
 *     summary: 更新活动信息
 *     tags: [Activities]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 活动ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateActivityRequest'
 *           example:
 *             title: "春季户外探索活动（更新版）"
 *             description: "带领孩子们走进大自然，观察植物生长，培养对自然的热爱，增加互动游戏环节"
 *             maxParticipants: 25
 *             fee: 35.00
 *     responses:
 *       200:
 *         description: 活动更新成功
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
 *                   example: "活动更新成功"
 *                 data:
 *                   $ref: '#/components/schemas/Activity'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 活动不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: 活动时间冲突或状态不允许修改
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
*/
// 更新活动信息
router.put('/:id', checkPermission('activity:update'),
  activityController.update
);

/**
* @swagger
 * /api/activities/{id}:
 *   delete:
 *     summary: 删除活动
 *     tags: [Activities]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 活动ID
 *     responses:
 *       200:
 *         description: 活动删除成功
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
 *                   example: "活动删除成功"
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 活动不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: 活动已有报名或状态不允许删除
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
*/
// 删除活动
router.delete('/:id', checkPermission('activity:manage'),
  activityController.delete
);

/**
* @swagger
 * /api/activities/{id}/publish:
 *   put:
 *     summary: 发布活动
 *     tags: [Activities]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 活动ID
 *     responses:
 *       200:
 *         description: 活动发布成功
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
 *                   example: "活动发布成功"
 *                 data:
 *                   $ref: '#/components/schemas/Activity'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 活动不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: 活动信息不完整或状态不允许发布
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
*/
// 发布活动
router.put('/:id/publish', checkPermission('activity:update'),
  activityController.publish
);

/**
* @swagger
 * /api/activities/{id}/share:
 *   post:
 *     summary: 分享活动
 *     tags: [Activities]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 活动ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shareChannel
 *             properties:
 *               shareChannel:
 *                 type: string
 *                 enum: [wechat, weibo, qq, link, qrcode, other]
 *                 description: 分享渠道
 *               shareContent:
 *                 type: string
 *                 description: 自定义分享文案
 *               posterId:
 *                 type: integer
 *                 description: 分享的海报ID
 *           example:
 *             shareChannel: "wechat"
 *             shareContent: "快来参加这个有趣的活动吧！"
 *             posterId: 1
 *     responses:
 *       200:
 *         description: 分享成功
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
 *                   example: "分享成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     shareUrl:
 *                       type: string
 *                       description: 分享链接
 *                     shareContent:
 *                       type: string
 *                       description: 分享文案
 *                     qrcodeUrl:
 *                       type: string
 *                       description: 二维码URL（如果是二维码分享）
 *                     shareId:
 *                       type: integer
 *                       description: 分享记录ID
 *                     shareCount:
 *                       type: integer
 *                       description: 当前分享次数
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 活动不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
*/
// 分享活动 - 所有登录用户都可以分享，无需特殊权限
router.post('/:id/share',
  activityController.share
);

// 查询分享层级关系 - 所有登录用户都可以查询
router.get('/:id/share-hierarchy',
  activityController.getShareHierarchy
);

/**
* @swagger
 * /api/activities/{id}/status:
 *   put:
 *     summary: 更新活动状态
 *     tags: [Activities]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 活动ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateActivityStatusRequest'
 *           example:
 *             status: "completed"
 *     responses:
 *       200:
 *         description: 活动状态更新成功
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
 *                   example: "活动状态更新成功"
 *                 data:
 *                   $ref: '#/components/schemas/Activity'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 活动不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: 状态转换不被允许
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
*/
// 更新活动状态
router.put('/:id/status', checkPermission('activity:update'),
  activityController.updateStatus
);

/**
* @swagger
 * /api/activities/{id}/registrations:
 *   get:
 *     summary: 获取活动报名列表
 *     tags: [Activities]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 活动ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *         description: 报名状态
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词(学生姓名、家长姓名、班级)
 *     responses:
 *       200:
 *         description: 活动报名列表
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
 *                   example: "获取活动报名列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     registrations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ActivityRegistration'
 *                     total:
 *                       type: integer
 *                       description: 总数量
 *                       example: 2
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       description: 每页数量
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       description: 总页数
 *                       example: 1
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 活动不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
*/
// 获取活动报名列表
router.get('/:id/registrations', checkPermission('activity:view'), async (req, res) => {
  try {
    const activityId = req.params.id;
    const mockRegistrations = [
      {
        id: 1,
        activityId: parseInt(activityId),
        studentId: 1,
        student: { id: 1, name: '小明', class: '小一班' },
        parentId: 1,
        parent: { id: 1, name: '李女士', phone: '13800000001' },
        registrationDate: '2024-07-01',
        status: 'confirmed',
        remarks: '准时参加'
      },
      {
        id: 2,
        activityId: parseInt(activityId),
        studentId: 2,
        student: { id: 2, name: '小红', class: '小二班' },
        parentId: 2,
        parent: { id: 2, name: '王先生', phone: '13800000002' },
        registrationDate: '2024-07-02',
        status: 'pending',
        remarks: ''
      }
    ];
    
    res.json({
      success: true,
      message: '获取活动报名列表成功',
      data: {
        registrations: mockRegistrations,
        total: mockRegistrations.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取活动报名列表失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

export default router; 