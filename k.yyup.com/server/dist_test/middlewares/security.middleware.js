"use strict";
/**
 * 安全防护中间件
 * 处理SQL注入、XSS攻击、暴力破解防护等安全措施
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.requestLogger = exports.ipWhitelist = exports.securityHeaders = exports.requestSizeLimit = exports.fileUploadSecurity = exports.sqlInjectionProtection = exports.xssProtection = exports.validateInput = exports.loginValidation = exports.strictLimiter = exports.apiLimiter = exports.loginLimiter = void 0;
var express_rate_limit_1 = __importDefault(require("express-rate-limit"));
var express_validator_1 = require("express-validator");
var helmet_1 = __importDefault(require("helmet"));
/**
 * 暴力破解防护 - 登录限制
 */
exports.loginLimiter = (0, express_rate_limit_1["default"])({
    windowMs: 15 * 60 * 1000,
    max: 10000,
    message: {
        success: false,
        error: 'TOO_MANY_ATTEMPTS',
        message: '登录尝试过于频繁，请稍后再试'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var req = args[0];
        var res = args[1];
        res.status(429).json({
            success: false,
            error: 'TOO_MANY_ATTEMPTS',
            message: '登录尝试过于频繁，请稍后再试'
        });
    }
});
/**
 * API通用频率限制
 */
exports.apiLimiter = (0, express_rate_limit_1["default"])({
    windowMs: 15 * 60 * 1000,
    max: 10000,
    message: {
        success: false,
        error: 'TOO_MANY_REQUESTS',
        message: '请求过于频繁，请稍后再试'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var req = args[0];
        var res = args[1];
        res.status(429).json({
            success: false,
            error: 'TOO_MANY_REQUESTS',
            message: '请求过于频繁，请稍后再试'
        });
    }
});
/**
 * 严格的频率限制 - 用于敏感操作
 */
exports.strictLimiter = (0, express_rate_limit_1["default"])({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        error: 'STRICT_RATE_LIMIT',
        message: '操作过于频繁，请稍后再试'
    },
    standardHeaders: true,
    legacyHeaders: false
});
/**
 * 登录参数验证和清理
 */
exports.loginValidation = [
    (0, express_validator_1.body)('email').optional().isEmail().normalizeEmail().escape()
        .withMessage('邮箱格式无效'),
    (0, express_validator_1.body)('username').optional().isLength({ min: 1, max: 50 }).trim().escape()
        .withMessage('用户名长度必须在1-50字符之间'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).escape()
        .withMessage('密码至少6位'),
    function (req, res, next) {
        var errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: '参数验证失败',
                details: errors.array()
            });
        }
        next();
    }
];
/**
 * 通用参数验证中间件
 */
var validateInput = function (validations) {
    return __spreadArray(__spreadArray([], validations, true), [
        function (req, res, next) {
            var errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'VALIDATION_ERROR',
                    message: '参数验证失败',
                    details: errors.array()
                });
            }
            next();
        }
    ], false);
};
exports.validateInput = validateInput;
/**
 * XSS防护中间件
 */
exports.xssProtection = (0, helmet_1["default"])({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
});
/**
 * SQL注入防护 - 检查危险字符
 */
