import { describe, it, expect, beforeEach, afterEach } from 'jest';
import request from 'supertest';
import app from '../../src/app';
import { sequelize } from '../../src/config/database';
import { TestDataFactory } from '../utils/test-data-factory';
import { ApiTestHelper } from '../utils/api-test-helper';

describe('Key Business API Tests', () => {
  let testHelper: ApiTestHelper;
  let testDataFactory: TestDataFactory;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    testHelper = new ApiTestHelper();
    testDataFactory = new TestDataFactory();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await testDataFactory.clearDatabase();
  });

  describe('Student Management APIs', () => {
    it('POST /api/students - should create a new student', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const studentData = {
        name: '张小明',
        gender: '男',
        birthDate: '2020-03-15',
        parentId: 1,
        classId: 1,
        enrollmentDate: '2025-09-01',
        status: 'active'
      };

      const response = await testHelper.post('/api/students', studentData, adminUser);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('张小明');
      expect(response.body.data.id).toBeDefined();
    });

    it('GET /api/students - should get students list with pagination', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      // Create test students
      await testDataFactory.createStudent({ name: '学生1' });
      await testDataFactory.createStudent({ name: '学生2' });
      await testDataFactory.createStudent({ name: '学生3' });

      const response = await testHelper.get('/api/students?page=1&limit=10', adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(3);
      expect(response.body.pagination).toBeDefined();
    });

    it('GET /api/students/:id - should get student details', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const student = await testDataFactory.createStudent({ name: '测试学生' });

      const response = await testHelper.get(`/api/students/${student.id}`, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('测试学生');
      expect(response.body.data.id).toBe(student.id);
    });

    it('PUT /api/students/:id - should update student information', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const student = await testDataFactory.createStudent({ name: '原姓名' });
      const updateData = {
        name: '新姓名',
        status: 'inactive'
      };

      const response = await testHelper.put(`/api/students/${student.id}`, updateData, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('新姓名');
      expect(response.body.data.status).toBe('inactive');
    });

    it('DELETE /api/students/:id - should delete a student', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const student = await testDataFactory.createStudent();

      const response = await testHelper.delete(`/api/students/${student.id}`, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify deletion
      const getResponse = await testHelper.get(`/api/students/${student.id}`, adminUser);
      expect(getResponse.status).toBe(404);
    });
  });

  describe('Teacher Management APIs', () => {
    it('POST /api/teachers - should create a new teacher', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const teacherData = {
        name: '李老师',
        gender: '女',
        subject: '语文',
        phone: '13900139000',
        email: 'liteacher@example.com',
        hireDate: '2023-09-01',
        status: 'active'
      };

      const response = await testHelper.post('/api/teachers', teacherData, adminUser);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('李老师');
      expect(response.body.data.subject).toBe('语文');
    });

    it('GET /api/teachers - should get teachers list with filters', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      // Create test teachers
      await testDataFactory.createTeacher({ name: '王老师', subject: '数学' });
      await testDataFactory.createTeacher({ name: '张老师', subject: '语文' });

      const response = await testHelper.get('/api/teachers?subject=语文', adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].subject).toBe('语文');
    });

    it('GET /api/teachers/:id - should get teacher details with classes', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const teacher = await testDataFactory.createTeacher({ name: '测试老师' });
      
      // Assign teacher to class
      await testDataFactory.createClass({ teacherId: teacher.id });

      const response = await testHelper.get(`/api/teachers/${teacher.id}`, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('测试老师');
      expect(response.body.data.classes).toBeDefined();
    });

    it('PUT /api/teachers/:id - should update teacher assignment', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const teacher = await testDataFactory.createTeacher();
      const updateData = {
        subject: '英语',
        status: 'active'
      };

      const response = await testHelper.put(`/api/teachers/${teacher.id}`, updateData, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.subject).toBe('英语');
    });

    it('GET /api/teachers/:id/schedule - should get teacher schedule', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const teacher = await testDataFactory.createTeacher();

      const response = await testHelper.get(`/api/teachers/${teacher.id}/schedule`, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.schedule).toBeDefined();
    });
  });

  describe('Class Management APIs', () => {
    it('POST /api/classes - should create a new class', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const teacher = await testDataFactory.createTeacher();
      const classData = {
        name: '小班A',
        grade: '小班',
        teacherId: teacher.id,
        capacity: 25,
        room: '101教室',
        academicYear: '2025-2026'
      };

      const response = await testHelper.post('/api/classes', classData, adminUser);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('小班A');
      expect(response.body.data.teacherId).toBe(teacher.id);
    });

    it('GET /api/classes - should get classes list with statistics', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const teacher = await testDataFactory.createTeacher();
      
      // Create test classes
      await testDataFactory.createClass({ name: '小班A', teacherId: teacher.id });
      await testDataFactory.createClass({ name: '中班A', teacherId: teacher.id });

      const response = await testHelper.get('/api/classes', adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].statistics).toBeDefined();
    });

    it('PUT /api/classes/:id - should update class information', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const classObj = await testDataFactory.createClass();
      const updateData = {
        capacity: 30,
        room: '102教室'
      };

      const response = await testHelper.put(`/api/classes/${classObj.id}`, updateData, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.capacity).toBe(30);
      expect(response.body.data.room).toBe('102教室');
    });

    it('POST /api/classes/:id/students - should assign students to class', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const classObj = await testDataFactory.createClass();
      const student1 = await testDataFactory.createStudent();
      const student2 = await testDataFactory.createStudent();

      const assignmentData = {
        studentIds: [student1.id, student2.id]
      };

      const response = await testHelper.post(`/api/classes/${classObj.id}/students`, assignmentData, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.assignedStudents).toBe(2);
    });

    it('GET /api/classes/:id/students - should get class students list', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const classObj = await testDataFactory.createClass();
      const student = await testDataFactory.createStudent();
      
      // Assign student to class
      await testHelper.post(`/api/classes/${classObj.id}/students`, { studentIds: [student.id] }, adminUser);

      const response = await testHelper.get(`/api/classes/${classObj.id}/students`, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].id).toBe(student.id);
    });
  });

  describe('Enrollment Management APIs', () => {
    it('POST /api/enrollment/applications - should submit enrollment application', async () => {
      const parentUser = await testDataFactory.createUser({ role: 'parent' });
      const applicationData = {
        studentName: '王小明',
        gender: '男',
        birthDate: '2020-05-10',
        parentName: '王爸爸',
        parentPhone: '13700137000',
        parentEmail: 'wangbaba@example.com',
        address: '北京市朝阳区',
        desiredClass: '小班',
        applicationDate: '2025-09-13'
      };

      const response = await testHelper.post('/api/enrollment/applications', applicationData, parentUser);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.studentName).toBe('王小明');
      expect(response.body.data.status).toBe('pending');
    });

    it('GET /api/enrollment/applications - should get applications list', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      // Create test applications
      await testDataFactory.createEnrollmentApplication({ studentName: '申请1' });
      await testDataFactory.createEnrollmentApplication({ studentName: '申请2' });

      const response = await testHelper.get('/api/enrollment/applications', adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('PUT /api/enrollment/applications/:id/status - should update application status', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const application = await testDataFactory.createEnrollmentApplication();
      const statusUpdate = {
        status: 'approved',
        comments: '符合入园条件'
      };

      const response = await testHelper.put(`/api/enrollment/applications/${application.id}/status`, statusUpdate, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('approved');
    });

    it('POST /api/enrollment/applications/:id/interview - should schedule interview', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const application = await testDataFactory.createEnrollmentApplication();
      const interviewData = {
        interviewDate: '2025-09-20T10:00:00Z',
        interviewerId: 1,
        location: '园长办公室',
        notes: '请携带相关证件'
      };

      const response = await testHelper.post(`/api/enrollment/applications/${application.id}/interview`, interviewData, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.interviewDate).toBe('2025-09-20T10:00:00Z');
    });

    it('GET /api/enrollment/statistics - should get enrollment statistics', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });

      const response = await testHelper.get('/api/enrollment/statistics', adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalApplications).toBeDefined();
      expect(response.body.data.byStatus).toBeDefined();
      expect(response.body.data.byClass).toBeDefined();
    });
  });

  describe('Finance Management APIs', () => {
    it('POST /api/finance/tuition-plans - should create tuition plan', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const planData = {
        name: '2025年学费标准',
        grade: '小班',
        tuitionFee: 50000,
        mealFee: 12000,
        materialFee: 3000,
        totalAmount: 65000,
        academicYear: '2025-2026',
        effectiveDate: '2025-09-01'
      };

      const response = await testHelper.post('/api/finance/tuition-plans', planData, adminUser);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('2025年学费标准');
      expect(response.body.data.totalAmount).toBe(65000);
    });

    it('GET /api/finance/tuition-plans - should get tuition plans', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      await testDataFactory.createTuitionPlan({ name: '小班学费' });
      await testDataFactory.createTuitionPlan({ name: '中班学费' });

      const response = await testHelper.get('/api/finance/tuition-plans', adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('POST /api/finance/payments - should record payment', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const student = await testDataFactory.createStudent();
      const paymentData = {
        studentId: student.id,
        amount: 65000,
        paymentMethod: 'bank_transfer',
        paymentDate: '2025-09-13',
        transactionId: 'TXN20250913001',
        notes: '学费缴纳'
      };

      const response = await testHelper.post('/api/finance/payments', paymentData, adminUser);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(65000);
      expect(response.body.data.studentId).toBe(student.id);
    });

    it('GET /api/finance/payments - should get payments with filters', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const student = await testDataFactory.createStudent();
      
      await testDataFactory.createPayment({ studentId: student.id, amount: 65000 });
      await testDataFactory.createPayment({ studentId: student.id, amount: 12000 });

      const response = await testHelper.get(`/api/finance/payments?studentId=${student.id}`, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].studentId).toBe(student.id);
    });

    it('GET /api/finance/reports - should get financial reports', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });

      const response = await testHelper.get('/api/finance/reports?type=monthly&year=2025', adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.revenue).toBeDefined();
      expect(response.body.data.expenses).toBeDefined();
      expect(response.body.data.profit).toBeDefined();
    });
  });

  describe('Attendance Management APIs', () => {
    it('POST /api/attendance/check-in - should record student check-in', async () => {
      const teacherUser = await testDataFactory.createUser({ role: 'teacher' });
      const student = await testDataFactory.createStudent();
      const checkInData = {
        studentId: student.id,
        checkInTime: '2025-09-13T08:30:00Z',
        method: 'face_recognition',
        temperature: 36.5,
        notes: '正常到园'
      };

      const response = await testHelper.post('/api/attendance/check-in', checkInData, teacherUser);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.studentId).toBe(student.id);
      expect(response.body.data.checkInTime).toBeDefined();
    });

    it('POST /api/attendance/check-out - should record student check-out', async () => {
      const teacherUser = await testDataFactory.createUser({ role: 'teacher' });
      const student = await testDataFactory.createStudent();
      
      // First check-in
      await testHelper.post('/api/attendance/check-in', {
        studentId: student.id,
        checkInTime: '2025-09-13T08:30:00Z'
      }, teacherUser);

      const checkOutData = {
        studentId: student.id,
        checkOutTime: '2025-09-13T16:30:00Z',
        pickupPerson: '妈妈',
        notes: '正常离园'
      };

      const response = await testHelper.post('/api/attendance/check-out', checkOutData, teacherUser);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.checkOutTime).toBeDefined();
    });

    it('GET /api/attendance/daily - should get daily attendance report', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const date = '2025-09-13';

      const response = await testHelper.get(`/api/attendance/daily?date=${date}`, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.date).toBe(date);
      expect(response.body.data.statistics).toBeDefined();
    });

    it('GET /api/attendance/student/:id - should get student attendance history', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const student = await testDataFactory.createStudent();

      const response = await testHelper.get(`/api/attendance/student/${student.id}`, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.studentId).toBe(student.id);
      expect(response.body.data.records).toBeDefined();
    });
  });

  describe('Activity Management APIs', () => {
    it('POST /api/activities - should create new activity', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const activityData = {
        title: '秋季亲子运动会',
        description: '家长和小朋友一起参与的运动会',
        activityDate: '2025-10-15',
        startTime: '09:00',
        endTime: '12:00',
        location: '幼儿园操场',
        maxParticipants: 100,
        targetAudience: 'all_students'
      };

      const response = await testHelper.post('/api/activities', activityData, adminUser);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('秋季亲子运动会');
      expect(response.body.data.maxParticipants).toBe(100);
    });

    it('GET /api/activities - should get activities list', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      await testDataFactory.createActivity({ title: '活动1' });
      await testDataFactory.createActivity({ title: '活动2' });

      const response = await testHelper.get('/api/activities', adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('POST /api/activities/:id/registrations - should register for activity', async () => {
      const parentUser = await testDataFactory.createUser({ role: 'parent' });
      const activity = await testDataFactory.createActivity();
      const registrationData = {
        studentId: 1,
        parentName: '张妈妈',
        parentPhone: '13800138000',
        emergencyContact: '张爸爸 13900139000',
        notes: '需要特殊照顾'
      };

      const response = await testHelper.post(`/api/activities/${activity.id}/registrations`, registrationData, parentUser);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activityId).toBe(activity.id);
    });

    it('GET /api/activities/:id/registrations - should get activity registrations', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const activity = await testDataFactory.createActivity();

      const response = await testHelper.get(`/api/activities/${activity.id}/registrations`, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.registrations).toBeDefined();
    });
  });

  describe('Parent Communication APIs', () => {
    it('POST /api/communications/messages - should send message to parents', async () => {
      const teacherUser = await testDataFactory.createUser({ role: 'teacher' });
      const messageData = {
        recipientType: 'class',
        recipientId: 1,
        subject: '明日活动通知',
        content: '明天上午有亲子活动，请家长准时参加',
        messageType: 'announcement',
        priority: 'normal'
      };

      const response = await testHelper.post('/api/communications/messages', messageData, teacherUser);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.subject).toBe('明日活动通知');
    });

    it('GET /api/communications/messages - should get messages list', async () => {
      const parentUser = await testDataFactory.createUser({ role: 'parent' });

      const response = await testHelper.get('/api/communications/messages', parentUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toBeDefined();
    });

    it('POST /api/communications/messages/:id/read - should mark message as read', async () => {
      const parentUser = await testDataFactory.createUser({ role: 'parent' });
      const message = await testDataFactory.createMessage();

      const response = await testHelper.post(`/api/communications/messages/${message.id}/read`, {}, parentUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.readAt).toBeDefined();
    });

    it('GET /api/communications/announcements - should get announcements', async () => {
      const parentUser = await testDataFactory.createUser({ role: 'parent' });

      const response = await testHelper.get('/api/communications/announcements', parentUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.announcements).toBeDefined();
    });
  });

  describe('System Configuration APIs', () => {
    it('GET /api/system/settings - should get system settings', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });

      const response = await testHelper.get('/api/system/settings', adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.settings).toBeDefined();
    });

    it('PUT /api/system/settings - should update system settings', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const settingsData = {
        schoolName: '阳光幼儿园',
        academicYear: '2025-2026',
        semester: 'fall',
        timezone: 'Asia/Shanghai',
        language: 'zh-CN'
      };

      const response = await testHelper.put('/api/system/settings', settingsData, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.schoolName).toBe('阳光幼儿园');
    });

    it('GET /api/system/logs - should get system logs', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });

      const response = await testHelper.get('/api/system/logs?type=system&limit=50', adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.logs).toBeDefined();
    });

    it('POST /api/system/backup - should create system backup', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const backupData = {
        type: 'full',
        includeFiles: true,
        description: 'Regular backup'
      };

      const response = await testHelper.post('/api/system/backup', backupData, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.backupId).toBeDefined();
    });
  });

  describe('API Response Validation', () => {
    it('should return consistent response format', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });

      const response = await testHelper.get('/api/students', adminUser);
      
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should handle pagination parameters correctly', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });

      const response = await testHelper.get('/api/students?page=2&limit=5', adminUser);
      
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should validate required fields in requests', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const invalidStudentData = {
        name: '测试学生'
        // Missing required fields
      };

      const response = await testHelper.post('/api/students', invalidStudentData, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
  });
});