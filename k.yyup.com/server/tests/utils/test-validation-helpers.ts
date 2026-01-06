/**
 * 后端测试验证辅助工具
 * 用于严格验证标准的后端API测试
 */

/**
 * 班级数据接口
 */
export interface ClassData {
  id?: number;
  name: string;
  code?: string;
  kindergartenId: number;
  capacity: number;
  ageRange?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  currentStudents?: number;
  maxCapacity?: number;
}

/**
 * API响应数据接口
 */
export interface ResponseData {
  success: boolean;
  data?: any;
  message?: string;
  code?: number;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    items: any[];
  };
}

/**
 * 验证班级数据结构
 */
export function validateClassData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('班级数据必须是一个对象');
    return { valid: false, errors };
  }

  // 验证必填字段
  const requiredFields = ['name', 'kindergartenId', 'capacity'];
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      errors.push(`缺少必填字段: ${field}`);
    }
  }

  // 验证字段类型
  if (data.name !== undefined && typeof data.name !== 'string') {
    errors.push('班级名称必须是字符串');
  }

  if (data.kindergartenId !== undefined && typeof data.kindergartenId !== 'number') {
    errors.push('幼儿园ID必须是数字');
  }

  if (data.capacity !== undefined) {
    if (typeof data.capacity !== 'number') {
      errors.push('班级容量必须是数字');
    } else if (data.capacity <= 0 || data.capacity > 50) {
      errors.push('班级容量必须在1-50之间');
    }
  }

  // 验证字段长度
  if (data.name && (data.name.length < 1 || data.name.length > 50)) {
    errors.push('班级名称长度必须在1-50字符之间');
  }

  if (data.code && (data.code.length < 1 || data.code.length > 20)) {
    errors.push('班级编号长度必须在1-20字符之间');
  }

  // 验证状态枚举
  if (data.status) {
    const validStatuses = ['active', 'inactive', 'archived', 'suspended'];
    if (!validStatuses.includes(data.status)) {
      errors.push(`状态必须是以下值之一: ${validStatuses.join(', ')}`);
    }
  }

  // 验证年龄范围格式
  if (data.ageRange) {
    const ageRangePattern = /^\d+-\d+岁?$/;
    if (!ageRangePattern.test(data.ageRange)) {
      errors.push('年龄范围格式应为"X-Y岁"');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证API响应数据结构
 */
export function validateApiResponseData(data: any, expectedType: 'object' | 'array' | 'number' | 'string' = 'object'): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data === undefined || data === null) {
    errors.push('响应数据不能为空');
    return { valid: false, errors };
  }

  switch (expectedType) {
    case 'object':
      if (typeof data !== 'object' || Array.isArray(data)) {
        errors.push('响应数据必须是对象');
      }
      break;
    case 'array':
      if (!Array.isArray(data)) {
        errors.push('响应数据必须是数组');
      }
      break;
    case 'number':
      if (typeof data !== 'number') {
        errors.push('响应数据必须是数字');
      }
      break;
    case 'string':
      if (typeof data !== 'string') {
        errors.push('响应数据必须是字符串');
      }
      break;
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证必填字段
 */
export function validateRequiredFields<T = any>(
  data: any,
  requiredFields: (keyof T)[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, missing: requiredFields as string[] };
  }

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(String(field));
    }
  }

  return { valid: missing.length === 0, missing };
}

/**
 * 验证字段类型
 */
