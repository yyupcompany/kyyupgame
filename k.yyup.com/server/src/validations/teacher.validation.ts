const Joi = require('joi');

/**
 * 教师验证规则
 */

// 教师状态枚举
const teacherStatuses = ['active', 'inactive', 'on_leave', 'resigned'];

// 教师职位枚举
const teacherPositions = ['head_teacher', 'assistant_teacher', 'subject_teacher', 'intern'];

// 教师专业枚举
const teacherSpecialties = ['语言', '数学', '科学', '艺术', '音乐', '体育', '英语', '心理学', '特殊教育'];

// 学历枚举
const educationLevels = ['high_school', 'college', 'bachelor', 'master', 'phd'];

/**
 * 创建教师验证规则
 */
export const createTeacherSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': '教师姓名不能为空',
      'string.min': '教师姓名至少需要2个字符',
      'string.max': '教师姓名不能超过50个字符',
      'any.required': '教师姓名是必填字段'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '邮箱格式不正确',
      'any.required': '邮箱是必填字段'
    }),

  phone: Joi.string()
    .pattern(/^1[3-9]\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': '手机号格式不正确',
      'any.required': '手机号是必填字段'
    }),

  birthDate: Joi.date()
    .max('now')
    .required()
    .messages({
      'date.max': '出生日期不能晚于今天',
      'any.required': '出生日期是必填字段'
    }),

  gender: Joi.string()
    .valid('male', 'female')
    .required()
    .messages({
      'any.only': '性别必须是男性或女性',
      'any.required': '性别是必填字段'
    }),

  address: Joi.string()
    .min(5)
    .max(200)
    .required()
    .messages({
      'string.empty': '地址不能为空',
      'string.min': '地址至少需要5个字符',
      'string.max': '地址不能超过200个字符',
      'any.required': '地址是必填字段'
    }),

  position: Joi.string()
    .valid(...teacherPositions)
    .required()
    .messages({
      'any.only': `职位必须是以下之一: ${teacherPositions.join(', ')}`,
      'any.required': '职位是必填字段'
    }),

  educationLevel: Joi.string()
    .valid(...educationLevels)
    .required()
    .messages({
      'any.only': `学历必须是以下之一: ${educationLevels.join(', ')}`,
      'any.required': '学历是必填字段'
    }),

  major: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': '专业不能为空',
      'string.min': '专业至少需要2个字符',
      'string.max': '专业不能超过50个字符',
      'any.required': '专业是必填字段'
    }),

  teachingExperience: Joi.number()
    .integer()
    .min(0)
    .max(50)
    .required()
    .messages({
      'number.base': '教学经验必须是数字',
      'number.integer': '教学经验必须是整数',
      'number.min': '教学经验不能为负数',
      'number.max': '教学经验不能超过50年',
      'any.required': '教学经验是必填字段'
    }),

  specialties: Joi.array()
    .items(Joi.string().valid(...teacherSpecialties))
    .min(1)
    .max(5)
    .required()
    .messages({
      'array.min': '至少需要选择一个专业特长',
      'array.max': '专业特长不能超过5个',
      'any.only': `专业特长必须是以下之一: ${teacherSpecialties.join(', ')}`,
      'any.required': '专业特长是必填字段'
    }),

  certifications: Joi.array()
    .items(Joi.string().min(2).max(100))
    .max(10)
    .default([])
    .messages({
      'array.max': '证书不能超过10个',
      'string.min': '证书名称至少需要2个字符',
      'string.max': '证书名称不能超过100个字符'
    }),

  hireDate: Joi.date()
    .max('now')
    .required()
    .messages({
      'date.max': '入职日期不能晚于今天',
      'any.required': '入职日期是必填字段'
    }),

  salary: Joi.number()
    .min(0)
    .max(100000)
    .optional()
    .messages({
      'number.base': '薪资必须是数字',
      'number.min': '薪资不能为负数',
      'number.max': '薪资不能超过100000元'
    }),

  emergencyContact: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': '紧急联系人不能为空',
      'string.min': '紧急联系人至少需要2个字符',
      'string.max': '紧急联系人不能超过50个字符',
      'any.required': '紧急联系人是必填字段'
    }),

  emergencyPhone: Joi.string()
    .pattern(/^1[3-9]\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': '紧急联系电话格式不正确',
      'any.required': '紧急联系电话是必填字段'
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
    .valid(...teacherStatuses)
    .default('active')
    .messages({
      'any.only': `教师状态必须是以下之一: ${teacherStatuses.join(', ')}`
    }),

  notes: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': '备注不能超过1000个字符'
    })
}).custom((value, helpers) => {
  // 验证年龄合理性
  const age = new Date().getFullYear() - new Date(value.birthDate).getFullYear();
  if (age < 18 || age > 65) {
    return helpers.error('custom.ageRange', { message: 'Teacher age must be between 18 and 65' });
  }

  // 验证入职日期不能早于出生日期
  if (new Date(value.hireDate) < new Date(value.birthDate)) {
    return helpers.error('custom.hireDateInvalid', { message: '入职日期不能早于出生日期' });
  }

  // 验证教学经验与年龄的合理性
  const workingAge = age - 18; // 假设18岁开始工作
  if (value.teachingExperience > workingAge) {
    return helpers.error('custom.experienceInvalid', { message: '教学经验不能超过工作年限' });
  }

  return value;
});

