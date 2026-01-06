/**
 * 活动管理API集成测试
 * 
 * 测试覆盖：
 * - 活动信息管理接口
 * - 活动状态管理
 * - 活动统计信息
 * - 活动报名管理
 */

import request from 'supertest';
import { vi } from 'vitest'
import { app } from '../../src/app';
import { setupTestDatabase, cleanupTestDatabase } from '../setup/database';
import { createTestUser, createTestToken, createUserWithPermissions } from '../setup/auth';
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

describe('Activity Management API Integration Tests', () => {
  let adminUser: any;
  let adminToken: string;
  let teacherUser: any;
  let teacherToken: string;
  let parentUser: any;
  let parentToken: string;
  let testDataFactory: TestDataFactory;
  let testActivity: any;
  let testKindergarten: any;

  // 在所有测试之前执行
  beforeAll(async () => {
    // 设置测试数据库
    await setupTestDatabase();
    testDataFactory = new TestDataFactory();

    // 创建测试用户
    const admin = await createUserWithPermissions('test-admin', ['*']);
    adminUser = admin.user;
    adminToken = admin.token;

    const teacher = await createUserWithPermissions('test-teacher', [
      'activities:read',
      'activities:write',
      'students:read'
    ]);
    teacherUser = teacher.user;
    teacherToken = teacher.token;

    const parent = await createUserWithPermissions('test-parent', [
      'activities:read',
      'activities:register'
    ]);
    parentUser = parent.user;
    parentToken = parent.token;

    // 创建测试数据
    testKindergarten = await testDataFactory.createKindergarten({
      name: '测试幼儿园',
      address: '测试地址',
      phone: '13800138000'
    });

    testActivity = await testDataFactory.createActivity({
      title: '测试活动',
      teacherId: testTeacher.id,
      activityType: '开放日', // 开放日
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 明天
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // 明天1小时后
      location: '测试地点',
      capacity: 30,
      registrationStartTime: new Date(Date.now() - 60 * 60 * 1000), // 1小时前
      registrationEndTime: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12小时后
    });
  });

  // 在所有测试之后执行
  afterAll(async () => {
    // 清理测试数据库
    await cleanupTestDatabase();
  });

  describe('POST /api/activities - 创建活动', () => {
    it('管理员应该成功创建新活动', async () => {
      const activityData = {
        title: '新测试活动',
        teacherId: testTeacher.id,
        activityType: 3, // 亲子活动
        startTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 后天
        endTime: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString(), // 后天1小时后
        location: '新测试地点',
        capacity: 25,
        registrationStartTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1小时后
        registrationEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后
        description: '新创建的测试活动',
        fee: 50.00
      };

      const response = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(activityData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '创建活动成功');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('title', activityData.title);
      expect(response.body.data).toHaveProperty('kindergartenId', activityData.kindergartenId);
      expect(response.body.data).toHaveProperty('activityType', activityData.activityType);
      expect(response.body.data).toHaveProperty('location', activityData.location);
      expect(response.body.data).toHaveProperty('capacity', activityData.capacity);
      expect(response.body.data).toHaveProperty('description', activityData.description);
      expect(response.body.data).toHaveProperty('fee', activityData.fee);
      expect(response.body.data).toHaveProperty('status', 0); // 默认状态为计划中
    });

    it('应该拒绝非管理员用户创建活动', async () => {
      const activityData = {
        title: '未授权活动',
        teacherId: testTeacher.id,
        activityType: "开放日",
        startTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString(),
        location: '未授权地点',
        capacity: 20
      };

      const response = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(activityData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('应该验证必填字段', async () => {
      const invalidData = {
        // 缺少必填字段 title, kindergartenId, activityType, startTime, endTime, location, capacity
        description: '缺少必填字段的活动'
      };

      const response = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/activities - 获取活动列表', () => {
    it('管理员应该成功获取活动列表', async () => {
      const response = await request(app)
        .get('/api/activities')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('pageSize');
      expect(response.body.data).toHaveProperty('items');
      expect(Array.isArray(response.body.data.items)).toBe(true);
    });

    it('应该支持分页参数', async () => {
      const response = await request(app)
        .get('/api/activities')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, pageSize: 5 })
        .expect(200);

      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('pageSize', 5);
    });

    it('应该支持按类型筛选', async () => {
      const response = await request(app)
        .get('/api/activities')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ activityType: 1 }) // 开放日
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      // 验证返回的活动都是指定类型
      if (response.body.data.items.length > 0) {
        response.body.data.items.forEach((item: any) => {
          expect(item.activityType).toBe(1);
        });
      }
    });

    it('教师用户应该可以访问活动列表', async () => {
      const response = await request(app)
        .get('/api/activities')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('家长用户应该可以访问活动列表', async () => {
      const response = await request(app)
        .get('/api/activities')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/activities/:id - 获取活动详情', () => {
    it('管理员应该成功获取指定活动详情', async () => {
      const response = await request(app)
        .get(`/api/activities/${testActivity.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', testActivity.id);
      expect(response.body.data).toHaveProperty('title', testActivity.title);
      expect(response.body.data).toHaveProperty('kindergartenId', testActivity.kindergartenId);
      expect(response.body.data).toHaveProperty('activityType', testActivity.activityType);
      expect(response.body.data).toHaveProperty('location', testActivity.location);
      expect(response.body.data).toHaveProperty('capacity', testActivity.capacity);
    });

    it('应该处理不存在的活动', async () => {
      const response = await request(app)
        .get('/api/activities/99999') // 不存在的ID
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('活动不存在');
    });

    it('教师用户应该可以访问活动详情', async () => {
      const response = await request(app)
        .get(`/api/activities/${testActivity.id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('家长用户应该可以访问活动详情', async () => {
      const response = await request(app)
        .get(`/api/activities/${testActivity.id}`)
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('PUT /api/activities/:id - 更新活动信息', () => {
    it('管理员应该成功更新活动信息', async () => {
      const updateData = {
        title: '更新的测试活动',
        description: '更新的活动描述',
        capacity: 35
      };

      const response = await request(app)
        .put(`/api/activities/${testActivity.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '更新活动成功');
      expect(response.body.data).toHaveProperty('id', testActivity.id);
      expect(response.body.data).toHaveProperty('title', updateData.title);
      expect(response.body.data).toHaveProperty('description', updateData.description);
      expect(response.body.data).toHaveProperty('capacity', updateData.capacity);
    });

    it('应该拒绝非管理员用户更新活动信息', async () => {
      const updateData = {
        title: '非法更新'
      };

      const response = await request(app)
        .put(`/api/activities/${testActivity.id}`)
        .set('Authorization', `Bearer ${parentToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该处理更新不存在的活动', async () => {
      const updateData = {
        title: '不存在的活动更新'
      };

      const response = await request(app)
        .put('/api/activities/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('活动不存在');
    });
  });

  describe('DELETE /api/activities/:id - 删除活动', () => {
    let activityToDelete: any;

    beforeAll(async () => {
      // 创建一个专门用于删除测试的活动
      activityToDelete = await testDataFactory.createActivity({
        title: '删除测试活动',
        teacherId: testTeacher.id,
        activityType: "开放日",
        startTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 73 * 60 * 60 * 1000),
        location: '删除测试地点',
        capacity: 20
      });
    });

    it('管理员应该成功删除活动', async () => {
      const response = await request(app)
        .delete(`/api/activities/${activityToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '删除活动成功');
    });

    it('应该拒绝非管理员用户删除活动', async () => {
      // 创建一个新活动用于测试
      const newActivity = await testDataFactory.createActivity({
        title: '删除测试活动2',
        teacherId: testTeacher.id,
        activityType: "开放日",
        startTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 73 * 60 * 60 * 1000),
        location: '删除测试地点2',
        capacity: 20
      });

      const response = await request(app)
        .delete(`/api/activities/${newActivity.id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该处理删除不存在的活动', async () => {
      const response = await request(app)
        .delete('/api/activities/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('活动不存在');
    });
  });

  describe('PUT /api/activities/:id/status - 更新活动状态', () => {
    it('管理员应该成功更新活动状态', async () => {
      const statusData = {
        status: 1 // 报名中
      };

      const response = await request(app)
        .put(`/api/activities/${testActivity.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '更新活动状态成功');
      expect(response.body.data).toHaveProperty('id', testActivity.id);
      expect(response.body.data).toHaveProperty('status', 1);
    });

    it('应该拒绝非管理员用户更新活动状态', async () => {
      const statusData = {
        status: 3 // 进行中
      };

      const response = await request(app)
        .put(`/api/activities/${testActivity.id}/status`)
        .set('Authorization', `Bearer ${parentToken}`)
        .send(statusData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该验证状态值', async () => {
      const statusData = {
        status: 99 // 无效的状态值
      };

      const response = await request(app)
        .put(`/api/activities/${testActivity.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('无效的活动状态');
    });

    it('应该处理更新不存在活动的状态', async () => {
      const statusData = {
        status: 1
      };

      const response = await request(app)
        .put('/api/activities/99999/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('活动不存在');
    });
  });

  describe('PUT /api/activities/:id/publish - 发布活动', () => {
    let activityToPublish: any;

    beforeAll(async () => {
      // 创建一个专门用于发布测试的活动
      activityToPublish = await testDataFactory.createActivity({
        title: '发布测试活动',
        teacherId: testTeacher.id,
        activityType: "开放日",
        startTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 73 * 60 * 60 * 1000),
        location: '发布测试地点',
        capacity: 20,
        registrationStartTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
        registrationEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    });

    it('管理员应该成功发布活动', async () => {
      const response = await request(app)
        .put(`/api/activities/${activityToPublish.id}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '发布活动成功');
      expect(response.body.data).toHaveProperty('id', activityToPublish.id);
      expect(response.body.data).toHaveProperty('status', 1); // 发布后状态应为报名中
    });

    it('应该拒绝非管理员用户发布活动', async () => {
      const response = await request(app)
        .put(`/api/activities/${activityToPublish.id}/publish`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该处理发布不存在的活动', async () => {
      const response = await request(app)
        .put('/api/activities/99999/publish')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('活动不存在');
    });
  });

  describe('GET /api/activities/statistics - 获取活动统计信息', () => {
    it('管理员应该成功获取活动统计信息', async () => {
      const response = await request(app)
        .get('/api/activities/statistics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '获取活动统计成功');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('active');
      expect(response.body.data).toHaveProperty('inactive');
      expect(response.body.data).toHaveProperty('totalParticipants');
      expect(response.body.data).toHaveProperty('averageParticipation');
      expect(response.body.data).toHaveProperty('popularActivityTypes');
      
      // 验证统计信息类型
      expect(typeof response.body.data.total).toBe('number');
      expect(typeof response.body.data.active).toBe('number');
      expect(typeof response.body.data.inactive).toBe('number');
      expect(Array.isArray(response.body.data.popularActivityTypes)).toBe(true);
    });

    it('非管理员用户应该被拒绝访问活动统计信息', async () => {
      const response = await request(app)
        .get('/api/activities/statistics')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/activities/:id/registrations - 获取活动报名列表', () => {
    it('管理员应该成功获取活动报名列表', async () => {
      const response = await request(app)
        .get(`/api/activities/${testActivity.id}/registrations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '获取活动报名列表成功');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('registrations');
      expect(Array.isArray(response.body.data.registrations)).toBe(true);
    });

    it('应该支持分页参数', async () => {
      const response = await request(app)
        .get(`/api/activities/${testActivity.id}/registrations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(response.body.data).toHaveProperty('registrations');
    });

    it('教师用户应该可以访问活动报名列表', async () => {
      const response = await request(app)
        .get(`/api/activities/${testActivity.id}/registrations`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('应该处理不存在活动的报名列表', async () => {
      const response = await request(app)
        .get('/api/activities/99999/registrations')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('活动不存在');
    });
  });

  describe('权限验证测试', () => {
    let readOnlyUser: any;
    let readOnlyToken: string;

    beforeAll(async () => {
      const readOnly = await createUserWithPermissions('test-readonly', [
        'activities:read'
      ]);
      readOnlyUser = readOnly.user;
      readOnlyToken = readOnly.token;
    });

    it('管理员应该有完全访问权限', async () => {
      const response = await request(app)
        .get('/api/activities')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('只读用户应该被拒绝写操作', async () => {
      const activityData = {
        title: '只读测试活动',
        teacherId: testTeacher.id,
        activityType: "开放日",
        startTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString(),
        location: '只读测试地点',
        capacity: 20
      };

      const response = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${readOnlyToken}`)
        .send(activityData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('只读用户应该可以执行读操作', async () => {
      const response = await request(app)
        .get(`/api/activities/${testActivity.id}`)
        .set('Authorization', `Bearer ${readOnlyToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('错误处理测试', () => {
    it('应该返回标准错误格式', async () => {
      const response = await request(app)
        .get('/api/nonexistent-activity-endpoint')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内响应活动列表请求', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/activities')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(5000); // 5秒内响应
    });

    it('应该处理并发活动请求', async () => {
      const requests = Array(5).fill(null).map(() =>
        request(app)
          .get('/api/activities')
          .set('Authorization', `Bearer ${adminToken}`)
      );

      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});