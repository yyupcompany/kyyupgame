# 互动课程 - AI模型配置详解

## 🤖 后台对接的AI模型

互动课程功能使用**豆包AI (ByteDance Doubao)**的三个专业模型，采用**两阶段生成模式**：

---

## 📊 模型配置表

| 模型名称 | 用途 | 阶段 | 功能 | 状态 |
|---------|------|------|------|------|
| doubao-seed-1-6-thinking-250615 | 文本生成 | 第一阶段 | 深度分析、代码生成 | ✅ 活跃 |
| doubao-seedream-3-0-t2i-250415 | 图片生成 | 第二阶段 | 生成课程配图 | ✅ 活跃 |
| doubao-seedance-1-0-pro-250528 | 视频生成 | 第二阶段 | 生成教学视频 | ✅ 活跃 |

---

## 🔍 模型详细配置

### 1️⃣ Think模型 (文本生成)
**模型名**: `doubao-seed-1-6-thinking-250615`

**用途**: 
- 深度分析课程需求
- 规划课程结构
- 生成HTML/CSS/JavaScript代码

**配置参数**:
```typescript
{
  name: 'doubao-seed-1-6-thinking-250615',
  displayName: '豆包思维链模型 1.6',
  provider: 'bytedance_doubao',
  modelType: 'text',
  endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  apiVersion: 'v3',
  modelParameters: {
    temperature: 0.7,
    maxTokens: 8000,
    topP: 0.9,
    contextWindow: 32000
  },
  capabilities: ['chat', 'function_calling', 'thinking_chain'],
  supportsFunctionCalling: true,
  supportsStreaming: true,
  status: 'active',
  isDefault: true,
  priority: 10
}
```

**特点**:
- ✅ 支持思维链 (Thinking Chain)
- ✅ 支持流式输出
- ✅ 支持函数调用
- ✅ 上下文窗口: 32K tokens
- ✅ 最大输出: 8000 tokens

**速率限制**:
- 每分钟请求数: 60
- 每分钟tokens: 100,000
- 日配额: 1,000,000

---

### 2️⃣ 图片生成模型
**模型名**: `doubao-seedream-3-0-t2i-250415`

**用途**: 
- 生成课程配套图片
- 支持卡通、写实等多种风格

**配置参数**:
```typescript
{
  name: 'doubao-seedream-3-0-t2i-250415',
  displayName: '豆包图片生成模型 3.0',
  provider: 'bytedance_doubao',
  modelType: 'image',
  endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/image/generation',
  apiVersion: 'v3',
  capabilities: ['image_generation', 'style_transfer'],
  status: 'active'
}
```

**特点**:
- ✅ 高质量图片生成
- ✅ 支持多种风格
- ✅ 支持中文提示词
- ✅ 快速生成

---

### 3️⃣ 视频生成模型
**模型名**: `doubao-seedance-1-0-pro-250528`

**用途**: 
- 生成教学视频
- 支持动画和视频生成

**配置参数**:
```typescript
{
  name: 'doubao-seedance-1-0-pro-250528',
  displayName: '豆包视频生成模型 1.0 Pro',
  provider: 'bytedance_doubao',
  modelType: 'video',
  endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/video/generation',
  apiVersion: 'v3',
  capabilities: ['video_generation', 'animation'],
  status: 'active'
}
```

**特点**:
- ✅ 高质量视频生成
- ✅ 支持动画效果
- ✅ 支持多种场景
- ✅ 教学视频优化

---

## 🔄 两阶段生成流程

### 第一阶段: 深度分析 (Think模型)
```
用户输入课程需求
    ↓
Think模型深度分析
    ↓
生成课程规划
    ↓
优化提示词
    ↓
返回分析结果
```

**输出内容**:
- 课程标题
- 课程领域
- 年龄段
- 学习目标
- 视觉风格
- 配色方案
- 交互方式

### 第二阶段: 并行生成
```
课程规划
    ├─ Think模型 → 生成HTML/CSS/JS代码
    ├─ 图片模型 → 生成配套图片
    └─ 视频模型 → 生成教学视频
    
    ↓
整合所有资源
    ↓
返回完整课程
```

---

## 📡 API调用方式

### 后端服务
**文件**: `server/src/services/curriculum/interactive-curriculum.service.ts`

```typescript
class InteractiveCurriculumService {
  private readonly THINK_MODEL = 'doubao-seed-1-6-thinking-250615';
  private readonly IMAGE_MODEL = 'doubao-seedream-3-0-t2i-250415';
  private readonly VIDEO_MODEL = 'doubao-seedance-1-0-pro-250528';

  // 使用AIBridge服务调用模型
  async generateCode(prompt: string): Promise<any> {
    const response = await aiBridgeService.generateChatCompletion({
      model: this.THINK_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 8000
    });
    return response;
  }
}
```

### AIBridge服务
**文件**: `server/src/services/ai/bridge/ai-bridge.service.ts`

**功能**:
- ✅ 统一的AI模型调用接口
- ✅ 自动从数据库读取模型配置
- ✅ 支持流式和非流式调用
- ✅ 自动重试和错误处理
- ✅ 请求日志记录

---

## 🔐 API密钥管理

### 环境变量配置
```bash
DOUBAO_API_KEY=your_api_key_here
```

### 数据库存储
模型配置存储在 `ai_model_configs` 表中：
- API密钥加密存储
- 支持多个模型配置
- 支持模型启用/禁用
- 支持模型优先级设置

---

## 📊 模型性能指标

| 指标 | Think模型 | 图片模型 | 视频模型 |
|------|----------|---------|---------|
| 平均响应时间 | 5-10秒 | 10-20秒 | 30-60秒 |
| 成功率 | 99%+ | 98%+ | 95%+ |
| 输出质量 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 成本效率 | 高 | 中 | 低 |

---

## 💡 优化建议

### 1. 缓存优化
- 缓存生成的代码片段
- 缓存常用的图片提示词
- 使用Redis存储进度信息

### 2. 成本优化
- 使用Flash模型进行快速推理
- 对简单任务使用Lite模型
- 实现请求合并和批处理

### 3. 性能优化
- 并行调用多个模型
- 使用流式输出减少延迟
- 实现进度跟踪和中断机制

---

## 🚀 扩展方向

### 支持更多模型
- ✅ GPT-4 (OpenAI)
- ✅ Claude (Anthropic)
- ✅ Gemini (Google)
- ✅ 本地模型 (Ollama)

### 支持更多功能
- ✅ 音频生成
- ✅ 3D模型生成
- ✅ 交互式课程
- ✅ 实时反馈

---

**配置文件**: `server/src/models/ai-model-config.model.ts`  
**服务文件**: `server/src/services/curriculum/interactive-curriculum.service.ts`  
**桥接服务**: `server/src/services/ai/bridge/ai-bridge.service.ts`