var sqlInjectionProtection = function (req, res, next) {
    var dangerousPatterns = [
        /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE){0,1}|INSERT|MERGE|SELECT|UPDATE|UNION( ALL){0,1})\b)/gi,
        /(\b(AND|OR)\b.{1,6}?(=|>|<|\!|\+|\*|\%|\&|\|))/gi,
        /(\b(CHAR|NCHAR|VARCHAR|NVARCHAR)\s*\(\s*\d+\s*\))/gi,
        /(\'((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52)))/gi,
        /(\*|\;|\+|\')|((\%27)|(\'))\s*((\%6F)|o|(\%4F))((\%72)|r|(\%52))/gi,
        /((\%27)|(\'))union/gi,
        /exec(\s|\+)+(s|x)p\w+/gi
    ];
    var checkObject = function (obj, path) {
        if (path === void 0) { path = ''; }
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                var value = obj[key];
                var currentPath = path ? "".concat(path, ".").concat(key) : key;
                if (typeof value === 'string') {
                    for (var _i = 0, dangerousPatterns_1 = dangerousPatterns; _i < dangerousPatterns_1.length; _i++) {
                        var pattern = dangerousPatterns_1[_i];
                        if (pattern.test(value)) {
                            console.warn("[SQL\u6CE8\u5165\u68C0\u6D4B] \u53D1\u73B0\u53EF\u7591\u6A21\u5F0F\u5728 ".concat(currentPath, ": ").concat(value));
                            return true;
                        }
                    }
                }
                else if (typeof value === 'object' && value !== null) {
                    if (checkObject(value, currentPath)) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    // 检查请求体、查询参数和路径参数
    var requestData = __assign(__assign(__assign({}, req.body), req.query), req.params);
    if (checkObject(requestData)) {
        res.status(400).json({
            success: false,
            error: 'SECURITY_VIOLATION',
            message: '请求包含不安全的内容'
        });
        return;
    }
    next();
};
exports.sqlInjectionProtection = sqlInjectionProtection;
/**
 * 文件上传安全检查
 */
var fileUploadSecurity = function (req, res, next) {
    if (!req.file && !req.files) {
        return next();
    }
    var allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    var allowedExtensions = [
        '.jpg', '.jpeg', '.png', '.gif', '.webp',
        '.pdf', '.txt', '.doc', '.docx', '.xls', '.xlsx'
    ];
    var files = req.files ? (Array.isArray(req.files) ? req.files : [req.file]) : [req.file];
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        if (!file)
            continue;
        // 检查MIME类型
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_FILE_TYPE',
                message: "\u4E0D\u652F\u6301\u7684\u6587\u4EF6\u7C7B\u578B: ".concat(file.mimetype)
            });
        }
        // 检查文件扩展名
        var fileExt = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
        if (!allowedExtensions.includes(fileExt)) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_FILE_EXTENSION',
                message: "\u4E0D\u652F\u6301\u7684\u6587\u4EF6\u6269\u5C55\u540D: ".concat(fileExt)
            });
        }
        // 检查文件大小 (10MB限制)
        var maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return res.status(400).json({
                success: false,
                error: 'FILE_TOO_LARGE',
                message: '文件大小不能超过10MB'
            });
        }
        // 清理文件名
        file.originalname = file.originalname.replace(/[^\w\-_\.]|\.\.+/g, '');
    }
    next();
};
exports.fileUploadSecurity = fileUploadSecurity;
/**
 * 请求大小限制
 */
var requestSizeLimit = function (req, res, next) {
    var contentLength = parseInt(req.headers['content-length'] || '0', 10);
    var maxSize = 50 * 1024 * 1024; // 50MB
    if (contentLength > maxSize) {
        res.status(413).json({
            success: false,
            error: 'REQUEST_TOO_LARGE',
            message: '请求体大小超过限制'
        });
        return;
    }
    next();
};
exports.requestSizeLimit = requestSizeLimit;
/**
 * 安全头设置
 */
var securityHeaders = function (req, res, next) {
    var _a;
    // 移除敏感的服务器信息
    res.removeHeader('X-Powered-By');
    // 添加安全头
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // CORS安全配置
    var allowedOrigins = [
        'http://localhost:5173',
        process.env.FRONTEND_URL || 'https://k.yyup.cc',
        ((_a = process.env.FRONTEND_URL) === null || _a === void 0 ? void 0 : _a.replace('https://', 'http://')) || 'http://k.yyup.cc'
    ];
    var origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
};
exports.securityHeaders = securityHeaders;
/**
 * IP白名单检查 (可选)
 */
var ipWhitelist = function (whitelist) {
    if (whitelist === void 0) { whitelist = []; }
    return function (req, res, next) {
        if (whitelist.length === 0) {
            return next();
        }
        var clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        if (!clientIP || !whitelist.includes(clientIP)) {
            return res.status(403).json({
                success: false,
                error: 'IP_NOT_ALLOWED',
                message: '访问被拒绝'
            });
        }
        next();
    };
};
exports.ipWhitelist = ipWhitelist;
/**
 * 请求日志记录
 */
var requestLogger = function (req, res, next) {
    var startTime = Date.now();
    var originalSend = res.send;
    res.send = function (data) {
        var endTime = Date.now();
        var duration = endTime - startTime;
        // 记录请求信息
        console.log("[".concat(new Date().toISOString(), "] ").concat(req.method, " ").concat(req.originalUrl, " - ").concat(res.statusCode, " - ").concat(duration, "ms - ").concat(req.ip));
        // 记录错误请求的详细信息
        if (res.statusCode >= 400) {
            console.error("[ERROR] ".concat(req.method, " ").concat(req.originalUrl, " - ").concat(res.statusCode), {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                body: req.method !== 'GET' ? req.body : undefined,
                query: Object.keys(req.query).length > 0 ? req.query : undefined
            });
        }
        return originalSend.call(this, data);
    };
    next();
};
exports.requestLogger = requestLogger;
exports["default"] = {
    loginLimiter: exports.loginLimiter,
    apiLimiter: exports.apiLimiter,
    strictLimiter: exports.strictLimiter,
    loginValidation: exports.loginValidation,
    validateInput: exports.validateInput,
    xssProtection: exports.xssProtection,
    sqlInjectionProtection: exports.sqlInjectionProtection,
    fileUploadSecurity: exports.fileUploadSecurity,
    requestSizeLimit: exports.requestSizeLimit,
    securityHeaders: exports.securityHeaders,
    ipWhitelist: exports.ipWhitelist,
    requestLogger: exports.requestLogger
};
