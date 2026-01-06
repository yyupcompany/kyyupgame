import { ApiResponse } from '@/api/endpoints'

/**
 * 招生管理API严格验证工具集
 * 遵循项目强制执行的API测试严格验证规则
 */

// 严格验证配置
const STRICT_VALIDATION_CONFIG = {
  // 必填字段验证
  REQUIRED_FIELDS: {
    enrollmentApplication: ['id', 'studentName', 'parentName', 'parentPhone', 'status', 'createdAt'],
    enrollmentDetail: ['id', 'studentName', 'studentAge', 'parentName', 'parentPhone', 'status'],
    enrollmentPlan: ['id', 'name', 'startDate', 'endDate', 'targetCount', 'status'],
    interview: ['id', 'applicationId', 'studentName', 'interviewDate', 'interviewerId', 'status'],
    interviewEvaluation: ['id', 'criteria', 'overallScore', 'recommendAdmission']
  },

  // 字段类型验证
  FIELD_TYPES: {
    enrollmentApplication: {
      id: 'string',
      studentName: 'string',
      studentAge: ['number', 'null'],
      gender: 'string',
      parentName: 'string',
      parentPhone: 'string',
      parentEmail: ['string', 'null'],
      status: 'string',
      applicationDate: 'string',
      reviewDate: ['string', 'null'],
      reviewerId: ['string', 'null'],
      notes: ['string', 'null'],
      createdAt: 'string',
      updatedAt: 'string'
    },
    enrollmentDetail: {
      id: 'string',
      applicationId: ['string', 'null'],
      studentName: 'string',
      studentGender: 'string',
      studentAge: 'number',
      studentBirthDate: 'string',
      parentName: 'string',
      parentPhone: 'string',
      className: ['string', 'null'],
      enrollmentDate: ['string', 'null'],
      applicationDate: 'string',
      source: 'string',
      status: 'string',
      enrollmentType: 'string'
    },
    enrollmentPlan: {
      id: 'string',
      name: 'string',
      description: ['string', 'null'],
      startDate: 'string',
      endDate: 'string',
      targetCount: 'number',
      currentApplications: 'number',
      status: 'string',
      kindergartenId: 'number',
      year: 'number',
      term: 'string',
      createdAt: 'string',
      updatedAt: 'string'
    },
    interview: {
      id: 'string',
      applicationId: 'string',
      studentName: 'string',
      studentAge: 'number',
      parentName: 'string',
      parentPhone: 'string',
      interviewDate: 'string',
      interviewTime: 'string',
      interviewRoom: 'string',
      interviewerId: 'string',
      interviewerName: 'string',
      status: 'string',
      evaluationScore: ['number', 'null'],
      createdAt: 'string',
      updatedAt: 'string'
    },
    interviewEvaluation: {
      id: 'string',
      criteria: 'array',
      overallScore: 'number',
      overallComments: 'string',
      recommendAdmission: 'boolean',
      suggestedClass: ['string', 'null'],
      evaluatedAt: 'string',
      evaluatedBy: 'string'
    }
  },

  // 枚举值验证
  ENUM_VALUES: {
    status: {
      application: ['pending', 'reviewing', 'approved', 'rejected', 'cancelled', 'enrolled'],
      enrollment: ['pending', 'reviewing', 'confirmed', 'enrolled', 'cancelled'],
      plan: ['draft', 'active', 'completed', 'cancelled'],
      interview: ['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled']
    },
    gender: ['male', 'female'],
    relationship: ['father', 'mother', 'grandfather', 'grandmother', 'maternal_grandfather', 'maternal_grandmother', 'other'],
    applicationSource: ['web', 'phone', 'onsite', 'referral', 'other'],
    enrollmentType: ['normal', 'transfer', 'special']
  },

  // 数值范围验证
  NUMERIC_RANGES: {
    age: { min: 2, max: 10 },
    phone: { min: 10000000000, max: 19999999999 },
    score: { min: 0, max: 100 },
    targetCount: { min: 1, max: 1000 },
    year: { min: 2020, max: 2030 },
    weight: { min: 0, max: 1 }
  },

  // 字符串格式验证
  STRING_PATTERNS: {
    phone: /^1[3-9]\d{9}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    idCard: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
    date: /^\d{4}-\d{2}-\d{2}$/,
    dateTime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/
  }
}

