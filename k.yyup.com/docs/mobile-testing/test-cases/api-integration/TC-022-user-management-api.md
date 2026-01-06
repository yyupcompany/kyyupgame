# TC-022: 用户管理API集成测试

## 📋 测试概述

**测试目标**: 验证移动端用户管理相关API的完整集成，包括用户CRUD操作、角色管理、权限分配等功能
**测试类型**: API集成测试
**优先级**: 高
**预计执行时间**: 8-12分钟

---

## 🎯 测试场景

### 场景1: 用户列表获取集成测试
- **目标**: 验证用户列表分页获取功能
- **覆盖功能**: 分页查询、搜索过滤、排序功能

### 场景2: 用户详情获取集成测试
- **目标**: 验证单个用户详细信息获取
- **覆盖功能**: 用户基本信息、角色权限、关联数据

### 场景3: 用户创建集成测试
- **目标**: 验证新用户创建流程
- **覆盖功能**: 数据验证、角色分配、初始权限设置

### 场景4: 用户更新集成测试
- **目标**: 验证用户信息更新功能
- **覆盖功能**: 基本信息修改、角色变更、权限调整

### 场景5: 用户删除集成测试
- **目标**: 验证用户删除及相关数据清理
- **覆盖功能**: 软删除、关联数据处理、权限回收

---

## 🔍 详细测试用例

### TC-022-01: 用户列表API集成测试

**测试步骤**:
1. 调用用户列表API接口
2. 测试分页参数处理
3. 验证搜索过滤功能
4. 检查排序功能
5. 测试数据格式完整性

**API端点**: `GET /api/users`

**严格验证要求**:
```typescript
// 1. 响应结构验证
const requiredFields = ['success', 'data'];
const validation = validateRequiredFields(response, requiredFields);
expect(validation.valid).toBe(true);

// 2. 分页字段验证
const paginationFields = ['items', 'total', 'page', 'pageSize', 'totalPages'];
const paginationValidation = validateRequiredFields(response.data, paginationFields);
expect(paginationValidation.valid).toBe(true);

// 3. 列表项字段验证
if (response.data.items.length > 0) {
  const userFields = ['id', 'username', 'email', 'role', 'status', 'createdAt'];
  const itemValidation = validateRequiredFields(response.data.items[0], userFields);
  expect(itemValidation.valid).toBe(true);

  // 4. 字段类型验证
  const typeValidation = validateFieldTypes(response.data.items[0], {
    id: 'string',
    username: 'string',
    email: 'string',
    role: 'string',
    status: 'string',
    createdAt: 'string'
  });
  expect(typeValidation.valid).toBe(true);
}

// 5. 数组类型验证
expect(Array.isArray(response.data.items)).toBe(true);
expect(typeof response.data.total).toBe('number');
expect(typeof response.data.page).toBe('number');
```

**预期结果**:
- ✅ 返回分页格式的用户列表
- ✅ 分页参数正确处理
- ✅ 搜索和过滤功能正常
- ✅ 排序功能按指定字段排序
- ✅ 每个用户项包含完整的必要信息

### TC-022-02: 用户详情API集成测试

**测试步骤**:
1. 调用用户详情API接口
2. 验证返回数据完整性
3. 检查关联数据获取
4. 测试权限信息返回
5. 验证敏感信息脱敏

**API端点**: `GET /api/users/:id`

**严格验证要求**:
```typescript
// 1. 基本字段验证
const basicFields = ['id', 'username', 'email', 'role', 'status', 'profile'];
const basicValidation = validateRequiredFields(response.data, basicFields);
expect(basicValidation.valid).toBe(true);

// 2. 详细信息字段验证
const detailFields = ['createdAt', 'updatedAt', 'lastLoginAt', 'permissions'];
const detailValidation = validateRequiredFields(response.data, detailFields);
expect(detailValidation.valid).toBe(true);

// 3. 权限数据验证
if (response.data.permissions) {
  expect(Array.isArray(response.data.permissions)).toBe(true);
  if (response.data.permissions.length > 0) {
    const permissionFields = ['id', 'name', 'code', 'resource', 'action'];
    const permValidation = validateRequiredFields(
      response.data.permissions[0], 
      permissionFields
    );
    expect(permValidation.valid).toBe(true);
  }
}

// 4. 敏感信息脱敏验证
expect(response.data).not.toHaveProperty('password');
expect(response.data).not.toHaveProperty('salt');

// 5. 日期格式验证
const dateValidation = validateDateFormat(response.data.createdAt);
expect(dateValidation).toBe(true);
```

