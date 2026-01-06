# AI工具调用解说功能设计

## 📅 时间：2025-11-06

## 🎯 目标

实现像Cursor/Gemini那样的"AI解说员"功能，在每个工具调用后，AI给出自然语言的解释说明。

---

## 📊 当前 vs 期望效果

### 当前效果 ❌
```
用户："班级总数是多少？"
  ↓
[工具调用] execute_database_query
  ↓
[结果] { count: 5 }
  ↓
结束（用户不知道发生了什么）
```

### 期望效果 ✅
```
用户："班级总数是多少？"
  ↓
AI："好的，让我查询一下数据库..."
  ↓
[工具调用] execute_database_query
  ↓
[结果] { count: 5 }
  ↓
AI："完美！我找到了5个班级。根据查询结果，当前系统中有5个班级。"
  ↓
结束
```

---

## 🏗️ 实现方案对比

### 方案A：双AI调用（推荐 ⭐⭐⭐⭐⭐）

**流程**：
```
1. 主AI调用（豆包Pro）：
   - 分析用户需求
   - 决定调用工具
   - 返回 tool_calls + reasoning_content
   
2. 工具执行

3. 轻量级AI调用（豆包Lite/1.6-flash）：
   - 输入：工具名 + 参数 + 结果
   - 输出：1-2句话的友好解释
   - 快速、便宜、专注解释
   
4. 继续下一轮
```

**优点**：
- ✅ 解释质量高，自然流畅
- ✅ 可以根据实际结果生成解释
- ✅ 成本可控（使用轻量级模型）
- ✅ 符合Gemini的实现方式

**缺点**：
- ⚠️ 每个工具调用多一次API调用
- ⚠️ 稍微增加延迟（约200-500ms）

**成本估算**：
- 主AI（豆包Pro）：正常成本
- 解释AI（豆包Lite）：约主AI的1/10
- 总增加成本：约10-15%

---

### 方案B：利用reasoning_content（性价比 ⭐⭐⭐⭐）

**流程**：
```
1. AI调用时返回 reasoning_content
   "我需要查询数据库来获取班级总数..."
   
2. 工具调用前：显示 reasoning_content 作为意图说明

3. 工具执行

4. 工具调用后：使用简单模板生成结果说明
   模板："✅ {tool_name} 执行成功，{result_summary}"
```

**优点**：
- ✅ 无额外AI调用成本
- ✅ 延迟低
- ✅ 实现简单

**缺点**：
- ❌ reasoning_content在调用前，不是调用后
- ❌ 结果说明只能用模板，不够自然
- ❌ 无法根据实际结果智能解释

---

### 方案C：混合方案（最佳体验 ⭐⭐⭐⭐⭐）

**流程**：
```
1. 工具调用前：
   显示 reasoning_content
   "让我查询一下数据库..."
   
2. 工具执行
   
3. 工具调用后：
   - 简单工具：使用模板
     ✅ "查询成功，找到5条记录"
   - 复杂工具：调用轻量级AI解释
     💡 "完美！我找到了5个班级。这意味着..."
     
4. 继续下一轮
```

**优点**：
- ✅ 体验最佳（调用前后都有说明）
- ✅ 成本可控（只对复杂工具调用AI）
- ✅ 灵活性高

**缺点**：
- ⚠️ 实现稍复杂
- ⚠️ 需要定义哪些是"复杂工具"

---

## 🎯 推荐实现：方案C（混合方案）

### 实现步骤

#### 1️⃣ 后端：添加工具结果解释API

**新建文件：`server/src/services/ai/tool-narrator.service.ts`**

