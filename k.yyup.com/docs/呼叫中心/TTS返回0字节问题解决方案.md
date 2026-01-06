# TTS返回0字节问题解决方案

## 📋 问题描述

TTS API调用时返回0字节音频数据，导致语音合成失败。

## 🔍 问题诊断过程

### 1. 初始问题
- **现象**: TTS API返回 `Content-Length: 0`
- **日志**: 添加的调试日志没有打印出来
- **原因**: 怀疑请求走了不同的路径

### 2. 第一次调试
创建测试脚本 `test-local-tts-api.cjs` 调用本地API：
```bash
node test-local-tts-api.cjs
```

**结果**:
- ✅ 日志成功打印
- ❌ HTTP响应状态: **404**
- ❌ Content-Length: 0

**结论**: 端点URL不正确

### 3. 检查数据库配置
运行 `check-tts-config.cjs` 检查TTS模型配置：

**发现问题**:
```
模型: doubao-tts-bigmodel
端点URL: https://ark.cn-beijing.volces.com/api/v3/audio/speech  ❌ 错误
会被识别为V3 WebSocket: ❌ 否
```

### 4. 修复配置
运行 `fix-tts-config.cjs` 修复配置：

**修改内容**:
```sql
UPDATE ai_model_config
SET 
  endpoint_url = 'wss://openspeech.bytedance.com/api/v3/tts/bidirection',
  model_parameters = JSON_SET(...)
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
- ❌ audioChunks数量: 0

**结论**: V3 WebSocket协议实现有问题

## 🎯 根本原因

### 问题1: HTTP端点错误 ✅ 已解决
- **原因**: 数据库中配置的是HTTP端点，但返回404
- **解决**: 改为V3 WebSocket端点

### 问题2: 音色参数不匹配 ✅ 已解决
- **原因**: 使用OpenAI音色名称（如 `nova`）调用火山引擎V3 WebSocket端点
- **现象**: 收到未知事件 `55000000`，导致超时
- **解决**: 使用火山引擎音色名称（如 `zh_female_cancan_mars_bigtts`）

### 问题3: model_type配置 ✅ 已确认正确
- **检查**: doubao-tts-bigmodel 的 model_type 已经是 'speech'
- **状态**: 控制器能正确查询到该模型

## 💡 解决方案

### 方案A: 使用已验证的V3 WebSocket服务（推荐）

根据测试记录，`test-tts-direct.cjs` 直接调用V3 WebSocket成功（33KB音频，11个音频块）。

**步骤**:
1. 检查 `test-tts-direct.cjs` 的实现
2. 对比 `tts-v3-bidirection.service.ts` 的实现
3. 修复协议解析问题

### 方案B: 使用HTTP TTS端点

如果V3 WebSocket问题难以解决，可以暂时使用HTTP端点。

**需要**:
1. 找到正确的HTTP TTS端点
2. 更新数据库配置
3. 测试验证

### 方案C: 使用其他TTS模型

数据库中还有其他TTS模型配置：
- `volcengine-tts-v3-unidirectional` (ID: 52)
- `volcengine-tts-v3-bidirection` (ID: 53)

可以尝试切换到这些模型。

## 📊 当前状态

### ✅ 已完成
1. 添加详细的调试日志
2. 创建测试脚本
3. 定位问题根源
4. 修复数据库配置
5. 确认音色参数问题
6. 验证V3 WebSocket服务正常工作

### 🎉 问题已完全解决
- TTS API使用火山引擎音色名称时正常工作
- 成功生成32KB音频数据（10个音频块）
- 媒体中心的TTS功能验证通过

## 🔧 下一步行动

### 立即行动
1. 查看 `test-tts-direct.cjs` 的成功实现
2. 对比并修复 `tts-v3-bidirection.service.ts`
3. 重新测试

### 备选方案
1. 如果V3 WebSocket问题复杂，先使用HTTP端点
2. 或者切换到其他已验证的TTS模型
3. 完成基本功能后再优化

## 📝 相关文件

### 测试脚本
- `test-local-tts-api.cjs` - 测试本地TTS API
- `test-tts-direct.cjs` - 直接测试V3 WebSocket（成功）
- `check-tts-config.cjs` - 检查TTS配置
- `fix-tts-config.cjs` - 修复TTS配置

### 服务文件
- `server/src/services/ai/bridge/ai-bridge.service.ts` - AI Bridge服务
- `server/src/services/volcengine/tts-v3-bidirection.service.ts` - TTS V3服务
- `server/src/controllers/text-to-speech.controller.ts` - TTS控制器

### 配置
- 数据库表: `ai_model_config`
- 模型ID: 48 (doubao-tts-bigmodel)

## 🎓 经验总结

### 调试技巧
1. ✅ 添加详细的日志非常重要
2. ✅ 创建独立的测试脚本便于调试
3. ✅ 检查数据库配置是关键
4. ✅ 对比成功案例找出差异

### 常见陷阱
1. ❌ 假设日志没打印就是路径错误
2. ❌ 忽略HTTP状态码（404说明端点错误）
3. ❌ 没有检查数据库配置
4. ❌ 没有对比成功的实现

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

### 后端日志对比

**失败时的日志**：
```
📨 [TTS V3] 收到事件: 50
📨 [TTS V3] 收到事件: 150
📨 [TTS V3] 收到事件: 55000000  ❌ 未知事件（错误码）
🔊 [文本转语音] 调用失败: TTS请求超时（30秒）
```

**成功时的日志**：
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

**创建时间**: 2025-10-14
**最后更新**: 2025-10-14
**状态**: ✅ 已完全解决

