/**
 * Simple Auth Middleware Test
 * 基础认证中间件测试
 */

import { verifyToken } from '../../../src/middlewares/auth.middleware';
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

describe('Auth Middleware Simple Test', () => {
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: any;

  beforeEach(() => {
    mockRequest = testUtils.mockRequest();
    mockResponse = testUtils.mockResponse();
    mockNext = testUtils.mockNext();
    
    jest.clearAllMocks();
  });

  it('should return 401 when no authorization header is provided', async () => {
    // Setup
    mockRequest.headers = {};

    // Execute
    await verifyToken(mockRequest, mockResponse, mockNext);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: '未提供认证令牌'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header does not start with Bearer', async () => {
    // Setup
    mockRequest.headers = { authorization: 'Invalid-Token-Format' };

    // Execute
    await verifyToken(mockRequest, mockResponse, mockNext);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: '未提供认证令牌'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});