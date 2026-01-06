# AIBridge与SIP UDP集成说明

**更新时间**: 2025-10-14 11:15  
**状态**: ✅ 已完成

---

## 📋 概述

本文档说明如何在SIP UDP呼叫中心服务中集成AIBridge统一AI服务架构。

### 什么是AIBridge？

AIBridge是系统中的**统一AI服务层**，封装了所有AI模型调用：

```
AIBridgeService (统一AI服务层)
├── 文本对话 - generateChatCompletion()
├── 图像生成 - generateImage()
├── 语音转文字 - speechToText()
├── 文字转语音 - textToSpeech()
├── 视频生成 - generateVideo()
└── 文档处理 - 各种文档功能
```

**核心文件**:
- `server/src/services/ai/bridge/ai-bridge.service.ts` - AIBridge核心服务
- `server/src/services/ai/bridge/ai-bridge.types.ts` - AIBridge类型定义

---

## 🔧 集成架构

### 旧架构 (已废弃)

```
SIP UDP → callCenterRealtimeService → doubaoRealtimeVoiceService
```

**问题**:
- ❌ 依赖专用的实时语音服务
- ❌ 配置分散
- ❌ 无使用量统计
- ❌ 难以扩展

### 新架构 (AIBridge)

```
SIP UDP → AIBridge Service
    ↓
    ├── speechToText() - ASR (语音识别)
    ├── generateChatCompletion() - LLM (对话)
    └── textToSpeech() - TTS (语音合成)
```

**优势**:
- ✅ 统一的AI服务接口
- ✅ 从数据库加载配置
- ✅ 自动记录使用量
- ✅ 统一错误处理
- ✅ 易于扩展新功能

---

## 💻 代码实现

### 1. 导入AIBridge服务

```typescript
// server/src/services/sip-udp.service.ts
import { aiBridgeService } from './ai/bridge/ai-bridge.service';
import { AIModelConfig } from '../models/ai-model-config.model';
```

### 2. 呼叫接通时初始化AI会话

```typescript
// 当收到SIP 200 OK响应时
if (statusCode === 200) {
  console.log('✅ 通话已接通');
  callSession.status = 'answered';
  
  // 从数据库加载豆包模型配置
  const { Op } = require('sequelize');
  const doubaoModel = await AIModelConfig.findOne({
    where: {
      modelType: 'text',
      status: 'active',
      name: { [Op.like]: '%doubao%' }
    }
  });
  
  // 准备系统提示词
  const initialPrompt = systemPrompt || `你是一位专业的幼儿园招生顾问...`;
  
  // 存储到会话
  callSession.systemPrompt = initialPrompt;
  
  // 发出AI会话就绪事件
  this.emit('ai-session-ready', {
    callId,
    customerId,
    systemPrompt: initialPrompt,
    modelConfig: doubaoModel
  });
}
```

### 3. 处理音频流（ASR → LLM → TTS）

```typescript
async processAudio(callId: string, audioData: Buffer): Promise<void> {
  const callSession = this.activeCalls.get(callId);
  
  try {
    // 步骤1: 语音转文字 (ASR)
    const transcription = await aiBridgeService.speechToText({
      model: 'whisper-1',
      file: audioData,
      filename: `audio_${callId}.wav`,
      language: 'zh'
    });
    
    if (transcription && transcription.text) {
      console.log(`🎤 用户说: ${transcription.text}`);
      
      // 步骤2: AI对话 (LLM)
      const { Op } = require('sequelize');
      const doubaoModel = await AIModelConfig.findOne({
        where: {
          modelType: 'text',
          status: 'active',
          name: { [Op.like]: '%doubao%' }
        }
      });
      
      if (doubaoModel) {
        const response = await aiBridgeService.generateChatCompletion({
          model: doubaoModel.name,
          messages: [
            {
              role: 'system',
              content: callSession.systemPrompt || '你是一位专业的幼儿园招生顾问'
            },
            {
              role: 'user',
              content: transcription.text
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        }, {
          endpointUrl: doubaoModel.endpointUrl,
          apiKey: doubaoModel.apiKey
        });
        
        if (response && response.choices && response.choices[0]) {
          const aiReply = response.choices[0].message.content;
          console.log(`🤖 AI回复: ${aiReply}`);
          
          // 步骤3: 文字转语音 (TTS)
          const ttsResult = await aiBridgeService.textToSpeech({
            model: 'tts-1',
            input: aiReply,
            voice: 'zh_female_cancan_mars_bigtts',
            speed: 1.0
          });
          
          if (ttsResult && ttsResult.audioData) {
            console.log(`🔊 语音合成成功`);
            
            // 发出音频响应事件
            this.emit('audio-response', {
              callId,
              audioData: ttsResult.audioData,
              text: aiReply
            });
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ 处理音频失败:`, error);
    this.emit('audio-error', { callId, error });
  }
}
```

### 4. 挂断时清理

```typescript
async hangupCall(callId: string): Promise<void> {
  // ... 发送SIP BYE消息 ...
  
  // 结束AI会话
  console.log(`🤖 结束AI会话: ${callId}`);
  
  // 清理资源
  callSession.status = 'ended';
  this.activeCalls.delete(callId);
}
```

---

## 📊 数据流程

### 完整的呼叫流程

```
1. 发起呼叫
   └─> SIP INVITE → Kamailio服务器

