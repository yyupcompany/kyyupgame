"use strict";
/**
 * 多模态服务
 * 负责处理图像生成、语音转文本和文本转语音等多模态功能
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var axios_1 = __importDefault(require("axios"));
var ai_model_config_model_1 = require("../../models/ai-model-config.model");
var ai_model_usage_model_1 = require("../../models/ai-model-usage.model");
var uuid_1 = require("uuid");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var util_1 = require("util");
var fs_1 = require("fs");
var form_data_1 = __importDefault(require("form-data"));
var model_selector_service_1 = __importStar(require("./model-selector.service"));
var writeFileAsync = (0, util_1.promisify)(fs_1.writeFile);
var readFileAsync = (0, util_1.promisify)(fs.readFile);
/**
 * 多模态服务类
 */
var MultimodalService = /** @class */ (function () {
    function MultimodalService() {
        this.uploadDir = path.join(process.cwd(), 'uploads');
        // 确保上传目录存在
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    /**
     * 智能图像生成
     * @param userId 用户ID
     * @param options 图像生成选项
     * @returns 生成的图像结果
     */
    MultimodalService.prototype.generateImage = function (userId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var modelConfig, selectionReason, specifiedModel, selectionResult, requestId, usage, requestBody, aiBridgeService, response, result, i, imageUrl, imageResponse, imageName, imagePath, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 14, , 15]);
                        modelConfig = void 0;
                        selectionReason = void 0;
                        if (!options.model) return [3 /*break*/, 2];
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    name: options.model,
                                    modelType: ai_model_config_model_1.ModelType.IMAGE,
                                    status: 'active'
                                }
                            })];
                    case 1:
                        specifiedModel = _a.sent();
                        if (!specifiedModel) {
                            throw new Error("\u6307\u5B9A\u7684\u56FE\u50CF\u6A21\u578B\u4E0D\u5B58\u5728\u6216\u4E0D\u53EF\u7528: ".concat(options.model));
                        }
                        modelConfig = specifiedModel;
                        selectionReason = "\u7528\u6237\u6307\u5B9A\u6A21\u578B: ".concat(options.model);
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, model_selector_service_1["default"].selectModel({
                            modelType: ai_model_config_model_1.ModelType.IMAGE,
                            strategy: options.strategy || model_selector_service_1.ModelSelectionStrategy.DEFAULT,
                            userId: userId
                        })];
                    case 3:
                        selectionResult = _a.sent();
                        modelConfig = selectionResult.model;
                        selectionReason = selectionResult.reason;
                        _a.label = 4;
                    case 4:
                        requestId = (0, uuid_1.v4)();
                        return [4 /*yield*/, ai_model_usage_model_1.AIModelUsage.create({
                                userId: userId,
                                modelId: modelConfig.id,
                                requestId: requestId,
                                usageType: ai_model_usage_model_1.AIUsageType.IMAGE,
                                status: ai_model_usage_model_1.AIUsageStatus.PENDING,
                                requestTimestamp: new Date()
                            })];
                    case 5:
                        usage = _a.sent();
                        requestBody = {
                            model: modelConfig.name,
                            prompt: options.prompt,
                            n: options.n || 1,
                            size: options.size || '1024x1024',
                            quality: options.quality || 'standard',
                            style: options.style,
                            response_format: options.responseFormat || 'url'
                        };
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./bridge/ai-bridge.service')); })];
                    case 6:
                        aiBridgeService = (_a.sent()).aiBridgeService;
                        return [4 /*yield*/, aiBridgeService.generateImage({
                                model: modelConfig.name,
                                prompt: options.prompt,
                                n: options.n || 1,
                                size: options.size || '1024x1024',
                                quality: options.quality || 'standard',
                                style: options.style,
                                response_format: options.responseFormat || 'url'
                            }, {
                                endpointUrl: modelConfig.endpointUrl,
                                apiKey: modelConfig.apiKey
                            })];
                    case 7:
                        response = _a.sent();
                        result = response;
                        if (!(options.responseFormat === 'url')) return [3 /*break*/, 12];
                        i = 0;
                        _a.label = 8;
                    case 8:
                        if (!(i < result.data.length)) return [3 /*break*/, 12];
                        imageUrl = result.data[i].url;
                        if (!imageUrl) return [3 /*break*/, 11];
                        return [4 /*yield*/, axios_1["default"].get(imageUrl, { responseType: 'arraybuffer' })];
                    case 9:
                        imageResponse = _a.sent();
                        imageName = "".concat(requestId, "_").concat(i, ".png");
                        imagePath = path.join(this.uploadDir, imageName);
                        return [4 /*yield*/, writeFileAsync(imagePath, imageResponse.data)];
                    case 10:
                        _a.sent();
                        // 更新URL为本地路径
                        result.data[i].url = "/uploads/".concat(imageName);
                        _a.label = 11;
                    case 11:
                        i++;
                        return [3 /*break*/, 8];
                    case 12: 
                    // 更新使用记录
                    return [4 /*yield*/, usage.update({
                            status: ai_model_usage_model_1.AIUsageStatus.SUCCESS,
                            responseTimestamp: new Date(),
                            processingTime: new Date().getTime() - usage.requestTimestamp.getTime()
                        })];
                    case 13:
                        // 更新使用记录
                        _a.sent();
                        return [2 /*return*/, __assign(__assign({}, result), { modelUsed: modelConfig.name, selectionReason: selectionReason })];
                    case 14:
                        error_1 = _a.sent();
                        console.error('图像生成失败:', error_1);
                        throw error_1;
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 智能语音转文本
     * @param userId 用户ID
     * @param options 语音转文本选项
     * @returns 转换后的文本结果
     */
    MultimodalService.prototype.speechToText = function (userId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var modelConfig, selectionReason, specifiedModel, selectionResult, requestId, audioPath, usage, formData, aiBridgeService, response, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 10, , 11]);
                        modelConfig = void 0;
                        selectionReason = void 0;
                        if (!options.model) return [3 /*break*/, 2];
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    name: options.model,
                                    modelType: ai_model_config_model_1.ModelType.SPEECH,
                                    status: 'active'
                                }
                            })];
                    case 1:
                        specifiedModel = _a.sent();
                        if (!specifiedModel) {
                            throw new Error("\u6307\u5B9A\u7684\u8BED\u97F3\u6A21\u578B\u4E0D\u5B58\u5728\u6216\u4E0D\u53EF\u7528: ".concat(options.model));
                        }
                        modelConfig = specifiedModel;
                        selectionReason = "\u7528\u6237\u6307\u5B9A\u6A21\u578B: ".concat(options.model);
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, model_selector_service_1["default"].selectModel({
                            modelType: ai_model_config_model_1.ModelType.SPEECH,
                            strategy: options.strategy || model_selector_service_1.ModelSelectionStrategy.DEFAULT,
                            requireCapabilities: ['transcription'],
                            userId: userId
                        })];
                    case 3:
                        selectionResult = _a.sent();
                        modelConfig = selectionResult.model;
                        selectionReason = selectionResult.reason;
                        _a.label = 4;
                    case 4:
                        requestId = (0, uuid_1.v4)();
                        audioPath = path.join(this.uploadDir, "".concat(requestId, "_").concat(options.filename));
                        return [4 /*yield*/, writeFileAsync(audioPath, options.file)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, ai_model_usage_model_1.AIModelUsage.create({
                                userId: userId,
                                modelId: modelConfig.id,
                                requestId: requestId,
                                usageType: ai_model_usage_model_1.AIUsageType.AUDIO,
                                status: ai_model_usage_model_1.AIUsageStatus.PENDING,
                                requestTimestamp: new Date()
                            })];
                    case 6:
                        usage = _a.sent();
                        formData = new form_data_1["default"]();
                        formData.append('file', new Blob([new Uint8Array(options.file)]), options.filename);
                        formData.append('model', modelConfig.name); // 使用选中的模型名称
                        if (options.language) {
                            formData.append('language', options.language);
                        }
                        if (options.prompt) {
                            formData.append('prompt', options.prompt);
                        }
                        if (options.responseFormat) {
                            formData.append('response_format', options.responseFormat);
                        }
                        if (options.temperature) {
                            formData.append('temperature', options.temperature.toString());
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./bridge/ai-bridge.service')); })];
                    case 7:
                        aiBridgeService = (_a.sent()).aiBridgeService;
                        return [4 /*yield*/, aiBridgeService.speechToText({
                                model: modelConfig.name,
                                file: options.file,
                                filename: 'audio.wav',
                                language: options.language,
                                prompt: options.prompt,
                                response_format: options.responseFormat || 'json',
                                temperature: options.temperature
                            }, {
                                endpointUrl: modelConfig.endpointUrl,
                                apiKey: modelConfig.apiKey
                            })];
                    case 8:
                        response = _a.sent();
                        result = response;
                        // 更新使用记录
                        return [4 /*yield*/, usage.update({
                                status: ai_model_usage_model_1.AIUsageStatus.SUCCESS,
                                responseTimestamp: new Date(),
                                processingTime: new Date().getTime() - usage.requestTimestamp.getTime()
                            })];
                    case 9:
                        // 更新使用记录
                        _a.sent();
                        return [2 /*return*/, {
                                text: result.text,
                                modelUsed: modelConfig.name,
                                selectionReason: selectionReason
                            }];
                    case 10:
                        error_2 = _a.sent();
                        console.error('语音转文本失败:', error_2);
                        throw error_2;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 智能文本转语音
     * @param userId 用户ID
     * @param options 文本转语音选项
     * @returns 生成的语音结果
     */
    MultimodalService.prototype.textToSpeech = function (userId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var modelConfig, selectionReason, specifiedModel, selectionResult, requestId, usage, requestBody, aiBridgeService, response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        modelConfig = void 0;
                        selectionReason = void 0;
                        if (!options.model) return [3 /*break*/, 2];
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    name: options.model,
                                    modelType: ai_model_config_model_1.ModelType.SPEECH,
                                    status: 'active'
                                }
                            })];
                    case 1:
                        specifiedModel = _a.sent();
                        if (!specifiedModel) {
                            throw new Error("\u6307\u5B9A\u7684\u8BED\u97F3\u6A21\u578B\u4E0D\u5B58\u5728\u6216\u4E0D\u53EF\u7528: ".concat(options.model));
                        }
                        modelConfig = specifiedModel;
                        selectionReason = "\u7528\u6237\u6307\u5B9A\u6A21\u578B: ".concat(options.model);
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, model_selector_service_1["default"].selectModel({
                            modelType: ai_model_config_model_1.ModelType.SPEECH,
                            strategy: options.strategy || model_selector_service_1.ModelSelectionStrategy.DEFAULT,
                            requireCapabilities: ['synthesis'],
                            userId: userId
                        })];
                    case 3:
                        selectionResult = _a.sent();
                        modelConfig = selectionResult.model;
                        selectionReason = selectionResult.reason;
                        _a.label = 4;
                    case 4:
                        requestId = (0, uuid_1.v4)();
                        return [4 /*yield*/, ai_model_usage_model_1.AIModelUsage.create({
                                userId: userId,
                                modelId: modelConfig.id,
                                requestId: requestId,
                                usageType: ai_model_usage_model_1.AIUsageType.AUDIO,
                                status: ai_model_usage_model_1.AIUsageStatus.PENDING,
                                requestTimestamp: new Date()
                            })];
                    case 5:
                        usage = _a.sent();
                        requestBody = {
                            model: modelConfig.name,
                            input: options.input,
                            voice: options.voice,
                            speed: options.speed || 1.0,
                            response_format: options.responseFormat || 'mp3'
                        };
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./bridge/ai-bridge.service')); })];
                    case 6:
                        aiBridgeService = (_a.sent()).aiBridgeService;
                        return [4 /*yield*/, aiBridgeService.textToSpeech({
                                model: modelConfig.name,
                                input: options.input,
                                voice: options.voice,
                                speed: options.speed || 1.0,
                                response_format: options.responseFormat || 'mp3'
                            }, {
                                endpointUrl: modelConfig.endpointUrl,
                                apiKey: modelConfig.apiKey
                            })];
                    case 7:
                        response = _a.sent();
                        // 更新使用记录
                        return [4 /*yield*/, usage.update({
                                status: ai_model_usage_model_1.AIUsageStatus.SUCCESS,
                                responseTimestamp: new Date(),
                                processingTime: new Date().getTime() - usage.requestTimestamp.getTime()
                            })];
                    case 8:
                        // 更新使用记录
                        _a.sent();
                        return [2 /*return*/, {
                                audioData: response.audioData,
                                contentType: response.contentType || 'audio/mpeg',
                                modelUsed: modelConfig.name,
                                selectionReason: selectionReason
                            }];
                    case 9:
                        error_3 = _a.sent();
                        console.error('文本转语音失败:', error_3);
                        throw error_3;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取支持的语音列表
     * @returns 支持的语音列表
     */
    MultimodalService.prototype.getSupportedVoices = function () {
        return [
            'alloy',
            'echo',
            'fable',
            'onyx',
            'nova',
            'shimmer'
        ];
    };
    return MultimodalService;
}());
exports["default"] = new MultimodalService();
