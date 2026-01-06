/**
* @swagger
 * components:
 *   schemas:
 *     Ai-scoring:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Ai-scoring ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Ai-scoring 名称
 *           example: "示例Ai-scoring"
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
 *     CreateAi-scoringRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Ai-scoring 名称
 *           example: "新Ai-scoring"
 *     UpdateAi-scoringRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Ai-scoring 名称
 *           example: "更新后的Ai-scoring"
 *     Ai-scoringListResponse:
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
 *                 $ref: '#/components/schemas/Ai-scoring'
 *         message:
 *           type: string
 *           example: "获取ai-scoring列表成功"
 *     Ai-scoringResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Ai-scoring'
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
 * ai-scoring管理路由文件
 * 提供ai-scoring的基础CRUD操作
*
 * 功能包括：
 * - 获取ai-scoring列表
 * - 创建新ai-scoring
 * - 获取ai-scoring详情
 * - 更新ai-scoring信息
 * - 删除ai-scoring
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { aiScoringController } from '../controllers/ai-scoring.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @summary 检查AI评分服务可用性
* @description 检查当前用户是否可以开始AI文档评分，实现每周一次的使用频率限制。
 * 系统会根据用户的上次评分时间计算是否满足使用条件，确保服务资源合理分配。
*
 * 限制规则：
 * - 每个幼儿园每周只能使用一次AI评分服务
 * - 从上次评分时间开始计算，满7天后才能再次使用
 * - 支持精确到天的剩余时间计算
*
* @tags AI评分系统
* @security [{"bearerAuth": []}]
* @responses {200} {object} 成功响应
* @responses {200} {object} description:检查成功，返回可用性状态
* @responses {200} {object} schema: {
 *   "canStart": true,
 *   "lastScoringTime": "2024-01-01T12:00:00.000Z",
 *   "nextAvailableTime": null,
 *   "remainingDays": 0
 * }
*
* @responses {200} {object} 不可用响应
* @responses {200} {object} description:检查成功，返回不可用状态和剩余等待时间
* @responses {200} {object} schema: {
 *   "canStart": false,
 *   "lastScoringTime": "2024-01-01T12:00:00.000Z",
 *   "nextAvailableTime": "2024-01-08T12:00:00.000Z",
 *   "remainingDays": 3
 * }
*
* @responses {401} {object} 认证错误
* @responses {401} {object} description:未授权访问
* @responses {401} {object} schema: {"success": false, "error": "未授权，请先登录"}
*
* @responses {500} {object} 服务器错误
* @responses {500} {object} description:检查失败
* @responses {500} {object} schema: {"message": "检查评分权限失败", "error": "错误详情"}
*
* @example {json} 可用状态响应示例
 * {
 *   "canStart": true,
 *   "lastScoringTime": null,
 *   "nextAvailableTime": null,
 *   "remainingDays": 0
 * }
*
* @example {json} 不可用状态响应示例
 * {
 *   "canStart": false,
 *   "lastScoringTime": "2024-01-01T12:00:00.000Z",
 *   "nextAvailableTime": "2024-01-08T12:00:00.000Z",
 *   "remainingDays": 3
 * }
*/
router.get('/check-availability', aiScoringController.checkAvailability.bind(aiScoringController));

/**
* @summary AI文档智能评分分析
* @description 使用AI模型对文档进行智能评分分析，支持多种文档类型的评估。
 * 系统会根据文档类型选择相应的评分标准，从多个维度进行综合分析，
 * 包括内容质量、结构完整性、教育适用性等方面。
*
 * 评分维度包括：
 * - 内容质量：准确性、完整性、专业性
 * - 结构设计：逻辑性、层次性、可读性
 * - 教育价值：适用性、实用性、创新性
 * - 风险评估：内容安全、适宜性、潜在问题
*
* @tags AI评分系统
* @security [{"bearerAuth": []}]
* @param {object} requestBody.body.required 请求体
* @param {string} requestBody.body.documentInstanceId.required 文档实例ID，用于标识具体文档
* @param {string} requestBody.body.content.required 文档内容，需要分析的文本内容
* @param {string} requestBody.body.documentTemplateId.optional 文档模板ID，用于确定评分标准
* @param {string} requestBody.body.templateType.optional 模板类型，如"教案"、"活动方案"、"观察记录"等
* @param {string} requestBody.body.templateName.optional 模板名称，用于记录和分析
*
* @responses {200} {object} 成功响应
* @responses {200} {object} description:文档分析完成
* @responses {200} {object} schema: {
 *   "success": true,
 *   "data": {
 *     "score": 85,
 *     "grade": "优秀",
 *     "categoryScores": {
 *       "content": 90,
 *       "structure": 85,
 *       "educational": 88,
 *       "safety": 82
 *     },
 *     "highlights": [
 *       "内容设计富有创意",
 *       "活动流程清晰完整"
 *     ],
 *     "suggestions": [
 *       "可增加更多互动环节",
 *       "建议完善安全注意事项"
 *     ],
 *     "risks": [
 *       "部分材料需要安全提醒"
 *     ],
 *     "analysisDetail": "详细分析内容...",
 *     "processingTime": 2500
 *   }
 * }
*
* @responses {400} {object} 参数错误
* @responses {400} {object} description:请求参数错误
* @responses {400} {object} schema: {"message": "缺少必要参数"}
*
* @responses {401} {object} 认证错误
* @responses {401} {object} description:未授权访问
* @responses {401} {object} schema: {"success": false, "error": "未授权，请先登录"}
*
* @responses {500} {object} 服务器错误
* @responses {500} {object} description:AI分析失败
* @responses {500} {object} schema: {"message": "AI分析失败", "error": "错误详情"}
*
* @example {json} 请求示例
 * {
 *   "documentInstanceId": "doc_123456",
 *   "content": "活动名称：春天来了\n活动目标：让幼儿认识春天的基本特征\n活动准备：鲜花图片、春天音乐...",
 *   "documentTemplateId": "template_789",
 *   "templateType": "activity_plan",
 *   "templateName": "幼儿园活动方案"
 * }
*/
router.post('/analyze', aiScoringController.analyzeDocument.bind(aiScoringController));

