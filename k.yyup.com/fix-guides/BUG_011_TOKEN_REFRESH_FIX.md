# Bug #11 修复指南 - Token刷新机制存在竞态条件

## 问题描述
当多个并发请求同时收到401错误时，每个请求都会尝试刷新token，导致多个刷新请求并发执行。

## 严重级别
**高** - 需要谨慎修复（涉及认证逻辑）

## 受影响的文件
- `client/src/utils/request.ts`
  - 行号: 216-291, 528-614

## 漏洞代码

### 位置: request.ts 第528-614行
```typescript
// ❌ 多个请求可能同时触发token刷新
if (isTokenExpired) {
  console.warn('🔄 尝试自动刷新token...');

  try {
    const refreshToken = localStorage.getItem('kindergarten_refresh_token') || localStorage.getItem('refreshToken');

    if (refreshToken) {
      // ⚠️ 没有检查是否已经有刷新请求在进行
      const refreshResponse = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });
      // ...
    }
  }
}
```

## 问题分析

1. **竞态条件**: 多个请求同时收到401，每个都尝试刷新token
2. **重复请求**: 造成不必要的网络请求
3. **token失效**: 可能导致某些请求失败
4. **服务器负载**: 增加不必要的负载

## 修复方案（保持向后兼容）

### 步骤 1: 添加Token刷新锁机制

在 `client/src/utils/request.ts` 中添加：

```typescript
// ================================
// Token刷新锁机制
// ================================

/**
 * 刷新状态管理
 */
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * 订阅token刷新事件
 */
function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

/**
 * token刷新完成后通知所有订阅者
 */
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

/**
 * 刷新token（带锁）
 */
async function refreshTokenWithLock(): Promise<string> {
  // 如果已经在刷新，等待刷新完成
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((token) => {
        resolve(token);
      });
    });
  }

  // 开始刷新
  isRefreshing = true;

  try {
    const refreshToken = localStorage.getItem('kindergarten_refresh_token') || localStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new Error('没有可用的refresh token');
    }

    const refreshUrl = getApiBaseUrl() + '/auth/refresh';

    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      throw new Error('刷新token失败');
    }

    const data = await response.json();

    if (!data.success || !data.data.accessToken) {
      throw new Error('刷新token响应格式错误');
    }

    const newToken = data.data.accessToken;
    const newRefreshToken = data.data.refreshToken;

    // 保存新token
    localStorage.setItem('kindergarten_token', newToken);
    if (newRefreshToken) {
      localStorage.setItem('kindergarten_refresh_token', newRefreshToken);
    }

    // 通知所有订阅者
    onTokenRefreshed(newToken);

    return newToken;
  } finally {
    isRefreshing = false;
  }
}
```

### 步骤 2: 修改401处理逻辑

**修复前：**
```typescript
if (isTokenExpired) {
  // 直接刷新token
  const refreshResponse = await fetch(refreshUrl, {...});
  // ...
}
```

**修复后：**
```typescript
if (isTokenExpired) {
  try {
    // 使用锁机制刷新token
    const newToken = await refreshTokenWithLock();

    // 使用新token重试原请求
    config.headers['Authorization'] = `Bearer ${newToken}`;

    return request(config);
  } catch (error) {
    // 刷新失败，清除token并跳转登录
    localStorage.removeItem('kindergarten_token');
    localStorage.removeItem('kindergarten_refresh_token');

    // 跳转登录页
    if (!isRedirectingToLogin) {
      isRedirectingToLogin = true;
      router.push('/login').finally(() => {
        setTimeout(() => {
          isRedirectingToLogin = false;
        }, 1000);
      });
    }

    return Promise.reject(error);
  }
}
```

### 步骤 3: 保持现有API兼容

为了确保不影响现有代码，我们保持：

1. **localStorage存储方式不变**
2. **token获取方式不变**
3. **刷新API调用方式不变**

只是添加了锁机制来防止并发刷新。

### 步骤 4: 添加可选的Cookie存储

为了提供更安全的选项，添加环境变量控制：

