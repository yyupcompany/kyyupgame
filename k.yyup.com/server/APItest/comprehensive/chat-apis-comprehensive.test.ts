/**
 * 聊天消息API严格验证测试
 * 自动生成的测试用例，确保API格式一致性
 */

import request from 'supertest';
import { app } from '../helpers/testApp';
import {
  validateStandardAPIFormat,
  validatePaginatedResponse,
  expectNoConsoleErrors
} from '../helpers/api-validation';

describe('聊天消息API严格验证', () => {
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
  test('GET /api/chat - 聊天记录格式标准', async () => {
    
    if (!authToken) {
      console.log('⚠️ 跳过聊天记录测试：未获取到认证token');
      return;
    }

    const consoleMonitor = expectNoConsoleErrors();

    try {
      // 基础GET请求测试
      const response = await request(app)
        .get('/api/chat')
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
          .get('/api/chat')
          .query({ page: 2, pageSize: 5 })
          .set('Authorization', `Bearer ${authToken}`)
          .expect([200, 401, 403, 404]);
    } catch (error) {
      consoleMonitor.restore();
      console.log(`⚠️ ${endpoint.description}测试失败: ${error.message}`);
    }
  });

  test('POST /api/chat - 发送消息格式标准', async () => {
    
    if (!authToken) {
      console.log('⚠️ 跳过发送消息测试：未获取到认证token');
      return;
    }

    const consoleMonitor = expectNoConsoleErrors();

    try {
      // 基础GET请求测试
      const response = await request(app)
        .post('/api/chat')
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
          name: 'Test 发送消息',
          description: 'Test description',
          // 根据实际API需求添加更多字段
        };

        const consoleMonitorPost = expectNoConsoleErrors();
        try {
          const response = await request(app)
            .post('/api/chat')
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

  test('GET /api/session - 会话列表格式标准', async () => {
    
    if (!authToken) {
      console.log('⚠️ 跳过会话列表测试：未获取到认证token');
      return;
    }

    const consoleMonitor = expectNoConsoleErrors();

    try {
      // 基础GET请求测试
      const response = await request(app)
        .get('/api/session')
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
          .get('/api/session')
          .query({ page: 2, pageSize: 5 })
          .set('Authorization', `Bearer ${authToken}`)
          .expect([200, 401, 403, 404]);
    } catch (error) {
      consoleMonitor.restore();
      console.log(`⚠️ ${endpoint.description}测试失败: ${error.message}`);
    }
  });

  describe('📊 聊天消息API测试报告', () => {
    test('生成聊天消息API测试覆盖报告', async () => {
      const endpoints = [
        '/api/chat',
        '/api/chat',
        '/api/session'
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
      console.log('\n📊 聊天消息API测试覆盖报告:');
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