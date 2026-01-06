/**
 * API集成测试套件
 * 
 * 测试覆盖：
 * - 认证授权API
 * - 用户管理API
 * - 核心业务API
 * - AI功能API
 * - 数据验证和错误处理
 * - 权限控制
 * - 数据库事务
 */

import request from 'supertest';
import { vi } from 'vitest'
import { app } from '../../src/app';
import { setupTestDatabase, cleanupTestDatabase } from '../setup/database';
import { createTestUser, createTestToken } from '../setup/auth';
import { TestDataFactory } from '../setup/test-data-factory';


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

describe('API Integration Tests', () => {
  let testUser: any;
  let authToken: string;
  let testDataFactory: TestDataFactory;

  beforeAll(async () => {
    await setupTestDatabase();
    testDataFactory = new TestDataFactory();
    
    // 创建测试用户和认证token
    testUser = await createTestUser({
      username: 'test-api-user',
      email: 'test-api@example.com',
      role: 'admin' as any,
      permissions: ['*']
    });
    authToken = await createTestToken(testUser.id);
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('🔐 Authentication & Authorization APIs', () => {
    describe('POST /api/auth/login', () => {
      it('should login successfully with valid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            username: 'test-api-user',
            password: 'test-password'
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('token');
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data.user).toHaveProperty('id');
        expect(response.body.data.user).toHaveProperty('username', 'test-api-user');
      });

      it('should reject invalid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            username: 'test-api-user',
            password: 'wrong-password'
          })
          .expect(401);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message');
      });

      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message');
      });
    });

    describe('GET /api/auth/user-info', () => {
      it('should return user info with valid token', async () => {
        const response = await request(app)
          .get('/api/auth/user-info')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('id', testUser.id);
        expect(response.body.data).toHaveProperty('username', testUser.username);
        expect(response.body.data).toHaveProperty('permissions');
      });

      it('should reject requests without token', async () => {
        const response = await request(app)
          .get('/api/auth/user-info')
          .expect(401);

        expect(response.body).toHaveProperty('success', false);
      });

      it('should reject requests with invalid token', async () => {
        const response = await request(app)
          .get('/api/auth/user-info')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);

        expect(response.body).toHaveProperty('success', false);
      });
    });

    describe('POST /api/auth/logout', () => {
      it('should logout successfully', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
      });
    });
  });

  describe('👥 User Management APIs', () => {
    describe('GET /api/users', () => {
      it('should return paginated user list', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ page: 1, limit: 10 })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('users');
        expect(response.body.data).toHaveProperty('total');
        expect(response.body.data).toHaveProperty('page');
        expect(response.body.data).toHaveProperty('limit');
        expect(Array.isArray(response.body.data.users)).toBe(true);
      });

      it('should filter users by role', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ role: 'admin' })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        response.body.data.users.forEach((user: any) => {
          expect(user.role).toBe('admin');
        });
      });

      it('should search users by keyword', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ search: 'test' })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.users.length).toBeGreaterThan(0);
      });
    });

    describe('POST /api/users', () => {
      it('should create new user with valid data', async () => {
        const userData = {
          username: 'new-test-user',
          email: 'new-test@example.com',
          password: 'test-password',
          role: 'teacher',
          name: 'Test Teacher'
        };

        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
          .send(userData)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('username', userData.username);
        expect(response.body.data).toHaveProperty('email', userData.email);
        expect(response.body.data).not.toHaveProperty('password');
      });

      it('should reject duplicate username', async () => {
        const userData = {
          username: 'test-api-user', // 已存在的用户名
          email: 'duplicate@example.com',
          password: 'test-password',
          role: 'teacher'
        };

        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
          .send(userData)
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toContain('用户名已存在');
      });

      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('errors');
      });
    });
  });

  describe('🏫 Core Business APIs', () => {
    let testStudent: any;
    let testTeacher: any;
    let testClass: any;

    beforeAll(async () => {
      // 创建测试数据
      testTeacher = await testDataFactory.createTeacher({
        name: '测试教师',
        email: 'teacher@test.com'
      });
      
      testClass = await testDataFactory.createClass({
        name: '测试班级',
        teacherId: testTeacher.id
      });
      
      testStudent = await testDataFactory.createStudent({
        name: '测试学生',
        classId: testClass.id
      });
    });

    describe('GET /api/students', () => {
      it('should return student list with proper structure', async () => {
        const response = await request(app)
          .get('/api/students')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('students');
        expect(Array.isArray(response.body.data.students)).toBe(true);
        
        if (response.body.data.students.length > 0) {
          const student = response.body.data.students[0];
          expect(student).toHaveProperty('id');
          expect(student).toHaveProperty('name');
          expect(student).toHaveProperty('classId');
        }
      });
    });

    describe('GET /api/teachers', () => {
      it('should return teacher list with class information', async () => {
        const response = await request(app)
          .get('/api/teachers')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('teachers');
        expect(Array.isArray(response.body.data.teachers)).toBe(true);
      });
    });

    describe('GET /api/classes', () => {
      it('should return class list with student count', async () => {
        const response = await request(app)
          .get('/api/classes')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('classes');
        expect(Array.isArray(response.body.data.classes)).toBe(true);
      });
    });
  });

  describe('🤖 AI功能APIs', () => {
    describe('GET /api/ai/health', () => {
      it('should return AI service health status', async () => {
        const response = await request(app)
          .get('/api/ai/health')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('status');
        expect(response.body.data).toHaveProperty('timestamp');
      });
    });

    describe('GET /api/ai/models', () => {
      it('should return available AI models', async () => {
        const response = await request(app)
          .get('/api/ai/models')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('models');
        expect(Array.isArray(response.body.data.models)).toBe(true);
      });
    });

    describe('POST /api/ai/conversations', () => {
      it('should create new AI conversation', async () => {
        const conversationData = {
          title: '测试对话',
          context: {
            userRole: 'admin',
            permissions: ['*']
          }
        };

        const response = await request(app)
          .post('/api/ai/conversations')
          .set('Authorization', `Bearer ${authToken}`)
          .send(conversationData)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('title', conversationData.title);
      });
    });
  });

  describe('📊 Dashboard APIs', () => {
    describe('GET /api/dashboard/stats', () => {
      it('should return dashboard statistics', async () => {
        const response = await request(app)
          .get('/api/dashboard/stats')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('totalStudents');
        expect(response.body.data).toHaveProperty('totalTeachers');
        expect(response.body.data).toHaveProperty('totalClasses');
        expect(response.body.data).toHaveProperty('totalActivities');
      });
    });
  });

  describe('🔒 Permission & Security Tests', () => {
    let limitedUser: any;
    let limitedToken: string;

    beforeAll(async () => {
      // 创建权限受限的用户
      limitedUser = await createTestUser({
        username: 'limited-user',
        email: 'limited@example.com',
        role: 'teacher',
        permissions: ['students:read', 'classes:read']
      });
      limitedToken = await createTestToken(limitedUser.id);
    });

    it('should allow access to permitted resources', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${limitedToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should deny access to forbidden resources', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${limitedToken}`)
        .send({
          username: 'unauthorized-create',
          email: 'test@example.com',
          password: 'password'
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('权限不足');
    });
  });

  describe('📝 Enrollment Management APIs', () => {
    let testEnrollmentPlan: any;

    beforeAll(async () => {
      testEnrollmentPlan = await testDataFactory.createEnrollmentPlan({
        title: '2024年春季招生计划',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        totalQuota: 100
      });
    });

    describe('GET /api/enrollment-plans', () => {
      it('should return enrollment plans list', async () => {
        const response = await request(app)
          .get('/api/enrollment-plans')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('plans');
        expect(Array.isArray(response.body.data.plans)).toBe(true);
      });
    });

    describe('POST /api/enrollment-applications', () => {
      it('should create enrollment application', async () => {
        const applicationData = {
          planId: testEnrollmentPlan.id,
          studentName: '申请学生',
          parentName: '学生家长',
          parentPhone: '13800138000',
          parentEmail: 'parent@test.com'
        };

        const response = await request(app)
          .post('/api/enrollment-applications')
          .set('Authorization', `Bearer ${authToken}`)
          .send(applicationData)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('studentName', applicationData.studentName);
      });
    });
  });

  describe('🎯 Activity Management APIs', () => {
    let testActivity: any;
    let testStudent: any;

    beforeAll(async () => {
      testActivity = await testDataFactory.createActivity({
        title: '测试活动API',
        description: '用于API测试的活动',
        activityType: '户外活动',
        capacity: 30
      });

      // 创建测试学生用于活动报名
      testStudent = await testDataFactory.createStudent({
        name: '测试学生API',
        gender: '男'
      });
    });

    describe('GET /api/activities', () => {
      it('should return activities with registration info', async () => {
        const response = await request(app)
          .get('/api/activities')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('activities');

        if (response.body.data.activities.length > 0) {
          const activity = response.body.data.activities[0];
          expect(activity).toHaveProperty('id');
          expect(activity).toHaveProperty('title');
          expect(activity).toHaveProperty('capacity');
          expect(activity).toHaveProperty('currentRegistrations');
        }
      });
    });

    describe('POST /api/activity-registrations', () => {
      it('should register student for activity', async () => {
        const registrationData = {
          activityId: testActivity.id,
          studentId: testStudent.id,
          notes: '测试报名'
        };

        const response = await request(app)
          .post('/api/activity-registrations')
          .set('Authorization', `Bearer ${authToken}`)
          .send(registrationData)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('activityId', testActivity.id);
        expect(response.body.data).toHaveProperty('studentId', testStudent.id);
      });

      it('should prevent duplicate registrations', async () => {
        const registrationData = {
          activityId: testActivity.id,
          studentId: testStudent.id
        };

        const response = await request(app)
          .post('/api/activity-registrations')
          .set('Authorization', `Bearer ${authToken}`)
          .send(registrationData)
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toContain('已报名');
      });
    });
  });

  describe('⚡ Performance & Load Tests', () => {
    it('should handle concurrent requests efficiently', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .get('/api/dashboard/stats')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
      });
    });

    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(2000); // 2秒内响应
    });

    it('should handle large dataset queries efficiently', async () => {
      // 创建大量测试数据
      await testDataFactory.createStudentsBatch(50);

      const startTime = Date.now();

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 100 })
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(3000); // 3秒内响应
      expect(response.body.data.students.length).toBeGreaterThan(0);
    });
  });

  describe('🔍 Data Validation & Error Handling', () => {
    describe('Input Validation', () => {
      it('should validate email format', async () => {
        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            username: 'test-validation',
            email: 'invalid-email',
            password: 'password'
          })
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toContain('邮箱格式');
      });

      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/students')
          .set('Authorization', `Bearer ${authToken}`)
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toContain('姓名不能为空');
      });

      it('should validate data types', async () => {
        const response = await request(app)
          .post('/api/classes')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: '测试班级',
            teacherId: 'invalid-id', // 应该是数字
            capacity: 'invalid-capacity' // 应该是数字
          })
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toContain('数据类型错误');
      });
    });

    describe('Error Handling', () => {
      it('should handle database connection errors gracefully', async () => {
        // 模拟数据库连接错误的情况
        // 这里需要根据实际的错误处理机制来测试
      });

      it('should return proper error format', async () => {
        const response = await request(app)
          .get('/api/nonexistent-endpoint')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('timestamp');
      });
    });
  });
});
