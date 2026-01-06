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
exports.__esModule = true;
exports.errorHandler = void 0;
var logger_1 = require("../utils/logger");
/**
 * 全局错误处理中间件
 * 捕获路由处理过程中抛出的错误，记录日志并返回统一格式的错误响应
 */
var errorHandler = function (err, req, res, next) {
    var _a;
    // 生成唯一错误ID用于追踪
    var errorId = "ERR_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    // 分析错误类型和严重程度
    var errorType = getErrorType(err);
    var severity = getErrorSeverity(err);
    // 结构化错误信息
    var errorContext = {
        errorId: errorId,
        type: errorType,
        severity: severity,
        request: {
            method: req.method,
            url: req.originalUrl,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            query: req.query,
            body: sanitizeBody(req.body),
            params: req.params
        },
        error: {
            name: err.name,
            message: err.message,
            code: err.code,
            statusCode: err.statusCode,
            stack: err.stack
        },
        timestamp: new Date().toISOString()
    };
    // 记录错误到日志
    logger_1.logger.error("[".concat(errorId, "] ").concat(errorType, " - ").concat(req.method, " ").concat(req.url), errorContext);
    // 在开发环境输出详细错误信息
    if (process.env.NODE_ENV !== 'production') {
        console.error("[".concat(errorId, "] \u8BE6\u7EC6\u9519\u8BEF\u4FE1\u606F:"), {
            error: err,
            stack: err.stack,
            context: errorContext
        });
    }
    // 确定HTTP状态码
    var statusCode = determineStatusCode(err);
    // 生成用户友好的错误消息
    var userMessage = generateUserMessage(err, statusCode);
    // 构建错误响应
    var errorResponse = {
        success: false,
        error: __assign({ message: userMessage, code: err.code || getErrorCodeByStatus(statusCode), errorId: errorId }, (process.env.NODE_ENV !== 'production' && {
            details: {
                path: "".concat(req.method, " ").concat(req.originalUrl),
                timestamp: errorContext.timestamp,
                type: errorType,
                originalMessage: err.message,
                stack: err.stack
            }
        }))
    };
    // 发送错误响应
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
/**
 * 判断错误类型
 */
function getErrorType(err) {
    if (err.name === 'ValidationError')
        return 'VALIDATION_ERROR';
    if (err.name === 'CastError')
        return 'DATA_TYPE_ERROR';
    if (err.code === 11000)
        return 'DUPLICATE_ERROR';
    if (err.name === 'JsonWebTokenError')
        return 'AUTH_ERROR';
    if (err.name === 'TokenExpiredError')
        return 'TOKEN_EXPIRED_ERROR';
    if (err.name === 'SequelizeValidationError')
        return 'DATABASE_VALIDATION_ERROR';
    if (err.name === 'SequelizeConnectionError')
        return 'DATABASE_CONNECTION_ERROR';
    if (err.statusCode >= 400 && err.statusCode < 500)
        return 'CLIENT_ERROR';
    if (err.statusCode >= 500)
        return 'SERVER_ERROR';
    return 'UNKNOWN_ERROR';
}
/**
 * 判断错误严重程度
 */
function getErrorSeverity(err) {
    var statusCode = err.statusCode || 500;
    if (statusCode >= 500)
        return 'critical';
    if (statusCode === 401 || statusCode === 403)
        return 'medium';
    if (statusCode >= 400 && statusCode < 500)
        return 'low';
    if (err.name === 'SequelizeConnectionError')
        return 'critical';
    if (err.name === 'DatabaseError')
        return 'high';
    return 'medium';
}
/**
 * 清理请求体，移除敏感信息
 */
function sanitizeBody(body) {
    if (!body || typeof body !== 'object')
        return body;
    var sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    var sanitized = __assign({}, body);
    for (var _i = 0, sensitiveFields_1 = sensitiveFields; _i < sensitiveFields_1.length; _i++) {
        var field = sensitiveFields_1[_i];
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    }
    return sanitized;
}
/**
 * 确定HTTP状态码
 */
function determineStatusCode(err) {
    if (err.statusCode)
        return err.statusCode;
    if (err.status)
        return err.status;
    // 根据错误类型确定状态码
    switch (err.name) {
        case 'ValidationError':
        case 'SequelizeValidationError':
            return 400;
        case 'JsonWebTokenError':
        case 'TokenExpiredError':
            return 401;
        case 'ForbiddenError':
            return 403;
        case 'NotFoundError':
            return 404;
        case 'ConflictError':
            return 409;
        case 'SequelizeConnectionError':
        case 'DatabaseError':
            return 503;
        default:
            return 500;
    }
}
/**
 * 生成用户友好的错误消息
 */
function generateUserMessage(err, statusCode) {
    // 如果有自定义用户消息，优先使用
    if (err.userMessage)
        return err.userMessage;
    // 根据状态码生成通用消息
    switch (statusCode) {
        case 400:
            return '请求参数错误，请检查输入信息';
        case 401:
            return '登录已过期，请重新登录';
        case 403:
            return '没有权限执行此操作';
        case 404:
            return '请求的资源不存在';
        case 409:
            return '数据冲突，该信息可能已存在';
        case 422:
            return '数据验证失败，请检查输入信息';
        case 429:
            return '请求过于频繁，请稍后重试';
        case 500:
            return '服务器内部错误，我们将尽快修复';
        case 503:
            return '服务暂时不可用，请稍后重试';
        default:
            return '操作失败，请稍后重试';
    }
}
/**
 * 根据状态码获取错误代码
 */
function getErrorCodeByStatus(statusCode) {
    switch (statusCode) {
        case 400: return 'BAD_REQUEST';
        case 401: return 'UNAUTHORIZED';
        case 403: return 'FORBIDDEN';
        case 404: return 'NOT_FOUND';
        case 409: return 'CONFLICT';
        case 422: return 'UNPROCESSABLE_ENTITY';
        case 429: return 'TOO_MANY_REQUESTS';
        case 500: return 'INTERNAL_SERVER_ERROR';
        case 503: return 'SERVICE_UNAVAILABLE';
        default: return 'UNKNOWN_ERROR';
    }
}
