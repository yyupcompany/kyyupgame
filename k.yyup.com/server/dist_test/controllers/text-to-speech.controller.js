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
exports.TextToSpeechController = void 0;
var ai_bridge_service_1 = require("../services/ai/bridge/ai-bridge.service");
var ai_model_config_model_1 = require("../models/ai-model-config.model");
/**
 * 文字转语音控制器
 */
var TextToSpeechController = /** @class */ (function () {
    function TextToSpeechController() {
        var _this = this;
        this.aiBridgeService = ai_bridge_service_1.aiBridgeService;
        /**
         * 生成语音
         */
        this.generateSpeech = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, text, _b, voice, _c, speed, _d, format, ttsModel, params, audioResult, error_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 6, , 7]);
                        _a = req.body, text = _a.text, _b = _a.voice, voice = _b === void 0 ? 'nova' : _b, _c = _a.speed, speed = _c === void 0 ? 1.0 : _c, _d = _a.format, format = _d === void 0 ? 'mp3' : _d;
                        // 验证参数
                        if (!text || typeof text !== 'string') {
                            res.status(400).json({
                                success: false,
                                message: '文本内容不能为空'
                            });
                            return [2 /*return*/];
                        }
                        if (text.length > 4096) {
                            res.status(400).json({
                                success: false,
                                message: '文本内容不能超过4096个字符'
                            });
                            return [2 /*return*/];
                        }
                        console.log('🔊 [文字转语音] 开始生成语音:', {
                            textLength: text.length,
                            voice: voice,
                            speed: speed,
                            format: format
                        });
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    modelType: 'speech',
                                    status: 'active'
                                }
                            })];
                    case 1:
                        ttsModel = _e.sent();
                        params = {
                            model: (ttsModel === null || ttsModel === void 0 ? void 0 : ttsModel.name) || 'tts-1',
                            input: text,
                            voice: voice,
                            response_format: format,
                            speed: speed
                        };
                        audioResult = void 0;
                        if (!(ttsModel && ttsModel.endpointUrl && ttsModel.apiKey)) return [3 /*break*/, 3];
                        console.log('🔊 [文字转语音] 使用自定义TTS模型配置');
                        return [4 /*yield*/, this.aiBridgeService.textToSpeech(params, {
                                endpointUrl: ttsModel.endpointUrl,
                                apiKey: ttsModel.apiKey
                            })];
                    case 2:
                        audioResult = _e.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        console.log('🔊 [文字转语音] 使用默认TTS配置');
                        return [4 /*yield*/, this.aiBridgeService.textToSpeech(params)];
                    case 4:
                        audioResult = _e.sent();
                        _e.label = 5;
                    case 5:
                        console.log('🔊 [文字转语音] 语音生成成功');
                        // 设置响应头 - 支持音频播放和Range请求
                        res.setHeader('Content-Type', audioResult.contentType);
                        res.setHeader('Content-Length', audioResult.audioData.length.toString());
                        res.setHeader('Accept-Ranges', 'bytes');
                        res.setHeader('Cache-Control', 'public, max-age=3600');
                        // 不设置 Content-Disposition，让浏览器可以直接播放
                        // 如果需要下载，前端会通过 download 属性处理
                        // 返回音频数据
                        res.send(audioResult.audioData);
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _e.sent();
                        console.error('🔊 [文字转语音] 生成失败:', error_1);
                        res.status(500).json({
                            success: false,
                            message: '语音生成失败',
                            error: error_1 instanceof Error ? error_1.message : '未知错误'
                        });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取可用的音色列表
         */
        this.getVoices = function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
            var voices;
            return __generator(this, function (_a) {
                try {
                    voices = [
                        {
                            id: 'alloy',
                            name: '女声-温柔',
                            description: '温柔亲切的女声',
                            language: 'zh-CN'
                        },
                        {
                            id: 'nova',
                            name: '女声-活泼',
                            description: '活泼开朗的女声',
                            language: 'zh-CN'
                        },
                        {
                            id: 'shimmer',
                            name: '女声-专业',
                            description: '专业稳重的女声',
                            language: 'zh-CN'
                        },
                        {
                            id: 'echo',
                            name: '男声-沉稳',
                            description: '沉稳大气的男声',
                            language: 'zh-CN'
                        },
                        {
                            id: 'fable',
                            name: '男声-年轻',
                            description: '年轻活力的男声',
                            language: 'zh-CN'
                        },
                        {
                            id: 'onyx',
                            name: '男声-磁性',
                            description: '磁性深沉的男声',
                            language: 'zh-CN'
                        }
                    ];
                    res.json({
                        success: true,
                        data: voices
                    });
                }
                catch (error) {
                    console.error('🔊 [文字转语音] 获取音色列表失败:', error);
                    res.status(500).json({
                        success: false,
                        message: '获取音色列表失败'
                    });
                }
                return [2 /*return*/];
            });
        }); };
        /**
         * 获取TTS模型配置
         */
        this.getConfig = function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
            var ttsModel, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    modelType: 'speech',
                                    status: 'active'
                                }
                            })];
                    case 1:
                        ttsModel = _a.sent();
                        res.json({
                            success: true,
                            data: {
                                hasConfig: !!ttsModel,
                                modelName: (ttsModel === null || ttsModel === void 0 ? void 0 : ttsModel.name) || 'tts-1',
                                maxLength: 4096,
                                supportedFormats: ['mp3', 'opus', 'aac', 'flac'],
                                speedRange: {
                                    min: 0.25,
                                    max: 4.0,
                                    "default": 1.0
                                }
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('🔊 [文字转语音] 获取配置失败:', error_2);
                        res.status(500).json({
                            success: false,
                            message: '获取配置失败'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // Use the singleton instance
    }
    return TextToSpeechController;
}());
exports.TextToSpeechController = TextToSpeechController;
exports["default"] = new TextToSpeechController();
