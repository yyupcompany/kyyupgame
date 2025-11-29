# 教师中心 - 角色权限和数据关联矩阵

## 📊 三角色功能权限矩阵

### 通知系统

| 功能 | 园长 | 教师 | 家长 | 当前状态 | 修复后 |
|------|------|------|------|--------|--------|
| 发送全园通知 | ✅ | ❌ | ❌ | ✅ | ✅ |
| 发送班级通知 | ✅ | ✅ | ❌ | ❌ | ✅ |
| 接收通知 | ✅ | ✅ | ❌ | ❌ | ✅ |
| 查看通知历史 | ✅ | ✅ | ❌ | ❌ | ✅ |
| 通知统计 | ✅ | ❌ | ❌ | ❌ | ✅ |

**问题：** 家长无法接收教师的班级通知

---

### 活动系统

| 功能 | 园长 | 教师 | 家长 | 当前状态 | 修复后 |
|------|------|------|------|--------|--------|
| 创建全园活动 | ✅ | ❌ | ❌ | ✅ | ✅ |
| 创建班级活动 | ✅ | ✅ | ❌ | ❌ | ✅ |
| 查看所有活动 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 查看班级活动 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 参与活动 | ❌ | ❌ | ✅ | ✅ | ✅ |
| 活动统计 | ✅ | ❌ | ❌ | ❌ | ✅ |

**问题：** 无法追踪教师创建的活动

---

### 成长报告系统

| 功能 | 园长 | 教师 | 家长 | 当前状态 | 修复后 |
|------|------|------|------|--------|--------|
| 创建成长报告 | ✅ | ❌ | ❌ | ❌ | ✅ |
| 查看所有报告 | ✅ | ❌ | ❌ | ✅ | ✅ |
| 查看班级报告 | ✅ | ✅ | ❌ | ✅ | ✅ |
| 查看孩子报告 | ❌ | ❌ | ✅ | ✅ | ✅ |
| 报告统计 | ✅ | ❌ | ❌ | ❌ | ✅ |

**问题：** 教师无法创建个性化的成长报告

---

### 任务系统

| 功能 | 园长 | 教师 | 家长 | 当前状态 | 修复后 |
|------|------|------|------|--------|--------|
| 创建全园任务 | ✅ | ❌ | ❌ | ✅ | ✅ |
| 创建班级任务 | ✅ | ✅ | ❌ | ❌ | ✅ |
| 创建学生任务 | ✅ | ✅ | ❌ | ❌ | ✅ |
| 查看任务 | ✅ | ✅ | ❌ | ✅ | ✅ |
| 完成任务 | ❌ | ✅ | ✅ | ✅ | ✅ |
| 任务统计 | ✅ | ❌ | ❌ | ❌ | ✅ |

**问题：** 无法区分任务是给班级还是给学生的

---

### 招生系统

| 功能 | 园长 | 教师 | 家长 | 当前状态 | 修复后 |
|------|------|------|------|--------|--------|
| 管理招生 | ✅ | ❌ | ❌ | ✅ | ✅ |
| 查看招生数据 | ✅ | ❌ | ❌ | ✅ | ✅ |
| 跟踪客户 | ✅ | ❌ | ❌ | ✅ | ✅ |

**问题：** 教师中心不应该有招生功能

---

### 客户跟踪系统

| 功能 | 园长 | 教师 | 家长 | 当前状态 | 修复后 |
|------|------|------|------|--------|--------|
| 管理客户 | ✅ | ❌ | ❌ | ✅ | ✅ |
| 跟踪客户 | ✅ | ❌ | ❌ | ✅ | ✅ |
| 客户统计 | ✅ | ❌ | ❌ | ✅ | ✅ |

**问题：** 教师中心不应该有客户跟踪功能

---

## 🔗 数据关联矩阵

### 当前的数据关联（不完整）

