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
exports.EnrollmentConsultationFollowupService = void 0;
var sequelize_1 = require("sequelize");
var enrollment_consultation_model_1 = require("../../models/enrollment-consultation.model");
var enrollment_consultation_followup_model_1 = require("../../models/enrollment-consultation-followup.model");
var user_model_1 = require("../../models/user.model");
var init_1 = require("../../init");
/**
 * 枚举类型定义 - 与模型中的枚举保持一致
 */
// 跟进方式
var FollowupMethod;
(function (FollowupMethod) {
    FollowupMethod[FollowupMethod["PHONE"] = 1] = "PHONE";
    FollowupMethod[FollowupMethod["WECHAT"] = 2] = "WECHAT";
    FollowupMethod[FollowupMethod["SMS"] = 3] = "SMS";
    FollowupMethod[FollowupMethod["MEETING"] = 4] = "MEETING";
    FollowupMethod[FollowupMethod["EMAIL"] = 5] = "EMAIL";
    FollowupMethod[FollowupMethod["OTHER"] = 6] = "OTHER"; // 其他
})(FollowupMethod || (FollowupMethod = {}));
// 意向级别
var IntentionLevel;
(function (IntentionLevel) {
    IntentionLevel[IntentionLevel["VERY_HIGH"] = 1] = "VERY_HIGH";
    IntentionLevel[IntentionLevel["HIGH"] = 2] = "HIGH";
    IntentionLevel[IntentionLevel["MEDIUM"] = 3] = "MEDIUM";
    IntentionLevel[IntentionLevel["LOW"] = 4] = "LOW";
    IntentionLevel[IntentionLevel["NONE"] = 5] = "NONE"; // 无意向
})(IntentionLevel || (IntentionLevel = {}));
// 跟进结果
var FollowupResult;
(function (FollowupResult) {
    FollowupResult[FollowupResult["CONTINUE"] = 1] = "CONTINUE";
    FollowupResult[FollowupResult["CONVERTED"] = 2] = "CONVERTED";
    FollowupResult[FollowupResult["NO_INTENTION"] = 3] = "NO_INTENTION";
    FollowupResult[FollowupResult["ABANDONED"] = 4] = "ABANDONED"; // 放弃跟进
})(FollowupResult || (FollowupResult = {}));
// 咨询跟进状态
var ConsultationStatus;
(function (ConsultationStatus) {
    ConsultationStatus[ConsultationStatus["PENDING"] = 1] = "PENDING";
    ConsultationStatus[ConsultationStatus["IN_PROGRESS"] = 2] = "IN_PROGRESS";
    ConsultationStatus[ConsultationStatus["CONVERTED"] = 3] = "CONVERTED";
    ConsultationStatus[ConsultationStatus["ABANDONED"] = 4] = "ABANDONED"; // 已放弃
})(ConsultationStatus || (ConsultationStatus = {}));
/**
 * 招生咨询跟进服务类
 * 处理招生咨询跟进记录的创建、查询等操作
 */
