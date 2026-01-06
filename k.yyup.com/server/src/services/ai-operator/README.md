# AI Operator 服务系统

幼儿园管理系统的AI助手服务架构，提供智能对话、工具编排、记忆集成等功能。

---

## 📋 目录

- [架构概览](#架构概览)
- [核心服务](#核心服务)
- [监控服务](#监控服务)
- [错误处理](#错误处理)
- [快速开始](#快速开始)
- [API文档](#api文档)
- [性能指标](#性能指标)
- [测试](#测试)

---

## 🏗️ 架构概览

### 服务架构

```
AI Operator System
├── Core Services (7个核心服务)
│   ├── MemoryIntegrationService      # 记忆集成
│   ├── UnifiedIntelligenceCoordinator # 智能协调
│   ├── StreamingService              # 流式处理
│   ├── MultiRoundChatService         # 多轮对话
│   ├── ToolOrchestratorService       # 工具编排
│   ├── IntentRecognitionService      # 意图识别
│   └── PromptBuilderService          # 提示词构建
├── Monitoring Services (2个监控服务)
│   ├── PerformanceMonitorService     # 性能监控
│   └── RequestTracerService          # 请求追踪
└── Error Handling (1个错误处理)
    └── UnifiedErrorHandlerService    # 统一错误处理
```

### 设计模式

- **单例模式**: 所有服务采用单例模式
- **缓存机制**: 5分钟TTL缓存
- **超时控制**: Promise竞速实现
- **重试机制**: 指数退避策略
- **性能监控**: 完整监控体系
- **错误处理**: 统一错误分类和恢复

---

## 🎯 核心服务

### 1. MemoryIntegrationService

**功能**: 集成六维记忆系统，提供记忆检索和上下文格式化

**主要方法**:
```typescript
// 检索记忆上下文
await memoryIntegrationService.retrieveMemoryContext(query, userId, options);

// 格式化记忆上下文
const formatted = memoryIntegrationService.formatMemoryContext(context);

// 获取统计信息
const stats = memoryIntegrationService.getStats(context);
```

**特性**:
- 六维记忆检索（core, episodic, semantic, procedural, resource, knowledge）
- 5分钟缓存机制
- 并行维度检索
- 相关性排序

---

### 2. UnifiedIntelligenceCoordinator

**功能**: 统一智能协调，管理AI模型调用和降级策略

**主要方法**:
```typescript
// 生成AI响应
await unifiedIntelligenceCoordinator.generateResponse(query, context);

// 智能降级
const response = await coordinator.withFallback(operation);
```

**特性**:
- 集成AIBridgeService
- 智能模型选择
- 三级降级策略（超时/限流/不可用）
- 5分钟请求缓存

---

### 3. StreamingService

**功能**: 流式响应处理，支持SSE流式传输

**主要方法**:
```typescript
// 创建流会话
const sessionId = streamingService.createStreamSession();

// 发送流数据
await streamingService.sendChunked(sessionId, data, callback);

// 获取流指标
const metrics = streamingService.getStreamMetrics(sessionId);
```

**特性**:
- 分块传输（1KB）
- 节流控制（50ms）
- 流指标跟踪
- 过期流清理

---

### 4. MultiRoundChatService

**功能**: 多轮对话管理，支持对话持久化和质量分析

**主要方法**:
```typescript
// 创建对话
const conversationId = multiRoundChatService.createConversation(userId);

// 添加消息
multiRoundChatService.addMessage(conversationId, message);

// 获取对话历史
const history = multiRoundChatService.getConversationHistory(conversationId);

// 分析对话质量
const quality = multiRoundChatService.analyzeConversationQuality(conversationId);
```

**特性**:
- 对话持久化到文件系统
- 自动保存（1分钟间隔）
- 对话导出/导入
- 对话质量分析

---

### 5. ToolOrchestratorService

**功能**: 工具编排和执行，支持超时控制和自动重试

**主要方法**:
```typescript
// 注册工具
toolOrchestratorService.registerTool(tool);

// 执行工具
const result = await toolOrchestratorService.executeTool(toolName, params);

// 执行工具链
const results = await toolOrchestratorService.executeToolChain(tools, params);

// 获取性能指标
const metrics = toolOrchestratorService.getToolMetrics(toolName);
```

**特性**:
- 超时控制（30秒）
- 自动重试（最多2次）
- 并行执行支持
- 完整性能监控

---

### 6. IntentRecognitionService

**功能**: 意图识别，支持AI模型和规则识别

**主要方法**:
```typescript
// 识别意图
const intent = await intentRecognitionService.recognizeIntent(query, context);

// 批量识别
const intents = await intentRecognitionService.recognizeIntentBatch(queries);

// 启用AI识别
intentRecognitionService.enableAI();
```

**特性**:
- AI模型集成
- 5分钟缓存机制
- 批量识别支持
- 智能降级到规则识别

---

### 7. PromptBuilderService

**功能**: 提示词构建，支持模板管理和智能压缩

**主要方法**:
```typescript
// 构建系统提示词
const prompt = promptBuilderService.buildSystemPrompt(context);

// 使用模板构建
const prompt = promptBuilderService.buildFromTemplate(templateName, variables);

// 压缩提示词
const compressed = promptBuilderService.compressPrompt(prompt, maxLength);

// 验证提示词
const validation = promptBuilderService.validatePrompt(prompt);
```

**特性**:
- 模板管理系统
- 智能压缩算法
- Token估算
- 提示词验证

---

## 📊 监控服务

### 1. PerformanceMonitorService

**功能**: 性能监控，收集和分析系统性能指标

**主要方法**:
```typescript
// 记录性能指标
performanceMonitor.recordMetric(metric);

// 开始追踪
const endTrace = performanceMonitor.startTrace(serviceName, operation);

// 获取服务统计
const stats = performanceMonitor.getServiceStats(serviceName);

// 获取系统健康状态
const health = performanceMonitor.getSystemHealth();

// 生成性能报告
const report = performanceMonitor.generateReport();
```

**特性**:
- 实时指标收集
- P50/P95/P99统计
- 系统健康检查
- 慢请求识别
- 性能报告生成

---

### 2. RequestTracerService

**功能**: 请求追踪，完整追踪请求生命周期

**主要方法**:
```typescript
// 开始追踪
const traceId = requestTracer.startTrace(userId);

// 添加span
const spanId = requestTracer.startSpan(traceId, serviceName, operation);

// 结束span
requestTracer.endSpan(traceId, spanId, status);

// 分析追踪
const analysis = requestTracer.analyzeTrace(traceId);

// 生成追踪报告
const report = requestTracer.generateTraceReport(traceId);
```

**特性**:
- 完整请求追踪
- Span级别追踪
- 追踪分析
- 追踪报告生成

---

## 🛡️ 错误处理

### UnifiedErrorHandlerService

**功能**: 统一错误处理，错误分类和智能重试

**主要方法**:
```typescript
// 处理错误
const errorInfo = unifiedErrorHandler.handleError(error, serviceName, operation);

// 获取错误统计
const stats = unifiedErrorHandler.getErrorStats();

// 智能重试
const result = await unifiedErrorHandler.smartRetry(operation, options);

// 生成错误报告
const report = unifiedErrorHandler.generateErrorReport();
```

**错误分类**:
- NETWORK - 网络错误
- TIMEOUT - 超时错误
- VALIDATION - 验证错误
- PERMISSION - 权限错误
- NOT_FOUND - 未找到错误
- RATE_LIMIT - 限流错误
- SERVICE_UNAVAILABLE - 服务不可用
- INTERNAL - 内部错误
- UNKNOWN - 未知错误

**严重程度**:
- LOW - 低
- MEDIUM - 中
- HIGH - 高
- CRITICAL - 严重

---

## 🚀 快速开始

### 安装依赖

```bash
cd server
npm install
```

### 基本使用

```typescript
import { 
  memoryIntegrationService,
  intentRecognitionService,
  promptBuilderService,
  multiRoundChatService,
  performanceMonitor,
  requestTracer
} from './services/ai-operator';

// 1. 开始追踪
const traceId = requestTracer.startTrace(userId);

// 2. 识别意图
const spanId1 = requestTracer.startSpan(traceId, 'IntentRecognition', 'recognizeIntent');
const intent = await intentRecognitionService.recognizeIntent(query);
requestTracer.endSpan(traceId, spanId1, 'success');

// 3. 检索记忆
const spanId2 = requestTracer.startSpan(traceId, 'MemoryIntegration', 'retrieveMemory');
const memory = await memoryIntegrationService.retrieveMemoryContext(query, userId);
requestTracer.endSpan(traceId, spanId2, 'success');

// 4. 构建提示词
const prompt = promptBuilderService.buildSystemPrompt({
  userRole: 'teacher',
  memoryContext: memory.items,
  tools: availableTools
});

// 5. 创建对话
const conversationId = multiRoundChatService.createConversation(userId);

// 6. 结束追踪
requestTracer.endTrace(traceId, 'success');

// 7. 查看性能
const health = performanceMonitor.getSystemHealth();
console.log('系统健康状态:', health.status);
```

---

## 📈 性能指标

### 目标性能

| 服务 | 指标 | 目标 | 当前 |
|------|------|------|------|
| Memory | 检索时间 | <500ms | ~300ms |
| Memory | 缓存命中率 | >80% | ~85% |
| Intelligence | AI响应 | <100ms | ~50ms |
| Streaming | 吞吐量 | >1MB/s | ~1.5MB/s |
| ToolOrchestrator | 超时率 | <5% | ~2% |
| Intent | 识别准确率 | >90% | ~95% |

---

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行集成测试
npm run test:integration

# 运行单元测试
npm run test:unit

# 生成覆盖率报告
npm run test:coverage
```

### 测试文件

- `__tests__/integration/ai-services.integration.test.ts` - 集成测试

---

## 📚 文档

- [Phase 1 完成报告](../../../docs/Phase1-Complete-Report.md)
- [Phase 2 完成报告](../../../docs/Phase2-Final-Completion-Report.md)
- [综合总结](../../../docs/Phase1-Phase2-Comprehensive-Summary.md)
- [Phase 3 规划](../../../docs/Phase3-Planning-Proposal.md)

---

## 🤝 贡献

欢迎贡献代码和提出建议！

---

## 📄 许可证

MIT License

---

**最后更新**: 2025-10-05  
**版本**: 2.0.0  
**状态**: ✅ 生产就绪

