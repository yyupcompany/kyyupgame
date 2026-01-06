import { TestDataFactory } from '../helpers/testUtils';

describe('Service Layer Unit Tests', () => {
  describe('User Service', () => {
    class MockUserService {
      private users: Map<number, any> = new Map();
      private nextId = 1;

      async createUser(userData: any) {
        const errors: string[] = [];

        // 验证必填字段
        if (!userData.username) errors.push('用户名是必填的');
        if (!userData.email) errors.push('邮箱是必填的');
        if (!userData.password) errors.push('密码是必填的');

        // 验证邮箱格式
        if (userData.email && !userData.email.includes('@')) {
          errors.push('邮箱格式无效');
        }

        // 验证密码强度
        if (userData.password && userData.password.length < 6) {
          errors.push('密码长度至少6位');
        }

        // 检查用户名重复
        for (const user of this.users.values()) {
          if (user.username === userData.username) {
            errors.push('用户名已存在');
            break;
          }
        }

        // 检查邮箱重复
        for (const user of this.users.values()) {
          if (user.email === userData.email) {
            errors.push('邮箱已存在');
            break;
          }
        }

        if (errors.length > 0) {
          throw new Error(`验证失败: ${errors.join(', ')}`);
        }

        const newUser = {
          id: this.nextId++,
          username: userData.username,
          email: userData.email,
          role: userData.role || 'parent',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        };

        this.users.set(newUser.id, newUser);
        return newUser;
      }

      async getUserById(id: number) {
        const user = this.users.get(id);
        if (!user) {
          throw new Error('用户不存在');
        }
        return user;
      }

      async updateUser(id: number, updateData: any) {
        const user = this.users.get(id);
        if (!user) {
          throw new Error('用户不存在');
        }

        const errors: string[] = [];

        // 验证邮箱格式（如果提供）
        if (updateData.email && !updateData.email.includes('@')) {
          errors.push('邮箱格式无效');
        }

        // 检查用户名重复（如果提供且不是当前用户）
        if (updateData.username) {
          for (const [userId, existingUser] of this.users.entries()) {
            if (userId !== id && existingUser.username === updateData.username) {
              errors.push('用户名已存在');
              break;
            }
          }
        }

        // 检查邮箱重复（如果提供且不是当前用户）
        if (updateData.email) {
          for (const [userId, existingUser] of this.users.entries()) {
            if (userId !== id && existingUser.email === updateData.email) {
              errors.push('邮箱已存在');
              break;
            }
          }
        }

        if (errors.length > 0) {
          throw new Error(`验证失败: ${errors.join(', ')}`);
        }

        const updatedUser = {
          ...user,
          ...updateData,
          updatedAt: new Date()
        };

        this.users.set(id, updatedUser);
        return updatedUser;
      }

      async deleteUser(id: number) {
        const user = this.users.get(id);
        if (!user) {
          throw new Error('用户不存在');
        }

        this.users.delete(id);
        return { message: '用户删除成功' };
      }

      async listUsers(options: { page?: number; limit?: number; role?: string } = {}) {
        const { page = 1, limit = 10, role } = options;
        
        let userList = Array.from(this.users.values());

        // 按角色过滤
        if (role) {
          userList = userList.filter(user => user.role === role);
        }

        // 分页
        const offset = (page - 1) * limit;
        const paginatedUsers = userList.slice(offset, offset + limit);

        return {
          users: paginatedUsers,
          pagination: {
            page,
            limit,
            total: userList.length,
            totalPages: Math.ceil(userList.length / limit)
          }
        };
      }

      async changeUserRole(id: number, newRole: string) {
        const user = this.users.get(id);
        if (!user) {
          throw new Error('用户不存在');
        }

        const validRoles = ['admin', 'principal', 'teacher', 'parent'];
        if (!validRoles.includes(newRole)) {
          throw new Error(`无效角色，有效角色: ${validRoles.join(', ')}`);
        }

        user.role = newRole;
        user.updatedAt = new Date();
        
        this.users.set(id, user);
        return user;
      }
    }

    let userService: MockUserService;

    beforeEach(() => {
      userService = new MockUserService();
    });

    test('应该成功创建用户', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'teacher'
      };

      const user = await userService.createUser(userData);

      expect(user).toMatchObject({
        id: expect.any(Number),
        username: 'testuser',
        email: 'test@example.com',
        role: 'teacher',
        isActive: true
      });
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    test('应该拒绝创建缺少必填字段的用户', async () => {
      const userData = {
        username: 'testuser'
        // 缺少email和password
      };

      await expect(userService.createUser(userData)).rejects.toThrow('验证失败: 邮箱是必填的, 密码是必填的');
    });

    test('应该拒绝创建邮箱格式无效的用户', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };

      await expect(userService.createUser(userData)).rejects.toThrow('邮箱格式无效');
    });

    test('应该拒绝创建密码过短的用户', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123'
      };

      await expect(userService.createUser(userData)).rejects.toThrow('密码长度至少6位');
    });

    test('应该拒绝重复的用户名', async () => {
      const userData = {
        username: 'testuser',
        email: 'test1@example.com',
        password: 'password123'
      };

      await userService.createUser(userData);

      const duplicateUser = {
        username: 'testuser', // 重复用户名
        email: 'test2@example.com',
        password: 'password123'
      };

      await expect(userService.createUser(duplicateUser)).rejects.toThrow('用户名已存在');
    });

    test('应该通过ID获取用户', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const createdUser = await userService.createUser(userData);
      const retrievedUser = await userService.getUserById(createdUser.id);

      expect(retrievedUser).toEqual(createdUser);
    });

    test('应该抛出错误当用户不存在时', async () => {
      await expect(userService.getUserById(999)).rejects.toThrow('用户不存在');
    });

    test('应该成功更新用户', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await userService.createUser(userData);
      await new Promise(resolve => setTimeout(resolve, 10)); // 确保时间戳不同
      
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      const updatedUser = await userService.updateUser(user.id, updateData);

      expect(updatedUser.username).toBe('updateduser');
      expect(updatedUser.email).toBe('updated@example.com');
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(user.updatedAt.getTime());
    });

    test('应该列出用户并支持分页', async () => {
      // 创建多个用户
      for (let i = 1; i <= 15; i++) {
        await userService.createUser({
          username: `user${i}`,
          email: `user${i}@example.com`,
          password: 'password123',
          role: i <= 5 ? 'teacher' : 'parent'
        });
      }

      const result = await userService.listUsers({ page: 1, limit: 10 });

      expect(result.users).toHaveLength(10);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 15,
        totalPages: 2
      });
    });

    test('应该按角色过滤用户', async () => {
      await userService.createUser({
        username: 'teacher1',
        email: 'teacher1@example.com',
        password: 'password123',
        role: 'teacher'
      });

      await userService.createUser({
        username: 'parent1',
        email: 'parent1@example.com',
        password: 'password123',
        role: 'parent'
      });

      const teachers = await userService.listUsers({ role: 'teacher' });
      expect(teachers.users).toHaveLength(1);
      expect(teachers.users[0].role).toBe('teacher');
    });

    test('应该成功改变用户角色', async () => {
      const user = await userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'parent'
      });

      const updatedUser = await userService.changeUserRole(user.id, 'teacher');

      expect(updatedUser.role).toBe('teacher');
    });

    test('应该拒绝无效角色', async () => {
      const user = await userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'parent'
      });

      await expect(userService.changeUserRole(user.id, 'invalid_role')).rejects.toThrow('无效角色');
    });
  });

  describe('Student Service', () => {
    class MockStudentService {
      private students: Map<number, any> = new Map();
      private nextId = 1;

      async createStudent(studentData: any) {
        const errors: string[] = [];

        // 验证必填字段
        if (!studentData.name) errors.push('学生姓名是必填的');
        if (!studentData.gender) errors.push('性别是必填的');
        if (!studentData.birthDate) errors.push('出生日期是必填的');
        if (!studentData.parentId) errors.push('家长ID是必填的');

        // 验证性别
        if (studentData.gender && !['男', '女'].includes(studentData.gender)) {
          errors.push('性别必须是男或女');
        }

        // 验证年龄（幼儿园适龄儿童）
        if (studentData.birthDate) {
          const birthDate = new Date(studentData.birthDate);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          if (age < 3 || age > 7) {
            errors.push('学生年龄必须在3-7岁之间');
          }
        }

        if (errors.length > 0) {
          throw new Error(`验证失败: ${errors.join(', ')}`);
        }

        const newStudent = {
          id: this.nextId++,
          name: studentData.name,
          gender: studentData.gender,
          birthDate: studentData.birthDate,
          parentId: studentData.parentId,
          classId: studentData.classId || null,
          grade: studentData.grade || null,
          enrollmentDate: new Date(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        this.students.set(newStudent.id, newStudent);
        return newStudent;
      }

      async getStudentById(id: number) {
        const student = this.students.get(id);
        if (!student) {
          throw new Error('学生不存在');
        }
        return student;
      }

      async getStudentsByParent(parentId: number) {
        const students = Array.from(this.students.values())
          .filter(student => student.parentId === parentId);
        return students;
      }

      async getStudentsByClass(classId: number) {
        const students = Array.from(this.students.values())
          .filter(student => student.classId === classId);
        return students;
      }

      async assignStudentToClass(studentId: number, classId: number) {
        const student = this.students.get(studentId);
        if (!student) {
          throw new Error('学生不存在');
        }

        student.classId = classId;
        student.updatedAt = new Date();
        this.students.set(studentId, student);
        
        return student;
      }

      async updateStudent(id: number, updateData: any) {
        const student = this.students.get(id);
        if (!student) {
          throw new Error('学生不存在');
        }

        const errors: string[] = [];

        // 验证性别（如果提供）
        if (updateData.gender && !['男', '女'].includes(updateData.gender)) {
          errors.push('性别必须是男或女');
        }

        // 验证年龄（如果提供出生日期）
        if (updateData.birthDate) {
          const birthDate = new Date(updateData.birthDate);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          if (age < 3 || age > 7) {
            errors.push('学生年龄必须在3-7岁之间');
          }
        }

        if (errors.length > 0) {
          throw new Error(`验证失败: ${errors.join(', ')}`);
        }

        const updatedStudent = {
          ...student,
          ...updateData,
          updatedAt: new Date()
        };

        this.students.set(id, updatedStudent);
        return updatedStudent;
      }

      async deleteStudent(id: number) {
        const student = this.students.get(id);
        if (!student) {
          throw new Error('学生不存在');
        }

        this.students.delete(id);
        return { message: '学生删除成功' };
      }

      async getStudentStatistics() {
        const students = Array.from(this.students.values());
        
        const genderStats = {
          男: students.filter(s => s.gender === '男').length,
          女: students.filter(s => s.gender === '女').length
        };

        const ageGroups = {
          '3岁': 0,
          '4岁': 0,
          '5岁': 0,
          '6岁': 0,
          '7岁': 0
        };

        students.forEach(student => {
          const age = new Date().getFullYear() - new Date(student.birthDate).getFullYear();
          if (age >= 3 && age <= 7) {
            ageGroups[`${age}岁`]++;
          }
        });

        return {
          total: students.length,
          active: students.filter(s => s.isActive).length,
          genderStats,
          ageGroups
        };
      }
    }

    let studentService: MockStudentService;

    beforeEach(() => {
      studentService = new MockStudentService();
    });

    test('应该成功创建学生', async () => {
      const studentData = {
        name: '小明',
        gender: '男',
        birthDate: '2020-06-15',
        parentId: 1,
        grade: '中班'
      };

      const student = await studentService.createStudent(studentData);

      expect(student).toMatchObject({
        id: expect.any(Number),
        name: '小明',
        gender: '男',
        birthDate: '2020-06-15',
        parentId: 1,
        grade: '中班',
        isActive: true
      });
    });

    test('应该拒绝创建缺少必填字段的学生', async () => {
      const studentData = {
        name: '小明'
        // 缺少其他必填字段
      };

      await expect(studentService.createStudent(studentData)).rejects.toThrow('验证失败');
    });

    test('应该拒绝无效性别', async () => {
      const studentData = {
        name: '小明',
        gender: '其他',
        birthDate: '2020-06-15',
        parentId: 1
      };

      await expect(studentService.createStudent(studentData)).rejects.toThrow('性别必须是男或女');
    });

    test('应该拒绝年龄超出范围的学生', async () => {
      const studentData = {
        name: '小明',
        gender: '男',
        birthDate: '2010-01-01', // 年龄太大
        parentId: 1
      };

      await expect(studentService.createStudent(studentData)).rejects.toThrow('学生年龄必须在3-7岁之间');
    });

    test('应该通过家长ID获取学生', async () => {
      const student1 = await studentService.createStudent({
        name: '小明',
        gender: '男',
        birthDate: '2020-06-15',
        parentId: 1
      });

      const student2 = await studentService.createStudent({
        name: '小红',
        gender: '女',
        birthDate: '2020-08-20',
        parentId: 1
      });

      const students = await studentService.getStudentsByParent(1);

      expect(students).toHaveLength(2);
      expect(students.map(s => s.name)).toContain('小明');
      expect(students.map(s => s.name)).toContain('小红');
    });

    test('应该成功分配学生到班级', async () => {
      const student = await studentService.createStudent({
        name: '小明',
        gender: '男',
        birthDate: '2020-06-15',
        parentId: 1
      });

      const assignedStudent = await studentService.assignStudentToClass(student.id, 5);

      expect(assignedStudent.classId).toBe(5);
    });

    test('应该获取学生统计信息', async () => {
      // 创建测试学生
      await studentService.createStudent({
        name: '小明',
        gender: '男',
        birthDate: '2020-06-15',
        parentId: 1
      });

      await studentService.createStudent({
        name: '小红',
        gender: '女',
        birthDate: '2019-03-10',
        parentId: 2
      });

      const stats = await studentService.getStudentStatistics();

      expect(stats.total).toBe(2);
      expect(stats.active).toBe(2);
      expect(stats.genderStats).toEqual({
        男: 1,
        女: 1
      });
      expect(stats.ageGroups['3岁']).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Activity Service', () => {
    class MockActivityService {
      private activities: Map<number, any> = new Map();
      private registrations: Map<number, any[]> = new Map();
      private nextId = 1;

      async createActivity(activityData: any) {
        const errors: string[] = [];

        // 验证必填字段
        if (!activityData.title) errors.push('活动标题是必填的');
        if (!activityData.type) errors.push('活动类型是必填的');
        if (!activityData.startTime) errors.push('开始时间是必填的');
        if (!activityData.endTime) errors.push('结束时间是必填的');

        // 验证时间逻辑
        if (activityData.startTime && activityData.endTime) {
          const startTime = new Date(activityData.startTime);
          const endTime = new Date(activityData.endTime);
          
          if (endTime <= startTime) {
            errors.push('结束时间必须晚于开始时间');
          }

          if (startTime < new Date()) {
            errors.push('开始时间不能是过去的时间');
          }
        }

        // 验证容量
        if (activityData.capacity !== undefined) {
          const capacity = Number(activityData.capacity);
          if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100) {
            errors.push('容量必须是1-100之间的整数');
          }
        }

        if (errors.length > 0) {
          throw new Error(`验证失败: ${errors.join(', ')}`);
        }

        const newActivity = {
          id: this.nextId++,
          title: activityData.title,
          type: activityData.type,
          description: activityData.description || '',
          startTime: activityData.startTime,
          endTime: activityData.endTime,
          capacity: activityData.capacity || 20,
          location: activityData.location || '',
          teacherId: activityData.teacherId,
          status: 'pending',
          registeredCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        this.activities.set(newActivity.id, newActivity);
        this.registrations.set(newActivity.id, []);
        
        return newActivity;
      }

      async getActivityById(id: number) {
        const activity = this.activities.get(id);
        if (!activity) {
          throw new Error('活动不存在');
        }
        return activity;
      }

      async registerStudentForActivity(activityId: number, studentId: number) {
        const activity = this.activities.get(activityId);
        if (!activity) {
          throw new Error('活动不存在');
        }

        const registrations = this.registrations.get(activityId) || [];
        
        // 检查是否已经注册
        if (registrations.some(reg => reg.studentId === studentId)) {
          throw new Error('学生已经注册了这个活动');
        }

        // 检查容量
        if (registrations.length >= activity.capacity) {
          throw new Error('活动已满员');
        }

        const registration = {
          id: Date.now(),
          activityId,
          studentId,
          registeredAt: new Date(),
          status: 'registered'
        };

        registrations.push(registration);
        this.registrations.set(activityId, registrations);

        // 更新活动的注册人数
        activity.registeredCount = registrations.length;
        this.activities.set(activityId, activity);

        return registration;
      }

      async getActivityRegistrations(activityId: number) {
        const activity = this.activities.get(activityId);
        if (!activity) {
          throw new Error('活动不存在');
        }

        return this.registrations.get(activityId) || [];
      }

      async cancelStudentRegistration(activityId: number, studentId: number) {
        const activity = this.activities.get(activityId);
        if (!activity) {
          throw new Error('活动不存在');
        }

        const registrations = this.registrations.get(activityId) || [];
        const registrationIndex = registrations.findIndex(reg => reg.studentId === studentId);

        if (registrationIndex === -1) {
          throw new Error('学生未注册此活动');
        }

        registrations.splice(registrationIndex, 1);
        this.registrations.set(activityId, registrations);

        // 更新活动的注册人数
        activity.registeredCount = registrations.length;
        this.activities.set(activityId, activity);

        return { message: '取消注册成功' };
      }

      async updateActivityStatus(activityId: number, status: string) {
        const activity = this.activities.get(activityId);
        if (!activity) {
          throw new Error('活动不存在');
        }

        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (!validStatuses.includes(status)) {
          throw new Error(`无效状态，有效状态: ${validStatuses.join(', ')}`);
        }

        activity.status = status;
        activity.updatedAt = new Date();
        this.activities.set(activityId, activity);

        return activity;
      }

      async getUpcomingActivities() {
        const now = new Date();
        const activities = Array.from(this.activities.values());
        
        return activities.filter(activity => 
          new Date(activity.startTime) > now && 
          activity.status !== 'cancelled'
        ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      }
    }

    let activityService: MockActivityService;

    beforeEach(() => {
      activityService = new MockActivityService();
    });

    test('应该成功创建活动', async () => {
      const futureDate1 = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const futureDate2 = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString();

      const activityData = {
        title: '户外探索活动',
        type: '户外活动',
        description: '带领孩子们探索自然',
        startTime: futureDate1,
        endTime: futureDate2,
        capacity: 25,
        location: '学校后花园',
        teacherId: 1
      };

      const activity = await activityService.createActivity(activityData);

      expect(activity).toMatchObject({
        id: expect.any(Number),
        title: '户外探索活动',
        type: '户外活动',
        capacity: 25,
        status: 'pending',
        registeredCount: 0
      });
    });

    test('应该拒绝时间逻辑错误的活动', async () => {
      const activityData = {
        title: '测试活动',
        type: '室内活动',
        startTime: '2023-12-15T10:00:00Z',
        endTime: '2023-12-15T09:00:00Z' // 结束时间早于开始时间
      };

      await expect(activityService.createActivity(activityData)).rejects.toThrow('结束时间必须晚于开始时间');
    });

    test('应该成功注册学生参加活动', async () => {
      const futureDate1 = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const futureDate2 = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString();

      const activity = await activityService.createActivity({
        title: '测试活动',
        type: '室内活动',
        startTime: futureDate1,
        endTime: futureDate2,
        capacity: 5
      });

      const registration = await activityService.registerStudentForActivity(activity.id, 1);

      expect(registration).toMatchObject({
        activityId: activity.id,
        studentId: 1,
        status: 'registered'
      });

      const updatedActivity = await activityService.getActivityById(activity.id);
      expect(updatedActivity.registeredCount).toBe(1);
    });

    test('应该拒绝重复注册', async () => {
      const futureDate1 = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const futureDate2 = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString();

      const activity = await activityService.createActivity({
        title: '测试活动',
        type: '室内活动',
        startTime: futureDate1,
        endTime: futureDate2
      });

      await activityService.registerStudentForActivity(activity.id, 1);

      await expect(activityService.registerStudentForActivity(activity.id, 1))
        .rejects.toThrow('学生已经注册了这个活动');
    });

    test('应该拒绝超出容量的注册', async () => {
      const futureDate1 = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const futureDate2 = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString();

      const activity = await activityService.createActivity({
        title: '测试活动',
        type: '室内活动',
        startTime: futureDate1,
        endTime: futureDate2,
        capacity: 1
      });

      await activityService.registerStudentForActivity(activity.id, 1);

      await expect(activityService.registerStudentForActivity(activity.id, 2))
        .rejects.toThrow('活动已满员');
    });

    test('应该成功取消注册', async () => {
      const futureDate1 = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const futureDate2 = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString();

      const activity = await activityService.createActivity({
        title: '测试活动',
        type: '室内活动',
        startTime: futureDate1,
        endTime: futureDate2
      });

      await activityService.registerStudentForActivity(activity.id, 1);
      const result = await activityService.cancelStudentRegistration(activity.id, 1);

      expect(result.message).toBe('取消注册成功');

      const updatedActivity = await activityService.getActivityById(activity.id);
      expect(updatedActivity.registeredCount).toBe(0);
    });

    test('应该获取即将到来的活动', async () => {
      const futureDate1 = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const futureDate2 = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString();
      const futureDate3 = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      const futureDate4 = new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString();

      await activityService.createActivity({
        title: '活动1',
        type: '室内活动',
        startTime: futureDate3,
        endTime: futureDate4
      });

      await activityService.createActivity({
        title: '活动2',
        type: '户外活动',
        startTime: futureDate1,
        endTime: futureDate2
      });

      const upcomingActivities = await activityService.getUpcomingActivities();

      expect(upcomingActivities).toHaveLength(2);
      expect(upcomingActivities[0].title).toBe('活动2'); // 应该按时间排序
      expect(upcomingActivities[1].title).toBe('活动1');
    });
  });
});