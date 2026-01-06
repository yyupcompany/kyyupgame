# AI助手多轮工具调用集成指南

## 📋 概述

本文档说明如何将新创建的多轮工具调用功能集成到 AIAssistant.vue 中。

---

## 🎯 已完成的组件

### 1. useMultiRoundToolCalling Composable ✅
**文件**: `client/src/composables/useMultiRoundToolCalling.ts`

**功能**:
- 实现前端Loop机制
- 维护对话历史
- 持续发送工具调用结果
- 支持最多20轮调用

**核心API**:
```typescript
const { executeMultiRound, state, progress, cancel } = useMultiRoundToolCalling()

await executeMultiRound(userMessage, {
  userId: '123',
  conversationId: 'conv-456',
  maxRounds: 20,
  onProgress: (event) => {
    // 处理进度事件
  },
  onToolCall: (toolCall) => {
    // 处理工具调用
  },
  onComplete: (result) => {
    // 处理完成
  }
})
```

### 2. DynamicComponentRenderer 组件 ✅
**文件**: `client/src/components/ai-assistant/DynamicComponentRenderer.vue`

**功能**:
- 渲染 `render_component` 工具返回的组件
- 支持数据表格、图表、待办事项、统计卡片

**使用方式**:
```vue
<DynamicComponentRenderer
  :component-data="componentData"
  @close="handleComponentClose"
  @todo-change="handleTodoChange"
/>
```

### 3. ToolCallingStatus 组件 ✅
**文件**: `client/src/components/ai-assistant/ToolCallingStatus.vue`

**功能**:
- 显示当前轮数和进度
- 显示工具调用状态
- 显示工具调用历史

**使用方式**:
```vue
<ToolCallingStatus
  :visible="true"
  :current-round="currentRound"
  :max-rounds="20"
  :is-running="isRunning"
  :is-complete="isComplete"
  :has-error="hasError"
  :current-tool="currentTool"
  :tool-history="toolHistory"
  :error-message="errorMessage"
/>
```

---

## 🔧 集成步骤

### 步骤1: 导入新组件和Composable

在 `AIAssistant.vue` 的 `<script setup>` 部分添加：

```typescript
// 导入多轮工具调用
import { useMultiRoundToolCalling } from '@/composables/useMultiRoundToolCalling'
import DynamicComponentRenderer from './DynamicComponentRenderer.vue'
import ToolCallingStatus from './ToolCallingStatus.vue'

// 初始化多轮工具调用
const multiRound = useMultiRoundToolCalling()
```

### 步骤2: 添加状态管理

```typescript
// 多轮工具调用状态
const toolCallingState = ref({
  visible: false,
  currentRound: 0,
  maxRounds: 20,
  isRunning: false,
  isComplete: false,
  hasError: false,
  currentTool: null as { name: string; message: string } | null,
  toolHistory: [] as Array<{
    name: string
    status: 'pending' | 'running' | 'success' | 'error'
    time: string
  }>,
  errorMessage: ''
})

// 动态组件列表
const dynamicComponents = ref<Array<{
  id: string
  componentData: any
}>>([])
```

### 步骤3: 修改 sendMessage 方法

找到 AIAssistant.vue 中的消息发送逻辑（可能在 `@send` 事件处理中），修改为：

```typescript
async function sendMessage(message: string) {
  if (!message.trim() || sending.value) return

  try {
    sending.value = true
    
    // 根据 autoExecute 状态选择接口
    if (autoExecute.value) {
      // 🚀 使用多轮工具调用
      console.log('📡 使用智能代理模式（多轮工具调用）')
      await handleMultiRoundToolCalling(message)
    } else {
      // 使用直接聊天
      console.log('📡 使用直接聊天模式')
      await handleDirectChat(message)
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败')
  } finally {
    sending.value = false
  }
}
```

### 步骤4: 实现多轮工具调用处理

```typescript
async function handleMultiRoundToolCalling(message: string) {
  // 重置状态
  toolCallingState.value = {
    visible: true,
    currentRound: 0,
    maxRounds: 20,
    isRunning: true,
    isComplete: false,
    hasError: false,
    currentTool: null,
    toolHistory: [],
    errorMessage: ''
  }

  try {
    const result = await multiRound.executeMultiRound(message, {
      userId: userStore.userInfo?.id?.toString(),
      conversationId: conversationId.value,
      maxRounds: 20,
      
      // 进度回调
      onProgress: (event) => {
        console.log(`[多轮调用] ${event.type}:`, event.message)
        
        // 更新轮数
        if (event.round) {
          toolCallingState.value.currentRound = event.round
        }
        
        // 处理不同类型的事件
        switch (event.type) {
          case 'round_start':
            // 轮次开始
            break
            
          case 'tool_call_start':
            // 工具调用开始
            toolCallingState.value.currentTool = {
              name: event.data?.name || '',
              message: event.message || ''
            }
            toolCallingState.value.toolHistory.push({
              name: event.data?.name || '',
              status: 'running',
              time: new Date().toLocaleTimeString()
            })
            break
            
          case 'tool_call_complete':
            // 工具调用完成
            const lastTool = toolCallingState.value.toolHistory[toolCallingState.value.toolHistory.length - 1]
            if (lastTool) {
              lastTool.status = 'success'
            }
            toolCallingState.value.currentTool = null
            
            // 检查是否是 render_component 工具
            if (event.data?.name === 'render_component' && event.data?.result) {
              handleRenderComponent(event.data.result)
            }
            break
            
          case 'tool_call_error':
            // 工具调用失败
            const errorTool = toolCallingState.value.toolHistory[toolCallingState.value.toolHistory.length - 1]
            if (errorTool) {
              errorTool.status = 'error'
            }
            break
            
          case 'complete':
            // 完成
            toolCallingState.value.isComplete = true
            toolCallingState.value.isRunning = false
            break
            
          case 'error':
            // 错误
            toolCallingState.value.hasError = true
            toolCallingState.value.isRunning = false
            toolCallingState.value.errorMessage = event.message || '执行失败'
            break
        }
      },
      
      // 工具调用回调
      onToolCall: (toolCall) => {
        console.log('[工具调用]', toolCall.name, toolCall.arguments)
      },
      
      // 完成回调
      onComplete: (finalResult) => {
        console.log('[多轮调用完成]', finalResult)
        
        // 添加AI回复到消息列表
        if (finalResult?.data?.message) {
          messages.value.push({
            role: 'assistant',
            content: finalResult.data.message,
            timestamp: new Date()
          })
        }
      },
      
      // 错误回调
      onError: (error) => {
        console.error('[多轮调用失败]', error)
        ElMessage.error(`多轮调用失败: ${error.message}`)
      }
    })
    
  } catch (error: any) {
    console.error('多轮工具调用失败:', error)
    toolCallingState.value.hasError = true
    toolCallingState.value.errorMessage = error.message || '执行失败'
  }
}
```

