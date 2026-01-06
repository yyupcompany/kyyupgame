# Bug #17 修复指南 - 前端localStorage存储敏感信息

## 问题描述
将敏感信息（如token、refreshToken）存储在localStorage中，容易被XSS攻击窃取。

## 严重级别
**高** - 需要谨慎修复（涉及认证逻辑）

## 受影响的文件
- `client/src/utils/request.ts`
  - 行号: 121, 243, 533, 594, 552

## 问题分析

1. **XSS攻击**: 恶意脚本可以读取localStorage
2. **会话劫持**: token被盗用后可以冒充用户
3. **跨站脚本**: localStorage不受同源策略的完全限制

## 修复方案（保持现有方式 + 添加可选的cookie方式）

### 核心原则：不破坏现有功能

- ✅ 保持localStorage作为默认方式
- ✅ 添加cookie存储作为可选方案
- ✅ 通过环境变量控制存储方式
- ✅ 确保向后兼容

### 步骤 1: 添加Token存储抽象层

在 `client/src/utils/request.ts` 顶部添加：

```typescript
// ================================
# Token存储抽象层
# ================================

/**
 * Token存储类型
 */
type TokenStorageType = 'localStorage' | 'cookie' | 'memory';

/**
 * 获取当前存储类型
 */
function getStorageType(): TokenStorageType {
  return (import.meta.env.VITE_TOKEN_STORAGE as TokenStorageType) || 'localStorage';
}

/**
 * Token存储接口
 */
interface ITokenStorage {
  getToken(): string | null;
  getRefreshToken(): string | null;
  setToken(token: string): void;
  setRefreshToken(refreshToken: string): void;
  removeToken(): void;
  removeRefreshToken(): void;
}

/**
 * localStorage 实现（默认，保持现有方式）
 */
class LocalStorageTokenStorage implements ITokenStorage {
  getToken(): string | null {
    return localStorage.getItem('kindergarten_token') ||
           localStorage.getItem('token') ||
           localStorage.getItem('auth_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('kindergarten_refresh_token') ||
           localStorage.getItem('refreshToken');
  }

  setToken(token: string): void {
    localStorage.setItem('kindergarten_token', token);
  }

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem('kindergarten_refresh_token', refreshToken);
  }

  removeToken(): void {
    localStorage.removeItem('kindergarten_token');
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
  }

  removeRefreshToken(): void {
    localStorage.removeItem('kindergarten_refresh_token');
    localStorage.removeItem('refreshToken');
  }
}

/**
 * Cookie 实现（可选，需要后端配合）
 */
class CookieTokenStorage implements ITokenStorage {
  getToken(): string | null {
    // 从cookie读取
    const match = document.cookie.match(/kindergarten_token=([^;]+)/);
    return match ? match[1] : null;
  }

  getRefreshToken(): string | null {
    const match = document.cookie.match(/kindergarten_refresh_token=([^;]+)/);
    return match ? match[1] : null;
  }

  setToken(token: string): void {
    // Cookie应该由后端设置，这里只是备用
    // 如果前端设置，需要配合后端的httpOnly配置
    document.cookie = `kindergarten_token=${token}; path=/; max-age=604800; SameSite=Lax`;
  }

  setRefreshToken(refreshToken: string): void {
    document.cookie = `kindergarten_refresh_token=${refreshToken}; path=/; max-age=604800; SameSite=Lax`;
  }

  removeToken(): void {
    document.cookie = 'kindergarten_token=; path=/; max-age=0';
  }

  removeRefreshToken(): void {
    document.cookie = 'kindergarten_refresh_token=; path=/; max-age=0';
  }
}

/**
 * 内存存储实现（仅用于开发调试）
 */
class MemoryTokenStorage implements ITokenStorage {
  private token: string | null = null;
  private refreshToken: string | null = null;

  getToken(): string | null {
    return this.token;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  setToken(token: string): void {
    this.token = token;
  }

  setRefreshToken(refreshToken: string): void {
    this.refreshToken = refreshToken;
  }

  removeToken(): void {
    this.token = null;
  }

  removeRefreshToken(): void {
    this.refreshToken = null;
  }
}

/**
 * 获取Token存储实例
 */
function getTokenStorage(): ITokenStorage {
  const type = getStorageType();

  switch (type) {
    case 'cookie':
      console.log('🍪 使用Cookie存储Token');
      return new CookieTokenStorage();
    case 'memory':
      console.log('💾 使用内存存储Token（仅开发调试）');
      return new MemoryTokenStorage();
    case 'localStorage':
    default:
      console.log('💾 使用localStorage存储Token（默认）');
      return new LocalStorageTokenStorage();
  }
}

// 导出单例
export const tokenStorage = getTokenStorage();
```

### 步骤 2: 修改request.ts使用抽象层

**修复前：**
```typescript
// ❌ 直接使用localStorage
let token = localStorage.getItem('kindergarten_token') || localStorage.getItem('token');

localStorage.setItem('kindergarten_token', newToken);
localStorage.setItem('kindergarten_refresh_token', refreshData.data.refreshToken);
```

**修复后：**
```typescript
// ✅ 使用抽象层
import { tokenStorage } from './token-storage';

let token = tokenStorage.getToken();

tokenStorage.setToken(newToken);
tokenStorage.setRefreshToken(refreshData.data.refreshToken);

// 清除token
tokenStorage.removeToken();
tokenStorage.removeRefreshToken();
```

