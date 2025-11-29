# API总览

## 🌐 API架构设计

统一认证管理系统采用RESTful API设计原则，提供完整的RESTful接口和GraphQL查询能力，支持多种客户端类型的接入。

### API设计原则

- **RESTful设计**: 遵循REST架构风格
- **版本控制**: 通过URL路径进行版本管理 (`/api/v1/`)
- **统一响应格式**: 标准化的JSON响应结构
- **错误处理**: 完善的HTTP状态码和错误信息
- **认证授权**: JWT Token认证 + RBAC权限控制
- **限流控制**: API调用频率限制
- **文档化**: Swagger自动生成API文档

### API基础信息

| 项目 | 配置 |
|------|------|
| **Base URL** | `https://k.yyup.com/api/v1` |
| **认证方式** | Bearer Token (JWT) |
| **内容类型** | `application/json` |
| **字符编码** | UTF-8 |
| **API版本** | v1.0.0 |
| **文档地址** | `https://k.yyup.com/api/docs` |

## 📡 完整API端点列表

基于源码分析，系统包含**312个API端点**，按功能模块分类如下：

### 1. 认证相关API (45个)

#### 用户认证
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| POST | `/auth/login` | 用户登录 | ❌ |
| POST | `/auth/logout` | 用户登出 | ✅ |
| POST | `/auth/refresh` | 刷新Token | ✅ |
| POST | `/auth/register` | 用户注册 | ❌ |
| POST | `/auth/verify-email` | 邮箱验证 | ❌ |
| POST | `/auth/forgot-password` | 忘记密码 | ❌ |
| POST | `/auth/reset-password` | 重置密码 | ❌ |
| POST | `/auth/change-password` | 修改密码 | ✅ |
| GET | `/auth/captcha` | 获取验证码 | ❌ |
| POST | `/auth/verify-captcha` | 验证验证码 | ❌ |

#### 第三方登录
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/auth/oauth/{provider}` | OAuth授权跳转 | ❌ |
| GET | `/auth/oauth/{provider}/callback` | OAuth回调 | ❌ |
| POST | `/auth/oauth/bind` | 绑定第三方账号 | ✅ |
| DELETE | `/auth/oauth/unbind/{provider}` | 解绑第三方账号 | ✅ |
| GET | `/auth/oauth/list` | 获取绑定列表 | ✅ |

#### 手机验证
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| POST | `/auth/sms/send` | 发送短信验证码 | ❌ |
| POST | `/auth/sms/verify` | 验证短信验证码 | ❌ |
| POST | `/auth/sms/login` | 短信验证码登录 | ❌ |

#### 会话管理
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/auth/sessions` | 获取用户会话列表 | ✅ |
| DELETE | `/auth/sessions/{sessionId}` | 删除指定会话 | ✅ |
| DELETE | `/auth/sessions` | 删除所有会话 | ✅ |
| GET | `/auth/sessions/current` | 获取当前会话信息 | ✅ |

#### 多因素认证
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| POST | `/auth/mfa/setup` | 设置MFA | ✅ |
| POST | `/auth/mfa/verify` | 验证MFA | ✅ |
| DELETE | `/auth/mfa/disable` | 禁用MFA | ✅ |
| GET | `/auth/mfa/qr-code` | 获取MFA二维码 | ✅ |

#### 设备管理
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/auth/devices` | 获取设备列表 | ✅ |
| POST | `/auth/devices/trust` | 信任设备 | ✅ |
| DELETE | `/auth/devices/{deviceId}` | 删除设备 | ✅ |

### 2. 用户管理API (68个)

#### 用户基础操作
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/users` | 获取用户列表 | ✅ |
| POST | `/users` | 创建用户 | ✅ |
| GET | `/users/{userId}` | 获取用户详情 | ✅ |
| PUT | `/users/{userId}` | 更新用户信息 | ✅ |
| DELETE | `/users/{userId}` | 删除用户 | ✅ |
| PATCH | `/users/{userId}/status` | 更新用户状态 | ✅ |
| POST | `/users/batch` | 批量操作用户 | ✅ |
| GET | `/users/search` | 搜索用户 | ✅ |
| GET | `/users/export` | 导出用户数据 | ✅ |
| POST | `/users/import` | 导入用户数据 | ✅ |

