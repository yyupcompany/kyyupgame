# 教师中心修复实施指南

## 📋 修复清单

### 第1阶段：核心通信链修复（3-5天）

#### 1.1 修复Notification表结构

**文件：** `unified-tenant-system/server/src/models/notification.model.ts`

**需要添加的字段：**
```typescript
// 添加这些字段到Notification模型
classId: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: {
    model: 'classes',
    key: 'id'
  }
},
teacherId: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: {
    model: 'admin_users',
    key: 'id'
  }
}
```

**迁移脚本：**
```sql
ALTER TABLE notifications ADD COLUMN classId INT;
ALTER TABLE notifications ADD COLUMN teacherId INT;
ALTER TABLE notifications ADD FOREIGN KEY (classId) REFERENCES classes(id);
ALTER TABLE notifications ADD FOREIGN KEY (teacherId) REFERENCES admin_users(id);
```

---

#### 1.2 创建NotificationDistributionService

**文件：** `unified-tenant-system/server/src/services/notification-distribution.service.ts`

**核心功能：**
```typescript
// 当教师发送通知时，自动分发给班级所有家长
async distributeNotificationToParents(
  classId: number,
  teacherId: number,
  notificationData: any
) {
  // 1. 获取班级所有学生
  const students = await Student.findAll({ where: { classId } });
  
  // 2. 获取每个学生的家长
  const parents = await Parent.findAll({
    where: { studentId: students.map(s => s.id) }
  });
  
  // 3. 为每个家长创建Notification记录
  for (const parent of parents) {
    await Notification.create({
      userId: parent.userId,
      classId,
      teacherId,
      ...notificationData
    });
  }
}
```

---

#### 1.3 在家长中心添加"通知中心"

**文件：** `k.yyup.com/client/src/components/sidebar/ParentCenterSidebar.vue`

**添加菜单项：**
```vue
{
  label: '通知中心',
  icon: 'bell',
  path: '/parent/notifications',
  children: [
    { label: '班级通知', path: '/parent/notifications/class' },
    { label: '学校通知', path: '/parent/notifications/school' }
  ]
}
```

---

### 第2阶段：活动和报告修复（3-5天）

#### 2.1 修复Activity表结构

**文件：** `unified-tenant-system/server/src/models/activity.model.ts`

**需要添加的字段：**
```typescript
teacherId: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: {
    model: 'admin_users',
    key: 'id'
  }
},
classId: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: {
    model: 'classes',
    key: 'id'
  }
}
```

---

#### 2.2 修复AssessmentReport表结构

**文件：** `unified-tenant-system/server/src/models/assessment-report.model.ts`

**需要添加的字段：**
```typescript
teacherId: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: {
    model: 'admin_users',
    key: 'id'
  }
}
```

---

### 第3阶段：园长追踪功能（5-7天）

#### 3.1 创建TeacherWorkTrackingService

**文件：** `unified-tenant-system/server/src/services/teacher-work-tracking.service.ts`

**核心功能：**
```typescript
// 获取教师的工作统计
async getTeacherWorkStats(teacherId: number, startDate: Date, endDate: Date) {
  const stats = {
    activitiesCreated: await Activity.count({
      where: { teacherId, createdAt: { [Op.between]: [startDate, endDate] } }
    }),
    notificationsSent: await Notification.count({
      where: { teacherId, createdAt: { [Op.between]: [startDate, endDate] } }
    }),
    reportsCreated: await AssessmentReport.count({
      where: { teacherId, createdAt: { [Op.between]: [startDate, endDate] } }
    }),
    tasksCreated: await Task.count({
      where: { teacherId, createdAt: { [Op.between]: [startDate, endDate] } }
    })
  };
  return stats;
}

// 获取园长的全局教师工作统计
async getPrincipalTeacherStats(tenantId: string) {
  const teachers = await Teacher.findAll({ where: { tenantId } });
  const stats = [];
  
  for (const teacher of teachers) {
    const workStats = await this.getTeacherWorkStats(teacher.id, startDate, endDate);
    stats.push({
      teacherId: teacher.id,
      teacherName: teacher.name,
      ...workStats
    });
  }
  
  return stats;
}
```

---

#### 3.2 在园长中心添加教师工作追踪功能

**文件：** `k.yyup.com/client/src/components/sidebar/CentersSidebar.vue`

**添加菜单项：**
```vue
{
  label: '教师工作追踪',
  icon: 'chart-bar',
  path: '/principal/teacher-tracking',
  children: [
    { label: '教师工作统计', path: '/principal/teacher-tracking/stats' },
    { label: '教师活动管理', path: '/principal/teacher-tracking/activities' },
    { label: '教师通知管理', path: '/principal/teacher-tracking/notifications' },
    { label: '教师报告管理', path: '/principal/teacher-tracking/reports' }
  ]
}
```

