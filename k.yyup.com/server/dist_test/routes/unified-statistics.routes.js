"use strict";
/**
 * 统一统计API路由
 * 整合所有分散的统计功能到一个统一的接口
 * @swagger
 * tags:
 *   - name: UnifiedStatistics
 *     description: 统一统计分析API
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var express = __importStar(require("express"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var apiResponse_1 = require("../utils/apiResponse");
var init_1 = require("../init");
var sequelize_1 = require("sequelize");
var router = express.Router();
// 使用认证中间件
router.use(auth_middleware_1.verifyToken);
/**
 * @swagger
 * /api/statistics:
 *   get:
 *     summary: 获取统计数据
 *     description: 统一的统计数据接口，支持多模块查询
 *     tags: [UnifiedStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: module
 *         required: true
 *         description: 统计模块
 *         schema:
 *           type: string
 *           enum: [enrollment, activities, dashboard, class, teacher, student, marketing, ai, system]
 *       - in: query
 *         name: type
 *         required: false
 *         description: 统计类型
 *         schema:
 *           type: string
 *           enum: [overview, trend, summary, detailed, comparison]
 *       - in: query
 *         name: period
 *         required: false
 *         description: 统计周期
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *       - in: query
 *         name: startDate
 *         required: false
 *         description: 开始日期
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: false
 *         description: 结束日期
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: 统计数据获取成功
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
 *                   description: 统计数据，结构根据模块和类型动态变化
 *                 message:
 *                   type: string
 *                   example: 统计数据获取成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器错误
 */
