"use strict";
exports.__esModule = true;
exports.enrollmentConsultationFollowupFilterSchema = exports.createEnrollmentConsultationFollowupSchema = exports.enrollmentConsultationFilterSchema = exports.updateEnrollmentConsultationSchema = exports.createEnrollmentConsultationSchema = void 0;
var Joi = require('joi');
/**
 * 创建招生咨询验证规则
 */
exports.createEnrollmentConsultationSchema = Joi.object({
    kindergartenId: Joi.number().integer().positive().required().messages({
        'number.base': '幼儿园ID必须是数字',
        'number.integer': '幼儿园ID必须是整数',
        'number.positive': '幼儿园ID必须是正数',
        'any.required': '幼儿园ID是必填项'
    }),
    consultantId: Joi.number().integer().positive().required().messages({
        'number.base': '咨询师ID必须是数字',
        'number.integer': '咨询师ID必须是整数',
        'number.positive': '咨询师ID必须是正数',
        'any.required': '咨询师ID是必填项'
    }),
    parentName: Joi.string().max(50).required().messages({
        'string.base': '家长姓名必须是字符串',
        'string.max': '家长姓名不能超过50个字符',
        'any.required': '家长姓名是必填项'
    }),
    childName: Joi.string().max(50).required().messages({
        'string.base': '孩子姓名必须是字符串',
        'string.max': '孩子姓名不能超过50个字符',
        'any.required': '孩子姓名是必填项'
    }),
    childAge: Joi.number().integer().min(0).max(120).required().messages({
        'number.base': '孩子年龄必须是数字',
        'number.integer': '孩子年龄必须是整数',
        'number.min': '孩子年龄不能小于0个月',
        'number.max': '孩子年龄不能大于120个月',
        'any.required': '孩子年龄是必填项'
    }),
    childGender: Joi.number().integer().valid(1, 2).required().messages({
        'number.base': '孩子性别必须是数字',
        'number.integer': '孩子性别必须是整数',
        'any.only': '孩子性别只能是1(男)或2(女)',
        'any.required': '孩子性别是必填项'
    }),
    contactPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
        'string.base': '联系电话必须是字符串',
        'string.pattern.base': '联系电话格式不正确',
        'any.required': '联系电话是必填项'
    }),
    contactAddress: Joi.string().max(200).allow('', null).optional().messages({
        'string.base': '联系地址必须是字符串',
        'string.max': '联系地址不能超过200个字符'
    }),
    sourceChannel: Joi.number().integer().min(1).max(6).required().messages({
        'number.base': '来源渠道必须是数字',
        'number.integer': '来源渠道必须是整数',
        'number.min': '来源渠道不能小于1',
        'number.max': '来源渠道不能大于6',
        'any.required': '来源渠道是必填项'
    }),
    sourceDetail: Joi.string().max(100).allow('', null).optional().messages({
        'string.base': '来源详情必须是字符串',
        'string.max': '来源详情不能超过100个字符'
    }),
    consultContent: Joi.string().required().messages({
        'string.base': '咨询内容必须是字符串',
        'any.required': '咨询内容是必填项'
    }),
    consultMethod: Joi.number().integer().min(1).max(5).required().messages({
        'number.base': '咨询方式必须是数字',
        'number.integer': '咨询方式必须是整数',
        'number.min': '咨询方式不能小于1',
        'number.max': '咨询方式不能大于5',
        'any.required': '咨询方式是必填项'
    }),
    consultDate: Joi.date().iso().required().messages({
        'date.base': '咨询日期必须是有效的日期',
        'date.format': '咨询日期必须是ISO格式(YYYY-MM-DD)',
        'any.required': '咨询日期是必填项'
    }),
    intentionLevel: Joi.number().integer().min(1).max(5).required().messages({
        'number.base': '意向级别必须是数字',
        'number.integer': '意向级别必须是整数',
        'number.min': '意向级别不能小于1',
        'number.max': '意向级别不能大于5',
        'any.required': '意向级别是必填项'
    }),
    followupStatus: Joi.number().integer().min(1).max(4).optional()["default"](1).messages({
        'number.base': '跟进状态必须是数字',
        'number.integer': '跟进状态必须是整数',
        'number.min': '跟进状态不能小于1',
        'number.max': '跟进状态不能大于4'
    }),
    nextFollowupDate: Joi.date().iso().allow(null).optional().messages({
        'date.base': '下次跟进日期必须是有效的日期',
        'date.format': '下次跟进日期必须是ISO格式(YYYY-MM-DD)'
    }),
    remark: Joi.string().allow('', null).optional().messages({
        'string.base': '备注必须是字符串'
    })
});
/**
 * 更新招生咨询验证规则
 */
exports.updateEnrollmentConsultationSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': '咨询ID必须是数字',
        'number.integer': '咨询ID必须是整数',
        'number.positive': '咨询ID必须是正数',
        'any.required': '咨询ID是必填项'
    }),
    parentName: Joi.string().max(50).optional().messages({
        'string.base': '家长姓名必须是字符串',
        'string.max': '家长姓名不能超过50个字符'
    }),
    childName: Joi.string().max(50).optional().messages({
        'string.base': '孩子姓名必须是字符串',
        'string.max': '孩子姓名不能超过50个字符'
    }),
    childAge: Joi.number().integer().min(0).max(120).optional().messages({
        'number.base': '孩子年龄必须是数字',
        'number.integer': '孩子年龄必须是整数',
        'number.min': '孩子年龄不能小于0个月',
        'number.max': '孩子年龄不能大于120个月'
    }),
    childGender: Joi.number().integer().valid(1, 2).optional().messages({
        'number.base': '孩子性别必须是数字',
        'number.integer': '孩子性别必须是整数',
        'any.only': '孩子性别只能是1(男)或2(女)'
    }),
    contactPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
        'string.base': '联系电话必须是字符串',
        'string.pattern.base': '联系电话格式不正确'
    }),
    contactAddress: Joi.string().max(200).allow('', null).optional().messages({
        'string.base': '联系地址必须是字符串',
        'string.max': '联系地址不能超过200个字符'
    }),
    sourceChannel: Joi.number().integer().min(1).max(6).optional().messages({
        'number.base': '来源渠道必须是数字',
        'number.integer': '来源渠道必须是整数',
        'number.min': '来源渠道不能小于1',
        'number.max': '来源渠道不能大于6'
    }),
    sourceDetail: Joi.string().max(100).allow('', null).optional().messages({
        'string.base': '来源详情必须是字符串',
        'string.max': '来源详情不能超过100个字符'
    }),
    consultContent: Joi.string().optional().messages({
        'string.base': '咨询内容必须是字符串'
    }),
    consultMethod: Joi.number().integer().min(1).max(5).optional().messages({
        'number.base': '咨询方式必须是数字',
        'number.integer': '咨询方式必须是整数',
        'number.min': '咨询方式不能小于1',
        'number.max': '咨询方式不能大于5'
    }),
    consultDate: Joi.date().iso().optional().messages({
        'date.base': '咨询日期必须是有效的日期',
        'date.format': '咨询日期必须是ISO格式(YYYY-MM-DD)'
    }),
    intentionLevel: Joi.number().integer().min(1).max(5).optional().messages({
        'number.base': '意向级别必须是数字',
        'number.integer': '意向级别必须是整数',
        'number.min': '意向级别不能小于1',
        'number.max': '意向级别不能大于5'
    }),
    followupStatus: Joi.number().integer().min(1).max(4).optional().messages({
        'number.base': '跟进状态必须是数字',
        'number.integer': '跟进状态必须是整数',
        'number.min': '跟进状态不能小于1',
        'number.max': '跟进状态不能大于4'
    }),
    nextFollowupDate: Joi.date().iso().allow(null).optional().messages({
        'date.base': '下次跟进日期必须是有效的日期',
        'date.format': '下次跟进日期必须是ISO格式(YYYY-MM-DD)'
    }),
    remark: Joi.string().allow('', null).optional().messages({
        'string.base': '备注必须是字符串'
    })
});
/**
 * 招生咨询过滤参数验证规则
 */
