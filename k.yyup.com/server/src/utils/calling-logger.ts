/**
 * 🎯 CallingLogger - 统一日志系统
 * 基于CALLING_LOGGER_ARCHITECTURE.md规范实现
 */

import * as fs from 'fs';
import * as path from 'path';

// 日志配置接口
export interface LogContext {
  operation?: string;
  userId?: number;
  tenantCode?: string;
  requestId?: string;
  [key: string]: any;
}

// 环境变量配置
const LOG_CONFIG = {
  // 控制开关
  ENABLE_CALLING_CONSOLE_LOG: process.env.ENABLE_CALLING_CONSOLE_LOG !== 'false',
  ENABLE_CALLING_FILE_LOG: process.env.ENABLE_CALLING_FILE_LOG === 'true',
  ENABLE_CALLING_DB_LOG: process.env.ENABLE_CALLING_DB_LOG === 'true',

  // 过滤控制
  CALLING_LOG_LEVEL: process.env.CALLING_LOG_LEVEL || 'INFO',
  ENABLE_CALLING_LOG_COLORS: process.env.ENABLE_CALLING_LOG_COLORS !== 'false',

  // 文件配置
  CALLING_LOG_DIR: process.env.CALLING_LOG_DIR || 'logs/calling',
  CALLING_LOG_MAX_FILE_SIZE: parseInt(process.env.CALLING_LOG_MAX_FILE_SIZE) || 10,
  CALLING_LOG_MAX_FILES: parseInt(process.env.CALLING_LOG_MAX_FILES) || 5
};

// 日志颜色配置
const LOG_COLORS = {
  DEBUG: '\x1b[36m',     // 青色
  INFO: '\x1b[37m',      // 白色
  SUCCESS: '\x1b[32m',   // 绿色
  WARN: '\x1b[33m',      // 黄色
  ERROR: '\x1b[31m',     // 红色
  SYSTEM: '\x1b[35m',    // 紫色
  RESET: '\x1b[0m'       // 重置
};

/**
 * 🎯 重新设计的 CallingLogger - 集中控制所有输出逻辑
 */
export class CallingLogger {

  // 🎯 统一输出控制器 - 核心方法
  private static outputController(formattedMessage: string, level: string, data?: any) {

    // 1. 级别过滤
    if (!this.shouldLog(level)) {
      return
    }

    // 2. 屏幕输出 (根据环境变量控制)
    if (LOG_CONFIG.ENABLE_CALLING_CONSOLE_LOG) {
      this.outputToConsole(formattedMessage, level)
    }

    // 3. 文件输出 (根据环境变量控制)
    if (LOG_CONFIG.ENABLE_CALLING_FILE_LOG) {
      this.outputToFile(formattedMessage, level)
    }

    // 4. 数据库输出 (根据环境变量控制)
    if (LOG_CONFIG.ENABLE_CALLING_DB_LOG && data) {
      this.outputToDatabase(formattedMessage, level, data)
    }
  }

  // 🎯 屏幕输出方法
  private static outputToConsole(formattedMessage: string, level: string) {
    try {
      if (LOG_CONFIG.ENABLE_CALLING_LOG_COLORS) {
        const color = LOG_COLORS[level] || LOG_COLORS.RESET
        const reset = LOG_COLORS.RESET
        console.log(`${color}${formattedMessage}${reset}`)
      } else {
        console.log(formattedMessage)
      }
    } catch (error) {
      // 静默处理控制台输出错误，避免无限循环
    }
  }

  // 🎯 文件输出方法
  private static outputToFile(formattedMessage: string, level: string) {
    try {
      const logDir = path.join(process.cwd(), LOG_CONFIG.CALLING_LOG_DIR)
      this.ensureLogDir(logDir)

      // 主文件 (all.log)
      const allLogFile = path.join(logDir, 'all.log')
      fs.appendFile(allLogFile, formattedMessage + '\n', (err) => {
        if (err) this.handleFileError(err)
      })

      // 按级别分类文件
      const levelLogFile = path.join(logDir, `${level.toLowerCase()}.log`)
      fs.appendFile(levelLogFile, formattedMessage + '\n', (err) => {
        if (err) this.handleFileError(err)
      })

      // 异步文件轮转
      setImmediate(() => {
        this.rotateLogFile(allLogFile)
        this.rotateLogFile(levelLogFile)
      })

    } catch (error) {
      // 静默处理文件写入错误
    }
  }

  // 🎯 数据库输出方法 (如果需要)
  private static outputToDatabase(formattedMessage: string, level: string, data?: any) {
    // 这里可以实现数据库写入逻辑
    // 根据实际需求决定是否保留
    // 暂时保留为空实现
  }

  // 🎯 级别过滤
  private static shouldLog(level: string): boolean {
    const levels = ['DEBUG', 'INFO', 'SUCCESS', 'WARN', 'ERROR', 'SYSTEM']
    const currentLevel = LOG_CONFIG.CALLING_LOG_LEVEL.toUpperCase()
    const currentLevelIndex = levels.indexOf(currentLevel)
    const messageLevelIndex = levels.indexOf(level)

    return messageLevelIndex >= currentLevelIndex
  }

  // 🎯 统一的格式化方法
  private static formatLogEntry(level: string, icon: string, message: string, data?: any): string {
    const timestamp = this.getFormattedTimestamp()
    const fileName = this.getCallerFileName()
    const module = this.getModuleMapping(fileName)
    const dataStr = data ? ` ${JSON.stringify(data, null, 2)}` : ''

    return `[${timestamp}] [${fileName}] [${module}] [${level}] ${icon} ${message}${dataStr}`
  }

