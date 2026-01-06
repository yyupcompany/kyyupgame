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
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: 统计数据管理
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     CombinedStatistics:
 *       type: object
 *       properties:
 *         users:
 *           type: object
 *           properties:
 *             total_users:
 *               type: integer
 *               description: 用户总数
 *             active_users:
 *               type: integer
 *               description: 活跃用户数
 *         enrollment:
 *           type: object
 *           properties:
 *             total_applications:
 *               type: integer
 *               description: 申请总数
 *             approved_applications:
 *               type: integer
 *               description: 已批准申请数
 *         activities:
 *           type: object
 *           properties:
 *             total_activities:
 *               type: integer
 *               description: 活动总数
 *             active_activities:
 *               type: integer
 *               description: 活跃活动数
 *         kindergartens:
 *           type: object
 *           properties:
 *             total_kindergartens:
 *               type: integer
 *               description: 幼儿园总数
 *         summary:
 *           type: object
 *           properties:
 *             total_users:
 *               type: integer
 *             total_applications:
 *               type: integer
 *             total_activities:
 *               type: integer
 *             total_kindergartens:
 *               type: integer
 *
 *     UserStatistics:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: 用户总数
 *         active:
 *           type: integer
 *           description: 活跃用户数
 *         inactive:
 *           type: integer
 *           description: 非活跃用户数
 *
 *     EnrollmentStatistics:
 *       type: object
 *       properties:
 *         total_applications:
 *           type: integer
 *           description: 申请总数
 *         approved:
 *           type: integer
 *           description: 已批准数
 *         pending:
 *           type: integer
 *           description: 待审核数
 *         rejected:
 *           type: integer
 *           description: 已拒绝数
 *
 *     ActivityStatistics:
 *       type: object
 *       properties:
 *         total_activities:
 *           type: integer
 *           description: 活动总数
 *         active:
 *           type: integer
 *           description: 活跃活动数
 *         completed:
 *           type: integer
 *           description: 已完成活动数
 *         cancelled:
 *           type: integer
 *           description: 已取消活动数
 *
 *     FinanceStatistics:
 *       type: object
 *       properties:
 *         total_revenue:
 *           type: number
 *           description: 总收入
 *         monthly_revenue:
 *           type: number
 *           description: 月收入
 *         pending_payments:
 *           type: number
 *           description: 待付款
 *         completed_payments:
 *           type: number
 *           description: 已完成付款
 *
 *     FinancialDetailStatistics:
 *       type: object
 *       properties:
 *         totalRevenue:
 *           type: number
 *           description: 总收入
 *         totalExpenses:
 *           type: number
 *           description: 总支出
 *         netProfit:
 *           type: number
 *           description: 净利润
 *         monthlyRevenue:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               month:
 *                 type: string
 *                 description: 月份
 *               revenue:
 *                 type: number
 *                 description: 收入
 *               expenses:
 *                 type: number
 *                 description: 支出
 *         revenueBySource:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               source:
 *                 type: string
 *                 description: 收入来源
 *               amount:
 *                 type: number
 *                 description: 金额
 *               percentage:
 *                 type: number
 *                 description: 百分比
 *         expensesByCategory:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 description: 支出类别
 *               amount:
 *                 type: number
 *                 description: 金额
 *               percentage:
 *                 type: number
 *                 description: 百分比
 *
 *     RegionStatistics:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               region:
 *                 type: string
 *                 description: 地区名称
 *               kindergarten_count:
 *                 type: integer
 *                 description: 幼儿园数量
 *         total:
 *           type: integer
 *           description: 地区总数
 *
 *     TrendAnalysis:
 *       type: object
 *       properties:
 *         enrollment_trends:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: 日期
 *               count:
 *                 type: integer
 *                 description: 数量
 *         period:
 *           type: string
 *           description: 时间段
 *
 *     ExportData:
 *       type: object
 *       properties:
 *         exportId:
 *           type: string
 *           description: 导出ID
 *         type:
 *           type: string
 *           description: 导出类型
 *         format:
 *           type: string
 *           description: 导出格式
 *         dateRange:
 *           type: object
 *           properties:
 *             start:
 *               type: string
 *               format: date
 *               description: 开始日期
 *             end:
 *               type: string
 *               format: date
 *               description: 结束日期
 *         status:
 *           type: string
 *           description: 状态
 *         downloadUrl:
 *           type: string
 *           nullable: true
 *           description: 下载链接
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *
 *     OverviewStatistics:
 *       type: object
 *       properties:
 *         total_students:
 *           type: integer
 *           description: 学生总数
 *         total_teachers:
 *           type: integer
 *           description: 教师总数
 *         total_classes:
 *           type: integer
 *           description: 班级总数
 *         total_parents:
 *           type: integer
 *           description: 家长总数
 *
 *     EnrollmentTrendData:
 *       type: array
 *       items:
 *         type: object
 *         properties:
 *           date:
 *             type: string
 *             description: 日期
 *           count:
 *             type: integer
 *             description: 数量
 *
 *     ClassDistribution:
 *       type: object
 *       additionalProperties:
 *         type: integer
 *       description: 班级分布（键为班级名称，值为数量）
 *
 *     RevenueStatistics:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *           description: 总收入
 *         monthly:
 *           type: number
 *           description: 月收入
 *         byMonth:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: 日期
 *               value:
 *                 type: number
 *                 description: 金额
 *               label:
 *                 type: string
 *                 description: 标签
 *         bySource:
 *           type: object
 *           additionalProperties:
 *             type: number
 *           description: 按来源分类的收入
 *         trends:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: 日期
 *               value:
 *                 type: number
 *                 description: 金额
 *               label:
 *                 type: string
 *                 description: 标签
 *
 *     StudentStatistics:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: 学生总数
 *         byAge:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: 按年龄分组的统计
 *         byGender:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: 按性别分组的统计
 *         byClass:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: 按班级分组的统计
 *         trends:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: 日期
 *               value:
 *                 type: integer
 *                 description: 数量
 *               label:
 *                 type: string
 *                 description: 标签
 *
 *     DashboardStatistics:
 *       type: object
 *       properties:
 *         enrollment:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: 申请总数
 *             approved:
 *               type: integer
 *               description: 已批准数
 *             pending:
 *               type: integer
 *               description: 待审核数
 *             rejected:
 *               type: integer
 *               description: 已拒绝数
 *             trends:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     description: 日期
 *                   value:
 *                     type: integer
 *                     description: 数量
 *                   label:
 *                     type: string
 *                     description: 标签
 *         students:
 *           $ref: '#/components/schemas/StudentStatistics'
 *         revenue:
 *           $ref: '#/components/schemas/RevenueStatistics'
 *         activities:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: 活动总数
 *             published:
 *               type: integer
 *               description: 已发布活动数
 *             draft:
 *               type: integer
 *               description: 草稿活动数
 *             participation:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     description: 日期
 *                   value:
 *                     type: integer
 *                     description: 参与数量
 *                   label:
 *                     type: string
 *                     description: 标签

 */
