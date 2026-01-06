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
exports.__esModule = true;
var express_1 = require("express");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var apiResponse_1 = require("../utils/apiResponse");
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var system_monitor_service_1 = require("../services/system-monitor.service");
var user_model_1 = require("../models/user.model");
var router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: System
 *   description: 系统管理接口
 */
/**
 * @swagger
 * /system:
 *   get:
 *     summary: 系统健康检查
 *     tags: [System]
 *     description: 检查系统运行状态
 *     responses:
 *       200:
 *         description: 系统运行正常
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "请求成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "healthy"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     uptime:
 *                       type: number
 *                       description: 系统运行时间（秒）
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *       500:
 *         description: 系统错误
 */
// 健康检查 (支持根路径)
router.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    version: '1.0.0'
                })];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '健康检查失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /system/health:
 *   get:
 *     summary: 系统健康检查
 *     tags: [System]
 *     description: 检查系统运行状态
 *     responses:
 *       200:
 *         description: 系统运行正常
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "请求成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "healthy"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     uptime:
 *                       type: number
 *                       description: 系统运行时间（秒）
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *       500:
 *         description: 系统错误
 */
// 健康检查
router.get('/health', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    version: '1.0.0'
                })];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '健康检查失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /system/docs:
 *   get:
 *     summary: 获取API文档
 *     tags: [System]
 *     description: 获取API文档信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取API文档成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "请求成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "API文档功能暂未实现"
 *                     docs_url:
 *                       type: string
 *                       example: "/api-docs"
 *                     swagger_url:
 *                       type: string
 *                       example: "/swagger"
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
 */
// 获取API文档
router.get('/docs', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                    message: 'API文档功能暂未实现',
                    docs_url: '/api-docs',
                    swagger_url: '/swagger'
                })];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取API文档失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /system/info:
 *   get:
 *     summary: 获取系统信息
 *     tags: [System]
 *     description: 获取系统运行信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取系统信息成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "请求成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "幼儿园管理系统"
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *                     environment:
 *                       type: string
 *                       example: "development"
 *                     uptime:
 *                       type: number
 *                       description: 系统运行时间（秒）
 *                     memory:
 *                       type: object
 *                       properties:
 *                         rss:
 *                           type: number
 *                         heapTotal:
 *                           type: number
 *                         heapUsed:
 *                           type: number
 *                         external:
 *                           type: number
 *                         arrayBuffers:
 *                           type: number
 *                     platform:
 *                       type: string
 *                       example: "linux"
 *                     node_version:
 *                       type: string
 *                       example: "v18.17.0"
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
 */
