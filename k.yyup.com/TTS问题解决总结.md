# TTS返回0字节问题 - 完整解决方案

## 🎯 问题描述

TTS API调用时返回0字节音频数据，导致语音合成失败。

---

## ✅ 问题已完全解决

### 根本原因

**音色参数不匹配**：使用OpenAI音色名称（如 `nova`）调用火山引擎V3 WebSocket端点。

### 解决方案

使用火山引擎音色名称（如 `zh_female_cancan_mars_bigtts`）调用TTS API。

---

## 📋 完整调试过程

### 1. 初始问题
- **现象**: TTS API返回 `Content-Length: 0`
- **怀疑**: 调试日志没有打印，可能走了不同的路径

### 2. 第一次调试
创建测试脚本 `test-local-tts-api.cjs`：
```bash
node test-local-tts-api.cjs
```

**结果**:
- ✅ 日志成功打印
- ❌ HTTP响应状态: **404**
- ❌ Content-Length: 0

**结论**: 端点URL不正确

### 3. 检查数据库配置
运行 `check-tts-config.cjs`：

**发现问题**:
```
模型: doubao-tts-bigmodel
端点URL: https://ark.cn-beijing.volces.com/api/v3/audio/speech  ❌ 错误
```

### 4. 修复端点配置
运行 `fix-tts-config.cjs`：

**修改内容**:
```sql
UPDATE ai_model_config
SET endpoint_url = 'wss://openspeech.bytedance.com/api/v3/tts/bidirection'
WHERE name = 'doubao-tts-bigmodel'
```

### 5. 第二次测试
重启服务后再次测试：

**结果**:
- ✅ 识别为V3 WebSocket
- ✅ WebSocket连接成功
- ✅ 收到 CONNECTION_STARTED (50)
- ✅ 收到 SESSION_STARTED (150)
- ❌ 收到未知事件 (55000000)
- ❌ 超时（30秒）

**结论**: V3 WebSocket协议有问题

### 6. 参考媒体中心实现
查看 `client/src/pages/principal/media-center/TextToSpeech.vue`：

**关键发现**:
```typescript
// 媒体中心使用的默认音色
const formData = ref({
  voice: 'zh_female_cancan_mars_bigtts',  // 火山引擎音色
})
```

### 7. 使用正确的音色测试
创建 `test-media-center-tts.cjs`：

**测试参数**:
```javascript
{
  text: '欢迎来到我们的幼儿园，这里充满了欢声笑语。',
  voice: 'zh_female_cancan_mars_bigtts',  // 火山引擎音色
  speed: 1.0,
  format: 'mp3'
}
```

**结果**:
```
✅ TTS API调用成功
   HTTP状态: 200
   Content-Type: audio/mpeg
   Content-Length: 32487
   实际数据长度: 32487 bytes
```

**后端日志**:
```
📨 [TTS V3] 收到事件: 50   (CONNECTION_STARTED)
📨 [TTS V3] 收到事件: 150  (SESSION_STARTED)
📨 [TTS V3] 收到事件: 350  (TTS_SENTENCE_START)
📨 [TTS V3] 收到事件: 352  (TTS_RESPONSE - 音频数据)
🎵 [TTS V3] 收到音频数据: 2790 bytes, 总计: 1 块
... (共10块音频数据)
✅ [TTS V3 Bidirection] 合成成功: 32487 bytes
```

---

## 🎓 关键发现

### 音色参数对照表

| 提供商 | 音色类型 | 音色名称示例 | 适用端点 |
|--------|----------|--------------|----------|
| OpenAI | 英文音色 | `nova`, `alloy`, `echo`, `fable`, `onyx`, `shimmer` | OpenAI TTS API |
| 火山引擎 | 中文音色 | `zh_female_cancan_mars_bigtts`, `zh_female_yingyujiaoyu_mars_bigtts` | V3 WebSocket |

