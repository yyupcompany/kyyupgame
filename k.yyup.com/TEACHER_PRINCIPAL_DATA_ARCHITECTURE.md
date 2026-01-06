# 教师与园长数据架构对比分析

## 📋 概述

本文档分析教师和园长角色在系统中的数据访问权限、使用的数据库表以及数据过滤逻辑。

**生成时间**: 2025-10-05  
**分析范围**: 客户跟踪、活动管理、招生管理、任务管理

---

## 🎯 核心发现

### 数据访问模式

| 角色 | 数据访问模式 | 过滤方式 |
|------|------------|---------|
| **园长 (Principal)** | 全局访问 | 按幼儿园ID过滤 |
| **教师 (Teacher)** | 受限访问 | 按教师ID/班级ID过滤 |
| **管理员 (Admin)** | 完全访问 | 无过滤 |

---

## 📊 数据库表使用对比

### 1. 客户跟踪功能

#### 共享表

| 表名 | 用途 | 园长访问 | 教师访问 | 数据过滤 |
|------|------|---------|---------|---------|
| `parents` | 家长/客户信息 | ✅ 全部 | ⚠️ 受限 | `assigned_teacher_id` 或 `is_public=1` |
| `parent_followups` | 跟进记录 | ✅ 全部 | ⚠️ 受限 | `created_by = teacher_id` |
| `parent_student_relations` | 家长学生关系 | ✅ 全部 | ⚠️ 受限 | 通过班级关联 |

#### 关键字段

**parents表的教师权限字段**:
```sql
assigned_teacher_id INT         -- 分配的教师ID
is_public BOOLEAN               -- 是否公开（所有教师可见）
follow_status ENUM              -- 跟进状态
priority INT                    -- 优先级
last_followup_at DATETIME       -- 最后跟进时间
```

#### 数据访问规则

**园长**:
```typescript
// 可以看到所有客户
WHERE kindergarten_id = {principal_kindergarten_id}
```

**教师**:
```typescript
// 只能看到分配给自己的客户 + 公开客户
WHERE (assigned_teacher_id = {teacher_id} OR is_public = 1)
  AND kindergarten_id = {teacher_kindergarten_id}
```

---

### 2. 活动管理功能

#### 共享表

| 表名 | 用途 | 园长访问 | 教师访问 | 数据过滤 |
|------|------|---------|---------|---------|
| `activities` | 活动信息 | ✅ 全部 | ⚠️ 受限 | `activity_participants.teacher_id` 或 `is_public=1` |
| `activity_participants` | 活动参与者 | ✅ 全部 | ⚠️ 受限 | `teacher_id = {teacher_id}` |
| `activity_registrations` | 活动报名 | ✅ 全部 | ⚠️ 受限 | 通过活动关联 |
| `activity_evaluations` | 活动评估 | ✅ 全部 | ⚠️ 受限 | `teacher_id = {teacher_id}` |

#### 关键字段

**activity_participants表**:
```sql
activity_id INT                 -- 活动ID
teacher_id INT                  -- 教师ID
access_level INT                -- 访问级别：1-只读，2-管理，3-完全访问
role ENUM                       -- 角色：organizer, assistant, observer
is_active BOOLEAN               -- 是否启用
```

#### 数据访问规则

**园长**:
```typescript
// 可以看到所有活动
WHERE kindergarten_id = {principal_kindergarten_id}
```

**教师**:
```typescript
// 只能看到自己参与的活动 + 公开活动
WHERE EXISTS (
  SELECT 1 FROM activity_participants ap
  WHERE ap.activity_id = activities.id
    AND ap.teacher_id = {teacher_id}
    AND ap.is_active = 1
) OR is_public = 1
```

---

### 3. 招生管理功能

#### 共享表

| 表名 | 用途 | 园长访问 | 教师访问 | 数据过滤 |
|------|------|---------|---------|---------|
| `enrollment_applications` | 招生申请 | ✅ 全部 | ⚠️ 受限 | `created_by = teacher_id` |
| `enrollment_consultations` | 招生咨询 | ✅ 全部 | ⚠️ 受限 | `creator_id = teacher_id` |
| `enrollment_tasks` | 招生任务 | ✅ 全部 | ⚠️ 受限 | `assignee_id = teacher_id` |
| `enrollment_plans` | 招生计划 | ✅ 全部 | ✅ 只读 | 无过滤（公开数据） |
| `enrollment_quotas` | 招生名额 | ✅ 全部 | ✅ 只读 | 无过滤（公开数据） |

