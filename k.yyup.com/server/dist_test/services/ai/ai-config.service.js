"use strict";
/**
 * AI配置服务
 * 统一管理所有AI服务的配置参数
 */
exports.__esModule = true;
exports.AIConfigService = void 0;
/**
 * AI配置服务类
 */
var AIConfigService = /** @class */ (function () {
    function AIConfigService() {
    }
    /**
     * 获取网络配置
     */
    AIConfigService.getNetworkConfig = function () {
        var useProxy = process.env.AI_USE_PROXY === 'true';
        var proxyHost = process.env.AI_PROXY_HOST || '127.0.0.1';
        var proxyPort = parseInt(process.env.AI_PROXY_PORT || '8080');
        return {
            timeout: parseInt(process.env.AI_TIMEOUT || '60000'),
            proxy: useProxy ? { host: proxyHost, port: proxyPort } : false,
            maxRedirects: parseInt(process.env.AI_MAX_REDIRECTS || '5'),
            maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3'),
            retryDelay: 1000 // 1秒基础延迟
        };
    };
    /**
     * 获取默认AI模型参数
     */
    AIConfigService.getDefaultModelParams = function () {
        return {
            temperature: parseFloat(process.env.AI_DEFAULT_TEMPERATURE || '0.7'),
            maxTokens: parseInt(process.env.AI_DEFAULT_MAX_TOKENS || '16000'),
            topP: parseFloat(process.env.AI_DEFAULT_TOP_P || '0.9'),
            frequencyPenalty: parseFloat(process.env.AI_DEFAULT_FREQUENCY_PENALTY || '0'),
            presencePenalty: parseFloat(process.env.AI_DEFAULT_PRESENCE_PENALTY || '0')
        };
    };
    /**
     * 获取代理配置
     */
    AIConfigService.getProxyConfig = function () {
        var enabled = process.env.AI_USE_PROXY === 'true';
        if (!enabled) {
            return { enabled: false };
        }
        return {
            enabled: true,
            host: process.env.AI_PROXY_HOST || '127.0.0.1',
            port: parseInt(process.env.AI_PROXY_PORT || '8080')
        };
    };
    /**
     * 获取axios配置对象
     */
    AIConfigService.getAxiosConfig = function (customTimeout) {
        var networkConfig = this.getNetworkConfig();
        return {
            timeout: customTimeout || networkConfig.timeout,
            proxy: false,
            maxRedirects: networkConfig.maxRedirects,
            // 验证状态码
            validateStatus: function (status) { return status < 500; }
        };
    };
    /**
     * 获取标准请求头
     */
    AIConfigService.getStandardHeaders = function (apiKey) {
        return {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept-Charset': 'utf-8',
            'Authorization': "Bearer ".concat(apiKey),
            'User-Agent': 'KindergartenAI/1.0'
        };
    };
    /**
     * 合并模型参数（数据库配置优先）
     */
    AIConfigService.mergeModelParams = function (dbParams, customParams) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        var defaultParams = this.getDefaultModelParams();
        return {
            temperature: (_b = (_a = dbParams === null || dbParams === void 0 ? void 0 : dbParams.temperature) !== null && _a !== void 0 ? _a : customParams === null || customParams === void 0 ? void 0 : customParams.temperature) !== null && _b !== void 0 ? _b : defaultParams.temperature,
            maxTokens: (_e = (_d = (_c = dbParams === null || dbParams === void 0 ? void 0 : dbParams.maxTokens) !== null && _c !== void 0 ? _c : dbParams === null || dbParams === void 0 ? void 0 : dbParams.max_tokens) !== null && _d !== void 0 ? _d : customParams === null || customParams === void 0 ? void 0 : customParams.maxTokens) !== null && _e !== void 0 ? _e : defaultParams.maxTokens,
            topP: (_h = (_g = (_f = dbParams === null || dbParams === void 0 ? void 0 : dbParams.topP) !== null && _f !== void 0 ? _f : dbParams === null || dbParams === void 0 ? void 0 : dbParams.top_p) !== null && _g !== void 0 ? _g : customParams === null || customParams === void 0 ? void 0 : customParams.topP) !== null && _h !== void 0 ? _h : defaultParams.topP,
            frequencyPenalty: (_l = (_k = (_j = dbParams === null || dbParams === void 0 ? void 0 : dbParams.frequencyPenalty) !== null && _j !== void 0 ? _j : dbParams === null || dbParams === void 0 ? void 0 : dbParams.frequency_penalty) !== null && _k !== void 0 ? _k : customParams === null || customParams === void 0 ? void 0 : customParams.frequencyPenalty) !== null && _l !== void 0 ? _l : defaultParams.frequencyPenalty,
            presencePenalty: (_p = (_o = (_m = dbParams === null || dbParams === void 0 ? void 0 : dbParams.presencePenalty) !== null && _m !== void 0 ? _m : dbParams === null || dbParams === void 0 ? void 0 : dbParams.presence_penalty) !== null && _o !== void 0 ? _o : customParams === null || customParams === void 0 ? void 0 : customParams.presencePenalty) !== null && _p !== void 0 ? _p : defaultParams.presencePenalty
        };
    };
    /**
     * 验证配置完整性
     */
    AIConfigService.validateConfig = function () {
        var errors = [];
        // 检查必要的环境变量
        if (process.env.AI_USE_PROXY === 'true') {
            if (!process.env.AI_PROXY_HOST) {
                errors.push('AI_PROXY_HOST is required when AI_USE_PROXY is true');
            }
            if (!process.env.AI_PROXY_PORT) {
                errors.push('AI_PROXY_PORT is required when AI_USE_PROXY is true');
            }
        }
        // 检查数值配置
        var timeout = parseInt(process.env.AI_TIMEOUT || '60000');
        if (isNaN(timeout) || timeout <= 0) {
            errors.push('AI_TIMEOUT must be a positive number');
        }
        var maxRetries = parseInt(process.env.AI_MAX_RETRIES || '3');
        if (isNaN(maxRetries) || maxRetries < 0) {
            errors.push('AI_MAX_RETRIES must be a non-negative number');
        }
        return {
            valid: errors.length === 0,
            errors: errors
        };
    };
    /**
     * 打印配置信息（用于调试）
     */
    AIConfigService.logConfig = function () {
        var networkConfig = this.getNetworkConfig();
        var modelParams = this.getDefaultModelParams();
        var proxyConfig = this.getProxyConfig();
        console.log('🔧 [AI配置] 网络配置:', {
            timeout: networkConfig.timeout,
            proxy: networkConfig.proxy,
            maxRetries: networkConfig.maxRetries
        });
        console.log('🤖 [AI配置] 模型参数:', modelParams);
        console.log('🌐 [AI配置] 代理配置:', proxyConfig);
    };
    return AIConfigService;
}());
exports.AIConfigService = AIConfigService;
exports["default"] = AIConfigService;
