/**
 * Rate Limiter Middleware 单元测试
 * 测试速率限制中间件的各种功能
 */

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { 
  loginLimiter, 
  apiLimiter, 
  strictLimiter 
} from '../../../src/middlewares/security.middleware';
import { testUtils } from '../../setup';

// Mock express-rate-limit
jest.mock('express-rate-limit');
const rateLimit = require('express-rate-limit');


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

describe('Rate Limiter Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = testUtils.mockRequest();
    mockResponse = testUtils.mockResponse();
    mockNext = testUtils.mockNext();
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock environment
    process.env.NODE_ENV = 'test';
  });

  describe('loginLimiter', () => {
    it('should create rate limiter with correct configuration for test environment', () => {
      // Setup
      const mockRateLimitFn = jest.fn();
      rateLimit.mockReturnValue(mockRateLimitFn);

      // Execute
      const middleware = loginLimiter;

      // Assert
      expect(rateLimit).toHaveBeenCalledWith({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // Test environment limit
        message: {
          success: false,
          error: 'TOO_MANY_ATTEMPTS',
          message: '登录尝试过于频繁，请稍后再试'
        },
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: true,
        handler: expect.any(Function)
      });
    });

    it('should create rate limiter with correct configuration for production environment', () => {
      // Setup
      process.env.NODE_ENV = 'production';
      const mockRateLimitFn = jest.fn();
      rateLimit.mockReturnValue(mockRateLimitFn);

      // Execute
      const middleware = loginLimiter;

      // Assert
      expect(rateLimit).toHaveBeenCalledWith({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // Production environment limit
        message: {
          success: false,
          error: 'TOO_MANY_ATTEMPTS',
          message: '登录尝试过于频繁，请稍后再试'
        },
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: true,
        handler: expect.any(Function)
      });
    });

    it('should create rate limiter with correct configuration for development environment', () => {
      // Setup
      process.env.NODE_ENV = 'development';
      const mockRateLimitFn = jest.fn();
      rateLimit.mockReturnValue(mockRateLimitFn);

      // Execute
      const middleware = loginLimiter;

      // Assert
      expect(rateLimit).toHaveBeenCalledWith({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // Development environment limit
        message: {
          success: false,
          error: 'TOO_MANY_ATTEMPTS',
          message: '登录尝试过于频繁，请稍后再试'
        },
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: true,
        handler: expect.any(Function)
      });
    });

    it('should handle rate limit exceeded with custom handler', () => {
      // Setup
      const mockRateLimitFn = jest.fn();
      rateLimit.mockImplementation((config) => {
        // Test the handler function
        const mockReq = { ip: '127.0.0.1' };
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        
        config.handler(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(429);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: 'TOO_MANY_ATTEMPTS',
          message: '登录尝试过于频繁，请稍后再试'
        });
        
        return mockRateLimitFn;
      });

      // Execute
      const middleware = loginLimiter;
    });

    it('should skip successful requests from rate limiting', () => {
      // Setup
      const mockRateLimitFn = jest.fn();
      rateLimit.mockReturnValue(mockRateLimitFn);

      // Execute
      const middleware = loginLimiter;

      // Assert
      expect(rateLimit).toHaveBeenCalledWith(
        expect.objectContaining({
          skipSuccessfulRequests: true
        })
      );
    });

    it('should use standard headers and disable legacy headers', () => {
      // Setup
      const mockRateLimitFn = jest.fn();
      rateLimit.mockReturnValue(mockRateLimitFn);

      // Execute
      const middleware = loginLimiter;

      // Assert
      expect(rateLimit).toHaveBeenCalledWith(
        expect.objectContaining({
          standardHeaders: true,
          legacyHeaders: false
        })
      );
    });
  });

  describe('apiLimiter', () => {
    it('should create API rate limiter with correct configuration for test environment', () => {
      // Setup
      const mockRateLimitFn = jest.fn();
      rateLimit.mockReturnValue(mockRateLimitFn);

      // Execute
      const middleware = apiLimiter;

      // Assert
      expect(rateLimit).toHaveBeenCalledWith({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10000, // Test environment limit
        message: {
          success: false,
          error: 'TOO_MANY_REQUESTS',
          message: '请求过于频繁，请稍后再试'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: expect.any(Function)
      });
    });

    it('should create API rate limiter with correct configuration for production environment', () => {
      // Setup
      process.env.NODE_ENV = 'production';
      const mockRateLimitFn = jest.fn();
      rateLimit.mockReturnValue(mockRateLimitFn);

      // Execute
      const middleware = apiLimiter;

      // Assert
      expect(rateLimit).toHaveBeenCalledWith({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // Production environment limit
        message: {
          success: false,
          error: 'TOO_MANY_REQUESTS',
          message: '请求过于频繁，请稍后再试'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: expect.any(Function)
      });
    });

    it('should handle API rate limit exceeded with custom handler', () => {
      // Setup
      const mockRateLimitFn = jest.fn();
      rateLimit.mockImplementation((config) => {
        // Test the handler function
        const mockReq = { ip: '127.0.0.1' };
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        
        config.handler(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(429);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: 'TOO_MANY_REQUESTS',
          message: '请求过于频繁，请稍后再试'
        });
        
        return mockRateLimitFn;
      });

      // Execute
      const middleware = apiLimiter;
    });

    it('should not skip successful requests for API rate limiting', () => {
      // Setup
      const mockRateLimitFn = jest.fn();
      rateLimit.mockReturnValue(mockRateLimitFn);

      // Execute
      const middleware = apiLimiter;

      // Assert
      expect(rateLimit).toHaveBeenCalledWith(
        expect.objectContaining({
          skipSuccessfulRequests: undefined // Should not be set
        })
      );
    });
  });

  describe('strictLimiter', () => {
    it('should create strict rate limiter with correct configuration', () => {
      // Setup
      const mockRateLimitFn = jest.fn();
      rateLimit.mockReturnValue(mockRateLimitFn);

      // Execute
      const middleware = strictLimiter;

      // Assert
      expect(rateLimit).toHaveBeenCalledWith({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10, // Strict limit
        message: {
          success: false,
          error: 'STRICT_RATE_LIMIT',
          message: '操作过于频繁，请稍后再试'
        },
        standardHeaders: true,
        legacyHeaders: false
      });
    });

    it('should handle strict rate limit exceeded with default handler', () => {
      // Setup
      const mockRateLimitFn = jest.fn();
      rateLimit.mockImplementation((config) => {
        // The strict limiter should use the default handler (no custom handler)
        expect(config.handler).toBeUndefined();
        return mockRateLimitFn;
      });

      // Execute
      const middleware = strictLimiter;
    });

    it('should have longer window for strict rate limiter', () => {
      // Setup
      const mockRateLimitFn = jest.fn();
      rateLimit.mockReturnValue(mockRateLimitFn);

      // Execute
      const middleware = strictLimiter;

      // Assert
      expect(rateLimit).toHaveBeenCalledWith(
        expect.objectContaining({
          windowMs: 60 * 60 * 1000 // 1 hour (longer than login/api limiters)
        })
      );
    });

    it('should have lower max requests for strict rate limiter', () => {
      // Setup
      const mockRateLimitFn = jest.fn();
      rateLimit.mockReturnValue(mockRateLimitFn);

      // Execute
      const middleware = strictLimiter;

      // Assert
      expect(rateLimit).toHaveBeenCalledWith(
        expect.objectContaining({
          max: 10 // Lower than other limiters
        })
      );
    });
  });

  describe('Rate Limiter Environment Configuration', () => {
    it('should adjust limits based on NODE_ENV', () => {
      const testCases = [
        { env: 'test', loginMax: 1000, apiMax: 10000 },
        { env: 'development', loginMax: 1000, apiMax: 10000 },
        { env: 'production', loginMax: 5, apiMax: 1000 }
      ];

      testCases.forEach(({ env, loginMax, apiMax }) => {
        // Setup
        process.env.NODE_ENV = env;
        const mockRateLimitFn = jest.fn();
        rateLimit.mockReturnValue(mockRateLimitFn);

        // Execute
        const loginMiddleware = loginLimiter;
        const apiMiddleware = apiLimiter;

        // Get the calls to rateLimit
        const calls = rateLimit.mock.calls;
        const loginCall = calls[calls.length - 2]; // Second to last call
        const apiCall = calls[calls.length - 1]; // Last call

        // Assert
        expect(loginCall[0].max).toBe(loginMax);
        expect(apiCall[0].max).toBe(apiMax);

        // Reset for next iteration
        rateLimit.mockClear();
      });
    });

    it('should handle undefined NODE_ENV gracefully', () => {
      // Setup
      delete process.env.NODE_ENV;
      const mockRateLimitFn = jest.fn();
      rateLimit.mockReturnValue(mockRateLimitFn);

      // Execute
      const middleware = loginLimiter;

      // Assert
      expect(rateLimit).toHaveBeenCalledWith(
        expect.objectContaining({
          max: 5 // Should default to production limits
        })
      );
    });
  });

  describe('Rate Limiter Message Formats', () => {
    it('should have consistent error message format across all limiters', () => {
      // Setup
      const mockRateLimitFn = jest.fn();
      rateLimit.mockReturnValue(mockRateLimitFn);

      // Execute
      const loginMiddleware = loginLimiter;
      const apiMiddleware = apiLimiter;
      const strictMiddleware = strictLimiter;

      // Get the calls to rateLimit
      const calls = rateLimit.mock.calls;
      const loginMessage = calls[0][0].message;
      const apiMessage = calls[1][0].message;
      const strictMessage = calls[2][0].message;

      // Assert
      expect(loginMessage).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
          message: expect.any(String)
        })
      );
      
      expect(apiMessage).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
          message: expect.any(String)
        })
      );
      
      expect(strictMessage).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
          message: expect.any(String)
        })
      );
    });

    it('should have unique error codes for different limiters', () => {
      // Setup
      const mockRateLimitFn = jest.fn();
      rateLimit.mockReturnValue(mockRateLimitFn);

      // Execute
      const loginMiddleware = loginLimiter;
      const apiMiddleware = apiLimiter;
      const strictMiddleware = strictLimiter;

      // Get the calls to rateLimit
      const calls = rateLimit.mock.calls;
      const loginError = calls[0][0].message.error;
      const apiError = calls[1][0].message.error;
      const strictError = calls[2][0].message.error;

      // Assert
      expect(loginError).toBe('TOO_MANY_ATTEMPTS');
      expect(apiError).toBe('TOO_MANY_REQUESTS');
      expect(strictError).toBe('STRICT_RATE_LIMIT');
      
      // Ensure all error codes are unique
      expect(new Set([loginError, apiError, strictError]).size).toBe(3);
    });
  });

  describe('Rate Limiter Configuration Consistency', () => {
    it('should use consistent header configuration across all limiters', () => {
      // Setup
      const mockRateLimitFn = jest.fn();
      rateLimit.mockReturnValue(mockRateLimitFn);

      // Execute
      const loginMiddleware = loginLimiter;
      const apiMiddleware = apiLimiter;
      const strictMiddleware = strictLimiter;

      // Get the calls to rateLimit
      const calls = rateLimit.mock.calls;
      const loginConfig = calls[0][0];
      const apiConfig = calls[1][0];
      const strictConfig = calls[2][0];

      // Assert
      expect(loginConfig.standardHeaders).toBe(true);
      expect(apiConfig.standardHeaders).toBe(true);
      expect(strictConfig.standardHeaders).toBe(true);

      expect(loginConfig.legacyHeaders).toBe(false);
      expect(apiConfig.legacyHeaders).toBe(false);
      expect(strictConfig.legacyHeaders).toBe(false);
    });

    it('should have appropriate window sizes for different use cases', () => {
      // Setup
      const mockRateLimitFn = jest.fn();
      rateLimit.mockReturnValue(mockRateLimitFn);

      // Execute
      const loginMiddleware = loginLimiter;
      const apiMiddleware = apiLimiter;
      const strictMiddleware = strictLimiter;

      // Get the calls to rateLimit
      const calls = rateLimit.mock.calls;
      const loginWindow = calls[0][0].windowMs;
      const apiWindow = calls[1][0].windowMs;
      const strictWindow = calls[2][0].windowMs;

      // Assert
      expect(loginWindow).toBe(15 * 60 * 1000); // 15 minutes
      expect(apiWindow).toBe(15 * 60 * 1000); // 15 minutes
      expect(strictWindow).toBe(60 * 60 * 1000); // 1 hour
      
      // Strict limiter should have longer window
      expect(strictWindow).toBeGreaterThan(loginWindow);
      expect(strictWindow).toBeGreaterThan(apiWindow);
    });
  });
});