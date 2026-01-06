/**
 * 多用户并发场景测试
 * 验证系统在高并发多用户场景下的稳定性和数据一致性
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../../server/src/app';
import {
import { authApi } from '@/api/auth';

  RealEnvironmentManager,
  TestUtils
} from './real-env.config';

describe('Multi-User Concurrent Scenarios Tests', () => {
  let envManager: RealEnvironmentManager;
  let testEnv: any;
  let concurrentUsers: any[] = [];

  beforeAll(async () => {
    envManager = RealEnvironmentManager.getInstance();
    await envManager.initializeEnvironment();
    testEnv = envManager.getEnvironment();

    // 创建额外的并发测试用户
    await createConcurrentTestUsers();
  }, 60000);

  afterAll(async () => {
    await envManager.cleanupEnvironment();
  }, 30000);

  beforeEach(async () => {
    await TestUtils.wait(100);
  });

  afterEach(async () => {
    await TestUtils.wait(100);
  });

  /**
   * 创建并发测试用户
   */
  async function createConcurrentTestUsers(): Promise<void> {
    const userCount = 10;
    const userPromises = Array(userCount).fill().map(async (_, index) => {
      const userData = TestUtils.createRandomTestData(`concurrent_user_${index}`);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: userData.username,
          email: userData.email,
          password: 'TestPass123!',
          realName: userData.name,
          roleIds: index % 2 === 0 ? ['teacher'] : ['parent']
        });

      if (response.status === 201) {
        const loginResponse = await request(app)
          .post('/api/auth/unified-login')
          .send({
            username: userData.username,
            password: 'TestPass123!'
          });

        return {
          id: response.body.data.id,
          username: userData.username,
          role: index % 2 === 0 ? 'teacher' : 'parent',
          token: loginResponse.body.data.token
        };
      }
      return null;
    });

    const results = await Promise.all(userPromises);
    concurrentUsers = results.filter(user => user !== null);
  }

  describe('并发用户认证测试', () => {
    it('应该处理大量并发用户同时登录', async () => {
      const concurrentLogins = 20;
      const loginPromises = Array(concurrentLogins).fill().map(async () => {
        const user = concurrentUsers[Math.floor(Math.random() * concurrentUsers.length)];

        return request(app)
          .post('/api/auth/unified-login')
          .send({
            username: user.username,
            password: 'TestPass123!'
          })
          .then(response => ({
            userId: user.id,
            status: response.status,
            success: response.body.success,
            responseTime: Date.now()
          }));
      });

      const startTime = Date.now();
      const results = await Promise.all(loginPromises);
      const endTime = Date.now();

      // 验证所有登录都成功
      results.forEach(result => {
        expect(result.status).toBe(200);
        expect(result.success).toBe(true);
      });

      const totalResponseTime = endTime - startTime;
      const averageResponseTime = totalResponseTime / concurrentLogins;

      expect(averageResponseTime).toBeLessThan(2000); // 平均2秒内
      expect(totalResponseTime).toBeLessThan(10000); // 总时间10秒内

      console.log(`🚀 并发登录统计:`);
      console.log(`   - 并发数量: ${concurrentLogins}`);
      console.log(`   - 总耗时: ${totalResponseTime}ms`);
      console.log(`   - 平均响应时间: ${averageResponseTime.toFixed(2)}ms`);
      console.log(`   - 成功率: ${(results.filter(r => r.status === 200).length / results.length * 100).toFixed(1)}%`);
    });

    it('应该处理并发token刷新请求', async () => {
      const users = concurrentUsers.slice(0, 10);
      const refreshPromises = users.map(user =>
        request(app)
          .post('/api/auth/refresh')
          .set('Authorization', `Bearer ${user.token}`)
          .then(response => ({
            userId: user.id,
            status: response.status,
            hasNewToken: !!response.body.data?.token,
            tokenChanged: response.body.data?.token !== user.token
          }))
      );

      const results = await Promise.all(refreshPromises);

      results.forEach(result => {
        expect(result.status).toBe(200);
        expect(result.hasNewToken).toBe(true);
        expect(result.tokenChanged).toBe(true);
      });

      // 验证所有新token都不同
      const newTokens = results
        .filter(r => r.status === 200)
        .map(r => r.tokenChanged);

      const uniqueTokens = new Set(newTokens);
      expect(uniqueTokens.size).toBe(newTokens.length);
    });
  });

  describe('并发数据操作测试', () => {
    it('应该处理并发用户同时创建班级', async () => {
      const teachers = concurrentUsers.filter(u => u.role === 'teacher').slice(0, 5);

      const createClassPromises = teachers.map((teacher, index) =>
        request(app)
          .post('/api/classes')
          .set('Authorization', `Bearer ${teacher.token}`)
          .send({
            name: `并发测试班级_${teacher.id}_${index}`,
            capacity: 25,
            description: `并发创建的班级 ${index}`
          })
          .then(response => ({
            teacherId: teacher.id,
            status: response.status,
            classId: response.body.data?.id,
            className: response.body.data?.name
          }))
      );

      const results = await Promise.all(createClassPromises);

      // 验证所有班级创建都成功
      results.forEach(result => {
        expect(result.status).toBe(201);
        expect(result.classId).toBeDefined();
        expect(result.className).toContain('并发测试班级');
      });

      // 验证班级名称唯一性
      const classNames = results.map(r => r.className);
      const uniqueNames = new Set(classNames);
      expect(uniqueNames.size).toBe(classNames.length);

      // 验证每个教师都有对应的班级
      for (const result of results) {
        const teacherClasses = await request(app)
          .get('/api/classes/my-classes')
          .set('Authorization', `Bearer ${teachers.find(t => t.id === result.teacherId)?.token}`);

        expect(teacherClasses.status).toBe(200);
        const hasCreatedClass = teacherClasses.body.data.items.some(
          (cls: any) => cls.id === result.classId
        );
        expect(hasCreatedClass).toBe(true);
      }
    });

    it('应该正确处理并发学生分配到班级', async () => {
      // 获取一个班级用于测试
      const teacher = concurrentUsers.find(u => u.role === 'teacher');
      const classResponse = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${teacher.token}`)
        .send({
          name: '并发分配测试班级',
          capacity: 20
        });

      const classId = classResponse.body.data.id;

      // 并发添加学生到班级
      const studentsToAdd = testEnv.testStudents.slice(0, 10);
      const addStudentPromises = studentsToAdd.map((student: any, index) =>
        request(app)
          .post(`/api/classes/${classId}/students`)
          .set('Authorization', `Bearer ${teacher.token}`)
          .send({
            studentIds: [student.id]
          })
          .then(response => ({
            studentId: student.id,
            status: response.status,
            addedCount: response.body.data?.addedCount || 0
          }))
      );

      const results = await Promise.all(addStudentPromises);

      // 统计成功添加的学生
      const successfulAdds = results.filter(r => r.status === 200);
      const totalAdded = successfulAdds.reduce((sum, r) => sum + r.addedCount, 0);

      // 验证最终班级学生数量
      const finalClassResponse = await request(app)
        .get(`/api/classes/${classId}`)
        .set('Authorization', `Bearer ${teacher.token}`);

      expect(finalClassResponse.status).toBe(200);
      expect(finalClassResponse.body.data.studentCount).toBe(totalAdded);
      expect(finalClassResponse.body.data.studentCount).toBeLessThanOrEqual(20); // 不超过班级容量
    });

    it('应该处理并发活动报名', async () => {
      // 创建活动
      const teacher = concurrentUsers.find(u => u.role === 'teacher');
      const activityResponse = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${teacher.token}`)
        .send({
          title: '并发报名测试活动',
          type: 'educational',
          maxParticipants: 5,
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
        });

      const activityId = activityResponse.body.data.id;

      // 并发报名
      const parents = concurrentUsers.filter(u => u.role === 'parent').slice(0, 8);
      const registrationPromises = parents.map(parent =>
        request(app)
          .post('/api/activity-registrations')
          .set('Authorization', `Bearer ${parent.token}`)
          .send({
            activityId: activityId,
            studentId: testEnv.testStudents[0].id, // 使用同一个学生测试冲突
            parentConsent: true
          })
          .then(response => ({
            parentId: parent.id,
            status: response.status,
            message: response.body.message
          }))
      );

      const results = await Promise.all(registrationPromises);

      // 统计成功和失败的报名
      const successful = results.filter(r => r.status === 201);
      const conflicts = results.filter(r => r.status === 400 || r.status === 409);

      // 应该只有第一个成功，其他因为重复报名而失败
      expect(successful.length).toBe(1);
      expect(conflicts.length).toBeGreaterThan(0);

      // 验证最终报名人数
      const finalActivityResponse = await request(app)
        .get(`/api/activities/${activityId}`)
        .set('Authorization', `Bearer ${teacher.token}`);

      expect(finalActivityResponse.body.data.registrationCount).toBe(1);
    });
  });

  describe('并发读取操作测试', () => {
    it('应该处理大量并发仪表板请求', async () => {
      const concurrentRequests = 50;
      const requestPromises = Array(concurrentRequests).fill().map(() => {
        const user = concurrentUsers[Math.floor(Math.random() * concurrentUsers.length)];

        return request(app)
          .get('/api/dashboard')
          .set('Authorization', `Bearer ${user.token}`)
          .then(response => ({
            status: response.status,
            hasData: !!response.body.data,
            userId: user.id
          }));
      });

      const startTime = Date.now();
      const results = await Promise.all(requestPromises);
      const endTime = Date.now();

      // 验证所有请求都成功
      results.forEach(result => {
        expect(result.status).toBe(200);
        expect(result.hasData).toBe(true);
      });

      const totalTime = endTime - startTime;
      const averageTime = totalTime / concurrentRequests;

      expect(averageTime).toBeLessThan(1500); // 平均1.5秒内
      expect(totalTime).toBeLessThan(20000); // 总时间20秒内

      console.log(`📊 并发仪表板请求统计:`);
      console.log(`   - 并发数量: ${concurrentRequests}`);
      console.log(`   - 总耗时: ${totalTime}ms`);
      console.log(`   - 平均响应时间: ${averageTime.toFixed(2)}ms`);
    });

    it('应该处理并发用户列表查询', async () => {
      const concurrentQueries = 20;
      const queryPromises = Array(concurrentQueries).fill().map(() => {
        const user = concurrentUsers[Math.floor(Math.random() * concurrentUsers.length)];
        const pageNum = Math.floor(Math.random() * 3) + 1; // 1-3页
        const pageSize = [10, 20, 50][Math.floor(Math.random() * 3)]; // 随机页面大小

        return request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${user.token}`)
          .query({ page: pageNum, pageSize: pageSize })
          .then(response => ({
            status: response.status,
            hasItems: Array.isArray(response.body.data?.items),
            totalCount: response.body.data?.total || 0,
            currentPage: pageNum,
            pageSize: pageSize
          }));
      });

      const results = await Promise.all(queryPromises);

      results.forEach(result => {
        expect(result.status).toBe(200);
        expect(result.hasItems).toBe(true);
        expect(result.totalCount).toBeGreaterThanOrEqual(0);
      });

      // 验证数据一致性
      const totalCounts = results.map(r => r.totalCount);
      const uniqueCounts = new Set(totalCounts);
      expect(uniqueCounts.size).toBe(1); // 所有查询的总数应该一致
    });
  });

  describe('并发写入冲突测试', () => {
    it('应该正确处理并发班级修改', async () => {
      // 创建测试班级
      const teacher = concurrentUsers.find(u => u.role === 'teacher');
      const classResponse = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${teacher.token}`)
        .send({
          name: '并发修改测试班级',
          capacity: 25,
          description: '初始描述'
        });

      const classId = classResponse.body.data.id;

      // 并发修改班级信息
      const modifications = [
        { description: '并发修改描述1', capacity: 30 },
        { description: '并发修改描述2', capacity: 35 },
        { description: '并发修改描述3', capacity: 40 },
        { description: '并发修改描述4', capacity: 45 },
        { description: '并发修改描述5', capacity: 50 }
      ];

      const modifyPromises = modifications.map((modification, index) =>
        request(app)
          .put(`/api/classes/${classId}`)
          .set('Authorization', `Bearer ${teacher.token}`)
          .send(modification)
          .then(response => ({
            index: index,
            status: response.status,
            modification: modification
          }))
      );

      const results = await Promise.all(modifyPromises);

      // 统计成功和冲突的修改
      const successful = results.filter(r => r.status === 200);
      const conflicts = results.filter(r => r.status === 409);

      // 应该只有一个成功，其他返回冲突
      expect(successful.length).toBe(1);
      expect(conflicts.length).toBeGreaterThanOrEqual(1);

      // 验证最终数据状态
      const finalClassResponse = await request(app)
        .get(`/api/classes/${classId}`)
        .set('Authorization', `Bearer ${teacher.token}`);

      expect(finalClassResponse.status).toBe(200);
      const finalData = finalClassResponse.body.data;

      // 验证最终数据是某个并发修改的结果
      const isValidResult = modifications.some(mod =>
        mod.description === finalData.description &&
        mod.capacity === finalData.capacity
      );

      expect(isValidResult).toBe(true);
    });

    it('应该处理并发用户资料更新', async () => {
      // 选择一个用户进行并发更新测试
      const testUser = concurrentUsers[0];

      const updates = [
        { realName: '并发更新姓名1', phone: '13800138001' },
        { realName: '并发更新姓名2', phone: '13800138002' },
        { realName: '并发更新姓名3', phone: '13800138003' }
      ];

      const updatePromises = updates.map((update, index) =>
        request(app)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(update)
          .then(response => ({
            index: index,
            status: response.status,
            update: update,
            result: response.body.data
          }))
      );

      const results = await Promise.all(updatePromises);

      // 验证更新结果
      results.forEach(result => {
        expect([200, 409]).toContain(result.status);
      });

      // 获取最终用户信息
      const finalUserResponse = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(finalUserResponse.status).toBe(200);
      const finalUserData = finalUserResponse.body.data;

      // 验证最终数据是某个并发更新的结果
      const isValidFinalState = updates.some(update =>
        update.realName === finalUserData.realName &&
        update.phone === finalUserData.phone
      );

      expect(isValidFinalState).toBe(true);
    });
  });

  describe('混合并发操作测试', () => {
    it('应该处理读写混合的并发操作', async () => {
      const mixedOperations = [
        // 读操作
        { type: 'read', endpoint: '/api/dashboard' },
        { type: 'read', endpoint: '/api/users' },
        { type: 'read', endpoint: '/api/classes' },
        { type: 'read', endpoint: '/api/students' },
        // 写操作
        {
          type: 'write',
          endpoint: '/api/activities',
          data: {
            title: '混合并发测试活动',
            type: 'educational',
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
          }
        }
      ];

      const operationPromises = mixedOperations.map(async (operation, index) => {
        const user = concurrentUsers[index % concurrentUsers.length];

        if (operation.type === 'read') {
          return request(app)
            .get(operation.endpoint)
            .set('Authorization', `Bearer ${user.token}`)
            .then(response => ({
              type: 'read',
              index: index,
              status: response.status,
              endpoint: operation.endpoint
            }));
        } else {
          return request(app)
            .post(operation.endpoint)
            .set('Authorization', `Bearer ${user.token}`)
            .send(operation.data)
            .then(response => ({
              type: 'write',
              index: index,
              status: response.status,
              endpoint: operation.endpoint
            }));
        }
      });

      const startTime = Date.now();
      const results = await Promise.all(operationPromises);
      const endTime = Date.now();

      // 验证所有操作都成功
      results.forEach(result => {
        expect(result.status).toBe(200);
      });

      const totalTime = endTime - startTime;
      const averageTime = totalTime / mixedOperations.length;

      expect(averageTime).toBeLessThan(2000); // 平均2秒内

      // 统计读写操作
      const readOps = results.filter(r => r.type === 'read');
      const writeOps = results.filter(r => r.type === 'write');

      expect(readOps.length).toBe(4);
      expect(writeOps.length).toBe(1);

      console.log(`🔄 混合并发操作统计:`);
      console.log(`   - 读操作数量: ${readOps.length}`);
      console.log(`   - 写操作数量: ${writeOps.length}`);
      console.log(`   - 总耗时: ${totalTime}ms`);
      console.log(`   - 平均响应时间: ${averageTime.toFixed(2)}ms`);
    });

    it('应该在高负载下保持系统稳定性', async () => {
      const highLoadOperations = 100;
      const operationTypes = [
        { type: 'dashboard', weight: 40 },
        { type: 'users', weight: 20 },
        { type: 'classes', weight: 20 },
        { type: 'students', weight: 20 }
      ];

      // 根据权重生成操作
      const operations: string[] = [];
      operationTypes.forEach(op => {
        for (let i = 0; i < (highLoadOperations * op.weight / 100); i++) {
          operations.push(op.type);
        }
      });

      // 随机打乱操作顺序
      for (let i = operations.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [operations[i], operations[j]] = [operations[j], operations[i]];
      }

      const highLoadPromises = operations.map(operationType => {
        const user = concurrentUsers[Math.floor(Math.random() * concurrentUsers.length)];

        switch (operationType) {
          case 'dashboard':
            return request(app)
              .get('/api/dashboard')
              .set('Authorization', `Bearer ${user.token}`);
          case 'users':
            return request(app)
              .get('/api/users')
              .set('Authorization', `Bearer ${user.token}`)
              .query({ page: 1, pageSize: 20 });
          case 'classes':
            return request(app)
              .get('/api/classes')
              .set('Authorization', `Bearer ${user.token}`);
          case 'students':
            return request(app)
              .get('/api/students')
              .set('Authorization', `Bearer ${user.token}`)
              .query({ page: 1, pageSize: 20 });
          default:
            return request(app).get('/api/dashboard');
        }
      });

      const startTime = Date.now();
      const results = await Promise.all(highLoadPromises);
      const endTime = Date.now();

      // 统计结果
      const successful = results.filter(r => r.status === 200);
      const failed = results.filter(r => r.status >= 400);
      const timeOuts = results.filter(r => r.status === 0);

      const successRate = (successful.length / results.length) * 100;
      const totalTime = endTime - startTime;

      expect(successRate).toBeGreaterThan(95); // 成功率应该高于95%
      expect(timeOuts.length).toBe(0); // 不应该有超时
      expect(totalTime).toBeLessThan(30000); // 总时间应该在30秒内

      console.log(`🔥 高负载测试统计:`);
      console.log(`   - 总操作数: ${results.length}`);
      console.log(`   - 成功操作: ${successful.length}`);
      console.log(`   - 失败操作: ${failed.length}`);
      console.log(`   - 成功率: ${successRate.toFixed(1)}%`);
      console.log(`   - 总耗时: ${totalTime}ms`);
      console.log(`   - 平均响应时间: ${(totalTime / results.length).toFixed(2)}ms`);
    });
  });

  describe('资源竞争测试', () => {
    it('应该正确处理有限资源的并发访问', async () => {
      // 创建容量为3的活动
      const teacher = concurrentUsers.find(u => u.role === 'teacher');
      const activityResponse = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${teacher.token}`)
        .send({
          title: '资源竞争测试活动',
          type: 'educational',
          maxParticipants: 3,
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
        });

      const activityId = activityResponse.body.data.id;

      // 使用不同的学生并发报名
      const parents = concurrentUsers.filter(u => u.role === 'parent').slice(0, 8);
      const registrationPromises = parents.map((parent, index) =>
        request(app)
          .post('/api/activity-registrations')
          .set('Authorization', `Bearer ${parent.token}`)
          .send({
            activityId: activityId,
            studentId: testEnv.testStudents[index]?.id,
            parentConsent: true
          })
          .then(response => ({
            parentId: parent.id,
            studentId: testEnv.testStudents[index]?.id,
            status: response.status,
            message: response.body.message
          }))
      );

      const results = await Promise.all(registrationPromises);

      // 统计成功和失败的报名
      const successful = results.filter(r => r.status === 201);
      const failed = results.filter(r => r.status === 400);

      // 应该只有3个成功报名（等于活动容量）
      expect(successful.length).toBe(3);
      expect(failed.length).toBe(5);

      // 验证失败的原因都是容量限制
      failed.forEach(result => {
        expect(result.message).toContain('已达最大参与人数');
      });

      // 验证最终报名人数
      const finalActivityResponse = await request(app)
        .get(`/api/activities/${activityId}`)
        .set('Authorization', `Bearer ${teacher.token}`);

      expect(finalActivityResponse.body.data.registrationCount).toBe(3);
      expect(finalActivityResponse.body.data.maxParticipants).toBe(3);
    });
  });
});