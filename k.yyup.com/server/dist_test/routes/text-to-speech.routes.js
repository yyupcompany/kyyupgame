"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var text_to_speech_controller_1 = __importDefault(require("../controllers/text-to-speech.controller"));
var router = (0, express_1.Router)();
// 应用认证中间件
router.use(auth_middleware_1.verifyToken);
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
router.post('/', text_to_speech_controller_1["default"].generateSpeech);
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
router.get('/voices', text_to_speech_controller_1["default"].getVoices);
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
router.get('/config', text_to_speech_controller_1["default"].getConfig);
exports["default"] = router;
