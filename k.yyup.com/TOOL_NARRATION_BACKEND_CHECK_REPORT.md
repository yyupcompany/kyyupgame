# 🔍 后端 Tool Narration 事件发送检查报告

> 检查时间：2025-11-09
> 检查内容：后端是否在工具执行过程中发送 tool_narration 事件

---

## 📋 检查结果总结

### ✅ 前端已完全支持
- **文件**：`client/src/components/ai-assistant/core/AIAssistantCore.vue`
- **行数**：540-587 行
- **状态**：✅ 完整实现
- **功能**：接收 `tool_narration` 事件并添加到聊天历史

### ⚠️ 后端支持不完整

#### 1️⃣ 只有 any_query 工具发送 tool_narration

**文件**：`server/src/services/ai/tools/database-query/any-query.tool.ts`

```typescript
// 第 177-181 行
stepCallback?.('tool_narration', {
  toolName: 'any_query',
  narration: `📋 很好！我找到了需要查询的表：${translatedTables.join('、')}表`,
  type: 'found_data'
});

// 第 188-192 行
stepCallback?.('tool_narration', {
  toolName: 'any_query',
  narration: '🔍 接下来我需要生成查询语句，从这些表中获取您需要的数据',
  type: 'next_step'
});
```

#### 2️⃣ 其他工具都没有发送 tool_narration

检查的工具：
- ❌ `read_data_record.tool.ts` - 没有 stepCallback 调用
- ❌ `create_data_record.tool.ts` - 没有 stepCallback 调用
- ❌ `update_data_record.tool.ts` - 没有 stepCallback 调用
- ❌ `delete_data_record.tool.ts` - 没有 stepCallback 调用
- ❌ `web_search.tool.ts` - 使用 `_sseEmitter` 而不是 `stepCallback`

#### 3️⃣ stepCallback 传递链断裂

**问题位置**：`server/src/services/ai-operator/unified-intelligence.service.ts`

```typescript
// 第 4650-4651 行
private async executeFunctionTool(
  toolCall: any, 
  request: UserRequest, 
  progressCallback?: (status: string, details?: any) => void
) {
  return await toolExecutorModule.executeFunctionTool(toolCall, request, progressCallback);
  // ❌ 没有传递 stepCallback
}
```

**应该是**：
```typescript
private async executeFunctionTool(
  toolCall: any, 
  request: UserRequest, 
  progressCallback?: (status: string, details?: any) => void,
  stepCallback?: (eventType: string, data: any) => void  // 🆕 需要添加
) {
  return await toolExecutorModule.executeFunctionTool(
    toolCall, 
    request, 
    progressCallback,
    stepCallback  // 🆕 需要传递
  );
}
```

---

## 🔧 后端支持情况

### tool-executor.module.ts 中的支持

**文件**：`server/src/services/ai-operator/modules/tool-executor.module.ts`

```typescript
// 第 51-73 行
async executeFunctionTool(
  toolCall: ToolCall,
  request: UserRequest,
  progressCallback?: (status: string, details?: any) => void,
  stepCallback?: (eventType: string, data: any) => void // ✅ 已支持
): Promise<ToolExecutionResult> {
  // ...
  // 🆕 注入步骤回调（用于工具内部步骤通知）
  args.__stepCallback = stepCallback;  // ✅ 已注入
}
```

### 工具中的支持

**any_query.tool.ts**：✅ 已使用 stepCallback
**其他工具**：❌ 未使用 stepCallback

---

## 📊 现在的事件流

```
前端 while 循环
  ↓
等待后端 SSE 事件
  ↓
后端发送事件：
  ✅ thinking_update
  ✅ tool_intent
  ✅ thinking
  ✅ tool_call_start
  ❌ tool_narration (只有 any_query 发送)
  ✅ tool_call_complete
  ✅ complete
```

---

## 🎯 需要修复的地方

1. **unified-intelligence.service.ts**
   - 创建 stepCallback 函数
   - 在调用 executeFunctionTool 时传递 stepCallback

2. **所有工具**
   - 在执行过程中调用 `stepCallback?.('tool_narration', {...})`
   - 发送工具执行的各个步骤

3. **web_search.tool.ts**
   - 改用 stepCallback 而不是 _sseEmitter

---

## ✅ 检查完成

所有信息已收集，可以开始修复。

