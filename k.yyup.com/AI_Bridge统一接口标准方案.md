# 🌉 AI Bridge 统一接口标准方案

## 📊 概述

本文档定义了租户业务系统的统一AI Bridge接口标准，整合现有的三个AI服务，实现统一的调用规范。

**目标**：
1. ✅ 统一接口调用方式
2. ✅ 支持域名自动路由（本地/租户）
3. ✅ 保持向后兼容
4. ✅ 简化服务迁移

---

## 🔍 现有服务分析

### 1. ai/bridge/ai-bridge.service.ts (本地AI Bridge)
**用途**：开发环境使用，直接调用豆包API
**优点**：功能完整，性能优化（原生HTTP）
**缺点**：
- ❌ 无法统计用量
- ❌ 无法统一计费
- ❌ 配置分散在本地数据库

**接口清单**（17个）：
| 接口名 | 功能 | 是否流式 |
|--------|------|----------|
| generateChatCompletion | 聊天完成 | 否 |
| generateChatCompletionStream | 流式聊天 | ✅ 是 |
| generateFastChatCompletion | 快速推理 | 否 |
| generateThinkingChatCompletion | 深度思考 | 否 |
| generateFlashWithThink | Flash思考 | 否 |
| generateImage | 图片生成 | 否 |
| speechToText | 语音转文本 | 否 |
| textToSpeech | 文本转语音 | 否 |
| generateVideo | 视频生成 | 否 |
| uploadVideoToVOD | VOD上传 | 否 |
| mergeVideosVOD | VOD合并 | 否 |
| addAudioToVideoVOD | VOD添加音频 | 否 |
| transcodeVideoVOD | VOD转码 | 否 |
| getVODTaskStatus | VOD任务状态 | 否 |
| processDocument | 文档处理 | 否 |
| search | 网络搜索 | 否 |
| getModels | 获取模型列表 | 否 |

### 2. aibridge.service.ts (统一认证包装)
**用途**：通过统一认证系统调用AI
**优点**：
- ✅ 统一计费
- ✅ 用量统计
- ✅ 集中管理

**缺点**：
- ⚠️ 功能简化（只有分析接口）
- ⚠️ 不支持流式

**接口清单**（2个）：
| 接口名 | 功能 | 是否流式 |
|--------|------|----------|
| analyze | AI分析 | 否 |
| parseResult | 解析JSON | N/A |

### 3. ai-bridge-client.service.ts (旧版客户端)
**用途**：旧版统一认证客户端
**状态**：⚠️ 功能不完整，建议废弃

**接口清单**（5个）：
| 接口名 | 功能 | 是否流式 |
|--------|------|----------|
| getModels | 获取模型列表 | N/A |
| getDefaultModel | 获取默认模型 | N/A |
| getModelsByType | 按类型获取模型 | N/A |
| chat | AI对话 | 否 |
| checkHealth | 健康检查 | N/A |

---

## 🎯 统一接口标准

### 设计原则

1. **单一职责**：一个服务处理所有AI调用
2. **环境感知**：根据域名自动选择本地或统一认证
3. **接口统一**：所有功能使用相同的调用方式
4. **流式支持**：保留流式功能用于实时交互
5. **向后兼容**：逐步迁移，不影响现有服务

### 核心架构

