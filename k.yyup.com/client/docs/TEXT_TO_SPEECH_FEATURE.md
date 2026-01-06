# 文字转语音功能实现文档

## 📋 功能概述

为新媒体中心添加了文字转语音（Text-to-Speech, TTS）功能，允许用户将文字内容转换为自然流畅的语音文件。

### 功能特点

- ✅ 支持6种不同音色（3种女声 + 3种男声）
- ✅ 可调节语速（0.25x - 4.0x）
- ✅ 支持4种音频格式（MP3, Opus, AAC, FLAC）
- ✅ 实时音频预览
- ✅ 一键下载语音文件
- ✅ 快速模板应用
- ✅ 最多支持4096字符

---

## 🎯 实现的文件

### 前端文件

#### 1. **TextToSpeech.vue** - 主组件
**路径**: `client/src/pages/principal/media-center/TextToSpeech.vue`

**功能**:
- 文本输入和编辑
- 音色选择（6种音色）
- 语速调节（滑块控制）
- 输出格式选择
- 音频预览播放
- 下载功能
- 快速模板

**主要方法**:
```typescript
// 生成语音
const generateSpeech = async () => {
  const response = await request.post('/ai/text-to-speech', {
    text: formData.value.text,
    voice: formData.value.voice,
    speed: formData.value.speed,
    format: formData.value.format
  }, {
    responseType: 'blob'
  })
  
  // 创建音频URL
  const blob = new Blob([response], { type: `audio/${formData.value.format}` })
  audioUrl.value = URL.createObjectURL(blob)
}

// 下载音频
const downloadAudio = () => {
  const link = document.createElement('a')
  link.href = audioUrl.value
  link.download = `语音_${Date.now()}.${formData.value.format}`
  link.click()
}
```

#### 2. **MediaCenter.vue** - 集成
**路径**: `client/src/pages/principal/MediaCenter.vue`

**修改内容**:
1. 添加TTS标签页
2. 导入TextToSpeech组件
3. 添加handleAudioCreated方法
4. 更新类型标签和标签映射
5. 添加TTS功能卡片

**新增代码**:
```vue
<!-- 文字转语音标签页 -->
<template #tab-tts>
  <TextToSpeech @audio-created="handleAudioCreated" />
</template>

<!-- 功能卡片 -->
<div class="feature-card feature-card--tts" @click="handleFeatureClick('tts')">
  <div class="card-icon">
    <el-icon><Microphone /></el-icon>
  </div>
  <div class="card-content">
    <h3>文字转语音</h3>
    <p>将文字内容转换为自然流畅的语音，支持多种音色</p>
    <div class="card-stats">
      <span>6种音色</span>
      <span>4种格式</span>
    </div>
  </div>
</div>
```

### 后端文件

#### 1. **text-to-speech.controller.ts** - 控制器
**路径**: `server/src/controllers/text-to-speech.controller.ts`

**功能**:
- 生成语音（generateSpeech）
- 获取音色列表（getVoices）
- 获取TTS配置（getConfig）

**核心代码**:
```typescript
public generateSpeech = async (req: Request, res: Response): Promise<void> => {
  const { text, voice = 'nova', speed = 1.0, format = 'mp3' } = req.body;

  // 验证参数
  if (!text || text.length > 4096) {
    res.status(400).json({ success: false, message: '参数错误' });
    return;
  }

  // 查询TTS模型配置
  const ttsModel = await AIModelConfig.findOne({
    where: { modelType: 'tts', status: 'active' }
  });

  // 构建请求参数
  const params: AiBridgeTextToSpeechParams = {
    model: ttsModel?.modelName || 'tts-1',
    input: text,
    voice: voice,
    response_format: format,
    speed: speed
  };

  // 调用AI Bridge服务
  const audioResult = await this.aiBridgeService.textToSpeech(params, {
    endpointUrl: ttsModel?.endpointUrl,
    apiKey: ttsModel?.apiKey
  });

  // 返回音频数据
  res.setHeader('Content-Type', audioResult.contentType);
  res.send(audioResult.audioData);
};
```

#### 2. **text-to-speech.routes.ts** - 路由
**路径**: `server/src/routes/text-to-speech.routes.ts`

**路由定义**:
```typescript
// 生成语音
router.post('/', textToSpeechController.generateSpeech);

// 获取音色列表
router.get('/voices', textToSpeechController.getVoices);

// 获取配置
router.get('/config', textToSpeechController.getConfig);
```

#### 3. **ai/index.ts** - 路由集成
**路径**: `server/src/routes/ai/index.ts`

**修改**:
```typescript
// 挂载文字转语音路由到 /text-to-speech 路径
import textToSpeechRoutes from '../text-to-speech.routes';
router.use('/text-to-speech', textToSpeechRoutes);
```

---

## 🎨 音色选项

| 音色ID | 名称 | 描述 | 性别 |
|--------|------|------|------|
| alloy | 女声-温柔 | 温柔亲切的女声 | 女 |
| nova | 女声-活泼 | 活泼开朗的女声 | 女 |
| shimmer | 女声-专业 | 专业稳重的女声 | 女 |
| echo | 男声-沉稳 | 沉稳大气的男声 | 男 |
| fable | 男声-年轻 | 年轻活力的男声 | 男 |
| onyx | 男声-磁性 | 磁性深沉的男声 | 男 |

