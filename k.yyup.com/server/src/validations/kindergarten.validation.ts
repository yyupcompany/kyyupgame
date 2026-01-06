const Joi = require('joi');

// 创建幼儿园验证规则
export const createKindergartenSchema = Joi.object({
  name: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.max': '幼儿园名称长度不能超过100个字符',
      'any.required': '幼儿园名称不能为空'
    }),

  code: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': '幼儿园编码长度不能超过50个字符',
      'any.required': '幼儿园编码不能为空'
    }),

  type: Joi.number()
    .valid(1, 2, 3)
    .required()
    .messages({
      'any.only': '幼儿园类型只能是1(公办)、2(民办)或3(普惠)',
      'any.required': '幼儿园类型不能为空'
    }),

  level: Joi.number()
    .valid(1, 2, 3)
    .required()
    .messages({
      'any.only': '幼儿园等级只能是1(一级)、2(二级)或3(三级)',
      'any.required': '幼儿园等级不能为空'
    }),

  address: Joi.string()
    .max(200)
    .required()
    .messages({
      'string.max': '幼儿园地址长度不能超过200个字符',
      'any.required': '幼儿园地址不能为空'
    }),

  longitude: Joi.number()
    .required()
    .messages({
      'number.base': '经度必须是数字',
      'any.required': '经度不能为空'
    }),

  latitude: Joi.number()
    .required()
    .messages({
      'number.base': '纬度必须是数字',
      'any.required': '纬度不能为空'
    }),

  phone: Joi.string()
    .max(20)
    .required()
    .messages({
      'string.max': '联系电话长度不能超过20个字符',
      'any.required': '联系电话不能为空'
    }),

  email: Joi.string()
    .email()
    .max(100)
    .required()
    .messages({
      'string.email': '电子邮箱格式不正确',
      'string.max': '电子邮箱长度不能超过100个字符',
      'any.required': '电子邮箱不能为空'
    }),

  principal: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': '园长姓名长度不能超过50个字符',
      'any.required': '园长姓名不能为空'
    }),

  establishedDate: Joi.date()
    .required()
    .messages({
      'date.base': '成立时间格式不正确',
      'any.required': '成立时间不能为空'
    }),

  area: Joi.number()
    .required()
    .messages({
      'number.base': '占地面积必须是数字',
      'any.required': '占地面积不能为空'
    }),

  buildingArea: Joi.number()
    .required()
    .messages({
      'number.base': '建筑面积必须是数字',
      'any.required': '建筑面积不能为空'
    }),

  description: Joi.string()
    .allow('')
    .messages({
      'string.base': '幼儿园简介必须是字符串'
    }),

  features: Joi.string()
    .allow('')
    .messages({
      'string.base': '特色课程必须是字符串'
    }),

  philosophy: Joi.string()
    .allow('')
    .messages({
      'string.base': '办学理念必须是字符串'
    }),

  feeDescription: Joi.string()
    .allow('')
    .messages({
      'string.base': '收费标准必须是字符串'
    }),

  status: Joi.number()
    .valid(0, 1)
    .default(1)
    .messages({
      'any.only': '状态值只能是0或1'
    })
});

// 更新幼儿园验证规则
export const updateKindergartenSchema = Joi.object({
  name: Joi.string()
    .max(100)
    .allow('')
    .messages({
      'string.max': '幼儿园名称长度不能超过100个字符'
    }),

  code: Joi.string()
    .max(50)
    .allow('')
    .messages({
      'string.max': '幼儿园编码长度不能超过50个字符'
    }),

  type: Joi.number()
    .valid(1, 2, 3)
    .allow(null)
    .messages({
      'any.only': '幼儿园类型只能是1(公办)、2(民办)或3(普惠)'
    }),

  level: Joi.number()
    .valid(1, 2, 3)
    .allow(null)
    .messages({
      'any.only': '幼儿园等级只能是1(一级)、2(二级)或3(三级)'
    }),

  address: Joi.string()
    .max(200)
    .allow('')
    .messages({
      'string.max': '幼儿园地址长度不能超过200个字符'
    }),

  longitude: Joi.number()
    .allow(null)
    .messages({
      'number.base': '经度必须是数字'
    }),

  latitude: Joi.number()
    .allow(null)
    .messages({
      'number.base': '纬度必须是数字'
    }),

  phone: Joi.string()
    .max(20)
    .allow('')
    .messages({
      'string.max': '联系电话长度不能超过20个字符'
    }),

  email: Joi.string()
    .email()
    .max(100)
    .allow('')
    .messages({
      'string.email': '电子邮箱格式不正确',
      'string.max': '电子邮箱长度不能超过100个字符'
    }),

  principal: Joi.string()
    .max(50)
    .allow('')
    .messages({
      'string.max': '园长姓名长度不能超过50个字符'
    }),

  establishedDate: Joi.date()
    .allow(null)
    .messages({
      'date.base': '成立时间格式不正确'
    }),

  area: Joi.number()
    .allow(null)
    .messages({
      'number.base': '占地面积必须是数字'
    }),

  buildingArea: Joi.number()
    .allow(null)
    .messages({
      'number.base': '建筑面积必须是数字'
    }),

  description: Joi.string()
    .allow('')
    .messages({
      'string.base': '幼儿园简介必须是字符串'
    }),

  features: Joi.string()
    .allow('')
    .messages({
      'string.base': '特色课程必须是字符串'
    }),

  philosophy: Joi.string()
    .allow('')
    .messages({
      'string.base': '办学理念必须是字符串'
    }),

  feeDescription: Joi.string()
    .allow('')
    .messages({
      'string.base': '收费标准必须是字符串'
    }),

  status: Joi.number()
    .valid(0, 1)
    .allow(null)
    .messages({
      'any.only': '状态值只能是0或1'
    })
}); 