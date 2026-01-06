/**
 * 🎯 CallingLogger Frontend - 集中控制所有输出逻辑的日志系统
 *
 * 基于后端CallingLogger架构的前端版本，保持一致的API和功能
 * 将所有日志输出控制逻辑集中在 CallingLogger 内部，外部代码只需要调用日志方法，
 * 不需要关心具体的输出方式（屏幕/存储/远程），所有控制通过环境变量实现。
 */

// 日志级别定义
export type LogLevel = 'DEBUG' | 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'SYSTEM';

// 日志上下文接口
export interface LogContext {
  module?: string;
  operation?: string;
  userId?: number;
  tenantId?: string;
  route?: string;
  component?: string;
  [key: string]: any;
}

// 🎯 环境变量配置（前端适配）
const LOG_CONFIG = {
  // 控制开关
  ENABLE_CALLING_CONSOLE_LOG: import.meta.env.VITE_ENABLE_CALLING_CONSOLE_LOG !== 'false',
  ENABLE_CALLING_STORAGE_LOG: import.meta.env.VITE_ENABLE_CALLING_STORAGE_LOG === 'true',
  ENABLE_CALLING_REMOTE_LOG: import.meta.env.VITE_ENABLE_CALLING_REMOTE_LOG === 'true',

  // 过滤控制
  CALLING_LOG_LEVEL: (import.meta.env.VITE_CALLING_LOG_LEVEL || 'INFO').toUpperCase(),
  ENABLE_CALLING_LOG_COLORS: import.meta.env.VITE_ENABLE_CALLING_LOG_COLORS !== 'false',

  // 存储配置
  CALLING_LOG_STORAGE_KEY: import.meta.env.VITE_CALLING_LOG_STORAGE_KEY || 'calling_logs',
  CALLING_LOG_MAX_SIZE: parseInt(import.meta.env.VITE_CALLING_LOG_MAX_SIZE) || 1000,

  // 远程日志配置
  CALLING_LOG_REMOTE_ENDPOINT: import.meta.env.VITE_CALLING_LOG_REMOTE_ENDPOINT || '/api/logs',
  CALLING_LOG_BATCH_SIZE: parseInt(import.meta.env.VITE_CALLING_LOG_BATCH_SIZE) || 10,
  CALLING_LOG_FLUSH_INTERVAL: parseInt(import.meta.env.VITE_CALLING_LOG_FLUSH_INTERVAL) || 30000
};

// 日志颜色配置（浏览器适配）
const LOG_COLORS = {
  DEBUG: 'color: #00bfff; font-weight: bold;',    // 亮蓝色
  INFO: 'color: #ffffff; font-weight: normal;',    // 白色
  SUCCESS: 'color: #00ff00; font-weight: bold;',   // 绿色
  WARN: 'color: #ffff00; font-weight: bold;',      // 黄色
  ERROR: 'color: #ff4444; font-weight: bold;',     // 红色
  SYSTEM: 'color: #ff00ff; font-weight: bold;',    // 紫色
  RESET: 'color: inherit; font-weight: inherit;'
};

// 存储的日志条目接口
interface StoredLogEntry {
  timestamp: string;
  level: string;
  fileName: string;
  module: string;
  message: string;
  data?: any;
  context?: LogContext;
  userAgent?: string;
  url?: string;
  userId?: number;
}

/**
 * 🎯 前端 CallingLogger - 集中控制所有输出逻辑
 */
export class CallingLogger {

  private static logBuffer: StoredLogEntry[] = [];
  private static flushTimer: NodeJS.Timeout | null = null;

  // 🎯 统一输出控制器 - 核心方法
  private static outputController(formattedMessage: string, level: string, data?: any, context?: LogContext) {

    // 1. 级别过滤
    if (!this.shouldLog(level)) {
      return;
    }

    // 2. 屏幕输出 (根据环境变量控制)
    if (LOG_CONFIG.ENABLE_CALLING_CONSOLE_LOG) {
      this.outputToConsole(formattedMessage, level);
    }

    // 3. 本地存储输出 (根据环境变量控制)
    if (LOG_CONFIG.ENABLE_CALLING_STORAGE_LOG) {
      this.outputToStorage(formattedMessage, level, data, context);
    }

    // 4. 远程输出 (根据环境变量控制)
    if (LOG_CONFIG.ENABLE_CALLING_REMOTE_LOG) {
      this.outputToRemote(formattedMessage, level, data, context);
    }
  }

