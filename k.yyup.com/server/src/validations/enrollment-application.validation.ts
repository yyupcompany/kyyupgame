const Joi = require('joi');
import { ApplicationStatus, DocumentType } from '../types/enrollment-application';

/**
 * 创建报名申请验证模式
 */
export const createEnrollmentApplicationSchema = Joi.object({
  kindergartenId: Joi.number().integer().positive().required().messages({
    'number.base': '幼儿园ID必须是数字',
    'number.integer': '幼儿园ID必须是整数',
    'number.positive': '幼儿园ID必须是正数',
    'any.required': '幼儿园ID是必填项'
  }),
  childName: Joi.string().trim().min(2).max(50).required().messages({
    'string.base': '孩子姓名必须是字符串',
    'string.empty': '孩子姓名不能为空',
    'string.min': '孩子姓名至少需要{#limit}个字符',
    'string.max': '孩子姓名不能超过{#limit}个字符',
    'any.required': '孩子姓名是必填项'
  }),
  childGender: Joi.string().valid('male', 'female').required().messages({
    'string.base': '孩子性别必须是字符串',
    'any.only': '孩子性别必须是male或female',
    'any.required': '孩子性别是必填项'
  }),
  childBirthday: Joi.date().iso().less('now').required().messages({
    'date.base': '孩子生日必须是有效的日期',
    'date.format': '孩子生日必须是ISO格式的日期',
    'date.less': '孩子生日必须是过去的日期',
    'any.required': '孩子生日是必填项'
  }),
  parentName: Joi.string().trim().min(2).max(50).required().messages({
    'string.base': '家长姓名必须是字符串',
    'string.empty': '家长姓名不能为空',
    'string.min': '家长姓名至少需要{#limit}个字符',
    'string.max': '家长姓名不能超过{#limit}个字符',
    'any.required': '家长姓名是必填项'
  }),
  parentPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.base': '家长电话必须是字符串',
    'string.pattern.base': '家长电话必须是有效的手机号码',
    'any.required': '家长电话是必填项'
  }),
  parentRelation: Joi.string().valid('father', 'mother', 'grandfather', 'grandmother', 'other').required().messages({
    'string.base': '与孩子关系必须是字符串',
    'any.only': '与孩子关系必须是有效的选项',
    'any.required': '与孩子关系是必填项'
  }),
  address: Joi.string().trim().min(5).max(200).required().messages({
    'string.base': '家庭住址必须是字符串',
    'string.empty': '家庭住址不能为空',
    'string.min': '家庭住址至少需要{#limit}个字符',
    'string.max': '家庭住址不能超过{#limit}个字符',
    'any.required': '家庭住址是必填项'
  }),
  enrollmentYear: Joi.number().integer().min(new Date().getFullYear()).max(new Date().getFullYear() + 3).required().messages({
    'number.base': '入学年份必须是数字',
    'number.integer': '入学年份必须是整数',
    'number.min': '入学年份不能早于当前年份',
    'number.max': '入学年份不能超过未来3年',
    'any.required': '入学年份是必填项'
  }),
  enrollmentSeason: Joi.string().valid('spring', 'autumn').required().messages({
    'string.base': '入学季节必须是字符串',
    'any.only': '入学季节必须是spring或autumn',
    'any.required': '入学季节是必填项'
  }),
  gradeLevel: Joi.string().valid('nursery', 'lower_kindergarten', 'middle_kindergarten', 'upper_kindergarten').required().messages({
    'string.base': '年级必须是字符串',
    'any.only': '年级必须是有效的选项',
    'any.required': '年级是必填项'
  }),
  specialNeeds: Joi.string().trim().max(500).allow('', null).messages({
    'string.base': '特殊需求必须是字符串',
    'string.max': '特殊需求不能超过{#limit}个字符'
  }),
  emergencyContact: Joi.string().trim().min(2).max(50).allow('', null).messages({
    'string.base': '紧急联系人必须是字符串',
    'string.min': '紧急联系人至少需要{#limit}个字符',
    'string.max': '紧急联系人不能超过{#limit}个字符'
  }),
  emergencyPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).allow('', null).messages({
    'string.base': '紧急联系电话必须是字符串',
    'string.pattern.base': '紧急联系电话必须是有效的手机号码'
  }),
  previousSchool: Joi.string().trim().max(100).allow('', null).messages({
    'string.base': '之前就读学校必须是字符串',
    'string.max': '之前就读学校不能超过{#limit}个字符'
  }),
  referralSource: Joi.string().trim().max(100).allow('', null).messages({
    'string.base': '推荐来源必须是字符串',
    'string.max': '推荐来源不能超过{#limit}个字符'
  }),
  consultationId: Joi.number().integer().positive().allow(null).messages({
    'number.base': '关联的咨询ID必须是数字',
    'number.integer': '关联的咨询ID必须是整数',
    'number.positive': '关联的咨询ID必须是正数'
  }),
  remark: Joi.string().trim().max(500).allow('', null).messages({
    'string.base': '备注必须是字符串',
    'string.max': '备注不能超过{#limit}个字符'
  })
});

