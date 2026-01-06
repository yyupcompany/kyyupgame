<!--
  函数调用列表组件
  从 AIAssistant.vue 第130-153行模板提取
-->

<template>
  <div class="function-calls-container">
    <FunctionCallItem
      v-for="(functionCall, index) in functionCalls"
      :key="functionCall.callId || index"
      :function-call="functionCall"
      :sequence="index + 1"
      :total="functionCalls.length"
      @retry="handleRetry"
      @view-details="handleViewDetails"
      @export-result="handleExportResult"
    />
  </div>
</template>

<script setup lang="ts">
import FunctionCallItem from './FunctionCallItem.vue'
import type { FunctionCallState } from '../types/aiAssistant'

// ==================== Props ====================
interface Props {
  functionCalls: FunctionCallState[]
}

const props = defineProps<Props>()

// ==================== Emits ====================
interface Emits {
  'retry': [functionCall: FunctionCallState]
  'view-details': [functionCall: FunctionCallState]
  'export-result': [functionCall: FunctionCallState]
}

const emit = defineEmits<Emits>()

// ==================== 事件处理 ====================
const handleRetry = (functionCall: FunctionCallState) => {
  emit('retry', functionCall)
}

const handleViewDetails = (functionCall: FunctionCallState) => {
  emit('view-details', functionCall)
}

const handleExportResult = (functionCall: FunctionCallState) => {
  emit('export-result', functionCall)
}
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入
.function-calls-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  max-height: 320px;
  overflow-y: auto;
  padding-right: var(--spacing-sm);
  scroll-behavior: smooth;
  border-radius: var(--radius-lg);
}

.function-calls-container::-webkit-scrollbar {
  width: 6px;
}

.function-calls-container::-webkit-scrollbar-track {
  background: transparent;
  border-radius: var(--radius-full);
}

.function-calls-container::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--radius-full);

  &:hover {
    background: var(--text-placeholder);
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .function-calls-container {
    max-height: 260px;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .function-calls-container {
    max-height: 220px;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
  }
}
</style>