  // 🎯 屏幕输出方法
  private static outputToConsole(formattedMessage: string, level: string) {
    try {
      if (LOG_CONFIG.ENABLE_CALLING_LOG_COLORS) {
        const style = LOG_COLORS[level] || LOG_COLORS.RESET;
        console.log(`%c${formattedMessage}`, style);
      } else {
        console.log(formattedMessage);
      }
    } catch (error) {
      // 静默处理控制台输出错误，避免无限循环
    }
  }

  // 🎯 本地存储方法
  private static outputToStorage(formattedMessage: string, level: string, data?: any, context?: LogContext) {
    try {
      const logEntry: StoredLogEntry = {
        timestamp: this.getFormattedTimestamp(),
        level,
        fileName: this.getCallerFileName(),
        module: this.getModuleMapping(this.getCallerFileName()),
        message: formattedMessage,
        data,
        context
      };

      // 获取现有日志
      const existingLogs = this.getStoredLogs();

      // 添加新日志
      existingLogs.push(logEntry);

      // 保持日志大小限制
      if (existingLogs.length > LOG_CONFIG.CALLING_LOG_MAX_SIZE) {
        existingLogs.splice(0, existingLogs.length - LOG_CONFIG.CALLING_LOG_MAX_SIZE);
      }

      // 保存到localStorage
      localStorage.setItem(LOG_CONFIG.CALLING_LOG_STORAGE_KEY, JSON.stringify(existingLogs));
    } catch (error) {
      // 静默处理存储错误
    }
  }

  // 🎯 远程输出方法
  private static outputToRemote(formattedMessage: string, level: string, data?: any, context?: LogContext) {
    try {
      const logEntry: StoredLogEntry = {
        timestamp: this.getFormattedTimestamp(),
        level,
        fileName: this.getCallerFileName(),
        module: this.getModuleMapping(this.getCallerFileName()),
        message: formattedMessage,
        data,
        context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        // 添加用户信息（如果可获取）
        userId: this.getCurrentUserId()
      };

      // 添加到缓冲区
      this.logBuffer.push(logEntry);

      // 如果达到批处理大小，立即发送
      if (this.logBuffer.length >= LOG_CONFIG.CALLING_LOG_BATCH_SIZE) {
        this.flushLogBuffer();
      } else {
        // 设置定时发送
        this.scheduleFlush();
      }
    } catch (error) {
      // 静默处理远程日志错误
    }
  }

