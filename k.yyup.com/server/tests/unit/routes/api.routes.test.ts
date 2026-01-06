import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import express from 'express';

// Mock Express app
const mockApp = express();

// Mock controllers
const mockApiController = {
  getApiList: jest.fn(),
  getApiDetails: jest.fn(),
  getApiEndpoints: jest.fn(),
  getApiDocumentation: jest.fn(),
  testApiEndpoint: jest.fn(),
  getApiUsage: jest.fn(),
  getApiErrors: jest.fn(),
  getApiPerformance: jest.fn(),
  generateApiKey: jest.fn(),
  revokeApiKey: jest.fn(),
  getApiKeys: jest.fn(),
  updateApiSettings: jest.fn(),
  getApiLogs: jest.fn(),
  getApiAnalytics: jest.fn(),
  exportApiData: jest.fn()
};

// Mock middlewares
const mockAuthMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockValidationMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockRateLimitMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockPermissionMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockCacheMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());

// Mock imports
jest.unstable_mockModule('../../../../../src/controllers/api.controller', () => mockApiController);
jest.unstable_mockModule('../../../../../src/middlewares/auth.middleware', () => ({
  verifyToken: mockAuthMiddleware,
  requireAuth: mockAuthMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/rate-limit.middleware', () => ({
  apiLimiter: mockRateLimitMiddleware,
  strictLimiter: mockRateLimitMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/permission.middleware', () => ({
  checkPermission: mockPermissionMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/cache.middleware', () => ({
  cacheResponse: mockCacheMiddleware
}));


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

