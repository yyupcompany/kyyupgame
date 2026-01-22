<template>
  <div class="a2ui-drag-sort" :aria-label="title">
    <div v-if="title" class="drag-title">
      <h3>{{ title }}</h3>
    </div>
    <div class="drag-instructions">
      <el-icon><InfoFilled /></el-icon>
      <span>{{ props.instructions || '拖拽项目到正确位置' }}</span>
    </div>

    <div
      class="drag-container"
      :class="`mode-${mode}`"
    >
      <div
        v-for="(item, index) in displayItems"
        :key="item.id"
        class="drag-item"
        :class="{
          'dragging': draggingIndex === index,
          'correct-position': showResult && index === correctOrder.indexOf(item.id),
          'wrong-position': showResult && index !== correctOrder.indexOf(item.id)
        }"
        :draggable="!showResult"
        @dragstart="handleDragStart(index)"
        @dragend="handleDragEnd"
        @dragover.prevent="handleDragOver(index)"
        @drop="handleDrop(index)"
      >
        <el-icon class="drag-handle"><Rank /></el-icon>
        <span class="drag-content">{{ getItemText(item) }}</span>
        <el-icon v-if="showResult" class="result-icon">
          <component :is="index === correctOrder.indexOf(item.id) ? 'CircleCheck' : 'CircleClose'" />
        </el-icon>
      </div>
    </div>

    <div v-if="showResult" class="sort-result">
      <div class="result-message" :class="isCorrect ? 'result-success' : 'result-failed'">
        <el-icon :size="24"><component :is="isCorrect ? 'SuccessFilled' : 'WarningFilled'" /></el-icon>
        <span>{{ resultMessage }}</span>
      </div>
      <div v-if="showSuccessAnimation" class="success-animation">
        <el-icon :size="64" class="bounce"><Trophy /></el-icon>
      </div>
    </div>

    <div class="drag-actions">
      <el-button
        v-if="!showResult"
        type="primary"
        :disabled="!canCheck"
        @click="checkAnswer"
      >
        检查答案
      </el-button>
      <el-button v-else @click="resetSort">
        重新排序
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { InfoFilled, Rank, CircleCheck, CircleClose, SuccessFilled, WarningFilled, Trophy } from '@element-plus/icons-vue';
import type { A2UIEvent } from '@/types/a2ui-protocol';
import { request } from '@/utils/request';

interface DragItem {
  id: string;
  text?: string;       // 新格式
  content?: string;    // 旧格式（兼容）
  image?: string;
}

// 获取项目显示文本（兼容两种格式）
function getItemText(item: DragItem): string {
  return item.text || item.content || '';
}

interface Props {
  id: string;
  title?: string;
  instructions?: string;
  items: DragItem[];
  correctOrder: string[];
  mode?: 'vertical' | 'horizontal';
  allowFeedback?: boolean;
  showSuccessAnimation?: boolean;
  sessionId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'vertical',
  allowFeedback: true,
  showSuccessAnimation: true,
  sessionId: ''
});

const emit = defineEmits<{
  (e: 'event', event: A2UIEvent): void;
}>();

const displayItems = ref<DragItem[]>([...props.items]);
const draggingIndex = ref<number | null>(null);
const showResult = ref(false);

const canCheck = computed(() => true);

const isCorrect = computed(() => {
  const currentOrder = displayItems.value.map(item => item.id);
  return JSON.stringify(currentOrder) === JSON.stringify(props.correctOrder);
});

const resultMessage = computed(() => {
  if (isCorrect.value) {
    return '排序正确！太棒了！';
  }
  return '顺序不对，再试试吧！';
});

function handleDragStart(index: number) {
  draggingIndex.value = index;
}

function handleDragEnd() {
  draggingIndex.value = null;
}

function handleDragOver(index: number) {
  // Allow drop
}

function handleDrop(targetIndex: number) {
  if (draggingIndex.value === null || draggingIndex.value === targetIndex) return;

  const items = [...displayItems.value];
  const draggedItem = items[draggingIndex.value];
  items.splice(draggingIndex.value, 1);
  items.splice(targetIndex, 0, draggedItem);
  displayItems.value = items;
  draggingIndex.value = null;
}

async function checkAnswer() {
  const currentOrder = displayItems.value.map(item => item.id);
  const correct = isCorrect.value;
  const score = correct ? 30 : 0;

  if (props.allowFeedback) {
    showResult.value = true;
  }

  const event: A2UIEvent = {
    messageId: crypto.randomUUID(),
    componentId: props.id,
    eventType: 'drag.sort.complete',
    payload: {
      userOrder: currentOrder,
      correctOrder: props.correctOrder,
      isCorrect: correct,
      score
    },
    sessionId: props.sessionId
  };

  try {
    const response = await request.post('/a2ui/event', {
      sessionId: props.sessionId,
      messageId: event.messageId,
      componentId: event.componentId,
      eventType: event.eventType,
      payload: event.payload
    });

    if (response.data.success) {
      emitEvent('drag.sort.complete', {
        userOrder: currentOrder,
        isCorrect: correct,
        score
      });
    }
  } catch (error) {
    console.error('检查答案失败:', error);
    emitEvent('drag.sort.complete', {
      userOrder: currentOrder,
      isCorrect: correct,
      score
    });
  }
}

function resetSort() {
  displayItems.value = [...props.items];
  showResult.value = false;
  emitEvent('drag.sort.reset', {});
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

onMounted(() => {
  // Initialize
});
</script>

<style scoped lang="scss">
.a2ui-drag-sort {
  padding: 16px;
}

.drag-title {
  margin-bottom: 16px;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.drag-instructions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--el-color-primary-light-9);
  border-radius: 8px;
  color: var(--el-color-primary);
  font-size: 14px;
  margin-bottom: 16px;
}

.drag-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 100px;

  &.mode-horizontal {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

.drag-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--el-fill-color-blank);
  border: 2px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: grab;
  transition: all 0.3s;

  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.dragging {
    opacity: 0.5;
    cursor: grabbing;
  }

  &.correct-position {
    border-color: var(--el-color-success);
    background: var(--el-color-success-light-9);
  }

  &.wrong-position {
    border-color: var(--el-color-danger);
    background: var(--el-color-danger-light-9);
  }
}

.drag-handle {
  color: var(--el-text-color-secondary);
  cursor: grab;
}

.drag-content {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
}

.result-icon {
  font-size: 20px;

  .correct-position & {
    color: var(--el-color-success);
  }

  .wrong-position & {
    color: var(--el-color-danger);
  }
}

.sort-result {
  margin-top: 16px;
  text-align: center;
}

.result-message {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;

  &.result-success {
    background: var(--el-color-success-light-9);
    color: var(--el-color-success);
  }

  &.result-failed {
    background: var(--el-color-warning-light-9);
    color: var(--el-color-warning);
  }
}

.success-animation {
  margin-top: 16px;

  .bounce {
    color: var(--el-color-warning);
    animation: bounce 1s infinite;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.drag-actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
