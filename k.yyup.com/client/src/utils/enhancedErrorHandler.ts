import { ElMessage, ElNotification } from 'element-plus'

/**
 * 增强的错误类型
 */
export enum EnhancedErrorType {
  SPEECH = 'speech',
  AI_ASSISTANT = 'ai_assistant',
  DRAG_DROP = 'drag_drop',
  VOICE_RECOGNITION = 'voice_recognition',
  CHAT_HISTORY = 'chat_history',
  PERFORMANCE = 'performance'
}

/**
 * 错误级别
 */
export enum ErrorLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * 增强的错误信息
 */
export interface EnhancedErrorInfo {
  type: EnhancedErrorType | string
  level: ErrorLevel
  message: string
  code?: string | number
  details?: any
  timestamp: string
  userAgent?: string
  url?: string
  userId?: string
  sessionId?: string
  stack?: string
  component?: string
  action?: string
}

/**
 * 增强的错误处理器
 */
export class EnhancedErrorHandler {
  private static instance: EnhancedErrorHandler
  private errorLogs: EnhancedErrorInfo[] = []
  private maxLogs = 500

  public static getInstance(): EnhancedErrorHandler {
    if (!EnhancedErrorHandler.instance) {
      EnhancedErrorHandler.instance = new EnhancedErrorHandler()
    }
    return EnhancedErrorHandler.instance
  }

