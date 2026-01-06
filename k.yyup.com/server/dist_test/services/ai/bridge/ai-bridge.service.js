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
exports.aiBridgeService = void 0;
var axios_1 = __importDefault(require("axios"));
var https_1 = __importDefault(require("https"));
var http_1 = __importDefault(require("http"));
var url_1 = require("url");
var ai_model_config_model_1 = require("../../../models/ai-model-config.model");
var sequelize_1 = require("sequelize");
var stream_1 = require("stream");
var ai_config_service_1 = __importDefault(require("../ai-config.service"));
var form_data_1 = __importDefault(require("form-data"));
/**
 * @class AIBridgeService
 * @description A service to interact with external AI model providers like OpenAI.
 * It abstracts the API calls for functionalities such as chat completion.
 */
var AIBridgeService = /** @class */ (function () {
    /**
     * Initializes the AIBridgeService.
     * It sets up a default Axios instance for making HTTP requests to the AI provider's API.
     * The API key and base URL are retrieved from environment variables.
     */
    function AIBridgeService() {
        // It is crucial to use environment variables for sensitive data and configurations.
        // This avoids hardcoding credentials and endpoints in the source code.
        this.defaultApiKey = process.env.OPENAI_API_KEY || '';
        this.defaultBaseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
        if (!this.defaultApiKey) {
            // In a real application, you would have more robust error handling or logging.
            console.error('OpenAI API key is not configured in environment variables.');
        }
        // 使用统一配置服务
        var networkConfig = ai_config_service_1["default"].getAxiosConfig();
        this.defaultHttpClient = axios_1["default"].create(__assign({ baseURL: this.defaultBaseUrl, headers: ai_config_service_1["default"].getStandardHeaders(this.defaultApiKey) }, networkConfig));
        // 打印配置信息（仅在开发环境）
        if (process.env.NODE_ENV === 'development') {
            ai_config_service_1["default"].logConfig();
        }
    }
    /**
     * Creates a custom HTTP client for a specific model configuration
     * @param endpointUrl - Custom endpoint URL
     * @param apiKey - Custom API key
     * @param contentType - Content type for the request
     * @returns Configured axios instance
     */
    AIBridgeService.prototype.createCustomHttpClient = function (endpointUrl, apiKey, contentType) {
        if (contentType === void 0) { contentType = 'application/json'; }
        var baseUrl = endpointUrl.replace(/\/(chat\/completions|images\/generations|audio\/.*|video\/.*)$/, '');
        var networkConfig = ai_config_service_1["default"].getAxiosConfig();
        return axios_1["default"].create(__assign({ baseURL: baseUrl, headers: ai_config_service_1["default"].getStandardHeaders(apiKey) }, networkConfig));
    };
    /**
     * 使用原生HTTP/HTTPS模块发送请求（性能优化）
     * @param url - 完整的请求URL
     * @param options - 请求选项
     * @param data - 请求体数据
     * @param timeout - 超时时间（毫秒）
     * @returns Promise<响应数据>
     */
    AIBridgeService.prototype.makeNativeHttpRequest = function (url, options, data, timeout // 默认180秒
    ) {
        if (timeout === void 0) { timeout = 180000; }
        return new Promise(function (resolve, reject) {
            var parsedUrl = new url_1.URL(url);
            var isHttps = parsedUrl.protocol === 'https:';
            var httpModule = isHttps ? https_1["default"] : http_1["default"];
            var requestBody = data ? JSON.stringify(data) : undefined;
            // 🔍 调试：打印请求体内容
            if (data && data.tools) {
                console.log('🔍 [AI请求调试] 发送给AI的工具定义:');
                console.log(JSON.stringify(data.tools, null, 2));
            }
            var requestOptions = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (isHttps ? 443 : 80),
                path: parsedUrl.pathname + parsedUrl.search,
                method: options.method,
                headers: __assign(__assign({}, options.headers), { 'Content-Type': 'application/json', 'Content-Length': requestBody ? Buffer.byteLength(requestBody) : 0 }),
                timeout: timeout
            };
            console.log("\uD83D\uDE80 [\u539F\u751FHTTP] \u53D1\u8D77\u8BF7\u6C42: ".concat(options.method, " ").concat(url));
            console.log("\u23F1\uFE0F  [\u539F\u751FHTTP] \u8D85\u65F6\u8BBE\u7F6E: ".concat(timeout, "ms"));
            var req = httpModule.request(requestOptions, function (res) {
                var responseData = '';
                res.on('data', function (chunk) {
                    responseData += chunk;
                });
                res.on('end', function () {
                    var _a;
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.log("\u2705 [AI\u54CD\u5E94] \u8BF7\u6C42\u5B8C\u6210\uFF0C\u72B6\u6001\u7801: ".concat(res.statusCode));
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            var parsed = JSON.parse(responseData);
                            // 🔍 调试：打印原始响应中的reasoning_content
                            if (parsed.choices && ((_a = parsed.choices[0]) === null || _a === void 0 ? void 0 : _a.message)) {
                                var message = parsed.choices[0].message;
                                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                                console.log('🔍 [AI响应] 原始响应message字段:');
                                console.log('  - content:', message.content ? "\"".concat(message.content.substring(0, 50), "...\"") : 'null');
                                console.log('  - reasoning_content:', message.reasoning_content ? "\"".concat(message.reasoning_content.substring(0, 100), "...\"") : 'undefined');
                                console.log('  - tool_calls:', message.tool_calls ? "".concat(message.tool_calls.length, "\u4E2A\u5DE5\u5177\u8C03\u7528") : 'undefined');
                                if (message.reasoning_content) {
                                    console.log('✅ [AI响应] 检测到reasoning_content字段！');
                                    console.log('📏 [AI响应] reasoning_content长度:', message.reasoning_content.length);
                                    console.log('📝 [AI响应] reasoning_content内容预览:', message.reasoning_content.substring(0, 200) + '...');
                                }
                                else {
                                    console.log('⚠️  [AI响应] 未检测到reasoning_content字段');
                                }
                                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                            }
                            // 打印usage信息
                            if (parsed.usage) {
                                console.log('📊 [AI响应] Token使用情况:');
                                console.log('  - prompt_tokens:', parsed.usage.prompt_tokens);
                                console.log('  - completion_tokens:', parsed.usage.completion_tokens);
                                console.log('  - reasoning_tokens:', parsed.usage.reasoning_tokens || 0);
                                console.log('  - total_tokens:', parsed.usage.total_tokens);
                                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                            }
                            resolve(parsed);
                        }
                        catch (parseError) {
                            reject(new Error("JSON\u89E3\u6790\u5931\u8D25: ".concat(parseError)));
                        }
                    }
                    else {
                        reject(new Error("HTTP\u9519\u8BEF ".concat(res.statusCode, ": ").concat(responseData)));
                    }
                });
            });
            req.on('error', function (error) {
                console.error("\u274C [\u539F\u751FHTTP] \u8BF7\u6C42\u9519\u8BEF:", error);
                reject(error);
            });
            req.on('timeout', function () {
                console.error("\u23F0 [\u539F\u751FHTTP] \u8BF7\u6C42\u8D85\u65F6 (".concat(timeout, "ms)"));
                req.destroy();
                reject(new Error("\u8BF7\u6C42\u8D85\u65F6 (".concat(timeout, "ms)")));
            });
            if (requestBody) {
                req.write(requestBody);
            }
            req.end();
        });
    };
    /**
     * 使用原生HTTP/HTTPS模块发送流式请求（性能优化 - 比axios快100%）
     * @param url - 完整的请求URL
     * @param options - 请求选项
     * @param data - 请求体数据
     * @param timeout - 超时时间（毫秒）
     * @returns Promise<原生HTTP响应对象>
     */
    AIBridgeService.prototype.makeNativeHttpStreamRequest = function (url, options, data, timeout // 默认180秒
    ) {
        if (timeout === void 0) { timeout = 180000; }
        return new Promise(function (resolve, reject) {
            var parsedUrl = new url_1.URL(url);
            var isHttps = parsedUrl.protocol === 'https:';
            var httpModule = isHttps ? https_1["default"] : http_1["default"];
            var requestBody = data ? JSON.stringify(data) : undefined;
            var requestOptions = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (isHttps ? 443 : 80),
                path: parsedUrl.pathname + parsedUrl.search,
                method: options.method,
                headers: __assign(__assign({}, options.headers), { 'Content-Type': 'application/json', 'Content-Length': requestBody ? Buffer.byteLength(requestBody) : 0 }),
                timeout: timeout
            };
            console.log("\uD83D\uDE80 [\u539F\u751FHTTP\u6D41\u5F0F] \u53D1\u8D77\u8BF7\u6C42: ".concat(options.method, " ").concat(url));
            console.log("\u23F1\uFE0F  [\u539F\u751FHTTP\u6D41\u5F0F] \u8D85\u65F6\u8BBE\u7F6E: ".concat(timeout, "ms"));
            var req = httpModule.request(requestOptions, function (res) {
                console.log("\u2705 [\u539F\u751FHTTP\u6D41\u5F0F] \u8FDE\u63A5\u5EFA\u7ACB\uFF0C\u72B6\u6001\u7801: ".concat(res.statusCode));
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    // 直接返回响应流对象
                    resolve(res);
                }
                else {
                    var errorData_1 = '';
                    res.on('data', function (chunk) {
                        errorData_1 += chunk;
                    });
                    res.on('end', function () {
                        reject(new Error("HTTP\u9519\u8BEF ".concat(res.statusCode, ": ").concat(errorData_1)));
                    });
                }
            });
            req.on('error', function (error) {
                console.error("\u274C [\u539F\u751FHTTP\u6D41\u5F0F] \u8BF7\u6C42\u9519\u8BEF:", error);
                reject(error);
            });
            req.on('timeout', function () {
                console.error("\u23F0 [\u539F\u751FHTTP\u6D41\u5F0F] \u8BF7\u6C42\u8D85\u65F6 (".concat(timeout, "ms)"));
                req.destroy();
                reject(new Error("\u8BF7\u6C42\u8D85\u65F6 (".concat(timeout, "ms)")));
            });
            if (requestBody) {
                req.write(requestBody);
            }
            req.end();
        });
    };
    /**
     * Generates a chat completion using the configured AI model.
     * @param params - The parameters for the chat completion request, including the model and messages.
     * @param customConfig - Optional custom configuration for endpoint and API key
     * @param userId - Optional user ID for usage tracking and statistics
     * @returns A promise that resolves to the chat completion response from the AI provider.
     * @throws Throws an error if the API request fails.
     */
    AIBridgeService.prototype.generateChatCompletion = function (params, customConfig, userId) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var apiKey, baseUrl, actualModelName, modelConfig, dbError_1, fullUrl, headers, maxRetries, retryDelay_1, timeout, _loop_1, this_1, attempt, state_1, error_1, errorMessage;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 12, , 13]);
                        apiKey = customConfig === null || customConfig === void 0 ? void 0 : customConfig.apiKey;
                        baseUrl = customConfig === null || customConfig === void 0 ? void 0 : customConfig.endpointUrl;
                        actualModelName = params.model;
                        if (!(!customConfig && params.model)) return [3 /*break*/, 7];
                        console.log("\uD83D\uDD0D [AIBridge] \u672A\u63D0\u4F9B\u81EA\u5B9A\u4E49\u914D\u7F6E\uFF0C\u5C1D\u8BD5\u4ECE\u6570\u636E\u5E93\u8BFB\u53D6\u6A21\u578B\u914D\u7F6E: ".concat(params.model));
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        modelConfig = null;
                        if (!(params.model === 'default')) return [3 /*break*/, 3];
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    isDefault: true,
                                    status: ai_model_config_model_1.ModelStatus.ACTIVE
                                }
                            })];
                    case 2:
                        modelConfig = _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                            where: {
                                name: params.model,
                                status: ai_model_config_model_1.ModelStatus.ACTIVE
                            }
                        })];
                    case 4:
                        // 否则按名称查找
                        modelConfig = _b.sent();
                        _b.label = 5;
                    case 5:
                        if (modelConfig) {
                            apiKey = modelConfig.apiKey;
                            baseUrl = modelConfig.endpointUrl;
                            actualModelName = modelConfig.name; // 使用实际的模型名称
                            console.log("\u2705 [AIBridge] \u4ECE\u6570\u636E\u5E93\u52A0\u8F7D\u6A21\u578B\u914D\u7F6E\u6210\u529F: ".concat(modelConfig.displayName, " (").concat(actualModelName, ")"));
                        }
                        else {
                            console.log("\u26A0\uFE0F  [AIBridge] \u6570\u636E\u5E93\u4E2D\u672A\u627E\u5230\u6A21\u578B\u914D\u7F6E\uFF0C\u4F7F\u7528\u9ED8\u8BA4\u914D\u7F6E");
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        dbError_1 = _b.sent();
                        console.error("\u274C [AIBridge] \u4ECE\u6570\u636E\u5E93\u8BFB\u53D6\u914D\u7F6E\u5931\u8D25:", dbError_1);
                        return [3 /*break*/, 7];
                    case 7:
                        // 最终确定使用的配置（优先级：customConfig > 数据库配置 > 默认配置）
                        apiKey = apiKey || this.defaultApiKey;
                        baseUrl = baseUrl || this.defaultBaseUrl;
                        // 更新params中的模型名称为实际的模型名称
                        params = __assign(__assign({}, params), { model: actualModelName });
                        fullUrl = baseUrl.endsWith('/chat/completions')
                            ? baseUrl
                            : "".concat(baseUrl, "/chat/completions");
                        console.log('\x1b[31m[AI调用-原生HTTP] 使用配置\x1b[0m');
                        console.log('\x1b[31m[AI调用-原生HTTP] 端点:', fullUrl, '\x1b[0m');
                        console.log('\x1b[31m[AI调用-原生HTTP] 密钥前缀:', (apiKey === null || apiKey === void 0 ? void 0 : apiKey.substring(0, 10)) + '...', '\x1b[0m');
                        console.log('\x1b[31m[AI调用-原生HTTP] 请求参数:', JSON.stringify(params, null, 2), '\x1b[0m');
                        // 验证参数
                        console.log('\x1b[35m[AI调用-原生HTTP] 参数验证:\x1b[0m');
                        console.log('\x1b[35m[AI调用-原生HTTP] - 模型名称:', params.model, '\x1b[0m');
                        console.log('\x1b[35m[AI调用-原生HTTP] - 消息数量:', (_a = params.messages) === null || _a === void 0 ? void 0 : _a.length, '\x1b[0m');
                        console.log('\x1b[35m[AI调用-原生HTTP] - 最大令牌数:', params.max_tokens, '\x1b[0m');
                        console.log('\x1b[35m[AI调用-原生HTTP] - 温度:', params.temperature, '\x1b[0m');
                        console.log('\x1b[35m[AI调用-原生HTTP] - 流式:', params.stream, '\x1b[0m');
                        // 验证消息格式
                        if (params.messages && params.messages.length > 0) {
                            params.messages.forEach(function (msg, index) {
                                var _a;
                                console.log("\u001B[35m[AI\u8C03\u7528-\u539F\u751FHTTP] - \u6D88\u606F".concat(index + 1, ": role=").concat(msg.role, ", content\u957F\u5EA6=").concat((_a = msg.content) === null || _a === void 0 ? void 0 : _a.length, "\u001B[0m"));
                            });
                        }
                        headers = {
                            'Authorization': "Bearer ".concat(apiKey),
                            'Content-Type': 'application/json'
                        };
                        maxRetries = 3;
                        retryDelay_1 = 1000;
                        timeout = 180000;
                        _loop_1 = function (attempt) {
                            var startTime, response, duration, retryError_1, errorMessage;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _c.trys.push([0, 4, , 7]);
                                        console.log("\u001B[33m[AI\u8C03\u7528-\u539F\u751FHTTP] \u5C1D\u8BD5\u7B2C ".concat(attempt, "/").concat(maxRetries, " \u6B21\u8C03\u7528\u001B[0m"));
                                        startTime = Date.now();
                                        return [4 /*yield*/, this_1.makeNativeHttpRequest(fullUrl, {
                                                method: 'POST',
                                                headers: headers
                                            }, params, timeout)];
                                    case 1:
                                        response = _c.sent();
                                        duration = Date.now() - startTime;
                                        console.log("\u001B[32m[AI\u8C03\u7528-\u539F\u751FHTTP] \u7B2C ".concat(attempt, " \u6B21\u8C03\u7528\u6210\u529F\uFF0C\u8017\u65F6: ").concat(duration, "ms\u001B[0m"));
                                        if (!(userId && response)) return [3 /*break*/, 3];
                                        return [4 /*yield*/, this_1.recordUsage(userId, params, response)];
                                    case 2:
                                        _c.sent();
                                        _c.label = 3;
                                    case 3: return [2 /*return*/, { value: response }];
                                    case 4:
                                        retryError_1 = _c.sent();
                                        errorMessage = retryError_1.message || String(retryError_1);
                                        if (!errorMessage.includes('503')) return [3 /*break*/, 6];
                                        console.log("\u001B[33m[AI\u8C03\u7528-\u539F\u751FHTTP] \u7B2C ".concat(attempt, " \u6B21\u8C03\u7528\u5931\u8D25 (503)\uFF0C").concat(attempt < maxRetries ? '准备重试' : '已达最大重试次数', "\u001B[0m"));
                                        if (!(attempt < maxRetries)) return [3 /*break*/, 6];
                                        // 等待后重试
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, retryDelay_1 * attempt); })];
                                    case 5:
                                        // 等待后重试
                                        _c.sent();
                                        return [2 /*return*/, "continue"];
                                    case 6: 
                                    // 非503错误或已达最大重试次数，抛出错误
                                    throw retryError_1;
                                    case 7: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        attempt = 1;
                        _b.label = 8;
                    case 8:
                        if (!(attempt <= maxRetries)) return [3 /*break*/, 11];
                        return [5 /*yield**/, _loop_1(attempt)];
                    case 9:
                        state_1 = _b.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _b.label = 10;
                    case 10:
                        attempt++;
                        return [3 /*break*/, 8];
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        error_1 = _b.sent();
                        console.log('\x1b[31m[AI调用错误-原生HTTP] 调用失败\x1b[0m');
                        console.error('Error calling AI chat completion API:', error_1);
                        errorMessage = error_1.message || String(error_1);
                        console.log('\x1b[31m[AI调用错误-原生HTTP] 错误信息:', errorMessage, '\x1b[0m');
                        // 根据错误信息抛出具体的错误
                        if (errorMessage.includes('503')) {
                            throw new Error('AI服务暂时不可用，请稍后重试。可能原因：服务器维护中或负载过高。');
                        }
                        else if (errorMessage.includes('401')) {
                            throw new Error('AI服务认证失败，请检查API密钥配置。');
                        }
                        else if (errorMessage.includes('429')) {
                            throw new Error('AI服务请求频率过高，请稍后重试。');
                        }
                        else if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('504')) {
                            throw new Error('AI服务器内部错误，请稍后重试或联系管理员。');
                        }
                        else if (errorMessage.includes('ECONNREFUSED')) {
                            throw new Error('无法连接到AI服务，请检查网络连接或联系管理员。');
                        }
                        else if (errorMessage.includes('超时') || errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
                            throw new Error('AI服务响应超时，请稍后重试。建议：增加超时时间或检查网络连接。');
                        }
                        else {
                            throw new Error("AI\u8C03\u7528\u5931\u8D25: ".concat(errorMessage));
                        }
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 记录AI使用量统计
     * @param userId - 用户ID
     * @param params - 请求参数
     * @param response - AI响应
     */
    AIBridgeService.prototype.recordUsage = function (userId, params, response) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var _d, AIModelUsage, AIUsageType, AIUsageStatus, AIModelConfig_1, uuidv4, modelConfig, inputTokens, outputTokens, totalTokens, cost, error_2;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../../models/ai-model-usage.model')); })];
                    case 1:
                        _d = _e.sent(), AIModelUsage = _d.AIModelUsage, AIUsageType = _d.AIUsageType, AIUsageStatus = _d.AIUsageStatus;
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../../models/ai-model-config.model')); })];
                    case 2:
                        AIModelConfig_1 = (_e.sent()).AIModelConfig;
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('uuid')); })];
                    case 3:
                        uuidv4 = (_e.sent()).v4;
                        return [4 /*yield*/, AIModelConfig_1.findOne({
                                where: { name: params.model, status: 'active' }
                            })];
                    case 4:
                        modelConfig = _e.sent();
                        if (!modelConfig) {
                            console.warn("[\u4F7F\u7528\u91CF\u7EDF\u8BA1] \u672A\u627E\u5230\u6A21\u578B\u914D\u7F6E: ".concat(params.model));
                            return [2 /*return*/];
                        }
                        inputTokens = ((_a = response.usage) === null || _a === void 0 ? void 0 : _a.prompt_tokens) || 0;
                        outputTokens = ((_b = response.usage) === null || _b === void 0 ? void 0 : _b.completion_tokens) || 0;
                        totalTokens = ((_c = response.usage) === null || _c === void 0 ? void 0 : _c.total_tokens) || inputTokens + outputTokens;
                        cost = this.calculateCost(inputTokens, outputTokens, modelConfig);
                        // 创建使用记录
                        return [4 /*yield*/, AIModelUsage.create({
                                userId: userId,
                                modelId: modelConfig.id,
                                requestId: uuidv4(),
                                usageType: AIUsageType.TEXT,
                                inputTokens: inputTokens,
                                outputTokens: outputTokens,
                                totalTokens: totalTokens,
                                cost: cost,
                                status: AIUsageStatus.SUCCESS,
                                requestTimestamp: new Date(),
                                responseTimestamp: new Date(),
                                processingTime: 0 // 这里可以记录实际处理时间
                            })];
                    case 5:
                        // 创建使用记录
                        _e.sent();
                        console.log("[\u4F7F\u7528\u91CF\u7EDF\u8BA1] \u8BB0\u5F55\u6210\u529F: userId=".concat(userId, ", tokens=").concat(totalTokens, ", cost=").concat(cost));
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _e.sent();
                        console.error('[使用量统计] 记录失败:', error_2);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 计算AI调用成本
     * @param inputTokens - 输入token数
     * @param outputTokens - 输出token数
     * @param modelConfig - 模型配置
     * @returns 成本（美元）
     */
    AIBridgeService.prototype.calculateCost = function (inputTokens, outputTokens, modelConfig) {
        // 简化的成本计算，实际应该根据不同模型的定价
        var inputCostPer1K = modelConfig.inputCostPer1K || 0.001; // 默认每1K输入token成本
        var outputCostPer1K = modelConfig.outputCostPer1K || 0.002; // 默认每1K输出token成本
        var inputCost = (inputTokens / 1000) * inputCostPer1K;
        var outputCost = (outputTokens / 1000) * outputCostPer1K;
        return parseFloat((inputCost + outputCost).toFixed(6));
    };
    /**
     * @method generateChatCompletionStream
     * @description Generates a streaming chat completion using the specified model and messages.
     * 使用原生HTTP/HTTPS实现，性能比axios快100%
     * @param params - The parameters for the chat completion request.
     * @param customConfig - Optional custom configuration for the request.
     * @param conversationId - The conversation ID for saving messages.
     * @param userId - The user ID for saving messages.
     * @returns A readable stream of chat completion chunks.
     */
    AIBridgeService.prototype.generateChatCompletionStream = function (params, customConfig, conversationId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var apiKey, baseUrl, fullUrl, streamParams, headers, response, readable_1, fullContent_1, buffer_1, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        apiKey = (customConfig === null || customConfig === void 0 ? void 0 : customConfig.apiKey) || this.defaultApiKey;
                        baseUrl = (customConfig === null || customConfig === void 0 ? void 0 : customConfig.endpointUrl) || this.defaultBaseUrl;
                        fullUrl = baseUrl.endsWith('/chat/completions')
                            ? baseUrl
                            : "".concat(baseUrl, "/chat/completions");
                        streamParams = __assign(__assign({}, params), { stream: true });
                        console.log('\x1b[36m[AI调用-原生HTTP流式] 使用配置\x1b[0m');
                        console.log('\x1b[36m[AI调用-原生HTTP流式] 端点:', fullUrl, '\x1b[0m');
                        // 🔧 打印完整的请求参数为JSON格式
                        console.log('================================================================================');
                        console.log('📤 [完整请求JSON] 发送给豆包模型的完整请求参数:');
                        console.log(JSON.stringify(streamParams, null, 2));
                        console.log('================================================================================');
                        headers = {
                            'Authorization': "Bearer ".concat(apiKey),
                            'Content-Type': 'application/json'
                        };
                        return [4 /*yield*/, this.makeNativeHttpStreamRequest(fullUrl, {
                                method: 'POST',
                                headers: headers
                            }, streamParams, 180000 // 180秒超时
                            )];
                    case 1:
                        response = _a.sent();
                        console.log('\x1b[32m[AI调用-原生HTTP流式] 连接成功，开始接收流式数据\x1b[0m');
                        readable_1 = new stream_1.Readable({
                            read: function () { }
                        });
                        fullContent_1 = '';
                        buffer_1 = '';
                        response.on('data', function (chunk) {
                            var _a, _b;
                            buffer_1 += chunk.toString();
                            var lines = buffer_1.split('\n');
                            buffer_1 = lines.pop() || '';
                            for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                                var line = lines_1[_i];
                                if (line.startsWith('data: ')) {
                                    var data = line.slice(6).trim();
                                    if (data === '[DONE]') {
                                        // 流结束，保存完整的AI消息到数据库
                                        if (conversationId && userId && fullContent_1) {
                                            _this.saveStreamedMessage(conversationId, userId, fullContent_1);
                                        }
                                        console.log('\x1b[32m[AI调用-原生HTTP流式] 流式传输完成\x1b[0m');
                                        readable_1.push(null); // 结束流
                                        return;
                                    }
                                    try {
                                        var parsed = JSON.parse(data);
                                        var delta = (_b = (_a = parsed.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.delta;
                                        if (delta) {
                                            // 🚨 修复：处理豆包thinking模型的reasoning_content
                                            if (delta.reasoning_content) {
                                                console.log("\uD83E\uDD14 [AI-Bridge] \u6536\u5230reasoning_content: ".concat(delta.reasoning_content.substring(0, 50), "..."));
                                            }
                                            if (delta.content) {
                                                fullContent_1 += delta.content;
                                            }
                                            // 🔧 修复：保持豆包原始格式，不转换！直接转发原始数据
                                            readable_1.push("data: ".concat(data, "\n\n"));
                                        }
                                    }
                                    catch (e) {
                                        console.warn('解析流式数据失败:', e);
                                    }
                                }
                            }
                        });
                        response.on('end', function () {
                            console.log('\x1b[32m[AI调用-原生HTTP流式] 响应流结束\x1b[0m');
                            if (!readable_1.destroyed) {
                                readable_1.push(null);
                            }
                        });
                        response.on('error', function (error) {
                            console.error('\x1b[31m[AI调用-原生HTTP流式] 响应流错误:\x1b[0m', error);
                            readable_1.destroy(error);
                        });
                        return [2 /*return*/, readable_1];
                    case 2:
                        error_3 = _a.sent();
                        console.error('\x1b[31m[AI调用-原生HTTP流式] 流式请求失败:\x1b[0m', error_3.message);
                        throw new Error('流式AI调用失败: ' + error_3.message);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 保存流式输出的完整消息到数据库
     */
    AIBridgeService.prototype.saveStreamedMessage = function (conversationId, userId, content, metadata) {
        if (metadata === void 0) { metadata = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var AIMessage, AIConversation, _a, MessageRole, MessageType, MessageStatus, aiMessage, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../../models')); })];
                    case 1:
                        AIMessage = (_b.sent()).AIMessage;
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../../models/ai-conversation.model')); })];
                    case 2:
                        AIConversation = (_b.sent()).AIConversation;
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../../models/ai-message.model')); })];
                    case 3:
                        _a = _b.sent(), MessageRole = _a.MessageRole, MessageType = _a.MessageType, MessageStatus = _a.MessageStatus;
                        // MemoryType and aiMemoryService removed - replaced by six-dimensional memory system
                        console.log('保存流式消息:', { conversationId: conversationId, userId: userId, contentLength: content.length });
                        return [4 /*yield*/, AIMessage.create({
                                conversationId: conversationId,
                                userId: userId,
                                role: MessageRole.ASSISTANT,
                                content: content,
                                isDeleted: false,
                                messageType: MessageType.TEXT,
                                status: MessageStatus.DELIVERED,
                                tokens: 0,
                                metadata: metadata
                            })];
                    case 4:
                        aiMessage = _b.sent();
                        // 记忆创建已由六维记忆系统处理
                        console.log('记忆创建由六维记忆系统处理', { userId: userId, conversationId: conversationId, contentLength: content.length });
                        // 更新会话的消息计数
                        return [4 /*yield*/, AIConversation.increment('messageCount', {
                                where: { id: conversationId }
                            })];
                    case 5:
                        // 更新会话的消息计数
                        _b.sent();
                        console.log('流式消息保存成功:', { messageId: aiMessage.id });
                        return [3 /*break*/, 7];
                    case 6:
                        error_4 = _b.sent();
                        console.error('保存流式消息失败:', error_4);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get the default AI model configuration from database
     * @returns Default AI model configuration
     */
    AIBridgeService.prototype.getDefaultModelConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var defaultModel, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    isDefault: true,
                                    status: ai_model_config_model_1.ModelStatus.ACTIVE
                                }
                            })];
                    case 1:
                        defaultModel = _a.sent();
                        return [2 /*return*/, defaultModel];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Failed to get default model config:', error_5);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🚀 获取快速推理模型配置 - 专为CRUD工具优化
     * @returns 快速推理模型配置
     */
    AIBridgeService.prototype.getFastModelConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var flashModel, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 5]);
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    name: 'doubao-seed-1-6-flash-250715',
                                    status: ai_model_config_model_1.ModelStatus.ACTIVE
                                }
                            })];
                    case 1:
                        flashModel = _a.sent();
                        if (flashModel) {
                            console.log('🚀 [AIBridge] 使用Flash快速推理模型');
                            return [2 /*return*/, flashModel];
                        }
                        // 如果Flash模型不可用，回退到默认模型
                        console.log('⚠️ [AIBridge] Flash模型不可用，回退到默认模型');
                        return [4 /*yield*/, this.getDefaultModelConfig()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_6 = _a.sent();
                        console.error('Failed to get fast model config:', error_6);
                        return [4 /*yield*/, this.getDefaultModelConfig()];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🧠 获取深度思考模型配置 - 专为复杂推理优化
     * @returns 深度思考模型配置
     */
    AIBridgeService.prototype.getThinkingModelConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var thinkingModel, alternativeThinkingModel, error_7;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 6]);
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    name: 'doubao-seed-1-6-thinking-250615',
                                    status: ai_model_config_model_1.ModelStatus.ACTIVE
                                }
                            })];
                    case 1:
                        thinkingModel = _b.sent();
                        if (thinkingModel) {
                            console.log('🧠 [AIBridge] 使用Thinking深度思考模型');
                            return [2 /*return*/, thinkingModel];
                        }
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    name: (_a = {},
                                        _a[sequelize_1.Op.like] = '%thinking%',
                                        _a),
                                    status: ai_model_config_model_1.ModelStatus.ACTIVE
                                }
                            })];
                    case 2:
                        alternativeThinkingModel = _b.sent();
                        if (alternativeThinkingModel) {
                            console.log('🧠 [AIBridge] 使用备选Thinking模型:', alternativeThinkingModel.name);
                            return [2 /*return*/, alternativeThinkingModel];
                        }
                        // 如果没有thinking模型，回退到默认模型
                        console.log('⚠️ [AIBridge] Thinking模型不可用，回退到默认模型');
                        return [4 /*yield*/, this.getDefaultModelConfig()];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        error_7 = _b.sent();
                        console.error('Failed to get thinking model config:', error_7);
                        return [4 /*yield*/, this.getDefaultModelConfig()];
                    case 5: return [2 /*return*/, _b.sent()];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🎯 专为CRUD工具优化的快速聊天完成
     * @param params - 聊天完成参数
     * @param customConfig - 自定义配置（可选）
     * @returns 聊天完成响应
     */
    AIBridgeService.prototype.generateFastChatCompletion = function (params, customConfig) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var fastModelConfig, optimizedParams, fastConfig, error_8;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        console.log('🚀 [AIBridge] 开始快速推理');
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        return [4 /*yield*/, this.getFastModelConfig()];
                    case 1:
                        fastModelConfig = _c.sent();
                        if (!fastModelConfig) {
                            throw new Error('No fast model configuration available');
                        }
                        console.log('📋 [AIBridge] 快速模型配置:', fastModelConfig.displayName);
                        console.log('📝 [AIBridge] 消息数量:', (_a = params.messages) === null || _a === void 0 ? void 0 : _a.length);
                        console.log('🔧 [AIBridge] 工具数量:', ((_b = params.tools) === null || _b === void 0 ? void 0 : _b.length) || 0);
                        optimizedParams = __assign(__assign({}, params), { model: fastModelConfig.name, temperature: 0.1, max_tokens: 1024, stream: false // 不使用流式输出
                         });
                        fastConfig = customConfig || {
                            endpointUrl: fastModelConfig.endpointUrl,
                            apiKey: fastModelConfig.apiKey
                        };
                        console.log("\uD83D\uDE80 [AIBridge] \u4F7F\u7528\u5FEB\u901F\u63A8\u7406\u6A21\u578B: ".concat(fastModelConfig.displayName));
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        return [4 /*yield*/, this.generateChatCompletion(optimizedParams, fastConfig)];
                    case 2: return [2 /*return*/, _c.sent()];
                    case 3:
                        error_8 = _c.sent();
                        console.error('❌ [AIBridge] 快速聊天完成失败:', error_8);
                        throw error_8;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🧠 专为复杂推理优化的深度思考聊天完成
     * 使用专门的Thinking模型（doubao-seed-1-6-thinking-250615）
     * @param params - 聊天完成参数
     * @param customConfig - 自定义配置（可选）
     * @param userId - 用户ID（用于使用量统计）
     * @returns 聊天完成响应
     */
    AIBridgeService.prototype.generateThinkingChatCompletion = function (params, customConfig, userId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var thinkingModelConfig, optimizedParams, thinkingConfig, error_9;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        console.log('🧠 [AIBridge] 开始深度思考推理');
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        return [4 /*yield*/, this.getThinkingModelConfig()];
                    case 1:
                        thinkingModelConfig = _c.sent();
                        if (!thinkingModelConfig) {
                            throw new Error('No thinking model configuration available');
                        }
                        console.log('📋 [AIBridge] 深度思考模型配置:', thinkingModelConfig.displayName);
                        console.log('📝 [AIBridge] 消息数量:', (_a = params.messages) === null || _a === void 0 ? void 0 : _a.length);
                        console.log('🔧 [AIBridge] 工具数量:', ((_b = params.tools) === null || _b === void 0 ? void 0 : _b.length) || 0);
                        console.log('👤 [AIBridge] 用户ID:', userId);
                        optimizedParams = __assign(__assign({}, params), { model: thinkingModelConfig.name, temperature: params.temperature || 0.7, max_tokens: params.max_tokens || 4000, stream: params.stream !== undefined ? params.stream : false // 保留用户指定的stream设置
                         });
                        thinkingConfig = customConfig || {
                            endpointUrl: thinkingModelConfig.endpointUrl,
                            apiKey: thinkingModelConfig.apiKey
                        };
                        console.log("\uD83E\uDDE0 [AIBridge] \u4F7F\u7528\u6DF1\u5EA6\u601D\u8003\u6A21\u578B: ".concat(thinkingModelConfig.displayName));
                        console.log("\uD83E\uDDE0 [AIBridge] \u53C2\u6570\u914D\u7F6E: temperature=".concat(optimizedParams.temperature, ", max_tokens=").concat(optimizedParams.max_tokens, ", stream=").concat(optimizedParams.stream));
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        return [4 /*yield*/, this.generateChatCompletion(optimizedParams, thinkingConfig, userId)];
                    case 2: return [2 /*return*/, _c.sent()];
                    case 3:
                        error_9 = _c.sent();
                        console.error('❌ [AIBridge] 深度思考聊天完成失败:', error_9);
                        throw error_9;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 💡 Flash模型的思考模式聊天完成
     * 使用Flash模型 + think参数 + 中等温度
     * 适合需要Flash速度但又需要一定思考深度的场景
     * @param params - 聊天完成参数
     * @param customConfig - 自定义配置（可选）
     * @param userId - 用户ID（用于使用量统计）
     * @returns 聊天完成响应
     */
    AIBridgeService.prototype.generateFlashWithThink = function (params, customConfig, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var flashModelConfig, optimizedParams, flashConfig, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getFastModelConfig()];
                    case 1:
                        flashModelConfig = _a.sent();
                        if (!flashModelConfig) {
                            throw new Error('No flash model configuration available');
                        }
                        optimizedParams = __assign(__assign({}, params), { model: flashModelConfig.name, temperature: params.temperature || 0.7, max_tokens: params.max_tokens || 2000, think: true, stream: params.stream !== undefined ? params.stream : false });
                        flashConfig = customConfig || {
                            endpointUrl: flashModelConfig.endpointUrl,
                            apiKey: flashModelConfig.apiKey
                        };
                        console.log("\uD83D\uDCA1 [AIBridge] \u4F7F\u7528Flash\u601D\u8003\u6A21\u5F0F: ".concat(flashModelConfig.displayName));
                        console.log("\uD83D\uDCA1 [AIBridge] \u53C2\u6570\u914D\u7F6E: temperature=".concat(optimizedParams.temperature, ", max_tokens=").concat(optimizedParams.max_tokens, ", think=true"));
                        return [4 /*yield*/, this.generateChatCompletion(optimizedParams, flashConfig, userId)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_10 = _a.sent();
                        console.error('❌ [AIBridge] Flash思考模式聊天完成失败:', error_10);
                        throw error_10;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * High-level analyze method for AI enrollment services
     * @param prompt - The analysis prompt
     * @param options - Analysis options and context
     * @returns Structured analysis result
     */
    AIBridgeService.prototype.analyze = function (prompt, options) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var modelConfig, messages, response, result, jsonMatch, error_11;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getDefaultModelConfig()];
                    case 1:
                        modelConfig = _e.sent();
                        if (!modelConfig) {
                            throw new Error('No active AI model configuration found');
                        }
                        messages = [
                            {
                                role: 'system',
                                content: "\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u5E7C\u513F\u56ED\u62DB\u751F\u5206\u6790\u4E13\u5BB6\uFF0C\u5177\u6709\u4E30\u5BCC\u7684\u6570\u636E\u5206\u6790\u548C\u5E02\u573A\u9884\u6D4B\u7ECF\u9A8C\u3002\n\u8BF7\u6839\u636E\u7528\u6237\u7684\u8981\u6C42\u8FDB\u884C\u4E13\u4E1A\u5206\u6790\uFF0C\u5E76\u63D0\u4F9B\u51C6\u786E\u3001\u5B9E\u7528\u7684\u5EFA\u8BAE\u3002\n\u5206\u6790\u7C7B\u578B: ".concat(options.type, "\n\u4E0A\u4E0B\u6587: ").concat(options.context, "\n").concat(options.requireStructured ? '请以结构化的JSON格式返回分析结果。' : '')
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ];
                        return [4 /*yield*/, this.generateChatCompletion({
                                model: modelConfig.name,
                                messages: messages,
                                temperature: ((_a = modelConfig.modelParameters) === null || _a === void 0 ? void 0 : _a.temperature) || 0.7,
                                max_tokens: ((_b = modelConfig.modelParameters) === null || _b === void 0 ? void 0 : _b.maxTokens) || 2000
                            }, {
                                endpointUrl: modelConfig.endpointUrl,
                                apiKey: modelConfig.apiKey
                            })];
                    case 2:
                        response = _e.sent();
                        result = ((_d = (_c = response.choices[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content) || '';
                        // 如果需要结构化数据，尝试解析JSON
                        if (options.requireStructured) {
                            try {
                                jsonMatch = result.match(/\{[\s\S]*\}/);
                                if (jsonMatch) {
                                    result = JSON.parse(jsonMatch[0]);
                                }
                                else {
                                    // 如果没有找到JSON，返回包装的结果
                                    result = { content: result, type: options.type };
                                }
                            }
                            catch (parseError) {
                                console.warn('Failed to parse structured response, returning raw content');
                                result = { content: result, type: options.type };
                            }
                        }
                        return [2 /*return*/, result];
                    case 3:
                        error_11 = _e.sent();
                        console.error('AI analysis failed:', error_11);
                        throw new Error("AI ".concat(options.type, " \u5206\u6790\u5931\u8D25"));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 多模态方法 ====================
    /**
     * 图片生成
     * @param params - 图片生成参数
     * @param customConfig - 自定义配置
     * @returns 图片生成结果
     */
    AIBridgeService.prototype.generateImage = function (params, customConfig) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var httpClient, endpoint, networkConfig_1, _loop_2, attempt, state_2, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        httpClient = this.defaultHttpClient;
                        endpoint = '/images/generations';
                        if (customConfig) {
                            httpClient = this.createCustomHttpClient(customConfig.endpointUrl, customConfig.apiKey);
                            endpoint = '/images/generations';
                            console.log('🎨 [图片生成] 使用自定义配置');
                        }
                        console.log('🎨 [图片生成] 请求参数:', JSON.stringify(params, null, 2));
                        networkConfig_1 = ai_config_service_1["default"].getNetworkConfig();
                        _loop_2 = function (attempt) {
                            var response, retryError_2;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _c.trys.push([0, 2, , 5]);
                                        return [4 /*yield*/, httpClient.post(endpoint, params)];
                                    case 1:
                                        response = _c.sent();
                                        console.log("\uD83C\uDFA8 [\u56FE\u7247\u751F\u6210] \u7B2C ".concat(attempt, " \u6B21\u8C03\u7528\u6210\u529F"));
                                        return [2 /*return*/, { value: response.data }];
                                    case 2:
                                        retryError_2 = _c.sent();
                                        if (!(attempt < networkConfig_1.maxRetries && axios_1["default"].isAxiosError(retryError_2) && ((_a = retryError_2.response) === null || _a === void 0 ? void 0 : _a.status) === 503)) return [3 /*break*/, 4];
                                        console.log("\uD83C\uDFA8 [\u56FE\u7247\u751F\u6210] \u7B2C ".concat(attempt, " \u6B21\u8C03\u7528\u5931\u8D25\uFF0C\u51C6\u5907\u91CD\u8BD5"));
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, networkConfig_1.retryDelay * attempt); })];
                                    case 3:
                                        _c.sent();
                                        return [2 /*return*/, "continue"];
                                    case 4: throw retryError_2;
                                    case 5: return [2 /*return*/];
                                }
                            });
                        };
                        attempt = 1;
                        _b.label = 1;
                    case 1:
                        if (!(attempt <= networkConfig_1.maxRetries)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_2(attempt)];
                    case 2:
                        state_2 = _b.sent();
                        if (typeof state_2 === "object")
                            return [2 /*return*/, state_2.value];
                        _b.label = 3;
                    case 3:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_12 = _b.sent();
                        console.error('🎨 [图片生成] 调用失败:', error_12);
                        throw new Error('图片生成失败');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 语音转文本
     * @param params - 语音转文本参数
     * @param customConfig - 自定义配置
     * @returns 语音转文本结果
     */
    AIBridgeService.prototype.speechToText = function (params, customConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var httpClient, endpoint, formData, response, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        httpClient = this.defaultHttpClient;
                        endpoint = '/audio/transcriptions';
                        if (customConfig) {
                            httpClient = this.createCustomHttpClient(customConfig.endpointUrl, customConfig.apiKey, 'multipart/form-data');
                            endpoint = '/audio/transcriptions';
                            console.log('🎤 [语音转文本] 使用自定义配置');
                        }
                        formData = new form_data_1["default"]();
                        formData.append('file', params.file, params.filename);
                        formData.append('model', params.model);
                        if (params.language)
                            formData.append('language', params.language);
                        if (params.prompt)
                            formData.append('prompt', params.prompt);
                        if (params.response_format)
                            formData.append('response_format', params.response_format);
                        if (params.temperature)
                            formData.append('temperature', params.temperature.toString());
                        console.log('🎤 [语音转文本] 开始处理');
                        return [4 /*yield*/, httpClient.post(endpoint, formData, {
                                headers: __assign(__assign({}, formData.getHeaders()), { 'Authorization': httpClient.defaults.headers['Authorization'] })
                            })];
                    case 1:
                        response = _a.sent();
                        console.log('🎤 [语音转文本] 处理成功');
                        return [2 /*return*/, response.data];
                    case 2:
                        error_13 = _a.sent();
                        console.error('🎤 [语音转文本] 调用失败:', error_13);
                        throw new Error('语音转文本失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 文本转语音
     * @param params - 文本转语音参数
     * @param customConfig - 自定义配置
     * @returns 文本转语音结果
     */
    AIBridgeService.prototype.textToSpeech = function (params, customConfig) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var isV3WebSocket, VolcengineTTSV3BidirectionService, appKey, accessKey, modelConfig, params_1, e_1, ttsV3Service, result, httpClient, endpoint, response, error_14;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 10, , 11]);
                        console.log('🔊 [文本转语音] 开始处理:', JSON.stringify(params, null, 2));
                        isV3WebSocket = ((_a = customConfig === null || customConfig === void 0 ? void 0 : customConfig.endpointUrl) === null || _a === void 0 ? void 0 : _a.includes('wss://')) ||
                            ((_b = customConfig === null || customConfig === void 0 ? void 0 : customConfig.endpointUrl) === null || _b === void 0 ? void 0 : _b.includes('/v3/tts'));
                        if (!isV3WebSocket) return [3 /*break*/, 7];
                        // 使用V3 WebSocket双向流式服务
                        console.log('🔊 [文本转语音] 使用V3 WebSocket双向流式服务');
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../volcengine/tts-v3-bidirection.service')); })];
                    case 1:
                        VolcengineTTSV3BidirectionService = (_c.sent()).VolcengineTTSV3BidirectionService;
                        appKey = customConfig.apiKey;
                        accessKey = '';
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    endpointUrl: customConfig.endpointUrl,
                                    status: ai_model_config_model_1.ModelStatus.ACTIVE
                                }
                            })];
                    case 3:
                        modelConfig = _c.sent();
                        if (modelConfig && modelConfig.modelParameters) {
                            params_1 = typeof modelConfig.modelParameters === 'string'
                                ? JSON.parse(modelConfig.modelParameters)
                                : modelConfig.modelParameters;
                            appKey = params_1.appKey || appKey;
                            accessKey = params_1.accessKey || '';
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _c.sent();
                        console.warn('🔊 [文本转语音] 无法从数据库加载配置，使用默认值');
                        return [3 /*break*/, 5];
                    case 5:
                        ttsV3Service = new VolcengineTTSV3BidirectionService({
                            appKey: appKey,
                            accessKey: accessKey,
                            wsUrl: customConfig.endpointUrl
                        });
                        return [4 /*yield*/, ttsV3Service.textToSpeech({
                                text: params.input,
                                speaker: params.voice || 'zh_female_cancan_mars_bigtts',
                                format: 'mp3',
                                speedRatio: params.speed || 1.0
                            })];
                    case 6:
                        result = _c.sent();
                        console.log('🔊 [文本转语音] V3双向流式处理成功');
                        return [2 /*return*/, {
                                audioData: result.audioBuffer,
                                contentType: 'audio/mpeg'
                            }];
                    case 7:
                        httpClient = this.defaultHttpClient;
                        endpoint = '/audio/speech';
                        if (customConfig) {
                            httpClient = this.createCustomHttpClient(customConfig.endpointUrl, customConfig.apiKey);
                            endpoint = '/audio/speech';
                            console.log('🔊 [文本转语音] 使用自定义HTTP配置');
                        }
                        return [4 /*yield*/, httpClient.post(endpoint, params, {
                                responseType: 'arraybuffer'
                            })];
                    case 8:
                        response = _c.sent();
                        console.log('🔊 [文本转语音] HTTP处理成功');
                        return [2 /*return*/, {
                                audioData: Buffer.from(response.data),
                                contentType: response.headers['content-type'] || 'audio/mpeg'
                            }];
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        error_14 = _c.sent();
                        console.error('🔊 [文本转语音] 调用失败:', error_14.message);
                        throw new Error("\u6587\u672C\u8F6C\u8BED\u97F3\u5931\u8D25: ".concat(error_14.message));
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 视频生成（委托给专业的 video.service）
     * @param params - 视频生成参数
     * @param customConfig - 自定义配置
     * @returns 视频生成结果
     */
    AIBridgeService.prototype.generateVideo = function (params, customConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                try {
                    console.log('🎬 [AI-Bridge] 视频生成请求，委托给 VideoService');
                    console.log('🎬 [AI-Bridge] 参数:', JSON.stringify(params, null, 2));
                    // 视频服务暂时不可用，返回模拟结果
                    console.log('⚠️ [AI-Bridge] 视频服务暂未实现，返回模拟结果');
                    result = {
                        success: false,
                        message: '视频服务功能暂未实现',
                        data: null
                    };
                    console.log('🎬 [AI-Bridge] 视频生成成功');
                    return [2 /*return*/, result];
                }
                catch (error) {
                    console.error('🎬 [AI-Bridge] 视频生成失败:', error);
                    throw new Error('视频生成失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * VOD视频上传（委托给 vod.service）
     * @param params - 上传参数
     * @returns 上传结果
     */
    AIBridgeService.prototype.uploadVideoToVOD = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var vodService, result, error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        console.log('📤 [AI-Bridge] VOD视频上传请求');
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../volcengine/vod.service')); })];
                    case 1:
                        vodService = (_a.sent()).vodService;
                        return [4 /*yield*/, vodService.uploadVideo(params.videoBuffer, params.filename)];
                    case 2:
                        result = _a.sent();
                        console.log('📤 [AI-Bridge] VOD视频上传成功');
                        return [2 /*return*/, result];
                    case 3:
                        error_15 = _a.sent();
                        console.error('📤 [AI-Bridge] VOD视频上传失败:', error_15);
                        throw new Error('VOD视频上传失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * VOD视频合并（委托给 vod.service）
     * @param params - 合并参数
     * @returns 合并结果
     */
    AIBridgeService.prototype.mergeVideosVOD = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var vodService, result, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        console.log('✂️ [AI-Bridge] VOD视频合并请求');
                        console.log("\u2702\uFE0F [AI-Bridge] \u5408\u5E76 ".concat(params.videoUrls.length, " \u4E2A\u89C6\u9891\u7247\u6BB5"));
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../volcengine/vod.service')); })];
                    case 1:
                        vodService = (_a.sent()).vodService;
                        return [4 /*yield*/, vodService.mergeVideos(params.videoUrls, params.outputFilename)];
                    case 2:
                        result = _a.sent();
                        console.log('✂️ [AI-Bridge] VOD视频合并成功');
                        return [2 /*return*/, result];
                    case 3:
                        error_16 = _a.sent();
                        console.error('✂️ [AI-Bridge] VOD视频合并失败:', error_16);
                        throw new Error('VOD视频合并失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * VOD添加音频（委托给 vod.service）
     * @param params - 添加音频参数
     * @returns 添加音频结果
     */
    AIBridgeService.prototype.addAudioToVideoVOD = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var vodService, result, error_17;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        console.log('🎤 [AI-Bridge] VOD添加音频请求');
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../volcengine/vod.service')); })];
                    case 1:
                        vodService = (_a.sent()).vodService;
                        return [4 /*yield*/, vodService.addAudioToVideo(params.videoUrl, params.audioUrl, params.outputFilename)];
                    case 2:
                        result = _a.sent();
                        console.log('🎤 [AI-Bridge] VOD添加音频成功');
                        return [2 /*return*/, result];
                    case 3:
                        error_17 = _a.sent();
                        console.error('🎤 [AI-Bridge] VOD添加音频失败:', error_17);
                        throw new Error('VOD添加音频失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * VOD视频转码（委托给 vod.service）
     * @param params - 转码参数
     * @returns 转码结果
     */
    AIBridgeService.prototype.transcodeVideoVOD = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var vodService, result, error_18;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        console.log('🔄 [AI-Bridge] VOD视频转码请求');
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../volcengine/vod.service')); })];
                    case 1:
                        vodService = (_a.sent()).vodService;
                        return [4 /*yield*/, vodService.transcodeVideo(params.videoUrl, params.format || 'mp4', params.quality || 'high')];
                    case 2:
                        result = _a.sent();
                        console.log('🔄 [AI-Bridge] VOD视频转码成功');
                        return [2 /*return*/, result];
                    case 3:
                        error_18 = _a.sent();
                        console.error('🔄 [AI-Bridge] VOD视频转码失败:', error_18);
                        throw new Error('VOD视频转码失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * VOD任务状态查询（委托给 vod.service）
     * @param params - 查询参数
     * @returns 任务状态
     */
    AIBridgeService.prototype.getVODTaskStatus = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var vodService, result, error_19;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        console.log('📊 [AI-Bridge] VOD任务状态查询');
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../volcengine/vod.service')); })];
                    case 1:
                        vodService = (_a.sent()).vodService;
                        return [4 /*yield*/, vodService.getTaskStatus(params.taskId)];
                    case 2:
                        result = _a.sent();
                        console.log('📊 [AI-Bridge] VOD任务状态查询成功');
                        return [2 /*return*/, result];
                    case 3:
                        error_19 = _a.sent();
                        console.error('📊 [AI-Bridge] VOD任务状态查询失败:', error_19);
                        throw new Error('VOD任务状态查询失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 文档处理
     * @param params - 文档处理参数
     * @param customConfig - 自定义配置
     * @returns 文档处理结果
     */
    AIBridgeService.prototype.processDocument = function (params, customConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var httpClient, endpoint, formData, response, error_20;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        httpClient = this.defaultHttpClient;
                        endpoint = '/documents/process';
                        if (customConfig) {
                            httpClient = this.createCustomHttpClient(customConfig.endpointUrl, customConfig.apiKey, 'multipart/form-data');
                            endpoint = '/documents/process';
                            console.log('📄 [文档处理] 使用自定义配置');
                        }
                        formData = new form_data_1["default"]();
                        formData.append('file', params.document, params.filename);
                        formData.append('model', params.model);
                        formData.append('task', params.task);
                        if (params.language)
                            formData.append('language', params.language);
                        if (params.format)
                            formData.append('format', params.format);
                        console.log('📄 [文档处理] 开始处理');
                        return [4 /*yield*/, httpClient.post(endpoint, formData, {
                                headers: __assign(__assign({}, formData.getHeaders()), { 'Authorization': httpClient.defaults.headers['Authorization'] })
                            })];
                    case 1:
                        response = _a.sent();
                        console.log('📄 [文档处理] 处理成功');
                        return [2 /*return*/, response.data];
                    case 2:
                        error_20 = _a.sent();
                        console.error('📄 [文档处理] 调用失败:', error_20);
                        throw new Error('文档处理失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 网络搜索
     * @param params - 搜索参数
     * @param customConfig - 自定义配置（包含endpoint和apiKey）
     * @returns 搜索结果
     */
    AIBridgeService.prototype.search = function (params, customConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, requestBody, endpoint, apiKey, networkConfig, response, searchTime, volcanoData, results_1, searchResponse, error_21;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        console.log('🔍 [AI-Bridge] 开始网络搜索:', params.query);
                        requestBody = {
                            Query: params.query,
                            SearchType: params.searchType || 'web_summary',
                            Count: params.maxResults || 5,
                            NeedSummary: params.enableAISummary !== false,
                            Language: params.language || 'zh-CN'
                        };
                        endpoint = (customConfig === null || customConfig === void 0 ? void 0 : customConfig.endpointUrl) || process.env.VOLCANO_SEARCH_ENDPOINT || 'https://open.feedcoopapi.com/search_api/web_search';
                        apiKey = (customConfig === null || customConfig === void 0 ? void 0 : customConfig.apiKey) || process.env.VOLCANO_API_KEY || '';
                        console.log('🔍 [AI-Bridge] 搜索端点:', endpoint);
                        networkConfig = ai_config_service_1["default"].getAxiosConfig();
                        return [4 /*yield*/, axios_1["default"].post(endpoint, requestBody, __assign({ headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': "Bearer ".concat(apiKey),
                                    'User-Agent': 'YY-AI-Assistant/1.0'
                                }, timeout: 30000, 
                                // 🚀 强制禁用代理，确保直连
                                proxy: false, 
                                // 禁用环境变量代理
                                httpAgent: new http_1["default"].Agent({ keepAlive: true }), httpsAgent: new https_1["default"].Agent({ keepAlive: true, rejectUnauthorized: false }) }, networkConfig))];
                    case 2:
                        response = _a.sent();
                        searchTime = Date.now() - startTime;
                        volcanoData = response.data;
                        if (!volcanoData || !volcanoData.Result) {
                            throw new Error('搜索API返回格式错误');
                        }
                        results_1 = [];
                        if (Array.isArray(volcanoData.Result.WebResults)) {
                            volcanoData.Result.WebResults.forEach(function (item) {
                                results_1.push({
                                    title: item.Title || '',
                                    url: item.Url || '',
                                    snippet: item.Snippet || '',
                                    publishTime: item.PublishTime,
                                    source: item.Source,
                                    relevanceScore: item.RelevanceScore
                                });
                            });
                        }
                        searchResponse = {
                            query: params.query,
                            results: results_1,
                            totalResults: results_1.length,
                            searchTime: searchTime,
                            aiSummary: volcanoData.Result.Summary || '',
                            suggestions: volcanoData.Result.Suggestions || [],
                            relatedQueries: volcanoData.Result.RelatedQueries || []
                        };
                        console.log('🔍 [AI-Bridge] 搜索成功，返回', results_1.length, '条结果');
                        return [2 /*return*/, searchResponse];
                    case 3:
                        error_21 = _a.sent();
                        console.error('🔍 [AI-Bridge] 搜索失败:', error_21.message);
                        // 返回空结果而不是抛出错误
                        return [2 /*return*/, {
                                query: params.query,
                                results: [],
                                totalResults: 0,
                                searchTime: Date.now() - startTime,
                                aiSummary: "\u641C\u7D22\u5931\u8D25: ".concat(error_21.message)
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return AIBridgeService;
}());
// Export a singleton instance of the service
exports.aiBridgeService = new AIBridgeService();
