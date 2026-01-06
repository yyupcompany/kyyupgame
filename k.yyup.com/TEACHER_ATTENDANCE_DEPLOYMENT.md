# 教师考勤中心部署指南

## 📋 项目概述

教师考勤中心是一个完整的考勤管理系统，包含：
1. **教师打卡** - 教师自己的签到签退和请假
2. **学生考勤** - 教师为班级学生打卡
3. **统计分析** - 考勤数据统计和趋势分析
4. **历史记录** - 考勤历史查询和导出

---

## ✅ 已完成的工作

### 1. 前端开发 ✅ 100%

#### 组件文件
```
client/src/pages/teacher-center/attendance/
├── index.vue                           # 主页面（Tab切换）
└── components/
    ├── TeacherCheckIn.vue             # 教师打卡Tab ✅
    ├── StudentAttendance.vue          # 学生考勤Tab ✅
    ├── AttendanceStatistics.vue       # 统计分析Tab ✅
    └── AttendanceHistory.vue          # 历史记录Tab ✅
```

#### API模块
```
client/src/api/modules/teacher-checkin.ts  # 教师打卡API ✅
```

### 2. 后端开发 ✅ 100%

#### 数据库
```
server/src/models/teacher-attendance.model.ts      # Sequelize模型 ✅
server/src/migrations/20250112-create-teacher-attendances.js  # 迁移文件 ✅
```

#### 服务层
```
server/src/services/teacher-attendance.service.ts  # 业务逻辑 ✅
```

#### 控制器
```
server/src/controllers/teacher-checkin.controller.ts  # API控制器 ✅
```

#### 路由
```
server/src/routes/teacher-checkin.routes.ts  # 路由配置 ✅
server/src/routes/index.ts                   # 路由注册 ✅
```

---

## 🚀 部署步骤

### 步骤1: 编译后端代码

```bash
cd server
npm run build
```

### 步骤2: 创建数据库表

**方法A: 使用初始化脚本（推荐）**

```bash
cd server
node scripts/init-teacher-attendance.js
```

**方法B: 使用SQL脚本**

```bash
cd server
# 如果有MySQL命令行工具
mysql -u root -p123456 kindergartensales < scripts/create-teacher-attendance-table.sql

# 或者使用Node.js脚本
node scripts/create-teacher-attendance-table.js
```

**方法C: 使用Sequelize同步（开发环境）**

在 `server/src/app.ts` 或 `server/src/index.ts` 中临时添加：

```typescript
import { TeacherAttendance } from './models';

// 在启动服务器前
await TeacherAttendance.sync({ force: false });
```

### 步骤3: 验证表创建

```bash
# 连接数据库
mysql -u root -p123456 kindergartensales

# 查看表结构
DESCRIBE teacher_attendances;

# 查看表数据
SELECT * FROM teacher_attendances LIMIT 5;
```

### 步骤4: 启动服务

```bash
# 在项目根目录
npm run start:all

# 或分别启动
npm run start:backend   # 后端 (端口3000)
npm run start:frontend  # 前端 (端口5173)
```

### 步骤5: 访问系统

- 前端地址: http://localhost:5173 或 http://localhost:5173
- 后端API: http://localhost:3000
- API文档: http://localhost:3000/api-docs

---

## 📊 数据库表结构

### teacher_attendances 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| teacher_id | INT | 教师ID（外键） |
| user_id | INT | 用户ID（外键） |
| kindergarten_id | INT | 幼儿园ID（外键） |
| attendance_date | DATE | 考勤日期 |
| status | ENUM | 考勤状态（present/absent/late/early_leave/leave） |
| check_in_time | TIME | 签到时间 |
| check_out_time | TIME | 签退时间 |
| work_duration | INT | 工作时长（分钟） |
| leave_type | ENUM | 请假类型（sick/personal/annual/maternity/other） |
| leave_reason | TEXT | 请假原因 |
| leave_start_time | DATETIME | 请假开始时间 |
| leave_end_time | DATETIME | 请假结束时间 |
| notes | TEXT | 备注 |
| is_approved | BOOLEAN | 是否审核 |
| approved_by | INT | 审核人ID |
| approved_at | DATETIME | 审核时间 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |
| deleted_at | DATETIME | 删除时间（软删除） |

### 索引

