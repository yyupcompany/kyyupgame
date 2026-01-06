const Joi = require('joi');

// 为用户分配角色时的验证规则
export const roleIdsSchema = Joi.object({
  roleIds: Joi.array().items(Joi.number().integer().positive()).min(1).required()
    .messages({
      'array.base': '角色ID必须是数组',
      'array.min': '至少需要一个角色ID',
      'number.base': '角色ID必须是数字',
      'number.integer': '角色ID必须是整数',
      'number.positive': '角色ID必须是正数',
      'any.required': '角色ID列表是必需的'
    }),
  isPrimary: Joi.number().valid(0, 1).default(0)
    .messages({
      'number.base': '是否主要角色必须是数字',
      'number.valid': '是否主要角色值只能是0或1'
    }),
  startTime: Joi.date().iso().allow(null)
    .messages({
      'date.base': '开始时间必须是有效的日期',
      'date.format': '开始时间格式必须是ISO'
    }),
  endTime: Joi.date().iso().allow(null).min(Joi.ref('startTime'))
    .messages({
      'date.base': '结束时间必须是有效的日期',
      'date.format': '结束时间格式必须是ISO',
      'date.min': '结束时间不能早于开始时间'
    }),
  grantorId: Joi.number().integer().positive().allow(null)
    .messages({
      'number.base': '授权人ID必须是数字',
      'number.integer': '授权人ID必须是整数',
      'number.positive': '授权人ID必须是正数'
    })
});

// 设置用户主要角色的验证规则
export const primaryRoleSchema = Joi.object({
  roleId: Joi.number().integer().positive().required()
    .messages({
      'number.base': '角色ID必须是数字',
      'number.integer': '角色ID必须是整数',
      'number.positive': '角色ID必须是正数',
      'any.required': '角色ID是必需的'
    })
});

// 更新角色有效期的验证规则
export const roleValiditySchema = Joi.object({
  startTime: Joi.date().iso().allow(null)
    .messages({
      'date.base': '开始时间必须是有效的日期',
      'date.format': '开始时间格式必须是ISO'
    }),
  endTime: Joi.date().iso().allow(null).min(Joi.ref('startTime'))
    .messages({
      'date.base': '结束时间必须是有效的日期',
      'date.format': '结束时间格式必须是ISO',
      'date.min': '结束时间不能早于开始时间'
    })
}).or('startTime', 'endTime')
  .messages({
    'object.missing': '开始时间和结束时间至少需要提供一个'
  }); 