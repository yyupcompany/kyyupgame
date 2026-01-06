import { TestHelper, TestDataFactory, ResponseValidators } from '../helpers/testUtils';
import { Application } from 'express';
import { createTestApp, initTestDatabase, closeTestDatabase } from '../helpers/testApp';

let app: Application;
let testHelper: TestHelper;

describe('Students API Tests', () => {
  beforeAll(async () => {
    await initTestDatabase();
    app = createTestApp();
    testHelper = new TestHelper(app);
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('GET /api/students', () => {
    it('should get students list with proper permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/students', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(ResponseValidators.hasValidPagination(response.body.data)).toBeTruthy();
      expect(Array.isArray(response.body.data.items)).toBeTruthy();
    });

    it('should get students with pagination', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/students?page=1&limit=20', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(20);
    });

    it('should filter students by class', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/students?classId=1', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      if (response.body.data.items.length > 0) {
        response.body.data.items.forEach((student: any) => {
          expect(student.classId).toBe(1);
        });
      }
    });

    it('should filter students by gender', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/students?gender=男', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      if (response.body.data.items.length > 0) {
        response.body.data.items.forEach((student: any) => {
          expect(student.gender).toBe('男');
        });
      }
    });

    it('should search students by name', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/students?search=小明', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      if (response.body.data.items.length > 0) {
        response.body.data.items.forEach((student: any) => {
          expect(student.name).toContain('小明');
        });
      }
    });

    it('should fail without authentication', async () => {
      const response = await testHelper.public('get', '/api/students');

      expect(response.status).toBe(401);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Authentication required');
    });
  });

  describe('GET /api/students/:id', () => {
    it('should get student by ID with proper permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/students/1', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('gender');
      expect(response.body.data).toHaveProperty('birthDate');
      expect(response.body.data).toHaveProperty('classId');
    });

    it('should include parent information when requested', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/students/1?include=parent', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('parent');
      if (response.body.data.parent) {
        expect(response.body.data.parent).toHaveProperty('name');
        expect(response.body.data.parent).toHaveProperty('phone');
      }
    });

    it('should return 404 for non-existent student', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/students/99999', teacherUser);

      expect(response.status).toBe(404);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Student not found');
    });

    it('should allow parent to view their own child', async () => {
      const parentUser = TestDataFactory.createUser({ id: 1, role: 'parent' });
      const response = await testHelper.get('/api/students/1', parentUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
    });
  });

  describe('POST /api/students', () => {
    it('should create student with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const studentData = TestDataFactory.createStudent({
        name: '新学生',
        gender: '女',
        birthDate: '2020-06-15',
        parentId: 1,
        classId: 1
      });

      const response = await testHelper.post('/api/students', studentData, adminUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(studentData.name);
      expect(response.body.data.gender).toBe(studentData.gender);
      expect(response.body.data.classId).toBe(studentData.classId);
    });

    it('should create student with teacher permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const studentData = TestDataFactory.createStudent({
        name: '教师添加学生',
        gender: '男',
        birthDate: '2020-03-20'
      });

      const response = await testHelper.post('/api/students', studentData, teacherUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.name).toBe(studentData.name);
    });

    it('should fail with missing required fields', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const invalidData = {
        gender: '男'
        // Missing name and birthDate
      };

      const response = await testHelper.post('/api/students', invalidData, adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Name is required');
    });

    it('should validate birthDate format', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const invalidData = TestDataFactory.createStudent({
        birthDate: 'invalid-date'
      });

      const response = await testHelper.post('/api/students', invalidData, adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Invalid birth date format');
    });

    it('should validate gender values', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const invalidData = TestDataFactory.createStudent({
        gender: 'invalid'
      });

      const response = await testHelper.post('/api/students', invalidData, adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Gender must be 男 or 女');
    });

    it('should fail without proper permissions', async () => {
      const parentUser = TestDataFactory.createUser({ role: 'parent' });
      const studentData = TestDataFactory.createStudent();

      const response = await testHelper.post('/api/students', studentData, parentUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Insufficient permissions');
    });
  });

  describe('PUT /api/students/:id', () => {
    it('should update student with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const updateData = {
        name: '更新学生姓名',
        gender: '女',
        classId: 2
      };

      const response = await testHelper.put('/api/students/1', updateData, adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.gender).toBe(updateData.gender);
      expect(response.body.data.classId).toBe(updateData.classId);
    });

    it('should update student with teacher permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const updateData = {
        name: '教师更新学生',
        notes: '教师添加的备注'
      };

      const response = await testHelper.put('/api/students/1', updateData, teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.name).toBe(updateData.name);
    });

    it('should fail to update non-existent student', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const updateData = { name: '不存在的学生' };

      const response = await testHelper.put('/api/students/99999', updateData, adminUser);

      expect(response.status).toBe(404);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Student not found');
    });

    it('should fail without proper permissions', async () => {
      const parentUser = TestDataFactory.createUser({ role: 'parent' });
      const updateData = { name: '家长尝试更新' };

      const response = await testHelper.put('/api/students/1', updateData, parentUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Insufficient permissions');
    });
  });

  describe('DELETE /api/students/:id', () => {
    it('should delete student with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.delete('/api/students/1', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Student deleted successfully');
    });

    it('should fail to delete non-existent student', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.delete('/api/students/99999', adminUser);

      expect(response.status).toBe(404);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Student not found');
    });

    it('should fail without admin permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.delete('/api/students/1', teacherUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Only administrators can delete students');
    });
  });

  describe('GET /api/students/:id/activities', () => {
    it('should get student activities', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/students/1/activities', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });

    it('should allow parent to view their child activities', async () => {
      const parentUser = TestDataFactory.createUser({ id: 1, role: 'parent' });
      const response = await testHelper.get('/api/students/1/activities', parentUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
    });
  });

  describe('POST /api/students/:id/transfer', () => {
    it('should transfer student to another class', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const transferData = {
        newClassId: 2,
        reason: '班级调整',
        effectiveDate: new Date().toISOString()
      };

      const response = await testHelper.post('/api/students/1/transfer', transferData, adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.classId).toBe(transferData.newClassId);
      expect(response.body.message).toContain('Student transferred successfully');
    });

    it('should fail with invalid class ID', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const transferData = {
        newClassId: 99999,
        reason: '无效班级'
      };

      const response = await testHelper.post('/api/students/1/transfer', transferData, adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Invalid class ID');
    });

    it('should fail without admin permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const transferData = {
        newClassId: 2,
        reason: '教师尝试转班'
      };

      const response = await testHelper.post('/api/students/1/transfer', transferData, teacherUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Only administrators can transfer students');
    });
  });
});