```
Teacher
  ├── User ✅
  ├── Class ✅
  ├── Kindergarten ✅
  ├── EnrollmentTask ✅
  ├── ActivityEvaluation ✅
  ├── Activity ❌ (缺失)
  ├── Notification ❌ (缺失)
  ├── Task ❌ (缺失)
  └── AssessmentReport ❌ (缺失)

Activity
  ├── Kindergarten ✅
  ├── EnrollmentPlan ✅
  ├── ActivityRegistration ✅
  ├── ActivityEvaluation ✅
  ├── Teacher ❌ (缺失)
  └── Class ❌ (缺失)

Notification
  ├── User ✅
  ├── Sender (User) ✅
  ├── Class ❌ (缺失)
  └── Teacher ❌ (缺失)

Task
  ├── Creator (User) ✅
  ├── Assignee (User) ✅
  ├── Class ❌ (缺失)
  ├── Student ❌ (缺失)
  └── Teacher ❌ (缺失)

AssessmentReport
  ├── Record ✅
  ├── Teacher ❌ (缺失)
  └── Student ❌ (缺失)

Parent
  ├── User ✅
  ├── Student (through ParentStudentRelation) ✅
  ├── Teacher ❌ (缺失)
  ├── Notification ❌ (缺失)
  └── Activity ❌ (缺失)
```

---

### 修复后的数据关联（完整）

```
Teacher
  ├── User ✅
  ├── Class ✅
  ├── Kindergarten ✅
  ├── EnrollmentTask ✅
  ├── ActivityEvaluation ✅
  ├── Activity ✅ (新增)
  ├── Notification ✅ (新增)
  ├── Task ✅ (新增)
  └── AssessmentReport ✅ (新增)

Activity
  ├── Kindergarten ✅
  ├── EnrollmentPlan ✅
  ├── ActivityRegistration ✅
  ├── ActivityEvaluation ✅
  ├── Teacher ✅ (新增)
  └── Class ✅ (新增)

Notification
  ├── User ✅
  ├── Sender (User) ✅
  ├── Class ✅ (新增)
  └── Teacher ✅ (新增)

Task
  ├── Creator (User) ✅
  ├── Assignee (User) ✅
  ├── Class ✅ (新增)
  ├── Student ✅ (新增)
  └── Teacher ✅ (新增)

AssessmentReport
  ├── Record ✅
  ├── Teacher ✅ (新增)
  └── Student ✅ (新增)

Parent
  ├── User ✅
  ├── Student (through ParentStudentRelation) ✅
  ├── Teacher ✅ (新增)
  ├── Notification ✅ (新增)
  └── Activity ✅ (新增)
```

---

## 📈 数据流完整性检查

### 通知流程

**当前流程（不完整）：**
```
Teacher.sendNotification()
  ├── 创建 Notification 记录
  ├── 但没有指定接收者
  └── 家长无法接收 ❌
```

**修复后流程（完整）：**
```
Teacher.sendClassNotification()
  ├── 获取班级所有学生
  ├── 获取学生的所有家长
  ├── 为每个家长创建 Notification 记录
  ├── 设置 Notification.classId 和 Notification.teacherId
  ├── 家长在"通知中心"接收 ✅
  └── 园长在"通知管理"看到发送情况 ✅
```

---

### 活动流程

**当前流程（不完整）：**
```
Teacher.createActivity()
  ├── 创建 Activity 记录
  ├── 但没有记录 teacherId
  ├── 园长无法追踪谁创建的 ❌
  └── 家长无法接收活动通知 ❌
```

**修复后流程（完整）：**
```
Teacher.createActivity()
  ├── 创建 Activity 记录
  ├── 记录 Activity.teacherId 和 Activity.classId
  ├── 发送通知给班级所有家长
  ├── 家长在"活动列表"看到活动 ✅
  ├── 园长在"活动管理"看到教师创建的活动 ✅
  └── 可以统计教师的活动创建情况 ✅
```

---

### 成长报告流程

**当前流程（不完整）：**
```
System.generateAssessmentReport()
  ├── 自动生成报告
  ├── 但没有记录 teacherId
  ├── 教师无法创建个性化报告 ❌
  └── 家长看不到教师的评价 ❌
```

