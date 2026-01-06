# 教学中心架构文档

## 📋 目录

- [概述](#概述)
- [数据库架构](#数据库架构)
- [后端架构](#后端架构)
- [前端架构](#前端架构)
- [API端点](#api端点)
- [数据流](#数据流)
- [常见问题](#常见问题)
- [维护指南](#维护指南)

---

## 概述

教学中心是幼儿园管理系统的核心业务模块之一,负责管理脑科学课程、户外训练、校外展示和锦标赛等教学活动。

### 核心功能

1. **脑科学课程管理** - 课程计划、课程进度跟踪
2. **户外训练管理** - 训练记录、达标率统计
3. **校外展示管理** - 展示活动、成果记录
4. **锦标赛管理** - 比赛记录、成绩统计

### 技术栈

- **前端**: Vue 3 + TypeScript + Element Plus + Pinia
- **后端**: Express.js + TypeScript + Sequelize ORM
- **数据库**: MySQL 8.0

---

## 数据库架构

### 数据模型关系图

```
BrainScienceCourse (脑科学课程)
    ↓ 1:N
CoursePlan (课程计划)
    ↓ 1:N
CourseProgress (课程进度)

Class (班级)
    ↓ 1:N
OutdoorTrainingRecord (户外训练记录)
    ↓ 1:N
TeachingMediaRecord (教学媒体记录)

Class (班级)
    ↓ 1:N
ExternalDisplayRecord (校外展示记录)
    ↓ 1:N
TeachingMediaRecord (教学媒体记录)

ChampionshipRecord (锦标赛记录)
    ↓ 1:N
TeachingMediaRecord (教学媒体记录)
```

### 核心数据表

#### 1. brain_science_courses (脑科学课程表)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键 |
| course_name | VARCHAR(200) | 课程名称 |
| course_code | VARCHAR(50) | 课程编码 |
| course_type | ENUM | 课程类型: core/extended/special |
| difficulty_level | INT | 难度级别: 1-4 |
| target_age_group | VARCHAR(50) | 目标年龄组 |
| duration_weeks | INT | 课程周数 |
| objectives | TEXT | 课程目标 |
| content_outline | TEXT | 内容大纲 |
| teaching_methods | TEXT | 教学方法 |
| assessment_criteria | TEXT | 评估标准 |

#### 2. course_plans (课程计划表)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键 |
| course_id | INT | 课程ID (外键) |
| class_id | INT | 班级ID (外键) |
| semester | VARCHAR(20) | 学期 |
| academic_year | VARCHAR(20) | 学年 |
| start_date | DATE | 开始日期 |
| end_date | DATE | 结束日期 |
| teacher_id | INT | 教师ID (外键) |
| plan_status | ENUM | 计划状态: draft/active/completed/cancelled |

#### 3. course_progress (课程进度表)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键 |
| plan_id | INT | 课程计划ID (外键) |
| class_id | INT | 班级ID (外键) |
| course_id | INT | 课程ID (外键) |
| semester | VARCHAR(20) | 学期 |
| academic_year | VARCHAR(20) | 学年 |
| completion_date | DATE | 完成日期 |
| total_students | INT | 总学生数 |
| participated_students | INT | 参与学生数 |
| achieved_students | INT | 达标学生数 |
| achievement_rate | DECIMAL(5,2) | 达标率 |
| teaching_quality_score | DECIMAL(3,2) | 教学质量评分 |
| notes | TEXT | 备注 |

#### 4. outdoor_training_records (户外训练记录表)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键 |
| class_id | INT | 班级ID (外键) |
| semester | VARCHAR(20) | 学期 |
| academic_year | VARCHAR(20) | 学年 |
| week_number | INT | 周次 |
| training_type | ENUM | 训练类型: outdoor_training/departure_display |
| training_date | DATE | 训练日期 |
| completion_status | ENUM | 完成状态: pending/completed/cancelled |
| participation_count | INT | 参与人数 |
| achievement_count | INT | 达标人数 |
| achievement_rate | DECIMAL(5,2) | 达标率 |
| has_media | BOOLEAN | 是否有媒体文件 |
| media_count | INT | 媒体文件数量 |
| weather_condition | VARCHAR(50) | 天气状况 |
| training_content | TEXT | 训练内容 |
| notes | TEXT | 备注 |
| teacher_id | INT | 教师ID (外键) |
| confirmed_by | INT | 确认人ID (外键) |
| confirmed_at | DATETIME | 确认时间 |

#### 5. external_display_records (校外展示记录表)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键 |
| class_id | INT | 班级ID (外键) |
| semester | VARCHAR(20) | 学期 |
| academic_year | VARCHAR(20) | 学年 |
| display_date | DATE | 展示日期 |
| display_location | VARCHAR(200) | 展示地点 |
| display_type | ENUM | 展示类型: performance/competition/exhibition/other |
| participation_count | INT | 参与人数 |
| achievement_level | ENUM | 成就级别: excellent/good/average/poor |
| achievement_rate | DECIMAL(5,2) | 达标率 |
| has_media | BOOLEAN | 是否有媒体文件 |
| media_count | INT | 媒体文件数量 |
| display_content | TEXT | 展示内容 |
| feedback | TEXT | 反馈 |
| awards | TEXT | 获奖情况 |
| expenses | DECIMAL(10,2) | 费用 |
| notes | TEXT | 备注 |
| teacher_id | INT | 教师ID (外键) |
| organizer | VARCHAR(100) | 组织者 |
| created_by | INT | 创建人ID (外键) |

#### 6. championship_records (锦标赛记录表)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键 |
| semester | VARCHAR(20) | 学期 |
| academic_year | VARCHAR(20) | 学年 |
| championship_date | DATE | 锦标赛日期 |
| championship_name | VARCHAR(200) | 锦标赛名称 |
| championship_type | ENUM | 类型: semester/annual/special |
| total_participants | INT | 总参与人数 |
| brain_science_achievement_rate | DECIMAL(5,2) | 脑科学达标率 |
| course_content_achievement_rate | DECIMAL(5,2) | 课程内容达标率 |
| outdoor_training_achievement_rate | DECIMAL(5,2) | 户外训练达标率 |
| external_display_achievement_rate | DECIMAL(5,2) | 校外展示达标率 |
| overall_achievement_rate | DECIMAL(5,2) | 总体达标率 |
| completion_status | ENUM | 完成状态: pending/in_progress/completed/cancelled |
| has_media | BOOLEAN | 是否有媒体文件 |
| media_count | INT | 媒体文件数量 |
| awards | TEXT | 获奖情况 |
| winners | TEXT | 获奖者 |
| championship_rules | TEXT | 比赛规则 |
| summary | TEXT | 总结 |
| notes | TEXT | 备注 |
| organizer_id | INT | 组织者ID (外键) |
| created_by | INT | 创建人ID (外键) |

#### 7. teaching_media_records (教学媒体记录表)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键 |
| record_type | ENUM | 记录类型: course/outdoor/display/championship |
| record_id | INT | 关联记录ID |
| media_type | ENUM | 媒体类型: photo/video/document |
| file_url | VARCHAR(500) | 文件URL |
| file_size | INT | 文件大小(字节) |
| thumbnail_url | VARCHAR(500) | 缩略图URL |
| description | TEXT | 描述 |
| uploaded_by | INT | 上传人ID (外键) |
| uploaded_at | DATETIME | 上传时间 |

---

## 后端架构

### 目录结构

```
server/src/
├── models/                          # 数据模型
│   ├── brain-science-course.model.ts
│   ├── course-plan.model.ts
│   ├── course-progress.model.ts
│   ├── outdoor-training-record.model.ts
│   ├── external-display-record.model.ts
│   ├── championship-record.model.ts
│   └── teaching-media-record.model.ts
├── controllers/                     # 控制器
│   └── teaching-center.controller.ts
├── services/                        # 业务逻辑
│   └── teaching-center.service.ts
├── routes/                          # 路由
│   └── teaching-center.routes.ts
└── init.ts                          # 模型初始化
```

### 模型初始化

所有教学中心模型在 `server/src/init.ts` 中初始化:

```typescript
// 教学中心模型初始化 (lines 425-455)
console.log('=== 开始初始化教学中心模型 ===');
initBrainScienceCourseModel(sequelize);
initCoursePlanModel(sequelize);
initCourseProgressModel(sequelize);
initOutdoorTrainingRecordModel(sequelize);
initExternalDisplayRecordModel(sequelize);
initChampionshipRecordModel(sequelize);
initTeachingMediaRecordModel(sequelize);
console.log('=== 教学中心模型初始化完成 ===');
```

### 模型关联

模型关联在 `server/src/init.ts` 中设置 (lines 699-725):

```typescript
// 教学中心模型关联
console.log('📚 设置教学中心模型关联...');
setupTeachingCenterAssociations();
console.log('✅ 教学中心模型关联设置完成');
```

### 服务层架构

`server/src/services/teaching-center.service.ts` 提供以下核心方法:

1. **课程进度统计** - `getCourseProgressStats()`
2. **户外训练统计** - `getOutdoorTrainingStats()`
3. **校外展示统计** - `getExternalDisplayStats()`
4. **锦标赛统计** - `getChampionshipStats()`

---

## 前端架构

### 目录结构

```
client/src/
├── pages/teaching-center/           # 教学中心页面
│   └── index.vue                    # 主页面
├── api/endpoints/                   # API端点
│   └── teaching-center.ts           # 教学中心API
└── stores/                          # 状态管理
    └── teaching-center.ts           # 教学中心状态
```

### 页面组件

教学中心主页面 (`client/src/pages/teaching-center/index.vue`) 包含四个核心模块:

1. **课程进度卡片** - 显示课程普及进度和达标率
2. **户外训练卡片** - 显示户外训练和出发展示完成情况
3. **校外展示卡片** - 显示校外展示活动统计
4. **锦标赛卡片** - 显示锦标赛成绩和达标率

---

## API端点

### 基础路径

```
/api/teaching-center
```

#### 3. 获取校外展示统计

```http
GET /api/teaching-center/external-display
```

**查询参数**:
- `semester` (可选): 学期
- `academicYear` (可选): 学年
- `classId` (可选): 班级ID

**响应示例**:
```json
{
  "success": true,
  "message": "获取校外展示统计成功",
  "data": {
    "overview": {
      "total_activities": 80,
      "completed_activities": 0,
      "completion_rate": 0,
      "average_achievement_rate": 0,
      "semester_total_outings": 0,
      "all_time_total_outings": 0
    },
    "class_statistics": [
      {
        "class_id": 1,
        "class_name": "小一班",
        "semester_outings": 0,
        "total_outings": 0,
        "achievement_rate": 0,
        "has_media": false,
        "media_count": 0
      }
    ]
  }
}
```

#### 4. 获取锦标赛统计

```http
GET /api/teaching-center/championship
```

**查询参数**:
- `semester` (可选): 学期
- `academicYear` (可选): 学年

**响应示例**:
```json
{
  "success": true,
  "message": "获取锦标赛统计成功",
  "data": {
    "overview": {
      "semester_championships": 1,
      "total_championships": 1,
      "completed_championships": 1,
      "completion_rate": 100
    },
    "achievement_rates": {
      "brain_science_plan": 85,
      "course_content": 88,
      "outdoor_training_display": 82,
      "external_display": 79
    },
    "championship_list": [
      {
        "id": 1,
        "championship_name": "本学期全员锦标赛",
        "championship_date": "2026-01-21",
        "completion_status": "completed",
        "participant_count": 300,
        "brain_science_achievement_rate": "85.00",
        "course_content_achievement_rate": "88.00",
        "outdoor_training_achievement_rate": "82.00",
        "external_display_achievement_rate": "79.00",
        "overall_achievement_rate": "83.50",
        "has_media": false,
        "media_count": null
      }
    ]
  }
}
```

---

## 数据流

### 前端 → 后端数据流

```
1. 用户访问教学中心页面
   ↓
2. 前端组件挂载,调用API
   client/src/pages/teaching-center/index.vue
   ↓
3. API客户端发送请求
   client/src/api/endpoints/teaching-center.ts
   ↓
4. 后端路由接收请求
   server/src/routes/teaching-center.routes.ts
   ↓
5. 控制器处理请求
   server/src/controllers/teaching-center.controller.ts
   ↓
6. 服务层查询数据库
   server/src/services/teaching-center.service.ts
   ↓
7. Sequelize ORM执行SQL查询
   server/src/models/*.model.ts
   ↓
8. MySQL数据库返回数据
   ↓
9. 服务层处理数据
   ↓
10. 控制器返回响应
   ↓
11. 前端接收数据并渲染
```

### 数据库查询流程

以户外训练统计为例:

```typescript
// 1. 服务层查询 (teaching-center.service.ts)
const records = await OutdoorTrainingRecord.findAll({
  where: {
    semester,
    academic_year: academicYear
  },
  include: [{
    model: Class,
    as: 'class',
    attributes: ['id', 'name', 'current_student_count']
  }]
});

// 2. 数据聚合
const overview = {
  total_weeks: 16,
  outdoor_training: {
    completed_weeks: records.filter(r =>
      r.training_type === 'outdoor_training' &&
      r.completion_status === 'completed'
    ).length
  }
};

// 3. 按班级分组统计
const classStats = records.reduce((acc, record) => {
  // 分组逻辑
}, []);

// 4. 返回结果
return { overview, class_statistics: classStats };
```

---

## 常见问题

### 问题1: API返回500错误 - "Unknown column"

**症状**:
```
Error: Unknown column 'OutdoorTrainingRecord.location' in 'field list'
```

**原因**:
模型定义中的字段名与数据库实际字段名不匹配。

**解决方案**:
1. 检查数据库实际字段名:
```sql
DESCRIBE outdoor_training_records;
```

2. 修改模型定义,确保字段名匹配:
```typescript
// server/src/models/outdoor-training-record.model.ts
export interface OutdoorTrainingRecordAttributes {
  // 使用数据库实际字段名
  participation_count: number;  // 不是 attendance_count
  achievement_count: number;    // 不是 target_achieved_count
  training_content?: string;    // 不是 activities_content
}
```

3. 重新编译:
```bash
cd server
rm -rf dist
npm run build
npm run dev
```

### 问题2: 前端显示硬编码数据

**症状**:
前端显示的数据始终是固定值,不随数据库变化。

**原因**:
服务层返回硬编码的模拟数据,而不是查询数据库。

**解决方案**:
1. 检查服务层方法:
```typescript
// ❌ 错误: 返回硬编码数据
public static async getCourseProgressStats() {
  return {
    overview: {
      completion_rate: 76,  // 硬编码
      average_achievement_rate: 82  // 硬编码
    }
  };
}

// ✅ 正确: 查询数据库
public static async getCourseProgressStats() {
  const records = await CourseProgress.findAll({...});
  const completionRate = calculateRate(records);
  return {
    overview: {
      completion_rate: completionRate,
      average_achievement_rate: calculateAchievementRate(records)
    }
  };
}
```

2. 移除所有硬编码返回值
3. 使用Sequelize查询真实数据

### 问题3: 编译成功但运行时仍报错

**症状**:
TypeScript编译成功,但运行时仍然报字段不存在错误。

**原因**:
旧的编译文件未被清理,Node.js加载了旧的JavaScript文件。

**解决方案**:
```bash
# 1. 清理旧的编译文件
cd server
rm -rf dist

# 2. 重新编译
npm run build

# 3. 重启服务
npm run dev
```

### 问题4: 数据库中有数据但API返回空

**症状**:
数据库查询显示有数据,但API返回空数组或null。

**原因**:
查询条件不匹配或模型关联配置错误。

**解决方案**:
1. 检查查询条件:
```typescript
// 确保查询条件与数据库数据匹配
const records = await OutdoorTrainingRecord.findAll({
  where: {
    semester: '2024-2025-1',  // 确保格式正确
    academic_year: '2024-2025'
  }
});
```

2. 检查模型关联:
```typescript
// server/src/init.ts
setupTeachingCenterAssociations();  // 确保已调用
```

3. 直接查询数据库验证:
```sql
SELECT * FROM outdoor_training_records
WHERE semester = '2024-2025-1'
AND academic_year = '2024-2025';
```

---

## 维护指南

### 添加新字段

1. **修改数据库**:
```sql
ALTER TABLE outdoor_training_records
ADD COLUMN new_field VARCHAR(100);
```

2. **更新模型接口**:
```typescript
// server/src/models/outdoor-training-record.model.ts
export interface OutdoorTrainingRecordAttributes {
  // ... 现有字段
  new_field?: string;  // 添加新字段
}
```

3. **更新模型定义**:
```typescript
OutdoorTrainingRecord.init({
  // ... 现有字段
  new_field: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '新字段说明'
  }
}, {...});
```

4. **重新编译和测试**:
```bash
npm run build
npm run dev
```

### 添加新的统计方法

1. **在服务层添加方法**:
```typescript
// server/src/services/teaching-center.service.ts
public static async getNewStats(params: any) {
  const records = await Model.findAll({...});
  // 处理逻辑
  return result;
}
```

2. **在控制器添加端点**:
```typescript
// server/src/controllers/teaching-center.controller.ts
export const getNewStats = async (req: Request, res: Response) => {
  try {
    const result = await TeachingCenterService.getNewStats(req.query);
    res.json({
      success: true,
      message: '获取统计成功',
      data: result
    });
  } catch (error) {
    // 错误处理
  }
};
```

3. **添加路由**:
```typescript
// server/src/routes/teaching-center.routes.ts
router.get('/new-stats',
  requireRole(['admin', 'principal', 'teacher']),
  getNewStats
);
```

4. **前端调用**:
```typescript
// client/src/api/endpoints/teaching-center.ts
export const getNewStats = (params?: any) => {
  return request.get('/teaching-center/new-stats', { params });
};
```

### 性能优化建议

1. **添加数据库索引**:
```sql
-- 为常用查询字段添加索引
CREATE INDEX idx_semester_year ON outdoor_training_records(semester, academic_year);
CREATE INDEX idx_class_semester ON course_progress(class_id, semester);
```

2. **使用查询缓存**:
```typescript
// 缓存统计结果(5分钟)
const cacheKey = `teaching-stats:${semester}:${academicYear}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const result = await queryDatabase();
await redis.setex(cacheKey, 300, JSON.stringify(result));
return result;
```

3. **分页查询大数据集**:
```typescript
const { page = 1, pageSize = 20 } = params;
const records = await Model.findAndCountAll({
  limit: pageSize,
  offset: (page - 1) * pageSize
});
```

### 调试技巧

1. **启用SQL日志**:
```typescript
// server/src/config/database.ts
const sequelize = new Sequelize({
  logging: console.log,  // 打印SQL语句
  // ...
});
```

2. **使用MySQL直接查询验证**:
```bash
mysql -h dbconn.sealoshzh.site -P 43906 -u root -p'Yyup@2024' kargerdensales \
  -e "SELECT * FROM outdoor_training_records LIMIT 5;"
```

3. **检查后端日志**:
```bash
# 查看实时日志
cd server
npm run dev 2>&1 | grep -E "(Error|错误|户外训练|校外展示|锦标赛)"
```

---

## 版本历史

### v1.0.0 (2025-10-08)

**重大更新**: 移除所有硬编码数据,实现真实数据库集成

**修复的问题**:
1. ✅ 修复了模型字段名不匹配问题
   - OutdoorTrainingRecord: 移除 `location`, `duration_minutes`, `activities_content`
   - ExternalDisplayRecord: 移除 `event_name`, 重命名字段
   - ChampionshipRecord: 移除 `description`, `total_classes`, `budget_amount`, `actual_cost`

2. ✅ 移除了服务层的硬编码数据
   - `getCourseProgressStats()` - 现在查询真实数据
   - `getOutdoorTrainingStats()` - 现在查询真实数据
   - `getExternalDisplayStats()` - 现在查询真实数据
   - `getChampionshipStats()` - 现在查询真实数据

3. ✅ 修复了编译和部署问题
   - 清理旧的编译文件
   - 重新编译TypeScript
   - 重启后端服务

**测试结果**:
- ✅ 户外训练API: 成功返回真实数据
- ✅ 校外展示API: 成功返回真实数据
- ✅ 锦标赛API: 成功返回真实数据
- ✅ 课程进度API: 成功返回真实数据

---

## 相关文档

- [数据库架构文档](./DATABASE_ARCHITECTURE.md)
- [API文档](./API_DOCUMENTATION.md)
- [前端开发指南](./FRONTEND_DEVELOPMENT_GUIDE.md)
- [后端开发指南](./BACKEND_DEVELOPMENT_GUIDE.md)

---

## 联系方式

如有问题,请联系开发团队或查看项目README。

**最后更新**: 2025-10-08
**维护者**: 开发团队

### 端点列表

#### 1. 获取课程进度统计

```http
GET /api/teaching-center/course-progress
```

**查询参数**:
- `semester` (可选): 学期,如 "2024-2025-1"
- `academicYear` (可选): 学年,如 "2024-2025"
- `classId` (可选): 班级ID

**响应示例**:
```json
{
  "success": true,
  "message": "获取课程进度统计成功",
  "data": {
    "overview": {
      "total_courses": 16,
      "total_plans": 160,
      "completed_courses": 100,
      "completion_rate": 63,
      "average_achievement_rate": 54
    },
    "class_statistics": [
      {
        "class_id": 1,
        "class_name": "小一班",
        "total_courses": 16,
        "completed_courses": 10,
        "completion_rate": 63,
        "average_achievement_rate": 54
      }
    ]
  }
}
```

#### 2. 获取户外训练统计

```http
GET /api/teaching-center/outdoor-training
```

**查询参数**:
- `semester` (可选): 学期
- `academicYear` (可选): 学年
- `classId` (可选): 班级ID

**响应示例**:
```json
{
  "success": true,
  "message": "获取户外训练统计成功",
  "data": {
    "overview": {
      "total_weeks": 16,
      "outdoor_training": {
        "completed_weeks": 12,
        "average_rate": 75
      },
      "departure_display": {
        "completed_weeks": 0,
        "average_rate": 0
      }
    },
    "class_statistics": [
      {
        "class_id": 1,
        "class_name": "小一班",
        "outdoor_training_completed": 12,
        "departure_display_completed": 0,
        "outdoor_training_rate": 75,
        "departure_display_rate": 0,
        "total_completed": 12,
        "total_rate": 75,
        "has_media": false,
        "media_count": 0
      }
    ]
  }
}
```