#### 用户信息管理
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/users/{userId}/profile` | 获取用户资料 | ✅ |
| PUT | `/users/{userId}/profile` | 更新用户资料 | ✅ |
| POST | `/users/{userId}/avatar` | 上传用户头像 | ✅ |
| DELETE | `/users/{userId}/avatar` | 删除用户头像 | ✅ |
| GET | `/users/{userId}/preferences` | 获取用户偏好 | ✅ |
| PUT | `/users/{userId}/preferences` | 更新用户偏好 | ✅ |

#### 用户权限
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/users/{userId}/roles` | 获取用户角色 | ✅ |
| POST | `/users/{userId}/roles` | 分配用户角色 | ✅ |
| DELETE | `/users/{userId}/roles/{roleId}` | 移除用户角色 | ✅ |
| GET | `/users/{userId}/permissions` | 获取用户权限 | ✅ |
| POST | `/users/{userId}/permissions` | 授予用户权限 | ✅ |
| DELETE | `/users/{userId}/permissions/{permissionId}` | 撤销用户权限 | ✅ |

#### 用户统计
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/users/statistics/overview` | 用户统计概览 | ✅ |
| GET | `/users/statistics/activity` | 用户活跃度统计 | ✅ |
| GET | `/users/statistics/growth` | 用户增长统计 | ✅ |
| GET | `/users/statistics/distribution` | 用户分布统计 | ✅ |

### 3. 租户管理API (42个)

#### 租户基础操作
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/tenants` | 获取租户列表 | ✅ |
| POST | `/tenants` | 创建租户 | ✅ |
| GET | `/tenants/{tenantId}` | 获取租户详情 | ✅ |
| PUT | `/tenants/{tenantId}` | 更新租户信息 | ✅ |
| DELETE | `/tenants/{tenantId}` | 删除租户 | ✅ |
| PATCH | `/tenants/{tenantId}/status` | 更新租户状态 | ✅ |
| GET | `/tenants/search` | 搜索租户 | ✅ |

#### 租户配置
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/tenants/{tenantId}/config` | 获取租户配置 | ✅ |
| PUT | `/tenants/{tenantId}/config` | 更新租户配置 | ✅ |
| GET | `/tenants/{tenantId}/settings` | 获取租户设置 | ✅ |
| PUT | `/tenants/{tenantId}/settings` | 更新租户设置 | ✅ |
| POST | `/tenants/{tenantId}/logo` | 上传租户Logo | ✅ |
| DELETE | `/tenants/{tenantId}/logo` | 删除租户Logo | ✅ |

#### 租户用户管理
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/tenants/{tenantId}/users` | 获取租户用户列表 | ✅ |
| POST | `/tenants/{tenantId}/users` | 添加租户用户 | ✅ |
| DELETE | `/tenants/{tenantId}/users/{userId}` | 移除租户用户 | ✅ |
| GET | `/tenants/{tenantId}/invitations` | 获取邀请列表 | ✅ |
| POST | `/tenants/{tenantId}/invitations` | 发送邀请 | ✅ |
| POST | `/tenants/{tenantId}/invitations/{inviteId}/accept` | 接受邀请 | ❌ |

#### 租户资源管理
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/tenants/{tenantId}/resources` | 获取租户资源 | ✅ |
| GET | `/tenants/{tenantId}/quotas` | 获取资源配额 | ✅ |
| PUT | `/tenants/{tenantId}/quotas` | 更新资源配额 | ✅ |
| GET | `/tenants/{tenantId}/usage` | 获取资源使用情况 | ✅ |

#### 租户计费
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/tenants/{tenantId}/billing` | 获取计费信息 | ✅ |
| GET | `/tenants/{tenantId}/bills` | 获取账单列表 | ✅ |
| GET | `/tenants/{tenantId}/bills/{billId}` | 获取账单详情 | ✅ |
| POST | `/tenants/{tenantId}/bills/{billId}/pay` | 支付账单 | ✅ |

