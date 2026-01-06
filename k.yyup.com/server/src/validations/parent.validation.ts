const Joi = require('joi');

/**
 * 创建家长验证规则
 */
export const createParentSchema = Joi.object({
  userId: Joi.number().integer().positive().required().messages({
    'number.base': '用户ID必须是数字',
    'number.integer': '用户ID必须是整数',
    'number.positive': '用户ID必须是正数',
    'any.required': '用户ID是必填项'
  }),
  studentId: Joi.number().integer().positive().required().messages({
    'number.base': '学生ID必须是数字',
    'number.integer': '学生ID必须是整数',
    'number.positive': '学生ID必须是正数',
    'any.required': '学生ID是必填项'
  }),
  relationship: Joi.string().max(20).required().messages({
    'string.base': '关系必须是字符串',
    'string.empty': '关系不能为空',
    'string.max': '关系最多20个字符',
    'any.required': '关系是必填项'
  }),
  isPrimaryContact: Joi.number().valid(0, 1).default(0).messages({
    'number.base': '是否主要联系人必须是数字',
    'any.only': '是否主要联系人只能是0(否)或1(是)'
  }),
  isLegalGuardian: Joi.number().valid(0, 1).default(0).messages({
    'number.base': '是否法定监护人必须是数字',
    'any.only': '是否法定监护人只能是0(否)或1(是)'
  }),
  idCardNo: Joi.string().max(18).allow('', null).optional().messages({
    'string.base': '身份证号必须是字符串',
    'string.max': '身份证号最多18个字符'
  }),
  workUnit: Joi.string().max(100).allow('', null).optional().messages({
    'string.base': '工作单位必须是字符串',
    'string.max': '工作单位最多100个字符'
  }),
  occupation: Joi.string().max(50).allow('', null).optional().messages({
    'string.base': '职业必须是字符串',
    'string.max': '职业最多50个字符'
  }),
  education: Joi.string().max(50).allow('', null).optional().messages({
    'string.base': '学历必须是字符串',
    'string.max': '学历最多50个字符'
  }),
  address: Joi.string().max(200).allow('', null).optional().messages({
    'string.base': '地址必须是字符串',
    'string.max': '地址最多200个字符'
  }),
  remark: Joi.string().max(500).allow('', null).optional().messages({
    'string.base': '备注必须是字符串',
    'string.max': '备注最多500个字符'
  })
});

/**
 * 更新家长验证规则
 */
export const updateParentSchema = Joi.object({
  relationship: Joi.string().max(20).optional().messages({
    'string.base': '关系必须是字符串',
    'string.empty': '关系不能为空',
    'string.max': '关系最多20个字符'
  }),
  isPrimaryContact: Joi.number().valid(0, 1).optional().messages({
    'number.base': '是否主要联系人必须是数字',
    'any.only': '是否主要联系人只能是0(否)或1(是)'
  }),
  isLegalGuardian: Joi.number().valid(0, 1).optional().messages({
    'number.base': '是否法定监护人必须是数字',
    'any.only': '是否法定监护人只能是0(否)或1(是)'
  }),
  idCardNo: Joi.string().max(18).allow('', null).optional().messages({
    'string.base': '身份证号必须是字符串',
    'string.max': '身份证号最多18个字符'
  }),
  workUnit: Joi.string().max(100).allow('', null).optional().messages({
    'string.base': '工作单位必须是字符串',
    'string.max': '工作单位最多100个字符'
  }),
  occupation: Joi.string().max(50).allow('', null).optional().messages({
    'string.base': '职业必须是字符串',
    'string.max': '职业最多50个字符'
  }),
  education: Joi.string().max(50).allow('', null).optional().messages({
    'string.base': '学历必须是字符串',
    'string.max': '学历最多50个字符'
  }),
  address: Joi.string().max(200).allow('', null).optional().messages({
    'string.base': '地址必须是字符串',
    'string.max': '地址最多200个字符'
  }),
  remark: Joi.string().max(500).allow('', null).optional().messages({
    'string.base': '备注必须是字符串',
    'string.max': '备注最多500个字符'
  })
});

/**
 * 家长过滤参数验证规则
 */
