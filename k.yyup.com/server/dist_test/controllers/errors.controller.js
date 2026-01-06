"use strict";
/**
 * 错误收集控制器
 * 用于收集和处理前端错误报告
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
exports.ErrorsController = void 0;
var async_handler_1 = require("../middlewares/async-handler");
var system_log_service_1 = __importDefault(require("../services/system/system-log.service"));
var system_log_model_1 = require("../models/system-log.model");
var ErrorsController = /** @class */ (function () {
    function ErrorsController() {
    }
    var _a;
    _a = ErrorsController;
    /**
     * 报告关键错误
     */
    ErrorsController.reportCriticalError = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var errorInfo, error_1;
        var _b;
        return __generator(_a, function (_c) {
            switch (_c.label) {
                case 0:
                    errorInfo = req.body;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    // 记录到系统日志
                    return [4 /*yield*/, system_log_service_1["default"].createLog({
                            level: 'error',
                            operationType: 'other',
                            moduleName: 'FRONTEND',
                            message: "\u524D\u7AEF\u5173\u952E\u9519\u8BEF: ".concat(errorInfo.message),
                            details: JSON.stringify(errorInfo),
                            userId: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || null,
                            ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
                            action: 'CRITICAL_ERROR',
                            type: 'error',
                            createdAt: new Date(),
                            updatedAt: new Date()
                        })];
                case 2:
                    // 记录到系统日志
                    _c.sent();
                    // 如果是生产环境，可以发送到错误监控服务
                    if (process.env.NODE_ENV === 'production') {
                        console.error('🚨 前端关键错误:', errorInfo);
                        // 这里可以集成第三方错误监控服务
                        // 例如：Sentry, LogRocket, Bugsnag等
                        // await sendToErrorMonitoring(errorInfo);
                    }
                    res.status(200).json({
                        success: true,
                        message: '错误报告已收集',
                        data: null
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _c.sent();
                    console.error('处理错误报告失败:', error_1);
                    res.status(500).json({
                        success: false,
                        message: '错误报告处理失败',
                        error: error_1 instanceof Error ? error_1.message : '未知错误'
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    /**
     * 批量报告错误
     */
    ErrorsController.reportErrorBatch = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var errors, logEntries, error_2;
        return __generator(_a, function (_b) {
            switch (_b.label) {
                case 0:
                    errors = req.body.errors;
                    if (!Array.isArray(errors)) {
                        return [2 /*return*/, res.status(400).json({
                                success: false,
                                message: '错误数据格式不正确',
                                error: 'Invalid data format'
                            })];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    logEntries = errors.map(function (error) {
                        var _b;
                        return ({
                            level: 'error',
                            operationType: 'other',
                            moduleName: 'FRONTEND',
                            message: "\u524D\u7AEF\u9519\u8BEF: ".concat(error.message),
                            details: JSON.stringify(error),
                            userId: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || null,
                            ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
                            action: "".concat(error.type.toUpperCase(), "_ERROR"),
                            type: 'error',
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                    });
                    // 批量创建日志
                    return [4 /*yield*/, system_log_service_1["default"].createLogBatch(logEntries)];
                case 2:
                    // 批量创建日志
                    _b.sent();
                    res.status(200).json({
                        success: true,
                        message: "\u5DF2\u6536\u96C6".concat(errors.length, "\u4E2A\u9519\u8BEF\u62A5\u544A"),
                        data: null
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _b.sent();
                    console.error('批量处理错误报告失败:', error_2);
                    res.status(500).json({
                        success: false,
                        message: '批量错误报告处理失败',
                        error: error_2 instanceof Error ? error_2.message : '未知错误'
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    /**
     * 获取错误统计
     */
    ErrorsController.getErrorStatistics = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var _b, startDate, endDate, errorLogs, errorStats, last24Hours_1, recentErrors, error_3;
        var _c, _d;
        return __generator(_a, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 2, , 3]);
                    _b = req.query, startDate = _b.startDate, endDate = _b.endDate;
                    return [4 /*yield*/, system_log_model_1.SystemLog.findAll({
                            where: __assign({ moduleName: 'FRONTEND', action: (_c = {},
                                    _c[require('sequelize').Op.like] = '%_ERROR',
                                    _c) }, (startDate && endDate && {
                                createdAt: (_d = {},
                                    _d[require('sequelize').Op.between] = [new Date(startDate), new Date(endDate)],
                                    _d)
                            })),
                            order: [['createdAt', 'DESC']]
                        })];
                case 1:
                    errorLogs = _e.sent();
                    errorStats = errorLogs.reduce(function (acc, log) {
                        var _b;
                        var errorType = ((_b = log.action) === null || _b === void 0 ? void 0 : _b.replace('_ERROR', '').toLowerCase()) || 'unknown';
                        acc[errorType] = (acc[errorType] || 0) + 1;
                        return acc;
                    }, {});
                    last24Hours_1 = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    recentErrors = errorLogs.filter(function (log) { return new Date(log.createdAt) > last24Hours_1; });
                    res.status(200).json({
                        success: true,
                        message: '获取错误统计成功',
                        data: {
                            totalErrors: errorLogs.length,
                            errorsByType: errorStats,
                            recentErrors: recentErrors.length,
                            errorLogs: errorLogs.slice(0, 50) // 返回最近50条错误
                        }
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _e.sent();
                    console.error('获取错误统计失败:', error_3);
                    res.status(500).json({
                        success: false,
                        message: '获取错误统计失败',
                        error: error_3 instanceof Error ? error_3.message : '未知错误'
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    /**
     * 健康检查接口
     */
    ErrorsController.healthCheck = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(_a, function (_b) {
            res.status(200).json({
                success: true,
                message: '系统健康',
                data: {
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime()
                }
            });
            return [2 /*return*/];
        });
    }); });
    return ErrorsController;
}());
exports.ErrorsController = ErrorsController;
