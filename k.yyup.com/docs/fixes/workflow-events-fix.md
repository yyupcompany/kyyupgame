# 工作流事件显示修复文档

## 🐛 问题描述

**现象**：
- AI助手启动智能代理功能后
- 输入"创建活动"
- 工作流可以正常工作（后端执行成功）
- 后端发送了工作流的具体事件和步骤（`workflow_step_start`, `workflow_step_complete`）
- ❌ **前端没有捕获和显示到页面上**

## 🔍 问题根因

前端的 `callUnifiedIntelligenceStream` 函数（位于 `k.yyup.com/client/src/api/endpoints/function-tools.ts`）**没有处理工作流事件**：

1. ❌ 事件类型定义中缺少 `workflow_step_start`、`workflow_step_complete`、`workflow_step_failed`
2. ❌ 事件处理逻辑中没有转发这些工作流事件到 `onProgress` 回调

### 代码流程分析

```
后端工具 (execute-activity-workflow.tool.ts)
  ↓ progressCallback('workflow_step_start', {...})
统一智能服务 (unified-intelligence.service.ts)
  ↓ sendSSE('workflow_step_start', {...})
SSE 流
  ↓ event: workflow_step_start
前端 SSE 接收 (function-tools.ts)
  ↓ ❌ 没有处理该事件类型
  ↓ ❌ 没有调用 onProgress
前端 UI (AIAssistant.vue)
  ↓ ❌ 没有收到事件
  ↓ ❌ 工作流队列没有更新
```

## ✅ 修复方案

### 修改文件：`k.yyup.com/client/src/api/endpoints/function-tools.ts`

#### 1. 添加工作流事件类型定义（第72行）

**修改前**：
```typescript
onProgress?: (event: {
  type: 'start' | 'thinking' | 'thinking_update' | 'thinking_start' | 'thinking_complete' | 'tool_call_description' | 'tool_call' | 'tool_call_start' | 'tool_call_error' | 'tool_call_complete' | 'content_update' | 'final_answer' | 'answer' | 'complete' | 'error';
  data?: any;
  message?: string;
}) => void
```

**修改后**：
```typescript
onProgress?: (event: {
  type: 'start' | 'thinking' | 'thinking_update' | 'thinking_start' | 'thinking_complete' | 'tool_call_description' | 'tool_call' | 'tool_call_start' | 'tool_call_error' | 'tool_call_complete' | 'workflow_step_start' | 'workflow_step_complete' | 'workflow_step_failed' | 'content_update' | 'final_answer' | 'answer' | 'complete' | 'error';
  data?: any;
  message?: string;
}) => void
```

#### 2. 添加工作流事件处理逻辑（第142-144行）

**修改前**：
```typescript
else if (t === 'tool_call_start') onProgress?.({ type: 'tool_call_start', data: eventData, message: `🔧 开始调用工具: ${eventData?.name}` });
else if (t === 'tool_call') onProgress?.({ type: 'tool_call', data: eventData, message: `🔧 调用工具: ${eventData?.name}` });
else if (t === 'tool_call_error') onProgress?.({ type: 'tool_call_error', data: eventData, message: `❌ 工具调用失败: ${eventData?.error}` });
else if (t === 'tool_call_complete') onProgress?.({ type: 'tool_call_complete', data: eventData, message: `✅ 工具调用完成: ${eventData?.name}` });
else if (t === 'content_update') onProgress?.({ type: 'content_update', data: eventData, message: '💬 流式更新答案内容...' });
```

**修改后**：
```typescript
else if (t === 'tool_call_start') onProgress?.({ type: 'tool_call_start', data: eventData, message: `🔧 开始调用工具: ${eventData?.name}` });
else if (t === 'tool_call') onProgress?.({ type: 'tool_call', data: eventData, message: `🔧 调用工具: ${eventData?.name}` });
else if (t === 'tool_call_error') onProgress?.({ type: 'tool_call_error', data: eventData, message: `❌ 工具调用失败: ${eventData?.error}` });
else if (t === 'tool_call_complete') onProgress?.({ type: 'tool_call_complete', data: eventData, message: `✅ 工具调用完成: ${eventData?.name}` });
else if (t === 'workflow_step_start') onProgress?.({ type: 'workflow_step_start', data: eventData, message: `🔄 工作流步骤开始: ${eventData?.stepTitle}` });
else if (t === 'workflow_step_complete') onProgress?.({ type: 'workflow_step_complete', data: eventData, message: `✅ 工作流步骤完成: ${eventData?.stepTitle}` });
else if (t === 'workflow_step_failed') onProgress?.({ type: 'workflow_step_failed', data: eventData, message: `❌ 工作流步骤失败: ${eventData?.stepTitle}` });
else if (t === 'content_update') onProgress?.({ type: 'content_update', data: eventData, message: '💬 流式更新答案内容...' });
```

## 🧪 测试步骤

### 前置条件
1. ✅ 确保前后端服务都已启动
2. ✅ 确保已登录系统
3. ✅ 确保有创建活动的权限

### 测试步骤

#### 1. 启动 MCP 浏览器测试
```bash
# 在项目根目录执行
cd k.yyup.com
npm run dev
```

#### 2. 打开浏览器开发者工具
- 按 F12 打开开发者工具
- 切换到 Console 标签页
- 清空控制台日志

