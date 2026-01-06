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
 * /api/statistics/dashboard:
 *   get:
 *     summary: 获取仪表板统计数据
 *     description: 获取仪表板的综合统计数据，包括概览、趋势和增长数据
 *     tags:
 *       - 统计分析
 *     security:
 *       - bearerAuth: []
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                     trends:
 *                       type: object
 *                     growth:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/dashboard', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var dashboardStats;
    return __generator(this, function (_a) {
        try {
            dashboardStats = {
                overview: {
                    totalStudents: 2047,
                    totalTeachers: 78,
                    totalClasses: 42,
                    totalActivities: 156,
                    totalRevenue: 1250000,
                    enrollmentRate: 89.3,
                    satisfactionScore: 4.8,
                    attendanceRate: 95.2
                },
                trends: {
                    enrollment: [
                        { date: '2025-07-01', value: 15 },
                        { date: '2025-07-02', value: 18 },
                        { date: '2025-07-03', value: 12 },
                        { date: '2025-07-04', value: 22 },
                        { date: '2025-07-05', value: 16 },
                        { date: '2025-07-06', value: 20 },
                        { date: '2025-07-07', value: 14 }
                    ],
                    revenue: [
                        { date: '2025-07-01', value: 45000 },
                        { date: '2025-07-02', value: 52000 },
                        { date: '2025-07-03', value: 38000 },
                        { date: '2025-07-04', value: 61000 },
                        { date: '2025-07-05', value: 47000 },
                        { date: '2025-07-06', value: 55000 },
                        { date: '2025-07-07', value: 42000 }
                    ]
                },
                growth: {
                    students: '+12.5%',
                    teachers: '+3.2%',
                    classes: '+8.1%',
                    activities: '+15.7%',
                    revenue: '+18.9%'
                }
            };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, dashboardStats, '获取仪表板统计数据成功')];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取仪表板统计数据失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/statistics/enrollment:
 *   get:
 *     summary: 获取招生统计数据
 *     description: 获取招生相关的统计数据
 *     tags:
 *       - 统计分析
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/enrollment', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, startDate, endDate, _b, period, enrollmentStats;
    return __generator(this, function (_c) {
        try {
            _a = req.query, startDate = _a.startDate, endDate = _a.endDate, _b = _a.period, period = _b === void 0 ? 'day' : _b;
            enrollmentStats = {
                summary: {
                    totalApplications: 245,
                    approvedApplications: 198,
                    pendingApplications: 47,
                    rejectedApplications: 12,
                    conversionRate: 80.8,
                    averageProcessingTime: 3.2
                },
                trends: [
                    { date: '2025-07-01', applications: 8, approved: 6, pending: 2 },
                    { date: '2025-07-02', applications: 12, approved: 10, pending: 2 },
                    { date: '2025-07-03', applications: 6, approved: 5, pending: 1 },
                    { date: '2025-07-04', applications: 15, approved: 12, pending: 3 },
                    { date: '2025-07-05', applications: 9, approved: 7, pending: 2 },
                    { date: '2025-07-06', applications: 11, approved: 9, pending: 2 },
                    { date: '2025-07-07', applications: 7, approved: 6, pending: 1 }
                ],
                channels: [
                    { name: '线上推广', count: 98, percentage: 40 },
                    { name: '朋友推荐', count: 73, percentage: 30 },
                    { name: '社区活动', count: 49, percentage: 20 },
                    { name: '其他渠道', count: 25, percentage: 10 }
                ],
                ageDistribution: [
                    { ageGroup: '3-4岁', count: 85, percentage: 35 },
                    { ageGroup: '4-5岁', count: 92, percentage: 38 },
                    { ageGroup: '5-6岁', count: 68, percentage: 27 }
                ]
            };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, enrollmentStats, '获取招生统计数据成功')];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取招生统计数据失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/statistics/students:
 *   get:
 *     summary: 获取学生统计数据
 *     description: 获取学生相关的统计数据
 *     tags:
 *       - 统计分析
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/students', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var studentStats;
    return __generator(this, function (_a) {
        try {
            studentStats = {
                summary: {
                    totalStudents: 2047,
                    activeStudents: 1985,
                    newStudents: 156,
                    graduatedStudents: 89,
                    maleStudents: 1024,
                    femaleStudents: 1023,
                    averageAge: 4.8
                },
                classDistribution: [
                    { className: '小班A', studentCount: 25, capacity: 30, utilization: 83.3 },
                    { className: '小班B', studentCount: 28, capacity: 30, utilization: 93.3 },
                    { className: '中班A', studentCount: 26, capacity: 28, utilization: 92.9 },
                    { className: '中班B', studentCount: 27, capacity: 28, utilization: 96.4 },
                    { className: '大班A', studentCount: 24, capacity: 26, utilization: 92.3 },
                    { className: '大班B', studentCount: 25, capacity: 26, utilization: 96.2 }
                ],
                ageDistribution: [
                    { ageGroup: '3-4岁', count: 612, percentage: 29.9 },
                    { ageGroup: '4-5岁', count: 735, percentage: 35.9 },
                    { ageGroup: '5-6岁', count: 700, percentage: 34.2 }
                ],
                attendanceRate: {
                    overall: 95.2,
                    byClass: [
                        { className: '小班A', rate: 94.8 },
                        { className: '小班B', rate: 96.1 },
                        { className: '中班A', rate: 95.7 },
                        { className: '中班B', rate: 94.3 },
                        { className: '大班A', rate: 95.9 },
                        { className: '大班B', rate: 96.8 }
                    ]
                }
            };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, studentStats, '获取学生统计数据成功')];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取学生统计数据失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/statistics/revenue:
 *   get:
 *     summary: 获取收入统计数据
 *     description: 获取收入相关的统计数据
 *     tags:
 *       - 统计分析
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/revenue', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, startDate, endDate, revenueStats;
    return __generator(this, function (_b) {
        try {
            _a = req.query, startDate = _a.startDate, endDate = _a.endDate;
            revenueStats = {
                summary: {
                    totalRevenue: 1250000,
                    monthlyRevenue: 185000,
                    averageRevenue: 6100,
                    growthRate: 18.9,
                    outstandingPayments: 45000,
                    collectionRate: 96.4
                },
                trends: [
                    { date: '2025-07-01', revenue: 45000, payments: 12 },
                    { date: '2025-07-02', revenue: 52000, payments: 15 },
                    { date: '2025-07-03', revenue: 38000, payments: 10 },
                    { date: '2025-07-04', revenue: 61000, payments: 18 },
                    { date: '2025-07-05', revenue: 47000, payments: 13 },
                    { date: '2025-07-06', revenue: 55000, payments: 16 },
                    { date: '2025-07-07', revenue: 42000, payments: 11 }
                ],
                categories: [
                    { category: '学费', amount: 950000, percentage: 76 },
                    { category: '餐费', amount: 180000, percentage: 14.4 },
                    { category: '活动费', amount: 75000, percentage: 6 },
                    { category: '其他费用', amount: 45000, percentage: 3.6 }
                ],
                paymentMethods: [
                    { method: '银行转账', amount: 625000, percentage: 50 },
                    { method: '支付宝', amount: 375000, percentage: 30 },
                    { method: '微信支付', amount: 187500, percentage: 15 },
                    { method: '现金', amount: 62500, percentage: 5 }
                ]
            };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, revenueStats, '获取收入统计数据成功')];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取收入统计数据失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/statistics/activities:
 *   get:
 *     summary: 获取活动统计数据
 *     description: 获取活动相关的统计数据
 *     tags:
 *       - 统计分析
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/activities', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var activityStats;
    return __generator(this, function (_a) {
        try {
            activityStats = {
                summary: {
                    totalActivities: 156,
                    activeActivities: 12,
                    completedActivities: 144,
                    totalParticipants: 3250,
                    averageParticipation: 20.8,
                    satisfactionScore: 4.6
                },
                categories: [
                    { category: '体育活动', count: 45, participants: 950, satisfaction: 4.7 },
                    { category: '艺术活动', count: 38, participants: 820, satisfaction: 4.8 },
                    { category: '科学实验', count: 25, participants: 580, satisfaction: 4.5 },
                    { category: '社会实践', count: 22, participants: 490, satisfaction: 4.4 },
                    { category: '音乐舞蹈', count: 18, participants: 320, satisfaction: 4.9 },
                    { category: '手工制作', count: 8, participants: 90, satisfaction: 4.3 }
                ],
                monthlyTrends: [
                    { month: '2025-01', activities: 18, participants: 420 },
                    { month: '2025-02', activities: 22, participants: 510 },
                    { month: '2025-03', activities: 25, participants: 580 },
                    { month: '2025-04', activities: 20, participants: 465 },
                    { month: '2025-05', activities: 28, participants: 650 },
                    { month: '2025-06', activities: 24, participants: 560 },
                    { month: '2025-07', activities: 19, participants: 435 }
                ],
                popularActivities: [
                    { name: '亲子运动会', participants: 180, satisfaction: 4.9 },
                    { name: '科学小实验', participants: 165, satisfaction: 4.7 },
                    { name: '艺术创作展', participants: 142, satisfaction: 4.8 },
                    { name: '音乐表演', participants: 128, satisfaction: 4.6 },
                    { name: '户外探索', participants: 115, satisfaction: 4.5 }
                ]
            };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, activityStats, '获取活动统计数据成功')];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取活动统计数据失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/statistics/regions:
 *   get:
 *     summary: 获取地区统计数据
 *     description: 获取地区相关的统计数据
 *     tags:
 *       - 统计分析
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/regions', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var regionStats;
    return __generator(this, function (_a) {
        try {
            regionStats = {
                distribution: [
                    { region: '市中心', students: 680, percentage: 33.2 },
                    { region: '东城区', students: 520, percentage: 25.4 },
                    { region: '西城区', students: 445, percentage: 21.7 },
                    { region: '南城区', students: 285, percentage: 13.9 },
                    { region: '北城区', students: 117, percentage: 5.8 }
                ],
                growth: [
                    { region: '市中心', growth: '+8.5%' },
                    { region: '东城区', growth: '+12.3%' },
                    { region: '西城区', growth: '+15.7%' },
                    { region: '南城区', growth: '+22.1%' },
                    { region: '北城区', growth: '+35.2%' }
                ]
            };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, regionStats, '获取地区统计数据成功')];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取地区统计数据失败')];
        }
        return [2 /*return*/];
    });
}); });
exports["default"] = router;
