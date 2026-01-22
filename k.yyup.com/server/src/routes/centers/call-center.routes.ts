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
import callCenterController from '../../controllers/call-center.controller'

const router = Router()

// 所有路由都需要认证
// router.use(authMiddleware)

// ========== 概览数据 ==========

// router.get('/overview', callCenterController.getOverview)

// ========== VOS呼叫管理 ==========

// router.post('/call/make', callCenterController.makeCallUDP)
// router.get('/call/:callId/status', callCenterController.getCallStatusUDP)
// router.post('/call/hangup', callCenterController.hangupCallUDP)
// router.get('/calls/active', callCenterController.getActiveCallsUDP)

// 通话查询
// router.get('/calls/active', callCenterController.getActiveCalls)
// router.get('/calls/history', callCenterController.getCallHistory)
// router.get('/calls/statistics', callCenterController.getCallStatistics)

// ========== 录音管理 ==========
// router.post('/call/:callId/recording/start', callCenterController.startRecording)
// router.post('/call/:callId/recording/stop', callCenterController.stopRecording)

// router.get('/recordings', callCenterController.getRecordings)
// router.get('/recordings/:id', callCenterController.getRecording)
// router.delete('/recordings/:id', callCenterController.deleteRecording)

// router.get('/recordings/:id/download', callCenterController.downloadRecording)
// router.get('/recordings/:id/transcript', callCenterController.getTranscript)
// router.put('/recordings/:id/transcript', callCenterController.updateTranscript)
// router.post('/recordings/:id/transcribe', callCenterController.requestTranscription)

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
// router.post('/ai/synthesize', callCenterController.synthesizeVoice)

// router.get('/ai/synthesize/:taskId/status', callCenterController.getSynthesisStatus)

// TTS测试功能
// router.post('/ai/tts/test', callCenterController.testTTS)
// router.get('/ai/tts/voices', callCenterController.getTTSVoices)

// AI智能功能（新增）
// router.post('/ai/generate-script', callCenterController.generateAIScript)  // AI话术生成
// router.post('/ai/speech-to-text', callCenterController.speechToText)       // 语音识别
// router.post('/ai/check-compliance', callCenterController.checkCompliance)  // 合规审查

// 实时转写
// router.post('/ai/transcribe/:callId/start', callCenterController.startTranscription)
// router.post('/ai/transcribe/:callId/stop', callCenterController.stopTranscription)
// router.get('/ai/transcribe/:callId/result', callCenterController.getTranscriptionResult)

// 情感分析和智能回复
// router.get('/ai/sentiment/:callId', callCenterController.analyzeSentiment)
// router.post('/ai/generate-response/:callId', callCenterController.generateResponse)

// ========== 分机管理 ==========
// router.get('/extensions', callCenterController.getExtensions)
// router.get('/extensions/:id', callCenterController.getExtension)
// router.put('/extensions/:id/status', callCenterController.updateExtensionStatus)
// router.post('/extensions/:id/reset', callCenterController.resetExtension)

// ========== 联系人管理 ==========
// router.get('/contacts', callCenterController.getContacts)
// router.post('/contacts', callCenterController.createContact)
// router.put('/contacts/:id', callCenterController.updateContact)
// router.delete('/contacts/:id', callCenterController.deleteContact)
// router.get('/contacts/search', callCenterController.searchContacts)

// ========== 实时状态 ==========
// router.get('/realtime/status', callCenterController.getRealTimeStatus)

// ========== WebSocket连接支持 ==========
// 注意：WebSocket连接通常通过升级请求处理，这里只是定义相关的HTTP API

export default router