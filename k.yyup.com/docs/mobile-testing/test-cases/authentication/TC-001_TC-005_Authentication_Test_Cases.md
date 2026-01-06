# 移动端认证和权限测试用例

## 概述

本文档包含移动端认证和权限系统的详细测试用例，覆盖用户登录、权限控制、设备检测、令牌管理和安全防护等功能模块。

## 测试环境配置

- **设备环境**: 移动端设备 (Mobile/iOS/Android)
- **浏览器环境**: Chrome Mobile, Safari Mobile
- **网络环境**: 4G/5G/WiFi
- **屏幕尺寸**: 375px - 414px 宽度

---

## TC-001: 用户登录功能测试

### 测试目标
验证移动端用户登录功能的完整性和稳定性，包括表单验证、API调用、错误处理和响应式体验。

### 测试优先级
**高优先级** - 核心功能

### 测试步骤

#### 步骤1: 页面加载验证
1. 在移动设备浏览器中访问 `http://localhost:5173/mobile/login`
2. 验证登录页面完整加载
3. 检查页面元素响应式显示

**预期结果:**
- ✅ 页面加载时间 < 3秒
- ✅ 登录表单完整显示（用户名、密码输入框、登录按钮）
- ✅ 移动端适配良好，无横向滚动条
- ✅ 无控制台错误和警告

**验证代码:**
```javascript
// 页面加载验证
const loadTime = performance.now();
expect(loadTime).toBeLessThan(3000);

// 表单元素存在性验证
const usernameInput = document.querySelector('input[type="text"], input[name="username"], input[placeholder*="用户名"], input[placeholder*="账号"]');
const passwordInput = document.querySelector('input[type="password"]');
const loginButton = document.querySelector('button[type="submit"], button:contains("登录"), .login-btn');

expect(usernameInput).toBeTruthy();
expect(passwordInput).toBeTruthy();
expect(loginButton).toBeTruthy();
```

#### 步骤2: 表单验证测试
1. 用户名输入框为空时点击登录按钮
2. 密码输入框为空时点击登录按钮
3. 输入无效邮箱格式（如果使用邮箱登录）
4. 输入过短的密码（少于6位）
5. 输入过长的用户名或密码

**预期结果:**
- ✅ 空字段显示错误提示："请输入用户名" / "请输入密码"
- ✅ 无效邮箱格式显示错误提示："请输入有效的邮箱地址"
- ✅ 过短密码显示错误提示："密码长度不能少于6位"
- ✅ 过长输入显示长度限制提示
- ✅ 错误提示样式符合移动端设计规范

**验证代码:**
```javascript
// 空字段验证
const usernameInput = document.querySelector('input[name="username"]');
const passwordInput = document.querySelector('input[name="password"]');

// 测试用户名为空
usernameInput.value = '';
loginButton.click();
const usernameError = document.querySelector('.error-message, .validation-error');
expect(usernameError.textContent).toContain('请输入用户名');

// 测试密码为空
usernameInput.value = 'testuser';
passwordInput.value = '';
loginButton.click();
const passwordError = document.querySelector('.error-message, .validation-error');
expect(passwordError.textContent).toContain('请输入密码');
```

#### 步骤3: 成功登录测试
1. 输入有效的用户名: `test_parent`
2. 输入有效的密码: `password123`
3. 点击登录按钮
4. 等待登录响应

**预期结果:**
- ✅ 登录按钮显示加载状态
- ✅ API调用正确发送到 `/api/auth/login`
- ✅ 响应状态码为 200
- ✅ 响应数据包含必要字段
- ✅ 自动跳转到移动端首页 `/mobile/centers`
- ✅ JWT令牌正确存储到localStorage

