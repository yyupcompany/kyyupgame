/**
 * 真实环境集成测试配置
 * 提供完整的测试环境设置和工具函数
 */

import { spawn, ChildProcess } from 'child_process';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../../server/src/app';
import { config } from '../../../server/src/config/database.config';

export interface TestEnvironment {
  backend: ChildProcess | null;
  database: mysql.Connection | null;
  adminToken: string;
  testUsers: TestUser[];
  testClasses: TestClass[];
  testStudents: TestStudent[];
}

export interface TestUser {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
  realName: string;
  token?: string;
}

export interface TestClass {
  id: number;
  name: string;
  teacherId: number;
  capacity: number;
  studentCount: number;
}

export interface TestStudent {
  id: number;
  name: string;
  age: number;
  parentId?: number;
  classId?: number;
}

/**
 * 真实环境测试管理器
 */
export class RealEnvironmentManager {
  private static instance: RealEnvironmentManager;
  private environment: TestEnvironment = {
    backend: null,
    database: null,
    adminToken: '',
    testUsers: [],
    testClasses: [],
    testStudents: []
  };

  public static getInstance(): RealEnvironmentManager {
    if (!RealEnvironmentManager.instance) {
      RealEnvironmentManager.instance = new RealEnvironmentManager();
    }
    return RealEnvironmentManager.instance;
  }

  /**
   * 初始化真实测试环境
   */
  async initializeEnvironment(): Promise<void> {
    console.log('🚀 初始化真实测试环境...');

    try {
      // 1. 设置测试数据库
      await this.setupTestDatabase();

      // 2. 启动后端服务
      await this.startBackendServer();

      // 3. 创建测试数据
      await this.createTestData();

      console.log('✅ 真实测试环境初始化完成');
    } catch (error) {
      console.error('❌ 真实测试环境初始化失败:', error);
      throw error;
    }
  }

  /**
   * 设置测试数据库
   */
  private async setupTestDatabase(): Promise<void> {
    console.log('📊 设置测试数据库...');

    try {
      // 创建数据库连接
      this.environment.database = await mysql.createConnection({
        host: config.host,
        user: config.username,
        password: config.password,
        database: `${config.database}_test`, // 使用独立测试数据库
        multipleStatements: true
      });

      // 清理测试数据
      await this.cleanupTestData();

      console.log('✅ 测试数据库设置完成');
    } catch (error) {
      console.error('❌ 测试数据库设置失败:', error);
      throw error;
    }
  }

  /**
   * 启动后端服务
   */
  private async startBackendServer(): Promise<void> {
    console.log('🔧 启动后端服务...');

    return new Promise((resolve, reject) => {
      // 设置测试环境变量
      const env = {
        ...process.env,
        NODE_ENV: 'test',
        PORT: '3001', // 使用不同端口避免冲突
        DB_DATABASE: `${config.database}_test`
      };

      // 启动后端服务
      this.environment.backend = spawn('npm', ['run', 'dev'], {
        cwd: process.cwd() + '/server',
        stdio: ['pipe', 'pipe', 'pipe'],
        env: env
      });

      let resolved = false;

      // 监听服务启动
      this.environment.backend.stdout?.on('data', (data) => {
        const output = data.toString();
        console.log('Backend:', output);

        if (output.includes('Server running on port') && !resolved) {
          resolved = true;
          // 等待服务完全启动
          setTimeout(() => {
            console.log('✅ 后端服务启动完成');
            resolve();
          }, 2000);
        }
      });

      this.environment.backend.stderr?.on('data', (data) => {
        console.error('Backend Error:', data.toString());
      });

      this.environment.backend.on('error', (error) => {
        console.error('❌ 后端服务启动失败:', error);
        if (!resolved) {
          reject(error);
        }
      });

      // 超时处理
      setTimeout(() => {
        if (!resolved) {
          console.error('❌ 后端服务启动超时');
          reject(new Error('Backend service startup timeout'));
        }
      }, 30000);
    });
  }

