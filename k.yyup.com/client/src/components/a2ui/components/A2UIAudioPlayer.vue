<template>
  <div class="a2ui-audio-player" :style="playerStyle">
    <div class="audio-controls">
      <el-button :icon="isPlaying ? VideoPause : VideoPlay" circle @click="togglePlay" />
      <div class="audio-info">
        <div class="audio-progress">
          <el-slider
            v-model="currentTime"
            :max="duration"
            :show-tooltip="false"
            @change="seek"
          />
        </div>
        <div class="audio-time">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </div>
      </div>
    </div>
    <audio
      ref="audioRef"
      :src="src"
      :autoplay="autoplay"
      :loop="loop"
      :muted="muted"
      :volume="volume"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      @ended="handleEnded"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @error="handleError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { VideoPlay, VideoPause } from '@element-plus/icons-vue';
import type { A2UIEvent } from '@/types/a2ui-protocol';

interface Props {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  volume?: number;
}

const props = withDefaults(defineProps<Props>(), {
  autoplay: false,
  loop: false,
  muted: false,
  volume: 0.8
});

const emit = defineEmits<{
  (e: 'event', event: A2UIEvent): void;
}>();

const audioRef = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volumeLevel = ref(props.volume * 100);

const playerStyle = computed(() => ({
  width: '100%'
}));

function togglePlay() {
  if (audioRef.value) {
    if (isPlaying.value) {
      audioRef.value.pause();
    } else {
      audioRef.value.play();
    }
  }
}

function seek(value: number) {
  if (audioRef.value) {
    audioRef.value.currentTime = value;
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function handleEnded() {
  isPlaying.value = false;
  emitEvent('audio.ended', { duration: duration.value });
}

function handleTimeUpdate() {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime;
  }
}

function handleLoadedMetadata() {
  if (audioRef.value) {
    duration.value = audioRef.value.duration;
  }
}

function handleError() {
  emitEvent('audio.error', {});
}

function emitEvent(eventType: string, payload: Record<string, any>) {
  const event: A2UIEvent = {
    messageId: crypto.randomUUID(),
    componentId: 'audio-player',
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
.a2ui-audio-player {
  padding: 16px;
  background: var(--el-fill-color-blank);
  border-radius: 8px;
}

.audio-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.audio-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.audio-progress {
  width: 100%;
}

.audio-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: right;
}
</style>
