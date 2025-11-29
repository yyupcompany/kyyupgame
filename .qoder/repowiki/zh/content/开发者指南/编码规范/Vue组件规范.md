# Vue组件规范

<cite>
**本文档引用的文件**   
- [ai-chat-interface-fixed.vue](file://ai-chat-interface-fixed.vue)
- [BatchImportConfirmDialog.vue](file://BatchImportConfirmDialog.vue)
- [MobileAiAssistant.vue](file://client/aimobile/components/MobileAiAssistant.vue)
- [MobileExpertChat.vue](file://client/aimobile/components/MobileExpertChat.vue)
- [ActivityConfirmDialog.vue](file://client/aimobile/components/dialogs/ActivityConfirmDialog.vue)
- [MarkdownRenderer.vue](file://client/aimobile/components/common/MarkdownRenderer.vue)
- [MobileSidebar.vue](file://client/aimobile/components/MobileSidebar.vue)
- [MobileTabBar.vue](file://client/aimobile/components/MobileTabBar.vue)
</cite>

## 目录
1. [组件命名与结构规范](#组件命名与结构规范)
2. [组合式API使用规范](#组合式api使用规范)
3. [Props定义规范](#props定义规范)
4. [组件事件通信规范](#组件事件通信规范)
5. [插槽使用指南](#插槽使用指南)
6. [组件间通信边界](#组件间通信边界)

## 组件命名与结构规范

Vue单文件组件应遵循统一的命名和结构规范，以确保代码的一致性和可维护性。组件命名采用PascalCase（大驼峰）格式，这在项目中的多个组件文件中得到了验证，如`MobileAiAssistant.vue`、`MobileSidebar.vue`等。

单文件组件的结构必须按照`<template>`、`<script>`、`<style>`的顺序排列。这种结构在`ai-chat-interface-fixed.vue`和`BatchImportConfirmDialog.vue`等文件中得到了一致的应用。`<template>`部分包含组件的HTML模板，`<script>`部分包含组件的JavaScript逻辑，`<style>`部分包含组件的CSS样式。

```vue
<template>
  <!-- 组件的HTML模板 -->
</template>

<script setup lang="ts">
// 组件的JavaScript逻辑
</script>

<style scoped>
/* 组件的CSS样式 */
</style>
```

**Section sources**
- [ai-chat-interface-fixed.vue](file://ai-chat-interface-fixed.vue)
- [BatchImportConfirmDialog.vue](file://BatchImportConfirmDialog.vue)

## 组合式API使用规范

组合式API是Vue 3的核心特性，应正确使用`ref`、`reactive`、`computed`等响应式API来管理组件状态。

### ref
`ref`用于创建一个响应式的数据引用，适用于基本数据类型。当`ref`的值发生变化时，Vue会自动更新DOM。在`MobileAiAssistant.vue`中，`inputText`被定义为一个`ref`，用于绑定输入框的值。

```typescript
import { ref } from 'vue'
const inputText = ref('')
```

### reactive
`reactive`用于创建一个响应式的对象。它将深层地转换对象及其嵌套对象为响应式。在`ActivityConfirmDialog.vue`中，`editableData`被定义为一个`reactive`对象，用于管理可编辑的活动数据。

```typescript
import { reactive } from 'vue'
const editableData = reactive({
  title: '',
  description: '',
  location: ''
})
```

### computed
`computed`用于创建计算属性，它会基于其依赖的响应式数据进行缓存，只有当依赖发生变化时才会重新计算。在`MobileAiAssistant.vue`中，`canSend`被定义为一个`computed`属性，用于判断是否可以发送消息。

```typescript
import { computed } from 'vue'
const canSend = computed(() => inputText.value.trim().length > 0 && !isLoading.value)
```

**Section sources**
- [MobileAiAssistant.vue](file://client/aimobile/components/MobileAiAssistant.vue#L301-L306)
- [ActivityConfirmDialog.vue](file://client/aimobile/components/dialogs/ActivityConfirmDialog.vue#L240-L250)
- [MobileAiAssistant.vue](file://client/aimobile/components/MobileAiAssistant.vue#L341-L343)

## Props定义规范

Props是组件间通信的重要方式，必须进行严格的类型声明和提供默认值（如适用）。在TypeScript中，应使用接口（interface）来定义props的类型。

在`MobileExpertChat.vue`中，props被定义为一个接口`Props`，并使用`defineProps`进行类型声明。`selectedExpertId`和`availableExperts`都有明确的类型定义。

```typescript
interface Props {
  visible: boolean
  data: any
}

const props = defineProps<Props>()
```

对于有默认值的props，应使用`withDefaults`函数。在`MobileAiAssistant.vue`中，`position`和`showFloatingButton`都提供了默认值。

```typescript
interface Props {
  visible: boolean
  position?: { bottom: string; right: string }
  showFloatingButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: () => ({ bottom: '80px', right: '20px' }),
  showFloatingButton: true
})
```

**Section sources**
- [MobileExpertChat.vue](file://client/aimobile/components/MobileExpertChat.vue#L210-L214)
- [MobileAiAssistant.vue](file://client/aimobile/components/MobileAiAssistant.vue#L276-L285)

## 组件事件通信规范

组件事件通信应使用`emits`选项明确定义触发的事件，以提高代码的可读性和可维护性。`emits`选项可以是一个字符串数组，也可以是一个对象，后者可以进行事件参数的验证。

在`BatchImportConfirmDialog.vue`中，`emits`被定义为一个对象，明确列出了组件会触发的所有事件及其参数类型。

```typescript
interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', data: any): void
  (e: 'cancel'): void
  (e: 'adjust-mapping', data: any): void
}

const emit = defineEmits<Emits>()
```

在触发事件时，应使用`emit`函数，并传入事件名和参数。在`handleConfirm`方法中，通过`emit('confirm', props.confirmationData)`触发了`confirm`事件。

```typescript
const handleConfirm = async () => {
  // ... 处理逻辑
  emit('confirm', props.confirmationData)
}
```

**Section sources**
- [BatchImportConfirmDialog.vue](file://client/aimobile/components/dialogs/BatchImportConfirmDialog.vue#L215-L223)
- [BatchImportConfirmDialog.vue](file://client/aimobile/components/dialogs/BatchImportConfirmDialog.vue#L252-L262)

## 插槽使用指南

插槽（Slot）是Vue中实现内容分发的强大机制，包括默认插槽、具名插槽和作用域插槽。

### 具名插槽
具名插槽允许组件有多个插槽，通过`name`属性来区分。在`MobileSidebar.vue`中，虽然没有直接使用具名插槽，但其结构设计为可扩展的，未来可以轻松添加具名插槽来定制不同区域的内容。

### 作用域插槽
作用域插槽允许父组件访问子组件的数据。在`ActivityListResult.vue`中，虽然没有直接使用作用域插槽，但其设计模式体现了作用域插槽的思想。组件通过`emit`将活动数据传递给父组件，父组件可以根据这些数据进行不同的处理。

```vue
<template>
  <div class="activity-list-result">
    <div v-for="activity in data.activities" :key="activity.id" @click="handleActivityClick(activity)">
      <!-- 活动内容 -->
    </div>
  </div>
</template>

<script setup lang="ts">
const handleActivityClick = (activity: Activity) => {
  emit('action', 'view-activity', activity)
}
</script>
```

**Section sources**
- [MobileSidebar.vue](file://client/aimobile/components/MobileSidebar.vue)
- [ActivityListResult.vue](file://client/aimobile/components/results/ActivityListResult.vue#L142-L144)

## 组件间通信边界

为了避免深层嵌套的prop传递，应明确规定组件间通信的边界。推荐使用事件总线、Vuex/Pinia状态管理或provide/inject API来实现跨层级组件通信。

在`MobileAiAssistant.vue`中，组件通过`emit`将事件传递给父组件，而不是通过深层prop传递。这种方式清晰地定义了组件间的通信边界。

```typescript
const openAssistant = () => {
  visible.value = true
  hasNewMessage.value = false
  nextTick(() => {
    scrollToBottom()
  })
}
```

对于更复杂的状态管理，应使用Pinia。在`MobileAiAssistant.vue`中，通过`useAiAssistantStore`和`useUserStore`来管理全局状态，避免了通过props层层传递用户信息和AI助手状态。

```typescript
import { useUserStore } from '@/stores/user'
import { useAiAssistantStore } from '../stores/ai-assistant'

const userStore = useUserStore()
const aiStore = useAiAssistantStore()
```

**Section sources**
- [MobileAiAssistant.vue](file://client/aimobile/components/MobileAiAssistant.vue#L296-L298)
- [MobileAiAssistant.vue](file://client/aimobile/components/MobileAiAssistant.vue#L252-L253)