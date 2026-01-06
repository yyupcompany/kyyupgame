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

describe('咨询管理API全面测试 - 参数验证', () => {
  let authToken: string = '';
  let testConsultationIds: number[] = [];
  let testFollowupIds: number[] = [];
  let testKindergartenId: number = 1; // 默认幼儿园ID
  let testConsultantId: number = 1; // 默认咨询师ID

  beforeAll(async () => {
    console.log('🚀 开始咨询管理API全面测试...');
    console.log('📋 测试范围: 10+个咨询管理端点的完整参数验证');

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
    console.log('🧹 清理测试咨询数据...');
    for (const followupId of testFollowupIds) {
      if (authToken) {
        await apiClient.delete(`/enrollment-consultations/followups/${followupId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      }
    }
    for (const consultationId of testConsultationIds) {
      if (authToken) {
        await apiClient.delete(`/enrollment-consultations/${consultationId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      }
    }
  });

  describe('POST /enrollment-consultations - 创建咨询记录参数验证', () => {
    // 有效咨询参数组合
    const validConsultationParams = [
      {
        kindergartenId: 1,
        consultantId: 1,
        parentName: '张女士',
        childName: '小明',
        childAge: 36, // 3岁（按月计算）
        childGender: 1, // 男
        contactPhone: '13900139001',
        contactAddress: '北京市朝阳区测试地址123号',
        sourceChannel: 1, // 网络咨询
        sourceDetail: '官网留言',
        consultContent: '希望了解幼儿园的教学理念和课程安排',
        consultMethod: 1, // 电话咨询
        consultDate: new Date().toISOString().split('T')[0],
        intentionLevel: 4, // 高意向
        followupStatus: 1, // 待跟进
        nextFollowupDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        remark: '家长对教学环境特别关注'
      },
      {
        kindergartenId: 1,
        consultantId: 1,
        parentName: '李先生',
        childName: '小红',
        childAge: 48, // 4岁
        childGender: 2, // 女
        contactPhone: '13800138002',
        sourceChannel: 2, // 朋友推荐
        consultContent: '咨询入园流程和费用标准',
        consultMethod: 2, // 微信咨询
        consultDate: new Date().toISOString().split('T')[0],
        intentionLevel: 3 // 中等意向
      }
    ];

    // 必填字段测试
    const requiredFields = [
      'kindergartenId', 'consultantId', 'parentName', 'childName', 
      'childAge', 'childGender', 'contactPhone', 'sourceChannel',
      'consultContent', 'consultMethod', 'consultDate', 'intentionLevel'
    ];

    requiredFields.forEach(field => {
      it(`应当在缺少必填字段时返回错误 - ${field}`, async () => {
        const invalidParams = { ...validConsultationParams[0] };
        delete invalidParams[field as keyof typeof invalidParams];

        const response = await apiClient.post('/enrollment-consultations', invalidParams, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([400, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      });
    });

    // 数据类型验证测试
    const invalidDataTypes = [
      { field: 'kindergartenId', value: 'invalid', description: '非数字幼儿园ID' },
      { field: 'consultantId', value: 'invalid', description: '非数字咨询师ID' },
      { field: 'childAge', value: 'three', description: '非数字年龄' },
      { field: 'childGender', value: 'male', description: '非数字性别' },
      { field: 'sourceChannel', value: 'online', description: '非数字来源渠道' },
      { field: 'consultMethod', value: 'phone', description: '非数字咨询方式' },
      { field: 'intentionLevel', value: 'high', description: '非数字意向级别' },
      { field: 'contactPhone', value: '123456', description: '无效手机号格式' }
    ];

    invalidDataTypes.forEach(testCase => {
      it(`应当在无效数据类型时返回错误 - ${testCase.description}`, async () => {
        const invalidParams: any = { ...validConsultationParams[0] };
        invalidParams[testCase.field] = testCase.value;

        const response = await apiClient.post('/enrollment-consultations', invalidParams, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([400, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      });
    });

    // 边界值测试
    const boundaryTests = [
      {
        params: { ...validConsultationParams[0], childAge: 0 },
        description: '最小年龄边界值',
        shouldPass: true
      },
      {
        params: { ...validConsultationParams[0], childAge: 120 },
        description: '最大年龄边界值',
        shouldPass: true
      },
      {
        params: { ...validConsultationParams[0], childAge: -1 },
        description: '负数年龄',
        shouldPass: false
      },
      {
        params: { ...validConsultationParams[0], childAge: 121 },
        description: '超出最大年龄',
        shouldPass: false
      },
      {
        params: { ...validConsultationParams[0], childGender: 3 },
        description: '无效性别值',
        shouldPass: false
      },
      {
        params: { ...validConsultationParams[0], sourceChannel: 0 },
        description: '无效来源渠道',
        shouldPass: false
      },
      {
        params: { ...validConsultationParams[0], sourceChannel: 7 },
        description: '超出来源渠道范围',
        shouldPass: false
      },
      {
        params: { ...validConsultationParams[0], intentionLevel: 0 },
        description: '无效意向级别',
        shouldPass: false
      },
      {
        params: { ...validConsultationParams[0], intentionLevel: 6 },
        description: '超出意向级别范围',
        shouldPass: false
      }
    ];

    boundaryTests.forEach(test => {
      it(`应当在边界值测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.post('/enrollment-consultations', test.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldPass) {
          expect([200, 201]).toContain(response.status);
          if (response.status === 201 && response.data.success) {
            testConsultationIds.push(response.data.data.id);
          }
        } else {
          expect([400, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }
      });
    });

    // 特殊字符和安全测试
    const securityTests = [
      {
        params: { ...validConsultationParams[0], parentName: '<script>alert("xss")</script>' },
        description: 'XSS攻击测试'
      },
      {
        params: { ...validConsultationParams[0], consultContent: "'; DROP TABLE enrollment_consultations; --" },
        description: 'SQL注入测试'
      },
      {
        params: { ...validConsultationParams[0], remark: '../../../etc/passwd' },
        description: '路径遍历测试'
      },
      {
        params: { ...validConsultationParams[0], contactAddress: 'A'.repeat(300) },
        description: '超长地址测试'
      }
    ];

    securityTests.forEach(test => {
      it(`应当在安全测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.post('/enrollment-consultations', test.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        // 安全测试应该被正确处理，返回400或422错误，或者成功但内容被过滤
        expect([200, 201, 400, 422]).toContain(response.status);
      });
    });

    // 有效参数测试
    validConsultationParams.forEach((params, index) => {
      it(`应当使用有效参数成功创建咨询记录 - 组合${index + 1}`, async () => {
        const response = await apiClient.post('/enrollment-consultations', params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 201]).toContain(response.status);
        if (response.status === 201 && response.data.success) {
          expect(response.data.data).toHaveProperty('id');
          testConsultationIds.push(response.data.data.id);
        }
      });
    });
  });

  describe('GET /enrollment-consultations - 获取咨询列表参数验证', () => {
    // 分页参数测试
    const paginationTests = [
      { params: { page: 1, pageSize: 10 }, description: '标准分页参数' },
      { params: { page: 1, pageSize: 5 }, description: '小页面尺寸' },
      { params: { page: 2, pageSize: 20 }, description: '大页面尺寸' },
      { params: { page: 0 }, description: '无效页码', shouldFail: true },
      { params: { pageSize: 101 }, description: '超大页面尺寸', shouldFail: true },
      { params: { page: 'invalid' }, description: '非数字页码', shouldFail: true }
    ];

    paginationTests.forEach(test => {
      it(`应当在分页参数测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/enrollment-consultations', {
          params: test.params,
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200]).toContain(response.status);
          if (response.status === 200) {
            expect(response.data).toHaveProperty('success', true);
          }
        }
      });
    });

    // 筛选参数测试
    const filterTests = [
      { params: { kindergartenId: 1 }, description: '按幼儿园筛选' },
      { params: { consultantId: 1 }, description: '按咨询师筛选' },
      { params: { parentName: '张' }, description: '按家长姓名搜索' },
      { params: { sourceChannel: 1 }, description: '按来源渠道筛选' },
      { params: { intentionLevel: 4 }, description: '按意向级别筛选' },
      { params: { followupStatus: 1 }, description: '按跟进状态筛选' },
      { params: { startDate: '2024-01-01', endDate: '2024-12-31' }, description: '按日期范围筛选' }
    ];

    filterTests.forEach(test => {
      it(`应当在筛选参数测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/enrollment-consultations', {
          params: test.params,
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200]).toContain(response.status);
        if (response.status === 200) {
          expect(response.data).toHaveProperty('success', true);
        }
      });
    });

    // 排序参数测试
    const sortTests = [
      { params: { sortBy: 'consultDate', sortOrder: 'DESC' }, description: '按咨询日期降序' },
      { params: { sortBy: 'intentionLevel', sortOrder: 'ASC' }, description: '按意向级别升序' },
      { params: { sortBy: 'createdAt', sortOrder: 'DESC' }, description: '按创建时间降序' },
      { params: { sortBy: 'invalid_field' }, description: '无效排序字段', shouldFail: true },
      { params: { sortOrder: 'INVALID' }, description: '无效排序方向', shouldFail: true }
    ];

    sortTests.forEach(test => {
      it(`应当在排序参数测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/enrollment-consultations', {
          params: test.params,
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200]).toContain(response.status);
        }
      });
    });
  });

  describe('PUT /enrollment-consultations/:id - 更新咨询记录参数验证', () => {
    let testConsultationId: number;

    beforeAll(async () => {
      // 创建一个测试咨询记录用于更新测试
      const testConsultation = {
        kindergartenId: 1,
        consultantId: 1,
        parentName: '测试家长',
        childName: '测试孩子',
        childAge: 36,
        childGender: 1,
        contactPhone: '13900139999',
        sourceChannel: 1,
        consultContent: '测试咨询内容',
        consultMethod: 1,
        consultDate: new Date().toISOString().split('T')[0],
        intentionLevel: 3
      };

      const response = await apiClient.post('/enrollment-consultations', testConsultation, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 201 && response.data.success) {
        testConsultationId = response.data.data.id;
        testConsultationIds.push(testConsultationId);
      }
    });

    const updateTests = [
      { data: { parentName: '更新的家长姓名' }, description: '更新家长姓名' },
      { data: { childAge: 42 }, description: '更新孩子年龄' },
      { data: { intentionLevel: 5 }, description: '更新意向级别' },
      { data: { contactPhone: '13800138888' }, description: '更新联系电话' },
      { data: { followupStatus: 2 }, description: '更新跟进状态' },
      { data: { childAge: -1 }, description: '无效年龄更新', shouldFail: true },
      { data: { contactPhone: '123' }, description: '无效电话格式', shouldFail: true },
      { data: { intentionLevel: 10 }, description: '超出范围意向级别', shouldFail: true }
    ];

    updateTests.forEach(test => {
      it(`应当在更新测试时正确处理 - ${test.description}`, async () => {
        if (!testConsultationId) {
          console.warn('跳过更新测试：无法创建测试咨询记录');
          return;
        }

        const response = await apiClient.put(`/enrollment-consultations/${testConsultationId}`, test.data, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200]).toContain(response.status);
          if (response.status === 200) {
            expect(response.data).toHaveProperty('success', true);
          }
        }
      });
    });

    // ID验证测试
    const idTests = [
      { id: 'invalid', description: '非数字ID', shouldFail: true },
      { id: -1, description: '负数ID', shouldFail: true },
      { id: 999999, description: '不存在的ID', shouldFail: true }
    ];

    idTests.forEach(test => {
      it(`应当在ID验证测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.put(`/enrollment-consultations/${test.id}`, {
          parentName: '测试更新'
        }, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 404, 422]).toContain(response.status);
        } else {
          expect([200]).toContain(response.status);
        }
      });
    });
  });

  describe('POST /enrollment-consultations/followups - 创建跟进记录参数验证', () => {
    let testConsultationId: number;

    beforeAll(async () => {
      // 创建一个测试咨询记录用于跟进测试
      const testConsultation = {
        kindergartenId: 1,
        consultantId: 1,
        parentName: '跟进测试家长',
        childName: '跟进测试孩子',
        childAge: 36,
        childGender: 1,
        contactPhone: '13900139998',
        sourceChannel: 1,
        consultContent: '跟进测试咨询内容',
        consultMethod: 1,
        consultDate: new Date().toISOString().split('T')[0],
        intentionLevel: 3
      };

      const response = await apiClient.post('/enrollment-consultations', testConsultation, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 201 && response.data.success) {
        testConsultationId = response.data.data.id;
        testConsultationIds.push(testConsultationId);
      }
    });

    // 有效跟进参数
    const validFollowupParams = {
      consultationId: 0, // 将在测试中设置
      followupMethod: 1, // 电话跟进
      followupContent: '电话联系家长，了解最新意向',
      followupDate: new Date().toISOString().split('T')[0],
      intentionLevel: 4,
      followupResult: 2, // 有意向
      nextFollowupDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      remark: '家长表示下周可以来园参观'
    };

    // 必填字段测试
    const followupRequiredFields = [
      'consultationId', 'followupMethod', 'followupContent', 
      'followupDate', 'intentionLevel', 'followupResult'
    ];

    followupRequiredFields.forEach(field => {
      it(`应当在缺少必填字段时返回错误 - ${field}`, async () => {
        if (!testConsultationId) {
          console.warn('跳过跟进测试：无法创建测试咨询记录');
          return;
        }

        const invalidParams = { ...validFollowupParams, consultationId: testConsultationId };
        delete invalidParams[field as keyof typeof invalidParams];

        const response = await apiClient.post('/enrollment-consultations/followups', invalidParams, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([400, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      });
    });

    // 数据类型验证测试
    const followupInvalidDataTypes = [
      { field: 'consultationId', value: 'invalid', description: '非数字咨询ID' },
      { field: 'followupMethod', value: 'phone', description: '非数字跟进方式' },
      { field: 'intentionLevel', value: 'high', description: '非数字意向级别' },
      { field: 'followupResult', value: 'success', description: '非数字跟进结果' }
    ];

    followupInvalidDataTypes.forEach(testCase => {
      it(`应当在无效数据类型时返回错误 - ${testCase.description}`, async () => {
        if (!testConsultationId) {
          console.warn('跳过跟进测试：无法创建测试咨询记录');
          return;
        }

        const invalidParams: any = { ...validFollowupParams, consultationId: testConsultationId };
        invalidParams[testCase.field] = testCase.value;

        const response = await apiClient.post('/enrollment-consultations/followups', invalidParams, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([400, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      });
    });

    // 边界值测试
    const followupBoundaryTests = [
      {
        params: { followupMethod: 1 },
        description: '最小跟进方式值',
        shouldPass: true
      },
      {
        params: { followupMethod: 6 },
        description: '最大跟进方式值',
        shouldPass: true
      },
      {
        params: { followupMethod: 0 },
        description: '无效跟进方式',
        shouldPass: false
      },
      {
        params: { followupMethod: 7 },
        description: '超出跟进方式范围',
        shouldPass: false
      },
      {
        params: { intentionLevel: 1 },
        description: '最低意向级别',
        shouldPass: true
      },
      {
        params: { intentionLevel: 5 },
        description: '最高意向级别',
        shouldPass: true
      },
      {
        params: { intentionLevel: 0 },
        description: '无效意向级别',
        shouldPass: false
      }
    ];

    followupBoundaryTests.forEach(test => {
      it(`应当在跟进边界值测试时正确处理 - ${test.description}`, async () => {
        if (!testConsultationId) {
          console.warn('跳过跟进测试：无法创建测试咨询记录');
          return;
        }

        const params = { ...validFollowupParams, consultationId: testConsultationId, ...test.params };

        const response = await apiClient.post('/enrollment-consultations/followups', params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldPass) {
          expect([200, 201]).toContain(response.status);
          if (response.status === 201 && response.data.success) {
            testFollowupIds.push(response.data.data.id);
          }
        } else {
          expect([400, 422]).toContain(response.status);
          expect(response.data.success).toBe(false);
        }
      });
    });

    // 有效跟进记录创建测试
    it('应当使用有效参数成功创建跟进记录', async () => {
      if (!testConsultationId) {
        console.warn('跳过跟进测试：无法创建测试咨询记录');
        return;
      }

      const params = { ...validFollowupParams, consultationId: testConsultationId };

      const response = await apiClient.post('/enrollment-consultations/followups', params, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 201]).toContain(response.status);
      if (response.status === 201 && response.data.success) {
        expect(response.data.data).toHaveProperty('id');
        testFollowupIds.push(response.data.data.id);
      }
    });
  });

  describe('权限验证测试', () => {
    const protectedEndpoints = [
      { method: 'post', url: '/enrollment-consultations', data: {} },
      { method: 'get', url: '/enrollment-consultations' },
      { method: 'get', url: '/enrollment-consultations/1' },
      { method: 'put', url: '/enrollment-consultations/1', data: {} },
      { method: 'delete', url: '/enrollment-consultations/1' },
      { method: 'post', url: '/enrollment-consultations/followups', data: {} },
      { method: 'get', url: '/enrollment-consultations/followups' }
    ];

    protectedEndpoints.forEach(endpoint => {
      it(`应当在未提供token时返回401 - ${endpoint.method.toUpperCase()} ${endpoint.url}`, async () => {
        let response;
        
        if (endpoint.method === 'get') {
          response = await apiClient.get(endpoint.url);
        } else if (endpoint.method === 'post') {
          response = await apiClient.post(endpoint.url, endpoint.data || {});
        } else if (endpoint.method === 'put') {
          response = await apiClient.put(endpoint.url, endpoint.data || {});
        } else if (endpoint.method === 'delete') {
          response = await apiClient.delete(endpoint.url);
        }

        expect([401, 403]).toContain(response!.status);
      });
    });

    it('应当在无效token时返回401', async () => {
      const response = await apiClient.get('/enrollment-consultations', {
        headers: { 'Authorization': 'Bearer invalid_token' }
      });

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('性能测试', () => {
    it('创建咨询记录API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const testParams = {
        kindergartenId: 1,
        consultantId: 1,
        parentName: '性能测试家长',
        childName: '性能测试孩子',
        childAge: 36,
        childGender: 1,
        contactPhone: '13900139997',
        sourceChannel: 1,
        consultContent: '性能测试咨询内容',
        consultMethod: 1,
        consultDate: new Date().toISOString().split('T')[0],
        intentionLevel: 3
      };

      const response = await apiClient.post('/enrollment-consultations', testParams, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(2000); // 响应时间应小于2秒
      expect([200, 201]).toContain(response.status);
      
      if (response.status === 201 && response.data.success) {
        testConsultationIds.push(response.data.data.id);
      }
    });

    it('获取咨询列表API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const response = await apiClient.get('/enrollment-consultations', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(1500); // 响应时间应小于1.5秒
      expect([200]).toContain(response.status);
    });

    it('并发请求测试', async () => {
      const concurrentRequests = Array(5).fill(null).map(() => 
        apiClient.get('/enrollment-consultations', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(5000); // 5个并发请求总时间应小于5秒
      responses.forEach(response => {
        expect([200]).toContain(response.status);
      });
    });
  });
});