**严格验证要求:**
```javascript
const result = await loginAPI({
  username: 'test_parent',
  password: 'password123'
});

// 1. 验证响应结构
expect(result.success).toBe(true);
expect(result.data).toBeDefined();

// 2. 验证必填字段
const requiredFields = ['token', 'user', 'permissions'];
const validation = validateRequiredFields(result.data, requiredFields);
expect(validation.valid).toBe(true);

// 3. 验证字段类型
const typeValidation = validateFieldTypes(result.data, {
  token: 'string',
  user: 'object',
  permissions: 'array'
});
expect(typeValidation.valid).toBe(true);

// 4. 验证用户对象字段
const userFields = ['id', 'username', 'role', 'email'];
const userValidation = validateRequiredFields(result.data.user, userFields);
expect(userValidation.valid).toBe(true);

// 5. 验证JWT令牌格式
expect(result.data.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
```

#### 步骤4: 登录失败测试
1. 输入不存在的用户名: `nonexistent_user`
2. 输入错误的密码: `wrongpassword`
3. 点击登录按钮
4. 验证错误处理

**预期结果:**
- ✅ 显示友好的错误提示："用户名或密码错误"
- ✅ 登录按钮恢复正常状态
- ✅ 不跳转页面
- ✅ 不保存任何数据到localStorage
- ✅ 无控制台错误

**验证代码:**
```javascript
const result = await loginAPI({
  username: 'nonexistent_user',
  password: 'wrongpassword'
});

// 验证失败响应
expect(result.success).toBe(false);
expect(result.message).toContain('用户名或密码错误');

// 验证没有数据保存
expect(localStorage.getItem('auth_token')).toBeNull();
expect(localStorage.getItem('user_info')).toBeNull();
```

#### 步骤5: 网络异常测试
1. 断开网络连接
2. 输入有效的登录信息
3. 点击登录按钮
4. 验证网络错误处理

**预期结果:**
- ✅ 显示网络错误提示："网络连接失败，请检查网络设置"
- ✅ 提供重试按钮
- ✅ 登录按钮恢复正常状态
- ✅ 不跳转页面

**验证代码:**
```javascript
// 模拟网络错误
mockNetworkFailure();

const result = await loginAPI({
  username: 'test_parent',
  password: 'password123'
});

expect(result.success).toBe(false);
expect(result.message).toContain('网络连接失败');

// 验证重试功能
const retryButton = document.querySelector('.retry-button');
expect(retryButton).toBeTruthy();
```

### 测试数据

| 测试场景 | 用户名 | 密码 | 预期结果 |
|---------|--------|------|----------|
| 成功登录 - 家长 | `test_parent` | `password123` | 登录成功，跳转到家长端 |
| 成功登录 - 教师 | `test_teacher` | `password123` | 登录成功，跳转到教师端 |
| 用户不存在 | `nonexistent_user` | `password123` | 显示错误提示 |
| 密码错误 | `test_parent` | `wrongpassword` | 显示错误提示 |
| 空用户名 | `` | `password123` | 显示验证错误 |
| 空密码 | `test_parent` | `` | 显示验证错误 |

### 元素覆盖清单

- [ ] 登录页面容器 `.login-container` 或 `.mobile-login`
- [ ] 用户名输入框 `input[name="username"]` 或 `input[placeholder*="用户名"]`
- [ ] 密码输入框 `input[name="password"]` 或 `input[placeholder*="密码"]`
- [ ] 登录按钮 `button[type="submit"]` 或 `.login-btn`
- [ ] 错误提示容器 `.error-message` 或 `.validation-error`
- [ ] 加载状态指示器 `.loading` 或 `.spinner`
- [ ] 记住我复选框 `input[name="remember"]` 或 `.remember-checkbox`
- [ ] 忘记密码链接 `.forgot-password` 或 `a[href*="forgot"]`
- [ ] 注册链接 `.register-link` 或 `a[href*="register"]`

### 性能要求

- **首次加载时间**: < 3秒
- **表单响应时间**: < 100ms
- **登录响应时间**: < 2秒
- **错误显示时间**: < 200ms

### 兼容性要求

- **iOS Safari**: iOS 12.0+
- **Android Chrome**: Android 7.0+
- **微信浏览器**: 支持最新版本
- **响应式适配**: 375px - 414px 宽度

---

## TC-002: 角色权限控制测试

### 测试目标
验证基于角色的权限控制系统，确保不同角色用户只能访问授权的页面和功能。

