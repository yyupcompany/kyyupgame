# Bug #2 修复指南 - 明文密码传输和存储风险

## 问题描述
密码字段从请求体中直接提取，没有足够的验证和加密检查。虽然在后端可能使用了bcrypt，但缺少额外的安全层。

## 严重级别
**严重** - 需要立即修复

## 受影响的文件
- `server/src/middlewares/auth.middleware.ts`
  - 行号: 1162
- `server/src/controllers/user.controller.ts`
  - 行号: 1456, 845

## 漏洞代码

### 位置1: auth.middleware.ts 第1162行
```typescript
// ❌ 没有验证密码强度
const { phone, username, password, tenantCode } = req.body;
```

### 位置2: user.controller.ts 第845行
```typescript
// ❌ 没有验证旧密码强度和新密码强度
const { oldPassword, newPassword } = req.body;
```

## 修复方案

### 步骤 1: 创建密码验证工具

创建文件 `server/src/utils/password-validator.ts`:

```typescript
import { z } from 'zod';

/**
 * 密码强度验证规则
 * - 最小长度: 8
 * - 必须包含: 大写字母、小写字母、数字、特殊字符
 */
export const passwordSchema = z.object({
  password: z.string()
    .min(8, '密码长度至少为8位')
    .regex(/[A-Z]/, '密码必须包含至少一个大写字母')
    .regex(/[a-z]/, '密码必须包含至少一个小写字母')
    .regex(/[0-9]/, '密码必须包含至少一个数字')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, '密码必须包含至少一个特殊字符')
    .refine(
      (password) => {
        // 检查常见弱密码
        const commonPasswords = [
          'Password123!', '12345678', 'password',
          'qwerty123', 'admin123', 'password123'
        ];
        return !commonPasswords.includes(password);
      },
      '密码过于常见，请使用更复杂的密码'
    )
});

/**
 * 验证密码强度
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const errors: string[] = [];
  let score = 0;

  // 长度检查
  if (password.length < 8) {
    errors.push('密码长度至少为8位');
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }

  // 大写字母
  if (/[A-Z]/.test(password)) score += 1;
  else errors.push('密码必须包含至少一个大写字母');

  // 小写字母
  if (/[a-z]/.test(password)) score += 1;
  else errors.push('密码必须包含至少一个小写字母');

  // 数字
  if (/[0-9]/.test(password)) score += 1;
  else errors.push('密码必须包含至少一个数字');

  // 特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else errors.push('密码必须包含至少一个特殊字符');

  // 常见弱密码检查
  const commonPasswords = [
    'Password123!', '12345678', 'password',
    'qwerty123', 'admin123', 'password123'
  ];
  if (commonPasswords.includes(password)) {
    errors.push('密码过于常见，请使用更复杂的密码');
    score = 0;
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 5) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  return {
    valid: errors.length === 0,
    errors,
    strength
  };
}

/**
 * 密码重试限制中间件
 */
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkLoginAttempts(identifier: string): {
  allowed: boolean;
  remainingAttempts: number;
  lockoutTime?: number;
} {
  const now = Date.now();
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15分钟
  const MAX_ATTEMPTS = 5;

  const attempts = loginAttempts.get(identifier);

  if (!attempts) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // 检查是否在锁定期内
  if (attempts.count >= MAX_ATTEMPTS) {
    const timeSinceLastAttempt = now - attempts.lastAttempt;
    if (timeSinceLastAttempt < LOCKOUT_DURATION) {
      return {
        allowed: false,
        remainingAttempts: 0,
        lockoutTime: LOCKOUT_DURATION - timeSinceLastAttempt
      };
    }
    // 锁定期已过，重置计数
    loginAttempts.delete(identifier);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - attempts.count
  };
}

export function recordLoginAttempt(identifier: string, success: boolean): void {
  if (success) {
    loginAttempts.delete(identifier);
    return;
  }

  const attempts = loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
  attempts.count += 1;
  attempts.lastAttempt = Date.now();
  loginAttempts.set(identifier, attempts);
}
```

### 步骤 2: 创建密码重试限制中间件