**预期结果**:
- ✅ 返回完整的用户详细信息
- ✅ 包含用户权限列表
- ✅ 敏感信息已脱敏处理
- ✅ 关联数据正确获取
- ✅ 日期格式标准化

### TC-022-03: 用户创建API集成测试

**测试步骤**:
1. 构造用户创建请求数据
2. 调用用户创建API接口
3. 验证数据验证规则
4. 检查用户创建结果
5. 确认默认权限分配

**API端点**: `POST /api/users`

**严格验证要求**:
```typescript
// 1. 创建响应验证
const createFields = ['success', 'data', 'message'];
const createValidation = validateRequiredFields(response, createFields);
expect(createValidation.valid).toBe(true);

// 2. 创建用户字段验证
const userFields = ['id', 'username', 'email', 'role', 'status'];
const createdUserValidation = validateRequiredFields(response.data.user, userFields);
expect(createdUserValidation.valid).toBe(true);

// 3. 默认值验证
expect(response.data.user.status).toBe('ACTIVE');
expect(response.data.user.role).toBeDefined();

// 4. 数据一致性验证
const getUserResponse = await getUser(response.data.user.id);
expect(getUserResponse.data.username).toBe(testUser.username);
expect(getUserResponse.data.email).toBe(testUser.email);

// 5. 权限分配验证
if (testUser.role) {
  const rolePermissions = await getRolePermissions(testUser.role);
  expect(Array.isArray(rolePermissions.data.permissions)).toBe(true);
}
```

**测试数据**:
```typescript
const testUser = {
  username: 'testuser_' + Date.now(),
  email: `test${Date.now()}@example.com`,
  password: 'TestPassword123!',
  role: 'TEACHER',
  profile: {
    firstName: 'Test',
    lastName: 'User',
    phone: '13800138000'
  }
};
```

**预期结果**:
- ✅ 用户创建成功且数据正确
- ✅ 数据验证规则生效
- ✅ 默认角色和权限正确分配
- ✅ 密码已加密存储
- ✅ 创建时间正确记录

### TC-022-04: 用户更新API集成测试

**测试步骤**:
1. 获取现有用户信息
2. 构造更新请求数据
3. 调用用户更新API接口
4. 验证更新结果
5. 检查权限变更生效

**API端点**: `PUT /api/users/:id`

**严格验证要求**:
```typescript
// 1. 更新响应验证
const updateFields = ['success', 'data', 'message'];
const updateValidation = validateRequiredFields(response, updateFields);
expect(updateValidation.valid).toBe(true);

// 2. 更新字段验证
const updatedFields = ['id', 'username', 'email', 'role', 'updatedAt'];
const updatedValidation = validateRequiredFields(response.data.user, updatedFields);
expect(updatedValidation.valid).toBe(true);

// 3. 数据变更验证
expect(response.data.user.email).toBe(updateData.email);
if (updateData.role) {
  expect(response.data.user.role).toBe(updateData.role);
}

// 4. 时间戳更新验证
const originalUser = await getUser(userId);
const updatedTime = new Date(response.data.user.updatedAt);
const originalTime = new Date(originalUser.data.updatedAt);
expect(updatedTime.getTime()).toBeGreaterThan(originalTime.getTime());

// 5. 权限变更验证
if (updateData.role) {
  const newPermissions = await getUserPermissions(userId);
  expect(Array.isArray(newPermissions.data.permissions)).toBe(true);
}
```

**预期结果**:
- ✅ 用户信息正确更新
- ✅ 部分更新功能正常
- ✅ 权限变更立即生效
- ✅ 更新时间戳正确记录
- ✅ 数据验证规则继续生效

### TC-022-05: 用户删除API集成测试

**测试步骤**:
1. 创建测试用户
2. 调用用户删除API接口
3. 验证删除操作结果
4. 检查数据清理情况
5. 确认权限回收

**API端点**: `DELETE /api/users/:id`