  /**
   * 处理增强错误
   */
  public handleError(
    error: Error | string,
    type: EnhancedErrorType | string,
    level: ErrorLevel = ErrorLevel.ERROR,
    component?: string,
    action?: string,
    showToUser: boolean = true
  ): void {
    const errorInfo = this.createErrorInfo(error, type, level, component, action)
    
    // 记录错误日志
    this.logError(errorInfo)
    
    // 显示用户友好的错误信息
    if (showToUser) {
      this.showUserError(errorInfo)
    }
    
    // 控制台输出（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.error('Enhanced Error:', errorInfo)
    }
  }

  /**
   * 创建错误信息对象
   */
  private createErrorInfo(
    error: Error | string,
    type: EnhancedErrorType | string,
    level: ErrorLevel,
    component?: string,
    action?: string
  ): EnhancedErrorInfo {
    const message = typeof error === 'string' ? error : error.message
    const stack = typeof error === 'object' ? error.stack : undefined
    
    return {
      type,
      level,
      message,
      details: typeof error === 'object' ? error : undefined,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      stack,
      component,
      action
    }
  }

  /**
   * 记录错误日志
   */
  private logError(errorInfo: EnhancedErrorInfo): void {
    this.errorLogs.unshift(errorInfo)
    
    // 限制日志数量
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs = this.errorLogs.slice(0, this.maxLogs)
    }
    
    // 保存到本地存储
    try {
      localStorage.setItem('enhanced-error-logs', JSON.stringify(this.errorLogs.slice(0, 100)))
    } catch (e) {
      console.warn('Failed to save enhanced error logs:', e)
    }
  }

  /**
   * 显示用户友好的错误信息
   */
  private showUserError(errorInfo: EnhancedErrorInfo): void {
    const userMessage = this.getUserFriendlyMessage(errorInfo)
    
    switch (errorInfo.level) {
      case ErrorLevel.INFO:
        ElMessage.info(userMessage)
        break
      case ErrorLevel.WARNING:
        ElMessage.warning(userMessage)
        break
      case ErrorLevel.ERROR:
        ElMessage.error(userMessage)
        break
      case ErrorLevel.CRITICAL:
        ElNotification({
          title: '严重错误',
          message: userMessage,
          type: 'error',
          duration: 0
        })
        break
    }
  }

  /**
   * 获取用户友好的错误信息
   */
  private getUserFriendlyMessage(errorInfo: EnhancedErrorInfo): string {
    const messageMap: Record<string, Record<string, string>> = {
      [EnhancedErrorType.SPEECH]: {
        default: '语音功能异常，请检查麦克风权限',
        'not-allowed': '麦克风权限被拒绝，请在浏览器设置中允许',
        'no-speech': '未检测到语音，请重试',
        'audio-capture': '无法访问麦克风，请检查设备',
        'network': '语音服务网络异常，请检查网络连接'
      },
      [EnhancedErrorType.AI_ASSISTANT]: {
        default: 'AI助手服务异常，请稍后重试',
        'api_error': 'AI服务响应异常，请稍后重试',
        'timeout': 'AI服务响应超时，请稍后重试',
        'quota_exceeded': 'AI服务使用量已达上限，请稍后重试'
      },
      [EnhancedErrorType.DRAG_DROP]: {
        default: '拖拽操作失败，请重试',
        'sort_failed': '排序更新失败，请刷新页面重试',
        'permission_denied': '没有权限进行此操作'
      },
      [EnhancedErrorType.VOICE_RECOGNITION]: {
        default: '语音识别失败，请重试',
        'language_not_supported': '当前语言不支持语音识别',
        'service_unavailable': '语音识别服务不可用'
      },
      [EnhancedErrorType.CHAT_HISTORY]: {
        default: '聊天记录操作失败',
        'storage_full': '本地存储空间不足，请清理数据',
        'export_failed': '导出聊天记录失败',
        'import_failed': '导入聊天记录失败'
      },
      [EnhancedErrorType.PERFORMANCE]: {
        default: '性能监控异常',
        'memory_leak': '检测到内存泄漏，建议刷新页面',
        'fps_low': '页面帧率过低，可能影响使用体验'
      }
    }
    
    const typeMessages = messageMap[errorInfo.type] || {}
    const code = errorInfo.code?.toString() || 'default'
    
    return typeMessages[code] || typeMessages.default || errorInfo.message || '发生未知错误'
  }

  /**
   * 获取当前用户ID
   */
  private getCurrentUserId(): string | undefined {
    try {
      const userInfo = localStorage.getItem('user-info')
      if (userInfo) {
        const user = JSON.parse(userInfo)
        return user.id?.toString()
      }
    } catch (e) {
      // ignore
    }
    return undefined
  }

  /**
   * 获取会话ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session-id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`
      sessionStorage.setItem('session-id', sessionId)
    }
    return sessionId
  }

  /**
   * 获取错误日志
   */
  public getErrorLogs(): EnhancedErrorInfo[] {
    return [...this.errorLogs]
  }

  /**
   * 清空错误日志
   */
  public clearErrorLogs(): void {
    this.errorLogs = []
    localStorage.removeItem('enhanced-error-logs')
  }

  /**
   * 导出错误日志
   */
  public exportErrorLogs(): void {
    const data = {
      logs: this.errorLogs,
      exportedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `enhanced-error-logs-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * 从本地存储加载错误日志
   */
  public loadErrorLogs(): void {
    try {
      const stored = localStorage.getItem('enhanced-error-logs')
      if (stored) {
        const logs = JSON.parse(stored)
        this.errorLogs = Array.isArray(logs) ? logs : []
      }
    } catch (e) {
      console.warn('Failed to load enhanced error logs:', e)
    }
  }

  /**
   * 获取错误统计
   */
  public getErrorStats(): {
    total: number
    byType: Record<string, number>
    byLevel: Record<string, number>
    byComponent: Record<string, number>
  } {
    const stats = {
      total: this.errorLogs.length,
      byType: {} as Record<string, number>,
      byLevel: {} as Record<string, number>,
      byComponent: {} as Record<string, number>
    }

    this.errorLogs.forEach(error => {
      // 按类型统计
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1
      
      // 按级别统计
      stats.byLevel[error.level] = (stats.byLevel[error.level] || 0) + 1
      
      // 按组件统计
      if (error.component) {
        stats.byComponent[error.component] = (stats.byComponent[error.component] || 0) + 1
      }
    })

    return stats
  }
}

/**
 * 全局增强错误处理器实例
 */
export const enhancedErrorHandler = EnhancedErrorHandler.getInstance()

/**
 * 便捷的错误处理函数
 */
export const handleEnhancedError = (
  error: Error | string,
  type: EnhancedErrorType | string,
  level: ErrorLevel = ErrorLevel.ERROR,
  component?: string,
  action?: string,
  showToUser: boolean = true
) => {
  enhancedErrorHandler.handleError(error, type, level, component, action, showToUser)
}

// 特定类型的错误处理函数
export const handleSpeechError = (error: any, component?: string, showToUser: boolean = true) => {
  const errorCode = error.error || 'default'
  const errorInfo = { ...error, code: errorCode }
  enhancedErrorHandler.handleError(errorInfo, EnhancedErrorType.SPEECH, ErrorLevel.WARNING, component, 'speech_operation', showToUser)
}

export const handleAIAssistantError = (error: any, component?: string, action?: string, showToUser: boolean = true) => {
  enhancedErrorHandler.handleError(error, EnhancedErrorType.AI_ASSISTANT, ErrorLevel.ERROR, component, action, showToUser)
}

export const handleDragDropError = (error: any, component?: string, showToUser: boolean = true) => {
  enhancedErrorHandler.handleError(error, EnhancedErrorType.DRAG_DROP, ErrorLevel.WARNING, component, 'drag_drop', showToUser)
}

export const handleVoiceRecognitionError = (error: any, component?: string, showToUser: boolean = true) => {
  enhancedErrorHandler.handleError(error, EnhancedErrorType.VOICE_RECOGNITION, ErrorLevel.WARNING, component, 'voice_recognition', showToUser)
}

export const handleChatHistoryError = (error: any, component?: string, action?: string, showToUser: boolean = true) => {
  enhancedErrorHandler.handleError(error, EnhancedErrorType.CHAT_HISTORY, ErrorLevel.ERROR, component, action, showToUser)
}

export const handlePerformanceError = (error: any, component?: string, showToUser: boolean = false) => {
  enhancedErrorHandler.handleError(error, EnhancedErrorType.PERFORMANCE, ErrorLevel.WARNING, component, 'performance_monitor', showToUser)
}

// 初始化时加载错误日志
enhancedErrorHandler.loadErrorLogs()

export default enhancedErrorHandler
