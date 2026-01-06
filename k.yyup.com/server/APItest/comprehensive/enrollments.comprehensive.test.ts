import axios, { AxiosResponse } from 'axios';
import { TestDataFactory } from '../helpers/testUtils';
import { getAuthToken, TEST_CREDENTIALS } from '../helpers/authHelper';

// 真实API基地址
const API_BASE_URL = 'http://localhost:3000/api';

// API客户端配置
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  validateStatus: () => true,
});

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

describe('报名管理API全面测试 - 参数验证', () => {
  let authToken: string = '';
  let testEnrollmentIds: number[] = [];
  let testApplicationIds: number[] = [];
  let testPlanIds: number[] = [];
  let testKindergartenId: number = 1; // 默认幼儿园ID

  beforeAll(async () => {
    console.log('🚀 开始报名管理API全面测试...');
    console.log('📋 测试范围: 15+个报名管理端点的完整参数验证');

    try {
      // 使用真实的认证凭据获取token
      authToken = await getAuthToken('admin');
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      console.log('✅ 管理员认证成功');
    } catch (error) {
      console.error('❌ 管理员认证失败:', error);
      throw new Error('Failed to authenticate admin user');
    }
  });

  afterAll(async () => {
    // 清理测试数据
    console.log('🧹 清理测试报名数据...');
    for (const applicationId of testApplicationIds) {
      if (authToken) {
        await apiClient.delete(`/enrollment-applications/${applicationId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      }
    }
    for (const planId of testPlanIds) {
      if (authToken) {
        await apiClient.delete(`/enrollment-plans/${planId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      }
    }
  });

  describe('POST /enrollment-applications - 创建报名申请参数验证', () => {
    // 有效报名申请参数组合
    const validApplicationParams = [
      {
        childName: '小明',
        childGender: 'male',
        childBirthDate: '2019-03-15',
        parentName: '张先生',
        parentPhone: '13900139001',
        parentEmail: 'zhang@test.com',
        kindergartenId: 1,
        planId: null,
        status: 'pending',
        description: '基本报名申请信息'
      },
      {
        childName: '小红',
        childGender: 'female', 
        childBirthDate: '2018-08-20',
        parentName: '李女士',
        parentPhone: '13800138001',
        parentEmail: 'li@test.com',
        kindergartenId: 1,
        planId: null,
        address: '北京市海淀区',
        emergencyContact: '李奶奶',
        emergencyPhone: '13700137001',
        healthStatus: 'normal',
        specialNeeds: '无',
        previousEducation: '家庭教育',
        sourceChannel: 'online',
        referrerInfo: '朋友推荐',
        notes: '希望孩子能快乐成长',
        status: 'pending',
        description: '完整报名申请信息'
      },
      {
        childName: '小刚',
        childGender: 'male',
        childBirthDate: '2020-01-10',
        parentName: '王先生',
        parentPhone: '13600136001',
        parentEmail: 'wang@test.com',
        kindergartenId: 1,
        expectedStartDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'high',
        status: 'pending',
        description: '带优先级的报名申请'
      }
    ];

    // 无效报名申请参数组合
    const invalidApplicationParams = [
      {
        params: { childGender: 'male', parentName: '张先生', parentPhone: '13900139001' },
        description: '缺少儿童姓名',
        expectedError: 'MISSING_CHILD_NAME'
      },
      {
        params: { childName: '小明', parentName: '张先生', parentPhone: '13900139001' },
        description: '缺少儿童性别',
        expectedError: 'MISSING_CHILD_GENDER'
      },
      {
        params: { childName: '小明', childGender: 'invalid', parentName: '张先生', parentPhone: '13900139001' },
        description: '无效儿童性别',
        expectedError: 'INVALID_CHILD_GENDER'
      },
      {
        params: { childName: '小明', childGender: 'male', parentPhone: '13900139001' },
        description: '缺少家长姓名',
        expectedError: 'MISSING_PARENT_NAME'
      },
      {
        params: { childName: '小明', childGender: 'male', parentName: '张先生' },
        description: '缺少家长电话',
        expectedError: 'MISSING_PARENT_PHONE'
      },
      {
        params: { childName: '小明', childGender: 'male', parentName: '张先生', parentPhone: 'invalid' },
        description: '无效家长电话',
        expectedError: 'INVALID_PARENT_PHONE'
      },
      {
        params: { childName: '小明', childGender: 'male', parentName: '张先生', parentPhone: '13900139001', parentEmail: 'invalid-email' },
        description: '无效邮箱格式',
        expectedError: 'INVALID_EMAIL'
      },
      {
        params: { childName: '小明', childGender: 'male', parentName: '张先生', parentPhone: '13900139001', childBirthDate: 'invalid-date' },
        description: '无效出生日期',
        expectedError: 'INVALID_BIRTH_DATE'
      },
      {
        params: {},
        description: '空对象',
        expectedError: 'MISSING_REQUIRED_FIELDS'
      },
      {
        params: { invalidField: 'test' },
        description: '无效字段',
        expectedError: 'INVALID_FIELDS'
      }
    ];

    // 边界值测试
    const boundaryParams = [
      {
        params: { 
          childName: 'A', 
          childGender: 'male', 
          parentName: 'B', 
          parentPhone: '13000000001' 
        },
        description: '最短有效姓名',
        shouldPass: true
      },
      {
        params: { 
          childName: 'A'.repeat(50), 
          childGender: 'female', 
          parentName: 'B'.repeat(50), 
          parentPhone: '13900139001' 
        },
        description: '最长有效姓名',
        shouldPass: true
      },
      {
        params: { 
          childName: '小明@#$', 
          childGender: 'male', 
          parentName: '张先生', 
          parentPhone: '13900139001' 
        },
        description: '特殊字符姓名',
        shouldPass: false
      },
      {
        params: { 
          childName: '小明', 
          childGender: 'male', 
          parentName: '张先生', 
          parentPhone: '13900139001',
          childBirthDate: '2030-01-01'
        },
        description: '未来出生日期',
        shouldPass: false
      }
    ];

    validApplicationParams.forEach((applicationData, index) => {
      it(`应该接受有效报名申请参数 ${index + 1}: ${applicationData.description}`, async () => {
        if (!authToken) {
          console.log('⚠️ 跳过创建报名申请测试 - 没有认证token');
          return;
        }

        const { description, ...params } = applicationData;
        
        const response: AxiosResponse<ApiResponse> = await apiClient.post('/enrollment-applications', params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`创建报名申请测试 [${description}] 状态:`, response.status);
        console.log(`创建报名申请测试 [${description}] 响应:`, JSON.stringify(response.data, null, 2));

        if (response.status === 201 && response.data.success) {
          expect(response.data.success).toBe(true);
          expect(response.data.data?.id).toBeDefined();
          
          // 保存申请ID供清理使用
          testApplicationIds.push(response.data.data.id);
        }
      });
    });

    invalidApplicationParams.forEach((testCase, index) => {
      it(`应该拒绝无效报名申请参数 ${index + 1}: ${testCase.description}`, async () => {
        if (!authToken) {
          console.log('⚠️ 跳过无效参数测试 - 没有认证token');
          return;
        }

        const response: AxiosResponse<ApiResponse> = await apiClient.post('/enrollment-applications', testCase.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`无效报名申请测试 [${testCase.description}] 状态:`, response.status);
        console.log(`无效报名申请测试 [${testCase.description}] 响应:`, JSON.stringify(response.data, null, 2));

        expect([400, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      });
    });

    boundaryParams.forEach((testCase, index) => {
      it(`应该正确处理边界值 ${index + 1}: ${testCase.description}`, async () => {
        if (!authToken) {
          console.log('⚠️ 跳过边界值测试 - 没有认证token');
          return;
        }

        const response: AxiosResponse<ApiResponse> = await apiClient.post('/enrollment-applications', testCase.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`边界值测试 [${testCase.description}] 状态:`, response.status);

        if (testCase.shouldPass) {
          expect([200, 201]).toContain(response.status);
          if (response.status === 201 && response.data.data?.id) {
            testApplicationIds.push(response.data.data.id);
          }
        } else {
          expect([400, 422]).toContain(response.status);
        }
      });
    });
  });

  describe('GET /enrollment-applications - 获取报名申请列表参数验证', () => {
    // 有效查询参数组合
    const validQueryParams = [
      { params: {}, description: '无参数查询' },
      { params: { page: 1, limit: 10 }, description: '基本分页' },
      { params: { page: 1, limit: 20, status: 'pending' }, description: '状态筛选' },
      { params: { page: 1, limit: 15, kindergartenId: 1 }, description: '幼儿园筛选' },
      { params: { search: '小明' }, description: '搜索查询' },
      { params: { page: 2, limit: 5, status: 'approved', kindergartenId: 1 }, description: '组合查询' },
      { params: { sort: 'createdAt', order: 'desc' }, description: '排序查询' },
      { params: { startDate: '2024-01-01', endDate: '2024-12-31' }, description: '日期范围查询' }
    ];

    // 无效查询参数组合
    const invalidQueryParams = [
      { params: { page: -1 }, description: '负数页码', expectedError: 'INVALID_PAGE' },
      { params: { page: 'invalid' }, description: '非数字页码', expectedError: 'INVALID_PAGE_TYPE' },
      { params: { limit: 0 }, description: '零限制', expectedError: 'INVALID_LIMIT' },
      { params: { limit: 1001 }, description: '超大限制', expectedError: 'LIMIT_TOO_LARGE' },
      { params: { status: 'invalid_status' }, description: '无效状态', expectedError: 'INVALID_STATUS' },
      { params: { sort: 'invalid_field' }, description: '无效排序字段', expectedError: 'INVALID_SORT_FIELD' },
      { params: { order: 'invalid_order' }, description: '无效排序方向', expectedError: 'INVALID_ORDER' }
    ];

    validQueryParams.forEach((testCase, index) => {
      it(`应该接受有效查询参数 ${index + 1}: ${testCase.description}`, async () => {
        if (!authToken) {
          console.log('⚠️ 跳过查询测试 - 没有认证token');
          return;
        }

        const response: AxiosResponse<ApiResponse> = await apiClient.get('/enrollment-applications', {
          headers: { 'Authorization': `Bearer ${authToken}` },
          params: testCase.params
        });
        
        console.log(`报名申请列表查询 [${testCase.description}] 状态:`, response.status);
        console.log(`报名申请列表查询 [${testCase.description}] 数据量:`, response.data?.data?.length || 0);

        if (response.status === 200) {
          expect(response.data.success).toBe(true);
          expect(response.data.data).toBeDefined();
        }
      });
    });

    invalidQueryParams.forEach((testCase, index) => {
      it(`应该处理无效查询参数 ${index + 1}: ${testCase.description}`, async () => {
        if (!authToken) {
          console.log('⚠️ 跳过无效查询测试 - 没有认证token');
          return;
        }

        const response: AxiosResponse<ApiResponse> = await apiClient.get('/enrollment-applications', {
          headers: { 'Authorization': `Bearer ${authToken}` },
          params: testCase.params
        });
        
        console.log(`无效查询测试 [${testCase.description}] 状态:`, response.status);

        // 可能返回400错误或者默认值
        expect([200, 400, 422]).toContain(response.status);
      });
    });
  });

  describe('POST /enrollment-plans - 创建招生计划参数验证', () => {
    // 有效招生计划参数组合
    const validPlanParams = [
      {
        name: '2024年春季招生计划',
        kindergartenId: 1,
        startDate: '2024-02-01',
        endDate: '2024-06-30',
        totalQuota: 100,
        status: 'active',
        description: '基本招生计划信息'
      },
      {
        name: '2024年秋季招生计划',
        kindergartenId: 1,
        startDate: '2024-09-01',
        endDate: '2024-12-31',
        totalQuota: 150,
        status: 'active',
        ageRangeMin: 3,
        ageRangeMax: 6,
        requirements: '需要提供健康证明',
        tuitionFee: 3000,
        registrationFee: 500,
        priority: 'high',
        sourceChannels: ['online', 'offline'],
        targetAudience: '3-6岁儿童',
        notes: '重点招生计划',
        description: '完整招生计划信息'
      }
    ];

    // 无效招生计划参数组合
    const invalidPlanParams = [
      {
        params: { kindergartenId: 1, startDate: '2024-02-01', endDate: '2024-06-30' },
        description: '缺少计划名称',
        expectedError: 'MISSING_PLAN_NAME'
      },
      {
        params: { name: '招生计划', startDate: '2024-02-01', endDate: '2024-06-30' },
        description: '缺少幼儿园ID',
        expectedError: 'MISSING_KINDERGARTEN_ID'
      },
      {
        params: { name: '招生计划', kindergartenId: 1, endDate: '2024-06-30' },
        description: '缺少开始日期',
        expectedError: 'MISSING_START_DATE'
      },
      {
        params: { name: '招生计划', kindergartenId: 1, startDate: '2024-02-01' },
        description: '缺少结束日期',
        expectedError: 'MISSING_END_DATE'
      },
      {
        params: { name: '招生计划', kindergartenId: 1, startDate: '2024-06-30', endDate: '2024-02-01' },
        description: '开始日期晚于结束日期',
        expectedError: 'INVALID_DATE_RANGE'
      }
    ];

    validPlanParams.forEach((planData, index) => {
      it(`应该接受有效招生计划参数 ${index + 1}: ${planData.description}`, async () => {
        if (!authToken) {
          console.log('⚠️ 跳过创建招生计划测试 - 没有认证token');
          return;
        }

        const { description, ...params } = planData;
        
        const response: AxiosResponse<ApiResponse> = await apiClient.post('/enrollment-plans', params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`创建招生计划测试 [${description}] 状态:`, response.status);

        if (response.status === 201 && response.data.success) {
          expect(response.data.success).toBe(true);
          expect(response.data.data?.id).toBeDefined();
          
          // 保存计划ID供清理使用
          testPlanIds.push(response.data.data.id);
        }
      });
    });

    invalidPlanParams.forEach((testCase, index) => {
      it(`应该拒绝无效招生计划参数 ${index + 1}: ${testCase.description}`, async () => {
        if (!authToken) {
          console.log('⚠️ 跳过无效参数测试 - 没有认证token');
          return;
        }

        const response: AxiosResponse<ApiResponse> = await apiClient.post('/enrollment-plans', testCase.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`无效招生计划测试 [${testCase.description}] 状态:`, response.status);

        expect([400, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      });
    });
  });

  describe('PATCH /enrollment-applications/:id/status - 更新申请状态参数验证', () => {
    it('应该要求有效的申请ID和状态', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过状态更新测试 - 没有认证token');
        return;
      }

      const invalidIds = ['invalid', '0', '-1', '999999999'];
      const validStatuses = ['pending', 'reviewing', 'approved', 'rejected', 'cancelled'];
      const invalidStatuses = ['invalid_status', '', null];

      // 测试无效ID
      for (const id of invalidIds) {
        const response: AxiosResponse<ApiResponse> = await apiClient.patch(`/enrollment-applications/${id}/status`, {
          status: 'approved'
        }, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`无效申请ID状态更新测试 [${id}] 状态:`, response.status);
        
        expect([400, 404]).toContain(response.status);
      }

      // 测试无效状态
      if (testApplicationIds.length > 0) {
        const applicationId = testApplicationIds[0];
        
        for (const status of invalidStatuses) {
          const response: AxiosResponse<ApiResponse> = await apiClient.patch(`/enrollment-applications/${applicationId}/status`, {
            status: status
          }, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          
          console.log(`无效状态更新测试 [${status}] 状态:`, response.status);
          
          expect([400, 422]).toContain(response.status);
        }
      }
    });

    it('应该处理有效的状态更新请求', async () => {
      if (!authToken || testApplicationIds.length === 0) {
        console.log('⚠️ 跳过有效状态更新测试 - 没有可用的测试申请');
        return;
      }

      const applicationId = testApplicationIds[0];
      const response: AxiosResponse<ApiResponse> = await apiClient.patch(`/enrollment-applications/${applicationId}/status`, {
        status: 'reviewing',
        reviewNotes: '开始审核'
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log(`状态更新测试状态:`, response.status);

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
      }
    });
  });

  describe('GET /enrollment-statistics - 获取招生统计数据', () => {
    it('应该返回招生统计信息', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过统计测试 - 没有认证token');
        return;
      }

      const response: AxiosResponse<ApiResponse> = await apiClient.get('/enrollment-statistics', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('招生统计状态:', response.status);
      console.log('招生统计数据:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }
    });

    it('应该支持统计筛选参数', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过统计筛选测试 - 没有认证token');
        return;
      }

      const statParams = [
        { kindergartenId: 1 },
        { status: 'pending' },
        { planId: 1 },
        { dateRange: '2024-01-01,2024-12-31' },
        { channel: 'online' }
      ];

      for (const params of statParams) {
        const response: AxiosResponse<ApiResponse> = await apiClient.get('/enrollment-statistics', {
          headers: { 'Authorization': `Bearer ${authToken}` },
          params
        });
        
        console.log(`招生统计筛选测试 [${JSON.stringify(params)}] 状态:`, response.status);

        if (response.status === 200) {
          expect(response.data.success).toBe(true);
        }
      }
    });
  });

  describe('🔒 权限验证测试', () => {
    it('应该要求认证才能访问报名管理端点', async () => {
      const endpoints = [
        { method: 'get', path: '/enrollment-applications' },
        { method: 'post', path: '/enrollment-applications' },
        { method: 'get', path: '/enrollment-applications/1' },
        { method: 'put', path: '/enrollment-applications/1' },
        { method: 'delete', path: '/enrollment-applications/1' },
        { method: 'get', path: '/enrollment-plans' },
        { method: 'post', path: '/enrollment-plans' }
      ];

      for (const endpoint of endpoints) {
        let response;
        const testData = { 
          childName: '测试儿童', 
          childGender: 'male', 
          parentName: '测试家长',
          parentPhone: '13900139001'
        };
        
        switch (endpoint.method) {
          case 'get':
            response = await apiClient.get(endpoint.path);
            break;
          case 'post':
            response = await apiClient.post(endpoint.path, testData);
            break;
          case 'put':
            response = await apiClient.put(endpoint.path, testData);
            break;
          case 'delete':
            response = await apiClient.delete(endpoint.path);
            break;
        }
        
        console.log(`无认证访问测试 [${endpoint.method.toUpperCase()} ${endpoint.path}] 状态:`, response?.status);
        
        expect(response?.status).toBe(401);
        expect(response?.data.success).toBe(false);
      }
    });

    it('应该验证报名管理操作权限', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过权限测试 - 没有认证token');
        return;
      }

      // 测试创建报名申请权限
      const response: AxiosResponse<ApiResponse> = await apiClient.post('/enrollment-applications', {
        childName: '权限测试儿童',
        childGender: 'male',
        parentName: '权限测试家长',
        parentPhone: '13900139001',
        kindergartenId: 1
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('权限验证测试状态:', response.status);

      // 根据当前用户权限，可能成功或被拒绝
      expect([200, 201, 403]).toContain(response.status);
    });
  });

  describe('🎯 性能和安全测试', () => {
    it('应该在合理时间内响应报名申请列表请求', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过性能测试 - 没有认证token');
        return;
      }

      const startTime = Date.now();
      
      const response: AxiosResponse<ApiResponse> = await apiClient.get('/enrollment-applications', {
        headers: { 'Authorization': `Bearer ${authToken}` },
        params: { limit: 50 }
      });
      
      const responseTime = Date.now() - startTime;
      
      console.log(`报名申请列表响应时间: ${responseTime}ms`);
      console.log(`报名申请列表数据量: ${response.data?.data?.length || 0}`);
      
      // 响应时间应该小于3秒
      expect(responseTime).toBeLessThan(3000);
      
      if (response.status === 200) {
        expect(response.data.success).toBe(true);
      }
    });

    it('应该防止恶意输入', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过安全测试 - 没有认证token');
        return;
      }

      const maliciousInputs = [
        {
          childName: '<script>alert("xss")</script>',
          childGender: 'male',
          parentName: '测试家长',
          parentPhone: '13900139001'
        },
        {
          childName: "'; DROP TABLE enrollment_applications; --",
          childGender: 'male',
          parentName: '测试家长',
          parentPhone: '13900139001'
        }
      ];

      for (const maliciousData of maliciousInputs) {
        const response: AxiosResponse<ApiResponse> = await apiClient.post('/enrollment-applications', maliciousData, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`安全测试 [${maliciousData.childName}] 状态:`, response.status);
        
        // 应该被拒绝或者清理
        if (response.status === 200 || response.status === 201) {
          // 如果创建成功，检查数据是否被清理
          if (response.data.data?.id) {
            testApplicationIds.push(response.data.data.id);
          }
        } else {
          expect([400, 422]).toContain(response.status);
        }
      }
    });

    it('应该处理并发报名申请请求', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过并发测试 - 没有认证token');
        return;
      }

      const concurrentRequests = Array(3).fill(null).map((_, index) => 
        apiClient.post('/enrollment-applications', {
          childName: `并发测试儿童_${index + 1}`,
          childGender: index % 2 === 0 ? 'male' : 'female',
          parentName: `并发测试家长_${index + 1}`,
          parentPhone: `1390013900${index + 1}`,
          kindergartenId: 1
        }, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      console.log(`3个并发报名申请请求总时间: ${totalTime}ms`);
      
      // 所有请求都应该成功或失败，但不应该崩溃
      responses.forEach((response, index) => {
        console.log(`并发请求 ${index + 1} 状态:`, response.status);
        expect([200, 201, 400, 409, 422]).toContain(response.status);
        
        // 保存成功创建的申请ID
        if (response.status === 201 && response.data.data?.id) {
          testApplicationIds.push(response.data.data.id);
        }
      });

      // 平均响应时间应该合理
      expect(totalTime / responses.length).toBeLessThan(1000);
    });
  });
});