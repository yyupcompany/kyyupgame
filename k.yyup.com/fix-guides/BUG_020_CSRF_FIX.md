# Bug #20 修复指南 - 缺少CSRF保护

## 问题描述
API端点缺少CSRF（跨站请求伪造）保护，容易受到恶意网站的伪造请求攻击。

## 严重级别
**中**

## 受影响的文件
- `server/src/app.ts` (添加新中间件)
- 前端需要配合修改

## 问题分析

1. **跨站请求伪造**: 恶意网站可以伪造用户请求
2. **状态改变操作**: POST/PUT/DELETE操作易受攻击
3. **用户身份冒用**: 利用用户的登录状态执行未授权操作
4. **数据泄露或破坏**: 恶意操作可能导致数据问题

## 修复方案（添加CSRF中间件，开发环境可选）

### 步骤 1: 安装依赖

```bash
cd server && npm install csurf @types/csurf
```

### 步骤 2: 创建CSRF配置

在 `server/src/config/csrf.config.ts` 创建配置文件：

```typescript
import csrf from 'csurf';
import { Request, Response, NextFunction } from 'express';

/**
 * 开发环境检测
 */
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

/**
 * 是否启用CSRF保护
 * 可以通过环境变量控制
 */
const enableCSRF = process.env.ENABLE_CSRF === 'true' || process.env.NODE_ENV === 'production';

/**
 * CSRF配置
 */
export const csrfConfig = {
  // cookie中的CSRF token名称
  cookie: {
    key: '_csrf',
    httpOnly: false, // 前端需要读取
    secure: !isDevelopment, // 只在HTTPS下传输（生产环境）
    sameSite: 'strict' as const,
    maxAge: 3600 * 1000 // 1小时
  },

  // 忽略的路径（API端点）
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],

  // 获取token的函数
  getValue: (req: Request) => {
    return req.headers['x-csrf-token'] as string;
  }
};

/**
 * CSRF保护中间件（带环境检测）
 */
export const csrfProtection = enableCSRF
  ? csrf(csrfConfig)
  : // 开发环境返回空中间件
    (req: Request, res: Response, next: NextFunction) => {
      if (isDevelopment || isTest) {
        // 开发/测试环境：设置假token以便开发
        res.locals._csrf = 'development-csrf-token';
      }
      next();
    };

/**
 * CSRF token端点
 */
export function getCsrfToken(req: Request, res: Response) {
  if (enableCSRF) {
    res.json({
      success: true,
      data: {
        csrfToken: req.csrfToken()
      }
    });
  } else {
    // 开发环境返回假token
    res.json({
      success: true,
      data: {
        csrfToken: 'development-csrf-token',
        note: 'CSRF保护未启用'
      }
    });
  }
}

/**
 * 错误处理
 */
export function csrfErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      success: false,
      error: {
        message: 'CSRF token验证失败',
        code: 'INVALID_CSRF_TOKEN'
      }
    });
  }
  next(err);
}
```

### 步骤 3: 在app.ts中应用

**修复前：**
```typescript
// ❌ 没有CSRF保护
app.use('/api/', (req, res, next) => {
  next();
});
```

**修复后：**
```typescript
import {
  csrfProtection,
  csrfErrorHandler,
  getCsrfToken
} from './config/csrf.config';

// ================================
# CSRF保护
# ================================

// 1. 提供CSRF token的端点（不需要认证）
app.get('/api/csrf-token', getCsrfToken);

// 2. 应用CSRF保护到所有状态改变的操作
app.use('/api', csrfProtection);

// 3. CSRF错误处理
app.use(csrfErrorHandler);
```

### 步骤 4: 前端集成

在 `client/src/utils/request.ts` 中添加CSRF token：

```typescript
/**
 * 获取CSRF token
 */
async function getCsrfToken(): Promise<string> {
  try {
    const response = await fetch('/api/csrf-token');
    const data = await response.json();
    return data.data.csrfToken;
  } catch (error) {
    console.warn('获取CSRF token失败:', error);
    return '';
  }
}

/**
 * 初始化时获取token
 */
let csrfToken: string | null = null;

export async function initCsrfProtection() {
  if (import.meta.env.PROD) {
    csrfToken = await getCsrfToken();
  }
}

// 在请求拦截器中添加token
axiosInstance.interceptors.request.use(async (config) => {
  // 添加CSRF token到状态改变的操作
  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  return config;
});
```

### 步骤 5: 在main.ts中初始化

```typescript
import { initCsrfProtection } from '@/utils/request';

app.mount('#app');

// 初始化CSRF保护（仅生产环境）
if (import.meta.env.PROD) {
  initCsrfProtection();
}
```

