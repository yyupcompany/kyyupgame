import { Sequelize, QueryTypes } from 'sequelize';
import { TestDataFactory, DatabaseCleaner } from '../helpers/testUtils';

describe('System Integration Tests', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      database: process.env.TEST_DB_NAME || 'kindergarten_test',
      username: process.env.TEST_DB_USER || 'root',
      password: process.env.TEST_DB_PASSWORD || '',
      host: process.env.TEST_DB_HOST || 'localhost',
      port: parseInt(process.env.TEST_DB_PORT || '3306'),
      dialect: 'mysql',
      logging: false
    });

    await sequelize.authenticate();
    await sequelize.sync({ force: false });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await DatabaseCleaner.cleanAll();
  });

  describe('Complete Enrollment Workflow Integration', () => {
    it('should handle complete enrollment from plan creation to student enrollment', async () => {
      // Step 1: Create admin user
      const [adminResult] = await sequelize.query(
        'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['admin', 'admin@test.com', 'hashed_password', 'admin'] }
      );
      const adminId = (adminResult as any).insertId;

      // Step 2: Create parent user
      const [parentResult] = await sequelize.query(
        'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['parent1', 'parent1@test.com', 'hashed_password', 'parent'] }
      );
      const parentId = (parentResult as any).insertId;

      // Step 3: Create teacher
      const [teacherResult] = await sequelize.query(
        'INSERT INTO teachers (name, email, qualification, experience, salary, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['张老师', 'teacher@test.com', '学前教育本科', 5, 8000, 'active'] }
      );
      const teacherId = (teacherResult as any).insertId;

      // Step 4: Create class
      const [classResult] = await sequelize.query(
        'INSERT INTO classes (name, grade, capacity, currentCount, teacherId, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['大班A', '大班', 25, 0, teacherId, 'active'] }
      );
      const classId = (classResult as any).insertId;

      // Step 5: Create enrollment plan
      const enrollmentPlan = {
        title: '2024年秋季招生计划',
        description: '面向3-6岁儿童的全面发展教育',
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        targetCount: 100,
        currentCount: 0,
        status: '进行中',
        ageRange: '3-6岁',
        tuition: 2500,
        requirements: JSON.stringify(['户口本', '疫苗证明']),
        features: JSON.stringify(['双语教学', '艺术课程'])
      };

      const [planResult] = await sequelize.query(
        `INSERT INTO enrollment_plans (title, description, startDate, endDate, targetCount, currentCount, status, ageRange, tuition, requirements, features, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            enrollmentPlan.title,
            enrollmentPlan.description,
            enrollmentPlan.startDate,
            enrollmentPlan.endDate,
            enrollmentPlan.targetCount,
            enrollmentPlan.currentCount,
            enrollmentPlan.status,
            enrollmentPlan.ageRange,
            enrollmentPlan.tuition,
            enrollmentPlan.requirements,
            enrollmentPlan.features
          ]
        }
      );
      const planId = (planResult as any).insertId;

      // Step 6: Submit enrollment application
      const application = {
        enrollmentPlanId: planId,
        parentId: parentId,
        studentName: '申请学生',
        studentGender: '女',
        studentBirthDate: '2020-06-15',
        parentName: '申请家长',
        parentPhone: '13900139001',
        parentEmail: 'parent1@test.com',
        preferredClassGrade: '大班',
        status: '待审核',
        submissionDate: new Date(),
        hasAllergies: false,
        medicalHistory: '',
        emergencyContact: JSON.stringify({
          name: '紧急联系人',
          phone: '13800138000',
          relationship: '祖父母'
        })
      };

      const [appResult] = await sequelize.query(
        `INSERT INTO enrollment_applications (enrollmentPlanId, parentId, studentName, studentGender, studentBirthDate, parentName, parentPhone, parentEmail, preferredClassGrade, status, submissionDate, hasAllergies, medicalHistory, emergencyContact, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            application.enrollmentPlanId,
            application.parentId,
            application.studentName,
            application.studentGender,
            application.studentBirthDate,
            application.parentName,
            application.parentPhone,
            application.parentEmail,
            application.preferredClassGrade,
            application.status,
            application.submissionDate,
            application.hasAllergies,
            application.medicalHistory,
            application.emergencyContact
          ]
        }
      );
      const applicationId = (appResult as any).insertId;

      // Step 7: Review and approve application
      const review = {
        applicationId: applicationId,
        reviewerId: adminId,
        status: '已通过',
        reviewNotes: '材料齐全，符合招生要求',
        assignedClassId: classId,
        reviewDate: new Date()
      };

      await sequelize.query(
        `INSERT INTO enrollment_reviews (applicationId, reviewerId, status, reviewNotes, assignedClassId, reviewDate, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            review.applicationId,
            review.reviewerId,
            review.status,
            review.reviewNotes,
            review.assignedClassId,
            review.reviewDate
          ]
        }
      );

      // Update application status
      await sequelize.query(
        'UPDATE enrollment_applications SET status = ?, assignedClassId = ? WHERE id = ?',
        { replacements: [review.status, review.assignedClassId, applicationId] }
      );

      // Step 8: Create student record
      const student = {
        name: application.studentName,
        gender: application.studentGender,
        birthDate: application.studentBirthDate,
        parentId: parentId,
        classId: classId,
        enrollmentDate: new Date(),
        status: 'active',
        medicalInfo: JSON.stringify({
          hasAllergies: application.hasAllergies,
          medicalHistory: application.medicalHistory
        })
      };

      const [studentResult] = await sequelize.query(
        `INSERT INTO students (name, gender, birthDate, parentId, classId, enrollmentDate, status, medicalInfo, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            student.name,
            student.gender,
            student.birthDate,
            student.parentId,
            student.classId,
            student.enrollmentDate,
            student.status,
            student.medicalInfo
          ]
        }
      );
      const studentId = (studentResult as any).insertId;

      // Step 9: Update class enrollment count
      await sequelize.query(
        'UPDATE classes SET currentCount = currentCount + 1 WHERE id = ?',
        { replacements: [classId] }
      );

      // Step 10: Update enrollment plan current count
      await sequelize.query(
        'UPDATE enrollment_plans SET currentCount = currentCount + 1 WHERE id = ?',
        { replacements: [planId] }
      );

      // Verification: Check complete workflow results
      const [workflowResult] = await sequelize.query(
        `SELECT 
           s.name as student_name,
           s.status as student_status,
           c.name as class_name,
           c.currentCount as class_current_count,
           t.name as teacher_name,
           ea.status as application_status,
           ep.currentCount as plan_current_count,
           u.username as parent_username
         FROM students s
         LEFT JOIN classes c ON s.classId = c.id
         LEFT JOIN teachers t ON c.teacherId = t.id
         LEFT JOIN enrollment_applications ea ON s.parentId = ea.parentId AND s.name = ea.studentName
         LEFT JOIN enrollment_plans ep ON ea.enrollmentPlanId = ep.id
         LEFT JOIN users u ON s.parentId = u.id
         WHERE s.id = ?`,
        {
          replacements: [studentId],
          type: QueryTypes.SELECT
        }
      );

      expect(workflowResult).toBeDefined();
      expect((workflowResult as any).student_name).toBe('申请学生');
      expect((workflowResult as any).student_status).toBe('active');
      expect((workflowResult as any).class_name).toBe('大班A');
      expect((workflowResult as any).class_current_count).toBe(1);
      expect((workflowResult as any).teacher_name).toBe('张老师');
      expect((workflowResult as any).application_status).toBe('已通过');
      expect((workflowResult as any).plan_current_count).toBe(1);
      expect((workflowResult as any).parent_username).toBe('parent1');
    });

    it('should handle enrollment application rejection workflow', async () => {
      // Create necessary entities
      const [adminResult] = await sequelize.query(
        'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['admin', 'admin@test.com', 'password', 'admin'] }
      );
      const adminId = (adminResult as any).insertId;

      const [parentResult] = await sequelize.query(
        'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['parent2', 'parent2@test.com', 'password', 'parent'] }
      );
      const parentId = (parentResult as any).insertId;

      const [planResult] = await sequelize.query(
        'INSERT INTO enrollment_plans (title, startDate, endDate, targetCount, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['测试计划', new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 50, '进行中'] }
      );
      const planId = (planResult as any).insertId;

      // Submit application
      const [appResult] = await sequelize.query(
        `INSERT INTO enrollment_applications (enrollmentPlanId, parentId, studentName, studentGender, studentBirthDate, parentName, parentPhone, status, submissionDate, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            planId, parentId, '不符合要求学生', '男', '2022-01-01', // Too young
            '家长', '13900139002', '待审核', new Date()
          ]
        }
      );
      const applicationId = (appResult as any).insertId;

      // Reject application
      await sequelize.query(
        `INSERT INTO enrollment_reviews (applicationId, reviewerId, status, reviewNotes, reviewDate, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            applicationId, adminId, '已拒绝', '学生年龄不符合要求', new Date()
          ]
        }
      );

      await sequelize.query(
        'UPDATE enrollment_applications SET status = ? WHERE id = ?',
        { replacements: ['已拒绝', applicationId] }
      );

      // Verify rejection
      const [rejectedApp] = await sequelize.query(
        'SELECT status FROM enrollment_applications WHERE id = ?',
        {
          replacements: [applicationId],
          type: QueryTypes.SELECT
        }
      );

      expect((rejectedApp as any).status).toBe('已拒绝');

      // Verify no student record created
      const [studentCheck] = await sequelize.query(
        'SELECT COUNT(*) as count FROM students WHERE parentId = ? AND name = ?',
        {
          replacements: [parentId, '不符合要求学生'],
          type: QueryTypes.SELECT
        }
      );

      expect((studentCheck as any).count).toBe(0);
    });
  });

  describe('Activity Management Workflow Integration', () => {
    it('should handle complete activity lifecycle from creation to evaluation', async () => {
      // Create users and classes
      const [teacherUserResult] = await sequelize.query(
        'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['teacher1', 'teacher1@test.com', 'password', 'teacher'] }
      );
      const teacherUserId = (teacherUserResult as any).insertId;

      const [parentUserResult] = await sequelize.query(
        'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['parent3', 'parent3@test.com', 'password', 'parent'] }
      );
      const parentUserId = (parentUserResult as any).insertId;

      const [teacherResult] = await sequelize.query(
        'INSERT INTO teachers (name, email, qualification, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
        { replacements: ['活动老师', 'activity@teacher.com', '学前教育'] }
      );
      const teacherId = (teacherResult as any).insertId;

      const [classResult] = await sequelize.query(
        'INSERT INTO classes (name, grade, capacity, teacherId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['活动班级', '中班', 20, teacherId] }
      );
      const classId = (classResult as any).insertId;

      const [studentResult] = await sequelize.query(
        'INSERT INTO students (name, gender, birthDate, parentId, classId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['活动学生', '女', '2020-03-15', parentUserId, classId] }
      );
      const studentId = (studentResult as any).insertId;

      // Create activity
      const activity = {
        title: '春季户外探索活动',
        description: '带领孩子们接触大自然，学习植物知识',
        type: '户外活动',
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        location: '植物园',
        capacity: 15,
        currentRegistrations: 0,
        fee: 80,
        status: '开放报名',
        organizerId: teacherId,
        targetAgeRange: '4-6岁',
        requirements: JSON.stringify(['穿运动鞋', '带水杯', '涂防晒霜'])
      };

      const [activityResult] = await sequelize.query(
        `INSERT INTO activities (title, description, type, startTime, endTime, location, capacity, currentRegistrations, fee, status, organizerId, targetAgeRange, requirements, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            activity.title,
            activity.description,
            activity.type,
            activity.startTime,
            activity.endTime,
            activity.location,
            activity.capacity,
            activity.currentRegistrations,
            activity.fee,
            activity.status,
            activity.organizerId,
            activity.targetAgeRange,
            activity.requirements
          ]
        }
      );
      const activityId = (activityResult as any).insertId;

      // Register student for activity
      const registration = {
        activityId: activityId,
        studentId: studentId,
        parentId: parentUserId,
        registrationDate: new Date(),
        status: 'confirmed',
        paymentStatus: 'paid',
        notes: '孩子很期待这个活动'
      };

      const [regResult] = await sequelize.query(
        `INSERT INTO activity_registrations (activityId, studentId, parentId, registrationDate, status, paymentStatus, notes, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            registration.activityId,
            registration.studentId,
            registration.parentId,
            registration.registrationDate,
            registration.status,
            registration.paymentStatus,
            registration.notes
          ]
        }
      );

      // Update activity registration count
      await sequelize.query(
        'UPDATE activities SET currentRegistrations = currentRegistrations + 1 WHERE id = ?',
        { replacements: [activityId] }
      );

      // Simulate activity check-in
      const checkin = {
        registrationId: (regResult as any).insertId,
        checkinTime: new Date(),
        healthStatus: 'normal',
        notes: '准时到达，精神状态良好'
      };

      await sequelize.query(
        `INSERT INTO activity_checkins (registrationId, checkinTime, healthStatus, notes, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            checkin.registrationId,
            checkin.checkinTime,
            checkin.healthStatus,
            checkin.notes
          ]
        }
      );

      // Create activity evaluation
      const evaluation = {
        activityId: activityId,
        evaluatorId: teacherId,
        overallRating: 5,
        studentParticipation: 4,
        learningOutcomes: 5,
        safetyRating: 5,
        organizationRating: 4,
        feedback: '活动非常成功，孩子们积极参与，学到了很多植物知识',
        improvements: JSON.stringify(['可以增加更多互动游戏', '准备更多植物标本']),
        evaluationDate: new Date()
      };

      await sequelize.query(
        `INSERT INTO activity_evaluations (activityId, evaluatorId, overallRating, studentParticipation, learningOutcomes, safetyRating, organizationRating, feedback, improvements, evaluationDate, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            evaluation.activityId,
            evaluation.evaluatorId,
            evaluation.overallRating,
            evaluation.studentParticipation,
            evaluation.learningOutcomes,
            evaluation.safetyRating,
            evaluation.organizationRating,
            evaluation.feedback,
            evaluation.improvements,
            evaluation.evaluationDate
          ]
        }
      );

      // Update activity status to completed
      await sequelize.query(
        'UPDATE activities SET status = ? WHERE id = ?',
        { replacements: ['已完成', activityId] }
      );

      // Verification: Check complete activity workflow
      const [activityWorkflow] = await sequelize.query(
        `SELECT 
           a.title,
           a.status as activity_status,
           a.currentRegistrations,
           t.name as organizer_name,
           ar.status as registration_status,
           s.name as student_name,
           ac.healthStatus as checkin_health,
           ae.overallRating as evaluation_rating
         FROM activities a
         LEFT JOIN teachers t ON a.organizerId = t.id
         LEFT JOIN activity_registrations ar ON a.id = ar.activityId
         LEFT JOIN students s ON ar.studentId = s.id
         LEFT JOIN activity_checkins ac ON ar.id = ac.registrationId
         LEFT JOIN activity_evaluations ae ON a.id = ae.activityId
         WHERE a.id = ?`,
        {
          replacements: [activityId],
          type: QueryTypes.SELECT
        }
      );

      expect(activityWorkflow).toBeDefined();
      expect((activityWorkflow as any).title).toBe('春季户外探索活动');
      expect((activityWorkflow as any).activity_status).toBe('已完成');
      expect((activityWorkflow as any).currentRegistrations).toBe(1);
      expect((activityWorkflow as any).organizer_name).toBe('活动老师');
      expect((activityWorkflow as any).registration_status).toBe('confirmed');
      expect((activityWorkflow as any).student_name).toBe('活动学生');
      expect((activityWorkflow as any).checkin_health).toBe('normal');
      expect((activityWorkflow as any).evaluation_rating).toBe(5);
    });

    it('should handle activity cancellation workflow', async () => {
      // Create basic entities
      const [teacherResult] = await sequelize.query(
        'INSERT INTO teachers (name, email, qualification, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
        { replacements: ['取消活动老师', 'cancel@teacher.com', '学前教育'] }
      );
      const teacherId = (teacherResult as any).insertId;

      const [parentResult] = await sequelize.query(
        'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['cancelparent', 'cancel@parent.com', 'password', 'parent'] }
      );
      const parentId = (parentResult as any).insertId;

      const [studentResult] = await sequelize.query(
        'INSERT INTO students (name, gender, birthDate, parentId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['取消学生', '男', '2020-05-01', parentId] }
      );
      const studentId = (studentResult as any).insertId;

      // Create activity
      const [activityResult] = await sequelize.query(
        `INSERT INTO activities (title, type, startTime, endTime, capacity, currentRegistrations, fee, status, organizerId, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            '天气原因取消活动',
            '户外活动',
            new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
            20,
            1,
            100,
            '开放报名',
            teacherId
          ]
        }
      );
      const activityId = (activityResult as any).insertId;

      // Create registration
      const [regResult] = await sequelize.query(
        `INSERT INTO activity_registrations (activityId, studentId, parentId, registrationDate, status, paymentStatus, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            activityId, studentId, parentId, new Date(), 'confirmed', 'paid'
          ]
        }
      );

      // Cancel activity
      const cancellation = {
        activityId: activityId,
        reason: '天气预报显示有暴雨，为确保学生安全决定取消活动',
        cancellationDate: new Date(),
        refundPolicy: 'full_refund',
        notificationSent: true
      };

      await sequelize.query(
        `INSERT INTO activity_cancellations (activityId, reason, cancellationDate, refundPolicy, notificationSent, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            cancellation.activityId,
            cancellation.reason,
            cancellation.cancellationDate,
            cancellation.refundPolicy,
            cancellation.notificationSent
          ]
        }
      );

      // Update activity status
      await sequelize.query(
        'UPDATE activities SET status = ? WHERE id = ?',
        { replacements: ['已取消', activityId] }
      );

      // Update registrations status
      await sequelize.query(
        'UPDATE activity_registrations SET status = ? WHERE activityId = ?',
        { replacements: ['已取消', activityId] }
      );

      // Verify cancellation
      const [cancelledActivity] = await sequelize.query(
        `SELECT a.status, ac.reason, ar.status as registration_status
         FROM activities a
         LEFT JOIN activity_cancellations ac ON a.id = ac.activityId
         LEFT JOIN activity_registrations ar ON a.id = ar.activityId
         WHERE a.id = ?`,
        {
          replacements: [activityId],
          type: QueryTypes.SELECT
        }
      );

      expect((cancelledActivity as any).status).toBe('已取消');
      expect((cancelledActivity as any).reason).toBe('天气预报显示有暴雨，为确保学生安全决定取消活动');
      expect((cancelledActivity as any).registration_status).toBe('已取消');
    });
  });

  describe('AI System Integration Tests', () => {
    it('should handle AI conversation and memory workflow', async () => {
      // Create teacher user
      const [teacherResult] = await sequelize.query(
        'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['aiteacher', 'ai@teacher.com', 'password', 'teacher'] }
      );
      const teacherId = (teacherResult as any).insertId;

      // Create AI conversation
      const conversation = {
        userId: teacherId,
        title: 'AI教学助手对话',
        topic: 'lesson_planning',
        status: 'active',
        context: JSON.stringify({
          classGrade: '大班',
          subject: '数学',
          studentCount: 25,
          difficulty: 'medium'
        })
      };

      const [convResult] = await sequelize.query(
        'INSERT INTO ai_conversations (userId, title, topic, status, context, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: [
            conversation.userId,
            conversation.title,
            conversation.topic,
            conversation.status,
            conversation.context
          ]
        }
      );
      const conversationId = (convResult as any).insertId;

      // Add user message
      const userMessage = {
        conversationId: conversationId,
        userId: teacherId,
        role: 'user',
        content: '请帮我制定一个关于数字认知的教学计划，适合5-6岁的孩子',
        messageType: 'text',
        metadata: JSON.stringify({
          timestamp: new Date().toISOString(),
          messageLength: 25
        })
      };

      const [userMsgResult] = await sequelize.query(
        'INSERT INTO ai_messages (conversationId, userId, role, content, messageType, metadata, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: [
            userMessage.conversationId,
            userMessage.userId,
            userMessage.role,
            userMessage.content,
            userMessage.messageType,
            userMessage.metadata
          ]
        }
      );

      // Add AI response
      const aiMessage = {
        conversationId: conversationId,
        userId: teacherId,
        role: 'assistant',
        content: '我来为您制定一个适合5-6岁儿童的数字认知教学计划...',
        messageType: 'text',
        tokens: 180,
        metadata: JSON.stringify({
          model: 'gpt-4',
          temperature: 0.7,
          responseTime: 1200
        })
      };

      await sequelize.query(
        'INSERT INTO ai_messages (conversationId, userId, role, content, messageType, tokens, metadata, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: [
            aiMessage.conversationId,
            aiMessage.userId,
            aiMessage.role,
            aiMessage.content,
            aiMessage.messageType,
            aiMessage.tokens,
            aiMessage.metadata
          ]
        }
      );

      // Store AI memory
      const memory = {
        userId: teacherId,
        content: '教师询问了关于5-6岁儿童数字认知的教学计划设计',
        summary: '数字认知教学计划咨询',
        importance: 0.8,
        memoryType: 'teaching_consultation',
        tags: JSON.stringify(['教学计划', '数字认知', '大班', '数学']),
        context: JSON.stringify({
          conversationId: conversationId,
          ageGroup: '5-6岁',
          subject: '数学',
          topic: '数字认知'
        }),
        embedding: JSON.stringify([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]) // Mock embedding
      };

      const [memoryResult] = await sequelize.query(
        `INSERT INTO ai_memories (userId, content, summary, importance, memoryType, tags, context, embedding, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            memory.userId,
            memory.content,
            memory.summary,
            memory.importance,
            memory.memoryType,
            memory.tags,
            memory.context,
            memory.embedding
          ]
        }
      );

      // Track AI usage
      const usage = {
        userId: teacherId,
        modelName: 'gpt-4',
        promptTokens: 100,
        completionTokens: 180,
        totalTokens: 280,
        cost: 0.028,
        requestType: 'chat_completion',
        responseTime: 1200,
        success: true
      };

      await sequelize.query(
        `INSERT INTO ai_model_usages (userId, modelName, promptTokens, completionTokens, totalTokens, cost, requestType, responseTime, success, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            usage.userId,
            usage.modelName,
            usage.promptTokens,
            usage.completionTokens,
            usage.totalTokens,
            usage.cost,
            usage.requestType,
            usage.responseTime,
            usage.success
          ]
        }
      );

      // Verify AI workflow
      const [aiWorkflow] = await sequelize.query(
        `SELECT 
           c.title as conversation_title,
           c.status as conversation_status,
           COUNT(m.id) as message_count,
           mem.summary as memory_summary,
           usage.totalTokens as total_tokens,
           usage.cost as total_cost
         FROM ai_conversations c
         LEFT JOIN ai_messages m ON c.id = m.conversationId
         LEFT JOIN ai_memories mem ON c.userId = mem.userId
         LEFT JOIN ai_model_usages usage ON c.userId = usage.userId
         WHERE c.id = ?
         GROUP BY c.id, mem.id, usage.id`,
        {
          replacements: [conversationId],
          type: QueryTypes.SELECT
        }
      );

      expect(aiWorkflow).toBeDefined();
      expect((aiWorkflow as any).conversation_title).toBe('AI教学助手对话');
      expect((aiWorkflow as any).conversation_status).toBe('active');
      expect((aiWorkflow as any).message_count).toBeGreaterThan(0);
      expect((aiWorkflow as any).memory_summary).toBe('数字认知教学计划咨询');
      expect((aiWorkflow as any).total_tokens).toBe(280);
      expect((aiWorkflow as any).total_cost).toBe(0.028);
    });
  });

  describe('System Performance and Scalability Tests', () => {
    it('should handle concurrent enrollments without data conflicts', async () => {
      // Create enrollment plan with limited capacity
      const [planResult] = await sequelize.query(
        'INSERT INTO enrollment_plans (title, startDate, endDate, targetCount, currentCount, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: [
            '并发测试计划',
            new Date(),
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            2, // Limited capacity
            0,
            '进行中'
          ]
        }
      );
      const planId = (planResult as any).insertId;

      // Create multiple parent users
      const parentIds: number[] = [];
      for (let i = 1; i <= 3; i++) {
        const [parentResult] = await sequelize.query(
          'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
          { replacements: [`concurrent_parent_${i}`, `parent${i}@test.com`, 'password', 'parent'] }
        );
        parentIds.push((parentResult as any).insertId);
      }

      // Simulate concurrent application submissions
      const applicationPromises = parentIds.map(async (parentId, index) => {
        try {
          const [appResult] = await sequelize.query(
            `INSERT INTO enrollment_applications (enrollmentPlanId, parentId, studentName, studentGender, studentBirthDate, parentName, parentPhone, status, submissionDate, createdAt, updatedAt) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            {
              replacements: [
                planId,
                parentId,
                `并发学生_${index + 1}`,
                '女',
                '2020-04-01',
                `并发家长_${index + 1}`,
                `1390013900${index}`,
                '待审核',
                new Date()
              ]
            }
          );
          return { success: true, applicationId: (appResult as any).insertId, parentId };
        } catch (error) {
          return { success: false, error: (error as Error).message, parentId };
        }
      });

      const results = await Promise.all(applicationPromises);

      // Verify that applications were created
      const successfulApplications = results.filter(r => r.success);
      expect(successfulApplications.length).toBeGreaterThan(0);

      // Check total application count
      const [appCount] = await sequelize.query(
        'SELECT COUNT(*) as count FROM enrollment_applications WHERE enrollmentPlanId = ?',
        {
          replacements: [planId],
          type: QueryTypes.SELECT
        }
      );

      expect((appCount as any).count).toBe(parentIds.length);
    });

    it('should maintain data integrity with complex relationships', async () => {
      // Create a complex scenario with all relationships
      const [adminResult] = await sequelize.query(
        'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['integrity_admin', 'integrity@admin.com', 'password', 'admin'] }
      );
      const adminId = (adminResult as any).insertId;

      const [teacherResult] = await sequelize.query(
        'INSERT INTO teachers (name, email, qualification, salary, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['完整性测试老师', 'integrity@teacher.com', '学前教育', 8000, 'active'] }
      );
      const teacherId = (teacherResult as any).insertId;

      const [classResult] = await sequelize.query(
        'INSERT INTO classes (name, grade, capacity, currentCount, teacherId, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['完整性测试班', '大班', 20, 0, teacherId, 'active'] }
      );
      const classId = (classResult as any).insertId;

      const [parentResult] = await sequelize.query(
        'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['integrity_parent', 'integrity@parent.com', 'password', 'parent'] }
      );
      const parentId = (parentResult as any).insertId;

      const [studentResult] = await sequelize.query(
        'INSERT INTO students (name, gender, birthDate, parentId, classId, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['完整性测试学生', '男', '2020-07-01', parentId, classId, 'active'] }
      );
      const studentId = (studentResult as any).insertId;

      // Update class count
      await sequelize.query(
        'UPDATE classes SET currentCount = currentCount + 1 WHERE id = ?',
        { replacements: [classId] }
      );

      // Create activity
      const [activityResult] = await sequelize.query(
        `INSERT INTO activities (title, type, startTime, endTime, capacity, currentRegistrations, status, organizerId, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            '完整性测试活动',
            '室内活动',
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
            10,
            1,
            '开放报名',
            teacherId
          ]
        }
      );
      const activityId = (activityResult as any).insertId;

      // Register student for activity
      await sequelize.query(
        `INSERT INTO activity_registrations (activityId, studentId, parentId, registrationDate, status, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [activityId, studentId, parentId, new Date(), 'confirmed']
        }
      );

      // Create AI conversation
      const [convResult] = await sequelize.query(
        'INSERT INTO ai_conversations (userId, title, topic, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: [teacherId, '完整性测试对话', 'student_management', 'active'] }
      );
      const conversationId = (convResult as any).insertId;

      // Verify all relationships
      const [integrityCheck] = await sequelize.query(
        `SELECT 
           s.name as student_name,
           c.name as class_name,
           c.currentCount,
           t.name as teacher_name,
           u_parent.username as parent_username,
           a.title as activity_title,
           ar.status as registration_status,
           conv.title as conversation_title
         FROM students s
         LEFT JOIN classes c ON s.classId = c.id
         LEFT JOIN teachers t ON c.teacherId = t.id
         LEFT JOIN users u_parent ON s.parentId = u_parent.id
         LEFT JOIN activity_registrations ar ON s.id = ar.studentId
         LEFT JOIN activities a ON ar.activityId = a.id
         LEFT JOIN ai_conversations conv ON t.id = conv.userId
         WHERE s.id = ?`,
        {
          replacements: [studentId],
          type: QueryTypes.SELECT
        }
      );

      expect(integrityCheck).toBeDefined();
      expect((integrityCheck as any).student_name).toBe('完整性测试学生');
      expect((integrityCheck as any).class_name).toBe('完整性测试班');
      expect((integrityCheck as any).currentCount).toBe(1);
      expect((integrityCheck as any).teacher_name).toBe('完整性测试老师');
      expect((integrityCheck as any).parent_username).toBe('integrity_parent');
      expect((integrityCheck as any).activity_title).toBe('完整性测试活动');
      expect((integrityCheck as any).registration_status).toBe('confirmed');
      expect((integrityCheck as any).conversation_title).toBe('完整性测试对话');
    });
  });

  describe('Error Handling and Recovery Tests', () => {
    it('should handle database constraint violations gracefully', async () => {
      // Test unique constraint violation
      const userData = {
        username: 'duplicate_user',
        email: 'duplicate@test.com',
        password: 'password',
        role: 'parent'
      };

      // Insert first user
      await sequelize.query(
        'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: [userData.username, userData.email, userData.password, userData.role] }
      );

      // Attempt to insert duplicate email
      await expect(
        sequelize.query(
          'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
          { replacements: ['another_user', userData.email, userData.password, userData.role] }
        )
      ).rejects.toThrow();
    });

    it('should handle foreign key constraint violations', async () => {
      // Attempt to create student with non-existent parent
      await expect(
        sequelize.query(
          'INSERT INTO students (name, gender, birthDate, parentId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
          { replacements: ['测试学生', '男', '2020-01-01', 99999] }
        )
      ).rejects.toThrow();
    });

    it('should handle transaction rollback scenarios', async () => {
      const transaction = await sequelize.transaction();

      try {
        // Create user within transaction
        const [userResult] = await sequelize.query(
          'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
          { 
            replacements: ['transaction_user', 'transaction@test.com', 'password', 'parent'],
            transaction 
          }
        );
        const userId = (userResult as any).insertId;

        // Create student within same transaction
        await sequelize.query(
          'INSERT INTO students (name, gender, birthDate, parentId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
          { 
            replacements: ['事务学生', '女', '2020-02-01', userId],
            transaction 
          }
        );

        // Simulate error condition
        throw new Error('Simulated transaction error');
        
      } catch (error) {
        await transaction.rollback();
        
        // Verify rollback - user should not exist
        const [userCheck] = await sequelize.query(
          'SELECT COUNT(*) as count FROM users WHERE username = ?',
          {
            replacements: ['transaction_user'],
            type: QueryTypes.SELECT
          }
        );
        
        expect((userCheck as any).count).toBe(0);
      }
    });
  });
});