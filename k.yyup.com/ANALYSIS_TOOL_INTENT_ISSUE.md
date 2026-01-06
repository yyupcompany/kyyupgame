# 🔍 前端工具意图显示问题分析

## 📊 问题总结

**现象**：前端只有客户返回完成时才显示，其他都没有显示
- ❌ thinking_update 事件没有显示
- ❌ tool_intent 事件没有显示  
- ❌ tool_call_start 事件没有显示
- ✅ 只有 complete 事件时才显示最终结果

## 🔴 根本原因

### 1. **tool_intent 事件处理缺失** (最严重)

**之前完成版本** (cf37fae2 - 2025-10-10):
```typescript
// 🎯 工具意图事件 → 中间对话区域（用户友好的说明）
case 'tool_intent':
  console.log('💬 [工具意图] 添加到中间对话区域:', event.data?.message)
  const intentMessage = event.data?.message || event.message
  
  if (intentMessage && intentMessage.trim()) {
    chatHistory.addMessage({
      role: 'assistant',
      content: `💭 **AI思考过程**\n\n${intentMessage}`,
      isThinking: true
    })
  }
  break
```

**现在的版本** (AIAssistantCore.vue):
```typescript
case 'tool_intent':
  // 🎯 流式显示：立即创建工具意图消息
  const intentMessage = event.data?.message || event.message || ''
  const intentToolName = event.data?.toolName || ''
  
  if (intentMessage) {
    // 🎯 立即创建工具意图消息并添加到聊天历史
    chatHistory.addMessage({
      id: `tool-intent-${Date.now()}`,
      role: 'assistant' as const,
      type: 'tool_intent' as const,
      content: intentMessage,
      toolName: intentToolName,
      timestamp: new Date().toISOString()
    })
  }
  break
```

**问题**：虽然代码看起来在处理，但 **function-tools.ts 中的 callUnifiedIntelligenceStreamSingleRound 没有转发 tool_intent 事件！**

### 2. **API 层缺失 tool_intent 事件转发**

**function-tools.ts (第 225-376 行)**:
```typescript
// ❌ 缺失 tool_intent 事件处理
else if (t === 'tool_call_start') onProgress?.({ type: 'tool_call_start', ... });
else if (t === 'tool_call_complete') onProgress?.({ type: 'tool_call_complete', ... });
else if (t === 'tool_narration') onProgress?.({ type: 'tool_narration', ... });
// ❌ 没有 tool_intent 的处理！
```

**对比原版本** (第 150-194 行):
```typescript
// ✅ 有 tool_intent 事件处理
else if (t === 'tool_intent') onProgress?.({ type: 'tool_intent', data: eventData, message: eventData?.message });
```

## 🔧 修复方案

### 第1步：在 function-tools.ts 中添加 tool_intent 事件处理

在 `callUnifiedIntelligenceStreamSingleRound` 函数中（第 343 行附近）添加：

```typescript
else if (t === 'tool_intent') {
  console.log('💡 [单次调用] tool_intent事件:', eventData);
  onProgress?.({ type: 'tool_intent', data: eventData, message: eventData?.message });
}
```

### 第2步：确保 AIAssistantCore.vue 正确处理

已经有处理代码，但需要验证 chatHistory.addMessage 是否正确工作。

### 第3步：验证后端是否发送 tool_intent 事件

检查 unified-intelligence.service.ts 中是否有：
```typescript
sendSSE('tool_intent', {
  message: toolIntent,
  toolName: toolName
});
```

## 📋 完整的事件流应该是

```
1. thinking_update → 显示AI思考内容
2. tool_intent → 显示工具意图（用户友好的说明）
3. tool_call_start → 显示工具调用开始
4. [执行工具]
5. tool_call_complete → 显示工具完成
6. [继续下一轮或完成]
7. complete → 显示最终结果
```

## 🎯 关键差异对比

| 项目 | 之前版本 (cf37fae2) | 现在版本 | 状态 |
|------|------------------|---------|------|
| tool_intent 处理 | ✅ 在 AIAssistantRefactored.vue | ✅ 在 AIAssistantCore.vue | 代码存在 |
| tool_intent 转发 | ✅ 在 function-tools.ts | ❌ 缺失 | **需要修复** |
| thinking 处理 | ✅ 只在右侧栏 | ✅ 添加到聊天历史 | 改进 |
| 事件队列 | ❌ 没有 | ✅ 有事件队列 | 改进 |

## 🚀 立即修复步骤

1. 打开 `client/src/api/endpoints/function-tools.ts`
2. 在第 343 行（tool_call_start 处理）之前添加 tool_intent 处理
3. 测试工具调用流程

