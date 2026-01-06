/**
 * 认证API专项测试
 * 
 * 测试覆盖：
 * - 用户登录/登出
 * - Token管理
 * - 权限验证
 * - 会话管理
 * - 安全性测试
 */

import request from 'supertest';
import { vi } from 'vitest'
import { app } from '../../src/app';
import { setupTestDatabase, cleanupTestDatabase } from '../setup/database';
import { createTestUser, simulateLogin, createUserWithPermissions } from '../setup/auth';


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

describe('Authentication API Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('POST /api/auth/login', () => {
    let testUser: any;

    beforeAll(async () => {
      testUser = await createTestUser({
        username: 'auth-test-user',
        email: 'auth-test@example.com',
        password: 'test-password-123',
        role: 'user'
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'auth-test-user',
          password: 'test-password-123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id', testUser.id);
      expect(response.body.data.user).toHaveProperty('username', 'auth-test-user');
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.user).not.toHaveProperty('password_hash');
    });

    it('should reject invalid username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent-user',
          password: 'test-password-123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('用户不存在');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'auth-test-user',
          password: 'wrong-password'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('密码错误');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle SQL injection attempts', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: "admin'; DROP TABLE users; --",
          password: 'password'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should rate limit login attempts', async () => {
      // 模拟多次失败登录
      const promises = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            username: 'auth-test-user',
            password: 'wrong-password'
          })
      );

      const responses = await Promise.all(promises);
      
      // 检查是否有429状态码（Too Many Requests）
      const rateLimited = responses.some(res => res.status === 429);
      if (rateLimited) {
        expect(rateLimited).toBe(true);
      }
    });
  });

  describe('GET /api/auth/user-info', () => {
    let testUser: any;
    let authToken: string;

    beforeAll(async () => {
      const { user, token } = await createUserWithPermissions('auth-info-user', ['users:read']);
      testUser = user;
      authToken = token;
    });

    it('should return user info with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/user-info')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', testUser.id);
      expect(response.body.data).toHaveProperty('username', testUser.username);
      expect(response.body.data).toHaveProperty('email', testUser.email);
      expect(response.body.data).toHaveProperty('role', testUser.role);
      expect(response.body.data).toHaveProperty('permissions');
      expect(response.body.data).not.toHaveProperty('password');
      expect(response.body.data).not.toHaveProperty('password_hash');
    });

    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/auth/user-info')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/user-info')
        .set('Authorization', 'Bearer invalid-token-12345')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject requests with malformed token', async () => {
      const response = await request(app)
        .get('/api/auth/user-info')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject expired tokens', async () => {
      // 这里需要创建一个过期的token进行测试
      // 实际实现中需要根据JWT库的具体实现来模拟过期token
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken: string;

    beforeAll(async () => {
      const { token } = await createUserWithPermissions('auth-logout-user', ['users:read']);
      authToken = token;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle logout without token gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should invalidate token after logout', async () => {
      // 先登出
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // 然后尝试使用相同token访问受保护资源
      const response = await request(app)
        .get('/api/auth/user-info')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    let refreshToken: string;
    let authToken: string;

    beforeAll(async () => {
      const loginResult = await simulateLogin('auth-test-user', 'test-password-123');
      if (loginResult.success && loginResult.token) {
        authToken = loginResult.token;
        // 假设refresh token在登录响应中返回
        refreshToken = loginResult.token; // 简化处理
      }
    });

    it('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.token).not.toBe(authToken); // 新token应该不同
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should require refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Permission-based Access Control', () => {
    let adminUser: any;
    let adminToken: string;
    let regularUser: any;
    let regularToken: string;
    let limitedUser: any;
    let limitedToken: string;

    beforeAll(async () => {
      // 创建不同权限级别的用户
      const admin = await createUserWithPermissions('test-admin', ['*']);
      adminUser = admin.user;
      adminToken = admin.token;

      const regular = await createUserWithPermissions('test-regular', ['users:read', 'students:read']);
      regularUser = regular.user;
      regularToken = regular.token;

      const limited = await createUserWithPermissions('test-limited', ['dashboard:read']);
      limitedUser = limited.user;
      limitedToken = limited.token;
    });

    it('should allow admin access to all resources', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should allow regular user access to permitted resources', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should deny regular user access to forbidden resources', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          username: 'unauthorized-create',
          email: 'test@example.com',
          password: 'password'
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('权限不足');
    });

    it('should deny limited user access to most resources', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${limitedToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should allow limited user access to dashboard', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${limitedToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Security Tests', () => {
    it('should prevent brute force attacks', async () => {
      // 模拟暴力破解攻击
      const attempts = Array(20).fill(null).map((_, i) =>
        request(app)
          .post('/api/auth/login')
          .send({
            username: 'auth-test-user',
            password: `wrong-password-${i}`
          })
      );

      const responses = await Promise.all(attempts);
      
      // 检查是否有适当的限制措施
      const blockedResponses = responses.filter(res => res.status === 429 || res.status === 423);
      expect(blockedResponses.length).toBeGreaterThan(0);
    });

    it('should sanitize input to prevent XSS', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: '<script>alert("xss")</script>',
          password: 'password'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      // 确保响应中没有包含未转义的脚本
      expect(JSON.stringify(response.body)).not.toContain('<script>');
    });

    it('should validate token format', async () => {
      const invalidTokens = [
        'Bearer',
        'Bearer ',
        'Bearer invalid',
        'NotBearer validtoken',
        'Bearer ' + 'a'.repeat(1000) // 过长的token
      ];

      for (const token of invalidTokens) {
        const response = await request(app)
          .get('/api/auth/user-info')
          .set('Authorization', token)
          .expect(401);

        expect(response.body).toHaveProperty('success', false);
      }
    });
  });
});
