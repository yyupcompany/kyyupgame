/**
 * BaseController 单元测试
 * 测试统一的错误处理和成功响应格式
 */

import { BaseController } from '../../../src/controllers/base.controller';
import { vi } from 'vitest'
import { testUtils } from '../../setup';


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

describe('BaseController', () => {
  let controller: BaseController;
  let mockResponse: any;

  beforeEach(() => {
    controller = new BaseController();
    mockResponse = testUtils.mockResponse();
  });

  describe('handleError', () => {
    it('should handle ValidationError with 400 status', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';

      controller['handleError'](mockResponse, error);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed'
      });
    });

    it('should handle ValidationError without message', () => {
      const error = new Error();
      error.name = 'ValidationError';

      controller['handleError'](mockResponse, error);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '请求参数验证失败'
      });
    });

    it('should handle UnauthorizedError with 401 status', () => {
      const error = new Error('Unauthorized access');
      error.name = 'UnauthorizedError';

      controller['handleError'](mockResponse, error);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '未授权访问'
      });
    });

    it('should handle generic errors with 500 status', () => {
      const error = new Error('Internal server error');

      controller['handleError'](mockResponse, error);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
    });

    it('should handle errors without message', () => {
      const error = new Error();

      controller['handleError'](mockResponse, error);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '内部服务器错误'
      });
    });

    it('should log error to console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');

      controller['handleError'](mockResponse, error);

      expect(consoleSpy).toHaveBeenCalledWith('Controller Error:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('handleSuccess', () => {
    it('should return success response with data and message', () => {
      const data = { id: 1, name: 'Test' };
      const message = 'Operation successful';

      controller['handleSuccess'](mockResponse, data, message);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data,
        message
      });
    });

    it('should return success response with only data', () => {
      const data = { id: 1, name: 'Test' };

      controller['handleSuccess'](mockResponse, data);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data,
        message: undefined
      });
    });

    it('should return success response with only message', () => {
      const message = 'Operation successful';

      controller['handleSuccess'](mockResponse, undefined, message);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: undefined,
        message
      });
    });

    it('should return success response without data or message', () => {
      controller['handleSuccess'](mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: undefined,
        message: undefined
      });
    });

    it('should handle null data', () => {
      controller['handleSuccess'](mockResponse, null, 'Success');

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'Success'
      });
    });

    it('should handle empty string message', () => {
      const data = { test: true };

      controller['handleSuccess'](mockResponse, data, '');

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data,
        message: ''
      });
    });
  });

  describe('error handling edge cases', () => {
    it('should handle non-Error objects', () => {
      const error = 'String error';

      controller['handleError'](mockResponse, error);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '内部服务器错误'
      });
    });

    it('should handle null error', () => {
      controller['handleError'](mockResponse, null);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '内部服务器错误'
      });
    });

    it('should handle undefined error', () => {
      controller['handleError'](mockResponse, undefined);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '内部服务器错误'
      });
    });
  });
});
