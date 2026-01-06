# AI 助手架构重构实现指南

## 📋 实现步骤

### 第一步：创建 useAIAssistantLogic Composable

**文件**: `client/src/components/ai-assistant/composables/useAIAssistantLogic.ts`

```typescript
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import { callUnifiedIntelligenceStream } from '@/api/endpoints/function-tools'

export function useAIAssistantLogic(mode: 'sidebar' | 'fullpage') {
  // 独立的状态
  const state = reactive({
    messages: [],
    sending: false,
    currentAIResponse: null,
    isThinking: false,
    thinkingSubtitle: '',
    toolCalls: [],
    inputMessage: '',
    webSearch: false,
    messageFontSize: 14,
    // ... 其他状态
  })

  // 独立的事件监听
  const setupEventListeners = () => {
    // 根据 mode 设置不同的监听
    if (mode === 'sidebar') {
      // 侧边栏特定的监听
      console.log('🔵 [侧边栏模式] 事件监听已设置')
    } else {
      // 全屏特定的监听
      console.log('🟢 [全屏模式] 事件监听已设置')
    }
  }

  // 独立的方法
  const handleSendMessage = async () => {
    if (!state.inputMessage.trim() || state.sending) return
    
    const message = state.inputMessage.trim()
    state.inputMessage = ''
    state.sending = true
    
    state.messages.push({ role: 'user', content: message })
    
    await callUnifiedIntelligenceStream(
      { message },
      (event) => {
        // 处理事件
        switch (event.type) {
          case 'thinking_start':
            state.isThinking = true
            break
          case 'answer_chunk':
            // 更新答案
            break
          // ... 其他事件
        }
      }
    )
    
    state.sending = false
  }

  const handleStopSending = () => {
    state.sending = false
  }

  // 生命周期
  onMounted(() => {
    setupEventListeners()
  })

  onUnmounted(() => {
    // 清理
  })

  return {
    state,
    handleSendMessage,
    handleStopSending,
    // ... 其他方法
  }
}
```

### 第二步：创建 AIAssistantSidebar.vue

**文件**: `client/src/components/ai-assistant/AIAssistantSidebar.vue`

```vue
<template>
  <SidebarLayout v-if="props.visible">
    <ChatContainer
      :messages="state.messages"
      :sending="state.sending"
      :current-ai-response="state.currentAIResponse"
      @send="handleSendMessage"
      @stop-sending="handleStopSending"
    />
  </SidebarLayout>
</template>

<script setup lang="ts">
import { useAIAssistantLogic } from './composables/useAIAssistantLogic'
import SidebarLayout from './layout/SidebarLayout.vue'
import ChatContainer from './chat/ChatContainer.vue'

interface Props {
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: true
})

// 使用独立的 Composable 实例
const { state, handleSendMessage, handleStopSending } = useAIAssistantLogic('sidebar')
</script>
```

### 第三步：修改 AIAssistantFullPage.vue

**文件**: `client/src/components/ai-assistant/AIAssistantFullPage.vue`

```vue
<template>
  <FullPageLayout v-if="props.visible">
    <template #header>
      <FullPageHeader />
    </template>
    <template #dialog>
      <FullPageDialog
        :messages="state.messages"
        :sending="state.sending"
        @send="handleSendMessage"
      />
    </template>
    <template #input>
      <InputArea
        v-model:input-message="state.inputMessage"
        :sending="state.sending"
        @send="handleSendMessage"
      />
    </template>
  </FullPageLayout>
</template>

<script setup lang="ts">
import { useAIAssistantLogic } from './composables/useAIAssistantLogic'
import FullPageLayout from './layout/full-page/FullPageLayout.vue'
import FullPageHeader from './layout/full-page/FullPageHeader.vue'
import FullPageDialog from './layout/full-page/FullPageDialog.vue'
import InputArea from './input/InputArea.vue'

interface Props {
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: true
})

// 使用独立的 Composable 实例
const { state, handleSendMessage } = useAIAssistantLogic('fullpage')
</script>
```

### 第四步：修改 AIAssistant.vue 为入口

**文件**: `client/src/components/ai-assistant/AIAssistant.vue`

```vue
<template>
  <component
    :is="currentComponent"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AIAssistantSidebar from './AIAssistantSidebar.vue'
import AIAssistantFullPage from './AIAssistantFullPage.vue'

interface Props {
  visible?: boolean
  mode?: 'sidebar' | 'fullpage'
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
  mode: 'sidebar'
})

const currentComponent = computed(() => {
  return props.mode === 'sidebar' 
    ? AIAssistantSidebar 
    : AIAssistantFullPage
})
</script>
```

---

## 🎯 关键优势

| 优势 | 说明 |
|-----|------|
| **完全隔离** | 每个模式有独立的 Composable 实例 |
| **无代码重复** | 共享逻辑在 Composable 中 |
| **易于维护** | 修改逻辑只需改一个地方 |
| **易于扩展** | 添加新模式只需创建新组件 |
| **易于调试** | 每个实例独立，不会互相干扰 |

---

## 📊 文件结构

```
client/src/components/ai-assistant/
├── AIAssistant.vue (入口/路由)
├── AIAssistantSidebar.vue (侧边栏版本)
├── AIAssistantFullPage.vue (全屏版本)
├── composables/
│   └── useAIAssistantLogic.ts (共享逻辑)
├── layout/
│   ├── SidebarLayout.vue
│   └── full-page/
│       ├── FullPageLayout.vue
│       ├── FullPageHeader.vue
│       └── FullPageDialog.vue
└── ...
```

---

## 🚀 使用方式

**侧边栏模式**
```vue
<AIAssistant mode="sidebar" v-model:visible="visible" />
```

**全屏模式**
```vue
<AIAssistant mode="fullpage" v-model:visible="visible" />
```

**或在路由中**
```typescript
{
  path: '/aiassistant',
  component: () => import('@/components/ai-assistant/AIAssistant.vue'),
  props: { mode: 'fullpage' }
}
```

