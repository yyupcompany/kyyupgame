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
exports.AIModelCacheService = void 0;
var init_1 = require("../init");
/**
 * AI模型配置缓存服务
 * 系统启动时读取一次，之后直接从内存缓存获取，避免频繁数据库查询
 */
var AIModelCacheService = /** @class */ (function () {
    function AIModelCacheService() {
        this.modelCache = new Map();
        this.isInitialized = false;
        this.lastRefreshTime = 0;
        this.CACHE_REFRESH_INTERVAL = 30 * 60 * 1000; // 30分钟刷新一次
    }
    AIModelCacheService.getInstance = function () {
        if (!AIModelCacheService.instance) {
            AIModelCacheService.instance = new AIModelCacheService();
        }
        return AIModelCacheService.instance;
    };
    /**
     * 初始化模型缓存 - 系统启动时调用
     */
    AIModelCacheService.prototype.initializeCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var timeoutPromise, dbError_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        console.log('🤖 正在初始化AI模型缓存...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        timeoutPromise = new Promise(function (_, reject) {
                            setTimeout(function () { return reject(new Error('数据库加载超时')); }, 10000); // 10秒超时
                        });
                        return [4 /*yield*/, Promise.race([
                                this.loadModelsFromDatabase(),
                                timeoutPromise
                            ])];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        dbError_1 = _a.sent();
                        console.warn('⚠️ 数据库加载失败，使用fallback配置:', dbError_1 instanceof Error ? dbError_1.message : dbError_1);
                        // 使用fallback配置
                        this.loadFallbackModels();
                        return [3 /*break*/, 4];
                    case 4:
                        this.isInitialized = true;
                        this.lastRefreshTime = Date.now();
                        console.log("\u2705 AI\u6A21\u578B\u7F13\u5B58\u521D\u59CB\u5316\u5B8C\u6210\uFF0C\u5171\u52A0\u8F7D ".concat(this.modelCache.size, " \u4E2A\u6A21\u578B"));
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.error('❌ AI模型缓存初始化失败:', error_1);
                        // 即使失败也要加载fallback配置，确保服务能启动
                        this.loadFallbackModels();
                        this.isInitialized = true;
                        this.lastRefreshTime = Date.now();
                        console.log("\u26A0\uFE0F \u4F7F\u7528fallback\u914D\u7F6E\u542F\u52A8\uFF0C\u5171\u52A0\u8F7D ".concat(this.modelCache.size, " \u4E2A\u6A21\u578B"));
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 加载fallback模型配置
     * 注意：已移除硬编码配置，所有模型配置应从数据库加载
     */
    AIModelCacheService.prototype.loadFallbackModels = function () {
        console.log('📦 Fallback模型配置已移除硬编码，将仅从数据库加载...');
        // 不再使用硬编码的fallback模型
        // 所有模型配置应从数据库中的ai_model_config表加载
        // 如果数据库中没有可用模型，系统将通过AIBridgeService使用环境变量配置
        console.log('⚠️  请确保数据库中有可用的AI模型配置');
    };
    /**
     * 从数据库加载所有活跃的AI模型
     */
    AIModelCacheService.prototype.loadModelsFromDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var results, models, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          id, name, display_name, provider, model_type, endpoint_url,\n          api_key, model_parameters, status, is_default\n        FROM ai_model_config\n        WHERE status = 'active'\n        ORDER BY is_default DESC, created_at ASC\n      ")];
                    case 1:
                        results = (_a.sent())[0];
                        console.log("\uD83D\uDCCA \u4ECE\u6570\u636E\u5E93\u52A0\u8F7D\u4E86 ".concat(results.length, " \u4E2A\u6D3B\u8DC3\u6A21\u578B"));
                        models = results;
                        // 清空现有缓存
                        this.modelCache.clear();
                        // 按功能分类缓存模型
                        models.forEach(function (model) {
                            // 标准化字段名（处理数据库字段命名）
                            model.displayName = model.display_name || model.displayName;
                            model.modelType = model.model_type || model.modelType;
                            model.endpointUrl = model.endpoint_url || model.endpointUrl;
                            model.apiKey = model.api_key || model.apiKey;
                            model.isDefault = model.is_default || model.isDefault;
                            // 解析modelParameters字段（JSON字符串或对象）
                            try {
                                if (typeof model.model_parameters === 'string') {
                                    model.modelParameters = JSON.parse(model.model_parameters || '{}');
                                }
                                else {
                                    model.modelParameters = model.model_parameters || {};
                                }
                            }
                            catch (e) {
                                model.modelParameters = {};
                            }
                            // 设置默认的capabilities基于modelType
                            model.capabilities = [model.modelType || 'text'];
                            model.isActive = model.status === 'active';
                            // 存储到缓存
                            _this.modelCache.set(model.name, model);
                            // 基于模型的明确能力和类型进行分类，不再使用名称模糊匹配
                            _this.categorizeModelByCapabilities(model);
                            // 设置默认模型
                            if (model.isDefault) {
                                _this.modelCache.set('DEFAULT_MODEL', model);
                            }
                        });
                        console.log('📋 已缓存的模型类型:');
                        console.log("   - \u6570\u636E\u5E93\u67E5\u8BE2\u6A21\u578B: ".concat(this.modelCache.has('DB_QUERY_MODEL') ? '✅' : '❌'));
                        console.log("   - \u610F\u56FE\u5206\u6790\u6A21\u578B: ".concat(this.modelCache.has('INTENT_MODEL') ? '✅' : '❌'));
                        console.log("   - \u95EE\u7B54\u6A21\u578B(128k): ".concat(this.modelCache.has('QA_MODEL') ? '✅' : '❌'));
                        console.log("   - \u9ED8\u8BA4\u6A21\u578B: ".concat(this.modelCache.has('DEFAULT_MODEL') ? '✅' : '❌'));
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('❌ 数据库加载模型失败:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取所有可用的AI模型
     */
    AIModelCacheService.prototype.getAvailableModels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var models;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureCacheReady()];
                    case 1:
                        _a.sent();
                        models = [];
                        this.modelCache.forEach(function (model, key) {
                            // 跳过快捷访问键
                            if (!key.includes('_MODEL')) {
                                models.push(model);
                            }
                        });
                        return [2 /*return*/, models];
                }
            });
        });
    };
    /**
     * 获取数据库查询专用模型
     */
    AIModelCacheService.prototype.getDatabaseQueryModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureCacheReady()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.modelCache.get('DB_QUERY_MODEL') || this.modelCache.get('DEFAULT_MODEL')];
                }
            });
        });
    };
    /**
     * 获取意图分析专用模型
     */
    AIModelCacheService.prototype.getIntentAnalysisModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureCacheReady()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.modelCache.get('INTENT_MODEL') || this.modelCache.get('DB_QUERY_MODEL') || this.modelCache.get('DEFAULT_MODEL')];
                }
            });
        });
    };
    /**
     * 获取AI问答专用模型（128k）
     */
    AIModelCacheService.prototype.getQAModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureCacheReady()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.modelCache.get('QA_MODEL') || this.modelCache.get('DEFAULT_MODEL')];
                }
            });
        });
    };
    /**
     * 根据模型名称获取模型配置
     */
    AIModelCacheService.prototype.getModelByName = function (modelName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureCacheReady()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.modelCache.get(modelName)];
                }
            });
        });
    };
    /**
     * 获取默认模型
     */
    AIModelCacheService.prototype.getDefaultModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureCacheReady()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.modelCache.get('DEFAULT_MODEL')];
                }
            });
        });
    };
    /**
     * 确保缓存已准备就绪
     */
    AIModelCacheService.prototype.ensureCacheReady = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = Date.now();
                        if (!(!this.isInitialized || (now - this.lastRefreshTime) > this.CACHE_REFRESH_INTERVAL)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadModelsFromDatabase()];
                    case 1:
                        _a.sent();
                        this.isInitialized = true;
                        this.lastRefreshTime = now;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 基于模型能力进行分类
     */
    AIModelCacheService.prototype.categorizeModelByCapabilities = function (model) {
        // 确保capabilities字段存在
        var capabilities = model.capabilities || [];
        // 根据模型能力进行分类
        if (capabilities.includes('database_query') || model.purpose === 'database_query') {
            this.modelCache.set('DB_QUERY_MODEL', model);
        }
        if (capabilities.includes('intent_analysis') || model.purpose === 'intent_analysis') {
            this.modelCache.set('INTENT_MODEL', model);
        }
        if (capabilities.includes('qa') || model.purpose === 'qa' || model.context_length >= 128000) {
            this.modelCache.set('QA_MODEL', model);
        }
        // 如果没有明确分类，根据模型类型进行通用分类
        if (model.modelType === 'text' && !model.purpose) {
            // 如果还没有设置通用模型，使用这个文本模型
            if (!this.modelCache.has('DB_QUERY_MODEL')) {
                this.modelCache.set('DB_QUERY_MODEL', model);
            }
            if (!this.modelCache.has('INTENT_MODEL')) {
                this.modelCache.set('INTENT_MODEL', model);
            }
            if (!this.modelCache.has('QA_MODEL')) {
                this.modelCache.set('QA_MODEL', model);
            }
        }
    };
    /**
     * 手动刷新缓存
     */
    AIModelCacheService.prototype.refreshCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🔄 手动刷新AI模型缓存...');
                        return [4 /*yield*/, this.loadModelsFromDatabase()];
                    case 1:
                        _a.sent();
                        this.lastRefreshTime = Date.now();
                        console.log('✅ AI模型缓存刷新完成');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取缓存统计信息
     */
    AIModelCacheService.prototype.getCacheStats = function () {
        return {
            isInitialized: this.isInitialized,
            modelCount: this.modelCache.size,
            lastRefreshTime: new Date(this.lastRefreshTime).toISOString(),
            nextRefreshTime: new Date(this.lastRefreshTime + this.CACHE_REFRESH_INTERVAL).toISOString()
        };
    };
    return AIModelCacheService;
}());
exports.AIModelCacheService = AIModelCacheService;
exports["default"] = AIModelCacheService.getInstance();
