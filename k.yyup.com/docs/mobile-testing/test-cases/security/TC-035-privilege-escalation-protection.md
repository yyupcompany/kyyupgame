# TC-035: 权限越权防护测试

## 测试用例标识
- **用例编号**: TC-035
- **测试组**: 安全性和权限边界测试
- **测试类型**: 安全测试
- **优先级**: 严重

## 测试目标
验证移动端应用的权限控制系统，确保用户无法通过权限绕过、会话劫持、参数篡改等手段访问超出其权限范围的数据和功能，实现严格的访问控制。

## 测试前置条件
1. 应用已正常启动并运行在测试环境
2. 权限系统已配置并正常工作
3. 不同角色的测试账号已准备就绪
4. 动态权限系统已启用

## 测试步骤

### 步骤1: 垂直权限越权测试
1. **创建不同权限等级的测试账号**
   - 普通家长账号 (最低权限)
   - 教师账号 (中等权限)
   - 管理员账号 (最高权限)

2. **测试家长权限边界**
   - 使用家长账号登录
   - 尝试访问管理员功能
   ```
   测试URLs:
   - /mobile/admin/dashboard
   - /mobile/admin/users
   - /mobile/admin/settings
   - /api/admin/users/create
   - /api/system/maintenance
   ```

3. **验证权限拒绝**
   - 检查HTTP响应状态码(应为403)
   - 验证返回适当的错误信息
   - 确认未获取到管理员数据

4. **测试参数权限提升**
   ```javascript
   // 尝试通过参数修改权限级别
   const testPrivilegeEscalation = async () => {
     const requests = [
       {
         url: '/api/user/profile',
         method: 'PUT',
         body: { role: 'admin', userId: 'current-user-id' }
       },
       {
         url: '/api/permissions/grant',
         method: 'POST',
         body: { userId: 'current-user-id', permissions: ['admin'] }
       }
     ];

     for (const request of requests) {
       const response = await fetch(request.url, {
         method: request.method,
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(request.body)
       });
       expect(response.status).toBe(403);
     }
   };
   ```

### 步骤2: 水平权限越权测试
1. **测试同级别用户数据访问**
   - 使用家长A账号登录
   - 尝试访问家长B的子女信息
   ```
   测试API:
   - /api/students/other-parent-student-id
   - /api/parent/other-parent-id/children
   - /api/messages/conversation/other-user-id
   ```

2. **验证数据访问控制**
   ```javascript
   // 测试其他用户数据访问
   const testHorizontalPrivilege = async (currentUserId: string) => {
     const otherUserId = 'different-user-id';
     const testEndpoints = [
       `/api/user/${otherUserId}/profile`,
       `/api/parent/${otherUserId}/children`,
       `/api/students?parentId=${otherUserId}`,
       `/api/messages/${otherUserId}`
     ];

     for (const endpoint of testEndpoints) {
       const response = await fetch(endpoint);
       expect(response.status).toBe(403);

       const data = await response.json();
       expect(data.success).toBe(false);
       expect(data.error).toContain('permission');
     }
   };
   ```

3. **测试资源ID篡改**
   - 访问自己的数据记录正常ID
   - 尝试修改URL中的资源ID访问他人数据
   - 验证访问被拒绝

### 步骤3: 动态权限绕过测试
1. **测试权限检查绕过**
   - 直接访问API端点绕过前端检查
   - 伪造权限头信息
   ```
   测试Headers:
   - X-User-Role: admin
   - X-Permissions: ["admin", "system"]
   - Authorization: Bearer forged-token
   ```

2. **验证后端权限验证**
   ```javascript
   // 尝试伪造权限信息
   const testPermissionBypass = async () => {
     const forgedRequests = [
       {
         headers: { 'X-User-Role': 'admin' },
         endpoint: '/api/admin/users'
       },
       {
         headers: { 'X-Permissions': JSON.stringify(['admin']) },
         endpoint: '/api/system/settings'
       },
       {
         headers: { 'Authorization': 'Bearer forged-admin-token' },
         endpoint: '/api/dynamic-permissions/grant'
       }
     ];

     for (const req of forgedRequests) {
       const response = await fetch(req.endpoint, {
         headers: req.headers
       });
       expect(response.status).toBe(401); // 未授权
     }
   };
   ```

3. **测试权限缓存绕过**
   - 清除浏览器权限缓存
   - 使用旧的有效会话尝试权限升级
   - 验证权限重新检查机制

### 步骤4: 会话劫持防护测试
1. **测试会话固定攻击**
   - 使用正常账号登录获取会话ID
   - 尝试在不同用户中使用相同会话ID
   - 验证会话与用户绑定

2. **测试会话超时**
   - 登录后等待会话超时
   - 尝试使用过期会话进行敏感操作
   - 验证会话过期机制

3. **验证会话安全**
   ```javascript
   // 检查会话安全性
   const checkSessionSecurity = () => {
     // 检查会话Cookie
     const cookies = document.cookie.split(';');
     const sessionCookie = cookies.find(c => c.includes('session'));

     if (sessionCookie) {
       // 验证安全属性
       expect(sessionCookie).toContain('Secure');
       expect(sessionCookie).toContain('HttpOnly');
       expect(sessionCookie).toContain('SameSite');
     }

     // 检查会话ID复杂度
     const sessionId = sessionCookie?.split('=')[1];
     expect(sessionId?.length).toBeGreaterThan(20);
   };
   ```

### 步骤5: 功能权限边界测试
1. **测试教师权限限制**
   - 使用教师账号登录
   - 尝试执行只有管理员能执行的操作
   ```
   禁止操作:
   - 创建/删除用户账号
   - 修改系统设置
   - 访问财务数据
   - 查看其他教师班级数据
   ```