/**
* @summary 记录AI评分使用时间
* @description 记录用户使用AI评分服务的时间戳，用于实现每周一次的使用频率限制。
 * 当用户成功完成一次AI评分后，系统会自动调用此接口记录本次使用时间，
 * 作为下次可用时间计算的基准点。
*
 * 记录规则：
 * - 记录精确到毫秒的时间戳
 * - 按幼儿园维度进行限制管理
 * - 支持Redis持久化存储
 * - 自动计算7天后的下次可用时间
*
* @tags AI评分系统
* @security [{"bearerAuth": []}]
* @responses {200} {object} 成功响应
* @responses {200} {object} description:记录成功
* @responses {200} {object} schema: {
 *   "success": true,
 *   "message": "评分时间记录成功",
 *   "recordedTime": "2024-01-01T12:00:00.000Z",
 *   "nextAvailableTime": "2024-01-08T12:00:00.000Z"
 * }
*
* @responses {401} {object} 认证错误
* @responses {401} {object} description:未授权访问
* @responses {401} {object} schema: {"success": false, "error": "未授权，请先登录"}
*
* @responses {500} {object} 服务器错误
* @responses {500} {object} description:记录失败
* @responses {500} {object} schema: {"message": "记录评分时间失败", "error": "错误详情"}
*/
router.post('/record-time', aiScoringController.recordScoringTime.bind(aiScoringController));

/**
* @summary 获取AI评分历史记录
* @description 获取当前用户的AI评分历史记录，支持分页查询和时间范围筛选。
 * 用户可以查看历史评分结果、分析报告、改进建议等信息，
 * 用于追踪文档质量改进情况和评分使用统计。
*
 * 支持的筛选条件：
 * - 时间范围：按开始和结束日期筛选记录
 * - 分页查询：支持页码和每页数量设置
 * - 排序方式：按评分时间倒序排列
 * - 状态筛选：按评分完成状态筛选
*
* @tags AI评分系统
* @security [{"bearerAuth": []}]
* @param {integer} query.page.optional 页码，从1开始，默认1
* @param {integer} query.pageSize.optional 每页记录数，默认10，最大100
* @param {string} query.startDate.optional 开始日期，格式YYYY-MM-DD
* @param {string} query.endDate.optional 结束日期，格式YYYY-MM-DD
* @param {string} query.status.optional 评分状态筛选：completed/failed/pending
* @param {string} query.templateType.optional 模板类型筛选
*
* @responses {200} {object} 成功响应
* @responses {200} {object} description:获取历史记录成功
* @responses {200} {object} schema: {
 *   "success": true,
 *   "data": {
 *     "records": [
 *       {
 *         "id": 1,
 *         "documentInstanceId": "doc_123",
 *         "templateName": "幼儿园活动方案",
 *         "templateType": "activity_plan",
 *         "score": 85,
 *         "grade": "优秀",
 *         "status": "completed",
 *         "analysisResult": {
 *           "categoryScores": {
 *             "content": 90,
 *             "structure": 85
 *           },
 *           "suggestions": ["建议完善安全注意事项"]
 *         },
 *         "processingTime": 2500,
 *         "createdBy": "user_456",
 *         "createdAt": "2024-01-01T12:00:00.000Z",
 *         "updatedAt": "2024-01-01T12:00:00.000Z"
 *       }
 *     ],
 *     "pagination": {
 *       "current": 1,
 *       "pageSize": 10,
 *       "total": 25,
 *       "totalPages": 3
 *     },
 *     "statistics": {
 *       "totalScores": 25,
 *       "averageScore": 82.5,
 *       "highestScore": 95,
 *       "lowestScore": 68,
 *       "completedCount": 23,
 *       "failedCount": 2
 *     }
 *   }
 * }
*
* @responses {401} {object} 认证错误
* @responses {401} {object} description:未授权访问
* @responses {401} {object} schema: {"success": false, "error": "未授权，请先登录"}
*
* @responses {500} {object} 服务器错误
* @responses {500} {object} description:获取历史记录失败
* @responses {500} {object} schema: {"message": "获取历史记录失败", "error": "错误详情"}
*
* @example {string} 请求示例
 * GET /api/ai-scoring/history?page=1&pageSize=10&startDate=2024-01-01&endDate=2024-01-31&status=completed
*/
router.get('/history', aiScoringController.getHistory.bind(aiScoringController));

export default router;

