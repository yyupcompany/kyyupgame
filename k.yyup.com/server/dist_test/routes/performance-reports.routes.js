"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express_1 = require("express");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var apiResponse_1 = require("../utils/apiResponse");
var router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: PerformanceReports
 *   description: 性能报告管理API
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     PerformanceReport:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 性能报告ID
 *         title:
 *           type: string
 *           description: 报告标题
 *         type:
 *           type: string
 *           enum: [daily, weekly, monthly, quarterly, yearly]
 *           description: 报告类型
 *         period:
 *           type: object
 *           description: 报告周期
 *           properties:
 *             startDate:
 *               type: string
 *               format: date
 *               description: 开始日期
 *             endDate:
 *               type: string
 *               format: date
 *               description: 结束日期
 *         metrics:
 *           type: object
 *           description: 性能指标
 *           properties:
 *             totalStudents:
 *               type: integer
 *               description: 总学生数
 *             averageScore:
 *               type: number
 *               description: 平均成绩
 *             improvementRate:
 *               type: number
 *               description: 提升率
 *         status:
 *           type: string
 *           enum: [generating, completed, failed]
 *           description: 报告状态
 *         fileUrl:
 *           type: string
 *           description: 报告文件下载链接
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *       example:
 *         id: "report_001"
 *         title: "2024年第一季度性能报告"
 *         type: "quarterly"
 *         period:
 *           startDate: "2024-01-01"
 *           endDate: "2024-03-31"
 *         metrics:
 *           totalStudents: 120
 *           averageScore: 85.5
 *           improvementRate: 12.3
 *         status: "completed"
 *         fileUrl: "/reports/report_001.pdf"
 *         createdAt: "2024-04-01T00:00:00Z"
 *         updatedAt: "2024-04-01T00:00:00Z"
 *     CreatePerformanceReportRequest:
 *       type: object
 *       required:
 *         - title
 *         - type
 *         - period
 *       properties:
 *         title:
 *           type: string
 *           description: 报告标题
 *         type:
 *           type: string
 *           enum: [daily, weekly, monthly, quarterly, yearly]
 *           description: 报告类型
 *         period:
 *           type: object
 *           required:
 *             - startDate
 *             - endDate
 *           properties:
 *             startDate:
 *               type: string
 *               format: date
 *               description: 开始日期
 *             endDate:
 *               type: string
 *               format: date
 *               description: 结束日期
 *         includeMetrics:
 *           type: array
 *           items:
 *             type: string
 *           description: 包含的指标类型
 *         targetGroups:
 *           type: array
 *           items:
 *             type: string
 *           description: 目标群体
 *       example:
 *         title: "2024年第一季度性能报告"
 *         type: "quarterly"
 *         period:
 *           startDate: "2024-01-01"
 *           endDate: "2024-03-31"
 *         includeMetrics: ["scores", "attendance", "improvement"]
 *         targetGroups: ["class_001", "class_002"]
 */
/**
 * @swagger
 * /api/performance-reports:
 *   get:
 *     summary: 获取性能报告列表
 *     description: 获取分页的性能报告列表，支持筛选和排序
 *     tags: [PerformanceReports]
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
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, quarterly, yearly]
 *         description: 报告类型筛选
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [generating, completed, failed]
 *         description: 状态筛选
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 创建日期起始范围
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 创建日期结束范围
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词（标题）
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取性能报告列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PerformanceReport'
 *                     total:
 *                       type: integer
 *                       description: 总记录数
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                     pageSize:
 *                       type: integer
 *                       description: 每页数量
 *                     totalPages:
 *                       type: integer
 *                       description: 总页数
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                    items: [],
                    total: 0,
                    page: 1,
                    pageSize: 10,
                    totalPages: 0
                }, '获取性能报告列表成功')];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取性能报告失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/performance-reports:
 *   post:
 *     summary: 生成性能报告
 *     description: 创建并生成新的性能报告，需要PERFORMANCE_RULE_MANAGE权限
 *     tags: [PerformanceReports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePerformanceReportRequest'
 *     responses:
 *       201:
 *         description: 报告生成成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "性能报告生成成功"
 *                 data:
 *                   $ref: '#/components/schemas/PerformanceReport'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       501:
 *         description: 功能未实现
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "生成功能暂未实现"
 *                 code:
 *                   type: string
 *                   example: "NOT_IMPLEMENTED"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('PERFORMANCE_RULE_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '生成功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '生成性能报告失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/performance-reports/{id}:
 *   get:
 *     summary: 获取性能报告详情
 *     description: 根据ID获取指定性能报告的详细信息
 *     tags: [PerformanceReports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 性能报告ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取性能报告详情成功"
 *                 data:
 *                   $ref: '#/components/schemas/PerformanceReport'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: 性能报告不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "性能报告不存在"
 *                 code:
 *                   type: string
 *                   example: "NOT_FOUND"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '性能报告不存在', 'NOT_FOUND', 404)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取性能报告详情失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/performance-reports/{id}/download:
 *   get:
 *     summary: 下载性能报告
 *     description: 下载指定性能报告的文件（PDF、Excel等格式）
 *     tags: [PerformanceReports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 性能报告ID
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel, csv]
 *           default: pdf
 *         description: 下载文件格式
 *     responses:
 *       200:
 *         description: 文件下载成功
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             description: 文件下载头
 *             schema:
 *               type: string
 *               example: "attachment; filename=performance-report-001.pdf"
 *           Content-Type:
 *             description: 文件类型
 *             schema:
 *               type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: 性能报告不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "性能报告不存在"
 *                 code:
 *                   type: string
 *                   example: "NOT_FOUND"
 *       501:
 *         description: 下载功能未实现
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "下载功能暂未实现"
 *                 code:
 *                   type: string
 *                   example: "NOT_IMPLEMENTED"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id/download', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '下载功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '下载性能报告失败')];
        }
        return [2 /*return*/];
    });
}); });
exports["default"] = router;
