"use strict";
/**
 * 绩效报告API路由
 * 处理绩效报告的生成、查看和管理功能
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
 * /performance-reports:
 *   get:
 *     summary: 获取绩效报告列表
 *     tags: [Performance Report]
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
 *         name: period
 *         schema:
 *           type: string
 *         description: 报告期间
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: 报告类型
 *     responses:
 *       200:
 *         description: 成功返回绩效报告列表
 */
router.get('/', (0, security_middleware_1.validateInput)([
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('period').optional().isString(),
    (0, express_validator_1.query)('type').optional().isString()
]), function (req, res) {
    var _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c, period = _a.period, type = _a.type;
    // 模拟数据
    var reports = [
        {
            id: 1,
            title: '2025年第一季度绩效报告',
            type: '季度报告',
            period: '2025-Q1',
            status: '已完成',
            generatedBy: '系统管理员',
            generatedAt: '2025-01-31T10:00:00Z',
            summary: {
                totalEmployees: 24,
                averageScore: 87.5,
                excellentCount: 8,
                goodCount: 12,
                satisfactoryCount: 4,
                improvementNeeded: 0
            },
            departments: [
                {
                    name: '教学部',
                    averageScore: 89.2,
                    employeeCount: 18
                },
                {
                    name: '行政部',
                    averageScore: 84.3,
                    employeeCount: 6
                }
            ],
            createdAt: '2025-01-31T10:00:00Z',
            updatedAt: '2025-01-31T10:00:00Z'
        },
        {
            id: 2,
            title: '2024年度绩效报告',
            type: '年度报告',
            period: '2024',
            status: '已完成',
            generatedBy: '系统管理员',
            generatedAt: '2024-12-31T10:00:00Z',
            summary: {
                totalEmployees: 22,
                averageScore: 86.8,
                excellentCount: 7,
                goodCount: 11,
                satisfactoryCount: 4,
                improvementNeeded: 0
            },
            departments: [
                {
                    name: '教学部',
                    averageScore: 88.5,
                    employeeCount: 16
                },
                {
                    name: '行政部',
                    averageScore: 83.1,
                    employeeCount: 6
                }
            ],
            createdAt: '2024-12-31T10:00:00Z',
            updatedAt: '2024-12-31T10:00:00Z'
        }
    ];
    var total = reports.length;
    var totalPages = Math.ceil(total / Number(limit));
    apiResponse_1.ApiResponse.success(res, {
        reports: reports,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total: total,
            totalPages: totalPages
        }
    }, '绩效报告列表获取成功');
});
/**
 * @swagger
 * /performance-reports/{id}:
 *   get:
 *     summary: 获取特定绩效报告详情
 *     tags: [Performance Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 报告ID
 *     responses:
 *       200:
 *         description: 成功返回绩效报告详情
 *       404:
 *         description: 报告不存在
 */
router.get('/:id', function (req, res) {
    var id = parseInt(req.params.id);
    if (isNaN(id)) {
        return apiResponse_1.ApiResponse.error(res, 'INVALID_ID', 'ID必须是数字', 400);
    }
    // 模拟数据
    var report = {
        id: id,
        title: '2025年第一季度绩效报告',
        type: '季度报告',
        period: '2025-Q1',
        status: '已完成',
        generatedBy: '系统管理员',
        generatedAt: '2025-01-31T10:00:00Z',
        summary: {
            totalEmployees: 24,
            averageScore: 87.5,
            excellentCount: 8,
            goodCount: 12,
            satisfactoryCount: 4,
            improvementNeeded: 0
        },
        departments: [
            {
                name: '教学部',
                averageScore: 89.2,
                employeeCount: 18,
                employees: [
                    { name: '张教师', position: '主班老师', score: 92 },
                    { name: '李教师', position: '副班老师', score: 88 }
                ]
            },
            {
                name: '行政部',
                averageScore: 84.3,
                employeeCount: 6,
                employees: [
                    { name: '王主任', position: '行政主任', score: 90 },
                    { name: '赵助理', position: '行政助理', score: 85 }
                ]
            }
        ],
        trends: {
            scoreImprovement: '+2.3%',
            attendanceRate: '98.5%',
            parentSatisfaction: '94.2%'
        },
        recommendations: [
            '继续加强教师培训',
            '提升团队协作能力',
            '优化工作流程'
        ],
        createdAt: '2025-01-31T10:00:00Z',
        updatedAt: '2025-01-31T10:00:00Z'
    };
    apiResponse_1.ApiResponse.success(res, report, '绩效报告详情获取成功');
});
/**
 * @swagger
 * /performance-reports:
 *   post:
 *     summary: 生成绩效报告
 *     tags: [Performance Report]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *               period:
 *                 type: string
 *               departmentIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: 绩效报告生成成功
 *       400:
 *         description: 请求参数错误
 */
