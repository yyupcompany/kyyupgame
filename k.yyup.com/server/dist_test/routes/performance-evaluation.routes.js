"use strict";
/**
 * 绩效评估API路由
 * 处理教师和员工的绩效评估相关功能
 */
exports.__esModule = true;
var express_1 = require("express");
var apiResponse_1 = require("../utils/apiResponse");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var security_middleware_1 = require("../middlewares/security.middleware");
var express_validator_1 = require("express-validator");
var router = (0, express_1.Router)();
// 应用认证中间件
router.use(auth_middleware_1.authMiddleware);
/**
 * @swagger
 * /performance-evaluations:
 *   get:
 *     summary: 获取绩效评估列表
 *     tags: [Performance Evaluation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: integer
 *         description: 员工ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: 评估期间
 *     responses:
 *       200:
 *         description: 成功返回绩效评估列表
 */
router.get('/', (0, security_middleware_1.validateInput)([
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('employeeId').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('period').optional().isString()
]), function (req, res) {
    var _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c, employeeId = _a.employeeId, period = _a.period;
    // 模拟数据
    var evaluations = [
        {
            id: 1,
            employeeId: 1,
            employeeName: '张教师',
            position: '主班老师',
            period: '2025-Q1',
            score: 92,
            level: '优秀',
            evaluatorId: 1,
            evaluatorName: '王园长',
            evaluationDate: '2025-01-15',
            comments: '工作认真负责，与家长沟通良好',
            goals: ['提高课堂互动性', '加强家园沟通'],
            achievements: ['获得家长满意度95%', '班级无安全事故'],
            createdAt: '2025-01-15T10:00:00Z',
            updatedAt: '2025-01-15T10:00:00Z'
        },
        {
            id: 2,
            employeeId: 2,
            employeeName: '李教师',
            position: '副班老师',
            period: '2025-Q1',
            score: 88,
            level: '良好',
            evaluatorId: 1,
            evaluatorName: '王园长',
            evaluationDate: '2025-01-15',
            comments: '有上进心，需要加强专业技能',
            goals: ['提升教学技能', '增强团队协作'],
            achievements: ['完成专业培训', '协助主班老师完成教学任务'],
            createdAt: '2025-01-15T10:00:00Z',
            updatedAt: '2025-01-15T10:00:00Z'
        }
    ];
    var total = evaluations.length;
    var totalPages = Math.ceil(total / Number(limit));
    apiResponse_1.ApiResponse.success(res, {
        evaluations: evaluations,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total: total,
            totalPages: totalPages
        }
    }, '绩效评估列表获取成功');
});
/**
 * @swagger
 * /performance-evaluations/{id}:
 *   get:
 *     summary: 获取特定绩效评估详情
 *     tags: [Performance Evaluation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 评估ID
 *     responses:
 *       200:
 *         description: 成功返回绩效评估详情
 *       404:
 *         description: 评估不存在
 */
router.get('/:id', function (req, res) {
    var id = parseInt(req.params.id);
    if (isNaN(id)) {
        return apiResponse_1.ApiResponse.error(res, 'INVALID_ID', 'ID必须是数字', 400);
    }
    // 模拟数据
    var evaluation = {
        id: id,
        employeeId: 1,
        employeeName: '张教师',
        position: '主班老师',
        period: '2025-Q1',
        score: 92,
        level: '优秀',
        evaluatorId: 1,
        evaluatorName: '王园长',
        evaluationDate: '2025-01-15',
        comments: '工作认真负责，与家长沟通良好',
        goals: ['提高课堂互动性', '加强家园沟通'],
        achievements: ['获得家长满意度95%', '班级无安全事故'],
        strengths: ['教学能力强', '责任心强', '团队协作好'],
        improvements: ['可以更多创新教学方法', '继续提升专业技能'],
        nextGoals: ['参加高级培训', '指导新教师'],
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z'
    };
    apiResponse_1.ApiResponse.success(res, evaluation, '绩效评估详情获取成功');
});
/**
 * @swagger
 * /performance-evaluations:
 *   post:
 *     summary: 创建绩效评估
 *     tags: [Performance Evaluation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeId:
 *                 type: integer
 *               period:
 *                 type: string
 *               score:
 *                 type: number
 *               comments:
 *                 type: string
 *               goals:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: 绩效评估创建成功
 *       400:
 *         description: 请求参数错误
 */