exports.enrollmentConsultationFilterSchema = Joi.object({
    page: Joi.number().integer().min(1).optional().messages({
        'number.base': '页码必须是数字',
        'number.integer': '页码必须是整数',
        'number.min': '页码必须大于等于1'
    }),
    pageSize: Joi.number().integer().min(1).max(100).optional().messages({
        'number.base': '每页条数必须是数字',
        'number.integer': '每页条数必须是整数',
        'number.min': '每页条数必须大于等于1',
        'number.max': '每页条数不能超过100'
    }),
    kindergartenId: Joi.number().integer().positive().optional().messages({
        'number.base': '幼儿园ID必须是数字',
        'number.integer': '幼儿园ID必须是整数',
        'number.positive': '幼儿园ID必须是正数'
    }),
    consultantId: Joi.number().integer().positive().optional().messages({
        'number.base': '咨询师ID必须是数字',
        'number.integer': '咨询师ID必须是整数',
        'number.positive': '咨询师ID必须是正数'
    }),
    parentName: Joi.string().optional().messages({
        'string.base': '家长姓名必须是字符串'
    }),
    childName: Joi.string().optional().messages({
        'string.base': '孩子姓名必须是字符串'
    }),
    contactPhone: Joi.string().optional().messages({
        'string.base': '联系电话必须是字符串'
    }),
    sourceChannel: Joi.number().integer().min(1).max(6).optional().messages({
        'number.base': '来源渠道必须是数字',
        'number.integer': '来源渠道必须是整数',
        'number.min': '来源渠道不能小于1',
        'number.max': '来源渠道不能大于6'
    }),
    intentionLevel: Joi.number().integer().min(1).max(5).optional().messages({
        'number.base': '意向级别必须是数字',
        'number.integer': '意向级别必须是整数',
        'number.min': '意向级别不能小于1',
        'number.max': '意向级别不能大于5'
    }),
    followupStatus: Joi.number().integer().min(1).max(4).optional().messages({
        'number.base': '跟进状态必须是数字',
        'number.integer': '跟进状态必须是整数',
        'number.min': '跟进状态不能小于1',
        'number.max': '跟进状态不能大于4'
    }),
    startDate: Joi.date().iso().optional().messages({
        'date.base': '开始日期必须是有效的日期',
        'date.format': '开始日期必须是ISO格式(YYYY-MM-DD)'
    }),
    endDate: Joi.date().iso().optional().messages({
        'date.base': '结束日期必须是有效的日期',
        'date.format': '结束日期必须是ISO格式(YYYY-MM-DD)'
    }),
    needFollowup: Joi.boolean().optional().messages({
        'boolean.base': '是否需要跟进必须是布尔值'
    }),
    sortBy: Joi.string().valid('id', 'consultDate', 'intentionLevel', 'followupStatus', 'createdAt').optional().messages({
        'string.base': '排序字段必须是字符串',
        'any.only': '排序字段只能是id、consultDate、intentionLevel、followupStatus或createdAt'
    }),
    sortOrder: Joi.string().valid('ASC', 'DESC').optional().messages({
        'string.base': '排序方式必须是字符串',
        'any.only': '排序方式只能是ASC或DESC'
    })
});
/**
 * 创建招生咨询跟进验证规则
 */
