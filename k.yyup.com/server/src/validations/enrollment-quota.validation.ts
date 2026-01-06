const Joi = require('joi');

/**
 * 创建招生名额验证规则
 */
export const createEnrollmentQuotaSchema = Joi.object({
  planId: Joi.number().integer().positive().required().messages({
    'number.base': '招生计划ID必须是数字',
    'number.integer': '招生计划ID必须是整数',
    'number.positive': '招生计划ID必须是正数',
    'any.required': '招生计划ID是必填项'
  }),
  classId: Joi.number().integer().positive().required().messages({
    'number.base': '班级ID必须是数字',
    'number.integer': '班级ID必须是整数',
    'number.positive': '班级ID必须是正数',
    'any.required': '班级ID是必填项'
  }),
  totalQuota: Joi.number().integer().min(0).required().messages({
    'number.base': '总名额必须是数字',
    'number.integer': '总名额必须是整数',
    'number.min': '总名额不能小于0',
    'any.required': '总名额是必填项'
  }),
  usedQuota: Joi.number().integer().min(0).default(0).messages({
    'number.base': '已使用名额必须是数字',
    'number.integer': '已使用名额必须是整数',
    'number.min': '已使用名额不能小于0'
  }),
  reservedQuota: Joi.number().integer().min(0).default(0).messages({
    'number.base': '预留名额必须是数字',
    'number.integer': '预留名额必须是整数',
    'number.min': '预留名额不能小于0'
  }),
  remark: Joi.string().max(500).allow('', null).optional().messages({
    'string.base': '备注必须是字符串',
    'string.max': '备注最多500个字符'
  })
});

/**
 * 更新招生名额验证规则
 */
export const updateEnrollmentQuotaSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': '名额ID必须是数字',
    'number.integer': '名额ID必须是整数',
    'number.positive': '名额ID必须是正数',
    'any.required': '名额ID是必填项'
  }),
  totalQuota: Joi.number().integer().min(0).optional().messages({
    'number.base': '总名额必须是数字',
    'number.integer': '总名额必须是整数',
    'number.min': '总名额不能小于0'
  }),
  usedQuota: Joi.number().integer().min(0).optional().messages({
    'number.base': '已使用名额必须是数字',
    'number.integer': '已使用名额必须是整数',
    'number.min': '已使用名额不能小于0'
  }),
  reservedQuota: Joi.number().integer().min(0).optional().messages({
    'number.base': '预留名额必须是数字',
    'number.integer': '预留名额必须是整数',
    'number.min': '预留名额不能小于0'
  }),
  remark: Joi.string().max(500).allow('', null).optional().messages({
    'string.base': '备注必须是字符串',
    'string.max': '备注最多500个字符'
  })
});

/**
 * 招生名额过滤参数验证规则
 */
export const enrollmentQuotaFilterSchema = Joi.object({
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
  planId: Joi.number().integer().positive().optional().messages({
    'number.base': '招生计划ID必须是数字',
    'number.integer': '招生计划ID必须是整数',
    'number.positive': '招生计划ID必须是正数'
  }),
  classId: Joi.number().integer().positive().optional().messages({
    'number.base': '班级ID必须是数字',
    'number.integer': '班级ID必须是整数',
    'number.positive': '班级ID必须是正数'
  }),
  hasAvailable: Joi.boolean().optional().messages({
    'boolean.base': '是否有可用名额必须是布尔值'
  }),
  sortBy: Joi.string().valid('id', 'totalQuota', 'usedQuota', 'reservedQuota', 'availableQuota', 'createdAt').optional().messages({
    'string.base': '排序字段必须是字符串',
    'any.only': '排序字段只能是id、totalQuota、usedQuota、reservedQuota、availableQuota或createdAt'
  }),
  sortOrder: Joi.string().valid('ASC', 'DESC').optional().messages({
    'string.base': '排序方式必须是字符串',
    'any.only': '排序方式只能是ASC或DESC'
  })
});

/**
 * 招生名额分配验证规则
 */
export const enrollmentQuotaAllocationSchema = Joi.object({
  quotaId: Joi.number().integer().positive().required().messages({
    'number.base': '名额ID必须是数字',
    'number.integer': '名额ID必须是整数',
    'number.positive': '名额ID必须是正数',
    'any.required': '名额ID是必填项'
  }),
  amount: Joi.number().integer().min(1).required().messages({
    'number.base': '数量必须是数字',
    'number.integer': '数量必须是整数',
    'number.min': '数量必须大于等于1',
    'any.required': '数量是必填项'
  }),
  applicantId: Joi.number().integer().positive().optional().messages({
    'number.base': '申请人ID必须是数字',
    'number.integer': '申请人ID必须是整数',
    'number.positive': '申请人ID必须是正数'
  }),
  type: Joi.string().valid('use', 'reserve', 'release').required().messages({
    'string.base': '操作类型必须是字符串',
    'any.only': '操作类型只能是use、reserve或release',
    'any.required': '操作类型是必填项'
  }),
  remark: Joi.string().max(500).allow('', null).optional().messages({
    'string.base': '备注必须是字符串',
    'string.max': '备注最多500个字符'
  })
});

/**
 * 招生名额批量调整验证规则
 */
export const enrollmentQuotaBatchAdjustmentSchema = Joi.object({
  planId: Joi.number().integer().positive().required().messages({
    'number.base': '招生计划ID必须是数字',
    'number.integer': '招生计划ID必须是整数',
    'number.positive': '招生计划ID必须是正数',
    'any.required': '招生计划ID是必填项'
  }),
  adjustments: Joi.array().items(
    Joi.object({
      classId: Joi.number().integer().positive().required().messages({
        'number.base': '班级ID必须是数字',
        'number.integer': '班级ID必须是整数',
        'number.positive': '班级ID必须是正数',
        'any.required': '班级ID是必填项'
      }),
      amount: Joi.number().integer().required().messages({
        'number.base': '调整数量必须是数字',
        'number.integer': '调整数量必须是整数',
        'any.required': '调整数量是必填项'
      })
    })
  ).min(1).required().messages({
    'array.base': '调整项必须是数组',
    'array.min': '调整项至少需要一项',
    'any.required': '调整项是必填项'
  }),
  remark: Joi.string().max(500).allow('', null).optional().messages({
    'string.base': '备注必须是字符串',
    'string.max': '备注最多500个字符'
  })
}); 