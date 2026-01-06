/**
* @swagger
 * tags:
 *   - name: 评估功能
 *     description: 幼儿发展评估系统，支持免费测评、题目管理、成绩分析和成长轨迹追踪
*
 * components:
 *   schemas:
 *     AssessmentQuestion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 题目ID
 *           example: 1
 *         content:
 *           type: string
 *           description: 题目内容
 *           example: "孩子能够独立完成穿衣动作吗？"
 *         type:
 *           type: string
 *           enum: [choice, scale, text, multiple]
 *           description: 题目类型
 *           example: "choice"
 *         category:
 *           type: string
 *           enum: [cognitive, physical, social, emotional, language]
 *           description: 题目类别
 *           example: "physical"
 *         options:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               text:
 *                 type: string
 *                 example: "完全可以"
 *               value:
 *                 type: integer
 *                 example: 4
 *           description: 选项列表
 *           example:
 *             - id: 1
 *               text: "完全可以"
 *               value: 4
 *             - id: 2
 *               text: "基本可以"
 *               value: 3
 *             - id: 3
 *               text: "需要帮助"
 *               value: 2
 *             - id: 4
 *               text: "完全不能"
 *               value: 1
 *         ageRange:
 *           type: object
 *           properties:
 *             min:
 *               type: integer
 *               example: 3
 *             max:
 *               type: integer
 *               example: 6
 *           description: 适合年龄范围
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           description: 难度等级
 *           example: "medium"
 *         explanation:
 *           type: string
 *           description: 题目解释说明
 *           example: "此题评估孩子的自理能力发展水平"
*
 *     AssessmentRecord:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 测评记录ID
 *           example: 1001
 *         recordId:
 *           type: string
 *           format: uuid
 *           description: 唯一记录标识符
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         childName:
 *           type: string
 *           description: 孩子姓名
 *           example: "小明"
 *         childAge:
 *           type: integer
 *           description: 孩子年龄
 *           example: 4
 *         childGender:
 *           type: string
 *           enum: [male, female]
 *           description: 孩子性别
 *           example: "male"
 *         parentName:
 *           type: string
 *           description: 家长姓名
 *           example: "王先生"
 *         parentContact:
 *           type: string
 *           description: 联系方式
 *           example: "138****5678"
 *         status:
 *           type: string
 *           enum: [in_progress, completed, expired]
 *           description: 测评状态
 *           example: "completed"
 *         startedAt:
 *           type: string
 *           format: date-time
 *           description: 开始时间
 *           example: "2023-12-01T10:00:00Z"
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: 完成时间
 *           example: "2023-12-01T10:25:00Z"
 *         totalQuestions:
 *           type: integer
 *           description: 总题目数
 *           example: 25
 *         answeredQuestions:
 *           type: integer
 *           description: 已回答题目数
 *           example: 25
 *         overallScore:
 *           type: number
 *           format: float
 *           description: 总体得分
 *           example: 85.5
 *         developmentAreas:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               area:
 *                 type: string
 *                 enum: [cognitive, physical, social, emotional, language]
 *                 example: "cognitive"
 *               score:
 *                 type: number
 *                 format: float
 *                 example: 88.0
 *               level:
 *                 type: string
 *                 enum: [excellent, good, average, needs_improvement]
 *                 example: "good"
 *           description: 各发展领域评分
 *         hasReport:
 *           type: boolean
 *           description: 是否已生成报告
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2023-12-01T10:00:00Z"
*
 *     AssessmentAnswer:
 *       type: object
 *       properties:
 *         recordId:
 *           type: string
 *           format: uuid
 *           description: 测评记录ID
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         questionId:
 *           type: integer
 *           description: 题目ID
 *           example: 1
 *         answer:
 *           type: object
 *           description: 答案内容，根据题目类型不同而不同
 *           example:
 *             selectedOption: 2
 *             selectedText: "基本可以"
 *         timeSpent:
 *           type: integer
 *           description: 答题用时（秒）
 *           example: 15
 *         answeredAt:
 *           type: string
 *           format: date-time
 *           description: 答题时间
 *           example: "2023-12-01T10:02:30Z"
*
 *     AssessmentReport:
 *       type: object
 *       properties:
 *         recordId:
 *           type: string
 *           format: uuid
 *           description: 测评记录ID
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         childInfo:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "小明"
 *             age:
 *               type: integer
 *               example: 4
 *             gender:
 *               type: string
 *               example: "male"
 *           description: 孩子基本信息
 *         overallScore:
 *           type: number
 *           format: float
 *           description: 总体得分
 *           example: 85.5
 *         developmentalLevel:
 *           type: string
 *           enum: [advanced, on_track, developing, needs_support]
 *           description: 综合发展水平
 *           example: "on_track"
 *         areaScores:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               area:
 *                 type: string
 *                 example: "cognitive"
 *                 description: 发展领域
 *               score:
 *                 type: number
 *                 format: float
 *                 example: 88.0
 *               level:
 *                 type: string
 *                 example: "good"
 *               description: 评级水平
 *               percentile:
 *                 type: number
 *                 format: float
 *                 example: 75.5
 *                 description: 百分位排名
 *               strengths:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["逻辑思维", "问题解决"]
 *               recommendations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["多进行益智游戏", "鼓励独立思考"]
 *           description: 各领域详细评分
 *         summary:
 *           type: object
 *           properties:
 *             keyStrengths:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["语言表达能力", "社交互动"]
 *             areasForImprovement:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["精细动作协调", "情绪管理"]
 *             overallAssessment:
 *               type: string
 *               example: "孩子整体发展良好，在语言和社交方面表现突出"
 *         suggestions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 example: "家庭活动"
 *               title:
 *                 type: string
 *                 example: "亲子阅读时光"
 *               description:
 *                 type: string
 *                 example: "每天安排15-20分钟的亲子阅读时间"
 *               frequency:
 *                 type: string
 *                 example: "每日"
 *               materials:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["绘本图书", "安静的环境"]
 *           description: 个性化发展建议
 *         generatedAt:
 *           type: string
 *           format: date-time
 *           description: 报告生成时间
 *           example: "2023-12-01T10:30:00Z"
*
 *     GrowthTrajectory:
 *       type: object
 *       properties:
 *         childId:
 *           type: string
 *           description: 孩子唯一标识
 *           example: "child_12345"
 *         childName:
 *           type: string
 *           description: 孩子姓名
 *           example: "小明"
 *         assessments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               recordId:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-12-01T10:30:00Z"
 *               overallScore:
 *                 type: number
 *                 format: float
 *                 example: 85.5
 *               ageAtAssessment:
 *                 type: integer
 *                 example: 48
 *                 description: 测评时年龄（月）
 *               areaScores:
 *                 type: object
 *                 properties:
 *                   cognitive:
 *                     type: number
 *                     format: float
 *                     example: 88.0
 *                   physical:
 *                     type: number
 *                     format: float
 *                     example: 82.5
 *                   social:
 *                     type: number
 *                     format: float
 *                     example: 90.0
 *                   emotional:
 *                     type: number
 *                     format: float
 *                     example: 78.5
 *                   language:
 *                     type: number
 *                     format: float
 *                     example: 92.0
 *           description: 历次测评记录
 *         trends:
 *           type: object
 *           properties:
 *             overallTrend:
 *               type: string
 *               enum: [improving, stable, declining]
 *               example: improving
 *             areaTrends:
 *               type: object
 *               properties:
 *                 cognitive:
 *                   type: string
 *                   enum: [improving, stable, declining]
 *                   example: "improving"
 *                 physical:
 *                   type: string
 *                   enum: [improving, stable, declining]
 *                   example: "stable"
 *               social:
 *                   type: string
 *                   enum: [improving, stable, declining]
 *                   example: "improving"
 *               emotional:
 *                   type: string
 *                   enum: [improving, stable, declining]
 *                   example: "stable"
 *               language:
 *                   type: string
 *                   enum: [improving, stable, declining]
 *                   example: "improving"
 *             averageProgress:
 *               type: number
 *               format: float
 *               description: 平均进步分数
 *               example: 5.2
 *           description: 发展趋势分析
 *         milestones:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               area:
 *                 type: string
 *                 example: "cognitive"
 *               milestone:
 *                 type: string
 *                 example: "掌握数字概念"
 *               achievedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-11-15T14:30:00Z"
 *               assessmentRecord:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *           description: 达成的发展里程碑
*
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           description: 错误信息
 *           example: "参数验证失败"
 *         code:
 *           type: integer
 *           description: 错误代码
 *           example: 400
*
 *   responses:
 *     ValidationError:
 *       description: 请求参数验证失败
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             error: "请求参数不完整或格式错误"
 *             code: 400
*
 *     NotFoundError:
 *       description: 资源不存在
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             error: "指定的测评记录不存在"
 *             code: 404
*
 *     UnauthorizedError:
 *       description: 未授权访问
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             error: "未授权访问，请提供有效的认证信息"
 *             code: 401
*
 *     ServerError:
 *       description: 服务器内部错误
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             error: "服务器内部错误，请稍后重试"
 *             code: 500
*/

