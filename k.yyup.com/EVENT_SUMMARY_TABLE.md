# 前端事件监听完整总结表

## 📊 事件监听统计

| 类别 | 数量 | 说明 |
|-----|------|------|
| **Vue Watch** | 3 | 响应式数据监听 |
| **生命周期钩子** | 2 | 组件挂载/卸载 |
| **后端流式事件** | 22 | 来自后端的事件 |
| **总计** | **27** | 完整事件系统 |

---

## 🎯 事件分类详表

### 🔵 Vue Watch 监听器 (3个)

```typescript
// 1. 工具调用变化监听
watch(() => currentAIResponse.value?.functionCalls?.length)
  → 自动打开右侧栏

// 2. 可见性变化监听
watch(() => props.visible)
  → 记录状态信息

// 3. 思考消息同步监听
watch(() => coreRef.value?.currentThinkingMessage)
  → 同步到 rightSidebarThinking
```

### 🟢 生命周期钩子 (2个)

```typescript
// 1. 组件挂载
onMounted()
  → 初始化会话ID
  → 加载用户偏好
  → 加载专家数据
  → 添加ESC键监听

// 2. 组件卸载
onUnmounted()
  → 清理全屏模式
  → 移除ESC键监听
```

### 🔴 后端流式事件 (22个)

#### 🤔 思考阶段 (2个)
- `thinking_start` - 开始思考
- `thinking` / `thinking_update` - 思考内容更新

#### 🔧 工具调用 (4个)
- `tool_intent` - 工具意图
- `tool_call_start` - 开始调用
- `tool_call_complete` - 调用完成
- `tool_call_description` - 调用描述

#### 🔍 网络搜索 (3个)
- `search_start` - 开始搜索
- `search_progress` - 搜索进度
- `search_complete` - 搜索完成

#### 🧠 上下文优化 (3个)
- `context_optimization_start` - 开始优化
- `context_optimization_progress` - 优化进度
- `context_optimization_complete` - 优化完成

#### 🔄 工作流执行 (4个)
- `workflow_step_start` - 步骤开始
- `workflow_step_complete` - 步骤完成
- `workflow_step_failed` - 步骤失败
- `workflow_complete` - 工作流完成

#### 📝 答案生成 (3个)
- `content_update` / `answer_chunk` - 答案流式更新
- `answer_complete` / `final_answer` / `complete` - 答案完成
- `error` - 错误处理

#### 📊 其他 (2个)
- `start` - 请求开始
- `progress` - 通用进度

---

## 🔑 关键处理逻辑

### 事件处理位置
**文件**: `client/src/components/ai-assistant/AIAssistant.vue`
**函数**: `callUnifiedIntelligenceWithProgress()` (第745-1218行)
**回调**: 第774行的 switch 语句

### 事件过滤机制
```
当 isSearching = true 时：
  ✗ 跳过 thinking 事件
  ✗ 跳过 thinking_update 事件
  ✗ 跳过 progress 事件
  ✓ 保留 search_* 事件
```

### 防重复保存机制
```
currentRequestSaved 标志：
  - 初始值：false
  - 第一次 complete 事件：保存消息，设为 true
  - 后续 complete 事件：跳过保存
```

---

## 📍 核心状态变量

| 变量 | 类型 | 用途 |
|-----|------|------|
| `rightSidebarThinking` | string | 思考内容 |
| `currentSearchMessageId` | string | 搜索消息ID |
| `currentThinkingMessageId` | string | 思考消息ID |
| `isSearching` | boolean | 搜索状态 |
| `currentRequestSaved` | boolean | 消息保存标志 |
| `sending` | boolean | 发送状态 |
| `isLoading` | boolean | 加载状态 |

---

## 🚀 事件流时序

```
用户点击发送
    ↓
start 事件
    ↓
thinking_start 事件
    ↓
thinking 事件 (流式) ← 可能有多个
    ↓
tool_call_start 事件 (可选)
    ↓
tool_call_complete 事件 (可选)
    ↓
search_start 事件 (可选)
    ↓
search_progress 事件 (流式，可选)
    ↓
search_complete 事件 (可选)
    ↓
context_optimization_start 事件 (可选)
    ↓
context_optimization_progress 事件 (流式，可选)
    ↓
context_optimization_complete 事件 (可选)
    ↓
answer_chunk 事件 (流式)
    ↓
complete 事件
    ↓
UI 更新完成
```

