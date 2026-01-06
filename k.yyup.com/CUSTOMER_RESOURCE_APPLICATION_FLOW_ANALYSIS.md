# 客户资源申请流程可行性分析

## 📋 需求概述

**用户需求**:
1. 教师可以看到客户池中的所有客户资源
2. 教师可以看到每个客户已经分配给谁
3. 教师可以申请跟踪某些客户（支持批量申请）
4. 教师申请后，园长端收到通知
5. 园长同意分配后，教师通知中心收到同意回复消息

---

## 🔍 当前系统状态分析

### 1. 客户池功能现状

#### ✅ 已有功能
- **客户数据模型**: `parents` 表
- **客户分配字段**: `assigned_teacher_id` (分配的教师ID)
- **公开标识**: `is_public` (是否公开)
- **跟进状态**: `follow_status` (待跟进/跟进中/已转化/已放弃)
- **跟进记录**: `parent_followups` 表

#### ⚠️ 当前限制
**教师权限过滤** (`server/src/middlewares/teacher-permission.middleware.ts`):
```typescript
// 教师只能看到分配给自己的客户 + 公开的客户
WHERE (assigned_teacher_id = {teacher_id} OR is_public = 1)
```

**问题**: 教师无法看到已分配给其他教师的客户

---

### 2. 通知系统现状

#### ✅ 已有功能
- **通知模型**: `notifications` 表
- **通知类型**: SYSTEM, ACTIVITY, SCHEDULE, MESSAGE, OTHER
- **通知状态**: UNREAD, READ, DELETED, PUBLISHED, CANCELLED
- **关联数据**: `sourceId`, `sourceType` (可关联客户申请)
- **发送人**: `senderId` 字段
- **接收人**: `userId` 字段

#### ✅ 已有API
- `GET /api/notifications` - 获取通知列表
- `POST /api/notifications` - 创建通知
- `PUT /api/notifications/:id/read` - 标记已读
- `POST /api/notifications/send` - 发送通知

---

### 3. 客户分配功能现状

#### ✅ 已有功能
- **单个分配**: `PUT /api/customer-pool/:id` (更新客户的teacherId)
- **批量分配**: `POST /api/principal/batch-assign-customer-teacher`
- **分配权限**: 园长和管理员可以分配客户

#### ⚠️ 缺少功能
- ❌ 教师申请客户的API
- ❌ 客户申请记录表
- ❌ 申请审批流程

---

## 🎯 流程设计方案

### 方案A: 完整审批流程（推荐）

#### 流程图
```
教师端                     系统                      园长端
  │                        │                         │
  ├─ 1. 查看客户池          │                         │
  │   (显示所有客户)        │                         │
  │                        │                         │
  ├─ 2. 选择客户            │                         │
  │   (单选/批量)          │                         │
  │                        │                         │
  ├─ 3. 提交申请 ──────────>│                         │
  │                        │                         │
  │                        ├─ 4. 创建申请记录         │
  │                        │   (customer_applications)│
  │                        │                         │
  │                        ├─ 5. 发送通知 ─────────>│
  │                        │                         │
  │                        │                         ├─ 6. 查看申请
  │                        │                         │   (通知中心)
  │                        │                         │
  │                        │                         ├─ 7. 审批
  │                        │                         │   (同意/拒绝)
  │                        │                         │
  │                        │<─ 8. 更新申请状态 ──────┤
  │                        │   + 分配客户            │
  │                        │                         │
  │<─ 9. 发送结果通知 ──────┤                         │
  │   (通知中心)            │                         │
  │                        │                         │
  ├─ 10. 查看结果           │                         │
  │    (通知中心)          │                         │
```

---

## 📊 数据库设计

### 新增表: customer_applications (客户申请记录)

```sql
CREATE TABLE customer_applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL COMMENT '客户ID',
  teacher_id INT NOT NULL COMMENT '申请教师ID',
  principal_id INT COMMENT '审批园长ID',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '申请状态',
  apply_reason TEXT COMMENT '申请理由',
  reject_reason TEXT COMMENT '拒绝理由',
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  reviewed_at DATETIME COMMENT '审批时间',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME COMMENT '删除时间',
  
  INDEX idx_customer_id (customer_id),
  INDEX idx_teacher_id (teacher_id),
  INDEX idx_status (status),
  INDEX idx_applied_at (applied_at),
  
  FOREIGN KEY (customer_id) REFERENCES parents(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id),
  FOREIGN KEY (principal_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户申请记录表';
```

---

## 🔧 需要开发的功能

### 1. 教师端功能

