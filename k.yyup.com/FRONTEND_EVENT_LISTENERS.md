# 前端 AI 助手事件监听完整文档

## 📋 事件监听分类

### 1️⃣ Vue Watch 监听器 (3个)

| 监听对象 | 位置 | 功能 | 触发条件 |
|---------|------|------|---------|
| `functionCalls.length` | 第471-481行 | 自动打开右侧栏 | 工具调用数量增加 |
| `props.visible` | 第1643-1653行 | 记录可见性状态 | visible prop 变化 |
| `coreRef.currentThinkingMessage` | 第1656-1662行 | 同步思考消息 | 思考内容更新 |

### 2️⃣ 生命周期钩子 (2个)

| 钩子 | 位置 | 功能 |
|-----|------|------|
| `onMounted` | 第1578-1630行 | 初始化会话、加载偏好、添加键盘监听 |
| `onUnmounted` | 第1632-1640行 | 清理全屏模式、移除键盘监听 |

### 3️⃣ 后端流式事件处理 (22个)

#### 🤔 思考相关 (3个)
- `thinking_start` - 开始思考
- `thinking` / `thinking_update` - 思考内容更新

#### 🔧 工具调用相关 (4个)
- `tool_intent` - 工具意图
- `tool_call_start` - 开始工具调用
- `tool_call_complete` - 工具调用完成
- `tool_call_description` - 工具调用描述

#### 🔍 搜索相关 (3个)
- `search_start` - 开始搜索
- `search_progress` - 搜索进度
- `search_complete` - 搜索完成

#### 🧠 上下文优化 (3个)
- `context_optimization_start` - 开始优化
- `context_optimization_progress` - 优化进度
- `context_optimization_complete` - 优化完成

#### 🔄 工作流相关 (4个)
- `workflow_step_start` - 步骤开始
- `workflow_step_complete` - 步骤完成
- `workflow_step_failed` - 步骤失败
- `workflow_complete` - 工作流完成

#### 📝 答案相关 (3个)
- `content_update` / `answer_chunk` - 答案流式更新
- `answer_complete` / `final_answer` / `complete` - 答案完成
- `error` - 错误处理

#### 📊 其他 (2个)
- `start` - 请求开始
- `progress` - 通用进度

## 🎯 关键事件处理流程

### 思考过程
```
thinking_start → thinking/thinking_update → (显示在右侧栏)
```

### 工具调用
```
tool_call_start → tool_call_description → tool_call_complete
```

### 搜索流程
```
search_start → search_progress → search_complete
```

### 上下文优化
```
context_optimization_start → context_optimization_progress → context_optimization_complete
```

### 工作流执行
```
workflow_step_start → workflow_step_complete/failed → workflow_complete
```

## 📍 事件处理位置

所有后端流式事件在 `callUnifiedIntelligenceWithProgress()` 函数中处理
- 位置：第745-1218行
- 回调函数：第774行的 `(event) => { switch(event.type) { ... } }`

## 🔑 重要状态变量

| 变量 | 用途 |
|-----|------|
| `rightSidebarThinking` | 存储思考内容 |
| `currentSearchMessageId` | 追踪搜索消息 |
| `currentThinkingMessageId` | 追踪思考消息 |
| `isSearching` | 搜索状态标志 |
| `currentRequestSaved` | 防止消息重复保存 |

