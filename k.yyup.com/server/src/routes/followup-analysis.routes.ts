/**
* @swagger
 * components:
 *   schemas:
 *     Followup-analysi:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Followup-analysi ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Followup-analysi 名称
 *           example: "示例Followup-analysi"
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
 *     CreateFollowup-analysiRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Followup-analysi 名称
 *           example: "新Followup-analysi"
 *     UpdateFollowup-analysiRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Followup-analysi 名称
 *           example: "更新后的Followup-analysi"
 *     Followup-analysiListResponse:
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
 *                 $ref: '#/components/schemas/Followup-analysi'
 *         message:
 *           type: string
 *           example: "获取followup-analysi列表成功"
 *     Followup-analysiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Followup-analysi'
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
 * followup-analysi管理路由文件
 * 提供followup-analysi的基础CRUD操作
*
 * 功能包括：
 * - 获取followup-analysi列表
 * - 创建新followup-analysi
 * - 获取followup-analysi详情
 * - 更新followup-analysi信息
 * - 删除followup-analysi
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 跟进质量分析路由
*/

import express from 'express';
import * as followupAnalysisController from '../controllers/followup-analysis.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = express.Router();

// 所有路由都需要认证
router.use(verifyToken);

/**
* @summary 获取跟进质量统计
* @description 获取招生跟进工作的质量统计和分析数据，包括跟进完成率、转化率、跟进频率分布、跟进效果评估等多维度指标。支持按时间范围、跟进人员、客户类型等条件筛选。
* @tags FollowupAnalysis - 跟进质量分析
* @access Private
* @security [{"bearerAuth": []}]
* @param {string} [query.timeRange=month] query optional 统计时间范围 - today:今日, week:本周, month:本月, quarter:本季度, year:今年, custom:自定义
* @param {string} [query.startDate] query optional 自定义开始日期（YYYY-MM-DD格式，当timeRange为custom时必需）
* @param {string} [query.endDate] query optional 自定义结束日期（YYYY-MM-DD格式，当timeRange为custom时必需）
* @param {string} [query.followupType] query optional 跟进类型筛选 - phone:电话, wechat:微信, email:邮件, visit:上门, all:全部
* @param {string} [query.customerType] query optional 客户类型筛选 - new:新客户, returning:回访客户, vip:VIP客户, all:全部
* @param {string} [query.followupUserId] query optional 跟进人员ID筛选
* @param {string} [query.departmentId] query optional 部门ID筛选
* @param {boolean} [query.includeTrends=true] query optional 是否包含趋势分析
* @param {boolean} [query.includeComparison=true] query optional 是否包含对比分析
* @param {string} [query.compareWith] query optional 对比周期 - previous:上一周期, lastYear:去年同期
* @responses {200} {object} Success_跟进质量统计数据
* @responses {400} {object} Error_请求参数错误
* @responses {401} {object} Error_未授权访问
* @responses {403} {object} Error_权限不足
* @responses {500} {object} Error_服务器内部错误
*/
router.get('/analysis', followupAnalysisController.getFollowupAnalysis);

/**
* @summary AI深度分析跟进质量
* @description 使用AI技术对跟进工作进行深度分析，识别跟进模式、评估跟进质量、预测转化概率、提供优化建议。支持个性化分析和智能推荐，帮助提升跟进效率和转化率。
* @tags FollowupAnalysis - 跟进质量分析
* @access Private
* @security [{"bearerAuth": []}]
* @param {object} requestBody.body.required AI分析请求参数
* @param {string} [requestBody.body.analysisType=comprehensive] optional 分析类型 - comprehensive:综合分析, quality:质量评估, prediction:转化预测, optimization:优化建议
* @param {string} [requestBody.body.targetUserId] query optional 目标用户ID（分析特定用户的跟进质量）
* @param {string} [requestBody.body.timeRange=month] optional 分析时间范围
* @param {Array<string>} [requestBody.body.metrics] optional 分析指标列表 - completionRate:完成率, responseRate:响应率, conversionRate:转化率, satisfaction:满意度
* @param {object} [requestBody.body.filters] optional 筛选条件
* @param {string} [requestBody.body.filters.followupType] optional 跟进类型筛选
* @param {string} [requestBody.body.filters.customerSource] optional 客户来源筛选
* @param {integer} [requestBody.body.filters.minFollowupCount] optional 最少跟进次数
* @param {boolean} [requestBody.body.includeRecommendations=true] optional 是否包含改进建议
* @param {boolean} [requestBody.body.includePrediction=true] optional 是否包含预测分析
* @param {string} [requestBody.body.reportLanguage=zh-CN] optional 报告语言 - zh-CN:中文, en-US:英文
* @responses {200} {object} Success_AI分析结果
* @responses {400} {object} Error_请求参数错误或分析条件无效
* @responses {401} {object} Error_未授权访问
* @responses {403} {object} Error_权限不足或AI服务权限不足
* @responses {429} {object} Error_AI服务调用频率过高
* @responses {500} {object} Error_服务器内部错误或AI服务异常
*/
router.post('/ai-analysis', followupAnalysisController.analyzeFollowupQuality);

/**
* @summary 生成PDF报告
* @description 根据跟进质量分析结果生成专业的PDF报告，包含数据图表、分析结论、改进建议等。支持自定义报告模板、添加公司品牌元素、选择报告内容和格式。
* @tags FollowupAnalysis - 跟进质量分析
* @access Private
* @security [{"bearerAuth": []}]
* @param {object} requestBody.body.required PDF报告生成参数
* @param {string} [requestBody.body.reportTitle=跟进质量分析报告] optional 报告标题
* @param {string} [requestBody.body.timeRange=month] optional 报告数据时间范围
* @param {string} [requestBody.body.template=standard] optional 报告模板 - standard:标准模板, detailed:详细模板, summary:摘要模板, custom:自定义模板
* @param {Array<string>} [requestBody.body.sections] optional 报告章节列表 - overview:概览, analysis:分析, trends:趋势, suggestions:建议, appendix:附录
* @param {object} [requestBody.body.chartSettings] optional 图表设置
* @param {string} [requestBody.body.chartSettings.chartType=combined] optional 图表类型 - bar:柱状图, line:折线图, pie:饼图, combined:组合图
* @param {string} [requestBody.body.chartSettings.colorScheme=blue] optional 配色方案 - blue:蓝色系, green:绿色系, orange:橙色系, custom:自定义
* @param {boolean} [requestBody.body.includeCharts=true] optional 是否包含数据图表
* @param {boolean} [requestBody.body.includeRawData=false] optional 是否包含原始数据
* @param {object} [requestBody.body.branding] optional 品牌设置
* @param {string} [requestBody.body.branding.companyName] optional 公司名称
* @param {string} [requestBody.body.branding.logo] optional 公司Logo URL
* @param {string} [requestBody.body.branding.contactInfo] optional 联系信息
* @param {object} [requestBody.body.watermark] optional 水印设置
* @param {string} [requestBody.body.watermark.text] optional 水印文字
* @param {string} [requestBody.body.watermark.position=bottom-right] optional 水印位置
* @param {string} [requestBody.body.language=zh-CN] optional 报告语言
* @param {string} [requestBody.body.fileName=followup-analysis-report] optional PDF文件名
* @responses {200} {object} Success_PDF报告生成成功
* @responses {400} {object} Error_请求参数错误或报告配置无效
* @responses {401} {object} Error_未授权访问
* @responses {403} {object} Error_权限不足或报告生成权限不足
* @responses {500} {object} Error_服务器内部错误或PDF生成失败
*/
router.post('/generate-pdf', followupAnalysisController.generatePDFReport);

export default router;