// 获取系统信息
router.get('/info', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var systemInfo;
    return __generator(this, function (_a) {
        try {
            systemInfo = {
                name: '幼儿园管理系统',
                version: '1.0.0',
                environment: process.env.NODE_ENV || 'development',
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                platform: process.platform,
                node_version: process.version
            };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, systemInfo)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取系统信息失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/system/stats:
 *   get:
 *     summary: 获取系统统计数据
 *     description: 获取系统仪表板所需的统计数据
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取系统统计数据成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     userCount:
 *                       type: integer
 *                       description: 系统用户总数
 *                     activeUsers:
 *                       type: integer
 *                       description: 今日活跃用户数
 *                     roleCount:
 *                       type: integer
 *                       description: 系统角色总数
 *                     permissionCount:
 *                       type: integer
 *                       description: 权限总数
 *                     todayLogCount:
 *                       type: integer
 *                       description: 今日日志数量
 *                     errorLogCount:
 *                       type: integer
 *                       description: 错误日志数量
 *                     uptime:
 *                       type: string
 *                       description: 系统运行时间
 *                     cpuUsage:
 *                       type: number
 *                       description: CPU使用率
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
 */
// 获取系统统计数据
router.get('/stats', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var systemMonitor, metrics, userCountResult, userCount, activeUsersResult, activeUsers, roleCountResult, roleCount, permissionCountResult, permissionCount, todayLogCountResult, todayLogCount, errorLogCountResult, errorLogCount, uptime, stats, error_1;
    var _a, _b, _c, _d, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _g.trys.push([0, 8, , 9]);
                systemMonitor = system_monitor_service_1.SystemMonitorService.getInstance();
                return [4 /*yield*/, systemMonitor.getSystemMetrics()];
            case 1:
                metrics = _g.sent();
                return [4 /*yield*/, init_1.sequelize.query('SELECT COUNT(*) as count FROM users', { type: sequelize_1.QueryTypes.SELECT })];
            case 2:
                userCountResult = _g.sent();
                userCount = ((_a = userCountResult[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
                return [4 /*yield*/, init_1.sequelize.query('SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()', { type: sequelize_1.QueryTypes.SELECT })];
            case 3:
                activeUsersResult = _g.sent();
                activeUsers = ((_b = activeUsersResult[0]) === null || _b === void 0 ? void 0 : _b.count) || 0;
                return [4 /*yield*/, init_1.sequelize.query('SELECT COUNT(*) as count FROM roles', { type: sequelize_1.QueryTypes.SELECT })];
            case 4:
                roleCountResult = _g.sent();
                roleCount = ((_c = roleCountResult[0]) === null || _c === void 0 ? void 0 : _c.count) || 0;
                return [4 /*yield*/, init_1.sequelize.query('SELECT COUNT(*) as count FROM permissions', { type: sequelize_1.QueryTypes.SELECT })];
            case 5:
                permissionCountResult = _g.sent();
                permissionCount = ((_d = permissionCountResult[0]) === null || _d === void 0 ? void 0 : _d.count) || 0;
                return [4 /*yield*/, init_1.sequelize.query('SELECT COUNT(*) as count FROM system_logs WHERE DATE(created_at) = CURDATE()', { type: sequelize_1.QueryTypes.SELECT })];
            case 6:
                todayLogCountResult = _g.sent();
                todayLogCount = ((_e = todayLogCountResult[0]) === null || _e === void 0 ? void 0 : _e.count) || 0;
                return [4 /*yield*/, init_1.sequelize.query('SELECT COUNT(*) as count FROM system_logs WHERE level = "error" AND DATE(created_at) = CURDATE()', { type: sequelize_1.QueryTypes.SELECT })];
            case 7:
                errorLogCountResult = _g.sent();
                errorLogCount = ((_f = errorLogCountResult[0]) === null || _f === void 0 ? void 0 : _f.count) || 0;
                uptime = systemMonitor.formatUptime(metrics.system.uptime);
                stats = {
                    userCount: Number(userCount),
                    activeUsers: Number(activeUsers),
                    roleCount: Number(roleCount),
                    permissionCount: Number(permissionCount),
                    todayLogCount: Number(todayLogCount),
                    errorLogCount: Number(errorLogCount),
                    uptime: uptime,
                    cpuUsage: metrics.cpu.usage,
                    // 新增真实监控数据
                    systemMetrics: {
                        cpu: metrics.cpu,
                        memory: metrics.memory,
                        disk: metrics.disk,
                        network: metrics.network,
                        security: metrics.security,
                        performance: metrics.performance,
                        healthScore: Math.round((metrics.performance.score + metrics.security.score) / 2)
                    }
                };
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, stats, '获取系统统计数据成功')];
            case 8:
                error_1 = _g.sent();
                console.error('获取系统统计数据失败:', error_1);
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_1, '获取系统统计数据失败')];
            case 9: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/system/detail-info:
 *   get:
 *     summary: 获取系统详细信息
 *     description: 获取系统的详细配置和运行信息
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取系统详细信息成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     version:
 *                       type: string
 *                       description: 系统版本
 *                     lastUpdate:
 *                       type: string
 *                       description: 最后更新时间
 *                     os:
 *                       type: string
 *                       description: 操作系统
 *                     database:
 *                       type: string
 *                       description: 数据库信息
 *                     memoryUsage:
 *                       type: string
 *                       description: 内存使用情况
 *                     diskSpace:
 *                       type: string
 *                       description: 磁盘空间使用情况
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
 */
// 获取系统详细信息
router.get('/detail-info', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var systemMonitor, metrics, detailInfo, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                systemMonitor = system_monitor_service_1.SystemMonitorService.getInstance();
                return [4 /*yield*/, systemMonitor.getSystemMetrics()];
            case 1:
                metrics = _a.sent();
                detailInfo = {
                    version: 'v1.0.0',
                    lastUpdate: '2024-01-01',
                    os: "".concat(metrics.system.platform, " ").concat(metrics.system.arch),
                    database: 'MySQL 8.0',
                    memoryUsage: "".concat(metrics.memory.used, "GB / ").concat(metrics.memory.total, "GB"),
                    diskSpace: "".concat(metrics.disk.used, "GB / ").concat(metrics.disk.total, "GB"),
                    nodeVersion: metrics.system.nodeVersion,
                    uptime: systemMonitor.formatUptime(metrics.system.uptime),
                    loadAverage: metrics.system.loadAverage.map(function (load) { return Math.round(load * 100) / 100; }),
                    // 详细的系统指标
                    detailedMetrics: {
                        cpu: {
                            usage: metrics.cpu.usage,
                            cores: metrics.cpu.cores,
                            temperature: metrics.cpu.temperature
                        },
                        memory: {
                            total: metrics.memory.total,
                            used: metrics.memory.used,
                            free: metrics.memory.free,
                            usage: metrics.memory.usage
                        },
                        disk: {
                            total: metrics.disk.total,
                            used: metrics.disk.used,
                            free: metrics.disk.free,
                            usage: metrics.disk.usage
                        },
                        network: {
                            latency: metrics.network.latency
                        }
                    }
                };
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, detailInfo, '获取系统详细信息成功')];
            case 2:
                error_2 = _a.sent();
                console.error('获取系统详细信息失败:', error_2);
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_2, '获取系统详细信息失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /system/test/database:
 *   get:
 *     summary: 测试数据库连接
 *     tags: [System]
 *     description: 测试数据库连接状态
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 数据库连接测试成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "请求成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "connected"
 *                     test_query:
 *                       type: object
 *                       properties:
 *                         test:
 *                           type: integer
 *                           example: 1
 *                     message:
 *                       type: string
 *                       example: "数据库连接正常"
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 数据库连接失败
 */
// 测试数据库连接
router.get('/test/database', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, init_1.sequelize.authenticate()];
            case 1:
                _a.sent();
                return [4 /*yield*/, init_1.sequelize.query('SELECT 1 as test', { type: sequelize_1.QueryTypes.SELECT })];
            case 2:
                result = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        status: 'connected',
                        test_query: result[0],
                        message: '数据库连接正常'
                    })];
            case 3:
                error_3 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_3, '数据库连接测试失败')];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /system/test/email:
 *   get:
 *     summary: 测试邮件服务状态
 *     tags: [System]
 *     description: 获取邮件服务状态
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       501:
 *         description: 邮件服务测试功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 501
 *                 message:
 *                   type: string
 *                   example: "邮件服务测试功能暂未实现"
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
 */