/**
 * 更新报名申请验证模式
 */
export const updateEnrollmentApplicationSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': '申请ID必须是数字',
    'number.integer': '申请ID必须是整数',
    'number.positive': '申请ID必须是正数',
    'any.required': '申请ID是必填项'
  }),
  kindergartenId: Joi.number().integer().positive().messages({
    'number.base': '幼儿园ID必须是数字',
    'number.integer': '幼儿园ID必须是整数',
    'number.positive': '幼儿园ID必须是正数'
  }),
  childName: Joi.string().trim().min(2).max(50).messages({
    'string.base': '孩子姓名必须是字符串',
    'string.empty': '孩子姓名不能为空',
    'string.min': '孩子姓名至少需要{#limit}个字符',
    'string.max': '孩子姓名不能超过{#limit}个字符'
  }),
  childGender: Joi.string().valid('male', 'female').messages({
    'string.base': '孩子性别必须是字符串',
    'any.only': '孩子性别必须是male或female'
  }),
  childBirthday: Joi.date().iso().less('now').messages({
    'date.base': '孩子生日必须是有效的日期',
    'date.format': '孩子生日必须是ISO格式的日期',
    'date.less': '孩子生日必须是过去的日期'
  }),
  parentName: Joi.string().trim().min(2).max(50).messages({
    'string.base': '家长姓名必须是字符串',
    'string.empty': '家长姓名不能为空',
    'string.min': '家长姓名至少需要{#limit}个字符',
    'string.max': '家长姓名不能超过{#limit}个字符'
  }),
  parentPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).messages({
    'string.base': '家长电话必须是字符串',
    'string.pattern.base': '家长电话必须是有效的手机号码'
  }),
  parentRelation: Joi.string().valid('father', 'mother', 'grandfather', 'grandmother', 'other').messages({
    'string.base': '与孩子关系必须是字符串',
    'any.only': '与孩子关系必须是有效的选项'
  }),
  address: Joi.string().trim().min(5).max(200).messages({
    'string.base': '家庭住址必须是字符串',
    'string.empty': '家庭住址不能为空',
    'string.min': '家庭住址至少需要{#limit}个字符',
    'string.max': '家庭住址不能超过{#limit}个字符'
  }),
  enrollmentYear: Joi.number().integer().min(new Date().getFullYear()).max(new Date().getFullYear() + 3).messages({
    'number.base': '入学年份必须是数字',
    'number.integer': '入学年份必须是整数',
    'number.min': '入学年份不能早于当前年份',
    'number.max': '入学年份不能超过未来3年'
  }),
  enrollmentSeason: Joi.string().valid('spring', 'autumn').messages({
    'string.base': '入学季节必须是字符串',
    'any.only': '入学季节必须是spring或autumn'
  }),
  gradeLevel: Joi.string().valid('nursery', 'lower_kindergarten', 'middle_kindergarten', 'upper_kindergarten').messages({
    'string.base': '年级必须是字符串',
    'any.only': '年级必须是有效的选项'
  }),
  specialNeeds: Joi.string().trim().max(500).allow('', null).messages({
    'string.base': '特殊需求必须是字符串',
    'string.max': '特殊需求不能超过{#limit}个字符'
  }),
  emergencyContact: Joi.string().trim().min(2).max(50).allow('', null).messages({
    'string.base': '紧急联系人必须是字符串',
    'string.min': '紧急联系人至少需要{#limit}个字符',
    'string.max': '紧急联系人不能超过{#limit}个字符'
  }),
  emergencyPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).allow('', null).messages({
    'string.base': '紧急联系电话必须是字符串',
    'string.pattern.base': '紧急联系电话必须是有效的手机号码'
  }),
  previousSchool: Joi.string().trim().max(100).allow('', null).messages({
    'string.base': '之前就读学校必须是字符串',
    'string.max': '之前就读学校不能超过{#limit}个字符'
  }),
  referralSource: Joi.string().trim().max(100).allow('', null).messages({
    'string.base': '推荐来源必须是字符串',
    'string.max': '推荐来源不能超过{#limit}个字符'
  }),
  consultationId: Joi.number().integer().positive().allow(null).messages({
    'number.base': '关联的咨询ID必须是数字',
    'number.integer': '关联的咨询ID必须是整数',
    'number.positive': '关联的咨询ID必须是正数'
  }),
  remark: Joi.string().trim().max(500).allow('', null).messages({
    'string.base': '备注必须是字符串',
    'string.max': '备注不能超过{#limit}个字符'
  })
});

