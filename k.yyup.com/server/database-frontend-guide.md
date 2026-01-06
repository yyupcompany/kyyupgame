# 数据库前端开发指南

## 快速参考

### 核心表关系速查
```
用户登录 → users → user_roles → roles → role_permissions → permissions
教师信息 → teachers → users (通过user_id)
学生信息 → students → classes → kindergartens
家长信息 → parents → parent_student_relations → students
活动管理 → activities → activity_registrations → parents/students
招生管理 → enrollment_plans → enrollment_applications → parents
```

## 前端页面与数据表对应关系

### 1. 登录/认证页面
**需要的表**: `users`, `roles`, `permissions`
```javascript
// 登录验证
POST /api/auth/login
Body: { username, password }
返回: { user, roles, permissions, token }

// 获取用户信息
GET /api/users/profile
返回: { id, username, email, realName, phone, status, roles }
```

### 2. 仪表盘/首页
**需要的表**: `kindergartens`, `users`, `students`, `teachers`, `classes`, `activities`, `enrollment_applications`
```javascript
// 获取仪表盘数据
GET /api/dashboard/stats
返回: {
  totalStudents: 从students表统计,
  totalTeachers: 从teachers表统计,
  totalClasses: 从classes表统计,
  totalActivities: 从activities表统计,
  recentApplications: 从enrollment_applications表获取最近申请
}
```

### 3. 用户管理页面
**需要的表**: `users`, `roles`, `user_roles`, `permissions`, `role_permissions`
```javascript
// 获取用户列表
GET /api/users?page=1&limit=10&search=xxx
返回: { users: [...], total, page, limit }

// 创建用户
POST /api/users
Body: { username, password, email, realName, phone, roleIds }

// 分配角色
POST /api/users/:userId/roles
Body: { roleIds: [1, 2, 3] }
```

### 4. 班级管理页面
**需要的表**: `classes`, `teachers`, `students`, `class_teachers`, `kindergartens`
```javascript
// 获取班级列表
GET /api/classes?kindergartenId=1
返回: {
  classes: [{
    id, name, code, type, grade, capacity, currentStudentCount,
    headTeacher: { id, name }, // 从teachers表关联
    students: [...], // 从students表关联
    status
  }]
}

// 分配教师到班级
POST /api/classes/:classId/teachers
Body: { teacherId, isMainTeacher, subject }
```

### 5. 学生管理页面
**需要的表**: `students`, `parents`, `parent_student_relations`, `classes`, `kindergartens`
```javascript
// 获取学生列表
GET /api/students?classId=1&page=1&limit=10
返回: {
  students: [{
    id, name, studentNo, gender, birthDate, enrollmentDate,
    class: { id, name }, // 从classes表关联
    parents: [...], // 从parent_student_relations表关联
    status
  }]
}

// 关联家长
POST /api/students/:studentId/parents
Body: { parentId, relationship }
```

### 6. 教师管理页面
**需要的表**: `teachers`, `users`, `classes`, `class_teachers`, `kindergartens`
```javascript
// 获取教师列表
GET /api/teachers?kindergartenId=1
返回: {
  teachers: [{
    id, teacherNo, position, hireDate, education,
    user: { id, realName, phone, email }, // 从users表关联
    classes: [...], // 从class_teachers表关联
    status
  }]
}

// 创建教师
POST /api/teachers
Body: { userId, kindergartenId, teacherNo, position, hireDate, education }
```

### 7. 家长管理页面
**需要的表**: `parents`, `students`, `parent_student_relations`
```javascript
// 获取家长列表
GET /api/parents?page=1&limit=10
返回: {
  parents: [{
    id, name, gender, phone, email, relationship, occupation,
    students: [...], // 从parent_student_relations表关联
    status
  }]
}
```

### 8. 活动管理页面
**需要的表**: `activities`, `activity_registrations`, `activity_evaluations`, `enrollment_plans`, `kindergartens`
```javascript
// 获取活动列表
GET /api/activities?kindergartenId=1&status=1
返回: {
  activities: [{
    id, title, activityType, startTime, endTime, location, capacity,
    registeredCount, checkedInCount, fee, description, status,
    registrations: [...], // 从activity_registrations表关联
    evaluations: [...] // 从activity_evaluations表关联
  }]
}

// 活动报名
POST /api/activities/:activityId/registrations
Body: { parentId, studentId, contactName, contactPhone, childName }
```

