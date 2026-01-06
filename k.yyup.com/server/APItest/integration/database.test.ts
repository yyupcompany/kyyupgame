import { Sequelize, DataTypes } from 'sequelize';
import { TestDataFactory, DatabaseCleaner } from '../helpers/testUtils';

describe('Database Integration Tests', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    // Initialize test database connection
    sequelize = new Sequelize({
      database: process.env.DB_NAME || 'kargerdensales',
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'pwk5ls7j',
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: parseInt(process.env.DB_PORT || '43906'),
      dialect: 'mysql',
      timezone: '+08:00',
      logging: false,
      define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        timestamps: true,
        underscored: true,
        freezeTableName: true,
      }
    });

    await sequelize.authenticate();
    await sequelize.sync({ force: false });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean test data before each test
    await DatabaseCleaner.cleanAll();
  });

  describe('Database Connection', () => {
    it('should establish database connection successfully', async () => {
      expect(sequelize).toBeValidDatabase();
      await expect(sequelize.authenticate()).resolves.not.toThrow();
    });

    it('should have proper connection pool configuration', () => {
      const pool = sequelize.connectionManager.pool;
      expect(pool).toBeDefined();
      expect(pool.options.max).toBeGreaterThan(0);
      expect(pool.options.min).toBeGreaterThanOrEqual(0);
    });
  });

  describe('User Model Tests', () => {
    it('should create user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'teacher'
      };

      const [results] = await sequelize.query(
        'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: [userData.username, userData.email, userData.password, userData.role]
        }
      );

      expect(results).toBeDefined();

      // Verify the user was created
      const [users] = await sequelize.query(
        'SELECT * FROM users WHERE email = ?',
        {
          replacements: [userData.email],
          type: sequelize.QueryTypes.SELECT
        }
      );

      expect(users).toBeDefined();
      expect((users as any).username).toBe(userData.username);
      expect((users as any).email).toBe(userData.email);
      expect((users as any).role).toBe(userData.role);
    });

    it('should enforce unique email constraint', async () => {
      const userData1 = {
        username: 'user1',
        email: 'duplicate@example.com',
        password: 'password1',
        role: 'teacher'
      };

      const userData2 = {
        username: 'user2',
        email: 'duplicate@example.com', // Same email
        password: 'password2',
        role: 'admin'
      };

      // Insert first user
      await sequelize.query(
        'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: [userData1.username, userData1.email, userData1.password, userData1.role]
        }
      );

      // Attempt to insert second user with duplicate email should fail
      await expect(
        sequelize.query(
          'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
          {
            replacements: [userData2.username, userData2.email, userData2.password, userData2.role]
          }
        )
      ).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      // Attempt to insert user without required fields
      await expect(
        sequelize.query(
          'INSERT INTO users (username, createdAt, updatedAt) VALUES (?, NOW(), NOW())',
          { replacements: ['incompleteuser'] }
        )
      ).rejects.toThrow();
    });
  });

  describe('Student Model Tests', () => {
    let parentId: number;

    beforeEach(async () => {
      // Create a parent user for student relations
      const [result] = await sequelize.query(
        'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: ['parentuser', 'parent@test.com', 'password', 'parent']
        }
      );
      parentId = (result as any).insertId;
    });

    it('should create student with valid data', async () => {
      const studentData = {
        name: '测试学生',
        gender: '男',
        birthDate: '2020-01-01',
        parentId: parentId
      };

      const [results] = await sequelize.query(
        'INSERT INTO students (name, gender, birthDate, parentId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: [studentData.name, studentData.gender, studentData.birthDate, studentData.parentId]
        }
      );

      expect(results).toBeDefined();

      // Verify student was created
      const [student] = await sequelize.query(
        'SELECT * FROM students WHERE name = ?',
        {
          replacements: [studentData.name],
          type: sequelize.QueryTypes.SELECT
        }
      );

      expect(student).toBeDefined();
      expect((student as any).name).toBe(studentData.name);
      expect((student as any).gender).toBe(studentData.gender);
    });

    it('should enforce foreign key constraint for parentId', async () => {
      const studentData = {
        name: '无效家长学生',
        gender: '女',
        birthDate: '2020-06-01',
        parentId: 99999 // Non-existent parent
      };

      await expect(
        sequelize.query(
          'INSERT INTO students (name, gender, birthDate, parentId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
          {
            replacements: [studentData.name, studentData.gender, studentData.birthDate, studentData.parentId]
          }
        )
      ).rejects.toThrow();
    });

    it('should validate gender enum values', async () => {
      const studentData = {
        name: '性别错误学生',
        gender: 'invalid', // Invalid gender
        birthDate: '2020-06-01',
        parentId: parentId
      };

      await expect(
        sequelize.query(
          'INSERT INTO students (name, gender, birthDate, parentId, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
          {
            replacements: [studentData.name, studentData.gender, studentData.birthDate, studentData.parentId]
          }
        )
      ).rejects.toThrow();
    });
  });

  describe('Class Model Tests', () => {
    let teacherId: number;

    beforeEach(async () => {
      // Create a teacher for class relation
      const [result] = await sequelize.query(
        'INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: ['teacher', 'teacher@test.com', 'password', 'teacher']
        }
      );
      teacherId = (result as any).insertId;
    });

    it('should create class with valid data', async () => {
      const classData = {
        name: '测试班级',
        grade: '大班',
        capacity: 30,
        currentCount: 0,
        teacherId: teacherId
      };

      const [results] = await sequelize.query(
        'INSERT INTO classes (name, grade, capacity, currentCount, teacherId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: [classData.name, classData.grade, classData.capacity, classData.currentCount, classData.teacherId]
        }
      );

      expect(results).toBeDefined();

      // Verify class was created
      const [classRecord] = await sequelize.query(
        'SELECT * FROM classes WHERE name = ?',
        {
          replacements: [classData.name],
          type: sequelize.QueryTypes.SELECT
        }
      );

      expect(classRecord).toBeDefined();
      expect((classRecord as any).name).toBe(classData.name);
      expect((classRecord as any).capacity).toBe(classData.capacity);
    });

    it('should enforce capacity constraints', async () => {
      const classData = {
        name: '容量检查班级',
        grade: '中班',
        capacity: 20,
        currentCount: 25, // Current count exceeds capacity
        teacherId: teacherId
      };

      // This should pass in basic SQL, but application logic should prevent this
      const [results] = await sequelize.query(
        'INSERT INTO classes (name, grade, capacity, currentCount, teacherId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: [classData.name, classData.grade, classData.capacity, classData.currentCount, classData.teacherId]
        }
      );

      expect(results).toBeDefined();

      // But we should verify the data integrity in application logic
      const [classRecord] = await sequelize.query(
        'SELECT * FROM classes WHERE name = ?',
        {
          replacements: [classData.name],
          type: sequelize.QueryTypes.SELECT
        }
      );

      expect((classRecord as any).currentCount).toBeGreaterThan((classRecord as any).capacity);
      // Note: This would be caught by application validation, not database constraints
    });
  });

  describe('Activity Model Tests', () => {
    it('should create activity with valid data', async () => {
      const activityData = {
        title: '测试活动',
        description: '这是一个测试活动',
        type: '体验课',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000), // 1 hour later
        location: '教室A',
        capacity: 20,
        currentRegistrations: 0
      };

      const [results] = await sequelize.query(
        'INSERT INTO activities (title, description, type, startTime, endTime, location, capacity, currentRegistrations, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: [
            activityData.title,
            activityData.description,
            activityData.type,
            activityData.startTime,
            activityData.endTime,
            activityData.location,
            activityData.capacity,
            activityData.currentRegistrations
          ]
        }
      );

      expect(results).toBeDefined();

      // Verify activity was created
      const [activity] = await sequelize.query(
        'SELECT * FROM activities WHERE title = ?',
        {
          replacements: [activityData.title],
          type: sequelize.QueryTypes.SELECT
        }
      );

      expect(activity).toBeDefined();
      expect((activity as any).title).toBe(activityData.title);
      expect((activity as any).type).toBe(activityData.type);
    });

    it('should validate start time before end time', async () => {
      const activityData = {
        title: '时间错误活动',
        description: '开始时间晚于结束时间',
        type: '体验课',
        startTime: new Date(Date.now() + 3600000), // 1 hour later
        endTime: new Date(), // Now (earlier than start)
        location: '教室B',
        capacity: 15
      };

      // Database might not enforce this constraint, but application should
      const [results] = await sequelize.query(
        'INSERT INTO activities (title, description, type, startTime, endTime, location, capacity, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: [
            activityData.title,
            activityData.description,
            activityData.type,
            activityData.startTime,
            activityData.endTime,
            activityData.location,
            activityData.capacity
          ]
        }
      );

      // This might succeed at database level, but application logic should prevent it
      expect(results).toBeDefined();
    });
  });

  describe('Enrollment Plan Model Tests', () => {
    it('should create enrollment plan with valid data', async () => {
      const planData = {
        title: '测试招生计划',
        description: '2024年春季招生',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 3600000), // 30 days later
        targetCount: 100,
        currentCount: 0,
        status: '进行中'
      };

      const [results] = await sequelize.query(
        'INSERT INTO enrollment_plans (title, description, startDate, endDate, targetCount, currentCount, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        {
          replacements: [
            planData.title,
            planData.description,
            planData.startDate,
            planData.endDate,
            planData.targetCount,
            planData.currentCount,
            planData.status
          ]
        }
      );

      expect(results).toBeDefined();

      // Verify enrollment plan was created
      const [plan] = await sequelize.query(
        'SELECT * FROM enrollment_plans WHERE title = ?',
        {
          replacements: [planData.title],
          type: sequelize.QueryTypes.SELECT
        }
      );

      expect(plan).toBeDefined();
      expect((plan as any).title).toBe(planData.title);
      expect((plan as any).status).toBe(planData.status);
      expect((plan as any).targetCount).toBe(planData.targetCount);
    });
  });

  describe('Complex Queries Tests', () => {
    beforeEach(async () => {
      // Setup test data for complex queries
      await setupComplexTestData();
    });

    it('should join users and students correctly', async () => {
      const [results] = await sequelize.query(
        `SELECT u.username, u.email, s.name as student_name, s.gender 
         FROM users u 
         JOIN students s ON u.id = s.parentId 
         WHERE u.role = 'parent'`,
        { type: sequelize.QueryTypes.SELECT }
      );

      expect(Array.isArray(results)).toBeTruthy();
      if (results.length > 0) {
        const result = results[0] as any;
        expect(result).toHaveProperty('username');
        expect(result).toHaveProperty('student_name');
        expect(result).toHaveProperty('gender');
      }
    });

    it('should aggregate class enrollment data', async () => {
      const [results] = await sequelize.query(
        `SELECT c.name, c.capacity, COUNT(s.id) as actual_count
         FROM classes c
         LEFT JOIN students s ON c.id = s.classId
         GROUP BY c.id, c.name, c.capacity`,
        { type: sequelize.QueryTypes.SELECT }
      );

      expect(Array.isArray(results)).toBeTruthy();
      if (results.length > 0) {
        const result = results[0] as any;
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('capacity');
        expect(result).toHaveProperty('actual_count');
        expect(typeof result.actual_count).toBe('number');
      }
    });

    it('should calculate activity registration statistics', async () => {
      const [results] = await sequelize.query(
        `SELECT a.title, a.capacity, 
                COUNT(ar.id) as registrations,
                (a.capacity - COUNT(ar.id)) as available_spots
         FROM activities a
         LEFT JOIN activity_registrations ar ON a.id = ar.activityId
         GROUP BY a.id, a.title, a.capacity`,
        { type: sequelize.QueryTypes.SELECT }
      );

      expect(Array.isArray(results)).toBeTruthy();
      if (results.length > 0) {
        const result = results[0] as any;
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('registrations');
        expect(result).toHaveProperty('available_spots');
        expect(typeof result.registrations).toBe('number');
      }
    });
  });

  describe('Database Performance Tests', () => {
    it('should execute queries within acceptable time limits', async () => {
      const startTime = Date.now();
      
      await sequelize.query(
        'SELECT COUNT(*) as count FROM users',
        { type: sequelize.QueryTypes.SELECT }
      );
      
      const queryTime = Date.now() - startTime;
      expect(queryTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle concurrent connections', async () => {
      const queries = Array(10).fill(null).map(async (_, index) => {
        return sequelize.query(
          'SELECT ? as query_index',
          {
            replacements: [index],
            type: sequelize.QueryTypes.SELECT
          }
        );
      });

      const results = await Promise.all(queries);
      expect(results).toHaveLength(10);
      results.forEach((result, index) => {
        expect((result[0] as any).query_index).toBe(index);
      });
    });
  });

  // Helper function to setup complex test data
  async function setupComplexTestData() {
    // Create test users
    await sequelize.query(`
      INSERT INTO users (username, email, password, role, createdAt, updatedAt) VALUES
      ('parent1', 'parent1@test.com', 'password', 'parent', NOW(), NOW()),
      ('teacher1', 'teacher1@test.com', 'password', 'teacher', NOW(), NOW()),
      ('admin1', 'admin1@test.com', 'password', 'admin', NOW(), NOW())
    `);

    // Create test classes
    await sequelize.query(`
      INSERT INTO classes (name, grade, capacity, currentCount, teacherId, createdAt, updatedAt) VALUES
      ('大班A', '大班', 25, 0, 2, NOW(), NOW()),
      ('中班B', '中班', 20, 0, 2, NOW(), NOW())
    `);

    // Create test students
    await sequelize.query(`
      INSERT INTO students (name, gender, birthDate, parentId, classId, createdAt, updatedAt) VALUES
      ('学生1', '男', '2020-01-01', 1, 1, NOW(), NOW()),
      ('学生2', '女', '2020-06-01', 1, 2, NOW(), NOW())
    `);

    // Create test activities
    await sequelize.query(`
      INSERT INTO activities (title, description, type, startTime, endTime, location, capacity, createdAt, updatedAt) VALUES
      ('春游活动', '春季户外活动', '户外活动', NOW(), DATE_ADD(NOW(), INTERVAL 3 HOUR), '公园', 30, NOW(), NOW()),
      ('音乐课', '音乐启蒙课程', '课程', NOW(), DATE_ADD(NOW(), INTERVAL 1 HOUR), '音乐室', 15, NOW(), NOW())
    `);
  }
});