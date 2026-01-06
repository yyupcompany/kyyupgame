"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var ai_controller_1 = __importDefault(require("../controllers/ai.controller"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
// memoryRoutes removed - replaced by six-dimensional memory system
var router = (0, express_1.Router)();
// =============================================
// AI Root Route
// =============================================
/**
 * @swagger
 * /api/ai:
 *   get:
 *     summary: 获取AI模块API信息
 *     description: 返回AI模块的基本信息和可用端点
 *     tags: [AI - 基础信息]
 *     responses:
 *       200:
 *         description: 成功获取AI模块信息
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
 *                   example: "AI模块API"
 *                 data:
 *                   type: object
 *                   properties:
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *                     description:
 *                       type: string
 *                       example: "幼儿园管理系统AI模块"
 *                     endpoints:
 *                       type: object
 *                       properties:
 *                         models:
 *                           type: string
 *                           example: "/models"
 *                         conversations:
 *                           type: string
 *                           example: "/conversations"
 *                         billing:
 *                           type: string
 *                           example: "/models/:id/billing"
 */
router.get('/', function (req, res) {
    res.json({
        success: true,
        message: 'AI模块API',
        data: {
            version: '1.0.0',
            description: '幼儿园管理系统AI模块',
            endpoints: {
                models: '/models',
                conversations: '/conversations',
                billing: '/models/:id/billing'
            }
        }
    });
});
// =============================================
// Model Config Routes
// =============================================
/**
 * @swagger
 * /api/ai/models/stats:
 *   get:
 *     summary: 获取AI模型统计信息
 *     description: 获取所有AI模型的使用统计和性能数据
 *     tags: [AI - 模型管理]
 *     responses:
 *       200:
 *         description: 成功获取模型统计信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalModels:
 *                       type: integer
 *                     activeModels:
 *                       type: integer
 *                     totalUsage:
 *                       type: integer
 *       500:
 *         description: 服务器内部错误
 */
router.get('/models/stats', ai_controller_1["default"].getStats);
/**
 * @swagger
 * /api/ai/models/default:
 *   get:
 *     summary: 获取默认AI模型
 *     description: 获取当前系统设置的默认AI模型配置
 *     tags: [AI - 模型管理]
 *     responses:
 *       200:
 *         description: 成功获取默认模型
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AIModel'
 *       404:
 *         description: 未找到默认模型
 *       500:
 *         description: 服务器内部错误
 */
router.get('/models/default', ai_controller_1["default"].getDefaultModel);
/**
 * @swagger
 * /api/ai/models:
 *   get:
 *     summary: 获取所有AI模型
 *     description: 获取系统中配置的所有AI模型列表
 *     tags: [AI - 模型管理]
 *     parameters:
 *       - name: page
 *         in: query
 *         description: 页码
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: 每页数量
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: 成功获取模型列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AIModel'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: 服务器内部错误
 */
router.get('/models', ai_controller_1["default"].getAllModels);
/**
 * @swagger
 * /api/ai/models/{id}:
 *   get:
 *     summary: 根据ID获取AI模型
 *     description: 获取指定ID的AI模型详细信息
 *     tags: [AI - 模型管理]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 模型ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功获取模型信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AIModel'
 *       404:
 *         description: 模型不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/models/:id', ai_controller_1["default"].getModelById);
/**
 * @swagger
 * /api/ai/models:
 *   post:
 *     summary: 创建新的AI模型
 *     description: 创建新的AI模型配置（需要管理员权限）
 *     tags: [AI - 模型管理]
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
 *               - provider
 *               - modelType
 *             properties:
 *               name:
 *                 type: string
 *                 description: 模型名称
 *               provider:
 *                 type: string
 *                 description: 模型提供商
 *               modelType:
 *                 type: string
 *                 description: 模型类型
 *               apiKey:
 *                 type: string
 *                 description: API密钥
 *               baseUrl:
 *                 type: string
 *                 description: 基础URL
 *               maxTokens:
 *                 type: integer
 *                 description: 最大令牌数
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
 *                 data:
 *                   $ref: '#/components/schemas/AIModel'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
router.post('/models', ai_controller_1["default"].createModel); // Assumes admin rights
/**
 * @swagger
 * /api/ai/models/{id}:
 *   patch:
 *     summary: 更新AI模型
 *     description: 更新指定ID的AI模型配置（需要管理员权限）
 *     tags: [AI - 模型管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 模型ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 模型名称
 *               provider:
 *                 type: string
 *                 description: 模型提供商
 *               modelType:
 *                 type: string
 *                 description: 模型类型
 *               apiKey:
 *                 type: string
 *                 description: API密钥
 *               baseUrl:
 *                 type: string
 *                 description: 基础URL
 *               maxTokens:
 *                 type: integer
 *                 description: 最大令牌数
 *               isActive:
 *                 type: boolean
 *                 description: 是否启用
 *     responses:
 *       200:
 *         description: 模型更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AIModel'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 模型不存在
 *       500:
 *         description: 服务器内部错误
 */
