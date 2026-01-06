const Joi = require('joi');

// 创建角色验证规则
export const createRoleSchema = Joi.object({
  name: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': '角色名称长度不能超过50个字符',
      'any.required': '角色名称不能为空'
    }),

  code: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': '角色编码长度不能超过50个字符',
      'any.required': '角色编码不能为空'
    }),

  description: Joi.string()
    .max(200)
    .allow('')
    .messages({
      'string.max': '角色描述长度不能超过200个字符'
    }),

  status: Joi.number()
    .valid(0, 1)
    .default(1)
    .messages({
      'any.only': '状态值只能是0或1'
    }),

  permissionIds: Joi.array()
    .items(Joi.number())
    .allow(null)
    .messages({
      'array.base': '权限ID必须是数组'
    })
});

// 更新角色验证规则
export const updateRoleSchema = Joi.object({
  name: Joi.string()
    .max(50)
    .allow('')
    .messages({
      'string.max': '角色名称长度不能超过50个字符'
    }),

  code: Joi.string()
    .max(50)
    .allow('')
    .messages({
      'string.max': '角色编码长度不能超过50个字符'
    }),

  description: Joi.string()
    .max(200)
    .allow('')
    .messages({
      'string.max': '角色描述长度不能超过200个字符'
    }),

  status: Joi.number()
    .valid(0, 1)
    .allow(null)
    .messages({
      'any.only': '状态值只能是0或1'
    }),

  permissionIds: Joi.array()
    .items(Joi.number())
    .allow(null)
    .messages({
      'array.base': '权限ID必须是数组'
    })
}); 