**严格验证要求**:
```typescript
// 1. 删除响应验证
const deleteFields = ['success', 'data', 'message'];
const deleteValidation = validateRequiredFields(response, deleteFields);
expect(deleteValidation.valid).toBe(true);

// 2. 删除确认验证
expect(response.data.deleted).toBe(true);
expect(response.data.userId).toBe(userId);

// 3. 用户状态验证（软删除）
const checkUserResponse = await getUser(userId);
expect(checkUserResponse.data.status).toBe('DELETED');

// 4. 权限回收验证
const permissionsResponse = await getUserPermissions(userId);
expect(permissionsResponse.data.permissions.length).toBe(0);

// 5. 关联数据处理验证
const relatedDataResponse = await getUserRelatedData(userId);
// 验证关联数据是否正确处理（转移或删除）
```

**预期结果**:
- ✅ 用户删除操作成功执行
- ✅ 用户状态更新为已删除
- ✅ 所有相关权限被回收
- ✅ 关联数据正确处理
- ✅ 删除操作可追溯

---

## 🚨 错误场景测试

### 场景1: 无效用户ID
- **模拟**: 使用不存在的用户ID
- **验证**: 错误响应格式
- **预期**: 返回404状态码和明确错误信息

### 场景2: 重复邮箱/用户名
- **模拟**: 创建已存在的邮箱或用户名
- **验证**: 数据验证错误处理
- **预期**: 返回400状态码和冲突字段信息

### 场景3: 权限不足
- **模拟**: 无权限用户尝试删除他人账号
- **验证**: 权限验证机制
- **预期**: 返回403状态码和权限错误信息

### 场景4: 数据验证失败
- **模拟**: 提交无效格式的用户数据
- **验证**: 数据验证规则
- **预期**: 返回400状态码和详细验证错误信息

---

## 🔧 技术要求

### API请求格式
```typescript
// 用户创建请求
interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
  };
}

// 用户更新请求
interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: string;
  status?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
  };
}
```

### 响应格式验证
```typescript
// 用户列表响应
interface UserListResponse {
  success: boolean;
  data: {
    items: User[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// 用户详情响应
interface UserDetailResponse {
  success: boolean;
  data: User & {
    permissions: Permission[];
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
  };
}
```

---

## 📊 测试数据

### 测试用户角色
```typescript
const testRoles = {
  ADMIN: {
    permissions: ['users:read', 'users:write', 'users:delete', 'system:manage'],
    maxUsers: 999
  },
  TEACHER: {
    permissions: ['students:read', 'classes:read', 'activities:read'],
    maxUsers: 100
  },
  PARENT: {
    permissions: ['children:read', 'activities:read'],
    maxUsers: 50
  }
};
```

---

## ✅ 验收标准

1. ✅ 所有用户管理API端点正常响应
2. ✅ 数据结构验证通过率100%
3. ✅ 字段类型验证通过率100%
4. ✅ 分页功能正确实现
5. ✅ 搜索过滤功能正常
6. ✅ 权限控制机制有效
7. ✅ 数据验证规则生效
8. ✅ 错误处理完整准确

---

## 📝 测试报告模板

```typescript
interface UserManagementAPITestReport {
  testId: 'TC-022';
  testDate: string;
  testEnvironment: string;
  results: {
    userList: TestResult;
    userDetail: TestResult;
    userCreation: TestResult;
    userUpdate: TestResult;
    userDeletion: TestResult;
    errorHandling: TestResult;
  };
  performance: {
    listResponseTime: number;
    detailResponseTime: number;
    createResponseTime: number;
    updateResponseTime: number;
    deleteResponseTime: number;
  };
  dataValidation: {
    fieldValidationPassed: number;
    typeValidationPassed: number;
    validationFailed: number;
  };
  security: {
    authenticationRequired: boolean;
    authorizationWorking: boolean;
    dataSanitizationWorking: boolean;
  };
  overallStatus: 'PASS' | 'FAIL' | 'PARTIAL';
}
```

---

## 🚀 执行指南

1. **环境准备**: 确保数据库中有测试用户数据
2. **权限准备**: 创建不同角色的测试账户
3. **数据清理**: 测试前清理可能冲突的测试数据
4. **执行顺序**: 按照CRUD顺序执行测试
5. **结果验证**: 每个操作后验证数据库状态
6. **清理工作**: 测试完成后清理创建的测试数据

---

**创建日期**: 2025-11-24  
**最后更新**: 2025-11-24  
**版本**: 1.0  
**状态**: 待执行