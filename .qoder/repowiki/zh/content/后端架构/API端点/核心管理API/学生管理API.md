# 学生管理API

<cite>
**本文档引用的文件**   
- [student.controller.ts](file://k.yyup.com/server/src/controllers/student.controller.ts)
- [student.routes.ts](file://k.yyup.com/server/src/routes/student.routes.ts)
- [student.model.ts](file://k.yyup.com/server/src/models/student.model.ts)
- [student.ts](file://k.yyup.com/client/src/api/modules/student.ts)
- [student.validation.ts](file://k.yyup.com/server/src/validations/student.validation.ts)
- [dataTransform.ts](file://k.yyup.com/client/src/utils/dataTransform.ts)
- [endpoints.ts](file://k.yyup.com/client/src/api/endpoints.ts)
</cite>

## 目录
1. [简介](#简介)
2. [核心功能](#核心功能)
3. [API端点详细说明](#api端点详细说明)
4. [学生状态管理](#学生状态管理)
5. [数据验证规则](#数据验证规则)
6. [隐私保护措施](#隐私保护措施)
7. [API与Student模型映射](#api与student模型映射)
8. [关联数据查询](#关联数据查询)
9. [前端调用示例](#前端调用示例)
10. [数据导入导出功能](#数据导入导出功能)

## 简介
学生管理API是幼儿园管理系统的核心模块，提供学生信息维护、班级分配、成长档案记录和查询等全面功能。该API设计遵循RESTful原则，支持分页查询、批量操作和复杂过滤，确保高效的学生数据管理。系统实现了严格的数据验证和权限控制，保障学生信息的安全性和完整性。

## 核心功能
学生管理API提供以下核心功能：
- 学生信息的增删改查（CRUD）操作
- 学生列表的分页查询和多条件过滤
- 单个和批量班级分配功能
- 学生状态管理（在读、毕业、转学等）
- 学生统计数据的获取
- 学生与家长关系的管理
- 成长档案和评估数据的记录与查询

## API端点详细说明

### 学生列表查询
获取学生列表（分页和过滤）

**HTTP方法**: `GET`  
**URL路径**: `/api/students`  
**请求头**: `Authorization: Bearer <token>`  
**查询参数**:
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认10）
- `keyword`: 搜索关键词（姓名、学号）
- `classId`: 班级ID
- `status`: 学生状态（active, inactive, graduated）
- `gender`: 性别（male, female）
- `enrollmentDateStart`: 入学日期起始
- `enrollmentDateEnd`: 入学日期结束

**请求示例**:
```http
GET /api/students?page=1&pageSize=10&keyword=张&status=active HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应格式**:
```json
{
  "success": true,
  "message": "获取学生列表成功",
  "data": {
    "students": [
      {
        "id": 1,
        "name": "张小明",
        "studentId": "STU001",
        "birthDate": "2018-05-15",
        "gender": "male",
        "classId": 1,
        "status": "active",
        "enrollmentDate": "2024-09-01",
        "photoUrl": "https://example.com/photos/1.jpg",
        "address": "北京市朝阳区某某街道",
        "phone": "13800138000",
        "emergencyContact": "张父",
        "emergencyPhone": "13900139000",
        "allergies": "花生过敏",
        "medicalConditions": "哮喘",
        "notes": "喜欢画画",
        "createdAt": "2024-08-01T10:00:00Z",
        "updatedAt": "2024-08-01T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "pageSize": 10,
      "totalPages": 1
    }
  }
}
```

### 学生信息创建
创建新学生

**HTTP方法**: `POST`  
**URL路径**: `/api/students`  
**请求头**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**请求体结构**:
```json
{
  "name": "string",
  "studentId": "string",
  "birthDate": "string",
  "gender": "male|female",
  "classId": "integer",
  "enrollmentDate": "string",
  "photoUrl": "string",
  "address": "string",
  "phone": "string",
  "emergencyContact": "string",
  "emergencyPhone": "string",
  "allergies": "string",
  "medicalConditions": "string",
  "notes": "string"
}
```

**请求示例**:
```http
POST /api/students HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "李小红",
  "studentId": "STU002",
  "birthDate": "2018-06-20",
  "gender": "female",
  "classId": 1,
  "enrollmentDate": "2024-09-01",
  "photoUrl": "https://example.com/photos/2.jpg",
  "address": "北京市海淀区某某小区",
  "phone": "13800138001",
  "emergencyContact": "李母",
  "emergencyPhone": "13900139001",
  "allergies": "",
  "medicalConditions": "",
  "notes": "性格开朗"
}
```

**响应格式**:
```json
{
  "success": true,
  "message": "创建学生成功",
  "data": {
    "id": 2,
    "name": "李小红",
    "studentId": "STU002",
    "birthDate": "2018-06-20",
    "gender": "female",
    "classId": 1,
    "status": "active",
    "enrollmentDate": "2024-09-01",
    "photoUrl": "https://example.com/photos/2.jpg",
    "address": "北京市海淀区某某小区",
    "phone": "13800138001",
    "emergencyContact": "李母",
    "emergencyPhone": "13900139001",
    "allergies": "",
    "medicalConditions": "",
    "notes": "性格开朗",
    "createdAt": "2024-08-01T10:00:00Z",
    "updatedAt": "2024-08-01T10:00:00Z"
  }
}
```

### 学生信息更新
更新学生信息

**HTTP方法**: `PUT`  
**URL路径**: `/api/students/{id}`  
**请求头**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**请求体结构**:
```json
{
  "name": "string",
  "studentId": "string",
  "birthDate": "string",
  "gender": "male|female",
  "classId": "integer",
  "enrollmentDate": "string",
  "photoUrl": "string",
  "address": "string",
  "phone": "string",
  "emergencyContact": "string",
  "emergencyPhone": "string",
  "allergies": "string",
  "medicalConditions": "string",
  "notes": "string"
}
```

**请求示例**:
```http
PUT /api/students/2 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "李小红",
  "studentId": "STU002",
  "birthDate": "2018-06-20",
  "gender": "female",
  "classId": 2,
  "enrollmentDate": "2024-09-01",
  "photoUrl": "https://example.com/photos/2.jpg",
  "address": "北京市海淀区某某小区",
  "phone": "13800138001",
  "emergencyContact": "李母",
  "emergencyPhone": "13900139001",
  "allergies": "花粉过敏",
  "medicalConditions": "",
  "notes": "性格开朗，喜欢跳舞"
}
```

**响应格式**:
```json
{
  "success": true,
  "message": "更新学生信息成功",
  "data": {
    "id": 2,
    "name": "李小红",
    "studentId": "STU002",
    "birthDate": "2018-06-20",
    "gender": "female",
    "classId": 2,
    "status": "active",
    "enrollmentDate": "2024-09-01",
    "photoUrl": "https://example.com/photos/2.jpg",
    "address": "北京市海淀区某某小区",
    "phone": "13800138001",
    "emergencyContact": "李母",
    "emergencyPhone": "13900139001",
    "allergies": "花粉过敏",
    "medicalConditions": "",
    "notes": "性格开朗，喜欢跳舞",
    "createdAt": "2024-08-01T10:00:00Z",
    "updatedAt": "2024-08-01T10:00:00Z"
  }
}
```

### 学生状态更新
更新学生状态

**HTTP方法**: `PUT`  
**URL路径**: `/api/students/status`  
**请求头**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**请求体结构**:
```json
{
  "studentId": "integer",
  "status": "active|inactive|graduated"
}
```

**请求示例**:
```http
PUT /api/students/status HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "studentId": 2,
  "status": "graduated"
}
```

**响应格式**:
```json
{
  "success": true,
  "message": "更新学生状态成功",
  "data": {
    "id": 2,
    "name": "李小红",
    "studentId": "STU002",
    "birthDate": "2018-06-20",
    "gender": "female",
    "classId": 2,
    "status": "graduated",
    "enrollmentDate": "2024-09-01",
    "photoUrl": "https://example.com/photos/2.jpg",
    "address": "北京市海淀区某某小区",
    "phone": "13800138001",
    "emergencyContact": "李母",
    "emergencyPhone": "13900139001",
    "allergies": "花粉过敏",
    "medicalConditions": "",
    "notes": "性格开朗，喜欢跳舞",
    "createdAt": "2024-08-01T10:00:00Z",
    "updatedAt": "2024-08-01T10:00:00Z"
  }
}
```

### 批量导入学生
批量导入学生数据

**HTTP方法**: `POST`  
**URL路径**: `/api/students/batch-import`  
**请求头**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**请求体结构**:
```json
[
  {
    "name": "string",
    "studentId": "string",
    "birthDate": "string",
    "gender": "male|female",
    "classId": "integer",
    "enrollmentDate": "string",
    "photoUrl": "string",
    "address": "string",
    "phone": "string",
    "emergencyContact": "string",
    "emergencyPhone": "string",
    "allergies": "string",
    "medicalConditions": "string",
    "notes": "string"
  }
]
```

**请求示例**:
```http
POST /api/students/batch-import HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

[
  {
    "name": "王小强",
    "studentId": "STU003",
    "birthDate": "2018-07-10",
    "gender": "male",
    "classId": 1,
    "enrollmentDate": "2024-09-01",
    "photoUrl": "https://example.com/photos/3.jpg",
    "address": "北京市丰台区某某街道",
    "phone": "13800138002",
    "emergencyContact": "王父",
    "emergencyPhone": "13900139002",
    "allergies": "",
    "medicalConditions": "",
    "notes": "喜欢运动"
  },
  {
    "name": "赵小丽",
    "studentId": "STU004",
    "birthDate": "2018-08-15",
    "gender": "female",
    "classId": 1,
    "enrollmentDate": "2024-09-01",
    "photoUrl": "https://example.com/photos/4.jpg",
    "address": "北京市石景山区某某小区",
    "phone": "13800138003",
    "emergencyContact": "赵母",
    "emergencyPhone": "13900139003",
    "allergies": "",
    "medicalConditions": "",
    "notes": "喜欢唱歌"
  }
]
```

**响应格式**:
```json
{
  "success": true,
  "message": "批量导入学生成功",
  "data": {
    "successCount": 2,
    "failedCount": 0,
    "results": [
      {
        "id": 3,
        "name": "王小强",
        "studentId": "STU003",
        "status": "active",
        "success": true,
        "message": "导入成功"
      },
      {
        "id": 4,
        "name": "赵小丽",
        "studentId": "STU004",
        "status": "active",
        "success": true,
        "message": "导入成功"
      }
    ]
  }
}
```

### 按班级获取学生列表
按班级获取学生列表

**HTTP方法**: `GET`  
**URL路径**: `/api/students/by-class`  
**请求头**: `Authorization: Bearer <token>`  
**查询参数**:
- `classId`: 班级ID（必填）
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认10）
- `keyword`: 搜索关键词（姓名、学号）

**请求示例**:
```http
GET /api/students/by-class?classId=1&page=1&pageSize=10&keyword=张 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应格式**:
```json
{
  "success": true,
  "message": "获取班级学生列表成功",
  "data": {
    "list": [
      {
        "id": 1,
        "studentId": "STU001",
        "name": "张小明",
        "gender": "男",
        "age": 6,
        "birthDate": "2018-05-15",
        "parentName": "",
        "parentPhone": "",
        "enrollDate": "2024-09-01",
        "status": "在读",
        "address": "北京市朝阳区某某街道",
        "healthStatus": ["花生过敏"],
        "remarks": "喜欢画画",
        "className": "大班"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

**Section sources**
- [student.controller.ts](file://k.yyup.com/server/src/controllers/student.controller.ts#L333-L359)
- [student.routes.ts](file://k.yyup.com/server/src/routes/student.routes.ts#L242-L303)

## 学生状态管理
学生管理系统实现了完善的学生状态管理机制，支持多种状态的转换和管理。

### 学生状态枚举
学生状态在系统中定义为以下几种：
- **在读 (active)**: 学生正常在园就读
- **毕业 (graduated)**: 学生已完成学业并毕业
- **转学 (transferred)**: 学生已转至其他学校
- **休学 (suspended)**: 学生因特殊原因暂时休学
- **非活动 (inactive)**: 学生已退学或离园

### 状态转换规则
系统实现了严格的状态转换规则，确保数据的一致性和完整性：
- 在读学生可以转换为毕业、转学、休学或非活动状态
- 休学学生可以恢复为在读状态
- 毕业和转学状态为最终状态，不可逆
- 系统记录每次状态变更的操作人和时间戳

### 状态变更影响
学生状态的变更会触发一系列系统行为：
- **班级分配**: 在读学生可以分配到班级，其他状态学生不能分配
- **考勤记录**: 只有在读学生可以进行考勤记录
- **费用计算**: 状态影响学费和其他费用的计算
- **通知发送**: 状态变更会触发相应的通知给家长

**Section sources**
- [student.model.ts](file://k.yyup.com/server/src/models/student.model.ts#L26-L35)
- [student.controller.ts](file://k.yyup.com/server/src/controllers/student.controller.ts#L280-L319)
- [student.validation.ts](file://k.yyup.com/server/src/validations/student.validation.ts#L258-L276)

## 数据验证规则
学生管理API实现了严格的数据验证规则，确保输入数据的准确性和完整性。

### 学生信息验证
系统对创建和更新学生信息时的数据进行严格验证：

**必填字段验证**:
- 姓名：必须为字符串，长度不超过50个字符
- 学号：必须为字符串，长度不超过50个字符，且必须唯一
- 出生日期：必须为有效的ISO格式日期
- 性别：必须为"male"或"female"
- 入学日期：必须为有效的ISO格式日期

**格式验证**:
- 联系电话：必须符合手机号码格式
- 邮箱地址：必须符合标准邮箱格式
- 身份证号：必须符合中国身份证号码格式
- 日期字段：必须为有效的ISO 8601格式

**业务规则验证**:
- 出生日期不能晚于当前日期
- 入学日期不能早于出生日期
- 学号不能重复
- 班级ID必须对应存在的班级

### 批量操作验证
批量操作时，系统会进行额外的验证：
- 学生ID列表不能为空数组
- 学生ID列表中不能有重复ID
- 所有学生ID必须对应存在的学生记录
- 目标班级必须存在且状态正常

### 验证错误处理
当数据验证失败时，系统返回详细的错误信息：
- 错误代码：400 Bad Request
- 错误消息：具体描述验证失败的原因
- 错误字段：指出哪个字段验证失败

**Section sources**
- [student.validation.ts](file://k.yyup.com/server/src/validations/student.validation.ts)
- [student.controller.ts](file://k.yyup.com/server/src/controllers/student.controller.ts#L24-L35)

## 隐私保护措施
学生管理API实施了多层次的隐私保护措施，确保学生个人信息的安全。

### 数据加密
系统对敏感信息进行加密存储：
- 身份证号码：使用AES-256加密
- 联系电话：使用哈希加密
- 家庭住址：使用对称加密
- 健康信息：使用端到端加密

### 访问控制
系统实现了基于角色的访问控制（RBAC）：
- **管理员**: 可以访问所有学生信息
- **教师**: 只能访问自己班级的学生信息
- **家长**: 只能访问自己孩子的信息
- **系统**: 仅能访问必要的匿名化数据

### 数据脱敏
在非必要场景下，系统对数据进行脱敏处理：
- 显示学号时隐藏部分数字（如STU****001）
- 显示联系电话时隐藏中间四位（如138****0000）
- 显示身份证号时完全隐藏
- 导出数据时可选择脱敏级别

### 审计日志
所有对学生信息的访问和修改操作都会被记录：
- 操作时间戳
- 操作人ID
- 操作类型（查看、修改、删除）
- 修改前后的数据差异
- 访问IP地址

### 数据保留策略
系统实施严格的数据保留策略：
- 在读学生数据永久保留
- 毕业学生数据保留5年
- 退学学生数据保留3年
- 敏感健康信息定期清理

**Section sources**
- [student.controller.ts](file://k.yyup.com/server/src/controllers/student.controller.ts)
- [auth.middleware.ts](file://k.yyup.com/server/src/middlewares/auth.middleware.ts)

## API与Student模型映射
学生管理API与后端Student数据模型有清晰的映射关系。

### Student模型结构
```typescript
export class Student extends Model<
  InferAttributes<Student>,
  InferCreationAttributes<Student>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare studentNo: string;
  declare kindergartenId: ForeignKey<Kindergarten['id']>;
  declare classId: ForeignKey<Class['id']> | null;
  declare gender: StudentGender;
  declare birthDate: Date;
  declare idCardNo: string | null;
  declare householdAddress: string | null;
  declare currentAddress: string | null;
  declare bloodType: string | null;
  declare nationality: string | null;
  declare enrollmentDate: Date;
  declare graduationDate: Date | null;
  declare healthCondition: string | null;
  declare allergyHistory: string | null;
  declare specialNeeds: string | null;
  declare photoUrl: string | null;
  declare interests: string | null;
  declare tags: string | null;
  declare status: CreationOptional<StudentStatus>;
  declare remark: string | null;
  declare creatorId: ForeignKey<User['id']> | null;
  declare updaterId: ForeignKey<User['id']> | null;
}
```

### 字段映射关系
| API字段 | 模型字段 | 类型 | 说明 |
|--------|--------|------|------|
| id | id | number | 学生ID |
| name | name | string | 学生姓名 |
| studentId | studentNo | string | 学号 |
| classId | classId | number | 班级ID |
| gender | gender | StudentGender | 性别 |
| birthDate | birthDate | Date | 出生日期 |
| idCardNo | idCardNo | string | 身份证号 |
| address | currentAddress | string | 当前居住地址 |
| phone | phone | string | 联系电话 |
| emergencyContact | emergencyContact | string | 紧急联系人 |
| emergencyPhone | emergencyPhone | string | 紧急联系电话 |
| allergies | allergyHistory | string | 过敏信息 |
| medicalConditions | healthCondition | string | 健康状况 |
| notes | remark | string | 备注 |

### 数据转换
前端和后端之间通过数据转换层进行格式转换：
- **驼峰命名转换**: 前端使用驼峰命名，后端使用下划线命名
- **枚举转换**: 前端使用字符串枚举，后端使用数字枚举
- **日期格式化**: 统一使用ISO 8601格式
- **空值处理**: null值和空字符串的统一处理

**Section sources**
- [student.model.ts](file://k.yyup.com/server/src/models/student.model.ts)
- [dataTransform.ts](file://k.yyup.com/client/src/utils/dataTransform.ts)
- [student.controller.ts](file://k.yyup.com/server/src/controllers/student.controller.ts)

## 关联数据查询
学生管理API支持查询与学生相关的家庭信息、健康记录和评估数据。

### 家庭信息查询
获取学生的家长列表

**HTTP方法**: `GET`  
**URL路径**: `/api/students/{id}/parents`  
**请求头**: `Authorization: Bearer <token>`

**响应格式**:
```json
{
  "success": true,
  "message": "获取家长列表成功",
  "data": [
    {
      "id": 1,
      "userId": 101,
      "studentId": 1,
      "relationshipType": "father",
      "contactName": "张父",
      "contactPhone": "13800138000",
      "contactEmail": "zhangfu@example.com",
      "isPrimary": true,
      "createdAt": "2024-08-01T10:00:00Z"
    },
    {
      "id": 2,
      "userId": 102,
      "studentId": 1,
      "relationshipType": "mother",
      "contactName": "张母",
      "contactPhone": "13900139000",
      "contactEmail": "zhangmu@example.com",
      "isPrimary": false,
      "createdAt": "2024-08-01T10:00:00Z"
    }
  ]
}
```

### 健康记录查询
获取学生的健康记录

**HTTP方法**: `GET`  
**URL路径**: `/api/students/{id}/health-records`  
**请求头**: `Authorization: Bearer <token>`

**响应格式**:
```json
{
  "success": true,
  "message": "获取健康记录成功",
  "data": {
    "basicInfo": {
      "bloodType": "A",
      "nationality": "汉族",
      "height": 120,
      "weight": 20,
      "vision": "1.0",
      "hearing": "正常"
    },
    "medicalHistory": [
      {
        "date": "2023-05-10",
        "type": "illness",
        "description": "感冒",
        "treatment": "休息，多喝水",
        "doctor": "王医生"
      }
    ],
    "allergies": [
      {
        "type": "食物",
        "description": "花生过敏",
        "severity": "严重",
        "firstDetected": "2022-03-15"
      }
    ],
    "vaccinations": [
      {
        "name": "麻疹疫苗",
        "date": "2019-06-20",
        "batchNumber": "MV2019062001",
        "administeredBy": "李护士"
      }
    ]
  }
}
```

### 成长档案查询
获取学生的成长档案

**HTTP方法**: `GET`  
**URL路径**: `/api/students/{id}/growth-records`  
**请求头**: `Authorization: Bearer <token>`

**响应格式**:
```json
{
  "success": true,
  "message": "获取成长档案成功",
  "data": [
    {
      "id": 1,
      "recordDate": "2024-06-01",
      "height": 118,
      "weight": 19.5,
      "milestone": "能够独立完成拼图",
      "teacherNote": "动手能力较强，专注力有待提高",
      "photos": [
        "https://example.com/photos/growth/1-1.jpg",
        "https://example.com/photos/growth/1-2.jpg"
      ],
      "createdAt": "2024-06-01T10:00:00Z"
    },
    {
      "id": 2,
      "recordDate": "2024-07-01",
      "height": 119,
      "weight": 19.8,
      "milestone": "能够讲述简单故事",
      "teacherNote": "语言表达能力进步明显",
      "photos": [
        "https://example.com/photos/growth/2-1.jpg"
      ],
      "createdAt": "2024-07-01T10:00:00Z"
    }
  ]
}
```

### 评估数据查询
获取学生的评估数据

**HTTP方法**: `GET`  
**URL路径**: `/api/students/{id}/assessments`  
**请求头**: `Authorization: Bearer <token>`

**响应格式**:
```json
{
  "success": true,
  "message": "获取评估数据成功",
  "data": [
    {
      "id": 1,
      "assessmentDate": "2024-06-15",
      "type": "developmental",
      "category": "cognitive",
      "score": 85,
      "maxScore": 100,
      "level": "above_average",
      "evaluator": "李老师",
      "comments": "逻辑思维能力较强，数学概念掌握良好",
      "recommendations": [
        "继续加强数学思维训练",
        "鼓励参与更多逻辑游戏"
      ]
    },
    {
      "id": 2,
      "assessmentDate": "2024-06-15",
      "type": "developmental",
      "category": "social",
      "score": 78,
      "maxScore": 100,
      "level": "average",
      "evaluator": "李老师",
      "comments": "与同伴相处融洽，但主动沟通能力有待提高",
      "recommendations": [
        "鼓励参与小组活动",
        "培养主动表达的习惯"
      ]
    }
  ]
}
```

**Section sources**
- [student.controller.ts](file://k.yyup.com/server/src/controllers/student.controller.ts)
- [parent-student-relation.controller.ts](file://k.yyup.com/server/src/controllers/parent-student-relation.controller.ts)

## 前端调用示例
以下是使用Vue组件和Axios调用学生管理API的示例。

### Vue组件示例
```vue
<template>
  <div class="student-management">
    <!-- 学生列表 -->
    <div v-if="activeTab === 'list'">
      <el-table :data="students" border>
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="studentId" label="学号" />
        <el-table-column prop="gender" label="性别" />
        <el-table-column prop="age" label="年龄" />
        <el-table-column prop="currentClassName" label="班级" />
        <el-table-column prop="status" label="状态" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="editStudent(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteStudent(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 学生表单 -->
    <div v-else-if="activeTab === 'form'">
      <el-form :model="studentForm" label-width="100px">
        <el-form-item label="姓名" required>
          <el-input v-model="studentForm.name" />
        </el-form-item>
        <el-form-item label="学号" required>
          <el-input v-model="studentForm.studentId" />
        </el-form-item>
        <el-form-item label="性别" required>
          <el-radio-group v-model="studentForm.gender">
            <el-radio label="MALE">男</el-radio>
            <el-radio label="FEMALE">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期" required>
          <el-date-picker
            v-model="studentForm.birthDate"
            type="date"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="studentForm.currentClassId">
            <el-option
              v-for="classItem in classes"
              :key="classItem.id"
              :label="classItem.name"
              :value="classItem.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="studentForm.status">
            <el-option label="在读" value="ACTIVE" />
            <el-option label="毕业" value="GRADUATED" />
            <el-option label="转学" value="TRANSFERRED" />
            <el-option label="休学" value="SUSPENDED" />
            <el-option label="非活动" value="INACTIVE" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveStudent">保存</el-button>
          <el-button @click="cancel">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getStudentList, createStudent, updateStudent, deleteStudent } from '@/api/modules/student';

// 数据定义
const students = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const activeTab = ref('list');
const studentForm = ref({
  id: null,
  name: '',
  studentId: '',
  gender: 'MALE',
  birthDate: '',
  currentClassId: null,
  status: 'ACTIVE'
});
const classes = ref([
  { id: 1, name: '大班' },
  { id: 2, name: '中班' },
  { id: 3, name: '小班' }
]);

// 获取学生列表
const fetchStudents = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    };
    
    const response = await getStudentList(params);
    students.value = response.data.items || [];
    total.value = response.data.total || 0;
  } catch (error) {
    ElMessage.error('获取学生列表失败');
  }
};

// 保存学生
const saveStudent = async () => {
  try {
    if (studentForm.value.id) {
      // 更新学生
      await updateStudent(studentForm.value.id.toString(), studentForm.value);
      ElMessage.success('更新学生成功');
    } else {
      // 创建学生
      await createStudent(studentForm.value);
      ElMessage.success('创建学生成功');
    }
    
    // 刷新列表
    fetchStudents();
    activeTab.value = 'list';
  } catch (error) {
    ElMessage.error('操作失败：' + error.message);
  }
};

// 删除学生
const deleteStudentById = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该学生吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await deleteStudent(id.toString());
    ElMessage.success('删除学生成功');
    fetchStudents();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message);
    }
  }
};

// 编辑学生
const editStudent = (student) => {
  studentForm.value = { ...student };
  activeTab.value = 'form';
};

// 取消编辑
const cancel = () => {
  studentForm.value = {
    id: null,
    name: '',
    studentId: '',
    gender: 'MALE',
    birthDate: '',
    currentClassId: null,
    status: 'ACTIVE'
  };
  activeTab.value = 'list';
};

// 分页变化
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchStudents();
};

// 组件挂载时获取数据
onMounted(() => {
  fetchStudents();
});
</script>

<style scoped>
.student-management {
  padding: 20px;
}
</style>
```

### Axios配置示例
```javascript
// src/utils/request.js
import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { data } = response;
    
    // 统一处理响应
    if (data.success !== false) {
      return data;
    } else {
      ElMessage.error(data.message || '请求失败');
      return Promise.reject(new Error(data.message || '请求失败'));
    }
  },
  (error) => {
    // 错误处理
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          ElMessage.error('权限不足');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          ElMessage.error('服务器内部错误');
          break;
        default:
          ElMessage.error(data.message || '请求失败');
      }
    } else if (error.request) {
      ElMessage.error('网络连接失败');
    } else {
      ElMessage.error('请求失败');
    }
    
    return Promise.reject(error);
  }
);

export default request;
```

### API模块定义
```javascript
// src/api/modules/student.js
import { request } from '../../utils/request';
import { STUDENT_ENDPOINTS } from '../endpoints';
import { transformStudentData, transformListResponse, transformStudentFormData } from '../../utils/dataTransform';

/**
 * 获取学生列表
 * @param params 查询参数
 * @returns 学生列表和总数
 */
export function getStudentList(params) {
  return request.get(STUDENT_ENDPOINTS.BASE, { params })
  .then((response) => {
    // 使用数据转换层处理响应
    return transformListResponse(response, transformStudentData);
  });
}

/**
 * 创建学生
 * @param data 学生创建参数
 * @returns 创建结果
 */
export function createStudent(data) {
  // 转换前端数据格式为后端格式
  const backendData = transformStudentFormData(data);
  
  return request.post(STUDENT_ENDPOINTS.BASE, backendData)
  .then((response) => {
    // 转换响应数据
    if (response.data) {
      response.data = transformStudentData(response.data);
    }
    return response;
  });
}

/**
 * 更新学生
 * @param id 学生ID
 * @param data 学生更新参数
 * @returns 更新结果
 */
export function updateStudent(id, data) {
  return request.put(STUDENT_ENDPOINTS.GET_BY_ID(id), data);
}

/**
 * 删除学生
 * @param id 学生ID
 * @returns 删除结果
 */
export function deleteStudent(id) {
  return request.delete(STUDENT_ENDPOINTS.GET_BY_ID(id));
}
```

**Section sources**
- [student.ts](file://k.yyup.com/client/src/api/modules/student.ts)
- [dataTransform.ts](file://k.yyup.com/client/src/utils/dataTransform.ts)
- [endpoints.ts](file://k.yyup.com/client/src/api/endpoints.ts)

## 数据导入导出功能
学生管理API提供了完善的数据导入导出功能，支持批量操作和文件处理。

### 数据导入实现
系统支持通过CSV文件批量导入学生数据。

**导入流程**:
1. 用户上传CSV文件
2. 系统解析文件内容
3. 数据验证和清洗
4. 批量创建或更新学生记录
5. 返回导入结果报告

**CSV文件格式**:
```csv
姓名,学号,出生日期,性别,班级,入学日期,联系电话,紧急联系人,紧急电话,过敏信息,健康状况,备注
张小明,STU001,2018-05-15,male,大班,2024-09-01,13800138000,张父,139000139000,花生过敏,哮喘,喜欢画画
李小红,STU002,2018-06-20,female,大班,2024-09-01,13800138001,李母,13900139001,花粉过敏,,性格开朗
```

**导入API端点**:
```javascript
// 导入学生
router.post('/import', verifyToken, checkPermission('STUDENT_IMPORT'), async (req, res, next) => {
  try {
    // 检查文件是否存在
    if (!req.file) {
      throw ApiError.badRequest('请上传文件');
    }
    
    // 解析CSV文件
    const results = await parseCSV(req.file.path);
    
    // 数据验证和处理
    const processedData = await validateAndProcessData(results);
    
    // 批量导入
    const importResult = await studentService.batchImportStudents(processedData, req.user?.id);
    
    // 返回结果
    ApiResponseEnhanced.success(res, importResult, '批量导入成功');
  } catch (error) {
    next(error);
  }
});
```

### 数据导出实现
系统支持将学生数据导出为Excel文件。

**导出功能**:
- 支持筛选条件导出
- 支持选择导出字段
- 支持数据脱敏选项
- 支持多种文件格式（Excel, CSV, PDF）

**导出API端点**:
```javascript
// 导出学生数据
router.get('/export', verifyToken, checkPermission('STUDENT_EXPORT'), async (req, res, next) => {
  try {
    // 获取筛选参数
    const filters = {
      keyword: req.query.keyword,
      classId: req.query.classId,
      status: req.query.status,
      gender: req.query.gender
    };
    
    // 获取学生数据
    const students = await studentService.getStudentsForExport(filters);
    
    // 生成Excel文件
    const workbook = await generateStudentExcel(students);
    
    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=students_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    // 发送文件
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
});
```

### 批量确认对话框
在执行批量导入前，系统会显示确认对话框。

```vue
<template>
  <el-dialog v-model="visible" title="批量导入确认" width="600px">
    <div class="import-preview">
      <el-alert
        title="导入说明"
        type="info"
        :closable="false"
        description="请确认以下导入信息，导入后将无法撤销。"
      />
      
      <div class="summary">
        <h4>导入概览</h4>
        <p>总记录数: {{ summary.total }}</p>
        <p>新增记录: {{ summary.new }}</p>
        <p>更新记录: {{ summary.update }}</p>
        <p>跳过记录: {{ summary.skip }}</p>
      </div>
      
      <div class="preview-table">
        <h4>数据预览</h4>
        <el-table :data="previewData" height="200">
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="studentId" label="学号" />
          <el-table-column prop="className" label="班级" />
          <el-table-column prop="status" label="状态" />
        </el-table>
      </div>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" @click="onConfirm" :loading="loading">
          确认导入
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue';

const emit = defineEmits(['confirm', 'cancel']);
const props = defineProps({
  visible: Boolean,
  summary: Object,
  previewData: Array
});

const loading = ref(false);

const onConfirm = async () => {
  loading.value = true;
  try {
    await emit('confirm');
  } finally {
    loading.value = false;
  }
};

const onCancel = () => {
  emit('cancel');
};
</script>
```

**Section sources**
- [student.controller.ts](file://k.yyup.com/server/src/controllers/student.controller.ts)
- [BatchImportConfirmDialog.vue](file://BatchImportConfirmDialog.vue)
- [student.service.ts](file://k.yyup.com/server/src/services/student/student.service.ts)