### 测试优先级
**高优先级** - 安全关键功能

### 测试步骤

#### 步骤1: 家长角色权限验证
1. 使用家长账号登录: `test_parent` / `password123`
2. 访问家长授权页面: `/mobile/centers`
3. 访问管理后台页面: `/mobile/admin/dashboard`
4. 验证权限控制结果

**预期结果:**
- ✅ 可以访问家长授权页面
- ✅ 访问管理后台时被重定向到无权限页面
- ✅ 显示友好的权限提示："您没有权限访问此页面"
- ✅ 返回首页按钮可用

**严格验证要求:**
```javascript
// 家长登录后的权限验证
await loginAs('test_parent', 'password123');

// 验证可以访问的页面
const response1 = await accessPage('/mobile/centers');
expect(response1.status).toBe(200);

// 验证无权限访问的页面
const response2 = await accessPage('/mobile/admin/dashboard');
expect(response2.redirected).toBe(true);
expect(response2.url).toContain('/unauthorized');

// 验证权限提示信息
const pageContent = response2.document.querySelector('.unauthorized-message');
expect(pageContent.textContent).toContain('您没有权限访问此页面');
```

#### 步骤2: 教师角色权限验证
1. 使用教师账号登录: `test_teacher` / `password123`
2. 访问教师授权页面: `/mobile/centers/activity-center`
3. 访问家长专属页面: `/mobile/parent/profile`
4. 访问系统管理页面: `/mobile/system/users`

**预期结果:**
- ✅ 可以访问活动中心页面
- ✅ 无法访问家长专属功能
- ✅ 无法访问系统管理功能
- ✅ 显示相应的权限错误提示

#### 步骤3: 管理员角色权限验证
1. 使用管理员账号登录: `test_admin` / `password123`
2. 访问所有移动端页面
3. 验证管理员的完整权限

**预期结果:**
- ✅ 可以访问所有移动端页面
- ✅ 可以访问管理功能
- ✅ 权限验证全部通过

#### 步骤4: 权限刷新测试
1. 登录用户账号
2. 在后台修改用户权限
3. 刷新页面
4. 验证权限更新

**预期结果:**
- ✅ 权限更新后立即生效
- ✅ 不需要重新登录
- ✅ 旧权限被撤销
- ✅ 新权限生效

**验证代码:**
```javascript
// 权限更新验证
const initialPermissions = await getUserPermissions();
await updateUserPermissions(userId, newPermissions);
await refreshPage();

const updatedPermissions = await getUserPermissions();
expect(updatedPermissions).not.toEqual(initialPermissions);
expect(updatedPermissions).toEqual(newPermissions);
```

### 角色权限矩阵

| 页面路径 | 家长 | 教师 | 管理员 | 预期结果 |
|---------|------|------|--------|----------|
| `/mobile/centers` | ✅ | ✅ | ✅ | 所有角色可访问 |
| `/mobile/centers/activity-center` | ❌ | ✅ | ✅ | 教师+管理员可访问 |
| `/mobile/centers/parent-center` | ✅ | ❌ | ✅ | 家长+管理员可访问 |
| `/mobile/admin/dashboard` | ❌ | ❌ | ✅ | 仅管理员可访问 |
| `/mobile/system/settings` | ❌ | ❌ | ✅ | 仅管理员可访问 |

### 元素覆盖清单

- [ ] 权限检查中间件
- [ ] 路由守卫配置
- [ ] 无权限提示组件 `.unauthorized-message`
- [ ] 权限刷新API接口
- [ ] 角色切换功能
- [ ] 权限缓存机制
- [ ] 错误页面 `.error-page`

### API验证要求

```javascript
// 权限验证API响应结构
const permissionResponse = {
  success: true,
  data: {
    permissions: ['mobile:centers:read', 'mobile:parent:read'],
    roles: ['parent'],
    routes: ['/mobile/centers', '/mobile/parent']
  }
};

// 必须验证的字段
const requiredFields = ['permissions', 'roles', 'routes'];
const validation = validateRequiredFields(permissionResponse.data, requiredFields);
expect(validation.valid).toBe(true);

// 类型验证
const typeValidation = validateFieldTypes(permissionResponse.data, {
  permissions: 'array',
  roles: 'array',
  routes: 'array'
});
expect(typeValidation.valid).toBe(true);
```