router.post('/', (0, security_middleware_1.validateInput)([
    (0, express_validator_1.body)('employeeId').isInt({ min: 1 }).withMessage('员工ID必须是正整数'),
    (0, express_validator_1.body)('period').isString().notEmpty().withMessage('评估期间不能为空'),
    (0, express_validator_1.body)('score').isFloat({ min: 0, max: 100 }).withMessage('分数必须在0-100之间'),
    (0, express_validator_1.body)('comments').optional().isString(),
    (0, express_validator_1.body)('goals').optional().isArray()
]), function (req, res) {
    var _a, _b, _c;
    var _d = req.body, employeeId = _d.employeeId, period = _d.period, score = _d.score, comments = _d.comments, goals = _d.goals;
    // 模拟创建评估
    var newEvaluation = {
        id: Math.floor(Math.random() * 10000),
        employeeId: employeeId,
        employeeName: '张教师',
        position: '主班老师',
        period: period,
        score: score,
        level: score >= 90 ? '优秀' : score >= 80 ? '良好' : score >= 70 ? '合格' : '待改进',
        evaluatorId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 1,
        evaluatorName: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.realName) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.username) || '系统管理员',
        evaluationDate: new Date().toISOString().split('T')[0],
        comments: comments || '',
        goals: goals || [],
        achievements: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    apiResponse_1.ApiResponse.success(res, newEvaluation, '绩效评估创建成功', 201);
});
/**
 * @swagger
 * /performance-evaluations/{id}:
 *   put:
 *     summary: 更新绩效评估
 *     tags: [Performance Evaluation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 评估ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: number
 *               comments:
 *                 type: string
 *               goals:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 绩效评估更新成功
 *       404:
 *         description: 评估不存在
 */
router.put('/:id', (0, security_middleware_1.validateInput)([
    (0, express_validator_1.body)('score').optional().isFloat({ min: 0, max: 100 }),
    (0, express_validator_1.body)('comments').optional().isString(),
    (0, express_validator_1.body)('goals').optional().isArray()
]), function (req, res) {
    var _a, _b, _c;
    var id = parseInt(req.params.id);
    var _d = req.body, score = _d.score, comments = _d.comments, goals = _d.goals;
    if (isNaN(id)) {
        return apiResponse_1.ApiResponse.error(res, 'INVALID_ID', 'ID必须是数字', 400);
    }
    // 模拟更新评估
    var updatedEvaluation = {
        id: id,
        employeeId: 1,
        employeeName: '张教师',
        position: '主班老师',
        period: '2025-Q1',
        score: score || 92,
        level: (score || 92) >= 90 ? '优秀' : (score || 92) >= 80 ? '良好' : (score || 92) >= 70 ? '合格' : '待改进',
        evaluatorId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 1,
        evaluatorName: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.realName) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.username) || '系统管理员',
        evaluationDate: '2025-01-15',
        comments: comments || '工作认真负责，与家长沟通良好',
        goals: goals || ['提高课堂互动性', '加强家园沟通'],
        achievements: ['获得家长满意度95%', '班级无安全事故'],
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: new Date().toISOString()
    };
    apiResponse_1.ApiResponse.success(res, updatedEvaluation, '绩效评估更新成功');
});
/**
 * @swagger
 * /performance-evaluations/{id}:
 *   delete:
 *     summary: 删除绩效评估
 *     tags: [Performance Evaluation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 评估ID
 *     responses:
 *       200:
 *         description: 绩效评估删除成功
 *       404:
 *         description: 评估不存在
 */
router["delete"]('/:id', function (req, res) {
    var id = parseInt(req.params.id);
    if (isNaN(id)) {
        return apiResponse_1.ApiResponse.error(res, 'INVALID_ID', 'ID必须是数字', 400);
    }
    // 模拟删除评估
    var deletedEvaluation = {
        id: id,
        employeeName: '张教师',
        period: '2025-Q1',
        deletedAt: new Date().toISOString()
    };
    apiResponse_1.ApiResponse.success(res, deletedEvaluation, '绩效评估删除成功');
});
exports["default"] = router;
