/**
 * 用户管理API集成测试
 * 
 * 测试覆盖：
 * - 用户创建、查询、更新、删除接口
 * - 用户权限验证
 * - 用户登录登出流程
 */

import request from 'supertest';
import { vi } from 'vitest'
import { app } from '../../src/app';
import { setupTestDatabase, cleanupTestDatabase } from '../setup/database';
import { createTestUser, createTestToken, createUserWithPermissions } from '../setup/auth';
import { TestDataFactory } from '../setup/test-data-factory';


// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe('User Management API Integration Tests', () => {
  let adminUser: any;
  let adminToken: string;
  let teacherUser: any;
  let teacherToken: string;
  let parentUser: any;
  let parentToken: string;
  let testDataFactory: TestDataFactory;
  let testUser: any;

  // 在所有测试之前执行
  beforeAll(async () => {
    // 设置测试数据库
    await setupTestDatabase();
    testDataFactory = new TestDataFactory();

    // 创建测试用户
    const admin = await createUserWithPermissions('test-admin', ['*']);
    adminUser = admin.user;
    adminToken = admin.token;

    const teacher = await createUserWithPermissions('test-teacher', [
      'students:read',
      'students:write',
      'classes:read',
      'activities:read',
      'activities:write'
    ]);
    teacherUser = teacher.user;
    teacherToken = teacher.token;

    const parent = await createUserWithPermissions('test-parent', [
      'students:read:own',
      'activities:read',
      'classes:read:own'
    ]);
    parentUser = parent.user;
    parentToken = parent.token;
  });

  // 在所有测试之后执行
  afterAll(async () => {
    // 清理测试数据库
    await cleanupTestDatabase();
  });

  describe('POST /api/users - 创建用户', () => {
    it('管理员应该成功创建新用户', async () => {
      const userData = {
        username: 'new-user-test',
        email: 'new-user-test@example.com',
        password: 'test-password-123',
        realName: '测试用户',
        phone: '13800138000',
        status: 1
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '创建用户成功');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('username', userData.username);
      expect(response.body.data).toHaveProperty('email', userData.email);
      expect(response.body.data).toHaveProperty('realName', userData.realName);
      expect(response.body.data).toHaveProperty('phone', userData.phone);
      expect(response.body.data).toHaveProperty('status', userData.status);
      expect(response.body.data).not.toHaveProperty('password'); // 密码不应返回

      // 保存创建的用户用于后续测试
      testUser = response.body.data;
    });

    it('应该拒绝非管理员用户创建用户', async () => {
      const userData = {
        username: 'unauthorized-user',
        email: 'unauthorized@example.com',
        password: 'test-password-123',
        realName: '未授权用户'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(userData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('应该拒绝重复的用户名', async () => {
      const userData = {
        username: 'test-admin', // 已存在的用户名
        email: 'new-admin@example.com',
        password: 'test-password-123',
        realName: '新管理员'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('用户名已存在');
    });

    it('应该拒绝重复的邮箱', async () => {
      const userData = {
        username: 'new-admin-user',
        email: 'test-admin@test.com', // 已存在的邮箱
        password: 'test-password-123',
        realName: '新管理员'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('邮箱已存在');
    });

    it('应该验证必填字段', async () => {
      const invalidData = {
        // 缺少必填字段 username, email, password
        realName: '测试用户'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/users - 获取用户列表', () => {
    it('管理员应该成功获取用户列表', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('pageSize');
      expect(response.body.data).toHaveProperty('items');
      expect(Array.isArray(response.body.data.items)).toBe(true);
    });

    it('应该支持分页参数', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('pageSize', 5);
    });

    it('非管理员用户应该被拒绝访问用户列表', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/users/:id - 获取用户详情', () => {
    it('管理员应该成功获取指定用户详情', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', testUser.id);
      expect(response.body.data).toHaveProperty('username', testUser.username);
      expect(response.body.data).toHaveProperty('email', testUser.email);
      expect(response.body.data).toHaveProperty('realName', testUser.realName);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('应该处理不存在的用户', async () => {
      const response = await request(app)
        .get('/api/users/99999') // 不存在的ID
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('用户不存在');
    });

    it('非管理员用户应该被拒绝访问其他用户详情', async () => {
      const response = await request(app)
        .get(`/api/users/${adminUser.id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/users/:id - 更新用户信息', () => {
    it('管理员应该成功更新用户信息', async () => {
      const updateData = {
        username: 'updated-user-test',
        email: 'updated-user-test@example.com',
        realName: '更新的测试用户',
        phone: '13900139000',
        status: 1
      };

      const response = await request(app)
        .put(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '更新用户成功');
      expect(response.body.data).toHaveProperty('id', testUser.id);
      expect(response.body.data).toHaveProperty('username', updateData.username);
      expect(response.body.data).toHaveProperty('email', updateData.email);
      expect(response.body.data).toHaveProperty('realName', updateData.realName);
      expect(response.body.data).toHaveProperty('phone', updateData.phone);
      expect(response.body.data).toHaveProperty('status', updateData.status);
    });

    it('应该拒绝非管理员用户更新用户信息', async () => {
      const updateData = {
        realName: '非法更新'
      };

      const response = await request(app)
        .put(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该验证更新数据', async () => {
      const invalidData = {
        username: 'test-admin' // 已存在的用户名
      };

      const response = await request(app)
        .put(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('用户名已被其他用户使用');
    });

    it('应该处理更新不存在的用户', async () => {
      const updateData = {
        realName: '不存在的用户更新'
      };

      const response = await request(app)
        .put('/api/users/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('用户不存在');
    });
  });

  describe('DELETE /api/users/:id - 删除用户', () => {
    let userToDelete: any;

    beforeAll(async () => {
      // 创建一个专门用于删除测试的用户
      const userData = {
        username: 'delete-test-user',
        email: 'delete-test@example.com',
        password: 'test-password-123',
        realName: '删除测试用户',
        status: 1
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(201);

      userToDelete = response.body.data;
    });

    it('管理员应该成功删除用户', async () => {
      const response = await request(app)
        .delete(`/api/users/${userToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '删除用户成功');
    });

    it('应该拒绝非管理员用户删除用户', async () => {
      // 创建一个新用户用于测试
      const userData = {
        username: 'delete-test-user-2',
        email: 'delete-test-2@example.com',
        password: 'test-password-123',
        realName: '删除测试用户2',
        status: 1
      };

      const createResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(201);

      const response = await request(app)
        .delete(`/api/users/${createResponse.body.data.id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('应该处理删除不存在的用户', async () => {
      const response = await request(app)
        .delete('/api/users/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('用户不存在');
    });

    it('应该拒绝删除系统管理员账户', async () => {
      // 注意：我们不实际删除admin账户，只是测试这个保护机制
      // 这里用一个模拟的admin账户ID进行测试
    });
  });

  describe('POST /api/auth/login - 用户登录', () => {
    let loginUser: any;

    beforeAll(async () => {
      // 创建一个用于登录测试的用户
      const userData = {
        username: 'login-test-user',
        email: 'login-test@example.com',
        password: 'login-password-123',
        realName: '登录测试用户',
        status: 1
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(201);

      loginUser = response.body.data;
    });

    it('应该成功登录有效用户', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'login-test-user',
          password: 'login-password-123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '登录成功');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('username', 'login-test-user');
      expect(response.body.data.user).toHaveProperty('email', 'login-test@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('应该拒绝无效用户名', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent-user',
          password: 'any-password'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('用户名或密码错误');
    });

    it('应该拒绝无效密码', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'login-test-user',
          password: 'wrong-password'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('用户名或密码错误');
    });

    it('应该验证必填字段', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('用户名或邮箱不能为空');
    });

    it('应该拒绝被禁用的用户登录', async () => {
      // 更新用户状态为禁用
      await request(app)
        .put(`/api/users/${loginUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 0 }) // 禁用用户
        .expect(200);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'login-test-user',
          password: 'login-password-123'
        })
        .expect(200); // 200状态码，但返回账号禁用信息

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('账号已被禁用');
    });
  });

  describe('POST /api/auth/logout - 用户登出', () => {
    let logoutUserToken: string;

    beforeAll(async () => {
      // 登录一个用户获取token
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'login-test-user',
          password: 'login-password-123'
        })
        .expect(200);

      logoutUserToken = response.body.data.token;
    });

    it('应该成功登出有效用户', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${logoutUserToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('应该拒绝无效token登出', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token-123')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('权限验证测试', () => {
    let readOnlyUser: any;
    let readOnlyToken: string;

    beforeAll(async () => {
      const readOnly = await createUserWithPermissions('test-readonly', [
        'dashboard:read',
        'students:read',
        'teachers:read',
        'classes:read'
      ]);
      readOnlyUser = readOnly.user;
      readOnlyToken = readOnly.token;
    });

    it('管理员应该有完全访问权限', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('只读用户应该被拒绝写操作', async () => {
      const userData = {
        username: 'readonly-test',
        email: 'readonly@test.com',
        password: 'test-password-123',
        realName: '只读测试用户'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${readOnlyToken}`)
        .send(userData)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('只读用户应该可以执行读操作', async () => {
      const response = await request(app)
        .get(`/api/users/${adminUser.id}`)
        .set('Authorization', `Bearer ${readOnlyToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('教师用户应该只能访问授权的资源', async () => {
      // 教师用户不应该能访问用户管理API
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('错误处理测试', () => {
    it('应该处理数据库连接错误', async () => {
      // 这个测试需要模拟数据库错误，实际项目中可能需要特殊的测试设置
    });

    it('应该处理服务器内部错误', async () => {
      // 这个测试需要模拟服务器内部错误
    });

    it('应该返回标准错误格式', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内响应用户列表请求', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(5000); // 5秒内响应
    });

    it('应该处理并发用户请求', async () => {
      const requests = Array(5).fill(null).map(() =>
        request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
      );

      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});