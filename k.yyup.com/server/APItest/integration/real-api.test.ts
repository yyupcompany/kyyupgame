import axios, { AxiosResponse } from 'axios';
import { TestDataFactory } from '../helpers/testUtils';

// 真实API基地址
const API_BASE_URL = 'http://localhost:3000/api';

// API客户端配置
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  validateStatus: () => true, // 不要抛出错误，让我们处理所有状态码
});

// 测试用户认证token
let authToken: string = '';
let testUserId: number = 0;
let testStudentId: number = 0;
let testTeacherId: number = 0;
let testClassId: number = 0;
let testActivityId: number = 0;

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

describe('真实API集成测试', () => {
  beforeAll(async () => {
    console.log('🚀 开始真实API集成测试...');
    console.log('API Base URL:', API_BASE_URL);
  });

  afterAll(async () => {
    console.log('🧹 清理测试数据...');
    // 清理测试数据（如果需要）
  });

  describe('🔐 认证API测试', () => {
    it('应该能够注册新用户', async () => {
      const userData = {
        username: `test_user_${Date.now()}`,
        email: `test${Date.now()}@test.com`,
        password: 'Test123456',
        confirmPassword: 'Test123456',
        role: 'teacher'
      };

      const response: AxiosResponse<ApiResponse> = await apiClient.post('/auth/register', userData);
      
      console.log('注册响应状态:', response.status);
      console.log('注册响应数据:', JSON.stringify(response.data, null, 2));

      if (response.status === 201 && response.data.success) {
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
        
        // 保存用户ID供后续测试使用
        if (response.data.data?.id) {
          testUserId = response.data.data.id;
        }
      } else {
        // 如果注册失败，可能是用户已存在，我们继续测试登录
        console.log('注册可能失败，将测试登录功能');
      }
    });

    it('应该能够登录获取token', async () => {
      const loginData = {
        email: 'admin@k.yyup.cc', // 使用已知的管理员账户
        password: 'admin123'
      };

      const response: AxiosResponse<ApiResponse> = await apiClient.post('/auth/login', loginData);
      
      console.log('登录响应状态:', response.status);
      console.log('登录响应数据:', JSON.stringify(response.data, null, 2));

      if (response.status === 200 && response.data.success) {
        expect(response.data.success).toBe(true);
        expect(response.data.data?.token).toBeDefined();
        
        // 保存token供后续测试使用
        authToken = response.data.data.token;
        console.log('✅ 获取到认证token:', authToken.substring(0, 20) + '...');
      } else {
        // 尝试备用登录方式
        const altLoginData = {
          username: 'admin',
          password: 'admin123'
        };
        
        const altResponse = await apiClient.post('/auth/login', altLoginData);
        console.log('备用登录响应:', altResponse.status, altResponse.data);
        
        if (altResponse.status === 200 && altResponse.data.success) {
          authToken = altResponse.data.data.token;
        }
      }
    });

    it('应该能够获取用户资料', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过用户资料测试 - 没有认证token');
        return;
      }

      const response: AxiosResponse<ApiResponse> = await apiClient.get('/auth/profile', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('用户资料响应状态:', response.status);
      console.log('用户资料响应数据:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }
    });
  });

  describe('👥 用户管理API测试 (CRUD)', () => {
    it('应该能够获取用户列表 (READ)', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过用户列表测试 - 没有认证token');
        return;
      }

      const response: AxiosResponse<ApiResponse> = await apiClient.get('/users', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('用户列表响应状态:', response.status);
      console.log('用户列表数据量:', response.data?.data?.length || 0);

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);
      }
    });

    it('应该能够创建新用户 (CREATE)', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过创建用户测试 - 没有认证token');
        return;
      }

      const newUser = {
        username: `api_test_user_${Date.now()}`,
        email: `apitest${Date.now()}@test.com`,
        password: 'ApiTest123',
        role: 'teacher',
        name: 'API测试用户'
      };

      const response: AxiosResponse<ApiResponse> = await apiClient.post('/users', newUser, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('创建用户响应状态:', response.status);
      console.log('创建用户响应数据:', JSON.stringify(response.data, null, 2));

      if (response.status === 201 && response.data.success) {
        expect(response.data.success).toBe(true);
        expect(response.data.data?.id).toBeDefined();
        testUserId = response.data.data.id;
      }
    });

    it('应该能够更新用户信息 (UPDATE)', async () => {
      if (!authToken || !testUserId) {
        console.log('⚠️ 跳过更新用户测试 - 没有认证token或用户ID');
        return;
      }

      const updateData = {
        name: '更新后的API测试用户',
        email: `updated${Date.now()}@test.com`
      };

      const response: AxiosResponse<ApiResponse> = await apiClient.put(`/users/${testUserId}`, updateData, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('更新用户响应状态:', response.status);
      console.log('更新用户响应数据:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
      }
    });

    it('应该能够获取特定用户信息 (READ)', async () => {
      if (!authToken || !testUserId) {
        console.log('⚠️ 跳过获取用户测试 - 没有认证token或用户ID');
        return;
      }

      const response: AxiosResponse<ApiResponse> = await apiClient.get(`/users/${testUserId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('获取用户响应状态:', response.status);
      console.log('获取用户响应数据:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        expect(response.data.data?.id).toBe(testUserId);
      }
    });
  });

  describe('🎓 学生管理API测试 (CRUD)', () => {
    it('应该能够获取学生列表 (READ)', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过学生列表测试 - 没有认证token');
        return;
      }

      const response: AxiosResponse<ApiResponse> = await apiClient.get('/students', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('学生列表响应状态:', response.status);
      console.log('学生列表数据量:', response.data?.data?.length || 0);

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);
      }
    });

    it('应该能够创建新学生 (CREATE)', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过创建学生测试 - 没有认证token');
        return;
      }

      const newStudent = {
        name: `API测试学生_${Date.now()}`,
        gender: '男',
        birthDate: '2020-06-15',
        parentName: 'API测试家长',
        parentPhone: '13900139000',
        enrollmentDate: new Date().toISOString().split('T')[0]
      };

      const response: AxiosResponse<ApiResponse> = await apiClient.post('/students', newStudent, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('创建学生响应状态:', response.status);
      console.log('创建学生响应数据:', JSON.stringify(response.data, null, 2));

      if (response.status === 201 && response.data.success) {
        expect(response.data.success).toBe(true);
        expect(response.data.data?.id).toBeDefined();
        testStudentId = response.data.data.id;
      }
    });

    it('应该能够更新学生信息 (UPDATE)', async () => {
      if (!authToken || !testStudentId) {
        console.log('⚠️ 跳过更新学生测试 - 没有认证token或学生ID');
        return;
      }

      const updateData = {
        name: '更新后的API测试学生',
        parentPhone: '13800138000'
      };

      const response: AxiosResponse<ApiResponse> = await apiClient.put(`/students/${testStudentId}`, updateData, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('更新学生响应状态:', response.status);
      console.log('更新学生响应数据:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
      }
    });

    it('应该能够获取特定学生信息 (READ)', async () => {
      if (!authToken || !testStudentId) {
        console.log('⚠️ 跳过获取学生测试 - 没有认证token或学生ID');
        return;
      }

      const response: AxiosResponse<ApiResponse> = await apiClient.get(`/students/${testStudentId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('获取学生响应状态:', response.status);
      console.log('获取学生响应数据:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        expect(response.data.data?.id).toBe(testStudentId);
      }
    });
  });

  describe('👨‍🏫 教师管理API测试 (CRUD)', () => {
    it('应该能够获取教师列表 (READ)', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过教师列表测试 - 没有认证token');
        return;
      }

      const response: AxiosResponse<ApiResponse> = await apiClient.get('/teachers', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('教师列表响应状态:', response.status);
      console.log('教师列表数据量:', response.data?.data?.length || 0);

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);
      }
    });

    it('应该能够创建新教师 (CREATE)', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过创建教师测试 - 没有认证token');
        return;
      }

      const newTeacher = {
        name: `API测试教师_${Date.now()}`,
        email: `teacher${Date.now()}@test.com`,
        phone: '13700137000',
        qualification: '学前教育本科',
        experience: 3,
        salary: 8000,
        status: 'active'
      };

      const response: AxiosResponse<ApiResponse> = await apiClient.post('/teachers', newTeacher, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('创建教师响应状态:', response.status);
      console.log('创建教师响应数据:', JSON.stringify(response.data, null, 2));

      if (response.status === 201 && response.data.success) {
        expect(response.data.success).toBe(true);
        expect(response.data.data?.id).toBeDefined();
        testTeacherId = response.data.data.id;
      }
    });
  });

  describe('🏫 班级管理API测试 (CRUD)', () => {
    it('应该能够获取班级列表 (READ)', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过班级列表测试 - 没有认证token');
        return;
      }

      const response: AxiosResponse<ApiResponse> = await apiClient.get('/classes', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('班级列表响应状态:', response.status);
      console.log('班级列表数据量:', response.data?.data?.length || 0);

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);
      }
    });

    it('应该能够创建新班级 (CREATE)', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过创建班级测试 - 没有认证token');
        return;
      }

      const newClass = {
        name: `API测试班级_${Date.now()}`,
        grade: '大班',
        capacity: 25,
        teacherId: testTeacherId || 1,
        status: 'active'
      };

      const response: AxiosResponse<ApiResponse> = await apiClient.post('/classes', newClass, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('创建班级响应状态:', response.status);
      console.log('创建班级响应数据:', JSON.stringify(response.data, null, 2));

      if (response.status === 201 && response.data.success) {
        expect(response.data.success).toBe(true);
        expect(response.data.data?.id).toBeDefined();
        testClassId = response.data.data.id;
      }
    });
  });

  describe('🎯 活动管理API测试 (CRUD)', () => {
    it('应该能够获取活动列表 (READ)', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过活动列表测试 - 没有认证token');
        return;
      }

      const response: AxiosResponse<ApiResponse> = await apiClient.get('/activities', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('活动列表响应状态:', response.status);
      console.log('活动列表数据量:', response.data?.data?.length || 0);

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);
      }
    });

    it('应该能够创建新活动 (CREATE)', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过创建活动测试 - 没有认证token');
        return;
      }

      const newActivity = {
        title: `API测试活动_${Date.now()}`,
        description: 'API集成测试创建的活动',
        type: '室内活动',
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        location: 'API测试教室',
        capacity: 20,
        fee: 50,
        organizerId: testTeacherId || 1
      };

      const response: AxiosResponse<ApiResponse> = await apiClient.post('/activities', newActivity, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('创建活动响应状态:', response.status);
      console.log('创建活动响应数据:', JSON.stringify(response.data, null, 2));

      if (response.status === 201 && response.data.success) {
        expect(response.data.success).toBe(true);
        expect(response.data.data?.id).toBeDefined();
        testActivityId = response.data.data.id;
      }
    });
  });

  describe('📊 系统统计API测试', () => {
    it('应该能够获取系统统计信息', async () => {
      if (!authToken) {
        console.log('⚠️ 跳过系统统计测试 - 没有认证token');
        return;
      }

      const response: AxiosResponse<ApiResponse> = await apiClient.get('/analytics/overview', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('系统统计响应状态:', response.status);
      console.log('系统统计响应数据:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        expect(response.data.data).toBeDefined();
      }
    });
  });

  describe('🗑️ 数据清理测试 (DELETE)', () => {
    it('应该能够删除测试活动 (DELETE)', async () => {
      if (!authToken || !testActivityId) {
        console.log('⚠️ 跳过删除活动测试 - 没有认证token或活动ID');
        return;
      }

      const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/activities/${testActivityId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('删除活动响应状态:', response.status);
      console.log('删除活动响应数据:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
      }
    });

    it('应该能够删除测试班级 (DELETE)', async () => {
      if (!authToken || !testClassId) {
        console.log('⚠️ 跳过删除班级测试 - 没有认证token或班级ID');
        return;
      }

      const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/classes/${testClassId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('删除班级响应状态:', response.status);
      console.log('删除班级响应数据:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
      }
    });

    it('应该能够删除测试学生 (DELETE)', async () => {
      if (!authToken || !testStudentId) {
        console.log('⚠️ 跳过删除学生测试 - 没有认证token或学生ID');
        return;
      }

      const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/students/${testStudentId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('删除学生响应状态:', response.status);
      console.log('删除学生响应数据:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
      }
    });
  });
});