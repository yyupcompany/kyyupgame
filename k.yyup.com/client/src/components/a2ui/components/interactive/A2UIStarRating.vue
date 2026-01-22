<template>
  <div class="a2ui-star-rating">
    <div class="rating-header" v-if="title">
      <h3 class="rating-title">{{ title }}</h3>
      <p v-if="description" class="rating-description">{{ description }}</p>
    </div>

    <div class="rating-stars" :class="{ readonly: readonly }">
      <button
        v-for="star in maxStars"
        :key="star"
        type="button"
        class="star-btn"
        :class="{
          filled: star <= displayValue,
          half: showHalfStars && star === Math.ceil(displayValue) && !Number.isInteger(displayValue)
        }"
        :disabled="readonly"
        @click="handleClick(star)"
        @mouseenter="handleMouseEnter(star)"
        @mouseleave="handleMouseLeave"
      >
        <el-icon :size="starSize" class="star-icon">
          <StarFilled v-if="star <= displayValue" />
          <Star v-else />
        </el-icon>
      </button>
    </div>

    <div v-if="showValue && displayValue > 0" class="rating-value">
      {{ displayValue }} / {{ maxStars }}
    </div>

    <div v-if="showLabels && displayValue > 0" class="rating-label">
      {{ getLabel(displayValue) }}
    </div>

    <div v-if="showFeedback && touched" class="rating-feedback">
      {{ getFeedbackMessage() }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Star, StarFilled } from '@element-plus/icons-vue';
import type { A2UIEvent } from '@/types/a2ui-protocol';

interface Props {
  title?: string;
  description?: string;
  maxStars?: number;
  value?: number;
  starSize?: number;
  showHalfStars?: boolean;
  showValue?: boolean;
  showLabels?: boolean;
  showFeedback?: boolean;
  readonly?: boolean;
  labels?: string[];
  feedbackMessages?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  maxStars: 5,
  value: 0,
  starSize: 32,
  showHalfStars: false,
  showValue: true,
  showLabels: true,
  showFeedback: true,
  readonly: false,
  labels: () => ['非常差', '较差', '一般', '较好', '非常好'],
  feedbackMessages: () => [
    '感谢您的反馈！',
    '我们会继续改进！',
    '感谢您的评价！',
    '很高兴您喜欢！',
    '感谢您的满分评价！'
  ]
});

const emit = defineEmits<{
  (e: 'event', event: A2UIEvent): void;
  (e: 'update:value', value: number): void;
  (e: 'change', value: number): void;
}>();

const hoverValue = ref(0);
const touched = ref(false);

const displayValue = computed(() => {
  if (hoverValue.value > 0) return hoverValue.value;
  return props.value;
});

function handleClick(star: number) {
  if (props.readonly) return;

  emit('update:value', star);
  emit('change', star);
  touched.value = true;

  emitEvent('star-rating.change', {
    value: star,
    maxStars: props.maxStars
  });
}

function handleMouseEnter(star: number) {
  if (props.readonly) return;
  hoverValue.value = star;
}

function handleMouseLeave() {
  if (props.readonly) return;
  hoverValue.value = 0;
}

function getLabel(value: number): string {
  const index = Math.ceil(value) - 1;
  return props.labels[index] || '';
}

function getFeedbackMessage(): string {
  const index = Math.min(Math.ceil(props.value) - 1, props.feedbackMessages.length - 1);
  return props.feedbackMessages[index] || '';
}

function emitEvent(eventType: string, payload: Record<string, any>) {
  const event: A2UIEvent = {
    messageId: crypto.randomUUID(),
    componentId: 'star-rating',
    eventType,
    payload,
    sessionId: ''
  };
  emit('event', event);
}
</script>

<style scoped lang="scss">
.a2ui-star-rating {
  width: 100%;
  text-align: center;
  padding: 20px;
}

.rating-header {
  margin-bottom: 16px;
}

.rating-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.rating-description {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.rating-stars {
  display: inline-flex;
  gap: 4px;

  &.readonly {
    .star-btn {
      cursor: default;
    }
  }
}

.star-btn {
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: transform 0.15s ease;

  &:not(:disabled):hover {
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 1;
  }
}

.star-icon {
  color: var(--el-border-color);
  transition: color 0.15s ease;

  &.filled {
    color: #ffc107;
  }
}

.rating-value {
  margin-top: 12px;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.rating-label {
  margin-top: 8px;
  font-size: 14px;
  color: var(--el-color-success);
  font-weight: 500;
}

.rating-feedback {
  margin-top: 12px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