/**
 * 验证接口响应结构
 */
export function validateApiResponseStructure(response: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!response) {
    errors.push('响应不能为空')
    return { valid: false, errors }
  }

  // 验证基础结构
  if (typeof response !== 'object') {
    errors.push('响应必须是对象类型')
    return { valid: false, errors }
  }

  // 验证success字段
  if (typeof response.success !== 'boolean') {
    errors.push('success字段必须是布尔类型')
  }

  // 验证message字段
  if (response.message !== undefined && typeof response.message !== 'string') {
    errors.push('message字段必须是字符串类型')
  }

  // 验证code字段（如果存在）
  if (response.code !== undefined && typeof response.code !== 'number') {
    errors.push('code字段必须是数字类型')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * 验证必填字段
 */
export function validateRequiredFields(
  data: any,
  requiredFields: string[],
  context: string = '数据'
): { valid: boolean; errors: string[]; missingFields: string[] } {
  const errors: string[] = []
  const missingFields: string[] = []

  if (!data || typeof data !== 'object') {
    errors.push(`${context}必须是有效对象`)
    return { valid: false, errors, missingFields }
  }

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field)
      errors.push(`${context}缺少必填字段: ${field}`)
    }
  }

  return { valid: missingFields.length === 0, errors, missingFields }
}

/**
 * 验证字段类型
 */
export function validateFieldTypes(
  data: any,
  expectedTypes: Record<string, string | string[]>
): { valid: boolean; errors: string[]; typeErrors: Record<string, string> } {
  const errors: string[] = []
  const typeErrors: Record<string, string> = {}

  if (!data || typeof data !== 'object') {
    errors.push('数据必须是有效对象')
    return { valid: false, errors, typeErrors }
  }

  for (const [field, expectedType] of Object.entries(expectedTypes)) {
    const actualType = typeof data[field]

    if (data[field] === null || data[field] === undefined) {
      if (Array.isArray(expectedType) && !expectedType.includes('null') && !expectedType.includes('undefined')) {
        typeErrors[field] = `期望类型: ${expectedType.join('或')}, 实际: null/undefined`
        errors.push(`字段 ${field} 不能为空`)
      }
      continue
    }

    const isValidType = Array.isArray(expectedType)
      ? expectedType.includes(actualType)
      : actualType === expectedType

    if (!isValidType) {
      typeErrors[field] = `期望类型: ${Array.isArray(expectedType) ? expectedType.join('或') : expectedType}, 实际: ${actualType}`
      errors.push(`字段 ${field} 类型错误`)
    }
  }

  return { valid: errors.length === 0, errors, typeErrors }
}

/**
 * 验证枚举值
 */
export function validateEnumValues(
  data: any,
  enumName: keyof typeof STRICT_VALIDATION_CONFIG.ENUM_VALUES,
  context: string = '枚举值'
): { valid: boolean; errors: string[]; invalidValues: string[] } {
  const errors: string[] = []
  const invalidValues: string[] = []

  const validValues = STRICT_VALIDATION_CONFIG.ENUM_VALUES[enumName]
  if (!validValues) {
    errors.push(`未知的枚举类型: ${enumName}`)
    return { valid: false, errors, invalidValues }
  }

  if (typeof data === 'string') {
    if (!validValues.includes(data)) {
      invalidValues.push(data)
      errors.push(`${context}值 "${data}" 不在有效枚举值范围内: ${validValues.join(', ')}`)
    }
  } else if (Array.isArray(data)) {
    for (const value of data) {
      if (typeof value === 'string' && !validValues.includes(value)) {
        invalidValues.push(value)
        errors.push(`${context}数组包含无效值: ${value}`)
      }
    }
  }

  return { valid: invalidValues.length === 0, errors, invalidValues }
}

/**
 * 验证数值范围
 */
