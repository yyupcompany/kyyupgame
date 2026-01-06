/**
 * @swagger
 * components:
 *   schemas:
 *     Call-center:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Call-center ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Call-center 名称
 *           example: "示例Call-center"
 *         status:
 *           type: string
 *           description: 状态
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2024-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2024-01-01T00:00:00.000Z"
 *     CreateCall-centerRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Call-center 名称
 *           example: "新Call-center"
 *     UpdateCall-centerRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Call-center 名称
 *           example: "更新后的Call-center"
 *     Call-centerListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             list:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Call-center'
 *         message:
 *           type: string
 *           example: "获取call-center列表成功"
 *     Call-centerResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Call-center'
 *         message:
 *           type: string
 *           example: "操作成功"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "操作失败"
 *         code:
 *           type: string
 *           example: "INTERNAL_ERROR"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * call-center管理路由文件
 * 提供call-center的基础CRUD操作
 *
 * 功能包括：
 * - 获取call-center列表
 * - 创建新call-center
 * - 获取call-center详情
 * - 更新call-center信息
 * - 删除call-center
 *
 * 权限要求：需要有效的JWT Token认证
 */

/**
 * 呼叫中心路由
 * 定义所有呼叫中心相关的API路由
 */

import { Router } from 'express'
import callCenterController from '../controllers/call-center.controller'
import { verifyToken } from '../middlewares/auth.middleware'

const router = Router()

// 所有路由都需要认证
router.use(verifyToken)

// ========== 概览数据 ==========

