"use strict";
/**
 * 模型配置服务
 * 提供动态模型配置管理，替代硬编码
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
var ai_model_config_model_1 = require("../../models/ai-model-config.model");
/**
 * 模型配置服务类
 */
var ModelConfigService = /** @class */ (function () {
    function ModelConfigService() {
        this.defaultTextModel = null;
        this.modelCache = new Map();
        this.lastCacheUpdate = 0;
        this.CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存
    }
    /**
     * 获取默认文本模型名称
     */
    ModelConfigService.prototype.getDefaultTextModelName = function () {
        return __awaiter(this, void 0, void 0, function () {
            var defaultModel, firstActiveTextModel, anyActiveModel, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.defaultTextModel && Date.now() - this.lastCacheUpdate < this.CACHE_TTL) {
                            return [2 /*return*/, this.defaultTextModel];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    isDefault: true,
                                    status: 'active',
                                    modelType: 'text'
                                }
                            })];
                    case 2:
                        defaultModel = _a.sent();
                        if (defaultModel) {
                            this.defaultTextModel = defaultModel.name;
                            this.lastCacheUpdate = Date.now();
                            return [2 /*return*/, this.defaultTextModel];
                        }
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    status: 'active',
                                    modelType: 'text'
                                },
                                order: [['createdAt', 'ASC']]
                            })];
                    case 3:
                        firstActiveTextModel = _a.sent();
                        if (firstActiveTextModel) {
                            this.defaultTextModel = firstActiveTextModel.name;
                            this.lastCacheUpdate = Date.now();
                            console.log("\u4F7F\u7528\u7B2C\u4E00\u4E2A\u53EF\u7528\u7684\u6587\u672C\u6A21\u578B\u4F5C\u4E3A\u9ED8\u8BA4: ".concat(this.defaultTextModel));
                            return [2 /*return*/, this.defaultTextModel];
                        }
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    status: 'active'
                                },
                                order: [['createdAt', 'ASC']]
                            })];
                    case 4:
                        anyActiveModel = _a.sent();
                        if (anyActiveModel) {
                            this.defaultTextModel = anyActiveModel.name;
                            this.lastCacheUpdate = Date.now();
                            console.log("\u4F7F\u7528\u7B2C\u4E00\u4E2A\u53EF\u7528\u6A21\u578B\u4F5C\u4E3A\u9ED8\u8BA4: ".concat(this.defaultTextModel));
                            return [2 /*return*/, this.defaultTextModel];
                        }
                        throw new Error('没有找到任何可用的AI模型配置');
                    case 5:
                        error_1 = _a.sent();
                        console.error('获取默认文本模型失败:', error_1);
                        throw new Error('无法获取默认AI模型配置');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取指定类型的第一个可用模型
     */
    ModelConfigService.prototype.getFirstAvailableModel = function (modelType) {
        if (modelType === void 0) { modelType = 'TEXT'; }
        return __awaiter(this, void 0, void 0, function () {
            var model, anyModel, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    status: 'active',
                                    modelType: modelType
                                },
                                order: [['createdAt', 'ASC']]
                            })];
                    case 1:
                        model = _a.sent();
                        if (model) {
                            return [2 /*return*/, model.name];
                        }
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    status: 'active'
                                },
                                order: [['createdAt', 'ASC']]
                            })];
                    case 2:
                        anyModel = _a.sent();
                        if (anyModel) {
                            console.log("\u672A\u627E\u5230".concat(modelType, "\u7C7B\u578B\u6A21\u578B\uFF0C\u4F7F\u7528: ").concat(anyModel.name));
                            return [2 /*return*/, anyModel.name];
                        }
                        throw new Error("\u6CA1\u6709\u627E\u5230\u53EF\u7528\u7684".concat(modelType, "\u6A21\u578B"));
                    case 3:
                        error_2 = _a.sent();
                        console.error("\u83B7\u53D6".concat(modelType, "\u6A21\u578B\u5931\u8D25:"), error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取模型配置
     */
    ModelConfigService.prototype.getModelConfig = function (modelName) {
        return __awaiter(this, void 0, void 0, function () {
            var config, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // 检查缓存
                        if (this.modelCache.has(modelName) && Date.now() - this.lastCacheUpdate < this.CACHE_TTL) {
                            return [2 /*return*/, this.modelCache.get(modelName) || null];
                        }
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: { name: modelName }
                            })];
                    case 1:
                        config = _a.sent();
                        if (config) {
                            this.modelCache.set(modelName, config);
                            this.lastCacheUpdate = Date.now();
                        }
                        return [2 /*return*/, config];
                    case 2:
                        error_3 = _a.sent();
                        console.error("\u83B7\u53D6\u6A21\u578B\u914D\u7F6E\u5931\u8D25: ".concat(modelName), error_3);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取所有可用模型列表
     */
    ModelConfigService.prototype.getAvailableModels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findAll({
                                where: {
                                    status: 'active'
                                },
                                order: [['createdAt', 'ASC']]
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_4 = _a.sent();
                        console.error('获取可用模型列表失败:', error_4);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 检查模型是否可用
     */
    ModelConfigService.prototype.isModelAvailable = function (modelName) {
        return __awaiter(this, void 0, void 0, function () {
            var config, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getModelConfig(modelName)];
                    case 1:
                        config = _a.sent();
                        return [2 /*return*/, config !== null && config.status === 'active'];
                    case 2:
                        error_5 = _a.sent();
                        console.error("\u68C0\u67E5\u6A21\u578B\u53EF\u7528\u6027\u5931\u8D25: ".concat(modelName), error_5);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 清理缓存
     */
    ModelConfigService.prototype.clearCache = function () {
        this.modelCache.clear();
        this.defaultTextModel = null;
        this.lastCacheUpdate = 0;
    };
    /**
     * 初始化模型配置服务
     */
    ModelConfigService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var availableModels, defaultModel, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        console.log('🤖 初始化模型配置服务...');
                        return [4 /*yield*/, this.getAvailableModels()];
                    case 1:
                        availableModels = _a.sent();
                        console.log("\u2705 \u53D1\u73B0 ".concat(availableModels.length, " \u4E2A\u53EF\u7528AI\u6A21\u578B"));
                        if (!(availableModels.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getDefaultTextModelName()];
                    case 2:
                        defaultModel = _a.sent();
                        console.log("\u2705 \u9ED8\u8BA4\u6A21\u578B\u8BBE\u7F6E\u4E3A: ".concat(defaultModel));
                        return [3 /*break*/, 4];
                    case 3:
                        console.log('⚠️ 警告: 没有找到任何可用的AI模型');
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_6 = _a.sent();
                        console.error('❌ 初始化模型配置服务失败:', error_6);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return ModelConfigService;
}());
exports["default"] = new ModelConfigService();
