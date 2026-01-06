# 集团管理 API 文档

## 📋 目录

- [1. 概述](#1-概述)
- [2. 认证](#2-认证)
- [3. 集团管理](#3-集团管理)
- [4. 集团用户管理](#4-集团用户管理)
- [5. 集团统计](#5-集团统计)
- [6. 园所管理](#6-园所管理)
- [7. 升级管理](#7-升级管理)
- [8. 错误码](#8-错误码)

---

## 1. 概述

### 1.1 基础信息

- **Base URL**: `http://localhost:3000/api`
- **协议**: HTTP/HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8

### 1.2 通用响应格式

**成功响应:**
```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

**失败响应:**
```json
{
  "success": false,
  "error": "错误类型",
  "message": "错误描述",
  "code": "ERROR_CODE"
}
```

### 1.3 分页响应格式

```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

---

## 2. 认证

所有API请求都需要在Header中携带JWT Token:

```
Authorization: Bearer <token>
```

---

## 3. 集团管理

### 3.1 获取集团列表

**接口**: `GET /groups`

**权限**: 需要登录

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |
| keyword | string | 否 | 搜索关键词 |
| status | number | 否 | 状态筛选 |

**请求示例:**
```bash
GET /api/groups?page=1&pageSize=10&keyword=阳光
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "阳光教育集团",
        "code": "SUNSHINE001",
        "type": 1,
        "kindergartenCount": 5,
        "totalStudents": 1200,
        "totalTeachers": 80,
        "status": 1,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 3.2 获取集团详情

**接口**: `GET /groups/:id`

**权限**: 集团投资人、集团管理员

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 集团ID |

**请求示例:**
```bash
GET /api/groups/1
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "阳光教育集团",
    "code": "SUNSHINE001",
    "type": 1,
    "legalPerson": "张三",
    "registeredCapital": 10000000.00,
    "establishedDate": "2020-01-01",
    "address": "北京市朝阳区阳光大道123号",
    "phone": "010-12345678",
    "email": "contact@sunshine-edu.com",
    "logoUrl": "https://example.com/logo.png",
    "brandName": "阳光幼教",
    "slogan": "让每个孩子都能享受阳光般的教育",
    "description": "阳光教育集团成立于2020年...",
    "chairman": "张三",
    "ceo": "李四",
    "investorId": 1,
    "kindergartenCount": 5,
    "totalStudents": 1200,
    "totalTeachers": 80,
    "totalClasses": 40,
    "status": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-10T00:00:00.000Z",
    "kindergartens": [
      {
        "id": 1,
        "name": "阳光幼儿园(总部)",
        "code": "YG001",
        "isGroupHeadquarters": 1,
        "studentCount": 300
      }
    ],
    "investor": {
      "id": 1,
      "username": "investor",
      "realName": "张三"
    }
  }
}
```

---

### 3.3 创建集团

**接口**: `POST /groups`

**权限**: 需要登录

**请求体:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 集团名称 |
| code | string | 否 | 集团编码，不填自动生成 |
| type | number | 否 | 集团类型，默认1 |
| legalPerson | string | 否 | 法人代表 |
| registeredCapital | number | 否 | 注册资本 |
| establishedDate | string | 否 | 成立日期 |
| address | string | 否 | 总部地址 |
| phone | string | 否 | 联系电话 |
| email | string | 否 | 联系邮箱 |
| brandName | string | 否 | 品牌名称 |
| slogan | string | 否 | 品牌口号 |
| description | string | 否 | 集团简介 |

**请求示例:**
```json
{
  "name": "新教育集团",
  "code": "NEW001",
  "type": 1,
  "legalPerson": "王五",
  "address": "上海市浦东新区",
  "phone": "021-12345678",
  "email": "contact@new-edu.com",
  "brandName": "新幼教",
  "description": "致力于创新教育..."
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "新教育集团",
    "code": "NEW001",
    "status": 1,
    "createdAt": "2024-01-10T00:00:00.000Z"
  },
  "message": "创建成功"
}
```

---

### 3.4 更新集团

**接口**: `PUT /groups/:id`

**权限**: 集团投资人、集团管理员

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 集团ID |

**请求体:** (所有字段都是可选的)

| 参数 | 类型 | 说明 |
|------|------|------|
| name | string | 集团名称 |
| legalPerson | string | 法人代表 |
| address | string | 总部地址 |
| phone | string | 联系电话 |
| email | string | 联系邮箱 |
| logoUrl | string | Logo URL |
| brandName | string | 品牌名称 |
| slogan | string | 品牌口号 |
| description | string | 集团简介 |

**请求示例:**
```json
{
  "name": "阳光教育集团(更新)",
  "slogan": "新的品牌口号"
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "阳光教育集团(更新)",
    "slogan": "新的品牌口号",
    "updatedAt": "2024-01-10T10:00:00.000Z"
  },
  "message": "更新成功"
}
```

---

### 3.5 删除集团

**接口**: `DELETE /groups/:id`

**权限**: 仅集团投资人

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 集团ID |

**请求示例:**
```bash
DELETE /api/groups/1
```

**响应示例:**
```json
{
  "success": true,
  "message": "删除成功"
}
```

**注意事项:**
- 删除集团会将所有园所的 `group_id` 设置为 NULL
- 删除集团会同时删除所有集团用户关联记录
- 此操作为软删除，可以恢复

---

## 4. 集团用户管理

### 4.1 获取集团用户列表

**接口**: `GET /groups/:groupId/users`

**权限**: 集团投资人、集团管理员

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| groupId | number | 是 | 集团ID |

**请求示例:**
```bash
GET /api/groups/1/users
```

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "groupId": 1,
      "userId": 1,
      "role": 1,
      "canViewAllKindergartens": 1,
      "canManageKindergartens": 1,
      "status": 1,
      "user": {
        "id": 1,
        "username": "investor",
        "realName": "张三",
        "email": "zhang@example.com"
      }
    }
  ]
}
```

---

### 4.2 添加集团用户

**接口**: `POST /groups/:groupId/users`

**权限**: 集团投资人、集团管理员

**请求体:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | number | 是 | 用户ID |
| role | number | 是 | 角色: 1-投资人 2-管理员 3-财务总监 4-运营总监 |
| canViewAllKindergartens | number | 否 | 可查看所有园所，默认1 |
| canManageKindergartens | number | 否 | 可管理园所，默认0 |

**请求示例:**
```json
{
  "userId": 2,
  "role": 2,
  "canViewAllKindergartens": 1,
  "canManageKindergartens": 1
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "groupId": 1,
    "userId": 2,
    "role": 2
  },
  "message": "添加成功"
}
```

---

### 4.3 更新集团用户权限

**接口**: `PUT /groups/:groupId/users/:userId`

**权限**: 集团投资人、集团管理员

**请求体:**

| 参数 | 类型 | 说明 |
|------|------|------|
| role | number | 角色 |
| canViewAllKindergartens | number | 可查看所有园所 |
| canManageKindergartens | number | 可管理园所 |

**响应示例:**
```json
{
  "success": true,
  "message": "更新成功"
}
```

---

### 4.4 移除集团用户

**接口**: `DELETE /groups/:groupId/users/:userId`

**权限**: 集团投资人、集团管理员

**响应示例:**
```json
{
  "success": true,
  "message": "移除成功"
}
```

---

## 5. 集团统计

### 5.1 获取集团统计数据

**接口**: `GET /groups/:id/statistics`

**权限**: 集团投资人、集团管理员、财务总监

**路径参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 集团ID |

**请求示例:**
```bash
GET /api/groups/1/statistics
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "kindergartenCount": 5,
    "totalStudents": 1200,
    "totalTeachers": 80,
    "totalClasses": 40,
    "totalCapacity": 1500,
    "enrollmentRate": 80.0,
    "avgStudentsPerKindergarten": 240,
    "avgTeachersPerKindergarten": 16,
    "kindergartenDetails": [
      {
        "id": 1,
        "name": "阳光幼儿园(总部)",
        "studentCount": 300,
        "teacherCount": 20,
        "classCount": 10,
        "enrollmentRate": 85.7
      }
    ]
  }
}
```

---

### 5.2 获取集团活动数据

**接口**: `GET /groups/:id/activities`

**权限**: 集团投资人、集团管理员、运营总监

**请求参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |

**响应示例:**
```json
{
  "success": true,
  "data": {
    "totalActivities": 50,
    "totalRegistrations": 1500,
    "totalParticipants": 1200,
    "byKindergarten": [
      {
        "kindergartenId": 1,
        "kindergartenName": "阳光幼儿园",
        "activityCount": 10,
        "registrationCount": 300
      }
    ],
    "byType": [
      {
        "activityType": 1,
        "typeName": "开放日",
        "count": 15
      }
    ]
  }
}
```

---

### 5.3 获取集团招生数据

**接口**: `GET /groups/:id/enrollment`

**权限**: 集团投资人、集团管理员、运营总监

**响应示例:**
```json
{
  "success": true,
  "data": {
    "totalApplications": 500,
    "totalAdmissions": 300,
    "admissionRate": 60.0,
    "byKindergarten": [
      {
        "kindergartenId": 1,
        "kindergartenName": "阳光幼儿园",
        "applicationCount": 100,
        "admissionCount": 60
      }
    ]
  }
}
```

---

## 6. 园所管理

### 6.1 获取集团下的园所列表

**接口**: `GET /groups/:id/kindergartens`

**权限**: 集团投资人、集团管理员

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "阳光幼儿园(总部)",
      "code": "YG001",
      "groupId": 1,
      "isGroupHeadquarters": 1,
      "groupRole": 1,
      "joinGroupDate": "2024-01-01",
      "studentCount": 300,
      "teacherCount": 20,
      "classCount": 10,
      "status": 1
    }
  ]
}
```

---

### 6.2 园所加入集团

**接口**: `POST /groups/:id/add-kindergarten`

**权限**: 集团投资人、集团管理员

**请求体:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| kindergartenId | number | 是 | 园所ID |
| groupRole | number | 否 | 集团角色 |

**请求示例:**
```json
{
  "kindergartenId": 2,
  "groupRole": 2
}
```

**响应示例:**
```json
{
  "success": true,
  "message": "园所加入成功"
}
```

---

### 6.3 园所退出集团

**接口**: `POST /groups/:id/remove-kindergarten`

**权限**: 集团投资人、集团管理员

**请求体:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| kindergartenId | number | 是 | 园所ID |

**响应示例:**
```json
{
  "success": true,
  "message": "园所退出成功"
}
```

---

## 7. 升级管理

### 7.1 检测升级资格

**接口**: `GET /groups/check-upgrade`

**权限**: 需要登录

**响应示例:**
```json
{
  "success": true,
  "data": {
    "eligible": true,
    "kindergartenCount": 3,
    "kindergartens": [
      {
        "id": 1,
        "name": "阳光幼儿园",
        "code": "YG001"
      }
    ],
    "suggestUpgrade": true
  }
}
```

---

### 7.2 单园所升级为集团

**接口**: `POST /groups/upgrade`

**权限**: 需要登录

**请求体:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| groupName | string | 是 | 集团名称 |
| groupCode | string | 否 | 集团编码 |
| kindergartenIds | number[] | 是 | 要加入集团的园所ID列表 |
| headquartersId | number | 否 | 集团总部ID |

**请求示例:**
```json
{
  "groupName": "我的教育集团",
  "kindergartenIds": [1, 2, 3],
  "headquartersId": 1
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "我的教育集团",
    "code": "GRP1704960000000",
    "kindergartenCount": 3
  },
  "message": "升级成功"
}
```

---

## 8. 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突 (如集团编码已存在) |
| 500 | 服务器内部错误 |

**常见错误示例:**

```json
{
  "success": false,
  "error": "PERMISSION_DENIED",
  "message": "您没有权限访问该集团",
  "code": 403
}
```

```json
{
  "success": false,
  "error": "RESOURCE_NOT_FOUND",
  "message": "集团不存在",
  "code": 404
}
```

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "集团名称不能为空",
  "code": 400
}
```

---

**文档版本**: 1.0.0  
**最后更新**: 2025-01-10  
**维护者**: 开发团队