// 测试邮件服务 (GET)
router.get('/test/email', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '邮件服务测试功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '邮件服务测试失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /system/test/email:
 *   post:
 *     summary: 测试邮件发送
 *     tags: [System]
 *     description: 测试邮件发送功能
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 example: "test@example.com"
 *                 description: 收件人邮箱
 *               subject:
 *                 type: string
 *                 example: "测试邮件"
 *                 description: 邮件主题
 *               content:
 *                 type: string
 *                 example: "这是一封测试邮件"
 *                 description: 邮件内容
 *     responses:
 *       200:
 *         description: 邮件发送模拟成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "请求成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "simulated"
 *                     to:
 *                       type: string
 *                       example: "test@example.com"
 *                     subject:
 *                       type: string
 *                       example: "测试邮件"
 *                     content:
 *                       type: string
 *                       example: "这是一封测试邮件"
 *                     message:
 *                       type: string
 *                       example: "邮件发送模拟成功"
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
 */
// 测试邮件服务 (POST)
router.post('/test/email', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, to, subject, content;
    return __generator(this, function (_b) {
        try {
            _a = req.body, to = _a.to, subject = _a.subject, content = _a.content;
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                    status: 'simulated',
                    to: to || 'test@example.com',
                    subject: subject || '测试邮件',
                    content: content || '这是一封测试邮件',
                    message: '邮件发送模拟成功'
                })];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '邮件服务测试失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /system/test/sms:
 *   post:
 *     summary: 测试短信发送
 *     tags: [System]
 *     description: 测试短信发送功能
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "13800138000"
 *                 description: 接收短信的手机号
 *               content:
 *                 type: string
 *                 example: "这是一条测试短信"
 *                 description: 短信内容
 *     responses:
 *       200:
 *         description: 短信发送模拟成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "请求成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "simulated"
 *                     phone:
 *                       type: string
 *                       example: "13800138000"
 *                     content:
 *                       type: string
 *                       example: "这是一条测试短信"
 *                     message:
 *                       type: string
 *                       example: "短信发送模拟成功"
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
 */
// 测试短信服务 (POST)
router.post('/test/sms', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, phone, content;
    return __generator(this, function (_b) {
        try {
            _a = req.body, phone = _a.phone, content = _a.content;
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                    status: 'simulated',
                    phone: phone || '13800138000',
                    content: content || '这是一条测试短信',
                    message: '短信发送模拟成功'
                })];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '短信服务测试失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /system/upload:
 *   post:
 *     summary: 系统文件上传
 *     tags: [System]
 *     description: 系统文件上传功能
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 要上传的文件
 *     responses:
 *       200:
 *         description: 文件上传模拟成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "请求成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: "/uploads/system/logo_1625097600000.png"
 *                     filename:
 *                       type: string
 *                       example: "logo.png"
 *                     size:
 *                       type: number
 *                       example: 1024
 *                     message:
 *                       type: string
 *                       example: "文件上传模拟成功"
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
 */
// 系统文件上传
router.post('/upload', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            // 模拟文件上传成功
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                    url: '/uploads/system/logo_' + Date.now() + '.png',
                    filename: 'logo.png',
                    size: 1024,
                    message: '文件上传模拟成功'
                })];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '文件上传失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /system/cache/clear:
 *   delete:
 *     summary: 清理缓存 (DELETE)
 *     tags: [System]
 *     description: 清理系统缓存
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       501:
 *         description: 清理缓存功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 501
 *                 message:
 *                   type: string
 *                   example: "清理缓存功能暂未实现"
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
 */
// 清理缓存 (DELETE)
router["delete"]('/cache/clear', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '清理缓存功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '清理缓存失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /system/cache/clear:
 *   post:
 *     summary: 清理缓存 (POST)
 *     tags: [System]
 *     description: 清理系统缓存
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 缓存清理模拟成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "请求成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "simulated"
 *                     cleared_items:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["user_cache", "api_cache", "session_cache"]
 *                     message:
 *                       type: string
 *                       example: "缓存清理模拟成功"
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
 */
// 清理缓存 (POST)
router.post('/cache/clear', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                    status: 'simulated',
                    cleared_items: ['user_cache', 'api_cache', 'session_cache'],
                    message: '缓存清理模拟成功'
                })];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '清理缓存失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /system/version:
 *   get:
 *     summary: 获取版本信息
 *     tags: [System]
 *     description: 获取系统版本信息
 *     responses:
 *       200:
 *         description: 获取版本信息成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "请求成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *                     build:
 *                       type: string
 *                       example: "20250610"
 *                     environment:
 *                       type: string
 *                       example: "development"
 *                     api_version:
 *                       type: string
 *                       example: "v1"
 *                     last_updated:
 *                       type: string
 *                       example: "2025-06-10"
 *       500:
 *         description: 系统错误
 */
