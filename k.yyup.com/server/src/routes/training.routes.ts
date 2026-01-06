import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import trainingController from '../controllers/training.controller';

/**
* @swagger
 * tags: [训练中心]
 * description: 训练中心API接口
*/
const router = Router();

/**
* @swagger
 * /api/training/recommend:
 *   post:
 *     tags: [训练中心]
 *     summary: 获取训练推荐
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               childId:
 *                 type: integer
 *                 description: 孩子ID
 *               assessmentReportId:
 *                 type: integer
 *                 description: 测评报告ID
 *               preferences:
 *                 type: object
 *                 properties:
 *                   interests:
 *                     type: array
 *                     items:
 *                       type: string
 *                   difficulty:
 *                     type: string
 *                     enum: [easy, medium, hard]
 *                   dailyTime:
 *                     type: integer
 *                   focusAreas:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: 推荐成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TrainingRecommendation'
*/
// router.post('/recommend', verifyToken, trainingController.getRecommendations); // 临时注释，避免启动错误

/**
* @swagger
 * /api/training/plans:
 *   post:
 *     tags: [训练中心]
 *     summary: 创建训练计划
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - childId
 *               - title
 *               - targetAbilities
 *               - activityIds
 *             properties:
 *               childId:
 *                 type: integer
 *                 description: 孩子ID
 *               assessmentReportId:
 *                 type: integer
 *                 description: 关联的测评报告ID
 *               title:
 *                 type: string
 *                 description: 计划标题
 *               description:
 *                 type: string
 *                 description: 计划描述
 *               targetAbilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 目标能力维度
 *               activityIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 训练活动ID列表
 *               durationDays:
 *                 type: integer
 *                 description: 训练周期(天)
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *                 description: 难度等级
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrainingPlan'
*/
// router.post('/plans', verifyToken, trainingController.createPlan); // 临时禁用，控制器方法有问题

/**
* @swagger
 * /api/training/plans/{planId}:
 *   get:
 *     tags: [训练中心]
 *     summary: 获取训练计划详情
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: planId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           description: 训练计划ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrainingPlan'
*/
router.get('/plans/:planId', verifyToken, trainingController.getPlanById);

/**
* @swagger
 * /api/training/plans:
 *   get:
 *     tags: [训练中心]
 *     summary: 获取训练计划列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: childId
 *         in: query
 *         schema:
 *           type: integer
 *           description: 孩子ID
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [active, completed, paused]
 *           description: 计划状态
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
 *                     plans:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TrainingPlan'
 *                     total:
 *                       type: integer
 *                       description: 总计划数
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                     pageSize:
 *                       type: integer
 *                       description: 每页大小
*/
router.get('/plans', verifyToken, trainingController.getPlans);

/**
* @swagger
 * /api/training/plans/{planId}:
 *   put:
 *     tags: [训练中心]
 *     summary: 更新训练计划
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: planId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           description: 训练计划ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, completed, paused]
 *                 description: 计划状态
 *               activities:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 活动ID列表
 *               progress:
 *                 type: integer
 *                 description: 完成进度百分比
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrainingPlan'
*/
router.put('/plans/:planId', verifyToken, trainingController.updatePlan);

/**
* @swagger
 * /api/training/daily-tasks:
 *   get:
 *     tags: [训练中心]
 *     summary: 获取今日训练任务
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: childId
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *           description: 孩子ID
 *       - name: date
 *         in: query
 *         schema:
 *           type: string
 *           description: 日期(YYYY-MM-DD)
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
 *                     date:
 *                       type: string
 *                       example: "2025-12-11"
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DailyTask'
 *                     progress:
 *                       type: object
 *                       properties:
 *                         completedTasks:
 *                           type: integer
 *                         totalTasks:
 *                           type: integer
 *                         estimatedTimeRemaining:
 *                           type: integer
*/
router.get('/daily-tasks', verifyToken, trainingController.getDailyTasks);

/**
* @swagger
 * /api/training/activities:
 *   get:
 *     tags: [训练中心]
 *     summary: 获取训练活动列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: activityType
 *         in: query
 *         schema:
 *           type: string
 *           enum: [cognitive, motor, language, social]
 *           description: 活动类型
 *       - name: childAge
 *         in: query
 *         schema:
 *           type: integer
 *           description: 孩子年龄
 *       - name: difficulty
 *         in: query
 *         schema:
 *           type: integer
 *           description: 难度等级
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
 *                   type: array
 *                   items:
 *                     $ref: '/components/schemas/TrainingActivity'
*/
router.get('/activities', verifyToken, trainingController.getActivities);