```typescript
import { aiBridgeService } from './bridge/ai-bridge.service'

/**
 * 工具调用解说服务
 * 使用轻量级模型为工具调用结果生成友好的解释
 */
class ToolNarratorService {
  /**
   * 生成工具调用后的解释
   */
  async narrateToolResult(options: {
    toolName: string
    toolArguments: any
    toolResult: any
    userQuery: string
  }): Promise<string> {
    const { toolName, toolArguments, toolResult, userQuery } = options

    // 🎯 简单工具：使用模板
    if (this.isSimpleTool(toolName)) {
      return this.generateSimpleNarration(toolName, toolResult)
    }

    // 🎯 复杂工具：调用AI生成解释
    const prompt = this.buildNarrationPrompt(toolName, toolArguments, toolResult, userQuery)
    
    try {
      const response = await aiBridgeService.generateChatCompletion({
        model: 'doubao-lite-128k', // 使用轻量级模型
        messages: [
          {
            role: 'system',
            content: '你是一个AI助手的解说员。用1-2句话简短、友好地解释工具调用的结果。使用第一人称（"我"），保持自然对话风格。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 150 // 限制长度，保持简短
      }, {
        endpointUrl: process.env.DOUBAO_API_ENDPOINT,
        apiKey: process.env.DOUBAO_API_KEY
      })

      const narration = response?.choices?.[0]?.message?.content || ''
      return narration.trim()
    } catch (error) {
      console.error('生成工具解说失败:', error)
      // 降级到模板
      return this.generateSimpleNarration(toolName, toolResult)
    }
  }

  /**
   * 判断是否为简单工具（使用模板即可）
   */
  private isSimpleTool(toolName: string): boolean {
    const simpleTools = [
      'navigate_to_page',
      'navigate_back',
      'scroll_page',
      'type_text',
      'select_option'
    ]
    return simpleTools.includes(toolName)
  }

  /**
   * 生成简单工具的模板化解说
   */
  private generateSimpleNarration(toolName: string, toolResult: any): string {
    const templates: Record<string, string> = {
      'navigate_to_page': '✅ 页面导航成功',
      'navigate_back': '✅ 已返回上一页',
      'execute_database_query': `✅ 查询成功，找到 ${toolResult?.data?.length || 0} 条记录`,
      'render_component': '✅ 已为您展示数据表格',
      'create_student': '✅ 学生信息已成功创建',
      'update_student': '✅ 学生信息已更新',
      'web_search': `✅ 搜索完成，找到 ${toolResult?.results?.length || 0} 条结果`
    }

    return templates[toolName] || `✅ ${toolName} 执行成功`
  }

  /**
   * 构建用于生成解说的提示词
   */
  private buildNarrationPrompt(
    toolName: string,
    toolArguments: any,
    toolResult: any,
    userQuery: string
  ): string {
    return `
用户问题：${userQuery}

我刚刚调用了工具：${toolName}
参数：${JSON.stringify(toolArguments, null, 2)}
结果：${JSON.stringify(toolResult, null, 2)}

请用1-2句话简短解释这个工具调用的结果，要求：
1. 使用第一人称（"我"）
2. 保持自然对话风格
3. 突出关键信息
4. 如果结果成功，表达肯定；如果有问题，说明原因

示例：
- "完美！我找到了5个班级记录。"
- "查询成功，数据库中共有3名学生。"
- "抱歉，没有找到符合条件的数据。"

你的解释：
`.trim()
  }
}

export const toolNarratorService = new ToolNarratorService()
```

---

#### 2️⃣ 后端：在工具执行后生成解释

**修改文件：`server/src/services/ai-operator/unified-intelligence.service.ts`**

在 `callDoubaoSingleRoundSSE()` 方法中，工具执行后添加解说：

```typescript
// 工具执行完成后
const result = await this.executeFunctionTool(tc, request, progressCallback)

// 🆕 生成工具调用解说
const narration = await toolNarratorService.narrateToolResult({
  toolName: toolName,
  toolArguments: parsedArgs,
  toolResult: result,
  userQuery: request.content
})

// 发送工具调用完成事件（包含解说）
sendSSE('tool_call_complete', {
  name: toolName,
  result: result,
  narration: narration, // 🆕 添加解说
  success: true
})

// 🆕 发送解说事件（让前端显示）
sendSSE('tool_narration', {
  toolName: toolName,
  narration: narration,
  timestamp: new Date().toISOString()
})
```

---

#### 3️⃣ 前端：显示工具解说

**修改文件：`client/src/composables/useMultiRoundToolCalling.ts`**

