# Bug #19 修复指南 - 缺少输入验证和清理

## 问题描述
API端点缺少统一的输入验证机制，直接使用用户输入。

## 严重级别
**高**

## 受影响的文件
- `server/src/controllers/` (业务层)
- 具体控制器文件

## 问题分析

1. **SQL注入**: 未验证的输入可能导致SQL注入
2. **XSS攻击**: 未清理的HTML可能导致XSS
3. **数据污染**: 无效数据进入数据库
4. **业务逻辑错误**: 缺少必填字段验证

## 修复方案（在控制器中添加验证，不修改validator.ts）

### 步骤 1: 创建验证工具

在 `server/src/utils/validation-helpers.ts` 创建新文件：

```typescript
/**
 * 输入验证辅助函数
 * 不修改validator.ts，提供便捷的验证工具
 */

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
): { valid: boolean; error?: string } {
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
): { valid: boolean; error?: string } {
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
): { valid: boolean; error?: string } {
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
 * 验证手机号
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone) {
    return { valid: false, error: '手机号不能为空' };
  }

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, error: '手机号格式不正确' };
  }

  return { valid: true };
}

/**
 * 验证邮箱
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
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
 * 批量验证
 */
export function validateBatch(
  data: any,
  validations: Array<{
    field: string;
    required?: boolean;
    validate: (value: any) => { valid: boolean; error?: string };
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
  errors: string[]
) {
  return res.status(400).json({
    success: false,
    error: {
      message: '输入数据验证失败',
      details: errors,
      code: 'VALIDATION_ERROR'
    }
  });
}
```

### 步骤 2: 在控制器中使用

**示例：用户注册**

```typescript
import {
  validateStringLength,
  validatePhone,
  validateEmail,
  validateBatch,
  sendValidationError,
  sanitizeString
} from '../../utils/validation-helpers';

export async function register(req: Request, res: Response) {
  // 1. 验证输入
  const { username, phone, email, password } = req.body;

  // 验证用户名
  const nameValidation = validateStringLength(username, '用户名', {
    minLength: 2,
    maxLength: 50,
    required: true
  });
  if (!nameValidation.valid) {
    return sendValidationError(res, [nameValidation.error!]);
  }

  // 验证手机号
  const phoneValidation = validatePhone(phone);
  if (!phoneValidation.valid) {
    return sendValidationError(res, [phoneValidation.error!]);
  }

  // 验证邮箱（如果提供）
  if (email) {
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return sendValidationError(res, [emailValidation.error!]);
    }
  }

  // 验证密码
  const passwordValidation = validateStringLength(password, '密码', {
    minLength: 6,
    maxLength: 100,
    required: true
  });
  if (!passwordValidation.valid) {
    return sendValidationError(res, [passwordValidation.error!]);
  }

  // 2. 清理输入
  const cleanUsername = sanitizeString(username);
  const cleanEmail = email ? sanitizeString(email) : undefined;

  // 3. 创建用户
  try {
    const user = await User.create({
      username: cleanUsername,
      phone,
      email: cleanEmail,
      password // 密码会在模型中加密
    });

    res.json({ success: true, data: user });
  } catch (error) {
    // 处理唯一约束冲突
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        error: {
          message: '手机号已被注册',
          code: 'DUPLICATE_PHONE'
        }
      });
    }
    throw error;
  }
}
```

### 步骤 3: 创建验证中间件

创建 `server/src/middlewares/validation.middleware.ts`：

```typescript
import { Request, Response, NextFunction } from 'express';
import { validateBatch, sendValidationError } from '../utils/validation-helpers';

/**
 * 请求体验证中间件工厂
 */
export function validateRequest(validationConfig: {
  body?: Record<string, any>;
  query?: Record<string, any>;
  params?: Record<string, any>;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const validations: Array<{
      field: string;
      required?: boolean;
      validate: (value: any) => { valid: boolean; error?: string };
    }> = [];

    // 验证body
    if (validationConfig.body) {
      for (const [field, config] of Object.entries(validationConfig.body)) {
        validations.push({
          field,
          required: config.required !== false,
          validate: (value) => {
            // 根据配置类型验证
            if (config.type === 'string') {
              return validateStringLength(value, field, config);
            } else if (config.type === 'number') {
              return validateNumberRange(value, field, config);
            } else if (config.type === 'phone') {
              return validatePhone(value);
            } else if (config.type === 'email') {
              return validateEmail(value);
            }
            return { valid: true };
          }
        });
      }
    }

    // 验证query
    if (validationConfig.query) {
      for (const [field, config] of Object.entries(validationConfig.query)) {
        validations.push({
          field: `query.${field}`,
          required: config.required !== false,
          validate: (value) => {
            if (config.type === 'number') {
              return validateNumberRange(value, field, config);
            }
            return { valid: true };
          }
        });
      }
    }

    // 执行验证
    const { valid, errors } = validateBatch(req, validations);

    if (!valid) {
      return sendValidationError(res, errors);
    }

    next();
  };
}

// 使用示例：
//
// app.post('/api/users',
//   validateRequest({
//     body: {
//       username: { type: 'string', minLength: 2, maxLength: 50, required: true },
//       phone: { type: 'phone', required: true },
//       age: { type: 'number', min: 0, max: 120 }
//     }
//   }),
//   register
// );
```

