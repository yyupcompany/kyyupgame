# AI服务架构指南

**文档版本**: v1.0  
**创建时间**: 2025-10-05  
**适用范围**: AI助手后端服务  

---

## 📋 概览

本文档描述了AI助手后端服务的架构设计，包括服务拆分、职责划分、接口定义等。

### 架构原则
1. **单一职责** - 每个服务只负责一个明确的功能
2. **松耦合** - 服务之间通过接口通信，减少依赖
3. **高内聚** - 相关功能集中在同一服务中
4. **可测试** - 每个服务都可以独立测试
5. **可扩展** - 易于添加新功能和新服务

---

## 🏗️ 服务架构

### 核心服务层

```
┌─────────────────────────────────────────────────────────┐
│         UnifiedIntelligenceService (协调器)              │
│              统一智能决策中心                              │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼───────┐  ┌───────▼────────┐
│ Intent         │  │ Prompt       │  │ Tool           │
│ Recognition    │  │ Builder      │  │ Orchestrator   │
│ 意图识别        │  │ 提示词构建    │  │ 工具编排        │
└────────────────┘  └──────────────┘  └────────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼───────┐  ┌───────▼────────┐
│ MultiRound     │  │ Memory       │  │ Streaming      │
│ Chat           │  │ Integration  │  │ 流式处理        │
│ 多轮对话        │  │ 记忆集成      │  │                │
└────────────────┘  └──────────────┘  └────────────────┘
```

---

## 📦 服务详解

### 1. IntentRecognitionService
**文件**: `server/src/services/ai-operator/core/intent-recognition.service.ts`

**职责**: 识别用户意图和评估任务复杂度

**核心功能**:
- 识别9种意图类型（导航、查询、操作、分析、创建、修改、删除、对话、未知）
- 评估3级任务复杂度（简单、中等、复杂）
- 识别8种工具能力
- 提取关键词和实体
- 计算置信度

**接口**:
```typescript
interface IntentRecognitionService {
  recognizeIntent(query: string, context?: any): Promise<IntentAnalysisResult>;
  requiresTools(analysis: IntentAnalysisResult): boolean;
}
```

**使用示例**:
```typescript
const analysis = await intentRecognitionService.recognizeIntent(
  "查询最近的活动",
  { userRole: 'admin' }
);

console.log(analysis.intent); // 'query'
console.log(analysis.complexity); // 'simple'
console.log(analysis.requiredCapabilities); // ['database_query']
```

---

### 2. PromptBuilderService
**文件**: `server/src/services/ai-operator/core/prompt-builder.service.ts`

**职责**: 构建和管理AI提示词

**核心功能**:
- 构建系统提示词
- 构建用户提示词
- 集成记忆上下文
- 集成页面上下文
- 集成工具说明
- 多轮对话支持

**接口**:
```typescript
interface PromptBuilderService {
  buildSystemPrompt(context: PromptContext): string;
  buildUserPrompt(content: string, context?: PromptContext): string;
  buildMultiRoundPrompt(...): string;
}
```

**使用示例**:
```typescript
const systemPrompt = promptBuilderService.buildSystemPrompt({
  userRole: 'admin',
  memoryContext: memories,
  tools: availableTools
});
```

---

### 3. ToolOrchestratorService
**文件**: `server/src/services/ai-operator/core/tool-orchestrator.service.ts`

**职责**: 工具选择、编排和执行

**核心功能**:
- 工具注册管理
- 根据意图选择工具
- 确定执行顺序
- 执行工具链
- 统计和格式化结果

**接口**:
```typescript
interface ToolOrchestratorService {
  registerTool(tool: Tool): void;
  orchestrateTools(intentAnalysis, query): Promise<ToolExecutionPlan>;
  executeToolChain(plan, context): Promise<ToolExecutionResult[]>;
}
```

**使用示例**:
```typescript
// 注册工具
toolOrchestratorService.registerTool(databaseQueryTool);

// 编排工具
const plan = await toolOrchestratorService.orchestrateTools(
  intentAnalysis,
  "查询学生列表"
);

// 执行工具链
const results = await toolOrchestratorService.executeToolChain(
  plan,
  { userId: '123' }
);
```

---

### 4. StreamingService
**文件**: `server/src/services/ai-operator/core/streaming.service.ts`

**职责**: SSE流式响应处理

