import { ref, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// 语音句子接口
interface VoiceSentence {
  text: string
  audioUrl: string
  duration: number
  index: number
}

// 语音生成结果接口
interface VoiceGenerationResult {
  sentences: VoiceSentence[]
  totalDuration: number
}

// 播放状态枚举
enum PlaybackState {
  STOPPED = 'stopped',
  PLAYING = 'playing',
  PAUSED = 'paused',
  LOADING = 'loading'
}

/**
 * 专家语音朗读组合函数
 */
export function useExpertVoice() {
  // 响应式状态
  const isVoiceMode = ref(false)
  const voiceSentences = ref<VoiceSentence[]>([])
  const currentPlayingIndex = ref(-1)
  const playbackState = ref<PlaybackState>(PlaybackState.STOPPED)
  const totalDuration = ref(0)
  const isGenerating = ref(false)
  const generationProgress = ref(0)

  // 计算属性
  const hasVoiceData = computed(() => voiceSentences.value.length > 0)
  const isPlaying = computed(() => playbackState.value === PlaybackState.PLAYING)
  const isPaused = computed(() => playbackState.value === PlaybackState.PAUSED)
  const isLoading = computed(() => playbackState.value === PlaybackState.LOADING)

  // 格式化总时长
  const formattedTotalDuration = computed(() => {
    const minutes = Math.floor(totalDuration.value / 60)
    const seconds = Math.floor(totalDuration.value % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  })

  /**
   * 生成专家语音
   */
  const generateExpertVoice = async (
    expertContent: string,
    expertType: string
  ): Promise<boolean> => {
    try {
      isGenerating.value = true
      generationProgress.value = 0

      console.log('🎤 开始生成专家语音...')

      const response = await axios.post('/api/ai/expert/voice/generate', {
        expertContent,
        expertType
      })

      if (response.data.success) {
        const result: VoiceGenerationResult = response.data.data
        
        voiceSentences.value = result.sentences
        totalDuration.value = result.totalDuration
        
        console.log(`✅ 语音生成成功: ${result.sentences.length} 句, 总时长 ${result.totalDuration}秒`)
        
        ElMessage.success(`语音生成成功！共 ${result.sentences.length} 句话`)
        return true
      } else {
        throw new Error(response.data.message || '语音生成失败')
      }

    } catch (error: any) {
      console.error('生成专家语音失败:', error)
      
      const errorMessage = error.response?.data?.message || error.message || '语音生成失败'
      ElMessage.error(errorMessage)
      
      return false
    } finally {
      isGenerating.value = false
      generationProgress.value = 0
    }
  }

  /**
   * 切换语音模式
   */
  const toggleVoiceMode = async (
    expertContent?: string,
    expertType?: string
  ): Promise<void> => {
    if (!isVoiceMode.value) {
      // 切换到语音模式
      if (hasVoiceData.value) {
        // 已有语音数据，直接切换
        isVoiceMode.value = true
      } else if (expertContent && expertType) {
        // 需要生成语音数据
        const success = await generateExpertVoice(expertContent, expertType)
        if (success) {
          isVoiceMode.value = true
        }
      } else {
        ElMessage.warning('缺少专家内容，无法生成语音')
      }
    } else {
      // 切换到文字模式
      stopAllPlayback()
      isVoiceMode.value = false
    }
  }

  /**
   * 播放指定句子
   */
  const playSentence = (index: number): void => {
    if (index < 0 || index >= voiceSentences.value.length) {
      return
    }

    // 停止其他正在播放的句子
    if (currentPlayingIndex.value !== -1 && currentPlayingIndex.value !== index) {
      stopAllPlayback()
    }

    currentPlayingIndex.value = index
    playbackState.value = PlaybackState.PLAYING
    
    console.log(`▶️ 播放第 ${index + 1} 句: ${voiceSentences.value[index].text.substring(0, 20)}...`)
  }

  /**
   * 暂停播放
   */
  const pausePlayback = (): void => {
    if (playbackState.value === PlaybackState.PLAYING) {
      playbackState.value = PlaybackState.PAUSED
      console.log('⏸️ 暂停播放')
    }
  }

  /**
   * 恢复播放
   */
  const resumePlayback = (): void => {
    if (playbackState.value === PlaybackState.PAUSED) {
      playbackState.value = PlaybackState.PLAYING
      console.log('▶️ 恢复播放')
    }
  }

  /**
   * 停止所有播放
   */
  const stopAllPlayback = (): void => {
    currentPlayingIndex.value = -1
    playbackState.value = PlaybackState.STOPPED
    console.log('⏹️ 停止播放')
  }

  /**
   * 顺序播放所有句子
   */
  const playAllSentences = async (): Promise<void> => {
    if (!hasVoiceData.value) {
      ElMessage.warning('没有可播放的语音数据')
      return
    }

    console.log('🎵 开始顺序播放所有句子')
    
    for (let i = 0; i < voiceSentences.value.length; i++) {
      if (playbackState.value === PlaybackState.STOPPED) {
        break // 用户停止了播放
      }

      playSentence(i)
      
      // 等待当前句子播放完成
      await new Promise<void>((resolve) => {
        const checkPlayback = () => {
          if (currentPlayingIndex.value !== i || playbackState.value === PlaybackState.STOPPED) {
            resolve()
          } else {
            setTimeout(checkPlayback, 100)
          }
        }
        checkPlayback()
      })
    }

    console.log('✅ 所有句子播放完成')
    stopAllPlayback()
  }

  /**
   * 处理句子播放结束
   */
  const onSentenceEnded = (index: number): void => {
    console.log(`✅ 第 ${index + 1} 句播放完成`)
    
    if (currentPlayingIndex.value === index) {
      // 检查是否还有下一句
      if (index + 1 < voiceSentences.value.length) {
        // 自动播放下一句
        nextTick(() => {
          playSentence(index + 1)
        })
      } else {
        // 所有句子播放完成
        stopAllPlayback()
        ElMessage.success('语音播放完成')
      }
    }
  }

  /**
   * 处理句子播放错误
   */
  const onSentenceError = (index: number, error: string): void => {
    console.error(`❌ 第 ${index + 1} 句播放失败:`, error)
    
    if (currentPlayingIndex.value === index) {
      // 尝试播放下一句
      if (index + 1 < voiceSentences.value.length) {
        nextTick(() => {
          playSentence(index + 1)
        })
      } else {
        stopAllPlayback()
      }
    }
  }

  /**
   * 清理语音数据
   */
  const clearVoiceData = (): void => {
    stopAllPlayback()
    voiceSentences.value = []
    totalDuration.value = 0
    isVoiceMode.value = false
    console.log('🧹 清理语音数据')
  }

  /**
   * 获取播放统计信息
   */
  const getPlaybackStats = () => {
    return {
      totalSentences: voiceSentences.value.length,
      totalDuration: totalDuration.value,
      currentIndex: currentPlayingIndex.value,
      playbackState: playbackState.value,
      isVoiceMode: isVoiceMode.value
    }
  }

  return {
    // 状态
    isVoiceMode,
    voiceSentences,
    currentPlayingIndex,
    playbackState,
    totalDuration,
    isGenerating,
    generationProgress,

    // 计算属性
    hasVoiceData,
    isPlaying,
    isPaused,
    isLoading,
    formattedTotalDuration,

    // 方法
    generateExpertVoice,
    toggleVoiceMode,
    playSentence,
    pausePlayback,
    resumePlayback,
    stopAllPlayback,
    playAllSentences,
    onSentenceEnded,
    onSentenceError,
    clearVoiceData,
    getPlaybackStats
  }
}