创建文件 `server/src/middlewares/password-rate-limit.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { checkLoginAttempts, recordLoginAttempt } from '../utils/password-validator';

export function passwordRateLimit(req: Request, res: Response, next: NextFunction) {
  // 只对登录端点应用限制
  if (!req.path.includes('/login') && !req.path.includes('/auth')) {
    return next();
  }

  const identifier = req.body.phone || req.body.username || req.body.email;

  if (!identifier) {
    return next();
  }

  const check = checkLoginAttempts(identifier);

  if (!check.allowed) {
    return res.status(429).json({
      success: false,
      error: {
        message: '登录尝试次数过多，账户已被临时锁定',
        lockoutTime: Math.ceil(check.lockoutTime! / 60000), // 转换为分钟
        code: 'ACCOUNT_LOCKED'
      }
    });
  }

  // 将检查结果附加到请求对象
  req.loginAttemptCheck = check;
  next();
}

// 扩展 Express Request 类型
declare module 'express' {
  interface Request {
    loginAttemptCheck?: {
      allowed: boolean;
      remainingAttempts: number;
      lockoutTime?: number;
    };
  }
}
```

### 步骤 3: 修复 auth.middleware.ts

**修复前：**
```typescript
const { phone, username, password, tenantCode } = req.body;
```

**修复后：**
```typescript
import { validatePasswordStrength } from '../utils/password-validator';

// 验证密码强度
const { phone, username, password, tenantCode } = req.body;

if (password) {
  const passwordValidation = validatePasswordStrength(password);

  if (!passwordValidation.valid) {
    return res.status(400).json({
      success: false,
      error: {
        message: '密码强度不足',
        details: passwordValidation.errors,
        strength: passwordValidation.strength,
        code: 'WEAK_PASSWORD'
      }
    });
  }

  // 记录密码强度（用于监控）
  logger.info('密码强度验证', {
    phone,
    strength: passwordValidation.strength,
    timestamp: new Date().toISOString()
  });
}
```

### 步骤 4: 修复 user.controller.ts

**修复前（第845行）：**
```typescript
const { oldPassword, newPassword } = req.body;
```

**修复后：**
```typescript
import { validatePasswordStrength } from '../../utils/password-validator';

// 验证新密码强度
const { oldPassword, newPassword } = req.body;

if (!oldPassword || !newPassword) {
  return res.status(400).json({
    success: false,
    error: {
      message: '请提供旧密码和新密码',
      code: 'MISSING_PASSWORDS'
    }
  });
}

// 验证新密码强度
const passwordValidation = validatePasswordStrength(newPassword);

if (!passwordValidation.valid) {
  return res.status(400).json({
    success: false,
    error: {
      message: '新密码强度不足',
      details: passwordValidation.errors,
      strength: passwordValidation.strength,
      requirements: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecialChar: true
      },
      code: 'WEAK_PASSWORD'
    }
  });
}

// 检查新密码是否与旧密码相同
if (oldPassword === newPassword) {
  return res.status(400).json({
    success: false,
    error: {
      message: '新密码不能与旧密码相同',
      code: 'SAME_PASSWORD'
    }
  });
}
```

### 步骤 5: 更新登录流程

在 `server/src/controllers/auth.controller.ts` 中更新登录逻辑：

```typescript
import { checkLoginAttempts, recordLoginAttempt } from '../utils/password-validator';
import { passwordRateLimit } from '../middlewares/password-rate-limit.middleware';

// 应用密码重试限制中间件
router.post('/login', passwordRateLimit, async (req, res) => {
  const { phone, username, password, tenantCode } = req.body;

  const identifier = phone || username;

  try {
    // 验证用户凭据
    const user = await User.findOne({
      where: {
        [username ? 'username' : 'phone']: username || phone
      }
    });

    if (!user) {
      recordLoginAttempt(identifier, false);
      return res.status(401).json({
        success: false,
        error: {
          message: '用户名或密码错误',
          remainingAttempts: req.loginAttemptCheck?.remainingAttempts || 4,
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      recordLoginAttempt(identifier, false);
      return res.status(401).json({
        success: false,
        error: {
          message: '用户名或密码错误',
          remainingAttempts: req.loginAttemptCheck?.remainingAttempts || 4,
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // 登录成功，清除重试计数
    recordLoginAttempt(identifier, true);

    // 生成 token
    const token = generateToken(user);

    res.json({
      success: true,
      data: { token, user: sanitizeUser(user) }
    });
  } catch (error) {
    logger.error('登录错误', { error, identifier });
    res.status(500).json({
      success: false,
      error: { message: '登录失败，请稍后重试' }
    });
  }
});
```

### 步骤 6: 配置 HTTPS 强制

创建文件 `server/src/middlewares/https-redirect.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';

export function enforceHttps(req: Request, res: Response, next: NextFunction) {
  // 生产环境强制 HTTPS
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
}

export function addSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // 添加安全相关的 HTTP 头
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
}
```

