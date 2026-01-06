"use strict";
/**
 * AI模型缓存服务
 * 实现模型配置的内存缓存，每小时更新一次，避免频繁数据库查询
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
 * 模型缓存服务类
 */
var ModelCacheService = /** @class */ (function () {
    function ModelCacheService() {
        this.cache = new Map();
        this.CACHE_DURATION = 60 * 60 * 1000; // 1小时
        this.isUpdating = new Set();
    }
    /**
     * 获取指定类型的模型列表（带缓存）
     */
    ModelCacheService.prototype.getModels = function (modelType) {
        return __awaiter(this, void 0, void 0, function () {
            var cached, now;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cached = this.cache.get(modelType);
                        now = new Date();
                        // 检查缓存是否有效
                        if (cached && now < cached.expiresAt) {
                            console.log("\uD83C\uDFAF \u4F7F\u7528\u7F13\u5B58\u7684".concat(modelType, "\u6A21\u578B\u6570\u636E"));
                            return [2 /*return*/, cached.models];
                        }
                        return [4 /*yield*/, this.updateCache(modelType)];
                    case 1: 
                    // 缓存过期，更新
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 获取所有类型的模型（带缓存）
     * @returns 按类型分组的模型映射
     */
    ModelCacheService.prototype.getAllModels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var modelTypes, result, promises, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelTypes = Object.values(ai_model_config_model_1.ModelType);
                        result = new Map();
                        promises = modelTypes.map(function (type) { return __awaiter(_this, void 0, void 0, function () {
                            var models;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.getModels(type)];
                                    case 1:
                                        models = _a.sent();
                                        return [2 /*return*/, { type: type, models: models }];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        results = _a.sent();
                        results.forEach(function (_a) {
                            var type = _a.type, models = _a.models;
                            result.set(type, models);
                        });
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * 更新缓存
     */
    ModelCacheService.prototype.updateCache = function (modelType) {
        return __awaiter(this, void 0, void 0, function () {
            var models, now, expiresAt, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isUpdating.has(modelType)) return [3 /*break*/, 3];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getModels(modelType)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        this.isUpdating.add(modelType);
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, 7, 8]);
                        console.log("\uD83D\uDD04 \u66F4\u65B0".concat(modelType, "\u6A21\u578B\u7F13\u5B58..."));
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findAll({
                                where: {
                                    modelType: modelType,
                                    status: 'active'
                                },
                                order: [
                                    ['isDefault', 'DESC'],
                                    ['createdAt', 'ASC']
                                ]
                            })];
                    case 5:
                        models = _a.sent();
                        now = new Date();
                        expiresAt = new Date(now.getTime() + this.CACHE_DURATION);
                        this.cache.set(modelType, {
                            models: models,
                            lastUpdated: now,
                            expiresAt: expiresAt
                        });
                        console.log("\u2705 ".concat(modelType, "\u6A21\u578B\u7F13\u5B58\u66F4\u65B0\u5B8C\u6210\uFF0C\u5171").concat(models.length, "\u4E2A\u6A21\u578B"));
                        return [2 /*return*/, models];
                    case 6:
                        error_1 = _a.sent();
                        console.error("\u274C \u66F4\u65B0".concat(modelType, "\u6A21\u578B\u7F13\u5B58\u5931\u8D25:"), error_1);
                        throw error_1;
                    case 7:
                        this.isUpdating["delete"](modelType);
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 强制刷新缓存
     */
    ModelCacheService.prototype.forceRefresh = function (modelType) {
        return __awaiter(this, void 0, void 0, function () {
            var modelTypes;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!modelType) return [3 /*break*/, 2];
                        this.cache["delete"](modelType);
                        return [4 /*yield*/, this.updateCache(modelType)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        this.cache.clear();
                        modelTypes = Object.values(ai_model_config_model_1.ModelType);
                        return [4 /*yield*/, Promise.all(modelTypes.map(function (type) { return _this.updateCache(type); }))];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取缓存状态信息
     * @returns 缓存状态
     */
    ModelCacheService.prototype.getCacheStatus = function () {
        var status = {};
        var now = new Date();
        this.cache.forEach(function (data, type) {
            var remainingTime = Math.max(0, data.expiresAt.getTime() - now.getTime());
            status[type] = {
                modelCount: data.models.length,
                lastUpdated: data.lastUpdated.toLocaleString(),
                expiresAt: data.expiresAt.toLocaleString(),
                remainingMinutes: Math.round(remainingTime / 1000 / 60),
                isExpired: remainingTime <= 0
            };
        });
        return status;
    };
    /**
     * 清空所有缓存
     */
    ModelCacheService.prototype.clearCache = function () {
        this.cache.clear();
        console.log('🗑️ 所有模型缓存已清空');
    };
    /**
     * 预热缓存
     */
    ModelCacheService.prototype.warmupCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var modelTypes;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🔥 开始预热模型缓存...');
                        modelTypes = Object.values(ai_model_config_model_1.ModelType);
                        return [4 /*yield*/, Promise.all(modelTypes.map(function (type) { return _this.updateCache(type); }))];
                    case 1:
                        _a.sent();
                        console.log('🎉 模型缓存预热完成');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 启动定时清理任务
     */
    ModelCacheService.prototype.startCleanupTask = function () {
        var _this = this;
        // 每30分钟检查一次过期缓存
        setInterval(function () {
            var now = new Date();
            var cleanedCount = 0;
            _this.cache.forEach(function (data, type) {
                if (now > data.expiresAt) {
                    _this.cache["delete"](type);
                    cleanedCount++;
                }
            });
            if (cleanedCount > 0) {
                console.log("\uD83E\uDDF9 \u6E05\u7406\u4E86".concat(cleanedCount, "\u4E2A\u8FC7\u671F\u7684\u6A21\u578B\u7F13\u5B58"));
            }
        }, 30 * 60 * 1000); // 30分钟
        console.log('⏰ 模型缓存定时清理任务已启动');
    };
    return ModelCacheService;
}());
exports["default"] = new ModelCacheService();
