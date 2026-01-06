/**
 * 🎯 CallingLogger Backend - 集中控制所有输出逻辑的日志系统
 *
 * 基于架构设计的后端版本，与前端版本保持一致的API和功能
 * 将所有日志输出控制逻辑集中在 CallingLogger 内部，外部代码只需要调用日志方法，
 * 不需要关心具体的输出方式（屏幕/文件/数据库），所有控制通过环境变量实现。
 */

import * as fs from 'fs';
import * as path from 'path';

// 日志级别定义
export type LogLevel = 'DEBUG' | 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'SYSTEM';

// 日志上下文接口
export interface LogContext {
  module?: string;
  operation?: string;
  userId?: number;
  tenantId?: string;
  route?: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  [key: string]: any;
}

// Express Request 接口扩展
export interface AuthenticatedRequest {
  user?: {
    id: number;
    tenantId?: string;
    role?: string;
    [key: string]: any;
  };
  ip?: string;
  get(name: string): string | undefined;
  originalUrl?: string;
  method?: string;
  [key: string]: any;
}

// 🎯 环境变量配置
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
  CALLING_LOG_MAX_FILE_SIZE: parseInt(process.env.CALLING_LOG_MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  CALLING_LOG_MAX_FILES: parseInt(process.env.CALLING_LOG_MAX_FILES) || 5
};

// 日志颜色配置
const LOG_COLORS = {
  DEBUG: '\x1b[36m',    // 青色
  INFO: '\x1b[37m',     // 白色
  SUCCESS: '\x1b[32m',  // 绿色
  WARN: '\x1b[33m',     // 黄色
  ERROR: '\x1b[31m',    // 红色
  SYSTEM: '\x1b[35m',   // 紫色
  RESET: '\x1b[0m'      // 重置
};

// 数据库日志条目接口
interface DatabaseLogEntry {
  timestamp: string;
  level: string;
  fileName: string;
  module: string;
  message: string;
  data?: any;
  context?: LogContext;
  tenantId?: string;
  userId?: number;
  ip?: string;
  userAgent?: string;
  requestId?: string;
}

/**
 * 🎯 后端 CallingLogger - 集中控制所有输出逻辑
 */
export class CallingLogger {

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

    // 3. 文件输出 (根据环境变量控制)
    if (LOG_CONFIG.ENABLE_CALLING_FILE_LOG) {
      this.outputToFile(formattedMessage, level);
    }