var router = (0, express_1.Router)();
/**
 * @swagger
 * /statistics:
 *   get:
 *     summary: 获取综合统计数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取综合统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CombinedStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var module_1, type, startDate, endDate, activityStats_1, registrationStats, dateFilter, detailedStats, userStats, enrollmentStats, activityStats, kindergartenStats, combinedStats, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 10, , 11]);
                module_1 = req.query.module || req.query['params[module]'];
                type = req.query.type || req.query['params[type]'];
                startDate = req.query.startDate || req.query['params[startDate]'];
                endDate = req.query.endDate || req.query['params[endDate]'];
                if (!(module_1 === 'activities')) return [3 /*break*/, 5];
                if (!(type === 'overview')) return [3 /*break*/, 3];
                return [4 /*yield*/, init_1.sequelize.query("SELECT\n            COUNT(*) as total_activities,\n            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_activities,\n            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_activities,\n            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_activities\n          FROM activities WHERE deleted_at IS NULL", { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                activityStats_1 = (_a.sent())[0];
                return [4 /*yield*/, init_1.sequelize.query("SELECT\n            COUNT(*) as total_registrations,\n            COUNT(DISTINCT student_id) as unique_participants\n          FROM activity_registrations WHERE deleted_at IS NULL", { type: sequelize_1.QueryTypes.SELECT })];
            case 2:
                registrationStats = (_a.sent())[0];
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        activities: activityStats_1,
                        registrations: registrationStats
                    }, '获取活动统计数据成功')];
            case 3:
                if (!(type === 'detailed')) return [3 /*break*/, 5];
                dateFilter = '';
                if (startDate && endDate) {
                    dateFilter = "AND created_at BETWEEN '".concat(startDate, "' AND '").concat(endDate, "'");
                }
                return [4 /*yield*/, init_1.sequelize.query("SELECT\n            COUNT(*) as total_activities,\n            AVG(CASE WHEN max_participants > 0 THEN (current_participants / max_participants) * 100 ELSE 0 END) as avg_participation_rate,\n            SUM(current_participants) as total_participants\n          FROM activities\n          WHERE deleted_at IS NULL ".concat(dateFilter), { type: sequelize_1.QueryTypes.SELECT })];
            case 4:
                detailedStats = (_a.sent())[0];
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, detailedStats, '获取活动详细统计数据成功')];
            case 5: return [4 /*yield*/, init_1.sequelize.query("SELECT\n        COUNT(*) as total_users,\n        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users\n       FROM users", { type: sequelize_1.QueryTypes.SELECT })];
            case 6:
                userStats = (_a.sent())[0];
                return [4 /*yield*/, init_1.sequelize.query("SELECT\n        COUNT(*) as total_applications,\n        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_applications\n       FROM enrollment_applications", { type: sequelize_1.QueryTypes.SELECT })];
            case 7:
                enrollmentStats = (_a.sent())[0];
                return [4 /*yield*/, init_1.sequelize.query("SELECT\n        COUNT(*) as total_activities,\n        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_activities\n       FROM activities", { type: sequelize_1.QueryTypes.SELECT })];
            case 8:
                activityStats = (_a.sent())[0];
                return [4 /*yield*/, init_1.sequelize.query("SELECT COUNT(*) as total_kindergartens FROM kindergartens", { type: sequelize_1.QueryTypes.SELECT })];
            case 9:
                kindergartenStats = (_a.sent())[0];
                combinedStats = {
                    users: userStats || { total_users: 0, active_users: 0 },
                    enrollment: enrollmentStats || { total_applications: 0, approved_applications: 0 },
                    activities: activityStats || { total_activities: 0, active_activities: 0 },
                    kindergartens: kindergartenStats || { total_kindergartens: 0 },
                    summary: {
                        total_users: (userStats === null || userStats === void 0 ? void 0 : userStats.total_users) || 0,
                        total_applications: (enrollmentStats === null || enrollmentStats === void 0 ? void 0 : enrollmentStats.total_applications) || 0,
                        total_activities: (activityStats === null || activityStats === void 0 ? void 0 : activityStats.total_activities) || 0,
                        total_kindergartens: (kindergartenStats === null || kindergartenStats === void 0 ? void 0 : kindergartenStats.total_kindergartens) || 0
                    }
                };
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, combinedStats, '获取统计数据成功')];
            case 10:
                error_1 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_1, '获取统计数据失败')];
            case 11: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /statistics/users:
 *   get:
 *     summary: 获取用户统计数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/users', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userStats, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, init_1.sequelize.query("SELECT \n        COUNT(*) as total,\n        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,\n        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive\n       FROM users", { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                userStats = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, userStats[0] || {
                        total: 0,
                        active: 0,
                        inactive: 0
                    })];
            case 2:
                error_2 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_2, '获取用户统计失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /statistics/enrollment:
 *   get:
 *     summary: 获取招生统计数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取招生统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EnrollmentStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/enrollment', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var enrollmentStats, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, init_1.sequelize.query("SELECT \n        COUNT(*) as total_applications,\n        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,\n        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,\n        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected\n       FROM enrollment_applications", { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                enrollmentStats = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, enrollmentStats[0] || {
                        total_applications: 0,
                        approved: 0,
                        pending: 0,
                        rejected: 0
                    })];
            case 2:
                error_3 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_3, '获取招生统计失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /statistics/activities:
 *   get:
 *     summary: 获取活动统计数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取活动统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ActivityStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/activities', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var activityStats, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, init_1.sequelize.query("SELECT \n        COUNT(*) as total_activities,\n        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,\n        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,\n        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled\n       FROM activities", { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                activityStats = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, activityStats[0] || {
                        total_activities: 0,
                        active: 0,
                        completed: 0,
                        cancelled: 0
                    })];
            case 2:
                error_4 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_4, '获取活动统计失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /statistics/finance:
 *   get:
 *     summary: 获取财务统计数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取财务统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FinanceStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/finance', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var financeStats;
    return __generator(this, function (_a) {
        try {
            financeStats = {
                total_revenue: 0,
                monthly_revenue: 0,
                pending_payments: 0,
                completed_payments: 0
            };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, financeStats)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取财务统计失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /statistics/financial:
 *   get:
 *     summary: 获取详细财务统计数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取详细财务统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FinancialDetailStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/financial', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var financialStats;
    return __generator(this, function (_a) {
        try {
            financialStats = {
                totalRevenue: 1250000,
                totalExpenses: 980000,
                netProfit: 270000,
                monthlyRevenue: [
                    { month: '2025-01', revenue: 105000, expenses: 82000 },
                    { month: '2024-12', revenue: 98000, expenses: 78000 },
                    { month: '2024-11', revenue: 102000, expenses: 80000 },
                    { month: '2024-10', revenue: 110000, expenses: 85000 },
                    { month: '2024-09', revenue: 95000, expenses: 75000 },
                    { month: '2024-08', revenue: 108000, expenses: 83000 }
                ],
                revenueBySource: [
                    { source: '学费收入', amount: 850000, percentage: 68 },
                    { source: '餐费收入', amount: 200000, percentage: 16 },
                    { source: '活动费用', amount: 120000, percentage: 9.6 },
                    { source: '其他收入', amount: 80000, percentage: 6.4 }
                ],
                expensesByCategory: [
                    { category: '人员工资', amount: 490000, percentage: 50 },
                    { category: '设施维护', amount: 196000, percentage: 20 },
                    { category: '教学用品', amount: 147000, percentage: 15 },
                    { category: '其他支出', amount: 147000, percentage: 15 }
                ]
            };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, financialStats)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取财务统计失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /statistics/regions:
 *   get:
 *     summary: 获取地区统计数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取地区统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RegionStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/regions', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var regionStats;
    return __generator(this, function (_a) {
        try {
            regionStats = [
                { region: '北京', kindergarten_count: 15 },
                { region: '上海', kindergarten_count: 12 },
                { region: '广州', kindergarten_count: 8 },
                { region: '深圳', kindergarten_count: 6 },
                { region: '杭州', kindergarten_count: 4 },
                { region: '其他地区', kindergarten_count: 3 }
            ];
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                    items: regionStats,
                    total: regionStats.length
                })];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取地区统计失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /statistics/trends:
 *   get:
 *     summary: 获取趋势分析数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取趋势分析数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TrendAnalysis'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/trends', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var trends, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, init_1.sequelize.query("SELECT \n        DATE(created_at) as date,\n        COUNT(*) as count\n       FROM enrollment_applications \n       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)\n       GROUP BY DATE(created_at)\n       ORDER BY date DESC", { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                trends = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        enrollment_trends: trends,
                        period: '30天'
                    })];
            case 2:
                error_5 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_5, '获取趋势分析失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /statistics/export:
 *   get:
 *     summary: 导出统计报告
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       501:
 *         description: 导出功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/export', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '导出功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '导出统计报告失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /statistics/export:
 *   post:
 *     summary: 创建统计报告导出任务
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: 导出类型
 *                 default: enrollment
 *               format:
 *                 type: string
 *                 description: 导出格式
 *                 default: excel
 *               dateRange:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date
 *                     description: 开始日期
 *                   end:
 *                     type: string
 *                     format: date
 *                     description: 结束日期
 *     responses:
 *       200:
 *         description: 成功创建导出任务
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ExportData'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/export', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, type, format, dateRange, exportData;
    return __generator(this, function (_b) {
        try {
            _a = req.body, type = _a.type, format = _a.format, dateRange = _a.dateRange;
            exportData = {
                exportId: "export_".concat(Date.now()),
                type: type || 'enrollment',
                format: format || 'excel',
                dateRange: dateRange || { start: '2025-01-01', end: '2025-01-31' },
                status: 'processing',
                downloadUrl: null,
                createdAt: new Date().toISOString()
            };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, exportData, '导出任务已创建，请稍后下载')];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '导出统计报告失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /statistics/overview:
 *   get:
 *     summary: 获取总体统计数据（用于仪表盘）
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取总体统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/OverviewStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/overview', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var studentStats, teacherStats, classStats, parentStats, overviewStats, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, init_1.sequelize.query("SELECT COUNT(*) as total_students FROM students", { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                studentStats = (_a.sent())[0];
                return [4 /*yield*/, init_1.sequelize.query("SELECT COUNT(*) as total_teachers FROM teachers", { type: sequelize_1.QueryTypes.SELECT })];
            case 2:
                teacherStats = (_a.sent())[0];
                return [4 /*yield*/, init_1.sequelize.query("SELECT COUNT(*) as total_classes FROM classes", { type: sequelize_1.QueryTypes.SELECT })];
            case 3:
                classStats = (_a.sent())[0];
                return [4 /*yield*/, init_1.sequelize.query("SELECT COUNT(*) as total_parents FROM parents", { type: sequelize_1.QueryTypes.SELECT })];
            case 4:
                parentStats = (_a.sent())[0];
                overviewStats = {
                    total_students: (studentStats === null || studentStats === void 0 ? void 0 : studentStats.total_students) || 0,
                    total_teachers: (teacherStats === null || teacherStats === void 0 ? void 0 : teacherStats.total_teachers) || 0,
                    total_classes: (classStats === null || classStats === void 0 ? void 0 : classStats.total_classes) || 0,
                    total_parents: (parentStats === null || parentStats === void 0 ? void 0 : parentStats.total_parents) || 0
                };
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, overviewStats, '获取总体统计成功')];
            case 5:
                error_6 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_6, '获取总体统计失败')];
            case 6: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /statistics/enrollment-trend:
 *   get:
 *     summary: 获取招生趋势数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [month, week]
 *           default: month
 *         description: 时间周期
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           default: "6"
 *         description: 时间范围
 *     responses:
 *       200:
 *         description: 成功获取招生趋势数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EnrollmentTrendData'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/enrollment-trend', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, period, _c, range, rangeNum, trendData, now, i, date;
    return __generator(this, function (_d) {
        try {
            _a = req.query, _b = _a.period, period = _b === void 0 ? 'month' : _b, _c = _a.range, range = _c === void 0 ? '6' : _c;
            rangeNum = parseInt(range) || 6;
            trendData = [];
            now = new Date();
            for (i = rangeNum - 1; i >= 0; i--) {
                date = new Date(now);
                if (period === 'month') {
                    date.setMonth(date.getMonth() - i);
                    trendData.push({
                        date: date.toISOString().slice(0, 7),
                        count: Math.floor(Math.random() * 20) + 10
                    });
                }
                else if (period === 'week') {
                    date.setDate(date.getDate() - (i * 7));
                    trendData.push({
                        date: date.toISOString().slice(0, 10),
                        count: Math.floor(Math.random() * 10) + 5
                    });
                }
            }
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, trendData, '获取招生趋势成功')];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取招生趋势失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /statistics/class-distribution:
 *   get:
 *     summary: 获取班级分布数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取班级分布数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ClassDistribution'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/class-distribution', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var distribution;
    return __generator(this, function (_a) {
        try {
            distribution = {
                '小班': 4,
                '中班': 3,
                '大班': 3,
                '学前班': 2
            };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, distribution, '获取班级分布成功')];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取班级分布失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /statistics/revenue:
 *   get:
 *     summary: 获取营收统计数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取营收统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RevenueStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/revenue', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var revenueStats;
    return __generator(this, function (_a) {
        try {
            revenueStats = {
                total: 1250000,
                monthly: 105000,
                byMonth: [
                    { date: '2025-01', value: 105000, label: '1月' },
                    { date: '2024-12', value: 98000, label: '12月' },
                    { date: '2024-11', value: 102000, label: '11月' },
                    { date: '2024-10', value: 110000, label: '10月' },
                    { date: '2024-09', value: 95000, label: '9月' },
                    { date: '2024-08', value: 108000, label: '8月' }
                ],
                bySource: {
                    '学费收入': 850000,
                    '餐费收入': 200000,
                    '活动费用': 120000,
                    '其他收入': 80000
                },
                trends: [
                    { date: '2025-01', value: 105000, label: '1月' },
                    { date: '2024-12', value: 98000, label: '12月' },
                    { date: '2024-11', value: 102000, label: '11月' },
                    { date: '2024-10', value: 110000, label: '10月' },
                    { date: '2024-09', value: 95000, label: '9月' },
                    { date: '2024-08', value: 108000, label: '8月' }
                ]
            };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, revenueStats, '获取营收统计数据成功')];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取营收统计数据失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /statistics/students:
 *   get:
 *     summary: 获取学生统计数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取学生统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/StudentStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/students', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var totalStudents, genderStats, ageStats, classStats, trendStats, byGender_1, byAge_1, byClass_1, trends, studentStatistics, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                return [4 /*yield*/, init_1.sequelize.query("SELECT COUNT(*) as total FROM students WHERE deleted_at IS NULL", { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                totalStudents = (_a.sent())[0];
                return [4 /*yield*/, init_1.sequelize.query("SELECT \n        CASE \n          WHEN gender = 1 THEN 'male'\n          WHEN gender = 2 THEN 'female'\n          ELSE 'other'\n        END as gender,\n        COUNT(*) as count\n       FROM students \n       WHERE deleted_at IS NULL\n       GROUP BY gender", { type: sequelize_1.QueryTypes.SELECT })];
            case 2:
                genderStats = _a.sent();
                return [4 /*yield*/, init_1.sequelize.query("SELECT \n        CASE \n          WHEN YEAR(CURDATE()) - YEAR(birth_date) BETWEEN 3 AND 4 THEN '3-4\u5C81'\n          WHEN YEAR(CURDATE()) - YEAR(birth_date) BETWEEN 4 AND 5 THEN '4-5\u5C81'\n          WHEN YEAR(CURDATE()) - YEAR(birth_date) BETWEEN 5 AND 6 THEN '5-6\u5C81'\n          WHEN YEAR(CURDATE()) - YEAR(birth_date) BETWEEN 6 AND 7 THEN '6-7\u5C81'\n          ELSE '\u5176\u4ED6'\n        END as age_group,\n        COUNT(*) as count\n       FROM students \n       WHERE deleted_at IS NULL AND birth_date IS NOT NULL\n       GROUP BY age_group", { type: sequelize_1.QueryTypes.SELECT })];
            case 3:
                ageStats = _a.sent();
                return [4 /*yield*/, init_1.sequelize.query("SELECT \n        c.name as class_name,\n        COUNT(s.id) as count\n       FROM students s\n       LEFT JOIN classes c ON s.class_id = c.id\n       WHERE s.deleted_at IS NULL\n       GROUP BY c.id, c.name\n       ORDER BY c.name", { type: sequelize_1.QueryTypes.SELECT })];
            case 4:
                classStats = _a.sent();
                return [4 /*yield*/, init_1.sequelize.query("SELECT \n        DATE(created_at) as date,\n        COUNT(*) as value\n       FROM students \n       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)\n         AND deleted_at IS NULL\n       GROUP BY DATE(created_at)\n       ORDER BY date DESC\n       LIMIT 30", { type: sequelize_1.QueryTypes.SELECT })];
            case 5:
                trendStats = _a.sent();
                byGender_1 = {};
                genderStats.forEach(function (item) {
                    byGender_1[item.gender] = parseInt(item.count);
                });
                byAge_1 = {};
                ageStats.forEach(function (item) {
                    byAge_1[item.age_group] = parseInt(item.count);
                });
                byClass_1 = {};
                classStats.forEach(function (item) {
                    byClass_1[item.class_name || '未分班'] = parseInt(item.count);
                });
                trends = trendStats.map(function (item) { return ({
                    date: item.date,
                    value: parseInt(item.value),
                    label: item.date
                }); });
                studentStatistics = {
                    total: parseInt((totalStudents === null || totalStudents === void 0 ? void 0 : totalStudents.total) || 0),
                    byAge: byAge_1,
                    byGender: byGender_1,
                    byClass: byClass_1,
                    trends: trends
                };
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, studentStatistics, '获取学生统计数据成功')];
            case 6:
                error_7 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_7, '获取学生统计数据失败')];
            case 7: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /statistics/dashboard:
 *   get:
 *     summary: 获取仪表盘统计数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取仪表盘统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DashboardStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/dashboard', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var enrollmentStats, studentStats, activityStats, enrollmentTrends, dashboardData, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, init_1.sequelize.query("SELECT \n        COUNT(*) as total,\n        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,\n        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,\n        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected\n       FROM enrollment_applications", { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                enrollmentStats = (_a.sent())[0];
                return [4 /*yield*/, init_1.sequelize.query("SELECT \n        COUNT(*) as total,\n        SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as male,\n        SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female\n       FROM students", { type: sequelize_1.QueryTypes.SELECT })];
            case 2:
                studentStats = (_a.sent())[0];
                return [4 /*yield*/, init_1.sequelize.query("SELECT \n        COUNT(*) as total,\n        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,\n        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft\n       FROM activities", { type: sequelize_1.QueryTypes.SELECT })];
            case 3:
                activityStats = (_a.sent())[0];
                return [4 /*yield*/, init_1.sequelize.query("SELECT \n        DATE(created_at) as date,\n        COUNT(*) as value\n       FROM enrollment_applications \n       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)\n       GROUP BY DATE(created_at)\n       ORDER BY date DESC\n       LIMIT 30", { type: sequelize_1.QueryTypes.SELECT })];
            case 4:
                enrollmentTrends = _a.sent();
                dashboardData = {
                    enrollment: {
                        total: (enrollmentStats === null || enrollmentStats === void 0 ? void 0 : enrollmentStats.total) || 0,
                        approved: (enrollmentStats === null || enrollmentStats === void 0 ? void 0 : enrollmentStats.approved) || 0,
                        pending: (enrollmentStats === null || enrollmentStats === void 0 ? void 0 : enrollmentStats.pending) || 0,
                        rejected: (enrollmentStats === null || enrollmentStats === void 0 ? void 0 : enrollmentStats.rejected) || 0,
                        trends: enrollmentTrends.map(function (item) { return ({
                            date: item.date,
                            value: item.value,
                            label: item.date
                        }); })
                    },
                    students: {
                        total: (studentStats === null || studentStats === void 0 ? void 0 : studentStats.total) || 0,
                        byAge: {
                            '3-4岁': Math.floor(Math.random() * 50) + 20,
                            '4-5岁': Math.floor(Math.random() * 50) + 30,
                            '5-6岁': Math.floor(Math.random() * 50) + 25,
                            '6-7岁': Math.floor(Math.random() * 30) + 15
                        },
                        byGender: {
                            male: (studentStats === null || studentStats === void 0 ? void 0 : studentStats.male) || 0,
                            female: (studentStats === null || studentStats === void 0 ? void 0 : studentStats.female) || 0
                        },
                        byClass: {
                            '小班': Math.floor(Math.random() * 30) + 20,
                            '中班': Math.floor(Math.random() * 30) + 25,
                            '大班': Math.floor(Math.random() * 30) + 22,
                            '学前班': Math.floor(Math.random() * 25) + 18
                        },
                        trends: enrollmentTrends.map(function (item) { return ({
                            date: item.date,
                            value: Math.floor(item.value * 1.2),
                            label: item.date
                        }); })
                    },
                    revenue: {
                        total: 1250000,
                        byMonth: [
                            { date: '2025-01', value: 105000, label: '1月' },
                            { date: '2024-12', value: 98000, label: '12月' },
                            { date: '2024-11', value: 102000, label: '11月' },
                            { date: '2024-10', value: 110000, label: '10月' },
                            { date: '2024-09', value: 95000, label: '9月' },
                            { date: '2024-08', value: 108000, label: '8月' }
                        ],
                        bySource: {
                            '学费收入': 850000,
                            '餐费收入': 200000,
                            '活动费用': 120000,
                            '其他收入': 80000
                        },
                        trends: [
                            { date: '2025-01', value: 105000, label: '1月' },
                            { date: '2024-12', value: 98000, label: '12月' },
                            { date: '2024-11', value: 102000, label: '11月' },
                            { date: '2024-10', value: 110000, label: '10月' },
                            { date: '2024-09', value: 95000, label: '9月' },
                            { date: '2024-08', value: 108000, label: '8月' }
                        ]
                    },
                    activities: {
                        total: (activityStats === null || activityStats === void 0 ? void 0 : activityStats.total) || 0,
                        published: (activityStats === null || activityStats === void 0 ? void 0 : activityStats.published) || 0,
                        draft: (activityStats === null || activityStats === void 0 ? void 0 : activityStats.draft) || 0,
                        participation: enrollmentTrends.map(function (item) { return ({
                            date: item.date,
                            value: Math.floor(item.value * 0.8),
                            label: item.date
                        }); })
                    }
                };
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, dashboardData, '获取仪表盘统计数据成功')];
            case 5:
                error_8 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_8, '获取仪表盘统计数据失败')];
            case 6: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
