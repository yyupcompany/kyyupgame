<template>
  <div class="a2ui-countdown" :class="countdownClass">
    <div class="countdown-display">
      <div v-if="showProgress" class="countdown-progress">
        <el-progress
          :percentage="progressPercentage"
          :stroke-width="6"
          :show-text="false"
          :color="progressColor"
        />
      </div>
      <div class="countdown-value">{{ formattedTime }}</div>
    </div>
    <div v-if="status" class="countdown-status">
      <el-tag :type="statusType" size="small">{{ statusText }}</el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { A2UIEvent } from '@/types/a2ui-protocol';

interface Props {
  id: string;
  duration: number;
  format?: 'seconds' | 'minutes-seconds' | 'full';
  autoStart?: boolean;
  showProgress?: boolean;
  warningThreshold?: number;
}

const props = withDefaults(defineProps<Props>(), {
  format: 'minutes-seconds',
  autoStart: false,
  showProgress: true,
  warningThreshold: 30
});

const emit = defineEmits<{
  (e: 'event', event: A2UIEvent): void;
}>();

const remainingTime = ref(props.duration);
const status = ref<'running' | 'paused' | 'completed' | null>(null);
let timerInterval: number | null = null;

const isWarning = computed(() => remainingTime.value <= props.warningThreshold);
const isDanger = computed(() => remainingTime.value <= 10);

const progressPercentage = computed(() => {
  return Math.round((remainingTime.value / props.duration) * 100);
});

const progressColor = computed(() => {
  if (isDanger.value) return '#F56C6C';
  if (isWarning.value) return '#E6A23C';
  return '#67C23A';
});

const countdownClass = computed(() => ({
  'countdown-warning': isWarning.value && status.value === 'running',
  'countdown-danger': isDanger.value && status.value === 'running',
  'countdown-completed': status.value === 'completed'
}));

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
    case 'running': return '进行中';
    case 'paused': return '已暂停';
    case 'completed': return '时间到';
    default: return '';
  }
});

const formattedTime = computed(() => {
  const totalSeconds = Math.ceil(remainingTime.value);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  switch (props.format) {
    case 'seconds':
      return `${totalSeconds}秒`;
    case 'minutes-seconds':
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    case 'full':
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    default:
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
});

function start() {
  if (timerInterval || status.value === 'completed') return;
  status.value = 'running';
  timerInterval = window.setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value -= 0.1; // Update every 100ms for smooth progress
    } else {
      complete();
    }
  }, 100);
}

function pause() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    status.value = 'paused';
  }
}

function complete() {
  pause();
  remainingTime.value = 0;
  status.value = 'completed';
  emitEvent('timer.complete', { duration: props.duration });
}

function reset() {
  pause();
  remainingTime.value = props.duration;
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

watch(() => props.autoStart, (newVal) => {
  if (newVal) start();
});

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

defineExpose({
  start,
  pause,
  reset,
  complete,
  getRemainingTime: () => remainingTime.value
});
</script>

<style scoped lang="scss">
.a2ui-countdown {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: var(--el-fill-color-light);
  border-radius: 12px;
  transition: all 0.3s;

  &.countdown-warning {
    background: var(--el-color-warning-light-9);
  }

  &.countdown-danger {
    background: var(--el-color-danger-light-9);
  }

  &.countdown-completed {
    background: var(--el-color-success-light-9);
  }
}

.countdown-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.countdown-progress {
  width: 100%;
  max-width: 200px;
}

.countdown-value {
  font-size: 48px;
  font-weight: 700;
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  color: var(--el-text-color-primary);
  line-height: 1;
}

.countdown-status {
  margin-top: 4px;
}
</style>
