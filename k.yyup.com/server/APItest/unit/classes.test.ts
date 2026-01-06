import { TestHelper, TestDataFactory, ResponseValidators } from '../helpers/testUtils';
import { Application } from 'express';
import { createTestApp, initTestDatabase, closeTestDatabase } from '../helpers/testApp';

let app: Application;
let testHelper: TestHelper;

describe('Classes API Tests', () => {
  beforeAll(async () => {
    await initTestDatabase();
    app = createTestApp();
    testHelper = new TestHelper(app);
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('GET /api/classes', () => {
    it('should get classes list with proper permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/classes', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(ResponseValidators.hasValidPagination(response.body.data)).toBeTruthy();
      expect(Array.isArray(response.body.data.items)).toBeTruthy();
    });

    it('should filter classes by grade', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/classes?grade=大班', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      if (response.body.data.items.length > 0) {
        response.body.data.items.forEach((classItem: any) => {
          expect(classItem.grade).toBe('大班');
        });
      }
    });

    it('should include student count when requested', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/classes?include=students', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      if (response.body.data.items.length > 0) {
        response.body.data.items.forEach((classItem: any) => {
          expect(classItem).toHaveProperty('currentCount');
          expect(typeof classItem.currentCount).toBe('number');
        });
      }
    });

    it('should allow teacher to view assigned classes only', async () => {
      const teacherUser = TestDataFactory.createUser({ id: 1, role: 'teacher' });
      const response = await testHelper.get('/api/classes/my-classes', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });

    it('should fail without authentication', async () => {
      const response = await testHelper.public('get', '/api/classes');

      expect(response.status).toBe(401);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
    });
  });

  describe('POST /api/classes', () => {
    it('should create class with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const classData = TestDataFactory.createClass({
        name: '新班级A',
        grade: '中班',
        capacity: 25,
        teacherId: 1,
        description: '4-5岁儿童班级',
        classroom: 'A101'
      });

      const response = await testHelper.post('/api/classes', classData, adminUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.name).toBe(classData.name);
      expect(response.body.data.grade).toBe(classData.grade);
      expect(response.body.data.capacity).toBe(classData.capacity);
    });

    it('should validate capacity limits', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const invalidData = TestDataFactory.createClass({
        capacity: 0 // Invalid capacity
      });

      const response = await testHelper.post('/api/classes', invalidData, adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Capacity must be greater than 0');
    });

    it('should validate teacher assignment', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const invalidData = TestDataFactory.createClass({
        teacherId: 99999 // Non-existent teacher
      });

      const response = await testHelper.post('/api/classes', invalidData, adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Invalid teacher ID');
    });

    it('should fail without admin permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const classData = TestDataFactory.createClass();

      const response = await testHelper.post('/api/classes', classData, teacherUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
    });
  });

  describe('GET /api/classes/:id', () => {
    it('should get class details with teacher permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/classes/1', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('grade');
      expect(response.body.data).toHaveProperty('capacity');
    });

    it('should include students when requested', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/classes/1?include=students', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('students');
      expect(Array.isArray(response.body.data.students)).toBeTruthy();
    });

    it('should return 404 for non-existent class', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/classes/99999', teacherUser);

      expect(response.status).toBe(404);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Class not found');
    });
  });

  describe('PUT /api/classes/:id', () => {
    it('should update class with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const updateData = {
        name: '更新班级名称',
        capacity: 30,
        description: '更新的班级描述',
        classroom: 'B202'
      };

      const response = await testHelper.put('/api/classes/1', updateData, adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.capacity).toBe(updateData.capacity);
    });

    it('should validate capacity when updating', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const updateData = {
        capacity: 10 // Smaller than current student count
      };

      const response = await testHelper.put('/api/classes/1', updateData, adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Capacity cannot be smaller than current student count');
    });

    it('should allow principal to update class details', async () => {
      const principalUser = TestDataFactory.createUser({ role: 'principal' });
      const updateData = {
        description: '园长更新的描述',
        schedule: {
          Monday: '08:00-17:00',
          Tuesday: '08:00-17:00'
        }
      };

      const response = await testHelper.put('/api/classes/1', updateData, principalUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
    });

    it('should fail without proper permissions', async () => {
      const parentUser = TestDataFactory.createUser({ role: 'parent' });
      const updateData = { name: '家长尝试更新' };

      const response = await testHelper.put('/api/classes/1', updateData, parentUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
    });
  });

  describe('GET /api/classes/:id/students', () => {
    it('should get class student list', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/classes/1/students', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });

    it('should include student details when requested', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/classes/1/students?include=parent', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      if (response.body.data.length > 0) {
        response.body.data.forEach((student: any) => {
          expect(student).toHaveProperty('name');
          if (student.parent) {
            expect(student.parent).toHaveProperty('name');
            expect(student.parent).toHaveProperty('phone');
          }
        });
      }
    });

    it('should allow parents to view their children in class', async () => {
      const parentUser = TestDataFactory.createUser({ id: 1, role: 'parent' });
      const response = await testHelper.get('/api/classes/1/students/my-children', parentUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
    });
  });

  describe('POST /api/classes/:id/add-student', () => {
    it('should add student to class', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const addData = {
        studentId: 1,
        enrollmentDate: new Date().toISOString(),
        notes: '转班学生'
      };

      const response = await testHelper.post('/api/classes/1/add-student', addData, adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Student added to class successfully');
    });

    it('should check class capacity before adding', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const addData = {
        studentId: 2,
        enrollmentDate: new Date().toISOString()
      };

      const response = await testHelper.post('/api/classes/1/add-student', addData, adminUser);

      // Assuming class is at capacity
      if (response.status === 400) {
        expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
        expect(response.body.message).toContain('Class is at full capacity');
      } else {
        expect(response.status).toBe(200);
      }
    });

    it('should validate student availability', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const addData = {
        studentId: 1, // Already in a class
        enrollmentDate: new Date().toISOString()
      };

      const response = await testHelper.post('/api/classes/1/add-student', addData, adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Student is already enrolled in a class');
    });
  });

  describe('DELETE /api/classes/:id/remove-student/:studentId', () => {
    it('should remove student from class', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.delete('/api/classes/1/remove-student/1', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Student removed from class successfully');
    });

    it('should fail for non-existent student in class', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.delete('/api/classes/1/remove-student/99999', adminUser);

      expect(response.status).toBe(404);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Student not found in this class');
    });
  });

  describe('GET /api/classes/:id/schedule', () => {
    it('should get class schedule', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/classes/1/schedule', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('weeklySchedule');
    });

    it('should allow parents to view their child class schedule', async () => {
      const parentUser = TestDataFactory.createUser({ id: 1, role: 'parent' });
      const response = await testHelper.get('/api/classes/1/schedule', parentUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
    });
  });

  describe('POST /api/classes/:id/schedule', () => {
    it('should create class schedule', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const scheduleData = {
        weeklySchedule: {
          Monday: [
            { startTime: '09:00', endTime: '10:00', subject: '数学', teacherId: 1 },
            { startTime: '10:30', endTime: '11:30', subject: '语文', teacherId: 1 }
          ],
          Tuesday: [
            { startTime: '09:00', endTime: '10:00', subject: '音乐', teacherId: 2 }
          ]
        }
      };

      const response = await testHelper.post('/api/classes/1/schedule', scheduleData, adminUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('weeklySchedule');
    });

    it('should validate teacher availability', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const conflictData = {
        weeklySchedule: {
          Monday: [
            { startTime: '09:00', endTime: '10:00', subject: '数学', teacherId: 1 },
            { startTime: '09:30', endTime: '10:30', subject: '语文', teacherId: 1 } // Conflict
          ]
        }
      };

      const response = await testHelper.post('/api/classes/1/schedule', conflictData, adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Teacher schedule conflict');
    });
  });

  describe('DELETE /api/classes/:id', () => {
    it('should delete empty class with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.delete('/api/classes/3', adminUser); // Empty class

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Class deleted successfully');
    });

    it('should fail to delete class with students', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.delete('/api/classes/1', adminUser); // Class with students

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Cannot delete class with enrolled students');
    });

    it('should fail without admin permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.delete('/api/classes/1', teacherUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
    });
  });

  describe('GET /api/classes/:id/activities', () => {
    it('should get class activities', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/classes/1/activities', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });

    it('should filter activities by date range', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await testHelper.get(`/api/classes/1/activities?startDate=${startDate}&endDate=${endDate}`, teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
    });
  });
});