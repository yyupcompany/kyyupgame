"use strict";
exports.__esModule = true;
var express_1 = require("express");
var teaching_center_controller_1 = require("../controllers/teaching-center.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var role_middleware_1 = require("../middlewares/role.middleware");
var router = (0, express_1.Router)();
// 应用认证中间件
router.use(auth_middleware_1.authMiddleware);
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
router.get('/course-progress', (0, role_middleware_1.requireRole)(['admin', 'principal', 'teacher']), teaching_center_controller_1.TeachingCenterController.getCourseProgressStats);
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
router.get('/class-progress/:classId/:coursePlanId', (0, role_middleware_1.requireRole)(['admin', 'principal', 'teacher']), teaching_center_controller_1.TeachingCenterController.getClassDetailedProgress);
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
router.put('/confirm-completion/:progressId', (0, role_middleware_1.requireRole)(['admin', 'principal', 'teacher']), teaching_center_controller_1.TeachingCenterController.confirmCourseCompletion);
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
router.get('/outdoor-training', (0, role_middleware_1.requireRole)(['admin', 'principal', 'teacher']), teaching_center_controller_1.TeachingCenterController.getOutdoorTrainingStats);
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
router.get('/outdoor-training/class/:classId', (0, role_middleware_1.requireRole)(['admin', 'principal', 'teacher']), teaching_center_controller_1.TeachingCenterController.getClassOutdoorTrainingDetails);
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
router.post('/outdoor-training', (0, role_middleware_1.requireRole)(['teacher']), teaching_center_controller_1.TeachingCenterController.recordOutdoorTraining);
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
router.get('/external-display', (0, role_middleware_1.requireRole)(['admin', 'principal', 'teacher']), teaching_center_controller_1.TeachingCenterController.getExternalDisplayStats);
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
router.get('/external-display/class/:classId', (0, role_middleware_1.requireRole)(['admin', 'principal', 'teacher']), teaching_center_controller_1.TeachingCenterController.getClassExternalDisplayDetails);
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
router.post('/external-display', (0, role_middleware_1.requireRole)(['teacher']), teaching_center_controller_1.TeachingCenterController.recordExternalDisplay);
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
router.get('/championship', (0, role_middleware_1.requireRole)(['admin', 'principal', 'teacher']), teaching_center_controller_1.TeachingCenterController.getChampionshipStats);
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
router.get('/championship/:championshipId', (0, role_middleware_1.requireRole)(['admin', 'principal', 'teacher']), teaching_center_controller_1.TeachingCenterController.getChampionshipDetails);
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
router.post('/championship', (0, role_middleware_1.requireRole)(['admin', 'principal']), teaching_center_controller_1.TeachingCenterController.createChampionship);
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
router.put('/championship/:championshipId/status', (0, role_middleware_1.requireRole)(['admin', 'principal']), teaching_center_controller_1.TeachingCenterController.updateChampionshipStatus);
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
router.post('/media', (0, role_middleware_1.requireRole)(['teacher']), teaching_center_controller_1.TeachingCenterController.uploadTeachingMedia);
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
router.get('/media', (0, role_middleware_1.requireRole)(['admin', 'principal', 'teacher']), teaching_center_controller_1.TeachingCenterController.getTeachingMediaList);
exports["default"] = router;
