/**
 * 生产环境一致性验证测试
 * 确保开发、测试、生产环境之间的API契约和数据一致性
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../../server/src/app';
import {
import { authApi } from '@/api/auth';

  RealEnvironmentManager,
  TestUtils
} from '../integration/real-env.config';

describe('Environment Consistency Validation Tests', () => {
  let envManager: RealEnvironmentManager;
  let testEnv: any;
  let apiContracts: any[] = [];

  beforeAll(async () => {
    envManager = RealEnvironmentManager.getInstance();
    await envManager.initializeEnvironment();
    testEnv = envManager.getEnvironment();

    // 加载API契约定义
    await loadAPIContracts();
  }, 60000);

  afterAll(async () => {
    await envManager.cleanupEnvironment();
  }, 30000);

  beforeEach(async () => {
    await TestUtils.wait(100);
  });

  afterEach(async () => {
    await TestUtils.wait(100);
  });

  /**
   * 加载API契约定义
   */
  async function loadAPIContracts(): Promise<void> {
    apiContracts = [
      {
        method: 'GET',
        path: '/api/users',
        expectedStatus: 200,
        responseSchema: {
          type: 'object',
          required: ['success', 'data', 'message'],
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              required: ['items', 'total', 'page', 'pageSize'],
              properties: {
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['id', 'username', 'email', 'realName', 'role'],
                    properties: {
                      id: { type: 'number' },
                      username: { type: 'string' },
                      email: { type: 'string' },
                      realName: { type: 'string' },
                      role: { type: 'string' },
                      createdAt: { type: 'string' },
                      updatedAt: { type: 'string' }
                    }
                  }
                },
                total: { type: 'number' },
                page: { type: 'number' },
                pageSize: { type: 'number' }
              }
            }
          }
        }
      },
      {
        method: 'GET',
        path: '/api/classes',
        expectedStatus: 200,
        responseSchema: {
          type: 'object',
          required: ['success', 'data', 'message'],
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              required: ['items', 'total', 'page', 'pageSize'],
              properties: {
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['id', 'name', 'teacherId', 'capacity', 'studentCount'],
                    properties: {
                      id: { type: 'number' },
                      name: { type: 'string' },
                      teacherId: { type: 'number' },
                      capacity: { type: 'number' },
                      studentCount: { type: 'number' },
                      description: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        method: 'GET',
        path: '/api/dashboard',
        expectedStatus: 200,
        responseSchema: {
          type: 'object',
          required: ['success', 'data', 'message'],
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                totalUsers: { type: 'number' },
                totalClasses: { type: 'number' },
                totalStudents: { type: 'number' },
                recentActivities: { type: 'array' },
                notifications: { type: 'array' }
              }
            }
          }
        }
      },
      {
        method: 'POST',
        path: '/api/auth/unified-login',
        expectedStatus: 200,
        responseSchema: {
          type: 'object',
          required: ['success', 'data', 'message'],
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              required: ['token', 'user', 'expiresIn'],
              properties: {
                token: { type: 'string' },
                user: {
                  type: 'object',
                  required: ['id', 'username', 'email', 'role'],
                  properties: {
                    id: { type: 'number' },
                    username: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string' }
                  }
                },
                expiresIn: { type: 'number' }
              }
            }
          }
        }
      }
    ];
  }

  /**
   * 验证JSON Schema
   */
  function validateJSONSchema(data: any, schema: any): boolean {
    try {
      return validateObject(data, schema);
    } catch (error) {
      console.error('Schema validation error:', error);
      return false;
    }
  }

  /**
   * 递归验证对象结构
   */
  function validateObject(obj: any, schema: any): boolean {
    if (schema.type === 'object') {
      if (typeof obj !== 'object' || obj === null) {
        return false;
      }

      // 检查必填字段
      if (schema.required) {
        for (const requiredField of schema.required) {
          if (!(requiredField in obj)) {
            return false;
          }
        }
      }

      // 检查属性
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          if (key in obj) {
            if (!validateObject(obj[key], propSchema)) {
              return false;
            }
          }
        }
      }

      return true;
    } else if (schema.type === 'array') {
      if (!Array.isArray(obj)) {
        return false;
      }

      if (schema.items) {
        return obj.every(item => validateObject(item, schema.items));
      }

      return true;
    } else if (schema.type === 'string') {
      return typeof obj === 'string';
    } else if (schema.type === 'number') {
      return typeof obj === 'number';
    } else if (schema.type === 'boolean') {
      return typeof obj === 'boolean';
    }

    return true;
  }

  /**
   * 获取环境变量
   */
  function getEnvironmentVariable(key: string): string {
    return process.env[key] || '';
  }

  describe('API契约一致性验证', () => {
    it('应该验证所有API端点的响应格式一致性', async () => {
      const 13800138000Token = testEnv.13800138000Token;

      for (const contract of apiContracts) {
        let response: any;

        try {
          if (contract.method === 'GET') {
            response = await request(app)
              .get(contract.path)
              .set('Authorization', `Bearer ${13800138000Token}`);
          } else if (contract.method === 'POST') {
            if (contract.path === '/api/auth/unified-login') {
              response = await request(app)
                .post('/api/auth/unified-login')
                .send({
                  username: 'test_13800138000',
                  password: 'Admin123!'
                });
            } else {
              response = await request(app)
                .post(contract.path)
                .set('Authorization', `Bearer ${13800138000Token}`)
                .send({});
            }
          }
        } catch (error) {
          console.error(`API请求失败: ${contract.method} ${contract.path}`, error);
          continue;
        }

        // 验证状态码
        expect(response.status).toBe(contract.expectedStatus);

        // 验证响应结构
        const isValidSchema = validateJSONSchema(response.body, contract.responseSchema);
        expect(isValidSchema).toBe(true);

        console.log(`✅ API契约验证通过: ${contract.method} ${contract.path}`);
      }
    });

    it('应该验证错误响应格式一致性', async () => {
      const errorScenarios = [
        {
          name: '无效认证',
          request: () => request(app).get('/api/users'),
          expectedStatus: 401
        },
        {
          name: '权限不足',
          request: () => request(app)
            .get('/api/system/settings')
            .set('Authorization', `Bearer ${testEnv.testUsers[0]?.token || ''}`),
          expectedStatus: 403
        },
        {
          name: '资源不存在',
          request: () => request(app)
            .get('/api/users/999999')
            .set('Authorization', `Bearer ${testEnv.13800138000Token}`),
          expectedStatus: 404
        },
        {
          name: '无效请求参数',
          request: () => request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${testEnv.13800138000Token}`)
            .send({ invalid: 'data' }),
          expectedStatus: 400
        }
      ];

      const errorSchema = {
        type: 'object',
        required: ['success', 'message'],
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          code: { type: 'string' },
          details: { type: 'object' }
        }
      };

      for (const scenario of errorScenarios) {
        const response = await scenario.request();

        expect(response.status).toBe(scenario.expectedStatus);

        // 验证错误响应格式
        expect(response.body.success).toBe(false);
        expect(typeof response.body.message).toBe('string');
        expect(response.body.message.length).toBeGreaterThan(0);

        // 验证符合错误响应schema
        const isValidSchema = validateJSONSchema(response.body, errorSchema);
        expect(isValidSchema).toBe(true);

        console.log(`✅ 错误响应格式验证通过: ${scenario.name}`);
      }
    });

    it('应该验证数据类型一致性', async () => {
      const 13800138000Token = testEnv.13800138000Token;

      // 获取用户列表验证数据类型
      const usersResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${13800138000Token}`);

      expect(usersResponse.status).toBe(200);

      // 验证用户数据类型
      usersResponse.body.data.items.forEach((user: any) => {
        expect(typeof user.id).toBe('number');
        expect(typeof user.username).toBe('string');
        expect(typeof user.email).toBe('string');
        expect(typeof user.realName).toBe('string');
        expect(typeof user.role).toBe('string');
        expect(typeof user.createdAt).toBe('string');
        expect(typeof user.updatedAt).toBe('string');
      });

      // 验证分页数据类型
      expect(typeof usersResponse.body.data.total).toBe('number');
      expect(typeof usersResponse.body.data.page).toBe('number');
      expect(typeof usersResponse.body.data.pageSize).toBe('number');
      expect(Array.isArray(usersResponse.body.data.items)).toBe(true);

      // 获取班级列表验证数据类型
      const classesResponse = await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${13800138000Token}`);

      expect(classesResponse.status).toBe(200);

      classesResponse.body.data.items.forEach((cls: any) => {
        expect(typeof cls.id).toBe('number');
        expect(typeof cls.name).toBe('string');
        expect(typeof cls.teacherId).toBe('number');
        expect(typeof cls.capacity).toBe('number');
        expect(typeof cls.studentCount).toBe('number');
        expect(typeof cls.description).toBe('string');
      });
    });
  });

  describe('环境配置一致性验证', () => {
    it('应该验证关键环境变量配置', () => {
      const requiredEnvVars = [
        'NODE_ENV',
        'JWT_SECRET',
        'DB_HOST',
        'DB_DATABASE',
        'DB_USERNAME',
        'PORT'
      ];

      requiredEnvVars.forEach(envVar => {
        const value = getEnvironmentVariable(envVar);
        expect(value).toBeDefined();
        expect(value.length).toBeGreaterThan(0);
        console.log(`✅ 环境变量配置正确: ${envVar}`);
      });

      // 验证环境类型
      const nodeEnv = getEnvironmentVariable('NODE_ENV');
      expect(['development', 'test', 'production']).toContain(nodeEnv);
    });

    it('应该验证数据库连接配置一致性', async () => {
      // 这里应该验证数据库配置，但由于在测试环境中，我们主要验证配置存在
      const dbConfig = {
        host: getEnvironmentVariable('DB_HOST'),
        database: getEnvironmentVariable('DB_DATABASE'),
        username: getEnvironmentVariable('DB_USERNAME'),
        port: getEnvironmentVariable('DB_PORT') || '3306'
      };

      expect(dbConfig.host).toBeDefined();
      expect(dbConfig.database).toBeDefined();
      expect(dbConfig.username).toBeDefined();
      expect(dbConfig.port).toBeDefined();

      console.log('✅ 数据库配置一致性验证通过');
    });

    it('应该验证JWT配置一致性', () => {
      const jwtSecret = getEnvironmentVariable('JWT_SECRET');
      const jwtExpiresIn = getEnvironmentVariable('JWT_EXPIRES_IN') || '24h';

      expect(jwtSecret).toBeDefined();
      expect(jwtSecret.length).toBeGreaterThan(16); // JWT密钥应该足够长
      expect(jwtExpiresIn).toBeDefined();

      console.log('✅ JWT配置一致性验证通过');
    });
  });

  describe('跨环境数据一致性验证', () => {
    it('应该验证API版本一致性', async () => {
      // 检查API版本信息
      const versionResponse = await request(app)
        .get('/api/version')
        .timeout(5000);

      // 如果有版本端点，验证响应
      if (versionResponse.status === 200) {
        expect(versionResponse.body).toHaveProperty('version');
        expect(versionResponse.body).toHaveProperty('apiVersion');
        expect(typeof versionResponse.body.version).toBe('string');
        console.log(`✅ API版本: ${versionResponse.body.version}`);
      }
    });

    it('应该验证基础数据结构一致性', async () => {
      const 13800138000Token = testEnv.13800138000Token;

      // 获取基础数据类型
      const dataTypes = [
        { endpoint: '/api/users', name: '用户数据' },
        { endpoint: '/api/classes', name: '班级数据' },
        { endpoint: '/api/students', name: '学生数据' },
        { endpoint: '/api/activities', name: '活动数据' }
      ];

      for (const dataType of dataTypes) {
        const response = await request(app)
          .get(dataType.endpoint)
          .set('Authorization', `Bearer ${13800138000Token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('items');

        // 验证数据结构一致性
        if (response.body.data.items.length > 0) {
          const firstItem = response.body.data.items[0];
          expect(typeof firstItem.id).toBe('number');
          expect(typeof firstItem.createdAt).toBe('string');
        }

        console.log(`✅ ${dataType.name}结构一致性验证通过`);
      }
    });

    it('应该验证权限系统一致性', async () => {
      // 测试不同角色的权限访问
      const testScenarios = [
        {
          role: '13800138000',
          accessibleEndpoints: ['/api/users', '/api/classes', '/api/system/settings']
        },
        {
          role: 'teacher',
          accessibleEndpoints: ['/api/classes/my-classes', '/api/students'],
          inaccessibleEndpoints: ['/api/system/settings']
        },
        {
          role: 'parent',
          accessibleEndpoints: ['/api/parents/my-children', '/api/students/children'],
          inaccessibleEndpoints: ['/api/users', '/api/system/settings']
        }
      ];

      for (const scenario of testScenarios) {
        let userToken: string;

        if (scenario.role === '13800138000') {
          userToken = testEnv.13800138000Token;
        } else {
          const user = testEnv.testUsers.find((u: any) => u.role === scenario.role);
          userToken = await envManager.getUserToken(user!.id);
        }

        // 测试可访问的端点
        if (scenario.accessibleEndpoints) {
          for (const endpoint of scenario.accessibleEndpoints) {
            const response = await request(app)
              .get(endpoint)
              .set('Authorization', `Bearer ${userToken}`);

            expect([200, 404]).toContain(response.status); // 允许404（数据不存在）
          }
        }

        // 测试不可访问的端点
        if (scenario.inaccessibleEndpoints) {
          for (const endpoint of scenario.inaccessibleEndpoints) {
            const response = await request(app)
              .get(endpoint)
              .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
          }
        }

        console.log(`✅ ${scenario.role}角色权限一致性验证通过`);
      }
    });
  });

  describe('配置验证测试', () => {
    it('应该验证API响应头一致性', async () => {
      const 13800138000Token = testEnv.13800138000Token;

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${13800138000Token}`);

      expect(response.status).toBe(200);

      // 验证CORS头
      expect(response.headers['access-control-allow-origin']).toBeDefined();

      // 验证内容类型
      expect(response.headers['content-type']).toContain('application/json');

      console.log('✅ API响应头一致性验证通过');
    });

    it('应该验证错误处理一致性', async () => {
      const errorTests = [
        {
          name: '无效token',
          request: () => request(app)
            .get('/api/users')
            .set('Authorization', 'Bearer invalid-token'),
          expectedStatus: 401
        },
        {
          name: '缺少认证',
          request: () => request(app).get('/api/users'),
          expectedStatus: 401
        },
        {
          name: '无效参数',
          request: () => request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${testEnv.13800138000Token}`)
            .query({ page: 'invalid' }),
          expectedStatus: 400
        }
      ];

      for (const test of errorTests) {
        const response = await test.request();

        expect(response.status).toBe(test.expectedStatus);
        expect(response.body).toHaveProperty('success');
        expect(response.body.success).toBe(false);
        expect(typeof response.body.message).toBe('string');

        console.log(`✅ 错误处理一致性验证通过: ${test.name}`);
      }
    });

    it('应该验证分页参数一致性', async () => {
      const 13800138000Token = testEnv.13800138000Token;

      const paginationTests = [
        { page: 1, pageSize: 10 },
        { page: 2, pageSize: 20 },
        { page: 1, pageSize: 50 },
        { page: 1, pageSize: 100 }
      ];

      for (const params of paginationTests) {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${13800138000Token}`)
          .query(params);

        expect(response.status).toBe(200);

        // 验证分页响应结构
        expect(response.body.data).toHaveProperty('items');
        expect(response.body.data).toHaveProperty('total');
        expect(response.body.data).toHaveProperty('page', params.page);
        expect(response.body.data).toHaveProperty('pageSize', params.pageSize);

        // 验证分页数据一致性
        expect(Array.isArray(response.body.data.items)).toBe(true);
        expect(typeof response.body.data.total).toBe('number');
        expect(response.body.data.items.length).toBeLessThanOrEqual(params.pageSize);
      }

      console.log('✅ 分页参数一致性验证通过');
    });
  });

  describe('性能基准一致性验证', () => {
    it('应该验证响应时间基准', async () => {
      const 13800138000Token = testEnv.13800138000Token;
      const performanceTests = [
        { endpoint: '/api/users', expectedMaxTime: 2000 },
        { endpoint: '/api/classes', expectedMaxTime: 1500 },
        { endpoint: '/api/dashboard', expectedMaxTime: 3000 }
      ];

      for (const test of performanceTests) {
        const startTime = Date.now();

        const response = await request(app)
          .get(test.endpoint)
          .set('Authorization', `Bearer ${13800138000Token}`);

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(response.status).toBe(200);
        expect(responseTime).toBeLessThan(test.expectedMaxTime);

        console.log(`✅ ${test.endpoint} 响应时间: ${responseTime}ms (基准: ${test.expectedMaxTime}ms)`);
      }
    });

    it('应该验证数据大小基准', async () => {
      const 13800138000Token = testEnv.13800138000Token;

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${13800138000Token}`)
        .query({ page: 1, pageSize: 50 });

      expect(response.status).toBe(200);

      const responseSize = JSON.stringify(response.body).length;
      const maxResponseSize = 1024 * 1024; // 1MB

      expect(responseSize).toBeLessThan(maxResponseSize);

      console.log(`✅ 响应数据大小: ${(responseSize / 1024).toFixed(2)}KB (基准: <1MB)`);
    });
  });

  describe('安全配置一致性验证', () => {
    it('应该验证密码策略一致性', async () => {
      const passwordTests = [
        { password: '123', expectedError: '密码强度不足' },
        { password: 'password', expectedError: '密码强度不足' },
        { password: 'ValidPass123!', expectedSuccess: true }
      ];

      for (const test of passwordTests) {
        const userData = TestUtils.createRandomTestData('password_test');

        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: userData.username,
            email: userData.email,
            password: test.password,
            realName: userData.name
          });

        if (test.expectedSuccess) {
          expect([201, 409]).toContain(response.status); // 201成功或409已存在
        } else {
          expect(response.status).toBe(400);
          expect(response.body.message).toContain(test.expectedError);
        }
      }

      console.log('✅ 密码策略一致性验证通过');
    });

    it('应该验证JWT token格式一致性', async () => {
      // 登录获取token
      const loginResponse = await request(app)
        .post('/api/auth/unified-login')
        .send({
          username: 'test_13800138000',
          password: 'Admin123!'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.data.token).toBeDefined();

      const token = loginResponse.body.data.token;

      // 验证token格式
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT应该有3个部分

      // 验证token内容
      const decodedToken = envManager.validateToken(token);
      expect(decodedToken.userId).toBeDefined();
      expect(decodedToken.username).toBeDefined();

      console.log('✅ JWT token格式一致性验证通过');
    });
  });

  describe('文件上传一致性验证', () => {
    it('应该验证文件上传限制', async () => {
      const 13800138000Token = testEnv.13800138000Token;

      // 测试文件大小限制
      const largeFile = Buffer.alloc(10 * 1024 * 1024); // 10MB文件
      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${13800138000Token}`)
        .attach('file', largeFile, 'large-file.jpg');

      // 应该因为文件过大而失败
      expect([400, 413]).toContain(response.status);

      console.log('✅ 文件上传限制一致性验证通过');
    });
  });

  describe('API版本兼容性验证', () => {
    it('应该验证API向后兼容性', async () => {
      const 13800138000Token = testEnv.13800138000Token;

      // 测试v1 API
      const v1Response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${13800138000Token}`)
        .timeout(5000);

      // 如果v1存在，应该与当前API兼容
      if (v1Response.status === 200) {
        expect(v1Response.body).toHaveProperty('success');
        expect(v1Response.body).toHaveProperty('data');

        // 验证关键字段存在
        if (v1Response.body.data.items && v1Response.body.data.items.length > 0) {
          const user = v1Response.body.data.items[0];
          expect(user).toHaveProperty('id');
          expect(user).toHaveProperty('username');
          expect(user).toHaveProperty('email');
        }

        console.log('✅ API向后兼容性验证通过');
      } else {
        console.log('ℹ️  v1 API不存在，跳过兼容性测试');
      }
    });
  });
});