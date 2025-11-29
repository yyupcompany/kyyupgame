# 用户管理API文档

## 👥 用户管理概述

用户管理模块提供完整的用户生命周期管理功能，包括用户的增删改查、状态管理、角色分配、批量操作等。系统支持多种用户类型，包括系统管理员、园长、教师、家长等不同角色。

## 📋 API基础信息

- **Base URL**: `http://localhost:3000/api/users`
- **认证方式**: Bearer Token (JWT)
- **Content-Type**: `application/json`
- **API版本**: v1
- **所需权限**: `user:read`, `user:write`, `user:delete`

## 🏗️ 数据模型

### User 用户模型

```typescript
interface User {
  id: number;                    // 用户ID
  username: string;              // 用户名
  email: string;                 // 邮箱地址
  phone?: string;                // 手机号码
  nickname: string;              // 昵称
  avatar?: string;               // 头像URL
  gender?: 'male' | 'female' | 'other'; // 性别
  birthday?: string;             // 生日
  address?: string;              // 地址
  status: 'active' | 'inactive' | 'locked' | 'pending_activation'; // 状态
  userType: 'admin' | 'principal' | 'teacher' | 'parent' | 'student'; // 用户类型
  lastLoginAt?: string;          // 最后登录时间
  passwordChangedAt?: string;    // 密码修改时间
  emailVerifiedAt?: string;      // 邮箱验证时间
  phoneVerifiedAt?: string;      // 手机验证时间
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
  deletedAt?: string;            // 删除时间
}
```

## 🔍 用户查询

### 获取用户列表

**接口地址**: `GET /api/users`

**接口描述**: 分页获取用户列表，支持多条件筛选

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| page | number | 否 | 页码，默认1 | 1 |
| pageSize | number | 否 | 每页数量，默认20 | 20 |
| keyword | string | 否 | 搜索关键词（用户名、邮箱、昵称） | "张三" |
| userType | string | 否 | 用户类型筛选 | "teacher" |
| status | string | 否 | 状态筛选 | "active" |
| gender | string | 否 | 性别筛选 | "male" |
| startDate | string | 否 | 创建开始日期 | "2025-01-01" |
| endDate | string | 否 | 创建结束日期 | "2025-12-31" |
| sortBy | string | 否 | 排序字段 | "createdAt" |
| sortOrder | string | 否 | 排序方向 | "desc" |

**请求示例**:
```bash
GET /api/users?page=1&pageSize=20&userType=teacher&status=active&sortBy=createdAt&sortOrder=desc
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "teacher001",
        "email": "teacher1@example.com",
        "nickname": "张老师",
        "avatar": "https://example.com/avatar1.jpg",
        "gender": "female",
        "userType": "teacher",
        "status": "active",
        "lastLoginAt": "2025-11-29T09:30:00Z",
        "createdAt": "2025-01-15T10:00:00Z",
        "roles": ["teacher"],
        "kindergarten": {
          "id": 1,
          "name": "阳光幼儿园"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 156,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "获取用户列表成功",
  "timestamp": "2025-11-29T10:30:00Z"
}
```

### 获取用户详情

**接口地址**: `GET /api/users/:id`

