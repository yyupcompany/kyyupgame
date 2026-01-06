/**
 * 统一错误处理服务
 * 负责错误分类、处理、恢复和日志记录
 */

import { logger } from '../../../utils/logger';

export enum ErrorCategory {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  INTERNAL = 'INTERNAL',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ErrorInfo {
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  originalError: Error;
  timestamp: number;
  serviceName?: string;
  operation?: string;
  retryable: boolean;
  recoveryStrategy?: string;
  metadata?: Record<string, any>;
}

export interface ErrorStats {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  recentErrors: ErrorInfo[];
}

/**
 * 统一错误处理服务类
 */
export class UnifiedErrorHandlerService {
  private static instance: UnifiedErrorHandlerService;
  private errors: ErrorInfo[] = [];
  private readonly MAX_ERRORS = 1000;
  private readonly ERROR_RETENTION_TIME = 60 * 60 * 1000; // 1小时

  private constructor() {
    logger.info('✅ [错误处理] 统一错误处理服务初始化完成');
    
    // 定期清理过期错误
    setInterval(() => {
      this.cleanupOldErrors();
    }, 5 * 60 * 1000);
  }

  /**
   * 获取单例实例
   */
  static getInstance(): UnifiedErrorHandlerService {
    if (!UnifiedErrorHandlerService.instance) {
      UnifiedErrorHandlerService.instance = new UnifiedErrorHandlerService();
    }
    return UnifiedErrorHandlerService.instance;
  }

  /**
   * 处理错误
   */
  handleError(
    error: Error,
    serviceName?: string,
    operation?: string,
    metadata?: Record<string, any>
  ): ErrorInfo {
    const errorInfo = this.classifyError(error, serviceName, operation, metadata);
    
    // 记录错误
    this.recordError(errorInfo);
    
    // 根据严重程度记录日志
    this.logError(errorInfo);
    
    // 尝试恢复
    if (errorInfo.retryable) {
      logger.info(`🔄 [错误处理] 错误可重试: ${errorInfo.category}`);
    }
    
    return errorInfo;
  }

  /**
   * 分类错误
   */
  private classifyError(
    error: Error,
    serviceName?: string,
    operation?: string,
    metadata?: Record<string, any>
  ): ErrorInfo {
    let category = ErrorCategory.UNKNOWN;
    let severity = ErrorSeverity.MEDIUM;
    let retryable = false;
    let recoveryStrategy: string | undefined;

    const message = error.message.toLowerCase();

    // 网络错误
    if (message.includes('network') || message.includes('econnrefused') || message.includes('enotfound')) {
      category = ErrorCategory.NETWORK;
      severity = ErrorSeverity.HIGH;
      retryable = true;
      recoveryStrategy = 'retry_with_backoff';
    }
    // 超时错误
    else if (message.includes('timeout') || message.includes('timed out')) {
      category = ErrorCategory.TIMEOUT;
      severity = ErrorSeverity.MEDIUM;
      retryable = true;
      recoveryStrategy = 'retry_with_increased_timeout';
    }
    // 验证错误
    else if (message.includes('validation') || message.includes('invalid')) {
      category = ErrorCategory.VALIDATION;
      severity = ErrorSeverity.LOW;
      retryable = false;
      recoveryStrategy = 'fix_input';
    }
    // 权限错误
    else if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
      category = ErrorCategory.PERMISSION;
      severity = ErrorSeverity.MEDIUM;
      retryable = false;
      recoveryStrategy = 'check_permissions';
    }
    // 未找到错误
    else if (message.includes('not found') || message.includes('404')) {
      category = ErrorCategory.NOT_FOUND;
      severity = ErrorSeverity.LOW;
      retryable = false;
      recoveryStrategy = 'verify_resource';
    }
    // 限流错误
    else if (message.includes('rate limit') || message.includes('too many requests')) {
      category = ErrorCategory.RATE_LIMIT;
      severity = ErrorSeverity.MEDIUM;
      retryable = true;
      recoveryStrategy = 'wait_and_retry';
    }
    // 服务不可用
    else if (message.includes('unavailable') || message.includes('503')) {
      category = ErrorCategory.SERVICE_UNAVAILABLE;
      severity = ErrorSeverity.HIGH;
      retryable = true;
      recoveryStrategy = 'use_fallback';
    }
    // 内部错误
    else if (message.includes('internal') || message.includes('500')) {
      category = ErrorCategory.INTERNAL;
      severity = ErrorSeverity.CRITICAL;
      retryable = false;
      recoveryStrategy = 'report_to_admin';
    }

    return {
      category,
      severity,
      message: error.message,
      originalError: error,
      timestamp: Date.now(),
      serviceName,
      operation,
      retryable,
      recoveryStrategy,
      metadata
    };
  }