#### 1.1 查看客户池（需修改权限）

**当前**: 只能看到分配给自己的 + 公开的客户

**修改为**: 可以看到所有客户，但显示分配状态

**API修改**: `GET /api/customer-pool`
```typescript
// 修改权限过滤逻辑
if (userRole === 'teacher') {
  // 不再过滤，但添加分配状态字段
  query += `
    SELECT 
      p.*,
      u.real_name as assigned_teacher_name,
      CASE 
        WHEN p.assigned_teacher_id = ${teacherId} THEN 'mine'
        WHEN p.assigned_teacher_id IS NULL THEN 'unassigned'
        ELSE 'assigned'
      END as assignment_status
    FROM parents p
    LEFT JOIN users u ON p.assigned_teacher_id = u.id
  `;
}
```

#### 1.2 申请客户（新增）

**API**: `POST /api/teacher/customer-applications`

**请求参数**:
```typescript
{
  customerIds: number[],  // 客户ID列表（支持批量）
  applyReason: string     // 申请理由
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    applicationIds: number[],
    successCount: number,
    failedCount: number,
    failedCustomers: Array<{
      customerId: number,
      reason: string
    }>
  }
}
```

**业务逻辑**:
1. 验证客户是否存在
2. 检查客户是否已分配
3. 检查是否已有待审批的申请
4. 创建申请记录
5. 发送通知给园长

#### 1.3 查看申请记录（新增）

**API**: `GET /api/teacher/customer-applications`

**查询参数**:
```typescript
{
  status?: 'pending' | 'approved' | 'rejected',
  page: number,
  pageSize: number
}
```

---

### 2. 园长端功能

#### 2.1 查看申请列表（新增）

**API**: `GET /api/principal/customer-applications`

**查询参数**:
```typescript
{
  status?: 'pending' | 'approved' | 'rejected',
  teacherId?: number,
  customerId?: number,
  page: number,
  pageSize: number
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    items: Array<{
      id: number,
      customer: {
        id: number,
        name: string,
        phone: string,
        source: string,
        status: string
      },
      teacher: {
        id: number,
        name: string
      },
      applyReason: string,
      status: string,
      appliedAt: string
    }>,
    total: number,
    page: number,
    pageSize: number
  }
}
```

#### 2.2 审批申请（新增）

**API**: `POST /api/principal/customer-applications/:id/review`

**请求参数**:
```typescript
{
  action: 'approve' | 'reject',
  rejectReason?: string  // 拒绝时必填
}
```

**业务逻辑**:
1. 验证申请是否存在且状态为pending
2. 如果同意:
   - 更新申请状态为approved
   - 分配客户给教师 (更新parents表的assigned_teacher_id)
   - 发送同意通知给教师
3. 如果拒绝:
   - 更新申请状态为rejected
   - 记录拒绝理由
   - 发送拒绝通知给教师

#### 2.3 批量审批（新增）

**API**: `POST /api/principal/customer-applications/batch-review`

**请求参数**:
```typescript
{
  applicationIds: number[],
  action: 'approve' | 'reject',
  rejectReason?: string
}
```

---

### 3. 通知功能增强

#### 3.1 新增通知类型

```typescript
export enum NotificationType {
  SYSTEM = 'SYSTEM',
  ACTIVITY = 'ACTIVITY',
  SCHEDULE = 'SCHEDULE',
  MESSAGE = 'MESSAGE',
  CUSTOMER_APPLICATION = 'CUSTOMER_APPLICATION',  // 新增：客户申请
  OTHER = 'OTHER'
}
```

#### 3.2 通知模板

**教师申请通知（发给园长）**:
```typescript
{
  title: '客户申请通知',
  content: `教师 ${teacherName} 申请跟踪 ${customerCount} 个客户`,
  type: 'CUSTOMER_APPLICATION',
  sourceType: 'customer_application',
  sourceId: applicationId,
  userId: principalId
}
```

**审批结果通知（发给教师）**:
```typescript
// 同意
{
  title: '客户申请已通过',
  content: `您申请的客户 ${customerName} 已分配给您`,
  type: 'CUSTOMER_APPLICATION',
  sourceType: 'customer_application',
  sourceId: applicationId,
  userId: teacherId
}

// 拒绝
{
  title: '客户申请已拒绝',
  content: `您申请的客户 ${customerName} 未通过审批，原因：${rejectReason}`,
  type: 'CUSTOMER_APPLICATION',
  sourceType: 'customer_application',
  sourceId: applicationId,
  userId: teacherId
}
```

---

## 🎨 前端界面设计

### 1. 教师端 - 客户池页面