**接口描述**: 获取指定用户的详细信息

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 用户ID |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "teacher001",
    "email": "teacher1@example.com",
    "phone": "13800138001",
    "nickname": "张老师",
    "avatar": "https://example.com/avatar1.jpg",
    "gender": "female",
    "birthday": "1990-05-15",
    "address": "北京市朝阳区",
    "status": "active",
    "userType": "teacher",
    "lastLoginAt": "2025-11-29T09:30:00Z",
    "passwordChangedAt": "2025-11-01T10:00:00Z",
    "emailVerifiedAt": "2025-01-15T10:30:00Z",
    "phoneVerifiedAt": "2025-01-16T14:20:00Z",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-11-29T09:30:00Z",
    "roles": [
      {
        "id": 2,
        "name": "teacher",
        "displayName": "教师",
        "description": "教师角色"
      }
    ],
    "permissions": [
      "student:read",
      "class:read",
      "activity:read"
    ],
    "profile": {
      "education": "本科",
      "major": "学前教育",
      "experience": "5年",
      "certificates": ["教师资格证", "普通话等级证书"]
    },
    "kindergarten": {
      "id": 1,
      "name": "阳光幼儿园",
      "address": "北京市朝阳区"
    }
  },
  "message": "获取用户详情成功",
  "timestamp": "2025-11-29T10:30:00Z"
}
```

### 获取当前用户信息

**接口地址**: `GET /api/users/me`

**接口描述**: 获取当前登录用户的详细信息

**请求头**:
```
Authorization: Bearer {access_token}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "teacher001",
    "email": "teacher1@example.com",
    "nickname": "张老师",
    "avatar": "https://example.com/avatar1.jpg",
    "userType": "teacher",
    "status": "active",
    "roles": ["teacher"],
    "permissions": ["student:read", "class:read", "activity:read"],
    "preferences": {
      "language": "zh-CN",
      "theme": "light",
      "notifications": {
        "email": true,
        "sms": false,
        "push": true
      }
    }
  },
  "message": "获取当前用户信息成功",
  "timestamp": "2025-11-29T10:30:00Z"
}
```

## ➕ 用户创建

### 创建用户

**接口地址**: `POST /api/users`

**接口描述**: 创建新用户账户

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| username | string | 是 | 用户名 | "teacher002" |
| email | string | 是 | 邮箱地址 | "teacher2@example.com" |
| password | string | 是 | 初始密码 | "password123" |
| phone | string | 否 | 手机号码 | "13800138002" |
| nickname | string | 是 | 昵称 | "李老师" |
| gender | string | 否 | 性别 | "male" |
| birthday | string | 否 | 生日 | "1985-08-20" |
| address | string | 否 | 地址 | "北京市海淀区" |
| userType | string | 是 | 用户类型 | "teacher" |
| roleIds | array | 是 | 角色ID列表 | [2] |
| kindergartenId | number | 否 | 园所ID | 1 |
| profile | object | 否 | 详细资料 | {...} |
| sendInvite | boolean | 否 | 是否发送邀请邮件 | true |

**请求示例**:
```json
{
  "username": "teacher002",
  "email": "teacher2@example.com",
  "password": "password123",
  "nickname": "李老师",
  "gender": "male",
  "userType": "teacher",
  "roleIds": [2],
  "kindergartenId": 1,
  "profile": {
    "education": "本科",
    "major": "学前教育",
    "experience": "3年"
  },
  "sendInvite": true
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "username": "teacher002",
    "email": "teacher2@example.com",
    "nickname": "李老师",
    "userType": "teacher",
    "status": "pending_activation",
    "createdAt": "2025-11-29T10:30:00Z",
    "invitationSent": true
  },
  "message": "用户创建成功，邀请邮件已发送",
  "timestamp": "2025-11-29T10:30:00Z"
}
```

### 批量创建用户

**接口地址**: `POST /api/users/batch`

**接口描述**: 批量创建用户账户

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| users | array | 是 | 用户信息数组 |
| sendInvite | boolean | 否 | 是否发送邀请邮件 |

**请求示例**:
```json
{
  "users": [
    {
      "username": "teacher003",
      "email": "teacher3@example.com",
      "nickname": "王老师",
      "userType": "teacher",
      "roleIds": [2],
      "kindergartenId": 1
    },
    {
      "username": "parent001",
      "email": "parent1@example.com",
      "nickname": "张家长",
      "userType": "parent",
      "roleIds": [3],
      "kindergartenId": 1
    }
  ],
  "sendInvite": true
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "total": 2,
    "success": 2,
    "failed": 0,
    "results": [
      {
        "index": 0,
        "success": true,
        "userId": 3,
        "message": "创建成功"
      },
      {
        "index": 1,
        "success": true,
        "userId": 4,
        "message": "创建成功"
      }
    ]
  },
  "message": "批量创建用户完成",
  "timestamp": "2025-11-29T10:30:00Z"
}
```

## ✏️ 用户更新

### 更新用户信息

**接口地址**: `PUT /api/users/:id`

**接口描述**: 更新用户基本信息

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 用户ID |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nickname | string | 否 | 昵称 |
| phone | string | 否 | 手机号码 |
| gender | string | 否 | 性别 |
| birthday | string | 否 | 生日 |
| address | string | 否 | 地址 |
| avatar | string | 否 | 头像URL |
| profile | object | 否 | 详细资料 |

**请求示例**:
```json
{
  "nickname": "张老师（高级）",
  "phone": "13800138001",
  "address": "北京市朝阳区新地址",
  "profile": {
    "education": "本科",
    "major": "学前教育",
    "experience": "6年"
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nickname": "张老师（高级）",
    "phone": "13800138001",
    "address": "北京市朝阳区新地址",
    "updatedAt": "2025-11-29T10:30:00Z"
  },
  "message": "用户信息更新成功",
  "timestamp": "2025-11-29T10:30:00Z"
}
```

### 更新当前用户信息

**接口地址**: `PUT /api/users/me`

**接口描述**: 当前用户更新自己的信息

**请求头**:
```
Authorization: Bearer {access_token}
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nickname | string | 否 | 昵称 |
| phone | string | 否 | 手机号码 |
| gender | string | 否 | 性别 |
| birthday | string | 否 | 生日 |
| address | string | 否 | 地址 |
| avatar | string | 否 | 头像URL |
| preferences | object | 否 | 用户偏好设置 |

