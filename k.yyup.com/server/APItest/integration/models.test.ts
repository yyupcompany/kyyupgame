import { Sequelize, DataTypes } from 'sequelize';
import { TestDataFactory, DatabaseCleaner } from '../helpers/testUtils';

describe('Models Integration Tests', () => {
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

  describe('Teacher Model Tests', () => {
    it('should create teacher with valid data', async () => {
      const teacherData = {
        name: '张老师',
        email: 'teacher@test.com',
        phone: '13800138000',
        qualification: '学前教育本科',
        experience: 5,
        specialties: JSON.stringify(['音乐', '美术']),
        salary: 8000,
        status: 'active',
        joinDate: new Date()
      };

      const [result] = await sequelize.query(
        `INSERT INTO teachers (name, email, phone, qualification, experience, specialties, salary, status, joinDate, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            teacherData.name,
            teacherData.email,
            teacherData.phone,
            teacherData.qualification,
            teacherData.experience,
            teacherData.specialties,
            teacherData.salary,
            teacherData.status,
            teacherData.joinDate
          ]
        }
      );

      expect(result).toBeDefined();

      // Verify teacher was created
      const [teacher] = await sequelize.query(
        'SELECT * FROM teachers WHERE email = ?',
        {
          replacements: [teacherData.email],
          type: sequelize.QueryTypes.SELECT
        }
      );

      expect(teacher).toBeDefined();
      expect((teacher as any).name).toBe(teacherData.name);
      expect((teacher as any).qualification).toBe(teacherData.qualification);
    });

    it('should enforce unique email constraint for teachers', async () => {
      const teacherData1 = {
        name: '老师1',
        email: 'duplicate@test.com',
        phone: '13800138001',
        qualification: '学前教育'
      };

      const teacherData2 = {
        name: '老师2',
        email: 'duplicate@test.com', // Duplicate email
        phone: '13800138002',
        qualification: '幼教'
      };

      // Insert first teacher
      await sequelize.query(
        'INSERT INTO teachers (name, email, phone, qualification, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: [teacherData1.name, teacherData1.email, teacherData1.phone, teacherData1.qualification] }
      );

      // Attempt duplicate email
      await expect(
        sequelize.query(
          'INSERT INTO teachers (name, email, phone, qualification, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
          { replacements: [teacherData2.name, teacherData2.email, teacherData2.phone, teacherData2.qualification] }
        )
      ).rejects.toThrow();
    });

    it('should validate specialties JSON format', async () => {
      const teacherData = {
        name: '测试老师',
        email: 'test@teacher.com',
        specialties: JSON.stringify(['数学', '科学', '艺术'])
      };

      const [result] = await sequelize.query(
        'INSERT INTO teachers (name, email, specialties, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
        { replacements: [teacherData.name, teacherData.email, teacherData.specialties] }
      );

      const [teacher] = await sequelize.query(
        'SELECT specialties FROM teachers WHERE email = ?',
        {
          replacements: [teacherData.email],
          type: sequelize.QueryTypes.SELECT
        }
      );

      const specialties = JSON.parse((teacher as any).specialties);
      expect(Array.isArray(specialties)).toBeTruthy();
      expect(specialties).toContain('数学');
      expect(specialties).toContain('科学');
    });
  });

  describe('Activity Model Tests', () => {
    let teacherId: number;

    beforeEach(async () => {
      // Create a teacher for activity relations
      const [result] = await sequelize.query(
        'INSERT INTO teachers (name, email, qualification, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
        { replacements: ['活动老师', 'activity@teacher.com', '学前教育'] }
      );
      teacherId = (result as any).insertId;
    });

    it('should create activity with all required fields', async () => {
      const activityData = {
        title: '春季户外活动',
        description: '带领孩子们接触大自然',
        type: '户外活动',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        location: '公园',
        capacity: 30,
        currentRegistrations: 0,
        fee: 50,
        status: '开放报名',
        organizerId: teacherId,
        targetAgeRange: '4-6岁',
        requirements: JSON.stringify(['穿运动鞋', '带水杯'])
      };

      const [result] = await sequelize.query(
        `INSERT INTO activities (title, description, type, startTime, endTime, location, capacity, currentRegistrations, fee, status, organizerId, targetAgeRange, requirements, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            activityData.title,
            activityData.description,
            activityData.type,
            activityData.startTime,
            activityData.endTime,
            activityData.location,
            activityData.capacity,
            activityData.currentRegistrations,
            activityData.fee,
            activityData.status,
            activityData.organizerId,
            activityData.targetAgeRange,
            activityData.requirements
          ]
        }
      );

      expect(result).toBeDefined();

      // Verify activity with organizer relation
      const [activity] = await sequelize.query(
        `SELECT a.*, t.name as organizer_name 
         FROM activities a 
         LEFT JOIN teachers t ON a.organizerId = t.id 
         WHERE a.title = ?`,
        {
          replacements: [activityData.title],
          type: sequelize.QueryTypes.SELECT
        }
      );

      expect(activity).toBeDefined();
      expect((activity as any).title).toBe(activityData.title);
      expect((activity as any).organizer_name).toBe('活动老师');
    });

    it('should validate capacity constraints', async () => {
      const activityData = {
        title: '容量测试活动',
        capacity: 20,
        currentRegistrations: 25 // Exceeds capacity
      };

      // This should be caught by application logic, not database
      const [result] = await sequelize.query(
        'INSERT INTO activities (title, capacity, currentRegistrations, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
        { replacements: [activityData.title, activityData.capacity, activityData.currentRegistrations] }
      );

      const [activity] = await sequelize.query(
        'SELECT * FROM activities WHERE title = ?',
        {
          replacements: [activityData.title],
          type: sequelize.QueryTypes.SELECT
        }
      );

      // Data is stored but logic should prevent this
      expect((activity as any).currentRegistrations).toBeGreaterThan((activity as any).capacity);
    });
  });

  describe('Enrollment Model Tests', () => {
    it('should create enrollment plan with valid data', async () => {
      const planData = {
        title: '2024年春季招生计划',
        description: '针对3-6岁儿童的全面发展教育',
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        targetCount: 100,
        currentCount: 0,
        status: '进行中',
        ageRange: '3-6岁',
        tuition: 2000,
        requirements: JSON.stringify(['户口本', '疫苗证明']),
        features: JSON.stringify(['双语教学', '艺术课程'])
      };

      const [result] = await sequelize.query(
        `INSERT INTO enrollment_plans (title, description, startDate, endDate, targetCount, currentCount, status, ageRange, tuition, requirements, features, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            planData.title,
            planData.description,
            planData.startDate,
            planData.endDate,
            planData.targetCount,
            planData.currentCount,
            planData.status,
            planData.ageRange,
            planData.tuition,
            planData.requirements,
            planData.features
          ]
        }
      );

      expect(result).toBeDefined();

      // Verify enrollment plan
      const [plan] = await sequelize.query(
        'SELECT * FROM enrollment_plans WHERE title = ?',
        {
          replacements: [planData.title],
          type: sequelize.QueryTypes.SELECT
        }
      );

      expect(plan).toBeDefined();
      expect((plan as any).title).toBe(planData.title);
      expect((plan as any).targetCount).toBe(planData.targetCount);

      // Verify JSON fields
      const requirements = JSON.parse((plan as any).requirements);
      expect(requirements).toContain('户口本');
      expect(requirements).toContain('疫苗证明');
    });

    it('should create enrollment application with parent relation', async () => {
      // Create parent user first
      const [parentResult] = await sequelize.query(
        'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['parent1', 'parent1@test.com', 'password', 'parent'] }
      );
      const parentId = (parentResult as any).insertId;

      // Create enrollment plan
      const [planResult] = await sequelize.query(
        'INSERT INTO enrollment_plans (title, startDate, endDate, targetCount, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        { 
          replacements: [
            '测试招生计划', 
            new Date(), 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
            50, 
            '进行中'
          ] 
        }
      );
      const planId = (planResult as any).insertId;

      // Create enrollment application
      const applicationData = {
        enrollmentPlanId: planId,
        parentId: parentId,
        studentName: '申请学生',
        studentGender: '男',
        studentBirthDate: '2020-06-15',
        parentName: '申请家长',
        parentPhone: '13900139001',
        parentEmail: 'parent1@test.com',
        preferredClassGrade: '中班',
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
            applicationData.enrollmentPlanId,
            applicationData.parentId,
            applicationData.studentName,
            applicationData.studentGender,
            applicationData.studentBirthDate,
            applicationData.parentName,
            applicationData.parentPhone,
            applicationData.parentEmail,
            applicationData.preferredClassGrade,
            applicationData.status,
            applicationData.submissionDate,
            applicationData.hasAllergies,
            applicationData.medicalHistory,
            applicationData.emergencyContact
          ]
        }
      );

      expect(appResult).toBeDefined();

      // Verify application with relations
      const [application] = await sequelize.query(
        `SELECT ea.*, ep.title as plan_title, u.username as parent_username
         FROM enrollment_applications ea
         LEFT JOIN enrollment_plans ep ON ea.enrollmentPlanId = ep.id
         LEFT JOIN users u ON ea.parentId = u.id
         WHERE ea.studentName = ?`,
        {
          replacements: [applicationData.studentName],
          type: sequelize.QueryTypes.SELECT
        }
      );

      expect(application).toBeDefined();
      expect((application as any).studentName).toBe(applicationData.studentName);
      expect((application as any).plan_title).toBe('测试招生计划');
      expect((application as any).parent_username).toBe('parent1');

      // Verify JSON fields
      const emergencyContact = JSON.parse((application as any).emergencyContact);
      expect(emergencyContact.name).toBe('紧急联系人');
    });
  });

  describe('AI Model Tests', () => {
    let userId: number;

    beforeEach(async () => {
      // Create user for AI relations
      const [result] = await sequelize.query(
        'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['aiuser', 'ai@test.com', 'password', 'teacher'] }
      );
      userId = (result as any).insertId;
    });

    it('should create AI conversation with messages', async () => {
      // Create AI conversation
      const conversationData = {
        userId: userId,
        title: '教学计划咨询',
        topic: 'lesson_planning',
        status: 'active',
        context: JSON.stringify({
          classGrade: '大班',
          subject: '数学',
          difficulty: 'medium'
        })
      };

      const [convResult] = await sequelize.query(
        'INSERT INTO ai_conversations (userId, title, topic, status, context, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: [
            conversationData.userId,
            conversationData.title,
            conversationData.topic,
            conversationData.status,
            conversationData.context
          ]
        }
      );
      const conversationId = (convResult as any).insertId;

      // Create AI messages
      const messageData = {
        conversationId: conversationId,
        userId: userId,
        role: 'user',
        content: '请帮我制定一个关于数字认知的教学计划',
        messageType: 'text',
        metadata: JSON.stringify({
          timestamp: new Date().toISOString(),
          sessionId: 'test-session-123'
        })
      };

      const [msgResult] = await sequelize.query(
        'INSERT INTO ai_messages (conversationId, userId, role, content, messageType, metadata, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: [
            messageData.conversationId,
            messageData.userId,
            messageData.role,
            messageData.content,
            messageData.messageType,
            messageData.metadata
          ]
        }
      );

      expect(msgResult).toBeDefined();

      // Verify conversation with messages
      const [conversation] = await sequelize.query(
        `SELECT c.*, COUNT(m.id) as message_count, u.username
         FROM ai_conversations c
         LEFT JOIN ai_messages m ON c.id = m.conversationId
         LEFT JOIN users u ON c.userId = u.id
         WHERE c.id = ?
         GROUP BY c.id`,
        {
          replacements: [conversationId],
          type: sequelize.QueryTypes.SELECT
        }
      );

      expect(conversation).toBeDefined();
      expect((conversation as any).title).toBe(conversationData.title);
      expect((conversation as any).username).toBe('aiuser');
      expect(parseInt((conversation as any).message_count)).toBeGreaterThan(0);
    });

    it('should track AI model usage', async () => {
      const usageData = {
        userId: userId,
        modelName: 'gpt-4',
        promptTokens: 150,
        completionTokens: 300,
        totalTokens: 450,
        cost: 0.05,
        requestType: 'chat_completion',
        responseTime: 1200,
        success: true
      };

      const [result] = await sequelize.query(
        `INSERT INTO ai_model_usages (userId, modelName, promptTokens, completionTokens, totalTokens, cost, requestType, responseTime, success, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            usageData.userId,
            usageData.modelName,
            usageData.promptTokens,
            usageData.completionTokens,
            usageData.totalTokens,
            usageData.cost,
            usageData.requestType,
            usageData.responseTime,
            usageData.success
          ]
        }
      );

      expect(result).toBeDefined();

      // Verify usage tracking
      const [usage] = await sequelize.query(
        'SELECT * FROM ai_model_usages WHERE userId = ? AND modelName = ?',
        {
          replacements: [userId, usageData.modelName],
          type: sequelize.QueryTypes.SELECT
        }
      );

      expect(usage).toBeDefined();
      expect((usage as any).totalTokens).toBe(usageData.totalTokens);
      expect((usage as any).cost).toBe(usageData.cost);
    });

    it('should store AI memory with vector embeddings', async () => {
      const memoryData = {
        userId: userId,
        content: '学生小明在数学课上表现积极，善于提问',
        summary: '小明数学课表现积极',
        importance: 0.8,
        memoryType: 'student_observation',
        tags: JSON.stringify(['学生表现', '数学', '积极']),
        context: JSON.stringify({
          studentName: '小明',
          subject: '数学',
          date: new Date().toISOString()
        }),
        embedding: JSON.stringify([0.1, 0.2, 0.3, 0.4, 0.5]) // Mock embedding vector
      };

      const [result] = await sequelize.query(
        `INSERT INTO ai_memories (userId, content, summary, importance, memoryType, tags, context, embedding, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            memoryData.userId,
            memoryData.content,
            memoryData.summary,
            memoryData.importance,
            memoryData.memoryType,
            memoryData.tags,
            memoryData.context,
            memoryData.embedding
          ]
        }
      );

      expect(result).toBeDefined();

      // Verify memory storage
      const [memory] = await sequelize.query(
        'SELECT * FROM ai_memories WHERE userId = ? AND summary = ?',
        {
          replacements: [userId, memoryData.summary],
          type: sequelize.QueryTypes.SELECT
        }
      );

      expect(memory).toBeDefined();
      expect((memory as any).importance).toBe(memoryData.importance);
      
      // Verify JSON fields
      const tags = JSON.parse((memory as any).tags);
      expect(tags).toContain('学生表现');
      
      const embedding = JSON.parse((memory as any).embedding);
      expect(Array.isArray(embedding)).toBeTruthy();
      expect(embedding).toHaveLength(5);
    });
  });

  describe('System Model Tests', () => {
    it('should create system configurations', async () => {
      const configs = [
        { key: 'school_name', value: '测试幼儿园', description: '学校名称' },
        { key: 'max_class_size', value: '30', description: '班级最大人数' },
        { key: 'enrollment_fee', value: '200', description: '报名费用' }
      ];

      for (const config of configs) {
        const [result] = await sequelize.query(
          'INSERT INTO system_configs (configKey, configValue, description, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
          { replacements: [config.key, config.value, config.description] }
        );
        expect(result).toBeDefined();
      }

      // Verify all configs
      const [configList] = await sequelize.query(
        'SELECT * FROM system_configs ORDER BY configKey',
        { type: sequelize.QueryTypes.SELECT }
      );

      expect(Array.isArray(configList)).toBeTruthy();
      expect(configList.length).toBe(3);
      expect((configList as any)[0].configKey).toBe('enrollment_fee');
    });

    it('should track operation logs', async () => {
      // Create user for operation logs
      const [userResult] = await sequelize.query(
        'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['admin', 'admin@test.com', 'password', 'admin'] }
      );
      const userId = (userResult as any).insertId;

      const logData = {
        userId: userId,
        action: 'CREATE_STUDENT',
        resource: 'students',
        resourceId: 1,
        details: JSON.stringify({
          studentName: '新学生',
          parentName: '家长姓名',
          action: '创建学生档案'
        }),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Test Browser',
        success: true
      };

      const [result] = await sequelize.query(
        `INSERT INTO operation_logs (userId, action, resource, resourceId, details, ipAddress, userAgent, success, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            logData.userId,
            logData.action,
            logData.resource,
            logData.resourceId,
            logData.details,
            logData.ipAddress,
            logData.userAgent,
            logData.success
          ]
        }
      );

      expect(result).toBeDefined();

      // Verify operation log with user relation
      const [log] = await sequelize.query(
        `SELECT ol.*, u.username 
         FROM operation_logs ol 
         LEFT JOIN users u ON ol.userId = u.id 
         WHERE ol.action = ?`,
        {
          replacements: [logData.action],
          type: sequelize.QueryTypes.SELECT
        }
      );

      expect(log).toBeDefined();
      expect((log as any).action).toBe(logData.action);
      expect((log as any).username).toBe('admin');
      
      // Verify JSON details
      const details = JSON.parse((log as any).details);
      expect(details.studentName).toBe('新学生');
    });

    it('should manage file storage records', async () => {
      const fileData = {
        originalName: '学生照片.jpg',
        fileName: 'student_photo_123456789.jpg',
        filePath: '/uploads/photos/student_photo_123456789.jpg',
        fileSize: 1024000,
        mimeType: 'image/jpeg',
        uploadedBy: 1,
        category: 'student_photos',
        description: '学生入学照片',
        isPublic: false,
        metadata: JSON.stringify({
          width: 800,
          height: 600,
          quality: 90
        })
      };

      const [result] = await sequelize.query(
        `INSERT INTO file_storages (originalName, fileName, filePath, fileSize, mimeType, uploadedBy, category, description, isPublic, metadata, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            fileData.originalName,
            fileData.fileName,
            fileData.filePath,
            fileData.fileSize,
            fileData.mimeType,
            fileData.uploadedBy,
            fileData.category,
            fileData.description,
            fileData.isPublic,
            fileData.metadata
          ]
        }
      );

      expect(result).toBeDefined();

      // Verify file storage
      const [file] = await sequelize.query(
        'SELECT * FROM file_storages WHERE originalName = ?',
        {
          replacements: [fileData.originalName],
          type: sequelize.QueryTypes.SELECT
        }
      );

      expect(file).toBeDefined();
      expect((file as any).fileName).toBe(fileData.fileName);
      expect((file as any).fileSize).toBe(fileData.fileSize);
      
      // Verify metadata
      const metadata = JSON.parse((file as any).metadata);
      expect(metadata.width).toBe(800);
      expect(metadata.height).toBe(600);
    });
  });

  describe('Complex Relationship Tests', () => {
    it('should handle student-class-teacher relationships', async () => {
      // Create teacher
      const [teacherResult] = await sequelize.query(
        'INSERT INTO teachers (name, email, qualification, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
        { replacements: ['关系测试老师', 'rel@teacher.com', '学前教育'] }
      );
      const teacherId = (teacherResult as any).insertId;

      // Create class
      const [classResult] = await sequelize.query(
        'INSERT INTO classes (name, grade, capacity, teacherId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['关系测试班', '大班', 25, teacherId] }
      );
      const classId = (classResult as any).insertId;

      // Create parent user
      const [parentResult] = await sequelize.query(
        'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['testparent', 'parent@rel.com', 'password', 'parent'] }
      );
      const parentId = (parentResult as any).insertId;

      // Create student
      const [studentResult] = await sequelize.query(
        'INSERT INTO students (name, gender, birthDate, parentId, classId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['关系测试学生', '女', '2020-05-01', parentId, classId] }
      );
      const studentId = (studentResult as any).insertId;

      // Verify complex relationship query
      const [relationship] = await sequelize.query(
        `SELECT 
           s.name as student_name,
           s.gender,
           c.name as class_name,
           c.grade,
           t.name as teacher_name,
           u.username as parent_username
         FROM students s
         LEFT JOIN classes c ON s.classId = c.id
         LEFT JOIN teachers t ON c.teacherId = t.id
         LEFT JOIN users u ON s.parentId = u.id
         WHERE s.id = ?`,
        {
          replacements: [studentId],
          type: sequelize.QueryTypes.SELECT
        }
      );

      expect(relationship).toBeDefined();
      expect((relationship as any).student_name).toBe('关系测试学生');
      expect((relationship as any).class_name).toBe('关系测试班');
      expect((relationship as any).teacher_name).toBe('关系测试老师');
      expect((relationship as any).parent_username).toBe('testparent');
    });

    it('should aggregate enrollment statistics', async () => {
      // Create enrollment plan
      const [planResult] = await sequelize.query(
        'INSERT INTO enrollment_plans (title, targetCount, currentCount, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        { replacements: ['统计测试计划', 100, 0, '进行中'] }
      );
      const planId = (planResult as any).insertId;

      // Create multiple applications
      const applications = [
        { status: '待审核', studentName: '学生1' },
        { status: '已通过', studentName: '学生2' },
        { status: '已通过', studentName: '学生3' },
        { status: '已拒绝', studentName: '学生4' },
        { status: '待审核', studentName: '学生5' }
      ];

      for (const app of applications) {
        await sequelize.query(
          'INSERT INTO enrollment_applications (enrollmentPlanId, studentName, status, parentName, parentPhone, submissionDate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
          { 
            replacements: [
              planId, 
              app.studentName, 
              app.status, 
              '测试家长', 
              '13900139000',
              new Date()
            ] 
          }
        );
      }

      // Get enrollment statistics
      const [stats] = await sequelize.query(
        `SELECT 
           COUNT(*) as total_applications,
           SUM(CASE WHEN status = '已通过' THEN 1 ELSE 0 END) as approved_count,
           SUM(CASE WHEN status = '待审核' THEN 1 ELSE 0 END) as pending_count,
           SUM(CASE WHEN status = '已拒绝' THEN 1 ELSE 0 END) as rejected_count,
           (SUM(CASE WHEN status = '已通过' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as approval_rate
         FROM enrollment_applications 
         WHERE enrollmentPlanId = ?`,
        {
          replacements: [planId],
          type: sequelize.QueryTypes.SELECT
        }
      );

      expect(stats).toBeDefined();
      expect((stats as any).total_applications).toBe(5);
      expect((stats as any).approved_count).toBe(2);
      expect((stats as any).pending_count).toBe(2);
      expect((stats as any).rejected_count).toBe(1);
      expect((stats as any).approval_rate).toBe(40); // 2/5 * 100
    });
  });
});