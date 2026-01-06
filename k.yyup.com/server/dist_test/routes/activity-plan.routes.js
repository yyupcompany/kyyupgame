"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
exports.__esModule = true;
/**
 * 活动计划路由
 */
var express_1 = require("express");
var activityPlanController = __importStar(require("../controllers/activity-plan.controller"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/activity-plans:
 *   post:
 *     summary: 创建活动计划
 *     tags: [活动计划]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - kindergartenId
 *               - title
 *               - activityType
 *               - startTime
 *               - endTime
 *               - location
 *               - capacity
 *               - registrationStartTime
 *               - registrationEndTime
 *             properties:
 *               kindergartenId:
 *                 type: integer
 *                 description: 幼儿园ID
 *               planId:
 *                 type: integer
 *                 description: 招生计划ID
 *               title:
 *                 type: string
 *                 description: 活动标题
 *               activityType:
 *                 type: integer
 *                 description: 活动类型 - 1:开放日 2:体验课 3:亲子活动 4:招生说明会 5:家长会 6:节日活动 7:其他
 *               coverImage:
 *                 type: string
 *                 description: 封面图片URL
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: 活动开始时间
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: 活动结束时间
 *               location:
 *                 type: string
 *                 description: 活动地点
 *               capacity:
 *                 type: integer
 *                 description: 活动容量
 *               fee:
 *                 type: number
 *                 description: 活动费用
 *               description:
 *                 type: string
 *                 description: 活动描述
 *               agenda:
 *                 type: string
 *                 description: 活动议程
 *               registrationStartTime:
 *                 type: string
 *                 format: date-time
 *                 description: 报名开始时间
 *               registrationEndTime:
 *                 type: string
 *                 format: date-time
 *                 description: 报名结束时间
 *               needsApproval:
 *                 type: integer
 *                 description: 是否需要审核 - 0:否 1:是
 *               status:
 *                 type: integer
 *                 description: 状态 - 0:草稿 1:未开始 2:报名中 3:进行中 4:已结束 5:已取消
 *               remark:
 *                 type: string
 *                 description: 备注信息
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), activityPlanController.createActivityPlan);
/**
 * @swagger
 * /api/activity-plans:
 *   get:
 *     summary: 获取活动计划列表
 *     tags: [活动计划]
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
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: 活动标题（模糊搜索）
 *       - in: query
 *         name: activityType
 *         schema:
 *           type: integer
 *         description: 活动类型
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: 状态
 *       - in: query
 *         name: kindergartenId
 *         schema:
 *           type: integer
 *         description: 幼儿园ID
 *       - in: query
 *         name: planId
 *         schema:
 *           type: integer
 *         description: 招生计划ID
 *       - in: query
 *         name: startTimeStart
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 开始时间起点
 *       - in: query
 *         name: startTimeEnd
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 开始时间终点
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), activityPlanController.getActivityPlans);
/**
 * @swagger
 * /api/activity-plans/by-category/{category}:
 *   get:
 *     summary: 按类别获取活动计划
 *     tags: [活动计划]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: 活动类别
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/by-category/:category', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), function (req, res) {
    var category = req.params.category;
    res.json({
        success: true,
        message: '按类别获取活动计划成功',
        data: {
            category: category,
            total: 0,
            items: []
        }
    });
});
/**
 * @swagger
 * /api/activity-plans/by-date/{date}:
 *   get:
 *     summary: 按日期获取活动计划
 *     tags: [活动计划]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         schema:
 *           type: string
 *         required: true
 *         description: 日期 (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/by-date/:date', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), function (req, res) {
    var date = req.params.date;
    res.json({
        success: true,
        message: '按日期获取活动计划成功',
        data: {
            date: date,
            total: 0,
            items: []
        }
    });
});
/**
 * @swagger
 * /api/activity-plans/{id}/publish:
 *   post:
 *     summary: 发布活动计划
 *     tags: [活动计划]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 活动计划ID
 *     responses:
 *       200:
 *         description: 发布成功
 */
router.post('/:id/publish', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), function (req, res) {
    var id = req.params.id;
    res.json({
        success: true,
        message: '发布活动计划成功',
        data: {
            id: parseInt(id),
            status: 'published',
            publishTime: new Date()
        }
    });
});
/**
 * @swagger
 * /api/activity-plans/{id}:
 *   get:
 *     summary: 获取活动计划详情
 *     tags: [活动计划]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 活动计划ID
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.get('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), activityPlanController.getActivityPlanById);
/**
 * @swagger
 * /api/activity-plans/{id}:
 *   put:
 *     summary: 更新活动计划
 *     tags: [活动计划]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 活动计划ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               kindergartenId:
 *                 type: integer
 *                 description: 幼儿园ID
 *               planId:
 *                 type: integer
 *                 description: 招生计划ID
 *               title:
 *                 type: string
 *                 description: 活动标题
 *               activityType:
 *                 type: integer
 *                 description: 活动类型
 *               coverImage:
 *                 type: string
 *                 description: 封面图片URL
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: 活动开始时间
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: 活动结束时间
 *               location:
 *                 type: string
 *                 description: 活动地点
 *               capacity:
 *                 type: integer
 *                 description: 活动容量
 *               fee:
 *                 type: number
 *                 description: 活动费用
 *               description:
 *                 type: string
 *                 description: 活动描述
 *               agenda:
 *                 type: string
 *                 description: 活动议程
 *               registrationStartTime:
 *                 type: string
 *                 format: date-time
 *                 description: 报名开始时间
 *               registrationEndTime:
 *                 type: string
 *                 format: date-time
 *                 description: 报名结束时间
 *               needsApproval:
 *                 type: integer
 *                 description: 是否需要审核
 *               remark:
 *                 type: string
 *                 description: 备注信息
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), activityPlanController.updateActivityPlan);
/**
 * @swagger
 * /api/activity-plans/{id}:
 *   delete:
 *     summary: 删除活动计划
 *     tags: [活动计划]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 活动计划ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), activityPlanController.deleteActivityPlan);
/**
 * @swagger
 * /api/activity-plans/{id}/status:
 *   put:
 *     summary: 更新活动状态
 *     tags: [活动计划]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 活动计划ID
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
 *                 type: integer
 *                 description: 状态 - 0:草稿 1:未开始 2:报名中 3:进行中 4:已结束 5:已取消
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.put('/:id/status', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), activityPlanController.updateActivityStatus);
/**
 * @swagger
 * /api/activity-plans/{id}/cancel:
 *   post:
 *     summary: 取消活动
 *     tags: [活动计划]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 活动计划ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cancelReason
 *             properties:
 *               cancelReason:
 *                 type: string
 *                 description: 取消原因
 *     responses:
 *       200:
 *         description: 取消成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.post('/:id/cancel', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), activityPlanController.cancelActivity);
/**
 * @swagger
 * /api/activity-plans/{id}/statistics:
 *   get:
 *     summary: 获取活动统计数据
 *     tags: [活动计划]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 活动计划ID
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.get('/:id/statistics', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), activityPlanController.getActivityStatistics);
exports["default"] = router;
