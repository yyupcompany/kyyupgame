import request from 'supertest';
import { Application } from 'express';
import { TestHelper, TestDataFactory, ResponseValidators } from '../helpers/testUtils';
import { createTestApp, initTestDatabase, closeTestDatabase } from '../helpers/testApp';

let app: Application;
let testHelper: TestHelper;

describe('Authentication API Tests', () => {
  beforeAll(async () => {
    // Initialize test database
    await initTestDatabase();
    
    // Create test app instance
    app = createTestApp();
    testHelper = new TestHelper(app);
  });

  afterAll(async () => {
    // Clean up database connection
    await closeTestDatabase();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'admin@test.com',
        password: 'password123'
      };

      const response = await testHelper.public('post', '/api/auth/login', loginData);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('email');
      expect(response.body.data.user).toHaveProperty('role');
    });

    it('should fail with invalid credentials', async () => {
      const loginData = {
        email: 'admin@test.com',
        password: 'wrongpassword'
      };

      const response = await testHelper.public('post', '/api/auth/login', loginData);

      expect(response.status).toBe(401);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should fail with missing email', async () => {
      const loginData = {
        password: 'password123'
      };

      const response = await testHelper.public('post', '/api/auth/login', loginData);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Email is required');
    });

    it('should fail with missing password', async () => {
      const loginData = {
        email: 'admin@test.com'
      };

      const response = await testHelper.public('post', '/api/auth/login', loginData);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Password is required');
    });

    it('should fail with invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await testHelper.public('post', '/api/auth/login', loginData);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Invalid email format');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register new user with valid data', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'teacher'
      };

      const response = await testHelper.public('post', '/api/auth/register', userData);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.username).toBe(userData.username);
    });

    it('should fail with existing email', async () => {
      const userData = {
        username: 'testuser2',
        email: 'admin@test.com', // Existing email
        password: 'password123',
        confirmPassword: 'password123',
        role: 'teacher'
      };

      const response = await testHelper.public('post', '/api/auth/register', userData);

      expect(response.status).toBe(409);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Email already exists');
    });

    it('should fail with password mismatch', async () => {
      const userData = {
        username: 'testuser3',
        email: 'testuser3@test.com',
        password: 'password123',
        confirmPassword: 'password456',
        role: 'teacher'
      };

      const response = await testHelper.public('post', '/api/auth/register', userData);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Passwords do not match');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const user = TestDataFactory.createUser();
      const response = await testHelper.get('/api/auth/profile', user);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('username');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('role');
    });

    it('should fail without token', async () => {
      const response = await testHelper.public('get', '/api/auth/profile');

      expect(response.status).toBe(401);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Authentication required');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Invalid token');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      const refreshData = {
        refreshToken: 'valid-refresh-token'
      };

      const response = await testHelper.public('post', '/api/auth/refresh', refreshData);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should fail with invalid refresh token', async () => {
      const refreshData = {
        refreshToken: 'invalid-refresh-token'
      };

      const response = await testHelper.public('post', '/api/auth/refresh', refreshData);

      expect(response.status).toBe(401);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Invalid refresh token');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const user = TestDataFactory.createUser();
      const response = await testHelper.post('/api/auth/logout', {}, user);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Logged out successfully');
    });

    it('should fail without token', async () => {
      const response = await testHelper.public('post', '/api/auth/logout');

      expect(response.status).toBe(401);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Authentication required');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send reset email for valid email', async () => {
      const resetData = {
        email: 'admin@test.com'
      };

      const response = await testHelper.public('post', '/api/auth/forgot-password', resetData);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Password reset email sent');
    });

    it('should fail with non-existent email', async () => {
      const resetData = {
        email: 'nonexistent@test.com'
      };

      const response = await testHelper.public('post', '/api/auth/forgot-password', resetData);

      expect(response.status).toBe(404);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Email not found');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const resetData = {
        token: 'valid-reset-token',
        password: 'newpassword123',
        confirmPassword: 'newpassword123'
      };

      const response = await testHelper.public('post', '/api/auth/reset-password', resetData);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Password reset successfully');
    });

    it('should fail with invalid reset token', async () => {
      const resetData = {
        token: 'invalid-reset-token',
        password: 'newpassword123',
        confirmPassword: 'newpassword123'
      };

      const response = await testHelper.public('post', '/api/auth/reset-password', resetData);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Invalid or expired reset token');
    });
  });
});