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

interface Parent {
  id: number;
  name: string;
  phone: string;
  email?: string;
  wechat?: string;
  idCard?: string;
  address?: string;
  occupation?: string;
  relationship: 'father' | 'mother' | 'guardian';
  emergencyContact?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

interface ParentStudent {
  id: number;
  parentId: number;
  studentId: number;
  relationship: 'father' | 'mother' | 'guardian';
  isEmergencyContact: boolean;
  createdAt: string;
  parent?: Parent;
  student?: any;
}

describe('家长管理API全面测试 - 参数验证', () => {
  let authToken: string = '';
  let testParentId: number = 0;
  let testStudentId: number = 0;

  beforeAll(async () => {
    console.log('🚀 开始家长管理API全面测试...');
    console.log('📋 测试范围: 10个家长管理端点的完整参数验证');
    
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

    // 创建测试学生用于关系测试
    const studentData = TestDataFactory.createStudent({
      name: `测试学生_${Date.now()}`,
      gender: 'male',
      birth_date: '2020-01-01',
      enrollment_date: '2024-09-01'
    });

    const studentResponse = await apiClient.post('/students', studentData);
    if (studentResponse.data?.success && studentResponse.data?.data?.id) {
      testStudentId = studentResponse.data.data.id;
      console.log('✅ 测试学生创建成功, ID:', testStudentId);
    }
  });

  afterAll(async () => {
    // 清理测试数据
    if (testParentId > 0) {
      await apiClient.delete(`/parents/${testParentId}`);
      console.log('🧹 测试家长数据已清理');
    }
    
    if (testStudentId > 0) {
      await apiClient.delete(`/students/${testStudentId}`);
      console.log('🧹 测试学生数据已清理');
    }
    
    console.log('🧹 家长管理测试完成');
  });

  describe('POST /parents - 创建家长参数验证', () => {
    // 有效创建参数组合
    const validCreateParams = [
      {
        name: '张三爸爸',
        phone: '13800138001',
        email: 'father@test.com',
        wechat: 'father_wx_001',
        idCard: '110101199001011234',
        address: '北京市朝阳区测试街道123号',
        occupation: '软件工程师',
        relationship: 'father' as const,
        emergencyContact: '13900139001',
        remark: '测试家长备注',
        description_test: '完整参数创建家长'
      },
      {
        name: '李四妈妈',
        phone: '13800138002',
        relationship: 'mother' as const,
        description_test: '最小必填参数创建家长'
      },
      {
        name: '王五监护人',
        phone: '13800138003',
        relationship: 'guardian' as const,
        description_test: '监护人角色创建'
      }
    ];

    // 无效创建参数组合
    const invalidCreateParams = [
      {
        // 缺少name
        phone: '13800138001',
        relationship: 'father',
        expected_errors: ['家长姓名不能为空'],
        description: '缺少家长姓名'
      },
      {
        name: '测试家长',
        // 缺少phone
        relationship: 'father',
        expected_errors: ['联系电话不能为空'],
        description: '缺少联系电话'
      },
      {
        name: '测试家长',
        phone: '13800138001',
        // 缺少relationship
        expected_errors: ['与学生关系不能为空'],
        description: '缺少关系类型'
      },
      {
        name: '', // 空name
        phone: '13800138001',
        relationship: 'father',
        expected_errors: ['家长姓名不能为空'],
        description: '空家长姓名'
      },
      {
        name: 'a'.repeat(51), // 超长name
        phone: '13800138001',
        relationship: 'father',
        expected_errors: ['家长姓名长度不能超过50个字符'],
        description: '家长姓名超长'
      },
      {
        name: '测试家长',
        phone: '', // 空phone
        relationship: 'father',
        expected_errors: ['联系电话不能为空'],
        description: '空联系电话'
      },
      {
        name: '测试家长',
        phone: '123', // 无效phone
        relationship: 'father',
        expected_errors: ['联系电话格式不正确'],
        description: '无效电话格式'
      },
      {
        name: '测试家长',
        phone: '13800138001',
        email: 'invalid-email', // 无效email
        relationship: 'father',
        expected_errors: ['邮箱格式不正确'],
        description: '无效邮箱格式'
      },
      {
        name: '测试家长',
        phone: '13800138001',
        relationship: 'invalid_relationship', // 无效relationship
        expected_errors: ['关系类型不正确'],
        description: '无效关系类型'
      },
      {
        name: '测试家长',
        phone: '13800138001',
        relationship: 'father',
        idCard: '12345', // 无效身份证
        expected_errors: ['身份证号格式不正确'],
        description: '无效身份证号'
      }
    ];

    validCreateParams.forEach((params, index) => {
      test(`应该成功创建家长 - ${params.description_test}`, async () => {
        const requestParams = { ...params };
        delete requestParams.description_test;

        const response = await apiClient.post('/parents', requestParams);
        
        expect(response.status).toBe(201);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('id');
        expect(response.data.data.name).toBe(requestParams.name);
        expect(response.data.data.phone).toBe(requestParams.phone);
        expect(response.data.data.relationship).toBe(requestParams.relationship);
        
        // 保存第一个创建的家长ID用于后续测试
        if (index === 0) {
          testParentId = response.data.data.id;
          console.log('✅ 测试家长创建成功, ID:', testParentId);
        }
      }, 10000);
    });

    invalidCreateParams.forEach((params) => {
      test(`应该拒绝创建家长 - ${params.description}`, async () => {
        const requestParams = { ...params };
        delete requestParams.expected_errors;
        delete requestParams.description;

        const response = await apiClient.post('/parents', requestParams);
        
        expect(response.status).toBe(400);
        expect(response.data.success).toBe(false);
        expect(response.data.message).toBeDefined();
      }, 10000);
    });
  });

  describe('GET /parents - 获取家长列表参数验证', () => {
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
        params: { page: 2, limit: 20, relationship: 'father' },
        description: '分页+关系筛选'
      },
      {
        params: { search: '张三' },
        description: '关键词搜索'
      },
      {
        params: { page: 1, limit: 5, relationship: 'mother', search: '妈妈' },
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
        params: { relationship: 'invalid_relationship' },
        description: '无效关系类型'
      }
    ];

    validQueryParams.forEach((testCase) => {
      test(`应该成功获取家长列表 - ${testCase.description}`, async () => {
        const response = await apiClient.get('/parents', { params: testCase.params });
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('parents');
        expect(response.data.data).toHaveProperty('pagination');
        expect(Array.isArray(response.data.data.parents)).toBe(true);
        expect(response.data.data.pagination).toHaveProperty('total');
        expect(response.data.data.pagination).toHaveProperty('page');
        expect(response.data.data.pagination).toHaveProperty('limit');
        expect(response.data.data.pagination).toHaveProperty('totalPages');
      }, 10000);
    });

    invalidQueryParams.forEach((testCase) => {
      test(`应该拒绝获取家长列表 - ${testCase.description}`, async () => {
        const response = await apiClient.get('/parents', { params: testCase.params });
        
        expect([400, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      }, 10000);
    });
  });

  describe('GET /parents/:id - 获取单个家长参数验证', () => {
    test('应该成功获取家长详情 - 有效ID', async () => {
      if (testParentId === 0) {
        console.log('⚠️ 跳过测试：无有效的测试家长ID');
        return;
      }

      const response = await apiClient.get(`/parents/${testParentId}`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('id');
      expect(response.data.data.id).toBe(testParentId);
      expect(response.data.data).toHaveProperty('name');
      expect(response.data.data).toHaveProperty('phone');
      expect(response.data.data).toHaveProperty('relationship');
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
      test(`应该拒绝获取家长详情 - ${testCase.description}`, async () => {
        const response = await apiClient.get(`/parents/${testCase.id}`);
        
        expect([400, 404, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      }, 10000);
    });
  });

  describe('PUT /parents/:id - 更新家长参数验证', () => {
    // 有效更新参数组合
    const validUpdateParams = [
      {
        data: {
          name: '更新后的家长姓名',
          phone: '13900139001'
        },
        description: '部分字段更新'
      },
      {
        data: {
          email: 'updated@test.com',
          occupation: '更新后的职业'
        },
        description: '可选字段更新'
      },
      {
        data: {
          name: '完整更新的家长',
          phone: '13900139002',
          email: 'complete@test.com',
          wechat: 'updated_wx',
          address: '更新后的地址',
          occupation: '更新后的职业',
          emergencyContact: '13900139003',
          remark: '更新后的备注'
        },
        description: '完整信息更新'
      }
    ];

    // 无效更新参数组合
    const invalidUpdateParams = [
      {
        data: { name: '' },
        description: '空姓名'
      },
      {
        data: { name: 'a'.repeat(51) },
        description: '姓名超长'
      },
      {
        data: { phone: '' },
        description: '空电话'
      },
      {
        data: { phone: '123' },
        description: '无效电话格式'
      },
      {
        data: { email: 'invalid-email' },
        description: '无效邮箱'
      },
      {
        data: { relationship: 'invalid_relationship' },
        description: '无效关系类型'
      },
      {
        data: { idCard: '12345' },
        description: '无效身份证号'
      }
    ];

    validUpdateParams.forEach((testCase) => {
      test(`应该成功更新家长 - ${testCase.description}`, async () => {
        if (testParentId === 0) {
          console.log('⚠️ 跳过测试：无有效的测试家长ID');
          return;
        }

        const response = await apiClient.put(`/parents/${testParentId}`, testCase.data);
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('id');
        expect(response.data.data.id).toBe(testParentId);
        
        // 验证更新的字段
        Object.keys(testCase.data).forEach(key => {
          expect(response.data.data[key]).toBe(testCase.data[key]);
        });
      }, 10000);
    });

    invalidUpdateParams.forEach((testCase) => {
      test(`应该拒绝更新家长 - ${testCase.description}`, async () => {
        if (testParentId === 0) {
          console.log('⚠️ 跳过测试：无有效的测试家长ID');
          return;
        }

        const response = await apiClient.put(`/parents/${testParentId}`, testCase.data);
        
        expect(response.status).toBe(400);
        expect(response.data.success).toBe(false);
      }, 10000);
    });

    // 无效ID更新测试
    test('应该拒绝更新不存在的家长', async () => {
      const response = await apiClient.put('/parents/99999', {
        name: '测试更新'
      });
      
      expect(response.status).toBe(404);
      expect(response.data.success).toBe(false);
    }, 10000);
  });

  describe('DELETE /parents/:id - 删除家长参数验证', () => {
    let tempParentId: number = 0;

    beforeAll(async () => {
      // 创建临时家长用于删除测试
      const tempParentData = {
        name: `临时测试家长_${Date.now()}`,
        phone: '13800138999',
        relationship: 'father' as const
      };

      const response = await apiClient.post('/parents', tempParentData);
      if (response.data?.success && response.data?.data?.id) {
        tempParentId = response.data.data.id;
        console.log('✅ 临时测试家长创建成功, ID:', tempParentId);
      }
    });

    test('应该成功删除家长 - 有效ID', async () => {
      if (tempParentId === 0) {
        console.log('⚠️ 跳过测试：无有效的临时家长ID');
        return;
      }

      const response = await apiClient.delete(`/parents/${tempParentId}`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toContain('删除成功');
      
      // 验证删除后无法获取
      const getResponse = await apiClient.get(`/parents/${tempParentId}`);
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
      test(`应该拒绝删除家长 - ${testCase.description}`, async () => {
        const response = await apiClient.delete(`/parents/${testCase.id}`);
        
        expect([400, 404, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      }, 10000);
    });
  });

  describe('GET /parents/:id/students - 获取家长学生关系参数验证', () => {
    test('应该成功获取家长学生列表 - 有效ID', async () => {
      if (testParentId === 0) {
        console.log('⚠️ 跳过测试：无有效的测试家长ID');
        return;
      }

      const response = await apiClient.get(`/parents/${testParentId}/students`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('students');
      expect(response.data.data).toHaveProperty('total');
      expect(Array.isArray(response.data.data.students)).toBe(true);
    }, 10000);

    // 无效ID测试
    const invalidIds = [
      { id: 0, description: 'ID为0' },
      { id: -1, description: '负数ID' },
      { id: 'abc', description: '非数字ID' },
      { id: 99999, description: '不存在的ID' }
    ];

    invalidIds.forEach((testCase) => {
      test(`应该拒绝获取家长学生列表 - ${testCase.description}`, async () => {
        const response = await apiClient.get(`/parents/${testCase.id}/students`);
        
        expect([400, 404, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      }, 10000);
    });
  });

  describe('POST /parents/:id/students - 添加家长学生关系参数验证', () => {
    // 有效关系参数组合
    const validRelationParams = [
      {
        studentId: () => testStudentId,
        relationship: 'father' as const,
        isEmergencyContact: true,
        description: '父亲关系+紧急联系人'
      },
      {
        studentId: () => testStudentId,
        relationship: 'mother' as const,
        description: '母亲关系'
      },
      {
        studentId: () => testStudentId,
        relationship: 'guardian' as const,
        isEmergencyContact: false,
        description: '监护人关系'
      }
    ];

    // 无效关系参数组合
    const invalidRelationParams = [
      {
        // 缺少studentId
        relationship: 'father',
        expected_errors: ['学生ID不能为空'],
        description: '缺少学生ID'
      },
      {
        studentId: () => testStudentId,
        // 缺少relationship
        expected_errors: ['关系类型不能为空'],
        description: '缺少关系类型'
      },
      {
        studentId: 0, // 无效studentId
        relationship: 'father',
        expected_errors: ['学生ID不正确'],
        description: '无效学生ID'
      },
      {
        studentId: () => testStudentId,
        relationship: 'invalid_relationship', // 无效relationship
        expected_errors: ['关系类型不正确'],
        description: '无效关系类型'
      }
    ];

    validRelationParams.forEach((params, index) => {
      test(`应该成功添加家长学生关系 - ${params.description}`, async () => {
        if (testParentId === 0 || testStudentId === 0) {
          console.log('⚠️ 跳过测试：无有效的测试ID');
          return;
        }

        const requestParams = { ...params };
        delete requestParams.description;
        
        // 处理函数类型的studentId
        if (typeof requestParams.studentId === 'function') {
          requestParams.studentId = requestParams.studentId();
        }

        const response = await apiClient.post(`/parents/${testParentId}/students`, requestParams);
        
        expect(response.status).toBe(201);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('id');
        expect(response.data.data.parentId).toBe(testParentId);
        expect(response.data.data.studentId).toBe(requestParams.studentId);
        expect(response.data.data.relationship).toBe(requestParams.relationship);
      }, 10000);
    });

    invalidRelationParams.forEach((params) => {
      test(`应该拒绝添加家长学生关系 - ${params.description}`, async () => {
        if (testParentId === 0) {
          console.log('⚠️ 跳过测试：无有效的测试家长ID');
          return;
        }

        const requestParams = { ...params };
        delete requestParams.expected_errors;
        delete requestParams.description;
        
        // 处理函数类型的studentId
        if (typeof requestParams.studentId === 'function') {
          requestParams.studentId = requestParams.studentId();
        }

        const response = await apiClient.post(`/parents/${testParentId}/students`, requestParams);
        
        expect([400, 404, 409]).toContain(response.status);
        expect(response.data.success).toBe(false);
      }, 10000);
    });
  });

  describe('DELETE /parents/:parentId/students/:studentId - 删除家长学生关系参数验证', () => {
    test('应该成功删除家长学生关系 - 有效ID', async () => {
      if (testParentId === 0 || testStudentId === 0) {
        console.log('⚠️ 跳过测试：无有效的测试ID');
        return;
      }

      const response = await apiClient.delete(`/parents/${testParentId}/students/${testStudentId}`);
      
      // 可能成功删除，也可能关系不存在
      expect([200, 404]).toContain(response.status);
      expect(response.data.success).toBeDefined();
    }, 10000);

    // 无效ID测试
    const invalidIdCombinations = [
      { parentId: 0, studentId: testStudentId || 1, description: '家长ID为0' },
      { parentId: testParentId || 1, studentId: 0, description: '学生ID为0' },
      { parentId: 'abc', studentId: testStudentId || 1, description: '家长ID非数字' },
      { parentId: testParentId || 1, studentId: 'abc', description: '学生ID非数字' },
      { parentId: 99999, studentId: testStudentId || 1, description: '不存在的家长ID' },
      { parentId: testParentId || 1, studentId: 99999, description: '不存在的学生ID' }
    ];

    invalidIdCombinations.forEach((testCase) => {
      test(`应该拒绝删除家长学生关系 - ${testCase.description}`, async () => {
        const response = await apiClient.delete(`/parents/${testCase.parentId}/students/${testCase.studentId}`);
        
        expect([400, 404, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      }, 10000);
    });
  });

  describe('GET /parents/:id/children - 获取家长子女列表参数验证', () => {
    test('应该成功获取家长子女列表 - 有效ID', async () => {
      if (testParentId === 0) {
        console.log('⚠️ 跳过测试：无有效的测试家长ID');
        return;
      }

      const response = await apiClient.get(`/parents/${testParentId}/children`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('children');
      expect(response.data.data).toHaveProperty('total');
      expect(Array.isArray(response.data.data.children)).toBe(true);
    }, 10000);

    // 无效ID测试
    const invalidIds = [
      { id: 0, description: 'ID为0' },
      { id: -1, description: '负数ID' },
      { id: 'abc', description: '非数字ID' },
      { id: 99999, description: '不存在的ID' }
    ];

    invalidIds.forEach((testCase) => {
      test(`应该拒绝获取家长子女列表 - ${testCase.description}`, async () => {
        const response = await apiClient.get(`/parents/${testCase.id}/children`);
        
        expect([400, 404, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      }, 10000);
    });
  });

  describe('GET /parents/:id/communications - 获取家长沟通记录参数验证', () => {
    // 有效查询参数组合
    const validCommunicationParams = [
      {
        params: {},
        description: '无参数 - 默认查询'
      },
      {
        params: { page: 1, limit: 10 },
        description: '基本分页参数'
      },
      {
        params: { type: 'phone' },
        description: '按沟通方式筛选'
      },
      {
        params: { startDate: '2024-07-01', endDate: '2024-07-31' },
        description: '按日期范围筛选'
      },
      {
        params: { page: 1, limit: 5, type: 'wechat', startDate: '2024-07-01' },
        description: '完整查询参数组合'
      }
    ];

    // 无效查询参数组合
    const invalidCommunicationParams = [
      {
        params: { type: 'invalid_type' },
        description: '无效沟通方式'
      },
      {
        params: { startDate: 'invalid-date' },
        description: '无效开始日期格式'
      },
      {
        params: { endDate: 'invalid-date' },
        description: '无效结束日期格式'
      },
      {
        params: { page: 0 },
        description: '页码为0'
      },
      {
        params: { limit: 101 },
        description: '限制数量超过最大值'
      }
    ];

    validCommunicationParams.forEach((testCase) => {
      test(`应该成功获取家长沟通记录 - ${testCase.description}`, async () => {
        if (testParentId === 0) {
          console.log('⚠️ 跳过测试：无有效的测试家长ID');
          return;
        }

        const response = await apiClient.get(`/parents/${testParentId}/communications`, { 
          params: testCase.params 
        });
        
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('communications');
        expect(response.data.data).toHaveProperty('total');
        expect(Array.isArray(response.data.data.communications)).toBe(true);
      }, 10000);
    });

    invalidCommunicationParams.forEach((testCase) => {
      test(`应该拒绝获取家长沟通记录 - ${testCase.description}`, async () => {
        if (testParentId === 0) {
          console.log('⚠️ 跳过测试：无有效的测试家长ID');
          return;
        }

        const response = await apiClient.get(`/parents/${testParentId}/communications`, { 
          params: testCase.params 
        });
        
        expect([400, 422]).toContain(response.status);
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

      const response = await noAuthClient.get('/parents');
      
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

      const response = await invalidAuthClient.get('/parents');
      
      expect(response.status).toBe(401);
      expect(response.data.success).toBe(false);
    }, 10000);
  });

  describe('数据完整性验证', () => {
    test('创建的家长应该包含完整的数据结构', async () => {
      if (testParentId === 0) {
        console.log('⚠️ 跳过测试：无有效的测试家长ID');
        return;
      }

      const response = await apiClient.get(`/parents/${testParentId}`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      
      const parent = response.data.data;
      expect(parent).toHaveProperty('id');
      expect(parent).toHaveProperty('name');
      expect(parent).toHaveProperty('phone');
      expect(parent).toHaveProperty('relationship');
      expect(parent).toHaveProperty('createdAt');
      expect(parent).toHaveProperty('updatedAt');
      
      // 验证数据类型
      expect(typeof parent.id).toBe('number');
      expect(typeof parent.name).toBe('string');
      expect(typeof parent.phone).toBe('string');
      expect(['father', 'mother', 'guardian']).toContain(parent.relationship);
    }, 10000);
  });
});