---

### 第4阶段：任务系统修复（3-5天）

#### 4.1 修复Task表结构

**文件：** `unified-tenant-system/server/src/models/task.model.ts`

**需要添加的字段：**
```typescript
classId: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: {
    model: 'classes',
    key: 'id'
  }
},
studentId: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: {
    model: 'students',
    key: 'id'
  }
},
teacherId: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: {
    model: 'admin_users',
    key: 'id'
  }
}
```

---

### 第5阶段：数据关联优化（2-3天）

#### 5.1 添加模型关联

**文件：** `unified-tenant-system/server/src/models/index.ts`

**添加关联：**
```typescript
// Teacher -> Activity
Teacher.hasMany(Activity, { foreignKey: 'teacherId' });
Activity.belongsTo(Teacher, { foreignKey: 'teacherId' });

// Teacher -> Notification
Teacher.hasMany(Notification, { foreignKey: 'teacherId' });
Notification.belongsTo(Teacher, { foreignKey: 'teacherId' });

// Teacher -> Task
Teacher.hasMany(Task, { foreignKey: 'teacherId' });
Task.belongsTo(Teacher, { foreignKey: 'teacherId' });

// Teacher -> AssessmentReport
Teacher.hasMany(AssessmentReport, { foreignKey: 'teacherId' });
AssessmentReport.belongsTo(Teacher, { foreignKey: 'teacherId' });

// Class -> Activity
Class.hasMany(Activity, { foreignKey: 'classId' });
Activity.belongsTo(Class, { foreignKey: 'classId' });

// Class -> Notification
Class.hasMany(Notification, { foreignKey: 'classId' });
Notification.belongsTo(Class, { foreignKey: 'classId' });

// Class -> Task
Class.hasMany(Task, { foreignKey: 'classId' });
Task.belongsTo(Class, { foreignKey: 'classId' });

// Student -> Task
Student.hasMany(Task, { foreignKey: 'studentId' });
Task.belongsTo(Student, { foreignKey: 'studentId' });
```

---

## 🧪 测试场景

### 场景1：教师发送通知，家长接收

**步骤：**
1. 教师登录，进入班级
2. 教师发送通知
3. 系统自动分发给班级所有家长
4. 家长登录，进入"通知中心"
5. 家长看到教师发送的通知

**验证点：**
- ✅ Notification表有classId和teacherId
- ✅ 家长中心有"通知中心"菜单
- ✅ 家长能看到通知列表
- ✅ 园长能看到通知发送情况

---

### 场景2：园长查看教师工作统计

**步骤：**
1. 园长登录
2. 进入"教师工作追踪"
3. 查看教师工作统计
4. 查看教师创建的活动、通知、报告

**验证点：**
- ✅ 园长中心有"教师工作追踪"菜单
- ✅ 能看到教师工作统计
- ✅ 能看到教师创建的所有内容
- ✅ 能进行教师绩效评估

---

### 场景3：教师创建活动，家长参与

**步骤：**
1. 教师创建活动
2. 系统自动分发给班级所有家长
3. 家长看到活动
4. 家长参与活动

**验证点：**
- ✅ Activity表有teacherId和classId
- ✅ 家长能看到教师创建的活动
- ✅ 园长能看到教师创建的活动

---

## 📊 修复进度跟踪

| 阶段 | 任务 | 状态 | 完成时间 |
|------|------|------|--------|
| 1 | 修复Notification表 | ⏳ 待开始 | - |
| 1 | 创建NotificationDistributionService | ⏳ 待开始 | - |
| 1 | 添加家长通知中心 | ⏳ 待开始 | - |
| 2 | 修复Activity表 | ⏳ 待开始 | - |
| 2 | 修复AssessmentReport表 | ⏳ 待开始 | - |
| 3 | 创建TeacherWorkTrackingService | ⏳ 待开始 | - |
| 3 | 添加园长教师追踪功能 | ⏳ 待开始 | - |
| 4 | 修复Task表 | ⏳ 待开始 | - |
| 5 | 添加模型关联 | ⏳ 待开始 | - |

---

## 📝 注意事项

1. **数据迁移** - 修改表结构时需要创建迁移脚本
2. **向后兼容** - 新字段应该允许NULL，确保现有数据不受影响
3. **测试覆盖** - 每个修复都需要单元测试和集成测试
4. **文档更新** - 修复完成后需要更新API文档
5. **性能优化** - 添加必要的数据库索引


