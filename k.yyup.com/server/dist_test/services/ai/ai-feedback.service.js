"use strict";
/**
 * AI反馈服务
 * 处理用户对AI系统的反馈收集、管理和分析
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
var ai_feedback_model_1 = require("../../models/ai-feedback.model");
var sequelize_1 = require("sequelize");
/**
 * AI反馈服务类
 */
var AIFeedbackService = /** @class */ (function () {
    function AIFeedbackService() {
    }
    /**
     * 创建反馈
     * @param userId 用户ID
     * @param feedbackType 反馈类型
     * @param sourceType 来源类型
     * @param content 反馈内容
     * @param sourceId 来源ID
     * @param rating 评分
     * @returns 创建的反馈ID
     */
    AIFeedbackService.prototype.createFeedback = function (userId, feedbackType, sourceType, content, sourceId, rating) {
        return __awaiter(this, void 0, void 0, function () {
            var modelFeedbackType, modelSourceType, feedback;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // 验证评分范围
                        if (rating !== undefined && rating !== null) {
                            if (rating < 1 || rating > 5) {
                                throw new Error('Rating must be between 1 and 5');
                            }
                        }
                        switch (feedbackType) {
                            case 'general':
                                modelFeedbackType = ai_feedback_model_1.FeedbackType.GENERAL;
                                break;
                            case 'response':
                                modelFeedbackType = ai_feedback_model_1.FeedbackType.RESPONSE;
                                break;
                            case 'suggestion':
                                modelFeedbackType = ai_feedback_model_1.FeedbackType.SUGGESTION;
                                break;
                            case 'bug':
                                modelFeedbackType = ai_feedback_model_1.FeedbackType.BUG;
                                break;
                            case 'feature':
                                modelFeedbackType = ai_feedback_model_1.FeedbackType.FEATURE;
                                break;
                            default:
                                modelFeedbackType = ai_feedback_model_1.FeedbackType.GENERAL;
                        }
                        switch (sourceType) {
                            case 'conversation':
                                modelSourceType = ai_feedback_model_1.FeedbackSource.CONVERSATION;
                                break;
                            case 'message':
                                modelSourceType = ai_feedback_model_1.FeedbackSource.MESSAGE;
                                break;
                            case 'application':
                                modelSourceType = ai_feedback_model_1.FeedbackSource.APPLICATION;
                                break;
                            case 'system':
                                modelSourceType = ai_feedback_model_1.FeedbackSource.SYSTEM;
                                break;
                            default:
                                modelSourceType = ai_feedback_model_1.FeedbackSource.SYSTEM;
                        }
                        return [4 /*yield*/, ai_feedback_model_1.AIFeedback.create({
                                userId: userId,
                                feedbackType: modelFeedbackType,
                                sourceType: modelSourceType,
                                sourceId: sourceId || null,
                                content: content,
                                rating: rating || null,
                                status: ai_feedback_model_1.FeedbackStatus.PENDING
                            })];
                    case 1:
                        feedback = _a.sent();
                        return [2 /*return*/, { id: feedback.id }];
                }
            });
        });
    };
    /**
     * 获取用户反馈
     * @param userId 用户ID
     * @param limit 限制数量
     * @returns 用户反馈列表
     */
    AIFeedbackService.prototype.getUserFeedbacks = function (userId, limit) {
        if (limit === void 0) { limit = 20; }
        return __awaiter(this, void 0, void 0, function () {
            var feedbacks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_feedback_model_1.AIFeedback.findAll({ where: { userId: userId }, limit: limit })];
                    case 1:
                        feedbacks = _a.sent();
                        return [2 /*return*/, feedbacks.map(function (feedback) { return ({
                                id: feedback.id,
                                feedbackType: feedback.feedbackType,
                                sourceType: feedback.sourceType,
                                sourceId: feedback.sourceId,
                                content: feedback.content,
                                rating: feedback.rating,
                                status: feedback.status,
                                createdAt: feedback.createdAt
                            }); })];
                }
            });
        });
    };
    /**
     * 获取特定状态的反馈
     * @param status 反馈状态
     * @param limit 限制数量
     * @returns 反馈列表
     */
    AIFeedbackService.prototype.getFeedbacksByStatus = function (status, limit) {
        if (limit === void 0) { limit = 50; }
        return __awaiter(this, void 0, void 0, function () {
            var modelStatus, feedbacks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        switch (status) {
                            case 'pending':
                                modelStatus = ai_feedback_model_1.FeedbackStatus.PENDING;
                                break;
                            case 'reviewed':
                                modelStatus = ai_feedback_model_1.FeedbackStatus.REVIEWED;
                                break;
                            case 'resolved':
                                modelStatus = ai_feedback_model_1.FeedbackStatus.RESOLVED;
                                break;
                            case 'ignored':
                                modelStatus = ai_feedback_model_1.FeedbackStatus.IGNORED;
                                break;
                            default:
                                modelStatus = ai_feedback_model_1.FeedbackStatus.PENDING;
                        }
                        return [4 /*yield*/, ai_feedback_model_1.AIFeedback.findAll({ where: { status: modelStatus }, limit: limit })];
                    case 1:
                        feedbacks = _a.sent();
                        return [2 /*return*/, feedbacks.map(function (feedback) { return ({
                                id: feedback.id,
                                userId: feedback.userId,
                                feedbackType: feedback.feedbackType,
                                sourceType: feedback.sourceType,
                                sourceId: feedback.sourceId,
                                content: feedback.content,
                                rating: feedback.rating,
                                status: feedback.status,
                                adminNotes: feedback.adminNotes,
                                createdAt: feedback.createdAt,
                                updatedAt: feedback.updatedAt
                            }); })];
                }
            });
        });
    };
    /**
     * 更新反馈状态
     * @param feedbackId 反馈ID
     * @param status 新状态
     * @param adminNotes 管理员备注
     * @returns 是否更新成功
     */
    AIFeedbackService.prototype.updateFeedbackStatus = function (feedbackId, status, adminNotes) {
        return __awaiter(this, void 0, void 0, function () {
            var feedback, modelStatus;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_feedback_model_1.AIFeedback.findByPk(feedbackId)];
                    case 1:
                        feedback = _a.sent();
                        if (!feedback) {
                            return [2 /*return*/, false];
                        }
                        switch (status) {
                            case 'pending':
                                modelStatus = ai_feedback_model_1.FeedbackStatus.PENDING;
                                break;
                            case 'reviewed':
                                modelStatus = ai_feedback_model_1.FeedbackStatus.REVIEWED;
                                break;
                            case 'resolved':
                                modelStatus = ai_feedback_model_1.FeedbackStatus.RESOLVED;
                                break;
                            case 'ignored':
                                modelStatus = ai_feedback_model_1.FeedbackStatus.IGNORED;
                                break;
                            default:
                                modelStatus = ai_feedback_model_1.FeedbackStatus.PENDING;
                        }
                        return [4 /*yield*/, feedback.update({
                                status: modelStatus,
                                adminNotes: adminNotes !== undefined ? adminNotes : feedback.adminNotes
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * 获取反馈详情
     * @param feedbackId 反馈ID
     * @returns 反馈详情
     */
    AIFeedbackService.prototype.getFeedbackDetails = function (feedbackId) {
        return __awaiter(this, void 0, void 0, function () {
            var feedback;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_feedback_model_1.AIFeedback.findByPk(feedbackId)];
                    case 1:
                        feedback = _a.sent();
                        if (!feedback) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, {
                                id: feedback.id,
                                userId: feedback.userId,
                                feedbackType: feedback.feedbackType,
                                sourceType: feedback.sourceType,
                                sourceId: feedback.sourceId,
                                content: feedback.content,
                                rating: feedback.rating,
                                status: feedback.status,
                                adminNotes: feedback.adminNotes,
                                createdAt: feedback.createdAt,
                                updatedAt: feedback.updatedAt
                            }];
                }
            });
        });
    };
    /**
     * 获取反馈统计
     * @returns 反馈统计数据
     */
    AIFeedbackService.prototype.getFeedbackStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var total, statusCounts, typeCounts, statusStats, typeStats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_feedback_model_1.AIFeedback.count()];
                    case 1:
                        total = _a.sent();
                        return [4 /*yield*/, ai_feedback_model_1.AIFeedback.findAll({
                                attributes: [
                                    'status',
                                    [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'count']
                                ],
                                group: ['status'],
                                raw: true
                            })];
                    case 2:
                        statusCounts = _a.sent();
                        return [4 /*yield*/, ai_feedback_model_1.AIFeedback.findAll({
                                attributes: [
                                    'feedbackType',
                                    [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'count']
                                ],
                                group: ['feedbackType'],
                                raw: true
                            })];
                    case 3:
                        typeCounts = _a.sent();
                        statusStats = {
                            total: total,
                            pending: 0,
                            reviewed: 0,
                            resolved: 0,
                            ignored: 0
                        };
                        // 将数据库枚举状态映射到接口状态
                        statusCounts.forEach(function (item) {
                            var interfaceStatus;
                            switch (item.status) {
                                case ai_feedback_model_1.FeedbackStatus.PENDING:
                                    interfaceStatus = 'pending';
                                    break;
                                case ai_feedback_model_1.FeedbackStatus.REVIEWED:
                                    interfaceStatus = 'reviewed';
                                    break;
                                case ai_feedback_model_1.FeedbackStatus.RESOLVED:
                                    interfaceStatus = 'resolved';
                                    break;
                                case ai_feedback_model_1.FeedbackStatus.IGNORED:
                                    interfaceStatus = 'ignored';
                                    break;
                                default:
                                    interfaceStatus = 'pending';
                            }
                            statusStats[interfaceStatus] = parseInt(item.count, 10);
                        });
                        typeStats = {
                            general: 0,
                            response: 0,
                            suggestion: 0,
                            bug: 0,
                            feature: 0
                        };
                        // 将数据库枚举类型映射到接口类型
                        typeCounts.forEach(function (item) {
                            var interfaceType;
                            switch (item.feedbackType) {
                                case ai_feedback_model_1.FeedbackType.GENERAL:
                                    interfaceType = 'general';
                                    break;
                                case ai_feedback_model_1.FeedbackType.RESPONSE:
                                    interfaceType = 'response';
                                    break;
                                case ai_feedback_model_1.FeedbackType.SUGGESTION:
                                    interfaceType = 'suggestion';
                                    break;
                                case ai_feedback_model_1.FeedbackType.BUG:
                                    interfaceType = 'bug';
                                    break;
                                case ai_feedback_model_1.FeedbackType.FEATURE:
                                    interfaceType = 'feature';
                                    break;
                                default:
                                    interfaceType = 'general';
                            }
                            typeStats[interfaceType] = parseInt(item.count, 10);
                        });
                        return [2 /*return*/, __assign(__assign({}, statusStats), { byType: typeStats })];
                }
            });
        });
    };
    return AIFeedbackService;
}());
exports["default"] = new AIFeedbackService();
