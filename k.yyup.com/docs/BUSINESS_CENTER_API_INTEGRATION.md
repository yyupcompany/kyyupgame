# 业务中心快捷表单API集成 - 数据库关联分析

## 📋 概述

本文档详细分析业务中心8个快捷表单的数据库关联关系，为后端API集成提供完整的技术指导。

---

## 🔗 数据库关联关系图

### 1. 招生计划表单

#### 1.1 新建招生计划 (EnrollmentPlan)

**必需的关联数据**:
```typescript
{
  // 前端表单字段
  title: string,              // 计划名称
  year: number,               // 年份
  semester: 1 | 2,            // 学期 (1=春季, 2=秋季)
  targetCount: number,        // 招生目标人数
  startDate: Date,            // 开始日期
  endDate: Date,              // 结束日期
  ageRange: string,           // 年龄范围
  description: string,        // 计划描述
  
  // 需要后端自动填充的关联字段
  kindergartenId: number,     // ⚠️ 从当前用户获取
  creatorId: number,          // ⚠️ 从当前登录用户获取
  status: 0,                  // 默认为草稿状态
}
```

**数据库关联**:
- `kindergartenId` → `Kindergarten.id` (多对一)
- `creatorId` → `User.id` (多对一)

**API端点**: `POST /api/enrollment-plans`

**处理逻辑**:
```typescript
// 1. 从JWT token获取当前用户ID
const userId = req.user.id;

// 2. 从用户信息获取kindergartenId
const user = await User.findByPk(userId, {
  include: [{ model: Teacher, attributes: ['kindergartenId'] }]
});
const kindergartenId = user.Teacher?.kindergartenId;

// 3. 创建招生计划
const enrollmentPlan = await EnrollmentPlan.create({
  ...formData,
  kindergartenId,
  creatorId: userId,
  status: EnrollmentPlanStatus.DRAFT
});
```

---

#### 1.2 新建咨询记录 (EnrollmentConsultation)

**必需的关联数据**:
```typescript
{
  // 前端表单字段
  parentName: string,         // 家长姓名
  phone: string,              // 联系电话
  studentName: string,        // 学生姓名
  studentAge: number,         // 学生年龄
  consultationDate: Date,     // 咨询日期
  consultationContent: string,// 咨询内容
  
  // 需要后端自动填充的关联字段
  kindergartenId: number,     // ⚠️ 从当前用户获取
  consultantId: number,       // ⚠️ 从当前登录用户获取 (咨询师ID)
}
```

**数据库关联**:
- `kindergartenId` → `Kindergarten.id` (多对一)
- `consultantId` → `User.id` (多对一)

**API端点**: `POST /api/enrollment-consultations`

---

#### 1.3 新建入学申请 (EnrollmentApplication)

**必需的关联数据**:
```typescript
{
  // 前端表单字段
  studentName: string,        // 学生姓名
  gender: 1 | 2,              // 性别 (1=男, 2=女)
  birthDate: Date,            // 出生日期
  parentName: string,         // 家长姓名
  parentPhone: string,        // 家长电话
  desiredClass: string,       // 意向班级
  
  // 需要后端自动填充的关联字段
  kindergartenId: number,     // ⚠️ 从当前用户获取
  planId: number | null,      // ⚠️ 可选：关联到招生计划
  applicationDate: Date,      // 申请日期 (当前日期)
  status: 0,                  // 默认为待审核
}
```

**数据库关联**:
- `kindergartenId` → `Kindergarten.id` (多对一)
- `planId` → `EnrollmentPlan.id` (多对一，可选)

**API端点**: `POST /api/enrollment-applications`

---

### 2. 活动计划表单

#### 2.1 新建活动 (Activity)

**必需的关联数据**:
```typescript
{
  // 前端表单字段
  title: string,              // 活动名称
  activityType: 1-6,          // 活动类型 (1=开放日, 2=家长会, 3=亲子活动, 4=招生宣讲, 5=园区参观, 6=其他)
  startTime: Date,            // 开始时间
  endTime: Date,              // 结束时间
  registrationStartTime: Date,// 报名开始时间
  registrationEndTime: Date,  // 报名结束时间
  location: string,           // 活动地点
  capacity: number,           // 活动容量
  fee: number,                // 活动费用
  description: string,        // 活动描述
  
  // 需要后端自动填充的关联字段
  kindergartenId: number,     // ⚠️ 从当前用户获取
  planId: number | null,      // ⚠️ 可选：关联到招生计划
  creatorId: number,          // ⚠️ 从当前登录用户获取
  registeredCount: 0,         // 默认为0
  status: 0,                  // 默认为计划中
}
```

**数据库关联**:
- `kindergartenId` → `Kindergarten.id` (多对一)
- `planId` → `EnrollmentPlan.id` (多对一，可选)
- `creatorId` → `User.id` (多对一)

