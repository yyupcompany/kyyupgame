# API参考文档

## 📋 概述

本文档详细描述了六维记忆系统与豆包1.6 Flash集成中涉及的所有API接口，包括智能概念提取服务和记忆管理系统的完整API参考。

## 🔧 智能概念提取API

### 核心服务类

#### `IntelligentConceptExtractionService`

智能概念提取服务的主要接口类，提供基于豆包1.6 Flash模型的概念分析功能。

##### 方法概览

```typescript
class IntelligentConceptExtractionService {
  // 单例获取
  public static getInstance(): IntelligentConceptExtractionService

  // 核心提取方法
  public async extractConceptsIntelligently(
    text: string,
    context?: ExtractionContext
  ): Promise<ConceptExtractionResult>

  // 批量处理
  public async batchExtractConcepts(
    texts: string[],
    context?: ExtractionContext
  ): Promise<ConceptExtractionResult[]>

  // 概念合并
  public mergeConceptResults(
    results: ConceptExtractionResult[]
  ): ConceptExtractionResult

  // 性能监控
  public getMetrics(): ExtractionMetricsSummary

  // 缓存管理
  public clearExpiredCache(): void
  public getCacheStats(): CacheStats
}
```

### 核心接口定义

#### `ExtractedConcept`

单个提取出的概念数据结构：

```typescript
interface ExtractedConcept {
  name: string;                    // 概念名称
  description: string;             // 详细描述（50-100字）
  category: string;                // 分类（教育管理、技术等）
  confidence: number;              // 置信度（0-1）
  relationships: string[];         // 相关概念列表
  examples: string[];             // 示例用法
  importance: 'high' | 'medium' | 'low';  // 重要性级别
}
```

#### `ConceptExtractionResult`

概念提取的完整结果：

```typescript
interface ConceptExtractionResult {
  concepts: ExtractedConcept[];     // 提取的概念列表
  summary: string;                  // 文本摘要
  keyTopics: string[];             // 关键主题
  sentiment: 'positive' | 'neutral' | 'negative';  // 情感倾向
  domain: string;                   // 所属领域
}
```

#### `ExtractionContext`

提取操作的上下文信息：

```typescript
interface ExtractionContext {
  userId?: string;                 // 用户ID
  conversationId?: string;          // 对话ID
  domain?: string;                 // 领域提示
  previousConcepts?: string[];      // 已有概念
}
```

### API使用示例

#### 1. 基础概念提取

```typescript
import { intelligentConceptExtraction } from './services/memory/intelligent-concept-extraction.service';

// 基础文本分析
const text = '我想了解幼儿园班级管理的最佳实践';
const result = await intelligentConceptExtraction.extractConceptsIntelligently(text);

console.log('提取的概念:', result.concepts);
console.log('分析领域:', result.domain);
console.log('关键主题:', result.keyTopics);
```

#### 2. 带上下文的概念提取

```typescript
// 带用户上下文的分析
const result = await intelligentConceptExtraction.extractConceptsIntelligently(
  text,
  {
    userId: 'user-123',
    domain: 'education',
    previousConcepts: ['幼儿园', '班级管理']
  }
);
```

#### 3. 批量概念提取

```typescript
// 批量处理多个文本
const texts = [
  '如何提高幼儿园教学质量',
  '游戏化教学的优势',
  '家园合作的重要性'
];

const batchResults = await intelligentConceptExtraction.batchExtractConcepts(
  texts,
  { userId: 'user-123' }
);

batchResults.forEach((result, index) => {
  console.log(`文本${index + 1}的概念:`, result.concepts);
});
```

#### 4. 概念结果合并

```typescript
// 合并多个提取结果
const mergedResult = intelligentConceptExtraction.mergeConceptResults(batchResults);

console.log('合并后的概念数量:', mergedResult.concepts.length);
console.log('综合关键主题:', mergedResult.keyTopics);
```

## 🧠 六维记忆系统API

### 核心服务类

#### `SixDimensionMemorySystem`

六维记忆系统的主要接口类，管理所有类型的记忆数据。

##### 主要方法

```typescript
class SixDimensionMemorySystem {
  // 构造函数
  constructor(userId?: string, config?: MemorySystemConfig)

  // 对话记录（自动触发概念提取）
  public async recordConversation(
    actor: 'user' | 'assistant',
    message: string,
    context?: ConversationContext
  ): Promise<EpisodicEvent>

  // 记忆上下文构建
  public async getMemoryContext(
    userId: string,
    query?: string,
    options?: ContextOptions
  ): Promise<MemoryContext>

  // 概念搜索
  public async searchConcepts(
    query: string,
    limit?: number,
    userId?: string
  ): Promise<SemanticMemory[]>

  // 通用记忆操作
  public async storeMemory(
    type: MemoryType,
    data: MemoryData,
    options?: MemoryOptions
  ): Promise<MemoryResponse>

  public async retrieveMemory(
    type: MemoryType,
    query: MemoryQuery,
    options?: RetrievalOptions
  ): Promise<MemoryResponse[]>
}
```

