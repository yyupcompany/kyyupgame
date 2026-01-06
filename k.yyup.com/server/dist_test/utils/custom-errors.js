"use strict";
/**
 * 自定义错误类型
 * 用于区分业务逻辑错误和系统错误
 */
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
exports.SystemError = exports.PermissionError = exports.ValidationError = exports.ResourceNotFoundError = exports.ResourceExistsError = exports.BusinessError = void 0;
/**
 * 业务逻辑错误基类
 */
var BusinessError = /** @class */ (function (_super) {
    __extends(BusinessError, _super);
    function BusinessError(message, statusCode, errorCode) {
        if (statusCode === void 0) { statusCode = 400; }
        if (errorCode === void 0) { errorCode = 'BUSINESS_ERROR'; }
        var _this = _super.call(this, message) || this;
        _this.name = 'BusinessError';
        _this.statusCode = statusCode;
        _this.errorCode = errorCode;
        return _this;
    }
    return BusinessError;
}(Error));
exports.BusinessError = BusinessError;
/**
 * 资源已存在错误
 */
var ResourceExistsError = /** @class */ (function (_super) {
    __extends(ResourceExistsError, _super);
    function ResourceExistsError(message) {
        var _this = _super.call(this, message, 409, 'RESOURCE_EXISTS') || this;
        _this.name = 'ResourceExistsError';
        return _this;
    }
    return ResourceExistsError;
}(BusinessError));
exports.ResourceExistsError = ResourceExistsError;
/**
 * 资源不存在错误
 */
var ResourceNotFoundError = /** @class */ (function (_super) {
    __extends(ResourceNotFoundError, _super);
    function ResourceNotFoundError(message) {
        var _this = _super.call(this, message, 404, 'RESOURCE_NOT_FOUND') || this;
        _this.name = 'ResourceNotFoundError';
        return _this;
    }
    return ResourceNotFoundError;
}(BusinessError));
exports.ResourceNotFoundError = ResourceNotFoundError;
/**
 * 验证错误
 */
var ValidationError = /** @class */ (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(message) {
        var _this = _super.call(this, message, 400, 'VALIDATION_ERROR') || this;
        _this.name = 'ValidationError';
        return _this;
    }
    return ValidationError;
}(BusinessError));
exports.ValidationError = ValidationError;
/**
 * 权限错误
 */
var PermissionError = /** @class */ (function (_super) {
    __extends(PermissionError, _super);
    function PermissionError(message) {
        var _this = _super.call(this, message, 403, 'PERMISSION_DENIED') || this;
        _this.name = 'PermissionError';
        return _this;
    }
    return PermissionError;
}(BusinessError));
exports.PermissionError = PermissionError;
/**
 * 系统错误（真正的服务器内部错误）
 */
var SystemError = /** @class */ (function (_super) {
    __extends(SystemError, _super);
    function SystemError(message, originalError) {
        var _this = _super.call(this, message) || this;
        _this.statusCode = 500;
        _this.errorCode = 'SYSTEM_ERROR';
        _this.name = 'SystemError';
        if (originalError) {
            _this.stack = originalError.stack;
        }
        return _this;
    }
    return SystemError;
}(Error));
exports.SystemError = SystemError;