**API端点**: `POST /api/activities`

**特殊注意**:
- `registrationStartTime` 和 `registrationEndTime` 是必填字段
- `fee` 默认为0，表示免费活动

---

#### 2.2 新建报名 (ActivityRegistration)

**必需的关联数据**:
```typescript
{
  // 前端表单字段
  activityId: number,         // ⚠️ 活动ID (需要从活动列表选择)
  parentName: string,         // 家长姓名
  parentPhone: string,        // 家长电话
  studentName: string,        // 学生姓名
  studentAge: number,         // 学生年龄
  
  // 需要后端自动填充的关联字段
  registrationDate: Date,     // 报名日期 (当前日期)
  status: 0,                  // 默认为待确认
}
```

**数据库关联**:
- `activityId` → `Activity.id` (多对一)

**API端点**: `POST /api/activity-registrations`

**特殊注意**:
- 需要先查询可报名的活动列表
- 需要检查活动容量是否已满
- 报名成功后需要更新Activity的registeredCount

---

### 3. 人员基础信息表单

#### 3.1 新建教师 (Teacher + User)

**⚠️ 重要：需要创建两个关联记录**

**步骤1: 创建User记录**
```typescript
{
  // 前端表单字段
  realName: string,           // 教师姓名
  phone: string,              // 联系电话
  email: string,              // 电子邮箱
  
  // 需要后端自动填充的字段
  username: string,           // ⚠️ 自动生成 (如: phone或email)
  password: string,           // ⚠️ 自动生成默认密码
  role: 'teacher',            // 角色固定为teacher
  status: 1,                  // 默认为激活状态
}
```

**步骤2: 创建Teacher记录**
```typescript
{
  // 前端表单字段
  teacherNo: string,          // 教师工号
  position: 1-6,              // 职位 (1=园长, 2=副园长, 3=教研主任, 4=班主任, 5=普通教师, 6=助教)
  hireDate: Date,             // 入职日期
  education: 1-5,             // 学历 (1=高中, 2=大专, 3=本科, 4=硕士, 5=博士)
  major: string,              // 专业
  
  // 需要后端自动填充的关联字段
  userId: number,             // ⚠️ 从步骤1创建的User.id获取
  kindergartenId: number,     // ⚠️ 从当前用户获取
  creatorId: number,          // ⚠️ 从当前登录用户获取
  status: 1,                  // 默认为在职状态
}
```

**数据库关联**:
- `Teacher.userId` → `User.id` (一对一)
- `Teacher.kindergartenId` → `Kindergarten.id` (多对一)
- `Teacher.creatorId` → `User.id` (多对一)

**API端点**: `POST /api/teachers`

