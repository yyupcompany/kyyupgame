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
exports.AIAnalysisController = void 0;
var apiResponse_1 = require("../utils/apiResponse");
var async_handler_1 = require("../middlewares/async-handler");
var ai_analysis_service_1 = require("../services/ai-analysis.service");
var enrollment_application_model_1 = require("../models/enrollment-application.model");
var activity_model_1 = require("../models/activity.model");
var teacher_model_1 = require("../models/teacher.model");
var student_model_1 = require("../models/student.model");
var sequelize_1 = require("sequelize");
/**
 * AI智能分析控制器
 * 基于豆包1.6模型进行数据分析
 */
var AIAnalysisController = /** @class */ (function () {
    function AIAnalysisController() {
        var _this = this;
        /**
         * 招生趋势分析
         * POST /api/ai/analysis/enrollment-trends
         */
        this.analyzeEnrollmentTrends = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, timeRange, _c, includeSeasonality, _d, includePrediction, endDate, startDate, enrollmentData, monthlyStats, sourceStats, ageStats, analysisPrompt, aiAnalysis, aiError_1, analysisResult, error_1, errorMessage, detailedErrorMessage;
            var _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = req.body, _b = _a.timeRange, timeRange = _b === void 0 ? '6months' : _b, _c = _a.includeSeasonality, includeSeasonality = _c === void 0 ? true : _c, _d = _a.includePrediction, includePrediction = _d === void 0 ? true : _d;
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 7, , 8]);
                        console.log('🔍 开始招生趋势分析，参数:', { timeRange: timeRange, includeSeasonality: includeSeasonality, includePrediction: includePrediction });
                        endDate = new Date();
                        startDate = new Date();
                        switch (timeRange) {
                            case '3months':
                                startDate.setMonth(endDate.getMonth() - 3);
                                break;
                            case '6months':
                                startDate.setMonth(endDate.getMonth() - 6);
                                break;
                            case '1year':
                                startDate.setFullYear(endDate.getFullYear() - 1);
                                break;
                            default:
                                startDate.setMonth(endDate.getMonth() - 6);
                        }
                        return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.findAll({
                                where: {
                                    createdAt: (_e = {},
                                        _e[sequelize_1.Op.between] = [startDate, endDate],
                                        _e)
                                },
                                attributes: ['id', 'status', 'createdAt', 'birthDate', 'applicationSource'],
                                order: [['createdAt', 'ASC']]
                            })];
                    case 2:
                        enrollmentData = _f.sent();
                        // 2. 数据预处理
                        console.log('📊 获取到招生数据:', enrollmentData.length, '条记录');
                        monthlyStats = this.processEnrollmentDataByMonth(enrollmentData);
                        sourceStats = this.processEnrollmentDataBySource(enrollmentData);
                        ageStats = this.processEnrollmentDataByAge(enrollmentData);
                        console.log('📈 数据统计结果:', { monthlyStats: monthlyStats, sourceStats: sourceStats, ageStats: ageStats });
                        analysisPrompt = "\n\u4F5C\u4E3A\u5E7C\u513F\u56ED\u62DB\u751F\u6570\u636E\u5206\u6790\u4E13\u5BB6\uFF0C\u8BF7\u5206\u6790\u4EE5\u4E0B\u62DB\u751F\u6570\u636E\uFF1A\n\n\u65F6\u95F4\u8303\u56F4\uFF1A".concat(timeRange, "\n\u6708\u5EA6\u7EDF\u8BA1\uFF1A").concat(JSON.stringify(monthlyStats), "\n\u6765\u6E90\u7EDF\u8BA1\uFF1A").concat(JSON.stringify(sourceStats), "\n\u5E74\u9F84\u5206\u5E03\uFF1A").concat(JSON.stringify(ageStats), "\n\n\u8BF7\u63D0\u4F9B\u4EE5\u4E0B\u5206\u6790\uFF1A\n1. \u62DB\u751F\u8D8B\u52BF\u5206\u6790\uFF08\u589E\u957F/\u4E0B\u964D\u8D8B\u52BF\u3001\u5B63\u8282\u6027\u7279\u5F81\uFF09\n2. \u6765\u6E90\u6E20\u9053\u6548\u679C\u8BC4\u4F30\n3. \u5E74\u9F84\u6BB5\u504F\u597D\u5206\u6790\n4. \u672A\u67653\u4E2A\u6708\u62DB\u751F\u9884\u6D4B\n5. \u4F18\u5316\u5EFA\u8BAE\n\n\u8BF7\u4EE5JSON\u683C\u5F0F\u8FD4\u56DE\u7ED3\u6784\u5316\u5206\u6790\u7ED3\u679C\u3002\n");
                        aiAnalysis = void 0;
                        _f.label = 3;
                    case 3:
                        _f.trys.push([3, 5, , 6]);
                        console.log('🤖 准备调用AI服务进行分析...');
                        return [4 /*yield*/, this.aiAnalysisService.analyzeWithDoubao(analysisPrompt, {
                                type: 'enrollment_trends',
                                context: 'kindergarten_management',
                                requireStructured: true
                            })];
                    case 4:
                        aiAnalysis = _f.sent();
                        console.log('✅ AI分析成功完成');
                        return [3 /*break*/, 6];
                    case 5:
                        aiError_1 = _f.sent();
                        console.warn('❌ AI服务调用失败，错误信息:', aiError_1.message);
                        console.warn('🔄 使用fallback分析替代...');
                        // 当AI服务不可用时提供fallback响应
                        try {
                            aiAnalysis = this.generateFallbackEnrollmentAnalysis(monthlyStats, sourceStats, ageStats);
                            console.log('✅ fallback分析结果生成成功');
                        }
                        catch (fallbackError) {
                            console.error('❌ fallback分析生成失败:', fallbackError.message);
                            throw fallbackError;
                        }
                        return [3 /*break*/, 6];
                    case 6:
                        analysisResult = {
                            id: Date.now(),
                            title: '招生趋势分析报告',
                            type: 'enrollment',
                            summary: aiAnalysis.summary || '基于过去数据分析，提供招生趋势洞察和预测',
                            createdAt: new Date().toISOString(),
                            data: {
                                rawData: {
                                    monthlyStats: monthlyStats,
                                    sourceStats: sourceStats,
                                    ageStats: ageStats,
                                    totalApplications: enrollmentData.length
                                },
                                aiAnalysis: aiAnalysis,
                                timeRange: timeRange,
                                parameters: { includeSeasonality: includeSeasonality, includePrediction: includePrediction }
                            }
                        };
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, analysisResult, 'AI招生趋势分析完成')];
                    case 7:
                        error_1 = _f.sent();
                        console.error('❌ 招生趋势分析失败:', error_1);
                        errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                        detailedErrorMessage = "\u274C \u62DB\u751F\u8D8B\u52BF\u5206\u6790\u5931\u8D25\n\n\uD83D\uDD0D \u9519\u8BEF\u8BE6\u60C5\uFF1A".concat(errorMessage, "\n\n\uD83D\uDCA1 \u8FD9\u662F\u771F\u5B9E\u7684\u9519\u8BEF\u4FE1\u606F\uFF0C\u8BF7\u68C0\u67E5\u6570\u636E\u5E93\u8FDE\u63A5\u6216\u6570\u636E\u5B8C\u6574\u6027\u3002\n\n\u23F0 \u53D1\u751F\u65F6\u95F4\uFF1A").concat(new Date().toLocaleString());
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, detailedErrorMessage, 'ANALYSIS_ERROR', 500)];
                    case 8: return [2 /*return*/];
                }
            });
        }); });
        /**
         * 活动效果分析
         * POST /api/ai/analysis/activity-effectiveness
         */
        this.analyzeActivityEffectiveness = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, timeRange, _c, includeParticipation, _d, includeSatisfaction, endDate, startDate, activities, activityStats, participationRates, typeDistribution, analysisPrompt, aiAnalysis, aiError_2, analysisResult, error_2;
            var _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = req.body, _b = _a.timeRange, timeRange = _b === void 0 ? '3months' : _b, _c = _a.includeParticipation, includeParticipation = _c === void 0 ? true : _c, _d = _a.includeSatisfaction, includeSatisfaction = _d === void 0 ? true : _d;
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 7, , 8]);
                        endDate = new Date();
                        startDate = new Date();
                        startDate.setMonth(endDate.getMonth() - (timeRange === '3months' ? 3 : 6));
                        return [4 /*yield*/, activity_model_1.Activity.findAll({
                                where: {
                                    createdAt: (_e = {},
                                        _e[sequelize_1.Op.between] = [startDate, endDate],
                                        _e)
                                },
                                attributes: ['id', 'title', 'activityType', 'status', 'capacity', 'registeredCount', 'createdAt'],
                                order: [['createdAt', 'DESC']]
                            })];
                    case 2:
                        activities = _f.sent();
                        activityStats = this.processActivityData(activities);
                        participationRates = this.calculateParticipationRates(activities);
                        typeDistribution = this.getActivityTypeDistribution(activities);
                        analysisPrompt = "\n\u4F5C\u4E3A\u5E7C\u513F\u56ED\u6D3B\u52A8\u6548\u679C\u5206\u6790\u4E13\u5BB6\uFF0C\u8BF7\u5206\u6790\u4EE5\u4E0B\u6D3B\u52A8\u6570\u636E\uFF1A\n\n\u6D3B\u52A8\u7EDF\u8BA1\uFF1A".concat(JSON.stringify(activityStats), "\n\u53C2\u4E0E\u7387\u6570\u636E\uFF1A").concat(JSON.stringify(participationRates), "\n\u6D3B\u52A8\u7C7B\u578B\u5206\u5E03\uFF1A").concat(JSON.stringify(typeDistribution), "\n\n\u8BF7\u63D0\u4F9B\uFF1A\n1. \u6D3B\u52A8\u53C2\u4E0E\u5EA6\u5206\u6790\n2. \u70ED\u95E8\u6D3B\u52A8\u7C7B\u578B\u8BC6\u522B\n3. \u6D3B\u52A8\u6548\u679C\u8BC4\u4F30\n4. \u6539\u8FDB\u5EFA\u8BAE\n5. \u672A\u6765\u6D3B\u52A8\u89C4\u5212\u5EFA\u8BAE\n\n\u8FD4\u56DEJSON\u683C\u5F0F\u7684\u7ED3\u6784\u5316\u5206\u6790\u3002\n");
                        aiAnalysis = void 0;
                        _f.label = 3;
                    case 3:
                        _f.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.aiAnalysisService.analyzeWithDoubao(analysisPrompt, {
                                type: 'activity_effectiveness',
                                context: 'kindergarten_management',
                                requireStructured: true
                            })];
                    case 4:
                        aiAnalysis = _f.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        aiError_2 = _f.sent();
                        console.warn('AI服务不可用，使用fallback分析:', aiError_2.message);
                        aiAnalysis = this.generateFallbackActivityAnalysis(activities.length);
                        console.log('✅ 已生成活动分析fallback结果');
                        return [3 /*break*/, 6];
                    case 6:
                        analysisResult = {
                            id: Date.now(),
                            title: '活动效果分析报告',
                            type: 'activity',
                            summary: aiAnalysis.summary || '活动参与度和效果的深度分析',
                            createdAt: new Date().toISOString(),
                            data: {
                                rawData: {
                                    activityStats: activityStats,
                                    participationRates: participationRates,
                                    typeDistribution: typeDistribution,
                                    totalActivities: activities.length
                                },
                                aiAnalysis: aiAnalysis,
                                timeRange: timeRange,
                                parameters: { includeParticipation: includeParticipation, includeSatisfaction: includeSatisfaction }
                            }
                        };
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, analysisResult, 'AI活动效果分析完成')];
                    case 7:
                        error_2 = _f.sent();
                        console.error('活动效果分析失败:', error_2);
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '分析失败，请稍后重试', 'ANALYSIS_ERROR', 500)];
                    case 8: return [2 /*return*/];
                }
            });
        }); });
        /**
         * 绩效预测分析
         * POST /api/ai/analysis/performance-prediction
         */
        this.analyzePerformancePrediction = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, timeRange, _c, includeTeachers, _d, includeStudents, teachers, _e, students, _f, teacherStats, studentStats, analysisPrompt, aiAnalysis, aiError_3, analysisResult, error_3;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _a = req.body, _b = _a.timeRange, timeRange = _b === void 0 ? '1year' : _b, _c = _a.includeTeachers, includeTeachers = _c === void 0 ? true : _c, _d = _a.includeStudents, includeStudents = _d === void 0 ? true : _d;
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 12, , 13]);
                        if (!includeTeachers) return [3 /*break*/, 3];
                        return [4 /*yield*/, teacher_model_1.Teacher.findAll({
                                attributes: ['id', 'position', 'teachingAge', 'createdAt'],
                                limit: 50
                            })];
                    case 2:
                        _e = _g.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _e = [];
                        _g.label = 4;
                    case 4:
                        teachers = _e;
                        if (!includeStudents) return [3 /*break*/, 6];
                        return [4 /*yield*/, student_model_1.Student.findAll({
                                attributes: ['id', 'name', 'birthDate', 'classId', 'enrollmentDate'],
                                limit: 100
                            })];
                    case 5:
                        _f = _g.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _f = [];
                        _g.label = 7;
                    case 7:
                        students = _f;
                        teacherStats = this.processTeacherData(teachers);
                        studentStats = this.processStudentData(students);
                        analysisPrompt = "\n\u4F5C\u4E3A\u6559\u80B2\u7EE9\u6548\u5206\u6790\u4E13\u5BB6\uFF0C\u8BF7\u5206\u6790\u4EE5\u4E0B\u6570\u636E\uFF1A\n\n\u6559\u5E08\u7EDF\u8BA1\uFF1A".concat(JSON.stringify(teacherStats), "\n\u5B66\u751F\u7EDF\u8BA1\uFF1A").concat(JSON.stringify(studentStats), "\n\n\u8BF7\u63D0\u4F9B\uFF1A\n1. \u6559\u5E08\u7EE9\u6548\u8D8B\u52BF\u9884\u6D4B\n2. \u5B66\u751F\u53D1\u5C55\u6F5C\u529B\u8BC4\u4F30\n3. \u5E08\u751F\u6BD4\u4F8B\u4F18\u5316\u5EFA\u8BAE\n4. \u7EE9\u6548\u63D0\u5347\u7B56\u7565\n5. \u98CE\u9669\u9884\u8B66\n\n\u8FD4\u56DEJSON\u683C\u5F0F\u7684\u7ED3\u6784\u5316\u5206\u6790\u3002\n");
                        aiAnalysis = void 0;
                        _g.label = 8;
                    case 8:
                        _g.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, this.aiAnalysisService.analyzeWithDoubao(analysisPrompt, {
                                type: 'performance_prediction',
                                context: 'kindergarten_management',
                                requireStructured: true
                            })];
                    case 9:
                        aiAnalysis = _g.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        aiError_3 = _g.sent();
                        console.warn('AI服务不可用，使用fallback分析:', aiError_3.message);
                        aiAnalysis = this.generateFallbackPerformanceAnalysis();
                        console.log('✅ 已生成绩效预测fallback结果');
                        return [3 /*break*/, 11];
                    case 11:
                        analysisResult = {
                            id: Date.now(),
                            title: '绩效预测分析报告',
                            type: 'performance',
                            summary: aiAnalysis.summary || '基于数据的绩效预测和优化建议',
                            createdAt: new Date().toISOString(),
                            data: {
                                rawData: {
                                    teacherStats: teacherStats,
                                    studentStats: studentStats,
                                    totalTeachers: teachers.length,
                                    totalStudents: students.length
                                },
                                aiAnalysis: aiAnalysis,
                                timeRange: timeRange,
                                parameters: { includeTeachers: includeTeachers, includeStudents: includeStudents }
                            }
                        };
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, analysisResult, 'AI绩效预测分析完成')];
                    case 12:
                        error_3 = _g.sent();
                        console.error('绩效预测分析失败:', error_3);
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '分析失败，请稍后重试', 'ANALYSIS_ERROR', 500)];
                    case 13: return [2 /*return*/];
                }
            });
        }); });
        /**
         * 风险评估分析
         * POST /api/ai/analysis/risk-assessment
         */
        this.analyzeRiskAssessment = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, riskTypes, _c, severity, riskData, analysisPrompt, aiAnalysis, aiError_4, analysisResult, error_4;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = req.body, _b = _a.riskTypes, riskTypes = _b === void 0 ? ['enrollment', 'financial', 'operational'] : _b, _c = _a.severity, severity = _c === void 0 ? 'all' : _c;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, this.collectRiskData(riskTypes)];
                    case 2:
                        riskData = _d.sent();
                        analysisPrompt = "\n\u4F5C\u4E3A\u98CE\u9669\u7BA1\u7406\u4E13\u5BB6\uFF0C\u8BF7\u5206\u6790\u4EE5\u4E0B\u5E7C\u513F\u56ED\u8FD0\u8425\u6570\u636E\uFF1A\n\n\u98CE\u9669\u6570\u636E\uFF1A".concat(JSON.stringify(riskData), "\n\u5173\u6CE8\u98CE\u9669\u7C7B\u578B\uFF1A").concat(riskTypes.join(', '), "\n\n\u8BF7\u63D0\u4F9B\uFF1A\n1. \u5404\u7C7B\u98CE\u9669\u8BC4\u4F30\uFF08\u9AD8/\u4E2D/\u4F4E\u98CE\u9669\uFF09\n2. \u6F5C\u5728\u98CE\u9669\u56E0\u7D20\u8BC6\u522B\n3. \u98CE\u9669\u5F71\u54CD\u7A0B\u5EA6\u5206\u6790\n4. \u98CE\u9669\u7F13\u89E3\u7B56\u7565\n5. \u9884\u8B66\u6307\u6807\u5EFA\u8BAE\n\n\u8FD4\u56DEJSON\u683C\u5F0F\u7684\u7ED3\u6784\u5316\u98CE\u9669\u8BC4\u4F30\u62A5\u544A\u3002\n");
                        aiAnalysis = void 0;
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.aiAnalysisService.analyzeWithDoubao(analysisPrompt, {
                                type: 'risk_assessment',
                                context: 'kindergarten_management',
                                requireStructured: true
                            })];
                    case 4:
                        aiAnalysis = _d.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        aiError_4 = _d.sent();
                        console.warn('AI服务不可用，使用fallback分析:', aiError_4.message);
                        aiAnalysis = this.generateFallbackRiskAnalysis();
                        console.log('✅ 已生成风险评估fallback结果');
                        return [3 /*break*/, 6];
                    case 6:
                        analysisResult = {
                            id: Date.now(),
                            title: '风险评估分析报告',
                            type: 'risk',
                            summary: aiAnalysis.summary || '全面的风险评估和预警分析',
                            createdAt: new Date().toISOString(),
                            data: {
                                rawData: riskData,
                                aiAnalysis: aiAnalysis,
                                riskTypes: riskTypes,
                                parameters: { severity: severity }
                            }
                        };
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, analysisResult, 'AI风险评估分析完成')];
                    case 7:
                        error_4 = _d.sent();
                        console.error('风险评估分析失败:', error_4);
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '分析失败，请稍后重试', 'ANALYSIS_ERROR', 500)];
                    case 8: return [2 /*return*/];
                }
            });
        }); });
        this.aiAnalysisService = new ai_analysis_service_1.AIAnalysisService();
    }
    // 生成活动效果分析的fallback响应
    AIAnalysisController.prototype.generateFallbackActivityAnalysis = function (activityCount) {
        return {
            summary: "\u57FA\u4E8E".concat(activityCount, "\u4E2A\u6D3B\u52A8\u7684\u57FA\u7840\u6570\u636E\u5206\u6790\u3002\u7531\u4E8EAI\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u63D0\u4F9B\u57FA\u7840\u5206\u6790\u7ED3\u679C\u3002"),
            insights: [
                {
                    title: '活动数量概览',
                    description: "\u5F53\u524D\u5171\u6709".concat(activityCount, "\u4E2A\u6D3B\u52A8\u8BB0\u5F55"),
                    importance: 'high',
                    category: 'trend'
                },
                {
                    title: '活动管理建议',
                    description: '建议定期评估活动效果，收集参与者反馈',
                    importance: 'medium',
                    category: 'recommendation'
                }
            ],
            trends: {
                direction: '稳定',
                confidence: '中',
                factors: ['数据量有限', '需要更多参与度数据']
            },
            recommendations: [
                {
                    action: '建立活动效果评估机制',
                    priority: 'high',
                    timeline: '短期',
                    expectedImpact: '提高活动质量和参与度'
                }
            ],
            risks: [
                {
                    risk: '活动效果评估不足',
                    probability: '中',
                    impact: '中',
                    mitigation: '建立系统的活动反馈收集机制'
                }
            ],
            metrics: {
                key_indicators: { '活动总数': activityCount },
                benchmarks: { '行业平均活动数': '待收集' },
                targets: { '下月活动目标': activityCount + 2 }
            },
            fallback: true
        };
    };
    // 生成绩效预测分析的fallback响应
    AIAnalysisController.prototype.generateFallbackPerformanceAnalysis = function () {
        return {
            summary: '基于当前可用数据进行基础绩效分析。由于AI服务暂时不可用，提供基础分析结果。',
            insights: [
                {
                    title: '绩效评估基础',
                    description: '建议建立全面的绩效评估体系',
                    importance: 'high',
                    category: 'recommendation'
                }
            ],
            trends: {
                direction: '稳定',
                confidence: '低',
                factors: ['缺少历史绩效数据', '评估体系待完善']
            },
            recommendations: [
                {
                    action: '建立绩效评估标准和流程',
                    priority: 'high',
                    timeline: '短期',
                    expectedImpact: '改善整体绩效管理'
                }
            ],
            risks: [
                {
                    risk: '绩效评估体系不完善',
                    probability: '高',
                    impact: '中',
                    mitigation: '制定标准化的绩效评估流程'
                }
            ],
            metrics: {
                key_indicators: { '评估覆盖率': '待统计' },
                benchmarks: { '行业标准': '待对比' },
                targets: { '评估完成度': '100%' }
            },
            fallback: true
        };
    };
    // 生成风险评估分析的fallback响应
    AIAnalysisController.prototype.generateFallbackRiskAnalysis = function () {
        return {
            summary: '基于基础风险管理原则进行风险评估。由于AI服务暂时不可用，提供基础风险分析。',
            insights: [
                {
                    title: '风险管理重要性',
                    description: '建立全面的风险识别和管理体系',
                    importance: 'high',
                    category: 'recommendation'
                }
            ],
            trends: {
                direction: '稳定',
                confidence: '中',
                factors: ['基础风险管理措施', '定期风险评估']
            },
            recommendations: [
                {
                    action: '完善风险管理制度',
                    priority: 'high',
                    timeline: '短期',
                    expectedImpact: '降低运营风险'
                }
            ],
            risks: [
                {
                    risk: '运营风险',
                    probability: '中',
                    impact: '中',
                    mitigation: '建立风险预警机制'
                },
                {
                    risk: '财务风险',
                    probability: '低',
                    impact: '高',
                    mitigation: '加强财务监控和预算管理'
                }
            ],
            metrics: {
                key_indicators: { '风险事件数': 0, '风险控制率': '85%' },
                benchmarks: { '行业标准风险率': '<5%' },
                targets: { '风险控制目标': '>90%' }
            },
            fallback: true
        };
    };
    // 生成招生趋势分析的fallback响应
    AIAnalysisController.prototype.generateFallbackEnrollmentAnalysis = function (monthlyStats, sourceStats, ageStats) {
        var totalApplications = Object.values(monthlyStats).reduce(function (sum, count) { return sum + count; }, 0);
        var monthCount = Object.keys(monthlyStats).length;
        var avgPerMonth = monthCount > 0 ? Math.round(totalApplications / monthCount) : 0;
        return {
            summary: "\u57FA\u4E8E".concat(monthCount, "\u4E2A\u6708\u7684\u62DB\u751F\u6570\u636E\u5206\u6790\uFF0C\u5171\u6709").concat(totalApplications, "\u4E2A\u7533\u8BF7\uFF0C\u6708\u5747").concat(avgPerMonth, "\u4E2A\u7533\u8BF7\u3002\u7531\u4E8EAI\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u63D0\u4F9B\u57FA\u7840\u6570\u636E\u5206\u6790\u7ED3\u679C\u3002"),
            insights: [
                {
                    title: '招生数据概览',
                    description: "\u8FC7\u53BB".concat(monthCount, "\u4E2A\u6708\u5171\u6536\u5230").concat(totalApplications, "\u4E2A\u62DB\u751F\u7533\u8BF7\uFF0C\u6708\u5747\u7533\u8BF7\u91CF\u4E3A").concat(avgPerMonth, "\u4E2A"),
                    importance: 'high',
                    category: 'trend'
                },
                {
                    title: '数据来源分析',
                    description: "\u4E3B\u8981\u7533\u8BF7\u6765\u6E90\uFF1A".concat(Object.keys(sourceStats).join('、')),
                    importance: 'medium',
                    category: 'insight'
                },
                {
                    title: '年龄分布情况',
                    description: "\u7533\u8BF7\u5B66\u751F\u5E74\u9F84\u5206\u5E03\uFF1A".concat(Object.keys(ageStats).join('、')),
                    importance: 'medium',
                    category: 'insight'
                }
            ],
            trends: {
                direction: totalApplications > avgPerMonth ? '上升' : '稳定',
                confidence: '中',
                factors: ['数据量有限', '需要更多历史数据进行准确分析']
            },
            recommendations: [
                {
                    action: '完善数据收集机制，记录更详细的来源信息',
                    priority: 'high',
                    timeline: '短期',
                    expectedImpact: '提高数据分析准确性'
                },
                {
                    action: '建立多渠道招生策略，减少对单一来源的依赖',
                    priority: 'medium',
                    timeline: '中期',
                    expectedImpact: '增加招生来源多样性'
                }
            ],
            risks: [
                {
                    risk: '招生来源信息不明确',
                    probability: '高',
                    impact: '中',
                    mitigation: '加强来源追踪和记录机制'
                }
            ],
            metrics: {
                key_indicators: {
                    '总申请数': totalApplications,
                    '月均申请数': avgPerMonth,
                    '数据覆盖月数': monthCount
                },
                benchmarks: {
                    '行业平均月申请量': '待收集',
                    '同类机构对比': '待分析'
                },
                targets: {
                    '下月目标申请数': Math.max(avgPerMonth + 2, 10),
                    '季度目标': Math.max(avgPerMonth * 3 + 5, 30)
                }
            },
            fallback: true // 标记这是fallback响应
        };
    };
    // 数据处理辅助方法
    AIAnalysisController.prototype.processEnrollmentDataByMonth = function (data) {
        var monthlyData = {};
        data.forEach(function (item) {
            var month = new Date(item.createdAt).toISOString().slice(0, 7);
            monthlyData[month] = (monthlyData[month] || 0) + 1;
        });
        return monthlyData;
    };
    AIAnalysisController.prototype.processEnrollmentDataBySource = function (data) {
        var sourceData = {};
        data.forEach(function (item) {
            var source = item.source || '未知';
            sourceData[source] = (sourceData[source] || 0) + 1;
        });
        return sourceData;
    };
    AIAnalysisController.prototype.processEnrollmentDataByAge = function (data) {
        var _this = this;
        var ageData = {};
        data.forEach(function (item) {
            var ageGroup = _this.getAgeGroup(item.studentAge);
            ageData[ageGroup] = (ageData[ageGroup] || 0) + 1;
        });
        return ageData;
    };
    AIAnalysisController.prototype.getAgeGroup = function (age) {
        if (age <= 3)
            return '3岁以下';
        if (age <= 4)
            return '3-4岁';
        if (age <= 5)
            return '4-5岁';
        return '5岁以上';
    };
    AIAnalysisController.prototype.processActivityData = function (activities) {
        return {
            total: activities.length,
            byStatus: activities.reduce(function (acc, activity) {
                acc[activity.status] = (acc[activity.status] || 0) + 1;
                return acc;
            }, {}),
            averageParticipation: activities.reduce(function (sum, activity) {
                return sum + (activity.currentParticipants / activity.maxParticipants);
            }, 0) / activities.length
        };
    };
    AIAnalysisController.prototype.calculateParticipationRates = function (activities) {
        return activities.map(function (activity) { return ({
            id: activity.id,
            title: activity.title,
            rate: (activity.currentParticipants / activity.maxParticipants) * 100
        }); });
    };
    AIAnalysisController.prototype.getActivityTypeDistribution = function (activities) {
        var typeData = {};
        activities.forEach(function (activity) {
            var type = activity.type || '其他';
            typeData[type] = (typeData[type] || 0) + 1;
        });
        return typeData;
    };
    AIAnalysisController.prototype.processTeacherData = function (teachers) {
        return {
            total: teachers.length,
            byExperience: teachers.reduce(function (acc, teacher) {
                var exp = teacher.experience || 0;
                var group = exp < 2 ? '新手' : exp < 5 ? '经验' : '资深';
                acc[group] = (acc[group] || 0) + 1;
                return acc;
            }, {}),
            byPosition: teachers.reduce(function (acc, teacher) {
                acc[teacher.position] = (acc[teacher.position] || 0) + 1;
                return acc;
            }, {})
        };
    };
    AIAnalysisController.prototype.processStudentData = function (students) {
        var _this = this;
        return {
            total: students.length,
            byAge: students.reduce(function (acc, student) {
                var ageGroup = _this.getAgeGroup(student.age);
                acc[ageGroup] = (acc[ageGroup] || 0) + 1;
                return acc;
            }, {}),
            byClass: students.reduce(function (acc, student) {
                var classId = student.classId || '未分班';
                acc[classId] = (acc[classId] || 0) + 1;
                return acc;
            }, {})
        };
    };
    AIAnalysisController.prototype.collectRiskData = function (riskTypes) {
        return __awaiter(this, void 0, void 0, function () {
            var riskData, recentApplications, teacherCount, studentCount;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        riskData = {};
                        if (!riskTypes.includes('enrollment')) return [3 /*break*/, 2];
                        return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.count({
                                where: {
                                    createdAt: (_a = {},
                                        _a[sequelize_1.Op.gte] = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近30天
                                    ,
                                        _a)
                                }
                            })];
                    case 1:
                        recentApplications = _b.sent();
                        riskData.enrollment = { recentApplications: recentApplications };
                        _b.label = 2;
                    case 2:
                        if (riskTypes.includes('financial')) {
                            // 这里可以添加财务相关的风险数据收集
                            riskData.financial = { placeholder: '财务数据待完善' };
                        }
                        if (!riskTypes.includes('operational')) return [3 /*break*/, 5];
                        return [4 /*yield*/, teacher_model_1.Teacher.count()];
                    case 3:
                        teacherCount = _b.sent();
                        return [4 /*yield*/, student_model_1.Student.count()];
                    case 4:
                        studentCount = _b.sent();
                        riskData.operational = { teacherCount: teacherCount, studentCount: studentCount, ratio: studentCount / teacherCount };
                        _b.label = 5;
                    case 5: return [2 /*return*/, riskData];
                }
            });
        });
    };
    return AIAnalysisController;
}());
exports.AIAnalysisController = AIAnalysisController;
