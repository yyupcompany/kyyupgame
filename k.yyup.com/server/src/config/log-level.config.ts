/**
 * 日志级别控制配置
 *
 * 提供灵活的日志级别控制和日志格式化
 */

import { Request, Response, NextFunction } from 'express';

/**
 * 日志级别
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  DEBUG = 'debug',
  TRACE = 'trace'
}

/**
 * 日志级别权重（用于比较）
 */
const LOG_LEVEL_WEIGHTS: Record<LogLevel, number> = {
  [LogLevel.ERROR]: 0,
  [LogLevel.WARN]: 1,
  [LogLevel.INFO]: 2,
  [LogLevel.HTTP]: 3,
  [LogLevel.DEBUG]: 4,
  [LogLevel.TRACE]: 5
};

/**
 * 日志元数据
 */
export interface LogMetadata {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  userId?: number;
  requestId?: string;
  ip?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

/**
 * 日志配置选项
 */
export interface LogConfig {
  level: LogLevel;
  format: 'json' | 'text' | 'combined';
  colorize: boolean;
  timestamp: boolean;
  includeStackTrace: boolean;
  sensitiveFields: string[];
  maxLogSize: number;
  logFilePath?: string;
}

/**
 * 默认配置
 */
export const DEFAULT_LOG_CONFIG: LogConfig = {
  level: process.env.LOG_LEVEL as LogLevel || LogLevel.INFO,
  format: 'json',
  colorize: process.env.NODE_ENV === 'development',
  timestamp: true,
  includeStackTrace: process.env.NODE_ENV === 'development',
  sensitiveFields: ['password', 'token', 'secret', 'apiKey', 'accessToken', 'refreshToken'],
  maxLogSize: 10 * 1024 * 1024 // 10MB
};

/**
 * 日志级别控制管理器
 */
export class LogLevelManager {
  private currentLevel: LogLevel;
  private config: LogConfig;

  constructor(config: Partial<LogConfig> = {}) {
    this.config = { ...DEFAULT_LOG_CONFIG, ...config };
    this.currentLevel = this.config.level;
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * 获取当前日志级别
   */
  getLevel(): LogLevel {
    return this.currentLevel;
  }

  /**
   * 检查是否应该记录日志
   */
  shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_WEIGHTS[level] <= LOG_LEVEL_WEIGHTS[this.currentLevel];
  }

  /**
   * 格式化日志消息
   */
  formatLog(metadata: LogMetadata): string {
    const logData = this.sanitizeMetadata(metadata);

    if (this.config.format === 'json') {
      return JSON.stringify(logData);
    }

    // 文本格式
    const parts: string[] = [];

    if (this.config.timestamp && logData.timestamp) {
      parts.push(`[${logData.timestamp}]`);
    }

    parts.push(`[${logData.level.toUpperCase()}]`);

    if (logData.context) {
      parts.push(`[${logData.context}]`);
    }

    if (logData.requestId) {
      parts.push(`[req:${logData.requestId}]`);
    }

    parts.push(logData.message);

    // 添加额外信息
    const extraInfo: string[] = [];
    if (logData.userId) extraInfo.push(`user:${logData.userId}`);
    if (logData.ip) extraInfo.push(`ip:${logData.ip}`);
    if (logData.method && logData.path) extraInfo.push(`${logData.method} ${logData.path}`);
    if (logData.statusCode) extraInfo.push(`status:${logData.statusCode}`);
    if (logData.duration) extraInfo.push(`duration:${logData.duration}ms`);

    if (extraInfo.length > 0) {
      parts.push(`(${extraInfo.join(', ')})`);
    }

    return parts.join(' ');
  }

  /**
   * 脱敏处理
   */
  private sanitizeMetadata(metadata: LogMetadata): LogMetadata {
    const sanitized = { ...metadata };

    for (const field of this.config.sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    }

    return sanitized;
  }

  /**
   * 获取配置
   */
  getConfig(): LogConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<LogConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

/**
 * 全局日志管理器实例
 */
export const logLevelManager = new LogLevelManager();

/**
 * 结构化日志记录器
 */
export class StructuredLogger {
  constructor(private context?: string) {}

  /**
   * 记录错误日志
   */
  error(message: string, meta?: any): void {
    this.log(LogLevel.ERROR, message, meta);
  }

  /**
   * 记录警告日志
   */
  warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, message, meta);
  }

  /**
   * 记录信息日志
   */
  info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, message, meta);
  }

  /**
   * 记录HTTP请求日志
   */
  http(message: string, meta?: any): void {
    this.log(LogLevel.HTTP, message, meta);
  }

  /**
   * 记录调试日志
   */
  debug(message: string, meta?: any): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  /**
   * 记录追踪日志
   */
  trace(message: string, meta?: any): void {
    this.log(LogLevel.TRACE, message, meta);
  }

  /**
   * 核心日志记录方法
   */
  private log(level: LogLevel, message: string, meta?: any): void {
    if (!logLevelManager.shouldLog(level)) {
      return;
    }

    const metadata: LogMetadata = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      ...meta
    };

    const formatted = logLevelManager.formatLog(metadata);

    // 根据级别选择合适的输出方法
    switch (level) {
      case LogLevel.ERROR:
        console.error(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.INFO:
      case LogLevel.HTTP:
        console.info(formatted);
        break;
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        console.debug(formatted);
        break;
    }
  }

  /**
   * 创建子日志记录器
   */
  child(childContext: string): StructuredLogger {
    const fullContext = this.context ? `${this.context}:${childContext}` : childContext;
    return new StructuredLogger(fullContext);
  }
}

