import { TestHelper, TestDataFactory, ResponseValidators } from '../helpers/testUtils';
import { Application } from 'express';
import { createTestApp, initTestDatabase, closeTestDatabase } from '../helpers/testApp';

let app: Application;
let testHelper: TestHelper;

describe('Teachers API Tests', () => {
  beforeAll(async () => {
    await initTestDatabase();
    app = createTestApp();
    testHelper = new TestHelper(app);
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('GET /api/teachers', () => {
    it('should get teachers list with proper permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/teachers', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(ResponseValidators.hasValidPagination(response.body.data)).toBeTruthy();
      expect(Array.isArray(response.body.data.items)).toBeTruthy();
    });

    it('should filter teachers by qualification', async () => {
      const principalUser = TestDataFactory.createUser({ role: 'principal' });
      const response = await testHelper.get('/api/teachers?qualification=学前教育', principalUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      if (response.body.data.items.length > 0) {
        response.body.data.items.forEach((teacher: any) => {
          expect(teacher.qualification).toContain('学前教育');
        });
      }
    });

    it('should filter teachers by experience range', async () => {
      const principalUser = TestDataFactory.createUser({ role: 'principal' });
      const response = await testHelper.get('/api/teachers?minExperience=3&maxExperience=10', principalUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      if (response.body.data.items.length > 0) {
        response.body.data.items.forEach((teacher: any) => {
          expect(teacher.experience).toBeGreaterThanOrEqual(3);
          expect(teacher.experience).toBeLessThanOrEqual(10);
        });
      }
    });

    it('should allow teacher to view their own profile', async () => {
      const teacherUser = TestDataFactory.createUser({ id: 1, role: 'teacher' });
      const response = await testHelper.get('/api/teachers/me', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name');
    });

    it('should fail without authentication', async () => {
      const response = await testHelper.public('get', '/api/teachers');

      expect(response.status).toBe(401);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
    });
  });

  describe('POST /api/teachers', () => {
    it('should create teacher with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const teacherData = TestDataFactory.createTeacher({
        name: '新教师',
        email: 'newteacher@test.com',
        phone: '13900139001',
        qualification: '学前教育本科',
        experience: 3,
        specialties: ['音乐', '美术'],
        salary: 8000
      });

      const response = await testHelper.post('/api/teachers', teacherData, adminUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.name).toBe(teacherData.name);
      expect(response.body.data.email).toBe(teacherData.email);
    });

    it('should validate required fields', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const invalidData = {
        email: 'test@example.com'
        // Missing name and qualification
      };

      const response = await testHelper.post('/api/teachers', invalidData, adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Name is required');
    });

    it('should validate email format', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const invalidData = TestDataFactory.createTeacher({
        email: 'invalid-email'
      });

      const response = await testHelper.post('/api/teachers', invalidData, adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Invalid email format');
    });

    it('should fail without admin permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const teacherData = TestDataFactory.createTeacher();

      const response = await testHelper.post('/api/teachers', teacherData, teacherUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
    });
  });

  describe('PUT /api/teachers/:id', () => {
    it('should update teacher with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const updateData = {
        name: '更新教师姓名',
        qualification: '学前教育硕士',
        experience: 8,
        salary: 12000
      };

      const response = await testHelper.put('/api/teachers/1', updateData, adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.qualification).toBe(updateData.qualification);
    });

    it('should allow teacher to update own profile', async () => {
      const teacherUser = TestDataFactory.createUser({ id: 1, role: 'teacher' });
      const updateData = {
        phone: '13800138999',
        specialties: ['数学', '科学'],
        bio: '教学经验丰富的老师'
      };

      const response = await testHelper.put('/api/teachers/1', updateData, teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.phone).toBe(updateData.phone);
    });

    it('should not allow teacher to update salary', async () => {
      const teacherUser = TestDataFactory.createUser({ id: 1, role: 'teacher' });
      const updateData = {
        salary: 20000 // Trying to change salary
      };

      const response = await testHelper.put('/api/teachers/1', updateData, teacherUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Cannot update salary');
    });
  });

  describe('GET /api/teachers/:id/classes', () => {
    it('should get teacher assigned classes', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/teachers/1/classes', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });

    it('should allow teacher to view their own classes', async () => {
      const teacherUser = TestDataFactory.createUser({ id: 1, role: 'teacher' });
      const response = await testHelper.get('/api/teachers/1/classes', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
    });
  });

  describe('POST /api/teachers/:id/assign-class', () => {
    it('should assign class to teacher', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const assignData = {
        classId: 1,
        role: 'main_teacher',
        startDate: new Date().toISOString()
      };

      const response = await testHelper.post('/api/teachers/1/assign-class', assignData, adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Class assigned successfully');
    });

    it('should fail with invalid class ID', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const assignData = {
        classId: 99999,
        role: 'main_teacher'
      };

      const response = await testHelper.post('/api/teachers/1/assign-class', assignData, adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Invalid class ID');
    });
  });

  describe('GET /api/teachers/:id/performance', () => {
    it('should get teacher performance metrics', async () => {
      const principalUser = TestDataFactory.createUser({ role: 'principal' });
      const response = await testHelper.get('/api/teachers/1/performance', principalUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('evaluationScore');
      expect(response.body.data).toHaveProperty('studentFeedback');
      expect(response.body.data).toHaveProperty('classManagement');
    });

    it('should allow teacher to view own performance', async () => {
      const teacherUser = TestDataFactory.createUser({ id: 1, role: 'teacher' });
      const response = await testHelper.get('/api/teachers/1/performance', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
    });

    it('should fail for unauthorized teacher', async () => {
      const teacherUser = TestDataFactory.createUser({ id: 2, role: 'teacher' });
      const response = await testHelper.get('/api/teachers/1/performance', teacherUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
    });
  });

  describe('POST /api/teachers/:id/schedule', () => {
    it('should create teacher schedule', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const scheduleData = {
        dayOfWeek: 'Monday',
        startTime: '08:00',
        endTime: '17:00',
        activities: [
          { classId: 1, subject: '数学', startTime: '09:00', endTime: '10:00' },
          { classId: 2, subject: '语文', startTime: '10:30', endTime: '11:30' }
        ]
      };

      const response = await testHelper.post('/api/teachers/1/schedule', scheduleData, adminUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.dayOfWeek).toBe(scheduleData.dayOfWeek);
    });

    it('should validate schedule conflicts', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const conflictData = {
        dayOfWeek: 'Monday',
        startTime: '08:00',
        endTime: '17:00',
        activities: [
          { classId: 1, subject: '数学', startTime: '09:00', endTime: '11:00' },
          { classId: 2, subject: '语文', startTime: '10:00', endTime: '12:00' } // Conflict
        ]
      };

      const response = await testHelper.post('/api/teachers/1/schedule', conflictData, adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Schedule conflict detected');
    });
  });

  describe('DELETE /api/teachers/:id', () => {
    it('should delete teacher with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.delete('/api/teachers/1', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Teacher deleted successfully');
    });

    it('should fail to delete teacher with active classes', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.delete('/api/teachers/2', adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Cannot delete teacher with active classes');
    });

    it('should fail without admin permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.delete('/api/teachers/1', teacherUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
    });
  });
});