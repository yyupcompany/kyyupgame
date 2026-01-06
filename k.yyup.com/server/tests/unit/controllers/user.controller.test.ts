/**
 * 用户控制器单元测试
 * 严格验证版本
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import app from '../../src/app';
import { 
  validateApiResponse,
  validatePaginatedResponse,
  validateUserData,
  validateErrorResponse,
  validateHttpStatusCode,
  validateResponseTime,
  createApiValidationReport
} from '../utils/api-validation';
import { sequelize } from '../../src/models';

// 控制台错误检测变量
let consoleSpy: any

describe('User Controller - Strict Validation', () => {
  let authToken: string;
  let userId: string;
  let responseStartTime: number;

  beforeAll(async () => {
    // 设置测试数据库
    await sequelize.sync({ force: true });
    
    // 创建测试管理员用户
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });

    if (adminResponse.status === 200 && adminResponse.body.success) {
      authToken = adminResponse.body.data.token;
    }
  });

  afterAll(async () => {
    // 清理测试数据
    await sequelize.close();
  });

  beforeEach(() => {
    responseStartTime = Date.now();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    // 验证响应时间
    const responseTime = Date.now() - responseStartTime;
    const timeValidation = validateResponseTime(responseTime, 5000); // 5秒内
    
    if (!timeValidation.valid) => {
      console.warn('Response time warning:', timeValidation.errors);
    }
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('POST /api/users - Create User', () => {
    const validUserData = {
      username: 'testuser',
      name: '测试用户',
      email: 'testuser@example.com',
      phone: '13800138001',
      password: 'password123',
      role: 'TEACHER',
      departmentId: '1'
    };

    it('should create user with valid data and strict validation', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validUserData);

      const responseTime = Date.now() - responseStartTime;

      // 1. 验证HTTP状态码
      const statusValidation = validateHttpStatusCode(response.status, [201, 200]);
      expect(statusValidation.valid).toBe(true);

      // 2. 验证响应时间
      const timeValidation = validateResponseTime(responseTime, 3000);
      expect(timeValidation.valid).toBe(true);

      // 3. 验证API响应结构
      const apiValidation = createApiValidationReport(response.body, validateApiResponse);
      expect(apiValidation.valid).toBe(true);
      if (!apiValidation.valid) {
        console.error('API validation errors:', apiValidation.errors);
      }

      // 4. 验证业务逻辑
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

      // 5. 验证返回的用户数据结构
      if (response.body.data) {
        const userValidation = createApiValidationReport(
          response.body.data, 
          validateUserData
        );
        expect(userValidation.valid).toBe(true);
        
        // 保存用户ID用于后续测试
        userId = response.body.data.id;
      }

      // 6. 验证必填字段存在
      const requiredFields = ['id', 'username', 'name', 'email', 'role', 'status'];
      const validation = validateUserData(response.body.data);
      expect(validation.valid).toBe(true);
      if (!validation.valid) {
        console.error('User data validation errors:', validation.errors);
      }

      // 7. 验证字段类型正确
      expect(typeof response.body.data.id).toBe('string');
      expect(typeof response.body.data.username).toBe('string');
      expect(typeof response.body.data.name).toBe('string');
      expect(typeof response.body.data.email).toBe('string');
      expect(typeof response.body.data.role).toBe('string');

      // 8. 验证枚举值有效性
      const validRoles = ['ADMIN', 'TEACHER', 'PARENT', 'PRINCIPAL', 'STAFF'];
      expect(validRoles).toContain(response.body.data.role);

      const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
      expect(validStatuses).toContain(response.body.data.status);
    });

    it('should reject creation with missing required fields', async () => {
      const invalidUserData = { ...validUserData };
      delete invalidUserData.username;

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUserData);

      // 验证错误状态码
      const statusValidation = validateHttpStatusCode(response.status, [400, 422]);
      expect(statusValidation.valid).toBe(true);

      // 验证错误响应结构
      const errorValidation = createApiValidationReport(response.body, validateErrorResponse);
      expect(errorValidation.valid).toBe(true);

      // 验证错误消息
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('username');
    });

    it('should reject creation with invalid email format', async () => {
      const invalidUserData = { ...validUserData, email: 'invalid-email' };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUserData);

      const statusValidation = validateHttpStatusCode(response.status, [400, 422]);
      expect(statusValidation.valid).toBe(true);

      const errorValidation = createApiValidationReport(response.body, validateErrorResponse);
      expect(errorValidation.valid).toBe(true);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    it('should reject creation with invalid phone format', async () => {
      const invalidUserData = { ...validUserData, phone: 'invalid-phone' };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUserData);

      const statusValidation = validateHttpStatusCode(response.status, [400, 422]);
      expect(statusValidation.valid).toBe(true);

      const errorValidation = createApiValidationReport(response.body, validateErrorResponse);
      expect(errorValidation.valid).toBe(true);

      expect(response.body.success).toBe(false);
    });

    it('should reject creation with duplicate username', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validUserData);

      const statusValidation = validateHttpStatusCode(response.status, [409, 400]);
      expect(statusValidation.valid).toBe(true);

      const errorValidation = createApiValidationReport(response.body, validateErrorResponse);
      expect(errorValidation.valid).toBe(true);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('username');
    });
  });

  describe('GET /api/users - List Users', () => {
    beforeAll(async () => {
      // 创建更多测试用户
      const testUsers = [
        {
          username: 'teacher1',
          name: '教师1',
          email: 'teacher1@example.com',
          password: 'password123',
          role: 'TEACHER'
        },
        {
          username: 'teacher2',
          name: '教师2',
          email: 'teacher2@example.com',
          password: 'password123',
          role: 'TEACHER'
        }
      ];

      for (const user of testUsers) {
        await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
          .send(user);
      }
    });

    it('should return paginated user list with strict validation', async () => {
      const queryParams = {
        page: 1,
        pageSize: 10,
        role: 'TEACHER',
        status: 'ACTIVE'
      };

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .query(queryParams);

      const responseTime = Date.now() - responseStartTime;

      // 验证状态码
      const statusValidation = validateHttpStatusCode(response.status, [200]);
      expect(statusValidation.valid).toBe(true);

      // 验证响应时间
      const timeValidation = validateResponseTime(responseTime, 2000);
      expect(timeValidation.valid).toBe(true);

      // 验证分页响应结构
      const paginationValidation = createApiValidationReport(
        response.body,
        validatePaginatedResponse
      );
      expect(paginationValidation.valid).toBe(true);
      if (!paginationValidation.valid) {
        console.error('Pagination validation errors:', paginationValidation.errors);
      }

      // 验证分页字段
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toBeDefined();
      expect(response.body.data.total).toBeDefined();
      expect(response.body.data.page).toBeDefined();
      expect(response.body.data.pageSize).toBeDefined();

      // 验证分页字段类型
      expect(Array.isArray(response.body.data.items)).toBe(true);
      expect(typeof response.body.data.total).toBe('number');
      expect(typeof response.body.data.page).toBe('number');
      expect(typeof response.body.data.pageSize).toBe('number');

      // 验证分页逻辑
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.pageSize).toBe(10);
      expect(response.body.data.total).toBeGreaterThanOrEqual(0);

      // 验证列表项数据结构
      if (response.body.data.items.length > 0) {
        response.body.data.items.forEach((user: any, index: number) => {
          const userValidation = validateUserData(user);
          expect(userValidation.valid).toBe(true);
          
          if (!userValidation.valid) {
            console.error(`User item ${index} validation errors:`, userValidation.errors);
          }
        });
      }

      // 验证筛选结果
      const filteredUsers = response.body.data.items;
      filteredUsers.forEach((user: any) => {
        expect(user.role).toBe('TEACHER');
        expect(user.status).toBe('ACTIVE');
      });
    });

    it('should handle pagination parameters correctly', async () => {
      const queryParams = { page: 2, pageSize: 5 };

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .query(queryParams);

      const paginationValidation = createApiValidationReport(
        response.body,
        validatePaginatedResponse
      );
      expect(paginationValidation.valid).toBe(true);

      expect(response.body.data.page).toBe(2);
      expect(response.body.data.pageSize).toBe(5);
      expect(response.body.data.items.length).toBeLessThanOrEqual(5);
    });

    it('should handle search functionality', async () => {
      const queryParams = { search: 'teacher' };

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .query(queryParams);

      const paginationValidation = createApiValidationReport(
        response.body,
        validatePaginatedResponse
      );
      expect(paginationValidation.valid).toBe(true);

      // 验证搜索结果
      if (response.body.data.items.length > 0) {
        const searchResults = response.body.data.items;
        searchResults.forEach((user: any) => {
          const searchTerm = 'teacher';
          const matchesSearch = 
            user.name.toLowerCase().includes(searchTerm) ||
            user.username.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm);
          
          expect(matchesSearch).toBe(true);
        });
      }
    });

    it('should reject requests without authentication', async () => {
      const response = await request(app)
        .get('/api/users');

      const statusValidation = validateHttpStatusCode(response.status, [401]);
      expect(statusValidation.valid).toBe(true);

      const errorValidation = createApiValidationReport(response.body, validateErrorResponse);
      expect(errorValidation.valid).toBe(true);
    });
  });

  describe('GET /api/users/:id - Get User Details', () => {
    it('should return user details with strict validation', async () => {
      if (!userId) {
        // 如果没有用户ID，先创建一个
        const createResponse = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            username: 'detailtest',
            name: '详情测试',
            email: 'detailtest@example.com',
            password: 'password123',
            role: 'TEACHER'
          });
        
        userId = createResponse.body.data.id;
      }

      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const responseTime = Date.now() - responseStartTime;

      // 验证状态码
      const statusValidation = validateHttpStatusCode(response.status, [200]);
      expect(statusValidation.valid).toBe(true);

      // 验证响应时间
      const timeValidation = validateResponseTime(responseTime, 1000);
      expect(timeValidation.valid).toBe(true);

      // 验证API响应结构
      const apiValidation = createApiValidationReport(response.body, validateApiResponse);
      expect(apiValidation.valid).toBe(true);

      // 验证用户数据结构
      const userValidation = createApiValidationReport(
        response.body.data,
        validateUserData
      );
      expect(userValidation.valid).toBe(true);
      if (!userValidation.valid) {
        console.error('User detail validation errors:', userValidation.errors);
      }

      // 验证具体字段
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      const statusValidation = validateHttpStatusCode(response.status, [404]);
      expect(statusValidation.valid).toBe(true);

      const errorValidation = createApiValidationReport(response.body, validateErrorResponse);
      expect(errorValidation.valid).toBe(true);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should validate user ID format', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id-format')
        .set('Authorization', `Bearer ${authToken}`);

      const statusValidation = validateHttpStatusCode(response.status, [400, 404]);
      expect(statusValidation.valid).toBe(true);
    });
  });

  describe('PUT /api/users/:id - Update User', () => {
    it('should update user with valid data and strict validation', async () => {
      if (!userId) {
        throw new Error('User ID not available for update test');
      }

      const updateData = {
        name: '更新后的用户名',
        email: 'updated@example.com',
        phone: '13800138002',
        role: 'TEACHER',
        status: 'ACTIVE'
      };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      const responseTime = Date.now() - responseStartTime;

      // 验证状态码
      const statusValidation = validateHttpStatusCode(response.status, [200]);
      expect(statusValidation.valid).toBe(true);

      // 验证响应时间
      const timeValidation = validateResponseTime(responseTime, 2000);
      expect(timeValidation.valid).toBe(true);

      // 验证API响应结构
      const apiValidation = createApiValidationReport(response.body, validateApiResponse);
      expect(apiValidation.valid).toBe(true);

      // 验证更新后的用户数据
      const userValidation = createApiValidationReport(
        response.body.data,
        validateUserData
      );
      expect(userValidation.valid).toBe(true);

      // 验证字段更新
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.email).toBe(updateData.email);
      expect(response.body.data.phone).toBe(updateData.phone);
      expect(response.body.data.role).toBe(updateData.role);
      expect(response.body.data.status).toBe(updateData.status);

      // 验证更新时间戳
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it('should reject update with invalid email format', async () => {
      if (!userId) return;

      const updateData = {
        name: '更新用户',
        email: 'invalid-email-format'
      };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      const statusValidation = validateHttpStatusCode(response.status, [400, 422]);
      expect(statusValidation.valid).toBe(true);

      const errorValidation = createApiValidationReport(response.body, validateErrorResponse);
      expect(errorValidation.valid).toBe(true);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    it('should reject update with invalid role', async () => {
      if (!userId) return;

      const updateData = {
        name: '更新用户',
        role: 'INVALID_ROLE'
      };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      const statusValidation = validateHttpStatusCode(response.status, [400, 422]);
      expect(statusValidation.valid).toBe(true);

      const errorValidation = createApiValidationReport(response.body, validateErrorResponse);
      expect(errorValidation.valid).toBe(true);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id - Delete User', () => {
    let testUserId: string;

    beforeAll(async () => {
      // 创建测试用户用于删除
      const createResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'deletetest',
          name: '删除测试',
          email: 'deletetest@example.com',
          password: 'password123',
          role: 'TEACHER'
        });

      testUserId = createResponse.body.data.id;
    });

    it('should delete user successfully with strict validation', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const responseTime = Date.now() - responseStartTime;

      // 验证状态码
      const statusValidation = validateHttpStatusCode(response.status, [200, 204]);
      expect(statusValidation.valid).toBe(true);

      // 验证响应时间
      const timeValidation = validateResponseTime(responseTime, 2000);
      expect(timeValidation.valid).toBe(true);

      // 验证响应结构
      if (response.status === 200) {
        const apiValidation = createApiValidationReport(response.body, validateApiResponse);
        expect(apiValidation.valid).toBe(true);
        expect(response.body.success).toBe(true);
      }

      // 验证用户确实被删除
      const verifyResponse = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const verifyStatusValidation = validateHttpStatusCode(verifyResponse.status, [404]);
      expect(verifyStatusValidation.valid).toBe(true);
    });

    it('should return 404 when deleting non-existent user', async () => {
      const response = await request(app)
        .delete('/api/users/non-existent-user-id')
        .set('Authorization', `Bearer ${authToken}`);

      const statusValidation = validateHttpStatusCode(response.status, [404]);
      expect(statusValidation.valid).toBe(true);

      const errorValidation = createApiValidationReport(response.body, validateErrorResponse);
      expect(errorValidation.valid).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10;
      const requests = Array.from({ length: concurrentRequests }, () =>
        request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ page: 1, pageSize: 10 })
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;
      const averageTime = totalTime / concurrentRequests;

      // 验证所有请求都成功
      responses.forEach(response => {
        const statusValidation = validateHttpStatusCode(response.status, [200]);
        expect(statusValidation.valid).toBe(true);
        
        const paginationValidation = createApiValidationReport(
          response.body,
          validatePaginatedResponse
        );
        expect(paginationValidation.valid).toBe(true);
      });

      // 验证平均响应时间
      expect(averageTime).toBeLessThan(3000); // 平均3秒内
      expect(totalTime).toBeLessThan(10000); // 总时间10秒内
    });

    it('should handle large dataset pagination efficiently', async () => {
      // 测试大页码的响应
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 100, pageSize: 50 });

      const responseTime = Date.now() - responseStartTime;

      // 即使是大页码，响应时间也应该合理
      const timeValidation = validateResponseTime(responseTime, 5000);
      expect(timeValidation.valid).toBe(true);

      const paginationValidation = createApiValidationReport(
        response.body,
        validatePaginatedResponse
      );
      expect(paginationValidation.valid).toBe(true);
    });
  });

  describe('Security Tests', () => {
    it('should prevent SQL injection in search parameters', async () => {
      const maliciousQueries = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "admin'--",
        "' UNION SELECT * FROM sensitive_data --"
      ];

      for (const query of maliciousQueries) {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ search: query });

        // 应该返回正常响应，不应该执行SQL注入
        const statusValidation = validateHttpStatusCode(response.status, [200]);
        expect(statusValidation.valid).toBe(true);

        const paginationValidation = createApiValidationReport(
          response.body,
          validatePaginatedResponse
        );
        expect(paginationValidation.valid).toBe(true);
      }
    });

    it('should sanitize input data properly', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'xss_test_user',
          name: xssPayload,
          email: 'xsstest@example.com',
          password: 'password123',
          role: 'TEACHER'
        });

      // 如果成功创建，验证XSS被过滤
      if (response.status === 201 || response.status === 200) {
        const userValidation = createApiValidationReport(
          response.body.data,
          validateUserData
        );
        expect(userValidation.valid).toBe(true);
        
        // 名称中的script标签应该被过滤或转义
        expect(response.body.data.name).not.toContain('<script>');
      }
    });
  });
});