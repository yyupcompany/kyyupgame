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

interface Kindergarten {
  id: number;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  principal_id: number;
  capacity?: number;
  description?: string;
  established_date?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

describe('幼儿园管理API全面测试 - 参数验证', () => {
  let authToken: string = '';
  let testKindergartenId: number = 0;
  let testPrincipalId: number = 0;

  beforeAll(async () => {
    console.log('🚀 开始幼儿园管理API全面测试...');
    console.log('📋 测试范围: 5个幼儿园管理端点的完整参数验证');
    
    try {
      // 使用真实的认证凭据获取token
      authToken = await getAuthToken('admin');
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      console.log('✅ 管理员认证成功');
    } catch (error) {
      console.error('❌ 管理员认证失败:', error);
      throw new Error('Failed to authenticate admin user');
    }

    // 创建测试用户作为园长
    const userData = TestDataFactory.createUser({
      username: `test_principal_${Date.now()}`,
      email: `principal_${Date.now()}@test.com`,
      role: 'principal'
    });

    const userResponse = await apiClient.post('/users', userData);
    if (userResponse.data?.success && userResponse.data?.data?.id) {
      testPrincipalId = userResponse.data.data.id;
      console.log('✅ 测试园长用户创建成功, ID:', testPrincipalId);
    }
  });

  afterAll(async () => {
    // 清理测试数据
    if (testKindergartenId > 0) {
      await apiClient.delete(`/kindergartens/${testKindergartenId}`);
      console.log('🧹 测试幼儿园数据已清理');
    }
    
    if (testPrincipalId > 0) {
      await apiClient.delete(`/users/${testPrincipalId}`);
      console.log('🧹 测试园长用户数据已清理');
    }
    
    console.log('🧹 幼儿园管理测试完成');
  });

  describe('POST /kindergartens - 创建幼儿园参数验证', () => {
    // 有效创建参数组合
    const validCreateParams = [
      {
        name: '阳光幼儿园测试',
        address: '北京市朝阳区阳光街道123号',
        phone: '010-12345678',
        email: 'sunshine@test.com',
        principal_id: () => testPrincipalId,
        capacity: 200,
        description: '专注于儿童全面发展的优质幼儿园',
        established_date: '2020-01-01',
        status: 'active' as const,
        description_test: '完整参数创建幼儿园'
      },
      {
        name: '希望幼儿园最小参数',
        address: '上海市浦东新区希望路456号',
        principal_id: () => testPrincipalId,
        description_test: '最小必填参数创建幼儿园'
      }
    ];

    // 无效创建参数组合
    const invalidCreateParams = [
      {
        // 缺少name
        address: '测试地址',
        principal_id: () => testPrincipalId,
        expected_errors: ['幼儿园名称不能为空'],
        description: '缺少幼儿园名称'
      },
      {
        name: '测试幼儿园',
        // 缺少address
        principal_id: () => testPrincipalId,
        expected_errors: ['地址不能为空'],
        description: '缺少地址'
      },
      {
        name: '测试幼儿园',
        address: '测试地址',
        // 缺少principal_id
        expected_errors: ['园长ID不能为空'],
        description: '缺少园长ID'
      },
      {
        name: '', // 空name
        address: '测试地址',
        principal_id: () => testPrincipalId,
        expected_errors: ['幼儿园名称不能为空'],
        description: '空幼儿园名称'
      },
      {
        name: 'a'.repeat(101), // 超长name
        address: '测试地址',
        principal_id: () => testPrincipalId,
        expected_errors: ['幼儿园名称长度不能超过100个字符'],
        description: '幼儿园名称超长'
      },
      {
        name: '测试幼儿园',
        address: 'a'.repeat(256), // 超长address
        principal_id: () => testPrincipalId,
        expected_errors: ['地址长度不能超过255个字符'],
        description: '地址超长'
      },
      {
        name: '测试幼儿园',
        address: '测试地址',
        principal_id: () => testPrincipalId,
        phone: 'a'.repeat(21), // 超长phone
        expected_errors: ['电话号码长度不能超过20个字符'],
        description: '电话号码超长'
      },
      {
        name: '测试幼儿园',
        address: '测试地址',
        principal_id: () => testPrincipalId,
        email: 'invalid-email', // 无效email
        expected_errors: ['邮箱格式不正确'],
        description: '无效邮箱格式'
      },
      {
        name: '测试幼儿园',
        address: '测试地址',
        principal_id: () => testPrincipalId,
        capacity: 0, // 无效capacity
        expected_errors: ['容量必须大于0'],
        description: '无效容量值'
      },
      {
        name: '测试幼儿园',
        address: '测试地址',
        principal_id: () => testPrincipalId,
        status: 'invalid_status', // 无效status
        expected_errors: ['状态值不正确'],
        description: '无效状态值'
      }
    ];

    validCreateParams.forEach((params, index) => {
      test(`应该成功创建幼儿园 - ${params.description_test}`, async () => {
        const requestParams = { ...params } as any;
        delete requestParams.description_test;
        
        // 处理函数类型的principal_id
        if (typeof requestParams.principal_id === 'function') {
          requestParams.principal_id = requestParams.principal_id();
        }

        const response = await apiClient.post('/kindergartens', requestParams);
        
        expect(response.status).toBe(201);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('id');
        expect(response.data.data.name).toBe(requestParams.name);
        expect(response.data.data.address).toBe(requestParams.address);
        expect(response.data.data.principal_id).toBe(requestParams.principal_id);
        
        // 保存第一个创建的幼儿园ID用于后续测试
        if (index === 0) {
          testKindergartenId = response.data.data.id;
          console.log('✅ 测试幼儿园创建成功, ID:', testKindergartenId);
        }
      }, 10000);
    });

    invalidCreateParams.forEach((params) => {
      test(`应该拒绝创建幼儿园 - ${params.description}`, async () => {
        const requestParams = { ...params } as any;
        delete requestParams.expected_errors;
        delete requestParams.description;
        
        // 处理函数类型的principal_id
        if (typeof requestParams.principal_id === 'function') {
          requestParams.principal_id = requestParams.principal_id();
        }

        const response = await apiClient.post('/kindergartens', requestParams);
        
        expect(response.status).toBe(400);
        expect(response.data.success).toBe(false);
        expect(response.data.message).toBeDefined();
      }, 10000);
    });
  });

  describe('GET /kindergartens - 获取幼儿园列表参数验证', () => {
    // 有效查询参数组合
    const validQueryParams = [
      {
        params: {},
        description: '无参数 - 默认分页'
      },
      {
        params: { page: 1, limit: 10 },
        description: '基本分页参数'
      },
      {
        params: { page: 2, limit: 20, status: 'active' },
        description: '分页+状态筛选'
      },
      {
        params: { search: '阳光' },
        description: '关键词搜索'
      },
      {
        params: { principal_id: testPrincipalId || 1 },
        description: '按园长ID筛选'
      },
      {
        params: { page: 1, limit: 5, status: 'active', search: '测试' },
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
        params: { limit: 0 },
        description: '限制数量为0'
      },
      {
        params: { limit: 101 },
        description: '限制数量超过最大值'
      },
      {
        params: { status: 'invalid_status' },
        description: '无效状态值'
      },
      {
        params: { principal_id: 'invalid_id' },
        description: '无效园长ID格式'
      }
    ];

    validQueryParams.forEach((testCase) => {
      test(`应该成功获取幼儿园列表 - ${testCase.description}`, async () => {
        // 处理principal_id为0的情况
        if (testCase.params.principal_id === 0) {
          testCase.params.principal_id = testPrincipalId;
        }

        const response = await apiClient.get('/kindergartens', { params: testCase.params });
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('items');
        expect(response.data.data).toHaveProperty('page');
        expect(response.data.data).toHaveProperty('pageSize');
        expect(response.data.data).toHaveProperty('total');
        expect(Array.isArray(response.data.data.items)).toBe(true);
      }, 10000);
    });

    invalidQueryParams.forEach((testCase) => {
      test(`应该拒绝获取幼儿园列表 - ${testCase.description}`, async () => {
        const response = await apiClient.get('/kindergartens', { params: testCase.params });
        
        expect([400, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      }, 10000);
    });
  });

  describe('GET /kindergartens/:id - 获取单个幼儿园参数验证', () => {
    test('应该成功获取幼儿园详情 - 有效ID', async () => {
      if (testKindergartenId === 0) {
        console.log('⚠️ 跳过测试：无有效的测试幼儿园ID');
        return;
      }

      const response = await apiClient.get(`/kindergartens/${testKindergartenId}`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('id');
      expect(response.data.data.id).toBe(testKindergartenId);
      expect(response.data.data).toHaveProperty('name');
      expect(response.data.data).toHaveProperty('address');
      expect(response.data.data).toHaveProperty('principal_id');
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
      test(`应该拒绝获取幼儿园详情 - ${testCase.description}`, async () => {
        const response = await apiClient.get(`/kindergartens/${testCase.id}`);
        
        expect([400, 404, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      }, 10000);
    });
  });

  describe('PUT /kindergartens/:id - 更新幼儿园参数验证', () => {
    // 有效更新参数组合
    const validUpdateParams = [
      {
        data: {
          name: '更新后的幼儿园名称',
          phone: '010-87654321'
        },
        description: '部分字段更新'
      },
      {
        data: {
          status: 'inactive' as const
        },
        description: '状态更新'
      },
      {
        data: {
          name: '完整更新的幼儿园',
          address: '北京市海淀区新地址789号',
          phone: '010-99999999',
          email: 'updated@test.com',
          capacity: 300,
          description: '更新后的幼儿园描述',
          status: 'active' as const
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
        data: { name: 'a'.repeat(101) },
        description: '名称超长'
      },
      {
        data: { address: 'a'.repeat(256) },
        description: '地址超长'
      },
      {
        data: { phone: 'a'.repeat(21) },
        description: '电话超长'
      },
      {
        data: { email: 'invalid-email' },
        description: '无效邮箱'
      },
      {
        data: { capacity: 0 },
        description: '无效容量'
      },
      {
        data: { status: 'invalid_status' },
        description: '无效状态'
      }
    ];

    validUpdateParams.forEach((testCase) => {
      test(`应该成功更新幼儿园 - ${testCase.description}`, async () => {
        if (testKindergartenId === 0) {
          console.log('⚠️ 跳过测试：无有效的测试幼儿园ID');
          return;
        }

        const response = await apiClient.put(`/kindergartens/${testKindergartenId}`, testCase.data);
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('id');
        expect(response.data.data.id).toBe(testKindergartenId);
        
        // 验证更新的字段
        Object.keys(testCase.data).forEach(key => {
          expect(response.data.data[key]).toBe(testCase.data[key]);
        });
      }, 10000);
    });

    invalidUpdateParams.forEach((testCase) => {
      test(`应该拒绝更新幼儿园 - ${testCase.description}`, async () => {
        if (testKindergartenId === 0) {
          console.log('⚠️ 跳过测试：无有效的测试幼儿园ID');
          return;
        }

        const response = await apiClient.put(`/kindergartens/${testKindergartenId}`, testCase.data);
        
        expect(response.status).toBe(400);
        expect(response.data.success).toBe(false);
      }, 10000);
    });

    // 无效ID更新测试
    test('应该拒绝更新不存在的幼儿园', async () => {
      const response = await apiClient.put('/kindergartens/99999', {
        name: '测试更新'
      });
      
      expect(response.status).toBe(404);
      expect(response.data.success).toBe(false);
    }, 10000);
  });

  describe('DELETE /kindergartens/:id - 删除幼儿园参数验证', () => {
    let tempKindergartenId: number = 0;

    beforeAll(async () => {
      // 创建临时幼儿园用于删除测试
      const tempKindergartenData = {
        name: `临时测试幼儿园_${Date.now()}`,
        address: '临时测试地址',
        principal_id: testPrincipalId
      };

      const response = await apiClient.post('/kindergartens', tempKindergartenData);
      if (response.data?.success && response.data?.data?.id) {
        tempKindergartenId = response.data.data.id;
        console.log('✅ 临时测试幼儿园创建成功, ID:', tempKindergartenId);
      }
    });

    test('应该成功删除幼儿园 - 有效ID', async () => {
      if (tempKindergartenId === 0) {
        console.log('⚠️ 跳过测试：无有效的临时幼儿园ID');
        return;
      }

      const response = await apiClient.delete(`/kindergartens/${tempKindergartenId}`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toContain('删除成功');
      
      // 验证删除后无法获取
      const getResponse = await apiClient.get(`/kindergartens/${tempKindergartenId}`);
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
      test(`应该拒绝删除幼儿园 - ${testCase.description}`, async () => {
        const response = await apiClient.delete(`/kindergartens/${testCase.id}`);
        
        expect([400, 404, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      }, 10000);
    });
  });

  describe('权限验证测试', () => {
    test('应该拒绝无token访问', async () => {
      // 创建无认证的客户端
      const noAuthClient = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        validateStatus: () => true
      });

      const response = await noAuthClient.get('/kindergartens');
      
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

      const response = await invalidAuthClient.get('/kindergartens');
      
      expect(response.status).toBe(401);
      expect(response.data.success).toBe(false);
    }, 10000);
  });

  describe('数据完整性验证', () => {
    test('创建的幼儿园应该包含完整的数据结构', async () => {
      if (testKindergartenId === 0) {
        console.log('⚠️ 跳过测试：无有效的测试幼儿园ID');
        return;
      }

      const response = await apiClient.get(`/kindergartens/${testKindergartenId}`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      
      const kindergarten = response.data.data;
      expect(kindergarten).toHaveProperty('id');
      expect(kindergarten).toHaveProperty('name');
      expect(kindergarten).toHaveProperty('address');
      expect(kindergarten).toHaveProperty('principal_id');
      expect(kindergarten).toHaveProperty('status');
      expect(kindergarten).toHaveProperty('created_at');
      expect(kindergarten).toHaveProperty('updated_at');
      
      // 验证数据类型
      expect(typeof kindergarten.id).toBe('number');
      expect(typeof kindergarten.name).toBe('string');
      expect(typeof kindergarten.address).toBe('string');
      expect(typeof kindergarten.principal_id).toBe('number');
      expect(['active', 'inactive', 'pending']).toContain(kindergarten.status);
    }, 10000);
  });
});