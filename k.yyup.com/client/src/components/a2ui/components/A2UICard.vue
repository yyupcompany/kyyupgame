<template>
  <el-card
    class="a2ui-card"
    :class="{ 'has-title': title }"
    :bordered="bordered"
    :shadow="shadow"
    :body-style="bodyStyle"
  >
    <template #header v-if="title">
      <div class="card-header">
        <span class="card-title">{{ title }}</span>
      </div>
    </template>
    <div class="card-content">
      <slot />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { A2UIComponentNode, A2UIEvent, A2UIComponentAudio } from '@/types/a2ui-protocol';
import { soundEffects } from '@/utils/soundEffects';

interface Props {
  title?: string;
  bordered?: boolean;
  shadow?: 'never' | 'hover' | 'always';
  padding?: string;
  bodyStyle?: Record<string, string>;
  children?: A2UIComponentNode[];
  sessionId?: string;
  /** 🎵 音频配置 */
  audio?: A2UIComponentAudio;
}

const props = withDefaults(defineProps<Props>(), {
  bordered: true,
  shadow: 'hover',
  padding: '16px',
  children: () => [],
  sessionId: ''
});

const emit = defineEmits<{
  (e: 'event', event: A2UIEvent): void;
}>();

const bodyStyle = computed(() => ({
  padding: props.padding,
  ...props.bodyStyle
}));

function emitEvent(event: A2UIEvent) {
  emit('event', event);
}

/**
 * 🎵 组件挂载时播放TTS语音（如果配置了自动播放）
 */
onMounted(() => {
  if (props.audio?.autoPlay && props.audio.ttsUrl) {
    const delay = props.audio.playDelay || 0;
    setTimeout(() => {
      const audio = new Audio(props.audio!.ttsUrl!);
      if (props.audio?.volume) {
        audio.volume = props.audio.volume;
      }
      audio.play().catch(err => {
        console.warn('卡片自动播放语音失败:', err);
      });
    }, delay);
  }
});
</script>

<style scoped lang="scss">
.a2ui-card {
  margin-bottom: 16px;

  &.has-title {
    :deep(.el-card__header) {
      padding: 12px 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.card-content {
  width: 100%;
}
</style>
