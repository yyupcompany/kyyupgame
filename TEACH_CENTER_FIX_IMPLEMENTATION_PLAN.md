# 教师中心修复实施计划

## 🎯 修复优先级和时间表

### Phase 1: 高优先级修复（第1-2周）

#### 1.1 修复通知系统 - 教师无法向家长发送通知

**修复步骤：**

1. **数据库修改**
   ```sql
   -- 在Notification表添加classId字段
   ALTER TABLE notifications ADD COLUMN class_id INT AFTER user_id;
   ALTER TABLE notifications ADD FOREIGN KEY (class_id) REFERENCES classes(id);
   
   -- 在Notification表添加teacher_id字段
   ALTER TABLE notifications ADD COLUMN teacher_id INT AFTER sender_id;
   ALTER TABLE notifications ADD FOREIGN KEY (teacher_id) REFERENCES teachers(id);
   ```

2. **模型修改** - `notification.model.ts`
   ```typescript
   export interface NotificationAttributes {
     // ... 现有字段
     classId?: number;        // 新增：班级ID
     teacherId?: number;      // 新增：教师ID
   }
   
   export const initNotificationAssociations = () => {
     Notification.belongsTo(Class, {
       foreignKey: 'classId',
       as: 'class'
     });
     Notification.belongsTo(Teacher, {
       foreignKey: 'teacherId',
       as: 'teacher'
     });
   };
   ```

3. **服务层修改** - 创建 `notification-distribution.service.ts`
   ```typescript
   export class NotificationDistributionService {
     /**
      * 教师发送班级通知
      * 自动发送给班级所有学生的家长
      */
     async sendClassNotification(
       teacherId: number,
       classId: number,
       title: string,
       content: string
     ) {
       // 1. 获取班级所有学生
       const students = await Student.findAll({ where: { classId } });
       
       // 2. 获取所有学生的家长
       const parentIds = new Set();
       for (const student of students) {
         const parents = await student.getParents();
         parents.forEach(p => parentIds.add(p.userId));
       }
       
       // 3. 为每个家长创建通知
       const notifications = Array.from(parentIds).map(userId => ({
         title,
         content,
         userId,
         classId,
         teacherId,
         type: 'teacher_notification',
         status: 'unread'
       }));
       
       return await Notification.bulkCreate(notifications);
     }
   }
   ```

4. **前端修改** - 在家长中心添加"通知中心"
   ```vue
   <!-- parent-center/notifications/index.vue -->
   <template>
     <div class="notifications-container">
       <div class="notification-list">
         <div v-for="notification in notifications" :key="notification.id">
           <div class="notification-item">
             <div class="teacher-info">
               {{ notification.teacher.name }}
             </div>
             <div class="notification-content">
               {{ notification.title }}
             </div>
             <div class="notification-time">
               {{ formatTime(notification.createdAt) }}
             </div>
           </div>
         </div>
       </div>
     </div>
   </template>
   ```

5. **权限配置**
   - 教师权限：`teacher:notification:send`
   - 家长权限：`parent:notification:view`

---

#### 1.2 修复活动系统 - Activity没有teacherId

**修复步骤：**

1. **数据库修改**
   ```sql
   -- 在Activity表添加teacher_id和class_id字段
   ALTER TABLE activities ADD COLUMN teacher_id INT AFTER creator_id;
   ALTER TABLE activities ADD COLUMN class_id INT AFTER teacher_id;
   ALTER TABLE activities ADD FOREIGN KEY (teacher_id) REFERENCES teachers(id);
   ALTER TABLE activities ADD FOREIGN KEY (class_id) REFERENCES classes(id);
   ```

2. **模型修改** - `activity.model.ts`
   ```typescript
   export class Activity extends Model {
     declare teacherId: ForeignKey<Teacher['id']> | null;
     declare classId: ForeignKey<Class['id']> | null;
   }
   
   export const initActivityAssociations = () => {
     Activity.belongsTo(Teacher, {
       foreignKey: 'teacherId',
       as: 'teacher'
     });
     Activity.belongsTo(Class, {
       foreignKey: 'classId',
       as: 'class'
     });
   };
   ```

3. **服务层修改** - `activity-center.service.ts`
   ```typescript
   async createActivity(data: any, teacherId: number) {
     // 获取教师的班级
     const teacher = await Teacher.findByPk(teacherId);
     const classes = await teacher.getClasses();
     
     const activity = await Activity.create({
       ...data,
       teacherId,
       classId: classes[0]?.id, // 假设教师只教一个班级
       creatorId: teacherId
     });
     
     // 发送通知给班级所有家长
     await this.notificationDistributionService.sendClassNotification(
       teacherId,
       classes[0].id,
       `新活动：${data.title}`,
       `班级有新活动，请查看详情`
     );
     
     return activity;
   }
   ```