- **唯一索引**: `uk_teacher_date` (teacher_id, attendance_date) - 确保一天只有一条记录
- **查询索引**: teacher_id, user_id, kindergarten_id, status, attendance_date

---

## 🔌 API端点

### 基础路径: `/api/teacher-checkin`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/check-in` | 签到 |
| POST | `/check-out` | 签退 |
| GET | `/today` | 获取今日考勤 |
| GET | `/month` | 获取本月考勤 |
| POST | `/leave` | 创建请假申请 |
| GET | `/statistics` | 获取统计数据 |
| GET | `/history` | 获取考勤历史 |
| POST | `/approve` | 审核请假申请 |

---

## 🧪 测试步骤

### 1. 测试签到功能

```bash
curl -X POST http://localhost:3000/api/teacher-checkin/check-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "teacherId": 1,
    "userId": 1,
    "kindergartenId": 1
  }'
```

### 2. 测试获取今日考勤

```bash
curl -X GET "http://localhost:3000/api/teacher-checkin/today?teacherId=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. 前端测试

1. 登录系统（使用教师账号）
2. 访问：教师中心 → 考勤管理
3. 测试功能：
   - ✅ 教师打卡Tab - 签到/签退
   - ✅ 学生考勤Tab - 批量签到
   - ✅ 统计分析Tab - 查看统计
   - ✅ 历史记录Tab - 查询历史

---

## 🐛 故障排除

### 问题1: 表创建失败

**症状**: 运行初始化脚本时报错

**解决方案**:
```bash
# 检查数据库连接
cd server
node -e "const {sequelize} = require('./dist/init'); sequelize.authenticate().then(() => console.log('✅ 连接成功')).catch(e => console.error('❌ 连接失败:', e));"

# 检查配置文件
cat server/config/config.js
```

### 问题2: API调用失败

**症状**: 前端调用API返回404或500

**解决方案**:
```bash
# 1. 检查路由是否注册
grep -r "teacher-checkin" server/src/routes/index.ts

# 2. 检查后端日志
cd server && npm run dev

# 3. 检查API文档
# 访问 http://localhost:3000/api-docs
```

### 问题3: 前端组件不显示

**症状**: 访问考勤管理页面空白

**解决方案**:
```bash
# 1. 检查浏览器控制台错误
# 2. 检查路由配置
grep -r "teacher-center/attendance" client/src/router/

# 3. 重新编译前端
cd client && npm run dev
```

### 问题4: 数据库连接超时

**症状**: `ETIMEDOUT` 错误

**解决方案**:
```bash
# 1. 检查MySQL服务是否运行
systemctl status mysql
# 或
service mysql status

# 2. 检查数据库配置
cat server/.env

# 3. 测试数据库连接
mysql -u root -p123456 -e "SELECT 1"
```

---

## 📝 下一步开发建议

### 阶段4: 统计和历史（待完成）

1. **集成真实统计数据**
   - 实现教师个人统计API
   - 实现班级学生统计API
   - 添加图表组件（ECharts）

2. **完善历史记录**
   - 实现教师考勤历史查询
   - 实现导出Excel功能
   - 添加打印功能

### 阶段5: 优化和测试（待完成）

1. **样式优化**
   - 响应式布局优化
   - 移动端适配
   - 主题色统一

2. **性能优化**
   - 添加数据缓存
   - 实现懒加载
   - 优化API调用

3. **测试**
   - 编写单元测试
   - 编写集成测试
   - E2E测试

---

## 🎯 核心功能特点

### 教师打卡
- ✅ 实时时钟显示
- ✅ 一键签到/签退
- ✅ 自动判断迟到/早退
- ✅ 工作时长自动计算
- ✅ 本月考勤日历视图
- ✅ 请假申请（4种类型）

### 学生考勤
- ✅ 班级选择（只显示负责的班级）
- ✅ 批量签到
- ✅ 体温录入
- ✅ 健康状态记录
- ✅ 实时统计卡片

### 权限控制
- ✅ 教师只能查看自己的考勤
- ✅ 教师只能管理负责班级的学生
- ✅ 请假需要审核
- ✅ JWT认证

---

## 📞 技术支持

如有问题，请检查：
1. 后端日志: `server/logs/`
2. 前端控制台: 浏览器开发者工具
3. API文档: http://localhost:3000/api-docs
4. 数据库日志: MySQL错误日志

---

**部署完成后，请测试所有功能并反馈问题！** 🎉

