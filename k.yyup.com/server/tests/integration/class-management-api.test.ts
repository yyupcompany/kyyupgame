/**
 * 班级管理API集成测试
 * 
 * 测试覆盖：
 * - 班级信息管理接口
 * - 班级学生管理
 * - 班级统计信息
 * - 班级状态管理
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

describe('Class Management API Integration Tests', () => {
  let adminUser: any;
  let adminToken: string;
  let teacherUser: any;
  let teacherToken: string;
  let parentUser: any;
  let parentToken: string;
  let testDataFactory: TestDataFactory;
  let testClass: any;
  let testKindergarten: any;
  let testTeacher: any;
  let testStudent: any;

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
      'classes:read',
      'classes:write',
      'students:read',
      'teachers:read'
    ]);
    teacherUser = teacher.user;
    teacherToken = teacher.token;

    const parent = await createUserWithPermissions('test-parent', [
      'students:read:own',
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

    testTeacher = await testDataFactory.createTeacher({
      name: '测试教师',
      classId: testClass.id
    });

    testClass = await testDataFactory.createClass({
      name: '测试班级',
      teacherId: testTeacher.id,
      capacity: 30
    });

    testStudent = await testDataFactory.createStudent({
      name: '测试学生',
      classId: testClass.id
    });
  });

  // 在所有测试之后执行
  afterAll(async () => {
    // 清理测试数据库
    await cleanupTestDatabase();
  });

  describe('POST /api/classes - 创建班级', () => {
    it('管理员应该成功创建新班级', async () => {
      const classData = {
        name: '新测试班级',
        code: 'NEW_TEST_CLASS',
        teacherId: testTeacher.id,
        type: 1, // 小班
        grade: '小班',
        headTeacherId: testTeacher.id,
        capacity: 25,
        description: '新创建的测试班级'
      };

      const response = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(classData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '创建班级成功');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', classData.name);
      expect(response.body.data).toHaveProperty('code', classData.code);
      expect(response.body.data).toHaveProperty('kindergartenId', classData.kindergartenId);
      expect(response.body.data).toHaveProperty('type', classData.type);
      expect(response.body.data).toHaveProperty('grade', classData.grade);
      expect(response.body.data).toHaveProperty('headTeacherId', classData.headTeacherId);
      expect(response.body.data).toHaveProperty('capacity', classData.capacity);
      expect(response.body.data).toHaveProperty('description', classData.description);
      expect(response.body.data).toHaveProperty('status', 1); // 默认状态为正常
      expect(response.body.data.kindergarten).toHaveProperty('id', testKindergarten.id);
      expect(response.body.data.kindergarten).toHaveProperty('name', testKindergarten.name);
    });

    it('应该拒绝非管理员用户创建班级', async () => {
      const classData = {
        name: '未授权班级',
        code: 'UNAUTHORIZED_CLASS',
        teacherId: testTeacher.id,
        type: 1
      };

      const response = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(classData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('应该拒绝重复的班级代码', async () => {
      const classData = {
        name: '重复代码班级',
        code: 'NEW_TEST_CLASS', // 已存在的班级代码
        teacherId: testTeacher.id,
        type: 1
      };

      const response = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(classData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('班级代码已存在');
    });

    it('应该验证必填字段', async () => {
      const invalidData = {
        // 缺少必填字段 name, kindergartenId, type
        description: '缺少必填字段的班级'
      };

      const response = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/classes - 获取班级列表', () => {
    it('管理员应该成功获取班级列表', async () => {
      const response = await request(app)
        .get('/api/classes')
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
        .get('/api/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('pageSize', 5);
    });

    it('应该支持按幼儿园筛选', async () => {
      const response = await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ kindergartenId: testKindergarten.id })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      // 验证返回的班级都属于指定幼儿园
      response.body.data.items.forEach((item: any) => {
        expect(item.kindergartenId).toBe(testKindergarten.id);
      });
    });

    it('非管理员用户应该被拒绝访问班级列表', async () => {
      const response = await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/classes/:id - 获取班级详情', () => {
    it('管理员应该成功获取指定班级详情', async () => {
      const response = await request(app)
        .get(`/api/classes/${testClass.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', testClass.id);
      expect(response.body.data).toHaveProperty('name', testClass.name);
      expect(response.body.data).toHaveProperty('code', testClass.code);
      expect(response.body.data).toHaveProperty('kindergartenId', testClass.kindergartenId);
      expect(response.body.data).toHaveProperty('type', testClass.type);
      expect(response.body.data).toHaveProperty('headTeacherId', testClass.headTeacherId);
      expect(response.body.data).toHaveProperty('capacity', testClass.capacity);
      expect(response.body.data.kindergarten).toHaveProperty('id', testKindergarten.id);
      expect(response.body.data.kindergarten).toHaveProperty('name', testKindergarten.name);
      expect(Array.isArray(response.body.data.students)).toBe(true);
      expect(Array.isArray(response.body.data.teachers)).toBe(true);
    });

    it('应该处理不存在的班级', async () => {
      const response = await request(app)
        .get('/api/classes/99999') // 不存在的ID
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('班级不存在');
    });

    it('教师用户应该可以访问授权的班级详情', async () => {
      const response = await request(app)
        .get(`/api/classes/${testClass.id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('PUT /api/classes/:id - 更新班级信息', () => {
    it('管理员应该成功更新班级信息', async () => {
      const updateData = {
        name: '更新的测试班级',
        description: '更新的班级描述',
        capacity: 35
      };

      const response = await request(app)
        .put(`/api/classes/${testClass.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '更新班级信息成功');
      expect(response.body.data).toHaveProperty('id', testClass.id);
      expect(response.body.data).toHaveProperty('name', updateData.name);
      expect(response.body.data).toHaveProperty('description', updateData.description);
      expect(response.body.data).toHaveProperty('capacity', updateData.capacity);
    });

    it('应该拒绝非管理员用户更新班级信息', async () => {
      const updateData = {
        name: '非法更新'
      };

      const response = await request(app)
        .put(`/api/classes/${testClass.id}`)
        .set('Authorization', `Bearer ${parentToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该处理更新不存在的班级', async () => {
      const updateData = {
        name: '不存在的班级更新'
      };

      const response = await request(app)
        .put('/api/classes/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('班级不存在');
    });
  });

  describe('DELETE /api/classes/:id - 删除班级', () => {
    let classToDelete: any;

    beforeAll(async () => {
      // 创建一个专门用于删除测试的班级
      classToDelete = await testDataFactory.createClass({
        name: '删除测试班级',
        teacherId: testTeacher.id,
        capacity: 30
      });
    });

    it('管理员应该成功删除班级', async () => {
      const response = await request(app)
        .delete(`/api/classes/${classToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '删除班级成功');
    });

    it('应该拒绝非管理员用户删除班级', async () => {
      // 创建一个新班级用于测试
      const newClass = await testDataFactory.createClass({
        name: '删除测试班级2',
        teacherId: testTeacher.id,
        capacity: 30
      });

      const response = await request(app)
        .delete(`/api/classes/${newClass.id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该处理删除不存在的班级', async () => {
      const response = await request(app)
        .delete('/api/classes/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('班级不存在');
    });

    it('应该拒绝删除有关联学生的班级', async () => {
      // 创建一个班级并添加学生
      const classWithStudents = await testDataFactory.createClass({
        name: '有学生班级',
        teacherId: testTeacher.id,
        capacity: 30
      });

      // 为学生分配班级
      await testDataFactory.assignStudentToClass(testStudent.id, classWithStudents.id);

      const response = await request(app)
        .delete(`/api/classes/${classWithStudents.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('该班级有关联的学生，无法删除');
    });
  });

  describe('GET /api/classes/stats - 获取班级统计信息', () => {
    it('管理员应该成功获取班级统计信息', async () => {
      const response = await request(app)
        .get('/api/classes/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '获取班级统计成功');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('active');
      expect(response.body.data).toHaveProperty('inactive');
      expect(response.body.data).toHaveProperty('totalStudents');
      expect(response.body.data).toHaveProperty('totalCapacity');
      expect(response.body.data).toHaveProperty('avgStudentsPerClass');
      expect(response.body.data).toHaveProperty('utilizationRate');
      expect(response.body.data).toHaveProperty('byType');
      expect(response.body.data).toHaveProperty('byGrade');
      
      // 验证统计信息类型
      expect(typeof response.body.data.total).toBe('number');
      expect(typeof response.body.data.active).toBe('number');
      expect(typeof response.body.data.inactive).toBe('number');
      expect(Array.isArray(response.body.data.byType)).toBe(true);
      expect(Array.isArray(response.body.data.byGrade)).toBe(true);
    });

    it('非管理员用户应该被拒绝访问班级统计信息', async () => {
      const response = await request(app)
        .get('/api/classes/stats')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/classes/:id/students - 获取班级学生列表', () => {
    it('管理员应该成功获取班级学生列表', async () => {
      const response = await request(app)
        .get(`/api/classes/${testClass.id}/students`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '获取班级学生列表成功');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('pageSize');
      expect(response.body.data).toHaveProperty('items');
      expect(Array.isArray(response.body.data.items)).toBe(true);
    });

    it('应该支持分页参数', async () => {
      const response = await request(app)
        .get(`/api/classes/${testClass.id}/students`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('pageSize', 5);
    });

    it('非管理员用户应该被拒绝访问班级学生列表', async () => {
      const response = await request(app)
        .get(`/api/classes/${testClass.id}/students`)
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/classes/:id/students - 向班级添加学生', () => {
    let studentToAdd: any;

    beforeAll(async () => {
      // 创建一个用于添加到班级的学生
      studentToAdd = await testDataFactory.createStudent({
        name: '待添加学生',
        classId: testClass.id
      });
    });

    it('管理员应该成功向班级添加学生', async () => {
      const addData = {
        studentIds: [studentToAdd.id]
      };

      const response = await request(app)
        .post(`/api/classes/${testClass.id}/students`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(addData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '学生添加到班级成功');
      expect(response.body.data).toHaveProperty('addedCount', 1);
    });

    it('应该拒绝非管理员用户向班级添加学生', async () => {
      const addData = {
        studentIds: [studentToAdd.id]
      };

      const response = await request(app)
        .post(`/api/classes/${testClass.id}/students`)
        .set('Authorization', `Bearer ${parentToken}`)
        .send(addData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该处理无效的学生ID', async () => {
      const addData = {
        studentIds: [99999] // 不存在的学生ID
      };

      const response = await request(app)
        .post(`/api/classes/${testClass.id}/students`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(addData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('部分学生不存在');
    });
  });

  describe('DELETE /api/classes/:id/students/:studentId - 从班级移除学生', () => {
    let classWithStudent: any;
    let studentToRemove: any;

    beforeAll(async () => {
      // 创建一个班级和学生用于移除测试
      classWithStudent = await testDataFactory.createClass({
        name: '移除学生测试班级',
        teacherId: testTeacher.id,
        capacity: 30
      });

      studentToRemove = await testDataFactory.createStudent({
        name: '待移除学生',
        classId: testClass.id
      });

      // 将学生添加到班级
      await testDataFactory.assignStudentToClass(studentToRemove.id, classWithStudent.id);
    });

    it('管理员应该成功从班级移除学生', async () => {
      const response = await request(app)
        .delete(`/api/classes/${classWithStudent.id}/students/${studentToRemove.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '学生从班级移除成功');
      expect(response.body.data).toHaveProperty('studentName', studentToRemove.name);
    });

    it('应该拒绝非管理员用户从班级移除学生', async () => {
      // 创建一个新的学生和班级用于测试
      const newClass = await testDataFactory.createClass({
        name: '移除学生测试班级2',
        teacherId: testTeacher.id,
        capacity: 30
      });

      const newStudent = await testDataFactory.createStudent({
        name: '待移除学生2',
        classId: testClass.id
      });

      // 将学生添加到班级
      await testDataFactory.assignStudentToClass(newStudent.id, newClass.id);

      const response = await request(app)
        .delete(`/api/classes/${newClass.id}/students/${newStudent.id}`)
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该处理移除不存在的学生', async () => {
      const response = await request(app)
        .delete(`/api/classes/${classWithStudent.id}/students/99999`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('学生不存在');
    });

    it('应该处理学生不在指定班级的情况', async () => {
      // 创建一个学生但不分配班级
      const unassignedStudent = await testDataFactory.createStudent({
        name: '未分配学生',
        classId: testClass.id
      });

      const response = await request(app)
        .delete(`/api/classes/${classWithStudent.id}/students/${unassignedStudent.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('学生不在该班级中');
    });
  });

  describe('权限验证测试', () => {
    let readOnlyUser: any;
    let readOnlyToken: string;

    beforeAll(async () => {
      const readOnly = await createUserWithPermissions('test-readonly', [
        'classes:read',
        'students:read'
      ]);
      readOnlyUser = readOnly.user;
      readOnlyToken = readOnly.token;
    });

    it('管理员应该有完全访问权限', async () => {
      const response = await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('只读用户应该被拒绝写操作', async () => {
      const classData = {
        name: '只读测试班级',
        code: 'READONLY_TEST_CLASS',
        teacherId: testTeacher.id,
        type: 1
      };

      const response = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${readOnlyToken}`)
        .send(classData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('只读用户应该可以执行读操作', async () => {
      const response = await request(app)
        .get(`/api/classes/${testClass.id}`)
        .set('Authorization', `Bearer ${readOnlyToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('教师用户应该只能访问授权的资源', async () => {
      const response = await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('错误处理测试', () => {
    it('应该返回标准错误格式', async () => {
      const response = await request(app)
        .get('/api/nonexistent-class-endpoint')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内响应班级列表请求', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(5000); // 5秒内响应
    });

    it('应该处理并发班级请求', async () => {
      const requests = Array(5).fill(null).map(() =>
        request(app)
          .get('/api/classes')
          .set('Authorization', `Bearer ${adminToken}`)
      );

      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});