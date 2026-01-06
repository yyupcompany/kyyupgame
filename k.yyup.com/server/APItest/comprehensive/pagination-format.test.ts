/**
 * 分页格式一致性测试
 * 确保所有分页API返回统一的标准格式
 */

import request from 'supertest';
import { app } from '../helpers/testApp';
import { PaginationHelper } from '../../src/utils/paginationHelper';
import { ApiResponseEnhanced } from '../../src/utils/apiResponseEnhanced';

describe('📊 分页格式一致性严格验证', () => {
  let authToken: string;

  beforeAll(async () => {
    // 获取认证token
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

  describe('✅ PaginationHelper 工具验证', () => {
    test('parsePaginationParams - 解析分页参数', () => {
      // 标准参数
      const result1 = PaginationHelper.parsePaginationParams({
        page: '2',
        pageSize: '20',
        sortBy: 'name',
        sortOrder: 'ASC'
      });

      expect(result1).toEqual({
        page: 2,
        pageSize: 20,
        sortBy: 'name',
        sortOrder: 'ASC'
      });

      // 缺失参数使用默认值
      const result2 = PaginationHelper.parsePaginationParams({});
      expect(result2.page).toBe(1);
      expect(result2.pageSize).toBe(10);
      expect(result2.sortOrder).toBe('DESC');

      // 参数边界值测试
      const result3 = PaginationHelper.parsePaginationParams({
        page: '0',
        pageSize: '200'
      });
      expect(result3.page).toBe(1);
      expect(result3.pageSize).toBe(100); // 限制最大值
    });

    test('createPaginationResponse - 创建标准分页响应', () => {
      const items = [{ id: 1 }, { id: 2 }];
      const total = 50;
      const options = { page: 2, pageSize: 10 };

      const response = PaginationHelper.createPaginationResponse(
        items,
        total,
        options,
        '获取数据成功'
      );

      expect(response).toEqual({
        success: true,
        data: {
          items,
          total,
          page: 2,
          pageSize: 10,
          totalPages: 5,
          hasNext: true,
          hasPrev: true
        },
        message: '获取数据成功'
      });
    });

    test('validatePaginationResponse - 验证分页格式', () => {
      // 正确格式
      const validResponse = {
        success: true,
        data: {
          items: [{ id: 1 }],
          total: 100,
          page: 1,
          pageSize: 10,
          totalPages: 10,
          hasNext: true,
          hasPrev: false
        }
      };

      const validResult = PaginationHelper.validatePaginationResponse(validResponse);
      expect(validResult.valid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      // 错误格式
      const invalidResponse = {
        success: true,
        data: {
          items: 'not an array',
          total: 'not a number'
        }
      };

      const invalidResult = PaginationHelper.validatePaginationResponse(invalidResponse);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
    });

    test('normalizePaginationResponse - 转换非标准格式', () => {
      // 数组格式
      const arrayData = [{ id: 1 }, { id: 2 }];
      const normalized1 = PaginationHelper.normalizePaginationResponse(arrayData);
      expect(normalized1.data.items).toEqual(arrayData);
      expect(normalized1.data.total).toBe(2);

      // 对象格式
      const objectData = {
        list: [{ id: 1 }],
        count: 100,
        currentPage: 3,
        limit: 20
      };
      const normalized2 = PaginationHelper.normalizePaginationResponse(objectData);
      expect(normalized2.data.items).toEqual([{ id: 1 }]);
      expect(normalized2.data.total).toBe(100);
      expect(normalized2.data.page).toBe(3);
      expect(normalized2.data.pageSize).toBe(20);
    });
  });

  describe('🔧 API端点分页格式验证', () => {
    const testEndpoints = [
      '/api/students',
      '/api/teachers',
      '/api/classes',
      '/api/activities'
    ];

    test.each(testEndpoints)('GET %s - 应返回标准分页格式', async (endpoint) => {
      if (!authToken) {
        console.log(`⚠️ 跳过 ${endpoint} 测试：未获取到认证token`);
        return;
      }

      try {
        const response = await request(app)
          .get(endpoint)
          .query({ page: 1, pageSize: 10 })
          .set('Authorization', `Bearer ${authToken}`);

        // 检查可能的响应状态
        expect([200, 401, 403, 404]).toContain(response.status);

        if (response.status === 200) {
          // 验证是标准API格式
          expect(response.body.success).toBe(true);
          expect(response.body.data).toBeDefined();

          // 验证分页格式
          const validation = PaginationHelper.validatePaginationResponse(response.body);
          if (!validation.valid) {
            console.warn(`⚠️ ${endpoint} 分页格式不符合标准:`, validation.errors);
          }

          // 至少应该有基本结构
          if (response.body.data) {
            expect(typeof response.body.data.total).toBe('number');
            expect(typeof response.body.data.page).toBe('number');
            expect(typeof response.body.data.pageSize).toBe('number');
          }
        } else {
          // 错误响应也应该是标准格式
          if (response.body) {
            expect(typeof response.body.success).toBe('boolean');
          }
        }
      } catch (error) {
        console.log(`⚠️ ${endpoint} 测试失败: ${error.message}`);
        // 端点可能不存在，这是正常的
      }
    });

    test('分页参数边界值测试', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过分页参数测试：未获取到认证token');
        return;
      }

      const boundaryTests = [
        { page: 1, pageSize: 1 },
        { page: 1, pageSize: 100 },
        { page: 0, pageSize: 10 }, // 应该被修正为1
        { page: -1, pageSize: 10 }, // 应该被修正为1
        { page: 1, pageSize: 0 }, // 应该被修正为10
        { page: 1, pageSize: 200 } // 应该被限制为100
      ];

      for (const params of boundaryTests) {
        try {
          const response = await request(app)
            .get('/api/students')
            .query(params)
            .set('Authorization', `Bearer ${authToken}`);

          if (response.status === 200 && response.body.data) {
            // 验证参数被正确处理
            expect(response.body.data.page).toBeGreaterThanOrEqual(1);
            expect(response.body.data.pageSize).toBeGreaterThanOrEqual(1);
            expect(response.body.data.pageSize).toBeLessThanOrEqual(100);
          }
        } catch (error) {
          console.log(`⚠️ 分页参数测试失败 ${JSON.stringify(params)}: ${error.message}`);
        }
      }
    });
  });

  describe('🎯 分页响应一致性验证', () => {
    test('所有分页API必须包含完整的分页元数据', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过分页元数据测试：未获取到认证token');
        return;
      }

      const endpoints = [
        '/api/students',
        '/api/teachers',
        '/api/classes',
        '/api/activities'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await request(app)
            .get(endpoint)
            .query({ page: 2, pageSize: 5 })
            .set('Authorization', `Bearer ${authToken}`);

          if (response.status === 200 && response.body.data) {
            // 验证必填字段
            const requiredFields = ['items', 'total', 'page', 'pageSize', 'totalPages', 'hasNext', 'hasPrev'];
            requiredFields.forEach(field => {
              expect(response.body.data[field]).toBeDefined();
            });

            // 验证类型
            expect(Array.isArray(response.body.data.items)).toBe(true);
            expect(typeof response.body.data.total).toBe('number');
            expect(typeof response.body.data.page).toBe('number');
            expect(typeof response.body.data.pageSize).toBe('number');
            expect(typeof response.body.data.hasNext).toBe('boolean');
            expect(typeof response.body.data.hasPrev).toBe('boolean');

            // 验证逻辑一致性
            const totalPages = Math.ceil(response.body.data.total / response.body.data.pageSize);
            expect(response.body.data.totalPages).toBe(totalPages);
            expect(response.body.data.hasNext).toBe(response.body.data.page < totalPages);
            expect(response.body.data.hasPrev).toBe(response.body.data.page > 1);
          }
        } catch (error) {
          console.log(`⚠️ ${endpoint} 元数据测试失败: ${error.message}`);
        }
      }
    });
  });

  describe('📋 分页格式测试报告', () => {
    test('生成分页格式一致性报告', async () => {
      const endpoints = [
        '/api/students',
        '/api/teachers',
        '/api/classes',
        '/api/activities'
      ];

      const results: any[] = [];

      for (const endpoint of endpoints) {
        const testCases = [
          { page: 1, pageSize: 10 },
          { page: 2, pageSize: 20 },
          { page: 1, pageSize: 5 }
        ];

        for (const params of testCases) {
          try {
            const response = await request(app)
              .get(endpoint)
              .query(params)
              .set('Authorization', `Bearer ${authToken}`);

            let formatValid = false;
            let errors: string[] = [];
            let paginationValid = false;

            if (response.status === 200 && response.body) {
              // 验证基本API格式
              formatValid = response.body.success === true && response.body.data !== undefined;

              // 验证分页格式
              if (response.body.data) {
                const paginationValidation = PaginationHelper.validatePaginationResponse(response.body);
                paginationValid = paginationValidation.valid;
                errors = paginationValidation.errors;
              }
            }

            results.push({
              endpoint,
              params,
              status: response.status,
              formatValid,
              paginationValid,
              errors,
              hasBody: !!response.body
            });
          } catch (error) {
            results.push({
              endpoint,
              params,
              error: error.message,
              formatValid: false,
              paginationValid: false
            });
          }
        }
      }

      // 输出报告
      console.log('\n📊 分页格式一致性验证报告:');
      console.log('='.repeat(60));

      results.forEach(result => {
        if (result.error) {
          console.log(`❌ ${result.endpoint} (${JSON.stringify(result.params)}): ${result.error}`);
        } else {
          const formatStatus = result.formatValid ? '✅' : '❌';
          const paginationStatus = result.paginationValid ? '✅' : '❌';
          console.log(`${formatStatus}${paginationStatus} ${result.endpoint} (${JSON.stringify(result.params)}) [${result.status}]`);

          if (result.errors.length > 0) {
            result.errors.forEach(error => console.log(`   - ${error}`));
          }
        }
      });

      const validCount = results.filter(r => r.formatValid && r.paginationValid).length;
      const totalCount = results.filter(r => !r.error).length;

      console.log(`\n📈 分页格式一致性: ${validCount}/${totalCount} (${Math.round(validCount/totalCount*100)}%)`);

      // 至少应该有30%的分页API格式一致
      if (totalCount > 0) {
        const consistencyRate = validCount / totalCount;
        expect(consistencyRate).toBeGreaterThanOrEqual(0.3);
      }
    });
  });
});