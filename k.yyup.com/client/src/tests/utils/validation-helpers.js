/**
 * 严格验证工具函数
 * 用于API响应数据和组件状态的严格验证
 * 符合项目严格验证规则要求
 */

/**
 * 验证必填字段是否存在且不为空
 * @param {Object} data - 要验证的数据对象
 * @param {Array<string>} requiredFields - 必填字段名称数组
 * @throws {Error} 当必填字段缺失或为空时抛出错误
 */
export function validateRequiredFields(data, requiredFields) {
  if (!data || typeof data !== 'object') {
    throw new Error('验证数据必须是一个对象');
  }

  const missingFields = [];
  const emptyFields = [];

  requiredFields.forEach(field => {
    if (!(field in data)) {
      missingFields.push(field);
    } else if (data[field] === null || data[field] === undefined || data[field] === '') {
      emptyFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    throw new Error(`缺失必填字段: ${missingFields.join(', ')}`);
  }

  if (emptyFields.length > 0) {
    throw new Error(`必填字段为空: ${emptyFields.join(', ')}`);
  }
}

/**
 * 验证字段类型是否正确
 * @param {Object} data - 要验证的数据对象
 * @param {Object} expectedTypes - 期望的字段类型映射 {fieldName: 'type'}
 * @throws {Error} 当字段类型不匹配时抛出错误
 */
export function validateFieldTypes(data, expectedTypes) {
  if (!data || typeof data !== 'object') {
    throw new Error('验证数据必须是一个对象');
  }

  if (!expectedTypes || typeof expectedTypes !== 'object') {
    throw new Error('期望类型必须是一个对象');
  }

  const typeErrors = [];

  Object.keys(expectedTypes).forEach(field => {
    if (!(field in data)) {
      // 字段不存在，在validateRequiredFields中处理
      return;
    }

    const actualValue = data[field];
    const expectedType = expectedTypes[field];
    let actualType = typeof actualValue;

    // 特殊类型处理
    if (expectedType === 'array' && Array.isArray(actualValue)) {
      actualType = 'array';
    } else if (expectedType === 'date' && actualValue instanceof Date) {
      actualType = 'date';
    } else if (expectedType === 'null' && actualValue === null) {
      actualType = 'null';
    }

    if (actualType !== expectedType) {
      typeErrors.push(`${field}: 期望 ${expectedType}, 实际 ${actualType}`);
    }
  });

  if (typeErrors.length > 0) {
    throw new Error(`字段类型错误:\n${typeErrors.join('\n')}`);
  }
}

/**
 * 验证数值范围
 * @param {number} value - 要验证的数值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @param {string} fieldName - 字段名称（用于错误信息）
 * @throws {Error} 当数值超出范围时抛出错误
 */
export function validateNumberRange(value, min, max, fieldName = 'value') {
  if (typeof value !== 'number') {
    throw new Error(`${fieldName} 必须是数字类型`);
  }

  if (value < min || value > max) {
    throw new Error(`${fieldName} 必须在 ${min} 到 ${max} 范围内，当前值: ${value}`);
  }
}

/**
 * 扩展Number原型，添加between方法
 */
Number.prototype.between = function(min, max) {
  return this >= min && this <= max;
};

/**
 * 验证日期格式
 * @param {string} dateString - 日期字符串
 * @param {string} format - 期望的格式 ('date', 'datetime', 'time')
 * @throws {Error} 当日期格式不正确时抛出错误
 */
export function validateDateFormat(dateString, format = 'datetime') {
  if (typeof dateString !== 'string') {
    throw new Error('日期必须是字符串类型');
  }

  let regex;
  switch (format) {
    case 'date':
      regex = /^\d{4}-\d{2}-\d{2}$/;
      break;
    case 'time':
      regex = /^\d{2}:\d{2}:\d{2}$/;
      break;
    case 'datetime':
      regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      break;
    default:
      throw new Error(`不支持的日期格式: ${format}`);
  }

  if (!regex.test(dateString)) {
    throw new Error(`日期格式不正确，期望: ${format}, 实际: ${dateString}`);
  }

  // 验证日期有效性
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`无效的日期: ${dateString}`);
  }
}

/**
 * 验证枚举值
 * @param {string|number} value - 要验证的值
 * @param {Array} validValues - 有效值数组
 * @param {string} fieldName - 字段名称（用于错误信息）
 * @throws {Error} 当值不在有效范围内时抛出错误
 */