router.post('/', (0, security_middleware_1.validateInput)([
    (0, express_validator_1.body)('title').isString().notEmpty().withMessage('报告标题不能为空'),
    (0, express_validator_1.body)('type').isString().notEmpty().withMessage('报告类型不能为空'),
    (0, express_validator_1.body)('period').isString().notEmpty().withMessage('报告期间不能为空'),
    (0, express_validator_1.body)('departmentIds').optional().isArray()
]), function (req, res) {
    var _a, _b;
    var _c = req.body, title = _c.title, type = _c.type, period = _c.period, departmentIds = _c.departmentIds;
    // 模拟生成报告
    var newReport = {
        id: Math.floor(Math.random() * 10000),
        title: title,
        type: type,
        period: period,
        status: '生成中',
        generatedBy: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.realName) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '系统管理员',
        generatedAt: new Date().toISOString(),
        summary: {
            totalEmployees: 24,
            averageScore: 87.5,
            excellentCount: 8,
            goodCount: 12,
            satisfactoryCount: 4,
            improvementNeeded: 0
        },
        departments: [
            {
                name: '教学部',
                averageScore: 89.2,
                employeeCount: 18
            },
            {
                name: '行政部',
                averageScore: 84.3,
                employeeCount: 6
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    apiResponse_1.ApiResponse.success(res, newReport, '绩效报告生成成功', 201);
});
/**
 * @swagger
 * /performance-reports/{id}/export:
 *   get:
 *     summary: 导出绩效报告
 *     tags: [Performance Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 报告ID
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel, word]
 *           default: pdf
 *         description: 导出格式
 *     responses:
 *       200:
 *         description: 导出成功
 *       404:
 *         description: 报告不存在
 */
router.get('/:id/export', function (req, res) {
    var id = parseInt(req.params.id);
    var format = req.query.format || 'pdf';
    if (isNaN(id)) {
        return apiResponse_1.ApiResponse.error(res, 'INVALID_ID', 'ID必须是数字', 400);
    }
    // 模拟导出
    var exportResult = {
        reportId: id,
        format: format,
        fileName: "performance_report_".concat(id, ".").concat(format),
        downloadUrl: "/downloads/performance_report_".concat(id, ".").concat(format),
        fileSize: '2.5MB',
        exportedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后过期
    };
    apiResponse_1.ApiResponse.success(res, exportResult, '绩效报告导出成功');
});
/**
 * @swagger
 * /performance-reports/{id}:
 *   delete:
 *     summary: 删除绩效报告
 *     tags: [Performance Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 报告ID
 *     responses:
 *       200:
 *         description: 绩效报告删除成功
 *       404:
 *         description: 报告不存在
 */
router["delete"]('/:id', function (req, res) {
    var id = parseInt(req.params.id);
    if (isNaN(id)) {
        return apiResponse_1.ApiResponse.error(res, 'INVALID_ID', 'ID必须是数字', 400);
    }
    // 模拟删除报告
    var deletedReport = {
        id: id,
        title: '2025年第一季度绩效报告',
        period: '2025-Q1',
        deletedAt: new Date().toISOString()
    };
    apiResponse_1.ApiResponse.success(res, deletedReport, '绩效报告删除成功');
});
exports["default"] = router;
