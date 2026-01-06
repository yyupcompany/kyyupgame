"use strict";
/**
 * AI模型使用统计服务实现
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
// 导入sequelize的Op
var sequelize_1 = require("sequelize");
var ai_model_usage_model_1 = require("../../models/ai-model-usage.model");
/**
 * AI模型使用统计服务类
 * 实现AI模型使用情况的记录与统计功能
 */
var AIModelUsageService = /** @class */ (function () {
    function AIModelUsageService() {
    }
    /**
     * 记录请求开始
     * @param externalUserId 用户ID
     * @param modelId 模型ID
     * @param sessionId 会话ID
     * @param requestId 请求ID
     * @param usageType 使用类型
     * @returns 请求ID对象
     */
    AIModelUsageService.prototype.recordRequestStart = function (externalUserId, modelId, sessionId, requestId, usageType) {
        return __awaiter(this, void 0, void 0, function () {
            var validUsageType, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        validUsageType = void 0;
                        // 将字符串转换为枚举值
                        switch (usageType.toLowerCase()) {
                            case 'text':
                                validUsageType = ai_model_usage_model_1.AIUsageType.TEXT;
                                break;
                            case 'image':
                                validUsageType = ai_model_usage_model_1.AIUsageType.IMAGE;
                                break;
                            case 'audio':
                                validUsageType = ai_model_usage_model_1.AIUsageType.AUDIO;
                                break;
                            case 'video':
                                validUsageType = ai_model_usage_model_1.AIUsageType.VIDEO;
                                break;
                            case 'embedding':
                                validUsageType = ai_model_usage_model_1.AIUsageType.EMBEDDING;
                                break;
                            default:
                                validUsageType = ai_model_usage_model_1.AIUsageType.TEXT; // 默认为文本类型
                        }
                        // 创建使用记录
                        return [4 /*yield*/, ai_model_usage_model_1.AIModelUsage.create({
                                userId: externalUserId,
                                modelId: modelId,
                                sessionId: sessionId,
                                requestId: requestId,
                                usageType: validUsageType,
                                requestTimestamp: new Date(),
                                status: ai_model_usage_model_1.AIUsageStatus.PENDING
                            })];
                    case 1:
                        // 创建使用记录
                        _a.sent();
                        return [2 /*return*/, { requestId: requestId }];
                    case 2:
                        error_1 = _a.sent();
                        console.error('记录AI请求开始失败:', error_1);
                        throw new Error("\u8BB0\u5F55AI\u8BF7\u6C42\u5F00\u59CB\u5931\u8D25: ".concat(error_1.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 记录请求完成
     * @param requestId 请求ID
     * @param tokensInput 输入令牌数
     * @param tokensOutput 输出令牌数
     * @param durationMs 处理时间(毫秒)
     * @param cost 成本
     * @param status 状态
     * @param errorMessage 错误信息
     * @returns 是否成功
     */
    AIModelUsageService.prototype.recordRequestComplete = function (requestId, tokensInput, tokensOutput, durationMs, cost, status, errorMessage) {
        if (status === void 0) { status = 'success'; }
        if (errorMessage === void 0) { errorMessage = null; }
        return __awaiter(this, void 0, void 0, function () {
            var validStatus, usageRecord, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        validStatus = void 0;
                        switch (status.toLowerCase()) {
                            case 'success':
                                validStatus = ai_model_usage_model_1.AIUsageStatus.SUCCESS;
                                break;
                            case 'failed':
                                validStatus = ai_model_usage_model_1.AIUsageStatus.FAILED;
                                break;
                            case 'throttled':
                                validStatus = ai_model_usage_model_1.AIUsageStatus.THROTTLED;
                                break;
                            default:
                                validStatus = ai_model_usage_model_1.AIUsageStatus.SUCCESS;
                        }
                        return [4 /*yield*/, ai_model_usage_model_1.AIModelUsage.findOne({
                                where: { requestId: requestId }
                            })];
                    case 1:
                        usageRecord = _a.sent();
                        if (!usageRecord) {
                            return [2 /*return*/, false];
                        }
                        // 更新记录
                        return [4 /*yield*/, usageRecord.update({
                                inputTokens: tokensInput,
                                outputTokens: tokensOutput,
                                totalTokens: tokensInput + tokensOutput,
                                processingTime: durationMs,
                                cost: cost,
                                status: validStatus,
                                errorMessage: errorMessage,
                                responseTimestamp: new Date()
                            })];
                    case 2:
                        // 更新记录
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_2 = _a.sent();
                        console.error('记录AI请求完成失败:', error_2);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 记录请求失败
     * @param requestId 请求ID
     * @param errorMessage 错误信息
     * @param processingTimeMs 处理时间(毫秒)
     * @returns 是否成功
     */
    AIModelUsageService.prototype.recordRequestFailure = function (requestId, errorMessage, processingTimeMs) {
        if (processingTimeMs === void 0) { processingTimeMs = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var usageRecord, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, ai_model_usage_model_1.AIModelUsage.findOne({
                                where: { requestId: requestId }
                            })];
                    case 1:
                        usageRecord = _a.sent();
                        if (!usageRecord) {
                            return [2 /*return*/, false];
                        }
                        // 更新记录
                        return [4 /*yield*/, usageRecord.update({
                                status: ai_model_usage_model_1.AIUsageStatus.FAILED,
                                errorMessage: errorMessage,
                                processingTime: processingTimeMs,
                                responseTimestamp: new Date()
                            })];
                    case 2:
                        // 更新记录
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_3 = _a.sent();
                        console.error('记录AI请求失败:', error_3);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户使用统计
     * @param userId 用户ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 使用统计信息
     */
    AIModelUsageService.prototype.getUserUsageStats = function (userId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var usageRecords, totalRequests, successfulRequests, totalTokens, totalCost, usageByType_1, error_4;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ai_model_usage_model_1.AIModelUsage.findAll({
                                where: {
                                    userId: userId,
                                    requestTimestamp: (_a = {},
                                        _a[sequelize_1.Op.between] = [startDate, endDate],
                                        _a)
                                }
                            })];
                    case 1:
                        usageRecords = _b.sent();
                        totalRequests = usageRecords.length;
                        successfulRequests = usageRecords.filter(function (r) { return r.status === ai_model_usage_model_1.AIUsageStatus.SUCCESS; }).length;
                        totalTokens = usageRecords.reduce(function (sum, r) { return sum + (r.totalTokens || 0); }, 0);
                        totalCost = parseFloat(usageRecords.reduce(function (sum, r) { return sum + (r.cost || 0); }, 0).toFixed(6));
                        usageByType_1 = {};
                        usageRecords.forEach(function (record) {
                            var type = record.usageType;
                            usageByType_1[type] = (usageByType_1[type] || 0) + 1;
                        });
                        return [2 /*return*/, {
                                totalRequests: totalRequests,
                                successfulRequests: successfulRequests,
                                totalTokens: totalTokens,
                                totalCost: totalCost,
                                usageByType: usageByType_1
                            }];
                    case 2:
                        error_4 = _b.sent();
                        console.error('获取用户使用统计失败:', error_4);
                        // 返回空统计数据
                        return [2 /*return*/, {
                                totalRequests: 0,
                                successfulRequests: 0,
                                totalTokens: 0,
                                totalCost: 0,
                                usageByType: {}
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取模型使用统计
     * @param modelId 模型ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 使用统计信息
     */
    AIModelUsageService.prototype.getModelUsageStats = function (modelId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var usageRecords, totalRequests, successfulRequests, totalTokens, totalCost, validTimes, averageProcessingTime, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ai_model_usage_model_1.AIModelUsage.findAll({
                                where: {
                                    modelId: modelId,
                                    requestTimestamp: (_a = {},
                                        _a[sequelize_1.Op.between] = [startDate, endDate],
                                        _a)
                                }
                            })];
                    case 1:
                        usageRecords = _b.sent();
                        totalRequests = usageRecords.length;
                        successfulRequests = usageRecords.filter(function (r) { return r.status === ai_model_usage_model_1.AIUsageStatus.SUCCESS; }).length;
                        totalTokens = usageRecords.reduce(function (sum, r) { return sum + (r.totalTokens || 0); }, 0);
                        totalCost = parseFloat(usageRecords.reduce(function (sum, r) { return sum + (r.cost || 0); }, 0).toFixed(6));
                        validTimes = usageRecords.filter(function (r) { return r.processingTime !== null; }).map(function (r) { return r.processingTime; });
                        averageProcessingTime = validTimes.length > 0
                            ? Math.round(validTimes.reduce(function (sum, time) { return sum + time; }, 0) / validTimes.length)
                            : 0;
                        return [2 /*return*/, {
                                totalRequests: totalRequests,
                                successfulRequests: successfulRequests,
                                totalTokens: totalTokens,
                                totalCost: totalCost,
                                averageProcessingTime: averageProcessingTime
                            }];
                    case 2:
                        error_5 = _b.sent();
                        console.error('获取模型使用统计失败:', error_5);
                        // 返回空统计数据
                        return [2 /*return*/, {
                                totalRequests: 0,
                                successfulRequests: 0,
                                totalTokens: 0,
                                totalCost: 0,
                                averageProcessingTime: 0
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 计算指定Token数的成本
     * @param modelId 模型ID
     * @param inputTokens 输入令牌数
     * @param outputTokens 输出令牌数
     * @returns 计算的成本
     */
    AIModelUsageService.prototype.calculateCost = function (modelId, inputTokens, outputTokens) {
        return __awaiter(this, void 0, void 0, function () {
            var DEFAULT_INPUT_PRICE, DEFAULT_OUTPUT_PRICE, inputCost, outputCost;
            return __generator(this, function (_a) {
                try {
                    DEFAULT_INPUT_PRICE = 0.0000005;
                    DEFAULT_OUTPUT_PRICE = 0.0000015;
                    inputCost = inputTokens * DEFAULT_INPUT_PRICE;
                    outputCost = outputTokens * DEFAULT_OUTPUT_PRICE;
                    return [2 /*return*/, inputCost + outputCost];
                }
                catch (error) {
                    console.error('计算成本失败:', error);
                    // 出错时返回0成本
                    return [2 /*return*/, 0];
                }
                return [2 /*return*/];
            });
        });
    };
    return AIModelUsageService;
}());
// 导出服务实例
exports["default"] = new AIModelUsageService();
