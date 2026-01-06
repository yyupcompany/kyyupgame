# Bug #10 修复指南 - JSON.parse没有异常处理

## 问题描述
多个服务文件使用`JSON.parse`解析JSON时没有try-catch保护，如果接收到格式错误的JSON，会导致服务崩溃。

## 严重级别
**严重**

## 受影响的文件
- `server/src/services/ai/bridge/ai-bridge.service.ts`
- `server/src/services/ai/multimodal.service.ts`
- 所有使用 `JSON.parse` 的文件

## 漏洞代码

### 常见的不安全用法
```typescript
// ❌ 直接解析，没有异常处理
const data = JSON.parse(userInput);

// ❌ 解析请求体
const body = JSON.parse(req.body);

// ❌ 解析配置文件
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
```

## 攻击场景

### 拒绝服务攻击
```bash
# 发送格式错误的 JSON 导致服务崩溃
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"invalid": json}'  # 缺少引号
```

## 修复方案

### 步骤 1: 创建安全的 JSON 解析工具

创建文件 `server/src/utils/json-parser.ts`:

```typescript
import { logger } from './logger';

/**
 * JSON 解析错误类
 */
export class JSONParseError extends Error {
  constructor(
    message: string,
    public rawInput: string,
    public parseError: SyntaxError
  ) {
    super(message);
    this.name = 'JSONParseError';
  }
}

/**
 * JSON 解析选项
 */
interface JSONParseOptions {
  /** 是否允许原始值（非对象/数组） */
  allowPrimitives?: boolean;
  /** 最大 JSON 大小（字节） */
  maxSize?: number;
  /** 是否清理敏感数据 */
  sanitize?: boolean;
}

/**
 * 安全解析 JSON
 */
export function safeJSONParse<T = any>(
  input: string,
  options: JSONParseOptions = {}
): { success: true; data: T } | { success: false; error: string } {
  const {
    allowPrimitives = false,
    maxSize = 1024 * 1024, // 1MB
    sanitize = true
  } = options;

  try {
    // 1. 验证输入
    if (typeof input !== 'string') {
      return {
        success: false,
        error: `输入必须是字符串，收到: ${typeof input}`
      };
    }

    // 2. 检查大小
    if (input.length > maxSize) {
      return {
        success: false,
        error: `JSON 大小超过限制: ${input.length} > ${maxSize}`
      };
    }

    // 3. 空字符串检查
    const trimmed = input.trim();
    if (trimmed.length === 0) {
      return {
        success: false,
        error: 'JSON 输入为空'
      };
    }

    // 4. 解析 JSON
    const parsed = JSON.parse(trimmed);

    // 5. 验证结果类型
    if (!allowPrimitives && typeof parsed !== 'object') {
      return {
        success: false,
        error: `JSON 必须是对象或数组，收到: ${typeof parsed}`
      };
    }

    // 6. 清理敏感数据（如果需要）
    const data = sanitize ? sanitizeJSON(parsed) : parsed;

    return { success: true, data };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: `JSON 格式错误: ${error.message}`
      };
    }

    return {
      success: false,
      error: `解析失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}

/**
 * 解析 JSON（抛出异常版本）
 */
export function parseJSON<T = any>(
  input: string,
  context?: string
): T {
  const result = safeJSONParse<T>(input);

  if (!result.success) {
    const error = new JSONParseError(
      context ? `${context}: ${result.error}` : result.error,
      input.substring(0, 200),
      new SyntaxError(result.error)
    );

    logger.error('[JSON解析失败]', {
      error: result.error,
      input: input.substring(0, 200),
      context
    });

    throw error;
  }

  return result.data;
}

/**
 * 清理 JSON 中的敏感数据
 */
