/**
 * 生产环境日志管理器
 * Production Logger
 *
 * 统一管理生产环境的日志输出，避免调试代码泄露
 */

// 日志级别
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

// 日志配置
interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableRemote: boolean
  remoteEndpoint?: string
  maxLogSize: number
  batchSize: number
  enablePerformance: boolean
  enableErrorTracking: boolean
}

// 日志条目
interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
  source: string
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  error?: {
    name: string
    message: string
    stack: string
  }
}

/**
 * 生产环境日志管理器
 */
class ProductionLogger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private isProduction: boolean;
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.sessionId = this.generateSessionId();

    this.config = {
      level: this.isProduction ? LogLevel.ERROR : LogLevel.DEBUG,
      enableConsole: !this.isProduction,
      enableRemote: this.isProduction,
      maxLogSize: 1000,
      batchSize: 50,
      enablePerformance: true,
      enableErrorTracking: true,
      ...config
    };

    // 全局错误处理
    if (this.config.enableErrorTracking) {
      this.setupErrorHandling();
    }

    // 页面卸载时发送剩余日志
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushLogs();
      });

      window.addEventListener('error', (event) => {
        this.error('Global Error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.error('Unhandled Promise Rejection', {
          reason: event.reason
        });
      });
    }
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * 设置全局错误处理
   */
  private setupErrorHandling(): void {
    if (typeof window !== 'undefined') {
      const originalConsoleError = console.error;
      console.error = (...args: any[]) => {
        originalConsoleError.apply(console, args);
        this.error('Console Error', { args });
      };
    }
  }

  /**
   * 创建日志条目
   */
  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      source: 'client',
      sessionId: this.sessionId
    };

    // 添加浏览器信息
    if (typeof window !== 'undefined') {
      entry.url = window.location.href;
      entry.userAgent = navigator.userAgent;
      entry.userId = this.getCurrentUserId();
    }

    // 添加错误信息
    if (data instanceof Error) {
      entry.error = {
        name: data.name,
        message: data.message,
        stack: data.stack || ''
      };
      entry.data = { ...data, name: undefined, message: undefined, stack: undefined };
    }

    return entry;
  }

  /**
   * 获取当前用户ID
   */
  private getCurrentUserId(): string | undefined {
    try {
      // 尝试从localStorage获取用户信息
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        return parsed.id || parsed.userId;
      }

      // 尝试从Vuex/Pinia获取
      if (typeof window !== 'undefined' && (window as any).__VUE__) {
        // 这里可以集成状态管理库
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * 处理日志条目
   */
  private processLog(entry: LogEntry): void {
    // 添加到缓冲区
    this.logBuffer.push(entry);

    // 控制台输出
    if (this.config.enableConsole && this.shouldLogToConsole(entry.level)) {
      this.logToConsole(entry);
    }

    // 检查是否需要发送到远程
    if (this.config.enableRemote) {
      if (entry.level <= LogLevel.ERROR || this.logBuffer.length >= this.config.batchSize) {
        this.flushLogs();
      }
    }

    // 限制缓冲区大小
    if (this.logBuffer.length > this.config.maxLogSize) {
      this.logBuffer = this.logBuffer.slice(-this.config.maxLogSize);
    }
  }

  /**
   * 判断是否应该输出到控制台
   */
  private shouldLogToConsole(level: LogLevel): boolean {
    return level <= this.config.level;
  }

  /**
   * 控制台输出
   */
  private logToConsole(entry: LogEntry): void {
    const { timestamp, level, message, data } = entry;
    const logMessage = `[${timestamp}] ${message}`;

    switch (level) {
      case LogLevel.ERROR:
        console.error(logMessage, data);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data);
        break;
      case LogLevel.INFO:
        console.info(logMessage, data);
        break;
      case LogLevel.DEBUG:
        console.debug(logMessage, data);
        break;
      case LogLevel.TRACE:
        console.log(logMessage, data);
        break;
    }
  }

  /**
   * 发送日志到远程服务器
   */
  private async flushLogs(): Promise<void> {
    if (!this.config.enableRemote || this.logBuffer.length === 0) {
      return;
    }

    const logsToSend = this.logBuffer.splice(0, this.config.batchSize);

    try {
      await this.sendLogsToRemote(logsToSend);
    } catch (error) {
      // 发送失败时重新加入缓冲区
      this.logBuffer.unshift(...logsToSend);
      console.error('Failed to send logs to remote:', error);
    }
  }

  /**
   * 发送日志到远程服务器
   */
  private async sendLogsToRemote(logs: LogEntry[]): Promise<void> {
    if (!this.config.remoteEndpoint) {
      return;
    }

    const payload = {
      logs,
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        url: typeof window !== 'undefined' ? window.location.href : '',
        sessionId: this.sessionId
      }
    };

    // 使用navigator.sendBeacon进行可靠发送
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(
        this.config.remoteEndpoint,
        JSON.stringify(payload)
      );
    } else {
      // 回退到fetch
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        keepalive: true
      });
    }
  }

  /**
   * 日志方法 - 错误
   */
  error(message: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, data);
    this.processLog(entry);
  }

  /**
   * 日志方法 - 警告
   */
  warn(message: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, data);
    this.processLog(entry);
  }

  /**
   * 日志方法 - 信息
   */
  info(message: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, data);
    this.processLog(entry);
  }

  /**
   * 日志方法 - 调试
   */
  debug(message: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, data);
    this.processLog(entry);
  }

  /**
   * 日志方法 - 跟踪
   */
  trace(message: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.TRACE, message, data);
    this.processLog(entry);
  }

  /**
   * 性能日志
   */
  performance(name: string, duration: number, data?: any): void {
    if (!this.config.enablePerformance) {
      return;
    }

    this.info(`Performance: ${name}`, {
      duration,
      unit: 'ms',
      ...data
    });
  }

  /**
   * 用户操作日志
   */
  userAction(action: string, data?: any): void {
    this.info(`User Action: ${action}`, {
      type: 'user_action',
      action,
      ...data
    });
  }

  /**
   * API调用日志
   */
  apiCall(method: string, url: string, duration?: number, status?: number, error?: any): void {
    const logData: any = {
      method,
      url,
      type: 'api_call'
    };

    if (duration !== undefined) {
      logData.duration = duration;
    }

    if (status !== undefined) {
      logData.status = status;
    }

    if (error) {
      logData.error = error;
      this.error(`API Error: ${method} ${url}`, logData);
    } else {
      this.info(`API Call: ${method} ${url}`, logData);
    }
  }

  /**
   * 设置配置
   */
  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取配置
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * 清除日志缓冲区
   */
  clearLogs(): void {
    this.logBuffer = [];
  }

  /**
   * 获取日志统计
   */
  getLogStats(): { total: number; byLevel: Record<string, number> } {
    const stats = { total: this.logBuffer.length, byLevel: {} as Record<string, number> };

    this.logBuffer.forEach(entry => {
      const levelName = LogLevel[entry.level];
      stats.byLevel[levelName] = (stats.byLevel[levelName] || 0) + 1;
    });

    return stats;
  }
}

