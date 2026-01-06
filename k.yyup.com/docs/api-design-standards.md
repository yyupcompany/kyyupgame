# API设计规范

## 🎯 设计原则

### 1. RESTful设计
遵循REST架构风格，使用标准HTTP方法和状态码。

### 2. 一致性
保持API接口的命名、参数、响应格式的一致性。

### 3. 可预测性
API行为应该可预测，相同的输入应该产生相同的输出。

## 🛣️ URL设计规范

### 1. 基础结构
```
https://api.example.com/api/v1/{resource}
```

### 2. 资源命名
```bash
# ✅ 正确示例
GET /api/users              # 获取用户列表
GET /api/users/123          # 获取特定用户
POST /api/users             # 创建用户
PUT /api/users/123          # 更新用户
DELETE /api/users/123       # 删除用户

# ❌ 错误示例
GET /api/getUsers           # 避免动词
GET /api/user               # 避免单数
GET /api/users_list         # 避免下划线
```

### 3. 嵌套资源
```bash
# ✅ 正确的嵌套
GET /api/users/123/roles    # 获取用户的角色
POST /api/users/123/roles   # 为用户分配角色

# ❌ 避免过深嵌套
GET /api/users/123/roles/456/permissions/789
```

## 📝 HTTP方法规范

### 1. 标准CRUD操作
```typescript
// 获取资源列表
router.get('/users', async (req, res) => {
  // 支持分页、排序、过滤
});

// 获取单个资源
router.get('/users/:id', async (req, res) => {
  // 返回详细信息
});

// 创建资源
router.post('/users', async (req, res) => {
  // 创建新资源
});

// 更新资源（完整更新）
router.put('/users/:id', async (req, res) => {
  // 完整替换资源
});

// 部分更新资源
router.patch('/users/:id', async (req, res) => {
  // 部分更新字段
});

// 删除资源
router.delete('/users/:id', async (req, res) => {
  // 删除资源
});
```

### 2. 特殊操作
```typescript
// 批量操作
router.post('/users/batch', async (req, res) => {
  // 批量创建或更新
});

// 状态变更
router.patch('/users/:id/status', async (req, res) => {
  // 改变用户状态
});

// 关联操作
router.post('/users/:id/roles/:roleId', async (req, res) => {
  // 建立关联关系
});
```

## 📊 请求参数规范

### 1. 查询参数
```typescript
interface QueryParams {
  // 分页参数
  page?: number;          // 页码，从1开始
  pageSize?: number;      // 每页数量，默认20
  
  // 排序参数
  sort?: string;          // 排序字段
  order?: 'asc' | 'desc'; // 排序方向
  
  // 搜索参数
  search?: string;        // 关键词搜索
  
  // 过滤参数
  status?: string;        // 状态过滤
  type?: string;          // 类型过滤
  
  // 时间范围
  startDate?: string;     // 开始时间
  endDate?: string;       // 结束时间
}

// 使用示例
GET /api/users?page=1&pageSize=20&sort=createdAt&order=desc&status=active
```

### 2. 路径参数
```typescript
// ✅ 正确的参数命名
router.get('/users/:id', handler);
router.get('/users/:userId/roles/:roleId', handler);

// ❌ 错误的参数命名
router.get('/users/:user_id', handler);     // 避免下划线
router.get('/users/:ID', handler);          // 避免大写
```

### 3. 请求体参数
```typescript
// 创建用户请求体
interface CreateUserRequest {
  username: string;       // 必填
  email: string;         // 必填
  password: string;      // 必填
  name?: string;         // 可选
  avatar?: string;       // 可选
}

// 更新用户请求体
interface UpdateUserRequest {
  name?: string;
  email?: string;
  avatar?: string;
  // 不包含敏感字段如password
}
```

## 📤 响应格式规范

### 1. 统一响应结构
```typescript
interface ApiResponse<T = any> {
  success: boolean;      // 操作是否成功
  message: string;       // 响应消息
  data?: T;             // 响应数据
  error?: {             // 错误信息
    code: string;
    details?: any;
  };
  meta?: {              // 元数据
    timestamp: string;
    requestId: string;
    pagination?: PaginationMeta;
  };
}

interface PaginationMeta {
  page: number;         // 当前页
  pageSize: number;     // 每页数量
  total: number;        // 总记录数
  totalPages: number;   // 总页数
}
```

### 2. 成功响应示例
```json
{
  "success": true,
  "message": "获取用户列表成功",
  "data": {
    "items": [
      {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req-123456",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 3. 错误响应示例
```json
{
  "success": false,
  "message": "用户不存在",
  "error": {
    "code": "USER_NOT_FOUND",
    "details": {
      "userId": 123
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req-123456"
  }
}
```

## 🚨 错误处理规范

### 1. HTTP状态码使用
```typescript
// 成功状态码
200 OK          // 成功获取资源
201 Created     // 成功创建资源
204 No Content  // 成功删除资源

// 客户端错误
400 Bad Request     // 请求参数错误
401 Unauthorized    // 未认证
403 Forbidden       // 无权限
404 Not Found       // 资源不存在
409 Conflict        // 资源冲突
422 Unprocessable   // 验证失败

// 服务器错误
500 Internal Server Error  // 服务器内部错误
502 Bad Gateway           // 网关错误
503 Service Unavailable   // 服务不可用
```

### 2. 错误代码规范
```typescript
enum ErrorCodes {
  // 认证相关
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // 资源相关
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  
  // 验证相关
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  
  // 业务相关
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED'
}
```

## 📚 文档规范

### 1. API文档结构
```markdown
## 获取用户列表

### 请求
- **方法**: GET
- **路径**: /api/users
- **认证**: 需要

### 参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |

### 响应
- **成功**: 200 OK
- **失败**: 400 Bad Request

### 示例
```

### 2. 注释规范
```typescript
/**
 * 获取用户列表
 * @route GET /api/users
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @returns {Promise<ApiResponse<UserListResponse>>}
 */
router.get('/users', async (req, res) => {
  // 实现逻辑
});
```

## ✅ 检查清单

在设计API时，请确保：

- [ ] 使用RESTful URL设计
- [ ] HTTP方法使用正确
- [ ] 参数命名一致（camelCase）
- [ ] 响应格式统一
- [ ] 错误处理完整
- [ ] 状态码使用正确
- [ ] 包含必要的验证
- [ ] 添加适当的文档
- [ ] 考虑安全性
- [ ] 支持分页和排序
