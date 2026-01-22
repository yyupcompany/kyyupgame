<template>
  <A2UIQuestion
    :title="question"
    :question-number="questionNumber"
    :hint="hint"
    :show-hint="!!hint"
    :show-feedback="showFeedback"
    :feedback-type="feedbackType"
    :feedback-message="feedbackMessage"
    :show-submit="!disableSubmit"
    :can-submit="isAnswered"
    :submit-text="submitText"
    @submit="handleSubmit"
    @event="handleEvent"
  >
    <div class="fill-blank-content">
      <div class="sentence-display">
        <template v-for="(part, index) in parsedSentence" :key="index">
          <span v-if="part.type === 'text'" class="static-text">{{ part.value }}</span>
          <el-input
            v-else
            :model-value="answers[part.blankId] || ''"
            :placeholder="part.placeholder || '填写答案'"
            :disabled="submitted"
            :status="getInputStatus(part.blankId)"
            size="large"
            class="blank-input"
            @update:model-value="updateAnswer(part.blankId, $event)"
            @blur="checkAnswer(part.blankId)"
          />
        </template>
      </div>

      <div v-if="showPreview && previewText" class="preview-section">
        <p class="preview-label">完整句子：</p>
        <p class="preview-text">{{ previewText }}</p>
      </div>
    </div>
  </A2UIQuestion>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { A2UIComponentNode, A2UIEvent } from '@/types/a2ui-protocol';
import A2UIQuestion from './A2UIQuestion.vue';

interface BlankPart {
  type: 'text' | 'blank';
  value?: string;
  blankId: string;
  placeholder?: string;
  correctAnswer?: string;
}

interface Props {
  question: string;
  blanks: Array<{
    placeholder?: string;
    correctAnswer: string;
  }>;
  questionNumber?: string;
  hint?: string;
  disableSubmit?: boolean;
  submitText?: string;
  showPreview?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  questionNumber: '',
  hint: '',
  disableSubmit: false,
  submitText: '检查答案',
  showPreview: true
});

const answers = ref<Record<string, string>>({});
const submitted = ref(false);
const showFeedback = ref(false);
const feedbackType = ref<'success' | 'error'>('success');
const feedbackMessage = ref('');

// Parse question sentence to extract blanks
const parsedSentence = computed<BlankPart[]>(() => {
  const parts: BlankPart[] = [];
  let blankIndex = 0;

  // Simple parsing: split by {{blank}}
  const regex = /\{\{blank(\d+)\}\}/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(props.question)) !== null) {
    // Add text before blank
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        value: props.question.substring(lastIndex, match.index)
      });
    }

    // Add blank
    const blankId = `blank_${blankIndex}`;
    parts.push({
      type: 'blank',
      blankId,
      placeholder: props.blanks[blankIndex]?.placeholder,
      correctAnswer: props.blanks[blankIndex]?.correctAnswer
    });

    lastIndex = regex.lastIndex;
    blankIndex++;
  }

  // Add remaining text
  if (lastIndex < props.question.length) {
    parts.push({
      type: 'text',
      value: props.question.substring(lastIndex)
    });
  }

  return parts;
});

// Generate preview text
const previewText = computed(() => {
  return parsedSentence.value.map(part => {
    if (part.type === 'blank') {
      return answers.value[part.blankId] || '_____';
    }
    return part.value;
  }).join('');
});

const isAnswered = computed(() => {
  return props.blanks.every((_, index) =>
    answers.value[`blank_${index}`]?.trim()
  );
});

function updateAnswer(blankId: string, value: string) {
  answers.value[blankId] = value;
  if (submitted.value) {
    submitted.value = false;
    showFeedback.value = false;
  }
}

function getInputStatus(blankId: string) {
  if (!submitted.value) return '';
  const blankPart = parsedSentence.value.find(p => p.blankId === blankId);
  if (!blankPart) return '';

  const userAnswer = answers.value[blankId]?.trim().toLowerCase() || '';
  const correctAnswer = blankPart.correctAnswer?.toLowerCase() || '';

  return userAnswer === correctAnswer ? 'success' : 'error';
}

function checkAnswer(blankId?: string) {
  // Optional: check individual blank on blur
}

function handleSubmit() {
  const blankIds = parsedSentence.value
    .filter(p => p.type === 'blank')
    .map(p => p.blankId);

  const allCorrect = blankIds.every(blankId => {
    const blankPart = parsedSentence.value.find(p => p.blankId === blankId);
    const userAnswer = answers.value[blankId]?.trim().toLowerCase() || '';
    const correctAnswer = blankPart?.correctAnswer?.toLowerCase() || '';
    return userAnswer === correctAnswer;
  });

  submitted.value = true;
  showFeedback.value = true;
  feedbackType.value = allCorrect ? 'success' : 'error';
  feedbackMessage.value = allCorrect
    ? '太棒了！所有空都填对了！'
    : '有错误，请检查并修改红色标注的填空。';

  emitEvent('fill-blank.submit', {
    answers: { ...answers.value },
    allCorrect,
    blankCount: blankIds.length,
    correctCount: allCorrect ? blankIds.length : 0
  });
}

function handleEvent(event: A2UIEvent) {
  emit('event', event);
}

function emitEvent(eventType: string, payload: Record<string, any>) {
  const event: A2UIEvent = {
    messageId: crypto.randomUUID(),
    componentId: 'fill-blank-question',
    eventType,
    payload,
    sessionId: ''
  };
  emit('event', event);
}
</script>

<style scoped lang="scss">
.fill-blank-content {
  width: 100%;
}

.sentence-display {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  line-height: 2.2;
  font-size: 16px;
}

.static-text {
  color: var(--el-text-color-primary);
}

.blank-input {
  width: 100px;

  :deep(.el-input__wrapper) {
    border-bottom: 2px solid var(--el-border-color);
    border-radius: 4px 4px 0 0;
    padding: 0 8px;
    background: transparent;
  }

  :deep(&.is-success .el-input__wrapper) {
    border-bottom-color: var(--el-color-success);
  }

  :deep(&.is-error .el-input__wrapper) {
    border-bottom-color: var(--el-color-danger);
  }
}

.preview-section {
  margin-top: 16px;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.preview-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 0 0 8px;
}

.preview-text {
  font-size: 15px;
  color: var(--el-text-color-primary);
  margin: 0;
  line-height: 1.6;
}
</style>
