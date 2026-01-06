/**
 * 控制台错误监控
 * 用于测试过程中检测控制台错误、警告等
 */

import { vi } from 'vitest';

export interface ConsoleError {
  type: 'error' | 'warn' | 'log';
  message: string;
  timestamp: number;
  stack?: string;
}

class ConsoleMonitor {
  private errors: ConsoleError[] = [];
  private originalConsole: Partial<typeof console> = {};

  // 允许的警告和消息白名单
  private readonly allowedMessages = [
    // Vue Router 允许的消息
    '[@vue/compiler-sfc] `defineProps` is a compiler macro and no longer needs to be imported',
    '[@vue/compiler-sfc] `defineEmits` is a compiler macro and no longer needs to be imported',
    '[@vue/compiler-sfc] `withDefaults` is a compiler macro and no longer needs to be imported',
    '[Vue Router warn]',
    '[Vue Router Duplicate]',

    // Vue 允许的警告消息
    '[Vue warn]: Invalid prop name: "ref" is a reserved property.',
    '[Vue warn]: App already provides property with key "Symbol(pinia)". It will be overwritten with the new value.',
    '[Vue warn]: Component provided property with key "Symbol(pinia)" but it is already provided.',
    '[Vue warn]: Property "$el" was accessed during render but is not defined on instance.',
    '[Vue warn]:',

    // Vue Test Utils 特定警告
    'Invalid prop name: "ref" is a reserved property.',
    'App already provides property with key "Symbol(pinia)"',

    // Pinia 允许的消息
    '[Pinia warn]',

    // Vite 开发服务器允许的消息
    '[vite:esbuild] warning',

    // Element Plus 允许的消息
    '[Element Plus]',

    // 测试环境允许的消息
    'test mode',
    'vitest',

    // 重复键警告（在测试环境中常见）
    'Duplicate member',
    'Duplicate key',

    // 网络连接错误（在真实网络测试中常见）
    'ECONNREFUSED',
    'connect ECONNREFUSED',
    'Failed to execute "fetch"',

    // DOM异常（测试环境模拟错误时常见）
    'DOMException'
  ];

  constructor() {
    this.originalConsole = {
      error: console.error,
      warn: console.warn,
      log: console.log,
    };
  }

  /**
   * 检查消息是否应该被忽略
   */
  private shouldIgnoreMessage(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return this.allowedMessages.some(allowedMsg =>
      lowerMessage.includes(allowedMsg.toLowerCase())
    );
  }

  /**
   * 开始监控
   */
  startMonitoring(): void {
    console.error = vi.fn((...args: any[]) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');

      // 过滤掉允许的错误消息
      if (!this.shouldIgnoreMessage(message)) {
        this.errors.push({
          type: 'error',
          message,
          timestamp: Date.now(),
          stack: new Error().stack
        });
      }
      this.originalConsole.error?.(...args);
    });

