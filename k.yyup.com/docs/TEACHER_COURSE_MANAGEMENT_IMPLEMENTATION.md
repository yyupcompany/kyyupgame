# 教学中心多课程跟踪管理 - 实施文档

## 📋 项目概述

本项目实现了教学中心统一课程管理体系,支持:
- 园长/Admin创建和管理课程
- 教师执行和跟踪多个课程
- 数据实时同步一体化
- 手动和自动课程分配

---

## 🗄️ 数据库架构

### 1. 核心表结构

#### `teacher_class_courses` - 教师-班级-课程关联表
```sql
CREATE TABLE teacher_class_courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  teacher_id INT NOT NULL,
  class_id INT NOT NULL,
  course_plan_id INT NOT NULL,
  brain_science_course_id INT NOT NULL,
  assigned_by INT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('assigned', 'in_progress', 'completed', 'paused'),
  start_date DATE,
  expected_end_date DATE,
  actual_end_date DATE,
  remarks TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  UNIQUE KEY (teacher_id, class_id, course_plan_id)
);
```

#### `teacher_course_records` - 教师课程执行记录表
```sql
CREATE TABLE teacher_course_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  teacher_class_course_id INT NOT NULL,
  teacher_id INT NOT NULL,
  class_id INT NOT NULL,
  course_plan_id INT NOT NULL,
  lesson_number INT,
  lesson_date DATE NOT NULL,
  lesson_duration INT,
  attendance_count INT,
  teaching_content TEXT,
  teaching_method VARCHAR(100),
  teaching_effect ENUM('excellent', 'good', 'average', 'poor'),
  student_feedback TEXT,
  difficulties TEXT,
  improvements TEXT,
  media_files JSON,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 2. 扩展字段

#### `course_progress` 表扩展
```sql
ALTER TABLE course_progress 
ADD COLUMN teacher_id INT,
ADD COLUMN last_lesson_date DATE,
ADD COLUMN total_lessons INT DEFAULT 0,
ADD COLUMN completed_lessons INT DEFAULT 0;
```

#### `course_plans` 表扩展
```sql
ALTER TABLE course_plans
ADD COLUMN is_published BOOLEAN DEFAULT FALSE,
ADD COLUMN published_at TIMESTAMP NULL,
ADD COLUMN published_by INT,
ADD COLUMN target_teachers JSON;
```

### 3. 视图

#### `v_teacher_courses_overview` - 教师课程概览视图
自动计算进度百分比、记录数等统计信息

---

## 🔧 后端实现

### 1. Model层

#### 文件清单
- ✅ `server/src/models/teacher-class-course.model.ts`
- ✅ `server/src/models/teacher-course-record.model.ts`

#### 核心方法

**TeacherClassCourse**
```typescript
// 获取教师所有课程
getTeacherCourses(teacherId, options)

// 获取课程统计
getCourseStats(teacherId)
```

**TeacherCourseRecord**
```typescript
// 获取课程记录
getCourseRecords(teacherClassCourseId, options)

// 获取记录统计
getRecordStats(teacherClassCourseId)
```

### 2. Controller层

#### 文件: `server/src/controllers/teacher-courses.controller.ts`

**API方法**
- `getMyCourses()` - 获取课程列表
- `getCourseDetail()` - 获取课程详情
- `addCourseRecord()` - 添加教学记录
- `updateCourseRecord()` - 更新教学记录
- `deleteCourseRecord()` - 删除教学记录
- `getCourseStats()` - 获取统计数据
- `updateCourseStatus()` - 更新课程状态

### 3. Routes层

#### 文件: `server/src/routes/teacher-courses.routes.ts`

**路由表**
```
GET    /api/teacher/courses              # 课程列表
GET    /api/teacher/courses/stats        # 统计数据
GET    /api/teacher/courses/:courseId    # 课程详情
PUT    /api/teacher/courses/:courseId/status  # 更新状态
POST   /api/teacher/courses/:courseId/records # 添加记录
PUT    /api/teacher/courses/:courseId/records/:recordId # 更新记录
DELETE /api/teacher/courses/:courseId/records/:recordId # 删除记录
```

---

## 🎨 前端实现

### 1. API层

#### 文件: `client/src/api/modules/teacher-courses.ts`

**类型定义**
```typescript
enum CourseStatus {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PAUSED = 'paused'
}