  // 获取存储的日志
  private static getStoredLogs(): StoredLogEntry[] {
    try {
      const stored = localStorage.getItem(LOG_CONFIG.CALLING_LOG_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  // 安排日志刷新
  private static scheduleFlush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }

    this.flushTimer = setTimeout(() => {
      this.flushLogBuffer();
    }, LOG_CONFIG.CALLING_LOG_FLUSH_INTERVAL);
  }

  // 刷新日志缓冲区
  private static async flushLogBuffer() {
    if (this.logBuffer.length === 0) return;

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await fetch(LOG_CONFIG.CALLING_LOG_REMOTE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs: logsToSend,
          timestamp: new Date().toISOString(),
          source: 'frontend'
        })
      });
    } catch (error) {
      // 如果发送失败，将日志重新加入缓冲区
      this.logBuffer.unshift(...logsToSend);
    }
  }

  // 获取当前用户ID
  private static getCurrentUserId(): number | undefined {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        return parsed.id || parsed.userId;
      }
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        return parsed.id || parsed.userId;
      }
    } catch (error) {
      // 忽略错误
    }
    return undefined;
  }

  // 🎯 级别过滤
  private static shouldLog(level: string): boolean {
    const levels = ['DEBUG', 'INFO', 'SUCCESS', 'WARN', 'ERROR', 'SYSTEM'];
    const currentLevel = LOG_CONFIG.CALLING_LOG_LEVEL;
    const currentLevelIndex = levels.indexOf(currentLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  // 🎯 统一的格式化方法
  private static formatLogEntry(level: string, icon: string, message: string, data?: any): string {
    const timestamp = this.getFormattedTimestamp();
    const fileName = this.getCallerFileName();
    const module = this.getModuleMapping(fileName);
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';

    return `[${timestamp}] [${fileName}] [${module}] [${level}] ${icon} ${message}${dataStr}`;
  }

  // 🎯 所有日志方法的统一实现
  static logInfo(context: LogContext, message: string, data?: any) {
    const logEntry = this.formatLogEntry('INFO', 'ℹ️', message, data);
    this.outputController(logEntry, 'INFO', data, context);
  }

  static logSuccess(context: LogContext, message: string, data?: any) {
    const logEntry = this.formatLogEntry('SUCCESS', '✅', message, data);
    this.outputController(logEntry, 'SUCCESS', data, context);
  }

  static logWarn(context: LogContext, message: string, data?: any) {
    const logEntry = this.formatLogEntry('WARN', '⚠️', message, data);
    this.outputController(logEntry, 'WARN', data, context);
  }

  static logError(context: LogContext, message: string, error?: Error, data?: any) {
    const errorData = { ...data, error: error?.message, stack: error?.stack };
    const logEntry = this.formatLogEntry('ERROR', '❌', message, errorData);
    this.outputController(logEntry, 'ERROR', errorData, context);
  }

  static logDebug(context: LogContext, message: string, data?: any) {
    const logEntry = this.formatLogEntry('DEBUG', '🔍', message, data);
    this.outputController(logEntry, 'DEBUG', data, context);
  }

  static logSystem(context: LogContext, message: string, data?: any) {
    const logEntry = this.formatLogEntry('SYSTEM', '⚙️', message, data);
    this.outputController(logEntry, 'SYSTEM', data, context);
  }

  // 业务专用方法
  static logCallStart(context: LogContext, message: string, data?: any) {
    this.logInfo(context, `📞 [呼叫开始] ${message}`, data);
  }

  static logAuth(context: LogContext, message: string, data?: any) {
    this.logInfo(context, `🔐 [认证] ${message}`, data);
  }

  static logVos(context: LogContext, message: string, data?: any) {
    this.logInfo(context, `📞 [VOS] ${message}`, data);
  }

  static logDoubao(context: LogContext, message: string, data?: any) {
    this.logInfo(context, `🤖 [豆包] ${message}`, data);
  }

  static logAudio(context: LogContext, message: string, data?: any) {
    this.logInfo(context, `🎙️ [音频] ${message}`, data);
  }

  static logValidation(context: LogContext, message: string, data?: any) {
    this.logInfo(context, `✅ [验证] ${message}`, data);
  }

  // AI相关专用方法
  static logAIQuery(context: LogContext, message: string, data?: any) {
    this.logInfo(context, `🤖 [AI查询] ${message}`, data);
  }

  static logAIModel(context: LogContext, message: string, data?: any) {
    this.logInfo(context, `🧠 [AI模型] ${message}`, data);
  }

  static logAIResponse(context: LogContext, message: string, data?: any) {
    this.logInfo(context, `💬 [AI响应] ${message}`, data);
  }

  static logAIError(context: LogContext, message: string, error?: Error, data?: any) {
    this.logError(context, `❌ [AI错误] ${message}`, error, data);
  }

  /**
   * 从Vue路由创建日志上下文
   */
  static createRouteContext(route: any, additionalContext?: any): LogContext {
    const baseContext: LogContext = {
      module: 'ROUTER',
      operation: route.path || 'unknown',
      route: route.path,
      component: route.name?.toString()
    };

    // 合并额外上下文
    if (additionalContext) {
      return { ...baseContext, ...additionalContext };
    }

    return baseContext;
  }

  /**
   * 从Vue组件创建日志上下文
   */
  static createComponentContext(componentName: string, additionalContext?: any): LogContext {
    const baseContext: LogContext = {
      module: 'COMPONENT',
      operation: componentName,
      component: componentName
    };

    // 合并额外上下文
    if (additionalContext) {
      return { ...baseContext, ...additionalContext };
    }

    return baseContext;
  }

  /**
   * 从API调用创建日志上下文
   */
  static createApiContext(apiPath: string, method: string, additionalContext?: any): LogContext {
    const baseContext: LogContext = {
      module: 'API',
      operation: `${method} ${apiPath}`,
      apiPath,
      method
    };

    // 添加用户信息
    const userId = this.getCurrentUserId();
    if (userId) {
      baseContext.userId = userId;
    }

    // 合并额外上下文
    if (additionalContext) {
      return { ...baseContext, ...additionalContext };
    }

    return baseContext;
  }

  // API调用日志
  static logApiCall(
    context: LogContext,
    apiPath: string,
    method: string,
    requestData?: any,
    responseData?: any,
    duration?: number,
    error?: Error
  ) {
    const data = {
      apiPath,
      method,
      requestData,
      responseData,
      duration: duration ? `${duration}ms` : undefined,
      error: error?.message
    };

    if (error) {
      this.logError(context, `API调用失败 ${method} ${apiPath}`, error, data);
    } else {
      this.logSuccess(context, `API调用成功 ${method} ${apiPath}`, data);
    }
  }

  // 🔧 工具方法

  /**
   * 获取格式化的时间戳
   */
  private static getFormattedTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  /**
   * 获取调用者文件名
   */
  private static getCallerFileName(): string {
    const stack = new Error().stack;
    if (!stack) return 'unknown';

    const stackLines = stack.split('\n');
    // 跳过当前函数和outputController函数的调用栈
    const callerLine = stackLines[4] || stackLines[3] || 'unknown';
    const match = callerLine.match(/at\s+(.+?):\d+:\d+/);

    if (match) {
      const fullPath = match[1];
      return fullPath.split('/').pop() || fullPath.split('\\').pop() || 'unknown';
    }

    return 'unknown';
  }

  /**
   * 模块映射
   */
  private static getModuleMapping(fileName: string): string {
    const moduleMap: { [key: string]: string } = {
      // AI相关
      'ai-': 'AI',
      'model-': 'AI',
      'conversation': 'AI',
      'memory': 'AI',

      // 认证相关
      'auth': 'AUTH',
      'permission': 'AUTH',

      // 业务相关
      'activity': 'BUSINESS',
      'enrollment': 'BUSINESS',
      'marketing': 'BUSINESS',
      'student': 'BUSINESS',
      'teacher': 'BUSINESS',
      'parent': 'BUSINESS',
      'attendance': 'BUSINESS',
      'task': 'BUSINESS',

      // 系统相关
      'system': 'SYSTEM',
      'router': 'SYSTEM',
      'guard': 'SYSTEM',

      // 租户相关
      'tenant': 'TENANT',

      // 工具相关
      'util': 'UTIL',
      'helper': 'UTIL',

      // API相关
      'api': 'API',
      'request': 'API',

      // Store相关
      'store': 'STORE',
      '-store': 'STORE',

      // Composable相关
      'use-': 'COMPOSABLE',
      'composable': 'COMPOSABLE',

      // 组件相关
      '.vue': 'COMPONENT'
    };

    for (const [prefix, module] of Object.entries(moduleMap)) {
      if (fileName.includes(prefix)) {
        return module;
      }
    }

    return 'GENERAL';
  }

  // 前端专用工具方法

  /**
   * 获取本地存储的日志
   */
  static getLocalLogs(): StoredLogEntry[] {
    return this.getStoredLogs();
  }

  /**
   * 清空本地存储的日志
   */
  static clearLocalLogs(): void {
    try {
      localStorage.removeItem(LOG_CONFIG.CALLING_LOG_STORAGE_KEY);
    } catch (error) {
      // 忽略错误
    }
  }

  /**
   * 手动刷新日志缓冲区
   */
  static async flushLogs(): Promise<void> {
    await this.flushLogBuffer();
  }

  /**
   * 获取配置信息
   */
  static getConfig() {
    return { ...LOG_CONFIG };
  }

  /**
   * 更新配置
   */
  static updateConfig(newConfig: Partial<typeof LOG_CONFIG>) {
    Object.assign(LOG_CONFIG, newConfig);
  }
}

// 导出单例实例（可选，根据使用习惯）
export default CallingLogger;