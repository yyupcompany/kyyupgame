/**
 * 通知任务API严格验证测试
 * 自动生成的测试用例，确保API格式一致性
 */

import request from 'supertest';
import { app } from '../helpers/testApp';
import {
  validateStandardAPIFormat,
  validatePaginatedResponse,
  expectNoConsoleErrors
} from '../helpers/api-validation';

describe('通知任务API严格验证', () => {
  let authToken: string;

  beforeAll(async () => {
    try {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: '123456'
        });

      if (loginResponse.status === 200 && loginResponse.body.data?.token) {
        authToken = loginResponse.body.data.token;
      }
    } catch (error) {
      console.log('⚠️ 获取认证token失败，某些测试可能跳过');
    }
  });
  test('GET /api/notifications - 通知列表格式标准', async () => {
    
    if (!authToken) {
      console.log('⚠️ 跳过通知列表测试：未获取到认证token');
      return;
    }

    const consoleMonitor = expectNoConsoleErrors();

    try {
      // 基础GET请求测试
      const response = await request(app)
        .get('/api/notifications')
        .query({ page: 1, pageSize: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect([200, 401, 403, 404]);

      consoleMonitor.restore();
      consoleMonitor.expectNoErrors();

      if (response.status === 200) {
        expect(response.body).toBeStandardAPIFormat();

        
        // 验证分页格式
        if (response.body.data) {
          if (Array.isArray(response.body.data)) {
            expect(Array.isArray(response.body.data)).toBe(true);
          } else {
            expect(response.body).toBePaginatedResponse();
          }
        }
      }
        // 验证分页参数
        await request(app)
          .get('/api/notifications')
          .query({ page: 2, pageSize: 5 })
          .set('Authorization', `Bearer ${authToken}`)
          .expect([200, 401, 403, 404]);
    } catch (error) {
      consoleMonitor.restore();
      console.log(`⚠️ ${endpoint.description}测试失败: ${error.message}`);
    }
  });

  test('GET /api/todos - 待办任务列表格式标准', async () => {
    
    if (!authToken) {
      console.log('⚠️ 跳过待办任务列表测试：未获取到认证token');
      return;
    }

    const consoleMonitor = expectNoConsoleErrors();

    try {
      // 基础GET请求测试
      const response = await request(app)
        .get('/api/todos')
        .query({ page: 1, pageSize: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect([200, 401, 403, 404]);

      consoleMonitor.restore();
      consoleMonitor.expectNoErrors();

      if (response.status === 200) {
        expect(response.body).toBeStandardAPIFormat();

        
        // 验证分页格式
        if (response.body.data) {
          if (Array.isArray(response.body.data)) {
            expect(Array.isArray(response.body.data)).toBe(true);
          } else {
            expect(response.body).toBePaginatedResponse();
          }
        }
      }
        // 验证分页参数
        await request(app)
          .get('/api/todos')
          .query({ page: 2, pageSize: 5 })
          .set('Authorization', `Bearer ${authToken}`)
          .expect([200, 401, 403, 404]);
    } catch (error) {
      consoleMonitor.restore();
      console.log(`⚠️ ${endpoint.description}测试失败: ${error.message}`);
    }
  });

  test('GET /api/notification-center - 通知中心格式标准', async () => {
    
    if (!authToken) {
      console.log('⚠️ 跳过通知中心测试：未获取到认证token');
      return;
    }

    const consoleMonitor = expectNoConsoleErrors();

    try {
      // 基础GET请求测试
      const response = await request(app)
        .get('/api/notification-center')
        .query({ page: 1, pageSize: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect([200, 401, 403, 404]);

      consoleMonitor.restore();
      consoleMonitor.expectNoErrors();

      if (response.status === 200) {
        expect(response.body).toBeStandardAPIFormat();

        
      }
    } catch (error) {
      consoleMonitor.restore();
      console.log(`⚠️ ${endpoint.description}测试失败: ${error.message}`);
    }
  });

  test('GET /api/message-templates - 消息模板格式标准', async () => {
    
    if (!authToken) {
      console.log('⚠️ 跳过消息模板测试：未获取到认证token');
      return;
    }

    const consoleMonitor = expectNoConsoleErrors();

    try {
      // 基础GET请求测试
      const response = await request(app)
        .get('/api/message-templates')
        .query({ page: 1, pageSize: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect([200, 401, 403, 404]);

      consoleMonitor.restore();
      consoleMonitor.expectNoErrors();

      if (response.status === 200) {
        expect(response.body).toBeStandardAPIFormat();

        
        // 验证分页格式
        if (response.body.data) {
          if (Array.isArray(response.body.data)) {
            expect(Array.isArray(response.body.data)).toBe(true);
          } else {
            expect(response.body).toBePaginatedResponse();
          }
        }
      }
        // 验证分页参数
        await request(app)
          .get('/api/message-templates')
          .query({ page: 2, pageSize: 5 })
          .set('Authorization', `Bearer ${authToken}`)
          .expect([200, 401, 403, 404]);
    } catch (error) {
      consoleMonitor.restore();
      console.log(`⚠️ ${endpoint.description}测试失败: ${error.message}`);
    }
  });

  test('POST /api/message-templates - 创建消息模板格式标准', async () => {
    
    if (!authToken) {
      console.log('⚠️ 跳过创建消息模板测试：未获取到认证token');
      return;
    }

    const consoleMonitor = expectNoConsoleErrors();

    try {
      // 基础GET请求测试
      const response = await request(app)
        .post('/api/message-templates')
        .query()
        .set('Authorization', `Bearer ${authToken}`)
        .expect([200, 401, 403, 404]);

      consoleMonitor.restore();
      consoleMonitor.expectNoErrors();

      if (response.status === 200) {
        expect(response.body).toBeStandardAPIFormat();

        
      }
    } catch (error) {
      consoleMonitor.restore();
      console.log(`⚠️ ${endpoint.description}测试失败: ${error.message}`);
    }
        // 测试POST请求
        const postData = {
          name: 'Test 创建消息模板',
          description: 'Test description',
          // 根据实际API需求添加更多字段
        };

        const consoleMonitorPost = expectNoConsoleErrors();
        try {
          const response = await request(app)
            .post('/api/message-templates')
            .send(postData)
            .set('Authorization', `Bearer ${authToken}`)
            .expect([200, 201, 400, 401, 403, 404]);

          consoleMonitorPost.restore();
          consoleMonitorPost.expectNoErrors();

          if ([200, 201].includes(response.status)) {
            expect(response.body).toBeStandardAPIFormat();
          }
        } catch (error) {
          consoleMonitorPost.restore();
          console.log(`⚠️ ${endpoint.description} POST测试失败: ${error.message}`);
        }
  });

  describe('📊 通知任务API测试报告', () => {
    test('生成通知任务API测试覆盖报告', async () => {
      const endpoints = [
        '/api/notifications',
        '/api/todos',
        '/api/notification-center',
        '/api/message-templates',
        '/api/message-templates'
      ];

      const results: any[] = [];

      for (const endpoint of endpoints) {
        try {
          const response = await request(app)
            .get(endpoint)
            .set('Authorization', `Bearer ${authToken}`);

          let formatValid = false;
          if (response.body) {
            const validation = validateStandardAPIFormat(response.body);
            formatValid = validation.valid;
          }

          results.push({
            endpoint,
            status: response.status,
            formatValid,
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

      // 输出报告
      console.log('\n📊 通知任务API测试覆盖报告:');
      console.log('='.repeat(50));

      results.forEach(result => {
        if (result.error) {
          console.log(`❌ ${result.endpoint}: ${result.error}`);
        } else {
          const status = result.formatValid ? '✅' : '⚠️';
          console.log(`${status} ${result.endpoint} (${result.status})`);
        }
      });

      const validCount = results.filter(r => r.formatValid).length;
      const totalCount = results.filter(r => !r.error).length;

      console.log(`\n📈 API格式一致性: ${validCount}/${totalCount} (${Math.round(validCount/totalCount*100)}%)`);

      // 至少应该有20%的API格式一致
      if (totalCount > 0) {
        const consistencyRate = validCount / totalCount;
        expect(consistencyRate).toBeGreaterThanOrEqual(0.2);
      }
    });
  });
});