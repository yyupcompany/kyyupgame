# TC-021: 认证API集成测试

## 📋 测试概述

**测试目标**: 验证移动端认证相关API的完整集成，包括登录、登出、令牌刷新等功能
**测试类型**: API集成测试
**优先级**: 高
**预计执行时间**: 5-8分钟

---

## 🎯 测试场景

### 场景1: 用户登录集成测试
- **目标**: 验证完整的用户登录流程
- **覆盖功能**: 用户凭证验证、JWT令牌获取、用户信息返回

### 场景2: 令牌刷新集成测试
- **目标**: 验证JWT令牌自动刷新机制
- **覆盖功能**: 过期令牌检测、刷新令牌调用、新令牌应用

### 场景3: 权限验证集成测试
- **目标**: 验证基于角色的权限控制系统
- **覆盖功能**: 角色权限获取、路由权限验证、API权限检查

### 场景4: 登出集成测试
- **目标**: 验证完整的登出流程
- **覆盖功能**: 令牌清除、会话结束、状态重置

---

## 🔍 详细测试用例

### TC-021-01: 用户登录API集成测试

**测试步骤**:
1. 调用登录API接口
2. 验证请求参数格式
3. 检查响应数据结构
4. 验证JWT令牌获取
5. 确认用户信息完整性
6. 测试错误凭证处理

**API端点**: `POST /api/auth/login`

**严格验证要求**:
```typescript
// 1. 响应结构验证
const requiredFields = ['success', 'data', 'message'];
const validation = validateRequiredFields(response, requiredFields);
expect(validation.valid).toBe(true);

// 2. 令牌字段验证
const tokenFields = ['accessToken', 'refreshToken', 'tokenType', 'expiresIn'];
const tokenValidation = validateRequiredFields(response.data, tokenFields);
expect(tokenValidation.valid).toBe(true);

// 3. 用户信息字段验证
const userFields = ['id', 'username', 'email', 'role', 'permissions'];
const userValidation = validateRequiredFields(response.data.user, userFields);
expect(userValidation.valid).toBe(true);

// 4. 字段类型验证
const typeValidation = validateFieldTypes(response.data, {
  accessToken: 'string',
  refreshToken: 'string',
  tokenType: 'string',
  expiresIn: 'number',
  user: 'object'
});
expect(typeValidation.valid).toBe(true);

// 5. 令牌格式验证
expect(response.data.accessToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
expect(response.data.refreshToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
```

**预期结果**:
- ✅ 成功返回有效的JWT令牌
- ✅ 用户信息完整且格式正确
- ✅ 权限列表包含用户角色对应的权限
- ✅ 令牌过期时间合理（通常24小时）
- ✅ 错误凭证返回401状态码和明确错误信息

### TC-021-02: 令牌刷新API集成测试

**测试步骤**:
1. 使用过期令牌调用需要认证的API
2. 验证自动刷新机制触发
3. 检查刷新令牌API调用
4. 验证新令牌获取和应用
5. 确认原始API请求重试成功

**API端点**: `POST /api/auth/refresh-token`

**严格验证要求**:
```typescript
// 1. 刷新令牌响应验证
const refreshFields = ['accessToken', 'refreshToken', 'expiresIn'];
const refreshValidation = validateRequiredFields(refreshResponse.data, refreshFields);
expect(refreshValidation.valid).toBe(true);

// 2. 新令牌有效性验证
expect(refreshResponse.data.accessToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
expect(refreshResponse.data.expiresIn).toBeGreaterThan(0);

// 3. 原始请求重试验证
const originalResponse = await originalAPIRequest();
expect(originalResponse.success).toBe(true);

// 4. 请求头令牌更新验证
expect(lastRequestHeaders.Authorization).toContain(`Bearer ${refreshResponse.data.accessToken}`);
```

**预期结果**:
- ✅ 过期令牌自动检测并触发刷新
- ✅ 刷新令牌调用成功
- ✅ 新令牌自动应用到后续请求
- ✅ 原始API请求自动重试成功
- ✅ 刷新失败的令牌被清除

### TC-021-03: 权限验证API集成测试

**测试步骤**:
1. 获取用户权限列表
2. 验证权限数据结构
3. 测试权限检查功能
4. 验证不同角色的权限差异
5. 测试无权限访问处理

**API端点**: 
- `GET /api/auth/permissions`
- `POST /api/auth/check-permission`

**严格验证要求**:
```typescript
// 1. 权限列表结构验证
const permissionResponse = await getPermissions();
expect(Array.isArray(permissionResponse.data.permissions)).toBe(true);

// 2. 权限对象字段验证
if (permissionResponse.data.permissions.length > 0) {
  const permissionFields = ['id', 'name', 'code', 'resource', 'action'];
  const permissionValidation = validateRequiredFields(
    permissionResponse.data.permissions[0], 
    permissionFields
  );
  expect(permissionValidation.valid).toBe(true);
}

// 3. 权限检查响应验证
const checkResponse = await checkPermission({ resource: 'users', action: 'read' });
const checkFields = ['hasPermission', 'permission'];
const checkValidation = validateRequiredFields(checkResponse.data, checkFields);
expect(checkValidation.valid).toBe(true);

// 4. 权限类型验证
const typeValidation = validateFieldTypes(checkResponse.data, {
  hasPermission: 'boolean',
  permission: 'object'
});
expect(typeValidation.valid).toBe(true);
```

