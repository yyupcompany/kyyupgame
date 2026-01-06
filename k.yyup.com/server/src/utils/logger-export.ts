/**
 * 统一日志导出模块
 * 为了向后兼容，同时导出新的CallingLogger和传统的logger
 */

import { CallingLogger, LogContext } from './CallingLogger';
import logger from './logger';

// 导出CallingLogger作为主要的日志系统
export { CallingLogger, LogContext };

// 导出传统logger以保持向后兼容
export { logger };

// 创建默认导出 - 使用CallingLogger作为主要日志系统
const defaultLogger = {
  // CallingLogger方法
  logInfo: CallingLogger.logInfo.bind(CallingLogger),
  logSuccess: CallingLogger.logSuccess.bind(CallingLogger),
  logWarn: CallingLogger.logWarn.bind(CallingLogger),
  logError: CallingLogger.logError.bind(CallingLogger),
  logDebug: CallingLogger.logDebug.bind(CallingLogger),
  logSystem: CallingLogger.logSystem.bind(CallingLogger),

  // 业务专用方法
  logCallStart: CallingLogger.logCallStart.bind(CallingLogger),
  logAuth: CallingLogger.logAuth.bind(CallingLogger),
  logVos: CallingLogger.logVos.bind(CallingLogger),
  logDoubao: CallingLogger.logDoubao.bind(CallingLogger),
  logAudio: CallingLogger.logAudio.bind(CallingLogger),
  logValidation: CallingLogger.logValidation.bind(CallingLogger),
  logAIQuery: CallingLogger.logAIQuery.bind(CallingLogger),
  logAIModel: CallingLogger.logAIModel.bind(CallingLogger),
  logAIResponse: CallingLogger.logAIResponse.bind(CallingLogger),
  logAIError: CallingLogger.logAIError.bind(CallingLogger),
  logApiCall: CallingLogger.logApiCall.bind(CallingLogger),

  // 上下文创建方法
  createRequestContext: CallingLogger.createRequestContext.bind(CallingLogger),
  createMiddlewareContext: CallingLogger.createMiddlewareContext.bind(CallingLogger),
  createServiceContext: CallingLogger.createServiceContext.bind(CallingLogger),
  createControllerContext: CallingLogger.createControllerContext.bind(CallingLogger),
  createRouteContext: CallingLogger.createRouteContext.bind(CallingLogger),

  // 传统logger方法（向后兼容）
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  debug: logger.debug.bind(logger),
  api: logger.api.bind(logger),
  getErrorLogFilePath: logger.getErrorLogFilePath.bind(logger),
  getAccessLogFilePath: logger.getAccessLogFilePath.bind(logger)
};

// 为了向后兼容，也导出一个简单的logger变量
export const loggerCompat = defaultLogger;

export default defaultLogger;