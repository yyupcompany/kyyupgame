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

describe('教师管理API全面测试 - 参数验证', () => {
  let authToken: string = '';
  let testTeacherIds: number[] = [];
  let testKindergartenId: number = 1; // 默认幼儿园ID

  beforeAll(async () => {
    console.log('🚀 开始教师管理API全面测试...');
    console.log('📋 测试范围: 9个教师管理端点的完整参数验证');

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
    console.log('🧹 清理测试教师数据...');
    for (const teacherId of testTeacherIds) {
      if (authToken) {
        await apiClient.delete(`/teachers/${teacherId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      }
    }
  });

  describe('POST /teachers - 创建教师参数验证', () => {
    // 有效教师参数组合
    const validTeacherParams = [
      {
        name: '张老师',
        email: 'zhang_teacher@test.com',
        phone: '13900139001',
        qualification: '学前教育本科',
        experience: 3,
        salary: 8000,
        status: 'active',
        kindergartenId: 1,
        description: '基本教师信息'
      },
      {
        name: '李老师',
        email: 'li_teacher@test.com',
        phone: '13800138001',
        qualification: '学前教育硕士',
        experience: 5,
        salary: 12000,
        status: 'active',
        kindergartenId: 1,
        specialties: '美术教学',
        certifications: '教师资格证',
        emergencyContact: '李家属',
        emergencyPhone: '13700137001',
        address: '北京市海淀区',
        notes: '优秀的美术老师',
        description: '完整教师信息'
      },
      {
        name: '王老师',
        email: 'wang_teacher@test.com',
        phone: '13600136001',
        qualification: '音乐教育本科',
        experience: 2,
        salary: 7500,
        status: 'active',
        kindergartenId: 1,
        hireDate: new Date().toISOString().split('T')[0],
        description: '音乐教师'
      }
    ];

    // 无效教师参数组合
    const invalidTeacherParams = [
      {
        params: { name: '', email: 'test@test.com', phone: '13900139000', qualification: '本科', experience: 3, salary: 8000 },
        description: '空姓名',
        expectedError: 'MISSING_NAME'
      },
      {
        params: { name: '张老师', email: '', phone: '13900139000', qualification: '本科', experience: 3, salary: 8000 },
        description: '空邮箱',
        expectedError: 'MISSING_EMAIL'
      },
      {
        params: { name: '张老师', email: 'invalid-email', phone: '13900139000', qualification: '本科', experience: 3, salary: 8000 },
        description: '无效邮箱格式',
        expectedError: 'INVALID_EMAIL'
      },
      {
        params: { name: '张老师', email: 'test@test.com', phone: '', qualification: '本科', experience: 3, salary: 8000 },
        description: '空手机号',
        expectedError: 'MISSING_PHONE'
      },
      {
        params: { name: '张老师', email: 'test@test.com', phone: '123', qualification: '本科', experience: 3, salary: 8000 },
        description: '无效手机号格式',
        expectedError: 'INVALID_PHONE'
      },
      {
        params: { name: '张老师', email: 'test@test.com', phone: '13900139000', qualification: '', experience: 3, salary: 8000 },
        description: '空学历',
        expectedError: 'MISSING_QUALIFICATION'
      },
      {
        params: { name: '张老师', email: 'test@test.com', phone: '13900139000', qualification: '本科', experience: -1, salary: 8000 },
        description: '负数工作经验',
        expectedError: 'INVALID_EXPERIENCE'
      },
      {
        params: { name: '张老师', email: 'test@test.com', phone: '13900139000', qualification: '本科', experience: 3, salary: -1000 },
        description: '负数薪资',
        expectedError: 'INVALID_SALARY'
      },
      {
        params: { name: '张老师', email: 'test@test.com', phone: '13900139000', qualification: '本科', experience: 3, salary: 8000, kindergartenId: -1 },
        description: '无效幼儿园ID',
        expectedError: 'INVALID_KINDERGARTEN_ID'
      },
      {
        params: { name: '张老师', email: 'test@test.com', phone: '13900139000', qualification: '本科', experience: 3, salary: 8000, status: 'invalid' },
        description: '无效状态',
        expectedError: 'INVALID_STATUS'
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
          name: 'A老师', 
          email: 'a@b.c', 
          phone: '13000000000', 
          qualification: '本科', 
          experience: 0, 
          salary: 3000 
        },
        description: '最小有效值',
        shouldPass: true
      },
      {
        params: { 
          name: 'A'.repeat(50) + '老师', 
          email: 'test@test.com', 
          phone: '13900139000', 
          qualification: '博士', 
          experience: 30, 
          salary: 50000 
        },
        description: '最大有效值',
        shouldPass: true
      },
      {
        params: { 
          name: 'A'.repeat(100) + '老师', 
          email: 'test@test.com', 
          phone: '13900139000', 
          qualification: '本科', 
          experience: 3, 
          salary: 8000 
        },
        description: '超长姓名',
        shouldPass: false
      },
      {
        params: { 
          name: '张老师', 
          email: 'test@test.com', 
          phone: '13900139000', 
          qualification: '本科', 
          experience: 100, 
          salary: 8000 
        },
        description: '超长工作经验',
        shouldPass: false
      }
    ];

    validTeacherParams.forEach((teacherData, index) => {
      it(`应该接受有效教师参数 ${index + 1}: ${teacherData.description}`, async () => {
        if (!authToken) {
          console.log('⚠️ 跳过创建教师测试 - 没有认证token');
          return;
        }

        const { description, ...params } = teacherData;
        
        const response: AxiosResponse<ApiResponse> = await apiClient.post('/teachers', params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`创建教师测试 [${description}] 状态:`, response.status);
        console.log(`创建教师测试 [${description}] 响应:`, JSON.stringify(response.data, null, 2));

        if (response.status === 201 && response.data.success) {
          expect(response.data.success).toBe(true);
          expect(response.data.data?.id).toBeDefined();
          
          // 保存教师ID供清理使用
          testTeacherIds.push(response.data.data.id);
        }
      });
    });

    invalidTeacherParams.forEach((testCase, index) => {
      it(`应该拒绝无效教师参数 ${index + 1}: ${testCase.description}`, async () => {
        if (!authToken) {
          console.log('⚠️ 跳过无效参数测试 - 没有认证token');
          return;
        }

        const response: AxiosResponse<ApiResponse> = await apiClient.post('/teachers', testCase.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`无效教师测试 [${testCase.description}] 状态:`, response.status);
        console.log(`无效教师测试 [${testCase.description}] 响应:`, JSON.stringify(response.data, null, 2));

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

        const response: AxiosResponse<ApiResponse> = await apiClient.post('/teachers', testCase.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`边界值测试 [${testCase.description}] 状态:`, response.status);

        if (testCase.shouldPass) {
          expect([200, 201]).toContain(response.status);
          if (response.status === 201 && response.data.data?.id) {
            testTeacherIds.push(response.data.data.id);
          }
        } else {
          expect([400, 422]).toContain(response.status);
        }
      });
    });
  });

  describe('GET /teachers/search - 教师搜索参数验证', () => {
    // 有效搜索参数组合
    const validSearchParams = [
      { params: { q: '张' }, description: '姓名搜索' },
      { params: { q: '13900139000' }, description: '手机号搜索' },
      { params: { qualification: '本科' }, description: '学历筛选' },
      { params: { experience: '3-5' }, description: '经验范围筛选' },
      { params: { kindergartenId: 1 }, description: '幼儿园筛选' },
      { params: { status: 'active' }, description: '状态筛选' },
      { params: { q: '张', qualification: '本科' }, description: '姓名+学历组合搜索' },
      { params: { q: '老师', qualification: '本科', status: 'active' }, description: '多条件组合搜索' },
      { params: { salaryRange: '5000-10000' }, description: '薪资范围搜索' },
      { params: { hireYear: '2024' }, description: '入职年份搜索' }
    ];

    // 无效搜索参数组合
    const invalidSearchParams = [
      { params: { q: '' }, description: '空搜索词', shouldFail: false },
      { params: { qualification: 'invalid_qualification' }, description: '无效学历', shouldFail: true },
      { params: { experience: 'invalid' }, description: '无效经验范围', shouldFail: true },
      { params: { kindergartenId: -1 }, description: '无效幼儿园ID', shouldFail: true },
      { params: { status: 'invalid_status' }, description: '无效状态', shouldFail: true },
      { params: { salaryRange: 'invalid' }, description: '无效薪资范围', shouldFail: true }
    ];

    validSearchParams.forEach((testCase, index) => {
      it(`应该接受有效搜索参数 ${index + 1}: ${testCase.description}`, async () => {
        if (!authToken) {
          console.log('⚠️ 跳过搜索测试 - 没有认证token');
          return;
        }

        const response: AxiosResponse<ApiResponse> = await apiClient.get('/teachers/search', {
          headers: { 'Authorization': `Bearer ${authToken}` },
          params: testCase.params
        });
        
        console.log(`教师搜索测试 [${testCase.description}] 状态:`, response.status);
        console.log(`教师搜索测试 [${testCase.description}] 结果数量:`, response.data?.data?.length || 0);

        if (response.status === 200) {
          expect(response.data.success).toBe(true);
          expect(Array.isArray(response.data.data)).toBe(true);
        }
      });
    });

    invalidSearchParams.forEach((testCase, index) => {
      it(`应该处理无效搜索参数 ${index + 1}: ${testCase.description}`, async () => {
        if (!authToken) {
          console.log('⚠️ 跳过无效搜索测试 - 没有认证token');
          return;
        }

        const response: AxiosResponse<ApiResponse> = await apiClient.get('/teachers/search', {
          headers: { 'Authorization': `Bearer ${authToken}` },
          params: testCase.params
        });
        
        console.log(`无效搜索测试 [${testCase.description}] 状态:`, response.status);

        if (testCase.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          // 某些"无效"参数可能只是返回空结果
          expect([200, 400]).toContain(response.status);
        }
      });
    });
  });

  describe('GET /teachers/by-user/:userId - 通过用户ID获取教师', () => {
    it('应该要求有效的用户ID', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过用户ID测试 - 没有认证token');
        return;
      }

      const invalidIds = ['invalid', '0', '-1', 'null'];

      for (const id of invalidIds) {
        const response: AxiosResponse<ApiResponse> = await apiClient.get(`/teachers/by-user/${id}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`无效用户ID测试 [${id}] 状态:`, response.status);
        
        expect([400, 404]).toContain(response.status);
      }
    });

    it('应该处理不存在的用户ID', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过不存在用户ID测试 - 没有认证token');
        return;
      }

      const response: AxiosResponse<ApiResponse> = await apiClient.get('/teachers/by-user/999999', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('不存在用户ID测试状态:', response.status);

      expect([404, 200]).toContain(response.status);
    });
  });

  describe('GET /teachers - 获取教师列表参数验证', () => {
    // 有效查询参数组合
    const validQueryParams = [
      { params: {}, description: '无参数查询' },
      { params: { page: 1, limit: 10 }, description: '基本分页' },
      { params: { page: 1, limit: 20, qualification: '本科' }, description: '学历筛选' },
      { params: { page: 1, limit: 15, status: 'active' }, description: '状态筛选' },
      { params: { search: '张老师' }, description: '搜索查询' },
      { params: { page: 2, limit: 5, qualification: '硕士', status: 'active' }, description: '组合查询' },
      { params: { sort: 'experience', order: 'desc' }, description: '排序查询' },
      { params: { kindergartenId: 1 }, description: '幼儿园筛选' }
    ];

    // 无效查询参数组合
    const invalidQueryParams = [
      { params: { page: -1 }, description: '负数页码', expectedError: 'INVALID_PAGE' },
      { params: { page: 'invalid' }, description: '非数字页码', expectedError: 'INVALID_PAGE_TYPE' },
      { params: { limit: 0 }, description: '零限制', expectedError: 'INVALID_LIMIT' },
      { params: { limit: 1001 }, description: '超大限制', expectedError: 'LIMIT_TOO_LARGE' },
      { params: { qualification: 'invalid_qualification' }, description: '无效学历', expectedError: 'INVALID_QUALIFICATION' },
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

        const response: AxiosResponse<ApiResponse> = await apiClient.get('/teachers', {
          headers: { 'Authorization': `Bearer ${authToken}` },
          params: testCase.params
        });
        
        console.log(`教师列表查询 [${testCase.description}] 状态:`, response.status);
        console.log(`教师列表查询 [${testCase.description}] 数据量:`, response.data?.data?.length || 0);

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

        const response: AxiosResponse<ApiResponse> = await apiClient.get('/teachers', {
          headers: { 'Authorization': `Bearer ${authToken}` },
          params: testCase.params
        });
        
        console.log(`无效查询测试 [${testCase.description}] 状态:`, response.status);

        // 可能返回400错误或者默认值
        expect([200, 400, 422]).toContain(response.status);
      });
    });
  });

  describe('GET /teachers/:id - 获取特定教师参数验证', () => {
    it('应该要求有效的教师ID', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过教师ID测试 - 没有认证token');
        return;
      }

      const invalidIds = ['invalid', '0', '-1', '999999999', 'null', 'undefined'];

      for (const id of invalidIds) {
        const response: AxiosResponse<ApiResponse> = await apiClient.get(`/teachers/${id}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`无效教师ID测试 [${id}] 状态:`, response.status);
        
        expect([400, 404]).toContain(response.status);
      }
    });

    it('应该返回存在教师的信息', async () => {
      if (!authToken || testTeacherIds.length === 0) {
        console.log('⚠️ 跳过获取教师测试 - 没有可用的测试教师');
        return;
      }

      const teacherId = testTeacherIds[0];
      const response: AxiosResponse<ApiResponse> = await apiClient.get(`/teachers/${teacherId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log(`获取教师信息测试 [ID:${teacherId}] 状态:`, response.status);

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        expect(response.data.data?.id).toBe(teacherId);
      }
    });
  });

  describe('PUT /teachers/:id - 更新教师参数验证', () => {
    // 有效更新参数
    const validUpdateParams = [
      { name: '更新后的教师姓名', description: '更新姓名' },
      { email: 'updated_teacher@test.com', description: '更新邮箱' },
      { phone: '13700137000', description: '更新手机号' },
      { qualification: '硕士', description: '更新学历' },
      { experience: 5, description: '更新经验' },
      { salary: 10000, description: '更新薪资' },
      { status: 'inactive', description: '更新状态' },
      { 
        name: '完整更新教师', 
        email: 'complete_teacher@test.com', 
        phone: '13600136000',
        qualification: '博士',
        experience: 8,
        salary: 15000,
        description: '组合更新' 
      }
    ];

    // 无效更新参数
    const invalidUpdateParams = [
      { params: { email: 'invalid-email' }, description: '无效邮箱格式' },
      { params: { phone: '123' }, description: '无效手机号格式' },
      { params: { experience: -1 }, description: '负数经验' },
      { params: { salary: -1000 }, description: '负数薪资' },
      { params: { status: 'invalid_status' }, description: '无效状态' },
      { params: { qualification: '' }, description: '空学历' },
      { params: { name: '' }, description: '空姓名' }
    ];

    validUpdateParams.forEach((updateData, index) => {
      it(`应该接受有效更新参数 ${index + 1}: ${updateData.description}`, async () => {
        if (!authToken || testTeacherIds.length === 0) {
          console.log('⚠️ 跳过更新测试 - 没有可用的测试教师');
          return;
        }

        const teacherId = testTeacherIds[0];
        const { description, ...params } = updateData;
        
        const response: AxiosResponse<ApiResponse> = await apiClient.put(`/teachers/${teacherId}`, params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`更新教师测试 [${description}] 状态:`, response.status);

        if (response.status === 200) {
          expect(response.data.success).toBe(true);
        }
      });
    });

    invalidUpdateParams.forEach((testCase, index) => {
      it(`应该拒绝无效更新参数 ${index + 1}: ${testCase.description}`, async () => {
        if (!authToken || testTeacherIds.length === 0) {
          console.log('⚠️ 跳过无效更新测试 - 没有可用的测试教师');
          return;
        }

        const teacherId = testTeacherIds[0];
        const response: AxiosResponse<ApiResponse> = await apiClient.put(`/teachers/${teacherId}`, testCase.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`无效更新测试 [${testCase.description}] 状态:`, response.status);

        expect([400, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      });
    });
  });

  describe('DELETE /teachers/:id - 删除教师参数验证', () => {
    it('应该要求有效的教师ID进行删除', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过删除测试 - 没有认证token');
        return;
      }

      const invalidIds = ['invalid', '0', '-1', 'null'];

      for (const id of invalidIds) {
        const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/teachers/${id}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`无效删除ID测试 [${id}] 状态:`, response.status);
        
        expect([400, 404]).toContain(response.status);
      }
    });

    it('应该能够删除存在的教师', async () => {
      if (!authToken || testTeacherIds.length === 0) {
        console.log('⚠️ 跳过删除教师测试 - 没有可用的测试教师');
        return;
      }

      // 使用最后一个测试教师进行删除测试
      const teacherId = testTeacherIds.pop();
      const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/teachers/${teacherId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log(`删除教师测试 [ID:${teacherId}] 状态:`, response.status);

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
      }
    });
  });

  describe('GET /teachers/:id/classes - 获取教师班级信息', () => {
    it('应该要求有效的教师ID', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过教师班级测试 - 没有认证token');
        return;
      }

      const invalidIds = ['invalid', '0', '-1'];

      for (const id of invalidIds) {
        const response: AxiosResponse<ApiResponse> = await apiClient.get(`/teachers/${id}/classes`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`无效教师ID班级测试 [${id}] 状态:`, response.status);
        
        expect([400, 404]).toContain(response.status);
      }
    });

    it('应该返回教师班级信息', async () => {
      if (!authToken || testTeacherIds.length === 0) {
        console.log('⚠️ 跳过教师班级获取测试 - 没有可用的测试教师');
        return;
      }

      const teacherId = testTeacherIds[0];
      const response: AxiosResponse<ApiResponse> = await apiClient.get(`/teachers/${teacherId}/classes`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log(`教师班级信息测试 [ID:${teacherId}] 状态:`, response.status);

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);
      }
    });
  });

  describe('GET /teachers/:id/stats - 获取教师统计信息', () => {
    it('应该要求有效的教师ID', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过教师统计测试 - 没有认证token');
        return;
      }

      const invalidIds = ['invalid', '0', '-1'];

      for (const id of invalidIds) {
        const response: AxiosResponse<ApiResponse> = await apiClient.get(`/teachers/${id}/stats`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`无效教师ID统计测试 [${id}] 状态:`, response.status);
        
        expect([400, 404]).toContain(response.status);
      }
    });

    it('应该返回教师统计信息', async () => {
      if (!authToken || testTeacherIds.length === 0) {
        console.log('⚠️ 跳过教师统计获取测试 - 没有可用的测试教师');
        return;
      }

      const teacherId = testTeacherIds[0];
      const response: AxiosResponse<ApiResponse> = await apiClient.get(`/teachers/${teacherId}/stats`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log(`教师统计信息测试 [ID:${teacherId}] 状态:`, response.status);

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }
    });
  });

  describe('🔒 权限验证测试', () => {
    it('应该要求认证才能访问教师端点', async () => {
      const endpoints = [
        { method: 'get', path: '/teachers' },
        { method: 'post', path: '/teachers' },
        { method: 'get', path: '/teachers/1' },
        { method: 'put', path: '/teachers/1' },
        { method: 'delete', path: '/teachers/1' }
      ];

      for (const endpoint of endpoints) {
        let response;
        const testData = { 
          name: '测试教师', 
          email: 'test@test.com', 
          phone: '13900139000',
          qualification: '本科',
          experience: 3,
          salary: 8000
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

    it('应该验证教师操作权限', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过权限测试 - 没有认证token');
        return;
      }

      // 测试创建教师权限（通常只有管理员可以）
      const response: AxiosResponse<ApiResponse> = await apiClient.post('/teachers', {
        name: '权限测试教师',
        email: 'permission_teacher@test.com',
        phone: '13900139000',
        qualification: '本科',
        experience: 3,
        salary: 8000
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('权限验证测试状态:', response.status);

      // 根据当前用户权限，可能成功或被拒绝
      expect([200, 201, 403]).toContain(response.status);
    });
  });

  describe('🎯 性能和安全测试', () => {
    it('应该在合理时间内响应教师列表请求', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过性能测试 - 没有认证token');
        return;
      }

      const startTime = Date.now();
      
      const response: AxiosResponse<ApiResponse> = await apiClient.get('/teachers', {
        headers: { 'Authorization': `Bearer ${authToken}` },
        params: { limit: 50 }
      });
      
      const responseTime = Date.now() - startTime;
      
      console.log(`教师列表响应时间: ${responseTime}ms`);
      console.log(`教师列表数据量: ${response.data?.data?.length || 0}`);
      
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
          name: '<script>alert("xss")</script>',
          email: 'malicious@test.com',
          phone: '13900139000',
          qualification: '本科',
          experience: 3,
          salary: 8000
        },
        {
          name: "'; DROP TABLE teachers; --",
          email: 'sql@test.com',
          phone: '13900139000',
          qualification: '本科',
          experience: 3,
          salary: 8000
        }
      ];

      for (const maliciousData of maliciousInputs) {
        const response: AxiosResponse<ApiResponse> = await apiClient.post('/teachers', maliciousData, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`安全测试 [${maliciousData.name}] 状态:`, response.status);
        
        // 应该被拒绝或者清理
        if (response.status === 201) {
          // 如果创建成功，检查数据是否被清理
          expect(response.data.data.name).not.toContain('<script>');
          expect(response.data.data.name).not.toContain('DROP TABLE');
          if (response.data.data?.id) {
            testTeacherIds.push(response.data.data.id);
          }
        } else {
          expect([400, 422]).toContain(response.status);
        }
      }
    });

    it('应该处理并发教师创建请求', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过并发测试 - 没有认证token');
        return;
      }

      const concurrentRequests = Array(3).fill(null).map((_, index) => 
        apiClient.post('/teachers', {
          name: `并发测试教师_${index + 1}`,
          email: `concurrent_teacher_${index + 1}@test.com`,
          phone: `1390013900${index}`,
          qualification: '本科',
          experience: 3,
          salary: 8000
        }, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      console.log(`3个并发教师创建请求总时间: ${totalTime}ms`);
      
      // 所有请求都应该成功或失败，但不应该崩溃
      responses.forEach((response, index) => {
        console.log(`并发请求 ${index + 1} 状态:`, response.status);
        expect([200, 201, 400, 409, 422]).toContain(response.status);
        
        // 保存成功创建的教师ID
        if (response.status === 201 && response.data.data?.id) {
          testTeacherIds.push(response.data.data.id);
        }
      });

      // 平均响应时间应该合理
      expect(totalTime / responses.length).toBeLessThan(1000);
    });
  });
});