// 获取版本信息
router.get('/version', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                    version: '1.0.0',
                    build: '20250610',
                    environment: process.env.NODE_ENV || 'development',
                    api_version: 'v1',
                    last_updated: '2025-06-10'
                })];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取版本信息失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /system/logs:
 *   get:
 *     summary: 获取系统日志
 *     tags: [System]
 *     description: 获取系统日志列表，支持分页和筛选
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [info, warn, error, debug]
 *         description: 日志级别
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 日志分类
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 开始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 结束日期
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 关键词搜索
 *     responses:
 *       200:
 *         description: 获取系统日志成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "获取系统日志成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           level:
 *                             type: string
 *                             example: "info"
 *                           category:
 *                             type: string
 *                             example: "system"
 *                           message:
 *                             type: string
 *                             example: "系统启动"
 *                           details:
 *                             type: string
 *                           ip_address:
 *                             type: string
 *                             example: "127.0.0.1"
 *                           user_id:
 *                             type: integer
 *                           source:
 *                             type: string
 *                             example: "system"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 20
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 系统错误
 */
// 获取系统日志 - 映射到系统日志路由
router.get('/logs', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('SYSTEM_LOG_VIEW'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, pageSize, level, category, startDate, endDate, keyword, whereClause, replacements, offset, logsQuery, countQuery, _d, logs, countResult, total, error_4;
    var _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 2, , 3]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 20 : _c, level = _a.level, category = _a.category, startDate = _a.startDate, endDate = _a.endDate, keyword = _a.keyword;
                whereClause = 'WHERE 1=1';
                replacements = {};
                if (level) {
                    whereClause += ' AND level = :level';
                    replacements.level = level;
                }
                if (category) {
                    whereClause += ' AND category = :category';
                    replacements.category = category;
                }
                if (startDate) {
                    whereClause += ' AND created_at >= :startDate';
                    replacements.startDate = startDate;
                }
                if (endDate) {
                    whereClause += ' AND created_at <= :endDate';
                    replacements.endDate = endDate;
                }
                if (keyword) {
                    whereClause += ' AND (message LIKE :keyword OR details LIKE :keyword)';
                    replacements.keyword = "%".concat(keyword, "%");
                }
                offset = (Number(page) - 1) * Number(pageSize);
                replacements.limit = Number(pageSize);
                replacements.offset = offset;
                logsQuery = "\n      SELECT \n        id, level, category, message, details, ip_address, \n        user_id, source, created_at\n      FROM system_logs \n      ".concat(whereClause, "\n      ORDER BY created_at DESC \n      LIMIT :limit OFFSET :offset\n    ");
                countQuery = "\n      SELECT COUNT(*) as total \n      FROM system_logs \n      ".concat(whereClause, "\n    ");
                return [4 /*yield*/, Promise.all([
                        init_1.sequelize.query(logsQuery, {
                            replacements: replacements,
                            type: sequelize_1.QueryTypes.SELECT
                        }),
                        init_1.sequelize.query(countQuery, {
                            replacements: __assign(__assign({}, replacements), { limit: undefined, offset: undefined }),
                            type: sequelize_1.QueryTypes.SELECT
                        })
                    ])];
            case 1:
                _d = _f.sent(), logs = _d[0], countResult = _d[1];
                total = ((_e = countResult[0]) === null || _e === void 0 ? void 0 : _e.total) || 0;
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        items: logs,
                        total: Number(total),
                        page: Number(page),
                        pageSize: Number(pageSize),
                        totalPages: Math.ceil(Number(total) / Number(pageSize))
                    }, '获取系统日志成功')];
            case 2:
                error_4 = _f.sent();
                console.error('获取系统日志失败:', error_4);
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_4, '获取系统日志失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /system/configs:
 *   get:
 *     summary: 获取系统配置
 *     tags: [System]
 *     description: 获取系统配置信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: group
 *         schema:
 *           type: string
 *         description: 配置分组
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *         description: 配置键
 *     responses:
 *       200:
 *         description: 获取系统配置成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "获取系统配置成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     configs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           group:
 *                             type: string
 *                           key:
 *                             type: string
 *                           value:
 *                             type: string
 *                           description:
 *                             type: string
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
 */
