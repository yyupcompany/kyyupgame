# TC-032: CSRF令牌验证测试

## 测试用例标识
- **用例编号**: TC-032
- **测试组**: 安全性和权限边界测试
- **测试类型**: 安全测试
- **优先级**: 高

## 测试目标
验证移动端应用的跨站请求伪造(CSRF)防护机制，确保所有状态变更操作都有有效的CSRF令牌验证，防止恶意网站发起未授权请求。

## 测试前置条件
1. 应用已正常启动并运行在测试环境
2. 用户已登录并获取有效的会话
3. 测试环境已配置CSRF防护中间件
4. 浏览器开发者工具已准备就绪

## 测试步骤

### 步骤1: 正常CSRF令牌验证
1. **登录获取有效会话**
   - 访问移动端登录页面
   - 输入有效的用户名和密码
   - 成功登录获取访问令牌

2. **检查CSRF令牌是否存在**
   - 打开浏览器开发者工具
   - 检查Application -> Cookies中的CSRF令牌
   - 验证令牌格式和有效性

3. **执行正常操作验证令牌**
   - 导航到家长中心 -> 个人信息编辑
   - 修改用户信息并提交
   - 观察请求头中的CSRF令牌
   - 验证操作是否成功

### 步骤2: 缺失CSRF令牌测试
1. **手动移除CSRF令牌**
   - 在开发者工具中找到CSRF cookie
   - 手动删除CSRF令牌
   - 清除浏览器缓存中的相关令牌

2. **尝试执行状态变更操作**
   - 导航到设置页面
   - 尝试修改用户设置
   - 提交表单数据

3. **验证请求被拒绝**
   - 检查HTTP响应状态码
   - 验证返回的错误信息
   - 确认操作未被执行

### 步骤3: 无效CSRF令牌测试
1. **生成无效CSRF令牌**
   - 创建格式错误或过期的令牌
   - 或使用其他会话的令牌

2. **伪造恶意请求**
   ```javascript
   // 使用fetch发送伪造请求
   fetch('/api/user/profile', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'X-CSRF-Token': 'invalid-token-here'
     },
     body: JSON.stringify({
       nickname: 'Hacked User'
     })
   });
   ```

3. **验证防护机制**
   - 检查请求是否被拒绝
   - 验证错误响应格式
   - 确认用户数据未被修改

### 步骤4: 跨域CSRF攻击测试
1. **创建恶意测试页面**
   - 创建一个包含恶意表单的HTML页面
   - 模拟跨站请求伪造攻击

2. **在另一个域名下托管恶意页面**
   ```html
   <!-- malicious-site.com/attack.html -->
   <form action="http://localhost:3000/api/user/profile" method="POST" target="hiddenFrame">
     <input type="hidden" name="nickname" value="Hacked by CSRF">
     <input type="hidden" name="csrf_token" value="fake-token">
     <input type="submit" value="Click me">
   </form>
   <iframe name="hiddenFrame" style="display:none;"></iframe>
   ```

3. **从恶意页面发起请求**
   - 在已登录状态下访问恶意页面
   - 触发恶意表单提交
   - 观察请求结果

4. **验证攻击被阻止**
   - 检查目标应用是否拒绝请求
   - 验证用户数据未受影响
   - 查看安全日志记录

### 步骤5: AJAX请求CSRF测试
1. **测试AJAX请求CSRF保护**
   - 通过JavaScript发起异步请求
   - 故意省略或使用错误的CSRF令牌

2. **验证API端点保护**
   ```javascript
   // 测试没有CSRF令牌的AJAX请求
   const maliciousRequest = async () => {
     try {
       const response = await fetch('/api/user/settings', {
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json',
           // 故意不包含CSRF令牌
         },
         credentials: 'include',
         body: JSON.stringify({
           theme: 'dark',
           notifications: false
         })
       });

       console.log('Response status:', response.status);
       const result = await response.json();
       console.log('Response data:', result);
     } catch (error) {
       console.error('Request failed:', error);
     }
   };
   ```

3. **验证响应安全性**
   - 检查响应状态码应为403 Forbidden
   - 验证响应体包含安全相关信息
   - 确认操作未被执行

## 预期结果