router.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var params, module_1, type, period, startDate, endDate, statisticsData, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                params = req.query.params || {};
                module_1 = req.query.module || params.module;
                type = req.query.type || params.type || 'overview';
                period = req.query.period || params.period || 'monthly';
                startDate = req.query.startDate || params.startDate;
                endDate = req.query.endDate || params.endDate;
                // 添加调试日志
                console.log('统计API参数解析:', {
                    module: module_1,
                    type: type,
                    period: period,
                    startDate: startDate,
                    endDate: endDate,
                    params: params,
                    queryKeys: Object.keys(req.query),
                    query: req.query
                });
                if (!module_1) {
                    console.log('模块参数缺失，返回400错误');
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '缺少必需的模块参数', 'BAD_REQUEST', 400)];
                }
                return [4 /*yield*/, getModuleStatistics(module_1, type, period, startDate, endDate, req.user)];
            case 1:
                statisticsData = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, statisticsData, '统计数据获取成功')];
            case 2:
                error_1 = _a.sent();
                console.error('获取统计数据失败:', error_1);
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '获取统计数据失败', 'INTERNAL_ERROR', 500)];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/statistics/comparison:
 *   get:
 *     summary: 获取对比统计数据
 *     description: 支持多模块、多时间段的对比分析
 *     tags: [UnifiedStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: modules
 *         required: true
 *         description: 对比模块（逗号分隔）
 *         schema:
 *           type: string
 *           example: "enrollment,activities,marketing"
 *       - in: query
 *         name: metric
 *         required: true
 *         description: 对比指标
 *         schema:
 *           type: string
 *           enum: [count, growth, conversion, satisfaction]
 *       - in: query
 *         name: period
 *         required: false
 *         description: 统计周期
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *           default: monthly
 *     responses:
 *       200:
 *         description: 对比统计数据获取成功
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
 *                     comparison:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           module:
 *                             type: string
 *                           value:
 *                             type: number
 *                           change:
 *                             type: number
 *                           trend:
 *                             type: string
 */
router.get('/comparison', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, modules, metric, _b, period, moduleList, comparisonData, error_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _a = req.query, modules = _a.modules, metric = _a.metric, _b = _a.period, period = _b === void 0 ? 'monthly' : _b;
                if (!modules || !metric) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '缺少必需的参数', 'BAD_REQUEST', 400)];
                }
                moduleList = modules.split(',');
                return [4 /*yield*/, getComparisonStatistics(moduleList, metric, period, req.user)];
            case 1:
                comparisonData = _c.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { comparison: comparisonData }, '对比统计数据获取成功')];
            case 2:
                error_2 = _c.sent();
                console.error('获取对比统计数据失败:', error_2);
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '获取对比统计数据失败', 'INTERNAL_ERROR', 500)];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/statistics/dashboard:
 *   get:
 *     summary: 获取仪表板统计数据
 *     description: 获取适用于仪表板显示的关键统计指标
 *     tags: [UnifiedStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         required: false
 *         description: 用户角色（自动从token获取）
 *         schema:
 *           type: string
 *           enum: [admin, principal, teacher, parent]
 *     responses:
 *       200:
 *         description: 仪表板统计数据获取成功
 */
router.get('/dashboard', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var role, dashboardData, error_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                role = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || 'admin';
                return [4 /*yield*/, getDashboardStatistics(role, req.user)];
            case 1:
                dashboardData = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, dashboardData, '仪表板统计数据获取成功')];
            case 2:
                error_3 = _b.sent();
                console.error('获取仪表板统计数据失败:', error_3);
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '获取仪表板统计数据失败', 'INTERNAL_ERROR', 500)];
            case 3: return [2 /*return*/];
        }
    });
}); });
// 统计处理函数
function getModuleStatistics(module, type, period, startDate, endDate, user) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // 根据模块分发到对应的统计逻辑
            switch (module) {
                case 'enrollment':
                    return [2 /*return*/, getEnrollmentStatistics(type, period, startDate, endDate)];
                case 'activities':
                    return [2 /*return*/, getActivitiesStatistics(type, period, startDate, endDate)];
                case 'dashboard':
                    return [2 /*return*/, getDashboardModuleStatistics(type, period, user)];
                case 'class':
                    return [2 /*return*/, getClassStatistics(type, period, startDate, endDate)];
                case 'teacher':
                    return [2 /*return*/, getTeacherStatistics(type, period, startDate, endDate)];
                case 'student':
                    return [2 /*return*/, getStudentStatistics(type, period, startDate, endDate)];
                case 'marketing':
                    return [2 /*return*/, getMarketingStatistics(type, period, startDate, endDate)];
                case 'ai':
                    return [2 /*return*/, getAiStatistics(type, period, startDate, endDate)];
                case 'system':
                    return [2 /*return*/, getSystemStatistics(type, period, startDate, endDate)];
                default:
                    throw new Error("\u4E0D\u652F\u6301\u7684\u7EDF\u8BA1\u6A21\u5757: ".concat(module));
            }
            return [2 /*return*/];
        });
    });
}
// 具体的统计实现函数（示例）
function getEnrollmentStatistics(type, period, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // 招生统计逻辑
            switch (type) {
                case 'overview':
                    return [2 /*return*/, {
                            totalApplications: 245,
                            approvedApplications: 198,
                            pendingApplications: 47,
                            conversionRate: 0.81,
                            period: period
                        }];
                case 'trend':
                    return [2 /*return*/, {
                            trends: [
                                { date: '2024-01', applications: 45, approved: 38 },
                                { date: '2024-02', applications: 52, approved: 41 },
                                { date: '2024-03', applications: 48, approved: 39 }
                            ],
                            period: period
                        }];
                default:
                    return [2 /*return*/, { message: "\u62DB\u751F\u7EDF\u8BA1\u7C7B\u578B ".concat(type, " \u7684\u8BE6\u7EC6\u5B9E\u73B0\u5F85\u6DFB\u52A0") }];
            }
            return [2 /*return*/];
        });
    });
}
function getActivitiesStatistics(type, period, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
        var whereClause, _a, overviewStats, ratingStats, stats, rating, participationStats, satisfactionStats, error_4;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 11, , 12]);
                    whereClause = {};
                    if (startDate && endDate) {
                        whereClause.startTime = (_b = {},
                            _b[sequelize_1.Op.between] = [startDate, endDate],
                            _b);
                    }
                    _a = type;
                    switch (_a) {
                        case 'overview': return [3 /*break*/, 1];
                        case 'participation': return [3 /*break*/, 4];
                        case 'satisfaction': return [3 /*break*/, 6];
                    }
                    return [3 /*break*/, 8];
                case 1: return [4 /*yield*/, init_1.sequelize.query("\n          SELECT\n            COUNT(*) as totalActivities,\n            SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as ongoingActivities,\n            SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as completedActivities,\n            SUM(registered_count) as totalRegistrations,\n            AVG(CASE WHEN registered_count > 0 THEN registered_count / capacity ELSE 0 END) as averageOccupancyRate\n          FROM activities\n          WHERE deleted_at IS NULL\n          ".concat(startDate ? "AND start_time >= '".concat(startDate, "'") : '', "\n          ").concat(endDate ? "AND end_time <= '".concat(endDate, "'") : '', "\n        "), { type: sequelize_1.QueryTypes.SELECT })];
                case 2:
                    overviewStats = (_c.sent())[0];
                    return [4 /*yield*/, init_1.sequelize.query("\n          SELECT AVG(overall_rating) as averageRating\n          FROM activity_evaluations ae\n          JOIN activities a ON ae.activity_id = a.id\n          WHERE ae.deleted_at IS NULL AND a.deleted_at IS NULL\n          ".concat(startDate ? "AND a.start_time >= '".concat(startDate, "'") : '', "\n          ").concat(endDate ? "AND a.end_time <= '".concat(endDate, "'") : '', "\n        "), { type: sequelize_1.QueryTypes.SELECT })];
                case 3:
                    ratingStats = (_c.sent())[0];
                    stats = (Array.isArray(overviewStats) ? overviewStats[0] : overviewStats) || {};
                    rating = (Array.isArray(ratingStats) ? ratingStats[0] : ratingStats) || {};
                    return [2 /*return*/, {
                            totalActivities: parseInt(stats.totalActivities) || 0,
                            ongoingActivities: parseInt(stats.ongoingActivities) || 0,
                            completedActivities: parseInt(stats.completedActivities) || 0,
                            totalRegistrations: parseInt(stats.totalRegistrations) || 0,
                            averageRating: parseFloat(rating.averageRating) || 0,
                            averageOccupancyRate: parseFloat(stats.averageOccupancyRate) || 0,
                            period: period
                        }];
                case 4: return [4 /*yield*/, init_1.sequelize.query("\n          SELECT\n            a.id,\n            a.title,\n            a.capacity,\n            a.registered_count,\n            a.checked_in_count,\n            ROUND(a.registered_count / a.capacity * 100, 2) as registrationRate,\n            ROUND(a.checked_in_count / a.registered_count * 100, 2) as attendanceRate\n          FROM activities a\n          WHERE a.deleted_at IS NULL\n          ".concat(startDate ? "AND a.start_time >= '".concat(startDate, "'") : '', "\n          ").concat(endDate ? "AND a.end_time <= '".concat(endDate, "'") : '', "\n          ORDER BY a.start_time DESC\n          LIMIT 10\n        "), { type: sequelize_1.QueryTypes.SELECT })];
                case 5:
                    participationStats = (_c.sent())[0];
                    return [2 /*return*/, {
                            participationData: participationStats || [],
                            period: period
                        }];
                case 6: return [4 /*yield*/, init_1.sequelize.query("\n          SELECT\n            a.title,\n            AVG(ae.overall_rating) as averageRating,\n            COUNT(ae.id) as evaluationCount,\n            SUM(CASE WHEN ae.overall_rating >= 4 THEN 1 ELSE 0 END) as positiveCount\n          FROM activities a\n          LEFT JOIN activity_evaluations ae ON a.id = ae.activity_id AND ae.deleted_at IS NULL\n          WHERE a.deleted_at IS NULL\n          ".concat(startDate ? "AND a.start_time >= '".concat(startDate, "'") : '', "\n          ").concat(endDate ? "AND a.end_time <= '".concat(endDate, "'") : '', "\n          GROUP BY a.id, a.title\n          HAVING COUNT(ae.id) > 0\n          ORDER BY averageRating DESC\n          LIMIT 10\n        "), { type: sequelize_1.QueryTypes.SELECT })];
                case 7:
                    satisfactionStats = (_c.sent())[0];
                    return [2 /*return*/, {
                            satisfactionData: satisfactionStats || [],
                            period: period
                        }];
                case 8: return [4 /*yield*/, getActivitiesStatistics('overview', period, startDate, endDate)];
                case 9: 
                // 默认返回概览数据
                return [2 /*return*/, _c.sent()];
                case 10: return [3 /*break*/, 12];
                case 11:
                    error_4 = _c.sent();
                    console.error('获取活动统计数据失败:', error_4);
                    // 发生错误时返回空数据，不使用硬编码
                    return [2 /*return*/, {
                            totalActivities: 0,
                            ongoingActivities: 0,
                            completedActivities: 0,
                            totalRegistrations: 0,
                            averageRating: 0,
                            error: '数据查询失败',
                            period: period
                        }];
                case 12: return [2 /*return*/];
            }
        });
    });
}
function getDashboardModuleStatistics(type, period, user) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // 仪表板模块统计
            return [2 /*return*/, {
                    keyMetrics: {
                        users: 1250,
                        revenue: 2850000,
                        satisfaction: 4.7,
                        growth: 0.12
                    },
                    period: period
                }];
        });
    });
}
function getClassStatistics(type, period, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // 班级统计逻辑
            return [2 /*return*/, {
                    totalClasses: 24,
                    activeClasses: 22,
                    averageClassSize: 25,
                    occupancyRate: 0.92,
                    period: period
                }];
        });
    });
}
function getTeacherStatistics(type, period, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // 教师统计逻辑
            return [2 /*return*/, {
                    totalTeachers: 80,
                    activeTeachers: 78,
                    averageExperience: 5.2,
                    satisfactionScore: 4.5,
                    period: period
                }];
        });
    });
}
function getStudentStatistics(type, period, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // 学生统计逻辑
            return [2 /*return*/, {
                    totalStudents: 1200,
                    newStudents: 45,
                    attendanceRate: 0.95,
                    graduationRate: 0.98,
                    period: period
                }];
        });
    });
}
function getMarketingStatistics(type, period, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // 营销统计逻辑
            return [2 /*return*/, {
                    campaigns: 15,
                    activeCampaigns: 5,
                    conversionRate: 0.23,
                    roi: 3.4,
                    period: period
                }];
        });
    });
}
function getAiStatistics(type, period, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // AI服务统计逻辑
            return [2 /*return*/, {
                    totalQueries: 2340,
                    successfulQueries: 2195,
                    averageResponseTime: 0.85,
                    userSatisfaction: 4.3,
                    period: period
                }];
        });
    });
}
function getSystemStatistics(type, period, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // 系统统计逻辑
            return [2 /*return*/, {
                    uptime: 0.999,
                    responseTime: 0.65,
                    errorRate: 0.001,
                    activeUsers: 234,
                    period: period
                }];
        });
    });
}
function getComparisonStatistics(modules, metric, period, user) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // 对比统计逻辑
            return [2 /*return*/, modules.map(function (module) { return ({
                    module: module,
                    value: Math.floor(Math.random() * 1000) + 100,
                    change: (Math.random() - 0.5) * 0.4,
                    trend: Math.random() > 0.5 ? 'up' : 'down'
                }); })];
        });
    });
}
function getDashboardStatistics(role, user) {
    return __awaiter(this, void 0, void 0, function () {
        var baseStats;
        return __generator(this, function (_a) {
            baseStats = {
                overview: {
                    totalUsers: 1250,
                    totalRevenue: 2850000,
                    satisfaction: 4.7,
                    growth: 0.12
                },
                charts: {
                    enrollment: { trend: 'up', value: 245 },
                    activities: { trend: 'up', value: 125 },
                    revenue: { trend: 'up', value: 2850000 }
                }
            };
            // 根据角色调整数据
            switch (role) {
                case 'principal':
                    return [2 /*return*/, __assign(__assign({}, baseStats), { principalSpecific: {
                                pendingApprovals: 12,
                                urgentTasks: 3,
                                staffMetrics: { satisfaction: 4.5, retention: 0.95 }
                            } })];
                case 'teacher':
                    return [2 /*return*/, {
                            overview: {
                                myClasses: 3,
                                myStudents: 75,
                                todayActivities: 2,
                                pendingTasks: 5
                            }
                        }];
                case 'parent':
                    return [2 /*return*/, {
                            overview: {
                                myChildren: 2,
                                upcomingActivities: 3,
                                notifications: 1,
                                payments: { due: 0, completed: 12 }
                            }
                        }];
                default:
                    return [2 /*return*/, baseStats];
            }
            return [2 /*return*/];
        });
    });
}
exports["default"] = router;