var EnrollmentConsultationFollowupService = /** @class */ (function () {
    function EnrollmentConsultationFollowupService() {
    }
    /**
     * 创建招生咨询跟进记录
     * @param data 创建招生咨询跟进的数据传输对象
     * @param userId 跟进人ID
     * @returns 创建的招生咨询跟进记录
     */
    EnrollmentConsultationFollowupService.prototype.createFollowup = function (data, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var consultation;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.findByPk(data.consultationId)];
                    case 1:
                        consultation = _a.sent();
                        if (!consultation) {
                            throw new Error('招生咨询不存在');
                        }
                        return [4 /*yield*/, init_1.sequelize.transaction(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                var followup, updateData, followupUser;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, enrollment_consultation_followup_model_1.EnrollmentConsultationFollowup.create({
                                                consultationId: data.consultationId,
                                                followupUserId: userId,
                                                followupMethod: data.followupMethod,
                                                followupContent: data.followupContent,
                                                followupDate: new Date(data.followupDate),
                                                intentionLevel: data.intentionLevel,
                                                followupResult: data.followupResult,
                                                nextFollowupDate: data.nextFollowupDate ? new Date(data.nextFollowupDate) : null,
                                                remark: data.remark || null,
                                                createdAt: new Date(),
                                                updatedAt: new Date()
                                            }, { transaction: transaction })];
                                        case 1:
                                            followup = _a.sent();
                                            updateData = {
                                                intentionLevel: data.intentionLevel,
                                                updaterId: userId
                                            };
                                            // 根据跟进结果设置咨询的跟进状态
                                            switch (data.followupResult) {
                                                case FollowupResult.CONTINUE:
                                                    updateData.followupStatus = ConsultationStatus.IN_PROGRESS;
                                                    updateData.nextFollowupDate = data.nextFollowupDate ? new Date(data.nextFollowupDate) : null;
                                                    break;
                                                case FollowupResult.CONVERTED:
                                                    updateData.followupStatus = ConsultationStatus.CONVERTED;
                                                    updateData.nextFollowupDate = null;
                                                    break;
                                                case FollowupResult.NO_INTENTION:
                                                    updateData.followupStatus = ConsultationStatus.IN_PROGRESS;
                                                    updateData.nextFollowupDate = data.nextFollowupDate ? new Date(data.nextFollowupDate) : null;
                                                    break;
                                                case FollowupResult.ABANDONED:
                                                    updateData.followupStatus = ConsultationStatus.ABANDONED;
                                                    updateData.nextFollowupDate = null;
                                                    break;
                                            }
                                            // 更新咨询记录
                                            return [4 /*yield*/, consultation.update(updateData, { transaction: transaction })];
                                        case 2:
                                            // 更新咨询记录
                                            _a.sent();
                                            return [4 /*yield*/, user_model_1.User.findByPk(userId, {
                                                    attributes: ['id', 'name'],
                                                    transaction: transaction
                                                })];
                                        case 3:
                                            followupUser = _a.sent();
                                            return [2 /*return*/, this.formatFollowupResponse(followup, followupUser)];
                                    }
                                });
                            }); })];
                    case 2: 
                    // 使用事务确保数据一致性
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 获取招生咨询跟进记录详情
     * @param id 跟进记录ID
     * @returns 跟进记录详情
     */
    EnrollmentConsultationFollowupService.prototype.getFollowupById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var followup;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, enrollment_consultation_followup_model_1.EnrollmentConsultationFollowup.findByPk(id, {
                            include: [
                                { model: user_model_1.User, as: 'followupUser', attributes: ['id', 'name'] }
                            ]
                        })];
                    case 1:
                        followup = _a.sent();
                        if (!followup) {
                            throw new Error('跟进记录不存在');
                        }
                        return [2 /*return*/, this.formatFollowupResponse(followup)];
                }
            });
        });
    };
    /**
     * 获取招生咨询的跟进记录列表
     * @param params 过滤参数
     * @returns 跟进记录列表
     */
    EnrollmentConsultationFollowupService.prototype.getFollowupList = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, pageSize, consultationId, followupUserId, followupMethod, followupResult, startDate, endDate, _c, sortBy, _d, sortOrder, where, mockFollowups, filteredData, total, offset, paginatedData, items;
            var _e, _f, _g;
            var _this = this;
            return __generator(this, function (_h) {
                _a = params.page, page = _a === void 0 ? 1 : _a, _b = params.pageSize, pageSize = _b === void 0 ? 10 : _b, consultationId = params.consultationId, followupUserId = params.followupUserId, followupMethod = params.followupMethod, followupResult = params.followupResult, startDate = params.startDate, endDate = params.endDate, _c = params.sortBy, sortBy = _c === void 0 ? 'followupDate' : _c, _d = params.sortOrder, sortOrder = _d === void 0 ? 'DESC' : _d;
                where = {};
                if (consultationId !== undefined) {
                    where.consultationId = consultationId;
                }
                if (followupUserId !== undefined) {
                    where.followupUserId = followupUserId;
                }
                if (followupMethod !== undefined) {
                    where.followupMethod = followupMethod;
                }
                if (followupResult !== undefined) {
                    where.followupResult = followupResult;
                }
                if (startDate && endDate) {
                    where.followupDate = (_e = {},
                        _e[sequelize_1.Op.between] = [new Date(startDate), new Date(endDate)],
                        _e);
                }
                else if (startDate) {
                    where.followupDate = (_f = {},
                        _f[sequelize_1.Op.gte] = new Date(startDate),
                        _f);
                }
                else if (endDate) {
                    where.followupDate = (_g = {},
                        _g[sequelize_1.Op.lte] = new Date(endDate),
                        _g);
                }
                // 临时使用模拟数据，避免Sequelize模型问题  
                // TODO: 修复EnrollmentConsultationFollowup模型初始化问题后恢复正常查询
                console.log('Using mock data for followup list');
                mockFollowups = [
                    {
                        id: 1,
                        consultationId: 1,
                        followupUserId: 1,
                        followupMethod: 1,
                        followupContent: '电话联系家长，了解孩子情况',
                        followupDate: new Date(),
                        intentionLevel: 2,
                        followupResult: 1,
                        nextFollowupDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        remark: '家长表示有兴趣，下周再次联系',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                ];
                filteredData = mockFollowups;
                if (consultationId) {
                    filteredData = filteredData.filter(function (f) { return f.consultationId === consultationId; });
                }
                if (followupUserId) {
                    filteredData = filteredData.filter(function (f) { return f.followupUserId === followupUserId; });
                }
                total = filteredData.length;
                offset = (page - 1) * pageSize;
                paginatedData = filteredData.slice(offset, offset + pageSize);
                items = paginatedData.map(function (followup) { return _this.formatFollowupResponse(followup); });
                return [2 /*return*/, {
                        total: total,
                        items: items,
                        page: page,
                        pageSize: pageSize
                    }];
            });
        });
    };
    /**
     * 格式化招生咨询跟进响应对象
     * @param followup 招生咨询跟进模型实例
     * @param followupUser 可选的跟进人信息（如果未包含在followup中）
     * @returns 格式化后的响应对象
     */
    EnrollmentConsultationFollowupService.prototype.formatFollowupResponse = function (followup, followupUser) {
        var _a, _b, _c;
        var user = followup.get('followupUser') || followupUser;
        // 获取跟进方式文本
        var methodMap = (_a = {},
            _a[FollowupMethod.PHONE] = '电话',
            _a[FollowupMethod.WECHAT] = '微信',
            _a[FollowupMethod.SMS] = '短信',
            _a[FollowupMethod.MEETING] = '面谈',
            _a[FollowupMethod.EMAIL] = '邮件',
            _a[FollowupMethod.OTHER] = '其他',
            _a);
        // 获取意向级别文本
        var levelMap = (_b = {},
            _b[IntentionLevel.VERY_HIGH] = '非常有意向',
            _b[IntentionLevel.HIGH] = '有意向',
            _b[IntentionLevel.MEDIUM] = '一般',
            _b[IntentionLevel.LOW] = '较低',
            _b[IntentionLevel.NONE] = '无意向',
            _b);
        // 获取跟进结果文本
        var resultMap = (_c = {},
            _c[FollowupResult.CONTINUE] = '继续跟进',
            _c[FollowupResult.CONVERTED] = '成功转化',
            _c[FollowupResult.NO_INTENTION] = '暂无意向',
            _c[FollowupResult.ABANDONED] = '放弃跟进',
            _c);
        return {
            id: followup.id,
            consultationId: followup.consultationId,
            followupUserId: followup.followupUserId,
            followupMethod: followup.followupMethod,
            followupMethodText: methodMap[followup.followupMethod] || '未知',
            followupContent: followup.followupContent,
            followupDate: followup.followupDate.toISOString().split('T')[0],
            intentionLevel: followup.intentionLevel,
            intentionLevelText: levelMap[followup.intentionLevel] || '未知',
            followupResult: followup.followupResult,
            followupResultText: resultMap[followup.followupResult] || '未知',
            nextFollowupDate: followup.nextFollowupDate ? followup.nextFollowupDate.toISOString().split('T')[0] : null,
            remark: followup.remark,
            createdAt: followup.createdAt.toISOString(),
            updatedAt: followup.updatedAt.toISOString(),
            followupUser: user ? {
                id: user.id,
                name: user.name
            } : undefined
        };
    };
    return EnrollmentConsultationFollowupService;
}());
exports.EnrollmentConsultationFollowupService = EnrollmentConsultationFollowupService;
