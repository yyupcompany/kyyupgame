/**
 * 调试日志工具
 *
 * 生产环境自动禁用，开发环境可配置
 * 替代直接使用 console.log，避免生产环境日志泄露
 */

import env from '../env';

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * 日志配置
 */
interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  enableTimestamp: boolean;
  enableStackTrace: boolean;
  logToServer: boolean;
  maxLogLength: number;
}

/**
 * 默认配置
 */
const defaultConfig: LoggerConfig = {
  enabled: env.enableDebug || env.isDevelopment,
  level: LogLevel.DEBUG,
  enableTimestamp: true,
  enableStackTrace: false,
  logToServer: false,
  maxLogLength: 1000
};

/**
 * 日志颜色（开发环境）
 */
const logColors = {
  [LogLevel.DEBUG]: '#999',
  [LogLevel.INFO]: '#2196F3',
  [LogLevel.WARN]: '#FF9800',
  [LogLevel.ERROR]: '#F44336'
};

/**
 * 截断长字符串
 */
function truncate(str: string | unknown, maxLength: number): string {
  if (typeof str !== 'string') {
    str = JSON.stringify(str);
  }
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + '...';
  }
  return str;
}

/**
 * 格式化日志前缀
 */
function formatPrefix(level: LogLevel): string {
  if (!defaultConfig.enableTimestamp) {
    return `[${level}]`;
  }
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}]`;
}

/**
 * 安全的日志函数（防止循环引用）
 */
function safeStringify(obj: unknown): string {
  try {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    });
  } catch {
    return '[Unstringifiable]';
  }
}

/**
 * 条件日志类
 */
class DebugLogger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 是否启用日志
   */
  isEnabled(level: LogLevel = LogLevel.DEBUG): boolean {
    if (!this.config.enabled) {
      return false;
    }
    // 可以添加日志级别过滤逻辑
    return true;
  }

  /**
   * 调试日志
   */
  debug(...args: unknown[]): void {
    if (this.isEnabled(LogLevel.DEBUG)) {
      const message = args.map(arg => truncate(arg, this.config.maxLogLength));
      if (env.isDevelopment) {
        console.debug(
          `%c${formatPrefix(LogLevel.DEBUG)}`,
          `color: ${logColors[LogLevel.DEBUG]}`,
          ...message
        );
      } else {
        console.debug(...message);
      }
    }
  }

  /**
   * 信息日志
   */
  info(...args: unknown[]): void {
    if (this.isEnabled(LogLevel.INFO)) {
      const message = args.map(arg => truncate(arg, this.config.maxLogLength));
      if (env.isDevelopment) {
        console.info(
          `%c${formatPrefix(LogLevel.INFO)}`,
          `color: ${logColors[LogLevel.INFO]}`,
          ...message
        );
      } else {
        console.info(...message);
      }
    }
  }

  /**
   * 警告日志
   */
  warn(...args: unknown[]): void {
    if (this.isEnabled(LogLevel.WARN)) {
      const message = args.map(arg => truncate(arg, this.config.maxLogLength));
      if (env.isDevelopment) {
        console.warn(
          `%c${formatPrefix(LogLevel.WARN)}`,
          `color: ${logColors[LogLevel.WARN]}`,
          ...message
        );
      } else {
        console.warn(...message);
      }
    }
  }

  /**
   * 错误日志
   */
  error(...args: unknown[]): void {
    if (this.isEnabled(LogLevel.ERROR)) {
      if (this.config.enableStackTrace) {
        const message = args.map(arg => safeStringify(arg));
        console.error(formatPrefix(LogLevel.ERROR), ...message);
      } else {
        console.error(formatPrefix(LogLevel.ERROR), ...args);
      }
    }
  }

  /**
   * 分组日志
   */
  group(label: string): void {
    if (this.isEnabled()) {
      console.group(label);
    }
  }

  /**
   * 分组结束
   */
  groupEnd(): void {
    if (this.isEnabled()) {
      console.groupEnd();
    }
  }

  /**
   * 表格日志
   */
  table(data: unknown[]): void {
    if (this.isEnabled()) {
      console.table(data);
    }
  }

  /**
   * 时间戳开始
   */
  time(label: string): void {
    if (this.isEnabled()) {
      console.time(label);
    }
  }

  /**
   * 时间戳结束
   */
  timeEnd(label: string): void {
    if (this.isEnabled()) {
      console.timeEnd(label);
    }
  }

  /**
   * 追踪日志
   */
  trace(...args: unknown[]): void {
    if (this.isEnabled() && this.config.enableStackTrace) {
      console.trace(...args);
    }
  }
}

/**
 * 创建默认日志实例
 */
export const logger = new DebugLogger();

/**
 * 创建命名空间日志
 */
export function createNamespacedLogger(namespace: string): DebugLogger {
  return new DebugLogger({
    enabled: logger['config'].enabled
  }) as any;
}

/**
 * 导出便捷方法
 */
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export const group = logger.group.bind(logger);
export const groupEnd = logger.groupEnd.bind(logger);
export const table = logger.table.bind(logger);
export const time = logger.time.bind(logger);
export const timeEnd = logger.timeEnd.bind(logger);

/**
 * 导出日志级别枚举
 */
export { LogLevel };

/**
 * 导出默认
 */
export default logger;