    // 4. 数据库输出 (根据环境变量控制)
    if (LOG_CONFIG.ENABLE_CALLING_DB_LOG) {
      this.outputToDatabase(formattedMessage, level, data, context);
    }
  }

  // 🎯 屏幕输出方法
  private static outputToConsole(formattedMessage: string, level: string) {
    try {
      if (LOG_CONFIG.ENABLE_CALLING_LOG_COLORS) {
        const color = LOG_COLORS[level] || LOG_COLORS.RESET;
        const reset = LOG_COLORS.RESET;
        console.log(`${color}${formattedMessage}${reset}`);
      } else {
        console.log(formattedMessage);
      }
    } catch (error) {
      // 静默处理控制台输出错误，避免无限循环
    }
  }

  // 🎯 文件输出方法
  private static outputToFile(formattedMessage: string, level: string) {
    try {
      const logDir = path.join(process.cwd(), LOG_CONFIG.CALLING_LOG_DIR);
      this.ensureLogDir(logDir);

      // 主文件 (all.log)
      const allLogFile = path.join(logDir, 'all.log');
      fs.appendFile(allLogFile, formattedMessage + '\n', (err) => {
        if (err) this.handleFileError(err);
      });

      // 按级别分类文件
      const levelLogFile = path.join(logDir, `${level.toLowerCase()}.log`);
      fs.appendFile(levelLogFile, formattedMessage + '\n', (err) => {
        if (err) this.handleFileError(err);
      });

      // 异步文件轮转
      setImmediate(() => {
        this.rotateLogFile(allLogFile);
        this.rotateLogFile(levelLogFile);
      });

    } catch (error) {
      // 静默处理文件写入错误
    }
  }

  // 🎯 数据库输出方法
  private static outputToDatabase(formattedMessage: string, level: string, data?: any, context?: LogContext) {
    try {
      const logEntry: DatabaseLogEntry = {
        timestamp: this.getFormattedTimestamp(),
        level,
        fileName: this.getCallerFileName(),
        module: this.getModuleMapping(this.getCallerFileName()),
        message: formattedMessage,
        data,
        context,
        tenantId: context?.tenantId,
        userId: context?.userId,
        ip: context?.ip,
        userAgent: context?.userAgent,
        requestId: context?.requestId
      };

      // 这里可以实现数据库写入逻辑
      // 例如：写入到系统日志表或发送到日志服务
      // 为了避免依赖，这里只是预留接口
      this.writeToDatabase(logEntry);

    } catch (error) {
      // 静默处理数据库写入错误
    }
  }

  // 实际的数据库写入方法（需要根据实际数据库配置实现）
  private static async writeToDatabase(logEntry: DatabaseLogEntry) {
    // 预留数据库写入接口
    // 可以在这里实现具体的数据库写入逻辑
    // 例如：await LogModel.create(logEntry);
  }

  // 确保日志目录存在
  private static ensureLogDir(logDir: string): void {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  // 文件轮转
  private static rotateLogFile(filePath: string): void {
    try {
      if (!fs.existsSync(filePath)) return;

      const stats = fs.statSync(filePath);
      if (stats.size > LOG_CONFIG.CALLING_LOG_MAX_FILE_SIZE) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedFile = filePath.replace('.log', `-${timestamp}.log`);
        fs.renameSync(filePath, rotatedFile);

        // 清理旧文件
        this.cleanupOldFiles(path.dirname(filePath), path.basename(filePath, '.log'));
      }
    } catch (error) {
      // 静默处理文件轮转错误
    }
  }

  // 清理旧日志文件
  private static cleanupOldFiles(logDir: string, filePrefix: string): void {
    try {
      const files = fs.readdirSync(logDir)
        .filter(file => file.startsWith(filePrefix) && file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(logDir, file),
          time: fs.statSync(path.join(logDir, file)).mtime
        }))
        .sort((a, b) => b.time.getTime() - a.time.getTime());

      // 保留最新的 N 个文件，删除其余的
      if (files.length > LOG_CONFIG.CALLING_LOG_MAX_FILES) {
        files.slice(LOG_CONFIG.CALLING_LOG_MAX_FILES).forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (error) {
            // 忽略删除错误
          }
        });
      }
    } catch (error) {
      // 忽略清理错误
    }
  }

  // 处理文件错误
  private static handleFileError(error: NodeJS.ErrnoException): void {
    // 静默处理文件写入错误，避免影响主流程
  }

  // 🎯 级别过滤
  private static shouldLog(level: string): boolean {
    const levels = ['DEBUG', 'INFO', 'SUCCESS', 'WARN', 'ERROR', 'SYSTEM'];
    const currentLevel = LOG_CONFIG.CALLING_LOG_LEVEL.toUpperCase();
    const currentLevelIndex = levels.indexOf(currentLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  // 🎯 统一的格式化方法
  private static formatLogEntry(level: string, icon: string, message: string, data?: any): string {
    const timestamp = this.getFormattedTimestamp();
    const fileName = this.getCallerFileName();
    const module = this.getModuleMapping(fileName);
    const dataStr = data ? ` ${JSON.stringify(data, null, 2)}` : '';

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

  // 中间件专用方法
  static createRequestContext(req: AuthenticatedRequest, additionalContext?: any): LogContext {
    const baseContext: LogContext = {
      module: 'MIDDLEWARE',
      operation: `${req.method} ${req.originalUrl}`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.headers['x-request-id'] as string || this.generateRequestId()
    };

    // 添加用户信息
    if (req.user) {
      baseContext.userId = req.user.id;
      baseContext.tenantId = req.user.tenantId;
    }

    // 合并额外上下文
    if (additionalContext) {
      return { ...baseContext, ...additionalContext };
    }

    return baseContext;
  }

  static createMiddlewareContext(middlewareName: string, additionalContext?: any): LogContext {
    const baseContext: LogContext = {
      module: 'MIDDLEWARE',
      operation: middlewareName
    };

    // 合并额外上下文
    if (additionalContext) {
      return { ...baseContext, ...additionalContext };
    }

    return baseContext;
  }

  // 服务专用方法
  static createServiceContext(serviceName: string, operation: string, additionalContext?: any): LogContext {
    const baseContext: LogContext = {
      module: 'SERVICE',
      operation: `${serviceName}.${operation}`
    };

    // 合并额外上下文
    if (additionalContext) {
      return { ...baseContext, ...additionalContext };
    }

    return baseContext;
  }

  // 控制器专用方法
  static createControllerContext(controllerName: string, action: string, additionalContext?: any): LogContext {
    const baseContext: LogContext = {
      module: 'CONTROLLER',
      operation: `${controllerName}.${action}`
    };

    // 合并额外上下文
    if (additionalContext) {
      return { ...baseContext, ...additionalContext };
    }

    return baseContext;
  }

  // 路由专用方法
  static createRouteContext(routePath: string, method: string, additionalContext?: any): LogContext {
    const baseContext: LogContext = {
      module: 'ROUTE',
      operation: `${method} ${routePath}`
    };

    // 合并额外上下文
    if (additionalContext) {
      return { ...baseContext, ...additionalContext };
    }

    return baseContext;
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
   * 生成请求ID
   */
  private static generateRequestId(): string {
    return Math.random().toString(36).substr(2, 9);
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
      'rbac': 'AUTH',

      // 中间件相关
      'middleware': 'MIDDLEWARE',
      'error': 'MIDDLEWARE',

      // 服务相关
      'service': 'SERVICE',
      '-service': 'SERVICE',

      // 控制器相关
      'controller': 'CONTROLLER',
      '-controller': 'CONTROLLER',

      // 路由相关
      'routes': 'ROUTE',
      '-routes': 'ROUTE',

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
      'utils': 'SYSTEM',
      'config': 'SYSTEM',

      // 租户相关
      'tenant': 'TENANT',

      // 数据库相关
      'model': 'DATABASE',
      '-model': 'DATABASE'
    };

    for (const [prefix, module] of Object.entries(moduleMap)) {
      if (fileName.includes(prefix)) {
        return module;
      }
    }

    return 'GENERAL';
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