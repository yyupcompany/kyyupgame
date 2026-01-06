/**
 * 基础错误检测工具
 * 为测试文件提供简单的控制台错误检测
 */

import { vi } from 'vitest'

/**
 * 创建控制台错误监听器
 */
export function createConsoleErrorMonitor() {
  let consoleSpy: any

  const start = () => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  }

  const stop = () => {
    if (consoleSpy) {
      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    }
  }

  return { start, stop }
}

/**
 * 控制台错误检测助手
 */
export class ConsoleErrorDetector {
  private spies: Map<string, any> = new Map()

  /**
   * 开始监听控制台方法
   */
  start() {
    const methods = ['error', 'warn', 'log']

    methods.forEach(method => {
      if (console[method as keyof Console]) {
        const spy = vi.spyOn(console, method as keyof Console).mockImplementation(() => {})
        this.spies.set(method, spy)
      }
    })
  }

  /**
   * 停止监听并验证
   */
  stop() {
    this.spies.forEach((spy, method) => {
      if (method === 'error') {
        expect(spy).not.toHaveBeenCalled()
      }
      spy.mockRestore()
    })
    this.spies.clear()
  }

  /**
   * 验证没有控制台错误
   */
  expectNoErrors() {
    const errorSpy = this.spies.get('error')
    if (errorSpy) {
      expect(errorSpy).not.toHaveBeenCalled()
    }
  }

  /**
   * 验证特定方法的调用次数
   */
  expectCallCount(method: string, expectedCount: number) {
    const spy = this.spies.get(method)
    if (spy) {
      expect(spy).toHaveBeenCalledTimes(expectedCount)
    }
  }
}

/**
 * 便捷函数：创建简单的错误检测测试
 */
export function withErrorDetection(testFn: () => void) {
  const detector = new ConsoleErrorDetector()

  beforeAll(() => {
    detector.start()
  })

  afterAll(() => {
    detector.stop()
  })

  return testFn()
}

export default {
  createConsoleErrorMonitor,
  ConsoleErrorDetector,
  withErrorDetection
}
