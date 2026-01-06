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
exports.ConversationService = void 0;
var ai_conversation_model_1 = require("../../models/ai-conversation.model");
var apiError_1 = require("../../utils/apiError");
var sequelize_1 = require("sequelize");
/**
 * AI会话服务
 * 负责处理会话相关的业务逻辑
 */
var ConversationService = /** @class */ (function () {
    function ConversationService() {
    }
    /**
     * @description 获取指定用户的所有会话（支持分页和过滤）
     * @param userId 用户ID
     * @param options 查询选项
     * @returns 分页会话列表
     */
    ConversationService.prototype.getUserConversations = function (userId, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, pageSize, isArchived, keyword, where, findOptions, _c, count, rows;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = options.page, page = _a === void 0 ? 1 : _a, _b = options.pageSize, pageSize = _b === void 0 ? 10 : _b, isArchived = options.isArchived, keyword = options.keyword;
                        where = { userId: userId };
                        if (isArchived !== undefined)
                            where.isArchived = isArchived;
                        if (keyword && keyword.trim()) {
                            // 关键字匹配标题或摘要
                            where[sequelize_1.Op.or] = [
                                { title: (_d = {}, _d[sequelize_1.Op.like] = "%".concat(keyword, "%"), _d) },
                                { summary: (_e = {}, _e[sequelize_1.Op.like] = "%".concat(keyword, "%"), _e) }
                            ];
                        }
                        findOptions = {
                            where: where,
                            order: [
                                // 优先显示有消息的会话
                                ['messageCount', 'DESC'],
                                ['lastMessageAt', 'DESC'],
                                ['updatedAt', 'DESC']
                            ],
                            limit: pageSize,
                            offset: (page - 1) * pageSize
                        };
                        return [4 /*yield*/, ai_conversation_model_1.AIConversation.findAndCountAll(findOptions)];
                    case 1:
                        _c = _f.sent(), count = _c.count, rows = _c.rows;
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
     * @description 获取单个会话的详细信息
     * @param conversationId 会话ID
     * @param userId 用户ID
     * @returns 会话详情
     * @throws ApiError 如会话不存在或用户无权访问
     */
    ConversationService.prototype.getConversationDetails = function (conversationId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var conversation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_conversation_model_1.AIConversation.findOne({
                            where: { id: conversationId, userId: userId }
                        })];
                    case 1:
                        conversation = _a.sent();
                        if (!conversation) {
                            throw apiError_1.ApiError.notFound('会话不存在或无权访问');
                        }
                        return [2 /*return*/, conversation];
                }
            });
        });
    };
    /**
     * @description 创建一个新的会话
     * @param userId 用户ID
     * @param title 可选的会话标题
     * @returns 创建的会话
     */
    ConversationService.prototype.createConversation = function (userId, title) {
        return __awaiter(this, void 0, void 0, function () {
            var newConversation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_conversation_model_1.AIConversation.create({
                            userId: userId,
                            title: title || '新的会话'
                        })];
                    case 1:
                        newConversation = _a.sent();
                        return [2 /*return*/, newConversation];
                }
            });
        });
    };
    /**
     * @description 更新会话信息（如标题、归档状态）
     * @param conversationId 会话ID
     * @param userId 用户ID
     * @param data 更新数据
     * @returns 更新后的会话
     * @throws ApiError 如会话不存在或用户无权访问
     */
    ConversationService.prototype.updateConversation = function (conversationId, userId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var conversation, title, isArchived;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConversationDetails(conversationId, userId)];
                    case 1:
                        conversation = _a.sent();
                        title = data.title, isArchived = data.isArchived;
                        if (title !== undefined) {
                            conversation.title = title;
                        }
                        if (isArchived !== undefined) {
                            conversation.isArchived = isArchived;
                        }
                        return [4 /*yield*/, conversation.save()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, conversation];
                }
            });
        });
    };
    /**
     * @description 删除一个会话
     * @param conversationId 会话ID
     * @param userId 用户ID
     * @throws ApiError 如会话不存在或用户无权访问
     */
    ConversationService.prototype.deleteConversation = function (conversationId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var conversation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConversationDetails(conversationId, userId)];
                    case 1:
                        conversation = _a.sent();
                        return [4 /*yield*/, conversation.destroy()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ConversationService;
}());
exports.ConversationService = ConversationService;
// 导出服务实例
exports["default"] = new ConversationService();