/**
* @swagger
 * /api/training/activities/{activityId}:
 *   get:
 *     tags: [训练中心]
 *     summary: 获取训练活动详情
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: activityId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           description: 训练活动ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '/components/schemas/TrainingActivity'
*/
router.get('/activities/:activityId', verifyToken, trainingController.getActivityById);

/**
* @swagger
 * /api/training/start-activity:
 *   post:
 *     tags: [训练中心]
 *     summary: 开始训练活动
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *               - activityId
 *               - childId
 *             properties:
 *               planId:
 *                 type: integer
 *                 description: 训练计划ID
 *               activityId:
 *                 type: integer
 *                 description: 训练活动ID
 *               childId:
 *                 type: integer
 *                 description: 孩子ID
 *     responses:
 *       200:
 *         description: 开始成功
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
 *                     sessionId:
 *                       type: string
 *                       description: 会话ID
 *                     gameKey:
 *                       type: string
 *                       description: 游戏Key
 *                     instructions:
 *                       type: string
 *                       description: 活动指导
* */
router.post('/start-activity', verifyToken, trainingController.startActivity);

/**
* @swagger
 * /api/training/complete-activity:
 *   post:
 *     tags: [训练中心]
 *     summary: 完成训练活动
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *               - activityId
 *               - childId
 *               - durationSeconds
 *               - performanceData
 *             properties:
 *               planId:
 *                 type: integer
 *                 description: 训练计划ID
 *               activityId:
 *                 type: integer
 *                 description: 训练活动ID
 *               childId:
 *                 type: integer
 *                 description: 孩子ID
 *               gameRecordId:
 *                 type: integer
 *                 description: 游戏记录ID
 *               durationSeconds:
 *                 type: integer
 *                 description: 实际用时(秒)
 *               score:
 *                 type: integer
 *                 description: 得分
 *               accuracy:
 *                 type: number
 *                 description: 准确率
 *               performanceData:
 *                 type: object
 *                 description: 性能数据
 *               parentNotes:
 *                 type: string
 *                 description: 家长观察记录
 *     responses:
 *       200:
 *         description: 完成成功
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
 *                     recordId:
 *                       type: integer
 *                       description: 训练记录ID
 *                     feedback:
 *                       type: string
 *                       description: AI反馈
 *                     achievements:
 *                       type: array
 *                       items:
 *                         $ref: '/components/schemas/TrainingAchievement'
*/
router.post('/complete-activity', verifyToken, trainingController.completeActivity);

/**
* @swagger
 * /api/training/progress:
 *   get:
 *     tags: [训练中心]
 *     summary: 获取训练进度统计
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: childId
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *           description: 孩子ID
 *       - name: planId
 *         in: query
 *         schema:
 *           type: integer
 *           description: 训练计划ID
 *       - name: period
 *         in: query
 *         schema:
 *           type: string
 *           enum: [week, month, quarter]
 *           description: 统计周期
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
 *                   $ref: '#/components/schemas/TrainingProgress'
*/
router.get('/progress', verifyToken, trainingController.getProgress);

/**
* @swagger
 * /api/training/achievements:
 *   get:
 *     tags: [训练中心]
 *     summary: 获取成就列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: childId
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *           description: 孩子ID
 *       - name: isEarned
 *         in: query
 *         schema:
 *           type: boolean
 *           description: 是否已获得
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
 *                     achievements:
 *                       type: array
 *                       items:
 *                         $ref: '/components/schemas/TrainingAchievement'
 *                     totalPoints:
 *                       type: integer
 *                       description: 总积分
*/
router.get('/achievements', verifyToken, trainingController.getAchievements);

/**
* @swagger
 * /api/training/reports/{planId}:
 *   get:
 *     tags: [训练中心]
 *     summary: 获取训练报告
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: planId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           description: 训练计划ID
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
 *                     planInfo:
 *                       $ref: '#/components/schemas/TrainingPlan'
 *                     progress:
 *                       $ref: '#/components/schemas/TrainingProgress'
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: string
 *                     nextSteps:
 *                       type: array
 *                       items:
 *                         type: string
*/
router.get('/reports/:planId', verifyToken, trainingController.getTrainingReport);

export default router;