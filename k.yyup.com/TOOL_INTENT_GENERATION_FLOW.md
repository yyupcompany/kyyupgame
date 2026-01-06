# 🎯 Tool Intent 生成流程详解

## 📋 概述

`tool_intent` 是后端在调用工具前生成的**用户友好的工具意图说明**，用来告诉用户"AI将要做什么"。

## 🔄 完整生成流程

### 第1步：AI 生成工具调用

```
用户输入 → AI 分析 → 生成 tool_calls
  ↓
例如：用户问"查询学生列表"
  ↓
AI 决定调用 'any_query' 工具
  ↓
工具参数：{ query: "查询学生列表" }
```

### 第2步：后端调用 generateToolIntent

**文件**：`server/src/services/ai-operator/unified-intelligence.service.ts`

**调用位置**：
- 第 5354 行（非流式处理）
- 第 6450 行（AFC 多轮处理）
- 第 6814 行（单次调用处理）

```typescript
// 生成工具意图
const toolIntent = generateToolIntent(toolName, parsedArgs);

// 例如：
// toolName = 'any_query'
// parsedArgs = { query: "查询学生列表" }
// 返回：'我将执行智能查询，获取学生和班级相关数据'
```

### 第3步：查找意图生成器

**文件**：`server/src/services/ai/tools/tool-description-generator.service.ts`

**流程**：

```typescript
export function generateToolIntent(toolName: string, args: any): string {
  // 1️⃣ 查找专门的意图生成器
  const generator = TOOL_INTENTS[toolName];
  
  if (generator) {
    // 2️⃣ 使用专门生成器
    return generator(args);
  }
  
  // 3️⃣ 如果没有专门生成器，使用通用生成器
  return generateGenericIntent(toolName, args);
}
```

### 第4步：意图生成器映射表

**TOOL_INTENTS 映射表**（第 19-162 行）

#### 示例1：any_query 工具

```typescript
'any_query': (args) => {
  const query = args.query || args.userQuery || '';
  
  if (query.includes('学生') || query.includes('班级')) {
    return '我将执行智能查询，获取学生和班级相关数据';
  }
  if (query.includes('教师') || query.includes('师资')) {
    return '我将执行智能查询，获取教师和师资相关数据';
  }
  if (query.includes('招生') || query.includes('报名')) {
    return '我将执行智能查询，获取招生和报名相关数据';
  }
  return '我将执行智能查询，获取相关数据';
}
```

#### 示例2：fill_form 工具

```typescript
'fill_form': (args) => {
  const fieldCount = args.fields ? Object.keys(args.fields).length : 0;
  return `我将填写表单，共${fieldCount}个字段`;
}
```

#### 示例3：query_past_activities 工具

```typescript
'query_past_activities': (args) => {
  if (args.activityType) {
    return `我将查询${args.activityType}类型的历史活动数据`;
  }
  return '我将查询历史活动数据，分析活动趋势';
}
```

### 第5步：通用意图生成器（降级方案）

如果工具没有专门的意图生成器，使用通用生成器：

```typescript
function generateGenericIntent(toolName: string, args: any): string {
  // 将工具名称转换为人类可读的描述
  const readableName = toolName.replace(/_/g, ' ');
  
  // 如果有参数，提取关键信息
  if (args && Object.keys(args).length > 0) {
    const keyParams = Object.entries(args)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    
    if (keyParams) {
      return `执行 ${readableName} (${keyParams})`;
    }
  }
  
  return `执行 ${readableName}`;
}
```

### 第6步：发送 tool_intent 事件

生成意图后，后端通过 SSE 发送给前端：

```typescript
sendSSE('tool_intent', {
  message: toolIntent,        // 意图描述
  toolName: toolName          // 工具名称
});
```

### 第7步：前端接收和显示

**前端 API 层**（`client/src/api/endpoints/function-tools.ts`）：

```typescript
else if (t === 'tool_intent') {
  console.log('💡 [前端接收] tool_intent事件:', eventData);
  onProgress?.({ 
    type: 'tool_intent', 
    data: eventData, 
    message: eventData?.message 
  });
}
```

**前端 UI 层**（`client/src/components/ai-assistant/core/AIAssistantCore.vue`）：

```typescript
case 'tool_intent':
  const intentMessage = event.data?.message || event.message || '';
  if (intentMessage) {
    chatHistory.addMessage({
      id: `tool-intent-${Date.now()}`,
      role: 'assistant',
      type: 'tool_intent',
      content: intentMessage,
      toolName: event.data?.toolName,
      timestamp: new Date().toISOString()
    });
  }
  break;
```

## 📊 支持的工具意图列表

| 工具名称 | 意图示例 |
|---------|---------|
| `any_query` | 我将执行智能查询，获取学生和班级相关数据 |
| `query_past_activities` | 我将查询历史活动数据，分析活动趋势 |
| `fill_form` | 我将填写表单，共3个字段 |
| `capture_screen` | 我将截取完整页面截图，保存当前页面状态 |
| `generate_complete_activity_plan` | 我将生成完整活动方案【活动名】 |
| `execute_activity_workflow` | 我将执行活动创建工作流 |
| `web_search` | 我将搜索网络信息，获取最新资料 |

## 🔍 工作原理总结

```
用户输入
  ↓
AI 生成 tool_calls
  ↓
后端遍历每个 tool_call
  ↓
调用 generateToolIntent(toolName, args)
  ↓
查找 TOOL_INTENTS[toolName]
  ↓
如果存在 → 使用专门生成器
如果不存在 → 使用通用生成器
  ↓
返回意图描述字符串
  ↓
通过 SSE 发送 tool_intent 事件
  ↓
前端接收并显示在聊天历史中
```

## 💡 关键特点

1. **参数感知**：根据工具参数生成不同的意图
2. **多层级降级**：专门生成器 → 通用生成器 → 默认文本
3. **用户友好**：使用"我将..."的第一人称表述
4. **实时发送**：在工具调用前立即发送，让用户知道接下来要做什么
5. **可扩展**：新工具只需在 TOOL_INTENTS 中添加生成器即可

