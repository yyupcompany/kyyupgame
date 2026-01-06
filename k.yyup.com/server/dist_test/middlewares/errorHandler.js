"use strict";
exports.__esModule = true;
exports.errorHandler = void 0;
var apiError_1 = require("../utils/apiError");
var apiResponse_1 = require("../utils/apiResponse");
var logger_1 = require("../utils/logger");
var errorHandler = function (err, req, res, next) {
    // 记录错误详情
    logger_1.logger.error("\u8BF7\u6C42\u8DEF\u5F84: ".concat(req.method, " ").concat(req.path), err);
    if (err instanceof apiError_1.ApiError) {
        // 记录API错误
        logger_1.logger.error("API\u9519\u8BEF: [".concat(err.code, "] ").concat(err.message, " (").concat(err.statusCode, ")"), {
            path: req.path,
            method: req.method,
            query: req.query,
            body: req.body,
            user: req.user ? req.user.id : null
        });
        apiResponse_1.ApiResponse.error(res, err.code, err.message, err.statusCode);
        return;
    }
    // 处理Sequelize错误
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        logger_1.logger.error("Sequelize\u9519\u8BEF: ".concat(err.name), {
            message: err.message,
            path: req.path,
            method: req.method
        });
        apiResponse_1.ApiResponse.badRequest(res, err.message);
        return;
    }
    // 处理JWT错误
    if (err.name === 'JsonWebTokenError') {
        logger_1.logger.error("JWT\u9519\u8BEF: ".concat(err.name), {
            message: err.message,
            path: req.path,
            method: req.method
        });
        apiResponse_1.ApiResponse.unauthorized(res, '无效的token');
        return;
    }
    if (err.name === 'TokenExpiredError') {
        logger_1.logger.error("JWT\u9519\u8BEF: ".concat(err.name), {
            message: err.message,
            path: req.path,
            method: req.method
        });
        apiResponse_1.ApiResponse.unauthorized(res, 'token已过期');
        return;
    }
    // 处理其他错误
    logger_1.logger.error("\u672A\u5904\u7406\u7684\u9519\u8BEF: ".concat(err.name || 'Unknown Error'), {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    apiResponse_1.ApiResponse.serverError(res);
};
exports.errorHandler = errorHandler;
