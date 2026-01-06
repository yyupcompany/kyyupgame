/**
 * 移动端测试验证辅助工具
 * 严格验证规则实现，符合项目测试标准
 */

/**
 * 验证必填字段是否存在
 * @param data 待验证的数据对象
 * @param requiredFields 必填字段列表
 * @returns 验证结果
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: any,
  requiredFields: (keyof T)[]
): { valid: boolean; missing: string[]; present: string[] } {
  const missing: string[] = [];
  const present: string[] = [];

  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      missing: requiredFields as string[],
      present: []
    };
  }

  requiredFields.forEach(field => {
    const fieldName = String(field);
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(fieldName);
    } else {
      present.push(fieldName);
    }
  });

  return {
    valid: missing.length === 0,
    missing,
    present
  };
}

/**
 * 验证字段类型是否正确
 * @param data 待验证的数据对象
 * @param fieldTypes 字段类型映射
 * @returns 验证结果
 */
export function validateFieldTypes<T extends Record<string, any>>(
  data: any,
  fieldTypes: Partial<Record<keyof T, string>>
): { valid: boolean; errors: string[]; correct: string[] } {
  const errors: string[] = [];
  const correct: string[] = [];

  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: ['数据不是有效对象'],
      correct: []
    };
  }

  Object.entries(fieldTypes).forEach(([field, expectedType]) => {
    const actualValue = data[field];
    const actualType = Array.isArray(actualValue) ? 'array' : typeof actualValue;

    if (actualValue === undefined || actualValue === null) {
      errors.push(`字段 ${field} 不存在`);
      return;
    }

    // 特殊类型检查
    switch (expectedType) {
      case 'array':
        if (!Array.isArray(actualValue)) {
          errors.push(`字段 ${field} 期望类型是 array，实际是 ${actualType}`);
        } else {
          correct.push(String(field));
        }
        break;

      case 'date':
        if (!(actualValue instanceof Date) &&
            !(typeof actualValue === 'string' && !isNaN(Date.parse(actualValue)))) {
          errors.push(`字段 ${field} 期望类型是 date，实际是 ${actualType}`);
        } else {
          correct.push(String(field));
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof actualValue !== 'string' || !emailRegex.test(actualValue)) {
          errors.push(`字段 ${field} 不是有效的邮箱格式`);
        } else {
          correct.push(String(field));
        }
        break;

      case 'url':
        try {
          new URL(actualValue);
          correct.push(String(field));
        } catch {
          errors.push(`字段 ${field} 不是有效的URL格式`);
        }
        break;

      case 'phone':
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (typeof actualValue !== 'string' || !phoneRegex.test(actualValue.replace(/\D/g, ''))) {
          errors.push(`字段 ${field} 不是有效的手机号格式`);
        } else {
          correct.push(String(field));
        }
        break;

      default:
        if (actualType !== expectedType) {
          errors.push(`字段 ${field} 期望类型是 ${expectedType}，实际是 ${actualType}`);
        } else {
          correct.push(String(field));
        }
        break;
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    correct
  };
}

/**
 * 验证枚举值是否有效
 * @param value 待验证的值
 * @param enumObject 枚举对象
 * @returns 验证结果
 */
export function validateEnumValue<T extends Record<string, string | number>>(
  value: any,
  enumObject: T
): boolean {
  const validValues = Object.values(enumObject);
  return validValues.includes(value);
}

/**
 * 验证日期格式
 * @param dateString 日期字符串
 * @param format 日期格式 ('YYYY-MM-DD', 'ISO', 'timestamp')
 * @returns 验证结果
 */
export function validateDateFormat(
  dateString: string,
  format: 'YYYY-MM-DD' | 'ISO' | 'timestamp' = 'YYYY-MM-DD'
): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  switch (format) {
    case 'YYYY-MM-DD':
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(dateString)) return false;

      const date = new Date(dateString);
      const dateStr = date.toISOString().split('T')[0];
      return dateStr === dateString;

    case 'ISO':
      return !isNaN(Date.parse(dateString));

    case 'timestamp':
      const timestamp = parseInt(dateString, 10);
      return !isNaN(timestamp) && timestamp > 0;

    default:
      return false;
  }
}

