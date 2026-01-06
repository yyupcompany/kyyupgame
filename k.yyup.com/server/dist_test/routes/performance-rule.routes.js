"use strict";
/**
 * 绩效规则API路由
 * 处理绩效评估规则的配置和管理功能
 */
exports.__esModule = true;
var express_1 = require("express");
var apiResponse_1 = require("../utils/apiResponse");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
// 应用认证中间件
router.use(auth_middleware_1.authMiddleware);
/**
 * @swagger
 * /performance-rule:
 *   get:
 *     summary: 获取绩效规则列表
 *     tags: [Performance Rule]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功返回绩效规则列表
 */
router.get('/', function (req, res) {
    var _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c, category = _a.category, status = _a.status;
    // 模拟数据
    var rules = [
        {
            id: 1,
            name: '教学质量评估规则',
            category: '教学类',
            description: '基于教学效果、学生反馈和家长满意度的评估规则',
            status: '启用',
            weight: 40,
            criteria: [
                { name: '教学效果', weight: 50, description: '基于学生学习成果评估' },
                { name: '学生反馈', weight: 30, description: '学生对教师的评价' },
                { name: '家长满意度', weight: 20, description: '家长对教学的满意程度' }
            ],
            scoreRanges: [
                { level: '优秀', minScore: 90, maxScore: 100, reward: '奖金+200元' },
                { level: '良好', minScore: 80, maxScore: 89, reward: '奖金+100元' },
                { level: '合格', minScore: 70, maxScore: 79, reward: '无奖励' },
                { level: '待改进', minScore: 0, maxScore: 69, reward: '需要培训' }
            ],
            applicableRoles: ['主班老师', '副班老师'],
            createdBy: '系统管理员',
            createdAt: '2025-01-01T10:00:00Z',
            updatedAt: '2025-01-01T10:00:00Z'
        }
    ];
    var total = rules.length;
    var totalPages = Math.ceil(total / Number(limit));
    apiResponse_1.ApiResponse.success(res, {
        rules: rules,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total: total,
            totalPages: totalPages
        }
    }, '绩效规则列表获取成功');
});
/**
 * @swagger
 * /performance-rule/{id}:
 *   get:
 *     summary: 获取特定绩效规则详情
 *     tags: [Performance Rule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 规则ID
 *     responses:
 *       200:
 *         description: 成功返回绩效规则详情
 *       404:
 *         description: 规则不存在
 */
router.get('/:id', function (req, res) {
    var id = parseInt(req.params.id);
    if (isNaN(id)) {
        return apiResponse_1.ApiResponse.error(res, 'INVALID_ID', 'ID必须是数字', 400);
    }
    // 模拟数据
    var rule = {
        id: id,
        name: '教学质量评估规则',
        category: '教学类',
        description: '基于教学效果、学生反馈和家长满意度的评估规则',
        status: '启用',
        weight: 40,
        criteria: [
            {
                name: '教学效果',
                weight: 50,
                description: '基于学生学习成果评估',
                evaluationMethod: '通过学生作业、测试和活动表现评估',
                dataSource: '学生成绩记录、作业完成情况'
            },
            {
                name: '学生反馈',
                weight: 30,
                description: '学生对教师的评价',
                evaluationMethod: '通过学生问卷和日常观察评估',
                dataSource: '学生反馈问卷、日常观察记录'
            },
            {
                name: '家长满意度',
                weight: 20,
                description: '家长对教学的满意程度',
                evaluationMethod: '通过家长问卷和家长会反馈评估',
                dataSource: '家长满意度调查、家长会记录'
            }
        ],
        scoreRanges: [
            { level: '优秀', minScore: 90, maxScore: 100, reward: '奖金+200元', color: '#52c41a' },
            { level: '良好', minScore: 80, maxScore: 89, reward: '奖金+100元', color: '#1890ff' },
            { level: '合格', minScore: 70, maxScore: 79, reward: '无奖励', color: '#faad14' },
            { level: '待改进', minScore: 0, maxScore: 69, reward: '需要培训', color: '#ff4d4f' }
        ],
        applicableRoles: ['主班老师', '副班老师'],
        evaluationFrequency: '季度',
        lastModified: '2025-01-01T10:00:00Z',
        createdBy: '系统管理员',
        createdAt: '2025-01-01T10:00:00Z',
        updatedAt: '2025-01-01T10:00:00Z'
    };
    apiResponse_1.ApiResponse.success(res, rule, '绩效规则详情获取成功');
});
/**
 * @swagger
 * /performance-rule:
 *   post:
 *     summary: 创建绩效规则
 *     tags: [Performance Rule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               weight:
 *                 type: number
 *     responses:
 *       201:
 *         description: 绩效规则创建成功
 *       400:
 *         description: 请求参数错误
 */
router.post('/', function (req, res) {
    var _a, _b;
    var _c = req.body, name = _c.name, category = _c.category, description = _c.description, weight = _c.weight;
    if (!name || !category) {
        return apiResponse_1.ApiResponse.error(res, 'MISSING_REQUIRED_FIELDS', '名称和类别是必需的', 400);
    }
    // 模拟创建规则
    var newRule = {
        id: Math.floor(Math.random() * 10000),
        name: name,
        category: category,
        description: description || '',
        status: '启用',
        weight: weight || 0,
        criteria: [],
        scoreRanges: [
            { level: '优秀', minScore: 90, maxScore: 100, reward: '奖金+200元' },
            { level: '良好', minScore: 80, maxScore: 89, reward: '奖金+100元' },
            { level: '合格', minScore: 70, maxScore: 79, reward: '无奖励' },
            { level: '待改进', minScore: 0, maxScore: 69, reward: '需要培训' }
        ],
        applicableRoles: [],
        evaluationFrequency: '季度',
        createdBy: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.realName) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '系统管理员',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    apiResponse_1.ApiResponse.success(res, newRule, '绩效规则创建成功', 201);
});
exports["default"] = router;
