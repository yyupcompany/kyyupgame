/**
 * 简单API集成测试 - 直接测试后端API
 * 不使用前端API模块，避免mock干扰
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

describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';
import { authApi } from '@/api/auth';


// 测试配置
const API_BASE_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 30000;

// 测试凭据
const TEST_CREDENTIALS = {
  username: '13800138000',
  password: '13800138000123'
};

// 全局变量
let authToken: string = '';

describe('简单API集成测试', () => {
  
  beforeAll(async () => {
    console.log('🔧 初始化测试环境...');
    
    // 检查后端服务
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
      expect(healthResponse.status).toBe(200);
      console.log('✅ 后端服务器正常运行');
    } catch (error) {
      throw new Error('❌ 后端服务器未运行，请先启动: npm run start:backend');
    }

    // 登录获取token
    try {
      const loginResponse = await authApi.unifiedLogin(unifiedLoginData));
      
      console.log('登录响应状态:', loginResponse.status);
      console.log('登录响应数据:', JSON.stringify(loginResponse.data, null, 2));
      
      if (loginResponse.data && loginResponse.data.success && loginResponse.data.data) {
        authToken = loginResponse.data.data.accessToken;
        console.log('✅ 登录成功，token:', authToken.substring(0, 20) + '...');
      } else {
        throw new Error('登录响应格式不正确');
      }
    } catch (error: any) {
      console.error('登录错误:', error.message);
      throw new Error('❌ 登录失败: ' + error.message);
    }
  }, TEST_TIMEOUT);

  describe('仪表盘API测试', () => {
    it('应该能够获取仪表盘统计数据', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      console.log('仪表盘统计响应:', JSON.stringify(response.data, null, 2));

      // 验证响应成功
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeDefined();

      // 验证必填字段
      const data = response.data.data;
      expect(data).toHaveProperty('userCount');
      expect(data).toHaveProperty('studentCount');
      expect(data).toHaveProperty('teacherCount');
      expect(data).toHaveProperty('classCount');

      // 验证字段类型
      expect(typeof data.userCount).toBe('number');
      expect(typeof data.studentCount).toBe('number');
      expect(typeof data.teacherCount).toBe('number');
      expect(typeof data.classCount).toBe('number');

      console.log('✅ 仪表盘统计数据验证通过');
      console.log(`   用户数: ${data.userCount}`);
      console.log(`   学生数: ${data.studentCount}`);
      console.log(`   教师数: ${data.teacherCount}`);
      console.log(`   班级数: ${data.classCount}`);
    }, TEST_TIMEOUT);

    it('应该能够获取仪表盘概览数据', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/overview`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      console.log('仪表盘概览响应:', JSON.stringify(response.data, null, 2));

      // 验证响应成功
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeDefined();

      console.log('✅ 仪表盘概览数据验证通过');
    }, TEST_TIMEOUT);
  });

  describe('用户API测试', () => {
    it('应该能够获取用户列表', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { page: 1, pageSize: 10 }
      });

      console.log('用户列表响应:', JSON.stringify(response.data, null, 2));

      // 验证响应成功
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeDefined();

      // 验证分页结构
      const data = response.data.data;
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('total');
      expect(Array.isArray(data.items)).toBe(true);

      // 验证用户数据结构
      if (data.items.length > 0) {
        const user = data.items[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('email');
        
        console.log('✅ 用户列表数据验证通过');
        console.log(`   总用户数: ${data.total}`);
        console.log(`   当前页用户数: ${data.items.length}`);
        console.log(`   第一个用户: ${user.username} (${user.email})`);
      }
    }, TEST_TIMEOUT);
  });

  describe('教师API测试', () => {
    it('应该能够获取教师列表', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/teachers`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { page: 1, pageSize: 10 }
      });

      console.log('教师列表响应:', JSON.stringify(response.data, null, 2));

      // 验证响应成功
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeDefined();

      // 验证分页结构
      const data = response.data.data;
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('total');
      expect(Array.isArray(data.items)).toBe(true);

      console.log('✅ 教师列表数据验证通过');
      console.log(`   总教师数: ${data.total}`);
      console.log(`   当前页教师数: ${data.items.length}`);
    }, TEST_TIMEOUT);
  });

  describe('学生API测试', () => {
    it('应该能够获取学生列表', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/students`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { page: 1, pageSize: 10 }
      });

      console.log('学生列表响应:', JSON.stringify(response.data, null, 2));

      // 验证响应成功
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeDefined();

      // 验证分页结构
      const data = response.data.data;
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('total');
      expect(Array.isArray(data.items)).toBe(true);

      console.log('✅ 学生列表数据验证通过');
      console.log(`   总学生数: ${data.total}`);
      console.log(`   当前页学生数: ${data.items.length}`);
    }, TEST_TIMEOUT);
  });

  describe('班级API测试', () => {
    it('应该能够获取班级列表', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/classes`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { page: 1, pageSize: 10 }
      });

      console.log('班级列表响应:', JSON.stringify(response.data, null, 2));

      // 验证响应成功
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeDefined();

      // 验证分页结构
      const data = response.data.data;
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('total');
      expect(Array.isArray(data.items)).toBe(true);

      console.log('✅ 班级列表数据验证通过');
      console.log(`   总班级数: ${data.total}`);
      console.log(`   当前页班级数: ${data.items.length}`);
    }, TEST_TIMEOUT);
  });

  describe('活动API测试', () => {
    it('应该能够获取活动列表', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/activities`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { page: 1, pageSize: 10 }
      });

      console.log('活动列表响应:', JSON.stringify(response.data, null, 2));

      // 验证响应成功
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeDefined();

      // 验证分页结构
      const data = response.data.data;
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('total');
      expect(Array.isArray(data.items)).toBe(true);

      console.log('✅ 活动列表数据验证通过');
      console.log(`   总活动数: ${data.total}`);
      console.log(`   当前页活动数: ${data.items.length}`);
    }, TEST_TIMEOUT);
  });
});

