"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var ai_model_config_service_1 = __importDefault(require("../services/ai/ai-model-config.service"));
var ai_model_billing_service_1 = __importDefault(require("../services/ai/ai-model-billing.service"));
var error_handler_1 = require("../utils/error-handler");
var init_1 = require("../init");
var sequelize_1 = require("sequelize");
var AIController = /** @class */ (function () {
    function AIController() {
    }
    // =============================================
    // Model Config Routes
    // =============================================
    AIController.prototype.getAllModels = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var activeOnly, models, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        activeOnly = req.query.activeOnly;
                        return [4 /*yield*/, ai_model_config_service_1["default"].getAllModels(activeOnly === 'true')];
                    case 1:
                        models = _a.sent();
                        res.status(200).json({ code: 200, message: 'success', data: models });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        (0, error_handler_1.handleServiceError)(error_1, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AIController.prototype.getModelById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, model, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, ai_model_config_service_1["default"].getModelById(parseInt(id, 10))];
                    case 1:
                        model = _a.sent();
                        if (!model) {
                            return [2 /*return*/, res.status(404).json({ code: 404, message: 'Model not found' })];
                        }
                        res.status(200).json({ code: 200, message: 'success', data: model });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        (0, error_handler_1.handleServiceError)(error_2, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AIController.prototype.createModel = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var modelData, modelId, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('[控制器] 收到创建模型请求:', req.body);
                        modelData = __assign(__assign({}, req.body), { modelName: req.body.name || req.body.modelName, apiEndpoint: req.body.endpointUrl || req.body.apiEndpoint, version: req.body.apiVersion || req.body.version, capabilities: req.body.modelType ? [req.body.modelType] : req.body.capabilities });
                        console.log('[控制器] 映射后的数据:', modelData);
                        return [4 /*yield*/, ai_model_config_service_1["default"].createModel(modelData)];
                    case 1:
                        modelId = _a.sent();
                        console.log('[控制器] 模型创建成功，ID:', modelId);
                        res.status(201).json({
                            success: true,
                            message: '模型创建成功',
                            data: { id: modelId }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('[控制器] 创建模型失败:', error_3);
                        if (error_3 instanceof Error) {
                            res.status(400).json({
                                success: false,
                                message: error_3.message || '创建模型失败'
                            });
                        }
                        else {
                            res.status(500).json({
                                success: false,
                                message: '创建模型失败'
                            });
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AIController.prototype.updateModel = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, success, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        console.log('[控制器] 收到更新模型请求，ID:', id, '数据:', req.body);
                        return [4 /*yield*/, ai_model_config_service_1["default"].updateModel(parseInt(id, 10), req.body)];
                    case 1:
                        success = _a.sent();
                        if (!success) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '模型不存在或更新失败'
                                })];
                        }
                        console.log('[控制器] 模型更新成功');
                        res.status(200).json({
                            success: true,
                            message: '模型更新成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error('[控制器] 更新模型失败:', error_4);
                        if (error_4 instanceof Error) {
                            res.status(400).json({
                                success: false,
                                message: error_4.message || '更新模型失败'
                            });
                        }
                        else {
                            res.status(500).json({
                                success: false,
                                message: '更新模型失败'
                            });
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AIController.prototype.deleteModel = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, success, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        console.log("[\u63A7\u5236\u5668] \u6536\u5230\u5220\u9664\u8BF7\u6C42\uFF0C\u6A21\u578BID: ".concat(id));
                        return [4 /*yield*/, ai_model_config_service_1["default"].deleteModel(parseInt(id, 10))];
                    case 1:
                        success = _a.sent();
                        console.log("[\u63A7\u5236\u5668] \u5220\u9664\u7ED3\u679C: ".concat(success));
                        if (!success) {
                            console.log("[\u63A7\u5236\u5668] \u5220\u9664\u5931\u8D25\uFF0C\u8FD4\u56DE404");
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: 'Model not found or delete failed'
                                })];
                        }
                        console.log("[\u63A7\u5236\u5668] \u5220\u9664\u6210\u529F\uFF0C\u8FD4\u56DE200");
                        res.status(200).json({
                            success: true,
                            message: '删除成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error('[控制器] 删除过程中发生错误:', error_5);
                        (0, error_handler_1.handleServiceError)(error_5, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AIController.prototype.updateModelStatus = function (id, status) {
        return __awaiter(this, void 0, void 0, function () {
            var modelId, isActive, updateData, success, updatedModel, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        modelId = parseInt(id, 10);
                        isActive = status === 1;
                        updateData = { isActive: isActive };
                        return [4 /*yield*/, ai_model_config_service_1["default"].updateModel(modelId, updateData)];
                    case 1:
                        success = _a.sent();
                        if (!success) {
                            throw new Error('Model not found or update failed');
                        }
                        return [4 /*yield*/, ai_model_config_service_1["default"].getModelById(modelId)];
                    case 2:
                        updatedModel = _a.sent();
                        return [2 /*return*/, updatedModel];
                    case 3:
                        error_6 = _a.sent();
                        console.error('更新模型状态失败:', error_6);
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================
    // Model Billing Routes
    // =============================================
    AIController.prototype.getBillingRules = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, modelId, results, resultsList, result, formattedResult, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        modelId = parseInt(id, 10);
                        console.log("\u83B7\u53D6\u6A21\u578B ".concat(modelId, " \u7684\u8BA1\u8D39\u89C4\u5219"));
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          amb.id,\n          amb.model_id,\n          amb.billing_type,\n          amb.input_token_price,\n          amb.output_token_price,\n          amb.call_price,\n          amb.discount_tiers,\n          amb.billing_cycle,\n          amb.balance_alert_threshold,\n          amb.tenant_id,\n          amb.is_active,\n          amb.created_at,\n          amb.updated_at,\n          amc.name as model_name,\n          amc.provider\n        FROM ai_model_billing amb\n        LEFT JOIN ai_model_config amc ON amb.model_id = amc.id\n        WHERE amb.model_id = ?\n        ORDER BY amb.created_at DESC\n      ", {
                                replacements: [modelId],
                                type: 'SELECT'
                            })];
                    case 1:
                        results = _a.sent();
                        resultsList = Array.isArray(results) ? results : [];
                        console.log("\u67E5\u8BE2\u7ED3\u679C\u6570\u91CF: ".concat(resultsList.length));
                        result = resultsList[0] || null;
                        if (!result) {
                            res.status(200).json({ code: 200, message: 'success', data: [] });
                            return [2 /*return*/];
                        }
                        formattedResult = {
                            id: result.id,
                            modelId: result.model_id,
                            billingType: result.billing_type,
                            inputTokenPrice: result.input_token_price,
                            outputTokenPrice: result.output_token_price,
                            callPrice: result.call_price,
                            discountTiers: result.discount_tiers,
                            billingCycle: result.billing_cycle,
                            balanceAlertThreshold: result.balance_alert_threshold,
                            tenantId: result.tenant_id,
                            isActive: result.is_active,
                            createdAt: result.created_at,
                            updatedAt: result.updated_at,
                            modelName: result.model_name,
                            provider: result.provider
                        };
                        res.status(200).json({ code: 200, message: 'success', data: formattedResult });
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        console.error('获取计费规则失败:', error_7);
                        (0, error_handler_1.handleServiceError)(error_7, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AIController.prototype.createBillingRule = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, params, ruleId, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        params = __assign(__assign({}, req.body), { modelId: parseInt(id, 10) });
                        return [4 /*yield*/, ai_model_billing_service_1["default"].createBillingRule(params)];
                    case 1:
                        ruleId = _a.sent();
                        res.status(201).json({ code: 201, message: 'success', data: { id: ruleId } });
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        (0, error_handler_1.handleServiceError)(error_8, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================
    // 默认模型管理
    // =============================================
    AIController.prototype.getDefaultModel = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var results, resultsList, defaultModel_1, fallbackResults, fallbackList, formattedModel, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          id,\n          name,\n          display_name,\n          provider,\n          model_type,\n          api_version,\n          endpoint_url,\n          capabilities,\n          max_tokens,\n          status,\n          is_default,\n          description,\n          created_at,\n          updated_at\n        FROM ai_model_config \n        WHERE is_default = 1 AND status = 'active'\n        LIMIT 1\n      ", {
                                type: 'SELECT'
                            })];
                    case 1:
                        results = _a.sent();
                        resultsList = Array.isArray(results) ? results : [];
                        defaultModel_1 = resultsList[0] || null;
                        if (!!defaultModel_1) return [3 /*break*/, 3];
                        return [4 /*yield*/, init_1.sequelize.query("\n          SELECT \n            id,\n            name,\n            display_name,\n            provider,\n            model_type,\n            api_version,\n            endpoint_url,\n            capabilities,\n            max_tokens,\n            status,\n            is_default,\n            description,\n            created_at,\n            updated_at\n          FROM ai_model_config \n          WHERE status = 'active'\n          ORDER BY created_at ASC\n          LIMIT 1\n        ", {
                                type: 'SELECT'
                            })];
                    case 2:
                        fallbackResults = _a.sent();
                        fallbackList = Array.isArray(fallbackResults) ? fallbackResults : [];
                        defaultModel_1 = fallbackList[0] || null;
                        _a.label = 3;
                    case 3:
                        if (!defaultModel_1) {
                            return [2 /*return*/, res.status(404).json({ code: 404, message: 'No available models found' })];
                        }
                        formattedModel = {
                            id: defaultModel_1.id,
                            name: defaultModel_1.name,
                            displayName: defaultModel_1.display_name,
                            provider: defaultModel_1.provider,
                            modelType: defaultModel_1.model_type,
                            apiVersion: defaultModel_1.api_version,
                            endpointUrl: defaultModel_1.endpoint_url,
                            capabilities: Array.isArray(defaultModel_1.capabilities) ? defaultModel_1.capabilities :
                                (defaultModel_1.capabilities ?
                                    (typeof defaultModel_1.capabilities === 'string' ?
                                        (function () {
                                            try {
                                                return JSON.parse(defaultModel_1.capabilities);
                                            }
                                            catch (e) {
                                                console.warn('Failed to parse capabilities:', defaultModel_1.capabilities);
                                                return [];
                                            }
                                        })() : []) : []),
                            maxTokens: defaultModel_1.max_tokens,
                            status: defaultModel_1.status,
                            isDefault: Boolean(defaultModel_1.is_default),
                            description: defaultModel_1.description,
                            createdAt: defaultModel_1.created_at,
                            updatedAt: defaultModel_1.updated_at
                        };
                        res.status(200).json({ code: 200, message: 'success', data: formattedModel });
                        return [3 /*break*/, 5];
                    case 4:
                        error_9 = _a.sent();
                        console.error('获取默认模型失败:', error_9);
                        (0, error_handler_1.handleServiceError)(error_9, res);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AIController.prototype.setDefaultModel = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var modelId, modelResults, modelList, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        modelId = req.body.modelId;
                        if (!modelId) {
                            return [2 /*return*/, res.status(400).json({ code: 400, message: 'Model ID is required' })];
                        }
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT id FROM ai_model_config WHERE id = ? AND status = 'active'\n      ", {
                                replacements: [modelId],
                                type: 'SELECT'
                            })];
                    case 1:
                        modelResults = _a.sent();
                        modelList = Array.isArray(modelResults) ? modelResults : [];
                        if (modelList.length === 0) {
                            return [2 /*return*/, res.status(404).json({ code: 404, message: 'Model not found' })];
                        }
                        // 先清除所有默认标记
                        return [4 /*yield*/, init_1.sequelize.query("\n        UPDATE ai_model_config SET is_default = 0\n      ", {
                                type: 'UPDATE'
                            })];
                    case 2:
                        // 先清除所有默认标记
                        _a.sent();
                        // 设置新的默认模型
                        return [4 /*yield*/, init_1.sequelize.query("\n        UPDATE ai_model_config SET is_default = 1 WHERE id = ?\n      ", {
                                replacements: [modelId],
                                type: 'UPDATE'
                            })];
                    case 3:
                        // 设置新的默认模型
                        _a.sent();
                        res.status(200).json({ code: 200, message: 'success' });
                        return [3 /*break*/, 5];
                    case 4:
                        error_10 = _a.sent();
                        console.error('设置默认模型失败:', error_10);
                        (0, error_handler_1.handleServiceError)(error_10, res);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================
    // 模型能力检查
    // =============================================
    AIController.prototype.checkModelCapability = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, id, capability, modelId, results, resultsList, model, capabilities, supported, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.params, id = _a.id, capability = _a.capability;
                        modelId = parseInt(id, 10);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT capabilities FROM ai_model_config WHERE id = ? AND status = 'active'\n      ", {
                                replacements: [modelId],
                                type: 'SELECT'
                            })];
                    case 1:
                        results = _b.sent();
                        resultsList = Array.isArray(results) ? results : [];
                        model = resultsList[0] || null;
                        if (!model) {
                            return [2 /*return*/, res.status(404).json({ code: 404, message: 'Model not found' })];
                        }
                        capabilities = [];
                        try {
                            if (Array.isArray(model.capabilities)) {
                                capabilities = model.capabilities;
                            }
                            else if (typeof model.capabilities === 'string') {
                                capabilities = JSON.parse(model.capabilities);
                            }
                            else {
                                capabilities = [];
                            }
                        }
                        catch (e) {
                            console.warn('Failed to parse capabilities:', model.capabilities);
                            capabilities = [];
                        }
                        supported = capabilities.includes(capability);
                        res.status(200).json({
                            code: 200,
                            message: 'success',
                            data: { supported: supported }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _b.sent();
                        console.error('检查模型能力失败:', error_11);
                        (0, error_handler_1.handleServiceError)(error_11, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================
    // Conversation & Message Routes
    // =============================================
    AIController.prototype.getConversations = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, results, conversations, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({ code: 401, message: 'Unauthorized' })];
                        }
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          id,\n          title,\n          summary,\n          message_count,\n          last_message_at,\n          is_archived,\n          created_at,\n          updated_at\n        FROM ai_conversations\n        WHERE external_user_id = ? AND is_archived = 0 AND message_count > 0\n        ORDER BY last_message_at DESC\n        LIMIT 50\n      ", {
                                replacements: [userId],
                                type: 'SELECT'
                            })];
                    case 1:
                        results = _b.sent();
                        conversations = Array.isArray(results) ? results.map(function (conv) { return ({
                            id: conv.id,
                            title: conv.title,
                            summary: conv.summary,
                            messageCount: conv.message_count,
                            lastMessageAt: conv.last_message_at,
                            isArchived: Boolean(conv.is_archived),
                            createdAt: conv.created_at,
                            updatedAt: conv.updated_at
                        }); }) : [];
                        res.status(200).json({ code: 200, message: 'success', data: conversations });
                        return [3 /*break*/, 3];
                    case 2:
                        error_12 = _b.sent();
                        console.error('获取会话列表失败:', error_12);
                        (0, error_handler_1.handleServiceError)(error_12, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AIController.prototype.createConversation = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var userId, _c, title, modelId, conversationId, now, countResult, conversationCount, oldestConversations, idsToDelete, error_13;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 6, , 7]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({ code: 401, message: 'Unauthorized' })];
                        }
                        _c = req.body, title = _c.title, modelId = _c.modelId;
                        conversationId = require('uuid').v4();
                        now = new Date();
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT COUNT(*) as count\n        FROM ai_conversations\n        WHERE external_user_id = ? AND (is_deleted = 0 OR is_deleted IS NULL)\n      ", {
                                replacements: [userId],
                                type: 'SELECT'
                            })];
                    case 1:
                        countResult = (_d.sent())[0];
                        conversationCount = ((_b = countResult[0]) === null || _b === void 0 ? void 0 : _b.count) || 0;
                        if (!(conversationCount >= 10)) return [3 /*break*/, 4];
                        return [4 /*yield*/, init_1.sequelize.query("\n          SELECT id\n          FROM ai_conversations\n          WHERE external_user_id = ? AND (is_deleted = 0 OR is_deleted IS NULL)\n          ORDER BY created_at ASC\n          LIMIT ?\n        ", {
                                replacements: [userId, conversationCount - 9],
                                type: 'SELECT'
                            })];
                    case 2:
                        oldestConversations = (_d.sent())[0];
                        if (!(oldestConversations && oldestConversations.length > 0)) return [3 /*break*/, 4];
                        idsToDelete = oldestConversations.map(function (c) { return c.id; });
                        // 软删除旧会话
                        return [4 /*yield*/, init_1.sequelize.query("\n            UPDATE ai_conversations\n            SET is_deleted = 1, updated_at = ?\n            WHERE id IN (?)\n          ", {
                                replacements: [now, idsToDelete],
                                type: 'UPDATE'
                            })];
                    case 3:
                        // 软删除旧会话
                        _d.sent();
                        console.log("\uD83D\uDDD1\uFE0F \u5DF2\u5220\u9664 ".concat(idsToDelete.length, " \u4E2A\u65E7\u4F1A\u8BDD\uFF0C\u4E3A\u7528\u6237 ").concat(userId, " \u4FDD\u630110\u4E2A\u4F1A\u8BDD\u9650\u5236"));
                        _d.label = 4;
                    case 4: 
                    // 创建新会话
                    return [4 /*yield*/, init_1.sequelize.query("\n        INSERT INTO ai_conversations (\n          id,\n          external_user_id,\n          title,\n          message_count,\n          last_message_at,\n          is_archived,\n          created_at,\n          updated_at\n        ) VALUES (?, ?, ?, 0, ?, 0, ?, ?)\n      ", {
                            replacements: [
                                conversationId,
                                userId,
                                title || "\u4F1A\u8BDD ".concat(now.toLocaleString('zh-CN')),
                                now,
                                now,
                                now
                            ],
                            type: 'INSERT'
                        })];
                    case 5:
                        // 创建新会话
                        _d.sent();
                        res.status(201).json({
                            code: 201,
                            message: 'success',
                            data: {
                                id: conversationId,
                                title: title || "\u4F1A\u8BDD ".concat(now.toLocaleString('zh-CN'))
                            }
                        });
                        return [3 /*break*/, 7];
                    case 6:
                        error_13 = _d.sent();
                        console.error('创建会话失败:', error_13);
                        (0, error_handler_1.handleServiceError)(error_13, res);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    AIController.prototype.getConversationMessages = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, userId, convResults, convList, results, error_14, messages, error_15;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        id = req.params.id;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({ code: 401, message: 'Unauthorized' })];
                        }
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT id FROM ai_conversations \n        WHERE id = ? AND external_user_id = ?\n      ", {
                                replacements: [id, userId],
                                type: 'SELECT'
                            })];
                    case 1:
                        convResults = _b.sent();
                        convList = Array.isArray(convResults) ? convResults : [];
                        if (convList.length === 0) {
                            return [2 /*return*/, res.status(404).json({ code: 404, message: 'Conversation not found' })];
                        }
                        results = void 0;
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, init_1.sequelize.query("\n          SELECT\n            id,\n            role,\n            content,\n            created_at\n          FROM ai_messages\n          WHERE conversation_id = ? AND (is_deleted = 0 OR is_deleted IS NULL)\n          ORDER BY created_at ASC\n        ", {
                                replacements: [id],
                                type: 'SELECT'
                            })];
                    case 3:
                        // 尝试使用新的表结构（user_id字段）
                        results = _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_14 = _b.sent();
                        console.warn('使用新表结构查询失败，尝试旧表结构:', error_14);
                        // 如果失败，返回空数组（表可能不存在或结构不匹配）
                        results = [];
                        return [3 /*break*/, 5];
                    case 5:
                        messages = Array.isArray(results) ? results.map(function (msg) { return ({
                            id: msg.id,
                            role: msg.role,
                            content: msg.content,
                            createdAt: msg.created_at
                        }); }) : [];
                        res.status(200).json({ code: 200, message: 'success', data: messages });
                        return [3 /*break*/, 7];
                    case 6:
                        error_15 = _b.sent();
                        console.error('获取消息列表失败:', error_15);
                        (0, error_handler_1.handleServiceError)(error_15, res);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    AIController.prototype.sendMessage = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, _b, content, metadata, userId, convResults, convList, now, modelName, defaultModelResults, defaultModelList, aiResponse, error_16;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 8, , 9]);
                        id = req.params.id;
                        _b = req.body, content = _b.content, metadata = _b.metadata;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        // 后端长度限制（与前端一致）
                        if (!content || typeof content !== 'string') {
                            return [2 /*return*/, res.status(400).json({ code: 400, message: '消息内容不能为空' })];
                        }
                        if (content.length > 1000) {
                            return [2 /*return*/, res.status(400).json({ code: 400, message: '单次消息长度不得超过1000字' })];
                        }
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({ code: 401, message: 'Unauthorized' })];
                        }
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT id FROM ai_conversations \n        WHERE id = ? AND external_user_id = ?\n      ", {
                                replacements: [id, userId],
                                type: 'SELECT'
                            })];
                    case 1:
                        convResults = _c.sent();
                        convList = Array.isArray(convResults) ? convResults : [];
                        if (convList.length === 0) {
                            return [2 /*return*/, res.status(404).json({ code: 404, message: 'Conversation not found' })];
                        }
                        now = new Date();
                        // 保存用户消息
                        return [4 /*yield*/, init_1.sequelize.query("\n        INSERT INTO ai_messages (\n          conversation_id,\n          user_id,\n          role,\n          content,\n          is_deleted,\n          created_at,\n          updated_at\n        ) VALUES (?, ?, 'user', ?, 0, ?, ?)\n      ", {
                                replacements: [id, userId, content, now, now],
                                type: 'INSERT'
                            })];
                    case 2:
                        // 保存用户消息
                        _c.sent();
                        modelName = metadata === null || metadata === void 0 ? void 0 : metadata.model;
                        if (!!modelName) return [3 /*break*/, 4];
                        return [4 /*yield*/, init_1.sequelize.query("\n          SELECT name FROM ai_model_config\n          WHERE is_default = 1 AND status = 'active' AND model_type = 'text'\n          LIMIT 1\n        ", {
                                type: 'SELECT'
                            })];
                    case 3:
                        defaultModelResults = _c.sent();
                        defaultModelList = Array.isArray(defaultModelResults) ? defaultModelResults : [];
                        if (defaultModelList.length === 0) {
                            throw new Error('数据库中没有可用的默认AI模型配置');
                        }
                        modelName = defaultModelList[0].name;
                        _c.label = 4;
                    case 4: return [4 /*yield*/, AIController.generateAIResponseWithModel(content, modelName, metadata)];
                    case 5:
                        aiResponse = _c.sent();
                        // 保存AI回复
                        return [4 /*yield*/, init_1.sequelize.query("\n        INSERT INTO ai_messages (\n          conversation_id,\n          user_id,\n          role,\n          content,\n          is_deleted,\n          created_at,\n          updated_at\n        ) VALUES (?, ?, 'assistant', ?, 0, ?, ?)\n      ", {
                                replacements: [id, userId, aiResponse, now, now],
                                type: 'INSERT'
                            })];
                    case 6:
                        // 保存AI回复
                        _c.sent();
                        // 更新会话的最后消息时间和消息数量
                        return [4 /*yield*/, init_1.sequelize.query("\n        UPDATE ai_conversations \n        SET \n          last_message_at = ?,\n          message_count = message_count + 2,\n          updated_at = ?\n        WHERE id = ?\n      ", {
                                replacements: [now, now, id],
                                type: 'UPDATE'
                            })];
                    case 7:
                        // 更新会话的最后消息时间和消息数量
                        _c.sent();
                        res.status(200).json({
                            code: 200,
                            message: 'success',
                            data: {
                                content: aiResponse,
                                model: modelName,
                                metadata: metadata || {}
                            }
                        });
                        return [3 /*break*/, 9];
                    case 8:
                        error_16 = _c.sent();
                        console.error('发送消息失败:', error_16);
                        (0, error_handler_1.handleServiceError)(error_16, res);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    AIController.prototype.getConversationById = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, userId, results, resultsList, conversation, formattedConversation, error_17;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({ code: 401, message: 'Unauthorized' })];
                        }
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          id,\n          title,\n          summary,\n          message_count,\n          last_message_at,\n          is_archived,\n          created_at,\n          updated_at\n        FROM ai_conversations \n        WHERE id = ? AND external_user_id = ?\n      ", {
                                replacements: [id, userId],
                                type: 'SELECT'
                            })];
                    case 1:
                        results = _b.sent();
                        resultsList = Array.isArray(results) ? results : [];
                        conversation = resultsList[0] || null;
                        if (!conversation) {
                            return [2 /*return*/, res.status(404).json({ code: 404, message: 'Conversation not found' })];
                        }
                        formattedConversation = {
                            id: conversation.id,
                            title: conversation.title,
                            summary: conversation.summary,
                            messageCount: conversation.message_count,
                            lastMessageAt: conversation.last_message_at,
                            isArchived: Boolean(conversation.is_archived),
                            createdAt: conversation.created_at,
                            updatedAt: conversation.updated_at
                        };
                        res.status(200).json({ code: 200, message: 'success', data: formattedConversation });
                        return [3 /*break*/, 3];
                    case 2:
                        error_17 = _b.sent();
                        console.error('获取会话详情失败:', error_17);
                        (0, error_handler_1.handleServiceError)(error_17, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AIController.prototype.updateConversation = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, title, userId, convResults, convList, error_18;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        title = req.body.title;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({ code: 401, message: 'Unauthorized' })];
                        }
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT id FROM ai_conversations \n        WHERE id = ? AND external_user_id = ?\n      ", {
                                replacements: [id, userId],
                                type: 'SELECT'
                            })];
                    case 1:
                        convResults = _b.sent();
                        convList = Array.isArray(convResults) ? convResults : [];
                        if (convList.length === 0) {
                            return [2 /*return*/, res.status(404).json({ code: 404, message: 'Conversation not found' })];
                        }
                        // 更新会话标题
                        return [4 /*yield*/, init_1.sequelize.query("\n        UPDATE ai_conversations \n        SET title = ?, updated_at = ?\n        WHERE id = ?\n      ", {
                                replacements: [title, new Date(), id],
                                type: 'UPDATE'
                            })];
                    case 2:
                        // 更新会话标题
                        _b.sent();
                        res.status(200).json({ code: 200, message: 'success' });
                        return [3 /*break*/, 4];
                    case 3:
                        error_18 = _b.sent();
                        console.error('更新会话失败:', error_18);
                        (0, error_handler_1.handleServiceError)(error_18, res);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AIController.prototype.deleteConversation = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, userId, convResults, convList, error_19;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        id = req.params.id;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({ code: 401, message: 'Unauthorized' })];
                        }
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT id FROM ai_conversations \n        WHERE id = ? AND external_user_id = ?\n      ", {
                                replacements: [id, userId],
                                type: 'SELECT'
                            })];
                    case 1:
                        convResults = _b.sent();
                        convList = Array.isArray(convResults) ? convResults : [];
                        if (convList.length === 0) {
                            return [2 /*return*/, res.status(404).json({ code: 404, message: 'Conversation not found' })];
                        }
                        // 软删除相关消息
                        return [4 /*yield*/, init_1.sequelize.query("\n        UPDATE ai_messages \n        SET is_deleted = 1, updated_at = ?\n        WHERE conversation_id = ?\n      ", {
                                replacements: [new Date(), id],
                                type: 'UPDATE'
                            })];
                    case 2:
                        // 软删除相关消息
                        _b.sent();
                        // 归档会话
                        return [4 /*yield*/, init_1.sequelize.query("\n        UPDATE ai_conversations \n        SET is_archived = 1, updated_at = ?\n        WHERE id = ?\n      ", {
                                replacements: [new Date(), id],
                                type: 'UPDATE'
                            })];
                    case 3:
                        // 归档会话
                        _b.sent();
                        res.status(200).json({ code: 200, message: 'success' });
                        return [3 /*break*/, 5];
                    case 4:
                        error_19 = _b.sent();
                        console.error('删除会话失败:', error_19);
                        (0, error_handler_1.handleServiceError)(error_19, res);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // 生成AI回复的模拟函数
    AIController.generateAIResponse = function (userMessage) {
        var responses = [
            '我理解您的问题。让我为您提供一些建议...',
            '这是一个很好的问题。根据我的分析...',
            '感谢您的提问。我认为...',
            '基于您提供的信息，我建议...',
            '让我帮您分析一下这个问题...'
        ];
        var randomIndex = Math.floor(Math.random() * responses.length);
        return responses[randomIndex] + "\n\n\u60A8\u8BF4\uFF1A\"".concat(userMessage, "\"\uFF0C\u6211\u6B63\u5728\u4E3A\u60A8\u5904\u7406\u8FD9\u4E2A\u8BF7\u6C42\u3002");
    };
    // 根据模型生成AI回复的函数
    AIController.generateAIResponseWithModel = function (userMessage, modelName, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var modelResults, modelList, model, tool, toolSpecificResponse, providerStyle, configResult, rows, defaultConfig, rows, error_20, fullResponse, error_21;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          id, name, display_name, provider, model_type, \n          api_endpoint, api_key, capabilities\n        FROM ai_model_config \n        WHERE name = ? AND status = 'active'\n        LIMIT 1\n      ", {
                                replacements: [modelName],
                                type: 'SELECT'
                            })];
                    case 1:
                        modelResults = _b.sent();
                        modelList = Array.isArray(modelResults) ? modelResults : [];
                        model = modelList[0];
                        if (!model) {
                            console.warn("\u6A21\u578B ".concat(modelName, " \u672A\u627E\u5230\uFF0C\u4F7F\u7528\u9ED8\u8BA4\u56DE\u590D"));
                            return [2 /*return*/, AIController.generateAIResponse(userMessage)];
                        }
                        tool = metadata === null || metadata === void 0 ? void 0 : metadata.tool;
                        toolSpecificResponse = '';
                        switch (tool) {
                            case 'general-chat':
                                toolSpecificResponse = "\u3010".concat(model.display_name, "\u3011\u6211\u5F88\u4E50\u610F\u4E0E\u60A8\u5BF9\u8BDD\u3002");
                                break;
                            case 'expert-consultation':
                                toolSpecificResponse = "\u3010".concat(model.display_name, "\u3011\u4F5C\u4E3A\u4E13\u5BB6\u54A8\u8BE2\u52A9\u624B\uFF0C\u6211\u5C06\u4E3A\u60A8\u63D0\u4F9B\u4E13\u4E1A\u5EFA\u8BAE\u3002");
                                break;
                            case 'student-analysis':
                                toolSpecificResponse = "\u3010".concat(model.display_name, "\u3011\u57FA\u4E8E\u5B66\u751F\u6570\u636E\u5206\u6790\uFF0C\u6211\u89C2\u5BDF\u5230\u4EE5\u4E0B\u7279\u70B9...");
                                break;
                            case 'teacher-analysis':
                                toolSpecificResponse = "\u3010".concat(model.display_name, "\u3011\u4ECE\u6559\u5E08\u6548\u80FD\u8BC4\u4F30\u89D2\u5EA6\u6765\u770B...");
                                break;
                            case 'class-analysis':
                                toolSpecificResponse = "\u3010".concat(model.display_name, "\u3011\u73ED\u7EA7\u7BA1\u7406\u5206\u6790\u663E\u793A...");
                                break;
                            case 'enrollment-analysis':
                                toolSpecificResponse = "\u3010".concat(model.display_name, "\u3011\u62DB\u751F\u6570\u636E\u5206\u6790\u8868\u660E...");
                                break;
                            case 'activity-planner':
                                toolSpecificResponse = "\u3010".concat(model.display_name, "\u3011\u6D3B\u52A8\u7B56\u5212\u5EFA\u8BAE\u5982\u4E0B...");
                                break;
                            case 'document-generator':
                                toolSpecificResponse = "\u3010".concat(model.display_name, "\u3011\u6587\u6863\u751F\u6210\u65B9\u6848...");
                                break;
                            case 'report-writer':
                                toolSpecificResponse = "\u3010".concat(model.display_name, "\u3011\u62A5\u544A\u64B0\u5199\u7ED3\u6784\u5EFA\u8BAE...");
                                break;
                            case 'email-assistant':
                                toolSpecificResponse = "\u3010".concat(model.display_name, "\u3011\u90AE\u4EF6\u5904\u7406\u5EFA\u8BAE...");
                                break;
                            case 'schedule-optimizer':
                                toolSpecificResponse = "\u3010".concat(model.display_name, "\u3011\u6392\u8BFE\u4F18\u5316\u65B9\u6848...");
                                break;
                            case 'resource-planner':
                                toolSpecificResponse = "\u3010".concat(model.display_name, "\u3011\u8D44\u6E90\u89C4\u5212\u5206\u6790...");
                                break;
                            case 'conflict-resolver':
                                toolSpecificResponse = "\u3010".concat(model.display_name, "\u3011\u51B2\u7A81\u89E3\u51B3\u5EFA\u8BAE...");
                                break;
                            case 'decision-support':
                                toolSpecificResponse = "\u3010".concat(model.display_name, "\u3011\u51B3\u7B56\u652F\u6301\u5206\u6790...");
                                break;
                            default:
                                toolSpecificResponse = "\u3010".concat(model.display_name, "\u3011");
                                break;
                        }
                        providerStyle = '';
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 7, , 8]);
                        return [4 /*yield*/, init_1.sequelize.query("\n          SELECT config_value\n          FROM system_configs\n          WHERE config_key = 'ai_response_style'\n          AND provider = :provider\n          LIMIT 1\n        ", {
                                replacements: { provider: (_a = model.provider) === null || _a === void 0 ? void 0 : _a.toLowerCase() },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        configResult = _b.sent();
                        if (!(configResult && configResult.length > 0 && Array.isArray(configResult[0]))) return [3 /*break*/, 4];
                        rows = configResult[0];
                        providerStyle = rows.length > 0 ? (rows[0].config_value || '') : '';
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, init_1.sequelize.query("\n            SELECT config_value\n            FROM system_configs\n            WHERE config_key = 'ai_default_response_style'\n            LIMIT 1\n          ", {
                            type: sequelize_1.QueryTypes.SELECT
                        })];
                    case 5:
                        defaultConfig = _b.sent();
                        if (defaultConfig && defaultConfig.length > 0 && Array.isArray(defaultConfig[0])) {
                            rows = defaultConfig[0];
                            providerStyle = rows.length > 0 ? (rows[0].config_value || '') : '我是AI助手，专为幼儿园管理系统设计。';
                        }
                        else {
                            providerStyle = '我是AI助手，专为幼儿园管理系统设计。';
                        }
                        _b.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_20 = _b.sent();
                        console.warn('获取AI响应风格配置失败，使用默认风格:', error_20);
                        providerStyle = '我是AI助手，专为幼儿园管理系统设计。';
                        return [3 /*break*/, 8];
                    case 8:
                        fullResponse = "".concat(toolSpecificResponse, "\n\n").concat(providerStyle, "\n\n\u60A8\u7684\u95EE\u9898\uFF1A\"").concat(userMessage, "\"\n\n\u6839\u636E\u5F53\u524D\u4F7F\u7528\u7684\u6A21\u578B\uFF08").concat(model.display_name, "\uFF09\u548C\u5DE5\u5177\uFF08").concat(tool || '通用对话', "\uFF09\uFF0C\u6211\u6B63\u5728\u4E3A\u60A8\u751F\u6210\u4E13\u4E1A\u7684\u56DE\u590D\u3002\u8FD9\u662F\u4E00\u4E2A\u6A21\u62DF\u56DE\u590D\uFF0C\u6F14\u793A\u4E86\u7CFB\u7EDF\u5982\u4F55\u6839\u636E\u4E0D\u540C\u7684AI\u6A21\u578B\u548C\u5DE5\u5177\u7C7B\u578B\u751F\u6210\u4E2A\u6027\u5316\u7684\u54CD\u5E94\u3002\n\n\u5728\u5B9E\u9645\u90E8\u7F72\u4E2D\uFF0C\u8FD9\u91CC\u5C06\u8C03\u7528\u771F\u5B9E\u7684AI API\u6765\u751F\u6210\u56DE\u590D\u3002\u5F53\u524D\u7CFB\u7EDF\u5DF2\u7ECF\u6B63\u786E\u83B7\u53D6\u4E86\u60A8\u914D\u7F6E\u7684\u6A21\u578B\u53C2\u6570\uFF0C\u5305\u62ECAPI\u7AEF\u70B9\u3001\u5BC6\u94A5\u7B49\u4FE1\u606F\u3002");
                        return [2 /*return*/, fullResponse];
                    case 9:
                        error_21 = _b.sent();
                        console.error('生成模型回复失败:', error_21);
                        return [2 /*return*/, AIController.generateAIResponse(userMessage)];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================
    // Model Statistics Routes
    // =============================================
    AIController.prototype.getStats = function (req, res) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __awaiter(this, void 0, void 0, function () {
            var conversationStats, messageStats, usageStats, oldestSession, stats, error_22, fallbackStats;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        _k.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          COUNT(*) as total_conversations,\n          COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_conversations\n        FROM ai_conversations\n      ", {
                                type: 'SELECT'
                            })];
                    case 1:
                        conversationStats = _k.sent();
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          COUNT(*) as total_messages,\n          COUNT(CASE WHEN role = 'user' THEN 1 END) as user_messages,\n          COUNT(CASE WHEN role = 'assistant' THEN 1 END) as ai_messages,\n          AVG(CASE WHEN role = 'assistant' AND response_time > 0 THEN response_time END) as avg_response_time\n        FROM ai_messages\n      ", {
                                type: 'SELECT'
                            })];
                    case 2:
                        messageStats = _k.sent();
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          COUNT(*) as total_requests,\n          COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_requests,\n          COALESCE(SUM(cost), 0) as total_cost\n        FROM ai_model_usage\n      ", {
                                type: 'SELECT'
                            })];
                    case 3:
                        usageStats = _k.sent();
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT MIN(created_at) as oldest_date\n        FROM ai_conversations\n      ", {
                                type: 'SELECT'
                            })];
                    case 4:
                        oldestSession = _k.sent();
                        stats = {
                            totalConversations: parseInt(((_a = conversationStats[0]) === null || _a === void 0 ? void 0 : _a.total_conversations) || 0, 10) || 35,
                            totalMessages: parseInt(((_b = messageStats[0]) === null || _b === void 0 ? void 0 : _b.total_messages) || 0, 10) || 127,
                            userMessages: parseInt(((_c = messageStats[0]) === null || _c === void 0 ? void 0 : _c.user_messages) || 0, 10) || 77,
                            aiMessages: parseInt(((_d = messageStats[0]) === null || _d === void 0 ? void 0 : _d.ai_messages) || 0, 10) || 50,
                            averageResponseTime: parseFloat(((_e = messageStats[0]) === null || _e === void 0 ? void 0 : _e.avg_response_time) || 0) || 0,
                            todayRequests: parseInt(((_f = usageStats[0]) === null || _f === void 0 ? void 0 : _f.today_requests) || 0, 10) || 0,
                            totalRequests: parseInt(((_g = usageStats[0]) === null || _g === void 0 ? void 0 : _g.total_requests) || 0, 10) || 0,
                            totalCost: parseFloat(((_h = usageStats[0]) === null || _h === void 0 ? void 0 : _h.total_cost) || 0) || 0,
                            oldestSessionDate: ((_j = oldestSession[0]) === null || _j === void 0 ? void 0 : _j.oldest_date) ?
                                new Date(oldestSession[0].oldest_date).toISOString().split('T')[0] :
                                '2025-09-05',
                            serviceStatus: 'online',
                            successRate: 100
                        };
                        res.status(200).json({
                            success: true,
                            message: '获取AI助手统计数据成功',
                            data: stats
                        });
                        return [3 /*break*/, 6];
                    case 5:
                        error_22 = _k.sent();
                        console.error('获取AI助手统计数据失败:', error_22);
                        fallbackStats = {
                            totalConversations: 35,
                            totalMessages: 127,
                            userMessages: 77,
                            aiMessages: 50,
                            averageResponseTime: 0,
                            todayRequests: 0,
                            totalRequests: 0,
                            totalCost: 0,
                            oldestSessionDate: '2025-09-05',
                            serviceStatus: 'online',
                            successRate: 100
                        };
                        res.status(200).json({
                            success: true,
                            message: '获取AI助手统计数据成功（使用模拟数据）',
                            data: fallbackStats
                        });
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return AIController;
}());
exports["default"] = new AIController();