export function validateNumericRanges(
  data: any,
  fieldName: keyof typeof STRICT_VALIDATION_CONFIG.NUMERIC_RANGES,
  context: string = '数值'
): { valid: boolean; errors: string[]; invalidValues: number[] } {
  const errors: string[] = []
  const invalidValues: number[] = []

  const range = STRICT_VALIDATION_CONFIG.NUMERIC_RANGES[fieldName]
  if (!range) {
    errors.push(`未知的数值范围类型: ${fieldName}`)
    return { valid: false, errors, invalidValues }
  }

  const values = Array.isArray(data) ? data : [data]

  for (const value of values) {
    if (typeof value === 'number') {
      if (value < range.min || value > range.max) {
        invalidValues.push(value)
        errors.push(`${context}值 ${value} 超出有效范围 [${range.min}, ${range.max}]`)
      }
    }
  }

  return { valid: invalidValues.length === 0, errors, invalidValues }
}

/**
 * 验证字符串格式
 */
export function validateStringPatterns(
  data: string,
  patternName: keyof typeof STRICT_VALIDATION_CONFIG.STRING_PATTERNS,
  context: string = '字符串'
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  const pattern = STRICT_VALIDATION_CONFIG.STRING_PATTERNS[patternName]
  if (!pattern) {
    errors.push(`未知的字符串格式类型: ${patternName}`)
    return { valid: false, errors }
  }

  if (typeof data !== 'string') {
    errors.push(`${context}必须是字符串类型`)
    return { valid: false, errors }
  }

  if (!pattern.test(data)) {
    errors.push(`${context}格式不符合要求: ${patternName}`)
  }

  return { valid: errors.length === 0, errors }
}

/**
 * 验证分页结构
 */