### 错误示例
```javascript
// ❌ 错误：使用OpenAI音色调用火山引擎端点
await request.post('/ai/text-to-speech', {
  text: '你好',
  voice: 'nova',  // OpenAI音色
  // 但数据库配置的是火山引擎V3 WebSocket端点
})
// 结果：收到未知事件 55000000，超时
```

### 正确示例
```javascript
// ✅ 正确：使用火山引擎音色调用火山引擎端点
await request.post('/ai/text-to-speech', {
  text: '你好',
  voice: 'zh_female_cancan_mars_bigtts',  // 火山引擎音色
})
// 结果：成功生成32KB音频数据
```

---

## 📝 最终解决方案

### 方案1: 使用火山引擎音色（推荐）

**适用场景**: 中文语音合成

**实现**:
```typescript
// 前端调用
const response = await request.post('/ai/text-to-speech', {
  text: '欢迎来到我们的幼儿园',
  voice: 'zh_female_cancan_mars_bigtts',  // 使用火山引擎音色
  speed: 1.0,
  format: 'mp3'
}, {
  responseType: 'blob'
})
```

**火山引擎常用音色**:
- `zh_female_cancan_mars_bigtts` - 灿灿（女声），温柔甜美
- `zh_female_yingyujiaoyu_mars_bigtts` - Tina老师，专业教育
- `zh_female_shaoergushi_mars_bigtts` - 少儿故事，温柔亲切
- `zh_male_tiancaitongsheng_mars_bigtts` - 天才童声，活泼可爱

### 方案2: 配置OpenAI TTS模型

**适用场景**: 需要使用OpenAI音色（如 `nova`）

**步骤**:
1. 在数据库中添加OpenAI TTS模型配置
2. 设置 `model_type = 'speech'`
3. 设置 `endpoint_url` 为OpenAI端点
4. 设置 `status = 'active'`

**注意**: 控制器会查询第一个 `active` 状态的 `speech` 模型，确保优先级正确。

---

## 🔧 相关文件

### 测试脚本
- `test-local-tts-api.cjs` - 测试本地TTS API
- `test-media-center-tts.cjs` - 使用媒体中心参数测试（成功）
- `check-tts-config.cjs` - 检查TTS配置
- `fix-tts-config.cjs` - 修复TTS端点配置
- `fix-tts-model-type.cjs` - 修复model_type配置

### 核心代码
- `server/src/controllers/text-to-speech.controller.ts` - TTS控制器
- `server/src/services/ai/bridge/ai-bridge.service.ts` - AI Bridge服务
- `server/src/services/volcengine/tts-v3-bidirection.service.ts` - V3双向流式服务
- `client/src/pages/principal/media-center/TextToSpeech.vue` - 媒体中心TTS页面

### 文档
- `docs/呼叫中心/TTS返回0字节问题解决方案.md` - 详细解决方案文档

---

## 📊 测试结果

### 成功测试
```bash
node test-media-center-tts.cjs
```

**输出**:
```
🎯 测试媒体中心TTS API
✅ 登录成功
✅ TTS API调用成功
   HTTP状态: 200
   Content-Type: audio/mpeg
   Content-Length: 32487
   实际数据长度: 32487 bytes
✅ 音频已保存: test-media-center-tts-output.mp3
   文件大小: 32487 bytes
🎉 测试成功！
```

### 播放音频
```bash
ffplay test-media-center-tts-output.mp3
```

---

## 🎉 总结

### 问题根源
1. ❌ 使用OpenAI音色名称调用火山引擎端点
2. ❌ 音色参数不匹配导致协议错误（事件55000000）

### 解决方案
1. ✅ 使用火山引擎音色名称
2. ✅ 参考媒体中心的正确实现
3. ✅ V3 WebSocket服务本身工作正常

### 经验教训
1. 🎓 不同TTS提供商的音色名称不兼容
2. 🎓 参考已有的正确实现非常重要
3. 🎓 详细的日志帮助快速定位问题
4. 🎓 测试时要使用正确的参数组合

---

**创建时间**: 2025-10-14  
**状态**: ✅ 问题已完全解决  
**下一步**: 完成TTS→ASR端到端测试