exports.createEnrollmentConsultationFollowupSchema = Joi.object({
    consultationId: Joi.number().integer().positive().required().messages({
        'number.base': '咨询ID必须是数字',
        'number.integer': '咨询ID必须是整数',
        'number.positive': '咨询ID必须是正数',
        'any.required': '咨询ID是必填项'
    }),
    followupMethod: Joi.number().integer().min(1).max(6).required().messages({
        'number.base': '跟进方式必须是数字',
        'number.integer': '跟进方式必须是整数',
        'number.min': '跟进方式不能小于1',
        'number.max': '跟进方式不能大于6',
        'any.required': '跟进方式是必填项'
    }),
    followupContent: Joi.string().required().messages({
        'string.base': '跟进内容必须是字符串',
        'any.required': '跟进内容是必填项'
    }),
    followupDate: Joi.date().iso().required().messages({
        'date.base': '跟进日期必须是有效的日期',
        'date.format': '跟进日期必须是ISO格式(YYYY-MM-DD)',
        'any.required': '跟进日期是必填项'
    }),
    intentionLevel: Joi.number().integer().min(1).max(5).required().messages({
        'number.base': '意向级别必须是数字',
        'number.integer': '意向级别必须是整数',
        'number.min': '意向级别不能小于1',
        'number.max': '意向级别不能大于5',
        'any.required': '意向级别是必填项'
    }),
    followupResult: Joi.number().integer().min(1).max(4).required().messages({
        'number.base': '跟进结果必须是数字',
        'number.integer': '跟进结果必须是整数',
        'number.min': '跟进结果不能小于1',
        'number.max': '跟进结果不能大于4',
        'any.required': '跟进结果是必填项'
    }),
    nextFollowupDate: Joi.date().iso().allow(null).optional().messages({
        'date.base': '下次跟进日期必须是有效的日期',
        'date.format': '下次跟进日期必须是ISO格式(YYYY-MM-DD)'
    }),
    remark: Joi.string().allow('', null).optional().messages({
        'string.base': '备注必须是字符串'
    })
});
/**
 * 招生咨询跟进过滤参数验证规则
 */
exports.enrollmentConsultationFollowupFilterSchema = Joi.object({
    page: Joi.number().integer().min(1).optional().messages({
        'number.base': '页码必须是数字',
        'number.integer': '页码必须是整数',
        'number.min': '页码必须大于等于1'
    }),
    pageSize: Joi.number().integer().min(1).max(100).optional().messages({
        'number.base': '每页条数必须是数字',
        'number.integer': '每页条数必须是整数',
        'number.min': '每页条数必须大于等于1',
        'number.max': '每页条数不能超过100'
    }),
    consultationId: Joi.number().integer().positive().optional().messages({
        'number.base': '咨询ID必须是数字',
        'number.integer': '咨询ID必须是整数',
        'number.positive': '咨询ID必须是正数'
    }),
    followupUserId: Joi.number().integer().positive().optional().messages({
        'number.base': '跟进人ID必须是数字',
        'number.integer': '跟进人ID必须是整数',
        'number.positive': '跟进人ID必须是正数'
    }),
    followupMethod: Joi.number().integer().min(1).max(6).optional().messages({
        'number.base': '跟进方式必须是数字',
        'number.integer': '跟进方式必须是整数',
        'number.min': '跟进方式不能小于1',
        'number.max': '跟进方式不能大于6'
    }),
    followupResult: Joi.number().integer().min(1).max(4).optional().messages({
        'number.base': '跟进结果必须是数字',
        'number.integer': '跟进结果必须是整数',
        'number.min': '跟进结果不能小于1',
        'number.max': '跟进结果不能大于4'
    }),
    startDate: Joi.date().iso().optional().messages({
        'date.base': '开始日期必须是有效的日期',
        'date.format': '开始日期必须是ISO格式(YYYY-MM-DD)'
    }),
    endDate: Joi.date().iso().optional().messages({
        'date.base': '结束日期必须是有效的日期',
        'date.format': '结束日期必须是ISO格式(YYYY-MM-DD)'
    }),
    sortBy: Joi.string().valid('id', 'followupDate', 'intentionLevel', 'followupResult', 'createdAt').optional().messages({
        'string.base': '排序字段必须是字符串',
        'any.only': '排序字段只能是id、followupDate、intentionLevel、followupResult或createdAt'
    }),
    sortOrder: Joi.string().valid('ASC', 'DESC').optional().messages({
        'string.base': '排序方式必须是字符串',
        'any.only': '排序方式只能是ASC或DESC'
    })
});
