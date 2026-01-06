/**
 * 完整用户操作流程测试
 * 模拟真实用户在系统中的完整操作流程
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../../server/src/app';
import {
import { authApi } from '@/api/auth';

  RealEnvironmentManager,
  TestUtils
} from './real-env.config';

describe('Complete User Workflow Integration Tests', () => {
  let envManager: RealEnvironmentManager;
  let testEnv: any;

  beforeAll(async () => {
    envManager = RealEnvironmentManager.getInstance();
    await envManager.initializeEnvironment();
    testEnv = envManager.getEnvironment();
  }, 60000);

  afterAll(async () => {
    await envManager.cleanupEnvironment();
  }, 30000);

  beforeEach(async () => {
    await TestUtils.wait(100);
  });

  afterEach(async () => {
    await TestUtils.wait(100);
  });

  describe('教师完整工作流程', () => {
    it('应该完成教师的日常工作流程', async () => {
      // 1. 教师登录
      const teacher = testEnv.testUsers.find((u: any) => u.role === 'teacher');
      expect(teacher).toBeDefined();

      const loginResponse = await request(app)
        .post('/api/auth/unified-login')
        .send({
          username: teacher.username,
          password: teacher.password
        });

      expect(loginResponse.status).toBe(200);
      const teacherToken = loginResponse.body.data.token;
      const teacherId = loginResponse.body.data.user.id;

      // 2. 查看今日课程安排
      const scheduleResponse = await request(app)
        .get('/api/schedule/today')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(scheduleResponse.status).toBe(200);
      expect(scheduleResponse.body.data.items).toBeDefined();

      // 3. 查看我的班级
      const myClassesResponse = await request(app)
        .get('/api/classes/my-classes')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(myClassesResponse.status).toBe(200);
      expect(myClassesResponse.body.data.items.length).toBeGreaterThanOrEqual(1);

      const myClass = myClassesResponse.body.data.items[0];

      // 4. 查看班级学生列表
      const studentsResponse = await request(app)
        .get(`/api/classes/${myClass.id}/students`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(studentsResponse.status).toBe(200);
      expect(studentsResponse.body.data.items.length).toBeGreaterThanOrEqual(1);

      // 5. 进行学生考勤
      const today = new Date().toISOString().split('T')[0];
      const attendanceRecords = studentsResponse.body.data.items.map((student: any) => ({
        studentId: student.id,
        status: Math.random() > 0.1 ? 'present' : 'absent',
        notes: Math.random() > 0.8 ? '身体不适' : undefined
      }));

      const attendanceResponse = await request(app)
        .post('/api/attendance/take')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          classId: myClass.id,
          date: today,
          records: attendanceRecords
        });

      expect(attendanceResponse.status).toBe(201);
      expect(attendanceResponse.body.data.recordsCount).toBe(attendanceRecords.length);

      // 6. 创建教学活动
      const activityData = {
        title: '数学启蒙活动',
        description: '通过游戏学习基础数学概念',
        type: 'educational',
        classId: myClass.id,
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2小时后
        duration: 30,
        materials: '数字卡片、计数玩具',
        objectives: ['认识数字1-10', '基础加减法概念']
      };

      const activityResponse = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(activityData);

      expect(activityResponse.status).toBe(201);
      const activityId = activityResponse.body.data.id;

      // 7. 进行活动评估
      const evaluationData = {
        activityId: activityId,
        overallRating: 5,
        studentParticipation: 'active',
        learningOutcomes: '大部分学生掌握了基本概念',
        improvements: '增加更多互动环节',
        nextSteps: '继续巩固数字认知'
      };

      const evaluationResponse = await request(app)
        .post(`/api/activities/${activityId}/evaluation`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(evaluationData);

      expect(evaluationResponse.status).toBe(201);

      // 8. 记录教学观察
      const observationData = {
        studentId: studentsResponse.body.data.items[0].id,
        date: today,
        domain: 'cognitive',
        observation: '在数学活动中表现出浓厚兴趣',
        level: 'developing',
        evidence: '能够正确识别1-5的数字',
        nextAction: '继续加强数字认知训练'
      };

      const observationResponse = await request(app)
        .post('/api/teaching-observations')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(observationData);

      expect(observationResponse.status).toBe(201);

      // 9. 与家长沟通
      const communicationData = {
        studentId: studentsResponse.body.data.items[0].id,
        type: 'progress_report',
        content: '孩子今天在数学活动中表现很好，对数字认知有很大进步',
        priority: 'normal'
      };

      const communicationResponse = await request(app)
        .post('/api/parent-communications')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(communicationData);

      expect(communicationResponse.status).toBe(201);

      // 10. 查看工作统计
      const statsResponse = await request(app)
        .get('/api/dashboard/teacher-stats')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(statsResponse.status).toBe(200);
      expect(statsResponse.body.data.todayActivities).toBeGreaterThanOrEqual(1);
      expect(statsResponse.body.data.weeklyAttendance).toBeDefined();
      expect(statsResponse.body.data.studentCount).toBeGreaterThan(0);

      // 11. 查看今日任务
      const tasksResponse = await request(app)
        .get('/api/tasks/today')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(tasksResponse.status).toBe(200);
      expect(tasksResponse.body.data.items).toBeDefined();

      // 12. 更新个人资料
      const profileUpdateData = {
        realName: '更新后的教师姓名',
        phone: '13800138000',
        specialization: '幼儿数学教育',
        experience: '5年幼儿教学经验'
      };

      const profileUpdateResponse = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(profileUpdateData);

      expect(profileUpdateResponse.status).toBe(200);
      expect(profileUpdateResponse.body.data.realName).toBe(profileUpdateData.realName);

      console.log('✅ 教师完整工作流程测试通过');
    });
  });

  describe('家长完整工作流程', () => {
    it('应该完成家长的日常操作流程', async () => {
      // 1. 家长登录
      const parent = testEnv.testUsers.find((u: any) => u.role === 'parent');
      expect(parent).toBeDefined();

      const loginResponse = await request(app)
        .post('/api/auth/unified-login')
        .send({
          username: parent.username,
          password: parent.password
        });

      expect(loginResponse.status).toBe(200);
      const parentToken = loginResponse.body.data.token;

      // 2. 查看我的孩子
      const childrenResponse = await request(app)
        .get('/api/parents/my-children')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(childrenResponse.status).toBe(200);
      expect(childrenResponse.body.data.items.length).toBeGreaterThanOrEqual(1);

      const myChild = childrenResponse.body.data.items[0];

      // 3. 查看孩子详细信息
      const childDetailResponse = await request(app)
        .get(`/api/students/${myChild.id}`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(childDetailResponse.status).toBe(200);
      expect(childDetailResponse.body.data.name).toBeDefined();
      expect(childDetailResponse.body.data.classInfo).toBeDefined();

      // 4. 查看孩子考勤记录
      const attendanceResponse = await request(app)
        .get(`/api/students/${myChild.id}/attendance`)
        .set('Authorization', `Bearer ${parentToken}`)
        .query({ startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() });

      expect(attendanceResponse.status).toBe(200);
      expect(attendanceResponse.body.data.items).toBeDefined();

      // 5. 查看孩子成长记录
      const growthRecordsResponse = await request(app)
        .get(`/api/students/${myChild.id}/growth-records`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(growthRecordsResponse.status).toBe(200);
      expect(growthRecordsResponse.data.items).toBeDefined();

      // 6. 添加新的成长记录
      const newGrowthRecord = {
        type: 'weight',
        value: 18.5,
        unit: 'kg',
        date: new Date().toISOString(),
        notes: '体重正常增长'
      };

      const addGrowthResponse = await request(app)
        .post(`/api/students/${myChild.id}/growth-records`)
        .set('Authorization', `Bearer ${parentToken}`)
        .send(newGrowthRecord);

      expect(addGrowthResponse.status).toBe(201);

      // 7. 查看教学观察记录
      const observationsResponse = await request(app)
        .get(`/api/students/${myChild.id}/observations`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(observationsResponse.status).toBe(200);
      expect(observationsResponse.body.data.items).toBeDefined();

      // 8. 查看与教师的沟通记录
      const communicationsResponse = await request(app)
        .get('/api/parent-communications')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(communicationsResponse.status).toBe(200);
      expect(communicationsResponse.body.data.items).toBeDefined();

      // 9. 发送消息给教师
      const messageData = {
        receiverId: myChild.classInfo.teacherId,
        content: '想了解一下孩子最近的学习情况',
        type: 'inquiry'
      };

      const messageResponse = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${parentToken}`)
        .send(messageData);

      expect(messageResponse.status).toBe(201);

      // 10. 查看可报名的活动
      const activitiesResponse = await request(app)
        .get('/api/activities/available')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(activitiesResponse.status).toBe(200);
      expect(activitiesResponse.body.data.items).toBeDefined();

      // 11. 为孩子报名活动（如果有可用活动）
      if (activitiesResponse.body.data.items.length > 0) {
        const availableActivity = activitiesResponse.body.data.items[0];
        const registrationData = {
          activityId: availableActivity.id,
          studentId: myChild.id,
          parentConsent: true,
          emergencyContact: '13800138000',
          specialNeeds: '无特殊需求'
        };

        const registrationResponse = await request(app)
          .post('/api/activity-registrations')
          .set('Authorization', `Bearer ${parentToken}`)
          .send(registrationData);

        expect([201, 400]).toContain(registrationResponse.status); // 可能已报名或已满
      }

      // 12. 查看孩子的活动报名记录
      const registrationsResponse = await request(app)
        .get(`/api/students/${myChild.id}/activity-registrations`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(registrationsResponse.status).toBe(200);
      expect(registrationsResponse.body.data.items).toBeDefined();

      // 13. 查看仪表板统计
      const dashboardResponse = await request(app)
        .get('/api/dashboard/parent')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(dashboardResponse.status).toBe(200);
      expect(dashboardResponse.body.data.childrenCount).toBeGreaterThan(0);
      expect(dashboardResponse.body.data.upcomingActivities).toBeDefined();
      expect(dashboardResponse.body.data.recentCommunications).toBeDefined();

      // 14. 更新家庭联系信息
      const familyInfoUpdate = {
        address: '更新后的家庭地址',
        emergencyContact: '更新后的紧急联系人',
        emergencyPhone: '13900139000',
        familyComposition: '父母双职工，有一个姐姐'
      };

      const familyUpdateResponse = await request(app)
        .put(`/api/parents/${parent.id}/family-info`)
        .set('Authorization', `Bearer ${parentToken}`)
        .send(familyInfoUpdate);

      expect(familyUpdateResponse.status).toBe(200);

      console.log('✅ 家长完整工作流程测试通过');
    });
  });

  describe('管理员完整工作流程', () => {
    it('应该完成管理员的日常管理流程', async () => {
      // 1. 管理员登录
      const 13800138000Response = await request(app)
        .post('/api/auth/unified-login')
        .send({
          username: 'test_13800138000',
          password: 'Admin123!'
        });

      expect(13800138000Response.status).toBe(200);
      const 13800138000Token = 13800138000Response.body.data.token;

      // 2. 查看系统概览
      const overviewResponse = await request(app)
        .get('/api/dashboard/13800138000')
        .set('Authorization', `Bearer ${13800138000Token}`);

      expect(overviewResponse.status).toBe(200);
      expect(overviewResponse.body.data.totalUsers).toBeDefined();
      expect(overviewResponse.body.data.totalClasses).toBeDefined();
      expect(overviewResponse.body.data.totalStudents).toBeDefined();

      // 3. 创建新教师
      const newTeacherData = {
        username: TestUtils.createRandomTestData('new_teacher').username,
        email: 'newteacher@test.com',
        password: 'Teacher123!',
        realName: '新教师',
        roleIds: ['teacher'],
        phone: '13700137000',
        specialization: '幼儿语言教育'
      };

      const createTeacherResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${13800138000Token}`)
        .send(newTeacherData);

      expect(createTeacherResponse.status).toBe(201);
      const newTeacherId = createTeacherResponse.body.data.id;

      // 4. 创建新班级并分配教师
      const newClassData = {
        name: '管理员创建班级',
        teacherId: newTeacherId,
        capacity: 25,
        ageGroup: '3-4岁',
        schedule: '周一至周五 9:00-17:00',
        description: '由管理员创建的测试班级'
      };

      const createClassResponse = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${13800138000Token}`)
        .send(newClassData);

      expect(createClassResponse.status).toBe(201);
      const newClassId = createClassResponse.body.data.id;

      // 5. 创建新家长
      const newParentData = {
        username: TestUtils.createRandomTestData('new_parent').username,
        email: 'newparent@test.com',
        password: 'Parent123!',
        realName: '新家长',
        roleIds: ['parent'],
        phone: '13600136000'
      };

      const createParentResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${13800138000Token}`)
        .send(newParentData);

      expect(createParentResponse.status).toBe(201);
      const newParentId = createParentResponse.body.data.id;

      // 6. 为家长创建学生
      const newStudentData = {
        name: '管理员创建学生',
        age: 3,
        gender: 'male',
        birthDate: '2021-01-01',
        parentId: newParentId,
        classId: newClassId,
        address: '测试学生地址',
        emergencyContact: '紧急联系人',
        emergencyPhone: '13500135000'
      };

      const createStudentResponse = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${13800138000Token}`)
        .send(newStudentData);

      expect(createStudentResponse.status).toBe(201);
      const newStudentId = createStudentResponse.body.data.id;

      // 7. 创建系统活动
      const systemActivityData = {
        title: '系统管理员活动',
        description: '由管理员创建的全园活动',
        type: 'system',
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 一周后
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        maxParticipants: 100,
        location: '全园范围',
        isPublic: true
      };

      const createActivityResponse = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${13800138000Token}`)
        .send(systemActivityData);

      expect(createActivityResponse.status).toBe(201);

      // 8. 查看用户管理统计
      const userStatsResponse = await request(app)
        .get('/api/users/statistics')
        .set('Authorization', `Bearer ${13800138000Token}`);

      expect(userStatsResponse.status).toBe(200);
      expect(userStatsResponse.body.data.totalUsers).toBeGreaterThan(0);
      expect(userStatsResponse.body.data.roleDistribution).toBeDefined();

      // 9. 查看系统设置
      const settingsResponse = await request(app)
        .get('/api/system/settings')
        .set('Authorization', `Bearer ${13800138000Token}`);

      expect(settingsResponse.status).toBe(200);
      expect(settingsResponse.body.data.items).toBeDefined();

      // 10. 更新系统设置
      const settingUpdateData = {
        key: 'max_class_capacity',
        value: '30',
        description: '班级最大容量'
      };

      const updateSettingResponse = await request(app)
        .put('/api/system/settings')
        .set('Authorization', `Bearer ${13800138000Token}`)
        .send(settingUpdateData);

      expect(updateSettingResponse.status).toBe(200);

      // 11. 查看操作日志
      const logsResponse = await request(app)
        .get('/api/system/operation-logs')
        .set('Authorization', `Bearer ${13800138000Token}`)
        .query({ page: 1, pageSize: 20 });

      expect(logsResponse.status).toBe(200);
      expect(logsResponse.body.data.items).toBeDefined();

      // 12. 查看系统性能指标
      const performanceResponse = await request(app)
        .get('/api/system/performance')
        .set('Authorization', `Bearer ${13800138000Token}`);

      expect(performanceResponse.status).toBe(200);
      expect(performanceResponse.body.data.responseTime).toBeDefined();
      expect(performanceResponse.body.data.activeUsers).toBeDefined();

      // 13. 发送系统通知
      const notificationData = {
        title: '系统维护通知',
        content: '系统将于今晚进行维护升级',
        type: 'system',
        targetRoles: ['teacher', 'parent'],
        priority: 'high'
      };

      const notificationResponse = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${13800138000Token}`)
        .send(notificationData);

      expect(notificationResponse.status).toBe(201);

      // 14. 查看数据备份状态
      const backupResponse = await request(app)
        .get('/api/system/backup-status')
        .set('Authorization', `Bearer ${13800138000Token}`);

      expect(backupResponse.status).toBe(200);
      expect(backupResponse.data.lastBackup).toBeDefined();

      console.log('✅ 管理员完整工作流程测试通过');
    });
  });

  describe('跨角色协作流程', () => {
    it('应该完成教师-家长协作流程', async () => {
      // 1. 获取教师和家长
      const teacher = testEnv.testUsers.find((u: any) => u.role === 'teacher');
      const parent = testEnv.testUsers.find((u: any) => u.role === 'parent');

      const teacherToken = await envManager.getUserToken(teacher.id);
      const parentToken = await envManager.getUserToken(parent.id);

      // 2. 获取共同的学生
      const teacherStudentsResponse = await request(app)
        .get('/api/classes/my-classes')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(teacherStudentsResponse.status).toBe(200);
      expect(teacherStudentsResponse.body.data.items.length).toBeGreaterThan(0);

      const teacherClass = teacherStudentsResponse.body.data.items[0];
      const classStudentsResponse = await request(app)
        .get(`/api/classes/${teacherClass.id}/students`)
        .set('Authorization', `Bearer ${teacherToken}`);

      const sharedStudent = classStudentsResponse.body.data.items.find(
        (student: any) => student.parentId === parent.id
      );

      if (sharedStudent) {
        // 3. 教师发送家长沟通消息
        const teacherMessageData = {
          studentId: sharedStudent.id,
          type: 'progress_report',
          content: '孩子今天在课堂上表现很棒，积极参与了所有活动',
          priority: 'normal'
        };

        const teacherMessageResponse = await request(app)
          .post('/api/parent-communications')
          .set('Authorization', `Bearer ${teacherToken}`)
          .send(teacherMessageData);

        expect(teacherMessageResponse.status).toBe(201);

        // 4. 家长回复消息
        const parentReplyData = {
          communicationId: teacherMessageResponse.body.data.id,
          content: '感谢老师的反馈，孩子回家后也很开心',
          type: 'reply'
        };

        const parentReplyResponse = await request(app)
          .post('/api/parent-communications/reply')
          .set('Authorization', `Bearer ${parentToken}`)
          .send(parentReplyData);

        expect(parentReplyResponse.status).toBe(201);

        // 5. 家长预约面谈
        const meetingData = {
          teacherId: teacher.id,
          studentId: sharedStudent.id,
          requestedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2天后
          duration: 30,
          topic: '了解孩子最近的学习情况',
          notes: '希望讨论孩子的社交发展'
        };

        const meetingResponse = await request(app)
          .post('/api/parent-teacher-meetings')
          .set('Authorization', `Bearer ${parentToken}`)
          .send(meetingData);

        expect(meetingResponse.status).toBe(201);

        // 6. 教师确认面谈时间
        const confirmMeetingData = {
          status: 'confirmed',
          actualDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(), // 2天后下午2点
          notes: '确认时间，会准备好孩子的学习档案'
        };

        const confirmMeetingResponse = await request(app)
          .put(`/api/parent-teacher-meetings/${meetingResponse.body.data.id}`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .send(confirmMeetingData);

        expect(confirmMeetingResponse.status).toBe(200);
        expect(confirmMeetingResponse.body.data.status).toBe('confirmed');

        // 7. 教师记录面谈结果
        const meetingResultData = {
          outcomes: ['家长对孩子进步表示满意', '讨论了下一步学习计划'],
          actionItems: ['加强数学练习', '增加社交互动活动'],
          nextFollowUp: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30天后
        };

        const resultResponse = await request(app)
          .post(`/api/parent-teacher-meetings/${meetingResponse.body.data.id}/results`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .send(meetingResultData);

        expect(resultResponse.status).toBe(201);

        // 8. 家长确认面谈反馈
        const parentFeedbackData = {
          rating: 5,
          feedback: '面谈很有帮助，了解了孩子的情况',
          satisfied: true
        };

        const feedbackResponse = await request(app)
          .post(`/api/parent-teacher-meetings/${meetingResponse.body.data.id}/feedback`)
          .set('Authorization', `Bearer ${parentToken}`)
          .send(parentFeedbackData);

        expect(feedbackResponse.status).toBe(201);
      }

      console.log('✅ 教师-家长协作流程测试通过');
    });

    it('应该完成完整的招生工作流程', async () => {
      const 13800138000Token = testEnv.13800138000Token;

      // 1. 创建招生计划
      const enrollmentPlanData = {
        name: '2024年春季招生计划',
        description: '面向3-6岁幼儿的春季招生',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        targetAgeGroup: '3-6岁',
        capacity: 50,
        requirements: ['年龄3-6岁', '健康体检报告', '户口本复印件']
      };

      const planResponse = await request(app)
        .post('/api/enrollment-plans')
        .set('Authorization', `Bearer ${13800138000Token}`)
        .send(enrollmentPlanData);

      expect(planResponse.status).toBe(201);
      const planId = planResponse.body.data.id;

      // 2. 家长提交入学申请
      const applicationData = TestUtils.createRandomTestData('applicant');
      const parentApplicationData = {
        enrollmentPlanId: planId,
        childName: '申请儿童',
        childAge: 4,
        childGender: 'male',
        childBirthDate: '2020-01-01',
        parentName: applicationData.name,
        parentPhone: applicationData.phone,
        parentEmail: applicationData.email,
        address: '申请家庭地址',
        emergencyContact: '紧急联系人',
        emergencyPhone: '13800138000',
        specialNeeds: '无特殊需求',
        previousPreschool: '无',
        applicationReason: '希望孩子接受优质的幼儿教育'
      };

      const applicationResponse = await request(app)
        .post('/api/enrollment-applications')
        .send(parentApplicationData);

      expect(applicationResponse.status).toBe(201);
      const applicationId = applicationResponse.body.data.id;

      // 3. 管理员审核申请
      const reviewData = {
        status: 'approved',
        reviewNotes: '申请材料齐全，符合招生要求',
        nextStep: 'interview_scheduled'
      };

      const reviewResponse = await request(app)
        .put(`/api/enrollment-applications/${applicationId}/review`)
        .set('Authorization', `Bearer ${13800138000Token}`)
        .send(reviewData);

      expect(reviewResponse.status).toBe(200);
      expect(reviewResponse.body.data.status).toBe('approved');

      // 4. 安排面试
      const interviewData = {
        applicationId: applicationId,
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        interviewerId: testEnv.testUsers.find((u: any) => u.role === 'teacher')?.id,
        interviewType: 'parent_child',
        notes: '安排与家长和孩子见面'
      };

      const interviewResponse = await request(app)
        .post('/api/enrollment-interviews')
        .set('Authorization', `Bearer ${13800138000Token}`)
        .send(interviewData);

      expect(interviewResponse.status).toBe(201);
      const interviewId = interviewResponse.body.data.id;

      // 5. 记录面试结果
      const interviewResultData = {
        interviewId: interviewId,
        result: 'recommended',
        childAssessment: {
          socialSkills: 'good',
          languageSkills: 'average',
          cognitiveSkills: 'good',
          motorSkills: 'good'
        },
        parentAssessment: {
          cooperation: 'excellent',
          expectations: 'reasonable',
          communication: 'good'
        },
        interviewerNotes: '孩子表现良好，家长配合度高',
        recommendation: '建议录取'
      };

      const resultResponse = await request(app)
        .post('/api/enrollment-interviews/results')
        .set('Authorization', `Bearer ${13800138000Token}`)
        .send(interviewResultData);

      expect(resultResponse.status).toBe(201);

      // 6. 发放录取通知
      const admissionData = {
        applicationId: applicationId,
        admissionStatus: 'admitted',
        classAssignment: '小班A班',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        requirements: ['体检报告', '预防接种证', '户口本复印件'],
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString()
      };

      const admissionResponse = await request(app)
        .post('/api/enrollment-admissions')
        .set('Authorization', `Bearer ${13800138000Token}`)
        .send(admissionData);

      expect(admissionResponse.status).toBe(201);

      // 7. 查看招生统计
      const statsResponse = await request(app)
        .get(`/api/enrollment-plans/${planId}/statistics`)
        .set('Authorization', `Bearer ${13800138000Token}`);

      expect(statsResponse.status).toBe(200);
      expect(statsResponse.body.data.totalApplications).toBe(1);
      expect(statsResponse.body.data.approvedApplications).toBe(1);
      expect(statsResponse.body.data.admittedCount).toBe(1);

      console.log('✅ 完整招生工作流程测试通过');
    });
  });
});