```
┌─────────────────────────────────────────────────────────────┐
│                    统一AI Bridge服务                          │
│                  (unified-ai-bridge.service.ts)              │
├─────────────────────────────────────────────────────────────┤
│  环境检测层                                                    │
│  ├── localhost/127.0.0.1/k.yyup.cc → 本地AI Bridge           │
│  └── k001.yyup.cc (k开头)          → 统一认证AI Bridge        │
├─────────────────────────────────────────────────────────────┤
│  统一接口层                                                    │
│  ├── 文本/对话    → chat() / streamChat()                     │
│  ├── 图片生成    → generateImage()                            │
│  ├── 音频处理    → processAudio()                             │
│  ├── 视频处理    → processVideo()                             │
│  ├── 文档处理    → processDocument()                          │
│  └── 网络搜索    → search()                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 统一接口定义

### 1. 文本/对话接口

#### 非流式对话
```typescript
interface UnifiedChatRequest {
  model?: string;                    // 模型名称（可选，默认使用默认模型）
  messages: ChatMessage[];           // 消息列表
  temperature?: number;              // 温度参数 (0-1)
  max_tokens?: number;               // 最大token数
  tools?: any[];                     // 工具定义（可选）
  response_format?: string;          // 响应格式（可选）
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface UnifiedChatResponse {
  success: boolean;
  data?: {
    content: string;                 // AI回复内容
    message: string;                 // 兼容字段
    reasoning_content?: string;      // 思考内容（thinking模型）
    usage?: {                        // 用量统计
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      reasoning_tokens?: number;
      cost: number;
      responseTime: number;
    };
  };
  error?: string;
}
```

**调用方式**：
```typescript
const result = await unifiedAIBridge.chat({
  model: 'doubao-seed-1-6-thinking-250615',
  messages: [
    { role: 'user', content: '你好' }
  ],
  temperature: 0.7,
  max_tokens: 2000
}, authToken);
```

#### 流式对话
```typescript
interface UnifiedStreamChatRequest extends UnifiedChatRequest {
  // 继承非流式请求的所有字段
}

// 返回一个可读流
async streamChat(
  request: UnifiedStreamChatRequest,
  authToken?: string
): Promise<Readable>;
```

**调用方式**：
```typescript
const stream = await unifiedAIBridge.streamChat({
  model: 'doubao-seed-1-6-thinking-250615',
  messages: [
    { role: 'user', content: '你好' }
  ],
  stream: true
}, authToken);

stream.on('data', (chunk) => {
  console.log(chunk.toString());
});
```

### 2. 图片生成接口

```typescript
interface UnifiedImageGenerateRequest {
  model?: string;                    // 模型名称（可选）
  prompt: string;                    // 图片提示词
  n?: number;                        // 生成数量（默认1）
  size?: string;                     // 尺寸（默认1920x1920）
  quality?: string;                  // 质量（默认standard）
  logo_info?: {                      // Logo配置
    add_logo: boolean;
    [key: string]: any;
  };
}

interface UnifiedImageGenerateResponse {
  success: boolean;
  data?: {
    images: Array<{
      url: string;                   // 图片URL
      revised_prompt?: string;       // 修订后的提示词
    }>;
    usage?: {
      totalTokens: number;           // 使用的token数
      cost: number;                  // 成本
      responseTime: number;          // 响应时间
    };
  };
  error?: string;
}
```

**调用方式**：
```typescript
const result = await unifiedAIBridge.generateImage({
  model: 'doubao-seedream-4-5-251128',
  prompt: '一只可爱的卡通小猫',
  n: 1,
  size: '1920x1920',
  quality: 'standard',
  logo_info: { add_logo: false }
}, authToken);
```

### 3. 音频处理接口

```typescript
interface UnifiedAudioProcessRequest {
  model?: string;
  file: Buffer | string;             // 音频文件
  filename?: string;
  action: 'transcribe' | 'translate' | 'synthesize';
  language?: string;
  voice?: string;                    // 合成声音（仅synthesize）
  speed?: number;                    // 合成速度（仅synthesize）
}

interface UnifiedAudioProcessResponse {
  success: boolean;
  data?: {
    text?: string;                   // 识别/翻译结果
    audio_url?: string;              // 合成音频URL
    audioData?: Buffer;              // 合成音频数据
    duration?: number;               // 音频时长
    usage?: any;
  };
  error?: string;
}
```

**调用方式**：
```typescript
// 语音转文本
const result = await unifiedAIBridge.processAudio({
  action: 'transcribe',
  file: audioBuffer,
  filename: 'audio.mp3',
  language: 'zh'
}, authToken);

// 文本转语音
const result = await unifiedAIBridge.processAudio({
  action: 'synthesize',
  file: '你好，世界',
  voice: 'zh_female_cancan_mars_bigtts',
  speed: 1.0
}, authToken);
```

### 4. 视频处理接口

```typescript
interface UnifiedVideoProcessRequest {
  action: 'generate' | 'merge' | 'add_audio' | 'transcode';
  prompt?: string;                   // 生成提示词
  videoUrls?: string[];              // 视频URL列表（合并用）
  audioUrl?: string;                 // 音频URL（添加音频用）
  format?: string;                   // 转码格式
  quality?: 'low' | 'medium' | 'high';
}

interface UnifiedVideoProcessResponse {
  success: boolean;
  data?: {
    videoUrl?: string;               // 视频URL
    taskId?: string;                 // 任务ID
    status?: string;                 // 任务状态
  };
  error?: string;
}
```

### 5. 文档处理接口

```typescript
interface UnifiedDocumentRequest {
  document: Buffer;                  // 文档文件
  filename: string;
  model?: string;
  task: string;                      // 处理任务类型
  language?: string;
  format?: string;
}

interface UnifiedDocumentResponse {
  success: boolean;
  data?: {
    text?: string;                   // 提取的文本
    format?: string;                 // 文档格式
    pages?: number;                  // 页数
  };
  error?: string;
}
```

### 6. 网络搜索接口

```typescript
interface UnifiedSearchRequest {
  query: string;                     // 搜索关键词
  searchType?: 'web' | 'news' | 'image';
  maxResults?: number;               // 最大结果数
  enableAISummary?: boolean;         // 是否AI总结
  language?: string;
}

interface UnifiedSearchResponse {
  success: boolean;
  data?: {
    query: string;
    results: Array<{
      title: string;
      url: string;
      snippet: string;
      publishTime?: string;
      source?: string;
    }>;
    totalResults: number;
    searchTime: number;
    aiSummary?: string;              // AI总结
  };
  error?: string;
}
```

### 7. 模型管理接口

```typescript
interface AIModel {
  id: number;
  name: string;
  displayName: string;
  modelType: 'text' | 'image' | 'audio' | 'video';
  provider: string;
  isDefault?: boolean;
}

// 获取模型列表
async getModels(authToken?: string): Promise<AIModel[]>;

// 获取默认模型
async getDefaultModel(authToken?: string): Promise<AIModel | null>;

// 按类型获取模型
async getModelsByType(authToken: string, modelType: string): Promise<AIModel[]>;
```

---

## 🌐 域名路由逻辑

### 环境检测规则

```typescript
class UnifiedAIBridgeService {
  /**
   * 检测当前运行环境
   * @returns 'local' | 'tenant'
   */
  private detectEnvironment(): 'local' | 'tenant' {
    const hostname = process.env.HOSTNAME ||
                     process.env.HOST ||
                     'localhost';

    // 本地/Demo环境 - 使用本地AI Bridge
    const localPatterns = [
      'localhost',
      '127.0.0.1',
      'k.yyup.cc'
    ];

    if (localPatterns.includes(hostname)) {
      console.log('🔧 [环境检测] 本地/Demo环境 - 使用本地AI Bridge');
      return 'local';
    }

    // 租户域名 - k开头.yyup.cc
    const tenantPattern = /^k\d{3}\.yyup\.cc$/;
    if (tenantPattern.test(hostname)) {
      console.log('🏢 [环境检测] 租户环境 - 使用统一认证AI Bridge');
      return 'tenant';
    }

    // 默认使用本地环境
    console.log('⚠️ [环境检测] 未知域名，默认使用本地AI Bridge');
    return 'local';
  }