import { Router } from 'express';
import * as assessmentController from '../controllers/assessment.controller';
import { checkParentStudentAccess, checkAcademicPermission, verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要用户认证
router.use(verifyToken);

// 注意：checkAcademicPermission 不应该全局应用
// 测评功能对家长应该是开放的，不需要额外的学业权限
// 如果特定端点需要学业权限，应该在该端点上单独应用中间件

/**
* @swagger
 * /api/assessment/start:
 *   post:
 *     summary: 开始测评
 *     description: |
 *       开始新的幼儿发展评估测评，创建测评记录并返回记录ID。
*
 *       **测评特点：**
 *       - 免费开放，无需注册即可开始
 *       - 基于5大发展领域的科学评估
 *       - 适合3-6岁幼儿
 *       - 约25分钟完成
*
 *       **评估领域：**
 *       - **认知发展**: 思维、记忆、问题解决能力
 *       - **身体发展**: 大运动和精细动作
 *       - **社交发展**: 人际交往和合作能力
 *       - **情感发展**: 情绪识别和管理能力
 *       - **语言发展**: 表达和理解能力
*
 *       **业务场景：**
 *       - 家长初步了解孩子发展水平
 *       - 幼儿园招生前的能力评估
 *       - 定期发展情况跟踪
 *       - 个性化教育方案制定参考
 *     tags:
 *       - 评估功能
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               childName:
 *                 type: string
 *                 description: 孩子姓名
 *                 example: "小明"
 *               childAge:
 *                 type: integer
 *                 minimum: 3
 *                 maximum: 6
 *                 description: 孩子年龄
 *                 example: 4
 *               childGender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: 孩子性别
 *                 example: "male"
 *               parentName:
 *                 type: string
 *                 description: 家长姓名
 *                 example: "王先生"
 *               parentContact:
 *                 type: string
 *                 description: 联系方式（可选）
 *                 example: "138****5678"
 *               assessmentType:
 *                 type: string
 *                 enum: [comprehensive, quick, focused]
 *                 default: "comprehensive"
 *                 description: 测评类型
 *                 example: "comprehensive"
 *             required:
 *               - childName
 *               - childAge
 *               - childGender
 *     responses:
 *       201:
 *         description: 测评开始成功
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
 *                     recordId:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     estimatedDuration:
 *                       type: integer
 *                       description: 预计完成时间（分钟）
 *                       example: 25
 *                     totalQuestions:
 *                       type: integer
 *                       example: 25
 *                     expiryTime:
 *                       type: string
 *                       format: date-time
 *                       description: 测评过期时间
 *                       example: "2023-12-02T10:00:00Z"
 *                     instructions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example:
 *                         - "请在安静的环境中进行测评"
 *                         - "根据孩子的实际情况如实回答"
 *                         - "每道题都有时间限制，请及时作答"
 *                 message:
 *                   type: string
 *                   example: "测评已开始，请根据指引进行答题"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.post('/start', assessmentController.startAssessment);

/**
* @swagger
 * /api/assessment/questions:
 *   get:
 *     summary: 获取题目列表
 *     description: |
 *       获取测评题目列表，支持按年龄和发展领域筛选。
*
 *       **题目特点：**
 *       - 科学设计，符合幼儿发展规律
 *       - 涵盖5大发展领域
 *       - 多种题型（选择题、量表题、文本题）
 *       - 年龄适应性分级
*
 *       **题目类型：**
 *       - **选择题**: 单一最佳答案
 *       - **量表题**: 程度评分（1-4分）
 *       - **文本题**: 开放性回答
 *       - **多选题**: 多个正确选项
*
 *       **业务场景：**
 *       - 测评过程中获取题目
 *       - 了解题目内容和要求
 *       - 预习和准备测评
 *       - 题目内容审查
 *     tags:
 *       - 评估功能
 *     parameters:
 *       - in: query
 *         name: age
 *         schema:
 *           type: integer
 *           minimum: 3
 *           maximum: 6
 *         description: 按年龄筛选题目
 *         example: 4
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [cognitive, physical, social, emotional, language]
 *         description: 按发展领域筛选
 *         example: "cognitive"
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *         description: 按难度筛选
 *         example: "medium"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [choice, scale, text, multiple]
 *         description: 按题目类型筛选
 *         example: "choice"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: 返回题目数量限制
 *         example: 10
 *     responses:
 *       200:
 *         description: 题目列表获取成功
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
 *                     questions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AssessmentQuestion'
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["cognitive", "physical", "social", "emotional", "language"]
 *                 message:
 *                   type: string
 *                   example: "题目列表获取成功"
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.get('/questions', assessmentController.getQuestions);

/**
* @swagger
 * /api/assessment/answer:
 *   post:
 *     summary: 提交答案
 *     description: |
 *       提交测评答案，支持实时保存和批量提交。
*
 *       **提交特点：**
 *       - 支持单题提交和批量提交
 *       - 自动记录答题时间
 *       - 实时保存防止数据丢失
 *       - 支持答案修改
*
 *       **答案格式：**
 *       - **选择题**: 选项ID和文本
 *       - **量表题**: 分数值
 *       - **文本题**: 文本内容
 *       - **多选题**: 选项ID数组
*
 *       **业务场景：**
 *       - 测评过程中实时保存答案
 *       - 批量提交已完成题目
 *       - 修改之前提交的答案
 *       - 测评进度跟踪
 *     tags:
 *       - 评估功能
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recordId:
 *                 type: string
 *                 format: uuid
 *                 description: 测评记录ID
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               answers:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/AssessmentAnswer'
 *                 description: 答案列表
 *               isComplete:
 *                 type: boolean
 *                 default: false
 *                 description: 是否完成所有题目
 *                 example: false
 *             required:
 *               - recordId
 *               - answers
 *           examples:
 *             singleAnswer:
 *               summary: 单题答案提交
 *               value:
 *                 recordId: "550e8400-e29b-41d4-a716-446655440000"
 *                 answers:
 *                   - questionId: 1
 *                     answer:
 *                       selectedOption: 2
 *                       selectedText: "基本可以"
 *                     timeSpent: 15
 *                     answeredAt: "2023-12-01T10:02:30Z"
 *                 isComplete: false
 *             batchAnswers:
 *               summary: 批量答案提交
 *               value:
 *                 recordId: "550e8400-e29b-41d4-a716-446655440000"
 *                 answers:
 *                   - questionId: 1
 *                     answer:
 *                       selectedOption: 2
 *                       selectedText: "基本可以"
 *                     timeSpent: 15
 *                     answeredAt: "2023-12-01T10:02:30Z"
 *                   - questionId: 2
 *                     answer:
 *                       selectedOption: 3
 *                       selectedText: "需要帮助"
 *                     timeSpent: 12
 *                     answeredAt: "2023-12-01T10:03:15Z"
 *                 isComplete: false
 *     responses:
 *       200:
 *         description: 答案提交成功
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
 *                     savedAnswers:
 *                       type: integer
 *                       description: 已保存答案数量
 *                       example: 5
 *                     totalQuestions:
 *                       type: integer
 *                       description: 总题目数
 *                       example: 25
 *                     progress:
 *                       type: number
 *                       format: float
 *                       description: 完成进度百分比
 *                       example: 20.0
 *                     nextQuestionId:
 *                       type: integer
 *                       description: 下一题ID
 *                       example: 6
 *                     timeRemaining:
 *                       type: integer
 *                       description: 剩余时间（分钟）
 *                       example: 18
 *                 message:
 *                   type: string
 *                   example: "答案保存成功"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.post('/answer', assessmentController.submitAnswer);

/**
* @swagger
 * /api/assessment/{recordId}/complete:
 *   post:
 *     summary: 完成测评
 *     description: |
 *       标记测评为完成状态并生成初步评估结果。
*
 *       **完成流程：**
 *       - 验证所有题目是否已回答
 *       - 计算各领域得分
 *       - 生成综合评估等级
 *       - 触发报告生成流程
*
 *       **评分标准：**
 *       - **优秀**: 90-100分
 *       - **良好**: 75-89分
 *       - **一般**: 60-74分
 *       - **待提高**: 60分以下
*
 *       **业务场景：**
 *       - 用户完成所有题目后提交
 *       - 系统自动计算和评分
 *       - 准备生成详细报告
 *       - 结束测评会话
 *     tags:
 *       - 评估功能
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 测评记录ID
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: 测评完成成功
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
 *                     recordId:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     overallScore:
 *                       type: number
 *                       format: float
 *                       example: 85.5
 *                     developmentalLevel:
 *                       type: string
 *                       enum: [advanced, on_track, developing, needs_support]
 *                       example: "on_track"
 *                     areaScores:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           area:
 *                             type: string
 *                             example: "cognitive"
 *                           score:
 *                             type: number
 *                             format: float
 *                             example: 88.0
 *                           level:
 *                             type: string
 *                             example: "good"
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-12-01T10:25:00Z"
 *                     reportReady:
 *                       type: boolean
 *                       example: true
 *                     reportUrl:
 *                       type: string
 *                       example: "/api/assessment/report/550e8400-e29b-41d4-a716-446655440000"
 *                 message:
 *                   type: string
 *                   example: "测评完成，正在生成详细报告"
 *       400:
 *         description: 测评未完成或存在未回答题目
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "还有题目未回答，无法完成测评"
 *                 code:
 *                   type: integer
 *                   example: 400
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.post('/:recordId/complete', assessmentController.completeAssessment);

/**
* @swagger
 * /api/assessment/record/{recordId}:
 *   get:
 *     summary: 获取测评记录
 *     description: |
 *       获取指定测评记录的详细信息，包括答题情况、得分和状态。
*
 *       **记录内容：**
 *       - 孩子和家长基本信息
 *       - 测评进度和状态
 *       - 答题情况统计
 *       - 初步得分结果
 *       - 时间记录信息
*
 *       **业务场景：**
 *       - 查看测评进度
 *       - 获取测评结果摘要
 *       - 验证测评完成状态
 *       - 准备报告生成或查看
 *     tags:
 *       - 评估功能
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 测评记录ID
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: 测评记录获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AssessmentRecord'
 *                 message:
 *                   type: string
 *                   example: "测评记录获取成功"
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.get('/record/:recordId', assessmentController.getRecord);

/**
* @swagger
 * /api/assessment/report/{recordId}:
 *   get:
 *     summary: 获取测评报告
 *     description: |
 *       获取详细的测评报告，包含各领域分析、发展建议和个性化指导。
*
 *       **报告内容：**
 *       - **总体评估**: 综合得分和发展水平
 *       - **领域分析**: 5大发展领域详细评分
 *       - **优势分析**: 突出能力和发展亮点
 *       - **改进建议**: 需要关注的方面和提升建议
 *       - **活动建议**: 具体的家庭活动推荐
 *       - **趋势分析**: 与同龄儿童的对比分析
*
 *       **业务场景：**
 *       - 家长了解孩子发展情况
 *       - 制定个性化教育方案
 *       - 幼儿园招生评估参考
 *       - 定期发展情况跟踪
*
 *       **权限说明：**
 *       - 公开访问，但未注册用户会被引导注册
 *       - 注册用户可查看完整报告
 *       - 支持分享和下载功能
 *     tags:
 *       - 评估功能
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 测评记录ID
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, html, pdf]
 *           default: "json"
 *         description: 报告格式
 *         example: "json"
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [zh, en]
 *           default: "zh"
 *         description: 报告语言
 *         example: "zh"
 *     responses:
 *       200:
 *         description: 测评报告获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AssessmentReport'
 *                 message:
 *                   type: string
 *                   example: "测评报告获取成功"
 *       404:
 *         description: 测评记录不存在或报告未生成
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "测评报告尚未生成"
 *                 code:
 *                   type: integer
 *                   example: 404
 *       402:
 *         description: 需要注册才能查看完整报告
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "需要注册账号才能查看完整报告"
 *                 code:
 *                   type: integer
 *                   example: 402
 *                 data:
 *                   type: object
 *                   properties:
 *                     requiresRegistration:
 *                       type: boolean
 *                       example: true
 *                     preview:
 *                       type: object
 *                       description: 报告预览信息
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.get('/report/:recordId', assessmentController.getReport);

/**
* @swagger
 * /api/assessment/my-records:
 *   get:
 *     summary: 获取我的测评记录列表
 *     description: |
 *       获取当前用户的所有测评记录，支持分页和筛选。
*
 *       **列表内容：**
 *       - 测评基本信息
 *       - 完成状态和时间
 *       - 初步得分结果
 *       - 报告生成状态
 *       - 分享和导出选项
*
 *       **业务场景：**
 *       - 用户查看历史测评记录
 *       - 测评结果对比分析
 *       - 报告重新下载
 *       - 分享测评结果
*
 *       **权限要求：**
 *       - 需要用户登录
 *       - 只能查看自己的记录
 *       - 支持记录管理操作
 *     tags:
 *       - 评估功能
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
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: 每页记录数
 *         example: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [in_progress, completed, expired]
 *         description: 按状态筛选
 *         example: "completed"
 *       - in: query
 *         name: childAge
 *         schema:
 *           type: integer
 *           minimum: 3
 *           maximum: 6
 *         description: 按孩子年龄筛选
 *         example: 4
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 开始日期筛选
 *         example: "2023-11-01T00:00:00Z"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 结束日期筛选
 *         example: "2023-12-31T23:59:59Z"
 *     responses:
 *       200:
 *         description: 测评记录列表获取成功
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
 *                     records:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AssessmentRecord'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 15
 *                         totalPages:
 *                           type: integer
 *                           example: 2
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalAssessments:
 *                           type: integer
 *                           example: 15
 *                         completedAssessments:
 *                           type: integer
 *                           example: 12
 *                         averageScore:
 *                           type: number
 *                           format: float
 *                           example: 82.5
 *                         lastAssessmentDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-11-28T14:30:00Z"
 *                 message:
 *                   type: string
 *                   example: "测评记录列表获取成功"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.get('/my-records',  assessmentController.getMyRecords);

/**
* @swagger
 * /api/assessment/growth-trajectory:
 *   get:
 *     summary: 获取成长轨迹
 *     description: |
 *       获取孩子的成长轨迹分析，展示多次测评的发展趋势。
*
 *       **轨迹分析：**
 *       - **整体趋势**: 综合能力发展变化
 *       - **领域趋势**: 各发展领域的进步情况
 *       - **里程碑追踪**: 重要发展节点记录
 *       - **进步速度**: 与同龄人的对比
*
 *       **数据特点：**
 *       - 基于多次测评数据
 *       - 支持趋势图表展示
 *       - 包含发展里程碑
 *       - 个性化发展建议
*
 *       **业务场景：**
 *       - 长期发展情况跟踪
 *       - 教育效果评估
 *       - 个性化方案调整
 *       - 家园共育沟通
*
 *       **权限说明：**
 *       - 公开访问，可匿名查看
 *       - 登录用户查看完整数据
 *       - 支持孩子信息关联
 *     tags:
 *       - 评估功能
 *     parameters:
 *       - in: query
 *         name: childId
 *         schema:
 *           type: string
 *         description: 孩子唯一标识（登录后必填）
 *         example: "child_12345"
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [3months, 6months, 1year, all]
 *           default: "all"
 *         description: 分析时间范围
 *         example: "6months"
 *       - in: query
 *         name: areas
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           enum: [cognitive, physical, social, emotional, language]
 *         description: 分析的发展领域
 *         example: ["cognitive", "physical", "social"]
 *       - in: query
 *         name: includeDetails
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否包含详细数据
 *         example: true
 *     responses:
 *       200:
 *         description: 成长轨迹获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/GrowthTrajectory'
 *                 message:
 *                   type: string
 *                   example: "成长轨迹数据获取成功"
 *       400:
 *         description: 缺少必要参数（匿名用户需要提供childId）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: 未找到孩子的测评数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "未找到该孩子的测评数据"
 *                 code:
 *                   type: integer
 *                   example: 404
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.get('/growth-trajectory', assessmentController.getGrowthTrajectory);

export default router;

