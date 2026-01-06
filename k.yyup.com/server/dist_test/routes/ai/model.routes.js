"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var model_controller_1 = require("../../controllers/ai/model.controller");
var ai_controller_1 = __importDefault(require("../../controllers/ai.controller"));
var auth_middleware_1 = require("../../middlewares/auth.middleware");
/**
 * @swagger
 * tags:
 *   name: AI模型
 *   description: 管理AI系统支持的模型配置和计费规则
 */
var router = (0, express_1.Router)();
var modelController = new model_controller_1.ModelController();
/**
 * @swagger
 * /api/v1/ai/models:
 *   get:
 *     summary: 获取可用模型列表
 *     description: 获取系统中所有可用的AI模型配置，支持按类型和状态过滤
 *     tags:
 *       - AI模型
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [text, speech, image, video, multimodal]
 *         description: 模型类型过滤
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, testing]
 *         description: 模型状态过滤，默认只返回active状态
 *     responses:
 *       200:
 *         description: 成功获取模型列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ModelConfig'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', auth_middleware_1.authMiddleware, modelController.listModels);
/**
 * @swagger
 * /api/v1/ai/models/default:
 *   get:
 *     summary: 获取默认AI模型
 *     description: 获取系统设置的默认AI模型配置，如果没有设置默认模型则返回第一个可用模型
 *     tags:
 *       - AI模型
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取默认模型
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModelConfig'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: 没有可用的AI模型
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/default', auth_middleware_1.authMiddleware, modelController.getDefaultModel);
/**
 * @swagger
 * /api/v1/ai/models:
 *   post:
 *     summary: 创建新的AI模型
 *     description: 创建新的AI模型配置（需要管理员权限）
 *     tags:
 *       - AI模型
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
 *               - modelType
 *               - endpointUrl
 *               - apiKey
 *             properties:
 *               name:
 *                 type: string
 *                 description: 模型名称
 *               displayName:
 *                 type: string
 *                 description: 显示名称
 *               provider:
 *                 type: string
 *                 description: 模型提供商
 *               modelType:
 *                 type: string
 *                 description: 模型类型
 *               apiVersion:
 *                 type: string
 *                 description: API版本
 *               endpointUrl:
 *                 type: string
 *                 description: API端点URL
 *               apiKey:
 *                 type: string
 *                 description: API密钥
 *               modelParameters:
 *                 type: object
 *                 description: 模型参数
 *               isActive:
 *                 type: boolean
 *                 description: 是否激活
 *               isDefault:
 *                 type: boolean
 *                 description: 是否设为默认
 *     responses:
 *       201:
 *         description: 模型创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
router.post('/', auth_middleware_1.authMiddleware, ai_controller_1["default"].createModel);
/**
 * @swagger
 * /api/v1/ai/models/{modelId}/billing:
 *   get:
 *     summary: 获取模型计费规则
 *     description: 获取指定模型的计费规则详情
 *     tags:
 *       - AI模型
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: modelId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 模型ID
 *     responses:
 *       200:
 *         description: 成功获取计费规则
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ModelBilling'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: 模型ID不能为空
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:modelId/billing', auth_middleware_1.authMiddleware, modelController.getModelBilling);
exports["default"] = router;
