/**
 * 学生管理API集成测试
 * 
 * 测试覆盖：
 * - 学生信息管理接口
 * - 学生班级分配
 * - 学生成长记录
 * - 学生状态管理
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

describe('Student Management API Integration Tests', () => {
  let adminUser: any;
  let adminToken: string;
  let teacherUser: any;
  let teacherToken: string;
  let parentUser: any;
  let parentToken: string;
  let testDataFactory: TestDataFactory;
  let testStudent: any;
  let testClass: any;
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
      'students:read',
      'students:write',
      'classes:read',
      'activities:read',
      'activities:write'
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

    testClass = await testDataFactory.createClass({
      name: '测试班级',
      teacherId: testTeacher.id,
      capacity: 30
    });
  });

  // 在所有测试之后执行
  afterAll(async () => {
    // 清理测试数据库
    await cleanupTestDatabase();
  });

  describe('POST /api/students - 创建学生', () => {
    it('管理员应该成功创建新学生', async () => {
      const studentData = {
        name: '测试学生',
        studentNo: 'STU001',
        teacherId: testTeacher.id,
        classId: testClass.id,
        gender: 1,
        birthDate: '2018-01-01',
        enrollmentDate: '2024-09-01',
        status: 1,
        householdAddress: '北京市朝阳区',
        allergyHistory: '无',
        interests: '绘画,音乐'
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '创建学生成功');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', studentData.name);
      expect(response.body.data).toHaveProperty('studentNo', studentData.studentNo);
      expect(response.body.data).toHaveProperty('kindergartenId', studentData.kindergartenId);
      expect(response.body.data).toHaveProperty('classId', studentData.classId);
      expect(response.body.data).toHaveProperty('gender', studentData.gender);
      expect(response.body.data).toHaveProperty('status', studentData.status);
      expect(response.body.data).toHaveProperty('householdAddress', studentData.householdAddress);
      expect(response.body.data).toHaveProperty('allergyHistory', studentData.allergyHistory);
      expect(response.body.data).toHaveProperty('interests', studentData.interests);

      // 保存创建的学生用于后续测试
      testStudent = response.body.data;
    });

    it('应该拒绝非管理员用户创建学生', async () => {
      const studentData = {
        name: '未授权学生',
        studentNo: 'STU002',
        teacherId: testTeacher.id,
        gender: 1,
        birthDate: '2018-01-01',
        enrollmentDate: '2024-09-01'
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(studentData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('应该拒绝重复的学号', async () => {
      const studentData = {
        name: '重复学号学生',
        studentNo: 'STU001', // 已存在的学号
        teacherId: testTeacher.id,
        gender: 1,
        birthDate: '2018-01-01',
        enrollmentDate: '2024-09-01'
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('学号已存在');
    });

    it('应该验证必填字段', async () => {
      const invalidData = {
        // 缺少必填字段 name, studentNo, kindergartenId, gender, birthDate, enrollmentDate
        householdAddress: '测试地址'
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/students - 获取学生列表', () => {
    it('管理员应该成功获取学生列表', async () => {
      const response = await request(app)
        .get('/api/students')
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
        .get('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('pageSize', 5);
    });

    it('应该支持按班级筛选', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ classId: testClass.id })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: testStudent.id,
            classId: testClass.id
          })
        ])
      );
    });

    it('非管理员用户应该被拒绝访问学生列表', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/students/:id - 获取学生详情', () => {
    it('管理员应该成功获取指定学生详情', async () => {
      const response = await request(app)
        .get(`/api/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', testStudent.id);
      expect(response.body.data).toHaveProperty('name', testStudent.name);
      expect(response.body.data).toHaveProperty('studentNo', testStudent.studentNo);
      expect(response.body.data).toHaveProperty('kindergartenId', testStudent.kindergartenId);
      expect(response.body.data).toHaveProperty('classId', testStudent.classId);
      expect(response.body.data).toHaveProperty('gender', testStudent.gender);
      expect(response.body.data).toHaveProperty('status', testStudent.status);
    });

    it('应该处理不存在的学生', async () => {
      const response = await request(app)
        .get('/api/students/99999') // 不存在的ID
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('学生不存在');
    });

    it('教师用户应该可以访问授权的学生详情', async () => {
      // 为教师用户分配查看权限
      const response = await request(app)
        .get(`/api/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('PUT /api/students/:id - 更新学生信息', () => {
    it('管理员应该成功更新学生信息', async () => {
      const updateData = {
        name: '更新的学生姓名',
        householdAddress: '更新的地址',
        interests: '绘画,音乐,舞蹈'
      };

      const response = await request(app)
        .put(`/api/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '更新学生信息成功');
      expect(response.body.data).toHaveProperty('id', testStudent.id);
      expect(response.body.data).toHaveProperty('name', updateData.name);
      expect(response.body.data).toHaveProperty('householdAddress', updateData.householdAddress);
      expect(response.body.data).toHaveProperty('interests', updateData.interests);
    });

    it('应该拒绝非管理员用户更新学生信息', async () => {
      const updateData = {
        name: '非法更新'
      };

      const response = await request(app)
        .put(`/api/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${parentToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该处理更新不存在的学生', async () => {
      const updateData = {
        name: '不存在的学生更新'
      };

      const response = await request(app)
        .put('/api/students/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('学生不存在');
    });
  });

  describe('DELETE /api/students/:id - 删除学生', () => {
    let studentToDelete: any;

    beforeAll(async () => {
      // 创建一个专门用于删除测试的学生
      const studentData = {
        name: '删除测试学生',
        studentNo: 'STU003',
        teacherId: testTeacher.id,
        gender: 1,
        birthDate: '2018-01-01',
        enrollmentDate: '2024-09-01',
        status: 1
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentData)
        .expect(201);

      studentToDelete = response.body.data;
    });

    it('管理员应该成功删除学生', async () => {
      const response = await request(app)
        .delete(`/api/students/${studentToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '删除学生成功');
    });

    it('应该拒绝非管理员用户删除学生', async () => {
      // 创建一个新学生用于测试
      const studentData = {
        name: '删除测试学生2',
        studentNo: 'STU004',
        teacherId: testTeacher.id,
        gender: 1,
        birthDate: '2018-01-01',
        enrollmentDate: '2024-09-01',
        status: 1
      };

      const createResponse = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentData)
        .expect(201);

      const response = await request(app)
        .delete(`/api/students/${createResponse.body.data.id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该处理删除不存在的学生', async () => {
      const response = await request(app)
        .delete('/api/students/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('学生不存在');
    });
  });

  describe('POST /api/students/assign-class - 为学生分配班级', () => {
    let unassignedStudent: any;

    beforeAll(async () => {
      // 创建一个未分配班级的学生
      const studentData = {
        name: '未分配班级学生',
        studentNo: 'STU005',
        teacherId: testTeacher.id,
        gender: 1,
        birthDate: '2018-01-01',
        enrollmentDate: '2024-09-01',
        status: 1
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentData)
        .expect(201);

      unassignedStudent = response.body.data;
    });

    it('管理员应该成功为学生分配班级', async () => {
      const assignData = {
        studentId: unassignedStudent.id,
        classId: testClass.id
      };

      const response = await request(app)
        .post('/api/students/assign-class')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(assignData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '分配班级成功');
      expect(response.body.data).toHaveProperty('id', unassignedStudent.id);
      expect(response.body.data).toHaveProperty('classId', testClass.id);
    });

    it('应该拒绝非管理员用户分配班级', async () => {
      const assignData = {
        studentId: unassignedStudent.id,
        classId: testClass.id
      };

      const response = await request(app)
        .post('/api/students/assign-class')
        .set('Authorization', `Bearer ${parentToken}`)
        .send(assignData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该处理无效的学生ID', async () => {
      const assignData = {
        studentId: 99999, // 不存在的学生ID
        classId: testClass.id
      };

      const response = await request(app)
        .post('/api/students/assign-class')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(assignData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('学生不存在');
    });

    it('应该处理无效的班级ID', async () => {
      const assignData = {
        studentId: unassignedStudent.id,
        classId: 99999 // 不存在的班级ID
      };

      const response = await request(app)
        .post('/api/students/assign-class')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(assignData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('班级不存在');
    });
  });

  describe('PUT /api/students/status - 更新学生状态', () => {
    it('管理员应该成功更新学生状态', async () => {
      const statusData = {
        studentId: testStudent.id,
        status: 2 // 请假状态
      };

      const response = await request(app)
        .put('/api/students/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '更新学生状态成功');
      expect(response.body.data).toHaveProperty('id', testStudent.id);
      expect(response.body.data).toHaveProperty('status', 2);
    });

    it('应该拒绝非管理员用户更新学生状态', async () => {
      const statusData = {
        studentId: testStudent.id,
        status: 1 // 在读状态
      };

      const response = await request(app)
        .put('/api/students/status')
        .set('Authorization', `Bearer ${parentToken}`)
        .send(statusData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该处理无效的学生ID', async () => {
      const statusData = {
        studentId: 99999, // 不存在的学生ID
        status: 1
      };

      const response = await request(app)
        .put('/api/students/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('学生不存在');
    });

    it('应该验证状态值', async () => {
      const statusData = {
        studentId: testStudent.id,
        status: 99 // 无效的状态值
      };

      const response = await request(app)
        .put('/api/students/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/students/stats - 获取学生统计', () => {
    it('管理员应该成功获取学生统计信息', async () => {
      const response = await request(app)
        .get('/api/students/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '获取学生统计成功');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('active');
      expect(response.body.data).toHaveProperty('inactive');
      expect(response.body.data).toHaveProperty('male');
      expect(response.body.data).toHaveProperty('female');
      expect(response.body.data).toHaveProperty('assigned');
      expect(response.body.data).toHaveProperty('unassigned');
      expect(response.body.data).toHaveProperty('ageDistribution');
    });

    it('非管理员用户应该被拒绝访问学生统计', async () => {
      const response = await request(app)
        .get('/api/students/stats')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/students/available - 获取可用学生列表', () => {
    let unassignedStudent: any;

    beforeAll(async () => {
      // 创建一个未分配班级的学生
      const studentData = {
        name: '未分配学生',
        studentNo: 'STU006',
        teacherId: testTeacher.id,
        gender: 1,
        birthDate: '2018-01-01',
        enrollmentDate: '2024-09-01',
        status: 1
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentData)
        .expect(201);

      unassignedStudent = response.body.data;
    });

    it('管理员应该成功获取未分配班级的学生列表', async () => {
      const response = await request(app)
        .get('/api/students/available')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '获取可用学生列表成功');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // 检查返回的学生列表中包含未分配班级的学生
      const unassignedStudents = response.body.data.filter((student: any) => student.id === unassignedStudent.id);
      expect(unassignedStudents).toHaveLength(1);
      expect(unassignedStudents[0]).toHaveProperty('classId', null);
    });

    it('非管理员用户应该被拒绝访问可用学生列表', async () => {
      const response = await request(app)
        .get('/api/students/available')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/students/search - 搜索学生', () => {
    it('管理员应该成功搜索学生', async () => {
      const response = await request(app)
        .get('/api/students/search')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ keyword: '测试' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '搜索学生成功');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('pageSize');
      expect(response.body.data).toHaveProperty('items');
      expect(Array.isArray(response.body.data.items)).toBe(true);
      
      // 检查返回的学生列表中包含测试学生
      const foundStudents = response.body.data.items.filter((student: any) => student.id === testStudent.id);
      expect(foundStudents).toHaveLength(1);
    });

    it('应该支持按班级搜索', async () => {
      const response = await request(app)
        .get('/api/students/search')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ classId: testClass.id })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: testStudent.id,
            classId: testClass.id
          })
        ])
      );
    });

    it('非管理员用户应该被拒绝搜索学生', async () => {
      const response = await request(app)
        .get('/api/students/search')
        .set('Authorization', `Bearer ${parentToken}`)
        .query({ keyword: '测试' })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/students/by-class - 按班级获取学生列表', () => {
    it('管理员应该成功按班级获取学生列表', async () => {
      const response = await request(app)
        .get('/api/students/by-class')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ classId: testClass.id })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '获取班级学生列表成功');
      expect(response.body.data).toHaveProperty('list');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('pageSize', 10);
      expect(Array.isArray(response.body.data.list)).toBe(true);
      
      // 检查返回的学生列表中包含测试学生
      const classStudents = response.body.data.list.filter((student: any) => student.id === testStudent.id);
      expect(classStudents).toHaveLength(1);
    });

    it('应该支持分页和搜索', async () => {
      const response = await request(app)
        .get('/api/students/by-class')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ 
          classId: testClass.id,
          page: 1,
          pageSize: 5,
          keyword: '测试'
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('pageSize', 5);
    });

    it('非管理员用户应该被拒绝按班级获取学生列表', async () => {
      const response = await request(app)
        .get('/api/students/by-class')
        .set('Authorization', `Bearer ${parentToken}`)
        .query({ classId: testClass.id })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/students/batch-assign-class - 批量为学生分配班级', () => {
    let student1: any;
    let student2: any;

    beforeAll(async () => {
      // 创建两个未分配班级的学生
      const studentData1 = {
        name: '批量分配学生1',
        studentNo: 'STU007',
        teacherId: testTeacher.id,
        gender: 1,
        birthDate: '2018-01-01',
        enrollmentDate: '2024-09-01',
        status: 1
      };

      const studentData2 = {
        name: '批量分配学生2',
        studentNo: 'STU008',
        teacherId: testTeacher.id,
        gender: 2,
        birthDate: '2018-01-01',
        enrollmentDate: '2024-09-01',
        status: 1
      };

      const response1 = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentData1)
        .expect(201);

      const response2 = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentData2)
        .expect(201);

      student1 = response1.body.data;
      student2 = response2.body.data;
    });

    it('管理员应该成功批量为学生分配班级', async () => {
      const batchAssignData = {
        studentIds: [student1.id, student2.id],
        classId: testClass.id
      };

      const response = await request(app)
        .post('/api/students/batch-assign-class')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(batchAssignData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '批量分配班级成功');
      expect(response.body.data).toHaveProperty('updatedCount', 2);
    });

    it('应该拒绝非管理员用户批量分配班级', async () => {
      const batchAssignData = {
        studentIds: [student1.id, student2.id],
        classId: testClass.id
      };

      const response = await request(app)
        .post('/api/students/batch-assign-class')
        .set('Authorization', `Bearer ${parentToken}`)
        .send(batchAssignData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该处理无效的班级ID', async () => {
      const batchAssignData = {
        studentIds: [student1.id, student2.id],
        classId: 99999 // 不存在的班级ID
      };

      const response = await request(app)
        .post('/api/students/batch-assign-class')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(batchAssignData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('班级不存在');
    });
  });

  describe('权限验证测试', () => {
    let readOnlyUser: any;
    let readOnlyToken: string;

    beforeAll(async () => {
      const readOnly = await createUserWithPermissions('test-readonly', [
        'students:read',
        'classes:read'
      ]);
      readOnlyUser = readOnly.user;
      readOnlyToken = readOnly.token;
    });

    it('管理员应该有完全访问权限', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('只读用户应该被拒绝写操作', async () => {
      const studentData = {
        name: '只读测试学生',
        studentNo: 'STU009',
        teacherId: testTeacher.id,
        gender: 1,
        birthDate: '2018-01-01',
        enrollmentDate: '2024-09-01'
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${readOnlyToken}`)
        .send(studentData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('只读用户应该可以执行读操作', async () => {
      const response = await request(app)
        .get(`/api/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${readOnlyToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('教师用户应该只能访问授权的资源', async () => {
      // 教师用户应该可以访问学生列表
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('错误处理测试', () => {
    it('应该返回标准错误格式', async () => {
      const response = await request(app)
        .get('/api/nonexistent-student-endpoint')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内响应学生列表请求', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(5000); // 5秒内响应
    });

    it('应该处理并发学生请求', async () => {
      const requests = Array(5).fill(null).map(() =>
        request(app)
          .get('/api/students')
          .set('Authorization', `Bearer ${adminToken}`)
      );

      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});