**预期结果**:
- ✅ 权限列表包含用户所有可用权限
- ✅ 权限检查功能正确返回布尔结果
- ✅ 不同角色用户权限列表差异正确
- ✅ 无权限访问返回403状态码
- ✅ 权限缓存机制正常工作

### TC-021-04: 登出API集成测试

**测试步骤**:
1. 调用登出API接口
2. 验证登出响应
3. 检查本地存储清除
4. 确认令牌失效
5. 测试登出后访问限制

**API端点**: `POST /api/auth/logout`

**严格验证要求**:
```typescript
// 1. 登出响应验证
const logoutResponse = await logout();
const logoutFields = ['success', 'message'];
const logoutValidation = validateRequiredFields(logoutResponse, logoutFields);
expect(logoutValidation.valid).toBe(true);

// 2. 本地存储清除验证
expect(localStorage.getItem('accessToken')).toBeNull();
expect(localStorage.getItem('refreshToken')).toBeNull();
expect(localStorage.getItem('user')).toBeNull();

// 3. 令牌失效验证
const protectedResponse = await callProtectedAPI();
expect(protectedResponse.status).toBe(401);

// 4. 全局状态重置验证
expect(store.state.auth.isAuthenticated).toBe(false);
expect(store.state.auth.user).toBeNull();
```

**预期结果**:
- ✅ 登出请求成功处理
- ✅ 本地存储中的认证信息完全清除
- ✅ 服务端令牌失效（如果有黑名单机制）
- ✅ 用户状态完全重置
- ✅ 登出后无法访问受保护资源

---

## 🚨 错误场景测试

### 场景1: 网络连接错误
- **模拟**: 网络断开或超时
- **验证**: 错误处理和用户提示
- **预期**: 显示网络错误提示，提供重试选项

### 场景2: 服务器错误
- **模拟**: 服务器500错误
- **验证**: 错误响应处理
- **预期**: 显示服务器错误提示，避免应用崩溃

### 场景3: 无效凭证
- **模拟**: 错误用户名或密码
- **验证**: 错误信息准确性
- **预期**: 返回401状态码和明确的错误信息

### 场景4: 令牌刷新失败
- **模拟**: 刷新令牌过期或无效
- **验证**: 自动重定向到登录页
- **预期**: 清除本地认证状态，强制重新登录

---

## 🔧 技术要求

### API请求格式
```typescript
// 登录请求
interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// 令牌刷新请求
interface RefreshTokenRequest {
  refreshToken: string;
}

// 权限检查请求
interface CheckPermissionRequest {
  resource: string;
  action: string;
}
```

### 响应格式验证
```typescript
// 登录响应
interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
      permissions: Permission[];
    };
  };
  message: string;
}
```

---

## 📊 测试数据

### 测试用户账户
```typescript
const testUsers = {
  admin: {
    username: 'admin@test.com',
    password: 'admin123',
    expectedRole: 'ADMIN',
    expectedPermissions: ['users:read', 'users:write', 'system:manage']
  },
  teacher: {
    username: 'teacher@test.com',
    password: 'teacher123',
    expectedRole: 'TEACHER',
    expectedPermissions: ['students:read', 'classes:read']
  },
  parent: {
    username: 'parent@test.com',
    password: 'parent123',
    expectedRole: 'PARENT',
    expectedPermissions: ['children:read', 'activities:read']
  }
};
```

---

## ✅ 验收标准

1. ✅ 所有API端点响应正常
2. ✅ 数据结构验证通过率100%
3. ✅ 字段类型验证通过率100%
4. ✅ 错误场景处理正确
5. ✅ 性能指标符合要求（响应时间<2s）
6. ✅ 安全性验证通过（令牌格式、有效期等）
7. ✅ 兼容性测试通过（不同设备和浏览器）

---

## 📝 测试报告模板

```typescript
interface AuthIntegrationTestReport {
  testId: 'TC-021';
  testDate: string;
  testEnvironment: string;
  results: {
    loginAPI: TestResult;
    tokenRefresh: TestResult;
    permissionCheck: TestResult;
    logout: TestResult;
    errorHandling: TestResult;
  };
  performance: {
    averageResponseTime: number;
    maxResponseTime: number;
    successRate: number;
  };
  security: {
    tokenFormatValid: boolean;
    tokenExpirationValid: boolean;
    permissionIsolationValid: boolean;
  };
  overallStatus: 'PASS' | 'FAIL' | 'PARTIAL';
}
```

---

## 🚀 执行指南

1. **环境准备**: 确保测试服务器和数据库正常运行
2. **数据准备**: 创建测试用户账户和权限配置
3. **工具准备**: 准备API测试工具和监控工具
4. **执行顺序**: 按照场景顺序执行，确保依赖关系正确
5. **结果记录**: 详细记录每个测试用例的执行结果
6. **问题跟踪**: 及时发现和记录发现的问题

---

**创建日期**: 2025-11-24  
**最后更新**: 2025-11-24  
**版本**: 1.0  
**状态**: 待执行