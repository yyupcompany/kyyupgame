"use strict";
/**
 * AI中间层基类
 * 提供通用的错误处理、权限验证和日志记录功能
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
exports.__esModule = true;
exports.BaseMiddleware = exports.getStatusCodeFromErrorCode = exports.ERROR_CODE_TO_HTTP_STATUS = exports.ERROR_CODES = exports.MiddlewareError = void 0;
var logger_1 = require("../../utils/logger");
/**
 * 中间层错误类
 */
var MiddlewareError = /** @class */ (function (_super) {
    __extends(MiddlewareError, _super);
    function MiddlewareError(code, message, details) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.details = details;
        _this.name = 'MiddlewareError';
        return _this;
    }
    return MiddlewareError;
}(Error));
exports.MiddlewareError = MiddlewareError;
/**
 * 错误代码常量
 */
exports.ERROR_CODES = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    SERVICE_ERROR: 'SERVICE_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
    INVALID_OPERATION: 'INVALID_OPERATION',
    RESOURCE_EXISTS: 'RESOURCE_EXISTS',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};
/**
 * HTTP状态码映射
 */
exports.ERROR_CODE_TO_HTTP_STATUS = (_a = {},
    _a[exports.ERROR_CODES.UNAUTHORIZED] = 401,
    _a[exports.ERROR_CODES.FORBIDDEN] = 403,
    _a[exports.ERROR_CODES.NOT_FOUND] = 404,
    _a[exports.ERROR_CODES.VALIDATION_FAILED] = 400,
    _a[exports.ERROR_CODES.SERVICE_ERROR] = 500,
    _a[exports.ERROR_CODES.DATABASE_ERROR] = 500,
    _a[exports.ERROR_CODES.EXTERNAL_API_ERROR] = 502,
    _a[exports.ERROR_CODES.INVALID_OPERATION] = 400,
    _a[exports.ERROR_CODES.RESOURCE_EXISTS] = 409,
    _a[exports.ERROR_CODES.RATE_LIMIT_EXCEEDED] = 429,
    _a[exports.ERROR_CODES.SERVICE_UNAVAILABLE] = 503,
    _a);
/**
 * 从错误代码获取HTTP状态码
 */
function getStatusCodeFromErrorCode(code) {
    return exports.ERROR_CODE_TO_HTTP_STATUS[code] || 500;
}
exports.getStatusCodeFromErrorCode = getStatusCodeFromErrorCode;
/**
 * 中间层基类
 */
var BaseMiddleware = /** @class */ (function () {
    function BaseMiddleware() {
    }
    /**
     * 处理错误
     * @param error 捕获的错误
     * @returns 标准化的错误响应
     */
    BaseMiddleware.prototype.handleError = function (error) {
        logger_1.logger.error('中间层错误:', error);
        // 处理中间层自定义错误
        if (error instanceof MiddlewareError) {
            return {
                success: false,
                error: {
                    code: error.code,
                    message: error.message,
                    details: error.details
                }
            };
        }
        // 处理服务层错误
        return {
            success: false,
            error: {
                code: exports.ERROR_CODES.SERVICE_ERROR,
                message: '服务操作失败',
                details: process.env.NODE_ENV === 'production' ? undefined : error.message
            }
        };
    };
    /**
     * 验证用户权限
     * @param userId 用户ID
     * @param requiredPermissions 所需权限列表
     * @returns 是否有权限
     */
    BaseMiddleware.prototype.validatePermissions = function (userId, requiredPermissions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // TODO: 实现实际的权限验证逻辑
                    // 这里应该调用权限服务或数据库查询用户权限
                    // 开发环境下默认通过权限验证
                    if (process.env.NODE_ENV === 'development') {
                        return [2 /*return*/, true];
                    }
                    // 示例: 调用权限服务验证
                    // const userPermissions = await permissionService.getUserPermissions(userId);
                    // return requiredPermissions.every(perm => userPermissions.includes(perm));
                    return [2 /*return*/, true];
                }
                catch (error) {
                    logger_1.logger.error('权限验证错误:', error);
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 记录操作日志
     * @param userId 用户ID
     * @param operation 操作类型
     * @param details 操作详情
     */
    BaseMiddleware.prototype.logOperation = function (userId, operation, details) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('用户操作:', {
                        userId: userId,
                        operation: operation,
                        timestamp: new Date().toISOString(),
                        details: JSON.stringify(details)
                    });
                    // TODO: 实现实际的日志记录逻辑
                    // 例如写入数据库或发送到日志服务
                }
                catch (error) {
                    logger_1.logger.error('记录操作日志错误:', error);
                    // 日志记录错误不应影响正常业务流程
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 校验数据
     * @param data 待验证的数据
     * @param schema 验证规则
     * @throws MiddlewareError 如果验证失败
     */
    BaseMiddleware.prototype.validateData = function (data, schema) {
        // TODO: 实现实际的数据验证逻辑
        // 这里可以使用 Joi, Yup, Zod 等验证库
        // 示例验证逻辑
        if (!data) {
            throw new MiddlewareError(exports.ERROR_CODES.VALIDATION_FAILED, '数据不能为空', { data: data });
        }
        // 其他验证规则...
    };
    /**
     * 创建成功响应
     * @param data 响应数据
     * @returns 标准化的成功响应
     */
    BaseMiddleware.prototype.createSuccessResponse = function (data) {
        return {
            success: true,
            data: data
        };
    };
    return BaseMiddleware;
}());
exports.BaseMiddleware = BaseMiddleware;