---

## TC-003: 设备检测和路由分离测试

### 测试目标
验证移动设备检测和路由分离机制，确保移动端用户正确跳转到移动端路由。

### 测试优先级
**中优先级** - 用户体验优化

### 测试步骤

#### 步骤1: 移动设备检测测试
1. 在移动设备浏览器中访问根路径 `/`
2. 验证设备检测功能
3. 确认自动跳转到移动端路由

**预期结果:**
- ✅ 自动检测到移动设备
- ✅ 跳转到移动端首页 `/mobile/centers`
- ✅ 不显示PC端布局
- ✅ 移动端导航正常工作

**验证代码:**
```javascript
// 设备检测验证
const userAgent = navigator.userAgent;
const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
expect(isMobile).toBe(true);

// 路由跳转验证
await navigateTo('/');
expect(window.location.pathname).toBe('/mobile/centers');
```

#### 步骤2: 桌面设备访问移动端路由测试
1. 在桌面浏览器中直接访问移动端路由
2. 验证路由访问控制
3. 检查响应式适配

**预期结果:**
- ✅ 可以访问移动端路由
- ✅ 显示桌面适配的移动端界面
- ✅ 功能正常使用
- ✅ 性能良好

#### 步骤3: 平板设备适配测试
1. 在平板设备（iPad）中访问应用
2. 验证响应式布局
3. 测试触控操作

**预期结果:**
- ✅ 显示适合平板的布局
- ✅ 触控操作流畅
- ✅ 图标和按钮大小适中
- ✅ 无横向滚动条

#### 步骤4: 设备切换测试
1. 使用开发者工具切换设备类型
2. 验证动态路由调整
3. 测试缓存机制

**预期结果:**
- ✅ 设备切换时路由正确调整
- ✅ 页面缓存机制正常工作
- ✅ 无数据丢失
- ✅ 用户体验流畅

### 设备检测配置

| 设备类型 | User Agent关键字 | 路由前缀 | 布局类型 |
|---------|------------------|----------|----------|
| 手机 | Mobile, Android, iPhone | /mobile | 移动端布局 |
| 平板 | iPad, Tablet | /mobile | 平板适配布局 |
| 桌面 | 无移动端关键字 | / | PC端布局 |

### 元素覆盖清单

- [ ] 设备检测工具函数 `isMobileDevice()`
- [ ] 路由前缀配置
- [ ] 响应式布局组件
- [ ] 移动端导航组件
- [ ] 触控事件处理
- [ ] 屏幕尺寸检测
- [ ] 设备方向检测

---

## TC-004: JWT令牌管理测试

### 测试目标
验证JWT令牌的生成、存储、验证和刷新机制，确保安全性和可靠性。

### 测试优先级
**高优先级** - 安全关键功能

### 测试步骤

#### 步骤1: 令牌生成和存储测试
1. 执行用户登录
2. 验证JWT令牌生成
3. 检查令牌存储机制

**预期结果:**
- ✅ 生成有效的JWT令牌
- ✅ 令牌正确存储到localStorage
- ✅ 令牌格式符合标准（三段式）
- ✅ 包含必要的声明信息

**严格验证要求:**
```javascript
// 登录后验证令牌
const loginResult = await loginAPI(credentials);

// 验证令牌生成
expect(loginResult.data.token).toBeDefined();
expect(typeof loginResult.data.token).toBe('string');

// 验证令牌格式（三段式JWT）
const tokenParts = loginResult.data.token.split('.');
expect(tokenParts.length).toBe(3);

// 验证令牌存储
expect(localStorage.getItem('auth_token')).toBe(loginResult.data.token);

// 验证令牌内容
const tokenPayload = JSON.parse(atob(tokenParts[1]));
const payloadValidation = validateRequiredFields(tokenPayload, [
  'userId', 'username', 'role', 'exp', 'iat'
]);
expect(payloadValidation.valid).toBe(true);
```

