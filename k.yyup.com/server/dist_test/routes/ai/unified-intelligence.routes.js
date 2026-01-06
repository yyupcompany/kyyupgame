"use strict";
/**
 * 统一智能系统路由
 * 提供新的统一AI智能处理接口
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var unified_intelligence_service_1 = __importDefault(require("../../services/ai-operator/unified-intelligence.service"));
var ai_message_model_1 = require("../../models/ai-message.model");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
// EventEmitter for SSE support
var events_1 = require("events");
var AIProgressEmitter = /** @class */ (function (_super) {
    __extends(AIProgressEmitter, _super);
    function AIProgressEmitter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AIProgressEmitter;
}(events_1.EventEmitter));
var aiProgressEmitter = new AIProgressEmitter();
var router = (0, express_1.Router)();
/**
 * 从消息中提取文件链接
 */
function extractFileLinks(message) {
    var fileLinks = [];
    // 匹配文件链接格式: [📄 filename](url)
    var fileRegex = /\[📄\s*([^\]]+)\]\(([^)]+)\)/g;
    var match;
    while ((match = fileRegex.exec(message)) !== null) {
        fileLinks.push({
            type: 'file',
            name: match[1].trim(),
            url: match[2].trim()
        });
    }
    // 匹配图片链接格式: ![filename](url)
    var imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    while ((match = imageRegex.exec(message)) !== null) {
        fileLinks.push({
            type: 'image',
            name: match[1].trim() || 'image',
            url: match[2].trim()
        });
    }
    return fileLinks;
}
/**
 * 处理多模态聊天（包含文件的消息）
 */