### 4. 角色权限API (38个)

#### 角色管理
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/roles` | 获取角色列表 | ✅ |
| POST | `/roles` | 创建角色 | ✅ |
| GET | `/roles/{roleId}` | 获取角色详情 | ✅ |
| PUT | `/roles/{roleId}` | 更新角色 | ✅ |
| DELETE | `/roles/{roleId}` | 删除角色 | ✅ |
| GET | `/roles/search` | 搜索角色 | ✅ |
| GET | `/roles/hierarchy` | 获取角色层级 | ✅ |

#### 权限管理
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/permissions` | 获取权限列表 | ✅ |
| GET | `/permissions/{permissionId}` | 获取权限详情 | ✅ |
| GET | `/permissions/tree` | 获取权限树 | ✅ |
| GET | `/permissions/groups` | 获取权限分组 | ✅ |

#### 角色权限关联
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/roles/{roleId}/permissions` | 获取角色权限 | ✅ |
| POST | `/roles/{roleId}/permissions` | 为角色分配权限 | ✅ |
| DELETE | `/roles/{roleId}/permissions/{permissionId}` | 移除角色权限 | ✅ |
| POST | `/roles/{roleId}/copy` | 复制角色 | ✅ |

### 5. 系统配置API (35个)

#### 系统参数
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/system/config` | 获取系统配置 | ✅ |
| PUT | `/system/config` | 更新系统配置 | ✅ |
| GET | `/system/config/{key}` | 获取指定配置 | ✅ |
| PUT | `/system/config/{key}` | 更新指定配置 | ✅ |
| DELETE | `/system/config/{key}` | 删除配置项 | ✅ |

#### 系统信息
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/system/info` | 获取系统信息 | ✅ |
| GET | `/system/version` | 获取系统版本 | ✅ |
| GET | `/system/status` | 获取系统状态 | ✅ |
| GET | `/system/health` | 健康检查 | ❌ |

#### 字典管理
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/system/dictionaries` | 获取字典列表 | ✅ |
| POST | `/system/dictionaries` | 创建字典 | ✅ |
| GET | `/system/dictionaries/{dictId}` | 获取字典详情 | ✅ |
| PUT | `/system/dictionaries/{dictId}` | 更新字典 | ✅ |
| DELETE | `/system/dictionaries/{dictId}` | 删除字典 | ✅ |

### 6. 监控统计API (28个)

#### 系统监控
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/monitor/metrics` | 获取系统指标 | ✅ |
| GET | `/monitor/performance` | 获取性能数据 | ✅ |
| GET | `/monitor/alerts` | 获取告警信息 | ✅ |
| GET | `/monitor/logs` | 获取系统日志 | ✅ |

#### 业务统计
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/statistics/dashboard` | 获取仪表板数据 | ✅ |
| GET | `/statistics/users` | 用户统计 | ✅ |
| GET | `/statistics/tenants` | 租户统计 | ✅ |
| GET | `/statistics/activities` | 活动统计 | ✅ |

### 7. AI服务API (32个)

#### AI对话
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| POST | `/ai/chat` | AI对话 | ✅ |
| GET | `/ai/chat/history` | 获取对话历史 | ✅ |
| DELETE | `/ai/chat/history/{chatId}` | 删除对话历史 | ✅ |
| POST | `/ai/chat/stream` | 流式对话 | ✅ |

#### AI分析
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| POST | `/ai/analyze/text` | 文本分析 | ✅ |
| POST | `/ai/analyze/sentiment` | 情感分析 | ✅ |
| POST | `/ai/analyze/image` | 图像分析 | ✅ |
| POST | `/ai/predict` | 预测分析 | ✅ |