/**
 * 验证JWT令牌格式
 * @param token JWT令牌
 * @returns 验证结果
 */
export function validateJWTToken(token: string): { valid: boolean; errors: string[]; payload?: any } {
  const errors: string[] = [];

  if (!token || typeof token !== 'string') {
    errors.push('令牌不存在或格式错误');
    return { valid: false, errors };
  }

  // 检查JWT格式 (三段式)
  const parts = token.split('.');
  if (parts.length !== 3) {
    errors.push('JWT格式错误，应该包含三个部分');
    return { valid: false, errors };
  }

  try {
    // 解码payload
    const payload = JSON.parse(atob(parts[1]));

    // 验证必要声明
    const requiredClaims = ['userId', 'username', 'role', 'exp', 'iat'];
    const missingClaims = requiredClaims.filter(claim => !(claim in payload));

    if (missingClaims.length > 0) {
      errors.push(`缺少必要声明: ${missingClaims.join(', ')}`);
    }

    // 验证过期时间
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        errors.push('令牌已过期');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      payload
    };
  } catch (error) {
    errors.push('令牌解码失败');
    return { valid: false, errors };
  }
}

/**
 * 验证API响应结构
 * @param response API响应对象
 * @param expectData 是否期望有data字段
 * @returns 验证结果
 */