export const parentFilterSchema = Joi.object({
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
  studentId: Joi.number().integer().positive().optional().messages({
    'number.base': '学生ID必须是数字',
    'number.integer': '学生ID必须是整数',
    'number.positive': '学生ID必须是正数'
  }),
  userId: Joi.number().integer().positive().optional().messages({
    'number.base': '用户ID必须是数字',
    'number.integer': '用户ID必须是整数',
    'number.positive': '用户ID必须是正数'
  }),
  relationship: Joi.string().allow('', null).optional().messages({
    'string.base': '关系必须是字符串'
  }),
  isPrimaryContact: Joi.number().valid(0, 1).optional().messages({
    'number.base': '是否主要联系人必须是数字',
    'any.only': '是否主要联系人只能是0(否)或1(是)'
  }),
  isLegalGuardian: Joi.number().valid(0, 1).optional().messages({
    'number.base': '是否法定监护人必须是数字',
    'any.only': '是否法定监护人只能是0(否)或1(是)'
  }),
  sortBy: Joi.string().valid('id', 'createdAt', 'updatedAt', 'relationship').optional().messages({
    'string.base': '排序字段必须是字符串',
    'any.only': '排序字段只能是id、createdAt、updatedAt或relationship'
  }),
  sortOrder: Joi.string().valid('ASC', 'DESC').optional().messages({
    'string.base': '排序方式必须是字符串',
    'any.only': '排序方式只能是ASC或DESC'
  })
});

/**
 * 家长跟进记录验证规则
 */
export const parentFollowupSchema = Joi.object({
  parentId: Joi.number().integer().positive().required().messages({
    'number.base': '家长ID必须是数字',
    'number.integer': '家长ID必须是整数',
    'number.positive': '家长ID必须是正数',
    'any.required': '家长ID是必填项'
  }),
  content: Joi.string().max(1000).required().messages({
    'string.base': '跟进内容必须是字符串',
    'string.empty': '跟进内容不能为空',
    'string.max': '跟进内容最多1000个字符',
    'any.required': '跟进内容是必填项'
  }),
  followupDate: Joi.date().iso().required().messages({
    'date.base': '跟进日期必须是有效的日期',
    'date.format': '跟进日期必须是ISO格式(YYYY-MM-DD)',
    'any.required': '跟进日期是必填项'
  }),
  followupType: Joi.string().max(50).required().messages({
    'string.base': '跟进类型必须是字符串',
    'string.empty': '跟进类型不能为空',
    'string.max': '跟进类型最多50个字符',
    'any.required': '跟进类型是必填项'
  }),
  result: Joi.string().max(500).allow('', null).optional().messages({
    'string.base': '跟进结果必须是字符串',
    'string.max': '跟进结果最多500个字符'
  }),
  nextFollowupDate: Joi.date().iso().allow('', null).optional().messages({
    'date.base': '下次跟进日期必须是有效的日期',
    'date.format': '下次跟进日期必须是ISO格式(YYYY-MM-DD)'
  })
});

/**
 * 家长跟进记录过滤参数验证规则
 */
export const parentFollowupFilterSchema = Joi.object({
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
  parentId: Joi.number().integer().positive().required().messages({
    'number.base': '家长ID必须是数字',
    'number.integer': '家长ID必须是整数',
    'number.positive': '家长ID必须是正数',
    'any.required': '家长ID是必填项'
  }),
  followupType: Joi.string().allow('', null).optional().messages({
    'string.base': '跟进类型必须是字符串'
  }),
  startDate: Joi.date().iso().allow('', null).optional().messages({
    'date.base': '开始日期必须是有效的日期',
    'date.format': '开始日期必须是ISO格式(YYYY-MM-DD)'
  }),
  endDate: Joi.date().iso().allow('', null).optional().messages({
    'date.base': '结束日期必须是有效的日期',
    'date.format': '结束日期必须是ISO格式(YYYY-MM-DD)'
  }),
  sortBy: Joi.string().valid('id', 'followupDate', 'createdAt').optional().messages({
    'string.base': '排序字段必须是字符串',
    'any.only': '排序字段只能是id、followupDate或createdAt'
  }),
  sortOrder: Joi.string().valid('ASC', 'DESC').optional().messages({
    'string.base': '排序方式必须是字符串',
    'any.only': '排序方式只能是ASC或DESC'
  })
});

/**
 * 批量设置学生家长关联验证规则
 */
