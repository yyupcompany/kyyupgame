"use strict";
/**
 * 智能模型选择服务
 * 负责根据不同策略选择最合适的AI模型
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.ModelSelectionStrategy = void 0;
var ai_model_config_model_1 = require("../../models/ai-model-config.model");
var model_cache_service_1 = __importDefault(require("./model-cache.service"));
/**
 * 模型选择策略枚举
 */
var ModelSelectionStrategy;
(function (ModelSelectionStrategy) {
    ModelSelectionStrategy["DEFAULT"] = "default";
    ModelSelectionStrategy["PRIORITY"] = "priority";
    ModelSelectionStrategy["COST_OPTIMIZED"] = "cost";
    ModelSelectionStrategy["PERFORMANCE"] = "performance";
    ModelSelectionStrategy["LOAD_BALANCE"] = "load_balance";
    ModelSelectionStrategy["FALLBACK"] = "fallback"; // 故障转移
})(ModelSelectionStrategy = exports.ModelSelectionStrategy || (exports.ModelSelectionStrategy = {}));
/**
 * 智能模型选择服务类
 */
var ModelSelectorService = /** @class */ (function () {
    function ModelSelectorService() {
    }
    /**
     * 选择最合适的模型
     * @param options 选择选项
     * @returns 选择结果
     */
    ModelSelectorService.prototype.selectModel = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var modelType, _a, strategy, availableModels, selectedModel, reason, _b, alternatives;
            var _c, _d, _e, _f, _g, _h, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        modelType = options.modelType, _a = options.strategy, strategy = _a === void 0 ? ModelSelectionStrategy.DEFAULT : _a;
                        return [4 /*yield*/, this.getAvailableModels(modelType, options)];
                    case 1:
                        availableModels = _k.sent();
                        if (availableModels.length === 0) {
                            throw new Error("\u6CA1\u6709\u627E\u5230\u53EF\u7528\u7684 ".concat(modelType, " \u7C7B\u578B\u6A21\u578B"));
                        }
                        _b = strategy;
                        switch (_b) {
                            case ModelSelectionStrategy.DEFAULT: return [3 /*break*/, 2];
                            case ModelSelectionStrategy.PRIORITY: return [3 /*break*/, 3];
                            case ModelSelectionStrategy.COST_OPTIMIZED: return [3 /*break*/, 4];
                            case ModelSelectionStrategy.PERFORMANCE: return [3 /*break*/, 6];
                            case ModelSelectionStrategy.LOAD_BALANCE: return [3 /*break*/, 7];
                            case ModelSelectionStrategy.FALLBACK: return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 10];
                    case 2:
                        (_c = this.selectByDefault(availableModels, options), selectedModel = _c.model, reason = _c.reason);
                        return [3 /*break*/, 11];
                    case 3:
                        (_d = this.selectByPriority(availableModels), selectedModel = _d.model, reason = _d.reason);
                        return [3 /*break*/, 11];
                    case 4: return [4 /*yield*/, this.selectByCost(availableModels, options)];
                    case 5:
                        (_e = _k.sent(), selectedModel = _e.model, reason = _e.reason);
                        return [3 /*break*/, 11];
                    case 6:
                        (_f = this.selectByPerformance(availableModels), selectedModel = _f.model, reason = _f.reason);
                        return [3 /*break*/, 11];
                    case 7: return [4 /*yield*/, this.selectByLoadBalance(availableModels, options)];
                    case 8:
                        (_g = _k.sent(), selectedModel = _g.model, reason = _g.reason);
                        return [3 /*break*/, 11];
                    case 9:
                        (_h = this.selectWithFallback(availableModels, options), selectedModel = _h.model, reason = _h.reason);
                        return [3 /*break*/, 11];
                    case 10:
                        (_j = this.selectByDefault(availableModels, options), selectedModel = _j.model, reason = _j.reason);
                        _k.label = 11;
                    case 11:
                        alternatives = availableModels.filter(function (m) { return m.id !== selectedModel.id; }).slice(0, 3);
                        return [2 /*return*/, {
                                model: selectedModel,
                                reason: reason,
                                alternatives: alternatives
                            }];
                }
            });
        });
    };
    /**
     * 获取可用模型列表（使用缓存）
     * @param modelType 模型类型
     * @param options 选择选项
     * @returns 可用模型列表
     */
    ModelSelectorService.prototype.getAvailableModels = function (modelType, options) {
        return __awaiter(this, void 0, void 0, function () {
            var models;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, model_cache_service_1["default"].getModels(modelType)];
                    case 1:
                        models = _a.sent();
                        // 排除指定模型
                        if (options.excludeModels && options.excludeModels.length > 0) {
                            models = models.filter(function (model) { return !options.excludeModels.includes(model.name); });
                        }
                        // 过滤能力要求
                        if (options.requireCapabilities && options.requireCapabilities.length > 0) {
                            models = models.filter(function (model) {
                                if (!model.capabilities)
                                    return false;
                                var capabilities = Array.isArray(model.capabilities)
                                    ? model.capabilities
                                    : (typeof model.capabilities === 'string' ? JSON.parse(model.capabilities) : []);
                                return options.requireCapabilities.every(function (cap) { return capabilities.includes(cap); });
                            });
                        }
                        return [2 /*return*/, models];
                }
            });
        });
    };
    /**
     * 按默认策略选择模型
     * @param models 可用模型列表
     * @param options 选择选项
     * @returns 选择结果
     */
    ModelSelectorService.prototype.selectByDefault = function (models, options) {
        // 1. 优先使用用户指定的模型
        if (options.preferredModel) {
            var preferredModel = models.find(function (m) { return m.name === options.preferredModel; });
            if (preferredModel) {
                return {
                    model: preferredModel,
                    reason: "\u4F7F\u7528\u7528\u6237\u6307\u5B9A\u7684\u6A21\u578B: ".concat(options.preferredModel)
                };
            }
        }
        // 2. 使用默认模型
        var defaultModel = models.find(function (m) { return m.isDefault; });
        if (defaultModel) {
            return {
                model: defaultModel,
                reason: "\u4F7F\u7528\u7CFB\u7EDF\u9ED8\u8BA4\u6A21\u578B: ".concat(defaultModel.name)
            };
        }
        // 3. 使用第一个可用模型
        return {
            model: models[0],
            reason: "\u4F7F\u7528\u7B2C\u4E00\u4E2A\u53EF\u7528\u6A21\u578B: ".concat(models[0].name)
        };
    };
    /**
     * 按优先级选择模型
     * @param models 可用模型列表
     * @returns 选择结果
     */
    ModelSelectorService.prototype.selectByPriority = function (models) {
        // 按提供商优先级排序：OpenAI > Anthropic > Google > 其他
        var providerPriority = {
            'openai': 100,
            'anthropic': 90,
            'google': 80
        };
        var sortedModels = models.sort(function (a, b) {
            var priorityA = providerPriority[a.provider.toLowerCase()] || 0;
            var priorityB = providerPriority[b.provider.toLowerCase()] || 0;
            return priorityB - priorityA;
        });
        return {
            model: sortedModels[0],
            reason: "\u6309\u63D0\u4F9B\u5546\u4F18\u5148\u7EA7\u9009\u62E9: ".concat(sortedModels[0].provider, " - ").concat(sortedModels[0].name)
        };
    };
    /**
     * 按成本优化选择模型
     * @param models 可用模型列表
     * @param options 选择选项
     * @returns 选择结果
     */
    ModelSelectorService.prototype.selectByCost = function (models, options) {
        return __awaiter(this, void 0, void 0, function () {
            var costOptimizedModels;
            var _this = this;
            return __generator(this, function (_a) {
                costOptimizedModels = models.sort(function (a, b) {
                    var versionA = _this.extractVersion(a.name);
                    var versionB = _this.extractVersion(b.name);
                    return versionA - versionB;
                });
                return [2 /*return*/, {
                        model: costOptimizedModels[0],
                        reason: "\u6210\u672C\u4F18\u5316\u9009\u62E9: ".concat(costOptimizedModels[0].name)
                    }];
            });
        });
    };
    /**
     * 按性能选择模型
     * @param models 可用模型列表
     * @returns 选择结果
     */
    ModelSelectorService.prototype.selectByPerformance = function (models) {
        var _this = this;
        // 按模型名称中的版本号选择（假设数字越大性能越好）
        var performanceModels = models.sort(function (a, b) {
            var versionA = _this.extractVersion(a.name);
            var versionB = _this.extractVersion(b.name);
            return versionB - versionA;
        });
        return {
            model: performanceModels[0],
            reason: "\u6027\u80FD\u4F18\u5148\u9009\u62E9: ".concat(performanceModels[0].name)
        };
    };
    /**
     * 按负载均衡选择模型
     * @param models 可用模型列表
     * @param options 选择选项
     * @returns 选择结果
     */
    ModelSelectorService.prototype.selectByLoadBalance = function (models, options) {
        return __awaiter(this, void 0, void 0, function () {
            var timestamp, index;
            return __generator(this, function (_a) {
                timestamp = Date.now();
                index = timestamp % models.length;
                return [2 /*return*/, {
                        model: models[index],
                        reason: "\u8D1F\u8F7D\u5747\u8861\u9009\u62E9: ".concat(models[index].name)
                    }];
            });
        });
    };
    /**
     * 故障转移选择模型
     * @param models 可用模型列表
     * @param options 选择选项
     * @returns 选择结果
     */
    ModelSelectorService.prototype.selectWithFallback = function (models, options) {
        // 优先选择不同提供商的模型以提高可用性
        var providers = __spreadArray([], new Set(models.map(function (m) { return m.provider; })), true);
        if (providers.length > 1) {
            // 选择第二个提供商的模型作为备选
            var fallbackProvider_1 = providers[1];
            var fallbackModel = models.find(function (m) { return m.provider === fallbackProvider_1; });
            if (fallbackModel) {
                return {
                    model: fallbackModel,
                    reason: "\u6545\u969C\u8F6C\u79FB\u9009\u62E9: ".concat(fallbackModel.provider, " - ").concat(fallbackModel.name)
                };
            }
        }
        return this.selectByDefault(models, options);
    };
    /**
     * 从模型名称中提取版本号
     * @param modelName 模型名称
     * @returns 版本号
     */
    ModelSelectorService.prototype.extractVersion = function (modelName) {
        var versionMatch = modelName.match(/(\d+(?:\.\d+)?)/);
        return versionMatch ? parseFloat(versionMatch[1]) : 0;
    };
    /**
     * 获取指定类型的默认模型
     * @param modelType 模型类型
     * @returns 默认模型
     */
    ModelSelectorService.prototype.getDefaultModel = function (modelType) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.selectModel({
                            modelType: modelType,
                            strategy: ModelSelectionStrategy.DEFAULT
                        })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.model];
                }
            });
        });
    };
    /**
     * 设置默认模型
     * @param modelType 模型类型
     * @param modelName 模型名称
     * @returns 是否成功
     */
    ModelSelectorService.prototype.setDefaultModel = function (modelType, modelName) {
        return __awaiter(this, void 0, void 0, function () {
            var affectedRows, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // 清除同类型的所有默认标记
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.update({ isDefault: false }, {
                                where: {
                                    modelType: modelType,
                                    status: 'active'
                                }
                            })];
                    case 1:
                        // 清除同类型的所有默认标记
                        _a.sent();
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.update({ isDefault: true }, {
                                where: {
                                    name: modelName,
                                    modelType: modelType,
                                    status: 'active'
                                }
                            })];
                    case 2:
                        affectedRows = (_a.sent())[0];
                        return [2 /*return*/, affectedRows > 0];
                    case 3:
                        error_1 = _a.sent();
                        console.error('设置默认模型失败:', error_1);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取模型使用统计
     * @param modelType 模型类型
     * @param days 统计天数
     * @returns 使用统计
     */
    ModelSelectorService.prototype.getModelUsageStats = function (modelType, days) {
        if (days === void 0) { days = 7; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 这里可以集成使用统计逻辑
                // 返回模型使用频率、成功率等信息
                return [2 /*return*/, []];
            });
        });
    };
    return ModelSelectorService;
}());
exports["default"] = new ModelSelectorService();
