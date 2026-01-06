"use strict";
/**
 * AI智能分配服务
 * 基于教师能力和工作负载的智能客户分配
 * 使用豆包大模型进行分析和推荐
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
exports.smartAssignService = void 0;
var ai_bridge_service_1 = require("./bridge/ai-bridge.service");
var ai_model_config_model_1 = require("../../models/ai-model-config.model");
var teacher_model_1 = require("../../models/teacher.model");
var parent_model_1 = require("../../models/parent.model");
var user_model_1 = require("../../models/user.model");
var sequelize_1 = require("sequelize");
var init_1 = require("../../init");
/**
 * AI智能分配服务类
 */
var SmartAssignService = /** @class */ (function () {
    function SmartAssignService() {
    }
    /**
     * 获取豆包模型配置
     */
    SmartAssignService.prototype.getDoubaoModel = function () {
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
     * 分析教师能力和工作负载
     */
    SmartAssignService.prototype.analyzeTeacherCapacity = function () {
        return __awaiter(this, void 0, void 0, function () {
            var teachers, userIds, users, userMap_1, teacherIds, classTeachers, classMap_1, capacityData, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        console.log('📊 开始分析教师能力和工作负载...');
                        return [4 /*yield*/, teacher_model_1.Teacher.findAll({
                                where: {
                                    status: teacher_model_1.TeacherStatus.ACTIVE
                                },
                                attributes: ['id', 'userId', 'position', 'teachingAge', 'professionalSkills', 'certifications']
                            })];
                    case 1:
                        teachers = _a.sent();
                        console.log("\uD83D\uDCCA \u627E\u5230 ".concat(teachers.length, " \u4E2A\u5728\u804C\u6559\u5E08"));
                        userIds = teachers.map(function (t) { return t.userId; }).filter(Boolean);
                        return [4 /*yield*/, user_model_1.User.findAll({
                                where: {
                                    id: userIds
                                },
                                attributes: ['id', 'realName', 'phone']
                            })];
                    case 2:
                        users = _a.sent();
                        userMap_1 = new Map(users.map(function (u) { return [u.id, u]; }));
                        teacherIds = teachers.map(function (t) { return t.id; });
                        return [4 /*yield*/, init_1.sequelize.query("SELECT ct.teacher_id, c.id, c.name, c.capacity, c.current_student_count\n         FROM class_teachers ct\n         INNER JOIN classes c ON ct.class_id = c.id\n         WHERE ct.teacher_id IN (:teacherIds) AND c.deleted_at IS NULL", {
                                replacements: { teacherIds: teacherIds },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        classTeachers = _a.sent();
                        classMap_1 = new Map();
                        classTeachers.forEach(function (ct) {
                            if (!classMap_1.has(ct.teacher_id)) {
                                classMap_1.set(ct.teacher_id, []);
                            }
                            classMap_1.get(ct.teacher_id).push({
                                id: ct.id,
                                name: ct.name,
                                capacity: ct.capacity,
                                currentStudents: ct.current_student_count
                            });
                        });
                        console.log("\uD83D\uDCCA \u627E\u5230 ".concat(teachers.length, " \u4E2A\u5728\u804C\u6559\u5E08"));
                        return [4 /*yield*/, Promise.all(teachers.map(function (teacher) { return __awaiter(_this, void 0, void 0, function () {
                                var teacherData, user, classes, totalCustomers, convertedCustomers, conversionRate, classSize, workloadScore;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            teacherData = teacher;
                                            user = userMap_1.get(teacherData.userId);
                                            classes = classMap_1.get(teacher.id) || [];
                                            return [4 /*yield*/, parent_model_1.Parent.count({
                                                    where: {
                                                        assignedTeacherId: teacher.id
                                                    }
                                                })];
                                        case 1:
                                            totalCustomers = _a.sent();
                                            return [4 /*yield*/, parent_model_1.Parent.count({
                                                    where: {
                                                        assignedTeacherId: teacher.id,
                                                        followStatus: '已转化'
                                                    }
                                                })];
                                        case 2:
                                            convertedCustomers = _a.sent();
                                            conversionRate = totalCustomers > 0
                                                ? (convertedCustomers / totalCustomers) * 100
                                                : 0;
                                            classSize = classes.reduce(function (sum, cls) { return sum + (cls.currentStudents || 0); }, 0);
                                            workloadScore = Math.min(100, (totalCustomers / 30) * 50 + (classSize / 40) * 50);
                                            return [2 /*return*/, {
                                                    id: teacher.id,
                                                    name: (user === null || user === void 0 ? void 0 : user.realName) || '未知',
                                                    totalCustomers: totalCustomers,
                                                    conversionRate: Math.round(conversionRate * 10) / 10,
                                                    classSize: classSize,
                                                    workloadScore: Math.round(workloadScore),
                                                    expertise: teacherData.professionalSkills || '通用教育',
                                                    area: '未指定区域' // TODO: 从教师信息中获取
                                                }];
                                    }
                                });
                            }); }))];
                    case 4:
                        capacityData = _a.sent();
                        console.log('📊 教师能力分析完成');
                        return [2 /*return*/, capacityData];
                    case 5:
                        error_1 = _a.sent();
                        console.error('❌ 分析教师能力失败:', error_1);
                        throw new Error('分析教师能力失败');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 为客户推荐最合适的教师
     */
    SmartAssignService.prototype.recommendTeacher = function (customerIds, options, userId) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var doubaoModel_1, teachersCapacity_1, customers, customerUserIds, customerUsers, customerUserMap_1, recommendations, error_2;
            var _a, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        console.log("\uD83E\uDD16 \u5F00\u59CB\u4E3A ".concat(customerIds.length, " \u4E2A\u5BA2\u6237\u63A8\u8350\u6559\u5E08..."));
                        return [4 /*yield*/, this.getDoubaoModel()];
                    case 1:
                        doubaoModel_1 = _c.sent();
                        return [4 /*yield*/, this.analyzeTeacherCapacity()];
                    case 2:
                        teachersCapacity_1 = _c.sent();
                        return [4 /*yield*/, parent_model_1.Parent.findAll({
                                where: {
                                    id: (_a = {},
                                        _a[sequelize_1.Op["in"]] = customerIds,
                                        _a)
                                }
                            })];
                    case 3:
                        customers = _c.sent();
                        console.log("\uD83E\uDD16 \u627E\u5230 ".concat(customers.length, " \u4E2A\u5BA2\u6237"));
                        customerUserIds = customers.map(function (c) { return c.userId; });
                        return [4 /*yield*/, user_model_1.User.findAll({
                                where: {
                                    id: (_b = {},
                                        _b[sequelize_1.Op["in"]] = customerUserIds,
                                        _b)
                                },
                                attributes: ['id', 'realName', 'phone']
                            })];
                    case 4:
                        customerUsers = _c.sent();
                        customerUserMap_1 = new Map();
                        customerUsers.forEach(function (user) {
                            customerUserMap_1.set(user.id, user);
                        });
                        return [4 /*yield*/, Promise.all(customers.map(function (customer) { return __awaiter(_this, void 0, void 0, function () {
                                var customerUser, systemPrompt, userPrompt, response, aiResult, recommendedTeacher;
                                var _a, _b, _c;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            customerUser = customerUserMap_1.get(customer.userId);
                                            systemPrompt = this.buildSystemPrompt(options);
                                            userPrompt = this.buildUserPrompt(customer, customerUser, teachersCapacity_1);
                                            console.log("\uD83E\uDD16 \u4E3A\u5BA2\u6237 ".concat((customerUser === null || customerUser === void 0 ? void 0 : customerUser.realName) || '未知', " \u8C03\u7528\u8C46\u5305AI..."));
                                            return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateChatCompletion({
                                                    model: doubaoModel_1.name,
                                                    messages: [
                                                        { role: 'system', content: systemPrompt },
                                                        { role: 'user', content: userPrompt }
                                                    ],
                                                    temperature: 0.7,
                                                    max_tokens: 1500
                                                }, {
                                                    endpointUrl: doubaoModel_1.endpointUrl,
                                                    apiKey: doubaoModel_1.apiKey
                                                }, userId)];
                                        case 1:
                                            response = _d.sent();
                                            aiResult = this.parseAIResponse(response);
                                            recommendedTeacher = teachersCapacity_1.find(function (t) { return t.name === aiResult.recommendedTeacher; });
                                            if (!recommendedTeacher) {
                                                throw new Error("\u672A\u627E\u5230\u63A8\u8350\u7684\u6559\u5E08: ".concat(aiResult.recommendedTeacher));
                                            }
                                            // 构建推荐结果
                                            return [2 /*return*/, {
                                                    customerId: customer.id,
                                                    customerName: ((_a = customer.user) === null || _a === void 0 ? void 0 : _a.realName) || '未知',
                                                    customerInfo: {
                                                        id: customer.id,
                                                        name: ((_b = customer.user) === null || _b === void 0 ? void 0 : _b.realName) || '未知',
                                                        phone: ((_c = customer.user) === null || _c === void 0 ? void 0 : _c.phone) || '',
                                                        childAge: 3,
                                                        intentionLevel: customer.followStatus || '未知',
                                                        location: customer.address || '未指定',
                                                        specialNeeds: customer.remark || '无'
                                                    },
                                                    recommendedTeacher: {
                                                        id: recommendedTeacher.id,
                                                        name: recommendedTeacher.name,
                                                        matchScore: aiResult.matchScore,
                                                        reasons: aiResult.reasons,
                                                        currentStats: {
                                                            totalCustomers: recommendedTeacher.totalCustomers,
                                                            conversionRate: recommendedTeacher.conversionRate,
                                                            classSize: recommendedTeacher.classSize
                                                        }
                                                    },
                                                    alternatives: aiResult.alternatives.map(function (alt) {
                                                        var teacher = teachersCapacity_1.find(function (t) { return t.name === alt.teacher; });
                                                        return {
                                                            id: (teacher === null || teacher === void 0 ? void 0 : teacher.id) || 0,
                                                            name: alt.teacher,
                                                            matchScore: alt.score,
                                                            reason: alt.reason
                                                        };
                                                    })
                                                }];
                                    }
                                });
                            }); }))];
                    case 5:
                        recommendations = _c.sent();
                        console.log('🤖 AI推荐完成');
                        return [2 /*return*/, recommendations];
                    case 6:
                        error_2 = _c.sent();
                        console.error('❌ AI推荐失败:', error_2);
                        throw new Error('AI推荐失败');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 构建系统提示词
     */
    SmartAssignService.prototype.buildSystemPrompt = function (options) {
        return "\u4F60\u662F\u4E00\u4E2A\u5E7C\u513F\u56ED\u5BA2\u6237\u5206\u914D\u4E13\u5BB6\u3002\u8BF7\u6839\u636E\u4EE5\u4E0B\u6570\u636E\uFF0C\u4E3A\u5BA2\u6237\u63A8\u8350\u6700\u5408\u9002\u7684\u8D1F\u8D23\u6559\u5E08\u3002\n\n\u3010\u8BC4\u4F30\u6807\u51C6\u3011\n1. \u6210\u4EA4\u80FD\u529B\uFF08\u6743\u91CD40%\uFF09\uFF1A\u5386\u53F2\u6210\u4EA4\u7387\u3001\u8F6C\u5316\u7387\u3001\u6210\u4EA4\u5BA2\u6237\u6570\n2. \u5DE5\u4F5C\u8D1F\u8F7D\uFF08\u6743\u91CD30%\uFF09\uFF1A\u5F53\u524D\u8D1F\u8D23\u5BA2\u6237\u6570\u3001\u73ED\u7EA7\u4EBA\u6570\u3001\u5DE5\u4F5C\u9971\u548C\u5EA6\n3. \u4E13\u4E1A\u5339\u914D\uFF08\u6743\u91CD20%\uFF09\uFF1A\u6559\u5E08\u4E13\u957F\u3001\u5BA2\u6237\u9700\u6C42\u3001\u5B69\u5B50\u5E74\u9F84\u6BB5\n4. \u5730\u57DF\u5339\u914D\uFF08\u6743\u91CD10%\uFF09\uFF1A\u6559\u5E08\u8D1F\u8D23\u533A\u57DF\u3001\u5BA2\u6237\u4F4D\u7F6E\u3001\u4E0A\u95E8\u4FBF\u5229\u6027\n\n\u3010\u8F93\u51FA\u8981\u6C42\u3011\n\u8BF7\u4EE5JSON\u683C\u5F0F\u8F93\u51FA\uFF0C\u5305\u542B\uFF1A\n{\n  \"recommendedTeacher\": \"\u6559\u5E08\u59D3\u540D\",\n  \"matchScore\": 95,\n  \"reasons\": [\n    \"\u5177\u4F53\u7406\u75311\uFF08\u9700\u5305\u542B\u6570\u636E\u652F\u6491\uFF09\",\n    \"\u5177\u4F53\u7406\u75312\uFF08\u9700\u5305\u542B\u6570\u636E\u652F\u6491\uFF09\",\n    \"\u5177\u4F53\u7406\u75313\uFF08\u9700\u5305\u542B\u6570\u636E\u652F\u6491\uFF09\"\n  ],\n  \"alternatives\": [\n    {\"teacher\": \"\u5907\u9009\u6559\u5E081\", \"score\": 88, \"reason\": \"\u7B80\u8981\u8BF4\u660E\"},\n    {\"teacher\": \"\u5907\u9009\u6559\u5E082\", \"score\": 82, \"reason\": \"\u7B80\u8981\u8BF4\u660E\"}\n  ]\n}\n\n\u8BF7\u786E\u4FDD\u63A8\u8350\u7406\u7531\u5177\u4F53\u3001\u53EF\u91CF\u5316\uFF0C\u4FBF\u4E8E\u7528\u6237\u7406\u89E3\u548C\u51B3\u7B56\u3002";
    };
    /**
     * 构建用户提示词
     */
    SmartAssignService.prototype.buildUserPrompt = function (customer, customerUser, teachers) {
        var teachersInfo = teachers.map(function (t) {
            return "- ".concat(t.name, ": \u8D1F\u8D23").concat(t.totalCustomers, "\u4E2A\u5BA2\u6237\uFF0C\u8F6C\u5316\u7387").concat(t.conversionRate, "%\uFF0C\u73ED\u7EA7").concat(t.classSize, "\u4EBA\uFF0C\u5DE5\u4F5C\u8D1F\u8F7D").concat(t.workloadScore, "\u5206\uFF0C\u4E13\u957F\uFF1A").concat(t.expertise);
        }).join('\n');
        return "\u3010\u6559\u5E08\u6570\u636E\u3011\n".concat(teachersInfo, "\n\n\u3010\u5BA2\u6237\u4FE1\u606F\u3011\n\u5BA2\u6237\u59D3\u540D: ").concat((customerUser === null || customerUser === void 0 ? void 0 : customerUser.realName) || '未知', "\n\u8054\u7CFB\u7535\u8BDD: ").concat((customerUser === null || customerUser === void 0 ? void 0 : customerUser.phone) || '未提供', "\n\u8DDF\u8FDB\u72B6\u6001: ").concat(customer.followStatus, "\n\u4F18\u5148\u7EA7: ").concat(customer.priority, "\n\u5BA2\u6237\u4F4D\u7F6E: ").concat(customer.address || '未指定', "\n\u7279\u6B8A\u9700\u6C42: ").concat(customer.remark || '无', "\n\n\u8BF7\u4E3A\u8BE5\u5BA2\u6237\u63A8\u8350\u6700\u5408\u9002\u7684\u6559\u5E08\u3002");
    };
    /**
     * 解析AI响应
     */
    SmartAssignService.prototype.parseAIResponse = function (response) {
        var _a, _b;
        try {
            var content = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
            // 尝试提取JSON
            var jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('AI响应格式不正确');
        }
        catch (error) {
            console.error('❌ 解析AI响应失败:', error);
            throw new Error('解析AI响应失败');
        }
    };
    /**
     * 执行批量分配
     */
    SmartAssignService.prototype.executeAssignment = function (assignments, note) {
        return __awaiter(this, void 0, void 0, function () {
            var successCount, failedCount, _i, assignments_1, assignment, error_3, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        console.log("\uD83D\uDCDD \u5F00\u59CB\u6267\u884C ".concat(assignments.length, " \u4E2A\u5BA2\u6237\u5206\u914D..."));
                        successCount = 0;
                        failedCount = 0;
                        _i = 0, assignments_1 = assignments;
                        _a.label = 1;
                    case 1:
                        if (!(_i < assignments_1.length)) return [3 /*break*/, 6];
                        assignment = assignments_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, parent_model_1.Parent.update({
                                assignedTeacherId: assignment.teacherId,
                                followStatus: '跟进中',
                                lastFollowupAt: new Date()
                            }, {
                                where: { id: assignment.customerId }
                            })];
                    case 3:
                        _a.sent();
                        successCount++;
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        console.error("\u274C \u5206\u914D\u5BA2\u6237 ".concat(assignment.customerId, " \u5931\u8D25:"), error_3);
                        failedCount++;
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        console.log("\uD83D\uDCDD \u5206\u914D\u5B8C\u6210: \u6210\u529F".concat(successCount, "\u4E2A\uFF0C\u5931\u8D25").concat(failedCount, "\u4E2A"));
                        return [2 /*return*/, { successCount: successCount, failedCount: failedCount }];
                    case 7:
                        error_4 = _a.sent();
                        console.error('❌ 执行分配失败:', error_4);
                        throw new Error('执行分配失败');
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return SmartAssignService;
}());
exports.smartAssignService = new SmartAssignService();
exports["default"] = exports.smartAssignService;