router.get('/configs', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, group, key, whereClause, replacements, configsQuery, configs, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, group = _a.group, key = _a.key;
                whereClause = '';
                replacements = {};
                if (group) {
                    whereClause += 'WHERE config_group = :group';
                    replacements.group = group;
                }
                if (key) {
                    whereClause += whereClause ? ' AND ' : 'WHERE ';
                    whereClause += 'config_key = :key';
                    replacements.key = key;
                }
                configsQuery = "\n      SELECT \n        id, config_group as 'group', config_key as 'key', \n        config_value as 'value', description, updated_at as updatedAt\n      FROM system_configs \n      ".concat(whereClause, "\n      ORDER BY config_group, config_key\n    ");
                return [4 /*yield*/, init_1.sequelize.query(configsQuery, {
                        replacements: replacements,
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                configs = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        configs: configs,
                        total: configs.length,
                        group: group || 'all',
                        timestamp: new Date().toISOString()
                    }, '获取系统配置成功')];
            case 2:
                error_5 = _b.sent();
                console.error('获取系统配置失败:', error_5);
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_5, '获取系统配置失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /system/configs:
 *   post:
 *     summary: 创建系统配置
 *     tags: [System]
 *     description: 创建新的系统配置项
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - group
 *               - key
 *               - value
 *             properties:
 *               group:
 *                 type: string
 *                 description: 配置分组
 *                 example: "system"
 *               key:
 *                 type: string
 *                 description: 配置键
 *                 example: "maintenance_mode"
 *               value:
 *                 type: string
 *                 description: 配置值
 *                 example: "false"
 *               description:
 *                 type: string
 *                 description: 配置描述
 *                 example: "系统维护模式开关"
 *     responses:
 *       201:
 *         description: 创建系统配置成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
 */
router.post('/configs', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('SYSTEM_CONFIG_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, group, key, value, description, existingConfig, insertQuery, error_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, group = _a.group, key = _a.key, value = _a.value, description = _a.description;
                if (!group || !key || !value) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '配置分组、键和值都是必需的', 'VALIDATION_ERROR', 400)];
                }
                return [4 /*yield*/, init_1.sequelize.query('SELECT id FROM system_configs WHERE config_group = :group AND config_key = :key', {
                        replacements: { group: group, key: key },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                existingConfig = _b.sent();
                if (existingConfig.length > 0) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '配置已存在', 'CONFIG_EXISTS', 400)];
                }
                insertQuery = "\n      INSERT INTO system_configs (config_group, config_key, config_value, description, created_at, updated_at)\n      VALUES (:group, :key, :value, :description, NOW(), NOW())\n    ";
                return [4 /*yield*/, init_1.sequelize.query(insertQuery, {
                        replacements: { group: group, key: key, value: value, description: description || '' },
                        type: sequelize_1.QueryTypes.INSERT
                    })];
            case 2:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        group: group,
                        key: key,
                        value: value,
                        description: description,
                        createdAt: new Date().toISOString()
                    }, '创建系统配置成功', 201)];
            case 3:
                error_6 = _b.sent();
                console.error('创建系统配置失败:', error_6);
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_6, '创建系统配置失败')];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /system/configs/{id}:
 *   put:
 *     summary: 更新系统配置
 *     tags: [System]
 *     description: 更新现有的系统配置项
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 配置ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *                 description: 配置值
 *               description:
 *                 type: string
 *                 description: 配置描述
 *     responses:
 *       200:
 *         description: 更新系统配置成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       404:
 *         description: 配置不存在
 *       500:
 *         description: 系统错误
 */
