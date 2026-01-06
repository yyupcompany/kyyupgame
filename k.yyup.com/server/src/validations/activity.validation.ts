const Joi = require('joi');

/**
 * 活动验证规则
 */

// 活动类型枚举
const activityTypes = ['outdoor', 'indoor', 'educational', 'sports', 'arts', 'science', 'social'];

// 活动状态枚举
const activityStatuses = ['draft', 'published', 'active', 'completed', 'cancelled'];

// 年龄组枚举
const ageGroups = ['2-3', '3-4', '4-5', '5-6', '6-7'];

/**
 * 创建活动验证规则
 */
export const createActivitySchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': '活动名称不能为空',
      'string.min': '活动名称至少需要2个字符',
      'string.max': '活动名称不能超过100个字符',
      'any.required': '活动名称是必填字段'
    }),

  description: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.empty': '活动描述不能为空',
      'string.min': '活动描述至少需要10个字符',
      'string.max': '活动描述不能超过1000个字符',
      'any.required': '活动描述是必填字段'
    }),

  type: Joi.string()
    .valid(...activityTypes)
    .required()
    .messages({
      'any.only': `活动类型必须是以下之一: ${activityTypes.join(', ')}`,
      'any.required': '活动类型是必填字段'
    }),

  date: Joi.date()
    .min('now')
    .required()
    .messages({
      'date.min': '活动日期不能早于今天',
      'any.required': '活动日期是必填字段'
    }),

  startTime: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': '开始时间格式不正确，应为HH:MM',
      'any.required': '开始时间是必填字段'
    }),

  endTime: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': '结束时间格式不正确，应为HH:MM',
      'any.required': '结束时间是必填字段'
    }),

  location: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': '活动地点不能为空',
      'string.min': '活动地点至少需要2个字符',
      'string.max': '活动地点不能超过100个字符',
      'any.required': '活动地点是必填字段'
    }),

  address: Joi.string()
    .min(5)
    .max(200)
    .optional()
    .messages({
      'string.min': '详细地址至少需要5个字符',
      'string.max': '详细地址不能超过200个字符'
    }),

  maxParticipants: Joi.number()
    .integer()
    .min(1)
    .max(500)
    .required()
    .messages({
      'number.base': '最大参与人数必须是数字',
      'number.integer': '最大参与人数必须是整数',
      'number.min': '最大参与人数至少为1',
      'number.max': '最大参与人数不能超过500',
      'any.required': '最大参与人数是必填字段'
    }),

  minAge: Joi.number()
    .integer()
    .min(2)
    .max(7)
    .required()
    .messages({
      'number.base': '最小年龄必须是数字',
      'number.integer': '最小年龄必须是整数',
      'number.min': '最小年龄不能小于2岁',
      'number.max': '最小年龄不能大于7岁',
      'any.required': '最小年龄是必填字段'
    }),

  maxAge: Joi.number()
    .integer()
    .min(2)
    .max(7)
    .required()
    .messages({
      'number.base': '最大年龄必须是数字',
      'number.integer': '最大年龄必须是整数',
      'number.min': '最大年龄不能小于2岁',
      'number.max': '最大年龄不能大于7岁',
      'any.required': '最大年龄是必填字段'
    }),

  cost: Joi.number()
    .min(0)
    .max(10000)
    .default(0)
    .messages({
      'number.base': '活动费用必须是数字',
      'number.min': '活动费用不能为负数',
      'number.max': '活动费用不能超过10000元'
    }),

  requirements: Joi.array()
    .items(Joi.string().min(1).max(100))
    .max(20)
    .default([])
    .messages({
      'array.max': '活动要求不能超过20项',
      'string.min': '每项要求至少需要1个字符',
      'string.max': '每项要求不能超过100个字符'
    }),

  ageGroups: Joi.array()
    .items(Joi.string().valid(...ageGroups))
    .min(1)
    .required()
    .messages({
      'array.min': '至少需要选择一个年龄组',
      'any.only': `年龄组必须是以下之一: ${ageGroups.join(', ')}`,
      'any.required': '年龄组是必填字段'
    }),

  organizerId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': '组织者ID必须是数字',
      'number.integer': '组织者ID必须是整数',
      'number.positive': '组织者ID必须是正数',
      'any.required': '组织者ID是必填字段'
    }),

  kindergartenId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': '幼儿园ID必须是数字',
      'number.integer': '幼儿园ID必须是整数',
      'number.positive': '幼儿园ID必须是正数',
      'any.required': '幼儿园ID是必填字段'
    }),

  status: Joi.string()
    .valid(...activityStatuses)
    .default('draft')
    .messages({
      'any.only': `活动状态必须是以下之一: ${activityStatuses.join(', ')}`
    })
}).custom((value, helpers) => {
  // 验证年龄范围合理性
  if (value.minAge > value.maxAge) {
    return helpers.error('custom.ageRange', { message: '最小年龄不能大于最大年龄' });
  }

  // 验证时间范围合理性
  const startTime = value.startTime.split(':').map(Number);
  const endTime = value.endTime.split(':').map(Number);
  const startMinutes = startTime[0] * 60 + startTime[1];
  const endMinutes = endTime[0] * 60 + endTime[1];
  
  if (startMinutes >= endMinutes) {
    return helpers.error('custom.timeRange', { message: '开始时间必须早于结束时间' });
  }

  // 验证活动容量合理性
  if (value.type === 'indoor' && value.maxParticipants > 200) {
    return helpers.error('custom.capacityLimit', { message: 'Indoor activity capacity should not exceed 200 participants' });
  }

  return value;
});

