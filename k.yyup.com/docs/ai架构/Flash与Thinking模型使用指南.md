# Flash与Thinking模型使用指南

## 📋 概述

AIBridgeService现在提供**三种**专门优化的AI调用方法：

1. **🚀 Flash快速模式** - `generateFastChatCompletion()`
2. **💡 Flash思考模式** - `generateFlashWithThink()` ⭐ 新增
3. **🧠 Thinking深度模式** - `generateThinkingChatCompletion()`

---

## 🚀 Flash快速推理模型

### 配置参数

```typescript
{
  model: 'doubao-seed-1-6-flash-250715',
  temperature: 0.1,      // 低温度，确定性输出
  max_tokens: 1024,      // 限制token数提高速度
  stream: false          // 非流式输出
}
```

### 使用方法

```typescript
import { aiBridgeService } from '@/services/ai/bridge/ai-bridge.service';
import { AiBridgeMessageRole } from '@/services/ai/bridge/ai-bridge.types';

const response = await aiBridgeService.generateFastChatCompletion({
  model: 'doubao-seed-1-6-flash-250715',  // 可选，会自动使用Flash模型
  messages: [
    {
      role: 'system' as AiBridgeMessageRole,
      content: '你是一个数据查询助手'
    },
    {
      role: 'user' as AiBridgeMessageRole,
      content: '查询学生总数'
    }
  ]
});
```

### 适用场景

✅ **推荐使用**：
- 工具调用（Function Calling）
- 数据库CRUD操作
- 简单数据查询
- 状态检查和统计
- 快速问答
- 格式化输出

❌ **不推荐使用**：
- 复杂推理任务
- 创意内容生成
- 深度分析
- 策略规划

### 性能特点

- ⚡ **响应速度**：0.5-2秒
- 🎯 **准确性**：高（低温度确保稳定）
- 💰 **成本**：低
- 🔄 **一致性**：极高

---

## 💡 Flash思考模式 ⭐ 新增

### 配置参数

```typescript
{
  model: 'doubao-seed-1-6-flash-250715',
  temperature: 0.7,      // 中等温度，支持思考
  max_tokens: 2000,      // 适中的token数
  think: true,           // 启用思考模式
  stream: false/true     // 支持流式和非流式
}
```

### 使用方法

```typescript
import { aiBridgeService } from '@/services/ai/bridge/ai-bridge.service';
import { AiBridgeMessageRole } from '@/services/ai/bridge/ai-bridge.types';

const response = await aiBridgeService.generateFlashWithThink({
  messages: [
    {
      role: 'system' as AiBridgeMessageRole,
      content: '你是一个课程设计专家'
    },
    {
      role: 'user' as AiBridgeMessageRole,
      content: '分析如何优化幼儿园课程设置'
    }
  ],
  temperature: 0.7,    // 可选，默认0.7
  max_tokens: 2000     // 可选，默认2000
}, undefined, userId);  // 可传入userId用于使用量统计
```

### 适用场景

✅ **推荐使用**：
- 需要Flash速度但又需要思考的场景
- 中等复杂度的分析任务
- 快速策略建议
- 平衡速度和深度的场景
- 教学方案快速设计
- 简单的市场分析

❌ **不推荐使用**：
- 极简单的数据查询（用Flash快速模式）
- 极复杂的深度推理（用Thinking深度模式）

### 性能特点

- ⚡ **响应速度**：1-3秒（介于Flash和Thinking之间）
- 🎯 **准确性**：高（有思考能力）
- 💰 **成本**：中等
- 🔄 **创造性**：中等

---

## 🧠 Thinking深度模式

### 配置参数

```typescript
{
  model: 'doubao-seed-1-6-thinking-250615',
  temperature: 0.7,      // 中等温度，平衡创造性和准确性
  max_tokens: 4000,      // 更多token支持复杂推理
  stream: false/true     // 支持流式和非流式
}
```

### 使用方法

```typescript
import { aiBridgeService } from '@/services/ai/bridge/ai-bridge.service';
import { AiBridgeMessageRole } from '@/services/ai/bridge/ai-bridge.types';

const response = await aiBridgeService.generateThinkingChatCompletion({
  model: 'doubao-seed-1-6-thinking-250615',  // 可选，会自动使用Thinking模型
  messages: [
    {
      role: 'system' as AiBridgeMessageRole,
      content: '你是一个幼儿园招生策略专家'
    },
    {
      role: 'user' as AiBridgeMessageRole,
      content: '分析当前招生市场环境并提供策略建议'
    }
  ],
  temperature: 0.7,    // 可选，默认0.7
  max_tokens: 4000,    // 可选，默认4000
  stream: false        // 可选，默认false
}, undefined, userId);  // 可传入userId用于使用量统计
```

### 适用场景

✅ **推荐使用**：
- 复杂推理和分析
- 策略规划和方案设计
- 创意内容生成
- 深度对话和咨询
- 教育方案设计
- 市场分析报告
- 问题诊断和解决

❌ **不推荐使用**：
- 简单数据查询
- 快速工具调用
- 格式化输出
- 状态检查

### 性能特点

