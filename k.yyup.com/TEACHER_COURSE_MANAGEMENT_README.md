# 教师课程管理系统 - 快速开始

## 📖 系统概述

本系统实现了**教学中心统一课程管理架构**:
- 园长/Admin创建和管理课程
- 教师执行和跟踪多个课程
- 数据实时同步一体化
- 支持手动和自动课程分配

---

## 🚀 快速部署

### 步骤1: 执行数据库迁移

```bash
# 方式1: 使用脚本 (推荐)
cd scripts
chmod +x migrate-teacher-courses.sh
./migrate-teacher-courses.sh

# 方式2: 手动执行SQL
mysql -u root -p kargerdensales < server/database/migrations/add-teacher-course-tracking.sql
```

### 步骤2: 启动后端服务

```bash
cd server
npm install  # 如果是首次运行
npm run dev
```

### 步骤3: 验证API

```bash
# 获取教师课程列表
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/teacher/courses

# 获取课程统计
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/teacher/courses/stats
```

---

## 📁 项目结构

```
├── server/
│   ├── database/migrations/
│   │   └── add-teacher-course-tracking.sql      # 数据库迁移脚本
│   ├── src/
│   │   ├── models/
│   │   │   ├── teacher-class-course.model.ts    # 教师课程关联Model
│   │   │   └── teacher-course-record.model.ts   # 教学记录Model
│   │   ├── controllers/
│   │   │   └── teacher-courses.controller.ts    # Controller层
│   │   └── routes/
│   │       ├── teacher-courses.routes.ts        # Routes配置
│   │       └── teaching/index.ts                # 路由注册
│
├── client/
│   └── src/
│       └── api/modules/
│           └── teacher-courses.ts                # 前端API封装
│
├── scripts/
│   └── migrate-teacher-courses.sh                # 一键部署脚本
│
└── docs/
    └── TEACHER_COURSE_MANAGEMENT_IMPLEMENTATION.md # 详细文档
```

---

## 🔧 核心功能

### 后端API (已完成 ✅)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/teacher/courses` | 获取教师课程列表 |
| GET | `/api/teacher/courses/stats` | 获取课程统计 |
| GET | `/api/teacher/courses/:id` | 获取课程详情 |
| PUT | `/api/teacher/courses/:id/status` | 更新课程状态 |
| POST | `/api/teacher/courses/:id/records` | 添加教学记录 |
| PUT | `/api/teacher/courses/:id/records/:rid` | 更新教学记录 |
| DELETE | `/api/teacher/courses/:id/records/:rid` | 删除教学记录 |

### 前端组件 (待开发 ⏳)

- [ ] 教师端课程列表页面
- [ ] 课程卡片组件
- [ ] 课程详情对话框
- [ ] 添加教学记录表单
- [ ] 园长端课程分配界面

---

## 📊 数据表结构

### 核心表

1. **teacher_class_courses** - 教师课程关联表
   - 记录哪个教师负责哪个班级的哪个课程
   - 包含课程状态、分配信息等

2. **teacher_course_records** - 教学记录表
   - 记录每次上课的详细内容
   - 教学效果、学生反馈、改进建议等

3. **student_course_progress** - 学生课程进度表
   - 跟踪单个学生的课程进度
   - 技能评估、学习记录等

### 扩展字段

- `course_progress`: 添加teacher_id、last_lesson_date等
- `course_plans`: 添加is_published、target_teachers等

---

## 💡 使用示例

### 教师端 - 获取我的课程

```typescript
import { getMyCourses, CourseStatus } from '@/api/modules/teacher-courses';

// 获取所有课程
const courses = await getMyCourses();

// 获取进行中的课程
const activeCourses = await getMyCourses({ 
  status: CourseStatus.IN_PROGRESS 
});

// 获取特定班级的课程
const classCourses = await getMyCourses({ 
  classId: 123 
});
```

### 教师端 - 添加教学记录

```typescript
import { addCourseRecord } from '@/api/modules/teacher-courses';

const record = await addCourseRecord(courseId, {
  lesson_date: '2025-12-17',
  lesson_number: 5,
  lesson_duration: 45,
  attendance_count: 28,
  teaching_content: '学习颜色识别',
  teaching_method: '游戏教学',
  teaching_effect: 'excellent',
  student_feedback: '学生积极参与，效果很好'
});
```

---

## 🎯 下一步开发

### 优先级1: 前端核心页面
1. 重构 `/teacher-center/teaching/index.vue`
2. 创建课程卡片组件
3. 实现课程详情展示

### 优先级2: 园长端功能
1. 课程分配界面
2. 自动分配规则配置
3. 全局进度监控

### 优先级3: 增强功能
1. 批量导入教学记录
2. 教学效果分析报告
3. 学生个人档案

---

## 📚 相关文档

- [完整实施文档](./docs/TEACHER_COURSE_MANAGEMENT_IMPLEMENTATION.md)
- [API接口文档](http://localhost:3000/api-docs)
- [数据库设计文档](./server/database/migrations/add-teacher-course-tracking.sql)

---

## ⚠️ 注意事项

1. **权限控制**: 确保教师只能访问自己被分配的课程
2. **数据一致性**: 教学记录会自动更新课程进度
3. **状态管理**: 课程状态会根据操作自动流转
4. **性能优化**: 大量课程时注意使用分页

---

## 🐛 常见问题

**Q: API返回401未授权?**  
A: 检查Token是否正确,是否已过期

**Q: 数据库迁移失败?**  
A: 检查数据库连接配置,确认用户有CREATE权限

**Q: 看不到课程列表?**  
A: 确认园长已经分配课程给该教师

---

**更新时间**: 2025-12-17  
**版本**: v1.0  
**状态**: 后端已完成 | 前端开发中
