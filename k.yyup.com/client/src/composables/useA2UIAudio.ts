/**
 * A2UI 音频处理 Composable
 * 处理TTS语音播放和交互音效
 */

import { ref, onMounted, onUnmounted } from 'vue';
import type { A2UIComponentNode, A2UIComponentAudio } from '@/types/a2ui-protocol';
import { soundEffects } from '@/utils/soundEffects';

// 音频管理器（使用家长端的AudioManager）
interface VoiceAudio {
  url: string;
  text: string;
  isPlaying: boolean;
}

export interface A2UIAudioConfig {
  enabled: boolean;
  voiceEnabled: boolean;
  effectsEnabled: boolean;
  voiceVolume: number;
  effectsVolume: number;
  autoPlayWelcome: boolean;
}

export function useA2UIAudio(initialConfig?: Partial<A2UIAudioConfig>) {
  // 音频配置
  const config = ref<A2UIAudioConfig>({
    enabled: initialConfig?.enabled ?? true,
    voiceEnabled: initialConfig?.voiceEnabled ?? true,
    effectsEnabled: initialConfig?.effectsEnabled ?? true,
    voiceVolume: initialConfig?.voiceVolume ?? 80,
    effectsVolume: initialConfig?.effectsEnabled ? initialConfig?.effectsVolume ?? 80 : 80,
    autoPlayWelcome: initialConfig?.autoPlayWelcome ?? true
  });

  // 当前播放的音频
  const currentVoice = ref<VoiceAudio | null>(null);
  const audioElements = ref<Map<string, HTMLAudioElement>>(new Map());

  /**
   * 播放TTS语音
   */
  const playVoice = (url: string, text?: string): Promise<void> => {
    if (!config.value.enabled || !config.value.voiceEnabled || !url) {
      return Promise.resolve();
    }

    // 停止当前播放的语音
    stopVoice();

    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      audio.volume = config.value.voiceVolume / 100;

      audio.onended = () => {
        currentVoice.value = null;
        resolve();
      };

      audio.onerror = (error) => {
        console.error('❌ [A2UI音频] 语音播放失败:', error);
        currentVoice.value = null;
        reject(error);
      };

      currentVoice.value = {
        url,
        text: text || '',
        isPlaying: true
      };

      audio.play().catch(reject);
      audioElements.value.set(url, audio);
    });
  };

  /**
   * 停止当前语音
   */
  const stopVoice = () => {
    if (currentVoice.value?.isPlaying) {
      const audio = audioElements.value.get(currentVoice.value.url);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      currentVoice.value = null;
    }
  };

  /**
   * 播放音效
   */
  const playEffect = (effectType: A2UIComponentAudio['clickEffect']) => {
    if (!config.value.enabled || !config.value.effectsEnabled) {
      return;
    }

    switch (effectType) {
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
        // 星星获得音效（三连音）
        soundEffects.playSuccessSound();
        break;
      case 'none':
        // 不播放音效
        break;
    }
  };

  /**
   * 处理组件点击事件（自动播放音效和TTS）
   */
  const handleComponentClick = (component: A2UIComponentNode) => {
    const audio = component.audio;
    if (!audio) return;

    // 播放点击音效
    if (audio.clickEffect) {
      playEffect(audio.clickEffect);
    }

    // 播放TTS语音
    if (audio.ttsUrl && config.value.voiceEnabled) {
      playVoice(audio.ttsUrl, audio.ttsText);
    }
  };

  /**
   * 处理组件悬停事件
   */
  const handleComponentHover = (component: A2UIComponentNode) => {
    if (!component.audio?.hoverEffect || !config.value.effectsEnabled) {
      return;
    }

    // 可以添加悬停音效
  };

  /**
   * 自动播放欢迎语音（延迟播放）
   */
  const autoPlayWelcome = (url: string, text: string, delay: number = 1000) => {
    if (!config.value.autoPlayWelcome) {
      return;
    }

    setTimeout(() => {
      playVoice(url, text);
    }, delay);
  };

  /**
   * 为组件树递归添加音频事件处理
   */
  const enhanceComponentWithAudio = (component: A2UIComponentNode): A2UIComponentNode => {
    // 如果组件有音频配置，添加点击事件处理
    if (component.audio && component.audio.clickEffect !== 'none') {
      // 创建增强的组件
      const enhanced = { ...component };

      // 添加事件处理函数到props
      enhanced.props = {
        ...enhanced.props,
        onClick: () => handleComponentClick(enhanced),
        onMouseEnter: () => handleComponentHover(enhanced)
      };

      return enhanced;
    }

    // 递归处理子组件
    if (component.children) {
      return {
        ...component,
        children: component.children.map(child => enhanceComponentWithAudio(child))
      };
    }

    return component;
  };

  /**
   * 批量处理组件树的音频增强
   */
  const enhanceComponentTree = (root: A2UIComponentNode | null): A2UIComponentNode | null => {
    if (!root) return null;
    return enhanceComponentWithAudio(root);
  };

  /**
   * 更新音频配置
   */
  const updateConfig = (newConfig: Partial<A2UIAudioConfig>) => {
    config.value = { ...config.value, ...newConfig };

    // 更新音量
    audioElements.value.forEach(audio => {
      audio.volume = config.value.voiceVolume / 100;
    });
  };

  /**
   * 切换音频开关
   */
  const toggleAudio = () => {
    config.value.enabled = !config.value.enabled;
    if (!config.value.enabled) {
      stopVoice();
    }
  };

  /**
   * 切换语音开关
   */
  const toggleVoice = () => {
    config.value.voiceEnabled = !config.value.voiceEnabled;
    if (!config.value.voiceEnabled) {
      stopVoice();
    }
  };

  /**
   * 切换音效开关
   */
  const toggleEffects = () => {
    config.value.effectsEnabled = !config.value.effectsEnabled;
  };

  /**
   * 清理资源
   */
  const cleanup = () => {
    stopVoice();
    audioElements.value.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    audioElements.value.clear();
  };

  // 组件卸载时清理
  onUnmounted(() => {
    cleanup();
  });

  return {
    // 状态
    config,
    currentVoice,

    // 方法
    playVoice,
    stopVoice,
    playEffect,
    handleComponentClick,
    handleComponentHover,
    autoPlayWelcome,
    enhanceComponentTree,
    updateConfig,
    toggleAudio,
    toggleVoice,
    toggleEffects,
    cleanup
  };
}
