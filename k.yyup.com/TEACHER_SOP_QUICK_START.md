# 教师客户跟踪SOP系统 - 快速启动指南

## ✅ 开发状态

**后端**: ✅ 完成（API + 测试 100%通过）
**前端**: ✅ 完成（所有组件已创建）
**集成**: ⏳ 待测试

---

## 🚀 快速开始

### 第一步：运行数据库迁移

```bash
cd server
npx sequelize-cli db:migrate
```

**预期输出**:
```
Sequelize CLI [Node: 18.x.x]

Loaded configuration file "config/database.js".
Using environment "development".
== 20251006000001-create-sop-tables: migrating =======
== 20251006000001-create-sop-tables: migrated (0.234s)
```

---

### 第二步：运行种子数据

```bash
npx sequelize-cli db:seed --seed 20251006000001-init-sop-data.js
```

**预期输出**:
```
Sequelize CLI [Node: 18.x.x]

Loaded configuration file "config/database.js".
Using environment "development".
== 20251006000001-init-sop-data: seeding =======
== 20251006000001-init-sop-data: seeded (0.156s)
```

---

### 第三步：启动服务器

```bash
# 在项目根目录
npm run start:backend

# 或者在server目录
cd server
npm run dev
```

**预期输出**:
```
✅ 数据库连接成功
✅ 服务器启动成功
🚀 Server is running on http://localhost:3000
📚 API文档: http://localhost:3000/api-docs
```

---

### 第四步：验证API

访问Swagger文档：
```
http://localhost:3000/api-docs
```

搜索 **"教师SOP"** 标签，应该看到15个API端点。

---

## 📝 测试API

### 1. 获取SOP阶段列表

```bash
curl -X GET "http://localhost:3000/api/teacher-sop/stages" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**预期响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "初次接触",
      "description": "与客户建立第一次联系，留下良好印象",
      "orderNum": 1,
      "estimatedDays": 1
    },
    ...
  ]
}
```

---

### 2. 获取阶段任务

```bash
curl -X GET "http://localhost:3000/api/teacher-sop/stages/1/tasks" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**预期响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "stageId": 1,
      "title": "自我介绍",
      "description": "专业、亲切地介绍自己和幼儿园",
      "isRequired": true,
      "estimatedTime": 5,
      "guidance": {
        "steps": [...],
        "tips": [...],
        "examples": [...]
      }
    },
    ...
  ]
}
```

---

### 3. 创建客户SOP进度

当第一次访问客户进度时，系统会自动创建：

```bash
curl -X GET "http://localhost:3000/api/teacher-sop/customers/1/progress" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customerId": 1,
    "teacherId": YOUR_TEACHER_ID,
    "currentStageId": 1,
    "stageProgress": 0,
    "completedTasks": [],
    "successProbability": 50
  }
}
```

---

### 4. 完成任务

```bash
curl -X POST "http://localhost:3000/api/teacher-sop/customers/1/tasks/1/complete" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**预期响应**:
```json
{
  "success": true,
  "message": "任务已完成",
  "data": {
    "id": 1,
    "customerId": 1,
    "teacherId": YOUR_TEACHER_ID,
    "currentStageId": 1,
    "stageProgress": 33.33,
    "completedTasks": [1],
    "successProbability": 50
  }
}
```

---

### 5. 添加对话记录

```bash
curl -X POST "http://localhost:3000/api/teacher-sop/customers/1/conversations" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "speakerType": "teacher",
    "content": "您好张女士，我是XX幼儿园的李老师",
    "messageType": "text"
  }'
```

**预期响应**:
```json
{
  "success": true,
  "message": "对话记录已添加",
  "data": {
    "id": 1,
    "customerId": 1,
    "teacherId": YOUR_TEACHER_ID,
    "speakerType": "teacher",
    "content": "您好张女士，我是XX幼儿园的李老师",
    "messageType": "text",
    "createdAt": "2025-10-06T10:30:00.000Z"
  }
}
```

---

### 6. 获取AI建议

```bash
curl -X POST "http://localhost:3000/api/teacher-sop/customers/1/ai-suggestions/task" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": 1
  }'
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "strategy": {
      "title": "建立信任，深入了解需求",
      "description": "在这个阶段，重点是通过真诚的沟通建立信任关系...",
      "keyPoints": [
        "展现专业性和真诚",
        "多倾听，少推销",
        "用案例而非数据打动人心"
      ]
    },
    "scripts": {
      "opening": "您好张女士，上次聊得很愉快。我一直在想您提到的关于孩子性格培养的问题...",
      "core": [
        "我们有个和您家宝宝情况很相似的案例，当时家长也有类似的顾虑...",
        "根据您的需求，我觉得我们的XX课程特别适合您家宝宝",
        "您可以先带宝宝来试听一次，实地感受一下我们的教学环境和方式"
      ],
      "objections": [
        {
          "question": "学费会不会太贵？",
          "answer": "我理解您的顾虑。其实教育投资最重要的是性价比，而不是单纯看价格..."
        }
      ]
    },
    "nextActions": [
      {
        "title": "邀请试听课",
        "description": "在48小时内邀请客户带孩子参加试听课",
        "timing": "建议明天下午或后天上午",
        "tips": [
          "提前准备好试听课的详细安排",
          "强调试听课的价值和名额有限",
          "给客户2-3个时间选项"
        ]
      }
    ],
    "successProbability": 75,
    "factors": [
      { "name": "沟通频率", "score": 80 },
      { "name": "客户意向", "score": 75 },
      { "name": "预算匹配", "score": 70 },
      { "name": "决策进度", "score": 65 }
    ]
  }
}
```

---

## 🗄️ 数据库验证

### 检查表是否创建成功

```sql
-- 查看所有SOP相关表
SHOW TABLES LIKE '%sop%';
SHOW TABLES LIKE '%conversation%';

