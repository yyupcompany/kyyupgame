<template>
  <div class="a2ui-video-player" :style="playerStyle">
    <video
      ref="videoRef"
      class="video-element"
      :src="src"
      :poster="poster"
      :controls="controls"
      :autoplay="autoplay"
      :loop="loop"
      :muted="muted"
      :preload="preload"
      :playsinline="true"
      @play="handlePlay"
      @pause="handlePause"
      @ended="handleEnded"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @error="handleError"
    />
    <div v-if="!controls" class="video-overlay" @click="togglePlay">
      <el-icon v-if="!isPlaying" :size="64"><VideoPlay /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { VideoPlay } from '@element-plus/icons-vue';
import type { A2UIEvent } from '@/types/a2ui-protocol';

interface Props {
  src: string;
  poster?: string;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  width?: string | number;
  height?: string | number;
  preload?: 'none' | 'metadata' | 'auto';
}

const props = withDefaults(defineProps<Props>(), {
  autoplay: false,
  controls: true,
  loop: false,
  muted: false,
  preload: 'metadata'
});

const emit = defineEmits<{
  (e: 'event', event: A2UIEvent): void;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);

const playerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width || '100%',
  height: typeof props.height === 'number' ? `${props.height}px` : props.height || '400px'
}));

function togglePlay() {
  if (videoRef.value) {
    if (isPlaying.value) {
      videoRef.value.pause();
    } else {
      videoRef.value.play();
    }
  }
}

function handlePlay() {
  isPlaying.value = true;
  emitEvent('video.play', { currentTime: currentTime.value });
}

function handlePause() {
  isPlaying.value = false;
  emitEvent('video.pause', { currentTime: currentTime.value });
}

function handleEnded() {
  isPlaying.value = false;
  emitEvent('video.ended', { duration: duration.value });
}

function handleTimeUpdate() {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime;
  }
}

function handleLoadedMetadata() {
  if (videoRef.value) {
    duration.value = videoRef.value.duration;
  }
}

function handleError(error: Event) {
  emitEvent('video.error', { error: String(error) });
}

function emitEvent(eventType: string, payload: Record<string, any>) {
  const event: A2UIEvent = {
    messageId: crypto.randomUUID(),
    componentId: '',
    eventType,
    payload,
    sessionId: ''
  };
  emit('event', event);
}

onUnmounted(() => {
  // Cleanup
});
</script>

<style scoped lang="scss">
.a2ui-video-player {
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  cursor: pointer;

  .el-icon {
    color: #fff;
    opacity: 0.8;
    transition: opacity 0.3s;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
