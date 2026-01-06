# AI 助手前端事件监听完整指南

## 📊 事件监听总览

前端 AI 助手共有 **27 个事件监听**：

```
3 个 Vue Watch 监听器
+ 2 个生命周期钩子
+ 22 个后端流式事件
= 27 个总事件
```

---

## 🔵 Vue Watch 监听器 (3个)

### 1. 工具调用变化监听
```typescript
// 位置：第471-481行
watch(() => currentAIResponse.value?.functionCalls?.length)
// 功能：当工具调用数量增加时，自动打开右侧栏
// 触发条件：functionCalls 数组长度变化
```

### 2. 可见性变化监听
```typescript
// 位置：第1643-1653行
watch(() => props.visible)
// 功能：记录组件可见性状态信息
// 触发条件：visible prop 变化
```

### 3. 思考消息同步监听
```typescript
// 位置：第1656-1662行
watch(() => coreRef.value?.currentThinkingMessage)
// 功能：同步 AIAssistantCore 的思考消息到 rightSidebarThinking
// 触发条件：思考消息内容更新
```

---

## 🟢 生命周期钩子 (2个)

### 1. onMounted (第1578-1630行)
```
初始化会话ID
加载用户偏好
加载专家数据
添加ESC键监听
```

### 2. onUnmounted (第1632-1640行)
```
清理全屏模式
移除ESC键监听
```

---

## 🔴 后端流式事件 (22个)

### 🤔 思考阶段 (2个)
- `thinking_start` - 开始思考
- `thinking` / `thinking_update` - 思考内容更新

### 🔧 工具调用 (4个)
- `tool_intent` - 工具意图
- `tool_call_start` - 开始调用
- `tool_call_complete` - 调用完成
- `tool_call_description` - 调用描述

### 🔍 网络搜索 (3个)
- `search_start` - 开始搜索
- `search_progress` - 搜索进度
- `search_complete` - 搜索完成

### 🧠 上下文优化 (3个)
- `context_optimization_start` - 开始优化
- `context_optimization_progress` - 优化进度
- `context_optimization_complete` - 优化完成

### 🔄 工作流执行 (4个)
- `workflow_step_start` - 步骤开始
- `workflow_step_complete` - 步骤完成
- `workflow_step_failed` - 步骤失败
- `workflow_complete` - 工作流完成

### 📝 答案生成 (3个)
- `content_update` / `answer_chunk` - 答案流式更新
- `answer_complete` / `final_answer` / `complete` - 答案完成
- `error` - 错误处理

### 📊 其他 (2个)
- `start` - 请求开始
- `progress` - 通用进度

---

## 🎯 事件处理位置

**文件**: `client/src/components/ai-assistant/AIAssistant.vue`
**函数**: `callUnifiedIntelligenceWithProgress()` (第745-1218行)
**回调**: 第774行的 switch 语句处理所有事件

---

## 🔑 关键机制

### 事件过滤
当 `isSearching = true` 时，跳过：
- `thinking` 事件
- `thinking_update` 事件
- `progress` 事件

### 防重复保存
使用 `currentRequestSaved` 标志：
- 初始值：false
- 第一次 complete：保存消息，设为 true
- 后续 complete：跳过保存

---

## 📍 核心状态变量

| 变量 | 用途 |
|-----|------|
| `rightSidebarThinking` | 存储思考内容 |
| `currentSearchMessageId` | 追踪搜索消息 |
| `currentThinkingMessageId` | 追踪思考消息 |
| `isSearching` | 搜索状态标志 |
| `currentRequestSaved` | 消息保存标志 |

---

## 📚 相关文档

- `FRONTEND_EVENT_LISTENERS.md` - 详细事件列表
- `BACKEND_EVENT_DETAILS.md` - 事件处理详情
- `EVENT_SUMMARY_TABLE.md` - 完整总结表

