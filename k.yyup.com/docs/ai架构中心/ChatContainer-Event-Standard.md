# ChatContainer 事件与接口统一化方案

更新时间：当前分支

## 目标
- 统一全屏/侧边栏模式下 ChatContainer 的 props & emits
- 降低事件名分歧（@send-message vs @send）带来的维护成本与遗漏风险

## 标准接口

### Props（只列关键）
- messages: Message[]
- currentAIResponse: CurrentAIResponse
- sending: boolean
- autoExecute: boolean
- webSearch: boolean
- messageFontSize: number
- isThinking?: boolean
- isLoading?: boolean
- isListening?: boolean
- isSpeaking?: boolean
- speechStatus?: string
- showThinkingSubtitle?: boolean
- suggestions?: any[]

### Emits（统一）
- send（payload?: { text?: string }）
- cancel
- update:input-message
- update:auto-execute
- update:web-search
- toggle-voice
- toggle-listening
- stop-speaking
- upload-file
- upload-image
- toggle-font-size
- toggle-quick-query-groups
- toggle-context-optimization
- close-mobile-preview
- toggle-thinking

说明：仅保留标准事件 'send'。不再保留 'send-message' 兼容别名，避免双监听与重复发送风险。

## 迁移计划
1) ChatContainer 内部：
```ts
// 现在统一：this.$emit('send')
```
2) AIAssistantRefactored.vue：
- 全屏插槽：已统一为 @send
- 侧边栏插槽：已使用 @send，保持一致
3) 其他使用方：批量替换监听事件为 @send
4) 已移除 ChatContainer 的 'send-message' 兼容发射

## 兼容适配（临时）
- 在合成页做小适配：
```vue
<ChatContainer @send="handleSendMessage" />
```
- 以避免尚未修改的下游影响，同时统一处理逻辑在一个入口

## 风险与回滚
- 风险：旧代码只监听 'send-message' 导致事件不触发
- 降低：已全仓库替换为 'send'；如遇遗漏，定位并替换
- 回滚：不建议回滚；如必须，临时在调用处转发 'send' → 'send-message'

## 测试清单
- 单测：
  - 触发发送：应触发 'send'
  - update:input-message / update:auto-execute 行为正确
- 端到端：
  - 全屏/侧边栏均触发 handleSendMessage
  - Auto=ON/OFF 两模式行为一致
- 可视回归：
  - 无新增控制台错误；右侧步骤与答案渲染不受影响

## 后续演进
- 将 ChatContainer 的 props 精简为 UI 所需最小集；业务状态通过 composables 注入
- 对语音与建议区域拆分子组件，降低 ChatContainer 体积

