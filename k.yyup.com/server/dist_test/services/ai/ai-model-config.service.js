"use strict";
/**
 * AI模型配置服务实现
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
var ai_model_config_model_1 = require("../../models/ai-model-config.model");
var custom_errors_1 = require("../../utils/custom-errors");
/**
 * AI模型配置服务类
 * 实现AI模型配置的管理功能
 */
var AIModelConfigService = /** @class */ (function () {
    function AIModelConfigService() {
    }
    /**
     * 获取所有模型配置
     * @param activeOnly 是否只返回激活的模型
     * @returns 模型配置列表
     */
    AIModelConfigService.prototype.getAllModels = function (activeOnly) {
        if (activeOnly === void 0) { activeOnly = false; }
        return __awaiter(this, void 0, void 0, function () {
            var whereClause, models, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        whereClause = activeOnly ? { status: ai_model_config_model_1.ModelStatus.ACTIVE } : {};
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findAll({
                                where: whereClause,
                                order: [['provider', 'ASC'], ['name', 'ASC']]
                            })];
                    case 1:
                        models = _a.sent();
                        return [2 /*return*/, models.map(function (model) {
                                var _a, _b;
                                return ({
                                    id: model.id,
                                    modelName: model.name,
                                    displayName: model.displayName,
                                    provider: model.provider,
                                    version: model.apiVersion,
                                    capabilities: [model.modelType],
                                    contextWindow: ((_a = model.modelParameters) === null || _a === void 0 ? void 0 : _a.maxTokens) || 4096,
                                    maxTokens: ((_b = model.modelParameters) === null || _b === void 0 ? void 0 : _b.maxTokens) || 2048,
                                    isActive: model.status === ai_model_config_model_1.ModelStatus.ACTIVE,
                                    isDefault: model.isDefault,
                                    apiEndpoint: model.endpointUrl,
                                    apiKey: model.apiKey,
                                    createdAt: model.createdAt,
                                    updatedAt: model.updatedAt
                                });
                            })];
                    case 2:
                        error_1 = _a.sent();
                        console.error('获取模型配置列表失败:', error_1);
                        throw new Error("\u83B7\u53D6\u6A21\u578B\u914D\u7F6E\u5217\u8868\u5931\u8D25: ".concat(error_1.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 根据ID获取模型配置
     * @param modelId 模型ID
     * @returns 模型配置详情
     */
    AIModelConfigService.prototype.getModelById = function (modelId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var model, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findByPk(modelId)];
                    case 1:
                        model = _c.sent();
                        if (!model) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, {
                                id: model.id,
                                modelName: model.name,
                                displayName: model.displayName,
                                provider: model.provider,
                                version: model.apiVersion,
                                capabilities: [model.modelType],
                                contextWindow: ((_a = model.modelParameters) === null || _a === void 0 ? void 0 : _a.maxTokens) || 4096,
                                maxTokens: ((_b = model.modelParameters) === null || _b === void 0 ? void 0 : _b.maxTokens) || 2048,
                                isActive: model.status === ai_model_config_model_1.ModelStatus.ACTIVE,
                                isDefault: model.isDefault,
                                apiEndpoint: model.endpointUrl,
                                apiKey: model.apiKey,
                                createdAt: model.createdAt,
                                updatedAt: model.updatedAt
                            }];
                    case 2:
                        error_2 = _c.sent();
                        console.error('获取模型配置详情失败:', error_2);
                        throw new Error("\u83B7\u53D6\u6A21\u578B\u914D\u7F6E\u8BE6\u60C5\u5931\u8D25: ".concat(error_2.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 根据名称和提供商获取模型配置
     * @param modelName 模型名称
     * @param provider 提供商
     * @returns 模型配置详情
     */
    AIModelConfigService.prototype.getModelByNameAndProvider = function (modelName, provider) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var whereClause, model, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        whereClause = {
                            name: modelName,
                            provider: provider
                        };
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: whereClause
                            })];
                    case 1:
                        model = _c.sent();
                        if (!model) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, {
                                id: model.id,
                                modelName: model.name,
                                displayName: model.displayName,
                                provider: model.provider,
                                version: model.apiVersion,
                                capabilities: [model.modelType],
                                contextWindow: ((_a = model.modelParameters) === null || _a === void 0 ? void 0 : _a.maxTokens) || 4096,
                                maxTokens: ((_b = model.modelParameters) === null || _b === void 0 ? void 0 : _b.maxTokens) || 2048,
                                isActive: model.status === ai_model_config_model_1.ModelStatus.ACTIVE,
                                isDefault: model.isDefault,
                                apiEndpoint: model.endpointUrl,
                                apiKey: model.apiKey,
                                createdAt: model.createdAt,
                                updatedAt: model.updatedAt
                            }];
                    case 2:
                        error_3 = _c.sent();
                        console.error('获取模型配置详情失败:', error_3);
                        throw new Error("\u83B7\u53D6\u6A21\u578B\u914D\u7F6E\u8BE6\u60C5\u5931\u8D25: ".concat(error_3.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 根据能力获取模型配置
     * @param capability 能力名称
     * @param activeOnly 是否只返回激活的模型
     * @returns 模型配置列表
     */
    AIModelConfigService.prototype.getModelsByCapability = function (capability, activeOnly) {
        if (activeOnly === void 0) { activeOnly = true; }
        return __awaiter(this, void 0, void 0, function () {
            var whereClause, models, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        whereClause = {
                            modelType: capability
                        };
                        if (activeOnly) {
                            whereClause.status = ai_model_config_model_1.ModelStatus.ACTIVE;
                        }
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findAll({
                                where: whereClause,
                                order: [['provider', 'ASC'], ['name', 'ASC']]
                            })];
                    case 1:
                        models = _a.sent();
                        return [2 /*return*/, models.map(function (model) {
                                var _a, _b;
                                return ({
                                    id: model.id,
                                    modelName: model.name,
                                    displayName: model.displayName,
                                    provider: model.provider,
                                    version: model.apiVersion,
                                    capabilities: [model.modelType],
                                    contextWindow: ((_a = model.modelParameters) === null || _a === void 0 ? void 0 : _a.maxTokens) || 4096,
                                    maxTokens: ((_b = model.modelParameters) === null || _b === void 0 ? void 0 : _b.maxTokens) || 2048,
                                    isActive: model.status === ai_model_config_model_1.ModelStatus.ACTIVE,
                                    isDefault: model.isDefault,
                                    apiEndpoint: model.endpointUrl,
                                    apiKey: model.apiKey,
                                    createdAt: model.createdAt,
                                    updatedAt: model.updatedAt
                                });
                            })];
                    case 2:
                        error_4 = _a.sent();
                        console.error('获取模型配置列表失败:', error_4);
                        throw new Error("\u83B7\u53D6\u6A21\u578B\u914D\u7F6E\u5217\u8868\u5931\u8D25: ".concat(error_4.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建新的模型配置
     * @param params 模型配置参数
     * @returns 创建的模型配置ID
     */
    AIModelConfigService.prototype.createModel = function (params) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var modelName, displayName, existingModel, modelType, newModel, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        console.log('[服务层] 收到创建模型参数:', params);
                        modelName = params.name || params.modelName;
                        if (!modelName) {
                            throw new custom_errors_1.ValidationError('模型名称不能为空');
                        }
                        displayName = params.displayName || modelName;
                        // 确保provider有值
                        if (!params.provider) {
                            throw new custom_errors_1.ValidationError('提供商不能为空');
                        }
                        // 确保apiEndpoint有值
                        if (!params.apiEndpoint) {
                            throw new custom_errors_1.ValidationError('API端点不能为空');
                        }
                        console.log('[服务层] 处理后的字段:', {
                            name: modelName,
                            displayName: displayName,
                            provider: params.provider,
                            apiEndpoint: params.apiEndpoint
                        });
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    name: modelName,
                                    provider: params.provider
                                }
                            })];
                    case 1:
                        existingModel = _b.sent();
                        if (existingModel) {
                            throw new custom_errors_1.ResourceExistsError("\u6A21\u578B\u5DF2\u5B58\u5728: ".concat(params.provider, "/").concat(modelName));
                        }
                        modelType = params.modelType || (params.capabilities && params.capabilities[0]) || 'text';
                        console.log('[服务层] 开始创建模型...');
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.create({
                                name: modelName,
                                displayName: displayName,
                                provider: params.provider,
                                modelType: modelType,
                                apiVersion: params.version || 'v1',
                                endpointUrl: params.apiEndpoint,
                                apiKey: params.apiKey || 'default-key',
                                modelParameters: {
                                    maxTokens: params.maxTokens || 2048,
                                    contextWindow: params.contextWindow || 4096
                                },
                                status: params.isActive ? ai_model_config_model_1.ModelStatus.ACTIVE : ai_model_config_model_1.ModelStatus.INACTIVE,
                                isDefault: (_a = params.isDefault) !== null && _a !== void 0 ? _a : false
                            })];
                    case 2:
                        newModel = _b.sent();
                        console.log('[服务层] 模型创建成功，ID:', newModel.id);
                        return [2 /*return*/, newModel.id];
                    case 3:
                        error_5 = _b.sent();
                        console.error('[服务层] 创建模型配置失败:', error_5);
                        // 如果是业务错误，直接重新抛出
                        if (error_5 instanceof custom_errors_1.ResourceExistsError || error_5 instanceof custom_errors_1.ValidationError) {
                            throw error_5;
                        }
                        // 其他错误作为系统错误处理
                        throw new Error("\u521B\u5EFA\u6A21\u578B\u914D\u7F6E\u5931\u8D25: ".concat(error_5.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新模型配置
     * @param modelId 模型ID
     * @param params 更新参数
     * @returns 是否成功
     */
    AIModelConfigService.prototype.updateModel = function (modelId, params) {
        return __awaiter(this, void 0, void 0, function () {
            var model, modelParams, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findByPk(modelId)];
                    case 1:
                        model = _a.sent();
                        if (!model) {
                            return [2 /*return*/, false];
                        }
                        // 更新模型属性
                        if (params.modelName) {
                            model.name = params.modelName;
                        }
                        if (params.displayName) {
                            model.displayName = params.displayName;
                        }
                        if (params.provider) {
                            model.provider = params.provider;
                        }
                        if (params.version !== undefined) {
                            model.apiVersion = params.version;
                        }
                        if (params.capabilities !== undefined && params.capabilities.length > 0) {
                            model.modelType = params.capabilities[0];
                        }
                        modelParams = __assign({}, (model.modelParameters || {}));
                        if (params.contextWindow !== undefined) {
                            modelParams.contextWindow = params.contextWindow;
                        }
                        if (params.maxTokens !== undefined) {
                            modelParams.maxTokens = params.maxTokens;
                        }
                        // 支持更新完整的modelParameters
                        if (params.modelParameters !== undefined) {
                            Object.assign(modelParams, params.modelParameters);
                        }
                        model.modelParameters = modelParams;
                        if (params.isActive !== undefined) {
                            model.status = params.isActive ? ai_model_config_model_1.ModelStatus.ACTIVE : ai_model_config_model_1.ModelStatus.INACTIVE;
                        }
                        if (params.isDefault !== undefined) {
                            model.isDefault = params.isDefault;
                        }
                        if (params.apiEndpoint !== undefined) {
                            model.endpointUrl = params.apiEndpoint;
                        }
                        if (params.apiKey !== undefined) {
                            model.apiKey = params.apiKey;
                        }
                        // 保存更新
                        return [4 /*yield*/, model.save()];
                    case 2:
                        // 保存更新
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_6 = _a.sent();
                        console.error('更新模型配置失败:', error_6);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 激活或停用模型
     * @param modelId 模型ID
     * @param isActive 是否激活
     * @returns 是否成功
     */
    AIModelConfigService.prototype.setModelActiveStatus = function (modelId, isActive) {
        return __awaiter(this, void 0, void 0, function () {
            var model, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findByPk(modelId)];
                    case 1:
                        model = _a.sent();
                        if (!model) {
                            return [2 /*return*/, false];
                        }
                        model.status = isActive ? ai_model_config_model_1.ModelStatus.ACTIVE : ai_model_config_model_1.ModelStatus.INACTIVE;
                        return [4 /*yield*/, model.save()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_7 = _a.sent();
                        console.error('更新模型状态失败:', error_7);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除模型配置
     * @param modelId 模型ID
     * @returns 是否成功
     */
    AIModelConfigService.prototype.deleteModel = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var model, sequelize, billingResult, usageResult, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        console.log("[\u5220\u9664\u6A21\u578B] \u5F00\u59CB\u5220\u9664\u6A21\u578B ID: ".concat(modelId));
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findByPk(modelId)];
                    case 1:
                        model = _a.sent();
                        if (!model) {
                            console.log("[\u5220\u9664\u6A21\u578B] \u6A21\u578B ID ".concat(modelId, " \u4E0D\u5B58\u5728"));
                            return [2 /*return*/, false];
                        }
                        console.log("[\u5220\u9664\u6A21\u578B] \u627E\u5230\u6A21\u578B: ".concat(model.name));
                        sequelize = ai_model_config_model_1.AIModelConfig.sequelize;
                        console.log("[\u5220\u9664\u6A21\u578B] \u5F00\u59CB\u5220\u9664\u8BA1\u8D39\u8BB0\u5F55...");
                        return [4 /*yield*/, sequelize.query('DELETE FROM ai_model_billing WHERE model_id = ?', { replacements: [modelId] })];
                    case 2:
                        billingResult = _a.sent();
                        console.log("[\u5220\u9664\u6A21\u578B] \u5220\u9664\u8BA1\u8D39\u8BB0\u5F55\u7ED3\u679C:", billingResult);
                        console.log("[\u5220\u9664\u6A21\u578B] \u5F00\u59CB\u5220\u9664\u4F7F\u7528\u8BB0\u5F55...");
                        return [4 /*yield*/, sequelize.query('DELETE FROM ai_model_usage WHERE model_id = ?', { replacements: [modelId] })];
                    case 3:
                        usageResult = _a.sent();
                        console.log("[\u5220\u9664\u6A21\u578B] \u5220\u9664\u4F7F\u7528\u8BB0\u5F55\u7ED3\u679C:", usageResult);
                        console.log("[\u5220\u9664\u6A21\u578B] \u5F00\u59CB\u5220\u9664\u6A21\u578B\u914D\u7F6E...");
                        // 最后删除模型配置
                        return [4 /*yield*/, model.destroy()];
                    case 4:
                        // 最后删除模型配置
                        _a.sent();
                        console.log("[\u5220\u9664\u6A21\u578B] \u6A21\u578B\u5220\u9664\u6210\u529F");
                        return [2 /*return*/, true];
                    case 5:
                        error_8 = _a.sent();
                        console.error('删除模型配置失败:', error_8);
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取特定能力的默认模型配置
     * 兼容性说明：目前数据库的 ModelType ENUM 不包含 'search'。
     * 当 capability === 'search' 时，改为按名称或能力关键词查找，必要时从环境变量兜底返回。
     * @param capability 能力名称
     * @returns 默认模型配置或null
     */
    AIModelConfigService.prototype.getDefaultModel = function (capability) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var model_1, sequelize, rows, model, error_9;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 9, , 10]);
                        if (!(capability === 'search')) return [3 /*break*/, 7];
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    modelType: 'search',
                                    status: ai_model_config_model_1.ModelStatus.ACTIVE,
                                    isDefault: true
                                }
                            })];
                    case 1:
                        model_1 = _e.sent();
                        if (!!model_1) return [3 /*break*/, 3];
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: { name: 'volcano-fusion-search', status: ai_model_config_model_1.ModelStatus.ACTIVE }
                            })];
                    case 2:
                        model_1 = _e.sent();
                        _e.label = 3;
                    case 3:
                        if (!!model_1) return [3 /*break*/, 6];
                        sequelize = ai_model_config_model_1.AIModelConfig.sequelize;
                        return [4 /*yield*/, sequelize.query("SELECT * FROM ai_model_config WHERE status='active' AND (name LIKE '%search%' OR display_name LIKE '%搜索%' OR description LIKE '%搜索%') LIMIT 1")];
                    case 4:
                        rows = (_e.sent())[0];
                        if (!(Array.isArray(rows) && rows.length > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findByPk(rows[0].id)];
                    case 5:
                        // 重新按主键加载，确保模型实例化
                        model_1 = _e.sent();
                        _e.label = 6;
                    case 6:
                        // 4) 环境变量兜底（不依赖数据库）
                        if (!model_1 && process.env.VOLCANO_API_KEY && process.env.VOLCANO_SEARCH_ENDPOINT) {
                            return [2 /*return*/, {
                                    id: 0,
                                    modelName: 'volcano-fusion-search',
                                    displayName: '火山引擎融合搜索(ENV)',
                                    provider: 'ByteDance',
                                    version: 'v1',
                                    capabilities: ['search'],
                                    contextWindow: 0,
                                    maxTokens: 0,
                                    isActive: true,
                                    isDefault: true,
                                    apiEndpoint: process.env.VOLCANO_SEARCH_ENDPOINT,
                                    apiKey: process.env.VOLCANO_API_KEY,
                                    createdAt: new Date(),
                                    updatedAt: new Date()
                                }];
                        }
                        if (!model_1) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, {
                                id: model_1.id,
                                modelName: model_1.name,
                                displayName: model_1.displayName,
                                provider: model_1.provider,
                                version: model_1.apiVersion,
                                capabilities: ['search'],
                                contextWindow: ((_a = model_1.modelParameters) === null || _a === void 0 ? void 0 : _a.maxTokens) || 4096,
                                maxTokens: ((_b = model_1.modelParameters) === null || _b === void 0 ? void 0 : _b.maxTokens) || 2048,
                                isActive: model_1.status === ai_model_config_model_1.ModelStatus.ACTIVE,
                                isDefault: !!model_1.isDefault,
                                apiEndpoint: model_1.endpointUrl,
                                apiKey: model_1.apiKey,
                                createdAt: model_1.createdAt,
                                updatedAt: model_1.updatedAt
                            }];
                    case 7: return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                            where: {
                                modelType: capability,
                                status: ai_model_config_model_1.ModelStatus.ACTIVE,
                                isDefault: true
                            }
                        })];
                    case 8:
                        model = _e.sent();
                        if (!model) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, {
                                id: model.id,
                                modelName: model.name,
                                displayName: model.displayName,
                                provider: model.provider,
                                version: model.apiVersion,
                                capabilities: [model.modelType],
                                contextWindow: ((_c = model.modelParameters) === null || _c === void 0 ? void 0 : _c.maxTokens) || 4096,
                                maxTokens: ((_d = model.modelParameters) === null || _d === void 0 ? void 0 : _d.maxTokens) || 2048,
                                isActive: model.status === ai_model_config_model_1.ModelStatus.ACTIVE,
                                isDefault: model.isDefault,
                                apiEndpoint: model.endpointUrl,
                                apiKey: model.apiKey,
                                createdAt: model.createdAt,
                                updatedAt: model.updatedAt
                            }];
                    case 9:
                        error_9 = _e.sent();
                        console.error('获取默认模型配置失败:', error_9);
                        throw new Error("\u83B7\u53D6\u9ED8\u8BA4\u6A21\u578B\u914D\u7F6E\u5931\u8D25: ".concat(error_9.message));
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 验证模型API密钥
     * @param modelId 模型ID
     * @returns 是否有效
     */
    AIModelConfigService.prototype.validateModelApiKey = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var model, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findByPk(modelId)];
                    case 1:
                        model = _a.sent();
                        if (!model || !model.apiKey) {
                            return [2 /*return*/, false];
                        }
                        // TODO: 实现实际的API密钥验证逻辑，这里只是简单返回true
                        return [2 /*return*/, true];
                    case 2:
                        error_10 = _a.sent();
                        console.error('验证模型API密钥失败:', error_10);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return AIModelConfigService;
}());
// 导出服务实例
exports["default"] = new AIModelConfigService();