/**
 * 报名申请筛选参数验证模式
 */
export const enrollmentApplicationFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': '页码必须是数字',
    'number.integer': '页码必须是整数',
    'number.min': '页码不能小于{#limit}'
  }),
  pageSize: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': '每页条数必须是数字',
    'number.integer': '每页条数必须是整数',
    'number.min': '每页条数不能小于{#limit}',
    'number.max': '每页条数不能大于{#limit}'
  }),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'childName', 'parentName', 'enrollmentYear').default('createdAt').messages({
    'string.base': '排序字段必须是字符串',
    'any.only': '排序字段必须是有效的选项'
  }),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc').messages({
    'string.base': '排序方式必须是字符串',
    'any.only': '排序方式必须是asc或desc'
  }),
  kindergartenId: Joi.number().integer().positive().messages({
    'number.base': '幼儿园ID必须是数字',
    'number.integer': '幼儿园ID必须是整数',
    'number.positive': '幼儿园ID必须是正数'
  }),
  status: Joi.string().valid(...Object.values(ApplicationStatus)).messages({
    'string.base': '申请状态必须是字符串',
    'any.only': '申请状态必须是有效的选项'
  }),
  childName: Joi.string().trim().max(50).messages({
    'string.base': '孩子姓名必须是字符串',
    'string.max': '孩子姓名不能超过{#limit}个字符'
  }),
  parentName: Joi.string().trim().max(50).messages({
    'string.base': '家长姓名必须是字符串',
    'string.max': '家长姓名不能超过{#limit}个字符'
  }),
  parentPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).messages({
    'string.base': '家长电话必须是字符串',
    'string.pattern.base': '家长电话必须是有效的手机号码'
  }),
  enrollmentYear: Joi.number().integer().min(new Date().getFullYear() - 5).max(new Date().getFullYear() + 3).messages({
    'number.base': '入学年份必须是数字',
    'number.integer': '入学年份必须是整数',
    'number.min': '入学年份不能早于{#limit}年',
    'number.max': '入学年份不能超过{#limit}年'
  }),
  enrollmentSeason: Joi.string().valid('spring', 'autumn').messages({
    'string.base': '入学季节必须是字符串',
    'any.only': '入学季节必须是spring或autumn'
  }),
  gradeLevel: Joi.string().valid('nursery', 'lower_kindergarten', 'middle_kindergarten', 'upper_kindergarten').messages({
    'string.base': '年级必须是字符串',
    'any.only': '年级必须是有效的选项'
  }),
  startDate: Joi.date().iso().messages({
    'date.base': '开始日期必须是有效的日期',
    'date.format': '开始日期必须是ISO格式的日期'
  }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).messages({
    'date.base': '结束日期必须是有效的日期',
    'date.format': '结束日期必须是ISO格式的日期',
    'date.min': '结束日期不能早于开始日期'
  }),
  keyword: Joi.string().trim().max(100).messages({
    'string.base': '关键词必须是字符串',
    'string.max': '关键词不能超过{#limit}个字符'
  })
});

