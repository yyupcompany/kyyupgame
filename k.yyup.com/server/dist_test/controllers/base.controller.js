"use strict";
exports.__esModule = true;
exports.BaseController = void 0;
var BaseController = /** @class */ (function () {
    function BaseController() {
    }
    /**
     * 统一错误处理
     */
    BaseController.prototype.handleError = function (res, error) {
        console.error('Controller Error:', error);
        // Handle null or undefined errors
        if (!error) {
            return res.status(500).json({
                success: false,
                message: '内部服务器错误'
            });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message || '请求参数验证失败'
            });
        }
        if (error.name === 'UnauthorizedError') {
            return res.status(401).json({
                success: false,
                message: '未授权访问'
            });
        }
        return res.status(500).json({
            success: false,
            message: error.message || '内部服务器错误'
        });
    };
    /**
     * 统一成功响应
     */
    BaseController.prototype.handleSuccess = function (res, data, message) {
        return res.json({
            success: true,
            data: data,
            message: message
        });
    };
    return BaseController;
}());
exports.BaseController = BaseController;
