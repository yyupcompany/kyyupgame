/**
 * 权限隔离测试
 * 验证教师和家长角色的数据访问权限是否正确隔离
 */

const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/init');

describe('权限隔离测试', () => {
  let testTeacher, testParent, testAdmin, testStudent1, testStudent2, testClass;

  beforeAll(async () => {
    // 创建测试数据
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // 创建测试用户
    const [adminUser] = await sequelize.query(`
      INSERT INTO users (username, real_name, role, email, status, created_at, updated_at)
      VALUES ('admin', '管理员', 'admin', 'admin@test.com', 'active', NOW(), NOW())
    `);
    testAdmin = adminUser.insertId;

    const [teacherUser] = await sequelize.query(`
      INSERT INTO users (username, real_name, role, email, status, created_at, updated_at)
      VALUES ('teacher1', '张老师', 'teacher', 'teacher@test.com', 'active', NOW(), NOW())
    `);
    testTeacher = teacherUser.insertId;

    const [parentUser] = await sequelize.query(`
      INSERT INTO users (username, real_name, role, email, status, created_at, updated_at)
      VALUES ('parent1', '李家长', 'parent', 'parent@test.com', 'active', NOW(), NOW())
    `);
    testParent = parentUser.insertId;

    // 创建测试班级
    const [classResult] = await sequelize.query(`
      INSERT INTO classes (name, code, kindergarten_id, capacity, status, created_at, updated_at)
      VALUES ('测试班级1', 'TEST001', 1, 30, 1, NOW(), NOW())
    `);
    testClass = classResult.insertId;

    // 创建测试学生
    const [student1Result] = await sequelize.query(`
      INSERT INTO students (name, student_no, class_id, kindergarten_id, status, created_at, updated_at)
      VALUES ('学生1', 'STU001', ?, 1, 1, NOW(), NOW())
    `, { replacements: [testClass] });
    testStudent1 = student1Result.insertId;

    const [student2Result] = await sequelize.query(`
      INSERT INTO students (name, student_no, class_id, kindergarten_id, status, created_at, updated_at)
      VALUES ('学生2', 'STU002', ?, 1, 1, NOW(), NOW())
    `, { replacements: [testClass] });
    testStudent2 = student2Result.insertId;

    // 建立教师-班级关联
    await sequelize.query(`
      INSERT INTO class_teachers (class_id, teacher_id, is_main_teacher, status, created_at, updated_at)
      VALUES (?, ?, 1, 1, NOW(), NOW())
    `, { replacements: [testClass, testTeacher] });

    // 建立家长-学生关联
    await sequelize.query(`
      INSERT INTO parent_student_relations (user_id, student_id, relationship, status, created_at, updated_at)
      VALUES (?, ?, 'parent', 'active', NOW(), NOW())
    `, { replacements: [testParent, testStudent1] });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('教师权限隔离', () => {
    let teacherToken;

    beforeAll(async () => {
      // 模拟教师登录获取token
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'teacher1',
          password: 'password123' // 假设的密码
        });
      teacherToken = response.body.data.token;
    });

    test('教师应该只能看到自己管理的班级的学生', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      // 验证返回的学生都属于教师管理的班级
      expect(response.body.success).toBe(true);
      if (response.body.data && response.body.data.items) {
        response.body.data.items.forEach(student => {
          expect(student.classId).toBe(testClass);
        });
      }
    });

    test('教师应该无法访问非自己管理班级的学生详情', async () => {
      // 创建另一个班级和学生
      const [otherClass] = await sequelize.query(`
        INSERT INTO classes (name, code, kindergarten_id, capacity, status, created_at, updated_at)
        VALUES ('其他班级', 'OTHER001', 1, 30, 1, NOW(), NOW())
      `);

      const [otherStudent] = await sequelize.query(`
        INSERT INTO students (name, student_no, class_id, kindergarten_id, status, created_at, updated_at)
        VALUES ('其他学生', 'OTHER001', ?, 1, 1, NOW(), NOW())
      `, { replacements: [otherClass.insertId] });

      const response = await request(app)
        .get(`/api/students/${otherStudent.insertId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('无权访问');
    });

    test('教师应该只能看到自己管理的班级列表', async () => {
      // 创建另一个班级
      await sequelize.query(`
        INSERT INTO classes (name, code, kindergarten_id, capacity, status, created_at, updated_at)
        VALUES ('其他班级2', 'OTHER002', 1, 30, 1, NOW(), NOW())
      `);

      const response = await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      // 验证返回的班级都是教师管理的班级
      expect(response.body.success).toBe(true);
      if (response.body.data && response.body.data.items) {
        response.body.data.items.forEach(classItem => {
          expect([testClass]).toContain(classItem.id);
        });
      }
    });
  });

  describe('家长权限隔离', () => {
    let parentToken;

    beforeAll(async () => {
      // 模拟家长登录获取token
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'parent1',
          password: 'password123' // 假设的密码
        });
      parentToken = response.body.data.token;
    });

    test('家长应该只能看到自己关联的学生', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      // 验证返回的学生都是家长关联的学生
      expect(response.body.success).toBe(true);
      if (response.body.data && response.body.data.items) {
        response.body.data.items.forEach(student => {
          expect([testStudent1]).toContain(student.id);
        });
      }
    });

    test('家长应该无法访问非自己关联的学生详情', async () => {
      const response = await request(app)
        .get(`/api/students/${testStudent2}`)
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('无权访问');
    });

    test('家长应该只能看到自己孩子所在的班级', async () => {
      const response = await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      // 验证返回的班级都是孩子所在的班级
      expect(response.body.success).toBe(true);
      if (response.body.data && response.body.data.items) {
        response.body.data.items.forEach(classItem => {
          expect([testClass]).toContain(classItem.id);
        });
      }
    });

    test('家长无法为其他家长添加学生关系', async () => {
      const response = await request(app)
        .post(`/api/parents/${testParent + 1}/students`)
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          studentId: testStudent2,
          relationship: 'parent'
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('PARENT_ADD_DENIED');
    });
  });

  describe('管理员权限', () => {
    let adminToken;

    beforeAll(async () => {
      // 模拟管理员登录获取token
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'password123' // 假设的密码
        });
      adminToken = response.body.data.token;
    });

    test('管理员应该能访问所有学生', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // 管理员应该能看到所有学生，不做权限限制
    });

    test('管理员应该能访问所有班级', async () => {
      const response = await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // 管理员应该能看到所有班级，不做权限限制
    });
  });
});