  /**
   * 路由AI调用到相应的Bridge
   */
  private async routeAIRequest(
    requestType: 'chat' | 'image' | 'audio' | 'video' | 'document' | 'search',
    params: any,
    authToken?: string
  ): Promise<any> {
    const env = this.detectEnvironment();

    if (env === 'tenant') {
      // 租户环境：使用统一认证AI Bridge
      return await this.callUnifiedAuth(requestType, params, authToken);
    } else {
      // 本地环境：使用本地AI Bridge
      return await this.callLocalBridge(requestType, params);
    }
  }
}
```

### 路由映射表

| 环境 | 域名模式 | AI Bridge | 数据库 | 计费 |
|------|----------|-----------|--------|------|
| 本地/Demo | localhost<br>127.0.0.1<br>k.yyup.cc | 本地AI Bridge | kargerdensales | ❌ 否 |
| 租户 | k001.yyup.cc<br>k002.yyup.cc<br>... | 统一认证AI Bridge | admin_tenant_management | ✅ 是 |

---

## 🔄 服务迁移方案

### 阶段1：创建统一AI Bridge服务

**文件**：`server/src/services/unified-ai-bridge.service.ts`

**功能**：
1. 环境检测（域名判断）
2. 请求路由（本地/统一认证）
3. 接口统一（所有AI类型）
4. 向后兼容（保留旧接口）

### 阶段2：逐步迁移服务

**优先级**：

| 优先级 | 服务 | 原因 | 迁移难度 |
|--------|------|------|----------|
| 🔴 高 | assessment/assessment-report.service.ts | 核心业务 | 低 |
| 🔴 高 | ai/video.service.ts | 高频使用 | 中 |
| 🟡 中 | ai/multimodal.service.ts | 多模态 | 中 |
| 🟡 中 | ai/auto-image-generation.service.ts | 图片生成 | 低 |
| 🟢 低 | ai/smart-assign.service.ts | 辅助功能 | 低 |
| 🟢 低 | ai/expert-consultation.service.ts | 辅助功能 | 低 |

**迁移步骤**：
1. 更新导入语句
2. 替换调用方式
3. 测试验证
4. 标记完成

### 阶段3：废弃旧服务

**条件**：
1. ✅ 所有服务已迁移
2. ✅ 测试全部通过
3. ✅ 线上稳定运行30天

**操作**：
1. 标记为 `@deprecated`
2. 添加迁移提示
3. 3个月后删除

---

## 📝 使用示例

### 基础使用

```typescript
import { unifiedAIBridge } from './unified-ai-bridge.service';

// 文本对话
const chatResult = await unifiedAIBridge.chat({
  messages: [{ role: 'user', content: '你好' }]
}, authToken);

// 图片生成
const imageResult = await unifiedAIBridge.generateImage({
  prompt: '一只可爱的小猫'
}, authToken);

// 语音转文字
const audioResult = await unifiedAIBridge.processAudio({
  action: 'transcribe',
  file: audioBuffer,
  filename: 'audio.mp3'
}, authToken);
```

### 高级使用

```typescript
// 流式对话
const stream = await unifiedAIBridge.streamChat({
  model: 'doubao-seed-1-6-thinking-250615',
  messages: [{ role: 'user', content: '写一首诗' }],
  stream: true
}, authToken);

stream.on('data', (chunk) => {
  console.log(chunk.toString());
});

// 网络搜索 + AI总结
const searchResult = await unifiedAIBridge.search({
  query: '幼儿园教育理念',
  enableAISummary: true,
  maxResults: 5
}, authToken);

console.log('AI总结:', searchResult.data.aiSummary);
```

---

## ✅ 验证清单

### 功能验证

- [ ] 本地环境使用本地AI Bridge
- [ ] 租户环境使用统一认证AI Bridge
- [ ] 文本对话（非流式）
- [ ] 文本对话（流式）
- [ ] 图片生成
- [ ] 语音转文字
- [ ] 文字转语音
- [ ] 视频生成
- [ ] 网络搜索
- [ ] 模型列表获取

### 性能验证

- [ ] 响应时间 < 5秒（文本）
- [ ] 响应时间 < 30秒（图片）
- [ ] 流式延迟 < 500ms
- [ ] 并发支持 > 10请求/秒

### 计费验证

- [ ] 租户环境调用统一认证
- [ ] 用量统计正确
- [ ] 计费数据准确

---

## 🚀 实施计划

### 第1周：创建统一服务
- [ ] 创建 `unified-ai-bridge.service.ts`
- [ ] 实现环境检测逻辑
- [ ] 实现请求路由逻辑
- [ ] 单元测试

### 第2周：迁移核心服务
- [ ] 迁移 assessment-report.service.ts
- [ ] 迁移 interactive-curriculum.service.ts
- [ ] 迁移 video.service.ts
- [ ] 集成测试

### 第3周：迁移辅助服务
- [ ] 迁移所有AI相关服务
- [ ] 代码审查
- [ ] 性能测试

### 第4周：上线验证
- [ ] 灰度发布
- [ ] 监控观察
- [ ] 全量上线

---

## 📊 预期效果

### 统一前
- 23个服务使用本地AI Bridge
- 无法统计用量
- 无法统一计费
- 配置分散

### 统一后
- 25个服务使用统一AI Bridge
- ✅ 自动统计用量
- ✅ 统一计费
- ✅ 集中管理
- ✅ 环境自适应

---

**创建时间**: 2026-01-02
**版本**: v1.0
**状态**: 待审核
