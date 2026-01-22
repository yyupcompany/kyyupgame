/**
 * 课件音频系统
 * 包含音效和语音旁白功能
 */

// 音效类型
export type SoundEffectType = 
  | 'click'      // 点击音效
  | 'correct'    // 正确答案
  | 'wrong'      // 错误答案
  | 'complete'   // 完成
  | 'star'       // 星星
  | 'page'       // 翻页
  | 'drag'       // 拖拽
  | 'drop'       // 放下
  | 'countdown'  // 倒计时
  | 'applause';  // 掌声

// 音效URL映射（使用免费音效资源或base64编码）
const SOUND_EFFECTS: Record<SoundEffectType, string> = {
  click: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v/////////////////////////////////',
  correct: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v/////////////////////////////////',
  wrong: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v/////////////////////////////////',
  complete: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v/////////////////////////////////',
  star: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v/////////////////////////////////',
  page: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v/////////////////////////////////',
  drag: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v/////////////////////////////////',
  drop: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v/////////////////////////////////',
  countdown: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v/////////////////////////////////',
  applause: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v/////////////////////////////////'
};

// 音频缓存
const audioCache = new Map<string, HTMLAudioElement>();

// 音效是否启用
let soundEnabled = true;
let ttsEnabled = true;
let volume = 0.7;

/**
 * 课件音频管理器
 */
class CurriculumAudioManager {
  private currentTTS: SpeechSynthesisUtterance | null = null;
  private audioContext: AudioContext | null = null;

  constructor() {
    // 预加载音效
    this.preloadSounds();
  }

  /**
   * 预加载所有音效
   */
  private preloadSounds(): void {
    Object.entries(SOUND_EFFECTS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = volume;
      audioCache.set(key, audio);
    });
  }

  /**
   * 播放音效
   */
  playSound(type: SoundEffectType): void {
    if (!soundEnabled) return;

    try {
      // 使用Web Audio API生成音效（更可靠）
      this.playGeneratedSound(type);
    } catch (e) {
      console.warn('播放音效失败:', e);
    }
  }

  /**
   * 使用Web Audio API生成音效
   */
  private playGeneratedSound(type: SoundEffectType): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = this.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // 根据音效类型设置不同的音调
    const soundConfigs: Record<SoundEffectType, { freq: number; type: OscillatorType; duration: number }> = {
      click: { freq: 800, type: 'sine', duration: 0.05 },
      correct: { freq: 880, type: 'sine', duration: 0.3 },
      wrong: { freq: 220, type: 'sawtooth', duration: 0.3 },
      complete: { freq: 660, type: 'sine', duration: 0.5 },
      star: { freq: 1200, type: 'sine', duration: 0.15 },
      page: { freq: 400, type: 'sine', duration: 0.1 },
      drag: { freq: 300, type: 'sine', duration: 0.05 },
      drop: { freq: 500, type: 'sine', duration: 0.1 },
      countdown: { freq: 600, type: 'square', duration: 0.1 },
      applause: { freq: 440, type: 'sine', duration: 1.0 }
    };

    const config = soundConfigs[type];
    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.freq, ctx.currentTime);

    // 正确答案音效 - 上升音调
    if (type === 'correct') {
      oscillator.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
      oscillator.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.25);
    }
    
    // 错误答案音效 - 下降音调
    if (type === 'wrong') {
      oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
    }

    // 完成音效 - 和弦
    if (type === 'complete') {
      this.playChord(ctx, [523, 659, 784], 0.5); // C大三和弦
      return;
    }

    gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + config.duration);
  }

  /**
   * 播放和弦
   */
  private playChord(ctx: AudioContext, frequencies: number[], duration: number): void {
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume * 0.2, ctx.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + duration);
    });
  }

  /**
   * 语音朗读（TTS）
   */
  speak(text: string, options?: {
    rate?: number;
    pitch?: number;
    onEnd?: () => void;
    onStart?: () => void;
  }): void {
    if (!ttsEnabled || !text) return;

    // 停止之前的朗读
    this.stopSpeak();

    if (!('speechSynthesis' in window)) {
      console.warn('浏览器不支持语音合成');
      options?.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = options?.rate ?? 0.9;  // 稍慢一点，适合幼儿
    utterance.pitch = options?.pitch ?? 1.1; // 稍高一点，更活泼
    utterance.volume = volume;

    // 尝试选择中文语音
    const voices = speechSynthesis.getVoices();
    const chineseVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('CN'));
    if (chineseVoice) {
      utterance.voice = chineseVoice;
    }

    utterance.onstart = () => {
      options?.onStart?.();
    };

    utterance.onend = () => {
      this.currentTTS = null;
      options?.onEnd?.();
    };

    utterance.onerror = () => {
      this.currentTTS = null;
      options?.onEnd?.();
    };

    this.currentTTS = utterance;
    speechSynthesis.speak(utterance);
  }

  /**
   * 停止语音朗读
   */
  stopSpeak(): void {
    if (this.currentTTS) {
      speechSynthesis.cancel();
      this.currentTTS = null;
    }
  }

  /**
   * 是否正在朗读
   */
  isSpeaking(): boolean {
    return speechSynthesis.speaking;
  }

  /**
   * 设置音效开关
   */
  setSoundEnabled(enabled: boolean): void {
    soundEnabled = enabled;
  }

  /**
   * 设置TTS开关
   */
  setTTSEnabled(enabled: boolean): void {
    ttsEnabled = enabled;
    if (!enabled) {
      this.stopSpeak();
    }
  }

  /**
   * 设置音量
   */
  setVolume(vol: number): void {
    volume = Math.max(0, Math.min(1, vol));
  }

  /**
   * 获取当前设置
   */
  getSettings(): { soundEnabled: boolean; ttsEnabled: boolean; volume: number } {
    return { soundEnabled, ttsEnabled, volume };
  }
}

// 导出单例
export const curriculumAudio = new CurriculumAudioManager();

// 导出便捷方法
export const playSound = (type: SoundEffectType) => curriculumAudio.playSound(type);
export const speak = (text: string, options?: Parameters<CurriculumAudioManager['speak']>[1]) => 
  curriculumAudio.speak(text, options);
export const stopSpeak = () => curriculumAudio.stopSpeak();
