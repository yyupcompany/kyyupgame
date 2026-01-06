# AI Operator 使用示例

本文档提供AI Operator系统的实际使用示例，帮助开发者快速上手。

---

## 📋 目录

- [基础示例](#基础示例)
- [高级示例](#高级示例)
- [完整流程示例](#完整流程示例)
- [错误处理示例](#错误处理示例)
- [性能监控示例](#性能监控示例)

---

## 🚀 基础示例

### 示例1: 简单的意图识别

```typescript
import { intentRecognitionService } from './core/intent-recognition.service';

async function recognizeUserIntent() {
  // 识别用户意图
  const result = await intentRecognitionService.recognizeIntent(
    '查询学生信息',
    { userRole: 'teacher' }
  );

  console.log('意图类型:', result.intent);
  console.log('复杂度:', result.complexity);
  console.log('置信度:', result.confidence);
  console.log('关键词:', result.keywords);
}
```

**输出**:
```
意图类型: query
复杂度: simple
置信度: 0.95
关键词: ['查询', '学生', '信息']
```

---

### 示例2: 构建提示词

```typescript
import { promptBuilderService } from './core/prompt-builder.service';

function buildPrompt() {
  // 构建系统提示词
  const systemPrompt = promptBuilderService.buildSystemPrompt({
    userRole: 'teacher',
    tools: [
      { name: 'queryStudent', description: '查询学生信息' },
      { name: 'updateGrade', description: '更新成绩' }
    ]
  });

  console.log(systemPrompt);
}
```

**输出**:
```
你是YY-AI智能助手，专业的幼儿园管理AI助手。

## 📋 基本信息
- 当前日期: 2025-10-05
- 用户角色: teacher
- 系统: 幼儿园管理系统

## 🔧 可用工具
你可以使用以下工具来完成任务：

1. **queryStudent**: 查询学生信息
2. **updateGrade**: 更新成绩
...
```

---

### 示例3: 创建多轮对话

```typescript
import { multiRoundChatService } from './core/multi-round-chat.service';

async function createConversation() {
  // 创建对话
  const conversationId = multiRoundChatService.createConversation('user123');

  // 添加用户消息
  multiRoundChatService.addMessage(conversationId, {
    role: 'user',
    content: '你好，我想查询学生信息'
  });

  // 添加助手回复
  multiRoundChatService.addMessage(conversationId, {
    role: 'assistant',
    content: '好的，请告诉我学生的姓名或学号'
  });

  // 获取对话历史
  const history = multiRoundChatService.getConversationHistory(conversationId);
  console.log('对话历史:', history);
}
```

---

### 示例4: 检索记忆上下文

```typescript
import { memoryIntegrationService } from './core/memory-integration.service';

async function retrieveMemory() {
  // 检索记忆
  const context = await memoryIntegrationService.retrieveMemoryContext(
    '学生成绩',
    'user123',
    {
      dimensions: ['episodic', 'semantic'],
      limit: 5,
      minRelevance: 0.7
    }
  );

  console.log('记忆数量:', context.items.length);
  console.log('维度:', context.dimensions);

  // 格式化记忆
  const formatted = memoryIntegrationService.formatMemoryContext(context);
  console.log(formatted);
}
```

---

## 🎯 高级示例

### 示例5: 工具编排和执行

```typescript
import { toolOrchestratorService } from './core/tool-orchestrator.service';

async function orchestrateTools() {
  // 注册工具
  toolOrchestratorService.registerTool({
    name: 'queryStudent',
    description: '查询学生信息',
    parameters: { studentId: 'string' },
    execute: async (params) => {
      // 模拟查询
      return {
        id: params.studentId,
        name: '张三',
        grade: '大班'
      };
    }
  });

  toolOrchestratorService.registerTool({
    name: 'getGrades',
    description: '获取成绩',
    parameters: { studentId: 'string' },
    execute: async (params) => {
      return {
        math: 95,
        chinese: 90,
        english: 88
      };
    }
  });

  // 执行工具链
  const results = await toolOrchestratorService.executeToolChain([
    { name: 'queryStudent', params: { studentId: '001' } },
    { name: 'getGrades', params: { studentId: '001' } }
  ]);

  console.log('执行结果:', results);
}
```

---

### 示例6: 流式响应

```typescript
import { streamingService } from './core/streaming.service';

async function streamResponse() {
  // 创建流会话
  const sessionId = streamingService.createStreamSession();

  // 模拟流式数据
  const data = '这是一个很长的响应内容，需要分块传输...';

  // 发送分块数据
  await streamingService.sendChunked(
    sessionId,
    data,
    (chunk) => {
      console.log('收到数据块:', chunk);
    },
    {
      chunkSize: 10,
      throttleMs: 100
    }
  );

  // 获取流指标
  const metrics = streamingService.getStreamMetrics(sessionId);
  console.log('流指标:', metrics);
}
```

---

### 示例7: 使用模板构建提示词

```typescript
import { promptBuilderService } from './core/prompt-builder.service';

function useTemplate() {
  // 注册自定义模板
  promptBuilderService.registerTemplate({
    name: 'student_query',
    template: `你是一个学生信息查询助手。

当前查询: {{query}}
用户角色: {{userRole}}
可用操作: {{actions}}

请根据用户的查询提供准确的信息。`,
    variables: ['query', 'userRole', 'actions']
  });

  // 使用模板
  const prompt = promptBuilderService.buildFromTemplate('student_query', {
    query: '查询张三的成绩',
    userRole: '教师',
    actions: '查询、导出'
  });

  console.log(prompt);
}
```

---

## 🔄 完整流程示例

### 示例8: 完整的AI对话流程

```typescript
import {
  requestTracer,
  performanceMonitor,
  intentRecognitionService,
  memoryIntegrationService,
  promptBuilderService,
  multiRoundChatService,
  toolOrchestratorService,
  unifiedErrorHandler
} from './services/ai-operator';

async function completeAIFlow(userId: string, query: string) {
  // 1. 开始追踪
  const traceId = requestTracer.startTrace(userId);
  const startTime = Date.now();

  try {
    // 2. 识别意图
    const spanId1 = requestTracer.startSpan(traceId, 'IntentRecognition', 'recognizeIntent');
    const intent = await intentRecognitionService.recognizeIntent(query);
    requestTracer.endSpan(traceId, spanId1, 'success');
    
    console.log('✅ 意图识别完成:', intent.intent);

    // 3. 检索记忆
    const spanId2 = requestTracer.startSpan(traceId, 'MemoryIntegration', 'retrieveMemory');
    const memory = await memoryIntegrationService.retrieveMemoryContext(query, userId, {
      limit: 5,
      minRelevance: 0.6
    });
    requestTracer.endSpan(traceId, spanId2, 'success');
    
    console.log('✅ 记忆检索完成:', memory.items.length, '条');

    // 4. 构建提示词
    const spanId3 = requestTracer.startSpan(traceId, 'PromptBuilder', 'buildPrompt');
    const systemPrompt = promptBuilderService.buildSystemPrompt({
      userRole: 'teacher',
      memoryContext: memory.items,
      tools: toolOrchestratorService.getAllTools()
    });
    requestTracer.endSpan(traceId, spanId3, 'success');
    
    console.log('✅ 提示词构建完成');

    // 5. 创建对话
    const spanId4 = requestTracer.startSpan(traceId, 'MultiRoundChat', 'createConversation');
    const conversationId = multiRoundChatService.createConversation(userId);
    multiRoundChatService.addMessage(conversationId, {
      role: 'user',
      content: query
    });
    requestTracer.endSpan(traceId, spanId4, 'success');
    
    console.log('✅ 对话创建完成:', conversationId);

    // 6. 执行工具（如果需要）
    if (intent.requiredCapabilities.includes('tool_execution')) {
      const spanId5 = requestTracer.startSpan(traceId, 'ToolOrchestrator', 'executeTool');
      const toolResult = await toolOrchestratorService.executeTool('queryStudent', {
        query: query
      });
      requestTracer.endSpan(traceId, spanId5, 'success');
      
      console.log('✅ 工具执行完成:', toolResult);
    }

    // 7. 记录性能指标
    const duration = Date.now() - startTime;
    performanceMonitor.recordMetric({
      serviceName: 'AIFlow',
      operation: 'completeFlow',
      duration,
      timestamp: Date.now(),
      success: true,
      metadata: {
        intent: intent.intent,
        memoryCount: memory.items.length,
        conversationId
      }
    });

    // 8. 结束追踪
    requestTracer.endTrace(traceId, 'success');

    console.log('✅ 完整流程完成，耗时:', duration, 'ms');

    return {
      success: true,
      intent,
      memory,
      conversationId,
      duration
    };

  } catch (error) {
    // 错误处理
    const errorInfo = unifiedErrorHandler.handleError(
      error as Error,
      'AIFlow',
      'completeFlow'
    );

    requestTracer.endTrace(traceId, 'error');

    console.error('❌ 流程执行失败:', errorInfo);

    return {
      success: false,
      error: errorInfo
    };
  }
}

// 使用示例
completeAIFlow('user123', '查询张三的成绩').then(result => {
  console.log('流程结果:', result);
});
```

---

## 🛡️ 错误处理示例

### 示例9: 智能重试

```typescript
import { unifiedErrorHandler } from './error-handling/unified-error-handler.service';

async function smartRetryExample() {
  // 模拟可能失败的操作
  const unreliableOperation = async () => {
    const random = Math.random();
    if (random < 0.7) {
      throw new Error('Network timeout');
    }
    return { data: 'success' };
  };

  try {
    // 使用智能重试
    const result = await unifiedErrorHandler.smartRetry(
      unreliableOperation,
      {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 5000,
        serviceName: 'ExternalAPI',
        operationName: 'fetchData'
      }
    );

    console.log('✅ 操作成功:', result);
  } catch (error) {
    console.error('❌ 操作失败，已重试3次');
  }
}
```

---

### 示例10: 错误分类和处理

```typescript
import { unifiedErrorHandler } from './error-handling/unified-error-handler.service';

function handleDifferentErrors() {
  // 网络错误
  const networkError = new Error('ECONNREFUSED: Connection refused');
  const errorInfo1 = unifiedErrorHandler.handleError(networkError, 'API', 'fetch');
  console.log('错误类型:', errorInfo1.category); // NETWORK
  console.log('可重试:', errorInfo1.retryable); // true
  console.log('恢复策略:', errorInfo1.recoveryStrategy); // retry_with_backoff

  // 验证错误
  const validationError = new Error('Invalid input: email is required');
  const errorInfo2 = unifiedErrorHandler.handleError(validationError, 'Form', 'submit');
  console.log('错误类型:', errorInfo2.category); // VALIDATION
  console.log('可重试:', errorInfo2.retryable); // false
  console.log('恢复策略:', errorInfo2.recoveryStrategy); // fix_input

  // 权限错误
  const permissionError = new Error('Unauthorized: insufficient permissions');
  const errorInfo3 = unifiedErrorHandler.handleError(permissionError, 'Auth', 'access');
  console.log('错误类型:', errorInfo3.category); // PERMISSION
  console.log('可重试:', errorInfo3.retryable); // false
  console.log('恢复策略:', errorInfo3.recoveryStrategy); // check_permissions
}
```

---

## 📊 性能监控示例

### 示例11: 性能监控和报告

```typescript
import { performanceMonitor } from './monitoring/performance-monitor.service';

async function monitorPerformance() {
  // 方式1: 手动记录指标
  performanceMonitor.recordMetric({
    serviceName: 'StudentService',
    operation: 'query',
    duration: 150,
    timestamp: Date.now(),
    success: true
  });

  // 方式2: 使用追踪
  const endTrace = performanceMonitor.startTrace('StudentService', 'update');
  
  // 执行操作
  await new Promise(resolve => setTimeout(resolve, 200));
  
  endTrace(true); // 成功

  // 获取服务统计
  const stats = performanceMonitor.getServiceStats('StudentService');
  console.log('服务统计:', stats);

  // 获取系统健康状态
  const health = performanceMonitor.getSystemHealth();
  console.log('系统状态:', health.status);
  console.log('整体错误率:', health.overallErrorRate);
  console.log('平均响应时间:', health.overallAverageDuration);

  // 生成性能报告
  const report = performanceMonitor.generateReport();
  console.log(report);
}
```

---

### 示例12: 请求追踪

```typescript
import { requestTracer } from './monitoring/request-tracer.service';

async function traceRequest() {
  // 开始追踪
  const traceId = requestTracer.startTrace('user123');

  // 添加多个span
  const span1 = requestTracer.startSpan(traceId, 'Database', 'query');
  await new Promise(resolve => setTimeout(resolve, 100));
  requestTracer.endSpan(traceId, span1, 'success');

  const span2 = requestTracer.startSpan(traceId, 'Cache', 'set');
  await new Promise(resolve => setTimeout(resolve, 50));
  requestTracer.endSpan(traceId, span2, 'success');

  const span3 = requestTracer.startSpan(traceId, 'API', 'call');
  await new Promise(resolve => setTimeout(resolve, 200));
  requestTracer.endSpan(traceId, span3, 'success');

  // 结束追踪
  requestTracer.endTrace(traceId, 'success');

  // 分析追踪
  const analysis = requestTracer.analyzeTrace(traceId);
  console.log('总耗时:', analysis?.totalDuration, 'ms');
  console.log('Span数量:', analysis?.spanCount);
  console.log('最慢Span:', analysis?.slowestSpan?.serviceName);

  // 生成报告
  const report = requestTracer.generateTraceReport(traceId);
  console.log(report);
}
```

---

## 💡 最佳实践

### 1. 始终使用追踪

```typescript
// ✅ 好的做法
const traceId = requestTracer.startTrace(userId);
try {
  // 执行操作
  await doSomething();
  requestTracer.endTrace(traceId, 'success');
} catch (error) {
  requestTracer.endTrace(traceId, 'error');
  throw error;
}

// ❌ 不好的做法
await doSomething(); // 没有追踪
```

### 2. 使用缓存

```typescript
// ✅ 好的做法
const result = await intentRecognitionService.recognizeIntent(query, {
  useCache: true // 默认启用缓存
});

// ❌ 不好的做法
const result = await intentRecognitionService.recognizeIntent(query, {
  useCache: false // 每次都重新计算
});
```

### 3. 错误处理

```typescript
// ✅ 好的做法
try {
  await riskyOperation();
} catch (error) {
  const errorInfo = unifiedErrorHandler.handleError(error, 'Service', 'operation');
  if (errorInfo.retryable) {
    // 重试
  } else {
    // 其他处理
  }
}

// ❌ 不好的做法
try {
  await riskyOperation();
} catch (error) {
  console.log(error); // 只打印，不处理
}
```

---

**最后更新**: 2025-10-05  
**版本**: 2.0.0

