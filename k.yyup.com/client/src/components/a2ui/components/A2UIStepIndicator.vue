<template>
  <div class="a2ui-step-indicator" :class="`direction-${direction}`">
    <div
      v-for="(step, index) in steps"
      :key="step.id"
      class="step-item"
      :class="{
        'step-active': index === currentStep,
        'step-completed': index < currentStep,
        'step-pending': index > currentStep
      }"
      @click="handleStepClick(index)"
    >
      <div class="step-indicator">
        <div class="step-number">
          <el-icon v-if="index < currentStep"><Check /></el-icon>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div v-if="showNumber" class="step-line" />
      </div>
      <div class="step-content">
        <div class="step-title">{{ step.title }}</div>
        <div v-if="step.description" class="step-description">{{ step.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check } from '@element-plus/icons-vue';
import type { A2UIEvent } from '@/types/a2ui-protocol';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface Props {
  steps: Step[];
  currentStep: number;
  direction?: 'horizontal' | 'vertical';
  showNumber?: boolean;
  sessionId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'horizontal',
  showNumber: true,
  sessionId: ''
});

const emit = defineEmits<{
  (e: 'event', event: A2UIEvent): void;
  (e: 'stepChange', step: number): void;
}>();

function handleStepClick(index: number) {
  if (index <= props.currentStep) {
    emitEvent('navigation.step', { currentStep: index, direction: 'backward' });
    emit('stepChange', index);
  }
}

function emitEvent(eventType: string, payload: Record<string, any>) {
  const event: A2UIEvent = {
    messageId: crypto.randomUUID(),
    componentId: 'step-indicator',
    eventType,
    payload,
    sessionId: props.sessionId
  };
  emit('event', event);
}
</script>

<style scoped lang="scss">
.a2ui-step-indicator {
  display: flex;

  &.direction-horizontal {
    flex-direction: row;
    gap: 0;

    .step-item {
      flex: 1;
    }

    .step-indicator {
      flex-direction: row;
    }

    .step-line {
      width: 100%;
      height: 2px;
    }

    .step-content {
      text-align: center;
    }
  }

  &.direction-vertical {
    flex-direction: column;
    gap: 16px;

    .step-line {
      width: 2px;
      height: 40px;
    }
  }
}

.step-item {
  display: flex;
  align-items: center;
  cursor: pointer;

  &.step-pending {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.step-indicator {
  display: flex;
  align-items: center;
  position: relative;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--el-fill-color-light);
  border: 2px solid var(--el-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  z-index: 1;
  transition: all 0.3s;
}

.step-item.step-active .step-number {
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
  color: #fff;
  box-shadow: 0 0 0 4px var(--el-color-primary-light-7);
}

.step-item.step-completed .step-number {
  background: var(--el-color-success);
  border-color: var(--el-color-success);
  color: #fff;
}

.step-line {
  background: var(--el-border-color);
  transition: background 0.3s;
}

.step-item.step-completed .step-line {
  background: var(--el-color-success);
}

.step-content {
  margin-left: 12px;
  flex: 1;
}

.step-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.step-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
