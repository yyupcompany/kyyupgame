/**
 * Error Handler Middleware 单元测试
 * 测试错误处理中间件的各种功能
 */

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { errorHandler } from '../../../src/middlewares/errorHandler';
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';
import { testUtils } from '../../setup';

// Mock dependencies
jest.mock('../../../src/utils/logger');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

const logger = require('../../../src/utils/logger');


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

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = testUtils.mockRequest();
    mockResponse = testUtils.mockResponse();
    mockNext = testUtils.mockNext();
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('errorHandler', () => {
    it('should handle ApiError correctly', () => {
      // Setup
      const apiError = new ApiError('TEST_ERROR', 'Test error message', 400);
      mockRequest.method = 'GET';
      mockRequest.path = '/api/test';
      mockRequest.user = { id: 123 };

      // Execute
      errorHandler(apiError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        '请求路径: GET /api/test',
        apiError
      );
      expect(logger.error).toHaveBeenCalledWith(
        'API错误: [TEST_ERROR] Test error message (400)',
        {
          path: '/api/test',
          method: 'GET',
          query: {},
          body: {},
          user: 123
        }
      );
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse,
        'TEST_ERROR',
        'Test error message',
        400
      );
    });

    it('should handle SequelizeValidationError', () => {
      // Setup
      const sequelizeError = new Error('Validation error');
      sequelizeError.name = 'SequelizeValidationError';
      sequelizeError.message = 'Validation error: name is required';
      
      mockRequest.method = 'POST';
      mockRequest.path = '/api/users';
      mockRequest.query = { page: '1' };
      mockRequest.body = { name: '' };

      // Execute
      errorHandler(sequelizeError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        '请求路径: POST /api/users',
        sequelizeError
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Sequelize错误: SequelizeValidationError',
        {
          message: 'Validation error: name is required',
          path: '/api/users',
          method: 'POST'
        }
      );
      expect(ApiResponse.badRequest).toHaveBeenCalledWith(
        mockResponse,
        'Validation error: name is required'
      );
    });

    it('should handle SequelizeUniqueConstraintError', () => {
      // Setup
      const sequelizeError = new Error('Unique constraint error');
      sequelizeError.name = 'SequelizeUniqueConstraintError';
      sequelizeError.message = 'Duplicate entry for email';
      
      mockRequest.method = 'POST';
      mockRequest.path = '/api/users';

      // Execute
      errorHandler(sequelizeError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'Sequelize错误: SequelizeUniqueConstraintError',
        {
          message: 'Duplicate entry for email',
          path: '/api/users',
          method: 'POST'
        }
      );
      expect(ApiResponse.badRequest).toHaveBeenCalledWith(
        mockResponse,
        'Duplicate entry for email'
      );
    });

    it('should handle JsonWebTokenError', () => {
      // Setup
      const jwtError = new Error('Invalid token');
      jwtError.name = 'JsonWebTokenError';
      jwtError.message = 'invalid signature';
      
      mockRequest.method = 'GET';
      mockRequest.path = '/api/protected';

      // Execute
      errorHandler(jwtError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'JWT错误: JsonWebTokenError',
        {
          message: 'invalid signature',
          path: '/api/protected',
          method: 'GET'
        }
      );
      expect(ApiResponse.unauthorized).toHaveBeenCalledWith(
        mockResponse,
        '无效的token'
      );
    });

    it('should handle TokenExpiredError', () => {
      // Setup
      const jwtError = new Error('Token expired');
      jwtError.name = 'TokenExpiredError';
      jwtError.message = 'jwt expired';
      
      mockRequest.method = 'GET';
      mockRequest.path = '/api/protected';

      // Execute
      errorHandler(jwtError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'JWT错误: TokenExpiredError',
        {
          message: 'jwt expired',
          path: '/api/protected',
          method: 'GET'
        }
      );
      expect(ApiResponse.unauthorized).toHaveBeenCalledWith(
        mockResponse,
        'token已过期'
      );
    });

    it('should handle generic errors', () => {
      // Setup
      const genericError = new Error('Something went wrong');
      genericError.name = 'GenericError';
      genericError.stack = 'Error stack trace';
      
      mockRequest.method = 'DELETE';
      mockRequest.path = '/api/users/123';
      mockRequest.query = { force: 'true' };
      mockRequest.body = { reason: 'test' };

      // Execute
      errorHandler(genericError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        '请求路径: DELETE /api/users/123',
        genericError
      );
      expect(logger.error).toHaveBeenCalledWith(
        '未处理的错误: GenericError',
        {
          message: 'Something went wrong',
          stack: 'Error stack trace',
          path: '/api/users/123',
          method: 'DELETE'
        }
      );
      expect(ApiResponse.serverError).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle errors without stack trace', () => {
      // Setup
      const errorWithoutStack = new Error('Error without stack');
      errorWithoutStack.name = 'NoStackError';
      errorWithoutStack.stack = undefined;
      
      mockRequest.method = 'GET';
      mockRequest.path = '/api/test';

      // Execute
      errorHandler(errorWithoutStack, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        '未处理的错误: NoStackError',
        {
          message: 'Error without stack',
          stack: undefined,
          path: '/api/test',
          method: 'GET'
        }
      );
      expect(ApiResponse.serverError).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle errors without name', () => {
      // Setup
      const errorWithoutName = new Error('Error without name');
      errorWithoutName.name = undefined;
      errorWithoutName.stack = 'Error stack trace';
      
      mockRequest.method = 'PUT';
      mockRequest.path = '/api/users/123';

      // Execute
      errorHandler(errorWithoutName, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        '未处理的错误: Unknown Error',
        {
          message: 'Error without name',
          stack: 'Error stack trace',
          path: '/api/users/123',
          method: 'PUT'
        }
      );
      expect(ApiResponse.serverError).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle errors with null user', () => {
      // Setup
      const apiError = new ApiError('TEST_ERROR', 'Test error message', 404);
      mockRequest.method = 'GET';
      mockRequest.path = '/api/test';
      mockRequest.user = null;

      // Execute
      errorHandler(apiError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'API错误: [TEST_ERROR] Test error message (404)',
        {
          path: '/api/test',
          method: 'GET',
          query: {},
          body: {},
          user: null
        }
      );
    });

    it('should handle errors with undefined user', () => {
      // Setup
      const apiError = new ApiError('TEST_ERROR', 'Test error message', 403);
      mockRequest.method = 'POST';
      mockRequest.path = '/api/test';
      mockRequest.user = undefined;

      // Execute
      errorHandler(apiError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'API错误: [TEST_ERROR] Test error message (403)',
        {
          path: '/api/test',
          method: 'POST',
          query: {},
          body: {},
          user: undefined
        }
      );
    });

    it('should handle requests without query parameters', () => {
      // Setup
      const sequelizeError = new Error('Sequelize error');
      sequelizeError.name = 'SequelizeValidationError';
      mockRequest.method = 'GET';
      mockRequest.path = '/api/test';
      mockRequest.query = undefined;

      // Execute
      errorHandler(sequelizeError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'Sequelize错误: SequelizeValidationError',
        {
          message: 'Sequelize error',
          path: '/api/test',
          method: 'GET'
        }
      );
    });

    it('should handle requests without body', () => {
      // Setup
      const apiError = new ApiError('TEST_ERROR', 'Test error message', 500);
      mockRequest.method = 'POST';
      mockRequest.path = '/api/test';
      mockRequest.body = undefined;

      // Execute
      errorHandler(apiError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'API错误: [TEST_ERROR] Test error message (500)',
        {
          path: '/api/test',
          method: 'POST',
          query: {},
          body: undefined,
          user: undefined
        }
      );
    });

    it('should handle complex request bodies', () => {
      // Setup
      const apiError = new ApiError('TEST_ERROR', 'Test error message', 422);
      mockRequest.method = 'POST';
      mockRequest.path = '/api/users';
      mockRequest.body = {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          profile: {
            age: 30,
            address: {
              street: '123 Main St',
              city: 'New York'
            }
          }
        },
        preferences: {
          theme: 'dark',
          notifications: true
        }
      };

      // Execute
      errorHandler(apiError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'API错误: [TEST_ERROR] Test error message (422)',
        {
          path: '/api/users',
          method: 'POST',
          query: {},
          body: mockRequest.body,
          user: undefined
        }
      );
    });

    it('should handle complex query parameters', () => {
      // Setup
      const apiError = new ApiError('TEST_ERROR', 'Test error message', 400);
      mockRequest.method = 'GET';
      mockRequest.path = '/api/search';
      mockRequest.query = {
        q: 'search term',
        filters: {
          category: 'books',
          price: { min: 10, max: 100 },
          sort: 'price',
          order: 'asc'
        },
        page: 1,
        limit: 10
      };

      // Execute
      errorHandler(apiError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'API错误: [TEST_ERROR] Test error message (400)',
        {
          path: '/api/search',
          method: 'GET',
          query: mockRequest.query,
          body: {},
          user: undefined
        }
      );
    });

    it('should handle errors with special characters in messages', () => {
      // Setup
      const errorWithSpecialChars = new Error('Error with special chars: @#$%^&*()');
      errorWithSpecialChars.name = 'SpecialCharError';
      
      mockRequest.method = 'GET';
      mockRequest.path = '/api/test';

      // Execute
      errorHandler(errorWithSpecialChars, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        '未处理的错误: SpecialCharError',
        {
          message: 'Error with special chars: @#$%^&*()',
          stack: undefined,
          path: '/api/test',
          method: 'GET'
        }
      );
      expect(ApiResponse.serverError).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle errors with unicode characters', () => {
      // Setup
      const errorWithUnicode = new Error('错误信息：测试中文字符');
      errorWithUnicode.name = 'UnicodeError';
      
      mockRequest.method = 'GET';
      mockRequest.path = '/api/test';

      // Execute
      errorHandler(errorWithUnicode, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        '未处理的错误: UnicodeError',
        {
          message: '错误信息：测试中文字符',
          stack: undefined,
          path: '/api/test',
          method: 'GET'
        }
      );
      expect(ApiResponse.serverError).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle errors with very long messages', () => {
      // Setup
      const longMessage = 'This is a very long error message that exceeds normal limits and tests the error handling capabilities with extended text content to ensure proper logging and error response generation.';
      const errorWithLongMessage = new Error(longMessage);
      errorWithLongMessage.name = 'LongMessageError';
      
      mockRequest.method = 'GET';
      mockRequest.path = '/api/test';

      // Execute
      errorHandler(errorWithLongMessage, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        '未处理的错误: LongMessageError',
        {
          message: longMessage,
          stack: undefined,
          path: '/api/test',
          method: 'GET'
        }
      );
      expect(ApiResponse.serverError).toHaveBeenCalledWith(mockResponse);
    });
  });
});