```typescript
// 在文件顶部添加
const TOKEN_STORAGE = import.meta.env.VITE_TOKEN_STORAGE || 'localStorage'; // 默认保持localStorage

// 修改token保存/获取逻辑
function getToken(): string | null {
  if (TOKEN_STORAGE === 'cookie') {
    // 从cookie获取（需要后端配置httpOnly）
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('kindergarten_token='))
      ?.split('=')[1] || null;
  }
  return localStorage.getItem('kindergarten_token') || localStorage.getItem('token');
}

function saveToken(token: string, refreshToken?: string) {
  if (TOKEN_STORAGE === 'cookie') {
    // Cookie由后端设置，前端无需操作
    return;
  }
  localStorage.setItem('kindergarten_token', token);
  if (refreshToken) {
    localStorage.setItem('kindergarten_refresh_token', refreshToken);
  }
}
```

### 步骤 5: 环境变量配置

在 `client/.env` 中添加（可选）：

```bash
# Token存储方式：localStorage 或 cookie
# 默认: localStorage（保持现有行为）
VITE_TOKEN_STORAGE=localStorage
```

## 验证步骤

### 1. 单元测试
```typescript
describe('Token刷新锁机制', () => {
  it('应该防止并发刷新', async () => {
    const promises = [];

    // 模拟3个并发请求
    for (let i = 0; i < 3; i++) {
      promises.push(refreshTokenWithLock());
    }

    const results = await Promise.all(promises);

    // 所有请求应该返回相同的token
    expect(results[0]).toBe(results[1]);
    expect(results[1]).toBe(results[2]);
  });

  it('应该依次处理刷新请求', async () => {
    let refreshCount = 0;

    // 第一次刷新
    const p1 = refreshTokenWithLock();
    await new Promise(resolve => setTimeout(resolve, 100));

    // 第二次刷新（应该等待第一次完成）
    const p2 = refreshTokenWithLock();

    await Promise.all([p1, p2]);

    // 应该只刷新了一次
    // (需要mock refreshTokenWithLock 的实现)
  });
});
```

### 2. 手动测试

1. **测试并发刷新**：
   ```javascript
   // 在浏览器控制台执行
   const promises = [];
   for (let i = 0; i < 5; i++) {
     promises.push(fetch('/api/users').then(r => r.json()));
   }
   Promise.all(promises);
   ```

2. **测试刷新失败处理**：
   ```javascript
   // 清除refresh token
   localStorage.removeItem('kindergarten_refresh_token');
   // 发送请求，应该跳转登录
   fetch('/api/users');
   ```

3. **测试本地调试**：
   - 确保token刷新正常工作
   - 确保并发请求正确处理
   - 确保刷新失败正确跳转

## 本地调试保证

### 兼容性检查

- ✅ 保持localStorage存储方式（默认）
- ✅ 保持现有API调用方式
- ✅ 保持刷新API端点不变
- ✅ 添加的锁机制是透明的，不影响现有功能

### 环境变量

```bash
# 开发环境使用默认配置即可
VITE_TOKEN_STORAGE=localStorage
```

### 回滚方案

如果修复后出现问题，可以通过以下方式回滚：

1. 设置环境变量：
   ```bash
   VITE_TOKEN_STORAGE=localStorage
   ```

2. 或者直接移除锁机制代码，恢复原有逻辑

## 修复完成检查清单

- [ ] Token刷新锁机制已实现
- [ ] 订阅者模式已实现
- [ ] 401处理逻辑已更新
- [ ] 可选的Cookie存储已添加
- [ ] 环境变量配置已添加
- [ ] 单元测试已通过
- [ ] 手动测试已通过
- [ ] 本地调试正常工作
- [ ] 向后兼容性已确认

## 风险评估

- **风险级别**: 中
- **影响范围**: Token刷新逻辑
- **回滚难度**: 低（保持向后兼容）
- **本地调试影响**: 无（默认行为不变）

---

**修复时间估计**: 3-4 小时
**测试时间估计**: 2-3 小时
**总时间估计**: 5-7 小时
