# 🌉 统一AI Bridge架构说明

## 📋 设计理念

**一个接口，处理所有AI调用** - 统一认证系统提供一个统一的AI Bridge接口，根据参数自动识别类型（文本、图片、视频、音频）。

---

## 🎯 统一接口

### 端点
```
POST /api/v1/ai/bridge
```

### 请求格式（根据参数自动识别类型）

#### 图片生成
```json
{
  "model": "doubao-seedream-4-5-251128",
  "prompt": "一只可爱的卡通小猫",
  "n": 1,
  "size": "1920x1920",
  "quality": "standard",
  "logo_info": { "add_logo": false }
}
```

#### 文本对话
```json
{
  "model": "doubao-seed-1-6-thinking-250615",
  "messages": [
    { "role": "user", "content": "你好" }
  ],
  "temperature": 0.7,
  "max_tokens": 2000
}
```

### 统一响应格式
```json
{
  "success": true,
  "data": {
    "type": "image",
    "model": "doubao-seedream-4-5-251128",
    "result": {
      "images": [
        { "url": "https://...", "revised_prompt": "..." }
      ]
    },
    "usage": { "total_tokens": 14400 },
    "responseTime": 5234
  }
}
```

---

## 📁 文件结构

### 统一认证系统

```
/persistent/home/zhgue/kyyupgame/adminyyup/admin.yyup.cc/server/src/
├── routes/
│   ├── unifiedAiBridge.ts    ✅ 统一AI Bridge（一个接口）
│   └── index.ts                ✅ 路由注册
└── ...
```

### 租户业务系统

```
/home/zhgue/kyyupgame/k.yyup.com/server/src/services/
├── unified-tenant-ai-client.service.ts  ✅ 统一AI客户端
│   ├── generate()                      统一调用方法
│   ├── imageGenerate()                 图片生成（兼容）
│   ├── chat()                          文本对话
│   └── processAudio()                  音频处理
└── curriculum/
    └── interactive-curriculum.service.ts  ✅ 使用统一客户端
```

---

## 🔄 调用流程

### 图片生成流程
```
互动课程服务
  ↓
unifiedTenantAIClient.imageGenerate()
  ↓
unifiedTenantAIClient.generate()
  ↓
POST /api/v1/ai/bridge
  ↓
统一认证系统
  ↓
根据 prompt 参数识别为 image 类型
  ↓
查询 admin_tenant_management 数据库
  ↓
调用豆包 API
  ↓
返回结果 + 统计用量
```

---

## ✅ 优势

### 1. 一个接口，所有类型
- ❌ 之前：`/chat`, `/image-generate`, `/audio-process` （分散）
- ✅ 现在：`POST /api/v1/ai/bridge` （统一）

### 2. 统一计费
- 所有AI调用都经过统一认证系统
- 便于统计每个租户的用量
- 便于实现计费逻辑

### 3. 简化集成
- 租户系统只需要调用一个接口
- 不需要关心具体的AI类型
- 统一的错误处理和日志

### 4. 易于扩展
- 添加新的AI类型（如视频生成）
- 只需在统一接口中添加识别逻辑
- 不需要新增端点

---

## 📊 数据库配置

### admin_tenant_management 统一认证数据库
```sql
SELECT id, name, display_name, provider, model_type, status
FROM ai_model_config
WHERE status = 'active';
```

**现有模型**:
- `doubao-seedream-4-5-251128` - 图片生成 ✅
- `doubao-seed-1-6-thinking-250615` - 文本对话 ✅
- `doubao-tts-bigmodel` - 语音合成 ✅
- `doubao-seedance-1-0-pro-250528` - 视频生成 ✅

---

## 🚀 使用示例

### 客户端调用
```typescript
// 图片生成
const result = await unifiedTenantAIClient.generate({
  model: 'doubao-seedream-4-5-251128',
  prompt: '一只可爱的卡通小猫',
  n: 1,
  size: '1920x1920',
  quality: 'standard',
  logo_info: { add_logo: false }
}, authToken);

// 文本对话
const result = await unifiedTenantAIClient.generate({
  model: 'doubao-seed-1-6-thinking-250615',
  messages: [
    { role: 'user', 'content': '你好' }
  ]
}, authToken);
```

### 兼容性
```typescript
// 旧的 imageGenerate 方法仍然可用
const result = await unifiedTenantAIClient.imageGenerate({
  model: 'doubao-seedream-4-5-251128',
  prompt: '一只可爱的卡通小猫'
}, authToken);
```

---

## 🎉 总结

### 修改内容
1. ✅ 创建了统一的AI Bridge接口 (`unifiedAiBridge.ts`)
2. ✅ 删除了旧的分散端点 (`aiBridge.ts`)
3. ✅ 更新了客户端调用统一接口
4. ✅ 保持了向后兼容性

### 核心优势
- 🌉 **一个接口，所有AI类型**
- 💰 **统一计费和用量统计**
- 🔧 **简化集成和维护**
- 📈 **易于扩展新类型**

---

**创建时间**: 2026-01-02
**版本**: v2.0 - 统一接口版本