export function validatePaginationStructure(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    errors.push('分页数据必须是对象')
    return { valid: false, errors }
  }

  // 验证items字段
  if (!Array.isArray(data.items)) {
    errors.push('items字段必须是数组')
  }

  // 验证total字段
  if (typeof data.total !== 'number' || data.total < 0) {
    errors.push('total字段必须是非负整数')
  }

  // 验证page字段
  if (typeof data.page !== 'number' || data.page < 1) {
    errors.push('page字段必须是大于0的整数')
  }

  // 验证pageSize字段
  if (typeof data.pageSize !== 'number' || data.pageSize < 1) {
    errors.push('pageSize字段必须是大于0的整数')
  }

  // 验证逻辑一致性
  if (data.items && data.total !== undefined && data.page && data.pageSize) {
    const maxPossibleItems = data.page * data.pageSize
    if (data.items.length > Math.min(data.pageSize, data.total)) {
      errors.push('items数量超出预期范围')
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * 验证招生申请数据
 */
export function validateEnrollmentApplication(data: any): { valid: boolean; errors: string[] } {
  const allErrors: string[] = []

  // 1. 验证API响应结构
  const apiValidation = validateApiResponseStructure(data)
  if (!apiValidation.valid) {
    allErrors.push(...apiValidation.errors)
  }

  if (!data.data) {
    return { valid: false, errors: allErrors }
  }

  // 2. 验证必填字段
  const requiredValidation = validateRequiredFields(
    data.data,
    STRICT_VALIDATION_CONFIG.REQUIRED_FIELDS.enrollmentApplication,
    '招生申请数据'
  )
  if (!requiredValidation.valid) {
    allErrors.push(...requiredValidation.errors)
  }

  // 3. 验证字段类型
  const typeValidation = validateFieldTypes(
    data.data,
    STRICT_VALIDATION_CONFIG.FIELD_TYPES.enrollmentApplication
  )
  if (!typeValidation.valid) {
    allErrors.push(...typeValidation.errors)
  }

  // 4. 验证枚举值
  if (data.data.status) {
    const statusValidation = validateEnumValues(
      data.data.status,
      'status',
      '申请状态'
    )
    if (!statusValidation.valid) {
      allErrors.push(...statusValidation.errors)
    }
  }

  if (data.data.gender) {
    const genderValidation = validateEnumValues(
      data.data.gender,
      'gender',
      '性别'
    )
    if (!genderValidation.valid) {
      allErrors.push(...genderValidation.errors)
    }
  }

  if (data.data.applicationSource) {
    const sourceValidation = validateEnumValues(
      data.data.applicationSource,
      'applicationSource',
      '申请来源'
    )
    if (!sourceValidation.valid) {
      allErrors.push(...sourceValidation.errors)
    }
  }

  // 5. 验证数值范围
  if (data.data.studentAge !== null && data.data.studentAge !== undefined) {
    const ageValidation = validateNumericRanges(
      data.data.studentAge,
      'age',
      '年龄'
    )
    if (!ageValidation.valid) {
      allErrors.push(...ageValidation.errors)
    }
  }

  // 6. 验证字符串格式
  if (data.data.parentPhone) {
    const phoneValidation = validateStringPatterns(
      data.data.parentPhone,
      'phone',
      '联系电话'
    )
    if (!phoneValidation.valid) {
      allErrors.push(...phoneValidation.errors)
    }
  }

  if (data.data.parentEmail) {
    const emailValidation = validateStringPatterns(
      data.data.parentEmail,
      'email',
      '邮箱地址'
    )
    if (!emailValidation.valid) {
      allErrors.push(...emailValidation.errors)
    }
  }

  // 7. 验证日期格式
  if (data.data.applicationDate) {
    const dateValidation = validateStringPatterns(
      data.data.applicationDate,
      'date',
      '申请日期'
    )
    if (!dateValidation.valid) {
      allErrors.push(...dateValidation.errors)
    }
  }

  return { valid: allErrors.length === 0, errors: allErrors }
}

/**
 * 验证招生详情数据
 */
export function validateEnrollmentDetail(data: any): { valid: boolean; errors: string[] } {
  const allErrors: string[] = []

  // 1. 验证API响应结构
  const apiValidation = validateApiResponseStructure(data)
  if (!apiValidation.valid) {
    allErrors.push(...apiValidation.errors)
  }

  if (!data.data) {
    return { valid: false, errors: allErrors }
  }

  // 2. 验证必填字段
  const requiredValidation = validateRequiredFields(
    data.data,
    STRICT_VALIDATION_CONFIG.REQUIRED_FIELDS.enrollmentDetail,
    '招生详情数据'
  )
  if (!requiredValidation.valid) {
    allErrors.push(...requiredValidation.errors)
  }

  // 3. 验证字段类型
  const typeValidation = validateFieldTypes(
    data.data,
    STRICT_VALIDATION_CONFIG.FIELD_TYPES.enrollmentDetail
  )
  if (!typeValidation.valid) {
    allErrors.push(...typeValidation.errors)
  }

  // 4. 验证枚举值
  if (data.data.status) {
    const statusValidation = validateEnumValues(
      data.data.status,
      'status',
      '入学状态'
    )
    if (!statusValidation.valid) {
      allErrors.push(...statusValidation.errors)
    }
  }

  if (data.data.studentGender) {
    const genderValidation = validateEnumValues(
      data.data.studentGender,
      'gender',
      '学生性别'
    )
    if (!genderValidation.valid) {
      allErrors.push(...genderValidation.errors)
    }
  }

  if (data.data.source) {
    const sourceValidation = validateEnumValues(
      data.data.source,
      'applicationSource',
      '招生来源'
    )
    if (!sourceValidation.valid) {
      allErrors.push(...sourceValidation.errors)
    }
  }

  // 5. 验证数值范围
  if (data.data.studentAge) {
    const ageValidation = validateNumericRanges(
      data.data.studentAge,
      'age',
      '学生年龄'
    )
    if (!ageValidation.valid) {
      allErrors.push(...ageValidation.errors)
    }
  }

  return { valid: allErrors.length === 0, errors: allErrors }
}

/**
 * 验证招生计划数据
 */
export function validateEnrollmentPlan(data: any): { valid: boolean; errors: string[] } {
  const allErrors: string[] = []

  // 1. 验证API响应结构
  const apiValidation = validateApiResponseStructure(data)
  if (!apiValidation.valid) {
    allErrors.push(...apiValidation.errors)
  }

  if (!data.data) {
    return { valid: false, errors: allErrors }
  }

  // 2. 验证必填字段
  const requiredValidation = validateRequiredFields(
    data.data,
    STRICT_VALIDATION_CONFIG.REQUIRED_FIELDS.enrollmentPlan,
    '招生计划数据'
  )
  if (!requiredValidation.valid) {
    allErrors.push(...requiredValidation.errors)
  }

  // 3. 验证字段类型
  const typeValidation = validateFieldTypes(
    data.data,
    STRICT_VALIDATION_CONFIG.FIELD_TYPES.enrollmentPlan
  )
  if (!typeValidation.valid) {
    allErrors.push(...typeValidation.errors)
  }

  // 4. 验证枚举值
  if (data.data.status) {
    const statusValidation = validateEnumValues(
      data.data.status,
      'status',
      '计划状态'
    )
    if (!statusValidation.valid) {
      allErrors.push(...statusValidation.errors)
    }
  }

  // 5. 验证数值范围
  if (data.data.targetCount) {
    const targetValidation = validateNumericRanges(
      data.data.targetCount,
      'targetCount',
      '目标人数'
    )
    if (!targetValidation.valid) {
      allErrors.push(...targetValidation.errors)
    }
  }

  if (data.data.year) {
    const yearValidation = validateNumericRanges(
      data.data.year,
      'year',
      '年份'
    )
    if (!yearValidation.valid) {
      allErrors.push(...yearValidation.errors)
    }
  }

  // 6. 验证日期逻辑
  if (data.data.startDate && data.data.endDate) {
    const start = new Date(data.data.startDate)
    const end = new Date(data.data.endDate)
    if (start >= end) {
      allErrors.push('开始日期必须早于结束日期')
    }
  }

  return { valid: allErrors.length === 0, errors: allErrors }
}

/**
 * 验证面试数据
 */
export function validateInterview(data: any): { valid: boolean; errors: string[] } {
  const allErrors: string[] = []

  // 1. 验证API响应结构
  const apiValidation = validateApiResponseStructure(data)
  if (!apiValidation.valid) {
    allErrors.push(...apiValidation.errors)
  }

  if (!data.data) {
    return { valid: false, errors: allErrors }
  }

  // 2. 验证必填字段
  const requiredValidation = validateRequiredFields(
    data.data,
    STRICT_VALIDATION_CONFIG.REQUIRED_FIELDS.interview,
    '面试数据'
  )
  if (!requiredValidation.valid) {
    allErrors.push(...requiredValidation.errors)
  }

  // 3. 验证字段类型
  const typeValidation = validateFieldTypes(
    data.data,
    STRICT_VALIDATION_CONFIG.FIELD_TYPES.interview
  )
  if (!typeValidation.valid) {
    allErrors.push(...typeValidation.errors)
  }

  // 4. 验证枚举值
  if (data.data.status) {
    const statusValidation = validateEnumValues(
      data.data.status,
      'status',
      '面试状态'
    )
    if (!statusValidation.valid) {
      allErrors.push(...statusValidation.errors)
    }
  }

  // 5. 验证数值范围
  if (data.data.studentAge) {
    const ageValidation = validateNumericRanges(
      data.data.studentAge,
      'age',
      '学生年龄'
    )
    if (!ageValidation.valid) {
      allErrors.push(...ageValidation.errors)
    }
  }

  if (data.data.evaluationScore !== null && data.data.evaluationScore !== undefined) {
    const scoreValidation = validateNumericRanges(
      data.data.evaluationScore,
      'score',
      '面试分数'
    )
    if (!scoreValidation.valid) {
      allErrors.push(...scoreValidation.errors)
    }
  }

  return { valid: allErrors.length === 0, errors: allErrors }
}

/**
 * 验证面试评估数据
 */
export function validateInterviewEvaluation(data: any): { valid: boolean; errors: string[] } {
  const allErrors: string[] = []

  // 1. 验证API响应结构
  const apiValidation = validateApiResponseStructure(data)
  if (!apiValidation.valid) {
    allErrors.push(...apiValidation.errors)
  }

  if (!data.data) {
    return { valid: false, errors: allErrors }
  }

  // 2. 验证必填字段
  const requiredValidation = validateRequiredFields(
    data.data,
    STRICT_VALIDATION_CONFIG.REQUIRED_FIELDS.interviewEvaluation,
    '面试评估数据'
  )
  if (!requiredValidation.valid) {
    allErrors.push(...requiredValidation.errors)
  }

  // 3. 验证字段类型
  const typeValidation = validateFieldTypes(
    data.data,
    STRICT_VALIDATION_CONFIG.FIELD_TYPES.interviewEvaluation
  )
  if (!typeValidation.valid) {
    allErrors.push(...typeValidation.errors)
  }

  // 4. 验证评估标准
  if (data.data.criteria && Array.isArray(data.data.criteria)) {
    let totalWeight = 0
    for (const criterion of data.data.criteria) {
      if (criterion.score !== null && criterion.score !== undefined) {
        const scoreValidation = validateNumericRanges(
          criterion.score,
          'score',
          `评估标准分数: ${criterion.name || '未知'}`
        )
        if (!scoreValidation.valid) {
          allErrors.push(...scoreValidation.errors)
        }
      }

      if (typeof criterion.weight === 'number') {
        totalWeight += criterion.weight
        const weightValidation = validateNumericRanges(
          criterion.weight,
          'weight',
          `评估标准权重: ${criterion.name || '未知'}`
        )
        if (!weightValidation.valid) {
          allErrors.push(...weightValidation.errors)
        }
      }
    }

    // 验证权重总和
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      allErrors.push(`评估标准权重总和应为1.0，实际为: ${totalWeight}`)
    }
  }

  // 5. 验证数值范围
  if (data.data.overallScore !== null && data.data.overallScore !== undefined) {
    const scoreValidation = validateNumericRanges(
      data.data.overallScore,
      'score',
      '综合分数'
    )
    if (!scoreValidation.valid) {
      allErrors.push(...scoreValidation.errors)
    }
  }

  return { valid: allErrors.length === 0, errors: allErrors }
}

/**
 * 验证统计范围数据
 */
export function validateStatisticalRanges(data: any): { valid: boolean; errors: string[] } {
  const allErrors: string[] = []

  if (!data || typeof data !== 'object') {
    allErrors.push('统计数据必须是有效对象')
    return { valid: false, errors: allErrors }
  }

  // 验证百分比字段
  const percentageFields = ['passRate', 'conversionRate', 'noShowRate', 'approvalRate']
  for (const field of percentageFields) {
    if (data[field] !== undefined && data[field] !== null) {
      if (typeof data[field] !== 'number' || data[field] < 0 || data[field] > 1) {
        allErrors.push(`${field} 必须是0-1之间的数值`)
      }
    }
  }

  // 验证平均分字段
  const scoreFields = ['averageScore', 'totalAverageScore']
  for (const field of scoreFields) {
    if (data[field] !== undefined && data[field] !== null) {
      if (typeof data[field] !== 'number' || data[field] < 0 || data[field] > 100) {
        allErrors.push(`${field} 必须是0-100之间的数值`)
      }
    }
  }

  // 验证逻辑一致性
  if (data.total && data.completed && data.cancelled) {
    const processedTotal = data.completed + data.cancelled
    if (processedTotal > data.total) {
      allErrors.push('已完成和已取消数量之和不能超过总数')
    }
  }

  return { valid: allErrors.length === 0, errors: allErrors }
}

/**
 * 综合严格验证入口
 * 根据数据类型自动选择合适的验证方法
 */
export function strictValidate(data: any, dataType: string): { valid: boolean; errors: string[] } {
  switch (dataType) {
    case 'enrollmentApplication':
      return validateEnrollmentApplication(data)
    case 'enrollmentDetail':
      return validateEnrollmentDetail(data)
    case 'enrollmentPlan':
      return validateEnrollmentPlan(data)
    case 'interview':
      return validateInterview(data)
    case 'interviewEvaluation':
      return validateInterviewEvaluation(data)
    case 'statistics':
      return validateStatisticalRanges(data)
    default:
      return { valid: false, errors: [`未知的数据类型: ${dataType}`] }
  }
}