4. **权限配置**
   - 教师权限：`teacher:activity:create`
   - 园长权限：`principal:activity:view_all`

---

#### 1.3 修复成长报告系统 - 教师无法创建成长报告

**修复步骤：**

1. **数据库修改**
   ```sql
   -- 在assessment_reports表添加teacher_id字段
   ALTER TABLE assessment_reports ADD COLUMN teacher_id INT AFTER record_id;
   ALTER TABLE assessment_reports ADD FOREIGN KEY (teacher_id) REFERENCES teachers(id);
   ```

2. **模型修改** - `assessment-report.model.ts`
   ```typescript
   export class AssessmentReport extends Model {
     declare teacherId: ForeignKey<Teacher['id']> | null;
   }
   
   export const initAssessmentReportAssociations = () => {
     AssessmentReport.belongsTo(Teacher, {
       foreignKey: 'teacherId',
       as: 'teacher'
     });
   };
   ```

3. **服务层修改** - 创建 `teacher-assessment.service.ts`
   ```typescript
   export class TeacherAssessmentService {
     /**
      * 教师创建学生成长报告
      */
     async createGrowthReport(
       teacherId: number,
       studentId: number,
       content: string
     ) {
       const student = await Student.findByPk(studentId);
       
       const report = await AssessmentReport.create({
         studentId,
         teacherId,
         content,
         aiGenerated: false,
         viewCount: 0
       });
       
       // 发送通知给学生的家长
       const parents = await student.getParents();
       for (const parent of parents) {
         await Notification.create({
           userId: parent.userId,
           title: `${student.name}的成长报告已更新`,
           content: `${student.name}的成长报告已由老师更新，请查看`,
           type: 'growth_report',
           sourceId: report.id,
           sourceType: 'assessment_report'
         });
       }
       
       return report;
     }
   }
   ```

4. **前端修改** - 在教师中心添加"成长报告"功能
   ```vue
   <!-- teacher-center/teaching/growth-reports/index.vue -->
   <template>
     <div class="growth-reports-container">
       <el-button @click="showCreateDialog = true">创建成长报告</el-button>
       <el-table :data="reports">
         <el-table-column prop="student.name" label="学生名称" />
         <el-table-column prop="content" label="报告内容" />
         <el-table-column label="操作">
           <template #default="{ row }">
             <el-button @click="editReport(row)">编辑</el-button>
             <el-button @click="deleteReport(row)">删除</el-button>
           </template>
         </el-table-column>
       </el-table>
     </div>
   </template>
   ```

---

#### 1.4 从教师中心移除不合适的功能

**修复步骤：**

1. **移除招生中心**
   - 修改 `TeacherCenterSidebar.vue`
   - 删除招生中心菜单项
   - 删除相关的路由和权限

2. **移除客户跟踪**
   - 修改 `TeacherCenterSidebar.vue`
   - 删除客户跟踪菜单项
   - 删除相关的路由和权限

3. **权限配置**
   ```typescript
   // 教师不应该有的权限
   const forbiddenPermissions = [
     'teacher:enrollment:view',
     'teacher:customer:view',
     'teacher:customer:track'
   ];
   ```

---

### Phase 2: 中优先级修复（第3-4周）

#### 2.1 修复任务系统 - Task没有classId和studentId

**修复步骤：**

1. **数据库修改**
   ```sql
   ALTER TABLE tasks ADD COLUMN class_id INT;
   ALTER TABLE tasks ADD COLUMN student_id INT;
   ALTER TABLE tasks ADD COLUMN teacher_id INT;
   ALTER TABLE tasks ADD FOREIGN KEY (class_id) REFERENCES classes(id);
   ALTER TABLE tasks ADD FOREIGN KEY (student_id) REFERENCES students(id);
   ALTER TABLE tasks ADD FOREIGN KEY (teacher_id) REFERENCES teachers(id);
   ```

2. **模型修改** - `task.model.ts`
   ```typescript
   export interface TaskAttributes {
     classId?: number;
     studentId?: number;
     teacherId?: number;
   }
   ```

3. **服务层修改**
   ```typescript
   async createTaskForClass(
     teacherId: number,
     classId: number,
     title: string,
     description: string
   ) {
     const task = await Task.create({
       title,
       description,
       creatorId: teacherId,
       teacherId,
       classId,
       type: 'class_task'
     });
     
     // 发送通知给班级所有学生
     const students = await Student.findAll({ where: { classId } });
     for (const student of students) {
       await Notification.create({
         userId: student.userId,
         title: `新任务：${title}`,
         content: description,
         type: 'task',
         sourceId: task.id,
         sourceType: 'task'
       });
     }
     
     return task;
   }
   ```