interface TeacherCourse { ... }
interface TeacherCourseRecord { ... }
interface CourseStats { ... }
```

**API方法**
```typescript
getMyCourses(params?)
getCourseStats()
getCourseDetail(courseId)
updateCourseStatus(courseId, status)
addCourseRecord(courseId, data)
updateCourseRecord(courseId, recordId, data)
deleteCourseRecord(courseId, recordId)
```

### 2. 页面组件 (需开发)

#### `/client/src/pages/teacher-center/teaching/index.vue` (重构)

**组件结构**
```vue
<template>
  <UnifiedCenterLayout>
    <!-- 顶部统计卡片 -->
    <CourseStatsCards :stats="courseStats" />
    
    <!-- 课程列表 -->
    <div class="course-list">
      <CourseCard 
        v-for="course in courses" 
        :key="course.id"
        :course="course"
        @view-detail="handleViewDetail"
        @add-record="handleAddRecord"
      />
    </div>
    
    <!-- 课程详情对话框 -->
    <CourseDetailDialog 
      v-model="detailVisible"
      :course="currentCourse"
    />
    
    <!-- 添加记录对话框 -->
    <AddRecordDialog 
      v-model="recordVisible"
      :course="currentCourse"
      @submit="handleSubmitRecord"
    />
  </UnifiedCenterLayout>
</template>
```

#### 子组件需求

1. **CourseStatsCards.vue**
   - 展示统计数据(进行中/已完成/本周记录)

2. **CourseCard.vue**
   - 课程卡片展示
   - 进度条
   - 快捷操作按钮

3. **CourseDetailDialog.vue**
   - 课程详细信息
   - 教学记录列表
   - 进度图表

4. **AddRecordDialog.vue**
   - 教学记录表单
   - 支持上传媒体文件
   - 教学效果评分

---

## 📊 数据流

### 1. 课程分配流程

```
园长在TeachingCenter创建课程
         ↓
点击"分配课程"
         ↓
选择教师、班级、课程
         ↓
创建teacher_class_courses记录
         ↓
教师在teaching页面看到新课程
```

### 2. 教学记录流程

```
教师查看已分配课程
         ↓
选择课程点击"添加记录"
         ↓
填写教学内容、效果等
         ↓
提交创建teacher_course_records
         ↓
自动更新course_progress
         ↓
园长端实时看到进度更新
```

---

## 🚀 部署步骤

### 1. 数据库迁移
```bash
# 执行SQL脚本
mysql -u root -p kindergarten_sales < server/database/migrations/add-teacher-course-tracking.sql
```

### 2. 启动后端
```bash
cd server
npm run dev
```

### 3. 验证API
```bash
# 测试教师课程列表
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/teacher/courses

# 测试统计数据
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/teacher/courses/stats
```

### 4. 前端开发
```bash
cd client
npm run dev
```

---

## ✅ 功能清单

### 已完成
- [x] 数据库表设计和创建
- [x] Sequelize Model层
- [x] Controller层API
- [x] Routes注册
- [x] 前端API封装
- [x] TypeScript类型定义

### 待开发
- [ ] 前端teaching页面重构
- [ ] 课程卡片组件
- [ ] 详情对话框组件
- [ ] 添加记录表单组件
- [ ] 园长端课程分配功能
- [ ] 课程自动分配逻辑
- [ ] 进度图表可视化
- [ ] 媒体文件上传

---

## 🎯 下一步开发建议

### 优先级1 (核心功能)
1. 重构 `/client/src/pages/teacher-center/teaching/index.vue`
2. 创建基础组件库
3. 实现课程列表和详情展示

### 优先级2 (增强功能)
1. 园长端分配界面
2. 自动分配规则配置
3. 进度可视化图表

### 优先级3 (优化功能)
1. 批量导入教学记录
2. 教学效果分析报告
3. 学生个人进度跟踪

---

## 📝 注意事项

1. **权限控制**: 教师只能查看和操作自己被分配的课程
2. **数据同步**: 教学记录自动更新course_progress表
3. **状态管理**: 课程状态自动流转(assigned→in_progress→completed)
4. **错误处理**: API层做好异常捕获和用户提示
5. **性能优化**: 课程列表使用分页加载

---

## 🔗 相关文件

### 数据库
- `server/database/migrations/add-teacher-course-tracking.sql`

### 后端
- `server/src/models/teacher-class-course.model.ts`
- `server/src/models/teacher-course-record.model.ts`
- `server/src/controllers/teacher-courses.controller.ts`
- `server/src/routes/teacher-courses.routes.ts`
- `server/src/routes/teaching/index.ts`

### 前端
- `client/src/api/modules/teacher-courses.ts`
- `client/src/pages/teacher-center/teaching/index.vue` (待重构)

---

**文档更新时间**: 2025-12-17  
**版本**: v1.0  
**作者**: AI Assistant
