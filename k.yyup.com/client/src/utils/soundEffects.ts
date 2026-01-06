/**
 * 音效管理工具类
 * 使用 Web Audio API 生成简单的音效
 */

class SoundEffects {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // 延迟初始化 AudioContext，避免浏览器自动播放策略限制
    this.initAudioContext();
  }

  /**
   * 初始化 AudioContext
   */
  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API 不支持:', error);
      this.enabled = false;
    }
  }

  /**
   * 确保 AudioContext 已恢复（处理浏览器自动播放策略）
   */
  private async ensureAudioContext() {
    if (!this.audioContext || !this.enabled) return false;

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn('无法恢复 AudioContext:', error);
        return false;
      }
    }

    return true;
  }

  /**
   * 播放打字音效
   */
  async playTypingSound() {
    if (!await this.ensureAudioContext() || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 短促的高频音
    oscillator.frequency.value = 800 + Math.random() * 200; // 800-1000Hz
    oscillator.type = 'sine';

    // 音量包络
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.05);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.05);
  }

  /**
   * 播放完成音效
   */
  async playCompleteSound() {
    if (!await this.ensureAudioContext() || !this.audioContext) return;

    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 和弦音效 (C大调和弦)
    oscillator1.frequency.value = 523.25; // C5
    oscillator2.frequency.value = 659.25; // E5
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';

    // 音量包络
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    oscillator1.start(now);
    oscillator2.start(now);
    oscillator1.stop(now + 0.5);
    oscillator2.stop(now + 0.5);
  }

  /**
   * 播放成功音效
   */
  async playSuccessSound() {
    if (!await this.ensureAudioContext() || !this.audioContext) return;

    const frequencies = [523.25, 659.25, 783.99]; // C-E-G 大三和弦
    const now = this.audioContext.currentTime;

    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      const startTime = now + index * 0.1;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  }

  /**
   * 播放错误音效
   */
  async playErrorSound() {
    if (!await this.ensureAudioContext() || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 低频不和谐音
    oscillator.frequency.value = 200;
    oscillator.type = 'sawtooth';

    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }

  /**
   * 播放点击音效
   */
  async playClickSound() {
    if (!await this.ensureAudioContext() || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = 1000;
    oscillator.type = 'sine';

    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.08);

    oscillator.start(now);
    oscillator.stop(now + 0.08);
  }

  /**
   * 启用音效
   */
  enable() {
    this.enabled = true;
    if (!this.audioContext) {
      this.initAudioContext();
    }
  }

  /**
   * 禁用音效
   */
  disable() {
    this.enabled = false;
  }

  /**
   * 切换音效开关
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * 获取音效状态
   */
  isEnabled() {
    return this.enabled;
  }
}

// 导出单例
export const soundEffects = new SoundEffects();

