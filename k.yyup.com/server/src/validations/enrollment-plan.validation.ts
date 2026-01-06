const Joi = require('joi');

/**
 * 创建招生计划验证规则
 */
export const createEnrollmentPlanSchema = Joi.object({
  name: Joi.string().max(100).required().messages({
    'string.base': '计划名称必须是字符串',
    'string.empty': '计划名称不能为空',
    'string.max': '计划名称最多100个字符',
    'any.required': '计划名称是必填项'
  }),
  year: Joi.number().integer().min(2000).max(2100).required().messages({
    'number.base': '年份必须是数字',
    'number.integer': '年份必须是整数',
    'number.min': '年份必须大于等于2000',
    'number.max': '年份必须小于等于2100',
    'any.required': '年份是必填项'
  }),
  term: Joi.string().valid('春季', '秋季', '寒假', '暑假').required().messages({
    'string.base': '学期必须是字符串',
    'any.only': '学期只能是春季、秋季、寒假或暑假',
    'any.required': '学期是必填项'
  }),
  startDate: Joi.date().iso().required().messages({
    'date.base': '开始日期必须是有效的日期',
    'date.format': '开始日期必须是ISO格式(YYYY-MM-DD)',
    'any.required': '开始日期是必填项'
  }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required().messages({
    'date.base': '结束日期必须是有效的日期',
    'date.format': '结束日期必须是ISO格式(YYYY-MM-DD)',
    'date.min': '结束日期必须晚于开始日期',
    'any.required': '结束日期是必填项'
  }),
  targetCount: Joi.number().integer().min(1).required().messages({
    'number.base': '目标招生人数必须是数字',
    'number.integer': '目标招生人数必须是整数',
    'number.min': '目标招生人数必须大于等于1',
    'any.required': '目标招生人数是必填项'
  }),
  status: Joi.string().valid('draft', 'active', 'completed', 'cancelled').default('draft').messages({
    'string.base': '状态必须是字符串',
    'any.only': '状态只能是draft、active、completed或cancelled'
  }),
  description: Joi.string().max(1000).allow('', null).optional().messages({
    'string.base': '描述必须是字符串',
    'string.max': '描述最多1000个字符'
  }),
  classIds: Joi.array().items(Joi.number().integer().positive()).optional().messages({
    'array.base': '班级ID列表必须是数组',
    'number.base': '班级ID必须是数字',
    'number.integer': '班级ID必须是整数',
    'number.positive': '班级ID必须是正数'
  }),
  assigneeIds: Joi.array().items(Joi.number().integer().positive()).optional().messages({
    'array.base': '负责人ID列表必须是数组',
    'number.base': '负责人ID必须是数字',
    'number.integer': '负责人ID必须是整数',
    'number.positive': '负责人ID必须是正数'
  })
});

/**
 * 更新招生计划验证规则
 */
export const updateEnrollmentPlanSchema = Joi.object({
  name: Joi.string().max(100).optional().messages({
    'string.base': '计划名称必须是字符串',
    'string.empty': '计划名称不能为空',
    'string.max': '计划名称最多100个字符'
  }),
  year: Joi.number().integer().min(2000).max(2100).optional().messages({
    'number.base': '年份必须是数字',
    'number.integer': '年份必须是整数',
    'number.min': '年份必须大于等于2000',
    'number.max': '年份必须小于等于2100'
  }),
  term: Joi.string().valid('春季', '秋季', '寒假', '暑假').optional().messages({
    'string.base': '学期必须是字符串',
    'any.only': '学期只能是春季、秋季、寒假或暑假'
  }),
  startDate: Joi.date().iso().optional().messages({
    'date.base': '开始日期必须是有效的日期',
    'date.format': '开始日期必须是ISO格式(YYYY-MM-DD)'
  }),
  endDate: Joi.date().iso().optional().messages({
    'date.base': '结束日期必须是有效的日期',
    'date.format': '结束日期必须是ISO格式(YYYY-MM-DD)'
  }),
  targetCount: Joi.number().integer().min(1).optional().messages({
    'number.base': '目标招生人数必须是数字',
    'number.integer': '目标招生人数必须是整数',
    'number.min': '目标招生人数必须大于等于1'
  }),
  status: Joi.string().valid('draft', 'active', 'completed', 'cancelled').optional().messages({
    'string.base': '状态必须是字符串',
    'any.only': '状态只能是draft、active、completed或cancelled'
  }),
  description: Joi.string().max(1000).allow('', null).optional().messages({
    'string.base': '描述必须是字符串',
    'string.max': '描述最多1000个字符'
  }),
  classIds: Joi.array().items(Joi.number().integer().positive()).optional().messages({
    'array.base': '班级ID列表必须是数组',
    'number.base': '班级ID必须是数字',
    'number.integer': '班级ID必须是整数',
    'number.positive': '班级ID必须是正数'
  }),
  assigneeIds: Joi.array().items(Joi.number().integer().positive()).optional().messages({
    'array.base': '负责人ID列表必须是数组',
    'number.base': '负责人ID必须是数字',
    'number.integer': '负责人ID必须是整数',
    'number.positive': '负责人ID必须是正数'
  })
});

/**
 * 招生计划过滤参数验证规则
 */
export const enrollmentPlanFilterSchema = Joi.object({
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
  keyword: Joi.string().allow('', null).optional().messages({
    'string.base': '关键词必须是字符串'
  }),
  year: Joi.number().integer().min(2000).max(2100).optional().messages({
    'number.base': '年份必须是数字',
    'number.integer': '年份必须是整数',
    'number.min': '年份必须大于等于2000',
    'number.max': '年份必须小于等于2100'
  }),
  term: Joi.string().valid('春季', '秋季', '寒假', '暑假').optional().messages({
    'string.base': '学期必须是字符串',
    'any.only': '学期只能是春季、秋季、寒假或暑假'
  }),
  status: Joi.string().valid('draft', 'active', 'completed', 'cancelled').optional().messages({
    'string.base': '状态必须是字符串',
    'any.only': '状态只能是draft、active、completed或cancelled'
  }),
  startDateFrom: Joi.date().iso().optional().messages({
    'date.base': '开始日期起始值必须是有效的日期',
    'date.format': '开始日期起始值必须是ISO格式(YYYY-MM-DD)'
  }),
  startDateTo: Joi.date().iso().optional().messages({
    'date.base': '开始日期结束值必须是有效的日期',
    'date.format': '开始日期结束值必须是ISO格式(YYYY-MM-DD)'
  }),
  endDateFrom: Joi.date().iso().optional().messages({
    'date.base': '结束日期起始值必须是有效的日期',
    'date.format': '结束日期起始值必须是ISO格式(YYYY-MM-DD)'
  }),
  endDateTo: Joi.date().iso().optional().messages({
    'date.base': '结束日期结束值必须是有效的日期',
    'date.format': '结束日期结束值必须是ISO格式(YYYY-MM-DD)'
  }),
  sortBy: Joi.string().valid('id', 'name', 'year', 'startDate', 'endDate', 'targetCount', 'createdAt').optional().messages({
    'string.base': '排序字段必须是字符串',
    'any.only': '排序字段只能是id、name、year、startDate、endDate、targetCount或createdAt'
  }),
  sortOrder: Joi.string().valid('ASC', 'DESC').optional().messages({
    'string.base': '排序方式必须是字符串',
    'any.only': '排序方式只能是ASC或DESC'
  })
});

/**
 * 招生计划执行跟踪过滤参数验证规则
 */
export const enrollmentPlanTrackingFilterSchema = Joi.object({
  planId: Joi.number().integer().positive().required().messages({
    'number.base': '计划ID必须是数字',
    'number.integer': '计划ID必须是整数',
    'number.positive': '计划ID必须是正数',
    'any.required': '计划ID是必填项'
  }),
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
  startDate: Joi.date().iso().optional().messages({
    'date.base': '开始日期必须是有效的日期',
    'date.format': '开始日期必须是ISO格式(YYYY-MM-DD)'
  }),
  endDate: Joi.date().iso().optional().messages({
    'date.base': '结束日期必须是有效的日期',
    'date.format': '结束日期必须是ISO格式(YYYY-MM-DD)'
  }),
  assigneeId: Joi.number().integer().positive().optional().messages({
    'number.base': '负责人ID必须是数字',
    'number.integer': '负责人ID必须是整数',
    'number.positive': '负责人ID必须是正数'
  }),
  sortBy: Joi.string().valid('date', 'count').optional().messages({
    'string.base': '排序字段必须是字符串',
    'any.only': '排序字段只能是date或count'
  }),
  sortOrder: Joi.string().valid('ASC', 'DESC').optional().messages({
    'string.base': '排序方式必须是字符串',
    'any.only': '排序方式只能是ASC或DESC'
  })
});

/**
 * 招生计划班级关联验证规则
 */
export const enrollmentPlanClassSchema = Joi.object({
  planId: Joi.number().integer().positive().required().messages({
    'number.base': '计划ID必须是数字',
    'number.integer': '计划ID必须是整数',
    'number.positive': '计划ID必须是正数',
    'any.required': '计划ID是必填项'
  }),
  classIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
    'array.base': '班级ID列表必须是数组',
    'array.min': '班级ID列表至少需要一个班级ID',
    'number.base': '班级ID必须是数字',
    'number.integer': '班级ID必须是整数',
    'number.positive': '班级ID必须是正数',
    'any.required': '班级ID列表是必填项'
  })
});

/**
 * 招生计划分配人员验证规则
 */
export const enrollmentPlanAssigneeSchema = Joi.object({
  planId: Joi.number().integer().positive().required().messages({
    'number.base': '计划ID必须是数字',
    'number.integer': '计划ID必须是整数',
    'number.positive': '计划ID必须是正数',
    'any.required': '计划ID是必填项'
  }),
  assigneeIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
    'array.base': '负责人ID列表必须是数组',
    'array.min': '负责人ID列表至少需要一个负责人ID',
    'number.base': '负责人ID必须是数字',
    'number.integer': '负责人ID必须是整数',
    'number.positive': '负责人ID必须是正数',
    'any.required': '负责人ID列表是必填项'
  })
}); 