#### 3. 打开 AI 助手
- 点击页面右下角的 AI 助手图标
- 确保 AI 助手面板打开

#### 4. 启用智能代理模式
- 在 AI 助手中，找到"智能代理"开关
- 确保开关处于**开启**状态（蓝色）

#### 5. 输入测试指令
在 AI 助手输入框中输入：
```
创建活动
```
或
```
帮我创建一个活动
```

#### 6. 观察预期结果

##### ✅ 控制台日志应该显示：
```
📡 [SSE事件] workflow_step_start {...}
🔄 [工作流] 步骤开始: 创建活动记录
📡 [SSE事件] workflow_step_complete {...}
✅ [工作流] 步骤完成: 创建活动记录
📡 [SSE事件] workflow_step_start {...}
🔄 [工作流] 步骤开始: 生成活动海报
📡 [SSE事件] workflow_step_complete {...}
✅ [工作流] 步骤完成: 生成活动海报
...
```

##### ✅ UI 界面应该显示：
1. **工作流队列组件**应该出现在 AI 助手面板中
2. **工作流步骤**应该实时显示：
   - 🔄 创建活动记录 (进行中)
   - ✅ 创建活动记录 (已完成)
   - 🔄 生成活动海报 (进行中)
   - ✅ 生成活动海报 (已完成)
   - 🔄 配置营销策略 (进行中)
   - ✅ 配置营销策略 (已完成)
   - 🔄 生成手机海报 (进行中)
   - ✅ 生成手机海报 (已完成)

3. **进度条**应该实时更新
4. **步骤状态图标**应该正确显示（pending → running → completed）

### 验证点

#### ✅ 前端事件接收验证
在控制台中应该看到：
```javascript
📡 [SSE事件] workflow_step_start { stepId: 'create_activity', stepTitle: '创建活动记录', ... }
📡 [SSE事件] workflow_step_complete { stepId: 'create_activity', stepTitle: '创建活动记录', ... }
```

#### ✅ 工作流队列验证
在控制台中应该看到：
```javascript
🔄 [工作流] 步骤开始: 创建活动记录
✅ [工作流] 步骤完成: 创建活动记录
```

#### ✅ UI 组件验证
- WorkflowStepQueue 组件应该可见
- 步骤列表应该动态更新
- 进度条应该从 0% 增长到 100%

## 📝 相关代码文件

### 前端文件
- `k.yyup.com/client/src/api/endpoints/function-tools.ts` - SSE 事件接收和转发（**已修复**）
- `k.yyup.com/client/src/components/ai-assistant/AIAssistant.vue` - 工作流事件处理和 UI 更新
- `k.yyup.com/client/src/components/ai-assistant/WorkflowStepQueue.vue` - 工作流队列组件
- `k.yyup.com/client/src/utils/workflow-steps.ts` - 工作流步骤管理器

### 后端文件
- `k.yyup.com/server/src/services/ai/tools/workflow/activity-workflow/execute-activity-workflow.tool.ts` - 工作流工具实现
- `k.yyup.com/server/src/services/ai-operator/unified-intelligence.service.ts` - 统一智能服务（SSE 发送）
- `k.yyup.com/server/src/services/ai-operator/function-tools.service.ts` - 工具执行服务

## 🎯 修复效果

### 修复前
- ❌ 后端发送工作流事件，前端不接收
- ❌ 工作流队列组件不显示
- ❌ 用户看不到工作流进度

### 修复后
- ✅ 后端发送工作流事件，前端正确接收
- ✅ 工作流队列组件正常显示
- ✅ 用户可以实时看到工作流进度
- ✅ 步骤状态实时更新（pending → running → completed）
- ✅ 进度条实时更新

## 🔧 技术细节

### SSE 事件流程
```
1. 后端工具调用 progressCallback('workflow_step_start', data)
   ↓
2. UnifiedIntelligenceService 接收并调用 sendSSE('workflow_step_start', data)
   ↓
3. SSE 流发送事件：
   event: workflow_step_start
   data: {"stepId":"create_activity","stepTitle":"创建活动记录",...}
   ↓
4. 前端 callUnifiedIntelligenceStream 接收并解析事件
   ↓
5. 调用 onProgress({ type: 'workflow_step_start', data: {...} })
   ↓
6. AIAssistant.vue 的事件处理器接收事件
   ↓
7. 调用 workflowStepManager.addStep() 和 startStepById()
   ↓
8. WorkflowStepQueue 组件更新 UI
```

### 事件数据结构
```typescript
{
  type: 'workflow_step_start' | 'workflow_step_complete' | 'workflow_step_failed',
  data: {
    stepId: string,        // 步骤ID，如 'create_activity'
    stepTitle: string,     // 步骤标题，如 '创建活动记录'
    stepIndex: number,     // 步骤索引，从 0 开始
    totalSteps: number,    // 总步骤数
    error?: string         // 错误信息（仅 workflow_step_failed）
  },
  message: string          // 显示消息
}
```

## 📚 参考文档
- [AI 智能文档 - 04-通讯机制](../aireadme/04-communication.md)
- [AI 智能文档 - 06-工作流系统](../aireadme/06-workflow.md)
- [AI 智能文档 - 07-故障排查](../aireadme/07-troubleshooting.md)

