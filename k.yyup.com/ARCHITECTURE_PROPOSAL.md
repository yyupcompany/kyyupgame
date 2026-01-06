# AI 助手架构重构方案

## 🎯 核心问题

当前 AIAssistant.vue 和 AIAssistantFullPage.vue 共享全局实例，导致：
- ❌ 事件监听冲突
- ❌ 状态污染
- ❌ 难以独立调试
- ❌ 代码耦合度高

---

## ✅ 推荐方案：混合架构

### 架构图

```
AIAssistant.vue (入口/路由)
│
├─ 检查 mode 参数
│
├─ mode='sidebar' → AIAssistantSidebar.vue
│   └─ useAIAssistantLogic(mode='sidebar')
│       ├─ 独立的事件监听 (27个)
│       ├─ 独立的状态管理
│       └─ 独立的 Composable 实例
│
└─ mode='fullpage' → AIAssistantFullPage.vue
    └─ useAIAssistantLogic(mode='fullpage')
        ├─ 独立的事件监听 (22个)
        ├─ 独立的状态管理
        └─ 独立的 Composable 实例
```

---

## 📋 实现步骤

### 1. 创建统一的 Composable

**文件**: `composables/useAIAssistantLogic.ts`

```typescript
export function useAIAssistantLogic(mode: 'sidebar' | 'fullpage') {
  // 独立的状态
  const state = reactive({
    messages: [],
    sending: false,
    currentAIResponse: null,
    // ... 其他状态
  })

  // 独立的事件监听
  const setupEventListeners = () => {
    // 根据 mode 设置不同的监听
    if (mode === 'sidebar') {
      // 侧边栏特定的监听
    } else {
      // 全屏特定的监听
    }
  }

  // 独立的方法
  const handleSendMessage = async () => { ... }
  const handleStopSending = () => { ... }
  // ... 其他方法

  return {
    state,
    setupEventListeners,
    handleSendMessage,
    handleStopSending,
    // ... 其他方法
  }
}
```

### 2. 修改 AIAssistant.vue 为入口

**文件**: `AIAssistant.vue`

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
  mode?: 'sidebar' | 'fullpage'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'sidebar'
})

const currentComponent = computed(() => {
  return props.mode === 'sidebar' 
    ? AIAssistantSidebar 
    : AIAssistantFullPage
})
</script>
```

### 3. 创建侧边栏版本

**文件**: `AIAssistantSidebar.vue`

```vue
<template>
  <SidebarLayout v-if="props.visible">
    <!-- 使用独立的 Composable 实例 -->
    <ChatContainer
      :messages="state.messages"
      :sending="state.sending"
      @send="handleSendMessage"
    />
  </SidebarLayout>
</template>

<script setup lang="ts">
import { useAIAssistantLogic } from './composables/useAIAssistantLogic'

const { state, handleSendMessage } = useAIAssistantLogic('sidebar')
</script>
```

### 4. 创建全屏版本

**文件**: `AIAssistantFullPage.vue`

```vue
<template>
  <FullPageLayout v-if="props.visible">
    <!-- 使用独立的 Composable 实例 -->
    <FullPageDialog
      :messages="state.messages"
      :sending="state.sending"
      @send="handleSendMessage"
    />
  </FullPageLayout>
</template>

<script setup lang="ts">
import { useAIAssistantLogic } from './composables/useAIAssistantLogic'

const { state, handleSendMessage } = useAIAssistantLogic('fullpage')
</script>
```

---

## 🎯 方案优势

| 优势 | 说明 |
|-----|------|
| **完全隔离** | 每个模式有独立的 Composable 实例 |
| **无代码重复** | 共享逻辑在 Composable 中 |
| **易于维护** | 修改逻辑只需改一个地方 |
| **易于扩展** | 添加新模式只需创建新组件 |
| **易于调试** | 每个实例独立，不会互相干扰 |
| **性能优化** | 只加载需要的模式 |

---

## 📊 对比

### 当前方案 ❌
```
全局实例 → 事件冲突 → 难以维护
```

### 新方案 ✅
```
独立实例 → 事件隔离 → 易于维护
```

---

## 🚀 迁移计划

1. **第一步**: 创建 `useAIAssistantLogic` Composable
2. **第二步**: 创建 `AIAssistantSidebar.vue`
3. **第三步**: 修改 `AIAssistantFullPage.vue`
4. **第四步**: 修改 `AIAssistant.vue` 为入口
5. **第五步**: 测试和调试
6. **第六步**: 删除全局实例代码

---

## 💡 关键点

- ✅ 每个模式都有自己的 Composable 实例
- ✅ 事件监听完全隔离
- ✅ 状态管理独立
- ✅ 代码复用最大化
- ✅ 维护成本最小化

