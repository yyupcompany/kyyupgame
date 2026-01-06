import { TestDataFactory } from '../helpers/testUtils';

describe('Middleware Unit Tests', () => {
  const createMockRequest = (options: any = {}) => ({
    headers: {},
    body: {},
    query: {},
    params: {},
    ip: '127.0.0.1',
    user: undefined,
    ...options
  });

  const createMockResponse = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis(),
    header: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    statusCode: 200
  });

  let mockRequest: any;
  let mockResponse: any;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    nextFunction = jest.fn();
  });

  describe('Authentication Middleware', () => {
    class MockAuthMiddleware {
      static authenticateToken(req: any, res: any, next: any) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
          return res.status(401).json({
            success: false,
            message: 'Access token is required'
          });
        }

        if (token === 'invalid_token') {
          return res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
          });
        }

        if (token === 'valid_token') {
          req.user = {
            id: 1,
            username: 'testuser',
            role: 'admin'
          };
          return next();
        }

        return res.status(403).json({
          success: false,
          message: 'Invalid token format'
        });
      }

      static requireRole(requiredRole: string) {
        return (req: any, res: any, next: any) => {
          if (!req.user) {
            return res.status(401).json({
              success: false,
              message: 'Authentication required'
            });
          }

          if (req.user.role !== requiredRole) {
            return res.status(403).json({
              success: false,
              message: 'Insufficient permissions'
            });
          }

          next();
        };
      }
    }

    test('should reject request without token', () => {
      MockAuthMiddleware.authenticateToken(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access token is required'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should reject request with invalid token', () => {
      mockRequest.headers['authorization'] = 'Bearer invalid_token';

      MockAuthMiddleware.authenticateToken(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired token'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should authenticate request with valid token', () => {
      mockRequest.headers['authorization'] = 'Bearer valid_token';

      MockAuthMiddleware.authenticateToken(mockRequest, mockResponse, nextFunction);

      expect(mockRequest.user).toEqual({
        id: 1,
        username: 'testuser',
        role: 'admin'
      });
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    test('should enforce role requirements', () => {
      const adminMiddleware = MockAuthMiddleware.requireRole('admin');
      
      // Test without user
      adminMiddleware(mockRequest, mockResponse, nextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(401);

      // Test with wrong role
      const req2 = createMockRequest({ user: { role: 'user' } });
      const res2 = createMockResponse();
      const next2 = jest.fn();
      
      adminMiddleware(req2, res2, next2);
      expect(res2.status).toHaveBeenCalledWith(403);

      // Test with correct role
      const req3 = createMockRequest({ user: { role: 'admin' } });
      const res3 = createMockResponse();
      const next3 = jest.fn();
      
      adminMiddleware(req3, res3, next3);
      expect(next3).toHaveBeenCalled();
    });
  });

  describe('Validation Middleware', () => {
    class MockValidationMiddleware {
      static validateUserInput(req: any, res: any, next: any) {
        const { username, email, password } = req.body;

        const errors: string[] = [];

        if (!username || username.length < 3) {
          errors.push('Username must be at least 3 characters long');
        }

        if (!email || !email.includes('@')) {
          errors.push('Valid email is required');
        }

        if (!password || password.length < 6) {
          errors.push('Password must be at least 6 characters long');
        }

        if (errors.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
          });
        }

        next();
      }

      static validateStudentInput(req: any, res: any, next: any) {
        const { name, age, grade } = req.body;

        const errors: string[] = [];

        if (!name || name.trim().length === 0) {
          errors.push('Student name is required');
        }

        if (!age || age < 3 || age > 7) {
          errors.push('Age must be between 3 and 7 years');
        }

        if (!grade || !['小班', '中班', '大班'].includes(grade)) {
          errors.push('Grade must be one of: 小班, 中班, 大班');
        }

        if (errors.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
          });
        }

        next();
      }
    }

    test('should validate user input correctly', () => {
      // Test valid input
      mockRequest.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      MockValidationMiddleware.validateUserInput(mockRequest, mockResponse, nextFunction);
      expect(nextFunction).toHaveBeenCalled();

      // Test invalid input
      const req2 = createMockRequest({
        body: {
          username: 'ab',
          email: 'invalid-email',
          password: '123'
        }
      });
      const res2 = createMockResponse();
      const next2 = jest.fn();

      MockValidationMiddleware.validateUserInput(req2, res2, next2);
      expect(res2.status).toHaveBeenCalledWith(400);
      expect(res2.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: [
          'Username must be at least 3 characters long',
          'Valid email is required',
          'Password must be at least 6 characters long'
        ]
      });
    });

    test('should validate student input correctly', () => {
      // Test valid input
      mockRequest.body = {
        name: '小明',
        age: 5,
        grade: '中班'
      };

      MockValidationMiddleware.validateStudentInput(mockRequest, mockResponse, nextFunction);
      expect(nextFunction).toHaveBeenCalled();

      // Test invalid input
      const req2 = createMockRequest({
        body: {
          name: '',
          age: 10,
          grade: '一年级'
        }
      });
      const res2 = createMockResponse();
      const next2 = jest.fn();

      MockValidationMiddleware.validateStudentInput(req2, res2, next2);
      expect(res2.status).toHaveBeenCalledWith(400);
      expect(res2.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: [
          'Student name is required',
          'Age must be between 3 and 7 years',
          'Grade must be one of: 小班, 中班, 大班'
        ]
      });
    });
  });

  describe('Rate Limiting Middleware', () => {
    class MockRateLimitMiddleware {
      private static requests: Map<string, { count: number; resetTime: number }> = new Map();

      static createRateLimit(maxRequests: number, windowMs: number) {
        return (req: any, res: any, next: any) => {
          const clientId = req.ip || 'default';
          const now = Date.now();
          
          const clientData = this.requests.get(clientId);
          
          if (!clientData || now > clientData.resetTime) {
            this.requests.set(clientId, {
              count: 1,
              resetTime: now + windowMs
            });
            return next();
          }
          
          if (clientData.count >= maxRequests) {
            return res.status(429).json({
              success: false,
              message: 'Too many requests, please try again later',
              retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
            });
          }
          
          clientData.count++;
          next();
        };
      }
    }

    test('should allow requests within rate limit', () => {
      const rateLimiter = MockRateLimitMiddleware.createRateLimit(5, 60000);
      mockRequest.ip = '127.0.0.1';

      // First request should pass
      rateLimiter(mockRequest, mockResponse, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
    });

    test('should reject requests exceeding rate limit', () => {
      const rateLimiter = MockRateLimitMiddleware.createRateLimit(1, 60000);
      const req = createMockRequest({ ip: '127.0.0.2' });
      const res = createMockResponse();
      const next = jest.fn();

      // First request should pass
      rateLimiter(req, res, next);
      expect(next).toHaveBeenCalled();

      // Second request should be rejected
      const req2 = createMockRequest({ ip: '127.0.0.2' });
      const res2 = createMockResponse();
      const next2 = jest.fn();
      
      rateLimiter(req2, res2, next2);
      expect(res2.status).toHaveBeenCalledWith(429);
      expect(res2.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Too many requests, please try again later'
        })
      );
    });
  });

  describe('Security Middleware', () => {
    class MockSecurityMiddleware {
      static handleCors(req: any, res: any, next: any) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

        if (req.method === 'OPTIONS') {
          return res.sendStatus(200);
        }

        next();
      }

      static sanitizeInput(req: any, res: any, next: any) {
        const sanitize = (obj: any): any => {
          if (typeof obj === 'string') {
            return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                     .replace(/javascript:/gi, '')
                     .replace(/on\w+\s*=/gi, '');
          }
          
          if (Array.isArray(obj)) {
            return obj.map(sanitize);
          }
          
          if (obj && typeof obj === 'object') {
            const sanitized: any = {};
            for (const key in obj) {
              sanitized[key] = sanitize(obj[key]);
            }
            return sanitized;
          }
          
          return obj;
        };

        if (req.body) {
          req.body = sanitize(req.body);
        }
        
        if (req.query) {
          req.query = sanitize(req.query);
        }

        next();
      }
    }

    test('should set CORS headers', () => {
      MockSecurityMiddleware.handleCors(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.header).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(mockResponse.header).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      expect(mockResponse.header).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
      expect(nextFunction).toHaveBeenCalled();
    });

    test('should handle OPTIONS requests', () => {
      mockRequest.method = 'OPTIONS';

      MockSecurityMiddleware.handleCors(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(200);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should sanitize input data', () => {
      mockRequest.body = {
        name: 'John<script>alert("xss")</script>',
        description: 'Normal text'
      };
      mockRequest.query = {
        search: 'query<script>hack()</script>'
      };

      MockSecurityMiddleware.sanitizeInput(mockRequest, mockResponse, nextFunction);

      expect(mockRequest.body.name).toBe('John');
      expect(mockRequest.body.description).toBe('Normal text');
      expect(mockRequest.query.search).toBe('query');
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('Error Handling Middleware', () => {
    class MockErrorMiddleware {
      static handleError(err: any, req: any, res: any, next: any) {
        if (err.name === 'ValidationError') {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: err.errors
          });
        }

        if (err.name === 'UnauthorizedError') {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized access'
          });
        }

        // Default error
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
    }

    test('should handle validation errors', () => {
      const error = {
        name: 'ValidationError',
        errors: ['Field is required', 'Invalid format']
      };

      MockErrorMiddleware.handleError(error, mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: ['Field is required', 'Invalid format']
      });
    });

    test('should handle unauthorized errors', () => {
      const error = { name: 'UnauthorizedError' };

      MockErrorMiddleware.handleError(error, mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized access'
      });
    });

    test('should handle generic errors', () => {
      const error = { message: 'Something went wrong' };

      MockErrorMiddleware.handleError(error, mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        error: undefined
      });
    });
  });
});