### 步骤5: 实现组件渲染处理

```typescript
function handleRenderComponent(componentData: any) {
  console.log('[渲染组件]', componentData)
  
  // 添加到动态组件列表
  dynamicComponents.value.push({
    id: `component-${Date.now()}`,
    componentData: componentData
  })
}

function handleComponentClose(componentId: string) {
  const index = dynamicComponents.value.findIndex(c => c.id === componentId)
  if (index !== -1) {
    dynamicComponents.value.splice(index, 1)
  }
}
```

### 步骤6: 添加模板

在 `AIAssistant.vue` 的 `<template>` 部分添加：

```vue
<!-- 工具调用状态显示 -->
<ToolCallingStatus
  v-if="toolCallingState.visible"
  :visible="toolCallingState.visible"
  :current-round="toolCallingState.currentRound"
  :max-rounds="toolCallingState.maxRounds"
  :is-running="toolCallingState.isRunning"
  :is-complete="toolCallingState.isComplete"
  :has-error="toolCallingState.hasError"
  :current-tool="toolCallingState.currentTool"
  :tool-history="toolCallingState.toolHistory"
  :error-message="toolCallingState.errorMessage"
/>

<!-- 动态组件渲染 -->
<div class="dynamic-components-container">
  <DynamicComponentRenderer
    v-for="component in dynamicComponents"
    :key="component.id"
    :component-data="component.componentData"
    @close="handleComponentClose(component.id)"
  />
</div>
```

---

## 🎯 关键点

### 1. 接口选择逻辑

```typescript
if (autoExecute.value) {
  // 智能代理模式 - 使用多轮工具调用
  await handleMultiRoundToolCalling(message)
} else {
  // 直接聊天模式 - 使用原有的直接聊天
  await handleDirectChat(message)
}
```

### 2. 工具调用事件处理

关键事件：
- `round_start` - 轮次开始
- `tool_call_start` - 工具调用开始
- `tool_call_complete` - 工具调用完成
- `tool_call_error` - 工具调用失败
- `complete` - 全部完成
- `error` - 执行错误

### 3. render_component 特殊处理

```typescript
if (event.data?.name === 'render_component' && event.data?.result) {
  handleRenderComponent(event.data.result)
}
```

---

## 📝 测试清单

### 基础功能测试
- [ ] 智能代理开关正常工作
- [ ] 多轮工具调用正常执行
- [ ] 轮数显示正确
- [ ] 进度条正常更新

### 工具调用测试
- [ ] 工具调用状态正确显示
- [ ] 工具调用历史正确记录
- [ ] 工具调用错误正确处理

### 组件渲染测试
- [ ] 数据表格正确渲染
- [ ] 图表正确渲染
- [ ] 待办事项正确渲染
- [ ] 统计卡片正确渲染

### 边界情况测试
- [ ] 达到最大轮数时正确停止
- [ ] 用户取消时正确停止
- [ ] 网络错误时正确处理
- [ ] 工具调用失败时正确降级

---

## 🔍 调试技巧

### 1. 启用详细日志

```typescript
// 在 useMultiRoundToolCalling.ts 中已经有详细的 console.log
// 打开浏览器控制台查看日志
```

### 2. 检查状态

```typescript
// 在浏览器控制台中
console.log(multiRound.state.value)
console.log(toolCallingState.value)
```

### 3. 模拟工具调用

```typescript
// 手动触发工具调用测试
handleRenderComponent({
  component_type: 'data-table',
  title: '测试表格',
  data: [
    { id: 1, name: '张三', age: 25 },
    { id: 2, name: '李四', age: 30 }
  ]
})
```

---

## ⚠️ 注意事项

1. **性能考虑**
   - 每轮调用都会消耗API额度
   - 建议添加取消机制
   - 避免无限循环

2. **用户体验**
   - 显示清晰的进度指示
   - 允许用户中断执行
   - 提供详细的错误信息

3. **错误处理**
   - 工具调用失败时的降级策略
   - 网络错误时的重试机制
   - 超时处理

4. **兼容性**
   - 保持向后兼容
   - 不影响现有的直接聊天功能
   - 渐进式增强

---

## 📚 相关文档

1. **实施方案**: `docs/AI-Assistant-Multi-Round-Tool-Calling-Plan.md`
2. **工具统一化**: `docs/Tool-Unification-Complete-Report.md`
3. **轮数配置**: `docs/AI-Max-Iterations-Configuration.md`

---

**创建日期**: 2025-10-05  
**版本**: 1.0.0  
**状态**: 待集成

