import { TestHelper, TestDataFactory, ResponseValidators } from '../helpers/testUtils';
import { Application } from 'express';
import { createTestApp, initTestDatabase, closeTestDatabase } from '../helpers/testApp';

let app: Application;
let testHelper: TestHelper;

describe('Enrollment API Tests', () => {
  beforeAll(async () => {
    await initTestDatabase();
    app = createTestApp();
    testHelper = new TestHelper(app);
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('GET /api/enrollment/plans', () => {
    it('should get enrollment plans list', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/enrollment/plans', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(ResponseValidators.hasValidPagination(response.body.data)).toBeTruthy();
      expect(Array.isArray(response.body.data.items)).toBeTruthy();
    });

    it('should filter plans by status', async () => {
      const publicResponse = await testHelper.public('get', '/api/enrollment/plans?status=进行中');

      expect(publicResponse.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(publicResponse)).toBeTruthy();
      if (publicResponse.body.data.items.length > 0) {
        publicResponse.body.data.items.forEach((plan: any) => {
          expect(plan.status).toBe('进行中');
        });
      }
    });

    it('should filter plans by target age', async () => {
      const parentUser = TestDataFactory.createUser({ role: 'parent' });
      const response = await testHelper.get('/api/enrollment/plans?targetAge=4', parentUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
    });

    it('should allow public access to active plans', async () => {
      const response = await testHelper.public('get', '/api/enrollment/plans?public=true');

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
    });
  });

  describe('POST /api/enrollment/plans', () => {
    it('should create enrollment plan with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const planData = TestDataFactory.createEnrollmentPlan({
        title: '2024年秋季招生',
        description: '面向3-6岁儿童的全面发展教育',
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        targetCount: 120,
        ageRange: '3-6岁',
        tuition: 2500,
        requirements: ['户口本', '疫苗证明', '体检报告'],
        features: ['双语教学', '艺术课程', '户外活动'],
        classTypes: [
          { grade: '小班', capacity: 15, count: 2 },
          { grade: '中班', capacity: 20, count: 2 },
          { grade: '大班', capacity: 25, count: 2 }
        ]
      });

      const response = await testHelper.post('/api/enrollment/plans', planData, adminUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.title).toBe(planData.title);
      expect(response.body.data.targetCount).toBe(planData.targetCount);
    });

    it('should validate date constraints', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const invalidData = TestDataFactory.createEnrollmentPlan({
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
        endDate: new Date() // Today (invalid)
      });

      const response = await testHelper.post('/api/enrollment/plans', invalidData, adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('End date must be after start date');
    });

    it('should validate target count', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const invalidData = TestDataFactory.createEnrollmentPlan({
        targetCount: 0 // Invalid count
      });

      const response = await testHelper.post('/api/enrollment/plans', invalidData, adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Target count must be greater than 0');
    });

    it('should fail without admin permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const planData = TestDataFactory.createEnrollmentPlan();

      const response = await testHelper.post('/api/enrollment/plans', planData, teacherUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
    });
  });

  describe('GET /api/enrollment/applications', () => {
    it('should get applications list with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/enrollment/applications', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(ResponseValidators.hasValidPagination(response.body.data)).toBeTruthy();
    });

    it('should filter applications by status', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/enrollment/applications?status=待审核', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      if (response.body.data.items.length > 0) {
        response.body.data.items.forEach((app: any) => {
          expect(app.status).toBe('待审核');
        });
      }
    });

    it('should filter applications by enrollment plan', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/enrollment/applications?planId=1', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
    });

    it('should allow parents to view their own applications', async () => {
      const parentUser = TestDataFactory.createUser({ id: 1, role: 'parent' });
      const response = await testHelper.get('/api/enrollment/applications/my-applications', parentUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });
  });

  describe('POST /api/enrollment/applications', () => {
    it('should submit enrollment application', async () => {
      const parentUser = TestDataFactory.createUser({ role: 'parent' });
      const applicationData = {
        enrollmentPlanId: 1,
        studentName: '新报名学生',
        studentGender: '男',
        studentBirthDate: '2021-03-15',
        studentIdCard: '123456789012345678',
        parentName: '家长姓名',
        parentPhone: '13900139001',
        parentEmail: 'parent@example.com',
        parentIdCard: '987654321098765432',
        preferredClassGrade: '小班',
        hasAllergies: false,
        medicalHistory: '',
        emergencyContact: {
          name: '紧急联系人',
          relationship: '祖父母',
          phone: '13800138001'
        },
        previousEducation: '无',
        specialNeeds: '',
        notes: '希望孩子能在贵园健康成长'
      };

      const response = await testHelper.post('/api/enrollment/applications', applicationData, parentUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.studentName).toBe(applicationData.studentName);
      expect(response.body.data.status).toBe('待审核');
    });

    it('should validate required documents', async () => {
      const parentUser = TestDataFactory.createUser({ role: 'parent' });
      const incompleteData = {
        enrollmentPlanId: 1,
        studentName: '测试学生',
        parentName: '测试家长',
        parentPhone: '13900139002'
        // Missing required fields
      };

      const response = await testHelper.post('/api/enrollment/applications', incompleteData, parentUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Missing required information');
    });

    it('should validate student age for enrollment plan', async () => {
      const parentUser = TestDataFactory.createUser({ role: 'parent' });
      const invalidAge = {
        enrollmentPlanId: 1,
        studentName: '年龄不符学生',
        studentBirthDate: '2023-01-01', // Too young
        parentName: '家长',
        parentPhone: '13900139003'
      };

      const response = await testHelper.post('/api/enrollment/applications', invalidAge, parentUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Student age does not meet enrollment requirements');
    });

    it('should check enrollment plan availability', async () => {
      const parentUser = TestDataFactory.createUser({ role: 'parent' });
      const applicationData = {
        enrollmentPlanId: 999, // Non-existent or closed plan
        studentName: '测试学生',
        parentName: '家长'
      };

      const response = await testHelper.post('/api/enrollment/applications', applicationData, parentUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Enrollment plan not available');
    });
  });

  describe('PUT /api/enrollment/applications/:id', () => {
    it('should update application status with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const updateData = {
        status: '已通过',
        reviewNotes: '材料齐全，符合招生要求',
        assignedClassId: 1,
        enrollmentDate: new Date().toISOString(),
        tuitionDiscount: 0
      };

      const response = await testHelper.put('/api/enrollment/applications/1', updateData, adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.status).toBe(updateData.status);
    });

    it('should send notification when status changes', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const updateData = {
        status: '需补充材料',
        reviewNotes: '请补充疫苗接种证明',
        notifyParent: true
      };

      const response = await testHelper.put('/api/enrollment/applications/1', updateData, adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.notificationSent).toBe(true);
    });

    it('should validate class assignment', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const updateData = {
        status: '已通过',
        assignedClassId: 99999 // Non-existent class
      };

      const response = await testHelper.put('/api/enrollment/applications/1', updateData, adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Invalid class assignment');
    });

    it('should allow parents to update their own applications before review', async () => {
      const parentUser = TestDataFactory.createUser({ id: 1, role: 'parent' });
      const updateData = {
        studentName: '更新的学生姓名',
        parentPhone: '13900139999',
        notes: '更新的备注信息'
      };

      const response = await testHelper.put('/api/enrollment/applications/1', updateData, parentUser);

      if (response.status === 200) {
        expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      } else {
        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Cannot update application after review');
      }
    });
  });

  describe('GET /api/enrollment/statistics', () => {
    it('should get enrollment statistics with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/enrollment/statistics', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('totalApplications');
      expect(response.body.data).toHaveProperty('approvedApplications');
      expect(response.body.data).toHaveProperty('pendingApplications');
      expect(response.body.data).toHaveProperty('enrollmentRate');
    });

    it('should get statistics by date range', async () => {
      const principalUser = TestDataFactory.createUser({ role: 'principal' });
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const response = await testHelper.get(`/api/enrollment/statistics?startDate=${startDate}&endDate=${endDate}`, principalUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
    });

    it('should get statistics by enrollment plan', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/enrollment/statistics?planId=1', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
    });

    it('should fail without proper permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/enrollment/statistics', teacherUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
    });
  });

  describe('POST /api/enrollment/interview', () => {
    it('should schedule interview', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const interviewData = {
        applicationId: 1,
        scheduledTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days later
        interviewerIds: [1, 2], // Teacher IDs
        location: '面试室A',
        duration: 30, // minutes
        requirements: ['带孩子一起来', '准备户口本原件'],
        notes: '请提前10分钟到达'
      };

      const response = await testHelper.post('/api/enrollment/interview', interviewData, adminUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('interviewId');
      expect(response.body.data.scheduledTime).toBeDefined();
    });

    it('should validate interviewer availability', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const conflictData = {
        applicationId: 2,
        scheduledTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Same time as above
        interviewerIds: [1], // Same interviewer
        location: '面试室B'
      };

      const response = await testHelper.post('/api/enrollment/interview', conflictData, adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Interviewer not available at scheduled time');
    });

    it('should notify parents of interview schedule', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const interviewData = {
        applicationId: 3,
        scheduledTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        interviewerIds: [2],
        notifyParent: true
      };

      const response = await testHelper.post('/api/enrollment/interview', interviewData, adminUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.notificationSent).toBe(true);
    });
  });

  describe('POST /api/enrollment/interview/:id/result', () => {
    it('should submit interview result', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const resultData = {
        overallRating: 4,
        academicReadiness: 4,
        socialSkills: 5,
        communicationSkills: 4,
        behaviorAssessment: 4,
        parentInteraction: 5,
        recommendations: '建议入读中班',
        concerns: '无特殊关注点',
        decision: 'recommend_approval',
        notes: '孩子表现良好，家长配合度高',
        followupRequired: false
      };

      const response = await testHelper.post('/api/enrollment/interview/1/result', resultData, teacherUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.overallRating).toBe(resultData.overallRating);
      expect(response.body.data.decision).toBe(resultData.decision);
    });

    it('should validate rating ranges', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const invalidData = {
        overallRating: 10, // Invalid rating
        academicReadiness: 3
      };

      const response = await testHelper.post('/api/enrollment/interview/1/result', invalidData, teacherUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Rating must be between 1 and 5');
    });

    it('should update application status based on interview result', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const approvalData = {
        overallRating: 5,
        decision: 'recommend_approval',
        updateApplicationStatus: true
      };

      const response = await testHelper.post('/api/enrollment/interview/1/result', approvalData, teacherUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.applicationStatusUpdated).toBe(true);
    });
  });

  describe('GET /api/enrollment/quotas', () => {
    it('should get enrollment quotas by grade', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/enrollment/quotas', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(Array.isArray(response.body.data)).toBeTruthy();
      if (response.body.data.length > 0) {
        response.body.data.forEach((quota: any) => {
          expect(quota).toHaveProperty('grade');
          expect(quota).toHaveProperty('totalQuota');
          expect(quota).toHaveProperty('availableQuota');
          expect(quota).toHaveProperty('reservedQuota');
        });
      }
    });

    it('should allow public access to quota information', async () => {
      const response = await testHelper.public('get', '/api/enrollment/quotas?public=true');

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
    });
  });

  describe('PUT /api/enrollment/quotas', () => {
    it('should update enrollment quotas with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const quotaData = {
        quotas: [
          { grade: '小班', totalQuota: 45, reservedQuota: 5 },
          { grade: '中班', totalQuota: 60, reservedQuota: 8 },
          { grade: '大班', totalQuota: 75, reservedQuota: 10 }
        ]
      };

      const response = await testHelper.put('/api/enrollment/quotas', quotaData, adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Quotas updated successfully');
    });

    it('should validate quota constraints', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const invalidData = {
        quotas: [
          { grade: '小班', totalQuota: 10, reservedQuota: 15 } // Reserved > Total
        ]
      };

      const response = await testHelper.put('/api/enrollment/quotas', invalidData, adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Reserved quota cannot exceed total quota');
    });

    it('should fail without admin permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const quotaData = {
        quotas: [{ grade: '小班', totalQuota: 30 }]
      };

      const response = await testHelper.put('/api/enrollment/quotas', quotaData, teacherUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
    });
  });
});