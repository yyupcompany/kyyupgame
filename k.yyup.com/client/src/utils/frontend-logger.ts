/**
 * 前端统一日志工具
 * 替代所有console.log，提供统一的日志管理和格式化
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogConfig {
  level: LogLevel
  enableConsole: boolean
  enableTimestamp: boolean
  enableSourceInfo: boolean
  enableUserTracking: boolean
  maxLogSize: number
  logToServer: boolean
  serverEndpoint?: string
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  source?: string
  userId?: string
  data?: any
}

class FrontendLogger {
  private config: LogConfig = {
    level: LogLevel.INFO,
    enableConsole: true,
    enableTimestamp: true,
    enableSourceInfo: true,
    enableUserTracking: false,
    maxLogSize: 1000,
    logToServer: false,
  }

  private logHistory: LogEntry[] = []
  private userId: string | null = null

  constructor(config?: Partial<LogConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }

    // 从localStorage获取用户ID
    try {
      const userInfo = localStorage.getItem('userInfo')
      if (userInfo) {
        const parsed = JSON.parse(userInfo)
        this.userId = parsed.id || parsed.userId
      }
    } catch (error) {
      // 忽略localStorage访问错误
    }
  }

  setConfig(config: Partial<LogConfig>): void {
    this.config = { ...this.config, ...config }
  }

  setUserId(userId: string): void {
    this.userId = userId
  }

  private getSourceInfo(): string {
    if (!this.config.enableSourceInfo) return ''

    try {
      const stack = new Error().stack
      if (stack) {
        const lines = stack.split('\n')
        // 跳过当前函数调用，找到调用者
        for (let i = 3; i < lines.length; i++) {
          const line = lines[i].trim()
          if (line && !line.includes('frontend-logger.ts')) {
            const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/)
            if (match) {
              return `${match[1]}:${match[2]}:${match[3]}`
            }
            // 简化格式
            const simpleMatch = line.match(/at\s+(.+?):(\d+):(\d+)/)
            if (simpleMatch) {
              return `${simpleMatch[1]}:${simpleMatch[2]}:${simpleMatch[3]}`
            }
          }
        }
      }
    } catch (error) {
      // 忽略错误，返回空字符串
    }
    return ''
  }

  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date(),
      source: this.getSourceInfo(),
      userId: this.config.enableUserTracking ? this.userId || undefined : undefined,
      data,
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const parts: string[] = []

    // 时间戳
    if (this.config.enableTimestamp) {
      const time = entry.timestamp.toISOString()
      parts.push(`[${time}]`)
    }

    // 日志级别
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR']
    parts.push(`[${levelNames[entry.level]}]`)

    // 用户信息
    if (entry.userId) {
      parts.push(`[User:${entry.userId}]`)
    }

    // 源信息
    if (entry.source) {
      parts.push(`[${entry.source}]`)
    }

    // 消息
    parts.push(entry.message)

    // 数据对象
    if (entry.data !== undefined) {
      parts.push('\nData:', JSON.stringify(entry.data, null, 2))
    }

    return parts.join(' ')
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level
  }

  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry)

    // 保持历史记录大小限制
    if (this.logHistory.length > this.config.maxLogSize) {
      this.logHistory.shift()
    }
  }

  private async sendToServer(entry: LogEntry): Promise<void> {
    if (!this.config.logToServer || !this.config.serverEndpoint) {
      return
    }

    try {
      await fetch(this.config.serverEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })
    } catch (error) {
      // 避免日志发送失败导致应用错误
      console.warn('Failed to send log to server:', error)
    }
  }

  private async log(level: LogLevel, message: string, data?: any): Promise<void> {
    if (!this.shouldLog(level)) {
      return
    }

    const entry = this.createLogEntry(level, message, data)
    this.addToHistory(entry)

    const formattedMessage = this.formatLogEntry(entry)

    // 控制台输出
    if (this.config.enableConsole) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage)
          break
        case LogLevel.INFO:
          console.info(formattedMessage)
          break
        case LogLevel.WARN:
          console.warn(formattedMessage)
          break
        case LogLevel.ERROR:
          console.error(formattedMessage)
          break
      }
    }

    // 发送到服务器
    if (this.config.logToServer) {
      await this.sendToServer(entry)
    }
  }

  // 公共日志方法
  async debug(message: string, data?: any): Promise<void> {
    await this.log(LogLevel.DEBUG, message, data)
  }

  async info(message: string, data?: any): Promise<void> {
    await this.log(LogLevel.INFO, message, data)
  }

  async warn(message: string, data?: any): Promise<void> {
    await this.log(LogLevel.WARN, message, data)
  }

  async error(message: string, data?: any): Promise<void> {
    await this.log(LogLevel.ERROR, message, data)
  }

  // 获取日志历史
  getLogHistory(): LogEntry[] {
    return [...this.logHistory]
  }

  // 清空日志历史
  clearHistory(): void {
    this.logHistory = []
  }

  // 导出日志
  exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2)
  }

  // 按级别过滤日志
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logHistory.filter(entry => entry.level === level)
  }

  // 按用户过滤日志
  getLogsByUser(userId: string): LogEntry[] {
    return this.logHistory.filter(entry => entry.userId === userId)
  }

  // 获取最近的日志
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logHistory.slice(-count)
  }
}

// 创建默认实例
export const frontendLogger = new FrontendLogger()

// 开发环境配置
if (process.env.NODE_ENV === 'development') {
  frontendLogger.setConfig({
    level: LogLevel.DEBUG,
    enableConsole: true,
    enableTimestamp: true,
    enableSourceInfo: true,
    enableUserTracking: false,
    logToServer: false,
  })
} else {
  // 生产环境配置
  frontendLogger.setConfig({
    level: LogLevel.WARN,
    enableConsole: true,
    enableTimestamp: true,
    enableSourceInfo: false,
    enableUserTracking: true,
    logToServer: true,
    serverEndpoint: '/api/logs',
  })
}

export default frontendLogger