export const batchSetStudentParentsSchema = Joi.object({
  studentId: Joi.number().integer().positive().required().messages({
    'number.base': '学生ID必须是数字',
    'number.integer': '学生ID必须是整数',
    'number.positive': '学生ID必须是正数',
    'any.required': '学生ID是必填项'
  }),
  parentIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
    'array.base': '家长ID列表必须是数组',
    'array.min': '家长ID列表至少需要一个家长ID',
    'any.required': '家长ID列表是必填项'
  })
});

/**
 * 批量设置家长学生关联验证规则
 */
export const batchSetParentStudentsSchema = Joi.object({
  parentId: Joi.number().integer().positive().required().messages({
    'number.base': '家长ID必须是数字',
    'number.integer': '家长ID必须是整数',
    'number.positive': '家长ID必须是正数',
    'any.required': '家长ID是必填项'
  }),
  studentIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
    'array.base': '学生ID列表必须是数组',
    'array.min': '学生ID列表至少需要一个学生ID',
    'any.required': '学生ID列表是必填项'
  })
});

const { ApiError } = require('../utils/apiError');

/**
 * 验证创建家长数据
 */
export const validateCreateParent = async (req: any, res: any, next: any) => {
  try {
    const { error, value } = createParentSchema.validate(req.body);
    if (error) {
      return next(new ApiError(400, error.details[0].message));
    }
    req.body = value;
    next();
  } catch (err) {
    next(new ApiError(500, '验证过程中发生错误'));
  }
};

/**
 * 验证更新家长数据
 */
export const validateUpdateParent = async (req: any, res: any, next: any) => {
  try {
    const { error, value } = updateParentSchema.validate(req.body);
    if (error) {
      return next(new ApiError(400, error.details[0].message));
    }
    req.body = value;
    next();
  } catch (err) {
    next(new ApiError(500, '验证过程中发生错误'));
  }
};

/**
 * 验证家长查询参数
 */
export const validateParentQuery = async (req: any, res: any, next: any) => {
  try {
    const { error, value } = parentFilterSchema.validate(req.query);
    if (error) {
      return next(new ApiError(400, error.details[0].message));
    }
    req.query = value;
    next();
  } catch (err) {
    next(new ApiError(500, '验证过程中发生错误'));
  }
};

/**
 * 验证家长ID
 */
export const validateParentId = async (req: any, res: any, next: any) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.number().integer().positive().required().messages({
        'number.base': '家长ID必须是数字',
        'number.integer': '家长ID必须是整数',
        'number.positive': '家长ID必须是正数',
        'any.required': '家长ID是必填项'
      })
    }).validate({ id: req.params.id });

    if (error) {
      return next(new ApiError(400, error.details[0].message));
    }
    req.params.id = value.id;
    next();
  } catch (err) {
    next(new ApiError(500, '验证过程中发生错误'));
  }
};

/**
 * 验证添加学生关系数据
 */
export const validateAddStudentRelation = async (req: any, res: any, next: any) => {
  try {
    // 创建一个简单的学生关系验证schema
    const addStudentRelationSchema = Joi.object({
      studentId: Joi.number().integer().positive().required().messages({
        'number.base': '学生ID必须是数字',
        'number.integer': '学生ID必须是整数',
        'number.positive': '学生ID必须是正数',
        'any.required': '学生ID是必填项'
      }),
      relationship: Joi.string().valid('father', 'mother', 'guardian', 'grandparent', 'other').required().messages({
        'string.base': '关系类型必须是字符串',
        'any.only': '关系类型只能是father、mother、guardian、grandparent或other',
        'any.required': '关系类型是必填项'
      })
    });

    const { error, value } = addStudentRelationSchema.validate(req.body);
    if (error) {
      return next(new ApiError(400, error.details[0].message));
    }
    req.body = value;
    next();
  } catch (err) {
    next(new ApiError(500, '验证过程中发生错误'));
  }
};

/**
 * 验证批量设置家长学生关系数据
 */
export const validateBatchSetParentStudents = async (req: any, res: any, next: any) => {
  try {
    const { error, value } = batchSetParentStudentsSchema.validate(req.body);
    if (error) {
      return next(new ApiError(400, error.details[0].message));
    }
    req.body = value;
    next();
  } catch (err) {
    next(new ApiError(500, '验证过程中发生错误'));
  }
};