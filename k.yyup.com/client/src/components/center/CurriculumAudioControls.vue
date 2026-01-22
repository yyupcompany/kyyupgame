<template>
  <div class="curriculum-audio-controls">
    <div class="audio-controls-header">
      <el-icon class="audio-icon"><Headset /></el-icon>
      <span class="audio-title">课程音频设置</span>
    </div>

    <div class="audio-controls-body">
      <!-- 总开关 -->
      <div class="audio-control-row">
        <div class="control-label">
          <el-icon><Switch /></el-icon>
          <span>启用音频</span>
        </div>
        <el-switch
          :model-value="localConfig.enabled"
          @change="handleToggle('enabled', $event)"
          active-text="开"
          inactive-text="关"
        />
      </div>

      <!-- TTS语音开关 -->
      <div class="audio-control-row" :class="{ disabled: !localConfig.enabled }">
        <div class="control-label">
          <el-icon><Microphone /></el-icon>
          <span>语音朗读</span>
        </div>
        <el-switch
          :model-value="localConfig.voiceEnabled"
          @change="handleToggle('voiceEnabled', $event)"
          :disabled="!localConfig.enabled"
          active-text="开"
          inactive-text="关"
        />
      </div>

      <!-- 音效开关 -->
      <div class="audio-control-row" :class="{ disabled: !localConfig.enabled }">
        <div class="control-label">
          <el-icon><Notification /></el-icon>
          <span>交互音效</span>
        </div>
        <el-switch
          :model-value="localConfig.effectsEnabled"
          @change="handleToggle('effectsEnabled', $event)"
          :disabled="!localConfig.enabled"
          active-text="开"
          inactive-text="关"
        />
      </div>

      <!-- 语音音量 -->
      <div class="audio-control-row volume-row" :class="{ disabled: !localConfig.enabled || !localConfig.voiceEnabled }">
        <div class="control-label">
          <el-icon><Monitor /></el-icon>
          <span>语音音量</span>
        </div>
        <div class="volume-control">
          <el-icon class="volume-icon" @click="handleVolumeChange('voice', -10)"><Minus /></el-icon>
          <el-slider
            :model-value="localConfig.voiceVolume"
            @input="handleVolumeChange('voice', $event)"
            :disabled="!localConfig.enabled || !localConfig.voiceEnabled"
            :min="0"
            :max="100"
            :step="10"
            style="width: 120px"
          />
          <el-icon class="volume-icon" @click="handleVolumeChange('voice', 10)"><Plus /></el-icon>
          <span class="volume-value">{{ localConfig.voiceVolume }}%</span>
        </div>
      </div>

      <!-- 音效音量 -->
      <div class="audio-control-row volume-row" :class="{ disabled: !localConfig.enabled || !localConfig.effectsEnabled }">
        <div class="control-label">
          <el-icon><Bell /></el-icon>
          <span>音效音量</span>
        </div>
        <div class="volume-control">
          <el-icon class="volume-icon" @click="handleVolumeChange('effects', -10)"><Minus /></el-icon>
          <el-slider
            :model-value="localConfig.effectsVolume"
            @input="handleVolumeChange('effects', $event)"
            :disabled="!localConfig.enabled || !localConfig.effectsEnabled"
            :min="0"
            :max="100"
            :step="10"
            style="width: 120px"
          />
          <el-icon class="volume-icon" @click="handleVolumeChange('effects', 10)"><Plus /></el-icon>
          <span class="volume-value">{{ localConfig.effectsVolume }}%</span>
        </div>
      </div>

      <!-- 试听按钮 -->
      <div class="audio-test-buttons">
        <el-button
          :disabled="!localConfig.enabled || !localConfig.voiceEnabled"
          @click="testVoice"
          size="small"
        >
          <el-icon><VideoPlay /></el-icon>
          试听语音
        </el-button>
        <el-button
          :disabled="!localConfig.enabled || !localConfig.effectsEnabled"
          @click="testEffect"
          size="small"
        >
          <el-icon><Service /></el-icon>
          试听音效
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import {
  Headset,
  Switch,
  Microphone,
  Notification,
  Monitor,
  Bell,
  Minus,
  Plus,
  VideoPlay,
  Service
} from '@element-plus/icons-vue';
import type { A2UIAudioConfig } from '@/composables/useA2UIAudio';

interface Props {
  config: A2UIAudioConfig;
}

interface Emits {
  (e: 'update:config', value: A2UIAudioConfig): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 本地配置（用于双向绑定）
const localConfig = ref<A2UIAudioConfig>({ ...props.config });

// 监听props变化
watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig };
}, { deep: true });

/**
 * 处理开关切换
 */
const handleToggle = (key: keyof A2UIAudioConfig, value: boolean) => {
  (localConfig.value as any)[key] = value;
  emit('update:config', { ...localConfig.value });
};

/**
 * 处理音量变化
 */
const handleVolumeChange = (type: 'voice' | 'effects', value: number) => {
  if (type === 'voice') {
    localConfig.value.voiceVolume = Math.max(0, Math.min(100, value));
  } else {
    localConfig.value.effectsVolume = Math.max(0, Math.min(100, value));
  }
  emit('update:config', { ...localConfig.value });
};

/**
 * 试听语音
 */
const testVoice = () => {
  // 创建测试语音
  const utterance = new SpeechSynthesisUtterance('你好，小朋友，欢迎来到互动课堂！');
  utterance.volume = localConfig.value.voiceVolume / 100;
  utterance.rate = 0.9;
  utterance.pitch = 1.2;
  speechSynthesis.speak(utterance);
};

/**
 * 试听音效
 */
const testEffect = () => {
  // 动态导入音效工具
  import('@/utils/soundEffects').then(({ soundEffects }) => {
    soundEffects.playClickSound();
    setTimeout(() => soundEffects.playSuccessSound(), 300);
  });
};
</script>

<style scoped lang="scss">
.curriculum-audio-controls {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;

  .audio-controls-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .audio-icon {
      font-size: 20px;
      color: var(--el-color-primary);
    }

    .audio-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .audio-controls-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .audio-control-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;

    &.disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    .control-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--el-text-color-regular);

      .el-icon {
        font-size: 16px;
        color: var(--el-color-primary);
      }
    }

    &.volume-row {
      .volume-control {
        display: flex;
        align-items: center;
        gap: 8px;

        .volume-icon {
          cursor: pointer;
          font-size: 14px;
          color: var(--el-text-color-secondary);
          transition: color 0.3s;

          &:hover {
            color: var(--el-color-primary);
          }
        }

        .volume-value {
          min-width: 40px;
          text-align: right;
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .audio-test-buttons {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }
}
</style>
