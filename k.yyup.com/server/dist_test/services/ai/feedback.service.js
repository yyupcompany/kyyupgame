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
exports.FeedbackService = void 0;
var ai_feedback_model_1 = require("../../models/ai-feedback.model");
var apiError_1 = require("../../utils/apiError");
var sequelize_1 = require("sequelize");
/**
 * AI反馈服务
 * 负责处理反馈相关的业务逻辑
 */
var FeedbackService = /** @class */ (function () {
    function FeedbackService() {
    }
    /**
     * @description 创建一条新的用户反馈
     * @param dto 创建反馈所需的数据
     * @returns 创建的反馈记录
     */
    FeedbackService.prototype.createFeedback = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, feedbackType, sourceType, sourceId, content, rating, newFeedback;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = dto.userId, feedbackType = dto.feedbackType, sourceType = dto.sourceType, sourceId = dto.sourceId, content = dto.content, rating = dto.rating;
                        return [4 /*yield*/, ai_feedback_model_1.AIFeedback.create({
                                userId: userId,
                                feedbackType: feedbackType,
                                sourceType: sourceType,
                                sourceId: sourceId,
                                content: content,
                                rating: rating,
                                status: ai_feedback_model_1.FeedbackStatus.PENDING
                            })];
                    case 1:
                        newFeedback = _a.sent();
                        return [2 /*return*/, newFeedback];
                }
            });
        });
    };
    /**
     * 获取反馈列表，支持分页和过滤
     * @param params 查询参数
     * @param options 分页选项
     * @returns 分页反馈列表
     */
    FeedbackService.prototype.getFeedbackList = function (params, options) {
        if (params === void 0) { params = {}; }
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, pageSize, whereClause, findOptions, _c, count, rows;
            var _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _a = options.page, page = _a === void 0 ? 1 : _a, _b = options.pageSize, pageSize = _b === void 0 ? 20 : _b;
                        whereClause = {};
                        // 构建查询条件
                        if (params.userId) {
                            whereClause.userId = params.userId;
                        }
                        if (params.feedbackType) {
                            whereClause.feedbackType = params.feedbackType;
                        }
                        if (params.sourceType) {
                            whereClause.sourceType = params.sourceType;
                        }
                        if (params.sourceId) {
                            whereClause.sourceId = params.sourceId;
                        }
                        if (params.status) {
                            whereClause.status = params.status;
                        }
                        if (params.startDate && params.endDate) {
                            whereClause.createdAt = (_d = {},
                                _d[sequelize_1.Op.between] = [params.startDate, params.endDate],
                                _d);
                        }
                        else if (params.startDate) {
                            whereClause.createdAt = (_e = {},
                                _e[sequelize_1.Op.gte] = params.startDate,
                                _e);
                        }
                        else if (params.endDate) {
                            whereClause.createdAt = (_f = {},
                                _f[sequelize_1.Op.lte] = params.endDate,
                                _f);
                        }
                        findOptions = {
                            where: whereClause,
                            order: [['createdAt', 'DESC']],
                            limit: pageSize,
                            offset: (page - 1) * pageSize
                        };
                        return [4 /*yield*/, ai_feedback_model_1.AIFeedback.findAndCountAll(findOptions)];
                    case 1:
                        _c = _g.sent(), count = _c.count, rows = _c.rows;
                        return [2 /*return*/, {
                                data: rows,
                                meta: {
                                    page: page,
                                    pageSize: pageSize,
                                    totalItems: count,
                                    totalPages: Math.ceil(count / pageSize)
                                }
                            }];
                }
            });
        });
    };
    /**
     * 获取指定ID的反馈详情
     * @param id 反馈ID
     * @returns 反馈详情
     * @throws ApiError 如反馈不存在
     */
    FeedbackService.prototype.getFeedbackById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var feedback;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_feedback_model_1.AIFeedback.findByPk(id)];
                    case 1:
                        feedback = _a.sent();
                        if (!feedback) {
                            throw apiError_1.ApiError.notFound('反馈不存在');
                        }
                        return [2 /*return*/, feedback];
                }
            });
        });
    };
    /**
     * 更新反馈状态和管理员备注
     * @param id 反馈ID
     * @param updateDto 更新数据
     * @returns 更新后的反馈
     * @throws ApiError 如反馈不存在
     */
    FeedbackService.prototype.updateFeedback = function (id, updateDto) {
        return __awaiter(this, void 0, void 0, function () {
            var feedback;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getFeedbackById(id)];
                    case 1:
                        feedback = _a.sent();
                        if (updateDto.status) {
                            feedback.status = updateDto.status;
                        }
                        if (updateDto.adminNotes !== undefined) {
                            feedback.adminNotes = updateDto.adminNotes;
                        }
                        return [4 /*yield*/, feedback.save()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, feedback];
                }
            });
        });
    };
    /**
     * 删除指定ID的反馈
     * @param id 反馈ID
     * @throws ApiError 如反馈不存在
     */
    FeedbackService.prototype.deleteFeedback = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var feedback;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getFeedbackById(id)];
                    case 1:
                        feedback = _a.sent();
                        return [4 /*yield*/, feedback.destroy()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return FeedbackService;
}());
exports.FeedbackService = FeedbackService;
// 导出服务实例
exports["default"] = new FeedbackService();
