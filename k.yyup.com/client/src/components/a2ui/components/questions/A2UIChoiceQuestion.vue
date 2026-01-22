<template>
  <div class="a2ui-choice-question">
    <div class="question-header">
      <h3 class="question-title">{{ title }}</h3>
      <div v-if="timeLimit" class="question-timer">
        <A2UICountdown
          :id="`countdown-${id}`"
          :duration="timeLimit"
          :auto-start="!answered"
          format="seconds"
          @event="handleTimerEvent"
        />
      </div>
    </div>

    <div class="question-options">
      <el-radio-group
        v-if="!multiSelect"
        v-model="selectedAnswer"
        :disabled="answered"
        class="options-group"
        @change="handleSingleSelect"
      >
        <el-radio
          v-for="option in options"
          :key="option.id"
          :value="option.id"
          class="option-item"
          :class="{
            'option-correct': answered && option.isCorrect,
            'option-wrong': answered && selectedAnswer === option.id && !option.isCorrect
          }"
        >
          <span class="option-content">{{ getOptionText(option) }}</span>
          <el-icon v-if="answered && option.isCorrect" class="option-icon correct"><Check /></el-icon>
          <el-icon v-if="answered && selectedAnswer === option.id && !option.isCorrect" class="option-icon wrong"><Close /></el-icon>
        </el-radio>
      </el-radio-group>

      <el-checkbox-group
        v-else
        v-model="selectedAnswers"
        :disabled="answered"
        class="options-group"
        @change="handleMultiSelect"
      >
        <el-checkbox
          v-for="option in options"
          :key="option.id"
          :value="option.id"
          class="option-item"
          :class="{
            'option-correct': answered && option.isCorrect,
            'option-wrong': answered && selectedAnswers.includes(option.id) && !option.isCorrect
          }"
        >
          <span class="option-content">{{ getOptionText(option) }}</span>
        </el-checkbox>
      </el-checkbox-group>
    </div>

    <div v-if="hint && showHint && !answered" class="question-hint">
      <el-icon><InfoFilled /></el-icon>
      <span>{{ hint }}</span>
    </div>

    <div v-if="answered" class="question-feedback" :class="feedbackClass">
      <div class="feedback-header">
        <el-icon :size="32"><component :is="feedbackIcon" /></el-icon>
        <span class="feedback-title">{{ feedbackMessage }}</span>
      </div>
      <div v-if="explanation" class="feedback-explanation">
        {{ explanation }}
      </div>
      <div class="feedback-stars">
        <el-rate v-model="stars" disabled show-score text-color="#ff9900" />
      </div>
    </div>

    <div v-if="!answered" class="question-actions">
      <el-button
        type="primary"
        :disabled="!hasSelection"
        :loading="submitting"
        @click="submitAnswer"
      >
        提交答案
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { Check, Close, InfoFilled } from '@element-plus/icons-vue';
import A2UICountdown from '../A2UICountdown.vue';
import type { A2UIEvent } from '@/types/a2ui-protocol';
import { request } from '@/utils/request';

interface Option {
  id: string;
  text?: string;        // 新格式
  content?: string;     // 旧格式（兼容）
  isCorrect?: boolean;
  feedback?: string;
}

// 获取选项显示文本（兼容两种格式）
function getOptionText(option: Option): string {
  return option.text || option.content || '';
}

interface Props {
  id: string;
  title: string;
  options: Option[];
  multiSelect?: boolean;
  shuffleOptions?: boolean;
  timeLimit?: number;
  points?: number;
  hint?: string;
  explanation?: string;
  sessionId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  multiSelect: false,
  shuffleOptions: false,
  points: 10,
  sessionId: ''
});

const emit = defineEmits<{
  (e: 'event', event: A2UIEvent): void;
}>();

const selectedAnswer = ref('');
const selectedAnswers = ref<string[]>([]);
const answered = ref(false);
const submitting = ref(false);
const showHint = ref(true);
const stars = ref(0);
const isCorrect = ref(false);

const shuffledOptions = computed(() => {
  if (props.shuffleOptions) {
    return [...props.options].sort(() => Math.random() - 0.5);
  }
  return props.options;
});

const hasSelection = computed(() => {
  if (props.multiSelect) {
    return selectedAnswers.value.length > 0;
  }
  return selectedAnswer.value !== '';
});

const feedbackClass = computed(() => ({
  'feedback-success': isCorrect.value,
  'feedback-failed': !isCorrect.value
}));

const feedbackMessage = computed(() => {
  return isCorrect.value ? '回答正确！太棒了！' : '再想想哦，答案不对';
});

const feedbackIcon = computed(() => {
  return isCorrect.value ? 'SuccessFilled' : 'CircleCloseFilled';
});

function handleSingleSelect(value: string) {
  emitEvent('question.select', { answer: value });
}

function handleMultiSelect(values: string[]) {
  emitEvent('question.select', { answers: values });
}

function handleTimerEvent(event: A2UIEvent) {
  if (event.eventType === 'timer.complete') {
    // Time's up, auto submit
    if (!answered.value) {
      submitAnswer();
    }
  }
}

