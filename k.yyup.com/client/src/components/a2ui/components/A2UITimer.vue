<template>
  <div class="a2ui-timer" :class="{ 'timer-warning': isWarning }">
    <el-icon :size="20"><Timer /></el-icon>
    <span class="timer-value">{{ formattedTime }}</span>
    <el-tag v-if="status" :type="statusType" size="small" class="timer-status">
      {{ statusText }}
    </el-tag>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Timer } from '@element-plus/icons-vue';
import type { A2UIEvent } from '@/types/a2ui-protocol';

interface Props {
  id: string;
  startTime?: number;
  format?: 'seconds' | 'minutes' | 'minutes-seconds' | 'full';
  autoStart?: boolean;
  onComplete?: string;
}

const props = withDefaults(defineProps<Props>(), {
  startTime: 0,
  format: 'minutes-seconds',
  autoStart: false
});

const emit = defineEmits<{
  (e: 'event', event: A2UIEvent): void;
}>();

const currentTime = ref(props.startTime);
const status = ref<'running' | 'paused' | 'completed' | null>(null);
let timerInterval: number | null = null;

const isWarning = computed(() => {
  return props.format === 'minutes-seconds' && currentTime.value <= 30;
});

const statusType = computed(() => {
  switch (status.value) {
    case 'running': return 'primary';
    case 'paused': return 'warning';
    case 'completed': return 'success';
    default: return 'info';
  }
});

const statusText = computed(() => {
  switch (status.value) {
    case 'running': return '运行中';
    case 'paused': return '已暂停';
    case 'completed': return '已完成';
    default: return '';
  }
});

const formattedTime = computed(() => {
  const totalSeconds = Math.floor(currentTime.value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  switch (props.format) {
    case 'seconds':
      return `${seconds}秒`;
    case 'minutes':
      return `${minutes}分`;
    case 'minutes-seconds':
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    case 'full':
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    default:
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
});

function start() {
  if (timerInterval) return;
  status.value = 'running';
  timerInterval = window.setInterval(() => {
    currentTime.value++;
  }, 1000);
}

function pause() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    status.value = 'paused';
  }
}

function reset() {
  pause();
  currentTime.value = props.startTime;
  status.value = null;
}

function emitEvent(eventType: string, payload: Record<string, any> = {}) {
  const event: A2UIEvent = {
    messageId: crypto.randomUUID(),
    componentId: props.id,
    eventType,
    payload,
    sessionId: ''
  };
  emit('event', event);
}

onMounted(() => {
  if (props.autoStart) {
    start();
  }
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});

// Expose methods
defineExpose({
  start,
  pause,
  reset,
  getTime: () => currentTime.value,
  isRunning: () => status.value === 'running'
});
</script>

<style scoped lang="scss">
.a2ui-timer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--el-fill-color-light);
  border-radius: 20px;
  font-size: 18px;
  font-weight: 600;
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;

  &.timer-warning {
    background: var(--el-color-warning-light-9);
    color: var(--el-color-warning);
  }
}

.timer-value {
  min-width: 60px;
}

.timer-status {
  margin-left: 4px;
}
</style>
