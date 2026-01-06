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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var helmet_1 = __importDefault(require("helmet"));
var dotenv_1 = __importDefault(require("dotenv"));
var path_1 = __importDefault(require("path"));
var sequelize_1 = require("sequelize");
var http_1 = require("http");
var sequelize_2 = __importDefault(require("./config/sequelize"));
var models_1 = require("./models");
var routes_1 = __importDefault(require("./routes"));
var errorHandler_1 = require("./middlewares/errorHandler");
var enrollment_statistics_routes_1 = __importDefault(require("./routes/enrollment-statistics.routes"));
var route_cache_service_1 = require("./services/route-cache.service");
var permission_watcher_service_1 = require("./services/permission-watcher.service");
// 🔧 已移除 SocketProgressMiddleware - 不再使用WebSocket
// 加载环境变量
dotenv_1["default"].config({ path: path_1["default"].resolve(__dirname, '../.env') });
console.log('加载环境变量，当前目录:', __dirname);
console.log('环境变量文件路径:', path_1["default"].resolve(__dirname, '../.env'));
// ===== 全局错误处理和防崩溃机制 =====
// 处理未捕获的异常
process.on('uncaughtException', function (error) {
    console.error('❌ 未捕获的异常:', error);
    console.error('错误堆栈:', error.stack);
    // 记录到日志文件
    var fs = require('fs');
    var logDir = path_1["default"].join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    var logFile = path_1["default"].join(logDir, 'uncaught-exceptions.log');
    var timestamp = new Date().toISOString();
    var logMessage = "[".concat(timestamp, "] \u672A\u6355\u83B7\u5F02\u5E38: ").concat(error.message, "\n\u5806\u6808: ").concat(error.stack, "\n\n");
    try {
        fs.appendFileSync(logFile, logMessage);
    }
    catch (logError) {
        console.error('无法写入日志文件:', logError);
    }
    // 不要立即退出，给服务器一个机会继续运行
    console.log('⚠️  服务器遇到未捕获异常，但将继续运行...');
});
// 处理未处理的Promise拒绝
process.on('unhandledRejection', function (reason, promise) {
    console.error('❌ 未处理的Promise拒绝:', reason);
    console.error('Promise:', promise);
    // 记录到日志文件
    var fs = require('fs');
    var logDir = path_1["default"].join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    var logFile = path_1["default"].join(logDir, 'unhandled-rejections.log');
    var timestamp = new Date().toISOString();
    var logMessage = "[".concat(timestamp, "] \u672A\u5904\u7406Promise\u62D2\u7EDD: ").concat(reason, "\n\n");
    try {
        fs.appendFileSync(logFile, logMessage);
    }
    catch (logError) {
        console.error('无法写入日志文件:', logError);
    }
    // 不要立即退出，给服务器一个机会继续运行
    console.log('⚠️  服务器遇到未处理的Promise拒绝，但将继续运行...');
});
// 处理进程信号
process.on('SIGTERM', function () {
    console.log('📡 收到SIGTERM信号，正在优雅关闭服务器...');
    gracefulShutdown();
});
process.on('SIGINT', function () {
    console.log('📡 收到SIGINT信号，正在优雅关闭服务器...');
    gracefulShutdown();
});
// 优雅关闭函数
var gracefulShutdown = function () {
    console.log('🔄 开始优雅关闭流程...');
    // 停止权限变更监听
    try {
        permission_watcher_service_1.PermissionWatcherService.stopWatching();
        console.log('✅ 权限变更监听服务已停止');
    }
    catch (error) {
        console.warn('⚠️  停止权限监听服务时出错:', error);
    }
    // 关闭数据库连接
    sequelize_2["default"].close().then(function () {
        console.log('✅ 数据库连接已关闭');
        process.exit(0);
    })["catch"](function (error) {
        console.error('❌ 关闭数据库连接时出错:', error);
        process.exit(1);
    });
    // 设置超时，如果10秒内无法优雅关闭，强制退出
    setTimeout(function () {
        console.error('⏰ 优雅关闭超时，强制退出');
        process.exit(1);
    }, 10000);
};
// ===== Express应用配置 =====
// 初始化Express应用
var app = (0, express_1["default"])();
var port = parseInt(process.env.PORT || '3000', 10); // 修改默认端口为3000，确保类型为 number
// 🔧 【请求体大小限制】增加到50mb，解决AI对话历史过长导致的请求失败问题
// 注意：app.ts 中也有相同的配置，确保两处保持一致
app.use(express_1["default"].json({
    limit: '50mb',
    type: 'application/json',
    verify: function (req, res, buf, encoding) {
        try {
            // 强制使用UTF-8编码解析
            var content = buf.toString('utf8');
            // 检测并修复常见的编码问题
            if (content.includes('�') || content.includes('?')) {
                console.warn('🔧 检测到编码问题，尝试修复...');
                // 尝试不同的编码方式
                var encodings = ['utf8', 'latin1', 'ascii'];
                for (var _i = 0, encodings_1 = encodings; _i < encodings_1.length; _i++) {
                    var enc = encodings_1[_i];
                    try {
                        var testContent = buf.toString(enc);
                        JSON.parse(testContent);
                        content = testContent;
                        console.log("\u2705 \u4F7F\u7528 ".concat(enc, " \u7F16\u7801\u6210\u529F\u89E3\u6790"));
                        break;
                    }
                    catch (e) {
                        // 继续尝试下一个编码
                    }
                }
            }
            JSON.parse(content);
        }
        catch (e) {
            console.error('JSON解析错误:', e);
            throw new Error('无效的JSON格式');
        }
    }
}));
app.use(express_1["default"].urlencoded({
    extended: true,
    limit: '50mb',
    type: 'application/x-www-form-urlencoded'
}));
// 添加UTF-8编码处理中间件
app.use(function (req, res, next) {
    // 设置响应编码
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    // 确保请求体正确解码
    if (req.body && typeof req.body === 'object') {
        try {
            // 递归处理对象中的字符串，确保正确编码
            var processObject_1 = function (obj) {
                if (typeof obj === 'string') {
                    // 检查是否是乱码，如果是则尝试重新解码
                    if (obj.includes('?') && obj.length > 10) {
                        console.warn('检测到可能的编码问题:', obj.substring(0, 50));
                        // 尝试修复编码问题
                        try {
                            // 如果字符串主要由问号组成，可能是编码问题
                            var questionMarkRatio = (obj.match(/\?/g) || []).length / obj.length;
                            if (questionMarkRatio > 0.3) {
                                // 尝试从原始请求中重新获取正确的字符串
                                // 这里我们返回一个提示，让用户知道编码有问题
                                console.error('🚨 严重编码问题，字符串主要由问号组成:', obj);
                                return '[编码错误：请使用UTF-8编码发送请求]';
                            }
                        }
                        catch (error) {
                            console.error('编码修复失败:', error);
                        }
                    }
                    return obj;
                }
                else if (Array.isArray(obj)) {
                    return obj.map(processObject_1);
                }
                else if (obj && typeof obj === 'object') {
                    var processed = {};
                    for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
                        var _b = _a[_i], key = _b[0], value = _b[1];
                        processed[key] = processObject_1(value);
                    }
                    return processed;
                }
                return obj;
            };
            req.body = processObject_1(req.body);
        }
        catch (error) {
            console.error('编码处理错误:', error);
        }
    }
    next();
});
// 中间件 - 添加错误处理
app.use(function (req, res, next) {
    try {
        (0, helmet_1["default"])({
            contentSecurityPolicy: false // 禁用CSP以便调试
        })(req, res, next);
    }
    catch (error) {
        console.error('Helmet中间件错误:', error);
        next();
    }
});
app.use(function (req, res, next) {
    try {
        (0, cors_1["default"])()(req, res, next);
    }
    catch (error) {
        console.error('CORS中间件错误:', error);
        next();
    }
});
// 请求日志中间件
app.use(function (req, res, next) {
    var start = Date.now();
    var originalSend = res.send;
    res.send = function (body) {
        var duration = Date.now() - start;
        console.log("\uD83D\uDCDD ".concat(req.method, " ").concat(req.path, " - ").concat(res.statusCode, " - ").concat(duration, "ms"));
        return originalSend.call(this, body);
    };
    next();
});
// 配置静态文件服务 - 添加错误处理
try {
    var uploadsPath = path_1["default"].join(__dirname, '../../../uploads');
    app.use('/uploads', express_1["default"].static(uploadsPath));
    console.log("\u2705 \u9759\u6001\u6587\u4EF6\u670D\u52A1\u5DF2\u914D\u7F6E\uFF0C\u6307\u5411\u76EE\u5F55: ".concat(uploadsPath));
    // 添加对 /images 路径的支持（用于海报模板图片）
    app.use('/images', express_1["default"].static(uploadsPath + '/images'));
    console.log("\u2705 \u56FE\u7247\u9759\u6001\u6587\u4EF6\u670D\u52A1\u5DF2\u914D\u7F6E\uFF0C\u6307\u5411\u76EE\u5F55: ".concat(uploadsPath, "/images"));
    // 配置前端静态文件服务 - 指向构建后的dist目录
    var clientDistPath = path_1["default"].join(__dirname, '../../client/dist');
    // 为ES模块设置正确的MIME类型
    app.use(express_1["default"].static(clientDistPath, {
        setHeaders: function (res, path) {
            if (path.endsWith('.js')) {
                res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            }
            else if (path.endsWith('.css')) {
                res.setHeader('Content-Type', 'text/css; charset=utf-8');
            }
            else if (path.endsWith('.html')) {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
            }
        }
    }));
    console.log("\u2705 \u524D\u7AEF\u9759\u6001\u6587\u4EF6\u670D\u52A1\u5DF2\u914D\u7F6E\uFF0C\u6307\u5411\u76EE\u5F55: ".concat(clientDistPath));
}
catch (error) {
    console.error('❌ 配置静态文件服务失败:', error);
}
// 初始化模型 - 添加错误处理
try {
    (0, models_1.initModels)(sequelize_2["default"]);
    console.log('✅ 数据库模型初始化成功');
}
catch (error) {
    console.error('❌ 数据库模型初始化失败:', error);
}
// 根路由 - 添加错误处理
app.get('/', function (req, res) {
    try {
        res.json({
            message: '幼儿园招生管理系统API',
            status: 'running',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        });
    }
    catch (error) {
        console.error('根路由错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});
// 健康检查路由 - 增强版
app.get('/health', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var dbStatus, dbError_1, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                dbStatus = 'unknown';
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, sequelize_2["default"].authenticate()];
            case 2:
                _a.sent();
                dbStatus = 'connected';
                return [3 /*break*/, 4];
            case 3:
                dbError_1 = _a.sent();
                dbStatus = 'disconnected';
                console.error('数据库连接检查失败:', dbError_1);
                return [3 /*break*/, 4];
            case 4:
                res.json({
                    status: 'ok',
                    message: '服务运行正常',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    database: dbStatus,
                    memory: process.memoryUsage(),
                    version: process.version
                });
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                console.error('健康检查错误:', error_1);
                res.status(500).json({
                    status: 'error',
                    message: '健康检查失败',
                    error: error_1 instanceof Error ? error_1.message : '未知错误'
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// 直接访问模拟待办事项API（无需认证）
app.get('/api/direct/mock-todos', function (req, res) {
    try {
        // 生成模拟待办事项列表
        var mockTodos = [
            {
                id: 1,
                title: '准备招生宣传材料',
                description: '为春季招生准备宣传手册和海报',
                priority: 2,
                status: 'pending',
                dueDate: new Date('2025-06-20'),
                completedDate: null,
                userId: 1,
                assignedTo: null,
                tags: ['招生', '宣传'],
                createdAt: new Date('2025-06-01'),
                updatedAt: new Date('2025-06-01')
            },
            {
                id: 2,
                title: '联系家长安排面谈',
                description: '与报名的家长联系，安排面谈时间',
                priority: 1,
                status: 'in_progress',
                dueDate: new Date('2025-06-15'),
                completedDate: null,
                userId: 1,
                assignedTo: null,
                tags: ['招生', '面谈'],
                createdAt: new Date('2025-06-02'),
                updatedAt: new Date('2025-06-05')
            },
            {
                id: 3,
                title: '准备园长会议材料',
                description: '整理本月招生数据，准备园长会议汇报材料',
                priority: 3,
                status: 'pending',
                dueDate: new Date('2025-06-25'),
                completedDate: null,
                userId: 1,
                assignedTo: null,
                tags: ['会议', '汇报'],
                createdAt: new Date('2025-06-03'),
                updatedAt: new Date('2025-06-03')
            }
        ];
        res.json({
            success: true,
            message: '获取待办事项列表成功',
            data: {
                items: mockTodos,
                total: mockTodos.length,
                page: 1,
                pageSize: 10,
                totalPages: 1
            }
        });
    }
    catch (error) {
        console.error('模拟待办事项API错误:', error);
        return res.status(500).json({
            success: false,
            message: '获取待办事项列表失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
});
// 直接访问招生统计数据
app.get('/api/direct/enrollment-statistics/plans', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var plans, formattedPlans, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, sequelize_2["default"].query("\n      SELECT \n        ep.id,\n        ep.title as name,\n        ep.year,\n        CASE ep.semester WHEN 1 THEN '\u6625\u5B63' WHEN 2 THEN '\u79CB\u5B63' END as term,\n        ep.start_date as startDate,\n        ep.end_date as endDate,\n        ep.target_count as targetCount,\n        (SELECT COUNT(*) FROM enrollment_applications WHERE plan_id = ep.id) as applicationCount,\n        (SELECT COUNT(*) FROM admission_results WHERE plan_id = ep.id AND status = 'accepted') as admittedCount\n      FROM \n        enrollment_plans ep\n      WHERE \n        ep.deleted_at IS NULL\n      ORDER BY\n        ep.year DESC, ep.semester ASC\n    ", { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                plans = (_a.sent())[0];
                formattedPlans = plans.map(function (plan) { return (__assign(__assign({}, plan), { startDate: plan.startDate ? new Date(plan.startDate).toISOString().split('T')[0] : null, endDate: plan.endDate ? new Date(plan.endDate).toISOString().split('T')[0] : null })); });
                res.json({
                    success: true,
                    data: formattedPlans
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('获取招生计划统计数据失败:', error_2);
                res.status(500).json({
                    success: false,
                    error: {
                        message: '获取招生计划统计数据失败',
                        detail: error_2 instanceof Error ? error_2.message : '未知错误'
                    }
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// 路由挂载 - 添加错误处理
try {
    // 直接挂载招生统计路由，不需要前缀
    app.use('/enrollment-statistics', enrollment_statistics_routes_1["default"]);
    console.log('✅ 招生统计路由已挂载');
}
catch (error) {
    console.error('❌ 挂载招生统计路由失败:', error);
}
try {
    // 使用API路由
    app.use('/api', routes_1["default"]);
    console.log('✅ API路由已挂载');
}
catch (error) {
    console.error('❌ 挂载API路由失败:', error);
}
// 使用错误处理中间件
app.use(errorHandler_1.errorHandler);
// 404处理中间件
app.use('*', function (req, res) {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: "\u8DEF\u7531 ".concat(req.method, " ").concat(req.originalUrl, " \u4E0D\u5B58\u5728"),
            timestamp: new Date().toISOString()
        }
    });
});
// 最后的错误处理中间件 - 增强版
app.use(function (err, req, res, next) {
    console.error('❌ 全局错误处理器捕获错误:');
    console.error('错误信息:', err.message);
    console.error('错误堆栈:', err.stack);
    console.error('请求路径:', req.method, req.path);
    console.error('请求体:', req.body);
    // 记录到错误日志
    var fs = require('fs');
    var logDir = path_1["default"].join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    var logFile = path_1["default"].join(logDir, 'error.log');
    var timestamp = new Date().toISOString();
    var logMessage = "[".concat(timestamp, "] ").concat(req.method, " ").concat(req.path, " - ").concat(err.message, "\n\u5806\u6808: ").concat(err.stack, "\n\n");
    try {
        fs.appendFileSync(logFile, logMessage);
    }
    catch (logError) {
        console.error('无法写入错误日志:', logError);
    }
    // 确保响应没有被发送过
    if (!res.headersSent) {
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: '服务器内部错误',
                detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
                timestamp: new Date().toISOString()
            }
        });
    }
});
// 启动服务器 - 增强版
var startServer = function () { return __awaiter(void 0, void 0, void 0, function () {
    var retryCount, maxRetries, attemptStart;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                retryCount = 0;
                maxRetries = 3;
                attemptStart = function () { return __awaiter(void 0, void 0, void 0, function () {
                    var error_3, httpServer, server, error_4;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 6, , 7]);
                                console.log('🚀 正在启动服务器...');
                                // 测试数据库连接
                                console.log('📊 正在测试数据库连接...');
                                return [4 /*yield*/, sequelize_2["default"].authenticate()];
                            case 1:
                                _a.sent();
                                console.log('✅ 数据库连接成功');
                                // 🚀 关键步骤：初始化路由缓存系统
                                console.log('🔄 正在初始化路由缓存系统...');
                                _a.label = 2;
                            case 2:
                                _a.trys.push([2, 4, , 5]);
                                return [4 /*yield*/, route_cache_service_1.RouteCacheService.initializeRouteCache()];
                            case 3:
                                _a.sent();
                                console.log('✅ 路由缓存系统初始化完成');
                                // 启动权限变更监听
                                try {
                                    permission_watcher_service_1.PermissionWatcherService.startWatching();
                                    console.log('✅ 权限变更监听服务已启动');
                                }
                                catch (watcherError) {
                                    console.warn('⚠️  权限变更监听启动失败:', watcherError);
                                    console.log('💡 将继续运行，可通过手动刷新缓存');
                                }
                                return [3 /*break*/, 5];
                            case 4:
                                error_3 = _a.sent();
                                console.error('❌ 路由缓存系统初始化失败:', error_3);
                                console.log('⚠️  将使用降级模式（直接数据库查询）继续启动...');
                                // 尝试启动权限变更监听（即使缓存初始化失败）
                                try {
                                    permission_watcher_service_1.PermissionWatcherService.startWatching();
                                    console.log('✅ 权限变更监听服务已启动（降级模式）');
                                }
                                catch (watcherError) {
                                    console.warn('⚠️  权限变更监听启动失败:', watcherError);
                                }
                                return [3 /*break*/, 5];
                            case 5:
                                // 禁用自动同步，改为使用迁移
                                console.log('⚠️  注意：已禁用自动数据库同步功能，请使用迁移脚本管理数据库结构');
                                httpServer = (0, http_1.createServer)(app);
                                // 🔧 已移除Socket.IO中间件 - 直接使用HTTP API调用AIBridge
                                console.log('✅ 使用HTTP API模式，无需Socket.IO');
                                server = httpServer.listen(port, '::', function () {
                                    console.log('🎉 服务器启动成功!');
                                    console.log("\uD83D\uDCCD \u670D\u52A1\u5668\u5730\u5740: http://localhost:".concat(port));
                                    console.log("\uD83C\uDF0D \u73AF\u5883: ".concat(process.env.NODE_ENV || 'development'));
                                    console.log("\u23F0 \u542F\u52A8\u65F6\u95F4: ".concat(new Date().toISOString()));
                                    console.log('📋 可用端点:');
                                    console.log('   - GET  /health           - 健康检查');
                                    console.log('   - GET  /api/direct/mock-todos - 模拟待办事项');
                                    console.log('   - POST /api/auth/login   - 用户登录');
                                    console.log('   - GET  /api/users        - 用户列表');
                                    console.log('   - GET  /api/kindergartens - 幼儿园列表');
                                    console.log('   - POST /api/ai-query     - AI查询接口 (HTTP API)');
                                });
                                // 设置服务器超时 - 修复Navigation timeout问题
                                server.timeout = 120000; // 2分钟超时，避免页面加载超时
                                // 处理服务器错误
                                server.on('error', function (error) {
                                    console.error('❌ 服务器错误:', error);
                                    if (error.code === 'EADDRINUSE') {
                                        console.error("\u274C \u7AEF\u53E3 ".concat(port, " \u5DF2\u88AB\u5360\u7528\uFF0C\u8BF7\u68C0\u67E5\u662F\u5426\u6709\u5176\u4ED6\u670D\u52A1\u5728\u8FD0\u884C"));
                                        process.exit(1);
                                    }
                                });
                                return [3 /*break*/, 7];
                            case 6:
                                error_4 = _a.sent();
                                console.error("\u274C \u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25 (\u5C1D\u8BD5 ".concat(retryCount + 1, "/").concat(maxRetries, "):"), error_4);
                                if (retryCount < maxRetries - 1) {
                                    retryCount++;
                                    console.log("\uD83D\uDD04 ".concat(3, "\u79D2\u540E\u91CD\u8BD5..."));
                                    setTimeout(attemptStart, 3000);
                                }
                                else {
                                    console.error('❌ 服务器启动失败，已达到最大重试次数');
                                    process.exit(1);
                                }
                                return [3 /*break*/, 7];
                            case 7: return [2 /*return*/];
                        }
                    });
                }); };
                return [4 /*yield*/, attemptStart()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
// 执行启动
startServer()["catch"](function (error) {
    console.error('❌ 启动服务器时发生未捕获错误:', error);
    process.exit(1);
});
