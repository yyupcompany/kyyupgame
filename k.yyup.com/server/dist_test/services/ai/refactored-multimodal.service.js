"use strict";
/**
 * 重构后的多模态服务
 * 使用统一的AIBridgeService进行所有AI调用
 *
 * 这是一个重构示例，展示如何将硬编码的axios调用迁移到统一封装
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.RefactoredMultimodalService = void 0;
var ai_bridge_service_1 = require("./bridge/ai-bridge.service");
var ai_model_config_model_1 = require("../../models/ai-model-config.model");
/**
 * 重构后的多模态服务类
 * 所有AI调用都通过AIBridgeService进行
 */
var RefactoredMultimodalService = /** @class */ (function () {
    function RefactoredMultimodalService() {
    }
    /**
     * 图片生成（重构版本）
     * @param userId 用户ID
     * @param options 图片生成选项
     * @returns 生成的图像结果
     */
    RefactoredMultimodalService.prototype.generateImage = function (userId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, modelConfig, selectionReason, specifiedModel, availableModels, params, result, duration, error_1, duration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        modelConfig = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 11]);
                        selectionReason = void 0;
                        if (!options.model) return [3 /*break*/, 3];
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    name: options.model,
                                    modelType: ai_model_config_model_1.ModelType.IMAGE,
                                    status: 'active'
                                }
                            })];
                    case 2:
                        specifiedModel = _a.sent();
                        if (specifiedModel) {
                            modelConfig = specifiedModel;
                            selectionReason = "\u7528\u6237\u6307\u5B9A\u6A21\u578B: ".concat(options.model);
                        }
                        else {
                            throw new Error("\u6307\u5B9A\u7684\u56FE\u50CF\u6A21\u578B ".concat(options.model, " \u4E0D\u53EF\u7528"));
                        }
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findAll({
                            where: {
                                modelType: ai_model_config_model_1.ModelType.IMAGE,
                                status: 'active'
                            },
                            order: [['isDefault', 'DESC'], ['createdAt', 'ASC']]
                        })];
                    case 4:
                        availableModels = _a.sent();
                        if (availableModels.length === 0) {
                            throw new Error('没有可用的图像生成模型');
                        }
                        modelConfig = availableModels[0];
                        selectionReason = "\u81EA\u52A8\u9009\u62E9\u9ED8\u8BA4\u6A21\u578B: ".concat(modelConfig.name);
                        _a.label = 5;
                    case 5:
                        params = {
                            model: modelConfig.name,
                            prompt: options.prompt,
                            n: options.n || 1,
                            size: options.size || '1024x1024',
                            quality: options.quality || 'standard',
                            style: options.style,
                            response_format: options.responseFormat || 'url'
                        };
                        return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateImage(params, {
                                endpointUrl: modelConfig.endpointUrl,
                                apiKey: modelConfig.apiKey
                            })];
                    case 6:
                        result = _a.sent();
                        duration = Date.now() - startTime;
                        // 4. 记录用量到数据库
                        return [4 /*yield*/, this.recordImageUsage(userId, modelConfig, options.prompt, duration, true)];
                    case 7:
                        // 4. 记录用量到数据库
                        _a.sent();
                        // 5. 返回结果
                        return [2 /*return*/, __assign(__assign({}, result), { modelUsed: modelConfig.name, selectionReason: selectionReason })];
                    case 8:
                        error_1 = _a.sent();
                        duration = Date.now() - startTime;
                        if (!modelConfig) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.recordImageUsage(userId, modelConfig, options.prompt, duration, false, error_1.message)];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10:
                        console.error('重构版图片生成失败:', error_1);
                        throw error_1;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 记录图片生成用量
     */
    RefactoredMultimodalService.prototype.recordImageUsage = function (userId, modelConfig, prompt, durationMs, success, errorMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, AIModelUsage, AIUsageType, AIUsageStatus, uuidv4, cost, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-model-usage.model')); })];
                    case 1:
                        _a = _b.sent(), AIModelUsage = _a.AIModelUsage, AIUsageType = _a.AIUsageType, AIUsageStatus = _a.AIUsageStatus;
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('uuid')); })];
                    case 2:
                        uuidv4 = (_b.sent()).v4;
                        cost = 0.01;
                        return [4 /*yield*/, AIModelUsage.create({
                                userId: userId,
                                modelId: modelConfig.id,
                                requestId: uuidv4(),
                                usageType: AIUsageType.IMAGE,
                                inputTokens: prompt.length,
                                outputTokens: 1,
                                totalTokens: prompt.length + 1,
                                cost: cost,
                                status: success ? AIUsageStatus.SUCCESS : AIUsageStatus.FAILED,
                                errorMessage: errorMessage || null,
                                requestTimestamp: new Date(),
                                responseTimestamp: new Date(),
                                processingTime: durationMs
                            })];
                    case 3:
                        _b.sent();
                        console.log("\u2705 [\u7528\u91CF\u7EDF\u8BA1] \u8BB0\u5F55\u6210\u529F: userId=".concat(userId, ", model=").concat(modelConfig.name, ", duration=").concat(durationMs, "ms, status=").concat(success ? 'success' : 'failed'));
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _b.sent();
                        console.error('❌ [用量统计] 记录失败:', error_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 语音转文本（重构版本）
     * @param userId 用户ID
     * @param options 语音转文本选项
     * @returns 转换结果
     */
    RefactoredMultimodalService.prototype.speechToText = function (userId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var modelConfig, params, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getAudioModel(options.model)];
                    case 1:
                        modelConfig = _a.sent();
                        params = {
                            model: modelConfig.name,
                            file: options.file,
                            filename: options.filename,
                            language: options.language,
                            prompt: options.prompt,
                            response_format: options.responseFormat,
                            temperature: options.temperature
                        };
                        return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.speechToText(params, {
                                endpointUrl: modelConfig.endpointUrl,
                                apiKey: modelConfig.apiKey
                            })];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, result), { modelUsed: modelConfig.name, selectionReason: "\u4F7F\u7528\u97F3\u9891\u6A21\u578B: ".concat(modelConfig.name) })];
                    case 3:
                        error_3 = _a.sent();
                        console.error('重构版语音转文本失败:', error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 文本转语音（重构版本）
     * @param userId 用户ID
     * @param options 文本转语音选项
     * @returns 语音数据
     */
    RefactoredMultimodalService.prototype.textToSpeech = function (userId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var modelConfig, params, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getAudioModel(options.model)];
                    case 1:
                        modelConfig = _a.sent();
                        params = {
                            model: modelConfig.name,
                            input: options.input,
                            voice: options.voice,
                            response_format: options.responseFormat,
                            speed: options.speed
                        };
                        return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.textToSpeech(params, {
                                endpointUrl: modelConfig.endpointUrl,
                                apiKey: modelConfig.apiKey
                            })];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, result), { modelUsed: modelConfig.name, selectionReason: "\u4F7F\u7528\u97F3\u9891\u6A21\u578B: ".concat(modelConfig.name) })];
                    case 3:
                        error_4 = _a.sent();
                        console.error('重构版文本转语音失败:', error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 视频生成（重构版本）
     * @param userId 用户ID
     * @param options 视频生成选项
     * @returns 视频生成结果
     */
    RefactoredMultimodalService.prototype.generateVideo = function (userId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var modelConfig, params, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getVideoModel(options.model)];
                    case 1:
                        modelConfig = _a.sent();
                        params = {
                            model: modelConfig.name,
                            prompt: options.prompt,
                            image_url: options.imageUrl,
                            duration: options.duration || 5,
                            size: options.size || '1280x720',
                            fps: options.fps || 30,
                            quality: options.quality || 'standard',
                            style: options.style
                        };
                        return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateVideo(params, {
                                endpointUrl: modelConfig.endpointUrl,
                                apiKey: modelConfig.apiKey
                            })];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, result), { modelUsed: modelConfig.name, selectionReason: "\u4F7F\u7528\u89C6\u9891\u6A21\u578B: ".concat(modelConfig.name) })];
                    case 3:
                        error_5 = _a.sent();
                        console.error('重构版视频生成失败:', error_5);
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 私有辅助方法 ====================
    /**
     * 获取音频模型配置
     */
    RefactoredMultimodalService.prototype.getAudioModel = function (modelName) {
        return __awaiter(this, void 0, void 0, function () {
            var model_1, model;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!modelName) return [3 /*break*/, 2];
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: { name: modelName, status: 'active' }
                            })];
                    case 1:
                        model_1 = _a.sent();
                        if (!model_1) {
                            throw new Error("\u6307\u5B9A\u7684\u97F3\u9891\u6A21\u578B ".concat(modelName, " \u4E0D\u53EF\u7528"));
                        }
                        return [2 /*return*/, model_1];
                    case 2: return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                            where: {
                                modelType: 'audio',
                                status: 'active',
                                isDefault: true
                            }
                        })];
                    case 3:
                        model = _a.sent();
                        if (!model) {
                            throw new Error('没有可用的音频模型');
                        }
                        return [2 /*return*/, model];
                }
            });
        });
    };
    /**
     * 获取视频模型配置
     */
    RefactoredMultimodalService.prototype.getVideoModel = function (modelName) {
        return __awaiter(this, void 0, void 0, function () {
            var model_2, model;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!modelName) return [3 /*break*/, 2];
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: { name: modelName, status: 'active' }
                            })];
                    case 1:
                        model_2 = _a.sent();
                        if (!model_2) {
                            throw new Error("\u6307\u5B9A\u7684\u89C6\u9891\u6A21\u578B ".concat(modelName, " \u4E0D\u53EF\u7528"));
                        }
                        return [2 /*return*/, model_2];
                    case 2: return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                            where: {
                                modelType: 'video',
                                status: 'active',
                                isDefault: true
                            }
                        })];
                    case 3:
                        model = _a.sent();
                        if (!model) {
                            throw new Error('没有可用的视频模型');
                        }
                        return [2 /*return*/, model];
                }
            });
        });
    };
    return RefactoredMultimodalService;
}());
exports.RefactoredMultimodalService = RefactoredMultimodalService;
exports["default"] = new RefactoredMultimodalService();
