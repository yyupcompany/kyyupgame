"use strict";
/**
 * API响应类型定义
 */
exports.__esModule = true;
exports.ApiResponse = void 0;
var ApiResponse = /** @class */ (function () {
    function ApiResponse() {
    }
    ApiResponse.success = function (data, message) {
        return {
            success: true,
            data: data,
            message: message || '操作成功'
        };
    };
    ApiResponse.error = function (message, data) {
        return {
            success: false,
            message: message,
            error: message,
            data: data
        };
    };
    return ApiResponse;
}());
exports.ApiResponse = ApiResponse;
