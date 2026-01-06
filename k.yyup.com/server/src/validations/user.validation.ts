const Joi = require('joi');
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';

// 创建用户验证规则
export const createUserSchema = Joi.object({
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
    .valid(0, 1)
    .default(1)
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
export const updateUserSchema = Joi.object({
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
export const changePasswordSchema = Joi.object({
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
export const validateCreateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = createUserSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new ApiError(400, errorMessage);
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const validateUpdateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = updateUserSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new ApiError(400, errorMessage);
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const validateChangePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = changePasswordSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new ApiError(400, errorMessage);
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const validateUserQuery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryData = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
      search: req.query.search || '',
      status: req.query.status
    };

    const querySchema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      sortBy: Joi.string().valid('id', 'username', 'email', 'createdAt', 'updatedAt').default('createdAt'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
      search: Joi.string().allow('').default(''),
      status: Joi.string().valid('active', 'inactive').optional()
    });

    const { error, value } = querySchema.validate(queryData, { abortEarly: false });
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new ApiError(400, errorMessage);
    }

    req.query = value;
    next();
  } catch (error) {
    next(error);
  }
};

export const validateUserId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idSchema = Joi.object({
      id: Joi.number().integer().positive().required().messages({
        'number.base': '用户ID必须是数字',
        'number.integer': '用户ID必须是整数',
        'number.positive': '用户ID必须是正数',
        'any.required': '用户ID是必填项'
      })
    });

    const { error } = idSchema.validate({ id: req.params.id }, { abortEarly: false });
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new ApiError(400, errorMessage);
    }
    next();
  } catch (error) {
    next(error);
  }
};