# AI接口CRUD测试脚本使用说明

## 📋 概述

提供了两个版本的AI接口CRUD测试脚本，用于全面测试后端AI接口的增删改查功能。

## 📦 脚本文件

1. **test-ai-crud.sh** - Bash Shell版本
2. **test-ai-crud.cjs** - Node.js版本（推荐）

## 🚀 快速开始

### 方法1: 使用Bash脚本

```bash
# 确保后端服务已启动
cd server && npm run dev

# 在另一个终端运行测试
./test-ai-crud.sh
```

### 方法2: 使用Node.js脚本（推荐）

```bash
# 确保后端服务已启动
cd server && npm run dev

# 在另一个终端运行测试
node test-ai-crud.cjs
```

## ✨ 功能特性

### 完整的CRUD测试流程

1. **快捷登录** - 使用admin账户快速获取Token
2. **创建会话** (CREATE) - 创建AI对话会话
3. **发送消息** (CREATE) - 发送多条测试消息
4. **查询列表** (READ) - 获取所有会话列表
5. **查询详情** (READ) - 获取单个会话详情
6. **查询消息** (READ) - 获取会话的所有消息
7. **更新会话** (UPDATE) - 修改会话标题
8. **删除会话** (DELETE) - 删除指定会话
9. **验证删除** (VERIFY) - 确认会话已删除

### AI功能测试

- ✅ 简单查询：查询班级信息
- ✅ 复杂查询：统计数据（使用any_query工具）
- ✅ API搜索：搜索可用API接口（使用api_search工具）
- ✅ 工具调用：测试AI自动选择和调用工具

## 📊 测试覆盖

| 测试类型 | 接口端点 | 功能说明 |
|---------|---------|---------|
| 登录 | POST /api/auth/login | 快捷登录获取Token |
| 创建会话 | POST /api/ai/conversations | 创建新会话 |
| AI对话 | POST /api/ai/unified/stream-chat | 发送消息并获取AI响应 |
| 会话列表 | GET /api/ai/conversations | 获取所有会话 |
| 会话详情 | GET /api/ai/conversations/:id | 获取单个会话 |
| 会话消息 | GET /api/ai/conversations/:id/messages | 获取会话消息 |
| 更新会话 | PUT /api/ai/conversations/:id | 更新会话标题 |
| 删除会话 | DELETE /api/ai/conversations/:id | 删除会话 |

## 🔧 配置说明

### 默认配置

```javascript
const CONFIG = {
  baseURL: 'http://localhost:3000',  // 后端服务地址
  apiPrefix: '/api',                  // API前缀
  username: 'admin',                  // 登录用户名
  password: 'admin123',               // 登录密码
  timeout: 30000                      // 请求超时时间
};
```

### 修改配置

如果你的后端服务运行在不同端口，修改脚本开头的配置：

**Bash版本 (test-ai-crud.sh):**
```bash
BASE_URL="http://localhost:3000"
API_PREFIX="/api"
```

**Node.js版本 (test-ai-crud.cjs):**
```javascript
const CONFIG = {
  baseURL: 'http://localhost:3000',
  apiPrefix: '/api',
  // ... 其他配置
};
```

## 📝 输出示例

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 AI接口CRUD完整测试（Node.js版本）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ️  基础URL: http://localhost:3000
ℹ️  API前缀: /api

▶ 检查后端服务...
✅ 后端服务正常运行

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤 1: 快捷登录获取 Token
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▶ 使用 admin 账户登录...
✅ 登录成功！
ℹ️  Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOj...
ℹ️  用户: 系统管理员 (admin)

...（继续执行其他步骤）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 测试完成总结
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 所有CRUD操作测试通过！

测试覆盖：
  ✓ CREATE - 创建会话、发送消息
  ✓ READ   - 查询会话列表、详情、消息
  ✓ UPDATE - 更新会话标题
  ✓ DELETE - 删除会话并验证
  ✓ TOOLS  - API搜索、数据查询、复杂查询
```

## 🎯 手动测试示例

测试完成后会输出Token，可以用于手动测试：

```bash
# 导出Token
export AI_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 手动创建会话
curl -X POST http://localhost:3000/api/ai/conversations \
  -H "Authorization: Bearer $AI_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "手动测试会话", "modelId": 1}'

# 手动发送消息
curl -X POST http://localhost:3000/api/ai/unified/stream-chat \
  -H "Authorization: Bearer $AI_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "查询所有学生信息",
    "conversationId": "1",
    "mode": "auto"
  }'

# 查询会话列表
curl -X GET http://localhost:3000/api/ai/conversations \
  -H "Authorization: Bearer $AI_TOKEN"
```

## ⚠️ 注意事项

1. **后端服务必须启动** - 测试前确保后端服务运行在 http://localhost:3000
2. **数据库已初始化** - 确保数据库中有admin用户（username: admin, password: admin123）
3. **权限问题** - 如果Bash脚本无法执行，运行 `chmod +x test-ai-crud.sh`
4. **Node.js版本** - 推荐使用Node.js 18+

## 🔍 故障排查

### 问题1: 连接被拒绝

```
❌ 后端服务未启动！
```

**解决方案:**
```bash
cd server && npm run dev
```

### 问题2: 登录失败

```
❌ 登录失败，无法获取Token
```

**解决方案:**
- 检查数据库中是否有admin用户
- 确认密码是否为 admin123
- 运行数据库初始化脚本

### 问题3: 权限不足

```
bash: ./test-ai-crud.sh: Permission denied
```

**解决方案:**
```bash
chmod +x test-ai-crud.sh
```

## 📚 相关文档

- [AI助手API文档](./docs/ai架构中心/)
- [快捷登录配置](./client/docs/quick-login-real-api-migration.md)
- [AI工具调用规则](./server/src/services/ai-operator/prompts/tools/tool-calling-rules.template.ts)

## 🎉 总结

这两个脚本提供了完整的AI接口CRUD测试覆盖，可以帮助你：

- ✅ 快速验证AI接口功能是否正常
- ✅ 测试完整的CRUD操作流程
- ✅ 验证AI工具调用功能
- ✅ 获取测试Token用于手动调试
- ✅ 自动化回归测试

推荐使用 **Node.js版本**，因为它提供了更好的错误处理和输出格式。
