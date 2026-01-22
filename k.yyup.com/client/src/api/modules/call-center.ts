/**
 * 呼叫中心API模块
 * 提供SIP连接、通话管理、录音管理、AI分析等功能
 */

import { request } from '@/utils/request'
import { API_PREFIX } from '../endpoints/base'

// API端点常量
export const CALL_CENTER_ENDPOINTS = {
  OVERVIEW: `${API_PREFIX}/call-center/overview`,
  CALL_MAKE: `${API_PREFIX}/call-center/call/make`,
  CALL_HANGUP: `${API_PREFIX}/call-center/call/hangup`,
  CALLS_ACTIVE: `${API_PREFIX}/call-center/calls/active`,
  CALLS_HISTORY: `${API_PREFIX}/call-center/calls/history`,
  CALLS_STATISTICS: `${API_PREFIX}/call-center/calls/statistics`,
  AI_SYNTHESIZE: `${API_PREFIX}/call-center/ai/synthesize`,
  EXTENSIONS: `${API_PREFIX}/call-center/extensions`,
  CONTACTS: `${API_PREFIX}/call-center/contacts`,
  CONTACTS_SEARCH: `${API_PREFIX}/call-center/contacts/search`
} as const

// SIP连接相关类型定义
export interface SIPConfig {
  server: string
  port: number
  username: string
  password: string
  extension: string
  domain: string
  transport?: string
  codecs?: string[]
  registerTimeout?: number
  keepAlive?: boolean
  debug?: boolean
}

export interface SIPStatus {
  connected: boolean
  server: string
  extension: string
  registeredTime?: Date
  lastHeartbeat?: Date
}

// 通话相关类型定义
export interface CallInfo {
  id: string
  phoneNumber: string
  contactName?: string
  status: 'ringing' | 'connected' | 'held' | 'transferred' | 'ended'
  startTime: Date
  duration?: number
  recording?: boolean
  extension: string
  direction: 'inbound' | 'outbound'
  transferTarget?: string
}

export interface CallStatistics {
  totalCalls: number
  connectedCalls: number
  missedCalls: number
  averageDuration: number
  totalDuration: number
  todayCalls: number
  weekCalls: number
  monthCalls: number
}

// 录音相关类型定义
export interface CallRecording {
  id: string
  callId: string
  phoneNumber: string
  contactName?: string
  startTime: Date
  duration: number
  fileSize: number
  quality: 'standard' | 'high' | 'ultra'
  transcript?: string
  audioUrl: string
  analysis?: CallAnalysis
}

export interface RecordingListParams {
  page?: number
  pageSize?: number
  phoneNumber?: string
  contactName?: string
  startDate?: Date
  endDate?: Date
  status?: 'all' | 'available' | 'processing'
}

// AI分析相关类型定义
export interface CallAnalysis {
  id: string
  callId: string
  sentiment: 'positive' | 'neutral' | 'negative'
  sentimentScore: number
  keywords: string[]
  summary: string
  actionItems: string[]
  customerSatisfaction: number
  agentPerformance: {
    tone: 'professional' | 'friendly' | 'rushed' | 'unclear'
    clarity: number
    empathy: number
    efficiency: number
  }
  businessInsights: {
    category: string
    priority: 'high' | 'medium' | 'low'
    followUpRequired: boolean
  }
}

export interface VoiceSynthesisRequest {
  text: string
  model: 'doubao' | 'azure' | 'google'
  voice: 'male' | 'female' | 'child'
  speed?: number
  pitch?: number
  volume?: number
  format?: 'mp3' | 'wav'
}

export interface VoiceSynthesisResponse {
  id: string
  audioUrl: string
  duration: number
  fileSize: number
  model: string
  voice: string
}

// 分机相关类型定义
export interface Extension {
  id: string
  name: string
  status: 'online' | 'offline' | 'busy' | 'away'
  currentCall?: string
  lastActive?: Date
  capabilities: string[]
  deviceInfo?: {
    userAgent: string
    ipAddress: string
    deviceType: string
  }
}

// 联系人相关类型定义
export interface Contact {
  id: string
  name: string
  phone: string
  email?: string
  company?: string
  tags: string[]
  notes?: string
  lastCall?: Date
  callHistory: CallInfo[]
  preferences: {
    preferredLanguage: string
    timezone: string
    doNotCall: boolean
  }
}

