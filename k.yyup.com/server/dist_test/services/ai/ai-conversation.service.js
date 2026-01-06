"use strict";
/**
 * AI会话服务实现
 * 遵循项目规范，类型定义在本文件内，不从外部导入
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
// 导入所需的依赖
var uuid_1 = require("uuid");
var ai_conversation_model_1 = require("../../models/ai-conversation.model");
var sequelize_1 = require("sequelize");
/**
 * AI会话服务类
 * 实现用户AI会话的创建、查询、更新和管理
 */
var AIConversationService = /** @class */ (function () {
    function AIConversationService() {
    }
    /**
     * 创建新会话
     * @param userId 用户ID
     * @param title 可选的会话标题
     * @returns 新创建的会话ID和标题
     */
    AIConversationService.prototype.createConversation = function (userId, title) {
        return __awaiter(this, void 0, void 0, function () {
            var conversationId, conversation, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        conversationId = (0, uuid_1.v4)();
                        return [4 /*yield*/, ai_conversation_model_1.AIConversation.create({
                                id: conversationId,
                                userId: userId,
                                title: title || null
                            })];
                    case 1:
                        conversation = _a.sent();
                        return [2 /*return*/, {
                                id: conversation.id,
                                title: conversation.title
                            }];
                    case 2:
                        error_1 = _a.sent();
                        console.error('创建AI会话失败:', error_1);
                        throw new Error("\u521B\u5EFAAI\u4F1A\u8BDD\u5931\u8D25: ".concat(error_1.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取会话详情
     * @param userId 用户ID
     * @param conversationId 会话ID
     * @returns 会话详情或null
     */
    AIConversationService.prototype.getConversation = function (userId, conversationId) {
        return __awaiter(this, void 0, void 0, function () {
            var conversation, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ai_conversation_model_1.AIConversation.findOne({
                                where: {
                                    userId: userId,
                                    id: conversationId
                                }
                            })];
                    case 1:
                        conversation = _a.sent();
                        if (!conversation) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, {
                                id: conversation.id,
                                title: conversation.title,
                                summary: conversation.summary,
                                messageCount: conversation.messageCount,
                                lastMessageAt: conversation.lastMessageAt,
                                isArchived: conversation.isArchived,
                                createdAt: conversation.createdAt,
                                updatedAt: conversation.updatedAt
                            }];
                    case 2:
                        error_2 = _a.sent();
                        console.error('获取AI会话详情失败:', error_2);
                        throw new Error("\u83B7\u53D6AI\u4F1A\u8BDD\u8BE6\u60C5\u5931\u8D25: ".concat(error_2.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户最近会话列表
     * @param userId 用户ID
     * @param limit 返回数量限制
     * @param includeArchived 是否包含已归档会话
     * @returns 会话列表
     */
    AIConversationService.prototype.getRecentConversations = function (userId, limit, includeArchived) {
        if (limit === void 0) { limit = 10; }
        if (includeArchived === void 0) { includeArchived = false; }
        return __awaiter(this, void 0, void 0, function () {
            var whereConditions, conversations, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        whereConditions = { userId: userId };
                        if (!includeArchived) {
                            whereConditions.isArchived = false;
                        }
                        return [4 /*yield*/, ai_conversation_model_1.AIConversation.findAll({
                                where: whereConditions,
                                limit: limit,
                                order: [['lastMessageAt', 'DESC']]
                            })];
                    case 1:
                        conversations = _a.sent();
                        return [2 /*return*/, conversations.map(function (conversation) { return ({
                                id: conversation.id,
                                title: conversation.title,
                                summary: conversation.summary,
                                messageCount: conversation.messageCount,
                                lastMessageAt: conversation.lastMessageAt,
                                isArchived: conversation.isArchived,
                                createdAt: conversation.createdAt,
                                updatedAt: conversation.updatedAt
                            }); })];
                    case 2:
                        error_3 = _a.sent();
                        console.error('获取用户最近会话列表失败:', error_3);
                        throw new Error("\u83B7\u53D6\u7528\u6237\u6700\u8FD1\u4F1A\u8BDD\u5217\u8868\u5931\u8D25: ".concat(error_3.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新会话标题
     * @param userId 用户ID
     * @param conversationId 会话ID
     * @param title 新标题
     * @returns 是否成功
     */
    AIConversationService.prototype.updateConversationTitle = function (userId, conversationId, title) {
        return __awaiter(this, void 0, void 0, function () {
            var conversation, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, ai_conversation_model_1.AIConversation.findOne({
                                where: {
                                    userId: userId,
                                    id: conversationId
                                }
                            })];
                    case 1:
                        conversation = _a.sent();
                        if (!conversation) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, conversation.update({ title: title })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_4 = _a.sent();
                        console.error('更新会话标题失败:', error_4);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新会话摘要
     * @param userId 用户ID
     * @param conversationId 会话ID
     * @param summary 新摘要
     * @returns 是否成功
     */
    AIConversationService.prototype.updateConversationSummary = function (userId, conversationId, summary) {
        return __awaiter(this, void 0, void 0, function () {
            var conversation, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, ai_conversation_model_1.AIConversation.findOne({
                                where: {
                                    userId: userId,
                                    id: conversationId
                                }
                            })];
                    case 1:
                        conversation = _a.sent();
                        if (!conversation) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, conversation.update({ summary: summary })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_5 = _a.sent();
                        console.error('更新会话摘要失败:', error_5);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 归档会话
     * @param userId 用户ID
     * @param conversationId 会话ID
     * @returns 是否成功
     */
    AIConversationService.prototype.archiveConversation = function (userId, conversationId) {
        return __awaiter(this, void 0, void 0, function () {
            var conversation, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, ai_conversation_model_1.AIConversation.findOne({
                                where: {
                                    userId: userId,
                                    id: conversationId
                                }
                            })];
                    case 1:
                        conversation = _a.sent();
                        if (!conversation) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, conversation.update({ isArchived: true })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_6 = _a.sent();
                        console.error('归档会话失败:', error_6);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 恢复归档的会话
     * @param userId 用户ID
     * @param conversationId 会话ID
     * @returns 是否成功
     */
    AIConversationService.prototype.unarchiveConversation = function (userId, conversationId) {
        return __awaiter(this, void 0, void 0, function () {
            var conversation, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, ai_conversation_model_1.AIConversation.findOne({
                                where: {
                                    userId: userId,
                                    id: conversationId
                                }
                            })];
                    case 1:
                        conversation = _a.sent();
                        if (!conversation) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, conversation.update({ isArchived: false })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_7 = _a.sent();
                        console.error('恢复归档会话失败:', error_7);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除会话
     * @param userId 用户ID
     * @param conversationId 会话ID
     * @returns 是否成功
     */
    AIConversationService.prototype.deleteConversation = function (userId, conversationId) {
        return __awaiter(this, void 0, void 0, function () {
            var conversation, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, ai_conversation_model_1.AIConversation.findOne({
                                where: {
                                    userId: userId,
                                    id: conversationId
                                }
                            })];
                    case 1:
                        conversation = _a.sent();
                        if (!conversation) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, conversation.destroy()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_8 = _a.sent();
                        console.error('删除会话失败:', error_8);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 搜索会话
     * @param userId 用户ID
     * @param searchTerm 搜索词
     * @param limit 结果数量限制
     * @returns 会话列表
     */
    AIConversationService.prototype.searchConversations = function (userId, searchTerm, limit) {
        if (limit === void 0) { limit = 20; }
        return __awaiter(this, void 0, void 0, function () {
            var conversations, error_9;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ai_conversation_model_1.AIConversation.findAll({
                                where: (_a = {
                                        userId: userId
                                    },
                                    _a[sequelize_1.Op.or] = [
                                        { title: (_b = {}, _b[sequelize_1.Op.like] = "%".concat(searchTerm, "%"), _b) },
                                        { summary: (_c = {}, _c[sequelize_1.Op.like] = "%".concat(searchTerm, "%"), _c) }
                                    ],
                                    _a),
                                limit: limit,
                                order: [['lastMessageAt', 'DESC']]
                            })];
                    case 1:
                        conversations = _d.sent();
                        return [2 /*return*/, conversations.map(function (conversation) { return ({
                                id: conversation.id,
                                title: conversation.title,
                                summary: conversation.summary,
                                messageCount: conversation.messageCount,
                                lastMessageAt: conversation.lastMessageAt,
                                isArchived: conversation.isArchived,
                                createdAt: conversation.createdAt,
                                updatedAt: conversation.updatedAt
                            }); })];
                    case 2:
                        error_9 = _d.sent();
                        console.error('搜索会话失败:', error_9);
                        throw new Error("\u641C\u7D22\u4F1A\u8BDD\u5931\u8D25: ".concat(error_9.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return AIConversationService;
}());
// 导出服务实例
exports["default"] = new AIConversationService();
