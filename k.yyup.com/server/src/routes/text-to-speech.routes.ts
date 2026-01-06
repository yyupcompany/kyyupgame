/**
* @swagger
 * components:
 *   schemas:
 *     Text-to-speech:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Text-to-speech ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Text-to-speech 名称
 *           example: "示例Text-to-speech"
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
 *     CreateText-to-speechRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Text-to-speech 名称
 *           example: "新Text-to-speech"
 *     UpdateText-to-speechRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Text-to-speech 名称
 *           example: "更新后的Text-to-speech"
 *     Text-to-speechListResponse:
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
 *                 $ref: '#/components/schemas/Text-to-speech'
 *         message:
 *           type: string
 *           example: "获取text-to-speech列表成功"
 *     Text-to-speechResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Text-to-speech'
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
 * text-to-speech管理路由文件
 * 提供text-to-speech的基础CRUD操作
*
 * 功能包括：
 * - 获取text-to-speech列表
 * - 创建新text-to-speech
 * - 获取text-to-speech详情
 * - 更新text-to-speech信息
 * - 删除text-to-speech
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import textToSpeechController from '../controllers/text-to-speech.controller';

const router = Router();

// 应用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/ai/text-to-speech:
 *   post:
 *     summary: 文字转语音
 *     description: 将文字内容转换为语音
 *     tags: [AI - 文字转语音]
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
 *                 description: 要转换的文字内容
 *                 maxLength: 4096
 *               voice:
 *                 type: string
 *                 description: 音色选择
 *                 enum: [alloy, nova, shimmer, echo, fable, onyx]
 *                 default: nova
 *               speed:
 *                 type: number
 *                 description: 语速（0.25-4.0）
 *                 minimum: 0.25
 *                 maximum: 4.0
 *                 default: 1.0
 *               format:
 *                 type: string
 *                 description: 输出格式
 *                 enum: [mp3, opus, aac, flac]
 *                 default: mp3
 *     responses:
 *       200:
 *         description: 语音文件
 *         content:
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: 参数错误
 *       500:
 *         description: 服务器错误
*/
router.post('/', textToSpeechController.generateSpeech);

/**
* @swagger
 * /api/ai/text-to-speech/voices:
 *   get:
 *     summary: 获取可用音色列表
 *     description: 获取所有可用的语音音色
 *     tags: [AI - 文字转语音]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 音色列表
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       language:
 *                         type: string
*/
router.get('/voices', textToSpeechController.getVoices);

/**
* @swagger
 * /api/ai/text-to-speech/config:
 *   get:
 *     summary: 获取TTS配置
 *     description: 获取文字转语音的配置信息
 *     tags: [AI - 文字转语音]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 配置信息
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
 *                     hasConfig:
 *                       type: boolean
 *                     modelName:
 *                       type: string
 *                     maxLength:
 *                       type: number
 *                     supportedFormats:
 *                       type: array
 *                       items:
 *                         type: string
 *                     speedRange:
 *                       type: object
*/
router.get('/config', textToSpeechController.getConfig);

export default router;