### 步骤 3: 更新401处理逻辑

确保登出时也使用抽象层：

```typescript
// 清除token并跳转登录
tokenStorage.removeToken();
tokenStorage.removeRefreshToken();

if (!isRedirectingToLogin) {
  isRedirectingToLogin = true;
  router.push('/login').finally(() => {
    setTimeout(() => {
      isRedirectingToLogin = false;
    }, 1000);
  });
}
```

### 步骤 4: 环境变量配置

在 `client/.env` 中添加（可选）：

```bash
# Token存储方式
# - localStorage: 默认方式，保持现有行为
# - cookie: 使用httpOnly cookie（需要后端配合）
# - memory: 内存存储（仅开发调试，刷新后丢失）
VITE_TOKEN_STORAGE=localStorage
```

### 步骤 5: 后端配合（可选）

如果要使用httpOnly cookie，后端需要设置：

```typescript
// 在 server/src/controllers/auth.controller.ts

import { Response } from 'express';

// 登录成功后设置httpOnly cookie
export async function login(req: Request, res: Response) {
  const { accessToken, refreshToken } = generateTokens(user);

  // 设置httpOnly cookie（更安全）
  res.cookie('kindergarten_token', accessToken, {
    httpOnly: true, // JavaScript无法访问
    secure: process.env.NODE_ENV === 'production', // 只在HTTPS下传输
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15分钟
    path: '/'
  });

  res.cookie('kindergarten_refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
    path: '/'
  });

  // 同时返回token（兼容前端）
  res.json({
    success: true,
    data: { accessToken, refreshToken }
  });
}
```

### 步骤 6: 添加CSP和XSS防护

无论使用哪种存储方式，都应该添加XSS防护：

```typescript
// 在 vite.config.ts 中
export default defineConfig({
  build: {
    // 添加CSP头
    rollupOptions: {
      output: {
        // 不使用eval，使用strict模式
        strict: true
      }
    }
  },
  // 添加安全相关的插件
  plugins: [
    // 如果有CSP插件
  ]
});
```

## 本地调试保证

### 默认行为不变

- ✅ 默认使用localStorage（现有方式）
- ✅ 所有现有API调用保持不变
- ✅ 不影响任何现有功能

### 可选的存储方式

```typescript
// 开发调试（刷新后token丢失）
VITE_TOKEN_STORAGE=memory

// 生产环境（需要后端配合）
VITE_TOKEN_STORAGE=cookie
```

### 向后兼容

所有修改都是添加新的抽象层，不删除现有代码：

```typescript
// ✅ 仍然支持旧的token名称
getToken(): string | null {
  return localStorage.getItem('kindergarten_token') ||  // 新名称
         localStorage.getItem('token') ||              // 旧名称1
         localStorage.getItem('auth_token');           // 旧名称2
}
```

## 验证步骤

### 1. 测试默认行为（localStorage）

```bash
# 确保使用默认配置
# VITE_TOKEN_STORAGE=localStorage（或不设置）

# 启动前端
cd client && npm run dev

# 登录应用，检查：
# - localStorage中有token
# - 正常API调用
# - 刷新页面token仍然存在
```

### 2. 测试Cookie方式

```bash
# 设置使用cookie
echo "VITE_TOKEN_STORAGE=cookie" >> client/.env

# 重启前端
cd client && npm run dev

# 登录应用，检查：
# - Cookie中有token（httpOnly）
# - 正常API调用
# - localStorage中不应有token
```

### 3. 测试内存方式（仅开发）

```bash
# 设置使用内存
echo "VITE_TOKEN_STORAGE=memory" >> client/.env

# 重启前端
cd client && npm run dev

# 登录应用，检查：
# - 页面刷新后token丢失（预期行为）
# - 不刷新页面时正常工作
```

### 4. XSS防护测试

```javascript
// 在浏览器控制台测试
console.log('localStorage:', localStorage.getItem('kindergarten_token'));
console.log('cookie:', document.cookie);

// 如果使用httpOnly cookie，应该读取不到token
```

## 回滚方案

如果新存储方式有问题：

1. **恢复localStorage**：
   ```bash
   echo "VITE_TOKEN_STORAGE=localStorage" > client/.env
   ```

2. **完全回滚**：移除抽象层，恢复原有的localStorage代码

3. **临时使用内存存储**（调试用）：
   ```bash
   echo "VITE_TOKEN_STORAGE=memory" > client/.env
   ```

## 修复完成检查清单

- [ ] Token存储抽象层已创建
- [ ] request.ts已更新使用抽象层
- [ ] 环境变量已配置
- [ ] 默认行为保持不变（localStorage）
- [ ] Cookie存储已实现（可选）
- [ ] 内存存储已实现（可选）
- [ ] 单元测试已通过
- [ ] 手动测试已通过
- [ ] 本地调试正常工作
- [ ] 向后兼容性已确认

## 风险评估

- **风险级别**: 中
- **影响范围**: Token存储方式
- **回滚难度**: 低（保持现有默认方式）
- **本地调试影响**: 无（默认行为不变）

---

**修复时间估计**: 4-6 小时
**测试时间估计**: 2-3 小时
**总时间估计**: 6-9 小时