/**
 * 更新活动验证规则
 */
export const updateActivitySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().min(10).max(1000).optional(),
  type: Joi.string().valid(...activityTypes).optional(),
  date: Joi.date().min('now').optional(),
  startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  location: Joi.string().min(2).max(100).optional(),
  address: Joi.string().min(5).max(200).optional(),
  maxParticipants: Joi.number().integer().min(1).max(500).optional(),
  minAge: Joi.number().integer().min(2).max(7).optional(),
  maxAge: Joi.number().integer().min(2).max(7).optional(),
  cost: Joi.number().min(0).max(10000).optional(),
  requirements: Joi.array().items(Joi.string().min(1).max(100)).max(20).optional(),
  ageGroups: Joi.array().items(Joi.string().valid(...ageGroups)).min(1).optional(),
  status: Joi.string().valid(...activityStatuses).optional()
});

/**
 * 活动查询验证规则
 */
export const activityQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid(...activityStatuses).optional(),
  type: Joi.string().valid(...activityTypes).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  search: Joi.string().max(100).optional(),
  sortBy: Joi.string().valid('name', 'date', 'cost', 'maxParticipants', 'createdAt').default('date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  kindergartenId: Joi.number().integer().positive().optional()
});

/**
 * 活动报名验证规则
 */
export const activityRegistrationSchema = Joi.object({
  activityId: Joi.number().integer().positive().required(),
  studentId: Joi.number().integer().positive().required(),
  parentId: Joi.number().integer().positive().required(),
  notes: Joi.string().max(500).optional(),
  emergencyContact: Joi.string().min(2).max(50).required(),
  emergencyPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).required()
});

// 验证函数
export const validateCreateActivity = (data: any) => {
  return createActivitySchema.validate(data, { abortEarly: false });
};

export const validateUpdateActivity = (data: any) => {
  return updateActivitySchema.validate(data, { abortEarly: false });
};

export const validateActivityQuery = (data: any) => {
  return activityQuerySchema.validate(data, { abortEarly: false });
};

export const validateActivityRegistration = (data: any) => {
  return activityRegistrationSchema.validate(data, { abortEarly: false });
};
