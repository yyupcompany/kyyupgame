/**
 * SSE 心跳和连接管理器
 * 提供心跳检测、自动重连、连接状态监控功能
 */

import { ref, computed } from 'vue'

// 连接状态枚举
export enum SSEConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// 配置接口
export interface SSEConfig {
  heartbeatInterval?: number      // 心跳间隔（毫秒），默认15000ms
  maxReconnectAttempts?: number   // 最大重连次数，默认3
  reconnectInterval?: number      // 重连间隔（毫秒），默认2000ms
  heartbeatTimeout?: number       // 心跳超时时间（毫秒），默认10000ms
  onHeartbeat?: () => void        // 心跳回调
  onReconnect?: (attempt: number) => void  // 重连回调
  onConnectionChange?: (state: SSEConnectionState) => void  // 状态变化回调
}

export class SSEHeartbeatManager {
  // 连接状态
  private _connectionState = ref<SSEConnectionState>(SSEConnectionState.DISCONNECTED)
  get connectionState() { return this._connectionState.value }
  set connectionState(v) { this._connectionState.value = v }

  // 配置
  private config: Required<SSEConfig>

  // 内部状态
  private heartbeatTimer: NodeJS.Timeout | null = null
  private heartbeatTimeoutTimer: NodeJS.Timeout | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private lastHeartbeatTime = 0
  private isManuallyClosed = false

  // 事件统计
  private eventCount = 0
  private lastEventTime = 0

  constructor(config: SSEConfig = {}) {
    this.config = {
      heartbeatInterval: config.heartbeatInterval ?? 15000,    // 15秒心跳
      maxReconnectAttempts: config.maxReconnectAttempts ?? 3,
      reconnectInterval: config.reconnectInterval ?? 2000,     // 2秒重连间隔
      heartbeatTimeout: config.heartbeatTimeout ?? 10000,      // 10秒超时
      onHeartbeat: config.onHeartbeat ?? (() => {}),
      onReconnect: config.onReconnect ?? (() => {}),
      onConnectionChange: config.onConnectionChange ?? (() => {})
    }
  }

  // 计算属性
  get isConnected(): boolean {
    return this._connectionState.value === SSEConnectionState.CONNECTED
  }

  get isReconnecting(): boolean {
    return this._connectionState.value === SSEConnectionState.RECONNECTING
  }

  get reconnectAttemptsRemaining(): number {
    return this.config.maxReconnectAttempts - this.reconnectAttempts
  }

  get connectionDuration(): number {
    if (this.lastHeartbeatTime === 0) return 0
    return Date.now() - this.lastHeartbeatTime
  }

  // 设置连接状态
  setState(state: SSEConnectionState) {
    const previousState = this._connectionState.value
    this._connectionState.value = state
    this.config.onConnectionChange(state)

    // 状态变化日志
    console.log(`[SSE管理器] 状态变化: ${previousState} -> ${state}`)
  }

  // 开始心跳检测
  startHeartbeat() {
    this.stopHeartbeat()
    this.lastHeartbeatTime = Date.now()

    // 定时发送心跳
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat()
    }, this.config.heartbeatInterval)

    console.log(`[SSE管理器] 心跳检测已启动，间隔: ${this.config.heartbeatInterval}ms`)
  }

  // 发送心跳
  private sendHeartbeat() {
    const now = Date.now()
    const timeSinceLastHeartbeat = now - this.lastHeartbeatTime

    // 如果距离上次心跳超过超时时间，认为连接可能断开
    if (timeSinceLastHeartbeat > this.config.heartbeatTimeout) {
      console.warn(`[SSE管理器] 心跳超时 (${timeSinceLastHeartbeat}ms)，连接可能已断开`)
      this.handleConnectionIssue()
      return
    }

    // 触发心跳回调
    this.config.onHeartbeat()
    this.lastHeartbeatTime = now

    console.log(`[SSE管理器] 心跳发送成功，距离上次: ${timeSinceLastHeartbeat}ms`)
  }

  // 记录收到事件
  recordEvent() {
    this.eventCount++
    this.lastEventTime = Date.now()
  }

  // 处理连接问题
  private handleConnectionIssue() {
    if (this.isManuallyClosed) return

    // 设置错误状态
    this.setState(SSEConnectionState.ERROR)

    // 尝试重连
    this.attemptReconnect()
  }

  // 尝试重连
  private attemptReconnect() {
    if (this.isManuallyClosed) return
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error(`[SSE管理器] 超过最大重连次数 (${this.config.maxReconnectAttempts})，放弃重连`)
      this.setState(SSEConnectionState.DISCONNECTED)
      return
    }

    this.reconnectAttempts++
    this.setState(SSEConnectionState.RECONNECTING)

    const attempt = this.reconnectAttempts
    console.log(`[SSE管理器] 准备第 ${attempt} 次重连...`)

    // 触发重连回调
    this.config.onReconnect(attempt)

    // 设置重连定时器
    this.reconnectTimer = setTimeout(() => {
      console.log(`[SSE管理器] 执行第 ${attempt} 次重连`)
      // 注意：实际的连接逻辑由调用方实现
      // 这里只是通知调用方可以开始重连
      this.setState(SSEConnectionState.CONNECTING)
    }, this.config.reconnectInterval)
  }

  // 重置重连计数
  resetReconnectAttempts() {
    this.reconnectAttempts = 0
    console.log('[SSE管理器] 重连计数已重置')
  }

  // 停止心跳
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
      this.heartbeatTimeoutTimer = null
    }
  }

  // 手动关闭连接
  close() {
    this.isManuallyClosed = true
    this.stopHeartbeat()
    this.stopReconnect()
    this.setState(SSEConnectionState.DISCONNECTED)
    console.log('[SSE管理器] 连接已手动关闭')
  }

  // 停止重连
  private stopReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  // 打开连接（手动重开）
  open() {
    this.isManuallyClosed = false
    this.resetReconnectAttempts()
    this.setState(SSEConnectionState.DISCONNECTED)
    console.log('[SSE管理器] 连接已准备好重新开启')
  }

  // 获取连接统计
  getStats() {
    return {
      state: this._connectionState.value,
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.config.maxReconnectAttempts,
      reconnectAttemptsRemaining: this.reconnectAttemptsRemaining,
      eventCount: this.eventCount,
      lastEventTime: this.lastEventTime,
      lastHeartbeatTime: this.lastHeartbeatTime,
      connectionDuration: this.connectionDuration
    }
  }

  // 销毁实例
  destroy() {
    this.close()
    this.eventCount = 0
    this.lastEventTime = 0
    console.log('[SSE管理器] 实例已销毁')
  }
}

// 导出单例（可选，用于全局共享）
let globalManager: SSEHeartbeatManager | null = null

export function getGlobalSSEHeartbeatManager(config?: SSEConfig): SSEHeartbeatManager {
  if (!globalManager) {
    globalManager = new SSEHeartbeatManager(config)
  }
  return globalManager
}

export function destroyGlobalSSEHeartbeatManager() {
  if (globalManager) {
    globalManager.destroy()
    globalManager = null
  }
}
