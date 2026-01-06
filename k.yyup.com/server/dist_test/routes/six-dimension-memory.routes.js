"use strict";
/**
 * 六维记忆系统路由配置
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var six_dimension_memory_controller_1 = __importDefault(require("../controllers/ai/six-dimension-memory.controller"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
// 所有路由都需要认证
router.use(auth_middleware_1.verifyToken);
/**
 * @swagger
 * /api/six-dimension-memory/retrieve:
 *   post:
 *     summary: 主动检索记忆
 *     description: 根据查询条件主动检索相关记忆内容
 *     tags:
 *       - 六维记忆系统
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: 检索查询内容
 *               dimensions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [core, episodic, semantic, procedural, resource, knowledge]
 *                 description: 要检索的记忆维度
 *               limit:
 *                 type: integer
 *                 default: 10
 *                 description: 返回结果数量限制
 *     responses:
 *       200:
 *         description: 检索成功
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
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/retrieve', six_dimension_memory_controller_1["default"].activeRetrieval.bind(six_dimension_memory_controller_1["default"]));
/**
 * @swagger
 * /api/six-dimension-memory/conversation:
 *   post:
 *     summary: 记录对话
 *     description: 记录用户与AI的对话内容到记忆系统
 *     tags:
 *       - 六维记忆系统
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userMessage
 *               - aiResponse
 *             properties:
 *               userMessage:
 *                 type: string
 *                 description: 用户消息内容
 *               aiResponse:
 *                 type: string
 *                 description: AI响应内容
 *               context:
 *                 type: object
 *                 description: 对话上下文信息
 *     responses:
 *       200:
 *         description: 记录成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/conversation', six_dimension_memory_controller_1["default"].recordConversation.bind(six_dimension_memory_controller_1["default"]));
/**
 * @swagger
 * /api/six-dimension-memory/core/{userId}:
 *   get:
 *     summary: 获取核心记忆
 *     description: 获取用户的核心记忆信息
 *     tags:
 *       - 六维记忆系统
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: false
 *         description: 用户ID（可选，默认为当前用户）
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
 *                 data:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/core/:userId?', six_dimension_memory_controller_1["default"].getCoreMemory.bind(six_dimension_memory_controller_1["default"]));
/**
 * @swagger
 * /api/six-dimension-memory/core/{userId}:
 *   put:
 *     summary: 更新核心记忆
 *     description: 更新用户的核心记忆信息
 *     tags:
 *       - 六维记忆系统
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: false
 *         description: 用户ID（可选，默认为当前用户）
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coreMemory:
 *                 type: object
 *                 description: 核心记忆内容
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/core/:userId?', six_dimension_memory_controller_1["default"].updateCoreMemory.bind(six_dimension_memory_controller_1["default"]));
/**
 * @swagger
 * /api/six-dimension-memory/episodic:
 *   get:
 *     summary: 获取情节记忆
 *     description: 获取用户的情节记忆列表
 *     tags:
 *       - 六维记忆系统
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
router.get('/episodic', six_dimension_memory_controller_1["default"].getEpisodicMemory.bind(six_dimension_memory_controller_1["default"]));
/**
 * @swagger
 * /api/six-dimension-memory/episodic:
 *   post:
 *     summary: 创建情节记忆
 *     description: 创建新的情节记忆记录
 *     tags:
 *       - 六维记忆系统
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event
 *             properties:
 *               event:
 *                 type: string
 *                 description: 事件描述
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               context:
 *                 type: object
 *     responses:
 *       200:
 *         description: 创建成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/episodic', six_dimension_memory_controller_1["default"].createEpisodicMemory.bind(six_dimension_memory_controller_1["default"]));
/**
 * @swagger
 * /api/six-dimension-memory/semantic/search:
 *   get:
 *     summary: 搜索语义记忆
 *     description: 根据关键词搜索语义概念
 *     tags:
 *       - 六维记忆系统
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 搜索成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/semantic/search', six_dimension_memory_controller_1["default"].searchSemanticMemory.bind(six_dimension_memory_controller_1["default"]));
/**
 * @swagger
 * /api/six-dimension-memory/semantic:
 *   post:
 *     summary: 创建语义概念
 *     description: 创建新的语义概念记录
 *     tags:
 *       - 六维记忆系统
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - concept
 *             properties:
 *               concept:
 *                 type: string
 *               definition:
 *                 type: string
 *               relatedConcepts:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 创建成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/semantic', six_dimension_memory_controller_1["default"].createSemanticConcept.bind(six_dimension_memory_controller_1["default"]));
/**
 * @swagger
 * /api/six-dimension-memory/semantic/{conceptId}/related:
 *   get:
 *     summary: 获取相关概念
 *     description: 获取与指定概念相关的其他概念
 *     tags:
 *       - 六维记忆系统
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conceptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/semantic/:conceptId/related', six_dimension_memory_controller_1["default"].getRelatedConcepts.bind(six_dimension_memory_controller_1["default"]));
/**
 * @swagger
 * /api/six-dimension-memory/procedural/{procedureName}:
 *   get:
 *     summary: 获取过程步骤
 *     description: 获取指定过程的执行步骤
 *     tags:
 *       - 六维记忆系统
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: procedureName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/procedural/:procedureName', six_dimension_memory_controller_1["default"].getProcedureSteps.bind(six_dimension_memory_controller_1["default"]));
/**
 * @swagger
 * /api/six-dimension-memory/procedural:
 *   post:
 *     summary: 记录过程
 *     description: 记录新的过程执行步骤
 *     tags:
 *       - 六维记忆系统
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - procedureName
 *               - steps
 *             properties:
 *               procedureName:
 *                 type: string
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: 记录成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/procedural', six_dimension_memory_controller_1["default"].recordProcedure.bind(six_dimension_memory_controller_1["default"]));
/**
 * @swagger
 * /api/six-dimension-memory/resource/search:
 *   get:
 *     summary: 搜索资源
 *     description: 搜索资源记忆
 *     tags:
 *       - 六维记忆系统
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 搜索成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/resource/search', six_dimension_memory_controller_1["default"].searchResources.bind(six_dimension_memory_controller_1["default"]));
/**
 * @swagger
 * /api/six-dimension-memory/resource:
 *   post:
 *     summary: 保存资源
 *     description: 保存新的资源记忆
 *     tags:
 *       - 六维记忆系统
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resourceType
 *               - resourceData
 *             properties:
 *               resourceType:
 *                 type: string
 *               resourceData:
 *                 type: object
 *     responses:
 *       200:
 *         description: 保存成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/resource', six_dimension_memory_controller_1["default"].saveResource.bind(six_dimension_memory_controller_1["default"]));
/**
 * @swagger
 * /api/six-dimension-memory/resource/{resourceId}/access:
 *   put:
 *     summary: 标记资源已访问
 *     description: 标记资源已被访问，更新访问记录
 *     tags:
 *       - 六维记忆系统
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 标记成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/resource/:resourceId/access', six_dimension_memory_controller_1["default"].markResourceAccessed.bind(six_dimension_memory_controller_1["default"]));
/**
 * @swagger
 * /api/six-dimension-memory/knowledge/search:
 *   get:
 *     summary: 搜索知识
 *     description: 在知识库中搜索相关知识
 *     tags:
 *       - 六维记忆系统
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 搜索成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/knowledge/search', six_dimension_memory_controller_1["default"].searchKnowledge.bind(six_dimension_memory_controller_1["default"]));
/**
 * @swagger
 * /api/six-dimension-memory/knowledge:
 *   post:
 *     summary: 学习知识
 *     description: 向知识库添加新的知识条目
 *     tags:
 *       - 六维记忆系统
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - knowledge
 *             properties:
 *               knowledge:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 学习成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/knowledge', six_dimension_memory_controller_1["default"].learnKnowledge.bind(six_dimension_memory_controller_1["default"]));
/**
 * @swagger
 * /api/six-dimension-memory/knowledge/{entryId}/validate:
 *   put:
 *     summary: 验证知识
 *     description: 验证知识条目的准确性
 *     tags:
 *       - 六维记忆系统
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
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
 *               isValid:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 验证成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/knowledge/:entryId/validate', six_dimension_memory_controller_1["default"].validateKnowledge.bind(six_dimension_memory_controller_1["default"]));
/**
 * @swagger
 * /api/six-dimension-memory/context:
 *   get:
 *     summary: 获取记忆上下文
 *     description: 获取当前用户的完整记忆上下文
 *     tags:
 *       - 六维记忆系统
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/context', six_dimension_memory_controller_1["default"].getMemoryContext.bind(six_dimension_memory_controller_1["default"]));
/**
 * @swagger
 * /api/six-dimension-memory/compress:
 *   post:
 *     summary: 压缩记忆
 *     description: 压缩和整理记忆数据
 *     tags:
 *       - 六维记忆系统
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 压缩成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/compress', six_dimension_memory_controller_1["default"].compressMemories.bind(six_dimension_memory_controller_1["default"]));
/**
 * @swagger
 * /api/six-dimension-memory/stats:
 *   get:
 *     summary: 获取记忆统计
 *     description: 获取记忆系统的统计信息
 *     tags:
 *       - 六维记忆系统
 *     security:
 *       - bearerAuth: []
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalMemories:
 *                       type: integer
 *                     byDimension:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', six_dimension_memory_controller_1["default"].getMemoryStats.bind(six_dimension_memory_controller_1["default"]));
exports["default"] = router;
