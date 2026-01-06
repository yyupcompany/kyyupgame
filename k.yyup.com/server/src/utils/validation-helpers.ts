/**
 * 输入验证辅助函数
 *
 * 提供便捷的验证工具
 * 不修改validator.ts，而是提供额外的验证层
 */

/**
 * 验证结果类型
 */
export type ValidationResult = { valid: boolean; error?: string };

/**
 * 验证字符串长度
 */
export function validateStringLength(
  value: string,
  fieldName: string,
  options: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  } = {}
): ValidationResult {
  const { minLength, maxLength, required } = options;

  if (required && (!value || value.trim() === '')) {
    return { valid: false, error: `${fieldName}不能为空` };
  }

  if (!value) {
    return { valid: true };
  }

  if (minLength && value.length < minLength) {
    return { valid: false, error: `${fieldName}长度不能少于${minLength}个字符` };
  }

  if (maxLength && value.length > maxLength) {
    return { valid: false, error: `${fieldName}长度不能超过${maxLength}个字符` };
  }

  return { valid: true };
}

/**
 * 验证数字范围
 */
export function validateNumberRange(
  value: number,
  fieldName: string,
  options: {
    min?: number;
    max?: number;
    required?: boolean;
    integer?: boolean;
  } = {}
): ValidationResult {
  const { min, max, required, integer } = options;

  if (required && (value === undefined || value === null)) {
    return { valid: false, error: `${fieldName}不能为空` };
  }

  if (value === undefined || value === null) {
    return { valid: true };
  }

  if (integer && !Number.isInteger(value)) {
    return { valid: false, error: `${fieldName}必须是整数` };
  }

  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, error: `${fieldName}必须是有效的数字` };
  }

  if (min !== undefined && value < min) {
    return { valid: false, error: `${fieldName}不能小于${min}` };
  }

  if (max !== undefined && value > max) {
    return { valid: false, error: `${fieldName}不能大于${max}` };
  }

  return { valid: true };
}

/**
 * 验证枚举值
 */
export function validateEnum(
  value: string,
  fieldName: string,
  allowedValues: string[]
): ValidationResult {
  if (!value) {
    return { valid: true }; // 可选字段
  }

  if (!allowedValues.includes(value)) {
    return {
      valid: false,
      error: `${fieldName}必须是以下值之一: ${allowedValues.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * 验证手机号（中国）
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { valid: false, error: '手机号不能为空' };
  }

  // 移除所有非数字字符
  const cleaned = phone.replace(/\D/g, '');

  // 验证中国手机号格式：1开头，第二位3-9，共11位
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(cleaned)) {
    return { valid: false, error: '手机号格式不正确' };
  }

  return { valid: true };
}

/**
 * 验证邮箱
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { valid: false, error: '邮箱不能为空' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: '邮箱格式不正确' };
  }

  return { valid: true };
}

/**
 * 验证密码强度
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, error: '密码不能为空' };
  }

  if (password.length < 6) {
    return { valid: false, error: '密码长度不能少于6个字符' };
  }

  if (password.length > 100) {
    return { valid: false, error: '密码长度不能超过100个字符' };
  }

  // 检查是否包含字母和数字
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasLetter || !hasNumber) {
    return { valid: false, error: '密码必须包含字母和数字' };
  }

  return { valid: true };
}

/**
 * 验证并清理字符串
 */
export function sanitizeString(input: string, options: {
  trim?: boolean;
  removeHTML?: boolean;
  maxLength?: number;
} = {}): string {
  const { trim = true, removeHTML = true, maxLength } = options;

  let result = input;

  // 移除前后空格
  if (trim) {
    result = result.trim();
  }

  // 移除HTML标签
  if (removeHTML) {
    result = result.replace(/<[^>]*>/g, '');
  }

  // 限制长度
  if (maxLength && result.length > maxLength) {
    result = result.substring(0, maxLength);
  }

  return result;
}

/**
 * 验证URL格式
 */
export function validateURL(url: string, fieldName: string = 'URL'): ValidationResult {
  if (!url) {
    return { valid: true }; // 可选字段
  }

  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: `${fieldName}格式不正确` };
  }
}

/**
 * 验证日期格式
 */
export function validateDate(date: string, fieldName: string = '日期'): ValidationResult {
  if (!date) {
    return { valid: true }; // 可选字段
  }

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return { valid: false, error: `${fieldName}格式不正确` };
  }

  return { valid: true };
}

/**
 * 验证ID（正整数）
 */
export function validateId(id: any, fieldName: string = 'ID'): ValidationResult {
  if (id === undefined || id === null) {
    return { valid: false, error: `${fieldName}不能为空` };
  }

  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    return { valid: false, error: `${fieldName}必须是正整数` };
  }

  return { valid: true };
}

/**
 * 验证数组
 */
export function validateArray(
  value: any,
  fieldName: string,
  options: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  } = {}
): ValidationResult {
  const { minLength, maxLength, required } = options;

  if (required && (!value || !Array.isArray(value))) {
    return { valid: false, error: `${fieldName}不能为空` };
  }

  if (!value) {
    return { valid: true };
  }

  if (!Array.isArray(value)) {
    return { valid: false, error: `${fieldName}必须是数组` };
  }

  if (minLength !== undefined && value.length < minLength) {
    return { valid: false, error: `${fieldName}至少需要${minLength}个元素` };
  }

  if (maxLength !== undefined && value.length > maxLength) {
    return { valid: false, error: `${fieldName}最多允许${maxLength}个元素` };
  }

  return { valid: true };
}

/**
 * 批量验证
 */
export function validateBatch(
  data: any,
  validations: Array<{
    field: string;
    required?: boolean;
    validate: (value: any) => ValidationResult;
  }>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const validation of validations) {
    const { field, required, validate } = validation;
    const value = data[field];

    // 检查必填字段
    if (required && (value === undefined || value === null || value === '')) {
      errors.push(`${field}不能为空`);
      continue;
    }

    // 跳过可选字段
    if (!required && (value === undefined || value === null)) {
      continue;
    }

    // 执行验证
    const result = validate(value);
    if (!result.valid) {
      errors.push(result.error || `${field}验证失败`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 发送验证错误响应
 */
export function sendValidationError(
  res: any,
  errors: string | string[]
): any {
  const errorsArray = Array.isArray(errors) ? errors : [errors];

  return res.status(400).json({
    success: false,
    error: {
      message: '输入数据验证失败',
      details: errorsArray,
      code: 'VALIDATION_ERROR'
    }
  });
}

/**
 * 导出所有验证函数
 */
export default {
  validateStringLength,
  validateNumberRange,
  validateEnum,
  validatePhone,
  validateEmail,
  validatePassword,
  validateURL,
  validateDate,
  validateId,
  validateArray,
  validateBatch,
  sanitizeString,
  sendValidationError
};