  // 🎯 获取格式化的时间戳
  private static getFormattedTimestamp(): string {
    const now = new Date()
    return now.toISOString().replace('T', ' ').substring(0, 19)
  }

  // 🎯 获取调用文件名
  private static getCallerFileName(): string {
    const stack = new Error().stack
    if (!stack) return 'unknown'

    const lines = stack.split('\n')
    // 找到调用CallingLogger的文件行
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i]
      if (line && !line.includes('calling-logger.ts')) {
        const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):\d+\)/)
        if (match) {
          const fileName = match[2].split('/').pop() || match[2]
          return fileName.replace('.ts', '').replace('.js', '')
        }
      }
    }
    return 'unknown'
  }

  // 🎯 模块映射
  private static getModuleMapping(fileName: string): string {
    const moduleMap: Record<string, string> = {
      'activity': '活动管理',
      'advertisement': '营销管理',
      'ai-analysis': 'AI分析',
      'ai-cache': 'AI缓存',
      'auth': '认证授权',
      'backup': '数据备份',
      'classroom': '班级管理',
      'customer-relationship': '客户关系',
      'health': '健康检查',
      'lesson': '课程管理',
      'notification': '通知管理',
      'parent-notification': '家长通知',
      'parent-operation': '家长操作',
      'teacher-notification': '教师通知',
      'teacher-operation': '教师操作',
      'user': '用户管理',
      'user-service': '用户服务',
      'dashboard': '仪表板',
      'system': '系统管理',
      'file': '文件管理'
    }
    return moduleMap[fileName] || '通用模块'
  }

  // 🎯 确保日志目录存在
  private static ensureLogDir(logDir: string): void {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
  }

  // 🎯 处理文件错误
  private static handleFileError(err: Error): void {
    console.error('日志文件写入错误:', err.message)
  }

  // 🎯 文件轮转
  private static rotateLogFile(logFile: string): void {
    try {
      if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile)
        const maxSizeBytes = LOG_CONFIG.CALLING_LOG_MAX_FILE_SIZE * 1024 * 1024

        if (stats.size > maxSizeBytes) {
          // 简单的轮转策略：重命名当前文件
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
          const archiveFile = logFile.replace('.log', `-${timestamp}.log`)
          fs.renameSync(logFile, archiveFile)

          // 可以在这里添加清理旧文件的逻辑
        }
      }
    } catch (error) {
      // 静默处理轮转错误
    }
  }

  // 🎯 所有日志方法的统一实现
  static logInfo(context: LogContext, message: string, data?: any) {
    const logEntry = this.formatLogEntry('INFO', 'ℹ️', message, data)
    this.outputController(logEntry, 'INFO', data)
  }

  static logSuccess(context: LogContext, message: string, data?: any) {
    const logEntry = this.formatLogEntry('SUCCESS', '✅', message, data)
    this.outputController(logEntry, 'SUCCESS', data)
  }

  static logWarn(context: LogContext, message: string, data?: any) {
    const logEntry = this.formatLogEntry('WARN', '⚠️', message, data)
    this.outputController(logEntry, 'WARN', data)
  }

  static logError(context: LogContext, message: string, error?: Error, data?: any) {
    const errorData = { ...data, error: error?.message, stack: error?.stack }
    const logEntry = this.formatLogEntry('ERROR', '❌', message, errorData)
    this.outputController(logEntry, 'ERROR', errorData)
  }

  static logDebug(context: LogContext, message: string, data?: any) {
    const logEntry = this.formatLogEntry('DEBUG', '🔍', message, data)
    this.outputController(logEntry, 'DEBUG', data)
  }

  static logSystem(context: LogContext, message: string, data?: any) {
    const logEntry = this.formatLogEntry('SYSTEM', '⚙️', message, data)
    this.outputController(logEntry, 'SYSTEM', data)
  }

  // 业务专用方法
  static logCallStart(context: LogContext, message: string, data?: any) {
    this.logInfo(context, `📞 [呼叫开始] ${message}`, data)
  }

  static logAuth(context: LogContext, message: string, data?: any) {
    this.logInfo(context, `🔐 [认证] ${message}`, data)
  }

  static logApi(context: LogContext, message: string, data?: any) {
    this.logInfo(context, `🌐 [API] ${message}`, data)
  }

  static logValidation(context: LogContext, message: string, data?: any) {
    this.logInfo(context, `✅ [验证] ${message}`, data)
  }

  static logAIMemory(context: LogContext, message: string, data?: any) {
    this.logInfo(context, `🧠 [AI记忆] ${message}`, data)
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
    }

    if (error) {
      this.logError(context, `API调用失败 ${method} ${apiPath}`, error, data)
    } else {
      this.logSuccess(context, `API调用成功 ${method} ${apiPath}`, data)
    }
  }

  // 🎯 便捷方法：从请求创建上下文
  static createContext(req?: any): LogContext {
    return {
      operation: req?.method + ' ' + req?.originalUrl,
      userId: req?.user?.id,
      tenantCode: req?.tenantCode,
      requestId: req?.id || req?.requestId,
      userAgent: req?.headers?.['user-agent'],
      ip: req?.ip
    }
  }

  // 🎯 服务层专用上下文创建方法
  static createServiceContext(serviceName: string, operation?: string, additionalData?: any): LogContext {
    return {
      service: serviceName,
      operation,
      module: serviceName,
      timestamp: new Date().toISOString(),
      ...additionalData
    }
  }
}

// 导出单例实例
export default CallingLogger