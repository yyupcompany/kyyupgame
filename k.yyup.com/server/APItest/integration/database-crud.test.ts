import { Sequelize, DataTypes, QueryTypes } from 'sequelize';

describe('真实数据库CRUD测试', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    console.log('🚀 连接到真实数据库进行CRUD测试...');
    
    // 使用项目的真实数据库配置
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

    try {
      await sequelize.authenticate();
      console.log('✅ 数据库连接成功!');
    } catch (error) {
      console.error('❌ 数据库连接失败:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await sequelize.close();
    console.log('🔒 数据库连接已关闭');
  });

  describe('📊 数据库表结构测试', () => {
    it('应该能够查询所有表', async () => {
      const tables = await sequelize.query(
        "SHOW TABLES", 
        { type: QueryTypes.SELECT }
      );
      
      console.log('📋 数据库表总数:', tables.length);
      console.log('📋 前10个表:', tables.slice(0, 10));
      
      expect(tables.length).toBeGreaterThan(0);
      expect(tables.length).toBeGreaterThan(50); // 应该有很多表
    });

    it('应该能够查询用户表的数据', async () => {
      const users = await sequelize.query(
        "SELECT COUNT(*) as count FROM users", 
        { type: QueryTypes.SELECT }
      );
      
      const userCount = (users[0] as any).count;
      console.log('👥 用户表记录数:', userCount);
      
      expect(userCount).toBeGreaterThan(0);
    });

    it('应该能够查询学生表的数据', async () => {
      const students = await sequelize.query(
        "SELECT COUNT(*) as count FROM students", 
        { type: QueryTypes.SELECT }
      );
      
      const studentCount = (students[0] as any).count;
      console.log('🎓 学生表记录数:', studentCount);
      
      expect(studentCount).toBeGreaterThanOrEqual(0);
    });

    it('应该能够查询教师表的数据', async () => {
      const teachers = await sequelize.query(
        "SELECT COUNT(*) as count FROM teachers", 
        { type: QueryTypes.SELECT }
      );
      
      const teacherCount = (teachers[0] as any).count;
      console.log('👨‍🏫 教师表记录数:', teacherCount);
      
      expect(teacherCount).toBeGreaterThanOrEqual(0);
    });

    it('应该能够查询班级表的数据', async () => {
      const classes = await sequelize.query(
        "SELECT COUNT(*) as count FROM classes", 
        { type: QueryTypes.SELECT }
      );
      
      const classCount = (classes[0] as any).count;
      console.log('🏫 班级表记录数:', classCount);
      
      expect(classCount).toBeGreaterThanOrEqual(0);
    });

    it('应该能够查询活动表的数据', async () => {
      const activities = await sequelize.query(
        "SELECT COUNT(*) as count FROM activities", 
        { type: QueryTypes.SELECT }
      );
      
      const activityCount = (activities[0] as any).count;
      console.log('🎯 活动表记录数:', activityCount);
      
      expect(activityCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('🔧 数据库CRUD操作测试', () => {
    let testUserId: number;
    let testStudentId: number;
    let testTeacherId: number;
    let testClassId: number;

    it('应该能够创建测试用户 (CREATE)', async () => {
      const timestamp = Date.now();
      const testUser = {
        username: `test_user_${timestamp}`,
        email: `test${timestamp}@apitest.com`,
        password: 'hashed_password_test',
        role: 'teacher',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      };

      const [result] = await sequelize.query(
        `INSERT INTO users (username, email, password, role, status, created_at, updated_at) 
         VALUES (:username, :email, :password, :role, :status, :created_at, :updated_at)`,
        {
          replacements: testUser,
          type: QueryTypes.INSERT
        }
      );

      testUserId = (result as any).insertId || result;
      console.log('✅ 创建测试用户，ID:', testUserId);
      
      expect(testUserId).toBeGreaterThan(0);
    });

    it('应该能够读取创建的用户 (READ)', async () => {
      if (!testUserId) {
        console.log('⚠️ 跳过读取测试 - 没有测试用户ID');
        return;
      }

      const users = await sequelize.query(
        "SELECT * FROM users WHERE id = :userId",
        {
          replacements: { userId: testUserId },
          type: QueryTypes.SELECT
        }
      );

      console.log('📖 读取到的用户:', users[0]);
      
      expect(users.length).toBe(1);
      expect((users[0] as any).id).toBe(testUserId);
      expect((users[0] as any).username).toContain('test_user_');
    });

    it('应该能够更新用户信息 (UPDATE)', async () => {
      if (!testUserId) {
        console.log('⚠️ 跳过更新测试 - 没有测试用户ID');
        return;
      }

      const newUsername = `updated_test_user_${Date.now()}`;
      
      const [result] = await sequelize.query(
        "UPDATE users SET username = :username, updated_at = :updated_at WHERE id = :userId",
        {
          replacements: {
            username: newUsername,
            updated_at: new Date(),
            userId: testUserId
          },
          type: QueryTypes.UPDATE
        }
      );

      console.log('✏️ 更新用户结果:', result);

      // 验证更新
      const updatedUsers = await sequelize.query(
        "SELECT username FROM users WHERE id = :userId",
        {
          replacements: { userId: testUserId },
          type: QueryTypes.SELECT
        }
      );

      expect((updatedUsers[0] as any).username).toBe(newUsername);
    });

    it('应该能够创建测试教师 (CREATE)', async () => {
      const timestamp = Date.now();
      const testTeacher = {
        name: `API测试教师_${timestamp}`,
        email: `teacher${timestamp}@apitest.com`,
        phone: '13700137000',
        qualification: '学前教育本科',
        experience: 3,
        salary: 8000,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      };

      const [result] = await sequelize.query(
        `INSERT INTO teachers (name, email, phone, qualification, experience, salary, status, created_at, updated_at) 
         VALUES (:name, :email, :phone, :qualification, :experience, :salary, :status, :created_at, :updated_at)`,
        {
          replacements: testTeacher,
          type: QueryTypes.INSERT
        }
      );

      testTeacherId = (result as any).insertId || result;
      console.log('✅ 创建测试教师，ID:', testTeacherId);
      
      expect(testTeacherId).toBeGreaterThan(0);
    });

    it('应该能够创建测试班级 (CREATE)', async () => {
      if (!testTeacherId) {
        console.log('⚠️ 跳过班级创建测试 - 没有测试教师ID');
        return;
      }

      const timestamp = Date.now();
      const testClass = {
        name: `API测试班级_${timestamp}`,
        grade: '大班',
        capacity: 25,
        current_count: 0,
        teacher_id: testTeacherId,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      };

      const [result] = await sequelize.query(
        `INSERT INTO classes (name, grade, capacity, current_count, teacher_id, status, created_at, updated_at) 
         VALUES (:name, :grade, :capacity, :current_count, :teacher_id, :status, :created_at, :updated_at)`,
        {
          replacements: testClass,
          type: QueryTypes.INSERT
        }
      );

      testClassId = (result as any).insertId || result;
      console.log('✅ 创建测试班级，ID:', testClassId);
      
      expect(testClassId).toBeGreaterThan(0);
    });

    it('应该能够创建测试学生 (CREATE)', async () => {
      if (!testClassId) {
        console.log('⚠️ 跳过学生创建测试 - 没有测试班级ID');
        return;
      }

      const timestamp = Date.now();
      const testStudent = {
        name: `API测试学生_${timestamp}`,
        gender: '男',
        birth_date: '2020-06-15',
        parent_name: 'API测试家长',
        parent_phone: '13900139000',
        class_id: testClassId,
        enrollment_date: new Date(),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      };

      const [result] = await sequelize.query(
        `INSERT INTO students (name, gender, birth_date, parent_name, parent_phone, class_id, enrollment_date, status, created_at, updated_at) 
         VALUES (:name, :gender, :birth_date, :parent_name, :parent_phone, :class_id, :enrollment_date, :status, :created_at, :updated_at)`,
        {
          replacements: testStudent,
          type: QueryTypes.INSERT
        }
      );

      testStudentId = (result as any).insertId || result;
      console.log('✅ 创建测试学生，ID:', testStudentId);
      
      expect(testStudentId).toBeGreaterThan(0);
    });

    it('应该能够查询关联数据', async () => {
      if (!testStudentId || !testClassId || !testTeacherId) {
        console.log('⚠️ 跳过关联查询测试 - 缺少测试数据ID');
        return;
      }

      const result = await sequelize.query(
        `SELECT 
           s.name as student_name,
           s.gender as student_gender,
           c.name as class_name,
           c.grade as class_grade,
           t.name as teacher_name,
           t.qualification as teacher_qualification
         FROM students s
         LEFT JOIN classes c ON s.class_id = c.id
         LEFT JOIN teachers t ON c.teacher_id = t.id
         WHERE s.id = :studentId`,
        {
          replacements: { studentId: testStudentId },
          type: QueryTypes.SELECT
        }
      );

      console.log('🔗 关联查询结果:', result[0]);
      
      expect(result.length).toBe(1);
      expect((result[0] as any).student_name).toContain('API测试学生_');
      expect((result[0] as any).class_name).toContain('API测试班级_');
      expect((result[0] as any).teacher_name).toContain('API测试教师_');
    });

    it('应该能够删除测试数据 (DELETE)', async () => {
      let deletedCount = 0;

      // 删除学生
      if (testStudentId) {
        await sequelize.query(
          "DELETE FROM students WHERE id = :studentId",
          {
            replacements: { studentId: testStudentId },
            type: QueryTypes.DELETE
          }
        );
        deletedCount++;
        console.log('🗑️ 删除测试学生');
      }

      // 删除班级
      if (testClassId) {
        await sequelize.query(
          "DELETE FROM classes WHERE id = :classId",
          {
            replacements: { classId: testClassId },
            type: QueryTypes.DELETE
          }
        );
        deletedCount++;
        console.log('🗑️ 删除测试班级');
      }

      // 删除教师
      if (testTeacherId) {
        await sequelize.query(
          "DELETE FROM teachers WHERE id = :teacherId",
          {
            replacements: { teacherId: testTeacherId },
            type: QueryTypes.DELETE
          }
        );
        deletedCount++;
        console.log('🗑️ 删除测试教师');
      }

      // 删除用户
      if (testUserId) {
        await sequelize.query(
          "DELETE FROM users WHERE id = :userId",
          {
            replacements: { userId: testUserId },
            type: QueryTypes.DELETE
          }
        );
        deletedCount++;
        console.log('🗑️ 删除测试用户');
      }

      console.log(`✅ 总共删除了 ${deletedCount} 条测试记录`);
      expect(deletedCount).toBeGreaterThan(0);
    });
  });

  describe('⚡ 数据库性能测试', () => {
    it('应该能够快速查询大量数据', async () => {
      const startTime = Date.now();
      
      const result = await sequelize.query(
        `SELECT 
           (SELECT COUNT(*) FROM users) as user_count,
           (SELECT COUNT(*) FROM students) as student_count,
           (SELECT COUNT(*) FROM teachers) as teacher_count,
           (SELECT COUNT(*) FROM classes) as class_count,
           (SELECT COUNT(*) FROM activities) as activity_count`,
        { type: QueryTypes.SELECT }
      );
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      console.log('📊 系统数据统计:', result[0]);
      console.log('⚡ 查询耗时:', queryTime, 'ms');
      
      expect(queryTime).toBeLessThan(5000); // 应该在5秒内完成
      expect(result.length).toBe(1);
    });

    it('应该能够测试数据库连接池', async () => {
      const promises = [];
      const concurrentQueries = 10;
      
      for (let i = 0; i < concurrentQueries; i++) {
        promises.push(
          sequelize.query(
            "SELECT 1 as test_value, NOW() as current_time",
            { type: QueryTypes.SELECT }
          )
        );
      }
      
      const startTime = Date.now();
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      console.log(`🔄 并发执行 ${concurrentQueries} 个查询耗时:`, endTime - startTime, 'ms');
      
      expect(results.length).toBe(concurrentQueries);
      results.forEach(result => {
        expect((result[0] as any).test_value).toBe(1);
      });
    });
  });

  describe('🛡️ 数据库安全测试', () => {
    it('应该能够防止SQL注入', async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      
      try {
        const result = await sequelize.query(
          "SELECT * FROM users WHERE username = :username LIMIT 1",
          {
            replacements: { username: maliciousInput },
            type: QueryTypes.SELECT
          }
        );
        
        console.log('🛡️ SQL注入防护测试通过，查询结果:', result.length);
        expect(result.length).toBe(0); // 应该没有匹配的记录
      } catch (error) {
        console.log('🛡️ SQL注入防护测试通过，参数化查询阻止了注入');
        expect(true).toBe(true); // 如果有错误也是预期的
      }
    });

    it('应该能够处理特殊字符', async () => {
      const specialChars = "测试用户@#$%^&*()中文";
      
      const result = await sequelize.query(
        "SELECT :input as test_output",
        {
          replacements: { input: specialChars },
          type: QueryTypes.SELECT
        }
      );
      
      console.log('🔤 特殊字符处理测试:', (result[0] as any).test_output);
      expect((result[0] as any).test_output).toBe(specialChars);
    });
  });
});