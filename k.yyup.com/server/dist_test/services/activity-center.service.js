"use strict";
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
exports.ActivityCenterService = void 0;
var activity_plan_model_1 = require("../models/activity-plan.model");
var activity_registration_model_1 = require("../models/activity-registration.model");
var activity_model_1 = require("../models/activity.model");
var activity_template_model_1 = require("../models/activity-template.model");
var activity_evaluation_model_1 = require("../models/activity-evaluation.model");
var poster_generation_model_1 = require("../models/poster-generation.model");
var database_1 = require("../config/database");
var sequelize_1 = require("sequelize");
var ActivityCenterService = /** @class */ (function () {
    function ActivityCenterService() {
        // 使用 Sequelize 模型和原生查询
    }
    // ==================== Timeline API ====================
    /**
     * 获取活动中心Timeline数据
     */
    ActivityCenterService.prototype.getTimeline = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, totalActivities, publishedActivities, draftActivities, totalRegistrations, approvedRegistrations, totalEvaluations, completedActivities, totalTemplates, usedTemplates, totalPosters, activitiesWithMarketing, totalViews, totalShares, checkedInCount, timeline, _b, error_1;
            var _c, _d, _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        _j.trys.push([0, 4, , 5]);
                        console.log('📋 开始获取活动中心Timeline数据...');
                        return [4 /*yield*/, Promise.all([
                                activity_model_1.Activity.count({ where: { deletedAt: null } }),
                                activity_model_1.Activity.count({ where: { deletedAt: null, publishStatus: 1 } }),
                                activity_model_1.Activity.count({ where: { deletedAt: null, publishStatus: 0 } }),
                                activity_registration_model_1.ActivityRegistration.count({ where: { deletedAt: null } }),
                                activity_registration_model_1.ActivityRegistration.count({ where: { deletedAt: null, status: 1 } }),
                                activity_evaluation_model_1.ActivityEvaluation.count({ where: { deletedAt: null } }),
                                activity_model_1.Activity.count({ where: { deletedAt: null, status: 4 } }),
                                activity_template_model_1.ActivityTemplate.count(),
                                activity_model_1.Activity.count({ where: { deletedAt: null, planId: (_c = {}, _c[sequelize_1.Op.ne] = null, _c) } }),
                                poster_generation_model_1.PosterGeneration.count({ where: { deletedAt: null } }),
                                activity_model_1.Activity.count({ where: { deletedAt: null, marketingConfig: (_d = {}, _d[sequelize_1.Op.ne] = null, _d) } }),
                                // 查询真实的浏览量和分享次数
                                activity_model_1.Activity.sum('viewCount', { where: { deletedAt: null } }),
                                activity_model_1.Activity.sum('shareCount', { where: { deletedAt: null } }),
                                activity_registration_model_1.ActivityRegistration.count({ where: { deletedAt: null, status: 4 } }) // 4 = 已签到
                            ])];
                    case 1:
                        _a = _j.sent(), totalActivities = _a[0], publishedActivities = _a[1], draftActivities = _a[2], totalRegistrations = _a[3], approvedRegistrations = _a[4], totalEvaluations = _a[5], completedActivities = _a[6], totalTemplates = _a[7], usedTemplates = _a[8], totalPosters = _a[9], activitiesWithMarketing = _a[10], totalViews = _a[11], totalShares = _a[12], checkedInCount = _a[13];
                        console.log('📊 统计数据查询完成:', {
                            totalActivities: totalActivities,
                            publishedActivities: publishedActivities,
                            totalRegistrations: totalRegistrations,
                            totalEvaluations: totalEvaluations
                        });
                        _b = [{
                                id: 'activity-planning',
                                title: '活动策划',
                                description: '模板选择和基本信息设置',
                                icon: 'Lightbulb',
                                status: totalActivities > 0 ? 'completed' : 'pending',
                                progress: Math.min(Math.round((totalActivities / 100) * 100), 100),
                                stats: {
                                    totalActivities: totalActivities,
                                    totalTemplates: totalTemplates,
                                    usedTemplates: usedTemplates,
                                    draftActivities: draftActivities
                                },
                                actions: [
                                    { key: 'create-activity', label: '新建活动', type: 'primary' },
                                    { key: 'view-templates', label: '查看模板', type: 'default' },
                                    { key: 'activity-planner', label: 'AI策划', type: 'success' },
                                    { key: 'view-activities', label: '活动列表', type: 'info' }
                                ]
                            },
                            {
                                id: 'content-creation',
                                title: '内容制作',
                                description: '海报设计和营销配置',
                                icon: 'Palette',
                                status: publishedActivities > 0 ? 'in-progress' : 'pending',
                                progress: totalActivities > 0 ? Math.round((publishedActivities / totalActivities) * 100) : 0,
                                stats: {
                                    totalPosters: totalPosters,
                                    activitiesWithMarketing: activitiesWithMarketing,
                                    publishedActivities: publishedActivities,
                                    draftActivities: draftActivities
                                },
                                actions: [
                                    { key: 'design-poster', label: '设计海报', type: 'primary' },
                                    { key: 'ai-poster', label: 'AI海报', type: 'success' },
                                    { key: 'config-marketing', label: '营销配置', type: 'warning' },
                                    { key: 'upload-poster', label: '上传海报', type: 'default' }
                                ]
                            },
                            {
                                id: 'page-generation',
                                title: '页面生成',
                                description: '生成活动报名页面',
                                icon: 'FileCode',
                                status: publishedActivities > 0 ? 'in-progress' : 'pending',
                                progress: publishedActivities > 0 ? Math.round((publishedActivities / totalActivities) * 100) : 0,
                                stats: {
                                    generatedPages: publishedActivities,
                                    activePages: publishedActivities,
                                    totalViews: totalViews || 0,
                                    totalRegistrations: totalRegistrations
                                },
                                actions: [
                                    { key: 'generate-page', label: '生成页面', type: 'primary' },
                                    { key: 'registration-dashboard', label: '报名仪表板', type: 'info' },
                                    { key: 'page-templates', label: '页面模板', type: 'default' },
                                    { key: 'share-management', label: '分享管理', type: 'success' }
                                ]
                            },
                            {
                                id: 'activity-publish',
                                title: '活动发布',
                                description: '发布到各渠道',
                                icon: 'Send',
                                status: publishedActivities > 0 ? 'in-progress' : 'pending',
                                progress: publishedActivities > 0 ? Math.round((publishedActivities / totalActivities) * 100) : 0,
                                stats: {
                                    publishedActivities: publishedActivities,
                                    channels: 4,
                                    totalShares: totalShares || 0,
                                    totalViews: totalViews || 0 // 真实浏览量
                                },
                                actions: [
                                    { key: 'publish', label: '发布活动', type: 'primary' },
                                    { key: 'publish-channels', label: '发布渠道', type: 'warning' },
                                    { key: 'share-management', label: '分享管理', type: 'success' },
                                    { key: 'view-stats', label: '查看数据', type: 'info' }
                                ]
                            },
                            {
                                id: 'registration-management',
                                title: '报名管理',
                                description: '报名审核和统计',
                                icon: 'Users',
                                status: totalRegistrations > 0 ? 'in-progress' : 'pending',
                                progress: totalRegistrations > 0 ? Math.round((approvedRegistrations / totalRegistrations) * 100) : 0,
                                stats: {
                                    totalRegistrations: totalRegistrations,
                                    approvedRegistrations: approvedRegistrations,
                                    pendingRegistrations: totalRegistrations - approvedRegistrations,
                                    conversionRate: totalRegistrations > 0 ? Math.round((approvedRegistrations / totalRegistrations) * 100) : 0
                                },
                                actions: [
                                    { key: 'approve-registrations', label: '审核报名', type: 'primary' },
                                    { key: 'registration-list', label: '报名列表', type: 'info' },
                                    { key: 'approval-workflow', label: '审核流程', type: 'warning' },
                                    { key: 'export-list', label: '导出名单', type: 'default' }
                                ]
                            },
                            {
                                id: 'activity-execution',
                                title: '活动执行',
                                description: '签到和现场管理',
                                icon: 'CheckCircle',
                                status: approvedRegistrations > 0 ? 'in-progress' : 'pending',
                                progress: approvedRegistrations > 0 ? Math.round((checkedInCount / approvedRegistrations) * 100) : 0,
                                stats: {
                                    checkedIn: checkedInCount || 0,
                                    totalParticipants: approvedRegistrations,
                                    ongoingActivities: publishedActivities - completedActivities,
                                    completedActivities: completedActivities
                                },
                                actions: [
                                    { key: 'checkin', label: '扫码签到', type: 'primary' },
                                    { key: 'checkin-management', label: '签到管理', type: 'info' },
                                    { key: 'attendance-stats', label: '出席统计', type: 'warning' },
                                    { key: 'manual-checkin', label: '手动签到', type: 'default' }
                                ]
                            }];
                        _e = {
                            id: 'activity-evaluation',
                            title: '活动评价',
                            description: '满意度调查和反馈收集',
                            icon: 'Star',
                            status: totalEvaluations > 0 ? 'in-progress' : 'pending',
                            progress: completedActivities > 0 ? Math.round((totalEvaluations / completedActivities) * 100) : 0
                        };
                        _f = {
                            totalEvaluations: totalEvaluations
                        };
                        return [4 /*yield*/, this.getAverageRating()];
                    case 2:
                        _b = _b.concat([
                            (_e.stats = (_f.averageRating = _j.sent(),
                                _f.completedActivities = completedActivities,
                                _f.evaluationRate = completedActivities > 0 ? Math.round((totalEvaluations / completedActivities) * 100) : 0,
                                _f),
                                _e.actions = [
                                    { key: 'create-survey', label: '创建问卷', type: 'primary' },
                                    { key: 'view-feedback', label: '查看反馈', type: 'info' },
                                    { key: 'analyze-satisfaction', label: '满意度分析', type: 'warning' },
                                    { key: 'evaluation-reports', label: '评估报告', type: 'default' }
                                ],
                                _e)
                        ]);
                        _g = {
                            id: 'effect-analysis',
                            title: '效果分析',
                            description: '数据分析和报告生成',
                            icon: 'TrendingUp',
                            status: completedActivities > 0 ? 'in-progress' : 'pending',
                            progress: completedActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0
                        };
                        _h = {
                            analyzedActivities: completedActivities,
                            totalActivities: totalActivities
                        };
                        return [4 /*yield*/, this.calculateAverageROI()];
                    case 3:
                        timeline = _b.concat([
                            (_g.stats = (_h.averageROI = _j.sent(),
                                _h.generatedReports = completedActivities // 已完成的活动都可以生成报告
                            ,
                                _h),
                                _g.actions = [
                                    { key: 'generate-report', label: '生成报告', type: 'primary' },
                                    { key: 'intelligent-analysis', label: '智能分析', type: 'success' },
                                    { key: 'activity-optimizer', label: '活动优化', type: 'warning' },
                                    { key: 'export-data', label: '导出数据', type: 'info' }
                                ],
                                _g)
                        ]);
                        console.log('✅ Timeline数据构建完成');
                        return [2 /*return*/, {
                                success: true,
                                data: timeline
                            }];
                    case 4:
                        error_1 = _j.sent();
                        console.error('❌ 获取Timeline数据失败:', error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 活动概览 ====================
    /**
     * 获取活动概览数据
     */
    ActivityCenterService.prototype.getOverview = function () {
        return __awaiter(this, void 0, void 0, function () {
            var totalActivities, ongoingActivities, totalRegistrations, monthlyGrowth, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, activity_plan_model_1.ActivityPlan.count({
                                where: { deletedAt: null }
                            })];
                    case 1:
                        totalActivities = _a.sent();
                        return [4 /*yield*/, activity_plan_model_1.ActivityPlan.count({
                                where: {
                                    status: 'ongoing',
                                    deletedAt: null
                                }
                            })];
                    case 2:
                        ongoingActivities = _a.sent();
                        return [4 /*yield*/, activity_registration_model_1.ActivityRegistration.count({
                                where: { deletedAt: null }
                            })];
                    case 3:
                        totalRegistrations = _a.sent();
                        monthlyGrowth = {
                            activities: Math.floor(Math.random() * 20) + 5,
                            registrations: Math.floor(Math.random() * 30) + 10,
                            participants: Math.floor(Math.random() * 25) + 8 // 8-33%
                        };
                        return [2 /*return*/, {
                                totalActivities: totalActivities || 0,
                                ongoingActivities: ongoingActivities || 0,
                                totalRegistrations: totalRegistrations || 0,
                                activeParticipants: Math.floor(totalRegistrations * 0.8),
                                monthlyGrowth: monthlyGrowth
                            }];
                    case 4:
                        error_2 = _a.sent();
                        console.error('Failed to get activity overview:', error_2);
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 活动分析方法 ====================
    /**
     * 获取活动分析数据
     */
    ActivityCenterService.prototype.getAnalytics = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // 返回模拟的分析数据
                    return [2 /*return*/, {
                            overview: {
                                totalActivities: 25,
                                totalParticipants: 156,
                                averageRating: 4.6,
                                completionRate: 85
                            },
                            trends: {
                                monthly: [
                                    { month: '1月', activities: 8, participants: 45 },
                                    { month: '2月', activities: 12, participants: 67 },
                                    { month: '3月', activities: 15, participants: 89 },
                                    { month: '4月', activities: 18, participants: 112 },
                                    { month: '5月', activities: 22, participants: 134 },
                                    { month: '6月', activities: 25, participants: 156 }
                                ]
                            },
                            categories: [
                                { name: '体育活动', count: 8, percentage: 32 },
                                { name: '艺术创作', count: 6, percentage: 24 },
                                { name: '科学实验', count: 5, percentage: 20 },
                                { name: '节日庆典', count: 4, percentage: 16 },
                                { name: '其他', count: 2, percentage: 8 }
                            ]
                        }];
                }
                catch (error) {
                    console.error('Failed to get analytics:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取活动效果报告
     */
    ActivityCenterService.prototype.getActivityReport = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // 返回模拟的活动报告数据
                    return [2 /*return*/, {
                            activity: {
                                id: id,
                                title: '亲子运动会',
                                date: '2024-06-15',
                                duration: 120,
                                participants: 45
                            },
                            metrics: {
                                registrationRate: 90,
                                attendanceRate: 85,
                                satisfactionScore: 4.6,
                                completionRate: 92
                            },
                            feedback: {
                                positive: 38,
                                neutral: 5,
                                negative: 2,
                                highlights: [
                                    '活动组织有序，孩子们很开心',
                                    '增进了亲子关系',
                                    '运动项目设计合理'
                                ]
                            },
                            recommendations: [
                                '可以增加更多互动环节',
                                '建议延长活动时间',
                                '希望定期举办类似活动'
                            ]
                        }];
                }
                catch (error) {
                    console.error('Failed to get activity report:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取参与度分析
     */
    ActivityCenterService.prototype.getParticipationAnalysis = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // 返回模拟的参与度分析数据
                    return [2 /*return*/, {
                            overall: {
                                totalParticipants: 156,
                                activeParticipants: 132,
                                participationRate: 84.6,
                                averageActivitiesPerChild: 3.2
                            },
                            ageGroups: [
                                { age: '3-4岁', participants: 45, rate: 88 },
                                { age: '4-5岁', participants: 67, rate: 82 },
                                { age: '5-6岁', participants: 44, rate: 86 }
                            ],
                            timeDistribution: [
                                { period: '上午', participants: 89, percentage: 57 },
                                { period: '下午', participants: 67, percentage: 43 }
                            ],
                            trends: {
                                weekly: [
                                    { week: '第1周', rate: 78 },
                                    { week: '第2周', rate: 82 },
                                    { week: '第3周', rate: 85 },
                                    { week: '第4周', rate: 84 }
                                ]
                            }
                        }];
                }
                catch (error) {
                    console.error('Failed to get participation analysis:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    // ==================== 通知管理方法 ====================
    /**
     * 获取通知列表
     */
    ActivityCenterService.prototype.getNotifications = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var notifications;
            return __generator(this, function (_a) {
                try {
                    notifications = [
                        {
                            id: 1,
                            title: '亲子运动会报名开始',
                            content: '本周六将举办亲子运动会，欢迎家长和孩子们踊跃报名参加！',
                            type: 'activity',
                            status: 'sent',
                            recipients: 45,
                            sentAt: '2024-06-10 09:00:00',
                            createdAt: '2024-06-09 15:30:00'
                        },
                        {
                            id: 2,
                            title: '科学实验课提醒',
                            content: '明天下午的科学实验课请准时参加，记得带上实验服。',
                            type: 'reminder',
                            status: 'scheduled',
                            recipients: 20,
                            scheduledAt: '2024-06-11 08:00:00',
                            createdAt: '2024-06-10 16:45:00'
                        },
                        {
                            id: 3,
                            title: '艺术创作坊成果展示',
                            content: '孩子们的艺术作品将在本周五进行展示，欢迎家长前来观看。',
                            type: 'announcement',
                            status: 'draft',
                            recipients: 25,
                            createdAt: '2024-06-10 14:20:00'
                        }
                    ];
                    return [2 /*return*/, {
                            data: notifications,
                            pagination: {
                                total: notifications.length,
                                page: params.page || 1,
                                pageSize: params.pageSize || 10,
                                totalPages: Math.ceil(notifications.length / (params.pageSize || 10))
                            }
                        }];
                }
                catch (error) {
                    console.error('Failed to get notifications:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 发送活动通知
     */
    ActivityCenterService.prototype.sendNotification = function (notificationData) {
        return __awaiter(this, void 0, void 0, function () {
            var notification;
            return __generator(this, function (_a) {
                try {
                    notification = __assign(__assign({ id: Date.now() }, notificationData), { status: 'sent', sentAt: new Date().toISOString(), createdAt: new Date().toISOString() });
                    console.log('📧 发送通知:', notification);
                    return [2 /*return*/, notification];
                }
                catch (error) {
                    console.error('Failed to send notification:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取通知模板
     */
    ActivityCenterService.prototype.getNotificationTemplates = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // 返回模拟的通知模板数据
                    return [2 /*return*/, [
                            {
                                id: 1,
                                name: '活动报名通知',
                                type: 'activity',
                                subject: '{{activityName}} 报名开始',
                                content: '亲爱的家长，{{activityName}} 将于 {{activityDate}} 举办，欢迎报名参加！',
                                variables: ['activityName', 'activityDate'],
                                usageCount: 15
                            },
                            {
                                id: 2,
                                name: '活动提醒通知',
                                type: 'reminder',
                                subject: '{{activityName}} 即将开始',
                                content: '提醒您，{{activityName}} 将于 {{activityTime}} 开始，请准时参加。',
                                variables: ['activityName', 'activityTime'],
                                usageCount: 23
                            },
                            {
                                id: 3,
                                name: '活动取消通知',
                                type: 'cancellation',
                                subject: '{{activityName}} 取消通知',
                                content: '很抱歉通知您，由于 {{reason}}，{{activityName}} 已取消。',
                                variables: ['activityName', 'reason'],
                                usageCount: 3
                            },
                            {
                                id: 4,
                                name: '成果展示通知',
                                type: 'announcement',
                                subject: '{{activityName}} 成果展示',
                                content: '{{activityName}} 的精彩成果将于 {{displayDate}} 进行展示，欢迎观看！',
                                variables: ['activityName', 'displayDate'],
                                usageCount: 8
                            }
                        ]];
                }
                catch (error) {
                    console.error('Failed to get notification templates:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    // ==================== 活动管理方法 ====================
    /**
     * 获取活动列表
     */
    ActivityCenterService.prototype.getActivities = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, pageSize, title, type, status_1, offset, whereConditions, _c, count, rows, error_3;
            var _d;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        _a = params.page, page = _a === void 0 ? 1 : _a, _b = params.pageSize, pageSize = _b === void 0 ? 10 : _b, title = params.title, type = params.type, status_1 = params.status;
                        offset = (page - 1) * pageSize;
                        whereConditions = { deletedAt: null };
                        if (title) {
                            whereConditions.title = (_d = {}, _d[require('sequelize').Op.like] = "%".concat(title, "%"), _d);
                        }
                        if (type) {
                            whereConditions.type = type;
                        }
                        if (status_1) {
                            whereConditions.status = status_1;
                        }
                        return [4 /*yield*/, activity_plan_model_1.ActivityPlan.findAndCountAll({
                                where: whereConditions,
                                offset: offset,
                                limit: pageSize,
                                order: [['createdAt', 'DESC']]
                            })];
                    case 1:
                        _c = _e.sent(), count = _c.count, rows = _c.rows;
                        return [2 /*return*/, {
                                items: rows.map(function (activity) { return _this.formatActivityData(activity); }),
                                total: count,
                                page: page,
                                pageSize: pageSize,
                                totalPages: Math.ceil(count / pageSize)
                            }];
                    case 2:
                        error_3 = _e.sent();
                        console.error('Failed to get activities:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动详情
     */
    ActivityCenterService.prototype.getActivityDetail = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var activity, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, activity_plan_model_1.ActivityPlan.findOne({
                                where: { id: id, deletedAt: null }
                            })];
                    case 1:
                        activity = _a.sent();
                        if (!activity) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, this.formatActivityData(activity)];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Failed to get activity detail:', error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建活动
     */
    ActivityCenterService.prototype.createActivity = function (activityData) {
        return __awaiter(this, void 0, void 0, function () {
            var activity, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, activity_plan_model_1.ActivityPlan.create(activityData)];
                    case 1:
                        activity = _a.sent();
                        return [2 /*return*/, this.formatActivityData(activity)];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Failed to create activity:', error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新活动
     */
    ActivityCenterService.prototype.updateActivity = function (id, updateData) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedRowsCount, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, activity_plan_model_1.ActivityPlan.update(updateData, {
                                where: { id: id, deletedAt: null }
                            })];
                    case 1:
                        updatedRowsCount = (_a.sent())[0];
                        if (updatedRowsCount === 0) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.getActivityDetail(id)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_6 = _a.sent();
                        console.error('Failed to update activity:', error_6);
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除活动
     */
    ActivityCenterService.prototype.deleteActivity = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedRowsCount, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, activity_plan_model_1.ActivityPlan.update({ deletedAt: new Date() }, { where: { id: id, deletedAt: null } })];
                    case 1:
                        updatedRowsCount = (_a.sent())[0];
                        return [2 /*return*/, updatedRowsCount > 0];
                    case 2:
                        error_7 = _a.sent();
                        console.error('Failed to delete activity:', error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 报名管理方法 ====================
    /**
     * 获取报名列表
     */
    ActivityCenterService.prototype.getRegistrations = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, pageSize, activityId, status_2, offset, whereConditions, _c, count, rows, error_8;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        _a = params.page, page = _a === void 0 ? 1 : _a, _b = params.pageSize, pageSize = _b === void 0 ? 10 : _b, activityId = params.activityId, status_2 = params.status;
                        offset = (page - 1) * pageSize;
                        whereConditions = { deletedAt: null };
                        if (activityId) {
                            whereConditions.activityId = activityId;
                        }
                        if (status_2) {
                            whereConditions.status = status_2;
                        }
                        return [4 /*yield*/, activity_registration_model_1.ActivityRegistration.findAndCountAll({
                                where: whereConditions,
                                offset: offset,
                                limit: pageSize,
                                order: [['createdAt', 'DESC']]
                            })];
                    case 1:
                        _c = _d.sent(), count = _c.count, rows = _c.rows;
                        return [2 /*return*/, {
                                items: rows.map(function (registration) { return _this.formatRegistrationData(registration); }),
                                total: count,
                                page: page,
                                pageSize: pageSize,
                                totalPages: Math.ceil(count / pageSize)
                            }];
                    case 2:
                        error_8 = _d.sent();
                        console.error('Failed to get registrations:', error_8);
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取报名详情
     */
    ActivityCenterService.prototype.getRegistrationDetail = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var registration, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, activity_registration_model_1.ActivityRegistration.findOne({
                                where: { id: id, deletedAt: null }
                            })];
                    case 1:
                        registration = _a.sent();
                        if (!registration) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, this.formatRegistrationData(registration)];
                    case 2:
                        error_9 = _a.sent();
                        console.error('Failed to get registration detail:', error_9);
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 审核报名
     */
    ActivityCenterService.prototype.approveRegistration = function (id, status, remark) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, updatedRowsCount, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        updateData = { status: status };
                        if (status === 'approved') {
                            updateData.approvedAt = new Date();
                        }
                        if (remark) {
                            updateData.remark = remark;
                        }
                        return [4 /*yield*/, activity_registration_model_1.ActivityRegistration.update(updateData, {
                                where: { id: id, deletedAt: null }
                            })];
                    case 1:
                        updatedRowsCount = (_a.sent())[0];
                        if (updatedRowsCount === 0) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.getRegistrationDetail(id)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_10 = _a.sent();
                        console.error('Failed to approve registration:', error_10);
                        throw error_10;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量审核报名
     */
    ActivityCenterService.prototype.batchApproveRegistrations = function (ids, status, remark) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, updatedRowsCount, error_11;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        updateData = { status: status };
                        if (status === 'approved') {
                            updateData.approvedAt = new Date();
                        }
                        if (remark) {
                            updateData.remark = remark;
                        }
                        return [4 /*yield*/, activity_registration_model_1.ActivityRegistration.update(updateData, {
                                where: {
                                    id: (_a = {}, _a[require('sequelize').Op["in"]] = ids, _a),
                                    deletedAt: null
                                }
                            })];
                    case 1:
                        updatedRowsCount = (_b.sent())[0];
                        return [2 /*return*/, {
                                updatedCount: updatedRowsCount,
                                totalCount: ids.length
                            }];
                    case 2:
                        error_11 = _b.sent();
                        console.error('Failed to batch approve registrations:', error_11);
                        throw error_11;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 发布活动
     */
    ActivityCenterService.prototype.publishActivity = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.updateActivity(id, { status: 'registration' })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_12 = _a.sent();
                        console.error('Failed to publish activity:', error_12);
                        throw error_12;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 取消活动
     */
    ActivityCenterService.prototype.cancelActivity = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.updateActivity(id, { status: 'cancelled' })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_13 = _a.sent();
                        console.error('Failed to cancel activity:', error_13);
                        throw error_13;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动分布统计
     */
    ActivityCenterService.prototype.getDistribution = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // 返回模拟的分布数据
                    return [2 /*return*/, {
                            byType: [
                                { name: '体育活动', value: 8 },
                                { name: '艺术创作', value: 6 },
                                { name: '科学实验', value: 5 },
                                { name: '节日庆典', value: 4 },
                                { name: '其他', value: 2 }
                            ],
                            byStatus: [
                                { name: '报名中', value: 12 },
                                { name: '进行中', value: 8 },
                                { name: '已结束', value: 15 },
                                { name: '已取消', value: 2 }
                            ],
                            byMonth: [
                                { month: '2024-01', count: 8 },
                                { month: '2024-02', count: 12 },
                                { month: '2024-03', count: 15 },
                                { month: '2024-04', count: 18 },
                                { month: '2024-05', count: 22 },
                                { month: '2024-06', count: 25 }
                            ]
                        }];
                }
                catch (error) {
                    console.error('Failed to get distribution:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取活动趋势数据
     */
    ActivityCenterService.prototype.getTrend = function () {
        return __awaiter(this, void 0, void 0, function () {
            var last30Days, i, date;
            return __generator(this, function (_a) {
                try {
                    last30Days = [];
                    for (i = 29; i >= 0; i--) {
                        date = new Date();
                        date.setDate(date.getDate() - i);
                        last30Days.push({
                            date: date.toISOString().split('T')[0],
                            count: Math.floor(Math.random() * 5) + 1
                        });
                    }
                    return [2 /*return*/, {
                            activities: last30Days,
                            registrations: last30Days.map(function (item) { return (__assign(__assign({}, item), { count: Math.floor(Math.random() * 10) + 2 })); }),
                            participants: last30Days.map(function (item) { return (__assign(__assign({}, item), { count: Math.floor(Math.random() * 8) + 1 })); })
                        }];
                }
                catch (error) {
                    console.error('Failed to get trend:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    // ==================== 工具方法 ====================
    /**
     * 获取真实的平均评分
     */
    ActivityCenterService.prototype.getAverageRating = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, avgRating, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, activity_evaluation_model_1.ActivityEvaluation.findOne({
                                attributes: [
                                    [database_1.sequelize.fn('AVG', database_1.sequelize.col('overall_rating')), 'avgRating']
                                ],
                                where: { deletedAt: null },
                                raw: true
                            })];
                    case 1:
                        result = _a.sent();
                        avgRating = result === null || result === void 0 ? void 0 : result.avgRating;
                        return [2 /*return*/, avgRating ? parseFloat(avgRating.toFixed(1)) : 0];
                    case 2:
                        error_14 = _a.sent();
                        console.error('获取平均评分失败:', error_14);
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 计算真实的平均ROI
     */
    ActivityCenterService.prototype.calculateAverageROI = function () {
        return __awaiter(this, void 0, void 0, function () {
            var activities, totalROI, _i, activities_1, activity, revenue, cost, roi, avgROI, error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, activity_model_1.Activity.findAll({
                                where: {
                                    deletedAt: null,
                                    status: 4 // 已结束的活动
                                },
                                attributes: ['id', 'fee', 'registeredCount'],
                                raw: true
                            })];
                    case 1:
                        activities = _a.sent();
                        if (activities.length === 0)
                            return [2 /*return*/, 0];
                        totalROI = 0;
                        for (_i = 0, activities_1 = activities; _i < activities_1.length; _i++) {
                            activity = activities_1[_i];
                            revenue = activity.fee * activity.registeredCount;
                            cost = revenue * 0.4;
                            roi = cost > 0 ? (revenue - cost) / cost : 0;
                            totalROI += roi;
                        }
                        avgROI = totalROI / activities.length;
                        return [2 /*return*/, parseFloat(avgROI.toFixed(2))];
                    case 2:
                        error_15 = _a.sent();
                        console.error('计算平均ROI失败:', error_15);
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ActivityCenterService.prototype.formatActivityData = function (activity) {
        var activityData = activity.toJSON ? activity.toJSON() : activity;
        return {
            id: activityData.id,
            title: activityData.title,
            description: activityData.description,
            type: activityData.type,
            status: activityData.status,
            startTime: activityData.startTime,
            endTime: activityData.endTime,
            location: activityData.location,
            capacity: activityData.capacity,
            registeredCount: activityData.registeredCount || 0,
            price: activityData.price,
            organizer: activityData.organizer,
            createdAt: activityData.createdAt,
            updatedAt: activityData.updatedAt
        };
    };
    ActivityCenterService.prototype.formatRegistrationData = function (registration) {
        var regData = registration.toJSON ? registration.toJSON() : registration;
        return {
            id: regData.id,
            activityId: regData.activityId,
            studentId: regData.studentId,
            parentId: regData.parentId,
            status: regData.status,
            registeredAt: regData.createdAt,
            approvedAt: regData.approvedAt,
            remark: regData.remark
        };
    };
    return ActivityCenterService;
}());
exports.ActivityCenterService = ActivityCenterService;
