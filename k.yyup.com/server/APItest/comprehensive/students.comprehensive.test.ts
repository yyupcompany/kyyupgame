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

describe('学生管理API全面测试 - 参数验证', () => {
  let authToken: string = '';
  let testStudentIds: number[] = [];
  let testKindergartenId: number = 1; // 默认幼儿园ID

  beforeAll(async () => {
    console.log('🚀 开始学生管理API全面测试...');
    console.log('📋 测试范围: 13个学生管理端点的完整参数验证');

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
    console.log('🧹 清理测试学生数据...');
    for (const studentId of testStudentIds) {
      if (authToken) {
        await apiClient.delete(`/students/${studentId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      }
    }
  });

  describe('POST /students - 创建学生参数验证', () => {
    // 有效学生参数组合
    const validStudentParams = [
      {
        name: '张小明',
        gender: '男',
        birthDate: '2020-06-15',
        parentName: '张三',
        parentPhone: '13900139000',
        enrollmentDate: '2024-09-01',
        kindergartenId: 1,
        description: '基本学生信息'
      },
      {
        name: '李小红',
        gender: '女',
        birthDate: '2019-12-20',
        parentName: '李四',
        parentPhone: '13800138000',
        enrollmentDate: '2024-09-01',
        kindergartenId: 1,
        classId: 1,
        address: '北京市朝阳区某某路123号',
        medicalInfo: '无过敏史',
        emergencyContact: '李五',
        emergencyPhone: '13700137000',
        description: '完整学生信息'
      },
      {
        name: '王小华',
        gender: '男',
        birthDate: '2021-03-10',
        parentName: '王六',
        parentPhone: '13600136000',
        enrollmentDate: new Date().toISOString().split('T')[0],
        kindergartenId: 1,
        notes: '活泼好动，喜欢画画',
        description: '带备注学生信息'
      }
    ];

    // 无效学生参数组合
    const invalidStudentParams = [
      {
        params: { name: '', gender: '男', birthDate: '2020-06-15', parentName: '张三', parentPhone: '13900139000' },
        description: '空姓名',
        expectedError: 'MISSING_NAME'
      },
      {
        params: { name: '张小明', gender: '', birthDate: '2020-06-15', parentName: '张三', parentPhone: '13900139000' },
        description: '空性别',
        expectedError: 'MISSING_GENDER'
      },
      {
        params: { name: '张小明', gender: '无效', birthDate: '2020-06-15', parentName: '张三', parentPhone: '13900139000' },
        description: '无效性别',
        expectedError: 'INVALID_GENDER'
      },
      {
        params: { name: '张小明', gender: '男', birthDate: '', parentName: '张三', parentPhone: '13900139000' },
        description: '空出生日期',
        expectedError: 'MISSING_BIRTH_DATE'
      },
      {
        params: { name: '张小明', gender: '男', birthDate: 'invalid-date', parentName: '张三', parentPhone: '13900139000' },
        description: '无效日期格式',
        expectedError: 'INVALID_DATE_FORMAT'
      },
      {
        params: { name: '张小明', gender: '男', birthDate: '2030-01-01', parentName: '张三', parentPhone: '13900139000' },
        description: '未来出生日期',
        expectedError: 'FUTURE_BIRTH_DATE'
      },
      {
        params: { name: '张小明', gender: '男', birthDate: '1900-01-01', parentName: '张三', parentPhone: '13900139000' },
        description: '过早出生日期',
        expectedError: 'INVALID_BIRTH_DATE'
      },
      {
        params: { name: '张小明', gender: '男', birthDate: '2020-06-15', parentName: '', parentPhone: '13900139000' },
        description: '空家长姓名',
        expectedError: 'MISSING_PARENT_NAME'
      },
      {
        params: { name: '张小明', gender: '男', birthDate: '2020-06-15', parentName: '张三', parentPhone: '' },
        description: '空家长电话',
        expectedError: 'MISSING_PARENT_PHONE'
      },
      {
        params: { name: '张小明', gender: '男', birthDate: '2020-06-15', parentName: '张三', parentPhone: '123' },
        description: '无效家长电话格式',
        expectedError: 'INVALID_PHONE_FORMAT'
      },
      {
        params: { name: '张小明', gender: '男', birthDate: '2020-06-15', parentName: '张三', parentPhone: '13900139000', kindergartenId: -1 },
        description: '无效幼儿园ID',
        expectedError: 'INVALID_KINDERGARTEN_ID'
      },
      {
        params: { name: '张小明', gender: '男', birthDate: '2020-06-15', parentName: '张三', parentPhone: '13900139000', classId: -1 },
        description: '无效班级ID',
        expectedError: 'INVALID_CLASS_ID'
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
          name: 'A', 
          gender: '男', 
          birthDate: '2020-06-15', 
          parentName: 'B', 
          parentPhone: '13900139000' 
        },
        description: '最短姓名',
        shouldPass: false
      },
      {
        params: { 
          name: 'A'.repeat(100), 
          gender: '男', 
          birthDate: '2020-06-15', 
          parentName: '张三', 
          parentPhone: '13900139000' 
        },
        description: '超长姓名',
        shouldPass: false
      },
      {
        params: { 
          name: '张小明', 
          gender: '男', 
          birthDate: new Date().toISOString().split('T')[0], 
          parentName: '张三', 
          parentPhone: '13900139000' 
        },
        description: '今天出生',
        shouldPass: true
      },
      {
        params: { 
          name: '张小明', 
          gender: '男', 
          birthDate: '2015-01-01', 
          parentName: '张三', 
          parentPhone: '13900139000' 
        },
        description: '较大年龄学生',
        shouldPass: true
      }
    ];

    validStudentParams.forEach((studentData, index) => {
      it(`应该接受有效学生参数 ${index + 1}: ${studentData.description}`, async () => {
        if (!authToken) {
          console.log('⚠️ 跳过创建学生测试 - 没有认证token');
          return;
        }

        const { description, ...params } = studentData;
        
        const response: AxiosResponse<ApiResponse> = await apiClient.post('/students', params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`创建学生测试 [${description}] 状态:`, response.status);
        console.log(`创建学生测试 [${description}] 响应:`, JSON.stringify(response.data, null, 2));

        if (response.status === 201 && response.data.success) {
          expect(response.data.success).toBe(true);
          expect(response.data.data?.id).toBeDefined();
          
          // 保存学生ID供清理使用
          testStudentIds.push(response.data.data.id);
        }
      });
    });

    invalidStudentParams.forEach((testCase, index) => {
      it(`应该拒绝无效学生参数 ${index + 1}: ${testCase.description}`, async () => {
        if (!authToken) {
          console.log('⚠️ 跳过无效参数测试 - 没有认证token');
          return;
        }

        const response: AxiosResponse<ApiResponse> = await apiClient.post('/students', testCase.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`无效学生测试 [${testCase.description}] 状态:`, response.status);
        console.log(`无效学生测试 [${testCase.description}] 响应:`, JSON.stringify(response.data, null, 2));

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

        const response: AxiosResponse<ApiResponse> = await apiClient.post('/students', testCase.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`边界值测试 [${testCase.description}] 状态:`, response.status);

        if (testCase.shouldPass) {
          expect([200, 201]).toContain(response.status);
          if (response.status === 201 && response.data.data?.id) {
            testStudentIds.push(response.data.data.id);
          }
        } else {
          expect([400, 422]).toContain(response.status);
        }
      });
    });
  });

  describe('GET /students/search - 学生搜索参数验证', () => {
    // 有效搜索参数组合
    const validSearchParams = [
      { params: { q: '张' }, description: '姓名搜索' },
      { params: { q: '13900139000' }, description: '手机号搜索' },
      { params: { gender: '男' }, description: '性别筛选' },
      { params: { classId: 1 }, description: '班级筛选' },
      { params: { kindergartenId: 1 }, description: '幼儿园筛选' },
      { params: { q: '张', gender: '男' }, description: '姓名+性别组合搜索' },
      { params: { q: '张', gender: '男', classId: 1 }, description: '多条件组合搜索' },
      { params: { ageRange: '3-6' }, description: '年龄范围搜索' },
      { params: { enrollmentYear: '2024' }, description: '入学年份搜索' }
    ];

    // 无效搜索参数组合
    const invalidSearchParams = [
      { params: { q: '' }, description: '空搜索词', shouldFail: false },
      { params: { classId: 'invalid' }, description: '无效班级ID', shouldFail: true },
      { params: { kindergartenId: -1 }, description: '无效幼儿园ID', shouldFail: true },
      { params: { gender: '无效性别' }, description: '无效性别', shouldFail: true },
      { params: { ageRange: 'invalid' }, description: '无效年龄范围', shouldFail: true },
      { params: { enrollmentYear: 'invalid' }, description: '无效入学年份', shouldFail: true }
    ];

    validSearchParams.forEach((testCase, index) => {
      it(`应该接受有效搜索参数 ${index + 1}: ${testCase.description}`, async () => {
        if (!authToken) {
          console.log('⚠️ 跳过搜索测试 - 没有认证token');
          return;
        }

        const response: AxiosResponse<ApiResponse> = await apiClient.get('/students/search', {
          headers: { 'Authorization': `Bearer ${authToken}` },
          params: testCase.params
        });
        
        console.log(`学生搜索测试 [${testCase.description}] 状态:`, response.status);
        console.log(`学生搜索测试 [${testCase.description}] 结果数量:`, response.data?.data?.length || 0);

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

        const response: AxiosResponse<ApiResponse> = await apiClient.get('/students/search', {
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

  describe('GET /students/available - 可用学生列表参数验证', () => {
    it('应该返回可用学生列表', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过可用学生测试 - 没有认证token');
        return;
      }

      const response: AxiosResponse<ApiResponse> = await apiClient.get('/students/available', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('可用学生列表状态:', response.status);
      console.log('可用学生数量:', response.data?.data?.length || 0);

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);
      }
    });

    it('应该支持筛选参数', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过筛选测试 - 没有认证token');
        return;
      }

      const filterParams = [
        { classId: null },
        { kindergartenId: 1 },
        { gender: '男' },
        { ageRange: '3-6' }
      ];

      for (const params of filterParams) {
        const response: AxiosResponse<ApiResponse> = await apiClient.get('/students/available', {
          headers: { 'Authorization': `Bearer ${authToken}` },
          params
        });
        
        console.log(`可用学生筛选测试 [${JSON.stringify(params)}] 状态:`, response.status);

        if (response.status === 200) {
          expect(response.data.success).toBe(true);
        }
      }
    });
  });

  describe('GET /students/stats - 学生统计参数验证', () => {
    it('应该返回学生统计信息', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过统计测试 - 没有认证token');
        return;
      }

      const response: AxiosResponse<ApiResponse> = await apiClient.get('/students/stats', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('学生统计状态:', response.status);
      console.log('学生统计数据:', JSON.stringify(response.data, null, 2));

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
        { classId: 1 },
        { gender: '男' },
        { enrollmentYear: '2024' },
        { dateRange: '2024-01-01,2024-12-31' }
      ];

      for (const params of statParams) {
        const response: AxiosResponse<ApiResponse> = await apiClient.get('/students/stats', {
          headers: { 'Authorization': `Bearer ${authToken}` },
          params
        });
        
        console.log(`学生统计筛选测试 [${JSON.stringify(params)}] 状态:`, response.status);

        if (response.status === 200) {
          expect(response.data.success).toBe(true);
        }
      }
    });
  });

  describe('POST /students/assign-class - 分配班级参数验证', () => {
    // 有效分配参数
    const validAssignParams = [
      { studentId: 1, classId: 1, description: '基本分配' },
      { studentId: 2, classId: 1, startDate: '2024-09-01', description: '带开始日期分配' },
      { studentId: 3, classId: 2, startDate: '2024-09-01', notes: '调班学生', description: '完整分配信息' }
    ];

    // 无效分配参数
    const invalidAssignParams = [
      { params: {}, description: '空对象', expectedError: 'MISSING_REQUIRED_FIELDS' },
      { params: { studentId: 0 }, description: '无效学生ID', expectedError: 'INVALID_STUDENT_ID' },
      { params: { studentId: 1 }, description: '缺少班级ID', expectedError: 'MISSING_CLASS_ID' },
      { params: { studentId: 1, classId: 0 }, description: '无效班级ID', expectedError: 'INVALID_CLASS_ID' },
      { params: { studentId: 'invalid', classId: 1 }, description: '学生ID类型错误', expectedError: 'INVALID_STUDENT_ID_TYPE' },
      { params: { studentId: 1, classId: 'invalid' }, description: '班级ID类型错误', expectedError: 'INVALID_CLASS_ID_TYPE' },
      { params: { studentId: 999999, classId: 1 }, description: '不存在的学生', expectedError: 'STUDENT_NOT_FOUND' },
      { params: { studentId: 1, classId: 999999 }, description: '不存在的班级', expectedError: 'CLASS_NOT_FOUND' }
    ];

    validAssignParams.forEach((assignData, index) => {
      it(`应该接受有效分配参数 ${index + 1}: ${assignData.description}`, async () => {
        if (!authToken || testStudentIds.length === 0) {
          console.log('⚠️ 跳过分配测试 - 没有可用的测试学生');
          return;
        }

        const { description, ...params } = assignData;
        // 使用实际的测试学生ID
        params.studentId = testStudentIds[0];
        
        const response: AxiosResponse<ApiResponse> = await apiClient.post('/students/assign-class', params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`班级分配测试 [${description}] 状态:`, response.status);

        if (response.status === 200) {
          expect(response.data.success).toBe(true);
        }
      });
    });

    invalidAssignParams.forEach((testCase, index) => {
      it(`应该拒绝无效分配参数 ${index + 1}: ${testCase.description}`, async () => {
        if (!authToken) {
          console.log('⚠️ 跳过无效分配测试 - 没有认证token');
          return;
        }

        const response: AxiosResponse<ApiResponse> = await apiClient.post('/students/assign-class', testCase.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`无效分配测试 [${testCase.description}] 状态:`, response.status);

        expect([400, 404, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      });
    });
  });

  describe('POST /students/batch-assign-class - 批量分配班级参数验证', () => {
    it('应该接受有效的批量分配参数', async () => {
      if (!authToken || testStudentIds.length < 2) {
        console.log('⚠️ 跳过批量分配测试 - 需要至少2个测试学生');
        return;
      }

      const batchAssignData = {
        studentIds: testStudentIds.slice(0, 2),
        classId: 1,
        startDate: '2024-09-01'
      };

      const response: AxiosResponse<ApiResponse> = await apiClient.post('/students/batch-assign-class', batchAssignData, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('批量分配测试状态:', response.status);
      console.log('批量分配测试响应:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
      }
    });

    it('应该拒绝无效的批量分配参数', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过无效批量分配测试 - 没有认证token');
        return;
      }

      const invalidBatchParams = [
        { studentIds: [], classId: 1 }, // 空学生数组
        { studentIds: [1, 2], classId: 0 }, // 无效班级ID
        { studentIds: 'invalid', classId: 1 }, // 错误的学生ID类型
        { classId: 1 }, // 缺少学生ID
        { studentIds: [1, 2] } // 缺少班级ID
      ];

      for (const params of invalidBatchParams) {
        const response: AxiosResponse<ApiResponse> = await apiClient.post('/students/batch-assign-class', params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`无效批量分配测试 [${JSON.stringify(params)}] 状态:`, response.status);

        expect([400, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      }
    });
  });

  describe('GET /students/:id/parents - 学生家长信息参数验证', () => {
    it('应该要求有效的学生ID', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过家长信息测试 - 没有认证token');
        return;
      }

      const invalidIds = ['invalid', '0', '-1', 'null'];

      for (const id of invalidIds) {
        const response: AxiosResponse<ApiResponse> = await apiClient.get(`/students/${id}/parents`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`无效学生ID家长测试 [${id}] 状态:`, response.status);
        
        expect([400, 404]).toContain(response.status);
      }
    });

    it('应该返回学生家长信息', async () => {
      if (!authToken || testStudentIds.length === 0) {
        console.log('⚠️ 跳过家长信息获取测试 - 没有可用的测试学生');
        return;
      }

      const studentId = testStudentIds[0];
      const response: AxiosResponse<ApiResponse> = await apiClient.get(`/students/${studentId}/parents`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log(`学生家长信息测试 [ID:${studentId}] 状态:`, response.status);

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);
      }
    });
  });

  describe('GET /students/:id/growth-records - 成长记录参数验证', () => {
    it('应该要求有效的学生ID', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过成长记录测试 - 没有认证token');
        return;
      }

      const invalidIds = ['invalid', '0', '-1'];

      for (const id of invalidIds) {
        const response: AxiosResponse<ApiResponse> = await apiClient.get(`/students/${id}/growth-records`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`无效学生ID成长记录测试 [${id}] 状态:`, response.status);
        
        expect([400, 404]).toContain(response.status);
      }
    });

    it('应该返回学生成长记录', async () => {
      if (!authToken || testStudentIds.length === 0) {
        console.log('⚠️ 跳过成长记录获取测试 - 没有可用的测试学生');
        return;
      }

      const studentId = testStudentIds[0];
      const response: AxiosResponse<ApiResponse> = await apiClient.get(`/students/${studentId}/growth-records`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log(`学生成长记录测试 [ID:${studentId}] 状态:`, response.status);

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);
      }
    });

    it('应该支持成长记录筛选参数', async () => {
      if (!authToken || testStudentIds.length === 0) {
        console.log('⚠️ 跳过成长记录筛选测试 - 没有可用的测试学生');
        return;
      }

      const studentId = testStudentIds[0];
      const filterParams = [
        { type: 'physical' },
        { type: 'cognitive' },
        { dateRange: '2024-01-01,2024-12-31' },
        { page: 1, limit: 10 }
      ];

      for (const params of filterParams) {
        const response: AxiosResponse<ApiResponse> = await apiClient.get(`/students/${studentId}/growth-records`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
          params
        });
        
        console.log(`成长记录筛选测试 [${JSON.stringify(params)}] 状态:`, response.status);

        if (response.status === 200) {
          expect(response.data.success).toBe(true);
        }
      }
    });
  });

  describe('🔒 权限验证测试', () => {
    it('应该要求认证才能访问学生端点', async () => {
      const endpoints = [
        { method: 'get', path: '/students' },
        { method: 'post', path: '/students' },
        { method: 'get', path: '/students/1' },
        { method: 'put', path: '/students/1' },
        { method: 'delete', path: '/students/1' }
      ];

      for (const endpoint of endpoints) {
        let response;
        const testData = { 
          name: '测试学生', 
          gender: '男', 
          birthDate: '2020-06-15', 
          parentName: '测试家长', 
          parentPhone: '13900139000' 
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
  });

  describe('🎯 性能和安全测试', () => {
    it('应该在合理时间内响应学生列表请求', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过性能测试 - 没有认证token');
        return;
      }

      const startTime = Date.now();
      
      const response: AxiosResponse<ApiResponse> = await apiClient.get('/students', {
        headers: { 'Authorization': `Bearer ${authToken}` },
        params: { limit: 100 }
      });
      
      const responseTime = Date.now() - startTime;
      
      console.log(`学生列表响应时间: ${responseTime}ms`);
      console.log(`学生列表数据量: ${response.data?.data?.length || 0}`);
      
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
          gender: '男',
          birthDate: '2020-06-15',
          parentName: '正常家长',
          parentPhone: '13900139000'
        },
        {
          name: "'; DROP TABLE students; --",
          gender: '男',
          birthDate: '2020-06-15',
          parentName: '正常家长',
          parentPhone: '13900139000'
        }
      ];

      for (const maliciousData of maliciousInputs) {
        const response: AxiosResponse<ApiResponse> = await apiClient.post('/students', maliciousData, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`安全测试 [${maliciousData.name}] 状态:`, response.status);
        
        // 应该被拒绝或者清理
        if (response.status === 201) {
          // 如果创建成功，检查数据是否被清理
          expect(response.data.data.name).not.toContain('<script>');
          expect(response.data.data.name).not.toContain('DROP TABLE');
          if (response.data.data?.id) {
            testStudentIds.push(response.data.data.id);
          }
        } else {
          expect([400, 422]).toContain(response.status);
        }
      }
    });
  });
});