/**
 * @swagger
 * /api/call-center/overview:
 *   get:
 *     summary: 获取呼叫中心概览数据
 *     description: 获取呼叫中心的整体运营数据概览，包括通话统计、AI分析结果、实时状态等
 *     tags:
 *       - 呼叫中心管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取概览数据
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
 *                     totalCalls:
 *                       type: number
 *                       example: 1250
 *                       description: 总通话数量
 *                     activeCalls:
 *                       type: number
 *                       example: 12
 *                       description: 当前活跃通话数
 *                     aiAnalysisCount:
 *                       type: number
 *                       example: 850
 *                       description: AI分析通话数量
 *                     averageCallDuration:
 *                       type: number
 *                       example: 245
 *                       description: 平均通话时长（秒）
 *                     satisfactionRate:
 *                       type: number
 *                       example: 4.2
 *                       description: 客户满意度评分
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/overview', callCenterController.getOverview)

// ========== VOS呼叫管理 ==========

/**
 * @swagger
 * /api/call-center/call/make:
 *   post:
 *     summary: 发起UDP呼叫
 *     description: 通过VOS系统发起UDP协议的外呼电话
 *     tags:
 *       - 呼叫中心管理
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "13800138000"
 *                 description: 目标电话号码
 *               callerId:
 *                 type: string
 *                 example: "1001"
 *                 description: 主叫号码/分机号
 *               customerId:
 *                 type: integer
 *                 example: 123
 *                 description: 客户ID
 *               callType:
 *                 type: string
 *                 enum: [outbound, inbound, transfer]
 *                 example: "outbound"
 *                 description: 通话类型
 *     responses:
 *       200:
 *         description: 成功发起呼叫
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
 *                     callId:
 *                       type: string
 *                       example: "call_123456789"
 *                       description: 通话ID
 *                     status:
 *                       type: string
 *                       example: "initiated"
 *                       description: 通话状态
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/call/make', callCenterController.makeCallUDP)

/**
 * @swagger
 * /api/call-center/call/{callId}/status:
 *   get:
 *     summary: 获取通话状态
 *     description: 获取指定通话的实时状态信息
 *     tags:
 *       - 呼叫中心管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: callId
 *         required: true
 *         schema:
 *           type: string
 *         description: 通话ID
 *     responses:
 *       200:
 *         description: 成功获取通话状态
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
 *                     callId:
 *                       type: string
 *                       example: "call_123456789"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                       description: 通话状态
 *                     startTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-12-01T10:30:00Z"
 *                     duration:
 *                       type: integer
 *                       example: 125
 *                       description: 通话时长（秒）
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/call/:callId/status', callCenterController.getCallStatusUDP)

/**
 * @swagger
 * /api/call-center/call/hangup:
 *   post:
 *     summary: 挂断通话
 *     description: 主动挂断指定的通话
 *     tags:
 *       - 呼叫中心管理
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - callId
 *             properties:
 *               callId:
 *                 type: string
 *                 example: "call_123456789"
 *                 description: 要挂断的通话ID
 *               reason:
 *                 type: string
 *                 example: "completed"
 *                 description: 挂断原因
 *     responses:
 *       200:
 *         description: 成功挂断通话
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
 *                     callId:
 *                       type: string
 *                       example: "call_123456789"
 *                     finalStatus:
 *                       type: string
 *                       example: "completed"
 *                     endTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-12-01T10:32:05Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/call/hangup', callCenterController.hangupCallUDP)

/**
 * @swagger
 * /api/call-center/calls/active:
 *   get:
 *     summary: 获取活跃通话列表
 *     description: 获取当前所有活跃的通话列表
 *     tags:
 *       - 呼叫中心管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 20
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 成功获取活跃通话列表
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
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           callId:
 *                             type: string
 *                           phoneNumber:
 *                             type: string
 *                           startTime:
 *                             type: string
 *                             format: date-time
 *                           duration:
 *                             type: integer
 *                           status:
 *                             type: string
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/calls/active', callCenterController.getActiveCallsUDP)

// 通话查询
router.get('/calls/active', callCenterController.getActiveCalls)
router.get('/calls/history', callCenterController.getCallHistory)
router.get('/calls/statistics', callCenterController.getCallStatistics)

// ========== 录音管理 ==========
router.post('/call/:callId/recording/start', callCenterController.startRecording)
router.post('/call/:callId/recording/stop', callCenterController.stopRecording)

router.get('/recordings', callCenterController.getRecordings)
router.get('/recordings/:id', callCenterController.getRecording)
router.delete('/recordings/:id', callCenterController.deleteRecording)

router.get('/recordings/:id/download', callCenterController.downloadRecording)
router.get('/recordings/:id/transcript', callCenterController.getTranscript)
router.put('/recordings/:id/transcript', callCenterController.updateTranscript)
router.post('/recordings/:id/transcribe', callCenterController.requestTranscription)

// ========== AI分析功能 ==========

/**
 * @swagger
 * /api/call-center/ai/analyze/{callId}:
 *   post:
 *     summary: AI分析通话内容
 *     description: 使用AI技术分析通话录音，包括情感分析、关键词提取、通话质量评估等
 *     tags:
 *       - 呼叫中心管理
 *       - AI分析
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: callId
 *         required: true
 *         schema:
 *           type: string
 *         description: 通话ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               analysisType:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [sentiment, keywords, quality, compliance]
 *                 example: ["sentiment", "keywords"]
 *                 description: 分析类型
 *               language:
 *                 type: string
 *                 example: "zh-CN"
 *                 description: 语言代码
 *     responses:
 *       200:
 *         description: 成功完成AI分析
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
 *                     analysisId:
 *                       type: string
 *                       example: "analysis_123456"
 *                     sentiment:
 *                       type: object
 *                       properties:
 *                         score:
 *                           type: number
 *                           example: 0.75
 *                         label:
 *                           type: string
 *                           example: "positive"
 *                     keywords:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["报名", "费用", "时间"]
 *                     quality:
 *                       type: object
 *                       properties:
 *                         clarity:
 *                           type: number
 *                           example: 0.85
 *                         noise:
 *                           type: number
 *                           example: 0.15
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/ai/analyze/:callId', callCenterController.analyzeCall)

/**
 * @swagger
 * /api/call-center/ai/batch-analyze:
 *   post:
 *     summary: 批量AI分析通话
 *     description: 批量分析多个通话的录音内容
 *     tags:
 *       - 呼叫中心管理
 *       - AI分析
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - callIds
 *             properties:
 *               callIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["call_1", "call_2", "call_3"]
 *                 description: 通话ID列表
 *               analysisTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [sentiment, keywords, quality, compliance]
 *                 example: ["sentiment", "keywords"]
 *                 description: 分析类型
 *     responses:
 *       200:
 *         description: 成功提交批量分析任务
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
 *                     batchId:
 *                       type: string
 *                       example: "batch_123456"
 *                     totalCalls:
 *                       type: integer
 *                       example: 3
 *                     status:
 *                       type: string
 *                       example: "processing"
 *                     estimatedTime:
 *                       type: integer
 *                       example: 300
 *                       description: 预计完成时间（秒）
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/ai/batch-analyze', callCenterController.batchAnalyze)

/**
 * @swagger
 * /api/call-center/ai/synthesize:
 *   post:
 *     summary: 语音合成
 *     description: 将文本转换为语音文件
 *     tags:
 *       - 呼叫中心管理
 *       - AI分析
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "您好，欢迎使用幼儿园管理系统"
 *                 description: 要合成的文本内容
 *               voice:
 *                 type: string
 *                 example: "xiaoyan"
 *                 description: 语音风格
 *               speed:
 *                 type: number
 *                 example: 1.0
 *                 minimum: 0.5
 *                 maximum: 2.0
 *                 description: 语速
 *               volume:
 *                 type: number
 *                 example: 1.0
 *                 minimum: 0.1
 *                 maximum: 2.0
 *                 description: 音量
 *               format:
 *                 type: string
 *                 enum: [mp3, wav, ogg]
 *                 example: "mp3"
 *                 description: 音频格式
 *     responses:
 *       200:
 *         description: 成功提交语音合成任务
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
 *                     taskId:
 *                       type: string
 *                       example: "synthesize_123456"
 *                     status:
 *                       type: string
 *                       example: "processing"
 *                     estimatedTime:
 *                       type: integer
 *                       example: 10
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/ai/synthesize', callCenterController.synthesizeVoice)

/**
 * @swagger
 * /api/call-center/ai/synthesize/{taskId}/status:
 *   get:
 *     summary: 获取语音合成状态
 *     description: 查询语音合成任务的执行状态和结果
 *     tags:
 *       - 呼叫中心管理
 *       - AI分析
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *     responses:
 *       200:
 *         description: 成功获取合成状态
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
 *                     taskId:
 *                       type: string
 *                       example: "synthesize_123456"
 *                     status:
 *                       type: string
 *                       enum: [processing, completed, failed]
 *                       example: "completed"
 *                     progress:
 *                       type: integer
 *                       example: 100
 *                     audioUrl:
 *                       type: string
 *                       example: "https://example.com/audio/voice.mp3"
 *                     duration:
 *                       type: number
 *                       example: 15.5
 *                       description: 音频时长（秒）
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/ai/synthesize/:taskId/status', callCenterController.getSynthesisStatus)

// TTS测试功能
router.post('/ai/tts/test', callCenterController.testTTS)
router.get('/ai/tts/voices', callCenterController.getTTSVoices)

// AI智能功能（新增）
router.post('/ai/generate-script', callCenterController.generateAIScript)  // AI话术生成
router.post('/ai/speech-to-text', callCenterController.speechToText)       // 语音识别
router.post('/ai/check-compliance', callCenterController.checkCompliance)  // 合规审查

// 实时转写
router.post('/ai/transcribe/:callId/start', callCenterController.startTranscription)
router.post('/ai/transcribe/:callId/stop', callCenterController.stopTranscription)
router.get('/ai/transcribe/:callId/result', callCenterController.getTranscriptionResult)

// 情感分析和智能回复
router.get('/ai/sentiment/:callId', callCenterController.analyzeSentiment)
router.post('/ai/generate-response/:callId', callCenterController.generateResponse)

// ========== 分机管理 ==========
router.get('/extensions', callCenterController.getExtensions)
router.get('/extensions/:id', callCenterController.getExtension)
router.put('/extensions/:id/status', callCenterController.updateExtensionStatus)
router.post('/extensions/:id/reset', callCenterController.resetExtension)

// ========== 联系人管理 ==========
router.get('/contacts', callCenterController.getContacts)
router.post('/contacts', callCenterController.createContact)
router.put('/contacts/:id', callCenterController.updateContact)
router.delete('/contacts/:id', callCenterController.deleteContact)
router.get('/contacts/search', callCenterController.searchContacts)

// ========== 实时状态 ==========
router.get('/realtime/status', callCenterController.getRealTimeStatus)

// ========== WebSocket连接支持 ==========
// 注意：WebSocket连接通常通过升级请求处理，这里只是定义相关的HTTP API

export default router