# Dashboard 真实数据加载修复指南

## 🎯 问题概述

**问题**: http://localhost:5173/teacher-center/dashboard 登录后没有获取真实数据

**原因**: 数据库中可能没有真实数据，或者数据查询出现问题

**解决方案**: 初始化数据 + 验证API + 检查前端

---

## 📋 完整修复流程

### 步骤1: 初始化数据库 (必须)

```bash
# 进入项目根目录
cd /home/zhgue/kyyupgame/k.yyup.com

# 完整初始化数据库和测试数据
npm run seed-data:complete

# 或者分步初始化
npm run seed-data:basic        # 基础数据
npm run seed-data:teacher      # 教师数据
npm run seed-data:student      # 学生数据
npm run seed-data:activity     # 活动数据
```

**预期输出**:
```
✅ 数据库初始化成功
✅ 教师数据已创建
✅ 学生数据已创建
✅ 班级数据已创建
✅ 任务数据已创建
```

---

### 步骤2: 验证后端API

#### 2.1 启动后端服务
```bash
npm run start:backend
# 或
cd server && npm run dev
```

**预期输出**:
```
✅ 服务器运行在 http://localhost:3000
✅ 数据库连接成功
✅ 路由已注册
```

#### 2.2 测试API端点

```bash
# 1. 登录获取token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "password": "password123"
  }'

# 响应示例:
# {
#   "success": true,
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIs...",
#     "user": { "id": 1, "email": "teacher@example.com", "role": "teacher" }
#   }
# }

# 2. 使用token调用dashboard API
curl -X GET http://localhost:3000/api/teacher-dashboard/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 响应应该包含真实数据:
# {
#   "success": true,
#   "data": {
#     "stats": { ... },
#     "todayTasks": [ ... ],
#     "todayCourses": [ ... ],
#     "recentNotifications": [ ... ]
#   }
# }
```

---

### 步骤3: 验证前端

#### 3.1 启动前端服务
```bash
npm run start:frontend
# 或
cd client && npm run dev
```

**预期输出**:
```
✅ 前端服务运行在 http://localhost:5173
✅ 自动打开浏览器
```

#### 3.2 检查浏览器控制台

1. 打开浏览器开发者工具 (F12)
2. 进入 Console 标签
3. 查看是否有错误信息
4. 进入 Network 标签
5. 查看 `/api/teacher-dashboard/dashboard` 请求
6. 检查响应数据

**预期结果**:
- ✅ 没有错误信息
- ✅ API请求返回 200 状态码
- ✅ 响应数据包含真实数据
- ✅ Dashboard显示真实数据

---

### 步骤4: 登录并验证

1. 访问 http://localhost:5173
2. 使用测试账号登录:
   - 邮箱: `teacher@example.com`
   - 密码: `password123`
3. 导航到 `/teacher-center/dashboard`
4. 检查是否显示真实数据

**预期显示**:
- ✅ 任务统计卡片显示真实数据
- ✅ 班级统计卡片显示真实数据
- ✅ 活动统计卡片显示真实数据
- ✅ 通知统计卡片显示真实数据
- ✅ 今日任务列表显示真实任务
- ✅ 今日课程列表显示真实课程
- ✅ 最新通知列表显示真实通知

---

## 🔧 常见问题排查

### 问题1: 数据库连接失败

**症状**: 
```
❌ 数据库连接失败
❌ ECONNREFUSED
```

**解决方案**:
```bash
# 检查MySQL是否运行
mysql -u root -p

# 检查数据库配置
cat server/.env | grep DB_

# 重新启动MySQL
# Linux/Mac:
sudo systemctl restart mysql

# 或使用Docker:
docker-compose up -d mysql
```

### 问题2: 教师数据不存在

**症状**:
```
❌ 教师信息不存在
❌ 404 Not Found
```

**解决方案**:
```bash
# 重新初始化数据
npm run seed-data:complete

# 验证数据
mysql -u root -p -e "SELECT * FROM teachers LIMIT 5;"
```

### 问题3: 认证失败

**症状**:
```
❌ 用户未认证
❌ 401 Unauthorized
```

**解决方案**:
```bash
# 1. 检查token是否有效
# 2. 检查Authorization header格式
# 3. 重新登录获取新token
```

### 问题4: API返回空数据

**症状**:
```
{
  "success": true,
  "data": {
    "stats": { "tasks": { "total": 0, ... }, ... },
    "todayTasks": [],
    "todayCourses": [],
    "recentNotifications": []
  }
}
```

**解决方案**:
```bash
# 检查数据库中是否有数据
mysql -u root -p -e "
  SELECT COUNT(*) as task_count FROM todos;
  SELECT COUNT(*) as class_count FROM classes;
  SELECT COUNT(*) as student_count FROM students;
  SELECT COUNT(*) as notification_count FROM notifications;
"

# 如果都是0，重新初始化数据
npm run seed-data:complete
```

---

## 📊 验证清单

### 后端验证
- [ ] MySQL服务运行正常
- [ ] 数据库已初始化
- [ ] 教师数据存在 (SELECT COUNT(*) FROM teachers;)
- [ ] 班级数据存在 (SELECT COUNT(*) FROM classes;)
- [ ] 任务数据存在 (SELECT COUNT(*) FROM todos;)
- [ ] 通知数据存在 (SELECT COUNT(*) FROM notifications;)
- [ ] 后端服务运行在 http://localhost:3000
- [ ] API端点可访问
- [ ] 认证正常工作

### 前端验证
- [ ] 前端服务运行在 http://localhost:5173
- [ ] 可以成功登录
- [ ] 可以访问 /teacher-center/dashboard
- [ ] 浏览器控制台没有错误
- [ ] Network标签显示API请求成功
- [ ] Dashboard显示真实数据

---

## 🚀 一键修复脚本

```bash
#\!/bin/bash

echo "🔄 开始修复Dashboard数据加载问题..."

# 1. 初始化数据
echo "📊 初始化数据库..."
npm run seed-data:complete

# 2. 重启后端
echo "🔄 重启后端服务..."
npm run stop
npm run start:backend &

# 3. 等待后端启动
sleep 5

# 4. 重启前端
echo "🔄 重启前端服务..."
npm run start:frontend &

echo "✅ 修复完成！"
echo "📱 前端: http://localhost:5173"
echo "🔌 后端: http://localhost:3000"
echo "📊 Dashboard: http://localhost:5173/teacher-center/dashboard"
```

---

## 📞 获取帮助

如果问题仍未解决，请检查:

1. **后端日志**: `server/logs/`
2. **浏览器控制台**: F12 → Console
3. **Network请求**: F12 → Network
4. **数据库**: 直接查询数据库验证数据

---

**最后更新**: 2025-11-14  
**状态**: 就绪
