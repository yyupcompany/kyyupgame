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
exports.ModelService = void 0;
var ai_model_config_model_1 = require("../../models/ai-model-config.model");
var ai_model_billing_model_1 = require("../../models/ai-model-billing.model");
var apiError_1 = require("../../utils/apiError");
/**
 * AI模型服务
 * 负责处理模型相关的业务逻辑
 */
var ModelService = /** @class */ (function () {
    function ModelService() {
    }
    /**
     * @description 获取所有AI模型配置，支持过滤
     * @param filters 过滤条件，如 modelType 和 status
     * @returns 模型配置数组
     */
    ModelService.prototype.getAllModels = function (filters) {
        if (filters === void 0) { filters = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var where, models;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        where = {};
                        if (filters.modelType) {
                            where.modelType = filters.modelType;
                        }
                        if (filters.status) {
                            where.status = filters.status;
                        }
                        else {
                            // 默认只返回活跃的模型
                            where.status = ai_model_config_model_1.ModelStatus.ACTIVE;
                        }
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findAll({
                                where: where,
                                order: [['isDefault', 'DESC'], ['displayName', 'ASC']],
                                attributes: { exclude: ['apiKey'] } // 永远不要在API中返回apiKey
                            })];
                    case 1:
                        models = _a.sent();
                        return [2 /*return*/, models];
                }
            });
        });
    };
    /**
     * @description 获取默认AI模型配置
     * @returns 默认模型配置，如果没有设置默认模型则返回第一个活跃模型
     * @throws ApiError 如果没有任何可用模型
     */
    ModelService.prototype.getDefaultModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var defaultModel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                            where: {
                                isDefault: true,
                                status: ai_model_config_model_1.ModelStatus.ACTIVE
                            },
                            attributes: { exclude: ['apiKey'] }
                        })];
                    case 1:
                        defaultModel = _a.sent();
                        if (!!defaultModel) return [3 /*break*/, 3];
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    status: ai_model_config_model_1.ModelStatus.ACTIVE
                                },
                                order: [['displayName', 'ASC']],
                                attributes: { exclude: ['apiKey'] }
                            })];
                    case 2:
                        defaultModel = _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!defaultModel) {
                            throw apiError_1.ApiError.notFound('没有可用的AI模型');
                        }
                        return [2 /*return*/, defaultModel];
                }
            });
        });
    };
    /**
     * @description 获取指定模型的所有有效计费规则
     * @param modelId 模型ID
     * @returns 计费规则数组
     * @throws ApiError 如指定的模型不存在
     */
    ModelService.prototype.getModelBilling = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var modelExists, billingRules, latestRule;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findByPk(modelId)];
                    case 1:
                        modelExists = _a.sent();
                        if (!modelExists) {
                            throw apiError_1.ApiError.notFound('指定的模型不存在');
                        }
                        return [4 /*yield*/, ai_model_billing_model_1.AIModelBilling.findAll({
                                where: {
                                    modelId: modelId,
                                    isActive: true
                                },
                                order: [['createdAt', 'DESC']]
                            })];
                    case 2:
                        billingRules = _a.sent();
                        // 如果没有计费规则，返回默认的计费信息
                        if (!billingRules || billingRules.length === 0) {
                            return [2 /*return*/, {
                                    callCount: 0,
                                    totalTokens: 0,
                                    inputTokens: 0,
                                    outputTokens: 0,
                                    totalCost: 0,
                                    inputTokenPrice: 0,
                                    outputTokenPrice: 0,
                                    pricePerMillionTokens: 0,
                                    currency: 'USD',
                                    hasCustomPricing: false
                                }];
                        }
                        latestRule = billingRules[0];
                        // 这里可以添加实际的使用统计查询
                        // 目前返回模拟数据，实际部署时需要从使用记录表中查询
                        return [2 /*return*/, {
                                callCount: 0,
                                totalTokens: 0,
                                inputTokens: 0,
                                outputTokens: 0,
                                totalCost: 0,
                                inputTokenPrice: latestRule.inputTokenPrice || 0,
                                outputTokenPrice: latestRule.outputTokenPrice || 0,
                                pricePerMillionTokens: (latestRule.inputTokenPrice || 0) * 1000000,
                                currency: 'USD',
                                hasCustomPricing: true,
                                billingRule: latestRule
                            }];
                }
            });
        });
    };
    return ModelService;
}());
exports.ModelService = ModelService;
// 导出服务实例
exports["default"] = new ModelService();
