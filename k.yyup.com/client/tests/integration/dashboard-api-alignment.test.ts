/**
 * 仪表盘API集成测试 - 前后端数据对齐验证
 * 
 * 测试目标：
 * 1. 验证前端API调用与后端API返回的数据结构一致
 * 2. 验证所有必填字段存在
 * 3. 验证字段类型正确
 * 4. 验证数据转换正确
 */

import { 
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios, { AxiosInstance } from 'axios';
import {
import { authApi } from '@/api/auth';

  getDashboardStats,
  getDashboardOverview,
  getTodos,
  getSchedules,
  getClassesOverview,
  getEnrollmentTrends
} from '@/api/modules/dashboard';

// 测试配置
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 30000;

// 测试凭据
const TEST_CREDENTIALS = {
  username: process.env.TEST_USERNAME || '13800138000',
  password: process.env.TEST_PASSWORD || '13800138000123'
};

// 全局变量
let authToken: string = '';
let axiosInstance: AxiosInstance;

describe('仪表盘API集成测试 - 前后端数据对齐', () => {
  
  beforeAll(async () => {
    console.log('🔧 初始化测试环境...');
    
    // 创建axios实例
    axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: TEST_TIMEOUT
    });

    // 检查后端服务
    try {
      const healthResponse = await axiosInstance.get('/api/health');
      expect(healthResponse.status).toBe(200);
      console.log('✅ 后端服务器正常运行');
    } catch (error) {
      throw new Error('❌ 后端服务器未运行，请先启动: npm run start:backend');
    }

    // 登录获取token
    try {
      const loginResponse = await axiosInstance.post('/api/auth/unified-login', TEST_CREDENTIALS);

      console.log('登录响应:', JSON.stringify(loginResponse.data, null, 2));

      if (loginResponse.data && loginResponse.data.success) {
        // 尝试多种可能的token路径
        authToken = loginResponse.data.data?.token ||
                   loginResponse.data.accessToken ||
                   loginResponse.data.data?.accessToken ||
                   '';

        if (!authToken) {
          throw new Error('登录响应中未找到token');
        }

        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        console.log('✅ 登录成功');
      } else {
        throw new Error('登录失败: ' + (loginResponse.data?.message || '未知错误'));
      }
    } catch (error: any) {
      console.error('登录错误详情:', error);
      throw new Error('❌ 登录失败: ' + error.message);
    }
  }, TEST_TIMEOUT);

  afterAll(() => {
    console.log('🧹 清理测试环境...');
  });

  describe('仪表盘统计数据对齐', () => {
    it('前端API应该与后端API返回相同的统计数据结构', async () => {
      // 前端API调用
      const frontendResponse = await getDashboardStats();

      // 后端API调用
      const backendResponse = await axiosInstance.get('/api/dashboard/stats');

      // 验证响应成功
      expect(frontendResponse.success).toBe(true);
      expect(backendResponse.data.success).toBe(true);

      // 验证数据结构一致
      const frontendData = frontendResponse.data;
      const backendData = backendResponse.data.data;

      // 验证必填字段存在
      const requiredFields = [
        'userCount',
        'kindergartenCount',
        'studentCount',
        'enrollmentCount',
        'activityCount',
        'teacherCount',
        'classCount'
      ];

      requiredFields.forEach(field => {
        expect(frontendData).toHaveProperty(field);
        expect(backendData).toHaveProperty(field);
      });

      // 验证字段类型一致
      requiredFields.forEach(field => {
        expect(typeof frontendData[field]).toBe('number');
        expect(typeof backendData[field]).toBe('number');
      });

      // 验证数据值一致
      requiredFields.forEach(field => {
        expect(frontendData[field]).toBe(backendData[field]);
      });

      console.log('✅ 仪表盘统计数据对齐验证通过');
    }, TEST_TIMEOUT);

    it('应该正确处理统计数据的数值范围', async () => {
      const response = await axiosInstance.get('/api/dashboard/stats');
      const data = response.data.data;

      // 验证数值合理性
      expect(data.userCount).toBeGreaterThanOrEqual(0);
      expect(data.studentCount).toBeGreaterThanOrEqual(0);
      expect(data.teacherCount).toBeGreaterThanOrEqual(0);
      expect(data.classCount).toBeGreaterThanOrEqual(0);

      console.log('✅ 统计数据数值范围验证通过');
    });
  });

  describe('仪表盘概览数据对齐', () => {
    it('前端API应该与后端API返回相同的概览数据结构', async () => {
      // 前端API调用
      const frontendResponse = await getDashboardOverview();

      // 后端API调用
      const backendResponse = await axiosInstance.get('/api/dashboard/overview');

      // 验证响应成功
      expect(frontendResponse.success).toBe(true);
      expect(backendResponse.data.success).toBe(true);

      // 验证数据结构
      const frontendData = frontendResponse.data;
      const backendData = backendResponse.data.data;

      // 验证必填字段
      expect(frontendData).toHaveProperty('stats');
      expect(frontendData).toHaveProperty('recentActivities');
      expect(frontendData).toHaveProperty('upcomingEvents');

      expect(backendData).toHaveProperty('stats');
      expect(backendData).toHaveProperty('recentActivities');
      expect(backendData).toHaveProperty('upcomingEvents');

      console.log('✅ 仪表盘概览数据对齐验证通过');
    }, TEST_TIMEOUT);
  });

  describe('待办事项数据对齐', () => {
    it('前端API应该与后端API返回相同的待办事项结构', async () => {
      // 前端API调用
      const frontendResponse = await getTodos({ page: 1, pageSize: 10 });

      // 后端API调用
      const backendResponse = await axiosInstance.get('/api/dashboard/todos', {
        params: { page: 1, pageSize: 10 }
      });

      // 验证响应成功
      expect(frontendResponse.success).toBe(true);
      expect(backendResponse.data.success).toBe(true);

      // 验证分页结构
      expect(frontendResponse.data).toHaveProperty('items');
      expect(frontendResponse.data).toHaveProperty('total');
      expect(backendResponse.data.data).toHaveProperty('items');
      expect(backendResponse.data.data).toHaveProperty('total');

      // 验证数据项结构
      if (frontendResponse.data.items.length > 0) {
        const frontendTodo = frontendResponse.data.items[0];
        const backendTodo = backendResponse.data.data.items[0];

        // 验证必填字段
        const requiredFields = ['id', 'title', 'status', 'priority', 'dueDate'];
        requiredFields.forEach(field => {
          expect(frontendTodo).toHaveProperty(field);
          expect(backendTodo).toHaveProperty(field);
        });

        // 验证字段类型
        expect(typeof frontendTodo.id).toBe('number');
        expect(typeof frontendTodo.title).toBe('string');
        expect(typeof frontendTodo.status).toBe('string');
        expect(typeof frontendTodo.priority).toBe('string');
      }

      console.log('✅ 待办事项数据对齐验证通过');
    }, TEST_TIMEOUT);
  });

  describe('日程数据对齐', () => {
    it('前端API应该与后端API返回相同的日程结构', async () => {
      const params = {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      // 前端API调用
      const frontendResponse = await getSchedules(params);

      // 后端API调用
      const backendResponse = await axiosInstance.get('/api/dashboard/schedules', {
        params
      });

      // 验证响应成功
      expect(frontendResponse.success).toBe(true);
      expect(backendResponse.data.success).toBe(true);

      // 验证数据是数组
      expect(Array.isArray(frontendResponse.data)).toBe(true);
      expect(Array.isArray(backendResponse.data.data)).toBe(true);

      // 验证数据项结构
      if (frontendResponse.data.length > 0) {
        const frontendSchedule = frontendResponse.data[0];
        const backendSchedule = backendResponse.data.data[0];

        // 验证必填字段
        const requiredFields = ['id', 'title', 'startTime', 'endTime', 'type'];
        requiredFields.forEach(field => {
          expect(frontendSchedule).toHaveProperty(field);
          expect(backendSchedule).toHaveProperty(field);
        });
      }

      console.log('✅ 日程数据对齐验证通过');
    }, TEST_TIMEOUT);
  });

  describe('班级概览数据对齐', () => {
    it('前端API应该与后端API返回相同的班级概览结构', async () => {
      // 前端API调用
      const frontendResponse = await getClassesOverview();

      // 后端API调用
      const backendResponse = await axiosInstance.get('/api/dashboard/classes-overview');

      // 验证响应成功
      expect(frontendResponse.success).toBe(true);
      expect(backendResponse.data.success).toBe(true);

      // 验证数据是数组
      expect(Array.isArray(frontendResponse.data)).toBe(true);
      expect(Array.isArray(backendResponse.data.data)).toBe(true);

      // 验证数据项结构
      if (frontendResponse.data.length > 0) {
        const frontendClass = frontendResponse.data[0];
        const backendClass = backendResponse.data.data[0];

        // 验证必填字段
        const requiredFields = ['id', 'name', 'studentCount', 'teacherName'];
        requiredFields.forEach(field => {
          expect(frontendClass).toHaveProperty(field);
          expect(backendClass).toHaveProperty(field);
        });

        // 验证字段类型
        expect(typeof frontendClass.id).toBe('number');
        expect(typeof frontendClass.name).toBe('string');
        expect(typeof frontendClass.studentCount).toBe('number');
        expect(typeof frontendClass.teacherName).toBe('string');
      }

      console.log('✅ 班级概览数据对齐验证通过');
    }, TEST_TIMEOUT);
  });

  describe('招生趋势数据对齐', () => {
    it('前端API应该与后端API返回相同的招生趋势结构', async () => {
      const params = {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      // 前端API调用
      const frontendResponse = await getEnrollmentTrends(params);

      // 后端API调用
      const backendResponse = await axiosInstance.get('/api/dashboard/enrollment-trends', {
        params
      });

      // 验证响应成功
      expect(frontendResponse.success).toBe(true);
      expect(backendResponse.data.success).toBe(true);

      // 验证数据是数组
      expect(Array.isArray(frontendResponse.data)).toBe(true);
      expect(Array.isArray(backendResponse.data.data)).toBe(true);

      // 验证数据项结构
      if (frontendResponse.data.length > 0) {
        const frontendTrend = frontendResponse.data[0];
        const backendTrend = backendResponse.data.data[0];

        // 验证必填字段
        const requiredFields = ['date', 'count'];
        requiredFields.forEach(field => {
          expect(frontendTrend).toHaveProperty(field);
          expect(backendTrend).toHaveProperty(field);
        });

        // 验证字段类型
        expect(typeof frontendTrend.date).toBe('string');
        expect(typeof frontendTrend.count).toBe('number');
      }

      console.log('✅ 招生趋势数据对齐验证通过');
    }, TEST_TIMEOUT);
  });
});

