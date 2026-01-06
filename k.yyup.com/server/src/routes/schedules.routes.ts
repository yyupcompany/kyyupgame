import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { ApiResponse } from '../utils/apiResponse';
import ScheduleService, { CreateScheduleDto, UpdateScheduleDto, ScheduleQueryParams } from '../services/system/schedule.service';

const router = express.Router();

/**
* @swagger
 * components:
 *   schemas:
 *     Schedule:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 日程ID
 *         title:
 *           type: string
 *           description: 日程标题
 *         description:
 *           type: string
 *           description: 日程描述
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: 开始时间
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: 结束时间
 *         location:
 *           type: string
 *           description: 地点
 *         userId:
 *           type: integer
 *           description: 用户ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
*/

/**
* @swagger
 * /api/schedules:
 *   get:
 *     summary: 获取日程列表
 *     tags: [Schedules]
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
 *         name: location
 *         schema:
 *           type: string
 *         description: 地点
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/', verifyToken, async (req, res) => {
  try {
    const params: ScheduleQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      location: req.query.location as string,
      userId: req.query.userId ? parseInt(req.query.userId as string) : undefined
    };

    const result = await ScheduleService.getSchedules(params);
    const totalPages = Math.ceil(result.total / result.limit);

    return ApiResponse.success(res, {
      items: result.schedules,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取日程列表失败');
  }
});

// 获取日程统计 (必须在 /:id 之前)
/**
* @swagger
 * /api/schedules/statistics:
 *   get:
 *     summary: 获取日程统计
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 统计数据获取成功
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
 *                   description: 日程统计数据
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/statistics', verifyToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const stats = await ScheduleService.getScheduleStatistics(userId);

    return ApiResponse.success(res, stats);
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取日程统计失败');
  }
});

/**
* @swagger
 * /api/schedules/stats:
 *   get:
 *     summary: 获取日程统计（别名）
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 统计数据获取成功
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
 *                   description: 日程统计数据
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
// 获取日程统计 - 别名路由 (必须在 /:id 之前)
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const stats = await ScheduleService.getScheduleStatistics(userId);

    return ApiResponse.success(res, stats);
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取日程统计失败');
  }
});

// 获取日历视图 (必须在 /:id 之前)
router.get('/calendar/:year/:month', verifyToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    const schedules = await ScheduleService.getCalendarView(year, month, userId);

    return ApiResponse.success(res, {
      items: schedules,
      total: schedules.length,
      year,
      month
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取日历视图失败');
  }
});

/**
* @swagger
 * /api/schedules:
 *   post:
 *     summary: 创建日程
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - startTime
 *               - endTime
 *             properties:
 *               title:
 *                 type: string
 *                 description: 日程标题
 *                 example: "团队会议"
 *               description:
 *                 type: string
 *                 description: 日程描述
 *                 example: "讨论项目进度"
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: 开始时间
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: 结束时间
 *               location:
 *                 type: string
 *                 description: 地点
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/', verifyToken, async (req, res) => {
  try {
    const data: CreateScheduleDto = {
      title: req.body.title,
      description: req.body.description,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      location: req.body.location
    };

    const userId = (req as any).user?.id;
    const schedule = await ScheduleService.createSchedule(data, userId);
    return ApiResponse.success(res, schedule, '创建日程成功', 201);
  } catch (error) {
    return ApiResponse.handleError(res, error, '创建日程失败');
  }
});

/**
* @swagger
 * /api/schedules/{id}:
 *   get:
 *     summary: 获取日程详情
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 日程ID
 *     responses:
 *       200:
 *         description: 获取成功
 *       404:
 *         description: 日程不存在
*/
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const schedule = await ScheduleService.getScheduleById(id);
    return ApiResponse.success(res, schedule);
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取日程详情失败');
  }
});

/**
* @swagger
 * /api/schedules/{id}:
 *   put:
 *     summary: 更新日程
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 日程ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 日程标题
 *               description:
 *                 type: string
 *                 description: 日程描述
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: 开始时间
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: 结束时间
 *               location:
 *                 type: string
 *                 description: 地点
 *     responses:
 *       200:
 *         description: 更新成功
 *       404:
 *         description: 日程不存在
*/
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data: UpdateScheduleDto = {
      title: req.body.title,
      description: req.body.description,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      location: req.body.location
    };

    const schedule = await ScheduleService.updateSchedule(id, data);
    return ApiResponse.success(res, schedule, '更新日程成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '更新日程失败');
  }
});

/**
* @swagger
 * /api/schedules/{id}:
 *   delete:
 *     summary: 删除日程
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 日程ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       404:
 *         description: 日程不存在
*/
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await ScheduleService.deleteSchedule(id);
    return ApiResponse.success(res, null, '删除日程成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '删除日程失败');
  }
});

export default router; 