// 创建全局日志实例
export const logger = new ProductionLogger({
  level: process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.DEBUG,
  enableConsole: process.env.NODE_ENV !== 'production',
  enableRemote: process.env.NODE_ENV === 'production',
  remoteEndpoint: process.env.VITE_LOG_ENDPOINT || '/api/logs'
});

// 开发环境下的便捷方法
export const log = {
  error: (message: string, data?: any) => logger.error(message, data),
  warn: (message: string, data?: any) => logger.warn(message, data),
  info: (message: string, data?: any) => logger.info(message, data),
  debug: (message: string, data?: any) => {
    // 开发环境才输出debug日志
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(message, data);
    }
  },
  trace: (message: string, data?: any) => {
    // 开发环境才输出trace日志
    if (process.env.NODE_ENV !== 'production') {
      logger.trace(message, data);
    }
  },
  performance: (name: string, duration: number, data?: any) => {
    logger.performance(name, duration, data);
  },
  userAction: (action: string, data?: any) => {
    logger.userAction(action, data);
  },
  apiCall: (method: string, url: string, duration?: number, status?: number, error?: any) => {
    logger.apiCall(method, url, duration, status, error);
  }
};

// Vue插件
export const LoggerPlugin = {
  install(app: any) {
    app.config.globalProperties.$log = log;
    app.provide('logger', logger);
  }
};

export default logger;