### 步骤 4: 环境变量配置

在 `server/.env` 中添加（可选）：

```bash
# ================================
# 输入验证配置
# ================================

# 是否严格验证模式
STRICT_VALIDATION=true

# 是否在开发环境返回详细验证错误
VERBOSE_VALIDATION_ERRORS=true
```

### 步骤 5: 添加常见的验证模式

创建 `server/src/utils/common-validations.ts`：

```typescript
import { validateBatch, validateStringLength, validatePhone, validateEnum } from './validation-helpers';

/**
 * 常见的验证模式
 */
export const commonValidations = {
  // 用户名验证
  username: (required = true) => ({
    field: 'username',
    required,
    validate: (value: any) => validateStringLength(value, '用户名', {
      minLength: 2,
      maxLength: 50,
      required
    })
  }),

  // 手机号验证
  phone: (required = true) => ({
    field: 'phone',
    required,
    validate: (value: any) => validatePhone(value)
  }),

  // 角色验证
  role: () => ({
    field: 'role',
    required: false,
    validate: (value: any) => validateEnum(value, '角色', [
      'admin',
      'teacher',
      'parent',
      'principal'
    ])
  }),

  // 分页参数验证
  pagination: () => ({
    field: 'pageSize',
    required: false,
    validate: (value: any) => {
      if (!value) return { valid: true };
      return validateNumberRange(parseInt(value), 'pageSize', {
        min: 1,
        max: 100
      });
    }
  })
};

/**
 * 快速验证函数
 */
export function quickValidate(req: any, rules: any[]) {
  return validateBatch(req, rules);
}
```

## 本地调试保证

### 不影响开发

- ✅ 验证规则与业务逻辑一致
- ✅ 开发环境可以返回详细的验证错误
- ✅ 不修改公共验证工具

### 灵活的验证

```typescript
// 可以在开发环境禁用严格验证
if (process.env.NODE_ENV !== 'production') {
  // 跳过某些验证
  return next();
}
```

## 验证步骤

### 1. 单元测试
```typescript
describe('输入验证', () => {
  it('应该验证手机号格式', () => {
    const result = validatePhone('12345');
    expect(result.valid).toBe(false);
  });

  it('应该验证字符串长度', () => {
    const result = validateStringLength('ab', 'name', {
      minLength: 3,
      maxLength: 10
    });
    expect(result.valid).toBe(false);
  });

  it('应该批量验证多个字段', () => {
    const result = validateBatch(
      { username: 'ab', phone: '13800138000' },
      [
        {
          field: 'username',
          required: true,
          validate: (v) => validateStringLength(v, '用户名', { minLength: 3 })
        },
        {
          field: 'phone',
          required: true,
          validate: (v) => validatePhone(v)
        }
      ]
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
  });
});
```

### 2. 手动测试

```bash
# 测试必填字段验证
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test"}'

# 应该返回：手机号不能为空

# 测试格式验证
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test","phone":"12345"}'

# 应该返回：手机号格式不正确

# 测试成功请求
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","phone":"13800138000","password":"123456"}'

# 应该成功
```

## 回滚方案

如果验证导致问题：

1. **临时禁用严格验证**：
   ```typescript
   if (process.env.STRICT_VALIDATION !== 'true') {
     return next(); // 跳过验证
   }
   ```

2. **调整验证规则**：修改验证参数

3. **添加例外**：
   ```typescript
   // 在开发环境跳过某些验证
   if (process.env.NODE_ENV === 'development' && req.query.skipValidation) {
     return next();
   }
   ```

## 修复完成检查清单

- [ ] 验证工具函数已创建
- [ ] 控制器已添加验证
- [ ] 验证中间件已创建（可选）
- [ ] 常见验证模式已定义
- [ ] 环境变量已配置
- [ ] 单元测试已通过
- [ ] 手动测试已通过
- [ ] 本地调试正常工作
- [ ] 不影响现有功能

## 风险评估

- **风险级别**: 低
- **影响范围**: 控制器层
- **回滚难度**: 低（调整或禁用验证）
- **本地调试影响**: 无（详细错误帮助调试）

---

**修复时间估计**: 6-8 小时
**测试时间估计**: 3-4 小时
**总时间估计**: 9-12 小时
