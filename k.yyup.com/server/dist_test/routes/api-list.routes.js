"use strict";
/**
 * API列表路由
 * 提供所有API端点的列表和信息
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api-list:
 *   get:
 *     tags: [API管理]
 *     summary: 获取所有API端点列表
 *     description: 获取系统中所有可用的API端点，按模块分组显示
 *     responses:
 *       200:
 *         description: 成功获取API端点列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: API端点总数
 *                   example: 155
 *                 modules:
 *                   type: array
 *                   description: 按模块分组的API端点
 *                   items:
 *                     type: object
 *                     properties:
 *                       module:
 *                         type: string
 *                         description: 模块名称
 *                         example: "auth"
 *                       routes:
 *                         type: array
 *                         description: 该模块的路由列表
 *                         items:
 *                           type: object
 *                           properties:
 *                             method:
 *                               type: string
 *                               description: HTTP方法
 *                               example: "GET"
 *                             path:
 *                               type: string
 *                               description: 路由路径
 *                               example: "/auth/login"
 *       500:
 *         description: 获取API列表失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "获取API列表失败"
 */
// 获取所有API端点
router.get('/', function (req, res) {
    try {
        // 获取路由目录
        var routesDir_1 = path_1["default"].join(__dirname);
        // 读取所有路由文件
        var routeFiles = fs_1["default"].readdirSync(routesDir_1)
            .filter(function (file) { return file.endsWith('.routes.ts') || file.endsWith('.routes.js'); })
            .filter(function (file) { return file !== 'index.ts' && file !== 'index.js' && file !== 'api-list.routes.ts' && file !== 'api-list.routes.js'; });
        // 解析路由文件，获取API端点信息
        var apiEndpoints_1 = [];
        // 实际路由映射 - 从文件名到实际注册的路径前缀
        var routeMapping_1 = {
            // 基础管理路由
            'auth': 'auth',
            'user': 'users',
            'role': 'roles',
            'permission': 'permissions',
            'user-role': 'user-roles',
            'role-permission': 'role-permissions',
            // 核心业务路由
            'kindergarten': 'kindergartens',
            'class': 'classes',
            'teacher': 'teachers',
            'student': 'students',
            'parent': 'parents',
            'parent-student-relation': 'parent-student-relations',
            // 招生管理路由
            'enrollment-plan': 'enrollment-plans',
            'enrollment-quota': 'enrollment-quotas',
            'enrollment-application': 'enrollment-applications',
            'enrollment-interview': 'enrollment-interviews',
            'enrollment-consultation': 'enrollment-consultations',
            'enrollment': 'enrollment',
            'enrollment-ai': 'enrollment-ai',
            'enrollment-statistics': 'enrollment-statistics',
            'enrollment-tasks': 'enrollment-tasks',
            // 活动管理路由
            'activities': 'activities',
            'activity-plan': 'activity-plans',
            'activity-registration': 'activity-registrations',
            'activity-checkin': 'activity-checkins',
            'activity-evaluation': 'activity-evaluations',
            // 营销管理路由
            'advertisement': 'advertisements',
            'marketing-campaign': 'marketing-campaigns',
            'channel-tracking': 'channel-trackings',
            'conversion-tracking': 'conversion-trackings',
            'customer-pool': 'customer-pool',
            'customers': 'customers',
            // 录取管理路由
            'admission-result': 'admission-results',
            'admission-notification': 'admission-notifications',
            // 海报管理路由
            'poster-template': 'poster-templates',
            'poster-generation': 'poster-generations',
            // 系统管理路由
            'system-configs': 'system-configs',
            'system-logs': 'system-logs',
            'system-backup': 'system-backup',
            'system-ai-models': 'system-ai-models',
            'system': 'system',
            'admin': 'admin',
            // 功能路由
            'notifications': 'notifications',
            'schedules': 'schedules',
            'files': 'files',
            'todos': 'todos',
            'operation-logs': 'operation-logs',
            'message-templates': 'message-templates',
            // 性能管理路由
            'performance': 'performance',
            'performance-evaluations': 'performance-evaluations',
            'performance-reports': 'performance-reports',
            'performance-rule': 'performance-rule',
            // 仪表盘和统计路由
            'dashboard': 'dashboard',
            'principal': 'principal',
            'principal-performance': 'principal-performance',
            'statistics': 'statistics',
            'chat': 'chat',
            // 其他路由
            'api': 'api',
            'example': 'example',
            'errors': 'errors'
        };
        routeFiles.forEach(function (file) {
            // 从文件名中提取API模块名称
            var moduleName = file.replace(/\.routes\.(ts|js)$/, '');
            // 获取实际的路由前缀
            var routePrefix = routeMapping_1[moduleName] || moduleName;
            // 读取文件内容
            var filePath = path_1["default"].join(routesDir_1, file);
            var content = fs_1["default"].readFileSync(filePath, 'utf8');
            // 使用正则表达式查找路由定义
            var routeRegex = /router\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g;
            var routes = [];
            var match;
            while ((match = routeRegex.exec(content)) !== null) {
                var method = match[1].toUpperCase();
                var path_2 = match[2];
                routes.push({
                    method: method,
                    path: "/".concat(routePrefix).concat(path_2)
                });
            }
            if (routes.length > 0) {
                apiEndpoints_1.push({
                    module: moduleName,
                    routes: routes
                });
            }
        });
        // 按模块名称排序
        apiEndpoints_1.sort(function (a, b) { return a.module.localeCompare(b.module); });
        // 返回API端点列表
        res.json({
            total: apiEndpoints_1.reduce(function (sum, endpoint) { return sum + endpoint.routes.length; }, 0),
            modules: apiEndpoints_1
        });
    }
    catch (error) {
        console.error('获取API列表失败:', error.message);
        res.status(500).json({ error: '获取API列表失败' });
    }
});
/**
 * @swagger
 * /api-list/{module}:
 *   get:
 *     tags: [API管理]
 *     summary: 获取指定模块的API端点
 *     description: 获取指定模块的所有API端点信息
 *     parameters:
 *       - in: path
 *         name: module
 *         required: true
 *         description: 模块名称
 *         schema:
 *           type: string
 *           example: "auth"
 *     responses:
 *       200:
 *         description: 成功获取模块API端点列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 module:
 *                   type: string
 *                   description: 模块名称
 *                   example: "auth"
 *                 total:
 *                   type: integer
 *                   description: 该模块的API端点总数
 *                   example: 8
 *                 routes:
 *                   type: array
 *                   description: 该模块的路由列表
 *                   items:
 *                     type: object
 *                     properties:
 *                       method:
 *                         type: string
 *                         description: HTTP方法
 *                         example: "POST"
 *                       path:
 *                         type: string
 *                         description: 路由路径
 *                         example: "/auth/login"
 *       404:
 *         description: 未找到指定模块
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "未找到模块: auth"
 *       500:
 *         description: 获取模块API列表失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "获取模块API列表失败"
 */