**请求示例**:
```json
{
  "nickname": "张老师",
  "phone": "13800138001",
  "preferences": {
    "language": "zh-CN",
    "theme": "dark",
    "notifications": {
      "email": true,
      "sms": true,
      "push": false
    }
  }
}
```

## 🔄 状态管理

### 更新用户状态

**接口地址**: `PUT /api/users/:id/status`

**接口描述**: 更新用户状态（激活、停用、锁定等）

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 用户ID |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 枚举值 |
|--------|------|------|------|--------|
| status | string | 是 | 目标状态 | "active", "inactive", "locked" |
| reason | string | 否 | 状态变更原因 | - |
| notify | boolean | 否 | 是否通知用户 | true |

**请求示例**:
```json
{
  "status": "locked",
  "reason": "违反平台规定",
  "notify": true
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "locked",
    "statusChangedAt": "2025-11-29T10:30:00Z",
    "reason": "违反平台规定"
  },
  "message": "用户状态更新成功",
  "timestamp": "2025-11-29T10:30:00Z"
}
```

### 批量更新用户状态

**接口地址**: `PUT /api/users/batch/status`

**接口描述**: 批量更新用户状态

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userIds | array | 是 | 用户ID列表 |
| status | string | 是 | 目标状态 |
| reason | string | 否 | 状态变更原因 |

**请求示例**:
```json
{
  "userIds": [1, 2, 3],
  "status": "inactive",
  "reason": "批量清理无效账户"
}
```

## 🗑️ 用户删除

### 删除用户

**接口地址**: `DELETE /api/users/:id`

**接口描述**: 软删除用户（标记为已删除，不删除实际数据）

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 用户ID |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| force | boolean | 否 | 是否强制删除 | false |
| reason | string | 否 | 删除原因 |

**请求示例**:
```bash
DELETE /api/users/123?force=false&reason=离职
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "deletedAt": "2025-11-29T10:30:00Z",
    "reason": "离职"
  },
  "message": "用户删除成功",
  "timestamp": "2025-11-29T10:30:00Z"
}
```

### 批量删除用户

**接口地址**: `DELETE /api/users/batch`

**接口描述**: 批量删除用户

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userIds | array | 是 | 用户ID列表 |
| force | boolean | 否 | 是否强制删除 |
| reason | string | 否 | 删除原因 |

**请求示例**:
```json
{
  "userIds": [123, 124, 125],
  "force": false,
  "reason": "批量清理测试账户"
}
```

## 📊 用户统计

### 获取用户统计信息

**接口地址**: `GET /api/users/statistics`

