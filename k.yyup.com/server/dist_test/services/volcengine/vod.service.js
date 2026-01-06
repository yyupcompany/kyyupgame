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
exports.vodService = void 0;
var axios_1 = __importDefault(require("axios"));
var form_data_1 = __importDefault(require("form-data"));
var ai_model_config_model_1 = require("../../models/ai-model-config.model");
/**
 * 火山引擎视频点播服务
 * 提供视频上传、剪辑、合成等功能
 */
var VolcengineVODService = /** @class */ (function () {
    function VolcengineVODService() {
        this.apiKey = '';
        this.endpoint = '';
        this.initialized = false;
    }
    /**
     * 初始化VOD服务配置
     */
    VolcengineVODService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var vodModel, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.initialized) {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    provider: 'bytedance_doubao',
                                    status: 'active'
                                }
                            })];
                    case 2:
                        vodModel = _a.sent();
                        if (vodModel) {
                            this.apiKey = vodModel.apiKey;
                            this.endpoint = vodModel.endpointUrl.replace(/\/chat\/completions.*$/, '');
                            this.initialized = true;
                            console.log('✅ VOD服务初始化成功');
                            console.log('🔗 端点:', this.endpoint);
                        }
                        else {
                            throw new Error('未找到火山引擎配置');
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('❌ VOD服务初始化失败:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 上传视频到VOD
     * @param videoBuffer 视频文件Buffer
     * @param filename 文件名
     * @returns 视频ID和URL
     */
    VolcengineVODService.prototype.uploadVideo = function (videoBuffer, filename) {
        return __awaiter(this, void 0, void 0, function () {
            var formData, response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        console.log("\uD83D\uDCE4 \u5F00\u59CB\u4E0A\u4F20\u89C6\u9891: ".concat(filename));
                        formData = new form_data_1["default"]();
                        formData.append('file', videoBuffer, {
                            filename: filename,
                            contentType: 'video/mp4'
                        });
                        return [4 /*yield*/, axios_1["default"].post("".concat(this.endpoint, "/vod/upload"), formData, {
                                headers: __assign(__assign({}, formData.getHeaders()), { 'Authorization': "Bearer ".concat(this.apiKey) }),
                                timeout: 300000,
                                maxBodyLength: Infinity,
                                maxContentLength: Infinity
                            })];
                    case 3:
                        response = _a.sent();
                        console.log('✅ 视频上传成功');
                        return [2 /*return*/, {
                                videoId: response.data.video_id || response.data.id,
                                videoUrl: response.data.video_url || response.data.url,
                                duration: response.data.duration || 0
                            }];
                    case 4:
                        error_2 = _a.sent();
                        console.error('❌ 视频上传失败:', error_2);
                        throw new Error("\u89C6\u9891\u4E0A\u4F20\u5931\u8D25: ".concat(error_2.message));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 合并多个视频片段
     * @param videoUrls 视频URL数组
     * @param outputFilename 输出文件名
     * @returns 合并后的视频信息
     */
    VolcengineVODService.prototype.mergeVideos = function (videoUrls, outputFilename) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        console.log("\u2702\uFE0F \u5F00\u59CB\u5408\u5E76 ".concat(videoUrls.length, " \u4E2A\u89C6\u9891\u7247\u6BB5"));
                        return [4 /*yield*/, axios_1["default"].post("".concat(this.endpoint, "/vod/merge"), {
                                video_urls: videoUrls,
                                output_filename: outputFilename,
                                format: 'mp4'
                            }, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': "Bearer ".concat(this.apiKey)
                                },
                                timeout: 600000 // 10分钟超时
                            })];
                    case 3:
                        response = _a.sent();
                        console.log('✅ 视频合并成功');
                        return [2 /*return*/, {
                                videoId: response.data.video_id || response.data.id,
                                videoUrl: response.data.video_url || response.data.url,
                                duration: response.data.duration || 0
                            }];
                    case 4:
                        error_3 = _a.sent();
                        console.error('❌ 视频合并失败:', error_3);
                        throw new Error("\u89C6\u9891\u5408\u5E76\u5931\u8D25: ".concat(error_3.message));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 为视频添加音频
     * @param videoUrl 视频URL
     * @param audioUrl 音频URL
     * @param outputFilename 输出文件名
     * @returns 合成后的视频信息
     */
    VolcengineVODService.prototype.addAudioToVideo = function (videoUrl, audioUrl, outputFilename) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        console.log('🎤 开始为视频添加音频');
                        return [4 /*yield*/, axios_1["default"].post("".concat(this.endpoint, "/vod/add-audio"), {
                                video_url: videoUrl,
                                audio_url: audioUrl,
                                output_filename: outputFilename,
                                audio_volume: 1.0,
                                video_volume: 0.3 // 降低原视频音量
                            }, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': "Bearer ".concat(this.apiKey)
                                },
                                timeout: 600000
                            })];
                    case 3:
                        response = _a.sent();
                        console.log('✅ 音频添加成功');
                        return [2 /*return*/, {
                                videoId: response.data.video_id || response.data.id,
                                videoUrl: response.data.video_url || response.data.url,
                                duration: response.data.duration || 0
                            }];
                    case 4:
                        error_4 = _a.sent();
                        console.error('❌ 音频添加失败:', error_4);
                        throw new Error("\u97F3\u9891\u6DFB\u52A0\u5931\u8D25: ".concat(error_4.message));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 视频转码
     * @param videoUrl 视频URL
     * @param format 目标格式
     * @param quality 质量设置
     * @returns 转码后的视频信息
     */
    VolcengineVODService.prototype.transcodeVideo = function (videoUrl, format, quality) {
        if (format === void 0) { format = 'mp4'; }
        if (quality === void 0) { quality = 'high'; }
        return __awaiter(this, void 0, void 0, function () {
            var response, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        console.log("\uD83D\uDD04 \u5F00\u59CB\u89C6\u9891\u8F6C\u7801: ".concat(format, ", \u8D28\u91CF: ").concat(quality));
                        return [4 /*yield*/, axios_1["default"].post("".concat(this.endpoint, "/vod/transcode"), {
                                video_url: videoUrl,
                                format: format,
                                quality: quality,
                                bitrate: quality === 'high' ? '5000k' : quality === 'medium' ? '2000k' : '1000k'
                            }, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': "Bearer ".concat(this.apiKey)
                                },
                                timeout: 600000
                            })];
                    case 3:
                        response = _a.sent();
                        console.log('✅ 视频转码成功');
                        return [2 /*return*/, {
                                videoId: response.data.video_id || response.data.id,
                                videoUrl: response.data.video_url || response.data.url,
                                duration: response.data.duration || 0
                            }];
                    case 4:
                        error_5 = _a.sent();
                        console.error('❌ 视频转码失败:', error_5);
                        throw new Error("\u89C6\u9891\u8F6C\u7801\u5931\u8D25: ".concat(error_5.message));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 查询视频处理状态
     * @param taskId 任务ID
     * @returns 任务状态信息
     */
    VolcengineVODService.prototype.getTaskStatus = function (taskId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios_1["default"].get("".concat(this.endpoint, "/vod/task/").concat(taskId), {
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey)
                                },
                                timeout: 30000
                            })];
                    case 3:
                        response = _a.sent();
                        return [2 /*return*/, {
                                status: response.data.status,
                                progress: response.data.progress || 0,
                                result: response.data.result,
                                error: response.data.error
                            }];
                    case 4:
                        error_6 = _a.sent();
                        console.error('❌ 查询任务状态失败:', error_6);
                        throw new Error("\u67E5\u8BE2\u4EFB\u52A1\u72B6\u6001\u5931\u8D25: ".concat(error_6.message));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return VolcengineVODService;
}());
exports.vodService = new VolcengineVODService();
exports["default"] = exports.vodService;