export function validateFieldTypes<T = any>(
  data: any,
  fieldTypes: Partial<Record<keyof T, string>>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('数据不是对象');
    return { valid: false, errors };
  }

  for (const [field, expectedType] of Object.entries(fieldTypes)) {
    const actualValue = data[field];

    if (actualValue === undefined || actualValue === null) {
      continue; // 跳过空值
    }

    let actualType = typeof actualValue;

    if (expectedType === 'array' && !Array.isArray(actualValue)) {
      errors.push(`${field}: 期望数组，实际${actualType}`);
    } else if (expectedType === 'object' && (actualType !== 'object' || Array.isArray(actualValue))) {
      errors.push(`${field}: 期望对象，实际${actualType}`);
    } else if (actualType !== expectedType && expectedType !== 'array' && expectedType !== 'object') {
      errors.push(`${field}: 期望${expectedType}，实际${actualType}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证分页数据
 */
export function validatePaginationData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('分页数据必须是对象');
    return { valid: false, errors };
  }

  // 验证分页结构
  const requiredFields = ['items', 'total', 'page', 'pageSize'];
  const fieldsValidation = validateRequiredFields(data, requiredFields);
  if (!fieldsValidation.valid) {
    errors.push(`缺少分页字段: ${fieldsValidation.missing.join(', ')}`);
  }

  // 验证字段类型
  const typeValidation = validateFieldTypes(data, {
    items: 'array',
    total: 'number',
    page: 'number',
    pageSize: 'number'
  });
  if (!typeValidation.valid) {
    errors.push(`类型错误: ${typeValidation.errors.join(', ')}`);
  }

  // 验证数值范围
  if (data.total !== undefined && data.total < 0) {
    errors.push('总数必须大于等于0');
  }

  if (data.page !== undefined && data.page < 1) {
    errors.push('页码必须大于等于1');
  }

  if (data.pageSize !== undefined && data.pageSize < 1) {
    errors.push('每页数量必须大于等于1');
  }

  // 验证items数组中的项目
  if (Array.isArray(data.items) && data.items.length > 0) {
    data.items.forEach((item: any, index: number) => {
      const itemValidation = validateClassData(item);
      if (!itemValidation.valid) {
        errors.push(`第${index + 1}项数据验证失败: ${itemValidation.errors.join(', ')}`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证错误响应
 */
export function validateErrorResponse(
  mockApiResponse: any,
  expectedMessage: string,
  expectedCode: string,
  expectedStatus: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 验证ApiResponse.error被调用
  expect(mockApiResponse.error).toHaveBeenCalledWith(
    expect.any(Object), // res对象
    expectedMessage,
    expectedCode,
    expectedStatus
  );

  return { valid: errors.length === 0, errors };
}

/**
 * 验证成功响应
 */
export function validateSuccessResponse(
  mockApiResponse: any,
  expectedData?: any,
  expectedMessage?: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 验证ApiResponse.success被调用
  if (expectedMessage) {
    expect(mockApiResponse.success).toHaveBeenCalledWith(
      expect.any(Object), // res对象
      expectedData,
      expectedMessage
    );
  } else {
    expect(mockApiResponse.success).toHaveBeenCalledWith(
      expect.any(Object), // res对象
      expectedData
    );
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证数据库操作
 */
export function validateDatabaseOperation(
  mockModel: any,
  operation: 'create' | 'update' | 'destroy' | 'findAll' | 'findByPk',
  expectedData?: any,
  expectedOptions?: any
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  switch (operation) {
    case 'create':
      if (expectedData) {
        expect(mockModel.create).toHaveBeenCalledWith(
          expect.objectContaining(expectedData),
          expectedOptions || {}
        );
      }
      break;
    case 'update':
      if (expectedData && expectedOptions) {
        expect(mockModel.update).toHaveBeenCalledWith(
          expect.objectContaining(expectedData),
          expectedOptions
        );
      }
      break;
    case 'destroy':
      if (expectedOptions) {
        expect(mockModel.destroy).toHaveBeenCalledWith(expectedOptions);
      }
      break;
    case 'findAll':
      if (expectedOptions) {
        expect(mockModel.findAll).toHaveBeenCalledWith(expectedOptions);
      }
      break;
    case 'findByPk':
      if (expectedData && expectedOptions) {
        expect(mockModel.findByPk).toHaveBeenCalledWith(expectedData, expectedOptions);
      }
      break;
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证事务操作
 */
export function validateTransactionOperation(
  mockSequelize: any,
  mockTransaction: any,
  shouldCommit: boolean = true,
  shouldRollback: boolean = false
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 验证事务被创建
  expect(mockSequelize.transaction).toHaveBeenCalled();

  // 验证事务提交或回滚
  if (shouldCommit) {
    expect(mockTransaction.commit).toHaveBeenCalled();
  }

  if (shouldRollback) {
    expect(mockTransaction.rollback).toHaveBeenCalled();
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证输入数据边界条件
 */
export function validateInputBoundaries(
  testData: any,
  fieldName: string,
  boundaries: { min?: number; max?: number; minLength?: number; maxLength?: number }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const value = testData[fieldName];

  if (value === undefined) {
    return { valid: true, errors };
  }

  if (typeof value === 'number') {
    if (boundaries.min !== undefined && value < boundaries.min) {
      errors.push(`${fieldName}: 值${value}小于最小值${boundaries.min}`);
    }

    if (boundaries.max !== undefined && value > boundaries.max) {
      errors.push(`${fieldName}: 值${value}大于最大值${boundaries.max}`);
    }
  }

  if (typeof value === 'string') {
    if (boundaries.minLength !== undefined && value.length < boundaries.minLength) {
      errors.push(`${fieldName}: 长度${value.length}小于最小长度${boundaries.minLength}`);
    }

    if (boundaries.maxLength !== undefined && value.length > boundaries.maxLength) {
      errors.push(`${fieldName}: 长度${value.length}大于最大长度${boundaries.maxLength}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 生成测试数据
 */
export function generateValidClassData(overrides: Partial<ClassData> = {}): ClassData {
  return {
    name: '测试班级',
    kindergartenId: 1,
    capacity: 30,
    ageRange: '5-6岁',
    description: '测试用班级',
    status: 'active',
    ...overrides
  };
}

export function generateInvalidClassData(): Partial<ClassData>[] {
  return [
    { name: '', kindergartenId: 1, capacity: 30 }, // 空名称
    { name: 'A'.repeat(51), kindergartenId: 1, capacity: 30 }, // 名称过长
    { name: '测试班级', kindergartenId: 0, capacity: 30 }, // 无效幼儿园ID
    { name: '测试班级', kindergartenId: 1, capacity: 0 }, // 无效容量
    { name: '测试班级', kindergartenId: 1, capacity: 100 }, // 容量过大
  ];
}