// VOS连接管理API（已弃用SIP，改用VOS）
export const sipAPI = {
  // 获取SIP连接状态 - 已弃用，请使用VOS配置API
  getStatus: () => {
    console.warn('⚠️ SIP API已弃用，请使用VOS配置API')
    return request.get<{ data: SIPStatus }>(CALL_CENTER_ENDPOINTS.OVERVIEW)
  },

  // 连接SIP服务器 - 已弃用
  connect: (_config: SIPConfig) => {
    console.warn('⚠️ SIP连接已弃用，请使用VOS配置API')
    return Promise.reject(new Error('SIP API已弃用'))
  },

  // 断开SIP连接 - 已弃用
  disconnect: () => {
    console.warn('⚠️ SIP断开已弃用')
    return Promise.reject(new Error('SIP API已弃用'))
  },

  // 测试SIP连接 - 已弃用
  testConnection: (_config: Partial<SIPConfig>) => {
    console.warn('⚠️ SIP测试已弃用，请使用VOS配置API')
    return Promise.reject(new Error('SIP API已弃用'))
  },

  // 更新SIP配置 - 已弃用
  updateConfig: (_config: Partial<SIPConfig>) => {
    console.warn('⚠️ SIP配置更新已弃用，请使用VOS配置API')
    return Promise.reject(new Error('SIP API已弃用'))
  },

  // 获取SIP配置 - 已弃用
  getConfig: () => {
    console.warn('⚠️ SIP配置获取已弃用，请使用VOS配置API')
    return Promise.reject(new Error('SIP API已弃用'))
  },

  // 注册分机 - 已弃用
  registerExtension: (_extension: string, _config: Partial<SIPConfig>) => {
    console.warn('⚠️ SIP分机注册已弃用')
    return Promise.reject(new Error('SIP API已弃用'))
  },

  // 注销分机 - 已弃用
  unregisterExtension: (_extension: string) => {
    console.warn('⚠️ SIP分机注销已弃用')
    return Promise.reject(new Error('SIP API已弃用'))
  }
}

// 通话管理API（使用VOS）
export const callAPI = {
  // 发起VOS通话
  makeCall: (data: {
    phoneNumber: string
    customerId?: number
    systemPrompt?: string
    callerNumber?: string
    extension?: string
    vosConfigId?: number
  }) => {
    return request.post<{ data: { callId: string; sessionId: string; status: string } }>(CALL_CENTER_ENDPOINTS.CALL_MAKE, data)
  },

  // 接听通话 - 已弃用（VOS自动处理）
  answerCall: (_callId: string) => {
    console.warn('⚠️ 接听通话已弃用，VOS自动处理')
    return Promise.reject(new Error('VOS自动处理通话'))
  },

  // 挂断通话
  hangupCall: (callId: string) => {
    return request.post(CALL_CENTER_ENDPOINTS.CALL_HANGUP, { callId })
  },

  // 保持通话 - 已弃用
  holdCall: (_callId: string) => {
    console.warn('⚠️ 保持通话已弃用')
    return Promise.reject(new Error('VOS不支持此操作'))
  },

  // 恢复通话 - 已弃用
  unholdCall: (_callId: string) => {
    console.warn('⚠️ 恢复通话已弃用')
    return Promise.reject(new Error('VOS不支持此操作'))
  },

  // 转移通话 - 已弃用
  transferCall: (_callId: string, _targetExtension: string) => {
    console.warn('⚠️ 转移通话已弃用')
    return Promise.reject(new Error('VOS不支持此操作'))
  },

  // 开始录音 - 已弃用（VOS自动录音）
  startRecording: (_callId: string) => {
    console.warn('⚠️ VOS自动录音，无需手动启动')
    return Promise.resolve()
  },

  // 停止录音 - 已弃用
  stopRecording: (_callId: string) => {
    console.warn('⚠️ VOS自动录音，无需手动停止')
    return Promise.resolve()
  },

  // 获取通话信息
  getCallInfo: (callId: string) => {
    return request.get<{ data: { callId: string; status: string; duration: number } }>(`/call-center/call/${callId}/status`)
  },

  // 获取活跃通话列表
  getActiveCalls: () => {
    return request.get<{ data: { total: number; calls: any[] } }>(CALL_CENTER_ENDPOINTS.CALLS_ACTIVE)
  },

  // 获取通话历史
  getCallHistory: (params: {
    page?: number
    pageSize?: number
    startDate?: Date
    endDate?: Date
    status?: string
  }) => {
    return request.get<{ data: { list: any[]; total: number } }>(CALL_CENTER_ENDPOINTS.CALLS_HISTORY, {
      params
    })
  },

  // 获取通话统计
  getStatistics: (params: { period?: 'today' | 'week' | 'month' } = {}) => {
    return request.get<{ data: CallStatistics }>(CALL_CENTER_ENDPOINTS.CALLS_STATISTICS, {
      params
    })
  },

  // 发送DTMF
  sendDTMF: (callId: string, digits: string) => {
    return request.post(`/api/call-center/call/${callId}/dtmf`, { digits })
  }
}

