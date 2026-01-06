/**
 * 真实后端API集成测试
 * 验证前后端API集成的完整性和真实性
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../../server/src/app';
import {
import { authApi } from '@/api/auth';

  RealEnvironmentManager,
  TestUtils,
  TestEnvironment
} from './real-env.config';

describe('Real Backend API Integration Tests', () => {
  let envManager: RealEnvironmentManager;
  let testEnv: TestEnvironment;

  beforeAll(async () => {
    envManager = RealEnvironmentManager.getInstance();
    await envManager.initializeEnvironment();
    testEnv = envManager.getEnvironment();

    // 等待服务完全就绪
    const isReady = await envManager.waitForServiceReady();
    expect(isReady).toBe(true);
  }, 60000);

  afterAll(async () => {
    await envManager.cleanupEnvironment();
  }, 30000);

  beforeEach(async () => {
    // 确保每个测试开始前环境是干净的
    await TestUtils.wait(100);
  });

  afterEach(async () => {
    // 清理测试过程中可能产生的临时数据
    await TestUtils.wait(100);
  });

  describe('用户认证API真实性验证', () => {
    it('应该完成真实的用户注册流程', async () => {
      const userData = TestUtils.createRandomTestData('real_register');
      const password = 'TestPass123!';

      // 1. 注册用户
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: userData.username,
          email: userData.email,
          password: password,
          realName: userData.name,
          phone: userData.phone
        });

      // 验证注册响应
      expect(registerResponse.status).toBe(201);
      TestUtils.validateApiResponse(registerResponse.body);
      expect(registerResponse.body.data.username).toBe(userData.username);
      expect(registerResponse.body.data.email).toBe(userData.email);

      // 2. 验证用户数据已保存到数据库
      const userResponse = await request(app)
        .get(`/api/users?search=${userData.username}`)
        .set('Authorization', `Bearer ${testEnv.13800138000Token}`);

      expect(userResponse.status).toBe(200);
      expect(userResponse.body.data.items).toHaveLength(1);
      expect(userResponse.body.data.items[0].username).toBe(userData.username);

      // 3. 测试登录流程
      const loginResponse = await request(app)
        .post('/api/auth/unified-login')
        .send({
          username: userData.username,
          password: password
        });

      expect(loginResponse.status).toBe(200);
      TestUtils.validateApiResponse(loginResponse.body);
      expect(loginResponse.body.data.token).toBeDefined();
      expect(loginResponse.body.data.user.username).toBe(userData.username);

      // 4. 验证JWT token有效性
      const token = loginResponse.body.data.token;
      const decodedToken = envManager.validateToken(token);
      expect(decodedToken.userId).toBe(registerResponse.body.data.id);
    });

    it('应该拒绝无效的用户注册数据', async () => {
      const invalidUserCases = [
        {
          // 缺少必填字段
          data: { username: 'incomplete' },
          expectedError: '缺少必填字段'
        },
        {
          // 密码太简单
          data: {
            username: 'weak_pass',
            email: 'weak@test.com',
            password: '123',
            realName: '密码太简单'
          },
          expectedError: '密码强度不足'
        },
        {
          // 邮箱格式无效
          data: {
            username: 'invalid_email',
            email: 'invalid-email',
            password: 'ValidPass123!',
            realName: '邮箱格式错误'
          },
          expectedError: '邮箱格式无效'
        }
      ];

      for (const testCase of invalidUserCases) {
        const response = await request(app)
          .post('/api/auth/register')
          .send(testCase.data);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain(testCase.expectedError);
      }
    });

    it('应该正确处理token过期和刷新', async () => {
      // 1. 创建测试用户
      const userData = TestUtils.createRandomTestData('token_test');
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: userData.username,
          email: userData.email,
          password: 'TestPass123!',
          realName: userData.name
        });

      expect(registerResponse.status).toBe(201);
      const userId = registerResponse.body.data.id;

      // 2. 获取初始token
      const loginResponse = await request(app)
        .post('/api/auth/unified-login')
        .send({
          username: userData.username,
          password: 'TestPass123!'
        });

      const initialToken = loginResponse.body.data.token;

      // 3. 使用token访问受保护的资源
      const profileResponse = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${initialToken}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.data.id).toBe(userId);

      // 4. 测试token刷新
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${initialToken}`);

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body.data.token).toBeDefined();
      expect(refreshResponse.body.data.token).not.toBe(initialToken);

      // 5. 验证新token有效
      const newProfileResponse = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${refreshResponse.body.data.token}`);

      expect(newProfileResponse.status).toBe(200);
      expect(newProfileResponse.body.data.id).toBe(userId);
    });
  });

  describe('用户管理API真实性验证', () => {
    it('应该完成完整的用户管理工作流', async () => {
      // 1. 创建新用户
      const newUser = TestUtils.createRandomTestData('workflow_user');
      const createResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${testEnv.13800138000Token}`)
        .send({
          username: newUser.username,
          email: newUser.email,
          password: 'TestPass123!',
          realName: newUser.name,
          roleIds: ['teacher']
        });

      expect(createResponse.status).toBe(201);
      TestUtils.validateApiResponse(createResponse.body);
      const userId = createResponse.body.data.id;

      // 2. 获取用户列表，验证用户存在
      const listResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${testEnv.13800138000Token}`)
        .query({ page: 1, pageSize: 50 });

      expect(listResponse.status).toBe(200);
      const createdUser = listResponse.body.data.items.find(
        (u: any) => u.id === userId
      );
      expect(createdUser).toBeDefined();
      expect(createdUser.username).toBe(newUser.username);

      // 3. 获取用户详情
      const detailResponse = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${testEnv.13800138000Token}`);

      expect(detailResponse.status).toBe(200);
      expect(detailResponse.body.data.username).toBe(newUser.username);
      expect(detailResponse.body.data.email).toBe(newUser.email);

      // 4. 更新用户信息
      const updateData = {
        realName: '更新后的用户名称',
        phone: '13800138000',
        address: '更新后的地址'
      };

      const updateResponse = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${testEnv.13800138000Token}`)
        .send(updateData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.realName).toBe(updateData.realName);
      expect(updateResponse.body.data.phone).toBe(updateData.phone);
      expect(updateResponse.body.data.address).toBe(updateData.address);

      // 5. 验证用户角色分配
      const rolesResponse = await request(app)
        .get(`/api/users/${userId}/roles`)
        .set('Authorization', `Bearer ${testEnv.13800138000Token}`);

      expect(rolesResponse.status).toBe(200);
      expect(rolesResponse.body.data.items).toContainEqual(
        expect.objectContaining({ name: 'teacher' })
      );

      // 6. 删除用户
      const deleteResponse = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${testEnv.13800138000Token}`);

      expect(deleteResponse.status).toBe(200);

      // 7. 验证用户已被删除
      const verifyResponse = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${testEnv.13800138000Token}`);

      expect(verifyResponse.status).toBe(404);
    });

    it('应该正确处理用户权限验证', async () => {
      // 1. 获取普通教师token
      const teacher = testEnv.testUsers.find(u => u.role === 'teacher');
      expect(teacher).toBeDefined();

      const teacherToken = await envManager.getUserToken(teacher!.id);

      // 2. 尝试访问管理员功能（应该失败）
      const 13800138000OnlyResponse = await request(app)
        .get('/api/system/settings')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(13800138000OnlyResponse.status).toBe(403);
      expect(13800138000OnlyResponse.body.success).toBe(false);
      expect(13800138000OnlyResponse.body.message).toContain('权限不足');

      // 3. 访问教师允许的功能（应该成功）
      const allowedResponse = await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(allowedResponse.status).toBe(200);

      // 4. 测试无token访问受保护资源
      const noTokenResponse = await request(app)
        .get('/api/users/profile');

      expect(noTokenResponse.status).toBe(401);
      expect(noTokenResponse.body.success).toBe(false);

      // 5. 测试无效token
      const invalidTokenResponse = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(invalidTokenResponse.status).toBe(401);
      expect(invalidTokenResponse.body.success).toBe(false);
    });
  });

  describe('班级管理API真实性验证', () => {
    it('应该完成完整的班级管理工作流', async () => {
      // 1. 获取教师token
      const teacher = testEnv.testUsers.find(u => u.role === 'teacher');
      expect(teacher).toBeDefined();

      const teacherToken = await envManager.getUserToken(teacher!.id);

      // 2. 创建新班级
      const classData = {
        name: '真实测试班级',
        description: '这是一个真实的测试班级',
        capacity: 25,
        ageGroup: '4-5岁',
        schedule: '周一至周五 8:00-16:00'
      };

      const createResponse = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(classData);

      expect(createResponse.status).toBe(201);
      TestUtils.validateApiResponse(createResponse.body);
      const classId = createResponse.body.data.id;

      // 3. 验证班级创建成功
      expect(createResponse.body.data.name).toBe(classData.name);
      expect(createResponse.body.data.teacherId).toBe(teacher!.id);

      // 4. 获取班级详情
      const detailResponse = await request(app)
        .get(`/api/classes/${classId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(detailResponse.status).toBe(200);
      expect(detailResponse.body.data.name).toBe(classData.name);
      expect(detailResponse.body.data.studentCount).toBe(0);

      // 5. 添加学生到班级
      const availableStudents = testEnv.students.slice(0, 3);
      const addStudentsResponse = await request(app)
        .post(`/api/classes/${classId}/students`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentIds: availableStudents.map(s => s.id)
        });

      expect(addStudentsResponse.status).toBe(200);
      expect(addStudentsResponse.data.addedCount).toBe(3);

      // 6. 验证班级学生数量更新
      const updatedDetailResponse = await request(app)
        .get(`/api/classes/${classId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(updatedDetailResponse.status).toBe(200);
      expect(updatedDetailResponse.body.data.studentCount).toBe(3);

      // 7. 获取班级学生列表
      const studentsResponse = await request(app)
        .get(`/api/classes/${classId}/students`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(studentsResponse.status).toBe(200);
      expect(studentsResponse.body.data.items).toHaveLength(3);

      // 8. 从班级移除学生
      const removeResponse = await request(app)
        .delete(`/api/classes/${classId}/students`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentIds: [availableStudents[0].id]
        });

      expect(removeResponse.status).toBe(200);

      // 9. 更新班级信息
      const updateData = {
        description: '更新后的班级描述',
        capacity: 30
      };

      const updateResponse = await request(app)
        .put(`/api/classes/${classId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(updateData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.description).toBe(updateData.description);
      expect(updateResponse.body.data.capacity).toBe(updateData.capacity);

      // 10. 删除班级
      const deleteResponse = await request(app)
        .delete(`/api/classes/${classId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(deleteResponse.status).toBe(200);
    });

    it('应该验证班级数据的完整性', async () => {
      // 1. 测试班级容量限制
      const teacher = testEnv.testUsers.find(u => u.role === 'teacher');
      const teacherToken = await envManager.getUserToken(teacher!.id);

      // 创建容量为2的小班级
      const smallClassResponse = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          name: '容量测试班级',
          capacity: 2
        });

      const classId = smallClassResponse.body.data.id;

      // 尝试添加超过容量的学生
      const overCapacityResponse = await request(app)
        .post(`/api/classes/${classId}/students`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentIds: testEnv.students.map(s => s.id)
        });

      // 应该有错误提示或只添加部分学生
      expect([200, 400]).toContain(overCapacityResponse.status);

      // 2. 测试重复学生添加
      const studentId = testEnv.students[0].id;

      await request(app)
        .post(`/api/classes/${classId}/students`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ studentIds: [studentId] });

      const duplicateResponse = await request(app)
        .post(`/api/classes/${classId}/students`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ studentIds: [studentId] });

      expect(duplicateResponse.status).toBe(400);
      expect(duplicateResponse.body.message).toContain('已在班级中');
    });
  });

  describe('学生管理API真实性验证', () => {
    it('应该完成完整的学生管理工作流', async () => {
      // 1. 创建新学生
      const parent = testEnv.testUsers.find(u => u.role === 'parent');
      const parentToken = await envManager.getUserToken(parent!.id);

      const studentData = {
        name: '真实测试学生',
        age: 4,
        gender: 'male',
        birthDate: '2020-01-01',
        address: '测试地址',
        emergencyContact: '紧急联系人',
        emergencyPhone: '13800138000',
        allergies: '花生过敏',
        medicalNotes: '无特殊病史'
      };

      const createResponse = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${parentToken}`)
        .send(studentData);

      expect(createResponse.status).toBe(201);
      TestUtils.validateApiResponse(createResponse.body);
      const studentId = createResponse.body.data.id;

      // 2. 验证学生数据完整性
      expect(createResponse.body.data.name).toBe(studentData.name);
      expect(createResponse.body.data.age).toBe(studentData.age);
      expect(createResponse.body.data.allergies).toBe(studentData.allergies);
      expect(createResponse.body.data.parentId).toBe(parent!.id);

      // 3. 获取学生详情
      const detailResponse = await request(app)
        .get(`/api/students/${studentId}`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(detailResponse.status).toBe(200);
      expect(detailResponse.body.data.name).toBe(studentData.name);

      // 4. 更新学生信息
      const updateData = {
        address: '更新后的地址',
        emergencyContact: '更新后的紧急联系人'
      };

      const updateResponse = await request(app)
        .put(`/api/students/${studentId}`)
        .set('Authorization', `Bearer ${parentToken}`)
        .send(updateData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.address).toBe(updateData.address);
      expect(updateResponse.body.data.emergencyContact).toBe(updateData.emergencyContact);

      // 5. 上传学生照片
      const photoData = {
        filename: 'student-photo.jpg',
        url: 'https://example.com/photos/student-photo.jpg'
      };

      const photoResponse = await request(app)
        .post(`/api/students/${studentId}/photo`)
        .set('Authorization', `Bearer ${parentToken}`)
        .send(photoData);

      expect(photoResponse.status).toBe(200);
      expect(photoResponse.body.data.photoUrl).toBe(photoData.url);

      // 6. 记录学生成长记录
      const growthRecord = {
        type: 'height',
        value: 105.5,
        unit: 'cm',
        date: new Date().toISOString(),
        notes: '身高正常增长'
      };

      const growthResponse = await request(app)
        .post(`/api/students/${studentId}/growth-records`)
        .set('Authorization', `Bearer ${parentToken}`)
        .send(growthRecord);

      expect(growthResponse.status).toBe(201);
      expect(growthResponse.body.data.value).toBe(growthRecord.value);

      // 7. 获取学生成长记录列表
      const recordsResponse = await request(app)
        .get(`/api/students/${studentId}/growth-records`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(recordsResponse.status).toBe(200);
      expect(recordsResponse.body.data.items).toContainEqual(
        expect.objectContaining({ value: growthRecord.value })
      );
    });
  });

  describe('API响应数据结构验证', () => {
    it('应该返回一致的API响应格式', async () => {
      // 测试不同API端点的响应格式一致性
      const endpoints = [
        { method: 'GET', path: '/api/users', token: testEnv.13800138000Token },
        { method: 'GET', path: '/api/classes', token: testEnv.13800138000Token },
        { method: 'GET', path: '/api/students', token: testEnv.13800138000Token }
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          [endpoint.method.toLowerCase()](endpoint.path)
          .set('Authorization', `Bearer ${endpoint.token}`);

        expect(response.status).toBe(200);

        // 验证基本响应结构
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message');

        // 验证分页数据结构
        if (response.body.data && typeof response.body.data === 'object') {
          if (response.body.data.items) {
            expect(response.body.data).toHaveProperty('items');
            expect(response.body.data).toHaveProperty('total');
            expect(response.body.data).toHaveProperty('page');
            expect(response.body.data).toHaveProperty('pageSize');
            expect(Array.isArray(response.body.data.items)).toBe(true);
          }
        }

        // 验证成功响应
        expect(response.body.success).toBe(true);
      }
    });

    it('应该正确处理错误响应', async () => {
      // 测试各种错误场景的响应格式
      const errorCases = [
        {
          name: '不存在的资源',
          request: () => request(app)
            .get('/api/users/999999')
            .set('Authorization', `Bearer ${testEnv.13800138000Token}`),
          expectedStatus: 404,
          expectedMessage: '用户不存在'
        },
        {
          name: '权限不足',
          request: () => request(app)
            .delete('/api/system/settings')
            .set('Authorization', `Bearer ${testEnv.testUsers[0].token || ''}`),
          expectedStatus: 403,
          expectedMessage: '权限不足'
        },
        {
          name: '无效请求参数',
          request: () => request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${testEnv.13800138000Token}`)
            .send({ invalid: 'data' }),
          expectedStatus: 400,
          expectedMessage: '缺少必填字段'
        }
      ];

      for (const errorCase of errorCases) {
        const response = await errorCase.request();

        expect(response.status).toBe(errorCase.expectedStatus);

        // 验证错误响应格式
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('message');
        expect(response.body.success).toBe(false);
        expect(typeof response.body.message).toBe('string');
        expect(response.body.message.length).toBeGreaterThan(0);
      }
    });
  });

  describe('API性能验证', () => {
    it('应该在合理时间内响应请求', async () => {
      const performanceTests = [
        { name: '用户列表', method: 'GET', path: '/api/users' },
        { name: '班级列表', method: 'GET', path: '/api/classes' },
        { name: '学生列表', method: 'GET', path: '/api/students' },
        { name: '仪表板数据', method: 'GET', path: '/api/dashboard' }
      ];

      for (const test of performanceTests) {
        const startTime = Date.now();

        const response = await request(app)
          [test.method.toLowerCase()](test.path)
          .set('Authorization', `Bearer ${testEnv.13800138000Token}`)
          .timeout(10000);

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(response.status).toBe(200);
        expect(responseTime).toBeLessThan(3000); // 3秒内响应

        console.log(`📊 ${test.name} 响应时间: ${responseTime}ms`);
      }
    });

    it('应该正确处理并发请求', async () => {
      const concurrentRequests = 20;
      const promises = Array(concurrentRequests).fill().map(() =>
        request(app)
          .get('/api/dashboard')
          .set('Authorization', `Bearer ${testEnv.13800138000Token}`)
      );

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const endTime = Date.now();

      // 验证所有请求都成功
      results.forEach((response, index) => {
        expect(response.status).toBe(200);
        TestUtils.validateApiResponse(response.body);
      });

      const totalTime = endTime - startTime;
      const averageTime = totalTime / concurrentRequests;

      // 验证平均响应时间
      expect(averageTime).toBeLessThan(2000); // 平均2秒内

      console.log(`🚀 并发请求统计:`);
      console.log(`   - 请求数量: ${concurrentRequests}`);
      console.log(`   - 总耗时: ${totalTime}ms`);
      console.log(`   - 平均响应时间: ${averageTime.toFixed(2)}ms`);
    });
  });
});