router.patch('/models/:id', ai_controller_1["default"].updateModel); // Assumes admin rights
/**
 * @swagger
 * /api/ai/models/{id}:
 *   delete:
 *     summary: 删除AI模型
 *     description: 删除指定ID的AI模型（需要管理员权限）
 *     tags: [AI - 模型管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 模型ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 模型删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       404:
 *         description: 模型不存在
 *       500:
 *         description: 服务器内部错误
 */
router["delete"]('/models/:id', ai_controller_1["default"].deleteModel); // Assumes admin rights
/**
 * @swagger
 * /api/ai/models/default:
 *   post:
 *     summary: 设置默认AI模型
 *     description: 设置系统默认使用的AI模型
 *     tags: [AI - 模型管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modelId
 *             properties:
 *               modelId:
 *                 type: integer
 *                 description: 要设置为默认的模型ID
 *     responses:
 *       200:
 *         description: 默认模型设置成功
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
 *                   $ref: '#/components/schemas/AIModel'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 模型不存在
 *       500:
 *         description: 服务器内部错误
 */
router.post('/models/default', ai_controller_1["default"].setDefaultModel);
/**
 * @swagger
 * /api/ai/models/{id}/capabilities/{capability}:
 *   get:
 *     summary: 检查模型能力
 *     description: 检查指定AI模型是否支持特定能力
 *     tags: [AI - 模型管理]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 模型ID
 *         schema:
 *           type: integer
 *       - name: capability
 *         in: path
 *         required: true
 *         description: 能力类型
 *         schema:
 *           type: string
 *           enum: [text_generation, image_generation, speech_to_text, text_to_speech, translation]
 *     responses:
 *       200:
 *         description: 成功检查模型能力
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     modelId:
 *                       type: integer
 *                     capability:
 *                       type: string
 *                     supported:
 *                       type: boolean
 *                     details:
 *                       type: object
 *       404:
 *         description: 模型不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/models/:id/capabilities/:capability', ai_controller_1["default"].checkModelCapability);
// =============================================
// Model Billing Routes
// =============================================
/**
 * @swagger
 * /api/ai/models/{id}/billing:
 *   get:
 *     summary: 获取模型计费规则
 *     description: 获取指定AI模型的计费规则和价格配置
 *     tags: [AI - 计费管理]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 模型ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功获取计费规则
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BillingRule'
 *       404:
 *         description: 模型不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/models/:id/billing', ai_controller_1["default"].getBillingRules);
/**
 * @swagger
 * /api/ai/models/{id}/billing:
 *   post:
 *     summary: 创建计费规则
 *     description: 为指定AI模型创建新的计费规则（需要管理员权限）
 *     tags: [AI - 计费管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 模型ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - billingType
 *               - rate
 *             properties:
 *               billingType:
 *                 type: string
 *                 enum: [per_token, per_request, per_minute]
 *                 description: 计费类型
 *               rate:
 *                 type: number
 *                 description: 费率
 *               currency:
 *                 type: string
 *                 default: "CNY"
 *                 description: 货币类型
 *               description:
 *                 type: string
 *                 description: 规则描述
 *     responses:
 *       201:
 *         description: 计费规则创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BillingRule'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 模型不存在
 *       500:
 *         description: 服务器内部错误
 */
router.post('/models/:id/billing', ai_controller_1["default"].createBillingRule); // Assumes admin rights
// =============================================
// Conversation & Message Routes
// =============================================
// All routes below would typically be protected by an authentication middleware
router.use(auth_middleware_1.authMiddleware);
/**
 * @swagger
 * /api/ai/conversations:
 *   get:
 *     summary: 获取对话列表
 *     description: 获取当前用户的AI对话列表
 *     tags: [AI - 对话管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: 页码
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: 每页数量
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: 成功获取对话列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Conversation'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
router.get('/conversations', ai_controller_1["default"].getConversations);
/**
 * @swagger
 * /api/ai/conversations:
 *   post:
 *     summary: 创建新对话
 *     description: 创建新的AI对话会话
 *     tags: [AI - 对话管理]
 *     security:
 *       - bearerAuth: []
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
 *                 description: 对话标题
 *               modelId:
 *                 type: integer
 *                 description: 使用的AI模型ID（可选，默认使用系统默认模型）
 *               systemPrompt:
 *                 type: string
 *                 description: 系统提示词
 *               context:
 *                 type: object
 *                 description: 对话上下文信息
 *     responses:
 *       201:
 *         description: 对话创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
router.post('/conversations', ai_controller_1["default"].createConversation);
/**
 * @swagger
 * /api/ai/conversations/{id}:
 *   get:
 *     summary: 获取对话详情
 *     description: 获取指定ID的对话详细信息
 *     tags: [AI - 对话管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 对话ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功获取对话详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: 未授权
 *       404:
 *         description: 对话不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/conversations/:id', ai_controller_1["default"].getConversationById);
/**
 * @swagger
 * /api/ai/conversations/{id}:
 *   put:
 *     summary: 更新对话信息
 *     description: 更新指定对话的信息
 *     tags: [AI - 对话管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 对话ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 对话标题
 *               systemPrompt:
 *                 type: string
 *                 description: 系统提示词
 *               context:
 *                 type: object
 *                 description: 对话上下文信息
 *               isActive:
 *                 type: boolean
 *                 description: 是否活跃
 *     responses:
 *       200:
 *         description: 对话更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 对话不存在
 *       500:
 *         description: 服务器内部错误
 */