### 9. 招生管理页面
**需要的表**: `enrollment_plans`, `enrollment_applications`, `enrollment_consultations`, `enrollment_quotas`, `kindergartens`
```javascript
// 获取招生计划
GET /api/enrollment/plans?year=2024&kindergartenId=1
返回: {
  plans: [{
    id, title, year, semester, startDate, endDate, 
    targetCount, targetAmount, ageRange, status,
    applications: [...], // 从enrollment_applications表关联
    quotas: [...] // 从enrollment_quotas表关联
  }]
}

// 报名申请
POST /api/enrollment/applications
Body: { 
  studentName, gender, birthDate, parentId, planId, 
  contactPhone, applicationSource 
}

// 招生咨询
POST /api/enrollment/consultations
Body: {
  kindergartenId, consultantId, parentName, childName, 
  contactPhone, consultContent, consultMethod
}
```

### 10. 系统设置页面
**需要的表**: `system_configs`, `notifications`, `message_templates`
```javascript
// 获取系统配置
GET /api/system/configs?group=general
返回: {
  configs: [{
    id, key, value, type, description, isEditable, groupName
  }]
}

// 更新配置
PUT /api/system/configs/:key
Body: { value }

// 获取通知
GET /api/notifications?recipientId=1&isRead=false
返回: {
  notifications: [{
    id, type, title, content, isRead, readAt, createdAt
  }]
}
```

## 常用查询模式

### 1. 分页查询
```javascript
// 前端发送
GET /api/students?page=1&limit=10&search=张三&classId=1

// 后端返回
{
  data: [...],
  total: 100,
  page: 1,
  limit: 10,
  totalPages: 10
}
```

### 2. 关联查询
```javascript
// 获取学生及其班级、家长信息
GET /api/students?include=class,parents
返回: {
  students: [{
    id, name, studentNo,
    class: { id, name },
    parents: [{ id, name, phone, relationship }]
  }]
}
```

### 3. 筛选查询
```javascript
// 按状态筛选
GET /api/activities?status=1&activityType=1
// 按时间范围筛选
GET /api/activities?startTime=2024-01-01&endTime=2024-12-31
// 多条件筛选
GET /api/students?classId=1&gender=1&status=1
```

### 4. 统计查询
```javascript
// 获取统计数据
GET /api/dashboard/stats
返回: {
  studentStats: { total: 500, active: 480, onLeave: 20 },
  teacherStats: { total: 50, active: 48, onLeave: 2 },
  classStats: { total: 20, active: 18, full: 5 },
  activityStats: { total: 100, ongoing: 5, completed: 95 }
}
```

## 数据状态说明

### 用户状态 (users.status)
- `active`: 激活状态
- `inactive`: 未激活
- `locked`: 锁定状态

### 学生状态 (students.status)
- `0`: 退学
- `1`: 在读
- `2`: 请假
- `3`: 毕业
- `4`: 预录取

### 教师状态 (teachers.status)
- `0`: 离职
- `1`: 在职
- `2`: 请假中
- `3`: 见习期

### 活动状态 (activities.status)
- `0`: 计划中
- `1`: 报名中
- `2`: 已满员
- `3`: 进行中
- `4`: 已结束
- `5`: 已取消

### 报名申请状态 (enrollment_applications.status)
- `pending`: 待处理
- `reviewing`: 审核中
- `approved`: 已通过
- `rejected`: 已拒绝
- `canceled`: 已取消
- `expired`: 已过期

## 权限验证

### 角色权限检查
```javascript
// 前端检查用户权限
function hasPermission(requiredPermission) {
  const userPermissions = getUserPermissions(); // 从store获取
  return userPermissions.includes(requiredPermission);
}

// 页面级权限控制
if (!hasPermission('student.read')) {
  // 隐藏或禁用相关功能
}
```

### API权限控制
```javascript
// 后端中间件验证
// 每个API都会验证用户权限
// 前端需要在请求头中携带token
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## 错误处理

### 常见错误码
- `400`: 请求参数错误
- `401`: 未授权，需要登录
- `403`: 权限不足
- `404`: 资源不存在
- `409`: 数据冲突（如重复创建）
- `500`: 服务器内部错误

### 错误响应格式
```javascript
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: '用户名已存在',
    details: {
      field: 'username',
      value: 'admin'
    }
  }
}
```

## 最佳实践

### 1. 数据缓存
- 用户信息、权限等相对固定的数据可以缓存
- 统计数据可以设置合理的缓存时间
- 实时性要求高的数据避免缓存

### 2. 分页处理
- 列表数据都应该分页
- 默认分页大小建议10-20条
- 提供页码和总数信息

### 3. 搜索优化
- 提供模糊搜索功能
- 支持多字段搜索
- 搜索结果高亮显示

### 4. 数据验证
- 前端输入验证
- 后端数据验证
- 统一错误提示格式

### 5. 状态管理
- 使用状态管理工具（如Redux, Vuex）
- 统一管理用户状态、权限等
- 避免重复请求相同数据

这个指南为前端开发者提供了清晰的数据库使用指导，有助于API校准工作的顺利进行。