// 录音管理API
export const recordingAPI = {
  // 获取录音列表
  getRecordings: (params: RecordingListParams) => {
    return request.get<{ data: { list: CallRecording[]; total: number } }>(
      '/call-center/recordings',
      { params }
    )
  },

  // 获取录音详情
  getRecording: (id: string) => {
    return request.get<{ data: CallRecording }>(`/call-center/recordings/${id}`)
  },

  // 下载录音
  downloadRecording: (id: string) => {
    return request.get<{ data: { downloadUrl: string; expiresAt: Date } }>(
      `/call-center/recordings/${id}/download`
    )
  },

  // 删除录音
  deleteRecording: (id: string) => {
    return request.delete(`/api/call-center/recordings/${id}`)
  },

  // 获取录音转写
  getTranscript: (id: string) => {
    return request.get<{ data: { transcript: string; language: string } }>(
      `/call-center/recordings/${id}/transcript`
    )
  },

  // 更新转写内容
  updateTranscript: (id: string, transcript: string) => {
    return request.put(`/api/call-center/recordings/${id}/transcript`, { transcript })
  },

  // 请求转写
  requestTranscription: (id: string, options: { language?: string } = {}) => {
    return request.post(`/api/call-center/recordings/${id}/transcribe`, options)
  }
}

// AI分析API
export const aiAPI = {
  // 分析通话
  analyzeCall: (callId: string, options: { includeTranscript?: boolean } = {}) => {
    return request.post<{ data: CallAnalysis }>(`/call-center/ai/analyze/${callId}`, options)
  },

  // 批量分析
  batchAnalyze: (callIds: string[]) => {
    return request.post<{ data: { results: CallAnalysis[]; failed: string[] } }>(
      '/call-center/ai/batch-analyze',
      { callIds }
    )
  },

  // 语音合成
  synthesizeVoice: (synthesisRequest: VoiceSynthesisRequest) => {
    return request.post<{ data: VoiceSynthesisResponse }>(CALL_CENTER_ENDPOINTS.AI_SYNTHESIZE, synthesisRequest)
  },

  // 获取合成状态
  getSynthesisStatus: (taskId: string) => {
    return request.get<{ data: { status: string; progress: number; result?: VoiceSynthesisResponse } }>(
      `/call-center/ai/synthesize/${taskId}/status`
    )
  },

  // 实时转写
  startTranscription: (callId: string, options: { language?: string } = {}) => {
    return request.post(`/api/call-center/ai/transcribe/${callId}/start`, options)
  },

  // 停止转写
  stopTranscription: (callId: string) => {
    return request.post(`/api/call-center/ai/transcribe/${callId}/stop`)
  },

  // 获取转写结果
  getTranscriptionResult: (callId: string) => {
    return request.get<{ data: { transcript: string; isFinal: boolean; confidence: number } }>(
      `/call-center/ai/transcribe/${callId}/result`
    )
  },

  // 实时情感分析
  analyzeSentiment: (callId: string) => {
    return request.get<{ data: { sentiment: string; confidence: number; emotions: object } }>(
      `/call-center/ai/sentiment/${callId}`
    )
  },

  // 生成智能回复
  generateResponse: (callId: string, context: { lastMessage?: string; intent?: string }) => {
    return request.post<{ data: { response: string; confidence: number; suggestions: string[] } }>(
      `/call-center/ai/generate-response/${callId}`,
      context
    )
  },

  // 生成AI话术
  generateScript: (data: { originalScript?: string; context?: string }) => {
    return request.post<{ data: { optimizedScript: string; suggestions: string[] } }>(
      '/call-center/ai/generate-script',
      data
    )
  },

  // 语音识别
  speechToText: (data: { audioUrl?: string; audioData?: Blob }) => {
    return request.post<{ data: { text: string; confidence: number } }>(
      '/call-center/ai/speech-to-text',
      data
    )
  },

  // 合规审查
  checkCompliance: (data: { script: string; type?: string }) => {
    return request.post<{ data: { compliant: boolean; issues: string[]; suggestions: string[] } }>(
      '/call-center/ai/check-compliance',
      data
    )
  }
}

// 分机管理API
export const extensionAPI = {
  // 获取分机列表
  getExtensions: () => {
    return request.get<{ data: Extension[] }>(CALL_CENTER_ENDPOINTS.EXTENSIONS)
  },

  // 获取分机详情
  getExtension: (id: string) => {
    return request.get<{ data: Extension }>(`/call-center/extensions/${id}`)
  },

  // 更新分机状态
  updateExtensionStatus: (id: string, status: Extension['status']) => {
    return request.put(`/api/call-center/extensions/${id}/status`, { status })
  },

  // 重置分机
  resetExtension: (id: string) => {
    return request.post(`/api/call-center/extensions/${id}/reset`)
  }
}

