# AIBridge 简化方案 - 快速开始指南

## 🚀 快速启动

### 1. 编译后端
```bash
cd server
npm run build
```

### 2. 启动后端
```bash
NODE_ENV=production PORT=3000 node dist/index.js
```

### 3. 测试登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 📝 API 调用示例

### 获取 Token
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq '.data.token' -r)

echo "Token: $TOKEN"
```

### 调用 AI 课程生成 API
```bash
curl -X POST http://localhost:3000/api/ai/curriculum/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "doubao-seed-1-6-thinking-250615",
    "messages": [
      {
        "role": "system",
        "content": "你是一个专业的幼儿园课程设计师"
      },
      {
        "role": "user",
        "content": "创建一个关于数字认知的互动游戏，让幼儿通过游戏学习1-10的数字"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 4000,
    "top_p": 0.9
  }'
```

---

## 🔍 验证配置

### 检查数据库中的 AI 模型配置
```bash
# 连接到数据库
mysql -h dbconn.sealoshzh.site -P 43906 -u root -p kargerdensales

# 查询 AI 模型配置
SELECT id, name, provider, endpoint_url, status FROM ai_model_config WHERE status = 'active';

# 查询豆包模型配置
SELECT * FROM ai_model_config WHERE name LIKE '%doubao%' AND status = 'active';
```

---

## 📊 关键改进

| 方面 | 改进 |
|------|------|
| **安全性** | ✅ 移除所有硬编码密钥 |
| **可维护性** | ✅ 集中配置管理 |
| **代码质量** | ✅ 减少 55+ 行重复代码 |
| **易用性** | ✅ 调用者代码更简洁 |

---

## 🎯 核心特性

### 1. 自动配置读取
AIBridge 自动从数据库读取模型配置，无需调用者手动查询。

### 2. 向后兼容
仍支持传递 `customConfig` 参数进行自定义配置。

### 3. 集中管理
所有配置查询逻辑在 AIBridge 中，易于维护。

### 4. 错误处理
如果数据库中找不到模型配置，抛出明确的错误。

---

## 📋 调用方式对比

### 之前（复杂）
```typescript
const modelConfig = await AIModelConfig.findOne({
  where: { name: 'doubao-seed-1-6-thinking-250615', status: 'active' }
});

const response = await aiBridgeService.generateChatCompletion({
  model: modelConfig.name,
  messages: [...],
  temperature: 0.7,
  max_tokens: 2000
}, {
  endpointUrl: modelConfig.endpointUrl,
  apiKey: modelConfig.apiKey
});
```

### 之后（简洁）
```typescript
const response = await aiBridgeService.generateChatCompletion({
  model: 'doubao-seed-1-6-thinking-250615',
  messages: [...],
  temperature: 0.7,
  max_tokens: 2000
});
// AIBridge 自动从数据库读取配置
```

---

## 🔧 自定义配置（可选）

如果需要使用自定义配置：

```typescript
const response = await aiBridgeService.generateChatCompletion({
  model: 'doubao-seed-1-6-thinking-250615',
  messages: [...],
  temperature: 0.7,
  max_tokens: 2000
}, {
  endpointUrl: 'https://custom-endpoint.com/api/v3/chat/completions',
  apiKey: 'custom-api-key'
});
```

---

## 📚 文档

- **AIBRIDGE_SIMPLIFICATION_SUMMARY.md** - 详细实施总结
- **AIBRIDGE_BEFORE_AFTER.md** - 代码对比
- **IMPLEMENTATION_COMPLETE.md** - 完成报告
- **AIBRIDGE_TEST_REPORT.md** - 测试报告

---

## ✅ 检查清单

启动前检查：
- [ ] 后端代码已编译
- [ ] 数据库连接正常
- [ ] AI 模型配置已在数据库中
- [ ] 豆包 API 密钥有效

启动后检查：
- [ ] 后端服务已启动
- [ ] 登录 API 正常工作
- [ ] AI 课程生成 API 可调用
- [ ] 配置自动从数据库读取

---

## 🚨 常见问题

### Q: 后端启动很慢？
A: 后端初始化需要加载所有数据模型，首次启动可能需要 1-2 分钟。

### Q: 如何验证配置是否从数据库读取？
A: 查看后端日志，应该看到 `✅ [AIBridge] 从数据库读取模型配置` 的日志。

### Q: 如何使用自定义配置？
A: 在调用 `generateChatCompletion()` 时传递第二个参数 `customConfig`。

### Q: 如何添加新的 AI 模型？
A: 在 `ai_model_config` 表中添加新记录，AIBridge 会自动读取。

---

## 📞 支持

如有问题，请检查：
1. 后端日志是否有错误
2. 数据库连接是否正常
3. AI 模型配置是否存在
4. API 密钥是否有效

---

**最后更新**：2025-10-20
**状态**：✅ 就绪