```typescript
// 在进度回调中处理解说事件
(event) => {
  // 转发进度事件
  options.onProgress?.({
    ...event,
    round: currentRound
  })

  // 🆕 处理工具解说事件
  if (event.type === 'tool_narration') {
    console.log(`💬 [工具解说] (第${currentRound}轮):`, event.data?.narration)
    // 转发给上层处理
  }
  
  // 处理工具调用完成事件
  if (event.type === 'tool_call_complete') {
    const toolCall: ToolCall = {
      name: event.data?.name || '',
      arguments: event.data?.arguments || {},
      result: event.data?.result,
      narration: event.data?.narration // 🆕 保存解说
    }
    
    state.value.toolCallHistory.push(toolCall)
    options.onToolCall?.(toolCall)
  }
}
```

**修改文件：`client/src/components/ai-assistant/core/AIAssistantCore.vue`**

```typescript
// 在进度回调中处理解说
onProgress: (event) => {
  switch (event.type) {
    case 'tool_intent':
      // 工具调用前的意图说明
      console.log(`💭 [工具意图]:`, event.data?.message)
      // 显示在思考区域
      showThinkingPhase(event.data?.message)
      break
      
    case 'tool_narration':
      // 🆕 工具调用后的解说
      console.log(`💬 [工具解说]:`, event.data?.narration)
      // 显示为AI消息
      aiResponse.addNarration({
        content: event.data?.narration,
        toolName: event.data?.toolName,
        timestamp: event.data?.timestamp
      })
      break
  }
}
```

---

## 📊 完整流程演示

### 用户查询："班级总数是多少？"

```
1. [AI思考] 💭 reasoning_content
   "让我查询一下数据库来获取班级总数..."
   
2. [工具调用开始] 🔧 tool_call_start
   execute_database_query({ query: "SELECT COUNT(*) FROM classes" })
   
3. [工具执行中] ⏳ progress
   "正在执行数据库查询..."
   
4. [工具调用完成] ✅ tool_call_complete
   结果：{ count: 5 }
   
5. [工具解说] 💬 tool_narration (🆕)
   "完美！我查询到数据库中共有5个班级。"
   
6. [继续下一轮或结束]
```

---

## 💰 成本分析

### 假设场景：一次对话调用3个工具

**不使用解说**：
- 主AI调用：3次 × 0.01元 = 0.03元
- 总成本：0.03元

**使用解说（方案C）**：
- 主AI调用：3次 × 0.01元 = 0.03元
- 轻量级AI解说：3次 × 0.001元 = 0.003元
- 总成本：0.033元
- **增加成本：10%**

**结论**：成本增加可控，但用户体验大幅提升！

---

## 🎯 实施建议

### 立即实施（高优先级）
1. ✅ 创建 `ToolNarratorService`
2. ✅ 在工具执行后生成解说
3. ✅ 前端显示解说

### 后续优化（中优先级）
4. 根据实际使用调整"简单工具"列表
5. 优化解说提示词，提高质量
6. 添加解说缓存（相同工具+结果）

### 未来增强（低优先级）
7. 支持多语言解说
8. 个性化解说风格
9. 解说质量评分

---

## 📁 相关文件

需要创建/修改的文件：
1. `server/src/services/ai/tool-narrator.service.ts` (新建)
2. `server/src/services/ai-operator/unified-intelligence.service.ts` (修改)
3. `client/src/composables/useMultiRoundToolCalling.ts` (修改)
4. `client/src/components/ai-assistant/core/AIAssistantCore.vue` (修改)
5. `client/src/composables/useAIResponse.ts` (添加解说显示方法)

---

## ✨ 总结

这个功能将**极大提升用户体验**，让AI助手更像一个真正的"助手"而不是一个冰冷的工具。

**关键优势**：
- ✅ 用户可以理解AI在做什么
- ✅ 增加透明度和可信度
- ✅ 符合Cursor/Gemini等顶级产品的标准
- ✅ 成本增加可控（约10%）

**建议**：立即实施！这是一个高性价比的改进。