  /**
   * 记录错误
   */
  private recordError(errorInfo: ErrorInfo): void {
    this.errors.push(errorInfo);

    if (this.errors.length > this.MAX_ERRORS) {
      this.errors.shift();
    }
  }

  /**
   * 记录日志
   */
  private logError(errorInfo: ErrorInfo): void {
    const logMessage = `[${errorInfo.category}] ${errorInfo.serviceName || 'Unknown'}.${errorInfo.operation || 'Unknown'}: ${errorInfo.message}`;

    switch (errorInfo.severity) {
      case ErrorSeverity.LOW:
        logger.info(`ℹ️ ${logMessage}`);
        break;
      case ErrorSeverity.MEDIUM:
        logger.warn(`⚠️ ${logMessage}`);
        break;
      case ErrorSeverity.HIGH:
        logger.error(`❌ ${logMessage}`);
        break;
      case ErrorSeverity.CRITICAL:
        logger.error(`🚨 ${logMessage}`);
        break;
    }
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): ErrorStats {
    const errorsByCategory: Record<ErrorCategory, number> = {
      [ErrorCategory.NETWORK]: 0,
      [ErrorCategory.TIMEOUT]: 0,
      [ErrorCategory.VALIDATION]: 0,
      [ErrorCategory.PERMISSION]: 0,
      [ErrorCategory.NOT_FOUND]: 0,
      [ErrorCategory.RATE_LIMIT]: 0,
      [ErrorCategory.SERVICE_UNAVAILABLE]: 0,
      [ErrorCategory.INTERNAL]: 0,
      [ErrorCategory.UNKNOWN]: 0
    };

    const errorsBySeverity: Record<ErrorSeverity, number> = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0
    };

    this.errors.forEach(error => {
      errorsByCategory[error.category]++;
      errorsBySeverity[error.severity]++;
    });

    return {
      totalErrors: this.errors.length,
      errorsByCategory,
      errorsBySeverity,
      recentErrors: this.errors.slice(-10)
    };
  }

  /**
   * 获取可重试错误
   */
  getRetryableErrors(limit: number = 10): ErrorInfo[] {
    return this.errors
      .filter(e => e.retryable)
      .slice(-limit);
  }

  /**
   * 获取严重错误
   */
  getCriticalErrors(limit: number = 10): ErrorInfo[] {
    return this.errors
      .filter(e => e.severity === ErrorSeverity.CRITICAL || e.severity === ErrorSeverity.HIGH)
      .slice(-limit);
  }

  /**
   * 清理过期错误
   */
  private cleanupOldErrors(): void {
    const cutoffTime = Date.now() - this.ERROR_RETENTION_TIME;
    const beforeCount = this.errors.length;
    
    this.errors = this.errors.filter(e => e.timestamp >= cutoffTime);
    
    const cleaned = beforeCount - this.errors.length;
    if (cleaned > 0) {
      logger.info(`🧹 [错误处理] 清理了 ${cleaned} 条过期错误`);
    }
  }

  /**
   * 清空所有错误
   */
  clearAllErrors(): void {
    const count = this.errors.length;
    this.errors = [];
    logger.info(`🧹 [错误处理] 清空所有错误: ${count} 条`);
  }

  /**
   * 生成错误报告
   */
  generateErrorReport(): string {
    const stats = this.getErrorStats();
    
    let report = '# 错误处理报告\n\n';
    report += `生成时间: ${new Date().toISOString()}\n`;
    report += `总错误数: ${stats.totalErrors}\n\n`;

    report += '## 按类别统计\n\n';
    Object.entries(stats.errorsByCategory).forEach(([category, count]) => {
      if (count > 0) {
        report += `- ${category}: ${count}\n`;
      }
    });

    report += '\n## 按严重程度统计\n\n';
    Object.entries(stats.errorsBySeverity).forEach(([severity, count]) => {
      if (count > 0) {
        report += `- ${severity}: ${count}\n`;
      }
    });

    const criticalErrors = this.getCriticalErrors(5);
    if (criticalErrors.length > 0) {
      report += '\n## 严重错误 (最近5条)\n\n';
      criticalErrors.forEach((error, index) => {
        report += `${index + 1}. [${error.severity}] ${error.serviceName}.${error.operation}\n`;
        report += `   消息: ${error.message}\n`;
        report += `   恢复策略: ${error.recoveryStrategy || 'N/A'}\n\n`;
      });
    }

    return report;
  }

  /**
   * 智能重试
   */
  async smartRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
      serviceName?: string;
      operationName?: string;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      serviceName,
      operationName
    } = options;

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        const errorInfo = this.handleError(lastError, serviceName, operationName);
        
        if (!errorInfo.retryable || attempt === maxRetries) {
          throw error;
        }
        
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        logger.info(`🔄 [错误处理] 重试 ${attempt + 1}/${maxRetries}，等待 ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
}

// 导出单例
export const unifiedErrorHandler = UnifiedErrorHandlerService.getInstance();