**核心功能**:
- SSE连接管理
- 流式发送AI响应
- 发送各类事件
- 心跳机制
- 连接维护

**接口**:
```typescript
interface StreamingService {
  initializeSSE(res: any): void;
  sendSSE(res: any, event: string, data: any): void;
  streamAIResponse(res, aiStream, options): Promise<void>;
  createStreamWrapper(res): StreamWrapper;
}
```

**使用示例**:
```typescript
// 初始化SSE
streamingService.initializeSSE(res);

// 创建包装器
const stream = streamingService.createStreamWrapper(res);

// 发送进度
stream.progress(1, 10, '正在处理...');

// 发送完成
stream.complete({ message: '处理完成' });
```

---

### 5. MultiRoundChatService
**文件**: `server/src/services/ai-operator/core/multi-round-chat.service.ts`

**职责**: 多轮对话状态管理

**核心功能**:
- 初始化对话上下文
- 管理轮次状态
- 记录消息和工具调用
- 判断是否继续
- 生成对话摘要

**接口**:
```typescript
interface MultiRoundChatService {
  initializeContext(conversationId, userId, maxRounds?): MultiRoundContext;
  startRound(conversationId, userMessage): ChatRound;
  shouldContinue(conversationId): boolean;
  getHistory(conversationId): ChatRound[];
}
```

**使用示例**:
```typescript
// 初始化上下文
const context = multiRoundChatService.initializeContext(
  'conv-123',
  'user-456',
  20
);

// 开始新轮次
const round = multiRoundChatService.startRound(
  'conv-123',
  '查询学生列表'
);

// 判断是否继续
if (multiRoundChatService.shouldContinue('conv-123')) {
  // 继续下一轮
}
```

---

### 6. MemoryIntegrationService
**文件**: `server/src/services/ai-operator/core/memory-integration.service.ts`

**职责**: 六维记忆集成

**核心功能**:
- 多维度并行检索
- 相关性排序
- 多种格式化选项
- 记忆过滤
- 统计分析

**接口**:
```typescript
interface MemoryIntegrationService {
  retrieveMemoryContext(query, userId, options?): Promise<MemoryContext>;
  formatMemoryContext(context): string;
  filterMemories(context, filters): MemoryContext;
}
```

**使用示例**:
```typescript
// 检索记忆
const memoryContext = await memoryIntegrationService.retrieveMemoryContext(
  "查询学生",
  "user-123",
  { dimensions: ['core', 'episodic'], limit: 5 }
);

// 格式化为文本
const formatted = memoryIntegrationService.formatMemoryContext(memoryContext);
```

---

## 🔄 服务协作流程

### 典型请求处理流程

```
1. 用户请求 → UnifiedIntelligenceService
                    ↓
2. 意图识别 → IntentRecognitionService
                    ↓
3. 记忆检索 → MemoryIntegrationService
                    ↓
4. 提示词构建 → PromptBuilderService
                    ↓
5. 工具编排 → ToolOrchestratorService
                    ↓
6. 多轮对话 → MultiRoundChatService
                    ↓
7. 流式响应 → StreamingService
                    ↓
8. 返回结果 → 用户
```

---

## 📊 性能指标

### 服务性能要求

| 服务 | 响应时间 | 并发能力 | 错误率 |
|------|---------|---------|--------|
| IntentRecognition | <50ms | 1000/s | <0.1% |
| PromptBuilder | <20ms | 2000/s | <0.1% |
| ToolOrchestrator | <100ms | 500/s | <1% |
| Streaming | <10ms | 1000/s | <0.1% |
| MultiRoundChat | <30ms | 1000/s | <0.1% |
| MemoryIntegration | <200ms | 500/s | <1% |

---

## 🧪 测试策略

### 单元测试
每个服务都应该有完整的单元测试，覆盖率目标80%+。

### 集成测试
测试服务之间的协作流程。

### 性能测试
验证服务在高并发下的表现。

---

## 📚 最佳实践

### 1. 服务使用
- 总是使用单例实例
- 避免直接修改服务状态
- 使用TypeScript类型检查

### 2. 错误处理
- 捕获所有异常
- 记录详细日志
- 返回友好错误信息

### 3. 性能优化
- 避免重复计算
- 使用缓存（适当场景）
- 并行处理独立任务

---

**文档维护**: 随服务更新同步更新  
**反馈渠道**: 提交Issue或PR