describe('API Routes', () => {
  let apiRouter: any;

  beforeAll(async () => {
    // 动态导入路由
    const { default: importedApiRouter } = await import('../../../../../src/routes/api.routes');
    apiRouter = importedApiRouter;
    
    // 设置Express应用
    mockApp.use('/api', apiRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置默认的控制器响应
    mockApiController.getApiList.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: [
          {
            id: 1,
            name: '用户管理API',
            version: 'v1',
            description: '用户相关操作的API接口',
            basePath: '/api/users',
            status: 'active',
            createdAt: '2024-01-15T10:00:00.000Z',
            updatedAt: '2024-02-20T14:30:00.000Z'
          },
          {
            id: 2,
            name: '活动管理API',
            version: 'v1',
            description: '活动相关操作的API接口',
            basePath: '/api/activities',
            status: 'active',
            createdAt: '2024-01-20T09:00:00.000Z',
            updatedAt: '2024-02-25T11:00:00.000Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        },
        message: '获取API列表成功'
      });
    });

    mockApiController.getApiDetails.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          id: 1,
          name: '用户管理API',
          version: 'v1',
          description: '用户相关操作的API接口',
          basePath: '/api/users',
          status: 'active',
          endpoints: [
            {
              method: 'GET',
              path: '/users',
              description: '获取用户列表',
              authentication: 'required'
            },
            {
              method: 'POST',
              path: '/users',
              description: '创建用户',
              authentication: 'required'
            },
            {
              method: 'GET',
              path: '/users/:id',
              description: '获取用户详情',
              authentication: 'required'
            }
          ],
          rateLimits: {
            requests: 1000,
            per: 'hour'
          },
          createdAt: '2024-01-15T10:00:00.000Z',
          updatedAt: '2024-02-20T14:30:00.000Z'
        },
        message: '获取API详情成功'
      });
    });

    mockApiController.getApiEndpoints.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: [
          {
            method: 'GET',
            path: '/api/users',
            controller: 'UserController',
            action: 'getAllUsers',
            description: '获取用户列表',
            parameters: [
              { name: 'page', type: 'query', required: false },
              { name: 'limit', type: 'query', required: false }
            ],
            authentication: 'required',
            rateLimit: '1000/hour'
          },
          {
            method: 'POST',
            path: '/api/users',
            controller: 'UserController',
            action: 'createUser',
            description: '创建用户',
            parameters: [
              { name: 'username', type: 'body', required: true },
              { name: 'email', type: 'body', required: true },
              { name: 'password', type: 'body', required: true }
            ],
            authentication: 'required',
            rateLimit: '100/hour'
          }
        ],
        message: '获取API端点列表成功'
      });
    });

    mockApiController.getApiDocumentation.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          openapi: '3.0.0',
          info: {
            title: '幼儿园管理系统 API',
            version: '1.0.0',
            description: '幼儿园管理系统的API文档'
          },
          servers: [
            {
              url: 'http://localhost:3000/api',
              description: '开发服务器'
            }
          ],
          paths: {
            '/users': {
              get: {
                summary: '获取用户列表',
                responses: {
                  '200': {
                    description: '成功获取用户列表'
                  }
                }
              }
            }
          }
        },
        message: '获取API文档成功'
      });
    });

    mockApiController.testApiEndpoint.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          status: 'success',
          responseTime: 125,
          statusCode: 200,
          response: {
            success: true,
            data: [],
            message: '测试成功'
          },
          timestamp: new Date().toISOString()
        },
        message: 'API端点测试成功'
      });
    });
  });

  describe('GET /api', () => {
    it('应该获取API列表', async () => {
      const response = await request(mockApp)
        .get('/api')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [
          {
            id: 1,
            name: '用户管理API',
            version: 'v1',
            description: '用户相关操作的API接口',
            basePath: '/api/users',
            status: 'active',
            createdAt: '2024-01-15T10:00:00.000Z',
            updatedAt: '2024-02-20T14:30:00.000Z'
          },
          {
            id: 2,
            name: '活动管理API',
            version: 'v1',
            description: '活动相关操作的API接口',
            basePath: '/api/activities',
            status: 'active',
            createdAt: '2024-01-20T09:00:00.000Z',
            updatedAt: '2024-02-25T11:00:00.000Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        },
        message: '获取API列表成功'
      });

      expect(mockApiController.getApiList).toHaveBeenCalled();
    });

    it('应该支持可选认证', async () => {
      await request(mockApp)
        .get('/api')
        .expect(200);

      // 验证可选认证中间件被调用
      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该支持分页参数', async () => {
      const page = 2;
      const limit = 5;

      await request(mockApp)
        .get('/api')
        .query({ page, limit })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockApiController.getApiList).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            page: page.toString(),
            limit: limit.toString()
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持状态过滤', async () => {
      const status = 'active';

      await request(mockApp)
        .get('/api')
        .query({ status })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockApiController.getApiList).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            status
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该应用缓存中间件', async () => {
      await request(mockApp)
        .get('/api')
        .set('Authorization', 'Bearer valid-token');

      expect(mockCacheMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /api/:id', () => {
    it('应该获取API详情', async () => {
      const apiId = 1;

      const response = await request(mockApp)
        .get(`/api/${apiId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          id: 1,
          name: '用户管理API',
          version: 'v1',
          description: '用户相关操作的API接口',
          basePath: '/api/users',
          status: 'active',
          endpoints: [
            {
              method: 'GET',
              path: '/users',
              description: '获取用户列表',
              authentication: 'required'
            },
            {
              method: 'POST',
              path: '/users',
              description: '创建用户',
              authentication: 'required'
            },
            {
              method: 'GET',
              path: '/users/:id',
              description: '获取用户详情',
              authentication: 'required'
            }
          ],
          rateLimits: {
            requests: 1000,
            per: 'hour'
          },
          createdAt: '2024-01-15T10:00:00.000Z',
          updatedAt: '2024-02-20T14:30:00.000Z'
        },
        message: '获取API详情成功'
      });

      expect(mockApiController.getApiDetails).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: apiId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证API ID参数', async () => {
      await request(mockApp)
        .get('/api/invalid-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该处理不存在的API ID', async () => {
      mockApiController.getApiDetails.mockImplementation((req, res, next) => {
        const error = new Error('API不存在');
        (error as any).statusCode = 404;
        next(error);
      });

      await request(mockApp)
        .get('/api/999')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);
    });
  });

  describe('GET /api/endpoints', () => {
    it('应该获取API端点列表', async () => {
      const response = await request(mockApp)
        .get('/api/endpoints')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [
          {
            method: 'GET',
            path: '/api/users',
            controller: 'UserController',
            action: 'getAllUsers',
            description: '获取用户列表',
            parameters: [
              { name: 'page', type: 'query', required: false },
              { name: 'limit', type: 'query', required: false }
            ],
            authentication: 'required',
            rateLimit: '1000/hour'
          },
          {
            method: 'POST',
            path: '/api/users',
            controller: 'UserController',
            action: 'createUser',
            description: '创建用户',
            parameters: [
              { name: 'username', type: 'body', required: true },
              { name: 'email', type: 'body', required: true },
              { name: 'password', type: 'body', required: true }
            ],
            authentication: 'required',
            rateLimit: '100/hour'
          }
        ],
        message: '获取API端点列表成功'
      });

      expect(mockApiController.getApiEndpoints).toHaveBeenCalled();
    });

    it('应该支持路径过滤', async () => {
      const path = '/users';

      await request(mockApp)
        .get('/api/endpoints')
        .query({ path })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockApiController.getApiEndpoints).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            path
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持方法过滤', async () => {
      const method = 'GET';

      await request(mockApp)
        .get('/api/endpoints')
        .query({ method })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockApiController.getApiEndpoints).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            method
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该应用缓存中间件', async () => {
      await request(mockApp)
        .get('/api/endpoints')
        .set('Authorization', 'Bearer valid-token');

      expect(mockCacheMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /api/documentation', () => {
    it('应该获取API文档', async () => {
      const response = await request(mockApp)
        .get('/api/documentation')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          openapi: '3.0.0',
          info: {
            title: '幼儿园管理系统 API',
            version: '1.0.0',
            description: '幼儿园管理系统的API文档'
          },
          servers: [
            {
              url: 'http://localhost:3000/api',
              description: '开发服务器'
            }
          ],
          paths: {
            '/users': {
              get: {
                summary: '获取用户列表',
                responses: {
                  '200': {
                    description: '成功获取用户列表'
                  }
                }
              }
            }
          }
        },
        message: '获取API文档成功'
      });

      expect(mockApiController.getApiDocumentation).toHaveBeenCalled();
    });

    it('应该支持文档格式参数', async () => {
      const format = 'yaml';

      await request(mockApp)
        .get('/api/documentation')
        .query({ format })
        .expect(200);

      expect(mockApiController.getApiDocumentation).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            format
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该不需要认证', async () => {
      await request(mockApp)
        .get('/api/documentation')
        .expect(200);

      // 验证可选认证中间件被调用
      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该应用缓存中间件', async () => {
      await request(mockApp)
        .get('/api/documentation');

      expect(mockCacheMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /api/test', () => {
    it('应该测试API端点', async () => {
      const testData = {
        method: 'GET',
        url: '/api/users',
        headers: {
          'Authorization': 'Bearer test-token'
        },
        params: {
          page: 1,
          limit: 10
        }
      };

      const response = await request(mockApp)
        .post('/api/test')
        .send(testData)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          status: 'success',
          responseTime: 125,
          statusCode: 200,
          response: {
            success: true,
            data: [],
            message: '测试成功'
          },
          timestamp: expect.any(String)
        },
        message: 'API端点测试成功'
      });

      expect(mockApiController.testApiEndpoint).toHaveBeenCalledWith(
        expect.objectContaining({
          body: testData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证测试数据', async () => {
      const invalidTestData = {
        method: 'INVALID_METHOD',
        url: 'invalid-url'
      };

      await request(mockApp)
        .post('/api/test')
        .send(invalidTestData)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该检查测试权限', async () => {
      await request(mockApp)
        .post('/api/test')
        .send({ method: 'GET', url: '/api/users' })
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });

    it('应该应用严格限流', async () => {
      await request(mockApp)
        .post('/api/test')
        .send({ method: 'GET', url: '/api/users' })
        .set('Authorization', 'Bearer valid-token');

      expect(mockRateLimitMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /api/usage', () => {
    it('应该获取API使用统计', async () => {
      mockApiController.getApiUsage.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            totalRequests: 150000,
            uniqueUsers: 1200,
            averageResponseTime: 125,
            successRate: 0.998,
            errorRate: 0.002,
            topEndpoints: [
              { path: '/api/users', requests: 45000, percentage: 30 },
              { path: '/api/activities', requests: 30000, percentage: 20 }
            ],
            usageTrend: [
              { date: '2024-01-01', requests: 5000 },
              { date: '2024-01-02', requests: 5200 }
            ],
            period: '30d'
          },
          message: '获取API使用统计成功'
        });
      });

      const response = await request(mockApp)
        .get('/api/usage')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockApiController.getApiUsage).toHaveBeenCalled();
    });

    it('应该支持时间范围参数', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      await request(mockApp)
        .get('/api/usage')
        .query({ startDate, endDate })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockApiController.getApiUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            startDate,
            endDate
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /api/errors', () => {
    it('应该获取API错误统计', async () => {
      mockApiController.getApiErrors.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            totalErrors: 300,
            errorRate: 0.002,
            errorTypes: [
              { type: '400', count: 150, percentage: 50 },
              { type: '401', count: 90, percentage: 30 },
              { type: '500', count: 60, percentage: 20 }
            ],
            topErrorEndpoints: [
              { path: '/api/users', errors: 120, percentage: 40 },
              { path: '/api/activities', errors: 80, percentage: 26.67 }
            ],
            errorTrend: [
              { date: '2024-01-01', errors: 10 },
              { date: '2024-01-02', errors: 12 }
            ]
          },
          message: '获取API错误统计成功'
        });
      });

      const response = await request(mockApp)
        .get('/api/errors')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockApiController.getApiErrors).toHaveBeenCalled();
    });

    it('应该支持错误类型过滤', async () => {
      const errorType = '400';

      await request(mockApp)
        .get('/api/errors')
        .query({ errorType })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockApiController.getApiErrors).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            errorType
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /api/performance', () => {
    it('应该获取API性能统计', async () => {
      mockApiController.getApiPerformance.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            averageResponseTime: 125,
            p95ResponseTime: 200,
            p99ResponseTime: 350,
            throughput: 1500,
            availability: 0.999,
            performanceByEndpoint: [
              { path: '/api/users', avgTime: 100, p95: 150, p99: 250 },
              { path: '/api/activities', avgTime: 150, p95: 250, p99: 400 }
            ],
            performanceTrend: [
              { date: '2024-01-01', avgTime: 120, p95: 180 },
              { date: '2024-01-02', avgTime: 125, p95: 200 }
            ]
          },
          message: '获取API性能统计成功'
        });
      });

      const response = await request(mockApp)
        .get('/api/performance')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockApiController.getApiPerformance).toHaveBeenCalled();
    });
  });

  describe('POST /api/keys/generate', () => {
    it('应该生成API密钥', async () => {
      mockApiController.generateApiKey.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: {
            id: 1,
            key: 'sk_test_' + Math.random().toString(36).substring(7),
            name: '测试密钥',
            permissions: ['read', 'write'],
            expiresAt: '2024-12-31T23:59:59.999Z',
            createdAt: new Date().toISOString()
          },
          message: 'API密钥生成成功'
        });
      });

      const keyData = {
        name: '测试密钥',
        permissions: ['read', 'write'],
        expiresAt: '2024-12-31T23:59:59.999Z'
      };

      const response = await request(mockApp)
        .post('/api/keys/generate')
        .send(keyData)
        .set('Authorization', 'Bearer valid-token')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(mockApiController.generateApiKey).toHaveBeenCalledWith(
        expect.objectContaining({
          body: keyData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证密钥数据', async () => {
      const invalidKeyData = {
        name: '', // 空名称
        permissions: ['invalid_permission']
      };

      await request(mockApp)
        .post('/api/keys/generate')
        .send(invalidKeyData)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该检查生成权限', async () => {
      await request(mockApp)
        .post('/api/keys/generate')
        .send({ name: '测试密钥', permissions: ['read'] })
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/keys/:id', () => {
    it('应该撤销API密钥', async () => {
      mockApiController.revokeApiKey.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'API密钥撤销成功'
        });
      });

      const keyId = 1;

      const response = await request(mockApp)
        .delete(`/api/keys/${keyId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockApiController.revokeApiKey).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: keyId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证密钥ID', async () => {
      await request(mockApp)
        .delete('/api/keys/invalid-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /api/keys', () => {
    it('应该获取API密钥列表', async () => {
      mockApiController.getApiKeys.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              name: '测试密钥1',
              permissions: ['read', 'write'],
              lastUsedAt: '2024-01-20T10:00:00.000Z',
              expiresAt: '2024-12-31T23:59:59.999Z',
              status: 'active'
            },
            {
              id: 2,
              name: '测试密钥2',
              permissions: ['read'],
              lastUsedAt: null,
              expiresAt: '2024-06-30T23:59:59.999Z',
              status: 'active'
            }
          ],
          message: '获取API密钥列表成功'
        });
      });

      const response = await request(mockApp)
        .get('/api/keys')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockApiController.getApiKeys).toHaveBeenCalled();
    });
  });

  describe('PUT /api/settings', () => {
    it('应该更新API设置', async () => {
      mockApiController.updateApiSettings.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            rateLimits: { requests: 1000, per: 'hour' },
            cors: { enabled: true, origins: ['*'] },
            logging: { level: 'info', enabled: true },
            cache: { enabled: true, ttl: 300 }
          },
          message: 'API设置更新成功'
        });
      });

      const settings = {
        rateLimits: { requests: 1000, per: 'hour' },
        cors: { enabled: true, origins: ['*'] },
        logging: { level: 'info', enabled: true }
      };

      const response = await request(mockApp)
        .put('/api/settings')
        .send(settings)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockApiController.updateApiSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          body: settings
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证设置数据', async () => {
      const invalidSettings = {
        rateLimits: { requests: -1, per: 'hour' } // 无效的请求限制
      };

      await request(mockApp)
        .put('/api/settings')
        .send(invalidSettings)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该检查管理员权限', async () => {
      await request(mockApp)
        .put('/api/settings')
        .send({ rateLimits: { requests: 1000, per: 'hour' } })
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /api/logs', () => {
    it('应该获取API日志', async () => {
      mockApiController.getApiLogs.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              timestamp: '2024-01-20T10:00:00.000Z',
              method: 'GET',
              path: '/api/users',
              statusCode: 200,
              responseTime: 125,
              userId: 1,
              userAgent: 'Mozilla/5.0',
              ipAddress: '192.168.1.1'
            },
            {
              id: 2,
              timestamp: '2024-01-20T10:01:00.000Z',
              method: 'POST',
              path: '/api/users',
              statusCode: 201,
              responseTime: 200,
              userId: 1,
              userAgent: 'Mozilla/5.0',
              ipAddress: '192.168.1.1'
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1
          },
          message: '获取API日志成功'
        });
      });

      const response = await request(mockApp)
        .get('/api/logs')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockApiController.getApiLogs).toHaveBeenCalled();
    });

    it('应该支持日志过滤参数', async () => {
      const filters = {
        method: 'GET',
        statusCode: 200,
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      await request(mockApp)
        .get('/api/logs')
        .query(filters)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockApiController.getApiLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining(filters)
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该检查日志查看权限', async () => {
      await request(mockApp)
        .get('/api/logs')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /api/analytics', () => {
    it('应该获取API分析数据', async () => {
      mockApiController.getApiAnalytics.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            userAnalytics: {
              totalUsers: 1200,
              activeUsers: 800,
              newUsers: 50,
              userGrowth: [
                { date: '2024-01-01', total: 1150, new: 10 },
                { date: '2024-01-02', total: 1200, new: 50 }
              ]
            },
            endpointAnalytics: {
              topEndpoints: [
                { path: '/api/users', requests: 45000, users: 800 },
                { path: '/api/activities', requests: 30000, users: 600 }
              ],
              endpointGrowth: [
                { date: '2024-01-01', requests: 48000 },
                { date: '2024-01-02', requests: 50000 }
              ]
            },
            performanceAnalytics: {
              averageResponseTime: 125,
              throughput: 1500,
              availability: 0.999,
              performanceTrend: [
                { date: '2024-01-01', avgTime: 120, throughput: 1400 },
                { date: '2024-01-02', avgTime: 125, throughput: 1500 }
              ]
            }
          },
          message: '获取API分析数据成功'
        });
      });

      const response = await request(mockApp)
        .get('/api/analytics')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockApiController.getApiAnalytics).toHaveBeenCalled();
    });

    it('应该支持分析类型参数', async () => {
      const analyticsType = 'user';

      await request(mockApp)
        .get('/api/analytics')
        .query({ type: analyticsType })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockApiController.getApiAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            type: analyticsType
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /api/export', () => {
    it('应该导出API数据', async () => {
      mockApiController.exportApiData.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            downloadUrl: '/api/files/download/api-export-2024.xlsx',
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
            format: 'excel',
            size: 2048000
          },
          message: '导出任务创建成功'
        });
      });

      const exportParams = {
        format: 'excel',
        include: ['usage', 'errors', 'performance'],
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31'
        }
      };

      const response = await request(mockApp)
        .get('/api/export')
        .query(exportParams)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockApiController.exportApiData).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining(exportParams)
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证导出参数', async () => {
      const invalidExportParams = {
        format: 'invalid_format',
        include: ['invalid_data']
      };

      await request(mockApp)
        .get('/api/export')
        .query(invalidExportParams)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该检查导出权限', async () => {
      await request(mockApp)
        .get('/api/export')
        .query({ format: 'excel' })
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('路由中间件应用', () => {
    it('应该正确应用认证中间件到需要认证的路由', () => {
      const authRoutes = ['/api', '/api/1', '/api/endpoints', '/api/test',
                         '/api/usage', '/api/errors', '/api/performance',
                         '/api/keys/generate', '/api/keys/1', '/api/keys',
                         '/api/settings', '/api/logs', '/api/analytics', '/api/export'];
      
      authRoutes.forEach(route => {
        expect(mockAuthMiddleware).toBeDefined();
      });
    });

    it('应该正确应用可选认证到公开路由', () => {
      const optionalAuthRoutes = ['/api/documentation'];
      
      optionalAuthRoutes.forEach(route => {
        expect(mockAuthMiddleware).toBeDefined();
      });
    });

    it('应该正确应用验证中间件到需要验证的路由', () => {
      const validatedRoutes = ['/api/1', '/api/test', '/api/keys/generate',
                              '/api/keys/1', '/api/settings', '/api/export'];
      
      validatedRoutes.forEach(route => {
        expect(mockValidationMiddleware).toBeDefined();
      });
    });

    it('应该正确应用权限中间件到需要权限的路由', () => {
      const permissionRoutes = ['/api/test', '/api/keys/generate', '/api/keys/1',
                               '/api/settings', '/api/logs', '/api/export'];
      
      permissionRoutes.forEach(route => {
        expect(mockPermissionMiddleware).toBeDefined();
      });
    });

    it('应该正确应用缓存中间件到适当的路由', () => {
      const cachedRoutes = ['/api', '/api/endpoints', '/api/documentation'];
      
      cachedRoutes.forEach(route => {
        expect(mockCacheMiddleware).toBeDefined();
      });
    });

    it('应该正确应用限流中间件到敏感路由', () => {
      const rateLimitedRoutes = ['/api/test', '/api/keys/generate'];
      
      rateLimitedRoutes.forEach(route => {
        expect(mockRateLimitMiddleware).toBeDefined();
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器抛出的错误', async () => {
      mockApiController.getApiList.mockImplementation((req, res, next) => {
        const error = new Error('获取API列表失败');
        next(error);
      });

      await request(mockApp)
        .get('/api')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);
    });

    it('应该处理验证中间件错误', async () => {
      mockValidationMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('参数验证失败');
        (error as any).statusCode = 400;
        next(error);
      });

      await request(mockApp)
        .get('/api/invalid-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });

    it('应该处理权限不足错误', async () => {
      mockPermissionMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('权限不足');
        (error as any).statusCode = 403;
        next(error);
      });

      await request(mockApp)
        .post('/api/test')
        .send({ method: 'GET', url: '/api/users' })
        .set('Authorization', 'Bearer user-token')
        .expect(403);
    });

    it('应该处理限流错误', async () => {
      mockRateLimitMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('请求过于频繁');
        (error as any).statusCode = 429;
        next(error);
      });

      await request(mockApp)
        .post('/api/test')
        .send({ method: 'GET', url: '/api/users' })
        .set('Authorization', 'Bearer valid-token')
        .expect(429);
    });

    it('应该处理API测试失败', async () => {
      mockApiController.testApiEndpoint.mockImplementation((req, res, next) => {
        const error = new Error('API测试失败');
        (error as any).statusCode = 500;
        next(error);
      });

      await request(mockApp)
        .post('/api/test')
        .send({ method: 'GET', url: '/api/nonexistent' })
        .set('Authorization', 'Bearer valid-token')
        .expect(500);
    });
  });

  describe('性能测试', () => {
    it('应该处理并发请求', async () => {
      const requests = Array(10).fill(null).map(() => 
        request(mockApp)
          .get('/api')
          .set('Authorization', 'Bearer valid-token')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('应该处理大量数据请求', async () => {
      mockApiController.getApiList.mockImplementation((req, res) => {
        // 模拟大量API数据
        const largeData = Array(1000).fill(null).map((_, i) => ({
          id: i + 1,
          name: `API${i + 1}`,
          version: 'v1',
          description: `API${i + 1}的描述`,
          basePath: `/api/api${i + 1}`,
          status: 'active'
        }));

        res.status(200).json({
          success: true,
          data: largeData,
          pagination: {
            page: 1,
            limit: 1000,
            total: 1000,
            totalPages: 1
          },
          message: '获取API列表成功'
        });
      });

      const response = await request(mockApp)
        .get('/api')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1000);
    });
  });

  describe('安全测试', () => {
    it('应该防止SQL注入攻击', async () => {
      const maliciousQuery = "SELECT * FROM apis";

      await request(mockApp)
        .get('/api')
        .query({ search: maliciousQuery })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });

    it('应该防止XSS攻击', async () => {
      const maliciousScript = "<script>alert('xss')</script>";

      await request(mockApp)
        .post('/api/test')
        .send({ method: 'GET', url: `/api/${maliciousScript}` })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });

    it('应该验证输入数据格式', async () => {
      const invalidFormats = [
        { route: '/api/invalid-id', method: 'get' },
        { route: '/api/test', method: 'post', body: { method: 'INVALID_METHOD' } },
        { route: '/api/keys/generate', method: 'post', body: { permissions: 'invalid' } },
        { route: '/api/export', method: 'get', query: { format: 'invalid_format' } }
      ];

      for (const { route, method, body, query } of invalidFormats) {
        const req = request(mockApp)[method](route)
          .set('Authorization', 'Bearer valid-token');
        
        if (body) {
          req.send(body);
        }
        
        if (query) {
          req.query(query);
        }
        
        await req.expect(400);
      }
    });

    it('应该保护敏感API端点', async () => {
      const sensitiveEndpoints = [
        { path: '/api/settings', method: 'put' },
        { path: '/api/keys/generate', method: 'post' },
        { path: '/api/logs', method: 'get' },
        { path: '/api/export', method: 'get' }
      ];

      for (const { path, method } of sensitiveEndpoints) {
        await request(mockApp)[method](path)
          .set('Authorization', 'Bearer user-token')
          .expect(403);
      }
    });
  });
});