#### 数据访问规则

**园长**:
```typescript
// 可以看到所有招生数据
WHERE kindergarten_id = {principal_kindergarten_id}
```

**教师**:
```typescript
// 只能看到自己创建的咨询记录
WHERE creator_id = {teacher_id}

// 招生计划和名额是公开的（只读）
WHERE status = 'active'
```

---

### 4. 任务管理功能

#### 共享表

| 表名 | 用途 | 园长访问 | 教师访问 | 数据过滤 |
|------|------|---------|---------|---------|
| `todos` | 待办任务 | ✅ 全部 | ⚠️ 受限 | `assignee_id = teacher_id` 或 `creator_id = teacher_id` |
| `schedules` | 日程安排 | ✅ 全部 | ⚠️ 受限 | `user_id = teacher_id` |
| `notifications` | 通知消息 | ✅ 全部 | ⚠️ 受限 | `user_id = teacher_id` |

#### 数据访问规则

**园长**:
```typescript
// 可以看到所有任务
WHERE kindergarten_id = {principal_kindergarten_id}
```

**教师**:
```typescript
// 只能看到分配给自己的任务或自己创建的任务
WHERE assignee_id = {teacher_id} OR creator_id = {teacher_id}
```

---

## 🔒 权限控制实现

### 后端中间件

#### 1. 教师权限检查中间件

**文件**: `server/src/middlewares/teacher-permission.middleware.ts`

```typescript
export const checkTeacherRole = async (req, res, next) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  if (userRole === 'teacher') {
    // 查询教师ID
    const teacherId = await getTeacherIdByUserId(userId);
    
    req.teacherFilter = {
      isTeacher: true,
      teacherId,
      userId,
      canViewAll: false
    };
  } else if (userRole === 'admin' || userRole === 'principal') {
    req.teacherFilter = {
      canViewAll: true
    };
  }
  
  next();
};
```

#### 2. 客户池过滤

```typescript
export const filterCustomerPoolForTeacher = (req) => {
  const filter = req.teacherFilter;
  
  if (filter?.isTeacher && !filter.canViewAll) {
    // 教师只能看到分配给自己的客户 + 公开的客户
    return `WHERE (
      pf.created_by = ${filter.teacherId} OR
      pf.created_by IS NULL OR
      p.is_public = 1
    )`;
  }
  
  return 'WHERE 1=1'; // 园长/管理员无限制
};
```

#### 3. 活动过滤

```typescript
export const filterActivitiesForTeacher = (req) => {
  const filter = req.teacherFilter;
  
  if (filter?.isTeacher && !filter.canViewAll) {
    // 教师可以看到：1. 自己参与的活动 2. 公开的活动
    return {
      joinClause: `
        LEFT JOIN activity_participants ap 
        ON a.id = ap.activity_id 
        AND ap.teacher_id = ${filter.teacherId}
      `,
      whereConditions: `WHERE (
        ap.teacher_id IS NOT NULL OR
        a.is_public = 1
      )`
    };
  }
  
  return { whereConditions: 'WHERE 1=1' }; // 园长/管理员无限制
};
```

---

## 📐 架构图

### 数据访问层次结构

```
┌─────────────────────────────────────────────────────────────┐
│                        数据库层                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ parents  │  │activities│  │enrollment│  │  todos   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↑
                          │
┌─────────────────────────────────────────────────────────────┐
│                    权限过滤层                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  checkTeacherRole()                                  │  │
│  │  filterCustomerPoolForTeacher()                      │  │
│  │  filterActivitiesForTeacher()                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↑
                          │
┌─────────────────────────────────────────────────────────────┐
│                      API控制器层                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Customer │  │ Activity │  │Enrollment│  │   Task   │   │
│  │Controller│  │Controller│  │Controller│  │Controller│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↑
                          │
┌─────────────────────────────────────────────────────────────┐
│                      前端路由层                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Principal Pages │         │  Teacher Pages   │         │
│  │  (/principal/)   │         │(/teacher-center/)│         │
│  └──────────────────┘         └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 客户跟踪数据流

```
园长访问流程:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ 园长登录  │ -> │ 全局权限  │ -> │ 所有客户  │ -> │ 完整数据  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘

教师访问流程:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ 教师登录  │ -> │ 受限权限  │ -> │ 过滤查询  │ -> │ 部分数据  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                      │
                                      ├─> 分配给自己的客户
                                      └─> 公开的客户