router.put('/configs/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('SYSTEM_CONFIG_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, value, description, existingConfig, updateQuery, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                id = req.params.id;
                _a = req.body, value = _a.value, description = _a.description;
                if (!value) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '配置值不能为空', 'VALIDATION_ERROR', 400)];
                }
                return [4 /*yield*/, init_1.sequelize.query('SELECT id, config_group, config_key FROM system_configs WHERE id = :id', {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                existingConfig = _b.sent();
                if (existingConfig.length === 0) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '配置不存在', 'CONFIG_NOT_FOUND', 404)];
                }
                updateQuery = "\n      UPDATE system_configs \n      SET config_value = :value, description = :description, updated_at = NOW()\n      WHERE id = :id\n    ";
                return [4 /*yield*/, init_1.sequelize.query(updateQuery, {
                        replacements: { id: id, value: value, description: description || '' },
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 2:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        id: parseInt(id),
                        value: value,
                        description: description,
                        updatedAt: new Date().toISOString()
                    }, '更新系统配置成功')];
            case 3:
                error_7 = _b.sent();
                console.error('更新系统配置失败:', error_7);
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_7, '更新系统配置失败')];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ==================== 用户管理路由 ====================
/**
 * @swagger
 * /system/users:
 *   get:
 *     summary: 获取用户列表
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           username:
 *                             type: string
 *                           email:
 *                             type: string
 *                           realName:
 *                             type: string
 *                           status:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 */
