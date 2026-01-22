<template>
  <div class="a2ui-question-base">
    <div class="question-header">
      <span v-if="questionNumber" class="question-number">{{ questionNumber }}</span>
      <h3 class="question-title">{{ title }}</h3>
    </div>

    <div class="question-content">
      <slot />
    </div>

    <div class="question-footer">
      <div v-if="showHint" class="question-hint">
        <el-icon><InfoFilled /></el-icon>
        <span>{{ hint }}</span>
      </div>

      <div v-if="showFeedback" class="question-feedback" :class="feedbackType">
        <el-icon>
          <CircleCheck v-if="feedbackType === 'success'" />
          <CircleClose v-else />
        </el-icon>
        <span>{{ feedbackMessage }}</span>
      </div>
    </div>

    <div v-if="showSubmit" class="question-actions">
      <el-button type="primary" :disabled="!canSubmit" @click="handleSubmit">
        {{ submitText }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { InfoFilled, CircleCheck, CircleClose } from '@element-plus/icons-vue';
import type { A2UIEvent } from '@/types/a2ui-protocol';

interface Props {
  title: string;
  questionNumber?: string;
  hint?: string;
  showHint?: boolean;
  showFeedback?: boolean;
  feedbackType?: 'success' | 'error';
  feedbackMessage?: string;
  showSubmit?: boolean;
  submitText?: string;
  canSubmit?: boolean;
}

withDefaults(defineProps<Props>(), {
  title: '',
  showHint: false,
  showFeedback: false,
  feedbackType: 'success',
  showSubmit: true,
  submitText: '提交答案',
  canSubmit: false
});

const emit = defineEmits<{
  (e: 'event', event: A2UIEvent): void;
  (e: 'submit'): void;
}>();

function handleSubmit() {
  emit('submit');
  emitEvent('question.submit', {});
}

function emitEvent(eventType: string, payload: Record<string, any>) {
  const event: A2UIEvent = {
    messageId: crypto.randomUUID(),
    componentId: 'question-base',
    eventType,
    payload,
    sessionId: ''
  };
  emit('event', event);
}
</script>

<style scoped lang="scss">
.a2ui-question-base {
  background: var(--el-bg-color-page);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.question-number {
  background: var(--el-color-primary);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.question-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.question-content {
  margin-bottom: 16px;
}

.question-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.question-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  padding: 8px 12px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.question-feedback {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  padding: 10px 14px;
  border-radius: 8px;

  &.success {
    color: var(--el-color-success);
    background: var(--el-color-success-light-9);
  }

  &.error {
    color: var(--el-color-danger);
    background: var(--el-color-danger-light-9);
  }
}

.question-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