```

---

## 🔍 数据可见性矩阵

### 客户跟踪

| 数据类型 | 园长 | 教师 | 说明 |
|---------|------|------|------|
| 所有客户列表 | ✅ | ❌ | 教师只能看到分配给自己的 |
| 分配给自己的客户 | ✅ | ✅ | 教师可以完全访问 |
| 公开客户 | ✅ | ✅ | 所有人可见 |
| 其他教师的客户 | ✅ | ❌ | 教师无法访问 |
| 客户跟进记录 | ✅ | ⚠️ | 教师只能看到自己创建的 |
| 客户统计数据 | ✅ | ⚠️ | 教师只能看到自己的统计 |

### 活动管理

| 数据类型 | 园长 | 教师 | 说明 |
|---------|------|------|------|
| 所有活动列表 | ✅ | ❌ | 教师只能看到参与的活动 |
| 自己参与的活动 | ✅ | ✅ | 教师可以完全访问 |
| 公开活动 | ✅ | ✅ | 所有人可见 |
| 活动报名数据 | ✅ | ⚠️ | 教师只能看到自己活动的 |
| 活动评估 | ✅ | ⚠️ | 教师只能评估自己的活动 |
| 活动统计 | ✅ | ⚠️ | 教师只能看到自己的统计 |

### 招生管理

| 数据类型 | 园长 | 教师 | 说明 |
|---------|------|------|------|
| 招生计划 | ✅ | ✅ | 公开数据，教师只读 |
| 招生名额 | ✅ | ✅ | 公开数据，教师只读 |
| 招生申请 | ✅ | ⚠️ | 教师只能看到自己创建的 |
| 招生咨询 | ✅ | ⚠️ | 教师只能看到自己的咨询 |
| 招生任务 | ✅ | ⚠️ | 教师只能看到分配给自己的 |
| 招生统计 | ✅ | ⚠️ | 教师只能看到自己的统计 |

### 任务管理

| 数据类型 | 园长 | 教师 | 说明 |
|---------|------|------|------|
| 所有任务 | ✅ | ❌ | 教师只能看到相关任务 |
| 分配给自己的任务 | ✅ | ✅ | 教师可以完全访问 |
| 自己创建的任务 | ✅ | ✅ | 教师可以完全访问 |
| 其他人的任务 | ✅ | ❌ | 教师无法访问 |
| 任务统计 | ✅ | ⚠️ | 教师只能看到自己的统计 |

---

## 💡 关键实现细节

### 1. 数据库字段设计

**支持教师权限的关键字段**:
- `assigned_teacher_id`: 分配的教师ID
- `is_public`: 是否公开
- `created_by`: 创建人ID
- `creator_id`: 创建者ID
- `assignee_id`: 分配人ID

### 2. 查询优化

**使用索引**:
```sql
-- parents表
CREATE INDEX idx_assigned_teacher ON parents(assigned_teacher_id);
CREATE INDEX idx_is_public ON parents(is_public);

-- activity_participants表
CREATE UNIQUE INDEX uk_activity_teacher ON activity_participants(activity_id, teacher_id);
CREATE INDEX idx_teacher_id ON activity_participants(teacher_id);

-- parent_followups表
CREATE INDEX idx_created_by ON parent_followups(created_by);
```

### 3. 安全性考虑

**防止越权访问**:
1. ✅ 所有API都经过权限中间件验证
2. ✅ 数据库查询包含角色过滤条件
3. ✅ 前端路由也有权限检查
4. ✅ 敏感操作需要二次验证

---

## 📝 总结

### 相同点

1. **使用相同的数据库表** - 园长和教师使用相同的表结构
2. **共享公开数据** - 招生计划、活动信息等公开数据都可访问
3. **相同的API端点** - 使用相同的API，通过权限过滤返回不同数据

### 不同点

1. **数据访问范围** - 园长全局，教师受限
2. **过滤条件** - 园长按幼儿园ID，教师按教师ID/班级ID
3. **操作权限** - 园长可以管理所有数据，教师只能管理自己的数据

### 架构优势

1. ✅ **统一的数据模型** - 减少数据冗余
2. ✅ **灵活的权限控制** - 通过中间件实现细粒度控制
3. ✅ **可扩展性强** - 易于添加新角色和权限
4. ✅ **性能优化** - 使用索引和查询优化

---

**文档版本**: 1.0  
**最后更新**: 2025-10-05  
**维护人**: AI Assistant