/**
 * 创建日志记录器
 */
export function createLogger(context?: string): StructuredLogger {
  return new StructuredLogger(context);
}

/**
 * 请求日志中间件
 */
export function requestLoggingMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestId = (req as any).id || 'unknown';

    // 记录请求开始
    const logger = createLogger('http');
    logger.http('Incoming request', {
      requestId,
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    // 监听响应完成
    res.on('finish', () => {
      const duration = Date.now() - startTime;

      logger.http('Request completed', {
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration
      });
    });

    next();
  };
}

/**
 * 错误日志中间件
 */
export function errorLoggingMiddleware() {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    const logger = createLogger('error');
    const requestId = (req as any).id || 'unknown';

    logger.error('Request error', {
      requestId,
      method: req.method,
      path: req.path,
      error: {
        message: err.message,
        stack: logLevelManager.getConfig().includeStackTrace ? err.stack : undefined
      },
      userId: (req as any).user?.id,
      ip: req.ip
    });

    next(err);
  };
}

/**
 * 日志级别动态调整中间件（仅开发环境）
 */
export function dynamicLogLevelMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // 仅在开发环境允许动态调整日志级别
    if (process.env.NODE_ENV !== 'development') {
      return next();
    }

    const levelParam = req.query.log_level as LogLevel;

    if (levelParam && Object.values(LogLevel).includes(levelParam)) {
      logLevelManager.setLevel(levelParam);
      createLogger('system').info(`Log level changed to ${levelParam}`);
    }

    next();
  };
}

/**
 * 日志轮转工具
 */
export class LogRotationUtil {
  private currentSize: number = 0;

  constructor(private config: LogConfig) {}

  /**
   * 检查是否需要轮转
   */
  shouldRotate(): boolean {
    return this.currentSize >= this.config.maxLogSize;
  }

  /**
   * 更新日志大小
   */
  updateSize(logSize: number): void {
    this.currentSize += logSize;

    if (this.shouldRotate()) {
      this.rotate();
    }
  }

  /**
   * 执行日志轮转
   */
  private rotate(): void {
    // 重置当前大小
    this.currentSize = 0;

    // 如果配置了日志文件路径，执行文件轮转
    if (this.config.logFilePath) {
      const fs = require('fs');
      const path = require('path');

      const logFile = this.config.logFilePath;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = logFile.replace(/\.log$/, `.${timestamp}.log`);

      try {
        // 重命名当前日志文件
        if (fs.existsSync(logFile)) {
          fs.renameSync(logFile, backupFile);

          // 清理旧的备份文件（保留最近10个）
          this.cleanOldBackups(path.dirname(logFile), path.basename(logFile, '.log'));
        }
      } catch (error) {
        console.error('日志轮转失败:', error);
      }
    }
  }

  /**
   * 清理旧的备份文件
   */
  private cleanOldBackups(dir: string, baseName: string, keepCount: number = 10): void {
    const fs = require('fs');
    const path = require('path');

    try {
      const files = fs.readdirSync(dir)
        .filter(file => file.startsWith(baseName + '.'))
        .map(file => ({
          name: file,
          path: path.join(dir, file),
          time: fs.statSync(path.join(dir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

      // 删除超出保留数量的旧文件
      if (files.length > keepCount) {
        files.slice(keepCount).forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
    } catch (error) {
      console.error('清理旧备份文件失败:', error);
    }
  }
}

/**
 * 日志查询工具
 */
export class LogQueryUtil {
  /**
   * 按级别过滤日志
   */
  static filterByLevel(logs: LogMetadata[], level: LogLevel): LogMetadata[] {
    return logs.filter(log => log.level === level);
  }

  /**
   * 按时间范围过滤日志
   */
  static filterByTimeRange(logs: LogMetadata[], start: Date, end: Date): LogMetadata[] {
    return logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= start && logTime <= end;
    });
  }

  /**
   * 按请求ID过滤日志
   */
  static filterByRequestId(logs: LogMetadata[], requestId: string): LogMetadata[] {
    return logs.filter(log => log.requestId === requestId);
  }

  /**
   * 按用户ID过滤日志
   */
  static filterByUserId(logs: LogMetadata[], userId: number): LogMetadata[] {
    return logs.filter(log => log.userId === userId);
  }

  /**
   * 统计各级别日志数量
   */
  static statisticsByLevel(logs: LogMetadata[]): Record<LogLevel, number> {
    const stats: Record<string, number> = {};

    Object.values(LogLevel).forEach(level => {
      stats[level] = 0;
    });

    logs.forEach(log => {
      stats[log.level]++;
    });

    return stats as Record<LogLevel, number>;
  }
}

/**
 * 导出配置
 */
export default {
  LogLevel,
  DEFAULT_LOG_CONFIG,
  LogLevelManager,
  logLevelManager,
  StructuredLogger,
  createLogger,
  requestLoggingMiddleware,
  errorLoggingMiddleware,
  dynamicLogLevelMiddleware,
  LogRotationUtil,
  LogQueryUtil
};