---

#### 2.2 明确教学中心的职责

**修复步骤：**

1. **教师中心的教学中心**
   - 教学计划管理
   - 教学记录
   - 成长报告
   - 班级管理

2. **园长中心的教学中心**
   - 教学质量评估
   - 教师教学评价
   - 教学资源管理
   - 教学数据分析

3. **前端修改** - 调整菜单结构
   ```typescript
   // 教师中心
   const teacherMenuItems = [
     {
       id: 'teaching',
       title: '教学中心',
       route: '/teacher-center/teaching',
       icon: 'book-open',
       children: [
         { id: 'teaching-plan', title: '教学计划', route: '/teacher-center/teaching/plan' },
         { id: 'teaching-record', title: '教学记录', route: '/teacher-center/teaching/record' },
         { id: 'growth-report', title: '成长报告', route: '/teacher-center/teaching/growth-report' },
         { id: 'class-management', title: '班级管理', route: '/teacher-center/teaching/class' }
       ]
     }
   ];
   ```

---

### Phase 3: 低优先级优化（第5-6周）

#### 3.1 完善数据关联

**修复步骤：**

1. 添加缺失的外键关联
2. 优化数据查询性能
3. 添加数据一致性检查

---

## 📋 修复检查清单

### 通知系统
- [ ] 添加Notification.classId字段
- [ ] 添加Notification.teacherId字段
- [ ] 创建NotificationDistributionService
- [ ] 在家长中心添加"通知中心"
- [ ] 测试通知自动分发
- [ ] 测试家长接收通知

### 活动系统
- [ ] 添加Activity.teacherId字段
- [ ] 添加Activity.classId字段
- [ ] 修改活动创建逻辑
- [ ] 测试活动创建和分发
- [ ] 测试园长查看教师创建的活动

### 成长报告系统
- [ ] 添加AssessmentReport.teacherId字段
- [ ] 创建TeacherAssessmentService
- [ ] 在教师中心添加"成长报告"功能
- [ ] 测试成长报告创建
- [ ] 测试家长接收成长报告通知

### 权限和菜单
- [ ] 从教师中心移除"招生中心"
- [ ] 从教师中心移除"客户跟踪"
- [ ] 调整教师权限配置
- [ ] 测试权限控制

### 任务系统
- [ ] 添加Task.classId字段
- [ ] 添加Task.studentId字段
- [ ] 添加Task.teacherId字段
- [ ] 修改任务创建逻辑
- [ ] 测试任务分配

### 教学中心
- [ ] 明确教师和园长的教学中心职责
- [ ] 调整菜单结构
- [ ] 测试菜单导航

---

## 🧪 测试场景

### 场景1：教师发送班级通知
```
1. 教师登录，进入"通知中心"
2. 点击"发送通知"
3. 输入标题和内容
4. 系统自动选择班级
5. 点击"发送"
6. 验证：
   - 通知已创建
   - 班级所有学生的家长都收到通知
   - 家长在"通知中心"看到通知
   - 园长在"通知管理"看到发送情况
```

### 场景2：教师创建班级活动
```
1. 教师登录，进入"活动中心"
2. 点击"创建活动"
3. 输入活动信息
4. 点击"创建"
5. 验证：
   - 活动已创建，teacherId和classId已记录
   - 班级所有家长收到活动通知
   - 家长在"活动列表"看到活动
   - 园长在"活动管理"看到教师创建的活动
```

### 场景3：教师创建学生成长报告
```
1. 教师登录，进入"教学中心" -> "成长报告"
2. 选择学生
3. 输入报告内容
4. 点击"创建"
5. 验证：
   - 报告已创建，teacherId已记录
   - 学生的家长收到报告通知
   - 家长在"成长报告"看到报告
   - 园长在"教学管理"看到教师创建的报告
```

---

## 📊 预期效果

修复后：

| 指标 | 修复前 | 修复后 |
|------|--------|--------|
| 教师能否向家长发送通知 | ❌ 否 | ✅ 是 |
| 家长能否接收教师通知 | ❌ 否 | ✅ 是 |
| 园长能否追踪教师活动 | ❌ 否 | ✅ 是 |
| 教师能否创建成长报告 | ❌ 否 | ✅ 是 |
| 家长能否看到成长报告 | ❌ 否 | ✅ 是 |
| 教师中心功能定位清晰 | ❌ 否 | ✅ 是 |
| 数据关联完整 | ❌ 否 | ✅ 是 |


