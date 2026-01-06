const Joi = require('joi');

// 创建权限验证规则
export const createPermissionSchema = Joi.object({
  name: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': '权限名称长度不能超过50个字符',
      'any.required': '权限名称不能为空'
    }),

  code: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': '权限编码长度不能超过50个字符',
      'any.required': '权限编码不能为空'
    }),

  type: Joi.string()
    .valid('menu', 'button', 'api')
    .required()
    .messages({
      'any.only': '权限类型只能是menu、button或api',
      'any.required': '权限类型不能为空'
    }),

  parentId: Joi.number()
    .allow(null)
    .messages({
      'number.base': '父级权限ID必须是数字'
    }),

  path: Joi.string()
    .max(200)
    .allow('')
    .messages({
      'string.max': '权限路径长度不能超过200个字符'
    }),

  icon: Joi.string()
    .max(50)
    .allow('')
    .messages({
      'string.max': '图标名称长度不能超过50个字符'
    }),

  component: Joi.string()
    .max(100)
    .allow('')
    .messages({
      'string.max': '组件路径长度不能超过100个字符'
    }),

  permission: Joi.string()
    .max(100)
    .allow('')
    .messages({
      'string.max': '权限标识长度不能超过100个字符'
    }),

  sort: Joi.number()
    .default(0)
    .messages({
      'number.base': '排序值必须是数字'
    }),

  status: Joi.number()
    .valid(0, 1)
    .default(1)
    .messages({
      'any.only': '状态值只能是0或1'
    })
});

// 更新权限验证规则
export const updatePermissionSchema = Joi.object({
  name: Joi.string()
    .max(50)
    .allow('')
    .messages({
      'string.max': '权限名称长度不能超过50个字符'
    }),

  code: Joi.string()
    .max(50)
    .allow('')
    .messages({
      'string.max': '权限编码长度不能超过50个字符'
    }),

  type: Joi.string()
    .valid('menu', 'button', 'api')
    .allow('')
    .messages({
      'any.only': '权限类型只能是menu、button或api'
    }),

  parentId: Joi.number()
    .allow(null)
    .messages({
      'number.base': '父级权限ID必须是数字'
    }),

  path: Joi.string()
    .max(200)
    .allow('')
    .messages({
      'string.max': '权限路径长度不能超过200个字符'
    }),

  icon: Joi.string()
    .max(50)
    .allow('')
    .messages({
      'string.max': '图标名称长度不能超过50个字符'
    }),

  component: Joi.string()
    .max(100)
    .allow('')
    .messages({
      'string.max': '组件路径长度不能超过100个字符'
    }),

  permission: Joi.string()
    .max(100)
    .allow('')
    .messages({
      'string.max': '权限标识长度不能超过100个字符'
    }),

  sort: Joi.number()
    .allow(null)
    .messages({
      'number.base': '排序值必须是数字'
    }),

  status: Joi.number()
    .valid(0, 1)
    .allow(null)
    .messages({
      'any.only': '状态值只能是0或1'
    })
}); 