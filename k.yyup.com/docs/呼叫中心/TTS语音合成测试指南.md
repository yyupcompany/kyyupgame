# TTS语音合成测试指南

## 📋 功能概述

在呼叫中心系统中集成了TTS（Text-to-Speech）语音合成测试功能，用于测试和验证语音合成服务的正常运行。

---

## 🎯 测试位置

### 前端页面
- **路径**: 呼叫中心 → AI智能分析面板
- **URL**: `http://localhost:5173/centers/call-center`
- **组件**: `AIAnalysisPanel.vue`

### 后端API
- **测试端点**: `POST /api/call-center/ai/tts/test`
- **音色列表**: `GET /api/call-center/ai/tts/voices`

---

## 🚀 使用步骤

### 1. 访问呼叫中心

```
http://localhost:5173/centers/call-center
```

### 2. 找到AI智能分析面板

在呼叫中心页面右侧，找到"AI语音合成"卡片。

### 3. 配置语音参数

- **语音模型**: 选择"豆包"（默认）
- **语音音色**: 
  - 女声 → `zh_female_cancan_mars_bigtts` (灿灿女声)
  - 男声 → `zh_male_qingsecunzheng_mars_bigtts` (青涩男声)
  - 童声 → `zh_female_qingxin_mars_bigtts` (清新女声)

### 4. 输入测试文本

在文本框中输入要合成的文本，例如：

```
欢迎来到我们的幼儿园，这里充满了欢声笑语。我们提供优质的教育服务，让每个孩子都能快乐成长。
```

### 5. 点击"合成语音"按钮

系统会调用火山引擎TTS服务进行语音合成。

### 6. 播放合成的语音

合成成功后，点击"播放"按钮试听合成的语音。

---

## 🔧 技术实现

### 前端实现

**文件**: `client/src/components/call-center/AIAnalysisPanel.vue`

```typescript
const handleSynthesize = async () => {
  // 映射音色到火山引擎音色名称
  const voiceMap: Record<string, string> = {
    'female': 'zh_female_cancan_mars_bigtts',
    'male': 'zh_male_qingsecunzheng_mars_bigtts',
    'child': 'zh_female_qingxin_mars_bigtts'
  }

  // 调用呼叫中心TTS测试API
  const response = await request.post('/call-center/ai/tts/test', {
    text: synthesisText.value,
    voice: volcengineVoice,
    speed: 1.0,
    format: 'mp3'
  }, {
    responseType: 'arraybuffer',
    timeout: 60000
  })

  // 创建音频URL并播放
  const audioBlob = new Blob([response], { type: 'audio/mpeg' })
  const audioUrl = URL.createObjectURL(audioBlob)
  synthesizedAudio.value = audioUrl
}
```

### 后端实现

**文件**: `server/src/controllers/call-center.controller.ts`

```typescript
async testTTS(req: Request, res: Response) {
  const { text, voice, speed, format } = req.body

  // 调用AI Bridge服务进行语音合成
  const aiBridgeService = new AIBridgeService()
  
  const audioBuffer = await aiBridgeService.textToSpeech(text, {
    voice: voice || 'zh_female_cancan_mars_bigtts',
    speed: speed || 1.0,
    format: format || 'mp3'
  })

  // 返回音频数据
  res.setHeader('Content-Type', 'audio/mpeg')
  res.setHeader('Content-Length', audioBuffer.length.toString())
  return res.send(audioBuffer)
}
```

---

## 🎤 可用音色列表

### 儿童音色
| 音色ID | 名称 | 性别 | 描述 |
|--------|------|------|------|
| `zh_female_cancan_mars_bigtts` | 灿灿女声 | 女 | 活泼可爱，适合幼儿园场景 |
| `zh_female_qingxin_mars_bigtts` | 清新女声 | 女 | 清新自然 |
| `zh_male_qingsecunzheng_mars_bigtts` | 青涩男声 | 男 | 青涩纯真 |