export function validateAPIResponse(
  response: any,
  expectData: boolean = true
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!response || typeof response !== 'object') {
    errors.push('响应不是有效对象');
    return { valid: false, errors };
  }

  // 验证标准字段
  const standardFields = ['success'];
  const missingFields = standardFields.filter(field => !(field in response));

  if (missingFields.length > 0) {
    errors.push(`缺少标准字段: ${missingFields.join(', ')}`);
  }

  // 验证success字段类型
  if (response.success !== undefined && typeof response.success !== 'boolean') {
    errors.push('success字段必须是布尔类型');
  }

  // 验证data字段（如果期望存在）
  if (expectData) {
    if (!('data' in response)) {
      errors.push('缺少data字段');
    } else if (response.success && response.data === undefined) {
      errors.push('成功响应必须包含data字段');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证分页数据结构
 * @param paginationData 分页数据对象
 * @returns 验证结果
 */
export function validatePaginationData(paginationData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!paginationData || typeof paginationData !== 'object') {
    errors.push('分页数据不是有效对象');
    return { valid: false, errors };
  }

  // 验证必填字段
  const requiredFields = ['items', 'total', 'page', 'pageSize'];
  const fieldValidation = validateRequiredFields(paginationData, requiredFields);

  if (!fieldValidation.valid) {
    errors.push(`分页字段缺失: ${fieldValidation.missing.join(', ')}`);
  }

  // 验证字段类型
  const typeValidation = validateFieldTypes(paginationData, {
    items: 'array',
    total: 'number',
    page: 'number',
    pageSize: 'number'
  });

  if (!typeValidation.valid) {
    errors.push(`分页字段类型错误: ${typeValidation.errors.join(', ')}`);
  }

  // 验证数值合理性
  if (paginationData.total !== undefined && paginationData.total < 0) {
    errors.push('total不能为负数');
  }

  if (paginationData.page !== undefined && paginationData.page < 1) {
    errors.push('page必须大于0');
  }

  if (paginationData.pageSize !== undefined && paginationData.pageSize < 1) {
    errors.push('pageSize必须大于0');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证移动端页面元素
 * @param selector 元素选择器
 * @param options 验证选项
 * @returns 验证结果
 */
export function validateMobileElement(
  selector: string,
  options: {
    visible?: boolean;
    enabled?: boolean;
    hasText?: boolean;
    hasAttribute?: string;
  } = {}
): { valid: boolean; errors: string[]; element?: Element } {
  const errors: string[] = [];

  try {
    const element = document.querySelector(selector);

    if (!element) {
      errors.push(`元素 ${selector} 不存在`);
      return { valid: false, errors };
    }

    // 验证可见性
    if (options.visible !== undefined) {
      const isVisible = element.offsetParent !== null;
      if (options.visible !== isVisible) {
        errors.push(`元素 ${selector} 可见性不符合预期`);
      }
    }

    // 验证可用性（适用于表单元素）
    if (options.enabled !== undefined && (element as HTMLInputElement).disabled !== undefined) {
      const isEnabled = !(element as HTMLInputElement).disabled;
      if (options.enabled !== isEnabled) {
        errors.push(`元素 ${selector} 可用性不符合预期`);
      }
    }

    // 验证文本内容
    if (options.hasText && (!element.textContent || element.textContent.trim().length === 0)) {
      errors.push(`元素 ${selector} 没有文本内容`);
    }

    // 验证属性
    if (options.hasAttribute && !element.hasAttribute(options.hasAttribute)) {
      errors.push(`元素 ${selector} 缺少属性 ${options.hasAttribute}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      element
    };
  } catch (error) {
    errors.push(`验证元素 ${selector} 时发生错误: ${error}`);
    return { valid: false, errors };
  }
}

/**
 * 验证移动端响应式布局
 * @returns 验证结果
 */
export function validateMobileResponsive(): { valid: boolean; errors: string[]; info: any } {
  const errors: string[] = [];
  const info: any = {
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    isMobile: window.innerWidth <= 768,
    hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    fontSize: getComputedStyle(document.documentElement).fontSize
  };

  // 检查横向滚动
  if (info.hasHorizontalScroll) {
    errors.push('页面存在横向滚动条');
  }

  // 检查字体大小（移动端应该使用相对单位）
  if (info.fontSize && info.fontSize.includes('px')) {
    const fontSizeValue = parseInt(info.fontSize);
    if (fontSizeValue < 14) {
      errors.push('移动端字体过小，可读性差');
    }
  }

  // 检查触摸目标大小（最小44px）
  const touchTargets = document.querySelectorAll('button, a, input, .touch-target');
  touchTargets.forEach((target, index) => {
    const rect = target.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      errors.push(`触摸目标 ${index} 尺寸过小 (${Math.round(rect.width)}x${Math.round(rect.height)})`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    info
  };
}

/**
 * 验证移动端性能指标
 * @returns 验证结果
 */
export function validateMobilePerformance(): { valid: boolean; errors: string[]; metrics: any } {
  const errors: string[] = [];
  const metrics: any = {
    loadTime: performance.now(),
    domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
    domComplete: performance.timing.domComplete - performance.timing.navigationStart,
    memoryUsage: (performance as any).memory ? {
      used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024)
    } : null
  };

  // 性能基准验证
  if (metrics.loadTime > 3000) {
    errors.push('页面加载时间超过3秒');
  }

  if (metrics.domComplete > 5000) {
    errors.push('DOM完成时间超过5秒');
  }

  if (metrics.memoryUsage && metrics.memoryUsage.used > 50) {
    errors.push('内存使用超过50MB');
  }

  return {
    valid: errors.length === 0,
    errors,
    metrics
  };
}

/**
 * 验证AI响应质量
 * @param question 用户问题
 * @param response AI响应
 * @returns 验证结果
 */
export function validateAIResponse(question: string, response: string): {
  valid: boolean;
  scores: { relevance: number; helpfulness: number; completeness: number };
  feedback: string[];
} {
  const feedback: string[] = [];
  let relevanceScore = 0;
  let helpfulnessScore = 0;
  let completenessScore = 0;

  // 相关性评分
  const questionWords = question.toLowerCase().split(/\s+/);
  const responseText = response.toLowerCase();
  const matchedWords = questionWords.filter(word => word.length > 1 && responseText.includes(word));
  relevanceScore = Math.min(100, (matchedWords.length / questionWords.length) * 150);

  if (relevanceScore < 50) {
    feedback.push('响应与问题相关性较低');
  }

  // 有用性评分
  const helpfulKeywords = ['建议', '方法', '可以', '应该', '注意', '步骤', '如何'];
  const hasHelpfulContent = helpfulKeywords.some(keyword => responseText.includes(keyword));
  helpfulnessScore = hasHelpfulContent ? 80 : 40;

  if (!hasHelpfulContent) {
    feedback.push('响应缺乏实用建议');
  }

  // 完整性评分
  const responseLength = response.length;
  if (responseLength < 50) {
    completenessScore = 30;
    feedback.push('响应过于简短');
  } else if (responseLength > 1000) {
    completenessScore = 70;
    feedback.push('响应过长，可能缺乏重点');
  } else {
    completenessScore = 90;
  }

  // 检查是否包含具体建议
  const hasSpecificAdvice = /\d+|具体|例如|比如|首先|其次|最后/.test(response);
  if (hasSpecificAdvice) {
    helpfulnessScore = Math.min(100, helpfulnessScore + 20);
  } else {
    feedback.push('建议过于笼统');
  }

  const overallScore = (relevanceScore + helpfulnessScore + completenessScore) / 3;

  return {
    valid: overallScore >= 60,
    scores: {
      relevance: relevanceScore,
      helpfulness: helpfulnessScore,
      completeness: completenessScore
    },
    feedback
  };
}

/**
 * 捕获控制台错误和警告
 * @returns 控制台监控结果
 */
export function captureConsoleErrors(): { errors: string[]; warnings: string[]; logs: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const logs: string[] = [];

  // 保存原始console方法
  const originalConsole = {
    error: console.error,
    warn: console.warn,
    log: console.log
  };

  // 重写console方法
  console.error = (...args: any[]) => {
    errors.push(args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' '));
    originalConsole.error.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    warnings.push(args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' '));
    originalConsole.warn.apply(console, args);
  };

  console.log = (...args: any[]) => {
    logs.push(args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' '));
    originalConsole.log.apply(console, args);
  };

  return {
    errors,
    warnings,
    logs,
    restore: () => {
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.log = originalConsole.log;
    }
  } as any;
}

/**
 * 生成测试报告
 * @param testName 测试名称
 * @param results 测试结果
 * @returns 格式化的测试报告
 */
export function generateTestReport(testName: string, results: any): string {
  const timestamp = new Date().toISOString();
  const passed = results.filter((r: any) => r.valid).length;
  const total = results.length;
  const passRate = Math.round((passed / total) * 100);

  const report = `
# 移动端测试报告 - ${testName}

**生成时间**: ${timestamp}
**测试通过率**: ${passRate}% (${passed}/${total})

## 测试结果概览

| 测试项目 | 状态 | 详情 |
|---------|------|------|
${results.map((r: any) =>
  `| ${r.name} | ${r.valid ? '✅ 通过' : '❌ 失败'} | ${r.errors ? r.errors.join(', ') : '正常'} |`
).join('\n')}

## 性能指标

${results.map((r: any) => {
  if (r.metrics) {
    return `### ${r.name}
- 加载时间: ${r.metrics.loadTime}ms
- 内存使用: ${r.metrics.memoryUsage?.used || 'N/A'}MB
`;
  }
  return '';
}).join('\n')}

## 建议改进

${results.flatMap((r: any) => r.errors || []).map(error => `- ${error}`).join('\n')}

---

**报告生成工具**: 移动端测试验证助手
**测试环境**: ${navigator.userAgent}
**屏幕尺寸**: ${window.innerWidth}x${window.innerHeight}
`;

  return report;
}

export default {
  validateRequiredFields,
  validateFieldTypes,
  validateEnumValue,
  validateDateFormat,
  validateJWTToken,
  validateAPIResponse,
  validatePaginationData,
  validateMobileElement,
  validateMobileResponsive,
  validateMobilePerformance,
  validateAIResponse,
  captureConsoleErrors,
  generateTestReport
};