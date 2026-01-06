"use strict";
/**
 * AI模型计费服务实现
 * 遵循项目规范，类型定义在本文件内，不从外部导入
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
// 导入所需的依赖
var ai_model_billing_model_1 = require("../../models/ai-model-billing.model");
var ai_model_config_model_1 = require("../../models/ai-model-config.model");
var init_1 = require("../../init");
var ai_model_usage_model_1 = require("../../models/ai-model-usage.model");
var user_model_1 = require("../../models/user.model"); // 引入User模型
var sequelize_1 = require("sequelize");
var uuid_1 = require("uuid");
/**
 * AI模型计费服务类
 * 实现AI模型计费规则管理和费用计算功能
 */
var AIModelBillingService = /** @class */ (function () {
    function AIModelBillingService() {
    }
    /**
     * 获取模型当前有效的计费规则
     * @param modelId 模型ID
     * @returns 计费规则详情
     */
    AIModelBillingService.prototype.getCurrentBillingRule = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var billingRule, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ai_model_billing_model_1.AIModelBilling.findOne({
                                where: {
                                    modelId: modelId,
                                    isActive: true
                                },
                                include: [
                                    {
                                        model: ai_model_config_model_1.AIModelConfig,
                                        attributes: ['name', 'provider']
                                    }
                                ],
                                order: [['createdAt', 'DESC']]
                            })];
                    case 1:
                        billingRule = _a.sent();
                        if (!billingRule) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, {
                                id: billingRule.id,
                                modelId: billingRule.modelId,
                                modelName: billingRule.AIModelConfig ? billingRule.AIModelConfig.name : 'Unknown',
                                provider: billingRule.AIModelConfig ? billingRule.AIModelConfig.provider : 'Unknown',
                                billingType: billingRule.billingType,
                                inputTokenPrice: billingRule.inputTokenPrice,
                                outputTokenPrice: billingRule.outputTokenPrice,
                                callPrice: billingRule.callPrice,
                                isActive: billingRule.isActive,
                                discountTiers: billingRule.discountTiers,
                                billingCycle: billingRule.billingCycle,
                                balanceAlertThreshold: billingRule.balanceAlertThreshold,
                                tenantId: billingRule.tenantId,
                                createdAt: billingRule.createdAt,
                                updatedAt: billingRule.updatedAt
                            }];
                    case 2:
                        error_1 = _a.sent();
                        console.error('获取模型计费规则失败:', error_1);
                        throw new Error("\u83B7\u53D6\u6A21\u578B\u8BA1\u8D39\u89C4\u5219\u5931\u8D25: ".concat(error_1.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取模型的所有计费规则
     * @param modelId 模型ID
     * @param activeOnly 是否只返回激活的规则
     * @returns 计费规则列表
     */
    AIModelBillingService.prototype.getBillingRulesForModel = function (modelId, activeOnly) {
        if (activeOnly === void 0) { activeOnly = false; }
        return __awaiter(this, void 0, void 0, function () {
            var sql, replacements, results, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("\u83B7\u53D6\u6A21\u578B ".concat(modelId, " \u7684\u8BA1\u8D39\u89C4\u5219\uFF0CactiveOnly: ").concat(activeOnly));
                        sql = "\n        SELECT \n          amb.id,\n          amb.model_id as modelId,\n          amb.billing_type as billingType,\n          amb.input_token_price as inputTokenPrice,\n          amb.output_token_price as outputTokenPrice,\n          amb.call_price as callPrice,\n          amb.discount_tiers as discountTiers,\n          amb.billing_cycle as billingCycle,\n          amb.balance_alert_threshold as balanceAlertThreshold,\n          amb.tenant_id as tenantId,\n          amb.is_active as isActive,\n          amb.created_at as createdAt,\n          amb.updated_at as updatedAt,\n          amc.name as modelName,\n          amc.provider\n        FROM ai_model_billing amb\n        LEFT JOIN ai_model_config amc ON amb.model_id = amc.id\n        WHERE amb.model_id = ?\n      ";
                        replacements = [modelId];
                        if (activeOnly) {
                            sql += ' AND amb.is_active = 1';
                        }
                        sql += ' ORDER BY amb.created_at DESC';
                        console.log('执行SQL查询:', sql);
                        console.log('查询参数:', replacements);
                        return [4 /*yield*/, init_1.sequelize.query(sql, {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        results = (_a.sent())[0];
                        console.log("\u67E5\u8BE2\u7ED3\u679C\u6570\u91CF: ".concat(results.length));
                        if (!results || results.length === 0) {
                            console.log("\u6A21\u578B ".concat(modelId, " \u6CA1\u6709\u627E\u5230\u8BA1\u8D39\u89C4\u5219"));
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/, results.map(function (row) { return ({
                                id: row.id || 0,
                                modelId: row.modelId || modelId,
                                modelName: row.modelName || 'Unknown',
                                provider: row.provider || 'Unknown',
                                billingType: row.billingType || ai_model_billing_model_1.BillingType.TOKEN_BASED,
                                inputTokenPrice: parseFloat(row.inputTokenPrice) || 0,
                                outputTokenPrice: parseFloat(row.outputTokenPrice) || 0,
                                callPrice: parseFloat(row.callPrice) || 0,
                                isActive: Boolean(row.isActive),
                                discountTiers: row.discountTiers || null,
                                billingCycle: row.billingCycle || ai_model_billing_model_1.BillingCycle.MONTHLY,
                                balanceAlertThreshold: row.balanceAlertThreshold ? parseFloat(row.balanceAlertThreshold) : null,
                                tenantId: row.tenantId || null,
                                createdAt: new Date(row.createdAt),
                                updatedAt: new Date(row.updatedAt)
                            }); })];
                    case 2:
                        error_2 = _a.sent();
                        console.error('获取模型计费规则列表失败:', error_2);
                        throw new Error("\u83B7\u53D6\u6A21\u578B\u8BA1\u8D39\u89C4\u5219\u5217\u8868\u5931\u8D25: ".concat(error_2.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建新的计费规则
     * @param params 计费规则参数
     * @returns 创建的计费规则ID
     */
    AIModelBillingService.prototype.createBillingRule = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var model, billingRule, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findByPk(params.modelId)];
                    case 1:
                        model = _a.sent();
                        if (!model) {
                            throw new Error("\u6A21\u578B\u4E0D\u5B58\u5728: ID ".concat(params.modelId));
                        }
                        return [4 /*yield*/, ai_model_billing_model_1.AIModelBilling.create({
                                modelId: params.modelId,
                                billingType: params.billingType,
                                inputTokenPrice: params.inputTokenPrice,
                                outputTokenPrice: params.outputTokenPrice,
                                callPrice: params.callPrice || 0,
                                isActive: params.isActive === undefined ? true : params.isActive,
                                discountTiers: params.discountTiers,
                                billingCycle: params.billingCycle || ai_model_billing_model_1.BillingCycle.MONTHLY,
                                balanceAlertThreshold: params.balanceAlertThreshold,
                                tenantId: params.tenantId
                            })];
                    case 2:
                        billingRule = _a.sent();
                        return [2 /*return*/, billingRule.id];
                    case 3:
                        error_3 = _a.sent();
                        console.error('创建计费规则失败:', error_3);
                        throw new Error("\u521B\u5EFA\u8BA1\u8D39\u89C4\u5219\u5931\u8D25: ".concat(error_3.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新计费规则
     * @param ruleId 规则ID
     * @param params 更新参数
     * @returns 是否成功
     */
    AIModelBillingService.prototype.updateBillingRule = function (ruleId, params) {
        return __awaiter(this, void 0, void 0, function () {
            var billingRule, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, ai_model_billing_model_1.AIModelBilling.findByPk(ruleId)];
                    case 1:
                        billingRule = _a.sent();
                        if (!billingRule) {
                            return [2 /*return*/, false];
                        }
                        // 更新计费规则属性
                        if (params.inputTokenPrice !== undefined) {
                            billingRule.inputTokenPrice = params.inputTokenPrice;
                        }
                        if (params.outputTokenPrice !== undefined) {
                            billingRule.outputTokenPrice = params.outputTokenPrice;
                        }
                        if (params.callPrice !== undefined) {
                            billingRule.callPrice = params.callPrice;
                        }
                        if (params.isActive !== undefined) {
                            billingRule.isActive = params.isActive;
                        }
                        if (params.discountTiers !== undefined) {
                            billingRule.discountTiers = params.discountTiers;
                        }
                        if (params.billingCycle !== undefined) {
                            billingRule.billingCycle = params.billingCycle;
                        }
                        if (params.balanceAlertThreshold !== undefined) {
                            billingRule.balanceAlertThreshold = params.balanceAlertThreshold;
                        }
                        if (params.tenantId !== undefined) {
                            billingRule.tenantId = params.tenantId;
                        }
                        // 保存更新
                        return [4 /*yield*/, billingRule.save()];
                    case 2:
                        // 保存更新
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_4 = _a.sent();
                        console.error('更新计费规则失败:', error_4);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 激活或停用计费规则
     * @param ruleId 规则ID
     * @param isActive 是否激活
     * @returns 是否成功
     */
    AIModelBillingService.prototype.setBillingRuleActiveStatus = function (ruleId, isActive) {
        return __awaiter(this, void 0, void 0, function () {
            var billingRule, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, ai_model_billing_model_1.AIModelBilling.findByPk(ruleId)];
                    case 1:
                        billingRule = _a.sent();
                        if (!billingRule) {
                            return [2 /*return*/, false];
                        }
                        billingRule.isActive = isActive;
                        return [4 /*yield*/, billingRule.save()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_5 = _a.sent();
                        console.error('更新计费规则状态失败:', error_5);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除计费规则
     * @param ruleId 规则ID
     * @returns 是否成功
     */
    AIModelBillingService.prototype.deleteBillingRule = function (ruleId) {
        return __awaiter(this, void 0, void 0, function () {
            var billingRule, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, ai_model_billing_model_1.AIModelBilling.findByPk(ruleId)];
                    case 1:
                        billingRule = _a.sent();
                        if (!billingRule) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, billingRule.destroy()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_6 = _a.sent();
                        console.error('删除计费规则失败:', error_6);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 计算使用成本
     * @param modelId 模型ID
     * @param inputTokens 输入令牌数
     * @param outputTokens 输出令牌数
     * @returns 成本计算结果
     */
    AIModelBillingService.prototype.calculateCost = function (modelId, inputTokens, outputTokens) {
        return __awaiter(this, void 0, void 0, function () {
            var billingRule, DEFAULT_INPUT_PRICE, DEFAULT_OUTPUT_PRICE, inputCost_1, outputCost_1, inputCost, outputCost, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getCurrentBillingRule(modelId)];
                    case 1:
                        billingRule = _a.sent();
                        if (!billingRule) {
                            DEFAULT_INPUT_PRICE = 0.0000005;
                            DEFAULT_OUTPUT_PRICE = 0.0000015;
                            inputCost_1 = inputTokens * DEFAULT_INPUT_PRICE;
                            outputCost_1 = outputTokens * DEFAULT_OUTPUT_PRICE;
                            return [2 /*return*/, {
                                    inputCost: inputCost_1,
                                    outputCost: outputCost_1,
                                    totalCost: inputCost_1 + outputCost_1,
                                    currencyCode: 'USD'
                                }];
                        }
                        inputCost = inputTokens * billingRule.inputTokenPrice;
                        outputCost = outputTokens * billingRule.outputTokenPrice;
                        return [2 /*return*/, {
                                inputCost: inputCost,
                                outputCost: outputCost,
                                totalCost: inputCost + outputCost,
                                currencyCode: 'USD'
                            }];
                    case 2:
                        error_7 = _a.sent();
                        console.error('计算成本失败:', error_7);
                        throw new Error("\u8BA1\u7B97\u6210\u672C\u5931\u8D25: ".concat(error_7.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 计算调用成本
     * @param modelId 模型ID
     * @param callCount 调用次数
     * @returns 成本计算结果
     */
    AIModelBillingService.prototype.calculateCallCost = function (modelId, callCount) {
        return __awaiter(this, void 0, void 0, function () {
            var billingRule, DEFAULT_CALL_PRICE, totalCost_1, totalCost, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getCurrentBillingRule(modelId)];
                    case 1:
                        billingRule = _a.sent();
                        if (!billingRule) {
                            DEFAULT_CALL_PRICE = 0.01;
                            totalCost_1 = callCount * DEFAULT_CALL_PRICE;
                            return [2 /*return*/, {
                                    inputCost: 0,
                                    outputCost: totalCost_1,
                                    totalCost: totalCost_1,
                                    currencyCode: 'USD'
                                }];
                        }
                        totalCost = callCount * billingRule.callPrice;
                        return [2 /*return*/, {
                                inputCost: 0,
                                outputCost: totalCost,
                                totalCost: totalCost,
                                currencyCode: 'USD'
                            }];
                    case 2:
                        error_8 = _a.sent();
                        console.error('计算调用成本失败:', error_8);
                        throw new Error("\u8BA1\u7B97\u8C03\u7528\u6210\u672C\u5931\u8D25: ".concat(error_8.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户使用统计
     * @param userId 用户ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 使用统计结果
     */
    AIModelBillingService.prototype.getUserUsageStatistics = function (userId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var where, totalRequests, usage, successRateResult, successRate;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        where = {
                            userId: userId,
                            createdAt: (_a = {},
                                _a[sequelize_1.Op.between] = [startDate, endDate],
                                _a)
                        };
                        return [4 /*yield*/, ai_model_usage_model_1.AIModelUsage.count({ where: where })];
                    case 1:
                        totalRequests = _b.sent();
                        return [4 /*yield*/, ai_model_usage_model_1.AIModelUsage.findOne({
                                attributes: [
                                    [sequelize_1.Sequelize.fn('SUM', sequelize_1.Sequelize.col('inputTokens')), 'totalInputTokens'],
                                    [sequelize_1.Sequelize.fn('SUM', sequelize_1.Sequelize.col('outputTokens')), 'totalOutputTokens'],
                                    [sequelize_1.Sequelize.fn('SUM', sequelize_1.Sequelize.col('cost')), 'totalCost'],
                                    [sequelize_1.Sequelize.fn('AVG', sequelize_1.Sequelize.col('duration')), 'avgDuration'],
                                ],
                                where: where,
                                raw: true
                            })];
                    case 2:
                        usage = _b.sent();
                        return [4 /*yield*/, ai_model_usage_model_1.AIModelUsage.count({
                                where: __assign(__assign({}, where), { status: ai_model_usage_model_1.AIUsageStatus.SUCCESS })
                            })];
                    case 3:
                        successRateResult = _b.sent();
                        successRate = totalRequests > 0 ? (successRateResult / totalRequests) * 100 : 0;
                        return [2 /*return*/, {
                                totalRequests: totalRequests,
                                totalInputTokens: Number(usage === null || usage === void 0 ? void 0 : usage.totalInputTokens) || 0,
                                totalOutputTokens: Number(usage === null || usage === void 0 ? void 0 : usage.totalOutputTokens) || 0,
                                totalCost: Number(usage === null || usage === void 0 ? void 0 : usage.totalCost) || 0,
                                averageResponseTime: Number(usage === null || usage === void 0 ? void 0 : usage.avgDuration) || 0,
                                successRate: successRate,
                                costByDate: {},
                                usageByDate: {}
                            }];
                }
            });
        });
    };
    /**
     * 获取模型使用统计
     * @param modelId 模型ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 使用统计结果
     */
    AIModelBillingService.prototype.getModelUsageStatistics = function (modelId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var where, totalRequests, usage, successRateResult, successRate;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        where = {
                            modelId: modelId,
                            createdAt: (_a = {},
                                _a[sequelize_1.Op.between] = [startDate, endDate],
                                _a)
                        };
                        return [4 /*yield*/, ai_model_usage_model_1.AIModelUsage.count({ where: where })];
                    case 1:
                        totalRequests = _b.sent();
                        return [4 /*yield*/, ai_model_usage_model_1.AIModelUsage.findOne({
                                attributes: [
                                    [sequelize_1.Sequelize.fn('SUM', sequelize_1.Sequelize.col('inputTokens')), 'totalInputTokens'],
                                    [sequelize_1.Sequelize.fn('SUM', sequelize_1.Sequelize.col('outputTokens')), 'totalOutputTokens'],
                                    [sequelize_1.Sequelize.fn('SUM', sequelize_1.Sequelize.col('cost')), 'totalCost'],
                                    [sequelize_1.Sequelize.fn('AVG', sequelize_1.Sequelize.col('duration')), 'avgDuration'],
                                ],
                                where: where,
                                raw: true
                            })];
                    case 2:
                        usage = _b.sent();
                        return [4 /*yield*/, ai_model_usage_model_1.AIModelUsage.count({
                                where: __assign(__assign({}, where), { status: ai_model_usage_model_1.AIUsageStatus.SUCCESS })
                            })];
                    case 3:
                        successRateResult = _b.sent();
                        successRate = totalRequests > 0 ? (successRateResult / totalRequests) * 100 : 0;
                        return [2 /*return*/, {
                                totalRequests: totalRequests,
                                totalInputTokens: Number(usage === null || usage === void 0 ? void 0 : usage.totalInputTokens) || 0,
                                totalOutputTokens: Number(usage === null || usage === void 0 ? void 0 : usage.totalOutputTokens) || 0,
                                totalCost: Number(usage === null || usage === void 0 ? void 0 : usage.totalCost) || 0,
                                averageResponseTime: Number(usage === null || usage === void 0 ? void 0 : usage.avgDuration) || 0,
                                successRate: successRate,
                                costByDate: {},
                                usageByDate: {}
                            }];
                }
            });
        });
    };
    /**
     * 处理单次使用的支付和计费
     * @param userId 用户ID
     * @param usageId 使用记录ID
     * @returns 支付处理结果
     */
    AIModelBillingService.prototype.processPayment = function (userId, usageId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, user, usageRecord, cost, newBalance, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_model_billing_model_1.AIModelBilling.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 9]);
                        return [4 /*yield*/, user_model_1.User.findByPk(userId, { transaction: transaction, lock: true })];
                    case 3:
                        user = _a.sent();
                        if (!user) {
                            throw new Error("\u7528\u6237\u4E0D\u5B58\u5728: ID ".concat(userId));
                        }
                        return [4 /*yield*/, ai_model_usage_model_1.AIModelUsage.findByPk(usageId, { transaction: transaction })];
                    case 4:
                        usageRecord = _a.sent();
                        if (!usageRecord) {
                            throw new Error("\u4F7F\u7528\u8BB0\u5F55\u4E0D\u5B58\u5728: ID ".concat(usageId));
                        }
                        if (usageRecord.userId !== userId) {
                            throw new Error('使用记录与用户不匹配');
                        }
                        if (usageRecord.paymentStatus === ai_model_usage_model_1.PaymentStatus.PAID) {
                            throw new Error('该记录已支付');
                        }
                        cost = usageRecord.cost || 0;
                        newBalance = 1000 - cost;
                        // 不再更新用户balance字段
                        // await user.update({ balance: newBalance }, { transaction });
                        return [4 /*yield*/, usageRecord.update({ paymentStatus: ai_model_usage_model_1.PaymentStatus.PAID }, { transaction: transaction })];
                    case 5:
                        // 不再更新用户balance字段
                        // await user.update({ balance: newBalance }, { transaction });
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                transactionId: (0, uuid_1.v4)(),
                                newBalance: newBalance,
                                message: '支付成功'
                            }];
                    case 7:
                        error_9 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 8:
                        _a.sent();
                        throw new Error("\u652F\u4ED8\u5904\u7406\u5931\u8D25: ".concat(error_9.message));
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    return AIModelBillingService;
}());
// 导出服务实例
exports["default"] = new AIModelBillingService();