**修复后流程（完整）：**
```
Teacher.createGrowthReport()
  ├── 创建 AssessmentReport 记录
  ├── 记录 AssessmentReport.teacherId 和 AssessmentReport.studentId
  ├── 发送通知给学生的家长
  ├── 家长在"成长报告"看到报告 ✅
  ├── 园长在"教学管理"看到教师创建的报告 ✅
  └── 可以统计教师的报告创建情况 ✅
```

---

### 任务流程

**当前流程（不完整）：**
```
Teacher.createTask()
  ├── 创建 Task 记录
  ├── 但没有记录 classId 或 studentId
  ├── 无法区分任务是给班级还是给学生的 ❌
  └── 无法统计任务完成情况 ❌
```

**修复后流程（完整）：**
```
Teacher.createClassTask()
  ├── 创建 Task 记录
  ├── 记录 Task.classId 和 Task.teacherId
  ├── 发送通知给班级所有学生
  ├── 学生可以查看和完成任务 ✅
  ├── 园长可以统计任务完成情况 ✅
  └── 可以评估教师的任务分配情况 ✅

Teacher.createStudentTask()
  ├── 创建 Task 记录
  ├── 记录 Task.studentId 和 Task.teacherId
  ├── 发送通知给学生
  ├── 学生可以查看和完成任务 ✅
  ├── 园长可以统计学生的任务完成情况 ✅
  └── 可以评估教师的个性化教学 ✅
```

---

## 🎯 修复优先级

### 高优先级（必须修复）

1. **通知系统** - 家长无法接收教师通知
   - 影响：家长无法及时了解班级动态
   - 修复时间：3-5天

2. **活动系统** - 无法追踪教师创建的活动
   - 影响：园长无法管理教师的活动
   - 修复时间：3-5天

3. **成长报告系统** - 教师无法创建个性化报告
   - 影响：家长看不到教师的评价
   - 修复时间：3-5天

4. **权限和菜单** - 教师有不合适的功能
   - 影响：权限混乱，安全隐患
   - 修复时间：1-2天

### 中优先级（应该修复）

5. **任务系统** - 无法区分任务接收者
   - 影响：任务管理不清晰
   - 修复时间：3-5天

6. **教学中心** - 功能定位不清
   - 影响：用户困惑
   - 修复时间：2-3天

### 低优先级（可以优化）

7. **数据关联** - 缺失的外键关联
   - 影响：系统灵活性不足
   - 修复时间：5-7天

---

## 📋 修复检查清单

### 通知系统
- [ ] 添加 Notification.classId 字段
- [ ] 添加 Notification.teacherId 字段
- [ ] 创建 NotificationDistributionService
- [ ] 在家长中心添加"通知中心"
- [ ] 实现通知自动分发逻辑
- [ ] 测试通知接收和查看

### 活动系统
- [ ] 添加 Activity.teacherId 字段
- [ ] 添加 Activity.classId 字段
- [ ] 修改活动创建逻辑
- [ ] 实现活动通知分发
- [ ] 测试活动创建和分发

### 成长报告系统
- [ ] 添加 AssessmentReport.teacherId 字段
- [ ] 创建 TeacherAssessmentService
- [ ] 在教师中心添加"成长报告"功能
- [ ] 实现报告创建和分享逻辑
- [ ] 测试报告创建和通知

### 权限和菜单
- [ ] 从教师中心移除"招生中心"
- [ ] 从教师中心移除"客户跟踪"
- [ ] 调整教师权限配置
- [ ] 测试权限控制

### 任务系统
- [ ] 添加 Task.classId 字段
- [ ] 添加 Task.studentId 字段
- [ ] 添加 Task.teacherId 字段
- [ ] 修改任务创建逻辑
- [ ] 测试任务分配

### 教学中心
- [ ] 明确教师和园长的教学中心职责
- [ ] 调整菜单结构
- [ ] 测试菜单导航