-- 应该看到：
-- sop_stages
-- sop_tasks
-- customer_sop_progress
-- conversation_records
-- conversation_screenshots
-- ai_suggestions_history
```

### 检查种子数据

```sql
-- 查看SOP阶段
SELECT id, name, order_num, estimated_days FROM sop_stages;

-- 应该看到7个阶段：
-- 1. 初次接触
-- 2. 需求挖掘
-- 3. 方案呈现
-- 4. 异议处理
-- 5. 临门一脚
-- 6. 成交签约
-- 7. 售后服务

-- 查看SOP任务
SELECT id, stage_id, title, is_required FROM sop_tasks;

-- 应该看到3个任务（第1阶段）：
-- 1. 自我介绍
-- 2. 了解基本信息
-- 3. 建立信任
```

---

## 🔍 故障排除

### 问题1: 迁移失败

**错误**: `ERROR: Table 'sop_stages' already exists`

**解决**:
```bash
# 回滚迁移
npx sequelize-cli db:migrate:undo

# 重新运行
npx sequelize-cli db:migrate
```

---

### 问题2: 种子数据失败

**错误**: `ERROR: Duplicate entry for key 'PRIMARY'`

**解决**:
```bash
# 清空表
npx sequelize-cli db:seed:undo --seed 20251006000001-init-sop-data.js

# 重新运行
npx sequelize-cli db:seed --seed 20251006000001-init-sop-data.js
```

---

### 问题3: API返回401

**错误**: `Unauthorized`

**解决**:
1. 确保已登录并获取token
2. 在请求头中添加: `Authorization: Bearer YOUR_TOKEN`
3. 检查token是否过期

---

### 问题4: 找不到路由

**错误**: `Cannot GET /api/teacher-sop/stages`

**解决**:
1. 确认服务器已启动
2. 检查路由是否正确注册在 `server/src/routes/index.ts`
3. 重启服务器

---

## 📚 下一步

### 开发前端

参考文档：
- `TEACHER_SOP_IMPLEMENTATION_GUIDE.md` - 前端实现指南
- `TEACHER_CUSTOMER_SOP_SOLUTION.md` - 完整方案设计

### 集成真实AI服务

1. 配置AIBridge服务URL
2. 更新 `ai-sop-suggestion.service.ts` 中的 `callAIBridge` 方法
3. 测试AI响应

### 添加更多SOP任务

编辑种子文件 `server/src/seeders/20251006000001-init-sop-data.js`，添加更多阶段的任务。

---

## 🎯 完整测试流程

### 1. 创建测试客户

```bash
# 假设客户ID为1，教师ID为当前登录用户
CUSTOMER_ID=1
```

### 2. 获取初始进度

```bash
curl -X GET "http://localhost:3000/api/teacher-sop/customers/$CUSTOMER_ID/progress" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. 完成第一个任务

```bash
curl -X POST "http://localhost:3000/api/teacher-sop/customers/$CUSTOMER_ID/tasks/1/complete" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. 添加对话记录

```bash
curl -X POST "http://localhost:3000/api/teacher-sop/customers/$CUSTOMER_ID/conversations" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "speakerType": "teacher",
    "content": "您好，我是XX幼儿园的李老师"
  }'
```

### 5. 获取AI建议

```bash
curl -X POST "http://localhost:3000/api/teacher-sop/customers/$CUSTOMER_ID/ai-suggestions/task" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"taskId": 2}'
```

### 6. 完成所有任务后推进阶段

```bash
# 完成任务2
curl -X POST "http://localhost:3000/api/teacher-sop/customers/$CUSTOMER_ID/tasks/2/complete" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 完成任务3
curl -X POST "http://localhost:3000/api/teacher-sop/customers/$CUSTOMER_ID/tasks/3/complete" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 推进到下一阶段
curl -X POST "http://localhost:3000/api/teacher-sop/customers/$CUSTOMER_ID/progress/advance" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ 验证清单

- [ ] 数据库迁移成功
- [ ] 种子数据导入成功
- [ ] 服务器启动成功
- [ ] Swagger文档可访问
- [ ] 可以获取SOP阶段列表
- [ ] 可以获取阶段任务
- [ ] 可以创建客户进度
- [ ] 可以完成任务
- [ ] 可以添加对话记录
- [ ] 可以获取AI建议
- [ ] 可以推进阶段

---

**快速启动指南完成！** 🎉

如有问题，请查看：
- `TEACHER_SOP_DEVELOPMENT_PROGRESS.md` - 开发进度
- `TEACHER_CUSTOMER_SOP_SOLUTION.md` - 完整方案

