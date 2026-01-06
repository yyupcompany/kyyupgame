"use strict";
exports.__esModule = true;
exports.handleApiResponse = void 0;
/**
 * 统一API响应处理函数
 */
function handleApiResponse(res, data, message, error, statusCode) {
    if (statusCode === void 0) { statusCode = 200; }
    if (error) {
        console.error('API Error:', error);
        var errorMessage = error instanceof Error ? error.message : String(error);
        var errorCode = statusCode >= 400 ? statusCode : 500;
        res.status(errorCode).json({
            success: false,
            message: message,
            error: errorMessage,
            timestamp: new Date().toISOString()
        });
    }
    else {
        res.status(statusCode).json({
            success: true,
            message: message,
            data: data,
            timestamp: new Date().toISOString()
        });
    }
}
exports.handleApiResponse = handleApiResponse;