/**
 * 更新教师验证规则
 */
export const updateTeacherSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
  birthDate: Joi.date().max('now').optional(),
  gender: Joi.string().valid('male', 'female').optional(),
  address: Joi.string().min(5).max(200).optional(),
  position: Joi.string().valid(...teacherPositions).optional(),
  educationLevel: Joi.string().valid(...educationLevels).optional(),
  major: Joi.string().min(2).max(50).optional(),
  teachingExperience: Joi.number().integer().min(0).max(50).optional(),
  specialties: Joi.array().items(Joi.string().valid(...teacherSpecialties)).min(1).max(5).optional(),
  certifications: Joi.array().items(Joi.string().min(2).max(100)).max(10).optional(),
  hireDate: Joi.date().max('now').optional(),
  salary: Joi.number().min(0).max(100000).optional(),
  emergencyContact: Joi.string().min(2).max(50).optional(),
  emergencyPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
  status: Joi.string().valid(...teacherStatuses).optional(),
  notes: Joi.string().max(1000).optional()
});

/**
 * 教师查询验证规则
 */
export const teacherQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid(...teacherStatuses).optional(),
  position: Joi.string().valid(...teacherPositions).optional(),
  specialty: Joi.string().valid(...teacherSpecialties).optional(),
  search: Joi.string().max(100).optional(),
  sortBy: Joi.string().valid('name', 'hireDate', 'teachingExperience', 'salary', 'createdAt').default('hireDate'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  kindergartenId: Joi.number().integer().positive().optional()
});

/**
 * 教师班级分配验证规则
 */
export const teacherClassAssignmentSchema = Joi.object({
  teacherId: Joi.number().integer().positive().required(),
  classId: Joi.number().integer().positive().required(),
  role: Joi.string().valid('head_teacher', 'assistant_teacher').required(),
  startDate: Joi.date().min('now').required(),
  endDate: Joi.date().min(Joi.ref('startDate')).optional()
});

/**
 * 教师评价验证规则
 */
export const teacherEvaluationSchema = Joi.object({
  teacherId: Joi.number().integer().positive().required(),
  evaluatorId: Joi.number().integer().positive().required(),
  evaluationType: Joi.string().valid('monthly', 'quarterly', 'annual', 'special').required(),
  teachingSkill: Joi.number().integer().min(1).max(5).required(),
  classManagement: Joi.number().integer().min(1).max(5).required(),
  communication: Joi.number().integer().min(1).max(5).required(),
  professionalism: Joi.number().integer().min(1).max(5).required(),
  overallRating: Joi.number().integer().min(1).max(5).required(),
  comments: Joi.string().max(1000).optional(),
  recommendations: Joi.string().max(500).optional(),
  evaluationDate: Joi.date().max('now').required()
});

// 验证函数
export const validateCreateTeacher = (data: any) => {
  return createTeacherSchema.validate(data, { abortEarly: false });
};

export const validateUpdateTeacher = (data: any) => {
  return updateTeacherSchema.validate(data, { abortEarly: false });
};

export const validateTeacherQuery = (data: any) => {
  return teacherQuerySchema.validate(data, { abortEarly: false });
};

export const validateTeacherClassAssignment = (data: any) => {
  return teacherClassAssignmentSchema.validate(data, { abortEarly: false });
};

export const validateTeacherEvaluation = (data: any) => {
  return teacherEvaluationSchema.validate(data, { abortEarly: false });
};
