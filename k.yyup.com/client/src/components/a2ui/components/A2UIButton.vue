<template>
  <el-button
    :type="buttonType"
    :size="size"
    :icon="iconComponent"
    :plain="variant === 'secondary'"
    :round="round"
    :circle="circle"
    :disabled="disabled"
    :loading="loading"
    :block="block"
    @click="handleClick"
  >
    <el-icon v-if="icon && iconPosition === 'left' && !loading" :size="iconSize">
      <component :is="icon" />
    </el-icon>
    <span v-if="label">{{ label }}</span>
    <el-icon v-if="icon && iconPosition === 'right' && !loading" :size="iconSize">
      <component :is="icon" />
    </el-icon>
  </el-button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { A2UIEvent, A2UIComponentAudio } from '@/types/a2ui-protocol';
import { request } from '@/utils/request';
import { soundEffects } from '@/utils/soundEffects';

interface Props {
  label?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'text';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
  block?: boolean;
  round?: boolean;
  circle?: boolean;
  disabled?: boolean;
  loading?: boolean;
  confirm?: boolean;
  confirmMessage?: string;
  sessionId?: string;
  /** 🎵 音频配置 */
  audio?: A2UIComponentAudio;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  iconPosition: 'left',
  block: false,
  round: false,
  circle: false,
  disabled: false,
  loading: false,
  confirm: false,
  sessionId: ''
});

const emit = defineEmits<{
  (e: 'event', event: A2UIEvent): void;
  (e: 'click'): void;
}>();

const buttonType = computed(() => {
  const map: Record<string, string> = {
    primary: 'primary',
    secondary: '',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    text: ''
  };
  return map[props.variant] || '';
});

const iconSize = computed(() => {
  const map: Record<string, number> = {
    small: 14,
    medium: 16,
    large: 18
  };
  return map[props.size] || 16;
});

const iconComponent = computed(() => {
  if (!props.icon) return null;
  // Dynamic import would be handled here
  return null;
});

/**
 * 🎵 播放音效
 */
function playClickSound() {
  if (!props.audio || props.audio.clickEffect === 'none') {
    return;
  }

  switch (props.audio.clickEffect) {
    case 'click':
      soundEffects.playClickSound();
      break;
    case 'success':
      soundEffects.playSuccessSound();
      break;
    case 'error':
      soundEffects.playErrorSound();
      break;
    case 'complete':
      soundEffects.playCompleteSound();
      break;
    case 'star':
      // 星星获得音效（连续播放3次成功音效）
      soundEffects.playSuccessSound();
      setTimeout(() => soundEffects.playSuccessSound(), 100);
      setTimeout(() => soundEffects.playSuccessSound(), 200);
      break;
  }
}

/**
 * 🎵 播放TTS语音
 */
function playTTSVoice() {
  if (!props.audio?.ttsUrl) {
    return;
  }

  const audio = new Audio(props.audio.ttsUrl);
  if (props.audio.volume) {
    audio.volume = props.audio.volume;
  }
  audio.play().catch(err => {
    console.warn('TTS语音播放失败:', err);
  });
}

function handleClick() {
  if (props.confirm) {
    // Show confirmation dialog
    return;
  }

  // 🎵 播放点击音效
  playClickSound();

  // 🎵 播放TTS语音（如果有）
  playTTSVoice();

  const event: A2UIEvent = {
    messageId: crypto.randomUUID(),
    componentId: '',
    eventType: 'button.click',
    payload: { label: props.label },
    sessionId: props.sessionId
  };

  emit('event', event);
  emit('click');
}
</script>

<style scoped lang="scss">
.a2ui-button {
  margin: 4px;
}
</style>