/**
 * 审核报名申请验证模式
 */
export const reviewEnrollmentApplicationSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': '申请ID必须是数字',
    'number.integer': '申请ID必须是整数',
    'number.positive': '申请ID必须是正数',
    'any.required': '申请ID是必填项'
  }),
  status: Joi.string().valid(ApplicationStatus.APPROVED, ApplicationStatus.REJECTED, ApplicationStatus.REVIEWING).required().messages({
    'string.base': '申请状态必须是字符串',
    'any.only': '申请状态必须是有效的选项',
    'any.required': '申请状态是必填项'
  }),
  reviewComment: Joi.string().trim().max(500).allow('', null).messages({
    'string.base': '审核意见必须是字符串',
    'string.max': '审核意见不能超过{#limit}个字符'
  }),
  approvalDate: Joi.date().iso().allow(null).messages({
    'date.base': '审批日期必须是有效的日期',
    'date.format': '审批日期必须是ISO格式的日期'
  }),
  rejectionReason: Joi.string().trim().max(500).allow('', null)
    .when('status', {
      is: ApplicationStatus.REJECTED,
      then: Joi.string().trim().min(5).max(500).required().messages({
        'string.base': '拒绝原因必须是字符串',
        'string.empty': '拒绝原因不能为空',
        'string.min': '拒绝原因至少需要{#limit}个字符',
        'string.max': '拒绝原因不能超过{#limit}个字符',
        'any.required': '拒绝状态下拒绝原因是必填项'
      })
    }).messages({
      'string.base': '拒绝原因必须是字符串',
      'string.max': '拒绝原因不能超过{#limit}个字符'
    })
});

/**
 * 上传申请材料验证模式
 */
export const uploadApplicationDocumentSchema = Joi.object({
  applicationId: Joi.number().integer().positive().required().messages({
    'number.base': '申请ID必须是数字',
    'number.integer': '申请ID必须是整数',
    'number.positive': '申请ID必须是正数',
    'any.required': '申请ID是必填项'
  }),
  documentType: Joi.string().valid(...Object.values(DocumentType)).required().messages({
    'string.base': '文档类型必须是字符串',
    'any.only': '文档类型必须是有效的选项',
    'any.required': '文档类型是必填项'
  }),
  documentName: Joi.string().trim().min(1).max(100).required().messages({
    'string.base': '文档名称必须是字符串',
    'string.empty': '文档名称不能为空',
    'string.min': '文档名称至少需要{#limit}个字符',
    'string.max': '文档名称不能超过{#limit}个字符',
    'any.required': '文档名称是必填项'
  }),
  filePath: Joi.string().trim().min(1).required().messages({
    'string.base': '文件路径必须是字符串',
    'string.empty': '文件路径不能为空',
    'string.min': '文件路径至少需要{#limit}个字符',
    'any.required': '文件路径是必填项'
  }),
  fileSize: Joi.number().integer().positive().max(10 * 1024 * 1024).required().messages({
    'number.base': '文件大小必须是数字',
    'number.integer': '文件大小必须是整数',
    'number.positive': '文件大小必须是正数',
    'number.max': '文件大小不能超过10MB',
    'any.required': '文件大小是必填项'
  }),
  mimeType: Joi.string().trim().min(1).required().messages({
    'string.base': 'MIME类型必须是字符串',
    'string.empty': 'MIME类型不能为空',
    'string.min': 'MIME类型至少需要{#limit}个字符',
    'any.required': 'MIME类型是必填项'
  }),
  description: Joi.string().trim().max(200).allow('', null).messages({
    'string.base': '文档描述必须是字符串',
    'string.max': '文档描述不能超过{#limit}个字符'
  })
}); 