// 联系人管理API
export const contactAPI = {
  // 获取联系人列表
  getContacts: (params: {
    page?: number
    pageSize?: number
    search?: string
    tags?: string[]
  }) => {
    return request.get<{ data: { list: Contact[]; total: number } }>(
      '/call-center/contacts',
      { params }
    )
  },

  // 创建联系人
  createContact: (contact: Partial<Contact>) => {
    return request.post<{ data: Contact }>(CALL_CENTER_ENDPOINTS.CONTACTS, contact)
  },

  // 更新联系人
  updateContact: (id: string, contact: Partial<Contact>) => {
    return request.put(`/api/call-center/contacts/${id}`, contact)
  },

  // 删除联系人
  deleteContact: (id: string) => {
    return request.delete(`/api/call-center/contacts/${id}`)
  },

  // 搜索联系人
  searchContacts: (query: string) => {
    return request.get<{ data: Contact[] }>(CALL_CENTER_ENDPOINTS.CONTACTS_SEARCH, {
      params: { q: query }
    })
  }
}

// 呼叫中心概览API
export const overviewAPI = {
  // 获取概览数据
  getOverview: () => {
    return request.get<{
      data: {
        sipStatus: SIPStatus
        activeCalls: CallInfo[]
        callHistory: CallInfo[]
        statistics: CallStatistics
        extensions: Extension[]
        recentRecordings: CallRecording[]
      }
    }>('/call-center/overview')
  },

  // 获取实时状态
  getRealTimeStatus: () => {
    return request.get<{
      data: {
        activeCalls: number
        availableExtensions: number
        queueLength: number
        averageWaitTime: number
        systemLoad: number
      }
    }>('/call-center/realtime/status')
  }
}

// WebSocket连接管理
export class WebSocketManager {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor(url: string) {
    this.url = url
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log('✅ 呼叫中心WebSocket连接成功')
        this.reconnectAttempts = 0
        this.startHeartbeat()
      }

      this.ws.onclose = () => {
        console.log('❌ 呼叫中心WebSocket连接断开')
        this.stopHeartbeat()
        this.handleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('❌ 呼叫中心WebSocket连接错误:', error)
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          console.error('❌ 解析WebSocket消息失败:', error)
        }
      }
    } catch (error) {
      console.error('❌ 创建WebSocket连接失败:', error)
    }
  }

  disconnect() {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  private handleMessage(data: any) {
    // 处理不同类型的消息
    switch (data.type) {
      case 'call.incoming':
        this.handleIncomingCall(data.payload)
        break
      case 'call.status':
        this.handleCallStatusUpdate(data.payload)
        break
      case 'recording.started':
        this.handleRecordingStarted(data.payload)
        break
      case 'recording.stopped':
        this.handleRecordingStopped(data.payload)
        break
      case 'transcription.update':
        this.handleTranscriptionUpdate(data.payload)
        break
      case 'extension.status':
        this.handleExtensionStatusUpdate(data.payload)
        break
      case 'heartbeat.response':
        // 心跳响应，无需处理
        break
      default:
        console.log('🔍 未知WebSocket消息类型:', data.type)
    }
  }

  private handleIncomingCall(call: CallInfo) {
    // 触发来电事件
    window.dispatchEvent(new CustomEvent('call:incoming', { detail: call }))
  }

  private handleCallStatusUpdate(data: { callId: string; status: string; duration?: number }) {
    // 触发通话状态更新事件
    window.dispatchEvent(new CustomEvent('call:status', { detail: data }))
  }

  private handleRecordingStarted(data: { callId: string; recordingId: string }) {
    // 触发录音开始事件
    window.dispatchEvent(new CustomEvent('recording:started', { detail: data }))
  }

  private handleRecordingStopped(data: { callId: string; recordingId: string; duration: number }) {
    // 触发录音停止事件
    window.dispatchEvent(new CustomEvent('recording:stopped', { detail: data }))
  }

  private handleTranscriptionUpdate(data: { callId: string; transcript: string; isFinal: boolean }) {
    // 触发转写更新事件
    window.dispatchEvent(new CustomEvent('transcription:update', { detail: data }))
  }

  private handleExtensionStatusUpdate(data: { extensionId: string; status: string }) {
    // 触发分机状态更新事件
    window.dispatchEvent(new CustomEvent('extension:status', { detail: data }))
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'heartbeat', timestamp: Date.now() })
    }, 30000)
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`🔄 尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      setTimeout(() => {
        this.connect()
      }, this.reconnectInterval)
    } else {
      console.error('❌ WebSocket重连失败，已达到最大重试次数')
    }
  }
}

// 创建WebSocket实例
export const createWebSocketConnection = (url?: string) => {
  const wsUrl = url || `ws://${window.location.host}/call-center/ws`
  return new WebSocketManager(wsUrl)
}

export default {
  sip: sipAPI,
  call: callAPI,
  recording: recordingAPI,
  ai: aiAPI,
  extension: extensionAPI,
  contact: contactAPI,
  overview: overviewAPI,
  websocket: {
    create: createWebSocketConnection
  }
}