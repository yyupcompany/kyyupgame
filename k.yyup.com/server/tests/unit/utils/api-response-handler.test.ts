import { Response } from 'express';
import { vi } from 'vitest'
import { handleApiResponse } from '../../../src/utils/api-response-handler';

// 控制台错误检测变量
let consoleSpy: any

describe('API Response Handler', () => {
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

  describe('成功响应处理', () => {
    it('应该返回成功响应', () => {
      const testData = { id: 1, name: 'test' };
      const testMessage = 'Success';

      handleApiResponse(mockResponse as Response, testData, testMessage);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: testMessage,
        data: testData,
        timestamp: expect.any(String)
      });
    });

    it('应该使用自定义状态码', () => {
      const testData = { created: true };
      const testMessage = 'Created successfully';
      const customStatusCode = 201;

      handleApiResponse(mockResponse as Response, testData, testMessage, undefined, customStatusCode);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: testMessage,
        data: testData,
        timestamp: expect.any(String)
      });
    });

    it('应该处理null数据', () => {
      const testMessage = 'No data';

      handleApiResponse(mockResponse as Response, null, testMessage);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: testMessage,
        data: null,
        timestamp: expect.any(String)
      });
    });

    it('应该处理undefined数据', () => {
      const testMessage = 'Undefined data';

      handleApiResponse(mockResponse as Response, undefined, testMessage);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: testMessage,
        data: undefined,
        timestamp: expect.any(String)
      });
    });

    it('应该处理数组数据', () => {
      const testData = [{ id: 1 }, { id: 2 }];
      const testMessage = 'Array data';

      handleApiResponse(mockResponse as Response, testData, testMessage);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: testMessage,
        data: testData,
        timestamp: expect.any(String)
      });
    });

    it('应该包含有效的ISO时间戳', () => {
      const testData = { test: true };
      const testMessage = 'Test message';

      handleApiResponse(mockResponse as Response, testData, testMessage);

      const callArgs = mockJson.mock.calls[0][0];
      const timestamp = callArgs.timestamp;
      
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });

  describe('错误响应处理', () => {
    it('应该处理Error对象', () => {
      const testError = new Error('Test error message');
      const testMessage = 'Operation failed';

      handleApiResponse(mockResponse as Response, null, testMessage, testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', testError);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: testMessage,
        error: 'Test error message',
        timestamp: expect.any(String)
      });
    });

    it('应该处理字符串错误', () => {
      const testError = 'String error message';
      const testMessage = 'Operation failed';

      handleApiResponse(mockResponse as Response, null, testMessage, testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', testError);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: testMessage,
        error: 'String error message',
        timestamp: expect.any(String)
      });
    });

    it('应该处理数字错误', () => {
      const testError = 404;
      const testMessage = 'Not found';

      handleApiResponse(mockResponse as Response, null, testMessage, testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', testError);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: testMessage,
        error: '404',
        timestamp: expect.any(String)
      });
    });

    it('应该处理对象错误', () => {
      const testError = { code: 'VALIDATION_ERROR', details: 'Invalid input' };
      const testMessage = 'Validation failed';

      handleApiResponse(mockResponse as Response, null, testMessage, testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', testError);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: testMessage,
        error: '[object Object]',
        timestamp: expect.any(String)
      });
    });

    it('应该使用自定义错误状态码', () => {
      const testError = new Error('Bad request');
      const testMessage = 'Invalid input';
      const customStatusCode = 400;

      handleApiResponse(mockResponse as Response, null, testMessage, testError, customStatusCode);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: testMessage,
        error: 'Bad request',
        timestamp: expect.any(String)
      });
    });

    it('应该将小于400的状态码转换为500', () => {
      const testError = new Error('Server error');
      const testMessage = 'Internal error';
      const invalidStatusCode = 200; // 成功状态码但有错误

      handleApiResponse(mockResponse as Response, null, testMessage, testError, invalidStatusCode);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: testMessage,
        error: 'Server error',
        timestamp: expect.any(String)
      });
    });

    it('应该处理null错误', () => {
      const testMessage = 'Unknown error';

      handleApiResponse(mockResponse as Response, null, testMessage, null);

      expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', null);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: testMessage,
        error: 'null',
        timestamp: expect.any(String)
      });
    });

    it('应该处理undefined错误', () => {
      const testMessage = 'Undefined error';

      handleApiResponse(mockResponse as Response, null, testMessage, undefined);

      expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', undefined);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: testMessage,
        error: 'undefined',
        timestamp: expect.any(String)
      });
    });

    it('错误响应应该包含有效的ISO时间戳', () => {
      const testError = new Error('Test error');
      const testMessage = 'Error occurred';

      handleApiResponse(mockResponse as Response, null, testMessage, testError);

      const callArgs = mockJson.mock.calls[0][0];
      const timestamp = callArgs.timestamp;
      
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });

  describe('边界情况', () => {
    it('应该处理空字符串消息', () => {
      const testData = { test: true };

      handleApiResponse(mockResponse as Response, testData, '');

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: '',
        data: testData,
        timestamp: expect.any(String)
      });
    });

    it('应该处理复杂嵌套数据', () => {
      const complexData = {
        user: {
          id: 1,
          profile: {
            name: 'John',
            settings: {
              theme: 'dark',
              notifications: true
            }
          }
        },
        items: [1, 2, 3]
      };

      handleApiResponse(mockResponse as Response, complexData, 'Complex data');

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Complex data',
        data: complexData,
        timestamp: expect.any(String)
      });
    });

    it('应该处理循环引用对象', () => {
      const circularData: any = { name: 'test' };
      circularData.self = circularData;

      // 这应该不会抛出错误，JSON.stringify会处理循环引用
      expect(() => {
        handleApiResponse(mockResponse as Response, circularData, 'Circular data');
      }).not.toThrow();
    });
  });
});
