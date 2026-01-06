/**
 * CORS Middleware 单元测试
 * 测试跨域资源共享中间件的各种功能
 */

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { 
  securityHeaders, 
  xssProtection 
} from '../../../src/middlewares/security.middleware';
import { testUtils } from '../../setup';

// Mock helmet
jest.mock('helmet');
const helmet = require('helmet');


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

describe('CORS Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = testUtils.mockRequest();
    mockResponse = testUtils.mockResponse();
    mockNext = testUtils.mockNext();
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.FRONTEND_URL = 'https://k.yyup.cc';
  });

  describe('securityHeaders', () => {
    it('should remove X-Powered-By header', () => {
      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.removeHeader).toHaveBeenCalledWith('X-Powered-By');
    });

    it('should set X-Content-Type-Options header', () => {
      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    });

    it('should set X-Frame-Options header to DENY', () => {
      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    });

    it('should set X-XSS-Protection header', () => {
      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
    });

    it('should set Referrer-Policy header', () => {
      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
    });

    it('should set CORS headers for localhost origin', () => {
      // Setup
      mockRequest.headers = { origin: 'http://localhost:5173' };

      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://localhost:5173');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    });

    it('should set CORS headers for production frontend URL', () => {
      // Setup
      mockRequest.headers = { origin: 'https://k.yyup.cc' };

      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'https://k.yyup.cc');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    });

    it('should set CORS headers for HTTP version of frontend URL', () => {
      // Setup
      mockRequest.headers = { origin: 'http://k.yyup.cc' };

      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://k.yyup.cc');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    });

    it('should not set CORS origin for disallowed origins', () => {
      // Setup
      mockRequest.headers = { origin: 'http://malicious-site.com' };

      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://malicious-site.com');
      // Should still set other CORS headers
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    });

    it('should handle requests without origin header', () => {
      // Setup
      mockRequest.headers = {};

      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', expect.any(String));
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle requests with undefined origin header', () => {
      // Setup
      mockRequest.headers = { origin: undefined };

      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', expect.any(String));
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle requests with null origin header', () => {
      // Setup
      mockRequest.headers = { origin: null };

      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', expect.any(String));
      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next middleware', () => {
      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle case-sensitive origin comparison', () => {
      // Setup
      mockRequest.headers = { origin: 'HTTP://LOCALHOST:5173' };

      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', 'HTTP://LOCALHOST:5173');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle origin with trailing slash', () => {
      // Setup
      mockRequest.headers = { origin: 'http://localhost:5173/' };

      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://localhost:5173/');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle origin with query parameters', () => {
      // Setup
      mockRequest.headers = { origin: 'http://localhost:5173?param=value' };

      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://localhost:5173?param=value');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle origin with port number', () => {
      // Setup
      mockRequest.headers = { origin: 'http://localhost:8080' };

      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://localhost:8080');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle origin with subdomain', () => {
      // Setup
      mockRequest.headers = { origin: 'http://sub.k.yyup.cc' };

      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://sub.k.yyup.cc');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle empty string origin', () => {
      // Setup
      mockRequest.headers = { origin: '' };

      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', '');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle numeric origin', () => {
      // Setup
      mockRequest.headers = { origin: '12345' };

      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', '12345');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle special characters in origin', () => {
      // Setup
      mockRequest.headers = { origin: 'http://test-site.com/path?param=value@#$' };

      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://test-site.com/path?param=value@#$');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle unicode characters in origin', () => {
      // Setup
      mockRequest.headers = { origin: 'http://测试站点.com' };

      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://测试站点.com');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('xssProtection', () => {
    it('should call helmet with correct CSP configuration', () => {
      // Setup
      const mockHelmetFn = jest.fn();
      helmet.mockReturnValue(mockHelmetFn);

      // Execute
      const middleware = xssProtection;

      // Assert
      expect(helmet).toHaveBeenCalledWith({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },
        crossOriginEmbedderPolicy: false,
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        }
      });
    });

    it('should disable crossOriginEmbedderPolicy', () => {
      // Setup
      const mockHelmetFn = jest.fn();
      helmet.mockReturnValue(mockHelmetFn);

      // Execute
      const middleware = xssProtection;

      // Assert
      expect(helmet).toHaveBeenCalledWith(
        expect.objectContaining({
          crossOriginEmbedderPolicy: false
        })
      );
    });

    it('should configure HSTS correctly', () => {
      // Setup
      const mockHelmetFn = jest.fn();
      helmet.mockReturnValue(mockHelmetFn);

      // Execute
      const middleware = xssProtection;

      // Assert
      expect(helmet).toHaveBeenCalledWith(
        expect.objectContaining({
          hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
          }
        })
      );
    });

    it('should have strict CSP directives', () => {
      // Setup
      const mockHelmetFn = jest.fn();
      helmet.mockReturnValue(mockHelmetFn);

      // Execute
      const middleware = xssProtection;

      // Assert
      const config = helmet.mock.calls[0][0];
      const csp = config.contentSecurityPolicy.directives;

      expect(csp.defaultSrc).toEqual(["'self'"]);
      expect(csp.scriptSrc).toEqual(["'self'", "'unsafe-inline'", "'unsafe-eval'"]);
      expect(csp.styleSrc).toEqual(["'self'", "'unsafe-inline'"]);
      expect(csp.imgSrc).toEqual(["'self'", "data:", "https:"]);
      expect(csp.connectSrc).toEqual(["'self'"]);
      expect(csp.fontSrc).toEqual(["'self'"]);
      expect(csp.objectSrc).toEqual(["'none'"]);
      expect(csp.mediaSrc).toEqual(["'self'"]);
      expect(csp.frameSrc).toEqual(["'none'"]);
    });

    it('should allow inline scripts and styles for development', () => {
      // Setup
      const mockHelmetFn = jest.fn();
      helmet.mockReturnValue(mockHelmetFn);

      // Execute
      const middleware = xssProtection;

      // Assert
      const config = helmet.mock.calls[0][0];
      const csp = config.contentSecurityPolicy.directives;

      expect(csp.scriptSrc).toContain("'unsafe-inline'");
      expect(csp.scriptSrc).toContain("'unsafe-eval'");
      expect(csp.styleSrc).toContain("'unsafe-inline'");
    });

    it('should allow data URLs and HTTPS for images', () => {
      // Setup
      const mockHelmetFn = jest.fn();
      helmet.mockReturnValue(mockHelmetFn);

      // Execute
      const middleware = xssProtection;

      // Assert
      const config = helmet.mock.calls[0][0];
      const csp = config.contentSecurityPolicy.directives;

      expect(csp.imgSrc).toContain("data:");
      expect(csp.imgSrc).toContain("https:");
    });

    it('should restrict frames and objects for security', () => {
      // Setup
      const mockHelmetFn = jest.fn();
      helmet.mockReturnValue(mockHelmetFn);

      // Execute
      const middleware = xssProtection;

      // Assert
      const config = helmet.mock.calls[0][0];
      const csp = config.contentSecurityPolicy.directives;

      expect(csp.frameSrc).toEqual(["'none'"]);
      expect(csp.objectSrc).toEqual(["'none'"]);
    });

    it('should return helmet middleware function', () => {
      // Setup
      const mockHelmetFn = jest.fn();
      helmet.mockReturnValue(mockHelmetFn);

      // Execute
      const middleware = xssProtection;

      // Assert
      expect(middleware).toBe(mockHelmetFn);
    });
  });

  describe('CORS Security Integration', () => {
    it('should work together with security headers and XSS protection', () => {
      // Setup
      const mockHelmetFn = jest.fn();
      helmet.mockReturnValue(mockHelmetFn);
      
      mockRequest.headers = { origin: 'http://localhost:5173' };

      // Execute security headers
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Execute XSS protection
      const xssMiddleware = xssProtection;

      // Assert
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://localhost:5173');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(helmet).toHaveBeenCalled();
    });

    it('should maintain security when CORS is disabled for certain origins', () => {
      // Setup
      mockRequest.headers = { origin: 'http://malicious-site.com' };

      // Execute
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://malicious-site.com');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
    });

    it('should handle multiple middleware calls on same request', () => {
      // Setup
      mockRequest.headers = { origin: 'http://localhost:5173' };

      // Execute multiple times
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.removeHeader).toHaveBeenCalledTimes(2);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://localhost:5173');
      expect(mockNext).toHaveBeenCalledTimes(2);
    });
  });
});