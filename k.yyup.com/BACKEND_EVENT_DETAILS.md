# 后端流式事件详细处理说明

## 📤 事件流处理链

### 1. `start` (第778-780行)
```
触发：请求开始
处理：记录日志
```

### 2. `thinking_start` (第782-785行)
```
触发：AI开始思考
处理：发出 'loading-complete' 事件
```

### 3. `thinking` / `thinking_update` (第787-816行)
```
触发：思考内容更新
处理：
  - 更新 rightSidebarThinking
  - 调用 aiResponse.showThinkingPhase()
  - 添加/更新聊天历史中的思考消息
  - 过滤：搜索进行中时跳过
```

### 4. `tool_intent` (第818-821行)
```
触发：检测到工具意图
处理：委托给 AIAssistantCore 处理
```

### 5. `tool_call_start` (第823-861行)
```
触发：开始调用工具
处理：
  - 显示 currentAIResponse
  - 关闭右侧栏加载状态
  - 添加工具调用到 functionCalls
  - 添加工具调用消息到聊天历史
```

### 6. `tool_call_complete` (第917-964行)
```
触发：工具调用完成
处理：
  - 更新工具调用状态 (completed/failed)
  - 更新聊天历史中的工具状态
  - 处理 UI 指令 (navigate, render_component)
  - 执行页面导航
```

### 7. `tool_call_description` (第967-987行)
```
触发：工具调用描述
处理：
  - 更新工具调用描述
  - 添加描述消息到聊天历史
```

### 8. `tool_narration` (第989-992行)
```
触发：工具解说
处理：委托给 AIAssistantCore 处理
```

### 9. `search_start` (第864-880行)
```
触发：开始网络搜索
处理：
  - 设置 isSearching = true
  - 添加搜索开始消息到聊天历史
  - 保存搜索消息ID用于后续更新
```

### 10. `search_progress` (第882-895行)
```
触发：搜索进度更新
处理：
  - 更新搜索消息的进度百分比
  - 更新搜索状态为 'progress'
```

### 11. `search_complete` (第897-915行)
```
触发：搜索完成
处理：
  - 更新搜索消息为完成状态
  - 设置搜索结果数量和结果列表
  - 设置 isSearching = false
```

### 12. `context_optimization_start` (第994-1007行)
```
触发：开始上下文优化
处理：
  - 调用 aiResponse.startContextOptimization()
  - 添加优化开始消息到聊天历史
```

### 13. `context_optimization_progress` (第1009-1022行)
```
触发：优化进度更新
处理：
  - 调用 aiResponse.updateOptimizationProgress()
  - 更新聊天历史中的优化进度
```

### 14. `context_optimization_complete` (第1024-1038行)
```
触发：优化完成
处理：
  - 调用 aiResponse.completeContextOptimization()
  - 更新聊天历史为完成状态
```

### 15-18. 工作流事件 (第1043-1089行)
```
workflow_step_start → 添加步骤开始消息
workflow_step_complete → 添加步骤完成消息
workflow_step_failed → 添加步骤失败消息
workflow_complete → 添加工作流完成消息
```

### 19. `content_update` / `answer_chunk` (第1091-1103行)
```
触发：答案流式更新
处理：
  - 显示答案区域
  - 设置流式标志
  - 追加答案内容
```

### 20. `answer_complete` / `final_answer` / `complete` (第1105-1173行)
```
触发：答案完成
处理：
  - 关闭流式标志
  - 关闭加载状态
  - 重置 sending 状态
  - 防重复保存：检查 currentRequestSaved
  - 添加 AI 响应到聊天历史
  - 提取组件数据用于渲染
```

### 21. `error` (第1175-1181行)
```
触发：发生错误
处理：
  - 显示错误消息
  - 重置所有状态 (sending, isLoading, rightSidebarLoading)
```

### 22. `progress` (第1183-1193行)
```
触发：通用进度消息
处理：
  - 过滤：搜索进行中时跳过
  - 记录进度日志
```

## 🔍 事件过滤机制

### 搜索期间的事件过滤
当 `isSearching.value = true` 时，以下事件被跳过：
- `thinking` / `thinking_update`
- `progress`
- 其他非搜索相关事件

这防止了搜索过程中的思考内容干扰用户界面。

