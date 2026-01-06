"use strict";
/**
 * 统一响应处理工具类
 * 用于标准化API响应格式
 */
exports.__esModule = true;
exports.errorResponse = exports.successResponse = exports.ResponseHandler = void 0;
var ResponseHandler = /** @class */ (function () {
    function ResponseHandler() {
    }
    /**
     * 成功响应
     */
    ResponseHandler.success = function (res, data, message, code) {
        if (message === void 0) { message = '操作成功'; }
        if (code === void 0) { code = 200; }
        var response = {
            success: true,
            message: message,
            data: data,
            timestamp: new Date().toISOString(),
            code: code
        };
        res.status(code).json(response);
    };
    /**
     * 错误响应
     */
    ResponseHandler.error = function (res, message, code, error) {
        if (message === void 0) { message = '操作失败'; }
        if (code === void 0) { code = 500; }
        var response = {
            success: false,
            message: message,
            error: error,
            timestamp: new Date().toISOString(),
            code: code
        };
        res.status(code).json(response);
    };
    /**
     * 验证失败响应
     */
    ResponseHandler.validation = function (res, message, errors) {
        var response = {
            success: false,
            message: message,
            data: errors,
            timestamp: new Date().toISOString(),
            code: 400
        };
        res.status(400).json(response);
    };
    /**
     * 未授权响应
     */
    ResponseHandler.unauthorized = function (res, message) {
        if (message === void 0) { message = '未授权访问'; }
        this.error(res, message, 401);
    };
    /**
     * 禁止访问响应
     */
    ResponseHandler.forbidden = function (res, message) {
        if (message === void 0) { message = '禁止访问'; }
        this.error(res, message, 403);
    };
    /**
     * 资源未找到响应
     */
    ResponseHandler.notFound = function (res, message) {
        if (message === void 0) { message = '资源未找到'; }
        this.error(res, message, 404);
    };
    /**
     * 分页响应
     */
    ResponseHandler.paginated = function (res, data, pagination, message) {
        if (message === void 0) { message = '获取数据成功'; }
        var response = {
            success: true,
            message: message,
            data: data,
            pagination: pagination,
            timestamp: new Date().toISOString()
        };
        res.json(response);
    };
    return ResponseHandler;
}());
exports.ResponseHandler = ResponseHandler;
// 导出便捷函数
exports.successResponse = ResponseHandler.success;
exports.errorResponse = ResponseHandler.error;