- ⚡ **响应速度**：2-5秒
- 🎯 **准确性**：高（深度推理）
- 💰 **成本**：中等
- 🔄 **创造性**：高

---

## ⚖️ 对比表格

| 特性 | Flash模型 | Thinking模型 |
|------|----------|-------------|
| **模型名称** | doubao-seed-1-6-flash-250715 | doubao-seed-1-6-thinking-250615 |
| **Temperature** | 0.1 | 0.7 |
| **Max Tokens** | 1024 | 4000 |
| **响应时间** | 0.5-2秒 | 2-5秒 |
| **适用场景** | 工具调用、数据查询 | 复杂推理、深度分析 |
| **成本** | 低 | 中等 |
| **创造性** | 低 | 高 |
| **一致性** | 极高 | 高 |

---

## 💡 使用建议

### 1. 根据任务类型选择

```typescript
// ✅ 简单查询 → Flash
const studentCount = await aiBridgeService.generateFastChatCompletion({
  messages: [{ role: 'user', content: '统计学生总数' }]
});

// ✅ 复杂分析 → Thinking
const strategy = await aiBridgeService.generateThinkingChatCompletion({
  messages: [{ role: 'user', content: '分析招生策略并提供建议' }]
});
```

### 2. 工具调用场景

```typescript
// ✅ Function Calling → 使用Flash
const response = await aiBridgeService.generateFastChatCompletion({
  messages: [...],
  tools: [
    {
      type: 'function',
      function: {
        name: 'query_students',
        description: '查询学生信息',
        parameters: {...}
      }
    }
  ],
  tool_choice: 'auto'
});
```

### 3. 流式输出场景

```typescript
// Thinking模型支持流式输出
const stream = await aiBridgeService.generateThinkingChatCompletion({
  messages: [...],
  stream: true  // 启用流式输出
});
```

### 4. 成本优化策略

```typescript
// 先用Flash快速判断，如果需要深度分析再用Thinking
const quickCheck = await aiBridgeService.generateFastChatCompletion({
  messages: [{ role: 'user', content: userQuery }]
});

if (needsDeepAnalysis(quickCheck)) {
  const deepAnalysis = await aiBridgeService.generateThinkingChatCompletion({
    messages: [{ role: 'user', content: userQuery }]
  });
}
```

---

## 🔧 实际应用示例

### 示例1：智能代理工具调用

```typescript
// server/src/services/ai/intelligent-expert-consultation.service.ts
const response = await aiBridgeService.generateFastChatCompletion({
  model: 'doubao-seed-1-6-flash-250715',
  messages: aiBridgeMessages,
  tools: this.getExpertFunctionCalls(),
  tool_choice: 'auto',
  temperature: 0.1  // Flash模型使用低温度
});
```

### 示例2：复杂策略分析

```typescript
// 招生策略分析
const strategyAnalysis = await aiBridgeService.generateThinkingChatCompletion({
  messages: [
    {
      role: 'system',
      content: '你是幼儿园招生策略专家，请进行深度分析'
    },
    {
      role: 'user',
      content: '分析当前市场环境并提供招生策略建议'
    }
  ],
  temperature: 0.7,
  max_tokens: 4000
}, undefined, userId);
```

### 示例3：数据库查询

```typescript
// server/src/services/ai/tools/database-query/any-query.tool.ts
const response = await aiBridgeService.generateFastChatCompletion({
  model: 'doubao-seed-1-6-flash-250715',
  messages: [
    {
      role: 'system',
      content: '你是数据库查询分析专家'
    },
    {
      role: 'user',
      content: analysisPrompt
    }
  ]
});
```

---

## 📊 性能监控

两个方法都支持使用量统计：

```typescript
// 传入userId进行使用量统计
const response = await aiBridgeService.generateThinkingChatCompletion(
  params,
  customConfig,
  userId  // 用于使用量统计
);
```

---

## 🚨 注意事项

1. **不要混用参数**：
   - ❌ Flash模型不要设置高temperature
   - ❌ Thinking模型不要设置过低的max_tokens

2. **合理选择模型**：
   - 不是所有任务都需要Thinking模型
   - 优先使用Flash，必要时才用Thinking

3. **成本控制**：
   - Flash模型成本更低，优先使用
   - Thinking模型用于真正需要深度思考的场景

4. **响应时间**：
   - Flash适合需要快速响应的场景
   - Thinking适合可以等待的深度分析场景

---

## 🔄 迁移指南

### 从旧代码迁移

**之前**：
```typescript
const response = await aiBridgeService.generateChatCompletion({
  model: 'doubao-seed-1-6-flash-250715',
  messages: [...],
  temperature: 0.1,
  max_tokens: 1024
});
```

**现在**：
```typescript
// 简化为
const response = await aiBridgeService.generateFastChatCompletion({
  messages: [...]
});
```

---

## 📚 相关文档

- [AIBridge服务架构](./AIBridge服务架构.md)
- [快速推理模型配置完成报告](./快速推理模型配置完成报告.md)
- [AI助手功能前后端架构分析报告](../AI助手功能前后端架构分析报告.md)

---

**最后更新**: 2025-01-12
**维护者**: AI架构团队

