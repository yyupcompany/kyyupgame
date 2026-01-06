# 呼叫中心系统 - 快速开始

## 📖 文档导航

### 核心文档
- [呼叫中心开发需求文档](./呼叫中心开发需求文档.md) - 完整的功能需求和技术规范

### 实现方案（推荐使用新方案）

#### ⭐ 新方案：豆包实时语音大模型（推荐）
- [豆包实时语音大模型集成方案](./豆包实时语音大模型集成方案.md) - **端到端语音对话，超低延迟**
- [豆包实时语音集成总结](./豆包实时语音集成总结.md) - 实现总结和性能对比

#### 传统方案：ASR + LLM + TTS（备选）
- [音频流处理架构](./音频流处理架构.md) - 音频流处理的详细架构说明
- [音频流处理实现总结](./音频流处理实现总结.md) - 当前实现状态和待办事项

## 🎯 方案选择

| 特性 | 豆包实时语音（推荐） | 传统方案 |
|------|---------------------|---------|
| 延迟 | ~500ms ⚡ | ~2000ms |
| 复杂度 | 低 ✅ | 高 |
| 代码量 | 150行 | 300行 |
| 打断支持 | 原生 ✅ | 需实现 |
| 语音自然度 | 高 ✅ | 中 |

**推荐使用豆包实时语音大模型方案！**

## 🚀 快速开始

### 1. 环境准备

确保已安装:
- Node.js >= 18.0
- MySQL >= 8.0
- npm >= 8.0

### 2. 数据库初始化

创建火山引擎配置表:

```bash
cd server
node scripts/create-volcengine-asr-table.js
```

### 3. 配置验证

检查数据库中的配置:

```sql
SELECT * FROM volcengine_asr_configs WHERE is_active = TRUE;
```

应该看到默认配置:
- AppID: 7563592522
- API Key: e1545f0e-1d6f-4e70-aab3-3c5fdbec0700

### 4. 运行测试

#### ⭐ 测试豆包实时语音（推荐）

```bash
cd server
npm run build
node tests/doubao-realtime-voice-test.js
```

#### 测试传统方案（备选）

```bash
# 测试ASR连接
node tests/volcengine-asr-test.js

# 测试音频流处理
node tests/call-audio-stream-test.js
```

## 💡 使用示例

### ⭐ 豆包实时语音方案（推荐）

```typescript
import { callCenterRealtimeService } from './services/call-center-realtime.service';

// 1. 开始通话
const callId = 'call_' + Date.now();
const systemPrompt = '你是一位专业的幼儿园招生顾问...';

await callCenterRealtimeService.startCall(callId, customerId, systemPrompt);

// 2. 处理音频（无需缓冲，直接发送）
sipServer.on('audio-data', async (callId, audioData) => {
  await callCenterRealtimeService.processAudio(callId, audioData);
});

// 3. 监听AI回复
callCenterRealtimeService.on('audio-response', (data) => {
  sipServer.sendAudio(data.callId, data.audioData);
  console.log(`AI: ${data.text}`);
});

// 4. 结束通话
await callCenterRealtimeService.endCall(callId);
```

### 传统方案（备选）

```typescript
import { callAudioStreamService } from './services/call-audio-stream.service';

// 创建会话
callAudioStreamService.createCallSession(callId, customerId, systemPrompt);

// 处理音频（需要缓冲）
sipServer.on('audio-data', async (callId, audioChunk) => {
  await callAudioStreamService.processAudioChunk(callId, audioChunk);
});

// 监听响应
callAudioStreamService.on('audio-response', (data) => {
  sipServer.sendAudio(data.callId, data.audioData);
});

// 结束会话
callAudioStreamService.endCallSession(callId);
```

## 🔧 配置说明

### 音频参数

| 参数 | 值 | 说明 |
|------|-----|------|
| 格式 | PCM | 原始音频格式 |
| 采样率 | 16000 Hz | 16kHz |
| 位深度 | 16 bit | 2 bytes per sample |
| 声道 | 1 (Mono) | 单声道 |
| 缓冲时长 | 1秒 | 32000 bytes |

### 系统提示词

可以为每个通话会话自定义系统提示词:

```typescript
const systemPrompt = `
你是一位专业的幼儿园招生顾问，负责通过电话与家长沟通。

