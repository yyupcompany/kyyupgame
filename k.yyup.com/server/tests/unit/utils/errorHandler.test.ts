import { Response } from 'express';
import { vi } from 'vitest'
import { ErrorHandler } from '../../../src/utils/errorHandler';

// 控制台错误检测变量
let consoleSpy: any

describe('ErrorHandler', () => {
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('handleError', () => {
    it('应该处理带有statusCode的错误', () => {
      const error = {
        statusCode: 400,
        message: 'Bad Request'
      };

      ErrorHandler.handleError(error, mockResponse as Response);

      expect(consoleErrorSpy).toHaveBeenCalledWith('API错误:', error);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Bad Request',
        error: 'Bad Request'
      });
    });

    it('应该处理Error对象', () => {
      const error = new Error('Test error message');

      ErrorHandler.handleError(error, mockResponse as Response);

      expect(consoleErrorSpy).toHaveBeenCalledWith('API错误:', error);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Test error message',
        error: 'Test error message'
      });
    });

    it('应该使用默认状态码500', () => {
      const error = {
        message: 'Error without status code'
      };

      ErrorHandler.handleError(error, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error without status code',
        error: 'Error without status code'
      });
    });

    it('应该使用默认错误消息', () => {
      const error = {
        statusCode: 500
      };

      ErrorHandler.handleError(error, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: '服务器内部错误',
        error: '服务器内部错误'
      });
    });

    it('应该处理null错误', () => {
      ErrorHandler.handleError(null, mockResponse as Response);

      expect(consoleErrorSpy).toHaveBeenCalledWith('API错误:', null);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: '服务器内部错误',
        error: '服务器内部错误'
      });
    });

    it('应该处理undefined错误', () => {
      ErrorHandler.handleError(undefined, mockResponse as Response);

      expect(consoleErrorSpy).toHaveBeenCalledWith('API错误:', undefined);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: '服务器内部错误',
        error: '服务器内部错误'
      });
    });

    it('应该处理字符串错误', () => {
      const error = 'String error message';

      ErrorHandler.handleError(error, mockResponse as Response);

      expect(consoleErrorSpy).toHaveBeenCalledWith('API错误:', error);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: '服务器内部错误',
        error: '服务器内部错误'
      });
    });

    it('应该处理数字错误', () => {
      const error = 404;

      ErrorHandler.handleError(error, mockResponse as Response);

      expect(consoleErrorSpy).toHaveBeenCalledWith('API错误:', error);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: '服务器内部错误',
        error: '服务器内部错误'
      });
    });

    it('应该处理复杂对象错误', () => {
      const error = {
        statusCode: 422,
        message: 'Validation failed',
        details: {
          field: 'email',
          reason: 'invalid format'
        }
      };

      ErrorHandler.handleError(error, mockResponse as Response);

      expect(consoleErrorSpy).toHaveBeenCalledWith('API错误:', error);
      expect(mockStatus).toHaveBeenCalledWith(422);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        error: 'Validation failed'
      });
    });

    it('应该处理空字符串消息', () => {
      const error = {
        statusCode: 400,
        message: ''
      };

      ErrorHandler.handleError(error, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: '服务器内部错误',
        error: '服务器内部错误'
      });
    });

    it('应该处理0状态码', () => {
      const error = {
        statusCode: 0,
        message: 'Zero status code'
      };

      ErrorHandler.handleError(error, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Zero status code',
        error: 'Zero status code'
      });
    });

    it('应该处理负数状态码', () => {
      const error = {
        statusCode: -1,
        message: 'Negative status code'
      };

      ErrorHandler.handleError(error, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Negative status code',
        error: 'Negative status code'
      });
    });

    it('应该处理非数字状态码', () => {
      const error = {
        statusCode: 'invalid',
        message: 'Invalid status code'
      };

      ErrorHandler.handleError(error, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid status code',
        error: 'Invalid status code'
      });
    });

    it('应该记录错误到控制台', () => {
      const error = new Error('Test error');

      ErrorHandler.handleError(error, mockResponse as Response);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('API错误:', error);
    });

    it('应该始终返回success: false', () => {
      const errors = [
        new Error('Error 1'),
        { statusCode: 400, message: 'Error 2' },
        'String error',
        null,
        undefined
      ];

      errors.forEach(error => {
        mockJson.mockClear();
        ErrorHandler.handleError(error, mockResponse as Response);
        
        const responseData = mockJson.mock.calls[0][0];
        expect(responseData.success).toBe(false);
      });
    });

    it('应该确保响应格式一致', () => {
      const error = new Error('Consistency test');

      ErrorHandler.handleError(error, mockResponse as Response);

      const responseData = mockJson.mock.calls[0][0];
      
      expect(responseData).toHaveProperty('success');
      expect(responseData).toHaveProperty('message');
      expect(responseData).toHaveProperty('error');
      expect(Object.keys(responseData)).toEqual(['success', 'message', 'error']);
    });
  });
});