**接口描述**: 获取用户统计数据

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |
| groupBy | string | 否 | 分组方式 |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 1256,
    "activeUsers": 1150,
    "inactiveUsers": 85,
    "lockedUsers": 21,
    "newUsersThisMonth": 45,
    "userTypeDistribution": {
      "admin": 5,
      "principal": 12,
      "teacher": 234,
      "parent": 786,
      "student": 219
    },
    "statusDistribution": {
      "active": 1150,
      "inactive": 85,
      "locked": 21
    },
    "growthTrend": [
      {
        "date": "2025-11-01",
        "count": 1200
      },
      {
        "date": "2025-11-02",
        "count": 1205
      }
    ]
  },
  "message": "获取用户统计成功",
  "timestamp": "2025-11-29T10:30:00Z"
}
```

## 🔍 用户搜索

### 高级搜索用户

**接口地址**: `POST /api/users/search`

**接口描述**: 根据复杂条件搜索用户

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| conditions | object | 是 | 搜索条件 |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| sortBy | string | 否 | 排序字段 |
| sortOrder | string | 否 | 排序方向 |

**请求示例**:
```json
{
  "conditions": {
    "userType": "teacher",
    "status": "active",
    "createdAt": {
      "start": "2025-01-01",
      "end": "2025-12-31"
    },
    "profile": {
      "education": "本科",
      "experience": {
        "min": 3,
        "max": 10
      }
    }
  },
  "page": 1,
  "pageSize": 20,
  "sortBy": "createdAt",
  "sortOrder": "desc"
}
```

## 📋 导入导出

### 导出用户数据

**接口地址**: `GET /api/users/export`

**接口描述**: 导出用户数据为Excel或CSV文件

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 枚举值 |
|--------|------|------|------|--------|
| format | string | 否 | 导出格式 | "excel", "csv" |
| fields | array | 否 | 导出字段 | ["username", "email", "nickname"] |
| filters | object | 否 | 过滤条件 | {...} |

**请求示例**:
```bash
GET /api/users/export?format=excel&fields=username,email,nickname,userType,status
```

**响应**: 文件下载

### 导入用户数据

**接口地址**: `POST /api/users/import`

**接口描述**: 从Excel或CSV文件导入用户数据

**请求参数**:
- Content-Type: `multipart/form-data`

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | file | 是 | 用户数据文件 |
| options | object | 否 | 导入选项 |
| sendInvite | boolean | 否 | 是否发送邀请邮件 |

**导入选项说明**:
```json
{
  "skipHeader": true,          // 跳过表头
  "updateExisting": false,     // 更新已存在的用户
  "defaultPassword": "123456", // 默认密码
  "defaultRole": "teacher"     // 默认角色
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "total": 100,
    "success": 95,
    "failed": 5,
    "errors": [
      {
        "row": 10,
        "field": "email",
        "message": "邮箱格式错误"
      }
    ]
  },
  "message": "用户数据导入完成",
  "timestamp": "2025-11-29T10:30:00Z"
}
```

## 🔐 权限验证

### 检查用户权限

**接口地址**: `GET /api/users/:id/permissions`

**接口描述**: 获取指定用户的权限列表

**响应示例**:
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "permissions": [
      "user:read",
      "user:write",
      "student:read",
      "student:write",
      "class:read",
      "activity:read",
      "activity:write"
    ],
    "roles": ["admin", "teacher"]
  },
  "message": "获取用户权限成功",
  "timestamp": "2025-11-29T10:30:00Z"
}
```

### 分配用户角色

**接口地址**: `POST /api/users/:id/roles`

**接口描述**: 为用户分配角色

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| roleIds | array | 是 | 角色ID列表 |

**请求示例**:
```json
{
  "roleIds": [2, 3]
}
```

### 移除用户角色

**接口地址**: `DELETE /api/users/:id/roles/:roleId`

**接口描述**: 移除用户的指定角色

**响应示例**:
```json
{
  "success": true,
  "data": null,
  "message": "角色移除成功",
  "timestamp": "2025-11-29T10:30:00Z"
}
```

## 📋 错误码说明

| 错误码 | 说明 | HTTP状态码 |
|--------|------|------------|
| USER_NOT_FOUND | 用户不存在 | 404 |
| USER_ALREADY_EXISTS | 用户已存在 | 409 |
| USER_INACTIVE | 用户未激活 | 403 |
| USER_LOCKED | 用户已锁定 | 423 |
| INVALID_USER_TYPE | 无效的用户类型 | 400 |
| INVALID_STATUS | 无效的状态值 | 400 |
| PASSWORD_REQUIRED | 密码不能为空 | 400 |
| EMAIL_REQUIRED | 邮箱不能为空 | 400 |
| USERNAME_REQUIRED | 用户名不能为空 | 400 |
| INSUFFICIENT_PERMISSIONS | 权限不足 | 403 |
| BATCH_OPERATION_FAILED | 批量操作失败 | 400 |
| IMPORT_FILE_FORMAT_ERROR | 导入文件格式错误 | 400 |
| ROLE_NOT_FOUND | 角色不存在 | 404 |

---

**最后更新**: 2025-11-29
**文档版本**: v1.0.0
**维护团队**: 统一认证管理系统开发团队