// 获取指定模块的API端点
router.get('/:module', function (req, res) {
    try {
        var moduleName = req.params.module;
        var routeFile = path_1["default"].join(__dirname, "".concat(moduleName, ".routes.ts"));
        // 如果文件不存在，尝试查找.js文件
        var filePath = routeFile;
        if (!fs_1["default"].existsSync(routeFile)) {
            filePath = path_1["default"].join(__dirname, "".concat(moduleName, ".routes.js"));
            if (!fs_1["default"].existsSync(filePath)) {
                return res.status(404).json({ error: "\u672A\u627E\u5230\u6A21\u5757: ".concat(moduleName) });
            }
        }
        // 读取文件内容
        var content = fs_1["default"].readFileSync(filePath, 'utf8');
        // 使用正则表达式查找路由定义
        var routeRegex = /router\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g;
        var routes = [];
        var match = void 0;
        while ((match = routeRegex.exec(content)) !== null) {
            var method = match[1].toUpperCase();
            var path_3 = match[2];
            routes.push({
                method: method,
                path: "/".concat(moduleName).concat(path_3)
            });
        }
        // 返回模块API端点列表
        res.json({
            module: moduleName,
            total: routes.length,
            routes: routes
        });
    }
    catch (error) {
        console.error("\u83B7\u53D6\u6A21\u5757API\u5217\u8868\u5931\u8D25: ".concat(req.params.module), error.message);
        res.status(500).json({ error: '获取模块API列表失败' });
    }
});
exports["default"] = router;
