/**
 * API错误类测试
 */
import { ApiError } from '../../../src/utils/apiError';
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

describe('ApiError', () => {
  describe('构造函数', () => {
    it('应该创建基本的ApiError实例', () => {
      const error = new ApiError(400, 'Bad Request');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad Request');
      expect(error.code).toBe('API_ERROR');
      expect(error.name).toBe('ApiError');
    });

    it('应该创建带自定义错误代码的ApiError实例', () => {
      const error = new ApiError(404, 'Resource not found', 'RESOURCE_NOT_FOUND');

      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe('RESOURCE_NOT_FOUND');
      expect(error.name).toBe('ApiError');
    });

    it('应该继承Error的属性', () => {
      const error = new ApiError(500, 'Internal Server Error');

      expect(error.stack).toBeDefined();
      expect(error.toString()).toBe('ApiError: Internal Server Error');
    });
  });

  describe('静态方法', () => {
    describe('badRequest', () => {
      it('应该创建400错误', () => {
        const error = ApiError.badRequest('Invalid input data');

        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Invalid input data');
        expect(error.code).toBe('BAD_REQUEST');
      });

      it('应该创建带自定义代码的400错误', () => {
        const error = ApiError.badRequest('Validation failed', 'VALIDATION_ERROR');

        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Validation failed');
        expect(error.code).toBe('VALIDATION_ERROR');
      });
    });

    describe('unauthorized', () => {
      it('应该创建401错误', () => {
        const error = ApiError.unauthorized('Authentication required');

        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe('Authentication required');
        expect(error.code).toBe('UNAUTHORIZED');
      });

      it('应该创建带自定义代码的401错误', () => {
        const error = ApiError.unauthorized('Token expired', 'TOKEN_EXPIRED');

        expect(error.statusCode).toBe(401);
        expect(error.message).toBe('Token expired');
        expect(error.code).toBe('TOKEN_EXPIRED');
      });
    });

    describe('forbidden', () => {
      it('应该创建403错误', () => {
        const error = ApiError.forbidden('Access denied');

        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(403);
        expect(error.message).toBe('Access denied');
        expect(error.code).toBe('FORBIDDEN');
      });

      it('应该创建带自定义代码的403错误', () => {
        const error = ApiError.forbidden('Insufficient permissions', 'INSUFFICIENT_PERMISSIONS');

        expect(error.statusCode).toBe(403);
        expect(error.message).toBe('Insufficient permissions');
        expect(error.code).toBe('INSUFFICIENT_PERMISSIONS');
      });
    });

    describe('notFound', () => {
      it('应该创建404错误', () => {
        const error = ApiError.notFound('Resource not found');

        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Resource not found');
        expect(error.code).toBe('NOT_FOUND');
      });

      it('应该创建带自定义代码的404错误', () => {
        const error = ApiError.notFound('User not found', 'USER_NOT_FOUND');

        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('User not found');
        expect(error.code).toBe('USER_NOT_FOUND');
      });
    });

    describe('serverError', () => {
      it('应该创建500错误', () => {
        const error = ApiError.serverError('Internal server error');

        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(500);
        expect(error.message).toBe('Internal server error');
        expect(error.code).toBe('SERVER_ERROR');
      });

      it('应该创建带自定义代码的500错误', () => {
        const error = ApiError.serverError('Database connection failed', 'DATABASE_ERROR');

        expect(error.statusCode).toBe(500);
        expect(error.message).toBe('Database connection failed');
        expect(error.code).toBe('DATABASE_ERROR');
      });
    });
  });

  describe('错误处理场景', () => {
    it('应该处理空消息', () => {
      const error = new ApiError(400, '');

      expect(error.message).toBe('');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('API_ERROR');
    });

    it('应该处理包含特殊字符的消息', () => {
      const message = 'Error with special chars: @#$%^&*()_+{}[]|\\:";\'<>?,./';
      const error = new ApiError(400, message);

      expect(error.message).toBe(message);
    });

    it('应该处理非常长的消息', () => {
      const longMessage = 'A'.repeat(1000);
      const error = new ApiError(400, longMessage);

      expect(error.message).toBe(longMessage);
      expect(error.message.length).toBe(1000);
    });

    it('应该处理Unicode字符', () => {
      const unicodeMessage = '错误信息 🚨 エラー';
      const error = new ApiError(400, unicodeMessage);

      expect(error.message).toBe(unicodeMessage);
    });

    it('应该处理空的错误代码', () => {
      const error = new ApiError(400, 'Test error', '');

      expect(error.code).toBe('');
    });

    it('应该处理数字状态码边界值', () => {
      const error1 = new ApiError(100, 'Continue');
      const error2 = new ApiError(599, 'Network Connect Timeout Error');

      expect(error1.statusCode).toBe(100);
      expect(error2.statusCode).toBe(599);
    });
  });

  describe('错误序列化', () => {
    it('应该正确序列化为JSON', () => {
      const error = new ApiError(400, 'Bad Request', 'VALIDATION_ERROR');
      const serialized = JSON.stringify(error);
      const parsed = JSON.parse(serialized);

      expect(parsed.statusCode).toBe(400);
      expect(parsed.message).toBe('Bad Request');
      expect(parsed.code).toBe('VALIDATION_ERROR');
      expect(parsed.name).toBe('ApiError');
    });

    it('应该保持错误堆栈信息', () => {
      const error = new ApiError(500, 'Server Error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ApiError: Server Error');
    });
  });

  describe('错误比较', () => {
    it('应该正确比较相同的错误', () => {
      const error1 = new ApiError(400, 'Bad Request', 'VALIDATION_ERROR');
      const error2 = new ApiError(400, 'Bad Request', 'VALIDATION_ERROR');

      expect(error1.statusCode).toBe(error2.statusCode);
      expect(error1.message).toBe(error2.message);
      expect(error1.code).toBe(error2.code);
      expect(error1.name).toBe(error2.name);
    });

    it('应该正确识别不同的错误', () => {
      const error1 = new ApiError(400, 'Bad Request');
      const error2 = new ApiError(401, 'Unauthorized');

      expect(error1.statusCode).not.toBe(error2.statusCode);
      expect(error1.message).not.toBe(error2.message);
    });
  });

  describe('与标准Error的兼容性', () => {
    it('应该可以被catch捕获', () => {
      const throwError = () => {
        throw new ApiError(400, 'Test error');
      };

      expect(throwError).toThrow();
      expect(throwError).toThrow(ApiError);
      expect(throwError).toThrow('Test error');
    });

    it('应该可以使用instanceof检查', () => {
      const error = new ApiError(400, 'Test error');

      expect(error instanceof Error).toBe(true);
      expect(error instanceof ApiError).toBe(true);
    });

    it('应该有正确的原型链', () => {
      const error = new ApiError(400, 'Test error');

      expect(Object.getPrototypeOf(error)).toBe(ApiError.prototype);
      expect(Object.getPrototypeOf(ApiError.prototype)).toBe(Error.prototype);
    });
  });

  describe('实际使用场景', () => {
    it('应该在API路由中正确使用', () => {
      const validateUser = (user: any) => {
        if (!user.email) {
          throw ApiError.badRequest('Email is required', 'MISSING_EMAIL');
        }
        if (!user.password) {
          throw ApiError.badRequest('Password is required', 'MISSING_PASSWORD');
        }
      };

      expect(() => validateUser({})).toThrow(ApiError);
      expect(() => validateUser({ email: 'test@example.com' })).toThrow(ApiError);
      expect(() => validateUser({ email: 'test@example.com', password: '123456' })).not.toThrow();
    });

    it('应该在中间件中正确处理', () => {
      const authMiddleware = (token: string) => {
        if (!token) {
          throw ApiError.unauthorized('Token is required');
        }
        if (token === 'expired') {
          throw ApiError.unauthorized('Token has expired', 'TOKEN_EXPIRED');
        }
        if (token === 'invalid') {
          throw ApiError.forbidden('Invalid token', 'INVALID_TOKEN');
        }
      };

      expect(() => authMiddleware('')).toThrow(ApiError);
      expect(() => authMiddleware('expired')).toThrow(ApiError);
      expect(() => authMiddleware('invalid')).toThrow(ApiError);
      expect(() => authMiddleware('valid-token')).not.toThrow();
    });
  });
});