#### 步骤2: 令牌验证测试
1. 使用有效令牌访问受保护API
2. 验证令牌有效性检查
3. 测试令牌解析功能

**预期结果:**
- ✅ 有效令牌正常访问API
- ✅ 令牌过期时自动处理
- ✅ 令牌格式错误时拒绝访问
- ✅ 令牌解析正确获取用户信息

#### 步骤3: 令牌刷新测试
1. 使用即将过期的令牌
2. 验证自动刷新机制
3. 测试无感刷新体验

**预期结果:**
- ✅ 令牌即将过期时自动刷新
- ✅ 刷新过程用户无感知
- ✅ 新令牌正确替换旧令牌
- ✅ 刷新失败时提示用户重新登录

#### 步骤4: 令牌失效处理测试
1. 使用过期令牌访问API
2. 使用无效令牌访问API
3. 验证错误处理机制

**预期结果:**
- ✅ 过期令牌被拒绝访问
- ✅ 自动跳转到登录页面
- ✅ 清除本地存储的无效令牌
- ✅ 显示友好的错误提示

**验证代码:**
```javascript
// 过期令牌处理验证
localStorage.setItem('auth_token', 'expired_token');
const response = await accessProtectedAPI('/mobile/user/profile');

// 验证自动登出
expect(response.success).toBe(false);
expect(window.location.pathname).toBe('/mobile/login');
expect(localStorage.getItem('auth_token')).toBeNull();
```

#### 步骤5: 令牌安全性测试
1. 检查令牌存储位置安全性
2. 验证令牌传输加密
3. 测试XSS防护

**预期结果:**
- ✅ 令牌存储在安全的localStorage中
- ✅ API调用使用HTTPS传输
- ✅ 防止XSS攻击窃取令牌
- ✅ 敏感信息不存储在令牌中

### 令牌配置要求

```javascript
const jwtConfig = {
  secret: process.env.JWT_SECRET, // 必须使用环境变量
  expiresIn: '2h', // 2小时过期
  algorithm: 'HS256', // 安全的签名算法
  issuer: 'kinder-app', // 发行者
  audience: 'mobile-users' // 受众
};
```

### 令牌声明验证

| 声明名称 | 是否必需 | 验证规则 |
|---------|----------|----------|
| userId | 必需 | 有效的用户ID |
| username | 必需 | 用户名 |
| role | 必需 | 有效的角色枚举值 |
| exp | 必需 | 过期时间戳 |
| iat | 必需 | 签发时间戳 |
| iss | 必需 | 发行者标识 |
| aud | 必需 | 受众标识 |

### 元素覆盖清单

- [ ] JWT令牌生成函数
- [ ] 令牌存储管理
- [ ] 令牌验证中间件
- [ ] 自动刷新机制
- [ ] 令牌清理功能
- [ ] 安全存储实现
- [ ] 错误处理机制

---

## TC-005: 安全登录防护测试

### 测试目标
验证登录安全防护机制，包括防暴力破解、CSRF防护、会话管理等安全功能。

### 测试优先级
**高优先级** - 安全关键功能

### 测试步骤

#### 步骤1: 暴力破解防护测试
1. 连续5次输入错误密码
2. 验证账户锁定机制
3. 测试解锁时间限制

**预期结果:**
- ✅ 5次失败后账户被锁定
- ✅ 显示账户锁定提示："账户已锁定，请15分钟后再试"
- ✅ 锁定期间拒绝所有登录尝试
- ✅ 15分钟后自动解锁

**验证代码:**
```javascript
// 暴力破解防护测试
const maxAttempts = 5;
for (let i = 0; i < maxAttempts; i++) {
  const result = await loginAPI('test_user', 'wrong_password');
  expect(result.success).toBe(false);
  expect(result.message).toContain('用户名或密码错误');
}

// 第6次尝试应该被锁定
const lockResult = await loginAPI('test_user', 'wrong_password');
expect(lockResult.success).toBe(false);
expect(lockResult.message).toContain('账户已锁定');
expect(lockResult.data.lockedUntil).toBeDefined();
```

