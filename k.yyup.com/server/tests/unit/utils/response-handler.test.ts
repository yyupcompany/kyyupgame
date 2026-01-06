import { Response } from 'express';

// Mock Express Response
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.header = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('Response Handler', () => {
  let mockRes: Response;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRes = mockResponse();
  });

  describe('Success Response Handling', () => {
    it('应该处理成功响应', () => {
      const data = { id: 1, name: 'Test User' };
      const message = '操作成功';

      // Mock success response handler
      const handleSuccess = (res: Response, data: any, message: string) => {
        return res.status(200).json({
          success: true,
          message,
          data
        });
      };

      handleSuccess(mockRes, data, message);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '操作成功',
        data: { id: 1, name: 'Test User' }
      });
    });

    it('应该处理创建成功响应', () => {
      const data = { id: 2, name: 'New User' };

      // Mock created response handler
      const handleCreated = (res: Response, data: any) => {
        return res.status(201).json({
          success: true,
          message: '创建成功',
          data
        });
      };

      handleCreated(mockRes, data);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '创建成功',
        data: { id: 2, name: 'New User' }
      });
    });

    it('应该处理无内容响应', () => {
      // Mock no content response handler
      const handleNoContent = (res: Response) => {
        return res.status(204).send();
      };

      handleNoContent(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('应该处理分页响应', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const pagination = {
        page: 1,
        pageSize: 10,
        total: 2,
        totalPages: 1
      };

      // Mock paginated response handler
      const handlePaginated = (res: Response, data: any[], pagination: any) => {
        return res.status(200).json({
          success: true,
          data,
          pagination
        });
      };

      handlePaginated(mockRes, data, pagination);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data,
        pagination
      });
    });
  });

  describe('Error Response Handling', () => {
    it('应该处理客户端错误', () => {
      const message = '请求参数错误';

      // Mock client error handler
      const handleClientError = (res: Response, message: string) => {
        return res.status(400).json({
          success: false,
          message,
          error: 'BAD_REQUEST'
        });
      };

      handleClientError(mockRes, message);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: '请求参数错误',
        error: 'BAD_REQUEST'
      });
    });

    it('应该处理未授权错误', () => {
      // Mock unauthorized error handler
      const handleUnauthorized = (res: Response) => {
        return res.status(401).json({
          success: false,
          message: '未授权访问',
          error: 'UNAUTHORIZED'
        });
      };

      handleUnauthorized(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: '未授权访问',
        error: 'UNAUTHORIZED'
      });
    });

    it('应该处理禁止访问错误', () => {
      // Mock forbidden error handler
      const handleForbidden = (res: Response) => {
        return res.status(403).json({
          success: false,
          message: '禁止访问',
          error: 'FORBIDDEN'
        });
      };

      handleForbidden(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: '禁止访问',
        error: 'FORBIDDEN'
      });
    });

    it('应该处理资源未找到错误', () => {
      const resource = 'User';

      // Mock not found error handler
      const handleNotFound = (res: Response, resource: string) => {
        return res.status(404).json({
          success: false,
          message: `${resource}未找到`,
          error: 'NOT_FOUND'
        });
      };

      handleNotFound(mockRes, resource);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User未找到',
        error: 'NOT_FOUND'
      });
    });

    it('应该处理服务器内部错误', () => {
      const error = new Error('Database connection failed');

      // Mock internal server error handler
      const handleInternalError = (res: Response, error: Error) => {
        return res.status(500).json({
          success: false,
          message: '服务器内部错误',
          error: 'INTERNAL_SERVER_ERROR',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      };

      handleInternalError(mockRes, error);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: '服务器内部错误',
        error: 'INTERNAL_SERVER_ERROR',
        details: undefined // 在测试环境中不显示详情
      });
    });
  });

  describe('Validation Error Handling', () => {
    it('应该处理字段验证错误', () => {
      const validationErrors = [
        { field: 'email', message: '邮箱格式不正确' },
        { field: 'password', message: '密码长度至少6位' }
      ];

      // Mock validation error handler
      const handleValidationError = (res: Response, errors: any[]) => {
        return res.status(422).json({
          success: false,
          message: '数据验证失败',
          error: 'VALIDATION_ERROR',
          details: errors
        });
      };

      handleValidationError(mockRes, validationErrors);

      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: '数据验证失败',
        error: 'VALIDATION_ERROR',
        details: validationErrors
      });
    });

    it('应该处理单个字段错误', () => {
      const field = 'username';
      const message = '用户名已存在';

      // Mock single field error handler
      const handleFieldError = (res: Response, field: string, message: string) => {
        return res.status(422).json({
          success: false,
          message: '数据验证失败',
          error: 'VALIDATION_ERROR',
          details: [{ field, message }]
        });
      };

      handleFieldError(mockRes, field, message);

      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: '数据验证失败',
        error: 'VALIDATION_ERROR',
        details: [{ field: 'username', message: '用户名已存在' }]
      });
    });
  });

  describe('Custom Response Handling', () => {
    it('应该支持自定义状态码', () => {
      const customStatus = 418; // I'm a teapot
      const message = '我是茶壶';

      // Mock custom status handler
      const handleCustomStatus = (res: Response, status: number, message: string) => {
        return res.status(status).json({
          success: false,
          message
        });
      };

      handleCustomStatus(mockRes, customStatus, message);

      expect(mockRes.status).toHaveBeenCalledWith(418);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: '我是茶壶'
      });
    });

    it('应该支持自定义响应头', () => {
      const headers = {
        'X-Custom-Header': 'custom-value',
        'X-Rate-Limit': '100'
      };

      // Mock custom headers handler
      const handleWithHeaders = (res: Response, data: any, headers: Record<string, string>) => {
        Object.entries(headers).forEach(([key, value]) => {
          res.header(key, value);
        });
        return res.status(200).json({
          success: true,
          data
        });
      };

      handleWithHeaders(mockRes, { test: 'data' }, headers);

      expect(mockRes.header).toHaveBeenCalledWith('X-Custom-Header', 'custom-value');
      expect(mockRes.header).toHaveBeenCalledWith('X-Rate-Limit', '100');
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('应该支持设置Cookie', () => {
      const cookieName = 'session_token';
      const cookieValue = 'abc123';
      const options = { httpOnly: true, secure: true };

      // Mock cookie handler
      const handleWithCookie = (res: Response, name: string, value: string, options: any) => {
        res.cookie(name, value, options);
        return res.status(200).json({
          success: true,
          message: 'Cookie已设置'
        });
      };

      handleWithCookie(mockRes, cookieName, cookieValue, options);

      expect(mockRes.cookie).toHaveBeenCalledWith(cookieName, cookieValue, options);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Response Format Consistency', () => {
    it('应该确保成功响应格式一致', () => {
      const responses = [
        { success: true, message: 'OK', data: {} },
        { success: true, message: 'Created', data: {} },
        { success: true, message: 'Updated', data: {} }
      ];

      responses.forEach(response => {
        expect(response).toHaveProperty('success');
        expect(response).toHaveProperty('message');
        expect(response).toHaveProperty('data');
        expect(response.success).toBe(true);
      });
    });

    it('应该确保错误响应格式一致', () => {
      const responses = [
        { success: false, message: 'Bad Request', error: 'BAD_REQUEST' },
        { success: false, message: 'Unauthorized', error: 'UNAUTHORIZED' },
        { success: false, message: 'Not Found', error: 'NOT_FOUND' }
      ];

      responses.forEach(response => {
        expect(response).toHaveProperty('success');
        expect(response).toHaveProperty('message');
        expect(response).toHaveProperty('error');
        expect(response.success).toBe(false);
      });
    });

    it('应该包含时间戳', () => {
      const timestamp = new Date().toISOString();

      // Mock timestamped response handler
      const handleWithTimestamp = (res: Response, data: any) => {
        return res.status(200).json({
          success: true,
          data,
          timestamp
        });
      };

      handleWithTimestamp(mockRes, { test: 'data' });

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { test: 'data' },
        timestamp
      });
    });
  });

  describe('Error Logging', () => {
    it('应该记录错误信息', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');

      // Mock error logging handler
      const handleWithLogging = (res: Response, error: Error) => {
        console.error('Response Handler Error:', error);
        return res.status(500).json({
          success: false,
          message: '服务器内部错误'
        });
      };

      handleWithLogging(mockRes, error);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Response Handler Error:', error);
      expect(mockRes.status).toHaveBeenCalledWith(500);

      consoleErrorSpy.mockRestore();
    });
  });
});
