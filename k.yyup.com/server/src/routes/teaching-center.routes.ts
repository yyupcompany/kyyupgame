/**
* @swagger
 * components:
 *   schemas:
 *     Teaching-center:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Teaching-center ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Teaching-center 名称
 *           example: "示例Teaching-center"
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
 *     CreateTeaching-centerRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Teaching-center 名称
 *           example: "新Teaching-center"
 *     UpdateTeaching-centerRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Teaching-center 名称
 *           example: "更新后的Teaching-center"
 *     Teaching-centerListResponse:
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
 *                 $ref: '#/components/schemas/Teaching-center'
 *         message:
 *           type: string
 *           example: "获取teaching-center列表成功"
 *     Teaching-centerResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Teaching-center'
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
 * teaching-center管理路由文件
 * 提供teaching-center的基础CRUD操作
*
 * 功能包括：
 * - 获取teaching-center列表
 * - 创建新teaching-center
 * - 获取teaching-center详情
 * - 更新teaching-center信息
 * - 删除teaching-center
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { TeachingCenterController } from '../controllers/teaching-center.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// 应用认证中间件
router.use(verifyToken);

/**
* @swagger
 * /api/teaching-center/course-progress:
 *   get:
 *     summary: 获取课程进度统计数据
 *     description: 获取课程进度的统计信息
 *     tags:
 *       - 教学中心
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/course-progress',
  requireRole(['admin', 'principal', 'teacher']),
  TeachingCenterController.getCourseProgressStats
);

/**
* @swagger
 * /api/teaching-center/class-progress/{classId}/{coursePlanId}:
 *   get:
 *     summary: 获取班级详细达标情况
 *     description: 获取指定班级和课程计划的详细达标情况
 *     tags:
 *       - 教学中心
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: coursePlanId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/class-progress/:classId/:coursePlanId',
  requireRole(['admin', 'principal', 'teacher']),
  TeachingCenterController.getClassDetailedProgress
);

/**
* @swagger
 * /api/teaching-center/confirm-completion/{progressId}:
 *   put:
 *     summary: 教师确认完成课程
 *     description: 教师确认课程进度已完成
 *     tags:
 *       - 教学中心
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: progressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 确认成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.put('/confirm-completion/:progressId',
  requireRole(['admin', 'principal', 'teacher']),
  TeachingCenterController.confirmCourseCompletion
);

/**
* @swagger
 * /api/teaching-center/outdoor-training:
 *   get:
 *     summary: 获取户外训练统计数据
 *     description: 获取户外训练活动的统计信息
 *     tags:
 *       - 教学中心
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/outdoor-training',
  requireRole(['admin', 'principal', 'teacher']),
  TeachingCenterController.getOutdoorTrainingStats
);

/**
* @swagger
 * /api/teaching-center/outdoor-training/class/{classId}:
 *   get:
 *     summary: 获取班级户外训练详情
 *     description: 获取指定班级的户外训练详细信息
 *     tags:
 *       - 教学中心
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/outdoor-training/class/:classId',
  requireRole(['admin', 'principal', 'teacher']),
  TeachingCenterController.getClassOutdoorTrainingDetails
);

/**
* @swagger
 * /api/teaching-center/outdoor-training:
 *   post:
 *     summary: 记录户外训练活动
 *     description: 记录新的户外训练活动
 *     tags:
 *       - 教学中心
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classId
 *               - activityName
 *               - date
 *             properties:
 *               classId:
 *                 type: string
 *               activityName:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: 记录成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/outdoor-training',
  requireRole(['teacher']),
  TeachingCenterController.recordOutdoorTraining
);

/**
* @swagger
 * /api/teaching-center/external-display:
 *   get:
 *     summary: 获取校外展示统计数据
 *     description: 获取校外展示活动的统计信息
 *     tags:
 *       - 教学中心
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/external-display',
  requireRole(['admin', 'principal', 'teacher']),
  TeachingCenterController.getExternalDisplayStats
);

/**
* @swagger
 * /api/teaching-center/external-display/class/{classId}:
 *   get:
 *     summary: 获取班级校外展示详情
 *     description: 获取指定班级的校外展示详细信息
 *     tags:
 *       - 教学中心
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/external-display/class/:classId',
  requireRole(['admin', 'principal', 'teacher']),
  TeachingCenterController.getClassExternalDisplayDetails
);

/**
* @swagger
 * /api/teaching-center/external-display:
 *   post:
 *     summary: 记录校外展示活动
 *     description: 记录新的校外展示活动
 *     tags:
 *       - 教学中心
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classId
 *               - activityName
 *               - date
 *             properties:
 *               classId:
 *                 type: string
 *               activityName:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: 记录成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/external-display',
  requireRole(['teacher']),
  TeachingCenterController.recordExternalDisplay
);

/**
* @swagger
 * /api/teaching-center/championship:
 *   get:
 *     summary: 获取锦标赛统计数据
 *     description: 获取全员锦标赛的统计信息
 *     tags:
 *       - 教学中心
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/championship',
  requireRole(['admin', 'principal', 'teacher']),
  TeachingCenterController.getChampionshipStats
);

/**
* @swagger
 * /api/teaching-center/championship/{championshipId}:
 *   get:
 *     summary: 获取锦标赛详情
 *     description: 获取指定锦标赛的详细信息
 *     tags:
 *       - 教学中心
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: championshipId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/championship/:championshipId',
  requireRole(['admin', 'principal', 'teacher']),
  TeachingCenterController.getChampionshipDetails
);

/**
* @swagger
 * /api/teaching-center/championship:
 *   post:
 *     summary: 创建锦标赛
 *     description: 创建新的全员锦标赛
 *     tags:
 *       - 教学中心
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: 创建成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/championship',
  requireRole(['admin', 'principal']),
  TeachingCenterController.createChampionship
);

/**
* @swagger
 * /api/teaching-center/championship/{championshipId}/status:
 *   put:
 *     summary: 更新锦标赛状态
 *     description: 更新指定锦标赛的状态
 *     tags:
 *       - 教学中心
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: championshipId
 *         required: true
 *         schema:
 *           type: string
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
 *                 enum: [pending, ongoing, completed, cancelled]
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.put('/championship/:championshipId/status',
  requireRole(['admin', 'principal']),
  TeachingCenterController.updateChampionshipStatus
);

/**
* @swagger
 * /api/teaching-center/media:
 *   post:
 *     summary: 上传教学媒体文件
 *     description: 上传教学相关的媒体文件
 *     tags:
 *       - 教学中心
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: 上传成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/media',
  requireRole(['teacher']),
  TeachingCenterController.uploadTeachingMedia
);

/**
* @swagger
 * /api/teaching-center/media:
 *   get:
 *     summary: 获取教学媒体列表
 *     description: 获取教学媒体文件列表
 *     tags:
 *       - 教学中心
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/media',
  requireRole(['admin', 'principal', 'teacher']),
  TeachingCenterController.getTeachingMediaList
);

export default router;