router.put('/conversations/:id', ai_controller_1["default"].updateConversation);
/**
 * @swagger
 * /api/ai/conversations/{id}:
 *   delete:
 *     summary: 删除对话
 *     description: 删除指定的对话及其所有消息
 *     tags: [AI - 对话管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 对话ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 对话删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       404:
 *         description: 对话不存在
 *       500:
 *         description: 服务器内部错误
 */
router["delete"]('/conversations/:id', ai_controller_1["default"].deleteConversation);
/**
 * @swagger
 * /api/ai/conversations/{id}/messages:
 *   get:
 *     summary: 获取对话消息
 *     description: 获取指定对话的所有消息
 *     tags: [AI - 消息管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 对话ID
 *         schema:
 *           type: integer
 *       - name: page
 *         in: query
 *         description: 页码
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: 每页数量
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *     responses:
 *       200:
 *         description: 成功获取消息列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AIMessage'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: 未授权
 *       404:
 *         description: 对话不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/conversations/:id/messages', ai_controller_1["default"].getConversationMessages);
/**
 * @swagger
 * /api/ai/conversations/{id}/messages:
 *   post:
 *     summary: 发送消息
 *     description: 向指定对话发送新消息并获取AI回复
 *     tags: [AI - 消息管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 对话ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 消息内容
 *               messageType:
 *                 type: string
 *                 enum: [text, image, file]
 *                 default: text
 *                 description: 消息类型
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     type:
 *                       type: string
 *                     name:
 *                       type: string
 *                 description: 附件列表
 *     responses:
 *       201:
 *         description: 消息发送成功，返回用户消息和AI回复
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     userMessage:
 *                       $ref: '#/components/schemas/AIMessage'
 *                     aiResponse:
 *                       $ref: '#/components/schemas/AIMessage'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 对话不存在
 *       500:
 *         description: 服务器内部错误
 */
