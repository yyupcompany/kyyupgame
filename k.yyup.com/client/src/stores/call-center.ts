/**
 * 呼叫中心状态管理
 * 管理SIP连接、通话状态、录音、AI分析等状态
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import type {
  SIPConfig,
  SIPStatus,
  CallInfo,
  CallStatistics,
  CallRecording,
  CallAnalysis,
  Extension,
  Contact,
  VoiceSynthesisRequest,
  VoiceSynthesisResponse
} from '@/api/modules/call-center'
import {
  sipAPI,
  callAPI,
  recordingAPI,
  aiAPI,
  extensionAPI,
  contactAPI,
  overviewAPI,
  createWebSocketConnection
} from '@/api/modules/call-center'

export const useCallCenterStore = defineStore('callCenter', () => {
  // ========== SIP连接状态 ==========
  const sipConfig = ref<SIPConfig>({
    server: '47.94.82.59',
    port: 5060,
    username: 'kanderadmin',
    password: 'Szblade3944',
    extension: '1001',
    domain: '47.94.82.59',
    transport: 'udp',
    codecs: ['pcmu', 'pcma'],
    registerTimeout: 3600,
    keepAlive: true,
    debug: false
  })

  const sipStatus = ref<SIPStatus>({
    connected: false,
    server: '47.94.82.59:5060',
    extension: '1001'
  })

  const sipLoading = ref(false)
  const wsManager = ref<any>(null)

  // ========== 通话状态 ==========
  const currentCall = ref<CallInfo | null>(null)
  const activeCalls = ref<CallInfo[]>([])
  const callHistory = ref<CallInfo[]>([])
  const callStatistics = ref<CallStatistics>({
    totalCalls: 0,
    connectedCalls: 0,
    missedCalls: 0,
    averageDuration: 0,
    totalDuration: 0,
    todayCalls: 0,
    weekCalls: 0,
    monthCalls: 0
  })

  const callLoading = ref(false)

  // ========== 录音状态 ==========
  const recordings = ref<CallRecording[]>([])
  const recordingsLoading = ref(false)
  const currentRecording = ref<CallRecording | null>(null)

  // ========== AI分析状态 ==========
  const callAnalysis = ref<CallAnalysis | null>(null)
  const analysisLoading = ref(false)
  const transcription = ref('')
  const isTranscribing = ref(false)

  // ========== 语音合成状态 ==========
  const voiceSynthesisStatus = ref({
    enabled: true,
    model: 'doubao',
    status: 'ready'
  })
  const synthesizedAudio = ref<VoiceSynthesisResponse | null>(null)
  const synthesisLoading = ref(false)

  // ========== 分机和联系人状态 ==========
  const extensions = ref<Extension[]>([])
  const contacts = ref<Contact[]>([])
  const selectedExtension = ref('')

  // ========== 计算属性 ==========
  const isConnected = computed(() => sipStatus.value.connected)
  const hasActiveCall = computed(() => currentCall.value !== null)
  const activeCallsCount = computed(() => activeCalls.value.length)
  const availableExtensions = computed(() =>
    extensions.value.filter(ext => ext.status === 'online')
  )

  const connectionStatusText = computed(() => {
    return isConnected.value ? '已连接' : '未连接'
  })

  const currentCallStatusText = computed(() => {
    if (!currentCall.value) return '无通话'
    const statusMap: Record<string, string> = {
      'ringing': '呼叫中',
      'connected': '通话中',
      'held': '已保持',
      'transferred': '已转移',
      'ended': '已结束'
    }
    return statusMap[currentCall.value.status] || currentCall.value.status
  })

  // ========== SIP连接管理 ==========
  const connectSIP = async (config?: Partial<SIPConfig>) => {
    try {
      sipLoading.value = true
      const configToUse = config ? { ...sipConfig.value, ...config } : sipConfig.value

      const response = await sipAPI.connect(configToUse)
      // response 为 never 类型，因为 API 已弃用总是 reject
      // 保留代码结构但标记为弃用
      if ((response as any).success) {
        sipStatus.value = (response as any).data
        sipConfig.value = configToUse
        ElMessage.success('SIP连接成功')

        // 连接WebSocket
        connectWebSocket()

        return true
      }
      return false
    } catch (error) {
      console.error('❌ SIP连接失败:', error)
      ElMessage.error('SIP连接失败，请检查配置')
      return false
    } finally {
      sipLoading.value = false
    }
  }

  const disconnectSIP = async () => {
    try {
      await sipAPI.disconnect()
      sipStatus.value.connected = false

      // 断开WebSocket
      if (wsManager.value) {
        wsManager.value.disconnect()
        wsManager.value = null
      }

      ElMessage.success('SIP连接已断开')
    } catch (error) {
      console.error('❌ SIP断开失败:', error)
    }
  }

  const testSIPConnection = async (config: Partial<SIPConfig>) => {
    try {
      const response = await sipAPI.testConnection(config)
      return (response as any).data
    } catch (error) {
      console.error('❌ SIP测试失败:', error)
      return { success: false, message: '连接测试失败', latency: 0 }
    }
  }

  const updateSIPConfig = async (config: Partial<SIPConfig>) => {
    try {
      await sipAPI.updateConfig(config)
      sipConfig.value = { ...sipConfig.value, ...config }
      ElMessage.success('SIP配置已更新')
      return true
    } catch (error) {
      console.error('❌ 更新SIP配置失败:', error)
      ElMessage.error('更新SIP配置失败')
      return false
    }
  }

  // ========== 通话管理 ==========
  const makeCall = async (phoneNumber: string, contactName?: string, extension?: string) => {
    try {
      callLoading.value = true
      const response = await callAPI.makeCall({
        phoneNumber,
        extension: extension || selectedExtension.value || sipConfig.value.extension
      })

      if (response.success) {
        currentCall.value = response.data
        activeCalls.value.push(response.data)

        // 显示来电通知
        ElNotification({
          title: '通话发起',
          message: `正在呼叫 ${contactName || phoneNumber}`,
          type: 'info',
          duration: 3000
        })

        return response.data
      }
      return null
    } catch (error) {
      console.error('❌ 发起通话失败:', error)
      ElMessage.error('发起通话失败')
      return null
    } finally {
      callLoading.value = false
    }
  }

  const answerCall = async (callId: string) => {
    try {
      await callAPI.answerCall(callId)

      if (currentCall.value?.id === callId) {
        currentCall.value.status = 'connected'
      }

      const call = activeCalls.value.find(c => c.id === callId)
      if (call) {
        call.status = 'connected'
      }

      ElMessage.success('通话已接听')
    } catch (error) {
      console.error('❌ 接听通话失败:', error)
      ElMessage.error('接听通话失败')
    }
  }

  const hangupCall = async (callId: string) => {
    try {
      await callAPI.hangupCall(callId)

      // 更新状态
      const index = activeCalls.value.findIndex(call => call.id === callId)
      if (index !== -1) {
        const endedCall = activeCalls.value.splice(index, 1)[0]
        endedCall.status = 'ended'
        callHistory.value.unshift(endedCall)
      }

      if (currentCall.value?.id === callId) {
        currentCall.value = null
        transcription.value = ''
        callAnalysis.value = null
      }

      ElMessage.success('通话已结束')
    } catch (error) {
      console.error('❌ 挂断通话失败:', error)
      ElMessage.error('挂断通话失败')
    }
  }

  const holdCall = async (callId: string) => {
    try {
      await callAPI.holdCall(callId)

      if (currentCall.value?.id === callId) {
        currentCall.value.status = 'held'
      }

      const call = activeCalls.value.find(c => c.id === callId)
      if (call) {
        call.status = 'held'
      }

      ElMessage.success('通话已保持')
    } catch (error) {
      console.error('❌ 保持通话失败:', error)
      ElMessage.error('保持通话失败')
    }
  }

  const unholdCall = async (callId: string) => {
    try {
      await callAPI.unholdCall(callId)

      if (currentCall.value?.id === callId) {
        currentCall.value.status = 'connected'
      }

      const call = activeCalls.value.find(c => c.id === callId)
      if (call) {
        call.status = 'connected'
      }

      ElMessage.success('通话已恢复')
    } catch (error) {
      console.error('❌ 恢复通话失败:', error)
      ElMessage.error('恢复通话失败')
    }
  }

  const transferCall = async (callId: string, targetExtension: string) => {
    try {
      await callAPI.transferCall(callId, targetExtension)

      if (currentCall.value?.id === callId) {
        currentCall.value.status = 'transferred'
        currentCall.value.transferTarget = targetExtension
      }

      ElMessage.success('通话已转移')
    } catch (error) {
      console.error('❌ 转移通话失败:', error)
      ElMessage.error('转移通话失败')
    }
  }

  // ========== 录音管理 ==========
  const startRecording = async (callId: string) => {
    try {
      await callAPI.startRecording(callId)

      const call = activeCalls.value.find(c => c.id === callId)
      if (call) {
        call.recording = true
      }

      ElMessage.success('录音已开始')
    } catch (error) {
      console.error('❌ 开始录音失败:', error)
      ElMessage.error('开始录音失败')
    }
  }

  const stopRecording = async (callId: string) => {
    try {
      await callAPI.stopRecording(callId)

      const call = activeCalls.value.find(c => c.id === callId)
      if (call) {
        call.recording = false
      }

      ElMessage.success('录音已停止')
    } catch (error) {
      console.error('❌ 停止录音失败:', error)
      ElMessage.error('停止录音失败')
    }
  }

  const loadRecordings = async (params: any = {}) => {
    try {
      recordingsLoading.value = true
      const response = await recordingAPI.getRecordings(params)

      if (response.success) {
        recordings.value = response.data.list
      }
    } catch (error) {
      console.error('❌ 加载录音失败:', error)
    } finally {
      recordingsLoading.value = false
    }
  }

  // ========== AI分析功能 ==========
  const analyzeCall = async (callId: string) => {
    try {
      analysisLoading.value = true
      const response = await aiAPI.analyzeCall(callId)

      if (response.success) {
        callAnalysis.value = response.data
        ElMessage.success('AI分析完成')
        return response.data
      }
      return null
    } catch (error) {
      console.error('❌ AI分析失败:', error)
      ElMessage.error('AI分析失败')
      return null
    } finally {
      analysisLoading.value = false
    }
  }

  const synthesizeVoice = async (text: string, options: Partial<VoiceSynthesisRequest> = {}) => {
    try {
      synthesisLoading.value = true
      voiceSynthesisStatus.value.status = 'synthesizing'

      const request: VoiceSynthesisRequest = {
        text,
        model: 'doubao',
        voice: 'female',
        ...options
      }

      const response = await aiAPI.synthesizeVoice(request)

      if (response.success) {
        synthesizedAudio.value = response.data
        voiceSynthesisStatus.value.status = 'ready'
        ElMessage.success('语音合成完成')

        // 自动播放合成的语音
        playSynthesizedAudio(response.data.audioUrl)

        return response.data
      }
      return null
    } catch (error) {
      console.error('❌ 语音合成失败:', error)
      voiceSynthesisStatus.value.status = 'error'
      ElMessage.error('语音合成失败')
      return null
    } finally {
      synthesisLoading.value = false
    }
  }

  const playSynthesizedAudio = (audioUrl: string) => {
    try {
      const audio = new Audio(audioUrl)
      audio.play().catch(error => {
        console.error('❌ 播放语音失败:', error)
        ElMessage.error('播放语音失败')
      })
    } catch (error) {
      console.error('❌ 创建音频对象失败:', error)
    }
  }

  const startTranscription = async (callId: string, language = 'zh-CN') => {
    try {
      await aiAPI.startTranscription(callId, { language })
      isTranscribing.value = true
      ElMessage.success('开始实时转写')
    } catch (error) {
      console.error('❌ 开始转写失败:', error)
      ElMessage.error('开始转写失败')
    }
  }

  const stopTranscription = async (callId: string) => {
    try {
      await aiAPI.stopTranscription(callId)
      isTranscribing.value = false
      ElMessage.success('转写已停止')
    } catch (error) {
      console.error('❌ 停止转写失败:', error)
    }
  }

  // ========== 数据加载 ==========
  const loadOverview = async () => {
    try {
      const response = await overviewAPI.getOverview()

      if (response.success) {
        const data = response.data
        sipStatus.value = data.sipStatus
        activeCalls.value = data.activeCalls
        callHistory.value = data.callHistory
        callStatistics.value = data.statistics
        extensions.value = data.extensions
      }
    } catch (error) {
      console.error('❌ 加载概览数据失败:', error)
    }
  }

  const loadExtensions = async () => {
    try {
      const response = await extensionAPI.getExtensions()

      if (response.success) {
        extensions.value = response.data
      }
    } catch (error) {
      console.error('❌ 加载分机列表失败:', error)
    }
  }

  const loadContacts = async (params: any = {}) => {
    try {
      const response = await contactAPI.getContacts(params)

      if (response.success) {
        contacts.value = response.data.list
      }
    } catch (error) {
      console.error('❌ 加载联系人失败:', error)
    }
  }

  const loadStatistics = async (period: 'today' | 'week' | 'month' = 'today') => {
    try {
      const response = await callAPI.getStatistics({ period })

      if (response.success) {
        callStatistics.value = response.data
      }
    } catch (error) {
      console.error('❌ 加载统计数据失败:', error)
    }
  }

  // ========== WebSocket事件处理 ==========
  const connectWebSocket = () => {
    if (wsManager.value) {
      wsManager.value.disconnect()
    }

    wsManager.value = createWebSocketConnection()
    wsManager.value.connect()

    // 监听WebSocket事件
    window.addEventListener('call:incoming', handleIncomingCall as EventListener)
    window.addEventListener('call:status', handleCallStatusUpdate as EventListener)
    window.addEventListener('recording:started', handleRecordingStarted as EventListener)
    window.addEventListener('recording:stopped', handleRecordingStopped as EventListener)
    window.addEventListener('transcription:update', handleTranscriptionUpdate as EventListener)
    window.addEventListener('extension:status', handleExtensionStatusUpdate as EventListener)
  }

  const handleIncomingCall = (event: CustomEvent) => {
    const call: CallInfo = event.detail
    activeCalls.value.push(call)

    // 显示来电通知
    ElNotification({
      title: '来电提醒',
      message: `${call.contactName || call.phoneNumber} 来电`,
      type: 'warning',
      duration: 0,
      showClose: true
    })
  }

  const handleCallStatusUpdate = (event: CustomEvent) => {
    const { callId, status, duration } = event.detail

    if (currentCall.value && currentCall.value.id === callId) {
      currentCall.value.status = status as any
      if (duration !== undefined) {
        currentCall.value.duration = duration
      }
    }

    const call = activeCalls.value.find(c => c.id === callId)
    if (call) {
      call.status = status as any
      if (duration !== undefined) {
        call.duration = duration
      }
    }
  }

  const handleRecordingStarted = (event: CustomEvent) => {
    const { callId, recordingId } = event.detail

    const call = activeCalls.value.find(c => c.id === callId)
    if (call) {
      call.recording = true
    }

    ElMessage.success('录音已开始')
  }

  const handleRecordingStopped = (event: CustomEvent) => {
    const { callId, recordingId, duration } = event.detail

    const call = activeCalls.value.find(c => c.id === callId)
    if (call) {
      call.recording = false
    }

    ElMessage.success('录音已停止')
  }

  const handleTranscriptionUpdate = (event: CustomEvent) => {
    const { callId, transcript, isFinal } = event.detail

    if (currentCall.value?.id === callId) {
      if (isFinal) {
        transcription.value += transcript + ' '
      } else {
        // 实时更新，可以临时显示
      }
    }
  }

  const handleExtensionStatusUpdate = (event: CustomEvent) => {
    const { extensionId, status } = event.detail

    const extension = extensions.value.find(ext => ext.id === extensionId)
    if (extension) {
      extension.status = status as any
    }
  }

  // ========== 初始化和清理 ==========
  const initializeCallCenter = async () => {
    try {
      await Promise.all([
        loadOverview(),
        loadExtensions(),
        loadContacts()
      ])

      // 自动连接SIP
      if (!isConnected.value) {
        await connectSIP()
      }

      console.log('✅ 呼叫中心初始化完成')
    } catch (error) {
      console.error('❌ 呼叫中心初始化失败:', error)
    }
  }

  const cleanup = () => {
    if (wsManager.value) {
      wsManager.value.disconnect()
      wsManager.value = null
    }

    // 移除事件监听
    window.removeEventListener('call:incoming', handleIncomingCall as EventListener)
    window.removeEventListener('call:status', handleCallStatusUpdate as EventListener)
    window.removeEventListener('recording:started', handleRecordingStarted as EventListener)
    window.removeEventListener('recording:stopped', handleRecordingStopped as EventListener)
    window.removeEventListener('transcription:update', handleTranscriptionUpdate as EventListener)
    window.removeEventListener('extension:status', handleExtensionStatusUpdate as EventListener)
  }

  // ========== 监听器 ==========
  watch(isConnected, (connected) => {
    if (connected) {
      console.log('✅ SIP已连接，开始实时数据同步')
    } else {
      console.log('❌ SIP连接断开')
    }
  })

  watch(hasActiveCall, (hasCall) => {
    if (hasCall) {
      console.log('📞 有活跃通话')
    } else {
      console.log('📞 无活跃通话')
    }
  })

  return {
    // 状态
    sipConfig,
    sipStatus,
    sipLoading,
    currentCall,
    activeCalls,
    callHistory,
    callStatistics,
    callLoading,
    recordings,
    recordingsLoading,
    currentRecording,
    callAnalysis,
    analysisLoading,
    transcription,
    isTranscribing,
    voiceSynthesisStatus,
    synthesizedAudio,
    synthesisLoading,
    extensions,
    contacts,
    selectedExtension,

    // 计算属性
    isConnected,
    hasActiveCall,
    activeCallsCount,
    availableExtensions,
    connectionStatusText,
    currentCallStatusText,

    // SIP连接方法
    connectSIP,
    disconnectSIP,
    testSIPConnection,
    updateSIPConfig,

    // 通话管理方法
    makeCall,
    answerCall,
    hangupCall,
    holdCall,
    unholdCall,
    transferCall,

    // 录音管理方法
    startRecording,
    stopRecording,
    loadRecordings,

    // AI分析方法
    analyzeCall,
    synthesizeVoice,
    playSynthesizedAudio,
    startTranscription,
    stopTranscription,

    // 数据加载方法
    loadOverview,
    loadExtensions,
    loadContacts,
    loadStatistics,

    // 初始化和清理
    initializeCallCenter,
    cleanup
  }
})