2. **测试家长权限限制**
   - 使用家长账号登录
   - 尝试访问超出家长权限的功能
   ```
   禁止操作:
   - 修改班级信息
   - 查看其他家庭信息
   - 访问教师管理功能
   - 执行系统管理操作
   ```

3. **验证动态权限系统**
   ```javascript
   // 测试动态权限验证
   const testDynamicPermissions = async (userId: string) => {
     // 检查用户当前权限
     const permissionsResponse = await fetch('/api/dynamic-permissions/user-permissions');
     const { permissions } = await permissionsResponse.json();

     // 尝试访问未授权的页面
     const unauthorizedPages = permissions.allRoutes.filter(route =>
       !permissions.allowedRoutes.includes(route.path)
     );

     for (const page of unauthorizedPages) {
       const response = await fetch(page.path);
       expect(response.status).toBe(403);
     }
   };
   ```

## 预期结果

### 正确行为
1. **权限拒绝**: 越权访问请求被拒绝(403状态码)
2. **会话安全**: 会话与用户正确绑定，防止劫持
3. **数据隔离**: 用户只能访问自己权限范围内的数据
4. **动态验证**: 每次请求都进行权限验证
5. **错误处理**: 返回适当的错误信息而不泄露系统信息

### 安全要求
1. **最小权限原则**: 用户只获得完成工作所需的最小权限
2. **权限继承**: 权限系统支持角色继承和组合
3. **审计日志**: 所有权限检查和越权尝试都被记录

## 严格验证要求

### 权限验证函数
```typescript
// 验证权限检查机制
const validatePermissionCheck = (userRole: string, requiredRole: string, hasAccess: boolean) => {
  const roleHierarchy = {
    'parent': 1,
    'teacher': 2,
    'admin': 3
  };

  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  const expectedAccess = userLevel >= requiredLevel;
  expect(hasAccess).toBe(expectedAccess);
};
```

### API响应验证
```typescript
// 验证权限拒绝响应
const validateForbiddenResponse = (response: any) => {
  validateRequiredFields(response, ['success', 'error', 'code']);
  validateFieldTypes(response, {
    success: 'boolean',
    error: 'string',
    code: 'string'
  });

  expect(response.success).toBe(false);
  expect(response.code).toBe('PERMISSION_DENIED');
  expect(response.error).toContain('permission');
};
```

### 数据访问控制验证
```typescript
// 验证数据访问控制
const validateDataAccessControl = (userId: string, dataOwnerId: string, data: any) => {
  if (userId !== dataOwnerId) {
    // 如果不是数据所有者，数据应该被脱敏或拒绝访问
    expect(data).toBe(null) || expect(data).toMatch(/^\*+/);
  } else {
    // 数据所有者应该能看到完整数据
    expect(data).not.toMatch(/^\*+/);
  }
};
```

## 测试数据

### 测试角色权限
```typescript
const testRoles = {
  parent: {
    permissions: [
      'view_own_children',
      'view_own_profile',
      'send_messages_to_teachers',
      'view_activities'
    ],
    restricted: [
      'view_all_students',
      'manage_users',
      'system_settings',
      'view_financial_data'
    ]
  },
  teacher: {
    permissions: [
      'view_class_students',
      'manage_class_activities',
      'send_messages',
      'view_teaching_materials'
    ],
    restricted: [
      'manage_other_classes',
      'system_administration',
      'view_all_parents',
      'financial_management'
    ]
  },
  admin: {
    permissions: [
      'manage_users',
      'system_settings',
      'view_all_data',
      'system_maintenance'
    ],
    restricted: []
  }
};
```

### 越权测试用例
```typescript
const privilegeEscalationTests = [
  {
    userRole: 'parent',
    targetEndpoint: '/api/admin/users',
    expectedStatus: 403,
    description: '家长访问管理员用户管理'
  },
  {
    userRole: 'teacher',
    targetEndpoint: '/api/system/settings',
    expectedStatus: 403,
    description: '教师访问系统设置'
  },
  {
    userRole: 'parent',
    targetEndpoint: '/api/students?classId=other-class',
    expectedStatus: 403,
    description: '家长访问其他班级学生'
  }
];
```

## 通过/失败标准

### 通过标准
- [ ] 所有越权访问尝试都被拒绝(403)
- [ ] 权限检查在每个请求中都执行
- [ ] 会话安全机制正常工作
- [ ] 数据访问控制正确实施
- [ ] 动态权限系统正常工作
- [ ] 错误响应格式正确
- [ ] 安全日志记录完整

### 失败标准
- [ ] 成功访问超出权限的资源
- [ ] 权限检查被绕过
- [ ] 会话劫持攻击成功
- [ ] 敏感数据泄露
- [ ] 权限验证不一致

## 测试环境要求

### 权限系统
- 动态权限系统已启用
- 角色权限配置完整
- 权限检查中间件正常工作

### 测试数据
- 不同角色的测试账号
- 完整的权限测试数据集
- 隔离的测试环境

## 风险评估

### 严重风险
- 权限绕过导致数据泄露
- 系统完全控制权丢失
- 业务数据被未授权修改

### 缓解措施
- 在隔离的测试环境执行
- 使用专门的测试账号
- 严格控制测试环境访问

## 相关文档
- [权限系统设计](../../../security/permission-system.md)
- [动态权限架构](../../../security/dynamic-permissions.md)
- [访问控制最佳实践](../../../security/access-control.md)

## 测试历史记录
| 测试日期 | 测试人员 | 测试结果 | 问题描述 | 解决状态 |
|----------|----------|----------|----------|----------|
| 2025-11-24 | Claude | 待测试 | - | - |