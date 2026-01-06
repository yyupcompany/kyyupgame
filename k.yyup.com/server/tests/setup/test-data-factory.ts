/**
 * 测试数据工厂
 * 
 * 功能：
 * - 创建各种测试数据
 * - 数据关系管理
 * - 批量数据生成
 * - 数据清理
 */

import { getTestDbPool } from './database';

export class TestDataFactory {
  private pool = getTestDbPool();

  /**
   * 创建测试用户
   */
  async createUser(data: {
    username: string;
    email?: string;
    password?: string;
    role?: string;
    realName?: string;
    phone?: string;
  }): Promise<any> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(`
        INSERT INTO users (username, email, password, role, real_name, phone, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'active')
        RETURNING *
      `, [
        data.username,
        data.email || `${data.username}@test.com`,
        data.password || 'test-password-123',
        data.role || 'user',
        data.realName || data.username,
        data.phone || '13800138000'
      ]);

      const user = result.rows[0];
      console.log(`✅ 创建测试用户: ${user.username} (ID: ${user.id})`);
      return user;

    } catch (error) {
      console.error('❌ 创建测试用户失败:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 创建测试幼儿园
   */
  async createKindergarten(data: {
    name: string;
    address?: string;
    phone?: string;
    principalId?: number;
  }): Promise<any> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(`
        INSERT INTO kindergartens (name, address, phone, principal_id, status)
        VALUES ($1, $2, $3, $4, 'active')
        RETURNING *
      `, [
        data.name,
        data.address || '测试地址123号',
        data.phone || '010-12345678',
        data.principalId || null
      ]);

      const kindergarten = result.rows[0];
      console.log(`✅ 创建测试幼儿园: ${kindergarten.name} (ID: ${kindergarten.id})`);
      return kindergarten;

    } catch (error) {
      console.error('❌ 创建测试幼儿园失败:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 分配学生到班级
   */
  async assignStudentToClass(studentId: number, classId: number): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query(`
        UPDATE students SET class_id = $1 WHERE id = $2
      `, [classId, studentId]);

      console.log(`✅ 分配学生 ${studentId} 到班级 ${classId}`);

    } catch (error) {
      console.error('❌ 分配学生到班级失败:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 创建测试教师
   */
  async createTeacher(data: {
    name: string;
    email?: string;
    phone?: string;
    subject?: string;
    userId?: number;
  }): Promise<any> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(`
        INSERT INTO teachers (name, email, phone, subject, user_id, hire_date)
        VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
        RETURNING *
      `, [
        data.name,
        data.email || `${data.name.toLowerCase().replace(/\s+/g, '')}@test.com`,
        data.phone || '13800138000',
        data.subject || '幼儿教育',
        data.userId || null
      ]);

      const teacher = result.rows[0];
      console.log(`✅ 创建测试教师: ${teacher.name} (ID: ${teacher.id})`);
      return teacher;

    } catch (error) {
      console.error('❌ 创建测试教师失败:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 创建测试班级
   */
  async createClass(data: {
    name: string;
    teacherId: number;
    gradeLevel?: string;
    capacity?: number;
  }): Promise<any> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(`
        INSERT INTO classes (name, teacher_id, grade_level, capacity)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [
        data.name,
        data.teacherId,
        data.gradeLevel || '小班',
        data.capacity || 30
      ]);

      const classInfo = result.rows[0];
      console.log(`✅ 创建测试班级: ${classInfo.name} (ID: ${classInfo.id})`);
      return classInfo;

    } catch (error) {
      console.error('❌ 创建测试班级失败:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 创建测试学生
   */
  async createStudent(data: {
    name: string;
    classId?: number;
    gender?: string;
    birthDate?: string;
    parentName?: string;
    parentPhone?: string;
    parentEmail?: string;
  }): Promise<any> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(`
        INSERT INTO students (
          name, class_id, gender, birth_date, parent_name, 
          parent_phone, parent_email, enrollment_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE)
        RETURNING *
      `, [
        data.name,
        data.classId || null,
        data.gender || '男',
        data.birthDate || '2020-01-01',
        data.parentName || `${data.name}家长`,
        data.parentPhone || '13900139000',
        data.parentEmail || `${data.name.toLowerCase()}parent@test.com`
      ]);

      const student = result.rows[0];
      
      // 如果指定了班级，更新班级学生数量
      if (data.classId) {
        await client.query(`
          UPDATE classes 
          SET current_students = current_students + 1 
          WHERE id = $1
        `, [data.classId]);
      }

      console.log(`✅ 创建测试学生: ${student.name} (ID: ${student.id})`);
      return student;

    } catch (error) {
      console.error('❌ 创建测试学生失败:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 创建测试活动
   */
  async createActivity(data: {
    title: string;
    description?: string;
    activityType?: string;
    startDate?: Date;
    endDate?: Date;
    location?: string;
    capacity?: number;
    createdBy?: number;
  }): Promise<any> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(`
        INSERT INTO activities (
          title, description, activity_type, start_date, 
          end_date, location, capacity, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        data.title,
        data.description || `${data.title}的详细描述`,
        data.activityType || '户外活动',
        data.startDate || new Date(),
        data.endDate || new Date(Date.now() + 2 * 60 * 60 * 1000), // 2小时后
        data.location || '幼儿园操场',
        data.capacity || 50,
        data.createdBy || 1
      ]);

      const activity = result.rows[0];
      console.log(`✅ 创建测试活动: ${activity.title} (ID: ${activity.id})`);
      return activity;

    } catch (error) {
      console.error('❌ 创建测试活动失败:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 创建AI对话
   */
  async createAIConversation(data: {
    userId: number;
    title?: string;
    context?: any;
  }): Promise<any> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(`
        INSERT INTO ai_conversations (user_id, title, context)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [
        data.userId,
        data.title || '测试AI对话',
        JSON.stringify(data.context || { userRole: 'user', permissions: [] })
      ]);

      const conversation = result.rows[0];
      console.log(`✅ 创建AI对话: ${conversation.title} (ID: ${conversation.id})`);
      return conversation;

    } catch (error) {
      console.error('❌ 创建AI对话失败:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 创建AI消息
   */
  async createAIMessage(data: {
    conversationId: number;
    role: 'user' | 'assistant';
    content: string;
    metadata?: any;
  }): Promise<any> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(`
        INSERT INTO ai_messages (conversation_id, role, content, metadata)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [
        data.conversationId,
        data.role,
        data.content,
        JSON.stringify(data.metadata || {})
      ]);

      const message = result.rows[0];
      console.log(`✅ 创建AI消息: ${data.role} - ${data.content.substring(0, 50)}...`);
      return message;

    } catch (error) {
      console.error('❌ 创建AI消息失败:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 批量创建学生
   */
  async createStudentsBatch(count: number, classId?: number): Promise<any[]> {
    const students = [];
    
    for (let i = 1; i <= count; i++) {
      const student = await this.createStudent({
        name: `测试学生${i}`,
        classId,
        gender: i % 2 === 0 ? '女' : '男',
        birthDate: `202${i % 4}-0${(i % 12) + 1}-01`
      });
      students.push(student);
    }

    console.log(`✅ 批量创建 ${count} 个测试学生`);
    return students;
  }

  /**
   * 批量创建教师
   */
  async createTeachersBatch(count: number): Promise<any[]> {
    const teachers = [];
    const subjects = ['语言', '数学', '科学', '艺术', '体育', '音乐'];
    
    for (let i = 1; i <= count; i++) {
      const teacher = await this.createTeacher({
        name: `测试教师${i}`,
        subject: subjects[i % subjects.length],
        email: `teacher${i}@test.com`,
        phone: `1380013800${i}`
      });
      teachers.push(teacher);
    }

    console.log(`✅ 批量创建 ${count} 个测试教师`);
    return teachers;
  }

  /**
   * 批量创建班级
   */
  async createClassesBatch(count: number, teacherIds: number[]): Promise<any[]> {
    const classes = [];
    const gradeLevels = ['小班', '中班', '大班'];
    
    for (let i = 1; i <= count; i++) {
      const teacherId = teacherIds[(i - 1) % teacherIds.length];
      const classInfo = await this.createClass({
        name: `测试班级${i}`,
        teacherId,
        gradeLevel: gradeLevels[i % gradeLevels.length],
        capacity: 25 + (i % 10)
      });
      classes.push(classInfo);
    }

    console.log(`✅ 批量创建 ${count} 个测试班级`);
    return classes;
  }

  /**
   * 创建完整的测试数据集
   */
  async createCompleteTestDataset(): Promise<{
    teachers: any[];
    classes: any[];
    students: any[];
    activities: any[];
  }> {
    console.log('🚀 开始创建完整测试数据集...');

    // 创建教师
    const teachers = await this.createTeachersBatch(5);
    
    // 创建班级
    const classes = await this.createClassesBatch(3, teachers.map(t => t.id));
    
    // 为每个班级创建学生
    const students = [];
    for (const classInfo of classes) {
      const classStudents = await this.createStudentsBatch(8, classInfo.id);
      students.push(...classStudents);
    }
    
    // 创建活动
    const activities = [];
    const activityTypes = ['户外活动', '艺术创作', '科学实验', '音乐表演', '体育运动'];
    for (let i = 1; i <= 5; i++) {
      const activity = await this.createActivity({
        title: `测试活动${i}`,
        activityType: activityTypes[i - 1],
        startDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000), // i天后
        capacity: 20 + i * 5,
        createdBy: teachers[i % teachers.length].user_id || 1
      });
      activities.push(activity);
    }

    console.log('✅ 完整测试数据集创建完成');
    console.log(`   - 教师: ${teachers.length} 个`);
    console.log(`   - 班级: ${classes.length} 个`);
    console.log(`   - 学生: ${students.length} 个`);
    console.log(`   - 活动: ${activities.length} 个`);

    return { teachers, classes, students, activities };
  }

  /**
   * 清理测试数据
   */
  async cleanup(): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 按依赖关系顺序删除
      await client.query('DELETE FROM ai_messages WHERE id > 0');
      await client.query('DELETE FROM ai_conversations WHERE id > 0');
      await client.query('DELETE FROM activities WHERE id > 0');
      await client.query('DELETE FROM students WHERE id > 0');
      await client.query('DELETE FROM classes WHERE id > 0');
      await client.query('DELETE FROM teachers WHERE id > 0');
      
      await client.query('COMMIT');
      console.log('✅ 测试数据清理完成');
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ 测试数据清理失败:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 创建招生计划
   */
  async createEnrollmentPlan(data: {
    title: string;
    startDate: Date;
    endDate: Date;
    totalQuota: number;
    description?: string;
    status?: string;
  }): Promise<any> {
    const client = await this.pool.connect();

    try {
      // 首先确保表存在
      await client.query(`
        CREATE TABLE IF NOT EXISTS enrollment_plans (
          id SERIAL PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          start_date TIMESTAMP NOT NULL,
          end_date TIMESTAMP NOT NULL,
          total_quota INTEGER NOT NULL,
          current_applications INTEGER DEFAULT 0,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const result = await client.query(`
        INSERT INTO enrollment_plans (title, description, start_date, end_date, total_quota, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        data.title,
        data.description || `${data.title}的详细说明`,
        data.startDate,
        data.endDate,
        data.totalQuota,
        data.status || 'active'
      ]);

      const plan = result.rows[0];
      console.log(`✅ 创建招生计划: ${plan.title} (ID: ${plan.id})`);
      return plan;

    } catch (error) {
      console.error('❌ 创建招生计划失败:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 创建活动报名记录
   */
  async createActivityRegistration(data: {
    activityId: number;
    studentId: number;
    notes?: string;
    status?: string;
  }): Promise<any> {
    const client = await this.pool.connect();

    try {
      // 确保表存在
      await client.query(`
        CREATE TABLE IF NOT EXISTS activity_registrations (
          id SERIAL PRIMARY KEY,
          activity_id INTEGER REFERENCES activities(id),
          student_id INTEGER REFERENCES students(id),
          notes TEXT,
          status VARCHAR(20) DEFAULT 'registered',
          registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const result = await client.query(`
        INSERT INTO activity_registrations (activity_id, student_id, notes, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [
        data.activityId,
        data.studentId,
        data.notes || '',
        data.status || 'registered'
      ]);

      // 更新活动的当前报名人数
      await client.query(`
        UPDATE activities
        SET current_registrations = current_registrations + 1
        WHERE id = $1
      `, [data.activityId]);

      const registration = result.rows[0];
      console.log(`✅ 创建活动报名: 活动${data.activityId} - 学生${data.studentId}`);
      return registration;

    } catch (error) {
      console.error('❌ 创建活动报名失败:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 获取统计信息
   */
  async getStats(): Promise<any> {
    const client = await this.pool.connect();

    try {
      const stats = {};

      const tables = ['users', 'teachers', 'classes', 'students', 'activities', 'ai_conversations', 'ai_messages'];

      for (const table of tables) {
        const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        stats[table] = parseInt(result.rows[0].count);
      }

      return stats;

    } catch (error) {
      console.error('❌ 获取统计信息失败:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}