### 教育音色
| 音色ID | 名称 | 性别 | 描述 |
|--------|------|------|------|
| `zh_female_yingyujiaoyu_mars_bigtts` | Tina老师 | 女 | 专业的英语教育音色 |

### 专业音色
| 音色ID | 名称 | 性别 | 描述 |
|--------|------|------|------|
| `zh_female_xinwen_mars_bigtts` | 新闻女声 | 女 | 专业的新闻播报音色 |
| `zh_male_xinwen_mars_bigtts` | 新闻男声 | 男 | 专业的新闻播报音色 |

---

## ✅ 验证标准

### 成功标准
1. ✅ API返回200状态码
2. ✅ 返回的音频数据大小 > 0 bytes
3. ✅ Content-Type为 `audio/mpeg`
4. ✅ 音频可以正常播放
5. ✅ 音频内容与输入文本一致
6. ✅ 音色符合选择的音色类型

### 性能标准
- 合成时间 < 10秒（100字以内）
- 音频质量清晰，无杂音
- 语速适中，发音准确

---

## 🐛 常见问题

### 1. 返回0字节音频

**原因**: 使用了错误的音色参数（如OpenAI音色）

**解决方案**: 
- 确保使用火山引擎音色名称
- 参考 `docs/豆包模型注意事项/TTS文字转语音正确调用指南.md`

### 2. 请求超时

**原因**: 文本过长或网络问题

**解决方案**:
- 减少文本长度（建议 < 500字）
- 检查网络连接
- 增加超时时间（当前60秒）

### 3. 音频无法播放

**原因**: 浏览器不支持或音频格式错误

**解决方案**:
- 使用Chrome/Firefox/Safari浏览器
- 检查音频格式是否为mp3
- 查看浏览器控制台错误信息

---

## 📊 测试日志

### 前端日志
```
🎤 [呼叫中心] 开始TTS语音合成测试
   文本: 欢迎来到我们的幼儿园...
   模型: doubao
   音色: female
   火山引擎音色: zh_female_cancan_mars_bigtts
✅ [呼叫中心] TTS语音合成成功
   音频大小: 32487 bytes
```

### 后端日志
```
🎤 [呼叫中心TTS测试] 开始语音合成
   文本: 欢迎来到我们的幼儿园...
   音色: zh_female_cancan_mars_bigtts
   语速: 1.0
   格式: mp3
📨 [TTS V3] 收到事件: 50   (CONNECTION_STARTED)
📨 [TTS V3] 收到事件: 150  (SESSION_STARTED)
📨 [TTS V3] 收到事件: 350  (TTS_SENTENCE_START)
📨 [TTS V3] 收到事件: 352  (TTS_RESPONSE - 音频数据)
🎵 [TTS V3] 收到音频数据: 共10块
✅ [TTS V3 Bidirection] 合成成功: 32487 bytes
✅ [呼叫中心TTS测试] 语音合成成功: 32487 bytes
```

---

## 🔗 相关文档

- [TTS文字转语音正确调用指南](../豆包模型注意事项/TTS文字转语音正确调用指南.md)
- [常见问题FAQ](../豆包模型注意事项/常见问题FAQ.md)
- [呼叫中心开发需求文档](./呼叫中心开发需求文档.md)
- [TTS返回0字节问题解决方案](./TTS返回0字节问题解决方案.md)

---

## 📝 测试记录模板

```markdown
### 测试时间: 2025-10-14 23:45:00

**测试环境**:
- 前端: http://localhost:5173
- 后端: http://localhost:3000
- 浏览器: Chrome 120

**测试参数**:
- 文本: "欢迎来到我们的幼儿园"
- 音色: zh_female_cancan_mars_bigtts
- 语速: 1.0
- 格式: mp3

**测试结果**:
- ✅ API调用成功
- ✅ 音频大小: 32.5 KB
- ✅ 播放正常
- ✅ 音质清晰

**备注**: 测试通过，功能正常
```

---

**最后更新**: 2025-10-14  
**维护人员**: AI开发团队

