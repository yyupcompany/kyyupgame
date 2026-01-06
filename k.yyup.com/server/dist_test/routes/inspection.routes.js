"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var inspection_type_controller_1 = __importDefault(require("../controllers/inspection-type.controller"));
var inspection_plan_controller_1 = __importDefault(require("../controllers/inspection-plan.controller"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/inspection/types:
 *   get:
 *     summary: 获取检查类型列表
 *     description: 获取所有检查类型的列表
 *     tags:
 *       - 巡检管理
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
router.get('/types', auth_middleware_1.verifyToken, inspection_type_controller_1["default"].getList.bind(inspection_type_controller_1["default"]));
/**
 * @swagger
 * /api/inspection/types/active:
 *   get:
 *     summary: 获取启用的检查类型
 *     description: 获取所有启用状态的检查类型，用于下拉选择
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/types/active', auth_middleware_1.verifyToken, inspection_type_controller_1["default"].getActiveList.bind(inspection_type_controller_1["default"]));
/**
 * @swagger
 * /api/inspection/types/{id}:
 *   get:
 *     summary: 获取检查类型详情
 *     description: 获取指定检查类型的详细信息
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/types/:id', auth_middleware_1.verifyToken, inspection_type_controller_1["default"].getDetail.bind(inspection_type_controller_1["default"]));
/**
 * @swagger
 * /api/inspection/types:
 *   post:
 *     summary: 创建检查类型
 *     description: 创建新的检查类型
 *     tags:
 *       - 巡检管理
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: 检查类型名称
 *               description:
 *                 type: string
 *                 description: 描述
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: 创建成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/types', auth_middleware_1.verifyToken, inspection_type_controller_1["default"].create.bind(inspection_type_controller_1["default"]));
/**
 * @swagger
 * /api/inspection/types/{id}:
 *   put:
 *     summary: 更新检查类型
 *     description: 更新指定的检查类型
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/types/:id', auth_middleware_1.verifyToken, inspection_type_controller_1["default"].update.bind(inspection_type_controller_1["default"]));
/**
 * @swagger
 * /api/inspection/types/{id}:
 *   delete:
 *     summary: 删除检查类型
 *     description: 删除指定的检查类型
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router["delete"]('/types/:id', auth_middleware_1.verifyToken, inspection_type_controller_1["default"]["delete"].bind(inspection_type_controller_1["default"]));
/**
 * @swagger
 * /api/inspection/types/batch-delete:
 *   post:
 *     summary: 批量删除检查类型
 *     description: 批量删除多个检查类型
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 批量删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/types/batch-delete', auth_middleware_1.verifyToken, inspection_type_controller_1["default"].batchDelete.bind(inspection_type_controller_1["default"]));
/**
 * @swagger
 * /api/inspection/plans:
 *   get:
 *     summary: 获取检查计划列表
 *     description: 获取所有检查计划的列表
 *     tags:
 *       - 巡检管理
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
router.get('/plans', auth_middleware_1.verifyToken, inspection_plan_controller_1["default"].getList.bind(inspection_plan_controller_1["default"]));
/**
 * @swagger
 * /api/inspection/plans/timeline:
 *   get:
 *     summary: 获取Timeline数据
 *     description: 获取检查计划的时间线数据
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/plans/timeline', auth_middleware_1.verifyToken, inspection_plan_controller_1["default"].getTimeline.bind(inspection_plan_controller_1["default"]));
/**
 * @swagger
 * /api/inspection/plans/{id}:
 *   get:
 *     summary: 获取检查计划详情
 *     description: 获取指定检查计划的详细信息
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/plans/:id', auth_middleware_1.verifyToken, inspection_plan_controller_1["default"].getDetail.bind(inspection_plan_controller_1["default"]));
/**
 * @swagger
 * /api/inspection/plans:
 *   post:
 *     summary: 创建检查计划
 *     description: 创建新的检查计划
 *     tags:
 *       - 巡检管理
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
 *               - typeId
 *               - startDate
 *             properties:
 *               name:
 *                 type: string
 *               typeId:
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
router.post('/plans', auth_middleware_1.verifyToken, inspection_plan_controller_1["default"].create.bind(inspection_plan_controller_1["default"]));
/**
 * @swagger
 * /api/inspection/plans/generate-yearly:
 *   post:
 *     summary: 自动生成年度检查计划
 *     description: 根据配置自动生成年度检查计划
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - year
 *             properties:
 *               year:
 *                 type: integer
 *                 description: 年份
 *     responses:
 *       200:
 *         description: 生成成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/plans/generate-yearly', auth_middleware_1.verifyToken, inspection_plan_controller_1["default"].generateYearlyPlan.bind(inspection_plan_controller_1["default"]));
/**
 * @swagger
 * /api/inspection/plans/{id}:
 *   put:
 *     summary: 更新检查计划
 *     description: 更新指定的检查计划
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               typeId:
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
 *         description: 更新成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/plans/:id', auth_middleware_1.verifyToken, inspection_plan_controller_1["default"].update.bind(inspection_plan_controller_1["default"]));
/**
 * @swagger
 * /api/inspection/plans/{id}:
 *   delete:
 *     summary: 删除检查计划
 *     description: 删除指定的检查计划
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router["delete"]('/plans/:id', auth_middleware_1.verifyToken, inspection_plan_controller_1["default"]["delete"].bind(inspection_plan_controller_1["default"]));
/**
 * @swagger
 * /api/inspection/plans/{id}/tasks:
 *   get:
 *     summary: 获取检查计划的任务列表
 *     description: 获取指定检查计划的所有任务
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 检查计划ID
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/plans/:id/tasks', auth_middleware_1.verifyToken, inspection_plan_controller_1["default"].getTasks.bind(inspection_plan_controller_1["default"]));
/**
 * @swagger
 * /api/inspection/plans/{id}/tasks:
 *   post:
 *     summary: 创建检查任务
 *     description: 为指定检查计划创建新任务
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 检查计划ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: 任务标题
 *               description:
 *                 type: string
 *                 description: 任务描述
 *               assignedTo:
 *                 type: integer
 *                 description: 分配给的用户ID
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: 截止日期
 *     responses:
 *       201:
 *         description: 创建成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/plans/:id/tasks', auth_middleware_1.verifyToken, inspection_plan_controller_1["default"].createTask.bind(inspection_plan_controller_1["default"]));
/**
 * @swagger
 * /api/inspection/plans/{id}/tasks/{taskId}:
 *   put:
 *     summary: 更新检查任务
 *     description: 更新指定的检查任务
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 检查计划ID
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               assignedTo:
 *                 type: integer
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled]
 *               progress:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/plans/:id/tasks/:taskId', auth_middleware_1.verifyToken, inspection_plan_controller_1["default"].updateTask.bind(inspection_plan_controller_1["default"]));
/**
 * @swagger
 * /api/inspection/plans/{id}/tasks/{taskId}:
 *   delete:
 *     summary: 删除检查任务
 *     description: 删除指定的检查任务
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 检查计划ID
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router["delete"]('/plans/:id/tasks/:taskId', auth_middleware_1.verifyToken, inspection_plan_controller_1["default"].deleteTask.bind(inspection_plan_controller_1["default"]));
exports["default"] = router;
