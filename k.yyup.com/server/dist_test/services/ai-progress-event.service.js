"use strict";
/**
 * AI查询进度事件服务
 * 为前端提供实时进度反馈，解决复杂查询用户等待焦虑
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.AIProgressEventService = void 0;
var AIProgressEventService = /** @class */ (function () {
    // 🔧 已移除 Socket.IO 依赖 - 不再使用WebSocket推送进度
    // private io: any;
    function AIProgressEventService() {
        this.activeSessions = new Map();
    }
    AIProgressEventService.getInstance = function () {
        if (!AIProgressEventService.instance) {
            AIProgressEventService.instance = new AIProgressEventService();
        }
        return AIProgressEventService.instance;
    };
    /**
     * 初始化Socket.IO集成
     * 🔧 已废弃 - 不再使用WebSocket
     */
    AIProgressEventService.prototype.initializeSocketIO = function (io) {
        // this.io = io;
        console.log('⚠️ [ProgressEvent] Socket.IO已移除，进度推送功能已禁用');
    };
    /**
     * 开始查询进度跟踪
     */
    AIProgressEventService.prototype.startProgressTracking = function (config) {
        this.activeSessions.set(config.sessionId, config);
        console.log("\uD83C\uDFAF [ProgressEvent] \u5F00\u59CB\u8DDF\u8E2A\u67E5\u8BE2\u8FDB\u5EA6: ".concat(config.sessionId));
    };
    /**
     * 发送进度事件
     */
    AIProgressEventService.prototype.sendProgress = function (sessionId, stepId, message, progress, detail) {
        return __awaiter(this, void 0, void 0, function () {
            var config, progressStep, progressEvent;
            return __generator(this, function (_a) {
                config = this.activeSessions.get(sessionId);
                if (!config) {
                    console.warn("\u26A0\uFE0F [ProgressEvent] \u672A\u627E\u5230\u4F1A\u8BDD\u914D\u7F6E: ".concat(sessionId));
                    return [2 /*return*/];
                }
                progressStep = {
                    id: stepId,
                    message: message,
                    progress: progress,
                    detail: detail
                };
                progressEvent = {
                    sessionId: sessionId,
                    stepId: stepId,
                    currentStep: progressStep,
                    totalSteps: config.totalSteps,
                    timestamp: Date.now(),
                    queryId: config.queryId,
                    userId: config.userId
                };
                // 🔧 已移除WebSocket推送 - 只保留本地回调
                // if (this.io) {
                //   this.io.to(`user_${config.userId}`).emit('ai_query_progress', progressEvent);
                // }
                // 触发本地回调（用于内部处理）
                if (config.onProgress) {
                    config.onProgress(progressEvent);
                }
                console.log("\uD83D\uDCCA [ProgressEvent] \u8FDB\u5EA6\u63A8\u9001: ".concat(message, " (").concat(progress, "%)"));
                return [2 /*return*/];
            });
        });
    };
    /**
     * 查询步骤定义
     */
    AIProgressEventService.prototype.getQuerySteps = function (queryComplexity) {
        if (queryComplexity === void 0) { queryComplexity = 'medium'; }
        var baseSteps = [
            { id: 'start', message: '开始处理查询...', progress: 5 },
            { id: 'analyze', message: '分析查询意图...', progress: 15 },
            { id: 'model_select', message: '选择最优AI模型...', progress: 25 },
            { id: 'cache_check', message: '检查缓存结果...', progress: 35 },
        ];
        var simpleSteps = __spreadArray(__spreadArray([], baseSteps, true), [
            { id: 'execute', message: '执行快速查询...', progress: 70 },
            { id: 'format', message: '格式化结果...', progress: 90 },
            { id: 'complete', message: '查询完成', progress: 100 }
        ], false);
        var mediumSteps = __spreadArray(__spreadArray([], baseSteps, true), [
            { id: 'data_prepare', message: '准备查询数据...', progress: 45 },
            { id: 'execute', message: '执行AI查询...', progress: 65 },
            { id: 'analyze_result', message: '分析查询结果...', progress: 80 },
            { id: 'format', message: '格式化响应...', progress: 95 },
            { id: 'complete', message: '查询完成', progress: 100 }
        ], false);
        var complexSteps = __spreadArray(__spreadArray([], baseSteps, true), [
            { id: 'data_prepare', message: '准备查询数据...', progress: 45 },
            { id: 'table_analysis', message: '分析相关表结构...', progress: 55 },
            { id: 'sql_generation', message: '生成优化SQL语句...', progress: 65 },
            { id: 'execute', message: '执行复杂查询...', progress: 75 },
            { id: 'result_analysis', message: '深度分析结果...', progress: 85 },
            { id: 'visualization', message: '生成智能可视化...', progress: 92 },
            { id: 'format', message: '组装最终响应...', progress: 98 },
            { id: 'complete', message: '复杂查询完成', progress: 100 }
        ], false);
        switch (queryComplexity) {
            case 'simple': return simpleSteps;
            case 'complex': return complexSteps;
            default: return mediumSteps;
        }
    };
    /**
     * 完成查询跟踪
     */
    AIProgressEventService.prototype.completeProgress = function (sessionId, result) {
        var config = this.activeSessions.get(sessionId);
        if (!config)
            return;
        // 发送完成事件
        this.sendProgress(sessionId, 'complete', '查询完成', 100);
        // 触发完成回调
        if (config.onComplete) {
            config.onComplete(result);
        }
        // 清理会话
        this.activeSessions["delete"](sessionId);
        console.log("\u2705 [ProgressEvent] \u67E5\u8BE2\u5B8C\u6210: ".concat(sessionId));
    };
    /**
     * 处理错误
     */
    AIProgressEventService.prototype.handleProgressError = function (sessionId, error) {
        var config = this.activeSessions.get(sessionId);
        if (!config)
            return;
        // 🔧 已移除WebSocket错误推送
        // if (this.io) {
        //   this.io.to(`user_${config.userId}`).emit('ai_query_error', {
        //     sessionId,
        //     error: error.message,
        //     timestamp: Date.now()
        //   });
        // }
        // 触发错误回调
        if (config.onError) {
            config.onError(error);
        }
        // 清理会话
        this.activeSessions["delete"](sessionId);
        console.log("\u274C [ProgressEvent] \u67E5\u8BE2\u9519\u8BEF: ".concat(sessionId), error);
    };
    /**
     * 获取活跃会话状态
     */
    AIProgressEventService.prototype.getActiveSession = function (sessionId) {
        return this.activeSessions.get(sessionId);
    };
    /**
     * 获取所有活跃会话
     */
    AIProgressEventService.prototype.getActiveSessions = function () {
        return Array.from(this.activeSessions.keys());
    };
    /**
     * 清理过期会话
     */
    AIProgressEventService.prototype.cleanupExpiredSessions = function () {
        var _this = this;
        var now = Date.now();
        var expiredSessions = [];
        this.activeSessions.forEach(function (config, sessionId) {
            // 假设5分钟未活动为过期
            var lastActivity = now;
            if (lastActivity > 5 * 60 * 1000) {
                expiredSessions.push(sessionId);
            }
        });
        expiredSessions.forEach(function (sessionId) {
            _this.activeSessions["delete"](sessionId);
            console.log("\uD83E\uDDF9 [ProgressEvent] \u6E05\u7406\u8FC7\u671F\u4F1A\u8BDD: ".concat(sessionId));
        });
    };
    return AIProgressEventService;
}());
exports.AIProgressEventService = AIProgressEventService;
exports["default"] = AIProgressEventService.getInstance();
