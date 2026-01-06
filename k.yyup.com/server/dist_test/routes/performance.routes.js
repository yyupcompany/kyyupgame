"use strict";
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
exports.__esModule = true;
var express_1 = require("express");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var apiResponse_1 = require("../utils/apiResponse");
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var os = __importStar(require("os"));
var router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     PerformanceOverview:
 *       type: object
 *       properties:
 *         totalTeachers:
 *           type: integer
 *           description: 总教师数量
 *           example: 25
 *         totalEvaluations:
 *           type: integer
 *           description: 总评估数量
 *           example: 150
 *         averageScore:
 *           type: integer
 *           description: 平均分数
 *           example: 85
 *         distribution:
 *           type: object
 *           properties:
 *             excellent:
 *               type: integer
 *               description: 优秀数量 (90分以上)
 *               example: 45
 *             good:
 *               type: integer
 *               description: 良好数量 (80-89分)
 *               example: 60
 *             pass:
 *               type: integer
 *               description: 及格数量 (60-79分)
 *               example: 35
 *             fail:
 *               type: integer
 *               description: 不及格数量 (60分以下)
 *               example: 10
 *
 *     SystemMetrics:
 *       type: object
 *       properties:
 *         cpu:
 *           type: object
 *           properties:
 *             usage:
 *               type: object
 *               description: CPU使用情况
 *             loadAverage:
 *               type: array
 *               items:
 *                 type: number
 *               description: 系统负载平均值
 *               example: [0.5, 0.7, 0.8]
 *             cores:
 *               type: integer
 *               description: CPU核心数
 *               example: 4
 *         memory:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: 总内存 (字节)
 *               example: 8589934592
 *             free:
 *               type: integer
 *               description: 空闲内存 (字节)
 *               example: 2147483648
 *             used:
 *               type: integer
 *               description: 已使用内存 (字节)
 *               example: 6442450944
 *             usage:
 *               type: string
 *               description: 内存使用率
 *               example: "75.00%"
 *         uptime:
 *           type: object
 *           properties:
 *             system:
 *               type: number
 *               description: 系统运行时间 (秒)
 *               example: 3600
 *             process:
 *               type: number
 *               description: 进程运行时间 (秒)
 *               example: 1800
 *         platform:
 *           type: string
 *           description: 操作系统平台
 *           example: "linux"
 *         arch:
 *           type: string
 *           description: 系统架构
 *           example: "x64"
 *         hostname:
 *           type: string
 *           description: 主机名
 *           example: "server-01"
 *
 *     DatabasePerformance:
 *       type: object
 *       properties:
 *         connections:
 *           type: array
 *           items:
 *             type: object
 *           description: 数据库连接状态
 *         status:
 *           type: string
 *           description: 数据库状态
 *           example: "connected"
 */
