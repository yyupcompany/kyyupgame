/**
 * API验证工具
 * 用于后端API测试的严格数据验证
 */

/**
 * 验证API响应结构
 * @param response API响应
 * @returns 验证结果
 */
export function validateApiResponse(response: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!response || typeof response !== 'object') {
    return { valid: false, errors: ['Response is not an object'] };
  }

  // 检查必需的响应字段
  const requiredFields = ['success', 'code'];
  for (const field of requiredFields) {
    if (!(field in response)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // 验证字段类型
  if (response.success !== undefined && typeof response.success !== 'boolean') {
    errors.push('success field must be boolean');
  }

  if (response.code !== undefined && typeof response.code !== 'number') {
    errors.push('code field must be number');
  }

  if (response.message !== undefined && typeof response.message !== 'string') {
    errors.push('message field must be string');
  }

  // 如果响应成功，必须有data字段
  if (response.success === true && !('data' in response)) {
    errors.push('Success response must have data field');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证分页响应结构
 * @param response API响应
 * @returns 验证结果
 */
export function validatePaginatedResponse(response: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 首先验证基本响应结构
  const basicValidation = validateApiResponse(response);
  if (!basicValidation.valid) {
    return basicValidation;
  }

  if (response.success && response.data) {
    const data = response.data;
    
    // 检查分页必需字段
    const requiredFields = ['items', 'total', 'page', 'pageSize'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        errors.push(`Missing pagination field: ${field}`);
      }
    }

    // 验证分页字段类型
    if (data.items !== undefined && !Array.isArray(data.items)) {
      errors.push('items field must be an array');
    }

    if (data.total !== undefined && (typeof data.total !== 'number' || data.total < 0)) {
      errors.push('total field must be a non-negative number');
    }

    if (data.page !== undefined && (typeof data.page !== 'number' || data.page < 1)) {
      errors.push('page field must be a positive number');
    }

    if (data.pageSize !== undefined && (typeof data.pageSize !== 'number' || data.pageSize < 1)) {
      errors.push('pageSize field must be a positive number');
    }

    // 验证分页逻辑一致性
    if (data.items && data.total !== undefined && data.page !== undefined && data.pageSize !== undefined) {
      const maxPage = Math.ceil(data.total / data.pageSize);
      if (data.page > maxPage && maxPage > 0) {
        errors.push(`Page ${data.page} exceeds maximum pages ${maxPage}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证用户数据结构
 * @param userData 用户数据
 * @returns 验证结果
 */
export function validateUserData(userData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!userData || typeof userData !== 'object') {
    return { valid: false, errors: ['User data is not an object'] };
  }

  // 验证必需字段
  const requiredFields = ['id', 'username', 'name', 'email', 'role'];
  for (const field of requiredFields) {
    if (!userData[field]) {
      errors.push(`Missing required user field: ${field}`);
    }
  }

  // 验证字段类型
  if (userData.id !== undefined && typeof userData.id !== 'string') {
    errors.push('User id must be a string');
  }

  if (userData.username !== undefined) {
    if (typeof userData.username !== 'string') {
      errors.push('Username must be a string');
    } else if (!/^[a-zA-Z0-9_-]{3,20}$/.test(userData.username)) {
      errors.push('Username format is invalid');
    }
  }

  if (userData.name !== undefined && typeof userData.name !== 'string') {
    errors.push('User name must be a string');
  }

  if (userData.email !== undefined) {
    if (typeof userData.email !== 'string') {
      errors.push('Email must be a string');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Email format is invalid');
    }
  }

  if (userData.phone !== undefined) {
    if (typeof userData.phone !== 'string') {
      errors.push('Phone must be a string');
    } else if (!/^1[3-9]\d{9}$/.test(userData.phone)) {
      errors.push('Phone format is invalid');
    }
  }

  if (userData.role !== undefined) {
    const validRoles = ['ADMIN', 'TEACHER', 'PARENT', 'PRINCIPAL', 'STAFF'];
    if (!validRoles.includes(userData.role)) {
      errors.push(`Invalid role: ${userData.role}`);
    }
  }

  if (userData.status !== undefined) {
    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
    if (!validStatuses.includes(userData.status)) {
      errors.push(`Invalid status: ${userData.status}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证学生数据结构
 * @param studentData 学生数据
 * @returns 验证结果
 */
export function validateStudentData(studentData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!studentData || typeof studentData !== 'object') {
    return { valid: false, errors: ['Student data is not an object'] };
  }

  // 验证必需字段
  const requiredFields = ['id', 'name', 'studentId'];
  for (const field of requiredFields) {
    if (!studentData[field]) {
      errors.push(`Missing required student field: ${field}`);
    }
  }

  // 验证字段类型
  if (studentData.name !== undefined && typeof studentData.name !== 'string') {
    errors.push('Student name must be a string');
  }

  if (studentData.studentId !== undefined) {
    if (typeof studentData.studentId !== 'string') {
      errors.push('Student ID must be a string');
    } else if (!/^ST\d{3,6}$/.test(studentData.studentId)) {
      errors.push('Student ID format is invalid');
    }
  }

  if (studentData.gender !== undefined) {
    const validGenders = ['MALE', 'FEMALE', 'OTHER'];
    if (!validGenders.includes(studentData.gender)) {
      errors.push(`Invalid gender: ${studentData.gender}`);
    }
  }

  if (studentData.birthDate !== undefined) {
    if (typeof studentData.birthDate !== 'string') {
      errors.push('Birth date must be a string');
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(studentData.birthDate)) {
      errors.push('Birth date format must be YYYY-MM-DD');
    }
  }

  if (studentData.age !== undefined) {
    if (typeof studentData.age !== 'number' || studentData.age < 0 || studentData.age > 20) {
      errors.push('Age must be a number between 0 and 20');
    }
  }

  if (studentData.status !== undefined) {
    const validStatuses = ['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED'];
    if (!validStatuses.includes(studentData.status)) {
      errors.push(`Invalid status: ${studentData.status}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证班级数据结构
 * @param classData 班级数据
 * @returns 验证结果
 */
export function validateClassData(classData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!classData || typeof classData !== 'object') {
    return { valid: false, errors: ['Class data is not an object'] };
  }

  // 验证必需字段
  const requiredFields = ['id', 'name', 'grade'];
  for (const field of requiredFields) {
    if (!classData[field]) {
      errors.push(`Missing required class field: ${field}`);
    }
  }

  // 验证字段类型
  if (classData.name !== undefined && typeof classData.name !== 'string') {
    errors.push('Class name must be a string');
  }

  if (classData.grade !== undefined) {
    const validGrades = ['小班', '中班', '大班', '学前班'];
    if (!validGrades.includes(classData.grade)) {
      errors.push(`Invalid grade: ${classData.grade}`);
    }
  }

  if (classData.capacity !== undefined) {
    if (typeof classData.capacity !== 'number' || classData.capacity < 1 || classData.capacity > 50) {
      errors.push('Capacity must be a number between 1 and 50');
    }
  }

  if (classData.currentCount !== undefined) {
    if (typeof classData.currentCount !== 'number' || classData.currentCount < 0) {
      errors.push('Current count must be a non-negative number');
    }
  }

  // 验证容量和当前人数的逻辑关系
  if (classData.capacity !== undefined && classData.currentCount !== undefined) {
    if (classData.currentCount > classData.capacity) {
      errors.push('Current count cannot exceed capacity');
    }
  }

  if (classData.status !== undefined) {
    const validStatuses = ['ACTIVE', 'INACTIVE', 'FULL'];
    if (!validStatuses.includes(classData.status)) {
      errors.push(`Invalid status: ${classData.status}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证统计数据结构
 * @param statsData 统计数据
 * @returns 验证结果
 */
export function validateStatsData(statsData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!statsData || typeof statsData !== 'object') {
    return { valid: false, errors: ['Stats data is not an object'] };
  }

  // 验证常见统计字段的类型和范围
  const numericFields = [
    'totalStudents', 'totalTeachers', 'totalClasses', 'totalParents',
    'enrollmentRate', 'attendanceRate', 'graduationRate', 'averageScore'
  ];

  for (const field of numericFields) {
    if (statsData[field] !== undefined) {
      if (typeof statsData[field] !== 'number' || statsData[field] < 0) {
        errors.push(`${field} must be a non-negative number`);
      }

      // 百分比字段验证
      if (field.includes('Rate') && statsData[field] > 100) {
        errors.push(`${field} cannot exceed 100`);
      }

      // 分数字段验证
      if (field === 'averageScore' && statsData[field] > 100) {
        errors.push(`${field} cannot exceed 100`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证错误响应结构
 * @param errorResponse 错误响应
 * @returns 验证结果
 */
export function validateErrorResponse(errorResponse: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!errorResponse || typeof errorResponse !== 'object') {
    return { valid: false, errors: ['Error response is not an object'] };
  }

  // 错误响应必须有success: false
  if (errorResponse.success !== false) {
    errors.push('Error response must have success: false');
  }

  // 必须有错误码和消息
  if (!errorResponse.code) {
    errors.push('Error response must have code field');
  }

  if (!errorResponse.message) {
    errors.push('Error response must have message field');
  }

  // 验证错误码范围
  if (errorResponse.code !== undefined) {
    if (typeof errorResponse.code !== 'number') {
      errors.push('Error code must be a number');
    } else if (errorResponse.code < 400 || errorResponse.code > 599) {
      errors.push('Error code should be between 400 and 599');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 创建完整的API验证报告
 * @param response API响应
 * @param validator 验证函数
 * @returns 验证报告
 */
export function createApiValidationReport(
  response: any,
  validator: (response: any) => { valid: boolean; errors: string[] }
): {
  valid: boolean;
  errors: string[];
  summary: string;
} {
  const validation = validator(response);
  
  return {
    valid: validation.valid,
    errors: validation.errors,
    summary: validation.valid 
      ? 'API response validation passed' 
      : `API response validation failed: ${validation.errors.join(', ')}`
  };
}

/**
 * 验证HTTP状态码
 * @param statusCode HTTP状态码
 * @param expectedStatusCodes 期望的状态码列表
 * @returns 验证结果
 */
export function validateHttpStatusCode(
  statusCode: number,
  expectedStatusCodes: number[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!expectedStatusCodes.includes(statusCode)) {
    errors.push(`Unexpected status code: ${statusCode}, expected one of: ${expectedStatusCodes.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证响应时间
 * @param responseTime 响应时间（毫秒）
 * @param maxAcceptableTime 最大可接受时间（毫秒）
 * @returns 验证结果
 */
export function validateResponseTime(
  responseTime: number,
  maxAcceptableTime: number = 3000
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof responseTime !== 'number' || responseTime < 0) {
    errors.push('Response time must be a non-negative number');
  } else if (responseTime > maxAcceptableTime) {
    errors.push(`Response time ${responseTime}ms exceeds acceptable limit ${maxAcceptableTime}ms`);
  }

  return { valid: errors.length === 0, errors };
}