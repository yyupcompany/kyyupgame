"use strict";
/**
 * 火山引擎TTS V3 双向流式WebSocket服务
 * 官方端点：wss://openspeech.bytedance.com/api/v3/tts/bidirection
 * 认证方式：APP Key + Access Key
 * 支持实时流式传输和在线语音交互
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
exports.ttsV3BidirectionService = exports.volcengineTTSV3BidirectionService = exports.VolcengineTTSV3BidirectionService = void 0;
var ws_1 = __importDefault(require("ws"));
var crypto = __importStar(require("crypto"));
// ==================== 事件类型枚举 ====================
var Event;
(function (Event) {
    Event[Event["NONE"] = 0] = "NONE";
    Event[Event["START_CONNECTION"] = 1] = "START_CONNECTION";
    Event[Event["FINISH_CONNECTION"] = 2] = "FINISH_CONNECTION";
    Event[Event["CONNECTION_STARTED"] = 50] = "CONNECTION_STARTED";
    Event[Event["CONNECTION_FAILED"] = 51] = "CONNECTION_FAILED";
    Event[Event["CONNECTION_FINISHED"] = 52] = "CONNECTION_FINISHED";
    Event[Event["START_SESSION"] = 100] = "START_SESSION";
    Event[Event["FINISH_SESSION"] = 102] = "FINISH_SESSION";
    Event[Event["SESSION_STARTED"] = 150] = "SESSION_STARTED";
    Event[Event["SESSION_FINISHED"] = 152] = "SESSION_FINISHED";
    Event[Event["SESSION_FAILED"] = 153] = "SESSION_FAILED";
    Event[Event["TASK_REQUEST"] = 200] = "TASK_REQUEST";
    Event[Event["TTS_SENTENCE_START"] = 350] = "TTS_SENTENCE_START";
    Event[Event["TTS_SENTENCE_END"] = 351] = "TTS_SENTENCE_END";
    Event[Event["TTS_RESPONSE"] = 352] = "TTS_RESPONSE";
})(Event || (Event = {}));
// ==================== 协议帧构建类 ====================
var BidirectionProtocol = /** @class */ (function () {
    function BidirectionProtocol() {
    }
    /**
     * 构建START_CONNECTION帧
     */
    BidirectionProtocol.buildStartConnectionFrame = function () {
        var frame = Buffer.alloc(8);
        frame[0] = 17; // header: version=1, header_size=1*4=4
        frame[1] = 20; // message_type=1(full), flags=4(has event)
        frame[2] = 16; // serialization=1(JSON), compression=0
        frame[3] = 0; // reserved
        frame.writeUInt32BE(Event.START_CONNECTION, 4);
        var payload = Buffer.from('{}');
        var payloadSize = Buffer.alloc(4);
        payloadSize.writeUInt32BE(payload.length, 0);
        return Buffer.concat([frame, payloadSize, payload]);
    };
    /**
     * 构建START_SESSION帧
     */
    BidirectionProtocol.buildStartSessionFrame = function (sessionId, speaker, format, sampleRate, speedRatio, volumeRatio) {
        var payload = JSON.stringify({
            event: Event.START_SESSION,
            req_params: {
                speaker: speaker,
                audio_params: {
                    format: format,
                    sample_rate: sampleRate,
                    speed_ratio: speedRatio,
                    volume_ratio: volumeRatio
                }
            }
        });
        var frame = Buffer.alloc(8);
        frame[0] = 17;
        frame[1] = 20;
        frame[2] = 16;
        frame[3] = 0;
        frame.writeUInt32BE(Event.START_SESSION, 4);
        var sessionIdBuf = Buffer.from(sessionId, 'utf-8');
        var sessionIdLen = Buffer.alloc(4);
        sessionIdLen.writeUInt32BE(sessionIdBuf.length, 0);
        var payloadBuf = Buffer.from(payload, 'utf-8');
        var payloadLen = Buffer.alloc(4);
        payloadLen.writeUInt32BE(payloadBuf.length, 0);
        return Buffer.concat([frame, sessionIdLen, sessionIdBuf, payloadLen, payloadBuf]);
    };
    /**
     * 构建TASK_REQUEST帧
     */
    BidirectionProtocol.buildTaskRequestFrame = function (sessionId, text) {
        var payload = JSON.stringify({
            event: Event.TASK_REQUEST,
            req_params: {
                text: text
            }
        });
        var frame = Buffer.alloc(8);
        frame[0] = 17;
        frame[1] = 20;
        frame[2] = 16;
        frame[3] = 0;
        frame.writeUInt32BE(Event.TASK_REQUEST, 4);
        var sessionIdBuf = Buffer.from(sessionId, 'utf-8');
        var sessionIdLen = Buffer.alloc(4);
        sessionIdLen.writeUInt32BE(sessionIdBuf.length, 0);
        var payloadBuf = Buffer.from(payload, 'utf-8');
        var payloadLen = Buffer.alloc(4);
        payloadLen.writeUInt32BE(payloadBuf.length, 0);
        return Buffer.concat([frame, sessionIdLen, sessionIdBuf, payloadLen, payloadBuf]);
    };
    /**
     * 构建FINISH_SESSION帧
     */
    BidirectionProtocol.buildFinishSessionFrame = function (sessionId) {
        var frame = Buffer.alloc(8);
        frame[0] = 17;
        frame[1] = 20;
        frame[2] = 16;
        frame[3] = 0;
        frame.writeUInt32BE(Event.FINISH_SESSION, 4);
        var sessionIdBuf = Buffer.from(sessionId, 'utf-8');
        var sessionIdLen = Buffer.alloc(4);
        sessionIdLen.writeUInt32BE(sessionIdBuf.length, 0);
        var payloadBuf = Buffer.from('{}');
        var payloadLen = Buffer.alloc(4);
        payloadLen.writeUInt32BE(payloadBuf.length, 0);
        return Buffer.concat([frame, sessionIdLen, sessionIdBuf, payloadLen, payloadBuf]);
    };
    /**
     * 构建FINISH_CONNECTION帧
     */
    BidirectionProtocol.buildFinishConnectionFrame = function () {
        var frame = Buffer.alloc(8);
        frame[0] = 17;
        frame[1] = 20;
        frame[2] = 16;
        frame[3] = 0;
        frame.writeUInt32BE(Event.FINISH_CONNECTION, 4);
        var payloadBuf = Buffer.from('{}');
        var payloadLen = Buffer.alloc(4);
        payloadLen.writeUInt32BE(payloadBuf.length, 0);
        return Buffer.concat([frame, payloadLen, payloadBuf]);
    };
    /**
     * 解析响应帧
     */
    BidirectionProtocol.parseFrame = function (data) {
        if (data.length < 8) {
            throw new Error("\u6570\u636E\u592A\u77ED: ".concat(data.length, " bytes"));
        }
        var header = data.readUInt8(0);
        var headerSize = (header & 0x0F) * 4;
        var event = data.readUInt32BE(4);
        var offset = headerSize;
        // 读取session_id（如果有）
        var sessionId;
        var messageType = data.readUInt8(1) >> 4;
        if (messageType === 1 || messageType === 9 || messageType === 11) {
            if (offset + 4 <= data.length) {
                var sessionIdLen = data.readUInt32BE(offset);
                offset += 4;
                if (offset + sessionIdLen <= data.length) {
                    sessionId = data.toString('utf-8', offset, offset + sessionIdLen);
                    offset += sessionIdLen;
                }
            }
        }
        // 读取payload
        var payload = Buffer.alloc(0);
        if (offset + 4 <= data.length) {
            var payloadLen = data.readUInt32BE(offset);
            offset += 4;
            if (offset + payloadLen <= data.length) {
                payload = data.slice(offset, offset + payloadLen);
            }
        }
        return { event: event, sessionId: sessionId, payload: payload };
    };
    return BidirectionProtocol;
}());
// ==================== 服务类 ====================
var VolcengineTTSV3BidirectionService = /** @class */ (function () {
    function VolcengineTTSV3BidirectionService(config) {
        this.defaultWsUrl = 'wss://openspeech.bytedance.com/api/v3/tts/bidirection';
        this.defaultResourceId = 'volc.service_type.10029';
        this.defaultSpeaker = 'zh_female_cancan_mars_bigtts';
        this.config = __assign({ resourceId: this.defaultResourceId, wsUrl: this.defaultWsUrl }, config);
    }
    /**
     * 文本转语音
     */
    VolcengineTTSV3BidirectionService.prototype.textToSpeech = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var text, _a, speaker, _b, format, _c, sampleRate, _d, speedRatio, _e, volumeRatio;
            var _this = this;
            return __generator(this, function (_f) {
                text = request.text, _a = request.speaker, speaker = _a === void 0 ? this.defaultSpeaker : _a, _b = request.format, format = _b === void 0 ? 'mp3' : _b, _c = request.sampleRate, sampleRate = _c === void 0 ? 24000 : _c, _d = request.speedRatio, speedRatio = _d === void 0 ? 1.0 : _d, _e = request.volumeRatio, volumeRatio = _e === void 0 ? 1.0 : _e;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var sessionId = "session_".concat(Date.now());
                        var audioChunks = [];
                        var hasError = false;
                        console.log("\uD83D\uDD0A [TTS V3 Bidirection] \u5F00\u59CB\u5408\u6210: ".concat(text.substring(0, 50), "..."));
                        // 创建WebSocket连接
                        var ws = new ws_1["default"](_this.config.wsUrl, {
                            headers: {
                                'X-Api-App-Key': _this.config.appKey,
                                'X-Api-Access-Key': _this.config.accessKey,
                                'X-Api-Resource-Id': _this.config.resourceId,
                                'X-Api-Request-Id': crypto.randomUUID()
                            }
                        });
                        // 超时处理
                        var timeout = setTimeout(function () {
                            if (!hasError) {
                                hasError = true;
                                ws.close();
                                reject(new Error('TTS请求超时（30秒）'));
                            }
                        }, 30000);
                        // 连接成功
                        ws.on('open', function () {
                            console.log("\uD83D\uDD17 [TTS V3 Bidirection] WebSocket\u8FDE\u63A5\u6210\u529F");
                            // 步骤1: 发送START_CONNECTION
                            var startConnFrame = BidirectionProtocol.buildStartConnectionFrame();
                            ws.send(startConnFrame);
                        });
                        // 接收消息
                        ws.on('message', function (data) {
                            var event = data.readUInt32BE(4);
                            console.log("\uD83D\uDCE8 [TTS V3] \u6536\u5230\u4E8B\u4EF6: ".concat(event));
                            if (event === Event.TTS_RESPONSE) {
                                // TTS_RESPONSE是音频数据，直接提取
                                var header = data.readUInt8(0);
                                var headerSize = (header & 0x0F) * 4;
                                var offset = headerSize;
                                // 跳过session_id
                                var sessionIdLen = data.readUInt32BE(offset);
                                offset += 4 + sessionIdLen;
                                // 读取音频数据
                                var audioLen = data.readUInt32BE(offset);
                                offset += 4;
                                var audioData = data.slice(offset, offset + audioLen);
                                console.log("\uD83C\uDFB5 [TTS V3] \u6536\u5230\u97F3\u9891\u6570\u636E: ".concat(audioData.length, " bytes, \u603B\u8BA1: ").concat(audioChunks.length + 1, " \u5757"));
                                audioChunks.push(audioData);
                                return;
                            }
                            // 其他事件使用parseFrame解析
                            var frame = BidirectionProtocol.parseFrame(data);
                            if (frame.event === Event.CONNECTION_STARTED) {
                                // 步骤2: 发送START_SESSION
                                var startSessFrame = BidirectionProtocol.buildStartSessionFrame(sessionId, speaker, format, sampleRate, speedRatio, volumeRatio);
                                ws.send(startSessFrame);
                            }
                            else if (frame.event === Event.SESSION_STARTED) {
                                // 步骤3: 发送TASK_REQUEST
                                var taskFrame = BidirectionProtocol.buildTaskRequestFrame(sessionId, text);
                                ws.send(taskFrame);
                            }
                            else if (frame.event === Event.TTS_SENTENCE_END) {
                                // 步骤4: 发送FINISH_SESSION
                                var finishSessFrame = BidirectionProtocol.buildFinishSessionFrame(sessionId);
                                ws.send(finishSessFrame);
                            }
                            else if (frame.event === Event.SESSION_FINISHED) {
                                // 步骤5: 发送FINISH_CONNECTION
                                var finishConnFrame = BidirectionProtocol.buildFinishConnectionFrame();
                                ws.send(finishConnFrame);
                            }
                            else if (frame.event === Event.CONNECTION_FINISHED) {
                                // 完成
                                clearTimeout(timeout);
                                ws.close();
                            }
                            else if (frame.event === Event.SESSION_FAILED || frame.event === Event.CONNECTION_FAILED) {
                                hasError = true;
                                clearTimeout(timeout);
                                ws.close();
                                reject(new Error("TTS\u5931\u8D25: ".concat(frame.payload.toString())));
                            }
                        });
                        // 连接关闭
                        ws.on('close', function () {
                            clearTimeout(timeout);
                            console.log("\uD83D\uDD0C [TTS V3 Bidirection] WebSocket\u8FDE\u63A5\u5173\u95ED, audioChunks\u6570\u91CF: ".concat(audioChunks.length));
                            if (!hasError) {
                                if (audioChunks.length > 0) {
                                    var audioBuffer = Buffer.concat(audioChunks);
                                    console.log("\u2705 [TTS V3 Bidirection] \u5408\u6210\u6210\u529F: ".concat(audioBuffer.length, " bytes (\u6765\u81EA ").concat(audioChunks.length, " \u5757)"));
                                    resolve({
                                        audioBuffer: audioBuffer,
                                        format: format
                                    });
                                }
                                else {
                                    console.error("\u274C [TTS V3 Bidirection] \u672A\u6536\u5230\u97F3\u9891\u6570\u636E");
                                    reject(new Error('未收到音频数据'));
                                }
                            }
                        });
                        // 错误处理
                        ws.on('error', function (error) {
                            hasError = true;
                            clearTimeout(timeout);
                            console.error("\u274C [TTS V3 Bidirection] WebSocket\u9519\u8BEF:", error.message);
                            reject(new Error("WebSocket\u9519\u8BEF: ".concat(error.message)));
                        });
                    })];
            });
        });
    };
    /**
     * 批量文本转语音
     */
    VolcengineTTSV3BidirectionService.prototype.batchTextToSpeech = function (texts, options) {
        return __awaiter(this, void 0, void 0, function () {
            var results, i, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDD0A [TTS V3 Bidirection] \u6279\u91CF\u5408\u6210: ".concat(texts.length, " \u6761\u6587\u672C"));
                        results = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < texts.length)) return [3 /*break*/, 6];
                        console.log("\uD83D\uDCDD [TTS V3 Bidirection] \u5904\u7406 ".concat(i + 1, "/").concat(texts.length));
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.textToSpeech(__assign({ text: texts[i] }, options))];
                    case 3:
                        result = _a.sent();
                        results.push(result);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error("\u274C [TTS V3 Bidirection] \u7B2C ".concat(i + 1, " \u6761\u5931\u8D25:"), error_1.message);
                        throw error_1;
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6:
                        console.log("\u2705 [TTS V3 Bidirection] \u6279\u91CF\u5408\u6210\u5B8C\u6210: ".concat(results.length, " \u6761"));
                        return [2 /*return*/, results];
                }
            });
        });
    };
    return VolcengineTTSV3BidirectionService;
}());
exports.VolcengineTTSV3BidirectionService = VolcengineTTSV3BidirectionService;
// 创建默认实例
exports.volcengineTTSV3BidirectionService = new VolcengineTTSV3BidirectionService({
    appKey: '7563592522',
    accessKey: 'jq3vA4Ep5EsN-FU4mKizV6ePioXR3Ol3',
    resourceId: 'volc.service_type.10029',
    wsUrl: 'wss://openspeech.bytedance.com/api/v3/tts/bidirection'
});
// 导出别名
exports.ttsV3BidirectionService = exports.volcengineTTSV3BidirectionService;
exports["default"] = exports.volcengineTTSV3BidirectionService;
