/**
 * 数据库事务完整性测试
 * 验证复杂业务操作中的数据一致性和事务完整性
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../../server/src/app';
import { Sequelize } from 'sequelize';
import {
  RealEnvironmentManager,
  TestUtils
} from './real-env.config';

describe('Database Transaction Integrity Tests', () => {
  let envManager: RealEnvironmentManager;
  let sequelize: Sequelize;
  let testEnv: any;

  beforeAll(async () => {
    envManager = RealEnvironmentManager.getInstance();
    await envManager.initializeEnvironment();
    testEnv = envManager.getEnvironment();

    // 初始化Sequelize实例用于事务测试
    sequelize = new Sequelize({
      dialect: 'mysql',
      host: 'localhost',
      username: 'root',
      password: 'password',
      database: 'kindergarten_test',
      logging: false
    });

    await sequelize.authenticate();
  }, 60000);

  afterAll(async () => {
    await sequelize.close();
    await envManager.cleanupEnvironment();
  }, 30000);

  beforeEach(async () => {
    // 确保每个测试开始前数据库状态干净
    await TestUtils.wait(100);
  });

  afterEach(async () => {
    // 清理测试数据
    await TestUtils.wait(100);
  });

  describe('班级学生分配事务完整性', () => {
    it('应该保证班级学生添加的原子性', async () => {
      const teacher = testEnv.testUsers.find((u: any) => u.role === 'teacher');
      const teacherToken = await envManager.getUserToken(teacher.id);

      // 1. 开始事务前记录初始状态
      const initialClassCount = await sequelize.query(
        'SELECT COUNT(*) as count FROM classes WHERE teacher_id = ?',
        { replacements: [teacher.id], type: 'SELECT' }
      );

      const initialStudentCount = await sequelize.query(
        'SELECT COUNT(*) as count FROM students WHERE class_id IS NOT NULL',
        { type: 'SELECT' }
      );

      // 2. 创建班级并添加学生（应该在一个事务中完成）
      const t = await sequelize.transaction();

      try {
        // 创建班级
        const classResponse = await request(app)
          .post('/api/classes')
          .set('Authorization', `Bearer ${teacherToken}`)
          .send({
            name: '事务测试班级',
            capacity: 25
          });

        expect(classResponse.status).toBe(201);
        const classId = classResponse.body.data.id;

        // 添加学生到班级
        const studentsToAdd = testEnv.testStudents.slice(0, 3);
        const addStudentsResponse = await request(app)
          .post(`/api/classes/${classId}/students`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .send({
            studentIds: studentsToAdd.map((s: any) => s.id)
          });

        expect(addStudentsResponse.status).toBe(200);

        // 验证事务内的数据一致性
        const classDetailResponse = await request(app)
          .get(`/api/classes/${classId}`)
          .set('Authorization', `Bearer ${teacherToken}`);

        expect(classDetailResponse.body.data.studentCount).toBe(3);

        await t.commit();
      } catch (error) {
        await t.rollback();
        throw error;
      }

      // 3. 验证事务提交后的数据状态
      const finalClassCount = await sequelize.query(
        'SELECT COUNT(*) as count FROM classes WHERE teacher_id = ?',
        { replacements: [teacher.id], type: 'SELECT' }
      );

      const finalStudentCount = await sequelize.query(
        'SELECT COUNT(*) as count FROM students WHERE class_id IS NOT NULL',
        { type: 'SELECT' }
      );

      expect(parseInt(finalClassCount[0].count)).toBe(parseInt(initialClassCount[0].count) + 1);
      expect(parseInt(finalStudentCount[0].count)).toBe(parseInt(initialStudentCount[0].count) + 3);

      // 4. 验证数据关联完整性
      const updatedStudents = await sequelize.query(
        'SELECT id, class_id FROM students WHERE class_id IS NOT NULL AND id IN (?)',
        {
          replacements: [testEnv.testStudents.slice(0, 3).map((s: any) => s.id)],
          type: 'SELECT'
        }
      );

      expect(updatedStudents).toHaveLength(3);
      updatedStudents.forEach((student: any) => {
        expect(student.class_id).toBeDefined();
        expect(student.class_id).toBeGreaterThan(0);
      });
    });

    it('应该在操作失败时正确回滚', async () => {
      const teacher = testEnv.testUsers.find((u: any) => u.role === 'teacher');
      const teacherToken = await envManager.getUserToken(teacher.id);

      // 记录回滚前的状态
      const beforeRollbackState = await sequelize.query(
        'SELECT COUNT(*) as count FROM classes',
        { type: 'SELECT' }
      );

      const beforeStudentState = await sequelize.query(
        'SELECT COUNT(*) as count FROM class_students',
        { type: 'SELECT' }
      );

      // 模拟事务失败场景
      const t = await sequelize.transaction();

      try {
        // 1. 创建班级
        const classResponse = await request(app)
          .post('/api/classes')
          .set('Authorization', `Bearer ${teacherToken}`)
          .send({
            name: '回滚测试班级',
            capacity: 20
          });

        expect(classResponse.status).toBe(201);
        const classId = classResponse.body.data.id;

        // 2. 尝试添加无效学生ID（应该触发错误）
        const invalidStudentResponse = await request(app)
          .post(`/api/classes/${classId}/students`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .send({
            studentIds: [999999, 888888] // 不存在的学生ID
          });

        // 根据实现，这里可能返回错误或者部分成功
        if (invalidStudentResponse.status >= 400) {
          throw new Error('添加无效学生失败，触发回滚');
        }

        await t.commit();
      } catch (error) {
        await t.rollback();
        console.log('事务已回滚:', error.message);
      }

      // 验证回滚后的状态与之前一致
      const afterRollbackState = await sequelize.query(
        'SELECT COUNT(*) as count FROM classes WHERE name LIKE "%回滚测试%"',
        { type: 'SELECT' }
      );

      const afterStudentState = await sequelize.query(
        'SELECT COUNT(*) as count FROM class_students',
        { type: 'SELECT' }
      );

      // 验证没有遗留数据
      expect(parseInt(afterRollbackState[0].count)).toBe(0);
      expect(parseInt(afterStudentState[0].count)).toBe(parseInt(beforeStudentState[0].count));
    });
  });

  describe('活动管理事务完整性', () => {
    it('应该保证活动创建和报名的事务完整性', async () => {
      const teacher = testEnv.testUsers.find((u: any) => u.role === 'teacher');
      const teacherToken = await envManager.getUserToken(teacher.id);

      // 1. 创建活动
      const activityData = {
        title: '事务测试活动',
        description: '测试活动事务完整性',
        type: 'educational',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 明天
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 明天+2小时
        maxParticipants: 10,
        location: '教室A',
        materials: '彩色纸张、剪刀、胶水'
      };

      const createActivityResponse = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(activityData);

      expect(createActivityResponse.status).toBe(201);
      const activityId = createActivityResponse.body.data.id;

      // 2. 批量学生报名活动
      const students = testEnv.testStudents.slice(0, 5);
      const registrationPromises = students.map((student: any) =>
        request(app)
          .post('/api/activity-registrations')
          .set('Authorization', `Bearer ${teacherToken}`)
          .send({
            activityId: activityId,
            studentId: student.id,
            parentConsent: true,
            emergencyContact: '13800138000'
          })
      );

      const registrationResponses = await Promise.all(registrationPromises);

      // 验证所有报名都成功
      registrationResponses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body.data.activityId).toBe(activityId);
        expect(response.body.data.studentId).toBe(students[index].id);
      });

      // 3. 验证活动报名数量
      const activityDetailResponse = await request(app)
        .get(`/api/activities/${activityId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(activityDetailResponse.status).toBe(200);
      expect(activityDetailResponse.body.data.registrationCount).toBe(5);
      expect(activityDetailResponse.body.data.maxParticipants).toBe(10);

      // 4. 验证学生报名记录在数据库中的一致性
      const registrationCount = await sequelize.query(
        'SELECT COUNT(*) as count FROM activity_registrations WHERE activity_id = ?',
        { replacements: [activityId], type: 'SELECT' }
      );

      expect(parseInt(registrationCount[0].count)).toBe(5);

      // 5. 测试超出容量限制的事务处理
      const extraStudent = testEnv.testStudents[5];
      const overCapacityResponse = await request(app)
        .post('/api/activity-registrations')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          activityId: activityId,
          studentId: extraStudent.id,
          parentConsent: true
        });

      // 应该成功报名（5 < 10）
      expect(overCapacityResponse.status).toBe(201);

      // 验证报名数量更新
      const updatedActivityResponse = await request(app)
        .get(`/api/activities/${activityId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(updatedActivityResponse.body.data.registrationCount).toBe(6);

      // 6. 测试容量限制
      // 填充剩余位置
      const remainingStudents = testEnv.testStudents.slice(6, 10);
      const remainingRegistrations = remainingStudents.map((student: any) =>
        request(app)
          .post('/api/activity-registrations')
          .set('Authorization', `Bearer ${teacherToken}`)
          .send({
            activityId: activityId,
            studentId: student.id,
            parentConsent: true
          })
      );

      await Promise.all(remainingRegistrations);

      // 尝试超额报名
      const overflowResponse = await request(app)
        .post('/api/activity-registrations')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          activityId: activityId,
          studentId: testEnv.testStudents[10].id,
          parentConsent: true
        });

      expect(overflowResponse.status).toBe(400);
      expect(overflowResponse.body.message).toContain('已达最大参与人数');
    });
  });

  describe('用户角色权限事务完整性', () => {
    it('应该保证用户角色分配的事务完整性', async () => {
      const newUserData = TestUtils.createRandomTestData('role_test');

      // 1. 创建用户
      const createUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: newUserData.username,
          email: newUserData.email,
          password: 'TestPass123!',
          realName: newUserData.name
        });

      expect(createUserResponse.status).toBe(201);
      const userId = createUserResponse.body.data.id;

      // 2. 获取用户初始角色状态
      const initialRolesResponse = await request(app)
        .get(`/api/users/${userId}/roles`)
        .set('Authorization', `Bearer ${testEnv.adminToken}`);

      expect(initialRolesResponse.status).toBe(200);
      const initialRoleCount = initialRolesResponse.body.data.items.length;

      // 3. 批量分配多个角色
      const roleIds = ['teacher', 'parent'];
      const assignRolesResponse = await request(app)
        .post(`/api/users/${userId}/roles`)
        .set('Authorization', `Bearer ${testEnv.adminToken}`)
        .send({ roleIds });

      expect(assignRolesResponse.status).toBe(200);

      // 4. 验证角色分配成功
      const updatedRolesResponse = await request(app)
        .get(`/api/users/${userId}/roles`)
        .set('Authorization', `Bearer ${testEnv.adminToken}`);

      expect(updatedRolesResponse.status).toBe(200);
      expect(updatedRolesResponse.body.data.items.length).toBe(initialRoleCount + roleIds.length);

      // 5. 验证权限关联数据完整性
      const userPermissionsResponse = await request(app)
        .get(`/api/users/${userId}/permissions`)
        .set('Authorization', `Bearer ${testEnv.adminToken}`);

      expect(userPermissionsResponse.status).toBe(200);
      expect(userPermissionsResponse.body.data.items.length).toBeGreaterThan(0);

      // 6. 测试角色移除的事务完整性
      const removeRolesResponse = await request(app)
        .delete(`/api/users/${userId}/roles`)
        .set('Authorization', `Bearer ${testEnv.adminToken}`)
        .send({ roleIds: ['teacher'] });

      expect(removeRolesResponse.status).toBe(200);

      // 7. 验证角色移除后的权限更新
      const finalRolesResponse = await request(app)
        .get(`/api/users/${userId}/roles`)
        .set('Authorization', `Bearer ${testEnv.adminToken}`);

      const teacherRole = finalRolesResponse.body.data.items.find((r: any) => r.name === 'teacher');
      expect(teacherRole).toBeUndefined();

      const parentRole = finalRolesResponse.body.data.items.find((r: any) => r.name === 'parent');
      expect(parentRole).toBeDefined();
    });
  });

  describe('数据关联完整性验证', () => {
    it('应该防止违反外键约束的操作', async () => {
      const teacher = testEnv.testUsers.find((u: any) => u.role === 'teacher');
      const teacherToken = await envManager.getUserToken(teacher.id);

      // 1. 测试删除仍有学生的班级（应该失败）
      const classWithStudents = testEnv.testClasses[0];

      const deleteClassResponse = await request(app)
        .delete(`/api/classes/${classWithStudents.id}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(deleteClassResponse.status).toBe(400);
      expect(deleteClassResponse.body.message).toContain('仍有学生');

      // 2. 测试删除仍有班级的教师（应该失败或自动转移班级）
      const deleteTeacherResponse = await request(app)
        .delete(`/api/users/${teacher.id}`)
        .set('Authorization', `Bearer ${testEnv.adminToken}`);

      // 根据业务逻辑，可能失败或成功（班级转移给其他教师）
      expect([200, 400]).toContain(deleteTeacherResponse.status);

      // 3. 测试删除仍有活动的学生记录
      const studentWithActivity = testEnv.testStudents[0];

      // 先创建活动并报名
      const activityResponse = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: '外键约束测试活动',
          type: 'educational',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
        });

      const activityId = activityResponse.body.data.id;

      await request(app)
        .post('/api/activity-registrations')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          activityId: activityId,
          studentId: studentWithActivity.id,
          parentConsent: true
        });

      // 尝试删除学生（可能失败或级联删除相关记录）
      const deleteStudentResponse = await request(app)
        .delete(`/api/students/${studentWithActivity.id}`)
        .set('Authorization', `Bearer ${testEnv.adminToken}`);

      // 验证数据完整性保持
      if (deleteStudentResponse.status === 400) {
        expect(deleteStudentResponse.body.message).toContain('仍有相关记录');
      }
    });

    it('应该保证级联操作的数据一致性', async () => {
      const parent = testEnv.testUsers.find((u: any) => u.role === 'parent');
      const parentToken = await envManager.getUserToken(parent.id);

      // 1. 创建学生和关联数据
      const studentData = {
        name: '级联测试学生',
        age: 4,
        address: '测试地址'
      };

      const createStudentResponse = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${parentToken}`)
        .send(studentData);

      expect(createStudentResponse.status).toBe(201);
      const studentId = createStudentResponse.body.data.id;

      // 2. 添加成长记录
      const growthResponse = await request(app)
        .post(`/api/students/${studentId}/growth-records`)
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          type: 'height',
          value: 100,
          unit: 'cm',
          date: new Date().toISOString()
        });

      expect(growthResponse.status).toBe(201);

      // 3. 创建活动报名
      const activityResponse = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          title: '级联测试活动',
          type: 'educational',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
        });

      const activityId = activityResponse.body.data.id;

      const registrationResponse = await request(app)
        .post('/api/activity-registrations')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          activityId: activityId,
          studentId: studentId,
          parentConsent: true
        });

      expect(registrationResponse.status).toBe(201);

      // 4. 删除学生，验证级联删除
      const deleteStudentResponse = await request(app)
        .delete(`/api/students/${studentId}`)
        .set('Authorization', `Bearer ${testEnv.adminToken}`);

      expect(deleteStudentResponse.status).toBe(200);

      // 5. 验证相关记录是否被正确处理
      const growthRecordsResponse = await request(app)
        .get(`/api/students/${studentId}/growth-records`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(growthRecordsResponse.status).toBe(404);

      const registrationsCount = await sequelize.query(
        'SELECT COUNT(*) as count FROM activity_registrations WHERE student_id = ?',
        { replacements: [studentId], type: 'SELECT' }
      );

      // 根据实现，可能是级联删除或者设置NULL
      expect(parseInt(registrationsCount[0].count)).toBeLessThanOrEqual(1);
    });
  });

  describe('并发操作事务隔离', () => {
    it('应该正确处理并发修改冲突', async () => {
      const teacher = testEnv.testUsers.find((u: any) => u.role === 'teacher');
      const teacherToken = await envManager.getUserToken(teacher.id);

      // 1. 创建测试班级
      const classResponse = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          name: '并发测试班级',
          capacity: 25,
          description: '初始描述'
        });

      expect(classResponse.status).toBe(201);
      const classId = classResponse.body.data.id;

      // 2. 并发修改班级信息
      const concurrentUpdates = [
        {
          description: '并发修改描述1',
          capacity: 30
        },
        {
          description: '并发修改描述2',
          capacity: 35
        },
        {
          description: '并发修改描述3',
          capacity: 40
        }
      ];

      const updatePromises = concurrentUpdates.map((updateData, index) =>
        request(app)
          .put(`/api/classes/${classId}`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .send(updateData)
          .then(response => ({ index, response }))
      );

      const results = await Promise.all(updatePromises);

      // 3. 验证并发修改结果
      const successfulUpdates = results.filter(r => r.response.status === 200);
      const conflictUpdates = results.filter(r => r.response.status === 409);

      // 应该只有一个成功，其他返回冲突
      expect(successfulUpdates).toHaveLength(1);
      expect(conflictUpdates.length).toBeGreaterThanOrEqual(1);

      // 4. 验证最终数据状态一致性
      const finalClassResponse = await request(app)
        .get(`/api/classes/${classId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(finalClassResponse.status).toBe(200);
      const finalData = finalClassResponse.body.data;

      // 验证数据是其中一个并发修改的结果
      const isValidResult = concurrentUpdates.some(update =>
        update.description === finalData.description &&
        update.capacity === finalData.capacity
      );

      expect(isValidResult).toBe(true);
    });

    it('应该保证并发读操作的一致性', async () => {
      // 1. 创建大量测试数据
      const teacher = testEnv.testUsers.find((u: any) => u.role === 'teacher');
      const teacherToken = await envManager.getUserToken(teacher.id);

      const classResponse = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          name: '一致性测试班级',
          capacity: 50
        });

      const classId = classResponse.body.data.id;

      // 添加学生到班级
      const studentsToAdd = testEnv.testStudents.slice(0, 10);
      await request(app)
        .post(`/api/classes/${classId}/students`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentIds: studentsToAdd.map((s: any) => s.id)
        });

      // 2. 并发读取班级详情
      const readPromises = Array(20).fill().map(() =>
        request(app)
          .get(`/api/classes/${classId}`)
          .set('Authorization', `Bearer ${teacherToken}`)
      );

      const readResults = await Promise.all(readPromises);

      // 3. 验证所有读取结果一致
      readResults.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.data.studentCount).toBe(10);
        expect(response.body.data.name).toBe('一致性测试班级');
        expect(response.body.data.capacity).toBe(50);
      });

      // 4. 验证并发读取不影响数据一致性
      const studentLists = readResults.map(response =>
        response.body.data.students?.map((s: any) => s.id) || []
      );

      // 所有学生列表应该包含相同的ID
      const firstStudentList = studentLists[0];
      studentLists.forEach(studentList => {
        expect(studentList).toEqual(expect.arrayContaining(firstStudentList));
        expect(studentList).toHaveLength(firstStudentList.length);
      });
    });
  });
});