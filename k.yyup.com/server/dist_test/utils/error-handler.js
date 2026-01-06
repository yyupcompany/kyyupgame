"use strict";
exports.__esModule = true;
exports.handleServiceError = void 0;
var custom_errors_1 = require("./custom-errors");
/**
 * Handles errors thrown by services and sends a standardized JSON response.
 * @param error The error object.
 * @param res The Express response object.
 */
var handleServiceError = function (error, res) {
    // 检查是否为自定义业务错误
    if (error instanceof custom_errors_1.BusinessError) {
        console.warn('[Business Error]:', error.message);
        return res.status(error.statusCode).json({
            success: false,
            code: error.statusCode,
            message: error.message,
            error: {
                name: error.name,
                code: error.errorCode,
                type: 'business'
            },
            timestamp: new Date().toISOString()
        });
    }
    // 检查是否为自定义系统错误
    if (error instanceof custom_errors_1.SystemError) {
        console.error('[System Error]:', error);
        return res.status(error.statusCode).json({
            success: false,
            code: error.statusCode,
            message: '系统错误，请联系管理员',
            error: {
                name: error.name,
                code: error.errorCode,
                type: 'system',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
    // 处理传统错误
    var serviceError = (error || {});
    // Default to 500 if status code is not defined
    var statusCode = serviceError.statusCode || 500;
    // Log the error for debugging (in a real app, use a proper logger)
    console.error('[Service Error]:', serviceError);
    // 提取SQL错误信息（如果存在）
    var sqlDetails = serviceError.sqlMessage ? {
        sqlMessage: serviceError.sqlMessage,
        sqlState: serviceError.sqlState,
        errno: serviceError.errno,
        sql: process.env.NODE_ENV === 'development' ? serviceError.sql : undefined
    } : undefined;
    // 构建详细错误信息
    var errorDetails = {
        name: serviceError.name,
        stack: process.env.NODE_ENV === 'development' ? serviceError.stack : undefined,
        code: serviceError.code || "ERR_".concat(statusCode),
        sql: sqlDetails,
        originalError: process.env.NODE_ENV === 'development'
            ? JSON.stringify(serviceError, Object.getOwnPropertyNames(serviceError))
            : undefined
    };
    // Return a standardized error response
    res.status(statusCode).json({
        success: false,
        code: statusCode,
        message: serviceError.isOperational
            ? serviceError.message
            : '服务器内部错误，请联系管理员。错误代码: ' + errorDetails.code,
        error: errorDetails,
        timestamp: new Date().toISOString()
    });
};
exports.handleServiceError = handleServiceError;
