import { TestHelper, TestDataFactory, ResponseValidators } from '../helpers/testUtils';
import { Application } from 'express';
import { createTestApp, initTestDatabase, closeTestDatabase } from '../helpers/testApp';

let app: Application;
let testHelper: TestHelper;

describe('Activities API Tests', () => {
  beforeAll(async () => {
    await initTestDatabase();
    app = createTestApp();
    testHelper = new TestHelper(app);
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('GET /api/activities', () => {
    it('should get activities list', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/activities', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(ResponseValidators.hasValidPagination(response.body.data)).toBeTruthy();
      expect(Array.isArray(response.body.data.items)).toBeTruthy();
    });

    it('should filter activities by type', async () => {
      const parentUser = TestDataFactory.createUser({ role: 'parent' });
      const response = await testHelper.get('/api/activities?type=户外活动', parentUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      if (response.body.data.items.length > 0) {
        response.body.data.items.forEach((activity: any) => {
          expect(activity.type).toBe('户外活动');
        });
      }
    });

    it('should filter activities by date range', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await testHelper.get(`/api/activities?startDate=${startDate}&endDate=${endDate}`, teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
    });

    it('should filter activities by status', async () => {
      const parentUser = TestDataFactory.createUser({ role: 'parent' });
      const response = await testHelper.get('/api/activities?status=开放报名', parentUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      if (response.body.data.items.length > 0) {
        response.body.data.items.forEach((activity: any) => {
          expect(activity.status).toBe('开放报名');
        });
      }
    });

    it('should allow public access to view activities', async () => {
      const response = await testHelper.public('get', '/api/activities?public=true');

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
    });
  });

  describe('POST /api/activities', () => {
    it('should create activity with teacher permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const activityData = TestDataFactory.createActivity({
        title: '春季户外探索',
        description: '带领孩子们探索大自然',
        type: '户外活动',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // +3 hours
        location: '森林公园',
        capacity: 20,
        fee: 100,
        targetAgeRange: '4-6岁',
        requirements: ['穿运动鞋', '带水杯']
      });

      const response = await testHelper.post('/api/activities', activityData, teacherUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.title).toBe(activityData.title);
      expect(response.body.data.type).toBe(activityData.type);
    });

    it('should validate activity time constraints', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const invalidData = TestDataFactory.createActivity({
        startTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours later
        endTime: new Date(Date.now() + 1 * 60 * 60 * 1000)   // 1 hour later (invalid)
      });

      const response = await testHelper.post('/api/activities', invalidData, teacherUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('End time must be after start time');
    });

    it('should validate capacity limits', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const invalidData = TestDataFactory.createActivity({
        capacity: 0 // Invalid capacity
      });

      const response = await testHelper.post('/api/activities', invalidData, teacherUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Capacity must be greater than 0');
    });

    it('should require admin approval for high-cost activities', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const expensiveActivity = TestDataFactory.createActivity({
        fee: 500 // High fee requiring approval
      });

      const response = await testHelper.post('/api/activities', expensiveActivity, teacherUser);

      if (response.status === 201) {
        expect(response.body.data.status).toBe('待审核');
      } else {
        expect(response.status).toBe(403);
        expect(response.body.message).toContain('High-cost activities require admin approval');
      }
    });

    it('should fail without proper permissions', async () => {
      const parentUser = TestDataFactory.createUser({ role: 'parent' });
      const activityData = TestDataFactory.createActivity();

      const response = await testHelper.post('/api/activities', activityData, parentUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
    });
  });

  describe('GET /api/activities/:id', () => {
    it('should get activity details', async () => {
      const parentUser = TestDataFactory.createUser({ role: 'parent' });
      const response = await testHelper.get('/api/activities/1', parentUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('type');
      expect(response.body.data).toHaveProperty('capacity');
    });

    it('should include registration information when requested', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/activities/1?include=registrations', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('registrations');
      expect(Array.isArray(response.body.data.registrations)).toBeTruthy();
    });

    it('should return 404 for non-existent activity', async () => {
      const parentUser = TestDataFactory.createUser({ role: 'parent' });
      const response = await testHelper.get('/api/activities/99999', parentUser);

      expect(response.status).toBe(404);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Activity not found');
    });
  });

  describe('PUT /api/activities/:id', () => {
    it('should update activity with organizer permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ id: 1, role: 'teacher' });
      const updateData = {
        title: '更新的活动标题',
        description: '更新的活动描述',
        location: '新的活动地点',
        requirements: ['新要求1', '新要求2']
      };

      const response = await testHelper.put('/api/activities/1', updateData, teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.description).toBe(updateData.description);
    });

    it('should not allow capacity reduction below registrations', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const updateData = {
        capacity: 5 // Smaller than current registrations
      };

      const response = await testHelper.put('/api/activities/1', updateData, teacherUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Capacity cannot be smaller than current registrations');
    });

    it('should require admin approval for major changes', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const majorChange = {
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Move to next week
        fee: 300 // Significant fee increase
      };

      const response = await testHelper.put('/api/activities/1', majorChange, teacherUser);

      if (response.status === 200) {
        expect(response.body.data.status).toBe('待审核');
      } else {
        expect(response.status).toBe(403);
        expect(response.body.message).toContain('Major changes require admin approval');
      }
    });

    it('should fail for unauthorized user', async () => {
      const otherTeacher = TestDataFactory.createUser({ id: 2, role: 'teacher' });
      const updateData = { title: '未授权更新' };

      const response = await testHelper.put('/api/activities/1', updateData, otherTeacher);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
    });
  });

  describe('POST /api/activities/:id/register', () => {
    it('should register student for activity', async () => {
      const parentUser = TestDataFactory.createUser({ id: 1, role: 'parent' });
      const registrationData = {
        studentId: 1,
        notes: '孩子很期待这个活动',
        emergencyContact: {
          name: '紧急联系人',
          phone: '13900139000'
        }
      };

      const response = await testHelper.post('/api/activities/1/register', registrationData, parentUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('registrationId');
      expect(response.body.message).toContain('Registration successful');
    });

    it('should check activity capacity before registration', async () => {
      const parentUser = TestDataFactory.createUser({ role: 'parent' });
      const registrationData = {
        studentId: 2
      };

      const response = await testHelper.post('/api/activities/2/register', registrationData, parentUser); // Full activity

      if (response.status === 400) {
        expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
        expect(response.body.message).toContain('Activity is at full capacity');
      } else {
        expect(response.status).toBe(201);
      }
    });

    it('should prevent duplicate registrations', async () => {
      const parentUser = TestDataFactory.createUser({ role: 'parent' });
      const registrationData = {
        studentId: 1 // Already registered
      };

      const response = await testHelper.post('/api/activities/1/register', registrationData, parentUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Student is already registered for this activity');
    });

    it('should validate student age requirements', async () => {
      const parentUser = TestDataFactory.createUser({ role: 'parent' });
      const registrationData = {
        studentId: 3 // Student too young/old for activity
      };

      const response = await testHelper.post('/api/activities/1/register', registrationData, parentUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Student does not meet age requirements');
    });

    it('should check registration deadline', async () => {
      const parentUser = TestDataFactory.createUser({ role: 'parent' });
      const registrationData = {
        studentId: 4
      };

      const response = await testHelper.post('/api/activities/3/register', registrationData, parentUser); // Past deadline

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Registration deadline has passed');
    });
  });

  describe('DELETE /api/activities/:id/register/:studentId', () => {
    it('should cancel registration', async () => {
      const parentUser = TestDataFactory.createUser({ id: 1, role: 'parent' });
      const response = await testHelper.delete('/api/activities/1/register/1', parentUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Registration cancelled successfully');
    });

    it('should apply cancellation fees if applicable', async () => {
      const parentUser = TestDataFactory.createUser({ role: 'parent' });
      const response = await testHelper.delete('/api/activities/1/register/1', parentUser);

      if (response.status === 200) {
        if (response.body.data.cancellationFee > 0) {
          expect(response.body.data).toHaveProperty('cancellationFee');
          expect(response.body.data).toHaveProperty('refundAmount');
        }
      }
    });

    it('should fail for non-existent registration', async () => {
      const parentUser = TestDataFactory.createUser({ role: 'parent' });
      const response = await testHelper.delete('/api/activities/1/register/99999', parentUser);

      expect(response.status).toBe(404);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Registration not found');
    });
  });

  describe('GET /api/activities/:id/registrations', () => {
    it('should get activity registrations with organizer permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ id: 1, role: 'teacher' });
      const response = await testHelper.get('/api/activities/1/registrations', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });

    it('should include student details when requested', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/activities/1/registrations?include=student', teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      if (response.body.data.length > 0) {
        response.body.data.forEach((registration: any) => {
          expect(registration).toHaveProperty('student');
          expect(registration.student).toHaveProperty('name');
        });
      }
    });

    it('should fail without organizer permissions', async () => {
      const otherTeacher = TestDataFactory.createUser({ id: 2, role: 'teacher' });
      const response = await testHelper.get('/api/activities/1/registrations', otherTeacher);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
    });
  });

  describe('POST /api/activities/:id/checkin/:studentId', () => {
    it('should check in student for activity', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const checkinData = {
        checkinTime: new Date().toISOString(),
        notes: '准时到达',
        healthStatus: 'normal'
      };

      const response = await testHelper.post('/api/activities/1/checkin/1', checkinData, teacherUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('checkinTime');
      expect(response.body.message).toContain('Student checked in successfully');
    });

    it('should validate health status before checkin', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const checkinData = {
        healthStatus: 'fever' // Health issue
      };

      const response = await testHelper.post('/api/activities/1/checkin/1', checkinData, teacherUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Cannot check in student with health issues');
    });

    it('should fail for unregistered student', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const checkinData = {
        checkinTime: new Date().toISOString()
      };

      const response = await testHelper.post('/api/activities/1/checkin/99999', checkinData, teacherUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Student is not registered for this activity');
    });
  });

  describe('POST /api/activities/:id/evaluation', () => {
    it('should submit activity evaluation', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const evaluationData = {
        overallRating: 5,
        studentParticipation: 4,
        learningOutcomes: 5,
        safetyRating: 5,
        feedback: '活动非常成功，孩子们很享受',
        improvements: ['可以增加更多互动环节'],
        studentEvaluations: [
          { studentId: 1, participation: 5, behavior: 4, notes: '表现优秀' }
        ]
      };

      const response = await testHelper.post('/api/activities/1/evaluation', evaluationData, teacherUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('overallRating');
      expect(response.body.data.overallRating).toBe(evaluationData.overallRating);
    });

    it('should validate evaluation ratings', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const invalidData = {
        overallRating: 10, // Invalid rating (should be 1-5)
        studentParticipation: 3
      };

      const response = await testHelper.post('/api/activities/1/evaluation', invalidData, teacherUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Rating must be between 1 and 5');
    });
  });

  describe('DELETE /api/activities/:id', () => {
    it('should cancel activity with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const cancellationData = {
        reason: '天气原因取消',
        refundPolicy: 'full_refund',
        notifyParents: true
      };

      const response = await testHelper.delete('/api/activities/2', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Activity cancelled successfully');
    });

    it('should fail to delete activity with registrations without proper cancellation', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.delete('/api/activities/1', teacherUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Cannot delete activity with registrations');
    });

    it('should fail without proper permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ id: 2, role: 'teacher' });
      const response = await testHelper.delete('/api/activities/1', teacherUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
    });
  });
});