### 记忆类型接口

#### `ConversationContext`

对话记录的上下文信息：

```typescript
interface ConversationContext {
  userId: string;                  // 用户ID
  conversationId?: string;          // 对话ID
  sessionId?: string;              // 会话ID
  timestamp?: Date;               // 时间戳
  metadata?: Record<string, any>;  // 额外元数据
}
```

#### `MemoryContext`

记忆上下文的完整结构：

```typescript
interface MemoryContext {
  userId: string;                  // 用户ID
  recentConversations: EpisodicEvent[];    // 最近对话
  relevantConcepts: SemanticMemory[];      // 相关概念
  keyEntities: CoreMemory[];               // 关键实体
  proceduralContext: ProceduralMemory[];   // 程序性上下文
  resourceLinks: ResourceMemory[];         // 资源链接
  knowledgeHighlights: KnowledgeVault[];   // 知识要点
  summary: string;                          // 上下文摘要
  relevanceScore: number;                   // 相关性评分
  totalMemories: number;                    // 记忆总数
}
```

#### `ContextOptions`

记忆上下文检索选项：

```typescript
interface ContextOptions {
  timeWindow?: number;            // 时间窗口（小时）
  maxConversations?: number;      // 最大对话数量
  conceptLimit?: number;          // 概念数量限制
  includeProcedural?: boolean;    // 包含程序性记忆
  includeResources?: boolean;     // 包含资源记忆
  includeKnowledge?: boolean;     // 包含知识库
  relevanceThreshold?: number;    // 相关性阈值
}
```

### API使用示例

#### 1. 记录对话（自动概念提取）

```typescript
import { sixDimensionMemorySystem } from './services/memory/six-dimension-memory.service';

const memorySystem = new SixDimensionMemorySystem();

// 记录用户消息（会自动触发智能概念提取）
await memorySystem.recordConversation(
  'user',
  '我想了解幼儿园班级管理的最佳实践',
  {
    userId: 'user-123',
    conversationId: 'conv-001',
    sessionId: 'session-001',
    timestamp: new Date()
  }
);

// 记录AI回复
await memorySystem.recordConversation(
  'assistant',
  '班级管理是幼儿教育中的重要环节...',
  {
    userId: 'user-123',
    conversationId: 'conv-001',
    sessionId: 'session-001'
  }
);
```

#### 2. 获取记忆上下文

```typescript
// 为AI对话构建记忆上下文
const context = await memorySystem.getMemoryContext(
  'user-123',
  '班级管理',
  {
    timeWindow: 24,        // 最近24小时
    maxConversations: 10,   // 最近10条对话
    conceptLimit: 20,      // 最多20个概念
    relevanceThreshold: 0.6
  }
);

console.log('上下文摘要:', context.summary);
console.log('相关概念数量:', context.relevantConcepts.length);
console.log('最近对话:', context.recentConversations.length);
```

#### 3. 概念搜索

```typescript
// 搜索特定概念
const concepts = await memorySystem.searchConcepts(
  '班级管理',
  10,  // 最多返回10个结果
  'user-123'
);

concepts.forEach(concept => {
  console.log('概念名称:', concept.name);
  console.log('概念描述:', concept.description);
  console.log('相关关系:', concept.relationships);
  console.log('置信度:', concept.metadata?.confidence);
});
```

#### 4. 自定义记忆存储

```typescript
// 存储程序性记忆
await memorySystem.storeMemory('procedural', {
  name: '班级管理流程',
  description: '标准化的班级管理工作流程',
  steps: [
    '晨间接待',
    '活动安排',
    '行为观察',
    '家园沟通'
  ],
  category: '管理流程'
}, {
  userId: 'user-123',
  tags: ['管理', '流程', '班级'],
  priority: 'high'
});

// 存储资源记忆
await memorySystem.storeMemory('resource', {
  name: '班级管理指南',
  type: 'document',
  url: '/resources/class-management-guide.pdf',
  description: '详细的班级管理操作指南'
}, {
  userId: 'user-123',
  tags: ['指南', '文档', '管理']
});
```

## 🔄 集成API

### AI Bridge集成

#### `buildMemoryContext` 方法

AI Bridge服务中的记忆上下文构建方法：

```typescript
public async buildMemoryContext(
  userId: string,
  query?: string
): Promise<string>
```

**功能**: 为AI对话构建结构化的记忆上下文字符串

**参数**:
- `userId`: 用户ID
- `query`: 可选的查询关键词

**返回**: 格式化的记忆上下文字符串

#### 使用示例