在 `server/src/app.ts` 中应用：

```typescript
import { enforceHttps, addSecurityHeaders } from './middlewares/https-redirect.middleware';

// 在所有路由之前
if (process.env.NODE_ENV === 'production') {
  app.use(enforceHttps);
}
app.use(addSecurityHeaders);
```

## 验证步骤

### 1. 单元测试
创建文件 `server/src/__tests__/password-validator.test.ts`:

```typescript
import { validatePasswordStrength, checkLoginAttempts, recordLoginAttempt } from '../utils/password-validator';

describe('Password Validator', () => {
  describe('validatePasswordStrength', () => {
    it('should reject weak passwords', () => {
      const result = validatePasswordStrength('123');
      expect(result.valid).toBe(false);
      expect(result.strength).toBe('weak');
    });

    it('should accept strong passwords', () => {
      const result = validatePasswordStrength('MyStr0ng!Pass');
      expect(result.valid).toBe(true);
      expect(result.strength).toBe('strong');
    });

    it('should reject common passwords', () => {
      const result = validatePasswordStrength('Password123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('密码过于常见，请使用更复杂的密码');
    });
  });

  describe('Login Attempts', () => {
    beforeEach(() => {
      // 清除重试记录
    });

    it('should allow login attempts under limit', () => {
      const check = checkLoginAttempts('test@example.com');
      expect(check.allowed).toBe(true);
      expect(check.remainingAttempts).toBe(5);
    });

    it('should lock account after max attempts', () => {
      for (let i = 0; i < 5; i++) {
        recordLoginAttempts('test@example.com', false);
      }
      const check = checkLoginAttempts('test@example.com');
      expect(check.allowed).toBe(false);
      expect(check.lockoutTime).toBeGreaterThan(0);
    });

    it('should reset attempts on successful login', () => {
      recordLoginAttempts('test@example.com', false);
      recordLoginAttempts('test@example.com', true);
      const check = checkLoginAttempts('test@example.com');
      expect(check.allowed).toBe(true);
      expect(check.remainingAttempts).toBe(5);
    });
  });
});
```

### 2. 集成测试
创建文件 `server/tests/__tests__/auth-security.test.ts`:

```typescript
import request from 'supertest';
import app from '../src/app';

describe('Authentication Security', () => {
  it('should reject weak password on registration', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: '123', // 弱密码
        email: 'test@example.com'
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('WEAK_PASSWORD');
  });

  it('should lock account after 5 failed login attempts', async () => {
    const username = 'testuser';
    const password = 'wrongpassword';

    // 尝试5次错误登录
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ username, password });
    }

    // 第6次应该被锁定
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username, password });

    expect(response.status).toBe(429);
    expect(response.body.error.code).toBe('ACCOUNT_LOCKED');
  });

  it('should accept strong password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'MyStr0ng!Pass2024',
        email: 'test@example.com'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### 3. 运行测试
```bash
cd server && npm test -- password-validator.test.ts
cd server && npm test -- auth-security.test.ts
```

## 前端配合修改

创建文件 `client/src/utils/password-validator.ts`:

```typescript
/**
 * 前端密码验证工具
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
  score: number;
} {
  const errors: string[] = [];
  let score = 0;

  // 长度检查
  if (password.length < 8) {
    errors.push('密码长度至少为8位');
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }

  // 大写字母
  if (/[A-Z]/.test(password)) score += 1;
  else errors.push('必须包含大写字母');

  // 小写字母
  if (/[a-z]/.test(password)) score += 1;
  else errors.push('必须包含小写字母');

  // 数字
  if (/[0-9]/.test(password)) score += 1;
  else errors.push('必须包含数字');

  // 特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else errors.push('必须包含特殊字符');

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 5) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  return {
    valid: errors.length === 0,
    strength,
    errors,
    score
  };
}
```

## 修复完成检查清单

- [ ] 密码强度验证工具已创建
- [ ] 登录重试限制已实现
- [ ] auth.middleware.ts 已修复
- [ ] user.controller.ts 已修复
- [ ] HTTPS 强制中间件已添加
- [ ] 单元测试已通过
- [ ] 集成测试已通过
- [ ] 前端验证已实现
- [ ] 文档已更新

---

**修复时间估计**: 4-6 小时
**测试时间估计**: 2-3 小时
**总时间估计**: 6-9 小时
