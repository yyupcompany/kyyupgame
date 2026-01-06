import { TestHelper, TestDataFactory, ResponseValidators } from '../helpers/testUtils';
import { Application } from 'express';
import { createTestApp, initTestDatabase, closeTestDatabase } from '../helpers/testApp';

let app: Application;
let testHelper: TestHelper;

describe('Users API Tests', () => {
  beforeAll(async () => {
    await initTestDatabase();
    app = createTestApp();
    testHelper = new TestHelper(app);
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('GET /api/users', () => {
    it('should get users list with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/users', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(ResponseValidators.hasValidPagination(response.body.data)).toBeTruthy();
      expect(Array.isArray(response.body.data.items)).toBeTruthy();
    });

    it('should get users list with pagination', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/users?page=1&limit=10', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(10);
      expect(typeof response.body.data.total).toBe('number');
    });

    it('should filter users by role', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/users?role=teacher', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      if (response.body.data.items.length > 0) {
        response.body.data.items.forEach((user: any) => {
          expect(user.role).toBe('teacher');
        });
      }
    });

    it('should fail without admin permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.get('/api/users', teacherUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Insufficient permissions');
    });

    it('should fail without authentication', async () => {
      const response = await testHelper.public('get', '/api/users');

      expect(response.status).toBe(401);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Authentication required');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/users/1', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('username');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('role');
    });

    it('should allow users to get their own profile', async () => {
      const user = TestDataFactory.createUser({ id: 1, role: 'teacher' });
      const response = await testHelper.get('/api/users/1', user);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.id).toBe(1);
    });

    it('should fail when non-admin tries to get another user', async () => {
      const user = TestDataFactory.createUser({ id: 1, role: 'teacher' });
      const response = await testHelper.get('/api/users/2', user);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Insufficient permissions');
    });

    it('should return 404 for non-existent user', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/users/99999', adminUser);

      expect(response.status).toBe(404);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('User not found');
    });
  });

  describe('POST /api/users', () => {
    it('should create user with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const newUser = {
        username: 'newuser',
        email: 'newuser@test.com',
        password: 'password123',
        role: 'teacher',
        profile: {
          name: '新用户',
          phone: '13800138000'
        }
      };

      const response = await testHelper.post('/api/users', newUser, adminUser);

      expect(response.status).toBe(201);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.username).toBe(newUser.username);
      expect(response.body.data.email).toBe(newUser.email);
      expect(response.body.data.role).toBe(newUser.role);
    });

    it('should fail with duplicate email', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const newUser = {
        username: 'anotheruser',
        email: 'admin@test.com', // Existing email
        password: 'password123',
        role: 'teacher'
      };

      const response = await testHelper.post('/api/users', newUser, adminUser);

      expect(response.status).toBe(409);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Email already exists');
    });

    it('should fail with invalid email format', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const newUser = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
        role: 'teacher'
      };

      const response = await testHelper.post('/api/users', newUser, adminUser);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Invalid email format');
    });

    it('should fail without admin permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const newUser = {
        username: 'newuser',
        email: 'newuser@test.com',
        password: 'password123',
        role: 'teacher'
      };

      const response = await testHelper.post('/api/users', newUser, teacherUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Insufficient permissions');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const updateData = {
        username: 'updateduser',
        email: 'updated@test.com',
        role: 'principal',
        profile: {
          name: '更新用户',
          phone: '13900139000'
        }
      };

      const response = await testHelper.put('/api/users/1', updateData, adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.username).toBe(updateData.username);
      expect(response.body.data.email).toBe(updateData.email);
      expect(response.body.data.role).toBe(updateData.role);
    });

    it('should allow users to update their own profile', async () => {
      const user = TestDataFactory.createUser({ id: 1, role: 'teacher' });
      const updateData = {
        username: 'selfupdated',
        profile: {
          name: '自己更新',
          phone: '13700137000'
        }
      };

      const response = await testHelper.put('/api/users/1', updateData, user);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.data.username).toBe(updateData.username);
    });

    it('should not allow non-admin to change role', async () => {
      const user = TestDataFactory.createUser({ id: 1, role: 'teacher' });
      const updateData = {
        role: 'admin' // Trying to escalate privileges
      };

      const response = await testHelper.put('/api/users/1', updateData, user);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Cannot change role without admin privileges');
    });

    it('should fail when non-admin tries to update another user', async () => {
      const user = TestDataFactory.createUser({ id: 1, role: 'teacher' });
      const updateData = {
        username: 'unauthorized'
      };

      const response = await testHelper.put('/api/users/2', updateData, user);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Insufficient permissions');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user with admin permissions', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.delete('/api/users/1', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('User deleted successfully');
    });

    it('should fail to delete non-existent user', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.delete('/api/users/99999', adminUser);

      expect(response.status).toBe(404);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('User not found');
    });

    it('should fail without admin permissions', async () => {
      const teacherUser = TestDataFactory.createUser({ role: 'teacher' });
      const response = await testHelper.delete('/api/users/1', teacherUser);

      expect(response.status).toBe(403);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Insufficient permissions');
    });

    it('should not allow users to delete themselves', async () => {
      const user = TestDataFactory.createUser({ id: 1, role: 'admin' });
      const response = await testHelper.delete('/api/users/1', user);

      expect(response.status).toBe(400);
      expect(ResponseValidators.isErrorResponse(response)).toBeTruthy();
      expect(response.body.message).toContain('Cannot delete your own account');
    });
  });

  describe('GET /api/users/roles', () => {
    it('should get available roles list', async () => {
      const adminUser = TestDataFactory.createUser({ role: 'admin' });
      const response = await testHelper.get('/api/users/roles', adminUser);

      expect(response.status).toBe(200);
      expect(ResponseValidators.isSuccessResponse(response)).toBeTruthy();
      expect(Array.isArray(response.body.data)).toBeTruthy();
      expect(response.body.data).toContain('admin');
      expect(response.body.data).toContain('principal');
      expect(response.body.data).toContain('teacher');
      expect(response.body.data).toContain('parent');
    });
  });
});