**路径**: `/teacher-center/customer-tracking`

**新增功能**:
- ✅ 显示所有客户（不再只显示分配给自己的）
- ✅ 客户列表增加"分配状态"列
  - 🟢 未分配
  - 🔵 已分配给我
  - 🟡 已分配给其他教师
- ✅ 批量选择功能
- ✅ "申请跟踪"按钮（支持批量）
- ✅ 申请理由输入框

**界面示例**:
```
┌─────────────────────────────────────────────────────────┐
│ 客户池管理                                    [申请跟踪] │
├─────────────────────────────────────────────────────────┤
│ □ 客户姓名  电话        来源    状态    分配状态        │
├─────────────────────────────────────────────────────────┤
│ □ 张三     138****1234  网络    新客户  🟢 未分配      │
│ □ 李四     139****5678  电话    已联系  🔵 已分配给我  │
│ □ 王五     137****9012  推荐    意向    🟡 已分配(刘老师)│
└─────────────────────────────────────────────────────────┘
```

### 2. 教师端 - 申请记录页面

**路径**: `/teacher-center/customer-tracking/applications`

**功能**:
- 查看申请历史
- 申请状态筛选
- 查看审批结果

### 3. 园长端 - 申请审批页面

**路径**: `/principal/customer-applications`

**功能**:
- 查看待审批申请列表
- 单个审批
- 批量审批
- 查看申请详情

---

## ✅ 流程可行性评估

### 优势
1. ✅ **数据库支持**: 现有表结构支持，只需新增申请记录表
2. ✅ **通知系统完善**: 通知系统已实现，可直接使用
3. ✅ **权限系统健全**: RBAC权限系统支持细粒度控制
4. ✅ **API架构清晰**: RESTful API设计，易于扩展

### 需要修改的地方
1. ⚠️ **教师权限过滤**: 需要修改客户池查询逻辑，允许教师查看所有客户
2. ⚠️ **新增申请表**: 需要创建customer_applications表
3. ⚠️ **新增API**: 需要开发申请、审批相关的API
4. ⚠️ **前端界面**: 需要开发申请和审批界面

### 技术风险
1. 🟡 **性能问题**: 教师查看所有客户可能导致数据量大，需要分页和索引优化
2. 🟡 **并发问题**: 多个教师同时申请同一客户，需要加锁或乐观锁
3. 🟢 **通知延迟**: 通知系统是异步的，可能有延迟（可接受）

---

## 📝 开发工作量估算

| 任务 | 工作量 | 优先级 |
|------|--------|--------|
| 数据库表设计和创建 | 0.5天 | P0 |
| 修改教师权限过滤逻辑 | 0.5天 | P0 |
| 开发教师申请API | 1天 | P0 |
| 开发园长审批API | 1天 | P0 |
| 通知功能集成 | 0.5天 | P0 |
| 前端教师申请界面 | 1.5天 | P0 |
| 前端园长审批界面 | 1.5天 | P0 |
| 单元测试 | 1天 | P1 |
| 集成测试 | 1天 | P1 |
| 文档编写 | 0.5天 | P1 |
| **总计** | **9天** | - |

---

## 🚀 实施建议

### 阶段1: 基础功能（3天）
1. 创建customer_applications表
2. 修改教师权限过滤逻辑
3. 开发教师申请API
4. 开发园长审批API

### 阶段2: 通知集成（1天）
1. 集成通知系统
2. 实现申请通知
3. 实现审批结果通知

### 阶段3: 前端开发（3天）
1. 开发教师申请界面
2. 开发园长审批界面
3. 优化用户体验

### 阶段4: 测试和优化（2天）
1. 单元测试
2. 集成测试
3. 性能优化
4. 文档编写

---

## 🎯 总结

### 可行性结论
✅ **完全可行**

该流程在当前系统架构下完全可以实现，主要工作是：
1. 新增客户申请记录表
2. 修改教师权限过滤逻辑
3. 开发申请和审批API
4. 开发前端界面
5. 集成通知系统

### 核心优势
- 利用现有通知系统，无需重新开发
- 利用现有权限系统，安全可控
- 数据库设计简单，易于维护
- API设计清晰，易于扩展

### 建议
1. **优先级**: 建议作为P0功能开发，提升教师工作效率
2. **性能**: 客户池查询需要添加索引优化
3. **用户体验**: 申请和审批界面需要简洁明了
4. **通知**: 考虑添加邮件或短信通知，提高响应速度

---

**文档版本**: 1.0  
**创建时间**: 2025-10-05  
**作者**: AI Assistant