### 正确行为
1. **令牌验证**: 所有状态变更请求必须包含有效的CSRF令牌
2. **请求拒绝**: 无效或缺失令牌的请求应被拒绝
3. **错误响应**: 返回403状态码和适当的错误信息
4. **日志记录**: 所有CSRF攻击尝试应被记录
5. **数据安全**: 用户数据不应被未授权修改

### 错误处理
1. **令牌过期**: 过期令牌应触发令牌刷新机制
2. **格式错误**: 格式错误的令牌应被立即拒绝
3. **跨域限制**: 跨域请求应受到严格限制

## 严格验证要求

### 响应结构验证
```typescript
// 验证CSRF错误响应结构
const validateCSRFErrorResponse = (response: any) => {
  validateRequiredFields(response, ['success', 'error', 'code']);
  validateFieldTypes(response, {
    success: 'boolean',
    error: 'string',
    code: 'string'
  });

  // 验证错误代码
  expect(response.success).toBe(false);
  expect(response.code).toBe('CSRF_INVALID');
  expect(response.error).toContain('CSRF');
};
```

### 令牌格式验证
```typescript
// 验证CSRF令牌格式
const validateCSRFToken = (token: string) => {
  expect(typeof token).toBe('string');
  expect(token.length).toBeGreaterThan(20);
  expect(token).toMatch(/^[a-zA-Z0-9_-]+$/);

  // 验证令牌包含足够的熵
  const entropy = token.length * Math.log2(token.length);
  expect(entropy).toBeGreaterThan(128);
};
```

### 请求拦截验证
```typescript
// 验证恶意请求被正确拦截
const verifyMaliciousRequestBlocked = async (endpoint: string, payload: any) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(payload)
  });

  expect(response.status).toBe(403);
  const errorData = await response.json();
  validateCSRFErrorResponse(errorData);
};
```

## 测试数据

### CSRF令牌示例
```typescript
const csrfTokens = {
  valid: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
  invalid: 'invalid-token-format',
  expired: 'expired-token-1234567890',
  malformed: '<script>alert("xss")</script>',
  empty: '',
  null: null as any
};
```

### 恶意请求数据
```typescript
const maliciousRequests = [
  {
    endpoint: '/api/user/profile',
    method: 'POST',
    payload: { nickname: 'Hacked User' },
    description: '修改用户昵称'
  },
  {
    endpoint: '/api/user/settings',
    method: 'PUT',
    payload: { theme: 'hacked', notifications: false },
    description: '修改用户设置'
  },
  {
    endpoint: '/api/user/password',
    method: 'POST',
    payload: { currentPassword: 'old', newPassword: 'hacked123' },
    description: '修改用户密码'
  }
];
```

## 通过/失败标准

### 通过标准
- [ ] 所有正常请求都包含有效CSRF令牌
- [ ] 缺失令牌的请求被拒绝(403)
- [ ] 无效令牌的请求被拒绝(403)
- [ ] 跨域攻击被成功阻止
- [ ] 错误响应格式正确
- [ ] 安全日志记录完整
- [ ] 用户数据保持安全

### 失败标准
- [ ] 无令牌请求被允许通过
- [ ] 无效令牌请求被允许执行
- [ ] 跨域攻击成功修改数据
- [ ] 错误响应不符合规范
- [ ] 安全日志缺失重要信息

## 测试环境要求

### 服务器配置
- 启用CSRF中间件
- 配置安全的令牌生成策略
- 设置适当的令牌过期时间

### 浏览器环境
- 支持SameSite Cookie属性
- 启用CORS安全策略
- 支持现代安全特性

### 网络条件
- 稳定的测试网络环境
- 能够模拟跨域请求

## 风险评估

### 高风险
- CSRF攻击可能导致数据泄露
- 用户信息被未授权修改
- 系统安全性受到威胁

### 缓解措施
- 在测试环境中进行所有CSRF测试
- 使用专门的测试账号
- 测试后恢复系统状态

## 相关文档
- [CSRF防护最佳实践](../../../security/csrf-prevention.md)
- [移动端安全架构](../../../security/mobile-security.md)
- [API安全规范](../../../security/api-security.md)

## 测试历史记录
| 测试日期 | 测试人员 | 测试结果 | 问题描述 | 解决状态 |
|----------|----------|----------|----------|----------|
| 2025-11-24 | Claude | 待测试 | - | - |