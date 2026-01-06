"use strict";
/**
 * AI模型管理中间层
 * 负责AI模型配置、使用统计和计费管理，组合模型配置服务、使用统计服务和计费服务
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
exports.aiModelManagementMiddleware = void 0;
var ai_1 = require("../../services/ai");
var base_middleware_1 = require("./base.middleware");
/**
 * AI模型管理中间层实现
 */
var AiModelManagementMiddleware = /** @class */ (function (_super) {
    __extends(AiModelManagementMiddleware, _super);
    function AiModelManagementMiddleware() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * 获取可用的AI模型列表
     * @param userId 用户ID
     * @returns 可用模型列表
     */
    AiModelManagementMiddleware.prototype.getAvailableModels = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, models, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:model:read'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有查看模型的权限', { userId: userId });
                        }
                        return [4 /*yield*/, ai_1.aiModelConfigService.getAllModels()];
                    case 2:
                        models = _a.sent();
                        result = models.map(function (model) { return ({
                            id: model.id,
                            modelName: model.modelName,
                            provider: model.provider,
                            version: model.version,
                            capabilities: model.capabilities,
                            isActive: model.isActive
                        }); });
                        return [2 /*return*/, this.createSuccessResponse(result)];
                    case 3:
                        error_1 = _a.sent();
                        return [2 /*return*/, this.handleError(error_1)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取模型详情
     * @param userId 用户ID
     * @param modelId 模型ID
     * @returns 模型详情
     */
    AiModelManagementMiddleware.prototype.getModelDetails = function (userId, modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, model, now, thirtyDaysAgo, usageStats, userUsageStats, billingInfo, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:model:read'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有查看模型详情的权限', { userId: userId, modelId: modelId });
                        }
                        return [4 /*yield*/, ai_1.aiModelConfigService.getModelById(modelId)];
                    case 2:
                        model = _a.sent();
                        if (!model) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.NOT_FOUND, '模型不存在', { modelId: modelId });
                        }
                        now = new Date();
                        thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, ai_1.aiModelUsageService.getModelUsageStats(modelId, thirtyDaysAgo, now)];
                    case 3:
                        usageStats = _a.sent();
                        return [4 /*yield*/, ai_1.aiModelUsageService.getUserUsageStats(userId, thirtyDaysAgo, now)];
                    case 4:
                        userUsageStats = _a.sent();
                        return [4 /*yield*/, ai_1.aiModelBillingService.getCurrentBillingRule(modelId)];
                    case 5:
                        billingInfo = _a.sent();
                        result = __assign(__assign({}, model), { usageStats: {
                                totalRequests: usageStats.totalRequests || 0,
                                successfulRequests: usageStats.successfulRequests || 0,
                                totalTokens: usageStats.totalTokens || 0,
                                totalCost: usageStats.totalCost || 0,
                                averageProcessingTime: usageStats.averageProcessingTime || 0
                            }, userUsageStats: {
                                totalRequests: userUsageStats.totalRequests || 0,
                                successfulRequests: userUsageStats.successfulRequests || 0,
                                totalTokens: userUsageStats.totalTokens || 0,
                                totalCost: userUsageStats.totalCost || 0
                            }, billingInfo: billingInfo });
                        return [2 /*return*/, this.createSuccessResponse(result)];
                    case 6:
                        error_2 = _a.sent();
                        return [2 /*return*/, this.handleError(error_2)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新用户模型偏好
     * @param userId 用户ID
     * @param modelId 模型ID
     * @returns 更新结果
     */
    AiModelManagementMiddleware.prototype.updateUserModelPreference = function (userId, modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, model, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:model:update'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有更新模型偏好的权限', { userId: userId, modelId: modelId });
                        }
                        return [4 /*yield*/, ai_1.aiModelConfigService.getModelById(modelId)];
                    case 2:
                        model = _a.sent();
                        if (!model) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.NOT_FOUND, '模型不存在', { modelId: modelId });
                        }
                        // 由于服务层没有提供更新用户模型偏好的方法
                        throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.SERVICE_UNAVAILABLE, '更新模型偏好功能暂不可用', { userId: userId, modelId: modelId });
                    case 3:
                        error_3 = _a.sent();
                        return [2 /*return*/, this.handleError(error_3)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户模型使用情况
     * @param userId 用户ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 使用情况统计
     */
    AiModelManagementMiddleware.prototype.getUserModelUsage = function (userId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, usageStats, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:usage:read'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有查看使用情况的权限', { userId: userId });
                        }
                        return [4 /*yield*/, ai_1.aiModelUsageService.getUserUsageStats(userId, startDate, endDate)];
                    case 2:
                        usageStats = _a.sent();
                        result = {
                            totalRequests: usageStats.totalRequests || 0,
                            successfulRequests: usageStats.successfulRequests || 0,
                            totalTokens: usageStats.totalTokens || 0,
                            totalCost: usageStats.totalCost || 0,
                            usageByType: usageStats.usageByType || {}
                        };
                        return [2 /*return*/, this.createSuccessResponse(result)];
                    case 3:
                        error_4 = _a.sent();
                        return [2 /*return*/, this.handleError(error_4)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取模型使用统计
     * @param modelId 模型ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 使用情况统计
     */
    AiModelManagementMiddleware.prototype.getModelUsageStats = function (modelId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, model, usageStats, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.validatePermissions(0, ['ai:admin:usage:read'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有查看模型统计的权限');
                        }
                        return [4 /*yield*/, ai_1.aiModelConfigService.getModelById(modelId)];
                    case 2:
                        model = _a.sent();
                        if (!model) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.NOT_FOUND, '模型不存在', { modelId: modelId });
                        }
                        return [4 /*yield*/, ai_1.aiModelUsageService.getModelUsageStats(modelId, startDate, endDate)];
                    case 3:
                        usageStats = _a.sent();
                        result = {
                            modelId: modelId,
                            modelName: model.modelName || "Model-".concat(modelId),
                            totalRequests: usageStats.totalRequests || 0,
                            successfulRequests: usageStats.successfulRequests || 0,
                            totalTokens: usageStats.totalTokens || 0,
                            totalCost: usageStats.totalCost || 0,
                            averageProcessingTime: usageStats.averageProcessingTime || 0
                        };
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
     * 获取用户计费信息
     * @param userId 用户ID
     * @returns 计费信息
     */
    AiModelManagementMiddleware.prototype.getUserBillingInfo = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:billing:read'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有查看计费信息的权限', { userId: userId });
                        }
                        // 服务层未提供获取用户计费信息的方法
                        throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.SERVICE_UNAVAILABLE, '计费信息查询功能暂不可用', { userId: userId });
                    case 2:
                        error_6 = _a.sent();
                        return [2 /*return*/, this.handleError(error_6)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 计算使用成本
     * @param inputTokens 输入标记数
     * @param outputTokens 输出标记数
     * @param modelId 模型ID
     * @returns 计算的成本
     */
    AiModelManagementMiddleware.prototype.calculateCost = function (inputTokens, outputTokens, modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var model, costResult, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, ai_1.aiModelConfigService.getModelById(modelId)];
                    case 1:
                        model = _a.sent();
                        if (!model) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.NOT_FOUND, '模型不存在', { modelId: modelId });
                        }
                        return [4 /*yield*/, ai_1.aiModelBillingService.calculateCost(modelId, inputTokens, outputTokens)];
                    case 2:
                        costResult = _a.sent();
                        return [2 /*return*/, this.createSuccessResponse({ cost: Number(costResult.totalCost) })];
                    case 3:
                        error_7 = _a.sent();
                        return [2 /*return*/, this.handleError(error_7)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理付款
     * @param userId 用户ID
     * @param amount 金额
     * @param paymentMethod 支付方式
     * @returns 支付结果
     */
    AiModelManagementMiddleware.prototype.processPayment = function (userId, amount, paymentMethod) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, validPaymentMethods, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:billing:payment'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有支付权限', { userId: userId });
                        }
                        // 验证支付参数
                        if (amount <= 0) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.VALIDATION_FAILED, '支付金额必须大于0', { amount: amount });
                        }
                        validPaymentMethods = ['credit_card', 'alipay', 'wechat_pay', 'bank_transfer'];
                        if (!validPaymentMethods.includes(paymentMethod)) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.VALIDATION_FAILED, '无效的支付方式', { paymentMethod: paymentMethod, validPaymentMethods: validPaymentMethods });
                        }
                        // 服务层未提供支付处理方法
                        throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.SERVICE_UNAVAILABLE, '支付处理功能暂不可用', { userId: userId, amount: amount, paymentMethod: paymentMethod });
                    case 2:
                        error_8 = _a.sent();
                        return [2 /*return*/, this.handleError(error_8)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 按天聚合使用统计
     * @param usageStats 使用统计记录
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 按天聚合的使用统计
     * @private
     */
    AiModelManagementMiddleware.prototype.aggregateUsageByDay = function (usageStats, startDate, endDate) {
        var result = [];
        var dayMap = new Map();
        // 初始化每天的数据
        var currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            var dateString = currentDate.toISOString().split('T')[0];
            dayMap.set(dateString, {
                date: dateString,
                totalTokens: 0,
                inputTokens: 0,
                outputTokens: 0
            });
            currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
        }
        // 聚合数据
        for (var _i = 0, usageStats_1 = usageStats; _i < usageStats_1.length; _i++) {
            var stat = usageStats_1[_i];
            var dateString = new Date(stat.timestamp).toISOString().split('T')[0];
            var dayData = dayMap.get(dateString);
            if (dayData) {
                dayData.totalTokens += stat.totalTokens;
                dayData.inputTokens += stat.inputTokens;
                dayData.outputTokens += stat.outputTokens;
            }
        }
        // 转换为数组
        for (var _a = 0, _b = dayMap.values(); _a < _b.length; _a++) {
            var dayData = _b[_a];
            result.push(dayData);
        }
        // 按日期排序
        result.sort(function (a, b) { return a.date.localeCompare(b.date); });
        return result;
    };
    return AiModelManagementMiddleware;
}(base_middleware_1.BaseMiddleware));
// 导出单例实例
exports.aiModelManagementMiddleware = new AiModelManagementMiddleware();
