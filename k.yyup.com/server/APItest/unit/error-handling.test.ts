import { describe, it, expect, beforeEach, afterEach } from 'jest';
import request from 'supertest';
import app from '../../src/app';
import { sequelize } from '../../src/config/database';
import { TestDataFactory } from '../utils/test-data-factory';
import { ApiTestHelper } from '../utils/api-test-helper';

describe('API Error Handling Tests', () => {
  let testHelper: ApiTestHelper;
  let testDataFactory: TestDataFactory;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    testHelper = new ApiTestHelper();
    testDataFactory = new TestDataFactory();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await testDataFactory.clearDatabase();
  });

  describe('Authentication Error Handling', () => {
    it('should return 401 for requests without authentication', async () => {
      const response = await request(app)
        .get('/api/students')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
      expect(response.body.errorCode).toBeDefined();
    });

    it('should return 401 for invalid JWT tokens', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });

    it('should return 401 for expired JWT tokens', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token expired');
    });

    it('should return 403 for insufficient permissions', async () => {
      const parentUser = await testDataFactory.createUser({ role: 'parent' });

      const response = await testHelper.get('/api/system/settings', parentUser);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient permissions');
    });

    it('should handle malformed authorization headers', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', 'InvalidHeaderFormat')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('AUTH_INVALID_FORMAT');
    });
  });

  describe('Validation Error Handling', () => {
    it('should handle missing required fields', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const invalidStudentData = {
        name: '测试学生'
        // Missing required fields: gender, birthDate, etc.
      };

      const response = await testHelper.post('/api/students', invalidStudentData, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
      expect(response.body.details).toBeDefined();
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    it('should handle invalid data types', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const invalidStudentData = {
        name: '测试学生',
        gender: '男',
        birthDate: 'invalid-date', // Invalid date format
        age: 'not-a-number' // Invalid number format
      };

      const response = await testHelper.post('/api/students', invalidStudentData, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should handle invalid email formats', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const invalidTeacherData = {
        name: '李老师',
        email: 'invalid-email-format',
        phone: '13900139000'
      };

      const response = await testHelper.post('/api/teachers', invalidTeacherData, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'email',
          message: expect.stringContaining('Invalid email format')
        })
      );
    });

    it('should handle invalid phone number formats', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const invalidTeacherData = {
        name: '李老师',
        email: 'teacher@example.com',
        phone: '123' // Invalid phone number
      };

      const response = await testHelper.post('/api/teachers', invalidTeacherData, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'phone',
          message: expect.stringContaining('Invalid phone number')
        })
      );
    });

    it('should handle enum validation errors', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const invalidStudentData = {
        name: '测试学生',
        gender: 'invalid-gender', // Invalid enum value
        birthDate: '2020-01-01'
      };

      const response = await testHelper.post('/api/students', invalidStudentData, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'gender',
          message: expect.stringContaining('Invalid value')
        })
      );
    });
  });

  describe('Database Error Handling', () => {
    it('should handle duplicate entry errors', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      // Create first user
      await testDataFactory.createUser({ 
        username: 'existinguser', 
        email: 'existing@example.com' 
      });

      // Try to create user with same username
      const duplicateUserData = {
        username: 'existinguser', // Duplicate username
        email: 'another@example.com',
        password: 'password123',
        role: 'teacher'
      };

      const response = await testHelper.post('/api/users', duplicateUserData, adminUser);
      
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('DUPLICATE_ENTRY');
      expect(response.body.message).toContain('already exists');
    });

    it('should handle foreign key constraint violations', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const invalidClassData = {
        name: '测试班级',
        teacherId: 99999, // Non-existent teacher ID
        capacity: 25
      };

      const response = await testHelper.post('/api/classes', invalidClassData, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('FOREIGN_KEY_CONSTRAINT');
    });

    it('should handle database connection errors', async () => {
      // Mock database connection error
      const originalSequelize = sequelize;
      vi.spyOn(sequelize, 'query').mockRejectedValue(new Error('Connection timeout'));

      const adminUser = await testDataFactory.createUser({ role: 'admin' });

      const response = await testHelper.get('/api/students', adminUser);
      
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('DATABASE_ERROR');
      expect(response.body.message).toContain('Database connection');

      // Restore original sequelize
      vi.restoreAllMocks();
    });

    it('should handle transaction rollback errors', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      // Mock transaction error
      vi.spyOn(sequelize, 'transaction').mockRejectedValue(new Error('Transaction failed'));

      const studentData = {
        name: '测试学生',
        gender: '男',
        birthDate: '2020-01-01'
      };

      const response = await testHelper.post('/api/students', studentData, adminUser);
      
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('TRANSACTION_ERROR');

      vi.restoreAllMocks();
    });
  });

  describe('Business Logic Error Handling', () => {
    it('should handle business rule violations', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const classObj = await testDataFactory.createClass({ capacity: 25 });
      
      // Try to add more students than capacity
      const students = Array(30).fill(0).map(() => testDataFactory.createStudent());
      await Promise.all(students);

      const studentIds = (await Promise.all(students)).map(s => s.id);
      const assignmentData = { studentIds };

      const response = await testHelper.post(`/api/classes/${classObj.id}/students`, assignmentData, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('BUSINESS_RULE_VIOLATION');
      expect(response.body.message).toContain('capacity');
    });

    it('should handle invalid status transitions', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const application = await testDataFactory.createEnrollmentApplication({ status: 'approved' });

      // Try to transition from approved to pending (invalid transition)
      const statusUpdate = {
        status: 'pending',
        comments: 'Invalid transition'
      };

      const response = await testHelper.put(`/api/enrollment/applications/${application.id}/status`, statusUpdate, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('INVALID_STATUS_TRANSITION');
    });

    it('should handle concurrent modification conflicts', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const student = await testDataFactory.createStudent({ name: '原姓名' });

      // Simulate concurrent modification
      const update1 = testHelper.put(`/api/students/${student.id}`, { name: '新姓名1' }, adminUser);
      const update2 = testHelper.put(`/api/students/${student.id}`, { name: '新姓名2' }, adminUser);

      const [response1, response2] = await Promise.all([update1, update2]);
      
      // One should succeed, one should fail with conflict error
      const successResponse = response1.status === 200 ? response1 : response2;
      const conflictResponse = response1.status === 409 ? response1 : response2;

      expect(successResponse.status).toBe(200);
      expect(conflictResponse.status).toBe(409);
      expect(conflictResponse.body.errorCode).toBe('CONCURRENT_MODIFICATION');
    });

    it('should handle resource not found errors', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });

      const response = await testHelper.get('/api/students/99999', adminUser);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('RESOURCE_NOT_FOUND');
      expect(response.body.message).toContain('not found');
    });

    it('should handle invalid operation states', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const student = await testDataFactory.createStudent({ status: 'inactive' });

      // Try to perform operation on inactive student
      const operationData = {
        operation: 'check_in',
        timestamp: new Date().toISOString()
      };

      const response = await testHelper.post(`/api/students/${student.id}/operations`, operationData, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('INVALID_OPERATION_STATE');
    });
  });

  describe('External Service Error Handling', () => {
    it('should handle external API timeout', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      // Mock external service timeout
      vi.spyOn(axios, 'post').mockImplementation(() => 
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 100))
      );

      const notificationData = {
        recipient: 'parent@example.com',
        subject: '测试通知',
        content: '测试内容'
      };

      const response = await testHelper.post('/api/notifications/send', notificationData, adminUser);
      
      expect(response.status).toBe(504);
      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('EXTERNAL_SERVICE_TIMEOUT');

      vi.restoreAllMocks();
    });

    it('should handle external service connection errors', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      // Mock connection error
      vi.spyOn(axios, 'post').mockRejectedValue(new Error('Connection refused'));

      const smsData = {
        phone: '13800138000',
        message: '测试短信'
      };

      const response = await testHelper.post('/api/sms/send', smsData, adminUser);
      
      expect(response.status).toBe(502);
      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('EXTERNAL_SERVICE_UNAVAILABLE');

      vi.restoreAllMocks();
    });

    it('should handle external service rate limiting', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      // Mock rate limit response
      vi.spyOn(axios, 'post').mockRejectedValue({
        response: {
          status: 429,
          data: {
            error: 'Rate limit exceeded'
          }
        }
      });

      const emailData = {
        to: 'test@example.com',
        subject: '测试邮件',
        body: '测试内容'
      };

      const response = await testHelper.post('/api/email/send', emailData, adminUser);
      
      expect(response.status).toBe(429);
      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('RATE_LIMIT_EXCEEDED');

      vi.restoreAllMocks();
    });
  });

  describe('File Upload Error Handling', () => {
    it('should handle invalid file types', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      const invalidFile = {
        filename: 'test.exe',
        mimetype: 'application/x-executable',
        size: 1024
      };

      const response = await testHelper.post('/api/upload', { file: invalidFile }, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('INVALID_FILE_TYPE');
    });

    it('should handle file size exceeded errors', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      const largeFile = {
        filename: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 50 * 1024 * 1024 // 50MB
      };

      const response = await testHelper.post('/api/upload', { file: largeFile }, adminUser);
      
      expect(response.status).toBe(413);
      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('FILE_SIZE_EXCEEDED');
    });

    it('should handle corrupted file uploads', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      // Mock file processing error
      vi.spyOn(require('fs'), 'createReadStream').mockImplementation(() => {
        throw new Error('File corrupted');
      });

      const response = await testHelper.post('/api/upload', { file: {} }, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('FILE_CORRUPTED');

      vi.restoreAllMocks();
    });
  });

  describe('Rate Limiting Error Handling', () => {
    it('should handle API rate limiting', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      // Make multiple rapid requests to trigger rate limiting
      const requests = Array(100).fill(0).map(() => 
        testHelper.get('/api/students', adminUser)
      );

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
      rateLimitedResponses.forEach(response => {
        expect(response.body.success).toBe(false);
        expect(response.body.errorCode).toBe('RATE_LIMIT_EXCEEDED');
      });
    });

    it('should provide rate limit headers', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });

      const response = await testHelper.get('/api/students', adminUser);
      
      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
      expect(response.headers).toHaveProperty('x-ratelimit-reset');
    });
  });

  describe('Error Response Format', () => {
    it('should maintain consistent error response format', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });

      const response = await testHelper.get('/api/students/99999', adminUser);
      
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errorCode');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.success).toBe(false);
    });

    it('should include error details for validation errors', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const invalidData = { name: '' }; // Invalid empty name

      const response = await testHelper.post('/api/students', invalidData, adminUser);
      
      expect(response.body).toHaveProperty('details');
      expect(Array.isArray(response.body.details)).toBe(true);
      expect(response.body.details.length).toBeGreaterThan(0);
    });

    it('should include request ID for error tracking', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });

      const response = await testHelper.get('/api/students/99999', adminUser);
      
      expect(response.body).toHaveProperty('requestId');
      expect(typeof response.body.requestId).toBe('string');
    });

    it('should include stack trace in development environment', async () => {
      // Set environment to development
      process.env.NODE_ENV = 'development';
      
      const adminUser = await testDataFactory.createUser({ role: 'admin' });

      const response = await testHelper.get('/api/students/99999', adminUser);
      
      if (process.env.NODE_ENV === 'development') {
        expect(response.body).toHaveProperty('stack');
      }
      
      // Reset environment
      process.env.NODE_ENV = 'test';
    });
  });

  describe('Error Recovery and Logging', () => {
    it('should log errors with appropriate severity levels', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      // Mock logger
      const mockLogger = {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn()
      };
      
      // Replace logger temporarily
      const originalLogger = require('../../src/utils/logger');
      require('../../src/utils/logger') = mockLogger;

      await testHelper.get('/api/students/99999', adminUser);
      
      expect(mockLogger.error).toHaveBeenCalled();
      
      // Restore original logger
      require('../../src/utils/logger') = originalLogger;
    });

    it('should handle error logging failures gracefully', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      // Mock logger that throws error
      const mockLogger = {
        error: vi.fn().mockRejectedValue(new Error('Logger failed'))
      };
      
      const originalLogger = require('../../src/utils/logger');
      require('../../src/utils/logger') = mockLogger;

      const response = await testHelper.get('/api/students/99999', adminUser);
      
      // Should still return proper error response even if logging fails
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      
      require('../../src/utils/logger') = originalLogger;
    });

    it('should include correlation IDs in error logs', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      const mockLogger = {
        error: vi.fn()
      };
      
      const originalLogger = require('../../src/utils/logger');
      require('../../src/utils/logger') = mockLogger;

      await testHelper.get('/api/students/99999', adminUser);
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          correlationId: expect.any(String)
        })
      );
      
      require('../../src/utils/logger') = originalLogger;
    });
  });
});