function handleMultimodalChat(message, fileLinks, modelConfig, userId, res, context) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __awaiter(this, void 0, void 0, function () {
        var fileContents, _i, fileLinks_1, fileLink, filePath, content_1, fullMessage, textModelService, MessageRole_1, UnifiedIntelligenceService, intelligenceService, organizationStatusText, systemPrompt, result, content, error_1;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    _j.trys.push([0, 6, , 7]);
                    console.log('🎭 [MultimodalChat] 开始处理多模态消息');
                    fileContents = [];
                    for (_i = 0, fileLinks_1 = fileLinks; _i < fileLinks_1.length; _i++) {
                        fileLink = fileLinks_1[_i];
                        try {
                            filePath = path.join(process.cwd(), 'uploads', fileLink.url.replace('/uploads/', ''));
                            console.log('📖 [MultimodalChat] 读取文件:', filePath);
                            if (fs.existsSync(filePath)) {
                                if (fileLink.type === 'image') {
                                    // 对于图片，我们添加描述而不是读取二进制内容
                                    fileContents.push("[\u56FE\u7247\u6587\u4EF6: ".concat(fileLink.name, "]"));
                                }
                                else {
                                    content_1 = fs.readFileSync(filePath, 'utf-8');
                                    fileContents.push("[\u6587\u4EF6: ".concat(fileLink.name, "]\n").concat(content_1));
                                }
                            }
                            else {
                                console.warn('⚠️ [MultimodalChat] 文件不存在:', filePath);
                                fileContents.push("[\u6587\u4EF6\u4E0D\u5B58\u5728: ".concat(fileLink.name, "]"));
                            }
                        }
                        catch (error) {
                            console.error('❌ [MultimodalChat] 读取文件失败:', error);
                            fileContents.push("[\u6587\u4EF6\u8BFB\u53D6\u5931\u8D25: ".concat(fileLink.name, "]"));
                        }
                    }
                    fullMessage = "".concat(message, "\n\n\u6587\u4EF6\u5185\u5BB9:\n").concat(fileContents.join('\n\n'));
                    console.log('📝 [MultimodalChat] 构建完整消息，长度:', fullMessage.length);
                    return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/text-model.service')); })];
                case 1:
                    textModelService = (_j.sent())["default"];
                    return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/text-model.service')); })];
                case 2:
                    MessageRole_1 = (_j.sent()).MessageRole;
                    return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai-operator/unified-intelligence.service')); })];
                case 3:
                    UnifiedIntelligenceService = (_j.sent()).UnifiedIntelligenceService;
                    intelligenceService = new UnifiedIntelligenceService();
                    return [4 /*yield*/, intelligenceService.getOrganizationStatusText(context)];
                case 4:
                    organizationStatusText = _j.sent();
                    systemPrompt = "\u4F60\u662F\u5E7C\u513F\u56ED\u7BA1\u7406\u7CFB\u7EDF\u7684AI\u52A9\u624B\uFF0C\u5177\u5907\u6587\u6863\u5206\u6790\u548C\u56FE\u7247\u7406\u89E3\u80FD\u529B\u3002\n\n".concat(organizationStatusText, "\n\n\u8BF7\u4ED4\u7EC6\u5206\u6790\u7528\u6237\u4E0A\u4F20\u7684\u6587\u4EF6\u5185\u5BB9\uFF0C\u5E76\u63D0\u4F9B\u4E13\u4E1A\u3001\u8BE6\u7EC6\u7684\u5206\u6790\u548C\u5EFA\u8BAE\u3002\n\u5982\u679C\u662F\u6587\u6863\uFF0C\u8BF7\u5206\u6790\u5176\u5185\u5BB9\u7ED3\u6784\u3001\u5173\u952E\u4FE1\u606F\u548C\u5B9E\u7528\u4EF7\u503C\u3002\n\u5982\u679C\u662F\u56FE\u7247\uFF0C\u8BF7\u63CF\u8FF0\u56FE\u7247\u5185\u5BB9\u5E76\u63D0\u4F9B\u76F8\u5173\u5EFA\u8BAE\u3002\n\u76F4\u63A5\u7ED9\u51FA\u6E05\u6670\u3001\u6709\u7528\u7684\u56DE\u7B54\uFF0C\u4E0D\u8981\u5C55\u793A\u601D\u8003\u8FC7\u7A0B\u3002");
                    return [4 /*yield*/, textModelService.generateText(Number(userId) || 0, {
                            model: modelConfig.name,
                            messages: [
                                { role: MessageRole_1.SYSTEM, content: systemPrompt },
                                { role: MessageRole_1.USER, content: fullMessage }
                            ],
                            temperature: (_b = (_a = modelConfig.modelParameters) === null || _a === void 0 ? void 0 : _a.temperature) !== null && _b !== void 0 ? _b : 0.7,
                            maxTokens: (_e = (_d = (_c = modelConfig.modelParameters) === null || _c === void 0 ? void 0 : _c.maxTokens) !== null && _d !== void 0 ? _d : modelConfig.maxTokens) !== null && _e !== void 0 ? _e : 2000,
                            stream: false
                        })];
                case 5:
                    result = _j.sent();
                    content = ((_h = (_g = (_f = result.choices) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.message) === null || _h === void 0 ? void 0 : _h.content) || '';
                    console.log('✅ [MultimodalChat] 多模态响应成功，Token消耗:', result.usage);
                    res.json({
                        success: true,
                        data: { content: content },
                        usage: result.usage,
                        model: modelConfig.name,
                        multimodal: true,
                        filesProcessed: fileLinks.length
                    });
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _j.sent();
                    console.error('❌ [MultimodalChat] 处理失败:', error_1);
                    res.status(500).json({ success: false, error: '多模态聊天处理失败' });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * 处理多模态聊天（SSE版本）
 */
function handleMultimodalChatSSE(message, fileLinks, modelSelector, userId, res, context) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __awaiter(this, void 0, void 0, function () {
        var fileContents, _i, fileLinks_2, fileLink, filePath, content_2, fullMessage, ModelType, selection, modelConfig, textModelService, MessageRole_2, UnifiedIntelligenceService, intelligenceService, organizationStatusText, systemPrompt, result, content, error_2;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    _j.trys.push([0, 8, , 9]);
                    console.log('🎭 [MultimodalChatSSE] 开始处理多模态消息');
                    // 读取文件内容
                    res.write("data: ".concat(JSON.stringify({
                        type: 'file_reading',
                        content: '📖 正在读取文件内容...',
                        timestamp: new Date().toISOString()
                    }), "\n\n"));
                    fileContents = [];
                    for (_i = 0, fileLinks_2 = fileLinks; _i < fileLinks_2.length; _i++) {
                        fileLink = fileLinks_2[_i];
                        try {
                            filePath = path.join(process.cwd(), 'uploads', fileLink.url.replace('/uploads/', ''));
                            console.log('📖 [MultimodalChatSSE] 读取文件:', filePath);
                            if (fs.existsSync(filePath)) {
                                if (fileLink.type === 'image') {
                                    // 对于图片，我们添加描述而不是读取二进制内容
                                    fileContents.push("[\u56FE\u7247\u6587\u4EF6: ".concat(fileLink.name, "]"));
                                }
                                else {
                                    content_2 = fs.readFileSync(filePath, 'utf-8');
                                    fileContents.push("[\u6587\u4EF6: ".concat(fileLink.name, "]\n").concat(content_2));
                                }
                            }
                            else {
                                console.warn('⚠️ [MultimodalChatSSE] 文件不存在:', filePath);
                                fileContents.push("[\u6587\u4EF6\u4E0D\u5B58\u5728: ".concat(fileLink.name, "]"));
                            }
                        }
                        catch (error) {
                            console.error('❌ [MultimodalChatSSE] 读取文件失败:', error);
                            fileContents.push("[\u6587\u4EF6\u8BFB\u53D6\u5931\u8D25: ".concat(fileLink.name, "]"));
                        }
                    }
                    fullMessage = "".concat(message, "\n\n\u6587\u4EF6\u5185\u5BB9:\n").concat(fileContents.join('\n\n'));
                    console.log('📝 [MultimodalChatSSE] 构建完整消息，长度:', fullMessage.length);
                    // 发送分析开始状态
                    res.write("data: ".concat(JSON.stringify({
                        type: 'analyzing',
                        content: '🤖 正在分析文件内容...',
                        timestamp: new Date().toISOString()
                    }), "\n\n"));
                    return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-model-config.model')); })];
                case 1:
                    ModelType = (_j.sent()).ModelType;
                    return [4 /*yield*/, modelSelector.selectModel({
                            modelType: ModelType.TEXT
                        })];
                case 2:
                    selection = _j.sent();
                    modelConfig = selection.model;
                    return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/text-model.service')); })];
                case 3:
                    textModelService = (_j.sent())["default"];
                    return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/text-model.service')); })];
                case 4:
                    MessageRole_2 = (_j.sent()).MessageRole;
                    return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai-operator/unified-intelligence.service')); })];
                case 5:
                    UnifiedIntelligenceService = (_j.sent()).UnifiedIntelligenceService;
                    intelligenceService = new UnifiedIntelligenceService();
                    return [4 /*yield*/, intelligenceService.getOrganizationStatusText(context)];
                case 6:
                    organizationStatusText = _j.sent();
                    systemPrompt = "\u4F60\u662F\u5E7C\u513F\u56ED\u7BA1\u7406\u7CFB\u7EDF\u7684AI\u52A9\u624B\uFF0C\u5177\u5907\u6587\u6863\u5206\u6790\u548C\u56FE\u7247\u7406\u89E3\u80FD\u529B\u3002\n\n".concat(organizationStatusText, "\n\n\u8BF7\u4ED4\u7EC6\u5206\u6790\u7528\u6237\u4E0A\u4F20\u7684\u6587\u4EF6\u5185\u5BB9\uFF0C\u5E76\u63D0\u4F9B\u4E13\u4E1A\u3001\u8BE6\u7EC6\u7684\u5206\u6790\u548C\u5EFA\u8BAE\u3002\n\u5982\u679C\u662F\u6587\u6863\uFF0C\u8BF7\u5206\u6790\u5176\u5185\u5BB9\u7ED3\u6784\u3001\u5173\u952E\u4FE1\u606F\u548C\u5B9E\u7528\u4EF7\u503C\u3002\n\u5982\u679C\u662F\u56FE\u7247\uFF0C\u8BF7\u63CF\u8FF0\u56FE\u7247\u5185\u5BB9\u5E76\u63D0\u4F9B\u76F8\u5173\u5EFA\u8BAE\u3002\n\u76F4\u63A5\u7ED9\u51FA\u6E05\u6670\u3001\u6709\u7528\u7684\u56DE\u7B54\uFF0C\u4E0D\u8981\u5C55\u793A\u601D\u8003\u8FC7\u7A0B\u3002");
                    return [4 /*yield*/, textModelService.generateText(Number(userId) || 0, {
                            model: modelConfig.name,
                            messages: [
                                { role: MessageRole_2.SYSTEM, content: systemPrompt },
                                { role: MessageRole_2.USER, content: fullMessage }
                            ],
                            temperature: (_b = (_a = modelConfig.modelParameters) === null || _a === void 0 ? void 0 : _a.temperature) !== null && _b !== void 0 ? _b : 0.7,
                            maxTokens: (_e = (_d = (_c = modelConfig.modelParameters) === null || _c === void 0 ? void 0 : _c.maxTokens) !== null && _d !== void 0 ? _d : modelConfig.maxTokens) !== null && _e !== void 0 ? _e : 2000,
                            stream: false
                        })];
                case 7:
                    result = _j.sent();
                    content = ((_h = (_g = (_f = result.choices) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.message) === null || _h === void 0 ? void 0 : _h.content) || '';
                    console.log('✅ [MultimodalChatSSE] 多模态响应成功，Token消耗:', result.usage);
                    // 发送分析结果
                    res.write("data: ".concat(JSON.stringify({
                        type: 'message',
                        content: content,
                        timestamp: new Date().toISOString()
                    }), "\n\n"));
                    return [3 /*break*/, 9];
                case 8:
                    error_2 = _j.sent();
                    console.error('❌ [MultimodalChatSSE] 处理失败:', error_2);
                    res.write("data: ".concat(JSON.stringify({
                        type: 'error',
                        content: '❌ 文件分析失败，请稍后重试',
                        timestamp: new Date().toISOString()
                    }), "\n\n"));
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * 简化AI处理器 - 直接使用完整AI处理，让AI智能选择工具
 * 从三级架构简化为单级架构，AI自动选择read_data_record或any_query工具
 *
 * @param userRequest 用户请求
 * @param progressCallback 进度回调函数（可选）- 用于实时发送工具调用事件
 */
function processWithTieredRetrieval(userRequest, progressCallback) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function () {
        var startTime, aiResponse, _e, error_3;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    startTime = Date.now();
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 6, , 7]);
                    console.log('🚀 [架构简化] 直接使用完整AI处理，让AI智能选择工具');
                    console.log('🎯 [简化架构] 查询内容:', userRequest.content);
                    // 检查特殊情况的覆盖设置（保持兼容性）
                    if (((_a = userRequest === null || userRequest === void 0 ? void 0 : userRequest.context) === null || _a === void 0 ? void 0 : _a.levelOverride) === 'level-3' || ((_b = userRequest === null || userRequest === void 0 ? void 0 : userRequest.context) === null || _b === void 0 ? void 0 : _b.levelOverride) === 'complex') {
                        console.log('⏭️ [Override] 特殊情况覆盖，继续使用Level-3处理');
                    }
                    // 检查网页搜索标志（保持兼容性）
                    if (((_c = userRequest === null || userRequest === void 0 ? void 0 : userRequest.context) === null || _c === void 0 ? void 0 : _c.enableWebSearch) === true) {
                        console.log('🔍 [WebSearch] 检测到网页搜索请求，使用完整AI处理');
                    }
                    // 直接进入完整AI处理，让AI智能选择合适的工具
                    // AI会根据查询内容自动选择：
                    // - 简单查询 → read_data_record工具 (<1秒)
                    // - 复杂查询 → any_query工具 (~18秒)
                    // - CRUD操作 → create/update/delete_data_record工具
                    console.log('🧠 [智能处理] 开始AI智能工具选择和执行...');
                    if (!progressCallback) return [3 /*break*/, 3];
                    return [4 /*yield*/, unified_intelligence_service_1["default"].processUserRequestWithProgress(userRequest, progressCallback)];
                case 2:
                    _e = _f.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, unified_intelligence_service_1["default"].processUserRequest(userRequest)];
                case 4:
                    _e = _f.sent();
                    _f.label = 5;
                case 5:
                    aiResponse = _e;
                    if (aiResponse.metadata) {
                        aiResponse.metadata.level = 'level-3';
                        aiResponse.metadata.approach = 'unified_ai_processing';
                        // 添加架构简化标识（使用any类型避免类型错误）
                        aiResponse.metadata.architecture = 'simplified_single_level';
                        aiResponse.metadata.toolSelectionMode = 'ai_intelligent_selection';
                    }
                    console.log("\u2705 [\u67B6\u6784\u7B80\u5316] \u5904\u7406\u5B8C\u6210\uFF0C\u8017\u65F6: ".concat(Date.now() - startTime, "ms"));
                    console.log('🎯 [工具使用] AI选择的工具:', ((_d = aiResponse.metadata) === null || _d === void 0 ? void 0 : _d.toolsUsed) || []);
                    return [2 /*return*/, aiResponse];
                case 6:
                    error_3 = _f.sent();
                    console.error('❌ [TieredRetrieval] 分级检索处理失败:', error_3);
                    // 发送错误进度事件
                    if (progressCallback) {
                        progressCallback('❌ 处理失败: ' + error_3.message);
                    }
                    return [2 /*return*/, {
                            success: false,
                            error: error_3.message,
                            data: {
                                message: "\u5904\u7406\u5931\u8D25: ".concat(error_3.message),
                                toolExecutions: [],
                                uiComponents: [],
                                recommendations: []
                            },
                            metadata: {
                                executionTime: Date.now() - startTime,
                                toolsUsed: [],
                                confidenceScore: 0,
                                nextSuggestedActions: [],
                                complexity: 'simple',
                                approach: 'error_fallback',
                                level: 'error'
                            }
                        }];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * 评估查询复杂度
 */
function isActionIntent(query) {
    var q = query.toLowerCase();
    var patterns = [
        /策划|生成|创建|预览|海报|团购|报名|推广/,
        /导航|跳转|打开|进入/,
        /表单|填写|提交/,
        /截图|截屏|抓图/,
        /工作流|分解任务|执行步骤/
    ];
    return patterns.some(function (p) { return p.test(q); });
}
function evaluateQueryComplexity(query) {
    return __awaiter(this, void 0, void 0, function () {
        var queryLower, simplePatterns, mediumPatterns, complexPatterns, _i, simplePatterns_1, pattern, _a, mediumPatterns_1, pattern, _b, complexPatterns_1, pattern, dynamicScore;
        return __generator(this, function (_c) {
            queryLower = query.toLowerCase();
            simplePatterns = [
                /^(学生|教师|家长|客户)总数$/,
                /^(招生|活动|通知|文件|任务)统计$/,
                /^(系统状态|健康检查)$/,
                /^(绩效|通知|存储|我的任务)$/
            ];
            mediumPatterns = [
                /查询.*统计/,
                /分析.*数据/,
                /生成.*报告/,
                /比较.*情况/
            ];
            complexPatterns = [
                // 原有模式
                /创建|生成.*活动/,
                /制定.*计划/,
                /设计.*方案/,
                /分析.*趋势.*预测/,
                // 多步骤操作模式 - 更灵活的匹配
                /(查询|搜索).*(然后|接着|再).*(分析|总结|处理)/,
                /(获取|查找).*(数据|信息).*(分析|处理)/,
                /(数据库|搜索).*(结果|数据).*(分析|搜索)/,
                // 工具调用组合模式 - 降低匹配门槛
                /工具.*调用/,
                /多个.*步骤/,
                /(综合|全面|深度).*(处理|分析)/,
                // 复杂业务场景
                /策划.*执行/,
                /优化.*建议/,
                /完整.*流程/,
                /系统.*分析/,
                /专业.*建议/,
                // 英文复杂模式 - 重新设计更宽松的匹配
                /(query|search).*(then|and).*(search|analyze|provide)/i,
                /(database|data).*(search|query).*(analysis|analyze)/i,
                /(comprehensive|detailed|complete).*(analysis|report)/i,
                /(multi|multiple).*(step|stage|phase)/i,
                /(complex|advanced).*(workflow|process)/i,
                /provide.*(comprehensive|detailed|complete)/i
            ];
            // 检查简单模式
            for (_i = 0, simplePatterns_1 = simplePatterns; _i < simplePatterns_1.length; _i++) {
                pattern = simplePatterns_1[_i];
                if (pattern.test(queryLower)) {
                    return [2 /*return*/, {
                            level: 'simple',
                            score: 0.2,
                            reasoning: '匹配简单查询模式，可用轻量级处理'
                        }];
                }
            }
            // 检查中等模式
            for (_a = 0, mediumPatterns_1 = mediumPatterns; _a < mediumPatterns_1.length; _a++) {
                pattern = mediumPatterns_1[_a];
                if (pattern.test(queryLower)) {
                    return [2 /*return*/, {
                            level: 'medium',
                            score: 0.5,
                            reasoning: '匹配中等复杂度模式，需要数据分析'
                        }];
                }
            }
            // 检查复杂模式
            for (_b = 0, complexPatterns_1 = complexPatterns; _b < complexPatterns_1.length; _b++) {
                pattern = complexPatterns_1[_b];
                if (pattern.test(queryLower)) {
                    console.log("\uD83C\uDFAF [\u590D\u6742\u5EA6\u8BC4\u4F30] \u5339\u914D\u5230\u590D\u6742\u6A21\u5F0F: ".concat(pattern.source));
                    return [2 /*return*/, {
                            level: 'complex',
                            score: 0.8,
                            reasoning: '匹配复杂查询模式，需要大模型处理'
                        }];
                }
            }
            dynamicScore = calculateDynamicComplexity(query);
            console.log("\uD83D\uDCCA [\u590D\u6742\u5EA6\u8BC4\u4F30] \u52A8\u6001\u8BC4\u5206: ".concat(dynamicScore, ", \u67E5\u8BE2: \"").concat(query.substring(0, 50), "...\""));
            if (dynamicScore >= 0.7) {
                console.log("\uD83D\uDE80 [\u590D\u6742\u5EA6\u8BC4\u4F30] \u52A8\u6001\u8BC4\u4F30\u89E6\u53D1Level-3: ".concat(dynamicScore));
                return [2 /*return*/, {
                        level: 'complex',
                        score: dynamicScore,
                        reasoning: "\u52A8\u6001\u8BC4\u4F30\u4E3A\u9AD8\u590D\u6742\u5EA6(".concat(dynamicScore, ")\uFF0C\u9700\u8981\u5927\u6A21\u578B\u5904\u7406")
                    }];
            }
            // 默认中等复杂度
            console.log("\u26A1 [\u590D\u6742\u5EA6\u8BC4\u4F30] \u4F7F\u7528\u8F7B\u91CF\u7EA7\u5904\u7406: ".concat(Math.max(dynamicScore, 0.4)));
            return [2 /*return*/, {
                    level: 'medium',
                    score: Math.max(dynamicScore, 0.4),
                    reasoning: "\u52A8\u6001\u8BC4\u4F30\u590D\u6742\u5EA6(".concat(dynamicScore, ")\uFF0C\u4F7F\u7528\u8F7B\u91CF\u7EA7\u5904\u7406")
                }];
        });
    });
}
/**
 * 动态复杂度评估
 */
function calculateDynamicComplexity(query) {
    var score = 0;
    var queryLower = query.toLowerCase();
    // 1. 查询长度评分 (最大0.2分)
    if (query.length > 50)
        score += 0.1;
    if (query.length > 100)
        score += 0.1;
    // 2. 多步骤操作关键词 (每个0.15分)
    var multiStepKeywords = ['然后', '接着', '之后', '再', '并且', '同时', 'then', 'and then', 'after'];
    var multiStepCount = multiStepKeywords.filter(function (keyword) { return queryLower.includes(keyword); }).length;
    score += Math.min(multiStepCount * 0.15, 0.3);
    // 3. 工具调用关键词 (每个0.1分)
    var toolKeywords = ['查询', '搜索', '分析', '生成', '创建', '导航', '截图', '填写', 'search', 'analyze', 'create', 'navigate'];
    var toolCount = toolKeywords.filter(function (keyword) { return queryLower.includes(keyword); }).length;
    score += Math.min(toolCount * 0.1, 0.4);
    // 4. 复杂分析关键词 (每个0.2分)
    var analysisKeywords = ['全面', '深度', '综合', '详细', '完整', '系统', 'comprehensive', 'detailed', 'complete'];
    var analysisCount = analysisKeywords.filter(function (keyword) { return queryLower.includes(keyword); }).length;
    score += Math.min(analysisCount * 0.2, 0.4);
    // 5. 业务复杂度关键词 (每个0.15分)
    var businessKeywords = ['策划', '优化', '建议', '方案', '流程', '策略', 'strategy', 'optimize', 'workflow'];
    var businessCount = businessKeywords.filter(function (keyword) { return queryLower.includes(keyword); }).length;
    score += Math.min(businessCount * 0.15, 0.3);
    // 6. 多目标操作 (0.2分)
    var multiTargetKeywords = ['多个', '各种', '所有', '全部', 'multiple', 'various', 'all'];
    if (multiTargetKeywords.some(function (keyword) { return queryLower.includes(keyword); })) {
        score += 0.2;
    }
    return Math.min(score, 1.0); // 最大1.0分
}
/**
 * 轻量级模型处理
 */
function processWithLightModel(request, complexityResult) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                console.log('⚡ [LightModel] 使用轻量级模型处理...');
                if (isActionIntent(request.content)) {
                    return [2 /*return*/, { success: false, data: { message: '检测到行动意图，升级到深度处理', uiComponents: [], toolExecutions: [], recommendations: [], todoList: [], visualizations: [] }, metadata: { executionTime: 200, toolsUsed: ['classifier'], confidenceScore: 0.9, level: 'level-2', approach: 'escalate_to_level_3', complexity: complexityResult.level } }];
                }
                // 🚀 修复：对于简单查询，直接跳过轻量级处理，进入第三级大模型处理
                // 这样可以确保用户得到真正的AI回复而不是调试信息
                console.log('⚠️ [LightModel] 轻量级处理暂时禁用，升级到第三级大模型处理');
                return [2 /*return*/, {
                        success: false,
                        data: {
                            message: '轻量级处理跳过，升级到大模型处理',
                            uiComponents: [],
                            toolExecutions: [],
                            recommendations: [],
                            todoList: [],
                            visualizations: []
                        },
                        metadata: {
                            executionTime: 100,
                            toolsUsed: ['classifier'],
                            confidenceScore: 0.9,
                            level: 'level-2',
                            approach: 'escalate_to_level_3',
                            complexity: complexityResult.level
                        }
                    }];
            }
            catch (error) {
                console.error('❌ [LightModel] 轻量级处理失败:', error);
                return [2 /*return*/, { success: false, error: error.message }];
            }
            return [2 /*return*/];
        });
    });
}
// SSE实时状态推送路由
router.get('/stream/:sessionId', function (req, res) {
    var sessionId = req.params.sessionId;
    // 设置SSE头
    res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
    });
    console.log("\uD83C\uDF0A [SSE] \u5BA2\u6237\u7AEF\u8FDE\u63A5\uFF1AsessionId=".concat(sessionId));
    // 发送连接确认
    res.write("data: ".concat(JSON.stringify({
        type: 'connected',
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
        message: '已建立实时连接，等待AI处理状态...'
    }), "\n\n"));
    // 监听该session的进度事件
    var progressListener = function (data) {
        if (data.sessionId === sessionId) {
            res.write("data: ".concat(JSON.stringify(data), "\n\n"));
        }
    };
    // 监听完成事件
    var completeListener = function (data) {
        if (data.sessionId === sessionId) {
            res.write("data: ".concat(JSON.stringify(data), "\n\n"));
            res.end();
        }
    };
    // 注册事件监听器
    aiProgressEmitter.on('ai-progress', progressListener);
    aiProgressEmitter.on('ai-complete', completeListener);
    // 客户端断开连接时清理
    req.on('close', function () {
        console.log("\uD83C\uDF0A [SSE] \u5BA2\u6237\u7AEF\u65AD\u5F00\uFF1AsessionId=".concat(sessionId));
        aiProgressEmitter.removeListener('ai-progress', progressListener);
        aiProgressEmitter.removeListener('ai-complete', completeListener);
    });
    // 定期心跳
    var heartbeat = setInterval(function () {
        res.write("data: ".concat(JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString()
        }), "\n\n"));
    }, 30000);
    req.on('close', function () {
        clearInterval(heartbeat);
    });
});
// 带实时推送的统一智能聊天接口
router.post('/unified-chat-stream', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, message_1, _b, userId_1, conversationId_1, sessionId_1, pushProgress_1;
    return __generator(this, function (_c) {
        try {
            _a = req.body, message_1 = _a.message, _b = _a.userId, userId_1 = _b === void 0 ? '121' : _b, conversationId_1 = _a.conversationId;
            sessionId_1 = "session_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
            if (!message_1 || typeof message_1 !== 'string') {
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        error: '消息内容不能为空'
                    })];
            }
            if (message_1.length > 1000) {
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        error: '单次消息长度不得超过1000字'
                    })];
            }
            console.log('🧠 [UnifiedIntelligence-Stream] 收到请求:', {
                message: Buffer.isBuffer(message_1) ? message_1.toString('utf8') : message_1,
                userId: userId_1,
                sessionId: sessionId_1,
                messageLength: (message_1 === null || message_1 === void 0 ? void 0 : message_1.length) || 0
            });
            // 立即返回session ID，让前端建立SSE连接
            res.json({
                success: true,
                sessionId: sessionId_1,
                message: '处理中，请通过SSE流获取实时状态...'
            });
            pushProgress_1 = function (status, details) {
                // 🎯 检测工具调用相关事件，使用特殊的事件类型
                if (status === 'tool_intent' || status === 'tool_call_start' || status === 'tool_call_complete' || status === 'tool_call_error') {
                    aiProgressEmitter.emit('ai-progress', {
                        sessionId: sessionId_1,
                        type: status,
                        data: details,
                        timestamp: new Date().toISOString()
                    });
                }
                else if (status === 'thinking') {
                    // thinking事件
                    aiProgressEmitter.emit('ai-progress', {
                        sessionId: sessionId_1,
                        type: 'thinking',
                        content: details,
                        timestamp: new Date().toISOString()
                    });
                }
                else {
                    // 普通进度事件
                    aiProgressEmitter.emit('ai-progress', {
                        sessionId: sessionId_1,
                        type: 'progress',
                        status: status,
                        details: details,
                        timestamp: new Date().toISOString()
                    });
                }
            };
            // 异步处理用户请求
            setImmediate(function () { return __awaiter(void 0, void 0, void 0, function () {
                var userRequest, response, error_4;
                var _a, _b, _c, _d, _e, _f, _g, _h;
                return __generator(this, function (_j) {
                    switch (_j.label) {
                        case 0:
                            _j.trys.push([0, 2, , 3]);
                            userRequest = {
                                content: message_1,
                                userId: userId_1,
                                conversationId: conversationId_1 || "unified_".concat(Date.now()),
                                context: {
                                    timestamp: new Date().toISOString(),
                                    source: 'unified-chat-stream-api',
                                    sessionId: sessionId_1,
                                    enableTools: ((_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.context) === null || _b === void 0 ? void 0 : _b.enableTools) === true,
                                    levelOverride: (_c = req.body) === null || _c === void 0 ? void 0 : _c.levelOverride,
                                    role: ((_e = (_d = req.body) === null || _d === void 0 ? void 0 : _d.context) === null || _e === void 0 ? void 0 : _e.role) || ((_f = req.user) === null || _f === void 0 ? void 0 : _f.role) || 'parent',
                                    pagePath: (_h = (_g = req.body) === null || _g === void 0 ? void 0 : _g.context) === null || _h === void 0 ? void 0 : _h.pagePath
                                }
                            };
                            pushProgress_1('正在分析用户意图...');
                            return [4 /*yield*/, processWithTieredRetrieval(userRequest, pushProgress_1)];
                        case 1:
                            response = _j.sent();
                            // 推送完成事件
                            aiProgressEmitter.emit('ai-complete', {
                                sessionId: sessionId_1,
                                type: 'complete',
                                success: response.success,
                                data: {
                                    message: response.data.message,
                                    ui_components: response.data.uiComponents,
                                    tool_executions: response.data.toolExecutions,
                                    recommendations: response.data.recommendations,
                                    todo_list: response.data.todoList,
                                    visualizations: response.data.visualizations
                                },
                                metadata: {
                                    execution_time: response.metadata.executionTime,
                                    tools_used: response.metadata.toolsUsed,
                                    confidence_score: response.metadata.confidenceScore,
                                    next_actions: response.metadata.nextSuggestedActions,
                                    complexity: response.metadata.complexity,
                                    approach: response.metadata.approach,
                                    system_version: 'unified-intelligence-v1.0'
                                },
                                timestamp: new Date().toISOString()
                            });
                            return [3 /*break*/, 3];
                        case 2:
                            error_4 = _j.sent();
                            console.error('❌ [UnifiedIntelligence-Stream] 处理失败:', error_4);
                            // 推送错误事件
                            aiProgressEmitter.emit('ai-complete', {
                                sessionId: sessionId_1,
                                type: 'error',
                                success: false,
                                error: '智能处理失败',
                                details: process.env.NODE_ENV === 'development' ? error_4.message : undefined,
                                timestamp: new Date().toISOString()
                            });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        }
        catch (error) {
            console.error('❌ [UnifiedIntelligence-Stream] 初始化失败:', error);
            res.status(500).json({
                success: false,
                error: '智能处理初始化失败'
            });
        }
        return [2 /*return*/];
    });
}); });
// 🎯 新增：统一智能聊天接口（HTTP直接返回，不使用WebSocket/SSE）
router.post('/unified-chat-direct', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, message, _b, userId, conversationId, _c, context, thinkingProcess_1, toolCalls_1, finalMessage_1, totalRounds_1, result, error_5;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 2, , 3]);
                _a = req.body, message = _a.message, _b = _a.userId, userId = _b === void 0 ? '121' : _b, conversationId = _a.conversationId, _c = _a.context, context = _c === void 0 ? {} : _c;
                if (!message || typeof message !== 'string') {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: '消息内容不能为空'
                        })];
                }
                if (message.length > 1000) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: '单次消息长度不得超过1000字'
                        })];
                }
                console.log('🎯 [UnifiedIntelligence-Direct] 收到HTTP直接请求:', {
                    message: message,
                    userId: userId,
                    conversationId: conversationId,
                    context: context
                });
                thinkingProcess_1 = '';
                toolCalls_1 = [];
                finalMessage_1 = '';
                totalRounds_1 = 0;
                return [4 /*yield*/, unified_intelligence_service_1["default"].processUserRequestWithProgress({
                        content: message,
                        userId: userId === null || userId === void 0 ? void 0 : userId.toString(),
                        conversationId: conversationId,
                        context: __assign(__assign({}, context), { enableTools: true, role: context.userRole || 'user' })
                    }, 
                    // 进度回调 - 收集所有数据
                    function (type, data) {
                        console.log("\uD83D\uDCCA [Direct-Progress] ".concat(type, ":"), data);
                        switch (type) {
                            case 'thinking_update':
                                // 收集思考过程
                                var thinkingContent = typeof data === 'string' ? data : ((data === null || data === void 0 ? void 0 : data.content) || (data === null || data === void 0 ? void 0 : data.message) || '');
                                if (thinkingContent) {
                                    thinkingProcess_1 += thinkingContent;
                                }
                                break;
                            case 'tool_call_start':
                                // 记录工具调用开始
                                toolCalls_1.push({
                                    name: (data === null || data === void 0 ? void 0 : data.name) || '',
                                    arguments: (data === null || data === void 0 ? void 0 : data.arguments) || {},
                                    status: 'running',
                                    startTime: Date.now()
                                });
                                break;
                            case 'tool_call_complete':
                                // 更新工具调用结果
                                var lastTool = toolCalls_1[toolCalls_1.length - 1];
                                if (lastTool) {
                                    lastTool.result = data === null || data === void 0 ? void 0 : data.result;
                                    lastTool.status = 'success';
                                    lastTool.endTime = Date.now();
                                    lastTool.duration = lastTool.endTime - lastTool.startTime;
                                }
                                break;
                            case 'answer_chunk':
                                // 收集答案片段
                                var chunk = typeof data === 'string' ? data : ((data === null || data === void 0 ? void 0 : data.content) || (data === null || data === void 0 ? void 0 : data.message) || '');
                                finalMessage_1 += chunk;
                                break;
                            case 'answer_complete':
                                // 答案完成
                                console.log('✅ [Direct] 答案生成完成');
                                break;
                            case 'round_complete':
                                totalRounds_1++;
                                break;
                        }
                    })];
            case 1:
                result = _e.sent();
                console.log('✅ [UnifiedIntelligence-Direct] 处理完成:', {
                    thinkingLength: thinkingProcess_1.length,
                    toolCallsCount: toolCalls_1.length,
                    finalMessageLength: finalMessage_1.length,
                    totalRounds: totalRounds_1
                });
                // 返回完整结果
                res.json({
                    success: true,
                    data: {
                        message: finalMessage_1 || ((_d = result === null || result === void 0 ? void 0 : result.data) === null || _d === void 0 ? void 0 : _d.message) || '处理完成',
                        thinkingProcess: thinkingProcess_1,
                        toolCalls: toolCalls_1,
                        rounds: totalRounds_1,
                        metadata: {
                            conversationId: conversationId,
                            userId: userId,
                            timestamp: new Date().toISOString()
                        }
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _e.sent();
                console.error('❌ [UnifiedIntelligence-Direct] 处理失败:', error_5);
                res.status(500).json({
                    success: false,
                    error: '处理失败',
                    message: error_5 instanceof Error ? error_5.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// 统一智能聊天接口
router.post('/unified-chat', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, message, _b, userId, conversationId, MessageService, MessageRole_3, messageService, savedUserMessage, savedAIMessage, userRequest, saveError_1, response, saveError_2, error_6;
    var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    return __generator(this, function (_s) {
        switch (_s.label) {
            case 0:
                _s.trys.push([0, 14, , 15]);
                _a = req.body, message = _a.message, _b = _a.userId, userId = _b === void 0 ? '121' : _b, conversationId = _a.conversationId;
                if (!message || typeof message !== 'string') {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: '消息内容不能为空'
                        })];
                }
                if (message.length > 1000) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: '单次消息长度不得超过1000字'
                        })];
                }
                console.log('🧠 [UnifiedIntelligence] 收到请求:', {
                    message: Buffer.isBuffer(message) ? message.toString('utf8') : message,
                    userId: userId,
                    conversationId: conversationId,
                    messageLength: (message === null || message === void 0 ? void 0 : message.length) || 0,
                    messagePreview: (message === null || message === void 0 ? void 0 : message.substring(0, 50)) + ((message === null || message === void 0 ? void 0 : message.length) > 50 ? '...' : '')
                });
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/message.service')); })];
            case 1:
                MessageService = (_s.sent()).MessageService;
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-message.model')); })];
            case 2:
                MessageRole_3 = (_s.sent()).MessageRole;
                messageService = new MessageService();
                savedUserMessage = null;
                savedAIMessage = null;
                userRequest = {
                    content: message,
                    userId: userId,
                    conversationId: conversationId || "unified_".concat(Date.now()),
                    context: {
                        timestamp: new Date().toISOString(),
                        source: 'unified-chat-api',
                        enableTools: ((_c = req.body) === null || _c === void 0 ? void 0 : _c.enableTools) === true || ((_e = (_d = req.body) === null || _d === void 0 ? void 0 : _d.context) === null || _e === void 0 ? void 0 : _e.enableTools) === true,
                        enableWebSearch: ((_f = req.body) === null || _f === void 0 ? void 0 : _f.enableWebSearch) === true || ((_h = (_g = req.body) === null || _g === void 0 ? void 0 : _g.context) === null || _h === void 0 ? void 0 : _h.enableWebSearch) === true,
                        levelOverride: ((_j = req.body) === null || _j === void 0 ? void 0 : _j.levelOverride) || ((_l = (_k = req.body) === null || _k === void 0 ? void 0 : _k.context) === null || _l === void 0 ? void 0 : _l.levelOverride),
                        role: ((_o = (_m = req.body) === null || _m === void 0 ? void 0 : _m.context) === null || _o === void 0 ? void 0 : _o.role) || ((_p = req.user) === null || _p === void 0 ? void 0 : _p.role) || 'parent',
                        pagePath: (_r = (_q = req.body) === null || _q === void 0 ? void 0 : _q.context) === null || _r === void 0 ? void 0 : _r.pagePath
                    }
                };
                _s.label = 3;
            case 3:
                _s.trys.push([3, 6, , 7]);
                if (!conversationId) return [3 /*break*/, 5];
                console.log('💾 [UnifiedIntelligence] 保存用户消息到数据库:', {
                    conversationId: conversationId,
                    userId: userId,
                    contentLength: message.length
                });
                return [4 /*yield*/, messageService.createMessage({
                        conversationId: conversationId,
                        userId: Number(userId),
                        role: MessageRole_3.USER,
                        content: message,
                        messageType: 'text',
                        tokens: Math.ceil(message.length / 4)
                    })];
            case 4:
                savedUserMessage = _s.sent();
                console.log('✅ [UnifiedIntelligence] 用户消息保存成功:', savedUserMessage.id);
                _s.label = 5;
            case 5: return [3 /*break*/, 7];
            case 6:
                saveError_1 = _s.sent();
                console.error('❌ [UnifiedIntelligence] 用户消息保存失败:', saveError_1);
                return [3 /*break*/, 7];
            case 7: return [4 /*yield*/, processWithTieredRetrieval(userRequest)];
            case 8:
                response = _s.sent();
                _s.label = 9;
            case 9:
                _s.trys.push([9, 12, , 13]);
                if (!(conversationId && response.success && response.data.message)) return [3 /*break*/, 11];
                console.log('💾 [UnifiedIntelligence] 保存AI回复到数据库:', {
                    conversationId: conversationId,
                    userId: userId,
                    contentLength: response.data.message.length
                });
                return [4 /*yield*/, messageService.createMessage({
                        conversationId: conversationId,
                        userId: Number(userId),
                        role: MessageRole_3.ASSISTANT,
                        content: response.data.message,
                        messageType: 'text',
                        tokens: Math.ceil(response.data.message.length / 4),
                        metadata: {
                            toolExecutions: response.data.toolExecutions,
                            approach: response.metadata.approach,
                            complexity: response.metadata.complexity,
                            confidenceScore: response.metadata.confidenceScore
                        }
                    })];
            case 10:
                savedAIMessage = _s.sent();
                console.log('✅ [UnifiedIntelligence] AI回复保存成功:', savedAIMessage.id);
                _s.label = 11;
            case 11: return [3 /*break*/, 13];
            case 12:
                saveError_2 = _s.sent();
                console.error('❌ [UnifiedIntelligence] AI回复保存失败:', saveError_2);
                return [3 /*break*/, 13];
            case 13:
                // 返回统一格式的响应
                res.json({
                    success: response.success,
                    data: {
                        message: response.data.message,
                        ui_components: response.data.uiComponents,
                        tool_executions: response.data.toolExecutions,
                        recommendations: response.data.recommendations,
                        todo_list: response.data.todoList,
                        visualizations: response.data.visualizations
                    },
                    metadata: {
                        execution_time: response.metadata.executionTime,
                        tools_used: response.metadata.toolsUsed,
                        confidence_score: response.metadata.confidenceScore,
                        next_actions: response.metadata.nextSuggestedActions,
                        complexity: response.metadata.complexity,
                        approach: response.metadata.approach,
                        system_version: 'unified-intelligence-v1.0'
                    }
                });
                return [3 /*break*/, 15];
            case 14:
                error_6 = _s.sent();
                console.error('❌ [UnifiedIntelligence] 处理失败:', error_6);
                res.status(500).json({
                    success: false,
                    error: '智能处理失败',
                    details: process.env.NODE_ENV === 'development' ? error_6.message : undefined,
                    metadata: {
                        system_version: 'unified-intelligence-v1.0',
                        error_type: 'internal_error'
                    }
                });
                return [3 /*break*/, 15];
            case 15: return [2 /*return*/];
        }
    });
}); });
// 系统状态检查接口
router.get('/status', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            res.json({
                success: true,
                data: {
                    system: 'Unified Intelligence System',
                    version: '1.0.0',
                    status: 'operational',
                    capabilities: [
                        'page_awareness',
                        'intelligent_tool_selection',
                        'task_decomposition',
                        'data_visualization',
                        'expert_consultation',
                        'unified_response'
                    ],
                    features: {
                        multi_intent_recognition: true,
                        context_aware_analysis: true,
                        smart_tool_selection: true,
                        fallback_strategies: true,
                        unified_response_format: true
                    }
                },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: '状态检查失败'
            });
        }
        return [2 /*return*/];
    });
}); });
// 智能分析接口（调试用）
router.post('/analyze', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, message, _b, userId, userRequest, mockAnalysis;
    return __generator(this, function (_c) {
        try {
            _a = req.body, message = _a.message, _b = _a.userId, userId = _b === void 0 ? '121' : _b;
            if (!message) {
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        error: '消息内容不能为空'
                    })];
            }
            userRequest = {
                content: message,
                userId: userId,
                conversationId: "analyze_".concat(Date.now()),
                context: { analysis_only: true }
            };
            mockAnalysis = {
                intent: message.includes('创建') ? 'PAGE_OPERATION' : 'INFORMATION_QUERY',
                complexity: message.length > 50 ? 'COMPLEX' : 'SIMPLE',
                confidence: 0.85,
                required_capabilities: ['page_awareness', 'dom_manipulation'],
                suggested_tools: ['get_page_structure', 'navigate_to_page'],
                estimated_time: 5
            };
            res.json({
                success: true,
                data: {
                    original_message: message,
                    analysis: mockAnalysis,
                    explanation: '这是对用户请求的智能分析结果'
                },
                metadata: {
                    analysis_time: Date.now(),
                    version: 'unified-intelligence-v1.0'
                }
            });
        }
        catch (error) {
            console.error('❌ [Analysis] 分析失败:', error);
            res.status(500).json({
                success: false,
                error: '智能分析失败'
            });
        }
        return [2 /*return*/];
    });
}); });
// 轻量直连聊天接口（不注入工具，不走统一智能链路）
router.post('/direct-chat', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, message, _b, userId, conversationId, _c, context, MessageService, messageService, savedUserMessage, savedAIMessage, fileLinks, hasFiles, modelSelector, ModelType, selection, modelConfig, DBMessageRole, saveError_3, textModelService, MessageRole_4, UnifiedIntelligenceService, intelligenceService, organizationStatusText, systemPrompt, result, content, DBMessageRole, saveError_4, error_7;
    var _d, _e, _f, _g, _h, _j, _k, _l, _m;
    return __generator(this, function (_o) {
        switch (_o.label) {
            case 0:
                _o.trys.push([0, 24, , 25]);
                _a = req.body, message = _a.message, _b = _a.userId, userId = _b === void 0 ? '121' : _b, conversationId = _a.conversationId, _c = _a.context, context = _c === void 0 ? {} : _c;
                if (!message || typeof message !== 'string') {
                    return [2 /*return*/, res.status(400).json({ success: false, error: '消息内容不能为空' })];
                }
                console.log('🔗 [DirectChat] 收到直连请求:', { message: message, userId: userId, conversationId: conversationId, context: context });
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/message.service')); })];
            case 1:
                MessageService = (_o.sent()).MessageService;
                messageService = new MessageService();
                savedUserMessage = null;
                savedAIMessage = null;
                fileLinks = extractFileLinks(message);
                hasFiles = fileLinks.length > 0;
                console.log('📁 [DirectChat] 检测到文件:', { hasFiles: hasFiles, fileCount: fileLinks.length, files: fileLinks });
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/model-selector.service')); })];
            case 2:
                modelSelector = (_o.sent())["default"];
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-model-config.model')); })];
            case 3:
                ModelType = (_o.sent()).ModelType;
                return [4 /*yield*/, modelSelector.selectModel({
                        modelType: ModelType.TEXT,
                        requireCapabilities: hasFiles ? ['multimodal', 'image_understanding'] : (context.enableWebSearch ? ['web_search'] : undefined)
                    })];
            case 4:
                selection = _o.sent();
                modelConfig = selection.model;
                console.log('🤖 [DirectChat] 选择模型:', {
                    modelName: modelConfig.name,
                    hasMultimodal: hasFiles,
                    capabilities: modelConfig.capabilities
                });
                _o.label = 5;
            case 5:
                _o.trys.push([5, 9, , 10]);
                if (!conversationId) return [3 /*break*/, 8];
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-message.model')); })];
            case 6:
                DBMessageRole = (_o.sent()).MessageRole;
                console.log('💾 [DirectChat] 保存用户消息到数据库:', {
                    conversationId: conversationId,
                    userId: userId,
                    contentLength: message.length
                });
                return [4 /*yield*/, messageService.createMessage({
                        conversationId: conversationId,
                        userId: Number(userId),
                        role: DBMessageRole.USER,
                        content: message,
                        messageType: 'text',
                        tokens: Math.ceil(message.length / 4)
                    })];
            case 7:
                savedUserMessage = _o.sent();
                console.log('✅ [DirectChat] 用户消息保存成功:', savedUserMessage.id);
                _o.label = 8;
            case 8: return [3 /*break*/, 10];
            case 9:
                saveError_3 = _o.sent();
                console.error('❌ [DirectChat] 用户消息保存失败:', saveError_3);
                return [3 /*break*/, 10];
            case 10:
                if (!hasFiles) return [3 /*break*/, 12];
                return [4 /*yield*/, handleMultimodalChat(message, fileLinks, modelConfig, userId, res, context)];
            case 11: return [2 /*return*/, _o.sent()];
            case 12: return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/text-model.service')); })];
            case 13:
                textModelService = (_o.sent())["default"];
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/text-model.service')); })];
            case 14:
                MessageRole_4 = (_o.sent()).MessageRole;
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai-operator/unified-intelligence.service')); })];
            case 15:
                UnifiedIntelligenceService = (_o.sent()).UnifiedIntelligenceService;
                intelligenceService = new UnifiedIntelligenceService();
                return [4 /*yield*/, intelligenceService.getOrganizationStatusText(context)];
            case 16:
                organizationStatusText = _o.sent();
                systemPrompt = "\u4F60\u662F\u5E7C\u513F\u56ED\u7BA1\u7406\u7CFB\u7EDF\u7684AI\u52A9\u624B\u3002\n\n".concat(organizationStatusText, "\n\n\u76F4\u63A5\u7ED9\u51FA\u6E05\u6670\u3001\u7B80\u6D01\u3001\u53EF\u6267\u884C\u7684\u56DE\u7B54\u3002\u4E0D\u8981\u5C55\u793A\u601D\u8003\u8FC7\u7A0B\u3001\u4E0D\u8981\u8F93\u51FA\u6B65\u9AA4\u5217\u8868\u6216\u5DE5\u5177\u8C03\u7528\u3002");
                return [4 /*yield*/, textModelService.generateText(Number(userId) || 0, {
                        model: modelConfig.name,
                        messages: [
                            { role: MessageRole_4.SYSTEM, content: systemPrompt },
                            { role: MessageRole_4.USER, content: message }
                        ],
                        temperature: (_e = (_d = modelConfig.modelParameters) === null || _d === void 0 ? void 0 : _d.temperature) !== null && _e !== void 0 ? _e : 0.7,
                        maxTokens: (_h = (_g = (_f = modelConfig.modelParameters) === null || _f === void 0 ? void 0 : _f.maxTokens) !== null && _g !== void 0 ? _g : modelConfig.maxTokens) !== null && _h !== void 0 ? _h : 2000,
                        stream: false
                    })];
            case 17:
                result = _o.sent();
                content = ((_l = (_k = (_j = result.choices) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.message) === null || _l === void 0 ? void 0 : _l.content) || '';
                console.log('✅ [DirectChat] 直连响应成功，Token消耗:', result.usage);
                _o.label = 18;
            case 18:
                _o.trys.push([18, 22, , 23]);
                if (!(conversationId && content)) return [3 /*break*/, 21];
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-message.model')); })];
            case 19:
                DBMessageRole = (_o.sent()).MessageRole;
                console.log('💾 [DirectChat] 保存AI回复到数据库:', {
                    conversationId: conversationId,
                    userId: userId,
                    contentLength: content.length
                });
                return [4 /*yield*/, messageService.createMessage({
                        conversationId: conversationId,
                        userId: Number(userId),
                        role: DBMessageRole.ASSISTANT,
                        content: content,
                        messageType: 'text',
                        tokens: ((_m = result.usage) === null || _m === void 0 ? void 0 : _m.totalTokens) || Math.ceil(content.length / 4),
                        metadata: {
                            model: modelConfig.name,
                            usage: result.usage
                        }
                    })];
            case 20:
                savedAIMessage = _o.sent();
                console.log('✅ [DirectChat] AI回复保存成功:', savedAIMessage.id);
                _o.label = 21;
            case 21: return [3 /*break*/, 23];
            case 22:
                saveError_4 = _o.sent();
                console.error('❌ [DirectChat] AI回复保存失败:', saveError_4);
                return [3 /*break*/, 23];
            case 23:
                res.json({ success: true, data: { content: content }, usage: result.usage, model: modelConfig.name });
                return [3 /*break*/, 25];
            case 24:
                error_7 = _o.sent();
                console.error('❌ [DirectChat] 处理失败:', error_7);
                res.status(500).json({ success: false, error: '直连聊天失败' });
                return [3 /*break*/, 25];
            case 25: return [2 /*return*/];
        }
    });
}); });
// 轻量直连聊天接口（统一SSE输出版本）
router.post('/direct-chat-sse', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, message, _b, userId_2, _c, context, conversationId_2, decodedMessage_1, MessageService, messageService_1, savedUserMessage_1, savedAIMessage_1, allowWeb, modelSelector, ModelType, webSearchTool, searchStartTime, searchResponse, searchTime, WebSearchTool, formattedResults, selection, modelConfig, textModelService, MessageRole_5, UnifiedIntelligenceService, intelligenceService, organizationStatusText, systemPrompt, result, content, error_8, fileLinks, QueryRouterService_1, DirectResponseService_1, queryRouter, directResponse, routingResult, actionKey, QueryRouterService_2, queryRouter_1, directMatch, quickResult, saveError_5, quickQueryError_1, selection, modelConfig_1, UnifiedIntelligenceService, intelligenceService, organizationStatusText, systemPrompt, modelId, streamParams, aiBridgeService, customConfig, stream, fullContent_1, fullReasoningContent_1, buffer_1, error_9, error_10;
    var _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    return __generator(this, function (_t) {
        switch (_t.label) {
            case 0:
                _t.trys.push([0, 42, , 43]);
                _a = req.body, message = _a.message, _b = _a.userId, userId_2 = _b === void 0 ? '121' : _b, _c = _a.context, context = _c === void 0 ? {} : _c, conversationId_2 = _a.conversationId;
                if (!message || typeof message !== 'string') {
                    return [2 /*return*/, res.status(400).json({ success: false, error: '消息内容不能为空' })];
                }
                decodedMessage_1 = message;
                console.log('🔗 [DirectChat-SSE] 收到直连请求:', {
                    message: decodedMessage_1,
                    userId: userId_2,
                    conversationId: conversationId_2,
                    context: context,
                    messageLength: decodedMessage_1.length,
                    messageType: typeof decodedMessage_1
                });
                console.log('🎯 [TRACE-1] 进入 /direct-chat-sse 路由，准备判断分支...');
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/message.service')); })];
            case 1:
                MessageService = (_t.sent()).MessageService;
                messageService_1 = new MessageService();
                savedUserMessage_1 = null;
                savedAIMessage_1 = null;
                // 设置SSE响应头
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream; charset=utf-8',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Cache-Control'
                });
                // 发送连接确认
                res.write("data: ".concat(JSON.stringify({
                    type: 'connected',
                    content: '连接已建立',
                    timestamp: new Date().toISOString()
                }), "\n\n"));
                allowWeb = !!context.enableWebSearch;
                console.log('🔍 [DirectChat-SSE] allowWeb 判断:', { allowWeb: allowWeb, enableWebSearch: context.enableWebSearch });
                console.log('🎯 [TRACE-2] allowWeb =', allowWeb, '，准备判断是否进入网页搜索分支...');
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/model-selector.service')); })];
            case 2:
                modelSelector = (_t.sent())["default"];
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-model-config.model')); })];
            case 3:
                ModelType = (_t.sent()).ModelType;
                if (!allowWeb) return [3 /*break*/, 16];
                console.log('🎯 [TRACE-3] 进入网页搜索分支');
                // 网页搜索流程
                res.write("data: ".concat(JSON.stringify({
                    type: 'search_start',
                    content: '🔍 正在分析搜索关键词...',
                    progress: 0,
                    timestamp: new Date().toISOString()
                }), "\n\n"));
                _t.label = 4;
            case 4:
                _t.trys.push([4, 14, , 15]);
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/tools/web-operation/web-search.tool')); })];
            case 5:
                webSearchTool = (_t.sent()).webSearchTool;
                // 发送搜索查询事件
                res.write("data: ".concat(JSON.stringify({
                    type: 'search_query',
                    content: "\uD83D\uDD0E \u6B63\u5728\u641C\u7D22\"".concat(decodedMessage_1.substring(0, 30)).concat(decodedMessage_1.length > 30 ? '...' : '', "\""),
                    progress: 10,
                    timestamp: new Date().toISOString()
                }), "\n\n"));
                // 发送连接搜索引擎状态
                res.write("data: ".concat(JSON.stringify({
                    type: 'search_connecting',
                    content: '🌐 正在连接搜索引擎...',
                    progress: 20,
                    timestamp: new Date().toISOString()
                }), "\n\n"));
                searchStartTime = Date.now();
                return [4 /*yield*/, webSearchTool.search(decodedMessage_1, {
                        maxResults: 5,
                        enableAISummary: true,
                        onProgress: function (progress, status) {
                            res.write("data: ".concat(JSON.stringify({
                                type: 'search_progress',
                                content: status,
                                progress: Math.min(20 + Math.floor(progress * 0.5), 70),
                                timestamp: new Date().toISOString()
                            }), "\n\n"));
                        }
                    })];
            case 6:
                searchResponse = _t.sent();
                searchTime = Date.now() - searchStartTime;
                // 发送搜索完成状态
                res.write("data: ".concat(JSON.stringify({
                    type: 'search_complete',
                    content: "\u2705 \u641C\u7D22\u5B8C\u6210\uFF01\u627E\u5230 ".concat(searchResponse.results.length, " \u6761\u7ED3\u679C\uFF08").concat(searchTime, "ms\uFF09"),
                    progress: 70,
                    resultCount: searchResponse.results.length,
                    searchTime: searchTime,
                    timestamp: new Date().toISOString()
                }), "\n\n"));
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/tools/web-operation/web-search.tool')); })];
            case 7:
                WebSearchTool = (_t.sent()).WebSearchTool;
                formattedResults = WebSearchTool.formatSearchResults(searchResponse);
                // 发送搜索结果（增加结构化信息）
                res.write("data: ".concat(JSON.stringify({
                    type: 'search_result',
                    content: formattedResults,
                    progress: 75,
                    resultData: {
                        results: searchResponse.results.slice(0, 3),
                        totalResults: searchResponse.totalResults,
                        aiSummary: searchResponse.aiSummary
                    },
                    timestamp: new Date().toISOString()
                }), "\n\n"));
                // 开始AI分析
                res.write("data: ".concat(JSON.stringify({
                    type: 'ai_analyzing',
                    content: '🤖 AI正在分析搜索结果...',
                    progress: 80,
                    timestamp: new Date().toISOString()
                }), "\n\n"));
                return [4 /*yield*/, modelSelector.selectModel({
                        modelType: ModelType.TEXT
                    })];
            case 8:
                selection = _t.sent();
                modelConfig = selection.model;
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/text-model.service')); })];
            case 9:
                textModelService = (_t.sent())["default"];
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/text-model.service')); })];
            case 10:
                MessageRole_5 = (_t.sent()).MessageRole;
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai-operator/unified-intelligence.service')); })];
            case 11:
                UnifiedIntelligenceService = (_t.sent()).UnifiedIntelligenceService;
                intelligenceService = new UnifiedIntelligenceService();
                return [4 /*yield*/, intelligenceService.getOrganizationStatusText(context)];
            case 12:
                organizationStatusText = _t.sent();
                systemPrompt = "\u4F60\u662F\u5E7C\u513F\u56ED\u7BA1\u7406\u7CFB\u7EDF\u7684AI\u52A9\u624B\u3002\u57FA\u4E8E\u4EE5\u4E0B\u641C\u7D22\u7ED3\u679C\u56DE\u7B54\u7528\u6237\u95EE\u9898\uFF0C\u7ED9\u51FA\u6E05\u6670\u3001\u7B80\u6D01\u3001\u53EF\u6267\u884C\u7684\u56DE\u7B54\u3002\n\n".concat(organizationStatusText, "\n\n\u641C\u7D22\u7ED3\u679C\uFF1A\n").concat(formattedResults, "\n\n\u8BF7\u57FA\u4E8E\u4E0A\u8FF0\u641C\u7D22\u7ED3\u679C\u56DE\u7B54\u7528\u6237\u7684\u95EE\u9898\uFF0C\u5982\u679C\u641C\u7D22\u7ED3\u679C\u4E0D\u591F\u5145\u5206\uFF0C\u53EF\u4EE5\u7ED3\u5408\u4F60\u7684\u77E5\u8BC6\u8865\u5145\u56DE\u7B54\u3002");
                // 发送AI生成中状态
                res.write("data: ".concat(JSON.stringify({
                    type: 'ai_generating',
                    content: '✨ AI正在生成回答...',
                    progress: 90,
                    timestamp: new Date().toISOString()
                }), "\n\n"));
                return [4 /*yield*/, textModelService.generateText(Number(userId_2) || 0, {
                        model: modelConfig.name,
                        messages: [
                            { role: MessageRole_5.SYSTEM, content: systemPrompt },
                            { role: MessageRole_5.USER, content: decodedMessage_1 }
                        ],
                        temperature: (_e = (_d = modelConfig.modelParameters) === null || _d === void 0 ? void 0 : _d.temperature) !== null && _e !== void 0 ? _e : 0.7,
                        maxTokens: (_h = (_g = (_f = modelConfig.modelParameters) === null || _f === void 0 ? void 0 : _f.maxTokens) !== null && _g !== void 0 ? _g : modelConfig.maxTokens) !== null && _h !== void 0 ? _h : 2000,
                        stream: false
                    })];
            case 13:
                result = _t.sent();
                content = ((_l = (_k = (_j = result.choices) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.message) === null || _l === void 0 ? void 0 : _l.content) || '';
                console.log('✅ [DirectChat-SSE] 网页搜索响应成功，Token消耗:', result.usage);
                // 发送AI生成完成状态
                res.write("data: ".concat(JSON.stringify({
                    type: 'ai_complete',
                    content: '🎯 回答生成完成！',
                    progress: 100,
                    timestamp: new Date().toISOString()
                }), "\n\n"));
                // 发送AI生成的最终回答
                res.write("data: ".concat(JSON.stringify({
                    type: 'message',
                    content: content,
                    progress: 100,
                    metadata: {
                        searchResults: searchResponse.results.length,
                        searchTime: searchTime,
                        tokenUsage: result.usage
                    },
                    timestamp: new Date().toISOString()
                }), "\n\n"));
                return [3 /*break*/, 15];
            case 14:
                error_8 = _t.sent();
                console.error('❌ [DirectChat-SSE] 网页搜索失败:', error_8);
                res.write("data: ".concat(JSON.stringify({
                    type: 'search_error',
                    content: "\u274C \u641C\u7D22\u5931\u8D25: ".concat(error_8.message || '网络连接异常'),
                    progress: 0,
                    timestamp: new Date().toISOString()
                }), "\n\n"));
                res.write("data: ".concat(JSON.stringify({
                    type: 'search_result',
                    content: '🔍 网络搜索暂时不可用\n\n抱歉，当前无法连接到搜索服务，请稍后重试或直接咨询我。',
                    timestamp: new Date().toISOString()
                }), "\n\n"));
                return [3 /*break*/, 15];
            case 15: return [3 /*break*/, 41];
            case 16:
                console.log('🎯 [TRACE-4] 跳过网页搜索分支，进入文件检测分支');
                // 检测文件链接
                console.log('🔍 [DirectChat-SSE] 开始检测文件链接，消息内容:', decodedMessage_1);
                fileLinks = extractFileLinks(decodedMessage_1);
                console.log('🔍 [DirectChat-SSE] 文件链接检测结果:', fileLinks);
                console.log('🎯 [TRACE-5] fileLinks.length =', fileLinks.length, '，准备判断是否进入文件分析分支...');
                if (!(fileLinks.length > 0)) return [3 /*break*/, 18];
                console.log('🎯 [TRACE-6] 进入文件分析分支');
                // 文件分析流程
                console.log('🔍 [DirectChat-SSE] 检测到文件链接:', fileLinks);
                res.write("data: ".concat(JSON.stringify({
                    type: 'thinking',
                    content: '📄 正在读取文件内容...',
                    timestamp: new Date().toISOString()
                }), "\n\n"));
                return [4 /*yield*/, handleMultimodalChatSSE(decodedMessage_1, fileLinks, modelSelector, userId_2, res, context)];
            case 17:
                _t.sent();
                return [3 /*break*/, 41];
            case 18:
                console.log('🎯 [TRACE-7] 跳过文件分析分支，进入快速查询分支');
                // 🚀 首先尝试快速查询系统
                console.log('🔍 [DirectChat-SSE] 尝试快速查询系统...');
                _t.label = 19;
            case 19:
                _t.trys.push([19, 32, , 33]);
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/query-router.service')); })];
            case 20:
                QueryRouterService_1 = (_t.sent()).QueryRouterService;
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/direct-response.service')); })];
            case 21:
                DirectResponseService_1 = (_t.sent()).DirectResponseService;
                queryRouter = new QueryRouterService_1();
                directResponse = new DirectResponseService_1();
                return [4 /*yield*/, queryRouter.routeQuery(decodedMessage_1)];
            case 22:
                routingResult = _t.sent();
                console.log('🎯 [DirectChat-SSE] 快速查询路由结果:', routingResult);
                console.log('🎯 [TRACE-8] 快速查询结果: level =', routingResult.level, ', confidence =', routingResult.confidence);
                if (!(routingResult.level === 'direct' && routingResult.confidence >= 0.8)) return [3 /*break*/, 31];
                console.log('🎯 [TRACE-9] 命中快速查询，直接返回结果');
                // 命中快速查询
                res.write("data: ".concat(JSON.stringify({
                    type: 'thinking',
                    content: '⚡ 快速查询匹配成功，正在获取数据...',
                    timestamp: new Date().toISOString()
                }), "\n\n"));
                actionKey = 'unknown';
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/query-router.service')); })];
            case 23:
                QueryRouterService_2 = (_t.sent()).QueryRouterService;
                queryRouter_1 = new QueryRouterService_2();
                directMatch = queryRouter_1.checkDirectMatch(decodedMessage_1);
                console.log('🔍 [DirectChat-SSE] checkDirectMatch 结果:', {
                    decodedMessage: decodedMessage_1,
                    directMatch: directMatch,
                    hasAction: directMatch === null || directMatch === void 0 ? void 0 : directMatch.action
                });
                if (directMatch && directMatch.action) {
                    // 优先使用查询路由系统返回的精确action
                    actionKey = directMatch.action;
                    console.log('✅ [DirectChat-SSE] 使用查询路由返回的动作:', actionKey);
                }
                else if (routingResult.directResponse) {
                    // 兜底：使用简单的关键词映射
                    if (routingResult.directResponse.includes('招生')) {
                        actionKey = 'get_enrollment_stats';
                    }
                    else if (routingResult.directResponse.includes('学生')) {
                        actionKey = 'get_student_stats';
                    }
                    else if (routingResult.directResponse.includes('统计')) {
                        actionKey = 'get_general_stats';
                    }
                }
                return [4 /*yield*/, directResponse.executeDirectAction(actionKey, decodedMessage_1)];
            case 24:
                quickResult = _t.sent();
                console.log('✅ [DirectChat-SSE] 快速查询结果:', quickResult);
                _t.label = 25;
            case 25:
                _t.trys.push([25, 29, , 30]);
                if (!conversationId_2) return [3 /*break*/, 28];
                return [4 /*yield*/, messageService_1.createMessage({
                        conversationId: conversationId_2,
                        userId: Number(userId_2),
                        role: ai_message_model_1.MessageRole.USER,
                        content: decodedMessage_1,
                        messageType: 'text',
                        tokens: Math.ceil(decodedMessage_1.length / 4)
                    })];
            case 26:
                // 保存用户消息
                savedUserMessage_1 = _t.sent();
                return [4 /*yield*/, messageService_1.createMessage({
                        conversationId: conversationId_2,
                        userId: Number(userId_2),
                        role: ai_message_model_1.MessageRole.ASSISTANT,
                        content: quickResult.response,
                        messageType: 'text',
                        tokens: quickResult.tokensUsed || Math.ceil(quickResult.response.length / 4),
                        metadata: {
                            level: 'level-1',
                            approach: 'quick_query',
                            confidence: routingResult.confidence,
                            actionKey: actionKey
                        }
                    })];
            case 27:
                // 保存AI回复
                savedAIMessage_1 = _t.sent();
                console.log('💾 [DirectChat-SSE] 消息保存成功:', {
                    userMessageId: savedUserMessage_1.id,
                    aiMessageId: savedAIMessage_1.id
                });
                _t.label = 28;
            case 28: return [3 /*break*/, 30];
            case 29:
                saveError_5 = _t.sent();
                console.error('❌ [DirectChat-SSE] 消息保存失败:', saveError_5);
                return [3 /*break*/, 30];
            case 30:
                // 发送快速查询结果
                res.write("data: ".concat(JSON.stringify({
                    type: 'message',
                    content: quickResult.response,
                    timestamp: new Date().toISOString(),
                    quickQuery: true,
                    confidence: routingResult.confidence,
                    tokensUsed: quickResult.tokensUsed
                }), "\n\n"));
                // 🚫 禁用AI智能分析 - 快速查询直接返回结果，不调用大模型
                // if (quickResult.data && (actionKey.includes('data') || actionKey.includes('统计') || decodedMessage.includes('统计'))) {
                //   console.log('📊 [DirectChat-SSE] 检测到数据查询，启动AI智能分析...');
                //   // ... AI分析代码已禁用
                // }
                // 快速查询流程完成，直接返回
                res.write("data: ".concat(JSON.stringify({ type: 'done' }), "\n\n"));
                res.end();
                return [2 /*return*/];
            case 31: return [3 /*break*/, 33];
            case 32:
                quickQueryError_1 = _t.sent();
                console.log('⚠️ [DirectChat-SSE] 快速查询失败，移交给三级分级检索处理:', (quickQueryError_1 === null || quickQueryError_1 === void 0 ? void 0 : quickQueryError_1.message) || quickQueryError_1);
                return [3 /*break*/, 33];
            case 33:
                console.log('🎯 [TRACE-10] 快速查询未命中或失败，进入流式AI调用分支');
                // 🚀 修复：使用流式AI调用，实时提取reasoning_content
                console.log('🔄 [DirectChat-SSE] 启动流式AI调用...');
                _t.label = 34;
            case 34:
                _t.trys.push([34, 40, , 41]);
                return [4 /*yield*/, modelSelector.selectModel({
                        modelType: ModelType.TEXT
                    })];
            case 35:
                selection = _t.sent();
                modelConfig_1 = selection.model;
                console.log('🤖 [DirectChat-SSE] 选择模型:', modelConfig_1.name);
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai-operator/unified-intelligence.service')); })];
            case 36:
                UnifiedIntelligenceService = (_t.sent()).UnifiedIntelligenceService;
                intelligenceService = new UnifiedIntelligenceService();
                return [4 /*yield*/, intelligenceService.getOrganizationStatusText(context)];
            case 37:
                organizationStatusText = _t.sent();
                systemPrompt = "\u4F60\u662F\u5E7C\u513F\u56ED\u7BA1\u7406\u7CFB\u7EDF\u7684AI\u52A9\u624B\u3002\n\n".concat(organizationStatusText, "\n\n\u8BF7\u7ED9\u51FA\u6E05\u6670\u3001\u7B80\u6D01\u3001\u53EF\u6267\u884C\u7684\u56DE\u7B54\u3002");
                modelId = String(((_m = modelConfig_1.modelParameters) === null || _m === void 0 ? void 0 : _m.model_id) || modelConfig_1.name);
                streamParams = {
                    model: modelId,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: decodedMessage_1 }
                    ],
                    temperature: (_p = (_o = modelConfig_1.modelParameters) === null || _o === void 0 ? void 0 : _o.temperature) !== null && _p !== void 0 ? _p : 0.7,
                    max_tokens: (_s = (_r = (_q = modelConfig_1.modelParameters) === null || _q === void 0 ? void 0 : _q.maxTokens) !== null && _r !== void 0 ? _r : modelConfig_1.maxTokens) !== null && _s !== void 0 ? _s : 2000,
                    stream: true
                };
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/bridge/ai-bridge.service')); })];
            case 38:
                aiBridgeService = (_t.sent()).aiBridgeService;
                customConfig = {
                    endpointUrl: modelConfig_1.endpointUrl,
                    apiKey: modelConfig_1.apiKey
                };
                return [4 /*yield*/, aiBridgeService.generateChatCompletionStream(streamParams, customConfig, conversationId_2, Number(userId_2))];
            case 39:
                stream = _t.sent();
                fullContent_1 = '';
                fullReasoningContent_1 = '';
                buffer_1 = '';
                stream.on('data', function (chunk) {
                    var _a, _b;
                    buffer_1 += chunk.toString();
                    var lines = buffer_1.split('\n');
                    buffer_1 = lines.pop() || '';
                    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                        var line = lines_1[_i];
                        if (!line.trim() || line.trim() === 'data: [DONE]')
                            continue;
                        if (line.startsWith('data: ')) {
                            var data = line.slice(6);
                            try {
                                var parsed = JSON.parse(data);
                                var delta = (_b = (_a = parsed.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.delta;
                                if (delta) {
                                    // 🤔 处理思考内容 (reasoning_content)
                                    if (delta.reasoning_content) {
                                        fullReasoningContent_1 += delta.reasoning_content;
                                        console.log("\uD83E\uDD14 [Reasoning] ".concat(delta.reasoning_content.substring(0, 50), "..."));
                                        // 实时发送thinking事件给前端
                                        res.write("data: ".concat(JSON.stringify({
                                            type: 'thinking',
                                            content: delta.reasoning_content,
                                            timestamp: new Date().toISOString()
                                        }), "\n\n"));
                                    }
                                    // 📝 处理回复内容
                                    if (delta.content) {
                                        fullContent_1 += delta.content;
                                        // 实时发送content事件给前端
                                        res.write("data: ".concat(JSON.stringify({
                                            type: 'content',
                                            content: delta.content,
                                            timestamp: new Date().toISOString()
                                        }), "\n\n"));
                                    }
                                }
                            }
                            catch (e) {
                                console.warn('解析流式数据失败:', e);
                            }
                        }
                    }
                });
                stream.on('end', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var DBMessageRole, saveError_6;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                console.log('✅ [DirectChat-SSE] 流式传输完成');
                                console.log("\uD83D\uDCCA [DirectChat-SSE] \u5B8C\u6574\u5185\u5BB9\u957F\u5EA6: ".concat(fullContent_1.length));
                                console.log("\uD83E\uDD14 [DirectChat-SSE] \u5B8C\u6574\u601D\u8003\u5185\u5BB9\u957F\u5EA6: ".concat(fullReasoningContent_1.length));
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 7, , 8]);
                                if (!(conversationId_2 && fullContent_1)) return [3 /*break*/, 6];
                                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-message.model')); })];
                            case 2:
                                DBMessageRole = (_a.sent()).MessageRole;
                                if (!!savedUserMessage_1) return [3 /*break*/, 4];
                                return [4 /*yield*/, messageService_1.createMessage({
                                        conversationId: conversationId_2,
                                        userId: Number(userId_2),
                                        role: DBMessageRole.USER,
                                        content: decodedMessage_1,
                                        messageType: 'text',
                                        tokens: Math.ceil(decodedMessage_1.length / 4)
                                    })];
                            case 3:
                                savedUserMessage_1 = _a.sent();
                                _a.label = 4;
                            case 4: return [4 /*yield*/, messageService_1.createMessage({
                                    conversationId: conversationId_2,
                                    userId: Number(userId_2),
                                    role: DBMessageRole.ASSISTANT,
                                    content: fullContent_1,
                                    messageType: 'text',
                                    tokens: Math.ceil(fullContent_1.length / 4),
                                    metadata: {
                                        reasoningContent: fullReasoningContent_1,
                                        model: modelConfig_1.name
                                    }
                                })];
                            case 5:
                                // 保存AI回复
                                savedAIMessage_1 = _a.sent();
                                console.log('💾 [DirectChat-SSE] 消息保存成功');
                                _a.label = 6;
                            case 6: return [3 /*break*/, 8];
                            case 7:
                                saveError_6 = _a.sent();
                                console.error('❌ [DirectChat-SSE] 消息保存失败:', saveError_6);
                                return [3 /*break*/, 8];
                            case 8:
                                // 发送完成事件
                                res.write("data: ".concat(JSON.stringify({
                                    type: 'done',
                                    timestamp: new Date().toISOString()
                                }), "\n\n"));
                                res.end();
                                return [2 /*return*/];
                        }
                    });
                }); });
                stream.on('error', function (error) {
                    console.error('❌ [DirectChat-SSE] 流式传输错误:', error);
                    res.write("data: ".concat(JSON.stringify({
                        type: 'error',
                        content: '流式传输失败',
                        timestamp: new Date().toISOString()
                    }), "\n\n"));
                    res.end();
                });
                // 函数在这里返回，让流式处理继续
                return [2 /*return*/];
            case 40:
                error_9 = _t.sent();
                console.error('❌ [DirectChat-SSE] 流式AI调用失败:', error_9);
                res.write("data: ".concat(JSON.stringify({
                    type: 'error',
                    content: '❌ AI调用失败，请稍后重试',
                    timestamp: new Date().toISOString()
                }), "\n\n"));
                res.end();
                return [3 /*break*/, 41];
            case 41:
                // 发送完成信号
                res.write("data: ".concat(JSON.stringify({ type: 'done' }), "\n\n"));
                res.end();
                return [3 /*break*/, 43];
            case 42:
                error_10 = _t.sent();
                console.error('❌ [DirectChat-SSE] 处理失败:', error_10);
                try {
                    res.write("data: ".concat(JSON.stringify({
                        type: 'error',
                        content: '❌ 系统错误，请稍后重试',
                        timestamp: new Date().toISOString()
                    }), "\n\n"));
                    res.write("data: ".concat(JSON.stringify({ type: 'done' }), "\n\n"));
                    res.end();
                }
                catch (writeError) {
                    console.error('❌ [DirectChat-SSE] 写入响应失败:', writeError);
                }
                return [3 /*break*/, 43];
            case 43: return [2 /*return*/];
        }
    });
}); });
// 工具能力查询接口
router.get('/capabilities', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var capabilities;
    return __generator(this, function (_a) {
        try {
            capabilities = {
                // 页面感知能力
                page_awareness: {
                    name: '页面感知',
                    description: '实时扫描和理解页面结构',
                    tools: ['get_page_structure', 'validate_page_state', 'wait_for_element'],
                    confidence: 0.95
                },
                // 操作执行能力
                action_execution: {
                    name: '操作执行',
                    description: '智能页面导航和DOM操作',
                    tools: ['navigate_to_page', 'fill_form', 'click_element', 'submit_form'],
                    confidence: 0.90
                },
                // 数据可视化能力
                data_visualization: {
                    name: '数据可视化',
                    description: '图表和表格的智能生成',
                    tools: ['render_component', 'create_chart', 'generate_table'],
                    confidence: 0.88
                },
                // 认知能力
                cognitive: {
                    name: '认知分析',
                    description: '任务分解和复杂度分析',
                    tools: ['analyze_task_complexity', 'create_todo_list', 'update_todo_task'],
                    confidence: 0.85
                },
                // 专家咨询能力
                expert_consultation: {
                    name: '专家咨询',
                    description: '多领域专家智能匹配和咨询',
                    tools: ['call_expert', 'get_expert_list', 'generate_advice'],
                    confidence: 0.80
                }
            };
            res.json({
                success: true,
                data: {
                    total_capabilities: Object.keys(capabilities).length,
                    capabilities: capabilities,
                    system_info: {
                        name: 'Unified Intelligence System',
                        version: '1.0.0',
                        architecture: 'unified_decision + specialized_execution'
                    }
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: '能力查询失败'
            });
        }
        return [2 /*return*/];
    });
}); });
// 导入SSE流式聊天路由
var unified_stream_routes_1 = __importDefault(require("./unified-stream.routes"));
router.use(unified_stream_routes_1["default"]);
// 兼容旧测试脚本的路由
router.post('/unified-intelligence', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, message, context, userId, userRequest, response, error_11;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _a = req.body, message = _a.message, context = _a.context;
                userId = (context === null || context === void 0 ? void 0 : context.userId) || '121';
                if (!message || typeof message !== 'string') {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: '消息内容不能为空'
                        })];
                }
                console.log('🧠 [UnifiedIntelligence] 收到兼容请求:', { message: message, userId: userId });
                userRequest = {
                    content: message,
                    userId: userId,
                    conversationId: "test_".concat(Date.now()),
                    context: __assign({ timestamp: new Date().toISOString(), source: 'compatibility-test', role: (context === null || context === void 0 ? void 0 : context.role) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) || 'parent' }, context)
                };
                return [4 /*yield*/, processWithTieredRetrieval(userRequest)];
            case 1:
                response = _c.sent();
                // 返回兼容格式的响应（保持测试脚本期望的结构）
                res.json({
                    success: response.success,
                    data: {
                        message: response.data.message,
                        analysis: {
                            intent: 'general_assistance',
                            complexity: response.metadata.complexity,
                            complexityScore: response.metadata.confidenceScore
                        }
                    },
                    metadata: response.metadata
                });
                return [3 /*break*/, 3];
            case 2:
                error_11 = _c.sent();
                console.error('❌ [UnifiedIntelligence] 兼容处理失败:', error_11);
                res.status(500).json({
                    success: false,
                    error: '智能处理失败',
                    details: process.env.NODE_ENV === 'development' ? error_11.message : undefined
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