router.post('/conversations/:id/messages', ai_controller_1["default"].sendMessage);
// =============================================
// Memory Routes
// =============================================
/**
 * @swagger
 * /api/ai/memories:
 *   get:
 *     summary: 获取AI记忆列表
 *     description: 获取当前用户的AI记忆和偏好信息
 *     tags: [AI - 记忆管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: memoryType
 *         in: query
 *         description: 记忆类型筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [user_preference, user_interest, conversation_context, system_note]
 *       - name: importance
 *         in: query
 *         description: 重要性筛选（最小值）
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *     responses:
 *       200:
 *         description: 成功获取记忆列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AIMemory'
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
router.get('/memories', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId;
    var _a;
    return __generator(this, function (_b) {
        try {
            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return [2 /*return*/, res.status(401).json({ code: 401, message: 'Unauthorized' })];
            }
            // 返回模拟的记忆列表
            res.status(200).json({
                code: 200,
                message: 'success',
                data: [
                    {
                        id: 1,
                        content: '用户喜欢春季活动',
                        memoryType: 'user_preference',
                        importance: 8,
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: 2,
                        content: '用户关注招生宣传',
                        memoryType: 'user_interest',
                        importance: 7,
                        createdAt: new Date().toISOString()
                    }
                ]
            });
        }
        catch (error) {
            console.error('获取记忆列表失败:', error);
            res.status(500).json({
                code: 500,
                message: '获取记忆列表失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/ai/memories:
 *   post:
 *     summary: 创建AI记忆
 *     description: 为当前用户创建新的AI记忆条目
 *     tags: [AI - 记忆管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - memoryType
 *             properties:
 *               conversationId:
 *                 type: integer
 *                 description: 关联的对话ID（可选）
 *               content:
 *                 type: string
 *                 description: 记忆内容
 *                 minLength: 1
 *                 maxLength: 1000
 *               memoryType:
 *                 type: string
 *                 enum: [user_preference, user_interest, conversation_context, system_note]
 *                 description: 记忆类型
 *               importance:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 default: 5
 *                 description: 重要性等级（1-10）
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 标签列表
 *     responses:
 *       201:
 *         description: 记忆创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/AIMemory'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
router.post('/memories', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, conversationId, content, memoryType, importance, newMemory;
    var _b;
    return __generator(this, function (_c) {
        try {
            userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
            _a = req.body, conversationId = _a.conversationId, content = _a.content, memoryType = _a.memoryType, importance = _a.importance;
            if (!userId) {
                return [2 /*return*/, res.status(401).json({ code: 401, message: 'Unauthorized' })];
            }
            if (!content || !memoryType) {
                return [2 /*return*/, res.status(400).json({
                        code: 400,
                        message: 'content and memoryType are required'
                    })];
            }
            newMemory = {
                id: Date.now(),
                userId: userId,
                conversationId: conversationId,
                content: content,
                memoryType: memoryType,
                importance: importance || 5,
                createdAt: new Date().toISOString()
            };
            res.status(201).json({
                code: 201,
                message: 'success',
                data: newMemory
            });
        }
        catch (error) {
            console.error('创建记忆失败:', error);
            res.status(500).json({
                code: 500,
                message: '创建记忆失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
        return [2 /*return*/];
    });
}); });
// router.use('/', memoryRoutes); // removed - replaced by six-dimensional memory system
// =============================================
// AI Predictions Routes
// =============================================
/**
 * @swagger
 * /api/ai/predictions:
 *   get:
 *     summary: 获取AI预测分析
 *     description: 获取基于AI分析的幼儿园运营预测数据，包括招生、出勤、活动和资源使用预测
 *     tags: [AI - 预测分析]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: timeRange
 *         in: query
 *         description: 预测时间范围
 *         required: false
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *       - name: category
 *         in: query
 *         description: 预测类别
 *         required: false
 *         schema:
 *           type: string
 *           enum: [enrollment, attendance, activities, resources, all]
 *           default: all
 *     responses:
 *       200:
 *         description: 成功获取AI预测分析
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
 *                   example: "获取AI预测分析成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     enrollment:
 *                       type: object
 *                       properties:
 *                         nextMonth:
 *                           type: object
 *                           properties:
 *                             predicted:
 *                               type: integer
 *                               example: 45
 *                             confidence:
 *                               type: number
 *                               format: float
 *                               example: 0.85
 *                             trend:
 *                               type: string
 *                               enum: [increasing, stable, decreasing]
 *                               example: "increasing"
 *                         nextQuarter:
 *                           type: object
 *                           properties:
 *                             predicted:
 *                               type: integer
 *                               example: 120
 *                             confidence:
 *                               type: number
 *                               format: float
 *                               example: 0.78
 *                             trend:
 *                               type: string
 *                               enum: [increasing, stable, decreasing]
 *                               example: "stable"
 *                     attendance:
 *                       type: object
 *                       properties:
 *                         weeklyPrediction:
 *                           type: array
 *                           items:
 *                             type: integer
 *                           example: [92, 89, 94, 91, 88]
 *                         averageRate:
 *                           type: number
 *                           format: float
 *                           example: 90.8
 *                         confidence:
 *                           type: number
 *                           format: float
 *                           example: 0.82
 *                     activities:
 *                       type: object
 *                       properties:
 *                         participationRate:
 *                           type: object
 *                           properties:
 *                             predicted:
 *                               type: number
 *                               format: float
 *                               example: 87.5
 *                             confidence:
 *                               type: number
 *                               format: float
 *                               example: 0.79
 *                             recommendations:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["建议增加户外活动", "考虑添加科学实验课程"]
 *                     resources:
 *                       type: object
 *                       properties:
 *                         teacherWorkload:
 *                           type: object
 *                           properties:
 *                             prediction:
 *                               type: string
 *                               enum: [low, moderate, high]
 *                               example: "moderate"
 *                             confidence:
 *                               type: number
 *                               format: float
 *                               example: 0.74
 *                             suggestions:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["合理分配教学任务", "适当增加助教支持"]
 *                         facilityUsage:
 *                           type: object
 *                           properties:
 *                             classrooms:
 *                               type: number
 *                               format: float
 *                               example: 0.85
 *                             playground:
 *                               type: number
 *                               format: float
 *                               example: 0.72
 *                             library:
 *                               type: number
 *                               format: float
 *                               example: 0.45
 *                     insights:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [trend, alert, opportunity]
 *                           message:
 *                             type: string
 *                           priority:
 *                             type: string
 *                             enum: [low, medium, high]
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
router.get('/predictions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId;
    var _a;
    return __generator(this, function (_b) {
        try {
            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return [2 /*return*/, res.status(401).json({
                        success: false,
                        message: 'Unauthorized'
                    })];
            }
            // 返回AI预测分析数据
            res.status(200).json({
                success: true,
                message: '获取AI预测分析成功',
                data: {
                    enrollment: {
                        nextMonth: {
                            predicted: 45,
                            confidence: 0.85,
                            trend: 'increasing'
                        },
                        nextQuarter: {
                            predicted: 120,
                            confidence: 0.78,
                            trend: 'stable'
                        }
                    },
                    attendance: {
                        weeklyPrediction: [92, 89, 94, 91, 88],
                        averageRate: 90.8,
                        confidence: 0.82
                    },
                    activities: {
                        participationRate: {
                            predicted: 87.5,
                            confidence: 0.79,
                            recommendations: [
                                '建议增加户外活动',
                                '考虑添加科学实验课程',
                                '增强亲子互动活动'
                            ]
                        }
                    },
                    resources: {
                        teacherWorkload: {
                            prediction: 'moderate',
                            confidence: 0.74,
                            suggestions: ['合理分配教学任务', '适当增加助教支持']
                        },
                        facilityUsage: {
                            classrooms: 0.85,
                            playground: 0.72,
                            library: 0.45
                        }
                    },
                    insights: [
                        {
                            type: 'trend',
                            message: '招生趋势稳定，建议加强宣传活动',
                            priority: 'medium'
                        },
                        {
                            type: 'alert',
                            message: '图书馆使用率偏低，建议增加阅读活动',
                            priority: 'low'
                        },
                        {
                            type: 'opportunity',
                            message: '户外活动参与度高，可考虑扩展相关项目',
                            priority: 'high'
                        }
                    ]
                }
            });
        }
        catch (error) {
            console.error('获取AI预测分析失败:', error);
            res.status(500).json({
                success: false,
                message: '获取AI预测分析失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
        return [2 /*return*/];
    });
}); });
// =============================================
// Agent Dispatch Routes
// =============================================
/**
 * @swagger
 * /api/ai/agent/dispatch:
 *   post:
 *     summary: 调度AI智能体
 *     description: 向指定类型的AI智能体发送消息并获取响应
 *     tags: [AI - 智能体调度]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agentType
 *               - message
 *             properties:
 *               agentType:
 *                 type: string
 *                 enum: [ACTIVITY_PLANNER, CONTENT_CREATOR]
 *                 description: 智能体类型
 *                 example: "ACTIVITY_PLANNER"
 *               message:
 *                 type: string
 *                 description: 发送给智能体的消息
 *                 minLength: 1
 *                 maxLength: 1000
 *                 example: "帮我策划一个春季亲子活动"
 *     responses:
 *       200:
 *         description: 智能体响应成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     agentType:
 *                       type: string
 *                       example: "ACTIVITY_PLANNER"
 *                     content:
 *                       type: string
 *                       description: 智能体的响应内容
 *                     sessionId:
 *                       type: string
 *                       description: 会话ID
 *                       example: "session_1673445600000_123"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       description: 响应时间戳
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
 *                   example: "agentType and message are required"
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "智能体调度失败"
 *                 error:
 *                   type: string
 *                   description: 错误详情
 */
