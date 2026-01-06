"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.ApiError = void 0;
/**
 * API错误类
 */
var ApiError = /** @class */ (function (_super) {
    __extends(ApiError, _super);
    /**
     * 构造函数
     * @param statusCode 状态码
     * @param message 错误信息
     * @param code 错误代码
     */
    function ApiError(statusCode, message, code) {
        if (code === void 0) { code = 'API_ERROR'; }
        var _this = _super.call(this, message) || this;
        _this.statusCode = statusCode;
        _this.message = message;
        _this.code = code;
        _this.name = 'ApiError';
        return _this;
    }
    ApiError.badRequest = function (message, code) {
        if (code === void 0) { code = 'BAD_REQUEST'; }
        return new ApiError(400, message, code);
    };
    ApiError.unauthorized = function (message, code) {
        if (code === void 0) { code = 'UNAUTHORIZED'; }
        return new ApiError(401, message, code);
    };
    ApiError.forbidden = function (message, code) {
        if (code === void 0) { code = 'FORBIDDEN'; }
        return new ApiError(403, message, code);
    };
    ApiError.notFound = function (message, code) {
        if (code === void 0) { code = 'NOT_FOUND'; }
        return new ApiError(404, message, code);
    };
    ApiError.serverError = function (message, code) {
        if (code === void 0) { code = 'SERVER_ERROR'; }
        return new ApiError(500, message, code);
    };
    /**
     * 自定义JSON序列化方法
     * 确保Error对象的属性能被正确序列化
     */
    ApiError.prototype.toJSON = function () {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            code: this.code,
            stack: this.stack
        };
    };
    return ApiError;
}(Error));
exports.ApiError = ApiError;