/**
 * @swagger
 * /api/performance:
 *   get:
 *     summary: 获取绩效概览
 *     description: 获取教师绩效评估的统计概览，包括总数、平均分和分数分布
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 绩效概览获取成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         overview:
 *                           $ref: '#/components/schemas/PerformanceOverview'
 *             example:
 *               success: true
 *               message: "获取成功"
 *               data:
 *                 overview:
 *                   totalTeachers: 25
 *                   totalEvaluations: 150
 *                   averageScore: 85
 *                   distribution:
 *                     excellent: 45
 *                     good: 60
 *                     pass: 35
 *                     fail: 10
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var performanceStats, tableError_1, stats, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                performanceStats = void 0;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, init_1.sequelize.query("SELECT \n           COUNT(DISTINCT teacher_id) as total_teachers,\n           AVG(score) as avg_score,\n           COUNT(*) as total_evaluations,\n           SUM(CASE WHEN score >= 90 THEN 1 ELSE 0 END) as excellent_count,\n           SUM(CASE WHEN score >= 80 AND score < 90 THEN 1 ELSE 0 END) as good_count,\n           SUM(CASE WHEN score >= 60 AND score < 80 THEN 1 ELSE 0 END) as pass_count,\n           SUM(CASE WHEN score < 60 THEN 1 ELSE 0 END) as fail_count\n         FROM performance_evaluations\n         WHERE deleted_at IS NULL", { type: sequelize_1.QueryTypes.SELECT })];
            case 2:
                performanceStats = (_a.sent())[0];
                return [3 /*break*/, 4];
            case 3:
                tableError_1 = _a.sent();
                // 表不存在时返回默认数据
                performanceStats = {
                    total_teachers: 0,
                    avg_score: 0,
                    total_evaluations: 0,
                    excellent_count: 0,
                    good_count: 0,
                    pass_count: 0,
                    fail_count: 0
                };
                return [3 /*break*/, 4];
            case 4:
                stats = performanceStats;
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        overview: {
                            totalTeachers: stats.total_teachers || 0,
                            totalEvaluations: stats.total_evaluations || 0,
                            averageScore: Math.round(stats.avg_score || 0),
                            distribution: {
                                excellent: stats.excellent_count || 0,
                                good: stats.good_count || 0,
                                pass: stats.pass_count || 0,
                                fail: stats.fail_count || 0
                            }
                        }
                    })];
            case 5:
                error_1 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_1, '获取绩效概览失败')];
            case 6: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/performance/metrics:
 *   get:
 *     summary: 获取系统性能指标
 *     description: 获取服务器的CPU、内存、运行时间等系统性能指标
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 系统性能指标获取成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SystemMetrics'
 *             example:
 *               success: true
 *               message: "获取成功"
 *               data:
 *                 cpu:
 *                   usage:
 *                     user: 123456
 *                     system: 654321
 *                   loadAverage: [0.5, 0.7, 0.8]
 *                   cores: 4
 *                 memory:
 *                   total: 8589934592
 *                   free: 2147483648
 *                   used: 6442450944
 *                   usage: "75.00%"
 *                 uptime:
 *                   system: 3600
 *                   process: 1800
 *                 platform: "linux"
 *                 arch: "x64"
 *                 hostname: "server-01"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/metrics', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var metrics;
    return __generator(this, function (_a) {
        try {
            metrics = {
                cpu: {
                    usage: process.cpuUsage(),
                    loadAverage: os.loadavg(),
                    cores: os.cpus().length
                },
                memory: {
                    total: os.totalmem(),
                    free: os.freemem(),
                    used: os.totalmem() - os.freemem(),
                    usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2) + '%'
                },
                uptime: {
                    system: os.uptime(),
                    process: process.uptime()
                },
                platform: os.platform(),
                arch: os.arch(),
                hostname: os.hostname()
            };
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, metrics)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取性能指标失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/performance/database:
 *   get:
 *     summary: 获取数据库性能
 *     description: 获取数据库连接状态和性能指标
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 数据库性能指标获取成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DatabasePerformance'
 *             example:
 *               success: true
 *               message: "获取成功"
 *               data:
 *                 connections: [
 *                   {
 *                     "Variable_name": "Threads_connected",
 *                     "Value": "5"
 *                   }
 *                 ]
 *                 status: "connected"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/database', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var dbStats, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, init_1.sequelize.query('SHOW STATUS LIKE "Threads_connected"', { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                dbStats = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        connections: dbStats,
                        status: 'connected'
                    })];
            case 2:
                error_2 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_2, '获取数据库性能失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/performance/api-stats:
 *   get:
 *     summary: 获取API响应时间统计
 *     description: 获取API接口的响应时间和调用统计信息（功能暂未实现）
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       501:
 *         description: 功能未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *             example:
 *               success: false
 *               message: "API统计功能暂未实现"
 *               error:
 *                 code: "NOT_IMPLEMENTED"
 *                 details: null
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/api-stats', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, 'API统计功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取API统计失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/performance/errors:
 *   get:
 *     summary: 获取错误日志统计
 *     description: 获取系统错误日志的统计信息（功能暂未实现）
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       501:
 *         description: 功能未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *             example:
 *               success: false
 *               message: "错误统计功能暂未实现"
 *               error:
 *                 code: "NOT_IMPLEMENTED"
 *                 details: null
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/errors', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '错误统计功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取错误统计失败')];
        }
        return [2 /*return*/];
    });
}); });
exports["default"] = router;
