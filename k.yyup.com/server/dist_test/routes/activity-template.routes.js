"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var activity_template_controller_1 = __importDefault(require("../controllers/activity-template.controller"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/activity-templates:
 *   get:
 *     summary: 获取所有活动模板
 *     description: 获取活动模板列表
 *     tags:
 *       - 活动模板
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/', activity_template_controller_1["default"].getAll);
/**
 * @swagger
 * /api/activity-templates/{id}:
 *   get:
 *     summary: 获取单个活动模板
 *     description: 根据ID获取活动模板详情
 *     tags:
 *       - 活动模板
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/:id', activity_template_controller_1["default"].getById);
/**
 * @swagger
 * /api/activity-templates:
 *   post:
 *     summary: 创建活动模板
 *     description: 创建新的活动模板
 *     tags:
 *       - 活动模板
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
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: 创建成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', auth_middleware_1.verifyToken, activity_template_controller_1["default"].create);
/**
 * @swagger
 * /api/activity-templates/{id}:
 *   put:
 *     summary: 更新活动模板
 *     description: 更新指定的活动模板
 *     tags:
 *       - 活动模板
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
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/:id', auth_middleware_1.verifyToken, activity_template_controller_1["default"].update);
/**
 * @swagger
 * /api/activity-templates/{id}:
 *   delete:
 *     summary: 删除活动模板
 *     description: 删除指定的活动模板
 *     tags:
 *       - 活动模板
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
router["delete"]('/:id', auth_middleware_1.verifyToken, activity_template_controller_1["default"]["delete"]);
/**
 * @swagger
 * /api/activity-templates/{id}/use:
 *   post:
 *     summary: 使用活动模板
 *     description: 使用模板并增加使用次数
 *     tags:
 *       - 活动模板
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 使用成功
 */
router.post('/:id/use', activity_template_controller_1["default"].use);
exports["default"] = router;