### 步骤 6: 环境变量配置

在 `server/.env` 中添加：

```bash
# ================================
# CSRF保护配置
# ================================

# 是否启用CSRF保护
# - 生产环境建议启用
# - 开发环境可以关闭以便调试
ENABLE_CSRF=false
```

### 步骤 7: 白名单配置

某些API可能需要豁免CSRF检查（如webhook）：

```typescript
import { Request, Response, NextFunction } from 'express';

/**
 * CSRF豁免路径
 */
const CSRF_EXEMPT_PATHS = [
  '/api/webhooks', // 第三方webhook
  '/api/public',   // 公开API
  '/api/auth/login' // 登录（可以豁免或单独处理
];

/**
 * 条件CSRF保护中间件
 */
export function conditionalCsrfProtection(req: Request, res: Response, next: NextFunction) {
  // 检查是否在豁免路径中
  const isExempt = CSRF_EXEMPT_PATHS.some(path => req.path.startsWith(path));

  if (isExempt) {
    return next();
  }

  // 应用CSRF保护
  return csrfProtection(req, res, next);
}

// 在app.ts中使用
app.use('/api', conditionalCsrfProtection);
```

## 本地调试保证

### 开发环境默认禁用

```typescript
const enableCSRF = process.env.ENABLE_CSRF === 'true' || process.env.NODE_ENV === 'production';
```

- ✅ 开发环境默认不启用
- ✅ 不影响任何API调用
- ✅ 可以手动启用测试

### 手动启用测试

```bash
# 测试CSRF功能
export ENABLE_CSRF=true
cd server && npm run dev
```

### 宽松的开发配置

```typescript
// 开发环境使用宽松配置
const isDevelopment = process.env.NODE_ENV === 'development';

export const csrfConfig = {
  cookie: {
    secure: !isDevelopment, // 开发环境允许HTTP
    sameSite: isDevelopment ? 'lax' : 'strict' // 开发环境宽松
  }
};
```

## 验证步骤

### 1. 测试CSRF保护（生产环境）

```bash
# 设置生产环境
export NODE_ENV=production
export ENABLE_CSRF=true

# 启动服务器
cd server && npm run dev

# 测试CSRF保护（应该失败）
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"test"}'

# 应该返回：
# {"success":false,"error":{"message":"CSRF token验证失败"}}

# 测试正确请求（应该成功）
CSRF_TOKEN=$(curl http://localhost:3000/api/csrf-token | jq -r '.data.csrfToken')

curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -d '{"name":"test"}'
```

### 2. 测试开发环境

```bash
# 设置开发环境
export NODE_ENV=development

# 启动服务器
cd server && npm run dev

# 测试请求（应该成功，没有CSRF检查）
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"test"}'
```

### 3. 测试前端集成

```javascript
// 在浏览器控制台测试
// 检查是否正确获取和发送token

// 1. 获取token
fetch('/api/csrf-token')
  .then(r => r.json())
  .then(data => console.log('CSRF Token:', data.data.csrfToken));

// 2. 发送带token的请求
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': '从步骤1获取的token'
  },
  body: JSON.stringify({ name: 'test' })
});
```

### 4. 测试豁免路径

```bash
# 测试webhook路径（应该不需要CSRF token）
curl -X POST http://localhost:3000/api/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{"data":"test"}'
```

## 回滚方案

如果CSRF保护导致问题：

1. **临时禁用**：
   ```bash
   export ENABLE_CSRF=false
   ```

2. **仅对生产环境启用**：
   ```typescript
   const enableCSRF = process.env.NODE_ENV === 'production';
   ```

3. **完全移除**：
   - 删除app.ts中的CSRF中间件
   - 删除前端的CSRF token处理

4. **添加更多豁免路径**：
   ```typescript
   const CSRF_EXEMPT_PATHS = [
     '/api/webhooks',
     '/api/your-problematic-path'
   ];
   ```

## 修复完成检查清单

- [ ] csurf已安装
- [ ] CSRF配置已创建
- [ ] CSRF中间件已应用
- [ ] 前端已集成CSRF token
- [ ] 环境变量已配置
- [ ] 豁免路径已配置（如需要）
- [ ] 单元测试已通过
- [ ] 手动测试已通过
- [ ] 本地调试不受影响

## 风险评估

- **风险级别**: 低
- **影响范围**: 所有状态改变的操作
- **回滚难度**: 低（环境变量控制）
- **本地调试影响**: 无（开发环境默认禁用）

---

**修复时间估计**: 3-4 小时
**测试时间估计**: 2-3 小时
**总时间估计**: 5-7 小时