```typescript
import { aiBridgeService } from './services/ai/bridge/ai-bridge.service';

// 构建AI对话的记忆上下文
const memoryContext = await aiBridgeService.buildMemoryContext(
  'user-123',
  '班级管理'
);

// 在AI对话中使用上下文
const aiResponse = await aiBridgeService.generateFastChatCompletion({
  model: 'doubao-seed-1-6-flash-250715',
  messages: [
    {
      role: 'system',
      content: `你是一个专业的教育顾问。以下是相关的历史上下文：\n\n${memoryContext}`
    },
    {
      role: 'user',
      content: '请给我一些班级管理的建议'
    }
  ]
});
```

## 📊 监控和分析API

### 性能指标

#### `ExtractionMetricsSummary`

概念提取的性能统计：

```typescript
interface ExtractionMetricsSummary {
  totalExtractions: number;        // 总提取次数
  averageProcessingTime: number;   // 平均处理时间
  averageConceptsPerText: number;  // 每个文本平均概念数
  successRate: number;             // 成功率
  aiUsageRate: number;             // AI使用率
}
```

#### 使用示例

```typescript
// 获取性能指标
const metrics = await intelligentConceptExtraction.getMetrics();

console.log('总提取次数:', metrics.totalExtractions);
console.log('平均处理时间:', `${metrics.averageProcessingTime}ms`);
console.log('成功率:', `${(metrics.successRate * 100).toFixed(1)}%`);
console.log('AI使用率:', `${(metrics.aiUsageRate * 100).toFixed(1)}%`);
```

### 缓存统计

#### `CacheStats`

缓存系统的统计信息：

```typescript
interface CacheStats {
  totalEntries: number;    // 总缓存条目
  expiredEntries: number;  // 过期条目
  hitRate: number;         // 命中率
}
```

#### 使用示例

```typescript
// 获取缓存统计
const cacheStats = intelligentConceptExtraction.getCacheStats();

console.log('缓存条目总数:', cacheStats.totalEntries);
console.log('过期条目数:', cacheStats.expiredEntries);
console.log('缓存命中率:', `${(cacheStats.hitRate * 100).toFixed(1)}%`);

// 清理过期缓存
intelligentConceptExtraction.clearExpiredCache();
```

## 🛡️ 错误处理

### 常见错误类型

#### 概念提取错误

```typescript
try {
  const result = await intelligentConceptExtraction.extractConceptsIntelligently(text);
} catch (error) {
  if (error.message.includes('请求频率过高')) {
    // 处理频率限制
    console.log('请求过于频繁，请稍后再试');
  } else if (error.message.includes('输入文本验证失败')) {
    // 处理输入验证错误
    console.log('输入文本不符合要求');
  } else {
    // 其他错误
    console.log('概念提取失败:', error.message);
  }
}
```

#### 记忆系统错误

```typescript
try {
  await memorySystem.recordConversation('user', message, context);
} catch (error) {
  if (error.message.includes('数据库连接失败')) {
    // 处理数据库错误
    console.log('数据库连接异常');
  } else if (error.message.includes('权限验证失败')) {
    // 处理权限错误
    console.log('没有权限访问该用户数据');
  } else {
    // 其他错误
    console.log('记忆记录失败:', error.message);
  }
}
```

## 📝 配置选项

### 智能概念提取配置

```typescript
// 模型配置
interface AIModelConfig {
  name: string;              // 模型名称
  displayName: string;       // 显示名称
  provider: string;          // 提供商
  maxTokens: number;         // 最大令牌数
  temperature: number;       // 温度参数
  status: 'active' | 'inactive';  // 状态
}
```

### 记忆系统配置

```typescript
// 记忆系统配置
interface MemorySystemConfig {
  timeWindow: number;        // 默认时间窗口
  maxResults: number;        // 默认最大结果数
  relevanceThreshold: number; // 相关性阈值
  enableCaching: boolean;    // 启用缓存
  batchSize: number;         // 批处理大小
}
```

## 🔗 外部依赖

### AI Bridge服务

智能概念提取服务依赖于AI Bridge服务来调用豆包1.6 Flash模型：

```typescript
import { aiBridgeService } from '../ai/bridge/ai-bridge.service';

// 在概念提取服务中使用的AI Bridge方法
const response = await aiBridgeService.generateFastChatCompletion({
  model: 'doubao-seed-1-6-flash-250715',
  messages: [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: userPrompt
    }
  ],
  temperature: 0.3,
  max_tokens: 2000
});
```

### 数据库模型

系统依赖以下Sequelize模型：

- `SemanticMemory` - 语义记忆
- `EpisodicMemory` - 情节记忆
- `CoreMemory` - 核心记忆
- `ProceduralMemory` - 程序性记忆
- `ResourceMemory` - 资源记忆
- `KnowledgeVault` - 知识库
- `AIModelConfig` - AI模型配置

---

**📚 更多使用示例和高级功能，请参考 examples/ 目录中的示例代码。**