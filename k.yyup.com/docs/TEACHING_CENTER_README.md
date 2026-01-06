# 教学中心快速参考

## 📚 完整文档

详细架构文档请查看: [TEACHING_CENTER_ARCHITECTURE.md](./TEACHING_CENTER_ARCHITECTURE.md)

---

## 🚀 快速开始

### 启动服务

```bash
# 后端服务
cd server
npm run dev

# 前端服务
cd client
npm run dev
```

### 访问页面

- 前端: http://localhost:5173/teaching-center
- API文档: http://localhost:3000/api-docs

---

## 🔧 核心API端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/teaching-center/course-progress` | GET | 课程进度统计 |
| `/api/teaching-center/outdoor-training` | GET | 户外训练统计 |
| `/api/teaching-center/external-display` | GET | 校外展示统计 |
| `/api/teaching-center/championship` | GET | 锦标赛统计 |

**查询参数**:
- `semester`: 学期 (如: "2024-2025-1")
- `academicYear`: 学年 (如: "2024-2025")
- `classId`: 班级ID (可选)

---

## 📊 数据模型

### 核心表

1. **brain_science_courses** - 脑科学课程
2. **course_plans** - 课程计划
3. **course_progress** - 课程进度
4. **outdoor_training_records** - 户外训练记录
5. **external_display_records** - 校外展示记录
6. **championship_records** - 锦标赛记录
7. **teaching_media_records** - 教学媒体记录

---

## 🐛 常见问题快速修复

### 问题1: API返回500错误 - "Unknown column"

```bash
# 1. 检查数据库字段
mysql -h dbconn.sealoshzh.site -P 43906 -u root -p'Yyup@2024' kargerdensales \
  -e "DESCRIBE outdoor_training_records;"

# 2. 清理并重新编译
cd server
rm -rf dist
npm run build
npm run dev
```

### 问题2: 前端显示硬编码数据

检查服务层是否返回硬编码数据:
```typescript
// server/src/services/teaching-center.service.ts
// ❌ 错误: return { completion_rate: 76 }
// ✅ 正确: const rate = calculateFromDB(); return { completion_rate: rate }
```

### 问题3: 数据库有数据但API返回空

```bash
# 验证查询条件
mysql -h dbconn.sealoshzh.site -P 43906 -u root -p'Yyup@2024' kargerdensales \
  -e "SELECT * FROM outdoor_training_records WHERE semester='2024-2025-1' LIMIT 5;"
```

---

## 📁 关键文件位置

### 后端

```
server/src/
├── models/
│   ├── outdoor-training-record.model.ts
│   ├── external-display-record.model.ts
│   └── championship-record.model.ts
├── services/
│   └── teaching-center.service.ts
├── controllers/
│   └── teaching-center.controller.ts
└── routes/
    └── teaching-center.routes.ts
```

### 前端

```
client/src/
├── pages/teaching-center/
│   └── index.vue
└── api/endpoints/
    └── teaching-center.ts
```

---

## 🔍 调试命令

### 查看后端日志

```bash
cd server
npm run dev 2>&1 | grep -E "(Error|错误|教学中心)"
```

### 测试API

```bash
# 获取token
TOKEN=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.data.token')

# 测试户外训练API
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/teaching-center/outdoor-training?semester=2024-2025-1&academicYear=2024-2025" | jq '.'
```

### 查看数据库数据

```bash
# 户外训练记录
mysql -h dbconn.sealoshzh.site -P 43906 -u root -p'Yyup@2024' kargerdensales \
  -e "SELECT COUNT(*) as total FROM outdoor_training_records WHERE semester='2024-2025-1';"

# 校外展示记录
mysql -h dbconn.sealoshzh.site -P 43906 -u root -p'Yyup@2024' kargerdensales \
  -e "SELECT COUNT(*) as total FROM external_display_records WHERE semester='2024-2025-1';"

# 锦标赛记录
mysql -h dbconn.sealoshzh.site -P 43906 -u root -p'Yyup@2024' kargerdensales \
  -e "SELECT * FROM championship_records WHERE semester='2024-2025-1';"
```

---

## 📝 版本历史

### v1.0.0 (2025-10-08)

**重大更新**: 移除所有硬编码数据,实现真实数据库集成

**修复内容**:
- ✅ 修复模型字段名不匹配问题
- ✅ 移除服务层硬编码数据
- ✅ 所有API端点返回真实数据

**测试结果**:
- ✅ 户外训练API: 成功
- ✅ 校外展示API: 成功
- ✅ 锦标赛API: 成功
- ✅ 课程进度API: 成功

---

## 📖 相关文档

- [完整架构文档](./TEACHING_CENTER_ARCHITECTURE.md) - 详细的技术文档
- [数据库架构](./DATABASE_ARCHITECTURE.md) - 数据库设计文档
- [API文档](./API_DOCUMENTATION.md) - API接口文档

---

## 💡 提示

1. **修改模型后必须重新编译**: `rm -rf dist && npm run build`
2. **查询条件要与数据库数据匹配**: 检查学期和学年格式
3. **使用MySQL直接查询验证数据**: 确保数据存在
4. **检查模型关联是否正确初始化**: 查看 `server/src/init.ts`

---

**最后更新**: 2025-10-08