export function validateEnum(value, validValues, fieldName = 'value') {
  if (!Array.isArray(validValues)) {
    throw new Error('有效值必须是数组类型');
  }

  if (!validValues.includes(value)) {
    throw new Error(`${fieldName} 必须是以下值之一: ${validValues.join(', ')}, 实际值: ${value}`);
  }
}

/**
 * 验证数组元素的类型和结构
 * @param {Array} array - 要验证的数组
 * @param {Function} itemValidator - 元素验证函数
 * @param {string} arrayName - 数组名称（用于错误信息）
 * @throws {Error} 当数组或元素不符合要求时抛出错误
 */
export function validateArrayItems(array, itemValidator, arrayName = 'array') {
  if (!Array.isArray(array)) {
    throw new Error(`${arrayName} 必须是数组类型`);
  }

  array.forEach((item, index) => {
    try {
      itemValidator(item, index);
    } catch (error) {
      throw new Error(`${arrayName}[${index}] 验证失败: ${error.message}`);
    }
  });
}

/**
 * 验证字符串长度
 * @param {string} value - 要验证的字符串
 * @param {number} minLength - 最小长度
 * @param {number} maxLength - 最大长度
 * @param {string} fieldName - 字段名称（用于错误信息）
 * @throws {Error} 当字符串长度不符合要求时抛出错误
 */
