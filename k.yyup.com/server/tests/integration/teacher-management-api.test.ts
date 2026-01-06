/**
 * 教师管理API集成测试
 * 
 * 测试覆盖：
 * - 教师信息管理接口
 * - 教师班级分配
 * - 教师统计信息
 * - 教师状态管理
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

describe('Teacher Management API Integration Tests', () => {
  let adminUser: any;
  let adminToken: string;
  let teacherUser: any;
  let teacherToken: string;
  let parentUser: any;
  let parentToken: string;
  let testDataFactory: TestDataFactory;
  let testTeacher: any;
  let testUser: any;
  let testKindergarten: any;
  let testClass1: any;
  let testClass2: any;

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
      'teachers:read',
      'teachers:write',
      'classes:read',
      'students:read'
    ]);
    teacherUser = teacher.user;
    teacherToken = teacher.token;

    const parent = await createUserWithPermissions('test-parent', [
      'students:read:own',
      'activities:read',
      'classes:read:own'
    ]);
    parentUser = parent.user;
    parentToken = parent.token;

    // 创建测试数据
    testKindergarten = await testDataFactory.createKindergarten({
      name: '测试幼儿园',
      address: '测试地址',
      phone: '13800138000'
    });

    testUser = await testDataFactory.createUser({
      username: 'test-teacher-user',
      email: 'teacher@test.com',
      realName: '测试教师',
      phone: '13800138001'
    });

    testClass1 = await testDataFactory.createClass({
      name: '测试班级1',
      teacherId: testTeacher.id,
      capacity: 30
    });

    testClass2 = await testDataFactory.createClass({
      name: '测试班级2',
      teacherId: testTeacher.id,
      capacity: 30
    });
  });

  // 在所有测试之后执行
  afterAll(async () => {
    // 清理测试数据库
    await cleanupTestDatabase();
  });

  describe('POST /api/teachers - 创建教师', () => {
    it('管理员应该成功创建新教师', async () => {
      const teacherData = {
        userId: testUser.id,
        teacherId: testTeacher.id,
        teacherNo: 'T001',
        position: 5, // 普通教师
        status: 1, // 在职
        classIds: [testClass1.id, testClass2.id],
        remark: '测试教师备注'
      };

      const response = await request(app)
        .post('/api/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(teacherData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '创建教师成功');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('userId', teacherData.userId);
      expect(response.body.data).toHaveProperty('kindergartenId', teacherData.kindergartenId);
      expect(response.body.data).toHaveProperty('teacherNo', teacherData.teacherNo);
      expect(response.body.data).toHaveProperty('position', teacherData.position);
      expect(response.body.data).toHaveProperty('status', teacherData.status);
      expect(response.body.data).toHaveProperty('remark', teacherData.remark);
      expect(response.body.data.user).toHaveProperty('id', testUser.id);
      expect(response.body.data.user).toHaveProperty('username', testUser.username);
      expect(response.body.data.user).toHaveProperty('name', testUser.realName);
      expect(response.body.data.kindergarten).toHaveProperty('id', testKindergarten.id);
      expect(response.body.data.kindergarten).toHaveProperty('name', testKindergarten.name);
      expect(Array.isArray(response.body.data.classes)).toBe(true);
      expect(response.body.data.classes).toHaveLength(2);

      // 保存创建的教师用于后续测试
      testTeacher = response.body.data;
    });

    it('应该拒绝非管理员用户创建教师', async () => {
      const teacherData = {
        userId: testUser.id,
        teacherId: testTeacher.id,
        teacherNo: 'T002',
        position: 5
      };

      const response = await request(app)
        .post('/api/teachers')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(teacherData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('应该拒绝重复的教师编号', async () => {
      const teacherData = {
        userId: testUser.id,
        teacherId: testTeacher.id,
        teacherNo: 'T001', // 已存在的教师编号
        position: 5
      };

      const response = await request(app)
        .post('/api/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(teacherData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('教师编号已存在');
    });

    it('应该验证必填字段', async () => {
      const invalidData = {
        // 缺少必填字段 userId, kindergartenId, position
        teacherNo: 'T003',
        remark: '测试备注'
      };

      const response = await request(app)
        .post('/api/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/teachers - 获取教师列表', () => {
    it('管理员应该成功获取教师列表', async () => {
      const response = await request(app)
        .get('/api/teachers')
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
        .get('/api/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, pageSize: 5 })
        .expect(200);

      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('pageSize', 5);
    });

    it('应该支持按幼儿园筛选', async () => {
      const response = await request(app)
        .get('/api/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ kindergartenId: testKindergarten.id })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: testTeacher.id,
            classId: testClass.id
          })
        ])
      );
    });

    it('非管理员用户应该被拒绝访问教师列表', async () => {
      const response = await request(app)
        .get('/api/teachers')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/teachers/:id - 获取教师详情', () => {
    it('管理员应该成功获取指定教师详情', async () => {
      const response = await request(app)
        .get(`/api/teachers/${testTeacher.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', testTeacher.id);
      expect(response.body.data).toHaveProperty('userId', testTeacher.userId);
      expect(response.body.data).toHaveProperty('kindergartenId', testTeacher.kindergartenId);
      expect(response.body.data).toHaveProperty('teacherNo', testTeacher.teacherNo);
      expect(response.body.data).toHaveProperty('position', testTeacher.position);
      expect(response.body.data).toHaveProperty('status', testTeacher.status);
      expect(response.body.data.user).toHaveProperty('id', testUser.id);
      expect(response.body.data.user).toHaveProperty('username', testUser.username);
      expect(response.body.data.user).toHaveProperty('name', testUser.realName);
      expect(response.body.data.kindergarten).toHaveProperty('id', testKindergarten.id);
      expect(response.body.data.kindergarten).toHaveProperty('name', testKindergarten.name);
      expect(Array.isArray(response.body.data.classes)).toBe(true);
    });

    it('应该处理不存在的教师', async () => {
      const response = await request(app)
        .get('/api/teachers/99999') // 不存在的ID
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('教师不存在');
    });

    it('教师用户应该可以访问授权的教师详情', async () => {
      // 为教师用户分配查看权限
      const response = await request(app)
        .get(`/api/teachers/${testTeacher.id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('PUT /api/teachers/:id - 更新教师信息', () => {
    it('管理员应该成功更新教师信息', async () => {
      const updateData = {
        position: 4, // 班主任
        remark: '更新的教师备注'
      };

      const response = await request(app)
        .put(`/api/teachers/${testTeacher.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '更新教师信息成功');
      expect(response.body.data).toHaveProperty('id', testTeacher.id);
      expect(response.body.data).toHaveProperty('position', updateData.position);
      expect(response.body.data).toHaveProperty('remark', updateData.remark);
    });

    it('应该拒绝非管理员用户更新教师信息', async () => {
      const updateData = {
        remark: '非法更新'
      };

      const response = await request(app)
        .put(`/api/teachers/${testTeacher.id}`)
        .set('Authorization', `Bearer ${parentToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该处理更新不存在的教师', async () => {
      const updateData = {
        remark: '不存在的教师更新'
      };

      const response = await request(app)
        .put('/api/teachers/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('教师不存在');
    });
  });

  describe('DELETE /api/teachers/:id - 删除教师', () => {
    let teacherToDelete: any;

    beforeAll(async () => {
      // 创建一个专门用于删除测试的教师
      const user = await testDataFactory.createUser({
        username: 'delete-test-teacher',
        email: 'delete-teacher@test.com',
        realName: '删除测试教师'
      });

      const teacherData = {
        userId: user.id,
        teacherId: testTeacher.id,
        teacherNo: 'T004',
        position: 5,
        status: 1
      };

      const response = await request(app)
        .post('/api/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(teacherData)
        .expect(201);

      teacherToDelete = response.body.data;
    });

    it('管理员应该成功删除教师', async () => {
      const response = await request(app)
        .delete(`/api/teachers/${teacherToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '删除教师成功');
    });

    it('应该拒绝非管理员用户删除教师', async () => {
      // 创建一个新教师用于测试
      const user = await testDataFactory.createUser({
        username: 'delete-test-teacher2',
        email: 'delete-teacher2@test.com',
        realName: '删除测试教师2'
      });

      const teacherData = {
        userId: user.id,
        teacherId: testTeacher.id,
        teacherNo: 'T005',
        position: 5,
        status: 1
      };

      const createResponse = await request(app)
        .post('/api/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(teacherData)
        .expect(201);

      const response = await request(app)
        .delete(`/api/teachers/${createResponse.body.data.id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该处理删除不存在的教师', async () => {
      const response = await request(app)
        .delete('/api/teachers/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('教师不存在');
    });
  });

  describe('GET /api/teachers/:id/stats - 获取教师统计信息', () => {
    it('管理员应该成功获取教师统计信息', async () => {
      const response = await request(app)
        .get(`/api/teachers/${testTeacher.id}/stats`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '获取教师统计信息成功');
      expect(response.body.data).toHaveProperty('teacher');
      expect(response.body.data).toHaveProperty('class');
      expect(response.body.data).toHaveProperty('student');
      expect(response.body.data).toHaveProperty('subjects');
      expect(response.body.data).toHaveProperty('activities');
      
      // 验证教师信息
      expect(response.body.data.teacher).toHaveProperty('id', testTeacher.id);
      expect(response.body.data.teacher).toHaveProperty('name', testUser.realName);
      expect(response.body.data.teacher).toHaveProperty('teacherNo', testTeacher.teacherNo);
      expect(response.body.data.teacher).toHaveProperty('position', testTeacher.position);
      
      // 验证班级统计
      expect(response.body.data.class).toHaveProperty('totalClasses');
      expect(response.body.data.class).toHaveProperty('mainClasses');
      expect(response.body.data.class).toHaveProperty('subjectsCount');
      
      // 验证学生统计
      expect(response.body.data.student).toHaveProperty('totalStudents');
      expect(response.body.data.student).toHaveProperty('averageAge');
      expect(response.body.data.student).toHaveProperty('classesWithStudents');
    });

    it('非管理员用户应该被拒绝访问教师统计信息', async () => {
      const response = await request(app)
        .get(`/api/teachers/${testTeacher.id}/stats`)
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该处理不存在的教师统计信息', async () => {
      const response = await request(app)
        .get('/api/teachers/99999/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('教师不存在');
    });
  });

  describe('GET /api/teachers/statistics - 获取全局教师统计信息', () => {
    it('管理员应该成功获取全局教师统计信息', async () => {
      const response = await request(app)
        .get('/api/teachers/statistics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '获取教师统计信息成功');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('active');
      expect(response.body.data).toHaveProperty('inactive');
      expect(response.body.data).toHaveProperty('kindergartens');
      expect(response.body.data).toHaveProperty('positions');
      expect(response.body.data).toHaveProperty('positionDistribution');
      expect(response.body.data).toHaveProperty('classAssignments');
      
      // 验证统计信息
      expect(typeof response.body.data.total).toBe('number');
      expect(typeof response.body.data.active).toBe('number');
      expect(typeof response.body.data.inactive).toBe('number');
    });

    it('非管理员用户应该被拒绝访问全局教师统计信息', async () => {
      const response = await request(app)
        .get('/api/teachers/statistics')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/teachers/search - 搜索教师', () => {
    it('管理员应该成功搜索教师', async () => {
      const response = await request(app)
        .get('/api/teachers/search')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ keyword: '测试' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '获取教师列表成功');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('pageSize');
      expect(response.body.data).toHaveProperty('items');
      expect(Array.isArray(response.body.data.items)).toBe(true);
      
      // 检查返回的教师列表中包含测试教师
      const foundTeachers = response.body.data.items.filter((teacher: any) => teacher.id === testTeacher.id);
      expect(foundTeachers).toHaveLength(1);
    });

    it('应该支持按职位搜索', async () => {
      const response = await request(app)
        .get('/api/teachers/search')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ position: 4 }) // 班主任
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      // 验证返回的教师职位是否正确
      if (response.body.data.items.length > 0) {
        expect(response.body.data.items[0]).toHaveProperty('position', 4);
      }
    });

    it('非管理员用户应该被拒绝搜索教师', async () => {
      const response = await request(app)
        .get('/api/teachers/search')
        .set('Authorization', `Bearer ${parentToken}`)
        .query({ keyword: '测试' })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/teachers/by-user/:userId - 根据用户ID获取教师信息', () => {
    it('管理员应该成功根据用户ID获取教师信息', async () => {
      const response = await request(app)
        .get(`/api/teachers/by-user/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '获取教师信息成功');
      expect(response.body.data).toHaveProperty('id', testTeacher.id);
      expect(response.body.data).toHaveProperty('userId', testUser.id);
      expect(response.body.data.user).toHaveProperty('id', testUser.id);
      expect(response.body.data.user).toHaveProperty('username', testUser.username);
      expect(response.body.data.user).toHaveProperty('name', testUser.realName);
    });

    it('应该处理不存在的用户ID', async () => {
      const response = await request(app)
        .get('/api/teachers/by-user/99999') // 不存在的用户ID
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('未找到该用户对应的教师信息');
    });

    it('非管理员用户应该被拒绝根据用户ID获取教师信息', async () => {
      const response = await request(app)
        .get(`/api/teachers/by-user/${testUser.id}`)
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('权限验证测试', () => {
    let readOnlyUser: any;
    let readOnlyToken: string;

    beforeAll(async () => {
      const readOnly = await createUserWithPermissions('test-readonly', [
        'teachers:read',
        'classes:read'
      ]);
      readOnlyUser = readOnly.user;
      readOnlyToken = readOnly.token;
    });

    it('管理员应该有完全访问权限', async () => {
      const response = await request(app)
        .get('/api/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('只读用户应该被拒绝写操作', async () => {
      const teacherData = {
        userId: testUser.id,
        teacherId: testTeacher.id,
        teacherNo: 'T006',
        position: 5
      };

      const response = await request(app)
        .post('/api/teachers')
        .set('Authorization', `Bearer ${readOnlyToken}`)
        .send(teacherData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('只读用户应该可以执行读操作', async () => {
      const response = await request(app)
        .get(`/api/teachers/${testTeacher.id}`)
        .set('Authorization', `Bearer ${readOnlyToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('教师用户应该只能访问授权的资源', async () => {
      // 教师用户应该可以访问教师列表
      const response = await request(app)
        .get('/api/teachers')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('错误处理测试', () => {
    it('应该返回标准错误格式', async () => {
      const response = await request(app)
        .get('/api/nonexistent-teacher-endpoint')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内响应教师列表请求', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(5000); // 5秒内响应
    });

    it('应该处理并发教师请求', async () => {
      const requests = Array(5).fill(null).map(() =>
        request(app)
          .get('/api/teachers')
          .set('Authorization', `Bearer ${adminToken}`)
      );

      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});