/**
 * 日志工具
 * 提供统一的日志记录接口，支持控制台和文件日志
 */
import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns';

// 创建日志目录
const LOG_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// 获取当前日期格式化字符串
const getCurrentDate = (): string => format(new Date(), 'yyyy-MM-dd');

// 错误日志文件路径
const ERROR_LOG_FILE = path.join(LOG_DIR, `error-${getCurrentDate()}.log`);
// 访问日志文件路径
const ACCESS_LOG_FILE = path.join(LOG_DIR, `access-${getCurrentDate()}.log`);

/**
 * 将日志写入文件
 * @param filePath 文件路径
 * @param message 日志消息
 */
const writeLog = (filePath: string, message: string): void => {
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  const logEntry = `[${timestamp}] ${message}\n`;
  
  fs.appendFile(filePath, logEntry, (err) => {
    if (err) {
      console.error(`写入日志文件失败: ${err.message}`);
    }
  });
};

// 增强的日志记录器实现
export const logger = {
  /**
   * 记录信息日志
   * @param message 日志消息
   * @param data 附加数据
   */
  info(message: string, data?: any): void {
    const logMessage = `[INFO] ${message}${data ? ' ' + JSON.stringify(data) : ''}`;
    console.log(logMessage);
    writeLog(ACCESS_LOG_FILE, logMessage);
  },

  /**
   * 记录警告日志
   * @param message 日志消息
   * @param data 附加数据
   */
  warn(message: string, data?: any): void {
    const logMessage = `[WARN] ${message}${data ? ' ' + JSON.stringify(data) : ''}`;
    console.warn(logMessage);
    writeLog(ACCESS_LOG_FILE, logMessage);
  },

  /**
   * 记录错误日志
   * @param message 日志消息
   * @param error 错误对象
   */
  error(message: string, error?: any): void {
    let errorDetails = '';
    if (error) {
      if (error instanceof Error) {
        errorDetails = `${error.name}: ${error.message}\nStack: ${error.stack}`;
      } else {
        errorDetails = JSON.stringify(error);
      }
    }
    
    const logMessage = `[ERROR] ${message}${errorDetails ? '\n' + errorDetails : ''}`;
    console.error(logMessage);
    writeLog(ERROR_LOG_FILE, logMessage);
  },

  /**
   * 记录调试日志
   * @param message 日志消息
   * @param data 附加数据
   */
  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      const logMessage = `[DEBUG] ${message}${data ? ' ' + JSON.stringify(data) : ''}`;
      console.debug(logMessage);
      writeLog(ACCESS_LOG_FILE, logMessage);
    }
  },

  /**
   * 记录API请求日志
   * @param req 请求对象
   * @param res 响应对象
   * @param duration 请求处理时间(ms)
   */
  api(req: any, res: any, duration: number): void {
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || 'Unknown';
    const statusCode = res.statusCode;
    
    const logMessage = `[API] ${method} ${originalUrl} - ${statusCode} - ${duration}ms - ${ip} - ${userAgent}`;
    console.log(logMessage);
    writeLog(ACCESS_LOG_FILE, logMessage);
  },
  
  /**
   * 获取当前的错误日志文件路径
   * @returns 错误日志文件路径
   */
  getErrorLogFilePath(): string {
    return ERROR_LOG_FILE;
  },
  
  /**
   * 获取当前的访问日志文件路径
   * @returns 访问日志文件路径
   */
  getAccessLogFilePath(): string {
    return ACCESS_LOG_FILE;
  }
};

export default logger; 