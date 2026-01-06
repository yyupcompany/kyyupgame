"use strict";
/**
 * 招生中心控制器
 * 提供招生中心页面所需的聚合API接口
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
exports.EnrollmentCenterController = void 0;
var sequelize_1 = require("sequelize");
var apiResponse_1 = require("../utils/apiResponse");
var enrollment_plan_model_1 = require("../models/enrollment-plan.model");
var enrollment_application_model_1 = require("../models/enrollment-application.model");
var enrollment_consultation_model_1 = require("../models/enrollment-consultation.model");
var enrollment_consultation_service_1 = require("../services/enrollment/enrollment-consultation.service");
var EnrollmentCenterController = /** @class */ (function () {
    function EnrollmentCenterController() {
        this.consultationService = new enrollment_consultation_service_1.EnrollmentConsultationService();
    }
    /**
     * 获取招生中心概览数据
     * GET /api/enrollment/overview
     */
    EnrollmentCenterController.prototype.getOverview = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, timeRange, kindergartenId, timeFilter, baseWhere, _c, consultationStats, applicationStats, trialStats, chartData, quickStats, conversionRate, overview, error_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        _a = req.query, _b = _a.timeRange, timeRange = _b === void 0 ? 'month' : _b, kindergartenId = _a.kindergartenId;
                        timeFilter = this.getTimeFilter(timeRange);
                        baseWhere = kindergartenId ? { kindergartenId: Number(kindergartenId) } : {};
                        return [4 /*yield*/, Promise.all([
                                this.getConsultationStats(__assign(__assign({}, baseWhere), timeFilter)),
                                this.getApplicationStats(__assign(__assign({}, baseWhere), timeFilter)),
                                this.getTrialStats(__assign(__assign({}, baseWhere), timeFilter)),
                                this.getChartData(__assign(__assign({}, baseWhere), timeFilter)),
                                this.getQuickStats(baseWhere)
                            ])];
                    case 1:
                        _c = _d.sent(), consultationStats = _c[0], applicationStats = _c[1], trialStats = _c[2], chartData = _c[3], quickStats = _c[4];
                        conversionRate = this.calculateConversionRate(consultationStats.current, applicationStats.current);
                        console.log('📊 招生中心概览数据构建:', {
                            consultationStats: consultationStats,
                            applicationStats: applicationStats,
                            trialStats: trialStats,
                            chartData: chartData,
                            quickStats: quickStats,
                            hasChartData: !!chartData,
                            chartDataKeys: chartData ? Object.keys(chartData) : []
                        });
                        overview = {
                            statistics: {
                                totalConsultations: {
                                    value: consultationStats.current,
                                    trend: consultationStats.trend,
                                    trendText: '较上月'
                                },
                                applications: {
                                    value: applicationStats.current,
                                    trend: applicationStats.trend,
                                    trendText: '较上月'
                                },
                                trials: {
                                    value: trialStats.current,
                                    trend: trialStats.trend,
                                    trendText: '较上月'
                                },
                                conversionRate: {
                                    value: conversionRate.current,
                                    trend: conversionRate.trend,
                                    trendText: '较上月'
                                }
                            },
                            charts: chartData,
                            quickStats: quickStats
                        };
                        console.log('📊 最终概览数据结构:', {
                            hasStatistics: !!overview.statistics,
                            hasCharts: !!overview.charts,
                            hasQuickStats: !!overview.quickStats,
                            overviewKeys: Object.keys(overview)
                        });
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, overview, '获取概览数据成功')];
                    case 2:
                        error_1 = _d.sent();
                        console.error('获取概览数据失败:', error_1);
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '获取概览数据失败', 'INTERNAL_ERROR', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取招生计划列表
     * GET /api/enrollment/plans
     */
    EnrollmentCenterController.prototype.getPlans = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, page, _c, pageSize, search, year, semester, status_1, _d, sortBy, _e, sortOrder, where, offset, limit, _f, count, rows, data, result, error_2;
            var _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 2, , 3]);
                        console.log('🔄 开始获取招生计划列表...');
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, search = _a.search, year = _a.year, semester = _a.semester, status_1 = _a.status, _d = _a.sortBy, sortBy = _d === void 0 ? 'createdAt' : _d, _e = _a.sortOrder, sortOrder = _e === void 0 ? 'desc' : _e;
                        console.log('📋 查询参数:', { page: page, pageSize: pageSize, search: search, year: year, semester: semester, status: status_1, sortBy: sortBy, sortOrder: sortOrder });
                        where = {};
                        if (search) {
                            where.title = (_g = {}, _g[sequelize_1.Op.like] = "%".concat(search, "%"), _g);
                        }
                        if (year) {
                            where.year = Number(year);
                        }
                        if (semester) {
                            where.semester = semester;
                        }
                        if (status_1) {
                            where.status = status_1;
                        }
                        console.log('🔍 查询条件:', where);
                        offset = (Number(page) - 1) * Number(pageSize);
                        limit = Number(pageSize);
                        console.log('📄 分页参数:', { offset: offset, limit: limit });
                        // 检查模型是否正确初始化
                        if (!enrollment_plan_model_1.EnrollmentPlan) {
                            throw new Error('EnrollmentPlan 模型未正确初始化');
                        }
                        console.log('🔗 开始数据库查询...');
                        return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findAndCountAll({
                                where: where,
                                offset: offset,
                                limit: limit,
                                order: [[sortBy, sortOrder]],
                                include: [
                                    {
                                        association: 'applications',
                                        required: false,
                                        attributes: ['id', 'status']
                                    }
                                ]
                            })];
                    case 1:
                        _f = _h.sent(), count = _f.count, rows = _f.rows;
                        console.log('✅ 数据库查询成功:', { count: count, rowsLength: rows.length });
                        data = rows.map(function (plan) {
                            var _a;
                            var planData = plan.toJSON();
                            var appliedCount = ((_a = planData.applications) === null || _a === void 0 ? void 0 : _a.length) || 0;
                            var progress = planData.targetCount > 0
                                ? Math.round((appliedCount / planData.targetCount) * 100)
                                : 0;
                            return __assign(__assign({}, planData), { appliedCount: appliedCount, progress: progress });
                        });
                        result = {
                            data: data,
                            pagination: {
                                total: count,
                                page: Number(page),
                                pageSize: Number(pageSize),
                                totalPages: Math.ceil(count / Number(pageSize))
                            }
                        };
                        console.log('✅ 招生计划列表获取成功');
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, result, '获取计划列表成功')];
                    case 2:
                        error_2 = _h.sent();
                        console.error('❌ 获取计划列表失败 - 详细错误:', error_2);
                        console.error('❌ 错误堆栈:', error_2 instanceof Error ? error_2.stack : 'Unknown error');
                        // 检查是否是数据库连接问题
                        if (error_2 instanceof Error) {
                            if (error_2.message.includes('ECONNREFUSED') || error_2.message.includes('connect')) {
                                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '数据库连接失败', 'DATABASE_CONNECTION_ERROR', 500)];
                            }
                            if (error_2.message.includes('Table') && error_2.message.includes("doesn't exist")) {
                                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '数据库表不存在', 'TABLE_NOT_EXISTS', 500)];
                            }
                            if (error_2.message.includes('association')) {
                                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '模型关联配置错误', 'ASSOCIATION_ERROR', 500)];
                            }
                        }
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '获取计划列表失败', 'INTERNAL_ERROR', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取申请列表
     * GET /api/enrollment/applications
     */
    EnrollmentCenterController.prototype.getApplications = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, page, _c, pageSize, search, planId, status_2, applicationDateFrom, applicationDateTo, _d, sortBy, _e, sortOrder, where, offset, limit, _f, count, rows, data, result, error_3;
            var _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        _j.trys.push([0, 2, , 3]);
                        console.log('🔄 开始获取申请列表...');
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, search = _a.search, planId = _a.planId, status_2 = _a.status, applicationDateFrom = _a.applicationDateFrom, applicationDateTo = _a.applicationDateTo, _d = _a.sortBy, sortBy = _d === void 0 ? 'createdAt' : _d, _e = _a.sortOrder, sortOrder = _e === void 0 ? 'desc' : _e;
                        console.log('📋 查询参数:', { page: page, pageSize: pageSize, search: search, planId: planId, status: status_2, applicationDateFrom: applicationDateFrom, applicationDateTo: applicationDateTo, sortBy: sortBy, sortOrder: sortOrder });
                        where = {};
                        if (search) {
                            where[sequelize_1.Op.or] = [
                                { studentName: (_g = {}, _g[sequelize_1.Op.like] = "%".concat(search, "%"), _g) },
                                { parentName: (_h = {}, _h[sequelize_1.Op.like] = "%".concat(search, "%"), _h) }
                            ];
                        }
                        if (planId) {
                            where.planId = Number(planId);
                        }
                        if (status_2) {
                            where.status = status_2;
                        }
                        if (applicationDateFrom || applicationDateTo) {
                            where.createdAt = {}; // 使用 createdAt 替代 applicationDate
                            if (applicationDateFrom) {
                                where.createdAt[sequelize_1.Op.gte] = new Date(applicationDateFrom);
                            }
                            if (applicationDateTo) {
                                where.createdAt[sequelize_1.Op.lte] = new Date(applicationDateTo);
                            }
                        }
                        console.log('🔍 查询条件:', where);
                        offset = (Number(page) - 1) * Number(pageSize);
                        limit = Number(pageSize);
                        console.log('📄 分页参数:', { offset: offset, limit: limit });
                        // 检查模型是否正确初始化
                        if (!enrollment_application_model_1.EnrollmentApplication) {
                            throw new Error('EnrollmentApplication 模型未正确初始化');
                        }
                        console.log('🔗 开始数据库查询...');
                        return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.findAndCountAll({
                                where: where,
                                offset: offset,
                                limit: limit,
                                order: [[sortBy, sortOrder]],
                                include: [
                                    {
                                        association: 'plan',
                                        attributes: ['title'],
                                        required: false // 设置为 false，避免内连接导致的问题
                                    }
                                ]
                            })];
                    case 1:
                        _f = _j.sent(), count = _f.count, rows = _f.rows;
                        console.log('✅ 数据库查询成功:', { count: count, rowsLength: rows.length });
                        data = rows.map(function (application) {
                            var _a;
                            var appData = application.toJSON();
                            return __assign(__assign({}, appData), { planTitle: ((_a = appData.plan) === null || _a === void 0 ? void 0 : _a.title) || '未知计划', materialsCount: 0, interviewScheduled: false // TODO: 从面试表获取
                             });
                        });
                        result = {
                            data: data,
                            pagination: {
                                total: count,
                                page: Number(page),
                                pageSize: Number(pageSize),
                                totalPages: Math.ceil(count / Number(pageSize))
                            }
                        };
                        console.log('✅ 申请列表获取成功');
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, result, '获取申请列表成功')];
                    case 2:
                        error_3 = _j.sent();
                        console.error('❌ 获取申请列表失败 - 详细错误:', error_3);
                        console.error('❌ 错误堆栈:', error_3 instanceof Error ? error_3.stack : 'Unknown error');
                        // 检查是否是数据库连接问题
                        if (error_3 instanceof Error) {
                            if (error_3.message.includes('ECONNREFUSED') || error_3.message.includes('connect')) {
                                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '数据库连接失败', 'DATABASE_CONNECTION_ERROR', 500)];
                            }
                            if (error_3.message.includes('Table') && error_3.message.includes("doesn't exist")) {
                                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '数据库表不存在', 'TABLE_NOT_EXISTS', 500)];
                            }
                            if (error_3.message.includes('association')) {
                                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '模型关联配置错误', 'ASSOCIATION_ERROR', 500)];
                            }
                        }
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '获取申请列表失败', 'INTERNAL_ERROR', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取咨询统计数据
     * GET /api/enrollment/consultations/statistics
     */
    EnrollmentCenterController.prototype.getConsultationStatistics = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var today, startOfDay, startOfMonth, _a, todayConsultations, pendingFollowUp, monthlyConversions, sourceAnalysis, statusDistribution, averageResponseTime, statistics, error_4;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        today = new Date();
                        startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                        return [4 /*yield*/, Promise.all([
                                // 今日咨询
                                enrollment_consultation_model_1.EnrollmentConsultation.count({
                                    where: {
                                        createdAt: (_b = {}, _b[sequelize_1.Op.gte] = startOfDay, _b)
                                    }
                                }),
                                // 待跟进 (followupStatus: 2:跟进中)
                                enrollment_consultation_model_1.EnrollmentConsultation.count({
                                    where: {
                                        followupStatus: 2
                                    }
                                }),
                                // 本月转化 (followupStatus: 3:已转化)
                                enrollment_consultation_model_1.EnrollmentConsultation.count({
                                    where: {
                                        followupStatus: 3,
                                        createdAt: (_c = {}, _c[sequelize_1.Op.gte] = startOfMonth, _c)
                                    }
                                }),
                                // 来源分析 (模拟数据)
                                Promise.resolve([
                                    { source: '官网', count: 45, conversionRate: 68.5 },
                                    { source: '微信', count: 32, conversionRate: 72.1 },
                                    { source: '电话', count: 28, conversionRate: 65.3 },
                                    { source: '推荐', count: 15, conversionRate: 85.2 }
                                ]),
                                // 状态分布 (模拟数据)
                                Promise.resolve([
                                    { status: '新咨询', count: 23, percentage: 35.2 },
                                    { status: '跟进中', count: 28, percentage: 42.8 },
                                    { status: '已转化', count: 12, percentage: 18.3 },
                                    { status: '已流失', count: 2, percentage: 3.7 }
                                ])
                            ])];
                    case 1:
                        _a = _d.sent(), todayConsultations = _a[0], pendingFollowUp = _a[1], monthlyConversions = _a[2], sourceAnalysis = _a[3], statusDistribution = _a[4];
                        averageResponseTime = 2.5;
                        statistics = {
                            todayConsultations: todayConsultations,
                            pendingFollowUp: pendingFollowUp,
                            monthlyConversions: monthlyConversions,
                            averageResponseTime: averageResponseTime,
                            sourceAnalysis: sourceAnalysis,
                            statusDistribution: statusDistribution
                        };
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, statistics, '获取咨询统计成功')];
                    case 2:
                        error_4 = _d.sent();
                        console.error('获取咨询统计失败:', error_4);
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '获取咨询统计失败', 'INTERNAL_ERROR', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取咨询列表
     * GET /api/enrollment/consultations
     */
    EnrollmentCenterController.prototype.getConsultations = function (req, res) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var userInfo, consultations, error_5;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        console.log('🔍 获取咨询列表请求参数:', req.query);
                        console.log('🔐 当前用户信息:', { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id, role: (_b = req.user) === null || _b === void 0 ? void 0 : _b.role });
                        userInfo = req.user ? {
                            id: req.user.id,
                            role: ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) || 'admin'
                        } : undefined;
                        return [4 /*yield*/, this.consultationService.getConsultationList(req.query, userInfo)];
                    case 1:
                        consultations = _d.sent();
                        console.log('✅ 咨询列表数据获取成功:', consultations);
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, consultations, '获取咨询列表成功')];
                    case 2:
                        error_5 = _d.sent();
                        console.error('获取咨询列表失败:', error_5);
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '获取咨询列表失败', 'INTERNAL_ERROR', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 私有方法 ====================
    /**
     * 获取时间过滤条件
     */
    EnrollmentCenterController.prototype.getTimeFilter = function (timeRange) {
        var _a;
        var now = new Date();
        var startDate = new Date();
        switch (timeRange) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(now.getMonth() - 1);
        }
        return {
            createdAt: (_a = {},
                _a[sequelize_1.Op.gte] = startDate,
                _a[sequelize_1.Op.lte] = now,
                _a)
        };
    };
    /**
     * 获取咨询统计
     */
    EnrollmentCenterController.prototype.getConsultationStats = function (where) {
        return __awaiter(this, void 0, void 0, function () {
            var current, previousWhere, range, previous, trend;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.count({ where: where })];
                    case 1:
                        current = _b.sent();
                        previousWhere = __assign({}, where);
                        if (previousWhere.createdAt) {
                            range = previousWhere.createdAt[sequelize_1.Op.lte].getTime() - previousWhere.createdAt[sequelize_1.Op.gte].getTime();
                            previousWhere.createdAt = (_a = {},
                                _a[sequelize_1.Op.gte] = new Date(previousWhere.createdAt[sequelize_1.Op.gte].getTime() - range),
                                _a[sequelize_1.Op.lte] = previousWhere.createdAt[sequelize_1.Op.gte],
                                _a);
                        }
                        return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.count({ where: previousWhere })];
                    case 2:
                        previous = _b.sent();
                        trend = previous > 0 ? ((current - previous) / previous) * 100 : 0;
                        return [2 /*return*/, { current: current, previous: previous, trend: Math.round(trend * 10) / 10 }];
                }
            });
        });
    };
    /**
     * 获取申请统计
     */
    EnrollmentCenterController.prototype.getApplicationStats = function (where) {
        return __awaiter(this, void 0, void 0, function () {
            var current, previousWhere, range, previous, trend;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.count({ where: where })];
                    case 1:
                        current = _b.sent();
                        previousWhere = __assign({}, where);
                        if (previousWhere.createdAt) {
                            range = previousWhere.createdAt[sequelize_1.Op.lte].getTime() - previousWhere.createdAt[sequelize_1.Op.gte].getTime();
                            previousWhere.createdAt = (_a = {},
                                _a[sequelize_1.Op.gte] = new Date(previousWhere.createdAt[sequelize_1.Op.gte].getTime() - range),
                                _a[sequelize_1.Op.lte] = previousWhere.createdAt[sequelize_1.Op.gte],
                                _a);
                        }
                        return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.count({ where: previousWhere })];
                    case 2:
                        previous = _b.sent();
                        trend = previous > 0 ? ((current - previous) / previous) * 100 : 0;
                        return [2 /*return*/, { current: current, previous: previous, trend: Math.round(trend * 10) / 10 }];
                }
            });
        });
    };
    /**
     * 获取试听统计
     */
    EnrollmentCenterController.prototype.getTrialStats = function (where) {
        return __awaiter(this, void 0, void 0, function () {
            var current, previousWhere, range, previous, trend;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.count({
                            where: __assign(__assign({}, where), { status: 'trial' // 试听状态
                             })
                        })];
                    case 1:
                        current = _b.sent();
                        previousWhere = __assign({}, where);
                        if (previousWhere.createdAt) {
                            range = previousWhere.createdAt[sequelize_1.Op.lte].getTime() - previousWhere.createdAt[sequelize_1.Op.gte].getTime();
                            previousWhere.createdAt = (_a = {},
                                _a[sequelize_1.Op.gte] = new Date(previousWhere.createdAt[sequelize_1.Op.gte].getTime() - range),
                                _a[sequelize_1.Op.lte] = previousWhere.createdAt[sequelize_1.Op.gte],
                                _a);
                        }
                        return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.count({
                                where: __assign(__assign({}, previousWhere), { status: 'trial' })
                            })];
                    case 2:
                        previous = _b.sent();
                        trend = previous > 0 ? ((current - previous) / previous) * 100 : 0;
                        return [2 /*return*/, { current: current, previous: previous, trend: Math.round(trend * 10) / 10 }];
                }
            });
        });
    };
    /**
     * 计算转化率
     */
    EnrollmentCenterController.prototype.calculateConversionRate = function (consultations, applications) {
        var current = consultations > 0 ? (applications / consultations) * 100 : 0;
        var trend = 3.2; // 模拟趋势数据
        return {
            current: Math.round(current * 10) / 10,
            trend: trend
        };
    };
    /**
     * 获取图表数据
     */
    EnrollmentCenterController.prototype.getChartData = function (where) {
        return __awaiter(this, void 0, void 0, function () {
            var months, consultationData, applicationData, i, date, monthStart, monthEnd, consultationCount, applicationCount, sourceChannels, sourceConsultationData, sourceConversionData, _i, sourceChannels_1, source, consultationCount, conversionCount, error_6;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 11, , 12]);
                        months = [];
                        consultationData = [];
                        applicationData = [];
                        i = 5;
                        _c.label = 1;
                    case 1:
                        if (!(i >= 0)) return [3 /*break*/, 5];
                        date = new Date();
                        date.setMonth(date.getMonth() - i);
                        monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
                        monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                        months.push("".concat(date.getMonth() + 1, "\u6708"));
                        return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.count({
                                where: __assign(__assign({}, where), { createdAt: (_a = {},
                                        _a[sequelize_1.Op.gte] = monthStart,
                                        _a[sequelize_1.Op.lte] = monthEnd,
                                        _a) })
                            })];
                    case 2:
                        consultationCount = _c.sent();
                        return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.count({
                                where: __assign(__assign({}, where), { createdAt: (_b = {},
                                        _b[sequelize_1.Op.gte] = monthStart,
                                        _b[sequelize_1.Op.lte] = monthEnd,
                                        _b) })
                            })];
                    case 3:
                        applicationCount = _c.sent();
                        consultationData.push(consultationCount);
                        applicationData.push(applicationCount);
                        _c.label = 4;
                    case 4:
                        i--;
                        return [3 /*break*/, 1];
                    case 5:
                        sourceChannels = ['官网', '微信', '电话', '推荐', '其他'];
                        sourceConsultationData = [];
                        sourceConversionData = [];
                        _i = 0, sourceChannels_1 = sourceChannels;
                        _c.label = 6;
                    case 6:
                        if (!(_i < sourceChannels_1.length)) return [3 /*break*/, 10];
                        source = sourceChannels_1[_i];
                        return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.count({
                                where: __assign(__assign({}, where), { source: source })
                            })];
                    case 7:
                        consultationCount = _c.sent();
                        return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.count({
                                where: __assign(__assign({}, where), { source: source })
                            })];
                    case 8:
                        conversionCount = _c.sent();
                        sourceConsultationData.push(consultationCount);
                        sourceConversionData.push(conversionCount);
                        _c.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 6];
                    case 10: return [2 /*return*/, {
                            enrollmentTrend: {
                                categories: months,
                                series: [
                                    {
                                        name: '咨询量',
                                        data: consultationData
                                    },
                                    {
                                        name: '申请量',
                                        data: applicationData
                                    }
                                ]
                            },
                            sourceChannel: {
                                categories: sourceChannels,
                                series: [
                                    {
                                        name: '咨询量',
                                        data: sourceConsultationData
                                    },
                                    {
                                        name: '转化量',
                                        data: sourceConversionData
                                    }
                                ]
                            }
                        }];
                    case 11:
                        error_6 = _c.sent();
                        console.error('获取图表数据失败:', error_6);
                        // 返回默认数据作为备用
                        return [2 /*return*/, {
                                enrollmentTrend: {
                                    categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
                                    series: [
                                        {
                                            name: '咨询量',
                                            data: [120, 132, 101, 134, 90, 230]
                                        },
                                        {
                                            name: '申请量',
                                            data: [80, 98, 75, 95, 65, 156]
                                        }
                                    ]
                                },
                                sourceChannel: {
                                    categories: ['官网', '微信', '电话', '推荐', '其他'],
                                    series: [
                                        {
                                            name: '咨询量',
                                            data: [45, 32, 28, 15, 8]
                                        },
                                        {
                                            name: '转化量',
                                            data: [31, 23, 18, 13, 5]
                                        }
                                    ]
                                }
                            }];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取快速统计
     */
    EnrollmentCenterController.prototype.getQuickStats = function (where) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, pendingApplications, todayConsultations;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            enrollment_application_model_1.EnrollmentApplication.count({
                                where: __assign(__assign({}, where), { status: 'pending' })
                            }),
                            enrollment_consultation_model_1.EnrollmentConsultation.count({
                                where: __assign(__assign({}, where), { createdAt: (_b = {},
                                        _b[sequelize_1.Op.gte] = new Date(new Date().setHours(0, 0, 0, 0)),
                                        _b) })
                            })
                        ])];
                    case 1:
                        _a = _c.sent(), pendingApplications = _a[0], todayConsultations = _a[1];
                        return [2 /*return*/, {
                                pendingApplications: pendingApplications,
                                todayConsultations: todayConsultations,
                                upcomingInterviews: 8 // 模拟数据
                            }];
                }
            });
        });
    };
    return EnrollmentCenterController;
}());
exports.EnrollmentCenterController = EnrollmentCenterController;