  /**
   * 创建测试数据
   */
  private async createTestData(): Promise<void> {
    console.log('👥 创建测试数据...');

    try {
      // 1. 创建管理员用户并获取token
      await this.createAdminUser();

      // 2. 创建测试用户
      await this.createTestUsers();

      // 3. 创建测试班级
      await this.createTestClasses();

      // 4. 创建测试学生
      await this.createTestStudents();

      console.log('✅ 测试数据创建完成');
    } catch (error) {
      console.error('❌ 测试数据创建失败:', error);
      throw error;
    }
  }

  /**
   * 创建管理员用户
   */
  private async createAdminUser(): Promise<void> {
    const adminUser = {
      username: 'test_admin',
      email: 'admin@test.com',
      password: 'Admin123!',
      realName: '测试管理员'
    };

    // 创建管理员用户
    const response = await request(app)
      .post('/api/auth/register')
      .send(adminUser);

    if (response.status !== 201 && response.status !== 409) {
      throw new Error(`管理员用户创建失败: ${response.body.message}`);
    }

    // 登录获取token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: adminUser.username,
        password: adminUser.password
      });

    if (loginResponse.status !== 200) {
      throw new Error(`管理员登录失败: ${loginResponse.body.message}`);
    }

    this.environment.adminToken = loginResponse.body.data.token;
  }

  /**
   * 创建测试用户
   */
  private async createTestUsers(): Promise<void> {
    const testUserConfigs = [
      { username: 'test_teacher1', email: 'teacher1@test.com', role: 'teacher', realName: '测试教师1' },
      { username: 'test_teacher2', email: 'teacher2@test.com', role: 'teacher', realName: '测试教师2' },
      { username: 'test_parent1', email: 'parent1@test.com', role: 'parent', realName: '测试家长1' },
      { username: 'test_parent2', email: 'parent2@test.com', role: 'parent', realName: '测试家长2' }
    ];

    for (const userConfig of testUserConfigs) {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...userConfig,
          password: 'Test123!'
        });

      if (response.status === 201 || response.status === 409) {
        const userId = response.status === 201 ? response.body.data.id : response.body.existingUser.id;

        this.environment.testUsers.push({
          id: userId,
          username: userConfig.username,
          email: userConfig.email,
          password: 'Test123!',
          role: userConfig.role,
          realName: userConfig.realName
        });
      }
    }
  }

  /**
   * 创建测试班级
   */
  private async createTestClasses(): Promise<void> {
    const teachers = this.environment.testUsers.filter(u => u.role === 'teacher');

    const classConfigs = [
      { name: '小班测试1', teacherId: teachers[0]?.id, capacity: 25 },
      { name: '小班测试2', teacherId: teachers[1]?.id, capacity: 30 }
    ];

    for (const classConfig of classConfigs) {
      if (!classConfig.teacherId) continue;

      const response = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${this.environment.adminToken}`)
        .send(classConfig);

      if (response.status === 201) {
        this.environment.testClasses.push({
          id: response.body.data.id,
          name: classConfig.name,
          teacherId: classConfig.teacherId,
          capacity: classConfig.capacity,
          studentCount: 0
        });
      }
    }
  }

  /**
   * 创建测试学生
   */
  private async createTestStudents(): Promise<void> {
    const parents = this.environment.testUsers.filter(u => u.role === 'parent');
    const classes = this.environment.testClasses;

    const studentConfigs = [
      { name: '测试学生1', age: 4, parentId: parents[0]?.id, classId: classes[0]?.id },
      { name: '测试学生2', age: 5, parentId: parents[1]?.id, classId: classes[0]?.id },
      { name: '测试学生3', age: 4, parentId: parents[0]?.id, classId: classes[1]?.id },
      { name: '测试学生4', age: 5, parentId: parents[1]?.id, classId: classes[1]?.id },
      { name: '测试学生5', age: 4, parentId: parents[0]?.id, classId: classes[1]?.id }
    ];

    for (const studentConfig of studentConfigs) {
      if (!studentConfig.parentId) continue;

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${this.environment.adminToken}`)
        .send(studentConfig);

      if (response.status === 201) {
        this.environment.testStudents.push({
          id: response.body.data.id,
          name: studentConfig.name,
          age: studentConfig.age,
          parentId: studentConfig.parentId,
          classId: studentConfig.classId
        });
      }
    }
  }

  /**
   * 清理测试数据
   */
  private async cleanupTestData(): Promise<void> {
    if (!this.environment.database) return;

    const tables = [
      'attendance_records',
      'activity_registrations',
      'activity_evaluations',
      'activities',
      'class_students',
      'students',
      'classes',
      'user_roles',
      'users'
    ];

    for (const table of tables) {
      try {
        await this.environment.database.execute(`DELETE FROM ${table} WHERE username LIKE 'test_%' OR name LIKE '测试%'`);
      } catch (error) {
        console.warn(`清理表 ${table} 失败:`, error);
      }
    }
  }

  /**
   * 获取用户token
   */
  async getUserToken(userId: number): Promise<string> {
    const user = this.environment.testUsers.find(u => u.id === userId);
    if (user && user.token) {
      return user.token;
    }

    if (user) {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: user.username,
          password: user.password
        });

      if (response.status === 200) {
        user.token = response.body.data.token;
        return user.token;
      }
    }

    throw new Error(`无法获取用户 ${userId} 的token`);
  }

  /**
   * 获取环境信息
   */
  getEnvironment(): TestEnvironment {
    return this.environment;
  }

  /**
   * 清理环境
   */
  async cleanupEnvironment(): Promise<void> {
    console.log('🧹 清理测试环境...');

    try {
      // 清理测试数据
      await this.cleanupTestData();

      // 关闭数据库连接
      if (this.environment.database) {
        await this.environment.database.end();
        this.environment.database = null;
      }

      // 关闭后端服务
      if (this.environment.backend) {
        this.environment.backend.kill('SIGTERM');
        this.environment.backend = null;
      }

      console.log('✅ 测试环境清理完成');
    } catch (error) {
      console.error('❌ 测试环境清理失败:', error);
    }
  }

  /**
   * 验证JWT token
   */
  validateToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    } catch (error) {
      throw new Error('Invalid JWT token');
    }
  }

  /**
   * 等待服务就绪
   */
  async waitForServiceReady(maxRetries = 30): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await request(app)
          .get('/api/health')
          .timeout(1000);

        if (response.status === 200) {
          return true;
        }
      } catch (error) {
        // 服务未就绪，继续等待
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return false;
  }
}

/**
 * 测试工具函数
 */
export class TestUtils {
  /**
   * 创建随机的测试数据
   */
  static createRandomTestData(prefix = 'test') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);

    return {
      username: `${prefix}_${timestamp}_${random}`,
      email: `${prefix}_${timestamp}_${random}@test.com`,
      name: `${prefix}_数据_${random}`,
      phone: `1${Math.floor(Math.random() * 9000000000) + 1000000000}`
    };
  }

  /**
   * 等待指定时间
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 重试机制
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) {
          throw error;
        }
        await this.wait(delay);
      }
    }
    throw new Error('Max retries exceeded');
  }

  /**
   * 验证API响应格式
   */
  static validateApiResponse(response: any, expectedData?: any): void {
    expect(response).toHaveProperty('success');
    expect(response).toHaveProperty('data');
    expect(response).toHaveProperty('message');

    if (expectedData !== undefined) {
      expect(response.data).toEqual(expectedData);
    }
  }

  /**
   * 生成测试用的JWT token
   */
  static generateTestToken(payload: any): string {
    return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', {
      expiresIn: '1h'
    });
  }
}

/**
 * 导出单例实例
 */
export const realEnvironmentManager = RealEnvironmentManager.getInstance();
export const testUtils = TestUtils;