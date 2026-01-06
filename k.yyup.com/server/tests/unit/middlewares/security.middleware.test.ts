/**
 * Security Middleware 单元测试
 * 测试安全中间件的各种功能
 */

import { Request, Response, NextFunction } from 'express';
import { 
  securityHeaders, 
  ipWhitelist, 
  requestLogger 
} from '../../../src/middlewares/security.middleware';
import { testUtils } from '../../setup';

describe('Security Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = testUtils.mockRequest();
    mockResponse = testUtils.mockResponse();
    mockNext = testUtils.mockNext();
  });

  describe('securityHeaders', () => {
    it('should remove X-Powered-By header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.removeHeader).toHaveBeenCalledWith('X-Powered-By');
    });

    it('should set security headers', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
    });

    it('should set CORS headers for allowed origins', () => {
      mockRequest.headers = { origin: 'http://localhost:5173' };

      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://localhost:5173');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    });

    it('should not set CORS origin for disallowed origins', () => {
      mockRequest.headers = { origin: 'http://malicious-site.com' };

      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://malicious-site.com');
    });

    it('should handle missing origin header', () => {
      mockRequest.headers = {};

      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next middleware', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('ipWhitelist', () => {
    it('should allow access when whitelist is empty', () => {
      const middleware = ipWhitelist([]);

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow access for whitelisted IP', () => {
      (mockRequest as any).ip = '192.168.1.1';
      const middleware = ipWhitelist(['192.168.1.1', '10.0.0.1']);

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access for non-whitelisted IP', () => {
      (mockRequest as any).ip = '192.168.1.100';
      const middleware = ipWhitelist(['192.168.1.1', '10.0.0.1']);

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'IP_NOT_ALLOWED',
        message: '访问被拒绝'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing IP address', () => {
      (mockRequest as any).ip = undefined;
      const middleware = ipWhitelist(['192.168.1.1']);

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should check connection.remoteAddress as fallback', () => {
      (mockRequest as any).ip = undefined;
      mockRequest.connection = { remoteAddress: '192.168.1.1' } as any;
      const middleware = ipWhitelist(['192.168.1.1']);

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should check socket.remoteAddress as fallback', () => {
      (mockRequest as any).ip = undefined;
      mockRequest.connection = {} as any;
      mockRequest.socket = { remoteAddress: '192.168.1.1' } as any;
      const middleware = ipWhitelist(['192.168.1.1']);

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requestLogger', () => {
    let consoleSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock Date.now to control timing
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1100); // End time
    });

    afterEach(() => {
      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      jest.restoreAllMocks();
    });

    it('should log successful requests', () => {
      mockRequest.method = 'GET';
      mockRequest.originalUrl = '/api/users';
      (mockRequest as any).ip = '127.0.0.1';
      mockResponse.statusCode = 200;

      requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

      // Simulate response.send being called
      const originalSend = mockResponse.send as jest.Mock;
      originalSend('response data');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('GET /api/users - 200 - 100ms - 127.0.0.1')
      );
    });

    it('should log error requests with details', () => {
      mockRequest.method = 'POST';
      mockRequest.originalUrl = '/api/users';
      (mockRequest as any).ip = '127.0.0.1';
      mockRequest.body = { name: 'test' };
      mockRequest.query = { page: '1' };
      mockRequest.get = jest.fn().mockReturnValue('Mozilla/5.0');
      mockResponse.statusCode = 400;

      requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

      // Simulate response.send being called
      const originalSend = mockResponse.send as jest.Mock;
      originalSend('error response');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR] POST /api/users - 400',
        {
          ip: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          body: { name: 'test' },
          query: { page: '1' }
        }
      );
    });

    it('should not log body for GET requests', () => {
      mockRequest.method = 'GET';
      mockRequest.originalUrl = '/api/users';
      (mockRequest as any).ip = '127.0.0.1';
      mockRequest.query = { page: '1' };
      mockRequest.get = jest.fn().mockReturnValue('Mozilla/5.0');
      mockResponse.statusCode = 404;

      requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

      // Simulate response.send being called
      const originalSend = mockResponse.send as jest.Mock;
      originalSend('not found');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR] GET /api/users - 404',
        {
          ip: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          body: undefined,
          query: { page: '1' }
        }
      );
    });

    it('should handle empty query parameters', () => {
      mockRequest.method = 'GET';
      mockRequest.originalUrl = '/api/users';
      (mockRequest as any).ip = '127.0.0.1';
      mockRequest.query = {};
      mockRequest.get = jest.fn().mockReturnValue('Mozilla/5.0');
      mockResponse.statusCode = 500;

      requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

      // Simulate response.send being called
      const originalSend = mockResponse.send as jest.Mock;
      originalSend('server error');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR] GET /api/users - 500',
        {
          ip: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          body: undefined,
          query: undefined
        }
      );
    });

    it('should call next middleware', () => {
      requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