router.post('/agent/dispatch', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, agentType, message, userId, responses, response;
    var _b;
    return __generator(this, function (_c) {
        try {
            _a = req.body, agentType = _a.agentType, message = _a.message;
            userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
            if (!userId) {
                return [2 /*return*/, res.status(401).json({ code: 401, message: 'Unauthorized' })];
            }
            if (!agentType || !message) {
                return [2 /*return*/, res.status(400).json({
                        code: 400,
                        message: 'agentType and message are required'
                    })];
            }
            responses = {
                'ACTIVITY_PLANNER': '我是活动策划智能体，很高兴为您服务！针对您的需求，我建议从以下几个方面来策划活动：\n1. 明确活动目标和主题\n2. 确定目标受众和参与人数\n3. 制定详细的活动流程和时间安排\n4. 准备必要的物料和场地\n5. 建立有效的宣传推广策略',
                'CONTENT_CREATOR': '我是内容创作智能体，很高兴为您提供创作服务！基于您的需求，我会为您创作优质的内容：\n1. 深入了解您的品牌定位和目标受众\n2. 制定符合品牌调性的内容策略\n3. 创作吸引人的标题和正文内容\n4. 优化内容的可读性和传播效果\n5. 提供多样化的内容形式建议'
            };
            response = responses[agentType] || '我是AI智能体，很高兴为您服务！我正在为您处理这个请求...';
            res.status(200).json({
                code: 200,
                message: 'success',
                data: {
                    agentType: agentType,
                    content: response + "\n\n\u60A8\u7684\u95EE\u9898\uFF1A\"".concat(message, "\""),
                    sessionId: "session_".concat(Date.now(), "_").concat(Math.floor(Math.random() * 1000)),
                    timestamp: new Date().toISOString()
                }
            });
        }
        catch (error) {
            console.error('智能体调度失败:', error);
            res.status(500).json({
                code: 500,
                message: '智能体调度失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
        return [2 /*return*/];
    });
}); });
// =============================================
// Image Generation Routes  
// =============================================
/**
 * @swagger
 * /api/ai/generate-activity-image:
 *   post:
 *     summary: 生成活动海报图片
 *     description: 使用AI文生图模型为活动生成海报图片，支持自定义提示词和风格
 *     tags: [AI - 图片生成]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: 图片生成提示词
 *                 example: "3-6岁幼儿园春游活动场景，孩子们在公园里快乐游玩"
 *               style:
 *                 type: string
 *                 enum: [cartoon, natural, artistic]
 *                 default: cartoon
 *                 description: 图片风格
 *               size:
 *                 type: string
 *                 enum: ["512x512", "1024x1024", "1024x768", "768x1024"]
 *                 default: "1024x768"
 *                 description: 图片尺寸
 *               category:
 *                 type: string
 *                 enum: [activity, poster, template, marketing, education]
 *                 default: activity
 *                 description: 图片分类
 *               activityData:
 *                 type: object
 *                 description: 活动相关数据，用于优化图片生成
 *                 properties:
 *                   title:
 *                     type: string
 *                     description: 活动标题
 *                   description:
 *                     type: string
 *                     description: 活动描述
 *                   activityType:
 *                     type: integer
 *                     description: 活动类型
 *     responses:
 *       200:
 *         description: 图片生成成功
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
 *                   example: "图片生成成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                       description: 生成的图片URL
 *                     thumbnailUrl:
 *                       type: string
 *                       description: 缩略图URL
 *                     metadata:
 *                       type: object
 *                       properties:
 *                         prompt:
 *                           type: string
 *                           description: 使用的提示词
 *                         style:
 *                           type: string
 *                           description: 图片风格
 *                         duration:
 *                           type: number
 *                           description: 生成耗时(毫秒)
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 图片生成失败
 */
