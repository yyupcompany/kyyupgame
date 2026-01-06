/**
 * 游戏音频管理器
 * 支持三层音频控制：BGM、语音、音效
 */

import { buildBGMUrl, buildSFXUrl, buildVoiceUrl } from '@/utils/oss-url-builder'

export class AudioManager {
  private bgm: HTMLAudioElement | null = null
  private voiceQueue: HTMLAudioElement[] = []
  private sfxPool: Map<string, HTMLAudioElement[]> = new Map()
  
  private bgmVolume = 0.5
  private voiceVolume = 1.0
  private sfxVolume = 0.8
  
  private isVoicePlaying = false
  private isMuted = false

  /**
   * 播放背景音乐（循环）
   */
  playBGM(url: string, fadeIn = true): void {
    if (this.isMuted) return

    // 停止当前BGM
    if (this.bgm) {
      if (fadeIn) {
        this.fadeOut(this.bgm, 1000, () => {
          this.bgm = null
          this.startBGM(url, fadeIn)
        })
      } else {
        this.bgm.pause()
        this.bgm = null
        this.startBGM(url, fadeIn)
      }
    } else {
      this.startBGM(url, fadeIn)
    }
  }

  private startBGM(url: string, fadeIn: boolean): void {
    this.bgm = new Audio(url)
    this.bgm.loop = true
    this.bgm.volume = fadeIn ? 0 : this.bgmVolume

    this.bgm.play().catch(err => {
      console.error('BGM播放失败:', err)
    })

    if (fadeIn) {
      this.fadeIn(this.bgm, 2000, this.bgmVolume)
    }
  }

  /**
   * 停止BGM
   */
  stopBGM(fadeOut = true): void {
    if (!this.bgm) return

    if (fadeOut) {
      this.fadeOut(this.bgm, 1000, () => {
        if (this.bgm) {
          this.bgm.pause()
          this.bgm = null
        }
      })
    } else {
      this.bgm.pause()
      this.bgm = null
    }
  }

  /**
   * 播放语音（自动排队）
   */
  async playVoice(url: string, priority = 0): Promise<void> {
    if (this.isMuted) return Promise.resolve()

    return new Promise((resolve) => {
      const audio = new Audio(url)
      audio.volume = this.voiceVolume

      // 语音播放时降低BGM音量
      if (this.bgm && !this.isVoicePlaying) {
        this.fadeOut(this.bgm, 300, () => {}, this.bgmVolume * 0.3)
      }

      this.isVoicePlaying = true

      audio.onended = () => {
        this.isVoicePlaying = false
        // 恢复BGM音量
        if (this.bgm) {
          this.fadeIn(this.bgm, 300, this.bgmVolume)
        }
        resolve()
      }

      audio.onerror = () => {
        this.isVoicePlaying = false
        if (this.bgm) {
          this.fadeIn(this.bgm, 300, this.bgmVolume)
        }
        resolve()
      }

      audio.play().catch(err => {
        console.error('语音播放失败:', err)
        this.isVoicePlaying = false
        if (this.bgm) {
          this.fadeIn(this.bgm, 300, this.bgmVolume)
        }
        resolve()
      })
    })
  }

  /**
   * 播放音效（支持多个同时播放）
   */
  playSFX(key: string, url: string, volume?: number): void {
    if (this.isMuted) return

    const audio = new Audio(url)
    audio.volume = volume !== undefined ? volume : this.sfxVolume

    audio.play().catch(err => {
      console.error('音效播放失败:', err)
    })

    // 音效播放完后自动销毁
    audio.onended = () => {
      audio.remove()
    }
  }

  /**
   * 设置音量
   */
  setVolumes(bgm?: number, voice?: number, sfx?: number): void {
    if (bgm !== undefined) {
      this.bgmVolume = Math.max(0, Math.min(1, bgm))
      if (this.bgm) this.bgm.volume = this.bgmVolume
    }

    if (voice !== undefined) {
      this.voiceVolume = Math.max(0, Math.min(1, voice))
    }

    if (sfx !== undefined) {
      this.sfxVolume = Math.max(0, Math.min(1, sfx))
    }
  }

  /**
   * 全局静音/取消静音
   */
  toggleMute(): void {
    this.isMuted = !this.isMuted

    if (this.isMuted) {
      if (this.bgm) this.bgm.volume = 0
    } else {
      if (this.bgm) this.bgm.volume = this.bgmVolume
    }
  }

  /**
   * 淡入效果
   */
  private fadeIn(audio: HTMLAudioElement, duration: number, targetVolume: number): void {
    const startVolume = audio.volume
    const volumeStep = (targetVolume - startVolume) / (duration / 50)
    
    const interval = setInterval(() => {
      if (audio.volume < targetVolume) {
        audio.volume = Math.min(targetVolume, audio.volume + volumeStep)
      } else {
        clearInterval(interval)
      }
    }, 50)
  }

  /**
   * 淡出效果
   */
  private fadeOut(audio: HTMLAudioElement, duration: number, callback?: () => void, targetVolume = 0): void {
    const startVolume = audio.volume
    const volumeStep = (startVolume - targetVolume) / (duration / 50)
    
    const interval = setInterval(() => {
      if (audio.volume > targetVolume) {
        audio.volume = Math.max(targetVolume, audio.volume - volumeStep)
      } else {
        clearInterval(interval)
        if (callback) callback()
      }
    }, 50)
  }

  /**
   * 预加载音频
   */
  async preload(urls: string[]): Promise<void> {
    const promises = urls.map(url => {
      return new Promise<void>((resolve) => {
        const audio = new Audio(url)
        audio.oncanplaythrough = () => resolve()
        audio.onerror = () => resolve() // 即使失败也继续
        audio.load()
      })
    })

    await Promise.all(promises)
  }

  /**
   * 清理所有音频
   */
  dispose(): void {
    this.stopBGM(false)
    this.voiceQueue = []
    this.sfxPool.clear()
  }
}

// 导出单例
export const audioManager = new AudioManager()