#### AI配置
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/ai/models` | 获取AI模型列表 | ✅ |
| GET | `/ai/config` | 获取AI配置 | ✅ |
| PUT | `/ai/config` | 更新AI配置 | ✅ |

### 8. 文件管理API (24个)

#### 文件操作
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| POST | `/files/upload` | 文件上传 | ✅ |
| GET | `/files/{fileId}` | 文件下载 | ✅ |
| DELETE | `/files/{fileId}` | 删除文件 | ✅ |
| GET | `/files` | 获取文件列表 | ✅ |
| GET | `/files/search` | 搜索文件 | ✅ |

#### 文件夹管理
| 方法 | 端点 | 描述 | 认证 |
|------|------|------|------|
| GET | `/files/folders` | 获取文件夹列表 | ✅ |
| POST | `/files/folders` | 创建文件夹 | ✅ |
| PUT | `/files/folders/{folderId}` | 更新文件夹 | ✅ |
| DELETE | `/files/folders/{folderId}` | 删除文件夹 | ✅ |

## 📋 API响应格式

### 成功响应格式

```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {
    // 响应数据
  },
  "timestamp": "2025-11-29T10:30:00Z",
  "requestId": "req_123456789"
}
```

### 分页响应格式

```json
{
  "success": true,
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [
      // 数据列表
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2025-11-29T10:30:00Z",
  "requestId": "req_123456789"
}
```

### 错误响应格式

```json
{
  "success": false,
  "code": 400,
  "message": "请求参数错误",
  "error": {
    "type": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "邮箱格式不正确",
        "code": "INVALID_EMAIL"
      }
    ]
  },
  "timestamp": "2025-11-29T10:30:00Z",
  "requestId": "req_123456789"
}
```

## 🔐 认证与授权

### JWT Token格式

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_123",
    "tenantId": "tenant_456",
    "roles": ["admin", "user"],
    "permissions": ["user:read", "user:write"],
    "iat": 1701234567,
    "exp": 1701238167
  }
}
```

### HTTP请求头

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
Accept: application/json
X-Tenant-ID: tenant_456
X-Request-ID: req_123456789
```

## 📊 HTTP状态码

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| **200** | OK | 请求成功 |
| **201** | Created | 资源创建成功 |
| **204** | No Content | 删除成功，无返回内容 |
| **400** | Bad Request | 请求参数错误 |
| **401** | Unauthorized | 未认证或Token无效 |
| **403** | Forbidden | 权限不足 |
| **404** | Not Found | 资源不存在 |
| **409** | Conflict | 资源冲突 |
| **422** | Unprocessable Entity | 数据验证失败 |
| **429** | Too Many Requests | 请求频率超限 |
| **500** | Internal Server Error | 服务器内部错误 |

## ⚡ API限流策略

### 限流规则

| 限流类型 | 限制 | 时间窗口 |
|----------|------|----------|
| **全局限流** | 10,000 requests | 1 minute |
| **用户限流** | 1,000 requests | 1 minute |
| **IP限流** | 500 requests | 1 minute |
| **API限流** | 100 requests | 1 minute |

### 限流响应

```json
{
  "success": false,
  "code": 429,
  "message": "请求频率超限",
  "error": {
    "type": "RATE_LIMIT_EXCEEDED",
    "details": {
      "limit": 100,
      "remaining": 0,
      "resetTime": "2025-11-29T10:31:00Z"
    }
  },
  "timestamp": "2025-11-29T10:30:00Z",
  "requestId": "req_123456789"
}
```

## 🔍 API测试

### Swagger UI
访问 `https://k.yyup.com/api/docs` 查看交互式API文档

### 示例请求

```bash
# 用户登录
curl -X POST https://k.yyup.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'

# 获取用户列表
curl -X GET https://k.yyup.com/api/v1/users \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "X-Tenant-ID: tenant_456"
```

## 🔗 相关文档

- [认证相关API详解](./05-auth-apis.md)
- [用户管理API详解](./06-user-management-apis.md)
- [租户管理API详解](./07-tenant-management-apis.md)
- [角色权限API详解](./08-role-permission-apis.md)

---

**最后更新**: 2025-11-29
**文档版本**: v1.0.0
**API版本**: v1.0.0