function sanitizeJSON(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeJSON(item));
  }

  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    // 检测敏感键
    const lowerKey = key.toLowerCase();
    const sensitivePatterns = [
      'password',
      'secret',
      'token',
      'apikey',
      'privatekey',
      'authorization',
      'cookie',
      'session',
      'credit',
      'ssn',
      'pin'
    ];

    const isSensitive = sensitivePatterns.some(pattern =>
      lowerKey.includes(pattern)
    );

    if (isSensitive) {
      // 脱敏处理
      sanitized[key] = '***REDACTED***';
    } else if (typeof value === 'object') {
      // 递归清理
      sanitized[key] = sanitizeJSON(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * 安全解析请求体
 */
export function parseRequestBody<T = any>(
  req: { body?: string | object },
  options: JSONParseOptions = {}
): T {
  // 如果已经是对象，直接返回
  if (req.body && typeof req.body === 'object') {
    return req.body as T;
  }

  // 如果是字符串，解析它
  if (typeof req.body === 'string') {
    return parseJSON<T>(req.body, 'request body');
  }

  throw new JSONParseError(
    '请求体格式无效',
    String(req.body).substring(0, 200),
    new SyntaxError('Invalid request body format')
  );
}

/**
 * 从文件安全读取 JSON
 */
export async function readJSONFile<T = any>(
  filePath: string,
  options: JSONParseOptions = {}
): Promise<T> {
  const fs = await import('fs/promises');

  try {
    const content = await fs.readFile(filePath, 'utf8');
    return parseJSON<T>(content, `file: ${filePath}`);
  } catch (error) {
    if (error instanceof JSONParseError) {
      throw error;
    }

    throw new JSONParseError(
      `读取文件失败: ${filePath}`,
      '',
      error as SyntaxError
    );
  }
}

/**
 * 同步从文件读取 JSON
 */
export function readJSONFileSync<T = any>(
  filePath: string,
  options: JSONParseOptions = {}
): T {
  const fs = require('fs');

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return parseJSON<T>(content, `file: ${filePath}`);
  } catch (error) {
    if (error instanceof JSONParseError) {
      throw error;
    }

    throw new JSONParseError(
      `同步读取文件失败: ${filePath}`,
      '',
      error as SyntaxError
    );
  }
}

/**
 * JSON Schema 验证
 */
export function validateJSONSchema<T = any>(
  data: any,
  schema: {
    type?: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
    required?: string[];
    properties?: Record<string, { type: string }>;
    additionalProperties?: boolean;
  }
): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];

  // 类型验证
  if (schema.type) {
    const expectedType = schema.type;
    const actualType = Array.isArray(data) ? 'array' : typeof data;

    if (expectedType === 'array') {
      if (!Array.isArray(data)) {
        errors.push(`期望数组，收到: ${actualType}`);
      }
    } else if (actualType !== expectedType) {
      errors.push(`期望 ${expectedType}，收到: ${actualType}`);
    }
  }

  // 对象属性验证
  if (schema.type === 'object' && data && typeof data === 'object') {
    // 必填字段
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push(`缺少必填字段: ${field}`);
        }
      }
    }

    // 属性类型
    if (schema.properties) {
      for (const [prop, propSchema] of Object.entries(schema.properties)) {
        if (prop in data) {
          const actualType = typeof data[prop];
          if (actualType !== propSchema.type) {
            errors.push(`字段 ${prop} 类型错误: 期望 ${propSchema.type}，收到 ${actualType}`);
          }
        }
      }
    }

    // 额外属性
    if (schema.additionalProperties === false) {
      const allowedProps = new Set(Object.keys(schema.properties || {}));
      const extraProps = Object.keys(data).filter(k => !allowedProps.has(k));

      if (extraProps.length > 0) {
        errors.push(`不允许的额外属性: ${extraProps.join(', ')}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}
```

### 步骤 2: 创建 JSON 解析中间件

创建文件 `server/src/middlewares/json-parse.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { safeJSONParse } from '../utils/json-parser';

/**
 * 扩展 Express Request
 */
declare module 'express' {
  interface Request {
    parsedJSON?: any;
  }
}

/**
 * JSON 解析中间件
 * 用于手动解析请求体中的 JSON 字符串
 */
export function jsonBodyParser(
  options: {
    allowPrimitives?: boolean;
    maxSize?: number;
    strict?: boolean;
  } = {}
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // 如果请求体是字符串，尝试解析
    if (req.body && typeof req.body === 'string') {
      const result = safeJSONParse(req.body, options);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            message: '请求体 JSON 格式错误',
            detail: result.error,
            code: 'INVALID_JSON'
          }
        });
      }

      req.body = result.data;
      req.parsedJSON = result.data;
    }

    next();
  };
}

/**
 * JSON 查询参数解析中间件
 */
export function jsonQueryParser(paramName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const paramValue = req.query[paramName];

    if (typeof paramValue === 'string') {
      const result = safeJSONParse(paramValue);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            message: `查询参数 ${paramName} JSON 格式错误`,
            detail: result.error,
            code: 'INVALID_QUERY_JSON'
          }
        });
      }

      req.query[paramName] = result.data;
    }

    next();
  };
}
```

### 步骤 3: 更新服务使用安全解析

**示例：更新 ai-bridge.service.ts**

**修复前：**
```typescript
// ❌ 不安全的 JSON 解析
const response = JSON.parse(aiResponse);
const analysis = JSON.parse(userInput);
```

**修复后：**
```typescript
import { safeJSONParse, parseJSON } from '../../utils/json-parser';

// ✅ 方式1: 使用 safeJSONParse（返回结果对象）
const parseResult = safeJSONParse(aiResponse);

if (!parseResult.success) {
  logger.error('[AI Bridge] AI 响应解析失败', {
    error: parseResult.error,
    response: aiResponse.substring(0, 200)
  });

  throw new Error(`AI 响应解析失败: ${parseResult.error}`);
}

const response = parseResult.data;

// ✅ 方式2: 使用 parseJSON（抛出异常）
try {
  const analysis = parseJSON(userInput, 'user input for AI analysis');
  // 使用 analysis...
} catch (error) {
  if (error instanceof JSONParseError) {
    logger.error('[AI Bridge] 用户输入解析失败', {
      error: error.message,
      input: error.rawInput
    });
  }
  throw error;
}

// ✅ 方式3: 使用 Schema 验证
const parseResult = safeJSONParse(aiRequest);

if (!parseResult.success) {
  throw new Error(`Invalid JSON: ${parseResult.error}`);
}

const schemaValidation = validateJSONSchema(parseResult.data, {
  type: 'object',
  required: ['prompt', 'model'],
  properties: {
    prompt: { type: 'string' },
    model: { type: 'string' },
    temperature: { type: 'number' }
  },
  additionalProperties: true
});

if (!schemaValidation.valid) {
  throw new Error(`Schema validation failed: ${schemaValidation.errors?.join(', ')}`);
}
```

### 步骤 4: 更新配置文件读取

**修复前：**
```typescript
// ❌ 不安全的配置文件读取
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
```

**修复后：**
```typescript
import { readJSONFileSync } from '../utils/json-parser';

// ✅ 安全读取
try {
  const config = readJSONFileSync('config.json');
  // 使用 config...
} catch (error) {
  if (error instanceof JSONParseError) {
    console.error('配置文件解析失败:', error.message);
    process.exit(1);
  }
  throw error;
}
```

### 步骤 5: 更新 WebSocket 消息处理

**修复前：**
```typescript
ws.on('message', (data) => {
  // ❌ 不安全的解析
  const message = JSON.parse(data);
  handleMessage(message);
});
```

**修复后：**
```typescript
import { safeJSONParse } from '../utils/json-parser';

ws.on('message', (data) => {
  const parseResult = safeJSONParse(data.toString());

  if (!parseResult.success) {
    ws.send(JSON.stringify({
      type: 'error',
      message: '无效的 JSON 格式',
      detail: parseResult.error
    }));
    return;
  }

  try {
    handleMessage(parseResult.data);
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'error',
      message: '处理消息失败'
    }));
  }
});
```

### 步骤 6: 创建全局 JSON 错误处理

在 `server/src/app.ts` 中添加：

```typescript
import { JSONParseError } from './utils/json-parser';

// 在全局错误处理中
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // 处理 JSON 解析错误
  if (err instanceof JSONParseError) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'JSON 格式错误',
        detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
        code: 'JSON_PARSE_ERROR'
      }
    });
  }

  // 其他错误...
  next(err);
});
```

## 验证步骤

### 1. 单元测试
创建文件 `server/src/__tests__/json-parser.test.ts`:

```typescript
import {
  safeJSONParse,
  parseJSON,
  validateJSONSchema
} from '../utils/json-parser';

describe('JSON Parser', () => {
  describe('safeJSONParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJSONParse('{"key": "value"}');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ key: 'value' });
      }
    });

    it('should handle invalid JSON', () => {
      const result = safeJSONParse('{invalid json}');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('JSON 格式错误');
      }
    });

    it('should reject oversized JSON', () => {
      const largeJSON = '{"data": "' + 'x'.repeat(2 * 1024 * 1024) + '"}'; // > 1MB
      const result = safeJSONParse(largeJSON, { maxSize: 1024 * 1024 });

      expect(result.success).toBe(false);
    });

    it('should sanitize sensitive data', () => {
      const result = safeJSONParse('{"password": "secret123", "name": "test"}');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.password).toBe('***REDACTED***');
        expect(result.data.name).toBe('test');
      }
    });
  });

  describe('parseJSON', () => {
    it('should throw on invalid JSON', () => {
      expect(() => parseJSON('{invalid}')).toThrow(JSONParseError);
    });

    it('should include context in error', () => {
      try {
        parseJSON('{invalid}', 'test context');
      } catch (error) {
        expect(error).toBeInstanceOf(JSONParseError);
        expect((error as JSONParseError).message).toContain('test context');
      }
    });
  });

  describe('validateJSONSchema', () => {
    it('should validate object structure', () => {
      const data = { name: 'test', age: 25 };
      const schema = {
        type: 'object' as const,
        required: ['name', 'age'],
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      };

      const result = validateJSONSchema(data, schema);

      expect(result.valid).toBe(true);
    });

    it('should detect missing required fields', () => {
      const data = { name: 'test' };
      const schema = {
        type: 'object' as const,
        required: ['name', 'age']
      };

      const result = validateJSONSchema(data, schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('缺少必填字段: age');
    });
  });
});
```

### 2. 集成测试
创建文件 `server/tests/__tests__/json-parsing-integration.test.ts`:

```typescript
import request from 'supertest';
import app from '../src/app';

describe('JSON Parsing Integration', () => {
  it('should reject invalid JSON in request body', async () => {
    const response = await request(app)
      .post('/api/ai/analyze')
      .set('Content-Type', 'application/json')
      .send('{invalid json}');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_JSON');
  });

  it('should reject oversized JSON', async () => {
    const largeData = { data: 'x'.repeat(2 * 1024 * 1024) }; // > 默认限制
    const response = await request(app)
      .post('/api/data')
      .send(largeData);

    expect([400, 413]).toContain(response.status);
  });

  it('should handle valid JSON correctly', async () => {
    const response = await request(app)
      .post('/api/ai/analyze')
      .send({
        prompt: 'test',
        model: 'gpt-4'
      });

    expect([200, 201]).toContain(response.status);
  });

  it('should sanitize sensitive data', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'test',
        password: 'secret123'
      });

    // 密码应该被哈希或脱敏
    expect(response.body.data?.password).toBeUndefined();
    expect(response.body.data?.password).not.toBe('secret123');
  });
});
```

### 3. 运行测试
```bash
cd server && npm test -- json-parser.test.ts
cd server && npm test -- json-parsing-integration.test.ts
```

### 4. 模糊测试
创建文件 `server/tests/fuzz/json-fuzz.test.ts`:

```typescript
import { safeJSONParse } from '../../utils/json-parser';

describe('JSON Fuzzing Tests', () => {
  const invalidJSONSamples = [
    '{',
    '}',
    '{{}',
    '{[]}',
    '{"key": undefined}',
    '{"key": function(){}}',
    '{"key": NaN}',
    '{"key": Infinity}',
    'null',
    'undefined',
    '123',
    'true',
    '[]',
    '{"a":\n"b"}',
    '{"a":\t"b"}',
    '{"a":\r"b"}',
    '{"key": "value"',
    '{key: "value"}', // 未加引号的键
    "{'key': 'value'}", // 单引号
    '{"key": 0x1}', // 十六进制
    '{"key": 01}', // 八进制
    '{"key": +1}', // 前置加号
    '{"key": 1.2.3}', // 多个小数点
    '{"key": 1e}', // 不完整的科学计数法
    '{"key": "\\x00"}', // 控制字符
    '{"key": "\\\\"}', // 转义字符
    '{"key": "\\u0022"}', // Unicode 转义
    '{"key": "\\uD800"}', // 无效的 Unicode
    '{"key": "\\\\'}"', // 多层转义
  ];

  invalidJSONSamples.forEach((sample, index) => {
    it(`should handle invalid JSON sample ${index}`, () => {
      const result = safeJSONParse(sample);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
```

## 修复完成检查清单

- [ ] 安全 JSON 解析工具已创建
- [ ] JSON 解析中间件已创建
- [ ] 所有服务已更新使用安全解析
- [ ] 配置文件读取已更新
- [ ] WebSocket 处理已更新
- [ ] 全局错误处理已更新
- [ ] Schema 验证已实现
- [ ] 敏感数据清理已实现
- [ ] 单元测试已通过
- [ ] 集成测试已通过
- [ ] 模糊测试已通过

---

**修复时间估计**: 4-6 小时
**测试时间估计**: 2-3 小时
**总时间估计**: 6-9 小时
