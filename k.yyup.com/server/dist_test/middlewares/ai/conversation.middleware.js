"use strict";
/**
 * AI会话中间层
 * 处理用户与AI的会话管理，组合会话服务、消息服务和记忆服务
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.aiConversationMiddleware = void 0;
var ai_1 = require("../../services/ai");
var base_middleware_1 = require("./base.middleware");
/**
 * AI会话中间层实现
 */
var AiConversationMiddleware = /** @class */ (function (_super) {
    __extends(AiConversationMiddleware, _super);
    function AiConversationMiddleware() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * 创建会话
     * @param userId 用户ID
     * @param title 会话标题（可选）
     * @returns 创建的会话信息
     */
    AiConversationMiddleware.prototype.createConversation = function (userId, title) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, conversation, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:conversation:create'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有创建会话的权限', { userId: userId });
                        }
                        return [4 /*yield*/, ai_1.aiConversationService.createConversation(userId, title)];
                    case 2:
                        conversation = _a.sent();
                        // 记录操作
                        return [4 /*yield*/, this.logOperation(userId, 'CREATE_CONVERSATION', {
                                conversationId: conversation.id,
                                title: conversation.title
                            })];
                    case 3:
                        // 记录操作
                        _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(conversation)];
                    case 4:
                        error_1 = _a.sent();
                        return [2 /*return*/, this.handleError(error_1)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户会话列表
     * @param userId 用户ID
     * @param includeArchived 是否包含已归档会话
     * @returns 会话列表
     */
    AiConversationMiddleware.prototype.getConversations = function (userId, includeArchived) {
        if (includeArchived === void 0) { includeArchived = false; }
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, conversations, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:conversation:read'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有查看会话的权限', { userId: userId });
                        }
                        return [4 /*yield*/, ai_1.aiConversationService.getRecentConversations(userId, 20, // 默认返回20条
                            includeArchived)];
                    case 2:
                        conversations = _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(conversations)];
                    case 3:
                        error_2 = _a.sent();
                        return [2 /*return*/, this.handleError(error_2)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取会话详情
     * @param userId 用户ID
     * @param conversationId 会话ID
     * @returns 会话详情
     */
    AiConversationMiddleware.prototype.getConversationDetails = function (userId, conversationId) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, conversation, messages, memories, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:conversation:read'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有查看会话详情的权限', { userId: userId, conversationId: conversationId });
                        }
                        return [4 /*yield*/, ai_1.aiConversationService.getConversation(userId, conversationId)];
                    case 2:
                        conversation = _a.sent();
                        if (!conversation) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.NOT_FOUND, '会话不存在或无权访问', { conversationId: conversationId });
                        }
                        messages = [];
                        memories = [];
                        result = __assign(__assign({}, conversation), { messages: messages, memories: memories });
                        return [2 /*return*/, this.createSuccessResponse(result)];
                    case 3:
                        error_3 = _a.sent();
                        return [2 /*return*/, this.handleError(error_3)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新会话信息
     * @param userId 用户ID
     * @param conversationId 会话ID
     * @param data 更新数据
     * @returns 更新结果
     */
    AiConversationMiddleware.prototype.updateConversation = function (userId, conversationId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, conversation, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 12, , 13]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:conversation:update'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有更新会话的权限', { userId: userId, conversationId: conversationId });
                        }
                        return [4 /*yield*/, ai_1.aiConversationService.getConversation(userId, conversationId)];
                    case 2:
                        conversation = _a.sent();
                        if (!conversation) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.NOT_FOUND, '会话不存在或无权访问', { conversationId: conversationId });
                        }
                        result = false;
                        if (!(data.title !== undefined)) return [3 /*break*/, 4];
                        return [4 /*yield*/, ai_1.aiConversationService.updateConversationTitle(userId, conversationId, data.title)];
                    case 3:
                        result = _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!(data.summary !== undefined)) return [3 /*break*/, 6];
                        return [4 /*yield*/, ai_1.aiConversationService.updateConversationSummary(userId, conversationId, data.summary)];
                    case 5:
                        result = _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!(data.isArchived !== undefined)) return [3 /*break*/, 10];
                        if (!data.isArchived) return [3 /*break*/, 8];
                        return [4 /*yield*/, ai_1.aiConversationService.archiveConversation(userId, conversationId)];
                    case 7:
                        result = _a.sent();
                        return [3 /*break*/, 10];
                    case 8: return [4 /*yield*/, ai_1.aiConversationService.unarchiveConversation(userId, conversationId)];
                    case 9:
                        result = _a.sent();
                        _a.label = 10;
                    case 10: 
                    // 记录操作
                    return [4 /*yield*/, this.logOperation(userId, 'UPDATE_CONVERSATION', {
                            conversationId: conversationId,
                            data: data
                        })];
                    case 11:
                        // 记录操作
                        _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(result)];
                    case 12:
                        error_4 = _a.sent();
                        return [2 /*return*/, this.handleError(error_4)];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除会话
     * @param userId 用户ID
     * @param conversationId 会话ID
     * @returns 删除结果
     */
    AiConversationMiddleware.prototype.deleteConversation = function (userId, conversationId) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:conversation:delete'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有删除会话的权限', { userId: userId, conversationId: conversationId });
                        }
                        return [4 /*yield*/, ai_1.aiConversationService.deleteConversation(userId, conversationId)];
                    case 2:
                        result = _a.sent();
                        if (!result) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.NOT_FOUND, '会话不存在或无权访问', { conversationId: conversationId });
                        }
                        // 记录操作
                        return [4 /*yield*/, this.logOperation(userId, 'DELETE_CONVERSATION', { conversationId: conversationId })];
                    case 3:
                        // 记录操作
                        _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(result)];
                    case 4:
                        error_5 = _a.sent();
                        return [2 /*return*/, this.handleError(error_5)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 发送消息
     * @param userId 用户ID
     * @param conversationId 会话ID
     * @param content 消息内容
     * @returns 消息发送结果
     */
    AiConversationMiddleware.prototype.sendMessage = function (userId, conversationId, content) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, conversation, aiMessage, importantInfo, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:message:create'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有发送消息的权限', { userId: userId, conversationId: conversationId });
                        }
                        return [4 /*yield*/, ai_1.aiConversationService.getConversation(userId, conversationId)];
                    case 2:
                        conversation = _a.sent();
                        if (!conversation) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.NOT_FOUND, '会话不存在或无权访问', { conversationId: conversationId });
                        }
                        return [4 /*yield*/, ai_1.messageService.sendMessage({
                                conversationId: conversationId,
                                userId: userId,
                                content: content,
                                metadata: {}
                            })];
                    case 3:
                        aiMessage = _a.sent();
                        importantInfo = content.length > 50 ? content.substring(0, 50) + '...' : null;
                        if (importantInfo) {
                            // 记忆创建已由六维记忆系统处理
                            console.log('记忆创建由六维记忆系统处理', { userId: userId, conversationId: conversationId, contentLength: importantInfo.length });
                        }
                        // 记录操作
                        return [4 /*yield*/, this.logOperation(userId, 'SEND_MESSAGE', {
                                conversationId: conversationId,
                                messageId: aiMessage.id
                            })];
                    case 4:
                        // 记录操作
                        _a.sent();
                        // 返回结果
                        return [2 /*return*/, this.createSuccessResponse({
                                aiMessage: aiMessage
                            })];
                    case 5:
                        error_6 = _a.sent();
                        return [2 /*return*/, this.handleError(error_6)];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取会话消息
     * @param userId 用户ID
     * @param conversationId 会话ID
     * @param limit 消息数量限制
     * @returns 消息列表
     */
    AiConversationMiddleware.prototype.getMessages = function (userId, conversationId, limit) {
        if (limit === void 0) { limit = 50; }
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, conversation, messages, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:message:read'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有查看消息的权限', { userId: userId, conversationId: conversationId });
                        }
                        return [4 /*yield*/, ai_1.aiConversationService.getConversation(userId, conversationId)];
                    case 2:
                        conversation = _a.sent();
                        if (!conversation) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.NOT_FOUND, '会话不存在或无权访问', { conversationId: conversationId });
                        }
                        messages = [];
                        return [2 /*return*/, this.createSuccessResponse(messages)];
                    case 3:
                        error_7 = _a.sent();
                        return [2 /*return*/, this.handleError(error_7)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建记忆
     * @param userId 用户ID
     * @param conversationId 会话ID
     * @param content 记忆内容
     * @param type 记忆类型
     * @returns 创建的记忆信息
     */
    AiConversationMiddleware.prototype.createMemory = function (userId, conversationId, content, type) {
        if (type === void 0) { type = 'immediate'; }
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, conversation, memory, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:memory:create'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有创建记忆的权限', { userId: userId, conversationId: conversationId });
                        }
                        return [4 /*yield*/, ai_1.aiConversationService.getConversation(userId, conversationId)];
                    case 2:
                        conversation = _a.sent();
                        if (!conversation) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.NOT_FOUND, '会话不存在或无权访问', { conversationId: conversationId });
                        }
                        memory = { id: 0, message: '记忆创建由六维记忆系统处理' };
                        console.log('记忆创建由六维记忆系统处理', { userId: userId, conversationId: conversationId, contentLength: content.length });
                        // 记录操作
                        return [4 /*yield*/, this.logOperation(userId, 'CREATE_MEMORY', {
                                conversationId: conversationId,
                                memoryId: memory.id,
                                type: type
                            })];
                    case 3:
                        // 记录操作
                        _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(memory)];
                    case 4:
                        error_8 = _a.sent();
                        return [2 /*return*/, this.handleError(error_8)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取会话记忆
     * @param userId 用户ID
     * @param conversationId 会话ID
     * @returns 记忆列表
     */
    AiConversationMiddleware.prototype.getMemories = function (userId, conversationId) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, conversation, memories, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:memory:read'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有查看记忆的权限', { userId: userId, conversationId: conversationId });
                        }
                        return [4 /*yield*/, ai_1.aiConversationService.getConversation(userId, conversationId)];
                    case 2:
                        conversation = _a.sent();
                        if (!conversation) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.NOT_FOUND, '会话不存在或无权访问', { conversationId: conversationId });
                        }
                        memories = [];
                        return [2 /*return*/, this.createSuccessResponse(memories)];
                    case 3:
                        error_9 = _a.sent();
                        return [2 /*return*/, this.handleError(error_9)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return AiConversationMiddleware;
}(base_middleware_1.BaseMiddleware));
// 导出单例实例
exports.aiConversationMiddleware = new AiConversationMiddleware();
