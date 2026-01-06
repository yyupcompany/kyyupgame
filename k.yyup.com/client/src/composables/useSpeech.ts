import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 声明全局类型
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

/**
 * 语音识别和语音合成组合式函数
 */
export function useSpeech() {
  // 语音识别状态
  const isListening = ref(false)
  const isSpeaking = ref(false)
  const isSupported = ref(false)
  const speechText = ref('')

  // 语音识别实例
  let recognition: any | null = null
  let synthesis: SpeechSynthesis | null = null
  
  // 检查浏览器支持
  const checkSupport = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const SpeechSynthesis = window.speechSynthesis
    
    isSupported.value = !!(SpeechRecognition && SpeechSynthesis)
    
    if (isSupported.value) {
      synthesis = SpeechSynthesis
    }
    
    return isSupported.value
  }
  
  // 初始化语音识别
  const initRecognition = () => {
    if (!checkSupport()) {
      ElMessage.warning('您的浏览器不支持语音功能')
      return false
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognition = new SpeechRecognition()
    
    // 配置语音识别
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'zh-CN'
    recognition.maxAlternatives = 1
    
    // 识别开始
    recognition.onstart = () => {
      isListening.value = true
      speechText.value = ''
    }
    
    // 识别结果
    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }
      
      speechText.value = finalTranscript || interimTranscript
    }
    
    // 识别结束
    recognition.onend = () => {
      isListening.value = false
    }
    
    // 识别错误
    recognition.onerror = (event: any) => {
      isListening.value = false
      console.error('语音识别错误:', event.error)
      
      const errorMessages: Record<string, string> = {
        'no-speech': '没有检测到语音，请重试',
        'audio-capture': '无法访问麦克风，请检查权限',
        'not-allowed': '麦克风权限被拒绝',
        'network': '网络错误，请检查网络连接',
        'service-not-allowed': '语音服务不可用'
      }
      
      const message = errorMessages[event.error] || '语音识别失败，请重试'
      ElMessage.error(message)
    }
    
    return true
  }
  
  // 开始语音识别
  const startListening = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!recognition && !initRecognition()) {
        reject(new Error('语音识别初始化失败'))
        return
      }
      
      if (isListening.value) {
        stopListening()
        return
      }
      
      speechText.value = ''
      
      // 设置结果回调
      const originalOnResult = recognition!.onresult
      recognition!.onresult = (event: any) => {
        originalOnResult?.call(recognition, event)
        
        // 检查是否有最终结果
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.trim()
            if (transcript) {
              resolve(transcript)
              return
            }
          }
        }
      }
      
      // 设置结束回调
      const originalOnEnd = recognition!.onend
      recognition!.onend = () => {
        originalOnEnd?.call(recognition)
        
        if (speechText.value.trim()) {
          resolve(speechText.value.trim())
        } else {
          reject(new Error('未识别到有效语音'))
        }
      }
      
      // 设置错误回调
      const originalOnError = recognition!.onerror
      recognition!.onerror = (event: any) => {
        originalOnError?.call(recognition, event)
        reject(new Error(`语音识别错误: ${event.error}`))
      }
      
      try {
        recognition!.start()
      } catch (error) {
        reject(error)
      }
    })
  }
  
  // 停止语音识别
  const stopListening = () => {
    if (recognition && isListening.value) {
      recognition.stop()
    }
  }
  
  // 语音合成
  const speak = (text: string, options: {
    rate?: number
    pitch?: number
    volume?: number
    voice?: string
  } = {}): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!synthesis) {
        if (!checkSupport()) {
          reject(new Error('浏览器不支持语音合成'))
          return
        }
      }
      
      // 停止当前播放
      if (isSpeaking.value) {
        synthesis!.cancel()
      }
      
      const utterance = new SpeechSynthesisUtterance(text)
      
      // 配置语音参数
      utterance.rate = options.rate || 1
      utterance.pitch = options.pitch || 1
      utterance.volume = options.volume || 1
      utterance.lang = 'zh-CN'
      
      // 选择语音
      if (options.voice) {
        const voices = synthesis!.getVoices()
        const selectedVoice = voices.find(voice => 
          voice.name.includes(options.voice!) || voice.lang.includes('zh')
        )
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }
      }
      
      // 事件监听
      utterance.onstart = () => {
        isSpeaking.value = true
      }
      
      utterance.onend = () => {
        isSpeaking.value = false
        resolve()
      }
      
      utterance.onerror = (event) => {
        isSpeaking.value = false
        reject(new Error(`语音合成错误: ${event.error}`))
      }
      
      // 开始播放
      synthesis!.speak(utterance)
    })
  }
  
  // 停止语音播放
  const stopSpeaking = () => {
    if (synthesis && isSpeaking.value) {
      synthesis.cancel()
      isSpeaking.value = false
    }
  }
  
  // 获取可用语音列表
  const getVoices = () => {
    if (!synthesis) return []
    return synthesis.getVoices().filter(voice => voice.lang.includes('zh'))
  }
  
  // 语音状态
  const speechStatus = computed(() => {
    if (isListening.value) return 'listening'
    if (isSpeaking.value) return 'speaking'
    return 'idle'
  })
  
  // 清理资源
  const cleanup = () => {
    stopListening()
    stopSpeaking()
    recognition = null
    synthesis = null
  }
  
  return {
    // 状态
    isListening,
    isSpeaking,
    isSupported,
    speechText,
    speechStatus,
    
    // 方法
    checkSupport,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    getVoices,
    cleanup
  }
}

export default useSpeech
