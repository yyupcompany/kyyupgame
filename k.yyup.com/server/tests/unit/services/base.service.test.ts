/**
 * BaseService 单元测试
 * 测试服务层基类的功能
 */

import { BaseService } from '../../../src/services/base.service';
import { vi } from 'vitest'


// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe('BaseService', () => {
  let service: BaseService;

  beforeEach(() => {
    service = new BaseService();
  });

  describe('constructor', () => {
    it('should initialize with console logger', () => {
      expect(service['logger']).toBe(console);
    });

    it('should be instantiable', () => {
      expect(service).toBeInstanceOf(BaseService);
    });
  });

  describe('logger property', () => {
    it('should have logger property accessible', () => {
      expect(service['logger']).toBeDefined();
      expect(typeof service['logger'].log).toBe('function');
      expect(typeof service['logger'].error).toBe('function');
      expect(typeof service['logger'].warn).toBe('function');
      expect(typeof service['logger'].info).toBe('function');
    });

    it('should use console as default logger', () => {
      expect(service['logger']).toBe(console);
    });
  });

  describe('inheritance', () => {
    class TestService extends BaseService {
      public testMethod() {
        return 'test';
      }

      public getLogger() {
        return this.logger;
      }
    }

    it('should be extendable', () => {
      const testService = new TestService();
      expect(testService).toBeInstanceOf(BaseService);
      expect(testService).toBeInstanceOf(TestService);
    });

    it('should inherit logger in child classes', () => {
      const testService = new TestService();
      expect(testService.getLogger()).toBe(console);
    });

    it('should allow child classes to add their own methods', () => {
      const testService = new TestService();
      expect(testService.testMethod()).toBe('test');
    });
  });

  describe('multiple instances', () => {
    it('should create independent instances', () => {
      const service1 = new BaseService();
      const service2 = new BaseService();

      expect(service1).not.toBe(service2);
      expect(service1['logger']).toBe(service2['logger']); // Same console reference
    });
  });
});