    console.warn = vi.fn((...args: any[]) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');

      // 过滤掉允许的警告消息
      if (!this.shouldIgnoreMessage(message)) {
        this.errors.push({
          type: 'warn',
          message,
          timestamp: Date.now(),
          stack: new Error().stack
        });
      }
      this.originalConsole.warn?.(...args);
    });

    // 对于log，我们只记录但不视为错误
    console.log = vi.fn((...args: any[]) => {
      this.originalConsole.log?.(...args);
    });
  }

  /**
   * 停止监控并恢复原始console
   */
  stopMonitoring(): void {
    Object.assign(console, this.originalConsole);
  }

  /**
   * 清除记录的错误
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * 获取所有错误
   */
  getErrors(): ConsoleError[] {
    return this.errors;
  }

  /**
   * 获取错误消息列表
   */
  getErrorMessages(): string[] {
    return this.errors.map(error => error.message);
  }

  /**
   * 检查是否有错误
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * 检查是否有特定类型的错误
   */
  hasErrorType(type: 'error' | 'warn'): boolean {
    return this.errors.some(error => error.type === type);
  }

  /**
   * 检查是否有包含特定关键词的错误
   */
  hasErrorContaining(keyword: string): boolean {
    return this.errors.some(error => 
      error.message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): {
    total: number;
    errors: number;
    warnings: number;
    logs: number;
  } {
    return {
      total: this.errors.length,
      errors: this.errors.filter(e => e.type === 'error').length,
      warnings: this.errors.filter(e => e.type === 'warn').length,
      logs: 0 // logs are recorded but not stored
    };
  }

  /**
   * 打印错误报告
   */
  printErrorReport(): void {
    const stats = this.getErrorStats();
    
    if (stats.total === 0) {
      console.log('✅ No console errors or warnings detected');
      return;
    }

    console.log('🚨 Console Error Report:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Errors: ${stats.errors}`);
    console.log(`   Warnings: ${stats.warnings}`);

    this.errors.forEach((error, index) => {
      console.log(`\n[${index + 1}] ${error.type.toUpperCase()}: ${error.message}`);
      if (error.stack) {
        console.log(`   Stack: ${error.stack?.split('\n')[1]?.trim()}`);
      }
    });
  }
}

// 全局监控实例
const globalMonitor = new ConsoleMonitor();

/**
 * 期望没有控制台错误
 * @param customMessage 自定义错误消息
 */
export function expectNoConsoleErrors(customMessage?: string): void {
  const errors = globalMonitor.getErrors();
  const errorMessages = globalMonitor.getErrorMessages();

  if (errors.length > 0) {
    const errorMessage = customMessage || 'Console errors detected during test execution';
    const detailedMessage = `${errorMessage}:\n${errorMessages.map((msg, i) => `  ${i + 1}. ${msg}`).join('\n')}`;

    // 打印详细的错误报告
    globalMonitor.printErrorReport();

    throw new Error(detailedMessage);
  }
}

/**
 * 期望没有真正的控制台错误（过滤掉允许的警告）
 * @param customMessage 自定义错误消息
 */
export function expectNoRealConsoleErrors(customMessage?: string): void {
  const errors = globalMonitor.getErrors();
  const realErrors = errors.filter(error =>
    error.type === 'error' && !globalMonitor['shouldIgnoreMessage'](error.message)
  );
  const realErrorMessages = realErrors.map(error => error.message);

  if (realErrors.length > 0) {
    const errorMessage = customMessage || 'Real console errors detected during test execution';
    const detailedMessage = `${errorMessage}:\n${realErrorMessages.map((msg, i) => `  ${i + 1}. ${msg}`).join('\n')}`;

    // 打印详细的错误报告
    console.log('🚨 Real Console Errors (excluding allowed warnings):');
    realErrors.forEach((error, index) => {
      console.log(`\n[${index + 1}] ${error.type.toUpperCase()}: ${error.message}`);
      if (error.stack) {
        console.log(`   Stack: ${error.stack?.split('\n')[1]?.trim()}`);
      }
    });

    throw new Error(detailedMessage);
  }
}

/**
 * 期望有特定类型的控制台错误
 * @param type 错误类型
 * @param keyword 关键词（可选）
 */
export function expectConsoleError(type: 'error' | 'warn', keyword?: string): void {
  const hasError = keyword 
    ? globalMonitor.hasErrorContaining(keyword)
    : globalMonitor.hasErrorType(type);

  if (!hasError) {
    throw new Error(`Expected console ${type}${keyword ? ` containing "${keyword}"` : ''} but none was found`);
  }
}

/**
 * 开始监控（用于测试开始前）
 */
export function startConsoleMonitoring(): void {
  globalMonitor.clearErrors();
  globalMonitor.startMonitoring();
}

/**
 * 停止监控（用于测试结束后）
 */
export function stopConsoleMonitoring(): void {
  globalMonitor.stopMonitoring();
}

/**
 * 获取监控器实例（用于高级用法）
 */
export function getConsoleMonitor(): ConsoleMonitor {
  return globalMonitor;
}

/**
 * Vitest setup helpers
 */
export const consoleMonitoringHelpers = {
  beforeEach: () => {
    startConsoleMonitoring();
  },

  afterEach: () => {
    expectNoRealConsoleErrors();
    stopConsoleMonitoring();
  }
};

// 导出默认的beforeEach和afterEach钩子
export const beforeEach = consoleMonitoringHelpers.beforeEach;
export const afterEach = consoleMonitoringHelpers.afterEach;

/**
 * 严格模式的控制台监控助手（过滤所有警告，包括真正的错误）
 */
export const strictConsoleMonitoringHelpers = {
  beforeEach: () => {
    startConsoleMonitoring();
  },

  afterEach: () => {
    expectNoConsoleErrors();
    stopConsoleMonitoring();
  }
};

/**
 * 宽松模式的控制台监控助手（只检测真正的错误，忽略所有警告）
 */
export const relaxedConsoleMonitoringHelpers = {
  beforeEach: () => {
    startConsoleMonitoring();
  },

  afterEach: () => {
    expectNoRealConsoleErrors();
    stopConsoleMonitoring();
  }
};