2. 客户接听
   └─> SIP 200 OK ← Kamailio服务器
   └─> 初始化AI会话（加载豆包模型配置）

3. 音频流处理（循环）
   ├─> 接收客户音频
   ├─> AIBridge.speechToText() - 语音识别
   ├─> AIBridge.generateChatCompletion() - AI对话
   ├─> AIBridge.textToSpeech() - 语音合成
   └─> 发送AI语音回客户

4. 挂断
   └─> SIP BYE → Kamailio服务器
   └─> 清理AI会话
```

---

## 🔑 配置要求

### 1. 数据库配置

需要在 `ai_model_configs` 表中配置豆包模型：

```sql
INSERT INTO ai_model_configs (
  name,
  displayName,
  provider,
  modelType,
  endpointUrl,
  apiKey,
  status,
  isDefault
) VALUES (
  'doubao-pro-32k',
  '豆包Pro 32K',
  'Doubao',
  'text',
  'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  '你的API Key',
  'active',
  true
);
```

### 2. 环境变量

```env
# SIP配置
SIP_SERVER_HOST=47.94.82.59
SIP_SERVER_PORT=5060
SIP_LOCAL_HOST=192.168.1.243
SIP_LOCAL_PORT=5060

# 豆包配置（可选，优先使用数据库配置）
VOLCANO_API_KEY=你的API Key
```

---

## 🧪 测试方法

### 方法1: 使用测试脚本

```bash
chmod +x test-aibridge-sip-integration.sh
./test-aibridge-sip-integration.sh
```

### 方法2: 使用curl

```bash
# 1. 登录
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. 发起呼叫
curl -X POST http://localhost:3000/api/call-center/call/udp/make \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "phoneNumber": "18611141133",
    "customerId": 1,
    "systemPrompt": "你是一位专业的幼儿园招生顾问"
  }'
```

### 方法3: 查看后端日志

```bash
npm run start:backend

# 观察日志输出:
# ✅ 豆包实时语音会话已准备就绪
# 🎤 用户说: ...
# 🤖 AI回复: ...
# 🔊 语音合成成功
```

---

## 📝 事件系统

SIP UDP服务发出以下事件：

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `call-initiated` | 发送INVITE后 | `{ callId, phoneNumber }` |
| `call-trying` | 收到100 Trying | `{ callId }` |
| `call-ringing` | 收到180 Ringing | `{ callId }` |
| `call-answered` | 收到200 OK | `{ callId }` |
| `ai-session-ready` | AI会话初始化完成 | `{ callId, customerId, systemPrompt, modelConfig }` |
| `audio-response` | AI语音合成完成 | `{ callId, audioData, text }` |
| `audio-error` | 音频处理失败 | `{ callId, error }` |
| `call-ended` | 通话结束 | `{ callId, duration }` |
| `call-failed` | 呼叫失败 | `{ callId, error }` |

---

## 🚀 优势总结

### 1. **统一架构**
- 所有AI调用通过AIBridge
- 一致的接口和错误处理

### 2. **配置管理**
- 从数据库动态加载模型配置
- 支持多个AI模型切换

### 3. **使用量统计**
- AIBridge自动记录使用量
- 便于成本分析和优化

### 4. **可扩展性**
- 易于添加新的AI功能
- 支持多种AI提供商

### 5. **可维护性**
- 代码结构清晰
- 易于调试和测试

---

## 📚 相关文档

- [AIBridge服务文档](../AI_MODEL_API_SKIP_EXPLANATION.md)
- [SIP UDP集成说明](./SIP_UDP集成说明.md)
- [UDP和豆包集成测试报告](./UDP和豆包集成测试报告.md)
- [TTS V3集成总结](../../server/TTS_V3_INTEGRATION_SUMMARY.md)

---

## ❓ 常见问题

### Q: 为什么不直接使用doubaoRealtimeVoiceService？

A: AIBridge提供了更统一、更灵活的架构：
- 统一的配置管理
- 自动使用量统计
- 支持多种AI模型
- 更好的错误处理

### Q: 如何切换到其他AI模型？

A: 只需在数据库中添加新的模型配置，代码会自动使用：
```sql
INSERT INTO ai_model_configs (name, modelType, endpointUrl, apiKey, status)
VALUES ('gpt-4', 'text', 'https://api.openai.com/v1/chat/completions', 'sk-...', 'active');
```

### Q: 如何监控AI使用量？

A: AIBridge自动记录使用量到 `ai_usage_logs` 表：
```sql
SELECT * FROM ai_usage_logs WHERE user_id = 1 ORDER BY created_at DESC LIMIT 10;
```

---

**文档维护**: AI Assistant  
**最后更新**: 2025-10-14 11:15

