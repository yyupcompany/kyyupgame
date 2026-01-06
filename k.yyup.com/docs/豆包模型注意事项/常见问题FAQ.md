# 豆包模型常见问题FAQ

## 📋 快速导航

- [TTS文字转语音](#tts文字转语音)
- [ASR语音识别](#asr语音识别)
- [LLM对话模型](#llm对话模型)
- [配置问题](#配置问题)
- [性能优化](#性能优化)

---

## TTS文字转语音

### Q1: TTS返回0字节音频数据怎么办？

**问题**: API返回200状态码，但Content-Length为0

**原因**: 使用了错误的音色参数（OpenAI音色名称）

**解决方案**:
```typescript
// ❌ 错误
voice: 'nova'  // OpenAI音色

// ✅ 正确
voice: 'zh_female_cancan_mars_bigtts'  // 火山引擎音色
```

**详细文档**: [TTS文字转语音正确调用指南](./TTS文字转语音正确调用指南.md)

---

### Q2: 支持哪些音色？

**火山引擎TTS支持的音色**:

**教育场景**:
- `zh_female_yingyujiaoyu_mars_bigtts` - Tina老师（专业教育）
- `zh_female_shaoergushi_mars_bigtts` - 少儿故事（温柔亲切）
- `zh_male_tiancaitongsheng_mars_bigtts` - 天才童声（活泼可爱）

**通用场景**:
- `zh_female_cancan_mars_bigtts` - 灿灿女声（温柔甜美）
- `zh_female_qingxin_mars_bigtts` - 清新女声（清新自然）
- `zh_male_qingse_mars_bigtts` - 青涩男声（青春活力）

**完整列表**: 参见[TTS文字转语音正确调用指南 - 音色参数说明](./TTS文字转语音正确调用指南.md#音色参数说明)

---

### Q3: 如何调整语速？

**语速参数**: `speed`

**取值范围**: 0.5 - 2.0

**示例**:
```typescript
{
  text: '欢迎来到我们的幼儿园',
  voice: 'zh_female_cancan_mars_bigtts',
  speed: 1.0,  // 正常语速
  format: 'mp3'
}

// 慢速（适合教学）
speed: 0.8

// 快速（适合通知）
speed: 1.2
```

---

### Q4: 支持哪些音频格式？

**支持的格式**:
- `mp3` - 推荐，兼容性最好
- `opus` - 高质量，文件较小
- `aac` - 适合移动端
- `flac` - 无损音质，文件较大

**推荐使用**: `mp3`

---

### Q5: 文本长度有限制吗？

**限制**: 单次请求最多 **4096** 个字符

**处理长文本**:
```typescript
// 分段处理
const maxLength = 4096
const chunks = []

for (let i = 0; i < longText.length; i += maxLength) {
  chunks.push(longText.substring(i, i + maxLength))
}

// 逐段生成音频
for (const chunk of chunks) {
  const audio = await generateSpeech(chunk)
  // 合并音频...
}
```

---

### Q6: WebSocket连接超时怎么办？

**错误日志**:
```
📨 [TTS V3] 收到事件: 55000000
🔊 [文本转语音] 调用失败: TTS请求超时（30秒）
```

**原因**: 音色参数不匹配

**解决方案**:
1. 检查音色参数是否使用火山引擎音色
2. 检查数据库配置是否正确
3. 查看后端日志确认错误

---

## ASR语音识别

### Q7: ASR识别准确率低怎么办？

**优化建议**:

1. **音频质量**
   - 采样率: 16000 Hz（推荐）
   - 格式: PCM、WAV
   - 降噪: 使用降噪处理

2. **参数配置**
   ```typescript
   {
     format: 'pcm',
     sampleRate: 16000,
     language: 'zh-CN',
     enablePunctuation: true,  // 启用标点
     enableITN: true           // 启用数字转换
   }
   ```

3. **环境优化**
   - 减少背景噪音
   - 使用高质量麦克风
   - 保持适当距离

---

### Q8: ASR支持哪些语言？

**支持的语言**:
- `zh-CN` - 中文（普通话）
- `en-US` - 英语（美式）
- `zh-CN-dialect` - 中文方言

**推荐**: 幼儿园场景使用 `zh-CN`

---

## LLM对话模型

### Q9: 如何选择合适的LLM模型？

**模型对比**:

| 模型 | 特点 | 适用场景 | Token限制 |
|------|------|----------|-----------|
| doubao-pro-128k | 长上下文 | 复杂对话、文档分析 | 128k |
| doubao-lite-128k | 快速响应 | 简单问答、实时对话 | 128k |
| doubao-pro-32k | 平衡性能 | 通用对话 | 32k |

**推荐**:
- 招生咨询: `doubao-pro-128k`（需要记忆上下文）
- 简单问答: `doubao-lite-128k`（快速响应）

---

### Q10: 如何控制LLM回复长度？

**参数配置**:
```typescript
{
  model: 'doubao-pro-128k',
  messages: [...],
  max_tokens: 500,        // 限制回复长度
  temperature: 0.7,       // 控制创造性
  top_p: 0.9             // 控制多样性
}
```

**建议**:
- 简短回复: `max_tokens: 200`
- 详细回复: `max_tokens: 1000`
- 长文本: `max_tokens: 2000`

---

## 配置问题

### Q11: 如何检查模型配置是否正确？

**检查脚本**:
```bash
# 检查TTS配置
node check-tts-config.cjs

# 检查所有speech模型
node check-speech-models.cjs
```

**数据库查询**:
```sql
-- 查看TTS模型配置
SELECT 
  id, name, model_type, status, endpoint_url
FROM ai_model_config
WHERE model_type = 'speech' AND status = 'active';

-- 应该看到:
-- name: doubao-tts-bigmodel
-- model_type: speech
-- status: active
-- endpoint_url: wss://openspeech.bytedance.com/api/v3/tts/bidirection
```

---

### Q12: 如何修复模型配置？

**修复TTS端点**:
```bash
node fix-tts-config.cjs
```

**修复model_type**:
```bash
node fix-tts-model-type.cjs
```

**手动修复**:
```sql
UPDATE ai_model_config
SET 
  endpoint_url = 'wss://openspeech.bytedance.com/api/v3/tts/bidirection',
  model_type = 'speech',
  status = 'active'
WHERE name = 'doubao-tts-bigmodel';
```

---

### Q13: 多个TTS模型如何选择？

**控制器查询逻辑**:
```typescript
// 查询第一个active状态的speech模型
const ttsModel = await AIModelConfig.findOne({
  where: {
    modelType: 'speech',
    status: 'active'
  }
});
```

**优先级控制**:
1. 确保只有一个模型是 `active` 状态
2. 或者确保想要的模型ID最小（先被查询到）

**建议**: 只保持一个TTS模型为active状态

---

## 性能优化

### Q14: TTS生成速度慢怎么办？

**优化方案**:

1. **使用流式传输**
   - V3 WebSocket支持流式返回
   - 边生成边播放

2. **缓存常用语音**
   ```typescript
   // 缓存常用通知语音
   const cache = new Map()
   
   async function getCachedSpeech(text: string) {
     if (cache.has(text)) {
       return cache.get(text)
     }
     
     const audio = await generateSpeech(text)
     cache.set(text, audio)
     return audio
   }
   ```

3. **预生成语音**
   - 提前生成常用语音
   - 存储到文件系统

---

### Q15: 如何减少API调用次数？

**策略**:

1. **合并请求**
   ```typescript
   // ❌ 多次调用
   await generateSpeech('欢迎')
   await generateSpeech('来到')
   await generateSpeech('幼儿园')
   
   // ✅ 合并调用
   await generateSpeech('欢迎来到幼儿园')
   ```

2. **使用模板**
   ```typescript
   // 预定义常用模板
   const templates = {
     welcome: '欢迎来到我们的幼儿园',
     goodbye: '再见，期待下次见面',
     notification: '各位家长请注意'
   }
   ```

3. **本地缓存**
   - 使用localStorage缓存音频URL
   - 设置合理的过期时间

---

### Q16: 如何监控API使用情况？

**数据库查询**:
```sql
-- 查看TTS使用统计
SELECT 
  DATE(created_at) as date,
  COUNT(*) as count,
  AVG(processing_time) as avg_time
FROM ai_model_usage
WHERE model_type = 'speech'
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;
```

**日志监控**:
```bash
# 查看TTS调用日志
grep "文本转语音" server/logs/app.log

# 统计成功率
grep "语音生成成功" server/logs/app.log | wc -l
grep "语音生成失败" server/logs/app.log | wc -l
```

---

## 错误码对照表

| 错误码 | 含义 | 解决方案 |
|--------|------|----------|
| 55000000 | 音色参数错误 | 使用火山引擎音色 |
| 404 | 端点URL错误 | 检查数据库配置 |
| 401 | 认证失败 | 检查API Key |
| 429 | 请求过多 | 降低请求频率 |
| 500 | 服务器错误 | 查看后端日志 |

---

## 快速诊断清单

### TTS问题诊断

- [ ] 检查音色参数是否使用火山引擎音色
- [ ] 检查responseType是否设置为'blob'
- [ ] 检查文本长度是否超过4096字符
- [ ] 检查数据库model_type是否为'speech'
- [ ] 检查数据库status是否为'active'
- [ ] 检查endpoint_url是否为V3 WebSocket地址
- [ ] 查看后端日志是否有错误

### ASR问题诊断

- [ ] 检查音频格式是否支持
- [ ] 检查采样率是否正确
- [ ] 检查音频质量是否良好
- [ ] 检查语言参数是否正确
- [ ] 查看后端日志是否有错误

### LLM问题诊断

- [ ] 检查模型名称是否正确
- [ ] 检查max_tokens是否合理
- [ ] 检查messages格式是否正确
- [ ] 检查API Key是否有效
- [ ] 查看后端日志是否有错误

---

## 联系支持

### 技术文档
- [TTS文字转语音正确调用指南](./TTS文字转语音正确调用指南.md)
- [火山引擎官方文档](https://www.volcengine.com/docs/6561/79820)

### 测试工具
- `test-media-center-tts.cjs` - TTS测试
- `check-tts-config.cjs` - 配置检查
- `fix-tts-config.cjs` - 配置修复

### 日志位置
- 后端日志: `server/logs/app.log`
- 错误日志: `server/logs/error.log`
- 控制台输出: 运行 `npm run start:backend` 查看

---

**文档版本**: 1.0  
**创建时间**: 2025-10-14  
**最后更新**: 2025-10-14  
**维护者**: 开发团队

