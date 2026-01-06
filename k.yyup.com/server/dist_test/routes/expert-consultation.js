"use strict";
/**
 * AI专家咨询路由配置
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var expert_consultation_controller_1 = __importDefault(require("../controllers/ai/expert-consultation.controller"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
// 所有路由都需要认证
router.use(auth_middleware_1.verifyToken);
/**
 * @swagger
 * /api/expert-consultation/start:
 *   post:
 *     summary: 启动专家咨询
 *     description: 创建新的专家咨询会话，允许用户就特定主题咨询多位AI专家
 *     tags: [Expert Consultation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *               - consultationType
 *             properties:
 *               topic:
 *                 type: string
 *                 description: 咨询主题
 *                 example: "如何提升幼儿园课程质量"
 *               consultationType:
 *                 type: string
 *                 enum: [education, management, health, psychology, technology]
 *                 description: 咨询类型
 *                 example: "education"
 *               description:
 *                 type: string
 *                 description: 详细描述
 *                 example: "我们幼儿园希望改进现有的课程体系，提升教学质量"
 *               expertCount:
 *                 type: integer
 *                 minimum: 2
 *                 maximum: 5
 *                 default: 3
 *                 description: 参与咨询的专家数量
 *                 example: 3
 *     responses:
 *       201:
 *         description: 专家咨询会话创建成功
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
 *                     sessionId:
 *                       type: string
 *                       description: 咨询会话ID
 *                       example: "sess_123456789"
 *                     topic:
 *                       type: string
 *                       example: "如何提升幼儿园课程质量"
 *                     status:
 *                       type: string
 *                       enum: [active, completed, paused]
 *                       example: "active"
 *                     experts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           expertise:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/start', expert_consultation_controller_1["default"].startConsultation);
/**
 * @swagger
 * /api/expert-consultation/{sessionId}/next:
 *   get:
 *     summary: 获取下一个专家发言
 *     description: 获取咨询会话中下一个专家的发言或建议
 *     tags: [Expert Consultation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: 咨询会话ID
 *         example: "sess_123456789"
 *     responses:
 *       200:
 *         description: 成功获取专家发言
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
 *                     expert:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "expert_001"
 *                         name:
 *                           type: string
 *                           example: "李教授"
 *                         expertise:
 *                           type: string
 *                           example: "幼儿教育专家"
 *                         avatar:
 *                           type: string
 *                           example: "/avatars/expert_001.png"
 *                     speech:
 *                       type: object
 *                       properties:
 *                         content:
 *                           type: string
 *                           example: "根据我多年的教学经验..."
 *                         suggestions:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["建议1", "建议2", "建议3"]
 *                         references:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["参考资料1", "参考资料2"]
 *                     round:
 *                       type: integer
 *                       description: 当前轮次
 *                       example: 2
 *                     isComplete:
 *                       type: boolean
 *                       description: 咨询是否完成
 *                       example: false
 *       404:
 *         description: 咨询会话不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:sessionId/next', expert_consultation_controller_1["default"].getNextExpertSpeech);
/**
 * @swagger
 * /api/expert-consultation/{sessionId}/stream-speech:
 *   get:
 *     summary: 流式获取专家发言
 *     description: 使用SSE流式获取专家发言，支持实时打字效果
 *     tags: [Expert Consultation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: 咨询会话ID
 *       - in: query
 *         name: expertIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: 专家索引
 *     responses:
 *       200:
 *         description: SSE流式数据
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 */
router.get('/:sessionId/stream-speech', auth_middleware_1.verifyToken, expert_consultation_controller_1["default"].getExpertSpeechStream);
/**
 * @swagger
 * /api/expert-consultation/{sessionId}/progress:
 *   get:
 *     summary: 获取咨询进度
 *     description: 获取专家咨询会话的详细进度信息
 *     tags: [Expert Consultation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: 咨询会话ID
 *         example: "sess_123456789"
 *     responses:
 *       200:
 *         description: 成功获取咨询进度
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
 *                     sessionId:
 *                       type: string
 *                       example: "sess_123456789"
 *                     totalRounds:
 *                       type: integer
 *                       description: 总轮次
 *                       example: 5
 *                     currentRound:
 *                       type: integer
 *                       description: 当前轮次
 *                       example: 3
 *                     completedExperts:
 *                       type: integer
 *                       description: 已发言专家数量
 *                       example: 2
 *                     totalExperts:
 *                       type: integer
 *                       description: 专家总数
 *                       example: 3
 *                     progress:
 *                       type: number
 *                       description: 进度百分比
 *                       example: 60.5
 *                     status:
 *                       type: string
 *                       enum: [active, completed, paused]
 *                       example: "active"
 *                     estimatedTimeRemaining:
 *                       type: integer
 *                       description: 预计剩余时间(分钟)
 *                       example: 15
 *       404:
 *         description: 咨询会话不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:sessionId/progress', expert_consultation_controller_1["default"].getConsultationProgress);
/**
 * @swagger
 * /api/expert-consultation/{sessionId}/summary:
 *   get:
 *     summary: 获取咨询汇总
 *     description: 获取专家咨询会话的完整汇总报告
 *     tags: [Expert Consultation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: 咨询会话ID
 *         example: "sess_123456789"
 *     responses:
 *       200:
 *         description: 成功获取咨询汇总
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
 *                     sessionId:
 *                       type: string
 *                       example: "sess_123456789"
 *                     topic:
 *                       type: string
 *                       example: "如何提升幼儿园课程质量"
 *                     summary:
 *                       type: object
 *                       properties:
 *                         overview:
 *                           type: string
 *                           description: 总体概述
 *                           example: "专家们一致认为..."
 *                         keyPoints:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: 关键要点
 *                           example: ["要点1", "要点2", "要点3"]
 *                         recommendations:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               expert:
 *                                 type: string
 *                               recommendation:
 *                                 type: string
 *                               priority:
 *                                 type: string
 *                                 enum: [high, medium, low]
 *                         consensus:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: 专家共识
 *                         differences:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: 分歧观点
 *                     participants:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           expertId:
 *                             type: string
 *                           name:
 *                             type: string
 *                           expertise:
 *                             type: string
 *                           contributionCount:
 *                             type: integer
 *                     duration:
 *                       type: integer
 *                       description: 咨询时长(分钟)
 *                       example: 45
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: 咨询会话不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:sessionId/summary', expert_consultation_controller_1["default"].getConsultationSummary);
/**
 * @swagger
 * /api/expert-consultation/{sessionId}/action-plan:
 *   post:
 *     summary: 生成行动计划
 *     description: 基于专家咨询结果生成具体的行动计划
 *     tags: [Expert Consultation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: 咨询会话ID
 *         example: "sess_123456789"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *                 description: 优先级过滤
 *                 example: "high"
 *               timeframe:
 *                 type: string
 *                 enum: [immediate, short_term, long_term]
 *                 description: 时间框架
 *                 example: "short_term"
 *               focus:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 关注重点
 *                 example: ["教学质量", "师资培训"]
 *     responses:
 *       200:
 *         description: 成功生成行动计划
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
 *                     planId:
 *                       type: string
 *                       example: "plan_123456789"
 *                     sessionId:
 *                       type: string
 *                       example: "sess_123456789"
 *                     actionPlan:
 *                       type: object
 *                       properties:
 *                         overview:
 *                           type: string
 *                           description: 计划概述
 *                         phases:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               phase:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                               duration:
 *                                 type: string
 *                               actions:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     task:
 *                                       type: string
 *                                     responsible:
 *                                       type: string
 *                                     deadline:
 *                                       type: string
 *                                     resources:
 *                                       type: array
 *                                       items:
 *                                         type: string
 *                                     priority:
 *                                       type: string
 *                                       enum: [high, medium, low]
 *                         milestones:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               milestone:
 *                                 type: string
 *                               deadline:
 *                                 type: string
 *                               criteria:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                         metrics:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               metric:
 *                                 type: string
 *                               target:
 *                                 type: string
 *                               measurement:
 *                                 type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: 咨询会话不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:sessionId/action-plan', expert_consultation_controller_1["default"].generateActionPlan);
/**
 * @swagger
 * /api/expert-consultation/{sessionId}:
 *   get:
 *     summary: 获取咨询会话详情
 *     description: 获取指定专家咨询会话的完整详细信息
 *     tags: [Expert Consultation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: 咨询会话ID
 *         example: "sess_123456789"
 *     responses:
 *       200:
 *         description: 成功获取咨询会话详情
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
 *                     sessionId:
 *                       type: string
 *                       example: "sess_123456789"
 *                     topic:
 *                       type: string
 *                       example: "如何提升幼儿园课程质量"
 *                     description:
 *                       type: string
 *                       example: "我们幼儿园希望改进现有的课程体系"
 *                     consultationType:
 *                       type: string
 *                       example: "education"
 *                     status:
 *                       type: string
 *                       enum: [active, completed, paused]
 *                       example: "active"
 *                     experts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           expertise:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                           bio:
 *                             type: string
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           expertId:
 *                             type: string
 *                           content:
 *                             type: string
 *                           round:
 *                             type: integer
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                     progress:
 *                       type: object
 *                       properties:
 *                         currentRound:
 *                           type: integer
 *                         totalRounds:
 *                           type: integer
 *                         completedExperts:
 *                           type: integer
 *                         totalExperts:
 *                           type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: 咨询会话不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:sessionId', expert_consultation_controller_1["default"].getConsultationSession);
/**
 * @swagger
 * /api/expert-consultation/user/history:
 *   get:
 *     summary: 获取用户咨询历史
 *     description: 获取当前用户的所有专家咨询历史记录
 *     tags: [Expert Consultation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *         example: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, paused]
 *         description: 状态过滤
 *         example: "completed"
 *       - in: query
 *         name: consultationType
 *         schema:
 *           type: string
 *           enum: [education, management, health, psychology, technology]
 *         description: 咨询类型过滤
 *         example: "education"
 *     responses:
 *       200:
 *         description: 成功获取咨询历史
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
 *                     consultations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           sessionId:
 *                             type: string
 *                             example: "sess_123456789"
 *                           topic:
 *                             type: string
 *                             example: "如何提升幼儿园课程质量"
 *                           consultationType:
 *                             type: string
 *                             example: "education"
 *                           status:
 *                             type: string
 *                             enum: [active, completed, paused]
 *                             example: "completed"
 *                           expertCount:
 *                             type: integer
 *                             example: 3
 *                           duration:
 *                             type: integer
 *                             description: 咨询时长(分钟)
 *                             example: 45
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           completedAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 25
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         hasNext:
 *                           type: boolean
 *                           example: true
 *                         hasPrev:
 *                           type: boolean
 *                           example: false
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/user/history', expert_consultation_controller_1["default"].getUserConsultations);
/**
 * @swagger
 * /api/expert-consultation/experts/types:
 *   get:
 *     summary: 获取专家类型列表
 *     description: 获取系统中可用的所有专家类型和专长领域
 *     tags: [Expert Consultation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取专家类型列表
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
 *                     expertTypes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "education"
 *                           name:
 *                             type: string
 *                             example: "教育专家"
 *                           description:
 *                             type: string
 *                             example: "专注于幼儿教育理论与实践"
 *                           specialties:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["课程设计", "教学方法", "学习评估"]
 *                           availableExperts:
 *                             type: integer
 *                             description: 可用专家数量
 *                             example: 5
 *                     consultationTypes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "education"
 *                           label:
 *                             type: string
 *                             example: "教育咨询"
 *                           description:
 *                             type: string
 *                             example: "幼儿教育相关问题咨询"
 *                           icon:
 *                             type: string
 *                             example: "education-icon"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/experts/types', expert_consultation_controller_1["default"].getExpertTypes);
exports["default"] = router;
