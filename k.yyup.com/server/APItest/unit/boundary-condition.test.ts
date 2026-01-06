import { describe, it, expect, beforeEach, afterEach } from 'jest';
import request from 'supertest';
import app from '../../src/app';
import { sequelize } from '../../src/config/database';
import { TestDataFactory } from '../utils/test-data-factory';
import { ApiTestHelper } from '../utils/api-test-helper';

describe('API Boundary Condition Tests', () => {
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

  describe('Numeric Boundary Conditions', () => {
    it('should handle maximum integer values', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const maxInt = 2147483647; // 32-bit signed integer max
      
      const classData = {
        name: '测试班级',
        capacity: maxInt,
        room: '测试教室'
      };

      const response = await testHelper.post('/api/classes', classData, adminUser);
      
      expect(response.status).toBe(201);
      expect(response.body.data.capacity).toBe(maxInt);
    });

    it('should handle minimum integer values', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const minInt = -2147483648; // 32-bit signed integer min
      
      const paymentData = {
        studentId: 1,
        amount: minInt,
        paymentMethod: 'cash',
        paymentDate: '2025-09-13'
      };

      const response = await testHelper.post('/api/finance/payments', paymentData, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'amount',
          message: expect.stringContaining('must be positive')
        })
      );
    });

    it('should handle zero values appropriately', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      const classData = {
        name: '测试班级',
        capacity: 0, // Zero capacity
        room: '测试教室'
      };

      const response = await testHelper.post('/api/classes', classData, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'capacity',
          message: expect.stringContaining('must be greater than 0')
        })
      );
    });

    it('should handle floating point precision boundaries', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      const paymentData = {
        studentId: 1,
        amount: 999999999.99, // Maximum monetary value with 2 decimal places
        paymentMethod: 'bank_transfer',
        paymentDate: '2025-09-13'
      };

      const response = await testHelper.post('/api/finance/payments', paymentData, adminUser);
      
      expect(response.status).toBe(201);
      expect(response.body.data.amount).toBe(999999999.99);
    });

    it('should handle very small floating point numbers', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      const paymentData = {
        studentId: 1,
        amount: 0.01, // Minimum monetary value
        paymentMethod: 'cash',
        paymentDate: '2025-09-13'
      };

      const response = await testHelper.post('/api/finance/payments', paymentData, adminUser);
      
      expect(response.status).toBe(201);
      expect(response.body.data.amount).toBe(0.01);
    });
  });

  describe('String Boundary Conditions', () => {
    it('should handle maximum string length limits', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const veryLongName = 'a'.repeat(255); // Maximum varchar(255) length
      
      const studentData = {
        name: veryLongName,
        gender: '男',
        birthDate: '2020-01-01'
      };

      const response = await testHelper.post('/api/students', studentData, adminUser);
      
      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe(veryLongName);
    });

    it('should handle empty strings appropriately', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      const studentData = {
        name: '', // Empty string
        gender: '男',
        birthDate: '2020-01-01'
      };

      const response = await testHelper.post('/api/students', studentData, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'name',
          message: expect.stringContaining('required')
        })
      );
    });

    it('should handle strings with special characters', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const specialChars = '测试姓名@#$%^&*()_+-=[]{}|;:,.<>?';
      
      const studentData = {
        name: specialChars,
        gender: '男',
        birthDate: '2020-01-01'
      };

      const response = await testHelper.post('/api/students', studentData, adminUser);
      
      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe(specialChars);
    });

    it('should handle Unicode and emoji characters', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const unicodeName = '张三🎒📚🏫'; // Name with emojis
      
      const studentData = {
        name: unicodeName,
        gender: '男',
        birthDate: '2020-01-01'
      };

      const response = await testHelper.post('/api/students', studentData, adminUser);
      
      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe(unicodeName);
    });

    it('should handle SQL injection attempts in strings', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const maliciousName = "Robert'); DROP TABLE students; --";
      
      const studentData = {
        name: maliciousName,
        gender: '男',
        birthDate: '2020-01-01'
      };

      const response = await testHelper.post('/api/students', studentData, adminUser);
      
      // Should either reject the input or safely store it as literal string
      expect([201, 400]).toContain(response.status);
      if (response.status === 201) {
        expect(response.body.data.name).toBe(maliciousName);
      }
    });
  });

  describe('Date and Time Boundary Conditions', () => {
    it('should handle minimum date values', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const minDate = '1900-01-01'; // Reasonable minimum date
      
      const studentData = {
        name: '测试学生',
        gender: '男',
        birthDate: minDate
      };

      const response = await testHelper.post('/api/students', studentData, adminUser);
      
      expect(response.status).toBe(201);
      expect(response.body.data.birthDate).toBe(minDate);
    });

    it('should handle maximum date values', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const maxDate = '2100-12-31'; // Reasonable maximum date
      
      const studentData = {
        name: '测试学生',
        gender: '男',
        birthDate: maxDate
      };

      const response = await testHelper.post('/api/students', studentData, adminUser);
      
      expect(response.status).toBe(201);
      expect(response.body.data.birthDate).toBe(maxDate);
    });

    it('should handle invalid date formats', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const invalidDates = [
        '2025-13-01', // Invalid month
        '2025-02-30', // Invalid day for February
        '2025/02/01', // Wrong format
        '01-02-2025', // Wrong format
        'invalid-date',
        '2025-02-01T25:00:00Z' // Invalid time
      ];

      for (const invalidDate of invalidDates) {
        const studentData = {
          name: '测试学生',
          gender: '男',
          birthDate: invalidDate
        };

        const response = await testHelper.post('/api/students', studentData, adminUser);
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      }
    });

    it('should handle future dates appropriately', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const futureDate = '2030-01-01'; // Future birth date
      
      const studentData = {
        name: '测试学生',
        gender: '男',
        birthDate: futureDate
      };

      const response = await testHelper.post('/api/students', studentData, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'birthDate',
          message: expect.stringContaining('future')
        })
      );
    });

    it('should handle timestamp precision boundaries', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const preciseTimestamp = '2025-09-13T10:30:45.123Z';
      
      const attendanceData = {
        studentId: 1,
        checkInTime: preciseTimestamp,
        method: 'manual'
      };

      const response = await testHelper.post('/api/attendance/check-in', attendanceData, adminUser);
      
      expect(response.status).toBe(201);
      // The timestamp might be stored with different precision, but should be valid
      expect(response.body.data.checkInTime).toBeDefined();
    });
  });

  describe('Array and Collection Boundary Conditions', () => {
    it('should handle empty arrays', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const classObj = await testDataFactory.createClass();
      
      const assignmentData = {
        studentIds: [] // Empty array
      };

      const response = await testHelper.post(`/api/classes/${classObj.id}/students`, assignmentData, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.data.assignedStudents).toBe(0);
    });

    it('should handle maximum array size limits', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const classObj = await testDataFactory.createClass({ capacity: 1000 });
      
      // Create many students
      const students = Array(500).fill(0).map((_, i) => 
        testDataFactory.createStudent({ name: `学生${i + 1}` })
      );
      await Promise.all(students);
      
      const studentIds = (await Promise.all(students)).map(s => s.id);
      const assignmentData = { studentIds };

      const response = await testHelper.post(`/api/classes/${classObj.id}/students`, assignmentData, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.data.assignedStudents).toBe(500);
    });

    it('should handle arrays with duplicate values', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const classObj = await testDataFactory.createClass();
      const student = await testDataFactory.createStudent();
      
      const assignmentData = {
        studentIds: [student.id, student.id, student.id] // Duplicate IDs
      };

      const response = await testHelper.post(`/api/classes/${classObj.id}/students`, assignmentData, adminUser);
      
      expect(response.status).toBe(200);
      // Should handle duplicates gracefully (either deduplicate or return error)
      expect([1, 3]).toContain(response.body.data.assignedStudents);
    });

    it('should handle arrays with invalid values', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const classObj = await testDataFactory.createClass();
      
      const assignmentData = {
        studentIds: [1, 'invalid', null, undefined, {}] // Mixed invalid types
      };

      const response = await testHelper.post(`/api/classes/${classObj.id}/students`, assignmentData, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Pagination Boundary Conditions', () => {
    it('should handle zero page number', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });

      const response = await testHelper.get('/api/students?page=0&limit=10', adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'page',
          message: expect.stringContaining('must be greater than 0')
        })
      );
    });

    it('should handle very large page numbers', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const largePage = 999999;
      
      const response = await testHelper.get(`/api/students?page=${largePage}&limit=10`, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(0); // No data on very high page
      expect(response.body.pagination.page).toBe(largePage);
    });

    it('should handle zero limit values', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });

      const response = await testHelper.get('/api/students?page=1&limit=0', adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'limit',
          message: expect.stringContaining('must be greater than 0')
        })
      );
    });

    it('should handle maximum limit values', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const maxLimit = 1000; // Assuming 1000 is the maximum allowed
      
      const response = await testHelper.get(`/api/students?page=1&limit=${maxLimit}`, adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.pagination.limit).toBeLessThanOrEqual(maxLimit);
    });

    it('should handle pagination with total count boundaries', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      // Create exactly 10 students
      const students = Array(10).fill(0).map((_, i) => 
        testDataFactory.createStudent({ name: `学生${i + 1}` })
      );
      await Promise.all(students);

      const response = await testHelper.get('/api/students?page=1&limit=10', adminUser);
      
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(10);
      expect(response.body.pagination.total).toBe(10);
      expect(response.body.pagination.totalPages).toBe(1);
    });
  });

  describe('File Upload Boundary Conditions', () => {
    it('should handle zero-byte files', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      const emptyFile = {
        filename: 'empty.txt',
        mimetype: 'text/plain',
        size: 0
      };

      const response = await testHelper.post('/api/upload', { file: emptyFile }, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('EMPTY_FILE');
    });

    it('should handle maximum file size boundaries', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      const maxSizeFile = {
        filename: 'large.jpg',
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024 // 10MB (assuming this is the limit)
      };

      const response = await testHelper.post('/api/upload', { file: maxSizeFile }, adminUser);
      
      expect([201, 413]).toContain(response.status); // Either accepts or rejects
    });

    it('should handle files with very long names', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const longFilename = 'a'.repeat(255) + '.jpg';
      
      const file = {
        filename: longFilename,
        mimetype: 'image/jpeg',
        size: 1024
      };

      const response = await testHelper.post('/api/upload', { file: file }, adminUser);
      
      expect([201, 400]).toContain(response.status);
    });

    it('should handle files with no extension', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      const file = {
        filename: 'noextension',
        mimetype: 'application/octet-stream',
        size: 1024
      };

      const response = await testHelper.post('/api/upload', { file: file }, adminUser);
      
      expect([201, 400]).toContain(response.status);
    });
  });

  describe('Database Constraint Boundaries', () => {
    it('should handle unique constraint violations', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      // Create first user
      await testDataFactory.createUser({ username: 'testuser', email: 'test@example.com' });

      // Try to create user with same username
      const duplicateUser = {
        username: 'testuser', // Duplicate username
        email: 'different@example.com',
        password: 'password123',
        role: 'teacher'
      };

      const response = await testHelper.post('/api/users', duplicateUser, adminUser);
      
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('DUPLICATE_ENTRY');
    });

    it('should handle foreign key constraint with non-existent references', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      const paymentData = {
        studentId: 99999, // Non-existent student
        amount: 1000,
        paymentMethod: 'cash',
        paymentDate: '2025-09-13'
      };

      const response = await testHelper.post('/api/finance/payments', paymentData, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('FOREIGN_KEY_CONSTRAINT');
    });

    it('should handle circular reference prevention', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      // Try to create a self-referencing record that would cause circular reference
      const invalidData = {
        name: '测试',
        parentId: 1, // Assuming this would reference itself
        type: 'category'
      };

      const response = await testHelper.post('/api/categories', invalidData, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Request Payload Boundary Conditions', () => {
    it('should handle very large JSON payloads', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      // Create a large payload
      const largeArray = Array(10000).fill(0).map((_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        description: 'x'.repeat(100) // 100 character description
      }));

      const response = await testHelper.post('/api/batch-process', { items: largeArray }, adminUser);
      
      expect([200, 413]).toContain(response.status); // Either processes or rejects due to size
    });

    it('should handle deeply nested JSON structures', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      // Create deeply nested structure
      const deepNested = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  data: 'deep value'
                }
              }
            }
          }
        }
      };

      const response = await testHelper.post('/api/nested-data', deepNested, adminUser);
      
      expect([200, 400]).toContain(response.status);
    });

    it('should handle payloads with all null values', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      const nullPayload = {
        name: null,
        age: null,
        email: null,
        phone: null
      };

      const response = await testHelper.post('/api/students', nullPayload, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle payloads with undefined values', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      const undefinedPayload = {
        name: undefined,
        gender: '男',
        birthDate: '2020-01-01'
      };

      const response = await testHelper.post('/api/students', undefinedPayload, adminUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Memory and Processing Boundaries', () => {
    it('should handle memory-intensive operations', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      // Create many records to test memory handling
      const students = Array(1000).fill(0).map((_, i) => 
        testDataFactory.createStudent({ name: `学生${i + 1}` })
      );
      await Promise.all(students);

      const startTime = Date.now();
      const response = await testHelper.get('/api/students?limit=1000', adminUser);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should handle CPU-intensive operations', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      const complexQuery = {
        filters: {
          complexLogic: true,
          multipleConditions: true,
          nestedQueries: true
        },
        aggregations: ['sum', 'avg', 'count', 'max', 'min'],
        groupBy: ['category', 'subcategory', 'type']
      };

      const startTime = Date.now();
      const response = await testHelper.post('/api/complex-report', complexQuery, adminUser);
      const endTime = Date.now();

      expect([200, 400]).toContain(response.status);
      expect(endTime - startTime).toBeLessThan(30000); // Should complete within 30 seconds
    });
  });

  describe 'Concurrent Request Boundaries', () => {
    it('should handle concurrent requests to the same resource', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      const student = await testDataFactory.createStudent({ name: '原姓名' });
      
      // Make concurrent update requests
      const update1 = testHelper.put(`/api/students/${student.id}`, { name: '新姓名1' }, adminUser);
      const update2 = testHelper.put(`/api/students/${student.id}`, { name: '新姓名2' }, adminUser);
      const update3 = testHelper.put(`/api/students/${student.id}`, { name: '新姓名3' }, adminUser);

      const responses = await Promise.all([update1, update2, update3]);
      
      // One should succeed, others might fail with conflict or overwrite
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThan(0);
    });

    it('should handle rapid sequential requests', async () => {
      const adminUser = await testDataFactory.createUser({ role: 'admin' });
      
      // Make rapid sequential requests
      const requests = Array(100).fill(0).map((_, i) => 
        testHelper.get('/api/students', adminUser)
      );

      const responses = await Promise.all(requests);
      
      // All should succeed without errors
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });
});