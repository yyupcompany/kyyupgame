"use strict";
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
exports.__esModule = true;
exports.validateUserId = exports.validateUserQuery = exports.validateChangePassword = exports.validateUpdateUser = exports.validateCreateUser = exports.changePasswordSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
var Joi = require('joi');
var apiError_1 = require("../utils/apiError");
// 创建用户验证规则
exports.createUserSchema = Joi.object({
    username: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
        'string.min': '用户名长度不能小于3个字符',
        'string.max': '用户名长度不能超过30个字符',
        'any.required': '用户名不能为空'
    }),
    password: Joi.string()
        .min(6)
        .max(30)
        .required()
        .messages({
        'string.min': '密码长度不能小于6个字符',
        'string.max': '密码长度不能超过30个字符',
        'any.required': '密码不能为空'
    }),
    email: Joi.string()
        .email()
        .required()
        .messages({
        'string.email': '邮箱格式不正确',
        'any.required': '邮箱不能为空'
    }),
    realName: Joi.string()
        .max(50)
        .allow('')
        .messages({
        'string.max': '真实姓名长度不能超过50个字符'
    }),
    phone: Joi.string()
        .pattern(/^1[3-9]\d{9}$/)
        .allow('')
        .messages({
        'string.pattern.base': '手机号格式不正确'
    }),
    status: Joi.number()
        .valid(0, 1)["default"](1)
        .messages({
        'any.only': '状态值只能是0或1'
    }),
    roleIds: Joi.array()
        .items(Joi.number())
        .allow(null)
        .messages({
        'array.base': '角色ID必须是数组'
    })
});
// 更新用户验证规则
exports.updateUserSchema = Joi.object({
    email: Joi.string()
        .email()
        .allow('')
        .messages({
        'string.email': '邮箱格式不正确'
    }),
    realName: Joi.string()
        .max(50)
        .allow('')
        .messages({
        'string.max': '真实姓名长度不能超过50个字符'
    }),
    phone: Joi.string()
        .pattern(/^1[3-9]\d{9}$/)
        .allow('')
        .messages({
        'string.pattern.base': '手机号格式不正确'
    }),
    status: Joi.number()
        .valid(0, 1)
        .allow(null)
        .messages({
        'any.only': '状态值只能是0或1'
    }),
    roleIds: Joi.array()
        .items(Joi.number())
        .allow(null)
        .messages({
        'array.base': '角色ID必须是数组'
    })
});
// 修改密码验证规则
exports.changePasswordSchema = Joi.object({
    oldPassword: Joi.string()
        .required()
        .messages({
        'any.required': '旧密码不能为空'
    }),
    newPassword: Joi.string()
        .min(6)
        .max(30)
        .required()
        .messages({
        'string.min': '新密码长度不能小于6个字符',
        'string.max': '新密码长度不能超过30个字符',
        'any.required': '新密码不能为空'
    }),
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
        'any.only': '两次输入的密码不一致',
        'any.required': '确认密码不能为空'
    })
});
// 中间件函数
var validateCreateUser = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var error, errorMessage;
    return __generator(this, function (_a) {
        try {
            error = exports.createUserSchema.validate(req.body, { abortEarly: false }).error;
            if (error) {
                errorMessage = error.details.map(function (detail) { return detail.message; }).join(', ');
                throw new apiError_1.ApiError(400, errorMessage);
            }
            next();
        }
        catch (error) {
            next(error);
        }
        return [2 /*return*/];
    });
}); };
exports.validateCreateUser = validateCreateUser;
var validateUpdateUser = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var error, errorMessage;
    return __generator(this, function (_a) {
        try {
            error = exports.updateUserSchema.validate(req.body, { abortEarly: false }).error;
            if (error) {
                errorMessage = error.details.map(function (detail) { return detail.message; }).join(', ');
                throw new apiError_1.ApiError(400, errorMessage);
            }
            next();
        }
        catch (error) {
            next(error);
        }
        return [2 /*return*/];
    });
}); };
exports.validateUpdateUser = validateUpdateUser;
var validateChangePassword = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var error, errorMessage;
    return __generator(this, function (_a) {
        try {
            error = exports.changePasswordSchema.validate(req.body, { abortEarly: false }).error;
            if (error) {
                errorMessage = error.details.map(function (detail) { return detail.message; }).join(', ');
                throw new apiError_1.ApiError(400, errorMessage);
            }
            next();
        }
        catch (error) {
            next(error);
        }
        return [2 /*return*/];
    });
}); };
exports.validateChangePassword = validateChangePassword;
var validateUserQuery = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var queryData, querySchema, _a, error, value, errorMessage;
    return __generator(this, function (_b) {
        try {
            queryData = {
                page: req.query.page || 1,
                limit: req.query.limit || 10,
                sortBy: req.query.sortBy || 'createdAt',
                sortOrder: req.query.sortOrder || 'desc',
                search: req.query.search || '',
                status: req.query.status
            };
            querySchema = Joi.object({
                page: Joi.number().integer().min(1)["default"](1),
                limit: Joi.number().integer().min(1).max(100)["default"](10),
                sortBy: Joi.string().valid('id', 'username', 'email', 'createdAt', 'updatedAt')["default"]('createdAt'),
                sortOrder: Joi.string().valid('asc', 'desc')["default"]('desc'),
                search: Joi.string().allow('')["default"](''),
                status: Joi.string().valid('active', 'inactive').optional()
            });
            _a = querySchema.validate(queryData, { abortEarly: false }), error = _a.error, value = _a.value;
            if (error) {
                errorMessage = error.details.map(function (detail) { return detail.message; }).join(', ');
                throw new apiError_1.ApiError(400, errorMessage);
            }
            req.query = value;
            next();
        }
        catch (error) {
            next(error);
        }
        return [2 /*return*/];
    });
}); };
exports.validateUserQuery = validateUserQuery;
var validateUserId = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var idSchema, error, errorMessage;
    return __generator(this, function (_a) {
        try {
            idSchema = Joi.object({
                id: Joi.number().integer().positive().required().messages({
                    'number.base': '用户ID必须是数字',
                    'number.integer': '用户ID必须是整数',
                    'number.positive': '用户ID必须是正数',
                    'any.required': '用户ID是必填项'
                })
            });
            error = idSchema.validate({ id: req.params.id }, { abortEarly: false }).error;
            if (error) {
                errorMessage = error.details.map(function (detail) { return detail.message; }).join(', ');
                throw new apiError_1.ApiError(400, errorMessage);
            }
            next();
        }
        catch (error) {
            next(error);
        }
        return [2 /*return*/];
    });
}); };
exports.validateUserId = validateUserId;
