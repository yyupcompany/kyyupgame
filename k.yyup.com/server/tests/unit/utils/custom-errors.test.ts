/**
 * 自定义错误类测试
 */
import {
  BusinessError,
  ResourceExistsError,
  ResourceNotFoundError,
  ValidationError,
  PermissionError,
  SystemError
} from '../../../src/utils/custom-errors';
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

describe('Custom Errors', () => {
  describe('BusinessError', () => {
    it('应该创建基础业务错误', () => {
      const message = '业务逻辑错误';
      const error = new BusinessError(message);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BusinessError);
      expect(error.name).toBe('BusinessError');
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('BUSINESS_ERROR');
    });

    it('应该支持自定义状态码', () => {
      const error = new BusinessError('错误', 422);

      expect(error.statusCode).toBe(422);
      expect(error.errorCode).toBe('BUSINESS_ERROR');
    });

    it('应该支持自定义错误代码', () => {
      const error = new BusinessError('错误', 400, 'CUSTOM_ERROR');

      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('CUSTOM_ERROR');
    });

    it('应该支持完全自定义参数', () => {
      const message = '自定义错误';
      const statusCode = 418;
      const errorCode = 'TEAPOT_ERROR';
      const error = new BusinessError(message, statusCode, errorCode);

      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
      expect(error.errorCode).toBe(errorCode);
      expect(error.name).toBe('BusinessError');
    });

    it('应该有正确的错误堆栈', () => {
      const error = new BusinessError('测试错误');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('BusinessError');
    });
  });

  describe('ResourceExistsError', () => {
    it('应该创建资源已存在错误', () => {
      const message = '用户已存在';
      const error = new ResourceExistsError(message);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BusinessError);
      expect(error).toBeInstanceOf(ResourceExistsError);
      expect(error.name).toBe('ResourceExistsError');
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(409);
      expect(error.errorCode).toBe('RESOURCE_EXISTS');
    });

    it('应该继承BusinessError的属性', () => {
      const error = new ResourceExistsError('资源冲突');

      expect(error.statusCode).toBe(409);
      expect(error.errorCode).toBe('RESOURCE_EXISTS');
      expect(error.stack).toBeDefined();
    });
  });

  describe('ResourceNotFoundError', () => {
    it('应该创建资源不存在错误', () => {
      const message = '用户不存在';
      const error = new ResourceNotFoundError(message);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BusinessError);
      expect(error).toBeInstanceOf(ResourceNotFoundError);
      expect(error.name).toBe('ResourceNotFoundError');
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe('RESOURCE_NOT_FOUND');
    });

    it('应该继承BusinessError的属性', () => {
      const error = new ResourceNotFoundError('找不到资源');

      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe('RESOURCE_NOT_FOUND');
      expect(error.stack).toBeDefined();
    });
  });

  describe('ValidationError', () => {
    it('应该创建验证错误', () => {
      const message = '参数验证失败';
      const error = new ValidationError(message);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BusinessError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
    });

    it('应该继承BusinessError的属性', () => {
      const error = new ValidationError('输入无效');

      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.stack).toBeDefined();
    });
  });

  describe('PermissionError', () => {
    it('应该创建权限错误', () => {
      const message = '权限不足';
      const error = new PermissionError(message);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BusinessError);
      expect(error).toBeInstanceOf(PermissionError);
      expect(error.name).toBe('PermissionError');
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe('PERMISSION_DENIED');
    });

    it('应该继承BusinessError的属性', () => {
      const error = new PermissionError('访问被拒绝');

      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe('PERMISSION_DENIED');
      expect(error.stack).toBeDefined();
    });
  });

  describe('SystemError', () => {
    it('应该创建系统错误', () => {
      const message = '数据库连接失败';
      const error = new SystemError(message);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(SystemError);
      expect(error.name).toBe('SystemError');
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('SYSTEM_ERROR');
    });

    it('应该支持原始错误', () => {
      const originalError = new Error('原始错误');
      const systemError = new SystemError('系统错误', originalError);

      expect(systemError.message).toBe('系统错误');
      expect(systemError.stack).toBe(originalError.stack);
    });

    it('应该在没有原始错误时有自己的堆栈', () => {
      const error = new SystemError('系统错误');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('SystemError');
    });

    it('应该不继承BusinessError', () => {
      const error = new SystemError('系统错误');

      expect(error).not.toBeInstanceOf(BusinessError);
      expect(error).toBeInstanceOf(SystemError);
    });
  });

  describe('错误类型检查', () => {
    it('应该能够区分不同的错误类型', () => {
      const businessError = new BusinessError('业务错误');
      const resourceError = new ResourceNotFoundError('资源错误');
      const systemError = new SystemError('系统错误');

      expect(businessError instanceof BusinessError).toBe(true);
      expect(businessError instanceof SystemError).toBe(false);

      expect(resourceError instanceof BusinessError).toBe(true);
      expect(resourceError instanceof ResourceNotFoundError).toBe(true);
      expect(resourceError instanceof SystemError).toBe(false);

      expect(systemError instanceof SystemError).toBe(true);
      expect(systemError instanceof BusinessError).toBe(false);
    });

    it('应该能够通过name属性识别错误类型', () => {
      const errors = [
        new BusinessError('业务错误'),
        new ResourceExistsError('资源存在'),
        new ResourceNotFoundError('资源不存在'),
        new ValidationError('验证错误'),
        new PermissionError('权限错误'),
        new SystemError('系统错误')
      ];

      const expectedNames = [
        'BusinessError',
        'ResourceExistsError',
        'ResourceNotFoundError',
        'ValidationError',
        'PermissionError',
        'SystemError'
      ];

      errors.forEach((error, index) => {
        expect(error.name).toBe(expectedNames[index]);
      });
    });

    it('应该能够通过errorCode属性识别错误类型', () => {
      const errors = [
        new BusinessError('业务错误'),
        new ResourceExistsError('资源存在'),
        new ResourceNotFoundError('资源不存在'),
        new ValidationError('验证错误'),
        new PermissionError('权限错误'),
        new SystemError('系统错误')
      ];

      const expectedCodes = [
        'BUSINESS_ERROR',
        'RESOURCE_EXISTS',
        'RESOURCE_NOT_FOUND',
        'VALIDATION_ERROR',
        'PERMISSION_DENIED',
        'SYSTEM_ERROR'
      ];

      errors.forEach((error, index) => {
        if (error instanceof BusinessError || error instanceof SystemError) {
          expect(error.errorCode).toBe(expectedCodes[index]);
        }
      });
    });
  });

  describe('错误序列化', () => {
    it('应该能够序列化错误对象', () => {
      const error = new ValidationError('验证失败');
      const serialized = JSON.stringify(error, Object.getOwnPropertyNames(error));
      const parsed = JSON.parse(serialized);

      expect(parsed.name).toBe('ValidationError');
      expect(parsed.message).toBe('验证失败');
      expect(parsed.statusCode).toBe(400);
      expect(parsed.errorCode).toBe('VALIDATION_ERROR');
    });

    it('应该能够序列化带有原始错误的SystemError', () => {
      const originalError = new Error('原始错误');
      const systemError = new SystemError('系统错误', originalError);
      const serialized = JSON.stringify(systemError, Object.getOwnPropertyNames(systemError));
      const parsed = JSON.parse(serialized);

      expect(parsed.name).toBe('SystemError');
      expect(parsed.message).toBe('系统错误');
      expect(parsed.statusCode).toBe(500);
      expect(parsed.errorCode).toBe('SYSTEM_ERROR');
      expect(parsed.stack).toBe(originalError.stack);
    });
  });
});