router.post('/generate-activity-image', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var AutoImageGenerationService, _a, prompt_1, _b, style, _c, size, _d, category, activityData, imageRequest, result, error_1;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 3, , 4]);
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../services/ai/auto-image-generation.service')); })];
            case 1:
                AutoImageGenerationService = (_e.sent())["default"];
                _a = req.body, prompt_1 = _a.prompt, _b = _a.style, style = _b === void 0 ? 'cartoon' : _b, _c = _a.size, size = _c === void 0 ? '1024x768' : _c, _d = _a.category, category = _d === void 0 ? 'activity' : _d, activityData = _a.activityData;
                if (!prompt_1) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '提示词不能为空',
                            error: 'PROMPT_REQUIRED'
                        })];
                }
                imageRequest = {
                    prompt: prompt_1,
                    style: style,
                    size: size,
                    category: category,
                    quality: 'standard'
                };
                console.log('🎨 开始生成活动图片:', imageRequest);
                return [4 /*yield*/, AutoImageGenerationService.generateImage(imageRequest)];
            case 2:
                result = _e.sent();
                if (result.success) {
                    console.log('✅ 图片生成成功:', result.imageUrl);
                    res.json({
                        success: true,
                        message: '图片生成成功',
                        data: {
                            imageUrl: result.imageUrl,
                            thumbnailUrl: result.thumbnailUrl,
                            metadata: result.metadata,
                            usage: result.usage
                        }
                    });
                }
                else {
                    console.error('❌ 图片生成失败:', result.error);
                    res.status(500).json({
                        success: false,
                        message: '图片生成失败',
                        error: result.error,
                        metadata: result.metadata
                    });
                }
                return [3 /*break*/, 4];
            case 3:
                error_1 = _e.sent();
                console.error('❌ 图片生成API异常:', error_1);
                res.status(500).json({
                    success: false,
                    message: '图片生成服务异常',
                    error: error_1 instanceof Error ? error_1.message : '未知错误'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/ai/image-generation-status:
 *   get:
 *     summary: 检查图片生成服务状态
 *     description: 检查文生图服务是否可用
 *     tags: [AI - 图片生成]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 服务状态检查成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 available:
 *                   type: boolean
 *                   description: 服务是否可用
 *                 model:
 *                   type: string
 *                   description: 使用的模型名称
 *                 error:
 *                   type: string
 *                   description: 错误信息(如果有)
 */
router.get('/image-generation-status', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var AutoImageGenerationService, status_1, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../services/ai/auto-image-generation.service')); })];
            case 1:
                AutoImageGenerationService = (_a.sent())["default"];
                return [4 /*yield*/, AutoImageGenerationService.checkServiceStatus()];
            case 2:
                status_1 = _a.sent();
                res.json(__assign({ success: true }, status_1));
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error('❌ 检查图片生成服务状态失败:', error_2);
                res.json({
                    success: false,
                    available: false,
                    error: error_2 instanceof Error ? error_2.message : '未知错误'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ❌ 简易版AI通用聊天接口已删除 - 避免与完整版API混淆
// ✅ 请使用完整的会话消息API: /api/ai/conversations/{conversationId}/messages
// 完整API包含向量记忆、上下文管理、流式输出、豆包128K集成等高级功能
// =============================================
// AI Response Generators
// =============================================
function generateActivityAnalysisResponse(message) {
    // 活动分析专用回复生成器
    var analysisKeywords = {
        participation: ['参与', '参与度', '参加', '出席'],
        satisfaction: ['满意', '满意度', '评价', '反馈'],
        trend: ['趋势', '预测', '未来', '发展'],
        optimization: ['优化', '改进', '建议', '提升'],
        risk: ['风险', '问题', '隐患', '预防']
    };
    var lowerMessage = message.toLowerCase();
    if (analysisKeywords.participation.some(function (keyword) { return lowerMessage.includes(keyword); })) {
        return "\u57FA\u4E8E\u6D3B\u52A8\u53C2\u4E0E\u5EA6\u6570\u636E\u5206\u6790\uFF1A\n\n**\u8D8B\u52BF\u9884\u6D4B**\uFF1A\n\u5F53\u524D\u53C2\u4E0E\u5EA6\u5904\u4E8E\u4E2D\u7B49\u6C34\u5E73\uFF0C\u5EFA\u8BAE\u901A\u8FC7\u4EE5\u4E0B\u65B9\u5F0F\u63D0\u5347\uFF1A\n- \u4F18\u5316\u6D3B\u52A8\u65F6\u95F4\u5B89\u6392\uFF0C\u907F\u5F00\u5BB6\u957F\u5DE5\u4F5C\u9AD8\u5CF0\u671F\n- \u589E\u52A0\u4E92\u52A8\u6027\u5F3A\u7684\u4EB2\u5B50\u6D3B\u52A8\u9879\u76EE\n- \u63D0\u524D1-2\u5468\u53D1\u5E03\u6D3B\u52A8\u9884\u544A\uFF0C\u63D0\u9AD8\u5BB6\u957F\u53C2\u4E0E\u610F\u613F\n\n**\u4F18\u5316\u5EFA\u8BAE**\uFF1A\n1. \u5EFA\u7ACB\u6D3B\u52A8\u53CD\u9988\u673A\u5236\uFF0C\u53CA\u65F6\u6536\u96C6\u5BB6\u957F\u610F\u89C1\n2. \u6839\u636E\u4E0D\u540C\u5E74\u9F84\u6BB5\u8BBE\u8BA1\u5DEE\u5F02\u5316\u6D3B\u52A8\u5185\u5BB9\n3. \u589E\u52A0\u7EBF\u4E0A\u7EBF\u4E0B\u7ED3\u5408\u7684\u6D3B\u52A8\u5F62\u5F0F\n\n**\u98CE\u9669\u63D0\u9192**\uFF1A\n\u6CE8\u610F\u76D1\u63A7\u53C2\u4E0E\u5EA6\u4E0B\u964D\u8D8B\u52BF\uFF0C\u53CA\u65F6\u8C03\u6574\u6D3B\u52A8\u7B56\u7565\uFF0C\u907F\u514D\u5BB6\u957F\u53C2\u4E0E\u79EF\u6781\u6027\u6301\u7EED\u964D\u4F4E\u3002";
    }
    if (analysisKeywords.satisfaction.some(function (keyword) { return lowerMessage.includes(keyword); })) {
        return "\u57FA\u4E8E\u6D3B\u52A8\u6EE1\u610F\u5EA6\u6570\u636E\u5206\u6790\uFF1A\n\n**\u8D8B\u52BF\u9884\u6D4B**\uFF1A\n\u6EE1\u610F\u5EA6\u6574\u4F53\u7A33\u5B9A\uFF0C\u4F46\u5B58\u5728\u63D0\u5347\u7A7A\u95F4\uFF0C\u9884\u8BA1\u901A\u8FC7\u6539\u8FDB\u53EF\u63D0\u534715-20%\u3002\n\n**\u4F18\u5316\u5EFA\u8BAE**\uFF1A\n1. \u52A0\u5F3A\u6D3B\u52A8\u524D\u671F\u51C6\u5907\uFF0C\u786E\u4FDD\u6D3B\u52A8\u6D41\u7A0B\u987A\u7545\n2. \u63D0\u5347\u6559\u5E08\u6D3B\u52A8\u7EC4\u7EC7\u80FD\u529B\uFF0C\u589E\u52A0\u4E13\u4E1A\u57F9\u8BAD\n3. \u4F18\u5316\u6D3B\u52A8\u573A\u5730\u5E03\u7F6E\uFF0C\u8425\u9020\u66F4\u597D\u7684\u6D3B\u52A8\u6C1B\u56F4\n\n**\u98CE\u9669\u63D0\u9192**\uFF1A\n\u5173\u6CE8\u6EE1\u610F\u5EA6\u6CE2\u52A8\u8F83\u5927\u7684\u6D3B\u52A8\u7C7B\u578B\uFF0C\u5206\u6790\u539F\u56E0\u5E76\u53CA\u65F6\u6539\u8FDB\uFF0C\u9632\u6B62\u53E3\u7891\u4E0B\u964D\u5F71\u54CD\u540E\u7EED\u6D3B\u52A8\u53C2\u4E0E\u3002";
    }
    // 默认综合分析回复
    return "\u57FA\u4E8E\u60A8\u63D0\u4F9B\u7684\u6D3B\u52A8\u6570\u636E\uFF0C\u6211\u8FDB\u884C\u4E86\u7EFC\u5408\u5206\u6790\uFF1A\n\n**\u8D8B\u52BF\u9884\u6D4B**\uFF1A\n\u6D3B\u52A8\u6574\u4F53\u8868\u73B0\u826F\u597D\uFF0C\u53C2\u4E0E\u5EA6\u548C\u6EE1\u610F\u5EA6\u5747\u5904\u4E8E\u5408\u7406\u8303\u56F4\u3002\u9884\u8BA1\u4E0B\u6708\u6D3B\u52A8\u53C2\u4E0E\u5EA6\u670910-15%\u7684\u63D0\u5347\u6F5C\u529B\u3002\n\n**\u4F18\u5316\u5EFA\u8BAE**\uFF1A\n1. \u6839\u636E\u6570\u636E\u53CD\u9988\u4F18\u5316\u6D3B\u52A8\u5185\u5BB9\u8BBE\u8BA1\n2. \u52A0\u5F3A\u4E0E\u5BB6\u957F\u7684\u6C9F\u901A\u4E92\u52A8\n3. \u5EFA\u7ACB\u6D3B\u52A8\u6548\u679C\u8BC4\u4F30\u673A\u5236\n\n**\u98CE\u9669\u63D0\u9192**\uFF1A\n\u6CE8\u610F\u5B63\u8282\u6027\u56E0\u7D20\u5BF9\u6D3B\u52A8\u53C2\u4E0E\u7684\u5F71\u54CD\uFF0C\u63D0\u524D\u505A\u597D\u5E94\u5BF9\u9884\u6848\u3002\u5EFA\u8BAE\u5EFA\u7ACB\u6D3B\u52A8\u6570\u636E\u76D1\u63A7\u4F53\u7CFB\uFF0C\u53CA\u65F6\u53D1\u73B0\u5E76\u89E3\u51B3\u95EE\u9898\u3002";
}
function generateStudentAnalysisResponse(message) {
    return "\u57FA\u4E8E\u5B66\u751F\u6570\u636E\u5206\u6790\uFF1A\n\n**\u5B66\u4E60\u8868\u73B0\u8BC4\u4F30**\uFF1A\n\u5B66\u751F\u6574\u4F53\u5B66\u4E60\u72B6\u6001\u826F\u597D\uFF0C\u5404\u9879\u6307\u6807\u5747\u5728\u6B63\u5E38\u8303\u56F4\u5185\u3002\u5EFA\u8BAE\u7EE7\u7EED\u4FDD\u6301\u4E2A\u6027\u5316\u6559\u5B66\u65B9\u6CD5\u3002\n\n**\u53D1\u5C55\u5EFA\u8BAE**\uFF1A\n1. \u52A0\u5F3A\u5B66\u751F\u5174\u8DA3\u57F9\u517B\uFF0C\u63D0\u4F9B\u591A\u6837\u5316\u5B66\u4E60\u6D3B\u52A8\n2. \u5173\u6CE8\u5B66\u751F\u4E2A\u4F53\u5DEE\u5F02\uFF0C\u5236\u5B9A\u9488\u5BF9\u6027\u6559\u5B66\u8BA1\u5212\n3. \u589E\u5F3A\u5BB6\u6821\u5408\u4F5C\uFF0C\u5171\u540C\u4FC3\u8FDB\u5B66\u751F\u5168\u9762\u53D1\u5C55\n\n**\u5173\u6CE8\u8981\u70B9**\uFF1A\n\u5EFA\u8BAE\u5B9A\u671F\u8BC4\u4F30\u5B66\u751F\u5B66\u4E60\u8FDB\u5EA6\uFF0C\u53CA\u65F6\u8C03\u6574\u6559\u5B66\u7B56\u7565\uFF0C\u786E\u4FDD\u6BCF\u4E2A\u5B66\u751F\u90FD\u80FD\u5F97\u5230\u9002\u5408\u7684\u6559\u80B2\u652F\u6301\u3002";
}
function generateEnrollmentAnalysisResponse(message) {
    return "\u57FA\u4E8E\u62DB\u751F\u6570\u636E\u5206\u6790\uFF1A\n\n**\u62DB\u751F\u8D8B\u52BF**\uFF1A\n\u5F53\u524D\u62DB\u751F\u60C5\u51B5\u6574\u4F53\u7A33\u5B9A\uFF0C\u5EFA\u8BAE\u52A0\u5F3A\u54C1\u724C\u5BA3\u4F20\u548C\u53E3\u7891\u5EFA\u8BBE\u3002\n\n**\u7B56\u7565\u5EFA\u8BAE**\uFF1A\n1. \u4F18\u5316\u62DB\u751F\u6E20\u9053\uFF0C\u91CD\u70B9\u53D1\u5C55\u7EBF\u4E0A\u63A8\u5E7F\n2. \u52A0\u5F3A\u73B0\u6709\u5BB6\u957F\u6EE1\u610F\u5EA6\uFF0C\u4FC3\u8FDB\u53E3\u7891\u4F20\u64AD\n3. \u5B8C\u5584\u62DB\u751F\u6D41\u7A0B\uFF0C\u63D0\u5347\u5BB6\u957F\u4F53\u9A8C\n\n**\u5E02\u573A\u6D1E\u5BDF**\uFF1A\n\u5EFA\u8BAE\u5173\u6CE8\u7ADE\u4E89\u5BF9\u624B\u52A8\u6001\uFF0C\u53CA\u65F6\u8C03\u6574\u62DB\u751F\u7B56\u7565\uFF0C\u4FDD\u6301\u5E02\u573A\u7ADE\u4E89\u4F18\u52BF\u3002";
}
function generateGeneralChatResponse(message) {
    var responses = [
        '我是您的AI助手，很高兴为您服务！我可以帮助您分析各种教育数据，提供专业建议。',
        '感谢您的咨询。基于我的分析能力，我可以为您提供数据洞察和优化建议。',
        '我理解您的需求。作为教育领域的AI助手，我将为您提供专业的分析和建议。',
        '很高兴与您交流！我可以帮助您处理各种教育管理相关的问题和数据分析。'
    ];
    var randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex] + "\n\n\u60A8\u7684\u95EE\u9898\uFF1A\"".concat(message, "\"\uFF0C\u6211\u6B63\u5728\u4E3A\u60A8\u5206\u6790\u5904\u7406...");
}
exports["default"] = router;