async function submitAnswer() {
  if (!hasSelection.value) return;

  submitting.value = true;

  const answer = props.multiSelect ? selectedAnswers.value : selectedAnswer.value;

  const event: A2UIEvent = {
    messageId: crypto.randomUUID(),
    componentId: props.id,
    eventType: 'question.answer',
    payload: {
      answer,
      timeSpent: 0,
      points: props.points
    },
    sessionId: props.sessionId
  };

  try {
    // 本地先判断答案是否正确（根据选项的 isCorrect 属性）
    let localCorrect = false;
    if (props.multiSelect) {
      // 多选题：检查所有正确选项是否都被选中
      const correctOptionIds = props.options.filter(o => o.isCorrect).map(o => o.id);
      localCorrect = correctOptionIds.length === selectedAnswers.value.length && 
        correctOptionIds.every(id => selectedAnswers.value.includes(id));
    } else {
      // 单选题：检查选中的选项是否正确
      const selectedOption = props.options.find(o => o.id === selectedAnswer.value);
      localCorrect = selectedOption?.isCorrect === true;
    }

    // 发送到服务端
    const response = await request.post('/a2ui/event', {
      sessionId: props.sessionId,
      messageId: event.messageId,
      componentId: event.componentId,
      eventType: event.eventType,
      payload: event.payload
    });

    // 处理响应
    answered.value = true;
    if (response.data?.success && response.data?.data?.feedback) {
      // 使用服务端返回的判断结果
      const data = response.data.data;
      isCorrect.value = data.feedback.correct ?? localCorrect;
      stars.value = data.feedback.stars || (isCorrect.value ? 3 : 1);
    } else {
      // 使用本地判断结果
      isCorrect.value = localCorrect;
      stars.value = localCorrect ? 3 : 1;
    }
    showHint.value = false;

    emitEvent('question.answered', {
      answer,
      isCorrect: isCorrect.value,
      score: isCorrect.value ? props.points : 0,
      stars: stars.value
    });
  } catch (error) {
    // 即使API失败，也使用本地判断
    console.warn('提交答案API失败，使用本地判断:', error);
    answered.value = true;
    
    // 本地判断
    if (props.multiSelect) {
      const correctOptionIds = props.options.filter(o => o.isCorrect).map(o => o.id);
      isCorrect.value = correctOptionIds.length === selectedAnswers.value.length && 
        correctOptionIds.every(id => selectedAnswers.value.includes(id));
    } else {
      const selectedOption = props.options.find(o => o.id === selectedAnswer.value);
      isCorrect.value = selectedOption?.isCorrect === true;
    }
    stars.value = isCorrect.value ? 3 : 1;
    showHint.value = false;

    emitEvent('question.answered', {
      answer,
      isCorrect: isCorrect.value,
      score: isCorrect.value ? props.points : 0,
      stars: stars.value
    });
  } finally {
    submitting.value = false;
  }
}

function emitEvent(eventType: string, payload: Record<string, any>) {
  const event: A2UIEvent = {
    messageId: crypto.randomUUID(),
    componentId: props.id,
    eventType,
    payload,
    sessionId: props.sessionId
  };
  emit('event', event);
}

onUnmounted(() => {
  // Cleanup
});
</script>

<style scoped lang="scss">
.a2ui-choice-question {
  padding: 16px;
  background: var(--el-fill-color-blank);
  border-radius: 12px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.question-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  flex: 1;
}

.question-options {
  margin: 16px 0;
}

.options-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 2px solid var(--el-border-color);
  border-radius: 8px;
  transition: all 0.3s;

  &:hover {
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }

  &.option-correct {
    border-color: var(--el-color-success);
    background: var(--el-color-success-light-9);
  }

  &.option-wrong {
    border-color: var(--el-color-danger);
    background: var(--el-color-danger-light-9);
  }
}

.option-content {
  flex: 1;
  font-size: 16px;
}

.option-icon {
  margin-left: 8px;

  &.correct {
    color: var(--el-color-success);
  }

  &.wrong {
    color: var(--el-color-danger);
  }
}

.question-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--el-color-info-light-9);
  border-radius: 6px;
  font-size: 14px;
  color: var(--el-color-info);
  margin-top: 12px;
}

.question-feedback {
  margin-top: 16px;
  padding: 16px;
  border-radius: 8px;

  &.feedback-success {
    background: var(--el-color-success-light-9);
    border: 1px solid var(--el-color-success-light-5);
  }

  &.feedback-failed {
    background: var(--el-color-warning-light-9);
    border: 1px solid var(--el-color-warning-light-5);
  }
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.feedback-title {
  font-size: 18px;
  font-weight: 600;
}

.feedback-success .feedback-title {
  color: var(--el-color-success);
}

.feedback-failed .feedback-title {
  color: var(--el-color-warning);
}

.feedback-explanation {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
}

.feedback-stars {
  display: flex;
  justify-content: center;
}

.question-actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>