#### 步骤2: CSRF防护测试
1. 检查CSRF令牌生成
2. 验证表单提交时的令牌验证
3. 测试CSRF攻击防护

**预期结果:**
- ✅ 每个表单都包含CSRF令牌
- ✅ 令牌验证失败时拒绝请求
- ✅ 令牌具有时效性
- ✅ 防止跨站请求伪造攻击

#### 步骤3: 会话管理测试
1. 登录后验证会话创建
2. 多设备登录测试
3. 会话超时处理

**预期结果:**
- ✅ 创建安全的会话记录
- ✅ 支持多设备同时登录
- ✅ 会话超时后自动登出
- ✅ 异地登录时发送安全提醒

#### 步骤4: 密码安全策略测试
1. 测试弱密码拒绝
2. 验证密码复杂度要求
3. 检查密码历史记录

**预期结果:**
- ✅ 拒绝过于简单的密码
- ✅ 强制密码复杂度要求
- ✅ 禁止使用最近3次的旧密码
- ✅ 提供密码强度提示

#### 步骤5: 登录日志审计测试
1. 执行多次登录操作
2. 验证登录日志记录
3. 检查异常行为检测

**预期结果:**
- ✅ 记录所有登录尝试
- ✅ 记录IP地址和时间戳
- ✅ 检测并标记异常登录行为
- ✅ 提供登录历史查询功能

### 安全配置要求

```javascript
const securityConfig = {
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15分钟
  passwordMinLength: 6,
  passwordRequireSpecialChar: true,
  sessionTimeout: 30 * 60 * 1000, // 30分钟
  csrfTokenExpiry: 60 * 60 * 1000, // 1小时
  enableLoginLog: true
};
```

### 安全事件处理

| 事件类型 | 检测阈值 | 处理方式 |
|---------|----------|----------|
| 连续失败登录 | 5次 | 账户锁定15分钟 |
| 异地登录 | 不同IP | 发送安全提醒 |
| 会话超时 | 30分钟 | 自动登出 |
| 暴力破解 | 10次/分钟 | IP封禁1小时 |
| CSRF攻击 | 令牌验证失败 | 拒绝请求 |

### 元素覆盖清单

- [ ] 登录限制计数器
- [ ] 账户锁定机制
- [ ] CSRF令牌管理
- [ ] 会话存储
- [ ] 安全日志记录
- [ ] 异常检测算法
- [ ] 安全提醒通知
- [ ] 密码策略验证

---

## 测试工具和环境

### 自动化测试框架
- **Vitest**: 单元测试和集成测试
- **Playwright**: 端到端测试（无头模式）
- **Jest**: 后端API测试

### 测试数据管理
- **测试用户账号**: 预配置的测试账号
- **Mock数据**: 使用固定测试数据
- **环境隔离**: 独立的测试环境

### 持续集成
- **自动化测试**: Git提交时触发
- **测试报告**: 生成详细的测试报告
- **覆盖率监控**: 确保测试覆盖率达标

### 测试执行命令

```bash
# 运行移动端认证测试
npm run test:mobile:auth

# 运行所有移动端测试
npm run test:mobile:all

# 生成测试报告
npm run test:mobile:report

# 覆盖率检查
npm run test:mobile:coverage
```

---

## 验收标准

### 功能验收标准
- [ ] 所有测试用例通过
- [ ] 无控制台错误和警告
- [ ] 响应时间符合要求
- [ ] 兼容性测试通过

### 安全验收标准
- [ ] 安全扫描无高危漏洞
- [ ] 渗透测试通过
- [ ] 安全配置符合规范
- [ ] 审计日志完整

### 性能验收标准
- [ ] 页面加载时间 < 3秒
- [ ] API响应时间 < 2秒
- [ ] 移动端适配良好
- [ ] 无内存泄漏

---

**文档版本**: v1.0
**最后更新**: 2025-11-24
**状态**: 可执行测试用例