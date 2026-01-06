/**
 * 错误处理器测试
 */
import { handleServiceError } from '../../../src/utils/error-handler';
import { BusinessError, SystemError, ValidationError, ResourceNotFoundError } from '../../../src/utils/custom-errors';
import { testUtils } from '../../setup';

describe('Error Handler', () => {
  let res: any;
  let originalEnv: string | undefined;

  beforeEach(() => {
    res = testUtils.mockResponse();
    originalEnv = process.env.NODE_ENV;
    
    // Mock console methods
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock Date.prototype.toISOString for consistent timestamps
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2023-01-01T00:00:00.000Z');
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });

  describe('BusinessError处理', () => {
    it('应该处理基础BusinessError', () => {
      const error = new BusinessError('业务逻辑错误', 400, 'BUSINESS_ERROR');

      handleServiceError(error, res);

      expect(console.warn).toHaveBeenCalledWith('[Business Error]:', '业务逻辑错误');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        code: 400,
        message: '业务逻辑错误',
        error: {
          name: 'BusinessError',
          code: 'BUSINESS_ERROR',
          type: 'business'
        },
        timestamp: '2023-01-01T00:00:00.000Z'
      });
    });

    it('应该处理ValidationError', () => {
      const error = new ValidationError('参数验证失败');

      handleServiceError(error, res);

      expect(console.warn).toHaveBeenCalledWith('[Business Error]:', '参数验证失败');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        code: 400,
        message: '参数验证失败',
        error: {
          name: 'ValidationError',
          code: 'VALIDATION_ERROR',
          type: 'business'
        },
        timestamp: '2023-01-01T00:00:00.000Z'
      });
    });

    it('应该处理ResourceNotFoundError', () => {
      const error = new ResourceNotFoundError('用户不存在');

      handleServiceError(error, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        code: 404,
        message: '用户不存在',
        error: {
          name: 'ResourceNotFoundError',
          code: 'RESOURCE_NOT_FOUND',
          type: 'business'
        },
        timestamp: '2023-01-01T00:00:00.000Z'
      });
    });
  });

  describe('SystemError处理', () => {
    it('应该处理SystemError', () => {
      const error = new SystemError('数据库连接失败');

      handleServiceError(error, res);

      expect(console.error).toHaveBeenCalledWith('[System Error]:', error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        code: 500,
        message: '系统错误，请联系管理员',
        error: {
          name: 'SystemError',
          code: 'SYSTEM_ERROR',
          type: 'system',
          stack: undefined
        },
        timestamp: '2023-01-01T00:00:00.000Z'
      });
    });

    it('应该在开发环境包含堆栈信息', () => {
      process.env.NODE_ENV = 'development';
      const error = new SystemError('数据库连接失败');

      handleServiceError(error, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        code: 500,
        message: '系统错误，请联系管理员',
        error: {
          name: 'SystemError',
          code: 'SYSTEM_ERROR',
          type: 'system',
          stack: expect.any(String)
        },
        timestamp: '2023-01-01T00:00:00.000Z'
      });
    });
  });

  describe('传统错误处理', () => {
    it('应该处理普通Error', () => {
      const error = new Error('普通错误');

      handleServiceError(error, res);

      expect(console.error).toHaveBeenCalledWith('[Service Error]:', error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        code: 500,
        message: '服务器内部错误，请联系管理员。错误代码: ERR_500',
        error: {
          name: 'Error',
          stack: undefined,
          code: 'ERR_500',
          sql: undefined,
          originalError: undefined
        },
        timestamp: '2023-01-01T00:00:00.000Z'
      });
    });

    it('应该处理带有statusCode的错误', () => {
      const error = new Error('自定义错误') as any;
      error.statusCode = 422;

      handleServiceError(error, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        code: 422,
        message: '服务器内部错误，请联系管理员。错误代码: ERR_422',
        error: {
          name: 'Error',
          stack: undefined,
          code: 'ERR_422',
          sql: undefined,
          originalError: undefined
        },
        timestamp: '2023-01-01T00:00:00.000Z'
      });
    });

    it('应该处理带有自定义code的错误', () => {
      const error = new Error('数据库错误') as any;
      error.code = 'DB_CONNECTION_ERROR';

      handleServiceError(error, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        code: 500,
        message: '服务器内部错误，请联系管理员。错误代码: DB_CONNECTION_ERROR',
        error: {
          name: 'Error',
          stack: undefined,
          code: 'DB_CONNECTION_ERROR',
          sql: undefined,
          originalError: undefined
        },
        timestamp: '2023-01-01T00:00:00.000Z'
      });
    });

    it('应该处理isOperational错误', () => {
      const error = new Error('操作错误') as any;
      error.isOperational = true;

      handleServiceError(error, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        code: 500,
        message: '操作错误',
        error: {
          name: 'Error',
          stack: undefined,
          code: 'ERR_500',
          sql: undefined,
          originalError: undefined
        },
        timestamp: '2023-01-01T00:00:00.000Z'
      });
    });
  });

  describe('SQL错误处理', () => {
    it('应该处理SQL错误', () => {
      const error = new Error('SQL错误') as any;
      error.sqlMessage = 'Duplicate entry';
      error.sqlState = '23000';
      error.errno = 1062;
      error.sql = 'INSERT INTO users (email) VALUES (?)';

      handleServiceError(error, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        code: 500,
        message: '服务器内部错误，请联系管理员。错误代码: ERR_500',
        error: {
          name: 'Error',
          stack: undefined,
          code: 'ERR_500',
          sql: {
            sqlMessage: 'Duplicate entry',
            sqlState: '23000',
            errno: 1062,
            sql: undefined
          },
          originalError: undefined
        },
        timestamp: '2023-01-01T00:00:00.000Z'
      });
    });

    it('应该在开发环境包含SQL语句', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('SQL错误') as any;
      error.sqlMessage = 'Duplicate entry';
      error.sql = 'INSERT INTO users (email) VALUES (?)';

      handleServiceError(error, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        code: 500,
        message: '服务器内部错误，请联系管理员。错误代码: ERR_500',
        error: {
          name: 'Error',
          stack: expect.any(String),
          code: 'ERR_500',
          sql: {
            sqlMessage: 'Duplicate entry',
            sqlState: undefined,
            errno: undefined,
            sql: 'INSERT INTO users (email) VALUES (?)'
          },
          originalError: expect.any(String)
        },
        timestamp: '2023-01-01T00:00:00.000Z'
      });
    });

    it('应该处理没有SQL信息的错误', () => {
      const error = new Error('普通错误') as any;

      handleServiceError(error, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            sql: undefined
          })
        })
      );
    });
  });

  describe('开发环境特性', () => {
    it('应该在开发环境包含详细信息', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('测试错误') as any;
      error.customProperty = 'custom value';

      handleServiceError(error, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        code: 500,
        message: '服务器内部错误，请联系管理员。错误代码: ERR_500',
        error: {
          name: 'Error',
          stack: expect.any(String),
          code: 'ERR_500',
          sql: undefined,
          originalError: expect.any(String)
        },
        timestamp: '2023-01-01T00:00:00.000Z'
      });

      // 验证originalError包含自定义属性
      const callArgs = (res.json as jest.Mock).mock.calls[0][0];
      const originalError = JSON.parse(callArgs.error.originalError);
      expect(originalError.customProperty).toBe('custom value');
    });

    it('应该在生产环境隐藏敏感信息', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('敏感错误') as any;
      error.sensitiveData = 'secret';

      handleServiceError(error, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        code: 500,
        message: '服务器内部错误，请联系管理员。错误代码: ERR_500',
        error: {
          name: 'Error',
          stack: undefined,
          code: 'ERR_500',
          sql: undefined,
          originalError: undefined
        },
        timestamp: '2023-01-01T00:00:00.000Z'
      });
    });
  });

  describe('边界情况', () => {
    it('应该处理null错误', () => {
      handleServiceError(null, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        code: 500,
        message: '服务器内部错误，请联系管理员。错误代码: ERR_500',
        error: {
          name: undefined,
          stack: undefined,
          code: 'ERR_500',
          sql: undefined,
          originalError: undefined
        },
        timestamp: '2023-01-01T00:00:00.000Z'
      });
    });

    it('应该处理undefined错误', () => {
      handleServiceError(undefined, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        code: 500,
        message: '服务器内部错误，请联系管理员。错误代码: ERR_500',
        error: {
          name: undefined,
          stack: undefined,
          code: 'ERR_500',
          sql: undefined,
          originalError: undefined
        },
        timestamp: '2023-01-01T00:00:00.000Z'
      });
    });

    it('应该处理字符串错误', () => {
      handleServiceError('字符串错误', res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        code: 500,
        message: '服务器内部错误，请联系管理员。错误代码: ERR_500',
        error: {
          name: undefined,
          stack: undefined,
          code: 'ERR_500',
          sql: undefined,
          originalError: undefined
        },
        timestamp: '2023-01-01T00:00:00.000Z'
      });
    });

    it('应该处理对象错误', () => {
      const error = { message: '对象错误', code: 'OBJ_ERROR' };

      handleServiceError(error, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        code: 500,
        message: '服务器内部错误，请联系管理员。错误代码: OBJ_ERROR',
        error: {
          name: undefined,
          stack: undefined,
          code: 'OBJ_ERROR',
          sql: undefined,
          originalError: undefined
        },
        timestamp: '2023-01-01T00:00:00.000Z'
      });
    });
  });

  describe('时间戳', () => {
    it('应该包含ISO格式的时间戳', () => {
      const error = new Error('测试错误');

      handleServiceError(error, res);

      const callArgs = (res.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.timestamp).toBe('2023-01-01T00:00:00.000Z');
      expect(Date.prototype.toISOString).toHaveBeenCalled();
    });
  });
});
