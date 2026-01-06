"use strict";
exports.__esModule = true;
exports.ErrorHandler = void 0;
var ErrorHandler = /** @class */ (function () {
    function ErrorHandler() {
    }
    ErrorHandler.handleError = function (error, res) {
        console.error('API错误:', error);
        var statusCode = error.statusCode || 500;
        var message = error.message || '服务器内部错误';
        res.status(statusCode).json({
            success: false,
            message: message,
            error: message
        });
    };
    return ErrorHandler;
}());
exports.ErrorHandler = ErrorHandler;
