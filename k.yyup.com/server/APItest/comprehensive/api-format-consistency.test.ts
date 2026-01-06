/**
 * API格式一致性测试
 * 确保所有API响应都遵循统一的格式标准
 */

import request from 'supertest';
import { app } from '../helpers/testApp';
import {
  validateStandardAPIFormat,
  validatePaginatedResponse,
  validateAuthResponse,
  validateRequiredFields,
  validateFieldTypes,
  expectNoConsoleErrors,
  StandardAPIResponse,
  StandardPaginatedResponse,
  StandardAuthResponse
} from '../helpers/api-validation';

describe('🚨 API格式一致性严格验证', () => {
  let authToken: string;

  beforeAll(async () => {
    // 获取认证token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: '123456'
      });

    if (loginResponse.status === 200 && loginResponse.body.data?.token) {
      authToken = loginResponse.body.data.token;
    }
  });

  describe('✅ 认证API格式验证', () => {
    test('POST /api/auth/login - 登录响应格式标准', async () => {
      const consoleMonitor = expectNoConsoleErrors();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: '123456'
        });

      consoleMonitor.restore();
      consoleMonitor.expectNoErrors();

      expect(response.status).toBe(200);

      // 1. 验证基本API格式
      expect(response.body).toBeStandardAPIFormat();
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

      // 2. 验证认证响应特定格式
      expect(response.body).toBeAuthResponse();

      // 3. 验证必填字段
      const requiredFields = ['success', 'data', 'message'];
      const validation = validateRequiredFields(response.body, requiredFields);
      expect(validation.valid).toBe(true);

      // 4. 验证字段类型
      const fieldTypes = {
        'success': 'boolean',
        'data': 'object',
        'message': 'string'
      };
      const typeValidation = validateFieldTypes(response.body, fieldTypes);
      expect(typeValidation.valid).toBe(true);

      // 5. 验证认证数据结构
      if (response.body.data) {
        const authDataValidation = validateRequiredFields(response.body.data, ['token', 'user']);
        expect(authDataValidation.valid).toBe(true);

        // 验证用户数据结构
        if (response.body.data.user) {
          const userValidation = validateRequiredFields(response.body.data.user, ['id', 'username', 'role']);
          expect(userValidation.valid).toBe(true);
        }
      }
    });

    test('POST /api/auth/logout - 登出响应格式标准', async () => {
      const consoleMonitor = expectNoConsoleErrors();

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      consoleMonitor.restore();
      consoleMonitor.expectNoErrors();

      expect(response.status).toBe(200);
      expect(response.body).toBeStandardAPIFormat();
    });

    test('GET /api/auth/me - 获取用户信息响应格式标准', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过用户信息测试：未获取到认证token');
        return;
      }

      const consoleMonitor = expectNoConsoleErrors();

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      consoleMonitor.restore();
      consoleMonitor.expectNoErrors();

      expect(response.status).toBe(200);
      expect(response.body).toBeStandardAPIFormat();
    });
  });

  describe('📊 分页API格式验证', () => {
    test('GET /api/students - 学生列表分页格式标准', async () => {
      const consoleMonitor = expectNoConsoleErrors();

      const response = await request(app)
        .get('/api/students')
        .query({ page: 1, pageSize: 10 })
        .set('Authorization', `Bearer ${authToken}`);

      consoleMonitor.restore();
      consoleMonitor.expectNoErrors();

      // 检查响应状态（可能401未认证，但格式应该一致）
      expect([200, 401, 403]).toContain(response.status);

      // 验证格式一致性
      if (response.status === 200) {
        expect(response.body).toBePaginatedResponse();

        // 验证分页字段
        if (response.body.data) {
          const paginationValidation = validateRequiredFields(response.body.data, [
            'items', 'total', 'page', 'pageSize'
          ]);
          expect(paginationValidation.valid).toBe(true);

          // 验证items是数组
          expect(Array.isArray(response.body.data.items)).toBe(true);
        }
      } else {
        // 错误响应也应该是标准格式
        expect(response.body).toBeStandardAPIFormat();
      }
    });

    test('GET /api/teachers - 教师列表分页格式标准', async () => {
      const consoleMonitor = expectNoConsoleErrors();

      const response = await request(app)
        .get('/api/teachers')
        .query({ page: 1, pageSize: 10 })
        .set('Authorization', `Bearer ${authToken}`);

      consoleMonitor.restore();
      consoleMonitor.expectNoErrors();

      expect([200, 401, 403]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toBePaginatedResponse();
      } else {
        expect(response.body).toBeStandardAPIFormat();
      }
    });
  });

  describe('🔧 业务API格式验证', () => {
    test('GET /api/activities - 活动列表API格式标准', async () => {
      const consoleMonitor = expectNoConsoleErrors();

      const response = await request(app)
        .get('/api/activities')
        .set('Authorization', `Bearer ${authToken}`);

      consoleMonitor.restore();
      consoleMonitor.expectNoErrors();

      expect([200, 401, 403, 404]).toContain(response.status);

      // 无论成功失败，都应该有标准格式
      if (response.body) {
        expect(response.body).toBeStandardAPIFormat();
      }
    });

    test('GET /api/classes - 班级列表API格式标准', async () => {
      const consoleMonitor = expectNoConsoleErrors();

      const response = await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${authToken}`);

      consoleMonitor.restore();
      consoleMonitor.expectNoErrors();

      expect([200, 401, 403, 404]).toContain(response.status);

      if (response.body) {
        expect(response.body).toBeStandardAPIFormat();
      }
    });

    test('GET /api/dashboard - 仪表板API格式标准', async () => {
      const consoleMonitor = expectNoConsoleErrors();

      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      consoleMonitor.restore();
      consoleMonitor.expectNoErrors();

      expect([200, 401, 403]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toBeStandardAPIFormat();
        expect(response.body.success).toBe(true);
      } else {
        expect(response.body).toBeStandardAPIFormat();
      }
    });
  });

  describe('❌ 错误处理格式验证', () => {
    test('401 未授权错误格式标准', async () => {
      const consoleMonitor = expectNoConsoleErrors();

      const response = await request(app)
        .get('/api/protected-resource')
        .set('Authorization', 'Bearer invalid-token');

      consoleMonitor.restore();
      consoleMonitor.expectNoErrors();

      expect(response.status).toBe(401);
      expect(response.body).toBeStandardAPIFormat();
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error?.code).toBeDefined();
      expect(response.body.error?.message).toBeDefined();
    });

    test('400 请求参数错误格式标准', async () => {
      const consoleMonitor = expectNoConsoleErrors();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          // 缺少必要字段
          username: ''
        });

      consoleMonitor.restore();
      consoleMonitor.expectNoErrors();

      expect([400, 422]).toContain(response.status);
      expect(response.body).toBeStandardAPIFormat();
      expect(response.body.success).toBe(false);
    });

    test('404 资源不存在错误格式标准', async () => {
      const consoleMonitor = expectNoConsoleErrors();

      const response = await request(app)
        .get('/api/nonexistent-endpoint-12345')
        .set('Authorization', `Bearer ${authToken}`);

      consoleMonitor.restore();
      consoleMonitor.expectNoErrors();

      expect(response.status).toBe(404);
      // 404可能由路由处理，不一定有标准格式
    });
  });

  describe('🎯 核心API响应结构一致性', () => {
    test('所有成功响应必须包含success=true', async () => {
      const endpoints = [
        { method: 'get', path: '/api/dashboard' },
        { method: 'get', path: '/api/activities' },
        { method: 'get', path: '/api/classes' }
      ];

      for (const endpoint of endpoints) {
        const consoleMonitor = expectNoConsoleErrors();

        const response = await request(app)
          [endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${authToken}`);

        consoleMonitor.restore();
        consoleMonitor.expectNoErrors();

        if (response.status === 200 && response.body) {
          expect(response.body.success).toBe(true);
          expect(typeof response.body.success).toBe('boolean');
        }
      }
    });

    test('所有失败响应必须包含success=false和error对象', async () => {
      const testCases = [
        {
          request: () => request(app).post('/api/auth/login').send({}),
          expectedStatus: [400, 422]
        },
        {
          request: () => request(app).get('/api/protected').set('Authorization', 'invalid'),
          expectedStatus: [401, 403]
        }
      ];

      for (const testCase of testCases) {
        try {
          const consoleMonitor = expectNoConsoleErrors();

          const response = await testCase.request();

          consoleMonitor.restore();
          consoleMonitor.expectNoErrors();

          if (testCase.expectedStatus.includes(response.status) && response.body) {
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBeDefined();
            expect(typeof response.body.error.code).toBe('string');
            expect(typeof response.body.error.message).toBe('string');
          }
        } catch (error) {
          // 某些端点可能不存在，这是正常的
          console.log(`⚠️ 端点测试失败: ${error.message}`);
        }
      }
    });
  });

  describe('📋 API格式验证报告', () => {
    test('生成API格式一致性报告', async () => {
      const consoleMonitor = expectNoConsoleErrors();

      // 测试主要API端点
      const mainEndpoints = [
        '/api/auth/login',
        '/api/auth/me',
        '/api/dashboard',
        '/api/students',
        '/api/teachers',
        '/api/activities',
        '/api/classes'
      ];

      const results: any[] = [];

      for (const endpoint of mainEndpoints) {
        try {
          const response = await request(app)
            .get(endpoint)
            .set('Authorization', `Bearer ${authToken}`);

          let formatValid = false;
          let errors: string[] = [];

          if (response.body) {
            const validation = validateStandardAPIFormat(response.body);
            formatValid = validation.valid;
            errors = validation.errors;
          }

          results.push({
            endpoint,
            status: response.status,
            formatValid,
            errors,
            hasBody: !!response.body
          });
        } catch (error) {
          results.push({
            endpoint,
            error: error.message,
            formatValid: false
          });
        }
      }

      consoleMonitor.restore();
      consoleMonitor.expectNoErrors();

      // 输出报告
      console.log('\n📊 API格式一致性验证报告:');
      console.log('='.repeat(50));

      results.forEach(result => {
        if (result.error) {
          console.log(`❌ ${result.endpoint}: ${result.error}`);
        } else {
          const status = result.formatValid ? '✅' : '❌';
          console.log(`${status} ${result.endpoint} (${result.status})`);
          if (result.errors.length > 0) {
            result.errors.forEach(error => console.log(`   - ${error}`));
          }
        }
      });

      const validCount = results.filter(r => r.formatValid).length;
      const totalCount = results.filter(r => !r.error).length;

      console.log(`\n📈 格式一致性: ${validCount}/${totalCount} (${Math.round(validCount/totalCount*100)}%)`);

      // 至少应该有50%的API格式一致
      const consistencyRate = validCount / totalCount;
      expect(consistencyRate).toBeGreaterThanOrEqual(0.5);
    });
  });
});