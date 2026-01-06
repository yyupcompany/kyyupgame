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
exports.AIPerformanceMonitorController = void 0;
var system_monitor_service_1 = require("../../services/system-monitor.service");
var apiResponse_1 = require("../../utils/apiResponse");
var async_handler_1 = require("../../middlewares/async-handler");
var AIPerformanceMonitorController = /** @class */ (function () {
    function AIPerformanceMonitorController() {
        var _this = this;
        this.systemMonitor = system_monitor_service_1.SystemMonitorService.getInstance();
        // 基于数据库配置的AI服务数据
        this.mockAIServices = [
            {
                id: 'doubao-text-service',
                name: '豆包文本生成模型',
                provider: '字节跳动豆包',
                version: 'doubao-seed-1-6-thinking-250615',
                status: 'running',
                metrics: {
                    responseTime: 1280,
                    successRate: 99.1,
                    requestsPerMinute: 45,
                    errorRate: 0.9,
                    lastUpdated: new Date(),
                    costPerRequest: 0.028
                },
                usage: {
                    totalRequests: 12500,
                    totalTokens: 1250000,
                    dailyCost: 138
                }
            },
            {
                id: 'doubao-image-service',
                name: '豆包图像生成模型',
                provider: '字节跳动豆包',
                version: 'doubao-seedream-3-0-t2i-250415',
                status: 'running',
                metrics: {
                    responseTime: 1018,
                    successRate: 97.6,
                    requestsPerMinute: 28,
                    errorRate: 2.4,
                    lastUpdated: new Date(),
                    costPerRequest: 0.045
                },
                usage: {
                    totalRequests: 3200,
                    totalTokens: 0,
                    dailyCost: 115
                }
            },
            {
                id: 'doubao-tts-service',
                name: '豆包语音合成模型',
                provider: '字节跳动豆包',
                version: 'doubao-tts-bigmodel',
                status: 'running',
                metrics: {
                    responseTime: 850,
                    successRate: 98.9,
                    requestsPerMinute: 15,
                    errorRate: 1.1,
                    lastUpdated: new Date(),
                    costPerRequest: 0.015
                },
                usage: {
                    totalRequests: 1800,
                    totalTokens: 0,
                    dailyCost: 45
                }
            },
            {
                id: 'volcano-search-service',
                name: '火山引擎搜索服务',
                provider: '字节跳动火山引擎',
                version: 'volcano-fusion-search',
                status: 'running',
                metrics: {
                    responseTime: 148,
                    successRate: 98.9,
                    requestsPerMinute: 85,
                    errorRate: 1.1,
                    lastUpdated: new Date(),
                    costPerRequest: 0.008
                },
                usage: {
                    totalRequests: 8500,
                    totalTokens: 0,
                    dailyCost: 28
                }
            }
        ];
        // 模拟性能日志
        this.mockLogs = [
            {
                id: '1',
                timestamp: new Date(Date.now() - 1000 * 60 * 3),
                level: 'INFO',
                service: 'OpenAI-GPT4',
                message: 'OpenAI GPT-4 API调用成功，响应时间: 1420ms，消耗token: 1250'
            },
            {
                id: '2',
                timestamp: new Date(Date.now() - 1000 * 60 * 6),
                level: 'WARNING',
                service: 'Baidu-ERNIE',
                message: '百度文心一言API响应时间较长: 2100ms，建议检查网络连接'
            },
            {
                id: '3',
                timestamp: new Date(Date.now() - 1000 * 60 * 9),
                level: 'ERROR',
                service: 'Alibaba-Tongyi',
                message: '阿里通义千问API调用失败，错误码: 429，已触发重试机制'
            },
            {
                id: '4',
                timestamp: new Date(Date.now() - 1000 * 60 * 13),
                level: 'INFO',
                service: 'Database-Optimizer',
                message: '数据库查询优化完成，查询时间从250ms优化至85ms'
            },
            {
                id: '5',
                timestamp: new Date(Date.now() - 1000 * 60 * 15),
                level: 'INFO',
                service: 'OpenAI-GPT4',
                message: 'OpenAI API每日配额使用率: 65%，预计费用: $180'
            }
        ];
        // 模拟性能警报
        this.mockAlerts = [
            {
                id: '1',
                severity: 'warning',
                title: 'OpenAI API响应时间异常',
                description: 'OpenAI GPT-4 API平均响应时间超过2秒，可能影响用户体验',
                timestamp: new Date(Date.now() - 1000 * 60 * 15),
                resolved: false,
                source: 'OpenAI Monitor'
            },
            {
                id: '2',
                severity: 'critical',
                title: '百度文心一言API配额不足',
                description: '百度文心一言API今日配额已使用95%，请及时充值或切换服务',
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
                resolved: false,
                source: 'Baidu API Monitor'
            },
            {
                id: '3',
                severity: 'info',
                title: 'AI服务成本预警',
                description: '本月AI服务总成本已达到预算的80%，建议优化调用策略',
                timestamp: new Date(Date.now() - 1000 * 60 * 45),
                resolved: false,
                source: 'Cost Monitor'
            }
        ];
        /**
         * 获取系统状态概览
         * GET /api/ai/performance/system-status
         */
        this.getSystemStatus = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var systemMetrics, systemStatus, statusData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.systemMonitor.getSystemMetrics()];
                    case 1:
                        systemMetrics = _a.sent();
                        systemStatus = this.calculateSystemStatus(systemMetrics);
                        statusData = {
                            status: systemStatus.status,
                            message: systemStatus.message,
                            metrics: {
                                cpu: {
                                    usage: systemMetrics.cpu.usage,
                                    cores: systemMetrics.cpu.cores,
                                    temperature: systemMetrics.cpu.temperature
                                },
                                memory: {
                                    usage: systemMetrics.memory.usage,
                                    total: systemMetrics.memory.total,
                                    used: systemMetrics.memory.used,
                                    free: systemMetrics.memory.free
                                },
                                // 模拟GPU数据（实际环境中需要nvidia-ml-py等库）
                                gpu: {
                                    usage: this.getGPUUsage(),
                                    model: 'NVIDIA RTX 4090',
                                    memory: {
                                        used: 8.2,
                                        total: 24.0,
                                        usage: 34.2
                                    }
                                },
                                network: systemMetrics.network,
                                uptime: systemMetrics.system.uptime
                            },
                            lastUpdated: new Date()
                        };
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, statusData, '获取系统状态成功')];
                }
            });
        }); });
        /**
         * 获取AI模型性能数据
         * GET /api/ai/performance/models
         */
        this.getAIModelsPerformance = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, timeRange, servicesData;
            return __generator(this, function (_b) {
                _a = req.query.timeRange, timeRange = _a === void 0 ? '24h' : _a;
                servicesData = this.updateServicesWithTimeRange(this.mockAIServices, timeRange);
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        services: servicesData,
                        timeRange: timeRange,
                        totalServices: servicesData.length,
                        runningServices: servicesData.filter(function (s) { return s.status === 'running'; }).length,
                        averageSuccessRate: servicesData.reduce(function (sum, s) { return sum + s.metrics.successRate; }, 0) / servicesData.length,
                        totalDailyCost: servicesData.reduce(function (sum, s) { return sum + s.usage.dailyCost; }, 0),
                        lastUpdated: new Date()
                    }, '获取第三方AI服务性能数据成功')];
            });
        }); });
        /**
         * 获取性能日志
         * GET /api/ai/performance/logs
         */
        this.getPerformanceLogs = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, level, _c, limit, filteredLogs, limitNum;
            return __generator(this, function (_d) {
                _a = req.query, _b = _a.level, level = _b === void 0 ? 'all' : _b, _c = _a.limit, limit = _c === void 0 ? '50' : _c;
                filteredLogs = __spreadArray([], this.mockLogs, true);
                // 按日志级别过滤
                if (level !== 'all') {
                    filteredLogs = filteredLogs.filter(function (log) { return log.level === level; });
                }
                limitNum = parseInt(limit, 10);
                filteredLogs = filteredLogs.slice(0, limitNum);
                // 按时间倒序排序
                filteredLogs.sort(function (a, b) { return b.timestamp.getTime() - a.timestamp.getTime(); });
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        logs: filteredLogs,
                        total: filteredLogs.length,
                        filters: { level: level, limit: limit },
                        lastUpdated: new Date()
                    }, '获取性能日志成功')];
            });
        }); });
        /**
         * 获取性能警报
         * GET /api/ai/performance/alerts
         */
        this.getPerformanceAlerts = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, resolved, filteredAlerts, isResolved_1;
            return __generator(this, function (_b) {
                _a = req.query.resolved, resolved = _a === void 0 ? 'false' : _a;
                filteredAlerts = __spreadArray([], this.mockAlerts, true);
                // 按解决状态过滤
                if (resolved !== 'all') {
                    isResolved_1 = resolved === 'true';
                    filteredAlerts = filteredAlerts.filter(function (alert) { return alert.resolved === isResolved_1; });
                }
                // 按时间倒序排序
                filteredAlerts.sort(function (a, b) { return b.timestamp.getTime() - a.timestamp.getTime(); });
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        alerts: filteredAlerts,
                        total: filteredAlerts.length,
                        unresolved: filteredAlerts.filter(function (a) { return !a.resolved; }).length,
                        critical: filteredAlerts.filter(function (a) { return a.severity === 'critical'; }).length,
                        lastUpdated: new Date()
                    }, '获取性能警报成功')];
            });
        }); });
        /**
         * 刷新性能数据
         * POST /api/ai/performance/refresh
         */
        this.refreshPerformanceData = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // 模拟数据刷新过程
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 1:
                        // 模拟数据刷新过程
                        _a.sent();
                        // 更新服务数据
                        this.updateServiceMetrics();
                        // 添加新的日志条目
                        this.addNewLogEntry();
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                                refreshed: true,
                                timestamp: new Date(),
                                message: '性能数据已刷新'
                            }, '刷新性能数据成功')];
                }
            });
        }); });
        /**
         * 导出性能报告
         * GET /api/ai/performance/export
         */
        this.exportPerformanceReport = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, format, _c, timeRange, systemMetrics, servicesData, reportData;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = req.query, _b = _a.format, format = _b === void 0 ? 'json' : _b, _c = _a.timeRange, timeRange = _c === void 0 ? '24h' : _c;
                        return [4 /*yield*/, this.systemMonitor.getSystemMetrics()];
                    case 1:
                        systemMetrics = _d.sent();
                        servicesData = this.updateServicesWithTimeRange(this.mockAIServices, timeRange);
                        reportData = {
                            reportInfo: {
                                generatedAt: new Date(),
                                timeRange: timeRange,
                                format: format
                            },
                            systemStatus: {
                                cpu: systemMetrics.cpu,
                                memory: systemMetrics.memory,
                                gpu: { usage: this.getGPUUsage() },
                                uptime: systemMetrics.system.uptime
                            },
                            aiServices: servicesData,
                            alerts: this.mockAlerts.filter(function (a) { return !a.resolved; }),
                            summary: {
                                totalServices: servicesData.length,
                                runningServices: servicesData.filter(function (s) { return s.status === 'running'; }).length,
                                avgResponseTime: servicesData.reduce(function (sum, s) { return sum + s.metrics.responseTime; }, 0) / servicesData.length,
                                avgSuccessRate: servicesData.reduce(function (sum, s) { return sum + s.metrics.successRate; }, 0) / servicesData.length,
                                totalDailyCost: servicesData.reduce(function (sum, s) { return sum + s.usage.dailyCost; }, 0)
                            }
                        };
                        if (format === 'json') {
                            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, reportData, '导出性能报告成功')];
                        }
                        else {
                            // 其他格式的导出可以在这里实现
                            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { downloadUrl: '/api/ai/performance/download-report' }, '报告生成中，请稍后下载')];
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    }
    // 私有辅助方法
    AIPerformanceMonitorController.prototype.calculateSystemStatus = function (metrics) {
        var cpuThreshold = 80;
        var memoryThreshold = 85;
        var gpuThreshold = 90;
        var gpuUsage = this.getGPUUsage();
        if (metrics.cpu.usage > cpuThreshold || metrics.memory.usage > memoryThreshold || gpuUsage > gpuThreshold) {
            return {
                status: 'warning',
                message: '系统资源使用率偏高，建议优化'
            };
        }
        return {
            status: 'normal',
            message: '所有服务运行正常'
        };
    };
    AIPerformanceMonitorController.prototype.getGPUUsage = function () {
        // 模拟GPU使用率，实际环境中需要调用nvidia-ml-py等库
        return Math.floor(Math.random() * 30) + 20; // 20-50%之间的随机值
    };
    AIPerformanceMonitorController.prototype.updateServicesWithTimeRange = function (services, timeRange) {
        // 根据时间范围调整服务数据
        return services.map(function (service) { return (__assign(__assign({}, service), { metrics: __assign(__assign({}, service.metrics), { 
                // 模拟时间范围对数据的影响
                responseTime: service.metrics.responseTime + Math.floor(Math.random() * 200) - 100, requestsPerMinute: Math.max(0, service.metrics.requestsPerMinute + Math.floor(Math.random() * 10) - 5), errorRate: Math.max(0, service.metrics.errorRate + (Math.random() - 0.5) * 0.5), successRate: Math.min(100, Math.max(90, service.metrics.successRate + (Math.random() - 0.5) * 2)), lastUpdated: new Date() }), usage: __assign(__assign({}, service.usage), { totalRequests: service.usage.totalRequests + Math.floor(Math.random() * 100), dailyCost: Math.max(0, service.usage.dailyCost + (Math.random() - 0.5) * 20) }) })); });
    };
    AIPerformanceMonitorController.prototype.updateServiceMetrics = function () {
        // 模拟更新服务指标
        this.mockAIServices.forEach(function (service) {
            if (service.status === 'running') {
                service.metrics.responseTime += Math.floor(Math.random() * 200) - 100;
                service.metrics.requestsPerMinute = Math.max(0, service.metrics.requestsPerMinute + Math.floor(Math.random() * 6) - 3);
                service.metrics.errorRate = Math.max(0, service.metrics.errorRate + (Math.random() - 0.5) * 0.5);
                service.metrics.successRate = Math.min(100, Math.max(90, service.metrics.successRate + (Math.random() - 0.5) * 2));
                service.metrics.lastUpdated = new Date();
                service.usage.totalRequests += Math.floor(Math.random() * 10);
                service.usage.dailyCost = Math.max(0, service.usage.dailyCost + (Math.random() - 0.5) * 5);
            }
        });
    };
    AIPerformanceMonitorController.prototype.addNewLogEntry = function () {
        // 添加新的日志条目
        var newLog = {
            id: (this.mockLogs.length + 1).toString(),
            timestamp: new Date(),
            level: 'INFO',
            service: 'Performance-Monitor',
            message: '性能数据已刷新，所有指标正常'
        };
        this.mockLogs.unshift(newLog);
        // 保持日志数量在合理范围内
        if (this.mockLogs.length > 100) {
            this.mockLogs = this.mockLogs.slice(0, 100);
        }
    };
    return AIPerformanceMonitorController;
}());
exports.AIPerformanceMonitorController = AIPerformanceMonitorController;
