"use strict";
exports.__esModule = true;
exports.checkPermissionConflictsSchema = exports.permissionIdsSchema = void 0;
var Joi = require('joi');
// 为角色分配权限时的验证规则
exports.permissionIdsSchema = Joi.object({
    permissionIds: Joi.array().items(Joi.number().integer().positive()).min(1).required()
        .messages({
        'array.base': '权限ID必须是数组',
        'array.min': '至少需要一个权限ID',
        'number.base': '权限ID必须是数字',
        'number.integer': '权限ID必须是整数',
        'number.positive': '权限ID必须是正数',
        'any.required': '权限ID列表是必需的'
    }),
    isInherit: Joi.number().valid(0, 1)["default"](1)
        .messages({
        'number.base': '是否继承必须是数字',
        'number.valid': '是否继承值只能是0或1'
    }),
    grantorId: Joi.number().integer().positive().allow(null)
        .messages({
        'number.base': '授权人ID必须是数字',
        'number.integer': '授权人ID必须是整数',
        'number.positive': '授权人ID必须是正数'
    })
});
// 检测权限冲突的验证规则
exports.checkPermissionConflictsSchema = Joi.object({
    permissionIds: Joi.array().items(Joi.number().integer().positive()).min(1).required()
        .messages({
        'array.base': '权限ID必须是数组',
        'array.min': '至少需要一个权限ID',
        'number.base': '权限ID必须是数字',
        'number.integer': '权限ID必须是整数',
        'number.positive': '权限ID必须是正数',
        'any.required': '权限ID列表是必需的'
    })
});
