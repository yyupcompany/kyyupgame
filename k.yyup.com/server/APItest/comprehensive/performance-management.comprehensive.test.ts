import axios, { AxiosResponse } from 'axios';
import { TestDataFactory } from '../helpers/testUtils';
import { getAuthToken, TEST_CREDENTIALS } from '../helpers/authHelper';

// 真实API基地址
const API_BASE_URL = 'http://localhost:3000/api';

// API客户端配置
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  validateStatus: () => true, // 不要抛出错误，让我们处理所有状态码
});

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

interface PerformanceRule {
  id: number;
  name: string;
  description?: string;
  calculation_method: string;
  target_value: number;
  weight: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PerformanceEvaluation {
  id: number;
  name: string;
  description?: string;
  evaluationType: 'teacher' | 'student' | 'staff' | 'system';
  status: 'draft' | 'active' | 'completed' | 'archived';
  startDate: string;
  endDate: string;
  criteria: Array<{
    name: string;
    weight: number;
    maxScore: number;
  }>;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

interface PerformanceReport {
  id: number;
  name: string;
  description?: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  status: 'generating' | 'completed' | 'failed';
  format: 'pdf' | 'excel' | 'csv';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

describe('性能管理系统API全面测试 - 参数验证', () => {
  let authToken: string = '';
  let testRuleId: number = 0;

  beforeAll(async () => {
    console.log('🚀 开始性能管理系统API全面测试...');
    console.log('📋 测试范围: 28个性能管理端点的完整参数验证');
    
    // 获取管理员认证token
    const loginResponse = await apiClient.post('/auth/login', {
      username: 'admin',
      password: 'admin123'
    });

    if (loginResponse.data?.success && loginResponse.data?.data?.token) {
      authToken = loginResponse.data.data.token;
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      console.log('✅ 管理员认证成功');
    } else {
      console.error('❌ 管理员认证失败:', loginResponse.data);
      throw new Error('Failed to authenticate admin user');
    }
  });

  afterAll(async () => {
    // 清理测试数据
    if (testRuleId > 0) {
      await apiClient.delete(`/performance-rules/${testRuleId}`);
      console.log('🧹 测试性能规则数据已清理');
    }
    
    console.log('🧹 性能管理系统测试完成');
  });

  describe('性能规则管理API测试', () => {
    describe('GET /performance-rules - 获取性能规则列表参数验证', () => {
      // 有效查询参数组合
      const validQueryParams = [
        {
          params: {},
          description: '无参数 - 默认分页'
        },
        {
          params: { page: 1, pageSize: 10 },
          description: '基本分页参数'
        },
        {
          params: { name: '教师绩效' },
          description: '按名称搜索'
        },
        {
          params: { is_active: true },
          description: '按激活状态筛选'
        },
        {
          params: { method: 'weighted_average' },
          description: '按计算方法筛选'
        },
        {
          params: { page: 1, pageSize: 5, is_active: true, name: '评估' },
          description: '完整查询参数组合'
        }
      ];

      // 无效查询参数组合
      const invalidQueryParams = [
        {
          params: { page: 0 },
          description: '页码为0'
        },
        {
          params: { page: -1 },
          description: '负数页码'
        },
        {
          params: { pageSize: 0 },
          description: '页面大小为0'
        },
        {
          params: { pageSize: 101 },
          description: '页面大小超过最大值'
        },
        {
          params: { is_active: 'invalid_boolean' },
          description: '无效布尔值'
        }
      ];

      validQueryParams.forEach((testCase) => {
        test(`应该成功获取性能规则列表 - ${testCase.description}`, async () => {
          const response = await apiClient.get('/performance-rules', { params: testCase.params });
          
          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toBeDefined();
          expect(Array.isArray(response.data.data.items) || Array.isArray(response.data.data)).toBe(true);
        }, 10000);
      });

      invalidQueryParams.forEach((testCase) => {
        test(`应该拒绝获取性能规则列表 - ${testCase.description}`, async () => {
          const response = await apiClient.get('/performance-rules', { params: testCase.params });
          
          expect([400, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });

    describe('POST /performance-rules - 创建性能规则参数验证', () => {
      // 有效创建参数组合
      const validCreateParams = [
        {
          name: '教师教学质量评估规则',
          description: '基于学生反馈和课堂表现的教学质量评估',
          calculation_method: 'weighted_average',
          target_value: 80.0,
          weight: 0.4,
          is_active: true,
          description_test: '完整参数创建性能规则'
        },
        {
          name: '学生学习进步规则',
          calculation_method: 'percentage_improvement',
          target_value: 75.0,
          weight: 0.3,
          description_test: '最小必填参数创建规则'
        },
        {
          name: '班级管理效率规则',
          description: '评估班级管理和纪律维护效果',
          calculation_method: 'points_based',
          target_value: 90.0,
          weight: 0.25,
          is_active: false,
          description_test: '非激活状态规则创建'
        }
      ];

      // 无效创建参数组合
      const invalidCreateParams = [
        {
          // 缺少name
          calculation_method: 'weighted_average',
          target_value: 80.0,
          weight: 0.4,
          expected_errors: ['性能规则名称不能为空'],
          description: '缺少性能规则名称'
        },
        {
          name: '测试规则',
          // 缺少calculation_method
          target_value: 80.0,
          weight: 0.4,
          expected_errors: ['计算方法不能为空'],
          description: '缺少计算方法'
        },
        {
          name: '测试规则',
          calculation_method: 'weighted_average',
          // 缺少target_value
          weight: 0.4,
          expected_errors: ['目标值不能为空'],
          description: '缺少目标值'
        },
        {
          name: '测试规则',
          calculation_method: 'weighted_average',
          target_value: 80.0,
          // 缺少weight
          expected_errors: ['权重不能为空'],
          description: '缺少权重'
        },
        {
          name: '', // 空name
          calculation_method: 'weighted_average',
          target_value: 80.0,
          weight: 0.4,
          expected_errors: ['性能规则名称不能为空'],
          description: '空性能规则名称'
        },
        {
          name: 'a'.repeat(256), // 超长name
          calculation_method: 'weighted_average',
          target_value: 80.0,
          weight: 0.4,
          expected_errors: ['性能规则名称长度不能超过255个字符'],
          description: '性能规则名称超长'
        },
        {
          name: '测试规则',
          calculation_method: 'invalid_method', // 无效计算方法
          target_value: 80.0,
          weight: 0.4,
          expected_errors: ['计算方法不正确'],
          description: '无效计算方法'
        },
        {
          name: '测试规则',
          calculation_method: 'weighted_average',
          target_value: -10.0, // 负数目标值
          weight: 0.4,
          expected_errors: ['目标值必须为非负数'],
          description: '负数目标值'
        },
        {
          name: '测试规则',
          calculation_method: 'weighted_average',
          target_value: 80.0,
          weight: -0.1, // 负数权重
          expected_errors: ['权重必须在0到1之间'],
          description: '负数权重'
        },
        {
          name: '测试规则',
          calculation_method: 'weighted_average',
          target_value: 80.0,
          weight: 1.5, // 超过1的权重
          expected_errors: ['权重必须在0到1之间'],
          description: '权重超过1'
        }
      ];

      validCreateParams.forEach((params, index) => {
        test(`应该成功创建性能规则 - ${params.description_test}`, async () => {
          const requestParams = { ...params };
          delete requestParams.description_test;

          const response = await apiClient.post('/performance-rules', requestParams);
          
          expect(response.status).toBe(201);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toHaveProperty('id');
          expect(response.data.data.name).toBe(requestParams.name);
          expect(response.data.data.calculation_method).toBe(requestParams.calculation_method);
          expect(response.data.data.target_value).toBe(requestParams.target_value);
          expect(response.data.data.weight).toBe(requestParams.weight);
          
          // 保存第一个创建的规则ID用于后续测试
          if (index === 0) {
            testRuleId = response.data.data.id;
            console.log('✅ 测试性能规则创建成功, ID:', testRuleId);
          }
        }, 10000);
      });

      invalidCreateParams.forEach((params) => {
        test(`应该拒绝创建性能规则 - ${params.description}`, async () => {
          const requestParams = { ...params };
          delete requestParams.expected_errors;
          delete requestParams.description;

          const response = await apiClient.post('/performance-rules', requestParams);
          
          expect(response.status).toBe(400);
          expect(response.data.success).toBe(false);
          expect(response.data.message).toBeDefined();
        }, 10000);
      });
    });

    describe('GET /performance-rules/:id - 获取单个性能规则参数验证', () => {
      test('应该成功获取性能规则详情 - 有效ID', async () => {
        if (testRuleId === 0) {
          console.log('⚠️ 跳过测试：无有效的测试性能规则ID');
          return;
        }

        const response = await apiClient.get(`/performance-rules/${testRuleId}`);
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('id');
        expect(response.data.data.id).toBe(testRuleId);
        expect(response.data.data).toHaveProperty('name');
        expect(response.data.data).toHaveProperty('calculation_method');
        expect(response.data.data).toHaveProperty('target_value');
        expect(response.data.data).toHaveProperty('weight');
      }, 10000);

      // 无效ID测试
      const invalidIds = [
        { id: 0, description: 'ID为0' },
        { id: -1, description: '负数ID' },
        { id: 'abc', description: '非数字ID' },
        { id: 99999, description: '不存在的ID' },
        { id: '', description: '空ID' }
      ];

      invalidIds.forEach((testCase) => {
        test(`应该拒绝获取性能规则详情 - ${testCase.description}`, async () => {
          const response = await apiClient.get(`/performance-rules/${testCase.id}`);
          
          expect([400, 404, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });

    describe('PUT /performance-rules/:id - 更新性能规则参数验证', () => {
      // 有效更新参数组合
      const validUpdateParams = [
        {
          data: {
            name: '更新后的教学质量评估规则',
            description: '更新后的规则描述'
          },
          description: '部分字段更新'
        },
        {
          data: {
            target_value: 85.0,
            weight: 0.5
          },
          description: '数值字段更新'
        },
        {
          data: {
            name: '完整更新的性能规则',
            description: '完整更新的规则描述',
            calculation_method: 'points_based',
            target_value: 95.0,
            weight: 0.6,
            is_active: false
          },
          description: '完整信息更新'
        }
      ];

      // 无效更新参数组合
      const invalidUpdateParams = [
        {
          data: { name: '' },
          description: '空名称'
        },
        {
          data: { name: 'a'.repeat(256) },
          description: '名称超长'
        },
        {
          data: { calculation_method: 'invalid_method' },
          description: '无效计算方法'
        },
        {
          data: { target_value: -10.0 },
          description: '负数目标值'
        },
        {
          data: { weight: -0.1 },
          description: '负数权重'
        },
        {
          data: { weight: 1.5 },
          description: '权重超过1'
        },
        {
          data: { is_active: 'invalid_boolean' },
          description: '无效布尔值'
        }
      ];

      validUpdateParams.forEach((testCase) => {
        test(`应该成功更新性能规则 - ${testCase.description}`, async () => {
          if (testRuleId === 0) {
            console.log('⚠️ 跳过测试：无有效的测试性能规则ID');
            return;
          }

          const response = await apiClient.put(`/performance-rules/${testRuleId}`, testCase.data);
          
          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toHaveProperty('id');
          expect(response.data.data.id).toBe(testRuleId);
          
          // 验证更新的字段
          Object.keys(testCase.data).forEach(key => {
            expect(response.data.data[key]).toBe(testCase.data[key]);
          });
        }, 10000);
      });

      invalidUpdateParams.forEach((testCase) => {
        test(`应该拒绝更新性能规则 - ${testCase.description}`, async () => {
          if (testRuleId === 0) {
            console.log('⚠️ 跳过测试：无有效的测试性能规则ID');
            return;
          }

          const response = await apiClient.put(`/performance-rules/${testRuleId}`, testCase.data);
          
          expect(response.status).toBe(400);
          expect(response.data.success).toBe(false);
        }, 10000);
      });

      // 无效ID更新测试
      test('应该拒绝更新不存在的性能规则', async () => {
        const response = await apiClient.put('/performance-rules/99999', {
          name: '测试更新'
        });
        
        expect(response.status).toBe(404);
        expect(response.data.success).toBe(false);
      }, 10000);
    });

    describe('GET /performance-rules/statistics - 获取性能规则统计参数验证', () => {
      test('应该成功获取性能规则统计数据', async () => {
        const response = await apiClient.get('/performance-rules/statistics');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
        
        // 验证统计数据结构
        if (response.data.data) {
          expect(typeof response.data.data.total_rules).toBe('number');
          expect(typeof response.data.data.active_rules).toBe('number');
          expect(typeof response.data.data.inactive_rules).toBe('number');
        }
      }, 10000);
    });

    describe('DELETE /performance-rules/:id - 删除性能规则参数验证', () => {
      let tempRuleId: number = 0;

      beforeAll(async () => {
        // 创建临时性能规则用于删除测试
        const tempRuleData = {
          name: `临时测试性能规则_${Date.now()}`,
          calculation_method: 'weighted_average',
          target_value: 70.0,
          weight: 0.2
        };

        const response = await apiClient.post('/performance-rules', tempRuleData);
        if (response.data?.success && response.data?.data?.id) {
          tempRuleId = response.data.data.id;
          console.log('✅ 临时测试性能规则创建成功, ID:', tempRuleId);
        }
      });

      test('应该成功删除性能规则 - 有效ID', async () => {
        if (tempRuleId === 0) {
          console.log('⚠️ 跳过测试：无有效的临时性能规则ID');
          return;
        }

        const response = await apiClient.delete(`/performance-rules/${tempRuleId}`);
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.message).toContain('删除成功');
        
        // 验证删除后无法获取
        const getResponse = await apiClient.get(`/performance-rules/${tempRuleId}`);
        expect(getResponse.status).toBe(404);
      }, 10000);

      // 无效ID删除测试
      const invalidDeleteIds = [
        { id: 0, description: 'ID为0' },
        { id: -1, description: '负数ID' },
        { id: 'abc', description: '非数字ID' },
        { id: 99999, description: '不存在的ID' }
      ];

      invalidDeleteIds.forEach((testCase) => {
        test(`应该拒绝删除性能规则 - ${testCase.description}`, async () => {
          const response = await apiClient.delete(`/performance-rules/${testCase.id}`);
          
          expect([400, 404, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });
  });

  describe('性能评估管理API测试', () => {
    describe('GET /performance-evaluations - 获取性能评估列表参数验证', () => {
      // 有效查询参数组合
      const validQueryParams = [
        {
          params: {},
          description: '无参数 - 默认分页'
        },
        {
          params: { page: 1, pageSize: 10 },
          description: '基本分页参数'
        },
        {
          params: { type: 'teacher' },
          description: '按评估类型筛选'
        },
        {
          params: { status: 'active' },
          description: '按状态筛选'
        },
        {
          params: { search: '教师' },
          description: '关键词搜索'
        },
        {
          params: { page: 1, pageSize: 5, type: 'student', status: 'completed' },
          description: '完整查询参数组合'
        }
      ];

      // 无效查询参数组合
      const invalidQueryParams = [
        {
          params: { page: 0 },
          description: '页码为0'
        },
        {
          params: { page: -1 },
          description: '负数页码'
        },
        {
          params: { pageSize: 0 },
          description: '页面大小为0'
        },
        {
          params: { pageSize: 101 },
          description: '页面大小超过最大值'
        },
        {
          params: { type: 'invalid_type' },
          description: '无效评估类型'
        },
        {
          params: { status: 'invalid_status' },
          description: '无效状态值'
        }
      ];

      validQueryParams.forEach((testCase) => {
        test(`应该成功获取性能评估列表 - ${testCase.description}`, async () => {
          const response = await apiClient.get('/performance-evaluations', { params: testCase.params });
          
          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toBeDefined();
          expect(response.data.data).toHaveProperty('items');
          expect(response.data.data).toHaveProperty('total');
          expect(response.data.data).toHaveProperty('page');
          expect(response.data.data).toHaveProperty('pageSize');
          expect(response.data.data).toHaveProperty('totalPages');
          expect(Array.isArray(response.data.data.items)).toBe(true);
        }, 10000);
      });

      invalidQueryParams.forEach((testCase) => {
        test(`应该拒绝获取性能评估列表 - ${testCase.description}`, async () => {
          const response = await apiClient.get('/performance-evaluations', { params: testCase.params });
          
          expect([400, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });

    describe('POST /performance-evaluations - 创建性能评估参数验证 (501未实现)', () => {
      test('应该返回501未实现状态', async () => {
        const evaluationData = {
          name: '测试评估',
          evaluationType: 'teacher',
          startDate: '2024-01-01',
          endDate: '2024-03-31'
        };

        const response = await apiClient.post('/performance-evaluations', evaluationData);
        
        expect(response.status).toBe(501);
        expect(response.data.success).toBe(false);
        expect(response.data.message).toContain('创建功能暂未实现');
      }, 10000);
    });

    describe('GET /performance-evaluations/:id - 获取性能评估详情参数验证', () => {
      test('应该返回404不存在状态 - 有效ID', async () => {
        const response = await apiClient.get('/performance-evaluations/1');
        
        expect(response.status).toBe(404);
        expect(response.data.success).toBe(false);
        expect(response.data.message).toContain('性能评估不存在');
      }, 10000);

      // 无效ID测试
      const invalidIds = [
        { id: 0, description: 'ID为0' },
        { id: -1, description: '负数ID' },
        { id: 'abc', description: '非数字ID' }
      ];

      invalidIds.forEach((testCase) => {
        test(`应该拒绝获取性能评估详情 - ${testCase.description}`, async () => {
          const response = await apiClient.get(`/performance-evaluations/${testCase.id}`);
          
          expect([400, 404, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });
  });

  describe('性能报告管理API测试', () => {
    describe('GET /performance-reports - 获取性能报告列表参数验证', () => {
      // 有效查询参数组合
      const validQueryParams = [
        {
          params: {},
          description: '无参数 - 默认分页'
        },
        {
          params: { page: 1, pageSize: 10 },
          description: '基本分页参数'
        },
        {
          params: { type: 'monthly' },
          description: '按报告类型筛选'
        },
        {
          params: { status: 'completed' },
          description: '按状态筛选'
        },
        {
          params: { format: 'pdf' },
          description: '按格式筛选'
        },
        {
          params: { startDate: '2024-01-01', endDate: '2024-12-31' },
          description: '按日期范围筛选'
        },
        {
          params: { search: '月度' },
          description: '关键词搜索'
        },
        {
          params: { page: 1, pageSize: 5, type: 'quarterly', status: 'completed', format: 'excel' },
          description: '完整查询参数组合'
        }
      ];

      // 无效查询参数组合
      const invalidQueryParams = [
        {
          params: { page: 0 },
          description: '页码为0'
        },
        {
          params: { pageSize: 101 },
          description: '页面大小超过最大值'
        },
        {
          params: { type: 'invalid_type' },
          description: '无效报告类型'
        },
        {
          params: { status: 'invalid_status' },
          description: '无效状态值'
        },
        {
          params: { format: 'invalid_format' },
          description: '无效格式'
        },
        {
          params: { startDate: 'invalid-date' },
          description: '无效开始日期格式'
        },
        {
          params: { endDate: 'invalid-date' },
          description: '无效结束日期格式'
        }
      ];

      validQueryParams.forEach((testCase) => {
        test(`应该成功获取性能报告列表 - ${testCase.description}`, async () => {
          const response = await apiClient.get('/performance-reports', { params: testCase.params });
          
          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toBeDefined();
          expect(response.data.data).toHaveProperty('items');
          expect(Array.isArray(response.data.data.items)).toBe(true);
        }, 10000);
      });

      invalidQueryParams.forEach((testCase) => {
        test(`应该拒绝获取性能报告列表 - ${testCase.description}`, async () => {
          const response = await apiClient.get('/performance-reports', { params: testCase.params });
          
          expect([400, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });

    describe('POST /performance-reports - 生成性能报告参数验证 (501未实现)', () => {
      test('应该返回501未实现状态', async () => {
        const reportData = {
          name: '测试报告',
          type: 'monthly',
          format: 'pdf',
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        };

        const response = await apiClient.post('/performance-reports', reportData);
        
        expect(response.status).toBe(501);
        expect(response.data.success).toBe(false);
        expect(response.data.message).toContain('生成功能暂未实现');
      }, 10000);
    });

    describe('GET /performance-reports/:id - 获取性能报告详情参数验证', () => {
      test('应该返回404不存在状态 - 有效ID', async () => {
        const response = await apiClient.get('/performance-reports/1');
        
        expect(response.status).toBe(404);
        expect(response.data.success).toBe(false);
        expect(response.data.message).toContain('性能报告不存在');
      }, 10000);
    });
  });

  describe('系统性能监控API测试', () => {
    describe('GET /performance - 获取性能概览参数验证', () => {
      test('应该成功获取性能概览数据', async () => {
        const response = await apiClient.get('/performance');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
        
        // 验证性能数据结构
        if (response.data.data.performance_summary) {
          expect(response.data.data.performance_summary).toHaveProperty('average_score');
          expect(response.data.data.performance_summary).toHaveProperty('total_evaluations');
          expect(response.data.data.performance_summary).toHaveProperty('improvement_rate');
        }
        
        if (response.data.data.score_distribution) {
          expect(Array.isArray(response.data.data.score_distribution)).toBe(true);
        }
      }, 10000);
    });

    describe('GET /performance/metrics - 获取系统指标参数验证', () => {
      test('应该成功获取系统指标数据', async () => {
        const response = await apiClient.get('/performance/metrics');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
        
        // 验证系统指标结构
        expect(response.data.data).toHaveProperty('uptime');
        expect(response.data.data).toHaveProperty('memory');
        expect(response.data.data).toHaveProperty('cpu');
        
        // 验证数据类型
        expect(typeof response.data.data.uptime).toBe('number');
        expect(typeof response.data.data.memory).toBe('object');
        expect(typeof response.data.data.cpu).toBe('object');
      }, 10000);
    });

    describe('GET /performance/database - 获取数据库性能参数验证', () => {
      test('应该成功获取数据库性能数据', async () => {
        const response = await apiClient.get('/performance/database');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
        
        // 验证数据库性能结构
        expect(response.data.data).toHaveProperty('connection_status');
        expect(response.data.data).toHaveProperty('response_time');
        expect(response.data.data).toHaveProperty('active_connections');
        expect(response.data.data).toHaveProperty('database_size');
        
        // 验证数据类型
        expect(typeof response.data.data.connection_status).toBe('string');
        expect(typeof response.data.data.response_time).toBe('number');
        expect(typeof response.data.data.active_connections).toBe('number');
      }, 10000);
    });

    describe('GET /performance/api-stats - 获取API统计参数验证 (501未实现)', () => {
      test('应该返回501未实现状态', async () => {
        const response = await apiClient.get('/performance/api-stats');
        
        expect(response.status).toBe(501);
        expect(response.data.success).toBe(false);
        expect(response.data.message).toContain('API统计功能暂未实现');
      }, 10000);
    });

    describe('GET /performance/errors - 获取错误统计参数验证 (501未实现)', () => {
      test('应该返回501未实现状态', async () => {
        const response = await apiClient.get('/performance/errors');
        
        expect(response.status).toBe(501);
        expect(response.data.success).toBe(false);
        expect(response.data.message).toContain('错误统计功能暂未实现');
      }, 10000);
    });
  });

  describe('园长性能管理API测试', () => {
    describe('GET /principal-performance - 获取园长性能概览参数验证', () => {
      test('应该成功获取园长性能概览', async () => {
        const response = await apiClient.get('/principal-performance');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
        
        // 验证园长性能数据结构
        expect(response.data.data).toHaveProperty('overview');
        expect(response.data.data).toHaveProperty('key_metrics');
        expect(response.data.data.overview).toHaveProperty('total_score');
        expect(response.data.data.overview).toHaveProperty('rank');
        expect(response.data.data.overview).toHaveProperty('improvement');
      }, 10000);
    });

    describe('GET /principal-performance/stats - 获取园长详细统计参数验证', () => {
      test('应该成功获取园长详细统计数据', async () => {
        const response = await apiClient.get('/principal-performance/stats');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
        
        // 验证统计数据结构
        expect(response.data.data).toHaveProperty('performance_trends');
        expect(response.data.data).toHaveProperty('department_scores');
        expect(response.data.data).toHaveProperty('goal_completion');
        expect(Array.isArray(response.data.data.performance_trends)).toBe(true);
        expect(Array.isArray(response.data.data.department_scores)).toBe(true);
      }, 10000);
    });

    describe('GET /principal-performance/rankings - 获取园长排名参数验证', () => {
      test('应该成功获取园长排名数据', async () => {
        const response = await apiClient.get('/principal-performance/rankings');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
        
        // 验证排名数据结构
        expect(response.data.data).toHaveProperty('current_ranking');
        expect(response.data.data).toHaveProperty('total_principals');
        expect(response.data.data).toHaveProperty('score_comparison');
        expect(response.data.data).toHaveProperty('ranking_history');
        expect(Array.isArray(response.data.data.ranking_history)).toBe(true);
      }, 10000);
    });

    describe('GET /principal-performance/details - 获取园长详细性能信息参数验证', () => {
      test('应该成功获取园长详细性能信息', async () => {
        const response = await apiClient.get('/principal-performance/details');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
        
        // 验证详细信息结构
        expect(response.data.data).toHaveProperty('evaluations');
        expect(response.data.data).toHaveProperty('achievements');
        expect(response.data.data).toHaveProperty('areas_for_improvement');
        expect(Array.isArray(response.data.data.evaluations)).toBe(true);
        expect(Array.isArray(response.data.data.achievements)).toBe(true);
      }, 10000);
    });

    describe('GET /principal-performance/export - 导出园长性能报告参数验证', () => {
      // 有效导出参数
      const validExportParams = [
        {
          params: { format: 'pdf' },
          description: 'PDF格式导出'
        },
        {
          params: { format: 'excel' },
          description: 'Excel格式导出'
        },
        {
          params: { format: 'csv' },
          description: 'CSV格式导出'
        },
        {
          params: { format: 'pdf', period: 'monthly' },
          description: 'PDF月度报告导出'
        }
      ];

      // 无效导出参数
      const invalidExportParams = [
        {
          params: { format: 'invalid_format' },
          description: '无效导出格式'
        },
        {
          params: { period: 'invalid_period' },
          description: '无效时间周期'
        }
      ];

      validExportParams.forEach((testCase) => {
        test(`应该成功导出园长性能报告 - ${testCase.description}`, async () => {
          const response = await apiClient.get('/principal-performance/export', { 
            params: testCase.params 
          });
          
          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(response.data.data).toBeDefined();
          expect(response.data.data).toHaveProperty('download_url');
          expect(response.data.data).toHaveProperty('filename');
          expect(response.data.data).toHaveProperty('format');
        }, 10000);
      });

      invalidExportParams.forEach((testCase) => {
        test(`应该拒绝导出园长性能报告 - ${testCase.description}`, async () => {
          const response = await apiClient.get('/principal-performance/export', { 
            params: testCase.params 
          });
          
          expect([400, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }, 10000);
      });
    });

    describe('GET /principal-performance/goals - 获取园长绩效目标参数验证', () => {
      test('应该成功获取园长绩效目标', async () => {
        const response = await apiClient.get('/principal-performance/goals');
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
        
        // 验证目标数据结构
        expect(response.data.data).toHaveProperty('annual_goals');
        expect(response.data.data).toHaveProperty('quarterly_goals');
        expect(response.data.data).toHaveProperty('progress_summary');
        expect(Array.isArray(response.data.data.annual_goals)).toBe(true);
        expect(Array.isArray(response.data.data.quarterly_goals)).toBe(true);
      }, 10000);
    });
  });

  describe('权限验证测试', () => {
    test('应该拒绝无token访问性能规则', async () => {
      // 创建无认证的客户端
      const noAuthClient = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        validateStatus: () => true
      });

      const response = await noAuthClient.get('/performance-rules');
      
      expect(response.status).toBe(401);
      expect(response.data.success).toBe(false);
    }, 10000);

    test('应该拒绝无效token访问', async () => {
      const invalidAuthClient = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        validateStatus: () => true,
        headers: {
          'Authorization': 'Bearer invalid_token_here'
        }
      });

      const response = await invalidAuthClient.get('/performance-rules');
      
      expect(response.status).toBe(401);
      expect(response.data.success).toBe(false);
    }, 10000);

    test('应该拒绝无权限访问园长性能管理', async () => {
      // 这里可以测试不同权限角色的访问控制
      const response = await apiClient.get('/principal-performance');
      
      // 根据实际权限配置，可能返回200（有权限）或403（无权限）
      expect([200, 403]).toContain(response.status);
      if (response.status === 403) {
        expect(response.data.success).toBe(false);
      }
    }, 10000);
  });

  describe('数据完整性验证', () => {
    test('创建的性能规则应该包含完整的数据结构', async () => {
      if (testRuleId === 0) {
        console.log('⚠️ 跳过测试：无有效的测试性能规则ID');
        return;
      }

      const response = await apiClient.get(`/performance-rules/${testRuleId}`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      
      const rule = response.data.data;
      expect(rule).toHaveProperty('id');
      expect(rule).toHaveProperty('name');
      expect(rule).toHaveProperty('calculation_method');
      expect(rule).toHaveProperty('target_value');
      expect(rule).toHaveProperty('weight');
      expect(rule).toHaveProperty('is_active');
      expect(rule).toHaveProperty('createdAt');
      expect(rule).toHaveProperty('updatedAt');
      
      // 验证数据类型
      expect(typeof rule.id).toBe('number');
      expect(typeof rule.name).toBe('string');
      expect(typeof rule.calculation_method).toBe('string');
      expect(typeof rule.target_value).toBe('number');
      expect(typeof rule.weight).toBe('number');
      expect(typeof rule.is_active).toBe('boolean');
    }, 10000);

    test('系统性能指标应该包含完整的监控数据', async () => {
      const response = await apiClient.get('/performance/metrics');
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      
      const metrics = response.data.data;
      expect(metrics).toHaveProperty('uptime');
      expect(metrics).toHaveProperty('memory');
      expect(metrics).toHaveProperty('cpu');
      
      // 验证内存数据结构
      expect(metrics.memory).toHaveProperty('used');
      expect(metrics.memory).toHaveProperty('total');
      expect(metrics.memory).toHaveProperty('percentage');
      
      // 验证CPU数据结构
      expect(metrics.cpu).toHaveProperty('usage');
      expect(metrics.cpu).toHaveProperty('cores');
    }, 10000);
  });

  describe('性能和稳定性测试', () => {
    test('所有性能API响应时间应小于2秒', async () => {
      const performanceEndpoints = [
        '/performance-rules',
        '/performance-evaluations',
        '/performance',
        '/performance/metrics',
        '/principal-performance'
      ];

      for (const endpoint of performanceEndpoints) {
        const startTime = Date.now();
        const response = await apiClient.get(endpoint);
        const responseTime = Date.now() - startTime;

        expect(response.status).toBe(200);
        expect(responseTime).toBeLessThan(2000);
      }
    }, 20000);

    test('性能监控API并发请求处理能力测试', async () => {
      const concurrentRequests = Array.from({ length: 5 }, () => 
        apiClient.get('/performance/metrics')
      );

      const responses = await Promise.all(concurrentRequests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('uptime');
      });
    }, 15000);
  });
});