router.get('/users', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, pageSize, keyword, offset, limit, whereClause, replacements, usersQuery, users, countQuery, countResult, total, error_8;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 3, , 4]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, keyword = _a.keyword;
                offset = (Number(page) - 1) * Number(pageSize);
                limit = Number(pageSize);
                whereClause = '';
                replacements = { limit: limit, offset: offset };
                if (keyword) {
                    whereClause = 'WHERE username LIKE :keyword OR email LIKE :keyword OR real_name LIKE :keyword';
                    replacements.keyword = "%".concat(keyword, "%");
                }
                usersQuery = "\n      SELECT\n        u.id, u.username, u.email, u.real_name as realName,\n        u.status, u.created_at as createdAt, u.updated_at as updatedAt,\n        GROUP_CONCAT(r.name) as roles\n      FROM users u\n      LEFT JOIN user_roles ur ON u.id = ur.user_id\n      LEFT JOIN roles r ON ur.role_id = r.id\n      ".concat(whereClause, "\n      GROUP BY u.id\n      ORDER BY u.created_at DESC\n      LIMIT :limit OFFSET :offset\n    ");
                return [4 /*yield*/, init_1.sequelize.query(usersQuery, {
                        type: sequelize_1.QueryTypes.SELECT,
                        replacements: replacements
                    })];
            case 1:
                users = _e.sent();
                countQuery = "\n      SELECT COUNT(DISTINCT u.id) as total\n      FROM users u\n      ".concat(whereClause, "\n    ");
                return [4 /*yield*/, init_1.sequelize.query(countQuery, {
                        type: sequelize_1.QueryTypes.SELECT,
                        replacements: keyword ? { keyword: replacements.keyword } : {}
                    })];
            case 2:
                countResult = _e.sent();
                total = ((_d = countResult[0]) === null || _d === void 0 ? void 0 : _d.total) || 0;
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        items: users,
                        total: Number(total),
                        page: Number(page),
                        pageSize: Number(pageSize),
                        totalPages: Math.ceil(Number(total) / Number(pageSize))
                    }, '获取用户列表成功')];
            case 3:
                error_8 = _e.sent();
                console.error('获取用户列表失败:', error_8);
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_8, '获取用户列表失败')];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /system/users:
 *   post:
 *     summary: 创建用户
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               realName:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *     responses:
 *       201:
 *         description: 创建成功
 */
router.post('/users', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, email, password, realName, _b, status_1, existingUsername, existingEmail, user, error_9;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                _a = req.body, username = _a.username, email = _a.email, password = _a.password, realName = _a.realName, _b = _a.status, status_1 = _b === void 0 ? 'active' : _b;
                return [4 /*yield*/, user_model_1.User.findOne({
                        where: { username: username }
                    })];
            case 1:
                existingUsername = _c.sent();
                if (existingUsername) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '用户名已存在', 'USERNAME_EXISTS', 400)];
                }
                return [4 /*yield*/, user_model_1.User.findOne({
                        where: { email: email }
                    })];
            case 2:
                existingEmail = _c.sent();
                if (existingEmail) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '邮箱已存在', 'EMAIL_EXISTS', 400)];
                }
                return [4 /*yield*/, user_model_1.User.create({
                        username: username,
                        email: email,
                        password: password,
                        realName: realName,
                        status: status_1
                    })];
            case 3:
                user = _c.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        realName: user.realName,
                        status: user.status,
                        createdAt: user.createdAt
                    }, '创建用户成功', 201)];
            case 4:
                error_9 = _c.sent();
                console.error('创建用户失败:', error_9);
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_9, '创建用户失败')];
            case 5: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
