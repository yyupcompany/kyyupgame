/**
 * API响应工具测试
 */
import { ApiResponse } from '../../../src/utils/apiResponse';
import { vi } from 'vitest'
import { ApiError } from '../../../src/utils/apiError';
import { testUtils } from '../../setup';

// 控制台错误检测变量
let consoleSpy: any

describe('ApiResponse', () => {
  let res: any;

  beforeEach(() => {
    res = testUtils.mockResponse();
    // 清除console.log的mock
    jest.clearAllMocks();
    // Mock console.log
    jest.spyOn(console, 'log').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('success', () => {
    it('应该返回成功响应', () => {
      const data = { id: 1, name: 'test' };
      const message = '操作成功';

      ApiResponse.success(res, data, message);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        message
      });
    });

    it('应该使用默认消息', () => {
      const data = { id: 1 };

      ApiResponse.success(res, data);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        message: '操作成功'
      });
    });

    it('应该使用自定义状态码', () => {
      const data = { id: 1 };

      ApiResponse.success(res, data, '创建成功', 201);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('应该处理包含list字段的数据 - 正常数组', () => {
      const data = { list: [1, 2, 3], total: 3 };

      ApiResponse.success(res, data);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { list: [1, 2, 3], total: 3 },
        message: '操作成功'
      });
    });

    it('应该将null的list转换为空数组', () => {
      const data = { list: null, total: 0 };

      ApiResponse.success(res, data);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { list: [], total: 0 },
        message: '操作成功'
      });
    });

    it('应该将对象的list转换为数组', () => {
      const data = { list: { id: 1, name: 'test' }, total: 1 };

      ApiResponse.success(res, data);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { list: [{ id: 1, name: 'test' }], total: 1 },
        message: '操作成功'
      });
    });

    it('应该将空对象的list转换为空数组', () => {
      const data = { list: {}, total: 0 };

      ApiResponse.success(res, data);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { list: [], total: 0 },
        message: '操作成功'
      });
    });

    it('应该将其他类型的list转换为空数组', () => {
      const data = { list: 'string', total: 0 };

      ApiResponse.success(res, data);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { list: [], total: 0 },
        message: '操作成功'
      });
    });
  });

  describe('error', () => {
    it('应该返回错误响应', () => {
      const message = '操作失败';
      const code = 'OPERATION_FAILED';

      ApiResponse.error(res, message, code);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code,
          message
        }
      });
    });

    it('应该使用自定义状态码', () => {
      ApiResponse.error(res, '服务器错误', 'SERVER_ERROR', 500);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('notFound', () => {
    it('应该返回404错误', () => {
      ApiResponse.notFound(res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '资源不存在'
        }
      });
    });

    it('应该使用自定义消息', () => {
      const message = '用户不存在';

      ApiResponse.notFound(res, message);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message
        }
      });
    });
  });

  describe('badRequest', () => {
    it('应该返回400错误', () => {
      ApiResponse.badRequest(res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: '请求参数错误'
        }
      });
    });
  });

  describe('unauthorized', () => {
    it('应该返回401错误', () => {
      ApiResponse.unauthorized(res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '未授权'
        }
      });
    });
  });

  describe('forbidden', () => {
    it('应该返回403错误', () => {
      ApiResponse.forbidden(res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '禁止访问'
        }
      });
    });
  });

  describe('serverError', () => {
    it('应该返回500错误', () => {
      ApiResponse.serverError(res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: '服务器内部错误'
        }
      });
    });
  });

  describe('paginated', () => {
    it('应该返回分页数据', () => {
      const items = [{ id: 1 }, { id: 2 }];
      const total = 10;
      const page = 1;
      const pageSize = 2;

      ApiResponse.paginated(res, items, total, page, pageSize);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          items,
          total,
          page,
          pageSize,
          totalPages: 5
        },
        message: '获取数据成功'
      });
    });

    it('应该计算正确的总页数', () => {
      const items = [{ id: 1 }];
      const total = 3;
      const page = 1;
      const pageSize = 2;

      ApiResponse.paginated(res, items, total, page, pageSize);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalPages: 2
          })
        })
      );
    });

    it('应该使用自定义消息', () => {
      const message = '获取用户列表成功';

      ApiResponse.paginated(res, [], 0, 1, 10, message);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message
        })
      );
    });
  });

  describe('handleError', () => {
    it('应该处理ApiError', () => {
      const error = new ApiError(422, '自定义错误', 'CUSTOM_ERROR');

      ApiResponse.handleError(res, error);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'CUSTOM_ERROR',
          message: '自定义错误'
        }
      });
    });

    it('应该处理普通Error', () => {
      const error = new Error('普通错误');

      ApiResponse.handleError(res, error);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: '普通错误',
          details: expect.objectContaining({
            name: 'Error',
            code: 'SERVER_ERROR'
          })
        }
      });
    });

    it('应该处理带有code的Error', () => {
      const error = new Error('数据库错误') as any;
      error.code = 'DB_ERROR';

      ApiResponse.handleError(res, error);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DB_ERROR',
          message: '数据库错误',
          details: expect.objectContaining({
            code: 'DB_ERROR'
          })
        }
      });
    });

    it('应该处理未知错误', () => {
      const error = 'string error';

      ApiResponse.handleError(res, error);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: '操作失败'
        }
      });
    });

    it('应该使用默认错误消息', () => {
      const error = 'unknown';
      const defaultMessage = '自定义默认消息';

      ApiResponse.handleError(res, error, defaultMessage);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: defaultMessage
        }
      });
    });

    it('应该在开发环境包含堆栈信息', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('测试错误');

      ApiResponse.handleError(res, error);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: '测试错误',
          details: expect.objectContaining({
            stack: expect.any(String)
          })
        }
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('permissions', () => {
    it('应该返回权限数据', () => {
      const permissions = ['read', 'write'];
      const isAdmin = true;
      const userId = 123;
      const userRole = 'admin';

      ApiResponse.permissions(res, permissions, isAdmin, userId, userRole);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          permissions,
          isAdmin,
          userId,
          userRole,
          total: 2
        },
        message: '获取用户权限成功'
      });
    });

    it('应该处理空权限列表', () => {
      ApiResponse.permissions(res, []);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          permissions: [],
          isAdmin: false,
          userId: undefined,
          userRole: undefined,
          total: 0
        },
        message: '获取用户权限成功'
      });
    });

    it('应该处理null权限列表', () => {
      ApiResponse.permissions(res, null as any);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          permissions: [],
          isAdmin: false,
          userId: undefined,
          userRole: undefined,
          total: 0
        },
        message: '获取用户权限成功'
      });
    });

    it('应该使用自定义消息', () => {
      const message = '权限获取完成';

      ApiResponse.permissions(res, [], false, undefined, undefined, message);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message
        })
      );
    });
  });
});
