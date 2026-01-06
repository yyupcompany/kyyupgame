"use strict";
/**
 * 基础API路由
 * 提供API基本信息和健康检查
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var apiResponse_1 = require("../utils/apiResponse");
// 导入客户管理路由
var customers_routes_1 = __importDefault(require("./customers.routes"));
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api:
 *   get:
 *     summary: API基本信息
 *     tags: [API]
 *     responses:
 *       200:
 *         description: 成功返回API基本信息
 */
router.get('/', function (req, res) {
    var apiInfo = {
        name: 'Kindergarten Management System API',
        version: '1.0.0',
        description: '幼儿园管理系统后端API服务',
        endpoints: '/api/list',
        documentation: '/api-docs',
        status: 'running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    };
    apiResponse_1.ApiResponse.success(res, apiInfo, 'API服务正常运行');
});
/**
 * @swagger
 * /api/version:
 *   get:
 *     summary: 获取API版本信息
 *     tags: [API]
 *     responses:
 *       200:
 *         description: 成功返回版本信息
 */
router.get('/version', function (req, res) {
    var versionInfo = {
        version: '1.0.0',
        buildDate: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
    };
    apiResponse_1.ApiResponse.success(res, versionInfo, 'API版本信息');
});
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: API健康检查
 *     tags: [API]
 *     responses:
 *       200:
 *         description: 服务健康状态
 */
router.get('/health', function (req, res) {
    var memoryUsage = process.memoryUsage();
    var cpuUsage = process.cpuUsage();
    var healthInfo = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            rss: Math.round(memoryUsage.rss / 1024 / 1024)
        },
        cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system
        },
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform
    };
    apiResponse_1.ApiResponse.success(res, healthInfo, 'API健康状态正常');
});
// 注册客户管理路由
router.use('/customers', customers_routes_1["default"]);
exports["default"] = router;
