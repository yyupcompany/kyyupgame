/**
 * 学生控制器单元测试
 * 严格验证版本
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import app from '../../src/app';
import { 
  validateApiResponse,
  validatePaginatedResponse,
  validateStudentData,
  validateErrorResponse,
  validateHttpStatusCode,
  validateResponseTime,
  createApiValidationReport
} from '../utils/api-validation';
import { sequelize } from '../../src/models';

// 控制台错误检测变量
let consoleSpy: any

describe('Student Controller - Strict Validation', () => {
  let authToken: string;
  let studentId: string;
  let classId: string;
  let parentId: string;
  let responseStartTime: number;

  beforeAll(async () => {
    // 设置测试数据库
    await sequelize.sync({ force: true });
    
    // 创建测试管理员用户
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });

    if (adminResponse.status === 200 && adminResponse.body.success) {
      authToken = adminResponse.body.data.token;
    }

    // 创建测试班级
    const classResponse = await request(app)
      .post('/api/classes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: '测试班级',
        grade: '大班',
        capacity: 25,
        classroom: 'A101'
      });

    if (classResponse.status === 201) {
      classId = classResponse.body.data.id;
    }

    // 创建测试家长
    const parentResponse = await request(app)
      .post('/api/parents')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: '测试家长',
        phone: '13800138001',
        email: 'parent@example.com',
        address: '测试地址'
      });

    if (parentResponse.status === 201) {
      parentId = parentResponse.body.data.id;
    }
  });

  afterAll(async () => {
    // 清理测试数据
    await sequelize.close();
  });

  beforeEach(() => {
    responseStartTime = Date.now();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    // 验证响应时间
    const responseTime = Date.now() - responseStartTime;
    const timeValidation = validateResponseTime(responseTime, 5000); // 5秒内
    
    if (!timeValidation.valid) => {
      console.warn('Response time warning:', timeValidation.errors);
    }
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('POST /api/students - Create Student', () => {
    const validStudentData = {
      name: '测试学生',
      birthDate: '2018-01-15',
      gender: 'MALE',
      classId: classId,
      parentId: parentId,
      parentName: '测试家长',
      parentPhone: '13800138001',
      parentEmail: 'parent@example.com',
      address: '测试地址',
      emergencyContact: '紧急联系人',
      emergencyPhone: '13800138002'
    };

    it('should create student with valid data and strict validation', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validStudentData);

      const responseTime = Date.now() - responseStartTime;

      // 1. 验证HTTP状态码
      const statusValidation = validateHttpStatusCode(response.status, [201, 200]);
      expect(statusValidation.valid).toBe(true);

      // 2. 验证响应时间
      const timeValidation = validateResponseTime(responseTime, 3000);
      expect(timeValidation.valid).toBe(true);

      // 3. 验证API响应结构
      const apiValidation = createApiValidationReport(response.body, validateApiResponse);
      expect(apiValidation.valid).toBe(true);
      if (!apiValidation.valid) {
        console.error('API validation errors:', apiValidation.errors);
      }

      // 4. 验证业务逻辑
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

      // 5. 验证返回的学生数据结构
      if (response.body.data) {
        const studentValidation = createApiValidationReport(
          response.body.data, 
          validateStudentData
        );
        expect(studentValidation.valid).toBe(true);
        
        // 保存学生ID用于后续测试
        studentId = response.body.data.id;
      }

      // 6. 验证必填字段存在
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('studentId');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('birthDate');
      expect(response.body.data).toHaveProperty('gender');
      expect(response.body.data).toHaveProperty('classId');
      expect(response.body.data).toHaveProperty('parentId');

      // 7. 验证字段类型正确
      expect(typeof response.body.data.id).toBe('string');
      expect(typeof response.body.data.studentId).toBe('string');
      expect(typeof response.body.data.name).toBe('string');
      expect(typeof response.body.data.birthDate).toBe('string');
      expect(typeof response.body.data.gender).toBe('string');
      expect(typeof response.body.data.age).toBe('number');

      // 8. 验证枚举值有效性
      const validGenders = ['MALE', 'FEMALE', 'OTHER'];
      expect(validGenders).toContain(response.body.data.gender);

      const validStatuses = ['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED'];
      expect(validStatuses).toContain(response.body.data.status);

      // 9. 验证生成的学号格式
      expect(/^ST\d{4,6}$/.test(response.body.data.studentId)).toBe(true);

      // 10. 验证日期格式
      expect(/^\d{4}-\d{2}-\d{2}$/.test(response.body.data.birthDate)).toBe(true);

      // 11. 验证年龄计算正确性
      const birthDate = new Date(response.body.data.birthDate);
      const currentYear = new Date().getFullYear();
      const expectedAge = currentYear - birthDate.getFullYear();
      expect(Math.abs(response.body.data.age - expectedAge)).toBeLessThanOrEqual(1);
    });

    it('should reject creation with missing required fields', async () => {
      const invalidStudentData = { ...validStudentData };
      delete invalidStudentData.name;

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidStudentData);

      // 验证错误状态码
      const statusValidation = validateHttpStatusCode(response.status, [400, 422]);
      expect(statusValidation.valid).toBe(true);

      // 验证错误响应结构
      const errorValidation = createApiValidationReport(response.body, validateErrorResponse);
      expect(errorValidation.valid).toBe(true);

      // 验证错误消息
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('name');
    });

    it('should reject creation with invalid birth date format', async () => {
      const invalidStudentData = { 
        ...validStudentData, 
        birthDate: 'invalid-date-format' 
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidStudentData);

      const statusValidation = validateHttpStatusCode(response.status, [400, 422]);
      expect(statusValidation.valid).toBe(true);

      const errorValidation = createApiValidationReport(response.body, validateErrorResponse);
      expect(errorValidation.valid).toBe(true);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('birthDate');
    });

    it('should reject creation with invalid gender', async () => {
      const invalidStudentData = { 
        ...validStudentData, 
        gender: 'INVALID_GENDER' 
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidStudentData);

      const statusValidation = validateHttpStatusCode(response.status, [400, 422]);
      expect(statusValidation.valid).toBe(true);

      const errorValidation = createApiValidationReport(response.body, validateErrorResponse);
      expect(errorValidation.valid).toBe(true);

      expect(response.body.success).toBe(false);
    });

    it('should reject creation with invalid parent phone format', async () => {
      const invalidStudentData = { 
        ...validStudentData, 
        parentPhone: 'invalid-phone' 
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidStudentData);

      const statusValidation = validateHttpStatusCode(response.status, [400, 422]);
      expect(statusValidation.valid).toBe(true);

      const errorValidation = createApiValidationReport(response.body, validateErrorResponse);
      expect(errorValidation.valid).toBe(true);

      expect(response.body.success).toBe(false);
    });

    it('should reject creation with future birth date', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const invalidStudentData = { 
        ...validStudentData, 
        birthDate: futureDate.toISOString().split('T')[0] 
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidStudentData);

      const statusValidation = validateHttpStatusCode(response.status, [400, 422]);
      expect(statusValidation.valid).toBe(true);

      const errorValidation = createApiValidationReport(response.body, validateErrorResponse);
      expect(errorValidation.valid).toBe(true);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('birthDate');
    });

    it('should reject creation with non-existent class', async () => {
      const invalidStudentData = { 
        ...validStudentData, 
        classId: 'non-existent-class-id' 
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidStudentData);

      const statusValidation = validateHttpStatusCode(response.status, [400, 404]);
      expect(statusValidation.valid).toBe(true);

      const errorValidation = createApiValidationReport(response.body, validateErrorResponse);
      expect(errorValidation.valid).toBe(true);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/students - List Students', () => {
    beforeAll(async () => {
      // 创建更多测试学生
      const testStudents = [
        {
          name: '学生1',
          birthDate: '2018-03-20',
          gender: 'FEMALE',
          classId: classId,
          parentId: parentId,
          parentName: '家长1',
          parentPhone: '13800138003',
          parentEmail: 'parent1@example.com'
        },
        {
          name: '学生2',
          birthDate: '2018-06-15',
          gender: 'MALE',
          classId: classId,
          parentId: parentId,
          parentName: '家长2',
          parentPhone: '13800138004',
          parentEmail: 'parent2@example.com'
        }
      ];

      for (const student of testStudents) {
        await request(app)
          .post('/api/students')
          .set('Authorization', `Bearer ${authToken}`)
          .send(student);
      }
    });

    it('should return paginated student list with strict validation', async () => {
      const queryParams = {
        page: 1,
        pageSize: 10,
        classId: classId,
        gender: 'MALE',
        status: 'ACTIVE'
      };

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .query(queryParams);

      const responseTime = Date.now() - responseStartTime;

      // 验证状态码
      const statusValidation = validateHttpStatusCode(response.status, [200]);
      expect(statusValidation.valid).toBe(true);

      // 验证响应时间
      const timeValidation = validateResponseTime(responseTime, 2000);
      expect(timeValidation.valid).toBe(true);

      // 验证分页响应结构
      const paginationValidation = createApiValidationReport(
        response.body,
        validatePaginatedResponse
      );
      expect(paginationValidation.valid).toBe(true);
      if (!paginationValidation.valid) {
        console.error('Pagination validation errors:', paginationValidation.errors);
      }

      // 验证分页字段
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toBeDefined();
      expect(response.body.data.total).toBeDefined();
      expect(response.body.data.page).toBeDefined();
      expect(response.body.data.pageSize).toBeDefined();

      // 验证分页字段类型
      expect(Array.isArray(response.body.data.items)).toBe(true);
      expect(typeof response.body.data.total).toBe('number');
      expect(typeof response.body.data.page).toBe('number');
      expect(typeof response.body.data.pageSize).toBe('number');

      // 验证分页逻辑
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.pageSize).toBe(10);
      expect(response.body.data.total).toBeGreaterThanOrEqual(0);

      // 验证列表项数据结构
      if (response.body.data.items.length > 0) {
        response.body.data.items.forEach((student: any, index: number) => {
          const studentValidation = validateStudentData(student);
          expect(studentValidation.valid).toBe(true);
          
          if (!studentValidation.valid) {
            console.error(`Student item ${index} validation errors:`, studentValidation.errors);
          }
        });
      }

      // 验证筛选结果
      const filteredStudents = response.body.data.items;
      filteredStudents.forEach((student: any) => {
        expect(student.classId).toBe(classId);
        expect(student.gender).toBe('MALE');
        expect(student.status).toBe('ACTIVE');
      });
    });

    it('should handle pagination parameters correctly', async () => {
      const queryParams = { page: 2, pageSize: 5 };

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .query(queryParams);

      const paginationValidation = createApiValidationReport(
        response.body,
        validatePaginatedResponse
      );
      expect(paginationValidation.valid).toBe(true);

      expect(response.body.data.page).toBe(2);
      expect(response.body.data.pageSize).toBe(5);
      expect(response.body.data.items.length).toBeLessThanOrEqual(5);
    });

    it('should handle search functionality', async () => {
      const queryParams = { search: '学生' };

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .query(queryParams);

      const paginationValidation = createApiValidationReport(
        response.body,
        validatePaginatedResponse
      );
      expect(paginationValidation.valid).toBe(true);

      // 验证搜索结果
      if (response.body.data.items.length > 0) {
        const searchResults = response.body.data.items;
        searchResults.forEach((student: any) => {
          const searchTerm = '学生';
          const matchesSearch = 
            student.name.toLowerCase().includes(searchTerm) ||
            student.studentId.toLowerCase().includes(searchTerm);
          
          expect(matchesSearch).toBe(true);
        });
      }
    });

    it('should handle age range filtering', async () => {
      const queryParams = { minAge: 4, maxAge: 6 };

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .query(queryParams);

      const paginationValidation = createApiValidationReport(
        response.body,
        validatePaginatedResponse
      );
      expect(paginationValidation.valid).toBe(true);

      // 验证年龄筛选结果
      if (response.body.data.items.length > 0) {
        const filteredStudents = response.body.data.items;
        filteredStudents.forEach((student: any) => {
          expect(student.age).toBeGreaterThanOrEqual(4);
          expect(student.age).toBeLessThanOrEqual(6);
        });
      }
    });
  });

  describe('GET /api/students/:id - Get Student Details', () => {
    it('should return student details with strict validation', async () => {
      if (!studentId) {
        // 如果没有学生ID，先创建一个
        const createResponse = await request(app)
          .post('/api/students')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: '详情测试',
            birthDate: '2018-04-10',
            gender: 'FEMALE',
            classId: classId,
            parentId: parentId,
            parentName: '详情家长',
            parentPhone: '13800138005'
          });
        
        studentId = createResponse.body.data.id;
      }

      const response = await request(app)
        .get(`/api/students/${studentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const responseTime = Date.now() - responseStartTime;

      // 验证状态码
      const statusValidation = validateHttpStatusCode(response.status, [200]);
      expect(statusValidation.valid).toBe(true);

      // 验证响应时间
      const timeValidation = validateResponseTime(responseTime, 1000);
      expect(timeValidation.valid).toBe(true);

      // 验证API响应结构
      const apiValidation = createApiValidationReport(response.body, validateApiResponse);
      expect(apiValidation.valid).toBe(true);

      // 验证学生数据结构
      const studentValidation = createApiValidationReport(
        response.body.data,
        validateStudentData
      );
      expect(studentValidation.valid).toBe(true);
      if (!studentValidation.valid) {
        console.error('Student detail validation errors:', studentValidation.errors);
      }

      // 验证具体字段
      expect(response.body.data.id).toBe(studentId);
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');

      // 验证关联数据
      expect(response.body.data).toHaveProperty('className');
      expect(response.body.data).toHaveProperty('parentName');
      expect(response.body.data).toHaveProperty('classroom');
    });

    it('should return 404 for non-existent student', async () => {
      const response = await request(app)
        .get('/api/students/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      const statusValidation = validateHttpStatusCode(response.status, [404]);
      expect(statusValidation.valid).toBe(true);

      const errorValidation = createApiValidationReport(response.body, validateErrorResponse);
      expect(errorValidation.valid).toBe(true);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/students/:id - Update Student', () => {
    it('should update student with valid data and strict validation', async () => {
      if (!studentId) {
        throw new Error('Student ID not available for update test');
      }

      const updateData = {
        name: '更新后的学生名',
        parentPhone: '13800138006',
        parentEmail: 'updated@example.com',
        address: '更新后的地址',
        emergencyContact: '更新紧急联系人',
        emergencyPhone: '13800138007'
      };

      const response = await request(app)
        .put(`/api/students/${studentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      const responseTime = Date.now() - responseStartTime;

      // 验证状态码
      const statusValidation = validateHttpStatusCode(response.status, [200]);
      expect(statusValidation.valid).toBe(true);

      // 验证响应时间
      const timeValidation = validateResponseTime(responseTime, 2000);
      expect(timeValidation.valid).toBe(true);

      // 验证API响应结构
      const apiValidation = createApiValidationReport(response.body, validateApiResponse);
      expect(apiValidation.valid).toBe(true);

      // 验证更新后的学生数据
      const studentValidation = createApiValidationReport(
        response.body.data,
        validateStudentData
      );
      expect(studentValidation.valid).toBe(true);

      // 验证字段更新
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.parentPhone).toBe(updateData.parentPhone);
      expect(response.body.data.parentEmail).toBe(updateData.parentEmail);
      expect(response.body.data.address).toBe(updateData.address);
      expect(response.body.data.emergencyContact).toBe(updateData.emergencyContact);
      expect(response.body.data.emergencyPhone).toBe(updateData.emergencyPhone);

      // 验证更新时间戳
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it('should reject update with invalid phone format', async () => {
      if (!studentId) return;

      const updateData = {
        parentPhone: 'invalid-phone-format'
      };

      const response = await request(app)
        .put(`/api/students/${studentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      const statusValidation = validateHttpStatusCode(response.status, [400, 422]);
      expect(statusValidation.valid).toBe(true);

      const errorValidation = createApiValidationReport(response.body, validateErrorResponse);
      expect(errorValidation.valid).toBe(true);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('phone');
    });

    it('should reject update with invalid email format', async () => {
      if (!studentId) return;

      const updateData = {
        parentEmail: 'invalid-email-format'
      };

      const response = await request(app)
        .put(`/api/students/${studentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      const statusValidation = validateHttpStatusCode(response.status, [400, 422]);
      expect(statusValidation.valid).toBe(true);

      const errorValidation = createApiValidationReport(response.body, validateErrorResponse);
      expect(errorValidation.valid).toBe(true);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/students/:id - Delete Student', () => {
    let testStudentId: string;

    beforeAll(async () => {
      // 创建测试学生用于删除
      const createResponse = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '删除测试',
          birthDate: '2018-07-20',
          gender: 'MALE',
          classId: classId,
          parentId: parentId,
          parentName: '删除测试家长',
          parentPhone: '13800138008'
        });

      testStudentId = createResponse.body.data.id;
    });

    it('should delete student successfully with strict validation', async () => {
      const response = await request(app)
        .delete(`/api/students/${testStudentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const responseTime = Date.now() - responseStartTime;

      // 验证状态码
      const statusValidation = validateHttpStatusCode(response.status, [200, 204]);
      expect(statusValidation.valid).toBe(true);

      // 验证响应时间
      const timeValidation = validateResponseTime(responseTime, 2000);
      expect(timeValidation.valid).toBe(true);

      // 验证响应结构
      if (response.status === 200) {
        const apiValidation = createApiValidationReport(response.body, validateApiResponse);
        expect(apiValidation.valid).toBe(true);
        expect(response.body.success).toBe(true);
      }

      // 验证学生确实被删除
      const verifyResponse = await request(app)
        .get(`/api/students/${testStudentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const verifyStatusValidation = validateHttpStatusCode(verifyResponse.status, [404]);
      expect(verifyStatusValidation.valid).toBe(true);
    });

    it('should return 404 when deleting non-existent student', async () => {
      const response = await request(app)
        .delete('/api/students/non-existent-student-id')
        .set('Authorization', `Bearer ${authToken}`);

      const statusValidation = validateHttpStatusCode(response.status, [404]);
      expect(statusValidation.valid).toBe(true);

      const errorValidation = createApiValidationReport(response.body, validateErrorResponse);
      expect(errorValidation.valid).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10;
      const requests = Array.from({ length: concurrentRequests }, () =>
        request(app)
          .get('/api/students')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ page: 1, pageSize: 10 })
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;
      const averageTime = totalTime / concurrentRequests;

      // 验证所有请求都成功
      responses.forEach(response => {
        const statusValidation = validateHttpStatusCode(response.status, [200]);
        expect(statusValidation.valid).toBe(true);
        
        const paginationValidation = createApiValidationReport(
          response.body,
          validatePaginatedResponse
        );
        expect(paginationValidation.valid).toBe(true);
      });

      // 验证平均响应时间
      expect(averageTime).toBeLessThan(3000); // 平均3秒内
      expect(totalTime).toBeLessThan(10000); // 总时间10秒内
    });
  });

  describe('Data Integrity Tests', () => {
    it('should maintain data consistency across operations', async () => {
      // 创建学生
      const createResponse = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '一致性测试',
          birthDate: '2018-08-15',
          gender: 'FEMALE',
          classId: classId,
          parentId: parentId,
          parentName: '一致性家长',
          parentPhone: '13800138009'
        });

      expect(createResponse.status).toBe(201);
      const studentId = createResponse.body.data.id;

      // 获取学生详情
      const getResponse = await request(app)
        .get(`/api/students/${studentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      
      // 验证数据一致性
      expect(getResponse.body.data.name).toBe('一致性测试');
      expect(getResponse.body.data.birthDate).toBe('2018-08-15');
      expect(getResponse.body.data.gender).toBe('FEMALE');
      expect(getResponse.body.data.classId).toBe(classId);
      expect(getResponse.body.data.parentId).toBe(parentId);

      // 更新学生
      const updateResponse = await request(app)
        .put(`/api/students/${studentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '更新一致性测试' });

      expect(updateResponse.status).toBe(200);

      // 再次获取详情验证更新
      const updatedGetResponse = await request(app)
        .get(`/api/students/${studentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(updatedGetResponse.status).toBe(200);
      expect(updatedGetResponse.body.data.name).toBe('更新一致性测试');
      expect(updatedGetResponse.body.data.birthDate).toBe('2018-08-15'); // 未更改字段应保持不变
    });
  });
});