export function validateStringLength(value, minLength = 0, maxLength = Infinity, fieldName = 'value') {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} 必须是字符串类型`);
  }

  if (value.length < minLength) {
    throw new Error(`${fieldName} 长度不能少于 ${minLength} 个字符，当前长度: ${value.length}`);
  }

  if (value.length > maxLength) {
    throw new Error(`${fieldName} 长度不能超过 ${maxLength} 个字符，当前长度: ${value.length}`);
  }
}

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @throws {Error} 当邮箱格式不正确时抛出错误
 */
export function validateEmail(email) {
  if (typeof email !== 'string') {
    throw new Error('邮箱必须是字符串类型');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error(`邮箱格式不正确: ${email}`);
  }
}

/**
 * 验证手机号格式
 * @param {string} phone - 手机号
 * @throws {Error} 当手机号格式不正确时抛出错误
 */
export function validatePhone(phone) {
  if (typeof phone !== 'string') {
    throw new Error('手机号必须是字符串类型');
  }

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    throw new Error(`手机号格式不正确: ${phone}`);
  }
}

/**
 * 验证URL格式
 * @param {string} url - URL地址
 * @throws {Error} 当URL格式不正确时抛出错误
 */
export function validateURL(url) {
  if (typeof url !== 'string') {
    throw new Error('URL必须是字符串类型');
  }

  try {
    new URL(url);
  } catch (error) {
    throw new Error(`URL格式不正确: ${url}`);
  }
}

/**
 * 验证文件信息
 * @param {Object} file - 文件对象
 * @param {Array} allowedTypes - 允许的文件类型
 * @param {number} maxSize - 最大文件大小（字节）
 * @throws {Error} 当文件不符合要求时抛出错误
 */
export function validateFile(file, allowedTypes = [], maxSize = 10 * 1024 * 1024) {
  if (!file || typeof file !== 'object') {
    throw new Error('文件信息必须是对象类型');
  }

  validateRequiredFields(file, ['filename', 'size', 'type']);

  if (file.size <= 0) {
    throw new Error('文件大小必须大于0');
  }

  if (file.size > maxSize) {
    throw new Error(`文件大小不能超过 ${maxSize} 字节`);
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new Error(`文件类型不支持: ${file.type}，允许的类型: ${allowedTypes.join(', ')}`);
  }
}

/**
 * 验证API响应结构
 * @param {Object} response - API响应对象
 * @throws {Error} 当响应结构不正确时抛出错误
 */
export function validateApiResponse(response) {
  if (!response || typeof response !== 'object') {
    throw new Error('API响应必须是对象类型');
  }

  validateRequiredFields(response, ['success']);

  if (typeof response.success !== 'boolean') {
    throw new Error('success字段必须是布尔类型');
  }

  if (response.success) {
    // 成功响应必须有data字段
    validateRequiredFields(response, ['data']);
  } else {
    // 失败响应必须有message字段
    validateRequiredFields(response, ['message']);
  }
}

/**
 * 验证分页数据
 * @param {Object} pagination - 分页数据对象
 * @throws {Error} 当分页数据不正确时抛出错误
 */
export function validatePagination(pagination) {
  if (!pagination || typeof pagination !== 'object') {
    throw new Error('分页数据必须是对象类型');
  }

  validateRequiredFields(pagination, ['page', 'pageSize', 'total', 'totalPages']);

  validateFieldTypes(pagination, {
    page: 'number',
    pageSize: 'number',
    total: 'number',
    totalPages: 'number'
  });

  validateNumberRange(pagination.page, 1, Infinity, 'page');
  validateNumberRange(pagination.pageSize, 1, 100, 'pageSize');
  validateNumberRange(pagination.total, 0, Infinity, 'total');
  validateNumberRange(pagination.totalPages, 0, Infinity, 'totalPages');

  if (pagination.page > pagination.totalPages && pagination.totalPages > 0) {
    throw new Error(`当前页码(${pagination.page})不能大于总页数(${pagination.totalPages})`);
  }
}

/**
 * 捕获和验证控制台错误
 * @param {Function} testFunction - 要测试的函数
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise<Object>} 包含控制台错误和执行结果的对象
 */
export function captureConsoleErrors(testFunction, timeout = 5000) {
  return new Promise((resolve) => {
    const originalConsole = {
      error: console.error,
      warn: console.warn
    };

    const errors = [];
    const warnings = [];

    console.error = (...args) => {
      errors.push(args);
      originalConsole.error(...args);
    };

    console.warn = (...args) => {
      warnings.push(args);
      originalConsole.warn(...args);
    };

    let result = null;
    let testError = null;

    const timeoutId = setTimeout(() => {
      cleanup();
      resolve({
        errors,
        warnings,
        result,
        testError: new Error(`测试超时 (${timeout}ms)`)
      });
    }, timeout);

    function cleanup() {
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      clearTimeout(timeoutId);
    }

    try {
      result = testFunction();
      if (result && typeof result.then === 'function') {
        result
          .then(res => {
            cleanup();
            resolve({ errors, warnings, result: res, testError: null });
          })
          .catch(err => {
            cleanup();
            resolve({ errors, warnings, result, testError: err });
          });
      } else {
        cleanup();
        resolve({ errors, warnings, result, testError: null });
      }
    } catch (err) {
      cleanup();
      resolve({ errors, warnings, result, testError: err });
    }
  });
}

/**
 * 严格验证包装器
 * 包装测试用例，确保所有验证都通过
 * @param {Function} testFunction - 测试函数
 * @param {Object} options - 选项配置
 */
export function strictValidationWrapper(testFunction, options = {}) {
  const {
    timeout = 10000,
    allowConsoleErrors = false,
    allowConsoleWarnings = false
  } = options;

  return async () => {
    const { errors, warnings, result, testError } = await captureConsoleErrors(
      testFunction,
      timeout
    );

    // 检查测试执行错误
    if (testError) {
      throw testError;
    }

    // 检查控制台错误
    if (!allowConsoleErrors && errors.length > 0) {
      const errorMessage = errors.map(err => err.join(' ')).join('\n');
      throw new Error(`发现控制台错误:\n${errorMessage}`);
    }

    // 检查控制台警告
    if (!allowConsoleWarnings && warnings.length > 0) {
      const warningMessage = warnings.map(warn => warn.join(' ')).join('\n');
      console.warn(`发现控制台警告:\n${warningMessage}`);
    }

    return result;
  };
}

/**
 * 创建测试数据验证器
 * @param {Object} schema - 验证模式
 * @returns {Function} 验证函数
 */
export function createValidator(schema) {
  return (data) => {
    if (!schema || typeof schema !== 'object') {
      throw new Error('验证模式必须是对象类型');
    }

    // 验证必填字段
    if (schema.required) {
      validateRequiredFields(data, schema.required);
    }

    // 验证字段类型
    if (schema.types) {
      validateFieldTypes(data, schema.types);
    }

    // 自定义验证
    if (schema.custom && typeof schema.custom === 'function') {
      schema.custom(data);
    }

    return true;
  };
}

export default {
  validateRequiredFields,
  validateFieldTypes,
  validateNumberRange,
  validateDateFormat,
  validateEnum,
  validateArrayItems,
  validateStringLength,
  validateEmail,
  validatePhone,
  validateURL,
  validateFile,
  validateApiResponse,
  validatePagination,
  captureConsoleErrors,
  strictValidationWrapper,
  createValidator
};