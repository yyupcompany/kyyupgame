"use strict";
/**
 * 跟进质量分析服务
 * 分析教师跟进数据，使用豆包AI生成改进建议
 */
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
exports.followupAnalysisService = void 0;
var ai_bridge_service_1 = require("./bridge/ai-bridge.service");
var ai_model_config_model_1 = require("../../models/ai-model-config.model");
var teacher_model_1 = require("../../models/teacher.model");
var parent_model_1 = require("../../models/parent.model");
var user_model_1 = require("../../models/user.model");
var customer_follow_record_enhanced_model_1 = require("../../models/customer-follow-record-enhanced.model");
var sequelize_1 = require("sequelize");
/**
 * 跟进质量分析服务类
 */
var FollowupAnalysisService = /** @class */ (function () {
    function FollowupAnalysisService() {
    }
    /**
     * 获取豆包模型配置
     */
    FollowupAnalysisService.prototype.getDoubaoModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var doubaoModel;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                            where: {
                                modelType: 'text',
                                status: ai_model_config_model_1.ModelStatus.ACTIVE,
                                name: (_a = {},
                                    _a[sequelize_1.Op.like] = '%doubao%',
                                    _a)
                            },
                            order: [['createdAt', 'DESC']]
                        })];
                    case 1:
                        doubaoModel = _b.sent();
                        if (!doubaoModel) {
                            throw new Error('未找到可用的豆包模型配置');
                        }
                        return [2 /*return*/, doubaoModel];
                }
            });
        });
    };
    /**
     * 获取跟进质量统计数据（纯数据查询，不走AI）
     */
    FollowupAnalysisService.prototype.getFollowupStatistics = function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var end_1, start_1, teachers, userIds, users, userMap_1, teacherStats, overall, error_1;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        console.log('📊 开始查询跟进质量统计数据...');
                        end_1 = endDate ? new Date(endDate) : new Date();
                        start_1 = startDate ? new Date(startDate) : new Date(end_1.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, teacher_model_1.Teacher.findAll({
                                where: {
                                    status: teacher_model_1.TeacherStatus.ACTIVE
                                }
                            })];
                    case 1:
                        teachers = _b.sent();
                        console.log("\uD83D\uDCCA \u627E\u5230 ".concat(teachers.length, " \u4E2A\u5728\u804C\u6559\u5E08"));
                        userIds = teachers.map(function (t) { return t.userId; }).filter(function (id) { return id; });
                        return [4 /*yield*/, user_model_1.User.findAll({
                                where: {
                                    id: (_a = {},
                                        _a[sequelize_1.Op["in"]] = userIds,
                                        _a)
                                },
                                attributes: ['id', 'realName', 'phone']
                            })];
                    case 2:
                        users = _b.sent();
                        userMap_1 = new Map(users.map(function (u) { return [u.id, u]; }));
                        return [4 /*yield*/, Promise.all(teachers.map(function (teacher) { return __awaiter(_this, void 0, void 0, function () {
                                var user, totalCustomers, followupCount, convertedCount, conversionRate, avgInterval, overdueCustomers, status;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            user = userMap_1.get(teacher.userId);
                                            return [4 /*yield*/, parent_model_1.Parent.count({
                                                    where: {
                                                        assignedTeacherId: teacher.id
                                                    }
                                                })];
                                        case 1:
                                            totalCustomers = _b.sent();
                                            return [4 /*yield*/, customer_follow_record_enhanced_model_1.CustomerFollowRecordEnhanced.count({
                                                    where: {
                                                        teacherId: teacher.id,
                                                        createdAt: (_a = {},
                                                            _a[sequelize_1.Op.between] = [start_1, end_1],
                                                            _a)
                                                    }
                                                })];
                                        case 2:
                                            followupCount = _b.sent();
                                            return [4 /*yield*/, parent_model_1.Parent.count({
                                                    where: {
                                                        assignedTeacherId: teacher.id,
                                                        followStatus: '已转化'
                                                    }
                                                })];
                                        case 3:
                                            convertedCount = _b.sent();
                                            conversionRate = totalCustomers > 0
                                                ? (convertedCount / totalCustomers) * 100
                                                : 0;
                                            return [4 /*yield*/, this.calculateAvgInterval(teacher.id, start_1, end_1)];
                                        case 4:
                                            avgInterval = _b.sent();
                                            return [4 /*yield*/, this.getOverdueCustomers(teacher.id)];
                                        case 5:
                                            overdueCustomers = _b.sent();
                                            status = this.evaluateStatus(conversionRate, avgInterval, overdueCustomers.length);
                                            return [2 /*return*/, {
                                                    id: teacher.id,
                                                    name: (user === null || user === void 0 ? void 0 : user.realName) || '未知',
                                                    totalCustomers: totalCustomers,
                                                    followupCount: followupCount,
                                                    conversionRate: Math.round(conversionRate * 10) / 10,
                                                    avgInterval: Math.round(avgInterval * 10) / 10,
                                                    overdueCount: overdueCustomers.length,
                                                    overdueCustomers: overdueCustomers,
                                                    status: status,
                                                    ranking: 0 // 稍后计算排名
                                                }];
                                    }
                                });
                            }); }))];
                    case 3:
                        teacherStats = _b.sent();
                        // 计算排名（按平均间隔升序）
                        teacherStats.sort(function (a, b) { return b.avgInterval - a.avgInterval; });
                        teacherStats.forEach(function (stat, index) {
                            stat.ranking = index + 1;
                        });
                        overall = {
                            totalTeachers: teachers.length,
                            avgFollowupInterval: teacherStats.reduce(function (sum, t) { return sum + t.avgInterval; }, 0) / teachers.length || 0,
                            avgConversionRate: teacherStats.reduce(function (sum, t) { return sum + t.conversionRate; }, 0) / teachers.length || 0,
                            overdueCustomers: teacherStats.reduce(function (sum, t) { return sum + t.overdueCount; }, 0),
                            totalFollowups: teacherStats.reduce(function (sum, t) { return sum + t.followupCount; }, 0)
                        };
                        // 四舍五入
                        overall.avgFollowupInterval = Math.round(overall.avgFollowupInterval * 10) / 10;
                        overall.avgConversionRate = Math.round(overall.avgConversionRate * 10) / 10;
                        console.log('📊 跟进质量统计完成');
                        return [2 /*return*/, { overall: overall, teachers: teacherStats }];
                    case 4:
                        error_1 = _b.sent();
                        console.error('❌ 查询跟进统计失败:', error_1);
                        throw new Error('查询跟进统计失败');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 计算平均跟进间隔
     */
    FollowupAnalysisService.prototype.calculateAvgInterval = function (teacherId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var followups, customerGroups_1, totalInterval_1, intervalCount_1, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, customer_follow_record_enhanced_model_1.CustomerFollowRecordEnhanced.findAll({
                                where: {
                                    teacherId: teacherId,
                                    createdAt: (_a = {},
                                        _a[sequelize_1.Op.between] = [startDate, endDate],
                                        _a)
                                },
                                attributes: ['createdAt', 'customerId'],
                                order: [['customerId', 'ASC'], ['createdAt', 'ASC']]
                            })];
                    case 1:
                        followups = _b.sent();
                        if (followups.length < 2) {
                            return [2 /*return*/, 0];
                        }
                        customerGroups_1 = {};
                        followups.forEach(function (f) {
                            if (!customerGroups_1[f.customerId]) {
                                customerGroups_1[f.customerId] = [];
                            }
                            customerGroups_1[f.customerId].push(f.createdAt);
                        });
                        totalInterval_1 = 0;
                        intervalCount_1 = 0;
                        Object.values(customerGroups_1).forEach(function (dates) {
                            for (var i = 1; i < dates.length; i++) {
                                var interval = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
                                totalInterval_1 += interval;
                                intervalCount_1++;
                            }
                        });
                        return [2 /*return*/, intervalCount_1 > 0 ? totalInterval_1 / intervalCount_1 : 0];
                    case 2:
                        error_2 = _b.sent();
                        console.error('❌ 计算平均间隔失败:', error_2);
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取超期未跟进的客户
     */
    FollowupAnalysisService.prototype.getOverdueCustomers = function (teacherId) {
        return __awaiter(this, void 0, void 0, function () {
            var customers, error_3;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, parent_model_1.Parent.findAll({
                                where: {
                                    assignedTeacherId: teacherId,
                                    lastFollowupAt: (_a = {},
                                        _a[sequelize_1.Op.or] = [
                                            (_b = {}, _b[sequelize_1.Op.is] = null, _b),
                                            (_c = {}, _c[sequelize_1.Op.lt] = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), _c)
                                        ],
                                        _a)
                                },
                                include: [
                                    {
                                        model: user_model_1.User,
                                        as: 'user',
                                        attributes: ['realName']
                                    }
                                ],
                                limit: 10
                            })];
                    case 1:
                        customers = _d.sent();
                        return [2 /*return*/, customers.map(function (c) {
                                var _a;
                                return ({
                                    id: c.id,
                                    name: ((_a = c.user) === null || _a === void 0 ? void 0 : _a.realName) || '未知',
                                    daysSinceLastFollowup: c.lastFollowupAt
                                        ? Math.floor((Date.now() - c.lastFollowupAt.getTime()) / (1000 * 60 * 60 * 24))
                                        : 999,
                                    intentionLevel: c.followStatus || '未知'
                                });
                            })];
                    case 2:
                        error_3 = _d.sent();
                        console.error('❌ 查询超期客户失败:', error_3);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 评估教师状态
     */
    FollowupAnalysisService.prototype.evaluateStatus = function (conversionRate, avgInterval, overdueCount) {
        // 优秀：转化率>30%，间隔<5天，超期<3个
        if (conversionRate > 30 && avgInterval < 5 && overdueCount < 3) {
            return '优秀';
        }
        // 需改进：转化率<20%，间隔>7天，超期>5个
        if (conversionRate < 20 || avgInterval > 7 || overdueCount > 5) {
            return '需改进';
        }
        return '一般';
    };
    /**
     * AI深度分析跟进质量
     */
    FollowupAnalysisService.prototype.analyzeFollowupQuality = function (teacherIds, analysisType, userId) {
        if (analysisType === void 0) { analysisType = 'detailed'; }
        return __awaiter(this, void 0, void 0, function () {
            var doubaoModel, stats, targetTeachers, systemPrompt, userPrompt, response, aiResult, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        console.log('🤖 开始AI深度分析跟进质量...');
                        return [4 /*yield*/, this.getDoubaoModel()];
                    case 1:
                        doubaoModel = _a.sent();
                        return [4 /*yield*/, this.getFollowupStatistics()];
                    case 2:
                        stats = _a.sent();
                        targetTeachers = teacherIds
                            ? stats.teachers.filter(function (t) { return teacherIds.includes(t.id); })
                            : stats.teachers;
                        console.log("\uD83E\uDD16 \u5206\u6790 ".concat(targetTeachers.length, " \u4E2A\u6559\u5E08\u7684\u8DDF\u8FDB\u8D28\u91CF"));
                        systemPrompt = this.buildAnalysisSystemPrompt();
                        userPrompt = this.buildAnalysisUserPrompt(stats.overall, targetTeachers);
                        console.log('🤖 调用豆包AI进行深度分析...');
                        return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateChatCompletion({
                                model: doubaoModel.name,
                                messages: [
                                    { role: 'system', content: systemPrompt },
                                    { role: 'user', content: userPrompt }
                                ],
                                temperature: 0.7,
                                max_tokens: 3000
                            }, {
                                endpointUrl: doubaoModel.endpointUrl,
                                apiKey: doubaoModel.apiKey
                            }, userId)];
                    case 3:
                        response = _a.sent();
                        aiResult = this.parseAnalysisResponse(response, targetTeachers);
                        console.log('🤖 AI深度分析完成');
                        return [2 /*return*/, aiResult];
                    case 4:
                        error_4 = _a.sent();
                        console.error('❌ AI深度分析失败:', error_4);
                        throw new Error('AI深度分析失败');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 构建分析系统提示词
     */
    FollowupAnalysisService.prototype.buildAnalysisSystemPrompt = function () {
        return "\u4F60\u662F\u4E00\u4E2A\u5E7C\u513F\u56ED\u5BA2\u6237\u8DDF\u8FDB\u8D28\u91CF\u5206\u6790\u4E13\u5BB6\u3002\u8BF7\u6839\u636E\u4EE5\u4E0B\u8DDF\u8FDB\u6570\u636E\uFF0C\u8FDB\u884C\u6DF1\u5EA6\u5206\u6790\u5E76\u63D0\u4F9B\u6539\u8FDB\u5EFA\u8BAE\u3002\n\n\u3010\u5206\u6790\u8981\u6C42\u3011\n1. \u6574\u4F53\u8BC4\u4EF7\uFF1A\u603B\u7ED3\u56E2\u961F\u8DDF\u8FDB\u8D28\u91CF\u73B0\u72B6\uFF08100-200\u5B57\uFF09\n2. \u5173\u952E\u95EE\u9898\uFF1A\u8BC6\u522B3-5\u4E2A\u4E3B\u8981\u95EE\u9898\uFF0C\u6309\u4F18\u5148\u7EA7\u6392\u5E8F\uFF08\u9AD8/\u4E2D/\u4F4E\uFF09\n3. \u6539\u8FDB\u5EFA\u8BAE\uFF1A\u9488\u5BF9\u6BCF\u4E2A\u6559\u5E08\u63D0\u4F9B\u5177\u4F53\u3001\u53EF\u6267\u884C\u7684\u6539\u8FDB\u5EFA\u8BAE\n4. \u4F18\u5148\u5BA2\u6237\uFF1A\u5217\u51FA\u9700\u8981\u7ACB\u5373\u8DDF\u8FDB\u7684\u9AD8\u98CE\u9669\u5BA2\u6237\n\n\u3010\u8F93\u51FA\u683C\u5F0F\u3011\n\u8BF7\u4F7F\u7528\u6E05\u6670\u7684\u7ED3\u6784\u5316\u6587\u672C\uFF0C\u5305\u542B\uFF1A\n- \u6574\u4F53\u8BC4\u4EF7\uFF08\u7B80\u6D01\u660E\u4E86\uFF09\n- \u9AD8\u4F18\u5148\u7EA7\u95EE\u9898\uFF083-5\u4E2A\uFF0C\u6BCF\u4E2A\u5305\u542B\uFF1A\u6807\u9898\u3001\u63CF\u8FF0\u3001\u5F71\u54CD\u8303\u56F4\u3001\u5EFA\u8BAE\u63AA\u65BD\uFF09\n- \u4E2D\u4F18\u5148\u7EA7\u95EE\u9898\uFF082-3\u4E2A\uFF09\n- \u9488\u5BF9\u6027\u5EFA\u8BAE\uFF08\u6BCF\u4E2A\u6559\u5E083-5\u6761\u5177\u4F53\u5EFA\u8BAE\uFF09\n- \u4F18\u5148\u8DDF\u8FDB\u5BA2\u6237\u6E05\u5355\uFF08\u6BCF\u4E2A\u6559\u5E08\u5217\u51FA5\u4E2A\u5BA2\u6237\uFF09\n\n\u8BF7\u786E\u4FDD\u5EFA\u8BAE\u5177\u4F53\u3001\u53EF\u64CD\u4F5C\uFF0C\u907F\u514D\u7A7A\u6CDB\u7684\u5EFA\u8BAE\u3002";
    };
    /**
     * 构建分析用户提示词
     */
    FollowupAnalysisService.prototype.buildAnalysisUserPrompt = function (overall, teachers) {
        var overallInfo = "\n\u3010\u6574\u4F53\u7EDF\u8BA1\u3011\n- \u603B\u6559\u5E08\u6570: ".concat(overall.totalTeachers, "\u4EBA\n- \u5E73\u5747\u8DDF\u8FDB\u9891\u7387: ").concat(overall.avgFollowupInterval, "\u5929/\u6B21\n- \u5E73\u5747\u8F6C\u5316\u7387: ").concat(overall.avgConversionRate, "%\n- \u8D85\u8FC77\u5929\u672A\u8DDF\u8FDB: ").concat(overall.overdueCustomers, "\u4E2A\u5BA2\u6237\n- \u603B\u8DDF\u8FDB\u6B21\u6570: ").concat(overall.totalFollowups, "\u6B21\n");
        var teachersInfo = teachers.map(function (t) { return "\n\u3010".concat(t.name, "\u3011\n- \u8D1F\u8D23\u5BA2\u6237: ").concat(t.totalCustomers, "\u4E2A\n- \u8DDF\u8FDB\u6B21\u6570: ").concat(t.followupCount, "\u6B21\n- \u8F6C\u5316\u7387: ").concat(t.conversionRate, "%\n- \u5E73\u5747\u95F4\u9694: ").concat(t.avgInterval, "\u5929\n- \u8D85\u671F\u5BA2\u6237: ").concat(t.overdueCount, "\u4E2A\n- \u72B6\u6001: ").concat(t.status, "\n- \u6392\u540D: ").concat(t.ranking, "/").concat(overall.totalTeachers, "\n- \u8D85\u671F\u5BA2\u6237\u8BE6\u60C5: ").concat(t.overdueCustomers.map(function (c) { return "".concat(c.name, "(").concat(c.daysSinceLastFollowup, "\u5929\u672A\u8DDF\u8FDB)"); }).join(', '), "\n"); }).join('\n');
        return "".concat(overallInfo, "\n\u3010\u6559\u5E08\u8BE6\u7EC6\u6570\u636E\u3011").concat(teachersInfo, "\n\n\u8BF7\u5BF9\u4EE5\u4E0A\u6570\u636E\u8FDB\u884C\u6DF1\u5EA6\u5206\u6790\uFF0C\u5E76\u63D0\u4F9B\u6539\u8FDB\u5EFA\u8BAE\u3002");
    };
    /**
     * 解析AI分析响应
     */
    FollowupAnalysisService.prototype.parseAnalysisResponse = function (response, teachers) {
        var _a, _b;
        try {
            var content = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
            // 简单解析文本响应（实际项目中可以要求AI返回JSON格式）
            return {
                overallAssessment: this.extractSection(content, '整体评价'),
                keyIssues: this.extractIssues(content),
                teacherRecommendations: this.extractTeacherRecommendations(content, teachers)
            };
        }
        catch (error) {
            console.error('❌ 解析AI响应失败:', error);
            throw new Error('解析AI响应失败');
        }
    };
    /**
     * 提取文本段落
     */
    FollowupAnalysisService.prototype.extractSection = function (content, sectionName) {
        var regex = new RegExp("\u3010".concat(sectionName, "\u3011([\\s\\S]*?)(?=\u3010|$)"), 'i');
        var match = content.match(regex);
        return match ? match[1].trim() : '暂无分析';
    };
    /**
     * 提取关键问题
     */
    FollowupAnalysisService.prototype.extractIssues = function (content) {
        // 简化实现，实际项目中应该更精确地解析
        return [
            {
                priority: 'HIGH',
                title: '跟进频率不足',
                description: this.extractSection(content, '高优先级问题'),
                affectedCustomers: 0,
                suggestions: ['立即制定跟进计划', '每3天至少跟进一次']
            }
        ];
    };
    /**
     * 提取教师建议
     */
    FollowupAnalysisService.prototype.extractTeacherRecommendations = function (content, teachers) {
        var recommendations = {};
        teachers.forEach(function (teacher) {
            recommendations[teacher.id.toString()] = {
                assessment: "".concat(teacher.name, "\u7684\u8DDF\u8FDB\u8D28\u91CF\u4E3A").concat(teacher.status),
                priorityCustomers: teacher.overdueCustomers.slice(0, 5).map(function (c) { return ({
                    id: c.id,
                    name: c.name,
                    reason: "".concat(c.daysSinceLastFollowup, "\u5929\u672A\u8DDF\u8FDB"),
                    action: '立即电话沟通'
                }); }),
                improvements: [
                    '建立每日跟进清单',
                    '学习优秀案例',
                    '参加跟进技巧培训'
                ],
                goals: {
                    followupInterval: '4天以内',
                    conversionRate: '20%以上',
                    overdueCustomers: '3个以内'
                }
            };
        });
        return recommendations;
    };
    return FollowupAnalysisService;
}());
exports.followupAnalysisService = new FollowupAnalysisService();
exports["default"] = exports.followupAnalysisService;
