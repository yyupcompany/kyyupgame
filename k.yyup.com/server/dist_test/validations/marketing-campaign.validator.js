"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.validateMarketingCampaignRules = exports.validateMarketingCampaign = void 0;
var Joi = require('joi');
/**
 * 营销活动验证器
 * @description 验证营销活动相关的请求数据
 */
/**
 * 营销活动创建/更新验证规则
 * @param isUpdate 是否为更新操作
 * @returns Joi验证对象
 */
var marketingCampaignSchema = function (isUpdate) {
    if (isUpdate === void 0) { isUpdate = false; }
    // 基础验证规则
    var baseSchema = {
        title: Joi.string().min(2).max(100).required().messages({
            'string.base': '标题必须是字符串',
            'string.empty': '标题不能为空',
            'string.min': '标题长度至少为{#limit}个字符',
            'string.max': '标题长度不能超过{#limit}个字符',
            'any.required': '标题是必填项'
        }),
        campaignType: Joi.number().integer().min(1).max(9).required().messages({
            'number.base': '活动类型必须是数字',
            'number.integer': '活动类型必须是整数',
            'number.min': '活动类型值必须大于等于{#limit}',
            'number.max': '活动类型值必须小于等于{#limit}',
            'any.required': '活动类型是必填项'
        }),
        startDate: Joi.date().iso().required().messages({
            'date.base': '开始日期必须是有效的日期',
            'date.format': '开始日期必须是ISO格式',
            'any.required': '开始日期是必填项'
        }),
        endDate: Joi.date().iso().min(Joi.ref('startDate')).required().messages({
            'date.base': '结束日期必须是有效的日期',
            'date.format': '结束日期必须是ISO格式',
            'date.min': '结束日期必须晚于开始日期',
            'any.required': '结束日期是必填项'
        }),
        kindergartenId: Joi.number().integer().positive().required().messages({
            'number.base': '幼儿园ID必须是数字',
            'number.integer': '幼儿园ID必须是整数',
            'number.positive': '幼儿园ID必须是正数',
            'any.required': '幼儿园ID是必填项'
        }),
        targetAudience: Joi.string().max(200).allow(null, '').messages({
            'string.base': '目标受众必须是字符串',
            'string.max': '目标受众长度不能超过{#limit}个字符'
        }),
        budget: Joi.number().precision(2).min(0).allow(null).messages({
            'number.base': '预算金额必须是数字',
            'number.precision': '预算金额最多保留两位小数',
            'number.min': '预算金额不能小于{#limit}'
        }),
        objective: Joi.string().max(200).allow(null, '').messages({
            'string.base': '活动目标必须是字符串',
            'string.max': '活动目标长度不能超过{#limit}个字符'
        }),
        description: Joi.string().allow(null, '').messages({
            'string.base': '活动描述必须是字符串'
        }),
        rules: Joi.string().allow(null, '').messages({
            'string.base': '活动规则必须是字符串'
        }),
        rewards: Joi.string().allow(null, '').messages({
            'string.base': '活动奖励必须是字符串'
        }),
        coverImage: Joi.string().max(255).allow(null, '').messages({
            'string.base': '封面图片必须是字符串',
            'string.max': '封面图片URL长度不能超过{#limit}个字符'
        }),
        bannerImage: Joi.string().max(255).allow(null, '').messages({
            'string.base': '横幅图片必须是字符串',
            'string.max': '横幅图片URL长度不能超过{#limit}个字符'
        }),
        status: Joi.number().integer().min(0).max(4).messages({
            'number.base': '状态必须是数字',
            'number.integer': '状态必须是整数',
            'number.min': '状态值必须大于等于{#limit}',
            'number.max': '状态值必须小于等于{#limit}'
        }),
        remark: Joi.string().max(500).allow(null, '').messages({
            'string.base': '备注必须是字符串',
            'string.max': '备注长度不能超过{#limit}个字符'
        })
    };
    // 如果是更新操作，所有字段都是可选的
    if (isUpdate) {
        return Joi.object(__assign({}, Object.entries(baseSchema).reduce(function (acc, _a) {
            var key = _a[0], schema = _a[1];
            acc[key] = schema.optional();
            return acc;
        }, {})));
    }
    // 创建操作，必填字段保持必填
    return Joi.object(baseSchema);
};
/**
 * 验证营销活动数据
 * @param data 待验证的数据
 * @param isUpdate 是否为更新操作
 * @returns 验证结果
 */
var validateMarketingCampaign = function (data, isUpdate) {
    if (isUpdate === void 0) { isUpdate = false; }
    var schema = marketingCampaignSchema(isUpdate);
    return schema.validate(data, { abortEarly: false, stripUnknown: true });
};
exports.validateMarketingCampaign = validateMarketingCampaign;
/**
 * 营销活动规则验证
 * @param data 待验证的数据
 * @returns 验证结果
 */
var validateMarketingCampaignRules = function (data) {
    var schema = Joi.object({
        rules: Joi.string().required().messages({
            'string.base': '活动规则必须是字符串',
            'string.empty': '活动规则不能为空',
            'any.required': '活动规则是必填项'
        }),
        rewards: Joi.string().allow(null, '').messages({
            'string.base': '活动奖励必须是字符串'
        })
    });
    return schema.validate(data, { abortEarly: false, stripUnknown: true });
};
exports.validateMarketingCampaignRules = validateMarketingCampaignRules;
