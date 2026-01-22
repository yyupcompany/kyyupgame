<template>
  <div class="a2ui-animation" :class="animationClass" :style="containerStyle">
    <div v-if="showOverlay && isPlaying" class="animation-overlay">
      <div class="overlay-content">
        <el-icon class="spinner" :size="48"><Loading /></el-icon>
        <span v-if="loadingText" class="loading-text">{{ loadingText }}</span>
      </div>
    </div>

    <div v-if="showProgress && isPlaying" class="animation-progress">
      <el-progress
        :percentage="progress"
        :stroke-width="6"
        :status="progressStatus"
      />
    </div>

    <div class="animation-content">
      <slot />
    </div>

    <div v-if="showControls" class="animation-controls">
      <el-button
        v-if="!isPlaying"
        type="primary"
        :icon="VideoPlay"
        @click="play"
      >
        播放动画
      </el-button>
      <template v-else>
        <el-button :icon="VideoPause" @click="pause">
          暂停
        </el-button>
        <el-button :icon="VideoStop" @click="stop">
          停止
        </el-button>
      </template>
    </div>

    <div v-if="showEventFeedback && lastEvent" class="animation-event-feedback">
      <el-tag :type="lastEvent.success ? 'success' : 'info'" size="small">
        {{ lastEvent.message }}
      </el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Loading, VideoPlay, VideoPause, VideoStop } from '@element-plus/icons-vue';
import type { A2UIEvent } from '@/types/a2ui-protocol';

interface Props {
  type?: 'bounce' | 'fade' | 'slide' | 'scale' | 'shake' | 'pulse' | 'spin';
  duration?: number;
  delay?: number;
  iterationCount?: number | 'infinite';
  showControls?: boolean;
  showOverlay?: boolean;
  showProgress?: boolean;
  showEventFeedback?: boolean;
  loadingText?: string;
  autoPlay?: boolean;
  easing?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'fade',
  duration: 1000,
  delay: 0,
  iterationCount: 1,
  showControls: true,
  showOverlay: true,
  showProgress: true,
  showEventFeedback: true,
  loadingText: '加载中...',
  autoPlay: false,
  easing: 'ease-in-out'
});

const emit = defineEmits<{
  (e: 'event', event: A2UIEvent): void;
  (e: 'complete'): void;
  (e: 'progress', percent: number): void;
  (e: 'play'): void;
  (e: 'pause'): void;
  (e: 'stop'): void;
}>();

const isPlaying = ref(false);
const progress = ref(0);
const lastEvent = ref<{ success: boolean; message: string } | null>(null);
let animationTimer: number | null = null;
let progressTimer: number | null = null;

const animationClass = computed(() => `animation-${props.type}`);

const containerStyle = computed(() => ({
  '--animation-duration': `${props.duration}ms`,
  '--animation-delay': `${props.delay}ms`,
  '--animation-easing': props.easing,
  '--iteration-count': props.iterationCount === 'infinite' ? 'infinite' : props.iterationCount
}));

const progressStatus = computed(() => {
  if (progress.value >= 100) return 'success';
  if (progress.value >= 50) return '';
  return 'exception';
});

function play() {
  if (isPlaying.value) return;

  isPlaying.value = true;
  progress.value = 0;

  emit('play');
  emitEvent('animation.play', { type: props.type });

  // Start progress simulation
  const startTime = Date.now();
  progressTimer = window.setInterval(() => {
    const elapsed = Date.now() - startTime;
    const percent = Math.min(100, (elapsed / props.duration) * 100);
    progress.value = percent;
    emit('progress', percent);

    if (percent >= 100) {
      clearInterval(progressTimer!);
    }
  }, 50);

  // Complete animation after duration
  animationTimer = window.setTimeout(() => {
    completeAnimation();
  }, props.duration);
}

function pause() {
  if (!isPlaying.value) return;

  isPlaying.value = false;

  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
  if (animationTimer) {
    clearTimeout(animationTimer);
    animationTimer = null;
  }

  emit('pause');
  emitEvent('animation.pause', { type: props.type, progress: progress.value });
}

function stop() {
  isPlaying.value = false;
  progress.value = 0;

  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
  if (animationTimer) {
    clearTimeout(animationTimer);
    animationTimer = null;
  }

  lastEvent.value = { success: true, message: '动画已停止' };
  emit('stop');
  emitEvent('animation.stop', { type: props.type });
}

function completeAnimation() {
  isPlaying.value = false;
  progress.value = 100;

  lastEvent.value = {
    success: true,
    message: props.iterationCount === 'infinite'
      ? '循环播放中...'
      : '动画播放完成！'
  };

  emit('complete');
  emitEvent('animation.complete', { type: props.type });
}

function emitEvent(eventType: string, payload: Record<string, any>) {
  const event: A2UIEvent = {
    messageId: crypto.randomUUID(),
    componentId: 'animation',
    eventType,
    payload,
    sessionId: ''
  };
  emit('event', event);
}

onMounted(() => {
  if (props.autoPlay) {
    play();
  }
});

onUnmounted(() => {
  if (progressTimer) clearInterval(progressTimer);
  if (animationTimer) clearTimeout(animationTimer);
});
</script>

<style scoped>
.a2ui-animation {
  position: relative;
  width: 100%;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 8px;
  background: var(--el-bg-color-page);
}

.animation-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  z-index: 10;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.animation-progress {
  width: 100%;
  max-width: 300px;
  margin-bottom: 16px;
}

.animation-content {
  width: 100%;
  text-align: center;
}

.animation-controls {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.animation-event-feedback {
  margin-top: 12px;
}

/* Animation Types */
.animation-bounce :deep(*) {
  animation: bounce var(--animation-duration) var(--animation-easing)
    var(--iteration-count);
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animation-fade :deep(*) {
  animation: fade var(--animation-duration) var(--animation-easing)
    var(--iteration-count);
  animation-delay: var(--animation-delay);
}

@keyframes fade {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.animation-slide :deep(*) {
  animation: slide var(--animation-duration) var(--animation-easing)
    var(--iteration-count);
  animation-delay: var(--animation-delay);
}

@keyframes slide {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.animation-scale :deep(*) {
  animation: scale var(--animation-duration) var(--animation-easing)
    var(--iteration-count);
  animation-delay: var(--animation-delay);
}

@keyframes scale {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animation-shake :deep(*) {
  animation: shake var(--animation-duration) var(--animation-easing)
    var(--iteration-count);
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-10px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(10px);
  }
}

.animation-pulse :deep(*) {
  animation: pulse var(--animation-duration) var(--animation-easing)
    var(--iteration-count);
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.animation-spin :deep(*) {
  animation: spin var(--animation-duration) linear
    var(--iteration-count);
  transform-origin: center;
}
</style>