---

## 📊 API接口

### 1. 生成语音

**端点**: `POST /api/ai/text-to-speech`

**请求体**:
```json
{
  "text": "要转换的文字内容",
  "voice": "nova",
  "speed": 1.0,
  "format": "mp3"
}
```

**响应**: 音频文件（二进制流）

**响应头**:
```
Content-Type: audio/mpeg
Content-Disposition: attachment; filename="speech_1234567890.mp3"
```

### 2. 获取音色列表

**端点**: `GET /api/ai/text-to-speech/voices`

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "alloy",
      "name": "女声-温柔",
      "description": "温柔亲切的女声",
      "language": "zh-CN"
    }
  ]
}
```

### 3. 获取配置

**端点**: `GET /api/ai/text-to-speech/config`

**响应**:
```json
{
  "success": true,
  "data": {
    "hasConfig": true,
    "modelName": "tts-1",
    "maxLength": 4096,
    "supportedFormats": ["mp3", "opus", "aac", "flac"],
    "speedRange": {
      "min": 0.25,
      "max": 4.0,
      "default": 1.0
    }
  }
}
```

---

## 🔧 使用AI Bridge服务

### AI Bridge服务调用

**服务**: `AIBridgeService`  
**方法**: `textToSpeech(params, customConfig?)`

**参数类型**:
```typescript
interface AiBridgeTextToSpeechParams {
  model: string;              // 模型名称，如 'tts-1'
  input: string;              // 要转换的文本
  voice: string;              // 音色ID
  response_format?: 'mp3' | 'opus' | 'aac' | 'flac';
  speed?: number;             // 语速 (0.25-4.0)
}

interface AiBridgeTextToSpeechResponse {
  audioData: Buffer;          // 音频数据
  contentType: string;        // 内容类型
  duration?: number;          // 时长（可选）
}
```

**调用示例**:
```typescript
const audioResult = await aiBridgeService.textToSpeech({
  model: 'tts-1',
  input: '你好，欢迎来到我们的幼儿园！',
  voice: 'nova',
  response_format: 'mp3',
  speed: 1.0
}, {
  endpointUrl: 'https://api.openai.com/v1',
  apiKey: 'your-api-key'
});
```

---

## 🎯 快速模板

### 模板1: 招生宣传语音
```
亲爱的家长朋友们，我们幼儿园春季招生火热进行中！
我们拥有优质的教育资源、专业的师资力量、丰富的课程特色。
欢迎您带着宝贝来参观体验！
```

### 模板2: 活动通知语音
```
各位家长请注意，本周六上午9点，我们将举办亲子运动会。
请家长们准时参加，和孩子们一起享受快乐时光！
```

---

## 📝 使用流程

### 用户操作流程

1. **进入新媒体中心**
   - 点击侧边栏"新媒体中心"

2. **选择文字转语音**
   - 点击"文字转语音"标签页
   - 或点击概览页的"文字转语音"功能卡片

3. **输入文本**
   - 在文本框中输入要转换的内容
   - 或点击快速模板应用预设文本

4. **配置参数**
   - 选择音色（6种可选）
   - 调节语速（0.25x - 4.0x）
   - 选择输出格式（MP3/Opus/AAC/FLAC）

5. **生成语音**
   - 点击"生成语音"按钮
   - 等待AI处理（通常几秒钟）

6. **预览和下载**
   - 在右侧预览面板播放音频
   - 点击"下载语音文件"保存到本地

---

## ✅ 测试验证

### 测试步骤

1. ✅ 访问新媒体中心
2. ✅ 点击"文字转语音"标签页
3. ✅ 输入测试文本
4. ✅ 选择不同音色
5. ✅ 调节语速
6. ✅ 点击生成语音
7. ✅ 验证音频播放
8. ✅ 测试下载功能

### 预期结果

- ✅ 页面正常加载
- ✅ 表单验证正常
- ✅ API调用成功
- ✅ 音频正常生成
- ✅ 播放器正常工作
- ✅ 下载功能正常

---

## 🚨 注意事项

### 限制和约束

1. **文本长度限制**: 最多4096个字符
2. **语速范围**: 0.25x - 4.0x
3. **认证要求**: 需要登录并有AI权限
4. **模型配置**: 需要在数据库中配置TTS模型

### 错误处理

- 文本为空 → 提示"文本内容不能为空"
- 文本过长 → 提示"文本内容不能超过4096个字符"
- API调用失败 → 提示"语音生成失败，请重试"
- 权限不足 → 返回403错误

---

## 📚 相关文档

- AI Bridge服务文档: `server/src/services/ai/bridge/ai-bridge.service.ts`
- AI Bridge类型定义: `server/src/services/ai/bridge/ai-bridge.types.ts`
- 新媒体中心主页: `client/src/pages/principal/MediaCenter.vue`

---

**创建时间**: 当前会话  
**状态**: ✅ 已完成  
**版本**: 1.0.0

