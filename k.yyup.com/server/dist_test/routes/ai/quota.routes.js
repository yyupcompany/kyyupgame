"use strict";
exports.__esModule = true;
var express_1 = require("express");
var quota_controller_1 = require("../../controllers/ai/quota.controller");
var auth_middleware_1 = require("../../middlewares/auth.middleware");
/**
 * @swagger
 * tags:
 *   name: AI配额
 *   description: 管理用户的AI使用配额
 */
var router = (0, express_1.Router)();
var quotaController = new quota_controller_1.QuotaController();
/**
 * @swagger
 * /api/ai/quota:
 *   get:
 *     summary: 获取当前用户的AI配额
 *     description: 获取当前登录用户的AI使用配额信息，包括已使用量和剩余量
 *     tags:
 *       - AI配额
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取配额信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: integer
 *                   description: 用户ID
 *                 totalQuota:
 *                   type: integer
 *                   description: 总配额
 *                 usedQuota:
 *                   type: integer
 *                   description: 已使用配额
 *                 remainingQuota:
 *                   type: integer
 *                   description: 剩余配额
 *                 resetDate:
 *                   type: string
 *                   format: date-time
 *                   description: 配额重置日期
 *                 models:
 *                   type: object
 *                   description: 各模型的使用情况
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       used:
 *                         type: integer
 *                       limit:
 *                         type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', auth_middleware_1.authMiddleware, quotaController.getUserQuota);
/**
 * @swagger
 * /api/ai/quota/usage:
 *   get:
 *     summary: 获取配额使用历史
 *     description: 获取当前用户的AI配额使用历史记录
 *     tags:
 *       - AI配额
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
 *         name: modelId
 *         schema:
 *           type: integer
 *         description: 模型ID
 *     responses:
 *       200:
 *         description: 成功获取使用历史
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   modelId:
 *                     type: integer
 *                   modelName:
 *                     type: string
 *                   usage:
 *                     type: integer
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/usage', auth_middleware_1.authMiddleware, quotaController.getUsageHistory);
exports["default"] = router;