你的任务是：
1. 礼貌、热情地与家长交流
2. 了解家长的需求和孩子的情况
3. 介绍幼儿园的特色和优势
4. 回答家长的疑问
5. 引导家长预约参观或报名

注意事项：
- 保持专业和友好的语气
- 回答要简洁明了，每次回复控制在50字以内
- 不要做绝对化承诺
- 尊重家长的选择
- 如果家长表示不感兴趣，礼貌结束通话
`;
```

## 📊 监控和调试

### 查看活跃会话

```typescript
const activeCount = callAudioStreamService.getActiveSessionCount();
console.log(`当前活跃会话数: ${activeCount}`);
```

### 获取会话信息

```typescript
const sessionInfo = callAudioStreamService.getSessionInfo(callId);
if (sessionInfo) {
  console.log('会话信息:', {
    callId: sessionInfo.callId,
    customerId: sessionInfo.customerId,
    conversationLength: sessionInfo.conversationHistory.length,
    bufferSize: sessionInfo.audioBuffer.length
  });
}
```

### 查看对话历史

```typescript
const sessionInfo = callAudioStreamService.getSessionInfo(callId);
if (sessionInfo) {
  sessionInfo.conversationHistory.forEach((msg, index) => {
    console.log(`${index + 1}. ${msg.role}: ${msg.content}`);
  });
}
```

## 🔍 故障排查

### ASR连接失败

**问题**: WebSocket连接失败，返回400或401错误

**解决方案**:
1. 检查数据库中的配置是否正确
2. 验证AppID和API Key是否有效
3. 检查网络连接
4. 查看服务器日志

```bash
# 检查配置
mysql -h dbconn.sealoshzh.site -P 43906 -u root -p'Yyup@2024' kyyup -e "SELECT * FROM volcengine_asr_configs WHERE is_active = TRUE;"
```

### 音频缓冲不工作

**问题**: 音频数据没有被发送到ASR

**解决方案**:
1. 检查音频格式是否正确 (PCM 16kHz 16bit)
2. 验证缓冲区大小配置
3. 查看processAudioChunk是否被正确调用

```typescript
// 添加调试日志
console.log('音频块大小:', audioChunk.length);
console.log('当前缓冲区大小:', session.audioBuffer.reduce((sum, buf) => sum + buf.length, 0));
```

### 对话历史未保存

**问题**: 通话结束后对话记录没有保存到数据库

**解决方案**:
1. 检查call_records表是否存在
2. 验证callId是否正确
3. 查看数据库连接是否正常

```sql
-- 检查通话记录
SELECT call_id, transcription, ai_responses 
FROM call_records 
WHERE call_id = 'your_call_id';
```

## 📈 性能优化建议

### 1. 减少延迟

- 使用更小的缓冲区 (500ms)
- 优化网络连接
- 使用CDN加速

### 2. 提高并发

- 增加服务器资源
- 使用连接池
- 实现负载均衡

### 3. 优化内存

- 及时清理已处理的缓冲区
- 限制对话历史长度
- 使用流式处理

## 🔐 安全建议

1. **API密钥保护**
   - 不要在代码中硬编码密钥
   - 使用环境变量或数据库存储
   - 定期轮换密钥

2. **数据加密**
   - 使用HTTPS/WSS传输
   - 加密存储敏感数据
   - 实施访问控制

3. **审计日志**
   - 记录所有通话
   - 监控异常行为
   - 定期审查日志

## 📞 技术支持

如有问题，请查看:
1. [呼叫中心开发需求文档](./呼叫中心开发需求文档.md)
2. [音频流处理架构](./音频流处理架构.md)
3. [音频流处理实现总结](./音频流处理实现总结.md)

或联系开发团队。

## 🎯 下一步

1. **集成SIP服务器**
   - 实现SIP客户端
   - 连接到47.94.82.59:5060
   - 测试音频收发

2. **集成豆包大模型**
   - 获取API密钥
   - 实现对话API
   - 测试对话质量

3. **集成豆包TTS**
   - 获取TTS API密钥
   - 实现语音合成
   - 测试合成质量

4. **前端界面开发**
   - 实现呼叫中心仪表板
   - 添加通话控制界面
   - 实现实时监控

---

**文档版本**: v1.0  
**创建时间**: 2025-01-14  
**最后更新**: 2025-01-14