**处理逻辑**:
```typescript
// 使用事务确保数据一致性
const transaction = await sequelize.transaction();
try {
  // 1. 创建User
  const user = await User.create({
    username: formData.phone,
    password: await bcrypt.hash('123456', 10), // 默认密码
    realName: formData.realName,
    phone: formData.phone,
    email: formData.email,
    role: 'teacher',
    status: 1
  }, { transaction });
  
  // 2. 创建Teacher
  const teacher = await Teacher.create({
    userId: user.id,
    kindergartenId,
    teacherNo: formData.teacherNo,
    position: formData.position,
    hireDate: formData.hireDate,
    education: formData.education,
    major: formData.major,
    creatorId: userId,
    status: 1
  }, { transaction });
  
  await transaction.commit();
  return teacher;
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

---

#### 3.2 新建学生 (Student)

**必需的关联数据**:
```typescript
{
  // 前端表单字段
  name: string,               // 学生姓名
  studentNo: string,          // 学号
  gender: 1 | 2,              // 性别 (1=男, 2=女)
  birthDate: Date,            // 出生日期
  enrollmentDate: Date,       // 入学日期
  idCardNo: string,           // 身份证号
  healthCondition: string,    // 健康状况
  
  // 需要后端自动填充的关联字段
  kindergartenId: number,     // ⚠️ 从当前用户获取
  classId: number | null,     // ⚠️ 可选：班级ID
  creatorId: number,          // ⚠️ 从当前登录用户获取
  status: 1,                  // 默认为在读状态
}
```

**数据库关联**:
- `kindergartenId` → `Kindergarten.id` (多对一)
- `classId` → `Class.id` (多对一，可选)
- `creatorId` → `User.id` (多对一)

**API端点**: `POST /api/students`

---

#### 3.3 新建家长 (Parent + User)

**⚠️ 重要：需要创建两个关联记录**

**步骤1: 创建User记录**
```typescript
{
  // 前端表单字段
  realName: string,           // 家长姓名
  phone: string,              // 联系电话
  email: string,              // 电子邮箱
  
  // 需要后端自动填充的字段
  username: string,           // ⚠️ 自动生成 (如: phone)
  password: string,           // ⚠️ 自动生成默认密码
  role: 'parent',             // 角色固定为parent
  status: 1,                  // 默认为激活状态
}
```

**步骤2: 创建Parent记录**
```typescript
{
  // 前端表单字段
  relationship: string,       // 与学生关系 (父亲/母亲/爷爷/奶奶/外公/外婆/其他)
  isPrimaryContact: 0 | 1,    // 是否主要联系人
  occupation: string,         // 职业
  workUnit: string,           // 工作单位
  
  // 需要后端自动填充的关联字段
  userId: number,             // ⚠️ 从步骤1创建的User.id获取
  studentId: number,          // ⚠️ 需要从学生列表选择或创建
  creatorId: number,          // ⚠️ 从当前登录用户获取
  isPublic: true,             // 默认为公开
  followStatus: '待跟进',     // 默认跟进状态
  priority: 0,                // 默认优先级
}
```

**数据库关联**:
- `Parent.userId` → `User.id` (一对一)
- `Parent.studentId` → `Student.id` (多对一)
- `Parent.creatorId` → `User.id` (多对一)

**API端点**: `POST /api/parents`

**特殊注意**:
- 家长必须关联到学生，所以需要先有学生记录
- 如果学生不存在，可以考虑在创建家长时同时创建学生

---

## 🔧 后端API实现建议

### 1. 通用中间件

```typescript
// middleware/auth.middleware.ts
export const getKindergartenId = async (req, res, next) => {
  const userId = req.user.id;
  
  // 从Teacher表获取kindergartenId
  const teacher = await Teacher.findOne({
    where: { userId },
    attributes: ['kindergartenId']
  });
  
  if (!teacher) {
    return res.status(403).json({ message: '用户未关联幼儿园' });
  }
  
  req.kindergartenId = teacher.kindergartenId;
  next();
};
```

### 2. 事务处理

对于需要创建多个关联记录的操作（如创建教师、家长），必须使用事务：

```typescript
const transaction = await sequelize.transaction();
try {
  // 创建关联记录
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

### 3. 数据验证

```typescript
// 验证kindergartenId是否有效
const kindergarten = await Kindergarten.findByPk(kindergartenId);
if (!kindergarten) {
  throw new Error('幼儿园不存在');
}

// 验证关联数据是否存在
if (planId) {
  const plan = await EnrollmentPlan.findByPk(planId);
  if (!plan) {
    throw new Error('招生计划不存在');
  }
}
```

---

## ⚠️ 关键注意事项

### 1. kindergartenId的获取

**所有表单都需要kindergartenId**，必须从当前登录用户的Teacher记录中获取：

```typescript
const teacher = await Teacher.findOne({
  where: { userId: req.user.id }
});
const kindergartenId = teacher.kindergartenId;
```

### 2. 用户创建的特殊处理

创建教师和家长时，需要先创建User记录，然后创建Teacher/Parent记录。必须使用事务确保数据一致性。

### 3. 枚举值的验证

确保前端传递的枚举值与数据库定义一致：
- 学期: 1=春季, 2=秋季
- 性别: 1=男, 2=女
- 活动类型: 1-6
- 教师职位: 1-6
- 教师学历: 1-5

### 4. 日期格式处理

前端传递的日期格式为 `YYYY-MM-DD` 或 `YYYY-MM-DD HH:mm:ss`，后端需要转换为Date对象。

### 5. 默认值设置

某些字段需要设置默认值：
- `status`: 根据业务逻辑设置初始状态
- `registeredCount`: 0
- `priority`: 0
- `isPublic`: true

---

## 📝 API端点总结

| 表单 | API端点 | 方法 | 关联表 | 事务 |
|------|---------|------|--------|------|
| 新建招生计划 | `/api/enrollment-plans` | POST | EnrollmentPlan | ❌ |
| 新建咨询记录 | `/api/enrollment-consultations` | POST | EnrollmentConsultation | ❌ |
| 新建入学申请 | `/api/enrollment-applications` | POST | EnrollmentApplication | ❌ |
| 新建活动 | `/api/activities` | POST | Activity | ❌ |
| 新建报名 | `/api/activity-registrations` | POST | ActivityRegistration | ❌ |
| 新建教师 | `/api/teachers` | POST | User + Teacher | ✅ |
| 新建学生 | `/api/students` | POST | Student | ❌ |
| 新建家长 | `/api/parents` | POST | User + Parent | ✅ |

---

## 🎯 下一步行动

1. ✅ 创建通用中间件获取kindergartenId
2. ✅ 实现8个API端点
3. ✅ 添加数据验证逻辑
4. ✅ 实现事务处理（教师、家长）
5. ✅ 前端集成API调用
6. ✅ 测试完整的CRUD流程
7. ✅ 验证Timeline显示一致性

---

**文档版本**: 1.0  
**最后更新**: 2025-10-05  
**维护者**: AI Assistant

