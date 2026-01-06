/**
 * 财务管理系统数据验证工具
 * 提供严格的API响应验证功能，确保财务数据的准确性和完整性
 */

/**
 * 验证必填字段是否存在
 */
export function validateRequiredFields(data: any, requiredFields: string[]): {
  valid: boolean;
  missing: string[]
} {
  const missing: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, missing: requiredFields };
  }

  requiredFields.forEach(field => {
    if (!(field in data) || data[field] === undefined || data[field] === null) {
      missing.push(field);
    }
  });

  return { valid: missing.length === 0, missing };
}

/**
 * 验证字段类型是否正确
 */
export function validateFieldTypes(data: any, fieldTypes: Record<string, string>): {
  valid: boolean;
  errors: string[]
} {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Data is not an object'] };
  }

  Object.entries(fieldTypes).forEach(([field, expectedType]) => {
    if (field in data && data[field] !== undefined) {
      const actualType = typeof data[field];

      // 特殊处理数组类型
      if (expectedType === 'array' && !Array.isArray(data[field])) {
        errors.push(`${field}: expected array, got ${actualType}`);
      }
      // 特殊处理日期类型
      else if (expectedType === 'date' && !(data[field] instanceof Date) && !isValidDateString(data[field])) {
        errors.push(`${field}: expected date, got ${actualType}`);
      }
      // 基本类型检查
      else if (expectedType !== 'array' && expectedType !== 'date' && actualType !== expectedType) {
        errors.push(`${field}: expected ${expectedType}, got ${actualType}`);
      }
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * 验证枚举值是否有效
 */
export function validateEnumValue(value: any, validValues: any[]): boolean {
  return validValues.includes(value);
}

/**
 * 验证日期格式是否正确
 */
export function validateDateFormat(dateString: string): boolean {
  if (!dateString) return false;

  // ISO 8601 格式检查
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  if (isoRegex.test(dateString)) return true;

  // 简单日期格式检查 (YYYY-MM-DD)
  const simpleRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (simpleRegex.test(dateString)) return true;

  // 尝试解析日期
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * 验证金额格式是否正确
 */
export function validateAmount(amount: any): boolean {
  if (typeof amount !== 'number') return false;
  return amount >= 0 && Number.isFinite(amount);
}

/**
 * 验证百分比是否在有效范围内
 */
export function validatePercentage(percentage: any): boolean {
  if (typeof percentage !== 'number') return false;
  return percentage >= 0 && percentage <= 100;
}

/**
 * 验证财务状态值
 */
export function validateFinanceStatus(status: any): boolean {
  const validStatuses = ['pending', 'partial', 'paid', 'overdue', 'cancelled', 'active', 'inactive'];
  return validateEnumValue(status, validStatuses);
}

/**
 * 验证支付方式
 */
export function validatePaymentMethod(method: any): boolean {
  const validMethods = ['cash', 'bank_transfer', 'wechat', 'alipay', 'credit_card'];
  return validateEnumValue(method, validMethods);
}

/**
 * 验证费用类别
 */
export function validateFeeCategory(category: any): boolean {
  const validCategories = ['tuition', 'meal', 'activity', 'material', 'other'];
  return validateEnumValue(category, validCategories);
}

/**
 * 验证报表类型
 */
export function validateReportType(type: any): boolean {
  const validTypes = ['income-expense', 'profit', 'cashflow', 'balance', 'budget', 'custom', 'revenue', 'expense', 'payment', 'overdue', 'refund', 'comprehensive'];
  return validateEnumValue(type, validTypes);
}

/**
 * 验证缴费单状态
 */
export function validatePaymentStatus(status: any): boolean {
  const validStatuses = ['pending', 'partial', 'paid', 'overdue', 'cancelled'];
  return validateEnumValue(status, validStatuses);
}

/**
 * 验证记录状态
 */
export function validateRecordStatus(status: any): boolean {
  const validStatuses = ['pending', 'success', 'failed', 'refunded'];
  return validateEnumValue(status, validStatuses);
}

/**
 * 验证列表响应结构
 */
export function validateListResponse(response: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!response || typeof response !== 'object') {
    return { valid: false, errors: ['Response is not an object'] };
  }

  // 验证基础结构
  if (response.success !== true) {
    errors.push('success field is missing or not true');
  }

  if (!response.data || typeof response.data !== 'object') {
    errors.push('data field is missing or not an object');
    return { valid: false, errors };
  }

  // 验证分页字段
  const paginationFields = ['items', 'total', 'page', 'pageSize'];
  const paginationValidation = validateRequiredFields(response.data, paginationFields);
  if (!paginationValidation.valid) {
    errors.push(`Missing pagination fields: ${paginationValidation.missing.join(', ')}`);
  }

  // 验证字段类型
  const typeValidation = validateFieldTypes(response.data, {
    items: 'array',
    total: 'number',
    page: 'number',
    pageSize: 'number'
  });
  if (!typeValidation.valid) {
    errors.push(...typeValidation.errors);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证API响应结构
 */
export function validateAPIResponse(response: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!response || typeof response !== 'object') {
    return { valid: false, errors: ['Response is not an object'] };
  }

  if (response.success !== true) {
    errors.push('success field is missing or not true');
  }

  if (!('data' in response)) {
    errors.push('data field is missing');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证财务概览数据
 */
export function validateFinanceOverview(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 验证必填字段
  const requiredFields = [
    'monthlyRevenue', 'revenueGrowth', 'pendingAmount', 'pendingCount',
    'collectionRate', 'paidCount', 'totalCount', 'overdueAmount', 'overdueCount'
  ];

  const fieldValidation = validateRequiredFields(data, requiredFields);
  if (!fieldValidation.valid) {
    errors.push(`Missing required fields: ${fieldValidation.missing.join(', ')}`);
  }

  // 验证字段类型
  const typeValidation = validateFieldTypes(data, {
    monthlyRevenue: 'number',
    revenueGrowth: 'number',
    pendingAmount: 'number',
    pendingCount: 'number',
    collectionRate: 'number',
    paidCount: 'number',
    totalCount: 'number',
    overdueAmount: 'number',
    overdueCount: 'number'
  });

  if (!typeValidation.valid) {
    errors.push(...typeValidation.errors);
  }

  // 验证数值范围
  if (validateAmount(data.monthlyRevenue)) {
    if (data.monthlyRevenue < 0) errors.push('monthlyRevenue cannot be negative');
  }

  if (validateAmount(data.pendingAmount)) {
    if (data.pendingAmount < 0) errors.push('pendingAmount cannot be negative');
  }

  if (validateAmount(data.overdueAmount)) {
    if (data.overdueAmount < 0) errors.push('overdueAmount cannot be negative');
  }

  if (validatePercentage(data.collectionRate)) {
    if (data.collectionRate < 0 || data.collectionRate > 100) {
      errors.push('collectionRate must be between 0 and 100');
    }
  }

  // 验证计数字段
  ['pendingCount', 'paidCount', 'totalCount', 'overdueCount'].forEach(field => {
    if (typeof data[field] === 'number' && data[field] < 0) {
      errors.push(`${field} cannot be negative`);
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * 验证收费项目数据
 */
export function validateFeeItem(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const requiredFields = ['id', 'name', 'category', 'amount', 'period', 'isRequired', 'status'];
  const fieldValidation = validateRequiredFields(data, requiredFields);
  if (!fieldValidation.valid) {
    errors.push(`Missing required fields: ${fieldValidation.missing.join(', ')}`);
  }

  const typeValidation = validateFieldTypes(data, {
    id: 'string',
    name: 'string',
    category: 'string',
    amount: 'number',
    period: 'string',
    isRequired: 'boolean',
    status: 'string'
  });

  if (!typeValidation.valid) {
    errors.push(...typeValidation.errors);
  }

  if (!validateAmount(data.amount)) {
    errors.push('amount must be a valid positive number');
  }

  if (!validateFeeCategory(data.category)) {
    errors.push('category must be a valid fee category');
  }

  if (!validateFinanceStatus(data.status)) {
    errors.push('status must be a valid finance status');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证缴费单数据
 */
export function validatePaymentBill(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const requiredFields = ['id', 'billNo', 'studentName', 'items', 'totalAmount', 'status'];
  const fieldValidation = validateRequiredFields(data, requiredFields);
  if (!fieldValidation.valid) {
    errors.push(`Missing required fields: ${fieldValidation.missing.join(', ')}`);
  }

  const typeValidation = validateFieldTypes(data, {
    id: 'string',
    billNo: 'string',
    studentName: 'string',
    items: 'array',
    totalAmount: 'number',
    status: 'string'
  });

  if (!typeValidation.valid) {
    errors.push(...typeValidation.errors);
  }

  if (!validateAmount(data.totalAmount)) {
    errors.push('totalAmount must be a valid positive number');
  }

  if (!validatePaymentStatus(data.status)) {
    errors.push('status must be a valid payment status');
  }

  if (Array.isArray(data.items) && data.items.length > 0) {
    data.items.forEach((item: any, index: number) => {
      const itemValidation = validateRequiredFields(item, ['feeId', 'feeName', 'amount']);
      if (!itemValidation.valid) {
        errors.push(`Item ${index}: missing required fields`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证缴费记录数据
 */
export function validatePaymentRecord(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const requiredFields = ['id', 'billId', 'paymentAmount', 'paymentDate', 'paymentMethod', 'status'];
  const fieldValidation = validateRequiredFields(data, requiredFields);
  if (!fieldValidation.valid) {
    errors.push(`Missing required fields: ${fieldValidation.missing.join(', ')}`);
  }

  const typeValidation = validateFieldTypes(data, {
    id: 'string',
    billId: 'string',
    paymentAmount: 'number',
    paymentDate: 'string',
    paymentMethod: 'string',
    status: 'string'
  });

  if (!typeValidation.valid) {
    errors.push(...typeValidation.errors);
  }

  if (!validateAmount(data.paymentAmount)) {
    errors.push('paymentAmount must be a valid positive number');
  }

  if (!validateDateFormat(data.paymentDate)) {
    errors.push('paymentDate must be a valid date format');
  }

  if (!validatePaymentMethod(data.paymentMethod)) {
    errors.push('paymentMethod must be a valid payment method');
  }

  if (!validateRecordStatus(data.status)) {
    errors.push('status must be a valid record status');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 验证财务报表数据
 */
export function validateFinancialReport(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const requiredFields = ['id', 'name', 'type', 'period', 'generatedAt'];
  const fieldValidation = validateRequiredFields(data, requiredFields);
  if (!fieldValidation.valid) {
    errors.push(`Missing required fields: ${fieldValidation.missing.join(', ')}`);
  }

  const typeValidation = validateFieldTypes(data, {
    id: 'string',
    name: 'string',
    type: 'string',
    period: 'object',
    generatedAt: 'string'
  });

  if (!typeValidation.valid) {
    errors.push(...typeValidation.errors);
  }

  if (!validateReportType(data.type)) {
    errors.push('type must be a valid report type');
  }

  if (data.period && typeof data.period === 'object') {
    const periodValidation = validateRequiredFields(data.period, ['start', 'end']);
    if (!periodValidation.valid) {
      errors.push('Period missing start or end date');
    } else {
      if (!validateDateFormat(data.period.start)) {
        errors.push('Period start date is invalid');
      }
      if (!validateDateFormat(data.period.end)) {
        errors.push('Period end date is invalid');
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// 辅助函数：检查日期字符串是否有效
function isValidDateString(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}