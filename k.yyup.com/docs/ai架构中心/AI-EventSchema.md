# AI 事件 Schema 统一规范（SSE/Socket）

更新时间：当前分支

## 目标
- 统一前后端在多轮/工具调用过程中的事件命名、顺序与载荷结构
- 降低字段漂移导致的“无答案/循环/状态错乱”风险
- 为日志追踪与测试提供稳定契约（schemaVersion）

## 事件流时序（标准）
1) thinking（可多次/可选）
2) function_call（可多次）→ function_result（与调用成对出现）
3) render_component（可选）→ render_complete（可选）
4) final_answer（可选）
5) complete（必发，代表本轮结束）

说明：若发生渲染，下一轮需禁用工具（tool_choice=none，或 filteredTools=[]），促使模型生成总结/答案。

## 通用事件字段
- event: string（事件名）
- schemaVersion: '1.0'
- conversationId: string
- round: number（从1开始，递增）
- timestamp: string (ISO8601)
- traceId?: string（可选）
- userId?: string（可选）
- meta?: Record<string, any>

## 事件载荷定义（TypeScript）
```ts
export interface BaseEvent {
  event: 'thinking'|'function_call'|'function_result'|'render_component'|'render_complete'|'final_answer'|'complete'|'error';
  schemaVersion: '1.0';
  conversationId: string;
  round: number;
  timestamp: string; // ISO8601
  traceId?: string;
  userId?: string;
  meta?: Record<string, any>;
}

export interface ThinkingEvent extends BaseEvent {
  event: 'thinking';
  data: { content: string; append?: boolean };
}

export interface FunctionCallEvent extends BaseEvent {
  event: 'function_call';
  data: { toolCallId: string; name: string; args: Record<string, any> };
}

export interface FunctionResultEvent extends BaseEvent {
  event: 'function_result';
  data: { toolCallId: string; name: string; ok: boolean; result?: any; error?: { code: string; message: string } };
}

export interface RenderComponentEvent extends BaseEvent {
  event: 'render_component';
  data: { component: string; props: any; title?: string; contentType?: string };
}

export interface RenderCompleteEvent extends BaseEvent {
  event: 'render_complete';
  data: { message?: string };
}

export interface FinalAnswerEvent extends BaseEvent {
  event: 'final_answer';
  data: { content: string };
}

export interface CompleteEvent extends BaseEvent {
  event: 'complete';
  data?: { summary?: string; reason?: string };
}

export interface ErrorEvent extends BaseEvent {
  event: 'error';
  data: { code: string; message: string; details?: any };
}
```

## 工具策略与阶段切换
- 首轮：tool_choice='required'（至少一次工具）
- 后续：tool_choice='auto'
- 若本轮出现 render_component：
  - 发出 render_complete
  - 将下一轮 tool_choice='none' 且 filteredTools=[]（两者同时生效）
  - 期望下一轮发出 final_answer 或直接 complete

## 前后端映射
- 前端 useAIResponse.currentAIResponse
  - thinking.data.content → thinking.content（追加取决于 append）
  - function_call/result → functionCalls[]（按 toolCallId 归并）
  - render_component → renderedComponents & HtmlPreview（若开启）
  - final_answer → answer.content & answer.visible=true
  - complete → 停止右侧 loading；若无答案，触发兜底总结

- 后端 unified-intelligence.service.ts
  - 严格按时序发事件
  - 渲染后设置 stopAfterRender=true；下一轮清空工具并将 tool_choice=none

## 示例（渲染后收敛一轮）
```json
{
  "event": "render_complete",
  "schemaVersion": "1.0",
  "conversationId": "c-123",
  "round": 1,
  "timestamp": "2025-10-18T10:00:00.000Z",
  "data": { "message": "页面渲染完成，进入总结阶段" }
}
```

## 版本与向后兼容
- 当前 schemaVersion=1.0
- 如需新增字段，保持向后兼容并增加 meta 承载；破坏性变更需升级至 2.0 并提供兼容分支

## 验证与测试
- 单测：对每类事件进行 schema 校验与顺序断言
- 集成：模拟渲染路径，断言“下一轮 tool_choice=none & 无工具定义”
- E2E：MCP 跑通“图表渲染→总结”路径，确认右侧步骤保留、聊天区有答案/总结

